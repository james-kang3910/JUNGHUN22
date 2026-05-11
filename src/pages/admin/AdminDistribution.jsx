import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as storageAdapter from '../../lib/storageAdapter';

console.log('[PAGE]', 'AdminDistribution.jsx (active)');

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
  const [tab, setTab] = useState('overview');
  const [supplies, setSupplies] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 필터 상태
  const [productSearch, setProductSearch] = useState('');
  const [productStatus, setProductStatus] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('all');

  // 데이터 로드
  const loadData = async () => {
    try {
      setLoading(true);
      const [suppliesData, requestsData] = await Promise.all([
        storageAdapter.fetchSupplies().catch(() => []),
        storageAdapter.getSupplyRequests().catch(() => []),
      ]);
      
      setSupplies(Array.isArray(suppliesData) ? suppliesData : []);
      setOrders(Array.isArray(requestsData) ? requestsData : []);
      
      console.log('[AdminDistribution] ✅ Data loaded:', {
        supplies: Array.isArray(suppliesData) ? suppliesData.length : 0,
        orders: Array.isArray(requestsData) ? requestsData.length : 0,
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
      {/* 헤더 */}
      <div style={S.header}>
        <h1 style={S.title}>📦 유통 지원 관리</h1>
        <p style={S.subtitle}>모든 유통 주문 현황을 관리합니다.</p>
      </div>

      {/* 탭 */}
      <div style={S.tabs}>
        <button
          style={{ ...S.tab, ...(tab === 'orders' ? S.tabActive : {}) }}
          onClick={() => setTab('orders')}
        >
          🛒 주문 관리
        </button>
      </div>

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
                        <td style={S.td}>{order.supplyItemId || '-'}</td>
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
    </div>
  );
}
