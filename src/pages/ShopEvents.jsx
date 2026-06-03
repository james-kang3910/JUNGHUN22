import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import Toast from "../components/Toast";
import * as storageAdapter from "../lib/storageAdapter";

const CATEGORY_META = {
  food: { label: '음식', emoji: '🍽️', color: '#DFF7F2' },
  cafe: { label: '카페', emoji: '☕', color: '#EEF9F2' },
  life: { label: '생활', emoji: '🛒', color: '#E3F5FF' },
  beauty: { label: '뷰티', emoji: '💄', color: '#E8F7F3' },
  etc: { label: '기타', emoji: '💼', color: '#EEF7FA' },
};

function catLabel(category) {
  return CATEGORY_META[category]?.label || '기타';
}

function catEmoji(category) {
  return CATEGORY_META[category]?.emoji || '💼';
}

function catColor(category) {
  return CATEGORY_META[category]?.color || '#EEF7FA';
}

function normalizeShopAssetUrl(raw) {
  const text = String(raw || '').trim();
  if (!text) return '';
  if (text.startsWith('/uploads/') && !text.slice('/uploads/'.length).includes('/')) {
    const filename = text.slice('/uploads/'.length);
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

    if ((text.startsWith('[') || text.startsWith('{')) && !/^https?:\/\//i.test(text) && !text.startsWith('/') && !text.startsWith('blob:') && !text.startsWith('data:')) {
      try {
        pushValue(JSON.parse(text));
        return;
      } catch (error) {}
    }

    if (!images.includes(text)) images.push(text);
  };

  pushValue(value);
  pushValue(fallbackValues);
  return images.slice(0, 3);
}

function normalizeInteriorShopImages(shop, primaryImage = '') {
  const images = normalizeShopImageList(shop?.shopImages || shop?.interiorImages || shop?.images || shop?.gallery || shop?.photos);
  const primary = normalizeShopAssetUrl(primaryImage);
  return images.filter((imageUrl) => imageUrl && imageUrl !== primary).slice(0, 3);
}

function getPrimaryShopImage(shop) {
  return normalizeShopImageList([
    shop?.thumbnail,
    shop?.thumbnailUrl,
    shop?.coverImage,
    shop?.mainImage,
    shop?.image,
    shop?.imageUrl,
    shop?.photoPreviewUrl,
    shop?.shopThumbnail,
  ])[0] || null;
}

function mapShopToCard(shop, eventItem) {
  const merged = { ...shop, ...eventItem };
  const primaryImage = getPrimaryShopImage(merged);
  const shopImages = normalizeInteriorShopImages(merged, primaryImage);
  return {
    ...merged,
    id: shop?.id || shop?.shopId || eventItem?.shopId,
    shopId: shop?.shopId || shop?.id || eventItem?.shopId,
    name: shop?.name || eventItem?.shopName || '상점',
    cat: shop?.category || eventItem?.shopCategory || 'etc',
    sub: shop?.description || '',
    score: (shop?.rating != null && Number(shop.rating) > 0) ? Number(shop.rating).toFixed(1) : '-',
    image: primaryImage,
    photoPreviewUrl: primaryImage,
    address: shop?.address || '-',
    vipVoucherCount: parseInt(shop?.vipVoucherCount || shop?.vip_voucher_count || 0, 10) || 0,
    shopImages,
    event: eventItem,
  };
}

function dedupeActiveEventsByShop(events) {
  const items = Array.isArray(events) ? [...events] : [];
  items.sort((a, b) => {
    const aTime = new Date(a.updatedAt || a.createdAt || a.startDate || 0).getTime();
    const bTime = new Date(b.updatedAt || b.createdAt || b.startDate || 0).getTime();
    return bTime - aTime;
  });

  const seenShopIds = new Set();
  return items.filter((eventItem) => {
    const currentShopId = String(eventItem.shopId || '');
    if (!currentShopId) return true;
    if (seenShopIds.has(currentShopId)) return false;
    seenShopIds.add(currentShopId);
    return true;
  });
}

