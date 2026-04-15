/**
 * RegionHub — 지역 허브 홈 (v3, 프리미엄 정보 중심)
 *
 * Visual Rhythm:
 * Hero + CTA (미션참여/오디션/지역 상점)
 * → 공지사항 → 지역방송 → 지역뉴스 → ✨ 하이라이트(오디션/미션/방송 하이브리드)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useRegion } from '../context/RegionContext';
import VideoEmbed from '../components/VideoEmbed';
import { isDirectVideoUrl, parseYouTubeId } from '../lib/videoUtils';
import useAutoRefresh from '../hooks/useAutoRefresh';
import { getRegionById } from '../data/regions.seed';

function resolveNoticeImageUrl(imageUrl) {
  const raw = String(imageUrl || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw) || raw.startsWith('data:')) return raw;
  const base = import.meta.env.VITE_API_BASE || '';
  return `${base}${raw}`;
}

// 날씨 위젯 컴포넌트
function WeatherWidget({ lat, lon, regionName }) {
  const [weather, setWeather] = useState(null);
  useEffect(() => {
    if (!lat || !lon) return;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
      .then(r => r.ok ? r.json() : null)
      .then(data => setWeather(data?.current_weather || null))
      .catch(() => setWeather(null));
  }, [lat, lon]);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#fff', marginBottom: 6 }}>
      <span style={{ fontSize: 17 }}>🌤️</span>
      <span>{regionName || '서울'} 날씨</span>
      {weather ? <span>{weather.temperature}°C</span> : <span style={{ opacity: 0.6 }}>-</span>}
    </div>
  );
}

export default function RegionHub() {
  const { regionId } = useRegion();
  // 지역 좌표 매핑
  let lat = 37.5665, lon = 126.9780, regionLabel = '서울'; // 기본값: 서울
  if (regionId) {
    const region = getRegionById(regionId);
    if (region && region.lat && region.lon) {
      lat = region.lat;
      lon = region.lon;
      regionLabel = region.name || regionLabel;
    }
  }
  const navigate = useNavigate();
  const outletCtx = useOutletContext() || {};
  const selectedDistrictId = outletCtx.selectedDistrictId || '';
  const regionName = outletCtx.regionName || '';

  const [notices,    setNotices]    = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [regionNews, setRegionNews] = useState([]);
  const [highlights, setHighlights] = useState([]); // 오디션+미션+방송 혼합
  const [stats,      setStats]      = useState({ activeCount: 0 });
  const [loading,    setLoading]    = useState(true);
  const hasLoadedRef = useRef(false);

  const loadAll = useCallback(async ({ background = false } = {}) => {
    if (!regionId) return;
    if (!background || !hasLoadedRef.current) {
      setLoading(true);
    }
    try {
      const BASE = import.meta.env.VITE_API_BASE || '';
      const dParam = selectedDistrictId ? `&districtId=${selectedDistrictId}` : '';

      const [noticeRes, broadcastRes, newsRes, missionRes, auditionRes, statsRes] =
        await Promise.allSettled([
          fetch(`${BASE}/api/notices?region_id=${regionId}&status=ACTIVE&scope=REGION${dParam}`, { credentials: 'include' })
            .then(r => r.ok ? r.json() : []),
          fetch(`${BASE}/api/broadcasts?region=${regionId}&limit=4`, { credentials: 'include' })
            .then(r => r.ok ? r.json() : { broadcasts: [] }),
          fetch(`${BASE}/api/regions/${regionId}/news?limit=5`, { credentials: 'include' })
            .then(r => r.ok ? r.json() : { news: [] }).catch(() => ({ news: [] })),
          fetch(`${BASE}/api/missions?regionId=${regionId}&status=ACTIVE${dParam}&limit=4`, { credentials: 'include' })
            .then(r => r.ok ? r.json() : { missions: [] }),
          fetch(`${BASE}/api/auditions?regionId=${regionId}&limit=4`, { credentials: 'include' })
            .then(r => r.ok ? r.json() : { auditions: [] }).catch(() => ({ auditions: [] })),
          fetch(`${BASE}/api/regions/${regionId}/stats`, { credentials: 'include' })
            .then(r => r.ok ? r.json() : null).catch(() => null),
        ]);

      if (noticeRes.status === 'fulfilled') {
        const d = noticeRes.value;
        setNotices(Array.isArray(d) ? d.slice(0, 4) : (d.notices || []).slice(0, 4));
      }
      if (broadcastRes.status === 'fulfilled') {
        const d = broadcastRes.value;
        setBroadcasts((d.broadcasts || []).slice(0, 4));
      }
      if (newsRes.status === 'fulfilled') {
        const d = newsRes.value;
        setRegionNews((d.news || d.regionNews || []).slice(0, 5));
      }

      // 하이라이트: 오디션 + 미션 + 라이브방송 혼합
      const hlItems = [];
      if (missionRes.status === 'fulfilled') {
        const ms = (missionRes.value.missions || []).slice(0, 3);
        ms.forEach(m => hlItems.push({ ...m, type: 'mission' }));
      }
      if (auditionRes.status === 'fulfilled') {
        const rawAuditions = Array.isArray(auditionRes.value)
          ? auditionRes.value
          : (auditionRes.value?.auditions || auditionRes.value?.items || []);
        const as = rawAuditions.slice(0, 3);
        as.forEach(a => hlItems.push({ ...a, type: 'audition' }));
      }
      if (broadcastRes.status === 'fulfilled') {
        const ls = (broadcastRes.value.broadcasts || []).filter(b => b.isLive).slice(0, 2);
        ls.forEach(b => hlItems.push({ ...b, type: 'broadcast' }));
      }
      // 최신순 정렬
      hlItems.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setHighlights(hlItems.slice(0, 6));

      if (statsRes.status === 'fulfilled' && statsRes.value) {
        setStats(s => ({ ...s, ...statsRes.value }));
      }
      hasLoadedRef.current = true;
    } catch (e) {
      console.error('[RegionHub] load error:', e);
    } finally {
      if (!background || !hasLoadedRef.current) {
        setLoading(false);
      }
    }
  }, [regionId, selectedDistrictId]);

  useEffect(() => { loadAll(); }, [loadAll]);
  useAutoRefresh(() => loadAll({ background: true }), { enabled: !!regionId, intervalMs: 60000 });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: '#9BA8AE', fontSize: 14 }}>
        로딩 중...
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--c-bg, #F5F8FA)', minHeight: 'calc(100vh - 120px)', paddingBottom: 40 }}>

      {/* ══════ HERO ══════ */}
      <div style={{
        background: 'linear-gradient(135deg, #0e6f84 0%, #13788d 56%, #2495ac 100%)',
        padding: '10px 12px 12px',
        color: '#fff',
        margin: '10px 14px 0',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 12px rgba(14,116,144,0.08)',
      }}>
        <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.56, marginBottom: 1, letterSpacing: 0.24 }}>
          📍 지역 포탈
        </div>
        <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.4px', marginBottom: 1, lineHeight: 1.14 }}>
          {regionName || '내 지역'}
        </div>
        {/* 날씨 위젯 */}
        <WeatherWidget lat={lat} lon={lon} regionName={regionLabel} />
        <div style={{ fontSize: 11, opacity: 0.62, marginBottom: 8, lineHeight: 1.24 }}>
          {stats.activeCount > 0
            ? `오늘 참여 가능한 활동 ${stats.activeCount}개`
            : '지금 지역 활동을 시작해보세요'}
        </div>

        {/* Quick CTA — 2열 진입 메뉴 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 6 }}>
          {[
            { icon: '🎯', label: '미션/이벤트', path: `/r/${regionId}/missions` },
            { icon: '🎤', label: '오디션',   path: `/r/${regionId}/auditions` },
            { icon: '🏪', label: '상권/상점', path: `/r/${regionId}/shops` },
            { icon: '🏢', label: '아파트',   path: `/r/${regionId}/apt` },
            { icon: '📰', label: '전단',     path: `/r/${regionId}/flyers` },
            { icon: '💬', label: '지역채팅', path: `/r/${regionId}/chat`, bg: 'rgba(166,114,255,0.22)', border: '1px solid rgba(216,191,255,0.52)' },
          ].map(btn => (
            <button
              key={btn.label}
              onClick={() => navigate(btn.path)}
              style={{
                background: btn.bg || 'rgba(255,255,255,0.14)',
                border: btn.border || '1px solid rgba(255,255,255,0.22)',
                borderRadius: 10,
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                padding: '5px 4px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                minHeight: 38,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
                width: '100%',
              }}
            >
              <span style={{ fontSize: 12, lineHeight: 1 }}>{btn.icon}</span>
              <span style={{ lineHeight: 1.1, whiteSpace: 'nowrap' }}>{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 14px', maxWidth: 640, margin: '0 auto' }}>

        {/* ══════ 1. 공지사항 ══════ */}
        <section style={{ marginTop: 20, marginBottom: 20 }}>
          <SectionHead
            icon="📋"
            title="공지사항"
            onMore={() => navigate(`/r/${regionId}/notices`)}
          />
          {notices.length === 0 ? (
            <EmptyCard icon="📋" title="공지사항이 없습니다" desc="" />
          ) : (
            <div style={{
              background: '#fff', borderRadius: 16,
              border: '1px solid var(--c-border, rgba(15,23,42,0.08))',
              overflow: 'hidden', boxShadow: '0 4px 12px rgba(14,116,144,0.06)',
            }}>
              {notices.map((n, idx) => {
                const noticeImageUrl = resolveNoticeImageUrl(n.imageUrl || n.image_url);
                return (
                <div
                  key={n.id}
                  onClick={() => navigate(`/r/${regionId}/notices`)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2,
                    padding: '12px 16px',
                    borderBottom: idx < notices.length - 1 ? '1px solid rgba(15,23,42,0.06)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  {noticeImageUrl ? (
                    <div style={{ width: '100%', marginBottom: 10, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(15,23,42,0.08)', background: '#e2e8f0' }}>
                      <img src={noticeImageUrl} alt={n.title || '공지 이미지'} style={{ display: 'block', width: '100%', maxHeight: 180, objectFit: 'cover' }} />
                    </div>
                  ) : null}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: n.content && n.content.trim() ? 2 : 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0ea5e9' }}>공지제목</span>
                    <span style={{
                      fontSize: 14, fontWeight: 600, color: '#0F172A', lineHeight: 1.5,
                      wordBreak: 'break-all', whiteSpace: 'pre-line', width: '100%',
                    }}>{n.title}</span>
                  </div>
                  {n.content && n.content.trim() && (
                    <div style={{
                      marginTop: 2,
                      fontSize: 13,
                      color: '#64748B',
                      lineHeight: 1.6,
                      wordBreak: 'break-all',
                      whiteSpace: 'pre-line',
                      width: '100%',
                      display: 'flex', alignItems: 'flex-start', gap: 6,
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#0E7490', marginTop: 2 }}>공지내용</span>
                      <span>{n.content.length > 120 ? n.content.slice(0, 120) + '...' : n.content}</span>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ══════ 2. 지역방송 ══════ */}
        <section style={{ marginBottom: 20 }}>
          <SectionHead
            icon="📡"
            title="지역 방송"
            onMore={() => navigate(`/r/${regionId}/broadcasts`)}
          />
          {broadcasts.length === 0 ? (
            <EmptyCard icon="📡" title="진행 중인 방송이 없습니다" desc="곧 표시됩니다" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {broadcasts.map(b => (
                <BroadcastCard
                  key={b.broadcastId || b.id}
                  broadcast={b}
                  onClick={() => navigate(`/r/${regionId}/broadcasts`)}
                />
              ))}
            </div>
          )}
        </section>

        {/* ══════ 3. 지역뉴스 ══════ */}
        <section style={{ marginBottom: 20 }}>
          <SectionHead
            icon="📰"
            title="지역 뉴스"
            onMore={() => navigate(`/r/${regionId}/news`)}
          />
          {regionNews.length === 0 ? (
            <EmptyCard icon="📰" title="등록된 뉴스가 없습니다" desc="업데이트 대기 중" />
          ) : (
            <div style={{
              background: '#fff', borderRadius: 16,
              border: '1px solid var(--c-border, rgba(15,23,42,0.08))',
              overflow: 'hidden', boxShadow: '0 4px 12px rgba(14,116,144,0.06)',
            }}>
              {regionNews.map((n, idx) => (
                <div
                  key={n.id || n.newsId || idx}
                  onClick={() => n.url ? window.open(n.url, '_blank') : navigate(`/r/${regionId}/news`)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '13px 16px',
                    borderBottom: idx < regionNews.length - 1 ? '1px solid rgba(15,23,42,0.06)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 14, fontWeight: 600, color: '#0F172A', lineHeight: 1.4, marginBottom: 3,
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>{n.title}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8', display: 'flex', gap: 8 }}>
                      {n.source && <span>{n.source}</span>}
                      {n.publishedAt || n.createdAt
                        ? <span>{new Date(n.publishedAt || n.createdAt).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}</span>
                        : null}
                    </div>
                  </div>
                  {n.imageUrl && (
                    <div style={{
                      width: 60, height: 60, borderRadius: 10, flexShrink: 0,
                      background: `url(${n.imageUrl}) center/cover`,
                    }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ══════ 4. ✨ 하이라이트 — 오디션/미션/방송 하이브리드 ══════ */}
        <section style={{ marginBottom: 8 }}>
          <SectionHead icon="✨" title="지금 뜨는 활동" />
          {highlights.length === 0 ? (
            <EmptyCard icon="✨" title="활동을 준비 중입니다" desc="곧 시작됩니다" />
          ) : (
            <div style={{
              display: 'flex', gap: 12, overflowX: 'auto',
              paddingBottom: 8, scrollbarWidth: 'none', msOverflowStyle: 'none',
            }}>
              {highlights.map((item, idx) => (
                <HighlightCard
                  key={`hl-${item.type}-${item.id || item.missionId || item.auditionId || item.broadcastId || idx}`}
                  item={item}
                  onClick={() => {
                    const itemType = String(item.type || '').trim().toLowerCase();
                    if (itemType === 'mission') {
                      const missionId = item.id || item.missionId || item.mission_id || null;
                      if (missionId) {
                        navigate(`/r/${regionId}/missions`, {
                          state: {
                            scrollTo: 'mission',
                            highlightType: 'mission',
                            highlightId: String(missionId),
                          },
                        });
                        return;
                      }
                      navigate(`/r/${regionId}/missions`, { state: { scrollTo: 'mission' } });
                      return;
                    }
                    if (itemType === 'audition') {
                      const auditionId = item.id || item.auditionId || item.audition_id || null;
                      if (auditionId) {
                        navigate(`/audition/${auditionId}`);
                        return;
                      }
                      navigate(`/r/${regionId}/auditions`);
                      return;
                    }
                    if (itemType === 'broadcast') {
                      const broadcastId = item.id || item.broadcastId || item.broadcast_id || null;
                      if (broadcastId) {
                        navigate(`/broadcast/${broadcastId}`, {
                          state: {
                            videoUrl: item.videoUrl || item.mediaUrl || item.media_url || '',
                            title: item.title || '지역 방송',
                          },
                        });
                        return;
                      }
                      navigate(`/r/${regionId}/broadcasts`);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

/* ─── 공용 스타일 ──────────────────────────── */

const ctaBtnStyle = {
  background: 'var(--c-primary, #0E7490)',
  color: '#fff',
  border: 'none',
  borderRadius: 999,
  padding: '8px 18px',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

/* ─── 서브 컴포넌트 ────────────────────────── */

function SectionHead({ icon, title, onMore, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <span style={{ fontWeight: 700, fontSize: 15, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 6 }}>
        {icon && <span>{icon}</span>}
        {title}
      </span>
      <div style={{ display: 'flex', gap: 6 }}>
        {action && (
          <button onClick={action.onClick} style={{
            fontSize: 12, color: '#fff', fontWeight: 700,
            background: 'var(--c-primary, #0E7490)',
            border: 'none', borderRadius: 999, cursor: 'pointer', padding: '5px 12px', minHeight: 28,
          }}>
            {action.label}
          </button>
        )}
        {onMore && (
          <button onClick={onMore} style={{
            fontSize: 12, color: '#0E7490', fontWeight: 600,
            background: '#ECFEFF',
            border: '1px solid rgba(14,116,144,0.22)',
            borderRadius: 999, cursor: 'pointer', padding: '5px 12px', minHeight: 28,
          }}>
            전체보기
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyCard({ icon, title, desc }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16,
      border: '1px solid var(--c-border, rgba(15,23,42,0.08))',
      padding: '18px 18px', textAlign: 'center',
      minHeight: 96,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ fontSize: 22, marginBottom: 4, opacity: 0.42 }}>{icon}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#7C8C98', marginBottom: desc ? 2 : 0, lineHeight: 1.3 }}>{title}</div>
      {desc && <div style={{ fontSize: 11, color: '#A9B5BE', lineHeight: 1.25 }}>{desc}</div>}
    </div>
  );
}

function BroadcastCard({ broadcast: b, onClick }) {
  const mediaUrl = b.mediaUrl || b.videoUrl || b.video_url || b.uploadUrl || b.upload_url || null;
  const youtubeId = parseYouTubeId(mediaUrl);
  const thumb = youtubeId
    ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
    : (b.thumbnailUrl || b.thumbnail_url || b.thumbnail || b.posterUrl || b.poster_url || b.imageUrl || mediaUrl || null);
  const shouldRenderDirectPreview = isDirectVideoUrl(mediaUrl) && !thumb;
  const publishedText = b.createdAt || b.publishedAt
    ? new Date(b.createdAt || b.publishedAt).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })
    : '';
  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        background: '#FFFFFF',
        cursor: 'pointer',
        transition: 'all 0.3s',
        boxShadow: '0 2px 10px rgba(12,84,96,0.07)',
        border: '1px solid #DDE3EA'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#F0F4F8';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(12,84,96,0.13)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#FFFFFF';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 10px rgba(12,84,96,0.07)';
      }}
    >
      <div style={{
        position: 'relative',
        minHeight: 160,
        aspectRatio: '16 / 9',
        background: '#EEF1F5',
        borderRadius: '8px 8px 0 0',
        overflow: 'hidden'
      }}>
        {thumb ? (
          <div
            style={{
              position: 'absolute',
              inset: '-10px',
              backgroundImage: `url(${thumb})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(20px) brightness(0.6)',
              transform: 'scale(1.1)',
              zIndex: 1,
            }}
          />
        ) : null}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.4) 100%)',
            zIndex: 2,
          }}
        />
        <div style={{ position: 'absolute', inset: 0, zIndex: 3, padding: 8 }}>
          <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 10, overflow: 'hidden' }}>
            {shouldRenderDirectPreview ? (
              <video
                src={mediaUrl}
                muted
                playsInline
                preload="metadata"
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', background: 'rgba(0,0,0,0.18)' }}
              />
            ) : mediaUrl || thumb ? (
              thumb ? (
                <img
                  src={thumb}
                  alt={b.title || '방송 썸네일'}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', background: 'rgba(0,0,0,0.12)' }}
                />
              ) : (
                <VideoEmbed url={mediaUrl} mode="thumbnail" thumbnail={thumb} />
              )
            ) : null}
          </div>
        </div>
        {b.isPinned && (
          <span style={{
            position: 'absolute',
            top: 8,
            left: 8,
            background: 'rgba(255,200,0,0.95)',
            color: '#000',
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 700,
            zIndex: 4,
            backdropFilter: 'blur(10px)'
          }}>
            📌 고정
          </span>
        )}
        {b.duration && (
          <span style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            background: 'rgba(0,0,0,0.8)',
            color: '#fff',
            padding: '2px 6px',
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 600,
            zIndex: 4,
            backdropFilter: 'blur(10px)'
          }}>
            {b.duration}
          </span>
        )}
      </div>
      <div style={{ padding: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          {b.isLive && (
            <span style={{
              fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 20,
              background: '#EF4444', color: '#fff', letterSpacing: 0.5,
            }}>● LIVE</span>
          )}
          <span style={{
            fontSize: 14,
            fontWeight: 700,
            color: '#0D1B21',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>{b.title}</span>
        </div>
        <div style={{ fontSize: 12, color: '#637074', display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
          <span>👤 {b.uploaderName || b.broadcasterName || '관리자'}</span>
          {publishedText ? <span>📅 {publishedText}</span> : null}
        </div>
        {(b.viewCount !== undefined || b.viewerCount !== undefined || b.likeCount !== undefined) && (
          <div style={{ fontSize: 12, color: '#637074', display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
            {(b.viewCount !== undefined || b.viewerCount !== undefined) && <span>👁️ {b.viewCount ?? b.viewerCount ?? 0}</span>}
            {b.likeCount !== undefined && <span>❤️ {b.likeCount}</span>}
          </div>
        )}
        {b.description ? (
          <div style={{
            marginTop: 6,
            fontSize: 12,
            color: '#7b8c93',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
          }}>
            {b.description}
          </div>
        ) : null}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
          <span style={{ fontSize: 18, opacity: 0.4, flexShrink: 0 }}>›</span>
        </div>
      </div>
    </div>
  );
}

/* 하이라이트 카드 — 타입별 그라디언트 */
const HL_CONFIG = {
  mission:   { bg: 'linear-gradient(135deg, #0E7490 0%, #0891b2 100%)', badge: '🎯 미션',  badgeBg: 'rgba(255,255,255,0.25)' },
  audition:  { bg: 'linear-gradient(135deg, #7C3AED 0%, #9333ea 100%)', badge: '🎤 오디션', badgeBg: 'rgba(255,255,255,0.22)' },
  broadcast: { bg: 'linear-gradient(135deg, #DC2626 0%, #ef4444 100%)', badge: '🔴 방송',  badgeBg: 'rgba(255,255,255,0.22)' },
};

function HighlightCard({ item, onClick }) {
  const cfg = HL_CONFIG[item.type] || HL_CONFIG.mission;
  const title = item.title || '—';
  const sub   = item.description || item.subtitle || item.category || '';
  const dDay  = item.deadline
    ? Math.max(0, Math.ceil((new Date(item.deadline) - new Date()) / 86400000))
    : null;
  const pts   = item.points || item.prize || null;

  return (
    <div
      onClick={onClick}
      style={{
        minWidth: 180, maxWidth: 200, borderRadius: 20, overflow: 'hidden',
        background: cfg.bg, cursor: 'pointer', flexShrink: 0,
        boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
        position: 'relative',
      }}
    >
      {/* 배경 장식 원 */}
      <div style={{
        position: 'absolute', top: -28, right: -28,
        width: 100, height: 100, borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -20, left: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: 'rgba(255,255,255,0.06)',
        pointerEvents: 'none',
      }} />

      <div style={{ padding: '16px 16px 14px', position: 'relative' }}>
        {/* 뱃지 */}
        <span style={{
          display: 'inline-block', fontSize: 11, fontWeight: 800,
          background: cfg.badgeBg, color: '#fff',
          padding: '3px 10px', borderRadius: 20, marginBottom: 10,
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,255,255,0.3)',
        }}>
          {cfg.badge}
        </span>

        {/* 제목 */}
        <div style={{
          fontSize: 15, fontWeight: 800, color: '#fff', lineHeight: 1.3,
          marginBottom: 6,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {title}
        </div>

        {/* 부제 */}
        {sub && (
          <div style={{
            fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 10,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {sub}
          </div>
        )}

        {/* 하단 메타 */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {dDay !== null && (
            <span style={{
              fontSize: 11, fontWeight: 700,
              background: 'rgba(255,255,255,0.22)', color: '#fff',
              padding: '3px 8px', borderRadius: 20,
            }}>
              D-{dDay}
            </span>
          )}
          {pts && (
            <span style={{
              fontSize: 11, fontWeight: 700,
              background: 'rgba(245,158,11,0.35)', color: '#fef3c7',
              padding: '3px 8px', borderRadius: 20,
            }}>
              +{pts}P
            </span>
          )}
          {item.isLive && (
            <span style={{
              fontSize: 11, fontWeight: 800,
              background: 'rgba(255,255,255,0.28)', color: '#fff',
              padding: '3px 8px', borderRadius: 20,
            }}>
              ● LIVE
            </span>
          )}
        </div>
      </div>
    </div>
  );
}



