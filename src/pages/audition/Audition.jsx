import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getAuditions } from "../../lib/storageAdapter";
import { register, unregister } from "../../lib/ssotRegistry";
import { getViewerRegionId } from "../../lib/viewerRegionStore";
import { getCurrentUser } from "../../lib/authStore";
import { getAuditionScheduleStatus } from "../../lib/auditionSchedule";

// ★ 회원 가입 지역 ID (내 지역 필터용)
function getMemberRegionId() {
  // 1) 메모리 세션 우선 (SSOT)
  const user = getCurrentUser();
  if (user?.regionId) return user.regionId;
  // 2) localStorage 폴백
  try {
    const authStr = localStorage.getItem('su_auth_v2');
    if (authStr) {
      const auth = JSON.parse(authStr);
      return auth.regionId || null;
    }
  } catch (e) {}
  return null;
}
import PageHeader from "../../components/PageHeader";

function getSectionTone(kind) {
  if (kind === "closed") {
    return {
      icon: "◌",
      title: "종료된 오디션",
      panelStyle: {
        padding: 14,
        borderRadius: 22,
        background: "linear-gradient(180deg, rgba(248,250,252,0.96) 0%, rgba(241,245,249,0.95) 100%)",
        border: "1px solid rgba(148,163,184,0.22)",
        boxShadow: "0 14px 32px rgba(148,163,184,0.10)",
      },
      headerStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 12,
      },
      titleWrapStyle: { display: "flex", alignItems: "center", gap: 10 },
      iconStyle: {
        width: 30,
        height: 30,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
        background: "rgba(148,163,184,0.16)",
        color: "#475569",
        fontWeight: 900,
        fontSize: 14,
      },
      titleStyle: { fontSize: 17, fontWeight: 900, color: "#334155", letterSpacing: "-0.03em" },
      subtitleStyle: { fontSize: 12, color: "#64748b", fontWeight: 700 },
      countBadgeStyle: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 52,
        height: 30,
        padding: "0 10px",
        borderRadius: 999,
        background: "rgba(148,163,184,0.16)",
        border: "1px solid rgba(148,163,184,0.26)",
        color: "#475569",
        fontSize: 12,
        fontWeight: 900,
        whiteSpace: "nowrap",
        flexShrink: 0,
      },
    };
  }

  return {
    icon: "●",
    title: "진행중 오디션",
    panelStyle: {
      padding: 14,
      borderRadius: 22,
      background: "linear-gradient(180deg, rgba(240,253,250,0.96) 0%, rgba(236,253,245,0.92) 100%)",
      border: "1px solid rgba(16,185,129,0.20)",
      boxShadow: "0 18px 40px rgba(12,84,96,0.11)",
    },
    headerStyle: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 12,
    },
    titleWrapStyle: { display: "flex", alignItems: "center", gap: 10 },
    iconStyle: {
    width: 30,
    height: 30,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 999,
      background: "rgba(13,148,136,0.14)",
      color: "#0f766e",
      fontWeight: 900,
      fontSize: 16,
      boxShadow: "0 0 0 6px rgba(20,184,166,0.08)",
    },
    titleStyle: { fontSize: 17, fontWeight: 900, color: "#0f766e", letterSpacing: "-0.03em" },
      subtitleStyle: { fontSize: 12, color: "#0f766e", fontWeight: 700 },
      countBadgeStyle: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 52,
        height: 30,
        padding: "0 10px",
        borderRadius: 999,
        background: "rgba(15,118,110,0.12)",
        border: "1px solid rgba(15,118,110,0.22)",
        color: "#0f766e",
        fontSize: 12,
        fontWeight: 900,
        whiteSpace: "nowrap",
        flexShrink: 0,
      },
  };
}

