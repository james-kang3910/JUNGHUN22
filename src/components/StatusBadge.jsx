/**
 * StatusBadge - 공통 상태 표시 컴포넌트
 * 
 * @param {string} status - 상태 값 (ACTIVE, PENDING, SUSPENDED 등)
 * @param {object} options - 상태 옵션 배열 (기본값 제공)
 * @param {string} size - 크기 ('sm', 'md', 'lg')
 * @param {function} onClick - 클릭 핸들러 (옵션)
 */

const DEFAULT_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "활성", color: "#22c55e" },
  { value: "PENDING", label: "대기", color: "#f59e0b" },
  { value: "SUSPENDED", label: "정지", color: "#ef4444" },
  { value: "INACTIVE", label: "비활성", color: "#6b7280" },
  { value: "APPROVED", label: "승인", color: "#3b82f6" },
  { value: "REJECTED", label: "거부", color: "#dc2626" },
  { value: "COMPLETED", label: "완료", color: "#10b981" },
];

const SIZE_STYLES = {
  sm: {
    padding: "2px 8px",
    fontSize: 11,
    borderRadius: 6,
  },
  md: {
    padding: "4px 12px",
    fontSize: 12,
    borderRadius: 8,
  },
  lg: {
    padding: "6px 16px",
    fontSize: 14,
    borderRadius: 10,
  },
};

export default function StatusBadge({ 
  status, 
  options = DEFAULT_STATUS_OPTIONS,
  size = 'md',
  onClick 
}) {
  // status 정규화 (대문자 변환)
  const normalizedStatus = String(status || '').toUpperCase();
  
  // 상태 정보 찾기
  const statusInfo = options.find(opt => opt.value === normalizedStatus) || {
    value: normalizedStatus,
    label: normalizedStatus || '알 수 없음',
    color: '#6b7280'
  };

  const sizeStyle = SIZE_STYLES[size] || SIZE_STYLES.md;

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...sizeStyle,
    background: statusInfo.color,
    color: '#fff',
    fontWeight: 700,
    whiteSpace: 'nowrap',
    cursor: onClick ? 'pointer' : 'default',
    border: 'none',
    transition: 'opacity 0.2s',
  };

  const handleClick = (e) => {
    if (onClick) {
      e.stopPropagation();
      onClick(normalizedStatus);
    }
  };

  return (
    <span 
      style={badgeStyle}
      onClick={handleClick}
      onMouseEnter={(e) => { if (onClick) e.currentTarget.style.opacity = '0.8'; }}
      onMouseLeave={(e) => { if (onClick) e.currentTarget.style.opacity = '1'; }}
    >
      {statusInfo.label}
    </span>
  );
}

// 상태 옵션 내보내기 (재사용 가능)
export { DEFAULT_STATUS_OPTIONS };
