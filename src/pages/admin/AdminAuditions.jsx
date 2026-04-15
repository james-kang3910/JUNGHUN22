import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { isAdminAuthenticatedLocal } from "../../lib/adminAuth";
import * as storageAdapter from "../../lib/storageAdapter";
import { register, unregister } from "../../lib/ssotRegistry";
import MultiImageUploader, { normalizeImageList } from "../../components/MultiImageUploader";
import AdminModalForm from "./components/AdminModalForm";
import ConfirmDialog from "./components/ConfirmDialog";
import Toast from "./components/Toast";
import { getAuditionDateFloorInput, isAuditionClosed, normalizeAuditionRankLabel, validateAuditionDateRange } from "../../lib/auditionSchedule";

function getSelectionStatus(item) {
  if (!isAuditionClosed(item)) return null;
  return item?.hasRankedSubmissions ? { label: '선정완료', color: '#0f766e' } : { label: '선정대기', color: '#9ca3af' };
}

// 상태 계산 함수
function calculateStatus(startDate, endDate) {
  if (!startDate || !endDate) return 'unknown';
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (now < start) return 'upcoming';
  if (now > end) return 'closed';
  return 'active';
}

function getStatusLabel(status) {
  switch(status) {
    case 'upcoming': return '예정';
    case 'active': return '진행중';
    case 'closed': return '종료';
    default: return '미정';
  }
}

function getStatusColor(status) {
  switch(status) {
    case 'upcoming': return '#60a5fa';
    case 'active': return '#34d399';
    case 'closed': return '#f87171';
    default: return '#94a3b8';
  }
}

