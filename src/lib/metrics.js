/**
 * 클라이언트 메트릭 추적
 * - 서버로 메트릭 전송
 * - 로컬에서 집계
 */

const API_BASE = import.meta.env.VITE_API_BASE || "";

// 메트릭 버퍼 (배치 전송용)
let metricsBuffer = [];
const FLUSH_INTERVAL = 30000; // 30초마다 전송
const MAX_BUFFER_SIZE = 50; // 50개 이상이면 즉시 전송

/**
 * 메트릭 전송
 */
async function sendMetrics(metrics) {
  try {
    await fetch(`${API_BASE}/api/metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metrics, timestamp: Date.now() }),
    });
  } catch (error) {
    console.warn('[metrics] Failed to send:', error.message);
  }
}

/**
 * 버퍼 플러시
 */
function flushMetrics() {
  if (metricsBuffer.length === 0) return;
  
  const toSend = [...metricsBuffer];
  metricsBuffer = [];
  sendMetrics(toSend);
}

/**
 * 메트릭 추적
 */
export function trackMetric(name, value = 1, tags = {}) {
  const metric = {
    name,
    value,
    tags,
    timestamp: Date.now(),
  };
  
  metricsBuffer.push(metric);
  
  // 로컬 로그 (개발 환경)
  if (import.meta.env.DEV) {
    console.log(`[Metric] ${name}=${value}`, tags);
  }
  
  // 버퍼가 가득 차면 즉시 전송
  if (metricsBuffer.length >= MAX_BUFFER_SIZE) {
    flushMetrics();
  }
}

/**
 * 메트릭 타이머 (함수 실행 시간 측정)
 */
export function trackTiming(name, tags = {}) {
  const startTime = Date.now();
  
  return {
    end: () => {
      const duration = Date.now() - startTime;
      trackMetric(name, duration, { ...tags, unit: 'ms' });
      return duration;
    }
  };
}

/**
 * API 호출 메트릭 래퍼
 */
export async function trackApiCall(apiName, apiFn) {
  const timer = trackTiming('api_call_duration', { api: apiName });
  
  try {
    const result = await apiFn();
    trackMetric('api_call_success', 1, { api: apiName });
    return result;
  } catch (error) {
    trackMetric('api_call_error', 1, { api: apiName, error: error.message });
    throw error;
  } finally {
    timer.end();
  }
}

/**
 * 자동 플러시 설정
 */
if (typeof window !== 'undefined') {
  // 주기적 플러시
  setInterval(flushMetrics, FLUSH_INTERVAL);
  
  // 페이지 언로드 시 플러시
  window.addEventListener('beforeunload', () => {
    flushMetrics();
  });
  
  // Visibility API로 백그라운드 전환 시 플러시
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushMetrics();
    }
  });
}

/**
 * 미리 정의된 메트릭들
 */
export const METRICS = {
  // Sync 관련
  SYNC_FAIL: 'sync_fail_rate',
  SYNC_SUCCESS: 'sync_success',
  SYNC_DURATION: 'sync_duration',
  
  // Auth 관련
  AUTH_REFRESH_FAIL: 'auth_refresh_fail',
  AUTH_LOGIN_SUCCESS: 'auth_login_success',
  AUTH_LOGOUT: 'auth_logout',
  
  // Admin 관련
  ADMIN_WRITE_ERROR: 'admin_write_error',
  ADMIN_READ_ERROR: 'admin_read_error',
  ADMIN_WRITE_SUCCESS: 'admin_write_success',
  
  // Migration 관련
  MIGRATION_CONFLICT: 'migration_conflict_count',
  MIGRATION_SUCCESS: 'migration_success',
  
  // 데이터 소스
  DATA_SOURCE_SERVER: 'data_source_server',
  DATA_SOURCE_LOCAL: 'data_source_local',
};

/**
 * 브라우저 콘솔 헬퍼
 */
if (typeof window !== 'undefined') {
  window.metricsTracker = {
    track: trackMetric,
    timing: trackTiming,
    flush: flushMetrics,
    buffer: () => metricsBuffer,
    clear: () => { metricsBuffer = []; },
  };
}
