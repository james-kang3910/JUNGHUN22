/**
 * 날짜/시간 유틸리티 함수 모음
 */

/**
 * 상대 시간 표시 (YouTube, Twitter 방식)
 * @param {string|Date} dateString - ISO 날짜 문자열 또는 Date 객체
 * @returns {string} - "방금 전", "3분 전", "2시간 전", "어제", "3일 전" 등
 */
export function getRelativeTime(dateString) {
  if (!dateString) return '시간 정보 없음';
  
  const now = new Date();
  const date = new Date(dateString);
  
  // 유효하지 않은 날짜
  if (isNaN(date.getTime())) return '잘못된 날짜';
  
  const diffMs = now - date;
  
  // 미래 날짜 처리
  if (diffMs < 0) return '미래';
  
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 10) return '방금 전';
  if (diffSec < 60) return `${diffSec}초 전`;
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay === 1) return '어제';
  if (diffDay < 7) return `${diffDay}일 전`;
  if (diffWeek < 4) return `${diffWeek}주 전`;
  if (diffMonth < 12) return `${diffMonth}개월 전`;
  if (diffYear === 1) return '1년 전';
  if (diffYear < 10) return `${diffYear}년 전`;
  
  // 10년 이상 지난 경우 절대 날짜 표시
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * 전체 날짜/시간 표시 (tooltip용)
 * @param {string|Date} dateString - ISO 날짜 문자열 또는 Date 객체
 * @returns {string} - "2026년 1월 29일 (수) 오후 2:35"
 */
export function formatFullDateTime(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * 간단한 날짜 표시
 * @param {string|Date} dateString - ISO 날짜 문자열 또는 Date 객체
 * @returns {string} - "2026.01.29"
 */
export function formatSimpleDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}.${month}.${day}`;
}
