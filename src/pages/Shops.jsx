import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import Toast from "../components/Toast";
import * as storageAdapter from "../lib/storageAdapter";
import { getSession } from "../lib/authStore";
import useAutoRefresh from "../hooks/useAutoRefresh";

// ── 카테고리 메타 (단일 진실 소스 - 칩/라벨/썸네일 플레이스홀더 공유) ──────
const CATEGORY_META = {
  // color: 썸네일 배경 (사진 없을 때). 추후 사진 지원 시에도 이 값이 fallback으로 사용됨
  all:    { label: '전체',  emoji: '🏠', color: '#E6F8FB' },
  food:   { label: '음식',  emoji: '🍽️', color: '#DFF7F2' },
  cafe:   { label: '카페',  emoji: '☕', color: '#EEF9F2' },
  life:   { label: '생활',  emoji: '🛒', color: '#E3F5FF' },
  beauty: { label: '뷰티',  emoji: '💄', color: '#E8F7F3' },
  etc:    { label: '기타',  emoji: '💼', color: '#EEF7FA' },
};

const WEEKDAY_OPTIONS = [
  { key: 'mon', short: '월', full: '월요일' },
  { key: 'tue', short: '화', full: '화요일' },
  { key: 'wed', short: '수', full: '수요일' },
  { key: 'thu', short: '목', full: '목요일' },
  { key: 'fri', short: '금', full: '금요일' },
  { key: 'sat', short: '토', full: '토요일' },
  { key: 'sun', short: '일', full: '일요일' },
];

