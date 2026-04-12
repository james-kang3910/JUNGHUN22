import { useState, useMemo } from 'react';
import SupplyItem from './SupplyItem';
import Toast from './Toast';

/**
 * SupplyList - 보급 목록 표시 및 관리 컴포넌트
 * @param {Object} props
 * @param {Array} props.supplies - 보급 목록
 * @param {Function} props.onAction - 액션 실행 콜백
 * @param {Function} props.onBulkAction - 벌크 액션 실행 콜백
 * @param {boolean} props.loading - 로딩 상태
 * @param {string} props.emptyMessage - 빈 목록 메시지
 * @param {boolean} props.showBackup - 백업/복원 기능 표시 여부
 */
export default function SupplyList({ 
  supplies = [], 
  onAction,
  onBulkAction,
  loading = false,
  emptyMessage = '보급 신청 내역이 없습니다.',
  showBackup = false
}) {
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'table'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [toast, setToast] = useState(null);
  const itemsPerPage = 10;

  // 필터링 및 정렬
  const filteredSupplies = useMemo(() => {
    let result = [...supplies];

    // 검색
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(s => 
        s.item_name?.toLowerCase().includes(term) ||
        s.user_name?.toLowerCase().includes(term) ||
        s.user_id?.toLowerCase().includes(term) ||
        s.notes?.toLowerCase().includes(term)
      );
    }

    // 상태 필터
    if (filterStatus !== 'all') {
      result = result.filter(s => s.status === filterStatus);
    }

    // 카테고리 필터
    if (filterCategory !== 'all') {
      result = result.filter(s => s.category === filterCategory);
    }

    // 정렬
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.request_date) - new Date(a.request_date);
        case 'date-asc':
          return new Date(a.request_date) - new Date(b.request_date);
        case 'name-asc':
          return (a.item_name || '').localeCompare(b.item_name || '');
        case 'name-desc':
          return (b.item_name || '').localeCompare(a.item_name || '');
        case 'quantity-desc':
          return (b.quantity || 0) - (a.quantity || 0);
        case 'quantity-asc':
          return (a.quantity || 0) - (b.quantity || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [supplies, searchTerm, filterStatus, filterCategory, sortBy]);

  // 페이징
  const totalPages = Math.ceil(filteredSupplies.length / itemsPerPage);
  const paginatedSupplies = filteredSupplies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 카테고리 추출
  const categories = useMemo(() => {
    const cats = new Set(supplies.map(s => s.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [supplies]);

  // 선택 관리
  const toggleSelect = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedSupplies.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedSupplies.map(s => s.id)));
    }
  };

  // 벌크 액션
  const handleBulkAction = async (action) => {
    if (selectedIds.size === 0) {
      setToast({ type: 'warning', message: '선택된 항목이 없습니다.' });
      return;
    }

    const selectedSupplies = supplies.filter(s => selectedIds.has(s.id));
    
    if (onBulkAction) {
      const result = await onBulkAction(selectedSupplies, action);
      if (result?.success) {
        setSelectedIds(new Set());
        setToast({ type: 'success', message: result.message || '작업이 완료되었습니다.' });
      } else {
        setToast({ type: 'error', message: result?.message || '작업 중 오류가 발생했습니다.' });
      }
    }
  };

  // 백업/복원
  const handleBackup = () => {
    const data = JSON.stringify(supplies, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supplies-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToast({ type: 'success', message: '백업 파일이 다운로드되었습니다.' });
  };

  const handleRestore = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (onBulkAction) {
          onBulkAction(data, 'restore');
        }
        setToast({ type: 'success', message: '데이터를 복원했습니다.' });
      } catch (error) {
        setToast({ type: 'error', message: 'JSON 파싱 오류: ' + error.message });
      }
    };
    reader.readAsText(file);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">로딩 중...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 도구 모음 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        {/* 검색 및 필터 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <input
            type="text"
            placeholder="검색 (이름, 신청자, 메모)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">전체 상태</option>
            <option value="pending">대기</option>
            <option value="confirmed">승인</option>
            <option value="completed">완료</option>
            <option value="rejected">거부</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">전체 카테고리</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date-desc">최신순</option>
            <option value="date-asc">오래된순</option>
            <option value="name-asc">이름 A-Z</option>
            <option value="name-desc">이름 Z-A</option>
            <option value="quantity-desc">수량 많은순</option>
            <option value="quantity-asc">수량 적은순</option>
          </select>
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('card')}
              className={`px-3 py-2 rounded-md ${viewMode === 'card' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              카드
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 rounded-md ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              테이블
            </button>
          </div>

          <div className="flex gap-2">
            {selectedIds.size > 0 && (
              <>
                <button
                  onClick={() => handleBulkAction('confirm')}
                  className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  일괄 승인 ({selectedIds.size})
                </button>
                <button
                  onClick={() => handleBulkAction('complete')}
                  className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  일괄 완료 ({selectedIds.size})
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  일괄 삭제 ({selectedIds.size})
                </button>
              </>
            )}
            {showBackup && (
              <>
                <button
                  onClick={handleBackup}
                  className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  백업
                </button>
                <label className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 cursor-pointer">
                  복원
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestore}
                    className="hidden"
                  />
                </label>
              </>
            )}
          </div>
        </div>

        {/* 통계 */}
        <div className="mt-3 text-sm text-gray-600">
          전체 {supplies.length}개 | 필터링 {filteredSupplies.length}개
          {selectedIds.size > 0 && ` | 선택 ${selectedIds.size}개`}
        </div>
      </div>

      {/* 목록 */}
      {filteredSupplies.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500 text-lg">{emptyMessage}</p>
        </div>
      ) : (
        <>
          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedSupplies.map(supply => (
                <SupplyItem
                  key={supply.id}
                  supply={supply}
                  isSelected={selectedIds.has(supply.id)}
                  onSelect={toggleSelect}
                  onAction={onAction}
                  mode="card"
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === paginatedSupplies.length && paginatedSupplies.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">신청자</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">카테고리</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">품목</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">수량</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">지역</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">신청일</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">액션</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedSupplies.map(supply => (
                    <SupplyItem
                      key={supply.id}
                      supply={supply}
                      isSelected={selectedIds.has(supply.id)}
                      onSelect={toggleSelect}
                      onAction={onAction}
                      mode="table"
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 페이징 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-gray-200 rounded-md disabled:opacity-50"
              >
                이전
              </button>
              <span className="text-sm text-gray-600">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-gray-200 rounded-md disabled:opacity-50"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
