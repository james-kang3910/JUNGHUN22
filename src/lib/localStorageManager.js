/**
 * LocalStorage 관리 유틸리티
 * - 백업/복원
 * - 초기화
 * - TTL 적용
 * - 마이그레이션 지원
 */

import {
  ALL_KEYS,
  OPERATIONAL_KEYS,
  AUTH_KEYS,
  UI_PREFERENCE_KEYS,
  DRAFT_KEY_PATTERNS,
  isDraftKey,
  getKeyCategory,
} from './localStorageKeys';

/**
 * 모든 알려진 키 백업
 */
export function backupAllKeys() {
  const backup = {
    timestamp: new Date().toISOString(),
    version: '1.0',
    data: {},
  };

  ALL_KEYS.forEach(key => {
    const value = localStorage.getItem(key);
    if (value !== null) {
      backup.data[key] = value;
    }
  });

  // Draft 키들도 백업 (패턴 매칭)
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && isDraftKey(key) && !backup.data[key]) {
      backup.data[key] = localStorage.getItem(key);
    }
  }

  return backup;
}

/**
 * 카테고리별 백업
 */
export function backupByCategory(category) {
  const backup = {
    timestamp: new Date().toISOString(),
    category,
    data: {},
  };

  let keys = [];
  switch (category) {
    case 'OPERATIONAL':
      keys = OPERATIONAL_KEYS;
      break;
    case 'AUTH':
      keys = AUTH_KEYS;
      break;
    case 'UI_PREFERENCE':
      keys = UI_PREFERENCE_KEYS;
      break;
    default:
      console.warn(`[backupByCategory] Unknown category: ${category}`);
      return backup;
  }

  keys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value !== null) {
      backup.data[key] = value;
    }
  });

  return backup;
}

/**
 * 백업에서 복원
 */
export function restoreFromBackup(backup) {
  if (!backup || !backup.data) {
    console.error('[restoreFromBackup] Invalid backup format');
    return { success: false, error: 'Invalid backup format' };
  }

  let restored = 0;
  let failed = 0;

  Object.entries(backup.data).forEach(([key, value]) => {
    try {
      localStorage.setItem(key, value);
      restored++;
    } catch (error) {
      console.error(`[restoreFromBackup] Failed to restore key ${key}:`, error);
      failed++;
    }
  });

  return {
    success: true,
    restored,
    failed,
    timestamp: backup.timestamp,
  };
}

/**
 * 카테고리별 키 초기화
 */
export function clearByCategory(category) {
  let keys = [];
  
  switch (category) {
    case 'OPERATIONAL':
      keys = OPERATIONAL_KEYS;
      break;
    case 'AUTH':
      keys = AUTH_KEYS;
      break;
    case 'UI_PREFERENCE':
      keys = UI_PREFERENCE_KEYS;
      break;
    case 'ALL':
      keys = ALL_KEYS;
      break;
    default:
      console.warn(`[clearByCategory] Unknown category: ${category}`);
      return { success: false, error: 'Unknown category' };
  }

  let cleared = 0;
  keys.forEach(key => {
    if (localStorage.getItem(key) !== null) {
      localStorage.removeItem(key);
      cleared++;
    }
  });

  // Draft 키들도 초기화 (category === 'ALL')
  if (category === 'ALL') {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && isDraftKey(key)) {
        localStorage.removeItem(key);
        cleared++;
      }
    }
  }

  return {
    success: true,
    cleared,
  };
}

/**
 * TTL이 지난 Draft 키 정리
 */
export function cleanupExpiredDrafts(maxAgeMs = 7 * 24 * 60 * 60 * 1000) {
  // 기본: 7일 이상 된 draft 삭제
  let cleaned = 0;
  const now = Date.now();

  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && isDraftKey(key)) {
      try {
        const value = localStorage.getItem(key);
        const data = JSON.parse(value);
        
        // createdAt 또는 updatedAt 필드 확인
        const timestamp = data.createdAt || data.updatedAt || data.timestamp;
        if (timestamp) {
          const age = now - new Date(timestamp).getTime();
          if (age > maxAgeMs) {
            localStorage.removeItem(key);
            cleaned++;
          }
        }
      } catch (error) {
        // JSON 파싱 실패 시 무시
      }
    }
  }

  return { cleaned };
}

/**
 * 저장소 상태 분석
 */
export function analyzeStorage() {
  const analysis = {
    total: localStorage.length,
    byCategory: {
      OPERATIONAL: 0,
      AUTH: 0,
      UI_PREFERENCE: 0,
      DRAFT: 0,
      UNKNOWN: 0,
    },
    keys: [],
  };

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const category = getKeyCategory(key);
      const value = localStorage.getItem(key);
      const size = value ? value.length : 0;

      analysis.keys.push({
        key,
        category,
        size,
        sizeKB: (size / 1024).toFixed(2),
      });

      analysis.byCategory[category]++;
    }
  }

  // 크기순 정렬
  analysis.keys.sort((a, b) => b.size - a.size);

  return analysis;
}

/**
 * 마이그레이션 준비: 운영 데이터 추출 (서버 업로드용)
 */
export function exportOperationalData() {
  const exportData = {
    timestamp: new Date().toISOString(),
    version: '1.0',
    data: {},
  };

  OPERATIONAL_KEYS.forEach(key => {
    const value = localStorage.getItem(key);
    if (value !== null) {
      try {
        exportData.data[key] = JSON.parse(value);
      } catch (error) {
        console.warn(`[exportOperationalData] Failed to parse ${key}:`, error);
        exportData.data[key] = value; // 원본 저장
      }
    }
  });

  return exportData;
}

/**
 * JSON 파일로 백업 다운로드
 */
export function downloadBackup(filename = `localStorage-backup-${Date.now()}.json`) {
  const backup = backupAllKeys();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 브라우저 콘솔용 헬퍼 (window에 노출)
 */
export function setupConsoleHelpers() {
  if (typeof window !== 'undefined') {
    window.localStorageManager = {
      backup: backupAllKeys,
      backupByCategory,
      restore: restoreFromBackup,
      clear: clearByCategory,
      analyze: analyzeStorage,
      export: exportOperationalData,
      download: downloadBackup,
      cleanupDrafts: cleanupExpiredDrafts,
    };
    console.log('[localStorageManager] Console helpers available: window.localStorageManager');
  }
}
