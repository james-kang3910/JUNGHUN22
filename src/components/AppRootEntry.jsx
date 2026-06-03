import { Navigate } from 'react-router-dom';
import RegionLayout from '../pages/RegionLayout';
import { isRegionSubdomainHost } from '../lib/regionRoutes';

/** 루트 / : 메인은 /home, 지역 서브도메인은 지역 허브 */
export default function AppRootEntry() {
  if (isRegionSubdomainHost()) {
    return <RegionLayout />;
  }
  return <Navigate to="/home" replace />;
}
