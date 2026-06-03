import SuMissionEventCard from "../components/SuMissionEventCard";
import PageHeader from "../components/PageHeader";
import BackButton from "../components/BackButton";
import CardCreateModal from "../components/CardCreateModal";
import React, { useState, useMemo, useEffect, useRef } from "react";
import QRCode from 'qrcode';
import * as scheduleService from "../lib/scheduleService";
import * as supplyService from "../lib/supplyService";
import * as storageAdapter from "../lib/storageAdapter";
import { getMyShops } from "../lib/storageAdapter";
import { apiPost } from "../lib/apiClient";
import { useNavigate, useLocation } from "react-router-dom";
import { isLoggedIn, getSession, getAuthInfo, getCurrentUser, hydrateAuthFromServer, isAuthReady } from "../lib/authStore";
import { canAccessRegionalConsole } from "../lib/permissions";
import * as chatService from "../lib/chatService";
import { filterMembersByExactSearchQuery, normalizeExactName, memberDisplayName } from "../lib/memberSearchUtils";
import { isPointsTransferEnabled } from "../lib/pointsGuard";
import { calculateStatus } from "../lib/adminStore";
import * as shopStore from "../lib/shopStore";
import { getShops, loadShops } from "../lib/shopStore";
import Toast from "../components/Toast";
import SiteConfirmModal from "../components/SiteConfirmModal";

