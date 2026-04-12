/**
 * ★ 공유방송 Single Source of Truth - 서버 DB 기반
 * Home, Broadcast, BroadcastDetail 모두 이 store를 참조
 * 
 * [DATA_POLICY]
 * - 서버 DB: Single Source of Truth (broadcasts 테이블)
 * - localStorage: 완전 제거 (더미데이터 삭제)
 * - 읽기: storageAdapter.getAllBroadcasts() → 서버 우선
 * - 쓰기: storageAdapter.upsertBroadcast() → 서버만 사용
 */

import * as storageAdapter from './storageAdapter.js';

/**
 * 전체 공유방송 조회
 * @param {Object} options - { publicOnly, regionId, limit }
 * @returns {Promise<Array>}
 */
export async function getAllShareBroadcasts(options = {}) {
  try {
    // 서버 DB에서 조회 (기본: 공개 방송만)
    const broadcasts = await storageAdapter.getAllBroadcasts({
      publicOnly: options.publicOnly !== false, // default true
      regionId: options.regionId || null,
      limit: options.limit || 100,
    });
    
    return broadcasts || [];
  } catch (error) {
    console.error('[shareBroadcastStore] getAllShareBroadcasts error:', error);
    return []; // 실패 시 빈 배열
  }
}

/**
 * id(숫자 또는 문자열)로 단일 post 조회
 * @param {number|string} id
 * @returns {Promise<object|null>}
 */
export async function getShareBroadcastById(id) {
  try {
    if (!id) {
      console.warn("[shareBroadcastStore] getShareBroadcastById: invalid id", id);
      return null;
    }
    
    const broadcast = await storageAdapter.getBroadcastById(id);
    console.log("[shareBroadcastStore] getShareBroadcastById", { id, found: !!broadcast });
    return broadcast;
  } catch (error) {
    console.error('[shareBroadcastStore] getShareBroadcastById error:', error);
    return null;
  }
}

/**
 * 최신 N개 post 조회 (direct video 우선 정렬 옵션)
 * @param {number} count
 * @param {{ directFirst?: boolean, publicOnly?: boolean }} options
 * @returns {Promise<object[]>}
 */
export async function getLatestShareBroadcasts(count = 2, options = {}) {
  try {
    // 서버에서 전체 조회
    let list = await getAllShareBroadcasts({
      publicOnly: options.publicOnly !== false,
    });

    // createdAt 기준 최신순 정렬
    list.sort((a, b) => {
      const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
      const aValid = Number.isFinite(aTime) ? aTime : 0;
      const bValid = Number.isFinite(bTime) ? bTime : 0;
      return bValid - aValid; // 최신순
    });

    // direct video 우선 정렬
    if (options.directFirst) {
      list.sort((a, b) => {
        const aIsDirect = a.type === "direct" || /\.(mp4|webm|ogg)(?:\?|$)/i.test(a.mediaUrl || "");
        const bIsDirect = b.type === "direct" || /\.(mp4|webm|ogg)(?:\?|$)/i.test(b.mediaUrl || "");
        if (aIsDirect && !bIsDirect) return -1;
        if (!aIsDirect && bIsDirect) return 1;
        return 0;
      });
    }

    // 상위 N개 반환
    return list.slice(0, count);
  } catch (error) {
    console.error('[shareBroadcastStore] getLatestShareBroadcasts error:', error);
    return [];
  }
}

/**
 * 공유방송 등록
 * @param {Object} broadcast - 공유방송 데이터
 * @returns {Promise<Object>}
 */
export async function createShareBroadcast(broadcast) {
  try {
    const result = await storageAdapter.upsertBroadcast(broadcast);
    console.log('[shareBroadcastStore] createShareBroadcast success', result);
    return result;
  } catch (error) {
    console.error('[shareBroadcastStore] createShareBroadcast error:', error);
    throw error;
  }
}

/**
 * 공유방송 수정
 * @param {string} id
 * @param {Object} updates
 * @returns {Promise<Object>}
 */
export async function updateShareBroadcast(id, updates) {
  try {
    const result = await storageAdapter.upsertBroadcast({ id, ...updates });
    console.log('[shareBroadcastStore] updateShareBroadcast success', result);
    return result;
  } catch (error) {
    console.error('[shareBroadcastStore] updateShareBroadcast error:', error);
    throw error;
  }
}

/**
 * 공유방송 삭제
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function deleteShareBroadcast(id) {
  try {
    const result = await storageAdapter.deleteBroadcast(id);
    console.log('[shareBroadcastStore] deleteShareBroadcast success', id);
    
    // SSOT 이벤트 발생
    window.dispatchEvent(new CustomEvent('su:ssot:changed', {
      detail: { type: 'broadcasts', operation: 'delete', key: 'su_broadcast_v1', id }
    }));
    
    return result;
  } catch (error) {
    console.error('[shareBroadcastStore] deleteShareBroadcast error:', error);
    throw error;
  }
}
