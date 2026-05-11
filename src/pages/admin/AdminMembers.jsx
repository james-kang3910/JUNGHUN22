import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as storageAdapter from "../../lib/storageAdapter";
import {
  getMembers,
  updateUser,
  setUserStatus,
  setUserMemo,
  getRegions,
  syncAuthToUsers,
  clearAllUsers,
} from "../../lib/adminStore";
import { isAdminAuthenticatedLocal } from "../../lib/adminAuth";
import { assignableRoles, ROLE_LEVEL, getRoleMeta, ROLES } from "../../lib/permissions";
import ConfirmDialog from "./components/ConfirmDialog";
import Toast from "./components/Toast";

console.log('[PAGE]', 'AdminMembers.jsx (active)');

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "활성", color: "#22c55e" },
  { value: "PENDING", label: "대기", color: "#f59e0b" },
  { value: "SUSPENDED", label: "정지", color: "#ef4444" },
];
// ── 역할 정의 ── (permissions.js로 통합, 하풀 호환성을 위해 ROLE_OPTIONS/getRoleInfo 유지)
const ROLE_OPTIONS = [
  { value: ROLES.USER,                 label: '일반회원',     color: '#6b7280', icon: '👤' },
  { value: ROLES.REGION_MANAGER,       label: '지역관리자',   color: '#2563eb', icon: '📍' },
  { value: ROLES.REGION_SUPER_MANAGER, label: '지역총관리자', color: '#0ea5a4', icon: '🌏' },
  { value: ROLES.ADMIN,                label: '관리자',       color: '#8b5cf6', icon: '🛡️' },
  { value: ROLES.SUPER_ADMIN,          label: '총관리자',     color: '#f59e0b', icon: '⭐' },
  { value: ROLES.WEBSITE_ADMIN,        label: '웹사이트 관리자', color: '#ec4899', icon: '🌐' },
];
const getRoleInfo = (role) => ROLE_OPTIONS.find((r) => r.value === role) || ROLE_OPTIONS[0];

const sanitizeSdMarkInput = (value) => String(value ?? '').replace(/\D/g, '');

const normalizeSdMarkValue = (value) => {
  const sanitized = sanitizeSdMarkInput(value).trim();
  if (!sanitized) return null;
  const parsed = Number(sanitized);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
};

const normalizeSdMarkPayloadValue = (value) => {
  const sanitized = sanitizeSdMarkInput(value).trim();
  if (!sanitized) return null;
  const parsed = Number(sanitized);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
};

const SD_MARK_STORAGE_KEY = 'su_member_sd_marks_v1';

const readSdMarkCache = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(SD_MARK_STORAGE_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    return {};
  }
};

