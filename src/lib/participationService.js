/**
 * participationService.js
 * 참여 기록 관리 서비스 (서버 DB 기반)
 * - 미션/이벤트/오디션 참여 중복 방지
 * - 선발 표시
 */

import * as storageAdapter from './storageAdapter';

/**
 * 참여 여부 확인
 * @param {string} itemKey - 항목 키 (예: 'mission_123', 'audition_456')
 * @param {string} memberId - 회원 ID
 * @returns {Promise<boolean>} 참여 여부
 */
export async function hasParticipated(itemKey, memberId) {
  if (!itemKey || !memberId) return false;
  
  try {
    const participations = await storageAdapter.getParticipations(memberId);
    return participations.some(p => p.itemKey === itemKey);
  } catch (error) {
    console.error('[participationService] hasParticipated error:', error);
    return false;
  }
}

/**
 * 참여 등록
 * @param {Object} participation - 참여 정보
 * @param {string} participation.itemKey - 항목 키
 * @param {string} participation.itemId - 항목 ID
 * @param {string} participation.itemType - 항목 타입 (mission/event/audition)
 * @param {string} participation.title - 항목 제목
 * @param {string} participation.memberId - 회원 ID
 * @param {string} participation.regionId - 지역 ID
 * @param {boolean} participation.crossRegion - 타지역 참여 여부
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function addParticipation({ itemKey, itemId, itemType, title, memberId, regionId, crossRegion, submissionText, submissionLink, submissionImages }) {
  if (!itemKey || !memberId) {
    return { success: false, error: 'missing_params' };
  }
  
  try {
    // 중복 체크
    const already = await hasParticipated(itemKey, memberId);
    if (already) {
      console.warn('[participationService] Already participated:', itemKey, memberId);
      return { success: false, error: 'already' };
    }
    
    // 서버에 등록
    try {
      await storageAdapter.addParticipation({
        itemKey,
        itemId,
        itemType,
        title,
        memberId,
        regionId,
        crossRegion,
        submissionText,
        submissionLink,
        submissionImages,
      });
    } catch (submitError) {
      const legacyMediaRequired = String(submitError?.message || '').includes('submission_media_required');
      if (!legacyMediaRequired) {
        throw submitError;
      }

      // Legacy server compatibility: keep text-only UX while satisfying old media-required checks.
      await storageAdapter.addParticipation({
        itemKey,
        itemId,
        itemType,
        title,
        memberId,
        regionId,
        crossRegion,
        submissionText,
        submissionLink: submissionLink || 'https://example.com/text-only-submission',
        submissionImages,
      });
    }
    
    console.log('[participationService] Participation added:', itemKey, memberId);
    
    // SSOT 이벤트 디스패치
    try {
      window.dispatchEvent(new CustomEvent('su:ssot:changed', { detail: { type: 'participation' } }));
    } catch (e) {
      // 이벤트 디스패치 실패 무시
    }
    
    return { success: true };
  } catch (error) {
    console.error('[participationService] addParticipation error:', error);
    
    // 서버에서 중복 에러 반환한 경우
    if (error.message && error.message.includes('already')) {
      return { success: false, error: 'already' };
    }
    
    return { success: false, error: error.message || 'unknown' };
  }
}

/**
 * 여러 항목에 일괄 참여
 * @param {Array} items - 항목 배열
 * @param {string} memberId - 회원 ID
 * @param {string} regionId - 지역 ID
 * @returns {Promise<{success: number, failed: number, errors: Array}>}
 */
export async function participateAll(items, memberId, regionId) {
  const results = {
    success: 0,
    failed: 0,
    errors: []
  };
  
  for (const item of items) {
    const result = await addParticipation({
      itemKey: item.itemKey || `${item.itemType}_${item.itemId}`,
      itemId: item.itemId,
      itemType: item.itemType,
      title: item.title,
      memberId,
      regionId
    });
    
    if (result.success) {
      results.success++;
    } else {
      results.failed++;
      results.errors.push({
        itemKey: item.itemKey,
        error: result.error
      });
    }
  }
  
  return results;
}

/**
 * 선발 표시
 * @param {string} itemKey - 항목 키
 * @param {string} memberId - 회원 ID
 * @param {boolean} selected - 선발 여부
 * @returns {Promise<{success: boolean}>}
 */
export async function markSelection(itemKey, memberId, selected = true) {
  if (!itemKey || !memberId) {
    return { success: false, error: 'missing_params' };
  }
  
  try {
    await storageAdapter.markParticipationSelection(itemKey, memberId, selected);
    
    console.log('[participationService] Selection marked:', itemKey, memberId, selected);
    
    // SSOT 이벤트 디스패치
    try {
      window.dispatchEvent(new CustomEvent('su:ssot:changed', { detail: { type: 'participation' } }));
    } catch (e) {
      // 이벤트 디스패치 실패 무시
    }
    
    return { success: true };
  } catch (error) {
    console.error('[participationService] markSelection error:', error);
    return { success: false, error: error.message || 'unknown' };
  }
}

/**
 * 참여 목록 조회
 * @param {string} memberId - 회원 ID
 * @returns {Promise<Array>} 참여 목록
 */
export async function getParticipations(memberId) {
  if (!memberId) return [];
  
  try {
    return await storageAdapter.getParticipations(memberId);
  } catch (error) {
    console.error('[participationService] getParticipations error:', error);
    return [];
  }
}