// ★ 포인트 타입 라벨 (서버 기반)
const POINT_TYPE_LABELS = {
  // DB 실제 저장 타입
  MISSION:       { label: '미션', bg: 'rgba(200,168,75,0.12)', color: '#92650A' },
  PARTICIPATION: { label: '미션 선정', bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  PAYMENT:       { label: '결제', bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
  ADMIN:         { label: '관리자', bg: 'rgba(168,85,247,0.15)', color: '#a855f7' },
  CANCEL:        { label: '취소', bg: 'rgba(107,114,128,0.15)', color: '#6b7280' },
  // 미래 확장용 (미사용)
  PURCHASE:      { label: '구매', bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  REFUND:        { label: '환불', bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
  REWARD:        { label: '보상', bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  TRANSFER_IN:   { label: '받기', bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
  TRANSFER_OUT:  { label: '보내기', bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
};

const DISTRIBUTION_TYPE_KEYS = new Set([
  'food',
  'daily',
  'health',
  'digital',
  'appliance',
  'fashion',
  'local-special',
  'group-buy',
]);

const DISTRIBUTION_STATUS_LABELS = {
  available: '판매중',
  active: '판매중',
  soldout: '품절',
  hidden: '숨김',
  pending: '대기',
};

// ★ 헬퍼 함수: 회원 ID 통일
const getMemberId = (member) => {
  if (!member) return null;
  return member.id ?? member.userId ?? member.memberId ?? null;
};

function checkIsAdmin() {
  try {
    const u = (typeof getAuthInfo === 'function') ? getAuthInfo() : null;
    const role = String(u?.role || '').toLowerCase();
    return role === 'admin';
  } catch (e) {
    return false;
  }
}

function formatNumber(n) {
  try {
    return Number(n).toLocaleString();
  } catch (e) {
    return String(n);
  }
}

function statusLabel(status) {
  try {
    const s = String(status || '').toUpperCase();
    if (s === 'PENDING') return '지급신청중';
    if (s === 'PAID') return '지급완료';
    if (s === 'REJECTED') return '반려';
    return status || '';
  } catch (e) { return status || ''; }
}

function normalizeSdMark(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

const SD_MARK_STORAGE_KEY = 'su_member_sd_marks_v1';

function readSdMarkCache(memberId) {
  try {
    const parsed = JSON.parse(localStorage.getItem(SD_MARK_STORAGE_KEY) || '{}');
    const value = parsed?.[String(memberId || '')];
    return normalizeSdMark(value);
  } catch (error) {
    return null;
  }
}

// 상품권 내역 description 가공 — 내부 key 패턴을 사람이 읽을 수 있는 텍스트로 변환
function formatVoucherDesc(description, source) {
  const raw = description || source || '';
  // 미션 보상: "미션 선정 보상 상품권: mission:MISSION_xxx"
  if (/mission:/i.test(raw)) return '미션 선정 보상';
  // 기타 내부 key 패턴 (콜론 + 영문+숫자+언더스코어)
  if (/:[A-Z0-9_]{6,}/i.test(raw)) {
    return raw.replace(/:[A-Z0-9_]{6,}/gi, '').replace(/:$/, '').trim() || '상품권 지급';
  }
  return raw || '상품권 지급';
}

const VIP_VOUCHER_TITLE = '지역공유발전플랫폼 VIP 상품권';
const VIP_META_MARKER = '__VIPMETA__';

function formatVoucherAmount(value) {
  const amount = Number(value) || 0;
  return `${amount.toLocaleString('ko-KR')}원`;
}

function formatVoucherDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
}

function formatVoucherSerial(referenceId, createdAt, fallbackId) {
  const raw = String(referenceId || '').trim();
  if (raw) return raw;
  const date = createdAt ? new Date(createdAt) : new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `VIP-${year}${month}${day}-${String(fallbackId || 0).padStart(6, '0')}`;
}

function parseVoucherMeta(description, source) {
  const raw = String(description || '').trim();
  const markerIndex = raw.indexOf(VIP_META_MARKER);
  let visibleText = raw;
  let payload = {};

  if (markerIndex >= 0) {
    visibleText = raw.slice(0, markerIndex).trim();
    const metaRaw = raw.slice(markerIndex + VIP_META_MARKER.length).trim();
    try {
      payload = JSON.parse(metaRaw || '{}') || {};
    } catch (error) {
      payload = {};
    }
  }

  const issueRegion = String(payload?.issueRegion || '').trim();

  const cleanedText = formatVoucherDesc(visibleText, source)
    .replace(VIP_META_MARKER, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (cleanedText) {
    return {
      reason: cleanedText,
      issueRegion,
      transferKind: String(payload?.transferKind || '').trim(),
      fromMemberId: String(payload?.fromMemberId || '').trim(),
      fromMemberName: String(payload?.fromMemberName || '').trim(),
      toMemberId: String(payload?.toMemberId || '').trim(),
      toMemberName: String(payload?.toMemberName || '').trim(),
      shopId: String(payload?.shopId || '').trim(),
      shopName: String(payload?.shopName || '').trim(),
    };
  }

  const normalizedSource = String(source || '').trim().toUpperCase();
  if (normalizedSource === 'SHOP_USE') return { reason: 'VIP 상품권 사용', issueRegion };
  if (normalizedSource.includes('ADMIN')) return { reason: '관리자 지급', issueRegion };
  return { reason: 'VIP 상품권 지급', issueRegion };
}

function buildVoucherMetaDescription(reason, meta = {}) {
  const cleanReason = String(reason || '').trim();
  const payload = {
    issueRegion: meta.issueRegion ? String(meta.issueRegion).trim() : null,
    transferKind: meta.transferKind ? String(meta.transferKind).trim() : null,
    fromMemberId: meta.fromMemberId ? String(meta.fromMemberId).trim() : null,
    fromMemberName: meta.fromMemberName ? String(meta.fromMemberName).trim() : null,
    toMemberId: meta.toMemberId ? String(meta.toMemberId).trim() : null,
    toMemberName: meta.toMemberName ? String(meta.toMemberName).trim() : null,
    shopId: meta.shopId ? String(meta.shopId).trim() : null,
    shopName: meta.shopName ? String(meta.shopName).trim() : null,
  };
  return `${cleanReason}${cleanReason ? '\n' : ''}${VIP_META_MARKER}${JSON.stringify(payload)}`;
}

function getVoucherStatusLabel(source, amount) {
  const normalizedSource = String(source || '').trim().toUpperCase();
  if (normalizedSource === 'ADMIN_CANCEL') return '취소됨';
  if (normalizedSource === 'MEMBER_TRANSFER_OUT') return '전송됨';
  if (normalizedSource === 'MEMBER_TRANSFER_IN') return '사용가능';
  if (normalizedSource === 'VOUCHER_SHOP_TRANSFER_OUT' || normalizedSource === 'SHOP_USE') return '결제됨';
  if (normalizedSource === 'VOUCHER_SHOP_TRANSFER_IN') return '입고됨';
  return Number(amount) > 0 ? '사용가능' : '사용됨';
}

function getVoucherReason(entry, meta) {
  const normalizedSource = String(entry?.source || '').trim().toUpperCase();
  if (normalizedSource === 'ADMIN_CANCEL') {
    return '발행취소';
  }
  if (normalizedSource === 'MEMBER_TRANSFER_OUT') {
    return meta.toMemberName ? `${meta.toMemberName} 회원 전송` : '회원 전송';
  }
  if (normalizedSource === 'MEMBER_TRANSFER_IN') {
    return meta.fromMemberName ? `${meta.fromMemberName} 회원에게서 수신` : '회원 수신';
  }
  if (normalizedSource === 'VOUCHER_SHOP_TRANSFER_OUT' || normalizedSource === 'SHOP_USE') {
    return meta.shopName ? `${meta.shopName} 상점 결제` : '상점 결제';
  }
  if (normalizedSource === 'VOUCHER_SHOP_TRANSFER_IN') {
    return meta.shopName ? `${meta.shopName} 상점 입고` : '상점 입고';
  }
  return meta.reason;
}

function getActiveVoucherCards(entries) {
  const cardMap = new Map();
  (entries || []).forEach((entry) => {
    const key = String(entry?.serial || '').trim();
    if (!key) return;
    if (!cardMap.has(key)) {
      cardMap.set(key, {
        serial: key,
        balance: 0,
        latestPositive: null,
        lastEntry: null,
      });
    }
    const bucket = cardMap.get(key);
    bucket.balance += Number(entry.amount || 0);

    const lastEntryTime = bucket.lastEntry?.createdAt ? new Date(bucket.lastEntry.createdAt).getTime() : 0;
    const entryTime = entry?.createdAt ? new Date(entry.createdAt).getTime() : 0;
    if (!bucket.lastEntry || entryTime >= lastEntryTime) {
      bucket.lastEntry = entry;
    }

    if (Number(entry.amount || 0) > 0) {
      const previousTime = bucket.latestPositive?.createdAt ? new Date(bucket.latestPositive.createdAt).getTime() : 0;
      if (!bucket.latestPositive || entryTime >= previousTime) {
        bucket.latestPositive = entry;
      }
    }
  });

  return Array.from(cardMap.values())
    .filter((bucket) => {
      const lastSource = String(bucket.lastEntry?.source || '').trim().toUpperCase();
      return bucket.balance > 0 && bucket.latestPositive && lastSource !== 'ADMIN_CANCEL';
    })
    .map((bucket) => ({
      ...bucket.latestPositive,
      cardAmount: bucket.balance,
      amountAbs: bucket.balance,
      statusLabel: '사용가능',
    }))
    .sort((left, right) => {
      const leftTime = left?.createdAt ? new Date(left.createdAt).getTime() : 0;
      const rightTime = right?.createdAt ? new Date(right.createdAt).getTime() : 0;
      return rightTime - leftTime;
    });
}

function normalizeVoucherHistoryEntry(entry, index) {
  const amount = Number(entry?.amount || 0);
  const meta = parseVoucherMeta(entry?.description, entry?.source);
  return {
    ...entry,
    amount,
    amountAbs: Math.abs(amount),
    directionLabel: amount > 0 ? '지급' : '사용',
    statusLabel: getVoucherStatusLabel(entry?.source, amount),
    displayName: VIP_VOUCHER_TITLE,
    reason: getVoucherReason(entry, meta),
    issueRegion: meta.issueRegion,
    fromMemberId: meta.fromMemberId,
    fromMemberName: meta.fromMemberName,
    toMemberId: meta.toMemberId,
    toMemberName: meta.toMemberName,
    shopId: meta.shopId,
    shopName: meta.shopName,
    displayDate: formatVoucherDate(entry?.createdAt),
    serial: formatVoucherSerial(entry?.referenceId, entry?.createdAt, entry?.id || index + 1),
  };
}

function getParticipationStateMeta(status) {
  const normalized = String(status || 'submitted').trim().toLowerCase();
  if (normalized === 'rewarded') return { label: '보상 지급 완료', color: '#7c3aed', background: 'rgba(139,92,246,0.14)' };
  if (normalized === 'selected') return { label: '선정', color: '#059669', background: 'rgba(16,185,129,0.14)' };
  if (normalized === 'rejected') return { label: '미선정', color: '#dc2626', background: 'rgba(239,68,68,0.14)' };
  if (normalized === 'reviewing') return { label: '검토중', color: '#b45309', background: 'rgba(245,158,11,0.14)' };
  return { label: '접수 완료', color: '#2563eb', background: 'rgba(59,130,246,0.12)' };
}

export default function My() {
  // ★ authReadyUser 게이트 (최우선 선언: TDZ 방지)
  const [authReadyUser, setAuthReadyUser] = useState(isAuthReady());

  // ★ Auth hydration state (새로고침 시 서버 세션 복원 대기)
  const [authLoading, setAuthLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // 안전한 userData 선언: 우선순위
  // 1) getAuthInfo() / getCurrentUser()
  // 2) session.memberId (SSOT memberId)
  // 3) null
  let userData = null;
  try {
    const auth = (typeof getAuthInfo === 'function') ? getAuthInfo() : null;
    if (auth) {
      userData = auth;
    } else {
      const session = (typeof getSession === 'function') ? getSession() : null;
      const memberId = session?.memberId || session?.id || null;
      userData = memberId ? { memberId } : null;
    }
  } catch (e) {
    userData = null;
  }

  // Make userData reactive: keep in state so UI updates when admin toggles permissions
  const [userDataState, setUserDataState] = useState(userData);
  const [supplyManagerServerReady, setSupplyManagerServerReady] = useState(false);

  // expose userDataState as the canonical userData used below
  userData = userDataState;

  // ★ effectiveUserId 유도를 authReadyUser 이후로 이동 (authReadyUser는 이미 최상단에서 선언됨)
  const sessionForId = authReadyUser ? (typeof getSession === 'function' ? getSession() : null) : null;
  const sessionMemberId = sessionForId?.memberId || sessionForId?.id || null;
  const currentUserId = userData?.id || userData?.memberId || sessionMemberId || null;
  const currentUserRole = String(userData?.role || sessionForId?.role || '').toUpperCase();
  const canOpenRegionalConsole = canAccessRegionalConsole(currentUserRole);
  const resolvedSupplyManager = userData?.supplyManager;
  const fallbackSupplyManager = sessionForId?.supplyManager;
  const hasResolvedSupplyManager = resolvedSupplyManager !== undefined && resolvedSupplyManager !== null;
  const hasKnownSupplyManager =
    resolvedSupplyManager !== undefined && resolvedSupplyManager !== null
      ? true
      : fallbackSupplyManager !== undefined && fallbackSupplyManager !== null;
  const isSupplyManager = !!(resolvedSupplyManager ?? fallbackSupplyManager ?? false);
  const resolvedDistributionManager = userData?.distributionManager;
  const fallbackDistributionManager = sessionForId?.distributionManager;
  const isDistributionManager = !!(resolvedDistributionManager ?? fallbackDistributionManager ?? false);
  const effectiveUserId = authReadyUser ? currentUserId : null;
  const sdMarkValue = normalizeSdMark(
    userData?.sdMark ??
    userData?.sdNumber ??
    userData?.sdLabel ??
    userDataState?.sdMark ??
    userDataState?.sdNumber ??
    userDataState?.sdLabel ??
    sessionForId?.sdMark ??
    sessionForId?.sdNumber ??
    sessionForId?.sdLabel
  ) ?? readSdMarkCache(currentUserId);

  useEffect(() => {
    const refresh = () => {
      (async () => {
        try {
          const session = (typeof getSession === 'function') ? getSession() : null;
          const memberId = session?.memberId || session?.id || null;

          // SSOT: members는 서버에서 조회
          if (memberId) {
            try {
              const serverMember = await storageAdapter.getMemberById(memberId);
              if (serverMember) {
                setUserDataState(serverMember);
                setSupplyManagerServerReady(true);
                return;
              }
            } catch (e) {
              console.error('[My] refresh: getMemberById failed:', e);
            }
          }

          const auth = (typeof getAuthInfo === 'function') ? getAuthInfo() : null;
          setUserDataState(auth || (memberId ? { memberId } : null));
        } catch (err) {
          // noop
        }
      })();
    };

    // 마운트 즉시 서버 데이터 재조회
    refresh();

    // Listen for same-tab SSOT changes and storage events (cross-tab)
    window.addEventListener('su:ssot:changed', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('su:ssot:changed', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  useEffect(() => {
    const loadSdMarkFallback = async () => {
      try {
        const hasSdMark = normalizeSdMark(
          userDataState?.sdMark ??
          userDataState?.sdNumber ??
          userDataState?.sdLabel
        );
        if (hasSdMark || !currentUserId) return;

        const members = await storageAdapter.getMembers();
        const matched = (Array.isArray(members) ? members : []).find((member) => {
          const memberKey = String(member?.id ?? member?.memberId ?? '');
          if (memberKey && memberKey === String(currentUserId)) return true;
          if (userDataState?.email && member?.email && String(member.email).trim() === String(userDataState.email).trim()) return true;
          if (userDataState?.phone && member?.phone && String(member.phone).trim() === String(userDataState.phone).trim()) return true;
          return false;
        });

        if (!matched) return;
        const matchedSdMark = normalizeSdMark(matched?.sdMark ?? matched?.sdNumber ?? matched?.sdLabel);
        if (!matchedSdMark) return;

        setUserDataState((prev) => ({ ...prev, ...matched }));
      } catch (error) {
        console.error('[My] loadSdMarkFallback failed:', error);
      }
    };

    loadSdMarkFallback();
  }, [currentUserId, userDataState]);

  // when userData changes (e.g., admin granted supplyManager), ensure offerForm defaults are set
  useEffect(() => {
    try {
      if (userData && userData.supplyManager) {
        setOfferForm(prev => ({
          ...prev,
          manager: prev.manager || userData.name || '',
          contact: prev.contact || userData.phone || '',
        }));
      }
    } catch (e) {}
  }, [userData]);

  // 포인트 데이터 안전 선언 및 filteredHistory 기본값

  // ★ authReadyUser 리스너 추가 (boot 완료 감지)
  useEffect(() => {
    const onAuth = () => setAuthReadyUser(isAuthReady());
    window.addEventListener('su:auth:changed', onAuth);
    setAuthReadyUser(isAuthReady());
    return () => window.removeEventListener('su:auth:changed', onAuth);
  }, []);

  // [MyOffice][BOOT] diagnostic log
  useEffect(() => {
    console.log('[MyOffice][BOOT]', { me: effectiveUserId, authed: !!effectiveUserId, authReadyUser, step: 'mount', userData: !!userData });
  }, [authReadyUser, effectiveUserId]);

  // 내 예약 목록 로드 (조용한 폴링 + visibility 갱신)
  useEffect(() => {
    if (!effectiveUserId) return;
    let mounted = true;
    const loadMyRsv = async (silent) => {
      if (!silent) setMyRsvLoading(true);
      try {
        const res = await storageAdapter.getMyReservations(effectiveUserId);
        if (mounted) setMyReservations(res?.reservations || []);
      } catch { if (mounted) setMyReservations([]); }
      finally { if (!silent && mounted) setMyRsvLoading(false); }
    };
    loadMyRsv(false);
    const iv = setInterval(() => { if (mounted) loadMyRsv(true); }, 15000);
    const onVis = () => { if (!document.hidden && mounted) loadMyRsv(true); };
    document.addEventListener('visibilitychange', onVis);
    const onSwMsg = (e) => {
      if (e.data?.type === 'push-received' && e.data?.tag === 'reservation-update' && mounted) loadMyRsv(true);
    };
    navigator.serviceWorker?.addEventListener('message', onSwMsg);
    return () => { mounted = false; clearInterval(iv); document.removeEventListener('visibilitychange', onVis); navigator.serviceWorker?.removeEventListener('message', onSwMsg); };
  }, [effectiveUserId]);

    // Friends & Chat state (hoisted before chat/friends effects to avoid TDZ)
    const [friends, setFriends] = useState([]);
    const [friendCount, setFriendCount] = useState(0);
    const [friendModalOpen, setFriendModalOpen] = useState(false);
    const [friendCandidates, setFriendCandidates] = useState([]);
    const [friendSearchName, setFriendSearchName] = useState('');
    const [chatOpen, setChatOpen] = useState(false);
    const [activeChatFriend, setActiveChatFriend] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const assistantData = { interestRegions: [], interestCategories: [], notifications: {} };

  // ---------------- Shop Points (상점 포인트 패널 상태, 브리지 구조 이식) ----------------
  // 상점 목록 및 선택
  const [ownedShops, setOwnedShops] = useState([]); // 내 소유 상점 목록
  const [activeShopId, setActiveShopId] = useState(""); // 선택된 상점 ID
  // 포인트 요약/원장/지급요청
  const [shopEarned, setShopEarned] = useState(0); // 총 적립
  const [shopAvailable, setShopAvailable] = useState(0); // 가용 잔액
  const [shopLedger, setShopLedger] = useState([]); // 원장
  const [payoutRequests, setPayoutRequests] = useState([]); // 지급요청
  // UI 상태
  const [shopLedgerExpanded, setShopLedgerExpanded] = useState(false); // 원장 더보기
  const [participationExpanded, setParticipationExpanded] = useState(false); // 홈 미션/이벤트 더보기
  const [shopLedgerLoading, setShopLedgerLoading] = useState(false);
  const [payoutLoading, setPayoutLoading] = useState(false);
  // 지급요청 모달/폼/필터
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutForm, setPayoutForm] = useState({ amount: '', bankName: '', accountNumber: '', depositorName: '', memo: '' });
  const [allPayoutsModalOpen, setAllPayoutsModalOpen] = useState(false);
  const [payoutListFilter, setPayoutListFilter] = useState('ALL');

  // ---------------- Shop Reservations (상점 예약 관리) ----------------
  const [shopReservations, setShopReservations] = useState([]);
  const [shopRsvLoading, setShopRsvLoading] = useState(false);
  const [myReservations, setMyReservations] = useState([]);
  const [myRsvLoading, setMyRsvLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState({ open: false, rsvId: null, reason: '' });

  useEffect(() => {
    const openPayoutModal = (event) => {
      const nextShopId = String(event?.detail?.shopId || '').trim();
      if (nextShopId) setActiveShopId(nextShopId);
      setPayoutModalOpen(true);
    };
    window.addEventListener('su:shop:payout:open', openPayoutModal);
    return () => window.removeEventListener('su:shop:payout:open', openPayoutModal);
  }, []);

  // ---------------- Shop Event Register ----------------
  const [shopEventModalOpen, setShopEventModalOpen] = useState(false);
  const [shopEventTarget, setShopEventTarget] = useState(null);
  const [shopEventForm, setShopEventForm] = useState({ title: '', content: '', startDate: '', endDate: '', imageUrl: '' });
  const [shopEventSaving, setShopEventSaving] = useState(false);

  // ---------------- Shop Edit (SSOT: PUT + refetch) ----------------
  const [shopEditOpen, setShopEditOpen] = useState(false);
  const [shopEditTarget, setShopEditTarget] = useState(null);
  const [shopEditForm, setShopEditForm] = useState({
    name: '',
    category: '',
    regionId: null,
    address: '',
    phone: '',
    description: '',
    hours: '',
    isPublic: false,
  });
  const [shopRegions, setShopRegions] = useState([]);
  const [memberRegions, setMemberRegions] = useState([]);

  useEffect(() => {
    let mounted = true;
    const loadRegions = async () => {
      try {
        const rows = await storageAdapter.getRegions();
        if (!mounted) return;
        setMemberRegions(Array.isArray(rows) ? rows : []);
      } catch (error) {
        if (mounted) setMemberRegions([]);
      }
    };
    loadRegions();
    return () => {
      mounted = false;
    };
  }, []);

  const openShopEdit = async (shop) => {
    try {
      if (!shop) return;
      // regions를 먼저 로드 (이름 fallback 매칭에 필요)
      let loadedRegions = shopRegions;
      if (loadedRegions.length === 0) {
        try {
          const r = await storageAdapter.getRegions();
          loadedRegions = r || [];
          setShopRegions(loadedRegions);
        } catch (_) {}
      }
      // regionId 결정: 직접 값 우선, 없으면 region 텍스트로 이름 매칭
      let resolvedRegionId = shop.regionId || null;
      if (!resolvedRegionId && shop.region && loadedRegions.length > 0) {
        const matched = loadedRegions.find(
          r => r.name && r.name.trim() === String(shop.region).trim()
        );
        if (matched) resolvedRegionId = matched.id;
      }
      setShopEditTarget(shop);
      setShopEditForm({
        name: shop.name || '',
        category: shop.category || '',
        regionId: resolvedRegionId,
        address: shop.address || '',
        phone: shop.phone || '',
        description: shop.description || '',
        hours: shop.hours || '',
        isPublic: !!shop.isPublic,
      });
      setShopEditOpen(true);
    } catch (e) {
      console.error('[My] openShopEdit failed:', e);
    }
  };

    // ---------------- Friends & Chat ----------------
    useEffect(() => {
      const loadFriends = async () => {
        try {
          if (!effectiveUserId) {
            setFriends([]);
            setFriendCount(0);
            return;
          }
          const [{ friends: friendIds }, members] = await Promise.all([
            storageAdapter.fetchFriends(effectiveUserId),
            storageAdapter.getMembers(),
          ]);

          const memberById = new Map(
            (Array.isArray(members) ? members : []).map(m => [String(m.id ?? m.memberId ?? ''), m])
          );
          const list = (Array.isArray(friendIds) ? friendIds : []).map(fid => memberById.get(String(fid))).filter(Boolean);
          setFriends(list);
          setFriendCount(list.length);
        } catch (e) {
          console.error('[My] loadFriends (server) failed:', e);
          setFriends([]);
          setFriendCount(0);
          try { setToast({ open: true, message: '친구 목록을 불러오지 못했습니다. (서버)', type: 'error' }); } catch (err) {}
        }
      };

      loadFriends();
      const onSsot = () => loadFriends();
      window.addEventListener('su:ssot:changed', onSsot);
      return () => { window.removeEventListener('su:ssot:changed', onSsot); };
    }, [effectiveUserId]);

    // Shop Points: ownedShops 및 선택 상점 fetch, 상태, 동기화 (브리지 구조 이식)
    useEffect(() => {
      if (!authReadyUser || !effectiveUserId) {
        setOwnedShops([]);
        setActiveShopId("");
        setShopEarned(0);
        setShopAvailable(0);
        setShopLedger([]);
        setPayoutRequests([]);
        return;
      }
      let mounted = true;
      // 1. 내 상점 목록 fetch
      const fetchOwnedShops = async () => {
        try {
          const res = await fetch(`/api/shops/my`, { headers: { "x-member-id": effectiveUserId } });
          const data = await res.json();
          const shops = Array.isArray(data?.shops) ? data.shops : [];
          if (!mounted) return;
          setOwnedShops(shops);
          // 기본 선택 상점 결정
          let nextShopId = activeShopId;
          const shopIds = shops.map(s => String(s.id || s.shopId || "").trim());
          if (nextShopId && shopIds.includes(nextShopId)) {
            // 기존 선택값 유지
          } else if (shopIds.length > 0) {
            nextShopId = shopIds[0];
          } else {
            nextShopId = "";
          }
          setActiveShopId(nextShopId);
        } catch (e) {
          setOwnedShops([]);
          setActiveShopId("");
        }
      };
      fetchOwnedShops();
      return () => { mounted = false; };
      // eslint-disable-next-line
    }, [authReadyUser, effectiveUserId]);

    // 2. 선택 상점 변경 시 포인트 요약/원장/지급요청 fetch
    useEffect(() => {
      if (!activeShopId) {
        setShopEarned(0);
        setShopAvailable(0);
        setShopLedger([]);
        setPayoutRequests([]);
        return;
      }
      let mounted = true;
      const fetchShopPointSummary = async () => {
        setShopLedgerLoading(true);
        setPayoutLoading(true);
        try {
          const [earnedRes, availableRes, ledgerRes, payoutRes] = await Promise.allSettled([
            fetch(`/api/shops/${encodeURIComponent(activeShopId)}/points/earned`, { credentials: "include" }),
            fetch(`/api/shops/${encodeURIComponent(activeShopId)}/points/available`, { credentials: "include" }),
            fetch(`/api/shops/${encodeURIComponent(activeShopId)}/points/ledger?limit=50`, { credentials: "include" }),
            shopStore.loadUnifiedShopPayoutRequests(activeShopId, { requesterId: effectiveUserId }),
          ]);
          // 총 적립
          let earned = 0;
          if (earnedRes.status === "fulfilled") {
            const data = await earnedRes.value.json().catch(() => ({}));
            earned = Number(data?.totalEarned || data?.total || 0);
          }
          // 가용 잔액
          let available = 0;
          if (availableRes.status === "fulfilled") {
            const data = await availableRes.value.json().catch(() => ({}));
            available = Number(data?.available || 0);
          }
          // 원장
          let ledger = [];
          if (ledgerRes.status === "fulfilled") {
            const data = await ledgerRes.value.json().catch(() => ({}));
            ledger = Array.isArray(data?.ledger) ? data.ledger : [];
          }
          // 지급요청
          let payouts = [];
          if (payoutRes.status === "fulfilled") {
            payouts = Array.isArray(payoutRes.value?.requests) ? payoutRes.value.requests : [];
          }
          if (!mounted) return;
          setShopEarned(earned);
          setShopAvailable(available);
          setShopLedger(ledger);
          setPayoutRequests(payouts);
        } catch (e) {
          if (!mounted) return;
          setShopEarned(0);
          setShopAvailable(0);
          setShopLedger([]);
          setPayoutRequests([]);
        } finally {
          if (mounted) {
            setShopLedgerLoading(false);
            setPayoutLoading(false);
          }
        }
      };
      fetchShopPointSummary();

      // 상점 예약 로드
      const loadShopReservations = async (silent) => {
        if (!silent) setShopRsvLoading(true);
        try {
          const res = await storageAdapter.getShopReservations(activeShopId);
          if (mounted) setShopReservations(res?.reservations || []);
        } catch { if (mounted) setShopReservations([]); }
        finally { if (!silent && mounted) setShopRsvLoading(false); }
      };
      loadShopReservations(false);

      // 15초마다 조용히 갱신 (로딩 표시 없음 = 깜빡임 없음)
      const rsvInterval = setInterval(() => { if (mounted) loadShopReservations(true); }, 15000);

      // 탭 전환 시 즉시 갱신
      const onVisible = () => { if (!document.hidden && mounted) loadShopReservations(true); };
      document.addEventListener('visibilitychange', onVisible);

      // 푸시 알림 수신 시 즉시 갱신
      const onSwMessage = (e) => {
        if (e.data?.type === 'push-received' && e.data?.tag === 'reservation-new' && mounted) {
          loadShopReservations(true);
        }
      };
      navigator.serviceWorker?.addEventListener('message', onSwMessage);

      return () => {
        mounted = false;
        clearInterval(rsvInterval);
        document.removeEventListener('visibilitychange', onVisible);
        navigator.serviceWorker?.removeEventListener('message', onSwMessage);
      };
    }, [activeShopId, effectiveUserId]);

    const openFriendModal = () => {
      (async () => {
        try {
          const resolvedUserId = effectiveUserId || (typeof getSession === 'function' ? (getSession()?.memberId || getSession()?.id) : null);
          if (!resolvedUserId) {
            setToast({ open: true, message: '로그인이 필요합니다.', type: 'error' });
            return;
          }
          const [members, friendsRes] = await Promise.all([
            storageAdapter.getMembers(),
            storageAdapter.fetchFriends(resolvedUserId),
          ]);
          const myId = String(resolvedUserId);
          const myFriendIds = new Set((friendsRes?.friends || []).map(String));
          const candidates = (Array.isArray(members) ? members : []).filter(m => {
            const id = String(m.id ?? m.memberId ?? '');
            if (!id) return false;
            if (id === myId) return false;
            if (myFriendIds.has(id)) return false;
            return true;
          });
          setFriendCandidates(candidates);
          setFriendSearchName('');
          setFriendModalOpen(true);
        } catch (e) {
          console.error('[My] openFriendModal failed:', e);
          setFriendCandidates([]);
          setFriendModalOpen(true);
          try { setToast({ open: true, message: '친구 후보를 불러오지 못했습니다. (서버)', type: 'error' }); } catch (err) {}
        }
      })();
    };

    const filteredFriendCandidates = useMemo(
      () => filterMembersByExactSearchQuery(friendCandidates, friendSearchName),
      [friendCandidates, friendSearchName]
    );

    const handleAddFriend = (member) => {
      (async () => {
        try {
          const resolvedUserId = effectiveUserId || (typeof getSession === 'function' ? (getSession()?.memberId || getSession()?.id) : null);
          if (!resolvedUserId) {
            setToast({ open: true, message: '로그인이 필요합니다.', type: 'error' });
            return;
          }
          const friendId = String(member?.id ?? member?.memberId ?? '');
          if (!friendId) {
            setToast({ open: true, message: '친구 ID가 올바르지 않습니다.', type: 'error' });
            return;
          }
          const expectedName = normalizeExactName(friendSearchName);
          if (!expectedName) {
            setToast({ open: true, message: '이름을 정확히 입력한 뒤 추가해 주세요.', type: 'error' });
            return;
          }
          if (memberDisplayName(member) !== expectedName) {
            setToast({ open: true, message: '입력한 이름과 일치하는 회원만 추가할 수 있습니다.', type: 'error' });
            return;
          }
          await storageAdapter.addFriend(resolvedUserId, friendId, { expectedName });
          setFriendCandidates(prev => prev.filter(p => String(p.id ?? p.memberId) !== friendId));
          try { setToast({ open: true, message: `${member?.name || '회원'}님을 친구로 추가했습니다`, type: 'success' }); } catch (e) {}
          window.dispatchEvent(new CustomEvent('su:ssot:changed', { detail: { type: 'friends', operation: 'add' } }));
        } catch (e) {
          console.error('[My] addFriend failed:', e);
          try { setToast({ open: true, message: '친구 추가 실패 (서버)', type: 'error' }); } catch (err) {}
        }
      })();
    };

    const handleRemoveFriend = (member) => {
      (async () => {
        try {
          if (!effectiveUserId) {
            setToast({ open: true, message: '로그인이 필요합니다.', type: 'error' });
            return;
          }
          const friendId = String(member?.id ?? member?.memberId ?? '');
          if (!friendId) {
            setToast({ open: true, message: '친구 ID가 올바르지 않습니다.', type: 'error' });
            return;
          }
          await storageAdapter.removeFriend(effectiveUserId, friendId);
          try { setToast({ open: true, message: '친구가 삭제되었습니다', type: 'success' }); } catch (e) {}
          window.dispatchEvent(new CustomEvent('su:ssot:changed', { detail: { type: 'friends', operation: 'remove' } }));
        } catch (e) {
          console.error('[My] removeFriend failed:', e);
          try { setToast({ open: true, message: '친구 삭제 실패 (서버)', type: 'error' }); } catch (err) {}
        }
      })();
    };

    const openChatWith = (member) => {
      (async () => {
        try {
          setActiveChatFriend(member);
          const msgs = await chatService.getConversation(effectiveUserId, member.id || member.memberId);
          setChatMessages(Array.isArray(msgs) ? msgs : []);
          setChatOpen(true);
        } catch (e) {
          console.error('[My] openChatWith failed:', e);
          setToast({ open: true, message: '메시지 불러오기 실패: ' + e.message, type: 'error' });
        }
      })();
    };

    useEffect(() => {
      const onChatsUpdated = () => {
        if (!activeChatFriend) return;
        const msgs = chatService.getConversation(effectiveUserId, activeChatFriend.id || activeChatFriend.memberId);
        setChatMessages(Array.isArray(msgs) ? msgs : []);
      };
      window.addEventListener('su_chats:updated', onChatsUpdated);
      window.addEventListener('storage', onChatsUpdated);
      return () => { window.removeEventListener('su_chats:updated', onChatsUpdated); window.removeEventListener('storage', onChatsUpdated); };
    }, [activeChatFriend, effectiveUserId]);

    // Chat sound: global toggle (controls playback for messages that include "(공유)")
    // Key: 'su_chat_sound_enabled' => '1' (on) or '0' (off). Default: on.
    const [chatSoundEnabled, setChatSoundEnabled] = useState(true);
    

    useEffect(() => {
      try {
        const v = localStorage.getItem('su_chat_sound_enabled');
        setChatSoundEnabled(v === null ? true : v !== '0');
      } catch (e) { setChatSoundEnabled(true); }
    }, []);
    const toggleChatSound = () => {
      try {
        const next = !chatSoundEnabled;
        setChatSoundEnabled(next);
        localStorage.setItem('su_chat_sound_enabled', next ? '1' : '0');
      } catch (e) {}
    };

    const sendChatMessage = async (text) => {
      if (!activeChatFriend) return;
      const to = activeChatFriend.id || activeChatFriend.memberId;
      try {
        const msg = await chatService.sendMessage(effectiveUserId, to, text);
        setChatMessages(prev => ([...(prev || []), msg]));
      } catch (e) {
        console.error('[chat] sendMessage error:', e);
      }
    };

    

    // Point payment: DB=SSOT (no local fallback). Always use signed QR payload.
    const payWithQr = async ({ qrPayload, shopId, amount }) => {
      try {
        try {
          if (!isPointsTransferEnabled()) {
            setToast({ open: true, message: '현재 포인트 전송이 중지되어 결제/전송이 불가합니다.', type: 'error' });
            return { success: false, error: 'disabled' };
          }
        } catch (e) {}

        const amt = Number(amount);
        if (!Number.isFinite(amt) || amt <= 0) {
          setToast({ open: true, message: '결제 금액이 올바르지 않습니다.', type: 'error' });
          return { success: false, error: 'invalid_amount' };
        }

        let token = qrPayload;
        if (!token && shopId) {
          const issued = await storageAdapter.issueShopQrPayload(String(shopId));
          token = issued?.qrPayload;
        }

        if (!token) {
          setToast({ open: true, message: 'QR 정보가 없습니다.', type: 'error' });
          return { success: false, error: 'missing_qr' };
        }

        const memberId = effectiveUserId;
        if (!memberId) {
          setToast({ open: true, message: '로그인이 필요합니다.', type: 'error' });
          return { success: false, error: 'not_logged_in' };
        }

        const res = await storageAdapter.payWithQrPayload(token, Math.trunc(amt), String(memberId));
        if (!(res && (res.ok === true || res.success === true))) {
          setToast({ open: true, message: '결제에 실패했습니다. (서버)', type: 'error' });
          return { success: false, error: 'server_failed' };
        }

        setScannerOpen(false);
        setPendingPayAmount(0);
        setToast({ open: true, message: '결제처리가 완료되었습니다.', type: 'success' });

        // SSOT refetch
        try { await loadPointData(); } catch (e) {}
        try {
          if (activeShopId) {
            const pointsData = await shopStore.loadShopPointsData(activeShopId);
            setShopEarned(pointsData.earned || 0);
            setShopAvailable(pointsData.available || 0);
            setShopLedger(pointsData.ledger || []);
            const allReqs = await shopStore.loadAllPayoutRequests(activeShopId);
            const sortedReqs = (allReqs || []).sort((a,b) => {
              try { return new Date(b.requestedAt || b.requested_at) - new Date(a.requestedAt || a.requested_at); } catch(e) { return 0; }
            });
            setPayoutRequests(sortedReqs);
            setPayoutRequests(sortedReqs.slice(0,4));
          }
        } catch (e) {}

        return { success: true };
      } catch (e) {
        console.error('[My] payWithQr failed:', e);
        setToast({ open: true, message: '결제 처리 중 오류가 발생했습니다. (서버)', type: 'error' });
        return { success: false, error: e.message };
      }
    };
  

  // Toast state for notifying user when they get supplyManager permission
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  const [customAlert, setCustomAlert] = useState({ open: false, message: "" });

  useEffect(() => {
    // authReadyUser가 아직 false면 초기화 건너뜀 (auth 부팅 중)
    if (!authReadyUser) return;
    // 서버에서 확정된 권한값 기준으로만 전환 감지 (fallback 값으로 인한 중복 방지)
    if (!supplyManagerServerReady || !hasResolvedSupplyManager || !currentUserId) return;

    const curr = !!resolvedSupplyManager;
    const stateKey = `su:supply-manager:last-known:${currentUserId}`;
    let prev = null;

    try {
      const raw = localStorage.getItem(stateKey);
      if (raw === "1") prev = true;
      else if (raw === "0") prev = false;
    } catch (error) {
      prev = null;
    }

    // 첫 관측 시에는 알림 없이 기준값만 저장
    if (prev === null) {
      try {
        localStorage.setItem(stateKey, curr ? "1" : "0");
      } catch (error) {
        // noop
      }
      return;
    }

    if (!prev && curr) {
      // 실제 권한 변경(false -> true)에서만 1회 노출
      setToast({ open: true, message: "보급지원담당자 권한이 부여되었습니다. 물품을 등록할 수 있습니다.", type: "success" });
    }

    if (prev !== curr) {
      try {
        localStorage.setItem(stateKey, curr ? "1" : "0");
      } catch (error) {
        // noop
      }
    }
  }, [authReadyUser, supplyManagerServerReady, hasResolvedSupplyManager, currentUserId, resolvedSupplyManager]);

  // Show toast via effect to avoid state updates during render
  useEffect(() => {
    if (toast.open) {
      // Toast component will handle display
      // Auto-close after 3 seconds
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, open: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.open]);

  // 포인트 전송 토글 이벤트: 중지 시 열린 스캐너/결제 UI를 닫고 경고
  useEffect(() => {
    const handler = (e) => {
      try {
        const enabled = e?.detail?.enabled;
        if (enabled === false) {
          setScannerOpen(false);
          setScannerError(null);
          setToast({ open: true, message: '현재 포인트 전송이 중지되어 결제/전송이 불가합니다.', type: 'error' });
        }
      } catch (err) {}
    };
    window.addEventListener('su:points:toggle', handler);
    return () => window.removeEventListener('su:points:toggle', handler);
  }, []);

  // 포인트 탭 상태 (안전 기본값)
  const [pointTab, setPointTab] = useState("all");
  const [pointHistoryPage, setPointHistoryPage] = useState(0);
  const location = useLocation();
  const [myTab, setMyTab] = useState(() => {
    const t = location.state?.tab;
    if (t === 'activity' || t === 'wallet') return t;
    return 'home';
  }); // 'home' | 'wallet' | 'activity'
  // walletView: localStorage 연동 (새로고침 후에도 유지)
  const [walletView, setWalletView] = useState(() => {
    try {
      const saved = localStorage.getItem("walletView");
      if (saved === "point" || saved === "shop" || saved === "voucher") return saved;
    } catch (e) {}
    return "point";
  });

  // walletView 상태 변경 시 localStorage에 저장 및 디버깅 로그
  useEffect(() => {
    try {
      localStorage.setItem("walletView", walletView);
    } catch (e) {}
    try {
      window.dispatchEvent(new CustomEvent("su:walletView:changed", { detail: { walletView } }));
    } catch (e) {}
  }, [walletView]);

  // ★ 서버 기반 포인트 데이터 상태
  const [pointBalance, setPointBalance] = useState(0);
  const [pointHistory, setPointHistory] = useState([]);
  const [pointLoading, setPointLoading] = useState(false);
  const [pointError, setPointError] = useState(null);
  // VIP 상품권 상태
  const [voucherBalance, setVoucherBalance] = useState(null); // { total, balances: [{typeCode, name, balance}] }
  const [voucherHistory, setVoucherHistory] = useState([]);
  const [voucherHistoryExpanded, setVoucherHistoryExpanded] = useState(false);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherSection, setVoucherSection] = useState(false); // 섹션 펼침 여부
  const [voucherActionCardSerial, setVoucherActionCardSerial] = useState('');
  const [voucherActionMode, setVoucherActionMode] = useState('');
  const [voucherMembers, setVoucherMembers] = useState([]);
  const [voucherShops, setVoucherShops] = useState([]);
  const [voucherMemberQuery, setVoucherMemberQuery] = useState('');
  const [voucherShopQuery, setVoucherShopQuery] = useState('');
  const [selectedVoucherMember, setSelectedVoucherMember] = useState(null);
  const [selectedVoucherShop, setSelectedVoucherShop] = useState(null);
  const [voucherActionLoading, setVoucherActionLoading] = useState(false);
  const [voucherActionSubmitting, setVoucherActionSubmitting] = useState(false);
  const [voucherConfirmState, setVoucherConfirmState] = useState({
    open: false,
    title: '',
    message: '',
    details: [],
    confirmText: '확인',
  });
  const [voucherCancellingSerial, setVoucherCancellingSerial] = useState('');
  const voucherConfirmResolverRef = useRef(null);
  const [missionParticipations, setMissionParticipations] = useState([]);
  const [participationLoading, setParticipationLoading] = useState(false);
  // 결제 모드: qr(기본) 또는 search(상점검색결제)
  const [paymentMode, setPaymentMode] = useState('qr');
  const [shopSearchQuery, setShopSearchQuery] = useState('');
  const [shopSearchResults, setShopSearchResults] = useState([]);
  const [selectedShopForPay, setSelectedShopForPay] = useState(null);
  // 포인트 결제 스캐너 상태
  const [scannerOpen, setScannerOpen] = useState(false);
  const [pendingPayAmount, setPendingPayAmount] = useState(0);
  const [scannerError, setScannerError] = useState(null);
  // 결제 입력 제어 및 검증
  const [payAmount, setPayAmount] = useState(0);
  const [payAmountError, setPayAmountError] = useState(null);

  // ★ 서버에서 포인트 잔액/이력 로드
  const loadPointData = async () => {
    if (!currentUserId) {
      setPointBalance(0);
      setPointHistory([]);
      return;
    }

    setPointLoading(true);
    setPointError(null);

    try {
      // 잔액 조회
      const balanceData = await storageAdapter.getPointBalance(currentUserId);
      setPointBalance(balanceData?.balance ?? 0);

      // 이력 조회
      const historyData = await storageAdapter.getPointHistory(currentUserId, { limit: 1000 });
      setPointHistory(historyData?.transactions || historyData || []);
    } catch (e) {
      console.error('[My] Failed to load point data:', e);
      setPointError(e.message);
      setPointBalance(0);
      setPointHistory([]);
    } finally {
      setPointLoading(false);
    }
  };

  // ★ 컴포넌트 마운트 시 포인트 데이터 로드
  useEffect(() => {
    loadPointData();
  }, [currentUserId]);

  // ★ VIP 상품권 로드
  const loadVoucherData = async () => {
    if (!currentUserId) { setVoucherBalance(null); return; }
    setVoucherLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || '';
      const [balRes, histRes] = await Promise.all([
        fetch(`${API_BASE}/api/vouchers/${encodeURIComponent(currentUserId)}/balance`).then(r => r.json()),
        fetch(`${API_BASE}/api/vouchers/${encodeURIComponent(currentUserId)}/history?limit=100`).then(r => r.json()),
      ]);
      setVoucherBalance(balRes.ok ? balRes : null);
      setVoucherHistory(histRes.ok ? (histRes.history || []) : []);
    } catch (e) {
      console.error('[My] Failed to load voucher data:', e);
    } finally {
      setVoucherLoading(false);
    }
  };
  useEffect(() => { loadVoucherData(); }, [currentUserId]);

  useEffect(() => {
    if (myTab === 'wallet' && walletView === 'voucher' && !voucherSection) {
      setVoucherSection(true);
    }
  }, [myTab, walletView, voucherSection]);

  const normalizedVoucherHistory = useMemo(
    () => (voucherHistory || []).map((entry, index) => normalizeVoucherHistoryEntry(entry, index)),
    [voucherHistory]
  );
  const activeVoucherCards = useMemo(
    () => getActiveVoucherCards(normalizedVoucherHistory),
    [normalizedVoucherHistory]
  );
  const voucherTotalAmount = activeVoucherCards.reduce((sum, card) => sum + Math.max(0, Number(card.cardAmount || 0)), 0);
  const latestPositiveVoucher = normalizedVoucherHistory.find((entry) => entry.amount > 0) || normalizedVoucherHistory[0] || null;
  const visibleVoucherHistory = voucherHistoryExpanded
    ? normalizedVoucherHistory
    : normalizedVoucherHistory.slice(0, 6);
  const currentVoucherActionCard = activeVoucherCards.find((card) => card.serial === voucherActionCardSerial) || null;
  const filteredVoucherMembers = useMemo(() => {
    const query = String(voucherMemberQuery || '').trim().toLowerCase();
    if (!query) return [];
    return (voucherMembers || []).filter((member) => {
      const memberId = String(getMemberId(member) || '').trim();
      const name = String(member?.name || '').trim().toLowerCase();
      const phone = String(member?.phone || '').trim().toLowerCase();
      if (!memberId || memberId === String(currentUserId || '')) return false;
      return memberId.toLowerCase().includes(query) || name.includes(query) || phone.includes(query);
    }).slice(0, 8);
  }, [voucherMembers, voucherMemberQuery, currentUserId]);
  const filteredVoucherShops = useMemo(() => {
    const query = String(voucherShopQuery || '').trim().toLowerCase();
    if (!query) return [];
    return (voucherShops || []).filter((shop) => {
      const status = String(shop?.status || '').trim().toLowerCase();
      if (status === 'pending' || status === 'rejected') return false;
      const shopId = String(shop?.id || '').trim().toLowerCase();
      const name = String(shop?.name || '').trim().toLowerCase();
      const address = String(shop?.address || shop?.description || '').trim().toLowerCase();
      return shopId.includes(query) || name.includes(query) || address.includes(query);
    }).slice(0, 8);
  }, [voucherShops, voucherShopQuery]);

  const closeVoucherAction = () => {
    setVoucherActionCardSerial('');
    setVoucherActionMode('');
    setVoucherMemberQuery('');
    setVoucherShopQuery('');
    setSelectedVoucherMember(null);
    setSelectedVoucherShop(null);
  };

  const requestVoucherConfirm = ({ title, message, details = [], confirmText = '확인' }) =>
    new Promise((resolve) => {
      voucherConfirmResolverRef.current = resolve;
      setVoucherConfirmState({
        open: true,
        title,
        message,
        details,
        confirmText,
      });
    });

  const closeVoucherConfirm = (confirmed) => {
    const resolver = voucherConfirmResolverRef.current;
    voucherConfirmResolverRef.current = null;
    setVoucherConfirmState((prev) => ({ ...prev, open: false }));
    if (resolver) resolver(confirmed);
  };

  const openVoucherAction = async (mode, card) => {
    setVoucherActionCardSerial(card.serial);
    setVoucherActionMode(mode);
    setVoucherMemberQuery('');
    setVoucherShopQuery('');
    setSelectedVoucherMember(null);
    setSelectedVoucherShop(null);

    try {
      setVoucherActionLoading(true);
      if (mode === 'member' && voucherMembers.length === 0) {
        const members = await storageAdapter.getMembers();
        setVoucherMembers(Array.isArray(members) ? members : []);
      }
      if (mode === 'shop' && voucherShops.length === 0) {
        const shops = await storageAdapter.getShops();
        setVoucherShops(Array.isArray(shops) ? shops : []);
      }
    } catch (error) {
      console.error('[My] openVoucherAction failed:', error);
      setToast({ open: true, message: '전송 대상을 불러오지 못했습니다.', type: 'error' });
    } finally {
      setVoucherActionLoading(false);
    }
  };

  const submitVoucherTransferFallback = async ({
    fromMemberId,
    toMemberId,
    shopId,
    targetType,
    typeCode,
    amount,
    referenceId,
    senderSource,
    receiverSource,
    senderDescription,
    receiverDescription,
    actorId,
  }) => {
    await apiPost('/api/vouchers/issue', {
      memberId: String(fromMemberId),
      typeCode,
      amount: -Number(amount),
      description: senderDescription,
      adminId: actorId,
      source: senderSource,
      referenceId,
      targetType: 'member',
    });

    try {
      await apiPost('/api/vouchers/issue', {
        memberId: String(targetType === 'shop' ? shopId : toMemberId),
        typeCode,
        amount: Number(amount),
        description: receiverDescription,
        adminId: actorId,
        source: receiverSource,
        referenceId,
        targetType,
        shopId: targetType === 'shop' ? String(shopId) : null,
      });
    } catch (error) {
      try {
        await apiPost('/api/vouchers/issue', {
          memberId: String(fromMemberId),
          typeCode,
          amount: Number(amount),
          description: buildVoucherMetaDescription('전송 실패 복구', { issueRegion: currentVoucherActionCard?.issueRegion }),
          adminId: actorId,
          source: 'TRANSFER_RESTORE',
          referenceId,
          targetType: 'member',
        });
      } catch (restoreError) {
        console.error('[My] voucher fallback restore failed:', restoreError);
      }
      throw error;
    }
  };

  const submitVoucherTransfer = async () => {
    if (!currentVoucherActionCard || !currentUserId) return;
    const currentUserName = String(userData?.name || sessionForId?.name || '').trim();
    const targetMemberId = selectedVoucherMember ? String(getMemberId(selectedVoucherMember) || '').trim() : '';
    const targetShopId = selectedVoucherShop ? String(selectedVoucherShop.id || '').trim() : '';
    const targetName = voucherActionMode === 'member'
      ? String(selectedVoucherMember?.name || targetMemberId || '').trim()
      : String(selectedVoucherShop?.name || targetShopId || '').trim();

    if (voucherActionMode === 'member' && !targetMemberId) {
      setToast({ open: true, message: '전송할 회원을 선택해 주세요.', type: 'error' });
      return;
    }
    if (voucherActionMode === 'shop' && !targetShopId) {
      setToast({ open: true, message: '결제할 상점을 선택해 주세요.', type: 'error' });
      return;
    }

    const meta = {
      issueRegion: currentVoucherActionCard.issueRegion,
      transferKind: voucherActionMode,
      fromMemberId: currentUserId,
      fromMemberName: currentUserName,
      toMemberId: voucherActionMode === 'member' ? targetMemberId : null,
      toMemberName: voucherActionMode === 'member' ? targetName : null,
      shopId: voucherActionMode === 'shop' ? targetShopId : null,
      shopName: voucherActionMode === 'shop' ? targetName : null,
    };

    const confirmMessage = voucherActionMode === 'shop'
      ? `${targetName || '선택한 상점'}에 ${formatVoucherAmount(currentVoucherActionCard.cardAmount)} 상품권으로 결제하시겠습니까?`
      : `${targetName || '선택한 회원'}에게 ${formatVoucherAmount(currentVoucherActionCard.cardAmount)} 상품권을 전송하시겠습니까?`;

    const confirmed = await requestVoucherConfirm({
      title: voucherActionMode === 'shop' ? '상점 결제' : '회원 전송',
      message: confirmMessage,
      details: [
        `상품권 금액 ${formatVoucherAmount(currentVoucherActionCard.cardAmount)}`,
        `대상 ${targetName || (voucherActionMode === 'shop' ? '선택한 상점' : '선택한 회원')}`,
      ],
      confirmText: voucherActionMode === 'shop' ? '결제 실행' : '전송 실행',
    });
    if (!confirmed) {
      return;
    }

    try {
      setVoucherActionSubmitting(true);
      const payload = {
        fromMemberId: String(currentUserId),
        toMemberId: voucherActionMode === 'member' ? targetMemberId : null,
        shopId: voucherActionMode === 'shop' ? targetShopId : null,
        targetType: voucherActionMode === 'shop' ? 'shop' : 'member',
        typeCode: currentVoucherActionCard.typeCode,
        amount: currentVoucherActionCard.cardAmount,
        referenceId: currentVoucherActionCard.serial,
        senderSource: voucherActionMode === 'shop' ? 'VOUCHER_SHOP_TRANSFER_OUT' : 'MEMBER_TRANSFER_OUT',
        receiverSource: voucherActionMode === 'shop' ? 'VOUCHER_SHOP_TRANSFER_IN' : 'MEMBER_TRANSFER_IN',
        senderDescription: buildVoucherMetaDescription(
          voucherActionMode === 'shop' ? `${targetName} 상점 결제` : `${targetName} 회원 전송`,
          meta
        ),
        receiverDescription: buildVoucherMetaDescription(
          voucherActionMode === 'shop' ? `${currentUserName || '회원'} 결제 상품권` : `${currentUserName || '회원'} 회원에게서 수신`,
          meta
        ),
        actorId: String(currentUserId),
      };

      try {
        await apiPost('/api/vouchers/transfer', payload);
      } catch (error) {
        const isMissingTransferRoute = error?.status === 404 || /Cannot POST\s+\/api\/vouchers\/transfer/i.test(String(error?.message || ''));
        if (!isMissingTransferRoute) throw error;
        await submitVoucherTransferFallback(payload);
      }

      await loadVoucherData();
      window.dispatchEvent(new CustomEvent('su:ssot:changed', { detail: { type: 'vouchers', operation: voucherActionMode === 'shop' ? 'shop-payment' : 'member-transfer' } }));
      setToast({ open: true, message: voucherActionMode === 'shop' ? '상점 결제가 처리되었습니다.' : '회원 전송이 완료되었습니다.', type: 'success' });
      closeVoucherAction();
    } catch (error) {
      console.error('[My] submitVoucherTransfer failed:', error);
      setToast({ open: true, message: error?.message || '상품권 처리 중 오류가 발생했습니다.', type: 'error' });
    } finally {
      setVoucherActionSubmitting(false);
    }
  };

  const cancelVoucherIssue = async (card) => {
    if (!card || !currentUserId || !checkIsAdmin()) return;

    const confirmed = window.confirm(`${formatVoucherAmount(card.cardAmount)} 상품권 발행을 취소하시겠습니까?\n취소되면 카드가 사라지고 원장에 취소 기록이 남습니다.`);
    if (!confirmed) return;

    try {
      setVoucherCancellingSerial(card.serial);
      await apiPost('/api/vouchers/issue', {
        memberId: String(currentUserId),
        typeCode: String(card.typeCode || 'SHOP_USE'),
        amount: -Math.abs(Number(card.cardAmount || 0)),
        description: buildVoucherMetaDescription('발행 취소', { issueRegion: card.issueRegion }),
        adminId: String(currentUserId),
        source: 'ADMIN_CANCEL',
        referenceId: String(card.serial || '').trim(),
        targetType: 'member',
      });
      await loadVoucherData();
      window.dispatchEvent(new CustomEvent('su:ssot:changed', { detail: { type: 'vouchers', operation: 'issue-cancelled', serial: card.serial } }));
      setToast({ open: true, message: '상품권 발행이 취소되었습니다.', type: 'success' });
    } catch (error) {
      console.error('[My] cancelVoucherIssue failed:', error);
      setToast({ open: true, message: error?.message || '발행 취소 중 오류가 발생했습니다.', type: 'error' });
    } finally {
      setVoucherCancellingSerial('');
    }
  };

  const loadParticipationData = async () => {
    if (!currentUserId) {
      setMissionParticipations([]);
      return;
    }
    setParticipationLoading(true);
    try {
      const list = await storageAdapter.getParticipations(currentUserId);
      setMissionParticipations(Array.isArray(list) ? list.filter((item) => item.itemType === 'mission' || item.itemType === 'event') : []);
    } catch (error) {
      console.error('[My] Failed to load participation data:', error);
      setMissionParticipations([]);
    } finally {
      setParticipationLoading(false);
    }
  };

  useEffect(() => {
    loadParticipationData();
  }, [currentUserId]);

  // ★ POINTS_UPDATED 이벤트 리스닝 (실시간 반영)
  useEffect(() => {
    const handlePointsUpdate = (e) => {
      const { memberId } = e.detail || {};
      // 현재 유저의 포인트가 변경된 경우에만 재로드
      if (!memberId || memberId === currentUserId) {
        console.log('[My] POINTS_UPDATED event received, reloading...');
        loadPointData();
      }
    };

    window.addEventListener('POINTS_UPDATED', handlePointsUpdate);
    window.addEventListener('su:ssot:changed', loadPointData);  // SSOT 이벤트도 리스닝
    window.addEventListener('su:ssot:changed', loadParticipationData);

    return () => {
      window.removeEventListener('POINTS_UPDATED', handlePointsUpdate);
      window.removeEventListener('su:ssot:changed', loadPointData);
      window.removeEventListener('su:ssot:changed', loadParticipationData);
    };
  }, [currentUserId]);

  const recentParticipations = useMemo(
    () => (participationExpanded ? missionParticipations : missionParticipations.slice(0, 3)),
    [missionParticipations, participationExpanded],
  );

  // ★ 서버 기반 포인트 이력 (오름차순 정렬)
  const ledgerForUserAsc = useMemo(() => {
    try {
      return [...pointHistory].sort((a, b) => new Date(a.createdAt || a.timestamp) - new Date(b.createdAt || b.timestamp));
    } catch (e) {
      return [];
    }
  }, [pointHistory]);

  const totals = useMemo(() => {
    // ★ 서버에서 직접 받은 balance 사용
    let totalEarned = 0;
    let totalSpent = 0;
    try {
      ledgerForUserAsc.forEach((l) => {
        if (l.status && (l.status === 'cancelled' || l.status === 'CANCELLED')) return;
        const amt = Number(l.amount) || 0;
        if (amt > 0) totalEarned += amt;
        else totalSpent += Math.abs(amt);
      });
    } catch (e) {}
    
    // available은 서버 balance를 우선, fallback으로 계산값
    const calculated = Math.max(0, totalEarned - totalSpent);
    const available = pointBalance || calculated;
    
    return { totalEarned, totalSpent, available };
  }, [ledgerForUserAsc, pointBalance]);

  const runningAfterMap = useMemo(() => {
    const map = {};
    try {
      let bal = 0;
      ledgerForUserAsc.forEach((l) => {
        if (l.status && (l.status === 'cancelled' || l.status === 'CANCELLED')) { map[l.id] = bal; return; }
        bal += Number(l.amount) || 0;
        map[l.id] = bal;
      });
    } catch (e) {}
    return map;
  }, [ledgerForUserAsc]);

  // ★ 필터링된 포인트 이력 (서버 기반)
  const filteredHistory = useMemo(() => {
    const rawHistory = Array.isArray(pointHistory) ? pointHistory : [];
    
    if (pointTab === 'earn') {
      return rawHistory.filter(h => (h.amount || 0) > 0 && h.status !== 'cancelled' && h.status !== 'CANCELLED');
    } else if (pointTab === 'spend') {
      return rawHistory.filter(h => (h.amount || 0) < 0 && h.status !== 'cancelled' && h.status !== 'CANCELLED');
    } else {
      return rawHistory;
    }
  }, [pointHistory, pointTab]);
  // 일정 관리 상태
  const [schedules, setSchedules] = useState([]);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({ title: "", date: "", time: "", alarm: false });
  const [scheduleError, setScheduleError] = useState("");
  // 일정 목록 표시 토글 (true: 보임, false: 숨김). 단일 boolean으로 전체 리스트 wrapper만 제어
  // 기본: 닫힌 상태 -> 사용자가 '일정관리'를 눌러 열도록 변경
  const [showScheduleList, setShowScheduleList] = useState(false);
  const navigate = useNavigate();

  // ★ Auth hydration: 새로고침 시 서버 세션 복원 (비로그인 즉시 튕김 방지)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // 이미 로그인 상태면 hydration 불필요
        if (isLoggedIn()) {
          if (mounted) {
            setAuthLoading(false);
            setAuthChecked(true);
          }
          return;
        }
        // 서버 세션에서 복원 시도
        const result = await hydrateAuthFromServer();
        if (!mounted) return;
        
        if (result.ok) {
          // 복원 성공 → 로그인 상태 유지
          setAuthLoading(false);
          setAuthChecked(true);
        } else {
          // 복원 실패 → 로그인 필요
          setAuthLoading(false);
          setAuthChecked(true);
          navigate("/auth?returnTo=/my", { replace: true });
        }
      } catch (e) {
        console.error('[My] auth hydration failed:', e);
        if (!mounted) return;
        setAuthLoading(false);
        setAuthChecked(true);
        navigate("/auth?returnTo=/my", { replace: true });
      }
    })();
    return () => { mounted = false; };
  }, [navigate]);

  // debugOnce and tap-once helpers for mobile touch consistency (minimal, per-file)
  function debugOnce(key, state = {}, e = null) {
    try {
      if (!window.__debugOnce) window.__debugOnce = new Set();
      if (window.__debugOnce.has(key)) return;
      window.__debugOnce.add(key);
      console.log('MOBILE_DEBUG', { key, executed: true, state, target: e && (e.currentTarget?.id || e.target?.id || e.target?.tagName) ? (e.currentTarget?.id || e.target?.id || e.target?.tagName) : null, innerHeight: window.innerHeight, visualHeight: window.visualViewport ? window.visualViewport.height : null });
    } catch (err) {}
  }
  const handleTapOnce = (e, fn) => {
    try {
      const now = Date.now();
      if (!window.__lastActionTs) window.__lastActionTs = 0;
      if (now - window.__lastActionTs < 500) return;
      window.__lastActionTs = now;
      const key = e && (e.currentTarget?.id || e.target?.id) ? `tap_${e.currentTarget?.id || e.target?.id}` : null;
      if (key) debugOnce(key, { screen: 'My', action: 'tap' }, e);
    } catch (err) {}
    try { fn && fn(); } catch (err) { console.error(err); }
  };

  // ★ 비로그인 시 로그인 페이지로 리다이렉트 제거 (위 hydration으로 대체)

  // load schedules for current user
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        if (!currentUserId) {
          setSchedules([]);
          return;
        }
        const list = await scheduleService.getSchedules(currentUserId);
        if (mounted) setSchedules(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error('[My] failed to load schedules (SSOT):', e);
        if (mounted) {
          setSchedules([]);
          try { setToast({ open: true, message: '일정을 불러오지 못했습니다. (서버)', type: 'error' }); } catch (err) {}
        }
      }
    }
    load();
    const onSsot = (e) => {
      try {
        if (!e || !e.detail) return;
        if (e.detail.type === 'schedule' || e.detail.type === 'schedules') load();
      } catch (err) {}
    };
    window.addEventListener('su:ssot:changed', onSsot);
    return () => { mounted = false; window.removeEventListener('su:ssot:changed', onSsot); };
  }, [currentUserId]);

  // ★ Load shops for shop search
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        await loadShops();
        if (mounted) console.log('[My] ✅ Shops loaded:', getShops().length);
      } catch (e) {
        console.error('[My] Failed to load shops:', e);
      }
    }
    load();
    const onSsot = () => { load(); };
    window.addEventListener('su:ssot:changed', onSsot);
    return () => { mounted = false; window.removeEventListener('su:ssot:changed', onSsot); };
  }, []);

  // Scanner refs and effect
  const videoRef = useRef(null);
  const scanIntervalRef = useRef(null);
  useEffect(() => {
    let stream = null;
    let detector = null;
    if (!scannerOpen) return;
    let mounted = true;
    (async () => {
      try {
        // ★ getUserMedia 지원 체크
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setScannerError('이 브라우저는 카메라를 지원하지 않습니다.');
          setScannerOpen(false);
          return;
        }
        
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (!mounted) return;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try { await videoRef.current.play(); } catch (e) {}
        }

        if ('BarcodeDetector' in window) {
          try {
            detector = new window.BarcodeDetector({ formats: ['qr_code'] });
            scanIntervalRef.current = setInterval(async () => {
              try {
                const results = await detector.detect(videoRef.current);
                if (results && results.length) {
                  const val = results[0].rawValue || results[0].rawData || null;
                  if (val) {
                    // handle and stop
                    clearInterval(scanIntervalRef.current);
                    try { stream.getTracks().forEach(t => t.stop()); } catch (e) {}
                    setScannerOpen(false);
                    const raw = String(val);
                    
                    // ★ URL 감지: http(s):// 로 시작하면 URL로 간주
                    if (raw.startsWith('http://') || raw.startsWith('https://')) {
                      clearInterval(scanIntervalRef.current);
                      try { stream.getTracks().forEach(t => t.stop()); } catch (e) {}
                      setScannerOpen(false);
                      
                      // URL 이동 or 외부 브라우저
                      if (window.confirm(`URL로 이동하시겠습니까?\n\n${raw}`)) {
                        window.location.href = raw;
                      }
                      return;
                    }
                    
                    // SSOT: accept signed token (header.payload.sig) or URL with qrPayload query
                    let qrPayload = null;
                    try {
                      const qp = raw.match(/[?&]qrPayload=([^&]+)/i);
                      if (qp) qrPayload = decodeURIComponent(qp[1]);
                    } catch (e) {}

                    if (!qrPayload) {
                      // token format: three dot-separated parts
                      const parts = raw.split('.');
                      if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
                        qrPayload = raw;
                      }
                    }

                    if (qrPayload) {
                      await payWithQr({ qrPayload, amount: pendingPayAmount });
                    } else {
                      setToast({ open: true, message: '유효하지 않은 QR입니다. (서명 토큰 필요)', type: 'error' });
                    }
                  }
                }
              } catch (e) {}
            }, 500);
          } catch (e) {
            setScannerError('BarcodeDetector 초기화 실패');
          }
        } else {
          // BarcodeDetector not available: show manual paste fallback (user will be shown UI)
        }
      } catch (e) {
        setScannerError('카메라 접근에 실패했습니다. 권한을 허용했는지 확인하세요.');
      }
    })();

    return () => {
      mounted = false;
      try { if (scanIntervalRef.current) clearInterval(scanIntervalRef.current); } catch (e) {}
      try { if (stream) stream.getTracks().forEach(t => t.stop()); } catch (e) {}
    };
  }, [scannerOpen, pendingPayAmount]);

  // 일정 데이터 (computed from schedules)
  const [scheduleData, setScheduleData] = useState({ today: [], upcoming: [] });
  const [alarmsEnabled, setAlarmsEnabled] = useState(() => {
    try { return localStorage.getItem('su_schedule_alarms_enabled') !== 'false'; } catch (e) { return true; }
  });
  const alarmTimersRef = React.useRef({});
  

  // compute today / upcoming lists from schedules
  useEffect(() => {
    const today = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const todayStr = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;
    
    console.log('[My.jsx] 📅 Computing scheduleData:', {
      schedulesCount: schedules?.length || 0,
      todayStr,
      scheduleDates: schedules?.map(s => ({ id: s.id, title: s.title, date: s.date, time: s.time }))
    });
    
    const todayList = [];
    const upcomingList = [];
    (schedules || []).forEach(s => {
      if (!s || !s.date) {
        console.warn('[My.jsx] ⚠️ Schedule missing date:', s);
        return;
      }
      if (s.date === todayStr) {
        console.log('[My.jsx] ✅ Today schedule found:', s.title, s.date);
        todayList.push(s);
      } else if (s.date > todayStr) {
        // 제한: 예정 일정은 향후 7일까지의 항목만 포함
        try {
          // parse as local date at midnight to avoid timezone shifts
          const parts = String(s.date).split('-').map(p => parseInt(p, 10));
          if (parts.length === 3) {
            const sDate = new Date(parts[0], (parts[1]||1) - 1, parts[2]);
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const msPerDay = 24 * 60 * 60 * 1000;
            const diffDays = Math.floor((sDate.getTime() - todayStart.getTime()) / msPerDay);
            if (diffDays >= 1 && diffDays <= 7) {
              console.log('[My.jsx] ✅ Upcoming schedule found:', s.title, s.date, `(${diffDays}일 후)`);
              upcomingList.push(s);
            } else {
              console.log('[My.jsx] ⏭️ Schedule out of range (>7 days):', s.title, s.date, `(${diffDays}일 후)`);
            }
          }
        } catch (e) {
          console.warn('[My.jsx] ⚠️ Date parsing failed, adding to upcoming:', s.title, s.date, e);
          // parsing failure: fallback to include if date string is greater (preserve previous behavior)
          upcomingList.push(s);
        }
      }
    });
    todayList.sort((a,b) => (a.time||'') > (b.time||'') ? 1 : -1);
    upcomingList.sort((a,b) => (a.date||'') > (b.date||'') ? 1 : -1);
    
    console.log('[My.jsx] 📊 ScheduleData computed:', {
      todayCount: todayList.length,
      upcomingCount: upcomingList.length,
      today: todayList.map(s => s.title),
      upcoming: upcomingList.map(s => s.title)
    });
    
    setScheduleData({ today: todayList, upcoming: upcomingList });
  }, [schedules]);

  // alarm helpers
  const clearAlarms = () => {
    const timers = alarmTimersRef.current || {};
    Object.values(timers).forEach(t => clearTimeout(t));
    alarmTimersRef.current = {};
  };

  const playAlarm = async (title) => {
    try {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification('일정 알림', { body: title });
      } else if ("Notification" in window && Notification.permission !== "denied") {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') new Notification('일정 알림', { body: title });
      }
    } catch (e) {
      // ignore
    }
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 880;
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.value = 0.05;
      o.start();
      setTimeout(() => { o.stop(); ctx.close(); }, 800);
    } catch (e) {
      try { alert('일정 알림: ' + title); } catch (e) {}
    }
  };

  const scheduleAlarms = () => {
    clearAlarms();
    if (!alarmsEnabled) return;
    const now = new Date();
    (scheduleData.today || []).forEach(s => {
      if (!s.alarm) return;
      if (!s.time) return;
      const [hh, mm] = (s.time || '').split(':').map(x => parseInt(x,10));
      if (Number.isNaN(hh) || Number.isNaN(mm)) return;
      const alarmTime = new Date();
      alarmTime.setHours(hh||0, mm||0, 0, 0);
      const diff = alarmTime.getTime() - now.getTime();
      if (diff <= 0) return;
      const id = setTimeout(() => playAlarm(s.title || '일정 알림'), diff);
      alarmTimersRef.current[s.id] = id;
    });
  };

  useEffect(() => {
    scheduleAlarms();
    return () => clearAlarms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleData, alarmsEnabled]);

  // 일정 모달 렌더링 함수
  // 일정 모달 렌더링 함수가 필요하다면, 아래처럼 함수 선언만 남기고 내부에서 스타일 선언을 제거합니다.
  // 만약 일정 모달이 별도의 모달 컴포넌트라면, 스타일은 상단 선언을 사용하고 JSX만 반환하도록 수정하세요.
  // 예시:
  // const renderScheduleModal = () => (
  //   <Modal>...</Modal>
  // );
  // 또는 필요 없다면 완전히 제거해도 됩니다.

  // ✅ 로딩 표준화: 초기값 null (깜빡임 방지)
  const [supplyData, setSupplyData] = useState(null);
  const [offers, setOffers] = useState([]);
  const [offerForm, setOfferForm] = useState({ item: '', manager: userData?.name || '', contact: userData?.phone || '', price: '', detail: '', image: '' });
  const [offerError, setOfferError] = useState('');
  const [editingOfferId, setEditingOfferId] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  // ✨ ADD: 전체보기 모달 상태
  const [showAllRequestsModal, setShowAllRequestsModal] = useState(false);
  const [showAllPurchasesModal, setShowAllPurchasesModal] = useState(false);

  // ★ Issue B-2: Managed Supply Requests (Server SSOT)
  const [managedRequests, setManagedRequests] = useState(null); // null=loading, []=empty
  const [managedRequestTab, setManagedRequestTab] = useState('all'); // all, pending, completed
  const [managedPage, setManagedPage] = useState(0);

  // 내 보급품 목록
  const [mySupplyItems, setMySupplyItems] = useState(null); // null=loading
  const [editingMyItemId, setEditingMyItemId] = useState(null);
  const [editMyForm, setEditMyForm] = useState({});

  const [distributionItems, setDistributionItems] = useState([]);
  const [distributionOrders, setDistributionOrders] = useState([]);
  const [distributionManagedOrders, setDistributionManagedOrders] = useState([]);
  const [distributionLoading, setDistributionLoading] = useState(false);
  const [showAllSales, setShowAllSales] = useState(false);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [showAllWithdrawals, setShowAllWithdrawals] = useState(false);
  const [distWallet, setDistWallet] = useState(null);
  const [distWalletLoading, setDistWalletLoading] = useState(false);
  const [distWithdrawOpen, setDistWithdrawOpen] = useState(false);
  const [homeView, setHomeView] = useState('main');
  const [distWithdrawSubmitting, setDistWithdrawSubmitting] = useState(false);
  const [distWithdrawForm, setDistWithdrawForm] = useState({ amount: '', bankName: '', accountNumber: '', depositorName: '', memo: '' });
  const [distributionFormOpen, setDistributionFormOpen] = useState(false);
  const [distributionSaving, setDistributionSaving] = useState(false);
  const [editingDistributionId, setEditingDistributionId] = useState(null);
  const [distributionMainFile, setDistributionMainFile] = useState(null);
  const [distributionExtraFiles, setDistributionExtraFiles] = useState([]);
  const [distributionPdfFile, setDistributionPdfFile] = useState(null);
  const [distributionForm, setDistributionForm] = useState({
    title: '',
    category: 'food',
    productType: 'general',
    imageUrl: '',
    extraImageUrls: [],
    videoUrl: '',
    description: '',
    sellerIntro: '',
    receiveMethod: 'delivery',
    visibility: 'public',
    featured: false,
    todayDeal: false,
    unlimitedStock: false,
    price: '',
    quantity: '1',
    status: 'available',
  });

  const resetDistributionForm = () => {
    setEditingDistributionId(null);
    setDistributionMainFile(null);
    setDistributionExtraFiles([]);
    setDistributionPdfFile(null);
    setDistributionForm({
      title: '',
      category: 'food',
      productType: 'general',
      imageUrl: '',
      extraImageUrls: [],
      videoUrl: '',
      pdfUrl: '',
      description: '',
      sellerIntro: '',
      receiveMethod: 'delivery',
      visibility: 'public',
      featured: false,
      todayDeal: false,
      unlimitedStock: false,
      price: '',
      quantity: '1',
      status: 'available',
    });
  };

  const openCreateDistributionForm = () => {
    resetDistributionForm();
    setDistributionFormOpen(true);
  };

  const openEditDistributionForm = (item) => {
    let meta = {};
    try {
      meta = typeof item?.uploadMeta === 'string' ? JSON.parse(item.uploadMeta || '{}') : (item?.uploadMeta || {});
    } catch (e) {
      meta = {};
    }

    setEditingDistributionId(item?.id || null);
    setDistributionForm({
      title: String(item?.title || '').trim(),
      category: String(item?.type || 'food').trim(),
      productType: String(meta?.productType || 'general').trim(),
      imageUrl: String(item?.imageUrl || item?.image_url || '').trim(),
      extraImageUrls: (() => {
        const urls = meta?.extraImageUrls || meta?.extraImageUrl;
        if (Array.isArray(urls)) return urls.filter(Boolean);
        if (typeof urls === 'string' && urls.trim()) return [urls.trim()];
        return [];
      })(),
      videoUrl: String(meta?.videoUrl || '').trim(),
      pdfUrl: String(meta?.pdfUrl || '').trim(),
      description: String(item?.description || '').trim(),
      sellerIntro: String(meta?.sellerIntro || meta?.intro || '').trim(),
      receiveMethod: String(meta?.receiveMethod || 'delivery').trim(),
      visibility: String(meta?.visibility || (String(item?.status || '').toLowerCase() === 'hidden' ? 'hidden' : 'public')).trim(),
      featured: !!meta?.featured,
      todayDeal: !!meta?.todayDeal,
      unlimitedStock: !!meta?.unlimitedStock,
      price: String(item?.price ?? ''),
      quantity: String(item?.quantity ?? '1'),
      status: String(item?.status || 'available').trim().toLowerCase(),
    });
    setDistributionFormOpen(true);
  };

  useEffect(() => {
    let mounted = true;
    const loadManaged = async () => {
      if (!isSupplyManager || !effectiveUserId) {
        if (mounted) setManagedRequests([]);
        return;
      }
      try {
        const res = await fetch('/api/my/supply-requests/managed?requestType=supply', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (mounted) {
            const rows = Array.isArray(data.requests) ? data.requests : [];
            const supplyOnlyRows = rows.filter((row) => {
              const type = String(row?.requestType || row?.request_type || 'supply').toLowerCase();
              const orderStatus = String(row?.orderStatus || row?.order_status || '').toUpperCase();
              const paymentRef = String(row?.paymentReferenceId || row?.payment_reference_id || '').trim();
              const message = String(row?.message || '').toLowerCase();
              if (type === 'distribution') return false;
              if (orderStatus) return false;
              if (paymentRef) return false;
              if (message.includes('포인트 결제 주문') || message.includes('배송지:') || message.includes('수령방식:')) return false;
              return true;
            });
            setManagedRequests(supplyOnlyRows);
          }
        } else {
          if (mounted) setManagedRequests([]);
        }
      } catch (e) {
        console.error('[My] Failed to load managed requests:', e);
        if (mounted) setManagedRequests([]);
      }
    };
    loadManaged();
    const onSsot = () => { loadManaged(); };
    window.addEventListener('su:ssot:changed', onSsot);
    return () => { mounted = false; window.removeEventListener('su:ssot:changed', onSsot); };
  }, [isSupplyManager, effectiveUserId]);

  // 내 보급품 목록 로드 (supplies 테이블 — Support와 동일 출처)
  useEffect(() => {
    let mounted = true;
    const loadMyItems = async () => {
      if (!isSupplyManager || !effectiveUserId) {
        if (mounted) setMySupplyItems([]);
        return;
      }
      try {
        const res = await fetch(`/api/supplies?type=offer&createdBy=${effectiveUserId}`);
        const data = await res.json();
        if (mounted) setMySupplyItems(Array.isArray(data) ? data : (data.supplies || []));
      } catch (e) {
        if (mounted) setMySupplyItems([]);
      }
    };
    loadMyItems();
    const onSsot = () => { loadMyItems(); };
    window.addEventListener('su:ssot:changed', onSsot);
    window.addEventListener('supply:updated', onSsot);
    return () => { mounted = false; window.removeEventListener('su:ssot:changed', onSsot); window.removeEventListener('supply:updated', onSsot); };
  }, [isSupplyManager, effectiveUserId]);

  useEffect(() => {
    let mounted = true;

    const normalizeRows = (rows) => (Array.isArray(rows) ? rows : []);

    const loadDistributionData = async () => {
      if (!effectiveUserId) {
        if (mounted) {
          setDistributionItems([]);
          setDistributionOrders([]);
          setDistributionManagedOrders([]);
        }
        return;
      }

      setDistributionLoading(true);
      try {
        const [allSupplies, myRequests, managedRequests] = await Promise.all([
          storageAdapter.fetchSupplies().catch(() => []),
          storageAdapter.getSupplyRequests({ requesterId: effectiveUserId, requestType: 'distribution' }).catch(() => []),
          storageAdapter.getSupplyRequests({ managerId: effectiveUserId, requestType: 'distribution' }).catch(() => []),
        ]);

        const myItems = normalizeRows(allSupplies)
          .filter((item) => String(item?.createdBy || item?.created_by || '') === String(effectiveUserId))
          .filter((item) => DISTRIBUTION_TYPE_KEYS.has(String(item?.type || '').toLowerCase()))
          .filter((item) => String(item?.status || '').toLowerCase() !== 'deleted');

        const myItemIds = new Set(myItems.map((item) => String(item?.id || item?.supplyId || item?.supply_id || '')).filter(Boolean));

        // 구매자 주문 = requesterId 기준으로 가져온 모든 주문 (내가 등록한 상품 필터 제거)
        const myOrderRows = normalizeRows(myRequests);

        const managedOrderRows = normalizeRows(managedRequests)
          .filter((request) => myItemIds.has(String(request?.supplyItemId || request?.supply_item_id || '')));

        if (mounted) {
          setDistributionItems(myItems);
          setDistributionOrders(myOrderRows);
          setDistributionManagedOrders(managedOrderRows);
        }
      } catch (error) {
        if (mounted) {
          setDistributionItems([]);
          setDistributionOrders([]);
          setDistributionManagedOrders([]);
        }
      } finally {
        if (mounted) setDistributionLoading(false);
      }
    };

    loadDistributionData();
    const onReload = () => { loadDistributionData(); };
    window.addEventListener('su:ssot:changed', onReload);
    window.addEventListener('supply:updated', onReload);
    return () => {
      mounted = false;
      window.removeEventListener('su:ssot:changed', onReload);
      window.removeEventListener('supply:updated', onReload);
    };
  }, [effectiveUserId]);

      useEffect(() => {
        if (!effectiveUserId) return;
        let mounted = true;
        const load = async () => {
          setDistWalletLoading(true);
          try {
            const data = await storageAdapter.getDistWallet();
            if (mounted) setDistWallet(data);
          } catch (e) {
            if (mounted) setDistWallet(null);
          } finally {
            if (mounted) setDistWalletLoading(false);
          }
        };
        load();
        const onReload = () => { load(); };
        window.addEventListener('su:ssot:changed', onReload);
        window.addEventListener('supply:updated', onReload);
        return () => {
          mounted = false;
          window.removeEventListener('su:ssot:changed', onReload);
          window.removeEventListener('supply:updated', onReload);
        };
      }, [effectiveUserId]);

      const handleDistWithdraw = async (e) => {
        e.preventDefault();
        const amount = Math.trunc(Number(distWithdrawForm.amount || 0));
        if (!amount || amount <= 0) { alert('출금 금액을 입력하세요.'); return; }
        if (!distWithdrawForm.bankName.trim() || !distWithdrawForm.accountNumber.trim() || !distWithdrawForm.depositorName.trim()) {
          alert('은행명, 계좌번호, 예금주명을 모두 입력하세요.'); return;
        }
        const available = distWallet?.available ?? 0;
        if (amount > available) { alert(`출금 가능 잔액(${available.toLocaleString('ko-KR')}P)을 초과할 수 없습니다.`); return; }
        setDistWithdrawSubmitting(true);
        try {
          await storageAdapter.requestDistWithdraw({ ...distWithdrawForm, amount });
          setCustomAlert({ open: true, message: '출금 요청이 접수되었습니다. 관리자 승인 후 지급됩니다.' });
          setDistWithdrawOpen(false);
          setDistWithdrawForm({ amount: '', bankName: '', accountNumber: '', depositorName: '', memo: '' });
          const data = await storageAdapter.getDistWallet();
          setDistWallet(data);
        } catch (err) {
          alert('출금 요청 실패: ' + (err?.message || '알 수 없는 오류'));
        } finally {
          setDistWithdrawSubmitting(false);
        }
      };

      const handleDistributionSave = async (event) => {
    event.preventDefault();
    if (!isDistributionManager) {
      setToast({ open: true, message: '유통지원 권한이 없어 등록할 수 없습니다.', type: 'error' });
      return;
    }

    const title = String(distributionForm.title || '').trim();
    const price = Math.max(0, Math.trunc(Number(distributionForm.price || 0)));
    const quantity = distributionForm.unlimitedStock ? 999999 : Math.max(0, Math.trunc(Number(distributionForm.quantity || 0)));
    const type = String(distributionForm.category || 'food').trim().toLowerCase();
    const visibility = String(distributionForm.visibility || 'public').trim().toLowerCase();
    const resolvedRegionId = String(userData?.regionId || userData?.region_id || '').trim() || null;
    const sellerName = String(userData?.name || '').trim() || '판매자';

    if (!title) {
      setToast({ open: true, message: '상품명을 입력해 주세요.', type: 'error' });
      return;
    }

    if (!DISTRIBUTION_TYPE_KEYS.has(type)) {
      setToast({ open: true, message: '카테고리를 다시 선택해 주세요.', type: 'error' });
      return;
    }

    try {
      setDistributionSaving(true);
      let mainImageUrl = String(distributionForm.imageUrl || '').trim();
      let extraImageUrls = Array.isArray(distributionForm.extraImageUrls) ? [...distributionForm.extraImageUrls] : [];
      let pdfUrl = String(distributionForm.pdfUrl || '').trim();

      if (distributionMainFile) {
        const uploadedMain = await storageAdapter.uploadSupplyMedia(distributionMainFile);
        mainImageUrl = String(uploadedMain?.mediaUrl || mainImageUrl || '').trim();
      }

      if (distributionExtraFiles.length > 0) {
        const uploadResults = await Promise.all(
          distributionExtraFiles.map((f) => storageAdapter.uploadSupplyMedia(f))
        );
        const newUrls = uploadResults.map((r) => String(r?.mediaUrl || '').trim()).filter(Boolean);
        extraImageUrls = [...extraImageUrls, ...newUrls].slice(0, 3);
      }

      if (distributionPdfFile) {
        const uploadedPdf = await storageAdapter.uploadSupplyMedia(distributionPdfFile);
        pdfUrl = String(uploadedPdf?.mediaUrl || pdfUrl || '').trim();
      }

      const payload = {
        title,
        description: String(distributionForm.description || '').trim(),
        type,
        status: visibility === 'hidden'
          ? 'hidden'
          : String(distributionForm.status || 'available').trim().toLowerCase(),
        price,
        quantity,
        imageUrl: mainImageUrl || null,
        regionId: resolvedRegionId,
        createdBy: String(effectiveUserId || ''),
        uploadMeta: {
          productType: String(distributionForm.productType || 'general').trim(),
          receiveMethod: String(distributionForm.receiveMethod || 'delivery').trim(),
          visibility,
          featured: !!distributionForm.featured,
          todayDeal: !!distributionForm.todayDeal,
          unlimitedStock: !!distributionForm.unlimitedStock,
          videoUrl: String(distributionForm.videoUrl || '').trim(),
          extraImageUrls: extraImageUrls.filter(Boolean),
          pdfUrl: pdfUrl || '',
          sellerIntro: String(distributionForm.sellerIntro || '').trim(),
          sellerId: String(effectiveUserId || ''),
          sellerName,
          regionId: resolvedRegionId,
        },
      };

      if (editingDistributionId) {
        await storageAdapter.updateSupply(editingDistributionId, payload);
      } else {
        await storageAdapter.createSupply(payload);
      }

      setDistributionFormOpen(false);
      resetDistributionForm();
      setToast({ open: true, message: editingDistributionId ? '상품 정보가 수정되었습니다.' : '유통 상품이 등록되었습니다.', type: 'success' });
      window.dispatchEvent(new CustomEvent('su:ssot:changed', { detail: { type: 'supplies', operation: 'upsert' } }));
      window.dispatchEvent(new Event('supply:updated'));
    } catch (error) {
      setToast({ open: true, message: error?.message || '상품 저장 중 오류가 발생했습니다.', type: 'error' });
    } finally {
      setDistributionSaving(false);
    }
  };

  const handleDistributionStatus = async (item, nextStatus) => {
    try {
      await storageAdapter.updateSupply(item.id, { status: nextStatus });
      setToast({ open: true, message: `상품 상태를 ${DISTRIBUTION_STATUS_LABELS[nextStatus] || nextStatus}(으)로 변경했습니다.`, type: 'success' });
      window.dispatchEvent(new Event('su:ssot:changed'));
      window.dispatchEvent(new Event('supply:updated'));
    } catch (error) {
      setToast({ open: true, message: error?.message || '상태 변경에 실패했습니다.', type: 'error' });
    }
  };

  const handleDistributionDelete = async (itemId) => {
    if (!window.confirm('이 유통 상품을 삭제하시겠습니까?')) return;
    try {
      await storageAdapter.deleteSupply(itemId);
      setToast({ open: true, message: '상품이 삭제되었습니다.', type: 'success' });
      window.dispatchEvent(new Event('su:ssot:changed'));
      window.dispatchEvent(new Event('supply:updated'));
    } catch (error) {
      setToast({ open: true, message: error?.message || '상품 삭제에 실패했습니다.', type: 'error' });
    }
  };

  const parseMyOrderMessageMeta = (message) => {
    const raw = String(message || "");
    const addressMatch = raw.match(/배송지:([^|]+)/);
    const visitMatch = raw.match(/방문:([^|]+)/);
    return {
      address: addressMatch ? String(addressMatch[1]).trim() : "",
      visit: visitMatch ? String(visitMatch[1]).trim() : "",
    };
  };

  const handleDistributionManagedStatus = async (requestRow, updates, successMessage) => {
    const requestId = requestRow?.id || requestRow?.requestId;
    if (!requestId) return;
    try {
      await storageAdapter.updateSupplyRequest(requestId, updates);
      setToast({ open: true, message: successMessage || '주문 상태를 변경했습니다.', type: 'success' });
      window.dispatchEvent(new Event('su:ssot:changed'));
      window.dispatchEvent(new Event('supply:updated'));
    } catch (error) {
      setToast({ open: true, message: error?.message || '주문 상태 변경에 실패했습니다.', type: 'error' });
    }
  };

  const handleMyItemEdit = (item) => {
    const id = item.id;
    setEditingMyItemId(id);
    setEditMyForm({
      title: item.title || '',
      description: item.description || '',
      quantity: item.quantity ?? 0,
      status: item.status || 'available'
    });
  };

  const handleMyItemSave = async (itemId) => {
    try {
      const res = await fetch(`/api/supplies/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editMyForm)
      });
      if (!res.ok) throw new Error('저장 실패');
      setEditingMyItemId(null);
      setEditMyForm({});
      window.dispatchEvent(new Event('su:ssot:changed'));
      window.dispatchEvent(new Event('supply:updated'));
      setToast({ open: true, message: '저장되었습니다.', type: 'success' });
    } catch (e) {
      setToast({ open: true, message: e.message, type: 'error' });
    }
  };

  const handleMyItemDelete = async (itemId) => {
    if (!window.confirm('이 보급품을 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/supplies/${itemId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('삭제 실패');
      window.dispatchEvent(new Event('su:ssot:changed'));
      window.dispatchEvent(new Event('supply:updated'));
      setToast({ open: true, message: '삭제되었습니다.', type: 'success' });
    } catch (e) {
      setToast({ open: true, message: e.message, type: 'error' });
    }
  };

  const handleMyItemSetStatus = async (item, next) => {
    if (item.status === next) return;
    const LABELS = { available: '활성화', scheduled: '신청예정' };
    try {
      const res = await fetch(`/api/supplies/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next })
      });
      if (!res.ok) throw new Error('변경 실패');
      window.dispatchEvent(new Event('su:ssot:changed'));
      window.dispatchEvent(new Event('supply:updated'));
      setToast({ open: true, message: `${LABELS[next] || next} 상태로 변경했습니다.`, type: 'success' });
    } catch (e) {
      setToast({ open: true, message: e.message, type: 'error' });
    }
  };

  const handleCompleteRequest = async (reqId) => {
    if (!reqId) return;
    if (!window.confirm('이 신청을 완료 처리하시겠습니까?')) return;
    try {
      console.log('[My] handleCompleteRequest - reqId:', reqId);
      const url = `/api/supply-requests/${reqId}/complete`;
      console.log('[My] handleCompleteRequest - URL:', url);
      
      const res = await fetch(url, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('[My] handleCompleteRequest - status:', res.status);
      
      if (!res.ok) {
        const text = await res.text();
        console.error('[My] handleCompleteRequest - error response:', text);
        throw new Error(`API failed: ${res.status} ${text}`);
      }
      
      const data = await res.json();
      console.log('[My] handleCompleteRequest - success:', data);
      
      // ✅ Optimistic update
      setManagedRequests(prev => (prev || []).map(r => 
        r.id === reqId ? { ...r, status: 'COMPLETED', completedAt: data.updated?.completedAt || new Date().toISOString() } : r
      ));
      
      setToast({ open: true, message: '완료 처리되었습니다. 신청자의 구매내역으로 이동합니다.', type: 'success' });
      
      // ✅ SSOT trigger: 신청자 MyOffice도 즉시 갱신
      window.dispatchEvent(new Event('su:ssot:changed'));
      window.dispatchEvent(new Event('supply:updated'));
    } catch (e) {
      console.error('[My] handleCompleteRequest failed:', e);
      setToast({ open: true, message: '완료 처리에 실패했습니다.', type: 'error' });
    }
  };

  // ── 명함 관련 (신버전: CardPage 이동 방식) ──
  const [showCardCreate, setShowCardCreate] = useState(false);
  const [showNoCardConfirm, setShowNoCardConfirm] = useState(false);
  const [cardCheckLoading, setCardCheckLoading] = useState(false);

  const handleMyCardClick = async () => {
    if (!currentUserId) return;
    try {
      setCardCheckLoading(true);
      const card = await storageAdapter.fetchUserCard(currentUserId);
      if (card?.cardSlug) {
        navigate(`/card/${card.cardSlug}`);
      } else {
        setShowNoCardConfirm(true);
      }
    } catch {
      setShowNoCardConfirm(true);
    } finally {
      setCardCheckLoading(false);
    }
  };

  // ── 구버전 business card state (미사용, 유지) ──
  const [cardData, setCardData] = useState({ name: '', title: '', phone: '', email: '', company: '' });
  const [qrSrc, setQrSrc] = useState('');
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardCreated, setCardCreated] = useState(null);

  const CARD_STORAGE_KEY = 'su_business_card_v1';

  const loadCardFromStorage = () => {
    try {
      const raw = localStorage.getItem(CARD_STORAGE_KEY) || '{}';
      const all = JSON.parse(raw || '{}') || {};
      const key = String(effectiveUserId || currentUserId || userData?.id || userData?.memberId || 'guest');
      const rec = all[key] || null;
      setCardCreated(rec);
      if (rec) {
        setCardData({ name: rec.name || '', title: rec.title || '', phone: rec.phone || '', email: rec.email || '', company: rec.company || '' });
        setQrSrc(rec.qr || '');
      }
    } catch (e) {
      // noop
    }
  };

  const saveCardToStorage = (rec) => {
    try {
      const raw = localStorage.getItem(CARD_STORAGE_KEY) || '{}';
      const all = JSON.parse(raw || '{}') || {};
      const key = String(effectiveUserId || currentUserId || userData?.id || userData?.memberId || 'guest');
      all[key] = rec;
      localStorage.setItem(CARD_STORAGE_KEY, JSON.stringify(all));
      setCardCreated(rec);
    } catch (e) {
      // noop
    }
  };

  const shareCard = async () => {
    try {
      if (!cardCreated || !cardCreated.image) {
        alert('생성된 명함이 없습니다. 먼저 명함을 생성하세요.');
        return;
      }
      // try Web Share API with blob
      if (navigator.share) {
        // convert dataURL to blob
        const res = await fetch(cardCreated.image);
        const blob = await res.blob();
        const file = new File([blob], `${(cardCreated.name||'card').replace(/\s+/g,'_')}.png`, { type: blob.type });
        await navigator.share({ files: [file], title: cardCreated.name || '명함' });
        return;
      }
      // fallback: copy data URL to clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(cardCreated.image);
        alert('명함 이미지 데이터 URL을 클립보드에 복사했습니다. 메신저에 붙여넣기 하세요.');
        return;
      }
      alert('공유 불가: 브라우저가 Web Share 또는 클립보드 API를 지원하지 않습니다.');
    } catch (e) {
      alert('공유 실패: ' + String(e || ''));
    }
  };

  const deleteCard = () => {
    if (!cardCreated) return;
    if (!window.confirm('명함을 삭제하시겠습니까?')) return;
    try {
      const raw = localStorage.getItem(CARD_STORAGE_KEY) || '{}';
      const all = JSON.parse(raw || '{}') || {};
      const key = String(effectiveUserId || currentUserId || userData?.id || userData?.memberId || 'guest');
      delete all[key];
      localStorage.setItem(CARD_STORAGE_KEY, JSON.stringify(all));
      setCardCreated(null);
      setCardData({ name: '', title: '', phone: '', email: '', company: '' });
      setQrSrc('');
    } catch (e) {}
  };

  useEffect(() => {
    loadCardFromStorage();
    // also reload when userData changes
  }, [effectiveUserId, currentUserId, userData?.id]);

  // authReady 전역 게이트 (간단한 로컬 flag)
  const [authReadyFlag, setAuthReadyFlag] = useState(isAuthReady());
  useEffect(() => {
    const onAuth = () => setAuthReadyFlag(isAuthReady());
    window.addEventListener('su:auth:changed', onAuth);
    setAuthReadyFlag(isAuthReady());
    return () => window.removeEventListener('su:auth:changed', onAuth);
  }, []);

  // load supply data for current user
  // 🔍 Issue #3: Load supply data for current user
  useEffect(() => {
    let mounted = true;
    async function loadSupply() {
      try {
        if (!authReadyFlag) {
          // auth 준비 전에는 서버 호출을 하지 않음
          if (mounted) setSupplyData({ requests: [], purchases: [] });
          return;
        }
        if (!effectiveUserId) {
          // ✅ 로딩 완료: 빈 배열로 설정
          if (mounted) setSupplyData({ requests: [], purchases: [] });
          return;
        }
        
        // 🔍 Issue #3 FIX: Load from supply_requests table, not supplies table
        const requestsRes = await fetch(`${import.meta.env.VITE_API_BASE || ''}/api/supply-requests?requesterId=${effectiveUserId}`, {
          credentials: 'include'
        });
        const requestsData = await requestsRes.json();
        const requests = Array.isArray(requestsData?.requests) ? requestsData.requests : [];
        
        // Keep offers loading for supply manager
        const ofs = await supplyService.getOffers(effectiveUserId);
        
        if (mounted) {
          // ✅ 로딩 완료: 데이터 설정
          setSupplyData({ requests, purchases: [] }); // 🔍 requests from supply_requests table
          setOffers(Array.isArray(ofs) ? ofs : []);
          console.log('[My] Supply requests loaded:', requests.length);
        }
      } catch (e) {
        console.error('[My] failed to load supplies (SSOT):', e);
        if (mounted) {
          setSupplyData({ requests: [], purchases: [] });
          try { setToast({ open: true, message: '보급지원을 불러오지 못했습니다. (서버)', type: 'error' }); } catch (err) {}
        }
      }
    }
    loadSupply();
    const onUpdate = () => { loadSupply(); };
    window.addEventListener('supply:updated', onUpdate);
    window.addEventListener('su:ssot:changed', onUpdate);
    return () => { 
      mounted = false; 
      window.removeEventListener('supply:updated', onUpdate); 
      window.removeEventListener('su:ssot:changed', onUpdate);
    };
  }, [effectiveUserId]);

  // generate QR data (vCard) and set qrSrc using Google Chart API
  const generateQr = () => {
    try {
      const name = (cardData.name || userData?.name || '').trim();
      const title = (cardData.title || '').trim();
      const phone = (cardData.phone || userData?.phone || '').trim();
      const email = (cardData.email || userData?.email || '').trim();
      const company = (cardData.company || '').trim();
      const address = (cardData.address || '').trim();
      const website = (cardData.website || '').trim();

      // Use SSOT public card URL (no query-params based card)
      const publicCardId = (effectiveUserId || '').toString();
      const cardUrl = (typeof window !== 'undefined' ? window.location.origin : '') + '/cards/' + encodeURIComponent(publicCardId);
  // Use api.qrserver.com as a reliable QR image generator (cross-origin friendly)
  // Use 400x400 for mobile-friendly scanning
  const src = 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=' + encodeURIComponent(cardUrl);
      setQrSrc(src);
    } catch (e) {
      setQrSrc('');
    }
  };

  // generate card image dataUrl (used for saving/displaying) - similar to downloadCard but returns dataURL
  const generateCardImage = async () => {
    try {
      if (!qrSrc) generateQr();
      const qrUrl = qrSrc || ('https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent((cardData.name||userData?.name||'') || ''));
      const resp = await fetch(qrUrl);
      const blob = await resp.blob();
      let imgBitmap = null;
      if (window.createImageBitmap) {
        imgBitmap = await createImageBitmap(blob);
      }
      const canvas = document.createElement('canvas');
      canvas.width = 1000;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle = '#111827';
      ctx.font = '36px sans-serif';
      ctx.fillText(cardData.name || userData?.name || '', 40, 120);
      ctx.font = '20px sans-serif';
      if (cardData.title) ctx.fillText(cardData.title, 40, 160);
      if (cardData.company) ctx.fillText(cardData.company, 40, 200);
      ctx.font = '18px sans-serif';
      if (cardData.phone || userData?.phone) ctx.fillText('T: ' + (cardData.phone || userData?.phone || ''), 40, 260);
      if (cardData.email || userData?.email) ctx.fillText('E: ' + (cardData.email || userData?.email || ''), 40, 300);
  // draw address and website when present
  if (cardData.address) ctx.fillText('A: ' + cardData.address, 40, 340);
  if (cardData.website) ctx.fillText('W: ' + cardData.website, 40, 380);
      const qrSize = 320;
      const qrX = canvas.width - qrSize - 40;
      const qrY = 40;
      if (imgBitmap) {
        ctx.drawImage(imgBitmap, qrX, qrY, qrSize, qrSize);
      } else {
        const url = URL.createObjectURL(blob);
        const img = new Image();
        await new Promise((resolve) => {
          img.onload = () => { ctx.drawImage(img, qrX, qrY, qrSize, qrSize); URL.revokeObjectURL(url); resolve(); };
          img.onerror = () => { URL.revokeObjectURL(url); resolve(); };
          img.src = url;
        });
      }
      return canvas.toDataURL('image/png');
    } catch (e) {
      return null;
    }
  };

  // download card as PNG by fetching QR image blob and drawing to canvas
  const downloadCard = async () => {
    try {
      const name = (cardData.name || userData?.name || '명함');
      // ensure QR exists
      if (!qrSrc) generateQr();
      const qrUrl = qrSrc || ('https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=' + encodeURIComponent((cardData.name||userData?.name||'') || ''));
      const resp = await fetch(qrUrl);
      const blob = await resp.blob();
      let imgBitmap = null;
      if (window.createImageBitmap) {
        imgBitmap = await createImageBitmap(blob);
      }
      const canvas = document.createElement('canvas');
      canvas.width = 1000;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      // background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      // left text area
      ctx.fillStyle = '#111827';
      ctx.font = '36px sans-serif';
      ctx.fillText(cardData.name || userData?.name || '', 40, 120);
      ctx.font = '20px sans-serif';
      if (cardData.title) ctx.fillText(cardData.title, 40, 160);
      if (cardData.company) ctx.fillText(cardData.company, 40, 200);
      ctx.font = '18px sans-serif';
      if (cardData.phone || userData?.phone) ctx.fillText('T: ' + (cardData.phone || userData?.phone || ''), 40, 260);
      if (cardData.email || userData?.email) ctx.fillText('E: ' + (cardData.email || userData?.email || ''), 40, 300);
  // draw address/website for download preview (ensure included)
  if (cardData.address) ctx.fillText('A: ' + cardData.address, 40, 340);
  if (cardData.website) ctx.fillText('W: ' + cardData.website, 40, 380);
  // draw QR on right
      const qrSize = 320;
      const qrX = canvas.width - qrSize - 40;
      const qrY = 40;
      if (imgBitmap) {
        ctx.drawImage(imgBitmap, qrX, qrY, qrSize, qrSize);
      } else {
        // fallback: create object URL image
        const url = URL.createObjectURL(blob);
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = () => { ctx.drawImage(img, qrX, qrY, qrSize, qrSize); URL.revokeObjectURL(url); resolve(); };
          img.onerror = (e) => { URL.revokeObjectURL(url); resolve(); };
          img.src = url;
        });
      }
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${(cardData.name || userData?.name || 'businesscard').replace(/\s+/g,'_')}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      try { alert('명함 다운로드 실패: ' + String(e || '')); } catch (err) {}
    }
  };

  // render schedule modal
  const renderScheduleModal = () => {
    if (!scheduleModalOpen) return null;

    const onChange = (key) => (e) => setScheduleForm(prev => ({ ...prev, [key]: e.target.value }));

    const onSave = async () => {
      setScheduleError("");
      if (!scheduleForm.title) {
        setScheduleError("제목을 입력하세요");
        return;
      }
      if (!currentUserId) {
        setScheduleError("사용자 정보가 없습니다. 다시 로그인 후 시도하세요.");
        return;
      }
      try {
        const payload = { title: scheduleForm.title, date: scheduleForm.date, time: scheduleForm.time, alarm: !!scheduleForm.alarm };
        if (editingSchedule && editingSchedule.id) {
          await scheduleService.updateSchedule(editingSchedule.id, payload);
        } else {
          await scheduleService.addSchedule(currentUserId, payload);
        }
        const list = await scheduleService.getSchedules(currentUserId);
        setSchedules(Array.isArray(list) ? list : []);
        setScheduleModalOpen(false);
        setEditingSchedule(null);
        setScheduleForm({ title: "", date: "", time: "", alarm: false });
      } catch (e) {
        setScheduleError(String(e || "저장 중 오류가 발생했습니다"));
      }
    };

    const onCancel = () => {
      setScheduleModalOpen(false);
      setEditingSchedule(null);
      setScheduleForm({ title: "", date: "", time: "" });
      setScheduleError("");
    };

    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: 20 }}>
        <div className="su-modal su-modal--sm">
          <div className="su-modalHeader">{editingSchedule ? '일정 수정' : '일정 추가'}</div>
          <input
            placeholder="제목"
            value={scheduleForm.title}
            onChange={onChange('title')}
            className="su-input"
            style={{ width: '100%', marginBottom: 12 }}
          />
          <input
            type="date"
            value={scheduleForm.date}
            onChange={onChange('date')}
            className="su-input"
            style={{ width: '100%', marginBottom: 12, fontSize: 16, minHeight: 48 }}
          />
          <input
            type="time"
            value={scheduleForm.time}
            onChange={onChange('time')}
            className="su-input"
            style={{ width: '100%', marginBottom: 12, fontSize: 16, minHeight: 48 }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <input type="checkbox" checked={!!scheduleForm.alarm} onChange={(e) => setScheduleForm(prev => ({ ...prev, alarm: e.target.checked }))} />
            <span style={{ fontSize: 14 }}>알림 설정 (당일 알림)</span>
          </label>
          {scheduleError && <div style={{ color: '#EF4444', marginBottom: 12, fontSize: 13 }}>{scheduleError}</div>}
          <div className="su-modalFooter">
            <button type="button" onClick={onCancel} className="su-btnGhost" style={{ whiteSpace: 'nowrap' }}>취소</button>
            <button type="button" onClick={onSave} className="su-primaryBtn" style={{ whiteSpace: 'nowrap' }}>{editingSchedule ? '저장' : '추가'}</button>
          </div>
        </div>
      </div>
    );
  };

  // render offer modal for supply registration/edit
  const renderOfferModal = () => {
    if (!showOfferModal) return null;
    const onFileChange = async (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => setOfferForm(prev => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(f);
    };

    const onSave = async () => {
      setOfferError('');
      if (!offerForm.item) { setOfferError('물품명을 입력하세요'); return; }
      try {
        if (editingOfferId) {
          await supplyService.updateOffer(editingOfferId, offerForm);
          window.alert('보급품이 수정되었습니다');
        } else {
          await supplyService.addOffer(effectiveUserId, offerForm);
          window.alert('보급품이 등록되었습니다');
        }
        const ofs = await supplyService.getOffers(effectiveUserId);
        setOffers(Array.isArray(ofs) ? ofs : []);
        setOfferForm({ item: '', manager: userData?.name || '', contact: userData?.phone || '', price: '', detail: '', image: '' });
        setEditingOfferId(null);
        setShowOfferModal(false);
      } catch (e) { setOfferError('저장 실패'); }
    };

    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
        <div className="su-modal su-modal--lg">
          <div className="su-modalHeader">{editingOfferId ? '보급품 수정' : '보급품 등록'}</div>
          <div style={{ display: 'grid', gap: 8 }}>
            <input placeholder="물품명" value={offerForm.item} onChange={(e) => setOfferForm(prev => ({ ...prev, item: e.target.value }))} className="su-input" style={{ width: '100%' }} />
            <input placeholder="담당자명" value={offerForm.manager} onChange={(e) => setOfferForm(prev => ({ ...prev, manager: e.target.value }))} className="su-input" style={{ width: '100%' }} />
            <input placeholder="연락처" value={offerForm.contact} onChange={(e) => setOfferForm(prev => ({ ...prev, contact: e.target.value }))} className="su-input" style={{ width: '100%' }} />
            <input placeholder="가격" value={offerForm.price} onChange={(e) => setOfferForm(prev => ({ ...prev, price: e.target.value }))} className="su-input" style={{ width: '100%' }} />
            <textarea placeholder="상세 설명" value={offerForm.detail} onChange={(e) => setOfferForm(prev => ({ ...prev, detail: e.target.value }))} className="su-input" style={{ width: '100%' }} />
            <input type="file" accept="image/*" onChange={onFileChange} />
            {offerForm.image ? (
              <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(148,163,184,0.24)', background: '#f8fafc' }}>
                <div style={{ padding: '10px 12px', fontSize: 12, fontWeight: 800, color: '#0f766e', borderBottom: '1px solid rgba(148,163,184,0.18)' }}>이미지 미리보기</div>
                <img src={offerForm.image} alt="보급품 미리보기" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', display: 'block' }} />
              </div>
            ) : null}
            {offerError && <div style={{ color: '#EF4444' }}>{offerError}</div>}
          </div>
          <div className="su-modalFooter">
            <button type="button" onClick={() => { setShowOfferModal(false); setEditingOfferId(null); }} className="su-btnGhost" style={{ whiteSpace: 'nowrap' }}>취소</button>
            <button type="button" onClick={onSave} className="su-primaryBtn" style={{ whiteSpace: 'nowrap', minWidth: 70 }}>{editingOfferId ? '수정 저장' : '등록'}</button>
          </div>
        </div>
      </div>
    );
  };

  // render payout request modal (상점 지급요청)
  const renderPayoutModal = () => {
    if (!payoutModalOpen) return null;
    const onChange = (key) => (e) => setPayoutForm(prev => ({ ...prev, [key]: e.target.value }));

    const onSave = async () => {
      try {
        const ownerId = currentUserId;
        const storeId = activeShopId;
        const amount = parseInt(payoutForm.amount, 10) || 0;
        if (!storeId) { alert('요청할 상점이 선택되어 있지 않습니다.'); return; }
        if (!ownerId) { alert('사용자 정보가 없습니다. 로그인 후 시도하세요.'); return; }
        if (!amount || amount <= 0) { alert('유효한 금액을 입력하세요.'); return; }
        // 지급요청 직전 최신 가용잔액 재조회
        let latestAvailable = shopAvailable;
        try {
          const pointsData = await shopStore.loadShopPointsData(storeId);
          latestAvailable = pointsData.available || 0;
        } catch (e) {
          // ignore, fallback to 기존 값
        }
        if (amount > latestAvailable) { alert('요청 금액이 최신 가용 잔액을 초과합니다.'); return; }
        if (!payoutForm.bankName || !payoutForm.accountNumber || !payoutForm.depositorName) { alert('은행명, 계좌번호, 예금주를 입력하세요.'); return; }

        const store = (ownedShops || []).find(s => String(s.id) === String(storeId));
        const storeName = store ? store.name : '';
        const ownerName = userData?.name || '';

        const res = await shopStore.createPayoutRequest({ storeId, ownerMemberId: ownerId, amount, bankName: payoutForm.bankName, accountNumber: payoutForm.accountNumber, depositorName: payoutForm.depositorName, storeName, ownerName, memo: payoutForm.memo || '' });
        if (!res || !res.success) {
          alert('지급요청에 실패했습니다: ' + (res && res.error ? res.error : 'unknown'));
          return;
        }

        // close modal and reset
        setPayoutModalOpen(false);
        setPayoutForm({ amount: '', bankName: '', accountNumber: '', depositorName: '', memo: '' });
        // SSOT refetch
        try {
          const pointsData = await shopStore.loadShopPointsData(storeId);
          setShopEarned(pointsData.earned || 0);
          setShopAvailable(pointsData.available || 0);
          setShopLedger(pointsData.ledger || []);
          const allReqs = await shopStore.loadAllPayoutRequests(storeId);
          const sortedReqs = (allReqs || []).sort((a,b) => {
            try { return new Date(b.requestedAt || b.requested_at) - new Date(a.requestedAt || a.requested_at); } catch(e) { return 0; }
          });
          setPayoutRequests(sortedReqs);
          setPayoutRequests(sortedReqs.slice(0,4));
        } catch (e) {}
        setCustomAlert({ open: true, message: '지급요청이 등록되었습니다. 관리자의 확인을 기다려주세요.' });
      } catch (e) {
        console.error(e);
        setCustomAlert({ open: true, message: '지급요청 처리 중 오류가 발생했습니다.' });
      }
    };

    const onCancel = () => {
      setPayoutModalOpen(false);
      setPayoutForm({ amount: '', bankName: '', accountNumber: '', depositorName: '', memo: '' });
    };

    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300 }}>
        <div className="su-modal su-modal--sm">
          <div className="su-modalHeader">지급 요청</div>
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ fontSize: 13, color: 'var(--c-tx-s)' }}>상점 선택</div>
            <select
              value={activeShopId || ''}
              onChange={(e) => setActiveShopId(e.target.value || null)}
              className="su-input"
              style={{ width: '100%' }}
            >
              <option value="" disabled>상점을 선택하세요</option>
              {(ownedShops || []).map((s, idx) => (
                <option key={s.id || `shop-dropdown-${idx}`} value={s.id}>{s.name || s.id}</option>
              ))}
            </select>
            <input placeholder="요청 금액 (포인트)" value={payoutForm.amount} onChange={onChange('amount')} type="number" className="su-input" style={{ width: '100%' }} />
            <input placeholder="은행명" value={payoutForm.bankName} onChange={onChange('bankName')} className="su-input" style={{ width: '100%' }} />
            <input placeholder="계좌번호" value={payoutForm.accountNumber} onChange={onChange('accountNumber')} className="su-input" style={{ width: '100%' }} />
            <input placeholder="예금주" value={payoutForm.depositorName} onChange={onChange('depositorName')} className="su-input" style={{ width: '100%' }} />
            <input placeholder="메모 (선택)" value={payoutForm.memo || ''} onChange={onChange('memo')} className="su-input" style={{ width: '100%' }} />
          </div>
          <div className="su-modalFooter">
            <button type="button" onClick={onCancel} className="su-btnGhost" style={{ whiteSpace: 'nowrap', minWidth: 80 }}>취소</button>
            <button type="button" onClick={onSave} disabled={!activeShopId} className="su-primaryBtn" style={{ whiteSpace: 'nowrap', minWidth: 80, opacity: !activeShopId ? 0.4 : 1 }}>요청</button>
          </div>
        </div>
      </div>
    );
  };

  // render modal that shows ALL payout requests with filter
  const renderAllPayoutsModal = () => {
    if (!allPayoutsModalOpen) return null;
    const storeId = activeShopId;
    const all = (payoutRequests || []).slice();
    // apply filter
    const filtered = all.filter(r => {
      if (!r) return false;
      if (payoutListFilter === 'ALL') return true;
      if (payoutListFilter === 'PENDING') return String(r.status).toUpperCase() === 'PENDING';
      if (payoutListFilter === 'PAID') return String(r.status).toUpperCase() === 'PAID';
      return true;
    });

    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1400 }}>
        <div className="su-modal su-modal--md" style={{ display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}>
          {/* ✅ UPDATE: flex-wrap:nowrap, white-space:nowrap 추가 (모바일 버튼 줄바꿈 방지) */}
          <div className="su-modalHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'nowrap' }}>
            <span style={{ whiteSpace: 'nowrap' }}>지급요청 전체 목록</span>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'nowrap' }}>
              <button onClick={() => setPayoutListFilter('ALL')} className={payoutListFilter==='ALL' ? 'su-chip is-active' : 'su-chip'} style={{ whiteSpace: 'nowrap', fontSize: 12 }}>전체</button>
              <button onClick={() => setPayoutListFilter('PENDING')} className={payoutListFilter==='PENDING' ? 'su-chip is-active' : 'su-chip'} style={{ whiteSpace: 'nowrap', fontSize: 12 }}>지급신청중</button>
              <button onClick={() => setPayoutListFilter('PAID')} className={payoutListFilter==='PAID' ? 'su-chip is-active' : 'su-chip'} style={{ whiteSpace: 'nowrap', fontSize: 12 }}>지급완료</button>
            </div>
          </div>
          <div style={{ overflowY: 'auto', flex: 1, display: 'grid', gap: 8, padding: '8px 0' }}>
            {filtered.length === 0 ? (
              <div style={{ color: 'var(--c-tx-s)' }}>조회된 요청이 없습니다.</div>
            ) : (
              filtered.map((r, idx) => {
                // ✅ FIX: requestedAt 안전 처리 (Invalid Date 방지)
                const dateRaw = r.requestedAt || r.requested_at || r.createdAt || r.created_at;
                const dateObj = dateRaw ? new Date(dateRaw) : null;
                const dateStr = (dateObj && !isNaN(dateObj.getTime())) ? dateObj.toLocaleString() : '날짜 미상';
                return (
                  <div key={r.id || `filtered-${idx}`} className="su-listItem" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dateStr} · {formatNumber(r.amount)} P</div>
                    <div style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>{statusLabel(r.status)}</div>
                  </div>
                );
              })
            )}
          </div>
          <div className="su-modalFooter">
            <button onClick={() => setAllPayoutsModalOpen(false)} className="su-btnGhost">닫기</button>
          </div>
        </div>
      </div>
    );
  };

  // render shop edit modal (SSOT: PUT + refetch)
  const renderShopEditModal = () => {
    if (!shopEditOpen || !shopEditTarget) return null;

    const onChange = (key) => (e) => {
      const v = key === 'isPublic' ? e.target.checked
              : key === 'regionId' ? (e.target.value || null)
              : e.target.value;
      setShopEditForm(prev => ({ ...prev, [key]: v }));
    };

    const onCancel = () => {
      setShopEditOpen(false);
      setShopEditTarget(null);
    };

    const onSave = async () => {
      try {
        if (!effectiveUserId) {
          alert('로그인이 필요합니다.');
          return;
        }
        const shopId = String(shopEditTarget.id || shopEditTarget.shopId || '');
        if (!shopId) {
          alert('상점 ID가 올바르지 않습니다.');
          return;
        }
        if (!shopEditForm.name || !String(shopEditForm.name).trim()) {
          alert('상점명을 입력하세요.');
          return;
        }

        const payload = {
          name: String(shopEditForm.name).trim(),
          category: String(shopEditForm.category || ''),
          regionId: shopEditForm.regionId || null,
          address: String(shopEditForm.address || ''),
          phone: String(shopEditForm.phone || ''),
          description: String(shopEditForm.description || ''),
          hours: String(shopEditForm.hours || ''),
          isPublic: !!shopEditForm.isPublic,
        };

        const res = await storageAdapter.updateShop(shopId, payload, String(effectiveUserId));
        if (!(res && (res.ok === true || res.success === true))) {
          alert('상점 수정에 실패했습니다. (서버)');
          return;
        }

        // refetch shops
        const myShops = await getMyShops(effectiveUserId);
        setOwnedShops(myShops || []);

        // keep selection stable
        try {
          const exists = (myShops || []).some(s => String(s.id) === String(activeShopId));
          if (!exists) {
            const next = (myShops && myShops[0]) ? myShops[0].id : null;
            setActiveShopId(next);
          }
        } catch (e) {}

        // refetch points panel for selected shop
        try {
          const sel = activeShopId || shopId;
          if (sel) {
            const pointsData = await shopStore.loadShopPointsData(sel);
            setShopEarned(pointsData.earned || 0);
            setShopAvailable(pointsData.available || 0);
            setShopLedger(pointsData.ledger || []);
          }
        } catch (e) {}

        window.dispatchEvent(new CustomEvent('su:ssot:changed', { detail: { type: 'shops', operation: 'update', shopId } }));

        setShopEditOpen(false);
        setShopEditTarget(null);
        alert('상점 정보가 수정되었습니다.');
      } catch (e) {
        console.error('[My] updateShop failed:', e);
        alert('상점 수정 중 오류가 발생했습니다.');
      }
    };

    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1450 }}>
        <div className="su-modal su-modal--md">
          <div className="su-modalHeader">상점 수정</div>
          <div style={{ display: 'grid', gap: 8 }}>
            <input placeholder="상점명" value={shopEditForm.name} onChange={onChange('name')} className="su-input" style={{ width: '100%' }} />
            <input placeholder="카테고리" value={shopEditForm.category} onChange={onChange('category')} className="su-input" style={{ width: '100%' }} />
            <select value={shopEditForm.regionId != null ? String(shopEditForm.regionId) : ''} onChange={onChange('regionId')} className="su-input" style={{ width: '100%' }}>
              <option value="">지역 선택</option>
              {shopRegions.map(r => <option key={r.id} value={String(r.id)}>{r.name}</option>)}
            </select>
            <input placeholder="주소" value={shopEditForm.address} onChange={onChange('address')} className="su-input" style={{ width: '100%' }} />
            <input placeholder="전화" value={shopEditForm.phone} onChange={onChange('phone')} className="su-input" style={{ width: '100%' }} />
            <textarea placeholder="설명" value={shopEditForm.description} onChange={onChange('description')} className="su-input" style={{ width: '100%', minHeight: 80 }} />
            <input placeholder="영업시간" value={shopEditForm.hours} onChange={onChange('hours')} className="su-input" style={{ width: '100%' }} />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <input type="checkbox" checked={!!shopEditForm.isPublic} onChange={onChange('isPublic')} />
              공개 상점
            </label>
          </div>
          <div className="su-modalFooter">
            <button type="button" onClick={onCancel} className="su-btnGhost" style={{ whiteSpace: 'nowrap', minWidth: 70 }}>취소</button>
            <button type="button" onClick={onSave} className="su-primaryBtn" style={{ whiteSpace: 'nowrap', minWidth: 70 }}>저장</button>
          </div>
        </div>
      </div>
    );
  };

  // create card action: generate image, save to storage and close modal
  const createCard = async () => {
    try {
      const dataUrl = await generateCardImage();
      if (!dataUrl) {
        alert('명함 생성에 실패했습니다. 다시 시도하세요.');
        return;
      }
      const rec = {
        name: cardData.name || userData?.name || '',
        title: cardData.title || '',
        phone: cardData.phone || userData?.phone || '',
        email: cardData.email || userData?.email || '',
        company: cardData.company || '',
        qr: qrSrc || ('https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(cardData.name || userData?.name || '')),
        image: dataUrl,
        createdAt: Date.now(),
      };
      saveCardToStorage(rec);
      setShowCardModal(false);
      setCardCreated(rec);
      setQrSrc(rec.qr || qrSrc);
      try { alert('명함이 생성되어 저장되었습니다.'); } catch (e) {}
    } catch (e) {
      try { alert('명함 생성 중 오류가 발생했습니다: ' + String(e || '')); } catch (err) {}
    }
  };

  const renderCardModal = () => {
    if (!showCardModal) return null;
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: 20 }}>
        <div className="su-modal su-modal--sm">
          <div className="su-modalHeader">명함 생성</div>
          <input placeholder="이름" value={cardData.name} onChange={(e) => setCardData(prev => ({ ...prev, name: e.target.value }))} className="su-input" style={{ width: '100%', marginBottom: 12 }} />
          <input placeholder="직함" value={cardData.title} onChange={(e) => setCardData(prev => ({ ...prev, title: e.target.value }))} className="su-input" style={{ width: '100%', marginBottom: 12 }} />
          <input placeholder="회사" value={cardData.company} onChange={(e) => setCardData(prev => ({ ...prev, company: e.target.value }))} className="su-input" style={{ width: '100%', marginBottom: 12 }} />
          <input placeholder="전화번호" value={cardData.phone} onChange={(e) => setCardData(prev => ({ ...prev, phone: e.target.value }))} className="su-input" style={{ width: '100%', marginBottom: 12 }} />
          <input placeholder="이메일" value={cardData.email} onChange={(e) => setCardData(prev => ({ ...prev, email: e.target.value }))} className="su-input" style={{ width: '100%', marginBottom: 12 }} />
          <input placeholder="주소 (예: 서울시 강남구)" value={cardData.address} onChange={(e) => setCardData(prev => ({ ...prev, address: e.target.value }))} className="su-input" style={{ width: '100%', marginBottom: 12 }} />
          <input placeholder="웹사이트 (https://)" value={cardData.website} onChange={(e) => setCardData(prev => ({ ...prev, website: e.target.value }))} className="su-input" style={{ width: '100%', marginBottom: 16 }} />
          <div className="su-modalFooter">
            <button type="button" onClick={createCard} className="su-primaryBtn" style={{ whiteSpace: 'nowrap' }}>생성 및 저장</button>
            <button type="button" onClick={() => { setShowCardModal(false); }} className="su-btnGhost" style={{ whiteSpace: 'nowrap' }}>취소</button>
          </div>
        </div>
      </div>
    );
  };

  // ✨ 전체 신청내역 모달
  const renderAllRequestsModal = () => {
    if (!showAllRequestsModal) return null;
    const pendingRequests = supplyRequests.filter(r => r.status === 'PENDING' || r.status === 'REQUESTED');
    
    return (
      <div onClick={() => setShowAllRequestsModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }}>
        <div onClick={e => e.stopPropagation()} className="su-modal su-modal--md">
          <div className="su-modalHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🎁 전체 신청 내역</span>
            <button onClick={() => setShowAllRequestsModal(false)} style={{ background: 'none', border: 'none', fontSize: 24, color: 'var(--c-tx-s)', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ padding: '8px 0', overflowY: 'auto', flex: 1 }}>
            {pendingRequests.length > 0 ? pendingRequests.map((r, idx) => (
              <div key={r.requestId || r.id || `request-${idx}`} className="su-card" style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{r.itemName || r.item || '보급품'}</div>
                <div style={{ fontSize: 12, color: 'var(--c-tx-s)', marginBottom: 6 }}>현재 상태: 확인중입니다</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ padding: '3px 8px', borderRadius: 4, background: 'rgba(234,179,8,0.15)', color: '#b45309', fontWeight: 700 }}>대기중</span>
                  <span style={{ color: 'var(--c-tx-s)' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            )) : <div style={{ textAlign: 'center', color: 'var(--c-tx-s)' }}>신청 내역이 없습니다</div>}
          </div>
        </div>
      </div>
    );
  };

  // ✨ 전체 구매내역 모달
  const renderAllPurchasesModal = () => {
    if (!showAllPurchasesModal) return null;
    const completedRequests = supplyRequests.filter(r => r.status === 'COMPLETED' || r.status === 'DONE' || r.status === 'CONFIRMED');
    const combinedPurchases = [...supplyPurchases, ...completedRequests.map(r => ({
      ...r,
      item: r.itemName || r.item,
      amount: r.amount || 0,
      status: '구매완료'
    }))];
    
    return (
      <div onClick={() => setShowAllPurchasesModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }}>
        <div onClick={e => e.stopPropagation()} className="su-modal su-modal--md">
          <div className="su-modalHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🛒 전체 구매 내역</span>
            <button onClick={() => setShowAllPurchasesModal(false)} style={{ background: 'none', border: 'none', fontSize: 24, color: 'var(--c-tx-s)', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ padding: '8px 0', overflowY: 'auto', flex: 1 }}>
            {combinedPurchases.length > 0 ? combinedPurchases.map((p, idx) => (
              <div key={p.purchaseId || p.id || `purchase-${idx}`} className="su-card" style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{p.item || p.itemName || '보급품'}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <div>
                    {p.amount > 0 && <span style={{ fontWeight: 700, marginRight: 8 }}>{formatNumber(p.amount)}원</span>}
                    <span style={{ padding: '3px 8px', borderRadius: 4, background: 'rgba(34,197,94,0.15)', color: '#15803d', fontWeight: 700 }}>완료</span>
                  </div>
                  <span style={{ color: 'var(--c-tx-s)' }}>{new Date(p.completedAt || p.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            )) : <div style={{ textAlign: 'center', color: 'var(--c-tx-s)' }}>구매 내역이 없습니다</div>}
          </div>
        </div>
      </div>
    );
  };

  const renderDistributionFormModal = () => {
    if (!distributionFormOpen) return null;
    const autoRegionLabel = resolveRegionLabel(userData || {}) || '지역 미설정';
    const autoSellerName = String(userData?.name || '').trim() || '판매자';
    return (
      <div onClick={() => setDistributionFormOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
        <div onClick={event => event.stopPropagation()} className="su-modal su-modal--lg" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
          <div className="su-modalHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{editingDistributionId ? '🛠️ 유통 상품 수정' : '🛍️ 유통 상품 등록'}</span>
            <button onClick={() => setDistributionFormOpen(false)} style={{ background: 'none', border: 'none', fontSize: 22, color: 'var(--c-tx-s)', cursor: 'pointer' }}>✕</button>
          </div>

          <form onSubmit={handleDistributionSave} style={{ display: 'grid', gap: 14 }}>
            <div style={{ padding: 10, borderRadius: 10, border: '1px solid #DDE3EA', background: '#F8FAFC' }}>
              <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8 }}>1. 기본정보</div>
              <div style={{ display: 'grid', gap: 8 }}>
                <input value={distributionForm.title} onChange={(event) => setDistributionForm(prev => ({ ...prev, title: event.target.value }))} placeholder="상품명" className="su-input" required />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <select value={distributionForm.category} onChange={(event) => setDistributionForm(prev => ({ ...prev, category: event.target.value }))} className="su-input">
                    <option value="food">식품</option>
                    <option value="daily">생활용품</option>
                    <option value="health">건강</option>
                    <option value="digital">디지털</option>
                    <option value="appliance">가전</option>
                    <option value="fashion">패션</option>
                    <option value="local-special">지역특산</option>
                    <option value="group-buy">공동구매</option>
                  </select>
                  <select value={distributionForm.productType} onChange={(event) => setDistributionForm(prev => ({ ...prev, productType: event.target.value }))} className="su-input">
                    <option value="general">일반상품</option>
                    <option value="service">서비스</option>
                    <option value="reservation">예약상품</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ padding: 10, borderRadius: 10, border: '1px solid #DDE3EA', background: '#F8FAFC' }}>
              <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8 }}>2. 이미지/영상</div>
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-tx-s)' }}>대표 이미지 (파일 업로드 기본, URL 보조)</div>
                {distributionForm.imageUrl && (
                  <div style={{ marginBottom: 4 }}>
                    <img src={distributionForm.imageUrl} alt="대표" style={{ width: 56, height: 56, borderRadius: 6, objectFit: 'cover', border: '1px solid #DDE3EA' }} />
                  </div>
                )}
                <input type="file" accept="image/*" className="su-input" onChange={(event) => setDistributionMainFile(event.target.files?.[0] || null)} />
                <input value={distributionForm.imageUrl} onChange={(event) => setDistributionForm(prev => ({ ...prev, imageUrl: event.target.value }))} placeholder="대표 이미지 URL (선택)" className="su-input" />

                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-tx-s)' }}>추가 이미지 (최대 3장)</div>
                {distributionForm.extraImageUrls.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {distributionForm.extraImageUrls.map((url, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        <img src={url} alt={`추가${idx + 1}`} style={{ width: 56, height: 56, borderRadius: 6, objectFit: 'cover', border: '1px solid #DDE3EA' }} />
                        <button type="button" onClick={() => setDistributionForm(prev => ({ ...prev, extraImageUrls: prev.extraImageUrls.filter((_, i) => i !== idx) }))} style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', border: 'none', background: '#dc2626', color: '#fff', fontSize: 11, lineHeight: '18px', cursor: 'pointer', padding: 0 }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
                {distributionForm.extraImageUrls.length < 3 && (
                  <input type="file" accept="image/*" multiple className="su-input" onChange={(event) => {
                    const files = Array.from(event.target.files || []);
                    const remaining = 3 - distributionForm.extraImageUrls.length;
                    setDistributionExtraFiles(files.slice(0, remaining));
                  }} />
                )}
                {distributionForm.extraImageUrls.length >= 3 && (
                  <div style={{ fontSize: 11, color: '#92400E' }}>추가 이미지 3장이 모두 등록되었습니다.</div>
                )}

                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-tx-s)' }}>영상 링크 (유튜브/틱톡 URL)</div>
                <input value={distributionForm.videoUrl} onChange={(event) => setDistributionForm(prev => ({ ...prev, videoUrl: event.target.value }))} placeholder="https://..." className="su-input" />

                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-tx-s)' }}>상세정보 PDF (파일 업로드)</div>
                <input type="file" accept=".pdf,application/pdf" className="su-input" onChange={(event) => setDistributionPdfFile(event.target.files?.[0] || null)} />
                {distributionForm.pdfUrl && <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>현재: {distributionForm.pdfUrl}</div>}
              </div>
            </div>

            <div style={{ padding: 10, borderRadius: 10, border: '1px solid #DDE3EA', background: '#F8FAFC' }}>
              <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8 }}>3. 판매정보</div>
              <div style={{ display: 'grid', gap: 8 }}>
                <input type="number" min={0} value={distributionForm.price} onChange={(event) => setDistributionForm(prev => ({ ...prev, price: event.target.value }))} placeholder="가격 (포인트)" className="su-input" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <input type="number" min={0} value={distributionForm.quantity} onChange={(event) => setDistributionForm(prev => ({ ...prev, quantity: event.target.value }))} placeholder="재고 수량" className="su-input" disabled={distributionForm.unlimitedStock} />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px', border: '1px solid #DDE3EA', borderRadius: 8, background: '#fff', fontSize: 13 }}>
                    <input type="checkbox" checked={!!distributionForm.unlimitedStock} onChange={(event) => setDistributionForm(prev => ({ ...prev, unlimitedStock: event.target.checked }))} />
                    무제한 재고
                  </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <select value={distributionForm.status} onChange={(event) => setDistributionForm(prev => ({ ...prev, status: event.target.value }))} className="su-input">
                    <option value="available">판매중</option>
                    <option value="soldout">품절</option>
                  </select>
                  <select value={distributionForm.visibility} onChange={(event) => setDistributionForm(prev => ({ ...prev, visibility: event.target.value }))} className="su-input">
                    <option value="public">공개</option>
                    <option value="hidden">숨김</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px', border: '1px solid #DDE3EA', borderRadius: 8, background: '#fff', fontSize: 13 }}>
                    <input type="checkbox" checked={!!distributionForm.featured} onChange={(event) => setDistributionForm(prev => ({ ...prev, featured: event.target.checked }))} />
                    추천 상품
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px', border: '1px solid #DDE3EA', borderRadius: 8, background: '#fff', fontSize: 13 }}>
                    <input type="checkbox" checked={!!distributionForm.todayDeal} onChange={(event) => setDistributionForm(prev => ({ ...prev, todayDeal: event.target.checked }))} />
                    오늘의 특가
                  </label>
                </div>
              </div>
            </div>

            <div style={{ padding: 10, borderRadius: 10, border: '1px solid #DDE3EA', background: '#F8FAFC' }}>
              <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8 }}>4. 배송/수령</div>
              <div style={{ display: 'grid', gap: 8 }}>
                <select value={distributionForm.receiveMethod} onChange={(event) => setDistributionForm(prev => ({ ...prev, receiveMethod: event.target.value }))} className="su-input">
                  <option value="delivery">택배</option>
                  <option value="pickup">방문</option>
                  <option value="online">온라인</option>
                </select>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div className="su-input" style={{ display: 'flex', alignItems: 'center', color: 'var(--c-tx-s)' }}>판매자: {autoSellerName}</div>
                  <div className="su-input" style={{ display: 'flex', alignItems: 'center', color: 'var(--c-tx-s)' }}>지역: {autoRegionLabel}</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--c-tx-s)' }}>productId/sellerId/regionId는 시스템에서 자동 설정됩니다.</div>
              </div>
            </div>

            <div style={{ padding: 10, borderRadius: 10, border: '1px solid #DDE3EA', background: '#F8FAFC' }}>
              <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 8 }}>5. 상세정보</div>
              <div style={{ display: 'grid', gap: 8 }}>
                <textarea value={distributionForm.description} onChange={(event) => setDistributionForm(prev => ({ ...prev, description: event.target.value }))} placeholder="상품 설명" className="su-input" rows={3} />
                <textarea value={distributionForm.sellerIntro} onChange={(event) => setDistributionForm(prev => ({ ...prev, sellerIntro: event.target.value }))} placeholder="판매자 소개" className="su-input" rows={2} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              <div style={{ fontSize: 12, color: 'var(--c-tx-s)' }}>포인트 결제만 활성화, 카드결제는 오픈예정</div>
              <button type="submit" className="su-primaryBtn" disabled={distributionSaving}>{distributionSaving ? '저장 중...' : (editingDistributionId ? '수정 저장' : '상품 등록')}</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // ★ Auth 로딩 중이면 스피너 표시 (MOVED DOWN TO FIX HOOK ORDER)
  // if (authLoading) { ... } -> Removed early return here

  // ★ 안전 변수 선언 (null=로딩을 안전하게 처리, 크래시 방지)
  const safeMyShopsList = Array.isArray(ownedShops) ? ownedShops : [];
  const safeShopLedger = Array.isArray(shopLedger) ? shopLedger : [];
  const safeShopRequests = Array.isArray(payoutRequests) ? payoutRequests : [];
  const safePayoutRequests = Array.isArray(payoutRequests) ? payoutRequests : [];
  const isShopsLoading = ownedShops === null;
  const isRequestsLoading = payoutRequests === null;

  // ★ supplyData null-safe 처리 (purchases 크래시 방지)
  const supplyDataSafe = supplyData && typeof supplyData === 'object' ? supplyData : { requests: [], purchases: [] };
  const supplyRequests = Array.isArray(supplyDataSafe.requests) ? supplyDataSafe.requests : [];
  const supplyPurchases = Array.isArray(supplyDataSafe.purchases) ? supplyDataSafe.purchases : [];

  const resolveRegionLabel = (profile) => {
    if (!profile || typeof profile !== 'object') return '지역 미설정';
    let selectedRegionId = '';
    let selectedRegionName = '';
    let regionNameCache = {};
    try {
      selectedRegionId = String(localStorage.getItem('selectedRegionId') || '').trim();
    } catch (e) {}
    try {
      selectedRegionName = String(localStorage.getItem('selectedRegionName') || '').trim();
    } catch (e) {}
    try {
      const parsed = JSON.parse(localStorage.getItem('su_region_name_cache_v1') || '{}');
      regionNameCache = parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) {}

    const regions = Array.isArray(memberRegions) ? memberRegions : [];
    const findRegionNameById = (rid) => {
      const id = String(rid || '').trim();
      if (!id) return '';
      const matched = regions.find((region) => {
        const regionId = String(region?.id || region?.regionId || region?.region_id || '').trim();
        return regionId === id;
      });
      const fromRows = String(matched?.name || matched?.regionName || '').trim();
      if (fromRows) return fromRows;
      return String(regionNameCache[id] || '').trim();
    };

    const profileRegionId = String(profile.regionId || profile.region_id || '').trim();

    // 활동지역은 선택 지역 기준으로 보여주되, ID와 이름이 맞는 경우만 selectedRegionName 사용
    const selectedRegionLabel = findRegionNameById(selectedRegionId)
      || (selectedRegionId && profileRegionId && selectedRegionId === profileRegionId ? selectedRegionName : '');
    if (selectedRegionLabel) return selectedRegionLabel;

    // 선택 지역이 없거나 아직 매핑이 없으면 회원의 regionId를 기준으로 canonical name 표시
    const profileRegionLabel = findRegionNameById(profileRegionId);
    if (profileRegionLabel) return profileRegionLabel;

    const raw =
      profile.region ||
      profile.regionName ||
      profile.region_name ||
      profile.districtName ||
      profile.regionId ||
      profile.region_id ||
      selectedRegionId ||
      '';
    const label = String(raw || '').trim();
    if (!label) return '지역 미설정';

    const matched = regions.find((region) => {
      const regionId = String(region?.id || region?.regionId || region?.region_id || '').trim();
      const regionCode = String(region?.code || region?.regionCode || '').trim();
      const regionName = String(region?.name || region?.regionName || '').trim();
      return label === regionId || label === regionCode || label === regionName;
    });

    const matchedName = String(matched?.name || matched?.regionName || '').trim();
    if (matchedName) return matchedName;

    // ID/코드 형태는 그대로 노출하지 않고, 마지막 fallback만 사용
    if (/^(R_|REGION_|\d+$)/i.test(label)) {
      if (selectedRegionId && selectedRegionName && (!profileRegionId || selectedRegionId === profileRegionId)) return selectedRegionName;
      return '지역 미설정';
    }
    return label;
  };

  const formatJoinDateLabel = (profile) => {
    if (!profile || typeof profile !== 'object') return '가입일 미확인';
    const raw = profile.createdAt || profile.created_at || profile.joinedAt || profile.joined_at || profile.joinDate || '';
    if (!raw) return '가입일 미확인';
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return '가입일 미확인';
    return `${parsed.getFullYear()}.${String(parsed.getMonth() + 1).padStart(2, '0')}.${String(parsed.getDate()).padStart(2, '0')} 가입`;
  };

  const heroRegionLabel = resolveRegionLabel(userData);
  const heroJoinDateLabel = formatJoinDateLabel(userData);

  // ★ [BOOTSTATE] 디버깅 로그 (최초 렌더 1회)
  useEffect(() => {
    const sessionForId = authReadyUser ? (typeof getSession === 'function' ? getSession() : null) : null;
    const sessionMemberId = sessionForId?.memberId || sessionForId?.id || null;
    const currentUserId = userData?.id || userData?.memberId || sessionMemberId || null;
    console.log('[My][BOOTSTATE]', { authReadyUser, sessionMemberId, currentUserId });
  }, []);

  if (authLoading) {
    return (
      <div className="su-page" style={{ paddingBottom: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⌛</div>
          <div style={{ fontSize: 14, opacity: 0.7 }}>세션을 확인하는 중입니다...</div>
        </div>
      </div>
    );
  }

    return (
      <div className="su-page su-page--my" style={{ paddingBottom: 100 }}>
      {/* ────────── my-hero 자산 대시보드 ────────── */}
      <div className="my-hero">
        <div className="my-hero__topbar">
          <BackButton tone="dark" onClick={() => navigate('/home')} />
          <span className="my-hero__toptitle">마이오피스</span>
        </div>
        {/* 포인트 자산 요약 (Hero) */}
        <div className="my-hero__asset">
          <div className="my-hero__asset-label">사용가능 포인트</div>
          <div className="my-hero__asset-value">{formatNumber(Math.round(totals.available || 0))} P</div>
          <div className="my-hero__asset-sub">
            <span style={{ color: '#6EE7B7' }}>총 적립 +{formatNumber(Math.round(totals.totalEarned || 0))} P</span>
            <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>
            <span style={{ color: '#FCA5A5' }}>사용 -{formatNumber(Math.round(totals.totalSpent || 0))} P</span>
          </div>
        </div>
        {/* 프로필 행 */}
        <div
          className="my-hero__profile"
          style={{
            background: 'linear-gradient(135deg, rgba(125, 84, 53, 0.96), rgba(151, 108, 74, 0.92))',
            border: '1px solid rgba(241, 219, 188, 0.18)',
            boxShadow: '0 10px 22px rgba(60, 37, 24, 0.22), inset 0 1px 0 rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: 20,
          }}
        >
          <div className="my-hero__avatar">
            {userData?.profileImage ? (
              <img src={userData.profileImage} alt="프로필" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : '👤'}
          </div>
          <div className="my-hero__name-block" style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
            <div className="my-name-row" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, width: '100%' }}>
              <div className="my-hero__name" style={{ minWidth: 0, color: '#ffffff', lineHeight: 1.15, letterSpacing: '-0.02em', marginTop: 10 }}>
                {(() => {
                  const n = userData?.name || userData?.nickname;
                  if (n) return `${n}님`;
                  const e = userData?.email;
                  if (e) return `${e.split('@')[0]}님`;
                  return '사용자님';
                })()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0, minWidth: 0 }}>
                {sdMarkValue ? (
                  <span
                    className="my-sd-badge"
                    style={{
                      flexShrink: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '3px 9px',
                      borderRadius: 999,
                      background: 'linear-gradient(135deg, rgba(255, 224, 128, 0.3), rgba(231, 182, 67, 0.2))',
                      color: '#fff6cf',
                      fontSize: 12,
                      fontWeight: 800,
                      lineHeight: 1,
                      whiteSpace: 'nowrap',
                      border: '1px solid rgba(255, 219, 120, 0.62)',
                      boxShadow: '0 0 0 1px rgba(255, 219, 120, 0.22), 0 0 8px rgba(255, 212, 102, 0.58), 0 0 16px rgba(235, 181, 61, 0.42)',
                      textShadow: '0 0 6px rgba(255, 233, 156, 0.72)',
                      letterSpacing: '0.02em',
                      marginTop: 2,
                    }}
                  >
                    {`SD ${sdMarkValue}`}
                  </span>
                ) : null}
                {userData?.phone ? (
                  <div className="my-hero__phone-right">{String(userData.phone).replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')}</div>
                ) : null}
              </div>
            </div>
            {userData?.nickname && userData?.nickname !== userData?.name && (
              <div className="my-hero__nickname" style={{ color: 'rgba(255,255,255,0.68)', lineHeight: 1.2 }}>({userData.nickname})</div>
            )}

            <div className="my-hero__info-grid">
              <div className="my-hero__info-chip">
                <div className="my-hero__info-label">활동 지역</div>
                <div className="my-hero__info-value">{heroRegionLabel}</div>
              </div>
              <div className="my-hero__info-chip">
                <div className="my-hero__info-label">가입일</div>
                <div className="my-hero__info-value">{heroJoinDateLabel}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, rowGap: 6, flexWrap: 'wrap', marginTop: 2 }}>
              {canOpenRegionalConsole && (
                <button
                  type="button"
                  onClick={() => navigate('/regional-admin')}
                  className="my-btn--cta"
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                    minHeight: 32,
                    padding: '0 12px',
                    borderRadius: 10,
                    border: '1px solid rgba(246, 226, 197, 0.32)',
                    background: 'linear-gradient(135deg, #c18a58, #aa7447)',
                    color: '#ffffff',
                    boxShadow: '0 7px 14px rgba(74, 47, 28, 0.24)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  🧭 지역관리 콘솔
                </button>
              )}



              {(() => {
                try {
                  const myShops = Array.isArray(ownedShops) ? ownedShops : [];
                  if (!myShops || myShops.length === 0) {
                    return null;
                  }
                  const approved = myShops.find(m => m.status === 'approved');
                  const rep = approved || myShops[0];

                  return (
                    <>
                      <button type="button" onClick={async () => {
                        try {
                          const issued = await storageAdapter.issueShopQrPayload(String(rep.id));
                          const token = issued?.qrPayload;
                          if (!token) {
                            alert('QR 발급에 실패했습니다. (서버)');
                            return;
                          }
                          const dataUrl = await QRCode.toDataURL(token, { margin: 4, width: 260 });
                          const w = window.open('','_blank','width=320,height=380');
                          if (w) {
                            w.document.title = '상점 QR';
                            const html = `<!doctype html><title>상점 QR</title><style>body{background:#fff;margin:0;display:flex;align-items:center;justify-content:center;height:100vh}img{max-width:90%;height:auto}</style><img src="${dataUrl}" alt="qr"/>`;
                            w.document.write(html);
                            w.document.close();
                          } else {
                            alert('새 창을 열 수 없습니다. 브라우저 팝업을 허용해 주세요.');
                          }
                        } catch (e) { console.error(e); alert('QR 생성에 실패했습니다.'); }
                      }} className="my-btn--ghost" style={{ minHeight: 32, padding: '0 12px', whiteSpace: 'nowrap', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'rgba(236,255,253,0.82)', boxShadow: 'none', fontWeight: 600, fontSize: 12 }}>상점 QR 보기</button>

                      <button type="button" onClick={async () => {
                        try {
                          const issued = await storageAdapter.issueShopQrPayload(String(rep.id));
                          const token = issued?.qrPayload;
                          if (!token) {
                            alert('QR 발급에 실패했습니다. (서버)');
                            return;
                          }
                          const dataUrl = await QRCode.toDataURL(token, { margin: 4, width: 300 });
                          const img = new Image();
                          img.crossOrigin = 'anonymous';
                          img.onload = () => {
                            try {
                              const pad = 16;
                              const c = document.createElement('canvas');
                              c.width = img.width + pad * 2;
                              c.height = img.height + pad * 2;
                              const ctx = c.getContext('2d');
                              ctx.fillStyle = '#fff'; ctx.fillRect(0,0,c.width,c.height);
                              ctx.drawImage(img, pad, pad);
                              c.toBlob((b) => { if (!b) { alert('다운로드 실패'); return; } const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `${(rep.name||'shop')}_qr.png`; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),5000); }, 'image/png');
                            } catch (err) { console.error(err); alert('QR 저장에 실패했습니다.'); }
                          };
                          img.onerror = () => { alert('QR 이미지 로드 실패'); };
                          img.src = dataUrl;
                        } catch (e) { console.error(e); alert('QR 생성에 실패했습니다.'); }
                      }} className="my-btn--cta" style={{ minHeight: 32, padding: '0 12px', whiteSpace: 'nowrap', borderRadius: 10, border: '1px solid rgba(34,211,238,0.14)', background: 'linear-gradient(135deg, #178cab, #249dc1)', color: '#ffffff', boxShadow: '0 7px 14px rgba(7, 72, 96, 0.2)', fontWeight: 700, fontSize: 12 }}>PNG 저장</button>
                    </>
                  );
                } catch (e) {
                  return null;
                }
              })()}
            </div>
          </div>
        </div>{/* /my-hero__profile */}
      </div>{/* /my-hero */}

      {/* ────────── 탭 네비게이션 ────────── */}
      <div style={{ display: 'flex', background: 'var(--c-surface)', borderBottom: '2px solid var(--c-border)', borderRadius: 12, overflow: 'hidden', position: 'sticky', top: 0, zIndex: 10 }}>
        <button type="button" onClick={() => setMyTab('home')} style={{ flex: 1, padding: '13px 0', border: 'none', background: 'none', fontWeight: myTab === 'home' ? 800 : 500, color: myTab === 'home' ? 'var(--c-primary)' : 'var(--c-tx-s)', fontSize: 13, cursor: 'pointer', borderBottom: myTab === 'home' ? '2.5px solid var(--c-primary)' : '2.5px solid transparent', outline: 'none', boxShadow: 'none', WebkitTapHighlightColor: 'transparent' }}>🏠 홈</button>
        <button type="button" onClick={() => setMyTab('wallet')} style={{ flex: 1, padding: '13px 0', border: 'none', background: 'none', fontWeight: myTab === 'wallet' ? 800 : 500, color: myTab === 'wallet' ? 'var(--c-primary)' : 'var(--c-tx-s)', fontSize: 13, cursor: 'pointer', borderBottom: myTab === 'wallet' ? '2.5px solid var(--c-primary)' : '2.5px solid transparent', outline: 'none', boxShadow: 'none', WebkitTapHighlightColor: 'transparent' }}>💰 지갑</button>
        <button type="button" onClick={() => setMyTab('activity')} style={{ flex: 1, padding: '13px 0', border: 'none', background: 'none', fontWeight: myTab === 'activity' ? 800 : 500, color: myTab === 'activity' ? 'var(--c-primary)' : 'var(--c-tx-s)', fontSize: 13, cursor: 'pointer', borderBottom: myTab === 'activity' ? '2.5px solid var(--c-primary)' : '2.5px solid transparent', outline: 'none', boxShadow: 'none', WebkitTapHighlightColor: 'transparent' }}>📦 활동</button>
      </div>

      {/* ────────── 홈 탭 ────────── */}
      {myTab === 'home' && (
        <div>
          <section className="su-panel">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button type="button" onClick={() => setMyTab('wallet')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '18px 0', borderRadius: 14, border: '1px solid var(--c-border)', background: 'var(--c-surface)', cursor: 'pointer', fontWeight: 700, fontSize: 13, color: 'var(--c-tx-h)' }}><span style={{ fontSize: 26 }}>💰</span><span>포인트 · 상품권</span></button>
              <button type="button" onClick={() => navigate('/shops')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '18px 0', borderRadius: 14, border: '1px solid var(--c-border)', background: 'var(--c-surface)', cursor: 'pointer', fontWeight: 700, fontSize: 13, color: 'var(--c-tx-h)' }}><span style={{ fontSize: 26 }}>🏪</span><span>상점 등록</span></button>
              <button
                type="button"
                onClick={handleMyCardClick}
                disabled={cardCheckLoading}
                className="my-btn--ghost"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '18px 0', borderRadius: 14, border: '1px solid var(--c-border)', background: 'var(--c-surface)', cursor: cardCheckLoading ? 'wait' : 'pointer', fontWeight: 700, fontSize: 13, color: 'var(--c-tx-h)', opacity: cardCheckLoading ? 0.6 : 1
                }}
              >
                <span style={{ fontSize: 26 }}>💳</span>
                <span>{cardCheckLoading ? '확인 중...' : '내 명함'}</span>
              </button>
              <button
                type="button"
                onClick={() => setHomeView(homeView === 'supply' ? 'main' : 'supply')}
                className="my-btn--ghost"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '18px 0', borderRadius: 14, border: '1px solid var(--c-border)', background: homeView === 'supply' ? 'var(--c-primary)' : 'var(--c-surface)', cursor: 'pointer', fontWeight: 700, fontSize: 13, color: homeView === 'supply' ? '#fff' : 'var(--c-tx-h)'
                }}
              >
                <span style={{ fontSize: 26 }}>📦</span>
                <span>보급지원</span>
              </button>
              <button
                type="button"
                onClick={() => setHomeView(homeView === 'distribution' ? 'main' : 'distribution')}
                className="my-btn--ghost"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '18px 0', borderRadius: 14, border: '1px solid var(--c-border)', background: homeView === 'distribution' ? 'var(--c-primary)' : 'var(--c-surface)', cursor: 'pointer', fontWeight: 700, fontSize: 13, color: homeView === 'distribution' ? '#fff' : 'var(--c-tx-h)'
                }}
              >
                <span style={{ fontSize: 26 }}>🛍️</span>
                <span>유통지원</span>
              </button>
            </div>
          </section>
          {/* 내 명함 박스 */}
          {/* 내 명함 전체 기능을 홈탭에 그대로 옮김 */}
          {/* (임시 명함 박스 제거, 기존 명함 기능은 유지) */}
          {/* 보급지원 박스 */}
          {/* 최근 포인트 관리 내역(보급지원 내역 상단) 제거됨 */}
          {homeView === 'main' && (
          <>
          <section className="su-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div className="su-sectionTitle" style={{ marginBottom: 0 }}>최근 포인트 내역</div>
            </div>
            {pointLoading ? (
              <div style={{ textAlign: 'center', opacity: 0.5, padding: 16 }}>⏳ 로딩 중...</div>
            ) : pointHistory.length === 0 ? (
              <div style={{ textAlign: 'center', opacity: 0.6, padding: 16, fontSize: 14 }}>포인트 내역이 없습니다.</div>
            ) : (
              <div style={{ display: 'grid', gap: 0 }}>
                {pointHistory.slice(0, 3).map((h, idx) => {
                  const typeMeta = POINT_TYPE_LABELS[h.type];
                  const typeLabel = typeMeta?.label || h.type;
                  const displayDate = h.createdAt ? new Date(h.createdAt).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }) : '-';
                  const hasKoreanDesc = h.description && /[가-힣]/.test(h.description);
                  const mainLabel = hasKoreanDesc ? h.description : typeLabel;
                  return (
                    <div key={h.id || `home-h-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--c-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: h.amount > 0 ? '#6ee7b7' : '#f87171', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{mainLabel}</div>
                          <div style={{ fontSize: 11, opacity: 0.5 }}>{displayDate}</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: h.amount > 0 ? '#6ee7b7' : '#f87171' }}>{h.amount > 0 ? '+' : ''}{formatNumber(h.amount)} P</div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
          <section className="su-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div className="su-sectionTitle" style={{ marginBottom: 0 }}>미션 / 이벤트 참여 현황</div>
              {missionParticipations.length > 3 ? (
                <button
                  type="button"
                  onClick={() => setParticipationExpanded((prev) => !prev)}
                  style={{ fontSize: 12, color: 'var(--c-primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {participationExpanded ? '접기' : '더보기'}
                </button>
              ) : null}
            </div>
            {participationLoading ? (
              <div style={{ textAlign: 'center', opacity: 0.5, padding: 16 }}>로딩 중...</div>
            ) : recentParticipations.length === 0 ? (
              <div style={{ textAlign: 'center', opacity: 0.6, padding: 16, fontSize: 14 }}>참여한 미션/이벤트가 없습니다.</div>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {recentParticipations.map((item, index) => {
                  const isEvent = (item.type || item.itemType) === 'event';
                  const participationDone = true;
                  // 날짜 표시 규칙
                  const start = item.startDate || item.start_date;
                  const end = item.endDate || item.end_date;
                  let dateText = '';
                  if (start && end) dateText = `${start} ~ ${end}`;
                  else if (start) dateText = `시작일 ${start}`;
                  else if (end) dateText = `~ ${end}`;
                  else dateText = '기간 미정';

                  // 종료 여부
                  const isEnded = calculateStatus(start, end) === 'ended';

                  // 스타일 분기
                  const cardBg = isEvent
                    ? 'linear-gradient(135deg, #f8fbff 0%, #e0f2fe 60%, #f0f9ff 100%)'
                    : 'linear-gradient(135deg, #fffdf7 0%, #fef9e7 60%, #fdf6e3 100%)';
                  const lineColor = isEvent
                    ? 'linear-gradient(180deg, #38bdf8 0%, #60a5fa 60%, #6366f1 100%)'
                    : 'linear-gradient(180deg, #fde047 0%, #facc15 60%, #fb923c 100%)';
                  const labelColor = isEvent ? '#2563eb' : '#d97706';
                  const labelBg = isEvent ? '#e0f2fe' : '#fef9c3';
                  const icon = isEvent ? '🎉 이벤트' : '🧩 미션';
                  const statusBg = isEnded ? '#f1f5f9' : (isEvent ? '#e0fdf4' : '#fefce8');
                  const statusColor = isEnded ? '#94a3b8' : '#16a34a';
                  const titleColor = '#0f172a';
                  const detailBtnBorder = isEvent ? '1.5px solid #38bdf8' : '1.5px solid #facc15';
                  const detailBtnColor = isEvent ? '#2563eb' : '#d97706';

                  return (
                    <div
                      key={item.id || `recent-participation-${index}`}
                      style={{
                        background: cardBg,
                        borderRadius: 16,
                        boxShadow: '0 2.5px 10px rgba(15,23,42,0.07)',
                        padding: '10px 12px',
                        marginBottom: 2,
                        border: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        minHeight: 0,
                      }}
                    >
                      {/* 왼쪽 라인 */}
                      <div style={{
                        position: 'absolute',
                        left: 0, top: 0, bottom: 0, width: 7,
                        borderRadius: '16px 0 0 16px',
                        background: lineColor,
                        zIndex: 1,
                        opacity: 0.93,
                        pointerEvents: 'none',
                      }} />
                      {/* 라벨/상태 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 14, marginBottom: 6, zIndex: 2 }}>
                        <span style={{
                          fontWeight: 800, fontSize: 12, color: labelColor, background: labelBg,
                          borderRadius: 8, padding: '2px 9px', letterSpacing: '-0.01em',
                        }}>{icon}</span>
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: statusColor, background: statusBg,
                          borderRadius: 999, padding: '2px 8px', marginLeft: 2,
                        }}>{isEnded ? '종료' : '진행'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginLeft: 14, zIndex: 2 }}>
                        <div style={{
                          flex: 1,
                          minWidth: 0,
                          fontWeight: 800,
                          fontSize: 14,
                          color: titleColor,
                          letterSpacing: '-0.2px',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>{item.title}</div>
                        <button
                          type="button"
                          onClick={() => navigate('/missions', { state: { highlightType: item.itemType, highlightId: String(item.itemId || item.id || '') } })}
                          style={{
                            border: detailBtnBorder,
                            background: '#fff',
                            color: detailBtnColor,
                            borderRadius: 10,
                            fontWeight: 700,
                            fontSize: 12,
                            padding: '5px 12px',
                            cursor: 'pointer',
                            boxShadow: '0 1px 4px 0 rgba(59,130,246,0.04)',
                            transition: 'border-color 0.18s, color 0.18s',
                            flexShrink: 0,
                          }}
                        >상세</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
          </>
          )}
          {homeView === 'supply' && (
          <section className="su-panel">
            <button type="button" onClick={() => setHomeView('main')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-primary)', fontWeight: 700, fontSize: 13, padding: '0 0 10px 0' }}>← 홈으로</button>
            <div className="su-sectionTitle">📦 보급지원 / 구매내역</div>

            {/* 보급지원 신청 내역 */}
            <div className="su-card" style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>🎁 내 신청 내역</span>
                {supplyRequests.filter(r => r.status === 'PENDING' || r.status === 'REQUESTED').length > 1 && (
                  <button onClick={() => setShowAllRequestsModal(true)} style={{ padding: '4px 10px', fontSize: 12, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 6, color: '#3b82f6', cursor: 'pointer', fontWeight: 600 }}>전체보기</button>
                )}
              </div>
              {!supplyData ? (
                <div style={{ opacity: 0.5, textAlign: 'center', padding: '12px 0' }}>로딩 중...</div>
              ) : (() => {
                const pendingRequests = supplyRequests.filter(r => r.status === 'PENDING' || r.status === 'REQUESTED');
                const displayRequests = pendingRequests.slice(0, 1);
                return displayRequests.length > 0 ? (
                  displayRequests.map((r, idx) => (
                    <div key={r.requestId || r.id || `hsupply-req-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #DDE3EA' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{r.itemName || r.item || '보급품'}</div>
                        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>현재 상태: 확인중입니다</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: 'rgba(234,179,8,0.15)', color: '#92650A' }}>대기중</span>
                        <span style={{ fontSize: 12, opacity: 0.6 }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ opacity: 0.7 }}>신청 내역이 없습니다</div>
                );
              })()}
            </div>

            {/* 보급품 등록 */}
            {isSupplyManager && (
              <div className="su-card" style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>➕ 보급품 등록</div>
                  <div>
                    <button onClick={() => { setEditingOfferId(null); setOfferForm({ item: '', manager: userData?.name || '', contact: userData?.phone || '', price: '', detail: '', image: '' }); setShowOfferModal(true); }} className="su-primaryBtn" style={{ padding: '8px 12px' }}>등록</button>
                  </div>
                </div>
              </div>
            )}

            {/* 내 보급품 목록 */}
            {isSupplyManager && (
              <div className="su-card" style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>📦 내 보급품 목록</div>
                {mySupplyItems === null ? (
                  <div style={{ opacity: 0.5, fontSize: 13 }}>로딩 중...</div>
                ) : mySupplyItems.length === 0 ? (
                  <div style={{ opacity: 0.5, fontSize: 13 }}>등록한 보급품이 없습니다.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {mySupplyItems.map(item => {
                      const id = item.id;
                      const isEditing = editingMyItemId === id;
                      const STATUS_KO = { available: '가용', reserved: '예약', completed: '완료', scheduled: '신청예정', '등록': '등록', '신청': '신청' };
                      const STATUS_COLOR = { available: '#22c55e', reserved: '#a855f7', completed: '#3b82f6', scheduled: '#d97706', '등록': '#0C5460', '신청': '#f59e0b' };
                      return (
                        <div key={id} style={{ padding: '10px 12px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #DDE3EA' }}>
                          {isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              <input value={editMyForm.title} onChange={e => setEditMyForm(f => ({ ...f, title: e.target.value }))} placeholder="물품명" style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, width: '100%' }} />
                              <input value={editMyForm.description} onChange={e => setEditMyForm(f => ({ ...f, description: e.target.value }))} placeholder="설명" style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, width: '100%' }} />
                              <div style={{ display: 'flex', gap: 6 }}>
                                <input type="number" min={0} value={editMyForm.quantity} onChange={e => setEditMyForm(f => ({ ...f, quantity: Number(e.target.value) }))} placeholder="수량" style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, width: 70 }} />
                                <select value={editMyForm.status} onChange={e => setEditMyForm(f => ({ ...f, status: e.target.value }))} style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, flex: 1 }}>
                                  <option value="available">가용</option><option value="scheduled">신청예정</option><option value="reserved">예약</option><option value="completed">완료</option>
                                </select>
                              </div>
                              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                <button onClick={() => handleMyItemSave(id)} style={{ padding: '6px 14px', background: '#0C5460', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>저장</button>
                                <button onClick={() => { setEditingMyItemId(null); setEditMyForm({}); }} style={{ padding: '6px 14px', background: '#F0F2F4', color: '#637074', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>취소</button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 13 }}>{item.title}</div>
                                {item.description && <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>{item.description}</div>}
                                <div style={{ fontSize: 12, marginTop: 4, display: 'flex', gap: 8 }}>
                                  <span>수량 <strong>{item.quantity ?? 0}</strong></span>
                                  <span style={{ color: STATUS_COLOR[item.status] || '#637074', fontWeight: 600 }}>{STATUS_KO[item.status] || item.status}</span>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                <button onClick={() => handleMyItemSetStatus(item, 'available')} disabled={item.status === 'available'} style={{ padding: '5px 10px', background: item.status === 'available' ? '#dcfce7' : 'transparent', color: '#16a34a', border: '1px solid #16a34a', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: item.status === 'available' ? 'default' : 'pointer', opacity: item.status === 'available' ? 1 : 0.7 }}>활성화</button>
                                <button onClick={() => handleMyItemSetStatus(item, 'scheduled')} disabled={item.status === 'scheduled'} style={{ padding: '5px 10px', background: item.status === 'scheduled' ? '#FEF3C7' : 'transparent', color: '#d97706', border: '1px solid #d97706', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: item.status === 'scheduled' ? 'default' : 'pointer', opacity: item.status === 'scheduled' ? 1 : 0.7 }}>신청예정</button>
                                <button onClick={() => handleMyItemEdit(item)} style={{ padding: '5px 12px', background: '#E8F4FD', color: '#0C5460', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>수정</button>
                                <button onClick={() => handleMyItemDelete(id)} style={{ padding: '5px 12px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>삭제</button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 구매 내역 */}
            <div className="su-card">
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>🛒 구매 내역</span>
                {(() => {
                  const completedRequests = supplyRequests.filter(r => r.status === 'COMPLETED' || r.status === 'DONE' || r.status === 'CONFIRMED');
                  const combinedPurchases = [...supplyPurchases, ...completedRequests.map(r => ({ ...r, item: r.itemName || r.item, amount: r.amount || 0, status: '구매완료' }))];
                  return combinedPurchases.length > 1 ? (
                    <button onClick={() => setShowAllPurchasesModal(true)} style={{ padding: '4px 10px', fontSize: 12, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 6, color: '#22c55e', cursor: 'pointer', fontWeight: 600 }}>전체보기</button>
                  ) : null;
                })()}
              </div>
              {(() => {
                const completedRequests = supplyRequests.filter(r => r.status === 'COMPLETED' || r.status === 'DONE' || r.status === 'CONFIRMED');
                const combinedPurchases = [...supplyPurchases, ...completedRequests.map(r => ({ ...r, item: r.itemName || r.item, amount: r.amount || 0, status: '구매완료' }))];
                const displayPurchases = combinedPurchases.slice(0, 1);
                return displayPurchases.length > 0 ? (
                  displayPurchases.map((p, idx) => (
                    <div key={p.purchaseId || p.id || `hsupply-purch-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #DDE3EA' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.item || p.itemName || '보급품'}</div>
                        <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>{new Date(p.completedAt || p.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {p.amount > 0 && <span style={{ fontWeight: 700 }}>{formatNumber(p.amount)}원</span>}
                        <span style={{ padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: 'rgba(34,197,94,0.15)', color: '#16A34A' }}>완료</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ opacity: 0.7 }}>구매 내역이 없습니다</div>
                );
              })()}
            </div>

            {/* 신청자 관리 */}
            {isSupplyManager && (
              <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #DDE3EA' }}>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 12 }}>📬 신청자 관리</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  {['all', 'pending', 'completed'].map(tab => (
                    <button key={tab} onClick={() => setManagedRequestTab(tab)} style={{ padding: '6px 12px', borderRadius: 20, border: 'none', background: managedRequestTab === tab ? '#0C5460' : '#F0F2F4', color: managedRequestTab === tab ? '#fff' : '#637074', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      {tab === 'all' ? '전체' : tab === 'pending' ? '대기' : '완료'}
                    </button>
                  ))}
                </div>
                {managedRequests === null ? (
                  <div style={{ padding: 20, textAlign: 'center', opacity: 0.5 }}>로딩 중...</div>
                ) : managedRequests.length === 0 ? (
                  <div style={{ padding: 20, textAlign: 'center', opacity: 0.5 }}>신청 내역이 없습니다.</div>
                ) : (
                  (() => {
                    const filtered = managedRequests.filter(r => {
                      if (managedRequestTab === 'all') return true;
                      if (managedRequestTab === 'pending') return r.status === 'PENDING' || r.status === 'REQUESTED';
                      if (managedRequestTab === 'completed') return r.status === 'COMPLETED' || r.status === 'DONE';
                      return true;
                    });
                    if (filtered.length === 0) return <div style={{ padding: 20, textAlign: 'center', opacity: 0.5 }}>해당 상태의 신청이 없습니다.</div>;
                    return (
                      <div style={{ display: 'grid', gap: 8 }}>
                        {filtered.map(r => (
                          <div key={r.id} className="su-card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 14 }}>{r.itemName || '(품목 미지정)'}</div>
                                <div style={{ fontSize: 13, marginTop: 4 }}>
                                  <span style={{ fontWeight: 600 }}>{r.requesterName}</span>
                                  <span style={{ opacity: 0.6 }}> • {r.createdAt ? new Date(r.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) : '날짜 미지정'}</span>
                                </div>
                                {r.requesterContact && <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>📞 {r.requesterContact}</div>}
                                {r.message && <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>"{r.message}"</div>}
                              </div>
                              <span style={{ padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: (r.status === 'COMPLETED' || r.status === 'DONE') ? 'rgba(34,197,94,0.15)' : 'rgba(234,179,8,0.15)', color: (r.status === 'COMPLETED' || r.status === 'DONE') ? '#16A34A' : '#92650A' }}>
                                {(r.status === 'COMPLETED' || r.status === 'DONE') ? '완료됨' : '대기중'}
                              </span>
                            </div>
                            {(r.status === 'PENDING' || r.status === 'REQUESTED') && (
                              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid #DDE3EA' }}>
                                <button onClick={() => handleCompleteRequest(r.id)} style={{ padding: '6px 12px', background: '#0C5460', color: '#fff', borderRadius: 6, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }}>완료 처리</button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()
                )}
              </div>
            )}
          </section>
          )}
        </div>
      )}


      {/* ────────── 3탭 지갑 상단 탭 UI (상단 이동) ────────── */}
      {myTab === 'wallet' && (
        <>
          {/* 지갑 3탭: 홈/지갑/보급지원 바로 아래 */}
          <div style={{ height: 20 }} />
          <div className="wallet-tabs" style={{ display: 'flex', margin: '0 0 12px 0', borderRadius: 12, overflow: 'hidden', background: 'var(--c-surface)', border: '1px solid var(--c-border)', position: 'relative' }}>
            <button
              type="button"
              className={walletView === 'point' ? 'wallet-tab active' : 'wallet-tab'}
              style={{ flex: 1, padding: '13px 0', fontWeight: 800, fontSize: 14, border: 'none', background: walletView === 'point' ? 'var(--c-primary)' : 'transparent', color: walletView === 'point' ? '#fff' : 'var(--c-tx-h)', cursor: 'pointer', transition: 'background 0.2s', outline: 'none', boxShadow: 'none', WebkitTapHighlightColor: 'transparent' }}
              onClick={() => setWalletView('point')}
            >
              포인트
            </button>
            <button
              type="button"
              className={walletView === 'shop' ? 'wallet-tab active' : 'wallet-tab'}
              style={{ flex: 1, padding: '13px 0', fontWeight: 800, fontSize: 14, border: 'none', background: walletView === 'shop' ? 'var(--c-primary)' : 'transparent', color: walletView === 'shop' ? '#fff' : 'var(--c-tx-h)', cursor: 'pointer', transition: 'background 0.2s', outline: 'none', boxShadow: 'none', WebkitTapHighlightColor: 'transparent' }}
              onClick={() => setWalletView('shop')}
            >
              상점 포인트
            </button>
            <button
              type="button"
              className={walletView === 'voucher' ? 'wallet-tab active' : 'wallet-tab'}
              style={{ flex: 1, padding: '13px 0', fontWeight: 800, fontSize: 14, border: 'none', background: walletView === 'voucher' ? 'var(--c-primary)' : 'transparent', color: walletView === 'voucher' ? '#fff' : 'var(--c-tx-h)', cursor: 'pointer', transition: 'background 0.2s', outline: 'none', boxShadow: 'none', WebkitTapHighlightColor: 'transparent' }}
              onClick={() => setWalletView('voucher')}
            >
              VIP 상품권
            </button>
          </div>
          {/* 지갑 본문: 3탭 아래에 단일 본문 */}
          <div className="wallet-body" style={{ marginTop: 0 }}>
            {/* 포인트 관리 (기존 기능) */}
            {walletView === 'point' && (
              <section className="su-panel" data-point-wallet-anchor="true">
                <div className="su-sectionTitle">💰 포인트 관리</div>
                <div style={{ fontWeight: 700, fontSize: 18, margin: '12px 0 8px' }}>잔액: {formatNumber(pointBalance)} P</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <button type="button" className="su-chip" style={{ fontWeight: pointTab === 'all' ? 800 : 500 }} onClick={() => setPointTab('all')}>전체</button>
                  <button type="button" className="su-chip" style={{ fontWeight: pointTab === 'earn' ? 800 : 500 }} onClick={() => setPointTab('earn')}>적립</button>
                  <button type="button" className="su-chip" style={{ fontWeight: pointTab === 'spend' ? 800 : 500 }} onClick={() => setPointTab('spend')}>사용</button>
                </div>
                <div
                  style={{
                    margin: '2px 0 14px',
                    padding: '12px 13px',
                    borderRadius: 12,
                    border: '1px solid rgba(14,116,144,0.18)',
                    background: 'rgba(14,116,144,0.06)',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#0f766e', marginBottom: 5 }}></div>
                  <div style={{ fontSize: 12, lineHeight: 1.7, color: '#475569' }}></div>
                </div>
                {pointLoading ? (
                  <div style={{ textAlign: 'center', opacity: 0.5, padding: 16 }}>⏳ 로딩 중...</div>
                ) : filteredHistory.length === 0 ? (
                  <div style={{ textAlign: 'center', opacity: 0.6, padding: 16, fontSize: 14 }}>포인트 내역이 없습니다.</div>
                ) : (
                  <div style={{ display: 'grid', gap: 0 }}>
                    {filteredHistory.slice(0, 10).map((h, idx) => {
                      const typeMeta = POINT_TYPE_LABELS[h.type];
                      const typeLabel = typeMeta?.label || h.type;
                      const displayDate = h.createdAt ? new Date(h.createdAt).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }) : '-';
                      const hasKoreanDesc = h.description && /[가-힣]/.test(h.description);
                      const mainLabel = hasKoreanDesc ? h.description : typeLabel;
                      return (
                        <div key={h.id || `wallet-h-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--c-border)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: h.amount > 0 ? '#6ee7b7' : '#f87171', flexShrink: 0 }} />
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600 }}>{mainLabel}</div>
                              <div style={{ fontSize: 11, opacity: 0.5 }}>{displayDate}</div>
                            </div>
                          </div>
                          <div style={{ fontWeight: 800, fontSize: 14, color: h.amount > 0 ? '#6ee7b7' : '#f87171' }}>{h.amount > 0 ? '+' : ''}{formatNumber(h.amount)} P</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* 상점 포인트 (브리지 구조 이식, 중복 제거) */}
            {walletView === 'shop' && (
              <section className="su-panel" data-shop-wallet-anchor="true">
                <div className="su-sectionTitle">🏪 상점 포인트</div>
                {/* 상점 선택 + 카드형 잔액 */}
                {(() => {
                  const hasMultipleShops = (ownedShops?.length || 0) > 1;
                  return (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      margin: '12px 0 16px',
                      flexWrap: 'wrap',
                    }}>
                      <span style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: '#64748b',
                        minWidth: 48,
                        marginRight: 2
                      }}>상점</span>
                      <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
                        <select
                          value={activeShopId}
                          onChange={e => setActiveShopId(e.target.value)}
                          className="shop-select"
                          style={{
                            width: '100%',
                            height: 44,
                            borderRadius: 14,
                            padding: hasMultipleShops ? '0 42px 0 14px' : '0 14px',
                            border: '1px solid #d7dee7',
                            background: '#fff',
                            fontWeight: 700,
                            fontSize: 15,
                            color: '#0f172a',
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            MozAppearance: 'none',
                            outline: 'none',
                            boxShadow: 'none',
                            minWidth: 120,
                            marginRight: 0,
                            marginLeft: 0,
                            transition: 'border 0.15s, box-shadow 0.15s',
                            cursor: hasMultipleShops ? 'pointer' : 'default',
                            backgroundColor: hasMultipleShops ? '#fff' : '#f8fafc',
                          }}
                          onFocus={e => { e.target.style.border = '1.5px solid #14b8a6'; e.target.style.boxShadow = '0 0 0 2px rgba(20,184,166,0.15)'; }}
                          onBlur={e => { e.target.style.border = '1px solid #d7dee7'; e.target.style.boxShadow = 'none'; }}
                        >
                          {ownedShops.map((s, idx) => (
                            <option key={s.id || s.shopId || `shop-dropdown-${idx}`} value={s.id || s.shopId}>
                              {s.name ? s.name : (s.id || s.shopId)}
                            </option>
                          ))}
                        </select>
                        {hasMultipleShops && (
                          <span style={{
                            position: 'absolute',
                            right: 14,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            pointerEvents: 'none',
                            fontSize: 13,
                            color: '#64748b',
                            lineHeight: 1,
                            userSelect: 'none',
                          }}>▼</span>
                        )}
                      </div>
                    </div>
                  );
                })()}
                <div style={{
                  display: 'flex',
                  gap: 10,
                  marginBottom: 12,
                }}>
                  <div style={{
                    flex: 1,
                    padding: 14,
                    borderRadius: 14,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}>
                    <div style={{ fontSize: 12, color: '#64748b' }}>총 적립</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{formatNumber(shopEarned)} P</div>
                  </div>
                  <div style={{
                    flex: 1,
                    padding: 14,
                    borderRadius: 14,
                    background: '#ecfdf5',
                    border: '1px solid #bbf7d0',
                  }}>
                    <div style={{ fontSize: 12, color: '#059669' }}>가용 잔액</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: '#059669' }}>{formatNumber(shopAvailable)} P</div>
                  </div>
                </div>
                <div
                  style={{
                    margin: '2px 0 14px',
                    padding: '12px 13px',
                    borderRadius: 12,
                    border: '1px solid rgba(14,116,144,0.18)',
                    background: 'rgba(14,116,144,0.06)',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#0f766e', marginBottom: 5 }}>안내</div>
                  <div style={{ fontSize: 12, lineHeight: 1.7, color: '#475569' }}>
                    VIP 상품권으로 결제된 금액은 상점 포인트로 적립되며, 최근 적립 원장에서 확인할 수 있습니다.<br />
                    지급요청은 가용 잔액 확인 후 하단 지급요청 버튼에서 금액을 입력해 신청해 주세요.
                  </div>
                </div>
                {/* 최근 원장 */}
                <div style={{ fontWeight: 700, margin: '18px 0 8px' }}>최근 적립 원장</div>
                {shopLedgerLoading ? (
                  <div style={{ textAlign: 'center', opacity: 0.5, padding: 12 }}>로딩 중...</div>
                ) : shopLedger.length === 0 ? (
                  <div style={{ textAlign: 'center', opacity: 0.6, padding: 12 }}>최근 적립 내역이 없습니다.</div>
                ) : (
                  <div style={{ display: 'grid', gap: 0 }}>
                    {(shopLedgerExpanded ? shopLedger : shopLedger.slice(0, 4)).map((entry, idx) => {
                      const dateRaw = entry.createdAt || entry.created_at;
                      const dateObj = dateRaw ? new Date(dateRaw) : null;
                      const dateStr = (dateObj && !isNaN(dateObj.getTime()))
                        ? `${dateObj.getFullYear()}. ${dateObj.getMonth() + 1}. ${dateObj.getDate()}. ${dateObj.getHours() < 12 ? '오전' : '오후'} ${dateObj.getHours() % 12 === 0 ? 12 : dateObj.getHours() % 12}:${dateObj.getMinutes().toString().padStart(2, '0')}`
                        : '날짜 미상';
                      return (
                        <div
                          key={entry.earningId || entry.sourceTxId || `ledger-${idx}`}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 0',
                            borderBottom: '1px solid var(--c-border)',
                            gap: 12,
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, opacity: 0.62, fontWeight: 500, marginBottom: 2 }}>{dateStr}</div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>{formatNumber(entry.amount)} P</div>
                          </div>
                          <div style={{ textAlign: 'right', minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#222', marginBottom: 2, wordBreak: 'keep-all', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.buyerName || entry.buyerMemberId || '회원'}</div>
                            <div style={{ fontSize: 12, opacity: 0.6, fontWeight: 500 }}>결제</div>
                          </div>
                        </div>
                      );
                    })}
                    {shopLedger.length > 4 && (
                      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
                        <button
                          type="button"
                          style={{
                            width: '100%',
                            maxWidth: 340,
                            height: 44,
                            borderRadius: 999,
                            background: '#fff',
                            border: '1px solid var(--c-border)',
                            fontWeight: 700,
                            color: '#0f172a',
                            fontSize: 15,
                            boxShadow: '0 1.5px 6px 0 rgba(16,185,129,0.04)',
                            transition: 'background 0.15s, color 0.15s',
                            cursor: 'pointer',
                            margin: '0 auto',
                            outline: 'none',
                            ...(shopLedgerExpanded
                              ? { background: 'var(--c-surface)', color: '#0f172a', borderColor: 'var(--c-border)' }
                              : { background: '#f0fdfa', color: '#0f172a', borderColor: 'var(--c-border)' }),
                          }}
                          onClick={() => setShopLedgerExpanded(v => !v)}
                          onMouseDown={e => e.preventDefault()}
                        >
                          {shopLedgerExpanded ? '접기' : '더보기'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {/* 지급요청 */}
                <button type="button" className="su-primaryBtn" style={{ margin: '18px 0 12px' }} onClick={() => setPayoutModalOpen(true)}>지급요청</button>
                <div style={{ fontWeight: 700, margin: '18px 0 8px' }}>최근 지급요청 내역</div>
                {payoutLoading ? (
                  <div style={{ textAlign: 'center', opacity: 0.5, padding: 12 }}>로딩 중...</div>
                ) : payoutRequests.length === 0 ? (
                  <div style={{ textAlign: 'center', opacity: 0.6, padding: 12 }}>지급요청 내역이 없습니다.</div>
                ) : (
                  <div style={{ display: 'grid', gap: 0 }}>
                    {payoutRequests.slice(0, 4).map((r, idx) => {
                      const dateRaw = r.requestedAt || r.requested_at || r.createdAt || r.created_at;
                      const dateObj = dateRaw ? new Date(dateRaw) : null;
                      const dateStr = (dateObj && !isNaN(dateObj.getTime())) ? dateObj.toLocaleString() : '날짜 미상';
                      return (
                        <div key={r.id || r.requestId || `shopreq-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--c-border)' }}>
                          <div style={{ fontSize: 13 }}>{dateStr} · {formatNumber(r.amount)} P</div>
                          <div style={{ fontWeight: 800, fontSize: 13 }}>{statusLabel(r.status)}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <button type="button" className="su-chip" style={{ marginTop: 10 }} onClick={() => setAllPayoutsModalOpen(true)}>전체 내역 보기</button>

              </section>
            )}

            {/* ── 상점 예약 관리 (별도 패널) ── */}
            {walletView === 'shop' && (
              <section className="su-panel" style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div className="su-sectionTitle" style={{ marginBottom: 0 }}>📅 예약 관리</div>
                  <span style={{ fontSize: 12, color: 'var(--c-tx-s)', fontWeight: 700 }}>{shopReservations.length}건</span>
                </div>
                {shopRsvLoading ? (
                  <div style={{ textAlign: 'center', opacity: 0.5, padding: 12 }}>로딩 중...</div>
                ) : shopReservations.length === 0 ? (
                  <div style={{ textAlign: 'center', opacity: 0.6, padding: 16, border: '1px dashed var(--c-border)', borderRadius: 12 }}>아직 예약이 없습니다.</div>
                ) : (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {shopReservations.map((rsv, idx) => (
                      <div key={rsv.id || `rsv-${idx}`} style={{ border: '1px solid var(--c-border)', borderRadius: 14, padding: 12, background: rsv.status === 'pending' ? '#fffbeb' : 'var(--c-surface)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontWeight: 800, fontSize: 14 }}>{rsv.memberName || rsv.guestName || '고객'}</div>
                          <span style={{
                            padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800,
                            background: rsv.status === 'pending' ? '#fef3c7' : rsv.status === 'confirmed' ? '#dcfce7' : rsv.status === 'rejected' ? '#fee2e2' : '#f3f4f6',
                            color: rsv.status === 'pending' ? '#92400e' : rsv.status === 'confirmed' ? '#166534' : rsv.status === 'rejected' ? '#b91c1c' : '#475569',
                          }}>
                            {rsv.status === 'pending' ? '대기중' : rsv.status === 'confirmed' ? '확정' : rsv.status === 'rejected' ? '거절' : rsv.status === 'cancelled' ? '취소됨' : rsv.status}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>
                          📅 {rsv.reservedDate} {rsv.reservedTime} · 👥 {rsv.numberOfPeople || 1}명
                        </div>
                        {rsv.serviceName && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>서비스: {rsv.serviceName}</div>}
                        {(rsv.memberPhone || rsv.guestPhone) && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>📞 {rsv.memberPhone || rsv.guestPhone}</div>}
                        {rsv.notes && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>메모: {rsv.notes}</div>}
                        {rsv.status === 'pending' && (
                          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                            <button type="button" onClick={async () => {
                              try {
                                await storageAdapter.updateReservationStatus(rsv.id, 'confirmed', null, effectiveUserId);
                                setShopReservations(prev => prev.map(r => r.id === rsv.id ? { ...r, status: 'confirmed' } : r));
                              } catch (e) { window.alert('승인 실패: ' + e.message); }
                            }} style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', background: '#22c55e', color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>✅ 승인</button>
                            <button type="button" onClick={() => setRejectModal({ open: true, rsvId: rsv.id, reason: '' })} style={{ flex: 1, padding: '10px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', color: '#ef4444', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>❌ 거절</button>
                          </div>
                        )}
                        <button type="button" onClick={async () => {
                          if (!window.confirm('이 예약을 삭제하시겠습니까?')) return;
                          try {
                            await storageAdapter.deleteReservation(rsv.id, effectiveUserId);
                            setShopReservations(prev => prev.filter(r => r.id !== rsv.id));
                          } catch (e) { window.alert('삭제 실패: ' + e.message); }
                        }} style={{ marginTop: 8, padding: '6px 0', width: '100%', borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#94a3b8', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>🗑️ 삭제</button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* 거절 사유 모달 */}
            {rejectModal.open && (
              <div style={{ position: 'fixed', inset: 0, zIndex: 1200, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setRejectModal({ open: false, rsvId: null, reason: '' })}>
                <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 380, background: '#fff', borderRadius: 20, padding: '24px 20px', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>
                  <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 14, color: '#0f172a' }}>❌ 예약 거절</div>
                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 10 }}>거절 사유를 입력해주세요 (선택)</div>
                  <textarea
                    value={rejectModal.reason}
                    onChange={e => setRejectModal(p => ({ ...p, reason: e.target.value }))}
                    placeholder="예: 해당 시간은 이미 마감되었습니다"
                    rows={3}
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 14, resize: 'vertical', background: '#fff', color: '#0f172a' }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
                    <button type="button" onClick={() => setRejectModal({ open: false, rsvId: null, reason: '' })} style={{ padding: 12, borderRadius: 14, border: '1.5px solid #e2e8f0', background: '#f8fafc', fontWeight: 800, fontSize: 14, cursor: 'pointer', color: '#64748b' }}>취소</button>
                    <button type="button" onClick={async () => {
                      try {
                        await storageAdapter.updateReservationStatus(rejectModal.rsvId, 'rejected', rejectModal.reason || null, effectiveUserId);
                        setShopReservations(prev => prev.map(r => r.id === rejectModal.rsvId ? { ...r, status: 'rejected', rejectReason: rejectModal.reason } : r));
                        setRejectModal({ open: false, rsvId: null, reason: '' });
                      } catch (e) { window.alert('거절 실패: ' + e.message); }
                    }} style={{ padding: 12, borderRadius: 14, border: 'none', background: '#ef4444', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>거절 확인</button>
                  </div>
                </div>
              </div>
            )}

            {/* VIP 상품권 (복구: 회원 전송/상점 결제 모달 플로우) */}
            {walletView === 'voucher' && (
              <section className="su-panel" data-voucher-wallet-anchor="true">
                <div className="su-sectionTitle">🎫 VIP 상품권</div>
                <div
                  style={{
                    margin: '12px 0 10px',
                    padding: '14px 16px',
                    borderRadius: 16,
                    border: '1px solid rgba(212,167,44,0.34)',
                    background: 'linear-gradient(135deg, #fff8df 0%, #fff2c9 52%, #fce9b3 100%)',
                    boxShadow: '0 10px 20px rgba(212,167,44,0.16), inset 0 1px 0 rgba(255,255,255,0.72)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#8a6a12', letterSpacing: '0.08em' }}>TOTAL BALANCE</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#8a6a12', background: 'rgba(255,255,255,0.58)', border: '1px solid rgba(138,106,18,0.22)', borderRadius: 999, padding: '3px 10px' }}>
                      VIP WALLET
                    </span>
                  </div>
                  <div style={{ fontSize: 34, lineHeight: 1.06, fontWeight: 900, color: '#3f2f08', letterSpacing: '-0.02em' }}>
                    {formatVoucherAmount(voucherTotalAmount)}
                  </div>
                  <div style={{ marginTop: 5, fontSize: 12, fontWeight: 700, color: '#7d6315' }}>
                    사용 가능 상품권 {activeVoucherCards.length}장
                  </div>
                </div>
                <div style={{ borderRadius: 12, border: '1px solid rgba(212,167,44,0.32)', background: 'rgba(255,248,223,0.88)', padding: '11px 12px', marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#8a6a12', marginBottom: 4 }}>VIP 상품권 사용 안내</div>
                  <div style={{ fontSize: 12, lineHeight: 1.7, color: '#6b4f0f' }}>
                    회원 전송은 개인 간 전달용, 상점 결제는 가맹점 결제용입니다.<br />
                    결제/전송 내역은 카드 하단 버튼으로 진행 후 이력에서 확인할 수 있습니다.
                  </div>
                </div>
                <div style={{ display: 'grid', gap: 18, margin: '18px 0 8px' }}>
                  {activeVoucherCards.length === 0 ? (
                    <div style={{ textAlign: 'center', opacity: 0.6, fontSize: 14 }}>보유한 상품권이 없습니다.</div>
                  ) : activeVoucherCards.map((card, idx) => (
                    <div
                      key={card.serial || `voucher-card-${idx}`}
                      className="su-vipcard-admin"
                      style={{
                        background: 'linear-gradient(135deg, #181c24 0%, #232a36 100%)', // 더 진한 네이비톤
                        borderRadius: 22,
                        border: '1.5px solid #3b4252',
                        boxShadow: '0 4px 24px 0 rgba(20,20,30,0.22), 0 1.5px 0 0 #232a36 inset',
                        padding: '22px 32px 18px 32px', // 좌우 패딩 증가
                        minWidth: 0,
                        maxWidth: 560,
                        width: '100%',
                        margin: '0 auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0,
                        position: 'relative',
                      }}
                    >
                      {/* 상단 라벨/배지 */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                          <div>
                            <span style={{ fontSize: 15, fontWeight: 900, color: '#ffe082', letterSpacing: '0.01em', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span style={{ fontSize: 17, marginRight: 2 }}>🎫</span> <span style={{ color: '#ffe082' }}>VIP 상품권</span>
                            </span>
                            <div style={{ marginTop: 4, fontSize: 12, fontWeight: 700, color: 'rgba(255,245,200,0.78)' }}>지역공유발전플랫폼</div>
                          </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
                          {checkIsAdmin() ? (
                            <button
                              type="button"
                              className="su-chip"
                              onClick={() => cancelVoucherIssue(card)}
                              disabled={voucherCancellingSerial === card.serial}
                              style={{
                                borderRadius: 999,
                                border: '1.2px solid rgba(248,113,113,0.7)',
                                background: 'rgba(127,29,29,0.35)',
                                color: '#fecaca',
                                fontWeight: 800,
                                fontSize: 11,
                                padding: '3px 10px',
                                minHeight: 28,
                                whiteSpace: 'nowrap',
                                opacity: voucherCancellingSerial === card.serial ? 0.6 : 1,
                              }}
                            >
                              {voucherCancellingSerial === card.serial ? '취소중' : '발행취소'}
                            </button>
                          ) : null}
                          <span style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: '#a3e635',
                            background: 'rgba(34,197,94,0.22)',
                            border: '1.2px solid #15803d',
                            borderRadius: 999,
                            padding: '3px 14px',
                            boxShadow: '0 1px 4px 0 rgba(34,197,94,0.10)',
                            letterSpacing: '0.01em',
                            display: 'inline-block',
                          }}>사용가능</span>
                        </div>
                      </div>
                      {/* 금액 강조 */}
                      <div style={{
                        fontSize: 28,
                        fontWeight: 900,
                        color: '#ffe082',
                        textShadow: '0 2px 12px rgba(255,215,120,0.10)',
                        margin: '0 0 10px 0',
                        lineHeight: 1.18,
                        wordBreak: 'keep-all',
                        letterSpacing: '-0.01em',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textAlign: 'left',
                      }}>{formatVoucherAmount(card.cardAmount)}</div>
                      {/* 상세 정보 */}
                      <div style={{
                        fontSize: 13,
                        color: '#cbd5e1',
                        marginBottom: 2,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 10,
                        lineHeight: 1.7,
                      }}>
                        <span style={{ minWidth: 0 }}>발행일 <span style={{ color: '#fffde7', fontWeight: 700, marginLeft: 2 }}>{formatVoucherDate(card.createdAt)}</span></span>
                        <span style={{ minWidth: 0 }}>발행처 <span style={{ color: '#fffde7', fontWeight: 700, marginLeft: 2 }}>{card.issueRegion || '-'}</span></span>
                      </div>
                      <div style={{ fontSize: 12, color: '#bdbdbd', marginBottom: 8, lineHeight: 1.6 }}>
                        일련번호 <span style={{ color: '#e5e7eb', fontWeight: 700, marginLeft: 2 }}>{card.serial}</span>
                      </div>
                      {/* 버튼 영역: 반드시 가로 2열, 한 줄, 최소 padding, 동일 폭, 높이 증가 금지 */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'row', // 핵심: row 고정
                        gap: 6,
                        alignItems: 'center',
                        marginTop: 6,
                        marginBottom: 0,
                      }}>
                        <button
                          type="button"
                          className="su-chip"
                          style={{
                            flex: 1,
                            textAlign: 'center',
                            background: 'rgba(255,255,255,0.10)',
                            color: '#ffe082',
                            fontWeight: 800,
                            border: '1.2px solid #ffe082',
                            borderRadius: 999,
                            fontSize: 11,
                            padding: '4px 8px',
                            minHeight: 28,
                            height: 'auto',
                            boxShadow: '0 1px 4px 0 rgba(255,215,120,0.08)',
                            transition: 'background 0.15s',
                            lineHeight: 1.2,
                            whiteSpace: 'nowrap',
                          }}
                          onClick={() => openVoucherAction('member', card)}
                        >회원 전송</button>
                        <button
                          type="button"
                          className="su-chip"
                          style={{
                            flex: 1,
                            textAlign: 'center',
                            background: 'rgba(255,255,255,0.10)',
                            color: '#ffe082',
                            fontWeight: 800,
                            border: '1.2px solid #ffe082',
                            borderRadius: 999,
                            fontSize: 11,
                            padding: '4px 8px',
                            minHeight: 28,
                            height: 'auto',
                            boxShadow: '0 1px 4px 0 rgba(255,215,120,0.08)',
                            transition: 'background 0.15s',
                            lineHeight: 1.2,
                            whiteSpace: 'nowrap',
                          }}
                          onClick={() => openVoucherAction('shop', card)}
                        >상점 결제</button>
                      </div>
                    </div>
                  ))}
                </div>
                {/* 복구: 회원 전송/상점 결제 모달 */}
                {(voucherActionMode === 'member' || voucherActionMode === 'shop') && currentVoucherActionCard && (
                  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="su-modal su-modal--sm" style={{ minWidth: 320, maxWidth: '90vw' }}>
                      <div className="su-modalHeader">{voucherActionMode === 'member' ? 'VIP 상품권 회원 전송' : 'VIP 상품권 상점 결제'}</div>
                      <div style={{ marginBottom: 12, fontWeight: 700, fontSize: 15 }}>
                        {currentVoucherActionCard.displayName || 'VIP 상품권'}
                        <span style={{ marginLeft: 8, color: '#0d9488' }}>{formatVoucherAmount(currentVoucherActionCard.cardAmount)}</span>
                      </div>
                      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>일련번호: {currentVoucherActionCard.serial}</div>
                      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>발행처: {currentVoucherActionCard.issueRegion || '-'}</div>
                      {voucherActionMode === 'member' && (
                        <>
                          <div style={{ fontWeight: 700, marginBottom: 6 }}>전송할 회원 검색</div>
                          <input
                            className="su-input"
                            placeholder="이름, 전화번호, ID로 검색"
                            value={voucherMemberQuery}
                            onChange={e => setVoucherMemberQuery(e.target.value)}
                            style={{ width: '100%', marginBottom: 8 }}
                            autoFocus
                          />
                          <div style={{ maxHeight: 120, overflowY: 'auto', marginBottom: 8 }}>
                            {voucherActionLoading ? <div style={{ fontSize: 13, color: '#888' }}>로딩 중...</div> :
                              filteredVoucherMembers.length === 0 ? <div style={{ fontSize: 13, color: '#aaa' }}>검색 결과 없음</div> :
                                filteredVoucherMembers.map((m, i) => (
                                  <div key={getMemberId(m)}
                                    style={{ padding: 6, borderRadius: 6, background: selectedVoucherMember && getMemberId(selectedVoucherMember) === getMemberId(m) ? '#e0f2fe' : 'transparent', cursor: 'pointer', fontSize: 13, marginBottom: 2 }}
                                    onClick={() => setSelectedVoucherMember(m)}
                                  >
                                    {m.name} <span style={{ color: '#888', fontSize: 12 }}>({m.phone})</span>
                                  </div>
                                ))}
                          </div>
                        </>
                      )}
                      {voucherActionMode === 'shop' && (
                        <>
                          <div style={{ fontWeight: 700, marginBottom: 6 }}>결제할 상점 검색</div>
                          <input
                            className="su-input"
                            placeholder="상점명, 주소, ID로 검색"
                            value={voucherShopQuery}
                            onChange={e => setVoucherShopQuery(e.target.value)}
                            style={{ width: '100%', marginBottom: 8 }}
                            autoFocus
                          />
                          <div style={{ maxHeight: 120, overflowY: 'auto', marginBottom: 8 }}>
                            {voucherActionLoading ? <div style={{ fontSize: 13, color: '#888' }}>로딩 중...</div> :
                              filteredVoucherShops.length === 0 ? <div style={{ fontSize: 13, color: '#aaa' }}>검색 결과 없음</div> :
                                filteredVoucherShops.map((s, i) => (
                                  <div key={s.id}
                                    style={{ padding: 6, borderRadius: 6, background: selectedVoucherShop && selectedVoucherShop.id === s.id ? '#e0f2fe' : 'transparent', cursor: 'pointer', fontSize: 13, marginBottom: 2 }}
                                    onClick={() => setSelectedVoucherShop(s)}
                                  >
                                    {s.name} <span style={{ color: '#888', fontSize: 12 }}>({s.address})</span>
                                  </div>
                                ))}
                          </div>
                        </>
                      )}
                      {voucherActionSubmitting && <div style={{ color: '#0d9488', fontWeight: 700, margin: '8px 0' }}>처리 중입니다...</div>}
                      <div className="su-modalFooter">
                        <button type="button" className="su-btnGhost" onClick={closeVoucherAction} style={{ minWidth: 80 }}>취소</button>
                        <button
                          type="button"
                          className="su-primaryBtn"
                          style={{ minWidth: 80, opacity: voucherActionSubmitting ? 0.5 : 1 }}
                          disabled={voucherActionSubmitting || (voucherActionMode === 'member' ? !selectedVoucherMember : !selectedVoucherShop)}
                          onClick={submitVoucherTransfer}
                        >
                          {voucherActionMode === 'member' ? '전송' : '결제'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div style={{ fontWeight: 700, margin: '18px 0 8px' }}>최근 상품권 내역</div>
                {voucherLoading ? (
                  <div style={{ textAlign: 'center', opacity: 0.5, padding: 12 }}>로딩 중...</div>
                ) : normalizedVoucherHistory.length === 0 ? (
                  <div style={{ textAlign: 'center', opacity: 0.6, padding: 12 }}>상품권 내역이 없습니다.</div>
                ) : (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {visibleVoucherHistory.map((v, idx) => {
                      const isPositive = v.amount > 0;
                      const reason = v.reason || '';
                      const isCancelled = v.statusLabel === '취소됨' || reason.includes('취소');
                      const badgeLabel = isCancelled ? '발행 취소' : (isPositive ? 'VIP 지급' : (reason.includes('결제') ? '상점 결제' : reason.includes('전송') ? '회원 전송' : '상품권'));
                      const badgeBg = isCancelled ? 'rgba(148,163,184,0.14)' : (isPositive ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.10)');
                      const badgeColor = isCancelled ? '#475569' : (isPositive ? '#059669' : '#dc2626');
                      return (
                        <div key={v.id || v.serial || `voucher-hist-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, borderRadius: 16, border: '1px solid rgba(226,232,240,0.95)', background: 'rgba(255,255,255,0.92)', padding: '12px 14px' }}>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 999, padding: '3px 8px', background: badgeBg, color: badgeColor, fontSize: 11, fontWeight: 800 }}>{badgeLabel}</div>
                            <div style={{ marginTop: 6, fontSize: 14, fontWeight: 800, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.reason}</div>
                            <div style={{ marginTop: 3, fontSize: 11, color: '#94a3b8' }}>{v.displayDate} · {v.serial}</div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: 18, fontWeight: 900, color: isPositive ? '#10b981' : '#ef4444' }}>{v.amount > 0 ? '+' : '-'}{formatVoucherAmount(v.amountAbs)}</div>
                          </div>
                        </div>
                      );
                    })}
                    {normalizedVoucherHistory.length > 6 && (
                      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
                        <button
                          type="button"
                          className="su-chip"
                          onClick={() => setVoucherHistoryExpanded((prev) => !prev)}
                          style={{ minWidth: 104 }}
                        >
                          {voucherHistoryExpanded ? '접기' : '더보기'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}
          </div>
        </>
      )}

      {/* ────────── 상점 포인트 카드 (Primary) ────────── */}
      {/* (지갑 관련 하단 wallet 블록 완전 제거) */}


      {myTab === 'activity' && (
        <>
          {/* 내 예약 목록 */}
          <section className="su-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div className="su-sectionTitle" style={{ marginBottom: 0 }}>📅 내 예약</div>
              <span style={{ fontSize: 12, color: 'var(--c-tx-s)', fontWeight: 700 }}>{myReservations.length}건</span>
            </div>
            {myRsvLoading ? (
              <div style={{ textAlign: 'center', opacity: 0.5, padding: 16 }}>로딩 중...</div>
            ) : myReservations.length === 0 ? (
              <div style={{ textAlign: 'center', opacity: 0.6, padding: 16, fontSize: 14 }}>예약 내역이 없습니다.</div>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {myReservations.map(rsv => (
                  <div key={rsv.reservationId || rsv.reservation_id} style={{
                    background: rsv.status === 'pending' ? '#fffbe6' : rsv.status === 'confirmed' ? '#e6f7ef' : rsv.status === 'rejected' ? '#fff0f0' : 'var(--c-surface)',
                    borderRadius: 12, padding: 14, border: '1px solid var(--c-border)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{rsv.shopName || rsv.shop_name || '상점'}</span>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 8,
                        background: rsv.status === 'pending' ? '#ffd666' : rsv.status === 'confirmed' ? '#52c41a' : rsv.status === 'rejected' ? '#ff4d4f' : '#aaa',
                        color: '#fff'
                      }}>
                        {rsv.status === 'pending' ? '대기중' : rsv.status === 'confirmed' ? '확정' : rsv.status === 'rejected' ? '거절' : rsv.status === 'cancelled' ? '취소됨' : rsv.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--c-tx-s)', display: 'grid', gap: 3 }}>
                      <div>📆 {(() => { const d = rsv.reservedDate || rsv.reserved_date || ''; return d.length > 10 ? d.slice(0, 10) : d; })()} {rsv.reservedTime || rsv.reserved_time}</div>
                      {(rsv.guestName || rsv.guest_name) && <div>👤 {rsv.guestName || rsv.guest_name}</div>}
                      {(rsv.guestPhone || rsv.guest_phone) && <div>📞 {rsv.guestPhone || rsv.guest_phone}</div>}
                      {(rsv.serviceName || rsv.service_name) && <div>🏷️ {rsv.serviceName || rsv.service_name}</div>}
                      {(rsv.numberOfPeople || rsv.number_of_people) && <div>👥 {rsv.numberOfPeople || rsv.number_of_people}명</div>}
                      {rsv.status === 'rejected' && (rsv.rejectReason || rsv.reject_reason) && (
                        <div style={{ color: '#ff4d4f', marginTop: 4 }}>거절 사유: {rsv.rejectReason || rsv.reject_reason}</div>
                      )}
                    </div>
                    <button type="button" onClick={async () => {
                      if (!window.confirm('이 예약을 삭제하시겠습니까?')) return;
                      try {
                        await storageAdapter.deleteReservation(rsv.id, effectiveUserId);
                        setMyReservations(prev => prev.filter(r => r.id !== rsv.id));
                      } catch (e) { window.alert('삭제 실패: ' + e.message); }
                    }} style={{ marginTop: 8, padding: '6px 0', width: '100%', borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#94a3b8', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>🗑️ 삭제</button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 전체 미션/이벤트 참여내역 */}
          {false && <section className="su-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div className="su-sectionTitle" style={{ marginBottom: 0 }}>전체 미션 / 이벤트 참여내역</div>
              <span style={{ fontSize: 12, color: 'var(--c-tx-s)', fontWeight: 700 }}>{missionParticipations.length}건</span>
            </div>
            {participationLoading ? (
              <div style={{ textAlign: 'center', opacity: 0.5, padding: 16 }}>로딩 중...</div>
            ) : missionParticipations.length === 0 ? (
              <div style={{ textAlign: 'center', opacity: 0.6, padding: 16, fontSize: 14 }}>참여한 미션/이벤트가 없습니다.</div>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {missionParticipations.map((item, index) => (
                  <SuMissionEventCard
                    key={item.id || `all-participation-${index}`}
                    item={item}
                    onDetail={() => navigate('/missions', { state: { highlightType: item.itemType, highlightId: String(item.itemId || item.id || '') } })}
                  />
                ))}
              </div>
            )}
          </section>}

          {/* 기존 내 상점 등록 관리 섹션 */}
          <section className="su-panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div className="su-sectionTitle">🏪 내 상점 등록 관리</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  type="button" 
                  onClick={() => navigate('/shops')} 
                  style={{ 
                    padding: '6px 12px', 
                    borderRadius: 8, 
                    border: '1px solid #DDE3EA', 
                    background: '#F0F2F4', 
                    fontWeight: 700,
                    fontSize: 13,
                    whiteSpace: 'nowrap'
                  }}
                >
                  상가 등록하기
                </button>
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              {
                (() => {
                  try {
                    if (safeMyShopsList.length === 0) {
                      return <div style={{ fontSize: 13, opacity: 0.7 }}>등록한 상점이 없습니다.</div>;
                    }
                    return (
                      <div style={{ display: 'grid', gap: 8 }}>
                        {safeMyShopsList.map((ms, idx) => (
                          <div key={ms.id || `myshop-${idx}`} className="su-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ fontWeight: 800 }}>{ms.name}</div>
                              <div style={{ fontSize: 13, opacity: 0.8 }}>{ms.status === 'pending' ? '승인대기' : (ms.status === 'rejected' ? '반려' : '승인완료')}</div>
                            </div>
                            <div style={{ marginTop: 8, fontSize: 13, opacity: 0.8 }}>{ms.address || ms.description || '-'}</div>
                            <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              <button type="button" onClick={() => navigate(`/shops/${encodeURIComponent(String(ms.id))}`, { state: { shop: ms } })} className="my-btn--cta">상세보기</button>
                              <button type="button" onClick={() => openShopEdit(ms)} className="my-btn--ghost">수정</button>
                              <button
                                type="button"
                                onClick={() => { setShopEventTarget(ms); setShopEventForm({ title: '', content: '', startDate: '', endDate: '', imageUrl: '' }); setShopEventModalOpen(true); }}
                                className="my-btn--event"
                              >🎉 이벤트 등록</button>
                              <button type="button" onClick={() => { navigator.clipboard && navigator.clipboard.writeText(ms.address || ''); alert('주소가 복사되었습니다.'); }} className="my-btn--text">주소 복사</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  } catch (e) {
                    console.error('[My.jsx] ❌ Error rendering shops:', e);
                    return <div style={{ fontSize: 13, opacity: 0.7 }}>상점을 불러오는 중 오류가 발생했습니다.</div>;
                  }
                })()
              }
            </div>
          </section>
        </>
      )}

      {/* ────────── (구버전 명함 요약 섹션 제거됨 — CardPage 이동 방식으로 전환) ────────── */}
      {false && <section className="su-panel">
        <div className="my-secondary-row" onClick={() => {}}>REMOVED</div></section>}

      {/* ────────── placeholder_card_section ────────── */}
      {false && <section className="su-panel">
        <div className="my-secondary-row" onClick={() => { setShowCardModal(true); setTimeout(() => { const el = document.getElementById('card-maker-section'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50); }}>
          <div className="my-secondary-row__left">
            <span className="my-secondary-row__icon">💳</span>
            <span className="my-secondary-row__label">내 명함</span>
            {cardCreated ? (
              <span className="my-secondary-row__badge">생성됨</span>
            ) : (
              <span className="my-secondary-row__badge">미생성</span>
            )}
          </div>
          <span className="my-secondary-row__arrow">›</span>
        </div>
        <div style={{ marginTop: 8 }}>
          {cardCreated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ width: 220, height: 132, borderRadius: 8, overflow: 'hidden', border: '1px solid #DDE3EA', maxWidth: '100%' }}>
                <img src={cardCreated.image} alt="명함" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 200 }}>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{cardCreated.name}</div>
                <div style={{ fontSize: 13, opacity: 0.85 }}>{cardCreated.title} {cardCreated.company && ('· ' + cardCreated.company)}</div>
                <div className="su-card-actions" style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                  <button type="button" onClick={downloadCard} className="su-chip">다운로드</button>
                  <button type="button" onClick={() => setShowCardModal(true)} className="su-chip">수정</button>
                  <button type="button" onClick={deleteCard} className="su-chip" style={{ color: '#ef4444' }}>삭제</button>
                  <button type="button" onClick={shareCard} className="su-chip" style={{ flexBasis: '100%' }}>공유</button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 13, opacity: 0.7 }}>아직 생성된 명함이 없습니다. "명함 생성"을 눌러 만드세요.</div>
          )}
        </div>
      </section>}

      {/* ────────── 일정 관리 ────────── */}
      {myTab === 'activity' && (
      <section className="su-panel">
        <div className="su-sectionTitle">
          📅 내 일정
          <button id="my-schedule-add" type="button" className="su-chip is-active" style={{ marginLeft: 8, fontSize: 12 }} onClick={() => { setEditingSchedule(null); setScheduleForm({ title: "", date: "", time: "", alarm: false }); debugOnce('modalOpen_schedule', { modal: 'schedule' }, null); setScheduleModalOpen(true); }} onPointerUp={(e) => handleTapOnce(e, () => { setEditingSchedule(null); setScheduleForm({ title: "", date: "", time: "", alarm: false }); setScheduleModalOpen(true); })}>+ 일정 추가</button>
          <label style={{ marginLeft: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <input type="checkbox" checked={!!alarmsEnabled} onChange={(e) => { setAlarmsEnabled(e.target.checked); try { localStorage.setItem('su_schedule_alarms_enabled', e.target.checked ? 'true' : 'false'); } catch (err) {} }} />
            <span style={{ fontSize: 13 }}>알림</span>
          </label>
          {/* 일정관리 토글: 상단 헤더는 항상 보이고, 아래의 일정 리스트 전체를 접기/펼치기 함 */}
          <button type="button" className="su-chip is-active" style={{ marginLeft: 8, fontSize: 12 }} onClick={() => setShowScheduleList(s => !s)}>{showScheduleList ? '일정관리 닫기' : '일정관리'}</button>
        </div>
        {showScheduleList ? (
          <div style={{ display: "grid", gap: 8 }}>
            {schedules.length === 0 ? (
              <div style={{ fontSize: 13, opacity: 0.6, display: 'flex', alignItems: 'center', gap: 8 }}>
                등록된 일정이 없습니다.
                <button type="button" onClick={() => { setEditingSchedule(null); setScheduleForm({ title: '', date: '', time: '' }); setScheduleModalOpen(true); }} style={{ fontSize: 12, color: 'var(--c-primary)', fontWeight: 700, background: 'none', border: '1.5px solid var(--c-primary)', borderRadius: 6, padding: '2px 8px', cursor: 'pointer' }}>+ 추가</button>
              </div>
            ) : (
              schedules.map((sch, idx) => (
                <div key={sch.id || `schedule-${idx}`} className="su-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{sch.title}</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>{sch.date} {sch.time}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button id={`my-schedule-item-${sch.id}`} type="button" className="su-chip" onClick={() => { setEditingSchedule(sch); setScheduleForm({ title: sch.title, date: sch.date, time: sch.time }); debugOnce(`modalOpen_schedule_item_${sch.id}`, { modal: 'schedule', id: sch.id }, null); setScheduleModalOpen(true); }} onPointerUp={(e) => handleTapOnce(e, () => { setEditingSchedule(sch); setScheduleForm({ title: sch.title, date: sch.date, time: sch.time }); setScheduleModalOpen(true); })}>수정</button>
                    <button type="button" className="su-chip" onClick={async () => {
                      try {
                        await scheduleService.updateSchedule(sch.id, { alarm: !sch.alarm });
                        const list = currentUserId ? await scheduleService.getSchedules(currentUserId) : [];
                        setSchedules(list);
                      } catch (e) {
                        console.error(e);
                      }
                    }}>{sch.alarm ? '🔔' : '🔕'}</button>
                    <button type="button" className="su-chip" style={{ color: "#ef4444" }} onClick={async () => {
                      await scheduleService.deleteSchedule(sch.id);
                      try {
                        const list = currentUserId ? await scheduleService.getSchedules(currentUserId) : [];
                        setSchedules(list);
                      } catch (e) {
                        setSchedules([]);
                      }
                    }}>삭제</button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : null}
      </section>
      )}

      {/* ────────── ② 일정 / 캘린더 (이동됨: 내 일정 바로 아래 표시) ────────── */}
      {myTab === 'activity' && (
      <section className="su-panel">
        <div className="su-sectionTitle">
          📅 일정
        </div>

        {/* 오늘 일정 강조 */}
        <div className="su-card" style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,191,36,0.05))", marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>📌 오늘 일정</div>
          {scheduleData.today.length > 0 ? (
            scheduleData.today.map((s, idx) => (
              <div key={s.id || `today-${idx}`} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #DDE3EA" }}>
                <span>{s.title}</span>
                <span style={{ opacity: 0.7 }}>{s.time}</span>
              </div>
            ))
          ) : (
            <div style={{ opacity: 0.7, display: 'flex', alignItems: 'center', gap: 8 }}>
              오늘 일정이 없습니다
              <button type="button" onClick={() => { setEditingSchedule(null); setScheduleForm({ title: '', date: '', time: '' }); setScheduleModalOpen(true); }} style={{ fontSize: 12, color: 'var(--c-primary)', fontWeight: 700, background: 'none', border: '1.5px solid var(--c-primary)', borderRadius: 6, padding: '2px 8px', cursor: 'pointer' }}>+ 추가</button>
            </div>
          )}
        </div>

        {/* 예정 일정 */}
        <div className="su-card">
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>🗓️ 예정 일정</div>
          {scheduleData.upcoming.length > 0 ? (
            scheduleData.upcoming.map((s, idx) => (
              <div key={s.id || `upcoming-${idx}`} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #DDE3EA" }}>
                <span>{s.title}</span>
                <span style={{ opacity: 0.7 }}>{s.date}</span>
              </div>
            ))
          ) : (
            <div style={{ opacity: 0.7, display: 'flex', alignItems: 'center', gap: 8 }}>
              예정된 일정이 없습니다
              <button type="button" onClick={() => { setEditingSchedule(null); setScheduleForm({ title: '', date: '', time: '' }); setScheduleModalOpen(true); }} style={{ fontSize: 12, color: 'var(--c-primary)', fontWeight: 700, background: 'none', border: '1.5px solid var(--c-primary)', borderRadius: 6, padding: '2px 8px', cursor: 'pointer' }}>+ 추가</button>
            </div>
          )}
        </div>
      </section>
      )}

      {/* (포인트 관리 UI는 wallet-body 내부로 이동됨) */}

      {/* ────────── VIP 상품권 ────────── */}
      {/* 하단 VIP 상품권(가로바) 완전 삭제 */}

      {/* ────────── 명함 만들기 (구버전 비활성화) ────────── */}
      {false && showCardModal ? (
        <section id="card-maker-section" className="su-panel">
          <div className="su-sectionTitle">💳 내 명함 만들기</div>
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <input placeholder="이름" value={cardData?.name || userData?.name || ''} onChange={(e) => setCardData(prev => ({ ...prev, name: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 8, marginBottom: 8 }} />
                <input placeholder="직함/역할" value={cardData?.title || ''} onChange={(e) => setCardData(prev => ({ ...prev, title: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 8, marginBottom: 8 }} />
                <input placeholder="연락처" value={cardData?.phone || userData?.phone || ''} onChange={(e) => setCardData(prev => ({ ...prev, phone: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 8, marginBottom: 8 }} />
                <input placeholder="이메일" value={cardData?.email || userData?.email || ''} onChange={(e) => setCardData(prev => ({ ...prev, email: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 8, marginBottom: 8 }} />
                <input placeholder="회사/소속" value={cardData?.company || ''} onChange={(e) => setCardData(prev => ({ ...prev, company: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 8, marginBottom: 8 }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => generateQr()} style={{ padding: '8px 12px', background: '#0C5460', color: '#fff', borderRadius: 8 }}>QR 생성</button>
                  <button onClick={() => downloadCard()} style={{ padding: '8px 12px', background: '#3D9DAB', color: '#fff', borderRadius: 8 }}>명함 다운로드 (PNG)</button>
                </div>
              </div>
              <div style={{ width: 260, border: '1px solid #DDE3EA', borderRadius: 8, padding: 12, background: '#F5F7FA' }}>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>미리보기</div>
                <div id="card-preview" style={{ width: '100%', height: 160, background: '#fff', color: '#000', borderRadius: 8, padding: 12, boxSizing: 'border-box', display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{cardData?.name || userData?.name || ''}</div>
                    <div style={{ fontSize: 12, color: '#555' }}>{cardData?.title || ''}</div>
                    <div style={{ marginTop: 8, fontSize: 12 }}>{cardData?.company || ''}</div>
                    <div style={{ marginTop: 8, fontSize: 12 }}>{cardData?.phone || userData?.phone || ''}</div>
                    <div style={{ fontSize: 12 }}>{cardData?.email || userData?.email || ''}</div>
                  </div>
                  <div style={{ width: 100, height: 100, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {qrSrc ? (
                      <img src={qrSrc} alt="qr" style={{ width: 96, height: 96 }} />
                    ) : (
                      <div style={{ fontSize: 12, color: '#999', textAlign: 'center' }}>QR 없음</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      

      {/* ────────── ④ 보급지원 / 구매내역 (홈 탭 보급지원 박스로 이동) ────────── */}
      {false && myTab === 'activity' && (
      <section className="su-panel">
        <div className="su-sectionTitle">
          📦 보급지원 / 구매내역
        </div>

        {/* 보급지원 신청 내역 */}
        <div className="su-card" style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🎁 내 신청 내역</span>
            {/* ✨ ADD: 전체보기 버튼 */}
            {supplyRequests.filter(r => r.status === 'PENDING' || r.status === 'REQUESTED').length > 1 && (
              <button
                onClick={() => setShowAllRequestsModal(true)}
                style={{
                  padding: '4px 10px',
                  fontSize: 12,
                  background: 'rgba(59,130,246,0.1)',
                  border: '1px solid rgba(59,130,246,0.3)',
                  borderRadius: 6,
                  color: '#3b82f6',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                전체보기
              </button>
            )}
          </div>
          {!supplyData ? (
            <div style={{ opacity: 0.5, textAlign: 'center', padding: '12px 0' }}>로딩 중...</div>
          ) : (() => {
              // ✅ PENDING만 표시 (1개만)
              const pendingRequests = supplyRequests.filter(r => r.status === 'PENDING' || r.status === 'REQUESTED');
              const displayRequests = pendingRequests.slice(0, 1); // ✨ UPDATE: 1개만
              return displayRequests.length > 0 ? (
                displayRequests.map((r, idx) => (
                  <div key={r.requestId || r.id || `request-${idx}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #DDE3EA" }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{r.itemName || r.item || '보급품'}</div>
                      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>현재 상태: 확인중입니다</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        background: 'rgba(234,179,8,0.15)',
                        color: '#92650A'
                      }}>대기중</span>
                      <span style={{ fontSize: 12, opacity: 0.6 }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ opacity: 0.7 }}>신청 내역이 없습니다</div>
              );
            })()
          }
        </div>

        {/* 보급지원 등록 (공급자 전용) */}
        {isSupplyManager && (
          <div className="su-card" style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 800 }}>➕ 보급품 등록</div>
              <div>
                <button onClick={() => { setEditingOfferId(null); setOfferForm({ item: '', manager: userData?.name || '', contact: userData?.phone || '', price: '', detail: '', image: '' }); setShowOfferModal(true); }} className="su-primaryBtn" style={{ padding: '8px 12px' }}>등록</button>
              </div>
            </div>
          </div>
        )}

        {/* 내 보급품 목록 (보급담당자 전용) */}
        {isSupplyManager && (
          <div className="su-card" style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>📦 내 보급품 목록</div>
            {mySupplyItems === null ? (
              <div style={{ opacity: 0.5, fontSize: 13 }}>로딩 중...</div>
            ) : mySupplyItems.length === 0 ? (
              <div style={{ opacity: 0.5, fontSize: 13 }}>등록한 보급품이 없습니다.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {mySupplyItems.map(item => {
                  const id = item.id;
                  const isEditing = editingMyItemId === id;
                  const STATUS_KO = { available: '가용', reserved: '예약', completed: '완료', scheduled: '신청예정', '등록': '등록', '신청': '신청' };
                  const STATUS_COLOR = { available: '#22c55e', reserved: '#a855f7', completed: '#3b82f6', scheduled: '#d97706', '등록': '#0C5460', '신청': '#f59e0b' };
                  return (
                    <div key={id} style={{ padding: '10px 12px', background: '#F8FAFC', borderRadius: 8, border: '1px solid #DDE3EA' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <input
                            value={editMyForm.title}
                            onChange={e => setEditMyForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="물품명"
                            style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, width: '100%' }}
                          />
                          <input
                            value={editMyForm.description}
                            onChange={e => setEditMyForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="설명"
                            style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, width: '100%' }}
                          />
                          <div style={{ display: 'flex', gap: 6 }}>
                            <input
                              type="number" min={0}
                              value={editMyForm.quantity}
                              onChange={e => setEditMyForm(f => ({ ...f, quantity: Number(e.target.value) }))}
                              placeholder="수량"
                              style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, width: 70 }}
                            />
                            <select
                              value={editMyForm.status}
                              onChange={e => setEditMyForm(f => ({ ...f, status: e.target.value }))}
                              style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, flex: 1 }}
                            >
                              <option value="available">가용</option>
                              <option value="scheduled">신청예정</option>
                              <option value="reserved">예약</option>
                              <option value="completed">완료</option>
                            </select>
                          </div>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button onClick={() => handleMyItemSave(id)} style={{ padding: '6px 14px', background: '#0C5460', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>저장</button>
                            <button onClick={() => { setEditingMyItemId(null); setEditMyForm({}); }} style={{ padding: '6px 14px', background: '#F0F2F4', color: '#637074', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>취소</button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{item.title}</div>
                            {item.description && <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>{item.description}</div>}
                            <div style={{ fontSize: 12, marginTop: 4, display: 'flex', gap: 8 }}>
                              <span>수량 <strong>{item.quantity ?? 0}</strong></span>
                              <span style={{ color: STATUS_COLOR[item.status] || '#637074', fontWeight: 600 }}>
                                {STATUS_KO[item.status] || item.status}
                              </span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleMyItemSetStatus(item, 'available')}
                              disabled={item.status === 'available'}
                              style={{ padding: '5px 10px', background: item.status === 'available' ? '#dcfce7' : 'transparent', color: '#16a34a', border: '1px solid #16a34a', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: item.status === 'available' ? 'default' : 'pointer', opacity: item.status === 'available' ? 1 : 0.7 }}
                            >
                              활성화
                            </button>
                            <button
                              onClick={() => handleMyItemSetStatus(item, 'scheduled')}
                              disabled={item.status === 'scheduled'}
                              style={{ padding: '5px 10px', background: item.status === 'scheduled' ? '#FEF3C7' : 'transparent', color: '#d97706', border: '1px solid #d97706', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: item.status === 'scheduled' ? 'default' : 'pointer', opacity: item.status === 'scheduled' ? 1 : 0.7 }}
                            >
                              신청예정
                            </button>
                            <button onClick={() => handleMyItemEdit(item)} style={{ padding: '5px 12px', background: '#E8F4FD', color: '#0C5460', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>수정</button>
                            <button onClick={() => handleMyItemDelete(id)} style={{ padding: '5px 12px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>삭제</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 구매 내역 */}
        <div className="su-card">
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🛒 구매 내역</span>
            {/* ✨ ADD: 전체보기 버튼 */}
            {(() => {
              const completedRequests = supplyRequests.filter(r => r.status === 'COMPLETED' || r.status === 'DONE' || r.status === 'CONFIRMED');
              const combinedPurchases = [...supplyPurchases, ...completedRequests.map(r => ({
                ...r,
                item: r.itemName || r.item,
                amount: r.amount || 0,
                status: '구매완료'
              }))];
              return combinedPurchases.length > 1 ? (
                <button
                  onClick={() => setShowAllPurchasesModal(true)}
                  style={{
                    padding: '4px 10px',
                    fontSize: 12,
                    background: 'rgba(34,197,94,0.1)',
                    border: '1px solid rgba(34,197,94,0.3)',
                    borderRadius: 6,
                    color: '#22c55e',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  전체보기
                </button>
              ) : null;
            })()}
          </div>
          {(() => {
            // ✅ COMPLETED 상태만 표시 (1개만)
            const completedRequests = supplyRequests.filter(r => r.status === 'COMPLETED' || r.status === 'DONE' || r.status === 'CONFIRMED');
            const combinedPurchases = [...supplyPurchases, ...completedRequests.map(r => ({
              ...r,
              item: r.itemName || r.item,
              amount: r.amount || 0,
              status: '구매완료'
            }))];
            const displayPurchases = combinedPurchases.slice(0, 1); // ✨ UPDATE: 1개만
            
            return displayPurchases.length > 0 ? (
              displayPurchases.map((p, idx) => (
                <div key={p.purchaseId || p.id || `purchase-${idx}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #DDE3EA" }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.item || p.itemName || '보급품'}</div>
                    <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>{new Date(p.completedAt || p.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {p.amount > 0 && <span style={{ fontWeight: 700 }}>{formatNumber(p.amount)}원</span>}
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      background: 'rgba(34,197,94,0.15)',
                      color: '#16A34A'
                    }}>완료</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ opacity: 0.7 }}>구매 내역이 없습니다</div>
            );
          })()}
        </div>
        {/* 등록된 보급품(공급자 본인) */}
        {offers.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>📦 등록된 보급품</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {offers.map((o, idx) => {
                const matching = supplyData ? (supplyData.requests || []).filter(r => r.item === o.item && (r.userId === effectiveUserId || r.applicantUserId === effectiveUserId)) : [];
                return (
                  <div key={o.id || `offer-${idx}`}>
                    <div className="su-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden' }}>
                      <div style={{ minWidth: 0, overflow: 'hidden', flex: '1 1 0' }}>
                        <div style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.item}</div>
                        <div style={{ fontSize: 12, opacity: 0.7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.manager} • {o.contact}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <div style={{ fontWeight: 700 }}>{formatNumber(o.price)}원</div>
                        {o.image && <img src={o.image} alt="thumb" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />}
                        <button onClick={() => {
                          // open modal in edit mode
                          setEditingOfferId(o.id);
                          setOfferForm({ item: o.item || '', manager: o.manager || '', contact: o.contact || '', price: o.price || '', detail: o.detail || '', image: o.image || '' });
                          setShowOfferModal(true);
                        }} style={{ padding: '6px 10px', background: '#0C5460', color: '#fff', borderRadius: 6 }}>수정</button>
                        <button onClick={async () => {
                          if (!window.confirm('이 보급품을 삭제하시겠습니까?')) return;
                          try {
                            await supplyService.deleteOffer(o.id);
                            const refreshed = await supplyService.getOffers(effectiveUserId);
                            setOffers(Array.isArray(refreshed) ? refreshed : []);
                          } catch (e) { window.alert('삭제 실패'); }
                        }} style={{ padding: '6px 10px', background: '#ef4444', color: '#fff', borderRadius: 6 }}>삭제</button>
                        {/* per-offer notification toggle for approver */}
                        <button onClick={() => {
                          try {
                            const key = `su_supply_notify_${effectiveUserId}_${o.id}`;
                            const cur = localStorage.getItem(key);
                            const next = (cur === null || cur === '1') ? '0' : '1';
                            localStorage.setItem(key, next);
                            // trigger rerender
                            setOffers((prev) => (prev ? [...prev] : []));
                          } catch (e) {}
                        }} style={{ padding: '6px 10px', background: (localStorage.getItem(`su_supply_notify_${effectiveUserId}_${o.id}`) === '0') ? '#ef4444' : '#0C5460', color: '#fff', borderRadius: 6 }}>{(localStorage.getItem(`su_supply_notify_${effectiveUserId}_${o.id}`) === '0') ? '알림 OFF' : '알림 ON'}</button>
                      </div>
                    </div>

                    {matching.length > 0 && (
                      <div style={{ marginTop: 8, marginBottom: 6 }}>
                        {matching.map((r, idx) => (
                      <div key={r.id || r.requestId || `match-${idx}`} className="su-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                            <div>
                              <div style={{ fontWeight: 700 }}>{r.applicantName || '신청자'}</div>
                              <div style={{ fontSize: 12, opacity: 0.75 }}>{r.applicantContact || '연락처 없음'}</div>
                              <div style={{ fontSize: 12, opacity: 0.6 }}>상태: {r.status}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              {r.status === '신청' && (
                                <button onClick={async () => {
                                  try {
                                    await supplyService.confirmRequest(r.id, effectiveUserId);
                                    const d = await supplyService.getSupplyData(effectiveUserId);
                                    setSupplyData(d || { requests: [], purchases: [] });
                                    window.alert('신청 확인처리 되었습니다. 신청자에게 상태가 전달됩니다.');
                                  } catch (e) { window.alert('확인 처리 실패'); }
                                }} style={{ padding: '6px 10px', background: '#0C5460', color: '#fff', borderRadius: 6 }}>확인</button>
                              )}
                              {r.status === '담당자 확인완료' && (
                                <button onClick={async () => {
                                  try {
                                    await supplyService.completeRequestAsPurchase(r.id, { amount: Number(o.price) || 0 });
                                    const d = await supplyService.getSupplyData(effectiveUserId);
                                    setSupplyData(d || { requests: [], purchases: [] });
                                    const refreshed = await supplyService.getOffers(effectiveUserId);
                                    setOffers(Array.isArray(refreshed) ? refreshed : []);
                                    window.alert('구매내역으로 이관되었습니다.');
                                  } catch (e) { window.alert('완료 처리 실패'); }
                                }} style={{ padding: '6px 10px', background: '#0C5460', color: '#fff', borderRadius: 6 }}>완료</button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ★ Issue B-2: 신청자 관리 (New Section with Tabs) */}
        {isSupplyManager && (
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #DDE3EA' }}>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 12 }}>📬 신청자 관리</div>
            
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {['all', 'pending', 'completed'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setManagedRequestTab(tab)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 20,
                    border: 'none',
                    background: managedRequestTab === tab ? '#0C5460' : '#F0F2F4',
                    color: managedRequestTab === tab ? '#fff' : '#637074',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {tab === 'all' ? '전체' : tab === 'pending' ? '대기' : '완료'}
                </button>
              ))}
            </div>

            {/* List */}
            {managedRequests === null ? (
              <div style={{ padding: 20, textAlign: 'center', opacity: 0.5 }}>로딩 중...</div>
            ) : managedRequests.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', opacity: 0.5 }}>신청 내역이 없습니다.</div>
            ) : (
              (() => {
                const filtered = managedRequests.filter(r => {
                  if (managedRequestTab === 'all') return true;
                  if (managedRequestTab === 'pending') return r.status === 'PENDING' || r.status === 'REQUESTED';
                  if (managedRequestTab === 'completed') return r.status === 'COMPLETED' || r.status === 'DONE';
                  return true;
                });

                if (filtered.length === 0) return <div style={{ padding: 20, textAlign: 'center', opacity: 0.5 }}>해당 상태의 신청이 없습니다.</div>;

                // Pagination: 3 items per page
                const pageSize = 3;
                const totalPages = Math.ceil(filtered.length / pageSize);
                const currentPage = Math.min(managedPage, totalPages - 1);
                const startIdx = currentPage * pageSize;
                const visibleItems = filtered.slice(startIdx, startIdx + pageSize);

                return (
                  <>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {visibleItems.map(r => (
                      <div key={r.id} className="su-card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{r.itemName || '(품목 미지정)'}</div>
                            <div style={{ fontSize: 13, marginTop: 4 }}>
                              <span style={{ fontWeight: 600 }}>{r.requesterName}</span>
                              <span style={{ opacity: 0.6 }}> • {r.createdAt ? new Date(r.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) : '날짜 미지정'}</span>
                            </div>
                            {r.requesterContact && (
                              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>📞 {r.requesterContact}</div>
                            )}
                            {r.message && <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>"{r.message}"</div>}
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ 
                              padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                              background: (r.status === 'COMPLETED' || r.status === 'DONE') ? 'rgba(34,197,94,0.15)' : 'rgba(234,179,8,0.15)',
                              color: (r.status === 'COMPLETED' || r.status === 'DONE') ? '#16A34A' : '#92650A'
                            }}>
                              {(r.status === 'COMPLETED' || r.status === 'DONE') ? '완료됨' : '대기중'}
                            </span>
                          </div>
                        </div>
                        
                        {(r.status === 'PENDING' || r.status === 'REQUESTED') && (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid #DDE3EA' }}>
                            <button 
                              onClick={() => handleCompleteRequest(r.id)}
                              style={{ 
                                padding: '6px 12px', background: '#0C5460', color: '#fff', borderRadius: 6, 
                                fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' 
                              }}
                            >
                              완료 처리
                            </button>
                          </div>
                        )}
                        
                         {(r.status === 'COMPLETED' || r.status === 'DONE') && r.completedAt && (
                          <div style={{ fontSize: 11, opacity: 0.5, textAlign: 'right' }}>
                            완료일: {new Date(r.completedAt).toLocaleString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid #DDE3EA', gap: 6 }}>
                      <button
                        onClick={() => setManagedPage(p => Math.max(0, p - 1))}
                        disabled={currentPage === 0}
                        style={{
                          padding: '6px 12px',
                          background: currentPage === 0 ? '#F0F2F4' : '#EEF1F5',
                          color: '#637074',
                          border: '1px solid #DDE3EA',
                          borderRadius: 6,
                          cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                          opacity: currentPage === 0 ? 0.5 : 1,
                          fontSize: 14,
                          fontWeight: 600
                        }}
                      >
                        &lt;
                      </button>
                      
                      {/* Page Numbers with ellipsis */}
                      {(() => {
                        const maxVisible = 5; // 최대 표시 페이지 수
                        const pages = [];
                        
                        if (totalPages <= maxVisible) {
                          // 전체 페이지가 적으면 모두 표시
                          for (let i = 0; i < totalPages; i++) {
                            pages.push(i);
                          }
                        } else {
                          // 많으면 축약
                          if (currentPage < 3) {
                            // 앞쪽에 있을 때: 1 2 3 4 ... 마지막
                            for (let i = 0; i < 4; i++) pages.push(i);
                            pages.push('ellipsis');
                            pages.push(totalPages - 1);
                          } else if (currentPage > totalPages - 4) {
                            // 뒤쪽에 있을 때: 1 ... 마지막-3 마지막-2 마지막-1 마지막
                            pages.push(0);
                            pages.push('ellipsis');
                            for (let i = totalPages - 4; i < totalPages; i++) pages.push(i);
                          } else {
                            // 중간에 있을 때: 1 ... 현재-1 현재 현재+1 ... 마지막
                            pages.push(0);
                            pages.push('ellipsis');
                            pages.push(currentPage - 1);
                            pages.push(currentPage);
                            pages.push(currentPage + 1);
                            pages.push('ellipsis');
                            pages.push(totalPages - 1);
                          }
                        }
                        
                        return pages.map((page, idx) => {
                          if (page === 'ellipsis') {
                            return <span key={`ellipsis-${idx}`} style={{ padding: '6px 4px', color: '#9BA8AE' }}>...</span>;
                          }
                          return (
                            <button
                              key={page}
                              onClick={() => setManagedPage(page)}
                              style={{
                                padding: '6px 12px',
                                background: page === currentPage ? '#0C5460' : '#F0F2F4',
                                color: page === currentPage ? '#fff' : '#637074',
                                border: '1px solid #DDE3EA',
                                borderRadius: 6,
                                cursor: 'pointer',
                                fontSize: 13,
                                fontWeight: page === currentPage ? 700 : 400,
                                minWidth: 32
                              }}
                            >
                              {page + 1}
                            </button>
                          );
                        });
                      })()}
                      
                      <button
                        onClick={() => setManagedPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={currentPage === totalPages - 1}
                        style={{
                          padding: '6px 12px',
                          background: currentPage === totalPages - 1 ? '#F0F2F4' : '#EEF1F5',
                          color: '#637074',
                          border: '1px solid #DDE3EA',
                          borderRadius: 6,
                          cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
                          opacity: currentPage === totalPages - 1 ? 0.5 : 1,
                          fontSize: 14,
                          fontWeight: 600
                        }}
                      >
                        &gt;
                      </button>
                    </div>
                  )}
                  </>
                );
              })()
            )}
          </div>
        )}

      {/* Legacy "Applicant List" removed or hidden to avoid duplication if needed, but keeping for safety as per "minimal modification" rule unless it conflicts. 
          The new section is distinct and clearly labeled "신청자 관리". 
          The previous section (Lines 2510~2550) was inside "Registered Offers" logic, which was confusing. 
          The new section renders independently at the bottom of the block.
      */}

      {/* Toast for permission updates */}
      <div>
        {/* reuse admin Toast component for consistent look */}
        {/* import dynamically to avoid circular issues */}
      </div>
      </section>
      )}

      {myTab === 'home' && homeView === 'distribution' && (
      <section className="su-panel">
        <button type="button" onClick={() => setHomeView('main')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-primary)', fontWeight: 700, fontSize: 13, padding: '0 0 10px 0' }}>← 홈으로</button>
        <div className="su-sectionTitle">🛍️ 유통지원 / 판매관리</div>

        <div className="su-card" style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>마이오피스에서 유통 상품 등록/관리</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => navigate('/distribution')} className="su-btnGhost">유통지원 홈</button>
              <button
                type="button"
                onClick={() => {
                  if (!isDistributionManager) {
                    setToast({ open: true, message: '관리자에게 유통지원 권한을 요청해 주세요.', type: 'warning' });
                    return;
                  }
                  openCreateDistributionForm();
                }}
                className="su-primaryBtn"
              >
                유통상품 등록
              </button>
            </div>
          </div>
          {!isDistributionManager && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#b45309', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)', borderRadius: 8, padding: '8px 10px' }}>
              현재 계정은 유통지원 권한이 없습니다. 관리자 회원관리에서 "유통지원 권한" 체크 후 등록 가능합니다.
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8, marginBottom: 10 }}>
          <div className="su-card">
            <div style={{ fontSize: 12, opacity: 0.75 }}>내 등록 상품</div>
            <div style={{ fontSize: 19, fontWeight: 800, marginTop: 4 }}>{distributionItems.length}</div>
          </div>
          <div className="su-card">
            <div style={{ fontSize: 12, opacity: 0.75 }}>판매 완료</div>
            <div style={{ fontSize: 19, fontWeight: 800, marginTop: 4 }}>
              {distributionManagedOrders.filter((row) => ['COMPLETED'].includes(String(row?.orderStatus || row?.order_status || '').toUpperCase())).length}
            </div>
          </div>
          <div className="su-card">
            <div style={{ fontSize: 12, opacity: 0.75 }}>주문/신청 내역</div>
            <div style={{ fontSize: 19, fontWeight: 800, marginTop: 4 }}>{distributionOrders.length}</div>
          </div>
          <div className="su-card">
            <div style={{ fontSize: 12, opacity: 0.75 }}>결제 수단</div>
            <div style={{ fontSize: 12, fontWeight: 700, marginTop: 6, color: '#0f766e' }}>포인트 결제 활성</div>
            <div style={{ fontSize: 11, opacity: 0.65, marginTop: 2 }}>카드결제 오픈예정</div>
          </div>
        </div>

        <div className="su-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>◆ 내 유통 주문내역</div>
            {distributionOrders.length > 5 && (
              <button type="button" onClick={() => setShowAllOrders((v) => !v)} style={{ fontSize: 11, color: '#0369a1', background: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: 20, cursor: 'pointer', fontWeight: 700, padding: '3px 10px', display: 'inline-flex', alignItems: 'center', gap: 3 }}>{showAllOrders ? '▲ 접기' : `▼ 전체보기 (${distributionOrders.length})`}</button>
            )}
          </div>
          {distributionLoading ? (
            <div style={{ opacity: 0.6 }}>로딩 중...</div>
          ) : distributionOrders.length === 0 ? (
            <div style={{ opacity: 0.7 }}>주문 내역이 없습니다.</div>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {(showAllOrders ? distributionOrders : distributionOrders.slice(0, 5)).map((row) => {
                const myOrderStatus = String(row?.orderStatus || row?.order_status || 'ORDERED').toUpperCase();
                const myReceiveMethod = String(row?.receiveMethod || row?.receive_method || 'delivery').toLowerCase();
                const myMsgMeta = parseMyOrderMessageMeta(row?.message);
                const buyerConfirmedAt = row?.buyerConfirmedAt || row?.buyer_confirmed_at;
                const withinReturnWindow = buyerConfirmedAt
                  ? (Date.now() - new Date(buyerConfirmedAt).getTime()) < 24 * 60 * 60 * 1000
                  : myOrderStatus === 'DELIVERED';
                const myCanCancel = ['ORDERED', 'ADMIN_CONFIRMED'].includes(myOrderStatus);
                const myCanReceive = ['IN_DELIVERY', 'PICKUP_READY'].includes(myOrderStatus);
                const myCanConfirm = myOrderStatus === 'DELIVERED';
                const myCanReturn = myOrderStatus === 'DELIVERED' && withinReturnWindow;
                const myStatusLabel = { ORDERED: '주문완료', ADMIN_CONFIRMED: '판매자확인', IN_DELIVERY: '배송중', PICKUP_READY: '방문준비', DELIVERED: '수령완료', COMPLETED: '구매확정', CANCELLED: '주문취소', RETURN_REQUESTED: '반품요청중', RETURNED: '반품완료' }[myOrderStatus] || myOrderStatus;
                return (
                  <div key={row.id || row.requestId} style={{ padding: '8px 10px', border: '1px solid #DDE3EA', borderRadius: 8, background: '#F8FAFC' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{row.itemName || '(상품명 없음)'}</div>
                        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>
                          {myReceiveMethod === 'pickup' ? '방문수령' : '택배'} {row.paymentAmount ? `· ${Number(row.paymentAmount).toLocaleString('ko-KR')}P` : ''}
                        </div>
                        {myReceiveMethod === 'delivery' && myMsgMeta.address && (
                          <div style={{ fontSize: 11, marginTop: 2, color: '#0f4c75', background: '#e8f4fd', padding: '2px 6px', borderRadius: 4, display: 'inline-block' }}>배송지: {myMsgMeta.address}</div>
                        )}
                        {myReceiveMethod === 'pickup' && myMsgMeta.visit && (
                          <div style={{ fontSize: 11, marginTop: 2, color: '#166534', background: '#dcfce7', padding: '2px 6px', borderRadius: 4, display: 'inline-block' }}>방문: {myMsgMeta.visit}</div>
                        )}
                        <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4, color: ['CANCELLED','RETURNED'].includes(myOrderStatus) ? '#dc2626' : ['COMPLETED'].includes(myOrderStatus) ? '#166534' : '#0369a1' }}>{myStatusLabel}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end', flexShrink: 0 }}>
                        {myCanCancel && (
                          <button type="button" onClick={() => handleDistributionManagedStatus(row, { orderStatus: 'CANCELLED', cancelReason: '구매자 취소' }, '주문이 취소되었습니다.')} style={{ padding: '4px 8px', border: 'none', borderRadius: 6, background: '#FEE2E2', color: '#dc2626', fontSize: 12 }}>주문취소</button>
                        )}
                        {myCanReceive && (
                          <button type="button" onClick={() => handleDistributionManagedStatus(row, { orderStatus: 'DELIVERED', buyerConfirmed: true }, '수령 확인되었습니다.')} style={{ padding: '4px 8px', border: 'none', borderRadius: 6, background: '#DBEAFE', color: '#1D4ED8', fontSize: 12, fontWeight: 700 }}>수령확인</button>
                        )}
                        {myCanConfirm && (
                          <button type="button" onClick={() => handleDistributionManagedStatus(row, { orderStatus: 'COMPLETED' }, '구매확정되었습니다.')} style={{ padding: '4px 8px', border: 'none', borderRadius: 6, background: '#DCFCE7', color: '#166534', fontSize: 12, fontWeight: 700 }}>구매확정</button>
                        )}
                        {myCanReturn && (
                          <button type="button" onClick={() => handleDistributionManagedStatus(row, { orderStatus: 'RETURN_REQUESTED', returnReason: '구매자 반품 요청' }, '반품 요청이 접수되었습니다.')} style={{ padding: '4px 8px', border: 'none', borderRadius: 6, background: '#FEF3C7', color: '#92400E', fontSize: 12 }}>반품요청</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="su-card">
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>�📦 내 등록 상품</div>
          {distributionLoading ? (
            <div style={{ opacity: 0.6 }}>로딩 중...</div>
          ) : distributionItems.length === 0 ? (
            <div style={{ opacity: 0.7 }}>등록된 유통 상품이 없습니다.</div>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {distributionItems.slice(0, 6).map((item) => (
                <div key={item.id} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #DDE3EA', background: '#F8FAFC' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} style={{ width: 46, height: 46, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 46, height: 46, borderRadius: 8, background: '#EEF2F7', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>NO IMG</div>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                      <div style={{ marginTop: 2, fontSize: 12, opacity: 0.75 }}>{formatNumber(item.price || 0)}P · 재고 {item.quantity ?? 0}</div>
                      <div style={{ marginTop: 2, fontSize: 11, color: '#475569' }}>{DISTRIBUTION_STATUS_LABELS[String(item.status || '').toLowerCase()] || String(item.status || '-')}</div>
                    </div>
                  </div>
                  {isDistributionManager && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 8 }}>
                      <button type="button" onClick={() => openEditDistributionForm(item)} style={{ padding: '5px 0', border: 'none', borderRadius: 6, background: '#E8F4FD', color: '#0C5460', fontSize: 12, fontWeight: 700 }}>수정</button>
                      <button type="button" onClick={() => handleDistributionStatus(item, 'available')} style={{ padding: '5px 0', border: '1px solid #16a34a', borderRadius: 6, background: String(item.status || '').toLowerCase() === 'available' ? '#dcfce7' : 'transparent', color: '#16a34a', fontSize: 12 }}>판매중</button>
                      <button type="button" onClick={() => handleDistributionStatus(item, 'soldout')} style={{ padding: '5px 0', border: '1px solid #d97706', borderRadius: 6, background: String(item.status || '').toLowerCase() === 'soldout' ? '#FEF3C7' : 'transparent', color: '#d97706', fontSize: 12 }}>품절</button>
                      <button type="button" onClick={() => handleDistributionStatus(item, 'hidden')} style={{ padding: '5px 0', border: '1px solid #64748b', borderRadius: 6, background: String(item.status || '').toLowerCase() === 'hidden' ? '#E2E8F0' : 'transparent', color: '#475569', fontSize: 12 }}>숨김</button>
                      <button type="button" onClick={() => handleDistributionDelete(item.id)} style={{ padding: '5px 0', border: 'none', borderRadius: 6, background: '#FEF2F2', color: '#dc2626', fontSize: 12, fontWeight: 700 }}>삭제</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="su-card" style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>💰 판매 포인트지갑</div>
            <button
              type="button"
              onClick={() => setDistWithdrawOpen((v) => !v)}
              disabled={!distWallet || distWallet.available <= 0}
              style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 6, border: 'none', background: distWallet && distWallet.available > 0 ? '#0f766e' : '#94A3B8', color: '#fff', cursor: distWallet && distWallet.available > 0 ? 'pointer' : 'not-allowed' }}
            >출금요청</button>
          </div>
          {distWalletLoading ? (
            <div style={{ opacity: 0.6, fontSize: 13 }}>잔액 조회 중...</div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                <div style={{ background: '#F0FDF4', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#166534', fontWeight: 600 }}>누적 판매대금</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#166534', marginTop: 2 }}>{(distWallet?.totalEarned ?? 0).toLocaleString('ko-KR')}P</div>
                </div>
                <div style={{ background: '#FEF3C7', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#92400E', fontWeight: 600 }}>출금신청액</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#92400E', marginTop: 2 }}>{(distWallet?.totalWithdrawn ?? 0).toLocaleString('ko-KR')}P</div>
                </div>
                <div style={{ background: '#EFF6FF', borderRadius: 8, padding: '8px 10px', textAlign: 'center', gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: 11, color: '#1D4ED8', fontWeight: 600 }}>출금가능</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#1D4ED8', marginTop: 2 }}>{(distWallet?.available ?? 0).toLocaleString('ko-KR')}P</div>
                </div>
              </div>
              {distWithdrawOpen && (
                <form onSubmit={handleDistWithdraw} style={{ background: '#F8FAFC', border: '1px solid #DDE3EA', borderRadius: 8, padding: '12px 14px', marginBottom: 10, display: 'grid', gap: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0f766e' }}>출금 요청 - 가용: {(distWallet?.available ?? 0).toLocaleString('ko-KR')}P</div>
                  <input className="su-input" type="number" min="1" max={distWallet?.available ?? 0} placeholder="출금 금액(P)" value={distWithdrawForm.amount} onChange={(e) => setDistWithdrawForm((f) => ({ ...f, amount: e.target.value }))} style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, color: '#1E293B', background: '#fff' }} required />
                  <input className="su-input" type="text" placeholder="은행명" value={distWithdrawForm.bankName} onChange={(e) => setDistWithdrawForm((f) => ({ ...f, bankName: e.target.value }))} style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, color: '#1E293B', background: '#fff' }} required />
                  <input className="su-input" type="text" placeholder="계좌번호" value={distWithdrawForm.accountNumber} onChange={(e) => setDistWithdrawForm((f) => ({ ...f, accountNumber: e.target.value }))} style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, color: '#1E293B', background: '#fff' }} required />
                  <input className="su-input" type="text" placeholder="예금주명" value={distWithdrawForm.depositorName} onChange={(e) => setDistWithdrawForm((f) => ({ ...f, depositorName: e.target.value }))} style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, color: '#1E293B', background: '#fff' }} required />
                  <input className="su-input" type="text" placeholder="메모 (선택)" value={distWithdrawForm.memo} onChange={(e) => setDistWithdrawForm((f) => ({ ...f, memo: e.target.value }))} style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 13, color: '#1E293B', background: '#fff' }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="submit" disabled={distWithdrawSubmitting} style={{ flex: 1, padding: '8px', borderRadius: 6, border: 'none', background: '#0f766e', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>{distWithdrawSubmitting ? '처리 중...' : '출금 요청'}</button>
                    <button type="button" onClick={() => setDistWithdrawOpen(false)} style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #CBD5E1', background: '#fff', fontSize: 13, cursor: 'pointer' }}>취소</button>
                  </div>
                </form>
              )}
              {distWallet?.withdrawals?.length > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>출금 이력</div>
                    {distWallet.withdrawals.length > 5 && (
                      <button type="button" onClick={() => setShowAllWithdrawals((v) => !v)} style={{ fontSize: 11, color: '#0369a1', background: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: 20, cursor: 'pointer', fontWeight: 700, padding: '3px 10px', display: 'inline-flex', alignItems: 'center', gap: 3 }}>{showAllWithdrawals ? '▲ 접기' : `▼ 전체보기 (${distWallet.withdrawals.length})`}</button>
                    )}
                  </div>
                  <div style={{ display: 'grid', gap: 6 }}>
                    {(showAllWithdrawals ? distWallet.withdrawals : distWallet.withdrawals.slice(0, 5)).map((w) => {
                      const wStatus = String(w.status || 'PENDING').toUpperCase();
                      const wStatusLabel = { PENDING: '대기중', APPROVED: '승인됨', PAID: '지급완료', REJECTED: '거절됨' }[wStatus] || wStatus;
                      const wStatusColor = { PENDING: '#92400E', APPROVED: '#1D4ED8', PAID: '#166534', REJECTED: '#dc2626' }[wStatus] || '#475569';
                      return (
                        <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: '#F8FAFC', borderRadius: 6, border: '1px solid #E2E8F0' }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>{Number(w.amount || 0).toLocaleString('ko-KR')}P</div>
                            <div style={{ fontSize: 11, opacity: 0.7 }}>{w.bank_name} {w.account_number} ({w.depositor_name})</div>
                            <div style={{ fontSize: 11, opacity: 0.6 }}>{w.requested_at ? new Date(w.requested_at).toLocaleDateString('ko-KR') : ''}</div>
                            {w.reject_reason && <div style={{ fontSize: 11, color: '#dc2626' }}>사유: {w.reject_reason}</div>}
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: wStatusColor }}>{wStatusLabel}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="su-card" style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>📬 내 유통 판매 관리</div>
            {distributionManagedOrders.length > 5 && (
              <button type="button" onClick={() => setShowAllSales((v) => !v)} style={{ fontSize: 11, color: '#0369a1', background: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: 20, cursor: 'pointer', fontWeight: 700, padding: '3px 10px', display: 'inline-flex', alignItems: 'center', gap: 3 }}>{showAllSales ? '▲ 접기' : `▼ 전체보기 (${distributionManagedOrders.length})`}</button>
            )}
          </div>
          {distributionLoading ? (
            <div style={{ opacity: 0.6 }}>로딩 중...</div>
          ) : distributionManagedOrders.length === 0 ? (
            <div style={{ opacity: 0.7 }}>처리할 주문이 없습니다.</div>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {(showAllSales ? distributionManagedOrders : distributionManagedOrders.slice(0, 5)).map((row) => {
                const orderStatus = String(row?.orderStatus || row?.order_status || row?.status || 'ORDERED').toUpperCase();
                const receiveMethod = String(row?.receiveMethod || row?.receive_method || 'delivery').toLowerCase();
                const sellerMsgMeta = parseMyOrderMessageMeta(row?.message);
                return (
                  <div key={row.id || row.requestId} style={{ padding: '8px 10px', border: '1px solid #DDE3EA', borderRadius: 8, background: '#F8FAFC' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{row.itemName || '(상품 미지정)'}</div>
                        {(() => {
                          const rowRegionName = row.regionName || (() => {
                            const rid = String(row.regionId || '');
                            if (!rid) return '';
                            const found = memberRegions.find((rg) => String(rg.id || rg.regionId || rg.region_id || '') === rid || String(rg.regionId || rg.region_id || '') === rid);
                            return String(found?.name || found?.regionName || '').trim();
                          })();
                          return (
                            <div style={{ marginTop: 2, fontSize: 12, opacity: 0.75 }}>
                              {row.requesterName || '구매자'}{rowRegionName ? ` · ${rowRegionName}` : ''} · {receiveMethod === 'pickup' ? '방문' : '택배'}{row.paymentAmount ? ` · ${Number(row.paymentAmount).toLocaleString('ko-KR')}P` : ''}
                            </div>
                          );
                        })()}
                        {row.requesterContact && (
                          <div style={{ marginTop: 2, fontSize: 11, color: '#334155' }}>📞 {row.requesterContact}</div>
                        )}
                        {receiveMethod === 'delivery' && sellerMsgMeta.address && (
                          <div style={{ marginTop: 2, fontSize: 11, color: '#0f4c75', background: '#e8f4fd', padding: '2px 6px', borderRadius: 4, display: 'inline-block' }}>배송지: {sellerMsgMeta.address}</div>
                        )}
                        {receiveMethod === 'pickup' && sellerMsgMeta.visit && (
                          <div style={{ marginTop: 2, fontSize: 11, color: '#166534', background: '#dcfce7', padding: '2px 6px', borderRadius: 4, display: 'inline-block' }}>방문: {sellerMsgMeta.visit}</div>
                        )}
                        <div style={{ marginTop: 3, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <span style={{
                            fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 10,
                            background: orderStatus === 'COMPLETED' ? '#166534' : orderStatus === 'ORDERED' ? '#e0f2fe' : orderStatus === 'ADMIN_CONFIRMED' ? '#dbeafe' : orderStatus === 'IN_DELIVERY' ? '#dbeafe' : orderStatus === 'PICKUP_READY' ? '#ecfccb' : orderStatus === 'DELIVERED' ? '#dcfce7' : orderStatus === 'CANCELLED' ? '#fee2e2' : orderStatus === 'RETURN_REQUESTED' ? '#fef3c7' : orderStatus === 'RETURNED' ? '#fef3c7' : '#f1f5f9',
                            color: orderStatus === 'COMPLETED' ? '#fff' : orderStatus === 'ORDERED' ? '#075985' : orderStatus === 'ADMIN_CONFIRMED' ? '#1d4ed8' : orderStatus === 'IN_DELIVERY' ? '#1d4ed8' : orderStatus === 'PICKUP_READY' ? '#4d7c0f' : orderStatus === 'DELIVERED' ? '#166534' : orderStatus === 'CANCELLED' ? '#dc2626' : orderStatus === 'RETURN_REQUESTED' ? '#92400e' : orderStatus === 'RETURNED' ? '#92400e' : '#475569',
                          }}>{({ ORDERED: '주문완료', ADMIN_CONFIRMED: '주문확인됨', IN_DELIVERY: '배송중', PICKUP_READY: '방문준비', DELIVERED: '수령완료', COMPLETED: '판매완료', CANCELLED: '주문취소', RETURN_REQUESTED: '반품요청', RETURNED: '반품완료' })[orderStatus] || orderStatus}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {orderStatus === 'ORDERED' && (
                          <button type="button" onClick={() => handleDistributionManagedStatus(row, { orderStatus: 'ADMIN_CONFIRMED' }, '주문 확인 처리했습니다.')} style={{ padding: '4px 8px', border: 'none', borderRadius: 6, background: '#E0F2FE', color: '#075985', fontSize: 12, fontWeight: 700 }}>주문확인</button>
                        )}
                        {orderStatus === 'ADMIN_CONFIRMED' && receiveMethod === 'delivery' && (
                          <button type="button" onClick={() => handleDistributionManagedStatus(row, { orderStatus: 'IN_DELIVERY' }, '배송중 상태로 변경했습니다.')} style={{ padding: '4px 8px', border: 'none', borderRadius: 6, background: '#DBEAFE', color: '#1D4ED8', fontSize: 12, fontWeight: 700 }}>배송처리</button>
                        )}
                        {orderStatus === 'ADMIN_CONFIRMED' && receiveMethod === 'pickup' && (
                          <button type="button" onClick={() => handleDistributionManagedStatus(row, { orderStatus: 'PICKUP_READY' }, '방문 준비 상태로 변경했습니다.')} style={{ padding: '4px 8px', border: 'none', borderRadius: 6, background: '#ECFCCB', color: '#4D7C0F', fontSize: 12, fontWeight: 700 }}>방문준비</button>
                        )}
                        {orderStatus === 'RETURN_REQUESTED' && (
                          <button type="button" onClick={() => handleDistributionManagedStatus(row, { orderStatus: 'RETURNED', returnReason: '판매자 승인 반품' }, '반품 승인 처리되었습니다.')} style={{ padding: '4px 8px', border: 'none', borderRadius: 6, background: '#FEF3C7', color: '#92400E', fontSize: 12, fontWeight: 700 }}>반품승인</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
      )}

      {/* ────────── ⑤ 친구 / 커뮤니케이션 ────────── */}
      {myTab === 'activity' && (
      <section className="su-panel">
        <div className="su-sectionTitle">
          👥 친구
          <span style={{ fontSize: 12, opacity: 0.6, fontWeight: 400 }}>({friendCount}명)</span>
        </div>

        {/* 회원 친구 추가 */}
        <button
          type="button"
          onClick={() => openFriendModal()}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 12,
            border: "none",
            background: "#0C5460",
            color: "#fff",
            fontWeight: 800,
            fontSize: 14,
            cursor: "pointer",
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          ➕ 회원 친구 추가
        </button>

        {/* 친구 목록 */}
        <div className="su-card">
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>친구 목록</div>
          {friends.length > 0 ? (
            friends.map((f) => (
              <div key={f.id || f.memberId} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #DDE3EA" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{f.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.6 }}>가입: {f.joinDate}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => openChatWith(f)} style={{ padding: '6px 10px', borderRadius: 6, background: '#0C5460', color: '#fff' }}>채팅</button>
                  <button type="button" onClick={() => handleRemoveFriend(f)} style={{ padding: '6px 10px', borderRadius: 6, background: '#ef4444', color: '#fff' }}>삭제</button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ opacity: 0.7 }}>친구가 없습니다</div>
          )}
        </div>
      </section>
      )}

      {/* Friend modal */}
      {friendModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
          <div className="su-modal su-modal--lg">
            <div className="su-modalHeader">회원 친구 추가</div>
            <div style={{ marginBottom: 10 }}>
              <input
                value={friendSearchName}
                onChange={(e) => setFriendSearchName(e.target.value)}
                placeholder="회원 이름을 정확히 입력 (예: 홍길동)"
                className="su-input"
                style={{ width: '100%' }}
              />
              <div style={{ marginTop: 6, fontSize: 12, color: 'var(--c-tx-s)' }}>
                유사한 이름은 표시되지 않습니다. 이름이 완전히 일치할 때만 검색됩니다.
              </div>
            </div>
            <div style={{ maxHeight: 420, overflowY: 'auto' }}>
              {filteredFriendCandidates.length > 0 ? filteredFriendCandidates.map((m) => (
                <div key={m.id || m.memberId} className="su-listItem" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--c-tx-s)' }}>{m.phone || m.email || ''}</div>
                  </div>
                  <div>
                    <button type="button" onClick={() => handleAddFriend(m)} style={{ padding: '6px 10px', borderRadius: 6, background: '#0C5460', color: '#fff' }}>추가</button>
                  </div>
                </div>
              )) : (
                <div style={{ color: 'var(--c-tx-s)' }}>
                  {normalizeExactName(friendSearchName) ? '이름이 정확히 일치하는 회원이 없습니다.' : '이름을 정확히 입력하면 검색됩니다.'}
                </div>
              )}
            </div>
            <div className="su-modalFooter">
              <button type="button" onClick={() => { setFriendModalOpen(false); setFriendSearchName(''); }} className="su-btnGhost">닫기</button>
            </div>
          </div>
        </div>
      )}

      {/* Chat modal */}
      {chatOpen && activeChatFriend && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300 }}>
          <div className="su-modal su-modal--lg" style={{ height: 520, display: 'flex', flexDirection: 'column' }}>
            <div className="su-modalHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{activeChatFriend.name} 님과의 채팅</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13 }}>공유 알림</span>
                <button type="button" onClick={() => { toggleChatSound(); }} style={{ padding: '4px 8px', borderRadius: 999, background: chatSoundEnabled ? 'rgba(16,185,129,0.12)' : 'var(--c-subtle)', color: chatSoundEnabled ? '#10b981' : 'var(--c-tx-s)', fontWeight: 700, fontSize: 12, border: '1px solid var(--c-border)' }}>{chatSoundEnabled ? 'ON' : 'OFF'}</button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 8, borderRadius: 8, background: 'var(--c-subtle)', margin: '8px 0' }}>
              {(chatMessages || []).map(m => (
                <div key={m.id} style={{ marginBottom: 8, textAlign: m.from === String(effectiveUserId) ? 'right' : 'left' }}>
                  <div style={{ display: 'inline-block', padding: '8px 12px', borderRadius: 8, background: m.from === String(effectiveUserId) ? 'var(--c-primary)' : 'var(--c-surface)', color: m.from === String(effectiveUserId) ? '#fff' : 'var(--c-tx-h)', border: '1px solid var(--c-border)' }}>{m.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--c-tx-s)', marginTop: 4 }}>{new Date(m.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input id="chat-input" placeholder="메시지 입력" className="su-input" style={{ flex: 1 }}
                onKeyDown={async (e) => { if (e.key === 'Enter') { const text = e.target.value?.trim(); if (text) { await sendChatMessage(text); e.target.value = ''; } } }}
              />
              <button type="button" onClick={async () => {
                const el = document.getElementById('chat-input');
                if (!el) return; const text = el.value && el.value.trim(); if (!text) return; await sendChatMessage(text); el.value = '';
              }} className="su-primaryBtn">전송</button>
              <button type="button" onClick={() => { setChatOpen(false); setActiveChatFriend(null); setChatMessages([]); }} className="su-btnGhost">닫기</button>
            </div>
          </div>
        </div>
      )}

      {/* 스마트비서(라라) 설정 섹션 제거됨 */}
      {/* Scanner modal for point payment */}
      {scannerOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1400 }}>
          <div className="su-modal su-modal--lg" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="su-modalHeader" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>QR 스캔</span>
              <button type="button" onClick={() => { setScannerOpen(false); setScannerError(null); }} className="su-btnGhost" style={{ padding: '6px 10px' }}>취소</button>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: 420, height: 320, background: '#000', borderRadius: 8, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline />
                </div>
              </div>
              <div style={{ width: 260 }}>
                <div style={{ marginBottom: 8 }}>스캔 중입니다. 카메라가 QR을 인식하면 자동으로 결제가 진행됩니다.</div>
                {scannerError && (<div style={{ color: '#EF4444', marginBottom: 8 }}>{scannerError}</div>)}
                {!('BarcodeDetector' in window) && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 13, marginBottom: 6 }}>카메라 미지원 기기입니다. QR 문자열을 붙여넣기 하세요.</div>
                    <input id="manual-qr" placeholder="qrPayload 또는 su://pay?qrPayload=..." className="su-input" style={{ width: '100%' }} />
                    <button
                      type="button"
                      onClick={async () => {
                        const v = document.getElementById('manual-qr');
                        const raw = v ? String(v.value || '').trim() : '';
                        if (!raw) {
                          window.alert('QR 문자열을 입력하세요.');
                          return;
                        }

                        let token = null;
                        try {
                          const u = new URL(raw);
                          token = u.searchParams.get('qrPayload');
                        } catch (e) {}
                        if (!token) {
                          const m = raw.match(/(?:^|[?&])qrPayload=([^&#]+)/i);
                          token = m ? decodeURIComponent(m[1]) : null;
                        }
                        if (!token) {
                          const parts = raw.split('.');
                          if (parts.length === 3 && parts.every(p => p && p.length > 0)) token = raw;
                        }
                        if (!token) {
                          try {
                            const j = JSON.parse(raw);
                            if (j && typeof j === 'object' && j.qrPayload) token = String(j.qrPayload);
                          } catch (e) {}
                        }

                        if (!token) {
                          window.alert('유효하지 않은 QR입니다. (qrPayload 필요)');
                          return;
                        }

                        await payWithQr({ qrPayload: token, amount: pendingPayAmount });
                      }}
                      className="su-primaryBtn"
                      style={{ marginTop: 8, width: '100%' }}
                    >
                      결제
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
  
  {renderPayoutModal()}
  {renderAllPayoutsModal()}
  {renderShopEditModal()}
  {/* 이벤트 등록 모달 */}
  {shopEventModalOpen && shopEventTarget && (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1460 }}
      onClick={() => { if (!shopEventSaving) setShopEventModalOpen(false); }}
    >
      <div
        style={{ background: '#1a2332', borderRadius: '16px 16px 0 0', width: '100%', maxWidth: 480, padding: '24px 20px 32px', boxShadow: '0 -8px 40px rgba(0,0,0,0.45)', maxHeight: '90dvh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontWeight: 800, fontSize: 17, color: '#e2e8f0' }}>🎉 이벤트 등록</div>
          <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{shopEventTarget.name}</div>
        </div>
        <div style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: 8, padding: '8px 12px', marginBottom: 14, fontSize: 12, color: '#fb923c' }}>
          승인 대기 상태로 등록됩니다. 관리자 승인 후 사용자 화면에 노출됩니다.
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>이벤트 제목 *</div>
            <input
              value={shopEventForm.title}
              onChange={e => setShopEventForm(p => ({ ...p, title: e.target.value }))}
              placeholder="예: 봄맞이 20% 할인 이벤트"
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#e2e8f0', fontSize: 14, boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>이벤트 내용</div>
            <textarea
              value={shopEventForm.content}
              onChange={e => setShopEventForm(p => ({ ...p, content: e.target.value }))}
              placeholder="이벤트 상세 내용을 입력하세요"
              rows={3}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#e2e8f0', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>시작일 *</div>
              <input
                type="date"
                value={shopEventForm.startDate}
                onChange={e => setShopEventForm(p => ({ ...p, startDate: e.target.value }))}
                style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#e2e8f0', fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>종료일 *</div>
              <input
                type="date"
                value={shopEventForm.endDate}
                onChange={e => setShopEventForm(p => ({ ...p, endDate: e.target.value }))}
                style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#e2e8f0', fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>이미지 URL (선택)</div>
            <input
              value={shopEventForm.imageUrl}
              onChange={e => setShopEventForm(p => ({ ...p, imageUrl: e.target.value }))}
              placeholder="https://..."
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#e2e8f0', fontSize: 13, boxSizing: 'border-box' }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button
            type="button"
            onClick={() => setShopEventModalOpen(false)}
            disabled={shopEventSaving}
            style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#94a3b8', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >취소</button>
          <button
            type="button"
            disabled={shopEventSaving}
            onClick={async () => {
              if (!shopEventForm.title.trim()) { alert('이벤트 제목을 입력하세요.'); return; }
              if (!shopEventForm.startDate || !shopEventForm.endDate) { alert('시작일과 종료일을 입력하세요.'); return; }
              if (shopEventForm.endDate < shopEventForm.startDate) { alert('종료일은 시작일보다 빠를 수 없습니다.'); return; }
              try {
                setShopEventSaving(true);
                const session = getSession();
                const shopId = shopEventTarget.id || shopEventTarget.shopId;
                await storageAdapter.createShopEvent(
                  { shopId, title: shopEventForm.title, content: shopEventForm.content, imageUrl: shopEventForm.imageUrl || null, startDate: shopEventForm.startDate, endDate: shopEventForm.endDate },
                  session?.sessionId, session?.memberId
                );
                setShopEventModalOpen(false);
                alert('이벤트가 등록되었습니다. 관리자 승인 후 노출됩니다.');
              } catch (e) {
                alert('이벤트 등록 실패: ' + e.message);
              } finally {
                setShopEventSaving(false);
              }
            }}
            style={{ flex: 2, padding: '11px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(90deg,#f97316,#ef4444)', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}
          >
            {shopEventSaving ? '등록 중...' : '이벤트 등록'}
          </button>
        </div>
      </div>
    </div>
  )}
  {renderScheduleModal()}
  {renderCardModal()}
  {renderOfferModal()}
  {renderDistributionFormModal()}
  {renderAllRequestsModal()}
  {renderAllPurchasesModal()}
  <SiteConfirmModal
    open={voucherConfirmState.open}
    title={voucherConfirmState.title}
    message={voucherConfirmState.message}
    details={voucherConfirmState.details}
    confirmText={voucherConfirmState.confirmText}
    cancelText="취소"
    tone="teal"
    onCancel={() => closeVoucherConfirm(false)}
    onConfirm={() => closeVoucherConfirm(true)}
  />

  {/* 명함 없음 확인 모달 */}
  {showNoCardConfirm && (
    <div
      onClick={() => setShowNoCardConfirm(false)}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300, padding: 24 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 20, padding: '28px 24px', width: '100%', maxWidth: 360, textAlign: 'center' }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>💳</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: '#0D1B21', marginBottom: 8 }}>명함이 없습니다</div>
        <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>
          지금 바로 디지털 명함을 만들어 보세요.
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={() => setShowNoCardConfirm(false)}
            style={{ flex: 1, padding: '12px 0', borderRadius: 12, background: '#f3f4f6', border: 'none', fontSize: 15, fontWeight: 700, color: '#374151', cursor: 'pointer' }}
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => { setShowNoCardConfirm(false); setShowCardCreate(true); }}
            style={{ flex: 1, padding: '12px 0', borderRadius: 12, background: 'var(--c-primary)', border: 'none', fontSize: 15, fontWeight: 700, color: '#fff', cursor: 'pointer' }}
          >
            명함 만들기
          </button>
        </div>
      </div>
    </div>
  )}

  {/* 명함 생성 모달 */}
  {showCardCreate && (
    <CardCreateModal
      onClose={() => setShowCardCreate(false)}
      onSaved={(slug) => {
        setShowCardCreate(false);
        navigate(`/card/${slug}`);
      }}
    />
  )}
  
  {/* Toast Notification */}
  <Toast 
    open={toast.open} 
    message={toast.message} 
    type={toast.type}
    onClose={() => setToast({ open: false, message: "", type: "success" })} 
  />

  {/* Custom Alert Modal */}
  {customAlert.open && (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setCustomAlert({ open: false, message: '' })}>
      <div style={{ width: 'min(90%, 380px)', borderRadius: 16, background: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', overflow: 'hidden', animation: 'myAlertSlideUp 0.25s ease-out' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '20px 20px 14px', fontSize: 15, lineHeight: 1.7, color: '#1e293b', fontWeight: 600 }}>{customAlert.message}</div>
        <div style={{ borderTop: '1px solid #e2e8f0' }}>
          <button type="button" onClick={() => setCustomAlert({ open: false, message: '' })} style={{ width: '100%', padding: 14, border: 'none', background: '#0e7490', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', borderRadius: '0 0 16px 16px' }}>확인</button>
        </div>
      </div>
    </div>
  )}
  <style>{`@keyframes myAlertSlideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }`}</style>
  </div>
  );
}
