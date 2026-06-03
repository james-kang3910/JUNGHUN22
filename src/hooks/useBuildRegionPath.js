import { useCallback } from 'react';
import { useRegion } from '../context/RegionContext';
import { buildRegionPath } from '../lib/regionRoutes';

/** 지역 하위 페이지에서 canonical regionId 기준 경로 생성 */
export function useBuildRegionPath() {
  const { regionId } = useRegion();
  return useCallback(
    (subPath = '') => buildRegionPath(regionId, subPath),
    [regionId],
  );
}
