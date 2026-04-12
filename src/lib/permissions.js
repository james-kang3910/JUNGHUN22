import { normalizeRegionId, normalizeRegionIds } from './viewerRegionStore';

/**
 * SMI 권한 시스템 - 중앙 권한 정의 모듈
 *
 * 역할 계층 (낮을수록 하위):
 *   USER(0) < REGION_MANAGER(1) < REGION_ADMIN(2) < ADMIN(3) < SUPER_ADMIN(4) < WEBSITE_ADMIN(5)
 *
 * ─── 권한 범위 요약 ───
 *   USER            : 일반 기능 (참여, 열람)
 *   REGION_MANAGER  : 본인 가입 지역만 고정 관리
 *   REGION_ADMIN    : 지역 총관리자(기존 멀티 지역 관리자 역할 유지)
 *   ADMIN           : 전 시스템 관리
 *   SUPER_ADMIN   : ADMIN 권한 + 회원 역할 변경 + 고위 기능
 *   WEBSITE_ADMIN : 최고 권한 (env 설정, 변경 불가)
 *
 * ─── 향후 개발 예정 (TODO) ───
 *   - 회원별 district_id 등록/관리 (현재 DB 컬럼은 준비됨, UI 미구현)
 *   - 구/군 단위 참여 제한 (item.districtId ↔ member.districtId 비교)
 *   - 지역포탈 편집 버튼 노출 (shouldShowRegionEditButton 활용)
 *   - 지역관리자의 지역별 배정 UI를 AdminMembers에서 관리
 */

// ─────────────────────────────────────────────────────────────
// 1. 상수 정의
// ─────────────────────────────────────────────────────────────

export const ROLES = {
  USER:                 'USER',
  REGION_MANAGER:       'REGION_MANAGER',
  REGION_SUPER_MANAGER: 'REGION_ADMIN',
  REGION_ADMIN:         'REGION_ADMIN',
  ADMIN:                'ADMIN',
  SUPER_ADMIN:          'SUPER_ADMIN',
  WEBSITE_ADMIN:        'WEBSITE_ADMIN',
};

/** 역할 수치 등급 (숫자가 클수록 상위) */
export const ROLE_LEVEL = {
  [ROLES.USER]:                 0,
  [ROLES.REGION_MANAGER]:       1,
  [ROLES.REGION_SUPER_MANAGER]: 2,
  [ROLES.ADMIN]:                3,
  [ROLES.SUPER_ADMIN]:          4,
  [ROLES.WEBSITE_ADMIN]:        5,
};

export const ROLE_META = [
  { value: ROLES.USER,                 label: '일반회원',     color: '#6b7280', icon: '👤' },
  { value: ROLES.REGION_MANAGER,       label: '지역관리자',   color: '#2563eb', icon: '📍' },
  { value: ROLES.REGION_SUPER_MANAGER, label: '지역총관리자', color: '#0ea5a4', icon: '🌏' },
  { value: ROLES.ADMIN,                label: '관리자',       color: '#8b5cf6', icon: '🛡️' },
  { value: ROLES.SUPER_ADMIN,          label: '총관리자',     color: '#f59e0b', icon: '⭐' },
  { value: ROLES.WEBSITE_ADMIN,        label: '웹사이트 관리자', color: '#ec4899', icon: '🌐' },
];

export function getRoleMeta(role) {
  return ROLE_META.find(r => r.value === role) || ROLE_META[0];
}

export function getRoleLevel(role) {
  return ROLE_LEVEL[role] ?? 0;
}

export function isRegionManagerRole(role) {
  return String(role || '').toUpperCase() === ROLES.REGION_MANAGER;
}

export function isRegionSuperManagerRole(role) {
  const normalized = String(role || '').toUpperCase();
  return normalized === ROLES.REGION_SUPER_MANAGER || normalized === 'REGION_SUPER_MANAGER';
}

export function canAccessRegionalConsole(role) {
  return isRegionManagerRole(role) || isRegionSuperManagerRole(role) || canAccessAdmin(role);
}

// ─────────────────────────────────────────────────────────────
// 2. 어드민 접근 권한
// ─────────────────────────────────────────────────────────────

/** /admin 콘솔 접근 가능 여부 (ADMIN 이상) */
export function canAccessAdmin(role) {
  return getRoleLevel(role) >= ROLE_LEVEL[ROLES.ADMIN];
}

/** 회원 역할 변경 가능 여부 (본인보다 낮은 등급만 변경 가능) */
export function canChangeRole(myRole, targetRole) {
  const myLevel     = getRoleLevel(myRole);
  const targetLevel = getRoleLevel(targetRole);
  return myLevel > targetLevel && targetRole !== ROLES.WEBSITE_ADMIN;
}

/** 부여 가능한 역할 목록 (내 등급 미만, WEBSITE_ADMIN 제외) */
export function assignableRoles(myRole) {
  const myLevel = getRoleLevel(myRole);
  return ROLE_META.filter(r => getRoleLevel(r.value) < myLevel && r.value !== ROLES.WEBSITE_ADMIN);
}

// ─────────────────────────────────────────────────────────────
// 3. 지역 콘텐츠 관리 권한
// ─────────────────────────────────────────────────────────────

