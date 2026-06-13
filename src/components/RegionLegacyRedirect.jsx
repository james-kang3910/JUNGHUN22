import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { resolveRegionNavigationTarget } from '../lib/regionRoutes';

/**
 * /r/:regionId/* → /:slug/* 또는 ulsan.smi.ceo/* 리다이렉트
 */
export default function RegionLegacyRedirect() {
  const { regionId } = useParams();
  const location = useLocation();
  const splat = useParams()['*'] || '';
  const suffix = splat ? `/${splat}` : location.pathname.replace(/^\/r\/[^/]+/, '') || '';
  const target = resolveRegionNavigationTarget(regionId, suffix);

  useEffect(() => {
    if (target.type === 'external') {
      window.location.replace(target.url + location.search + location.hash);
    }
  }, [target, location.search, location.hash]);

  if (target.type === 'external') {
    return null;
  }

  const path = target.path + location.search + location.hash;
  return <Navigate to={path} replace />;
}
