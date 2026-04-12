/**
 * memberStore.js - 회원 프로필 QR 생성 유틸리티
 * 
 * [DATA_POLICY]
 * - localStorage: 로컬 전용 기능 (QR 코드 생성용 임시 프로필)
 * - 서버 연동 불필요 (회원 마스터 데이터는 authStore.js가 관리)
 * - su_profile_v1: QR 페이로드 캐시
 */

// Utilities for member profile stored in localStorage
const PROFILE_KEY = "su_profile_v1";

function rand4() {
  return Math.floor(1000 + Math.random() * 9000);
}

export function ensureMemberProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        // fallthrough to recreate
      }
    }

    const memberId = `SU${Date.now()}${rand4()}`;
    const profile = {
      memberId,
      qrPayload: `shareunity://member/${memberId}`,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    return profile;
  } catch (err) {
    // In environments without localStorage (very unlikely in browser), return a generated object
    const memberId = `SU${Date.now()}${rand4()}`;
    return {
      memberId,
      qrPayload: `shareunity://member/${memberId}`,
      createdAt: new Date().toISOString(),
    };
  }
}

export function getMemberProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function clearMemberProfile() {
  try {
    localStorage.removeItem(PROFILE_KEY);
    return true;
  } catch (e) {
    return false;
  }
}
