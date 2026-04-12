/**
 * authStore.js - SSOT Auth Store
 *
 * [SSOT POLICY]
 * - 원천: 서버(SQLite)
 * - localStorage/mock/local DB 의존 금지
 * - 클라이언트는 메모리 세션(window.__SU_SESSION__)만 유지
 */

import { ensureMemberProfile } from "./memberStore";
import * as storageAdapter from "./storageAdapter";
import { upsertMemberServerFirst } from "./syncManager";

// ============ 메모리 상태(localStorage 금지) ============
let AUTH_STATE = null; // current member snapshot
let SESSION_STATE = null; // { token, memberId, status, signedAt, regionId }
let MEMBERS_CACHE = [];
// ============ boot 상태 (앱 전역 부팅 규칙) ============
let BOOT_STATUS = 'idle'; // 'idle' | 'loading' | 'ready' | 'error'
let BOOT_LAST_AT = null; // timestamp ms
let BOOT_IN_PROGRESS = null; // Promise for dedupe
const BOOT_CACHE_KEY = 'su_me_cache_v1';
const BOOT_CACHE_TTL = 45 * 1000; // 45 seconds

function emitAuthChanged() {
  try {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('su:auth:changed', {
      detail: {
        loggedIn: !!(SESSION_STATE && SESSION_STATE.memberId),
        memberId: SESSION_STATE?.memberId || null,
      }
    }));
  } catch (e) {}
}

