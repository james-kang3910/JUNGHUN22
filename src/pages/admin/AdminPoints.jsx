import React, { useState, useMemo, useEffect } from "react";
console.log('[PAGE]', 'AdminPoints.jsx (active)');
import { isPointsTransferEnabled, setPointsTransferEnabled } from "../../lib/pointsGuard";
import * as storageAdapter from "../../lib/storageAdapter";
import * as shopStore from "../../lib/shopStore";
import { isAuthReady } from "../../lib/authStore";
import { usePageLoad } from "../../hooks/usePageLoad";

// ★ 포인트 타입 라벨 (서버 기반)
const POINT_TYPE_LABELS = {
  ADMIN: { label: '관리자', bg: 'rgba(168,85,247,0.15)', color: '#a855f7' },
  PURCHASE: { label: '구매', bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  REFUND: { label: '환불', bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
  REWARD: { label: '보상', bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  TRANSFER_IN: { label: '받기', bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
  TRANSFER_OUT: { label: '보내기', bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  CANCEL: { label: '취소', bg: 'rgba(107,114,128,0.15)', color: '#6b7280' },
};

// ★ 헬퍼 함수: 회원 ID 통일
const getMemberId = (member) => {
  if (!member) return null;
  return member.id ?? member.userId ?? member.memberId ?? null;
};

// ★ 헬퍼 함수: 회원 이름 통일
const getMemberName = (member) => {
  if (!member) return '-';
  return member.name ?? member.nickname ?? member.email ?? '-';
};

// ★ 스타일
const S = {
  page: { maxWidth: 900, margin: "0 auto", overflowX: "hidden" },
  header: { marginBottom: 24 },
  title: { fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.5)" },
  
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    background: "#1a1a2e",
    borderRadius: 12,
    padding: 16,
    textAlign: "center",
  },
  statValue: { fontSize: 28, fontWeight: 700, color: "#a855f7" },
  statLabel: { fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 },
  
  card: {
    background: "#18181b",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#fff",
    marginBottom: 16,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  
  // 폼 스타일
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginBottom: 16,
  },
  formField: { display: "flex", flexDirection: "column", gap: 6 },
  formLabel: { fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 600 },
  formInput: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(0,0,0,0.3)",
    color: "#fff",
    fontSize: 14,
  },
  formSelect: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(0,0,0,0.3)",
    color: "#fff",
    fontSize: 14,
    cursor: "pointer",
  },
  formTextarea: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(0,0,0,0.3)",
    color: "#fff",
    fontSize: 14,
    minHeight: 60,
    resize: "vertical",
  },
  
  btnRow: { display: "flex", gap: 10, marginTop: 16 },
  btnPrimary: {
    padding: "12px 24px",
    borderRadius: 8,
    border: "none",
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnDanger: {
    padding: "12px 24px",
    borderRadius: 8,
    border: "none",
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnSecondary: {
    padding: "12px 24px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.06)",  // ★ 약간의 배경색 추가 (가독성)
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  
  // 검색
  searchRow: { display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" },
  searchInput: {
    flex: 1,
    minWidth: 200,
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(0,0,0,0.3)",
    color: "#fff",
    fontSize: 14,
  },
  
  // 테이블
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: "12px 10px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontWeight: 600,
  },
  td: {
    padding: "12px 10px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    color: "#fff",
    fontSize: 13,
  },
  badge: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 600,
  },
  
  // 회원 선택 드롭다운
  memberItem: {
    padding: "10px 14px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  memberBalance: {
    fontSize: 12,
    color: "#a855f7",
    fontWeight: 600,
  },
  
  emptyBox: {
    padding: "40px 20px",
    textAlign: "center",
    color: "rgba(255,255,255,0.4)",
    fontSize: 14,
  },
  
  toast: {
    position: "fixed",
    bottom: 100,
    left: "50%",
    transform: "translateX(-50%)",
    padding: "12px 24px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    zIndex: 9999,
  },
};

const PAGE_SIZE = 10;

export default function AdminPoints() {

  // 반응형 레이아웃
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 데이터 상태
  const [members, setMembers] = useState([]); // 전체 회원 목록
  const [ledger, setLedger] = useState([]);
  const [stats, setStats] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [authReadyFlag, setAuthReadyFlag] = useState(isAuthReady());

  // 검색/선택 상태
  const [memberQuery, setMemberQuery] = useState(""); // 검색 입력값
  const [selectedUser, setSelectedUser] = useState(null); // 선택된 회원 객체 (id, name, email 등 포함)
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  // 이력 필터
  const [historySearch, setHistorySearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);

  // 토스트
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // ★ 포인트 전송 정책 상태
  const [transferEnabled, setTransferEnabled] = useState(true);
  
  // ★ 회원별 잔액 캐시 (async getUserBalance 대응)
  const [memberBalances, setMemberBalances] = useState({});

  // ★ 상점 지급요청 상태 (PV3 역이식)
  const [shopRequests, setShopRequests] = useState([]);
  const [payoutFilter, setPayoutFilter] = useState('PENDING');

  // ★ 유통 지급요청 상태
  const [distPayouts, setDistPayouts] = useState([]);
  const [distPayoutFilter, setDistPayoutFilter] = useState('ALL');

  const memberNameMap = useMemo(() => {
    const entries = members.map((member) => {
      const memberId = String(getMemberId(member) || '').trim();
      return [memberId, getMemberName(member)];
    }).filter(([memberId]) => !!memberId);
    return new Map(entries);
  }, [members]);

  const resolveLedgerMemberName = (item) => {
    const memberId = String(item?.memberId || '').trim();
    return String(
      item?.memberName
      || item?.userName
      || (memberId ? memberNameMap.get(memberId) : '')
      || ''
    ).trim();
  };

  // ★ 서버 기반 데이터 로드
  const loadData = async () => {
    try {
      // 1. 회원 목록 로드
      const serverMembers = await storageAdapter.getMembers();
      setMembers(serverMembers);
      const loadedMemberNameMap = new Map(
        (serverMembers || []).map((member) => {
          const memberId = String(getMemberId(member) || '').trim();
          return [memberId, getMemberName(member)];
        }).filter(([memberId]) => !!memberId)
      );
      
      // 2. 회원별 잔액 로드 (서버 API 기반) - 병렬화
      const balances = {};
      try {
        const balancePromises = serverMembers.map(async (m) => {
          const memberId = getMemberId(m);
          if (!memberId) return [null, 0];
          try {
            const balanceData = await storageAdapter.getPointBalance(memberId);
            return [memberId, balanceData?.balance ?? 0];
          } catch (e) {
            console.warn(`[AdminPoints] Failed to load balance for ${memberId}:`, e);
            return [memberId, 0];
          }
        });
        const results = await Promise.all(balancePromises);
        for (const [memberId, bal] of results) {
          if (memberId) balances[memberId] = bal;
        }
      } catch (e) {
        console.warn('[AdminPoints] Parallel balance fetch failed:', e);
      }
      setMemberBalances(balances);
      
      // 3. Issue 3-A: 포인트 이력 기본 로딩 (선택된 유저가 없어도 전체 이력 100건 로드)
      let ledgerData = [];
      try {
        // 선택된 사용자의 유효한 ID가 있으면 해당 사용자 이력 로드,
        // 그렇지 않으면 전체 최근 거래(기본 100건)를 로드하도록 명확히 분기합니다.
        const selectedId = getMemberId(selectedUser);
          if (selectedId) {
          console.log('[FORENSIC][AdminPoints] Loading history for user:', selectedId);
          // limit per-page to reduce load; provide explicit 'load all' action elsewhere
          const history = await storageAdapter.getPointHistory(selectedId, { limit: 200 });
          ledgerData = history?.transactions || history || [];
        } else {
          // 기본 조회 - 전체 포인트 이력 100건 (GET /api/admin/points/transactions)
          console.log('[FORENSIC][AdminPoints] Loading default 100 transactions');
          try {
            const res = await fetch('/api/admin/points/transactions?limit=100', {
              credentials: 'include'
            });
            if (res.ok) {
              const data = await res.json();
              ledgerData = data?.transactions || [];
            } else {
              console.warn('[FORENSIC][AdminPoints] transactions API returned non-ok:', res.status);
            }
          } catch (fetchErr) {
            console.warn('[FORENSIC][AdminPoints] transactions fetch failed, will try storageAdapter fallback:', fetchErr?.message);
          }

          // 서버가 응답하지 않거나 에러로 빈 결과인 경우 로컬 폴백 시도
          if (!ledgerData || ledgerData.length === 0) {
            try {
              console.log('[FORENSIC][AdminPoints] Trying storageAdapter.getPointHistory fallback (global)');
              const history = await storageAdapter.getPointHistory('all', { limit: 100 });
              ledgerData = history?.transactions || history || [];
              console.log('[FORENSIC][AdminPoints] storageAdapter fallback returned:', ledgerData.length);
            } catch (saErr) {
              console.warn('[FORENSIC][AdminPoints] storageAdapter fallback failed:', saErr?.message);
            }
          }
        }
        ledgerData = (Array.isArray(ledgerData) ? ledgerData : []).map((item) => {
          const fallbackName = String(item?.memberName || item?.userName || loadedMemberNameMap.get(String(item?.memberId || '').trim()) || '').trim();
          return {
            ...item,
            memberName: fallbackName,
            userName: fallbackName,
          };
        });
        setLedger(ledgerData);
        console.log('[FORENSIC][AdminPoints] Ledger loaded:', ledgerData.length, 'transactions');
      } catch (e) {
        console.error('[FORENSIC][AdminPoints] Failed to load point history:', e);
        setLedger([]);
      }
      
      // 4. 통계 계산 (ledger 기반 - Issue 3-C)
      const totalBalance = Object.values(balances).reduce((sum, b) => sum + b, 0);
      const memberBalancesArray = serverMembers.map(m => {
        const memberId = getMemberId(m);
        return {
          ...m,
          id: memberId,
          name: getMemberName(m),
          balance: balances[memberId] || 0,
        };
      });
      
      // ledger 기반 통계 계산
      let earnedSum = 0;
      let spentSum = 0;
      try {
        // 이미 위에서 로드한 ledgerData를 사용하여 통계 계산
        const ledgerForStats = ledgerData || [];
        ledgerForStats.forEach(tx => {
          const amount = Number(tx.amount || 0);
          const type = String(tx.type || '').toUpperCase();
          if (amount > 0 || ['EARN', 'ADMIN_EARN', 'REWARD', 'REFUND', 'TRANSFER_IN'].includes(type)) {
            earnedSum += Math.abs(amount);
          } else if (amount < 0 || ['SPEND', 'PURCHASE', 'PAYOUT', 'TRANSFER_OUT'].includes(type)) {
            spentSum += Math.abs(amount);
          }
        });
      } catch (e) {
        console.warn('[FORENSIC][AdminPoints] Stats calculation fallback to 0:', e);
      }
      
        setStats({
        netTotal: totalBalance,
        totalGiven: earnedSum,
        totalDeducted: spentSum,
        transactionCount: Array.isArray(ledgerData) ? ledgerData.length : (Array.isArray(ledger) ? ledger.length : 0),
        memberBalances: memberBalancesArray,
      });
      console.log('[FORENSIC][AdminPoints] Stats:', { netTotal: totalBalance, totalGiven: earnedSum, totalDeducted: spentSum, txCount: ledger.length });
      
      // 5. 포인트 전송 허용 상태 로드
      const enabled = await isPointsTransferEnabled();
      setTransferEnabled(enabled);
    } catch (e) {
      console.error('[AdminPoints] Failed to load data:', e);
      showToast('데이터 로드 실패: ' + e.message, 'error');
    }
    
    // 6. 상점 지급요청 로드 (서버 Admin API 호출 — CRITICAL FIX Phase 3)
    await loadShopPayoutRequests();
  };

  // ★ 상점 지급요청 재사용 가능 로더 함수 (Issue #3D fix)
  const loadShopPayoutRequests = async () => {
    try {
      const res = await fetch('/api/admin/payout-requests?status=ALL', {
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const reqs = data.requests || [];
      reqs.sort((a,b) => {
        if (a.status === b.status) return new Date(b.requested_at || b.requestedAt) - new Date(a.requested_at || a.requestedAt);
        if (a.status === 'PENDING') return -1;
        if (b.status === 'PENDING') return 1;
        return 0;
      });
      setShopRequests(reqs);
      console.log('[AdminPoints] Loaded payout requests from server:', reqs.length);
    } catch (e) { 
      console.error('[AdminPoints] Failed to load shop payout requests from server:', e);
      setShopRequests([]); 
    }
  };
  
  useEffect(() => {
    const onAuth = () => setAuthReadyFlag(isAuthReady());
    window.addEventListener('su:auth:changed', onAuth);
    setAuthReadyFlag(isAuthReady());
    return () => window.removeEventListener('su:auth:changed', onAuth);
  }, []);

  useEffect(() => {
    let ac = new AbortController();
    const doLoad = async () => {
      if (!authReadyFlag) {
        // auth not ready: keep safe defaults
        setMembers([]);
        setLedger([]);
        setShopRequests([]);
        return;
      }
      await loadData(ac);
    };
    doLoad();
    return () => { ac.abort(); };
  }, [reloadKey, authReadyFlag, selectedUser]);

  // ★ 상점 지급요청 SSOT 이벤트 리스닝 (서버 기반 재로드)
  useEffect(() => {
    window.addEventListener('su:ssot:changed', loadShopPayoutRequests);
    window.addEventListener('storage', loadShopPayoutRequests);
    return () => {
      window.removeEventListener('su:ssot:changed', loadShopPayoutRequests);
      window.removeEventListener('storage', loadShopPayoutRequests);
    };
  }, []);

  // ★ 유통 지급요청 로더
  const loadDistPayouts = async () => {
    try {
      const reqs = await storageAdapter.getAdminDistPayouts();
      const list = Array.isArray(reqs) ? reqs : [];
      list.sort((a, b) => {
        if (a.status === b.status) return new Date(b.requested_at || b.requestedAt) - new Date(a.requested_at || a.requestedAt);
        if (a.status === 'PENDING') return -1;
        if (b.status === 'PENDING') return 1;
        return 0;
      });
      setDistPayouts(list);
    } catch (e) {
      console.error('[AdminPoints] Failed to load dist payouts:', e);
      setDistPayouts([]);
    }
  };

  useEffect(() => {
    loadDistPayouts();
  }, [reloadKey]);

  useEffect(() => {
    window.addEventListener('su:ssot:changed', loadDistPayouts);
    return () => window.removeEventListener('su:ssot:changed', loadDistPayouts);
  }, []);

  // ★ 유통 지급 처리 핸들러
  const handleDistPayoutAction = async (payoutId, action) => {
    const label = action === 'PAID' ? '지급완료' : action === 'APPROVED' ? '승인' : '거절';
    if (!window.confirm(`정말 ${label} 처리하시겠습니까?`)) return;
    try {
      const data = await storageAdapter.updateAdminDistPayout(payoutId, { status: action });
      if (data?.ok !== false) {
        showToast(data.message || `${label} 처리 완료`, 'success');
        await loadDistPayouts();
        window.dispatchEvent(new CustomEvent('su:ssot:changed', { detail: { type: 'dist-payouts', operation: action } }));
      } else {
        throw new Error(data.error || `${label} 처리 실패`);
      }
    } catch (e) {
      console.error('[AdminPoints] handleDistPayoutAction error:', e);
      showToast('오류: ' + e.message, 'error');
    }
  };

  const filteredDistPayouts = useMemo(() => {
    if (!Array.isArray(distPayouts)) return [];
    if (distPayoutFilter === 'ALL') return distPayouts;
    if (distPayoutFilter === 'PENDING') {
      return distPayouts.filter((r) => ['PENDING', 'APPROVED'].includes(String(r.status || '').toUpperCase()));
    }
    return distPayouts.filter((r) => String(r.status || '').toUpperCase() === distPayoutFilter);
  }, [distPayouts, distPayoutFilter]);


  // 검색 결과: memberQuery로 members 필터링 (이름/이메일/전화번호)
  const filteredMembers = useMemo(() => {
    if (!memberQuery.trim()) return [];
    const q = memberQuery.toLowerCase().trim();
    return members.filter(m =>
      (m.name && m.name.toLowerCase().includes(q)) ||
      (m.email && m.email.toLowerCase().includes(q)) ||
      (m.phone && m.phone.includes(q))
    ).slice(0, 10);
  }, [members, memberQuery]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showMemberDropdown && !e.target.closest('.member-search-container')) {
        setShowMemberDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMemberDropdown]);

  // 이력 필터링
  const filteredLedger = useMemo(() => {
    let list = ledger;
    if (typeFilter !== "all") {
      list = list.filter(l => l.type === typeFilter);
    }
    if (historySearch.trim()) {
      const q = historySearch.toLowerCase();
      list = list.filter(l => 
        resolveLedgerMemberName(l).toLowerCase().includes(q) || 
        l.memberId?.toLowerCase().includes(q) ||
        l.reason?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [ledger, typeFilter, historySearch, memberNameMap]);

  // 페이지네이션
  const totalPages = Math.ceil(filteredLedger.length / PAGE_SIZE);
  const pagedLedger = filteredLedger.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // 토스트 표시
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };


  // 회원 선택: 전체 객체로 관리
  const handleSelectMember = (member) => {
    if (!member) return;
    const memberId = getMemberId(member);
    if (!memberId) return;
    
    // member 객체 정규화 (id 필드 보장)
    const normalizedMember = {
      ...member,
      id: memberId,
      name: getMemberName(member),
    };
    
    setSelectedUser(normalizedMember); // 전체 회원 객체 저장
    setMemberQuery(getMemberName(member)); // 선택 시 검색창에 이름 표시
    setShowMemberDropdown(false);
  };

  // 포인트 지급
  const handleGivePoints = async () => {
    if (!selectedUser || !selectedUser.id) {
      showToast("회원을 선택해주세요.", "error");
      return;
    }
    const numAmount = parseFloat(String(amount).trim());
    if (isNaN(numAmount) || numAmount < 1) {
      showToast("1 이상의 금액을 입력해주세요.", "error");
      return;
    }
    try {
      await storageAdapter.grantPoints(
        selectedUser.id,
        Math.floor(numAmount),
        'ADMIN',
        reason || '관리자 지급',
        null,
        null
      );
      showToast(`${selectedUser.name}님에게 ${Math.floor(numAmount).toLocaleString()}P 지급 완료!`, "success");
      resetForm();
      // reloadKey++ 방식을 적용하여 전체 페이지의 재조회 규칙을 통일
      setReloadKey(r => r + 1);
      await loadData();
      
      // ★ POINTS_UPDATED 이벤트 발생 (실시간 My 페이지 반영)
      window.dispatchEvent(new CustomEvent('POINTS_UPDATED', { detail: { memberId: selectedUser.id } }));
      window.dispatchEvent(new Event('su:ssot:changed'));  // SSOT 이벤트도 발생
    } catch (e) {
      console.error('[AdminPoints] Give points failed:', e);
      showToast('포인트 지급 실패: ' + e.message, "error");
    }
  };

  // 포인트 차감
  const handleDeductPoints = async () => {
    if (!selectedUser || !selectedUser.id) {
      showToast("회원을 선택해주세요.", "error");
      return;
    }
    const numAmount = parseFloat(String(amount).trim());
    if (isNaN(numAmount) || numAmount < 1) {
      showToast("1 이상의 금액을 입력해주세요.", "error");
      return;
    }
    try {
      await storageAdapter.grantPoints(
        selectedUser.id,
        -Math.floor(numAmount),
        'ADMIN',
        reason || '관리자 차감',
        null,
        null
      );
      showToast(`${selectedUser.name}님 ${Math.floor(numAmount).toLocaleString()}P 차감 완료!`, "success");
      resetForm();
      setReloadKey(r => r + 1);
      await loadData();
      
      // ★ POINTS_UPDATED 이벤트 발생 (실시간 My 페이지 반영)
      window.dispatchEvent(new CustomEvent('POINTS_UPDATED', { detail: { memberId: selectedUser.id } }));
      window.dispatchEvent(new Event('su:ssot:changed'));  // SSOT 이벤트도 발생
    } catch (e) {
      console.error('[AdminPoints] Deduct points failed:', e);
      showToast('포인트 차감 실패: ' + e.message, "error");
    }
  };

  // 거래 취소
  const handleCancelTransaction = async (transactionId) => {
    if (!window.confirm("이 거래를 취소하시겠습니까?")) return;
    
    try {
      await storageAdapter.cancelPointTransaction(transactionId);
      showToast("거래가 취소되었습니다.", "success");
      setReloadKey(r => r + 1);
      await loadData();
      
      // ★ POINTS_UPDATED 이벤트 발생 (실시간 My 페이지 반영)
      // 현재 선택된 유저 또는 null(full reload)
      window.dispatchEvent(new CustomEvent('POINTS_UPDATED', { detail: { memberId: selectedUser?.id || null } }));
      window.dispatchEvent(new Event('su:ssot:changed'));  // SSOT 이벤트도 발생
    } catch (e) {
      console.error('[AdminPoints] Cancel transaction failed:', e);
      showToast('거래 취소 실패: ' + e.message, "error");
    }
  };

  // ★ Issue 3-B: 상점 지급 처리 - 객체 상태 전환 + 리스트 이동 + 완료 탭 자동 전환
  const handleMarkPayoutPaid = async (requestId) => {
    if (!window.confirm('정말 지급 처리하시겠습니까?')) return;
    
    // 원본 데이터 백업 (롤백용)
    const originalRequests = [...shopRequests];
    
    try {
      console.log('[FORENSIC][AdminPoints] Payout processing started:', requestId);
      
      // (1) Optimistic update: 해당 row 즉시 'PAID'로 반영
      setShopRequests(prev => prev.map(r => {
        const rId = r.id || r.request_id || r.requestId;
        if (rId === requestId) {
          return { ...r, status: 'PAID', processed_at: new Date().toISOString() };
        }
        return r;
      }));
      
      // (2) 즉시 완료 탭으로 전환 (optimistic)
      setPayoutFilter('PAID');

      const res = await fetch(`/api/admin/payout-requests/${requestId}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: 'admin', adminNote: '' })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      // (3) 서버 응답으로 확정 데이터 반영
      if (data.ok) {
        console.log('[FORENSIC][AdminPoints] Payout completed successfully');
        showToast('지급 처리 완료', 'success');
        
        // (4) 서버 재조회로 최종 동기화
        await loadShopPayoutRequests();
        setReloadKey(r => r + 1);
      } else {
        throw new Error(data.error || '지급 처리 실패');
      }
    } catch (e) {
      console.error('[FORENSIC][AdminPoints] handleMarkPayoutPaid error:', e);
      showToast('오류가 발생했습니다: ' + e.message, 'error');
      
      // 실패 시 롤백: 원본 데이터 복원 + 대기 탭으로 되돌림
      setShopRequests(originalRequests);
      setPayoutFilter('PENDING');
      await loadShopPayoutRequests();
    }
  };


  // 폼 초기화
  const resetForm = () => {
    setSelectedUser(null);
    setMemberQuery("");
    setAmount("");
    setReason("");
  };

  // 날짜 포맷
  const formatDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  };

  // ★ 포인트 전송 토글
  const handleToggleTransfer = async () => {
    try {
      const newValue = !transferEnabled;
      const success = await setPointsTransferEnabled(newValue);
      if (success) {
        setTransferEnabled(newValue);
        showToast(
          newValue ? '포인트 전송이 허용되었습니다.' : '포인트 전송이 차단되었습니다.',
          newValue ? 'success' : 'error'
        );
      } else {
        showToast('설정 변경에 실패했습니다.', 'error');
      }
    } catch (e) {
      console.error('[AdminPoints] Toggle failed:', e);
      showToast('설정 변경 중 오류가 발생했습니다.', 'error');
    }
  };

  return (
    <div style={S.page}>
      {/* 헤더 */}
      <div style={S.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={S.title}>💎 포인트 관리</h1>
            <p style={S.subtitle}>회원 포인트 지급/차감 및 이력을 관리합니다.</p>
          </div>
          {/* ★ 포인트 전송 토글 버튼 */}
          <button
            type="button"
            onClick={handleToggleTransfer}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: 'none',
              background: transferEnabled 
                ? 'linear-gradient(135deg, #22c55e, #16a34a)' 
                : 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
            }}
          >
            {transferEnabled ? '🟢 전송 허용' : '🔴 전송 차단'}
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      {stats && (
        <div style={S.statsGrid}>
          <div style={S.statCard}>
            <div style={S.statValue}>{stats.netTotal.toLocaleString()}</div>
            <div style={S.statLabel}>현재 총 포인트</div>
          </div>
          <div style={S.statCard}>
            <div style={{ ...S.statValue, color: "#22c55e" }}>{stats.totalGiven.toLocaleString()}</div>
            <div style={S.statLabel}>총 지급</div>
          </div>
          <div style={S.statCard}>
            <div style={{ ...S.statValue, color: "#ef4444" }}>{stats.totalDeducted.toLocaleString()}</div>
            <div style={S.statLabel}>총 차감/사용</div>
          </div>
          <div style={S.statCard}>
            <div style={{ ...S.statValue, color: "#3b82f6" }}>{stats.transactionCount}</div>
            <div style={S.statLabel}>거래 건수</div>
          </div>
        </div>
      )}

      {/* ★ 상점 지급요청 섹션 (PV3 역이식) */}
      <div style={S.card}>
        <h2 style={S.cardTitle}>🏪 상점 지급요청</h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setPayoutFilter('PENDING')} style={{ ...S.btnSecondary, border: payoutFilter==='PENDING' ? 'none' : '1px solid rgba(255,255,255,0.2)', background: payoutFilter==='PENDING' ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.06)', color: payoutFilter==='PENDING' ? '#fff' : 'rgba(255,255,255,0.8)' }}>대기</button>
          <button onClick={() => setPayoutFilter('PAID')} style={{ ...S.btnSecondary, border: payoutFilter==='PAID' ? 'none' : '1px solid rgba(255,255,255,0.2)', background: payoutFilter==='PAID' ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.06)', color: payoutFilter==='PAID' ? '#fff' : 'rgba(255,255,255,0.8)' }}>완료</button>
          <button onClick={() => setPayoutFilter('ALL')} style={{ ...S.btnSecondary, border: payoutFilter==='ALL' ? 'none' : '1px solid rgba(255,255,255,0.2)', background: payoutFilter==='ALL' ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.06)', color: payoutFilter==='ALL' ? '#fff' : 'rgba(255,255,255,0.8)' }}>전체</button>
        </div>

        {(!shopRequests || shopRequests.length === 0) ? (
          <div style={S.emptyBox}>상점 지급요청이 없습니다.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>상점</th>
                  <th style={S.th}>요청금액</th>
                  <th style={S.th}>요청일</th>
                  <th style={S.th}>계좌/예금주</th>
                  <th style={S.th}>상태</th>
                  <th style={S.th}>작업</th>
                </tr>
              </thead>
              <tbody>
                {shopRequests.filter(r => payoutFilter === 'ALL' ? true : r.status === payoutFilter).map(r => (
                  <tr key={r.id || r.request_id || r.requestId}>
                    <td style={S.td}>{r.storeName || r.shop_name || r.storeId || r.shop_id || '(상점명 미상)'}</td>
                    <td style={{ ...S.td, fontWeight: 700 }}>{Number(r.amount).toLocaleString()} P</td>
                    <td style={S.td}>{formatDate(r.requestedAt || r.requested_at || r.createdAt || r.created_at)}</td>
                    <td style={S.td}>
                      <div style={{ fontSize: 13 }}>{r.bankName || r.bank_name || r.bankInfo || '-'}</div>
                      <div style={{ fontSize: 12, opacity: 0.85 }}>{r.accountNumber || r.account_number || '-' } / {r.depositorName || r.depositor_name || r.ownerName || r.owner_name || '-'}</div>
                    </td>
                    <td style={S.td}>
                      {r.status === 'PENDING' ? 
                        <span style={{ ...S.badge, background: 'rgba(250,204,21,0.12)', color: '#f59e0b' }}>대기</span> : 
                        <span style={{ ...S.badge, background: 'rgba(34,197,94,0.12)', color: '#10b981' }}>지급완료</span>
                      }
                    </td>
                    <td style={S.td}>
                      {r.status === 'PENDING' ? (
                        <button onClick={() => handleMarkPayoutPaid(r.request_id || r.id || r.requestId)} style={{ padding: '6px 10px', borderRadius: 6, background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>지급</button>
                      ) : (
                        <span style={{ color: 'rgba(255,255,255,0.6)' }}>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ★ 유통 지급요청 섹션 */}
      <div style={S.card}>
        <h2 style={S.cardTitle}>🚚 유통 지급요청</h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setDistPayoutFilter('PENDING')} style={{ ...S.btnSecondary, border: distPayoutFilter==='PENDING' ? 'none' : '1px solid rgba(255,255,255,0.2)', background: distPayoutFilter==='PENDING' ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.06)', color: distPayoutFilter==='PENDING' ? '#fff' : 'rgba(255,255,255,0.8)' }}>대기</button>
          <button onClick={() => setDistPayoutFilter('PAID')} style={{ ...S.btnSecondary, border: distPayoutFilter==='PAID' ? 'none' : '1px solid rgba(255,255,255,0.2)', background: distPayoutFilter==='PAID' ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.06)', color: distPayoutFilter==='PAID' ? '#fff' : 'rgba(255,255,255,0.8)' }}>완료</button>
          <button onClick={() => setDistPayoutFilter('ALL')} style={{ ...S.btnSecondary, border: distPayoutFilter==='ALL' ? 'none' : '1px solid rgba(255,255,255,0.2)', background: distPayoutFilter==='ALL' ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.06)', color: distPayoutFilter==='ALL' ? '#fff' : 'rgba(255,255,255,0.8)' }}>전체</button>
        </div>

        {(!distPayouts || distPayouts.length === 0) ? (
          <div style={S.emptyBox}>유통 지급요청이 없습니다.</div>
        ) : filteredDistPayouts.length === 0 ? (
          <div style={S.emptyBox}>선택한 상태의 유통 지급요청이 없습니다.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>판매자</th>
                  <th style={S.th}>요청금액</th>
                  <th style={S.th}>요청일</th>
                  <th style={S.th}>계좌/예금주</th>
                  <th style={S.th}>상태</th>
                  <th style={S.th}>작업</th>
                </tr>
              </thead>
              <tbody>
                {filteredDistPayouts.map(r => {
                  const sellerName = memberNameMap.get(String(r.seller_id || r.sellerId)) || r.seller_name || r.sellerName || r.seller_id || r.sellerId || '(미상)';
                  const statusLabel = r.status === 'PENDING' ? '대기' : r.status === 'APPROVED' ? '승인' : r.status === 'PAID' ? '지급완료' : r.status === 'REJECTED' ? '거절' : r.status;
                  const statusStyle = r.status === 'PENDING'
                    ? { background: 'rgba(250,204,21,0.12)', color: '#f59e0b' }
                    : r.status === 'REJECTED'
                    ? { background: 'rgba(239,68,68,0.12)', color: '#ef4444' }
                    : { background: 'rgba(34,197,94,0.12)', color: '#10b981' };
                  return (
                    <tr key={r.id}>
                      <td style={S.td}>{sellerName}</td>
                      <td style={{ ...S.td, fontWeight: 700 }}>{Number(r.amount).toLocaleString()} P</td>
                      <td style={S.td}>{formatDate(r.requested_at)}</td>
                      <td style={S.td}>
                        <div style={{ fontSize: 13 }}>{r.bank_name || '-'}</div>
                        <div style={{ fontSize: 12, opacity: 0.85 }}>{r.account_number || '-'} / {r.depositor_name || '-'}</div>
                      </td>
                      <td style={S.td}>
                        <span style={{ ...S.badge, ...statusStyle }}>{statusLabel}</span>
                      </td>
                      <td style={S.td}>
                        {['PENDING', 'APPROVED'].includes(String(r.status || '').toUpperCase()) ? (
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {String(r.status || '').toUpperCase() === 'PENDING' ? (
                              <button onClick={() => handleDistPayoutAction(r.id, 'APPROVED')} style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(59,130,246,0.15)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.3)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>승인</button>
                            ) : null}
                            <button onClick={() => handleDistPayoutAction(r.id, 'PAID')} style={{ padding: '6px 10px', borderRadius: 6, background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>지급</button>
                            <button onClick={() => handleDistPayoutAction(r.id, 'REJECTED')} style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>거절</button>
                          </div>
                        ) : (
                          <span style={{ color: 'rgba(255,255,255,0.6)' }}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 포인트 지급/차감 폼 */}
      <div style={S.card}>
        <h2 style={S.cardTitle}>💰 포인트 지급/차감</h2>
        
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: 12,
          marginBottom: 16,
        }}>
          {/* 회원 검색 */}
          <div className="member-search-container" style={{ ...S.formField, position: "relative", minWidth: 0 }}>
            <label style={S.formLabel}>회원 검색 *</label>
            <input
              type="text"
              value={memberQuery}
              onChange={(e) => {
                const val = e.target.value;
                setMemberQuery(val);
                setShowMemberDropdown(true);
                // ★ 검색 입력이 변경되어도 선택된 사용자는 유지 (이름이 달라도 선택 유지)
                // 단, 사용자가 수동으로 검색창을 지우면 선택 해제
                if (val.trim() === "") {
                  setSelectedUser(null);
                }
              }}
              onFocus={() => {
                if (memberQuery.trim() && !selectedUser) {
                  setShowMemberDropdown(true);
                }
              }}
              placeholder="이름, 이메일, 전화번호로 검색..."
              style={{ ...S.formInput, width: "100%", boxSizing: "border-box" }}
            />
            {showMemberDropdown && filteredMembers.length > 0 && !selectedUser && (
              <div style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "#1a1a2e",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                maxHeight: 200,
                overflowY: "auto",
                zIndex: 100,
              }}>
                {filteredMembers.map(m => (
                  <div
                    key={m.id || m.userId || m.email}
                    style={{
                      ...S.memberItem,
                      padding: "12px 14px",
                    }}
                    onClick={() => handleSelectMember(m)}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{getMemberName(m)}</div>
                      <div style={{ fontSize: 11, opacity: 0.5 }}>{m.email || "-"} {m.phone ? ` | ${m.phone}` : ""}</div>
                    </div>
                    <div style={S.memberBalance}>{(memberBalances[getMemberId(m)] || 0).toLocaleString()}P</div>
                  </div>
                ))}
              </div>
            )}
            {selectedUser && (
              <div style={{ 
                marginTop: 8, 
                padding: "8px 12px",
                borderRadius: 8,
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.3)",
                fontSize: 13, 
                color: "#22c55e",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <span>✓ <strong>{selectedUser.name}</strong> 선택됨</span>
                <span style={{ color: "#a855f7", fontWeight: 600 }}>
                  {(memberBalances[selectedUser.id] || 0).toLocaleString()}P
                </span>
              </div>
            )}
            {!selectedUser && memberQuery.trim() && filteredMembers.length === 0 && (
              <div style={{ marginTop: 6, fontSize: 12, color: "#f87171" }}>
                검색 결과가 없습니다.
              </div>
            )}
          </div>

          {/* 금액 */}
          <div style={{ ...S.formField, minWidth: 0 }}>
            <label style={S.formLabel}>금액 (P) *</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="지급/차감할 포인트"
              style={{ ...S.formInput, width: "100%", boxSizing: "border-box" }}
              min="1"
            />
          </div>
        </div>

        {/* 사유 */}
        <div style={{ ...S.formField, minWidth: 0 }}>
          <label style={S.formLabel}>지급/차감 사유</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="포인트 지급/차감 사유를 입력하세요..."
            style={{ ...S.formTextarea, width: "100%", boxSizing: "border-box" }}
          />
        </div>

        {/* 버튼 */}
        <div style={{ 
          display: "flex", 
          flexDirection: isMobile ? "column" : "row",
          gap: 10, 
          marginTop: 16 
        }}>
          <button style={{ ...S.btnPrimary, flex: isMobile ? "none" : 1 }} onClick={handleGivePoints}>
            ➕ 포인트 지급
          </button>
          <button style={{ ...S.btnDanger, flex: isMobile ? "none" : 1 }} onClick={handleDeductPoints}>
            ➖ 포인트 차감
          </button>
          <button style={{ ...S.btnSecondary, flex: isMobile ? "none" : 1 }} onClick={resetForm}>
            초기화
          </button>
        </div>
      </div>

      {/* 포인트 이력 */}
      <div style={S.card}>
        <h2 style={S.cardTitle}>📋 포인트 이력</h2>
        
        {/* 검색/필터 */}
        <div style={{ 
          display: "flex", 
          flexDirection: isMobile ? "column" : "row",
          gap: 10, 
          marginBottom: 16 
        }}>
          <input
            type="text"
            value={historySearch}
            onChange={(e) => { setHistorySearch(e.target.value); setPage(1); }}
            placeholder="회원명, 사유 검색..."
            style={{ ...S.searchInput, width: "100%", boxSizing: "border-box", minWidth: 0 }}
          />
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            style={{ ...S.formSelect, width: isMobile ? "100%" : "auto", boxSizing: "border-box" }}
          >
            <option value="all">전체 타입</option>
            <option value="ADMIN">관리자</option>
            <option value="PURCHASE">구매</option>
            <option value="REFUND">환불</option>
            <option value="REWARD">보상</option>
            <option value="TRANSFER_IN">받기</option>
            <option value="TRANSFER_OUT">보내기</option>
            <option value="CANCEL">취소</option>
          </select>
        </div>

        {/* 테이블 */}
        {pagedLedger.length === 0 ? (
          <div style={S.emptyBox}>포인트 이력이 없습니다.</div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>일시</th>
                    <th style={S.th}>회원</th>
                    <th style={S.th}>타입</th>
                    <th style={S.th}>금액</th>
                    <th style={S.th}>사유</th>
                    <th style={S.th}>상태</th>
                    <th style={S.th}>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedLedger.map((l) => {
                    const typeInfo = POINT_TYPE_LABELS[l.type] || POINT_TYPE_LABELS.ADMIN;
                    const isCancelled = l.status === "cancelled" || l.status === "CANCELLED";
                    const historyMemberName = selectedUser ? getMemberName(selectedUser) : (resolveLedgerMemberName(l) || "-");
                    return (
                      <tr key={l.id} style={{ opacity: isCancelled ? 0.5 : 1 }}>
                        <td style={S.td}>{formatDate(l.createdAt || l.timestamp)}</td>
                        <td style={S.td}>{historyMemberName}</td>
                        <td style={S.td}>
                          <span style={{ ...S.badge, background: typeInfo.bg, color: typeInfo.color }}>
                            {typeInfo.label}
                          </span>
                        </td>
                        <td style={{ 
                          ...S.td, 
                          color: l.amount >= 0 ? "#22c55e" : "#ef4444", 
                          fontWeight: 600,
                          textDecoration: isCancelled ? "line-through" : "none",
                        }}>
                          {l.amount >= 0 ? "+" : ""}{l.amount.toLocaleString()}
                        </td>
                        <td style={S.td}>{l.description || l.reason || "-"}</td>
                        <td style={S.td}>
                          <span style={{
                            ...S.badge,
                            background: isCancelled ? "rgba(107,114,128,0.15)" : "rgba(34,197,94,0.15)",
                            color: isCancelled ? "#6b7280" : "#22c55e",
                          }}>
                            {isCancelled ? "취소됨" : "완료"}
                          </span>
                        </td>
                        <td style={S.td}>
                          {!isCancelled && l.type !== "cancel" && (
                            <button
                              onClick={() => handleCancelTransaction(l.id)}
                              style={{
                                padding: "4px 8px",
                                borderRadius: 4,
                                border: "1px solid rgba(239,68,68,0.5)",
                                background: "transparent",
                                color: "#ef4444",
                                fontSize: 11,
                                cursor: "pointer",
                              }}
                            >
                              취소
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 16 }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: page === p ? "none" : "1px solid rgba(255,255,255,0.1)",
                      background: page === p ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" : "transparent",
                      color: page === p ? "#fff" : "rgba(255,255,255,0.6)",
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* 회원별 포인트 현황 */}
      {stats && stats.memberBalances && (
        <div style={S.card}>
          <h2 style={S.cardTitle}>👥 회원별 포인트 현황 (클릭하여 선택)</h2>
          {stats.memberBalances.length === 0 ? (
            <div style={S.emptyBox}>회원 정보가 없습니다.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>회원명</th>
                    <th style={S.th}>전화번호</th>
                    <th style={S.th}>보유 포인트</th>
                    <th style={S.th}>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.memberBalances.map((m) => {
                    const memberId = getMemberId(m);
                    const memberName = getMemberName(m);
                    const isSelected = selectedUser?.id === memberId;
                    return (
                      <tr 
                        key={memberId || m.phone || m.email}
                        style={{
                          background: isSelected ? "rgba(139,92,246,0.15)" : "transparent",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          handleSelectMember(m);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        <td style={{ ...S.td, fontWeight: isSelected ? 700 : 400 }}>
                          {isSelected && "✓ "}{memberName}
                        </td>
                        <td style={S.td}>{m.phone || "-"}</td>
                        <td style={{ ...S.td, color: "#a855f7", fontWeight: 600 }}>
                          {m.balance.toLocaleString()} P
                        </td>
                        <td style={S.td}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectMember(m);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 4,
                              border: isSelected ? "none" : "1px solid rgba(139,92,246,0.5)",
                              background: isSelected ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent",
                              color: isSelected ? "#fff" : "#8b5cf6",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            {isSelected ? "✓ 선택됨" : "선택"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 토스트 */}
      {toast.show && (
        <div style={{
          ...S.toast,
          background: toast.type === "success" ? "#22c55e" : "#ef4444",
          color: "#fff",
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
