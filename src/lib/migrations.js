/**
 * localStorage 마이그레이션: su_regions_v1 → su_regions
 * 
 * 목적: 레거시 키와 신규 키 간의 데이터 병합 및 일관성 확보
 * 실행 시점: 앱 초기화 시 (main.jsx 또는 App.jsx에서 호출)
 */

export function migrateRegionsCache() {
  try {
    const legacyKey = 'su_regions_v1';
    const canonicalKey = 'su_regions';
    
    const legacyData = localStorage.getItem(legacyKey);
    const canonicalData = localStorage.getItem(canonicalKey);
    
    // 케이스 1: v1만 있고 canonical이 없음 → v1을 canonical로 복사
    if (legacyData && !canonicalData) {
      console.log('[Migration] Migrating su_regions_v1 → su_regions');
      localStorage.setItem(canonicalKey, legacyData);
      return { migrated: true, source: 'v1', action: 'copied' };
    }
    
    // 케이스 2: 둘 다 있음 → 타임스탬프 비교하여 최신 데이터 우선
    if (legacyData && canonicalData) {
      try {
        const v1Regions = JSON.parse(legacyData);
        const canonicalRegions = JSON.parse(canonicalData);
        
        // 간단한 병합: 더 많은 데이터가 있는 쪽을 우선
        if (v1Regions.length > canonicalRegions.length) {
          console.log('[Migration] su_regions_v1 has more data, overwriting su_regions');
          localStorage.setItem(canonicalKey, legacyData);
          return { migrated: true, source: 'v1', action: 'merged (v1 priority)' };
        }
      } catch (e) {
        console.warn('[Migration] Failed to parse regions data:', e);
      }
      
      return { migrated: false, reason: 'both exist, canonical kept' };
    }
    
    // 케이스 3: canonical만 있음 → 마이그레이션 불필요
    if (!legacyData && canonicalData) {
      return { migrated: false, reason: 'already migrated' };
    }
    
    // 케이스 4: 둘 다 없음
    return { migrated: false, reason: 'no data' };
    
  } catch (error) {
    console.error('[Migration] Error during regions cache migration:', error);
    return { migrated: false, error: error.message };
  }
}

/**
 * 마이그레이션 후 레거시 키 정리 (선택 사항)
 * 주의: 충분한 검증 후에만 실행 (롤백 불가)
 */
export function cleanupLegacyRegionsCache() {
  const legacyKey = 'su_regions_v1';
  const canonicalKey = 'su_regions';
  
  // canonical 키가 있는지 확인
  if (localStorage.getItem(canonicalKey)) {
    console.log('[Cleanup] Removing legacy key:', legacyKey);
    localStorage.removeItem(legacyKey);
    return { cleaned: true };
  }
  
  console.warn('[Cleanup] Canonical key not found, skipping cleanup');
  return { cleaned: false, reason: 'canonical key missing' };
}

/**
 * 앱 초기화 시 호출할 통합 마이그레이션 함수
 */
export function runMigrations() {
  console.log('[Migration] Starting localStorage migrations...');
  
  const regionsResult = migrateRegionsCache();
  console.log('[Migration] Regions cache:', regionsResult);
  
  // 추가 마이그레이션이 필요한 경우 여기에 추가
  
  return {
    regions: regionsResult,
    timestamp: new Date().toISOString()
  };
}
