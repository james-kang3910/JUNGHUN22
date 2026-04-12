import * as storageAdapter from './storageAdapter';

/**
 * pointsGuard: 전역 포인트 전송 허용/차단 정책을 관리합니다.
 * pull_version2의 localStorage 기반 코드를 서버 API 기반으로 변환했습니다.
 */

const CONFIG_KEY = 'points_transfer_enabled';

/**
 * 포인트 전송이 허용되어 있는지 확인
 * @returns {Promise<boolean>}
 */
export async function isPointsTransferEnabled() {
  try {
    const value = await storageAdapter.getConfig(CONFIG_KEY);
    // 값이 없으면 기본 허용 (true)
    if (value === null || value === undefined) {
      return true;
    }
    // '1' 또는 'true'면 허용
    return value === '1' || value === 'true' || value === true;
  } catch (e) {
    console.error('[pointsGuard] Failed to get config:', e);
    return true; // 에러 시 기본 허용
  }
}

/**
 * 포인트 전송 허용/차단 설정
 * @param {boolean} enabled 
 * @returns {Promise<boolean>} 성공 여부
 */
export async function setPointsTransferEnabled(enabled) {
  try {
    const value = enabled ? '1' : '0';
    await storageAdapter.setConfig(CONFIG_KEY, value);
    
    // 이벤트 발생 (리스너가 있으면 즉시 UI 업데이트 가능)
    try {
      window.dispatchEvent(new CustomEvent('su:points:toggle', { 
        detail: { enabled } 
      }));
    } catch (e) {
      console.warn('[pointsGuard] Failed to dispatch event:', e);
    }
    
    // SSOT 변경 이벤트 발생 (AdminDashboard 등에서 구독)
    try {
      window.dispatchEvent(new CustomEvent('su:ssot:changed', { 
        detail: { 
          key: 'configs',
          action: 'update',
          data: { [CONFIG_KEY]: value }
        } 
      }));
    } catch (e) {}
    
    console.log(`[pointsGuard] Points transfer ${enabled ? 'enabled' : 'disabled'}`);
    return true;
  } catch (e) {
    console.error('[pointsGuard] Failed to set config:', e);
    return false;
  }
}

export default {
  isPointsTransferEnabled,
  setPointsTransferEnabled,
};
