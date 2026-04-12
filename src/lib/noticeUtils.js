/**
 * PV3 완전 복원: 공지사항 유틸리티
 * 
 * PV3에서 사용하던 공지사항 관련 유틸리티 함수들을 복원합니다.
 * localStorage 기반에서 서버 DB 기반으로 전환되었습니다.
 */

import { getNotices } from './storageAdapter.js';

/**
 * 지역별 공지사항 조회
 * @param {string} regionId - 지역 ID
 * @returns {Promise<Array>} 공지사항 목록
 */
export async function getRegionNotices(regionId, districtId = null) {
  try {
    // 해당 지역 공지만 가져오기 (scope='REGION')
    const params = { region_id: regionId, status: 'ACTIVE' };
    if (districtId) params.districtId = districtId;
    const notices = await getNotices(params);
    
    return notices.filter(notice => {
      // 지역 공지만 포함 (scope='REGION')
      if (notice.scope === 'REGION') {
        if (notice.regionId === regionId) return true;
        if (notice.regionIds && notice.regionIds.includes(regionId)) return true;
      }
      
      return false; // scope='ALL' 제외
    });
  } catch (error) {
    console.error('Failed to fetch region notices:', error);
    return [];
  }
}

/**
 * 공지사항 표시 여부 확인
 * @param {Object} notice - 공지사항 객체
 * @param {string} regionId - 지역 ID
 * @returns {boolean} 표시 여부
 */
export function shouldShowNotice(notice, regionId) {
  if (!notice || notice.status !== 'ACTIVE') return false;
  
  // 전체 공지
  if (notice.scope === 'ALL') return true;
  
  // 지역 공지
  if (notice.scope === 'REGION') {
    if (notice.regionId === regionId) return true;
    if (notice.regionIds && notice.regionIds.includes(regionId)) return true;
  }
  
  return false;
}

/**
 * 공지사항 포맷팅
 * @param {Object} notice - 공지사항 객체
 * @returns {Object} 포맷팅된 공지사항
 */
export function formatNotice(notice) {
  const normalizedId = notice?.id || notice?.noticeId || notice?.notice_id || notice?.postId || notice?.post_id || null;
  const normalizedCreatedAt = notice?.createdAt || notice?.created_at || notice?.createdDate || notice?.created_date || '';
  const normalizedUpdatedAt = notice?.updatedAt || notice?.updated_at || '';
  const normalizedRegionId = notice?.regionId || notice?.region_id || '';
  const normalizedRegionIds = Array.isArray(notice?.regionIds)
    ? notice.regionIds
    : Array.isArray(notice?.region_ids)
      ? notice.region_ids
      : [];
  const normalizedAuthor = notice?.author || notice?.authorName || notice?.author_name || '';

  return {
    id: normalizedId,
    title: notice.title,
    content: notice.content,
    scope: notice.scope,
    regionId: normalizedRegionId,
    regionIds: normalizedRegionIds,
    status: notice.status,
    author: normalizedAuthor,
    authorId: notice.authorId,
    createdAt: normalizedCreatedAt,
    updatedAt: normalizedUpdatedAt,
    formattedDate: normalizedCreatedAt
      ? new Date(normalizedCreatedAt).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : ''
  };
}

/**
 * 공지사항 범위 텍스트 변환
 * @param {Object} notice - 공지사항 객체
 * @returns {string} 범위 텍스트
 */
export function getNoticeScopeText(notice) {
  if (!notice) return '';
  
  if (notice.scope === 'ALL') return '전체 공지';
  if (notice.scope === 'REGION') {
    if (notice.regionName) return `${notice.regionName} 공지`;
    return '지역 공지';
  }
  
  return notice.scope;
}
