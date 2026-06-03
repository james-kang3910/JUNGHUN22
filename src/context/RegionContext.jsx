/**
 * RegionContext
 * 
 * regionId를 전역으로 공급합니다.
 * 
 * Phase 1: /ulsan 짧은 경로, /r/:id 레거시
 * Phase 2: ulsan.smi.ceo 서브도메인
 */

import { createContext, useContext, useMemo } from 'react';
import {
  getRegionSlugFromHostname,
  parseRegionPathname,
} from '../lib/regionRoutes';

const RegionContext = createContext(null);

/**
 * Phase 2 전환 포인트 — 이 함수만 수정하면 전체 앱이 서브도메인 방식으로 전환됩니다.
 * RegionLayout에서 이미 useParams()로 regionId를 받아서 주입하므로
 * 이 함수는 Context 외부에서 fallback용으로만 사용됩니다.
 */
export function getRegionIdFromEnv() {
  const hostSlug = getRegionSlugFromHostname();
  if (hostSlug) return hostSlug;

  const parsed = parseRegionPathname(window.location.pathname);
  if (parsed?.regionKey) return parsed.regionKey;

  const legacy = window.location.pathname.match(/^\/r\/([^/]+)/);
  if (legacy) return legacy[1];

  // ── 폴백: localStorage ────────────────────────────────────────────────
  try {
    return localStorage.getItem('selectedRegionId') || null;
  } catch (e) {
    return null;
  }
}

/**
 * RegionProvider
 * RegionLayout에서 regionId를 주입합니다.
 */
export function RegionProvider({ regionId, children }) {
  const value = useMemo(() => ({ regionId }), [regionId]);
  return (
    <RegionContext.Provider value={value}>
      {children}
    </RegionContext.Provider>
  );
}

/**
 * useRegion
 * 모든 지역 하위 페이지에서 regionId를 가져올 때 사용합니다.
 * 
 * const { regionId } = useRegion();
 */
export function useRegion() {
  const ctx = useContext(RegionContext);
  if (!ctx) {
    // RegionLayout 바깥에서 호출된 경우 fallback
    return { regionId: getRegionIdFromEnv() };
  }
  return ctx;
}
