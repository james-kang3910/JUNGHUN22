// ✅ Phase 1: 표준화된 API 클라이언트 사용
import { 
  apiGet, 
  apiPost, 
  apiPut, 
  apiPatch, 
  apiDelete,
  unwrapList as unwrapListNew,
  unwrapObject as unwrapObjectNew 
} from './apiClient.js';

const RAW_API_BASE = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || "";
const API_BASE = String(RAW_API_BASE || "").replace(/\/+$/, '').replace(/\/api$/, '');

const IS_DEV = import.meta.env.DEV;
// noop log functions in production — removes heavy console output from mobile runtime
const logDetailedRequest = IS_DEV ? (method, url) => console.log(`[REQ] ${method} ${url}`) : () => {};
const logDetailedResponse = IS_DEV ? (method, url, response) => console.log(`[RES] ${method} ${url}`, response.status) : () => {};
const logDetailedError = IS_DEV ? (method, url, error) => console.error(`[ERR] ${method} ${url}`, error.message) : () => {};
const logAPI = IS_DEV ? (op, url, params, ok, result) => console.log(`[API] ${op}`, url, ok ? 'OK' : 'FAIL') : () => {};
const logRequest = IS_DEV ? (method, url) => console.log(`[REQ] ${method}`, url) : () => {};

async function checkStatus(res) {
  if (!res.ok) {
    const t = await res.text();
    // JSON 응답에서 error 메시지만 추출 — 내부 구조 노출 방지
    let userMsg = `요청 처리 중 오류가 발생했습니다. (${res.status})`;
    try {
      const j = JSON.parse(t);
      if (j?.error && typeof j.error === 'string') userMsg = j.error;
      else if (j?.message && typeof j.message === 'string') userMsg = j.message;
    } catch { /* JSON 파싱 실패 시 기본 메시지 사용 */ }
    const err = new Error(userMsg);
    err.status = res.status;
    err.statusText = res.statusText;
    err.responseText = t;
    throw err;
  }
  return res.json();
}

function unwrapList(result, key) {
  if (Array.isArray(result)) return result;
  if (result && typeof result === 'object') {
    if (Array.isArray(result[key])) return result[key];
    if (result.data && Array.isArray(result.data[key])) return result.data[key];
  }
  return [];
}

function unwrapItem(result, key) {
  if (result && typeof result === 'object') {
    if (result[key] !== undefined) return result[key];
    if (result.data && result.data[key] !== undefined) return result.data[key];
  }
  return null;
}

function notifySsotChange(detail = {}) {
  const payload = { ...detail, timestamp: Date.now() };
  try {
    window.dispatchEvent(new CustomEvent('su:ssot:changed', { detail: payload }));
  } catch (e) {}
  try {
    const key = `su:ssot:${detail.type || 'general'}`;
    localStorage.setItem(key, JSON.stringify(payload));
  } catch (e) {}
}

function normalizeLegacyNoticeId(notice) {
  if (!notice || typeof notice !== 'object') return notice;
  const nextId = notice.id
    || notice.noticeId
    || notice.notice_id
    || ((notice.scope === 'REGION' || notice.scope === 'region') && notice.regionId && /지역 포탈에 오신 것을 환영합니다!?$/.test(String(notice.title || '').trim())
      ? `notice_region_welcome_${String(notice.regionId).trim()}`
      : null);
  return {
    ...notice,
    id: nextId,
    isPopup: notice.isPopup !== undefined ? !!notice.isPopup : !!notice.is_popup,
  };
}

export async function getMembers() {
  try {
    const result = await apiGet('/api/members', { headers: _sessionAuthHeader() });
    return unwrapListNew(result, ['members', 'data']);
  } catch (error) {
    console.error('[getMembers] Error:', error.message);
    throw error;
  }
}

export async function upsertMember(member) {
  // New semantics: if member has an id/memberId -> update by id, else create
  if (member && (member.memberId || member.id)) {
    const id = member.memberId || member.id;
    const res = await fetch(`${API_BASE}/api/members/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member),
    });
    return checkStatus(res);
  }
  // create
  const res = await fetch(`${API_BASE}/api/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(member),
  });
  return checkStatus(res);
}

export async function createMember(member) {
  const res = await fetch(`${API_BASE}/api/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(member),
  });
  return checkStatus(res);
}

export async function updateMemberById(memberId, updates) {
  // Validate payload is not empty
  if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) {
    throw new Error('updateMemberById: updates payload is empty or invalid');
  }
  const res = await fetch(`${API_BASE}/api/members/${encodeURIComponent(memberId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ..._adminAuthHeader() },
    credentials: 'include',
    body: JSON.stringify(updates),
  });
  return checkStatus(res);
}

/** PATCH /api/members/:id — 회원 정보 부분 수정 (name, phone, address, status 등, id 불변) */
export async function patchMember(memberId, updates) {
  if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) {
    throw new Error('patchMember: updates payload is empty or invalid');
  }
  console.log('[patchMember] request', { memberId, updates });
  try {
    const res = await fetch(`${API_BASE}/api/members/${encodeURIComponent(memberId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ..._adminAuthHeader() },
      credentials: 'include',
      body: JSON.stringify(updates),
    });
    const data = await checkStatus(res);
    console.log('[patchMember] response', { memberId, data });
    return data;
  } catch (error) {
    console.error('[patchMember] patch error', { memberId, updates, error: error.message });
    if (String(error?.message || '').toLowerCase().includes('no fields to update')) {
      const retryPayload = {
        memberId,
        ...updates,
        ...(updates.sdMark !== undefined ? { sd_mark: updates.sdMark } : {}),
      };
      console.log('[patchMember] retry with PUT', { memberId, retryPayload });
      const retryRes = await fetch(`${API_BASE}/api/members/${encodeURIComponent(memberId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(retryPayload),
      });
      const retryData = await checkStatus(retryRes);
      console.log('[patchMember] retry response', { memberId, retryData });
      return retryData;
    }
    throw error;
  }
}

export async function deleteMember(memberId) {
  // ✅ apiClient 사용: credentials 자동 포함
  try {
    const result = await apiDelete(`/api/members/${encodeURIComponent(memberId)}`);
    return result;
  } catch (error) {
    console.error('[deleteMember] Error:', error.message);
    throw error;
  }
}

// ── 역할 관리 (관리자 전용) ──────────────────────────────
function _adminAuthHeader() {
  const token = sessionStorage.getItem('su_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function _sessionAuthHeader() {
  try {
    const session = typeof window !== 'undefined' ? window.__SU_SESSION__ : null;
    const token = session?.token || null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (e) {
    return {};
  }
}

function _memberOrAdminAuthHeader() {
  const sessionHeader = _sessionAuthHeader();
  if (sessionHeader.Authorization) return sessionHeader;
  return _adminAuthHeader();
}

/** 회원 역할 변경 (USER / REGION_ADMIN / ADMIN / SUPER_ADMIN) */
export async function setMemberRole(memberId, role) {
  try {
    return await apiPatch(`/api/admin/members/${encodeURIComponent(memberId)}/role`, { role }, {
      headers: _adminAuthHeader(),
    });
  } catch (error) {
    console.error('[setMemberRole] Error:', error.message);
    throw error;
  }
}

/** 관리자 임시 비밀번호 발급 (1회 표시) */
export async function resetMemberPassword(memberId) {
  try {
    return await apiPost(`/api/admin/members/${encodeURIComponent(memberId)}/reset-password`, {}, {
      headers: _adminAuthHeader(),
    });
  } catch (error) {
    console.error('[resetMemberPassword] Error:', error.message);
    throw error;
  }
}

/** 비밀번호 변경 (임시 비밀번호 교체 포함) */
export async function changePassword({ email, currentPassword, newPassword }) {
  const res = await fetchWithRetry(`${API_BASE}/api/auth/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, currentPassword, newPassword }),
  });
  return res;
}

/** 지역관리자 배정 목록 조회 */
export async function getMemberRegionAssignments(memberId) {
  try {
    const result = await apiGet(`/api/admin/members/${encodeURIComponent(memberId)}/region-assignments`, {
      headers: _adminAuthHeader(),
    });
    return result?.assignments || [];
  } catch (error) {
    console.error('[getMemberRegionAssignments] Error:', error.message);
    throw error;
  }
}

/** 지역관리자 지역 배정 추가 */
export async function addMemberRegionAssignment(memberId, regionId) {
  try {
    return await apiPost(`/api/admin/members/${encodeURIComponent(memberId)}/region-assignments`, { regionId }, {
      headers: _adminAuthHeader(),
    });
  } catch (error) {
    console.error('[addMemberRegionAssignment] Error:', error.message);
    throw error;
  }
}

/** 지역관리자 지역 배정 제거 */
export async function removeMemberRegionAssignment(memberId, regionId) {
  try {
    return await apiDelete(`/api/admin/members/${encodeURIComponent(memberId)}/region-assignments/${encodeURIComponent(regionId)}`, {
      headers: _adminAuthHeader(),
    });
  } catch (error) {
    console.error('[removeMemberRegionAssignment] Error:', error.message);
    throw error;
  }
}

export async function getMemberById(memberId) {
  try {
    const result = await apiGet(`/api/members/${encodeURIComponent(memberId)}`);
    // result = { ok: true, success: true, member: {...} } — member 키로 직접 추출
    return result?.member || result;
  } catch (error) {
    console.error('[getMemberById] Error:', error.message);
    throw error;
  }
}

export async function getSession(sessionId) {
  try {
    return await apiGet(`/api/session?sessionId=${encodeURIComponent(sessionId)}`);
  } catch (error) {
    console.error('[getSession] Error:', error.message);
    throw error;
  }
}

export async function setSession(session) {
  try {
    return await apiPost('/api/session', session);
  } catch (error) {
    console.error('[setSession] Error:', error.message);
    throw error;
  }
}

export async function clearSession(sessionId) {
  try {
    return await apiDelete(`/api/session?sessionId=${encodeURIComponent(sessionId)}`);
  } catch (error) {
    console.error('[clearSession] Error:', error.message);
    throw error;
  }
}

/**
 * Auth API
 */
export async function login(credentials) {
  const payload = credentials || {};
  const res = await fetchWithRetry(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res;
}

export async function register(payload) {
  const body = payload || {};
  const res = await fetchWithRetry(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res;
}

export async function logout(token) {
  return fetchWithRetry(`${API_BASE}/api/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ token }),
  });
}

export async function getCurrentUser(token) {
  return fetchWithRetry(`${API_BASE}/api/auth/me`, {
    method: 'GET',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });
}

/**
 * ========================================
 * Admin Auth API
 * ========================================
 */

/**
 * Admin 로그인
 */
export async function adminLogin(password, memberId) {
  try {
    return await apiPost('/api/admin/auth/login', { password, memberId });
  } catch (error) {
    console.error('[adminLogin] Error:', error.message);
    throw error;
  }
}

/**
 * Admin 로그아웃
 */