function normalizeHHMM(value) {
  const text = String(value || '').trim();
  const match = text.match(/(\d{1,2}):(\d{2})/);
  if (!match) return '';
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return '';
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return '';
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function parseTimeRange(value) {
  const text = String(value || '').trim();
  const matches = text.match(/(\d{1,2}:\d{2})/g) || [];
  return {
    start: normalizeHHMM(matches[0] || ''),
    end: normalizeHHMM(matches[1] || ''),
  };
}

function parseClosedDays(value) {
  const text = String(value || '');
  return WEEKDAY_OPTIONS
    .filter((day) => text.includes(day.full) || text.includes(day.short))
    .map((day) => day.key);
}

function formatClosedDays(dayKeys) {
  if (!Array.isArray(dayKeys) || dayKeys.length === 0) return '';
  const labels = WEEKDAY_OPTIONS
    .filter((day) => dayKeys.includes(day.key))
    .map((day) => day.full);
  if (!labels.length) return '';
  return `매주 ${labels.join(', ')}`;
}

function parseRecommendedMenuRows(text) {
  const lines = String(text || '').split('\n').map((line) => line.trim()).filter(Boolean);
  const rows = lines.map((line) => {
    const [name, price] = line.split('|').map((part) => String(part || '').trim());
    return {
      name: name || '',
      price: price || '',
    };
  }).filter((row) => row.name);
  return rows.length ? rows : [{ name: '', price: '' }];
}

function parseMenuRows(text) {
  const lines = String(text || '').split('\n').map((line) => line.trim()).filter(Boolean);
  const rows = lines.map((line) => {
    const pipeParts = line.split('|').map((part) => String(part || '').trim()).filter(Boolean);
    if (pipeParts.length >= 2) {
      return { name: pipeParts[0], price: pipeParts.slice(1).join(' | ') };
    }

    const match = line.match(/^(.*?)(\s+([0-9][0-9,]*(?:원)?))$/);
    if (match) {
      return {
        name: String(match[1] || '').trim(),
        price: String(match[3] || '').trim(),
      };
    }

    return { name: line, price: '' };
  }).filter((row) => row.name);

  return rows.length ? rows : [{ name: '', price: '' }];
}

export default function Shops() {
  console.log('[FORENSIC] 🔍 THIS FILE IS USED: src/pages/Shops.jsx');
  const navigate = useNavigate();
  const goHome = () => navigate("/home");
  const goBack = () => {
    try {
      window.history.back();
    } catch {}
  };

  const [cat, setCat] = useState("all"); // all | food | cafe | life | beauty | etc
  const [q, setQ] = useState("");
  
  // ★ 지역 필터 (URL 파라미터에서 자동 설정, 1회성 토글)
  const [regionFilterActive, setRegionFilterActive] = useState(false);
  const [regionFilterId, setRegionFilterId] = useState(null);

  // ★ 상점 등록 모달 상태
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", type: "error" });
  const showToast = (message, type = "error") => setToast({ open: true, message, type });
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventSaving, setEventSaving] = useState(false);
  const [eventForm, setEventForm] = useState({
    shopId: "",
    title: "",
    content: "",
    imageUrl: "",
    startDate: "",
    endDate: "",
  });
  const [regForm, setRegForm] = useState({
    name: "",
    category: "food",
    sub: "",
    ownerName: "",
    ownerPhone: "",
    regionId: null,
    districtId: null,
    address: "",
    lat: null,
    lng: null,
    businessHours: "",
    closedDay: "",
    breakTime: "",
    recommendedMenusText: "", // each line: name|price
    menusText: "", // each line: "name price"
    amenities: [], // array of strings
    photoFile: null,
    photoPreviewUrl: null,
    shopImageFiles: [],
    shopImagePreviewUrls: [],
  });
  const photoInputRef = useRef(null);
  const shopImagesInputRef = useRef(null);
  const [editingShop, setEditingShop] = useState(null);

  // 영업정보 선택형 입력 상태 (저장은 기존 문자열 필드로 유지)
  const [businessOpenTime, setBusinessOpenTime] = useState('');
  const [businessCloseTime, setBusinessCloseTime] = useState('');
  const [closedDayKeys, setClosedDayKeys] = useState([]);
  const [breakEnabled, setBreakEnabled] = useState(false);
  const [breakStartTime, setBreakStartTime] = useState('');
  const [breakEndTime, setBreakEndTime] = useState('');
  const [recommendedMenuRows, setRecommendedMenuRows] = useState([{ name: '', price: '' }]);
  const [menuRows, setMenuRows] = useState([{ name: '', price: '' }]);
  const [addressSearching, setAddressSearching] = useState(false);

  // ★ 동적 상점 리스트 (등록 시 prepend)
  const [dynamicShops, setDynamicShops] = useState([]);

  useEffect(() => {
    if (!showModal) return;

    const businessRange = parseTimeRange(regForm.businessHours);
    const breakRange = parseTimeRange(regForm.breakTime);

    setBusinessOpenTime(businessRange.start);
    setBusinessCloseTime(businessRange.end);
    setClosedDayKeys(parseClosedDays(regForm.closedDay));
    setBreakEnabled(!!(breakRange.start && breakRange.end));
    setBreakStartTime(breakRange.start);
    setBreakEndTime(breakRange.end);
    setRecommendedMenuRows(parseRecommendedMenuRows(regForm.recommendedMenusText));
    setMenuRows(parseMenuRows(regForm.menusText));
  }, [showModal]);

  // Load persisted shops that belong to the current user (so pending/approved shops they registered
  // remain visible after refresh). Also listen for SSOT changes so admin approvals update the view.
  useEffect(() => {
    const loadMyShops = async () => {
      try {
        const session = getSession();
        if (!session) return;
        // ★ 서버 DB에서 내 상점 조회
        const myShops = await storageAdapter.getMyShops(session.memberId);
        const mapped = myShops.map(_mapAdminShopToUI).reverse();
        if (mapped && mapped.length) setDynamicShops(mapped);
      } catch (e) {
        console.error('[Shops] Failed to load my shops:', e);
      }
    };
    // if navigated here with editShop in location.state, open modal with initial values
    try {
      const s = location?.state?.editShop;
      if (s) {
        // map shop to regForm shape
        setRegForm(prev => ({
          ...prev,
          name: s.name || prev.name,
          category: s.cat || s.category || prev.category,
          sub: s.sub || s.description || prev.sub,
          ownerName: s.owner || s.ownerName || prev.ownerName,
          ownerPhone: s.phone || s.ownerPhone || prev.ownerPhone,
          regionId: s.regionId || prev.regionId,
          districtId: s.districtId || prev.districtId,
          address: s.address || prev.address,
          lat: s.lat || prev.lat,
          lng: s.lng || prev.lng,
          businessHours: s.businessHours || prev.businessHours,
          closedDay: s.closedDay || prev.closedDay,
          breakTime: s.breakTime || prev.breakTime,
          recommendedMenusText: Array.isArray(s.recommendedMenus) ? s.recommendedMenus.map(r => `${r.name}${r.price ? '|' + r.price : ''}`).join('\n') : prev.recommendedMenusText,
          menusText: Array.isArray(s.menus) ? s.menus.join('\n') : prev.menusText,
          amenities: Array.isArray(s.amenities) ? s.amenities : prev.amenities,
          photoPreviewUrl: s.photoPreviewUrl || s.thumbnail || prev.photoPreviewUrl,
          shopImagePreviewUrls: Array.isArray(s.shopImages) ? s.shopImages : prev.shopImagePreviewUrls,
        }));
        setEditingShop(s);
        setShowModal(true);
        // clear the state so repeated navigation doesn't re-open
        try { history.replaceState({}, '', window.location.pathname); } catch (e) {}
      }
    } catch (e) {}

    loadMyShops();
    const onSSOT = () => loadMyShops();
    window.addEventListener('su:ssot:changed', onSSOT);
    window.addEventListener('storage', onSSOT);
    return () => {
      window.removeEventListener('su:ssot:changed', onSSOT);
      window.removeEventListener('storage', onSSOT);
    };
  }, []);

  // CATEGORY_META에서 파생 — 수정 시 CATEGORY_META만 변경
  const cats = useMemo(
    () => Object.entries(CATEGORY_META).map(([key, v]) => ({ key, ...v })),
    []
  );

  // ★ 서버 DB에서 상점 로드 (SSOT)
  const [serverShops, setServerShops] = useState([]);
  const [loadingShops, setLoadingShops] = useState(false);
  const [activeEventShopIds, setActiveEventShopIds] = useState(new Set());
  const hasLoadedServerShopsRef = useRef(false);

  const loadServerShops = useCallback(async () => {
    try {
      if (!hasLoadedServerShopsRef.current) {
        setLoadingShops(true);
      }
      const allShops = await storageAdapter.getShops();
      const approved = allShops.filter(s => s.isPublic || s.status === 'approved');
      const mapped = approved.map(_mapAdminShopToUI);
      setServerShops(mapped);
      hasLoadedServerShopsRef.current = true;
    } catch (e) {
      console.error('[Shops] Failed to load server shops:', e);
      // 주기 갱신 실패 시 기존 데이터를 유지해 카드/카운트가 튀지 않도록 처리
    } finally {
      setLoadingShops(false);
    }
    try {
      const evts = await storageAdapter.getShopEvents({ active: true });
      setActiveEventShopIds(new Set((evts || []).map(e => String(e.shopId))));
    } catch (e) {}
  }, []);

  useEffect(() => {
    loadServerShops();
  }, [loadServerShops]);

  useAutoRefresh(loadServerShops, { intervalMs: 60000 });

  // staticShops intentionally empty — sample/test shops removed per admin request
  const staticShops = useMemo(() => [], []);

  // ✅ PRODUCTION: 서버 DB에서 지역 데이터 로드 (하드코딩 샘플 제거)
  const [regions, setRegions] = useState([]);

  const loadRegions = useCallback(async () => {
    try {
      const serverRegions = await storageAdapter.getRegions();
      setRegions(serverRegions || []);
    } catch (e) {
      console.error('[Shops] Failed to load regions:', e);
      setRegions([]);
    }
  }, []);
  
  useEffect(() => {
    loadRegions();
  }, [loadRegions]);

  useAutoRefresh(loadRegions, { intervalMs: 120000 });

  // 구/군 목록 (지역 선택 시 동적 로드)
  const [districts, setDistricts] = useState([]);
  useEffect(() => {
    if (!regForm.regionId) { setDistricts([]); return; }
    storageAdapter.getDistricts(regForm.regionId)
      .then(list => setDistricts(list || []))
      .catch(() => setDistricts([]));
  }, [regForm.regionId]);

  // query param으로 regionId가 들어오면 관리자 저장소에서 승인된(visible) 상점을 가져옵니다.
  const location = useLocation();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const regionFilter = query.get("regionId");
  
  // ★ URL에서 regionId 파라미터가 있으면 지역 필터 자동 활성화
  useEffect(() => {
    if (regionFilter) {
      setRegionFilterActive(true);
      setRegionFilterId(regionFilter);
    }
  }, [regionFilter]);

  // ★ 동적 상점 + 서버 상점 통합
  const shops = useMemo(() => {
    const merged = [...dynamicShops, ...serverShops];
    const seen = new Set();
    // 데이터 단계에서 중복 제거해 카운트/리스트가 동일 기준을 사용하도록 고정
    return merged.filter((shop) => {
      const key = String(shop.shopId ?? shop.id ?? shop.storeId ?? '');
      if (!key) return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [dynamicShops, serverShops]);

  const handleSearch = useCallback(() => {
    setQ((prev) => String(prev || '').trim());
  }, []);

  const handleAddressSearch = useCallback(async () => {
    const keyword = String(regForm.address || '').trim();
    if (!keyword) {
      showToast('주소를 먼저 입력해주세요.', 'warning');
      return;
    }

    try {
      setAddressSearching(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=ko&q=${encodeURIComponent(keyword)}`
      );
      const results = await response.json();
      const first = Array.isArray(results) ? results[0] : null;
      const lat = Number(first?.lat);
      const lng = Number(first?.lon);

      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        setRegForm((prev) => ({ ...prev, lat, lng }));
        showToast('주소 검색 완료: 위치가 자동 설정되었습니다.', 'success');
      } else {
        showToast('주소 검색 결과가 없습니다. 주소를 다시 확인해주세요.', 'warning');
      }
    } catch (error) {
      showToast('주소 검색에 실패했습니다. 잠시 후 다시 시도해주세요.', 'error');
    } finally {
      setAddressSearching(false);
    }
  }, [regForm.address]);

  const filtered = useMemo(() => {
    const qq = String(q || "").trim().toLowerCase();
    return shops.filter((s) => {
      const okCat = cat === "all" ? true : s.cat === cat;
      const searchable = [
        s.name,
        s.sub,
        s.address,
        s.owner,
        s.ownerName,
        s.phone,
        s.ownerPhone,
        s.cat,
        catLabel(s.cat),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const okQ = !qq ? true : searchable.includes(qq);
      
      // ★ 지역 필터가 활성화되어 있으면 해당 지역 상점만 표시
      const okRegion = !regionFilterActive || !regionFilterId ? true : String(s.regionId) === String(regionFilterId);
      
      return okCat && okQ && okRegion;
    });
  }, [shops, cat, q, regionFilterActive, regionFilterId]);

  const currentRegionLabel = useMemo(() => {
    if (regionFilterActive && regionFilterId) {
      return regions.find((region) => String(region.id) === String(regionFilterId))?.name || '지역 상권';
    }
    return '우리 동네 상권';
  }, [regionFilterActive, regionFilterId, regions]);

  const ownShopCount = useMemo(() => dynamicShops.length, [dynamicShops]);

  const liveEventCount = useMemo(
    () => filtered.filter((shop) => activeEventShopIds.has(String(shop.shopId || shop.id))).length,
    [filtered, activeEventShopIds],
  );

  // ★ 상점 등록 핸들러
  const handleRegFormChange = (field) => (e) => {
    const nextValue = e.target.value;
    setRegForm((prev) => {
      if (field === 'address') {
        return { ...prev, address: nextValue, lat: null, lng: null };
      }
      return { ...prev, [field]: nextValue };
    });
  };

  const toggleAmenity = (amen) => {
    setRegForm(prev => {
      const has = Array.isArray(prev.amenities) && prev.amenities.includes(amen);
      const next = has ? prev.amenities.filter(a => a !== amen) : [...(prev.amenities||[]), amen];
      return { ...prev, amenities: next };
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setRegForm((prev) => ({ ...prev, photoFile: file, photoPreviewUrl: previewUrl }));
    }
  };

  const handleShopImagesChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    setRegForm((prev) => {
      const currentPreviewUrls = Array.isArray(prev.shopImagePreviewUrls) ? prev.shopImagePreviewUrls : [];
      const currentFiles = Array.isArray(prev.shopImageFiles) ? prev.shopImageFiles : [];
      const availableSlots = Math.max(0, 3 - currentPreviewUrls.length);

      if (availableSlots <= 0) {
        showToast('상점 내부 사진은 최대 3장까지 등록할 수 있습니다.', 'warning');
        return prev;
      }

      const nextFiles = selectedFiles.slice(0, availableSlots);
      if (selectedFiles.length > availableSlots) {
        showToast('상점 내부 사진은 최대 3장까지 등록할 수 있습니다.', 'warning');
      }

      const previewUrls = nextFiles.map((file) => URL.createObjectURL(file));
      return {
        ...prev,
        shopImageFiles: [...currentFiles, ...nextFiles],
        shopImagePreviewUrls: [...currentPreviewUrls, ...previewUrls],
      };
    });

    e.target.value = '';
  };

  const removeShopImageAt = (index) => {
    setRegForm((prev) => {
      const nextFiles = [...(prev.shopImageFiles || [])];
      const nextUrls = [...(prev.shopImagePreviewUrls || [])];
      const removedUrl = nextUrls[index];
      if (typeof removedUrl === 'string' && removedUrl.startsWith('blob:')) {
        try { URL.revokeObjectURL(removedUrl); } catch (err) {}
      }
      nextFiles.splice(index, 1);
      nextUrls.splice(index, 1);
      return { ...prev, shopImageFiles: nextFiles, shopImagePreviewUrls: nextUrls };
    });
  };

  const uploadShopImages = async (shopId) => {
    if (!regForm.shopImageFiles?.length) return null;
    const formData = new FormData();
    regForm.shopImageFiles.slice(0, 3).forEach((file) => formData.append('images', file));
    const token = getSession()?.sessionId;
    const uploadRes = await fetch(`/api/shops/${shopId}/images`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}`, 'X-Member-Id': getSession()?.memberId } : { 'X-Member-Id': getSession()?.memberId },
      body: formData,
    });
    if (!uploadRes.ok) throw new Error('상점 내부 사진 업로드에 실패했습니다.');
    return uploadRes.json();
  };

  const validatePhone = (phone) => {
    // 숫자와 하이픈만 허용, 최소 9자리
    const cleaned = phone.replace(/[^0-9-]/g, "");
    return cleaned.length >= 9 && /^[0-9-]+$/.test(phone);
  };

  const handleRegisterSubmit = async () => {
    // 유효성 검사
    if (!regForm.name.trim()) {
      showToast("상점명을 입력해주세요.");
      return;
    }
    if (!regForm.category) {
      showToast("업종을 선택해주세요.");
      return;
    }
    if (!regForm.ownerName.trim()) {
      showToast("대표자 이름을 입력해주세요.");
      return;
    }
    if (!regForm.ownerPhone.trim()) {
      showToast("대표자 전화번호를 입력해주세요.");
      return;
    }
    if (!validatePhone(regForm.ownerPhone)) {
      showToast("전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)");
      return;
    }
    if (!regForm.regionId) {
      showToast("지역을 선택해주세요.");
      return;
    }

    // 새 상점 객체 생성 (임시)
    const parsedRecommended = (recommendedMenuRows || [])
      .map((row) => ({
        name: String(row?.name || '').trim(),
        price: String(row?.price || '').trim(),
      }))
      .filter((row) => row.name);

    const parsedMenus = (menuRows || [])
      .map((row) => {
        const name = String(row?.name || '').trim();
        const price = String(row?.price || '').trim();
        if (!name) return '';
        return price ? `${name} ${price}` : name;
      })
      .filter(Boolean);

    const normalizedBusinessHours = (businessOpenTime && businessCloseTime)
      ? `${businessOpenTime} ~ ${businessCloseTime}`
      : '';
    const normalizedClosedDay = formatClosedDays(closedDayKeys);
    const normalizedBreakTime = (breakEnabled && breakStartTime && breakEndTime)
      ? `${breakStartTime} ~ ${breakEndTime}`
      : '';

    const newShop = {
      id: Date.now(),
      name: regForm.name.trim(),
      cat: regForm.category,
      sub: regForm.sub.trim() || "새로 등록된 상점",
      badge: "NEW",
      dist: "-",
      score: "-",
      status: "pending",
      image: null,
      ownerName: regForm.ownerName.trim(),
      ownerPhone: regForm.ownerPhone.trim(),
      photoFile: regForm.photoFile || null,
      photoPreviewUrl: regForm.photoPreviewUrl || null,
      address: regForm.address || null,
      lat: regForm.lat || null,
      lng: regForm.lng || null,
      businessHours: normalizedBusinessHours || null,
      closedDay: normalizedClosedDay || null,
      breakTime: normalizedBreakTime || null,
      recommendedMenus: parsedRecommended,
      menus: parsedMenus,
      amenities: Array.isArray(regForm.amenities) ? regForm.amenities : [],
    };

    // 관리자 저장소에 등록 또는 수정 (영구 저장)
    try {
      // 파일 업로드 예정이면 JSON에 thumbnail 포함하지 않음 (blob:/data: URL이 body 크기 초과 유발)
      const _safeThumb = regForm.photoFile
        ? null
        : (newShop.photoPreviewUrl && !newShop.photoPreviewUrl.startsWith('blob:') && !newShop.photoPreviewUrl.startsWith('data:')
            ? newShop.photoPreviewUrl
            : null);
      const payload = {
        name: newShop.name,
        category: newShop.cat,
        description: newShop.sub,
        owner: newShop.ownerName,
        phone: newShop.ownerPhone,
        address: newShop.address,
  thumbnail: _safeThumb,
  regionId: regForm.regionId || null,
  districtId: regForm.districtId || null,
        status: newShop.status,
        isVisible: true,
        businessHours: newShop.businessHours,
        closedDay: newShop.closedDay,
        breakTime: newShop.breakTime,
        recommendedMenus: newShop.recommendedMenus,
        menus: newShop.menus,
        amenities: newShop.amenities,
        shopImages: (regForm.shopImagePreviewUrls || []).filter((url) => typeof url === 'string' && !url.startsWith('blob:') && !url.startsWith('data:')).slice(0, 3),
      // attach current member id if available so we can reliably show pending shops to the registrant
      registeredBy: (getSession && typeof getSession === 'function') ? (getSession()?.memberId || null) : null,
      };
      if (editingShop) {
        // ★ 서버 DB에 상점 수정 (storageAdapter 사용)
        const res = await storageAdapter.upsertShop({ ...payload, id: editingShop.id });
        
        // ✨ ADD: 썸네일 업로드 (파일이 있으면)
        if (regForm.photoFile && res && res.success) {
          try {
            const formData = new FormData();
            formData.append('thumbnail', regForm.photoFile);
            const token = getSession()?.sessionId;
            const uploadRes = await fetch(`/api/shops/${res.data.id}/thumbnail`, {
              method: 'POST',
              headers: token ? { Authorization: `Bearer ${token}`, 'X-Member-Id': getSession()?.memberId } : { 'X-Member-Id': getSession()?.memberId },
              body: formData,
            });
            if (uploadRes.ok) {
              const uploadData = await uploadRes.json();
              if (uploadData.thumbnailUrl) {
                res.data.thumbnail = uploadData.thumbnailUrl;
              }
            }
          } catch (uploadErr) {
            console.error('[Shops] Thumbnail upload failed:', uploadErr);
          }
        }

        if (regForm.shopImageFiles?.length && res && res.success) {
          try {
            const imagesData = await uploadShopImages(res.data.id);
            if (Array.isArray(imagesData?.shopImages)) {
              res.data.shopImages = imagesData.shopImages;
            }
          } catch (uploadErr) {
            console.error('[Shops] Shop images upload failed:', uploadErr);
          }
        }
        
        if (res && res.success) {
          const s = res.data;
          const primaryImage = getPrimaryShopImage(s);
          const shopImages = normalizeInteriorShopImages(s, primaryImage);
          const mapped = {
            id: s.id,
            name: s.name,
            cat: s.category,
            sub: s.description || "",
            badge: s.badge || "",
            dist: s.dist || "-",
            score: (s.rating != null && Number(s.rating) > 0) ? Number(s.rating).toFixed(1) : "-",
            status: s.status,
            image: primaryImage,
            ownerName: s.owner || "",
            ownerPhone: s.phone || "",
            ownerId: s.registered_by || s.registeredBy || null,
            regionId: s.region_id || s.regionId || null,
            districtId: s.district_id || s.districtId || null,
            photoFile: null,
            photoPreviewUrl: primaryImage,
            address: s.address || null,
            lat: s.lat || null,
            lng: s.lng || null,
            businessHours: s.businessHours || null,
            closedDay: s.closedDay || null,
            breakTime: s.breakTime || null,
            recommendedMenus: Array.isArray(s.recommendedMenus) ? s.recommendedMenus : [],
            menus: Array.isArray(s.menus) ? s.menus : [],
            amenities: Array.isArray(s.amenities) ? s.amenities : [],
            shopImages,
          };
          setDynamicShops((prev) => prev.map(p => (p.id === mapped.id ? mapped : p)));
        } else {
          // update failed: fallback to prepend newShop (but prefer not to create duplicates)
          setDynamicShops((prev) => [newShop, ...prev]);
        }
      } else {
        // ★ 서버 DB에 상점 등록 (storageAdapter 사용)
        const res = await storageAdapter.upsertShop(payload);
        
        // ✨ ADD: 썸네일 업로드 (파일이 있으면)
        if (regForm.photoFile && res && res.success) {
          try {
            const formData = new FormData();
            formData.append('thumbnail', regForm.photoFile);
            const token = getSession()?.sessionId;
            const uploadRes = await fetch(`/api/shops/${res.data.id}/thumbnail`, {
              method: 'POST',
              headers: token ? { Authorization: `Bearer ${token}`, 'X-Member-Id': getSession()?.memberId } : { 'X-Member-Id': getSession()?.memberId },
              body: formData,
            });
            if (uploadRes.ok) {
              const uploadData = await uploadRes.json();
              if (uploadData.thumbnailUrl) {
                res.data.thumbnail = uploadData.thumbnailUrl;
              }
            }
          } catch (uploadErr) {
            console.error('[Shops] Thumbnail upload failed:', uploadErr);
          }
        }

        if (regForm.shopImageFiles?.length && res && res.success) {
          try {
            const imagesData = await uploadShopImages(res.data.id);
            if (Array.isArray(imagesData?.shopImages)) {
              res.data.shopImages = imagesData.shopImages;
            }
          } catch (uploadErr) {
            console.error('[Shops] Shop images upload failed:', uploadErr);
          }
        }
        
        if (res && res.success) {
          // map stored shop to UI shape used in this page
          const s = res.data;
          const primaryImage = getPrimaryShopImage(s);
          const shopImages = normalizeInteriorShopImages(s, primaryImage);
          const mapped = {
            id: s.id,
            name: s.name,
            cat: s.category,
            sub: s.description || "새로 등록된 상점",
            badge: "NEW",
            dist: "-",
            score: "-",
            status: s.status,
            image: primaryImage,
            ownerName: s.owner || "",
            ownerPhone: s.phone || "",
            ownerId: s.registered_by || s.registeredBy || null,
            regionId: s.region_id || s.regionId || null,
            photoFile: null,
            photoPreviewUrl: primaryImage,
            address: s.address || null,
            lat: s.lat || null,
            lng: s.lng || null,
            businessHours: s.businessHours || null,
            closedDay: s.closedDay || null,
            breakTime: s.breakTime || null,
            recommendedMenus: Array.isArray(s.recommendedMenus) ? s.recommendedMenus : [],
            menus: Array.isArray(s.menus) ? s.menus : [],
            amenities: Array.isArray(s.amenities) ? s.amenities : [],
            shopImages,
          };
          setDynamicShops((prev) => [mapped, ...prev]);
        } else {
          setDynamicShops((prev) => [newShop, ...prev]);
        }
      }
    } catch (e) {
      setDynamicShops((prev) => [newShop, ...prev]);
    }

  // 모달 닫기 및 리셋
  setShowModal(false);
  setEditingShop(null);
    setRegForm({
      name: "",
      category: "food",
      sub: "",
      ownerName: "",
      ownerPhone: "",
      regionId: null,
      address: "",
      lat: null,
      lng: null,
      businessHours: "",
      closedDay: "",
      breakTime: "",
      recommendedMenusText: "",
      menusText: "",
      amenities: [],
      photoFile: null,
      photoPreviewUrl: null,
      shopImageFiles: [],
      shopImagePreviewUrls: [],
    });
    showToast("등록이 완료되었습니다. 관리자 승인 후 공개됩니다.", "success");
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingShop(null);
    // photoPreviewUrl 해제
    if (regForm.photoPreviewUrl) {
      URL.revokeObjectURL(regForm.photoPreviewUrl);
    }
    setRegForm({
      name: "",
      category: "food",
      sub: "",
      ownerName: "",
      ownerPhone: "",
      regionId: null,
      address: "",
      lat: null,
      lng: null,
      businessHours: "",
      closedDay: "",
      breakTime: "",
      recommendedMenusText: "",
      menusText: "",
      amenities: [],
      photoFile: null,
      photoPreviewUrl: null,
      shopImageFiles: [],
      shopImagePreviewUrls: [],
    });
  };

  const handleEventSubmit = async () => {
    if (!eventForm.shopId) {
      showToast("이벤트 대상 상점을 선택해주세요.");
      return;
    }
    if (!eventForm.title.trim()) {
      showToast("이벤트 제목을 입력해주세요.");
      return;
    }
    if (!eventForm.startDate || !eventForm.endDate) {
      showToast("이벤트 시작일/종료일을 입력해주세요.");
      return;
    }
    if (eventForm.endDate < eventForm.startDate) {
      showToast("종료일은 시작일보다 빠를 수 없습니다.");
      return;
    }

    try {
      setEventSaving(true);
      const session = getSession();
      if (!session || !session.memberId) {
        showToast('로그인이 필요합니다.', 'warning');
        navigate('/auth', { state: { returnTo: '/shops' } });
        return;
      }

      await storageAdapter.createShopEvent(
        {
          shopId: eventForm.shopId,
          title: eventForm.title.trim(),
          content: eventForm.content.trim(),
          imageUrl: eventForm.imageUrl.trim() || null,
          startDate: eventForm.startDate,
          endDate: eventForm.endDate,
        },
        session.sessionId,
        session.memberId
      );

      setShowEventModal(false);
      setEventForm({ shopId: "", title: "", content: "", imageUrl: "", startDate: "", endDate: "" });
      showToast("이벤트가 등록되었습니다. 관리자 승인 후 노출됩니다.", "success");
    } catch (e) {
      showToast(e?.message || "이벤트 등록에 실패했습니다.", "error");
    } finally {
      setEventSaving(false);
    }
  };

  // ── 스타일 정의 (CATEGORY_META와 함께 이 블록만 수정) ───────────────────

  return (
    <div className="su-page su-page--shops">
      <PageHeader title="상권 / 혜택" onBack={goBack} action={{ label: "홈", onClick: goHome }} />

      {/* ★ 1. 검색 + 필터 — Action Layer */}
      <section className="su-shops-search">
        <div className="su-shops-search__topline">
          <div>
            <div className="su-shops-search__eyebrow">LOCAL CURATION</div>
            <div className="su-shops-search__headline">{currentRegionLabel}에서 찾는 상점 · 혜택</div>
          </div>
        </div>

        <div className="su-shops-search__inputRow">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
            placeholder="🔎 상점명·키워드 검색"
            className="su-input"
            style={{ flex: 1 }}
          />
          <button
            type="button"
            className="su-primaryBtn"
            style={{ width: 'auto', height: 50, padding: '0 18px', marginTop: 0, fontSize: 14, borderRadius: 16 }}
            onClick={handleSearch}
          >
            검색
          </button>
        </div>

        <div className="su-shops-search__summary">
          <span>카테고리 {cats.find((item) => item.key === cat)?.label || '전체'}</span>
          <span>내 상점 {ownShopCount}곳</span>
          <span>이벤트 진행 {liveEventCount}곳</span>
        </div>

        {/* 카테고리 칩 */}
        <div className="su-shops-chipRow">
          {cats.map((c) => (
            <button key={c.key} type="button" className={`su-shops-chip${cat === c.key ? " is-active" : ""}`} onClick={() => setCat(c.key)}>
              <span className="su-shops-chip__emoji">{c.emoji}</span>
              {c.label}
            </button>
          ))}

          {/* ★ 지역 필터 칩 (1회성 토글) */}
          {regionFilterActive && regionFilterId && (
            <button
              type="button"
              className="su-shops-chip is-active"
              style={{ display: "flex", alignItems: "center", gap: 6 }}
              onClick={() => {
                setRegionFilterActive(false);
                setRegionFilterId(null);
                navigate('/shops', { replace: true });
              }}
            >
              📍 {regions.find(r => String(r.id) === String(regionFilterId))?.name || '지역'}
              <span style={{ fontSize: 16, lineHeight: 1 }}>×</span>
            </button>
          )}
        </div>
      </section>

      {/* ★ 2. 상점 등록 CTA — Hero Layer */}
      <div className="su-shops-hero">
        <div className="su-shops-hero__content">
          <div>
            <div className="su-shops-hero__eyebrow">SHOP PROMOTION STUDIO</div>
            <div className="su-shops-hero__title">내 상점을 등록하고 바로 노출하세요</div>
            <div className="su-shops-hero__sub">상권 메인에서 주민들에게 보이고, 이벤트까지 한 번에 연결할 수 있습니다.</div>
          </div>
          <div className="su-shops-hero__stats">
            <div className="su-shops-hero-stat">
              <strong>{filtered.length}</strong>
              <span>노출 상점</span>
            </div>
            <div className="su-shops-hero-stat">
              <strong>{ownShopCount}</strong>
              <span>내 상점</span>
            </div>
            <div className="su-shops-hero-stat">
              <strong>{liveEventCount}</strong>
              <span>이벤트</span>
            </div>
          </div>
        </div>
        <div className="su-shops-hero__actions">
          <button type="button" className="su-shops-hero-btn"
            onClick={() => {
              const session = getSession();
              if (!session || !session.memberId) { showToast('로그인이 필요합니다.', 'warning'); navigate('/auth', { state: { returnTo: '/shops' } }); return; }
              setEditingShop(null);
              setRegForm({ name: "", category: "food", sub: "", ownerName: "", ownerPhone: "", regionId: "", districtId: null, address: "", lat: null, lng: null, businessHours: "", closedDay: "", breakTime: "", recommendedMenusText: "", menusText: "", amenities: [], photoFile: null, photoPreviewUrl: null, shopImageFiles: [], shopImagePreviewUrls: [] });
              setShowModal(true);
            }}>+ 상점 등록</button>
          <button type="button" className="su-shops-hero-btn su-shops-hero-btn--ghost"
            disabled={dynamicShops.length === 0}
            onClick={() => {
              if (!dynamicShops.length) return;
              const sh = dynamicShops[0];
              setRegForm({ name: sh.name||"", category: sh.cat||"food", sub: sh.sub||"", ownerName: sh.ownerName||"", ownerPhone: sh.ownerPhone||"", regionId: sh.regionId||null, districtId: sh.districtId||null, address: sh.address||"", lat: sh.lat||null, lng: sh.lng||null, businessHours: sh.businessHours||"", closedDay: sh.closedDay||"", breakTime: sh.breakTime||"", recommendedMenusText: Array.isArray(sh.recommendedMenus)?sh.recommendedMenus.map(r=>`${r.name}${r.price?'|'+r.price:''}`).join('\n'):"", menusText: Array.isArray(sh.menus)?sh.menus.join('\n'):"", amenities: Array.isArray(sh.amenities)?sh.amenities:[], photoFile: null, photoPreviewUrl: sh.photoPreviewUrl||sh.image||null, shopImageFiles: [], shopImagePreviewUrls: normalizeShopImageList(sh.shopImages) });
              setEditingShop(sh); setShowModal(true);
            }}>✏️ 수정</button>
          <button
            type="button"
            className="su-shops-hero-btn su-shops-hero-btn--ghost"
            disabled={dynamicShops.length === 0}
            onClick={() => {
              const session = getSession();
              if (!session || !session.memberId) { showToast('로그인이 필요합니다.', 'warning'); navigate('/auth', { state: { returnTo: '/shops' } }); return; }
              if (!dynamicShops.length) return;
              const approvedShops = dynamicShops.filter((s) => String(s.status || '').toLowerCase() === 'approved');
              const ownShop = approvedShops[0] || dynamicShops[0];
              const initialShopId = dynamicShops.length === 1 ? String(ownShop.shopId || ownShop.id || '') : "";
              setEventForm({
                shopId: initialShopId,
                title: "",
                content: "",
                imageUrl: "",
                startDate: "",
                endDate: "",
              });
              setShowEventModal(true);
            }}
          >🎉 이벤트 등록</button>
        </div>
      </div>

      {/* ★ 3. 상점 리스트 — List Layer */}
      <section style={{ marginTop: 20 }}>
        <div className="su-shops-listHeader">
          <div>
            <div className="su-shops-listHeader__title">상점 리스트</div>
          </div>
        </div>

        {/* 스켈레톤 로더 — 로딩 동안 3장 표시 */}
        {loadingShops && (
          <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
            {[0,1,2].map(i => (
              <div key={i} className="su-card" style={{ animation: `skeleton-pulse 1.6s ease-in-out ${i*0.2}s infinite` }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flexShrink: 0, width: 88, height: 88, borderRadius: 14, background: '#DDE3EA' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9, paddingTop: 4 }}>
                    <div style={{ height: 15, width: '55%', borderRadius: 8, background: '#DDE3EA' }} />
                    <div style={{ height: 12, width: '35%', borderRadius: 8, background: '#E8EDF2' }} />
                    <div style={{ height: 12, width: '75%', borderRadius: 8, background: '#E8EDF2' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ★ 데이터 없을 때 메시지 */}
        {!loadingShops && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, opacity: 0.7 }}>
            <div style={{ fontSize: 16, marginBottom: 8 }}>🏪</div>
            <div>등록된 상점이 없습니다.</div>
            <div style={{ fontSize: 12, marginTop: 4, opacity: 0.7 }}>
              상점을 등록하고 지역 상권을 활성화해보세요!
            </div>
          </div>
        )}

        <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
          {(() => {
            return filtered.map((s, idx) => {
              const isApproved = s.status === "approved";
              const isPending = s.status === "pending";
              // ✨ ADD: 내 상점 여부 판별
              const session = getSession();
              const isMine = session && s.ownerId === session.memberId;
              const hasEvent = activeEventShopIds.has(String(s.shopId || s.id));

            // 클릭 핸들러: 승인 전이면 진입 차단, 승인 후면 상세 진입
            const handleCardClick = () => {
              if (isPending) {
                showToast("관리자 승인 후 이용 가능합니다", "info");
                return;
              }
              // 승인된 상점은 상세 페이지로 이동
              navigate(`/shops/${encodeURIComponent(String(s.id))}`, { state: { shop: s } });
            };

            // ✨ ADD: 수정 버튼 클릭 핸들러
            const handleEditClick = (e) => {
              e.stopPropagation(); // 카드 클릭 이벤트 전파 차단
              
              // regForm에 기존 상점 데이터 채우기
              setRegForm({
                name: s.name || "",
                category: s.cat || s.category || "food",
                sub: s.sub || s.description || "",
                ownerName: s.owner || s.ownerName || "",
                ownerPhone: s.phone || s.ownerPhone || "",
                regionId: s.regionId || null,
                districtId: s.districtId || null,
                address: s.address || "",
                lat: s.lat || null,
                lng: s.lng || null,
                businessHours: s.businessHours || "",
                closedDay: s.closedDay || "",
                breakTime: s.breakTime || "",
                recommendedMenusText: Array.isArray(s.recommendedMenus) 
                  ? s.recommendedMenus.map(r => `${r.name}${r.price ? '|' + r.price : ''}`).join('\n') 
                  : "",
                menusText: Array.isArray(s.menus) ? s.menus.join('\n') : "",
                amenities: Array.isArray(s.amenities) ? s.amenities : [],
                photoFile: null,
                photoPreviewUrl: s.photoPreviewUrl || s.thumbnail || s.image || null,
              });
              
              setEditingShop(s);
              setShowModal(true);
            };

            // VIP 여부: 상품권 있으면 VIP 카드, 없으면 일반 카드
            const isVip = !isPending && s.vipVoucherCount > 0;
            const cardClass = isVip ? 'su-shop-card--vip' : 'su-shop-card--regular';

            return (
              <div key={s.shopId || s.id || s.storeId || `shop-${idx}`} style={{ position: 'relative' }}>
              {/* ── 상점 카드: 좌(썸네일) / 우(텍스트) 2단 레이아웃 ── */}
              <button
                type="button"
                className={cardClass}
                style={{ opacity: isPending ? 0.6 : 1, cursor: isPending ? "not-allowed" : "pointer" }}
                onClick={handleCardClick}
              >
                <div className="su-shop-card__layout">
                  {/* 좌: 썸네일 88×88 — 사진 있으면 표시, 없으면 카테고리 이모지 fallback */}
                  <div
                    className="su-shop-thumb"
                    style={{ '--thumb-bg': catColor(s.cat) }}
                  >
                    {isPending ? (
                      <span className="su-shop-thumb__emoji">🔒</span>
                    ) : getPrimaryShopImage(s) ? (
                      <img
                        src={getPrimaryShopImage(s)}
                        alt={s.name}
                        className="su-shop-thumb__img"
                        onError={e => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <span className="su-shop-thumb__emoji">{catEmoji(s.cat)}</span>
                    )}
                  </div>

                  {/* 우: 텍스트 정보 */}
                  <div className="su-shop-card__body">
                    <div className="su-shop-card__head">
                      <div className="su-shop-card__titleBlock">
                        <span className="su-shop-name">{s.name}</span>
                        <div className="su-shop-card__badges">
                          {isPending && (
                            <span className="su-badge su-badge--warn">대기중</span>
                          )}
                          {!isPending && s.badge && (
                            <span className="su-badge su-badge--neutral">{s.badge}</span>
                          )}
                          {isVip && (
                            <span className="su-vip-badge">🎟️ VIP {s.vipVoucherCount}장</span>
                          )}
                          {hasEvent && (
                            <span className="shop-event-badge shop-event-badge--pulse">이벤트 진행중</span>
                          )}
                          {isMine && <span className="su-shop-card__mine">내 상점</span>}
                        </div>
                      </div>
                      <span className="su-shop-card__chevron">↗</span>
                    </div>

                    <div className="su-shop-card__metaRow">
                      <span>⭐ {s.score}</span>
                      <span className="su-shop-card__dot" />
                      <span><span style={{ fontFamily: '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif' }}>{catEmoji(s.cat)}</span> {catLabel(s.cat)}</span>
                    </div>

                    {s.sub && (
                      <div className="su-shop-desc su-shop-card__desc">
                        {s.sub}
                      </div>
                    )}

                    <div className="su-shop-card__footer">
                      <div className="su-shop-meta su-shop-card__address">📍 {s.address || '-'}</div>
                      <div className="su-shop-card__hint">상세 보기</div>
                    </div>
                  </div>
                </div>
              </button>

              {/* 내 상점인 경우 수정 버튼 */}
              {isMine && (
                <button type="button" onClick={handleEditClick}
                  style={{ marginTop: 6, width: '100%', height: 36, background: 'rgba(14,116,144,0.08)', border: '1px solid rgba(14,116,144,0.18)', borderRadius: 12, color: '#0E7490', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s' }}>
                  ✏️ 수정하기
                </button>
              )}
              </div>
            );
            });
          })()}

          {filtered.length === 0 && (
            <div className="su-card" style={{ opacity: 0.85, fontSize: 13, color: '#64748B' }}>
              조건에 맞는 상점이 없어요. (카테고리/검색어를 바꿔보세요)
            </div>
          )}
        </div>
      </section>

      {/* ★ 상점 등록 모달 */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={handleModalClose}
        >
          <div
            className="su-modal su-modal--sm"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="su-modalHeader" style={{ textAlign: "center" }}>
              {editingShop ? '🏪 상점 수정' : '🏪 상점 등록'}
            </div>



            {/* 지역 선택 (필수) */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 700 }}>
                지역 선택 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={regForm.regionId || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setRegForm(prev => ({ 
                    ...prev, 
                    regionId: val || null,
                    districtId: null,
                  }));
                }}
                style={{
                  width: "100%",
                }}
                className="su-input"
              >
                <option value="">지역을 선택하세요 (필수)</option>
                {regions.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* 구/군 선택 */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 700 }}>
                구/군 선택
              </label>
              <select
                value={regForm.districtId || ""}
                onChange={(e) => setRegForm(prev => ({ ...prev, districtId: e.target.value || null }))}
                className="su-input"
                style={{ width: "100%" }}
                disabled={!regForm.regionId}
              >
                <option value="">구/군을 선택하세요 (선택)</option>
                {districts.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* 상점명 (필수) */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 700 }}>
                상점명 <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                value={regForm.name}
                onChange={handleRegFormChange("name")}
                placeholder="상점명을 입력하세요"
                className="su-input"
                style={{ width: "100%" }}
              />
            </div>

            {/* 업종 (필수) */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 700 }}>
                업종 <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                value={regForm.category}
                onChange={handleRegFormChange("category")}
                style={{ width: "100%" }}
                className="su-input"
              >
                <option value="food">음식</option>
                <option value="cafe">카페</option>
                <option value="life">생활</option>
                <option value="beauty">뷰티</option>
                <option value="etc">기타</option>
              </select>
            </div>

            {/* 한줄 소개 (선택) */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 700 }}>
                한줄 소개
              </label>
              <input
                type="text"
                value={regForm.sub}
                onChange={handleRegFormChange("sub")}
                placeholder="간단한 소개 (선택)"
                className="su-input"
                style={{ width: "100%" }}
              />
            </div>

            {/* 대표자 이름 (필수) */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 700 }}>
                대표자 이름 <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                value={regForm.ownerName}
                onChange={handleRegFormChange("ownerName")}
                placeholder="대표자 이름"
                className="su-input"
                style={{ width: "100%" }}
              />
            </div>

            {/* 대표자 전화번호 (필수) */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 700 }}>
                대표자 전화번호 <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="tel"
                value={regForm.ownerPhone}
                onChange={handleRegFormChange("ownerPhone")}
                placeholder="010-1234-5678"
                className="su-input"
                style={{ width: "100%" }}
              />
            </div>

            {/* 사진 등록 (선택) */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 700 }}>
                상점 사진 (선택)
              </label>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: "none" }}
              />
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="su-btnGhost"
                style={{ width: "100%", cursor: "pointer" }}
              >
                📷 사진 업로드
              </button>

              {/* 사진 미리보기 */}
              {regForm.photoPreviewUrl && (
                <div style={{ marginTop: 10, position: "relative" }}>
                  <img
                    src={regForm.photoPreviewUrl}
                    alt="미리보기"
                    style={{
                      width: "100%",
                      height: 120,
                      objectFit: "cover",
                      borderRadius: 10,
                      border: "1px solid #DDE3EA",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      URL.revokeObjectURL(regForm.photoPreviewUrl);
                      setRegForm((prev) => ({ ...prev, photoFile: null, photoPreviewUrl: null }));
                    }}
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.55)",
                      border: "none",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: 14,
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 700 }}>
                상점 내부 사진 (최대 3장)
              </label>
              <input
                ref={shopImagesInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleShopImagesChange}
                style={{ display: "none" }}
              />
              <button
                type="button"
                onClick={() => shopImagesInputRef.current?.click()}
                className="su-btnGhost"
                style={{ width: "100%", cursor: "pointer" }}
              >
                🖼️ 내부 사진 3장 업로드
              </button>

              {Array.isArray(regForm.shopImagePreviewUrls) && regForm.shopImagePreviewUrls.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, marginTop: 10 }}>
                  {regForm.shopImagePreviewUrls.slice(0, 3).map((url, index) => (
                    <div key={`${url}-${index}`} style={{ position: 'relative' }}>
                      <img
                        src={url}
                        alt={`상점 내부 사진 ${index + 1}`}
                        style={{ width: '100%', height: 88, objectFit: 'cover', borderRadius: 10, border: '1px solid #DDE3EA' }}
                      />
                      <button
                        type="button"
                        onClick={() => removeShopImageAt(index)}
                        style={{
                          position: 'absolute',
                          top: 6,
                          right: 6,
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          background: 'rgba(0,0,0,0.55)',
                          border: 'none',
                          color: '#fff',
                          cursor: 'pointer',
                          fontSize: 12,
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 주소 / 위치 (선택이지만 권장) */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 700 }}>
                상점 주소 (권장)
              </label>
              <input
                type="text"
                value={regForm.address}
                onChange={handleRegFormChange("address")}
                placeholder="예: 서울시 강남구 테헤란로 123"
                className="su-input"
                style={{ width: "100%" }}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleAddressSearch}
                  className="su-btnGhost"
                  style={{ padding: '8px 12px' }}
                  disabled={addressSearching}
                >
                  {addressSearching ? '검색 중...' : '주소 검색'}
                </button>
                <span style={{ fontSize: 12, color: '#64748B' }}>검색 또는 수기 입력</span>
              </div>
            </div>

            {/* 영업정보 */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 700 }}>
                영업시간
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="time" value={businessOpenTime} onChange={(e) => setBusinessOpenTime(e.target.value)} className="su-input" style={{ flex: 1 }} />
                <span style={{ color: '#64748B', fontSize: 13, fontWeight: 700 }}>~</span>
                <input type="time" value={businessCloseTime} onChange={(e) => setBusinessCloseTime(e.target.value)} className="su-input" style={{ flex: 1 }} />
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 700 }}>휴무일</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {WEEKDAY_OPTIONS.map((day) => {
                  const selected = closedDayKeys.includes(day.key);
                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => setClosedDayKeys((prev) => prev.includes(day.key) ? prev.filter((key) => key !== day.key) : [...prev, day.key])}
                      style={{
                        padding: '7px 10px',
                        borderRadius: 999,
                        border: selected ? '1px solid rgba(14,116,144,0.34)' : '1px solid rgba(148,163,184,0.26)',
                        background: selected ? 'rgba(14,116,144,0.12)' : '#fff',
                        color: selected ? '#0E7490' : '#475569',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {day.short}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700 }}>브레이크타임</label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569' }}>
                  <input
                    type="checkbox"
                    checked={breakEnabled}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setBreakEnabled(checked);
                      if (!checked) {
                        setBreakStartTime('');
                        setBreakEndTime('');
                      }
                    }}
                  />
                  브레이크타임 사용
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="time" value={breakStartTime} onChange={(e) => setBreakStartTime(e.target.value)} className="su-input" style={{ flex: 1 }} disabled={!breakEnabled} />
                <span style={{ color: '#64748B', fontSize: 13, fontWeight: 700 }}>~</span>
                <input type="time" value={breakEndTime} onChange={(e) => setBreakEndTime(e.target.value)} className="su-input" style={{ flex: 1 }} disabled={!breakEnabled} />
              </div>
            </div>

            {/* 추천메뉴 (행 추가형) */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700 }}>사장님 추천메뉴</label>
                <button
                  type="button"
                  className="su-btnGhost"
                  style={{ padding: '6px 10px', fontSize: 12 }}
                  onClick={() => setRecommendedMenuRows((prev) => [...(prev || []), { name: '', price: '' }])}
                >
                  + 메뉴 추가
                </button>
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                {(recommendedMenuRows || []).map((row, index) => (
                  <div key={`recommended-menu-${index}`} style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => {
                        const value = e.target.value;
                        setRecommendedMenuRows((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, name: value } : item));
                      }}
                      placeholder="메뉴명"
                      className="su-input"
                      style={{ flex: 1 }}
                    />
                    <input
                      type="text"
                      value={row.price}
                      onChange={(e) => {
                        const value = e.target.value;
                        setRecommendedMenuRows((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, price: value } : item));
                      }}
                      placeholder="가격"
                      className="su-input"
                      style={{ width: 110 }}
                    />
                    <button
                      type="button"
                      className="su-btnGhost"
                      style={{ padding: '0 10px' }}
                      onClick={() => {
                        setRecommendedMenuRows((prev) => {
                          if ((prev || []).length <= 1) return [{ name: '', price: '' }];
                          return prev.filter((_, itemIndex) => itemIndex !== index);
                        });
                      }}
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 전체메뉴 (행 추가형) */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700 }}>전체 메뉴</label>
                <button
                  type="button"
                  className="su-btnGhost"
                  style={{ padding: '6px 10px', fontSize: 12 }}
                  onClick={() => setMenuRows((prev) => [...(prev || []), { name: '', price: '' }])}
                >
                  + 메뉴 추가
                </button>
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                {(menuRows || []).map((row, index) => (
                  <div key={`menu-${index}`} style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => {
                        const value = e.target.value;
                        setMenuRows((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, name: value } : item));
                      }}
                      placeholder="메뉴명"
                      className="su-input"
                      style={{ flex: 1 }}
                    />
                    <input
                      type="text"
                      value={row.price}
                      onChange={(e) => {
                        const value = e.target.value;
                        setMenuRows((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, price: value } : item));
                      }}
                      placeholder="가격"
                      className="su-input"
                      style={{ width: 110 }}
                    />
                    <button
                      type="button"
                      className="su-btnGhost"
                      style={{ padding: '0 10px' }}
                      onClick={() => {
                        setMenuRows((prev) => {
                          if ((prev || []).length <= 1) return [{ name: '', price: '' }];
                          return prev.filter((_, itemIndex) => itemIndex !== index);
                        });
                      }}
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 편의정보 체크박스 */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 700 }}>편의정보</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={regForm.amenities.includes('포장 가능')} onChange={() => toggleAmenity('포장 가능')} /> 포장 가능
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={regForm.amenities.includes('주차 가능')} onChange={() => toggleAmenity('주차 가능')} /> 주차 가능
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={regForm.amenities.includes('예약 가능')} onChange={() => toggleAmenity('예약 가능')} /> 예약 가능
                </label>
              </div>
            </div>

            {/* 안내 문구 */}
            <div style={{
              background: "rgba(12,84,96,0.07)",
              border: "1px solid rgba(12,84,96,0.14)",
              borderRadius: 8,
              padding: 10,
              marginBottom: 16,
              fontSize: 12,
              color: "#637074",
              lineHeight: 1.5,
            }}>
              ℹ️ 등록 후 관리자 승인을 거쳐 상점이 공개됩니다.<br />
              승인 전까지 상점 상세 진입이 제한됩니다.
            </div>

            {/* 버튼 */}
            <div style={{ display: "flex", gap: 10, flexWrap: 'nowrap' }}>
              <button
                type="button"
                onClick={handleModalClose}
                className="su-btnGhost"
                style={{ flex: 1, fontWeight: 700, cursor: "pointer", whiteSpace: 'nowrap' }}
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleRegisterSubmit}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg, #0C5460 0%, #083D4A 100%)",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: 'nowrap',
                }}
              >
                {editingShop ? '수정하기' : '등록하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEventModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: 12,
          }}
          onClick={() => { if (!eventSaving) setShowEventModal(false); }}
        >
          <div
            className="su-modal su-modal--sm"
            style={{ width: "100%", maxWidth: 520, maxHeight: "88dvh", overflowY: "auto", paddingBottom: 88 }}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="su-modalHeader" style={{ textAlign: "center" }}>🎉 이벤트 등록</div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 700 }}>
                상점 선택 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={eventForm.shopId}
                onChange={(e) => setEventForm((prev) => ({ ...prev, shopId: e.target.value }))}
                className="su-input"
                style={{ width: "100%" }}
              >
                <option value="">{dynamicShops.length > 1 ? '이벤트를 등록할 상점을 선택하세요' : '상점을 선택하세요'}</option>
                {dynamicShops.map((s) => {
                  const sid = String(s.shopId || s.id || "");
                  if (!sid) return null;
                  return <option key={sid} value={sid}>{`${s.name} (${sid})`}</option>;
                })}
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 700 }}>
                이벤트 제목 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={eventForm.title}
                onChange={(e) => setEventForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="예: 봄맞이 할인 이벤트"
                className="su-input"
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 700 }}>이벤트 내용</label>
              <textarea
                value={eventForm.content}
                onChange={(e) => setEventForm((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="이벤트 상세 내용을 입력하세요"
                className="su-input"
                style={{ width: "100%", minHeight: 90 }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 700 }}>대표 이미지 URL</label>
              <input
                type="text"
                value={eventForm.imageUrl}
                onChange={(e) => setEventForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="https://..."
                className="su-input"
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 150px" }}>
                <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 700 }}>
                  시작일 <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  value={eventForm.startDate}
                  onChange={(e) => setEventForm((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="su-input"
                  style={{ width: "100%" }}
                />
              </div>
              <div style={{ flex: "1 1 150px" }}>
                <label style={{ display: "block", marginBottom: 4, fontSize: 13, fontWeight: 700 }}>
                  종료일 <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  value={eventForm.endDate}
                  onChange={(e) => setEventForm((prev) => ({ ...prev, endDate: e.target.value }))}
                  className="su-input"
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setShowEventModal(false)}
                className="su-btnGhost"
                style={{ flex: 1, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
                disabled={eventSaving}
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleEventSubmit}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg, #f97316 0%, #ef4444 100%)",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  opacity: eventSaving ? 0.7 : 1,
                }}
                disabled={eventSaving}
              >
                {eventSaving ? "등록 중..." : "이벤트 등록"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        position="bottom"
        onClose={() => setToast(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
}

// Map adminStore shop object to the UI shape used by this page
function _mapAdminShopToUI(s) {
  const stableId = s.id || s.shopId || s.shop_id || s.storeId || s.store_id || null;
  const primaryImage = getPrimaryShopImage(s);
  const shopImages = normalizeInteriorShopImages(s, primaryImage);
  return {
    id: stableId,
    shopId: stableId,
    name: s.name,
    cat: s.category,
    sub: s.description || "",
    badge: s.badge || "",
    dist: s.dist || "-",
    score: (s.rating != null && Number(s.rating) > 0) ? Number(s.rating).toFixed(1) : "-",
    status: s.status || "pending",
    image: primaryImage,
    ownerName: s.owner || "",
    ownerPhone: s.phone || "",
    ownerId: s.registered_by || s.registeredBy || null,
    regionId: s.region_id || s.regionId || null,
    districtId: s.district_id || s.districtId || null,
    vipVoucherCount: parseInt(s.vipVoucherCount || s.vip_voucher_count) || 0, // VIP 상품권 수
    photoFile: null,
    photoPreviewUrl: primaryImage,
    address: s.address || null,
    lat: s.lat || null,
    lng: s.lng || null,
    businessHours: s.businessHours || null,
    closedDay: s.closedDay || null,
    breakTime: s.breakTime || null,
    recommendedMenus: Array.isArray(s.recommendedMenus) ? s.recommendedMenus : [],
    menus: Array.isArray(s.menus) ? s.menus : [],
    amenities: Array.isArray(s.amenities) ? s.amenities : [],
    shopImages,
  };
}

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
  ])[0] || null;
}

// CATEGORY_META에서 파생 — catLabel은 유지보수용 래퍼
function catLabel(c) {
  return CATEGORY_META[c]?.label || '기타';
}
function catEmoji(c) {
  return CATEGORY_META[c]?.emoji || '💼';
}
function catColor(c) {
  return CATEGORY_META[c]?.color || 'rgba(107,114,128,0.5)';
}