export default function AdminAuditions() {
  const navigate = useNavigate();
  const [auditions, setAuditions] = useState([]);
  const [regions, setRegions] = useState([]);
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);

  // Modal/Dialog 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // 참가작 패널 상태
  const [subsAudition, setSubsAudition] = useState(null);
  const [subs, setSubs] = useState([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [editingSubId, setEditingSubId] = useState(null);
  const [editSubTitle, setEditSubTitle] = useState('');
  const [subRankDrafts, setSubRankDrafts] = useState({});
  const [subDeleteId, setSubDeleteId] = useState(null);
  const [subConfirmOpen, setSubConfirmOpen] = useState(false);

  // 구/군 목록 (현재 선택된 regionId 기반)
  const [districts, setDistricts] = useState([]);
  // 모달 폼 데이터 추적 (regionId 변경 감지용)
  const [currentFormData, setCurrentFormData] = useState({});

  // Toast 상태
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  const auditionDateFloor = useMemo(() => getAuditionDateFloorInput(), []);

  useEffect(() => {
    if (!isAdminAuthenticatedLocal()) {
      navigate("/admin/login", { replace: true });
      return;
    }
    loadData();
    const id = register(['auditions'], () => { try { loadData(); } catch (e) { console.error('[AdminAuditions] ssot reload failed', e); } });
    return () => unregister(id);
  }, [navigate]);

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
      const [serverAuditions, serverRegions] = await Promise.all([
        storageAdapter.getAuditions(),
        storageAdapter.getRegions()
      ]);
      
      // ✅ ID 정규화: auditionId 또는 id를 통일된 id 필드로 사용
      const normalizedAuditions = (serverAuditions || []).map(a => ({
        ...a,
        images: normalizeImageList(a.images && a.images.length ? a.images : [a.posterUrl, a.imageUrl]),
        id: a.id || a.auditionId || a.audition_id
      }));
      
      setAuditions(normalizedAuditions);
      setRegions(serverRegions || []);
      
      console.log('[AdminAuditions] Loaded from server:', {
        auditions: normalizedAuditions?.length || 0,
        regions: serverRegions?.length || 0,
      });
    } catch (err) {
      console.error("Failed to load data:", err);
      setError(err.message || "데이터 로딩 실패");
      setAuditions([]);
      setRegions([]);
    } finally {
      setLoading(false);
    }
  };

  // 필터링된 목록
  const filteredList = useMemo(() => {
    let list = [...auditions];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((item) => item.title.toLowerCase().includes(q));
    }
    if (regionFilter !== "all") {
      if (regionFilter === "global") {
        list = list.filter((item) => !item.regionId);
      } else {
        list = list.filter((item) => item.regionId === regionFilter);
      }
    }
    if (statusFilter !== "all") {
      list = list.filter((item) => calculateStatus(item.startAt, item.endAt) === statusFilter);
    }
    return list.sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));
  }, [auditions, search, regionFilter, statusFilter]);

  // 지역명 가져오기
  const getRegionName = (regionId) => {
    if (!regionId) return "전체 지역";
    const region = regions.find((r) => r.id === regionId);
    return region ? region.name : "알 수 없음";
  };

  // 모달 열기
  const openCreateModal = () => {
    setEditingItem(null);
    setCurrentFormData({});
    setDistricts([]);
    setImageUploading(false);
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setCurrentFormData(item || {});
    setImageUploading(false);
    setModalOpen(true);
  };

  // 저장
  const handleSave = async (data) => {
    try {
      const dateError = validateAuditionDateRange(data.startAt, data.endAt);
      if (dateError) {
        setToast({ open: true, message: dateError, type: "error" });
        return;
      }

      const images = normalizeImageList(data.images, 1);
      const processedData = {
        ...data,
        images,
        posterUrl: images[0] || "",
        imageUrl: images[0] || "",
        type: data.type || 'NOTICE',
        regionId: data.regionId || null,
      };

      console.log('[AdminAuditions] Saving audition payload:', JSON.stringify(processedData, null, 2));

      if (editingItem) {
        console.log('[AdminAuditions] Updating existing audition ID:', editingItem.id);
        await storageAdapter.upsertAudition({ ...processedData, id: editingItem.id });
        setToast({ open: true, message: "오디션이 수정되었습니다.", type: "success" });
      } else {
        console.log('[AdminAuditions] Creating new audition');
        await storageAdapter.upsertAudition(processedData);
        setToast({ open: true, message: "오디션이 추가되었습니다.", type: "success" });
      }
      setModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('[AdminAuditions] Save error:', err);
      setToast({ open: true, message: `오류: ${err.message}`, type: "error" });
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
        await storageAdapter.deleteAudition(deleteTargetId);
        setToast({ open: true, message: "오디션이 삭제되었습니다.", type: "success" });
        await loadData();
      } catch (err) {
        setToast({ open: true, message: `삭제 실패: ${err.message}`, type: "error" });
      }
    }
    setConfirmOpen(false);
    setDeleteTargetId(null);
  };

  // 참가작 패널 열기
  const openSubsPanel = async (item) => {
    setSubsAudition(item);
    setSubs([]);
    setSubsLoading(true);
    try {
      const list = await storageAdapter.getAuditionSubmissions(item.id);
      setSubs(list || []);
      setSubRankDrafts((list || []).reduce((acc, sub) => {
        acc[sub.id] = normalizeAuditionRankLabel(sub.rankLabel);
        return acc;
      }, {}));
    } catch (err) {
      setToast({ open: true, message: `참가작 로드 실패: ${err.message}`, type: 'error' });
    } finally {
      setSubsLoading(false);
    }
  };

  // 참가작 제목 수정
  const handleSaveSub = async (sub) => {
    try {
      await storageAdapter.updateAuditionSubmission(sub.auditionId, sub.id, { title: editSubTitle });
      setSubs(prev => prev.map(s => s.id === sub.id ? { ...s, title: editSubTitle } : s));
      setEditingSubId(null);
      setToast({ open: true, message: '제목이 수정되었습니다.', type: 'success' });
    } catch (err) {
      setToast({ open: true, message: `수정 실패: ${err.message}`, type: 'error' });
    }
  };

  const handleSaveSubRank = async (sub, nextRankLabel) => {
    try {
      const rankLabel = normalizeAuditionRankLabel(nextRankLabel ?? subRankDrafts[sub.id]);
      await storageAdapter.updateAuditionSubmission(sub.auditionId, sub.id, {
        title: sub.title || '참가자',
        rankLabel,
      });
      setSubs((prev) => prev.map((item) => item.id === sub.id ? { ...item, rankLabel } : item));
      setSubRankDrafts((prev) => ({ ...prev, [sub.id]: rankLabel }));
      setToast({ open: true, message: rankLabel ? '등수 뱃지가 저장되었습니다.' : '등수 뱃지가 제거되었습니다.', type: 'success' });
    } catch (err) {
      setToast({ open: true, message: `등수 저장 실패: ${err.message}`, type: 'error' });
    }
  };

  // 참가작 삭제 확인 열기
  const openSubDeleteConfirm = (subId) => {
    setSubDeleteId(subId);
    setSubConfirmOpen(true);
  };

  // 참가작 삭제 실행
  const handleDeleteSub = async () => {
    if (!subDeleteId || !subsAudition) return;
    try {
      await storageAdapter.adminDeleteAuditionSubmission(subsAudition.id, subDeleteId);
      setSubs(prev => prev.filter(s => s.id !== subDeleteId));
      setToast({ open: true, message: '참가작이 삭제되었습니다.', type: 'success' });
    } catch (err) {
      setToast({ open: true, message: `삭제 실패: ${err.message}`, type: 'error' });
    } finally {
      setSubConfirmOpen(false);
      setSubDeleteId(null);
    }
  };

  // 복제
  const handleDuplicate = async (item) => {
    try {
      const { id, auditionId, audition_id, createdAt, updatedAt, created_at, updated_at, ...rest } = item;
      await storageAdapter.upsertAudition({ ...rest, title: `${rest.title} (복사본)` });
      setToast({ open: true, message: "오디션이 복제되었습니다.", type: "success" });
      await loadData();
    } catch (err) {
      setToast({ open: true, message: `복제 실패: ${err.message}`, type: "error" });
    }
  };

  // ✅ UPDATE: 폼 필드 정의 - type, published, districtId 추가
  const formFields = useMemo(() => {
    const regionOptions = [
      { value: "", label: "전체 지역" },
      ...regions.map((r) => ({ value: r.id, label: r.name })),
    ];
    const typeOptions = [
      { value: "FREE", label: "자유응모" },
      { value: "NOTICE", label: "공지형" },
    ];
    const fields = [
      { key: "title", label: "제목", type: "text", placeholder: "오디션 제목", required: true },
      { key: "description", label: "설명", type: "textarea", placeholder: "오디션 설명", rows: 4 },
      { key: "type", label: "타입", type: "select", options: typeOptions, defaultValue: "NOTICE" },
      { key: "regionId", label: "지역", type: "select", options: regionOptions },
    ];
    if (currentFormData.regionId && districts.length > 0) {
      fields.push({
        key: "districtId", label: "구/군", type: "select",
        options: [{ value: "", label: "구/군 전체" }, ...districts.map(d => ({ value: d.id, label: d.name }))],
      });
    }
    fields.push(
      { key: "status", label: "상태", type: "select", options: [
        { value: "OPEN", label: "모집중" },
        { value: "CLOSED", label: "마감" }
      ], defaultValue: "OPEN" },
      { key: "published", label: "게시 여부 (공지형)", type: "checkbox", defaultValue: true, helpText: "공지형 오디션에서만 유효. 체크 해제하면 '준비중'으로 표시됩니다." },
      { key: "startAt", label: "신청 시작일", type: "date", min: auditionDateFloor.slice(0, 10) },
      { key: "endAt", label: "신청 종료일", type: "date", min: currentFormData.startAt || auditionDateFloor.slice(0, 10) },
      {
        key: "images",
        label: "이미지",
        type: "custom",
        customRender: (value, onChange, _formData, handleChange) => (
          <MultiImageUploader
            value={value}
            maxImages={1}
            onChange={(nextImages) => {
              onChange(nextImages);
            }}
            uploadImage={async (file) => {
              const result = await storageAdapter.uploadContentImage(file, { context: 'admin-auditions' });
              return result.imageUrl || result.url || "";
            }}
            onError={(message) => setToast({ open: true, message, type: "error" })}
            onUploadStateChange={setImageUploading}
            helperText="메인 노출용 대표 이미지 1장만 등록할 수 있습니다. 업로드 완료 후 저장됩니다."
          />
        ),
      },
      { key: "isActive", label: "활성화", type: "checkbox", defaultValue: true },
    );
    return fields;
  }, [regions, currentFormData.regionId, currentFormData.startAt, districts, auditionDateFloor]);

  // 스타일
  const pageStyle = { minHeight: "100vh", background: "#0f0f14", padding: "20px 16px 100px" };
  const headerStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 };
  const titleStyle = { fontSize: 20, fontWeight: 800, display: "flex", alignItems: "center", gap: 10 };
  const backBtnStyle = { background: "none", border: "none", color: "#a855f7", fontSize: 14, cursor: "pointer" };
  const addBtnStyle = { padding: "10px 20px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" };

  const filterRowStyle = { display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" };
  const inputStyle = { flex: 1, minWidth: 150, padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "inherit", fontSize: 14, outline: "none" };
  const selectStyle = { ...inputStyle, flex: "none", minWidth: 100 };

  const cardStyle = { background: "#18181b", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", padding: 16, marginBottom: 12 };
  const cardHeaderStyle = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 };
  const itemTitleStyle = { fontSize: 16, fontWeight: 700 };
  const badgeStyle = (color) => ({ display: "inline-block", padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: `${color}20`, color, marginLeft: 8 });
  const infoRowStyle = { display: "flex", gap: 16, fontSize: 13, opacity: 0.7, marginBottom: 10, flexWrap: "wrap" };
  const actionRowStyle = { display: "flex", gap: 8, flexWrap: "wrap" };
  const actionBtnStyle = (color) => ({ padding: "6px 12px", borderRadius: 6, border: "none", background: color, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" });

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={titleStyle}>
          <button style={backBtnStyle} onClick={() => navigate("/admin")}>← 뒤로</button>
          🎤 오디션 관리
        </div>
        <button style={addBtnStyle} onClick={openCreateModal}>+ 오디션 추가</button>
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
          {/* Filter */}
          <div style={filterRowStyle}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="제목 검색..."
          style={inputStyle}
        />
        <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} style={selectStyle}>
          <option value="all">전체 지역</option>
          <option value="global">전체 지역용</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="all">전체 상태</option>
          <option value="upcoming">예정</option>
          <option value="active">진행중</option>
          <option value="closed">종료</option>
        </select>
      </div>

      {/* ✅ UPDATE: List - type, published 표시 추가 */}
      {filteredList.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, opacity: 0.5 }}>등록된 오디션이 없습니다.</div>
      ) : (
        filteredList.map((item) => {
          const status = calculateStatus(item.startAt, item.endAt);
          const effectiveStatus = status !== 'unknown' ? status
            : (item.status === 'OPEN' ? 'active' : item.status === 'CLOSED' ? 'closed' : 'unknown');
          const closed = isAuditionClosed(item) || effectiveStatus === 'closed';
          const statusLabel = closed ? '종료' : '진행중';
          const statusColor = closed ? '#ef4444' : '#10b981';
          const selectionStatus = getSelectionStatus(item);
          
          // ✨ ADD: type, published 표시
          const type = item.type || 'FREE';
          const published = item.published !== undefined ? item.published : true;
          const itemStatus = item.status || 'OPEN';
          
          return (
            <div key={item.id} style={cardStyle}>
              <div style={cardHeaderStyle}>
                <div>
                  <span style={itemTitleStyle}>{item.title}</span>
                  <span style={badgeStyle(statusColor)}>{statusLabel}</span>
                  {selectionStatus && <span style={badgeStyle(selectionStatus.color)}>{selectionStatus.label}</span>}
                  {/* ✨ ADD: 타입 배지 */}
                  {type === 'NOTICE' && <span style={badgeStyle("#3b82f6")}>공지형</span>}
                  {type === 'FREE' && <span style={badgeStyle("#10b981")}>자유응모</span>}
                  {/* ✨ ADD: 상태 배지 */}
                  {itemStatus === 'OPEN' && <span style={badgeStyle("#10b981")}>모집중</span>}
                  {itemStatus === 'CLOSED' && <span style={badgeStyle("#ef4444")}>마감</span>}
                  {/* ✨ ADD: 게시 상태 (NOTICE 타입일 때만) */}
                  {type === 'NOTICE' && !published && <span style={badgeStyle("#f59e0b")}>준비중</span>}
                  {item.isActive === false && <span style={badgeStyle("#6b7280")}>비활성</span>}
                </div>
              </div>
              <div style={infoRowStyle}>
                <span>📍 {getRegionName(item.regionId)}</span>
                <span>📅 신청: {item.startAt ? item.startAt.slice(0, 10) : '미정'} ~ {item.endAt ? item.endAt.slice(0, 10) : '미정'}</span>
                {item.eventDate && <span>🎭 행사일: {item.eventDate}</span>}
              </div>
              {item.description && (
                <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 10 }}>{item.description}</div>
              )}
              <div style={actionRowStyle}>
                <button style={actionBtnStyle("rgba(16,185,129,0.8)")} onClick={() => openSubsPanel(item)}>
                  🎬 참가작
                </button>
                <button style={actionBtnStyle("rgba(168,85,247,0.8)")} onClick={() => openEditModal(item)}>
                  ✏️ 수정
                </button>
                <button style={actionBtnStyle("rgba(59,130,246,0.8)")} onClick={() => handleDuplicate(item)}>
                  📋 복제
                </button>
                <button style={actionBtnStyle("rgba(239,68,68,0.8)")} onClick={() => openDeleteConfirm(item.id)}>
                  🗑️ 삭제
                </button>
              </div>
            </div>
          );
        })
      )}
        </>
      )}

      {/* 참가작 사이드 패널 */}
      {subsAudition && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex' }}>
          <div
            style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }}
            onClick={() => { setSubsAudition(null); setEditingSubId(null); }}
          />
          <div style={{ width: '100%', maxWidth: 520, background: '#18181b', borderLeft: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            {/* 헤더 */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#18181b', zIndex: 1 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>🎬 참가작 관리</div>
                <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>{subsAudition.title} · {subs.length}건</div>
              </div>
              <button
                onClick={() => { setSubsAudition(null); setEditingSubId(null); }}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: '0 4px' }}
              >×</button>
            </div>

            {subsLoading && (
              <div style={{ padding: 40, textAlign: 'center', opacity: 0.6, fontSize: 13 }}>⏳ 로딩 중...</div>
            )}
            {!subsLoading && subs.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', opacity: 0.5, fontSize: 13 }}>등록된 참가작이 없습니다.</div>
            )}

            {!subsLoading && subs.map((sub, idx) => {
              const closed = isAuditionClosed(subsAudition);
              const rankDraft = subRankDrafts[sub.id] ?? normalizeAuditionRankLabel(sub.rankLabel);
              return (
              <div key={sub.id} style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  {sub.thumbnailUrl ? (
                    <div style={{ position: 'relative', width: 72, height: 48, flexShrink: 0 }}>
                      <img src={sub.thumbnailUrl} alt="thumb" style={{ width: 72, height: 48, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                      {normalizeAuditionRankLabel(sub.rankLabel) ? <div style={{ position: 'absolute', top: 4, left: 4, maxWidth: 60, padding: '2px 6px', borderRadius: 999, background: 'linear-gradient(135deg,#fff5cc,#f5c451)', color: '#3d2b00', fontSize: 10, fontWeight: 900, boxShadow: '0 2px 8px rgba(0,0,0,0.25)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.rankLabel}</div> : null}
                    </div>
                  ) : (
                    <div style={{ width: 72, height: 48, background: 'rgba(255,255,255,0.06)', borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, position: 'relative' }}>
                      {normalizeAuditionRankLabel(sub.rankLabel) ? <div style={{ position: 'absolute', top: 4, left: 4, maxWidth: 60, padding: '2px 6px', borderRadius: 999, background: 'linear-gradient(135deg,#fff5cc,#f5c451)', color: '#3d2b00', fontSize: 10, fontWeight: 900, boxShadow: '0 2px 8px rgba(0,0,0,0.25)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.rankLabel}</div> : null}
                      🎬
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {editingSubId === sub.id ? (
                      <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                        <input
                          autoFocus
                          value={editSubTitle}
                          onChange={e => setEditSubTitle(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleSaveSub(sub); if (e.key === 'Escape') setEditingSubId(null); }}
                          style={{ flex: 1, padding: '5px 8px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 13 }}
                        />
                        <button onClick={() => handleSaveSub(sub)} style={{ padding: '4px 10px', borderRadius: 4, border: 'none', background: '#10b981', color: '#fff', fontSize: 12, cursor: 'pointer' }}>저장</button>
                        <button onClick={() => setEditingSubId(null)} style={{ padding: '4px 8px', borderRadius: 4, border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 12, cursor: 'pointer' }}>취소</button>
                      </div>
                    ) : (
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {idx + 1}. {sub.title || '(제목 없음)'}
                      </div>
                    )}
                    <div style={{ fontSize: 12, opacity: 0.6 }}>
                      👤 {sub.memberName || sub.memberId} &nbsp;❤️ {sub.votesCount || 0}표
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
                      <input
                        value={rankDraft}
                        onChange={(e) => setSubRankDrafts((prev) => ({ ...prev, [sub.id]: e.target.value }))}
                        disabled={!closed}
                        placeholder={closed ? '예: 1위, 금상, 대상' : '오디션 종료 후 입력 가능'}
                        style={{ flex: 1, minWidth: 140, padding: '5px 8px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.2)', background: closed ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)', color: '#fff', fontSize: 12 }}
                      />
                      <button disabled={!closed} onClick={() => handleSaveSubRank(sub)} style={{ padding: '4px 10px', borderRadius: 4, border: 'none', background: closed ? 'rgba(245,158,11,0.88)' : 'rgba(107,114,128,0.6)', color: '#fff', fontSize: 11, cursor: closed ? 'pointer' : 'not-allowed' }}>뱃지 저장</button>
                      <button disabled={!closed} onClick={() => handleSaveSubRank(sub, '')} style={{ padding: '4px 10px', borderRadius: 4, border: 'none', background: closed ? 'rgba(239,68,68,0.8)' : 'rgba(107,114,128,0.6)', color: '#fff', fontSize: 11, cursor: closed ? 'pointer' : 'not-allowed' }}>뱃지 제거</button>
                    </div>
                    {!closed && <div style={{ fontSize: 11, opacity: 0.5, marginTop: 6 }}>오디션 종료 후 심사 등수를 지정할 수 있습니다.</div>}
                    {sub.mediaUrl && (
                      <div style={{ fontSize: 11, opacity: 0.35, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.mediaUrl}</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                    <button
                      onClick={() => { setEditingSubId(sub.id); setEditSubTitle(sub.title || ''); }}
                      style={{ padding: '4px 10px', borderRadius: 4, border: 'none', background: 'rgba(168,85,247,0.7)', color: '#fff', fontSize: 11, cursor: 'pointer' }}
                    >✏️ 수정</button>
                    <button
                      onClick={() => openSubDeleteConfirm(sub.id)}
                      style={{ padding: '4px 10px', borderRadius: 4, border: 'none', background: 'rgba(239,68,68,0.7)', color: '#fff', fontSize: 11, cursor: 'pointer' }}
                    >🗑️ 삭제</button>
                  </div>
                </div>
              </div>
            )})}
          </div>
        </div>
      )}

      {/* 참가작 삭제 확인 */}
      <ConfirmDialog
        open={subConfirmOpen}
        title="참가작 삭제"
        message="이 참가작을 삭제하시겠습니까? 되돌릴 수 없습니다."
        confirmText="삭제"
        confirmColor="#ef4444"
        onConfirm={handleDeleteSub}
        onCancel={() => { setSubConfirmOpen(false); setSubDeleteId(null); }}
      />

      {/* Modal */}
      <AdminModalForm
        open={modalOpen}
        title={editingItem ? "오디션 수정" : "오디션 추가"}
        fields={formFields}
        initialData={editingItem || { isActive: true }}
        onSubmit={handleSave}
        onCancel={() => { setModalOpen(false); setImageUploading(false); }}
        submitText={editingItem ? "수정" : "추가"}
        submitDisabled={imageUploading}
        onChange={setCurrentFormData}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={confirmOpen}
        title="오디션 삭제"
        message="이 오디션을 삭제하시겠습니까?"
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