const writeSdMarkCache = (memberId, value) => {
  if (!memberId) return;
  try {
    const next = readSdMarkCache();
    if (value == null) delete next[String(memberId)];
    else next[String(memberId)] = Number(value);
    localStorage.setItem(SD_MARK_STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    console.error('[AdminMembers] writeSdMarkCache failed:', error);
  }
};

const getCachedSdMark = (memberId) => {
  const cached = readSdMarkCache()[String(memberId || '')];
  return normalizeSdMarkPayloadValue(cached);
};

export default function AdminMembers() {
  console.log('[FORENSIC] 🔍 THIS FILE IS USED: src/pages/admin/AdminMembers.jsx');
  // 진단 로그: 마운트 시 1회 su_members_v1 상태 출력
  useEffect(() => {
    const raw = localStorage.getItem("su_members_v1");
    let parsed = [];
    try { parsed = JSON.parse(raw) || []; } catch {}
    console.log("[AdminMembers][진단] su_members_v1 length:", parsed.length);
    if (parsed.length > 0) console.log("[AdminMembers][진단] su_members_v1[0] sample:", parsed[0]);
  }, []);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [regions, setRegions] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 상세 보기/메모 수정
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [memoValue, setMemoValue] = useState("");

  // 역할 관리 상태
  const [roleChanging, setRoleChanging] = useState(false);
  const [regionAssignments, setRegionAssignments] = useState([]);
  const [regionAssignLoading, setRegionAssignLoading] = useState(false);
  const [addRegionId, setAddRegionId] = useState("");

  // 회원 정보 수정 상태
  const [editInfo, setEditInfo] = useState({ name: '', phone: '', regionId: '', districtId: '', address: '', sdMark: '' });
  const [editDistricts, setEditDistricts] = useState([]); // 구/군 목록
  const [savingInfo, setSavingInfo] = useState(false);

  // 상태 변경 확인
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  
  // 전체 삭제 확인
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  // Toast 상태
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });

  useEffect(() => {
    if (!isAdminAuthenticatedLocal()) {
      navigate("/admin/login", { replace: true });
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ★ 기존 회원가입 데이터 동기화
      const syncResult = syncAuthToUsers();
      console.log("[AdminMembers] syncAuthToUsers result:", syncResult);
      
      // 서버에서 회원 목록 가져오기
      const serverMembers = await storageAdapter.getMembers();
      console.log("[AdminMembers] loaded from server:", serverMembers);
      
      // ✅ DEBUG MODE: Use server data only (no localStorage merge)
      console.log('[AdminMembers] DEBUG_SSOT: Using server data only (localStorage merge disabled)');
      setUsers(serverMembers || []);
      // 서버에서 regions 로드
      const serverRegions = await storageAdapter.getRegions();
      localStorage.setItem("su_regions", JSON.stringify(serverRegions || []));
      setRegions(serverRegions || []);
    } catch (err) {
      console.error("[AdminMembers] Failed to load members from server:", err);
      setError(err.message);
      
      // ✅ DEBUG MODE: No fallback to localStorage
      console.log('[AdminMembers] DEBUG_SSOT: Server failed, showing empty list');
      setUsers([]);
      alert('서버에서 회원 목록을 불러올 수 없습니다: ' + err.message);
      // 폴백 regions도 서버 우선 시도
      try {
        const serverRegions = await storageAdapter.getRegions();
        localStorage.setItem("su_regions", JSON.stringify(serverRegions || []));
        setRegions(serverRegions || []);
      } catch (e) {
        setRegions(getRegions());
      }
    } finally {
      setLoading(false);
    }
  };

  // 필터링된 회원 목록
  const filteredUsers = useMemo(() => {
    let list = [...users];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.nickname?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phone?.includes(q)
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((u) => u.status === statusFilter);
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [users, search, statusFilter]);

  // 지역명 가져오기
  const getRegionName = (regionId) => {
    if (!regionId) return "미지정";
    const region = regions.find((r) => r.id === regionId);
    return region ? region.name : "알 수 없음";
  };

  // 상태 정보 가져오기
  const getStatusInfo = (status) => {
    return STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[1];
  };

  // 상세 보기 열기
  const openDetail = (user) => {
    setSelectedUser(user);
    setMemoValue(user.memo || "");
    setDetailOpen(true);
    setRegionAssignments([]);
    // 기존 districtId 없고 지역의 city가 있으면 자동 채움
    const existingDistrictId = user.districtId || user.district_id || '';
    const userRegion = regions.find(r => r.id === (user.regionId || ''));
    const autoDistrict = existingDistrictId || String(userRegion?.city || userRegion?.district || '').trim();
    setEditInfo({
      name: user.name || '',
      phone: user.phone || '',
      regionId: user.regionId || '',
      districtId: autoDistrict,
      address: user.address || '',
      sdMark: (() => {
        const resolved = normalizeSdMarkPayloadValue(user.sdMark) ?? getCachedSdMark(user.memberId || user.id);
        return resolved ? String(resolved) : '';
      })(),
    });
    setEditDistricts([]);
    // 지역이 있으면 구/군 목록 자동 로드
    if (user.regionId) {
      storageAdapter.getDistricts(user.regionId).then(list => {
        const dList = list || [];
        setEditDistricts(dList);
        // districts 목록에서 현재 district와 일치하는 항목 자동 매핑
        if (dList.length > 0 && autoDistrict && !existingDistrictId) {
          const match = dList.find(d => (d.name || d.district_name) === autoDistrict);
          if (match) setEditInfo(prev => ({ ...prev, districtId: String(match.id || match.district_id) }));
        }
      }).catch(() => {});
    }
    // REGION_ADMIN이면 배정 목록 로드
    if (user.role === 'REGION_ADMIN') {
      loadRegionAssignments(user.memberId || user.id);
    }
  };

  const loadRegionAssignments = async (memberId) => {
    try {
      setRegionAssignLoading(true);
      const list = await storageAdapter.getMemberRegionAssignments(memberId);
      setRegionAssignments(list || []);
    } catch (e) {
      console.error('[AdminMembers] loadRegionAssignments error:', e);
    } finally {
      setRegionAssignLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setRoleChanging(true);
      await storageAdapter.setMemberRole(userId, newRole);
      setToast({ open: true, message: `역할이 '${getRoleInfo(newRole).label}'으로 변경되었습니다.`, type: 'success' });
      // 로컈 상태 반영
      setUsers(prev => prev.map(u => {
        const uid = String(u.memberId || u.id || '');
        return uid === String(userId) ? { ...u, role: newRole } : u;
      }));
      if (selectedUser && String(selectedUser.memberId || selectedUser.id) === String(userId)) {
        const updated = { ...selectedUser, role: newRole };
        setSelectedUser(updated);
        if (newRole === 'REGION_ADMIN') loadRegionAssignments(userId);
        else setRegionAssignments([]);
      }
    } catch (e) {
      setToast({ open: true, message: '역할 변경 실패: ' + e.message, type: 'error' });
    } finally {
      setRoleChanging(false);
    }
  };

  const handleAddRegion = async (regionId) => {
    if (!selectedUser || !regionId) return;
    const uid = selectedUser.memberId || selectedUser.id;
    try {
      await storageAdapter.addMemberRegionAssignment(uid, regionId);
      await loadRegionAssignments(uid);
      setToast({ open: true, message: '지역이 배정되었습니다.', type: 'success' });
    } catch (e) {
      setToast({ open: true, message: '배정 실패: ' + e.message, type: 'error' });
    }
  };

  const handleRemoveRegion = async (regionId) => {
    if (!selectedUser) return;
    const uid = selectedUser.memberId || selectedUser.id;
    try {
      await storageAdapter.removeMemberRegionAssignment(uid, regionId);
      setRegionAssignments(prev => prev.filter(a => a.region_id !== regionId));
      setToast({ open: true, message: '지역 배정이 해제되었습니다.', type: 'success' });
    } catch (e) {
      setToast({ open: true, message: '해제 실패: ' + e.message, type: 'error' });
    }
  };

  const getSelectedUserKey = () => String(selectedUser?.memberId || selectedUser?.id || '');

  // 회원 정보 저장 (PATCH 이름/전화번호/주소)
  const handleSaveInfo = async () => {
    if (!selectedUser) return;
    const uid = selectedUser.memberId || selectedUser.id;
    try {
      setSavingInfo(true);
      const payload = {};
      if (editInfo.name.trim()    !== (selectedUser.name    || '')) payload.name    = editInfo.name.trim();
      if (editInfo.phone.trim()   !== (selectedUser.phone   || '')) payload.phone   = editInfo.phone.trim();
      const currentSdMark = normalizeSdMarkPayloadValue(selectedUser.sdMark);
      const nextSdMark = normalizeSdMarkPayloadValue(editInfo.sdMark);
      if (currentSdMark !== nextSdMark) {
        payload.sdMark = nextSdMark;
        payload.sd_mark = nextSdMark;
      }
      const curRegionId = selectedUser.regionId || '';
      const curDistrictId = selectedUser.districtId || selectedUser.district_id || '';
      if (editInfo.regionId   !== curRegionId)   payload.regionId   = editInfo.regionId || null;
      if (editInfo.districtId !== curDistrictId) payload.districtId = editInfo.districtId || null;
      if (editInfo.address.trim() !== (selectedUser.address || '')) payload.address = editInfo.address.trim();
      if (Object.keys(payload).length === 0) {
        setToast({ open: true, message: '변경된 내용이 없습니다.', type: 'info' });
        return;
      }
      console.log('[MEMBER-SD-SAVE]', payload);
      const response = await storageAdapter.patchMember(uid, payload);
      console.log('[MEMBER-SD-SAVE][response]', response);
      const updatedMember = response?.member || response?.data?.member || response?.updated || null;
      const updated = updatedMember
        ? { ...selectedUser, ...payload, ...updatedMember, sdMark: updatedMember.sdMark ?? payload.sdMark ?? selectedUser.sdMark }
        : { ...selectedUser, ...payload };
      writeSdMarkCache(uid, payload.sdMark ?? updated.sdMark ?? null);
      setSelectedUser(updated);
      setUsers(prev => prev.map(u => String(u.memberId || u.id) === String(uid) ? { ...u, ...updated, sdMark: updated.sdMark ?? payload.sdMark ?? u.sdMark } : u));
      setToast({ open: true, message: '회원 정보가 저장되었습니다.', type: 'success' });
    } catch (e) {
      setToast({ open: true, message: '저장 실패: ' + e.message, type: 'error' });
    } finally {
      setSavingInfo(false);
    }
  };
  // ★ 보급지원 권한 토글
  const toggleSupplyManager = async (userId, enabled) => {
    try {
      const res = await updateUser(userId, { supplyManager: !!enabled });
      if (res.success) {
        setToast({ 
          open: true, 
          message: enabled ? '보급지원 권한을 부여했습니다.' : '보급지원 권한을 취소했습니다.', 
          type: 'success' 
        });
        setUsers(prev => prev.map(u => String(u.memberId || u.id || '') === String(userId) ? { ...u, supplyManager: !!enabled } : u));
        if (selectedUser && getSelectedUserKey() === String(userId)) {
          setSelectedUser(prev => ({ ...prev, supplyManager: !!enabled }));
        }
        await loadData();
      }
    } catch (e) {
      console.error('[AdminMembers] toggleSupplyManager error:', e);
      setToast({ open: true, message: '권한 변경에 실패했습니다.', type: 'error' });
    }
  };

  // ★ 유통지원 권한 토글
  const toggleDistributionManager = async (userId, enabled) => {
    try {
      const res = await updateUser(userId, { distributionManager: !!enabled });
      if (res.success) {
        setToast({
          open: true,
          message: enabled ? '유통지원 권한을 부여했습니다.' : '유통지원 권한을 취소했습니다.',
          type: 'success'
        });
        setUsers(prev => prev.map(u => String(u.memberId || u.id || '') === String(userId) ? { ...u, distributionManager: !!enabled } : u));
        if (selectedUser && getSelectedUserKey() === String(userId)) {
          setSelectedUser(prev => ({ ...prev, distributionManager: !!enabled }));
        }
        await loadData();
      }
    } catch (e) {
      console.error('[AdminMembers] toggleDistributionManager error:', e);
      setToast({ open: true, message: '권한 변경에 실패했습니다.', type: 'error' });
    }
  };

  // 메모 저장
  const handleSaveMemo = () => {
    if (selectedUser) {
      const result = setUserMemo(selectedUser.id, memoValue);
      if (result.success) {
        setToast({ open: true, message: "메모가 저장되었습니다.", type: "success" });
        loadData();
        setSelectedUser({ ...selectedUser, memo: memoValue });
      }
    }
  };

  // 상태 변경 확인 열기
  const openStatusConfirm = (userId, newStatus) => {
    if (userId === undefined || userId === null || String(userId).trim() === "") {
      setToast({ open: true, message: "상태 변경 실패: 회원 ID가 없습니다.", type: "error" });
      return;
    }
    setPendingStatusChange({ userId, newStatus });
    setConfirmOpen(true);
  };

  // 상태 변경 실행
  const handleStatusChange = async () => {
    if (pendingStatusChange) {
      const { userId, newStatus } = pendingStatusChange;
      
      // ★ updateUser는 async이므로 await 필요
      const result = await updateUser(userId, { status: newStatus.toUpperCase() });
      
      if (result.success) {
        const statusInfo = getStatusInfo(newStatus);
        setToast({ open: true, message: `회원 상태가 '${statusInfo.label}'로 변경되었습니다.`, type: "success" });
        
        // ★ 서버 응답 기준으로 로컬 users 상태 갱신
        setUsers(prevUsers => prevUsers.map(u => {
          const uKey = String(u.memberId || u.id || "");
          const targetKey = String(userId);
          return (uKey === targetKey)
            ? { ...u, status: (result.data?.status || newStatus).toUpperCase() }
            : u;
        }));
        
        // 상세 모달이 열려있으면 업데이트
        if (selectedUser && (selectedUser.id === userId || selectedUser.memberId === userId)) {
          setSelectedUser({ ...selectedUser, status: (result.data?.status || newStatus).toUpperCase() });
        }
      } else {
        setToast({ open: true, message: `상태 변경 실패: ${result.error}`, type: "error" });
      }
    }
    setConfirmOpen(false);
    setPendingStatusChange(null);
  };

  // ★ 전체 회원 삭제
  const handleClearAllUsers = () => {
    const result = clearAllUsers();
    if (result.success) {
      setToast({ open: true, message: "모든 회원이 삭제되었습니다.", type: "success" });
      loadData();
    }
    setClearConfirmOpen(false);
  };

  // ★ 회원 삭제 상태 (2단 확인)
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { userId, userName }

  // ★ 회원 삭제 함수
  const handleDeleteUser = async (userId, userName) => {
    if (!deleteConfirm || deleteConfirm.userId !== userId) {
      // 1단계: 확인 상태 설정
      setDeleteConfirm({ userId, userName });
      setTimeout(() => setDeleteConfirm(null), 3000); // 3초 후 취소
      return;
    }

    // 2단계: 실제 삭제
    try {
      const res = await storageAdapter.deleteMember(userId);
      if (res && (res.success || res.ok)) {
        setToast({ open: true, message: `${userName} 회원이 삭제되었습니다.`, type: 'success' });
        await loadData();
      } else {
        setToast({ open: true, message: '삭제 실패: ' + (res?.error || 'unknown'), type: 'error' });
      }
    } catch (e) {
      console.error('[AdminMembers] deleteUser error:', e);
      setToast({ open: true, message: '삭제 중 오류가 발생했습니다.', type: 'error' });
    } finally {
      setDeleteConfirm(null);
    }
  };

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

  const filterRowStyle = { display: "flex", gap: 10, marginBottom: 16 };
  const inputStyle = { flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "inherit", fontSize: 14, outline: "none" };

  const cardStyle = { background: "#18181b", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", padding: 16, marginBottom: 12 };
  const cardHeaderStyle = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 };
  const userNameStyle = { fontSize: 16, fontWeight: 700 };
  const badgeStyle = (color) => ({ display: "inline-block", padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: `${color}20`, color, marginLeft: 8 });
  const infoRowStyle = { display: "flex", gap: 16, fontSize: 13, opacity: 0.7, marginBottom: 10, flexWrap: "wrap" };
  const actionRowStyle = { display: "flex", gap: 8, flexWrap: "wrap" };
  const actionBtnStyle = (color) => ({ padding: "6px 12px", borderRadius: 6, border: "none", background: color, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" });

  // 상세 모달 스타일
  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9998,
    padding: 16,
  };

  const modalStyle = {
    background: "#1e1e28",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.1)",
    padding: 24,
    maxWidth: 450,
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
  };

  // 통계
  const stats = {
    all: users.length,
    active: users.filter((u) => u.status === "active").length,
    pending: users.filter((u) => u.status === "pending").length,
    suspended: users.filter((u) => u.status === "suspended").length,
  };

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={titleStyle}>
          <button style={backBtnStyle} onClick={() => navigate("/admin")}>← 뒤로</button>
          👥 회원 관리
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button 
            onClick={loadData}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: "rgba(139,92,246,0.2)",
              color: "#a855f7",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            🔄 새로고침
          </button>
        </div>
      </div>

      {/* 로딩/오류 상태 */}
      {loading && (
        <div style={{ textAlign: "center", padding: "40px 20px", fontSize: 14, opacity: 0.7 }}>
          ⏳ 회원 목록 로딩 중...
        </div>
      )}
      
      {error && !loading && (
        <div style={{ padding: "16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          ⚠️ 서버 오류: {error} (캐시된 데이터 표시 중)
        </div>
      )}

      {!loading && (
        <>
      {/* Stats Tabs */}
      <div style={statsRowStyle}>
        <button style={statBadgeStyle("#a855f7", statusFilter === "all")} onClick={() => setStatusFilter("all")}>
          전체 ({stats.all})
        </button>
        <button style={statBadgeStyle("#22c55e", statusFilter === "active")} onClick={() => setStatusFilter("active")}>
          활성 ({stats.active})
        </button>
        <button style={statBadgeStyle("#f59e0b", statusFilter === "pending")} onClick={() => setStatusFilter("pending")}>
          대기 ({stats.pending})
        </button>
        <button style={statBadgeStyle("#ef4444", statusFilter === "suspended")} onClick={() => setStatusFilter("suspended")}>
          정지 ({stats.suspended})
        </button>
      </div>

      {/* Filter */}
      <div style={filterRowStyle}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="닉네임/이메일/전화번호 검색..."
          style={inputStyle}
        />
      </div>

      {/* List */}
      {filteredUsers.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, opacity: 0.5 }}>등록된 회원이 없습니다.</div>
      ) : (
        filteredUsers.map((user) => {
          const statusInfo = getStatusInfo(user.status);
          const displayName = user.name || user.nickname || "이름 없음";
          return (
            <div key={user.id || user.memberId || user.email || user.phone} style={cardStyle}>
              <div style={cardHeaderStyle}>
                <div>
                  <span style={userNameStyle}>{displayName}</span>
                  {user.nickname && user.name && user.nickname !== user.name && (
                    <span style={{ fontSize: 12, opacity: 0.6, marginLeft: 8 }}>({user.nickname})</span>
                  )}
                  <span style={badgeStyle(statusInfo.color)}>{statusInfo.label}</span>
                  {/* 역할 배지 */}
                  {user.role && user.role !== 'USER' && (() => {
                    const ri = getRoleInfo(user.role);
                    return <span style={{ ...badgeStyle(ri.color), marginLeft: 4 }}>{ri.icon} {ri.label}</span>;
                  })()}
                </div>
                <span style={{ fontSize: 12, opacity: 0.5 }}>{formatDate(user.createdAt)}</span>
              </div>
              <div style={infoRowStyle}>
                <span>✉️ {user.email || "-"}</span>
                <span>📞 {user.phone || "-"}</span>
                <span>📍 {user.region || getRegionName(user.regionId)}</span>
                <span>💰 {user.points?.toLocaleString() || 0}P</span>
              </div>
              {user.memo && (
                <div style={{ fontSize: 12, opacity: 0.5, marginBottom: 10, fontStyle: "italic" }}>
                  📝 {user.memo}
                </div>
              )}
              <div style={actionRowStyle}>
                <button style={actionBtnStyle("rgba(168,85,247,0.8)")} onClick={() => openDetail(user)}>
                  👁️ 상세보기
                </button>
                {String(user.status || "").toLowerCase() !== "active" && (
                  <button style={actionBtnStyle("rgba(34,197,94,0.8)")} onClick={() => openStatusConfirm(user.memberId || user.id, "active")}>
                    ✅ 활성화
                  </button>
                )}
                {String(user.status || "").toLowerCase() !== "suspended" && (
                  <button style={actionBtnStyle("rgba(239,68,68,0.8)")} onClick={() => openStatusConfirm(user.memberId || user.id, "suspended")}>
                    🚫 정지
                  </button>
                )}
                {/* ★ 회원 삭제 버튼 (2단 확인) */}
                <button 
                  style={{
                    ...actionBtnStyle(deleteConfirm && deleteConfirm.userId === (user.memberId || user.id) ? "rgba(220,38,38,1)" : "rgba(239,68,68,0.6)"),
                    fontWeight: deleteConfirm && deleteConfirm.userId === (user.memberId || user.id) ? 900 : 600
                  }} 
                  onClick={() => handleDeleteUser(user.memberId || user.id, user.name || user.nickname || user.email)}
                  disabled={loading}
                >
                  {deleteConfirm && deleteConfirm.userId === (user.memberId || user.id) ? "🗑️ 정말 삭제?" : "🗑️ 삭제"}
                </button>
              </div>
            </div>
          );
        })
      )}

      {/* Detail Modal */}
      {detailOpen && selectedUser && (
        <div style={modalOverlayStyle} onClick={() => setDetailOpen(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>👤 회원 상세</h2>
              <button
                onClick={() => setDetailOpen(false)}
                style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 20, fontWeight: 700 }}>{selectedUser.name || selectedUser.nickname || "이름 없음"}</span>
                {selectedUser.nickname && selectedUser.name && selectedUser.nickname !== selectedUser.name && (
                  <span style={{ fontSize: 14, opacity: 0.6 }}>({selectedUser.nickname})</span>
                )}
                <span style={badgeStyle(getStatusInfo(selectedUser.status).color)}>
                  {getStatusInfo(selectedUser.status).label}
                </span>
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                <div>
                  <span style={{ opacity: 0.6 }}>회원 ID:</span>{" "}
                  <span style={{ fontFamily: "monospace", fontSize: 13, background: "rgba(255,255,255,0.08)", padding: "2px 7px", borderRadius: 4 }}>
                    #{selectedUser.memberId || selectedUser.id || "-"}
                  </span>
                </div>
                <div><span style={{ opacity: 0.6 }}>닉네임:</span> {selectedUser.nickname || "-"}</div>
                <div><span style={{ opacity: 0.6 }}>이메일:</span> {selectedUser.email || "-"}</div>
                <div><span style={{ opacity: 0.6 }}>지역:</span> {selectedUser.region || getRegionName(selectedUser.regionId)}</div>
                <div><span style={{ opacity: 0.6 }}>SD 마킹:</span> {(() => {
                  const resolved = normalizeSdMarkValue(selectedUser.sdMark) ?? getCachedSdMark(selectedUser.memberId || selectedUser.id);
                  return resolved ? `SD ${resolved}` : '-';
                })()}</div>
                <div><span style={{ opacity: 0.6 }}>포인트:</span> {selectedUser.points?.toLocaleString() || 0}P</div>
                <div><span style={{ opacity: 0.6 }}>가입일:</span> {formatDate(selectedUser.createdAt)}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ opacity: 0.6 }}>보급지원 권한:</span>
                  <input 
                    type="checkbox" 
                    checked={!!selectedUser.supplyManager} 
                    onChange={(e) => toggleSupplyManager(selectedUser.memberId || selectedUser.id, e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 12, opacity: 0.7 }}>
                    {selectedUser.supplyManager ? '✓ 권한 있음' : '권한 없음'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ opacity: 0.6 }}>유통지원 권한:</span>
                  <input
                    type="checkbox"
                    checked={!!selectedUser.distributionManager}
                    onChange={(e) => toggleDistributionManager(selectedUser.memberId || selectedUser.id, e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 12, opacity: 0.7 }}>
                    {selectedUser.distributionManager ? '✓ 권한 있음' : '권한 없음'}
                  </span>
                </div>
              </div>
            </div>

            {/* ── 회원 정보 수정 섹션 ── */}
            <div style={{ marginBottom: 20, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "#34d399" }}>
                ✏️ 정보 수정 (회원 ID는 변경 불가)
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                {/* 이름 */}
                {[['name', '이름', 'text'], ['phone', '전화번호', 'tel']].map(([key, label, type]) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: 12, opacity: 0.7, marginBottom: 4 }}>{label}</label>
                    <input
                      type={type}
                      value={editInfo[key]}
                      onChange={e => setEditInfo(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder={`${label} 입력`}
                      style={{
                        width: '100%', padding: '8px 12px', borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: 'rgba(255,255,255,0.06)', color: '#fff',
                        fontSize: 13, outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ display: 'block', fontSize: 12, opacity: 0.7, marginBottom: 4 }}>SD 마킹</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={editInfo.sdMark}
                    onChange={e => setEditInfo(prev => ({ ...prev, sdMark: sanitizeSdMarkInput(e.target.value) }))}
                    placeholder="숫자 입력 예: 1, 10, 15, 100"
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: 6,
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'rgba(255,255,255,0.06)', color: '#fff',
                      fontSize: 13, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
                {/* 지역 드롭다운 (필수) */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, opacity: 0.7, marginBottom: 4 }}>지역 <span style={{ color: '#f87171' }}>*</span></label>
                  <select
                    value={editInfo.regionId}
                    onChange={e => {
                      const rid = e.target.value;
                      // 선택된 지역의 city(시/군/구) 값 가져오기 (auto-apply)
                      const selectedReg = regions.find(r => r.id === rid);
                      const autoDistrict = String(selectedReg?.city || selectedReg?.district || '').trim();
                      setEditInfo(prev => ({ ...prev, regionId: rid, districtId: autoDistrict }));
                      setEditDistricts([]);
                      if (rid) {
                        storageAdapter.getDistricts(rid).then(list => {
                          const dList = list || [];
                          setEditDistricts(dList);
                          // districts 목록이 있고 현재 districtId가 region.city로만 설정된 경우
                          // 드롭다운 목록에서 일치하는 항목 자동 선택
                          if (dList.length > 0 && autoDistrict) {
                            const match = dList.find(d => (d.name || d.district_name) === autoDistrict);
                            if (match) {
                              setEditInfo(prev => ({ ...prev, districtId: String(match.id || match.district_id) }));
                            }
                          }
                        }).catch(() => {});
                      }
                    }}
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: 6,
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'rgba(30,30,40,0.95)', color: '#fff',
                      fontSize: 13, outline: 'none', boxSizing: 'border-box',
                    }}
                  >
                    <option value="">지역 선택...</option>
                    {regions.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                {/* 구/군 표시 (districts 목록이 있으면 드롭다운, 없으면 region.city 자동 표기) */}
                {editDistricts.length > 0 ? (
                  <div>
                    <label style={{ display: 'block', fontSize: 12, opacity: 0.7, marginBottom: 4 }}>구/군 (선택)</label>
                    <select
                      value={editInfo.districtId}
                      onChange={e => setEditInfo(prev => ({ ...prev, districtId: e.target.value }))}
                      style={{
                        width: '100%', padding: '8px 12px', borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: 'rgba(30,30,40,0.95)', color: '#fff',
                        fontSize: 13, outline: 'none', boxSizing: 'border-box',
                      }}
                    >
                      <option value="">구/군 선택 (선택사항)</option>
                      {editDistricts.map(d => (
                        <option key={d.id || d.district_id} value={d.id || d.district_id}>
                          {d.name || d.district_name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : editInfo.districtId ? (
                  /* districts 목록 없어도 region.city 값이 있으면 읽기전용 텍스트로 표기 */
                  <div>
                    <label style={{ display: 'block', fontSize: 12, opacity: 0.7, marginBottom: 4 }}>구/군</label>
                    <input
                      type="text"
                      value={editInfo.districtId}
                      onChange={e => setEditInfo(prev => ({ ...prev, districtId: e.target.value }))}
                      placeholder="시/군/구"
                      style={{
                        width: '100%', padding: '8px 12px', borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: 'rgba(255,255,255,0.06)', color: '#fff',
                        fontSize: 13, outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                  </div>
                ) : null}
                {/* 상세주소 */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, opacity: 0.7, marginBottom: 4 }}>상세주소</label>
                  <input
                    type="text"
                    value={editInfo.address}
                    onChange={e => setEditInfo(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="상세주소 입력 (아파트, 도로명 등)"
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: 6,
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'rgba(255,255,255,0.06)', color: '#fff',
                      fontSize: 13, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
                <button
                  onClick={handleSaveInfo}
                  disabled={savingInfo}
                  style={{
                    padding: '8px 16px', borderRadius: 6, border: 'none',
                    background: savingInfo ? '#4ade80aa' : '#34d399',
                    color: '#064e3b', fontSize: 13, fontWeight: 700,
                    cursor: savingInfo ? 'wait' : 'pointer', marginTop: 4,
                  }}
                >
                  {savingInfo ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>

            {/* ── 역할 관리 섹션 ── */}
            {(() => {
              // 현재 로그인 관리자 정보
              const myRole     = sessionStorage.getItem('su_admin_role') || 'ADMIN';
              const myIsWA     = sessionStorage.getItem('su_admin_is_website_admin') === 'true';
              const myLevel    = myIsWA ? (ROLE_LEVEL.WEBSITE_ADMIN ?? 5) : (ROLE_LEVEL[myRole] ?? ROLE_LEVEL[ROLES.ADMIN] ?? 3);
              const targetRole = selectedUser.role || 'USER';
              const targetIsWA = targetRole === 'WEBSITE_ADMIN';
              const targetLevel = ROLE_LEVEL[targetRole] ?? 0;
              // 변경 가능 조건: 대상 등급이 내 등급 미만 AND 부여 가능 역할도 내 등급 미만
              // WEBSITE_ADMIN은 드롭다운에 노출 안 함 (env 전용)
              const availableRoles = ROLE_OPTIONS.filter(r => (ROLE_LEVEL[r.value] ?? 0) < myLevel && r.value !== 'WEBSITE_ADMIN');
              // 내가 대상보다 등급이 높아야 변경 가능
              const canEdit = !targetIsWA && targetLevel < myLevel;
              return (
            <div style={{ marginBottom: 20, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "#a78bfa" }}>
                🎭 역할 관리
              </div>
              {/* 현재 역할 표시 + 드롭다운 */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, opacity: 0.7, flexShrink: 0 }}>현재 역할:</span>
                {(() => { const ri = getRoleInfo(targetRole); return <span style={{ fontSize: 12, fontWeight: 700, color: ri.color }}>{ri.icon} {ri.label}</span>; })()}
                {!canEdit ? (
                  <span style={{ marginLeft: "auto", fontSize: 12, color: "rgba(255,255,255,0.45)", fontStyle: "italic" }}>
                    🔒 {targetIsWA ? "웹사이트 관리자의 권한은 변경할 수 없습니다." : "권한 변경 불가"}
                  </span>
                ) : (
                  <select
                    value={availableRoles.some(r => r.value === targetRole) ? targetRole : availableRoles[0]?.value || 'USER'}
                    onChange={(e) => handleRoleChange(selectedUser.memberId || selectedUser.id, e.target.value)}
                    disabled={roleChanging}
                    style={{
                      marginLeft: "auto", padding: "6px 10px", borderRadius: 6,
                      border: "1px solid rgba(255,255,255,0.2)", background: "#2a2a35",
                      color: "#fff", fontSize: 13, cursor: "pointer",
                      opacity: roleChanging ? 0.5 : 1,
                    }}
                  >
                    {availableRoles.map((r) => (
                      <option key={r.value} value={r.value}>{r.icon} {r.label}</option>
                    ))}
                  </select>
                )}
              </div>
              {(selectedUser.role === ROLES.REGION_SUPER_MANAGER || selectedUser.role === ROLES.REGION_MANAGER) && (
                <div>
                  <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 8 }}>지역 운영 범위</div>
                  <div style={{ fontSize: 12, lineHeight: 1.7, color: selectedUser.role === ROLES.REGION_SUPER_MANAGER ? '#67e8f9' : 'rgba(255,255,255,0.72)' }}>
                    {selectedUser.role === ROLES.REGION_SUPER_MANAGER
                      ? '지역총관리자는 마이오피스 지역관리에서 모든 지역을 조회하고 전환할 수 있습니다.'
                      : `지역관리자는 가입 지역 ${selectedUser.region || getRegionName(selectedUser.regionId)}만 고정 관리합니다.`}
                  </div>
                </div>
              )}
            </div>
            ); })()}

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, opacity: 0.9 }}>
                관리자 메모
              </label>
              <textarea
                value={memoValue}
                onChange={(e) => setMemoValue(e.target.value)}
                placeholder="회원에 대한 메모를 입력하세요..."
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.06)",
                  color: "inherit",
                  fontSize: 14,
                  outline: "none",
                  resize: "vertical",
                  minHeight: 80,
                  boxSizing: "border-box",
                }}
              />
              <button
                onClick={handleSaveMemo}
                style={{
                  marginTop: 8,
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: "none",
                  background: "#a855f7",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                메모 저장
              </button>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, opacity: 0.9 }}>
                상태 변경
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      if (selectedUser.status !== opt.value) {
                        openStatusConfirm(selectedUser.id, opt.value);
                      }
                    }}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 6,
                      border: "none",
                      background: selectedUser.status === opt.value ? opt.color : "rgba(255,255,255,0.1)",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: selectedUser.status === opt.value ? "default" : "pointer",
                      opacity: selectedUser.status === opt.value ? 1 : 0.7,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Confirm */}
      <ConfirmDialog
        open={confirmOpen}
        title="회원 상태 변경"
        message={
          pendingStatusChange
            ? `회원 상태를 '${getStatusInfo(pendingStatusChange.newStatus).label}'(으)로 변경하시겠습니까?`
            : ""
        }
        confirmText="변경"
        confirmColor={pendingStatusChange ? getStatusInfo(pendingStatusChange.newStatus).color : "#a855f7"}
        onConfirm={handleStatusChange}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* Clear All Users Confirm */}
      <ConfirmDialog
        open={clearConfirmOpen}
        title="전체 회원 삭제"
        message="정말로 모든 회원을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="전체 삭제"
        confirmColor="#ef4444"
        onConfirm={handleClearAllUsers}
        onCancel={() => setClearConfirmOpen(false)}
      />

      {/* Toast */}
      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, open: false })} />
      </>
      )}
    </div>
  );
}