/**
 * 특정 지역 콘텐츠를 관리(추가/수정/삭제)할 수 있는지 확인
 *
 * @param {string} userRole - 현재 사용자 역할
 * @param {string[]} assignedRegions - REGION_ADMIN 배정 지역 ID 배열
 * @param {string} contentRegionId - 콘텐츠의 지역 ID
 */
export function canManageRegionContent(userRole, assignedRegions, contentRegionId) {
  const level = getRoleLevel(userRole);
  if (level >= ROLE_LEVEL[ROLES.ADMIN]) return true;
  if (isRegionSuperManagerRole(userRole)) {
    return true;
  }
  if (isRegionManagerRole(userRole)) {
    return Array.isArray(assignedRegions) && assignedRegions.includes(contentRegionId);
  }
  return false;
}

/**
 * 지역포탈 편집 버튼 표시 여부 (canManageRegionContent 래퍼)
 * 지역 공지/게시판/콘텐츠 카드 옆에 [수정] [삭제] 버튼을 조건부로 렌더링할 때 사용
 */
export function shouldShowRegionEditButton(userRole, assignedRegions, contentRegionId) {
  return canManageRegionContent(userRole, assignedRegions, contentRegionId);
}

// ─────────────────────────────────────────────────────────────
// 4. 미션 / 이벤트 / 오디션 참여 권한
// ─────────────────────────────────────────────────────────────

/**
 * 미션/이벤트/오디션 참여 가능 여부
 *
 * @param {object} item - 참여 대상 (regionScope, regionIds, districtId 포함)
 * @param {object} member - 현재 사용자 (regionId, districtId 포함)
 * @param {boolean} isAdmin - 관리자 여부 (관리자는 항상 허용)
 * @returns {{ allowed: boolean, reason?: string, isOtherRegion?: boolean, isOtherDistrict?: boolean }}
 */
export function canParticipateInItem(item, member, isAdmin = false) {
  if (!item) return { allowed: false, reason: 'item_not_found' };
  if (isAdmin) return { allowed: true };

  // ── 지역(region) 제한 확인 ──
  const regionRestricted =
    item.regionScope === 'REGION' &&
    Array.isArray(item.regionIds) &&
    item.regionIds.length > 0;

  if (regionRestricted) {
    const memberRegionId = normalizeRegionId(member?.regionId);
    const itemRegionIds = normalizeRegionIds(item.regionIds);
    if (!memberRegionId) {
      return { allowed: false, reason: 'no_region', isOtherRegion: true };
    }
    if (!itemRegionIds.includes(memberRegionId)) {
      return { allowed: false, reason: 'other_region', isOtherRegion: true };
    }
  }

  // ── 구/군(district) 제한 확인 ──
  // TODO: 회원별 district_id 등록 UI 구현 후 아래 블록 주석 해제
  // 현재 members.district_id 컬럼은 DB에 존재하지만 회원 등록 시 수집하지 않음.
  // 구현 완료 후 아래 주석을 제거하면 즉시 활성화됨.
  /*
  const districtRestricted = !!item.districtId;
  if (districtRestricted) {
    if (!member?.districtId) {
      return { allowed: false, reason: 'no_district', isOtherDistrict: true };
    }
    if (item.districtId !== member.districtId) {
      return { allowed: false, reason: 'other_district', isOtherDistrict: true };
    }
  }
  */

  return { allowed: true };
}

/**
 * 오디션 지원 가능 여부
 * 오디션은 region 소속 회원만 참여 가능 (타지역 우회 참여 불가)
 *
 * @param {object} audition - 오디션 객체 (regionId 포함)
 * @param {object} member - 현재 사용자 (regionId 포함)
 * @returns {{ allowed: boolean, reason?: string }}
 */
export function canApplyToAudition(audition, member) {
  if (!audition) return { allowed: false, reason: 'not_found' };
  const auditionRegionId = normalizeRegionId(audition.regionId);
  const memberRegionId = normalizeRegionId(member?.regionId);
  if (!auditionRegionId) return { allowed: true }; // 전체 오디션

  if (!memberRegionId) {
    return { allowed: false, reason: 'no_region' };
  }
  if (auditionRegionId !== memberRegionId) {
    return { allowed: false, reason: 'other_region' };
  }

  // TODO: 구/군 제한 (회원 districtId 구현 후 활성화)
  // if (audition.districtId && audition.districtId !== member.districtId) {
  //   return { allowed: false, reason: 'other_district' };
  // }

  return { allowed: true };
}

// ─────────────────────────────────────────────────────────────
// 5. 헬퍼 (UI 텍스트)
// ─────────────────────────────────────────────────────────────

/** 참여 불가 사유를 사용자에게 보여줄 메시지로 변환 */
export function getParticipationBlockMessage(reason) {
  switch (reason) {
    case 'other_region':    return '이 콘텐츠는 해당 지역 회원만 참여할 수 있습니다.';
    case 'no_region':       return '지역이 등록되지 않은 계정입니다. 마이페이지에서 지역을 설정해주세요.';
    case 'other_district':  return '이 콘텐츠는 해당 구/군 회원만 참여할 수 있습니다.';
    case 'no_district':     return '구/군이 등록되지 않은 계정입니다.';
    default:                return '참여할 수 없는 콘텐츠입니다.';
  }
}
