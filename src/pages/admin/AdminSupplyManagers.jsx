import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMembers,
  updateUser,
  deleteUsers,
  syncAuthToUsers,
} from "../../lib/adminStore";
import * as storageAdapter from "../../lib/storageAdapter";
import { isAdminAuthenticatedLocal } from "../../lib/adminAuth";
import ConfirmDialog from "./components/ConfirmDialog";
import Toast from "./components/Toast";

export default function AdminSupplyManagers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    if (!isAdminAuthenticatedLocal()) {
      navigate("/admin/login", { replace: true });
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      // ensure auth sync
      if (typeof syncAuthToUsers === 'function') {
        syncAuthToUsers();
      }
      
      // Load from server (서버 우선 정책, 로컬 병합 제거)
      let raw = [];
      try {
        const serverMembers = await storageAdapter.getMembers();
        if (Array.isArray(serverMembers) && serverMembers.length > 0) {
          raw = serverMembers;
          console.log('[AdminSupplyManagers] Loaded from server:', raw.length);
        } else {
          raw = getMembers() || [];
        }
      } catch (e) {
        console.warn('[AdminSupplyManagers] Server load failed, using local:', e);
        raw = getMembers() || [];
      }
      
      // Normalize users to ensure stable `id` field (use memberId when id missing)
      const normalized = raw.map((u) => ({ ...u, id: u.id || u.memberId || String(u.memberId || u.id || Math.random()) }));
      setUsers(normalized);
      setSelectedIds(new Set());
    } catch (e) {
      console.error('[AdminSupplyManagers] loadData error:', e);
      setUsers([]);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users.slice().sort((a, b) => (a.name || a.nickname || "").localeCompare(b.name || b.nickname || ""));
    return users
      .filter((u) => (u.name || "").toLowerCase().includes(q) || (u.nickname || "").toLowerCase().includes(q))
      .sort((a, b) => (a.name || a.nickname || "").localeCompare(b.name || b.nickname || ""));
  }, [users, search]);

  const toggleSelect = (id) => {
    const key = String(id);
    const next = new Set(selectedIds);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelectedIds(next);
  };

  const selectAllVisible = () => {
    const next = new Set(selectedIds);
    filtered.forEach((u) => next.add(String(u.id)));
    setSelectedIds(next);
  };
  
  const clearSelection = () => setSelectedIds(new Set());

  const applyPermission = (grant) => {
    if (selectedIds.size === 0) {
      setToast({ open: true, message: "선택된 회원이 없습니다.", type: "error" });
      return;
    }
    
    // 중복 체크: 이미 권한이 있는지 확인
    const selectedUsers = users.filter(u => selectedIds.has(String(u.id)));
    const alreadyHasPermission = selectedUsers.filter(u => u.supplyManager === true);
    const alreadyNoPermission = selectedUsers.filter(u => !u.supplyManager);
    
    if (grant && alreadyHasPermission.length === selectedUsers.length) {
      setToast({ 
        open: true, 
        message: "권한이 이미 부여된 사용자입니다.", 
        type: "warning" 
      });
      return;
    }
    
    if (!grant && alreadyNoPermission.length === selectedUsers.length) {
      setToast({ 
        open: true, 
        message: "권한이 이미 해제된 사용자입니다.", 
        type: "warning" 
      });
      return;
    }
    
    setConfirmAction({ grant });
    setConfirmOpen(true);
  };

  const applyDelete = () => {
    if (selectedIds.size === 0) {
      setToast({ open: true, message: "선택된 회원이 없습니다.", type: "error" });
      return;
    }
    setConfirmAction({ delete: true });
    setConfirmOpen(true);
  };

  const doApplyPermission = async () => {
    const ids = Array.from(selectedIds);
    let changed = 0;
    
    // Process each user update sequentially to ensure proper server sync
    for (const id of ids) {
      try {
        const res = await updateUser(id, { supplyManager: !!confirmAction.grant });
        if (res && res.success) changed++;
      } catch (e) {
        console.error('Failed to update user:', e);
      }
    }
    
    await loadData();
    setConfirmOpen(false);
    setConfirmAction(null);
    setToast({ 
      open: true, 
      message: `선택 회원 ${changed}명의 권한이 ${confirmAction.grant ? "부여" : "해제"}되었습니다.`, 
      type: "success" 
    });
  };

  const doDelete = () => {
    const ids = Array.from(selectedIds);
    try {
      const res = deleteUsers(ids);
      loadData();
      setConfirmOpen(false);
      setConfirmAction(null);
      if (res && res.success) {
        setToast({ open: true, message: `선택한 ${res.deleted}명의 회원을 삭제했습니다.`, type: "success" });
      } else {
        setToast({ open: true, message: `삭제에 실패했습니다.`, type: "error" });
      }
    } catch (e) {
      setToast({ open: true, message: `삭제 중 오류가 발생했습니다.`, type: "error" });
      setConfirmOpen(false);
      setConfirmAction(null);
    }
  };

  const handleConfirm = () => {
    if (confirmAction && confirmAction.delete) {
      doDelete();
      return;
    }
    doApplyPermission();
  };

  const countSupplyManagers = useMemo(() => users.filter((u) => !!u.supplyManager).length, [users]);

  const pageStyle = { 
    minHeight: "100vh", 
    background: "#0f0f14", 
    padding: "20px 16px 100px",
    color: "#fff"
  };
  
  const headerStyle = { 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "space-between", 
    marginBottom: 20, 
    flexWrap: "wrap", 
    gap: 12 
  };
  
  const titleStyle = { fontSize: 20, fontWeight: 800 };
  
  const inputStyle = { 
    flex: 1, 
    padding: "10px 14px", 
    borderRadius: 8, 
    border: "1px solid rgba(255,255,255,0.15)", 
    background: "rgba(255,255,255,0.06)", 
    color: "inherit", 
    fontSize: 14, 
    outline: "none" 
  };
  
  const cardStyle = { 
    background: "#18181b", 
    borderRadius: 12, 
    border: "1px solid rgba(255,255,255,0.08)", 
    padding: 16 
  };
  
  const listStyle = { marginTop: 12, display: "grid", gap: 8 };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div style={titleStyle}>📦 보급지원 담당자 관리</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button 
            onClick={() => navigate('/admin')} 
            style={{ 
              padding: "8px 12px", 
              borderRadius: 8, 
              border: "none", 
              background: "rgba(255,255,255,0.1)", 
              color: "#fff", 
              cursor: "pointer" 
            }}
          >
            ← 관리자
          </button>
          <button 
            onClick={loadData} 
            style={{ 
              padding: "8px 12px", 
              borderRadius: 8, 
              border: "none", 
              background: "rgba(139,92,246,0.15)", 
              color: "#a855f7", 
              cursor: "pointer" 
            }}
          >
            🔄 새로고침
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
        <div style={{ fontSize: 14, opacity: 0.85 }}>
          등록된 담당자 수: <strong style={{ color: "#22c55e", marginLeft: 6 }}>{countSupplyManagers}</strong>
        </div>
        <div style={{ flex: 1 }} />
        <button 
          onClick={selectAllVisible} 
          style={{ 
            padding: "8px 12px", 
            borderRadius: 8, 
            border: "1px solid rgba(255,255,255,0.08)", 
            background: "transparent", 
            color: "#fff",
            cursor: "pointer"
          }}
        >
          모두 선택
        </button>
        <button 
          onClick={clearSelection} 
          style={{ 
            padding: "8px 12px", 
            borderRadius: 8, 
            border: "1px solid rgba(255,255,255,0.08)", 
            background: "transparent", 
            color: "#fff",
            cursor: "pointer"
          }}
        >
          선택 해제
        </button>
      </div>

      <div style={cardStyle}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="이름 또는 닉네임으로 검색" 
            style={inputStyle} 
          />
          <button 
            onClick={() => applyPermission(true)} 
            style={{ 
              padding: "8px 12px", 
              borderRadius: 8, 
              border: "none", 
              background: "#22c55e", 
              color: "#fff", 
              cursor: "pointer",
              whiteSpace: 'nowrap'
            }}
          >
            권한 부여
          </button>
          <button 
            onClick={() => applyPermission(false)} 
            style={{ 
              padding: "8px 12px", 
              borderRadius: 8, 
              border: "none", 
              background: "#ef4444", 
              color: "#fff", 
              cursor: "pointer",
              whiteSpace: 'nowrap'
            }}
          >
            권한 해지
          </button>
          <button 
            onClick={applyDelete} 
            style={{ 
              padding: "8px 12px", 
              borderRadius: 8, 
              border: "none", 
              background: "#6b7280", 
              color: "#fff", 
              cursor: "pointer",
              whiteSpace: 'nowrap'
            }}
          >
            삭제
          </button>
        </div>

        <div style={listStyle}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 20, opacity: 0.6 }}>
              검색 결과가 없습니다.
            </div>
          ) : (
            filtered.map((u) => (
              <div 
                key={String(u.id)} 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 12, 
                  padding: 10, 
                  borderRadius: 8, 
                  background: "#0f0f14", 
                  border: "1px solid rgba(255,255,255,0.03)" 
                }}
              >
                <input 
                  type="checkbox" 
                  checked={selectedIds.has(String(u.id))} 
                  onChange={() => toggleSelect(u.id)} 
                  style={{ cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>
                    {u.name || u.nickname || "이름 없음"} 
                    <span style={{ fontSize: 12, opacity: 0.6, marginLeft: 8 }}>
                      {u.email || ""}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.6 }}>
                    {u.phone || "-"} • {u.region || "미지정"}
                  </div>
                </div>
                <div style={{ marginLeft: 8 }}>
                  {u.supplyManager ? (
                    <span style={{ color: "#22c55e", fontWeight: 700 }}>보급지원담당자</span>
                  ) : (
                    <span style={{ color: "#ccc" }}>미지정</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={
          confirmAction 
            ? (confirmAction.grant ? "권한 부여 확인" : (confirmAction.delete ? "삭제 확인" : "권한 해지 확인")) 
            : "확인"
        }
        message={
          confirmAction 
            ? (confirmAction.delete 
                ? `선택된 ${selectedIds.size}명의 회원을 삭제하시겠습니까?` 
                : `선택된 ${selectedIds.size}명의 권한을 ${confirmAction.grant ? "부여" : "해지"}하시겠습니까?`
              ) 
            : ""
        }
        confirmText={
          confirmAction 
            ? (confirmAction.delete ? "삭제" : (confirmAction.grant ? "부여" : "해지")) 
            : "확인"
        }
        confirmColor={
          confirmAction 
            ? (confirmAction.delete ? "#6b7280" : (confirmAction.grant ? "#22c55e" : "#ef4444")) 
            : "#a855f7"
        }
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />

      <Toast 
        open={toast.open} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ ...toast, open: false })} 
      />
    </div>
  );
}
