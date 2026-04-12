/**
 * 탐색 지역 (viewerRegionId) 관리 스토어
 * - 가입 지역(member.regionId)과 분리된 "현재 보고 있는 지역"
 * - localStorage에 저장하여 새로고침 후에도 유지
 */

const VIEWER_REGION_KEY = "su_viewer_region_id";
const SELECTED_REGION_KEY = "selectedRegionId";

export function normalizeRegionId(regionId) {
  if (regionId === null || regionId === undefined) return null;
  const normalized = String(regionId).trim().toLowerCase();
  return normalized || null;
}

export function normalizeRegionIds(regionIds) {
  if (Array.isArray(regionIds)) {
    return regionIds.map(normalizeRegionId).filter(Boolean);
  }
  if (typeof regionIds === 'string') {
    return regionIds
      .split(',')
      .map(normalizeRegionId)
      .filter(Boolean);
  }
  return [];
}

/**
 * 탐색 지역 ID 가져오기
 * @returns {string|null} viewerRegionId 또는 null
 */
export function getViewerRegionId() {
  try {
    const viewerRegionId = localStorage.getItem(VIEWER_REGION_KEY) || null;
    if (viewerRegionId) return viewerRegionId;

    const selectedRegionId = localStorage.getItem(SELECTED_REGION_KEY) || null;
    if (selectedRegionId) return selectedRegionId;

    const match = window.location.pathname.match(/^\/r\/([^/]+)/);
    return match?.[1] || null;
  } catch (e) {
    try {
      const match = window.location.pathname.match(/^\/r\/([^/]+)/);
      return match?.[1] || null;
    } catch (error) {
      return null;
    }
  }
}

/**
 * 탐색 지역 ID 설정
 * @param {string} regionId 
 */
export function setViewerRegionId(regionId) {
  try {
    if (regionId) {
      localStorage.setItem(VIEWER_REGION_KEY, regionId);
      localStorage.setItem(SELECTED_REGION_KEY, regionId);
    } else {
      localStorage.removeItem(VIEWER_REGION_KEY);
      localStorage.removeItem(SELECTED_REGION_KEY);
    }
  } catch (e) {
    // noop
  }
}

/**
 * 탐색 지역 ID 초기화 (기본 지역으로 리셋)
 */
export function clearViewerRegionId() {
  try {
    localStorage.removeItem(VIEWER_REGION_KEY);
    localStorage.removeItem(SELECTED_REGION_KEY);
  } catch (e) {
    // noop
  }
}

/**
 * 유효한 탐색 지역 ID 가져오기
 * - viewerRegionId가 없으면 member.regionId를 기본값으로 사용
 * @param {string|null} memberRegionId - 가입 지역 ID
 * @returns {string|null}
 */
export function getEffectiveViewerRegionId(memberRegionId = null) {
  const viewerRegionId = getViewerRegionId();
  return normalizeRegionId(viewerRegionId) || normalizeRegionId(memberRegionId) || null;
}

/**
 * 관리자 여부 확인
 * @returns {boolean}
 */
export function checkIsAdmin() {
  try {
    if (localStorage.getItem("isAdmin") === "true") {
      return true;
    }
    const userStr = localStorage.getItem("su_auth_v2");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role === "admin") {
        return true;
      }
    }
    return false;
  } catch (e) {
    return false;
  }
}

/**
 * 아이템이 현재 탐색 지역에서 보이는지 확인 (보기 필터)
 * @param {Object} item - 미션/이벤트/오디션/콘텐츠 등
 * @param {string|null} viewerRegionId - 현재 탐색 중인 지역 ID
 * @returns {boolean}
 */
export function isVisibleInRegion(item, viewerRegionId) {
  if (!item) return false;
  // region 필드 정규화
  let regionScope = item.regionScope || item.region_scope || "ALL";
  let regionIds = item.regionIds || item.region_ids || [];
  if (!Array.isArray(regionIds)) {
    if (typeof regionIds === "string" && regionIds) regionIds = [regionIds];
    else regionIds = [];
  }
  let regionId = item.regionId || (regionIds.length > 0 ? regionIds[0] : null) || null;
  // CARD-REGION-CHECK 로그
  if (typeof window !== "undefined" && window.__SU_REGION_DEBUG__) {
    console.log('[REGION-FILTER]', {
      id: item.id,
      title: item.title,
      regionScope,
      regionIds,
      regionId,
      viewerRegionId,
    });
  }
  // regionScope가 없거나 ALL이면 항상 표시
  if (!regionScope || regionScope === "ALL") {
    return true;
  }
  // REGION이면 regionIds에 viewerRegionId가 포함되어야 표시
  if (regionScope === "REGION") {
    const normalizedViewerRegionId = normalizeRegionId(viewerRegionId);
    if (!normalizedViewerRegionId) return false;
    const normRegionIds = regionIds.map(normalizeRegionId).filter(Boolean);
    return normRegionIds.includes(normalizedViewerRegionId);
  }
  return true;
}

/**
 * 참여 가능 여부 확인 (미션/이벤트/오디션 신청/참가)
 * - 관리자: 항상 참여 가능
 * - 일반 회원: regionScope=ALL이거나, REGION일 때 가입 지역이 포함된 경우만
 * @param {Object} item - 미션/이벤트/오디션 등
 * @param {string|null} memberRegionId - 회원 가입 지역 ID
 * @param {boolean} isAdmin - 관리자 여부
 * @returns {boolean}
 */
export function canParticipate(item, memberRegionId, isAdmin = false) {
  // 관리자는 항상 참여 가능
  if (isAdmin) return true;
  
  if (!item) return false;
  
  // regionScope가 없거나 ALL이면 참여 가능
  if (!item.regionScope || item.regionScope === "ALL") {
    return true;
  }
  
  // REGION이면 가입 지역(memberRegionId)이 regionIds에 포함되어야 참여 가능
  if (item.regionScope === "REGION") {
    const normalizedMemberRegionId = normalizeRegionId(memberRegionId);
    if (!normalizedMemberRegionId) return false;
    const regionIds = normalizeRegionIds(item.regionIds);
    return regionIds.includes(normalizedMemberRegionId);
  }
  
  return true;
}

/**
 * 참여 불가 사유 메시지
 * @param {Object} item 
 * @param {string|null} memberRegionId 
 * @returns {string}
 */
export function getParticipationBlockedReason(item, memberRegionId, isLoggedIn = false, regionName = null) {
  if (!item) return "";
  const label = regionName ? `${regionName} 지역` : '이 지역';
  if (item.regionScope === "REGION") {
    const normalizedMemberRegionId = normalizeRegionId(memberRegionId);
    if (!normalizedMemberRegionId) {
      return isLoggedIn
        ? `${label} 회원만 참여 가능합니다.`
        : "회원가입 후 이용 가능합니다.";
    }
    return `${label} 회원만 참여 가능합니다.`;
  }
  return "";
}