export async function adminLogout(token) {
  try {
    return await apiPost('/api/admin/auth/logout', { token }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  } catch (error) {
    console.error('[adminLogout] Error:', error.message);
    throw error;
  }
}

/**
 * Admin 세션 검증
 */
export async function verifyAdminSession(token) {
  try {
    return await apiGet('/api/admin/auth/verify', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  } catch (error) {
    console.error('[verifyAdminSession] Error:', error.message);
    throw error;
  }
}

/**
 * Retry helper for API calls
 */
// 🔧 Phase 4: userId/memberId 단일화 - 전역 effectiveUserId 추출
function getEffectiveUserId() {
  try {
    // SSOT: localStorage 금지. 메모리 기반 세션만 허용.
    // authStore가 로그인 성공 시 window.__SU_SESSION__ 를 세팅한다.
    const s = (typeof window !== 'undefined') ? window.__SU_SESSION__ : null;
    if (s && s.memberId) return s.memberId;
  } catch (e) {
    console.warn('[storageAdapter] Failed to get effectiveUserId:', e);
  }
  return null;
}

function requireLoggedInMemberId() {
  const memberId = getEffectiveUserId();
  if (!memberId) throw new Error('로그인이 필요합니다.');
  return memberId;
}

async function fetchWithRetry(url, options, maxRetries) {
  // GET 요청은 1회만 시도 (재시도 시 불필요한 2.5초 지연 방지)
  // POST/PUT/PATCH/DELETE 등 변경 요청만 2회까지 재시도
  const method = String(options?.method || 'GET').toUpperCase();
  const effectiveMaxRetries = maxRetries !== undefined ? maxRetries
    : (method === 'GET' ? 1 : 2);

  let lastError;
  const effectiveUserId = getEffectiveUserId();
  const enhancedOptions = {
    ...options,
    credentials: options?.credentials || 'include',
    headers: {
      ...options?.headers,
      ...(effectiveUserId ? { 'x-member-id': effectiveUserId } : {})
    }
  };

  for (let i = 0; i < effectiveMaxRetries; i++) {
    try {
      const res = await fetch(url, enhancedOptions);
      return await checkStatus(res);
    } catch (error) {
      lastError = error;
      if (IS_DEV) console.warn(`[storageAdapter] Retry ${i + 1}/${effectiveMaxRetries} for ${url}:`, error.message);
      if (i < effectiveMaxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }
  throw lastError;
}

/**
 * Shops API
 */
export async function getShops(params = {}) {
  const search = new URLSearchParams();
  if (params.ownerId) search.set('ownerId', params.ownerId);
  if (params.memberId) search.set('memberId', params.memberId);
  if (params.regionId) search.set('regionId', params.regionId);
  if (params.districtId) search.set('districtId', params.districtId);
  const qs = search.toString() ? `?${search.toString()}` : '';
  const result = await fetchWithRetry(`${API_BASE}/api/shops${qs}`, { method: 'GET' });
  return unwrapList(result, 'shops');
}

export async function getMyShops(memberId) {
  if (!memberId) {
    console.warn('[getMyShops] No memberId provided');
    return [];
  }
  const result = await fetchWithRetry(`${API_BASE}/api/shops/my`, { 
    method: 'GET',
    headers: { 'x-member-id': memberId }
  });
  return unwrapList(result, 'shops');
}

export async function getShopById(shopId) {
  const result = await fetchWithRetry(`${API_BASE}/api/shops/${encodeURIComponent(shopId)}`, { method: 'GET' });
  return unwrapItem(result, 'shop') || result;
}

export async function upsertShop(shop, memberId) {
  // Server /api/shops supports upsert via POST with ON CONFLICT
  const url = `${API_BASE}/api/shops`;
  const headers = { 'Content-Type': 'application/json' };
  if (memberId) headers['x-member-id'] = memberId;

  const result = await fetchWithRetry(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(shop),
  });
  
  // ✅ SSOT 이벤트 발생 (My 페이지 즉시 반영)
  window.dispatchEvent(new CustomEvent('su:ssot:changed', {
    detail: { type: 'shops', operation: shop.id ? 'update' : 'create', data: result }
  }));
  
  return result;
}

export async function deleteShop(shopId) {
  const token = window.__SU_SESSION__?.token || '';
  const result = await fetchWithRetry(`${API_BASE}/api/shops/${encodeURIComponent(shopId)}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  });
  
  // ✅ SSOT 이벤트 발생
  window.dispatchEvent(new CustomEvent('su:ssot:changed', {
    detail: { type: 'shops', operation: 'delete', shopId }
  }));
  
  return result;
}

export async function patchShop(shopId, updates, memberId) {
  if (!memberId) {
    throw new Error('memberId is required for shop update');
  }

  const result = await fetchWithRetry(`${API_BASE}/api/shops/${encodeURIComponent(shopId)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-member-id': memberId,
    },
    body: JSON.stringify(updates),
  });

  // ✅ SSOT 이벤트 발생
  window.dispatchEvent(new CustomEvent('su:ssot:changed', {
    detail: { type: 'shops', operation: 'update', shopId, updates }
  }));

  return result;
}

// PUT /api/shops/:id - SSOT: 상점 수정은 서버 성공 후 refetch로만 반영
export async function updateShop(shopId, updates, memberId) {
  if (!shopId) throw new Error('updateShop: shopId required');
  if (!memberId) throw new Error('updateShop: memberId required');
  if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) {
    throw new Error('updateShop: updates payload is empty or invalid');
  }

  const url = `${API_BASE}/api/shops/${encodeURIComponent(shopId)}`;
  try {
    const result = await fetchWithRetry(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-member-id': memberId,
      },
      body: JSON.stringify(updates),
    });
    logAPI('updateShop', url, { shopId, updates }, true, result);
    return result;
  } catch (error) {
    logAPI('updateShop', url, { shopId, updates }, false, error);
    throw error;
  }
}

// ============================================
// SHOP EVENTS API
// ============================================

function notifyShopEventsChanged(operation, payload = {}) {
  const detail = { type: 'shop-events', operation, ...payload };
  try {
    window.dispatchEvent(new CustomEvent('su:ssot:changed', { detail }));
  } catch (e) {}
  try {
    localStorage.setItem('su:shop-events:ssot', JSON.stringify({ ...detail, timestamp: Date.now() }));
  } catch (e) {}
}

// GET /api/shop-events?active=true — 진행 중 이벤트 목록
// GET /api/shop-events?shopId=xxx — 특정 상점 이벤트
export async function getShopEvents({ shopId, active } = {}) {
  const params = new URLSearchParams();
  if (shopId) params.set('shopId', shopId);
  if (active) params.set('active', 'true');
  const url = `${API_BASE}/api/shop-events${params.toString() ? '?' + params : ''}`;
  const result = await fetchWithRetry(url, { method: 'GET' });
  return Array.isArray(result) ? result : [];
}

// POST /api/shop-events
export async function createShopEvent(data, token, memberId) {
  const url = `${API_BASE}/api/shop-events`;
  const payload = data || {};
  console.log('[SHOP-EVENT-CREATE-REQUEST]', {
    url,
    payload,
    hasToken: !!token,
    memberId: memberId || null,
    apiBase: API_BASE || '(empty)'
  });
  try {
    const result = await fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(memberId ? { 'x-member-id': memberId } : {}),
      },
      body: JSON.stringify(payload),
    });
    notifyShopEventsChanged('create', {
      eventId: result?.eventId || null,
      shopId: payload.shopId || null,
    });
    return result;
  } catch (error) {
    console.log('[SHOP-EVENT-CREATE-FAIL]', {
      url,
      status: error?.status || null,
      statusText: error?.statusText || null,
      message: error?.message || null,
      responseText: error?.responseText || null,
      apiBase: API_BASE || '(empty)'
    });
    throw error;
  }
}

// PUT /api/shop-events/:id
export async function updateShopEvent(eventId, data, token, memberId) {
  const url = `${API_BASE}/api/shop-events/${encodeURIComponent(eventId)}`;
  const result = await fetchWithRetry(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(memberId ? { 'x-member-id': memberId } : {}),
    },
    body: JSON.stringify(data),
  });
  notifyShopEventsChanged('update', {
    eventId,
    shopId: data?.shopId || null,
  });
  return result;
}

// DELETE /api/shop-events/:id
export async function deleteShopEvent(eventId, token, memberId) {
  const url = `${API_BASE}/api/shop-events/${encodeURIComponent(eventId)}`;
  const result = await fetchWithRetry(url, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(memberId ? { 'x-member-id': memberId } : {}),
    },
  });
  notifyShopEventsChanged('delete', { eventId });
  return result;
}

// POST /api/shop-events/:id/image — 이미지 업로드
export async function uploadShopEventImage(eventId, file, token, memberId) {
  const url = `${API_BASE}/api/shop-events/${encodeURIComponent(eventId)}/image`;
  const formData = new FormData();
  formData.append('image', file);
  const result = await fetchWithRetry(url, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(memberId ? { 'x-member-id': memberId } : {}),
    },
    body: formData,
  });
  notifyShopEventsChanged('update-image', { eventId });
  return result;
}

// PATCH /api/shop-events/:id/status — 이벤트 승인/반려 (관리자 전용)
export async function updateShopEventStatus(eventId, status, rejectReason, token) {
  const url = `${API_BASE}/api/shop-events/${encodeURIComponent(eventId)}/status`;
  const result = await fetchWithRetry(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ status, rejectReason: rejectReason || null }),
  });
  notifyShopEventsChanged('status', { eventId, status });
  return result;
}

// GET /api/shop-events (관리자용 전체 목록 — status 필터 포함)
export async function getAllShopEvents({ shopId, status } = {}) {
  const params = new URLSearchParams();
  if (shopId) params.set('shopId', shopId);
  if (status) params.set('status', status);
  const url = `${API_BASE}/api/shop-events${params.toString() ? '?' + params : ''}`;
  const result = await fetchWithRetry(url, { method: 'GET' });
  return Array.isArray(result) ? result : [];
}

// GET /api/shops/:shopId/qr - 서명된 QR payload 발급
export async function issueShopQrPayload(shopId) {
  if (!shopId) throw new Error('issueShopQrPayload: shopId required');
  const url = `${API_BASE}/api/shops/${encodeURIComponent(shopId)}/qr`;
  try {
    const result = await fetchWithRetry(url, { method: 'GET' });
    logAPI('issueShopQrPayload', url, { shopId }, true, result);
    return result;
  } catch (error) {
    logAPI('issueShopQrPayload', url, { shopId }, false, error);
    throw error;
  }
}

// POST /api/payments/qr - QR 결제 처리 (서명 검증 후 적립)
export async function payWithQrPayload(qrPayload, amount, memberId) {
  if (!qrPayload) throw new Error('payWithQrPayload: qrPayload required');
  const amt = Number(amount);
  if (!Number.isFinite(amt) || amt <= 0) throw new Error('payWithQrPayload: valid amount required');

  const url = `${API_BASE}/api/payments/qr`;
  const payload = { qrPayload, amount: Math.trunc(amt) };
  try {
    const result = await fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ..._sessionAuthHeader(),
        ...(memberId ? { 'x-member-id': String(memberId) } : {}),
      },
      body: JSON.stringify(payload),
    });
    logAPI('payWithQrPayload', url, payload, true, result);
    return result;
  } catch (error) {
    logAPI('payWithQrPayload', url, payload, false, error);
    throw error;
  }
}

/**
 * Missions API (Legacy - basic CRUD operations)
 * Note: getMissions() and getMissionById() are now in PV3 완전 복원 section (line ~1333)
 */