// ── 메인 ShopEvents 컴포넌트 (조회 전용) ────────────────────────────────
export default function ShopEvents() {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);

  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, message: "", type: "error" });

  const loadEvents = async () => {
    setLoading(true);
    try {
      const [eventData, shopData] = await Promise.all([
        storageAdapter.getShopEvents({ active: true }),
        storageAdapter.getShops(),
      ]);
      const activeEvents = dedupeActiveEventsByShop(eventData || []);
      const shopMap = new Map((shopData || []).map((shop) => [String(shop.shopId || shop.id || ''), shop]));
      const mapped = activeEvents
        .map((eventItem) => mapShopToCard(shopMap.get(String(eventItem.shopId || '')) || null, eventItem))
        .filter((shop) => !!String(shop.shopId || shop.id || ''));
      setShops(mapped);
    } catch (e) {
      console.error("[ShopEvents] load error:", e);
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const onRefresh = () => loadEvents();
    const onVisibilityChange = () => {
      if (!document.hidden) loadEvents();
    };

    loadEvents();
    window.addEventListener('su:ssot:changed', onRefresh);
    window.addEventListener('storage', onRefresh);
    window.addEventListener('focus', onRefresh);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('su:ssot:changed', onRefresh);
      window.removeEventListener('storage', onRefresh);
      window.removeEventListener('focus', onRefresh);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

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

  return (
    <div className="su-page" style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <PageHeader title="상점 이벤트" onBack={goBack} />

      {/* 상단 배너 */}
      <div className="su-events-hero">
        <div className="su-events-hero__badge">
          🎉 진행 중 이벤트
        </div>
        <div className="su-events-hero__title">
          지금 이벤트 중인 상점
        </div>
        <div className="su-events-hero__desc">
          기간 중인 상점 이벤트만 모아볼 수 있어요
        </div>
      </div>

      {/* 이벤트 목록 */}
      <div style={{ padding: "8px 16px 24px" }}>
        {loading ? (
          <div style={{ display: "grid", gap: 12 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ height: 110, borderRadius: 16, background: "#e2e8f0", animation: `skeleton-pulse 1.6s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>
        ) : uniqueShops.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎪</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>현재 진행 중인 이벤트가 없습니다</div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {uniqueShops.map((shop) => {
              const isVip = shop.vipVoucherCount > 0;
              const cardClass = isVip ? 'su-shop-card--vip' : 'su-shop-card--regular';
              return (
                <button
                  key={shop.event?.eventId || shop.shopId || shop.id}
                  type="button"
                  className={cardClass}
                  style={{ textAlign: 'left' }}
                  onClick={() => navigate(`/shops/${encodeURIComponent(String(shop.id || shop.shopId))}`, { state: { shop } })}
                >
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div className="su-shop-thumb" style={{ '--thumb-bg': catColor(shop.cat) }}>
                      {shop.image ? (
                        <img
                          src={shop.image}
                          alt={shop.name}
                          className="su-shop-thumb__img"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <span className="su-shop-thumb__emoji">{catEmoji(shop.cat)}</span>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span className="su-shop-name">{shop.name}</span>
                        {isVip && <span className="su-vip-badge">🎟️ VIP {shop.vipVoucherCount}장</span>}
                        <span className="shop-event-badge shop-event-badge--pulse">이벤트</span>
                      </div>

                      <div className="su-shop-meta" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>⭐ {shop.score}</span>
                        <span>·</span>
                        <span><span style={{ fontFamily: '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif' }}>{catEmoji(shop.cat)}</span> {catLabel(shop.cat)}</span>
                      </div>

                      {shop.sub && (
                        <div className="su-shop-desc su-shop-card__desc">
                          {shop.sub}
                        </div>
                      )}

                      <div className="su-shop-meta su-shop-card__address">
                        📍 {shop.address || '-'}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {toast.open && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((p) => ({ ...p, open: false }))}
        />
      )}
    </div>
  );
}
