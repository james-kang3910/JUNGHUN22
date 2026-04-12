import React, { useEffect, useState } from 'react';
import * as storageAdapter from '../../lib/storageAdapter';
import { useNavigate } from 'react-router-dom';
import { getMembers } from '../../lib/adminStore';
import SupplyList from '../../components/SupplyList';

export default function AdminSupplies() {
  const [tab, setTab] = useState('requests'); // requests | offers
  const [allSupplies, setAllSupplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch both legacy `supplies` and `supply_items` and merge
      const [suppliesArr, itemsArr] = await Promise.all([
        storageAdapter.fetchSupplies().catch(() => []),
        storageAdapter.getSupplyItems().catch(() => [])
      ]);

      const normalize = (s) => ({
        id: s.id || s.itemId || s.supply_id || s.item_id || s.supplyId || s.requestId || null,
        user_id: s.created_by || s.userId || s.user_id || s.managerId || s.manager_id || null,
        user_name: s.user_name || s.userName || s.manager || null,
        category: s.category || s.type || 'general',
        item_name: s.title || s.item || s.item_name || s.name || '',
        quantity: s.quantity || 1,
        unit: s.unit || '개',
        region: s.region || '미지정',
        request_date: s.created_at || s.date || s.createdAt || new Date().toISOString(),
        status: s.status || 'pending',
        notes: s.description || s.details || s.notes || '',
        type: s.type || null,
        image_url: s.image_url || s.image || s.imageUrl || null,
        price: s.price,
        manager: s.manager || null
      });

      const listA = Array.isArray(suppliesArr) ? suppliesArr.map(normalize) : [];
      const listB = Array.isArray(itemsArr) ? itemsArr.map(normalize) : [];

      // merge unique by id (string)
      const mergedMap = new Map();
      [...listA, ...listB].forEach(item => {
        const key = item.id ? String(item.id) : null;
        if (!key) return;
        if (!mergedMap.has(key)) mergedMap.set(key, item);
      });

      const normalized = Array.from(mergedMap.values());
      setAllSupplies(normalized);

      console.log('[AdminSupplies] ✅ Supplies merged:', {
        suppliesCount: Array.isArray(suppliesArr) ? suppliesArr.length : 0,
        itemsCount: Array.isArray(itemsArr) ? itemsArr.length : 0,
        mergedCount: normalized.length,
        firstFiveIds: normalized.slice(0,5).map(s => s.id)
      });
    } catch (err) {
      console.error('Failed to load supplies:', err);
      window.alert('데이터 로드 실패: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (supply, action) => {
    if (action === 'confirm') {
      if (!window.confirm('이 신청을 승인 처리하시겠습니까?')) return;
      try {
        await storageAdapter.updateSupply(supply.id, { status: 'confirmed' });
        await loadData();
      } catch (err) {
        window.alert('승인 처리 실패: ' + (err.message || err));
      }
    } else if (action === 'complete') {
      const amountStr = window.prompt('구매 금액을 입력하세요 (원단위, 빈칸이면 0):', '0');
      if (amountStr === null) return;
      const amount = amountStr ? Number(amountStr || 0) : 0;
      
      try {
        await storageAdapter.updateSupply(supply.id, { 
          status: 'completed', 
          purchase_amount: amount,
          completed_at: new Date().toISOString()
        });
        await loadData();
      } catch (err) {
        window.alert('완료 처리 실패: ' + (err.message || err));
      }
    } else if (action === 'delete') {
      if (!window.confirm('이 항목을 삭제하시겠습니까?')) return;
      try {
        await storageAdapter.deleteSupply(supply.id);
        await loadData();
      } catch (err) {
        window.alert('삭제 실패: ' + (err.message || err));
      }
    }
  };

  const handleBulkAction = async (supplies, action) => {
    if (action === 'confirm') {
      if (!window.confirm(`${supplies.length}개 항목을 승인하시겠습니까?`)) return { success: false };
      try {
        for (const s of supplies) {
          await storageAdapter.updateSupply(s.id, { status: 'confirmed' });
        }
        await loadData();
        return { success: true, message: `${supplies.length}개 항목이 승인되었습니다.` };
      } catch (err) {
        return { success: false, message: err.message || err };
      }
    } else if (action === 'complete') {
      if (!window.confirm(`${supplies.length}개 항목을 완료 처리하시겠습니까?`)) return { success: false };
      try {
        for (const s of supplies) {
          await storageAdapter.updateSupply(s.id, { 
            status: 'completed',
            completed_at: new Date().toISOString()
          });
        }
        await loadData();
        return { success: true, message: `${supplies.length}개 항목이 완료되었습니다.` };
      } catch (err) {
        return { success: false, message: err.message || err };
      }
    } else if (action === 'delete') {
      if (!window.confirm(`${supplies.length}개 항목을 삭제하시겠습니까?`)) return { success: false };
      try {
        for (const s of supplies) {
          await storageAdapter.deleteSupply(s.id);
        }
        await loadData();
        return { success: true, message: `${supplies.length}개 항목이 삭제되었습니다.` };
      } catch (err) {
        return { success: false, message: err.message || err };
      }
    }
    return { success: false };
  };

  const cleanupNonManagers = async () => {
    if (!window.confirm('비-보급담당자(supplyManager=false)가 올린 offer를 모두 삭제하시겠습니까?')) return;
    
    try {
      const members = getMembers() || [];
      const mgrIds = members.filter(m => m.supplyManager).map(m => String(m.id || m.memberId));
      const offers = allSupplies.filter(s => s.type === 'offer');
      const toDelete = offers.filter(o => !mgrIds.includes(String(o.user_id)));
      
      for (const item of toDelete) {
        await storageAdapter.deleteSupply(item.id);
      }
      
      await loadData();
      window.alert(`${toDelete.length}개 항목을 정리했습니다.`);
    } catch (err) {
      window.alert('정리 실패: ' + (err.message || err));
    }
  };

  const requests = allSupplies.filter(s => s.type === 'request' || s.status === 'request');
  const offers = allSupplies.filter(s => s.type === 'offer' || s.status === 'offer');

  // ★ 데이터 없을 때 메시지
  const renderEmptyMessage = () => (
    <div style={{ textAlign: 'center', padding: 40, opacity: 0.7 }}>
      <div style={{ fontSize: 16, marginBottom: 8 }}>📦</div>
      <div>등록된 물품이 없습니다.</div>
      <div style={{ fontSize: 12, marginTop: 4, opacity: 0.7 }}>
        마이페이지에서 보급 물품을 등록해보세요.
      </div>
    </div>
  );

  return (
    <div>
      <header className="flex items-center gap-2 mb-4">
        <button 
          onClick={() => navigate('/admin')} 
          className="px-3 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
        >
          ← 관리자
        </button>
        <h2 className="text-2xl font-bold">📦 보급지원 관리</h2>
        <button 
          onClick={loadData} 
          className="ml-auto px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          🔄 새로고침
        </button>
      </header>

      <div className="flex gap-2 mb-4">
        <button 
          onClick={() => setTab('requests')} 
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            tab === 'requests' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          신청 목록 ({requests.length})
        </button>
        <button 
          onClick={() => setTab('offers')} 
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            tab === 'offers' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          등록된 보급품 ({offers.length})
        </button>
        {tab === 'offers' && (
          <button 
            onClick={cleanupNonManagers} 
            className="ml-auto px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            비권한자 offer 정리
          </button>
        )}
      </div>

      {tab === 'requests' && (
        <>
          {requests.length === 0 && !loading && renderEmptyMessage()}
          {requests.length > 0 && (
            <SupplyList
              supplies={requests}
              onAction={handleAction}
              onBulkAction={handleBulkAction}
              loading={loading}
              emptyMessage="신청 목록이 없습니다."
            />
          )}
        </>
      )}

      {tab === 'offers' && (
        <>
          {offers.length === 0 && !loading && renderEmptyMessage()}
          {offers.length > 0 && (
            <SupplyList
              supplies={offers}
              onAction={handleAction}
              onBulkAction={handleBulkAction}
              loading={loading}
              emptyMessage="등록된 보급품이 없습니다."
            />
          )}
        </>
      )}
    </div>
  );
}
