import { Navigate, useParams } from 'react-router-dom';
import RegionLayout from '../pages/RegionLayout';
import { isReservedRegionPathSegment } from '../lib/regionRoutes';

/** /:regionKey — 예약 경로면 홈으로 (admin 등은 라우트 순서로 먼저 매칭) */
export default function RegionSlugGate() {
  const { regionKey } = useParams();
  if (isReservedRegionPathSegment(regionKey)) {
    return <Navigate to="/home" replace />;
  }
  return <RegionLayout />;
}
