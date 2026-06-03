import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as storageAdapter from '../../lib/storageAdapter';

console.log('[PAGE]', 'AdminDistribution.jsx (active)');

function parseUploadMeta(raw) {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/** Distribution.jsx와 동일 기준 — 유통 마켓 상품만 */
function isDistributionProduct(raw) {
  if (!raw || typeof raw !== 'object') return false;
  const status = String(raw.status || '').toLowerCase();
  if (status === 'deleted') return false;
  const type = String(raw.type || raw.category || '').toLowerCase();
  if (type === 'request') return false;
  const meta = parseUploadMeta(raw.uploadMeta || raw.upload_meta);
  if (raw.price != null && Number(raw.price) >= 0) return true;
  if (meta?.sellerIntro || meta?.productType || meta?.receiveMethod || meta?.sellerId) return true;
  return false;
}

function isDistributionOrder(raw) {
  const type = String(raw?.requestType || raw?.request_type || 'supply').toLowerCase();
  return type === 'distribution';
}

const EMPTY_CREATE_FORM = {
  title: '',
  description: '',
  price: '',
  quantity: '',
  type: 'food',
  status: 'available',
};

// ★ 스타일
const S = {
  page: { maxWidth: 1200, margin: '0 auto', padding: '20px', overflowX: 'hidden' },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.5)' },
  
  tabs: {
    display: 'flex',
    gap: 8,
    marginBottom: 24,
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    paddingBottom: 12,
  },
  tab: {
    padding: '8px 16px',
    borderRadius: 8,
    border: 'none',
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.6)',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    transition: 'all 0.2s',
  },
  tabActive: {
    background: '#a855f7',
    color: '#fff',
  },
  
  card: {
    background: '#18181b',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    border: '1px solid rgba(255,255,255,0.05)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#fff',
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  
  // 테이블
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left',
    padding: '12px 10px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: 600,
  },
  td: {
    padding: '12px 10px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    color: '#fff',
    fontSize: 13,
  },
  
  // 상태 배지
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 600,
  },
  badgeAvailable: { background: 'rgba(34,197,94,0.2)', color: '#22c55e' },
  badgeOrdered: { background: 'rgba(59,130,246,0.2)', color: '#3b82f6' },
  badgeConfirmed: { background: 'rgba(168,85,247,0.2)', color: '#a855f7' },
  badgeDelivery: { background: 'rgba(249,115,22,0.2)', color: '#f97316' },
  badgeCompleted: { background: 'rgba(34,197,94,0.2)', color: '#22c55e' },
  badgeCancelled: { background: 'rgba(239,68,68,0.2)', color: '#ef4444' },
  
  // 버튼
  btnGroup: {
    display: 'flex',
    gap: 6,
  },
  btn: {
    padding: '6px 12px',
    borderRadius: 6,
    border: 'none',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  btnApprove: {
    background: '#22c55e',
    color: '#000',
  },
  btnReject: {
    background: '#ef4444',
    color: '#fff',
  },
  btnEdit: {
    background: '#3b82f6',
    color: '#fff',
  },
  btnDelete: {
    background: '#6b7280',
    color: '#fff',
  },
  
  // 통계
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    background: 'rgba(168,85,247,0.1)',
    border: '1px solid rgba(168,85,247,0.3)',
    borderRadius: 12,
    padding: 16,
    textAlign: 'center',
  },
  statValue: { fontSize: 28, fontWeight: 700, color: '#a855f7' },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 6 },
  
  // 필터
  filterBar: {
    display: 'flex',
    gap: 12,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  filterInput: {
    padding: '8px 12px',
    borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(0,0,0,0.3)',
    color: '#fff',
    fontSize: 12,
  },
  filterSelect: {
    padding: '8px 12px',
    borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(0,0,0,0.3)',
    color: '#fff',
    fontSize: 12,
    cursor: 'pointer',
  },
  
  empty: {
    padding: '40px 20px',
    textAlign: 'center',
    color: 'rgba(255,255,255,0.4)',
  },
};

