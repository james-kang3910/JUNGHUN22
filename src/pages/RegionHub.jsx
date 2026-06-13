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
import { useBuildRegionPath } from '../hooks/useBuildRegionPath';
import VideoEmbed from '../components/VideoEmbed';
import { isDirectVideoUrl, parseYouTubeId } from '../lib/videoUtils';
import useAutoRefresh from '../hooks/useAutoRefresh';
import { getRegionById } from '../data/regions.seed';
import { buildRegionPublicUrl, generateQrDataUrl, downloadDataUrl } from '../lib/qrLink';
import * as storageAdapter from '../lib/storageAdapter';

function resolveBannerImageUrl(imageUrl) {
  const raw = String(imageUrl || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw) || raw.startsWith('data:')) return raw;
  const base = import.meta.env.VITE_API_BASE || '';
  return `${base}${raw}`;
}

function normalizePortalBanners(rawList) {
  return (Array.isArray(rawList) ? rawList : []).map((b) => ({
    id: b.id || b.bannerId || b.banner_id,
    imageUrl: resolveBannerImageUrl(b.imageUrl || b.image_url),
    alt: b.alt || b.title || '지역 광고',
    linkUrl: b.linkUrl || b.link_url || '',
  }));
}

function resolveNoticeImageUrl(imageUrl) {
  const raw = String(imageUrl || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw) || raw.startsWith('data:')) return raw;
  const base = import.meta.env.VITE_API_BASE || '';
  return `${base}${raw}`;
}

// 날씨 (인라인 — 지역명 없이 온도만)
function RegionWeather({ lat, lon }) {
  const [weather, setWeather] = useState(null);
  useEffect(() => {
    if (!lat || !lon) return;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
      .then(r => r.ok ? r.json() : null)
      .then(data => setWeather(data?.current_weather || null))
      .catch(() => setWeather(null));
  }, [lat, lon]);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#fff', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
      <span style={{ fontSize: 14, lineHeight: 1 }}>🌤️</span>
      <span>날씨</span>
      {weather ? <span>{weather.temperature}°C</span> : <span style={{ opacity: 0.6 }}>-</span>}
    </span>
  );
}

