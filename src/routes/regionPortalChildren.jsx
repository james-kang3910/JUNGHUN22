import { Route } from 'react-router-dom';
import RegionHub from '../pages/RegionHub';
import RegionBoard from '../pages/RegionBoard';
import RegionBoardWrite from '../pages/RegionBoardWrite';
import RegionBoardPost from '../pages/RegionBoardPost';
import RegionNotices from '../pages/RegionNotices';
import Missions from '../pages/Missions';
import RegionShops from '../pages/RegionShops';
import RegionBroadcasts from '../pages/RegionBroadcasts';
import RegionAuditions from '../pages/RegionAuditions';
import RegionApartments from '../pages/RegionApartments';
import ApartmentBoard from '../pages/ApartmentBoard';
import RegionNews from '../pages/RegionNews';
import RegionChatRooms from '../pages/RegionChatRooms';
import RegionIntro from '../pages/RegionIntro';
import RegionEvents from '../pages/RegionEvents';
import RegionFlyers from '../pages/RegionFlyers';
import RegionFestivals from '../pages/RegionFestivals';

/**
 * 서브도메인 전용 — /shops·/chat·/missions·/notices 는 App.jsx 전역 라우트로 분리
 * (메인 도메인 / 아래에 두면 전역 상권·채팅 URL이 홈으로 튕김)
 */
export const regionSubdomainExtraChildRoutes = (
  <>
    <Route path="board" element={<RegionBoard />} />
    <Route path="board/write" element={<RegionBoardWrite />} />
    <Route path="board/:postId" element={<RegionBoardPost />} />
    <Route path="broadcasts" element={<RegionBroadcasts />} />
    <Route path="auditions" element={<RegionAuditions />} />
    <Route path="apt" element={<RegionApartments />} />
    <Route path="apt/:aptId" element={<ApartmentBoard />} />
    <Route path="news" element={<RegionNews />} />
    <Route path="intro" element={<RegionIntro />} />
    <Route path="events" element={<RegionEvents />} />
    <Route path="flyers" element={<RegionFlyers />} />
    <Route path="festivals" element={<RegionFestivals />} />
  </>
);

/** 지역 포털 공통 하위 라우트 (짧은 경로 /:regionKey 및 /r/ 레거시) */
export const regionPortalChildRoutes = (
  <>
    <Route index element={<RegionHub />} />
    <Route path="board" element={<RegionBoard />} />
    <Route path="board/write" element={<RegionBoardWrite />} />
    <Route path="board/:postId" element={<RegionBoardPost />} />
    <Route path="notices" element={<RegionNotices />} />
    <Route path="missions" element={<Missions />} />
    <Route path="shops" element={<RegionShops />} />
    <Route path="broadcasts" element={<RegionBroadcasts />} />
    <Route path="auditions" element={<RegionAuditions />} />
    <Route path="apt" element={<RegionApartments />} />
    <Route path="apt/:aptId" element={<ApartmentBoard />} />
    <Route path="news" element={<RegionNews />} />
    <Route path="chat" element={<RegionChatRooms />} />
    <Route path="intro" element={<RegionIntro />} />
    <Route path="events" element={<RegionEvents />} />
    <Route path="flyers" element={<RegionFlyers />} />
    <Route path="festivals" element={<RegionFestivals />} />
  </>
);
