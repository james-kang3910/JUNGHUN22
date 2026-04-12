/**
 * LocalStorage 키 레지스트리
 * - 모든 localStorage 키를 중앙 관리
 * - 백업/초기화 시 이 파일을 참조
 * 
 * 분류:
 * - OPERATIONAL: 운영 데이터 (서버로 마이그레이션 대상)
 * - AUTH: 인증 관련 (서버 세션으로 전환 대상)
 * - UI_PREFERENCE: UI 설정 (로컬 유지 가능)
 * - DRAFT: 임시 작성 데이터 (로컬 유지 가능, TTL 적용)
 */

export const LOCAL_STORAGE_KEYS = {
  // ============ OPERATIONAL (운영 데이터 - 서버 마이그레이션 대상) ============
  OPERATIONAL: {
    SHOPS: 'su_shops',
    REGIONS: 'su_regions',
    MISSIONS: 'su_missions',
    EVENTS: 'su_events',
    AUDITIONS: 'su_auditions',
    NOTICES: 'su_notices',
    BROADCASTS: 'su_broadcasts',
    BANNERS: 'su_banners',
    USERS: 'su_users',
    MEMBERS_V1: 'su_members_v1',
    POINT_LEDGER: 'su_point_ledger',
  },

  // ============ AUTH (인증 - 서버 세션으로 전환 대상) ============
  AUTH: {
    ADMIN_AUTH: 'su_admin_isAdmin',
    AUTH: 'su_auth',
    AUTH_V2: 'su_auth_v2',
  },

  // ============ UI_PREFERENCE (UI 설정 - 로컬 유지 가능) ============
  UI_PREFERENCE: {
    SELECTED_REGION_ID: 'selectedRegionId',
    THEME: 'theme',
    LANGUAGE: 'language',
  },

  // ============ DRAFT (임시 작성 데이터 - 로컬 유지, TTL 적용) ============
  DRAFT: {
    AUDITION_POST_PREFIX: 'audition_post_', // + postId
    BROADCAST_DRAFT: 'broadcast_draft',
    REVIEW_DRAFT: 'review_draft',
  },
};

/**
 * 모든 키 목록 (평탄화)
 */
export const ALL_KEYS = Object.values(LOCAL_STORAGE_KEYS).reduce((acc, category) => {
  return [...acc, ...Object.values(category)];
}, []);

/**
 * 운영 데이터 키 목록 (마이그레이션 대상)
 */
export const OPERATIONAL_KEYS = Object.values(LOCAL_STORAGE_KEYS.OPERATIONAL);

/**
 * 인증 키 목록 (보안 위험, 즉시 전환 대상)
 */
export const AUTH_KEYS = Object.values(LOCAL_STORAGE_KEYS.AUTH);

/**
 * UI 설정 키 목록 (로컬 유지 가능)
 */
export const UI_PREFERENCE_KEYS = Object.values(LOCAL_STORAGE_KEYS.UI_PREFERENCE);

/**
 * Draft 키 패턴 (TTL 적용 대상)
 */
export const DRAFT_KEY_PATTERNS = Object.values(LOCAL_STORAGE_KEYS.DRAFT);

/**
 * 키가 draft 키인지 확인
 */
export function isDraftKey(key) {
  return DRAFT_KEY_PATTERNS.some(pattern => key.startsWith(pattern));
}

/**
 * 키 분류 확인
 */
export function getKeyCategory(key) {
  if (OPERATIONAL_KEYS.includes(key)) return 'OPERATIONAL';
  if (AUTH_KEYS.includes(key)) return 'AUTH';
  if (UI_PREFERENCE_KEYS.includes(key)) return 'UI_PREFERENCE';
  if (isDraftKey(key)) return 'DRAFT';
  return 'UNKNOWN';
}
