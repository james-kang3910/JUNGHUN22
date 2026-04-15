import SuMissionEventCard from "../components/SuMissionEventCard";
import PageHeader from "../components/PageHeader";
import MultiImageUploader, { normalizeImageList } from "../components/MultiImageUploader";
import { useMemo, useState, useRef, useEffect, Fragment } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { calculateStatus } from "../lib/adminStore";
import * as storageAdapter from "../lib/storageAdapter";
import * as participationService from "../lib/participationService";
import {
  getEffectiveViewerRegionId,
  isVisibleInRegion,
  canParticipate,
  checkIsAdmin,
  getParticipationBlockedReason,
} from "../lib/viewerRegionStore";
import { getCurrentRegionId } from "../lib/authStore";
import { usePageLoad } from "../hooks/usePageLoad";
import { regions } from "../data/regions.seed";

const RAW_API_BASE = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || "";
const API_BASE = String(RAW_API_BASE || "").replace(/\/+$/, "").replace(/\/api$/, "");

const PARTICIPATION_LABELS = {
  submitted: "참여 접수 완료",
  reviewing: "심사 대기중",
  selected: "선정 완료",
  rejected: "미선정",
  rewarded: "보상 지급 완료",
};

function toPreviewUrl(url) {
  if (!url) return "";
  if (/^(https?:)?\/\//i.test(url) || url.startsWith("data:")) return url;
  return `${API_BASE}${url}`;
}

function formatDateLabel(value) {
  if (!value) return "-";
  return String(value).slice(0, 10);
}

function getStableItemId(item) {
  const raw = item?.id ?? item?.missionId ?? item?.eventId ?? item?.event_id ?? item?._id ?? null;
  if (raw === undefined || raw === null || raw === "") return null;
  return String(raw).trim();
}

function getParticipationStatusLabel(status) {
  return PARTICIPATION_LABELS[String(status || "submitted").trim().toLowerCase()] || "참여 접수 완료";
}

function normalizeRegionToken(value) {
  return String(value || "").trim().toLowerCase();
}

function getParticipationBadgeStyle(status) {
  const normalized = String(status || "submitted").trim().toLowerCase();
  if (normalized === "rewarded") {
    return { background: "rgba(139,92,246,0.14)", color: "#7c3aed", border: "1px solid rgba(139,92,246,0.24)" };
  }
  if (normalized === "selected") {
    return { background: "rgba(16,185,129,0.14)", color: "#059669", border: "1px solid rgba(16,185,129,0.24)" };
    return { background: "rgba(16,185,129,0.14)", color: "#059669", border: "1px solid rgba(16,185,129,0.24)" };
  }
  if (normalized === "rejected") {
    return { background: "rgba(239,68,68,0.14)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.24)" };
  }
  if (normalized === "reviewing") {
    return { background: "rgba(245,158,11,0.14)", color: "#b45309", border: "1px solid rgba(245,158,11,0.24)" };
  }
  return { background: "rgba(59,130,246,0.12)", color: "#2563eb", border: "1px solid rgba(59,130,246,0.22)" };
}

function requiresCrossRegionParticipation(item, memberRegionId, isAdmin = false) {
  if (!item || isAdmin) return false;
  if (String(item?.regionScope || "").trim().toUpperCase() !== "REGION") return false;
  return !canParticipate(item, memberRegionId, false);
}

function getParticipationSubmitErrorMessage(error) {
  const message = String(error?.message || error || "");
  if (message.includes("already")) return "이미 참여 접수된 항목입니다.";
  if (message.includes("submission_text_required")) return "참여 내용을 작성해 주세요.";
  if (message.includes("submission_media_required")) return "현재 서버 설정으로 인증 링크 또는 이미지를 1개 이상 입력해야 합니다.";
  if (message.includes("REGION_RESTRICTED")) return "해당 지역 회원 전용 항목입니다. 타지역 참여로 다시 시도해 주세요.";
  return "참여 접수 중 오류가 발생했습니다.";
}

export default function Missions() {
  const navigate = useNavigate();
  const location = useLocation();
  const goHome = () => navigate("/home");
  const goBack = () => {
    try {
      window.history.back();
    } catch (error) {}
  };

  const [tab, setTab] = useState("active");
  const [events, setEvents] = useState([]);
  const [missions, setMissions] = useState([]);
  const [serverRegions, setServerRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailItem, setDetailItem] = useState(null);
  const [submissionItem, setSubmissionItem] = useState(null);
  const [submissionForm, setSubmissionForm] = useState({ submissionText: "", submissionLink: "", submissionImages: [] });
  const [submissionError, setSubmissionError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // 커스텀 다이얼로그 상태
  const [crossRegionConfirm, setCrossRegionConfirm] = useState(null); // { resolve }
  const [successMessage, setSuccessMessage] = useState(""); // 성공 토스트 텍스트
  const handledHighlightRef = useRef("");

  const eventSectionRef = useRef(null);
  const missionSectionRef = useRef(null);

  const {
    data: participations,
    reload: reloadParticipations,
    authReady: authReadyFlag,
    me,
  } = usePageLoad(async ({ me }) => {
    if (!me || !me.memberId) return [];
    const data = await storageAdapter.getParticipations(me.memberId);
    return Array.isArray(data) ? data : [];
  }, []);

  const memberRegionId = me?.regionId || getCurrentRegionId() || null;
  const viewerRegionId = getEffectiveViewerRegionId(memberRegionId);
  const isRegionPage = location.pathname.startsWith("/r/");
  const routeRegionId = useMemo(() => {
    const match = String(location.pathname || "").match(/^\/r\/([^/]+)/i);
    return match?.[1] ? String(match[1]).trim() : "";
  }, [location.pathname]);
  const activeRegionId = isRegionPage ? (routeRegionId || viewerRegionId || "") : (viewerRegionId || "");
  const isAdmin = checkIsAdmin();
  const participationsLoading = participations === null;
  const regionCatalog = useMemo(() => {
    const merged = [...(Array.isArray(serverRegions) ? serverRegions : []), ...regions];
    const seen = new Set();
    return merged.filter((region) => {
      const key = normalizeRegionToken(region?.id || region?.regionId || region?.name);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [serverRegions]);

  const findRegionByToken = (token) => {
    const target = normalizeRegionToken(token);
    if (!target) return null;
    return regionCatalog.find((region) => {
      const candidates = [region?.id, region?.regionId, region?.name, region?.regionName, region?.district];
      return candidates.some((entry) => normalizeRegionToken(entry) === target);
    }) || null;
  };

  const loadRegionEventPool = async (regionsData, regionIdForPage) => {
    const targetRegionIds = isRegionPage
      ? [String(regionIdForPage || "").trim()].filter(Boolean)
      : (Array.isArray(regionsData) ? regionsData.map((region) => String(region?.id || region?.regionId || region?.region_id || "").trim()).filter(Boolean) : []);

    if (targetRegionIds.length === 0) return [];

    const regionNameMap = new Map(
      (Array.isArray(regionsData) ? regionsData : []).map((region) => [
        String(region?.id || region?.regionId || region?.region_id || "").trim(),
        String(region?.name || region?.regionName || "").trim(),
      ])
    );

    const groups = await Promise.all(
      targetRegionIds.map(async (regionId) => {
        const result = await storageAdapter.getRegionEvents(regionId).catch(() => []);
        const list = Array.isArray(result?.events)
          ? result.events
          : (Array.isArray(result) ? result : []);

        return list.map((event) => ({
          ...event,
          id: event.id || event.event_id,
          eventId: event.eventId || event.event_id || event.id,
          description: event.description || event.content || "",
          startDate: event.startDate || event.start_at || null,
          endDate: event.endDate || event.end_at || null,
          regionScope: "REGION",
          regionId: event.regionId || event.region_id || regionId,
          regionIds: [String(event.regionId || event.region_id || regionId || "")].filter(Boolean),
          regionName: event.regionName || event.region_name || regionNameMap.get(regionId) || "",
          __eventSource: event.__eventSource || "region",
        }));
      })
    );

    return groups.flat();
  };

  useEffect(() => {
    let aborted = false;
    const loadMissionsEvents = async () => {
      try {
        setLoading(true);
        storageAdapter.clearEventsCache();
        storageAdapter.clearMissionsCache();
        const [eventsData, missionsData, regionsData] = await Promise.all([
          storageAdapter.getEvents(),
          storageAdapter.getMissions(),
          storageAdapter.getRegions().catch(() => []),
        ]);
        if (aborted) return;

        const baseEvents = Array.isArray(eventsData) ? eventsData : [];

        // 지역 포털 내에서만 지역별 이벤트 추가 조회 (일반 /missions 에서는 getEvents()로 충분)
        let mergedEvents = [...baseEvents];
        if (isRegionPage && activeRegionId) {
          const regionEventsNormalized = await loadRegionEventPool(regionsData, activeRegionId);
          const seenEventIds = new Set(baseEvents.map((event) => getStableItemId(event)).filter(Boolean));
          regionEventsNormalized.forEach((event) => {
            const eventId = getStableItemId(event);
            if (!eventId || seenEventIds.has(eventId)) return;
            seenEventIds.add(eventId);
            mergedEvents.push(event);
          });
        }

        setEvents(mergedEvents);
        setMissions(Array.isArray(missionsData) ? missionsData : []);
        setServerRegions(Array.isArray(regionsData) ? regionsData : []);
      } catch (error) {
        console.error("[Missions] Failed to load missions/events:", error);
      } finally {
        if (!aborted) setLoading(false);
      }
    };
    loadMissionsEvents();
    return () => {
      aborted = true;
    };
  }, [authReadyFlag, isRegionPage, activeRegionId]);

  useEffect(() => {
    const handleSsotChanged = (event) => {
      const changedType = String(event?.detail?.type || '').toLowerCase();
      // 단수/복수 모두 허용
      if (!["missions", "mission", "events", "event"].includes(changedType)) return;

      let aborted = false;
      const reload = async () => {
        try {
          const [eventsData, missionsData, regionsData] = await Promise.all([
            storageAdapter.getEvents(),
            storageAdapter.getMissions(),
            storageAdapter.getRegions().catch(() => []),
          ]);
          if (aborted) return;

          const baseEvents = Array.isArray(eventsData) ? eventsData : [];
          let mergedEvents = [...baseEvents];
          if (isRegionPage && activeRegionId) {
            const regionEventsNormalized = await loadRegionEventPool(regionsData, activeRegionId);
            const seenEventIds = new Set(baseEvents.map((event) => getStableItemId(event)).filter(Boolean));
            regionEventsNormalized.forEach((event) => {
              const eventId = getStableItemId(event);
              if (!eventId || seenEventIds.has(eventId)) return;
              seenEventIds.add(eventId);
              mergedEvents.push(event);
            });
          }

          setEvents(mergedEvents);
          setMissions(Array.isArray(missionsData) ? missionsData : []);
          setServerRegions(Array.isArray(regionsData) ? regionsData : []);
        } catch (error) {
          console.error("[Missions] Failed to reload missions/events:", error);
        }
      };

      reload();
      return () => {
        aborted = true;
      };
    };

    window.addEventListener('su:ssot:changed', handleSsotChanged);
    return () => {
      window.removeEventListener('su:ssot:changed', handleSsotChanged);
    };
  }, [isRegionPage, activeRegionId]);

  useEffect(() => {
    const scrollTo = location.state?.scrollTo;
    if (scrollTo === "event" && eventSectionRef.current) {
      eventSectionRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (scrollTo === "mission" && missionSectionRef.current) {
      missionSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.state]);

  // ... (불필요한 중첩 import 제거) ...
  // region 필드 정규화
  const normalizeProgramItems = (items, type) => (Array.isArray(items) ? items : []).map((item) => {
    const startDate = item.startDate || item.start_date || item.start_at || null;
    const endDate = item.endDate || item.end_date || item.end_at || null;
   // regionScope/regionIds/regionId/regionName 정규화
let regionScope = item.regionScope || item.region_scope;
    let regionIds = item.regionIds || item.region_ids || [];
    if (!Array.isArray(regionIds)) {
      if (typeof regionIds === "string" && regionIds) regionIds = [regionIds];
      else regionIds = [];
    }
    let regionId = item.regionId || (regionIds.length > 0 ? regionIds[0] : null) || null;
    let regionName = item.regionName || item.region || "";

    // [이벤트/미션 지역명/필터 보정] 지역 포털에서만 적용
    if ((type === "event" || type === "mission") && isRegionPage) {
      let regionObj = null;
      const scopeToken = normalizeRegionToken(regionScope);
      const regionIdToken = normalizeRegionToken(regionId);
      const regionIdListTokens = regionIds.map((id) => normalizeRegionToken(id)).filter(Boolean);
      const isAllScoped = scopeToken === "all" || scopeToken === "global" || regionIdToken === "all" || regionIdListTokens.includes("all");

      if (isAllScoped) {
        regionScope = "ALL";
        regionId = "all";
        regionIds = ["all"];
        if (!regionName || regionName === "지역 미정") {
          regionName = "전체 지역";
        }
      }

      if (!isAllScoped) {
      // regionId/regionIds가 한글(지역명)일 경우 역매핑
      if (regionId && !/^r-|^all$/i.test(regionId) && /[가-힣]/.test(regionId)) {
        regionObj = findRegionByToken(regionId);
        if (regionObj) {
          regionId = regionObj.id || regionObj.regionId;
          regionName = regionObj.name;
        }
      }
      if (regionIds.length > 0 && regionIds.every(id => !/^r-|^all$/i.test(id) && /[가-힣]/.test(id))) {
        regionObj = findRegionByToken(regionIds[0]);
        if (regionObj) {
          regionId = regionObj.id || regionObj.regionId;
          regionName = regionObj.name;
          regionIds = [regionObj.id || regionObj.regionId];
        }
      }
      // regionId가 슬러그(영문)일 때도 regions에서 id로 regionName 매핑
      if (regionId && /^[a-z0-9\-]+$/.test(regionId)) {
        regionObj = findRegionByToken(regionId);
        if (regionObj) {
          regionName = regionObj.name;
        }
      }
      // regionIds가 슬러그만 있을 때도 역매핑
      if (regionIds.length > 0 && regionIds.every(id => /^[a-z0-9\-]+$/.test(id))) {
        regionObj = findRegionByToken(regionIds[0]);
        if (regionObj) {
          regionName = regionObj.name;
          regionId = regionObj.id || regionObj.regionId;
          regionIds = [regionObj.id || regionObj.regionId];
        }
      }
      // region 정보가 없거나 불완전하면 viewerRegionId/regions에서 보정
      if (!regionScope || regionScope === "") {
        regionScope = "REGION";
      }
      if (!regionId || regionId === "all") {
        regionId = activeRegionId;
      }
      if (!regionIds || regionIds.length === 0 || (regionIds.length === 1 && (!regionIds[0] || regionIds[0] === "all"))) {
        regionIds = [regionId];
      }
      // regionName regions에서 강제 매핑
      if (!regionName || regionName === "" || regionName === "지역 미정" || regionName === regionId) {
        regionObj = findRegionByToken(regionId);
        if (regionObj) {
          regionName = regionObj.name;
        } else if (regionId === "all" || regionScope === "global") {
          regionName = "전체 지역";
        } else {
          regionName = String(regionId || regionIds?.[0] || "알 수 없음");
        }
      }
      }
    }
    // regionId/regionIds가 "all"이거나 비어 있으면 regionName을 "전체 지역"으로 보정
    if ((!regionName || regionName === "" || regionName === regionId) && (regionId === "all" || !regionId || (regionIds.length === 1 && regionIds[0] === "all"))) {
      regionName = "전체 지역";
    }
    return {
      ...item,
      type,
      startDate,
      endDate,
      regionScope,
      regionIds,
      regionId,
      regionName,
      sub: item.description || item.content || "",
      reward: item.points ? `+${Number(item.points).toLocaleString("ko-KR")}P` : "추후 공지",
      remain: endDate ? `~${endDate}` : type === "mission" && item.missionType === "daily" ? "매일" : "상시",
      badge: item.badge || item.category || (type === "mission" ? "미션" : "이벤트"),
      images: normalizeImageList(item.images),
      status: calculateStatus(startDate, endDate) === "ended" ? "ended" : "active",
    };
  });

  const allEvents = useMemo(() => normalizeProgramItems(events, "event"), [events, isRegionPage, activeRegionId, regionCatalog]);
  const allMissions = useMemo(() => normalizeProgramItems(missions, "mission"), [missions, isRegionPage, activeRegionId, regionCatalog]);

  const deduplicateItems = (items) => {
    const seen = new Set();
    return items.filter((item) => {
      const key = getStableItemId(item) || `${item.type}:${item.title}:${item.startDate || ""}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };


  // [REGION-FILTER] 지역/전체/복수 지역 일관 필터
  function matchesViewerRegion(item, viewerRegionId) {
    const regionId = normalizeRegionToken(item?.regionId);
    const regionIds = Array.isArray(item?.regionIds)
      ? item.regionIds.map((x) => normalizeRegionToken(x)).filter(Boolean)
      : [];
    const regionScope = normalizeRegionToken(item?.regionScope);
    const viewerId = normalizeRegionToken(viewerRegionId);

    const isGlobal =
      regionId === 'all' ||
      regionScope === 'all' ||
      regionScope === 'global';

    if (isGlobal) return true;
    if (!viewerId) return true;

    if (regionId && regionId === viewerId) return true;
    if (regionIds.includes(viewerId)) return true;

    return false;
  }

  function regionFiltered(items) {
    return items.filter((item) => {
      return matchesViewerRegion(item, activeRegionId);
    });
  }

  // visibleEvents/visibleMissions: 메인(전체) 페이지에는 regionFiltered 적용 금지, 지역 페이지만 적용
  const visibleEvents = useMemo(() => {
    if (!isRegionPage) return deduplicateItems(allEvents);
    return deduplicateItems(regionFiltered(allEvents));
  }, [allEvents, isRegionPage, activeRegionId]);

  const visibleMissions = useMemo(() => {
    if (!isRegionPage) return deduplicateItems(allMissions);
    return deduplicateItems(regionFiltered(allMissions));
  }, [allMissions, isRegionPage, activeRegionId]);

  const filteredEvents = useMemo(() => visibleEvents.filter((item) => (tab === "active" ? item.status !== "ended" : item.status === "ended")), [tab, visibleEvents]);
  const filteredMissions = useMemo(() => visibleMissions.filter((item) => (tab === "active" ? item.status !== "ended" : item.status === "ended")), [tab, visibleMissions]);

  const getParticipationForItem = (item) => {
    if (participationsLoading || !Array.isArray(participations)) return null;
    const stableId = getStableItemId(item);
    if (!stableId) return null;
    return participations.find((participation) => String(participation.itemType || "") === String(item.type || "") && String(participation.itemId || "").trim() === stableId) || null;
  };

  const openDetailModal = (item) => {
    setDetailItem(item);
    setSubmissionError("");
  };

  const closeDetailModal = () => {
    setDetailItem(null);
  };

  useEffect(() => {
    const highlightType = String(location.state?.highlightType || "").trim().toLowerCase();
    const highlightId = String(location.state?.highlightId || "").trim();
    if (!highlightType || !highlightId) return;

    const requestKey = `${highlightType}:${highlightId}`;
    if (handledHighlightRef.current === requestKey) return;

    const targetItems = highlightType === "mission"
      ? visibleMissions
      : highlightType === "event"
        ? visibleEvents
        : [];
    const target = targetItems.find((item) => getStableItemId(item) === highlightId);
    if (!target) return;

    handledHighlightRef.current = requestKey;
    openDetailModal(target);
  }, [location.state, visibleMissions, visibleEvents]);

  const openSubmissionModal = (item) => {
    setSubmissionItem(item);
    setSubmissionError("");
    setSubmissionForm({ submissionText: "", submissionLink: "", submissionImages: [] });
  };

  const closeSubmissionModal = () => {
    setSubmissionItem(null);
    setSubmissionError("");
    setSubmissionForm({ submissionText: "", submissionLink: "", submissionImages: [] });
  };

  const handleSubmitParticipation = async () => {
    if (!submissionItem || submitting) return;
    const memberId = me?.memberId || null;
    if (!memberId) {
      navigate("/auth", { state: { returnTo: "/missions" } });
      return;
    }

    const submissionText = String(submissionForm.submissionText || "").trim();
    const submissionLink = String(submissionForm.submissionLink || "").trim();
    const submissionImages = normalizeImageList(submissionForm.submissionImages);
    const itemId = getStableItemId(submissionItem);
    const itemKey = `${submissionItem.type}:${itemId}`;
    const crossRegion = requiresCrossRegionParticipation(submissionItem, memberRegionId, isAdmin);

    // 제출 조건 완화: 텍스트만 있어도 제출 가능
    if (!submissionText) {
      setSubmissionError("참여 내용을 작성해 주세요.");
      return;
    }

    if (crossRegion) {
      const confirmed = await new Promise((resolve) => {
        setCrossRegionConfirm({ resolve });
      });
      if (!confirmed) return;
    }

    setSubmitting(true);
    setSubmissionError("");
    try {
      const result = await participationService.addParticipation({
        itemKey,
        itemId,
        itemType: submissionItem.type,
        title: submissionItem.title,
        memberId,
        regionId: memberRegionId,
        crossRegion,
        submissionText,
        submissionLink,
        submissionImages,
      });

      if (!result?.success) {
        throw new Error(result?.error || "submit_failed");
      }

      await reloadParticipations();
      closeSubmissionModal();
      setSuccessMessage(`${submissionItem.type === "mission" ? "미션" : "이벤트"} 참여 접수가 완료되었습니다. 심사 결과는 마이오피스에서 확인할 수 있습니다.`);
    } catch (error) {
      setSubmissionError(getParticipationSubmitErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };


  // 카드 분기 렌더링
  const renderCard = (item, typeLabel) => {
    const isEvent = item.type === 'event';
    const isEnded = item.status === 'ended' || calculateStatus(item.startDate, item.endDate) === 'ended';
    // 날짜 표시 규칙
    const periodText =
      item.startDate && item.endDate
        ? `${formatDateLabel(item.startDate)} ~ ${formatDateLabel(item.endDate)}`
        : item.startDate
        ? `시작일 ${formatDateLabel(item.startDate)}`
        : item.endDate
        ? `~ ${formatDateLabel(item.endDate)}`
        : '기간 미정';

    // 스타일 분기
    const cardBg = isEvent
      ? 'linear-gradient(135deg, #f8fbff 0%, #e0f2fe 60%, #f0f9ff 100%)'
      : 'linear-gradient(135deg, #fffdf7 0%, #fef9e7 60%, #fdf6e3 100%)';
    const lineColor = isEvent
      ? 'linear-gradient(180deg, #38bdf8 0%, #60a5fa 60%, #2563eb 100%)'
      : 'linear-gradient(180deg, #fde047 0%, #facc15 60%, #d97706 100%)';
    const participation = getParticipationForItem(item);
    const hasParticipated = !!participation;
    const labelColor = isEvent ? '#2563eb' : '#d97706';
    const labelBg = isEvent ? '#e0f2fe' : '#fef9c3';
    const icon = isEvent ? '🎉 이벤트' : '🧩 미션';
    const statusBadgeStyle = isEnded
      ? {
          background: '#e5e7eb', color: '#6b7280', border: '1px solid #d1d5db',
          fontSize: 12, fontWeight: 800, padding: '5px 12px', borderRadius: 999, marginLeft: 2
        }
      : isEvent
      ? {
          background: '#dcfce7', color: '#15803d', border: '1px solid #86efac',
          fontSize: 12, fontWeight: 800, padding: '5px 12px', borderRadius: 999, marginLeft: 2
        }
      : {
          background: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d',
          fontSize: 12, fontWeight: 800, padding: '5px 12px', borderRadius: 999, marginLeft: 2
        };
    const titleColor = '#0f172a';
    const dateColor = '#64748b';
    const detailBtnBorder = isEvent ? '1.5px solid #2563eb' : '1.5px solid #d97706';
    const detailBtnColor = isEvent ? '#2563eb' : '#d97706';

    // regionName 카드 표기 보정: regions에서 강제 매핑, 없으면 '전체 지역' 또는 '알 수 없음'
    let regionText = item.regionName || item.region || '';

if (!regionText || regionText === '지역 미정') {
  if (normalizeRegionToken(item.regionScope) === 'all' || normalizeRegionToken(item.regionId) === 'all') {
    regionText = '전체 지역';
  } else {
    const regionObj = findRegionByToken(item.regionId) || findRegionByToken(Array.isArray(item.regionIds) ? item.regionIds[0] : null);
    regionText = regionObj?.name || String(item.regionId || (Array.isArray(item.regionIds) ? item.regionIds[0] : '') || '알 수 없음');
  }
}
const isAllRegion = regionText === '전체 지역';

    return (
      <div
        key={`${item.type}-${getStableItemId(item) || item.title}`}
        style={{
          background: cardBg,
          borderRadius: 16,
          boxShadow: '0 2.5px 10px rgba(15,23,42,0.07)',
          padding: '16px 16px 18px',
          marginBottom: 2,
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          minHeight: 0,
          gap: 8,
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
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginLeft: 14, zIndex: 2 }}>
          <div
            className="card-region"
            style={{
              fontSize: 12,
              fontWeight: isAllRegion ? 700 : 600,
              color: isAllRegion ? '#0ea5e9' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              paddingTop: 2,
            }}
          >
            <span role="img" aria-label="지역">📍</span> {regionText}
          </div>
          <span style={statusBadgeStyle}>{isEnded ? '종료' : '진행중'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 14, zIndex: 2 }}>
          <span style={{
            fontWeight: 800, fontSize: 13, color: labelColor, background: labelBg,
            borderRadius: 999, padding: '4px 10px', letterSpacing: '-0.01em',
          }}>{icon}</span>
        </div>
        {/* 제목 */}
        <div style={{
          fontWeight: 800, fontSize: 16, color: titleColor, margin: '0 0 2px 14px',
          letterSpacing: '-0.2px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 22, lineHeight: 1.4, zIndex: 2,
        }}>{item.title}</div>
        {/* 날짜 */}
        <div style={{ fontSize: 13, color: dateColor, margin: '0 0 8px 14px', zIndex: 2 }}>{periodText}</div>
        {/* 버튼 */}
        <div style={{ display: 'flex', gap: 10, marginLeft: 14, zIndex: 2 }}>
          <button
            type="button"
            onClick={() => openDetailModal(item)}
            style={{
              border: detailBtnBorder,
              background: '#fff',
              color: detailBtnColor,
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 13,
              padding: '6px 14px',
              cursor: 'pointer',
              boxShadow: '0 1px 4px 0 rgba(59,130,246,0.04)',
              transition: 'border-color 0.18s, color 0.18s',
            }}
          >상세</button>
          <button
            type="button"
            onClick={() => openSubmissionModal(item)}
            disabled={isEnded || hasParticipated}
            style={{
              border: '1px solid #22c55e',
              background: hasParticipated ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : (isEnded ? '#e5e7eb' : '#f0fdf4'),
              color: hasParticipated ? '#ffffff' : (isEnded ? '#94a3b8' : '#16a34a'),
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 13,
              padding: '6px 14px',
              cursor: isEnded || hasParticipated ? 'not-allowed' : 'pointer',
              boxShadow: hasParticipated ? '0 10px 24px rgba(34,197,94,0.28)' : '0 1px 4px 0 rgba(34,197,94,0.04)',
              transition: 'border-color 0.18s, color 0.18s',
              opacity: 1,
            }}
          >{hasParticipated ? '참여완료 · 잠김' : '참여'}</button>
        </div>
      </div>
    );
  };

  const detailParticipation = detailItem ? getParticipationForItem(detailItem) : null;
  const detailNeedsCrossRegion = detailItem ? requiresCrossRegionParticipation(detailItem, memberRegionId, isAdmin) : false;
  const detailCanJoin = detailItem ? (detailNeedsCrossRegion || canParticipate(detailItem, memberRegionId, isAdmin)) : false;
  const detailBlockedReason = detailItem && !detailNeedsCrossRegion ? getParticipationBlockedReason(detailItem, memberRegionId, true, detailItem.regionName || null) : "";
  const detailImages = detailItem ? normalizeImageList(detailItem.images) : [];
  const detailIsEnded = detailItem?.status === "ended";

  return (
    <div className="su-page su-page--missions">
      {!isRegionPage && <PageHeader title="미션 / 이벤트" onBack={goBack} action={{ label: "홈", onClick: goHome }} />}

      <div className="su-tabRow">
        <button type="button" className={`su-chip${tab === "active" ? " is-active" : ""}`} onClick={() => setTab("active")}>
          진행중
        </button>
        <button type="button" className={`su-chip${tab === "ended" ? " is-active" : ""}`} onClick={() => setTab("ended")}>
          종료
        </button>
      </div>

      <section className="su-panel">
        <div style={{ fontWeight: 700, color: "var(--c-tx-h)", marginBottom: 8 }}>참여 안내</div>
        <div style={{ fontSize: 13, color: "var(--c-tx-s)", lineHeight: 1.65, wordBreak: 'break-word' }}>
          상세 내용을 충분히 확인한 뒤 참여 제출을 진행해 주세요.<br />
          제출 후에는 즉시 완료되지 않고 심사 대기 상태로 접수됩니다.<br />
          선정된 참여자만 관리자 확인 후 보상이 지급됩니다.
        </div>
      </section>

      {loading ? (
        <div className="su-empty">데이터 로딩 중...</div>
      ) : (
        <>
          <section ref={eventSectionRef} style={{ marginTop: 16 }}>
            <div className="su-sectionHead">
              🎉 이벤트
              <span style={{ fontSize: 12, color: "var(--c-tx-s)", marginLeft: "auto" }}>{filteredEvents.length}개</span>
            </div>
            <div className="su-panel" style={{ marginTop: 8 }}>
              <div style={{ display: "grid", gap: 10 }}>
                {filteredEvents.map((item) => renderCard(item, "이벤트"))}
                {filteredEvents.length === 0 && (
                  <div className="su-empty">표시할 이벤트가 없습니다.</div>
                )}
              </div>
            </div>
          </section>

          <section ref={missionSectionRef} style={{ marginTop: 16 }}>
            <div className="su-sectionHead">
              🎯 미션
              <span style={{ fontSize: 12, color: "var(--c-tx-s)", marginLeft: "auto" }}>{filteredMissions.length}개</span>
            </div>
            <div className="su-panel" style={{ marginTop: 8 }}>
              <div style={{ display: "grid", gap: 10 }}>
                {filteredMissions.map((item) => renderCard(item, "미션"))}
                {filteredMissions.length === 0 && (
                  <div className="su-empty">표시할 미션이 없습니다.</div>
                )}
              </div>
            </div>
          </section>
        </>
      )}

      <div style={{ height: 90 }} />

      {detailItem ? (
        <div style={modalOverlayStyle} onClick={closeDetailModal}>
          <div style={detailModalStyle} onClick={(event) => event.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span className="su-badge su-badge--neutral">{detailItem.type === "mission" ? "미션" : "이벤트"}</span>
                  <span className="su-badge su-badge--neutral">{detailItem.badge}</span>
                  {detailParticipation ? <span style={{ ...getParticipationBadgeStyle(detailParticipation.status), padding: "4px 9px", borderRadius: 999 }}>{getParticipationStatusLabel(detailParticipation.status)}</span> : null}
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", marginTop: 12, lineHeight: 1.35 }}>{detailItem.title}</div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>{detailItem.category || "일반"} · {
                  (() => {
                    let regionText = detailItem.regionName || detailItem.region || '';
                    if (!regionText) {
                      if (normalizeRegionToken(detailItem.regionId) === 'all' || normalizeRegionToken(detailItem.regionScope) === 'all') regionText = '전체 지역';
                      else {
                        const regionObj = findRegionByToken(detailItem.regionId) || findRegionByToken(Array.isArray(detailItem.regionIds) ? detailItem.regionIds[0] : null);
                        regionText = regionObj?.name || String(detailItem.regionId || (Array.isArray(detailItem.regionIds) ? detailItem.regionIds[0] : '') || '지역 미정');
                      }
                    }
                    return regionText;
                  })()
                }</div>
              </div>
              <button type="button" onClick={closeDetailModal} style={closeDetailButtonStyle}>×</button>
            </div>

            <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
              {detailImages.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
                  {detailImages.map((imageUrl, index) => (
                    <a key={`${imageUrl}-${index}`} href={toPreviewUrl(imageUrl)} target="_blank" rel="noreferrer" style={{ display: "block", borderRadius: 16, overflow: "hidden", background: "#e2e8f0" }}>
                      <img src={toPreviewUrl(imageUrl)} alt={`등록 이미지 ${index + 1}`} style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }} />
                    </a>
                  ))}
                </div>
              ) : null}

              <div style={detailBlockStyle}>
                <div style={detailBlockLabelStyle}>내용</div>
                <div style={detailBlockBodyStyle}>{detailItem.description || "상세 설명이 아직 등록되지 않았습니다."}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                <div style={metaCardStyle}>
                  <div style={detailBlockLabelStyle}>시작일</div>
                  <div style={metaCardValueStyle}>{formatDateLabel(detailItem.startDate)}</div>
                </div>
                <div style={metaCardStyle}>
                  <div style={detailBlockLabelStyle}>종료일</div>
                  <div style={metaCardValueStyle}>{formatDateLabel(detailItem.endDate)}</div>
                </div>
                <div style={metaCardStyle}>
                  <div style={detailBlockLabelStyle}>보상 정보</div>
                  <div style={metaCardValueStyle}>{detailItem.reward}</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 22, justifyContent: "flex-end" }}>
              <button type="button" onClick={closeDetailModal} style={secondaryButtonStyle}>닫기</button>
              {!me?.memberId && (
                <button type="button" onClick={() => navigate("/auth", { state: { returnTo: "/missions" } })} className="su-primaryBtn" style={{ minWidth: 160 }}>
                  로그인 후 참여하기
                </button>
              )}
              {me?.memberId && (
                <>
                  {detailParticipation ? (
                    <button type="button" className="su-primaryBtn" style={{ minWidth: 180, opacity: 0.72, pointerEvents: "none" }} disabled>
                      {getParticipationStatusLabel(detailParticipation.status)}
                    </button>
                  ) : detailIsEnded ? (
                    <button type="button" style={{ ...secondaryButtonStyle, minWidth: 140, opacity: 0.55 }} disabled>
                      종료된 항목
                    </button>
                  ) : !detailCanJoin ? (
                    <button type="button" style={{ ...secondaryButtonStyle, minWidth: 220, opacity: 0.7 }} disabled>
                      {detailBlockedReason || "참여 불가"}
                    </button>
                  ) : (
                    <button type="button" className="su-primaryBtn" style={{ minWidth: 180 }} onClick={() => openSubmissionModal(detailItem)}>
                      {detailNeedsCrossRegion
                        ? `${detailItem.type === "mission" ? "타지역 미션" : "타지역 이벤트"} 참여하기`
                        : detailItem.type === "mission"
                          ? "미션 참여하기"
                          : "이벤트 참여하기"}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {submissionItem ? (
        <div style={modalOverlayStyle} onClick={closeSubmissionModal}>
          <div style={submissionModalStyle} onClick={(event) => event.stopPropagation()}>
            <div style={submissionHeaderStyle}>
              <div>
                <div style={submissionTitleStyle}>{submissionItem.type === "mission" ? "미션 참여 제출" : "이벤트 참여 제출"}</div>
                <div style={submissionTargetCardStyle}>
                  <span style={submissionTargetLabelStyle}>제출 대상</span>
                  <span style={submissionTargetValueStyle}>{submissionItem.title}</span>
                </div>
              </div>
              <button type="button" onClick={closeSubmissionModal} style={submissionCloseButtonStyle}>×</button>
            </div>

            <div style={submissionFormGridStyle}>
              {submissionItem && requiresCrossRegionParticipation(submissionItem, memberRegionId, isAdmin) ? (
                <div style={{ ...submissionTargetCardStyle, background: "#fff7ed", border: "1px solid #fdba74", color: "#9a3412" }}>
                  가입 지역과 다른 지역 항목입니다. 제출 시 한 번 더 확인 후 타지역 참여로 접수됩니다.
                </div>
              ) : null}

              <label style={submissionSectionStyle}>
                <span style={submissionSectionTitleStyle}>참여 내용</span>
                <textarea className="su-submissionField" value={submissionForm.submissionText} onChange={(event) => setSubmissionForm((prev) => ({ ...prev, submissionText: event.target.value }))} rows={5} style={{ ...submissionFieldInputStyle, resize: "vertical", minHeight: 102, paddingTop: 10, paddingBottom: 10 }} placeholder="수행 내용, 인증 설명, 결과 요약을 작성해 주세요." />
              </label>

              <label style={submissionSectionStyle}>
                <span style={submissionSectionTitleStyle}>인증 링크</span>
                <input className="su-submissionField" type="url" value={submissionForm.submissionLink} onChange={(event) => setSubmissionForm((prev) => ({ ...prev, submissionLink: event.target.value }))} style={submissionFieldInputStyle} placeholder="https:// 형태의 링크를 입력하세요" />
              </label>

              <div style={submissionSectionStyle}>
                <span style={submissionSectionTitleStyle}>인증 이미지</span>
                <MultiImageUploader
                  value={submissionForm.submissionImages}
                  onChange={(nextImages) => setSubmissionForm((prev) => ({ ...prev, submissionImages: nextImages }))}
                  uploadImage={async (file) => {
                    const result = await storageAdapter.uploadContentImage(file, { context: `participation-${submissionItem.type}` });
                    return result?.imageUrl || result?.url || null;
                  }}
                  helperText="최대 3장 업로드 가능"
                  tone="soft-teal"
                />
              </div>

              {submissionError ? <div style={submissionErrorStyle}>{submissionError}</div> : null}
            </div>

            <div style={submissionActionRowStyle}>
              <button type="button" onClick={closeSubmissionModal} style={submissionCancelButtonStyle}>취소</button>
              <button type="button" onClick={handleSubmitParticipation} disabled={submitting} style={{ ...submissionPrimaryButtonStyle, opacity: submitting ? 0.7 : 1 }}>
                {submitting ? "제출 중..." : "참여 접수 완료"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── 타지역 참여 확인 모달 ── */}
      {crossRegionConfirm ? (
        <div style={{ ...modalOverlayStyle, zIndex: 2000 }} onClick={() => { setCrossRegionConfirm(null); crossRegionConfirm.resolve(false); }}>
          <div style={{ width: "min(360px,100%)", borderRadius: 24, background: "#fff", padding: "28px 24px 20px", boxShadow: "0 24px 60px rgba(15,23,42,0.22)", display: "flex", flexDirection: "column", gap: 16 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 26 }}>📍</span>
              <span style={{ fontSize: 17, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>타지역 참여 확인</span>
            </div>
            <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7, margin: 0, padding: "10px 12px", borderRadius: 12, background: "#fff7ed", border: "1px solid #fdba74" }}>
              가입 지역과 다른 지역 항목입니다.<br />그래도 참여 접수를 진행하시겠습니까?
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
              <button type="button"
                style={{ minHeight: 42, minWidth: 72, borderRadius: 10, border: "1px solid #d4dee8", background: "linear-gradient(180deg,#f8fafc,#f1f5f9)", color: "#334155", fontSize: 14, fontWeight: 700, cursor: "pointer", padding: "0 16px" }}
                onClick={() => { setCrossRegionConfirm(null); crossRegionConfirm.resolve(false); }}>
                취소
              </button>
              <button type="button"
                style={{ minHeight: 42, minWidth: 120, borderRadius: 10, border: "none", background: "linear-gradient(135deg,#0f7f96,#0e7490)", color: "#fff", fontSize: 14, fontWeight: 900, cursor: "pointer", padding: "0 20px", boxShadow: "0 6px 16px rgba(14,116,144,0.22)" }}
                onClick={() => { setCrossRegionConfirm(null); crossRegionConfirm.resolve(true); }}>
                참여 접수
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── 참여 접수 완료 성공 모달 ── */}
      {successMessage ? (
        <div style={{ ...modalOverlayStyle, zIndex: 2000 }} onClick={() => setSuccessMessage("")}>
          <div style={{ width: "min(360px,100%)", borderRadius: 24, background: "#fff", padding: "30px 24px 22px", boxShadow: "0 24px 60px rgba(15,23,42,0.22)", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg,#0f7f96,#0e7490)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, boxShadow: "0 8px 20px rgba(14,116,144,0.28)" }}>✅</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>참여 접수 완료!</div>
            <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7, margin: 0 }}>{successMessage}</p>
            <button type="button"
              style={{ marginTop: 4, minHeight: 44, width: "100%", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#0f7f96,#0e7490)", color: "#fff", fontSize: 15, fontWeight: 900, cursor: "pointer", boxShadow: "0 8px 18px rgba(14,116,144,0.22)" }}
              onClick={() => setSuccessMessage("")}>
              확인
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,0.58)",
  zIndex: 1500,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
};

const detailModalStyle = {
  width: "min(840px, 100%)",
  maxHeight: "88vh",
  overflowY: "auto",
  borderRadius: 24,
  background: "#ffffff",
  padding: 22,
  boxShadow: "0 24px 64px rgba(15,23,42,0.22)",
};

const submissionModalStyle = {
  width: "min(640px, 100%)",
  maxHeight: "84vh",
  overflowY: "auto",
  borderRadius: 30,
  background: "linear-gradient(180deg, #ffffff 0%, #f9fcff 100%)",
  padding: 20,
  boxShadow: "0 30px 70px rgba(15,23,42,0.2), 0 8px 24px rgba(15,23,42,0.08)",
};

const submissionHeaderStyle = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 14,
};

const submissionTitleStyle = {
  fontSize: 30,
  lineHeight: 1.15,
  fontWeight: 900,
  letterSpacing: "-0.02em",
  color: "#0f172a",
};

const submissionTargetCardStyle = {
  marginTop: 8,
  display: "inline-flex",
  flexDirection: "column",
  gap: 2,
  padding: "8px 11px",
  borderRadius: 12,
  border: "1px solid #b8dee7",
  background: "linear-gradient(180deg, #eaf8fb 0%, #e3f4f8 100%)",
};

const submissionTargetLabelStyle = {
  fontSize: 11,
  fontWeight: 800,
  color: "#0f766e",
  letterSpacing: "0.02em",
};

const submissionTargetValueStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: "#334155",
};

const submissionCloseButtonStyle = {
  width: 42,
  height: 42,
  borderRadius: 999,
  border: "1px solid #d6e3ea",
  background: "linear-gradient(180deg, #f8fbff 0%, #eef3f8 100%)",
  color: "#0f172a",
  fontSize: 28,
  lineHeight: 1,
  cursor: "pointer",
  flexShrink: 0,
  boxShadow: "0 4px 10px rgba(15,23,42,0.06)",
  transition: "all 0.2s ease",
};

const submissionFormGridStyle = {
  display: "grid",
  gap: 12,
  marginTop: 14,
};

const submissionSectionStyle = {
  display: "grid",
  gap: 7,
};

const submissionSectionTitleStyle = {
  fontSize: 15,
  fontWeight: 800,
  color: "#334155",
  letterSpacing: "-0.01em",
};

const submissionFieldInputStyle = {
  width: "100%",
  minHeight: 44,
  borderRadius: 12,
  border: "1px solid #c3d5e3",
  background: "#f5fafc",
  padding: "0 12px",
  fontSize: 15,
  color: "#0f172a",
  boxSizing: "border-box",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const submissionErrorStyle = {
  fontSize: 13,
  color: "#dc2626",
  fontWeight: 700,
  marginTop: -2,
};

const submissionActionRowStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  marginTop: 16,
};

const submissionCancelButtonStyle = {
  minHeight: 46,
  minWidth: 76,
  borderRadius: 12,
  border: "1px solid #d4dee8",
  background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
  color: "#334155",
  padding: "0 14px",
  fontSize: 14,
  fontWeight: 800,
  cursor: "pointer",
};

const submissionPrimaryButtonStyle = {
  minHeight: 46,
  minWidth: 180,
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg, #0f7f96 0%, #0e7490 55%, #0c6d87 100%)",
  color: "#ffffff",
  padding: "0 24px",
  fontSize: 16,
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 10px 20px rgba(14,116,144,0.22)",
};

const closeDetailButtonStyle = {
  width: 38,
  height: 38,
  borderRadius: 999,
  border: "1px solid #dbe2ea",
  background: "#f8fafc",
  color: "#0f172a",
  fontSize: 20,
  cursor: "pointer",
};

const detailBlockStyle = {
  padding: 16,
  borderRadius: 16,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
};

const detailBlockLabelStyle = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "#64748b",
};

const detailBlockBodyStyle = {
  marginTop: 8,
  fontSize: 14,
  lineHeight: 1.7,
  color: "#0f172a",
  whiteSpace: "pre-wrap",
};

const metaCardStyle = {
  padding: 14,
  borderRadius: 16,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
};

const metaCardValueStyle = {
  marginTop: 8,
  fontSize: 15,
  fontWeight: 800,
  color: "#0f172a",
};

const secondaryButtonStyle = {
  minHeight: 44,
  borderRadius: 12,
  border: "1px solid #dbe2ea",
  background: "#f8fafc",
  color: "#334155",
  padding: "0 16px",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
};

const fieldStyle = {
  display: "grid",
  gap: 6,
  fontSize: 12,
  fontWeight: 700,
  color: "#334155",
};

const fieldInputStyle = {
  width: "100%",
  minHeight: 44,
  borderRadius: 12,
  border: "1px solid #dbe2ea",
  background: "#ffffff",
  padding: "0 12px",
  fontSize: 14,
  color: "#0f172a",
  boxSizing: "border-box",
};
