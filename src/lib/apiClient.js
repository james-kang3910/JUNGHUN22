/**
 * 🔧 표준화된 API 클라이언트
 * 
 * 목적:
 * - credentials: 'include' 강제 (세션 쿠키 전송)
 * - 응답 파싱 표준화 (JSON/텍스트 자동 처리)
 * - 에러 핸들링 표준화
 * - 개발 모드 로깅 (토글 가능)
 */

const RAW_API_BASE = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || '';
const API_BASE = String(RAW_API_BASE || '').replace(/\/+$/, '').replace(/\/api$/, '');

// 로깅 제어 (환경변수 또는 로컬스토리지로 토글)
const ENABLE_LOGGING = import.meta.env.DEV || localStorage.getItem('API_DEBUG') === 'true';

/**
 * 로깅 유틸
 */
function logRequest(method, path, options = {}) {
  if (!ENABLE_LOGGING) return;
  const timestamp = new Date().toISOString().substring(11, 23);
  console.log(
    `[${timestamp}] [API →] ${method} ${path}`,
    options.body ? `body: ${options.body.substring(0, 100)}...` : ''
  );
}

function logResponse(method, path, status, data) {
  if (!ENABLE_LOGGING) return;
  const timestamp = new Date().toISOString().substring(11, 23);
  const preview = Array.isArray(data) 
    ? `[${data.length} items]` 
    : typeof data === 'object' && data 
      ? `{${Object.keys(data).slice(0, 3).join(', ')}...}` 
      : String(data).substring(0, 50);
  console.log(`[${timestamp}] [API ✓] ${method} ${path} ${status} → ${preview}`);
}

function logError(method, path, error) {
  const timestamp = new Date().toISOString().substring(11, 23);
  console.error(`[${timestamp}] [API ✗] ${method} ${path}`, error.message || error);
}

/**
 * 표준화된 fetch 래퍼
 * @param {string} path - API 경로 (예: '/api/members')
 * @param {object} options - fetch 옵션
 * @returns {Promise<any>} 파싱된 응답 데이터
 */
async function apiFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  
  // headers를 먼저 분리하여 Content-Type + 커스텀 헤더 올바르게 병합
  const { headers: optionHeaders, ...restOptions } = options;

  // ✅ credentials: 'include' 강제 (세션 쿠키 전송)
  const fetchOptions = {
    credentials: 'include',
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...optionHeaders,
    },
  };

  logRequest(options.method || 'GET', path, fetchOptions);

  try {
    const response = await fetch(url, fetchOptions);
    
    // 응답 파싱 (JSON 우선, 실패 시 텍스트)
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (e) {
        data = await response.text();
      }
    } else {
      data = await response.text();
    }

    logResponse(options.method || 'GET', path, response.status, data);

    // 에러 응답 처리
    if (!response.ok) {
      const error = new Error(
        typeof data === 'string' 
          ? data 
          : (typeof data?.error === 'string' ? data.error : data?.error?.message) || data?.message || `API error ${response.status}`
      );
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    logError(options.method || 'GET', path, error);
    throw error;
  }
}

/**
 * GET 요청
 */
export async function apiGet(path, options = {}) {
  return apiFetch(path, { ...options, method: 'GET' });
}

/**
 * POST 요청
 */
export async function apiPost(path, body, options = {}) {
  return apiFetch(path, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT 요청
 */
export async function apiPut(path, body, options = {}) {
  return apiFetch(path, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PATCH 요청
 */
export async function apiPatch(path, body, options = {}) {
  return apiFetch(path, {
    ...options,
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE 요청
 */
export async function apiDelete(path, options = {}) {
  return apiFetch(path, { ...options, method: 'DELETE' });
}

/**
 * 범용 API 호출 (커스텀 method/body/headers)
 */
export async function apiRequest(path, options = {}) {
  return apiFetch(path, options);
}

/**
 * 🔍 응답 언랩 유틸 (서버 응답 shape 불일치 대응)
 */

/**
 * 리스트 언랩 (배열 반환 보장)
 * @param {any} response - 서버 응답
 * @param {string[]} possibleKeys - 시도할 키 목록
 * @returns {Array} 항상 배열 반환 (없으면 [])
 */
export function unwrapList(response, possibleKeys = ['data', 'members', 'items', 'rows', 'requests', 'participations']) {
  // 이미 배열이면 그대로 반환
  if (Array.isArray(response)) {
    return response;
  }

  // 객체인 경우 가능한 키 순회
  if (response && typeof response === 'object') {
    for (const key of possibleKeys) {
      if (Array.isArray(response[key])) {
        return response[key];
      }
    }
    
    // { ok: true, data: { members: [...] } } 같은 중첩 구조
    if (response.data && typeof response.data === 'object') {
      for (const key of possibleKeys) {
        if (Array.isArray(response.data[key])) {
          return response.data[key];
        }
      }
    }
  }

  // 못 찾으면 빈 배열
  return [];
}

/**
 * 객체 언랩 (단일 객체 반환)
 * @param {any} response - 서버 응답
 * @param {string[]} possibleKeys - 시도할 키 목록
 * @returns {object|null} 객체 반환 (없으면 null)
 */
export function unwrapObject(response, possibleKeys = ['data', 'member', 'item', 'request', 'participation']) {
  // 이미 객체면서 ok/success 같은 메타 키가 아니면 그대로 반환
  if (response && typeof response === 'object' && !Array.isArray(response)) {
    // { ok: true, member: {...} } 같은 래핑 확인
    for (const key of possibleKeys) {
      if (response[key] && typeof response[key] === 'object') {
        return response[key];
      }
    }
    
    // { ok: true, data: { member: {...} } } 중첩 확인
    if (response.data && typeof response.data === 'object') {
      for (const key of possibleKeys) {
        if (response.data[key] && typeof response.data[key] === 'object') {
          return response.data[key];
        }
      }
      // data 자체가 객체면 반환
      if (!Array.isArray(response.data)) {
        return response.data;
      }
    }
    
    // ok/success 같은 메타 키만 있고 데이터가 없으면 전체 반환
    const metaKeys = ['ok', 'success', 'status', 'message', 'error'];
    const dataKeys = Object.keys(response).filter(k => !metaKeys.includes(k));
    if (dataKeys.length > 0) {
      return response;
    }
  }

  return null;
}

/**
 * 에러 응답 체크
 */
export function isErrorResponse(response) {
  return response && (response.ok === false || response.success === false || response.error);
}

/**
 * 🎛️ 디버그 모드 토글
 */
export function enableApiLogging() {
  localStorage.setItem('API_DEBUG', 'true');
  console.log('[apiClient] API logging enabled');
}

export function disableApiLogging() {
  localStorage.removeItem('API_DEBUG');
  console.log('[apiClient] API logging disabled');
}