export async function upsertMission(mission) {
  const regionScope = mission.regionScope === 'REGION' ? 'REGION' : 'ALL';
  let regionIds = mission.regionIds;
  if (regionScope === "REGION") {
    if (Array.isArray(regionIds)) {
      regionIds = regionIds.length > 0 ? regionIds : [mission.regionId];
    } else if (typeof regionIds === "string") {
      regionIds = [regionIds];
    } else {
      regionIds = [mission.regionId];
    }
  } else {
    regionIds = [];
  }
  const payload = {
    ...mission,
    regionScope,
    regionIds,
  };
  const method = mission.id ? 'PUT' : 'POST';
  const url = mission.id ? `${API_BASE}/api/missions/${encodeURIComponent(mission.id)}` : `${API_BASE}/api/missions`;
  const result = await fetchWithRetry(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  clearMissionsCache();
  return result;
}

export async function deleteMission(missionId) {
  const result = await fetchWithRetry(`${API_BASE}/api/missions/${encodeURIComponent(missionId)}`, { method: 'DELETE' });
  clearMissionsCache();
  window.dispatchEvent(new CustomEvent('su:ssot:changed', {
    detail: { type: 'missions', operation: 'delete', missionId }
  }));
  return result;
}

/**
 * Events API
 */
let _eventsCacheData = null;
let _eventsCacheAt = 0;
const EVENTS_CACHE_TTL = 60000;

export async function getEvents(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.regionId) queryParams.append('regionId', params.regionId);
  if (params.districtId) queryParams.append('districtId', params.districtId);
  const url = `${API_BASE}/api/events${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  // 파라미터 없는 전체 조회만 캐시 적용
  const useCache = !params.regionId && !params.districtId;
  if (useCache) {
    const now = Date.now();
    if (_eventsCacheData && (now - _eventsCacheAt) < EVENTS_CACHE_TTL) return _eventsCacheData;
  }
  const result = await fetchWithRetry(url, { method: 'GET' });
  if (useCache) { _eventsCacheData = result; _eventsCacheAt = Date.now(); }
  return result;
}

export function clearEventsCache() { _eventsCacheData = null; _eventsCacheAt = 0; }

export async function getEventById(eventId) {
  return fetchWithRetry(`${API_BASE}/api/events/${encodeURIComponent(eventId)}`, { method: 'GET' });
}

export async function upsertEvent(event) {
  const regionScope = event.regionScope === 'REGION' ? 'REGION' : 'ALL';
  let regionIds = event.regionIds;
  if (regionScope === "REGION") {
    if (Array.isArray(regionIds)) {
      regionIds = regionIds.length > 0 ? regionIds : [event.regionId];
    } else if (typeof regionIds === "string") {
      regionIds = [regionIds];
    } else {
      regionIds = [event.regionId];
    }
  } else {
    regionIds = [];
  }
  const payload = {
    ...event,
    regionScope,
    regionIds,
  };
  const method = event.id ? 'PUT' : 'POST';
  const url = event.id ? `${API_BASE}/api/events/${encodeURIComponent(event.id)}` : `${API_BASE}/api/events`;
  const result = await fetchWithRetry(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  clearEventsCache();
  return result;
}

export async function deleteEvent(eventId) {
  const result = await fetchWithRetry(`${API_BASE}/api/events/${encodeURIComponent(eventId)}`, { method: 'DELETE' });
  clearEventsCache();
  window.dispatchEvent(new CustomEvent('su:ssot:changed', {
    detail: { type: 'events', operation: 'delete', eventId }
  }));
  return result;
}

/**
 * Auditions API
 */
export async function getAuditions(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.regionId) queryParams.append('regionId', params.regionId);
  if (params.districtId) queryParams.append('districtId', params.districtId);
  if (params.status) queryParams.append('status', params.status);
  
  const url = queryParams.toString()
    ? `${API_BASE}/api/auditions?${queryParams}`
    : `${API_BASE}/api/auditions`;
  
  return fetchWithRetry(url, { method: 'GET' });
}

export async function getAuditionHighlights() {
  return fetchWithRetry(`${API_BASE}/api/auditions/highlights`, { method: 'GET' });
}

export async function getAuditionById(auditionId) {
  return fetchWithRetry(`${API_BASE}/api/auditions/${encodeURIComponent(auditionId)}`, { method: 'GET' });
}

export async function upsertAudition(audition) {
  const method = audition.id || audition.auditionId ? 'PUT' : 'POST';
  const id = audition.id || audition.auditionId;
  const url = id ? `${API_BASE}/api/auditions/${encodeURIComponent(id)}` : `${API_BASE}/api/auditions`;
  const result = await fetchWithRetry(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(audition),
  });
  window.dispatchEvent(new CustomEvent('su:ssot:changed', {
    detail: { type: 'auditions', operation: id ? 'update' : 'create', auditionId: id || result?.auditionId || null }
  }));
  return result;
}

export async function deleteAudition(auditionId) {
  const result = await fetchWithRetry(`${API_BASE}/api/auditions/${encodeURIComponent(auditionId)}`, { method: 'DELETE' });
  window.dispatchEvent(new CustomEvent('su:ssot:changed', {
    detail: { type: 'auditions', operation: 'delete', auditionId }
  }));
  return result;
}

/**
 * Regions API — TTL 캐시로 중복 호출 방지 (60초)
 */
let _regionsCacheData = null;
let _regionsCacheAt = 0;
const REGIONS_CACHE_TTL = 60000;

export async function getRegions({ forceRefresh = false } = {}) {
  const now = Date.now();
  if (!forceRefresh && _regionsCacheData && (now - _regionsCacheAt) < REGIONS_CACHE_TTL) {
    return _regionsCacheData;
  }
  const result = await fetchWithRetry(`${API_BASE}/api/regions`, { method: 'GET' });
  const regions = unwrapList(result, 'regions');
  const normalized = regions.map((r, index) => ({
    ...r,
    id: r.id
      || r.regionId
      || r.region_id
      || `${(r.province || 'unknown').toLowerCase().replace(/\s+/g, '-')}-${(r.city || r.district || r.name || `region-${index}`).toLowerCase().replace(/\s+/g, '-')}`,
    city: r.city || r.district || '',
    district: r.district || r.city || ''
  }));
  _regionsCacheData = normalized;
  _regionsCacheAt = Date.now();
  return normalized;
}

export function clearRegionsCache() {
  _regionsCacheData = null;
  _regionsCacheAt = 0;
}

export async function getRegionById(regionId) {
  return fetchWithRetry(`${API_BASE}/api/regions/${encodeURIComponent(regionId)}`, { method: 'GET' });
}

export async function upsertRegion(region) {
  const method = region.id ? 'PUT' : 'POST';
  const url = region.id ? `${API_BASE}/api/regions/${encodeURIComponent(region.id)}` : `${API_BASE}/api/regions`;
  const result = await fetchWithRetry(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(region),
  });
  notifySsotChange({ type: 'regions', operation: region.id ? 'update' : 'create', regionId: region.id || result?.id || result?.regionId || null });
  return result;
}

export async function deleteRegion(regionId) {
  const result = await fetchWithRetry(`${API_BASE}/api/regions/${encodeURIComponent(regionId)}`, { method: 'DELETE' });
  notifySsotChange({ type: 'regions', operation: 'delete', regionId });
  return result;
}

/**
 * Toggle region public status on server
 */
export async function setRegionPublic(regionId, isPublic) {
  const url = `${API_BASE}/api/regions/${encodeURIComponent(regionId)}/public`;
  const result = await fetchWithRetry(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isPublic }),
  });
  notifySsotChange({ type: 'regions', operation: 'visibility', regionId, isPublic: !!isPublic });
  return result;
}

/**
 * 배너 목록 조회 (서버 우선, 로컬 fallback)
 */
export async function getBanners(regionId = null, options = {}) {
  try {
    const params = new URLSearchParams({ activeOnly: 'true' });
    if (regionId) params.set('regionId', String(regionId));
    if (options.type) params.set('type', String(options.type));
    const url = `${API_BASE}/api/banners?${params.toString()}`;
    return await fetchWithRetry(url, { method: 'GET' });
  } catch (error) {
    console.warn('Failed to fetch banners from server, using local data:', error);
    // Fallback: 로컬 데이터 사용
    const { getPublicBanners } = await import('./adminStore');
    return getPublicBanners(regionId);
  }
}

/** 지역포털 하단 배너 조회 */
export async function getRegionPortalBanners(regionId) {
  if (!regionId) return [];
  return getBanners(regionId, { type: 'region_portal' });
}

/**
 * 배너 업로드
 */
export async function uploadBannerImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  
  const res = await fetch(`${API_BASE}/api/banners/upload`, {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header - browser will set it with boundary
  });
  return checkStatus(res);
}

export async function uploadContentImage(file, options = {}) {
  const endpoints = [
    `${API_BASE}/api/content-images/upload`,
    `${API_BASE}/api/upload/content-image`,
    `${API_BASE}/api/upload/content-images`,
  ];
  const context = options.context || 'content-image';
  let lastError = null;

  for (const endpoint of endpoints) {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      return await checkStatus(res);
    } catch (error) {
      lastError = error;
      console.error(`[uploadContentImage] ${context} failed: ${endpoint}`, {
        status: error?.status,
        message: error?.message,
      });
      if (error?.status !== 404) break;
    }
  }

  throw lastError || new Error('콘텐츠 이미지 업로드에 실패했습니다.');
}

/**
 * 배너 생성/수정
 */
export async function upsertBanner(banner) {
  // Keep compatibility: if banner has id -> PATCH, else POST create
  if (banner && (banner.id || banner.bannerId)) {
    const id = banner.id || banner.bannerId;
    // send explicit update fields (exclude id)
    const { id: _discard, bannerId: _discard2, ...updates } = banner;
    return patchBanner(id, updates);
  }
  return createBanner(banner);
}

export async function createBanner(banner) {
  const result = await fetchWithRetry(`${API_BASE}/api/banners`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(banner),
  });
  notifySsotChange({ type: 'banners', operation: 'create', bannerId: result?.id || result?.bannerId || null, regionId: banner?.regionId || null });
  return result;
}

export async function patchBanner(bannerId, updates) {
  const result = await fetchWithRetry(`${API_BASE}/api/banners/${encodeURIComponent(bannerId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  notifySsotChange({ type: 'banners', operation: 'update', bannerId, regionId: updates?.regionId || null });
  return result;
}

/**
 * 배너 삭제
 */
export async function deleteBanner(bannerId) {
  const result = await fetchWithRetry(`${API_BASE}/api/banners/${encodeURIComponent(bannerId)}`, {
    method: 'DELETE',
  });
  notifySsotChange({ type: 'banners', operation: 'delete', bannerId });
  return result;
}

/**
 * Reviews API
 */
export async function getReviews(shopId) {
  if (!shopId) {
    console.warn('[getReviews] No shopId provided');
    return [];
  }
  return fetchWithRetry(`${API_BASE}/api/shops/${encodeURIComponent(shopId)}/reviews`, {
    method: 'GET',
  });
}

export async function postReview(shopId, { content, rating, authorName, images }, memberId) {
  if (!memberId) {
    throw new Error('memberId is required for review submission');
  }
  if (!content || !content.trim()) {
    throw new Error('content is required');
  }
  if (!rating || rating < 1 || rating > 5) {
    throw new Error('rating must be between 1 and 5');
  }
  
  return fetchWithRetry(`${API_BASE}/api/shops/${encodeURIComponent(shopId)}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-member-id': memberId,
    },
    body: JSON.stringify({
      content,
      rating,
      authorName,
      images: Array.isArray(images) ? images.filter(Boolean).slice(0, 5) : [],
    }),
  });
}

export async function updateReview(shopId, reviewId, { content, rating, images }) {
  requireLoggedInMemberId();
  if (!content || !String(content).trim()) {
    throw new Error('content is required');
  }
  if (!rating || rating < 1 || rating > 5) {
    throw new Error('rating must be between 1 and 5');
  }

  return fetchWithRetry(`${API_BASE}/api/shops/${encodeURIComponent(shopId)}/reviews/${encodeURIComponent(reviewId)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ..._sessionAuthHeader(),
    },
    body: JSON.stringify({
      content: String(content).trim(),
      rating,
      images: Array.isArray(images) ? images.filter(Boolean).slice(0, 5) : [],
    }),
  });
}

export async function deleteReview(shopId, reviewId) {
  requireLoggedInMemberId();
  return fetchWithRetry(`${API_BASE}/api/shops/${encodeURIComponent(shopId)}/reviews/${encodeURIComponent(reviewId)}`, {
    method: 'DELETE',
    headers: {
      ..._sessionAuthHeader(),
    },
  });
}

/**
 * Broadcasts API
 */

/**
 * 비디오 업로드 with progress tracking
 */
export function uploadBroadcastVideo(file, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('video', file);

    const xhr = new XMLHttpRequest();

    // Progress tracking
    if (onProgress && xhr.upload) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(percentComplete);
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (e) {
          reject(new Error('Invalid JSON response'));
        }
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.responseText}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload aborted'));
    });

    xhr.open('POST', `${API_BASE}/api/broadcasts/upload`);
    xhr.send(formData);
  });
}

/**
 * 방송 생성/수정
 */
