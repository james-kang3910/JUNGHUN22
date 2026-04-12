// CHANGES: defensive updates per request
// - internal modal used instead of external VideoLightbox import (prevents build errors when component missing)
// - scroll navigation now snaps to card.offsetLeft to avoid delta mismatch across viewports
// - added body scroll lock when modal is open and Escape key handler
import { useMemo, useState, useEffect, useRef, useLayoutEffect, useCallback } from "react";
import VideoEmbed from "../components/VideoEmbed";
// Import logo so Vite emits it into the build output
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { parseYouTubeId, isYouTubeUrl, isDirectVideoUrl as isDirectVideoUrlUtil } from "../lib/videoUtils";
import { getLatestShareBroadcasts } from "../lib/shareBroadcastStore";
import { getMissions, getEvents, calculateStatus, getPublicNotices, getAuditions } from "../lib/adminStore";
import { normalizeAuditionRankLabel } from "../lib/auditionSchedule";
import * as storageAdapter from "../lib/storageAdapter";
import LiveBroadcastPlayer from "../components/LiveBroadcastPlayer";
import useAutoRefresh from "../hooks/useAutoRefresh";

function CardMediaBox({ children }) {
  // 바깥 래퍼만 su-cardThumb, 내부 su-mediaWrap은 VideoEmbed가 담당
  return (
    <div className="su-cardThumb">
      {children}
    </div>
  );
}

import { isRegionRegistered } from "../lib/regionUtils";

const HOME_NOTICE_POPUP_SESSION_KEY = 'su:home:notice-popup:last-token';

function getViewerMemberId() {
  try {
    return String(window.__SU_SESSION__?.memberId || '').trim();
  } catch (e) {}
  return '';
}

function getNoticePopupSessionKey() {
  const memberId = getViewerMemberId();
  return `${HOME_NOTICE_POPUP_SESSION_KEY}:${memberId || 'guest'}`;
}

function getViewerRegionId() {
  try {
    const selectedRegionId = localStorage.getItem('selectedRegionId');
    if (selectedRegionId) return String(selectedRegionId).trim();
  } catch (e) {}
  try {
    return String(window.__SU_SESSION__?.regionId || '').trim();
  } catch (e) {}
  return '';
}

function isPopupEnabled(item) {
  const camel = item?.isPopup;
  const snake = item?.is_popup;
  const raw = camel !== undefined ? camel : snake;
  if (raw === true || raw === 1) return true;
  const normalized = String(raw || '').trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'y' || normalized === 'yes';
}

