/**
 * 지역 포털 관련 유틸리티 함수
 * - adminStore에서 관리자가 등록한 지역 데이터 사용
 */

import { getPublicRegions, getRegions } from "./adminStore";

// ★ 지역이 등록(공개)되었는지 확인
export const isRegionRegistered = (id) => {
  if (!id) return false;
  const publicRegions = getPublicRegions();
  return publicRegions.some(r => String(r.id) === String(id));
};

// ★ ID로 지역 조회 (공개 여부 무관)
export const getRegionById = (id) => {
  if (!id) return null;
  const allRegions = getRegions();
  return allRegions.find(r => String(r.id) === String(id)) || null;
};

// ★ 등록(공개)된 지역 목록
export const getRegisteredRegions = () => {
  return getPublicRegions();
};