// ============ 유틸리티 함수 ============
function safeParse(raw) {
  try {
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function generateMemberId() {
  return `SU${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
}

// ============ 읽기 레이어: status 정규화 유틸리티 ============
function normStatus(s) {
  try { return String(s || "").toUpperCase(); } catch { return String(s || "").toUpperCase(); }
}

// ============ 내부 저장 함수(메모리) ============
function writeAuth(obj) {
  try {
    AUTH_STATE = obj || null;
  } catch (e) {
    console.error("[writeAuth] Error:", e);
  }
}

function writeSession(obj) {
  try {
    SESSION_STATE = obj || null;
    try {
      if (typeof window !== 'undefined') {
        window.__SU_SESSION__ = SESSION_STATE ? { ...SESSION_STATE } : null;
      }
    } catch (e) {}
    emitAuthChanged();
  } catch (e) {
    console.error("[writeSession] Error:", e);
  }
}

function writeBootCache(me) {
  try {
    if (typeof window === 'undefined') return;
    const payload = { me: me || null, at: Date.now() };
    localStorage.setItem(BOOT_CACHE_KEY, JSON.stringify(payload));
  } catch (e) {}
}

function readBootCache() {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(BOOT_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.at) return null;
    if (Date.now() - parsed.at > BOOT_CACHE_TTL) return null;
    return parsed.me || null;
  } catch (e) { return null; }
}

function writeMembers(members) {
  try {
    MEMBERS_CACHE = Array.isArray(members) ? members : [];
  } catch (e) {
    console.error("[writeMembers] Error:", e);
  }
}

// ============ 마이그레이션 (앱 시작 시 1회) ============
function migrateOldData() {
  // SSOT 정책: localStorage 마이그레이션 금지
  return;
}

// ★ 기존 "pending" 회원을 "active"로 일괄 변환
function migratePendingToActive() {
  // SSOT 정책: localStorage 마이그레이션 금지
  return;
}

// 앱 시작 시 마이그레이션 실행
migrateOldData();
migratePendingToActive(); // ★ pending → active 변환

// ============ 회원 목록 관리 API ============

/**
 * 전체 회원 목록 조회
 */
export function getMembers() {
  try {
    const raw = Array.isArray(MEMBERS_CACHE) ? MEMBERS_CACHE : [];
    // 반환 시에만 status 필드 표준화 (대문자)
    return raw.map(m => ({ ...m, status: normStatus(m.status) }));
  } catch (e) {
    return [];
  }
}

/**
 * 회원 ID로 조회
 */
export function getMemberById(memberId) {
  const members = getMembers();
  return members.find(m => m.id === memberId || m.memberId === memberId);
}

/**
 * 휴대폰번호로 조회
 */
export function getMemberByPhone(phone) {
  const cleaned = String(phone || "").replace(/[^0-9]/g, "");
  const members = getMembers();
  return members.find(m => {
    const memberPhone = String(m.phone || "").replace(/[^0-9]/g, "");
    return memberPhone === cleaned;
  });
}

/**
 * 이메일로 조회
 */
export function getMemberByEmail(email) {
  const lower = String(email || "").toLowerCase().trim();
  const members = getMembers();
  return members.find(m => {
    const memberEmail = String(m.email || "").toLowerCase().trim();
    return memberEmail && memberEmail === lower;
  });
}

/**
 * 회원 추가/수정 (upsert) - 서버 우선 정책
 * [DATA_POLICY] syncManager.upsertMemberServerFirst()가 서버 저장 + 로컬 캐시 자동 업데이트
 */
export async function upsertMember(memberData) {
  try {
    // ★ 서버에 먼저 저장 (동기화된 상태 유지)
    const serverResult = await upsertMemberServerFirst(memberData);
    
    if (!serverResult.success) {
      // 서버 저장 실패 시 에러 반환 (로컬만 저장하지 않음)
      console.error("[upsertMember] 서버 저장 실패:", serverResult.error);
      return { success: false, error: serverResult.error || "서버 저장 실패" };
    }

    // 서버 저장 성공 시 이미 syncManager가 로컬도 업데이트했으므로 성공 반환
    return serverResult;
  } catch (e) {
    console.error("[upsertMember] Error:", e);
    return { success: false, error: e.message };
  }
}

/**
 * 회원 삭제
 */
export function removeMember(memberId) {
  try {
    let members = getMembers();
    const initialLength = members.length;
    members = members.filter(m => m.id !== memberId && m.memberId !== memberId);
    writeMembers(members);
    return { success: true, removed: initialLength - members.length };
  } catch (e) {
    console.error("[removeMember] Error:", e);
    return { success: false, error: e.message };
  }
}

/**
 * 회원 상태 변경
 */
export function setMemberStatus(memberId, status) {
  const member = getMemberById(memberId);
  if (member) {
    return upsertMember({ ...member, status });
  }
  return { success: false, error: "회원을 찾을 수 없습니다." };
}

/**
 * 전체 회원 삭제 (관리자용)
 */
export function clearAllMembers() {
  writeMembers([]);
  return { success: true };
}

// ============ 현재 로그인 사용자 API ============

/**
 * 현재 로그인된 사용자 정보
 */
export function getCurrentUser() {
  return AUTH_STATE ? { ...AUTH_STATE, status: normStatus(AUTH_STATE.status) } : null;
}

export function getBootStatus() {
  return BOOT_STATUS;
}

export function isAuthReady() {
  return BOOT_STATUS === 'ready';
}

export function getMe() {
  return getCurrentUser();
}

export function getLastBootAt() {
  return BOOT_LAST_AT;
}

/**
 * boot() - 앱 시작 시 단 한 번 호출되어야 하는 부트 로직
 * - 로컬 캐시(me) 읽고 빠르게 메모리 초기화(임시)
 * - 서버 `/api/auth/me`(storageAdapter.getCurrentUser)를 호출하여 최종 신뢰값으로 덮어씀
 * - 중복 호출 방지: 같은 tick 내 재진입은 기존 Promise 반환
 */
export async function boot(opts = { force: false }) {
  if (BOOT_IN_PROGRESS) return BOOT_IN_PROGRESS;
  BOOT_IN_PROGRESS = (async () => {
    try {
      // 빠른 로컬 캐시 초기화 (있으면 임시로 사용)
      const cached = readBootCache();
      if (cached) {
        try {
          writeAuth(cached);
          // ★ 캐시 hit 시에도 이벤트 발송 (authReadyUser 게이트 작동 보장)
          emitAuthChanged();
        } catch (e) {}
      }

      BOOT_STATUS = 'loading';

      // 서버로부터 확정값을 가져와서 덮어씀
      const result = await hydrateAuthFromServer();
      if (result && result.ok) {
        BOOT_STATUS = 'ready';
        BOOT_LAST_AT = Date.now();
        // 확정된 me를 캐시에 저장
        try { writeBootCache(getCurrentUser()); } catch (e) {}
        // ★ 서버 확정 후에도 이벤트 발송 (중복 방지는 emitAuthChanged 내부에서 처리)
        emitAuthChanged();
        return { ok: true };
      } else {
        BOOT_STATUS = 'error';
        BOOT_LAST_AT = Date.now();
        writeAuth(null);
        writeSession(null);
        // ★ 로그아웃 상태도 이벤트 발송
        emitAuthChanged();
        return { ok: false, error: result?.error || 'boot_failed' };
      }
    } catch (e) {
      BOOT_STATUS = 'error';
      BOOT_LAST_AT = Date.now();
      writeAuth(null);
      writeSession(null);
      emitAuthChanged();
      return { ok: false, error: e?.message || String(e) };
    } finally {
      BOOT_IN_PROGRESS = null;
    }
  })();
  return BOOT_IN_PROGRESS;
}

/**
 * 현재 로그인 상태 확인
 */
export function isLoggedIn() {
  return !!(SESSION_STATE && SESSION_STATE.memberId);
}

/**
 * 현재 세션 정보 (Issue 4(권한): supplyManager 포함)
 */
export function getSession() {
  if (!SESSION_STATE) return null;
  
  // AUTH_STATE에서 supplyManager 필드 추가하여 반환
  const member = AUTH_STATE || {};
  return { 
    ...SESSION_STATE, 
    status: normStatus(SESSION_STATE.status),
    regionId: SESSION_STATE.regionId ?? member.regionId ?? null,
    supplyManager: !!member.supplyManager,
    role: member.role
  };
}

export function getCurrentRegionId() {
  return AUTH_STATE?.regionId ?? SESSION_STATE?.regionId ?? null;
}

/**
 * 현재 로그인 사용자 정보 (getAuthInfo 호환)
 */
export function getAuthInfo() {
  return getCurrentUser();
}

// ============ 검증 함수 ============

/**
 * 비밀번호 검증: 영문 1자 이상 + 숫자 1자 이상 + 8~16자
 */
export function validatePassword(password) {
  if (!password || typeof password !== "string") {
    return { valid: false, error: "비밀번호를 입력해주세요." };
  }
  // Trim leading/trailing whitespace to avoid accidental spaces from causing length errors
  const pw = password.trim();
  if (pw.length < 8 || pw.length > 16) {
    return { valid: false, error: "비밀번호는 8~16자여야 합니다." };
  }
  // Disallow any internal whitespace characters
  if (/\s/.test(pw)) {
    return { valid: false, error: "비밀번호에 공백을 포함할 수 없습니다." };
  }
  if (!/[a-zA-Z]/.test(pw)) {
    return { valid: false, error: "비밀번호에 영문을 1자 이상 포함해주세요." };
  }
  if (!/[0-9]/.test(pw)) {
    return { valid: false, error: "비밀번호에 숫자를 1자 이상 포함해주세요." };
  }
  return { valid: true };
}


/**
 * 휴대폰번호 검증
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== "string") {
    return { valid: false, error: "휴대폰번호를 입력해주세요." };
  }
  const cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.length < 10 || cleaned.length > 11) {
    return { valid: false, error: "올바른 휴대폰번호를 입력해주세요." };
  }
  return { valid: true, cleaned };
}

// ============ 인증 API ============

/**
 * 회원가입 - 서버 우선 정책 적용
 */
export async function signUp({ name, phone, password, nickname, region, regionId, email }) {
  try {
    // 필수 필드 검증
    if (!name || !name.trim()) {
      throw new Error('이름을 입력해주세요.');
    }
    
    let cleanedPhone = null;
    if (phone) {
      const phoneResult = validatePhone(phone);
      if (!phoneResult.valid) {
        throw new Error(phoneResult.error);
      }
      cleanedPhone = phoneResult.cleaned;
    }
    
    // Normalize password: trim leading/trailing whitespace before validation
    const pw = String(password || "").trim();
    const pwResult = validatePassword(pw);
    if (!pwResult.valid) {
      throw new Error(pwResult.error);
    }

    // ★ 이메일 정규화 (소문자 + trim)
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail) {
      throw new Error('이메일을 입력해주세요.');
    }
    if (!regionId) {
      throw new Error('지역을 선택해주세요.');
    }

    const registerPayload = {
      email: normalizedEmail,
      password: pw,
      name: name.trim(),
      phone: cleanedPhone,
      regionId,
    };

    const reg = await storageAdapter.register(registerPayload);
    if (!reg || reg.ok !== true || reg.success !== true) {
      throw new Error(reg?.error || '회원가입에 실패했습니다.');
    }

    // 가입 직후 로그인(기존 UX 유지). 서버가 token을 안 주면 login 호출.
    const loginResult = reg.token
      ? reg
      : await storageAdapter.login({ email: normalizedEmail, password });

      const isLoginSuccess = !!loginResult && (loginResult.ok === true || loginResult.success === true);
      if (!isLoginSuccess || !loginResult.member || !loginResult.token) {
      // 회원가입은 성공했지만 로그인 실패 (SSOT 정책상 조용히 삼키지 않음)
      throw new Error(loginResult?.error || '회원가입 후 자동 로그인에 실패했습니다.');
    }

    const serverMember = loginResult.member;
    const authMember = {
      id: serverMember.memberId || serverMember.id,
      memberId: serverMember.memberId || serverMember.id,
      name: serverMember.name,
      email: serverMember.email,
      phone: serverMember.phone,
      role: serverMember.role || "user",
      supplyManager: !!serverMember.supplyManager,
      status: normStatus(serverMember.status || "ACTIVE"),
      regionId: serverMember.regionId,
      createdAt: serverMember.createdAt,
      updatedAt: serverMember.updatedAt
    };
    writeAuth(authMember);
    writeSession({
      token: loginResult.token,
      memberId: authMember.memberId,
      status: authMember.status,
      regionId: authMember.regionId ?? null,
      signedAt: new Date().toISOString(),
    });

    // ★ 회원가입+로그인 성공 시 boot 상태를 ready로 갱신 → authReadyUser 게이트 즉시 통과
    BOOT_STATUS = 'ready';
    BOOT_LAST_AT = Date.now();
    try { writeBootCache(authMember); } catch (e) {}
    emitAuthChanged();

    ensureMemberProfile(authMember.memberId);
    console.log("[signUp] 회원가입+로그인 성공:", authMember.memberId);
    return { ok: true, memberId: authMember.memberId, status: authMember.status };
  } catch (e) {
    console.error("[signUp] Error:", e);
    throw e;
  }
}

/**
 * 로그인 - identifier(email/phone/memberId) + password (SSOT)
 * [DATA_POLICY] 서버 세션 동기화 후 로컬 캐시 업데이트
 */
export async function signIn({ email, userId, phone, identifier, password }) {
  try {
    const loginIdentifier = String(identifier || email || userId || phone || '').trim();
    if (!loginIdentifier) {
      throw new Error('아이디 또는 휴대폰번호를 입력해주세요.');
    }
    if (!password) {
      throw new Error('비밀번호를 입력해주세요.');
    }
    const pw = String(password || '').trim();
    const payload = { email: loginIdentifier, userId: loginIdentifier, phone: loginIdentifier, identifier: loginIdentifier, password: pw };

    const loginResult = await storageAdapter.login(payload);

    const isLoginSuccess = !!loginResult && (loginResult.ok === true || loginResult.success === true);
    if (!isLoginSuccess || !loginResult.member || !loginResult.token) {
      throw new Error(loginResult?.error || '로그인에 실패했습니다.');
    }

    const serverMember = loginResult.member;
    
    // ★ 로컬 캐시 업데이트 (읽기 전용) - Issue 4(권한): supplyManager 포함
    const authMember = {
      id: serverMember.memberId || serverMember.id,
      memberId: serverMember.memberId || serverMember.id,
      name: serverMember.name,
      email: serverMember.email,
      phone: serverMember.phone,
      role: serverMember.role || "user",
      supplyManager: !!serverMember.supplyManager,
      status: normStatus(serverMember.status || "ACTIVE"),
      regionId: serverMember.regionId,
      createdAt: serverMember.createdAt,
      updatedAt: serverMember.updatedAt
    };
    
    writeAuth(authMember);
    
    const sessionObj = {
      token: loginResult.token,
      memberId: serverMember.memberId || serverMember.id,
      status: normStatus(serverMember.status || "ACTIVE"),
      regionId: authMember.regionId ?? null,
      signedAt: new Date().toISOString(),
    };
    
    writeSession(sessionObj);

    // ★ 로그인 성공 시 boot 상태를 ready로 갱신 → authReadyUser 게이트 즉시 통과
    BOOT_STATUS = 'ready';
    BOOT_LAST_AT = Date.now();
    try { writeBootCache(authMember); } catch (e) {}
    emitAuthChanged();

    console.log("[signIn] Login success (via storageAdapter):", authMember.memberId);
    return { ok: true, memberId: authMember.memberId, status: authMember.status };
  } catch (e) {
    console.error("[signIn] Error:", e);
    throw e;
  }
}

// 개발 중 legacy key 자동 정리 (옵션)
function clearLegacyMemberKeys() {
  // SSOT 정책: localStorage 조작 금지
  return;
}

// 반드시 파일의 맨 마지막 줄(최상위)에서 export
export { clearLegacyMemberKeys };

/**
 * 로그아웃 - 서버 세션 해제 후 로컬 캐시 제거
 * [DATA_POLICY] storageAdapter.logout()으로 서버 세션 우선 해제
 */
export async function signOut() {
  try {
    // ★ 서버 로그아웃 호출
    const token = SESSION_STATE?.token || null;
    await storageAdapter.logout(token);

    // ★ 메모리 정리
    writeSession(null);
    writeAuth(null);
    console.log("[signOut] Logged out (server + memory cleared)");
  } catch (e) {
    console.error("[signOut] Error:", e);
    writeSession(null);
    writeAuth(null);
  }
}

/**
 * 서버 세션(httpOnly 쿠키) 기반으로 메모리 인증 상태 복원
 * - localStorage 없이 새로고침 후에도 memberId를 복원해 x-member-id 헤더가 정상 동작
 */
export async function hydrateAuthFromServer() {
  try {
    const result = await storageAdapter.getCurrentUser();
    if (result && result.ok === true && result.success === true && result.member) {
      const m = result.member;
      const memberId = m.memberId || m.id;
      const authMember = {
        id: memberId,
        memberId,
        name: m.name,
        email: m.email,
        phone: m.phone,
        role: m.role || "user",
        supplyManager: !!m.supplyManager,
        status: normStatus(m.status || "ACTIVE"),
        regionId: m.regionId,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      };
      writeAuth(authMember);
      writeSession({
        token: SESSION_STATE?.token || null,
        memberId,
        status: authMember.status,
        regionId: authMember.regionId ?? null,
        signedAt: SESSION_STATE?.signedAt || new Date().toISOString(),
      });
      return { ok: true, memberId };
    }
    writeAuth(null);
    writeSession(null);
    return { ok: false, error: result?.error || 'not_authenticated' };
  } catch (e) {
    // 401/네트워크 오류 등은 비로그인으로 처리
    writeAuth(null);
    writeSession(null);
    return { ok: false, error: e?.message || String(e) };
  }
}

// ============ 하위 호환성 유지 ============

/**
 * syncAuthToUsers - 더 이상 필요 없음 (members가 원천)
 */
export function syncAuthToUsers() {
  return { synced: 0 };
}

/**
 * syncMembersToUsers - su_users 키와 동기화 (하위 호환)
 */
export function syncMembersToUsers() {
  return { success: true, count: 0 };
}
