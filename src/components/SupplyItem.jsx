import { useState } from 'react';

/**
 * SupplyItem - 개별 보급 아이템 표시 컴포넌트
 * @param {Object} props
 * @param {Object} props.supply - 보급 데이터
 * @param {boolean} props.isSelected - 선택 상태
 * @param {Function} props.onSelect - 선택 토글 콜백
 * @param {Function} props.onAction - 액션 실행 콜백 (confirm/complete/delete)
 * @param {string} props.mode - 표시 모드 ('card' | 'table')
 * @param {boolean} props.showActions - 액션 버튼 표시 여부
 */
export default function SupplyItem({ 
  supply, 
  isSelected, 
  onSelect, 
  onAction, 
  mode = 'card',
  showActions = true 
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: '대기', className: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: '승인', className: 'bg-blue-100 text-blue-800' },
      completed: { label: '완료', className: 'bg-green-100 text-green-800' },
      rejected: { label: '거부', className: 'bg-red-100 text-red-800' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  const handleAction = (action) => {
    if (onAction) {
      onAction(supply, action);
    }
  };

  if (mode === 'table') {
    return (
      <tr className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
        <td className="px-4 py-3 text-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect && onSelect(supply.id)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </td>
        <td className="px-4 py-3 text-sm">{supply.id}</td>
        <td className="px-4 py-3 text-sm font-medium">{supply.user_name || supply.user_id}</td>
        <td className="px-4 py-3 text-sm">{supply.category}</td>
        <td className="px-4 py-3 text-sm">{supply.item_name}</td>
        <td className="px-4 py-3 text-sm text-center">{supply.quantity} {supply.unit}</td>
        <td className="px-4 py-3 text-sm">{supply.region}</td>
        <td className="px-4 py-3 text-sm">{supply.request_date}</td>
        <td className="px-4 py-3 text-sm text-center">{getStatusBadge(supply.status)}</td>
        {showActions && (
          <td className="px-4 py-3 text-sm text-center">
            <div className="flex gap-1 justify-center">
              {supply.status === 'pending' && (
                <button
                  onClick={() => handleAction('confirm')}
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  title="승인"
                >
                  승인
                </button>
              )}
              {supply.status === 'confirmed' && (
                <button
                  onClick={() => handleAction('complete')}
                  className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                  title="완료"
                >
                  완료
                </button>
              )}
              <button
                onClick={() => handleAction('delete')}
                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                title="삭제"
              >
                삭제
              </button>
            </div>
          </td>
        )}
      </tr>
    );
  }

  // Card mode
  return (
    <div className={`border rounded-lg p-4 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'} hover:shadow-md transition-shadow`}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect && onSelect(supply.id)}
          className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-lg">{supply.item_name}</h3>
              <p className="text-sm text-gray-600">
                신청자: {supply.user_name || supply.user_id} | {supply.category}
              </p>
            </div>
            {getStatusBadge(supply.status)}
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
            <div>
              <span className="text-gray-500">수량:</span>
              <span className="ml-2 font-medium">{supply.quantity} {supply.unit}</span>
            </div>
            <div>
              <span className="text-gray-500">지역:</span>
              <span className="ml-2">{supply.region}</span>
            </div>
            <div>
              <span className="text-gray-500">신청일:</span>
              <span className="ml-2">{supply.request_date}</span>
            </div>
            <div>
              <span className="text-gray-500">ID:</span>
              <span className="ml-2">{supply.id}</span>
            </div>
          </div>

          {supply.notes && (
            <div className="mb-3">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm text-blue-600 hover:underline"
              >
                {isExpanded ? '메모 숨기기' : '메모 보기'}
              </button>
              {isExpanded && (
                <p className="mt-2 text-sm text-gray-700 p-2 bg-gray-50 rounded">
                  {supply.notes}
                </p>
              )}
            </div>
          )}

          {showActions && (
            <div className="flex gap-2">
              {supply.status === 'pending' && (
                <button
                  onClick={() => handleAction('confirm')}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  승인
                </button>
              )}
              {supply.status === 'confirmed' && (
                <button
                  onClick={() => handleAction('complete')}
                  className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                >
                  완료 처리
                </button>
              )}
              <button
                onClick={() => handleAction('delete')}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                삭제
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