export async function createBroadcast(broadcast) {
  const result = await fetchWithRetry(`${API_BASE}/api/broadcasts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(broadcast),
  });
  notifySsotChange({ type: 'broadcasts', operation: 'create', broadcastId: result?.id || result?.broadcastId || null, regionId: broadcast?.regionId || broadcast?.region || null });
  return result;
}

export async function updateBroadcast(broadcastId, updates) {
  const result = await fetchWithRetry(`${API_BASE}/api/broadcasts/${encodeURIComponent(broadcastId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  notifySsotChange({ type: 'broadcasts', operation: 'update', broadcastId, regionId: updates?.regionId || updates?.region || null });
  return result;
}

/**
 * 방송 삭제
 */
export async function deleteBroadcast(broadcastId) {
  const result = await fetchWithRetry(`${API_BASE}/api/broadcasts/${encodeURIComponent(broadcastId)}`, {
    method: 'DELETE',
  });
  notifySsotChange({ type: 'broadcasts', operation: 'delete', broadcastId });
  return result;
}

/**
 * 방송 목록 조회
 */
export async function fetchBroadcasts(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.region) queryParams.append('region', params.region);
  if (params.isPublic !== undefined) queryParams.append('isPublic', params.isPublic);
  
  const url = queryParams.toString() 
    ? `${API_BASE}/api/broadcasts?${queryParams}`
    : `${API_BASE}/api/broadcasts`;
  
  // 서버 계약: { broadcasts: [...] }
  return fetchWithRetry(url, { method: 'GET' });
}

// 동일한 방송 목록 URL이 짧은 시간에 반복 호출될 때 서버 폭주를 방지한다.
const BROADCAST_LIST_CACHE_TTL_MS = 1200;
const broadcastListInflightMap = new Map();
const broadcastListResultCache = new Map();

/**
 * 공유방송 전체 목록 조회 (shareBroadcastStore 호환)
 * @param {Object} params - 조회 옵션 { publicOnly, regionId, limit }
 * @returns {Promise<Array>} 공유방송 배열
 */
export async function getAllBroadcasts(params = {}) {
  const queryParams = new URLSearchParams();

  // 기본값: 공개된 방송만 조회
  const publicOnly = params.publicOnly !== false; // default true
  if (publicOnly) {
    queryParams.append('publicOnly', 'true');
  }

  if (params.regionId) {
    queryParams.append('region', params.regionId);
  }

  if (params.limit) {
    queryParams.append('limit', params.limit);
  }

  const url = queryParams.toString() 
    ? `${API_BASE}/api/broadcasts?${queryParams}`
    : `${API_BASE}/api/broadcasts`;

  const now = Date.now();
  const cached = broadcastListResultCache.get(url);
  if (cached && now - cached.at < BROADCAST_LIST_CACHE_TTL_MS) {
    return Array.isArray(cached.data) ? cached.data : [];
  }

  const inflight = broadcastListInflightMap.get(url);
  if (inflight) {
    return inflight;
  }

  const requestPromise = (async () => {
    const result = await fetchWithRetry(url, { method: 'GET' });

    // 서버 계약: { broadcasts: [...] }
    const normalized = Array.isArray(result) ? result : (result?.broadcasts || []);
    broadcastListResultCache.set(url, { at: Date.now(), data: normalized });
    return normalized;
  })();

  broadcastListInflightMap.set(url, requestPromise);
  try {
    return await requestPromise;
  } finally {
    broadcastListInflightMap.delete(url);
  }
}

/**
 * 공유방송 단일 조회 (shareBroadcastStore 호환)
 */
export async function getBroadcastById(broadcastId) {
  const result = await fetchBroadcastById(broadcastId);
  // 서버 계약: { broadcast: {...} }
  if (result && !('broadcast' in result) && typeof result === 'object') return result;
  return result?.broadcast || null;
}

/**
 * 공유방송 등록 (SSOT 이벤트 발생 포함)
 */
export async function upsertBroadcast(broadcast) {
  try {
    let result;
    
    if (broadcast.id || broadcast.broadcastId) {
      // 수정
      const id = broadcast.id || broadcast.broadcastId;
      result = await updateBroadcast(id, broadcast);
    } else {
      // 등록
      result = await createBroadcast(broadcast);
    }
    
    return result;
  } catch (error) {
    console.error('[storageAdapter] upsertBroadcast error:', error);
    throw error;
  }
}

/**
 * 방송 상세 조회
 */
export async function fetchBroadcastById(broadcastId) {
  return fetchWithRetry(`${API_BASE}/api/broadcasts/${encodeURIComponent(broadcastId)}`, {
    method: 'GET',
  });
}

/**
 * 방송 댓글 작성
 */
export async function createBroadcastComment(broadcastId, { text, authorId, authorName }) {
  return fetchWithRetry(`${API_BASE}/api/broadcasts/${encodeURIComponent(broadcastId)}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, authorId, authorName }),
  });
}

/**
 * 방송 댓글 목록 조회
 */
export async function fetchBroadcastComments(broadcastId) {
  const result = await fetchWithRetry(`${API_BASE}/api/broadcasts/${encodeURIComponent(broadcastId)}/comments`, {
    method: 'GET',
  });
  return unwrapList(result, 'comments');
}

// ==================== SUPPLIES API ====================

/**
 * 보급지원 미디어 업로드 (이미지/PDF/Excel)
 */
export function uploadSupplyMedia(file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);

    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(percentComplete);
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.open('POST', `${API_BASE}/api/supplies/upload`);
    xhr.send(formData);
  });
}

/**
 * 보급지원 생성
 */
export async function createSupply(supply) {
  return fetchWithRetry(`${API_BASE}/api/supplies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(supply),
  });
}

/**
 * 보급지원 수정
 */
export async function updateSupply(supplyId, updates) {
  return fetchWithRetry(`${API_BASE}/api/supplies/${encodeURIComponent(supplyId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
}

/**
 * 보급지원 삭제
 */
export async function deleteSupply(supplyId) {
  return fetchWithRetry(`${API_BASE}/api/supplies/${encodeURIComponent(supplyId)}`, {
    method: 'DELETE',
  });
}

/**
 * 보급지원 목록 조회
 */
export async function fetchSupplies(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.region) queryParams.append('region', params.region);
  if (params.status) queryParams.append('status', params.status);
  if (params.createdBy) queryParams.append('createdBy', params.createdBy);
  if (params.type) queryParams.append('type', params.type);
  if (params.districtId) queryParams.append('districtId', params.districtId);
  
  const url = queryParams.toString() 
    ? `${API_BASE}/api/supplies?${queryParams}`
    : `${API_BASE}/api/supplies`;
  
  return fetchWithRetry(url, { method: 'GET' });
}

/**
 * 보급지원 상세 조회
 */
export async function fetchSupplyById(supplyId) {
  return fetchWithRetry(`${API_BASE}/api/supplies/${encodeURIComponent(supplyId)}`, {
    method: 'GET',
  });
}

/**
 * ========================================
 * Points API (P1-A)
 * ⚠️ DO NOT DUPLICATE EXPORT FUNCTIONS
 * Always search existing exports before adding new ones.
 * Use Ctrl+F to search "export async function <name>" in this file.
 * ========================================
 */

/**
 * 포인트 잔액 조회
 */
export async function getPointBalance(memberId) {
  return fetchWithRetry(`${API_BASE}/api/points/${encodeURIComponent(memberId)}/balance`, {
    method: 'GET',
    headers: _sessionAuthHeader(),
  });
}

/**
 * 포인트 내역 조회
 */
export async function getPointHistory(memberId, filters = {}) {
  const queryParams = new URLSearchParams();
  if (filters.type) queryParams.append('type', filters.type);
  if (filters.startDate) queryParams.append('startDate', filters.startDate);
  if (filters.endDate) queryParams.append('endDate', filters.endDate);
  if (filters.limit) queryParams.append('limit', filters.limit);
  
  const url = queryParams.toString()
    ? `${API_BASE}/api/points/${encodeURIComponent(memberId)}/history?${queryParams}`
    : `${API_BASE}/api/points/${encodeURIComponent(memberId)}/history`;
  
  return fetchWithRetry(url, { method: 'GET', headers: _sessionAuthHeader() });
}

/**
 * 관리자: 포인트 지급/차감
 */
export async function grantPoints(memberId, amount, type = 'ADMIN', description = '', referenceId = null, referenceType = null) {
  // 관리자 세션 토큰 우선 (sessionStorage), 없으면 일반 세션 토큰 fallback
  const adminToken = (typeof sessionStorage !== 'undefined') ? sessionStorage.getItem('su_admin_token') : null;
  const token = adminToken || window.__SU_SESSION__?.token || '';
  return fetchWithRetry(`${API_BASE}/api/points/admin/grant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ memberId, amount, type, description, referenceId, referenceType }),
  });
}

/**
 * 관리자: 포인트 거래 취소
 * ⚠️ NOTE: This function must exist only once in storageAdapter.js.
 * If you need to change behavior, edit this implementation instead of duplicating it.
 * Used by: AdminPoints.jsx → storageAdapter.cancelPointTransaction(transactionId)
 * API: POST /api/points/admin/cancel/:transactionId
 */
export async function cancelPointTransaction(transactionId) {
  const token = window.__SU_SESSION__?.token || '';
  return fetchWithRetry(`${API_BASE}/api/points/admin/cancel/${encodeURIComponent(transactionId)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

/**
 * 유저: 포인트 결제 (QR 코드 결제)
 */
export async function payWithPoints(storeId, amount, memberId, clientNonce = null) {
  return payWithSessionPoints(storeId, amount, clientNonce);
}

/**
 * 유저: 세션 기반 포인트 결제
 * - requireAuth 라우트에 맞춰 현재 로그인 세션 토큰(Bearer)을 사용한다.
 */
export async function payWithSessionPoints(storeId, amount, clientNonce = null) {
  const token = window.__SU_SESSION__?.token || '';
  return fetchWithRetry(`${API_BASE}/api/points/pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ storeId, amount, clientNonce }),
  });
}

/**
 * ========================================
 * Participations API (P1-B)
 * ========================================
 */

/**
 * 참여 기록 추가
 */
export async function addParticipation({ itemKey, itemId, itemType, title, memberId, regionId, crossRegion, submissionText, submissionLink, submissionImages }) {
  // ✅ apiClient 사용
  try {
    const result = await apiPost('/api/participations', {
      itemKey,
      itemId,
      itemType,
      title,
      memberId,
      regionId,
      submissionText,
      submissionLink,
      submissionImages,
      crossRegion: crossRegion === true ? true : undefined
    });
    return result;
  } catch (error) {
    console.error('[addParticipation] Error:', error.message);
    throw error;
  }
}

/**
 * 내 참여 기록 조회
 */
export async function getParticipations(memberId) {
  // ✅ apiClient 사용: credentials 자동 포함, 응답 언랩
  try {
    const result = await apiGet(`/api/participations/${encodeURIComponent(memberId)}`);
    // 서버가 배열을 직접 반환하거나 { participations: [...] } 형태로 반환
    return unwrapListNew(result, ['participations', 'data']);
  } catch (error) {
    console.error('[getParticipations] Error:', error.message);
    throw error;
  }
}

/**
 * 미션 참여 (포인트 획득 포함)
 */
export async function participateInMission(missionId, memberId) {
  return fetchWithRetry(`${API_BASE}/api/missions/${encodeURIComponent(missionId)}/participate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberId }),
  });
}

/**
 * ========================================
 * Live Broadcast API (P1-E)
 * ========================================
 */

/**
 * 생방송 시작
 */
export async function startLiveBroadcast(broadcastId, title, createdBy) {
  return fetchWithRetry(`${API_BASE}/api/broadcasts/live/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ broadcastId, title, createdBy }),
  });
}

/**
 * 생방송 종료
 */
export async function stopLiveBroadcast(broadcastId) {
  return fetchWithRetry(`${API_BASE}/api/broadcasts/live/stop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ broadcastId }),
  });
}

/**
 * 생방송 상태 조회
 */
export async function getLiveBroadcastStatus() {
  return fetchWithRetry(`${API_BASE}/api/broadcasts/live/status`, {
    method: 'GET',
  });
}

/**
 * ========================================
 * Region API Extensions (P1-C)
 * ========================================
 */

/**
 * 지역 공개 상태 토글
 */
export async function updateRegionPublicStatus(regionId, isPublic) {
  return fetchWithRetry(`${API_BASE}/api/regions/${encodeURIComponent(regionId)}/public`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isPublic }),
  });
}

/**
 * 지역 통계 조회
 */
export async function getRegionStats(regionId) {
  return fetchWithRetry(`${API_BASE}/api/regions/${encodeURIComponent(regionId)}/stats`, {
    method: 'GET',
  });
}

/**
 * ========================================
 * User Card API (P1-D)
 * ========================================
 */
/**
 * ========================================
 * Participations API (Phase 1)
 * ========================================
 */

/* ========== 설정(Config) API ========== */

/**
 * 설정값 조회
 */
export async function getConfig(key) {
  try {
    const res = await fetch(`${API_BASE}/api/configs/${encodeURIComponent(key)}`, {
      method: 'GET',
    });
    
    if (res.status === 404) {
      return null;
    }
    
    if (!res.ok) {
      throw new Error(`API error ${res.status}`);
    }
    
    const data = await res.json();
    return data.value;
  } catch (err) {
    console.error('[storageAdapter] getConfig error:', err);
    return null;
  }
}

/**
 * 설정값 저장
 */
export async function setConfig(key, value) {
  const res = await fetch(`${API_BASE}/api/configs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  });
  return checkStatus(res);
}

// ============================================
// Supply Support API
// ============================================

/**
 * 보급지원 물품 등록 (담당자만 가능)
 */