export default function Home() {
  console.log('[FORENSIC] 🔍 THIS FILE IS USED: src/pages/Home.jsx');
  const navigate = useNavigate();

  const safeTab = (k) => {
    const key = String(k || "home");
    // debug: trace navigation attempts (pv2 pattern)
    try { console.debug('[Home] safeTab called with key=', key); } catch (e) {}
    
    // ★ 지역 포털 클릭 시: 항상 지역 선택 페이지(`/region`)로 이동하여
    // 상단에 내 지역을 보여주고 다른 지역을 선택할 수 있도록 합니다.
    // (과거에는 저장된 regionId로 바로 이동하도록 했는데, 이로 인해
    // 사용자가 지역을 선택할 기회를 잃는 문제가 있어 변경합니다.)
    // pv2 UX 패턴 채택: 사용자 선택권 우선
    if (key === "region") {
      // 보존성: 만약 저장된 regionId가 등록되지 않으면 정리
      try {
        const savedRegionId = localStorage.getItem("selectedRegionId");
        if (savedRegionId && !isRegionRegistered(savedRegionId)) {
          localStorage.removeItem("selectedRegionId");
        }
      } catch (e) {}
      navigate("/region");
      return;
    }

    const map = {
      home: "/home",
      search: "/search",
      community: "/community",
      shops: "/shops",
      my: "/my",
      missions: "/missions",
      mission: "/missions",
      support: "/support",
      biz: "/shops",
      card: "/my",
    };

    const to = map[key] || "/home";
    try { console.debug('[Home] navigating to', to); } catch (e) {}
    navigate(to, { replace: false });
  };

  const quickTiles = useMemo(
    () => [
      { key: "region", title: "지역포털", sub: "지역선택", icon: "🌐", tone: "cyan" },
      { key: "biz", title: "상권 · 상점", sub: "상점 · VIP", icon: "🏪", tone: "teal" },
      { key: "mission", title: "미션 / 이벤트", sub: "참여형 프로그램", icon: "🎯", tone: "pink" },
      { key: "community", title: "커뮤니티", sub: "클럽 · 모임", icon: "👥", tone: "violet" },
      { key: "support", title: "보급 · 지원", sub: "물품 · 담당자", icon: "🎁", tone: "orange" },
      { key: "broadcast", title: "공유방송", sub: "라이브 · 동영상", icon: "📡", tone: "indigo" },
      { key: "audition", title: "오디션", sub: "응모 · TOP 3 투표", icon: "🎤", tone: "red" },
      { key: "card", title: "마이오피스", sub: "내정보", icon: "🏢", tone: "navy" },
      { key: "distribution", title: "유통지원", sub: "상품 · 유통 · 지원", icon: "📦", tone: "orange" },
    ],
    []
  );

  // Notice: 서버 DB에서 공지사항 로드 + 선택 로직
  // 고정 있으면 가장 오래 전 고정된 것, 없으면 가장 최근 것
  const defaultNotice = useMemo(() => ({
    title: "공지사항",
    body: "지역공유발전플랫폼 베타 운영 중입니다. 미션/이벤트 참여로 포인트가 지급될 수 있습니다.",
    author: "관리자",
    date: "오늘",
  }), []);

  const formatNoticeDate = (dt) => {
    if (!dt) return '';
    const d = new Date(dt);
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  const selectLatestNotices = (all) => {
    try {
      if (!Array.isArray(all) || !all.length) return [];
      const viewerRegionId = getViewerRegionId();
      const filtered = all.filter((n) => {
        if (n.isPublic === false) return false; // 명시적 false일 때만 제외 (null/undefined 는 공개 기본값)
        const scope = String(n.scope || n.regionScope || 'ALL').toUpperCase();
        if (scope === 'ALL') return true;
        if (scope !== 'REGION') return false;
        if (!viewerRegionId) return false;
        const regionId = String(n.regionId || n.region_id || '').trim();
        const regionIds = Array.isArray(n.regionIds)
          ? n.regionIds.map((v) => String(v || '').trim()).filter(Boolean)
          : (Array.isArray(n.regions) ? n.regions.map((v) => String(v || '').trim()).filter(Boolean) : []);
        return regionId === viewerRegionId || regionIds.includes(viewerRegionId);
      });
      if (!filtered.length) return [];
      return [...filtered]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .map((item) => ({
          ...item,
          body: item.content || item.body || '',
          date: formatNoticeDate(item.createdAt),
          author: item.author || item.writer || '관리자',
        }));
    } catch (e) {
      return [];
    }
  };

  const [notice, setNotice] = useState(null);
  const [latestNoticeList, setLatestNoticeList] = useState([]);

  const getCurrentNoticeId = useCallback((item) => {
    return String(item?.id || item?.noticeId || item?.notice_id || '').trim();
  }, []);

  const getNoticePopupToken = useCallback((item) => {
    const noticeId = getCurrentNoticeId(item);
    if (!noticeId) return '';
    const version = String(item?.updatedAt || item?.updated_at || item?.createdAt || item?.created_at || '').trim();
    return version ? `${noticeId}:${version}` : noticeId;
  }, [getCurrentNoticeId]);

  const closeNoticePopup = useCallback(() => {
    setNoticeModalOpen(false);
  }, []);

  const loadHomeNotices = useCallback(async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || '';
      const res = await fetch(`${API_BASE}/api/notices?status=ACTIVE`, { credentials: 'include' });
      if (!res.ok) throw new Error('notice fetch failed');
      const all = await res.json();
      const latest = selectLatestNotices(all);
      setLatestNoticeList(latest);
      setNotice((prev) => latest.find((item) => String(item.id) === String(prev?.id)) || latest[0] || null);
    } catch (e) {
      try {
        const fallback = selectLatestNotices(getPublicNotices() || []);
        setLatestNoticeList(fallback);
        setNotice((prev) => fallback.find((item) => String(item.id) === String(prev?.id)) || fallback[0] || null);
      } catch (_) {}
    }
  }, []);

  // 서버에서 실데이터 로드
  useEffect(() => {
    loadHomeNotices();
  }, [loadHomeNotices]);

  useAutoRefresh(loadHomeNotices, { intervalMs: 15000 });

  useEffect(() => {
    if (!latestNoticeList.length) return;
    const popupEnabled = latestNoticeList.filter((item) => isPopupEnabled(item));
    const popupCandidates = popupEnabled.length ? popupEnabled : latestNoticeList.slice(0, 1);
    if (!popupCandidates.length) return;
    try {
      const sessionKey = getNoticePopupSessionKey();
      const lastSeenToken = sessionStorage.getItem(sessionKey) || '';
      const popupNotice = popupCandidates.find((item) => {
        const token = getNoticePopupToken(item);
        if (!token) return false;
        if (lastSeenToken === token) return false;
        return true;
      });
      if (!popupNotice) return;
      const noticeToken = getNoticePopupToken(popupNotice);
      sessionStorage.setItem(sessionKey, noticeToken);
      setNotice(popupNotice);
      setNoticeModalOpen(true);
    } catch (e) {
      const popupNotice = popupCandidates[0];
      setNotice(popupNotice);
      setNoticeModalOpen(true);
    }
  }, [getNoticePopupToken, latestNoticeList]);

  const pillShortcuts = useMemo(
    () => [],
    []
  );

  const [liveRealtime, setLiveRealtime] = useState({
    weatherSub: "실시간 날씨 불러오는 중",
    weatherTempLabel: "--°",
    weatherStateLabel: "기상 정보",
    weatherFeelLabel: "--°",
    humidityLabel: "--%",
    windLabel: "--m/s",
    airSub: "실시간 미세먼지 불러오는 중",
    airGradeLabel: "보통",
    pm25Label: "-",
    pm10Label: "-",
    aqiLabel: "-",
  });

  const loadLiveRealtime = useCallback(async () => {
    const lat = 37.5665;
    const lon = 126.9780;

    const weatherCodeLabel = (code) => {
      const map = {
        0: "맑음",
        1: "대체로 맑음",
        2: "구름 조금",
        3: "흐림",
        45: "안개",
        48: "짙은 안개",
        51: "약한 이슬비",
        53: "이슬비",
        55: "강한 이슬비",
        61: "약한 비",
        63: "비",
        65: "강한 비",
        71: "약한 눈",
        73: "눈",
        75: "강한 눈",
        80: "소나기",
        95: "뇌우",
      };
      return map[Number(code)] || "기상 정보";
    };

    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m&timezone=Asia%2FSeoul`;
      const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,us_aqi&timezone=Asia%2FSeoul`;

      const [weatherRes, airRes] = await Promise.all([fetch(weatherUrl), fetch(airUrl)]);
      const weatherData = weatherRes.ok ? await weatherRes.json() : null;
      const airData = airRes.ok ? await airRes.json() : null;

      const temp = weatherData?.current?.temperature_2m;
      const feels = weatherData?.current?.apparent_temperature;
      const weatherCode = weatherData?.current?.weather_code;
      const humidity = weatherData?.current?.relative_humidity_2m;
      const wind = weatherData?.current?.wind_speed_10m;
      const weatherSub = (temp != null)
        ? `${weatherCodeLabel(weatherCode)} · ${Math.round(temp)}°C (체감 ${Math.round(feels ?? temp)}°C)`
        : "날씨 정보 준비 중";

      const pm25 = airData?.current?.pm2_5;
      const pm10 = airData?.current?.pm10;
      const aqi = airData?.current?.us_aqi;

      const airGradeLabel = (() => {
        const n = Number(pm25);
        if (!Number.isFinite(n)) return "보통";
        if (n <= 15) return "좋음";
        if (n <= 35) return "보통";
        if (n <= 75) return "나쁨";
        return "매우 나쁨";
      })();

      const airSub = (pm25 != null || pm10 != null)
        ? `PM2.5 ${pm25 != null ? Math.round(pm25) : '-'} · PM10 ${pm10 != null ? Math.round(pm10) : '-'}${aqi != null ? ` · AQI ${Math.round(aqi)}` : ''}`
        : "미세먼지 정보 준비 중";

      setLiveRealtime({
        weatherSub,
        weatherTempLabel: temp != null ? `${Math.round(temp)}°` : "--°",
        weatherStateLabel: weatherCodeLabel(weatherCode),
        weatherFeelLabel: feels != null ? `${Math.round(feels)}°` : "--°",
        humidityLabel: humidity != null ? `${Math.round(humidity)}%` : "--%",
        windLabel: wind != null ? `${Math.round(wind)}m/s` : "--m/s",
        airSub,
        airGradeLabel,
        pm25Label: pm25 != null ? `${Math.round(pm25)}` : "-",
        pm10Label: pm10 != null ? `${Math.round(pm10)}` : "-",
        aqiLabel: aqi != null ? `${Math.round(aqi)}` : "-",
      });
    } catch (e) {
      setLiveRealtime({
        weatherSub: "실시간 날씨 준비 중",
        weatherTempLabel: "--°",
        weatherStateLabel: "기상 정보",
        weatherFeelLabel: "--°",
        humidityLabel: "--%",
        windLabel: "--m/s",
        airSub: "실시간 미세먼지 준비 중",
        airGradeLabel: "보통",
        pm25Label: "-",
        pm10Label: "-",
        aqiLabel: "-",
      });
    }
  }, []);

  useEffect(() => {
    loadLiveRealtime();
  }, [loadLiveRealtime]);

  /* ────────── 광고 이미지 슬라이더 (서버 우선, 로컬 fallback) ────────── */
  // Fallback 배너 데이터
  const adImagesFallback = useMemo(() => [
    { url: "https://picsum.photos/seed/ad1/800/267", alt: "광고 배너 1" },
    { url: "https://picsum.photos/seed/ad2/800/267", alt: "광고 배너 2" },
    { url: "https://picsum.photos/seed/ad3/800/267", alt: "광고 배너 3" },
  ].filter(img => img && img.url), []);

  // 기본 배너 URL: 기존 fallback 이미지들 중 첫 번째를 기본으로 사용
  const DEFAULT_BANNER_URL = useMemo(() => {
    return adImagesFallback && adImagesFallback.length ? adImagesFallback[0].url : 'https://picsum.photos/seed/ad1/800/267';
  }, [adImagesFallback]);

  const [bannerData, setBannerData] = useState([]);
  const [bannerLoading, setBannerLoading] = useState(true);
  const [adSlideIndex, setAdSlideIndex] = useState(0);
  const [broadcastPreviewList, setBroadcastPreviewList] = useState([]);
  const [auditionHighlight, setAuditionHighlight] = useState({ latestAudition: null, topSubmission: null });

  const loadHomeDynamicContent = useCallback(async () => {
    setBannerLoading(true);
    const userRegion = localStorage.getItem('selectedRegionId');

    try {
      const [bannersResult, broadcastsResult, auditionsResult] = await Promise.allSettled([
        storageAdapter.getBanners(userRegion),
        getLatestShareBroadcasts(5, { directFirst: true }),
        storageAdapter.getAuditionHighlights().catch(async () => {
          const list = await storageAdapter.getAuditions().catch(() => getAuditions());
          return { latestAudition: Array.isArray(list) && list.length > 0 ? list[0] : null, topSubmission: null };
        })
      ]);

      if (bannersResult.status === 'fulfilled') {
        let API_BASE = import.meta.env.VITE_API_BASE || "";
        if (!API_BASE && import.meta.env.DEV && typeof window !== 'undefined') {
          API_BASE = `${window.location.protocol}//${window.location.hostname}:8787`;
        }
        const rawBanners = Array.isArray(bannersResult.value) ? bannersResult.value : [];
        const normalized = rawBanners.map(b => {
          let imageUrl = b.imageUrl || null;
          let videoUrl = b.videoUrl || b.video_url || null;
          if (imageUrl && !/^https?:\/\//i.test(imageUrl) && !imageUrl.startsWith('data:')) {
            imageUrl = `${API_BASE}${imageUrl}`;
          }
          if (videoUrl && !/^https?:\/\//i.test(videoUrl) && !videoUrl.startsWith('data:')) {
            videoUrl = `${API_BASE}${videoUrl}`;
          }
          return {
            id: b.id,
            url: imageUrl || videoUrl,
            imageUrl,
            videoUrl,
            alt: b.alt,
            linkUrl: b.linkUrl,
            gradientEnabled: !!b.gradientEnabled,
            gradientPreset: b.gradientPreset || 'dark',
            gradientColor1: b.gradientColor1 || null,
            gradientColor2: b.gradientColor2 || null,
            gradientStop1: b.gradientStop1 ?? 0,
            gradientStop2: b.gradientStop2 ?? 100,
            chipLabel: b.chipLabel || null,
          };
        });
        setBannerData(normalized);
      } else {
        setBannerData([]);
      }

      if (broadcastsResult.status === 'fulfilled') {
        const list = broadcastsResult.value || [];
        const normalized = list.map((item) => ({
          ...item,
          url: item.mediaUrl || item.videoUrl || item.url,
        }));
        setBroadcastPreviewList(normalized);
      }

      if (auditionsResult.status === 'fulfilled') {
        setAuditionHighlight({
          latestAudition: auditionsResult.value?.latestAudition || null,
          topSubmission: auditionsResult.value?.topSubmission || null,
        });
      }
    } catch (error) {
      console.error('[Home] Initial data load failed:', error);
      setBannerData([]);
    } finally {
      setBannerLoading(false);
    }
  }, []);

  // ⚡ 성능 개선: 배너, 방송, 오디션 데이터를 병렬로 로드
  useEffect(() => {
    loadHomeDynamicContent();
  }, [loadHomeDynamicContent]);

  useAutoRefresh(loadHomeDynamicContent, { intervalMs: 15000 });

  // 표시할 배너 (서버 데이터만 사용 - fallback 더미 이미지 제거)
  const displayBanners = useMemo(() => bannerData, [bannerData]);

  // (Removed) client-side brightness analysis prototype - using centered blur overlay instead

  // 5초마다 자동 슬라이드
  useEffect(() => {
    if (displayBanners.length <= 1) return;
    const timer = setInterval(() => {
      setAdSlideIndex((prev) => (prev + 1) % displayBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [displayBanners.length]);

  // 사용자 조작 관련: 터치 스와이프 및 키보드 이벤트
  const [touchStartX, setTouchStartX] = useState(null);

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches?.[0]?.clientX || null);
  };

  const handleTouchMove = (e) => {
    // no-op; we only need start and end for simple swipe
  };

  const handleTouchEnd = (e) => {
    if (touchStartX == null) return;
    const touchEndX = e.changedTouches?.[0]?.clientX;
    if (touchEndX == null) return;
    const dx = touchEndX - touchStartX;
    const threshold = 50; // px
    if (dx > threshold) {
      // swipe right -> prev
      setAdSlideIndex((prev) => (prev - 1 + displayBanners.length) % displayBanners.length);
    } else if (dx < -threshold) {
      // swipe left -> next
      setAdSlideIndex((prev) => (prev + 1) % displayBanners.length);
    }
    setTouchStartX(null);
  };

  // Keyboard navigation (left/right)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') {
        setAdSlideIndex((prev) => (prev - 1 + displayBanners.length) % displayBanners.length);
      } else if (e.key === 'ArrowRight') {
        setAdSlideIndex((prev) => (prev + 1) % displayBanners.length);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [displayBanners.length]);

  // 방송 데이터 리로드 (SSOT 변경 시)
  useEffect(() => {
    const reload = async () => {
      try {
        const list = await getLatestShareBroadcasts(5, { directFirst: true });
        const normalized = (list || []).map((item) => ({
          ...item,
          url: item.mediaUrl || item.videoUrl || item.url,
        }));
        setBroadcastPreviewList(normalized);
      } catch (error) {
        console.error('[Home] broadcastPreviewList reload error:', error);
      }
    };
    
    const onSsotChanged = (ev) => {
      try {
        const key = ev?.detail?.key || ev?.key || null;
        if (!key || key === 'su_broadcast_v1' || key === 'su_broadcasts') {
          reload();
        }
      } catch (e) {}
    };

    const onStorage = (ev) => {
      try {
        const key = String(ev?.key || '');
        if (!key) return;
        if (key === 'su_broadcast_v1' || key === 'su_broadcasts') {
          reload();
        }
      } catch (e) {}
    };
    
    window.addEventListener('storage', onStorage);
    window.addEventListener('su:ssot:changed', onSsotChanged);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('su:ssot:changed', onSsotChanged);
    };
  }, []);

  // Debug: inspect broadcast items actually used by the Home carousel
  useEffect(() => {
    // Log first item and full list for verification
    if (broadcastPreviewList && broadcastPreviewList.length) {
      console.log("[Home] broadcastPreviewList[0]", broadcastPreviewList[0]);
    }
    console.log("[Home] broadcastPreviewList", broadcastPreviewList);
  }, [broadcastPreviewList]);

  // ★ 밋션 데이터: adminStore에서 가져오기 (활성화된 것만, 최신 5개)
  const missionItems = useMemo(() => {
    const allMissions = getMissions();
    // 활성화된 미션만, 진행중 또는 예정인 것
    const activeMissions = allMissions.filter(m => {
      if (!m.isActive) return false;
      const status = calculateStatus(m.startDate, m.endDate);
      return status === "ongoing" || status === "scheduled";
    });
    // 최신순 정렬 후 5개
    const sorted = activeMissions.sort((a, b) => 
      new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    ).slice(0, 5);
    
    // 데이터가 없으면 샘플 표시
    if (sorted.length === 0) {
      return [
        { id: 1, title: "미션: 사진 올리기", time: "오늘 마감" },
        { id: 2, title: "미션: 리뷰 작성", time: "내일 마감" },
        { id: 3, title: "미션: 출석체크", time: "상시" },
      ];
    }
    
    return sorted.map(m => ({
      id: m.id,
      title: m.title,
      time: m.endDate ? `~${m.endDate}` : "상시",
      points: m.points,
      description: m.description,
    }));
  }, []);

  // ★ 이벤트 데이터: adminStore에서 가져오기 (활성화된 것만, 최신 5개)
  const eventItems = useMemo(() => {
    const allEvents = getEvents();
    // 활성화된 이벤트만, 진행중 또는 예정인 것
    const activeEvents = allEvents.filter(e => {
      if (!e.isActive) return false;
      const status = calculateStatus(e.startDate, e.endDate);
      return status === "ongoing" || status === "scheduled";
    });
    // 최신순 정렬 후 5개
    const sorted = activeEvents.sort((a, b) => 
      new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    ).slice(0, 5);
    
    // 데이터가 없으면 샘플 표시
    if (sorted.length === 0) {
      return [
        { id: 1, title: "이벤트: 지역축제", time: "이번주말" },
        { id: 2, title: "이벤트: 체험부스", time: "상시" },
        { id: 3, title: "이벤트: 경품추첨", time: "모집중" },
      ];
    }
    
    return sorted.map(e => ({
      id: e.id,
      title: e.title,
      time: e.endDate ? `~${e.endDate}` : "상시",
      points: e.points,
      description: e.description,
    }));
  }, []);

  // 🔗 타일 → 탭 이동
  const handleTileNav = (key) => {
    if (key === "region") safeTab("region");
    else if (key === "biz") safeTab("shops");
    else if (key === "mission") safeTab("missions");
    else if (key === "community") safeTab("community");
    else if (key === "support") safeTab("support");
    else if (key === "distribution") {
      window.alert("추후 오픈예정");
      return;
    }
    else if (key === "broadcast") navigate("/broadcast");
    else if (key === "audition") navigate("/audition");
    else if (key === "card") safeTab("my");
  };

  // 오디션 데이터 리로드 (SSOT 변경 시)
  useEffect(() => {
    const reload = async () => {
      try {
        const result = await storageAdapter.getAuditionHighlights().catch(async () => {
          const list = await storageAdapter.getAuditions().catch(() => getAuditions());
          return { latestAudition: Array.isArray(list) && list.length > 0 ? list[0] : null, topSubmission: null };
        });
        setAuditionHighlight({
          latestAudition: result?.latestAudition || null,
          topSubmission: result?.topSubmission || null,
        });
      } catch (e) {
        console.error('[Home] reload auditions error:', e);
      }
    };
    
    const onSsotChanged = (ev) => {
      try {
        const changedType = String(ev?.detail?.type || '').toLowerCase();
        const key = ev?.detail?.key || ev?.key || null;
        if (!key || key === 'su_auditions' || changedType === 'auditions' || changedType === 'submissions') reload();
      } catch (e) {}
    };

    const onStorage = (ev) => {
      try {
        const key = String(ev?.key || '');
        if (!key) return;
        if (key === 'su_auditions') reload();
      } catch (e) {}
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('su:ssot:changed', onSsotChanged);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('su:ssot:changed', onSsotChanged);
    };
  }, []);

  // Debug: inspect audition items used by the Home carousel
  useEffect(() => {
    if (auditionHighlight?.latestAudition || auditionHighlight?.topSubmission) {
      console.log("[Home] auditionHighlight", auditionHighlight);
    }
  }, [auditionHighlight]);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxVideo, setLightboxVideo] = useState(null);

  // 밋션/이벤트 모달 state
  const [missionEventModal, setMissionEventModal] = useState({ open: false, item: null, type: null });

  // 공지사항 모달 state
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);

  // 최신 밋션/이벤트 데이터 (서버 DB에서 가져옴 - 더미데이터 제거)
  const latestMissionEventData = useMemo(() => {
    const now = new Date();
    const isRecent = (item) => {
      if (item.isNew) return true;
      if (!item.createdAt) return false;
      const created = new Date(item.createdAt);
      const diffDays = (now - created) / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    };

    // adminStore에서 최신 활성 미션 가져오기
    const allMissions = getMissions();
    const activeMission = allMissions
      .filter(m => m.isActive && calculateStatus(m.startDate, m.endDate) !== "ended")
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0];
    
    // adminStore에서 최신 활성 이벤트 가져오기
    const allEvents = getEvents();
    const activeEvent = allEvents
      .filter(e => e.isActive && calculateStatus(e.startDate, e.endDate) !== "ended")
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0];

    const latestMission = activeMission ? {
      id: activeMission.id,
      type: "mission",
      title: activeMission.title,
      sub: activeMission.description || "",
      reward: activeMission.points ? `+${activeMission.points}P` : "-",
      remain: activeMission.endDate ? `~${activeMission.endDate}` : "상시",
      badge: activeMission.category || "미션",
      isNew: true,
      createdAt: activeMission.createdAt,
    } : null;

    const latestEvent = activeEvent ? {
      id: activeEvent.id,
      type: "event",
      title: activeEvent.title,
      sub: activeEvent.description || "",
      reward: activeEvent.points ? `+${activeEvent.points}P` : "-",
      remain: activeEvent.endDate ? `~${activeEvent.endDate}` : "상시",
      badge: activeEvent.category || "EVENT",
      isNew: true,
      createdAt: activeEvent.createdAt,
    } : null;

    return {
      mission: latestMission ? { ...latestMission, isRecent: isRecent(latestMission) } : null,
      event: latestEvent ? { ...latestEvent, isRecent: isRecent(latestEvent) } : null,
    };
  }, []);

  const openMissionEventModal = (item, type) => {
    setMissionEventModal({ open: true, item, type });
  };

  const closeMissionEventModal = () => {
    setMissionEventModal({ open: false, item: null, type: null });
  };

  // Defensive helpers for video type detection
  const parseYoutubeId = (u) => {
    if (!u) return null;
    try {
      const m = u.match(/(?:v=|\/embed\/|youtu\.be\/|\/shorts\/)([A-Za-z0-9_-]{6,})/);
      return m ? m[1] : null;
    } catch (e) {
      return null;
    }
  };
  const isDirectVideoUrl = (u) => !!(u && /\.(mp4|webm|ogg)(?:\?|$)/i.test(u));

  // carousel refs for scroll-snap + button control
  const broadcastRef = useRef(null);
  const missionRef = useRef(null);
  const auditionRef = useRef(null);

  // Button visibility states for each slider
  const [broadcastMeta, setBroadcastMeta] = useState({ index: 0, visibleCount: 1, atStart: true, atEnd: false });
  const [missionMeta, setMissionMeta] = useState({ index: 0, visibleCount: 1, atStart: true, atEnd: false });
  const [auditionMeta, setAuditionMeta] = useState({ index: 0, visibleCount: 1, atStart: true, atEnd: false });

  const makeScrollChecker = (ref, setter) => () => {
    const el = ref && ref.current;
    if (!el) return setter({ index: 0, visibleCount: 1, atStart: true, atEnd: true });
    const { scrollLeft, clientWidth, scrollWidth } = el;
    const cards = Array.from(el.querySelectorAll(".su-carouselCard"));
    if (!cards.length) return setter({ index: 0, visibleCount: 1, atStart: true, atEnd: true });

    // find the first visible card index (closest to scrollLeft)
    let closest = 0;
    let closestDist = Infinity;
    cards.forEach((c, idx) => {
      const dist = Math.abs(c.offsetLeft - scrollLeft);
      if (dist < closestDist) {
        closestDist = dist;
        closest = idx;
      }
    });

    // visibleCount approximated by how many cards fit in clientWidth
    const cardWidth = cards[0].clientWidth || clientWidth;
    let visibleCount = Math.max(1, Math.floor(clientWidth / (cardWidth || clientWidth)));

    const atStart = scrollLeft <= 2;
    const atEnd = scrollLeft + clientWidth >= scrollWidth - 2 || closest + visibleCount >= cards.length;

    setter({ index: closest, visibleCount, atStart, atEnd });
  };

  useEffect(() => {
    const check = makeScrollChecker(broadcastRef, setBroadcastMeta);
    // initial
    check();
    const el = broadcastRef.current;
    if (!el) return undefined;
    el.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  useEffect(() => {
    const check = makeScrollChecker(missionRef, setMissionMeta);
    check();
    const el = missionRef.current;
    if (!el) return undefined;
    el.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  useEffect(() => {
    const check = makeScrollChecker(auditionRef, setAuditionMeta);
    check();
    const el = auditionRef.current;
    if (!el) return undefined;
    el.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  const scrollByRef = (ref, dir = 1) => {
    const el = ref && ref.current;
    if (!el) return;
    // Find cards inside track and compute next/prev by their offsetLeft (robust across sizes)
    const cards = Array.from(el.querySelectorAll(".su-carouselCard"));
    if (!cards.length) return;

    const scrollLeft = el.scrollLeft;
    // find index of card whose offsetLeft is closest to current scrollLeft
    let closest = 0;
    let closestDist = Infinity;
    cards.forEach((c, idx) => {
      const dist = Math.abs(c.offsetLeft - scrollLeft);
      if (dist < closestDist) {
        closestDist = dist;
        closest = idx;
      }
    });

    let targetIndex = closest + dir;
    if (targetIndex < 0) targetIndex = 0;
    if (targetIndex > cards.length - 1) targetIndex = cards.length - 1;

    const target = cards[targetIndex];
    if (target) el.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
  };

  const scrollToCardIndex = (ref, index = 0) => {
    const el = ref && ref.current;
    if (!el) return;
    const cards = Array.from(el.querySelectorAll(".su-carouselCard"));
    const target = cards[index];
    if (target) el.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
  };

  const openLightbox = (video) => {
    setLightboxVideo(video);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxVideo(null);
  };
  // lock body scroll when modal open, restore on close
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (lightboxOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [lightboxOpen]);

  // close on ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") closeLightbox(); };
    if (lightboxOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);
  const handleBottomNav = (k) => {
    // 명시적으로 router로 이동 (home은 replace:false)
    if (k === "home") return navigate("/home", { replace: false });
    if (k === "search") return navigate("/search", { replace: false });
    if (k === "community") return navigate("/community", { replace: false });
    if (k === "shops") return navigate("/shops", { replace: false });
    if (k === "my") return navigate("/my", { replace: false });
  };

  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 0);
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ★ Sprint 2: 스크롤 시 헤더 콤파트 (스로건 숨김)
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const el = document.querySelector(".su-page.su-home");
    const root = el || window;
    const handler = () => {
      const y = el ? el.scrollTop : window.scrollY;
      setScrolled(y > 36);
    };
    root.addEventListener("scroll", handler, { passive: true });
    return () => root.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="su-page su-home">
      {/* Top */}
      <header className={`su-top su-top--home${scrolled ? " is-scrolled" : ""}`}>
        <div className="su-top__left">
          <div className="su-brandRow">
            <div className="su-logoMark" aria-hidden="true">
              <img src={logo} alt="Share Map" />
            </div>
            <div className="su-brand">Share Map</div>
          </div>
        </div>

        <div className="su-top__right">
          <button
            className="su-searchTrigger"
            aria-label="검색 열기"
            type="button"
            onClick={() => safeTab("search")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Hero - 광고 슬라이더 (최상단) */}
      <section className="su-hero2" style={{ position: "relative", overflow: "hidden" }}>
        {/* LiveBroadcastPlayer - 실시간 방송 위젯 */}
        <div style={{ marginBottom: 16 }}>
          <LiveBroadcastPlayer />
        </div>

        {/* 브랜드 타이틀 헤더 */}
        <div style={{
          textAlign: "center",
          margin: "0 0 16px",
        }}>
          <span className="su-heroPill">
            지역공유 발전 플랫폼
          </span>
        </div>

        {/* 광고 이미지 캐러셀 */}
        <div style={{
          position: "relative",
          width: '100%',
          aspectRatio: '16 / 9',
          margin: '0 auto',
          borderRadius: "var(--r-section)",
          overflow: "hidden",
          background: '#000',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        >
          {displayBanners.length > 0 ? (
            <>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                transition: "transform 0.5s ease-in-out",
                transform: `translateX(-${adSlideIndex * 100}%)`,
              }}
            >
              {displayBanners.map((img, idx) => {
                const hasVideo = !!img.videoUrl;
                const hasImage = !hasVideo && !!img.imageUrl;
                const hasMedia = hasVideo || hasImage;
                return (
                <div
                  key={img.id || idx}
                  style={{
                    position: 'relative',
                    minWidth: "100%",
                    height: "100%",
                    flexShrink: 0,
                    cursor: img.linkUrl ? "pointer" : "default",
                    overflow: 'hidden',
                    background: '#000',
                  }}
                  onClick={() => {
                    if (img.linkUrl) {
                      const a = document.createElement('a');
                      a.href = img.linkUrl;
                      a.target = '_blank';
                      a.rel = 'noopener noreferrer';
                      a.click();
                    }
                  }}
                >
                  {hasVideo ? (
                    <video
                      src={img.videoUrl || undefined}
                      autoPlay
                      muted
                      playsInline
                      loop
                      preload="metadata"
                      poster={img.imageUrl || undefined}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        background: '#000',
                      }}
                    />
                  ) : hasImage ? (
                    <img
                      src={img.imageUrl}
                      alt={img.alt || `광고 ${idx + 1}`}
                      loading="lazy"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: 'block',
                      }}
                    />
                  ) : (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'rgba(255,255,255,0.72)',
                      fontSize: 14,
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                      background: '#000',
                    }}>
                      배너 준비중
                    </div>
                  )}
                  {/* 하단 필터 + 헤드라인 — chipLabel/alt 둘 다 없으면 오버레이 숨김 */}
                  {hasMedia && (img.chipLabel || (img.alt && !/^광고 배너 \d+$/.test(img.alt)) || img.linkUrl) && (
                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '20px 18px 16px', zIndex: 4,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.30) 70%, rgba(0,0,0,0) 100%)' }}>
                    {/* 카테고리 레이블 — chipLabel 있을 때만 */}
                    {img.chipLabel && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      background: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(4px)',
                      WebkitBackdropFilter: 'blur(4px)',
                      borderRadius: 999,
                      padding: '3px 10px',
                      marginBottom: 8,
                      fontSize: 11,
                      fontWeight: 500,
                      color: 'rgba(255,255,255,0.92)',
                      letterSpacing: '0.5px',
                    }}>{img.chipLabel}</div>
                    )}
                    {/* alt 텍스트 — 더미 패턴 제외하고 있을 때만 */}
                    {(img.alt && !/^광고 배너 \d+$/.test(img.alt)) && (
                    <h2 style={{
                      margin: '0 0 10px',
                      color: '#fff',
                      fontSize: (vw && vw < 480) ? 20 : 24,
                      lineHeight: 1.15,
                      fontWeight: 800,
                      textAlign: 'left',
                      textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                      letterSpacing: '-0.5px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '90%'
                    }}>{img.alt}</h2>
                    )}
                    {img.linkUrl && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const a = document.createElement('a');
                          a.href = img.linkUrl;
                          a.target = '_blank';
                          a.rel = 'noopener noreferrer';
                          a.click();
                        }}
                        style={{
                          background: '#C6A75E',
                          border: 'none',
                          borderRadius: 8,
                          color: '#FFFFFF',
                          fontSize: 13,
                          fontWeight: 700,
                          padding: '8px 18px',
                          cursor: 'pointer',
                          letterSpacing: '0.3px',
                          boxShadow: '0 2px 8px rgba(198,167,94,0.50)',
                          transition: 'background 0.15s',
                          display: 'inline-block',
                        }}
                      >
                        자세히 보기 →
                      </button>
                    )}
                  </div>
                  )}
                </div>);
              })}
            </div>
            {/* Navigation controls */}
            {displayBanners.length > 1 && (
              <>
                <button
                  aria-label="Previous banner"
                  onClick={() => setAdSlideIndex((prev) => (prev - 1 + displayBanners.length) % displayBanners.length)}
                  style={{
                    position: 'absolute',
                    left: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 5,
                    background: 'rgba(0,0,0,0.4)',
                    border: 'none',
                    color: '#fff',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ‹
                </button>
                <button
                  aria-label="Next banner"
                  onClick={() => setAdSlideIndex((prev) => (prev + 1) % displayBanners.length)}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 5,
                    background: 'rgba(0,0,0,0.4)',
                    border: 'none',
                    color: '#fff',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ›
                </button>

                {/* Dots indicator */}
                <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4, zIndex: 6 }}>
                  {displayBanners.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setAdSlideIndex(i)}
                      aria-label={`Go to banner ${i + 1}`}
                      className={`su-bannerDot${i === adSlideIndex ? ' is-active' : ''}`}
                    />
                  ))}
                </div>
              </>
            )}
            </>
          ) : (
            /* 배너 없음 */
            <div style={{
              position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
              background: '#f4f6f8',
              display: "flex", flexDirection: 'column',
              alignItems: "center", justifyContent: "center",
              gap: 8,
            }}>
              <div style={{ color: '#aaa', fontSize: 14, fontWeight: 500 }}>배너가 없습니다.</div>
              <div style={{ color: '#bbb', fontSize: 12 }}>관리자에게 문의하여 배너를 등록하세요.</div>
            </div>
          )}
        </div>
      </section>

      {/* ── Featured 카드 (상단 강조 섹션: 상점 + 이벤트 2개 박스) ─────────────── */}
      <section style={{ padding: "0 16px", marginBottom: 8 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {/* 박스 1: 주변 상점 둘러보기 */}
          <div className="su-featuredCard su-featuredCard--compact su-featuredCard--half" role="button" tabIndex={0}
            onClick={() => safeTab("shops")}
            onKeyDown={(e) => e.key === "Enter" && safeTab("shops")}
            style={{ cursor: "pointer" }}
          >
            <div className="su-featuredBadge">✦ 이번 주 추천</div>
            <h2 className="su-featuredTitle">주변 상점</h2>
            <p className="su-featuredSub">
              한눈에 보기
            </p>
            <button type="button" className="su-featuredCta" onClick={(e) => { e.stopPropagation(); safeTab("shops"); }}>
              상점 탐색
            </button>
          </div>

          {/* 박스 2: 상점 이벤트 */}
          <div className="su-featuredCard su-featuredCard--compact su-featuredCard--half su-featuredCard--event" role="button" tabIndex={0}
            onClick={() => navigate("/shops/events")}
            onKeyDown={(e) => e.key === "Enter" && navigate("/shops/events")}
            style={{ cursor: "pointer" }}
          >
            <div className="su-featuredBadge su-featuredBadge--event">🎉 진행 중 이벤트</div>
            <h2 className="su-featuredTitle">이벤트 상점</h2>
            <p className="su-featuredSub">
              진행 중만 보기
            </p>
            <button type="button" className="su-featuredCta su-featuredCta--event" onClick={(e) => { e.stopPropagation(); navigate("/shops/events"); }}>
              이벤트 보기
            </button>
          </div>
        </div>
      </section>

      {/* 빠른 실행 타일 */}
      <section className="su-tiles">
        {quickTiles.map((t) => (
          <button
            key={t.key}
            className={`su-tile su-tile--${t.tone}`}
            onClick={() => handleTileNav(t.key)}
            type="button"
          >
            <div className="su-tile__icon" aria-hidden="true">
              {t.icon}
            </div>
            <div className="su-tile__text">
              <div className="su-tile__title">{t.title}</div>
              <div className="su-tile__sub">{t.sub}</div>
            </div>
          </button>
        ))}
      </section>

      {(latestMissionEventData.mission || latestMissionEventData.event) ? (
        <section className="su-panel">
          <div className="su-panelHead">
            <div className="su-panelTitle">최신 미션/이벤트</div>
          </div>
          <div className="su-missionEventGrid">
            {/* 미션 카드 */}
            {latestMissionEventData.mission && (
            <div
              className="su-missionEventCard su-missionEventCard--mission"
              role="button"
              tabIndex={0}
              onClick={() => openMissionEventModal(latestMissionEventData.mission, 'mission')}
              onKeyDown={(e) => { if (e.key === 'Enter') openMissionEventModal(latestMissionEventData.mission, 'mission'); }}
            >
              {latestMissionEventData.mission.isRecent && (
                <span className="su-newBadge">NEW</span>
              )}
              <div className="su-cardBadge">{latestMissionEventData.mission.badge}</div>
              <div
                className="su-cardTitle"
                style={{
                  wordBreak: 'break-all',
                  whiteSpace: 'pre-line',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: 16,
                  fontWeight: 800,
                  lineHeight: 1.35,
                  marginBottom: 2,
                  maxWidth: '100%',
                  display: 'block',
                }}
              >
                {latestMissionEventData.mission.title}
              </div>
              <div
                className="su-cardSub"
                style={{
                  wordBreak: 'break-all',
                  whiteSpace: 'pre-line',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: 1.5,
                  color: '#64748b',
                  maxWidth: '100%',
                  display: 'block',
                }}
              >
                {latestMissionEventData.mission.sub}
              </div>
              <div className="su-cardMeta">
                <span>보상: {latestMissionEventData.mission.reward}</span>
                <span>{latestMissionEventData.mission.remain}</span>
              </div>
            </div>
          )}

          {/* 이벤트 카드 */}
          {latestMissionEventData.event && (
            <div
              className="su-missionEventCard su-missionEventCard--event"
              role="button"
              tabIndex={0}
              onClick={() => openMissionEventModal(latestMissionEventData.event, 'event')}
              onKeyDown={(e) => { if (e.key === 'Enter') openMissionEventModal(latestMissionEventData.event, 'event'); }}
            >
              {latestMissionEventData.event.isRecent && (
                <span className="su-newBadge">NEW</span>
              )}
              <div className="su-cardBadge">{latestMissionEventData.event.badge}</div>
              <div
                className="su-cardTitle"
                style={{
                  wordBreak: 'break-all',
                  whiteSpace: 'pre-line',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: 16,
                  fontWeight: 800,
                  lineHeight: 1.35,
                  marginBottom: 2,
                  maxWidth: '100%',
                  display: 'block',
                }}
              >
                {latestMissionEventData.event.title}
              </div>
              <div
                className="su-cardSub"
                style={{
                  wordBreak: 'break-all',
                  whiteSpace: 'pre-line',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: 1.5,
                  color: '#64748b',
                  maxWidth: '100%',
                  display: 'block',
                }}
              >
                {latestMissionEventData.event.sub}
              </div>
              <div className="su-cardMeta">
                <span>보상: {latestMissionEventData.event.reward}</span>
                <span>{latestMissionEventData.event.remain}</span>
              </div>
            </div>
          )}
          </div>
        </section>
      ) : null}

      {/* Notice - pv3 UX: 클릭 → 모달 */}
      <section className="su-panel su-panel--notice">
        <div className="su-panelHead">
          <div className="su-panelTitle">📌 공지사항</div>
          <button className="su-panelMore" onClick={() => navigate('/notices')} type="button">
            더보기 →
          </button>
        </div>

        <div
          className="su-noticeMiniList"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            marginTop: 12,
          }}
        >
          {latestNoticeList.length > 0 ? (
            latestNoticeList.slice(0, 3).map((item, idx) => (
              <div
                key={item.id ?? item._id ?? idx}
                className="su-noticeMiniCard"
                onClick={() => {
                  setNotice(item);
                  setNoticeModalOpen(true);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setNotice(item);
                    setNoticeModalOpen(true);
                  }
                }}
                style={{
                  background: '#ffffff',
                  border: '1px solid rgba(15,23,42,0.08)',
                  borderRadius: 14,
                  padding: '12px 14px',
                  boxShadow: '0 4px 12px rgba(15,23,42,0.05)',
                  cursor: 'pointer',
                  transition: '0.2s ease',
                }}
              >
                <div
                  className="su-noticeMiniTitle"
                  style={{
                    color: '#111827',
                    fontSize: 15,
                    fontWeight: 700,
                    lineHeight: 1.35,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {item.title || item.subject || '공지사항'}
                </div>
                <div
                  className="su-noticeMiniMeta"
                  style={{
                    marginTop: 4,
                    color: '#6b7280',
                    fontSize: 12,
                  }}
                >
                  {(item.author || item.writer || '관리자')} · {item.date || ''}
                </div>
              </div>
            ))
          ) : (
            <div
              className="su-noticeMiniCard is-empty"
              style={{
                background: '#ffffff',
                border: '1px solid rgba(15,23,42,0.08)',
                borderRadius: 14,
                padding: '12px 14px',
                boxShadow: '0 4px 12px rgba(15,23,42,0.05)',
              }}
            >
              <div
                className="su-noticeMiniTitle"
                style={{
                  color: '#111827',
                  fontSize: 15,
                  fontWeight: 700,
                  lineHeight: 1.35,
                }}
              >
                등록된 공지사항이 없습니다
              </div>
              <div
                className="su-noticeMiniMeta"
                style={{
                  marginTop: 4,
                  color: '#6b7280',
                  fontSize: 12,
                }}
              >
                새로운 공지가 올라오면 여기에 표시됩니다
              </div>
            </div>
          )}
        </div>

        {/* Notice modal: show full title + full content (pre-wrap) - pv3 UX */}
        {noticeModalOpen && (
          <div className="su-modal-overlay" onClick={() => closeNoticePopup(true)} role="dialog" aria-modal="true">
            <div
              className="su-modal-content"
              onClick={() => {
                const targetId = getCurrentNoticeId(notice);
                setNoticeModalOpen(false);
                if (targetId) navigate(`/notices/${encodeURIComponent(String(targetId))}`);
                else navigate('/notices');
              }}
              style={{
                maxWidth: 640,
                width: '94%',
                maxHeight: '80vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                background: 'linear-gradient(180deg, #ffffff, #f8fafc)',
                border: '1px solid rgba(148,163,184,0.22)',
                borderRadius: 22,
                boxShadow: '0 28px 56px rgba(15,23,42,0.20)',
              }}
            >
              <div style={{ padding: '18px 20px 12px', borderBottom: '1px solid rgba(148,163,184,0.16)' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999, padding: '4px 10px', background: 'rgba(14,116,144,0.12)', color: '#0e7490', fontSize: 11, fontWeight: 800 }}>
                  📌 관리자 공지
                </div>
                <div style={{ marginTop: 10, fontWeight: 800, fontSize: 22, color: '#0f172a', lineHeight: 1.35 }}>
                  {notice && notice.title ? notice.title : '공지'}
                </div>
                <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
                  {notice && notice.author ? notice.author : '관리자'}
                  {notice && notice.date ? (' · ' + notice.date) : ''}
                </div>
              </div>

              <div style={{ padding: '14px 20px 20px', flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.7, color: '#334155' }}>
                  {notice && (notice.content || notice.body) ? (notice.content || notice.body) : '-'}
                </div>
                <div style={{ marginTop: 14, fontSize: 12, color: '#0e7490', fontWeight: 700 }}>
                  팝업을 누르면 공지 상세로 이동합니다.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, padding: '12px 16px 14px', borderTop: '1px solid rgba(148,163,184,0.16)', background: 'rgba(248,250,252,0.95)' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeNoticePopup(true);
                  }}
                  style={{
                    borderRadius: 12,
                    border: '1px solid rgba(148,163,184,0.40)',
                    background: '#ffffff',
                    color: '#334155',
                    minHeight: 44,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {pillShortcuts.length > 0 && (
          <div className="su-shortRow">
            {pillShortcuts.map((p) => (
              <button
                key={p.k}
                className={`su-short su-short--${p.tone}`}
                onClick={() => {
                  if (typeof p.toTab === "string" && p.toTab.startsWith("/")) return navigate(p.toTab);
                  return safeTab(p.toTab);
                }}
                type="button"
              >
                <span className="su-shortIcon" aria-hidden="true">{p.icon}</span>
                <span className="su-shortText">{p.k}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Live */}
      <section className="su-panel su-panel--live">
        <div className="su-panelHead">
          <div className="su-panelTitle">🌤️ 오늘의 날씨 · 대기질</div>
        </div>

        <div
          style={{
            width: '100%',
            textAlign: 'left',
            borderRadius: 22,
            border: '1px solid rgba(103,232,249,0.28)',
            background: 'radial-gradient(120% 120% at 88% 8%, rgba(56,189,248,0.26), transparent 44%), radial-gradient(90% 90% at 0% 100%, rgba(45,212,191,0.24), transparent 50%), linear-gradient(165deg, #12243f 0%, #1c3f69 50%, #23608f 100%)',
            color: '#e7f6ff',
            padding: '9px 11px 9px',
            boxShadow: '0 16px 30px rgba(15,23,42,0.22), inset 0 1px 0 rgba(255,255,255,0.18)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div style={{ position: 'absolute', top: -24, right: -16, width: 124, height: 124, borderRadius: '50%', background: 'radial-gradient(circle, rgba(125,211,252,0.25), transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, position: 'relative', zIndex: 1 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', color: 'rgba(231,246,255,0.72)' }}>REALTIME WEATHER</div>
              <div style={{ marginTop: 2, display: 'flex', alignItems: 'baseline', gap: 7 }}>
                <span style={{ fontSize: 30, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em' }}>{liveRealtime.weatherTempLabel}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(231,246,255,0.92)' }}>{liveRealtime.weatherStateLabel}</span>
              </div>
              <div style={{ marginTop: 3, fontSize: 11, color: 'rgba(231,246,255,0.76)' }}>{liveRealtime.weatherSub}</div>
            </div>
            <div style={{ fontSize: 27, lineHeight: 1 }}>🌤️</div>
          </div>

          <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 6, position: 'relative', zIndex: 1 }}>
            <div style={{ borderRadius: 10, padding: '6px 8px', background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.18)' }}>
              <div style={{ fontSize: 9, color: 'rgba(231,246,255,0.75)' }}>체감</div>
              <div style={{ marginTop: 1, fontSize: 12, fontWeight: 800 }}>{liveRealtime.weatherFeelLabel}</div>
            </div>
            <div style={{ borderRadius: 10, padding: '6px 8px', background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.18)' }}>
              <div style={{ fontSize: 9, color: 'rgba(231,246,255,0.75)' }}>습도</div>
              <div style={{ marginTop: 1, fontSize: 12, fontWeight: 800 }}>{liveRealtime.humidityLabel}</div>
            </div>
            <div style={{ borderRadius: 10, padding: '6px 8px', background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.18)' }}>
              <div style={{ fontSize: 9, color: 'rgba(231,246,255,0.75)' }}>바람</div>
              <div style={{ marginTop: 1, fontSize: 12, fontWeight: 800 }}>{liveRealtime.windLabel}</div>
            </div>
          </div>

          <div style={{ marginTop: 7, display: 'flex', alignItems: 'center', gap: 6, position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: 9, fontWeight: 800, borderRadius: 999, padding: '3px 8px', background: 'rgba(16,185,129,0.18)', border: '1px solid rgba(16,185,129,0.42)', color: '#b9f7e8' }}>미세먼지 {liveRealtime.airGradeLabel}</span>
            <span style={{ fontSize: 10, color: 'rgba(231,246,255,0.80)' }}>PM2.5 {liveRealtime.pm25Label} · PM10 {liveRealtime.pm10Label} · AQI {liveRealtime.aqiLabel}</span>
          </div>
        </div>
      </section>

      {/* Additional horizontal rails appended below '실시간 소식' */}
      <section className="su-panel">
        <div className="su-panelHead">
          <div className="su-panelTitle">📺 공유 방송</div>
          <button className="su-panelMore" onClick={() => navigate("/broadcast")} type="button">
            더보기 →
          </button>
        </div>

        <div className="su-carousel su-broadcastCarousel">
          {broadcastPreviewList.length > 0 ? (
            <>
              <div className="su-carousel__viewport">
                <div className="su-carousel__track" ref={broadcastRef}>
                  {broadcastPreviewList.map((b) => {
                    const url = b?.mediaUrl || b?.url || b?.videoUrl || null;
                    const isDirect = /\.(mp4|webm|ogg)(?:\?|$)/i.test(url || "");
                    const handleClick = () => {
                      if (isDirect) {
                        navigate(`/broadcast/${b.id}`, { state: { videoUrl: url, title: b.title } });
                      } else {
                        openLightbox({ url, title: b.title });
                      }
                    };
                    return (
                    <div key={b.id} className="su-carousel__item su-liveCard su-carouselCard" style={{ cursor: "pointer" }}>
                      <div className="su-liveThumb su-media" role="button" tabIndex={0}
                        onClick={handleClick}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleClick(); }}
                        style={{ borderRadius: 10, background: "linear-gradient(135deg,#1C2A3A,#172035)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)", fontWeight: 800, position: "relative", overflow: "hidden" }}
                        aria-hidden
                      >
                        {(() => {
                          console.log("[MEDIA ITEM]", {
                            title: b?.title,
                            url,
                            isDirect,
                          });
                          return (
                            <CardMediaBox>
                              <VideoEmbed url={url} mode="thumbnail" />
                            </CardMediaBox>
                          );
                        })()}
                      </div>
                      <div className="su-liveTitle" style={{ marginTop: 8, fontSize: 14, fontWeight: 700 }}>{b.title}</div>
                    </div>
                    );
                  })}
                </div>
              </div>
              {broadcastPreviewList.length > 1 ? (
                <div className="su-carouselDots" aria-label="공유 방송 슬라이드 위치">
                  {broadcastPreviewList.map((b, index) => {
                    const active = index === broadcastMeta.index;
                    return (
                      <button
                        key={b.id || index}
                        type="button"
                        className={`su-carouselDot${active ? ' is-active' : ''}`}
                        aria-label={`${index + 1}번째 방송 보기`}
                        aria-pressed={active}
                        onClick={() => scrollToCardIndex(broadcastRef, index)}
                      />
                    );
                  })}
                </div>
              ) : null}
            </>
          ) : (
            <div
              className="su-emptyState"
              style={{
                minHeight: 216,
                borderRadius: 22,
                border: '1px solid rgba(148, 163, 184, 0.18)',
                background: 'linear-gradient(180deg, rgba(244,248,252,0.96), rgba(232,239,247,0.92))',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '28px 20px',
                color: '#526277',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ fontSize: 30, lineHeight: 1, marginBottom: 14 }} aria-hidden="true">📺</div>
              <div style={{ fontSize: 19, fontWeight: 800, color: '#2c3c55', marginBottom: 8 }}>공유방송 준비중</div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: '#6b7a90' }}>
                현재 진행 중인 공유방송이 없습니다.<br />
                새로운 방송이 곧 공개됩니다.
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="su-panel">
        <div className="su-panelHead">
          <div className="su-panelTitle">🎤 오디션</div>
          <button className="su-panelMore" onClick={() => navigate("/audition")} type="button">
            더보기 →
          </button>
        </div>

        <div className="su-auditionStack">
          <div className="su-liveCard su-auditionFeatureCard su-auditionFeatureCard--notice">
            <div className="su-auditionFeatureLabel su-auditionFeatureLabel--notice">오디션 모집</div>
            {auditionHighlight.latestAudition ? (
              (() => {
                const latestAudition = auditionHighlight.latestAudition;
                const auditionImage = latestAudition.imageUrl || latestAudition.posterUrl;
                const periodText = (latestAudition.startAt || latestAudition.endAt)
                  ? `${String(latestAudition.startAt || '').slice(0, 10) || '-'} ~ ${String(latestAudition.endAt || '').slice(0, 10) || '-'}`
                  : '일정 추후 공지';

                return auditionImage ? (
                  <div className="su-auditionFeatureBody" role="button" tabIndex={0} onClick={() => navigate(`/audition/${latestAudition.id}`)} onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/audition/${latestAudition.id}`); }}>
                    <div className="su-auditionFeatureMedia su-auditionFeatureMedia--notice">
                      <img src={auditionImage} alt={latestAudition.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    </div>
                    <div className="su-auditionFeatureContent">
                      <div className="su-auditionFeatureTitle">{latestAudition.title}</div>
                      <div className="su-auditionFeatureMeta">{periodText}</div>
                      <div className="su-auditionFeatureDescription">
                        {String(latestAudition.description || '최신 오디션 모집 정보를 확인하세요.').slice(0, 88)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="su-auditionFeatureBody"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/audition/${latestAudition.id}`)}
                    onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/audition/${latestAudition.id}`); }}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 18,
                      minHeight: 212,
                      padding: 24,
                      borderRadius: 20,
                      overflow: 'hidden',
                      background: 'linear-gradient(135deg, #6a5cff, #2dd4bf)',
                      color: '#ffffff',
                      textAlign: 'center',
                      boxShadow: '0 20px 36px rgba(106,92,255,0.24)',
                    }}
                  >
                    <div style={{ position: 'absolute', right: -4, bottom: -18, fontSize: 112, lineHeight: 1, opacity: 0.16, pointerEvents: 'none', transform: 'rotate(-8deg)' }} aria-hidden="true">🎤</div>
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 34, padding: '0 14px', borderRadius: 999, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.26)', fontSize: 13, fontWeight: 900, backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}>
                        🎤 오디션 진행 중!
                      </span>
                    </div>
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        fontSize: 'clamp(25.5px, 5.8vw, 28px)',
                        fontWeight: 900,
                        lineHeight: 1.2,
                        letterSpacing: 'clamp(-0.045em, -0.2vw, -0.03em)',
                        whiteSpace: 'normal',
                        maxWidth: '100%',
                        padding: '0 4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordBreak: 'break-all',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>지금 바로 참여하세요</div>
                      <div style={{
                        fontSize: 15,
                        lineHeight: 1.65,
                        color: 'rgba(255,255,255,0.92)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordBreak: 'break-all',
                        maxWidth: '100%',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>지역주민 누구나 지원 가능</div>
                      <div style={{
                        maxWidth: 280,
                        fontSize: 13,
                        fontWeight: 700,
                        lineHeight: 1.5,
                        color: 'rgba(255,255,255,0.84)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordBreak: 'break-all',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>{latestAudition.title}</div>
                    </div>
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 38, maxWidth: '100%', padding: '0 12px', borderRadius: 999, background: 'rgba(8,15,38,0.18)', border: '1px solid rgba(255,255,255,0.20)', fontSize: 'clamp(11.5px, 3.2vw, 13px)', fontWeight: 800, letterSpacing: 'clamp(-0.03em, -0.12vw, -0.01em)', color: '#ffffff', whiteSpace: 'nowrap' }}>
                        참여 기간 · {periodText}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="su-emptyState su-auditionEmpty">
                <div className="su-emptyState__title">등록된 오디션 모집이 없습니다.</div>
              </div>
            )}
          </div>

          <div className="su-liveCard su-auditionFeatureCard su-auditionFeatureCard--top">
            <div className="su-auditionFeatureLabel su-auditionFeatureLabel--top">현재 투표 1위</div>
            {auditionHighlight.topSubmission ? (
              <>
              <div
                className="su-auditionFeatureBody"
                role="button"
                tabIndex={0}
                onClick={() => openLightbox({ url: auditionHighlight.topSubmission.mediaUrl, title: auditionHighlight.topSubmission.title || '대표 영상' })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    openLightbox({ url: auditionHighlight.topSubmission.mediaUrl, title: auditionHighlight.topSubmission.title || '대표 영상' });
                  }
                }}
              >
                <div className="su-auditionFeatureMedia su-auditionFeatureMedia--top">
                  {normalizeAuditionRankLabel(auditionHighlight.topSubmission.rankLabel) ? <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 3, maxWidth: 'calc(100% - 20px)', padding: '6px 12px', borderRadius: 999, background: 'linear-gradient(135deg,#fff5cc,#f5c451)', color: '#3d2b00', fontSize: 12, fontWeight: 900, boxShadow: '0 6px 16px rgba(15,23,42,0.18)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{auditionHighlight.topSubmission.rankLabel}</div> : null}
                  <CardMediaBox>
                    <VideoEmbed
                      url={auditionHighlight.topSubmission.mediaUrl}
                      mode="thumbnail"
                      thumbnail={auditionHighlight.topSubmission.thumbnailUrl}
                    />
                  </CardMediaBox>
                </div>
                <div className="su-auditionFeatureContent">
                  <div className="su-auditionFeatureTitle">{auditionHighlight.topSubmission.title || '대표 영상'}</div>
                  <div className="su-auditionFeatureMeta">{auditionHighlight.topSubmission.auditionTitle || '오디션 영상'}</div>
                  <div className="su-auditionFeatureScore">
                    <span className="su-auditionFeatureScoreIcon" aria-hidden="true">❤</span>
                    <span className="su-auditionFeatureScoreText">{Number(auditionHighlight.topSubmission.votesCount || 0).toLocaleString('ko-KR')}표</span>
                  </div>
                </div>
              </div>
              <div className="su-auditionFeatureActions">
                <button
                  type="button"
                  className="su-panelMore su-auditionFeatureMore"
                  onClick={() => navigate(`/audition/${auditionHighlight.topSubmission.auditionId}`)}
                >
                  더보기 →
                </button>
              </div>
              </>
            ) : (
              <div className="su-emptyState su-auditionEmpty">
                <div className="su-emptyState__title">등록된 참가 영상이 없습니다.</div>
              </div>
            )}
          </div>
        </div>
      </section>

  {/* Video Lightbox (overlay) */}
  {/* Internal lightbox/modal (defensive: avoids depending on external component) */}
  {lightboxOpen ? (
    <div className="su-modal-overlay" onClick={closeLightbox} role="dialog" aria-modal="true">
      <div className="su-modal-content" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="su-modal-close" onClick={closeLightbox} aria-label="닫기">✕</button>
        <div className="su-modal-body">
          <div className="su-modal-title" style={{ marginBottom: 8, fontWeight: 800 }}>{lightboxVideo?.title || "영상 보기"}</div>
          {(() => {
            const item = lightboxVideo || {};
            const url = item?.url || item?.videoUrl || item?.src || item?.link || (item?.media && item.media.url) || null;
            const id = parseYouTubeId?.(url);
            const embed = id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&autoplay=1` : null;
            console.log("[MEDIA ITEM]", {
              title: item?.title,
              source: item?.source,
              type: item?.type,
              url: item?.url,
              youtubeUrl: isYouTubeUrl?.(url),
              youtubeId: parseYouTubeId?.(url),
              decided: (isYouTubeUrl?.(url) || item?.source === "youtube" || item?.type === "youtube") ? "YOUTUBE_IFRAME" : "DIRECT_OR_IMAGE",
            });
            console.log("[YOUTUBE EMBED]", { url, id: parseYouTubeId(url), embed });
            if (id) {
              return (
                <div style={{ position: "relative", paddingTop: "56.25%" }}>
                  <iframe
                    title="lightbox-yt"
                    src={embed}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
              );
            }
            if (isDirectVideoUrlUtil(url)) {
              return <video controls autoPlay src={url || undefined} style={{ width: "100%,", borderRadius: 12 }} />;
            }
            return (
              <div style={{ minHeight: 220, borderRadius: 12, background: "linear-gradient(90deg,#1C2130,#141820)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.35)" }}>미리보기 불가능</div>
            );
          })()}
        </div>
      </div>
    </div>
  ) : null}

  {/* ────────── 밋션/이벤트 상세 팝업 모달 ────────── */}
  {missionEventModal.open && missionEventModal.item ? (
    <div
      className="su-modal-overlay"
      onClick={closeMissionEventModal}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="su-modal-content--mission"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 28 }}>
            {missionEventModal.type === "mission" ? "🎯" : "🎉"}
          </span>
          <div style={{ flex: 1 }}>
            <div className="su-missionTitle">
              {missionEventModal.item.title}
              {missionEventModal.item.isRecent && (
                <span className="su-newBadge" style={{ position: 'relative', top: 'auto', right: 'auto', marginLeft: 8 }}>NEW</span>
              )}
            </div>
            <div className="su-missionSub">
              {missionEventModal.type === "mission" ? "미션" : "이벤트"}
            </div>
          </div>
          <span className="su-missionBadge">{missionEventModal.item.badge}</span>
        </div>

        {/* 내용 */}
        <div className="su-modal-inner">
          <div className="su-missionBody">{missionEventModal.item.sub}</div>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between" }}>
            <span className="su-missionMeta">보상</span>
            <span className="su-missionMetaVal">{missionEventModal.item.reward}</span>
          </div>
          <div style={{ marginTop: 6, display: "flex", justifyContent: "space-between" }}>
            <span className="su-missionMeta">기간</span>
            <span className="su-missionMetaVal">{missionEventModal.item.remain}</span>
          </div>
        </div>

        {/* 버튼 */}
        <div className="su-modal-footer" style={{ borderTop: 'none', background: 'transparent', padding: '4px 0 0' }}>
          <button
            type="button"
            className="su-modal-cancelBtn"
            onClick={closeMissionEventModal}
          >
            닫기
          </button>
          <button
            type="button"
            className="su-modal-confirmBtn"
            onClick={() => {
              closeMissionEventModal();
              navigate("/missions", {
                state: { scrollTo: missionEventModal.type === "mission" ? "mission" : "event" },
              });
            }}
          >
            전체보기
          </button>
        </div>
      </div>
    </div>
  ) : null}

  {/* ── 사이트 푸터 ── */}
  <footer style={{
    borderTop: "1px solid #E2E8F0",
    marginTop: 8,
    padding: "28px 20px 20px",
    textAlign: "center",
    background: "#F8FAFC",
  }}>
    <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 14, color: "#0F172A", letterSpacing: "-0.2px" }}>
      지역 공유발전 플랫폼
    </p>
    <p style={{ margin: "0 0 2px", fontSize: 12, color: "#64748B", lineHeight: 1.7 }}>
      운영주체: 지역 공유발전 플랫폼 운영팀&nbsp;&nbsp;|&nbsp;&nbsp;이메일: bclub21@naver.com
    </p>
    <p style={{ margin: "0 0 12px", fontSize: 11, color: "#94A3B8", lineHeight: 1.6 }}>
      본 플랫폼은 지역경제 활성화를 위한 참여형 서비스로 금융·투자 상품을 판매하지 않습니다.<br />
      이용자 간 거래로 발생하는 분쟁에 대해 플랫폼이 직접 책임지지 않습니다.
    </p>
    <p style={{ margin: "0 0 10px", fontSize: 12, color: "#64748B" }}>
      © 2026 지역 공유발전 플랫폼. All rights reserved.
    </p>
    <p style={{ margin: 0, fontSize: 12 }}>
      <a
        href="/terms"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#64748B", textDecoration: "none" }}
      >이용약관</a>
      <span style={{ color: "#CBD5E1", margin: "0 8px" }}>|</span>
      <a
        href="/privacy"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#0E7490", fontWeight: 700, textDecoration: "none" }}
      >개인정보처리방침</a>
    </p>
  </footer>

  <div className="bottomNavSpacer" />
    </div>
  );
}
