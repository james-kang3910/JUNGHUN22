import { Navigate, useParams, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import RegionLayout from '../pages/RegionLayout';
import {
  isReservedRegionPathSegment,
  isRegionSubdomainUrlMode,
  resolveRegionNavigationTarget,
} from '../lib/regionRoutes';

/** /:regionKey — 예약 경로면 홈으로 (admin 등은 라우트 순서로 먼저 매칭) */
export default function RegionSlugGate() {
  const { regionKey } = useParams();
  const location = useLocation();

  if (isReservedRegionPathSegment(regionKey)) {
    return <Navigate to="/home" replace />;
  }

  const prefix = `/${encodeURIComponent(String(regionKey || '').trim())}`;
  let suffix = '';
  if (location.pathname.startsWith(`${prefix}/`)) {
    suffix = location.pathname.slice(prefix.length);
  }

  const externalTarget = isRegionSubdomainUrlMode()
    ? resolveRegionNavigationTarget(regionKey, suffix, { slug: regionKey })
    : null;

  useEffect(() => {
    if (externalTarget?.type === 'external') {
      window.location.replace(
        externalTarget.url + location.search + location.hash,
      );
    }
  }, [externalTarget, location.search, location.hash]);

  if (externalTarget?.type === 'external') {
    return null;
  }

  return <RegionLayout />;
}