export async function createSupplyItem(item) {
  const res = await fetch(`${API_BASE}/api/supply-items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  const result = await checkStatus(res);
  return unwrapItem(result, 'item') || result;
}

/**
 * 보급지원 물품 목록 조회
 */
export async function getSupplyItems(params = {}) {
  const { managerId } = params;
  const url = managerId 
    ? `${API_BASE}/api/supply-items?managerId=${encodeURIComponent(managerId)}`
    : `${API_BASE}/api/supply-items`;
  const res = await fetch(url, { method: 'GET' });
  const result = await checkStatus(res);
  return unwrapList(result, 'items');
}

/**
 * 보급지원 물품 수정
 */
export async function updateSupplyItem(itemId, updates) {
  if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) {
    throw new Error('updateSupplyItem: updates payload is empty or invalid');
  }
  const res = await fetch(`${API_BASE}/api/supply-items/${encodeURIComponent(itemId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const result = await checkStatus(res);
  return unwrapItem(result, 'item') || result;
}

/**
 * 보급지원 신청
 */
export async function createSupplyRequest(request) {
  const payload = request || {};

  // Accept both legacy and standard keys
  const supplyIdRaw = payload.supplyId ?? payload.supplyItemId;
  const requesterIdRaw = payload.requesterId ?? payload.memberId ?? payload.requester_id;
  const quantityRaw = payload.quantity;

  if (supplyIdRaw === undefined || supplyIdRaw === null || supplyIdRaw === '') {
    throw new Error('createSupplyRequest: supplyId is required');
  }
  if (requesterIdRaw === undefined || requesterIdRaw === null || String(requesterIdRaw).trim() === '') {
    throw new Error('createSupplyRequest: requesterId is required');
  }

  const normalized = {
    supplyId: supplyIdRaw,
    requesterId: String(requesterIdRaw).trim(),
    quantity: (quantityRaw === undefined || quantityRaw === null || quantityRaw === '') ? 1 : Number(quantityRaw),
    message: payload.message ?? null,
    requesterName: payload.requesterName ?? null,
    requesterContact: payload.requesterContact ?? null,
    requestType: payload.requestType ?? null,
    orderStatus: payload.orderStatus ?? null,
    receiveMethod: payload.receiveMethod ?? null,
    paymentReferenceId: payload.paymentReferenceId ?? null,
    paymentAmount: payload.paymentAmount ?? null,
  };

  if (!Number.isFinite(normalized.quantity) || normalized.quantity <= 0) {
    throw new Error('createSupplyRequest: quantity must be a positive number');
  }

  // ✅ apiClient 사용
  try {
    const result = await apiPost('/api/supply-requests', normalized);
    return result;
  } catch (error) {
    console.error('[createSupplyRequest] Error:', error.message);
    throw error;
  }
}

/**
 * 보급지원 신청 목록 조회
 */
export async function getSupplyRequests(params = {}) {
  const { managerId, requesterId, requestType } = params;
  const queryParams = [];
  if (managerId) queryParams.push(`managerId=${encodeURIComponent(managerId)}`);
  if (requesterId) queryParams.push(`requesterId=${encodeURIComponent(requesterId)}`);
  if (requestType) queryParams.push(`requestType=${encodeURIComponent(requestType)}`);
  const query = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
  
  // ✅ apiClient 사용: credentials 자동 포함
  try {
    const result = await apiGet(`/api/supply-requests${query}`);
    return unwrapListNew(result, ['requests', 'data']);
  } catch (error) {
    console.error('[getSupplyRequests] Error:', error.message);
    throw error;
  }
}

/**
 * 보급지원 신청 상태 변경
 */
export async function updateSupplyRequestStatus(requestId, status) {
  // ✅ apiClient 사용
  try {
    const result = await apiPatch(`/api/supply-requests/${encodeURIComponent(requestId)}`, { status });
    return result;
  } catch (error) {
    console.error('[updateSupplyRequestStatus] Error:', error.message);
    throw error;
  }
}

/**
 * 보급/유통 신청 상세 상태 변경
 */
export async function updateSupplyRequest(requestId, updates = {}) {
  if (!requestId) throw new Error('updateSupplyRequest: requestId is required');
  if (!updates || typeof updates !== 'object') throw new Error('updateSupplyRequest: updates must be an object');
  try {
    const result = await apiPatch(`/api/supply-requests/${encodeURIComponent(requestId)}`, updates);
    return result;
  } catch (error) {
    console.error('[updateSupplyRequest] Error:', error.message);
    throw error;
  }
}

//------------------------------------------------------------------------------
// Posts API
// ============================================================
// Distribution Wallet API
// ============================================================

export async function getDistWallet() {
  try {
    return await apiGet('/api/dist/wallet', { headers: _sessionAuthHeader() });
  } catch (error) {
    console.error('[getDistWallet] Error:', error.message);
    throw error;
  }
}

export async function requestDistWithdraw({ amount, bankName, accountNumber, depositorName, memo }) {
  try {
    return await apiPost('/api/dist/wallet/withdraw', { amount, bankName, accountNumber, depositorName, memo }, {
      headers: _sessionAuthHeader(),
    });
  } catch (error) {
    console.error('[requestDistWithdraw] Error:', error.message);
    throw error;
  }
}

/** 관리자: 유통지원 판매자 출금 요청 목록 */
export async function getAdminDistPayouts() {
  try {
    const result = await apiGet('/api/admin/dist-payouts', { headers: _adminAuthHeader() });
    if (Array.isArray(result?.payouts)) return result.payouts;
    return unwrapListNew(result, ['payouts', 'data']);
  } catch (error) {
    console.error('[getAdminDistPayouts] Error:', error.message);
    throw error;
  }
}

/** 관리자: 유통지원 출금 요청 처리 */
export async function updateAdminDistPayout(payoutId, updates = {}) {
  try {
    return await apiPatch(`/api/admin/dist-payouts/${encodeURIComponent(payoutId)}`, updates, {
      headers: _adminAuthHeader(),
    });
  } catch (error) {
    console.error('[updateAdminDistPayout] Error:', error.message);
    throw error;
  }
}

//------------------------------------------------------------------------------
// Posts API
//------------------------------------------------------------------------------
export async function getRegionPosts(params = {}) {
  const query = new URLSearchParams();
  if (params.region) query.set('region', params.region);
  if (params.boardType) query.set('boardType', params.boardType);
  if (params.tag) query.set('tag', params.tag);
  if (params.publicOnly !== undefined) query.set('publicOnly', String(params.publicOnly));

  const res = await fetch(`${API_BASE}/api/posts?${query.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return checkStatus(res);
}

export async function getPostById(postId) {
  const res = await fetch(`${API_BASE}/api/posts/${encodeURIComponent(postId)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return checkStatus(res);
}

export async function createPost(postData) {
  const res = await fetch(`${API_BASE}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData),
  });
  return checkStatus(res);
}

export async function updatePost(postId, updates) {
  const res = await fetch(`${API_BASE}/api/posts/${encodeURIComponent(postId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return checkStatus(res);
}

export async function deletePost(postId) {
  const res = await fetch(`${API_BASE}/api/posts/${encodeURIComponent(postId)}`, {
    method: 'DELETE',
  });
  return checkStatus(res);
}

//------------------------------------------------------------------------------
// Boards API (지역 게시판 — boards 테이블)
//------------------------------------------------------------------------------
export async function getBoards(params = {}) {
  const qs = params.regionId ? `?regionId=${encodeURIComponent(params.regionId)}` : '';
  const result = await fetchWithRetry(`${API_BASE}/api/boards${qs}`, { method: 'GET' });
  return result?.posts || [];
}

export async function getBoardPost(id) {
  const result = await fetchWithRetry(`${API_BASE}/api/boards/${encodeURIComponent(id)}`, { method: 'GET' });
  return result?.post || result;
}

export async function createBoardPost({ regionId, title, content, category, authorId, authorName }) {
  const token = window.__SU_SESSION__?.token || '';
  const result = await fetchWithRetry(`${API_BASE}/api/boards`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ regionId, title, content: content || '', category: category || 'general', authorId: authorId || null, authorName: authorName || null }),
  });
  return result?.post || result;
}

export async function updateBoardPost(id, { title, content, category }) {
  const token = window.__SU_SESSION__?.token || '';
  return fetchWithRetry(`${API_BASE}/api/boards/${encodeURIComponent(id)}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ title, content: content || '', category: category || 'general' }),
  });
}

export async function deleteBoardPost(id) {
  const token = window.__SU_SESSION__?.token || '';
  return fetchWithRetry(`${API_BASE}/api/boards/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  });
}

// Board Comments
export async function getBoardComments(boardId) {
  const res = await fetch(`${API_BASE}/api/boards/${encodeURIComponent(boardId)}/comments`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`댓글 로딩 실패 (${res.status})`);
  const data = await res.json();
  return Array.isArray(data) ? data : (data.comments || []);
}

export async function addBoardComment(boardId, { content, authorId, authorName }) {
  const token = window.__SU_SESSION__?.token || '';
  const res = await fetch(`${API_BASE}/api/boards/${encodeURIComponent(boardId)}/comments`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ content, authorId: authorId || null, authorName: authorName || null }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `댓글 등록 실패 (${res.status})`);
  }
  return res.json();
}

export async function deleteBoardComment(boardId, commentId) {
  const token = window.__SU_SESSION__?.token || '';
  const res = await fetch(
    `${API_BASE}/api/boards/${encodeURIComponent(boardId)}/comments/${encodeURIComponent(commentId)}`,
    {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    }
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `댓글 삭제 실패 (${res.status})`);
  }
  return res.json();
}

//------------------------------------------------------------------------------
// Chats API
//------------------------------------------------------------------------------
export async function fetchChats(user1, user2) {
  const res = await fetch(`${API_BASE}/api/chats?user1=${encodeURIComponent(user1)}&user2=${encodeURIComponent(user2)}`, {
    method: 'GET',
  });
  return checkStatus(res);
}

export async function sendChatMessage(from, to, text) {
  const res = await fetch(`${API_BASE}/api/chats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, text }),
  });
  return checkStatus(res);
}

export async function fetchConversations(userId) {
  const res = await fetch(`${API_BASE}/api/chats/conversations/${encodeURIComponent(userId)}`, {
    method: 'GET',
  });
  return checkStatus(res);
}

//------------------------------------------------------------------------------
// Friends API
//------------------------------------------------------------------------------
export async function fetchFriends(userId) {
  const res = await fetch(`${API_BASE}/api/friends/${encodeURIComponent(userId)}`, {
    method: 'GET',
    headers: { ..._sessionAuthHeader() },
    credentials: 'include',
  });
  const data = await checkStatus(res);
  // 서버 응답: { success, data: { friends: [] } } 또는 { friends: [] } 모두 지원
  return data?.data ?? data;
}

export async function addFriend(userId, friendId, options = {}) {
  const payload = { userId, friendId };
  if (options.expectedName) {
    payload.expectedName = String(options.expectedName).trim();
  }
  const res = await fetch(`${API_BASE}/api/friends`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ..._sessionAuthHeader() },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return checkStatus(res);
}

export async function removeFriend(userId, friendId) {
  const res = await fetch(`${API_BASE}/api/friends`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ..._sessionAuthHeader() },
    credentials: 'include',
    body: JSON.stringify({ userId, friendId }),
  });
  return checkStatus(res);
}

//------------------------------------------------------------------------------
// User Card API
//------------------------------------------------------------------------------
export async function fetchUserCard(userId) {
  const res = await fetch(`${API_BASE}/api/cards/${encodeURIComponent(userId)}`, {
    method: 'GET',
  });
  const data = await checkStatus(res);
  return data?.card ?? data;
}

export async function updateUserCard(userId, cardData) {
  const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(userId)}/card`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cardData),
  });
  return checkStatus(res);
}

// 슬러그 중복 확인
export async function checkCardSlug(slug) {
  const res = await fetch(`${API_BASE}/api/cards/check/${encodeURIComponent(slug)}`, { method: 'GET' });
  const data = await checkStatus(res);
  return data; // { available: bool, reason?: string }
}

// 슬러그로 공개 명함 조회
export async function fetchCardBySlug(slug) {
  const res = await fetch(`${API_BASE}/api/cards/by-slug/${encodeURIComponent(slug)}`, { method: 'GET' });
  const data = await checkStatus(res);
  return data?.card ?? data;
}

// 명함 생성/수정 (slug 포함)
export async function saveCard(memberId, cardData) {
  const res = await fetch(`${API_BASE}/api/members/${encodeURIComponent(memberId)}/card`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-member-id': String(memberId),
    },
    body: JSON.stringify(cardData),
  });
  return checkStatus(res);
}

