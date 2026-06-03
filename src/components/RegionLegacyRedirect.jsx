import { Navigate, useLocation, useParams } from 'react-router-dom';
import { buildRegionPath } from '../lib/regionRoutes';

/**
 * /r/:regionId/* → /:slug/* 리다이렉트
 */
export default function RegionLegacyRedirect() {
  const { regionId } = useParams();
  const location = useLocation();
  const splat = useParams()['*'] || '';
  const suffix = splat ? `/${splat}` : location.pathname.replace(/^\/r\/[^/]+/, '') || '';
  const target = buildRegionPath(regionId, suffix) + location.search + location.hash;
  return <Navigate to={target} replace />;
}
