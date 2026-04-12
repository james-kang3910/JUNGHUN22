/**
 * ✅ PRODUCTION: 레거시 localStorage 더미 데이터 제거
 * 
 * 앱 시작 시 한 번만 실행하여 하드코딩된 샘플 데이터를 제거합니다.
 * 서버 DB가 SSOT(Single Source of Truth)로 작동하도록 보장합니다.
 */

// 배포마다 이 값을 올리면 모든 클라이언트의 su_* 데이터가 자동 종안됩니다.
const APP_DATA_VERSION = '20260224';
const APP_VERSION_KEY = 'su_app_data_version';

const LEGACY_KEYS = [
  'su_regions',
  'su_shops',
  'su_missions',
  'su_events',
  'su_auditions',
  'su_notices',
  'su_broadcasts',
  'su_banners',
  'su_users'
];

/**
 * localStorage의 레거시 샘플 데이터 제거
 * @param {boolean} force - true일 경우 무조건 삭제, false일 경우 샘플 데이터만 선택적 삭제
 */
export function clearLegacySampleData(force = false) {
  if (typeof window === 'undefined' || !window.localStorage) {
    console.warn('[clearLegacyData] localStorage not available');
    return;
  }

  const cleared = [];
  const SAMPLE_INDICATORS = [
    '서울 강남구',
    '서울 서초구',
    '경기 성남시',
    '부산 해운대구',
    '출석 체크',
    '리뷰 작성',
    '신규 가입 이벤트',
    '플랫폼 안내'
  ];

  LEGACY_KEYS.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      
      if (!value) return;
      
      // force 모드: 무조건 삭제
      if (force) {
        localStorage.removeItem(key);
        cleared.push(key);
        return;
      }
      
      // 샘플 데이터 감지: 특정 문자열이 포함되어 있으면 샘플로 간주
      const isSample = SAMPLE_INDICATORS.some(indicator => value.includes(indicator));
      
      if (isSample) {
        localStorage.removeItem(key);
        cleared.push(key);
      }
    } catch (e) {
      console.error(`[clearLegacyData] Failed to process ${key}:`, e);
    }
  });

  if (cleared.length > 0) {
    console.info('[clearLegacyData] ✅ Cleared legacy sample data from:', cleared);
    
    // SSOT 이벤트 발생하여 UI 갱신
    try {
      window.dispatchEvent(new CustomEvent('su:ssot:changed', {
        detail: { type: 'legacy-cleanup', keys: cleared, timestamp: Date.now() }
      }));
    } catch (e) {
      console.warn('[clearLegacyData] Failed to dispatch SSOT event:', e);
    }
  }
}

/**
 * 앱 시작 시 자동 실행
 * index.jsx에서 호출하면 됩니다.
 */
export function initProductionMode() {
  // 개발 모드에서는 경고만 표시
  if (import.meta.env.DEV) {
    console.warn('[clearLegacyData] ⚠️ DEV mode: Sample data cleanup available but not enforced');
    return;
  }
  
  // 버전 다를 때 전체 su_* 키 강제 삭제 (stale 데이터 zero-day 제거)
  try {
    const storedVersion = localStorage.getItem(APP_VERSION_KEY);
    if (storedVersion !== APP_DATA_VERSION) {
      console.info(`[clearLegacyData] 버전 변경 ${storedVersion} → ${APP_DATA_VERSION}, su_* 키 전체 승인 삭제`);
      clearLegacySampleData(true); // force=true: 무조건 삭제
      localStorage.setItem(APP_VERSION_KEY, APP_DATA_VERSION);
    } else {
      // 버전 동일해도 샘플 지시자 있으면 서택적 삭제
      clearLegacySampleData(false);
    }
  } catch (e) {
    console.warn('[clearLegacyData] 버전 체크 실패:', e);
    clearLegacySampleData(false);
  }
  
  // 서버 DB 우선 로드 플래그 설정
  try {
    sessionStorage.setItem('su:production:mode', 'true');
    sessionStorage.setItem('su:ssot:server-first', 'true');
  } catch (e) {
    console.warn('[clearLegacyData] Failed to set production flags:', e);
  }
}