// 명함 삭제
export async function deleteCard(memberId) {
  const res = await fetch(`${API_BASE}/api/members/${encodeURIComponent(memberId)}/card`, {
    method: 'DELETE',
    headers: { 'x-member-id': String(memberId) },
  });
  return checkStatus(res);
}

//------------------------------------------------------------------------------
// Schedules API (Phase 3: 날짜 필드 통일 - scheduleDate → date)
//------------------------------------------------------------------------------
export async function fetchSchedules(userId) {
  const url = `${API_BASE}/api/schedules?userId=${encodeURIComponent(userId)}`;
  try {
    const res = await fetch(url, { method: 'GET' });
    const data = await checkStatus(res);
    // ✅ Normalize: scheduleDate → date for frontend compatibility
    const normalized = (data.schedules || []).map(s => ({
      ...s,
      date: s.scheduleDate || s.date || null,
      time: s.scheduleTime || s.time || null,
    }));
    logAPI('fetchSchedules', url, { userId }, true, normalized);
    return { schedules: normalized };
  } catch (error) {
    logAPI('fetchSchedules', url, { userId }, false, error);
    throw error;
  }
}

export async function createSchedule(scheduleData) {
  // ✅ Normalize: date → scheduleDate for server API
  const payload = {
    ...scheduleData,
    scheduleDate: scheduleData.scheduleDate || scheduleData.date || null,
    scheduleTime: scheduleData.scheduleTime || scheduleData.time || null,
  };

  if (!payload.userId && typeof window !== 'undefined') {
    try {
      const authRaw = localStorage.getItem('su_auth_v2');
      const auth = authRaw ? JSON.parse(authRaw) : null;
      if (auth?.memberId) payload.userId = auth.memberId;
    } catch {}
  }

  if (!payload.scheduleDate || !/^\d{4}-\d{2}-\d{2}$/.test(String(payload.scheduleDate))) {
    throw new Error('createSchedule: scheduleDate is required (YYYY-MM-DD)');
  }
  const url = `${API_BASE}/api/schedules`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await checkStatus(res);
    logAPI('createSchedule', url, payload, true, result);
    return result;
  } catch (error) {
    logAPI('createSchedule', url, payload, false, error);
    throw error;
  }
}

export async function updateSchedule(scheduleId, updates) {
  const res = await fetch(`${API_BASE}/api/schedules/${encodeURIComponent(scheduleId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return checkStatus(res);
}

export async function deleteSchedule(scheduleId) {
  const res = await fetch(`${API_BASE}/api/schedules/${encodeURIComponent(scheduleId)}`, {
    method: 'DELETE',
  });
  return checkStatus(res);
}

//------------------------------------------------------------------------------
// Points API
//------------------------------------------------------------------------------
export async function getPoints(userId) {
  const res = await fetch(`${API_BASE}/api/points/${encodeURIComponent(userId)}`, {
    method: 'GET',
  });
  return checkStatus(res);
}

export async function getPointLedger(userId) {
  const res = await fetch(`${API_BASE}/api/points/${encodeURIComponent(userId)}/ledger`, {
    method: 'GET',
  });
  return checkStatus(res);
}

export async function getAllPointLedgers() {
  const res = await fetch(`${API_BASE}/api/points/ledgers`, {
    method: 'GET',
  });
  return checkStatus(res);
}

export async function addPointTransaction({ userId, amount, type, description, sourceId, sourceName }) {
  const res = await fetch(`${API_BASE}/api/points/transaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, amount, type, description, sourceId, sourceName }),
  });
  return checkStatus(res);
}

//------------------------------------------------------------------------------
// Cards API
//------------------------------------------------------------------------------
export async function getCard(userId) {
  const res = await fetch(`${API_BASE}/api/cards/${encodeURIComponent(userId)}`, {
    method: 'GET',
  });
  return checkStatus(res);
}

export async function upsertCard(userId, cardData) {
  const res = await fetch(`${API_BASE}/api/cards/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cardData),
  });
  return checkStatus(res);
}

export async function getPublicCard(userId) {
  const res = await fetch(`${API_BASE}/api/cards/${encodeURIComponent(userId)}/public`, {
    method: 'GET',
  });
  return checkStatus(res);
}

//------------------------------------------------------------------------------
// Supplies: manager endpoints (use fetchWithRetry for consistency)
//------------------------------------------------------------------------------
export async function getSupplyManagers() {
  return fetchWithRetry(`${API_BASE}/api/supplies/managers`, { method: 'GET' });
}

export async function createSupplyManager(manager) {
  return fetchWithRetry(`${API_BASE}/api/supplies/managers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(manager),
  });
}

export async function deleteSupplyManager(managerId) {
  return fetchWithRetry(`${API_BASE}/api/supplies/managers/${encodeURIComponent(managerId)}`, { method: 'DELETE' });
}

//------------------------------------------------------------------------------
// Chat Messages API
//------------------------------------------------------------------------------
export async function getChatMessages(userId, targetUserId) {
  const res = await fetch(`${API_BASE}/api/messages?userId=${encodeURIComponent(userId)}&targetUserId=${encodeURIComponent(targetUserId)}`, {
    method: 'GET',
  });
  return checkStatus(res);
}

export async function sendChatMessageNew({ fromId, toId, message }) {
  const res = await fetch(`${API_BASE}/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromId, toId, message }),
  });
  return checkStatus(res);
}

// Broadcast Comments API
//------------------------------------------------------------------------------
export async function getBroadcastComments(broadcastId) {
  return fetchBroadcastComments(broadcastId);
}

export async function addBroadcastComment({ broadcastId, userId, userName, comment }) {
  return createBroadcastComment(broadcastId, {
    text: comment,
    authorId: userId,
    authorName: userName,
  });
}

export async function deleteBroadcastComment(broadcastId, commentId) {
  throw new Error('deleteBroadcastComment: not supported by server API');
}

//------------------------------------------------------------------------------
// Shop Points & Payout API
//------------------------------------------------------------------------------
export async function getShopEarnedPoints(shopId) {
  return fetchWithRetry(`${API_BASE}/api/shops/${encodeURIComponent(shopId)}/points/earned`, { method: 'GET' });
}

export async function getShopAvailablePoints(shopId) {
  return fetchWithRetry(`${API_BASE}/api/shops/${encodeURIComponent(shopId)}/points/available`, { method: 'GET' });
}

export async function getShopPointLedger(shopId, options = {}) {
  const params = new URLSearchParams();
  if (options.limit) params.set('limit', String(options.limit));
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchWithRetry(`${API_BASE}/api/shops/${encodeURIComponent(shopId)}/points/ledger${query}`, { method: 'GET' });
}

export async function getShopPayoutRequests(shopId) {
  return fetchWithRetry(`${API_BASE}/api/shops/${encodeURIComponent(shopId)}/payout-requests`, { method: 'GET' });
}

export async function createShopPayoutRequest(shopId, payoutData) {
  return fetchWithRetry(`${API_BASE}/api/shops/${encodeURIComponent(shopId)}/payout-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payoutData),
  });
}

//------------------------------------------------------------------------------
// PV3 완전 복원: Notices API
//------------------------------------------------------------------------------
export async function getNotices(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.scope) queryParams.append('scope', params.scope);
  if (params.region_id) queryParams.append('region_id', params.region_id);
  if (params.status) queryParams.append('status', params.status);
  if (params.districtId) queryParams.append('districtId', params.districtId);
  
  const url = `${API_BASE}/api/notices${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const result = await fetchWithRetry(url, { method: 'GET' });
  const normalized = Array.isArray(result) ? result.map(normalizeLegacyNoticeId) : result;
  try {
    const { writeNoticeCache } = await import('./adminStore');
    if (!params.scope && !params.region_id && !params.districtId) {
      writeNoticeCache(Array.isArray(normalized) ? normalized : []);
    }
  } catch (e) {}
  return normalized;
}

export async function getNoticeById(noticeId) {
  const result = normalizeLegacyNoticeId(await fetchWithRetry(`${API_BASE}/api/notices/${encodeURIComponent(noticeId)}`, { method: 'GET' }));
  try {
    const { mergeNoticeCache } = await import('./adminStore');
    mergeNoticeCache(result);
  } catch (e) {}
  return result;
}

export async function createNotice(noticeData) {
  const result = await fetchWithRetry(`${API_BASE}/api/notices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(noticeData),
  });
  try {
    const { mergeNoticeCache } = await import('./adminStore');
    mergeNoticeCache({ ...noticeData, id: result?.id || noticeData?.id || null });
  } catch (e) {}
  notifySsotChange({ type: 'notices', operation: 'create', noticeId: result?.id || null, regionId: noticeData?.region_id || noticeData?.regionId || null, districtId: noticeData?.districtId || null });
  return result;
}

