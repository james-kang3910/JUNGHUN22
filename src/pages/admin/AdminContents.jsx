import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { isAdminAuthenticatedLocal } from "../../lib/adminAuth";
import * as storageAdapter from "../../lib/storageAdapter";
import MultiImageUploader, { normalizeImageList } from "../../components/MultiImageUploader";
import AdminModalForm from "./components/AdminModalForm";
import ConfirmDialog from "./components/ConfirmDialog";
import Toast from "./components/Toast";

function resolveNoticeActionId(item) {
  if (!item || typeof item !== 'object') return null;
  if (item.id) return item.id;
  if (item.noticeId) return item.noticeId;
  if (item.notice_id) return item.notice_id;
  const scope = String(item.scope || '').toUpperCase();
  const regionId = String(item.regionId || '').trim();
  const title = String(item.title || '').trim();
  if (scope === 'REGION' && regionId && /지역 포탈에 오신 것을 환영합니다!?$/.test(title)) {
    return `notice_region_welcome_${regionId}`;
  }
  return null;
}

function getTodayLocalYmd() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function AdminContents() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("notices"); // notices | broadcasts | banners | supplies | boards | regionNews
  const [notices, setNotices] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [supplies, setSupplies] = useState([]);
  const [boards, setBoards] = useState([]);
  const [regionNews, setRegionNews] = useState([]);
  const [regions, setRegions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal/Dialog 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  
  // ★ 모달 폼 데이터 추적 (scope 변경 감지용)
  const [currentFormData, setCurrentFormData] = useState({});
  // 구/군 목록 (현재 선택된 regionId 기반)
  const [districts, setDistricts] = useState([]);
  // 신규 아이템 기본값 — 렌더마다 새 객체 생성 방지 (무한 루프 원인)
  const defaultNewItemData = useMemo(() => ({ isPublic: true, isPinned: false, isActive: true, scope: "ALL" }), []);

  // Toast 상태
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });

  // 이미지 업로드 상태 (A1, A2)
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isAdminAuthenticatedLocal()) {
      navigate("/admin/login", { replace: true });
      return;
    }
    loadData();
  }, [navigate]);

  useEffect(() => {
    const handleSsotChanged = (event) => {
      const changedType = String(event?.detail?.type || '').toLowerCase();
      if (changedType === 'notices') {
        loadData();
      }
    };

    window.addEventListener('su:ssot:changed', handleSsotChanged);
    return () => {
      window.removeEventListener('su:ssot:changed', handleSsotChanged);
    };
  }, []);

  // 선택된 regionId 변경 시 구/군 목록 로드
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
    setLoading(true);
    setError(null);
    try {
      const serverRegions = await storageAdapter.getRegions();
      const [serverNotices, serverBroadcasts, serverBanners, serverSupplies, serverBoards, serverRegionNews] = await Promise.all([
        storageAdapter.getNotices(),
        storageAdapter.getAllBroadcasts({ publicOnly: false }),
        storageAdapter.getBanners(),
        storageAdapter.fetchSupplies().catch(() => []),
        storageAdapter.getBoards({ limit: 200 }).catch(() => []),
        storageAdapter.getAdminRegionNews().catch(() => []),
      ]);

      setNotices(Array.isArray(serverNotices) ? serverNotices : []);
      setBroadcasts(Array.isArray(serverBroadcasts) ? serverBroadcasts : []);
      setRegionNews(Array.isArray(serverRegionNews) ? serverRegionNews : []);

      // storageAdapter.getBanners returns normalized banner objects (id, imageUrl, alt...)
      setBanners((Array.isArray(serverBanners) ? serverBanners : []).map(b => ({
        id: b.id,
        title: b.title || b.alt || '',
        description: b.description || '',
        imageUrl: b.imageUrl,
        videoUrl: b.videoUrl || '',
        alt: b.alt,
        linkUrl: b.linkUrl,
        regions: b.regions || [],
        startDate: b.startDate || null,
        endDate: b.endDate || null,
        isActive: b.isActive ?? true,
        priority: b.priority || 0,
        weight: b.weight || 100,
        createdAt: b.createdAt || new Date().toISOString(),
        updatedAt: b.updatedAt || new Date().toISOString(),
        gradientEnabled: b.gradientEnabled ?? false,
        gradientPreset: b.gradientPreset || 'dark',
        gradientColor1: b.gradientColor1 || null,
        gradientColor2: b.gradientColor2 || null,
        gradientStop1: b.gradientStop1 ?? 0,
        gradientStop2: b.gradientStop2 ?? 100,
        chipLabel: b.chipLabel || '',
      })));

      setSupplies(Array.isArray(serverSupplies) ? serverSupplies : []);
      setBoards(Array.isArray(serverBoards) ? serverBoards : (serverBoards?.posts || []));
      setRegions(serverRegions || []);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError(err.message || "데이터 로딩 실패");
      setNotices([]);
      setBroadcasts([]);
      setBanners([]);
      setRegionNews([]);
      setRegions([]);
    } finally {
      setLoading(false);
    }
  };

  // 현재 탭의 데이터
  const currentData =
    activeTab === "notices"
      ? notices
      : activeTab === "broadcasts"
      ? broadcasts
      : activeTab === "banners"
      ? banners
      : activeTab === "boards"
      ? boards
      : activeTab === "regionNews"
      ? regionNews
      : supplies;

  // 필터링된 목록
  const filteredList = useMemo(() => {
    let list = [...currentData];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((item) => (item.title || '').toLowerCase().includes(q));
    }
    // 공지사항/지역뉴스는 고정 우선 정렬
    if (activeTab === "notices" || activeTab === "regionNews") {
      list.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }
    return list;
  }, [currentData, search, activeTab]);

  // 지역명 가져오기
  const getRegionName = (regionId) => {
    if (!regionId) return "전체";
    const region = regions.find((r) => r.id === regionId);
    return region ? region.name : "알 수 없음";
  };

  // 모달 열기
  const openCreateModal = () => {
    setEditingItem(null);
    setPreviewImage(null);
    setCurrentFormData({ scope: "ALL" });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setPreviewImage(item.imageUrl || null);
    setCurrentFormData({
      scope: String(item?.scope || 'ALL').toUpperCase(),
      regionId: item?.regionId || '',
      districtId: item?.districtId || '',
      isPopup: !!item?.isPopup,
    });
    setModalOpen(true);
  };

  // 이미지 업로드 핸들러 (A1, A2, C8)
  const handleImageUpload = async (file) => {
    if (!file) return;
    
    // 파일 타입 검증
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setToast({ open: true, message: "JPEG, PNG, GIF, WebP 파일만 업로드 가능합니다.", type: "error" });
      return;
    }
    
    // 파일 크기 검증 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setToast({ open: true, message: "파일 크기는 10MB 이하여야 합니다.", type: "error" });
      return;
    }

    // 로컬 미리보기 (A1)
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target.result);
    };
    reader.readAsDataURL(file);

    // 서버 업로드
    setUploadingImage(true);
    setUploadProgress(0);
    
    try {
      const result = await storageAdapter.uploadBannerImage(file);
      // 서버는 { ok: true, imageUrl } 반환 — success 대신 ok 체크
      if (result.ok || result.success) {
        setUploadProgress(100);
        setToast({ open: true, message: "이미지가 업로드되었습니다.", type: "success" });
        return result.imageUrl;
      } else {
        throw new Error(result.error || "업로드 실패");
      }
    } catch (err) {
      setToast({ open: true, message: err.message || "이미지 업로드 실패", type: "error" });
      setPreviewImage(null);
      return null;
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
    }
  };

  // 드래그 앤 드롭 핸들러 (A2)
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const imageUrl = await handleImageUpload(files[0]);
      if (imageUrl && editingItem) {
        // 업로드 성공 시 편집 중인 아이템에 imageUrl 설정
        const updated = { ...editingItem, imageUrl };
        setEditingItem(updated);
      }
    }
  };

  // 저장
  const handleSave = async (data) => {
    let itemName;
    if (activeTab === "notices") itemName = "공지사항";
    else if (activeTab === "broadcasts") itemName = "방송";
    else if (activeTab === "banners") itemName = "배너";
    else if (activeTab === "boards") itemName = "게시글";
    else if (activeTab === "regionNews") itemName = "지역뉴스";

    const processedData = {
      ...data,
      regionId: data.regionId || null,
    };
    const todayYmd = getTodayLocalYmd();

    if (activeTab === 'regionNews') {
      const images = normalizeImageList(data.images);
      processedData.images = images;
      processedData.thumbnail = images[0] || '';
    }
    
    if (activeTab === "notices") {
      const noticeScope = String(data.scope || 'ALL').toUpperCase() === 'REGION' ? 'REGION' : 'ALL';
      processedData.scope = noticeScope;
      processedData.isPopup = !!data.isPopup;
      if (noticeScope === 'REGION') {
        const selectedRegionId = String(data.regionId || '').trim();
        if (!selectedRegionId) {
          setToast({ open: true, message: '지역공지는 지역을 선택해주세요.', type: 'error' });
          return;
        }
        processedData.regionId = selectedRegionId;
        processedData.regionIds = [selectedRegionId];
        processedData.districtId = String(data.districtId || '').trim() || null;
      } else {
        processedData.regionId = null;
        processedData.regionIds = [];
        processedData.districtId = null;
      }
    }

    try {
      if (activeTab === 'supplies') {
        if (editingItem) {
          await storageAdapter.updateSupply(editingItem.id, processedData);
          setToast({ open: true, message: `보급지원이 수정되었습니다.`, type: 'success' });
        } else {
          await storageAdapter.createSupply(processedData);
          setToast({ open: true, message: `보급지원이 추가되었습니다.`, type: 'success' });
        }
      } else if (activeTab === 'banners') {
        const title = String(processedData.title || '').trim();
        const description = String(processedData.description || '').trim();
        const imageUrl = String(processedData.imageUrl || '').trim();
        const startDate = String(processedData.startDate || '').trim();
        const endDate = String(processedData.endDate || '').trim();

        if (!title) {
          setToast({ open: true, message: "배너 제목을 입력해주세요.", type: "error" });
          return;
        }
        // 신규 등록 시에만 이미지 필수 (수정 시에는 이미지 삭제 허용)
        if (!imageUrl && !editingItem) {
          setToast({ open: true, message: "배너 이미지를 등록해주세요.", type: "error" });
          return;
        }
        if (!startDate || !endDate) {
          setToast({ open: true, message: "노출 시작일과 종료일을 모두 입력해주세요.", type: "error" });
          return;
        }
        if (startDate && startDate < todayYmd) {
          setToast({ open: true, message: "노출 시작일은 오늘 이전으로 설정할 수 없습니다.", type: "error" });
          return;
        }
        if (endDate && endDate < todayYmd) {
          setToast({ open: true, message: "노출 종료일은 오늘 이전으로 설정할 수 없습니다.", type: "error" });
          return;
        }
        if (startDate && endDate && endDate < startDate) {
          setToast({ open: true, message: "노출 종료일은 시작일보다 빠를 수 없습니다.", type: "error" });
          return;
        }
        processedData.title = title;
        processedData.description = description;
        processedData.imageUrl = imageUrl || null;
        processedData.videoUrl = '';
        processedData.alt = title;
        delete processedData.gradientEnabled;
        delete processedData.gradientPreset;
        delete processedData.gradientColor1;
        delete processedData.gradientColor2;
        delete processedData.gradientStop1;
        delete processedData.gradientStop2;
        delete processedData.chipLabel;
        delete processedData.priority;
        delete processedData.weight;
        delete processedData.linkUrl;
        // ★ 수정 시 editingItem.id 포함 (없으면 upsertBanner가 항상 신규 POST 처리)
        if (editingItem && (editingItem.id || editingItem.bannerId)) {
          processedData.id = editingItem.id || editingItem.bannerId;
        }
        const res = await storageAdapter.upsertBanner(processedData);
        if (res && (res.ok || res.success || res.id)) {
          setToast({ open: true, message: `${itemName}이 저장되었습니다.`, type: 'success' });
        } else {
          setToast({ open: true, message: res?.error || `${itemName} 저장 실패`, type: 'error' });
          return;
        }
      } else if (activeTab === 'broadcasts') {
        if (editingItem) {
          const id = editingItem.id;
          const res = await storageAdapter.updateBroadcast(id, processedData);
          if (res && (res.ok || res.success)) setToast({ open: true, message: `${itemName}이 수정되었습니다.`, type: 'success' });
          else setToast({ open: true, message: res?.error || '수정 실패', type: 'error' });
        } else {
          const res = await storageAdapter.createBroadcast(processedData);
          if (res && (res.ok || res.success)) setToast({ open: true, message: `${itemName}이 추가되었습니다.`, type: 'success' });
          else setToast({ open: true, message: res?.error || '추가 실패', type: 'error' });
        }
      } else if (activeTab === 'notices') {
        if (editingItem) {
          const res = await storageAdapter.updateNotice(editingItem.id, processedData);
          if (res && (res.ok || res.success)) setToast({ open: true, message: `${itemName}이 수정되었습니다.`, type: 'success' });
          else setToast({ open: true, message: res?.error || '수정 실패', type: 'error' });
        } else {
          const res = await storageAdapter.createNotice(processedData);
          if (res && (res.ok || res.success || res.id)) setToast({ open: true, message: `${itemName}이 추가되었습니다.`, type: 'success' });
          else setToast({ open: true, message: res?.error || '추가 실패', type: 'error' });
        }
      } else if (activeTab === 'regionNews') {
        if (editingItem) {
          const id = editingItem.newsId || editingItem.id;
          const res = await storageAdapter.updateAdminRegionNews(id, processedData);
          if (res && (res.ok || res.success || res.news)) setToast({ open: true, message: '지역뉴스가 수정되었습니다.', type: 'success' });
          else setToast({ open: true, message: res?.error || '수정 실패', type: 'error' });
        } else {
          const res = await storageAdapter.createAdminRegionNews(processedData);
          if (res && (res.ok || res.success || res.news)) setToast({ open: true, message: '지역뉴스가 추가되었습니다.', type: 'success' });
          else setToast({ open: true, message: res?.error || '추가 실패', type: 'error' });
        }
      } else if (activeTab === 'boards') {
        const session = window.__SU_SESSION__;
        const adminId = session?.memberId || 'admin';
        if (editingItem) {
          const res = await storageAdapter.updateBoardPost(editingItem.id, processedData);
          if (res && (res.ok || res.success || res.id)) setToast({ open: true, message: `${itemName}이 수정되었습니다.`, type: 'success' });
          else setToast({ open: true, message: res?.error || '수정 실패', type: 'error' });
        } else {
          const res = await storageAdapter.createBoardPost({ ...processedData, authorId: adminId, authorName: '관리자' });
          if (res && (res.ok || res.success || res.id)) setToast({ open: true, message: `${itemName}이 추가되었습니다.`, type: 'success' });
          else setToast({ open: true, message: res?.error || '추가 실패', type: 'error' });
        }
      }
    } catch (e) {
      console.error('[AdminContents] Save failed:', e);
      setToast({ open: true, message: e.message || `${itemName || '항목'} 저장 실패`, type: 'error' });
      return;
    } finally {
      setModalOpen(false);
      setPreviewImage(null);
      setIsDragging(false);
      loadData();
    }
  };

  // 삭제
  const openDeleteConfirm = (id) => {
    setDeleteTargetId(id);
    setConfirmOpen(true);
  };

  const handleDelete = () => {
    if (!deleteTargetId) {
      setConfirmOpen(false);
      return setDeleteTargetId(null);
    }

    const proceedServerDelete = async (fn, name) => {
      try {
        await fn(deleteTargetId);
        setToast({ open: true, message: `${name}이 삭제되었습니다.`, type: 'success' });
      } catch (e) {
        console.error('[AdminContents] Delete failed:', e);
        setToast({ open: true, message: `삭제 실패: ${e.message || '서버 오류'}`, type: 'error' });
      } finally {
        loadData();
        setConfirmOpen(false);
        setDeleteTargetId(null);
      }
    };

    if (activeTab === "supplies") {
      // Server-side delete for supplies
      (async () => {
        try {
          await storageAdapter.deleteSupply(deleteTargetId);
          setToast({ open: true, message: `보급지원이 삭제되었습니다.`, type: "success" });
        } catch (e) {
          console.error('Failed to delete supply on server:', e);
          setToast({ open: true, message: `삭제 실패: ${e.message || '서버 오류'}`, type: "error" });
        } finally {
          loadData();
          setConfirmOpen(false);
          setDeleteTargetId(null);
        }
      })();
      return;
    }

    if (activeTab === 'notices') return proceedServerDelete(storageAdapter.deleteNotice, '공지사항');
    if (activeTab === 'broadcasts') return proceedServerDelete(storageAdapter.deleteBroadcast, '방송');
    if (activeTab === 'banners') return proceedServerDelete(storageAdapter.deleteBanner, '배너');
    if (activeTab === 'regionNews') return proceedServerDelete(storageAdapter.deleteAdminRegionNews, '지역뉴스');
    if (activeTab === 'boards') {
      const session = window.__SU_SESSION__;
      return proceedServerDelete((id) => storageAdapter.deleteBoardPost(id), '게시글');
    }

    setConfirmOpen(false);
    setDeleteTargetId(null);
  };

  // 고정 토글 (공지사항)
  const handleTogglePin = (item) => {
    (async () => {
      try {
        let res;
        if (activeTab === 'regionNews') {
          const id = item.newsId || item.id;
          res = await storageAdapter.updateAdminRegionNews(id, { isPinned: !item.isPinned });
        } else {
          const noticeId = resolveNoticeActionId(item);
          if (!noticeId) throw new Error('공지 식별자를 찾을 수 없습니다.');
          res = await storageAdapter.updateNotice(noticeId, { isPinned: !item.isPinned });
        }
        if (res && (res.ok || res.success || res.news)) {
          setToast({ open: true, message: item.isPinned ? "고정이 해제되었습니다." : "상단에 고정되었습니다.", type: "success" });
          loadData();
        } else {
          setToast({ open: true, message: res?.error || '고정 변경 실패', type: 'error' });
        }
      } catch (e) {
        setToast({ open: true, message: e.message || '고정 변경 실패', type: 'error' });
      }
    })();
  };

  // 공개 토글 (배너는 활성화 토글)
  const handleTogglePublic = (item) => {
    if (activeTab === "banners") {
      (async () => {
        try {
          const res = await storageAdapter.patchBanner(item.id, { isActive: !item.isActive });
          if (res && (res.ok || res.success)) {
            setToast({ open: true, message: item.isActive ? "배너가 비활성화되었습니다." : "배너가 활성화되었습니다.", type: "success" });
            loadData();
          } else {
            setToast({ open: true, message: res?.error || '배너 상태 변경 실패', type: 'error' });
          }
        } catch (e) {
          setToast({ open: true, message: e.message || '배너 상태 변경 실패', type: 'error' });
        }
      })();
      return;
    }
    (async () => {
      try {
        if (activeTab === 'notices') {
          const res = await storageAdapter.updateNotice(item.id, { isPublic: !item.isPublic });
          if (res && (res.ok || res.success)) {
            setToast({ open: true, message: item.isPublic ? "비공개 처리되었습니다." : "공개되었습니다.", type: "success" });
            loadData();
          } else {
            setToast({ open: true, message: res?.error || '변경 실패', type: 'error' });
          }
        } else if (activeTab === 'broadcasts') {
          const res = await storageAdapter.updateBroadcast(item.id, { isPublic: !item.isPublic });
          if (res && (res.ok || res.success)) {
            setToast({ open: true, message: item.isPublic ? "비공개 처리되었습니다." : "공개되었습니다.", type: "success" });
            loadData();
          } else {
            setToast({ open: true, message: res?.error || '변경 실패', type: 'error' });
          }
        } else if (activeTab === 'regionNews') {
          const id = item.newsId || item.id;
          const res = await storageAdapter.updateAdminRegionNews(id, { isPublic: !item.isPublic });
          if (res && (res.ok || res.success || res.news)) {
            setToast({ open: true, message: item.isPublic ? "비공개 처리되었습니다." : "공개되었습니다.", type: "success" });
            loadData();
          } else {
            setToast({ open: true, message: res?.error || '변경 실패', type: 'error' });
          }
        }
      } catch (e) {
        setToast({ open: true, message: e.message || '변경 실패', type: 'error' });
      }
    })();
  };

  // 폼 필드 정의 (useMemo로 메모이제이션하여 불필요한 재생성 방지)
  const formFields = useMemo(() => {
    if (activeTab === "notices") {
      const regionOptions = [
        { value: "", label: "지역 선택" },
        ...regions.map((r) => ({ value: r.id, label: r.name })),
      ];
      const baseFields = [
        { key: "title", label: "제목", type: "text", placeholder: "공지 제목", required: true },
        { key: "content", label: "내용", type: "textarea", placeholder: "공지 내용", rows: 6, required: true },
        {
          key: "scope",
          label: "공지 범위",
          type: "select",
          options: [
            { value: "ALL", label: "전체 공지" },
            { value: "REGION", label: "지역 공지" },
          ],
        },
      ];

      if (String(currentFormData.scope || 'ALL').toUpperCase() === 'REGION') {
        baseFields.push({ key: "regionId", label: "지역 *", type: "select", options: regionOptions, required: true });
        if (currentFormData.regionId && districts.length > 0) {
          baseFields.push({ key: "districtId", label: "구/군", type: "select", options: [
            { value: "", label: "구/군 전체" },
            ...districts.map(d => ({ value: d.id, label: d.name }))
          ]});
        }
      }

      baseFields.push({
        key: "imageUrl",
        label: "공지 이미지",
        type: "custom",
        customRender: (value, onChange) => (
          <MultiImageUploader
            value={value ? [value] : []}
            maxImages={1}
            onChange={(nextImages) => {
              const nextUrl = Array.isArray(nextImages) && nextImages[0] ? nextImages[0] : "";
              onChange(nextUrl);
              setPreviewImage(nextUrl || null);
            }}
            uploadImage={async (file) => {
              const result = await storageAdapter.uploadContentImage(file, { context: 'notices' });
              return result.imageUrl || result.url || "";
            }}
            onError={(message) => setToast({ open: true, message, type: 'error' })}
            helperText="공지 이미지는 1장까지 등록할 수 있습니다."
          />
        ),
      });

      baseFields.push(
        { key: "isPopup", label: "메인 팝업 노출", type: "checkbox", placeholder: "팝업" },
        { key: "isPinned", label: "상단 고정", type: "checkbox", placeholder: "고정" },
        { key: "isPublic", label: "공개 여부", type: "checkbox", placeholder: "공개" }
      );
      
      return baseFields;
    } else if (activeTab === "broadcasts") {
      const regionOptions = [
        { value: null, label: "전체 지역" },
        ...regions.map((r) => ({ value: r.id, label: r.name })),
      ];
      return [
        { key: "title", label: "제목", type: "text", placeholder: "방송 제목", required: true },
        { key: "videoUrl", label: "영상 URL", type: "text", placeholder: "https://youtube.com/...", required: true },
        { key: "thumbnail", label: "썸네일 URL", type: "text", placeholder: "https://..." },
        { key: "description", label: "설명", type: "textarea", placeholder: "방송 설명", rows: 3 },
        { key: "regionId", label: "지역", type: "select", options: regionOptions },
        ...(currentFormData.regionId && districts.length > 0 ? [{ key: "districtId", label: "구/군", type: "select", options: [
          { value: "", label: "구/군 전체" },
          ...districts.map(d => ({ value: d.id, label: d.name }))
        ]}] : []),
        { key: "isPublic", label: "공개 여부", type: "checkbox", placeholder: "공개" },
      ];
    } else if (activeTab === "supplies") {
      const regionOptions = [
        { value: null, label: "전체 지역" },
        ...regions.map((r) => ({ value: r.id, label: r.name })),
      ];
      return [
        { key: "title", label: "제목", type: "text", placeholder: "보급지원 제목", required: true },
        { key: "description", label: "내용", type: "textarea", placeholder: "보급 상세 설명", rows: 4 },
        { key: "quantity", label: "수량", type: "number", placeholder: "수량" },
        { key: "mediaUrl", label: "첨부(이미지/PDF) URL", type: "text", placeholder: "https://..." },
        { key: "regionId", label: "지역", type: "select", options: regionOptions },
        ...(currentFormData.regionId && districts.length > 0 ? [{ key: "districtId", label: "구/군", type: "select", options: [
          { value: "", label: "구/군 전체" },
          ...districts.map(d => ({ value: d.id, label: d.name }))
        ]}] : []),
        { key: "status", label: "상태", type: "select", options: [ { value: "open", label: "진행중" }, { value: "closed", label: "종료" } ] },
        { key: "isPublic", label: "공개 여부", type: "checkbox", placeholder: "공개" },
      ];
    } else if (activeTab === "banners") {
      const todayYmd = getTodayLocalYmd();
      return [
        { key: 'title', label: '제목', type: 'text', placeholder: '배너 제목', required: true },
        { key: 'description', label: '설명', type: 'textarea', placeholder: '배너 설명', rows: 3 },
        {
          key: "imageUrl",
          label: "이미지 등록",
          type: "custom",
          required: false,
          customRender: (value, onChange) => (
            <div style={{ display: 'grid', gap: 12 }}>
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${isDragging ? '#a855f7' : 'rgba(255,255,255,0.2)'}`,
                  borderRadius: 12,
                  padding: 20,
                  textAlign: 'center',
                  background: isDragging ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.03)',
                  transition: 'all 0.2s',
                }}
              >
                <input
                  type="file"
                  id="banner-image-upload"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const imageUrl = await handleImageUpload(file);
                      if (imageUrl) {
                        onChange(imageUrl);
                        setPreviewImage(imageUrl);
                      }
                    }
                  }}
                />
                <label
                  htmlFor="banner-image-upload"
                  style={{
                    cursor: 'pointer',
                    display: 'block',
                    color: isDragging ? '#a855f7' : 'inherit',
                  }}
                >
                  {uploadingImage ? (
                    <div>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
                      <div style={{ fontSize: 14 }}>업로드 중... {uploadProgress}%</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>📤</div>
                      <div style={{ fontSize: 14, marginBottom: 4 }}>
                        클릭하여 이미지 선택 또는 드래그 앤 드롭
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.6 }}>
                        JPEG, PNG, GIF, WebP (최대 10MB)
                      </div>
                      <div style={{ fontSize: 11, opacity: 0.5, marginTop: 4 }}>
                        4:1 비율 이미지 사용 권장 (1600x400 이상)
                      </div>
                    </div>
                  )}
                </label>
              </div>

              <div>
                <div style={{ fontSize: 12, opacity: 0.72, marginBottom: 6 }}>미리보기</div>
                {value || previewImage ? (
                  <img
                    src={value || previewImage}
                    alt="배너 미리보기"
                    style={{
                      width: '100%',
                      aspectRatio: '16 / 9',
                      objectFit: 'cover',
                      display: 'block',
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.03)'
                    }}
                    onError={(e)=>{ try{ e.target.onerror = null; e.target.src = 'https://picsum.photos/seed/banner-simple/1280/720'; }catch(ex){ e.target.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=' } }}
                  />
                ) : (
                  <div style={{ width: '100%', aspectRatio: '16 / 9', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.08)', display: 'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.4)', background:'rgba(255,255,255,0.02)' }}>16:9 미리보기</div>
                )}
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                <input
                  type="text"
                  value={value || ''}
                  onChange={(e) => {
                    onChange(e.target.value);
                    setPreviewImage(e.target.value);
                  }}
                  placeholder="https://example.com/banner.jpg"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.06)',
                    color: 'inherit',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
                <div style={{ fontSize: 12, lineHeight: 1.5, color: 'rgba(255,255,255,0.68)' }}>
                  16:9 비율 이미지를 권장합니다. 1280x720 이상 이미지를 사용하면 모바일과 PC에서 안정적으로 노출됩니다.
                </div>
              </div>
            </div>
          ),
        },
        { key: "startDate", label: "노출 시작일", type: "date", min: todayYmd, required: true },
        { key: "endDate", label: "노출 종료일", type: "date", min: currentFormData.startDate || todayYmd, required: true },
        { key: "isActive", label: "활성화", type: "checkbox", placeholder: "활성화" },
      ];
    } else if (activeTab === "boards") {
      const regionOptions = [
        { value: null, label: "전체 지역" },
        ...regions.map((r) => ({ value: r.id, label: r.name })),
      ];
      return [
        { key: "title", label: "제목", type: "text", placeholder: "게시글 제목", required: true },
        { key: "content", label: "내용", type: "textarea", placeholder: "게시글 내용", rows: 6, required: true },
        { key: "category", label: "카테고리", type: "select", options: [
          { value: "general", label: "🗣️ 자유" },
          { value: "info", label: "📢 정보" },
          { value: "question", label: "❓ 질문" },
          { value: "announcement", label: "📌 공지" },
        ]},
        { key: "regionId", label: "지역", type: "select", options: regionOptions },
      ];
    } else if (activeTab === "regionNews") {
      const regionOptions = regions.map((r) => ({ value: r.id, label: r.name }));
      const baseFields = [
        { key: "title", label: "제목", type: "text", placeholder: "뉴스 제목", required: true },
        { key: "content", label: "내용", type: "textarea", placeholder: "뉴스 내용", rows: 6, required: true },
        {
          key: "images",
          label: "이미지",
          type: "custom",
          customRender: (value, onChange, _formData, handleChange) => (
            <MultiImageUploader
              value={value}
              onChange={(nextImages) => {
                onChange(nextImages);
                handleChange("thumbnail", nextImages[0] || "");
              }}
              uploadImage={async (file) => {
                const result = await storageAdapter.uploadContentImage(file, { context: 'admin-region-news' });
                return result.imageUrl || result.url || "";
              }}
              onError={(message) => setToast({ open: true, message, type: "error" })}
              helperText="뉴스 이미지는 최대 3장까지 등록할 수 있습니다."
            />
          ),
        },
        { key: "regionId", label: "지역 *", type: "select", options: regionOptions, required: true },
      ];
      if (currentFormData.regionId && districts.length > 0) {
        baseFields.push({ key: "districtId", label: "구/군", type: "select", options: [
          { value: "", label: "구/군 전체" },
          ...districts.map(d => ({ value: d.id, label: d.name }))
        ]});
      }
      baseFields.push(
        { key: "isPinned", label: "상단 고정", type: "checkbox" },
        { key: "isPublic", label: "공개 여부", type: "checkbox" }
      );
      return baseFields;
    }
  }, [activeTab, regions, currentFormData.scope, currentFormData.regionId, districts, isDragging, uploadingImage, uploadProgress, previewImage]);

  // 날짜 포맷
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
  };

  // 스타일
  const pageStyle = { minHeight: "100vh", background: "#0f0f14", padding: "20px 16px 100px" };
  const headerStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 };
  const titleStyle = { fontSize: 20, fontWeight: 800, display: "flex", alignItems: "center", gap: 10 };
  const backBtnStyle = { background: "none", border: "none", color: "#a855f7", fontSize: 14, cursor: "pointer" };
  const addBtnStyle = { padding: "10px 20px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" };

  const tabContainerStyle = { display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', flexWrap: 'nowrap', WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' };
  const tabStyle = (isActive) => ({
    padding: '10px 16px',
    borderRadius: 8,
    border: 'none',
    background: isActive ? '#a855f7' : 'rgba(255,255,255,0.08)',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  });

  const filterRowStyle = { display: "flex", gap: 10, marginBottom: 16 };
  const inputStyle = { flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "inherit", fontSize: 14, outline: "none" };

  const cardStyle = { background: "#18181b", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", padding: 16, marginBottom: 12 };
  const cardHeaderStyle = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 };
  const itemTitleStyle = {
    fontSize: 16,
    fontWeight: 700,
    whiteSpace: "pre-line",
    wordBreak: "break-word",
    lineHeight: 1.4,
    maxWidth: "90vw"
  };
  const badgeStyle = (color) => ({ display: "inline-block", padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: `${color}20`, color, marginLeft: 8 });
  const infoRowStyle = { display: "flex", gap: 16, fontSize: 13, opacity: 0.7, marginBottom: 10, flexWrap: "wrap" };
  const contentPreviewStyle = { fontSize: 13, opacity: 0.6, marginBottom: 10, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" };
  const actionRowStyle = { display: "flex", gap: 8, flexWrap: "wrap" };
  const actionBtnStyle = (color) => ({ padding: "6px 12px", borderRadius: 6, border: "none", background: color, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" });

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={titleStyle}>
          <button style={backBtnStyle} onClick={() => navigate("/admin")}>← 뒤로</button>
          📝 콘텐츠 관리
        </div>
        <button style={addBtnStyle} onClick={openCreateModal}>
          + {activeTab === "notices" ? "공지사항" : activeTab === "broadcasts" ? "방송" : activeTab === "banners" ? "배너" : activeTab === "boards" ? "게시글" : activeTab === "regionNews" ? "지역뉴스" : "보급지원"} 추가
        </button>
      </div>

      {/* ★ 로딩 중 */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px 20px", fontSize: 14, opacity: 0.7 }}>
          ⏳ 데이터 로딩 중...
        </div>
      )}

      {/* ★ 오류 발생 */}
      {error && !loading && (
        <div style={{ padding: "16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          ⚠️ 서버 오류: {error} (로컬 데이터 사용 중)
        </div>
      )}

      {!loading && (
        <>
          {/* Tabs */}
          <div style={tabContainerStyle}>
            <button style={tabStyle(activeTab === "notices")} onClick={() => setActiveTab("notices")}>
              📢 공지사항 ({notices.length})
            </button>
            <button style={tabStyle(activeTab === "broadcasts")} onClick={() => setActiveTab("broadcasts")}>
              📺 공유방송 ({broadcasts.length})
            </button>
            <button style={tabStyle(activeTab === "banners")} onClick={() => setActiveTab("banners")}>
              🎨 배너 ({banners.length})
            </button>
            <button style={tabStyle(activeTab === "supplies")} onClick={() => setActiveTab("supplies")}>
              📦 보급지원 ({supplies.length})
            </button>
            <button style={tabStyle(activeTab === "boards")} onClick={() => setActiveTab("boards")}>
              📝 게시판 ({boards.length})
            </button>
            <button style={tabStyle(activeTab === "regionNews")} onClick={() => setActiveTab("regionNews")}>
              📰 지역뉴스 ({regionNews.length})
            </button>
          </div>

          {/* Filter */}
          <div style={filterRowStyle}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="제목 검색..."
              style={inputStyle}
            />
          </div>      {/* List */}
      {filteredList.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, opacity: 0.5 }}>
          등록된 {activeTab === "notices" ? "공지사항" : activeTab === "broadcasts" ? "방송" : activeTab === "banners" ? "배너" : activeTab === "boards" ? "게시글" : activeTab === "regionNews" ? "지역뉴스" : "보급지원"}이 없습니다.
        </div>
      ) : (
        filteredList.map((item) => (
          <div key={item.id} style={cardStyle}>
            {/* 배너 전용 렌더링 */}
            {activeTab === "banners" ? (
              <>
                <div style={cardHeaderStyle}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    {(function(){
                      try {
                        const API_BASE = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? 'http://127.0.0.1:8787' : '');
                        const src = item.imageUrl && !/^https?:\/\//i.test(item.imageUrl) ? `${API_BASE}${item.imageUrl}` : item.imageUrl;
                        if (item.videoUrl) {
                          return (
                            <div style={{ width: 96, aspectRatio: '16 / 9', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'linear-gradient(135deg,#111827,#1f2937)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.88)', fontSize: 12, fontWeight: 700 }}>
                              VIDEO
                            </div>
                          );
                        }
                        return (
                          <img
                            src={src}
                            alt={item.title || item.alt}
                            style={{ width: 96, aspectRatio: '16 / 9', objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', display: 'block', background: 'rgba(255,255,255,0.03)' }}
                            onError={(e) => {
                              try {
                                e.target.onerror = null;
                                e.target.src = 'https://picsum.photos/seed/banner-simple/1280/720';
                              } catch (ex) {
                                e.target.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
                              }
                            }}
                          />
                        );
                      } catch (e) {
                        return <div style={{ width: 80, height: 27, borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }} />;
                      }
                    })()
                    }
                    <div>
                      <span style={itemTitleStyle}>{item.title || item.alt || '제목 없음'}</span>
                      {!item.isActive && <span style={badgeStyle("#6b7280")}>비활성</span>}
                      {item.videoUrl && <span style={badgeStyle("#22c55e")}>영상</span>}
                      {item.imageUrl && !item.videoUrl && <span style={badgeStyle("#38bdf8")}>이미지</span>}
                      {item.description && <div style={{ fontSize: 12, opacity: 0.58, marginTop: 6, lineHeight: 1.45, maxWidth: 420 }}>{item.description}</div>}
                    </div>
                  </div>
                  <span style={{ fontSize: 12, opacity: 0.5 }}>{formatDate(item.createdAt)}</span>
                </div>
                <div style={infoRowStyle}>
                  {item.regions?.length > 0 && <span>📍 {item.regions.length}개 지역 한정</span>}
                  {!item.regions?.length && <span>📍 전체 지역</span>}
                  {item.startDate && <span>📅 {item.startDate} ~</span>}
                  {item.endDate && <span>{item.endDate}</span>}
                  <span>📐 16:9 운영</span>
                </div>
                <div style={actionRowStyle}>
                  <button style={actionBtnStyle("rgba(168,85,247,0.8)")} onClick={() => openEditModal(item)}>
                    ✏️ 수정
                  </button>
                  <button
                    style={actionBtnStyle(item.isActive ? "rgba(107,114,128,0.8)" : "rgba(34,197,94,0.8)")}
                    onClick={() => handleTogglePublic(item)}
                  >
                    {item.isActive ? "🔒 비활성" : "🔓 활성"}
                  </button>
                  <button style={actionBtnStyle("rgba(239,68,68,0.8)")} onClick={() => openDeleteConfirm(activeTab === "notices" ? resolveNoticeActionId(item) : item.id)}>
                    🗑️ 삭제
                  </button>
                </div>
              </>
            ) : (
              /* 공지사항/방송 기존 렌더링 */
              <>
            <div style={cardHeaderStyle}>
              <div>
                <span style={itemTitleStyle}>{item.title}</span>
                {activeTab === "notices" && String(item.scope || 'ALL').toUpperCase() === 'REGION' && <span style={badgeStyle("#0ea5e9")}>지역공지</span>}
                {activeTab === "notices" && !!item.isPopup && <span style={badgeStyle("#8b5cf6")}>팝업</span>}
                {(activeTab === "notices" || activeTab === "regionNews") && item.isPinned && <span style={badgeStyle("#f59e0b")}>📌 고정</span>}
                {!item.isPublic && <span style={badgeStyle("#6b7280")}>비공개</span>}
              </div>
              <span style={{ fontSize: 12, opacity: 0.5 }}>{formatDate(item.createdAt)}</span>
            </div>
            <div style={infoRowStyle}>
              {activeTab === "broadcasts" && <span>📍 {getRegionName(item.regionId)}</span>}
              {activeTab === "broadcasts" && item.videoUrl && (
                <span>🔗 <a href={item.videoUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#a855f7" }}>영상 링크</a></span>
              )}
              {activeTab === "supplies" && item.quantity != null && <span>📦 수량: {item.quantity}</span>}
              {activeTab === "supplies" && item.status && <span style={badgeStyle(item.status === 'open' ? '#10b981' : '#6b7280')}>{item.status === 'open' ? '진행중' : '종료'}</span>}
              {activeTab === "supplies" && item.regionId && <span>📍 {getRegionName(item.regionId)}</span>}
              {activeTab === "supplies" && item.mediaUrl && (
                <span>🔗 <a href={item.mediaUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#a855f7" }}>첨부</a></span>
              )}              {activeTab === "boards" && item.category && <span>🏷️ {item.category}</span>}
              {activeTab === "boards" && item.regionId && <span>📍 {getRegionName(item.regionId)}</span>}
              {activeTab === "boards" && item.authorName && <span>👤 {item.authorName}</span>}
              {activeTab === "regionNews" && item.regionId && <span>📍 {getRegionName(item.regionId)}</span>}
              {activeTab === "regionNews" && item.districtId && <span>🏘️ {item.districtId}</span>}
              {activeTab === "regionNews" && item.authorName && <span>👤 {item.authorName}</span>}
            </div>
            <div style={contentPreviewStyle}>
              {(activeTab === "notices" || activeTab === "boards" || activeTab === "regionNews") ? item.content : item.description}
            </div>
            <div style={actionRowStyle}>
              <button style={actionBtnStyle("rgba(168,85,247,0.8)")} onClick={() => openEditModal(item)}>
                ✏️ 수정
              </button>
              {(activeTab === "notices" || activeTab === "regionNews") && (
                <button
                  style={actionBtnStyle(item.isPinned ? "rgba(107,114,128,0.8)" : "rgba(245,158,11,0.8)")}
                  onClick={() => handleTogglePin(item)}
                >
                  {item.isPinned ? "📌 고정해제" : "📌 고정"}
                </button>
              )}
              <button
                style={actionBtnStyle(item.isPublic ? "rgba(107,114,128,0.8)" : "rgba(34,197,94,0.8)")}
                onClick={() => handleTogglePublic(item)}
              >
                {item.isPublic ? "🔒 비공개" : "🔓 공개"}
              </button>
              <button style={actionBtnStyle("rgba(239,68,68,0.8)")} onClick={() => openDeleteConfirm(item.newsId || item.id)}>
                🗑️ 삭제
              </button>
            </div>
              </>
            )}
          </div>
        ))
      )}
        </>
      )}

      {/* Modal */}
      <AdminModalForm
        open={modalOpen}
        title={(function(){
          const n = activeTab === "notices" ? "공지사항" : activeTab === "broadcasts" ? "방송" : activeTab === "banners" ? "배너" : activeTab === "boards" ? "게시글" : activeTab === "regionNews" ? "지역뉴스" : "보급지원";
          return editingItem ? `${n} 수정` : `${n} 추가`;
        })()}
        fields={formFields}
        initialData={editingItem || defaultNewItemData}
        onSubmit={handleSave}
        onChange={(data) => {
          // 전체 formData 추적 (scope 변경 감지용)
          setCurrentFormData(data);
        }}
        onCancel={() => {
          setModalOpen(false);
          setPreviewImage(null);
          setIsDragging(false);
          setCurrentFormData({});
          setDistricts([]);
        }}
        submitText={editingItem ? "수정" : "추가"}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={confirmOpen}
        title={(function(){ const n = activeTab === "notices" ? "공지사항" : activeTab === "broadcasts" ? "방송" : activeTab === "banners" ? "배너" : activeTab === "boards" ? "게시글" : activeTab === "regionNews" ? "지역뉴스" : "보급지원"; return `${n} 삭제`; })()}
        message={(function(){ const n = activeTab === "notices" ? "공지사항" : activeTab === "broadcasts" ? "방송" : activeTab === "banners" ? "배너" : activeTab === "boards" ? "게시글" : activeTab === "regionNews" ? "지역뉴스" : "보급지원"; return `이 ${n}을 삭제하시겠습니까?`; })()}
        confirmText="삭제"
        confirmColor="#ef4444"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* Toast */}
      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, open: false })} />
    </div>
  );
}
