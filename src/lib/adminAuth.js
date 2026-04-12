/**
 * 관리자 인증 헬퍼 함수 (서버 기반)
 */

import * as storageAdapter from './storageAdapter';

const ADMIN_TOKEN_KEY = 'su_admin_token';
const ADMIN_AUTH_KEY = 'su_admin_isAdmin';

/**
 * 현재 관리자 토큰 가져오기
 * sessionStorage 사용 — 탭/브라우저 닫으면 자동 소멸
 */
export function getAdminToken() {
  try {
    // sessionStorage 우선, 이전 localStorage 잔여분 자동 정리
    const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
    if (token) return token;
    // 구버전 localStorage 잔여 토큰 제거 (마이그레이션)
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_AUTH_KEY);
    return null;
  } catch {
    return null;
  }
}

/**
 * 관리자 토큰 저장 (sessionStorage)
 */
export function setAdminToken(token) {
  try {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
    // 혹시 남아있는 localStorage 잔여분 제거
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_AUTH_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * 관리자 로그아웃 (토큰 삭제)
 */
export async function adminLogout() {
  const token = getAdminToken();
  
  try {
    if (token) {
      await storageAdapter.adminLogout(token);
    }
  } catch (err) {
    console.error('[adminAuth] Logout error:', err);
  } finally {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_AUTH_KEY);
  }
}

/**
 * 관리자 인증 여부 확인 (서버 검증)
 */
export async function isAdminAuthenticated() {
  const token = getAdminToken();
  if (!token) return false;

  try {
    const result = await storageAdapter.verifyAdminSession(token);
    return result.authenticated === true;
  } catch (err) {
    console.error('[adminAuth] Verification failed:', err);
    // 검증 실패 시 토큰 삭제
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_AUTH_KEY);
    return false;
  }
}

/**
 * 관리자 인증 여부 확인 (로컬만, 빠른 검증)
 * - 서버 검증 없이 로컬 스토리지만 확인
 * - useEffect에서 빠른 리다이렉트에 사용
 */
export function isAdminAuthenticatedLocal() {
  try {
    return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true' && !!getAdminToken();
  } catch {
    return false;
  }
}