export async function updateNotice(noticeId, updates) {
  const result = await fetchWithRetry(`${API_BASE}/api/notices/${encodeURIComponent(noticeId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  try {
    const { mergeNoticeCache } = await import('./adminStore');
    mergeNoticeCache({ ...updates, id: noticeId, updatedAt: result?.updatedAt || new Date().toISOString() });
  } catch (e) {}
  notifySsotChange({ type: 'notices', operation: 'update', noticeId, regionId: updates?.region_id || updates?.regionId || null, districtId: updates?.districtId || null });
  return result;
}

export async function deleteNotice(noticeId) {
  const result = await fetchWithRetry(`${API_BASE}/api/notices/${encodeURIComponent(noticeId)}`, { method: 'DELETE' });
  try {
    const { removeNoticeFromCache } = await import('./adminStore');
    removeNoticeFromCache(noticeId);
  } catch (e) {}
  notifySsotChange({ type: 'notices', operation: 'delete', noticeId });
  return result;
}

//------------------------------------------------------------------------------
// Region News (Admin CRUD)
//------------------------------------------------------------------------------

export async function getAdminRegionNews(params = {}) {
  const q = new URLSearchParams();
  if (params.regionId) q.append('regionId', params.regionId);
  if (params.limit) q.append('limit', params.limit);
  const url = `${API_BASE}/api/admin/region-news${q.toString() ? '?' + q.toString() : ''}`;
  const res = await fetchWithRetry(url);
  return Array.isArray(res?.news) ? res.news : (Array.isArray(res) ? res : []);
}

export async function createAdminRegionNews(data) {
  const result = await fetchWithRetry(`${API_BASE}/api/admin/region-news`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  notifySsotChange({ type: 'region-news', operation: 'create', newsId: result?.news?.newsId || result?.newsId || result?.id || null, regionId: data?.regionId || null, districtId: data?.districtId || null });
  return result;
}

export async function updateAdminRegionNews(newsId, data) {
  const result = await fetchWithRetry(`${API_BASE}/api/admin/region-news/${encodeURIComponent(newsId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  notifySsotChange({ type: 'region-news', operation: 'update', newsId, regionId: data?.regionId || null, districtId: data?.districtId || null });
  return result;
}

export async function deleteAdminRegionNews(newsId) {
  const result = await fetchWithRetry(`${API_BASE}/api/admin/region-news/${encodeURIComponent(newsId)}`, { method: 'DELETE' });
  notifySsotChange({ type: 'region-news', operation: 'delete', newsId });
  return result;
}

//------------------------------------------------------------------------------
// PV3 완전 복원: Missions Participants API
//------------------------------------------------------------------------------
let _missionsCacheData = null;
let _missionsCacheAt = 0;
const MISSIONS_CACHE_TTL = 60000;

export async function getMissions(params = {}) {
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.append('status', params.status);
  if (params.regionId) queryParams.append('regionId', params.regionId);
  if (params.districtId) queryParams.append('districtId', params.districtId);
  
  const url = `${API_BASE}/api/missions${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  // 파라미터 없는 전체 조회만 캐시 적용
  const useCache = !params.status && !params.regionId && !params.districtId;
  if (useCache) {
    const now = Date.now();
    if (_missionsCacheData && (now - _missionsCacheAt) < MISSIONS_CACHE_TTL) return _missionsCacheData;
  }
  const result = await fetchWithRetry(url, { method: 'GET' });
  const list = unwrapList(result, 'missions');
  if (useCache) { _missionsCacheData = list; _missionsCacheAt = Date.now(); }
  return list;
}

export function clearMissionsCache() { _missionsCacheData = null; _missionsCacheAt = 0; }

export async function getMissionById(missionId) {
  const result = await fetchWithRetry(`${API_BASE}/api/missions/${encodeURIComponent(missionId)}`, { method: 'GET' });
  return unwrapItem(result, 'mission') || result;
}

export async function updateMissionParticipant(missionId, participantData) {
  return fetchWithRetry(`${API_BASE}/api/missions/${encodeURIComponent(missionId)}/participants`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(participantData),
  });
}

export async function getMissionParticipants(missionId) {
  if (!missionId) throw new Error('getMissionParticipants: missionId required');
  const url = `${API_BASE}/api/missions/${encodeURIComponent(missionId)}/participants`;
  const result = await fetchWithRetry(url, { method: 'GET' });
  return unwrapList(result, 'participants');
}

export async function updateEventParticipant(eventId, participantData) {
  return fetchWithRetry(`${API_BASE}/api/events/${encodeURIComponent(eventId)}/participants`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(participantData),
  });
}

export async function getEventParticipants(eventId) {
  if (!eventId) throw new Error('getEventParticipants: eventId required');
  const url = `${API_BASE}/api/events/${encodeURIComponent(eventId)}/participants`;
  const result = await fetchWithRetry(url, { method: 'GET' });
  return unwrapList(result, 'participants');
}

export async function getProgramParticipants(itemType, itemId) {
  const normalizedType = String(itemType || '').trim().toLowerCase();
  if (normalizedType === 'event') return getEventParticipants(itemId);
  return getMissionParticipants(itemId);
}

export async function updateProgramParticipant(itemType, itemId, participantData) {
  const normalizedType = String(itemType || '').trim().toLowerCase();
  if (normalizedType === 'event') return updateEventParticipant(itemId, participantData);
  return updateMissionParticipant(itemId, participantData);
}

//------------------------------------------------------------------------------
// PV3 완전 복원: Shop Payout Handle API
// NOTE: cancelPointTransaction is defined at line ~748 (Points API section)
// ⚠️ DO NOT re-declare it here to avoid SyntaxError
//------------------------------------------------------------------------------
export async function handleShopPayout(requestId, handleData) {
  return fetchWithRetry(`${API_BASE}/api/shop-payout-requests/${encodeURIComponent(requestId)}/handle`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(handleData),
  });
}

//------------------------------------------------------------------------------
// 🔧 통합 레이어 복구: 누락된 함수 추가
//------------------------------------------------------------------------------

// getSupplies - alias to fetchSupplies for backward compatibility
export async function getSupplies(params = {}) {
  const url = `${API_BASE}/api/supplies`;
  try {
    const result = await fetchWithRetry(url, { method: 'GET' });
    logAPI('getSupplies', url, params, true, result);
    return result;
  } catch (error) {
    logAPI('getSupplies', url, params, false, error);
    throw error;
  }
}

// getAllSupplies - AdminDashboard에서 사용
export async function getAllSupplies(params = {}) {
  const url = `${API_BASE}/api/supplies`;
  try {
    const result = await fetchWithRetry(url, { method: 'GET' });
    logAPI('getAllSupplies', url, params, true, result);
    return result;
  } catch (error) {
    logAPI('getAllSupplies', url, params, false, error);
    throw error;
  }
}

// upsertNotice - adminStore에서 사용 (createNotice + updateNotice 통합)
export async function upsertNotice(notice) {
  const url = notice.id 
    ? `${API_BASE}/api/notices/${encodeURIComponent(notice.id)}`
    : `${API_BASE}/api/notices`;
  const method = notice.id ? 'PATCH' : 'POST';
  
  try {
    const result = await fetchWithRetry(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notice),
    });
    try {
      const { mergeNoticeCache } = await import('./adminStore');
      mergeNoticeCache({ ...notice, id: notice.id || result?.id || null });
    } catch (e) {}
    notifySsotChange({ type: 'notices', operation: notice.id ? 'update' : 'create', noticeId: notice.id || result?.id || null, regionId: notice?.region_id || notice?.regionId || null, districtId: notice?.districtId || null });
    logAPI('upsertNotice', url, { id: notice.id }, true, result);
    return result;
  } catch (error) {
    logAPI('upsertNotice', url, { id: notice.id }, false, error);
    throw error;
  }
}

// markParticipationSelection - participationService에서 사용
export async function markParticipationSelection(itemKey, memberId, selected) {
  const url = `${API_BASE}/api/participations/select`;
  try {
    const result = await fetchWithRetry(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemKey, memberId, selected }),
    });
    logAPI('markParticipationSelection', url, { itemKey, memberId, selected }, true, result);
    return result;
  } catch (error) {
    logAPI('markParticipationSelection', url, { itemKey, memberId, selected }, false, error);
    throw error;
  }
}

export async function rewardParticipation({ itemKey, memberId, rewardType, rewardAmount, rewardDescription, adminId }) {
  const url = `${API_BASE}/api/participations/reward`;
  try {
    const result = await fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemKey, memberId, rewardType, rewardAmount, rewardDescription, adminId }),
    });
    logAPI('rewardParticipation', url, { itemKey, memberId, rewardType, rewardAmount }, true, result);
    return result;
  } catch (error) {
    logAPI('rewardParticipation', url, { itemKey, memberId, rewardType, rewardAmount }, false, error);
    throw error;
  }
}

// getBroadcasts - adminBackupTools에서 사용
export async function getBroadcasts(params = {}) {
  return getAllBroadcasts(params);
}

// ============================================
// AUDITION SUBMISSIONS (오디션 참가작)
// ============================================

export async function getAuditionSubmissions(auditionId) {
  const url = `${API_BASE}/api/auditions/${auditionId}/submissions`;

  try {
    logDetailedRequest('GET', url);
    const res = await fetch(url, { credentials: 'include', headers: _sessionAuthHeader() });
    const data = await res.json();
    logDetailedResponse('GET', url, res, data);
    if (!res.ok) throw new Error(`Failed to fetch submissions: ${res.status}`);
    logAPI('getAuditionSubmissions', url, { auditionId }, true, data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    logDetailedError('GET', url, error);
    logAPI('getAuditionSubmissions', url, { auditionId }, false, error);
    throw error;
  }
}

export async function createAuditionSubmission(auditionId, submission) {
  const url = `${API_BASE}/api/auditions/${auditionId}/submissions`;
  
  try {
    logDetailedRequest('POST', url, { body: submission });
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(submission)
    });
    const data = await res.json();
    logDetailedResponse('POST', url, res, data);
    if (!res.ok) throw new Error(data.error || `Failed to create submission: ${res.status}`);
    window.dispatchEvent(new CustomEvent('su:ssot:changed', {
      detail: { type: 'submissions', operation: 'create', auditionId, submissionId: data?.submissionId || data?.id || null }
    }));
    logAPI('createAuditionSubmission', url, { auditionId, submission }, true, data);
    return data;
  } catch (error) {
    logDetailedError('POST', url, error);
    logAPI('createAuditionSubmission', url, { auditionId, submission }, false, error);
    throw error;
  }
}

export async function deleteAuditionSubmission(auditionId, submissionId) {
  const url = `${API_BASE}/api/auditions/${auditionId}/submissions/${submissionId}`;
  
  try {
    logDetailedRequest('DELETE', url);
    const res = await fetch(url, {
      method: 'DELETE',
      credentials: 'include'
    });
    const data = await res.json();
    logDetailedResponse('DELETE', url, res, data);
    if (!res.ok) throw new Error(data.error || `Failed to delete submission: ${res.status}`);
    window.dispatchEvent(new CustomEvent('su:ssot:changed', {
      detail: { type: 'submissions', operation: 'delete', auditionId, submissionId }
    }));
    logAPI('deleteAuditionSubmission', url, { auditionId, submissionId }, true, data);
    return data;
  } catch (error) {
    logDetailedError('DELETE', url, error);
    logAPI('deleteAuditionSubmission', url, { auditionId, submissionId }, false, error);
    throw error;
  }
}

// 관리자: 참가작 제목 수정 (소유권 체크 없음)
export async function updateAuditionSubmission(auditionId, submissionId, payload) {
  const url = `${API_BASE}/api/auditions/${auditionId}/submissions/${submissionId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ..._sessionAuthHeader() },
    credentials: 'include',
    body: JSON.stringify(payload || {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Failed to update submission: ${res.status}`);
  const submission = data?.submission || null;
  window.dispatchEvent(new CustomEvent('su:ssot:changed', {
    detail: {
      type: 'submissions',
      operation: 'update',
      auditionId,
      submissionId,
      payload: payload || {},
      submission,
    }
  }));
  return data;
}

// 관리자: 참가작 강제 삭제 (소유권 체크 없음 — 서버에서 ADMIN role 체크)
export async function adminDeleteAuditionSubmission(auditionId, submissionId) {
  // 기존 DELETE 엔드포인트 사용 (서버에서 role=ADMIN이면 소유권 스킵)
  const url = `${API_BASE}/api/auditions/${auditionId}/submissions/${submissionId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    credentials: 'include',
  });
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`서버 응답이 JSON이 아닙니다 (status: ${res.status}). 서버를 재시작해주세요.`);
  }
  if (!res.ok) throw new Error(data.error || `Failed to admin-delete submission: ${res.status}`);
  return data;
}

export async function getAuditionSubmissionComments(auditionId, submissionId) {
  const url = `${API_BASE}/api/auditions/${auditionId}/submissions/${submissionId}/comments`;

  try {
    logDetailedRequest('GET', url);
    const res = await fetch(url, { credentials: 'include' });
    const data = await res.json();
    logDetailedResponse('GET', url, res, data);
    if (!res.ok) throw new Error(data.error || `Failed to fetch comments: ${res.status}`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    logDetailedError('GET', url, error);
    throw error;
  }
}

export async function createAuditionSubmissionComment(auditionId, submissionId, content) {
  const url = `${API_BASE}/api/auditions/${auditionId}/submissions/${submissionId}/comments`;

  try {
    logDetailedRequest('POST', url, { body: { content } });
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ..._sessionAuthHeader() },
      credentials: 'include',
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    logDetailedResponse('POST', url, res, data);
    if (!res.ok) throw new Error(data.error || `Failed to create comment: ${res.status}`);
    window.dispatchEvent(new CustomEvent('su:ssot:changed', {
      detail: { type: 'audition-comments', operation: 'create', auditionId, submissionId, commentId: data?.comment?.id || null }
    }));
    return data?.comment || data;
  } catch (error) {
    logDetailedError('POST', url, error);
    throw error;
  }
}

export async function updateAuditionSubmissionComment(auditionId, submissionId, commentId, content) {
  const url = `${API_BASE}/api/auditions/${auditionId}/submissions/${submissionId}/comments/${commentId}`;

  try {
    logDetailedRequest('PATCH', url, { body: { content } });
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ..._sessionAuthHeader() },
      credentials: 'include',
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    logDetailedResponse('PATCH', url, res, data);
    if (!res.ok) throw new Error(data.error || `Failed to update comment: ${res.status}`);
    window.dispatchEvent(new CustomEvent('su:ssot:changed', {
      detail: { type: 'audition-comments', operation: 'update', auditionId, submissionId, commentId }
    }));
    return data?.comment || data;
  } catch (error) {
    logDetailedError('PATCH', url, error);
    throw error;
  }
}

export async function deleteAuditionSubmissionComment(auditionId, submissionId, commentId) {
  const url = `${API_BASE}/api/auditions/${auditionId}/submissions/${submissionId}/comments/${commentId}`;

  try {
    logDetailedRequest('DELETE', url);
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { ..._sessionAuthHeader() },
      credentials: 'include',
    });
    const data = await res.json();
    logDetailedResponse('DELETE', url, res, data);
    if (!res.ok) throw new Error(data.error || `Failed to delete comment: ${res.status}`);
    window.dispatchEvent(new CustomEvent('su:ssot:changed', {
      detail: { type: 'audition-comments', operation: 'delete', auditionId, submissionId, commentId }
    }));
    return data;
  } catch (error) {
    logDetailedError('DELETE', url, error);
    throw error;
  }
}

//------------------------------------------------------------------------------
// 구/군/시 (Districts) API
//------------------------------------------------------------------------------

export async function getDistricts(regionId) {
  const qs = regionId ? `?regionId=${encodeURIComponent(regionId)}` : '';
  const res = await fetchWithRetry(`${API_BASE}/api/districts${qs}`, { method: 'GET' });
  return res.districts || [];
}

export async function getAllActiveDistricts() {
  const res = await fetchWithRetry(`${API_BASE}/api/districts/all`, { method: 'GET' });
  return res.districts || [];
}

