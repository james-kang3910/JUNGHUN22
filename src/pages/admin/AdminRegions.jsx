import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as storageAdapter from "../../lib/storageAdapter";
import {
  getDistricts,
  upsertDistrict,
  deleteDistrict,
} from "../../lib/storageAdapter";
import {
  getShops,
  getMissions,
  getEvents,
  getAuditions,
} from "../../lib/adminStore";
import { isAdminAuthenticatedLocal } from "../../lib/adminAuth";
import AdminModalForm from "./components/AdminModalForm";
import ConfirmDialog from "./components/ConfirmDialog";
import Toast from "./components/Toast";
import { PROVINCES, DISTRICTS } from "../../data/regions.seed";

export default function AdminRegions() {
  const navigate = useNavigate();
  const [regions, setRegions] = useState([]);
  const [regionsLoading, setRegionsLoading] = useState(false);
  const [savingRegion, setSavingRegion] = useState(false);
  const [togglingRegionId, setTogglingRegionId] = useState(null);
  const [deletingRegionId, setDeletingRegionId] = useState(null);
  const [search, setSearch] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("all");

  // ★ 구/군 관리 상태
  const [expandedDistrictRegion, setExpandedDistrictRegion] = useState(null); // 펼쳐진 regionId
  const [districtsMap, setDistrictsMap] = useState({}); // { regionId: [...] }
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [districtForm, setDistrictForm] = useState(null); // null | { regionId, id?, name, sortOrder }
  const [savingDistrict, setSavingDistrict] = useState(false);

  // Modal/Dialog 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState(null);
  const [regionFormData, setRegionFormData] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteOption, setDeleteOption] = useState("unlink");

  // Toast 상태
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });

  useEffect(() => {
    if (!isAdminAuthenticatedLocal()) {
      navigate("/admin/login", { replace: true });
      return;
    }
    loadRegions();
  }, [navigate]);

  const loadRegions = async () => {
    setRegionsLoading(true);
    try {
      const serverRegions = await storageAdapter.getRegions();
      setRegions(Array.isArray(serverRegions) ? serverRegions : []);
    } catch (e) {
      console.error('[AdminRegions] Failed to load regions (SSOT):', e);
      setToast({ open: true, message: e?.message || '지역 목록을 불러오지 못했습니다.', type: 'error' });
      setRegions([]);
    } finally {
      setRegionsLoading(false);
    }
  };

  // 필터링된 지역 목록
  const filteredRegions = useMemo(() => {
    let list = [...regions];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q));
    }
    if (provinceFilter !== "all") {
      list = list.filter((r) => r.province === provinceFilter);
    }
    return list;
  }, [regions, search, provinceFilter]);

  // 연결된 데이터 개수 계산
  const getLinkedCount = (regionId) => {
    const shops = getShops().filter((s) => s.regionId === regionId).length;
    const missions = getMissions().filter((m) => m.regionId === regionId).length;
    const events = getEvents().filter((e) => e.regionId === regionId).length;
    const auditions = getAuditions().filter((a) => a.regionId === regionId).length;
    return { shops, missions, events, auditions, total: shops + missions + events + auditions };
  };

  // 지역 추가/수정 모달 열기
  const openCreateModal = () => {
    setEditingRegion(null);
    setRegionFormData({});
    setModalOpen(true);
  };

  const openEditModal = (region) => {
    setEditingRegion(region);
    setRegionFormData({
      ...region,
      city: region.city || region.district || "",
    });
    setModalOpen(true);
  };

  // 지역 저장 (server-first)
  const handleSave = async (data) => {
    if (savingRegion) return;
    setSavingRegion(true);
    try {
      const payload = {
        ...data,
        name: String(data.name || "").trim(),
        province: String(data.province || "").trim(),
        city: String(data.city || data.district || "").trim(),
      };
      if (editingRegion) payload.id = editingRegion.id;
      console.log('[FORENSIC][AdminRegions.handleSave] payload', payload);
      
      await storageAdapter.upsertRegion(payload);
      
      // 서버 저장 성공 → 서버에서 다시 불러오기 (중복 방지)
      setToast({ 
        open: true, 
        message: editingRegion ? "지역이 수정되었습니다." : "지역이 추가되었습니다.", 
        type: "success" 
      });
      
      setModalOpen(false);
      await loadRegions();
    } catch (error) {
      console.error('[AdminRegions] Save error:', error);
      const msg = String(error?.message || '저장 실패');
      const isDup = msg.includes('409') || msg.toLowerCase().includes('conflict') || msg.includes('이미');
      setToast({ open: true, message: isDup ? '이미 존재하는 지역명입니다.' : msg, type: "error" });
    } finally {
      setSavingRegion(false);
    }
  };

  // 삭제 확인 열기
  const openDeleteConfirm = (id) => {
    setDeleteTargetId(id);
    setDeleteOption("unlink");
    setConfirmOpen(true);
  };

  // 삭제 실행 (server-first)
  const handleDelete = async () => {
    if (!deleteTargetId) {
      setConfirmOpen(false);
      return;
    }
    
    const targetId = deleteTargetId;
    const option = deleteOption;
    
    try {
      setDeletingRegionId(targetId);
      await storageAdapter.deleteRegion(targetId);
      
      setToast({ open: true, message: "지역이 삭제되었습니다.", type: "success" });
      await loadRegions();
    } catch (error) {
      console.error('[AdminRegions] Delete error:', error);
      setToast({ open: true, message: error.message || "삭제 실패", type: "error" });
    } finally {
      setConfirmOpen(false);
      setDeleteTargetId(null);
      setDeletingRegionId(null);
    }
  };

  // ★ 구/군 로드
  const loadDistricts = useCallback(async (regionId) => {
    setDistrictsLoading(true);
    try {
      const list = await getDistricts(regionId);
      setDistrictsMap(prev => ({ ...prev, [regionId]: Array.isArray(list) ? list : [] }));
    } catch (e) {
      setToast({ open: true, message: e?.message || '구/군 로드 실패', type: 'error' });
    } finally {
      setDistrictsLoading(false);
    }
  }, []);

  // ★ 구/군 패널 토글
  const toggleDistrictPanel = useCallback(async (regionId) => {
    if (expandedDistrictRegion === regionId) {
      setExpandedDistrictRegion(null);
      setDistrictForm(null);
    } else {
      setExpandedDistrictRegion(regionId);
      setDistrictForm(null);
      if (!districtsMap[regionId]) {
        await loadDistricts(regionId);
      }
    }
  }, [expandedDistrictRegion, districtsMap, loadDistricts]);

  // ★ 구/군 저장
  const handleSaveDistrict = useCallback(async () => {
    if (!districtForm || !districtForm.name?.trim()) return;
    if (savingDistrict) return;
    setSavingDistrict(true);
    try {
      await upsertDistrict({
        id: districtForm.id || undefined,
        regionId: districtForm.regionId,
        name: districtForm.name.trim(),
        sortOrder: parseInt(districtForm.sortOrder) || 0,
      });
      setToast({ open: true, message: districtForm.id ? '수정되었습니다.' : '추가되었습니다.', type: 'success' });
      setDistrictForm(null);
      await loadDistricts(districtForm.regionId);
    } catch (e) {
      setToast({ open: true, message: e?.message || '저장 실패', type: 'error' });
    } finally {
      setSavingDistrict(false);
    }
  }, [districtForm, savingDistrict, loadDistricts]);

  // ★ 구/군 삭제
  const handleDeleteDistrict = useCallback(async (district) => {
    if (!window.confirm(`"${district.name}" 구/군을 삭제하시겠습니까?`)) return;
    try {
      await deleteDistrict(district.id);
      setToast({ open: true, message: '삭제되었습니다.', type: 'success' });
      await loadDistricts(district.regionId);
    } catch (e) {
      setToast({ open: true, message: e?.message || '삭제 실패', type: 'error' });
    }
  }, [loadDistricts]);

  // 공개 토글 (로컬 즉시 반영 + 서버에 영구 저장)
  const handleTogglePublic = async (id) => {
    if (togglingRegionId) return;
    const current = regions.find((r) => r.id === id);
    if (!current) return;
    const nextPublic = !current.isPublic;

    try {
      setTogglingRegionId(id);
      await storageAdapter.setRegionPublic(id, nextPublic);
      setToast({
        open: true,
        message: nextPublic ? "지역이 공개되었습니다." : "지역이 비공개 처리되었습니다.",
        type: "success",
      });
      await loadRegions();
    } catch (e) {
      console.error('[AdminRegions] Failed to persist public flag:', e);
      setToast({ open: true, message: e?.message || '서버 동기화에 실패했습니다.', type: 'error' });
    } finally {
      setTogglingRegionId(null);
    }
  };

  // 폼 필드 정의
  const cityOptions = [
    { value: "", label: regionFormData.province ? "시/군/구 선택" : "시/도를 먼저 선택하세요" },
    ...((DISTRICTS[regionFormData.province] || []).map((city) => ({ value: city, label: city }))),
  ];

  const formFields = [
    { key: "name", label: "지역명", type: "text", placeholder: "실제 생성될 지역 이름을 입력하세요", required: true },
    { key: "province", label: "시/도 (행정구역 분류용)", type: "select", options: PROVINCES.map((p) => ({ value: p, label: p })), required: true },
    { key: "city", label: "시/군/구 (행정구역 분류용)", type: "select", options: cityOptions, required: true, disabled: !regionFormData.province },
    { key: "intro", label: "소개", type: "textarea", placeholder: "지역 소개 문구", rows: 3 },
    { key: "aptHouseholds", label: "아파트 세대수", type: "number", placeholder: "예: 15000" },
    { key: "avgSalePrice", label: "평균 매매가", type: "text", placeholder: "예: 25억" },
    { key: "trafficInfo", label: "교통 정보", type: "textarea", placeholder: "교통 정보", rows: 2 },
    { key: "tourSpots", label: "관광지", type: "tags", placeholder: "쉼표로 구분" },
    { key: "festivals", label: "축제", type: "tags", placeholder: "쉼표로 구분" },
    { key: "isPublic", label: "공개 여부", type: "checkbox", placeholder: "공개" },
  ];

  // 스타일
  const pageStyle = {
    minHeight: "100vh",
    background: "#0f0f14",
    padding: "20px 16px 100px",
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 12,
  };

  const titleStyle = {
    fontSize: 20,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    gap: 10,
  };

  const backBtnStyle = {
    background: "none",
    border: "none",
    color: "#a855f7",
    fontSize: 14,
    cursor: "pointer",
  };

  const addBtnStyle = {
    padding: "10px 20px",
    borderRadius: 8,
    border: "none",
    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  };

  const filterRowStyle = {
    display: "flex",
    gap: 10,
    marginBottom: 16,
    flexWrap: "wrap",
  };

  const inputStyle = {
    flex: 1,
    minWidth: 150,
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.06)",
    color: "#ffffff",
    fontSize: 14,
    outline: "none",
  };

  const selectStyle = {
    ...inputStyle,
    flex: "none",
    minWidth: 120,
  };

  const countBadge = {
    background: "rgba(168,85,247,0.2)",
    color: "#a855f7",
    padding: "2px 8px",
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 600,
  };

  const cardStyle = {
    background: "#18181b",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.08)",
    padding: 16,
    marginBottom: 12,
  };

  const cardHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  };

  const regionNameStyle = {
    fontSize: 16,
    fontWeight: 700,
  };

  const badgeStyle = (isPublic) => ({
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    background: isPublic ? "rgba(34,197,94,0.15)" : "rgba(107,114,128,0.15)",
    color: isPublic ? "#22c55e" : "#6b7280",
    marginLeft: 8,
  });

  const infoRowStyle = {
    display: "flex",
    gap: 16,
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 10,
    flexWrap: "wrap",
  };

  const actionRowStyle = {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  };

  const actionBtnStyle = (color) => ({
    padding: "6px 12px",
    borderRadius: 6,
    border: "none",
    background: color,
    color: "#fff",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  });

  const linkedDataNote = deleteTargetId ? getLinkedCount(deleteTargetId) : { total: 0 };

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={titleStyle}>
          <button style={backBtnStyle} onClick={() => navigate("/admin")}>
            ← 뒤로
          </button>
          📍 지역 관리
          <span style={countBadge}>{regions.length}/50</span>
        </div>
        <button style={addBtnStyle} onClick={openCreateModal} disabled={regions.length >= 50}>
          + 지역 추가
        </button>
      </div>

      {/* Filters */}
      <div style={filterRowStyle}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="지역명 검색..."
          style={inputStyle}
        />
        <select value={provinceFilter} onChange={(e) => setProvinceFilter(e.target.value)} style={selectStyle}>
          <option value="all">전체 시/도</option>
          {PROVINCES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Region List */}
      {regionsLoading ? (
        <div style={{ textAlign: "center", padding: 40, opacity: 0.6 }}>불러오는 중...</div>
      ) : filteredRegions.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, opacity: 0.5 }}>등록된 지역이 없습니다.</div>
      ) : (
        filteredRegions.map((region, idx) => {
          const linked = getLinkedCount(region.id);
          return (
            <div key={`${region.id}-${idx}`} style={cardStyle}>
              <div style={cardHeaderStyle}>
                <div>
                  <span style={regionNameStyle}>{region.name}</span>
                  <span style={badgeStyle(region.isPublic)}>{region.isPublic ? "공개" : "비공개"}</span>
                </div>
                <span style={{ fontSize: 12, opacity: 0.5 }}>{[region.province, region.city || region.district].filter(Boolean).join(" · ")}</span>
              </div>
              <div style={infoRowStyle}>
                <span>🏠 {region.aptHouseholds?.toLocaleString() || 0}세대</span>
                <span>💰 {region.avgSalePrice || "-"}</span>
                <span>🏪 상점 {linked.shops}</span>
                <span>🎯 미션 {linked.missions}</span>
                <span>🎉 이벤트 {linked.events}</span>
              </div>
              <div style={actionRowStyle}>
                <button style={actionBtnStyle("rgba(168,85,247,0.8)")} onClick={() => openEditModal(region)}>
                  ✏️ 수정
                </button>
                <button
                  style={actionBtnStyle(region.isPublic ? "rgba(107,114,128,0.8)" : "rgba(34,197,94,0.8)")}
                  onClick={() => handleTogglePublic(region.id)}
                  disabled={!!togglingRegionId}
                >
                  {togglingRegionId === region.id ? "처리 중..." : (region.isPublic ? "🔒 비공개" : "🔓 공개")}
                </button>
                <button
                  style={actionBtnStyle(expandedDistrictRegion === region.id ? "rgba(59,130,246,0.9)" : "rgba(59,130,246,0.5)")}
                  onClick={() => toggleDistrictPanel(region.id)}
                >
                  🏘️ 구/군 {expandedDistrictRegion === region.id ? '▲' : '▼'}
                </button>
                <button
                  style={actionBtnStyle("rgba(16,185,129,0.8)")}
                  onClick={() => navigate(`/admin/regions/${region.id}/apartments`)}
                >
                  🏢 아파트 관리
                </button>
                <button style={actionBtnStyle("rgba(239,68,68,0.8)")} onClick={() => openDeleteConfirm(region.id)}>
                  🗑️ 삭제
                </button>
              </div>

              {/* ★ 구/군 인라인 관리 패널 */}
              {expandedDistrictRegion === region.id && (
                <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: '#60a5fa' }}>🏘️ {region.name} 구/군 목록</div>
                  {districtsLoading ? (
                    <div style={{ fontSize: 12, opacity: 0.5, padding: '6px 0' }}>불러오는 중...</div>
                  ) : (
                    <>
                      {(districtsMap[region.id] || []).length === 0 ? (
                        <div style={{ fontSize: 12, opacity: 0.5, padding: '4px 0 8px' }}>등록된 구/군이 없습니다.</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                          {(districtsMap[region.id] || []).map(d => (
                            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.04)' }}>
                              {districtForm?.id === d.id ? (
                                <>
                                  <input
                                    value={districtForm.name}
                                    onChange={e => setDistrictForm(f => ({ ...f, name: e.target.value }))}
                                    style={{ flex: 1, padding: '4px 8px', borderRadius: 4, border: '1px solid rgba(96,165,250,0.4)', background: 'rgba(255,255,255,0.08)', color: 'inherit', fontSize: 12 }}
                                    placeholder="구/군명"
                                    autoFocus
                                    onKeyDown={e => e.key === 'Enter' && handleSaveDistrict()}
                                  />
                                  <button onClick={handleSaveDistrict} disabled={savingDistrict} style={{ padding: '4px 10px', borderRadius: 4, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 11, cursor: 'pointer' }}>
                                    {savingDistrict ? '...' : '저장'}
                                  </button>
                                  <button onClick={() => setDistrictForm(null)} style={{ padding: '4px 8px', borderRadius: 4, border: 'none', background: 'rgba(255,255,255,0.1)', color: 'inherit', fontSize: 11, cursor: 'pointer' }}>취소</button>
                                </>
                              ) : (
                                <>
                                  <span style={{ flex: 1, fontSize: 13 }}>{d.name}</span>
                                  <span style={{ fontSize: 11, opacity: 0.4 }}>#{d.sortOrder}</span>
                                  <button
                                    onClick={() => setDistrictForm({ id: d.id, regionId: region.id, name: d.name, sortOrder: d.sortOrder })}
                                    style={{ padding: '3px 8px', borderRadius: 4, border: 'none', background: 'rgba(168,85,247,0.6)', color: '#fff', fontSize: 11, cursor: 'pointer' }}
                                  >수정</button>
                                  <button
                                    onClick={() => handleDeleteDistrict(d)}
                                    style={{ padding: '3px 8px', borderRadius: 4, border: 'none', background: 'rgba(239,68,68,0.6)', color: '#fff', fontSize: 11, cursor: 'pointer' }}
                                  >삭제</button>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 추가 폼 */}
                      {districtForm && !districtForm.id ? (
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <input
                            value={districtForm.name}
                            onChange={e => setDistrictForm(f => ({ ...f, name: e.target.value }))}
                            style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(96,165,250,0.4)', background: 'rgba(255,255,255,0.08)', color: 'inherit', fontSize: 13 }}
                            placeholder="구/군/시명 입력 (예: 해운대구)"
                            autoFocus
                            onKeyDown={e => e.key === 'Enter' && handleSaveDistrict()}
                          />
                          <input
                            type="number"
                            value={districtForm.sortOrder}
                            onChange={e => setDistrictForm(f => ({ ...f, sortOrder: e.target.value }))}
                            style={{ width: 52, padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(96,165,250,0.2)', background: 'rgba(255,255,255,0.06)', color: 'inherit', fontSize: 12 }}
                            placeholder="순서"
                          />
                          <button onClick={handleSaveDistrict} disabled={savingDistrict} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: '#3b82f6', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                            {savingDistrict ? '저장 중...' : '추가'}
                          </button>
                          <button onClick={() => setDistrictForm(null)} style={{ padding: '6px 10px', borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.1)', color: 'inherit', fontSize: 12, cursor: 'pointer' }}>취소</button>
                        </div>
                      ) : (
                        !districtForm && (
                          <button
                            onClick={() => setDistrictForm({ regionId: region.id, name: '', sortOrder: (districtsMap[region.id] || []).length })}
                            style={{ padding: '6px 14px', borderRadius: 6, border: '1px dashed rgba(96,165,250,0.4)', background: 'transparent', color: '#60a5fa', fontSize: 12, cursor: 'pointer', width: '100%' }}
                          >+ 구/군 추가</button>
                        )
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Create/Edit Modal */}
      <AdminModalForm
        open={modalOpen}
        title={editingRegion ? "지역 수정" : "지역 추가"}
        fields={formFields}
        initialData={editingRegion ? { ...editingRegion, city: editingRegion.city || editingRegion.district || "" } : {}}
        onSubmit={handleSave}
        onChange={(next) => {
          setRegionFormData((prev) => {
            const nextProvince = next.province || "";
            const nextCity = next.city || "";
            const validCities = DISTRICTS[nextProvince] || [];
            const normalizedCity = validCities.includes(nextCity) ? nextCity : "";
            return {
              ...next,
              province: nextProvince,
              city: normalizedCity,
            };
          });
        }}
        onCancel={() => setModalOpen(false)}
        submitText={savingRegion ? "저장 중..." : (editingRegion ? "수정" : "추가")}
        submitDisabled={savingRegion}
      />

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title="지역 삭제"
        message={
          linkedDataNote.total > 0
            ? `이 지역에 연결된 데이터(상점 ${linkedDataNote.shops}, 미션 ${linkedDataNote.missions}, 이벤트 ${linkedDataNote.events}, 오디션 ${linkedDataNote.auditions})가 있습니다. 어떻게 처리하시겠습니까?`
            : "이 지역을 삭제하시겠습니까?"
        }
        confirmText="삭제"
        confirmColor="#ef4444"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      >
            {linkedDataNote.total > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="radio"
                name="deleteOption"
                value="unlink"
                checked={deleteOption === "unlink"}
                onChange={() => setDeleteOption("unlink")}
              />
              <span>연결 해제 (데이터 유지, 지역없음으로 이동)</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="radio"
                name="deleteOption"
                value="delete"
                checked={deleteOption === "delete"}
                onChange={() => setDeleteOption("delete")}
              />
              <span style={{ color: "#ef4444" }}>함께 삭제 (연결된 모든 데이터 삭제)</span>
            </label>
          </div>
        )}
      </ConfirmDialog>

      {/* Toast */}
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </div>
  );
}
