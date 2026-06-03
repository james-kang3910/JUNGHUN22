import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import * as storageAdapter from "../lib/storageAdapter";
import { register, unregister } from "../lib/ssotRegistry";
import { getAuthInfo } from "../lib/authStore";
import { buildShopPublicUrl, generateQrDataUrl, downloadDataUrl } from "../lib/qrLink";
import MultiImageUploader, { normalizeImageList } from "../components/MultiImageUploader";
import SiteConfirmModal from "../components/SiteConfirmModal";
import SiteAlertModal from "../components/SiteAlertModal";

function normalizeShopAssetUrl(raw) {
  const text = String(raw || '').trim();
  if (!text) return '';
  // 구버전 평면 경로(/uploads/파일명)만 banners 하위로 보정 — content/regions 등은 그대로 유지
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

function normalizeShopForDetail(shop) {
  if (!shop) return shop;
  const primaryImage = getPrimaryShopImage(shop);
  const shopImages = normalizeInteriorShopImages(shop, primaryImage);
  return {
    ...shop,
    shopImages,
    image: primaryImage,
  };
}

function toFiniteCoordinate(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function getKoreaMapMarkerPosition(location) {
  const fallback = { left: '50%', top: '52%' };
  if (!location || location.lat == null || location.lng == null) return fallback;

  const koreaBounds = {
    minLat: 33.0,
    maxLat: 38.7,
    minLng: 124.5,
    maxLng: 131.9,
  };

  const normalizedX = (Number(location.lng) - koreaBounds.minLng) / (koreaBounds.maxLng - koreaBounds.minLng);
  const normalizedY = 1 - ((Number(location.lat) - koreaBounds.minLat) / (koreaBounds.maxLat - koreaBounds.minLat));

  const clampedX = Math.min(0.82, Math.max(0.18, normalizedX || 0.5));
  const clampedY = Math.min(0.78, Math.max(0.22, normalizedY || 0.52));

  return {
    left: `${(clampedX * 100).toFixed(1)}%`,
    top: `${(clampedY * 100).toFixed(1)}%`,
  };
}

function normalizeReviewImages(review) {
  return normalizeImageList(review?.images, 5).map(normalizeShopAssetUrl).filter(Boolean);
}

function resolveReviewImageSrc(imageUrl) {
  const normalized = normalizeShopAssetUrl(imageUrl);
  if (!normalized) return '';
  if (/^https?:\/\//i.test(normalized) || normalized.startsWith('data:') || normalized.startsWith('blob:')) {
    return normalized;
  }
  const base = import.meta.env.VITE_API_BASE || '';
  return `${base}${normalized}`;
}

export default function ShopDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // 라우터 state로 전달받은 상점 정보 (Shops.jsx에서 navigate 시 전달)
  const passedShop = normalizeShopForDetail(location.state?.shop || null);
  
  // ★ 상점 데이터 상태
  const [shop, setShop] = useState(passedShop);
  const [shopLoading, setShopLoading] = useState(!passedShop);
  const [shopError, setShopError] = useState(null);
  const [shopImageFiles, setShopImageFiles] = useState([]);
  const [shopImagePreviewUrls, setShopImagePreviewUrls] = useState([]);
  const [shopImageUploading, setShopImageUploading] = useState(false);
  const [shopQrDataUrl, setShopQrDataUrl] = useState("");
  const [shopQrLoading, setShopQrLoading] = useState(false);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [rsvForm, setRsvForm] = useState({ date: '', time: '', service: '', people: 1, name: '', phone: '', notes: '' });
  const [rsvSubmitting, setRsvSubmitting] = useState(false);
  const [resolvedMapLocation, setResolvedMapLocation] = useState(() => {
    const lat = toFiniteCoordinate(passedShop?.lat);
    const lng = toFiniteCoordinate(passedShop?.lng);
    return lat != null && lng != null ? { lat, lng, source: 'coords' } : null;
  });
  const [mapLoading, setMapLoading] = useState(false);
  const shopImagesInputRef = useRef(null);

  const goBack = () => {
    try {
      window.history.back();
    } catch {}
  };
  const goHome = () => navigate("/home");

  // ★ API에서 상점 데이터 로드
  useEffect(() => {
    // passedShop은 즉시 표시용 초기값으로만 사용. 항상 API를 재호출해 최신 rating 반영
    if (passedShop) {
      setShop(normalizeShopForDetail(passedShop));
      setShopLoading(false);
    }

    if (!id) {
      if (!passedShop) setShopError("상점 ID가 없습니다.");
      setShopLoading(false);
      return;
    }

    let cancelled = false;

    async function loadShop() {
      // passedShop 있을 때는 로딩 스피너 없이 백그라운드 갱신
      if (!passedShop) setShopLoading(true);
      setShopError(null);
      try {
        let data = await storageAdapter.getShopById(id);
        if (cancelled) return;

        if (!data) {
          if (!passedShop) {
            setShopError("상점을 찾을 수 없습니다.");
            setShop(null);
          }
        } else {
          // 메뉴 정규화
          const normalizeMenus = (m) => {
            if (!m) return [];
            if (Array.isArray(m)) return m;
            if (typeof m === 'string') {
              try {
                const parsed = JSON.parse(m);
                if (Array.isArray(parsed)) return parsed;
              } catch (e) {}
              return [m];
            }
            if (typeof m === 'object') return [m];
            return [];
          };

          data.menus = normalizeMenus(data.menus);
          if (!Array.isArray(data.recommendedMenus)) {
            data.recommendedMenus = [];
          }
          data = normalizeShopForDetail(data);
          // rating(서버 원본) → score(표시용 문자열) 매핑
          data.score = (data.rating != null && Number(data.rating) > 0)
            ? Number(data.rating).toFixed(1)
            : "-";
          setShop(data);
        }
      } catch (e) {
        if (cancelled) return;
        console.error('[ShopDetail] Failed to load shop:', e);
        if (!passedShop) {
          setShopError(e.message || "상점 정보를 불러올 수 없습니다.");
          setShop(null);
        }
      } finally {
        if (!cancelled) setShopLoading(false);
      }
    }

    loadShop();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    async function resolveMapLocation() {
      const lat = toFiniteCoordinate(shop?.lat);
      const lng = toFiniteCoordinate(shop?.lng);
      if (lat != null && lng != null) {
        setResolvedMapLocation({ lat, lng, source: 'coords' });
        setMapLoading(false);
        return;
      }

      const address = String(shop?.address || '').trim();
      if (!address) {
        setResolvedMapLocation(null);
        setMapLoading(false);
        return;
      }

      setMapLoading(true);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=ko&q=${encodeURIComponent(address)}`);
        const results = await response.json();
        if (cancelled) return;

        const first = Array.isArray(results) ? results[0] : null;
        const resolvedLat = toFiniteCoordinate(first?.lat);
        const resolvedLng = toFiniteCoordinate(first?.lon);
        if (resolvedLat != null && resolvedLng != null) {
          setResolvedMapLocation({ lat: resolvedLat, lng: resolvedLng, source: 'address' });
        } else {
          setResolvedMapLocation(null);
        }
      } catch (error) {
        if (!cancelled) setResolvedMapLocation(null);
      } finally {
        if (!cancelled) setMapLoading(false);
      }
    }

    resolveMapLocation();

    return () => {
      cancelled = true;
    };
  }, [shop?.lat, shop?.lng, shop?.address]);

  useEffect(() => {
    let cancelled = false;
    async function buildShopQr() {
      const shopId = String(shop?.id || shop?.shopId || id || '').trim();
      if (!shopId) {
        setShopQrDataUrl('');
        return;
      }
      setShopQrLoading(true);
      try {
        const targetUrl = buildShopPublicUrl(shopId);
        const dataUrl = await generateQrDataUrl(targetUrl, 280);
        if (!cancelled) setShopQrDataUrl(dataUrl);
      } catch (error) {
        if (!cancelled) setShopQrDataUrl('');
      } finally {
        if (!cancelled) setShopQrLoading(false);
      }
    }
    buildShopQr();
    return () => {
      cancelled = true;
    };
  }, [shop?.id, shop?.shopId, id]);

  // ★ 후기 상태
  const [reviews, setReviews] = useState([]);
  const [reviewInput, setReviewInput] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewImages, setReviewImages] = useState([]);
  const [reviewUploading, setReviewUploading] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editReviewContent, setEditReviewContent] = useState('');
  const [editReviewRating, setEditReviewRating] = useState(5);
  const [editReviewImages, setEditReviewImages] = useState([]);
  const [reviewActionLoading, setReviewActionLoading] = useState(false);
  const [reviewConfirmModal, setReviewConfirmModal] = useState({ open: false, title: '', message: '', onConfirm: null });
  const [reviewAlertModal, setReviewAlertModal] = useState({ open: false, title: '', message: '', tone: 'teal' });
  const [loadingReviews, setLoadingReviews] = useState(false);
  // 탭 + 정렬
  const [shopTab, setShopTab] = useState('info'); // 'info' | 'reviews'
  const [reviewSort, setReviewSort] = useState('latest');

  // 리뷰 로드
  useEffect(() => {
    if (!shop?.id && !shop?.shopId) return;
    
    const loadReviews = async () => {
      try {
        setLoadingReviews(true);
        const shopId = shop.id || shop.shopId;
        const data = await storageAdapter.getReviews(shopId);
        setReviews(data || []);
      } catch (error) {
        console.error('[ShopDetail] Failed to load reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };
    
    loadReviews();
    const id = register(['shops','reviews'], () => { try { loadReviews(); } catch(e){console.error('[ShopDetail] ssot reload failed', e);} });
    return () => unregister(id);
  }, [shop?.id, shop?.shopId]);

  const showReviewAlert = (message, title = '안내', tone = 'teal') => {
    setReviewAlertModal({ open: true, title, message, tone });
  };

  const closeReviewAlert = () => {
    setReviewAlertModal((prev) => ({ ...prev, open: false }));
  };

  const showReviewConfirm = (message, onConfirm, title = '확인') => {
    setReviewConfirmModal({ open: true, title, message, onConfirm });
  };

  const closeReviewConfirm = () => {
    setReviewConfirmModal({ open: false, title: '', message: '', onConfirm: null });
  };

  const handleReviewSubmit = async () => {
    if (!reviewInput.trim()) {
      showReviewAlert('후기 내용을 입력해주세요.', '입력 안내');
      return;
    }
    
    const auth = getAuthInfo();
    if (!auth || !auth.memberId) {
      showReviewAlert('로그인이 필요합니다.', '로그인 필요');
      return;
    }
    
    try {
      setReviewUploading(true);
      const shopId = shop.id || shop.shopId;
      const newReview = await storageAdapter.postReview(
        shopId,
        {
          content: reviewInput.trim(),
          rating: reviewRating,
          authorName: auth.name || '익명',
          images: reviewImages,
        },
        auth.memberId
      );
      
      // optimistic update
      setReviews((prev) => [newReview, ...prev]);
      setReviewInput("");
      setReviewRating(5);
      setReviewImages([]);
      showReviewAlert('후기가 등록되었습니다!', '등록 완료', 'emerald');
    } catch (error) {
      console.error('[ShopDetail] Failed to post review:', error);
      showReviewAlert(`후기 등록 실패: ${error.message}`, '등록 실패', 'rose');
    } finally {
      setReviewUploading(false);
    }
  };

  const cancelEditReview = () => {
    setEditingReviewId(null);
    setEditReviewContent('');
    setEditReviewRating(5);
    setEditReviewImages([]);
  };

  const startEditReview = (review) => {
    const reviewId = review.reviewId || review.id;
    setEditingReviewId(reviewId);
    setEditReviewContent(review.content || '');
    setEditReviewRating(review.rating || 5);
    setEditReviewImages(normalizeReviewImages(review));
  };

  const handleReviewDelete = (review) => {
    const authInfo = getAuthInfo();
    if (!authInfo?.memberId) {
      showReviewAlert('로그인이 필요합니다.', '로그인 필요');
      return;
    }

    const reviewId = review.reviewId || review.id;
    const shopId = shop.id || shop.shopId;
    const isAuthor = String(review.memberId) === String(authInfo.memberId);
    const confirmMsg = isAuthor ? '내 후기를 삭제하시겠습니까?' : '이 후기를 삭제하시겠습니까?';

    showReviewConfirm(confirmMsg, async () => {
      closeReviewConfirm();
      try {
        setReviewActionLoading(true);
        await storageAdapter.deleteReview(shopId, reviewId);
        setReviews((prev) => prev.filter((item) => (item.reviewId || item.id) !== reviewId));
        if (editingReviewId === reviewId) cancelEditReview();
        showReviewAlert('후기가 삭제되었습니다.', '삭제 완료', 'emerald');
      } catch (error) {
        console.error('[ShopDetail] Failed to delete review:', error);
        showReviewAlert(error.message || '알 수 없는 오류', '삭제 실패', 'rose');
      } finally {
        setReviewActionLoading(false);
      }
    }, '후기 삭제');
  };

  const handleReviewUpdate = async () => {
    if (!editReviewContent.trim()) {
      showReviewAlert('후기 내용을 입력해주세요.', '입력 안내');
      return;
    }

    const authInfo = getAuthInfo();
    if (!authInfo?.memberId) {
      showReviewAlert('로그인이 필요합니다.', '로그인 필요');
      return;
    }

    const shopId = shop.id || shop.shopId;
    try {
      setReviewActionLoading(true);
      const updated = await storageAdapter.updateReview(shopId, editingReviewId, {
        content: editReviewContent.trim(),
        rating: editReviewRating,
        images: editReviewImages,
      });
      setReviews((prev) => prev.map((item) => {
        const itemId = item.reviewId || item.id;
        return itemId === editingReviewId ? updated : item;
      }));
      cancelEditReview();
      showReviewAlert('후기가 수정되었습니다.', '수정 완료', 'emerald');
    } catch (error) {
      console.error('[ShopDetail] Failed to update review:', error);
      showReviewAlert(error.message || '알 수 없는 오류', '수정 실패', 'rose');
    } finally {
      setReviewActionLoading(false);
    }
  };

  // ★ 예약하기
  const handleReservation = async () => {
    const auth = getAuthInfo();
    if (!auth || !auth.memberId) { window.alert('로그인이 필요합니다.'); return; }
    if (!rsvForm.date || !rsvForm.time) { window.alert('날짜와 시간을 선택해주세요.'); return; }
    if (!rsvForm.name.trim()) { window.alert('이름을 입력해주세요.'); return; }
    if (!rsvForm.phone.trim()) { window.alert('전화번호를 입력해주세요.'); return; }
    setRsvSubmitting(true);
    try {
      await storageAdapter.createReservation(shop.id || shop.shopId, {
        reservedDate: rsvForm.date,
        reservedTime: rsvForm.time,
        serviceName: rsvForm.service || null,
        numberOfPeople: rsvForm.people || 1,
        guestName: rsvForm.name.trim(),
        guestPhone: rsvForm.phone.trim(),
        notes: rsvForm.notes.trim() || null,
      }, auth.memberId);
      setReservationOpen(false);
      setRsvForm({ date: '', time: '', service: '', people: 1, name: '', phone: '', notes: '' });
      const goMy = window.confirm('예약이 신청되었습니다!\n상점에서 확인 후 알림으로 안내드립니다.\n\n내 예약 내역을 확인하시겠습니까?');
      if (goMy) navigate('/my', { state: { tab: 'activity' } });
    } catch (err) {
      window.alert('예약 실패: ' + (err.message || '알 수 없는 오류'));
    } finally {
      setRsvSubmitting(false);
    }
  };

  // ★ 전화하기
  const handleCall = () => {
    if (shop?.phone) {
      window.location.href = `tel:${shop.phone}`;
    } else {
      window.alert("전화번호 정보가 없습니다.");
    }
  };

  // 리뷰 통계 (프론트엔드 계산)
  const reviewStats = useMemo(() => {
    if (!reviews.length) return { average: 0, total: 0, distribution: { 5:0,4:0,3:0,2:0,1:0 } };
    const dist = { 5:0, 4:0, 3:0, 2:0, 1:0 };
    reviews.forEach(r => { const s = Math.round(r.rating); if (s >= 1 && s <= 5) dist[s]++; });
    const avg = reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length;
    return { average: Math.round(avg * 10) / 10, total: reviews.length, distribution: dist };
  }, [reviews]);

  const sortedReviews = useMemo(() => {
    const arr = [...reviews];
    if (reviewSort === 'rating_desc') return arr.sort((a,b) => (b.rating||0) - (a.rating||0));
    if (reviewSort === 'rating_asc')  return arr.sort((a,b) => (a.rating||0) - (b.rating||0));
    return arr.sort((a,b) => new Date(b.createdAt||b.date||0) - new Date(a.createdAt||a.date||0)); // latest
  }, [reviews, reviewSort]);

  // ★ 길찾기 (네이버 지도)
  const handleNavigation = () => {
    if (resolvedMapLocation?.lat != null && resolvedMapLocation?.lng != null) {
      const naverMapUrl = `https://map.naver.com/v5/directions/-/-/-/transit?c=${resolvedMapLocation.lng},${resolvedMapLocation.lat},15,0,0,0,dh`;
      window.open(naverMapUrl, "_blank");
    } else if (shop.address) {
      const encodedAddr = encodeURIComponent(shop.address);
      window.open(`https://map.naver.com/v5/search/${encodedAddr}`, "_blank");
    } else {
      window.alert("위치 정보가 없습니다.");
    }
  };

  const auth = getAuthInfo();
  const shopOwnerId = shop?.ownerId || shop?.owner_id || '';
  const shopCreatedBy = shop?.createdBy || shop?.created_by || '';
  const isShopOwner = !!auth?.memberId && (
    String(auth.memberId) === String(shopOwnerId) ||
    (!!shopCreatedBy && String(auth.memberId) === String(shopCreatedBy))
  );
  const primaryImage = getPrimaryShopImage(shop);
  const galleryImages = normalizeInteriorShopImages(shop, primaryImage);
  const existingShopImageCount = galleryImages.length;
  const pendingShopImageCount = Array.isArray(shopImageFiles) ? shopImageFiles.length : 0;
  const canAddMoreShopImages = existingShopImageCount + pendingShopImageCount < 3;
  const mapAddress = String(shop?.address || '').trim();
  const mapMarkerPosition = getKoreaMapMarkerPosition(resolvedMapLocation);
  const shopPublicUrl = buildShopPublicUrl(String(shop?.id || shop?.shopId || id || ''));

  const handleShopImagesChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    const availableSlots = Math.max(0, 3 - existingShopImageCount - pendingShopImageCount);
    if (availableSlots <= 0) {
      window.alert('상점 내부 사진은 최대 3장까지 등록할 수 있습니다.');
      e.target.value = '';
      return;
    }

    const nextFiles = selectedFiles.slice(0, availableSlots);
    if (selectedFiles.length > availableSlots) {
      window.alert('상점 내부 사진은 최대 3장까지 등록할 수 있습니다.');
    }

    const previewUrls = nextFiles.map((file) => URL.createObjectURL(file));
    setShopImagePreviewUrls((prev) => [...prev, ...previewUrls]);
    setShopImageFiles((prev) => [...prev, ...nextFiles]);
    e.target.value = '';
  };

  const removeShopImageAt = (index) => {
    setShopImageFiles((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
    setShopImagePreviewUrls((prev) => {
      const next = [...prev];
      const removed = next[index];
      if (typeof removed === 'string' && removed.startsWith('blob:')) {
        try { URL.revokeObjectURL(removed); } catch (err) {}
      }
      next.splice(index, 1);
      return next;
    });
  };

  const handleShopImagesUpload = async () => {
    if (!shopImageFiles.length || !shop?.id) return;
    setShopImageUploading(true);
    try {
      const formData = new FormData();
      shopImageFiles.slice(0, 3).forEach((file) => formData.append('images', file));
      const token = auth?.sessionId;
      const response = await fetch(`/api/shops/${shop.id}/images`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}`, 'X-Member-Id': auth?.memberId } : { 'X-Member-Id': auth?.memberId },
        body: formData,
      });
      if (!response.ok) throw new Error('상점 내부 사진 업로드에 실패했습니다.');
      const data = await response.json();
      if (Array.isArray(data.shopImages)) {
        setShop((prev) => normalizeShopForDetail({ ...prev, shopImages: data.shopImages }));
      }
      shopImagePreviewUrls.forEach((url) => {
        if (typeof url === 'string' && url.startsWith('blob:')) {
          try { URL.revokeObjectURL(url); } catch (err) {}
        }
      });
      setShopImageFiles([]);
      setShopImagePreviewUrls([]);
    } catch (error) {
      console.error('[ShopDetail] Failed to upload shop images:', error);
      window.alert(error.message || '상점 내부 사진 업로드에 실패했습니다.');
    } finally {
      setShopImageUploading(false);
    }
  };

  // ★ 편의정보 아이콘 매핑
  const amenityIcons = {
    "포장 가능": "📦",
    "배달 가능": "🛵",
    "주차 가능": "🅿️",
    "예약 가능": "📅",
    "반려동물 가능": "🐾",
  };

  // ────────── 인라인 스타일 ──────────
  const panelStyle = {
    margin: "0 0 0 0",
    padding: "16px 16px",
    background: "transparent",
  };

  const cardStyle = {
    padding: 12,
    borderRadius: 16,
    border: "1px solid var(--c-border)",
    background: "var(--c-surface)",
  };

  const shopActionBtnBase = {
    flex: 1,
    minWidth: 0,
    height: 52,
    margin: 0,
    padding: "0 10px",
    borderRadius: 14,
    fontWeight: 800,
    fontSize: 14,
    lineHeight: 1.2,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    boxSizing: "border-box",
    whiteSpace: "nowrap",
  };

  // 섹션 사이 thick divider (배민 스타일)
  const thickDivider = {
    height: 8,
    background: "var(--c-subtle)",
    margin: "0 -16px",
  };

  const sectionTitleStyle = {
    fontWeight: 900,
    fontSize: 15,
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    gap: 8,
  };

  const infoRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid var(--c-border)",
    fontSize: 14,
  };

  return (
    <div className="su-page" style={{ paddingBottom: 120 }}>

      {/* ────────── 플로팅 헤더 (히어로 위에 겹침) ────────── */}
      <header className="su-top" style={{
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <button className="su-iconBtn" type="button" onClick={goBack} aria-label="뒤로"
          >
          ←
        </button>
        <div className="su-topTitle" style={{ flex: 1, fontWeight: 900 }}>
          {shop?.name || "상점 상세"}
        </div>
        <button className="su-pill" type="button" onClick={goHome}
          >
          홈
        </button>
      </header>

      {/* ────────── 로딩/에러 상태 ────────── */}
      {shopLoading && (
        <div style={{ padding: 40, textAlign: "center", opacity: 0.7 }}>
          상점 정보를 불러오는 중...
        </div>
      )}
      
      {shopError && (
        <div style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 18, marginBottom: 12 }}>⚠️</div>
          <div style={{ opacity: 0.8 }}>{shopError}</div>
          <button 
            className="su-pill" 
            style={{ marginTop: 20 }}
            onClick={() => navigate("/shops")}
          >
            상점 목록으로
          </button>
        </div>
      )}

      {!shopLoading && !shopError && shop && (
        <>
      {/* ────────── 상점 기본 정보 ────────── */}
      <section style={{ ...panelStyle, marginTop: 12, position: 'relative', zIndex: 2, paddingBottom: 0 }}>
        {/* 상점명 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0, fontWeight: 900, fontSize: 22, lineHeight: 1.2 }}>{shop.name}</h1>
        </div>

        {/* 서브 타이틀 */}
        {shop.sub && (
          <div style={{ marginTop: 5, fontSize: 14, opacity: 0.75 }}>{shop.sub}</div>
        )}

        {galleryImages.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, marginTop: 12 }}>
            {galleryImages.map((imageUrl, index) => (
              <img
                key={`${imageUrl}-${index}`}
                src={imageUrl}
                alt={`${shop.name} 이미지 ${index + 1}`}
                style={{ width: '100%', height: 92, objectFit: 'cover', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)' }}
              />
            ))}
          </div>
        )}

        {isShopOwner && (
          <div style={{ marginTop: 12 }}>
            <input
              ref={shopImagesInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleShopImagesChange}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => shopImagesInputRef.current?.click()}
              className="su-btnGhost"
              style={{ width: '100%', cursor: 'pointer' }}
              disabled={shopImageUploading || !canAddMoreShopImages}
            >
              {shopImageUploading ? '업로드 중...' : canAddMoreShopImages ? '🖼️ 내부 사진 3장 업로드' : '내부 사진 3장 등록 완료'}
            </button>

            {Array.isArray(shopImagePreviewUrls) && shopImagePreviewUrls.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
                  {shopImagePreviewUrls.slice(0, 3).map((url, index) => (
                    <div key={`${url}-${index}`} style={{ position: 'relative' }}>
                      <img
                        src={url}
                        alt={`업로드 미리보기 ${index + 1}`}
                        style={{ width: '100%', height: 92, objectFit: 'cover', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)' }}
                      />
                      <button
                        type="button"
                        onClick={() => removeShopImageAt(index)}
                        style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12 }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleShopImagesUpload}
                  className="su-primaryBtn"
                  style={{ marginTop: 10, width: '100%' }}
                  disabled={shopImageUploading}
                >
                  저장
                </button>
              </div>
            )}
          </div>
        )}

        {/* 메타 칩 가로 스크롤 */}
        <div style={{ display: 'flex', gap: 7, marginTop: 12, overflowX: 'auto', paddingBottom: 4,
          scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          {shop.badge && (
            <span style={{ flexShrink: 0, padding: '5px 12px', borderRadius: 999,
              background: 'var(--c-subtle)', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', color: 'var(--c-tx-h)' }}>
              {shop.badge}
            </span>
          )}
          <span style={{ flexShrink: 0, padding: '5px 12px', borderRadius: 999,
            background: 'rgba(200,168,75,0.12)', border: '1px solid rgba(200,168,75,0.30)',
            fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', color: '#92650A' }}>
            ⭐ {reviewStats.total > 0 ? reviewStats.average.toFixed(1) : "-"}
          </span>
          {reviews.length > 0 && (
            <span style={{ flexShrink: 0, padding: '5px 12px', borderRadius: 999,
              background: 'var(--c-subtle)', fontSize: 13, whiteSpace: 'nowrap',
              color: 'var(--c-tx-s)' }}>
              후기 {reviews.length}건
            </span>
          )}
          {shop.dist && (
            <span style={{ flexShrink: 0, padding: '5px 12px', borderRadius: 999,
              background: 'var(--c-subtle)', fontSize: 13, whiteSpace: 'nowrap',
              color: 'var(--c-tx-s)' }}>
              📍 {shop.dist}
            </span>
          )}
        </div>

        {/* 주소 */}
        {shop.address && (
          <div style={{ marginTop: 10, paddingBottom: 16, fontSize: 13, opacity: 0.7,
            display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>📍</span>
            <span>{shop.address}</span>
          </div>
        )}

        <div style={{ marginTop: 8, padding: 12, borderRadius: 14, border: '1px solid var(--c-border)', background: 'var(--c-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
            <strong style={{ fontSize: 13 }}>상점 QR</strong>
            <span style={{ fontSize: 11, opacity: 0.72 }}>스캔하면 상점 상세로 이동</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ width: 96, height: 96, borderRadius: 10, border: '1px solid rgba(15,23,42,0.12)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {shopQrDataUrl ? (
                <img src={shopQrDataUrl} alt="상점 QR 코드" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 11, opacity: 0.6 }}>{shopQrLoading ? '생성 중...' : '미생성'}</span>
              )}
            </div>
            <div style={{ display: 'flex', flex: 1, minWidth: 180, gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  if (!shopQrDataUrl) return;
                  const safeShopName = String(shop?.name || 'shop').replace(/\s+/g, '-');
                  downloadDataUrl(shopQrDataUrl, `${safeShopName}-qr.png`);
                }}
                className="su-btnGhost"
                style={{ flex: 1, minWidth: 120, cursor: shopQrDataUrl ? 'pointer' : 'not-allowed', opacity: shopQrDataUrl ? 1 : 0.6 }}
                disabled={!shopQrDataUrl}
              >
                QR 다운로드
              </button>

            </div>
          </div>
        </div>
      </section>

      {/* thick divider */}
      <div style={thickDivider} />

      {/* ────────── 탭 바 ────────── */}
      <div className="su-tabBar" style={{ display: 'flex' }}>
        {[['info', '메뉴·정보'], ['reviews', `리뷰${reviews.length > 0 ? ' ' + reviews.length : ''}`]].map(([tab, label]) => (
          <button key={tab} type="button"
            className={`su-tabItem${shopTab === tab ? ' is-active' : ''}`}
            style={{ flex: 1, background: 'none', border: 'none', fontSize: 15, cursor: 'pointer', fontWeight: shopTab === tab ? 900 : 600 }}
            onClick={() => setShopTab(tab)}>
            {label}
          </button>
        ))}
      </div>

      {/* ────────── 탭: 메뉴·정보 ────────── */}
      {shopTab === 'info' && (<>
      {/* ────────── 1) 영업정보 ────────── */}
      <section style={{ ...panelStyle, paddingTop: 18 }}>
        <div style={sectionTitleStyle}>
          🕐 영업정보
        </div>
        <div style={cardStyle}>
          <div style={infoRowStyle}>
            <span style={{ opacity: 0.75 }}>영업시간</span>
            <span style={{ fontWeight: 700 }}>{shop.businessHours || "정보 없음"}</span>
          </div>
          <div style={infoRowStyle}>
            <span style={{ opacity: 0.75 }}>휴무일</span>
            <span style={{ fontWeight: 700 }}>{shop.closedDay || "없음"}</span>
          </div>
          {shop.breakTime && (
            <div style={{ ...infoRowStyle, borderBottom: "none" }}>
              <span style={{ opacity: 0.75 }}>브레이크타임</span>
              <span style={{ fontWeight: 700 }}>{shop.breakTime}</span>
            </div>
          )}
        </div>
      </section>

      {/* ────────── 2) 대표메뉴 / 추천메뉴 ────────── */}
      {shop.recommendedMenus && shop.recommendedMenus.length > 0 && (
        <>
        <div style={thickDivider} />
        <section style={{ ...panelStyle, paddingTop: 18 }}>
          <div style={sectionTitleStyle}>
            ⭐ 사장님 추천 메뉴
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {shop.recommendedMenus.map((menu, idx) => {
              // 신형 객체 또는 구형 문자열
              const isObject = typeof menu === 'object';
              const menuName = isObject ? menu.name : (menu.split(/\s+/)[0] || menu);
              const menuPrice = isObject ? menu.price : (menu.split(/\s+/).slice(1).join(' ') || '');
              
              return (
                <div
                  key={idx}
                  style={{
                    ...cardStyle,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: idx === 0 ? "linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,215,0,0.05))" : cardStyle.background,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: idx === 0 ? "#f59e0b" : "var(--c-border)",
                      color: idx === 0 ? "#fff" : "var(--c-tx-h)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 900,
                    }}>
                      {idx + 1}
                    </span>
                    <span style={{ fontWeight: 700 }}>{menuName}</span>
                  </div>
                  {menuPrice && (
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--c-primary)" }}>{menuPrice}</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
        </>
      )}

      {/* ────────── 전체 메뉴 (최대 50개) ────────── */}
      {shop.menus && shop.menus.length > 0 && (
        <>
        <div style={thickDivider} />
        <section style={{ ...panelStyle, paddingTop: 18 }}>
          <div style={sectionTitleStyle}>
            📋 전체 메뉴
            <span style={{ fontSize: 12, opacity: 0.6, fontWeight: 400 }}>({shop.menus.length}개)</span>
          </div>
          <div style={cardStyle}>
            <div style={{ display: "grid", gap: 6 }}>
              {shop.menus.map((menu, idx) => {
                // 신형 객체 또는 구형 문자열
                const isObject = typeof menu === 'object';
                const menuDisplay = isObject 
                  ? `${menu.name}${menu.price ? ' ' + menu.price : ''}`
                  : menu;
                const isRecommended = isObject && menu.recommended;
                
                return (
                  <div 
                    key={menu.id || idx} 
                    style={{ 
                      fontSize: 14, 
                      padding: "4px 0", 
                      borderBottom: idx < shop.menus.length - 1 ? "1px solid var(--c-border)" : "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {menuDisplay}
                    {isRecommended && (
                      <span style={{
                        display: "inline-block",
                        padding: "2px 6px",
                        borderRadius: 999,
                        background: "rgba(200, 168, 75, 0.12)",
                        border: "1px solid rgba(200, 168, 75, 0.40)",
                        color: "#92650A",
                        fontSize: 10,
                        fontWeight: 600,
                      }}>
                        추천
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        </>
      )}

      {/* ────────── 3) 편의정보 ────────── */}
      {shop.amenities && shop.amenities.length > 0 && (
        <>
        <div style={thickDivider} />
        <section style={{ ...panelStyle, paddingTop: 18 }}>
          <div style={sectionTitleStyle}>
            ✨ 편의정보
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {shop.amenities.map((amenity, idx) => (
              <div
                key={idx}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: amenity === '배달 가능' ? 'rgba(12,84,96,0.10)'
                    : amenity === '포장 가능' ? 'rgba(5,150,105,0.10)'
                    : amenity === '주사 가능' ? 'rgba(5,150,105,0.10)'
                    : amenity === '예약 가능' ? 'rgba(12,84,96,0.10)'
                    : 'var(--c-subtle)',
                  border: `1px solid ${amenity === '데리배 가능' ? 'rgba(12,84,96,0.30)'
                    : amenity === '포장 가능' || amenity === '주사 가능' ? 'rgba(5,150,105,0.35)'
                    : amenity === '예약 가능' ? 'rgba(12,84,96,0.30)'
                    : 'var(--c-border)'}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 14,
                }}
              >
                <span style={{ fontSize: 18 }}>{amenityIcons[amenity] || "✅"}</span>
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </section>
        </>
      )}

      {/* thick divider */}
      <div style={thickDivider} />

      {/* ────────── 지도 ────────── */}
      <section style={{ ...panelStyle, paddingTop: 18 }}>
        <div style={sectionTitleStyle}>
          🗺️ 위치
        </div>
        <div style={{ overflow: 'hidden', borderRadius: 16, border: '1px solid rgba(14,116,144,0.16)', background: '#DFF4F7', boxShadow: '0 12px 28px rgba(14,116,144,0.08)' }}>
          <div style={{
            position: 'relative',
            width: '100%',
            height: 220,
            overflow: 'hidden',
            background: 'linear-gradient(180deg, #BDE7F0 0%, #DDF5F8 100%)',
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at 20% 22%, rgba(255,255,255,0.82) 0 7%, transparent 7.5%), radial-gradient(circle at 34% 30%, rgba(255,255,255,0.78) 0 6%, transparent 6.5%), radial-gradient(circle at 58% 26%, rgba(255,255,255,0.84) 0 7%, transparent 7.5%), radial-gradient(circle at 72% 36%, rgba(255,255,255,0.76) 0 6%, transparent 6.5%), radial-gradient(circle at 78% 22%, rgba(255,255,255,0.76) 0 5%, transparent 5.5%)',
              opacity: 0.95,
            }} />
            <div style={{
              position: 'absolute',
              inset: '18px 16px 26px',
              borderRadius: 20,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04))',
              border: '1px solid rgba(255,255,255,0.24)',
            }} />
            <div style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: '70%',
              height: '72%',
              transform: 'translate(-50%, -50%)',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,252,253,0.98))',
              clipPath: 'polygon(36% 4%, 48% 8%, 55% 17%, 61% 16%, 68% 24%, 65% 35%, 73% 45%, 67% 60%, 58% 69%, 54% 83%, 42% 94%, 33% 88%, 31% 77%, 22% 68%, 24% 57%, 17% 48%, 18% 37%, 26% 28%, 24% 17%)',
              boxShadow: '0 16px 24px rgba(14,116,144,0.10)',
              border: '1px solid rgba(120,187,199,0.18)',
            }} />
            <div style={{
              position: 'absolute',
              left: '77%',
              top: '63%',
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.96)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 20px rgba(14,116,144,0.12)',
              color: '#0E7490',
              fontSize: 12,
              fontWeight: 800,
            }}>
              KR
            </div>
            {resolvedMapLocation && (
              <div style={{
                position: 'absolute',
                left: mapMarkerPosition.left,
                top: mapMarkerPosition.top,
                transform: 'translate(-50%, -100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}>
                <div style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  boxShadow: '0 8px 16px rgba(14,116,144,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#F04438',
                  fontSize: 12,
                }}>
                  📍
                </div>
                <div style={{
                  width: 2,
                  height: 12,
                  borderRadius: 999,
                  background: 'rgba(240,68,56,0.45)',
                }} />
              </div>
            )}
            <div style={{
              position: 'absolute',
              left: 16,
              top: 14,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 10px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.72)',
              border: '1px solid rgba(14,116,144,0.16)',
              color: '#0E7490',
              fontSize: 12,
              fontWeight: 700,
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}>
              🇰🇷 대한민국 위치 안내
            </div>
            {!resolvedMapLocation && (
              <div style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                color: '#42646C',
              }}>
                <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 10px 20px rgba(14,116,144,0.12)' }}>📍</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-tx-h)' }}>{mapLoading ? '위치를 확인하는 중...' : (mapAddress ? '등록된 위치 기준 안내' : '등록된 위치 정보가 없습니다')}</div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 14px', background: 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(237,252,253,0.96))' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-tx-h)' }}>실제 위치 확인</div>
              <div style={{ fontSize: 12, color: 'var(--c-tx-s)', marginTop: 3 }}>
                {resolvedMapLocation ? (resolvedMapLocation.source === 'coords' ? '등록된 좌표 기준' : '등록된 주소 기준') : (mapAddress ? '등록된 주소 기준' : '위치 정보 미등록')}
              </div>
            </div>
            <button type="button" onClick={handleNavigation} className="su-btnGhost" style={{ flexShrink: 0, cursor: 'pointer' }}>
              네이버 지도 열기
            </button>
          </div>
        </div>
        {mapAddress && (
          <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 10,
            background: 'var(--c-subtle)', border: '1px solid var(--c-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--c-tx-h)', flex: 1 }}>{mapAddress}</span>
            <button type="button" onClick={() => { navigator.clipboard?.writeText(mapAddress); window.alert('주소가 복사되었습니다.'); }}
              className="su-btnGhost"
              style={{ flexShrink: 0, fontSize: 12, cursor: 'pointer' }}>
              복사
            </button>
          </div>
        )}
      </section>
      </>)}

      {/* ────────── 탭: 리뷰 ────────── */}
      {shopTab === 'reviews' && (
        <section style={panelStyle}>
          {shop.reviewAllowed === false ? (
            <div style={{ textAlign: 'center', padding: 30, opacity: 0.6 }}>이 상점은 리뷰 작성을 허용하지 않습니다.</div>
          ) : (
            <>
              {/* 별점 분포 */}
              {reviews.length > 0 && (
                <div style={{ ...cardStyle, marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 36, fontWeight: 900, lineHeight: 1 }}>{reviewStats.average}</div>
                      <div style={{ fontSize: 16, color: '#ffd700' }}>{'★'.repeat(Math.round(reviewStats.average))}{'☆'.repeat(5 - Math.round(reviewStats.average))}</div>
                      <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>{reviewStats.total}개</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      {[5,4,3,2,1].map(star => {
                        const pct = reviewStats.total ? Math.round((reviewStats.distribution[star] / reviewStats.total) * 100) : 0;
                        return (
                          <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                            <span style={{ fontSize: 11, width: 30, opacity: 0.7 }}>{star}★</span>
                            <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--c-border)', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: '#ffd700', borderRadius: 3, transition: 'width 0.3s' }} />
                            </div>
                            <span style={{ fontSize: 11, width: 24, opacity: 0.6 }}>{reviewStats.distribution[star]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              {/* 정렬 버튼 */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                {[['latest','최신순'],['rating_desc','별점 높은순'],['rating_asc','별점 낮은순']].map(([v,l]) => (
                  <button key={v} type="button" onClick={() => setReviewSort(v)}
                    className={reviewSort === v ? 'su-chip is-active' : 'su-chip'}
                    style={{ padding: '5px 10px', fontSize: 12, cursor: 'pointer' }}>
                    {l}
                  </button>
                ))}
              </div>
              {/* 리뷰 목록 */}
              {loadingReviews ? (
                <div style={{ textAlign: 'center', opacity: 0.6, padding: 20 }}>⏳ 로딩 중...</div>
              ) : (
                <div style={{ display: 'grid', gap: 8 }}>
                  {sortedReviews.map(review => {
                    const reviewId = review.reviewId || review.id;
                    const authorName = review.authorName || review.author || '익명';
                    const displayDate = review.createdAt || review.date ? new Date(review.createdAt || review.date).toLocaleDateString('ko-KR') : '';
                    const reviewImageList = normalizeReviewImages(review);
                    const isReviewAuthor = !!auth?.memberId && String(review.memberId) === String(auth.memberId);
                    const canEditReview = isReviewAuthor;
                    const canDeleteReview = isReviewAuthor || isShopOwner;
                    const isEditing = editingReviewId === reviewId;
                    return (
                      <div key={reviewId} style={{ ...cardStyle, padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                          {/* 이니셜 아바타 */}
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                            background: 'linear-gradient(135deg, #0C5460, #083D4A)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 800, color: '#fff',
                          }}>
                            {(authorName[0] || '?').toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                              <div style={{ fontWeight: 700, fontSize: 14 }}>{authorName}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                <span style={{ fontSize: 11, opacity: 0.5 }}>{displayDate}</span>
                                {(canEditReview || canDeleteReview) && !isEditing && (
                                  <div style={{ display: 'flex', gap: 4 }}>
                                    {canEditReview && (
                                      <button
                                        type="button"
                                        onClick={() => startEditReview(review)}
                                        disabled={reviewActionLoading}
                                        style={{ border: 'none', background: 'transparent', color: 'var(--c-primary, #0C5460)', fontSize: 11, fontWeight: 700, cursor: 'pointer', padding: '2px 4px' }}
                                      >
                                        수정
                                      </button>
                                    )}
                                    {canDeleteReview && (
                                      <button
                                        type="button"
                                        onClick={() => handleReviewDelete(review)}
                                        disabled={reviewActionLoading}
                                        style={{ border: 'none', background: 'transparent', color: '#dc2626', fontSize: 11, fontWeight: 700, cursor: 'pointer', padding: '2px 4px' }}
                                      >
                                        삭제
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div style={{ color: '#ffd700', fontSize: 12, marginTop: 2 }}>
                              {'★'.repeat(review.rating || 0)}{'☆'.repeat(5 - (review.rating || 0))}
                            </div>
                          </div>
                        </div>
                        {isEditing ? (
                          <div style={{ paddingLeft: 42 }}>
                            <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setEditReviewRating(star)}
                                  style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: star <= editReviewRating ? '#f59e0b' : 'var(--c-border)', padding: 0 }}
                                >
                                  ★
                                </button>
                              ))}
                            </div>
                            <textarea
                              value={editReviewContent}
                              onChange={(e) => setEditReviewContent(e.target.value)}
                              className="su-input"
                              style={{ width: '100%', minHeight: 80, fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }}
                            />
                            <div style={{ marginTop: 10 }}>
                              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, opacity: 0.75 }}>사진 (최대 5장)</div>
                              <MultiImageUploader
                                value={editReviewImages}
                                maxImages={5}
                                onChange={setEditReviewImages}
                                uploadImage={async (file) => {
                                  const result = await storageAdapter.uploadContentImage(file, { context: 'shop-review' });
                                  return result.imageUrl || result.url || '';
                                }}
                                onError={(message) => showReviewAlert(message || '이미지 업로드에 실패했습니다.', '업로드 실패', 'rose')}
                              />
                            </div>
                            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                              <button
                                type="button"
                                onClick={handleReviewUpdate}
                                disabled={reviewActionLoading}
                                className="su-primaryBtn"
                                style={{ flex: 1, padding: '10px 12px', borderRadius: 10, fontWeight: 800, fontSize: 13 }}
                              >
                                {reviewActionLoading ? '저장 중...' : '저장'}
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditReview}
                                disabled={reviewActionLoading}
                                className="su-chip"
                                style={{ padding: '10px 12px', borderRadius: 10, fontWeight: 700, fontSize: 13 }}
                              >
                                취소
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.6, paddingLeft: 42 }}>{review.content}</div>
                            {reviewImageList.length > 0 && (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, marginTop: 10, paddingLeft: 42 }}>
                                {reviewImageList.map((imageUrl, index) => (
                                  <img
                                    key={`${reviewId}-img-${index}`}
                                    src={resolveReviewImageSrc(imageUrl)}
                                    alt={`${authorName} 후기 이미지 ${index + 1}`}
                                    loading="lazy"
                                    style={{ width: '100%', height: 88, objectFit: 'cover', borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)' }}
                                  />
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                  {sortedReviews.length === 0 && (
                    <div style={{ textAlign: 'center', opacity: 0.6, padding: 20 }}>아직 후기가 없습니다.</div>
                  )}
                </div>
              )}
              {/* 리뷰 작성 폼 */}
              <div style={{ ...cardStyle, marginTop: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>✍️ 후기 작성</div>
                <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                  {[1,2,3,4,5].map(star => (
                    <button key={star} type="button" onClick={() => setReviewRating(star)}
                      style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: star <= reviewRating ? '#f59e0b' : 'var(--c-border)', padding: 0 }}>★</button>
                  ))}
                </div>
                <textarea
                  value={reviewInput}
                  onChange={e => setReviewInput(e.target.value)}
                  placeholder="후기를 작성해주세요..."
                  className="su-input"
                  style={{ width: '100%', minHeight: 80, fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }}
                />
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, opacity: 0.75 }}>사진 첨부 (선택, 최대 5장)</div>
                  <MultiImageUploader
                    value={reviewImages}
                    maxImages={5}
                    onChange={setReviewImages}
                    uploadImage={async (file) => {
                      const result = await storageAdapter.uploadContentImage(file, { context: 'shop-review' });
                      return result.imageUrl || result.url || '';
                    }}
                    onError={(message) => showReviewAlert(message || '이미지 업로드에 실패했습니다.', '업로드 실패', 'rose')}
                    helperText="매장 사진, 메뉴 사진 등을 첨부할 수 있습니다."
                  />
                </div>
                <button type="button" onClick={handleReviewSubmit}
                  disabled={reviewUploading}
                  className="su-primaryBtn"
                  style={{ marginTop: 10, width: '100%', padding: 12, borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: reviewUploading ? 'wait' : 'pointer', opacity: reviewUploading ? 0.7 : 1 }}>
                  {reviewUploading ? '등록 중...' : '후기 등록'}
                </button>
              </div>
            </>
          )}
        </section>
      )}
      {/* ────────── 4) 고정 액션 버튼 (하단 고정) ────────── */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: 'calc(70px + env(safe-area-inset-bottom, 0px))',
          paddingTop: 12,
          paddingLeft: 16,
          paddingRight: 16,
          background: "linear-gradient(to top, var(--c-bg) 0%, var(--c-bg) 70%, transparent 100%)",
          display: "flex",
          alignItems: "stretch",
          gap: 10,
          zIndex: 100,
        }}
      >
        <button
          type="button"
          onClick={handleCall}
          style={{
            ...shopActionBtnBase,
            border: "1.5px solid var(--c-border)",
            background: "var(--c-surface, #fff)",
            color: "var(--c-tx-s, #475569)",
          }}
        >
          📞 전화
        </button>
        <button
          type="button"
          onClick={() => setReservationOpen(true)}
          style={{
            ...shopActionBtnBase,
            border: "none",
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "#fff",
            boxShadow: "0 4px 14px rgba(245, 158, 11, 0.28)",
          }}
        >
          📅 예약
        </button>
        <button
          type="button"
          onClick={handleNavigation}
          style={{
            ...shopActionBtnBase,
            border: "none",
            background: "linear-gradient(135deg, #0E7490, #0B5F73)",
            color: "#fff",
            boxShadow: "0 4px 14px rgba(14, 116, 144, 0.28)",
          }}
        >
          🧭 길찾기
        </button>
      </div>

      {/* ────────── 예약 모달 ────────── */}
      {reservationOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1200, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setReservationOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 460, background: "#fff", borderRadius: 20, padding: "24px 18px", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 8px 40px rgba(0,0,0,0.25)" }}>
            <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 16, color: "#0f172a" }}>📅 예약하기 — {shop?.name}</div>

            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>날짜 *</label>
                  <input type="date" value={rsvForm.date} onChange={e => setRsvForm(p => ({ ...p, date: e.target.value }))} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 12, fontSize: 14, marginTop: 4, background: "#fff", color: "#0f172a" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>시간 *</label>
                  <input type="time" value={rsvForm.time} onChange={e => setRsvForm(p => ({ ...p, time: e.target.value }))} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 12, fontSize: 14, marginTop: 4, background: "#fff", color: "#0f172a" }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>서비스/메뉴</label>
                <input type="text" placeholder="예: 커트, 점심 코스" value={rsvForm.service} onChange={e => setRsvForm(p => ({ ...p, service: e.target.value }))} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 12, fontSize: 14, marginTop: 4, background: "#fff", color: "#0f172a" }} />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>인원</label>
                <input type="number" min={1} max={50} value={rsvForm.people} onChange={e => setRsvForm(p => ({ ...p, people: Math.max(1, Number(e.target.value)) }))} style={{ width: 80, padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 12, fontSize: 14, marginTop: 4, textAlign: "center", background: "#fff", color: "#0f172a" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>이름 *</label>
                  <input type="text" placeholder="홍길동" value={rsvForm.name} onChange={e => setRsvForm(p => ({ ...p, name: e.target.value }))} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 12, fontSize: 14, marginTop: 4, background: "#fff", color: "#0f172a" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>전화번호 *</label>
                  <input type="tel" placeholder="010-0000-0000" value={rsvForm.phone} onChange={e => setRsvForm(p => ({ ...p, phone: e.target.value }))} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 12, fontSize: 14, marginTop: 4, background: "#fff", color: "#0f172a" }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>요청사항</label>
                <textarea placeholder="추가 요청사항을 입력하세요" value={rsvForm.notes} onChange={e => setRsvForm(p => ({ ...p, notes: e.target.value }))} rows={2} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 12, fontSize: 14, marginTop: 4, resize: "vertical", background: "#fff", color: "#0f172a" }} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
              <button type="button" onClick={() => setReservationOpen(false)} style={{ padding: 14, borderRadius: 14, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontWeight: 800, fontSize: 15, cursor: "pointer", color: "#64748b" }}>취소</button>
              <button type="button" onClick={handleReservation} disabled={rsvSubmitting} style={{ padding: 14, borderRadius: 14, border: "none", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", opacity: rsvSubmitting ? 0.6 : 1 }}>{rsvSubmitting ? "신청 중..." : "예약 신청"}</button>
            </div>
          </div>
        </div>
      )}
      <SiteConfirmModal
        open={reviewConfirmModal.open}
        title={reviewConfirmModal.title}
        message={reviewConfirmModal.message}
        confirmText="삭제"
        cancelText="취소"
        tone="teal"
        onCancel={closeReviewConfirm}
        onConfirm={() => reviewConfirmModal.onConfirm?.()}
      />
      <SiteAlertModal
        open={reviewAlertModal.open}
        title={reviewAlertModal.title}
        message={reviewAlertModal.message}
        tone={reviewAlertModal.tone}
        onClose={closeReviewAlert}
      />
      </>
      )}
    </div>
  );
}
