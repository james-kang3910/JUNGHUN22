import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MultiImageUploader from "../../components/MultiImageUploader";
import * as storageAdapter from "../../lib/storageAdapter";
import { getApartments, upsertApartment, deleteApartment, getDistricts } from "../../lib/storageAdapter";
import { isAdminAuthenticatedLocal } from "../../lib/adminAuth";
import { buildRegionPath } from "../../lib/regionRoutes";
import AdminModalForm from "./components/AdminModalForm";
import ConfirmDialog from "./components/ConfirmDialog";
import Toast from "./components/Toast";

export default function AdminApartments() {
  const { regionId } = useParams();
  const navigate = useNavigate();

  const [regionName, setRegionName] = useState(regionId || "");
  const [apartments, setApartments] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // 모달
  const [modalOpen, setModalOpen] = useState(false);
  const [editingApt, setEditingApt] = useState(null);

  // 삭제 확인
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // 인증 확인
  useEffect(() => {
    if (!isAdminAuthenticatedLocal()) {
      navigate("/admin/login", { replace: true });
    }
  }, [navigate]);

  // 지역명 로드
  useEffect(() => {
    if (!regionId) return;
    storageAdapter.getRegions()
      .then(all => {
        const found = (all || []).find(r => String(r.id || r.regionId) === String(regionId));
        if (found) setRegionName(found.name || regionId);
      })
      .catch(() => setRegionName(regionId));
  }, [regionId]);

  // 구/군 목록 로드
  useEffect(() => {
    if (!regionId) return;
    getDistricts(regionId)
      .then(list => setDistricts(list || []))
      .catch(() => setDistricts([]));
  }, [regionId]);

  // 아파트 목록 로드
  const loadApartments = useCallback(async () => {
    if (!regionId) return;
    setLoading(true);
    try {
      const list = await getApartments({ regionId });
      setApartments(list || []);
    } catch (e) {
      showToast("아파트 목록 로드 실패: " + e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [regionId]);

  useEffect(() => { loadApartments(); }, [loadApartments]);

  const showToast = (msg, type = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 지역명 얻기
  const getDistrictName = (districtId) => {
    if (!districtId) return "–";
    const d = districts.find(d => String(d.id) === String(districtId));
    return d ? d.name : districtId;
  };

  // 추가/수정 모달 열기
  const openAddModal = () => {
    setEditingApt(null);
    setModalOpen(true);
  };

  const openEditModal = (apt) => {
    setEditingApt(apt);
    setModalOpen(true);
  };

  // 저장
  const handleSave = async (formData) => {
    try {
      const payload = {
        ...(editingApt ? { id: editingApt.id } : {}),
        regionId,
        districtId: formData.districtId || null,
        name: formData.name,
        address: formData.address || "",
        households: parseInt(formData.households) || 0,
        floors: parseInt(formData.floors) || 0,
        builtYear: parseInt(formData.builtYear) || null,
        managerPhone: formData.managerPhone || "",
        thumbnail: formData.thumbnail || "",
        isActive: formData.isActive !== false,
        sortOrder: parseInt(formData.sortOrder) || 0,
      };
      await upsertApartment(payload);
      showToast(editingApt ? "아파트 수정 완료" : "아파트 추가 완료");
      setModalOpen(false);
      setEditingApt(null);
      loadApartments();
    } catch (e) {
      showToast("저장 실패: " + e.message, "error");
    }
  };

  // 삭제
  const openDeleteConfirm = (id) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await deleteApartment(deletingId);
      showToast("삭제 완료");
      setConfirmOpen(false);
      setDeletingId(null);
      loadApartments();
    } catch (e) {
      showToast("삭제 실패: " + e.message, "error");
    } finally {
      setDeleting(false);
    }
  };

  // 모달 필드 정의
  const modalFields = [
    { key: "name", label: "아파트명", type: "text", required: true, placeholder: "예) 래미안 e편한세상" },
    {
      key: "districtId", label: "지역(구/군)", type: "select",
      options: [
        { value: "", label: "선택 안 함 (전체)" },
        ...districts.map(d => ({ value: d.id, label: d.name })),
      ],
    },
    { key: "address", label: "주소", type: "text", placeholder: "예) 서울시 강남구 역삼동 123" },
    { key: "households", label: "세대수", type: "number", placeholder: "0" },
    { key: "floors", label: "최고 층수", type: "number", placeholder: "0" },
    { key: "builtYear", label: "준공연도", type: "number", placeholder: "예) 2005" },
    { key: "managerPhone", label: "관리사무소 연락처", type: "text", placeholder: "예) 02-1234-5678" },
    {
      key: "thumbnail",
      label: "대표 이미지",
      type: "custom",
      customRender: (value, onValueChange) => (
        <div style={{ display: "grid", gap: 10 }}>
          <MultiImageUploader
            value={value ? [value] : []}
            onChange={(nextImages) => onValueChange(Array.isArray(nextImages) && nextImages[0] ? nextImages[0] : "")}
            maxImages={1}
            uploadImage={async (file) => {
              const result = await storageAdapter.uploadContentImage(file, { context: "apartments" });
              return result?.imageUrl || result?.url || null;
            }}
            helperText="대표 이미지를 1장 업로드하세요."
          />
          {value ? (
            <div style={{ fontSize: 12, color: "#8AABB8" }}>업로드된 대표 이미지가 저장됩니다.</div>
          ) : null}
        </div>
      ),
    },
    { key: "sortOrder", label: "정렬 순서", type: "number", placeholder: "0" },
    { key: "isActive", label: "활성 상태", type: "checkbox", placeholder: "활성으로 표시", defaultValue: true },
  ];

  // ── 스타일 ──────────────────────────────────────────────
  const containerStyle = {
    padding: "0 0 80px",
    minHeight: "100vh",
    background: "#0D1B21",
    color: "#DDE3EA",
    fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
  };
  const headerStyle = {
    padding: "16px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "rgba(255,255,255,0.02)",
  };
  const backBtnStyle = {
    padding: "6px 12px",
    borderRadius: 6,
    border: "none",
    background: "rgba(255,255,255,0.08)",
    color: "#DDE3EA",
    fontSize: 13,
    cursor: "pointer",
  };
  const titleStyle = {
    fontSize: 16,
    fontWeight: 700,
    flex: 1,
  };
  const addBtnStyle = {
    padding: "8px 16px",
    borderRadius: 8,
    border: "none",
    background: "rgba(16,185,129,0.8)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  };
  const cardStyle = {
    margin: "12px 16px",
    padding: "14px",
    borderRadius: 10,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
  };
  const rowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  };
  const metaStyle = {
    fontSize: 12,
    color: "#8AABB8",
    marginTop: 4,
    display: "flex",
    flexWrap: "wrap",
    gap: "4px 12px",
  };
  const actionStyle = {
    display: "flex",
    gap: 6,
    marginTop: 10,
  };
  const editBtnStyle = {
    padding: "5px 12px",
    borderRadius: 6,
    border: "none",
    background: "rgba(168,85,247,0.7)",
    color: "#fff",
    fontSize: 12,
    cursor: "pointer",
  };
  const deleteBtnStyle = {
    padding: "5px 12px",
    borderRadius: 6,
    border: "none",
    background: "rgba(239,68,68,0.7)",
    color: "#fff",
    fontSize: 12,
    cursor: "pointer",
  };
  const boardBtnStyle = {
    padding: "5px 12px",
    borderRadius: 6,
    border: "none",
    background: "rgba(59,130,246,0.7)",
    color: "#fff",
    fontSize: 12,
    cursor: "pointer",
  };

  return (
    <div style={containerStyle}>
      {/* 헤더 */}
      <div style={headerStyle}>
        <button style={backBtnStyle} onClick={() => navigate("/admin/regions")}>
          ← 지역 관리
        </button>
        <span style={titleStyle}>🏢 {regionName} 아파트 관리</span>
        <button style={addBtnStyle} onClick={openAddModal}>+ 아파트 추가</button>
      </div>

      {/* 본문 */}
      {loading ? (
        <div style={{ padding: 32, textAlign: "center", opacity: 0.5 }}>불러오는 중...</div>
      ) : apartments.length === 0 ? (
        <div style={{ padding: 32, textAlign: "center", opacity: 0.5 }}>
          등록된 아파트가 없습니다.<br />
          <span style={{ fontSize: 13 }}>위 「+ 아파트 추가」 버튼으로 추가하세요.</span>
        </div>
      ) : (
        apartments.map(apt => (
          <div key={apt.id} style={cardStyle}>
            <div style={rowStyle}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>
                  {apt.thumbnail && (
                    <img
                      src={apt.thumbnail}
                      alt=""
                      style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover", marginRight: 8, verticalAlign: "middle" }}
                      onError={e => { e.target.style.display = "none"; }}
                    />
                  )}
                  {apt.name}
                </div>
                <div style={metaStyle}>
                  {apt.districtId && <span>📍 {getDistrictName(apt.districtId)}</span>}
                  {apt.address && <span>🏠 {apt.address}</span>}
                  {apt.households > 0 && <span>👥 {apt.households.toLocaleString()}세대</span>}
                  {apt.floors > 0 && <span>🏗️ {apt.floors}층</span>}
                  {apt.builtYear && <span>📅 {apt.builtYear}년</span>}
                  {apt.managerPhone && <span>📞 {apt.managerPhone}</span>}
                </div>
              </div>
              <span style={{
                padding: "2px 8px",
                borderRadius: 12,
                fontSize: 11,
                background: apt.isActive ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                color: apt.isActive ? "#10b981" : "#ef4444",
              }}>
                {apt.isActive ? "활성" : "비활성"}
              </span>
            </div>
            <div style={actionStyle}>
              <button style={boardBtnStyle} onClick={() => navigate(buildRegionPath(regionId, `/apt/${apt.id}`))}>
                📋 게시판
              </button>
              <button style={editBtnStyle} onClick={() => openEditModal(apt)}>✏️ 수정</button>
              <button style={deleteBtnStyle} onClick={() => openDeleteConfirm(apt.id)}>🗑️ 삭제</button>
            </div>
          </div>
        ))
      )}

      {/* 추가/수정 모달 */}
      {modalOpen && (
        <AdminModalForm
          open={modalOpen}
          title={editingApt ? "아파트 수정" : "아파트 추가"}
          fields={modalFields}
          initialData={editingApt || {}}
          onSubmit={handleSave}
          onCancel={() => { setModalOpen(false); setEditingApt(null); }}
          submitText={editingApt ? "수정 완료" : "추가하기"}
        />
      )}

      {/* 삭제 확인 */}
      {confirmOpen && (
        <ConfirmDialog
          message="이 아파트를 삭제하시겠습니까? 관련 게시글도 함께 삭제됩니다."
          confirmLabel={deleting ? "삭제 중..." : "삭제"}
          onConfirm={handleDelete}
          onCancel={() => { setConfirmOpen(false); setDeletingId(null); }}
        />
      )}

      {/* 토스트 */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