// ✨ ADD: 오디션 Row 컴포넌트 (공지사항 형태)
function AuditionRow({ audition, onClick, variant = "active" }) {
  // ✨ ADD: 안전한 폴백 처리
  const title = audition.title || "제목 없음";
  const status = audition.status || "OPEN";
  const type = audition.type || "FREE";
  const published = audition.published !== undefined ? audition.published : true;
  const regionName = audition.regionName || "지역 미지정";
  const description = audition.description || "";
  const scheduleStatus = getAuditionScheduleStatus(audition);
  
  // ✨ ADD: 날짜 포맷팅
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    } catch {
      return null;
    }
  };
  
  const startDate = formatDate(audition.startAt);
  const endDate = formatDate(audition.endAt);
  const deadline = formatDate(audition.deadline);
  
  let periodText = "";
  if (startDate && endDate) {
    periodText = `${startDate} ~ ${endDate}`;
  } else if (deadline) {
    periodText = `마감: ${deadline}`;
  } else {
    periodText = "기간 미지정";
  }
  
  // ✨ ADD: 상태 표시 (NOTICE 타입에서 published 체크)
  let statusBadge = "";
  let statusColor = "#10b981";
  let stageLabel = "접수중";
  const effectiveScheduleStatus = variant === "closed" ? "closed" : scheduleStatus;
  
  if (effectiveScheduleStatus === "draft" || (type === "NOTICE" && !published)) {
    statusBadge = "준비중";
    statusColor = "#6b7280";
    stageLabel = "준비";
  } else if (effectiveScheduleStatus === "upcoming") {
    statusBadge = "예정";
    statusColor = "#3b82f6";
    stageLabel = "오픈예정";
  } else if (effectiveScheduleStatus === "closed" || status === "CLOSED") {
    statusBadge = "종료";
    statusColor = "#94a3b8";
    stageLabel = "결과확인";
  } else if (effectiveScheduleStatus === "active") {
    statusBadge = "진행중";
    statusColor = "#10b981";
    stageLabel = "접수중";
  } else {
    statusBadge = status;
    statusColor = "#6b7280";
    stageLabel = "확인";
  }

  const isClosedCard = variant === "closed" || scheduleStatus === "closed";
  const ctaLabel = isClosedCard ? "결과 보기" : (effectiveScheduleStatus === "upcoming" ? "일정 보기" : "선택");
  const isMobile = (typeof window !== 'undefined') ? window.innerWidth <= 420 : false;
  const middleFr = isMobile ? '3fr' : '2fr';
  const cardStyle = isClosedCard
    ? {
        display: "grid",
        gridTemplateColumns: `4px ${middleFr} auto`,
        marginBottom: 12,
        overflow: "hidden",
        border: "1px solid rgba(148,163,184,0.18)",
        borderRadius: 18,
        background: "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(248,250,252,0.96) 100%)",
        boxShadow: "0 10px 24px rgba(148,163,184,0.10)",
        opacity: 0.96,
      }
    : {
      display: "grid",
      gridTemplateColumns: `4px ${middleFr} auto`,
        marginBottom: 12,
        overflow: "hidden",
        border: "1px solid rgba(13,148,136,0.16)",
        borderRadius: 18,
        background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,255,253,0.97) 100%)",
        boxShadow: "0 14px 30px rgba(12,84,96,0.10)",
      };

  const buttonStyle = isClosedCard
    ? {
        alignSelf: "center",
        marginRight: 14,
        minWidth: 88,
        minHeight: 38,
        borderRadius: 999,
        border: "1px solid rgba(148,163,184,0.26)",
        background: "rgba(148,163,184,0.12)",
        color: "#475569",
        fontWeight: 800,
        fontSize: 13,
        letterSpacing: "-0.02em",
      }
    : {
        alignSelf: "center",
        marginRight: 14,
        minWidth: 88,
        minHeight: 38,
        borderRadius: 999,
        border: "1px solid rgba(20,184,166,0.28)",
        background: "linear-gradient(180deg, rgba(45,212,191,0.18) 0%, rgba(20,184,166,0.10) 100%)",
        color: "#0f766e",
        fontWeight: 800,
        fontSize: 13,
        letterSpacing: "-0.02em",
      };

  const cardMetaStyle = isClosedCard
    ? { fontSize: "13px", color: "#64748b", marginBottom: "10px", display: "flex", flexDirection: "column", gap: "4px" }
    : { fontSize: "13px", color: "var(--c-tx-s)", marginBottom: "10px", display: "flex", flexDirection: "column", gap: "4px" };

  const descriptionStyle = isClosedCard
    ? { margin: 0, fontSize: "13px", color: "#64748b", lineHeight: "1.55", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }
    : { margin: 0, fontSize: "13px", color: "var(--c-tx-s)", lineHeight: "1.55", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
  
  // ✅ UPDATE: 다크 row 카드 스타일 → su-card CSS 클래스 사용
  return (
    <div
      onClick={onClick}
      className="su-card"
      style={cardStyle}
    >
      <div style={{ background: isClosedCard ? "linear-gradient(180deg,#94a3b8,#64748b)" : "linear-gradient(180deg,#14b8a6,#0f766e)" }} />
      {/* ✅ UPDATE: 왼쪽 영역 - 오디션 정보 */}
      <div style={{ flex: 1, minWidth: 0, padding: "14px 14px 13px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              height: 24,
              padding: "0 10px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.01em",
              background: isClosedCard ? "rgba(148,163,184,0.18)" : "rgba(13,148,136,0.14)",
              color: isClosedCard ? "#475569" : "#0f766e",
            }}
          >
            {stageLabel}
          </span>
        </div>
        <div style={{ marginBottom: "8px" }}>
          {/** 접수중(stageLabel === '접수중')인 경우 제목 크기를 절반으로 줄임 (다른 스타일 변경 없음) */}
          {(() => {
            const isReceiving = String(stageLabel || '').trim() === '접수중';
            const titleFontSize = isReceiving ? '17px' : 'clamp(18px, 5.1vw, 24px)';
            // 첫 줄은 최대 10자만 보여주고, 두번째 줄은 나머지를 자연스럽게 노출
            const firstPart = String(title || '').slice(0, 10);
            const restPart = String(title || '').length > 10 ? String(title).slice(10) : '';
            return (
              <h3
                style={{
                  margin: 0,
                  fontSize: titleFontSize,
                  fontWeight: "900",
                  color: "var(--c-tx-h)",
                  letterSpacing: "-0.04em",
                  lineHeight: 1.18,
                  wordBreak: "keep-all",
                }}
                title={title}
              >
                <span style={{ display: 'inline-block', width: '100%', whiteSpace: 'nowrap' }}>{firstPart}</span>
                {restPart ? (
                  <>
                    <br />
                    <span style={{ display: 'inline-block', width: '100%', whiteSpace: 'normal' }}>{restPart}</span>
                  </>
                ) : null}
              </h3>
            );
          })()}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
          <span className={`su-badge ${effectiveScheduleStatus === 'closed' ? 'su-badge--closed' : 'su-badge--open'}`} style={{ backgroundColor: `${statusColor}18`, color: statusColor, borderColor: `${statusColor}33` }}>
            {statusBadge}
          </span>
          {type === "NOTICE" && (
            <span className="su-badge su-badge--primary">공지형</span>
          )}
        </div>
        
        <div style={cardMetaStyle}>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ fontSize: "14px" }}>📍</span>
            {regionName}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ fontSize: "14px" }}>📅</span>
            {periodText}
          </span>
        </div>
        
        {description && (
          <p style={descriptionStyle}>
            {description.substring(0, 120)}{description.length > 120 ? "..." : ""}
          </p>
        )}
      </div>
      
      {/* ✅ UPDATE: 오른쪽 영역 - 선택 버튼 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        style={buttonStyle}
      >
        {ctaLabel}
      </button>
    </div>
  );
}

export default function Audition() {
  const navigate = useNavigate();
  const viewerRegionId = getViewerRegionId(); // 탐색 지역 (tab 표시 여부에만 사용)
  // ★ 내 지역 필터: 탐색 지역이 아닌 회원 가입 지역 기준
  const memberRegionId = getMemberRegionId();

  const [auditions, setAuditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regionFilter, setRegionFilter] = useState('all'); // 'all' | 'mine'
  const [showAllOngoing, setShowAllOngoing] = useState(false);
  const [showAllEnded, setShowAllEnded] = useState(false);
  const ongoingAuditions = useMemo(() => auditions.filter((item) => getAuditionScheduleStatus(item) !== 'closed'), [auditions]);
  const endedAuditions = useMemo(() => auditions.filter((item) => getAuditionScheduleStatus(item) === 'closed'), [auditions]);
  const visibleOngoingAuditions = useMemo(() => (showAllOngoing ? ongoingAuditions : ongoingAuditions.slice(0, 5)), [ongoingAuditions, showAllOngoing]);
  const visibleEndedAuditions = useMemo(() => (showAllEnded ? endedAuditions : endedAuditions.slice(0, 5)), [endedAuditions, showAllEnded]);
  const activeTone = useMemo(() => getSectionTone("active"), []);
  const closedTone = useMemo(() => getSectionTone("closed"), []);

  useEffect(() => {
    loadAuditions(regionFilter);
    const id = register(['auditions'], () => {
      try { loadAuditions(regionFilter); } catch (e) { console.error('[Audition] ssot reload failed', e); }
    });
    return () => unregister(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionFilter]);

  async function loadAuditions(filter = 'all') {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (filter === 'mine' && memberRegionId) {
        // 탐색 지역이 아닌 가입 지역으로 필터
        params.regionId = memberRegionId;
      }
      const data = await getAuditions(params);
      console.log('[Audition] Loaded auditions:', data?.length || 0, { filter, memberRegionId });
      setAuditions(data);
    } catch (err) {
      console.error('Failed to load auditions:', err);
      setError('오디션을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="su-page su-page--audition">
      <PageHeader title="🎙️ 오디션 공지" onBack={() => navigate('/home')} />

      <section className="su-panel" style={{ marginTop: 12, marginBottom: 12, padding: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--c-tx-h)', marginBottom: 8 }}>🎤 오디션 안내</div>
        <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--c-tx-s)' }}>
          오디션 결과는 투표와 심사위원 평가를 종합하여 결정됩니다.<br />
          진행 중 순위는 투표 수 기준으로 표시되며,<br />
          최종 순위는 종료 후 심사를 통해 확정됩니다.
        </div>
      </section>

      {/* 지역 필터 탭 — 내 지역 필터: 지역 포탈 방문 및 로그인 회원에게 표시 */}
      {(viewerRegionId || memberRegionId) && (
        <div className="su-tabRow" style={{ padding: '0 16px', marginBottom: 4 }}>
          <button
            type="button"
            className={`su-chip${regionFilter === 'all' ? ' is-active' : ''}`}
            onClick={() => setRegionFilter('all')}
          >
            전체
          </button>
          <button
            type="button"
            className={`su-chip${regionFilter === 'mine' ? ' is-active' : ''}`}
            onClick={() => setRegionFilter('mine')}
          >
            내 지역
          </button>
        </div>
      )}

      <section className="su-panel">
        {/* 로딩 상태 */}
        {loading && <div className="su-empty">로딩 중...</div>}

        {/* 에러 상태 */}
        {error && <div className="su-empty" style={{ color: 'var(--c-danger, #DC2626)' }}>{error}</div>}

        {/* 빈 상태 */}
        {!loading && !error && auditions.length === 0 && (
          <div className="su-empty">
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📢</div>
            <div>{regionFilter === 'mine' ? '내 지역 오디션이 없습니다.' : '오디션이 없습니다.'}</div>
          </div>
        )}

        {/* 오디션 목록 */}
        {!loading && !error && auditions.length > 0 && (
          <div>
            <div style={{ ...activeTone.panelStyle, marginBottom: 22 }}>
              <div style={activeTone.headerStyle}>
                <div style={activeTone.titleWrapStyle}>
                  <span style={activeTone.iconStyle}>{activeTone.icon}</span>
                  <div>
                    <div style={activeTone.titleStyle}>{activeTone.title}</div>
                    <div style={activeTone.subtitleStyle}>지금 참여 가능한 오디션을 먼저 확인하세요.</div>
                  </div>
                </div>
                <div style={activeTone.countBadgeStyle}>{ongoingAuditions.length}건</div>
              </div>
              {ongoingAuditions.length > 0 ? visibleOngoingAuditions.map((audition) => (
                <AuditionRow
                  key={`ongoing-${audition.auditionId || audition.id}`}
                  audition={audition}
                  variant="active"
                  onClick={() => navigate(`/audition/${audition.auditionId || audition.id}`)}
                />
              )) : (
                <div className="su-empty" style={{ marginBottom: 12 }}>진행중인 오디션이 없습니다.</div>
              )}
              {ongoingAuditions.length > 5 ? (
                <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
                  <button
                    type="button"
                    className="su-chip"
                    onClick={() => setShowAllOngoing((prev) => !prev)}
                    style={{
                      minHeight: 34,
                      padding: "0 14px",
                      borderRadius: 999,
                      border: "1px solid rgba(15,118,110,0.28)",
                      background: "rgba(15,118,110,0.08)",
                      color: "#0f766e",
                      fontWeight: 800,
                      fontSize: 12,
                    }}
                  >
                    {showAllOngoing ? "접기" : `더보기 (${ongoingAuditions.length - 5})`}
                  </button>
                </div>
              ) : null}
            </div>

            <div style={closedTone.panelStyle}>
              <div style={closedTone.headerStyle}>
                <div style={closedTone.titleWrapStyle}>
                  <span style={closedTone.iconStyle}>{closedTone.icon}</span>
                  <div>
                    <div style={closedTone.titleStyle}>{closedTone.title}</div>
                    <div style={closedTone.subtitleStyle}>결과와 기록을 확인할 수 있는 종료된 항목입니다.</div>
                  </div>
                </div>
                <div style={closedTone.countBadgeStyle}>{endedAuditions.length}건</div>
              </div>
              {endedAuditions.length > 0 ? visibleEndedAuditions.map((audition) => (
                <AuditionRow
                  key={`ended-${audition.auditionId || audition.id}`}
                  audition={audition}
                  variant="closed"
                  onClick={() => navigate(`/audition/${audition.auditionId || audition.id}`)}
                />
              )) : (
                <div className="su-empty">종료된 오디션이 없습니다.</div>
              )}
              {endedAuditions.length > 5 ? (
                <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
                  <button
                    type="button"
                    className="su-chip"
                    onClick={() => setShowAllEnded((prev) => !prev)}
                    style={{
                      minHeight: 34,
                      padding: "0 14px",
                      borderRadius: 999,
                      border: "1px solid rgba(100,116,139,0.30)",
                      background: "rgba(148,163,184,0.10)",
                      color: "#475569",
                      fontWeight: 800,
                      fontSize: 12,
                    }}
                  >
                    {showAllEnded ? "접기" : `더보기 (${endedAuditions.length - 5})`}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
