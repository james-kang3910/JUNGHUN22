import React, { useEffect, useState, useCallback } from 'react';
import { isAdminAuthenticatedLocal } from '../../lib/adminAuth';
import { useNavigate } from 'react-router-dom';
import Toast from './components/Toast';

const STATUS_LABEL = {
  pending: '대기',
  approved: '승인',
  completed: '완료',
  rejected: '거절',
  available: '가용',
  reserved: '예약',
  scheduled: '신청예정',
};

function StatusBadge({ status }) {
  const colors = {
    pending: '#f59e0b',
    approved: '#22c55e',
    completed: '#3b82f6',
    rejected: '#ef4444',
    available: '#22c55e',
    reserved: '#a855f7',
    scheduled: '#d97706',
  };
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 99,
      background: colors[status] || '#6b7280', color: '#fff', fontSize: 12, fontWeight: 600
    }}>
      {STATUS_LABEL[status] || status}
    </span>
  );
}

function getToken() {
  return window.__SU_SESSION__?.token || '';
}

export default function AdminSupplyTools() {
  const [tab, setTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });
  const navigate = useNavigate();

  const showToast = useCallback((message, type = 'success') => {
    setToast({ open: true, message, type });
  }, []);

  const loadRequests = useCallback(async () => {
    try {
      const res = await fetch('/api/supply-requests', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (e) {
      showToast('신청 목록 로드 실패', 'error');
    }
  }, [showToast]);

  const loadItems = useCallback(async () => {
    try {
      const res = await fetch('/api/supplies');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : (data.supplies || []));
    } catch (e) {
      showToast('물품 목록 로드 실패', 'error');
    }
  }, [showToast]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadRequests(), loadItems()]);
    setLoading(false);
  }, [loadRequests, loadItems]);

  useEffect(() => {
    if (!isAdminAuthenticatedLocal()) {
      navigate('/admin/login', { replace: true });
      return;
    }
    loadAll();
  }, [navigate, loadAll]);

  // --- 신청 관리 ---
  const changeRequestStatus = async (requestId, status) => {
    try {
      const res = await fetch(`/api/supply-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('상태 변경 실패');
      await loadRequests();
      showToast('상태가 변경되었습니다.');
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const deleteRequest = async (requestId) => {
    if (!window.confirm('신청 내역을 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/supply-requests/${requestId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error('삭제 실패');
      await loadRequests();
      showToast('삭제되었습니다.');
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  // --- 물품 관리 ---
  const startEditItem = (item) => {
    setEditingItem(item.id);
    setEditForm({
      title: item.title || '',
      description: item.description || '',
      quantity: item.quantity ?? 0,
      status: item.status || 'available'
    });
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditForm({});
  };

  const saveItem = async (itemId) => {
    try {
      const res = await fetch(`/api/supplies/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (!res.ok) throw new Error('저장 실패');
      setEditingItem(null);
      setEditForm({});
      await loadItems();
      showToast('물품 정보가 저장되었습니다.');
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm('물품을 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/supplies/${itemId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('삭제 실패');
      await loadItems();
      showToast('물품이 삭제되었습니다.');
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const setItemStatus = async (item, next) => {
    if (item.status === next) return;
    const LABELS = { available: '활성화', scheduled: '신청예정' };
    try {
      const res = await fetch(`/api/supplies/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next })
      });
      if (!res.ok) throw new Error('변경 실패');
      await loadItems();
      showToast(`${LABELS[next] || next} 상태로 변경되었습니다.`);
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  const cellStyle = { padding: '8px 10px', borderBottom: '1px solid #374151', fontSize: 13, verticalAlign: 'middle' };
  const thStyle = { ...cellStyle, background: '#1f2937', color: '#9ca3af', fontWeight: 600, fontSize: 12 };
  const inputStyle = { background: '#374151', border: '1px solid #4b5563', color: '#fff', borderRadius: 4, padding: '4px 8px', fontSize: 12, width: '100%' };
  const btnBase = { padding: '4px 10px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 0' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={() => navigate('/admin')} style={{ ...btnBase, background: '#374151', color: '#fff' }}>
          ← 관리자
        </button>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f9fafb', margin: 0 }}>보급지원 도구</h2>
        {pendingCount > 0 && (
          <span style={{ background: '#ef4444', color: '#fff', borderRadius: 99, padding: '2px 8px', fontSize: 12, fontWeight: 700 }}>
            대기 {pendingCount}건
          </span>
        )}
        <button
          onClick={loadAll}
          disabled={loading}
          style={{ ...btnBase, background: '#7c3aed', color: '#fff', marginLeft: 'auto', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? '로딩...' : '새로고침'}
        </button>
      </div>

      {/* 탭 */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '2px solid #374151' }}>
        {[['requests', `신청 관리 (${requests.length})`], ['items', `물품 관리 (${items.length})`]].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding: '8px 20px', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
              background: tab === key ? '#7c3aed' : 'transparent',
              color: tab === key ? '#fff' : '#9ca3af',
              borderBottom: tab === key ? '2px solid #7c3aed' : '2px solid transparent',
              borderRadius: '4px 4px 0 0'
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 신청 관리 탭 */}
      {tab === 'requests' && (
        <div style={{ overflowX: 'auto' }}>
          {requests.length === 0 ? (
            <div style={{ color: '#6b7280', padding: 32, textAlign: 'center' }}>신청 내역이 없습니다.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#111827', borderRadius: 8, overflow: 'hidden' }}>
              <thead>
                <tr>
                  {['물품명', '신청자', '메시지', '신청일', '상태'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map(r => {
                  const id = r.request_id || r.requestId || r.id;
                  const supplyTitle = r.itemName || r.item_name || '-';
                  const managerName = r.managerName || '-';
                  const requester = r.requesterName || r.requester_name || r.requesterId || r.requester_id || '-';
                  const isPending = (r.status || '').toUpperCase() === 'PENDING';
                  return (
                    <tr key={id} style={{ background: '#1f2937' }}>
                      <td style={{ ...cellStyle }}>
                        <div style={{ fontWeight: 700, color: '#f9fafb' }}>{supplyTitle}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>담당: {managerName}</div>
                      </td>
                      <td style={cellStyle}>{requester}</td>
                      <td style={{ ...cellStyle, maxWidth: 200, color: r.message ? '#e5e7eb' : '#6b7280', fontStyle: r.message ? 'normal' : 'italic' }}>
                        {r.message || '없음'}
                      </td>
                      <td style={{ ...cellStyle, whiteSpace: 'nowrap' }}>
                        {r.created_at ? new Date(r.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '-'}
                      </td>
                      <td style={cellStyle}>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700,
                          background: isPending ? '#fef3c7' : '#dcfce7',
                          color: isPending ? '#92400e' : '#166534'
                        }}>
                          {isPending ? '대기' : '완료'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* 물품 관리 탭 */}
      {tab === 'items' && (
        <div style={{ overflowX: 'auto' }}>
          {items.length === 0 ? (
            <div style={{ color: '#6b7280', padding: 32, textAlign: 'center' }}>물품 데이터가 없습니다.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#111827', borderRadius: 8, overflow: 'hidden' }}>
              <thead>
                <tr>
                  {['물품명', '설명', '수량', '상태', '담당자ID', '관리'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(item => {
                  const id = item.id;
                  const isEditing = editingItem === id;
                  return (
                    <tr key={id} style={{ background: '#1f2937' }}>
                      <td style={cellStyle}>
                        {isEditing
                          ? <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} />
                          : (item.title || '-')}
                      </td>
                      <td style={cellStyle}>
                        {isEditing
                          ? <input value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} style={inputStyle} />
                          : (item.description || '-')}
                      </td>
                      <td style={{ ...cellStyle, textAlign: 'center' }}>
                        {isEditing
                          ? <input type="number" min={0} value={editForm.quantity} onChange={e => setEditForm(f => ({ ...f, quantity: Number(e.target.value) }))} style={{ ...inputStyle, width: 60 }} />
                          : (item.quantity ?? '-')}
                      </td>
                      <td style={cellStyle}>
                        {isEditing
                          ? <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} style={{ ...inputStyle, width: 80 }}>
                              {['available', 'scheduled', 'reserved', 'completed'].map(s => <option key={s} value={s}>{STATUS_LABEL[s] || s}</option>)}
                            </select>
                          : <StatusBadge status={item.status} />}
                      </td>
                      <td style={cellStyle}>
                        {item.createdBy || item.created_by || '-'}
                      </td>
                      <td style={{ ...cellStyle, whiteSpace: 'nowrap' }}>
                        {isEditing ? (
                          <span style={{ display: 'flex', gap: 4 }}>
                            <button onClick={() => saveItem(id)} style={{ ...btnBase, background: '#22c55e', color: '#fff' }}>저장</button>
                            <button onClick={cancelEdit} style={{ ...btnBase, background: '#6b7280', color: '#fff' }}>취소</button>
                          </span>
                        ) : (
                          <span style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            <button
                              onClick={() => setItemStatus(item, 'available')}
                              disabled={item.status === 'available'}
                              style={{ ...btnBase, background: item.status === 'available' ? '#16a34a' : 'transparent', color: item.status === 'available' ? '#fff' : '#16a34a', border: '1px solid #16a34a', opacity: item.status === 'available' ? 1 : 0.75 }}
                              title="신청 가능 상태로 설정"
                            >
                              활성화
                            </button>
                            <button
                              onClick={() => setItemStatus(item, 'scheduled')}
                              disabled={item.status === 'scheduled'}
                              style={{ ...btnBase, background: item.status === 'scheduled' ? '#d97706' : 'transparent', color: item.status === 'scheduled' ? '#fff' : '#d97706', border: '1px solid #d97706', opacity: item.status === 'scheduled' ? 1 : 0.75 }}
                              title="신청예정 상태로 설정"
                            >
                              신청예정
                            </button>
                            <button onClick={() => startEditItem(item)} style={{ ...btnBase, background: '#3b82f6', color: '#fff' }}>수정</button>
                            <button onClick={() => deleteItem(id)} style={{ ...btnBase, background: '#ef4444', color: '#fff' }}>삭제</button>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {toast.open && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(t => ({ ...t, open: false }))}
        />
      )}
    </div>
  );
}
