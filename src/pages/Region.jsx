import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { getRegionById, getMissions, getEvents, getShops, getPublicNotices } from "../lib/adminStore";
import * as storageAdapter from "../lib/storageAdapter";
import { isRegionRegistered } from "../lib/regionUtils";
import { getSession, getMemberById } from "../lib/authStore";
import { canParticipate, getParticipationBlockedReason, checkIsAdmin } from "../lib/viewerRegionStore";
import * as participationService from "../lib/participationService";
import { getRegionNotices, formatNotice } from "../lib/noticeUtils"; // ★ PV3 완전 복원

// NaN 방어 헬퍼 — null/undefined/NaN→null(숨김), 0은 "0" 유지 (단위 포함 format string에서 hide가 안전)
const fmtRegion = {
  households: (v) => {
    const n = Number(v);
    if (v == null || isNaN(n)) return null;
    if (n === 0) return '0';
    return `${(n / 10000).toFixed(1)}만`;
  },
  price: (v) => {
    const n = Number(v);
    if (v == null || isNaN(n)) return null;
    if (n === 0) return '0';
    return `${n}`;
  },
};

export default function Region() {
  const { id } = useParams();
  const outletCtx = useOutletContext() || {};
  const selectedDistrictId = outletCtx.selectedDistrictId || '';
  const [tab, setTab] = useState("news"); // news | intro | gallery
  // 항상 모두 보기로 동작하도록 기본값을 true로 설정합니다.
  const [showAll, setShowAll] = useState(true); // 모두 보기 토글 (항상 켜짐)
  const navigate = useNavigate();

  // 지역 데이터 로드 (storageAdapter에서 가져옴)
  const [region, setRegion] = useState(null);
  const [regionsLoaded, setRegionsLoaded] = useState(false);
  const [publicNotices, setPublicNotices] = useState([]);
  
  // ★ PV3 완전 복원: 지역 공지사항 모달 상태
  const [regionNoticeModalOpen, setRegionNoticeModalOpen] = useState(false);
  const [selectedRegionNotice, setSelectedRegionNotice] = useState(null);
  const [regionNotices, setRegionNotices] = useState([]);

  // ★ FIX Issue #2: Server-based participation state
  const [regionParticipations, setRegionParticipations] = useState(null); // null = loading
  const [participationsLoading, setParticipationsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const all = await storageAdapter.getRegions();
        const found = all.find(r => String(r.id) === String(id));
        setRegion(found || null);
        setRegionsLoaded(true);
      } catch (err) {
        console.error('[Region] Failed to load regions:', err);
        setRegion(null);
        setRegionsLoaded(true);
      }
    })();
  }, [id]);

  useEffect(() => {
    const load = () => {
      try { setPublicNotices(getPublicNotices() || []); } catch (e) { setPublicNotices([]); }
    };
    load();
    window.addEventListener('su:ssot:changed', load);
    window.addEventListener('storage', load);
    return () => {
      window.removeEventListener('su:ssot:changed', load);
      window.removeEventListener('storage', load);
    };
  }, []);

  // ★ PV3 완전 복원: 서버에서 지역 공지 불러오기
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const notices = await getRegionNotices(id);
        setRegionNotices(notices.map(formatNotice));
      } catch (error) {
        console.error('[Region] Failed to load region notices:', error);
        setRegionNotices([]);
      }
    })();
  }, [id]);

  // ★ myMember 선언 (TDZ 방지 - loadParticipations보다 먼저)
  const session = getSession();
  const myMember = session && session.memberId ? getMemberById(session.memberId) : null;

  // ★ FIX Issue #2: Load user participations from server DB
  const loadParticipations = async () => {
    setParticipationsLoading(true); // 🔍 Issue #2: Prevent premature rendering
    try {
      const memberId = myMember?.id || myMember?.memberId;
      if (!memberId) {
        setRegionParticipations([]);
        setParticipationsLoading(false);
        return;
      }
      const list = await storageAdapter.getParticipations(memberId);
      setRegionParticipations(Array.isArray(list) ? list : []);
      console.log('[Region] Participations loaded:', list?.length || 0);
    } catch (e) {
      console.error('[Region] Failed to load participations:', e);
      setRegionParticipations([]);
    } finally {
      setParticipationsLoading(false); // 🔍 Issue #2: Loading complete
    }
  };

  useEffect(() => {
    loadParticipations();
  }, [myMember]);

  useEffect(() => {
    const reload = () => {
      loadParticipations();
    };
    window.addEventListener('su:ssot:changed', reload);
    return () => {
      window.removeEventListener('su:ssot:changed', reload);
    };
  }, [myMember]);
  
  // ★ 서버 DB에서 미션/이벤트 로드
  const [missions, setMissions] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const missionParams = { regionId: id };
        if (selectedDistrictId) missionParams.districtId = selectedDistrictId;
        const eventParams = { regionId: id };
        if (selectedDistrictId) eventParams.districtId = selectedDistrictId;

        const [missionData, eventData, regionEventData] = await Promise.all([
          storageAdapter.getMissions(missionParams),
          storageAdapter.getEvents(eventParams),
          storageAdapter.getRegionEvents(id)
        ]);
        
        // 해당 지역의 미션 필터링: 오직 REGION 스코프이며 현재 지역 ID를 포함하는 항목만 표시
        const regionMissions = (missionData || []).filter(m => {
          if (m.regionScope === "REGION" && Array.isArray(m.regionIds)) {
            return m.regionIds.some(rid => String(rid) === String(id));
          }
          return false;
        });

        // 기존 이벤트 API(REGION 스코프) 필터
        const regionScopedEvents = (eventData || []).filter(e => {
          if (e.regionScope === "REGION" && Array.isArray(e.regionIds)) {
            return e.regionIds.some(rid => String(rid) === String(id));
          }
          return false;
        });

        // 지역 이벤트 API(region_events) 결과를 동일 포맷으로 정규화
        const directRegionEventsRaw = Array.isArray(regionEventData?.events)
          ? regionEventData.events
          : (Array.isArray(regionEventData) ? regionEventData : []);
        const directRegionEvents = directRegionEventsRaw.map((event) => ({
          ...event,
          id: event.id || event.event_id,
          regionScope: "REGION",
          regionIds: [String(event.regionId || event.region_id || id)],
          districtId: event.districtId || event.district_id || null,
        }));

        // 두 소스를 합치되 이벤트 ID 기준 중복 제거
        const regionEvents = [
          ...regionScopedEvents,
          ...directRegionEvents.filter((event) => {
            const nextId = String(event.id || event.event_id || "");
            return !regionScopedEvents.some((base) => String(base.id || base.event_id || "") === nextId);
          }),
        ];
        
        // 구/군 클라이언트 필터: district_id가 없거나(null이면 전체 노출) 선택 구/군과 일치하는 항목만
        const districtFilter = (item) => {
          if (!selectedDistrictId) return true;
          return !item.districtId || String(item.districtId) === String(selectedDistrictId);
        };

        setMissions(regionMissions.filter(districtFilter));
        setEvents(regionEvents.filter(districtFilter));
      } catch (error) {
        console.error('[Region] Failed to load missions/events:', error);
        setMissions([]);
        setEvents([]);
      }
    })();
  }, [id, selectedDistrictId]);
  
  const stores = useMemo(() => {
    if (!region) return [];
    const allStores = getShops();
    return allStores.filter(s => {
      // regionId가 없으면 제외 (지역이 지정되지 않은 상점은 표시하지 않음)
      if (!s.regionId) return false;
      // regionId가 현재 지역과 일치하는지 확인 (타입 안전 비교)
      return String(s.regionId) === String(id);
    });
  }, [id, region]);
  
  // ★ 서버 DB에서 상점 로드 (SSOT)
  const [serverShops, setServerShops] = useState([]);
  useEffect(() => {
    async function loadServerShops() {
      try {
        const shops = await storageAdapter.getShops();
        // 승인된(visible) 상점만 필터링
        const approved = shops.filter(s => s.visible || s.status === 'approved');
        setServerShops(approved);
      } catch (e) {
        console.error('[Region] Failed to load server shops:', e);
        // 일시적 조회 실패 시 기존 목록 유지 (화면 튐 방지)
      }
    }
    loadServerShops();
    
    const onSSOT = () => loadServerShops();
    window.addEventListener('su:ssot:changed', onSSOT);
    return () => window.removeEventListener('su:ssot:changed', onSSOT);
  }, []);
  
  // ★ 서버 상점과 로컬 상점 통합하여 필터링
  const filteredStores = useMemo(() => {
    if (!region) return [];
    
    // 1. 로컬 상점과 서버 상점 통합
    const combined = [...stores, ...serverShops];
    
    // 2. ID 기준 중복 제거
    const uniqueMap = new Map();
    combined.forEach(shop => {
      if (!uniqueMap.has(shop.id)) {
        uniqueMap.set(shop.id, shop);
      }
    });
    
    // 3. 현재 지역에 해당하는 상점만 필터링
    return Array.from(uniqueMap.values()).filter(s => {
      // regionId가 없으면 제외 (지역이 지정되지 않은 상점은 표시하지 않음)
      if (!s.regionId) return false;
      // regionId가 현재 지역과 일치하는지 확인 (타입 안전 비교)
      return String(s.regionId) === String(id);
    });
  }, [id, region, stores, serverShops]);

  // NEWS & GALLERY hooks must be called unconditionally to preserve Hook order.
  const news = useMemo(() => {
    if (!region) return [];
    return [
      // 지역 공지사항 추가 (상위 표시)
      ...regionNotices.map((notice) => ({
        id: `notice-${notice.id}`,
        title: notice.title,
        sub: notice.content || "공지 내용",
        tag: "📌 공지",
        time: notice.formattedDate || "최근",
        origType: 'notice',
        origId: notice.id,
        orig: null, // 공지는 참여 불가
        isNotice: true, // 공지 구분용
      })),
      // 모든 이벤트 표시
      ...events.map((e) => ({
        id: `event-${e.id}`,
        title: e.title,
        sub: e.description || "이벤트 정보",
        tag: "이벤트",
        time: e.period || "진행중",
        origType: 'event',
        origId: e.id,
        orig: e,
      })),
      // 모든 미션 표시
      ...missions.map((m) => ({
        id: `mission-${m.id}`,
        title: m.title,
        sub: m.description || "미션 정보",
        tag: "미션",
        time: `${m.points}P`,
        origType: 'mission',
        origId: m.id,
        orig: m,
      })),
    ];
  }, [events, missions, region, regionNotices]);

  const gallery = useMemo(() => {
    if (!region) return [];
    const normalize = (v) => {
      if (!v) return [];
      if (Array.isArray(v)) return v;
      if (typeof v === 'object') return Object.values(v).filter(Boolean);
      return [v];
    };

    const attractions = normalize(region.attractions);
    const festivals = normalize(region.festivals);

    return [
      ...attractions.map((a, i) => ({
        id: `attraction-${i}`,
        title: a && a.name ? a.name : (typeof a === 'string' ? a : ''),
        sub: "관광지",
        badge: "PHOTO"
      })),
      ...festivals.map((f, i) => ({
        id: `festival-${i}`,
        title: f && f.name ? f.name : (typeof f === 'string' ? f : ''),
        sub: f && f.period ? f.period : '',
        badge: "EVENT"
      })),
    ];
  }, [region]);

  // ★ 지역이 등록(공개)되었는지 확인 (서버 DB 기반)
  const isRegistered = useMemo(() => {
    if (!region) return false;
    // region.isPublic: boolean 또는 0/1, "0"/"1"일 수 있음
    if (region.isPublic !== undefined && region.isPublic !== null) {
      const v = region.isPublic;
      if (typeof v === 'boolean') return v;
      if (typeof v === 'number') return v === 1;
      if (typeof v === 'string') return v === '1' || v.toLowerCase() === 'true';
    }
    // 과거 localStorage 기반 플래그 호환
    if (typeof region.isRegistered === 'boolean') return region.isRegistered;
    return false; // 기본값: 비공개
  }, [region]);

  // ★ regionId가 없거나 잘못된 경우, 또는 등록되지 않은 경우 처리
  // 리다이렉트: regionsLoaded가 true가 될 때만 region null 상태를 최종적으로 판단합니다.
  useEffect(() => {
    if (!regionsLoaded) return; // 아직 로드 중이면 대기

    // 로드가 끝났는데 region이 없으면 유효하지 않은 id로 판단하여 지역 선택으로 보냄
    if (!region) {
      const savedRegionId = localStorage.getItem("selectedRegionId");

      if (savedRegionId === id) {
        localStorage.removeItem("selectedRegionId");
      }

      if (savedRegionId && savedRegionId !== id && isRegionRegistered(savedRegionId)) {
        navigate(`/portal/region/${savedRegionId}`);
        return;
      }

      navigate("/region");
    }
  }, [regionsLoaded, region, navigate, id]);

  const goHome = () => {
    navigate("/home");
  };

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/region');
    }
  };

  // 현재 로그인된 회원의 가입 지역 (있으면 내지역으로 이동 버튼에 사용)
  const myRegionId = myMember ? (myMember.regionId || null) : null;

  // 비공개(등록되지 않음) 상태인 경우에도 포털을 보여주되, 상단에 안내 배너를 표시합니다.

  // 지역을 찾을 수 없는 경우 (useEffect에서 리다이렉트 처리 중)
  if (!region) {
    return (
      <div className="su-page su-page--region">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "50vh",
          }}
        >
          <div style={{ fontSize: 14, opacity: 0.6 }}>이동 중...</div>
        </div>
      </div>
    );
  }

  

  return (
    <div className="su-page su-page--region">
      <PageHeader title={region.name} onBack={goBack} action={{ label: "홈", onClick: goHome }} />

      {/* ★ PV3 완전 복원: 지역 공지사항 박스 (서버 DB 기반) */}
      <div style={{ marginTop: 8 }}>
        <div 
          className="su-card su-card--hero"
          style={{ cursor: regionNotices.length > 0 ? 'pointer' : 'default', marginBottom: 0 }}
          onClick={() => {
            if (regionNotices.length > 0) {
              navigate(`/portal/region/${id}/notices`);
            }
          }}
          role={regionNotices.length > 0 ? "button" : undefined}
          tabIndex={regionNotices.length > 0 ? 0 : undefined}
        >
          <div className="su-typo-h2" style={{ marginBottom: 8 }}>📌 {region.name} 지역 공지사항</div>
          {regionNotices.length === 0 ? (
            <div className="su-empty" style={{ padding: '4px 0' }}>이 지역의 공지가 없습니다.</div>
          ) : (
            regionNotices.slice(0, 1).map((notice) => (
              <div 
                key={notice.id} 
                style={{ padding: '8px 0', borderBottom: '1px solid var(--c-border)' }}
              >
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{notice.title}</div>
                <div className="su-typo-body" style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {notice.content || '-'}
                </div>
                <div className="su-typo-meta" style={{ marginTop: 6 }}>
                  {notice.author ? notice.author + ' · ' : ''}{notice.formattedDate}
                </div>
              </div>
            ))
          )}
          {regionNotices.length > 0 && (
            <div className="su-typo-meta" style={{ marginTop: 8, textAlign: 'right' }}>공지 {regionNotices.length}건 →</div>
          )}
        </div>
      </div>

      {/* 전체공지 박스 - 숨김 (지역 페이지에서는 지역 공지만 표시) */}
      {/* 
      <div style={{ marginTop: 8 }}>
        <div 
          style={{ 
            padding: 12, 
            borderRadius: 12, 
            background: '#F5F7FA', 
            border: '1px solid #DDE3EA',
            cursor: publicNotices.length > 0 ? 'pointer' : 'default'
          }}
          onClick={() => {
            if (publicNotices.length > 0) {
              navigate('/notices');
            }
          }}
          role={publicNotices.length > 0 ? "button" : undefined}
          tabIndex={publicNotices.length > 0 ? 0 : undefined}
        >
          <div style={{ fontWeight: 800, marginBottom: 8 }}>📢 전체공지</div>
          {publicNotices.length === 0 ? (
            <div style={{ color: '#9BA8AE' }}>전체 공지가 없습니다.</div>
          ) : (
            <div style={{ padding: '8px 0', borderBottom: '1px solid #EEF1F5' }}>
              <div style={{ fontWeight: 700 }}>{publicNotices[0].title}</div>
              <div style={{ fontSize: 13, color: '#637074', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {publicNotices[0].content || publicNotices[0].sub || 'Share Unity 지역공유발전플랫폼을 이용해주셔서 감사합니다.'}
              </div>
            </div>
          )}
        </div>
      </div>
      */}

      {/* ★ PV3 완전 복원: 지역 공지 상세 모달 */}
      {regionNoticeModalOpen && selectedRegionNotice && (
        <div 
          className="su-modal-overlay" 
          onClick={() => setRegionNoticeModalOpen(false)} 
          role="dialog" 
          aria-modal="true"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <div 
            className="su-modal-content" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              maxWidth: 720, 
              width: '94%', 
              maxHeight: 'min(80dvh, calc(100vh - 64px))', 
              display: 'flex', 
              flexDirection: 'column', 
              overflow: 'hidden',
              background: '#FFFFFF',
              borderRadius: 12,
              border: '1px solid #DDE3EA'
            }}
          >
            <button 
              type="button" 
              className="su-modal-close" 
              onClick={() => setRegionNoticeModalOpen(false)} 
              aria-label="닫기"
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'none',
                border: 'none',
                fontSize: 24,
                cursor: 'pointer',
                color: '#999',
                zIndex: 1
              }}
            >✕</button>
            <div 
              className="su-modal-body" 
              style={{ 
                padding: 18, 
                flex: 1, 
                overflowY: 'auto', 
                WebkitOverflowScrolling: 'touch', 
                touchAction: 'pan-y', 
                overscrollBehavior: 'contain', 
                paddingBottom: 80,
                color: '#0D1B21'
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 12 }}>
                {selectedRegionNotice.title || '공지'}
              </div>
              <div style={{ fontSize: 13, color: '#637074', marginBottom: 12 }}>
                {selectedRegionNotice.author || '관리자'} · {selectedRegionNotice.formattedDate}
              </div>
              <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.6, color: '#2C3E45' }}>
                {selectedRegionNotice.content || '-'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 비공개 지역인 경우 사용자 안내 및 빠른 이동 버튼 */}
      {!isRegistered && (
        <div className="su-alertBox su-alertBox--warn" style={{ marginTop: 12 }}>
          <div style={{ marginBottom: 8 }}>
            이 지역은 아직 공개 상태가 아닙니다 — 포털은 관리자에 의해 제한된 정보만 표시될 수 있습니다.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {myRegionId && myRegionId !== id && (
              <button
                type="button"
                className="su-secondaryBtn"
                style={{ marginTop: 0 }}
                onClick={() => navigate(`/portal/region/${myRegionId}`)}
              >
                내지역으로 이동
              </button>
            )}
            <button type="button" className="su-pill" onClick={goBack}>
              뒤로가기
            </button>
          </div>
        </div>
      )}
      {/* 지역 요약 */}
      <div className="su-regionSummary">
        <div className="su-regionSummary__location">
          {region.province} · {region.district}
        </div>
        <div className="su-regionSummary__meta">
          {[
            fmtRegion.households(region.households) ? `세대수 ${fmtRegion.households(region.households)}` : null,
            fmtRegion.price(region.avgPrice) ? `평균 ${fmtRegion.price(region.avgPrice)}억` : null,
            `미션 ${missions.length}개`,
            `상점 ${filteredStores.length}개`,
          ].filter(Boolean).join(' · ')}
        </div>
      </div>

      {/* 탭 및 전체 보기 토글 */}
      <div className="su-tabRow" style={{ marginTop: 10 }}>
        <button type="button" className={`su-chip${tab === "news" ? " is-active" : ""}`} onClick={() => setTab("news")}>
          지역소식
        </button>
        <button type="button" className={`su-chip${tab === "intro" ? " is-active" : ""}`} onClick={() => setTab("intro")}>
          지역소개
        </button>
        <button type="button" className={`su-chip${tab === "gallery" ? " is-active" : ""}`} onClick={() => setTab("gallery")}>
          갤러리
        </button>
      </div>

      {/* 컨텐츠 */}
      {(showAll || tab === "news") && (
        <section className="su-panel" style={{ marginTop: 12 }}>
          {/* 지역뉴스 바로가기 */}
          <button
            type="button"
            onClick={() => navigate(`/r/${id}/news`)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              background: "var(--c-primary-soft)",
              border: "1.5px solid var(--c-primary)",
              borderRadius: "var(--r-btn)",
              padding: "10px 14px",
              cursor: "pointer",
              marginBottom: 12,
              color: "var(--c-primary)",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            <span>📰 지역 뉴스 보기</span>
            <span style={{ fontSize: 12, opacity: 0.8 }}>→</span>
          </button>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>지역 소식</div>
          <div style={{ display: "grid", gap: 10 }}>
            {news.map((n) => {
                // participation key uses origType:id when available
                const itemKey = n.origType && n.origId ? `${n.origType}:${n.origId}` : n.id;
                const memberRegionIdLocal = myRegionId;
                const isAdminLocal = checkIsAdmin();
                const canJoin = n.orig ? canParticipate(n.orig, memberRegionIdLocal, isAdminLocal) : false;
                const memberId = (myMember && myMember.id) || null;
                // ★ FIX Issue #2: Use server-based participation state
                const already = regionParticipations ? regionParticipations.some(p => p.itemKey === itemKey && String(p.memberId) === String(memberId)) : false;

                return (
                  <div key={n.id} className="su-card" style={{ textAlign: "left", color: 'inherit' }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ fontWeight: 900 }}>{n.title}</div>
                      <div style={{ fontSize: 12, opacity: 0.85 }}>{n.time}</div>
                    </div>
                    <div style={{ marginTop: 6, fontSize: 14, opacity: 0.95, lineHeight: 1.6, color: 'inherit' }}>{n.sub || '내용이 없습니다.'}</div>
                    <div style={{ marginTop: 8, fontSize: 12, opacity: 0.85 }}>
                      <span className="su-badge su-badge--neutral">{n.tag}</span>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      {n.isNotice ? (
                        // 공지사항 클릭 시 상세 페이지로 이동
                        <button
                              type="button"
                              className="su-secondaryBtn"
                              style={{ width: '100%' }}
                              onClick={() => navigate(`/portal/region/${id}/notices/${n.origId}`)}
                            >
                              자세히 보기
                            </button>
                      ) : n.orig ? (
                        (n.orig && (n.orig.status === 'active' || !n.orig.status)) ? (
                          canJoin ? (
                            participationsLoading ? (
                              <button type="button" disabled style={{ width: '100%', padding: 10, borderRadius: 12, opacity: 0.5 }}>
                                불러오는 중…
                              </button>
                            ) : (
                            <button
                              type="button"
                              className="su-primaryBtn"
                              style={{ width: '100%' }}
                              onClick={async () => {
                                // ★ FIX Issue #2 & #4: Use server API POST and reload from DB
                                try {
                                  const memberId = myMember?.id || myMember?.memberId;
                                  if (!memberId) {
                                    window.alert('로그인이 필요합니다.');
                                    return;
                                  }
                                  await storageAdapter.addParticipation({
                                    itemKey,
                                    itemId: n.origId,
                                    itemType: n.origType,
                                    title: n.title,
                                    memberId,
                                    regionId: myRegionId
                                  });
                                  window.alert('참여가 완료되었습니다.');
                                  await loadParticipations(); // Reload from server
                                  window.dispatchEvent(new Event('su:ssot:changed')); // Notify other components
                                } catch (e) {
                                  console.error('[Region] Participation failed:', e);
                                  if (e.message?.includes('already')) {
                                    window.alert('이미 참여하셨습니다.');
                                  } else if (e.message?.includes('REGION_RESTRICTED')) {
                                    window.alert('이 미션/이벤트는 해당 지역 가입 회원만 참여할 수 있습니다.');
                                  } else {
                                    window.alert('참여 중 오류가 발생했습니다: ' + e.message);
                                  }
                                }
                              }}
                            >
                              {already ? '참여완료' : '참여하기'}
                            </button>
                            )
                          ) : (
                            <div>
                              <button type="button" className="su-pill" disabled style={{ width: '100%' }}>참여 불가</button>
                              {n.orig && (
                                <div style={{ fontSize: 11, color: 'var(--c-tx-s)', marginTop: 4, textAlign: 'center' }}>
                                  {getParticipationBlockedReason(n.orig, memberRegionIdLocal, true, n.orig?.regionName || null) || '이 지역 회원만 참여 가능합니다.'}
                                </div>
                              )}
                            </div>
                          )
                        ) : (
                          <button type="button" className="su-pill" disabled style={{ width: '100%' }}>종료됨</button>
                        )
                      ) : null}
                    </div>
                  </div>
                );
              })}
          </div>

          <button
            type="button"
            className="su-secondaryBtn"
            style={{ marginTop: 12, width: "100%" }}
            onClick={() => {
              // ★ 지역 소식 페이지로 이동 (미션/이벤트)
              if (!region || !region.id) {
                window.alert('지역 정보를 찾을 수 없습니다.');
                return;
              }
              navigate(`/regions/${region.id}/posts`);
            }}
          >
            더보기
          </button>
        </section>
      )}

      {(showAll || tab === "intro") && (
        <section className="su-panel" style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>지역 소개</div>
          <div className="su-card">
            <div style={{ fontWeight: 900 }}>{region.name}</div>
            <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85, lineHeight: 1.5 }}>
              {region.province} {region.district}에 위치한 지역입니다.
              {(() => {
                const hh = fmtRegion.households(region.households);
                const pr = fmtRegion.price(region.avgPrice);
                const parts = [
                  hh ? `세대수 약 ${hh} 세대` : null,
                  pr ? `평균 아파트 가격 ${pr}억원` : null,
                ].filter(Boolean);
                return parts.length > 0 ? <><br />{parts.join(', ')}</> : null;
              })()}
            </div>
          </div>

          <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
            {/* 교통 정보 */}
            {region.transports && region.transports.length > 0 && (
              <div className="su-card">
                <div style={{ fontWeight: 900 }}>🚇 교통</div>
                <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>
                  {region.transports.join(" · ")}
                </div>
              </div>
            )}

            {/* 대표 아파트 */}
            {region.complexes && region.complexes.length > 0 && (
              <div className="su-card">
                <div style={{ fontWeight: 900 }}>🏢 대표 아파트</div>
                <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>
                  {region.complexes.slice(0, 3).join(" · ")}
                </div>
              </div>
            )}

            {/* 상점 정보 */}
            <div className="su-card">
              <div style={{ fontWeight: 900 }}>🏪 주변 상점 {filteredStores.length}개</div>
              <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>
                {filteredStores.length > 0 ? `${region.name} 지역에 등록된 상점` : '등록된 상점이 없습니다'}
              </div>
              {filteredStores.slice(0, 3).map((store) => (
                <div key={store.id} style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                  • {store.name} ({store.category})
                </div>
              ))}
              {filteredStores.length > 0 && (
                <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                  <button type="button" className="su-secondaryBtn" style={{ marginTop: 0 }} onClick={() => {
                    // 상점 보기는 현재 보고 있는 지역의 상점 필터로 이동
                    navigate(`/shops?regionId=${id}`);
                  }}>
                    상점 보기
                  </button>
                  <button type="button" className="su-pill" onClick={() => window.open(`https://map.naver.com/v5/search/${encodeURIComponent((region.name || '') + ' 상점')}`, '_blank')}>
                    지도에서 보기
                  </button>
                </div>
              )}
            </div>

            {/* 미션/이벤트 */}
            <div
              className="su-card"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/r/${id}/missions`)}
            >
              <div style={{ fontWeight: 900 }}>🎯 미션 & 이벤트</div>
              <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>
                미션 {missions.length}개 · 이벤트 {events.length}개 진행중
              </div>
            </div>
          </div>
        </section>
      )}

      {(showAll || tab === "gallery") && (
        <section className="su-panel" style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 900, marginBottom: 10 }}>갤러리</div>
          <div style={{ display: "grid", gap: 10 }}>
            {gallery.map((g) => (
              <button key={g.id} type="button" className="su-card" style={{ textAlign: "left", width: '100%' }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ fontWeight: 900 }}>{g.title}</div>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>{g.badge}</div>
                </div>
                <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>{g.sub}</div>
                <div
                  style={{
                    marginTop: 10,
                    height: 110,
                    borderRadius: 12,
                    border: "1px dashed #DDE3EA",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0.7,
                    fontSize: 12,
                  }}
                >
                  이미지/썸네일 영역(추후)
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <div style={{ height: 90 }} />
    </div>
  );
}
