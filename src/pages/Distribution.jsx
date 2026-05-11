import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import Toast from "../components/Toast";
import {
  createSupply,
  createSupplyRequest,
  fetchSupplies,
  getRegions as getRegionsServer,
  getMembers as getMembersServer,
  getPointBalance,
  getSupplyRequests,
  updateSupplyRequest,
} from "../lib/storageAdapter";
import { getAuthInfo, getCurrentRegionId, getSession } from "../lib/authStore";

const CATEGORY_PRESETS = [
  { key: "food", label: "식품", icon: "🍚" },
  { key: "daily", label: "생활용품", icon: "🧻" },
  { key: "health", label: "건강", icon: "💊" },
  { key: "digital", label: "디지털", icon: "📱" },
  { key: "appliance", label: "가전", icon: "🧺" },
  { key: "fashion", label: "패션", icon: "👕" },
  { key: "local-special", label: "지역특산", icon: "🧺" },
  { key: "group-buy", label: "공동구매", icon: "🤝" },
];

const STATUS_META = {
  available: { label: "판매중", tone: "selling" },
  active: { label: "판매중", tone: "selling" },
  pending: { label: "추천", tone: "recommend" },
  scheduled: { label: "신규", tone: "new" },
  soldout: { label: "품절", tone: "soldout" },
};

const ORDER_STATUS_META = {
  ORDERED: "주문완료",
  ADMIN_CONFIRMED: "관리자확인",
  IN_DELIVERY: "배송중",
  PICKUP_READY: "방문준비",
  DELIVERED: "수령완료",
  COMPLETED: "종결",
  CANCELLED: "주문취소",
  RETURN_REQUESTED: "반품요청",
  RETURNED: "반품완료",
};

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function formatPrice(value) {
  return `${toNumber(value, 0).toLocaleString("ko-KR")}P`;
}

function readPointBalance(result) {
  if (result == null) return 0;
  if (typeof result === "number") return toNumber(result, 0);
  if (typeof result.balance !== "undefined") return toNumber(result.balance, 0);
  if (typeof result.point !== "undefined") return toNumber(result.point, 0);
  if (typeof result.points !== "undefined") return toNumber(result.points, 0);
  if (result.data && typeof result.data.balance !== "undefined") {
    return toNumber(result.data.balance, 0);
  }
  return 0;
}

function normalizeSupply(raw, memberById, regionNameById) {
  const id = String(raw?.id || raw?.supplyId || raw?.supply_id || "").trim();
  const createdBy = String(raw?.createdBy || raw?.created_by || raw?.managerId || "").trim();
  const uploadMeta = typeof raw?.uploadMeta === "string"
    ? (() => {
        try {
          return JSON.parse(raw.uploadMeta);
        } catch {
          return {};
        }
      })()
    : (raw?.uploadMeta || raw?.upload_meta || {});

  const seller = createdBy ? memberById.get(createdBy) : null;
  const status = String(raw?.status || "available").toLowerCase();
  const type = String(raw?.type || raw?.category || "daily").toLowerCase();
  const regionId = String(raw?.regionId || raw?.region_id || "").trim();

  return {
    id,
    title: String(raw?.title || raw?.itemName || raw?.name || "상품명 미등록"),
    description: String(raw?.description || raw?.details || ""),
    category: type,
    price: toNumber(raw?.price ?? uploadMeta?.price, 0),
    quantity: Math.max(0, toNumber(raw?.quantity, 0)),
    imageUrl: raw?.imageUrl || raw?.image_url || uploadMeta?.image || "",
    extraImageUrls: (() => {
      const urls = uploadMeta?.extraImageUrls || uploadMeta?.extraImageUrl;
      if (Array.isArray(urls)) return urls.filter(Boolean);
      if (typeof urls === 'string' && urls.trim()) return [urls.trim()];
      return [];
    })(),
    videoUrl: String(uploadMeta?.videoUrl || "").trim(),
    pdfUrl: String(uploadMeta?.pdfUrl || "").trim(),
    status,
    regionId,
    regionName: String(raw?.regionName || raw?.region_name || regionNameById.get(regionId) || "").trim(),
    receiveMethod: String(uploadMeta?.receiveMethod || "delivery").trim().toLowerCase(),
    createdBy,
    sellerName: seller?.name || seller?.nickname || uploadMeta?.manager || createdBy || "판매자",
    createdAt: raw?.createdAt || raw?.created_at || "",
    contact: seller?.phone || seller?.email || uploadMeta?.contact || "",
  };
}

function getStatusLabel(status) {
  const meta = STATUS_META[String(status || "").toLowerCase()];
  return meta || { label: "판매중", tone: "selling" };
}

function buildCategoryTabs(products) {
  const set = new Set(CATEGORY_PRESETS.map((v) => v.key));
  products.forEach((item) => {
    const key = String(item.category || "").trim().toLowerCase();
    if (key) set.add(key);
  });

  const dynamic = Array.from(set)
    .filter((key) => !CATEGORY_PRESETS.some((preset) => preset.key === key))
    .map((key) => ({ key, label: key, icon: "📦" }));

  return [{ key: "all", label: "전체", icon: "✨" }, ...CATEGORY_PRESETS, ...dynamic];
}

function ProductCard({ product, quantity, onQuantityChange, onOpenDetail, onPointBuy, onAddToCart, inCart }) {
  const status = getStatusLabel(product.status);
  const isSoldOut = status.tone === "soldout" || product.quantity <= 0;
  const cardToneClass = isSoldOut ? "su-market-card--soldout" : "";

  return (
    <article className={`su-market-card ${cardToneClass}`}>
      <button type="button" className="su-market-cardMedia" onClick={() => onOpenDetail(product.id)}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.title} loading="lazy" />
        ) : (
          <div className="su-market-placeholder">NO IMAGE</div>
        )}
        <span className={`su-market-status su-market-status--${status.tone}`}>{status.label}</span>
      </button>

      <button type="button" className="su-market-cardBody" onClick={() => onOpenDetail(product.id)} style={{ cursor: 'pointer', width: '100%', textAlign: 'left', border: 'none', background: 'transparent' }}>
        <div className="su-market-title">{product.title}</div>
        <p className="su-market-desc">{product.description || "상품 설명이 준비중입니다."}</p>
        <div className="su-market-price">{formatPrice(product.price)}</div>
      </button>
    </article>
  );
}

function ProductMiniRail({ title, items, onOpenDetail }) {
  if (!items.length) return null;
  return (
    <section className="su-market-section">
      <div className="su-market-sectionTitle">{title}</div>
      <div className="su-market-rail">
        {items.map((item) => (
          <button key={`${title}-${item.id}`} type="button" className="su-market-railCard" onClick={() => onOpenDetail(item.id)}>
            <div className="su-market-railThumb">
              {item.imageUrl ? <img src={item.imageUrl} alt={item.title} loading="lazy" /> : <span>상품</span>}
            </div>
            <div className="su-market-railName">{item.title}</div>
            <div className="su-market-railPrice">{formatPrice(item.price)}</div>
          </button>
        ))}
      </div>
    </section>
  );
}

function SellerPanel({
  sellerTab,
  setSellerTab,
  form,
  setForm,
  onSubmit,
  myProducts,
  onOpenDetail,
}) {
  return (
    <section className="su-market-sellerPanel">
      <div className="su-market-sellerTabs">
        <button type="button" className={sellerTab === "create" ? "is-active" : ""} onClick={() => setSellerTab("create")}>상품 등록</button>
        <button type="button" className={sellerTab === "mine" ? "is-active" : ""} onClick={() => setSellerTab("mine")}>내 상품관리</button>
        <button type="button" className={sellerTab === "sales" ? "is-active" : ""} onClick={() => setSellerTab("sales")}>판매내역</button>
      </div>

      {sellerTab === "create" && (
        <form className="su-market-form" onSubmit={onSubmit}>
          <input
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="상품명"
            required
          />
          <textarea
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="간단 설명"
            rows={3}
          />
          <div className="su-market-formGrid">
            <select value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}>
              {CATEGORY_PRESETS.map((category) => (
                <option key={category.key} value={category.key}>{category.label}</option>
              ))}
            </select>
            <select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}>
              <option value="available">판매중</option>
              <option value="pending">추천</option>
              <option value="scheduled">신규 예정</option>
              <option value="soldout">품절</option>
            </select>
          </div>
          <div className="su-market-formGrid">
            <input
              value={form.price}
              onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
              placeholder="가격(포인트)"
              inputMode="numeric"
            />
            <input
              value={form.quantity}
              onChange={(event) => setForm((prev) => ({ ...prev, quantity: event.target.value }))}
              placeholder="재고수량"
              inputMode="numeric"
            />
          </div>
          <input
            value={form.imageUrl}
            onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
            placeholder="이미지 URL"
          />
          <button type="submit" className="su-btn su-btn--point">상품 등록하기</button>
        </form>
      )}

      {sellerTab === "mine" && (
        <div className="su-market-sellerList">
          {myProducts.length === 0 ? <div className="su-market-empty">등록한 상품이 없습니다.</div> : null}
          {myProducts.map((item) => (
            <button key={item.id} type="button" className="su-market-sellerItem" onClick={() => onOpenDetail(item.id)}>
              <div>
                <strong>{item.title}</strong>
                <div>{formatPrice(item.price)} · 재고 {item.quantity}</div>
              </div>
              <span>{getStatusLabel(item.status).label}</span>
            </button>
          ))}
        </div>
      )}

      {sellerTab === "sales" && (
        <div className="su-market-empty">판매내역은 추후 상세 연동 예정입니다.</div>
      )}
    </section>
  );
}

