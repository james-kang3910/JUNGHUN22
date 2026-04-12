/**
 * RegionShops — 지역 상점 목록
 * 
 * /r/:regionId/shops
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useRegion } from '../context/RegionContext';
import * as storageAdapter from '../lib/storageAdapter';
import useAutoRefresh from '../hooks/useAutoRefresh';

const CATEGORY_META = {
  food: { label: '음식', emoji: '🍽️', color: '#DFF7F2' },
  cafe: { label: '카페', emoji: '☕', color: '#EEF9F2' },
  life: { label: '생활', emoji: '🛒', color: '#E3F5FF' },
  beauty: { label: '뷰티', emoji: '💄', color: '#E8F7F3' },
  etc: { label: '기타', emoji: '💼', color: '#EEF7FA' },
};

function normalizeShopAssetUrl(raw) {
  const text = String(raw || '').trim();
  if (!text) return '';
  if (text.startsWith('/uploads/') && !text.startsWith('/uploads/banners/') && !text.startsWith('/uploads/supplies/') && !text.startsWith('/uploads/videos/')) {
    const filename = text.replace('/uploads/', '');
    return `/uploads/banners/${filename}`;
  }
  return text;
}

function normalizeShopImageList(value, fallbackValues = []) {
  const images = [];

  const pushValue = (candidate) => {
    if (!candidate) return;
    if (Array.isArray(candidate)) {
      candidate.forEach(pushValue);
      return;
    }
    if (typeof candidate === 'object') {
      pushValue(candidate.url || candidate.imageUrl || candidate.src || candidate.thumbnail);
      return;
    }

    const text = normalizeShopAssetUrl(candidate);
    if (!text) return;
    if (!images.includes(text)) images.push(text);
  };

  pushValue(value);
  pushValue(fallbackValues);
  return images.slice(0, 3);
}

function getPrimaryShopImage(shop) {
  return normalizeShopImageList([
    shop?.thumbnail,
    shop?.thumbnailUrl,
    shop?.coverImage,
    shop?.mainImage,
    shop?.image,
    shop?.imageUrl,
  ])[0] || null;
}

function normalizeInteriorShopImages(shop, primaryImage = '') {
  const images = normalizeShopImageList(shop?.shopImages || shop?.interiorImages || shop?.images || shop?.gallery || shop?.photos);
  const primary = normalizeShopAssetUrl(primaryImage);
  return images.filter((imageUrl) => imageUrl && imageUrl !== primary).slice(0, 3);
}

function mapShopToUI(shop) {
  const primaryImage = getPrimaryShopImage(shop);
  const shopImages = normalizeInteriorShopImages(shop, primaryImage);
  return {
    ...shop,
    id: shop.id || shop.shopId,
    shopId: shop.shopId || shop.id,
    cat: shop.category || 'etc',
    sub: shop.description || '',
    badge: shop.badge || '',
    score: (shop.rating != null && Number(shop.rating) > 0) ? Number(shop.rating).toFixed(1) : '-',
    image: primaryImage,
    photoPreviewUrl: primaryImage,
    shopImages,
    vipVoucherCount: parseInt(shop.vipVoucherCount || shop.vip_voucher_count || 0, 10) || 0,
  };
}

function catLabel(category) {
  return CATEGORY_META[category]?.label || '기타';
}

function catEmoji(category) {
  return CATEGORY_META[category]?.emoji || '💼';
}

function catColor(category) {
  return CATEGORY_META[category]?.color || '#EEF7FA';
}

export default function RegionShops() {
  const { regionId } = useRegion();
  const navigate = useNavigate();
  const outletCtx = useOutletContext() || {};
  const selectedDistrictId = outletCtx.selectedDistrictId || '';
  const regionName = outletCtx.regionName || '';
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeEventShopIds, setActiveEventShopIds] = useState(new Set());

  useEffect(() => {
    if (!regionId) return;
    loadShops({ silent: false });
  }, [regionId, selectedDistrictId]);

  async function loadShops({ silent = false } = {}) {
    if (!silent) setLoading(true);
    try {
      const [allShops, activeEvents] = await Promise.all([
        storageAdapter.getShops(),
        storageAdapter.getShopEvents({ active: true }),
      ]);

      const filtered = (allShops || [])
        .filter((shop) => (shop.isPublic || shop.status === 'approved'))
        .filter((shop) => String(shop.regionId || shop.region_id || '') === String(regionId || ''))
        .filter((shop) => !selectedDistrictId || String(shop.districtId || shop.district_id || '') === String(selectedDistrictId))
        .map(mapShopToUI);

      setShops(filtered);
      setActiveEventShopIds(new Set((activeEvents || []).map((eventItem) => String(eventItem.shopId || ''))));
    } catch (e) {
      console.error('[RegionShops] load error:', e);
      // 자동 새로고침의 일시 오류에서는 기존 목록을 유지해 화면 튐을 방지한다.
      if (!silent) {
        setShops([]);
        setActiveEventShopIds(new Set());
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useAutoRefresh(() => loadShops({ silent: true }), { enabled: !!regionId, intervalMs: 15000 });

  const uniqueShops = useMemo(() => {
    const seen = new Set();
    return (Array.isArray(shops) ? shops : []).filter((shop) => {
      const key = String(shop.shopId || shop.id || '');
      if (!key) return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [shops]);

  // ── 카드: Elevated (상점 탐색 목적) ──────────────────────────────
  const cardStyle = {
    padding: '14px 16px',
    borderRadius: 'var(--r-card, 20px)',
    border: '1px solid var(--c-border, rgba(15,23,42,0.08))',
    background: 'var(--c-surface, #FFFFFF)',
    boxShadow: '0 6px 18px rgba(14,116,144,0.05)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    transition: 'box-shadow 0.18s, transform 0.15s',
  };

  return (
    <div style={{ background: 'radial-gradient(600px circle at 50% -10%, rgba(14,116,144,0.08), transparent 60%), var(--c-bg, #F5F8FA)', minHeight: 'calc(100vh - 110px)', paddingBottom: 80 }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px' }}>

        {/* 인콘텐츠 타이틀 행 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0 14px' }}>
          <h1 style={{ fontSize: 17, fontWeight: 700, color: 'var(--c-tx-h, #0F172A)', paddingLeft: 11, borderLeft: '3px solid var(--c-primary, #0E7490)', margin: 0 }}>
            {regionName ? `${regionName} 상점` : '지역 상점'}
          </h1>
          {!loading && (
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-primary)', background: 'var(--c-primary-t)', border: '1px solid rgba(14,116,144,0.20)', borderRadius: 999, padding: '3px 10px' }}>
              {uniqueShops.length}곳
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--c-tx-d)', fontSize: 14 }}>로딩 중...</div>
        ) : uniqueShops.length === 0 ? (
          <div style={{ padding: '52px 24px', textAlign: 'center', borderRadius: 'var(--r-section, 20px)', background: '#F4F6F9' }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>🏪</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-tx-h)', marginBottom: 8 }}>등록된 지역 상점이 없습니다</div>
            <div style={{ fontSize: 13, color: 'var(--c-tx-s)', lineHeight: 1.6 }}>우리 지역 상점 정보를 준비 중입니다</div>
          </div>
        ) : (
          <div style={{ background: 'transparent', borderRadius: 'var(--r-section, 20px)', padding: '0 0 12px', display: 'grid', gap: 8 }}>
            {uniqueShops.map((s) => {
              const isVip = s.vipVoucherCount > 0;
              const cardClass = isVip ? 'su-shop-card--vip' : 'su-shop-card--regular';
              return (
                <button
                  key={s.shopId || s.id}
                  type="button"
                  className={cardClass}
                  style={{ ...cardStyle, textAlign: 'left' }}
                  onClick={() => navigate(`/shops/${encodeURIComponent(String(s.id || s.shopId))}`, { state: { shop: s } })}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 10px 24px rgba(14,116,144,0.10)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 6px 18px rgba(14,116,144,0.05)'; e.currentTarget.style.transform = 'none'; }}
                >
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', width: '100%' }}>
                    <div className="su-shop-thumb" style={{ '--thumb-bg': catColor(s.cat) }}>
                      {s.image ? (
                        <img
                          src={s.image}
                          alt={s.name}
                          className="su-shop-thumb__img"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <span className="su-shop-thumb__emoji">{catEmoji(s.cat)}</span>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span className="su-shop-name">{s.name}</span>
                        {!!s.badge && <span className="su-badge su-badge--neutral">{s.badge}</span>}
                        {isVip && <span className="su-vip-badge">🎟️ VIP {s.vipVoucherCount}장</span>}
                        {activeEventShopIds.has(String(s.shopId || s.id)) && (
                          <span className="shop-event-badge shop-event-badge--pulse">이벤트</span>
                        )}
                      </div>

                      <div className="su-shop-meta" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>⭐ {s.score}</span>
                        <span>·</span>
                        <span><span style={{ fontFamily: '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif' }}>{catEmoji(s.cat)}</span> {catLabel(s.cat)}</span>
                      </div>

                      {s.sub && (
                        <div className="su-shop-desc" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {s.sub}
                        </div>
                      )}

                      <div className="su-shop-meta" style={{ marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        📍 {s.address || '-'}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
