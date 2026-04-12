/**
 * RegionFlyers — 지역 전단 그리드 + 풀스크린 뷰어
 * /r/:regionId/flyers
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useRegion } from '../context/RegionContext';
import { getRegionFlyers, viewRegionFlyer } from '../lib/storageAdapter';
import { getCurrentUser } from '../lib/authStore';

function normalizeFlyerImages(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export default function RegionFlyers() {
  const { regionId } = useRegion();
  useOutletContext() || {};
  const me = getCurrentUser();

  const [flyers,    setFlyers]    = useState([]);
  const [catFilter, setCatFilter] = useState('전체');
  const [viewer,    setViewer]    = useState(null);       // { flyer, imgIndex }
  const [loading,   setLoading]   = useState(true);
  const [rewarded,  setRewarded]  = useState(() => new Set());
  const viewerStartX = useRef(null);

  const load = useCallback(async () => {
    if (!regionId) return;
    setLoading(true);
    try {
      const data = await getRegionFlyers(regionId);
      const rawFlyers = data?.flyers || data || [];
      const normalizedFlyers = Array.isArray(rawFlyers)
        ? rawFlyers.map((flyer) => ({ ...flyer, images: normalizeFlyerImages(flyer?.images) }))
        : [];
      setFlyers(normalizedFlyers);
    } catch { setFlyers([]); } finally { setLoading(false); }
  }, [regionId]);

  useEffect(() => { load(); }, [load]);

  const openViewer = async (flyer) => {
    setViewer({ flyer, imgIndex: 0 });
    const fid = flyer.flyer_id || flyer.id;
    if (me && flyer.point_enabled && flyer.point_reward > 0 && !rewarded.has(fid)) {
      try {
        await viewRegionFlyer(regionId, fid);
        setRewarded(prev => new Set([...prev, fid]));
      } catch {}
    }
  };

  const now = new Date();
  const categories = ['전체', ...new Set(flyers.map(f => f.category).filter(Boolean))];
  const filtered = flyers.filter(f => {
    if (!f.is_active) return false;
    if (f.end_at && new Date(f.end_at) < now) return false;
    if (catFilter !== '전체' && f.category !== catFilter) return false;
    return true;
  });

  // ── 풀스크린 뷰어 ──
  if (viewer) {
    const { flyer, imgIndex } = viewer;
    const images = normalizeFlyerImages(flyer?.images);
    const imgSrc = images[imgIndex]?.url || images[imgIndex] || '';
    return (
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 400, display: 'flex', flexDirection: 'column' }}
        onTouchStart={e => { viewerStartX.current = e.touches[0].clientX; }}
        onTouchEnd={e => {
          const startX = viewerStartX.current;
          if (typeof startX !== 'number') return;
          const dx = startX - e.changedTouches[0].clientX;
          if (Math.abs(dx) > 40) {
            const next = imgIndex + (dx > 0 ? 1 : -1);
            if (next >= 0 && next < images.length) setViewer(v => ({ ...v, imgIndex: next }));
          }
          viewerStartX.current = null;
          e.stopPropagation();
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}
          onClick={e => e.stopPropagation()}>
          <span style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>{flyer.title}</span>
          <button onClick={() => setViewer(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, position: 'relative' }}>
          {images.length > 1 && imgIndex > 0 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setViewer(v => ({ ...v, imgIndex: Math.max(0, v.imgIndex - 1) }));
              }}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'rgba(15,23,42,0.72)', color: '#fff', fontSize: 20, cursor: 'pointer' }}
            >
              ‹
            </button>
          ) : null}
          {imgSrc
            ? <img src={imgSrc} alt={flyer.title} style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 12, objectFit: 'contain' }} />
            : <div style={{ color: '#94A3B8', fontSize: 14 }}>이미지가 없습니다.</div>}
          {images.length > 1 && imgIndex < images.length - 1 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setViewer(v => ({ ...v, imgIndex: Math.min(images.length - 1, v.imgIndex + 1) }));
              }}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'rgba(15,23,42,0.72)', color: '#fff', fontSize: 20, cursor: 'pointer' }}
            >
              ›
            </button>
          ) : null}
        </div>
        {images.length > 1 ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 700, marginTop: -8 }}>
            {imgIndex + 1} / {images.length}
          </div>
        ) : null}
        {images.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '8px 16px 24px' }}
            onClick={e => e.stopPropagation()}>
            {images.map((_, i) => (
              <div key={i}
                style={{ width: 8, height: 8, borderRadius: '50%', cursor: 'pointer', background: i === imgIndex ? '#fff' : 'rgba(255,255,255,0.3)' }}
                onClick={() => setViewer(v => ({ ...v, imgIndex: i }))} />
            ))}
          </div>
        )}
        {me && flyer.point_enabled && flyer.point_reward > 0 && (
          <div style={{ textAlign: 'center', paddingBottom: 24, fontSize: 13, fontWeight: 700, color: '#D4922A' }}>
            {rewarded.has(flyer.flyer_id || flyer.id)
              ? `+${flyer.point_reward}P 적립 완료`
              : `열람 시 +${flyer.point_reward}P 적립`}
          </div>
        )}
      </div>
    );
  }

  // ── 그리드 목록 ──
  return (
    <div style={{ minHeight: '100vh', background: '#F5F8FA', paddingBottom: 80 }}>
      {/* 안내 문구 */}
      <div style={{ margin: '12px 12px 0', padding: '12px 14px', borderRadius: 14, border: '1px solid rgba(14,116,144,0.18)', background: 'rgba(14,116,144,0.06)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-primary, #0E7490)', marginBottom: 4 }}>📢 전단 광고 안내</div>
        <div style={{ fontSize: 12, lineHeight: 1.7, color: 'var(--c-tx-s, #64748B)' }}>
          전단지로 우리 가게를 홍보해보세요!<br />
          이미지를 클릭하면 전단을 크게 볼 수 있습니다.<br />
          광고 문의는 지역 담당자에게 연락해 주세요.
        </div>
      </div>
      {/* 카테고리 필터 */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px', overflowX: 'auto', background: '#fff', borderBottom: '1px solid #E2E8F0' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setCatFilter(cat)}
            style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 999, fontSize: 13, cursor: 'pointer',
              border:     catFilter === cat ? 'none' : '1px solid #DDE3EA',
              background: catFilter === cat ? '#0E7490' : '#fff',
              color:      catFilter === cat ? '#fff'    : '#64748B',
              fontWeight: catFilter === cat ? 700 : 400,
            }}>
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#94A3B8', padding: '32px 0' }}>불러오는 중...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#94A3B8', padding: '32px 0' }}>전단이 없습니다.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '12px 12px 0' }}>
          {filtered.map(flyer => {
            const imgSrc = flyer.images?.[0]?.url || flyer.images?.[0] || null;
            const fid    = flyer.flyer_id || flyer.id;
            const isNew  = !flyer.created_at || (Date.now() - new Date(flyer.created_at).getTime()) < 7 * 86400000;
            return (
              <button key={fid} onClick={() => openViewer(flyer)}
                style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(14,116,144,0.12)', boxShadow: '0 4px 16px rgba(14,116,144,0.07)', cursor: 'pointer', padding: 0, position: 'relative', textAlign: 'left' }}>
                <div style={{ position: 'relative', width: '100%', paddingTop: '140%', overflow: 'hidden', background: '#F1F5F9' }}>
                  {imgSrc
                    ? <img src={imgSrc} alt={flyer.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CBD5E1', fontSize: 28 }}>📄</div>}
                  {/* 하단 오버레이 */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)', padding: '20px 8px 8px' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {flyer.shop_name || flyer.title}
                    </div>
                  </div>
                  {/* NEW 뱃지 */}
                  {isNew && (
                    <div style={{ position: 'absolute', top: 6, left: 6, width: 8, height: 8, borderRadius: '50%', background: '#EF4444', boxShadow: '0 0 4px #EF4444' }} />
                  )}
                  {/* 포인트 뱃지 */}
                  {flyer.point_enabled && flyer.point_reward > 0 && (
                    <div style={{ position: 'absolute', top: 6, right: 6, background: '#D4922A', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 999 }}>
                      +{flyer.point_reward}P
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