export default function Distribution({ initialView = "market" }) {
  const navigate = useNavigate();
  const { id: rawSupportId } = useParams();
  const supportId = rawSupportId && rawSupportId !== "seller" ? rawSupportId : "";

  const auth = getAuthInfo() || getSession() || {};
  const memberId = String(auth?.id || auth?.memberId || "").trim();
  const memberName = String(auth?.name || "회원").trim();
  const memberPhone = String(auth?.phone || "").trim();
  const selectedRegionId = auth?.regionId || getCurrentRegionId() || "";
  const isDistributionManager = !!auth?.distributionManager;
  const isLoggedIn = !!memberId;

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [pointBalance, setPointBalance] = useState(0);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [quantityMap, setQuantityMap] = useState({});
  const [marketTab, setMarketTab] = useState("market");
  const [orderTab, setOrderTab] = useState("orders");
  const [sellerTab, setSellerTab] = useState("create");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "food",
    status: "available",
    price: "",
    quantity: "1",
    imageUrl: "",
  });
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutContext, setCheckoutContext] = useState(null);
  const [checkoutForm, setCheckoutForm] = useState({
    address: "",
    visitNote: "",
    buyerName: "",
    buyerPhone: "",
  });
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [bulkCheckoutOpen, setBulkCheckoutOpen] = useState(false);
  const [bulkCheckoutForm, setBulkCheckoutForm] = useState({ address: "", visitNote: "", buyerName: "", buyerPhone: "" });
  const [bulkCheckoutSubmitting, setBulkCheckoutSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false, lines: [], onConfirm: null });
  const [alertModal, setAlertModal] = useState({ open: false, title: "", message: "", tone: "warning" });
  const confirmResolveRef = useRef(null);

  const showConfirm = (lines) => {
    return new Promise((resolve) => {
      confirmResolveRef.current = resolve;
      setConfirmModal({ open: true, lines: Array.isArray(lines) ? lines : [lines], onConfirm: null });
    });
  };

  const handleConfirmYes = () => {
    setConfirmModal({ open: false, lines: [], onConfirm: null });
    if (confirmResolveRef.current) { confirmResolveRef.current(true); confirmResolveRef.current = null; }
  };

  const handleConfirmNo = () => {
    setConfirmModal({ open: false, lines: [], onConfirm: null });
    if (confirmResolveRef.current) { confirmResolveRef.current(false); confirmResolveRef.current = null; }
  };

  const showToast = (message, type = "success") => {
    setToast({ open: true, message, type });
  };

  const showAlertModal = (message, title = "안내", tone = "warning") => {
    setAlertModal({ open: true, title, message, tone });
  };

  const closeAlertModal = () => {
    setAlertModal((prev) => ({ ...prev, open: false }));
  };

  const alertModalNode = alertModal.open ? (
    <div className="su-market-overlay su-market-overlay--alert" onClick={closeAlertModal}>
      <div className="su-market-alertModal" onClick={(event) => event.stopPropagation()}>
        <div className="su-market-alertTitle">{alertModal.title || "안내"}</div>
        <div className={`su-market-alertMessage ${alertModal.tone === "success" ? "is-success" : "is-warning"}`}>{alertModal.message}</div>
        <button type="button" className="su-market-alertBtn" onClick={closeAlertModal}>확인</button>
      </div>
    </div>
  ) : null;

  const loadAll = async () => {
    setLoading(true);
    try {
      const [supplies, members, requests, regions] = await Promise.all([
        fetchSupplies(),
        getMembersServer().catch(() => []),
        isLoggedIn ? getSupplyRequests({ requesterId: memberId, requestType: "distribution" }).catch(() => []) : Promise.resolve([]),
        getRegionsServer().catch(() => []),
      ]);

      const memberById = new Map(
        (Array.isArray(members) ? members : []).map((member) => [
          String(member.id || member.memberId || "").trim(),
          member,
        ])
      );

      const regionNameById = new Map(
        (Array.isArray(regions) ? regions : []).map((region) => [
          String(region.id || region.regionId || region.region_id || "").trim(),
          String(region.name || region.region_name || region.title || "").trim(),
        ])
      );

      const normalized = (Array.isArray(supplies) ? supplies : [])
        .map((item) => normalizeSupply(item, memberById, regionNameById))
        .filter((item) => item.id)
        .filter((item) => String(item.status || "").toLowerCase() !== "deleted")
        .filter((item) => String(item.category || "") !== "request");

      setProducts(normalized);
      setMyRequests(Array.isArray(requests) ? requests : []);
    } catch (error) {
      console.error("[Support] loadAll error:", error);
      showToast("유통지원 데이터를 불러오지 못했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadPoint = async () => {
    if (!isLoggedIn) {
      setPointBalance(0);
      return;
    }
    try {
      const result = await getPointBalance(memberId);
      setPointBalance(readPointBalance(result));
    } catch (error) {
      console.error("[Support] loadPoint error:", error);
      setPointBalance(0);
    }
  };

  useEffect(() => {
    loadAll();
    loadPoint();

    const syncHandler = () => {
      loadAll();
      loadPoint();
    };
    window.addEventListener("su:ssot:changed", syncHandler);
    return () => {
      window.removeEventListener("su:ssot:changed", syncHandler);
    };
  }, []);

  const categoryTabs = useMemo(() => buildCategoryTabs(products), [products]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return products
      .filter((item) => (activeCategory === "all" ? true : item.category === activeCategory))
      .filter((item) => {
        if (!query) return true;
        return (
          String(item.title || "").toLowerCase().includes(query) ||
          String(item.description || "").toLowerCase().includes(query) ||
          String(item.sellerName || "").toLowerCase().includes(query)
        );
      });
  }, [products, activeCategory, searchQuery]);

  const selectedProduct = useMemo(() => {
    if (!supportId) return null;
    return products.find((item) => item.id === supportId) || null;
  }, [products, supportId]);

  const regionalRecommended = useMemo(
    () => filteredProducts.filter((item) => selectedRegionId && item.regionId === selectedRegionId).slice(0, 8),
    [filteredProducts, selectedRegionId]
  );

  const popularProducts = useMemo(
    () => [...filteredProducts].sort((a, b) => b.quantity - a.quantity).slice(0, 8),
    [filteredProducts]
  );

  const pointSpecial = useMemo(
    () => [...filteredProducts].filter((item) => item.price > 0).sort((a, b) => a.price - b.price).slice(0, 8),
    [filteredProducts]
  );

  const newProducts = useMemo(
    () => [...filteredProducts].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 8),
    [filteredProducts]
  );

  const myProducts = useMemo(
    () => products.filter((item) => item.createdBy && item.createdBy === memberId),
    [products, memberId]
  );

  const getQuantity = (productId) => {
    const current = toNumber(quantityMap[productId], 1);
    return current > 0 ? current : 1;
  };

  const handleQuantityChange = (productId, value) => {
    const next = Math.max(1, Math.trunc(toNumber(value, 1)));
    setQuantityMap((prev) => ({ ...prev, [productId]: next }));
  };

  const handleOpenDetail = (productId) => {
    navigate(`/distribution/${encodeURIComponent(productId)}`);
  };

  const handleCardBuy = () => {
    showToast("카드결제 기능은 추후 오픈예정입니다.", "warning");
  };

  const getReceiveMethodLabel = (method) => {
    const normalized = String(method || "delivery").toLowerCase();
    if (normalized === "pickup") return "방문";
    if (normalized === "online") return "온라인";
    return "택배";
  };

  const handleAddToCart = (product) => {
    if (!isLoggedIn) {
      showAlertModal("로그인이 필요합니다.", "로그인 필요");
      return;
    }

    const quantity = getQuantity(product.id);
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) => item.product.id === product.id ? { ...item, quantity: Math.max(1, quantity) } : item);
      }
      return [...prev, { product, quantity: Math.max(1, quantity) }];
    });
    showToast("장바구니에 담았습니다.", "success");
    setCartOpen(true);
  };

  const openCheckout = (product, quantity, source = "direct") => {
    const safeQty = Math.max(1, Math.trunc(toNumber(quantity, 1)));
    setCheckoutContext({ product, quantity: safeQty, source });
    setCheckoutForm({ address: "", visitNote: "", buyerName: "", buyerPhone: "" });
    setCheckoutOpen(true);
  };

  const handlePointBuy = (product) => {
    if (!isLoggedIn) {
      showAlertModal("로그인이 필요합니다.", "로그인 필요");
      return;
    }
    openCheckout(product, getQuantity(product.id), "direct");
  };

  const handleCartCheckout = (cartItem) => {
    if (!cartItem?.product) return;
    openCheckout(cartItem.product, cartItem.quantity, "cart");
  };

  const removeCartItem = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleConfirmCheckout = async () => {
    if (!checkoutContext?.product) return;

    const product = checkoutContext.product;
    const quantity = Math.max(1, Math.trunc(toNumber(checkoutContext.quantity, 1)));
    const unitPrice = Math.max(0, toNumber(product.price, 0));
    const totalPrice = unitPrice * quantity;
    const receiveMethod = String(product.receiveMethod || "delivery").toLowerCase();

    if (unitPrice <= 0) {
      showAlertModal("포인트 결제 금액이 설정되지 않은 상품입니다.", "결제 안내");
      return;
    }

    if (pointBalance < totalPrice) {
      showAlertModal("포인트가 부족합니다. 포인트 충전 후 다시 시도해 주세요.", "결제 안내");
      return;
    }

    const address = String(checkoutForm.address || "").trim();
    const visitNote = String(checkoutForm.visitNote || "").trim();
    const buyerName = String(checkoutForm.buyerName || "").trim();
    const buyerPhone = String(checkoutForm.buyerPhone || "").trim();

    if (!buyerName) {
      showAlertModal("구매자 이름을 입력해 주세요.", "입력 안내");
      return;
    }

    if (!buyerPhone) {
      showAlertModal("전화번호를 입력해 주세요.", "입력 안내");
      return;
    }

    if (receiveMethod === "delivery" && !address) {
      showAlertModal("택배 수령은 배송 주소를 입력해 주세요.", "입력 안내");
      return;
    }

    if (receiveMethod === "pickup" && !visitNote) {
      showAlertModal("방문 수령 정보(요청사항/시간)를 입력해 주세요.", "입력 안내");
      return;
    }

    const confirmLines = [
      `상품: ${product.title}`,
      `수량: ${quantity}`,
      `결제 포인트: ${totalPrice.toLocaleString("ko-KR")}P`,
      `구매자: ${buyerName} / ${buyerPhone}`,
      `수령 방식: ${getReceiveMethodLabel(receiveMethod)}`,
      receiveMethod === "delivery" ? `배송 주소: ${address}` : null,
      receiveMethod === "pickup" ? `방문 정보: ${visitNote}` : null,
    ].filter(Boolean);

    setCheckoutOpen(false);
    const confirmed = await showConfirm(confirmLines);
    if (!confirmed) { setCheckoutOpen(true); return; }

    setCheckoutSubmitting(true);
    try {
      const paymentReferenceId = `DIST_ORDER_${product.id}_${Date.now()}`;
      const requestMessageParts = [
        `포인트 결제 주문 · ${totalPrice}P`,
        `수령방식:${getReceiveMethodLabel(receiveMethod)}`,
      ];
      if (address) requestMessageParts.push(`배송지:${address}`);
      if (visitNote) requestMessageParts.push(`방문:${visitNote}`);

      await createSupplyRequest({
        supplyItemId: String(product.id),
        requesterId: memberId,
        requesterName: buyerName,
        requesterContact: buyerPhone,
        quantity,
        requestType: "distribution",
        orderStatus: "ORDERED",
        receiveMethod,
        paymentReferenceId,
        paymentAmount: totalPrice,
        message: requestMessageParts.join(" | "),
      });

      if (checkoutContext.source === "cart") {
        removeCartItem(product.id);
      }
      setCheckoutOpen(false);
      showAlertModal(`결제가 완료되었습니다. (${totalPrice.toLocaleString("ko-KR")}P)`, "결제 완료", "success");
      await Promise.all([loadPoint(), loadAll()]);
      window.dispatchEvent(new CustomEvent("su:ssot:changed", { detail: { type: "supplies", operation: "purchase" } }));
    } catch (error) {
      console.error("[Support] point purchase error:", error);
      showToast(error?.message || "포인트 결제 처리 중 오류가 발생했습니다.", "error");
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  const getOrderStatusLabel = (request) => {
    const key = String(request?.orderStatus || request?.order_status || request?.status || "ORDERED").toUpperCase();
    return ORDER_STATUS_META[key] || key;
  };

  const parseOrderMessageMeta = (message) => {
    const raw = String(message || "");
    const addressMatch = raw.match(/배송지:([^|]+)/);
    const visitMatch = raw.match(/방문:([^|]+)/);
    const methodMatch = raw.match(/수령방식:([^|]+)/);
    return {
      address: addressMatch ? String(addressMatch[1]).trim() : "",
      visit: visitMatch ? String(visitMatch[1]).trim() : "",
      method: methodMatch ? String(methodMatch[1]).trim() : "",
    };
  };

  const filteredOrderRequests = useMemo(() => {
    const source = Array.isArray(myRequests) ? myRequests : [];
    if (orderTab === "orders") {
      return source.filter((request) => {
        const status = String(request?.orderStatus || request?.order_status || request?.status || "ORDERED").toUpperCase();
        return !["CANCELLED", "RETURN_REQUESTED", "RETURNED"].includes(status);
      });
    }
    if (orderTab === "cancel") {
      return source.filter((request) => String(request?.orderStatus || request?.order_status || "").toUpperCase() === "CANCELLED");
    }
    return source.filter((request) => ["RETURN_REQUESTED", "RETURNED"].includes(String(request?.orderStatus || request?.order_status || "").toUpperCase()));
  }, [myRequests, orderTab]);

  const handleBulkCheckout = async () => {
    if (cartItems.length === 0) return;
    const hasDelivery = cartItems.some((c) => String(c.product.receiveMethod || 'delivery').toLowerCase() === 'delivery');
    const hasPickup = cartItems.some((c) => String(c.product.receiveMethod || 'delivery').toLowerCase() === 'pickup');
    const address = String(bulkCheckoutForm.address || '').trim();
    const visitNote = String(bulkCheckoutForm.visitNote || '').trim();
    const buyerName = String(bulkCheckoutForm.buyerName || '').trim();
    const buyerPhone = String(bulkCheckoutForm.buyerPhone || '').trim();
    if (!buyerName) { showAlertModal('구매자 이름을 입력해 주세요.', '입력 안내'); return; }
    if (!buyerPhone) { showAlertModal('전화번호를 입력해 주세요.', '입력 안내'); return; }
    if (hasDelivery && !address) { showAlertModal('택배 상품이 포함되어 있습니다. 배송 주소를 입력하세요.', '입력 안내'); return; }
    if (hasPickup && !visitNote) { showAlertModal('방문 상품이 포함되어 있습니다. 방문 정보를 입력하세요.', '입력 안내'); return; }
    const totalAll = cartItems.reduce((sum, c) => sum + toNumber(c.product.price, 0) * Math.max(1, c.quantity), 0);
    if (pointBalance < totalAll) { showAlertModal('포인트가 부족합니다.', '결제 안내'); return; }
    setBulkCheckoutOpen(false);
    const bulkConfirmed = await showConfirm([`장바구니 상품 ${cartItems.length}종`, `총 ${totalAll.toLocaleString('ko-KR')}P`, '일괄결제를 진행하시겠습니까?']);
    if (!bulkConfirmed) { setBulkCheckoutOpen(true); return; }
    setBulkCheckoutSubmitting(true);
    let successCount = 0;
    let failCount = 0;
    for (const cartItem of cartItems) {
      const product = cartItem.product;
      const qty = Math.max(1, Math.trunc(toNumber(cartItem.quantity, 1)));
      const unitPrice = Math.max(0, toNumber(product.price, 0));
      const totalPrice = unitPrice * qty;
      if (unitPrice <= 0) { failCount++; continue; }
      const receiveMethod = String(product.receiveMethod || 'delivery').toLowerCase();
      const paymentReferenceId = `DIST_ORDER_${product.id}_${Date.now()}`;
      const msgParts = [`포인트 결제 주문 · ${totalPrice}P`, `수령방식:${getReceiveMethodLabel(receiveMethod)}`];
      if (receiveMethod === 'delivery' && address) msgParts.push(`배송지:${address}`);
      if (receiveMethod === 'pickup' && visitNote) msgParts.push(`방문:${visitNote}`);
      try {
        await createSupplyRequest({
          supplyItemId: String(product.id),
          requesterId: memberId,
          requesterName: buyerName,
          requesterContact: buyerPhone,
          quantity: qty,
          requestType: 'distribution',
          orderStatus: 'ORDERED',
          receiveMethod,
          paymentReferenceId,
          paymentAmount: totalPrice,
          message: msgParts.join(' | '),
        });
        successCount++;
      } catch (e) {
        console.error('[BulkCheckout] 실패:', product.title, e);
        failCount++;
      }
    }
    setBulkCheckoutSubmitting(false);
    setBulkCheckoutOpen(false);
    setCartOpen(false);
    if (successCount > 0) {
      setCartItems([]);
      showAlertModal(`${successCount}종 결제 완료입니다.${failCount > 0 ? ` (${failCount}종 실패)` : ''}`, '결제 완료', 'success');
    } else {
      showToast('일괄결제에 실패했습니다. 다시 시도해 주세요.', 'error');
    }
    await Promise.all([loadPoint(), loadAll()]);
    window.dispatchEvent(new CustomEvent('su:ssot:changed', { detail: { type: 'supplies', operation: 'purchase' } }));
  };

  const patchOrderStatus = async (request, updates, successMessage) => {
    const requestId = request?.id || request?.requestId;
    if (!requestId) return;
    try {
      await updateSupplyRequest(requestId, updates);
      showToast(successMessage, "success");
      await loadAll();
      await loadPoint();
      window.dispatchEvent(new CustomEvent("su:ssot:changed", { detail: { type: "supplies", operation: "order-status" } }));
    } catch (error) {
      showToast(error?.message || "주문 상태 변경 중 오류가 발생했습니다.", "error");
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    if (!isDistributionManager) {
      showToast("상품 등록 권한이 없습니다.", "error");
      return;
    }

    const title = String(form.title || "").trim();
    const price = Math.max(0, Math.trunc(toNumber(form.price, 0)));
    const quantity = Math.max(0, Math.trunc(toNumber(form.quantity, 0)));

    if (!title) {
      showToast("상품명을 입력해 주세요.", "error");
      return;
    }

    try {
      await createSupply({
        title,
        description: String(form.description || "").trim(),
        type: String(form.category || "daily").trim(),
        status: String(form.status || "available").trim(),
        price,
        quantity,
        imageUrl: String(form.imageUrl || "").trim() || null,
        regionId: selectedRegionId || null,
        createdBy: memberId || null,
      });

      showToast("상품이 등록되었습니다.", "success");
      setForm({
        title: "",
        description: "",
        category: "food",
        status: "available",
        price: "",
        quantity: "1",
        imageUrl: "",
      });
      setSellerTab("mine");
      await loadAll();
      window.dispatchEvent(new CustomEvent("su:ssot:changed", { detail: { type: "supplies", operation: "upsert" } }));
    } catch (error) {
      console.error("[Support] create supply error:", error);
      showToast(error?.message || "상품 등록 중 오류가 발생했습니다.", "error");
    }
  };

  if (supportId) {
    return (
      <div className="su-page su-support-market">
        <style>{SUPPORT_MARKET_CSS}</style>
        <Toast
          open={toast.open}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          duration={2200}
        />
        {alertModalNode}
        <PageHeader title="유통지원 상품상세" onBack={() => navigate("/distribution")} />

        {loading ? <div className="su-market-empty">상품 정보를 불러오는 중입니다...</div> : null}

        {!loading && !selectedProduct ? (
          <div className="su-market-empty">존재하지 않는 상품입니다.</div>
        ) : null}

        {!loading && selectedProduct ? (
          <section className="su-market-detail">
            <div className="su-market-detailHero">
              {selectedProduct.imageUrl ? (
                <img src={selectedProduct.imageUrl} alt={selectedProduct.title} />
              ) : (
                <div className="su-market-placeholder">NO IMAGE</div>
              )}
            </div>

            <div className="su-market-detailBody">
              <h1>{selectedProduct.title}</h1>
              <div className="su-market-detailMeta">
                판매자 {selectedProduct.sellerName} · {selectedProduct.regionName || selectedProduct.regionId || "지역공유"}
              </div>
              <div className="su-market-detailPrice">{formatPrice(selectedProduct.price)}</div>

              <div className="su-market-detailQty">
                <span>수량 선택</span>
                <div className="su-market-qtyStepper">
                  <button
                    type="button"
                    className="su-market-qtyBtn"
                    onClick={() => handleQuantityChange(selectedProduct.id, getQuantity(selectedProduct.id) - 1)}
                    disabled={getQuantity(selectedProduct.id) <= 1}
                  >−</button>
                  <span className="su-market-qtyVal">{getQuantity(selectedProduct.id)}</span>
                  <button
                    type="button"
                    className="su-market-qtyBtn"
                    onClick={() => handleQuantityChange(selectedProduct.id, getQuantity(selectedProduct.id) + 1)}
                    disabled={getQuantity(selectedProduct.id) >= Math.max(selectedProduct.quantity || 99, 1)}
                  >+</button>
                </div>
              </div>

              <div className="su-market-detailButtons">
                <button
                  type="button"
                  className="su-btn su-btn--point"
                  onClick={() => handlePointBuy(selectedProduct)}
                >
                  포인트로 구매
                </button>
                <button
                  type="button"
                  onClick={() => handleAddToCart(selectedProduct)}
                  style={cartItems.some((c) => c.product.id === selectedProduct.id) ? { background: '#0f766e', color: '#fff', border: '1.5px solid #0f766e' } : {}}
                  className={cartItems.some((c) => c.product.id === selectedProduct.id) ? 'su-btn' : 'su-btn su-btn--card'}
                >
                  {cartItems.some((c) => c.product.id === selectedProduct.id) ? '🛒 장바구니보기' : '장바구니담기'}
                </button>
              </div>

              <div className="su-market-highlight su-market-highlight--point">
                <strong>포인트 결제 가능</strong>
                <span>보유 포인트: {pointBalance.toLocaleString("ko-KR")}P</span>
              </div>

              <button type="button" className="su-market-highlight su-market-highlight--card" onClick={handleCardBuy}>
                카드결제는 추후 오픈예정입니다.
              </button>

              {selectedProduct.extraImageUrls?.length > 0 && (
                <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                  {selectedProduct.extraImageUrls.map((url, idx) => (
                    <img key={idx} src={url} alt={`추가 이미지 ${idx + 1}`} style={{ width: '100%', borderRadius: 8, objectFit: 'cover' }} />
                  ))}
                </div>
              )}

              <p className="su-market-detailDesc">
                {selectedProduct.description || "상품 설명이 준비중입니다."}
              </p>

              {selectedProduct.pdfUrl && (
                <a href={selectedProduct.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', marginTop: 8, borderRadius: 8, background: '#EFF6FF', color: '#1D4ED8', fontWeight: 700, fontSize: 13, textDecoration: 'none', border: '1px solid #BFDBFE' }}>
                  📄 상세정보 PDF 보기
                </a>
              )}

              {selectedProduct.videoUrl && (
                <div style={{ marginTop: 12 }}>
                  <a href={selectedProduct.videoUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: '#FEF2F2', color: '#dc2626', fontWeight: 700, fontSize: 13, textDecoration: 'none', border: '1px solid #FECACA' }}>
                    🎬 상품 영상 보기
                  </a>
                </div>
              )}
            </div>

            <div className="su-market-related">
              <h3>같은 판매자 추천 상품</h3>
              <div className="su-market-relatedGrid">
                {products
                  .filter((item) => item.id !== selectedProduct.id && item.createdBy === selectedProduct.createdBy)
                  .slice(0, 4)
                  .map((item) => (
                    <button key={item.id} type="button" className="su-market-relatedCard" onClick={() => handleOpenDetail(item.id)}>
                      <span>{item.title}</span>
                      <strong>{formatPrice(item.price)}</strong>
                    </button>
                  ))}
              </div>
            </div>
          </section>
        ) : null}

      {cartOpen ? (
        <div className="su-market-overlay" onClick={() => setCartOpen(false)}>
          <div className="su-market-modal" onClick={(event) => event.stopPropagation()}>
            <div className="su-market-modalTitle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>장바구니</span>
              <button type="button" onClick={() => { setCartOpen(false); navigate('/distribution'); }} style={{ fontSize: 12, background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: 6, padding: '4px 10px', fontWeight: 700, cursor: 'pointer' }}>+ 더담기</button>
            </div>
            {cartItems.length === 0 ? (
              <div className="su-market-empty">장바구니가 비어 있습니다.</div>
            ) : (
              <>
                <div className="su-market-cartList">
                  {cartItems.map((cartItem) => (
                    <article key={cartItem.product.id} className="su-market-orderItem">
                      <div>
                        <strong>{cartItem.product.title}</strong>
                        <p>{formatPrice(cartItem.product.price)} × {cartItem.quantity}</p>
                        <p>수령: {getReceiveMethodLabel(cartItem.product.receiveMethod)}</p>
                      </div>
                      <div className="su-market-cartActions">
                        <button type="button" className="su-btn su-btn--point" onClick={() => handleCartCheckout(cartItem)}>포인트구매</button>
                        <button type="button" className="su-btn su-btn--card" onClick={() => removeCartItem(cartItem.product.id)}>삭제</button>
                      </div>
                    </article>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid #DDE3EA', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>총 {cartItems.reduce((s, c) => s + toNumber(c.product.price, 0) * Math.max(1, c.quantity), 0).toLocaleString('ko-KR')}P</div>
                  <button type="button" className="su-btn su-btn--point" style={{ fontWeight: 800, minWidth: 90 }} onClick={() => { setBulkCheckoutForm({ address: '', visitNote: '', buyerName: '', buyerPhone: '' }); setBulkCheckoutOpen(true); }}>🛍 일괄구매</button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      {confirmModal.open ? (
        <div className="su-market-overlay" onClick={handleConfirmNo}>
          <div className="su-market-confirmModal" onClick={(e) => e.stopPropagation()}>
            <div className="su-market-confirmTitle">결제 확인</div>
            <div className="su-market-confirmBody">
              {confirmModal.lines.map((line, i) => (
                <div key={i} className="su-market-confirmLine">{line}</div>
              ))}
            </div>
            <div className="su-market-confirmActions">
              <button type="button" className="su-market-confirmBtn su-market-confirmBtn--cancel" onClick={handleConfirmNo}>취소</button>
              <button type="button" className="su-market-confirmBtn su-market-confirmBtn--ok" onClick={handleConfirmYes}>결제하기</button>
            </div>
          </div>
        </div>
      ) : null}

      {bulkCheckoutOpen ? (
        <div className="su-market-overlay" onClick={() => !bulkCheckoutSubmitting && setBulkCheckoutOpen(false)}>
          <div className="su-market-modal" onClick={(event) => event.stopPropagation()}>
            <div className="su-market-modalTitle">일괄 결제</div>
            <div className="su-market-checkoutSummary">
              {cartItems.map((c) => (
                <div key={c.product.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '2px 0' }}>
                  <span>{c.product.title} × {c.quantity}</span>
                  <strong>{(toNumber(c.product.price, 0) * Math.max(1, c.quantity)).toLocaleString('ko-KR')}P</strong>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #DDE3EA', marginTop: 6, paddingTop: 6, display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                <span>전체 합계</span>
                <span>{cartItems.reduce((s, c) => s + toNumber(c.product.price, 0) * Math.max(1, c.quantity), 0).toLocaleString('ko-KR')}P</span>
              </div>
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>보유 포인트: {pointBalance.toLocaleString('ko-KR')}P</div>
            </div>
            <input className="su-input" placeholder="구매자 이름" value={bulkCheckoutForm.buyerName} onChange={(e) => setBulkCheckoutForm((p) => ({ ...p, buyerName: e.target.value }))} />
            <input className="su-input" placeholder="전화번호" value={bulkCheckoutForm.buyerPhone} onChange={(e) => setBulkCheckoutForm((p) => ({ ...p, buyerPhone: e.target.value }))} />
            {cartItems.some((c) => String(c.product.receiveMethod || 'delivery').toLowerCase() === 'delivery') && (
              <input className="su-input" placeholder="배송 주소 (택배 상품 공통)" value={bulkCheckoutForm.address} onChange={(e) => setBulkCheckoutForm((p) => ({ ...p, address: e.target.value }))} />
            )}
            {cartItems.some((c) => String(c.product.receiveMethod || 'delivery').toLowerCase() === 'pickup') && (
              <input className="su-input" placeholder="방문 정보 (방문 상품 공통)" value={bulkCheckoutForm.visitNote} onChange={(e) => setBulkCheckoutForm((p) => ({ ...p, visitNote: e.target.value }))} />
            )}
            <div className="su-market-checkoutButtons">
              <button type="button" className="su-btn su-btn--card" disabled={bulkCheckoutSubmitting} onClick={() => setBulkCheckoutOpen(false)}>취소</button>
              <button type="button" className="su-btn su-btn--point" disabled={bulkCheckoutSubmitting} onClick={handleBulkCheckout} style={{ fontWeight: 800 }}>{bulkCheckoutSubmitting ? '결제 중...' : '일괄 결제'}</button>
            </div>
          </div>
        </div>
      ) : null}

      {checkoutOpen && checkoutContext?.product ? (
        <div className="su-market-overlay" onClick={() => !checkoutSubmitting && setCheckoutOpen(false)}>
          <div className="su-market-modal" onClick={(event) => event.stopPropagation()}>
            <div className="su-market-modalTitle">포인트 결제 정보 입력</div>
            <div className="su-market-checkoutSummary">
              <div>상품: <strong>{checkoutContext.product.title}</strong></div>
              <div>수량: <strong>{checkoutContext.quantity}</strong></div>
              <div>결제 포인트: <strong>{formatPrice(checkoutContext.product.price * checkoutContext.quantity)}</strong></div>
              <div>수령 방식: <strong>{getReceiveMethodLabel(checkoutContext.product.receiveMethod)}</strong></div>
            </div>
            <input
              className="su-input"
              placeholder="구매자 이름"
              value={checkoutForm.buyerName}
              onChange={(event) => setCheckoutForm((prev) => ({ ...prev, buyerName: event.target.value }))}
            />
            <input
              className="su-input"
              placeholder="전화번호"
              value={checkoutForm.buyerPhone}
              onChange={(event) => setCheckoutForm((prev) => ({ ...prev, buyerPhone: event.target.value }))}
            />
            {String(checkoutContext.product.receiveMethod || "delivery").toLowerCase() === "delivery" ? (
              <input
                className="su-input"
                placeholder="배송 주소 입력"
                value={checkoutForm.address}
                onChange={(event) => setCheckoutForm((prev) => ({ ...prev, address: event.target.value }))}
              />
            ) : null}
            {String(checkoutContext.product.receiveMethod || "delivery").toLowerCase() === "pickup" ? (
              <input
                className="su-input"
                placeholder="방문 정보 입력 (예: 방문일/요청사항)"
                value={checkoutForm.visitNote}
                onChange={(event) => setCheckoutForm((prev) => ({ ...prev, visitNote: event.target.value }))}
              />
            ) : null}
            <div className="su-market-checkoutButtons">
              <button type="button" className="su-btn su-btn--card" disabled={checkoutSubmitting} onClick={() => setCheckoutOpen(false)}>취소</button>
              <button type="button" className="su-btn su-btn--point" disabled={checkoutSubmitting} onClick={handleConfirmCheckout}>{checkoutSubmitting ? "결제 중..." : "결제"}</button>
            </div>
          </div>
        </div>
      ) : null}

      </div>
    );
  }

  return (
    <div className="su-page su-support-market">
      <style>{SUPPORT_MARKET_CSS}</style>
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        duration={2200}
      />
      {alertModalNode}
      <PageHeader title="유통지원" onBack={() => navigate("/home")} />

      <header className="su-market-top">
        <div className="su-market-titleBlock">
          <h1>지역형 유통지원 마켓</h1>
          <p>오늘의 포인트 특가와 지역 추천 상품을 빠르게 확인하세요.</p>
        </div>
        <div className="su-market-headTools">
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="상품명/판매자 검색"
          />
          <button type="button" onClick={() => setCartOpen(true)}>🛒</button>
          <button type="button" onClick={() => setMarketTab("orders")}>📦</button>
        </div>
      </header>

      <section className="su-market-banner">
        <div className="su-market-bannerTitle">오늘의 유통지원</div>
        <h2>지역 추천 상품 · 포인트 특가</h2>
        <p>모바일에서 빠르게 보고 바로 포인트로 결제하세요.</p>
      </section>

      <nav className="su-market-categoryStrip" aria-label="유통지원 카테고리">
        {categoryTabs.map((category) => (
          <button
            key={category.key}
            type="button"
            className={activeCategory === category.key ? "is-active" : ""}
            onClick={() => setActiveCategory(category.key)}
          >
            <span>{category.icon}</span>
            <small>{category.label}</small>
          </button>
        ))}
      </nav>

      <div className="su-market-tabs">
        <button type="button" className={marketTab === "market" ? "is-active" : ""} onClick={() => setMarketTab("market")}>마켓</button>
        <button type="button" className={marketTab === "orders" ? "is-active" : ""} onClick={() => setMarketTab("orders")}>주문/신청</button>
      </div>

      {marketTab === "orders" ? (
        <section className="su-market-section">
          <div className="su-market-sectionTitle">내 유통 주문 현황</div>
          <div className="su-market-tabs" style={{ marginTop: 8, marginBottom: 10 }}>
            <button type="button" className={orderTab === "orders" ? "is-active" : ""} onClick={() => setOrderTab("orders")}>주문내역</button>
            <button type="button" className={orderTab === "cancel" ? "is-active" : ""} onClick={() => setOrderTab("cancel")}>취소내역</button>
            <button type="button" className={orderTab === "returns" ? "is-active" : ""} onClick={() => setOrderTab("returns")}>반품내역</button>
          </div>
          {filteredOrderRequests.length === 0 ? <div className="su-market-empty">해당 내역이 없습니다.</div> : null}
          <div className="su-market-orderList">
            {filteredOrderRequests.map((request) => {
              const orderStatus = String(request?.orderStatus || request?.order_status || request?.status || "ORDERED").toUpperCase();
              const receiveMethod = String(request?.receiveMethod || request?.receive_method || "delivery").toLowerCase();
              const messageMeta = parseOrderMessageMeta(request?.message);
              const canCancel = ["ORDERED", "ADMIN_CONFIRMED"].includes(orderStatus);
              const canReceive = ["IN_DELIVERY", "PICKUP_READY"].includes(orderStatus);
              const canConfirm = orderStatus === "DELIVERED";
              const buyerConfirmedAt = request?.buyerConfirmedAt || request?.buyer_confirmed_at;
              const withinReturnWindow = buyerConfirmedAt
                ? (Date.now() - new Date(buyerConfirmedAt).getTime()) < 24 * 60 * 60 * 1000
                : orderStatus === "DELIVERED";
              const canRequestReturn = orderStatus === "DELIVERED" && withinReturnWindow;
              return (
              <article key={String(request.id || request.requestId)} className="su-market-orderItem">
                <div>
                  <strong>{request.itemName || request.item_name || "상품"}</strong>
                  <p>{request.requesterName || memberName} · {receiveMethod === "pickup" ? "방문" : "택배"}</p>
                  {receiveMethod === "delivery" && messageMeta.address ? (
                    <p style={{ fontSize: 12, opacity: 0.75 }}>배송지: {messageMeta.address}</p>
                  ) : null}
                  {receiveMethod === "pickup" && messageMeta.visit ? (
                    <p style={{ fontSize: 12, opacity: 0.75 }}>방문정보: {messageMeta.visit}</p>
                  ) : null}
                  <p style={{ fontSize: 12, opacity: 0.75 }}>진행상태: {getOrderStatusLabel(request)}</p>
                </div>
                <div style={{ display: "grid", gap: 6, minWidth: 96 }}>
                  <span>{getOrderStatusLabel(request)}</span>
                  {canCancel ? (
                    <button type="button" className="su-btn su-btn--card" onClick={() => patchOrderStatus(request, { orderStatus: "CANCELLED", cancelReason: "구매자 취소" }, "주문이 취소되었습니다.")}>주문취소</button>
                  ) : null}
                  {canReceive ? (
                    <button type="button" className="su-btn su-btn--point" onClick={() => patchOrderStatus(request, { orderStatus: "DELIVERED", buyerConfirmed: true }, "수령 확인되었습니다.")}>수령확인</button>
                  ) : null}
                  {canConfirm ? (
                    <button type="button" className="su-btn su-btn--point" onClick={() => patchOrderStatus(request, { orderStatus: "COMPLETED" }, "구매확정되었습니다.")}>구매확정</button>
                  ) : null}
                  {canRequestReturn ? (
                    <button type="button" className="su-btn su-btn--card" onClick={() => patchOrderStatus(request, { orderStatus: "RETURN_REQUESTED", returnReason: "구매자 반품 요청" }, "반품 요청이 접수되었습니다.")}>반품요청 (1일내)</button>
                  ) : null}
                </div>
              </article>
            );})}
          </div>
        </section>
      ) : null}

      {marketTab === "market" ? (
        <>
          <ProductMiniRail title="지역 추천 상품" items={regionalRecommended} onOpenDetail={handleOpenDetail} />
          <ProductMiniRail title="인기 상품" items={popularProducts} onOpenDetail={handleOpenDetail} />
          <ProductMiniRail title="포인트 특가" items={pointSpecial} onOpenDetail={handleOpenDetail} />
          <ProductMiniRail title="신규 등록 상품" items={newProducts} onOpenDetail={handleOpenDetail} />

          <section className="su-market-section">
            <div className="su-market-sectionTitle">상품 리스트</div>
            {loading ? <div className="su-market-empty">상품을 불러오는 중입니다...</div> : null}
            {!loading && filteredProducts.length === 0 ? (
              <div className="su-market-empty">조건에 맞는 상품이 없습니다.</div>
            ) : null}
            <div className="su-market-grid">
              {filteredProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  quantity={getQuantity(item.id)}
                  onQuantityChange={handleQuantityChange}
                  onOpenDetail={handleOpenDetail}
                  onPointBuy={handlePointBuy}
                  onAddToCart={handleAddToCart}
                  inCart={cartItems.some((c) => c.product.id === item.id)}
                />
              ))}
            </div>
          </section>
        </>
      ) : null}

      <section className="su-market-footerNote">
        <div>포인트 결제는 결제 정보 입력 후 최종 확인을 거쳐 진행됩니다.</div>
        <div>카드결제는 UI만 제공되며 추후 오픈예정입니다.</div>
      </section>

      {cartOpen ? (
        <div className="su-market-overlay" onClick={() => setCartOpen(false)}>
          <div className="su-market-modal" onClick={(event) => event.stopPropagation()}>
            <div className="su-market-modalTitle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>장바구니</span>
              <button type="button" onClick={() => { setCartOpen(false); setMarketTab('market'); }} style={{ fontSize: 12, background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: 6, padding: '4px 10px', fontWeight: 700, cursor: 'pointer' }}>+ 더담기</button>
            </div>
            {cartItems.length === 0 ? (
              <div className="su-market-empty">장바구니가 비어 있습니다.</div>
            ) : (
              <>
                <div className="su-market-cartList">
                  {cartItems.map((cartItem) => (
                    <article key={cartItem.product.id} className="su-market-orderItem">
                      <div>
                        <strong>{cartItem.product.title}</strong>
                        <p>{formatPrice(cartItem.product.price)} × {cartItem.quantity}</p>
                        <p>수령: {getReceiveMethodLabel(cartItem.product.receiveMethod)}</p>
                      </div>
                      <div className="su-market-cartActions">
                        <button type="button" className="su-btn su-btn--point" onClick={() => handleCartCheckout(cartItem)}>포인트구매</button>
                        <button type="button" className="su-btn su-btn--card" onClick={() => removeCartItem(cartItem.product.id)}>삭제</button>
                      </div>
                    </article>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid #DDE3EA', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>총 {cartItems.reduce((s, c) => s + toNumber(c.product.price, 0) * Math.max(1, c.quantity), 0).toLocaleString('ko-KR')}P</div>
                  <button type="button" className="su-btn su-btn--point" style={{ fontWeight: 800, minWidth: 90 }} onClick={() => { setBulkCheckoutForm({ address: '', visitNote: '', buyerName: '', buyerPhone: '' }); setBulkCheckoutOpen(true); }}>🛍 일괄구매</button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      {checkoutOpen && checkoutContext?.product ? (
        <div className="su-market-overlay" onClick={() => !checkoutSubmitting && setCheckoutOpen(false)}>
          <div className="su-market-modal" onClick={(event) => event.stopPropagation()}>
            <div className="su-market-modalTitle">포인트 결제 정보 입력</div>
            <div className="su-market-checkoutSummary">
              <div>상품: <strong>{checkoutContext.product.title}</strong></div>
              <div>수량: <strong>{checkoutContext.quantity}</strong></div>
              <div>결제 포인트: <strong>{formatPrice(checkoutContext.product.price * checkoutContext.quantity)}</strong></div>
              <div>수령 방식: <strong>{getReceiveMethodLabel(checkoutContext.product.receiveMethod)}</strong></div>
            </div>

            <input
              className="su-input"
              placeholder="구매자 이름"
              value={checkoutForm.buyerName}
              onChange={(event) => setCheckoutForm((prev) => ({ ...prev, buyerName: event.target.value }))}
            />
            <input
              className="su-input"
              placeholder="전화번호"
              value={checkoutForm.buyerPhone}
              onChange={(event) => setCheckoutForm((prev) => ({ ...prev, buyerPhone: event.target.value }))}
            />

            {String(checkoutContext.product.receiveMethod || "delivery").toLowerCase() === "delivery" ? (
              <input
                className="su-input"
                placeholder="배송 주소 입력"
                value={checkoutForm.address}
                onChange={(event) => setCheckoutForm((prev) => ({ ...prev, address: event.target.value }))}
              />
            ) : null}

            {String(checkoutContext.product.receiveMethod || "delivery").toLowerCase() === "pickup" ? (
              <input
                className="su-input"
                placeholder="방문 정보 입력 (예: 방문일/요청사항)"
                value={checkoutForm.visitNote}
                onChange={(event) => setCheckoutForm((prev) => ({ ...prev, visitNote: event.target.value }))}
              />
            ) : null}

            <div className="su-market-checkoutButtons">
              <button type="button" className="su-btn su-btn--card" disabled={checkoutSubmitting} onClick={() => setCheckoutOpen(false)}>취소</button>
              <button type="button" className="su-btn su-btn--point" disabled={checkoutSubmitting} onClick={handleConfirmCheckout}>{checkoutSubmitting ? "결제 중..." : "결제"}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const SUPPORT_MARKET_CSS = `
.su-support-market {
  --mk-bg: #f5f6f8;
  --mk-surface: #ffffff;
  --mk-border: #e8ecf1;
  --mk-text: #141a2a;
  --mk-sub: #5e6678;
  --mk-primary: #0e7490;
  --mk-accent: #ef4444;
  --mk-point-bg: #fff2df;
  background: #f5f6f8;
  color: var(--mk-text);
  min-height: 100%;
}

.su-support-market .su-market-top,
.su-support-market .su-market-section,
.su-support-market .su-market-footerNote,
.su-support-market .su-market-tabs,
.su-support-market .su-market-categoryStrip,
.su-support-market .su-market-permissionHint,
.su-support-market .su-market-banner,
.su-support-market .su-market-sellerPanel,
.su-support-market .su-market-detail {
  margin-left: 12px;
  margin-right: 12px;
}

/* ── 상단 헤더 ── */
.su-market-top {
  display: grid;
  gap: 10px;
  margin-top: 16px;
}

.su-market-titleBlock h1 {
  margin: 0;
  font-size: 20px;
  line-height: 1.2;
  letter-spacing: -0.03em;
  font-weight: 900;
}

.su-market-titleBlock p {
  margin: 4px 0 0;
  color: var(--mk-sub);
  font-size: 13px;
}

.su-market-headTools {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 8px;
}

.su-market-headTools input {
  width: 100%;
  min-height: 42px;
  border-radius: 22px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  padding: 0 16px;
  font-size: 13px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: border-color 0.2s;
}
.su-market-headTools input:focus {
  outline: none;
  border-color: var(--mk-primary);
  box-shadow: 0 0 0 3px rgba(14,116,144,0.1);
}

.su-market-headTools button {
  width: 42px;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  background: #ffffff;
  font-size: 18px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: transform 0.15s;
}
.su-market-headTools button:active {
  transform: scale(0.92);
}

/* ── 프로모 배너 ── */
.su-market-banner {
  margin-top: 12px;
  border-radius: 20px;
  border: none;
  background: linear-gradient(135deg, #0e7490 0%, #0891b2 40%, #06b6d4 100%);
  color: #ffffff;
  padding: 20px 18px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(14,116,144,0.25);
}
.su-market-banner::after {
  content: '';
  position: absolute;
  right: -30px;
  top: -30px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
}

.su-market-bannerTitle {
  font-size: 11px;
  font-weight: 700;
  opacity: 0.85;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.su-market-banner h2 {
  margin: 6px 0 4px;
  font-size: 20px;
  line-height: 1.25;
  font-weight: 900;
}

.su-market-banner p {
  margin: 0;
  font-size: 13px;
  opacity: 0.88;
}

/* ── 카테고리 가로 스크롤 ── */
.su-market-categoryStrip {
  margin-top: 14px;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(68px, 1fr);
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
}
.su-market-categoryStrip::-webkit-scrollbar { display: none; }

.su-market-categoryStrip button {
  border-radius: 16px;
  border: 1.5px solid #e8ecf1;
  background: #ffffff;
  min-height: 64px;
  display: grid;
  place-items: center;
  gap: 2px;
  color: #475569;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}
.su-market-categoryStrip button:active {
  transform: scale(0.95);
}

.su-market-categoryStrip button span {
  font-size: 22px;
}

.su-market-categoryStrip button small {
  font-size: 10px;
  font-weight: 700;
}

.su-market-categoryStrip button.is-active {
  border-color: #0e7490;
  background: linear-gradient(180deg, #ecfeff, #e0f7fa);
  color: #0e7490;
  box-shadow: 0 2px 8px rgba(14,116,144,0.15);
}

/* ── 마켓/주문 탭 ── */
.su-market-tabs {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
  background: #eef2f7;
  border-radius: 14px;
  padding: 4px;
}

.su-market-tabs button {
  border-radius: 10px;
  border: none;
  min-height: 36px;
  background: transparent;
  font-weight: 700;
  font-size: 12px;
  color: #64748b;
  transition: all 0.2s;
}

.su-market-tabs button.is-active {
  background: #ffffff;
  color: #0e7490;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.su-market-permissionHint {
  margin-top: 10px;
  border-radius: 12px;
  border: 1px solid #fcd34d;
  background: #fffbeb;
  color: #92400e;
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 700;
}

/* ── 섹션 ── */
.su-market-section {
  margin-top: 14px;
}

.su-market-sectionTitle {
  font-weight: 900;
  font-size: 17px;
  margin-bottom: 10px;
  color: #0f172a;
}

/* ── 추천 가로 레일 ── */
.su-market-rail {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(140px, 1fr);
  gap: 10px;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 4px;
}
.su-market-rail::-webkit-scrollbar { display: none; }

.su-market-railCard {
  text-align: left;
  border: none;
  background: #ffffff;
  border-radius: 16px;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}
.su-market-railCard:active {
  transform: scale(0.97);
}

.su-market-railThumb {
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #f1f5f9;
  display: grid;
  place-items: center;
}

.su-market-railThumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.su-market-railName {
  margin: 0;
  padding: 8px 10px 0;
  font-size: 12px;
  line-height: 1.35;
  min-height: 28px;
  color: #334155;
  font-weight: 600;
}

.su-market-railPrice {
  padding: 4px 10px 10px;
  font-size: 15px;
  font-weight: 900;
  color: #e11d48;
}

/* ── 상품 그리드 ── */
.su-market-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

/* ── 상품 카드 ── */
.su-market-card {
  border: none;
  border-radius: 16px;
  background: #ffffff;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}
.su-market-card:active {
  transform: scale(0.97);
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.su-market-card--soldout {
  opacity: 0.55;
}

.su-market-cardMedia {
  position: relative;
  width: 100%;
  border: 0;
  background: #f1f5f9;
  padding: 0;
  aspect-ratio: 1 / 1;
  overflow: hidden;
}

.su-market-cardMedia img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.su-market-status {
  position: absolute;
  left: 8px;
  top: 8px;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 800;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.su-market-status--selling {
  background: rgba(220,252,231,0.9);
  color: #166534;
}

.su-market-status--recommend {
  background: rgba(254,226,226,0.9);
  color: #b91c1c;
}

.su-market-status--new {
  background: rgba(219,234,254,0.9);
  color: #1d4ed8;
}

.su-market-status--soldout {
  background: rgba(229,231,235,0.9);
  color: #334155;
}

.su-market-placeholder {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 700;
}

.su-market-cardBody {
  padding: 10px 12px 12px;
}

.su-market-title {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  line-height: 1.4;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  padding: 0;
}

.su-market-desc {
  margin: 4px 0 0;
  font-size: 11px;
  color: #94a3b8;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.su-market-seller {
  margin-top: 5px;
  font-size: 11px;
  color: #94a3b8;
}

.su-market-price {
  margin-top: 6px;
  font-size: 16px;
  color: #e11d48;
  font-weight: 900;
  letter-spacing: -0.02em;
}

.su-market-badges {
  margin-top: 6px;
  display: grid;
  gap: 4px;
}

.su-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  padding: 3px 8px;
  width: fit-content;
  font-size: 10px;
  font-weight: 800;
}

.su-badge--point {
  background: #fff7ed;
  color: #c2410c;
}

.su-badge--card {
  background: #f3f4f6;
  color: #475569;
}

.su-market-qtyRow {
  margin-top: 7px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #64748b;
}

.su-market-qtyRow input {
  width: 60px;
  height: 30px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  text-align: center;
  color: #141a2a;
  background: #ffffff;
  font-size: 13px;
  font-weight: 700;
}

.su-market-actions {
  margin-top: 8px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

/* ── 공통 버튼 ── */
.su-btn {
  min-height: 36px;
  border-radius: 10px;
  border: 1px solid transparent;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s;
}
.su-btn:active {
  transform: scale(0.96);
}

.su-btn--point {
  background: linear-gradient(135deg, #0e7490, #0891b2);
  color: #fff;
  box-shadow: 0 2px 6px rgba(14,116,144,0.2);
}

.su-btn--card {
  background: #ffffff;
  border-color: #d1d5db;
  color: #475569;
}

.su-market-sellerPanel {
  margin-top: 12px;
  border: 1px solid var(--mk-border);
  border-radius: 14px;
  background: #fff;
  padding: 10px;
}

.su-market-sellerTabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.su-market-sellerTabs button {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #f8fafc;
  min-height: 36px;
  font-size: 12px;
  font-weight: 700;
}

.su-market-sellerTabs button.is-active {
  background: #0e7490;
  color: #fff;
  border-color: #0e7490;
}

.su-market-form {
  margin-top: 10px;
  display: grid;
  gap: 8px;
}

.su-market-form input,
.su-market-form textarea,
.su-market-form select {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  min-height: 40px;
  padding: 9px 12px;
  background: #fff;
  font-size: 13px;
  transition: border-color 0.2s;
}
.su-market-form input:focus,
.su-market-form textarea:focus,
.su-market-form select:focus {
  outline: none;
  border-color: var(--mk-primary);
}

.su-market-form textarea {
  min-height: 80px;
  resize: vertical;
}

.su-market-formGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.su-market-sellerList {
  margin-top: 10px;
  display: grid;
  gap: 8px;
}

.su-market-sellerItem {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  min-height: 46px;
  padding: 10px;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.su-market-empty {
  border: 1px dashed #d1d5db;
  border-radius: 16px;
  background: #fafbfc;
  color: #94a3b8;
  padding: 24px 16px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
}

.su-market-orderList {
  display: grid;
  gap: 8px;
}

.su-market-orderItem {
  border: 1px solid #e8ecf1;
  border-radius: 14px;
  padding: 12px;
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
}

.su-market-orderItem p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 12px;
}

/* ── 상품 상세 ── */
.su-market-detail {
  margin-top: 12px;
  border-radius: 20px;
  border: none;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.su-market-detailHero {
  width: 100%;
  aspect-ratio: 16 / 11;
  background: #e2e8f0;
  overflow: hidden;
}

.su-market-detailHero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.su-market-detailBody {
  padding: 16px;
}

.su-market-detailBody h1 {
  margin: 0;
  font-size: 22px;
  line-height: 1.3;
  letter-spacing: -0.03em;
  font-weight: 900;
  color: #0f172a;
}

.su-market-detailMeta {
  margin-top: 6px;
  color: #94a3b8;
  font-size: 13px;
}

.su-market-detailPrice {
  margin-top: 10px;
  color: #e11d48;
  font-weight: 900;
  font-size: 28px;
  letter-spacing: -0.03em;
}

.su-market-highlight {
  margin-top: 10px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  width: 100%;
  padding: 12px 14px;
  text-align: left;
  display: grid;
  gap: 4px;
  font-size: 13px;
}

.su-market-highlight--point {
  background: linear-gradient(135deg, #fffbeb, #fff7ed);
  border-color: #fde68a;
}

.su-market-highlight--point strong {
  color: #d97706;
}

.su-market-highlight--card {
  background: #f8fafc;
  border-color: #e2e8f0;
  color: #64748b;
}

.su-market-detailDesc {
  margin-top: 14px;
  white-space: pre-wrap;
  line-height: 1.7;
  color: #475569;
  font-size: 14px;
}

.su-market-detailQty {
  margin-top: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  font-size: 14px;
  color: #334155;
}

.su-market-qtyStepper {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: #ffffff;
}

.su-market-qtyBtn {
  width: 40px;
  height: 40px;
  border: none;
  background: #f8fafc;
  font-size: 20px;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background 0.15s;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}
.su-market-qtyBtn:active {
  background: #e2e8f0;
}
.su-market-qtyBtn:disabled {
  color: #cbd5e1;
  background: #f8fafc;
}

.su-market-qtyVal {
  min-width: 44px;
  text-align: center;
  font-size: 16px;
  font-weight: 900;
  color: #0f172a;
}

.su-market-detailButtons {
  margin-top: 14px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.su-market-detailButtons .su-btn {
  min-height: 46px;
  font-size: 14px;
  border-radius: 14px;
}

/* ── 추천 상품 ── */
.su-market-related {
  padding: 0 16px 16px;
}

.su-market-related h3 {
  margin: 8px 0 10px;
  font-size: 15px;
  font-weight: 800;
  color: #1e293b;
}

.su-market-relatedGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.su-market-relatedCard {
  border: 1px solid #e8ecf1;
  border-radius: 14px;
  background: #ffffff;
  min-height: 58px;
  text-align: left;
  padding: 12px;
  display: grid;
  gap: 5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  transition: transform 0.15s;
}
.su-market-relatedCard:active {
  transform: scale(0.97);
}

/* ── 안내 푸터 ── */
.su-market-footerNote {
  margin-top: 18px;
  border-radius: 14px;
  border: 1px solid #bae6fd;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  color: #0c4a6e;
  padding: 14px;
  font-size: 12px;
  display: grid;
  gap: 4px;
  line-height: 1.5;
}

/* ── 오버레이 ── */
.su-market-overlay {
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.su-market-overlay--alert {
  z-index: 1600;
}

/* ── 확인 모달 ── */
.su-market-confirmModal {
  width: min(90%, 380px);
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 12px 40px rgba(0,0,0,0.2);
  overflow: hidden;
  animation: confirmSlideUp 0.25s ease-out;
}
@keyframes confirmSlideUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
.su-market-confirmTitle {
  padding: 20px 22px 0;
  font-size: 17px;
  font-weight: 900;
  color: #0f172a;
}
.su-market-confirmBody {
  padding: 14px 22px 20px;
}
.su-market-confirmLine {
  font-size: 14px;
  color: #475569;
  padding: 3px 0;
  line-height: 1.6;
}
.su-market-confirmLine:first-child {
  font-weight: 700;
  color: #0f172a;
}
.su-market-confirmActions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-top: 1px solid #e8ecf1;
}
.su-market-confirmBtn {
  padding: 15px;
  font-size: 15px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
}
.su-market-confirmBtn--cancel {
  background: #f8fafc;
  color: #64748b;
  border-right: 1px solid #e8ecf1;
}
.su-market-confirmBtn--cancel:active {
  background: #e2e8f0;
}
.su-market-confirmBtn--ok {
  background: linear-gradient(135deg, #0e7490, #0891b2);
  color: #ffffff;
}
.su-market-confirmBtn--ok:active {
  background: #0c5e73;
}

/* ── 안내 모달 ── */
.su-market-alertModal {
  width: min(90%, 360px);
  border-radius: 20px;
  background: linear-gradient(180deg, #ffffff, #f8fbff);
  box-shadow: 0 16px 44px rgba(2, 22, 46, 0.28);
  border: 1px solid #d7e0ea;
  padding: 18px;
  display: grid;
  gap: 12px;
  animation: confirmSlideUp 0.25s ease-out;
}

.su-market-alertTitle {
  font-size: 17px;
  font-weight: 900;
  color: #0f172a;
}

.su-market-alertMessage {
  border: 1px solid #fde68a;
  background: #fff7db;
  color: #92400e;
  border-radius: 12px;
  padding: 12px;
  line-height: 1.5;
  font-size: 14px;
  font-weight: 700;
}

.su-market-alertMessage.is-warning {
  border-color: #fde68a;
  background: #fff7db;
  color: #92400e;
}

.su-market-alertMessage.is-success {
  border-color: #86efac;
  background: #ecfdf3;
  color: #166534;
}

.su-market-alertBtn {
  min-height: 44px;
  border: 1px solid #0f766e;
  border-radius: 12px;
  background: linear-gradient(135deg, #0f766e, #14b8a6);
  color: #ffffff;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
}

.su-market-alertBtn:active {
  background: #0c5e73;
}

/* ── 공통 모달 ── */
.su-market-modal {
  width: min(100%, 460px);
  max-height: 85vh;
  overflow: auto;
  border-radius: 20px;
  border: none;
  background: #ffffff;
  padding: 16px;
  display: grid;
  gap: 10px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.18);
  animation: confirmSlideUp 0.25s ease-out;
}

.su-market-modalTitle {
  font-size: 17px;
  font-weight: 900;
  color: #0f172a;
}

.su-market-cartList {
  display: grid;
  gap: 8px;
}

.su-market-cartActions {
  display: grid;
  gap: 6px;
}

.su-market-checkoutSummary {
  border: 1px solid #e8ecf1;
  border-radius: 14px;
  background: #f8fafc;
  padding: 12px 14px;
  display: grid;
  gap: 5px;
  font-size: 13px;
}

.su-market-checkoutButtons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.su-market-checkoutButtons .su-btn {
  min-height: 44px;
  font-size: 14px;
  border-radius: 12px;
}

/* ── 반응형 ── */
@media (min-width: 768px) {
  .su-market-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .su-market-top,
  .su-market-section,
  .su-market-footerNote,
  .su-market-tabs,
  .su-market-categoryStrip,
  .su-market-permissionHint,
  .su-market-banner,
  .su-market-sellerPanel,
  .su-market-detail {
    margin-left: 16px;
    margin-right: 16px;
  }

  .su-market-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.1);
  }

  .su-market-railCard:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 14px rgba(0,0,0,0.1);
  }
}

@media (min-width: 1120px) {
  .su-market-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .su-market-tabs {
    max-width: 520px;
  }
}
`;
