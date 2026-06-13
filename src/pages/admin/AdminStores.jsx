import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { isAdminAuthenticatedLocal, getAdminToken } from "../../lib/adminAuth";
import * as storageAdapter from "../../lib/storageAdapter";
import AdminModalForm from "./components/AdminModalForm";
import ConfirmDialog from "./components/ConfirmDialog";
import Toast from "./components/Toast";

const SHOP_CATEGORIES = [
  { value: "restaurant", label: "음식점" },
  { value: "cafe", label: "카페" },
  { value: "beauty", label: "미용" },
  { value: "health", label: "건강/의료" },
  { value: "education", label: "교육" },
  { value: "retail", label: "소매" },
  { value: "service", label: "서비스" },
  { value: "other", label: "기타" },
];

const STATUS_OPTIONS = [
  { value: "pending", label: "대기", color: "#f59e0b" },
  { value: "approved", label: "승인", color: "#22c55e" },
  { value: "rejected", label: "반려", color: "#ef4444" },
];

export default function AdminStores() {
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [regions, setRegions] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");

  // Modal/Dialog 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // 모달 폼 데이터 추적 (districtId 조건부 렌더링)
  const [currentFormData, setCurrentFormData] = useState({});
  // 현재 선택된 regionId 기반 구/군 목록
  const [districts, setDistricts] = useState([]);

  // Toast 상태
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  
  // 로딩 상태
  const [loading, setLoading] = useState(false);

  // 탭 & 이벤트 관리 상태
  const [activeTab, setActiveTab] = useState('shops');
  const [shopEvents, setShopEvents] = useState([]);
  const [eventStatusFilter, setEventStatusFilter] = useState('all');
  const [eventLoading, setEventLoading] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [eventCreateOpen, setEventCreateOpen] = useState(false);
  const [eventCreateForm, setEventCreateForm] = useState({ shopId: '', title: '', content: '', imageUrl: '', startDate: '', endDate: '' });
  const [eventCreateSaving, setEventCreateSaving] = useState(false);
  const [editEventOpen, setEditEventOpen] = useState(false);
  const [editEventTarget, setEditEventTarget] = useState(null);
  const [editEventForm, setEditEventForm] = useState({ title: '', content: '', imageUrl: '', startDate: '', endDate: '' });
  const [editEventSaving, setEditEventSaving] = useState(false);

  useEffect(() => {
    if (!isAdminAuthenticatedLocal()) {
      navigate("/admin/login", { replace: true });
      return;
    }
    loadData();
  }, [navigate]);

  // 선택된 regionId 변경 시 구/군 로드
  useEffect(() => {
    const rid = currentFormData.regionId;
    if (!rid) { setDistricts([]); return; }
    const API_BASE = import.meta.env.VITE_API_URL || '';
    fetch(`${API_BASE}/api/districts?regionId=${rid}`)
      .then(r => r.ok ? r.json() : { districts: [] })
      .then(d => setDistricts(d.districts || []))
      .catch(() => setDistricts([]));
  }, [currentFormData.regionId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [shopsData, regionsData] = await Promise.all([
        storageAdapter.getShops(),
        storageAdapter.getRegions(), // ★ 서버 기반으로 전환
      ]);
      const normalizedShops = (shopsData || []).map((s) => ({ ...s, id: s.id || s.shopId || s.shop_id || s.shopId }));
      setShops(normalizedShops);
      setRegions(regionsData || []);
    } catch (error) {
      console.error('[AdminStores] Failed to load data:', error);
      setToast({ open: true, message: "데이터 로드 실패", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      setEventLoading(true);
      const data = await storageAdapter.getAllShopEvents({});
      setShopEvents(data || []);
    } catch (error) {
      console.error('[AdminStores] Failed to load events:', error);
      setToast({ open: true, message: "이벤트 로드 실패", type: "error" });
    } finally {
      setEventLoading(false);
    }
  };

  const handleEventStatusUpdate = async (eventId, status, reason) => {
    try {
      const token = getAdminToken();
      await storageAdapter.updateShopEventStatus(eventId, status, reason || null, token);
      setToast({ open: true, message: status === 'approved' ? '이벤트가 승인되었습니다.' : '이벤트가 반려되었습니다.', type: 'success' });
      await loadEvents();
    } catch (error) {
      setToast({ open: true, message: '상태 변경 실패: ' + error.message, type: 'error' });
    }
  };

  const handleEventDelete = async (eventId) => {
    if (!window.confirm('이 이벤트를 삭제하시겠습니까?')) return;
    try {
      const token = getAdminToken();
      await storageAdapter.deleteShopEvent(eventId, token, null);
      setToast({ open: true, message: '이벤트가 삭제되었습니다.', type: 'success' });
      await loadEvents();
    } catch (error) {
      setToast({ open: true, message: '삭제 실패: ' + error.message, type: 'error' });
    }
  };

  const handleEventCreate = async () => {
    if (!eventCreateForm.shopId) { setToast({ open: true, message: '상점을 선택하세요.', type: 'error' }); return; }
    if (!eventCreateForm.title.trim()) { setToast({ open: true, message: '이벤트 제목을 입력하세요.', type: 'error' }); return; }
    if (!eventCreateForm.startDate || !eventCreateForm.endDate) { setToast({ open: true, message: '기간을 입력하세요.', type: 'error' }); return; }
    setEventCreateSaving(true);
    try {
      const token = getAdminToken();
      await storageAdapter.createShopEvent(
        { shopId: eventCreateForm.shopId, title: eventCreateForm.title.trim(), content: eventCreateForm.content.trim(), imageUrl: eventCreateForm.imageUrl || null, startDate: eventCreateForm.startDate, endDate: eventCreateForm.endDate },
        token, null
      );
      setToast({ open: true, message: '이벤트가 등록되었습니다.', type: 'success' });
      setEventCreateOpen(false);
      setEventCreateForm({ shopId: '', title: '', content: '', imageUrl: '', startDate: '', endDate: '' });
      await loadEvents();
    } catch (err) {
      setToast({ open: true, message: '등록 실패: ' + err.message, type: 'error' });
    } finally {
      setEventCreateSaving(false);
    }
  };

  const handleEventEdit = async () => {
    if (!editEventForm.title.trim()) { setToast({ open: true, message: '이벤트 제목을 입력하세요.', type: 'error' }); return; }
    setEditEventSaving(true);
    try {
      const token = getAdminToken();
      await storageAdapter.updateShopEvent(editEventTarget.eventId, { title: editEventForm.title.trim(), content: editEventForm.content.trim(), imageUrl: editEventForm.imageUrl || null, startDate: editEventForm.startDate, endDate: editEventForm.endDate }, token, null);
      setToast({ open: true, message: '이벤트가 수정되었습니다.', type: 'success' });
      setEditEventOpen(false);
      await loadEvents();
    } catch (err) {
      setToast({ open: true, message: '수정 실패: ' + err.message, type: 'error' });
    } finally {
      setEditEventSaving(false);
    }
  };

  // 필터링된 상점 목록
  const filteredShops = useMemo(() => {
    let list = [...shops];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) => s.name.toLowerCase().includes(q) || s.owner?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((s) => s.status === statusFilter);
    }
    if (regionFilter !== "all") {
      if (regionFilter === "none") {
        list = list.filter((s) => !s.regionId);
      } else {
        list = list.filter((s) => s.regionId === regionFilter);
      }
    }
    list.sort((a, b) => (Number(b.displayOrder) || 0) - (Number(a.displayOrder) || 0));
    return list;
  }, [shops, search, statusFilter, regionFilter]);

  // 지역명 가져오기
  const getRegionName = (regionId) => {
    if (!regionId) return "미지정";
    const region = regions.find((r) => r.id === regionId);
    return region ? region.name : "알 수 없음";
  };

  // 상태 정보 가져오기
  const getStatusInfo = (status) => {
    return STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];
  };

  // 모달 열기
  const openCreateModal = () => {
    setEditingShop(null);
    setModalOpen(true);
  };

  const openEditModal = (shop) => {
    const normalized = { ...shop, id: shop.id || shop.shopId || shop.shop_id || shop.shopId };
    setEditingShop(normalized);
    setModalOpen(true);
  };

  // 저장
  const handleSave = async (data) => {
    try {
      const processedData = {
        ...data,
        regionId: data.regionId || null,
        displayOrder: Number(data.displayOrder) || 0,
      };

      if (editingShop) {
        // 수정: id 포함하여 upsert
        await storageAdapter.upsertShop({ ...processedData, id: editingShop.id });
        setToast({ open: true, message: "상점이 수정되었습니다.", type: "success" });
      } else {
        // 생성: id 없이 upsert (서버가 자동 생성)
        await storageAdapter.upsertShop(processedData);
        setToast({ open: true, message: "상점이 추가되었습니다.", type: "success" });
      }
      
      // ✅ STEP 2: 저장 성공 후 localStorage 완전 차단
      try {
        localStorage.removeItem('su_shops_v1');
        localStorage.removeItem('su_stores_v1');
        localStorage.removeItem('shops');
        localStorage.removeItem('stores');
        localStorage.removeItem('su_shops');
        console.log('[AdminStores] ✅ localStorage shops keys cleared after save');
      } catch (e) {}
      
      setModalOpen(false);
      await loadData(); // ✅ 서버에서 재조회
    } catch (error) {
      console.error('[AdminStores] Save failed:', error);
      setToast({ open: true, message: error.message || "저장 실패", type: "error" });
    }
  };

  // 삭제
  const openDeleteConfirm = (id) => {
    setDeleteTargetId(id);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (deleteTargetId) {
      try {
        await storageAdapter.deleteShop(deleteTargetId);
        
        // ✅ STEP 2: 삭제 성공 후 localStorage 완전 차단
        try {
          localStorage.removeItem('su_shops_v1');
          localStorage.removeItem('su_stores_v1');
          localStorage.removeItem('shops');
          localStorage.removeItem('stores');
          localStorage.removeItem('su_shops'); // syncManager 키
          console.log('[AdminStores] ✅ localStorage shops keys cleared');
        } catch (e) {
          console.warn('[AdminStores] localStorage clear failed:', e);
        }
        
        setToast({ open: true, message: "상점이 삭제되었습니다.", type: "success" });
        await loadData(); // ✅ 서버에서 재조회 (localStorage 사용 금지)
      } catch (error) {
        console.error('[AdminStores] Delete failed:', error);
        setToast({ open: true, message: "삭제 실패", type: "error" });
      }
    }
    setConfirmOpen(false);
    setDeleteTargetId(null);
  };

  // 상태 변경
  const handleStatusChange = async (id, newStatus) => {
    try {
      const shop = shops.find(s => (s.id === id) || (s.shopId === id) || (s.shop_id === id));
      if (!shop) return;
      const payload = {
        ...shop,
        status: newStatus,
        ...(newStatus === 'approved' ? { isVisible: true, isPublic: true } : {}),
      };
      if (!payload.id && (shop.shopId || shop.shop_id)) payload.id = shop.shopId || shop.shop_id;
      await storageAdapter.upsertShop(payload);
      
      // ✅ localStorage 클리어
      try {
        localStorage.removeItem('su_shops_v1');
        localStorage.removeItem('su_stores_v1');
        localStorage.removeItem('shops');
        localStorage.removeItem('stores');
        localStorage.removeItem('su_shops');
      } catch (e) {}
      
      const statusInfo = getStatusInfo(newStatus);
      setToast({ open: true, message: `상점이 ${statusInfo.label}되었습니다.`, type: "success" });
      await loadData(); // 서버에서 재조회
    } catch (error) {
      console.error('[AdminStores] Status change failed:', error);
      setToast({ open: true, message: "상태 변경 실패", type: "error" });
    }
  };

  // 노출 토글
  const handleToggleVisibility = async (id) => {
    try {
      const shop = shops.find(s => (s.id === id) || (s.shopId === id) || (s.shop_id === id));
      if (!shop) return;
      const payload = { ...shop, isVisible: !shop.isVisible };
      if (!payload.id && (shop.shopId || shop.shop_id)) payload.id = shop.shopId || shop.shop_id;
      await storageAdapter.upsertShop(payload);
      
      // ✅ localStorage 클리어
      try {
        localStorage.removeItem('su_shops_v1');
        localStorage.removeItem('su_stores_v1');
        localStorage.removeItem('shops');
        localStorage.removeItem('stores');
        localStorage.removeItem('su_shops');
      } catch (e) {}
      
      setToast({ open: true, message: "노출 상태가 변경되었습니다.", type: "success" });
      await loadData(); // 서버에서 재조회
    } catch (error) {
      console.error('[AdminStores] Visibility toggle failed:', error);
      setToast({ open: true, message: "노출 상태 변경 실패", type: "error" });
    }
  };

  // 폼 필드 정의 (선택된 regionId 기반 구/군 디스플레이)
  const formFields = useMemo(() => [
    { key: "name", label: "상점명", type: "text", placeholder: "상점명 입력", required: true },
    { key: "category", label: "업종", type: "select", options: SHOP_CATEGORIES, required: true },
    { key: "description", label: "소개", type: "textarea", placeholder: "상점 소개", rows: 3 },
    { key: "owner", label: "대표자", type: "text", placeholder: "대표자명" },
    { key: "phone", label: "연락처", type: "text", placeholder: "010-0000-0000" },
    { key: "address", label: "주소", type: "text", placeholder: "상세 주소" },
    { key: "thumbnail", label: "대표 이미지 URL", type: "text", placeholder: "https://..." },
    {
      key: "regionId",
      label: "지역",
      type: "select",
      options: [{ value: "", label: "미지정" }, ...regions.map((r) => ({ value: String(r.id), label: r.name }))],
    },
    ...(currentFormData.regionId && districts.length > 0 ? [{ key: "districtId", label: "구/군", type: "select", options: [
      { value: "", label: "구/군 전체" },
      ...districts.map(d => ({ value: d.id, label: d.name }))
    ]}] : []),
    { key: "status", label: "승인 상태", type: "select", options: STATUS_OPTIONS.map((s) => ({ value: s.value, label: s.label })) },
    { key: "displayOrder", label: "노출 순서", type: "number", placeholder: "0, 10, 20… (클수록 위)" },
    { key: "isVisible", label: "노출 여부", type: "checkbox", placeholder: "노출" },
    { key: "reviewAllowed", label: "리뷰 허용", type: "checkbox", placeholder: "리뷰 허용" },
    { key: "vipVoucherCount", label: "VIP 상품권 수", type: "number", placeholder: "0" },
  ], [regions, districts, currentFormData.regionId]);

  // 스타일
  const pageStyle = { minHeight: "100vh", background: "#0f0f14", padding: "20px 16px 100px" };
  const headerStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 };
  const titleStyle = { fontSize: 20, fontWeight: 800, display: "flex", alignItems: "center", gap: 10 };
  const backBtnStyle = { background: "none", border: "none", color: "#a855f7", fontSize: 14, cursor: "pointer" };
  const addBtnStyle = { padding: "10px 20px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" };

  const statsRowStyle = { display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" };
  const statBadgeStyle = (color, isActive) => ({
    padding: "8px 16px",
    borderRadius: 8,
    background: isActive ? color : "rgba(255,255,255,0.08)",
    color: isActive ? "#fff" : "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
  });

  const filterRowStyle = { display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" };
  const inputStyle = { flex: 1, minWidth: 150, padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "inherit", fontSize: 14, outline: "none" };
  const selectStyle = { ...inputStyle, flex: "none", minWidth: 100 };

  const cardStyle = { background: "#18181b", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", padding: 16, marginBottom: 12 };
  const cardHeaderStyle = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 };
  const shopNameStyle = { fontSize: 16, fontWeight: 700 };
  const badgeStyle = (color) => ({ display: "inline-block", padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: `${color}20`, color, marginLeft: 8 });
  const infoRowStyle = { display: "flex", gap: 16, fontSize: 13, opacity: 0.7, marginBottom: 10, flexWrap: "wrap" };
  const actionRowStyle = { display: "flex", gap: 8, flexWrap: "wrap" };
  const actionBtnStyle = (color) => ({ padding: "6px 12px", borderRadius: 6, border: "none", background: color, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" });

  // 통계
  const stats = {
    all: shops.length,
    pending: shops.filter((s) => s.status === "pending").length,
    approved: shops.filter((s) => s.status === "approved").length,
    rejected: shops.filter((s) => s.status === "rejected").length,
  };

  // 이벤트 필터링
  const filteredEvents = useMemo(() => {
    if (eventStatusFilter === 'all') return shopEvents;
    return shopEvents.filter(e => e.status === eventStatusFilter);
  }, [shopEvents, eventStatusFilter]);

  const EVENT_STATUS_OPTIONS = [
    { value: 'all', label: '전체', color: '#a855f7' },
    { value: 'pending', label: '대기', color: '#f59e0b' },
    { value: 'approved', label: '승인', color: '#22c55e' },
    { value: 'rejected', label: '반려', color: '#ef4444' },
  ];

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={titleStyle}>
          <button style={backBtnStyle} onClick={() => navigate("/admin")}>← 뒤로</button>
          {activeTab === 'shops' ? '🏪 상점 관리' : '🎉 이벤트 관리'}
        </div>
        {activeTab === 'shops' && <button style={addBtnStyle} onClick={openCreateModal}>+ 상점 등록</button>}
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button
          onClick={() => setActiveTab('shops')}
          style={{ padding: '8px 20px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', background: activeTab === 'shops' ? 'linear-gradient(135deg,#8b5cf6,#7c3aed)' : 'rgba(255,255,255,0.08)', color: activeTab === 'shops' ? '#fff' : 'rgba(255,255,255,0.6)' }}
        >🏪 상점 관리</button>
        <button
          onClick={() => { setActiveTab('events'); if (shopEvents.length === 0) loadEvents(); }}
          style={{ padding: '8px 20px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', background: activeTab === 'events' ? 'linear-gradient(135deg,#f97316,#ef4444)' : 'rgba(255,255,255,0.08)', color: activeTab === 'events' ? '#fff' : 'rgba(255,255,255,0.6)' }}
        >🎉 이벤트 관리 {shopEvents.filter(e=>e.status==='pending').length > 0 && <span style={{marginLeft:4,background:'#ef4444',color:'#fff',borderRadius:999,padding:'1px 7px',fontSize:11}}>{shopEvents.filter(e=>e.status==='pending').length}</span>}</button>
      </div>

      {activeTab === 'events' && (
        <div style={{ marginBottom: 80 }}>
          {/* 이벤트 상태 필터 */}
          <div style={statsRowStyle}>
            {EVENT_STATUS_OPTIONS.map(opt => (
              <button key={opt.value} style={statBadgeStyle(opt.color, eventStatusFilter === opt.value)} onClick={() => setEventStatusFilter(opt.value)}>
                {opt.label} ({opt.value === 'all' ? shopEvents.length : shopEvents.filter(e=>e.status===opt.value).length})
              </button>
            ))}
            <button style={{ ...statBadgeStyle('#f97316', false) }} onClick={() => { setEventCreateForm({ shopId: '', title: '', content: '', imageUrl: '', startDate: '', endDate: '' }); setEventCreateOpen(true); }}>+ 이벤트 등록</button>
            <button style={{ ...statBadgeStyle('#60a5fa', false) }} onClick={loadEvents}>새로고침</button>
          </div>

          {/* 이벤트 목록 */}
          {eventLoading ? (
            <div style={{ textAlign: 'center', padding: 60, opacity: 0.7 }}><div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div><div>이벤트를 불러오는 중...</div></div>
          ) : filteredEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, opacity: 0.5 }}>등록된 이벤트가 없습니다.</div>
          ) : filteredEvents.map(ev => {
            const evStatusColor = ev.status === 'approved' ? '#22c55e' : ev.status === 'rejected' ? '#ef4444' : '#f59e0b';
            const evStatusLabel = ev.status === 'approved' ? '승인' : ev.status === 'rejected' ? '반려' : '대기';
            return (
              <div key={ev.eventId} style={{ ...cardStyle, borderLeft: `3px solid ${evStatusColor}` }}>
                <div style={cardHeaderStyle}>
                  <div>
                    <span style={shopNameStyle}>{ev.title}</span>
                    <span style={badgeStyle(evStatusColor)}>{evStatusLabel}</span>
                  </div>
                  <span style={{ fontSize: 12, opacity: 0.55 }}>{ev.shopName || ev.shopId}</span>
                </div>
                <div style={infoRowStyle}>
                  <span>🏪 {ev.shopCategory || '-'}</span>
                  <span>📅 {ev.startDate?.slice(0,10)} ~ {ev.endDate?.slice(0,10)}</span>
                  <span>👤 {ev.createdBy || '-'}</span>
                </div>
                {ev.content && <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 8, whiteSpace: 'pre-wrap' }}>{ev.content.slice(0, 80)}{ev.content.length > 80 ? '...' : ''}</div>}
                {ev.status === 'rejected' && ev.rejectReason && (
                  <div style={{ fontSize: 12, color: '#fca5a5', background: 'rgba(239,68,68,0.1)', borderRadius: 6, padding: '4px 10px', marginBottom: 8 }}>반려 사유: {ev.rejectReason}</div>
                )}
                <div style={actionRowStyle}>
                  {ev.status !== 'approved' && (
                    <button style={actionBtnStyle('rgba(34,197,94,0.8)')} onClick={() => handleEventStatusUpdate(ev.eventId, 'approved', null)}>✅ 승인</button>
                  )}
                  {ev.status !== 'rejected' && (
                    <button style={actionBtnStyle('rgba(239,68,68,0.6)')} onClick={() => { setRejectTargetId(ev.eventId); setRejectReason(''); setRejectModalOpen(true); }}>❌ 반려</button>
                  )}
                  {ev.status !== 'pending' && (
                    <button style={actionBtnStyle('rgba(107,114,128,0.6)')} onClick={() => handleEventStatusUpdate(ev.eventId, 'pending', null)}>🔄 대기</button>
                  )}
                  <button style={actionBtnStyle('rgba(99,102,241,0.8)')} onClick={() => { setEditEventTarget(ev); setEditEventForm({ title: ev.title, content: ev.content || '', imageUrl: ev.imageUrl || '', startDate: ev.startDate?.slice(0,10) || '', endDate: ev.endDate?.slice(0,10) || '' }); setEditEventOpen(true); }}>✏️ 수정</button>
                  <button style={actionBtnStyle('rgba(239,68,68,0.8)')} onClick={() => handleEventDelete(ev.eventId)}>🗑️ 삭제</button>
                </div>
              </div>
            );
          })}

          {/* 반려 사유 입력 모달 */}
          {rejectModalOpen && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1600 }}
              onClick={() => setRejectModalOpen(false)}>
              <div style={{ background: '#1a2332', borderRadius: 16, padding: '28px 24px', width: '100%', maxWidth: 380, boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}
                onClick={e => e.stopPropagation()}>
                <div style={{ fontWeight: 800, fontSize: 17, color: '#e2e8f0', marginBottom: 16 }}>❌ 반려 사유 입력</div>
                <textarea
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="반려 사유를 입력하세요 (선택)"
                  rows={3}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#e2e8f0', fontSize: 14, resize: 'vertical', boxSizing: 'border-box', marginBottom: 16 }}
                />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setRejectModalOpen(false)} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#94a3b8', fontWeight: 700, cursor: 'pointer' }}>취소</button>
                  <button onClick={() => { handleEventStatusUpdate(rejectTargetId, 'rejected', rejectReason); setRejectModalOpen(false); }} style={{ flex: 2, padding: '10px 0', borderRadius: 8, border: 'none', background: 'linear-gradient(90deg,#ef4444,#dc2626)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>반려 확정</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 이벤트 등록 모달 */}
      {eventCreateOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1700 }}
          onClick={() => { if (!eventCreateSaving) setEventCreateOpen(false); }}>
          <div style={{ background: '#1a2332', borderRadius: '16px 16px 0 0', width: '100%', maxWidth: 480, padding: '24px 20px 32px', maxHeight: '90dvh', overflowY: 'auto', boxShadow: '0 -8px 40px rgba(0,0,0,0.5)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 800, fontSize: 17, color: '#e2e8f0', marginBottom: 18 }}>🎉 이벤트 등록 (관리자)</div>
            <div style={{ display: 'grid', gap: 10 }}>
              <div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>상점 선택 *</div>
                <select value={eventCreateForm.shopId} onChange={e => setEventCreateForm(p => ({ ...p, shopId: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#e2e8f0', fontSize: 14, boxSizing: 'border-box' }}>
                  <option value="">-- 상점 선택 --</option>
                  {shops.filter(s => s.status === 'approved').map(s => (
                    <option key={String(s.id || s.shopId || s.shop_id || '')} value={String(s.id || s.shopId || s.shop_id || '')}>{`${s.name} (${String(s.id || s.shopId || s.shop_id || '')})`}</option>
                  ))}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>이벤트 제목 *</div>
                <input value={eventCreateForm.title} onChange={e => setEventCreateForm(p => ({ ...p, title: e.target.value }))} placeholder="이벤트 제목"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#e2e8f0', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>이벤트 내용</div>
                <textarea value={eventCreateForm.content} onChange={e => setEventCreateForm(p => ({ ...p, content: e.target.value }))} placeholder="이벤트 상세 내용" rows={3}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#e2e8f0', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>이미지 URL (선택)</div>
                <input value={eventCreateForm.imageUrl} onChange={e => setEventCreateForm(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#e2e8f0', fontSize: 13, boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>시작일 *</div>
                  <input type="date" value={eventCreateForm.startDate} onChange={e => setEventCreateForm(p => ({ ...p, startDate: e.target.value }))}
                    style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#e2e8f0', fontSize: 13, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>종료일 *</div>
                  <input type="date" value={eventCreateForm.endDate} onChange={e => setEventCreateForm(p => ({ ...p, endDate: e.target.value }))}
                    style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#e2e8f0', fontSize: 13, boxSizing: 'border-box' }} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setEventCreateOpen(false)} disabled={eventCreateSaving}
                style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#94a3b8', fontWeight: 700, cursor: 'pointer' }}>취소</button>
              <button onClick={handleEventCreate} disabled={eventCreateSaving}
                style={{ flex: 2, padding: '11px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(90deg,#f97316,#ef4444)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
                {eventCreateSaving ? '등록 중...' : '이벤트 등록'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 이벤트 수정 모달 */}
      {editEventOpen && editEventTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1700 }}
          onClick={() => { if (!editEventSaving) setEditEventOpen(false); }}>
          <div style={{ background: '#1a2332', borderRadius: '16px 16px 0 0', width: '100%', maxWidth: 480, padding: '24px 20px 32px', maxHeight: '90dvh', overflowY: 'auto', boxShadow: '0 -8px 40px rgba(0,0,0,0.5)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 800, fontSize: 17, color: '#e2e8f0', marginBottom: 18 }}>✏️ 이벤트 수정</div>
            <div style={{ display: 'grid', gap: 10 }}>
              <div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>이벤트 제목 *</div>
                <input value={editEventForm.title} onChange={e => setEditEventForm(p => ({ ...p, title: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#e2e8f0', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>이벤트 내용</div>
                <textarea value={editEventForm.content} onChange={e => setEditEventForm(p => ({ ...p, content: e.target.value }))} rows={3}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#e2e8f0', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>이미지 URL</div>
                <input value={editEventForm.imageUrl} onChange={e => setEditEventForm(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#e2e8f0', fontSize: 13, boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>시작일</div>
                  <input type="date" value={editEventForm.startDate} onChange={e => setEditEventForm(p => ({ ...p, startDate: e.target.value }))}
                    style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#e2e8f0', fontSize: 13, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>종료일</div>
                  <input type="date" value={editEventForm.endDate} onChange={e => setEditEventForm(p => ({ ...p, endDate: e.target.value }))}
                    style={{ width: '100%', padding: '9px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)', color: '#e2e8f0', fontSize: 13, boxSizing: 'border-box' }} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setEditEventOpen(false)} disabled={editEventSaving}
                style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#94a3b8', fontWeight: 700, cursor: 'pointer' }}>취소</button>
              <button onClick={handleEventEdit} disabled={editEventSaving}
                style={{ flex: 2, padding: '11px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>
                {editEventSaving ? '저장 중...' : '수정 완료'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'shops' && <>
      {/* Stats Tabs */}
      <div style={statsRowStyle}>
        <button style={statBadgeStyle("#a855f7", statusFilter === "all")} onClick={() => setStatusFilter("all")}>
          전체 ({stats.all})
        </button>
        <button style={statBadgeStyle("#f59e0b", statusFilter === "pending")} onClick={() => setStatusFilter("pending")}>
          대기 ({stats.pending})
        </button>
        <button style={statBadgeStyle("#22c55e", statusFilter === "approved")} onClick={() => setStatusFilter("approved")}>
          승인 ({stats.approved})
        </button>
        <button style={statBadgeStyle("#ef4444", statusFilter === "rejected")} onClick={() => setStatusFilter("rejected")}>
          반려 ({stats.rejected})
        </button>
      </div>

      {/* Filters */}
      <div style={filterRowStyle}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="상점명/대표자 검색..."
          style={inputStyle}
        />
        <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} style={selectStyle}>
          <option key="all" value="all">전체 지역</option>
          <option key="none" value="none">미지정</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, opacity: 0.7 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <div>데이터를 불러오는 중...</div>
        </div>
      ) : filteredShops.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, opacity: 0.5 }}>등록된 상점이 없습니다.</div>
      ) : (
        filteredShops.map((shop) => {
              const statusInfo = getStatusInfo(shop.status);
              const sid = shop.id || shop.shopId || shop.shop_id;
              return (
                <div key={sid} style={cardStyle}>
              <div style={cardHeaderStyle}>
                <div>
                  <span style={shopNameStyle}>{shop.name}</span>
                  <span style={badgeStyle(statusInfo.color)}>{statusInfo.label}</span>
                  {!shop.isVisible && <span style={badgeStyle("#6b7280")}>숨김</span>}
                </div>
                <span style={{ fontSize: 12, opacity: 0.5 }}>{shop.category}</span>
              </div>
              <div style={infoRowStyle}>
                <span>📍 {getRegionName(shop.regionId)}</span>
                <span>👤 {shop.owner || "-"}</span>
                <span>📞 {shop.phone || "-"}</span>
                <span>🔢 순서 {Number(shop.displayOrder) || 0}</span>
              </div>
              {shop.description && (
                <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 10 }}>{shop.description}</div>
              )}
              <div style={actionRowStyle}>
                <button style={actionBtnStyle("rgba(168,85,247,0.8)")} onClick={() => openEditModal(shop)}>
                  ✏️ 수정
                </button>
                {shop.status !== "approved" && (
                  <button style={actionBtnStyle("rgba(34,197,94,0.8)")} onClick={() => handleStatusChange(sid, "approved")}>
                    ✅ 승인
                  </button>
                )}
                {shop.status !== "rejected" && (
                  <button style={actionBtnStyle("rgba(239,68,68,0.6)")} onClick={() => handleStatusChange(sid, "rejected")}>
                    ❌ 반려
                  </button>
                )}
                <button
                  style={actionBtnStyle(shop.isVisible ? "rgba(107,114,128,0.8)" : "rgba(59,130,246,0.8)")}
                  onClick={() => handleToggleVisibility(sid)}
                >
                  {shop.isVisible ? "👁️ 숨김" : "👁️ 노출"}
                </button>
                <button style={actionBtnStyle("rgba(239,68,68,0.8)")} onClick={() => openDeleteConfirm(sid)}>
                  🗑️ 삭제
                </button>
              </div>
            </div>
          );
        })
      )}

      {/* Modal */}
      <AdminModalForm
        open={modalOpen}
        title={editingShop ? "상점 수정" : "상점 등록"}
        fields={formFields}
        initialData={editingShop || { status: "pending", isVisible: true, reviewAllowed: true, vipVoucherCount: 0, displayOrder: 0 }}
        onSubmit={handleSave}
        onChange={(data) => setCurrentFormData(data)}
        onCancel={() => { setModalOpen(false); setDistricts([]); setCurrentFormData({}); }}
        submitText={editingShop ? "수정" : "등록"}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={confirmOpen}
        title="상점 삭제"
        message="이 상점을 삭제하시겠습니까?"
        confirmText="삭제"
        confirmColor="#ef4444"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      </> }

      {/* Toast */}
      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, open: false })} />
    </div>
  );
}