export default function RegionHub() {
  const { regionId } = useRegion();
  const toRegion = useBuildRegionPath();
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
  const [regionQrDataUrl, setRegionQrDataUrl] = useState('');
  const [regionQrLoading, setRegionQrLoading] = useState(false);
  const [portalBanners, setPortalBanners] = useState([]);
  const [bannerSlideIndex, setBannerSlideIndex] = useState(0);
  const hasLoadedRef = useRef(false);

  const loadAll = useCallback(async ({ background = false } = {}) => {
    if (!regionId) return;
    if (!background || !hasLoadedRef.current) {
      setLoading(true);
    }
    try {
      const BASE = import.meta.env.VITE_API_BASE || '';
      const dParam = selectedDistrictId ? `&districtId=${selectedDistrictId}` : '';

      const [noticeRes, broadcastRes, newsRes, missionRes, auditionRes, statsRes, bannerRes] =
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
          storageAdapter.getRegionPortalBanners(regionId).catch(() => []),
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
      if (bannerRes.status === 'fulfilled') {
        setPortalBanners(normalizePortalBanners(bannerRes.value));
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

  useEffect(() => {
    setBannerSlideIndex((prev) => {
      if (!portalBanners.length) return 0;
      return prev >= portalBanners.length ? 0 : prev;
    });
  }, [portalBanners.length]);

  useEffect(() => {
    if (portalBanners.length <= 1) return undefined;
    const timer = setInterval(() => {
      setBannerSlideIndex((prev) => (prev + 1) % portalBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [portalBanners.length]);

  useEffect(() => {
    let cancelled = false;
    async function buildRegionQr() {
      const rid = String(regionId || '').trim();
      if (!rid) {
        setRegionQrDataUrl('');
        return;
      }
      setRegionQrLoading(true);
      try {
        const targetUrl = buildRegionPublicUrl(rid);
        const dataUrl = await generateQrDataUrl(targetUrl, 280);
        if (!cancelled) setRegionQrDataUrl(dataUrl);
      } catch (error) {
        if (!cancelled) setRegionQrDataUrl('');
      } finally {
        if (!cancelled) setRegionQrLoading(false);
      }
    }
    buildRegionQr();
    return () => {
      cancelled = true;
    };
  }, [regionId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: '#9BA8AE', fontSize: 14 }}>
        로딩 중...
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--c-bg, #F5F8FA)', minHeight: 'calc(100vh - 120px)', paddingBottom: 'calc(var(--navH, 72px) + 28px)' }}>

      {/* ══════ HERO ══════ */}
      <div style={{
        background: 'linear-gradient(135deg, #0e6f84 0%, #13788d 56%, #2495ac 100%)',
        padding: '8px 10px 10px',
        color: '#fff',
        margin: '8px 14px 0',
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 12px rgba(14,116,144,0.08)',
      }}>
        <div style={{ fontSize: 9, fontWeight: 600, opacity: 0.56, marginBottom: 2, letterSpacing: 0.24 }}>
          📍 지역 포탈
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          marginBottom: 6,
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '4px 10px',
            flex: 1,
            minWidth: 0,
          }}>
            <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.4px', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
              {regionName || '내 지역'}
            </span>
            <RegionWeather lat={lat} lon={lon} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => {
                if (!regionQrDataUrl) return;
                const safeName = String(regionName || regionLabel || 'region').replace(/\s+/g, '-');
                downloadDataUrl(regionQrDataUrl, `${safeName}-portal-qr.png`);
              }}
              disabled={!regionQrDataUrl}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.35)',
                borderRadius: 5,
                color: '#fff',
                fontSize: 9,
                fontWeight: 700,
                padding: '5px 6px',
                cursor: regionQrDataUrl ? 'pointer' : 'not-allowed',
                whiteSpace: 'nowrap',
                opacity: regionQrDataUrl ? 1 : 0.5,
                lineHeight: 1.2,
              }}
            >
              QR 다운로드
            </button>
            {regionQrDataUrl ? (
              <img
                src={regionQrDataUrl}
                alt="지역포털 QR"
                title="스캔하면 지역포털 바로 이동"
                style={{ width: 58, height: 58, display: 'block', background: '#fff', borderRadius: 5 }}
              />
            ) : (
              <div style={{
                width: 58,
                height: 58,
                borderRadius: 5,
                background: 'rgba(255,255,255,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                opacity: 0.7,
              }}>
                {regionQrLoading ? '생성중' : '-'}
              </div>
            )}
          </div>
        </div>

        {/* Quick CTA — 2열 진입 메뉴 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 5 }}>
          {[
            { icon: '🎯', label: '미션/이벤트', path: toRegion('/missions') },
            { icon: '🎤', label: '오디션',   path: toRegion('/auditions') },
            { icon: '🏪', label: '상권/상점', path: toRegion('/shops') },
            { icon: '🏢', label: '아파트',   path: toRegion('/apt') },
            { icon: '📰', label: '전단',     path: toRegion('/flyers') },
            { icon: '💬', label: '지역채팅', path: toRegion('/chat'), bg: 'rgba(166,114,255,0.22)', border: '1px solid rgba(216,191,255,0.52)' },
          ].map(btn => (
            <button
              key={btn.label}
              onClick={() => navigate(btn.path)}
              style={{
                background: btn.bg || 'rgba(255,255,255,0.14)',
                border: btn.border || '1px solid rgba(255,255,255,0.22)',
                borderRadius: 8,
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                padding: '4px 3px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                minHeight: 32,
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
            onMore={() => navigate(toRegion('/notices'))}
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
                  onClick={() => navigate(toRegion('/notices'))}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    padding: '10px 16px',
                    borderBottom: idx < notices.length - 1 ? '1px solid rgba(15,23,42,0.06)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  {noticeImageUrl ? (
                    <div style={{ width: '100%', marginBottom: 8, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(15,23,42,0.08)', background: '#e2e8f0' }}>
                      <img src={noticeImageUrl} alt={n.title || '공지 이미지'} style={{ display: 'block', width: '100%', maxHeight: 180, objectFit: 'cover' }} />
                    </div>
                  ) : null}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', minWidth: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0ea5e9', flexShrink: 0, whiteSpace: 'nowrap' }}>공지제목</span>
                    <span style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#0F172A',
                      flex: 1,
                      minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>{n.title}</span>
                  </div>
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
            title="지역 공유 발전방송"
            onMore={() => navigate(toRegion('/broadcasts'))}
          />
          {broadcasts.length === 0 ? (
            <EmptyCard icon="📡" title="진행 중인 방송이 없습니다" desc="곧 표시됩니다" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {broadcasts.map(b => (
                <BroadcastCard
                  key={b.broadcastId || b.id}
                  broadcast={b}
                  onClick={() => navigate(toRegion('/broadcasts'))}
                />
              ))}
            </div>
          )}
        </section>

        {/* ══════ 3. 지역뉴스 ══════ */}
        <section style={{ marginBottom: 20 }}>
          <SectionHead
            icon="📰"
            title="지역 공유 발전뉴스"
            onMore={() => navigate(toRegion('/news'))}
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
                  onClick={() => n.url ? window.open(n.url, '_blank') : navigate(toRegion('/news'))}
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
                        navigate(toRegion('/missions'), {
                          state: {
                            scrollTo: 'mission',
                            highlightType: 'mission',
                            highlightId: String(missionId),
                          },
                        });
                        return;
                      }
                      navigate(toRegion('/missions'), { state: { scrollTo: 'mission' } });
                      return;
                    }
                    if (itemType === 'audition') {
                      const auditionId = item.id || item.auditionId || item.audition_id || null;
                      if (auditionId) {
                        navigate(`/audition/${auditionId}`);
                        return;
                      }
                      navigate(toRegion('/auditions'));
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
                      navigate(toRegion('/broadcasts'));
                    }
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* ══════ 5. 하단 배너 광고 (항상 노출) ══════ */}
        <section style={{ marginBottom: 8 }}>
          <SectionHead icon="📢" title="지역 광고" />
          <div style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '3 / 1',
            maxHeight: 120,
            borderRadius: 16,
            overflow: 'hidden',
            background: '#f4f6f8',
            border: '1px solid var(--c-border, rgba(15,23,42,0.08))',
            boxShadow: '0 4px 12px rgba(14,116,144,0.06)',
          }}>
            {portalBanners.length === 0 ? (
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                padding: '0 12px',
                textAlign: 'center',
              }}>
                <div style={{ color: '#aaa', fontSize: 12, fontWeight: 500 }}>등록된 광고가 없습니다</div>
                <div style={{ color: '#bbb', fontSize: 11 }}>지역관리 콘솔에서 배너를 등록하세요</div>
              </div>
            ) : (
              <>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  transition: 'transform 0.5s ease-in-out',
                  transform: `translateX(-${bannerSlideIndex * 100}%)`,
                }}>
                  {portalBanners.map((banner, idx) => (
                    <div
                      key={banner.id || idx}
                      role={banner.linkUrl ? 'link' : undefined}
                      tabIndex={banner.linkUrl ? 0 : undefined}
                      onClick={() => {
                        if (!banner.linkUrl) return;
                        window.open(banner.linkUrl, '_blank', 'noopener,noreferrer');
                      }}
                      onKeyDown={(e) => {
                        if (!banner.linkUrl) return;
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          window.open(banner.linkUrl, '_blank', 'noopener,noreferrer');
                        }
                      }}
                      style={{
                        minWidth: '100%',
                        height: '100%',
                        flexShrink: 0,
                        cursor: banner.linkUrl ? 'pointer' : 'default',
                        position: 'relative',
                        background: '#e2e8f0',
                      }}
                    >
                      {banner.imageUrl ? (
                        <img
                          src={banner.imageUrl}
                          alt={banner.alt}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#64748B',
                          fontSize: 13,
                          fontWeight: 600,
                        }}>
                          {banner.alt}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {portalBanners.length > 1 && (
                  <div style={{
                    position: 'absolute',
                    bottom: 6,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 4,
                    zIndex: 2,
                  }}>
                    {portalBanners.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setBannerSlideIndex(i)}
                        aria-label={`배너 ${i + 1}`}
                        className={`su-bannerDot${i === bannerSlideIndex ? ' is-active' : ''}`}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
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