export async function upsertDistrict(data) {
  if (data.id) {
    return fetchWithRetry(`${API_BASE}/api/districts/${encodeURIComponent(data.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }
  return fetchWithRetry(`${API_BASE}/api/districts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteDistrict(id) {
  const res = await fetch(`${API_BASE}/api/districts/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Failed to delete district: ${res.status}`);
  return data;
}

// ────────────────────────────────────────────────────────────
// 아파트 (apartments)
// ────────────────────────────────────────────────────────────

export async function getApartments({ regionId, districtId } = {}) {
  const params = new URLSearchParams();
  if (regionId) params.set('regionId', regionId);
  if (districtId) params.set('districtId', districtId);
  const qs = params.toString() ? `?${params.toString()}` : '';
  const res = await fetchWithRetry(`${API_BASE}/api/apartments${qs}`, { method: 'GET' });
  return res.apartments || [];
}

export async function upsertApartment(data) {
  if (data.id) {
    return fetchWithRetry(`${API_BASE}/api/apartments/${encodeURIComponent(data.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }
  return fetchWithRetry(`${API_BASE}/api/apartments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteApartment(id) {
  const res = await fetch(`${API_BASE}/api/apartments/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Failed to delete apartment: ${res.status}`);
  return data;
}

export async function getApartmentPosts({ apartmentId, regionId, category, section } = {}) {
  const params = new URLSearchParams();
  if (apartmentId) params.set('apartmentId', apartmentId);
  if (regionId) params.set('regionId', regionId);
  if (category) params.set('category', category);
  if (section) params.set('section', section);
  const qs = params.toString() ? `?${params.toString()}` : '';
  const res = await fetchWithRetry(`${API_BASE}/api/apartment-posts${qs}`, {
    method: 'GET',
    headers: _memberOrAdminAuthHeader(),
  });
  return res.posts || [];
}

export async function createApartmentPost(data) {
  return fetchWithRetry(`${API_BASE}/api/apartment-posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ..._memberOrAdminAuthHeader() },
    body: JSON.stringify(data),
  });
}

export async function updateApartmentPost(id, data) {
  return fetchWithRetry(`${API_BASE}/api/apartment-posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ..._memberOrAdminAuthHeader() },
    body: JSON.stringify(data),
  });
}

export async function deleteApartmentPost(id) {
  return fetchWithRetry(`${API_BASE}/api/apartment-posts/${id}`, {
    method: 'DELETE',
    headers: _memberOrAdminAuthHeader(),
  });
}

export async function getApartmentComments(postId) {
  const res = await fetchWithRetry(`${API_BASE}/api/apartment-posts/${postId}/comments`, { method: 'GET' });
  return res.comments || [];
}

export async function createApartmentComment(postId, data) {
  const token = window.__SU_SESSION__?.token || '';
  return fetchWithRetry(`${API_BASE}/api/apartment-posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
    body: JSON.stringify(data),
  });
}

export async function updateApartmentHelpRequestStatus(id, status) {
  const token = window.__SU_SESSION__?.token || '';
  return fetchWithRetry(`${API_BASE}/api/apartment-posts/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
    body: JSON.stringify({ status }),
  });
}

export async function deleteApartmentComment(commentId) {
  const token = window.__SU_SESSION__?.token || '';
  // TODO: 관리자 권한 복원 시 requireAuth에서 req.authRole 체크
  return fetchWithRetry(`${API_BASE}/api/apartment-post-comments/${commentId}`, {
    method: 'DELETE',
    headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
  });
}

// ============================================================
// 지역 허브 API (Phase A-2)
// ============================================================

function _regionAuthHeaders() {
  const token = window.__SU_SESSION__?.token || '';
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// 조회
export async function getRegionHeroImages(regionId) {
  return fetchWithRetry(`${API_BASE}/api/regions/${encodeURIComponent(regionId)}/hero-images`, { method: 'GET' });
}
export async function getRegionIntro(regionId) {
  return fetchWithRetry(`${API_BASE}/api/regions/${encodeURIComponent(regionId)}/intro`, { method: 'GET' });
}
export async function searchRegionContent(regionId, query) {
  const q = String(query || '').trim();
  if (!q) return { results: [], query: q, regionId };
  return fetchWithRetry(
    `${API_BASE}/api/regions/${encodeURIComponent(regionId)}/search?q=${encodeURIComponent(q)}`,
    { method: 'GET' }
  );
}
export async function updateRegionIntro(regionId, data) {
  return fetchWithRetry(`${API_BASE}/api/admin/regions/${encodeURIComponent(regionId)}/intro`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ..._regionAuthHeaders() },
    body: JSON.stringify(data),
  });
}
export async function getRegionEvents(regionId) {
  return fetchWithRetry(`${API_BASE}/api/regions/${encodeURIComponent(regionId)}/events`, { method: 'GET' });
}
export async function upsertRegionEvent(regionId, event) {
  const eventId = event?.id || event?.eventId || event?.event_id || null;
  const method = eventId ? 'PATCH' : 'POST';
  const url = eventId
    ? `${API_BASE}/api/admin/regions/${encodeURIComponent(regionId)}/events/${encodeURIComponent(eventId)}`
    : `${API_BASE}/api/admin/regions/${encodeURIComponent(regionId)}/events`;

  const result = await fetchWithRetry(url, {
    method,
    headers: { 'Content-Type': 'application/json', ..._regionAuthHeaders() },
    body: JSON.stringify(event),
  });

  window.dispatchEvent(new CustomEvent('su:ssot:changed', {
    detail: { type: 'events', operation: eventId ? 'update' : 'create', eventId: eventId || result?.eventId || null }
  }));

  return result;
}
export async function deleteRegionEvent(regionId, eventId) {
  const result = await fetchWithRetry(`${API_BASE}/api/admin/regions/${encodeURIComponent(regionId)}/events/${encodeURIComponent(eventId)}`, {
    method: 'DELETE',
    headers: { ..._regionAuthHeaders() },
  });

  window.dispatchEvent(new CustomEvent('su:ssot:changed', {
    detail: { type: 'events', operation: 'delete', eventId }
  }));

  return result;
}
export async function getRegionFlyers(regionId) {
  return fetchWithRetry(`${API_BASE}/api/regions/${encodeURIComponent(regionId)}/flyers`, { method: 'GET' });
}
export async function createRegionFlyer(regionId, data) {
  return fetchWithRetry(`${API_BASE}/api/admin/regions/${encodeURIComponent(regionId)}/flyers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ..._regionAuthHeaders() },
    body: JSON.stringify(data),
  });
}
export async function updateRegionFlyer(regionId, flyerId, data) {
  return fetchWithRetry(`${API_BASE}/api/admin/regions/${encodeURIComponent(regionId)}/flyers/${encodeURIComponent(flyerId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ..._regionAuthHeaders() },
    body: JSON.stringify(data),
  });
}
export async function deleteRegionFlyer(regionId, flyerId) {
  return fetchWithRetry(`${API_BASE}/api/admin/regions/${encodeURIComponent(regionId)}/flyers/${encodeURIComponent(flyerId)}`, {
    method: 'DELETE',
    headers: { ..._regionAuthHeaders() },
  });
}
export async function getRegionFestivals(regionId) {
  return fetchWithRetry(`${API_BASE}/api/regions/${encodeURIComponent(regionId)}/festivals`, { method: 'GET' });
}
export async function getRegionTravelPosts(regionId) {
  return fetchWithRetry(`${API_BASE}/api/regions/${encodeURIComponent(regionId)}/travel-posts`, { method: 'GET' });
}
export async function getRegionFestivalComments(regionId, festivalId) {
  return fetchWithRetry(`${API_BASE}/api/regions/${encodeURIComponent(regionId)}/festivals/${encodeURIComponent(festivalId)}/comments`, { method: 'GET' });
}
export async function getRegionTravelComments(regionId, postId) {
  return fetchWithRetry(`${API_BASE}/api/regions/${encodeURIComponent(regionId)}/travel-posts/${encodeURIComponent(postId)}/comments`, { method: 'GET' });
}

// 전단 열람 (로그인 필수 → 포인트 지급)
export async function viewRegionFlyer(regionId, flyerId) {
  return fetchWithRetry(`${API_BASE}/api/regions/${encodeURIComponent(regionId)}/flyers/${encodeURIComponent(flyerId)}/view`, {
    method: 'POST',
    headers: { ..._regionAuthHeaders() },
  });
}

// 쓰기
export async function createRegionTravelPost(regionId, data) {
  return fetchWithRetry(`${API_BASE}/api/regions/${encodeURIComponent(regionId)}/travel-posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ..._regionAuthHeaders() },
    body: JSON.stringify(data),
  });
}
export async function createRegionTravelComment(regionId, postId, data) {
  return fetchWithRetry(`${API_BASE}/api/regions/${encodeURIComponent(regionId)}/travel-posts/${encodeURIComponent(postId)}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ..._regionAuthHeaders() },
    body: JSON.stringify(data),
  });
}
export async function createRegionFestival(regionId, data) {
  return fetchWithRetry(`${API_BASE}/api/admin/regions/${encodeURIComponent(regionId)}/festivals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ..._regionAuthHeaders() },
    body: JSON.stringify(data),
  });
}
export async function upsertRegionFestival(regionId, festival) {
  const festivalId = festival?.id || festival?.festivalId || festival?.festival_id || null;
  const method = festivalId ? 'PATCH' : 'POST';
  const url = festivalId
    ? `${API_BASE}/api/admin/regions/${encodeURIComponent(regionId)}/festivals/${encodeURIComponent(festivalId)}`
    : `${API_BASE}/api/admin/regions/${encodeURIComponent(regionId)}/festivals`;

  const result = await fetchWithRetry(url, {
    method,
    headers: { 'Content-Type': 'application/json', ..._regionAuthHeaders() },
    body: JSON.stringify(festival),
  });

  window.dispatchEvent(new CustomEvent('su:ssot:changed', {
    detail: { type: 'events', operation: festivalId ? 'update' : 'create', festivalId: festivalId || result?.festivalId || null }
  }));

  return result;
}
export async function deleteRegionFestival(regionId, festivalId) {
  const result = await fetchWithRetry(`${API_BASE}/api/admin/regions/${encodeURIComponent(regionId)}/festivals/${encodeURIComponent(festivalId)}`, {
    method: 'DELETE',
    headers: { ..._regionAuthHeaders() },
  });

  window.dispatchEvent(new CustomEvent('su:ssot:changed', {
    detail: { type: 'events', operation: 'delete', festivalId }
  }));

  return result;
}
export async function createRegionFestivalComment(regionId, festivalId, data) {
  return fetchWithRetry(`${API_BASE}/api/regions/${encodeURIComponent(regionId)}/festivals/${encodeURIComponent(festivalId)}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ..._regionAuthHeaders() },
    body: JSON.stringify(data),
  });
}
export async function deleteRegionFestivalComment(regionId, festivalId, commentId) {
  return fetchWithRetry(`${API_BASE}/api/regions/${encodeURIComponent(regionId)}/festivals/${encodeURIComponent(festivalId)}/comments/${encodeURIComponent(commentId)}`, {
    method: 'DELETE',
    headers: { ..._regionAuthHeaders() },
  });
}

// ═══════════════════════════════════════
// Reservation API
// ═══════════════════════════════════════

export async function createReservation(shopId, data, memberId) {
  return fetchWithRetry(`${API_BASE}/api/shops/${encodeURIComponent(shopId)}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-member-id': memberId },
    body: JSON.stringify(data),
  });
}

export async function getShopReservations(shopId) {
  return fetchWithRetry(`${API_BASE}/api/shops/${encodeURIComponent(shopId)}/reservations`);
}

export async function getMyReservations(memberId) {
  return fetchWithRetry(`${API_BASE}/api/members/${encodeURIComponent(memberId)}/reservations`);
}

export async function updateReservationStatus(reservationId, status, rejectReason, memberId) {
  return fetchWithRetry(`${API_BASE}/api/reservations/${encodeURIComponent(reservationId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-member-id': memberId },
    body: JSON.stringify({ status, rejectReason }),
  });
}

export async function deleteReservation(reservationId, memberId) {
  return fetchWithRetry(`${API_BASE}/api/reservations/${encodeURIComponent(reservationId)}`, {
    method: 'DELETE',
    headers: { 'x-member-id': memberId },
  });
}

export async function getVapidKey() {
  return fetchWithRetry(`${API_BASE}/api/push/vapid-key`);
}

export async function subscribePush(subscription, memberId) {
  return fetchWithRetry(`${API_BASE}/api/push/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-member-id': memberId },
    body: JSON.stringify(subscription),
  });
}