export default function AdminDistribution() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('products');
  const [supplies, setSupplies] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(false);

  // 상품 수정/등록 모달
  const [editTarget, setEditTarget] = useState(null); // null | supply object
  const [editForm, setEditForm] = useState({});
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [saving, setSaving] = useState(false);

  // 필터 상태
  const [productSearch, setProductSearch] = useState('');
  const [productStatus, setProductStatus] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('all');

  // 데이터 로드
  const loadData = async () => {
    try {
      setLoading(true);
      const [suppliesData, requestsData, payoutsData] = await Promise.all([
        storageAdapter.fetchSupplies().catch(() => []),
        storageAdapter.getSupplyRequests({ requestType: 'distribution' }).catch(() => []),
        storageAdapter.getAdminDistPayouts().catch(() => []),
      ]);

      const allSupplies = Array.isArray(suppliesData) ? suppliesData : [];
      const distProducts = allSupplies.filter(isDistributionProduct);
      const distOrders = (Array.isArray(requestsData) ? requestsData : []).filter(isDistributionOrder);

      setSupplies(distProducts);
      setOrders(distOrders);
      setPayouts(Array.isArray(payoutsData) ? payoutsData : []);

      console.log('[AdminDistribution] ✅ Data loaded:', {
        supplies: distProducts.length,
        orders: distOrders.length,
        payouts: Array.isArray(payoutsData) ? payoutsData.length : 0,
      });
    } catch (err) {
      console.error('[AdminDistribution] Load failed:', err);
      window.alert('데이터 로드 실패: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 필터링된 주문
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSearch = !orderSearch.trim() ||
        (o.requesterName?.toLowerCase().includes(orderSearch.toLowerCase())) ||
        (o.id?.toString().includes(orderSearch)) ||
        (o.supplyItemId?.toLowerCase().includes(orderSearch.toLowerCase()));
      const matchStatus = orderStatus === 'all' || o.orderStatus === orderStatus;
      return matchSearch && matchStatus;
    });
  }, [orders, orderSearch, orderStatus]);

  // 필터링된 상품
  const filteredSupplies = useMemo(() => {
    return supplies.filter(s => {
      const matchSearch = !productSearch.trim() ||
        (s.title?.toLowerCase().includes(productSearch.toLowerCase())) ||
        (s.description?.toLowerCase().includes(productSearch.toLowerCase()));
      const matchStatus = productStatus === 'all' || s.status === productStatus;
      return matchSearch && matchStatus;
    });
  }, [supplies, productSearch, productStatus]);

  // 상품 수정 열기
  const openEdit = (supply) => {
    setEditTarget(supply);
    setEditForm({
      title: supply.title || '',
      description: supply.description || '',
      quantity: supply.quantity ?? '',
      price: supply.price ?? '',
      status: supply.status || 'available',
    });
  };

  // 상품 수정 저장
  const handleSaveEdit = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      await storageAdapter.updateSupply(editTarget.id || editTarget.supplyId, {
        title: editForm.title,
        description: editForm.description,
        quantity: editForm.quantity !== '' ? Number(editForm.quantity) : undefined,
        price: editForm.price !== '' ? Number(editForm.price) : undefined,
        status: editForm.status,
      });
      setEditTarget(null);
      await loadData();
    } catch (err) {
      window.alert('수정 실패: ' + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  const pendingOrderCount = useMemo(
    () => orders.filter((o) => ['ORDERED', 'ADMIN_CONFIRMED', 'IN_DELIVERY'].includes(String(o.orderStatus || '').toUpperCase())).length,
    [orders]
  );

  const openCreate = () => {
    setCreateForm(EMPTY_CREATE_FORM);
    setCreateOpen(true);
  };

  const handleCreateProduct = async () => {
    const title = String(createForm.title || '').trim();
    if (!title) {
      window.alert('상품명을 입력해 주세요.');
      return;
    }
    setSaving(true);
    try {
      await storageAdapter.createSupply({
        title,
        description: String(createForm.description || '').trim(),
        type: String(createForm.type || 'food').trim(),
        status: String(createForm.status || 'available').trim(),
        price: createForm.price !== '' ? Number(createForm.price) : 0,
        quantity: createForm.quantity !== '' ? Number(createForm.quantity) : 0,
        uploadMeta: {
          productType: 'general',
          receiveMethod: 'delivery',
          visibility: 'public',
          adminCreated: true,
        },
      });
      setCreateOpen(false);
      setCreateForm(EMPTY_CREATE_FORM);
      await loadData();
      window.alert('유통 상품이 등록되었습니다.');
    } catch (err) {
      window.alert('등록 실패: ' + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  const handlePayoutAction = async (payoutId, status) => {
    const label = status === 'APPROVED' ? '승인' : status === 'PAID' ? '지급완료' : '거절';
    if (!window.confirm(`출금 요청을 ${label} 처리하시겠습니까?`)) return;
    let rejectReason = null;
    if (status === 'REJECTED') {
      rejectReason = window.prompt('거절 사유를 입력해 주세요.') || '';
    }
    try {
      await storageAdapter.updateAdminDistPayout(payoutId, { status, rejectReason });
      await loadData();
      window.dispatchEvent(new CustomEvent('su:ssot:changed', { detail: { type: 'dist-payouts', operation: status } }));
      window.alert(`${label} 처리되었습니다.`);
    } catch (err) {
      window.alert('처리 실패: ' + (err.message || err));
    }
  };

  // 상품 삭제
  const handleDeleteSupply = async (supply) => {
    if (!window.confirm(`"${supply.title}" 상품을 삭제하시겠습니까?\n삭제된 상품은 복구할 수 없습니다.`)) return;
    try {
      await storageAdapter.deleteSupply(supply.id || supply.supplyId);
      await loadData();
    } catch (err) {
      window.alert('삭제 실패: ' + (err.message || err));
    }
  };

  // 배지 스타일
  const getBadgeStyle = (status) => {
    if (status === 'available' || status === 'COMPLETED') return S.badgeCompleted;
    if (status === 'ORDERED') return S.badgeOrdered;
    if (status === 'ADMIN_CONFIRMED') return S.badgeConfirmed;
    if (status === 'IN_DELIVERY') return S.badgeDelivery;
    if (status === 'CANCELLED') return S.badgeCancelled;
    return S.badgeAvailable;
  };

  const getStatusLabel = (status) => {
    const map = {
      ORDERED: '주문완료',
      ADMIN_CONFIRMED: '관리자확인',
      IN_DELIVERY: '배송중',
      PICKUP_READY: '픽업준비',
      DELIVERED: '배송완료',
      COMPLETED: '종결',
      CANCELLED: '취소',
    };
    return map[status] || status;
  };

  // 주문 승인
  const handleApproveOrder = async (orderId) => {
    if (!window.confirm('이 주문을 승인하시겠습니까?')) return;
    try {
      await storageAdapter.updateSupplyRequest(orderId, { orderStatus: 'ADMIN_CONFIRMED' });
      window.alert('주문이 승인되었습니다.');
      await loadData();
    } catch (err) {
      window.alert('승인 실패: ' + (err.message || err));
    }
  };

  // 주문 배송
  const handleShipping = async (orderId) => {
    if (!window.confirm('배송을 시작하시겠습니까?')) return;
    try {
      await storageAdapter.updateSupplyRequest(orderId, { orderStatus: 'IN_DELIVERY' });
      window.alert('배송 상태로 변경되었습니다.');
      await loadData();
    } catch (err) {
      window.alert('변경 실패: ' + (err.message || err));
    }
  };

  // 주문 완료
  const handleCompleteOrder = async (orderId) => {
    if (!window.confirm('이 주문을 완료 처리하시겠습니까?')) return;
    try {
      await storageAdapter.updateSupplyRequest(orderId, { orderStatus: 'COMPLETED' });
      window.alert('주문이 완료되었습니다.');
      await loadData();
    } catch (err) {
      window.alert('완료 처리 실패: ' + (err.message || err));
    }
  };

  // 주문 취소
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('이 주문을 취소하시겠습니까?')) return;
    try {
      await storageAdapter.updateSupplyRequest(orderId, { orderStatus: 'CANCELLED' });
      window.alert('주문이 취소되었습니다.');
      await loadData();
    } catch (err) {
      window.alert('취소 실패: ' + (err.message || err));
    }
  };

  return (
    <div style={S.page}>
      {/* 수정 모달 */}
      {editTarget && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20,
        }}>
          <div style={{
            background: '#18181b', borderRadius: 16, padding: 28,
            width: '100%', maxWidth: 480,
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
              ✏️ 상품 수정
            </h3>
            {[
              { label: '상품명', key: 'title', type: 'text' },
              { label: '설명', key: 'description', type: 'text' },
              { label: '수량', key: 'quantity', type: 'number' },
              { label: '가격 (P)', key: 'price', type: 'number' },
            ].map(({ label, key, type }) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 6 }}>
                  {label}
                </label>
                <input
                  type={type}
                  value={editForm[key]}
                  onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 6 }}>
                상태
              </label>
              <select
                value={editForm.status}
                onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                style={{ ...S.filterSelect, width: '100%' }}
              >
                <option value="available">판매중</option>
                <option value="reserved">예약중</option>
                <option value="completed">완료</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                style={{ ...S.btn, ...S.btnDelete, padding: '10px 20px' }}
                onClick={() => setEditTarget(null)}
                disabled={saving}
              >
                취소
              </button>
              <button
                style={{ ...S.btn, ...S.btnEdit, padding: '10px 20px' }}
                onClick={handleSaveEdit}
                disabled={saving}
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <div style={S.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 style={S.title}>📦 유통지원 관리</h1>
            <p style={S.subtitle}>유통 마켓 상품·주문·출금을 관리합니다.</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              style={{ ...S.btn, ...S.btnEdit, padding: '10px 16px' }}
              onClick={() => navigate('/admin')}
            >
              ← 관리자 홈
            </button>
            <button
              style={{ ...S.btn, background: '#0ea5e9', color: '#fff', padding: '10px 16px' }}
              onClick={() => window.open('/distribution', '_blank')}
            >
              유통지원 화면 보기
            </button>
          </div>
        </div>
      </div>

      {/* 통계 */}
      <div style={S.statsGrid}>
        <div style={S.statCard}>
          <div style={S.statValue}>{supplies.length}</div>
          <div style={S.statLabel}>등록 상품</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statValue}>{orders.length}</div>
          <div style={S.statLabel}>전체 주문</div>
        </div>
        <div style={S.statCard}>
          <div style={{ ...S.statValue, color: '#f97316' }}>{pendingOrderCount}</div>
          <div style={S.statLabel}>처리 대기</div>
        </div>
        <div style={S.statCard}>
          <div style={{ ...S.statValue, color: '#22c55e' }}>{payouts.filter((p) => String(p.status || '').toUpperCase() === 'PENDING').length}</div>
          <div style={S.statLabel}>출금 대기</div>
        </div>
      </div>

      {/* 탭 */}
      <div style={S.tabs}>
        <button
          style={{ ...S.tab, ...(tab === 'products' ? S.tabActive : {}) }}
          onClick={() => setTab('products')}
        >
          📦 상품 관리 ({supplies.length})
        </button>
        <button
          style={{ ...S.tab, ...(tab === 'orders' ? S.tabActive : {}) }}
          onClick={() => setTab('orders')}
        >
          🛒 주문 관리 ({orders.length})
        </button>
        <button
          style={{ ...S.tab, ...(tab === 'payouts' ? S.tabActive : {}) }}
          onClick={() => setTab('payouts')}
        >
          💰 출금 관리 ({payouts.length})
        </button>
      </div>

      {/* 상품 관리 탭 */}
      {tab === 'products' && (
        <div>
          <div style={{ ...S.filterBar, justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="상품명, 설명으로 검색..."
              value={productSearch}
              onChange={e => setProductSearch(e.target.value)}
              style={S.filterInput}
            />
            <select
              value={productStatus}
              onChange={e => setProductStatus(e.target.value)}
              style={S.filterSelect}
            >
              <option value="all">모든 상태</option>
              <option value="available">판매중</option>
              <option value="reserved">예약중</option>
              <option value="completed">완료</option>
              <option value="hidden">숨김</option>
            </select>
            </div>
            <button
              style={{ ...S.btn, background: '#22c55e', color: '#000', padding: '10px 16px' }}
              onClick={openCreate}
            >
              + 상품 등록
            </button>
          </div>

          <div style={S.card}>
            <div style={S.cardTitle}>📦 상품 목록 ({filteredSupplies.length}개)</div>
            {loading ? (
              <div style={S.empty}>로딩 중...</div>
            ) : filteredSupplies.length === 0 ? (
              <div style={S.empty}>등록된 상품이 없습니다.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={S.th}>상품명</th>
                      <th style={S.th}>설명</th>
                      <th style={S.th}>수량</th>
                      <th style={S.th}>가격</th>
                      <th style={S.th}>상태</th>
                      <th style={S.th}>등록일</th>
                      <th style={S.th}>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSupplies.map(supply => {
                      const sid = supply.id || supply.supplyId;
                      const statusLabel = { available: '판매중', reserved: '예약중', completed: '완료' }[supply.status] || supply.status;
                      const badgeStyle = supply.status === 'available' ? S.badgeAvailable
                        : supply.status === 'reserved' ? S.badgeOrdered
                        : S.badgeCompleted;
                      return (
                        <tr key={sid}>
                          <td style={S.td}>
                            <div style={{ fontWeight: 600 }}>{supply.title || '-'}</div>
                            {supply.imageUrl && (
                              <img src={supply.imageUrl} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, marginTop: 4 }} />
                            )}
                          </td>
                          <td style={{ ...S.td, maxWidth: 200, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {supply.description || '-'}
                          </td>
                          <td style={S.td}>{supply.quantity ?? '-'}</td>
                          <td style={S.td}>{supply.price != null ? Number(supply.price).toLocaleString() + 'P' : '-'}</td>
                          <td style={S.td}>
                            <span style={{ ...S.badge, ...badgeStyle }}>{statusLabel}</span>
                          </td>
                          <td style={S.td}>
                            {supply.createdAt ? new Date(supply.createdAt).toLocaleDateString('ko-KR') : '-'}
                          </td>
                          <td style={S.td}>
                            <div style={S.btnGroup}>
                              <button
                                style={{ ...S.btn, ...S.btnEdit }}
                                onClick={() => openEdit(supply)}
                              >
                                수정
                              </button>
                              <button
                                style={{ ...S.btn, ...S.btnReject }}
                                onClick={() => handleDeleteSupply(supply)}
                              >
                                삭제
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 주문 관리 탭 */}
      {tab === 'orders' && (
        <div>
          <div style={S.filterBar}>
            <input
              type="text"
              placeholder="주문번호, 구매자, 상품으로 검색..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              style={S.filterInput}
            />
            <select
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              style={S.filterSelect}
            >
              <option value="all">모든 상태</option>
              <option value="ORDERED">주문완료</option>
              <option value="ADMIN_CONFIRMED">관리자확인</option>
              <option value="IN_DELIVERY">배송중</option>
              <option value="COMPLETED">종결</option>
              <option value="CANCELLED">취소</option>
            </select>
          </div>

          <div style={S.card}>
            <div style={S.cardTitle}>🛒 주문 목록 ({filteredOrders.length}개)</div>
            {filteredOrders.length === 0 ? (
              <div style={S.empty}>주문이 없습니다.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={S.th}>주문번호</th>
                      <th style={S.th}>구매자</th>
                      <th style={S.th}>상품</th>
                      <th style={S.th}>수량</th>
                      <th style={S.th}>금액</th>
                      <th style={S.th}>상태</th>
                      <th style={S.th}>날짜</th>
                      <th style={S.th}>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr key={order.id}>
                        <td style={S.td}>#{order.id}</td>
                        <td style={S.td}>
                          <div>{order.requesterName || '-'}</div>
                          <div style={{ fontSize: 10, opacity: 0.6 }}>{order.requesterContact || '-'}</div>
                        </td>
                        <td style={S.td}>{order.itemName || order.supplyItemId || '-'}</td>
                        <td style={S.td}>{order.quantity || 1}</td>
                        <td style={S.td}>{Number(order.paymentAmount || 0).toLocaleString()}P</td>
                        <td style={S.td}>
                          <span style={{ ...S.badge, ...getBadgeStyle(order.orderStatus) }}>
                            {getStatusLabel(order.orderStatus)}
                          </span>
                        </td>
                        <td style={S.td}>
                          {new Date(order.createdAt).toLocaleDateString('ko-KR')}
                        </td>
                        <td style={S.td}>
                          <div style={S.btnGroup}>
                            {order.orderStatus === 'ORDERED' && (
                              <button
                                style={{ ...S.btn, ...S.btnApprove }}
                                onClick={() => handleApproveOrder(order.id)}
                              >
                                승인
                              </button>
                            )}
                            {order.orderStatus === 'ADMIN_CONFIRMED' && (
                              <button
                                style={{ ...S.btn, ...S.btnApprove }}
                                onClick={() => handleShipping(order.id)}
                              >
                                배송
                              </button>
                            )}
                            {order.orderStatus === 'IN_DELIVERY' && (
                              <button
                                style={{ ...S.btn, ...S.btnApprove }}
                                onClick={() => handleCompleteOrder(order.id)}
                              >
                                완료
                              </button>
                            )}
                            {!['COMPLETED', 'CANCELLED'].includes(order.orderStatus) && (
                              <button
                                style={{ ...S.btn, ...S.btnReject }}
                                onClick={() => handleCancelOrder(order.id)}
                              >
                                취소
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 출금 관리 탭 */}
      {tab === 'payouts' && (
        <div style={S.card}>
          <div style={S.cardTitle}>💰 판매자 출금 요청</div>
          {loading ? (
            <div style={S.empty}>로딩 중...</div>
          ) : payouts.length === 0 ? (
            <div style={S.empty}>출금 요청이 없습니다.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>요청ID</th>
                    <th style={S.th}>판매자</th>
                    <th style={S.th}>금액</th>
                    <th style={S.th}>계좌</th>
                    <th style={S.th}>상태</th>
                    <th style={S.th}>요청일</th>
                    <th style={S.th}>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => {
                    const pid = p.id || p.payout_id;
                    const status = String(p.status || 'PENDING').toUpperCase();
                    return (
                      <tr key={pid}>
                        <td style={S.td}>#{pid}</td>
                        <td style={S.td}>{p.seller_name || p.sellerName || p.seller_id || p.sellerId || '-'}</td>
                        <td style={S.td}>{Number(p.amount || 0).toLocaleString()}P</td>
                        <td style={S.td}>
                          <div>{p.bank_name || p.bankName || '-'}</div>
                          <div style={{ fontSize: 10, opacity: 0.6 }}>{p.account_number || p.accountNumber || ''}</div>
                        </td>
                        <td style={S.td}>
                          <span style={{ ...S.badge, ...getBadgeStyle(status === 'PAID' ? 'COMPLETED' : status === 'REJECTED' ? 'CANCELLED' : 'ORDERED') }}>
                            {status}
                          </span>
                        </td>
                        <td style={S.td}>
                          {(p.requested_at || p.requestedAt) ? new Date(p.requested_at || p.requestedAt).toLocaleDateString('ko-KR') : '-'}
                        </td>
                        <td style={S.td}>
                          {status === 'PENDING' && (
                            <div style={S.btnGroup}>
                              <button style={{ ...S.btn, ...S.btnApprove }} onClick={() => handlePayoutAction(pid, 'APPROVED')}>승인</button>
                              <button style={{ ...S.btn, ...S.btnEdit }} onClick={() => handlePayoutAction(pid, 'PAID')}>지급</button>
                              <button style={{ ...S.btn, ...S.btnReject }} onClick={() => handlePayoutAction(pid, 'REJECTED')}>거절</button>
                            </div>
                          )}
                          {status === 'APPROVED' && (
                            <button style={{ ...S.btn, ...S.btnEdit }} onClick={() => handlePayoutAction(pid, 'PAID')}>지급완료</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 상품 등록 모달 */}
      {createOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20,
        }}>
          <div style={{
            background: '#18181b', borderRadius: 16, padding: 28,
            width: '100%', maxWidth: 480,
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
              ➕ 유통 상품 등록
            </h3>
            {[
              { label: '상품명', key: 'title', type: 'text' },
              { label: '설명', key: 'description', type: 'text' },
              { label: '가격 (P)', key: 'price', type: 'number' },
              { label: '재고', key: 'quantity', type: 'number' },
            ].map(({ label, key, type }) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 6 }}>
                  {label}
                </label>
                <input
                  type={type}
                  value={createForm[key]}
                  onChange={e => setCreateForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 6 }}>카테고리</label>
              <select
                value={createForm.type}
                onChange={e => setCreateForm(f => ({ ...f, type: e.target.value }))}
                style={{ ...S.filterSelect, width: '100%' }}
              >
                <option value="food">식품</option>
                <option value="daily">생활용품</option>
                <option value="health">건강</option>
                <option value="local-special">지역특산</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button style={{ ...S.btn, ...S.btnDelete, padding: '10px 20px' }} onClick={() => setCreateOpen(false)} disabled={saving}>취소</button>
              <button style={{ ...S.btn, ...S.btnEdit, padding: '10px 20px' }} onClick={handleCreateProduct} disabled={saving}>
                {saving ? '등록 중...' : '등록'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
