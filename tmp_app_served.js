import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/App.jsx");import.meta.env = {"BASE_URL": "/", "DEV": true, "MODE": "development", "PROD": false, "SSR": false, "VITE_USER_NODE_ENV": "development"};import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=d214d6c3"; const Fragment = __vite__cjsImport0_react_jsxDevRuntime["Fragment"]; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
let prevRefreshReg;
let prevRefreshSig;
if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "@vitejs/plugin-react can't detect preamble. Something is wrong."
    );
  }
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("C:/Users/kmh/Desktop/smi-project/src/App.jsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}
var _s = $RefreshSig$(), _s2 = $RefreshSig$(), _s3 = $RefreshSig$(), _s4 = $RefreshSig$(), _s5 = $RefreshSig$(), _s6 = $RefreshSig$(), _s7 = $RefreshSig$(), _s8 = $RefreshSig$(), _s9 = $RefreshSig$(), _s0 = $RefreshSig$(), _s1 = $RefreshSig$(), _s10 = $RefreshSig$(), _s11 = $RefreshSig$(), _s12 = $RefreshSig$(), _s13 = $RefreshSig$();
import { Routes, Route, Navigate, useLocation, useNavigate, useParams } from "/node_modules/.vite/deps/react-router-dom.js?v=d214d6c3";
import __vite__cjsImport4_react from "/node_modules/.vite/deps/react.js?v=d214d6c3"; const useEffect = __vite__cjsImport4_react["useEffect"]; const useLayoutEffect = __vite__cjsImport4_react["useLayoutEffect"]; const useState = __vite__cjsImport4_react["useState"]; const useRef = __vite__cjsImport4_react["useRef"]; const lazy = __vite__cjsImport4_react["lazy"]; const Suspense = __vite__cjsImport4_react["Suspense"];
import __vite__cjsImport5_reactDom from "/node_modules/.vite/deps/react-dom.js?v=d214d6c3"; const createPortal = __vite__cjsImport5_reactDom["createPortal"];
import { isAdminAuthenticatedLocal } from "/src/lib/adminAuth.js";
import { ensureMemberProfile } from "/src/lib/memberStore.js";
import * as storageAdapter from "/src/lib/storageAdapter.js";
import * as shopStore from "/src/lib/shopStore.js";
import {
  hydrateAuthFromServer,
  isLoggedIn as isLoggedInMemory,
  getCurrentRegionId,
  getSession,
  getCurrentUser,
  isAuthReady,
  signOut
} from "/src/lib/authStore.js";
import { boot } from "/src/lib/authStore.js";
import { syncOnAppStart } from "/src/lib/syncManager.js";
import Home from "/src/pages/Home.jsx";
import Search from "/src/pages/Search.jsx";
import Community from "/src/pages/Community.jsx";
import ComingSoon from "/src/pages/ComingSoon.jsx";
import Chat from "/src/pages/Chat.jsx";
import Shops from "/src/pages/Shops.jsx";
import ShopEvents from "/src/pages/ShopEvents.jsx";
import ShopDetail from "/src/pages/ShopDetail.jsx";
import My from "/src/pages/My.jsx";
import Auth from "/src/pages/Auth.jsx";
import Broadcast from "/src/pages/broadcast/Broadcast.jsx";
import BroadcastView from "/src/pages/broadcast/BroadcastView.jsx";
import BroadcastDetail from "/src/pages/BroadcastDetail.jsx";
import Audition from "/src/pages/audition/Audition.jsx";
import AuditionView from "/src/pages/audition/AuditionView.jsx";
import AuditionDetail from "/src/pages/AuditionDetail.jsx";
import AuditionApply from "/src/pages/audition/AuditionApply.jsx";
import Region from "/src/pages/Region.jsx";
import RegionSelectPage from "/src/pages/RegionSelectPage.jsx";
import RegionPosts from "/src/pages/RegionPosts.jsx";
import RegionNotices from "/src/pages/RegionNotices.jsx";
import RegionLayout from "/src/pages/RegionLayout.jsx";
import RegionHub from "/src/pages/RegionHub.jsx";
import RegionBoard from "/src/pages/RegionBoard.jsx";
import RegionBoardWrite from "/src/pages/RegionBoardWrite.jsx";
import RegionBoardPost from "/src/pages/RegionBoardPost.jsx";
import RegionShops from "/src/pages/RegionShops.jsx";
import RegionApartments from "/src/pages/RegionApartments.jsx";
import ApartmentBoard from "/src/pages/ApartmentBoard.jsx";
import RegionNews from "/src/pages/RegionNews.jsx";
import RegionBroadcasts from "/src/pages/RegionBroadcasts.jsx";
import RegionAuditions from "/src/pages/RegionAuditions.jsx";
import RegionIntro from "/src/pages/RegionIntro.jsx";
import RegionEvents from "/src/pages/RegionEvents.jsx";
import RegionFlyers from "/src/pages/RegionFlyers.jsx";
import RegionFestivals from "/src/pages/RegionFestivals.jsx";
import RegionChatRooms from "/src/pages/RegionChatRooms.jsx";
import PostDetail from "/src/pages/PostDetail.jsx";
import Notices from "/src/pages/Notices.jsx";
import NoticeDetail from "/src/pages/NoticeDetail.jsx";
import Missions from "/src/pages/Missions.jsx";
import Support from "/src/pages/Support.jsx";
import Card from "/src/pages/Card.jsx";
const AdminLogin = lazy(_c = () => import("/src/pages/admin/AdminLogin.jsx"));
_c2 = AdminLogin;
const AdminLayout = lazy(_c3 = () => import("/src/pages/admin/AdminLayout.jsx"));
_c4 = AdminLayout;
const AdminDashboard = lazy(_c5 = () => import("/src/pages/admin/AdminDashboard.jsx"));
_c6 = AdminDashboard;
const AdminRegions = lazy(_c7 = () => import("/src/pages/admin/AdminRegions.jsx"));
_c8 = AdminRegions;
const AdminApartments = lazy(_c9 = () => import("/src/pages/admin/AdminApartments.jsx"));
_c0 = AdminApartments;
const AdminStores = lazy(_c1 = () => import("/src/pages/admin/AdminStores.jsx"));
_c10 = AdminStores;
const AdminMissions = lazy(_c11 = () => import("/src/pages/admin/AdminMissions.jsx"));
_c12 = AdminMissions;
const AdminContents = lazy(_c13 = () => import("/src/pages/admin/AdminContents.jsx"));
_c14 = AdminContents;
const AdminMembers = lazy(_c15 = () => import("/src/pages/admin/AdminMembers.jsx"));
_c16 = AdminMembers;
const AdminAuditions = lazy(_c17 = () => import("/src/pages/admin/AdminAuditions.jsx"));
_c18 = AdminAuditions;
const AdminPoints = lazy(_c19 = () => import("/src/pages/admin/AdminPoints.jsx"));
_c20 = AdminPoints;
const AdminLiveBroadcast = lazy(_c21 = () => import("/src/pages/admin/AdminLiveBroadcast.jsx"));
_c22 = AdminLiveBroadcast;
const AdminSupplies = lazy(_c23 = () => import("/src/pages/admin/AdminSupplies.jsx"));
_c24 = AdminSupplies;
const AdminSupplyManagers = lazy(_c25 = () => import("/src/pages/admin/AdminSupplyManagers.jsx"));
_c26 = AdminSupplyManagers;
const AdminSupplyTools = lazy(_c27 = () => import("/src/pages/admin/AdminSupplyTools.jsx"));
_c28 = AdminSupplyTools;
const AdminBackupTools = lazy(_c29 = () => import("/src/pages/admin/AdminBackupTools.jsx"));
_c30 = AdminBackupTools;
const RegionalAdminConsole = lazy(_c31 = () => import("/src/pages/admin/RegionalAdminConsole.jsx"));
_c32 = RegionalAdminConsole;
import "/src/styles/App.css";
const appNeonHomeStyles = `
  .su-appShell.su-app {
    background:
      radial-gradient(circle at top, rgba(34, 211, 238, 0.14), transparent 28%),
      radial-gradient(circle at 85% 12%, rgba(59, 130, 246, 0.16), transparent 24%),
      linear-gradient(180deg, #0b1220 0%, #0f172a 100%);
  }

  .su-appShell.su-app .su-appBody {
    background: transparent;
    min-height: auto !important;
    padding-bottom: 70px !important;
  }

  .su-home footer {
    margin-bottom: 0 !important;
    padding-bottom: 12px !important;
  }

  .su-home .bottomNavSpacer {
    height: 0 !important;
  }

  .su-home {
    background: transparent;
    color: #ffffff;
  }

  .su-home .su-tiles {
    gap: 15px;
    padding: 6px 16px 22px;
  }

  .su-home .su-tile {
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 14px;
    background: #ffffff;
    border-radius: 18px;
    border: 1px solid rgba(15,23,42,0.06);
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
    transition: all 0.2s ease;
  }

  .su-home .su-tile::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0));
    pointer-events: none;
  }

  .su-home .su-tile:hover,
  .su-home .su-tile:active {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(20,184,166,0.12);
    border-color: rgba(20,184,166,0.4);
  }

  .su-home .su-tile__title {
    color: #0f172a;
    font-size: 15px;
    font-weight: 700;
    line-height: 1.3;
    letter-spacing: -0.02em;
  }

  .su-home .su-tile__sub {
    color: #64748b;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.45;
    opacity: 1;
    filter: none;
  }

  .su-home .su-tile__icon {
    width: 42px;
    min-width: 42px;
    height: 42px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    background: linear-gradient(135deg,#e0f2fe,#ecfeff);
    box-shadow: 0 4px 10px rgba(20,184,166,0.15);
    border-left: 3px solid #14b8a6;
  }

  .su-home .su-tile__text {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
    text-align: left;
  }

  .su-home .su-tile--cyan {
    border-color: rgba(59, 130, 246, 0.14);
  }

  .su-home .su-tile--cyan .su-tile__icon {
    color: #3b82f6;
  }

  .su-home .su-tile--teal {
    border-color: rgba(20, 184, 166, 0.14);
  }

  .su-home .su-tile--teal .su-tile__icon {
    color: #14b8a6;
  }

  .su-home .su-tile--purple {
    border-color: rgba(236, 72, 153, 0.14);
  }

  .su-home .su-tile--purple .su-tile__icon {
    color: #be185d;
  }

  .su-home .su-tile--blue {
    border-color: rgba(168, 85, 247, 0.14);
  }

  .su-home .su-tile--blue .su-tile__icon {
    color: #7c3aed;
  }

  .su-home .su-tile--orange {
    border-color: rgba(249, 115, 22, 0.14);
  }

  .su-home .su-tile--orange .su-tile__icon {
    color: #f97316;
  }

  .su-home .su-tile--pink {
    border-color: rgba(236, 72, 153, 0.16);
  }

  .su-home .su-tile--pink .su-tile__icon {
    color: #ec4899;
  }

  .su-home .su-tile--violet {
    border-color: rgba(139, 92, 246, 0.14);
  }

  .su-home .su-tile--violet .su-tile__icon {
    color: #8b5cf6;
  }

  .su-home .su-tile--indigo {
    border-color: rgba(99, 102, 241, 0.14);
  }

  .su-home .su-tile--indigo .su-tile__icon {
    color: #6366f1;
  }

  .su-home .su-tile--red {
    border-color: rgba(239, 68, 68, 0.14);
  }

  .su-home .su-tile--red .su-tile__icon {
    color: #ef4444;
  }

  .su-home .su-tile--navy {
    border-color: rgba(30, 58, 138, 0.14);
  }

  .su-home .su-tile--navy .su-tile__icon {
    color: #1e3a8a;
  }

  .su-home .su-featuredCard,
  .su-home .su-featuredCard.su-featuredCard--compact {
    flex: 1 1 0;
    min-width: 0;
  }

  .su-home .su-featuredCard--half { padding: 16px 14px; min-height: 160px; }
  .su-home .su-featuredCard--half .su-featuredTitle { font-size: 20px; }
  .su-home .su-featuredCard--event {
    background: linear-gradient(135deg,#7f1d1d 0%,#9a3412 100%) !important;
    border-color: rgba(239,68,68,0.4) !important;
  }
  .su-home .su-featuredBadge--event { background: rgba(239,68,68,0.15); color: #fca5a5; border-color: rgba(239,68,68,0.3); }
  .su-home .su-featuredCta--event { background: linear-gradient(90deg,#ef4444,#f97316); color:#fff; }

  .shop-event-badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    background: linear-gradient(90deg,#ef4444,#f97316);
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    border-radius: 999px;
    box-shadow: 0 2px 8px rgba(239,68,68,.35);
    white-space: nowrap;
    pointer-events: none;
  }
  @keyframes shopEventPulse {
    0%,100% { opacity:1; transform:scale(1); }
    50% { opacity:.75; transform:scale(.95); }
  }
  .shop-event-badge--pulse { animation: shopEventPulse 1.6s ease-in-out infinite; }
    position: relative;
    overflow: hidden;
    border-radius: 22px;
    padding: 24px 22px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    box-shadow:
      0 14px 32px rgba(8, 47, 73, 0.24),
      0 0 18px rgba(34, 211, 238, 0.14);
  }

    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.10), transparent 42%);
    pointer-events: none;
  }

  .su-home .su-featuredCard:hover,
  .su-home .su-featuredCard:active {
    filter: brightness(1.04) !important;
    transform: none !important;
    box-shadow: 0 12px 24px rgba(34, 211, 238, 0.28), 0 4px 12px rgba(15, 23, 42, 0.1) !important;
  }

  .su-home .su-featuredBadge {
    display: inline-flex;
    align-items: center;
    transform: none !important;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(255, 215, 0, 0.12);
    color: #facc15;
    border: 1px solid rgba(250, 204, 21, 0.35);
    font-size: 12px;
    font-weight: 700;
    line-height: 1;
  }

  .su-home .su-featuredTitle {
    color: #ffffff;
    font-size: 28px;
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.02em;
    margin: 0;
  }

  .su-home .su-featuredSub {
    color: rgba(255, 255, 255, 0.82);
    font-size: 15px;
    line-height: 1.55;
    margin: 0;
  }

  .su-home .su-featuredCta {
    margin-top: 2px;
    background: linear-gradient(90deg, #22d3ee, #06b6d4);
    color: #ffffff;
    border-radius: 999px;
    padding: 12px 18px;
    font-weight: 700;
    box-shadow: 0 8px 20px rgba(6, 182, 212, 0.28);
    transition: transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease;
  }

  .su-home .su-featuredCta:hover,
  .su-home .su-featuredCta:active {
    filter: brightness(1.05);
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.10), 0 10px 24px rgba(6, 182, 212, 0.22);
  }

  .su-home .su-panel,
  .su-home .su-noticeBody,
  .su-home .su-missionEventCard {
    background: rgba(17, 24, 39, 0.88);
    border-color: rgba(0, 255, 200, 0.12);
    box-shadow: 0 0 10px rgba(0, 255, 200, 0.08);
  }

  .su-home .su-panelTitle,
  .su-home .su-cardTitle,
  .su-home .su-noticeTitle {
    color: #ffffff;
  }

  .su-home .su-cardSub,
  .su-home .su-noticeText,
  .su-home .su-noticeMeta,
  .su-home .su-cardMeta,
  .su-home .su-panelMore {
    color: #9ca3af;
  }

  .su-home .su-modal-content,
  .su-home .su-modal-content--mission {
    background: #ffffff;
    color: #111827;
    border: 1px solid rgba(15, 23, 42, 0.1);
    box-shadow: 0 16px 40px rgba(15, 23, 42, 0.18);
  }

  .su-home .su-modal-content *,
  .su-home .su-modal-content--mission * {
    color: #111827;
  }

  .su-home .su-modal-body {
    color: #374151;
    font-size: 15px;
    line-height: 1.6;
  }

  .su-home .su-modal-title {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
  }

  .su-home .su-modal-body > div:nth-child(2) {
    color: #6b7280;
    font-size: 13px;
  }

  .su-home .su-modal-confirmBtn {
    background: #14b8a6;
    color: #ffffff !important;
    border-radius: 12px;
    font-weight: 600;
  }

  .su-home .su-modal-close {
    background: #f1f5f9;
    color: #111827 !important;
    border-radius: 10px;
  }

  .su-home .su-modal-overlay .su-modal-content {
    background: #ffffff !important;
    color: #111827 !important;
  }

  .su-home .su-modal-overlay .su-modal-content * {
    color: #111827 !important;
  }

  .su-home .su-modal-overlay .su-modal-content .su-modal-title,
  .su-home .su-modal-overlay .su-modal-content h1,
  .su-home .su-modal-overlay .su-modal-content h2,
  .su-home .su-modal-overlay .su-modal-content h3 {
    color: #111827 !important;
    font-weight: 700;
  }

  .su-home .su-modal-overlay .su-modal-content p,
  .su-home .su-modal-overlay .su-modal-content span,
  .su-home .su-modal-overlay .su-modal-content div {
    color: #374151 !important;
  }

  .su-home .su-modal-overlay .su-modal-content .su-modal-body > div:nth-child(2) {
    color: #6b7280 !important;
    font-size: 13px;
  }

  .su-home .su-modal-overlay .su-modal-content .su-modal-confirmBtn,
  .su-home .su-modal-overlay .su-modal-content button.su-modal-confirmBtn {
    background: #14b8a6 !important;
    color: #ffffff !important;
    border-radius: 12px;
    font-weight: 600;
  }

  .su-home .su-modal-overlay .su-modal-content .su-modal-cancelBtn {
    color: #111827 !important;
  }

  .su-home .su-modal-overlay .su-modal-content .su-modal-close {
    background: #f1f5f9 !important;
    color: #111827 !important;
  }

  .su-home .su-noticeBody {
    position: relative;
    cursor: pointer;
  }

  .su-home .su-noticeBody > .su-noticeTitle,
  .su-home .su-noticeBody > .su-noticeMeta {
    pointer-events: none;
  }

  .su-home .su-noticeBody > .su-noticeText {
    position: absolute;
    inset: 0;
    margin-top: 0 !important;
    padding: 10px 8px 8px;
    display: block;
    -webkit-line-clamp: unset;
    line-height: 1.6;
    cursor: pointer;
    color: transparent;
    z-index: 5;
  }

  .su-home .su-noticeBody > .su-noticeText::before {
    content: "";
    position: absolute;
    inset: 0;
  }

  .su-home .su-panel .su-carousel {
    margin-top: 0;
  }

  .su-home .su-panel--live .su-liveRail,
  .su-home .su-panel .su-feedGrid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .su-home .su-panel--live .su-liveCard,
  .su-home .su-panel .su-feedCard {
    min-width: 0;
    width: 100%;
    height: 118px;
    border-radius: 14px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-sizing: border-box;
  }

  .su-home .su-panel--live .su-liveBadge,
  .su-home .su-panel .su-feedBadge {
    font-size: 10px;
    padding: 3px 6px;
  }

  .su-home .su-panel--live .su-liveTitle,
  .su-home .su-panel .su-feedTitle {
    font-size: 14px;
    line-height: 1.3;
    font-weight: 700;
    margin-top: 6px;
    color: #111827;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }

  .su-home .su-panel--live .su-liveSub,
  .su-home .su-panel .su-feedSub {
    font-size: 12px;
    line-height: 1.35;
    color: #6b7280;
    margin-top: 4px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }

  .su-home .su-panel .su-carousel__viewport {
    overflow-x: auto;
    padding: 2px 0 2px;
    scrollbar-width: thin;
    scroll-snap-type: x proximity;
  }

  .su-home .su-panel .su-carousel__track {
    display: flex;
    gap: 10px;
    align-items: stretch;
    justify-content: flex-start;
  }

  .su-home .su-panel .su-carousel__track > .su-carouselCard:only-child,
  .su-home .su-panel .su-carousel__track > .su-liveCard:only-child {
    margin-left: auto;
    margin-right: auto;
  }

  .su-home .su-panel .su-carousel__track:empty {
    display: block;
    min-height: 198px;
    position: relative;
  }

  .su-home .su-panel .su-carousel__track:empty::before {
    content: "";
    display: block;
    margin: 0 auto;
    width: min(280px, calc(100vw - 72px));
    max-width: 300px;
    height: 188px;
    background: #ffffff;
    border-radius: 18px;
    border: 1px solid rgba(15, 23, 42, 0.06);
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  }

  .su-home .su-panel .su-carousel__track:empty::after {
    content: "ì¤ë¹ ì¤ì¸ ë°©ì¡Aê³§ ì ì½íì¸ ê° ê³µê°ë©ëë¤AAê³µì  ë°©ì¡Aí­íë©´ íìì¼ë¡ ì¬ìë©ëë¤";
    white-space: pre-line;
    position: absolute;
    left: 50%;
    top: 10px;
    transform: translateX(-50%);
    width: min(248px, calc(100vw - 104px));
    max-width: 268px;
    min-height: 168px;
    border-radius: 14px;
    padding: 12px;
    background: linear-gradient(135deg, #0f172a, #1e3a8a);
    color: rgba(255, 255, 255, 0.9);
    font-size: 12px;
    font-weight: 500;
    line-height: 1.35;
    box-sizing: border-box;
  }

  .su-home .su-panel .su-carouselCard {
    min-width: min(280px, calc(100vw - 72px));
    max-width: 300px;
    background: #ffffff;
    border-radius: 18px;
    border: 1px solid rgba(15, 23, 42, 0.06);
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
    overflow: hidden;
    padding: 8px;
    scroll-snap-align: start;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    cursor: pointer;
  }

  .su-home .su-panel .su-carouselCard.su-liveCard {
    border-radius: 18px;
  }

  .su-home .su-panel .su-carouselCard:hover,
  .su-home .su-panel .su-carouselCard:active {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(15, 23, 42, 0.10);
  }

  .su-home .su-panel .su-carouselCard .su-liveThumb {
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 14px;
    overflow: hidden;
    background: linear-gradient(135deg, #0f172a, #1e3a8a);
    position: relative;
  }

  .su-home .su-panel .su-carouselCard .su-liveThumb::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    width: 52px;
    height: 52px;
    border-radius: 999px;
    transform: translate(-50%, -50%);
    background: rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.24);
    z-index: 2;
    pointer-events: none;
  }

  .su-home .su-panel .su-carouselCard .su-liveThumb::before {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-40%, -50%);
    border-top: 9px solid transparent;
    border-bottom: 9px solid transparent;
    border-left: 14px solid #ffffff;
    z-index: 3;
    pointer-events: none;
  }

  .su-home .su-panel .su-carouselCard .su-liveThumb > span {
    opacity: 0;
  }

  .su-home .su-panel .su-carouselCard .su-liveThumb img,
  .su-home .su-panel .su-carouselCard .su-liveThumb video,
  .su-home .su-panel .su-carouselCard .su-liveThumb iframe {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .su-home .su-panel .su-carouselCard .su-liveTitle {
    margin-top: 8px;
    color: #111827;
    font-size: 15px;
    line-height: 1.3;
    font-weight: 700;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }

  .su-home .su-panel .su-carouselCard .su-liveTitle + .su-liveSub,
  .su-home .su-panel .su-carouselCard .su-liveSub {
    color: #6b7280;
    font-size: 12px;
    font-weight: 500;
    margin-top: 2px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }

  .su-home .su-panel .su-carouselCard .su-liveTitle::after {
    content: "í­íë©´ ì¬ìë©ëë¤";
    display: block;
    margin-top: 2px;
    font-size: 11px;
    font-weight: 500;
    color: #6b7280;
  }

  .su-home .su-panel:nth-of-type(6) .su-carousel__track:empty::after {
    content: "ì¤ë¹ ì¤ì¸ ì¤ëìAê³§ ì ììì´ ê³µê°ë©ëë¤AAì¤ëìAìëª¨ Â· TOP3 í¬í";
    background: linear-gradient(135deg, #1f1147, #5b21b6);
  }

  .su-home .su-panel .su-carouselCard .su-emptyState {
    width: 100%;
    min-height: 148px;
    border-radius: 14px;
    background: linear-gradient(135deg, #0f172a, #1e3a8a);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
    gap: 6px;
    padding: 16px;
    position: relative;
    overflow: hidden;
  }

  .su-home .su-panel .su-carouselCard .su-emptyState::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 42%;
    width: 40px;
    height: 40px;
    border-radius: 999px;
    transform: translate(-50%, -50%);
    background: rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }

  .su-home .su-panel .su-carouselCard .su-emptyState__title {
    color: #ffffff;
    font-size: 14px;
    font-weight: 700;
    position: relative;
    z-index: 1;
  }

  .su-home .su-panel .su-carouselCard .su-emptyState__sub {
    color: rgba(255, 255, 255, 0.84);
    font-size: 12px;
    font-weight: 500;
    position: relative;
    z-index: 1;
  }

  .su-home .su-panel .su-carouselCard:nth-child(2n) .su-liveThumb {
    background: linear-gradient(135deg, #1f1147, #5b21b6);
  }

  /* Home service-app overrides */
  .su-appShell.su-app {
    background: linear-gradient(180deg, #f5f7fb 0%, #f8fafc 100%) !important;
  }

  .su-home {
    background: transparent !important;
    color: #0f172a !important;
  }

  .su-home .su-tiles {
    gap: 12px !important;
    padding: 8px 16px 24px !important;
  }

  .su-home .su-tile,
  .su-home .su-tile--cyan,
  .su-home .su-tile--teal,
  .su-home .su-tile--pink,
  .su-home .su-tile--violet,
  .su-home .su-tile--orange,
  .su-home .su-tile--indigo,
  .su-home .su-tile--red,
  .su-home .su-tile--navy {
    background: #ffffff !important;
    border: 1px solid rgba(15, 23, 42, 0.06) !important;
    border-radius: 20px !important;
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.05) !important;
    transform: none !important;
  }

  .su-home .su-tile::before {
    display: none !important;
  }

  .su-home .su-tile:hover,
  .su-home .su-tile:active {
    transform: translateY(-1px) !important;
    box-shadow: 0 10px 22px rgba(15, 23, 42, 0.08) !important;
    border-color: rgba(15, 23, 42, 0.06) !important;
  }

  .su-home .su-tile__icon {
    width: 46px !important;
    min-width: 46px !important;
    height: 46px !important;
    border-radius: 14px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    background: #f8fafc !important;
    border: 1px solid rgba(15, 23, 42, 0.05) !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.8) !important;
    font-size: 20px !important;
  }

  .su-home .su-tile__text {
    gap: 2px !important;
    min-width: 0 !important;
    flex: 1 1 auto !important;
    justify-content: center !important;
    align-items: center !important;
    text-align: center !important;
    padding-right: 4px !important;
  }

  .su-home .su-tile__title {
    font-size: 16px !important;
    font-weight: 700 !important;
    color: #1e293b !important;
    letter-spacing: -0.02em !important;
    line-height: 1.22 !important;
    min-height: calc(1.22em * 2) !important;
    display: -webkit-box !important;
    -webkit-line-clamp: 2 !important;
    -webkit-box-orient: vertical !important;
    overflow: hidden !important;
    word-break: keep-all !important;
    overflow-wrap: normal !important;
    text-align: center !important;
    width: 100% !important;
  }

  .su-home .su-tile__sub {
    font-size: 12px !important;
    font-weight: 500 !important;
    color: #64748b !important;
    line-height: 1.3 !important;
    display: -webkit-box !important;
    -webkit-line-clamp: 1 !important;
    -webkit-box-orient: vertical !important;
    overflow: hidden !important;
    word-break: keep-all !important;
    text-align: center !important;
    width: 100% !important;
  }

  .su-home .su-tile--cyan .su-tile__icon { color: #3b82f6 !important; }
  .su-home .su-tile--teal .su-tile__icon { color: #14b8a6 !important; }
  .su-home .su-tile--pink .su-tile__icon { color: #ec4899 !important; }
  .su-home .su-tile--violet .su-tile__icon { color: #8b5cf6 !important; }
  .su-home .su-tile--orange .su-tile__icon { color: #f59e0b !important; }
  .su-home .su-tile--indigo .su-tile__icon { color: #6366f1 !important; }
  .su-home .su-tile--red .su-tile__icon { color: #ef4444 !important; }
  .su-home .su-tile--navy .su-tile__icon { color: #334155 !important; }

  .su-home .su-featuredCard,
  .su-home .su-featuredCard.su-featuredCard--compact,
  .su-home .su-featuredCard.su-featuredCard--event {
    background: #ffffff !important;
    border: 1px solid rgba(15, 23, 42, 0.06) !important;
    border-radius: 20px !important;
    padding: 16px !important;
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.05) !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    text-align: center !important;
    gap: 6px !important;
  }

  .su-home .su-featuredCard--half {
    min-height: 156px !important;
  }

  .su-home .su-featuredCard::before,
  .su-home .su-featuredCard::after {
    display: none !important;
  }

  .su-home .su-featuredCard:hover,
  .su-home .su-featuredCard:active {
    transform: translateY(-1px) !important;
    box-shadow: 0 10px 22px rgba(15, 23, 42, 0.08) !important;
  }

  .su-home .su-featuredBadge {
    align-self: center !important;
    margin-bottom: 8px !important;
    padding: 5px 10px !important;
    border-radius: 999px !important;
    background: rgba(20, 184, 166, 0.10) !important;
    color: #0f766e !important;
    border: 1px solid rgba(20, 184, 166, 0.22) !important;
    font-size: 11px !important;
    font-weight: 700 !important;
  }

  .su-home .su-featuredBadge--event {
    background: rgba(249, 115, 22, 0.10) !important;
    color: #f97316 !important;
    border: 1px solid rgba(249, 115, 22, 0.22) !important;
  }

  .su-home .su-featuredTitle,
  .su-home .su-featuredCard--half .su-featuredTitle {
    color: #0f172a !important;
    font-size: 19px !important;
    font-weight: 800 !important;
    line-height: 1.22 !important;
    text-align: center !important;
    text-shadow: none !important;
    margin: 0 !important;
    max-width: none !important;
  }

  .su-home .su-featuredSub,
  .su-home .su-featuredCard--compact .su-featuredSub {
    display: block !important;
    margin: 2px 0 8px 0 !important;
    color: #64748b !important;
    font-size: 13px !important;
    font-weight: 500 !important;
    line-height: 1.45 !important;
    text-align: center !important;
  }

  .su-home .su-featuredCta,
  .su-home .su-featuredCta--event {
    margin-top: 10px !important;
    align-self: center !important;
    background: linear-gradient(135deg, #19c7b2 0%, #22d3ee 55%, #44e7f2 100%) !important;
    color: #ffffff !important;
    border-radius: 999px !important;
    border: 1px solid rgba(255,255,255,0.16) !important;
    font-weight: 700 !important;
    padding: 10px 16px !important;
    box-shadow: 0 10px 20px rgba(34, 211, 238, 0.24), 0 3px 10px rgba(13, 148, 136, 0.18) !important;
    font-size: 14px !important;
  }

  .su-home .su-featuredCta--event {
    background: linear-gradient(135deg, #ff8a4c 0%, #fb7185 52%, #f97316 100%) !important;
    border-color: rgba(255,255,255,0.14) !important;
    box-shadow: 0 10px 20px rgba(249, 115, 22, 0.24), 0 3px 10px rgba(244, 114, 182, 0.14) !important;
  }

  .su-home .su-featuredCta:hover,
  .su-home .su-featuredCta:active {
    transform: translateY(-1px) !important;
    filter: brightness(1.04) !important;
    box-shadow: 0 12px 24px rgba(34, 211, 238, 0.28), 0 4px 12px rgba(15, 23, 42, 0.1) !important;
  }

  .su-home .su-featuredCta--event:hover,
  .su-home .su-featuredCta--event:active {
    filter: brightness(1.05) !important;
    box-shadow: 0 12px 24px rgba(249, 115, 22, 0.28), 0 4px 12px rgba(15, 23, 42, 0.1) !important;
  }

  .su-home .su-hero2 {
    width: calc(100% - 16px) !important;
    max-width: calc(100% - 16px) !important;
    box-sizing: border-box !important;
    margin: 0 auto 16px !important;
    padding: 16px 18px !important;
    border-radius: 18px !important;
    min-height: 0 !important;
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06) !important;
  }

  .su-home .su-hero2 > div:nth-of-type(3) {
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    aspect-ratio: 4 / 1 !important;
    position: relative !important;
    overflow: hidden !important;
    border-radius: var(--r-section) !important;
    background: #f3f4f6 !important;
  }

  .su-home .su-hero2 > div:nth-of-type(3) > div:first-child {
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
  }

  .su-home .su-hero2 > div:nth-of-type(3) > div:first-child > div {
    position: relative !important;
    min-width: 100% !important;
    height: 100% !important;
    overflow: hidden !important;
  }

  .su-home .su-hero2 > div:nth-of-type(3) img {
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
    display: block !important;
    max-width: none !important;
  }

  .su-home .su-top--home {
    padding: 2px 14px !important;
    border-radius: 18px !important;
    background: linear-gradient(135deg, #0f766e, #155e75) !important;
    box-shadow: 0 6px 18px rgba(15, 118, 110, 0.22) !important;
  }

  .su-home .su-brandRow {
    display: flex !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 0 !important;
    height: 50px !important;
    min-height: 50px !important;
    padding: 0 6px 0 0 !important;
    border-radius: 12px !important;
    background: rgba(255, 255, 255, 0.03) !important;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
    overflow: visible !important;
    flex-wrap: nowrap !important;
    margin-left: 0 !important;
    text-align: left !important;
  }

  .su-home .su-brandRow > * {
    margin: 0 !important;
    padding: 0 !important;
    text-align: left !important;
  }

  .su-home .su-brandRow img,
  .su-home .su-logoMark,
  .su-home .su-logoMark img {
    margin-left: 0 !important;
    padding-left: 0 !important;
  }

  .su-home .su-brand {
    margin-left: -2px !important;
    padding-left: 0 !important;
    min-width: 0 !important;
    align-items: center !important;
    line-height: 1.05 !important;
    transform: translateY(1px) !important;
  }

  .su-home .su-logoMark {
    display: flex !important;
    align-items: center !important;
    justify-content: flex-start !important;
    overflow: visible !important;
    width: auto !important;
    height: 112px !important;
    flex: 0 0 auto !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }

  .su-home .su-logoMark img {
    height: 112px !important;
    width: auto !important;
    max-height: 112px !important;
    max-width: none !important;
    object-fit: contain !important;
    display: block !important;
    filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.3)) !important;
    mix-blend-mode: normal !important;
  }

  .su-home .su-brand {
    font-size: 18px !important;
    font-weight: 600 !important;
    color: #ffffff !important;
    letter-spacing: 0.5px !important;
    opacity: 0.9 !important;
    display: flex !important;
    align-items: center !important;
    line-height: 1.05 !important;
    white-space: nowrap !important;
  }

  .su-home .su-searchTrigger {
    width: 38px !important;
    height: 38px !important;
    border-radius: 50% !important;
    background: rgba(255, 255, 255, 0.12) !important;
    backdrop-filter: blur(8px) !important;
    -webkit-backdrop-filter: blur(8px) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.18) !important;
  }

  @media (max-width: 540px) {
    .su-appShell.su-app .su-appBody {
      padding-bottom: 62px !important;
    }

    .su-home .su-top--home {
      margin: 8px 0 10px !important;
      min-height: 58px !important;
      padding: 0 12px !important;
      border-radius: 18px !important;
    }

    .su-home .su-brandRow {
      gap: 2px !important;
      height: 42px !important;
      min-height: 42px !important;
      padding: 0 4px 0 0 !important;
    }

    .su-home .su-logoMark {
      height: 84px !important;
    }

    .su-home .su-logoMark img {
      height: 84px !important;
      max-height: 84px !important;
    }

    .su-home .su-brand {
      font-size: 16px !important;
      letter-spacing: 0.2px !important;
    }

    .su-home .su-searchTrigger {
      width: 34px !important;
      min-width: 34px !important;
      height: 34px !important;
    }

    .su-home .su-searchTrigger svg {
      width: 16px !important;
      height: 16px !important;
    }

    .su-home .su-hero2 {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 0 12px !important;
      padding: 12px 14px !important;
      border-radius: 16px !important;
    }

    .su-home .su-hero2 > div:first-child {
      margin-bottom: 12px !important;
    }

    .su-home .su-heroPill {
      font-size: 12px !important;
      padding: 8px 14px !important;
    }

    .su-home .su-hero2 + section {
      padding: 0 2px !important;
      margin-bottom: 6px !important;
    }

    .su-home .su-hero2 + section > div {
      gap: 10px !important;
    }

    .su-home .su-featuredCard,
    .su-home .su-featuredCard.su-featuredCard--compact,
    .su-home .su-featuredCard.su-featuredCard--event {
      padding: 14px 12px !important;
      border-radius: 18px !important;
      gap: 4px !important;
    }

    .su-home .su-featuredCard--half {
      min-height: 138px !important;
    }

    .su-home .su-featuredBadge,
    .su-home .su-featuredBadge--event {
      margin-bottom: 6px !important;
      padding: 4px 9px !important;
      font-size: 10px !important;
    }

    .su-home .su-featuredTitle,
    .su-home .su-featuredCard--half .su-featuredTitle {
      font-size: 17px !important;
      line-height: 1.18 !important;
    }

    .su-home .su-featuredSub,
    .su-home .su-featuredCard--compact .su-featuredSub {
      margin: 1px 0 6px 0 !important;
      font-size: 12px !important;
      line-height: 1.35 !important;
    }

    .su-home .su-featuredCta,
    .su-home .su-featuredCta--event {
      margin-top: 8px !important;
      padding: 9px 14px !important;
      font-size: 13px !important;
      box-shadow: 0 8px 16px rgba(34, 211, 238, 0.2), 0 2px 8px rgba(13, 148, 136, 0.14) !important;
    }

    .su-home .su-featuredCta--event {
      box-shadow: 0 8px 16px rgba(249, 115, 22, 0.22), 0 2px 8px rgba(244, 114, 182, 0.12) !important;
    }

    .su-home .su-tiles {
      gap: 10px !important;
      padding: 4px 2px 18px !important;
    }

    .su-home .su-tile {
      gap: 7px !important;
      padding: 12px !important;
      border-radius: 17px !important;
      align-items: flex-start !important;
    }

    .su-home .su-tile__icon {
      width: 34px !important;
      min-width: 34px !important;
      height: 34px !important;
      border-radius: 10px !important;
      font-size: 16px !important;
    }

    .su-home .su-tile__title {
      font-size: 13px !important;
      line-height: 1.2 !important;
      min-height: calc(1.2em * 2) !important;
    }

    .su-home .su-tile__sub {
      font-size: 11px !important;
      line-height: 1.18 !important;
      min-height: 1.18em !important;
      -webkit-line-clamp: 2 !important;
    }

    .su-home .su-tile__text {
      gap: 2px !important;
      align-self: stretch !important;
      align-items: center !important;
      justify-content: center !important;
      text-align: center !important;
      padding-right: 3px !important;
    }

    .su-home .su-panel,
    .su-home .su-noticeBody,
    .su-home .su-missionEventCard {
      border-radius: 18px !important;
      box-shadow: 0 6px 16px rgba(15, 23, 42, 0.05) !important;
    }

    .su-home .su-panel {
      padding: 14px 14px 16px !important;
      margin-bottom: 16px !important;
    }

    .su-home section.su-panel,
    .su-home section.su-panel.su-panel--notice,
    .su-home section.su-panel.su-panel--live {
      margin-left: 0 !important;
      margin-right: 0 !important;
    }

    .su-home .su-panelHead {
      padding: 0 0 8px !important;
    }

    .su-home .su-panelTitle,
    .su-home .su-cardTitle,
    .su-home .su-noticeTitle {
      font-size: 14px !important;
      line-height: 1.25 !important;
    }

    .su-home .su-panelMore {
      padding: 8px 11px !important;
      border-radius: 12px !important;
      font-size: 11px !important;
    }

    .su-home .su-noticeMiniList {
      gap: 8px !important;
      margin-top: 10px !important;
    }

    .su-home .su-noticeMiniCard {
      padding: 10px 12px !important;
      border-radius: 12px !important;
      box-shadow: 0 3px 10px rgba(15,23,42,0.04) !important;
    }

    .su-home .su-noticeMiniTitle {
      font-size: 14px !important;
      line-height: 1.3 !important;
    }

    .su-home .su-noticeMiniMeta {
      margin-top: 3px !important;
      font-size: 11px !important;
    }

    .su-home .su-panel--live .su-liveRail,
    .su-home .su-panel .su-feedGrid {
      gap: 8px !important;
    }

    .su-home .su-panel--live .su-liveCard,
    .su-home .su-panel .su-feedCard {
      height: 102px !important;
      padding: 10px !important;
      border-radius: 12px !important;
    }

    .su-home .su-panel--live .su-liveBadge,
    .su-home .su-panel .su-feedBadge,
    .su-home .su-liveBadge {
      font-size: 9px !important;
      padding: 3px 6px !important;
      margin-bottom: 6px !important;
    }

    .su-home .su-panel--live .su-liveTitle,
    .su-home .su-panel .su-feedTitle,
    .su-home .su-liveTitle {
      font-size: 13px !important;
      line-height: 1.22 !important;
      margin-top: 4px !important;
    }

    .su-home .su-panel--live .su-liveSub,
    .su-home .su-panel .su-feedSub,
    .su-home .su-liveSub {
      font-size: 11px !important;
      line-height: 1.28 !important;
      margin-top: 3px !important;
    }

    .su-home .su-panel .su-carousel__track {
      gap: 8px !important;
    }

    .su-home .su-panel .su-carouselCard {
      min-width: min(248px, calc(100vw - 44px)) !important;
      max-width: 272px !important;
      border-radius: 16px !important;
      padding: 6px !important;
    }

    .su-home .su-tile:hover,
    .su-home .su-tile:active,
    .su-home .su-featuredCard:hover,
    .su-home .su-featuredCard:active,
    .su-home .su-featuredCta:hover,
    .su-home .su-featuredCta:active,
    .su-home .su-featuredCta--event:hover,
    .su-home .su-featuredCta--event:active,
    .su-home .su-panel .su-carouselCard:hover,
    .su-home .su-panel .su-carouselCard:active,
    .su-home .su-searchTrigger:hover,
    .su-home .su-searchTrigger:active {
      transform: none !important;
    }

    .su-home .su-tile:hover,
    .su-home .su-tile:active,
    .su-home .su-featuredCard:hover,
    .su-home .su-featuredCard:active,
    .su-home .su-featuredCta:hover,
    .su-home .su-featuredCta:active,
    .su-home .su-featuredCta--event:hover,
    .su-home .su-featuredCta--event:active,
    .su-home .su-panel .su-carouselCard:hover,
    .su-home .su-panel .su-carouselCard:active,
    .su-home .su-searchTrigger:hover,
    .su-home .su-searchTrigger:active {
      opacity: 0.98 !important;
    }

    .su-home .su-panel .su-carouselCard .su-liveThumb {
      border-radius: 12px !important;
    }

    .su-home .su-panel .su-carouselCard .su-liveThumb::after {
      width: 44px !important;
      height: 44px !important;
    }

    .su-home .su-panel .su-carouselCard .su-liveThumb::before {
      border-top: 7px solid transparent !important;
      border-bottom: 7px solid transparent !important;
      border-left: 11px solid #ffffff !important;
    }

    .su-home .su-panel .su-carouselCard .su-liveTitle {
      font-size: 13px !important;
      margin-top: 6px !important;
    }

    .su-home .su-panel .su-carouselCard .su-liveTitle::after {
      font-size: 10px !important;
      margin-top: 1px !important;
    }

    .su-home .su-panel .su-carouselCard .su-emptyState {
      min-height: 126px !important;
      padding: 12px !important;
      gap: 5px !important;
    }

    .su-home .su-panel .su-carouselCard .su-emptyState__title {
      font-size: 13px !important;
    }

    .su-home .su-panel .su-carouselCard .su-emptyState__sub {
      font-size: 11px !important;
    }
  }

  @media (min-width: 1024px) {
    .su-home .su-panel--live .su-liveCard,
    .su-home .su-panel .su-feedCard {
      height: 126px;
    }

    .su-home .su-panel .su-carouselCard {
      min-width: 280px;
      max-width: 340px;
    }
  }
`;
function AppBottomNav({ isLoggedIn, authReady, onLogout }) {
  _s();
  const navigate = useNavigate();
  const location = useLocation();
  const [bottomBanner, setBottomBanner] = useState(null);
  const [bannerClosed, setBannerClosed] = useState(() => {
    try {
      return sessionStorage.getItem("su_banner_closed") === "1";
    } catch (e) {
      return false;
    }
  });
  useEffect(() => {
    let mounted = true;
    fetch("/api/banners?type=bottom_banner&is_active=true").then((response) => response.ok ? response.json() : null).then((data) => {
      if (!mounted) return;
      const list = data && (data.banners || data.data) || [];
      setBottomBanner(Array.isArray(list) && list.length ? list[0] : null);
    }).catch(() => {
      if (mounted) setBottomBanner(null);
    });
    return () => {
      mounted = false;
    };
  }, []);
  const currentPath = location.pathname;
  if (currentPath === "/auth" || currentPath === "/login") return null;
  const session = getSession();
  const storedRegionId = (() => {
    try {
      const raw = localStorage.getItem("selectedRegionId");
      return raw ? String(raw).trim() : null;
    } catch (e) {
      return null;
    }
  })();
  const memberRegionId = (() => {
    const raw = getCurrentRegionId() || session?.regionId || storedRegionId || null;
    if (raw == null) return null;
    const normalized = String(raw).trim();
    return normalized && normalized !== "undefined" && normalized !== "null" ? normalized : null;
  })();
  const isPortalActive = currentPath === "/region" || currentPath.startsWith("/portal/region/") || /^\/r\/[^/]+(?:\/.*)?$/.test(currentPath);
  const tabs = [
    {
      key: "home",
      label: "í",
      active: currentPath === "/home" || currentPath === "/",
      onClick: () => navigate("/home")
    },
    {
      key: "auth",
      label: authReady ? isLoggedIn ? "ë¡ê·¸ìì" : "ë¡ê·¸ì¸" : " ",
      tone: isLoggedIn ? "danger" : void 0,
      active: false,
      onClick: async () => {
        if (!authReady) return;
        if (!isLoggedIn) {
          navigate("/auth");
          return;
        }
        const confirmed = window.confirm("ì ë§ ë¡ê·¸ììíìê² ìµëê¹?");
        if (!confirmed) return;
        try {
          await signOut();
        } catch (e) {
          console.error("[AppBottomNav] Logout error:", e);
        }
        try {
          onLogout?.();
        } catch (e) {
        }
        navigate("/home");
      }
    },
    {
      key: "portal",
      label: "ë´ì§ì­í¬í¸",
      active: isPortalActive,
      onClick: () => {
        if (memberRegionId) {
          try {
            localStorage.setItem("selectedRegionId", memberRegionId);
          } catch (e) {
          }
          navigate(`/r/${memberRegionId}`);
          return;
        }
        navigate("/region");
      }
    },
    {
      key: "my",
      label: "ë§ì´ì¤í¼ì¤",
      active: currentPath === "/my" || currentPath === "/myoffice" || currentPath.startsWith("/my/"),
      onClick: () => {
        if (!isLoggedIn) {
          navigate("/auth", { state: { returnTo: "/my" } });
          return;
        }
        navigate("/my");
      }
    }
  ];
  const navShellStyle = {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    display: "flex",
    justifyContent: "center",
    padding: "0 10px calc(env(safe-area-inset-bottom, 0px) + 4px)",
    pointerEvents: "none"
  };
  const navStyle = {
    pointerEvents: "auto",
    width: "min(100%, 438px)",
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 4,
    padding: "3px 4px 2px",
    borderRadius: 12,
    background: "linear-gradient(180deg, rgba(247,252,255,0.94), rgba(239,246,255,0.92))",
    border: "1px solid rgba(14,116,144,0.26)",
    boxShadow: "0 -3px 10px rgba(15,23,42,0.10)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)"
  };
  const bannerStyle = {
    position: "fixed",
    left: "50%",
    transform: "translateX(-50%)",
    bottom: "calc(env(safe-area-inset-bottom, 0px) + 66px)",
    width: "min(calc(100vw - 20px), 438px)",
    zIndex: 9998,
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(226,232,240,0.92)",
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)"
  };
  return /* @__PURE__ */ jsxDEV(Fragment, { children: [
    bottomBanner && !bannerClosed ? /* @__PURE__ */ jsxDEV("div", { style: bannerStyle, children: [
      bottomBanner.link_url ? /* @__PURE__ */ jsxDEV(
        "a",
        {
          href: bottomBanner.link_url,
          target: "_blank",
          rel: "noopener noreferrer",
          style: { flex: 1, display: "flex", alignItems: "center", textDecoration: "none", minWidth: 0 },
          children: bottomBanner.image_url ? /* @__PURE__ */ jsxDEV(
            "img",
            {
              src: bottomBanner.image_url,
              alt: bottomBanner.alt || "ê´ê³ ",
              style: { height: 40, maxWidth: "100%", objectFit: "contain", display: "block" }
            },
            void 0,
            false,
            {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 1678,
              columnNumber: 11
            },
            this
          ) : /* @__PURE__ */ jsxDEV("span", { style: { fontSize: 13, color: "#0f172a" }, children: bottomBanner.alt || "ê´ê³ " }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 1684,
            columnNumber: 11
          }, this)
        },
        void 0,
        false,
        {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 1671,
          columnNumber: 9
        },
        this
      ) : /* @__PURE__ */ jsxDEV("div", { style: { flex: 1, minWidth: 0 }, children: bottomBanner.image_url ? /* @__PURE__ */ jsxDEV(
        "img",
        {
          src: bottomBanner.image_url,
          alt: bottomBanner.alt || "ê´ê³ ",
          style: { height: 40, maxWidth: "100%", objectFit: "contain", display: "block" }
        },
        void 0,
        false,
        {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 1690,
          columnNumber: 11
        },
        this
      ) : /* @__PURE__ */ jsxDEV("span", { style: { fontSize: 13, color: "#0f172a" }, children: bottomBanner.alt || "ê´ê³ " }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 1696,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 1688,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          type: "button",
          onClick: () => {
            setBannerClosed(true);
            try {
              sessionStorage.setItem("su_banner_closed", "1");
            } catch (e) {
            }
          },
          "aria-label": "ë°°ë ë«ê¸°",
          style: {
            border: 0,
            background: "transparent",
            color: "#94a3b8",
            fontSize: 18,
            lineHeight: 1,
            padding: "4px 2px 4px 6px",
            cursor: "pointer"
          },
          children: "x"
        },
        void 0,
        false,
        {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 1700,
          columnNumber: 11
        },
        this
      )
    ] }, void 0, true, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 1669,
      columnNumber: 7
    }, this) : null,
    /* @__PURE__ */ jsxDEV("div", { style: navShellStyle, children: /* @__PURE__ */ jsxDEV("nav", { style: navStyle, role: "navigation", "aria-label": "íë¨ ë¤ë¹ê²ì´ì", children: tabs.map((tab) => {
      const isActive = !!tab.active;
      const isDanger = tab.tone === "danger";
      return /* @__PURE__ */ jsxDEV(
        "button",
        {
          type: "button",
          onClick: tab.onClick,
          "aria-current": isActive ? "page" : void 0,
          style: {
            appearance: "none",
            WebkitAppearance: "none",
            minWidth: 0,
            height: 30,
            padding: "1px 4px 0",
            borderRadius: 8,
            border: isActive ? "1px solid rgba(13,148,136,0.46)" : "1px solid rgba(148,163,184,0.16)",
            background: isActive ? "linear-gradient(180deg, rgba(45,212,191,0.22), rgba(15,118,110,0.14))" : "linear-gradient(180deg, rgba(255,255,255,0.74), rgba(248,250,252,0.62))",
            color: isActive ? "#0f766e" : isDanger ? "#dc2626" : "#475569",
            boxShadow: isActive ? "0 0 8px rgba(20,184,166,0.18)" : "none",
            fontSize: tab.key === "portal" ? 10.5 : 11,
            fontWeight: isActive ? 800 : 700,
            letterSpacing: "-0.02em",
            textShadow: isActive ? "0 0 4px rgba(45,212,191,0.24)" : isDanger ? "0 0 3px rgba(248,113,113,0.2)" : "none",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            backdropFilter: "none",
            WebkitBackdropFilter: "none",
            WebkitTapHighlightColor: "transparent",
            outline: "none",
            userSelect: "none",
            touchAction: "manipulation",
            cursor: "pointer",
            transition: "background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease"
          },
          children: [
            /* @__PURE__ */ jsxDEV("span", { style: { lineHeight: 1 }, children: tab.label }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 1776,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV(
              "span",
              {
                "aria-hidden": "true",
                style: {
                  display: "block",
                  width: isActive ? "52%" : "0%",
                  height: 1.5,
                  borderRadius: 999,
                  background: "linear-gradient(90deg,#22d3ee,#2dd4bf)",
                  boxShadow: isActive ? "0 0 4px rgba(45,212,191,0.38)" : "none",
                  opacity: isActive ? 1 : 0,
                  transition: "width 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease"
                }
              },
              void 0,
              false,
              {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 1777,
                columnNumber: 17
              },
              this
            )
          ]
        },
        tab.key,
        true,
        {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 1732,
          columnNumber: 15
        },
        this
      );
    }) }, void 0, false, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 1727,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 1726,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
    lineNumber: 1667,
    columnNumber: 5
  }, this);
}
_s(AppBottomNav, "+Ne3Xzg3tPebAkQlFZ9lnaMhrxY=", false, function() {
  return [useNavigate, useLocation];
});
_c33 = AppBottomNav;
function ScrollToTop({ appBodyRef }) {
  _s2();
  const location = useLocation();
  useEffect(() => {
    try {
      if (appBodyRef && appBodyRef.current) appBodyRef.current.scrollTop = 0;
    } catch (e) {
    }
  }, [location, appBodyRef]);
  return null;
}
_s2(ScrollToTop, "BXcZrDMM76mmm4zA8/QV5UbMNXE=", false, function() {
  return [useLocation];
});
_c34 = ScrollToTop;
const VIP_VOUCHER_TITLE = "ì§ì­ê³µì ë°ì íë«í¼ VIP ìíê¶";
const VIP_VOUCHER_TYPE = "SHOP_USE";
const VIP_META_MARKER = "__VIPMETA__";
const VIP_API_BASE = import.meta.env.VITE_API_URL || "";
const SHOP_VOUCHER_PAYMENT_CACHE_KEY = "su_shop_voucher_payments_v2";
function formatVoucherAmount(value) {
  const amount = Number(value) || 0;
  return `${amount.toLocaleString("ko-KR")}ì`;
}
const KST_LOCALE = "ko-KR";
const KST_TIME_ZONE = "Asia/Seoul";
function parseKSTDateValue(value) {
  if (!value && value !== 0) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
  }
  if (typeof value === "number") {
    const date2 = new Date(value);
    return Number.isNaN(date2.getTime()) ? null : date2;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (/^\d+$/.test(trimmed)) {
      const date3 = new Date(Number(trimmed));
      return Number.isNaN(date3.getTime()) ? null : date3;
    }
    const dateOnlyMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnlyMatch) {
      const [, year, month, day] = dateOnlyMatch;
      return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), -9, 0, 0, 0));
    }
    const naiveDateTimeMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?(?:\.(\d{1,3}))?$/);
    if (naiveDateTimeMatch) {
      const [, year, month, day, hour, minute, second = "0", millisecond = "0"] = naiveDateTimeMatch;
      return new Date(Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour) - 9,
        Number(minute),
        Number(second),
        Number(millisecond.padEnd(3, "0"))
      ));
    }
    const date2 = new Date(trimmed);
    return Number.isNaN(date2.getTime()) ? null : date2;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
function formatKSTDate(value) {
  const date = parseKSTDateValue(value);
  if (!date) return "-";
  return new Intl.DateTimeFormat(KST_LOCALE, {
    timeZone: KST_TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric"
  }).format(date);
}
function formatKSTTime(value) {
  const date = parseKSTDateValue(value);
  if (!date) return "-";
  return new Intl.DateTimeFormat(KST_LOCALE, {
    timeZone: KST_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  }).format(date);
}
function formatKSTDateTime(value) {
  const date = parseKSTDateValue(value);
  if (!date) return "-";
  return new Intl.DateTimeFormat(KST_LOCALE, {
    timeZone: KST_TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  }).format(date);
}
function formatVoucherDate(value) {
  return formatKSTDate(value);
}
function formatVoucherDateTime(value) {
  return formatKSTDateTime(value);
}
function buildVoucherDateKey(value = /* @__PURE__ */ new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
}
function generateVoucherSerial() {
  const now = /* @__PURE__ */ new Date();
  const dayKey = buildVoucherDateKey(now);
  const storageKey = `su_vip_voucher_seq_${dayKey}`;
  const next = Number(window.localStorage.getItem(storageKey) || "0") + 1;
  window.localStorage.setItem(storageKey, String(next));
  const timeTail = String(now.getTime()).slice(-4);
  return `VIP-${dayKey}-${String(next).padStart(6, "0")}${timeTail}`;
}
function buildVoucherPreviewSerial() {
  return `VIP-${buildVoucherDateKey()}-000001`;
}
function buildVoucherDescription(reason, issueRegion) {
  const cleanReason = String(reason || "").trim();
  const cleanRegion = String(issueRegion || "").trim();
  const meta = JSON.stringify({ issueRegion: cleanRegion || null });
  return `${cleanReason}${cleanReason ? "\n" : ""}${VIP_META_MARKER}${meta}`;
}
function parseVoucherDescription(description) {
  const raw = String(description || "");
  const markerIndex = raw.indexOf(VIP_META_MARKER);
  if (markerIndex < 0) {
    return {
      reason: raw.trim(),
      issueRegion: "",
      fromMemberId: "",
      fromMemberName: "",
      toMemberId: "",
      toMemberName: "",
      shopId: "",
      shopName: ""
    };
  }
  const reason = raw.slice(0, markerIndex).trim();
  const metaRaw = raw.slice(markerIndex + VIP_META_MARKER.length).trim();
  try {
    const meta = JSON.parse(metaRaw || "{}");
    return {
      reason,
      issueRegion: String(meta?.issueRegion || "").trim(),
      fromMemberId: String(meta?.fromMemberId || "").trim(),
      fromMemberName: String(meta?.fromMemberName || "").trim(),
      toMemberId: String(meta?.toMemberId || "").trim(),
      toMemberName: String(meta?.toMemberName || "").trim(),
      shopId: String(meta?.shopId || "").trim(),
      shopName: String(meta?.shopName || "").trim()
    };
  } catch (error) {
    return {
      reason,
      issueRegion: "",
      fromMemberId: "",
      fromMemberName: "",
      toMemberId: "",
      toMemberName: "",
      shopId: "",
      shopName: ""
    };
  }
}
function readShopVoucherPaymentCache() {
  try {
    const raw = window.localStorage.getItem(SHOP_VOUCHER_PAYMENT_CACHE_KEY);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}
function writeShopVoucherPaymentCache(records) {
  try {
    window.localStorage.setItem(SHOP_VOUCHER_PAYMENT_CACHE_KEY, JSON.stringify(records));
  } catch (error) {
  }
}
function rememberShopVoucherPayment(record) {
  if (!record?.shopId || !record?.serial || !record?.amount) return;
  const normalized = {
    kind: "voucher_shop_pay",
    voucherType: "VIP",
    amount: Number(record.amount) || 0,
    serial: String(record.serial || "").trim(),
    userId: String(record.userId || "").trim(),
    userName: String(record.userName || "").trim(),
    shopId: String(record.shopId || "").trim(),
    shopName: String(record.shopName || "").trim(),
    usedAt: String(record.usedAt || (/* @__PURE__ */ new Date()).toISOString()).trim(),
    issueRegion: String(record.issueRegion || "").trim(),
    reason: String(record.reason || "ìì ê²°ì ").trim(),
    status: String(record.status || "used").trim()
  };
  const cache = readShopVoucherPaymentCache();
  const dedupeKey = `${normalized.shopId}__${normalized.serial}__${normalized.amount}__${normalized.userId}`;
  const next = [normalized, ...cache.filter((entry) => `${entry.shopId}__${entry.serial}__${Number(entry.amount) || 0}__${entry.userId}` !== dedupeKey)].slice(0, 200);
  writeShopVoucherPaymentCache(next);
  window.dispatchEvent(new CustomEvent("su:voucher:shop-payments", { detail: normalized }));
}
function normalizeShopVoucherPaymentRecord(record) {
  if (!record?.shopId || !record?.serial) return null;
  return {
    kind: "voucher_shop_pay",
    voucherType: "VIP",
    amount: Number(record.amount) || 0,
    serial: String(record.serial || "").trim(),
    userId: String(record.userId || "").trim(),
    userName: String(record.userName || "").trim(),
    shopId: String(record.shopId || "").trim(),
    shopName: String(record.shopName || "").trim(),
    usedAt: String(record.usedAt || (/* @__PURE__ */ new Date()).toISOString()).trim(),
    issueRegion: String(record.issueRegion || "").trim(),
    reason: String(record.reason || "ìì ê²°ì ").trim(),
    status: "used"
  };
}
function mergeShopVoucherPaymentRecords(...groups) {
  const merged = [];
  const seen = /* @__PURE__ */ new Set();
  groups.flat().forEach((entry) => {
    const normalized = normalizeShopVoucherPaymentRecord(entry);
    if (!normalized) return;
    const dedupeKey = `${normalized.shopId}__${normalized.serial}__${normalized.amount}__${normalized.userId}`;
    if (seen.has(dedupeKey)) return;
    seen.add(dedupeKey);
    merged.push(normalized);
  });
  return merged.sort((left, right) => new Date(right.usedAt).getTime() - new Date(left.usedAt).getTime());
}
function convertShopVoucherHistoryToRecords(shop, history = []) {
  const shopId = String(shop?.id || shop?.shopId || "").trim();
  const shopName = String(shop?.name || "").trim();
  return (Array.isArray(history) ? history : []).filter((entry) => {
    const amount = Number(entry?.amount) || 0;
    const source = String(entry?.source || "").toUpperCase();
    if (amount <= 0) return false;
    return source === "VOUCHER_SHOP_TRANSFER_IN" || source === "SHOP_TRANSFER_IN" || source === "SHOP_IN";
  }).map((entry) => {
    const parsed = parseVoucherDescription(entry?.description || "");
    return normalizeShopVoucherPaymentRecord({
      shopId,
      shopName: parsed.shopName || shopName,
      userId: parsed.fromMemberId,
      userName: parsed.fromMemberName,
      serial: entry?.referenceId || normalizeVoucherSerial(entry?.referenceId, entry?.createdAt, entry?.id),
      amount: Number(entry?.amount) || 0,
      usedAt: entry?.createdAt,
      issueRegion: parsed.issueRegion,
      reason: parsed.reason || "ìì ê²°ì ",
      status: "used"
    });
  }).filter(Boolean);
}
function extractShopVoucherPaymentRecord(payload) {
  const parsed = parseVoucherDescription(payload?.receiverDescription || payload?.description || payload?.senderDescription || "");
  const amount = Number(payload?.amount) || 0;
  const shopId = String(payload?.shopId || payload?.memberId || parsed.shopId || "").trim();
  const shopName = String(parsed.shopName || payload?.shopName || "").trim();
  const userId = String(payload?.fromMemberId || parsed.fromMemberId || "").trim();
  const userName = String(parsed.fromMemberName || payload?.userName || "").trim();
  const serial = String(payload?.referenceId || payload?.serial || "").trim();
  if (!shopId || !serial || amount <= 0) return null;
  return {
    kind: "voucher_shop_pay",
    voucherType: "VIP",
    amount,
    serial,
    userId,
    userName,
    shopId,
    shopName,
    usedAt: (/* @__PURE__ */ new Date()).toISOString(),
    issueRegion: parsed.issueRegion,
    reason: "ìì ê²°ì ",
    status: "used"
  };
}
function sanitizeVipAmountLabels(root = document.body) {
  if (!root?.querySelectorAll) return;
  const elements = root.querySelectorAll(".su-vip-badge, div, span, p, strong");
  elements.forEach((element) => {
    if (!element || element.childElementCount > 0) return;
    const text = String(element.textContent || "");
    if (!text || !(/VIP/.test(text) && /ì¥/.test(text))) return;
    let next = text;
    next = next.replace(/ðï¸\s*VIP\s*([0-9][0-9,]*)ì¥/g, (_, value) => `ðï¸ VIP ${formatVoucherAmount(Number(String(value).replace(/,/g, "")))}`);
    next = next.replace(/VIP ìíê¶\s*([0-9][0-9,]*)ì¥/g, (_, value) => `VIP ìíê¶ ${formatVoucherAmount(Number(String(value).replace(/,/g, "")))}`);
    next = next.replace(/VIP\s*([0-9][0-9,]*)ì¥/g, (_, value) => `VIP ${formatVoucherAmount(Number(String(value).replace(/,/g, "")))}`);
    if (next !== text) {
      element.textContent = next;
    }
  });
}
function VoucherFetchRecorder() {
  _s3();
  useEffect(() => {
    if (window.__suVipVoucherFetchRecorderInstalled) return void 0;
    const originalFetch = window.fetch.bind(window);
    window.__suVipVoucherFetchRecorderInstalled = true;
    window.fetch = async (input, init = {}) => {
      const response = await originalFetch(input, init);
      try {
        const urlValue = typeof input === "string" ? input : input?.url || "";
        const pathname = new URL(urlValue, window.location.origin).pathname;
        const method = String(init?.method || input?.method || "GET").toUpperCase();
        if (method === "POST" && response.ok && (pathname === "/api/vouchers/transfer" || pathname === "/api/vouchers/issue")) {
          const bodyText = typeof init?.body === "string" ? init.body : "";
          const payload = bodyText ? JSON.parse(bodyText) : null;
          if (payload) {
            if (pathname === "/api/vouchers/transfer" && String(payload?.targetType || "").toLowerCase() === "shop") {
              const record = extractShopVoucherPaymentRecord(payload);
              if (record) rememberShopVoucherPayment(record);
            }
            if (pathname === "/api/vouchers/issue" && String(payload?.targetType || "").toLowerCase() === "shop" && String(payload?.source || "").toUpperCase() === "VOUCHER_SHOP_TRANSFER_IN") {
              const record = extractShopVoucherPaymentRecord(payload);
              if (record) rememberShopVoucherPayment(record);
            }
          }
        }
      } catch (error) {
      }
      return response;
    };
    return void 0;
  }, []);
  return null;
}
_s3(VoucherFetchRecorder, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c35 = VoucherFetchRecorder;
function ShopVoucherPaymentBridge() {
  _s4();
  const location = useLocation();
  const [headerNode, setHeaderNode] = useState(null);
  const [mountNode, setMountNode] = useState(null);
  const [shopPanelNode, setShopPanelNode] = useState(null);
  const [ownedShops, setOwnedShops] = useState([]);
  const [records, setRecords] = useState([]);
  const [activeShopId, setActiveShopId] = useState("");
  const [authReloadTick, setAuthReloadTick] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [shopEarned, setShopEarned] = useState(0);
  const [shopAvailable, setShopAvailable] = useState(0);
  const [shopLedger, setShopLedger] = useState([]);
  const [shopLedgerExpanded, setShopLedgerExpanded] = useState(false);
  const [shopLedgerLoading, setShopLedgerLoading] = useState(false);
  const [payoutRequests, setPayoutRequests] = useState([]);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const formatPointAmount = (value) => `${(Number(value) || 0).toLocaleString("ko-KR")} P`;
  const formatCompactPointAmount = (value) => `${(Number(value) || 0).toLocaleString("ko-KR")}P`;
  const formatPayoutDate = (value) => {
    const formatted = formatKSTDate(value);
    return formatted === "-" ? "ë ì§ ë¯¸ì" : `${formatted}.`;
  };
  const normalizePayoutRequest = (entry, index) => ({
    id: entry?.requestId || entry?.request_id || entry?.id || `payout-${index}`,
    amount: Number(entry?.amount || 0),
    requestedAt: entry?.requestedAt || entry?.requested_at || entry?.createdAt || entry?.created_at || "",
    status: String(entry?.status || "PENDING").toUpperCase()
  });
  const getPayoutStatusUi = (status) => {
    if (status === "PENDING") {
      return {
        icon: "ð",
        label: "ì§ê¸ì ì²­ì¤",
        color: "#f59e0b",
        background: "rgba(245, 158, 11, 0.16)",
        borderColor: "rgba(245, 158, 11, 0.34)"
      };
    }
    return {
      icon: "â",
      label: "ì§ê¸ìë£",
      color: "#22c55e",
      background: "rgba(34, 197, 94, 0.16)",
      borderColor: "rgba(34, 197, 94, 0.34)"
    };
  };
  const fetchBridgeJson = async (path) => {
    const response = await fetch(`${VIP_API_BASE}${path}`, { credentials: "include" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data?.error || data?.message || response.statusText || "ìì²­ ì¤í¨");
      error.status = response.status;
      throw error;
    }
    return data;
  };
  useEffect(() => {
    if (location.pathname !== "/my") {
      setMountNode(null);
      return void 0;
    }
    const ensureMountNode = () => {
      const panels = Array.from(document.querySelectorAll("section.su-panel"));
      const shopPanel = panels.find((panel) => String(panel.textContent || "").includes("ðª ìì  í¬ì¸í¸"));
      if (!shopPanel) {
        setHeaderNode(null);
        setMountNode(null);
        setShopPanelNode(null);
        return;
      }
      setShopPanelNode(shopPanel);
      let summaryHost = shopPanel.querySelector('[data-shop-wallet-header-root="true"]');
      if (!summaryHost) {
        summaryHost = document.createElement("div");
        summaryHost.setAttribute("data-shop-wallet-header-root", "true");
        shopPanel.insertAdjacentElement("afterbegin", summaryHost);
      }
      setHeaderNode(summaryHost);
      let host = shopPanel.querySelector('[data-shop-voucher-record-root="true"]');
      if (!host) {
        host = document.createElement("div");
        host.setAttribute("data-shop-voucher-record-root", "true");
        host.style.marginTop = "12px";
        shopPanel.appendChild(host);
      }
      setMountNode(host);
      const selector = shopPanel.querySelector("select");
      if (selector && selector.value) {
        setActiveShopId(String(selector.value));
        if (!selector.dataset.vipBound) {
          selector.addEventListener("change", (event) => {
            setActiveShopId(String(event?.target?.value || ""));
          });
          selector.dataset.vipBound = "true";
        }
      }
    };
    ensureMountNode();
    const observer = new MutationObserver(() => ensureMountNode());
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [location.pathname]);
  useEffect(() => {
    if (!shopPanelNode) return;
    shopPanelNode.setAttribute("data-shop-wallet-bridge-active", "true");
    if (mountNode && mountNode.parentElement !== shopPanelNode) {
      shopPanelNode.appendChild(mountNode);
    }
    return () => {
      shopPanelNode.removeAttribute("data-shop-wallet-bridge-active");
    };
  }, [shopPanelNode, mountNode]);
  useEffect(() => {
    if (location.pathname !== "/my") return void 0;
    const triggerReload = () => setAuthReloadTick((value) => value + 1);
    window.addEventListener("su:auth:changed", triggerReload);
    window.addEventListener("su:ssot:changed", triggerReload);
    window.addEventListener("storage", triggerReload);
    return () => {
      window.removeEventListener("su:auth:changed", triggerReload);
      window.removeEventListener("su:ssot:changed", triggerReload);
      window.removeEventListener("storage", triggerReload);
    };
  }, [location.pathname]);
  useEffect(() => {
    if (location.pathname !== "/my") return void 0;
    const session = getSession();
    const currentUser = getCurrentUser();
    const memberId = String(session?.memberId || currentUser?.memberId || currentUser?.id || "").trim();
    if (!memberId) {
      setOwnedShops([]);
      return void 0;
    }
    let mounted = true;
    const loadOwnedShops = async () => {
      try {
        const response = await fetch(`${VIP_API_BASE}/api/shops/my`, { headers: { "x-member-id": memberId } });
        const data = await response.json().catch(() => ({}));
        if (!mounted) return;
        setOwnedShops(Array.isArray(data?.shops) ? data.shops : []);
      } catch (error) {
        if (mounted) setOwnedShops([]);
      }
    };
    loadOwnedShops();
    return () => {
      mounted = false;
    };
  }, [location.pathname, authReloadTick]);
  useEffect(() => {
    if (!shopPanelNode || ownedShops.length === 0) return;
    const selector = shopPanelNode.querySelector("select");
    if (selector?.value) {
      setActiveShopId(String(selector.value));
      return;
    }
    const textNodes = Array.from(shopPanelNode.querySelectorAll("div, span, strong")).map((node) => String(node.textContent || "").trim()).filter(Boolean);
    const matchedShop = ownedShops.find((shop) => {
      const shopName = String(shop?.name || "").trim();
      return shopName && textNodes.includes(shopName);
    });
    if (matchedShop) {
      setActiveShopId(String(matchedShop.id || matchedShop.shopId || ""));
      return;
    }
    if (!activeShopId) {
      const firstShopId = String(ownedShops[0]?.id || ownedShops[0]?.shopId || "").trim();
      if (firstShopId) setActiveShopId(firstShopId);
    }
  }, [shopPanelNode, ownedShops, activeShopId]);
  useEffect(() => {
    if (!activeShopId && ownedShops.length > 0) {
      const firstShopId = String(ownedShops[0]?.id || ownedShops[0]?.shopId || "").trim();
      if (firstShopId) setActiveShopId(firstShopId);
    }
  }, [ownedShops, activeShopId]);
  useEffect(() => {
    if (location.pathname !== "/my") return void 0;
    const selectedShopId2 = String(activeShopId || "").trim();
    if (!selectedShopId2) {
      setShopEarned(0);
      setShopAvailable(0);
      setShopLedger([]);
      setShopLedgerExpanded(false);
      setPayoutRequests([]);
      return void 0;
    }
    let mounted = true;
    const loadShopPointSummary = async () => {
      try {
        setShopLedgerLoading(true);
        setPayoutLoading(true);
        const [earnedRes, availableRes, ledgerRes, payoutRes] = await Promise.allSettled(
          [
            fetchBridgeJson(`/api/shops/${encodeURIComponent(selectedShopId2)}/points/earned`),
            fetchBridgeJson(`/api/shops/${encodeURIComponent(selectedShopId2)}/points/available`),
            fetchBridgeJson(`/api/shops/${encodeURIComponent(selectedShopId2)}/points/ledger?limit=${shopLedgerExpanded ? 50 : 5}`),
            shopStore.loadUnifiedShopPayoutRequests(selectedShopId2)
          ]
        );
        if (!mounted) return;
        setShopEarned(earnedRes.status === "fulfilled" ? Number(earnedRes.value?.totalEarned || earnedRes.value?.total || 0) : 0);
        setShopAvailable(availableRes.status === "fulfilled" ? Number(availableRes.value?.available || 0) : 0);
        setShopLedger(ledgerRes.status === "fulfilled" && Array.isArray(ledgerRes.value?.ledger) ? ledgerRes.value.ledger : []);
        setPayoutRequests(
          payoutRes.status === "fulfilled" && Array.isArray(payoutRes.value?.requests) ? payoutRes.value.requests.map(normalizePayoutRequest) : []
        );
      } catch (error) {
        if (!mounted) return;
        setShopEarned(0);
        setShopAvailable(0);
        setShopLedger([]);
        setPayoutRequests([]);
      } finally {
        if (mounted) {
          setShopLedgerLoading(false);
          setPayoutLoading(false);
        }
      }
    };
    loadShopPointSummary();
    return () => {
      mounted = false;
    };
  }, [location.pathname, activeShopId, authReloadTick, shopLedgerExpanded]);
  useEffect(() => {
    setShopLedgerExpanded(false);
  }, [activeShopId]);
  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      const ownedList = Array.isArray(ownedShops) ? ownedShops : [];
      const ownedShopIds = new Set(ownedList.map((shop) => String(shop?.id || shop?.shopId || "").trim()).filter(Boolean));
      const cacheRecords = readShopVoucherPaymentCache().filter((entry) => ownedShopIds.has(String(entry?.shopId || "").trim()));
      try {
        const historyGroups = await Promise.all(
          ownedList.map(async (shop) => {
            const shopId = String(shop?.id || shop?.shopId || "").trim();
            if (!shopId) return [];
            const response = await fetch(`${VIP_API_BASE}/api/vouchers/${encodeURIComponent(shopId)}/history?limit=50`);
            const data = await response.json().catch(() => ({}));
            return convertShopVoucherHistoryToRecords(shop, data?.ok ? data.history || [] : []);
          })
        );
        const merged = mergeShopVoucherPaymentRecords(cacheRecords, historyGroups.flat()).slice(0, 100);
        writeShopVoucherPaymentCache(merged);
        if (mounted) setRecords(merged);
      } catch (error) {
        const fallback = mergeShopVoucherPaymentRecords(cacheRecords).slice(0, 100);
        if (mounted) setRecords(fallback);
      }
    };
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("su:voucher:shop-payments", refresh);
    window.addEventListener("su:ssot:changed", refresh);
    return () => {
      mounted = false;
      window.removeEventListener("storage", refresh);
      window.removeEventListener("su:voucher:shop-payments", refresh);
      window.removeEventListener("su:ssot:changed", refresh);
    };
  }, [ownedShops]);
  if (location.pathname !== "/my" || !headerNode) return null;
  const selectedShopId = String(activeShopId || "").trim();
  const selectedShop = ownedShops.find((shop) => String(shop?.id || shop?.shopId || "").trim() === selectedShopId) || ownedShops[0] || null;
  const selectedShopRecords = records.filter((entry) => String(entry?.shopId || "").trim() === selectedShopId).slice(0, 6);
  const earnedText = formatPointAmount(shopEarned);
  const availableText = formatPointAmount(shopAvailable);
  const sortedPayoutRequests = [...payoutRequests].sort((left, right) => {
    const leftPending = left.status === "PENDING" ? 0 : 1;
    const rightPending = right.status === "PENDING" ? 0 : 1;
    if (leftPending !== rightPending) return leftPending - rightPending;
    return new Date(right.requestedAt || 0) - new Date(left.requestedAt || 0);
  }).slice(0, 4);
  const visibleShopLedger = shopLedgerExpanded ? shopLedger : shopLedger.slice(0, 4);
  const hasMoreShopLedger = shopLedger.length > 4;
  const headerPortal = headerNode ? createPortal(
    /* @__PURE__ */ jsxDEV("div", { style: { borderRadius: 18, padding: "14px 14px", background: "linear-gradient(180deg, #ffffff, #f8fafc)", border: "1px solid #cbd5e1", marginBottom: isExpanded ? 16 : 10, boxShadow: "0 8px 20px rgba(15,23,42,0.08)" }, children: [
      /* @__PURE__ */ jsxDEV("button", { type: "button", onClick: () => setIsExpanded((value) => !value), style: { width: "100%", display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", alignItems: "center", gap: 12, background: "transparent", border: "none", color: "#0f172a", padding: 0, cursor: "pointer", outline: "none", boxShadow: "none", WebkitTapHighlightColor: "transparent", WebkitAppearance: "none", appearance: "none" }, children: [
        /* @__PURE__ */ jsxDEV("div", { style: { textAlign: "left", minWidth: 0, display: "grid", gap: 8 }, children: [
          /* @__PURE__ */ jsxDEV("div", { style: { fontWeight: 900, fontSize: 14, color: "#0f172a", letterSpacing: "0.2px", textTransform: "uppercase" }, children: "ðª ìì  ì§ê°" }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 2483,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 6, fontSize: 13, color: "#334155", fontWeight: 700 }, children: selectedShop?.name || selectedShop?.shopId || "ìì  ì í ëê¸°" }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 2484,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", alignItems: "flex-end", gap: 34, flexWrap: "wrap" }, children: [
            /* @__PURE__ */ jsxDEV("div", { style: { textAlign: "left" }, children: [
              /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 11, color: "#64748b", fontWeight: 700 }, children: "ì´ ì ë¦½" }, void 0, false, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 2487,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 2, fontSize: "clamp(15px,4.5vw,18px)", fontWeight: 800, color: "#1e293b", whiteSpace: "nowrap" }, children: earnedText }, void 0, false, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 2488,
                columnNumber: 15
              }, this)
            ] }, void 0, true, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 2486,
              columnNumber: 13
            }, this),
            /* @__PURE__ */ jsxDEV("div", { style: { textAlign: "left", marginLeft: 8 }, children: [
              /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 11, color: "#0f766e", fontWeight: 800 }, children: "ê°ì© ìì¡" }, void 0, false, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 2491,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 2, fontSize: "clamp(17px,5vw,21px)", fontWeight: 900, color: "#0f766e", textShadow: "none", whiteSpace: "nowrap" }, children: availableText }, void 0, false, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 2492,
                columnNumber: 15
              }, this)
            ] }, void 0, true, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 2490,
              columnNumber: 13
            }, this)
          ] }, void 0, true, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 2485,
            columnNumber: 11
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 2482,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ jsxDEV("div", { style: { flexShrink: 0, width: 32, height: 32, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#e2e8f0", color: "#0f172a", fontSize: 16, fontWeight: 900 }, children: isExpanded ? "â" : "+" }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 2496,
          columnNumber: 9
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 2481,
        columnNumber: 7
      }, this),
      isExpanded ? /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 12, paddingTop: 12, borderTop: "1px solid #e2e8f0" }, children: [
        /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 12, fontWeight: 900, color: "#0f172a", marginBottom: 8 }, children: "ìµê·¼ ì ë¦½ ìì¥" }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 2502,
          columnNumber: 11
        }, this),
        shopLedgerLoading ? /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 12, color: "#64748b", padding: "6px 0" }, children: "ìì¥ì ë¶ë¬ì¤ë ì¤ìëë¤..." }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 2503,
          columnNumber: 32
        }, this) : null,
        !shopLedgerLoading && shopLedger.length === 0 ? /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 12, color: "#64748b", padding: "6px 0" }, children: "ìµê·¼ ì ë¦½ ë´ì­ì´ ììµëë¤." }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 2504,
          columnNumber: 60
        }, this) : null,
        !shopLedgerLoading && shopLedger.length > 0 ? /* @__PURE__ */ jsxDEV("div", { style: { display: "grid", gap: 6 }, children: [
          visibleShopLedger.map(
            (entry, index) => /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0" }, children: [
              /* @__PURE__ */ jsxDEV("div", { style: { minWidth: 0, flex: 1 }, children: [
                /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 12, fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }, children: [
                  entry.buyerName || entry.buyerMemberId || "íì",
                  " ê²°ì "
                ] }, void 0, true, {
                  fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                  lineNumber: 2510,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 3, fontSize: 11, color: "#64748b" }, children: formatVoucherDateTime(entry.createdAt) }, void 0, false, {
                  fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                  lineNumber: 2511,
                  columnNumber: 21
                }, this)
              ] }, void 0, true, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 2509,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV("div", { style: { flexShrink: 0, fontSize: 13, fontWeight: 900, color: "#0f766e" }, children: [
                "+",
                formatPointAmount(entry.amount)
              ] }, void 0, true, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 2513,
                columnNumber: 19
              }, this)
            ] }, `${entry.earningId || entry.sourceTxId || "ledger"}-${index}`, true, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 2508,
              columnNumber: 11
            }, this)
          ),
          hasMoreShopLedger && !shopLedgerExpanded ? /* @__PURE__ */ jsxDEV(
            "button",
            {
              type: "button",
              onClick: () => setShopLedgerExpanded(true),
              style: { minHeight: 38, borderRadius: 10, border: "1px solid #99f6e4", background: "#ecfeff", color: "#0f766e", fontSize: 12, fontWeight: 800, cursor: "pointer" },
              children: "ëë³´ê¸°"
            },
            void 0,
            false,
            {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 2517,
              columnNumber: 11
            },
            this
          ) : null,
          shopLedgerExpanded && shopLedger.length > 4 ? /* @__PURE__ */ jsxDEV(
            "button",
            {
              type: "button",
              onClick: () => setShopLedgerExpanded(false),
              style: { minHeight: 38, borderRadius: 10, border: "1px solid #cbd5e1", background: "#f8fafc", color: "#475569", fontSize: 12, fontWeight: 800, cursor: "pointer" },
              children: "ì ê¸°"
            },
            void 0,
            false,
            {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 2526,
              columnNumber: 11
            },
            this
          ) : null
        ] }, void 0, true, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 2506,
          columnNumber: 9
        }, this) : null
      ] }, void 0, true, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 2501,
        columnNumber: 7
      }, this) : null
    ] }, void 0, true, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 2480,
      columnNumber: 5
    }, this),
    headerNode
  ) : null;
  const payoutPortal = mountNode ? createPortal(
    /* @__PURE__ */ jsxDEV("div", { style: { display: "grid", gap: 8, marginTop: 8 }, children: [
      /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 13, fontWeight: 900, color: "#0f172a", marginBottom: 2 }, children: "VIP ìíê¶ ë°ì ì´ë ¥" }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 2544,
        columnNumber: 7
      }, this),
      selectedShopRecords.length === 0 ? /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 13, color: "#64748b", padding: "4px 0" }, children: "ë°ì ìíê¶ ì´ë ¥ì´ ììµëë¤." }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 2545,
        columnNumber: 43
      }, this) : null,
      selectedShopRecords.map(
        (record, index) => /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0" }, children: [
          /* @__PURE__ */ jsxDEV("div", { style: { minWidth: 0, flex: 1 }, children: [
            /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 13, fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }, children: [
              record.userName || record.userId || "íì",
              " ê²°ì  ìì "
            ] }, void 0, true, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 2549,
              columnNumber: 13
            }, this),
            /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 2, fontSize: 12, color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }, children: formatVoucherDateTime(record.usedAt) }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 2550,
              columnNumber: 13
            }, this),
            /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 2, fontSize: 12, color: "#64748b", wordBreak: "break-all", overflowWrap: "anywhere" }, children: record.serial }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 2551,
              columnNumber: 13
            }, this)
          ] }, void 0, true, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 2548,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ jsxDEV("div", { style: { flexShrink: 0, fontSize: 13, fontWeight: 900, color: "#0f766e" }, children: [
            "+",
            formatCompactPointAmount(record.amount)
          ] }, void 0, true, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 2553,
            columnNumber: 11
          }, this)
        ] }, `${record.serial}-${record.userId || "user"}-${index}`, true, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 2547,
          columnNumber: 7
        }, this)
      ),
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          type: "button",
          onClick: () => {
            try {
              window.dispatchEvent(new CustomEvent("su:shop:payout:open", { detail: { shopId: selectedShopId } }));
            } catch (error) {
            }
          },
          disabled: !selectedShopId,
          style: { minHeight: 44, borderRadius: 12, border: "none", background: "linear-gradient(90deg,#0f766e,#0ea5a3)", color: "#effffb", fontSize: 14, fontWeight: 900, cursor: selectedShopId ? "pointer" : "default", opacity: selectedShopId ? 1 : 0.5 },
          children: "ì§ê¸ìì²­"
        },
        void 0,
        false,
        {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 2557,
          columnNumber: 7
        },
        this
      ),
      /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 13, fontWeight: 900, color: "#0f172a", marginTop: 4 }, children: "ìµê·¼ ì§ê¸ìì²­" }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 2570,
        columnNumber: 7
      }, this),
      payoutLoading ? /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 13, color: "#64748b", padding: "4px 0" }, children: "ì§ê¸ìì²­ì ë¶ë¬ì¤ë ì¤ìëë¤..." }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 2571,
        columnNumber: 24
      }, this) : null,
      !payoutLoading && sortedPayoutRequests.length === 0 ? /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 13, color: "#64748b", padding: "4px 0" }, children: "ìµê·¼ ìì²­ì´ ììµëë¤." }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 2572,
        columnNumber: 62
      }, this) : null,
      !payoutLoading && sortedPayoutRequests.map((request) => {
        const statusUi = getPayoutStatusUi(request.status);
        return /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0" }, children: [
          /* @__PURE__ */ jsxDEV("div", { style: { minWidth: 0, flex: 1, fontSize: 14, fontWeight: 700, color: "#334155", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }, children: [
            formatPayoutDate(request.requestedAt),
            " Â· ",
            formatCompactPointAmount(request.amount)
          ] }, void 0, true, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 2577,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { style: { flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 5, minHeight: 30, padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, color: statusUi.color, background: statusUi.background, border: `1px solid ${statusUi.borderColor}` }, children: [
            /* @__PURE__ */ jsxDEV("span", { children: statusUi.icon }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 2581,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("span", { children: statusUi.label }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 2582,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 2580,
            columnNumber: 13
          }, this)
        ] }, request.id, true, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 2576,
          columnNumber: 11
        }, this);
      })
    ] }, void 0, true, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 2543,
      columnNumber: 5
    }, this),
    mountNode
  ) : null;
  return /* @__PURE__ */ jsxDEV(Fragment, { children: [
    /* @__PURE__ */ jsxDEV("style", { children: `
        section.su-panel[data-shop-wallet-bridge-active="true"] > :not([data-shop-wallet-header-root="true"]):not([data-shop-voucher-record-root="true"]) {
          display: none !important;
        }
        section.su-panel[data-shop-wallet-bridge-active="true"] > [data-shop-wallet-header-root="true"],
        section.su-panel[data-shop-wallet-bridge-active="true"] > [data-shop-voucher-record-root="true"] {
          display: block !important;
        }
      ` }, void 0, false, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 2593,
      columnNumber: 7
    }, this),
    headerPortal,
    payoutPortal
  ] }, void 0, true, {
    fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
    lineNumber: 2592,
    columnNumber: 5
  }, this);
}
_s4(ShopVoucherPaymentBridge, "QlFkINhnhMlX9I0EiZrHlijxxU0=", false, function() {
  return [useLocation];
});
_c36 = ShopVoucherPaymentBridge;
function VipAmountDisplayBridge() {
  _s5();
  const location = useLocation();
  useEffect(() => {
    const apply = () => sanitizeVipAmountLabels(document.body);
    apply();
    const observer = new MutationObserver(() => apply());
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [location.pathname]);
  return /* @__PURE__ */ jsxDEV("style", { children: `
      .su-shop-card--vip .su-vip-badge,
      .su-shop-card--regular .su-vip-badge,
      .su-shop-card .su-vip-badge {
        display: none !important;
      }
    ` }, void 0, false, {
    fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
    lineNumber: 2620,
    columnNumber: 5
  }, this);
}
_s5(VipAmountDisplayBridge, "BXcZrDMM76mmm4zA8/QV5UbMNXE=", false, function() {
  return [useLocation];
});
_c37 = VipAmountDisplayBridge;
function VipMemberSummaryBridge() {
  _s6();
  const location = useLocation();
  useEffect(() => {
    if (location.pathname !== "/my") return void 0;
    const apply = () => {
      const panels = Array.from(document.querySelectorAll("section.su-panel"));
      const targetPanel = panels.find((panel) => String(panel.textContent || "").includes("ðï¸ VIP ìíê¶"));
      if (!targetPanel) return;
      const recentIssuedLabel = Array.from(targetPanel.querySelectorAll("div, span")).find((node) => String(node.textContent || "").trim().startsWith("ìµê·¼ ë°íì¼:"));
      if (!recentIssuedLabel) return;
      const infoGrid = recentIssuedLabel.parentElement;
      const summaryCard = infoGrid?.parentElement;
      const summaryWrap = summaryCard?.parentElement;
      if (!infoGrid || !summaryCard) return;
      infoGrid.style.display = "none";
      summaryCard.style.padding = "14px 14px";
      summaryCard.style.borderRadius = "18px";
      summaryCard.style.boxShadow = "0 12px 28px rgba(0,0,0,0.16)";
      if (summaryWrap) {
        summaryWrap.style.marginBottom = "10px";
      }
      const amountNode = infoGrid.previousElementSibling;
      if (amountNode) {
        amountNode.style.fontSize = "24px";
        amountNode.style.marginBottom = "6px";
      }
      const headerRow = amountNode?.previousElementSibling;
      if (headerRow) {
        headerRow.style.marginBottom = "8px";
      }
    };
    apply();
    const observer = new MutationObserver(() => apply());
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [location.pathname]);
  return null;
}
_s6(VipMemberSummaryBridge, "BXcZrDMM76mmm4zA8/QV5UbMNXE=", false, function() {
  return [useLocation];
});
_c38 = VipMemberSummaryBridge;
function MyOfficeHeroCleanupBridge() {
  _s7();
  const location = useLocation();
  useEffect(() => {
    if (location.pathname !== "/my") return void 0;
    const apply = () => {
      const allNodes = Array.from(document.querySelectorAll("div, span, button"));
      allNodes.forEach((node) => {
        const text = String(node.textContent || "").trim();
        if (text === "ìì  QR ë³´ê¸°" || text === "PNG ì ì¥") {
          const button = node.closest("button") || node;
          if (button instanceof HTMLElement) {
            button.style.display = "none";
          }
          return;
        }
        const compactText = text.replace(/\s+/g, " ");
        if (/^ì´ ì ë¦½\s*[+\-]?[0-9,]+\s*P\s*[Â·|]\s*ì¬ì©\s*[+\-]?[0-9,]+\s*P$/i.test(compactText)) {
          if (node instanceof HTMLElement) {
            node.style.display = "none";
          }
        }
      });
    };
    apply();
    const observer = new MutationObserver(() => apply());
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [location.pathname]);
  return null;
}
_s7(MyOfficeHeroCleanupBridge, "BXcZrDMM76mmm4zA8/QV5UbMNXE=", false, function() {
  return [useLocation];
});
_c39 = MyOfficeHeroCleanupBridge;
const CARD_THEME_PRESETS = {
  teal: {
    key: "teal",
    label: "Pearl Teal",
    orientation: "horizontal",
    surface: "linear-gradient(135deg, #ebfbfb 0%, #e4f7f7 50%, #f8ffff 100%)",
    previewBackground: "linear-gradient(135deg, #fafeff 0%, #e7f7f6 100%)",
    accent: "#0e7490",
    border: "rgba(14, 116, 144, 0.24)",
    glow: "rgba(14, 116, 144, 0.14)",
    panelBackground: "rgba(14,116,144,0.06)",
    title: "#0f172a",
    body: "#526273",
    foil: "#7dd3c7",
    dark: false,
    layout: "soft"
  },
  blue: {
    key: "blue",
    label: "Royal Blue",
    orientation: "horizontal",
    surface: "linear-gradient(135deg, #eef6ff 0%, #e4efff 48%, #f7fbff 100%)",
    previewBackground: "linear-gradient(135deg, #163b7a 0%, #0f2857 100%)",
    accent: "#8fd3ff",
    border: "rgba(143, 211, 255, 0.24)",
    glow: "rgba(15, 40, 87, 0.22)",
    panelBackground: "rgba(255,255,255,0.1)",
    title: "#eff6ff",
    body: "rgba(219, 234, 254, 0.84)",
    foil: "#dbeafe",
    dark: true,
    layout: "rightpanel"
  },
  navy: {
    key: "navy",
    label: "Navy Goldline",
    orientation: "horizontal",
    surface: "linear-gradient(135deg, #eff3fb 0%, #e5ebf7 52%, #f9fbff 100%)",
    previewBackground: "linear-gradient(135deg, #0f1c35 0%, #182b4d 100%)",
    accent: "#d6a847",
    border: "rgba(214, 168, 71, 0.24)",
    glow: "rgba(15, 28, 53, 0.26)",
    panelBackground: "rgba(255,255,255,0.08)",
    title: "#f8fafc",
    body: "rgba(226, 232, 240, 0.78)",
    foil: "#f3d58d",
    dark: true,
    layout: "band"
  },
  purple: {
    key: "purple",
    label: "Plum Signature",
    orientation: "vertical",
    surface: "linear-gradient(135deg, #f7f1ff 0%, #efe8fb 52%, #fcf9ff 100%)",
    previewBackground: "linear-gradient(135deg, #3f2a56 0%, #5b3b78 100%)",
    accent: "#e9d5ff",
    border: "rgba(216, 180, 254, 0.22)",
    glow: "rgba(91, 59, 120, 0.2)",
    panelBackground: "rgba(255,255,255,0.08)",
    title: "#faf5ff",
    body: "rgba(243, 232, 255, 0.82)",
    foil: "#f1e4ff",
    dark: true,
    layout: "topbar"
  },
  pink: {
    key: "pink",
    label: "Rose Silk",
    orientation: "vertical",
    surface: "linear-gradient(135deg, #fff2f7 0%, #ffeaf2 50%, #fff9fb 100%)",
    previewBackground: "linear-gradient(135deg, #fffdfd 0%, #fceef3 100%)",
    accent: "#be185d",
    border: "rgba(190, 24, 93, 0.18)",
    glow: "rgba(236, 72, 153, 0.12)",
    panelBackground: "rgba(190,24,93,0.05)",
    title: "#3f1d2e",
    body: "#6b4c5d",
    foil: "#f8b4d9",
    dark: false,
    layout: "corner"
  },
  red: {
    key: "red",
    label: "Burgundy Crest",
    orientation: "horizontal",
    surface: "linear-gradient(135deg, #fff4f4 0%, #feebeb 50%, #fff9f9 100%)",
    previewBackground: "linear-gradient(135deg, #5a1326 0%, #7f1d1d 100%)",
    accent: "#f0b3b6",
    border: "rgba(240, 179, 182, 0.22)",
    glow: "rgba(127, 29, 29, 0.2)",
    panelBackground: "rgba(255,255,255,0.08)",
    title: "#fff7f7",
    body: "rgba(254, 226, 226, 0.82)",
    foil: "#f6d5d8",
    dark: true,
    layout: "split"
  },
  orange: {
    key: "orange",
    label: "Copper Line",
    orientation: "vertical",
    surface: "linear-gradient(135deg, #fff8f1 0%, #fff0e3 52%, #fffaf6 100%)",
    previewBackground: "linear-gradient(135deg, #fffdfb 0%, #f8efe7 100%)",
    accent: "#b45309",
    border: "rgba(180, 83, 9, 0.18)",
    glow: "rgba(180, 83, 9, 0.12)",
    panelBackground: "rgba(180,83,9,0.05)",
    title: "#3b2415",
    body: "#6b584c",
    foil: "#e0a96d",
    dark: false,
    layout: "bottomline"
  },
  green: {
    key: "green",
    label: "Emerald Ledger",
    orientation: "vertical",
    surface: "linear-gradient(135deg, #eefcf2 0%, #e5f6ea 50%, #f8fff9 100%)",
    previewBackground: "linear-gradient(135deg, #103b28 0%, #185237 100%)",
    accent: "#9fe6ba",
    border: "rgba(159, 230, 186, 0.2)",
    glow: "rgba(16, 59, 40, 0.2)",
    panelBackground: "rgba(255,255,255,0.08)",
    title: "#f0fdf4",
    body: "rgba(220, 252, 231, 0.82)",
    foil: "#d3f0db",
    dark: true,
    layout: "stripe"
  },
  gold: {
    key: "gold",
    label: "Executive Gold",
    orientation: "horizontal",
    surface: "linear-gradient(135deg, #fff9ec 0%, #fdf2d7 50%, #fffdf7 100%)",
    previewBackground: "linear-gradient(135deg, #fffdfa 0%, #f7f1e5 100%)",
    accent: "#b68a2f",
    border: "rgba(182, 138, 47, 0.24)",
    glow: "rgba(182, 138, 47, 0.14)",
    panelBackground: "rgba(182,138,47,0.06)",
    title: "#1f2937",
    body: "#6b7280",
    foil: "#d6b15b",
    dark: false,
    layout: "topbar"
  },
  dark: {
    key: "dark",
    label: "Black Metal",
    orientation: "vertical",
    surface: "linear-gradient(135deg, #f4f5f7 0%, #eaedf1 50%, #fafbfc 100%)",
    previewBackground: "linear-gradient(135deg, #111111 0%, #242424 100%)",
    accent: "#d4d4d8",
    border: "rgba(212, 212, 216, 0.2)",
    glow: "rgba(0, 0, 0, 0.26)",
    panelBackground: "rgba(255,255,255,0.07)",
    title: "#fafafa",
    body: "rgba(228, 228, 231, 0.78)",
    foil: "#f3f4f6",
    dark: true,
    layout: "minimal-dark"
  }
};
const CARD_META_PREFIX = "__card_meta__";
function normalizeCardSlugInput(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9-_]/g, "").slice(0, 48);
}
function buildDefaultCardSlug(source) {
  const normalized = normalizeCardSlugInput(String(source || "").replace(/\s+/g, "-"));
  if (normalized.length >= 2) return normalized;
  return `card-${Date.now().toString().slice(-6)}`;
}
function roundRectPath(ctx, x, y, width, height, radius) {
  const safeRadius = Math.max(0, Math.min(radius, Math.min(width, height) / 2));
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.arcTo(x + width, y, x + width, y + height, safeRadius);
  ctx.arcTo(x + width, y + height, x, y + height, safeRadius);
  ctx.arcTo(x, y + height, x, y, safeRadius);
  ctx.arcTo(x, y, x + width, y, safeRadius);
  ctx.closePath();
}
function wrapCanvasText(ctx, text, maxWidth) {
  const raw = String(text || "").trim();
  if (!raw) return [];
  const words = raw.split(/\s+/);
  const lines = [];
  let current = "";
  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth || !current) {
      current = next;
      return;
    }
    lines.push(current);
    current = word;
  });
  if (current) lines.push(current);
  return lines;
}
function extractCardMeta(links) {
  const meta = {};
  const preservedLinks = [];
  (Array.isArray(links) ? links : []).forEach((item) => {
    const category = String(item?.category || "").trim();
    if (item?.type === "custom" && category.startsWith(`${CARD_META_PREFIX}:`)) {
      const key = category.slice(CARD_META_PREFIX.length + 1);
      if (key) meta[key] = String(item?.value || "").trim();
      return;
    }
    preservedLinks.push(item);
  });
  return { meta, preservedLinks };
}
function buildCardMetaLinks(fields, preservedLinks) {
  const metaLinks = Object.entries(fields).map(([key, value], index) => ({
    id: `card-meta-${key}-${index}`,
    type: "custom",
    category: `${CARD_META_PREFIX}:${key}`,
    value: String(value || "").trim()
  }));
  return [...Array.isArray(preservedLinks) ? preservedLinks : [], ...metaLinks];
}
function simplifyWebsiteLabel(value) {
  return String(value || "").trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "");
}
function buildCardForm(defaultName = "", defaultPhone = "") {
  return {
    companyName: "",
    jobTitle: "",
    name: String(defaultName || "").trim(),
    phone: String(defaultPhone || "").trim(),
    mobile: String(defaultPhone || "").trim(),
    address: "",
    website: "",
    intro: "",
    cardPublic: true
  };
}
function resolveCardThemeKey(value) {
  const key = String(value || "teal").trim().toLowerCase();
  return CARD_THEME_PRESETS[key] ? key : "teal";
}
function resolveCardOrientation(value) {
  return String(value || "horizontal").trim().toLowerCase() === "vertical" ? "vertical" : "horizontal";
}
function readCardFieldsFromRecord(record, defaults = {}) {
  const { meta, preservedLinks } = extractCardMeta(record?.links || []);
  const defaultName = String(defaults.defaultName || "").trim();
  const defaultPhone = String(defaults.defaultPhone || "").trim();
  const fallbackForm = buildCardForm(defaultName, defaultPhone);
  const resolvedThemeKey = resolveCardThemeKey(record?.template || meta.themeColor || "teal");
  return {
    form: {
      ...fallbackForm,
      companyName: String(meta.companyName || "").trim(),
      jobTitle: String(meta.jobTitle || "").trim(),
      name: String(meta.name || record?.name || defaultName || "").trim(),
      phone: String(meta.phone || record?.phone || defaultPhone || "").trim(),
      mobile: String(meta.mobile || defaultPhone || "").trim(),
      address: String(meta.address || "").trim(),
      website: String(meta.website || "").trim(),
      intro: String(record?.bio || meta.intro || "").trim(),
      cardPublic: record?.cardPublic !== false
    },
    preservedLinks,
    themeKey: resolvedThemeKey,
    orientation: resolveCardOrientation(meta.orientation || CARD_THEME_PRESETS[resolvedThemeKey]?.orientation || "horizontal"),
    slug: normalizeCardSlugInput(record?.cardSlug || "")
  };
}
function createCardPayload(form, themeKey, orientation, preservedLinks, cardSlug) {
  return {
    cardSlug,
    bio: String(form.intro || "").trim(),
    cardPublic: true,
    links: buildCardMetaLinks(
      {
        companyName: form.companyName,
        jobTitle: form.jobTitle,
        name: form.name,
        phone: form.phone,
        mobile: form.mobile,
        address: form.address,
        website: form.website,
        themeColor: themeKey,
        orientation
      },
      preservedLinks
    ),
    template: themeKey
  };
}
function getCardDisplayWebsite(value) {
  return simplifyWebsiteLabel(value);
}
function getCardInfoLines(form) {
  return [form.phone, form.mobile].filter((value, index, array) => {
    const normalized = String(value || "").trim();
    return normalized && array.findIndex((item) => String(item || "").trim() === normalized) === index;
  });
}
function shouldShowCardSidePanel(form) {
  return !!(String(form.companyName || "").trim() || String(form.jobTitle || "").trim() || getCardDisplayWebsite(form.website));
}
async function ensureCardSlug(memberId, preferredSource, currentSlug = "") {
  const preserved = normalizeCardSlugInput(currentSlug);
  if (preserved.length >= 2) return preserved;
  const base = buildDefaultCardSlug(preferredSource || memberId || "card");
  const candidates = [base, `${base}-${String(memberId || "member").slice(-4)}`];
  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = normalizeCardSlugInput(candidates[index]);
    if (candidate.length < 2) continue;
    try {
      const result = await storageAdapter.checkCardSlug(candidate);
      if (result?.available) return candidate;
    } catch (error) {
    }
  }
  let suffix = 1;
  while (suffix < 20) {
    const candidate = normalizeCardSlugInput(`${base}-${suffix}`);
    if (candidate.length < 2) {
      suffix += 1;
      continue;
    }
    try {
      const result = await storageAdapter.checkCardSlug(candidate);
      if (result?.available) return candidate;
    } catch (error) {
    }
    suffix += 1;
  }
  return normalizeCardSlugInput(`${base}-${Date.now().toString().slice(-4)}`);
}
function getCardFileStem(form, fallbackSlug = "") {
  const raw = String(form.name || form.companyName || fallbackSlug || "business-card").trim();
  return raw.replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, "_") || "business-card";
}
function buildBusinessCardImageDataUrl(form, themeKey, orientation = "horizontal") {
  const theme = CARD_THEME_PRESETS[resolveCardThemeKey(themeKey)] || CARD_THEME_PRESETS.teal;
  const cardOrientation = resolveCardOrientation(orientation || theme.orientation);
  const displayWebsite = getCardDisplayWebsite(form.website);
  const showSidePanel = shouldShowCardSidePanel(form) && cardOrientation === "horizontal";
  const canvas = document.createElement("canvas");
  canvas.width = cardOrientation === "vertical" ? 860 : 1200;
  canvas.height = cardOrientation === "vertical" ? 1200 : 720;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("ì´ë¯¸ì§ ìì± ì»¨íì¤í¸ë¥¼ ë§ë¤ ì ììµëë¤.");
  const background = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  const gradientParts = theme.previewBackground.match(/#(?:[0-9a-fA-F]{3}){1,2}/g) || ["#ffffff", "#f5f5f5", "#eeeeee"];
  background.addColorStop(0, gradientParts[0]);
  background.addColorStop(0.52, gradientParts[Math.min(1, gradientParts.length - 1)]);
  background.addColorStop(1, gradientParts[Math.min(2, gradientParts.length - 1)] || gradientParts[gradientParts.length - 1]);
  ctx.fillStyle = background;
  roundRectPath(ctx, 24, 24, canvas.width - 48, canvas.height - 48, 36);
  ctx.fill();
  ctx.save();
  ctx.globalAlpha = theme.dark ? 0.08 : 0.18;
  ctx.fillStyle = theme.dark ? "#ffffff" : theme.foil;
  ctx.beginPath();
  ctx.arc(canvas.width - 190, 120, cardOrientation === "vertical" ? 180 : 240, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = theme.dark ? 0.06 : 0.1;
  ctx.fillStyle = theme.dark ? "#ffffff" : theme.accent;
  ctx.beginPath();
  ctx.arc(cardOrientation === "vertical" ? 120 : 160, canvas.height - 120, cardOrientation === "vertical" ? 150 : 180, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = theme.border;
  ctx.lineWidth = 2;
  roundRectPath(ctx, 24, 24, canvas.width - 48, canvas.height - 48, 36);
  ctx.stroke();
  if (theme.layout === "stripe" && cardOrientation === "horizontal") {
    ctx.fillStyle = theme.foil;
    roundRectPath(ctx, 24, 24, 18, canvas.height - 48, 10);
    ctx.fill();
  }
  if (theme.layout === "topbar") {
    ctx.fillStyle = theme.foil;
    roundRectPath(ctx, 24, 24, canvas.width - 48, 14, 10);
    ctx.fill();
  }
  if (theme.layout === "bottomline") {
    ctx.fillStyle = theme.foil;
    roundRectPath(ctx, 72, canvas.height - 56, canvas.width - 144, 6, 4);
    ctx.fill();
  }
  if (theme.layout === "band" && cardOrientation === "horizontal") {
    ctx.fillStyle = theme.panelBackground;
    roundRectPath(ctx, 64, 136, canvas.width - 128, 112, 24);
    ctx.fill();
  }
  if (theme.layout === "rightpanel" && cardOrientation === "horizontal") {
    ctx.fillStyle = theme.panelBackground;
    roundRectPath(ctx, 860, 48, 268, canvas.height - 96, 28);
    ctx.fill();
  }
  if (theme.layout === "corner") {
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = theme.foil;
    ctx.beginPath();
    ctx.arc(canvas.width - 30, 20, 120, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  if (theme.layout === "minimal-dark") {
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1;
    roundRectPath(ctx, 48, 48, canvas.width - 96, canvas.height - 96, 28);
    ctx.stroke();
  }
  const infoLines = getCardInfoLines(form);
  if (cardOrientation === "vertical") {
    const contentX = 84;
    let cursorY = 116;
    if (String(form.companyName || "").trim()) {
      ctx.fillStyle = theme.accent;
      ctx.font = "800 26px Segoe UI";
      ctx.fillText(String(form.companyName).trim(), contentX, cursorY);
      cursorY += 44;
    }
    ctx.fillStyle = theme.title;
    ctx.font = "900 70px Segoe UI";
    Array.from(String(form.name || "").trim() || "ì´ë¦").slice(0, 4).forEach((char, index) => {
      ctx.fillText(char, contentX, cursorY + index * 84);
    });
    let rightColumnY = cursorY + 100;
    const rightColumnX = 214;
    if (String(form.jobTitle || "").trim()) {
      ctx.fillStyle = theme.body;
      ctx.font = "700 28px Segoe UI";
      wrapCanvasText(ctx, String(form.jobTitle).trim(), 470).slice(0, 2).forEach((line, index) => {
        ctx.fillText(line, rightColumnX, rightColumnY + index * 38);
      });
      rightColumnY += 88;
    }
    ctx.font = "600 24px Segoe UI";
    infoLines.forEach((line, index) => {
      ctx.fillText(index === 0 ? `T. ${line}` : `M. ${line}`, rightColumnX, rightColumnY + index * 36);
    });
    rightColumnY += infoLines.length * 36 + 24;
    if (String(form.address || "").trim()) {
      ctx.font = "500 22px Segoe UI";
      wrapCanvasText(ctx, String(form.address).trim(), 470).slice(0, 3).forEach((line, index) => {
        ctx.fillText(line, rightColumnX, rightColumnY + index * 32);
      });
      rightColumnY += 104;
    }
    if (displayWebsite) {
      ctx.font = "700 24px Segoe UI";
      ctx.fillText(displayWebsite, rightColumnX, rightColumnY);
      rightColumnY += 42;
    }
    if (String(form.intro || "").trim()) {
      ctx.font = "500 22px Segoe UI";
      wrapCanvasText(ctx, String(form.intro).trim(), 470).slice(0, 4).forEach((line, index) => {
        ctx.fillText(line, rightColumnX, rightColumnY + index * 30);
      });
    }
  } else {
    let cursorY = 112;
    if (String(form.companyName || "").trim()) {
      ctx.fillStyle = theme.accent;
      ctx.font = "700 28px Segoe UI";
      ctx.fillText(String(form.companyName).trim(), 72, cursorY);
      cursorY += 44;
    }
    if (String(form.jobTitle || "").trim()) {
      ctx.fillStyle = theme.body;
      ctx.font = "600 22px Segoe UI";
      ctx.fillText(String(form.jobTitle).trim(), 72, cursorY);
      cursorY += 48;
    }
    ctx.fillStyle = theme.title;
    ctx.font = "900 82px Segoe UI";
    ctx.fillText(String(form.name || "").trim() || "ì´ë¦", 72, cursorY + 16);
    cursorY += 94;
    if (infoLines.length) {
      ctx.fillStyle = theme.body;
      ctx.font = "600 28px Segoe UI";
      ctx.fillText(infoLines.join("  Â·  "), 72, cursorY);
      cursorY += 54;
    }
    if (String(form.address || "").trim()) {
      ctx.fillStyle = theme.body;
      ctx.font = "500 24px Segoe UI";
      wrapCanvasText(ctx, String(form.address).trim(), 660).slice(0, 2).forEach((line, index) => {
        ctx.fillText(line, 72, cursorY + index * 34);
      });
      cursorY += 72;
    }
    if (displayWebsite) {
      ctx.fillStyle = theme.body;
      ctx.font = "700 24px Segoe UI";
      ctx.fillText(displayWebsite, 72, cursorY);
      cursorY += 48;
    }
    if (String(form.intro || "").trim()) {
      ctx.fillStyle = theme.body;
      ctx.font = "500 26px Segoe UI";
      wrapCanvasText(ctx, String(form.intro).trim(), 660).slice(0, 4).forEach((line, index) => {
        ctx.fillText(line, 72, cursorY + index * 38);
      });
    }
    if (showSidePanel) {
      ctx.fillStyle = theme.panelBackground;
      roundRectPath(ctx, 830, 116, 300, 488, 30);
      ctx.fill();
      ctx.strokeStyle = theme.border;
      ctx.lineWidth = 1;
      roundRectPath(ctx, 830, 116, 300, 488, 30);
      ctx.stroke();
      let panelY = 192;
      if (String(form.companyName || "").trim()) {
        ctx.fillStyle = theme.title;
        ctx.font = "800 34px Segoe UI";
        wrapCanvasText(ctx, String(form.companyName).trim(), 230).slice(0, 3).forEach((line, index) => {
          ctx.fillText(line, 866, panelY + index * 38);
        });
        panelY += 134;
      }
      if (String(form.jobTitle || "").trim()) {
        ctx.fillStyle = theme.body;
        ctx.font = "700 24px Segoe UI";
        wrapCanvasText(ctx, String(form.jobTitle).trim(), 230).slice(0, 2).forEach((line, index) => {
          ctx.fillText(line, 866, panelY + index * 32);
        });
        panelY += 92;
      }
      if (displayWebsite) {
        ctx.fillStyle = theme.body;
        ctx.font = "700 22px Segoe UI";
        wrapCanvasText(ctx, displayWebsite, 230).slice(0, 2).forEach((line, index) => {
          ctx.fillText(line, 866, panelY + index * 28);
        });
      }
    }
  }
  return canvas.toDataURL("image/png");
}
async function downloadBusinessCardImage(form, themeKey, orientation = "horizontal", fallbackSlug = "") {
  const dataUrl = buildBusinessCardImageDataUrl(form, themeKey, orientation);
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = `${getCardFileStem(form, fallbackSlug)}.png`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
async function shareBusinessCardImage(form, themeKey, orientation = "horizontal", fallbackSlug = "") {
  const dataUrl = buildBusinessCardImageDataUrl(form, themeKey, orientation);
  const blob = await (await fetch(dataUrl)).blob();
  const file = new File([blob], `${getCardFileStem(form, fallbackSlug)}.png`, { type: "image/png" });
  const shareText = [form.name, form.companyName, form.jobTitle].filter((value) => String(value || "").trim()).join("\n");
  if (navigator.share) {
    const canShareFile = typeof navigator.canShare === "function" ? navigator.canShare({ files: [file] }) : true;
    if (canShareFile) {
      await navigator.share({ title: form.name || "ëªí¨", text: shareText, files: [file] });
      return "shared";
    }
    await navigator.share({ title: form.name || "ëªí¨", text: shareText });
    return "shared";
  }
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(shareText || form.name || "ëªí¨");
    return "copied";
  }
  return "unsupported";
}
function BusinessCardSurface({ form, themeKey, orientation = "horizontal" }) {
  const theme = CARD_THEME_PRESETS[resolveCardThemeKey(themeKey)] || CARD_THEME_PRESETS.teal;
  const cardOrientation = resolveCardOrientation(orientation || theme.orientation);
  const displayWebsite = getCardDisplayWebsite(form.website);
  const infoLines = getCardInfoLines(form);
  const showSidePanel = shouldShowCardSidePanel(form) && cardOrientation === "horizontal";
  const layout = theme.layout || "soft";
  return /* @__PURE__ */ jsxDEV("div", { style: { borderRadius: 28, padding: 22, background: theme.previewBackground, color: theme.title, border: `1px solid ${theme.border}`, boxShadow: `0 22px 42px ${theme.glow}`, position: "relative", overflow: "hidden", minHeight: cardOrientation === "vertical" ? 420 : 280 }, children: [
    /* @__PURE__ */ jsxDEV("div", { style: { position: "absolute", inset: 0, background: theme.dark ? "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0) 48%)" : "linear-gradient(135deg, rgba(255,255,255,0.52), rgba(255,255,255,0) 44%)", pointerEvents: "none" } }, void 0, false, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 3340,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { style: { position: "absolute", right: -80, top: -110, width: 260, height: 260, borderRadius: "50%", background: `radial-gradient(circle, ${theme.foil}33 0%, rgba(255,255,255,0) 72%)`, pointerEvents: "none" } }, void 0, false, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 3341,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { style: { position: "absolute", left: -40, bottom: -90, width: 220, height: 220, borderRadius: "50%", background: theme.dark ? "radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 72%)" : "radial-gradient(circle, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0) 72%)", pointerEvents: "none" } }, void 0, false, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 3342,
      columnNumber: 7
    }, this),
    layout === "stripe" && cardOrientation === "horizontal" ? /* @__PURE__ */ jsxDEV("div", { style: { position: "absolute", left: 0, top: 0, bottom: 0, width: 10, background: theme.foil } }, void 0, false, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 3343,
      columnNumber: 66
    }, this) : null,
    layout === "topbar" ? /* @__PURE__ */ jsxDEV("div", { style: { position: "absolute", left: 0, top: 0, right: 0, height: 12, background: theme.foil } }, void 0, false, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 3344,
      columnNumber: 30
    }, this) : null,
    layout === "bottomline" ? /* @__PURE__ */ jsxDEV("div", { style: { position: "absolute", left: 26, right: 26, bottom: 16, height: 4, borderRadius: 999, background: theme.foil } }, void 0, false, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 3345,
      columnNumber: 34
    }, this) : null,
    layout === "band" && cardOrientation === "horizontal" ? /* @__PURE__ */ jsxDEV("div", { style: { position: "absolute", left: 18, right: 18, top: 84, height: 56, borderRadius: 18, background: theme.panelBackground } }, void 0, false, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 3346,
      columnNumber: 64
    }, this) : null,
    layout === "corner" ? /* @__PURE__ */ jsxDEV("div", { style: { position: "absolute", top: -26, right: -24, width: 120, height: 120, borderRadius: "50%", background: `${theme.foil}33` } }, void 0, false, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 3347,
      columnNumber: 30
    }, this) : null,
    layout === "minimal-dark" ? /* @__PURE__ */ jsxDEV("div", { style: { position: "absolute", inset: 14, borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)" } }, void 0, false, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 3348,
      columnNumber: 36
    }, this) : null,
    cardOrientation === "vertical" ? /* @__PURE__ */ jsxDEV("div", { style: { position: "relative", display: "grid", gridTemplateColumns: "92px minmax(0, 1fr)", gap: 18, alignItems: "start", minHeight: 360 }, children: [
      /* @__PURE__ */ jsxDEV("div", { style: { minWidth: 0, display: "grid", gap: 10 }, children: [
        String(form.companyName || "").trim() ? /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 13, fontWeight: 900, letterSpacing: "0.08em", color: theme.accent, wordBreak: "break-word" }, children: String(form.companyName).trim() }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 3352,
          columnNumber: 54
        }, this) : null,
        /* @__PURE__ */ jsxDEV("div", { style: { display: "grid", gap: 2 }, children: Array.from(String(form.name || "").trim() || "ì´ë¦").slice(0, 4).map(
          (char, index) => /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 42, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.04em", color: theme.title }, children: char }, `${char}-${index}`, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 3355,
            columnNumber: 13
          }, this)
        ) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 3353,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 3351,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { style: { minWidth: 0, paddingTop: 86 }, children: [
        String(form.jobTitle || "").trim() ? /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 16, fontWeight: 800, color: theme.body, marginBottom: 18, wordBreak: "break-word" }, children: String(form.jobTitle).trim() }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 3360,
          columnNumber: 51
        }, this) : null,
        infoLines.map(
          (value, index) => /* @__PURE__ */ jsxDEV("div", { style: { marginTop: index === 0 ? 0 : 8, fontSize: 14, fontWeight: 700, color: theme.body, wordBreak: "break-word" }, children: index === 0 ? `T. ${value}` : `M. ${value}` }, `${value}-${index}`, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 3362,
            columnNumber: 11
          }, this)
        ),
        String(form.address || "").trim() ? /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 16, fontSize: 13, lineHeight: 1.62, color: theme.body, wordBreak: "break-word" }, children: String(form.address).trim() }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 3364,
          columnNumber: 50
        }, this) : null,
        displayWebsite ? /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 16, fontSize: 14, fontWeight: 900, color: theme.body, wordBreak: "break-word" }, children: displayWebsite }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 3365,
          columnNumber: 31
        }, this) : null,
        String(form.intro || "").trim() ? /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 16, fontSize: 13, lineHeight: 1.62, color: theme.body, wordBreak: "break-word" }, children: String(form.intro).trim() }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 3366,
          columnNumber: 48
        }, this) : null
      ] }, void 0, true, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 3359,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 3350,
      columnNumber: 7
    }, this) : /* @__PURE__ */ jsxDEV("div", { style: { position: "relative", display: "grid", gridTemplateColumns: showSidePanel ? "minmax(0, 1fr) 190px" : "1fr", gap: 16, alignItems: "stretch" }, children: [
      /* @__PURE__ */ jsxDEV("div", { style: { minWidth: 0 }, children: [
        String(form.companyName || "").trim() ? /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 14, fontWeight: 900, letterSpacing: "0.12em", color: theme.accent, marginBottom: 8, wordBreak: "break-word" }, children: String(form.companyName).trim() }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 3372,
          columnNumber: 54
        }, this) : null,
        String(form.jobTitle || "").trim() ? /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 13, fontWeight: 700, color: theme.body, marginBottom: 10, wordBreak: "break-word" }, children: String(form.jobTitle).trim() }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 3373,
          columnNumber: 51
        }, this) : null,
        /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 34, fontWeight: 900, lineHeight: 1.04, letterSpacing: "-0.05em", color: theme.title, wordBreak: "break-word" }, children: String(form.name || "").trim() || "ì´ë¦" }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 3374,
          columnNumber: 13
        }, this),
        infoLines.map(
          (value, index) => /* @__PURE__ */ jsxDEV("div", { style: { marginTop: index === 0 ? 12 : 6, fontSize: 14, fontWeight: 700, color: theme.body, wordBreak: "break-word" }, children: value }, `${value}-${index}`, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 3376,
            columnNumber: 11
          }, this)
        ),
        String(form.address || "").trim() ? /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 14, fontSize: 13, lineHeight: 1.58, color: theme.body, wordBreak: "break-word" }, children: String(form.address).trim() }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 3378,
          columnNumber: 50
        }, this) : null,
        displayWebsite ? /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 12, fontSize: 13, fontWeight: 800, color: theme.body, wordBreak: "break-word" }, children: displayWebsite }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 3379,
          columnNumber: 31
        }, this) : null,
        String(form.intro || "").trim() ? /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 16, fontSize: 14, lineHeight: 1.64, color: theme.body, wordBreak: "break-word" }, children: String(form.intro).trim() }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 3380,
          columnNumber: 48
        }, this) : null
      ] }, void 0, true, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 3371,
        columnNumber: 11
      }, this),
      showSidePanel ? /* @__PURE__ */ jsxDEV("div", { style: { alignSelf: "stretch", borderRadius: 24, padding: 16, background: theme.panelBackground, border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", justifyContent: "center", gap: 10, minWidth: 0 }, children: [
        String(form.companyName || "").trim() ? /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 18, fontWeight: 900, lineHeight: 1.25, color: theme.title, wordBreak: "break-word" }, children: String(form.companyName).trim() }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 3384,
          columnNumber: 56
        }, this) : null,
        String(form.jobTitle || "").trim() ? /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 13, fontWeight: 700, lineHeight: 1.5, color: theme.body, wordBreak: "break-word" }, children: String(form.jobTitle).trim() }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 3385,
          columnNumber: 53
        }, this) : null,
        displayWebsite ? /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 12, fontWeight: 800, lineHeight: 1.5, color: theme.body, wordBreak: "break-word" }, children: displayWebsite }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 3386,
          columnNumber: 33
        }, this) : null
      ] }, void 0, true, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 3383,
        columnNumber: 9
      }, this) : null
    ] }, void 0, true, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 3370,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
    lineNumber: 3339,
    columnNumber: 5
  }, this);
}
_c40 = BusinessCardSurface;
function BusinessCardThemeThumbnail({ theme, active }) {
  const isVertical = resolveCardOrientation(theme.orientation) === "vertical";
  return /* @__PURE__ */ jsxDEV("div", { style: { border: active ? `2px solid ${theme.accent}` : "1px solid rgba(148,163,184,0.18)", background: "rgba(255,255,255,0.78)", borderRadius: 18, padding: 8, boxShadow: active ? `0 10px 20px ${theme.glow}` : "none" }, children: [
    /* @__PURE__ */ jsxDEV("div", { style: { position: "relative", height: isVertical ? 120 : 72, borderRadius: 14, overflow: "hidden", background: theme.previewBackground, border: `1px solid ${theme.border}` }, children: [
      theme.layout === "stripe" && !isVertical ? /* @__PURE__ */ jsxDEV("div", { style: { position: "absolute", left: 0, top: 0, bottom: 0, width: 6, background: theme.foil } }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 3400,
        columnNumber: 53
      }, this) : null,
      theme.layout === "topbar" ? /* @__PURE__ */ jsxDEV("div", { style: { position: "absolute", left: 0, right: 0, top: 0, height: 8, background: theme.foil } }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 3401,
        columnNumber: 38
      }, this) : null,
      theme.layout === "bottomline" ? /* @__PURE__ */ jsxDEV("div", { style: { position: "absolute", left: 8, right: 8, bottom: 8, height: 3, borderRadius: 999, background: theme.foil } }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 3402,
        columnNumber: 42
      }, this) : null,
      theme.layout === "rightpanel" && !isVertical ? /* @__PURE__ */ jsxDEV("div", { style: { position: "absolute", top: 0, right: 0, bottom: 0, width: 26, background: theme.panelBackground } }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 3403,
        columnNumber: 57
      }, this) : null,
      /* @__PURE__ */ jsxDEV("div", { style: { position: "absolute", inset: 0, padding: isVertical ? 8 : 10, display: "flex", flexDirection: isVertical ? "row" : "column", justifyContent: isVertical ? "space-between" : "space-between" }, children: isVertical ? /* @__PURE__ */ jsxDEV(Fragment, { children: [
        /* @__PURE__ */ jsxDEV("div", { style: { display: "grid", gap: 2 }, children: Array.from("íê¸¸ë").slice(0, 3).map(
          (char, index) => /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 16, fontWeight: 900, lineHeight: 1, color: theme.title }, children: char }, `${char}-${index}`, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 3409,
            columnNumber: 15
          }, this)
        ) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 3407,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", flexDirection: "column", justifyContent: "space-between", paddingTop: 8 }, children: [
          /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 8, fontWeight: 900, letterSpacing: "0.08em", color: theme.accent }, children: "SMI" }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 3413,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 8, fontWeight: 700, color: theme.body }, children: "ëíì´ì¬" }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 3415,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 6, fontSize: 8, fontWeight: 700, color: theme.body }, children: "smi.ceo" }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 3416,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 3414,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 3412,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 3406,
        columnNumber: 11
      }, this) : /* @__PURE__ */ jsxDEV(Fragment, { children: [
        /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 8, fontWeight: 900, letterSpacing: "0.08em", color: theme.accent }, children: "SMI SHARE UNITY" }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 3422,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 16, fontWeight: 900, lineHeight: 1, color: theme.title }, children: "íê¸¸ë" }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 3424,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 4, fontSize: 8, fontWeight: 700, color: theme.body }, children: "ëíì´ì¬" }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 3425,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 3423,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 3421,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 3404,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 3399,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 6, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }, children: [
      /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 11, fontWeight: 800, color: "#475569" }, children: theme.label }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 3432,
        columnNumber: 9
      }, this),
      active ? /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 11, fontWeight: 900, color: theme.accent }, children: "ì íë¨" }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 3433,
        columnNumber: 19
      }, this) : null
    ] }, void 0, true, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 3431,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
    lineNumber: 3398,
    columnNumber: 5
  }, this);
}
_c41 = BusinessCardThemeThumbnail;
function CardCreateExperienceBridge() {
  _s8();
  const location = useLocation();
  const observerRef = useRef(null);
  const hiddenModalRef = useRef(null);
  const overlayRef = useRef(null);
  const hostRef = useRef(null);
  const [hostNode, setHostNode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [selectedCardTheme, setSelectedCardTheme] = useState("teal");
  const [selectedCardOrientation, setSelectedCardOrientation] = useState("horizontal");
  const [toast, setToast] = useState("");
  const [savedSlug, setSavedSlug] = useState("");
  const [initialSlug, setInitialSlug] = useState("");
  const [preservedLinks, setPreservedLinks] = useState([]);
  const [form, setForm] = useState(buildCardForm());
  const currentUser = getCurrentUser();
  const session = getSession();
  const memberId = String(session?.memberId || currentUser?.memberId || currentUser?.id || "").trim();
  const defaultName = String(currentUser?.name || session?.name || "").trim();
  const defaultPhone = String(currentUser?.phone || session?.phone || currentUser?.phoneNumber || "").trim();
  const previewTheme = CARD_THEME_PRESETS[selectedCardTheme] || CARD_THEME_PRESETS.teal;
  const displayWebsite = getCardDisplayWebsite(form.website);
  const visibleThemes = Object.values(CARD_THEME_PRESETS).filter((theme) => resolveCardOrientation(theme.orientation) === selectedCardOrientation);
  const closeBridgeModal = () => {
    const overlay = overlayRef.current;
    if (overlay) {
      overlay.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }
  };
  const hydrateFromServer = async () => {
    if (!memberId) return;
    setLoading(true);
    try {
      const existing = await storageAdapter.fetchUserCard(memberId).catch(() => null);
      const resolved = readCardFieldsFromRecord(existing, { defaultName, defaultPhone });
      const nextSlug = resolved.slug || await ensureCardSlug(memberId, existing?.cardSlug || resolved.form.name || defaultName || memberId);
      setPreservedLinks(resolved.preservedLinks);
      setForm(resolved.form);
      setInitialSlug(nextSlug);
      setSavedSlug(resolved.slug || "");
      setSelectedCardTheme(resolved.themeKey);
      setSelectedCardOrientation(resolved.orientation);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!toast) return void 0;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (location.pathname !== "/my") {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (hiddenModalRef.current) {
        hiddenModalRef.current.style.display = "";
        hiddenModalRef.current = null;
      }
      if (hostRef.current?.parentElement) {
        hostRef.current.parentElement.removeChild(hostRef.current);
      }
      hostRef.current = null;
      overlayRef.current = null;
      setHostNode(null);
      return void 0;
    }
    const findFixedAncestor = (node) => {
      let current = node;
      while (current && current !== document.body) {
        if (current instanceof HTMLElement) {
          const style = window.getComputedStyle(current);
          if (style.position === "fixed") return current;
        }
        current = current.parentElement;
      }
      return null;
    };
    const ensureModalBridge = () => {
      try {
        if (sessionStorage.getItem("su:open-card-editor") === "1") {
          const buttons = Array.from(document.querySelectorAll("button"));
          const createButton = buttons.find((button) => String(button.textContent || "").trim() === "ëªí¨ ë§ë¤ê¸°");
          if (createButton) {
            sessionStorage.removeItem("su:open-card-editor");
            createButton.click();
          } else {
            const myCardButton = buttons.find((button) => String(button.textContent || "").includes("ë´ ëªí¨"));
            if (myCardButton) myCardButton.click();
          }
        }
      } catch (error) {
      }
      const slugInput = Array.from(document.querySelectorAll('input[placeholder="my-name"]'))[0];
      if (!slugInput) {
        if (hiddenModalRef.current) {
          hiddenModalRef.current.style.display = "";
          hiddenModalRef.current = null;
        }
        if (hostRef.current?.parentElement) {
          hostRef.current.parentElement.removeChild(hostRef.current);
        }
        hostRef.current = null;
        overlayRef.current = null;
        setHostNode(null);
        return;
      }
      const overlay = findFixedAncestor(slugInput);
      if (!overlay) return;
      const originalModal = Array.from(overlay.children).find((child) => child instanceof HTMLElement && child.querySelector?.('input[placeholder="my-name"]'));
      if (!originalModal) return;
      overlayRef.current = overlay;
      if (hiddenModalRef.current && hiddenModalRef.current !== originalModal) {
        hiddenModalRef.current.style.display = "";
      }
      hiddenModalRef.current = originalModal;
      originalModal.style.display = "none";
      let host = overlay.querySelector('[data-card-create-bridge-root="true"]');
      if (!host) {
        host = document.createElement("div");
        host.setAttribute("data-card-create-bridge-root", "true");
        overlay.appendChild(host);
      }
      hostRef.current = host;
      setHostNode((prev) => prev === host ? prev : host);
    };
    ensureModalBridge();
    const observer = new MutationObserver(() => ensureModalBridge());
    observer.observe(document.body, { childList: true, subtree: true });
    observerRef.current = observer;
    return () => {
      observer.disconnect();
      observerRef.current = null;
      if (hiddenModalRef.current) {
        hiddenModalRef.current.style.display = "";
        hiddenModalRef.current = null;
      }
      if (hostRef.current?.parentElement) {
        hostRef.current.parentElement.removeChild(hostRef.current);
      }
      hostRef.current = null;
      overlayRef.current = null;
    };
  }, [location.pathname]);
  useEffect(() => {
    if (!hostNode || location.pathname !== "/my") return;
    hydrateFromServer();
  }, [hostNode, location.pathname]);
  useEffect(() => {
    const activeTheme = CARD_THEME_PRESETS[selectedCardTheme];
    if (activeTheme && resolveCardOrientation(activeTheme.orientation) === selectedCardOrientation) return;
    const fallbackTheme = Object.values(CARD_THEME_PRESETS).find((theme) => resolveCardOrientation(theme.orientation) === selectedCardOrientation);
    if (fallbackTheme) setSelectedCardTheme(fallbackTheme.key);
  }, [selectedCardOrientation, selectedCardTheme]);
  const setFieldValue = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };
  const savePreviewImage = async () => {
    try {
      await downloadBusinessCardImage(form, selectedCardTheme, selectedCardOrientation, savedSlug || initialSlug);
      setToast("ì´ë¯¸ì§ë¥¼ ì ì¥íìµëë¤.");
    } catch (error) {
      setToast("ì´ë¯¸ì§ ì ì¥ì ì¤í¨íìµëë¤.");
    }
  };
  const sharePreviewCard = async () => {
    try {
      setShareLoading(true);
      const result = await shareBusinessCardImage(form, selectedCardTheme, selectedCardOrientation, savedSlug || initialSlug);
      if (result === "shared") setToast("ì¹´í¡ ì ì¡ ì°½ì ì´ììµëë¤.");
      else if (result === "copied") setToast("ëªí¨ ì ë³´ë¥¼ ë³µì¬íìµëë¤.");
      else
        setToast("ì´ ê¸°ê¸°ììë ê³µì ë¥¼ ì§ìíì§ ììµëë¤.");
    } catch (error) {
      setToast("ì¹´í¡ ì ì¡ì ì¤í¨íìµëë¤.");
    } finally {
      setShareLoading(false);
    }
  };
  const saveCardRecord = async () => {
    if (!memberId) {
      setToast("ë¡ê·¸ì¸ì´ íìí©ëë¤.");
      return;
    }
    try {
      setSaving(true);
      const slug = await ensureCardSlug(memberId, form.name || defaultName || memberId, initialSlug || savedSlug);
      await storageAdapter.saveCard(memberId, createCardPayload(form, selectedCardTheme, selectedCardOrientation, preservedLinks, slug));
      setSavedSlug(slug);
      setInitialSlug(slug);
      window.dispatchEvent(new CustomEvent("su:ssot:changed", { detail: { type: "card", operation: "save", data: { cardSlug: slug, template: selectedCardTheme, orientation: selectedCardOrientation } } }));
      setToast("ëªí¨ì ì ì¥íìµëë¤.");
    } catch (error) {
      setToast(error?.message || "ëªí¨ ì ì¥ì ì¤í¨íìµëë¤.");
    } finally {
      setSaving(false);
    }
  };
  if (location.pathname !== "/my" || !hostNode) return null;
  return createPortal(
    /* @__PURE__ */ jsxDEV(Fragment, { children: [
      toast ? /* @__PURE__ */ jsxDEV("div", { style: { position: "fixed", top: 18, left: "50%", transform: "translateX(-50%)", zIndex: 2002, minWidth: 180, maxWidth: "calc(100vw - 36px)", padding: "12px 16px", borderRadius: 14, background: "rgba(8,15,28,0.96)", color: "#f8fafc", boxShadow: "0 20px 40px rgba(0,0,0,0.22)", border: "1px solid rgba(45,212,191,0.18)", fontSize: 13, fontWeight: 800, textAlign: "center" }, children: toast }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 3663,
        columnNumber: 7
      }, this) : null,
      /* @__PURE__ */ jsxDEV("div", { onClick: (event) => event.stopPropagation(), style: { width: "min(760px, 100%)", maxHeight: "min(92vh, 860px)", overflowY: "auto", borderRadius: 28, background: previewTheme.surface, boxShadow: `0 34px 90px rgba(15,23,42,0.28), 0 12px 30px ${previewTheme.glow}`, border: `1px solid ${previewTheme.border}`, padding: 18, color: "#0f172a" }, children: [
        /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16 }, children: [
          /* @__PURE__ */ jsxDEV("div", { children: /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 23, fontWeight: 900, letterSpacing: "-0.03em", color: "#0f172a" }, children: "ëªí¨ ë§ë¤ê¸°" }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 3668,
            columnNumber: 13
          }, this) }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 3667,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ jsxDEV("button", { type: "button", onClick: closeBridgeModal, style: { width: 42, height: 42, borderRadius: 999, border: "1px solid rgba(15,23,42,0.08)", background: "rgba(255,255,255,0.72)", color: "#475569", fontSize: 22, cursor: "pointer", lineHeight: 1 }, children: "Ã" }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 3670,
            columnNumber: 11
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 3666,
          columnNumber: 9
        }, this),
        loading ? /* @__PURE__ */ jsxDEV("div", { style: { padding: "48px 12px", textAlign: "center", color: "#52616b", fontSize: 14, fontWeight: 700 }, children: "ëªí¨ ì ë³´ë¥¼ ë¶ë¬ì¤ë ì¤ìëë¤..." }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 3674,
          columnNumber: 9
        }, this) : /* @__PURE__ */ jsxDEV(Fragment, { children: [
          /* @__PURE__ */ jsxDEV("div", { style: { borderRadius: 22, background: "rgba(255,255,255,0.56)", border: "1px solid rgba(255,255,255,0.8)", padding: 14, marginBottom: 14, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.64)" }, children: [
            /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 14, fontWeight: 900, color: "#0f172a", marginBottom: 6 }, children: "ëìì¸ ì í" }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 3678,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 12, color: "#64748b", lineHeight: 1.55, marginBottom: 10 }, children: "ëê¸°ìí ì¢ì´ ëªí¨ ë¬´ëì 10ì¢ ííë¦¿ìëë¤. ê¸ì¥, ìì, íì´í¸, ë¼ì´í¸ ê·¸ë ì´ ì¤ì¬ì¼ë¡ êµ¬ì±íìµëë¤." }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 3679,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("div", { style: { display: "inline-flex", gap: 8, padding: 6, borderRadius: 999, background: "rgba(241,245,249,0.9)", border: "1px solid rgba(203,213,225,0.9)", marginBottom: 12 }, children: [
              /* @__PURE__ */ jsxDEV("button", { type: "button", onClick: () => setSelectedCardOrientation("horizontal"), style: { minHeight: 34, padding: "0 14px", borderRadius: 999, border: "none", background: selectedCardOrientation === "horizontal" ? "linear-gradient(90deg,#0f766e,#14b8a6)" : "transparent", color: selectedCardOrientation === "horizontal" ? "#ffffff" : "#475569", fontSize: 12, fontWeight: 900, cursor: "pointer" }, children: "ê°ë¡í" }, void 0, false, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 3681,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("button", { type: "button", onClick: () => setSelectedCardOrientation("vertical"), style: { minHeight: 34, padding: "0 14px", borderRadius: 999, border: "none", background: selectedCardOrientation === "vertical" ? "linear-gradient(90deg,#0f766e,#14b8a6)" : "transparent", color: selectedCardOrientation === "vertical" ? "#ffffff" : "#475569", fontSize: 12, fontWeight: 900, cursor: "pointer" }, children: "ì¸ë¡í" }, void 0, false, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 3682,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 3680,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(108px, 1fr))", gap: 10 }, children: visibleThemes.map((theme) => {
              const active = theme.key === selectedCardTheme;
              return /* @__PURE__ */ jsxDEV("button", { type: "button", onClick: () => setSelectedCardTheme(theme.key), style: { border: "none", background: "transparent", padding: 0, cursor: "pointer", textAlign: "left" }, children: /* @__PURE__ */ jsxDEV(BusinessCardThemeThumbnail, { theme, active }, void 0, false, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 3689,
                columnNumber: 23
              }, this) }, theme.key, false, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 3688,
                columnNumber: 19
              }, this);
            }) }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 3684,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 3677,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { style: { borderRadius: 24, background: "rgba(255,255,255,0.52)", border: "1px solid rgba(255,255,255,0.78)", padding: 14, marginBottom: 14 }, children: [
            /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 14, fontWeight: 900, color: "#0f172a", marginBottom: 10 }, children: "ë¯¸ë¦¬ë³´ê¸°" }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 3697,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV(BusinessCardSurface, { form, themeKey: selectedCardTheme, orientation: selectedCardOrientation }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 3698,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 3696,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { style: { borderRadius: 22, background: "rgba(255,255,255,0.56)", border: "1px solid rgba(255,255,255,0.8)", padding: 14, marginBottom: 14 }, children: [
            /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 14, fontWeight: 900, color: "#0f172a", marginBottom: 12 }, children: "ì ë³´ ìë ¥" }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 3702,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }, children: [
              /* @__PURE__ */ jsxDEV("div", { children: [
                /* @__PURE__ */ jsxDEV("label", { style: { display: "block", fontSize: 12, fontWeight: 800, color: "#52616b", marginBottom: 6 }, children: "íì¬ëª" }, void 0, false, {
                  fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                  lineNumber: 3705,
                  columnNumber: 19
                }, this),
                /* @__PURE__ */ jsxDEV("input", { value: form.companyName, onChange: (event) => setFieldValue("companyName", event.target.value), style: { width: "100%", boxSizing: "border-box", minHeight: 46, borderRadius: 14, border: "1px solid rgba(203,213,225,0.95)", background: "rgba(255,255,255,0.88)", color: "#0f172a", padding: "0 12px", fontSize: 14, outline: "none" } }, void 0, false, {
                  fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                  lineNumber: 3706,
                  columnNumber: 19
                }, this)
              ] }, void 0, true, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 3704,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("div", { children: [
                /* @__PURE__ */ jsxDEV("label", { style: { display: "block", fontSize: 12, fontWeight: 800, color: "#52616b", marginBottom: 6 }, children: "ì§ì±" }, void 0, false, {
                  fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                  lineNumber: 3709,
                  columnNumber: 19
                }, this),
                /* @__PURE__ */ jsxDEV("input", { value: form.jobTitle, onChange: (event) => setFieldValue("jobTitle", event.target.value), style: { width: "100%", boxSizing: "border-box", minHeight: 46, borderRadius: 14, border: "1px solid rgba(203,213,225,0.95)", background: "rgba(255,255,255,0.88)", color: "#0f172a", padding: "0 12px", fontSize: 14, outline: "none" } }, void 0, false, {
                  fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                  lineNumber: 3710,
                  columnNumber: 19
                }, this)
              ] }, void 0, true, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 3708,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("div", { children: [
                /* @__PURE__ */ jsxDEV("label", { style: { display: "block", fontSize: 12, fontWeight: 800, color: "#52616b", marginBottom: 6 }, children: "ì´ë¦" }, void 0, false, {
                  fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                  lineNumber: 3713,
                  columnNumber: 19
                }, this),
                /* @__PURE__ */ jsxDEV("input", { value: form.name, onChange: (event) => setFieldValue("name", event.target.value), style: { width: "100%", boxSizing: "border-box", minHeight: 46, borderRadius: 14, border: "1px solid rgba(203,213,225,0.95)", background: "rgba(255,255,255,0.88)", color: "#0f172a", padding: "0 12px", fontSize: 14, outline: "none" } }, void 0, false, {
                  fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                  lineNumber: 3714,
                  columnNumber: 19
                }, this)
              ] }, void 0, true, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 3712,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("div", { children: [
                /* @__PURE__ */ jsxDEV("label", { style: { display: "block", fontSize: 12, fontWeight: 800, color: "#52616b", marginBottom: 6 }, children: "ì íë²í¸" }, void 0, false, {
                  fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                  lineNumber: 3717,
                  columnNumber: 19
                }, this),
                /* @__PURE__ */ jsxDEV("input", { value: form.phone, onChange: (event) => setFieldValue("phone", event.target.value), style: { width: "100%", boxSizing: "border-box", minHeight: 46, borderRadius: 14, border: "1px solid rgba(203,213,225,0.95)", background: "rgba(255,255,255,0.88)", color: "#0f172a", padding: "0 12px", fontSize: 14, outline: "none" } }, void 0, false, {
                  fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                  lineNumber: 3718,
                  columnNumber: 19
                }, this)
              ] }, void 0, true, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 3716,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("div", { children: [
                /* @__PURE__ */ jsxDEV("label", { style: { display: "block", fontSize: 12, fontWeight: 800, color: "#52616b", marginBottom: 6 }, children: "í¸ëí°" }, void 0, false, {
                  fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                  lineNumber: 3721,
                  columnNumber: 19
                }, this),
                /* @__PURE__ */ jsxDEV("input", { value: form.mobile, onChange: (event) => setFieldValue("mobile", event.target.value), style: { width: "100%", boxSizing: "border-box", minHeight: 46, borderRadius: 14, border: "1px solid rgba(203,213,225,0.95)", background: "rgba(255,255,255,0.88)", color: "#0f172a", padding: "0 12px", fontSize: 14, outline: "none" } }, void 0, false, {
                  fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                  lineNumber: 3722,
                  columnNumber: 19
                }, this)
              ] }, void 0, true, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 3720,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("div", { children: [
                /* @__PURE__ */ jsxDEV("label", { style: { display: "block", fontSize: 12, fontWeight: 800, color: "#52616b", marginBottom: 6 }, children: "ì¬ì´í¸ ì£¼ì" }, void 0, false, {
                  fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                  lineNumber: 3725,
                  columnNumber: 19
                }, this),
                /* @__PURE__ */ jsxDEV("input", { value: form.website, onChange: (event) => setFieldValue("website", event.target.value), style: { width: "100%", boxSizing: "border-box", minHeight: 46, borderRadius: 14, border: "1px solid rgba(203,213,225,0.95)", background: "rgba(255,255,255,0.88)", color: "#0f172a", padding: "0 12px", fontSize: 14, outline: "none" } }, void 0, false, {
                  fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                  lineNumber: 3726,
                  columnNumber: 19
                }, this)
              ] }, void 0, true, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 3724,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 3703,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 12 }, children: [
              /* @__PURE__ */ jsxDEV("label", { style: { display: "block", fontSize: 12, fontWeight: 800, color: "#52616b", marginBottom: 6 }, children: "ì£¼ì" }, void 0, false, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 3730,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("input", { value: form.address, onChange: (event) => setFieldValue("address", event.target.value), style: { width: "100%", boxSizing: "border-box", minHeight: 46, borderRadius: 14, border: "1px solid rgba(203,213,225,0.95)", background: "rgba(255,255,255,0.88)", color: "#0f172a", padding: "0 12px", fontSize: 14, outline: "none" } }, void 0, false, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 3731,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 3729,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 12 }, children: [
              /* @__PURE__ */ jsxDEV("label", { style: { display: "block", fontSize: 12, fontWeight: 800, color: "#52616b", marginBottom: 6 }, children: "ìê°ê¸" }, void 0, false, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 3734,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("textarea", { value: form.intro, onChange: (event) => setFieldValue("intro", event.target.value), style: { width: "100%", boxSizing: "border-box", minHeight: 90, resize: "vertical", borderRadius: 14, border: "1px solid rgba(203,213,225,0.95)", background: "rgba(255,255,255,0.88)", color: "#0f172a", padding: "12px 14px", fontSize: 14, outline: "none" } }, void 0, false, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 3735,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 3733,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 3701,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }, children: [
            /* @__PURE__ */ jsxDEV("button", { type: "button", onClick: saveCardRecord, disabled: saving, style: { minHeight: 50, borderRadius: 16, border: "none", background: "linear-gradient(90deg,#0f766e,#14b8a6)", color: "#effffb", fontSize: 15, fontWeight: 900, cursor: saving ? "default" : "pointer", opacity: saving ? 0.55 : 1 }, children: "ì ì¥" }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 3740,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("button", { type: "button", onClick: savePreviewImage, style: { minHeight: 50, borderRadius: 16, border: "1px solid rgba(15,118,110,0.18)", background: "rgba(255,255,255,0.86)", color: "#0f766e", fontSize: 15, fontWeight: 900, cursor: "pointer" }, children: "ì´ë¯¸ì§ ì ì¥" }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 3741,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("button", { type: "button", onClick: sharePreviewCard, disabled: shareLoading, style: { minHeight: 50, borderRadius: 16, border: "1px solid rgba(15,23,42,0.08)", background: "rgba(255,255,255,0.86)", color: "#0f172a", fontSize: 15, fontWeight: 900, cursor: shareLoading ? "default" : "pointer", opacity: shareLoading ? 0.55 : 1 }, children: "ì¹´í¡ ì ì¡" }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 3742,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 3739,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 3676,
          columnNumber: 9
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 3665,
        columnNumber: 7
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 3661,
      columnNumber: 5
    }, this),
    hostNode
  );
}
_s8(CardCreateExperienceBridge, "XXM0xLe0CRYZQphzp6o3gZNV2p4=", false, function() {
  return [useLocation];
});
_c42 = CardCreateExperienceBridge;
function SimpleSavedCardPage() {
  _s9();
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [toast, setToast] = useState("");
  const [cardState, setCardState] = useState(() => ({
    form: buildCardForm(),
    themeKey: "teal",
    orientation: "horizontal",
    memberId: "",
    cardSlug: "",
    exists: false
  }));
  const currentUser = getCurrentUser();
  const session = getSession();
  const viewerMemberId = String(session?.memberId || currentUser?.memberId || currentUser?.id || "").trim();
  const isOwner = !!viewerMemberId && String(cardState.memberId || "") === viewerMemberId;
  useEffect(() => {
    if (!toast) return void 0;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    let cancelled = false;
    const loadCard = async () => {
      setLoading(true);
      try {
        const card = await storageAdapter.fetchCardBySlug(slug);
        if (cancelled) return;
        const resolved = readCardFieldsFromRecord(card, {});
        setCardState({
          form: resolved.form,
          themeKey: resolved.themeKey,
          orientation: resolved.orientation,
          memberId: String(card?.memberId || "").trim(),
          cardSlug: resolved.slug || normalizeCardSlugInput(slug),
          exists: true
        });
      } catch (error) {
        if (cancelled) return;
        setCardState((prev) => ({ ...prev, exists: false }));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadCard();
    return () => {
      cancelled = true;
    };
  }, [slug]);
  const handleDownload = async () => {
    try {
      await downloadBusinessCardImage(cardState.form, cardState.themeKey, cardState.orientation, cardState.cardSlug);
      setToast("ì´ë¯¸ì§ë¥¼ ì ì¥íìµëë¤.");
    } catch (error) {
      setToast("ì´ë¯¸ì§ ì ì¥ì ì¤í¨íìµëë¤.");
    }
  };
  const handleShare = async () => {
    try {
      setSharing(true);
      const result = await shareBusinessCardImage(cardState.form, cardState.themeKey, cardState.orientation, cardState.cardSlug);
      if (result === "shared") setToast("ì¹´í¡ ì ì¡ ì°½ì ì´ììµëë¤.");
      else if (result === "copied") setToast("ëªí¨ ì ë³´ë¥¼ ë³µì¬íìµëë¤.");
      else
        setToast("ì´ ê¸°ê¸°ììë ê³µì ë¥¼ ì§ìíì§ ììµëë¤.");
    } catch (error) {
      setToast("ì¹´í¡ ì ì¡ì ì¤í¨íìµëë¤.");
    } finally {
      setSharing(false);
    }
  };
  const handleDelete = async () => {
    if (!isOwner) return;
    const confirmed = window.confirm("ì ì¥ë ëªí¨ì ì­ì íìê² ìµëê¹?");
    if (!confirmed) return;
    try {
      setDeleting(true);
      await storageAdapter.deleteCard(viewerMemberId);
      window.dispatchEvent(new CustomEvent("su:ssot:changed", { detail: { type: "card", operation: "delete", data: { cardSlug: cardState.cardSlug } } }));
      navigate("/my", { replace: true });
    } catch (error) {
      setToast(error?.message || "ëªí¨ ì­ì ì ì¤í¨íìµëë¤.");
    } finally {
      setDeleting(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxDEV("div", { style: { padding: "48px 18px", textAlign: "center", color: "#64748b", fontSize: 14, fontWeight: 700 }, children: "ëªí¨ì ë¶ë¬ì¤ë ì¤ìëë¤..." }, void 0, false, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 3848,
      columnNumber: 12
    }, this);
  }
  if (!cardState.exists) {
    return /* @__PURE__ */ jsxDEV("div", { style: { padding: "48px 18px", maxWidth: 720, margin: "0 auto", textAlign: "center" }, children: [
      /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 20, fontWeight: 900, color: "#0f172a" }, children: "ëªí¨ì ì°¾ì ì ììµëë¤." }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 3854,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("button", { type: "button", onClick: () => navigate("/my"), style: { marginTop: 18, minHeight: 48, padding: "0 20px", borderRadius: 16, border: "1px solid rgba(148,163,184,0.28)", background: "#ffffff", color: "#0f172a", fontSize: 15, fontWeight: 800, cursor: "pointer" }, children: "ë´ ì ë³´ë¡ ì´ë" }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 3855,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 3853,
      columnNumber: 7
    }, this);
  }
  return /* @__PURE__ */ jsxDEV("div", { style: { padding: "20px 16px 36px", maxWidth: 920, margin: "0 auto" }, children: [
    toast ? /* @__PURE__ */ jsxDEV("div", { style: { position: "fixed", top: 18, left: "50%", transform: "translateX(-50%)", zIndex: 2002, minWidth: 180, maxWidth: "calc(100vw - 36px)", padding: "12px 16px", borderRadius: 14, background: "rgba(8,15,28,0.96)", color: "#f8fafc", boxShadow: "0 20px 40px rgba(0,0,0,0.22)", border: "1px solid rgba(45,212,191,0.18)", fontSize: 13, fontWeight: 800, textAlign: "center" }, children: toast }, void 0, false, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 3863,
      columnNumber: 7
    }, this) : null,
    /* @__PURE__ */ jsxDEV("div", { style: { background: "linear-gradient(180deg, #f8fbff 0%, #eef4fa 100%)", border: "1px solid rgba(203,213,225,0.7)", borderRadius: 28, padding: 18, boxShadow: "0 22px 60px rgba(15,23,42,0.08)" }, children: [
      /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 24, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }, children: "ì ì¥ë ëªí¨" }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 3867,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("button", { type: "button", onClick: () => navigate("/my"), style: { minHeight: 42, padding: "0 16px", borderRadius: 14, border: "1px solid rgba(148,163,184,0.28)", background: "rgba(255,255,255,0.9)", color: "#334155", fontSize: 14, fontWeight: 800, cursor: "pointer" }, children: "ë´ ì ë³´ë¡ ì´ë" }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 3868,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 3866,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(BusinessCardSurface, { form: cardState.form, themeKey: cardState.themeKey, orientation: cardState.orientation }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 3870,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { style: { display: "grid", gridTemplateColumns: isOwner ? "repeat(4, minmax(0, 1fr))" : "repeat(2, minmax(0, 1fr))", gap: 10, marginTop: 16 }, children: [
        isOwner ? /* @__PURE__ */ jsxDEV("button", { type: "button", onClick: () => {
          try {
            sessionStorage.setItem("su:open-card-editor", "1");
          } catch (error) {
          }
          navigate("/my");
        }, style: { minHeight: 50, borderRadius: 16, border: "none", background: "linear-gradient(90deg,#0f766e,#14b8a6)", color: "#effffb", fontSize: 15, fontWeight: 900, cursor: "pointer" }, children: "ìì " }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 3872,
          columnNumber: 22
        }, this) : null,
        isOwner ? /* @__PURE__ */ jsxDEV("button", { type: "button", onClick: handleDelete, disabled: deleting, style: { minHeight: 50, borderRadius: 16, border: "1px solid rgba(239,68,68,0.18)", background: "rgba(255,255,255,0.92)", color: "#dc2626", fontSize: 15, fontWeight: 900, cursor: deleting ? "default" : "pointer", opacity: deleting ? 0.55 : 1 }, children: "ì­ì " }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 3878,
          columnNumber: 22
        }, this) : null,
        /* @__PURE__ */ jsxDEV("button", { type: "button", onClick: handleDownload, style: { minHeight: 50, borderRadius: 16, border: "1px solid rgba(15,118,110,0.18)", background: "rgba(255,255,255,0.92)", color: "#0f766e", fontSize: 15, fontWeight: 900, cursor: "pointer" }, children: "ì´ë¯¸ì§ ì ì¥" }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 3879,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("button", { type: "button", onClick: handleShare, disabled: sharing, style: { minHeight: 50, borderRadius: 16, border: "1px solid rgba(15,23,42,0.08)", background: "rgba(255,255,255,0.92)", color: "#0f172a", fontSize: 15, fontWeight: 900, cursor: sharing ? "default" : "pointer", opacity: sharing ? 0.55 : 1 }, children: "ì¹´í¡ ì ì¡" }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 3880,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 3871,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 3865,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
    lineNumber: 3861,
    columnNumber: 5
  }, this);
}
_s9(SimpleSavedCardPage, "wEDPa0ZnyxTrzZuKCzsNLG+Gjo0=", false, function() {
  return [useParams, useNavigate];
});
_c43 = SimpleSavedCardPage;
function PointWalletBridge() {
  _s0();
  const location = useLocation();
  const hiddenPanelRef = useRef(null);
  const hiddenFriendPanelRef = useRef(null);
  const mountObserverRef = useRef(null);
  const mountFrameRef = useRef(0);
  const mountRetryTimerRef = useRef(0);
  const [mountNode, setMountNode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [pointBalance, setPointBalance] = useState(0);
  const [pointHistory, setPointHistory] = useState([]);
  const [members, setMembers] = useState([]);
  const [shops, setShops] = useState([]);
  const [actionMode, setActionMode] = useState("");
  const [actionStep, setActionStep] = useState("target");
  const [targetQuery, setTargetQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedShop, setSelectedShop] = useState(null);
  const [amountInput, setAmountInput] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [pointHistoryExpanded, setPointHistoryExpanded] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);
  const formatPointAmount = (value) => `${(Number(value) || 0).toLocaleString("ko-KR")} P`;
  const fetchJson = async (path, options = {}) => {
    const response = await fetch(`${VIP_API_BASE}${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers || {}
      },
      ...options
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data?.error || data?.message || response.statusText || "ìì²­ ì¤í¨");
      error.status = response.status;
      throw error;
    }
    return data;
  };
  const getCurrentMemberInfo = () => {
    const session = getSession();
    const currentUser = getCurrentUser();
    return {
      memberId: String(session?.memberId || currentUser?.memberId || currentUser?.id || "").trim(),
      memberName: String(currentUser?.name || session?.name || "").trim()
    };
  };
  const normalizePointHistoryEntry = (entry, index) => {
    const amount = Number(entry?.amount || 0);
    const type = String(entry?.type || "").toUpperCase();
    return {
      id: entry?.id || entry?.ledger_id || entry?.ledgerId || `point-${index}`,
      amount,
      amountAbs: Math.abs(amount),
      createdAt: entry?.createdAt || entry?.created_at || (/* @__PURE__ */ new Date()).toISOString(),
      type,
      status: String(entry?.status || "active"),
      description: String(entry?.description || "").trim(),
      label: type === "PAYMENT" ? "ìì  ê²°ì " : type === "TRANSFER_OUT" ? "í¬ì¸í¸ ì ì¡" : type === "TRANSFER_IN" ? "í¬ì¸í¸ ìì " : type === "ADMIN" ? "ê´ë¦¬ì ì§ê¸" : type === "ADMIN_DEDUCT" ? "ê´ë¦¬ì ì°¨ê°" : type === "PARTICIPATION" ? "í¬ì¸í¸ ì ë¦½" : amount >= 0 ? "í¬ì¸í¸ ì ë¦½" : "í¬ì¸í¸ ì¬ì©"
    };
  };
  const closeAction = () => {
    setActionMode("");
    setActionStep("target");
    setTargetQuery("");
    setSelectedMember(null);
    setSelectedShop(null);
    setAmountInput("");
  };
  const selectedTarget = actionMode === "transfer" ? selectedMember : selectedShop;
  const selectedTargetName = actionMode === "transfer" ? String(selectedMember?.name || selectedMember?.memberId || selectedMember?.id || "").trim() : String(selectedShop?.name || selectedShop?.id || selectedShop?.shopId || "").trim();
  const amountValue = Number(String(amountInput || "").replace(/[^\d]/g, "")) || 0;
  const loadPointData = async () => {
    const { memberId } = getCurrentMemberInfo();
    if (!memberId) {
      setPointBalance(0);
      setPointHistory([]);
      return;
    }
    try {
      setLoading(true);
      const [balanceRes, historyRes] = await Promise.all(
        [
          fetchJson(`/api/points/${encodeURIComponent(memberId)}/balance`),
          fetchJson(`/api/points/${encodeURIComponent(memberId)}/history?limit=24`)
        ]
      );
      const historyRows = Array.isArray(historyRes?.transactions) ? historyRes.transactions : Array.isArray(historyRes) ? historyRes : [];
      setPointBalance(Number(balanceRes?.balance || 0));
      setPointHistory(historyRows.map(normalizePointHistoryEntry).sort((left, right) => {
        const rightTime = parseKSTDateValue(right.createdAt)?.getTime() || 0;
        const leftTime = parseKSTDateValue(left.createdAt)?.getTime() || 0;
        return rightTime - leftTime;
      }));
    } catch (error) {
      setPointBalance(0);
      setPointHistory([]);
      setToast(error?.message || "í¬ì¸í¸ ì ë³´ë¥¼ ë¶ë¬ì¤ì§ ëª»íìµëë¤.");
    } finally {
      setLoading(false);
    }
  };
  useLayoutEffect(() => {
    if (location.pathname !== "/my") {
      if (hiddenPanelRef.current) hiddenPanelRef.current.style.display = "";
      if (hiddenFriendPanelRef.current) hiddenFriendPanelRef.current.style.display = "";
      if (mountObserverRef.current) {
        mountObserverRef.current.disconnect();
        mountObserverRef.current = null;
      }
      if (mountFrameRef.current) {
        window.cancelAnimationFrame(mountFrameRef.current);
        mountFrameRef.current = 0;
      }
      if (mountRetryTimerRef.current) {
        window.clearTimeout(mountRetryTimerRef.current);
        mountRetryTimerRef.current = 0;
      }
      setMountNode(null);
      return void 0;
    }
    let retryCount = 0;
    const ensureMountNode = () => {
      const panels = Array.from(document.querySelectorAll("section.su-panel"));
      const targetPanel = document.querySelector('section.su-panel[data-point-wallet-anchor="true"]') || panels.find((panel) => String(panel.textContent || "").includes("ð° í¬ì¸í¸ ê´ë¦¬"));
      const friendPanel = panels.find((panel) => {
        const text = String(panel.textContent || "");
        return text.includes("ð¥ ì¹êµ¬") || text.includes("íì ì¹êµ¬ ì¶ê°") || text.includes("ì¹êµ¬ ëª©ë¡");
      });
      if (hiddenFriendPanelRef.current && hiddenFriendPanelRef.current !== friendPanel) {
        hiddenFriendPanelRef.current.style.display = "";
      }
      if (friendPanel) {
        hiddenFriendPanelRef.current = friendPanel;
        friendPanel.setAttribute("data-my-friend-panel-hidden", "true");
        friendPanel.style.display = "none";
      }
      if (!targetPanel) {
        setMountNode((prev) => prev ? null : prev);
        if (retryCount < 12) {
          retryCount += 1;
          mountRetryTimerRef.current = window.setTimeout(() => {
            mountRetryTimerRef.current = 0;
            ensureMountNode();
          }, 80);
        }
        return;
      }
      retryCount = 0;
      if (hiddenPanelRef.current && hiddenPanelRef.current !== targetPanel) {
        hiddenPanelRef.current.style.display = "";
      }
      hiddenPanelRef.current = targetPanel;
      targetPanel.setAttribute("data-point-wallet-original", "true");
      targetPanel.style.display = "none";
      let host = targetPanel.parentElement?.querySelector('[data-point-wallet-bridge-root="true"]');
      if (!host) {
        host = document.createElement("div");
        host.setAttribute("data-point-wallet-bridge-root", "true");
        targetPanel.insertAdjacentElement("afterend", host);
      }
      setMountNode((prev) => prev === host ? prev : host);
    };
    ensureMountNode();
    const observerRoot = document.querySelector(".su-appBody") || document.body;
    const observer = new MutationObserver(() => {
      if (mountFrameRef.current) return;
      mountFrameRef.current = window.requestAnimationFrame(() => {
        mountFrameRef.current = 0;
        ensureMountNode();
      });
    });
    observer.observe(observerRoot, { childList: true, subtree: true, characterData: true });
    mountObserverRef.current = observer;
    return () => {
      observer.disconnect();
      mountObserverRef.current = null;
      if (mountFrameRef.current) {
        window.cancelAnimationFrame(mountFrameRef.current);
        mountFrameRef.current = 0;
      }
      if (mountRetryTimerRef.current) {
        window.clearTimeout(mountRetryTimerRef.current);
        mountRetryTimerRef.current = 0;
      }
      if (hiddenPanelRef.current) hiddenPanelRef.current.style.display = "";
      if (hiddenFriendPanelRef.current) hiddenFriendPanelRef.current.style.display = "";
    };
  }, [location.pathname]);
  useEffect(() => {
    if (!toast) return void 0;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (location.pathname !== "/my") return;
    loadPointData();
  }, [location.pathname, reloadTick]);
  useEffect(() => {
    const reload = () => setReloadTick((prev) => prev + 1);
    window.addEventListener("POINTS_UPDATED", reload);
    window.addEventListener("su:ssot:changed", reload);
    window.addEventListener("storage", reload);
    window.addEventListener("su:auth:changed", reload);
    return () => {
      window.removeEventListener("POINTS_UPDATED", reload);
      window.removeEventListener("su:ssot:changed", reload);
      window.removeEventListener("storage", reload);
      window.removeEventListener("su:auth:changed", reload);
    };
  }, []);
  const earnedTotal = pointHistory.filter((entry) => entry.amount > 0).reduce((sum, entry) => sum + entry.amount, 0);
  const spentTotal = Math.abs(pointHistory.filter((entry) => entry.amount < 0).reduce((sum, entry) => sum + entry.amount, 0));
  const recentHistory = pointHistory.slice(0, 6);
  const visiblePointHistory = pointHistoryExpanded ? pointHistory : recentHistory;
  const filteredMembers = targetQuery.trim() ? members.filter((member) => {
    const { memberId } = getCurrentMemberInfo();
    const candidateId = String(member?.memberId || member?.id || "").trim();
    if (!candidateId || candidateId === memberId) return false;
    const query = targetQuery.trim().toLowerCase();
    return candidateId.toLowerCase().includes(query) || String(member?.name || "").toLowerCase().includes(query) || String(member?.phone || member?.phoneNumber || "").toLowerCase().includes(query);
  }).slice(0, 8) : [];
  const filteredShops = targetQuery.trim() ? shops.filter((shop) => {
    const status = String(shop?.status || "").trim().toLowerCase();
    if (status === "pending" || status === "rejected") return false;
    const query = targetQuery.trim().toLowerCase();
    return String(shop?.id || shop?.shopId || "").toLowerCase().includes(query) || String(shop?.name || "").toLowerCase().includes(query) || String(shop?.address || shop?.description || "").toLowerCase().includes(query);
  }).slice(0, 8) : [];
  const openAction = async (mode) => {
    setActionMode(mode);
    setActionStep("target");
    setTargetQuery("");
    setSelectedMember(null);
    setSelectedShop(null);
    setAmountInput("");
    try {
      setActionLoading(true);
      if (mode === "transfer" && members.length === 0) {
        const data = await fetchJson("/api/members");
        setMembers(Array.isArray(data) ? data : Array.isArray(data?.members) ? data.members : []);
      }
      if (mode === "shop" && shops.length === 0) {
        const data = await fetchJson("/api/shops");
        setShops(Array.isArray(data) ? data : Array.isArray(data?.shops) ? data.shops : []);
      }
    } catch (error) {
      setToast(mode === "transfer" ? "íì ëª©ë¡ì ë¶ë¬ì¤ì§ ëª»íìµëë¤." : "ìì  ëª©ë¡ì ë¶ë¬ì¤ì§ ëª»íìµëë¤.");
    } finally {
      setActionLoading(false);
    }
  };
  const submitShopPayment = async () => {
    const { memberId } = getCurrentMemberInfo();
    const selectedShopId = String(selectedShop?.id || selectedShop?.shopId || "").trim();
    if (!memberId || !selectedShopId || amountValue <= 0) return;
    if (amountValue > pointBalance) {
      setToast("ë³´ì  í¬ì¸í¸ë¥¼ ì´ê³¼íìµëë¤.");
      return;
    }
    const confirmText = `${selectedTargetName || "ì íí ìì "}ì ${formatPointAmount(amountValue)} ê²°ì íìê² ìµëê¹?`;
    if (!window.confirm(confirmText)) return;
    try {
      setActionSubmitting(true);
      const qrData = await storageAdapter.issueShopQrPayload(selectedShopId);
      const qrPayload = String(qrData?.qrPayload || "").trim();
      if (!qrPayload) throw new Error("QR ì ë³´ê° ììµëë¤.");
      const paymentResult = await storageAdapter.payWithQrPayload(qrPayload, Math.trunc(amountValue), String(memberId));
      if (!(paymentResult?.ok === true || paymentResult?.success === true)) {
        throw new Error(paymentResult?.error || paymentResult?.message || "ìì  ê²°ì ì ì¤í¨íìµëë¤.");
      }
      window.dispatchEvent(new CustomEvent("POINTS_UPDATED", { detail: { memberId } }));
      window.dispatchEvent(new CustomEvent("su:ssot:changed", { detail: { type: "points", operation: "shop-payment" } }));
      await loadPointData();
      setToast("ìì  ê²°ì ê° ìë£ëììµëë¤.");
      closeAction();
    } catch (error) {
      setToast(error?.message || "ìì  ê²°ì  ì¤ ì¤ë¥ê° ë°ìíìµëë¤.");
      closeAction();
    } finally {
      setActionSubmitting(false);
    }
  };
  const submitPointTransferFallback = async ({ fromMemberId, toMemberId, toMemberName, amount }) => {
    const sessionToken = String(window.__SU_SESSION__?.token || "").trim();
    if (!sessionToken) {
      const error = new Error("í¬ì¸í¸ ì ì¡ APIê° ì°ê²°ëì§ ìììµëë¤.");
      error.status = 404;
      throw error;
    }
    await fetchJson("/api/points/admin/grant", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionToken}`
      },
      body: JSON.stringify({
        memberId: fromMemberId,
        amount: -Math.trunc(amount),
        type: "TRANSFER_OUT",
        description: `í¬ì¸í¸ ì ì¡ (â ${toMemberName})`,
        referenceType: "POINT_TRANSFER",
        referenceId: `PTX-${Date.now()}`
      })
    });
    await fetchJson("/api/points/admin/grant", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionToken}`
      },
      body: JSON.stringify({
        memberId: toMemberId,
        amount: Math.trunc(amount),
        type: "TRANSFER_IN",
        description: `í¬ì¸í¸ ìì  (â ${getCurrentMemberInfo().memberName || fromMemberId})`,
        referenceType: "POINT_TRANSFER",
        referenceId: `PTX-${Date.now()}-IN`
      })
    });
  };
  const submitPointTransfer = async () => {
    const { memberId, memberName } = getCurrentMemberInfo();
    const receiverId = String(selectedMember?.memberId || selectedMember?.id || "").trim();
    if (!memberId || !receiverId || amountValue <= 0) return;
    if (amountValue > pointBalance) {
      setToast("ë³´ì  í¬ì¸í¸ë¥¼ ì´ê³¼íìµëë¤.");
      return;
    }
    const confirmText = `${selectedTargetName || "ì íí íì"}ìê² ${formatPointAmount(amountValue)} ë³´ë´ìê² ìµëê¹?`;
    if (!window.confirm(confirmText)) return;
    try {
      setActionSubmitting(true);
      try {
        await fetchJson("/api/points/transfer", {
          method: "POST",
          body: JSON.stringify({
            fromMemberId: memberId,
            fromMemberName: memberName,
            toMemberId: receiverId,
            toMemberName: selectedTargetName,
            amount: Math.trunc(amountValue),
            description: `í¬ì¸í¸ ì ì¡ (â ${selectedTargetName})`
          })
        });
      } catch (error) {
        const isMissingTransferRoute = error?.status === 404 || /Cannot POST\s+\/api\/points\/transfer/i.test(String(error?.message || ""));
        if (!isMissingTransferRoute) throw error;
        await submitPointTransferFallback({
          fromMemberId: memberId,
          toMemberId: receiverId,
          toMemberName: selectedTargetName,
          amount: amountValue
        });
      }
      window.dispatchEvent(new CustomEvent("POINTS_UPDATED", { detail: { memberId } }));
      window.dispatchEvent(new CustomEvent("su:ssot:changed", { detail: { type: "points", operation: "member-transfer" } }));
      await loadPointData();
      setToast("í¬ì¸í¸ ì ì¡ì´ ìë£ëììµëë¤.");
      closeAction();
    } catch (error) {
      if (error?.status === 403) {
        setToast("í¬ì¸í¸ ì ì¡ ê¶íì´ ìì´ ì¤íëì§ ìììµëë¤.");
      } else if (error?.status === 404 || /Cannot POST\s+\/api\/points\/transfer/i.test(String(error?.message || ""))) {
        setToast("í¬ì¸í¸ ì ì¡ APIê° ìì§ ì°ê²°ëì§ ìììµëë¤.");
      } else {
        setToast(error?.message || "í¬ì¸í¸ ì ì¡ ì¤ ì¤ë¥ê° ë°ìíìµëë¤.");
      }
      closeAction();
    } finally {
      setActionSubmitting(false);
    }
  };
  if (location.pathname !== "/my" || !mountNode) return null;
  return createPortal(
    /* @__PURE__ */ jsxDEV(Fragment, { children: [
      /* @__PURE__ */ jsxDEV("style", { children: `
        section.su-panel[data-point-wallet-original="true"] {
          display: none !important;
        }
      ` }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 4314,
        columnNumber: 7
      }, this),
      toast ? /* @__PURE__ */ jsxDEV("div", { style: { position: "fixed", bottom: 88, left: "50%", transform: "translateX(-50%)", zIndex: 1200, padding: "12px 16px", borderRadius: 14, background: "rgba(8,15,28,0.96)", border: "1px solid rgba(15,118,110,0.24)", color: "#f8fafc", boxShadow: "0 18px 40px rgba(0,0,0,0.28)", fontSize: 13, fontWeight: 700 }, children: toast }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 4320,
        columnNumber: 7
      }, this) : null,
      /* @__PURE__ */ jsxDEV("section", { className: "su-panel", style: { position: "relative", overflow: "hidden", background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(247,250,252,0.98))", border: "1px solid rgba(226,232,240,0.95)", borderRadius: 22, boxShadow: "0 16px 40px rgba(15,23,42,0.08)", color: "#0f172a" }, children: [
        /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }, children: [
          /* @__PURE__ */ jsxDEV("div", { className: "su-sectionTitle", style: { color: "#0f172a" }, children: "ð° í¬ì¸í¸ ê´ë¦¬" }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 4324,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 12, fontWeight: 800, color: "#0f766e", letterSpacing: "0.04em" }, children: "POINT WALLET" }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 4325,
            columnNumber: 11
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 4323,
          columnNumber: 9
        }, this),
        loading ? /* @__PURE__ */ jsxDEV("div", { style: { textAlign: "center", padding: "28px 0", color: "#64748b" }, children: "í¬ì¸í¸ë¥¼ ë¶ë¬ì¤ë ì¤ìëë¤..." }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 4329,
          columnNumber: 9
        }, this) : /* @__PURE__ */ jsxDEV(Fragment, { children: [
          /* @__PURE__ */ jsxDEV("div", { style: { borderRadius: 20, padding: "18px 16px", background: "linear-gradient(135deg, rgba(240,253,250,1), rgba(236,253,245,1))", border: "1px solid rgba(167,243,208,0.9)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)", marginBottom: 14 }, children: [
            /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 8 }, children: "ì¬ì©ê°ë¥ í¬ì¸í¸" }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 4333,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 32, fontWeight: 900, letterSpacing: "-0.04em", color: "#0f766e" }, children: formatPointAmount(pointBalance) }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 4334,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }, children: [
              /* @__PURE__ */ jsxDEV("div", { style: { borderRadius: 14, padding: "10px 12px", background: "rgba(255,255,255,0.72)", border: "1px solid rgba(203,213,225,0.8)" }, children: [
                /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 11, color: "#64748b", fontWeight: 700 }, children: "ì ë¦½" }, void 0, false, {
                  fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                  lineNumber: 4337,
                  columnNumber: 19
                }, this),
                /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 4, color: "#10b981", fontWeight: 900 }, children: formatPointAmount(earnedTotal) }, void 0, false, {
                  fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                  lineNumber: 4338,
                  columnNumber: 19
                }, this)
              ] }, void 0, true, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 4336,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("div", { style: { borderRadius: 14, padding: "10px 12px", background: "rgba(255,255,255,0.72)", border: "1px solid rgba(203,213,225,0.8)" }, children: [
                /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 11, color: "#64748b", fontWeight: 700 }, children: "ì¬ì©" }, void 0, false, {
                  fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                  lineNumber: 4341,
                  columnNumber: 19
                }, this),
                /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 4, color: "#ef4444", fontWeight: 900 }, children: formatPointAmount(spentTotal) }, void 0, false, {
                  fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                  lineNumber: 4342,
                  columnNumber: 19
                }, this)
              ] }, void 0, true, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 4340,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 4335,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 4332,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { style: { display: "grid", gridTemplateColumns: window.innerWidth < 768 ? "1fr" : "1fr 1fr", gap: 10, marginBottom: 10 }, children: [
            /* @__PURE__ */ jsxDEV("button", { type: "button", onClick: () => openAction("transfer"), style: { minHeight: 54, border: "1px solid rgba(45,212,191,0.28)", borderRadius: 16, background: "linear-gradient(90deg,#0f766e,#14b8a6)", color: "#effffb", fontWeight: 900, fontSize: 16, letterSpacing: "-0.02em", cursor: "pointer", boxShadow: "0 14px 28px rgba(20,184,166,0.16)" }, children: "í¬ì¸í¸ ë³´ë´ê¸°" }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 4348,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("button", { type: "button", onClick: () => openAction("shop"), style: { minHeight: 54, border: "1px solid rgba(14,116,144,0.22)", borderRadius: 16, background: "linear-gradient(90deg,#0f766e,#115e59)", color: "#effffb", fontWeight: 900, fontSize: 16, letterSpacing: "-0.02em", cursor: "pointer", boxShadow: "0 14px 28px rgba(15,118,110,0.14)" }, children: "ìì  ê²°ì " }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 4349,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 4347,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("button", { type: "button", disabled: true, style: { width: "100%", minHeight: 42, borderRadius: 14, border: "1px solid rgba(203,213,225,0.9)", background: "rgba(241,245,249,0.9)", color: "#94a3b8", fontWeight: 800, fontSize: 13, cursor: "not-allowed", opacity: 0.9, marginBottom: 16 }, children: "QR ê²°ì  (ì¤ë¹ì¤)" }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 4351,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 8 }, children: "ìµê·¼ ë´ì­" }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 4353,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { style: { display: "grid", gap: 8 }, children: [
            recentHistory.length === 0 ? /* @__PURE__ */ jsxDEV("div", { style: { borderRadius: 16, border: "1px solid rgba(226,232,240,0.95)", background: "rgba(248,250,252,0.92)", padding: "16px 14px", textAlign: "center", color: "#64748b" }, children: "í¬ì¸í¸ ë´ì­ì´ ììµëë¤." }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 4355,
              columnNumber: 45
            }, this) : null,
            visiblePointHistory.map(
              (entry) => /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, borderRadius: 16, border: "1px solid rgba(226,232,240,0.95)", background: "rgba(255,255,255,0.92)", padding: "12px 14px" }, children: [
                /* @__PURE__ */ jsxDEV("div", { style: { minWidth: 0, flex: 1 }, children: [
                  /* @__PURE__ */ jsxDEV("div", { style: { display: "inline-flex", alignItems: "center", borderRadius: 999, padding: "3px 8px", background: entry.amount >= 0 ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.10)", color: entry.amount >= 0 ? "#059669" : "#dc2626", fontSize: 11, fontWeight: 800 }, children: entry.label }, void 0, false, {
                    fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                    lineNumber: 4359,
                    columnNumber: 21
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 6, fontSize: 14, fontWeight: 800, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: entry.description || entry.label }, void 0, false, {
                    fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                    lineNumber: 4360,
                    columnNumber: 21
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 3, fontSize: 11, color: "#94a3b8" }, children: formatKSTDateTime(entry.createdAt) }, void 0, false, {
                    fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                    lineNumber: 4361,
                    columnNumber: 21
                  }, this)
                ] }, void 0, true, {
                  fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                  lineNumber: 4358,
                  columnNumber: 19
                }, this),
                /* @__PURE__ */ jsxDEV("div", { style: { textAlign: "right", flexShrink: 0 }, children: /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 18, fontWeight: 900, color: entry.amount >= 0 ? "#10b981" : "#ef4444" }, children: [
                  entry.amount >= 0 ? "+" : "-",
                  formatPointAmount(entry.amountAbs)
                ] }, void 0, true, {
                  fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                  lineNumber: 4364,
                  columnNumber: 21
                }, this) }, void 0, false, {
                  fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                  lineNumber: 4363,
                  columnNumber: 19
                }, this)
              ] }, entry.id, true, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 4357,
                columnNumber: 13
              }, this)
            ),
            pointHistory.length > 6 ? /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", justifyContent: "center", marginTop: 10 }, children: /* @__PURE__ */ jsxDEV(
              "button",
              {
                type: "button",
                className: "su-chip",
                onClick: () => setPointHistoryExpanded((prev) => !prev),
                style: { minWidth: 104 },
                children: pointHistoryExpanded ? "ì ê¸°" : "ëë³´ê¸°"
              },
              void 0,
              false,
              {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 4370,
                columnNumber: 19
              },
              this
            ) }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 4369,
              columnNumber: 13
            }, this) : null
          ] }, void 0, true, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 4354,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 4331,
          columnNumber: 9
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 4322,
        columnNumber: 7
      }, this),
      actionMode ? createPortal(
        /* @__PURE__ */ jsxDEV("div", { style: { position: "fixed", inset: 0, zIndex: 1300, background: "rgba(15,23,42,0.62)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }, children: /* @__PURE__ */ jsxDEV("div", { style: { width: "min(560px, 100%)", maxHeight: "min(88vh, 760px)", overflowY: "auto", borderRadius: 24, background: "linear-gradient(180deg, rgba(255,255,255,0.99), rgba(248,250,252,0.99))", border: "1px solid rgba(226,232,240,0.95)", boxShadow: "0 30px 80px rgba(15,23,42,0.22)", padding: 20, color: "#0f172a" }, children: [
          /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16 }, children: [
            /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 21, fontWeight: 900 }, children: actionMode === "transfer" ? "í¬ì¸í¸ ë³´ë´ê¸°" : "ìì  ê²°ì " }, void 0, false, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 4390,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 4, fontSize: 12, color: "#64748b" }, children: actionStep === "target" ? "ëìì ì ííì¸ì." : actionStep === "amount" ? "ê¸ì¡ì ìë ¥íì¸ì." : "ìµì¢ ë´ì©ì íì¸íì¸ì." }, void 0, false, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 4391,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 4389,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("button", { type: "button", onClick: closeAction, style: { border: "none", background: "transparent", color: "#64748b", fontSize: 24, lineHeight: 1, cursor: "pointer" }, children: "Ã" }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 4393,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 4388,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }, children: [["target", "1", "ëì ì í"], ["amount", "2", "ê¸ì¡ ìë ¥"], ["confirm", "3", "ìµì¢ íì¸"]].map(([key, stepNo, label]) => {
            const active = actionStep === key;
            return /* @__PURE__ */ jsxDEV("div", { style: { borderRadius: 14, padding: "10px 12px", background: active ? "rgba(15,118,110,0.12)" : "rgba(255,255,255,0.72)", border: `1px solid ${active ? "rgba(20,184,166,0.28)" : "rgba(226,232,240,0.95)"}` }, children: [
              /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 11, color: active ? "#0f766e" : "#94a3b8", fontWeight: 800 }, children: [
                "STEP ",
                stepNo
              ] }, void 0, true, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 4401,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 3, fontSize: 13, fontWeight: 800 }, children: label }, void 0, false, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 4402,
                columnNumber: 21
              }, this)
            ] }, key, true, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 4400,
              columnNumber: 19
            }, this);
          }) }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 4396,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { style: { borderRadius: 18, padding: "14px 16px", background: "rgba(240,253,250,0.9)", border: "1px solid rgba(167,243,208,0.9)", marginBottom: 16 }, children: [
            /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 12, color: "#64748b", fontWeight: 700 }, children: "íì¬ ìì¡" }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 4409,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 4, fontSize: 24, fontWeight: 900, color: "#0f766e" }, children: formatPointAmount(pointBalance) }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 4410,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 4408,
            columnNumber: 13
          }, this),
          actionStep === "target" ? /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV(
              "input",
              {
                value: targetQuery,
                onChange: (event) => setTargetQuery(event.target.value),
                placeholder: actionMode === "transfer" ? "íìëª ëë ID ê²ì" : "ìì ëª ëë ì£¼ì ê²ì",
                style: { width: "100%", boxSizing: "border-box", minHeight: 48, borderRadius: 14, border: "1px solid rgba(203,213,225,0.95)", background: "#ffffff", color: "#0f172a", padding: "12px 14px", fontSize: 14, outline: "none", marginBottom: 12 }
              },
              void 0,
              false,
              {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 4415,
                columnNumber: 17
              },
              this
            ),
            /* @__PURE__ */ jsxDEV("div", { style: { display: "grid", gap: 8, maxHeight: 320, overflowY: "auto" }, children: [
              actionLoading ? /* @__PURE__ */ jsxDEV("div", { style: { textAlign: "center", color: "#64748b", padding: "24px 0" }, children: "ëª©ë¡ì ë¶ë¬ì¤ë ì¤ìëë¤..." }, void 0, false, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 4422,
                columnNumber: 36
              }, this) : null,
              !actionLoading && actionMode === "transfer" ? filteredMembers.map((member) => {
                const candidateId = String(member?.memberId || member?.id || "").trim();
                const selected = String(selectedMember?.memberId || selectedMember?.id || "").trim() === candidateId;
                return /* @__PURE__ */ jsxDEV("button", { type: "button", onClick: () => setSelectedMember(member), style: { textAlign: "left", padding: "12px 14px", borderRadius: 14, border: selected ? "1px solid rgba(20,184,166,0.34)" : "1px solid rgba(226,232,240,0.95)", background: selected ? "rgba(20,184,166,0.10)" : "rgba(255,255,255,0.92)", color: "#0f172a", cursor: "pointer" }, children: [
                  /* @__PURE__ */ jsxDEV("div", { style: { fontWeight: 800 }, children: member?.name || candidateId }, void 0, false, {
                    fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                    lineNumber: 4428,
                    columnNumber: 25
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 4, fontSize: 12, color: "#64748b" }, children: [
                    candidateId,
                    member?.phone || member?.phoneNumber ? ` Â· ${member.phone || member.phoneNumber}` : ""
                  ] }, void 0, true, {
                    fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                    lineNumber: 4429,
                    columnNumber: 25
                  }, this)
                ] }, candidateId, true, {
                  fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                  lineNumber: 4427,
                  columnNumber: 21
                }, this);
              }) : null,
              !actionLoading && actionMode === "shop" ? filteredShops.map((shop) => {
                const shopId = String(shop?.id || shop?.shopId || "").trim();
                const selected = String(selectedShop?.id || selectedShop?.shopId || "").trim() === shopId;
                return /* @__PURE__ */ jsxDEV("button", { type: "button", onClick: () => setSelectedShop(shop), style: { textAlign: "left", padding: "12px 14px", borderRadius: 14, border: selected ? "1px solid rgba(15,118,110,0.34)" : "1px solid rgba(226,232,240,0.95)", background: selected ? "rgba(15,118,110,0.10)" : "rgba(255,255,255,0.92)", color: "#0f172a", cursor: "pointer" }, children: [
                  /* @__PURE__ */ jsxDEV("div", { style: { fontWeight: 800 }, children: shop?.name || shopId }, void 0, false, {
                    fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                    lineNumber: 4438,
                    columnNumber: 25
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 4, fontSize: 12, color: "#64748b" }, children: shop?.address || shop?.description || shopId }, void 0, false, {
                    fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                    lineNumber: 4439,
                    columnNumber: 25
                  }, this)
                ] }, shopId, true, {
                  fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                  lineNumber: 4437,
                  columnNumber: 21
                }, this);
              }) : null,
              !actionLoading && !selectedTarget && (actionMode === "transfer" && filteredMembers.length === 0 || actionMode === "shop" && filteredShops.length === 0) ? /* @__PURE__ */ jsxDEV("div", { style: { textAlign: "center", padding: "24px 0", color: "#94a3b8", fontSize: 13 }, children: targetQuery.trim() ? "ê²ì ê²°ê³¼ê° ììµëë¤." : "ê²ìì´ë¥¼ ìë ¥í´ ëìì ì°¾ì¼ì¸ì." }, void 0, false, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 4443,
                columnNumber: 174
              }, this) : null
            ] }, void 0, true, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 4421,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 4414,
            columnNumber: 13
          }, this) : null,
          actionStep === "amount" ? /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV("div", { style: { borderRadius: 18, padding: "16px", background: "rgba(255,255,255,0.92)", border: "1px solid rgba(226,232,240,0.95)", marginBottom: 12 }, children: [
              /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 12, color: "#64748b", fontWeight: 700 }, children: actionMode === "transfer" ? "ë°ë íì" : "ê²°ì  ìì " }, void 0, false, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 4451,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 4, fontSize: 18, fontWeight: 900 }, children: selectedTargetName || "-" }, void 0, false, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 4452,
                columnNumber: 19
              }, this)
            ] }, void 0, true, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 4450,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV(
              "input",
              {
                value: amountInput ? String(amountInput).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "",
                onChange: (event) => setAmountInput(String(event.target.value || "").replace(/[^\d]/g, "")),
                inputMode: "numeric",
                placeholder: "ë³´ë¼ í¬ì¸í¸ ëë ê²°ì  í¬ì¸í¸ ìë ¥",
                style: { width: "100%", boxSizing: "border-box", minHeight: 52, borderRadius: 14, border: "1px solid rgba(203,213,225,0.95)", background: "#ffffff", color: "#0f172a", padding: "12px 14px", fontSize: 18, fontWeight: 800, outline: "none" }
              },
              void 0,
              false,
              {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 4454,
                columnNumber: 17
              },
              this
            ),
            /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 10, fontSize: 12, color: amountValue > pointBalance ? "#dc2626" : "#64748b" }, children: amountValue > pointBalance ? "ë³´ì  í¬ì¸í¸ë¥¼ ì´ê³¼íìµëë¤." : `íì¬ ìì¡ ${formatPointAmount(pointBalance)}ìì ì°¨ê°ë©ëë¤.` }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 4461,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 4449,
            columnNumber: 13
          }, this) : null,
          actionStep === "confirm" ? /* @__PURE__ */ jsxDEV("div", { style: { display: "grid", gap: 12 }, children: [
            /* @__PURE__ */ jsxDEV("div", { style: { borderRadius: 18, padding: "16px", background: "rgba(255,255,255,0.92)", border: "1px solid rgba(226,232,240,0.95)" }, children: [
              /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 12, color: "#64748b", fontWeight: 700 }, children: "ì²ë¦¬ ë°©ì" }, void 0, false, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 4468,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 4, fontSize: 18, fontWeight: 900 }, children: actionMode === "transfer" ? "í¬ì¸í¸ ë³´ë´ê¸°" : "ìì  ê²°ì " }, void 0, false, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 4469,
                columnNumber: 19
              }, this)
            ] }, void 0, true, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 4467,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("div", { style: { borderRadius: 18, padding: "16px", background: "rgba(255,255,255,0.92)", border: "1px solid rgba(226,232,240,0.95)" }, children: [
              /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 12, color: "#64748b", fontWeight: 700 }, children: actionMode === "transfer" ? "ë°ë íì" : "ê²°ì  ìì " }, void 0, false, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 4472,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 4, fontSize: 18, fontWeight: 900 }, children: selectedTargetName || "-" }, void 0, false, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 4473,
                columnNumber: 19
              }, this)
            ] }, void 0, true, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 4471,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("div", { style: { borderRadius: 18, padding: "16px", background: "rgba(240,253,250,0.9)", border: "1px solid rgba(167,243,208,0.9)" }, children: [
              /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 12, color: "#64748b", fontWeight: 700 }, children: "ë³´ë´ë ê¸ì¡" }, void 0, false, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 4476,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 4, fontSize: 26, fontWeight: 900, color: "#0f766e" }, children: formatPointAmount(amountValue) }, void 0, false, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 4477,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 8, fontSize: 12, color: "#64748b" }, children: [
                "ì¤í í ìì ìì¡ ",
                formatPointAmount(pointBalance - amountValue)
              ] }, void 0, true, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 4478,
                columnNumber: 19
              }, this)
            ] }, void 0, true, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 4475,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 4466,
            columnNumber: 13
          }, this) : null,
          /* @__PURE__ */ jsxDEV("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 18 }, children: [
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                type: "button",
                onClick: () => {
                  if (actionStep === "confirm") setActionStep("amount");
                  else if (actionStep === "amount") setActionStep("target");
                  else
                    closeAction();
                },
                style: { minHeight: 48, borderRadius: 14, border: "1px solid rgba(203,213,225,0.95)", background: "rgba(255,255,255,0.9)", color: "#334155", fontWeight: 800, cursor: "pointer" },
                children: actionStep === "target" ? "ë«ê¸°" : "ì´ì "
              },
              void 0,
              false,
              {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 4484,
                columnNumber: 15
              },
              this
            ),
            actionStep === "target" ? /* @__PURE__ */ jsxDEV("button", { type: "button", disabled: !selectedTarget || actionLoading, onClick: () => setActionStep("amount"), style: { minHeight: 48, borderRadius: 14, border: "none", background: "linear-gradient(90deg,#0f766e,#14b8a6)", color: "#effffb", fontWeight: 900, cursor: !selectedTarget || actionLoading ? "default" : "pointer", opacity: !selectedTarget || actionLoading ? 0.45 : 1 }, children: "ë¤ì" }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 4496,
              columnNumber: 15
            }, this) : null,
            actionStep === "amount" ? /* @__PURE__ */ jsxDEV("button", { type: "button", disabled: !amountValue || amountValue > pointBalance, onClick: () => setActionStep("confirm"), style: { minHeight: 48, borderRadius: 14, border: "none", background: "linear-gradient(90deg,#0f766e,#14b8a6)", color: "#effffb", fontWeight: 900, cursor: !amountValue || amountValue > pointBalance ? "default" : "pointer", opacity: !amountValue || amountValue > pointBalance ? 0.45 : 1 }, children: "ë¤ì" }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 4499,
              columnNumber: 15
            }, this) : null,
            actionStep === "confirm" ? /* @__PURE__ */ jsxDEV("button", { type: "button", disabled: actionSubmitting, onClick: actionMode === "transfer" ? submitPointTransfer : submitShopPayment, style: { minHeight: 48, borderRadius: 14, border: "none", background: actionMode === "transfer" ? "linear-gradient(90deg,#0f766e,#14b8a6)" : "linear-gradient(90deg,#0f766e,#115e59)", color: "#effffb", fontWeight: 900, cursor: actionSubmitting ? "default" : "pointer", opacity: actionSubmitting ? 0.55 : 1 }, children: actionSubmitting ? "ì²ë¦¬ ì¤..." : actionMode === "transfer" ? "ì ì¡ ì¤í" : "ê²°ì  ì¤í" }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 4502,
              columnNumber: 15
            }, this) : null
          ] }, void 0, true, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 4483,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 4387,
          columnNumber: 11
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 4386,
          columnNumber: 9
        }, this),
        document.body
      ) : null
    ] }, void 0, true, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 4313,
      columnNumber: 5
    }, this),
    mountNode
  );
}
_s0(PointWalletBridge, "Nap/Rbf/pCqvJORdo8SB33duXZg=", false, function() {
  return [useLocation];
});
_c44 = PointWalletBridge;
function normalizeVoucherSerial(referenceId, createdAt, ledgerId) {
  const raw = String(referenceId || "").trim();
  if (raw) return raw;
  return `VIP-${buildVoucherDateKey(createdAt || /* @__PURE__ */ new Date())}-${String(ledgerId || 0).padStart(6, "0")}`;
}
function getVoucherDirection(log) {
  const source = String(log.source || "").toUpperCase();
  if (source === "VOUCHER_SHOP_TRANSFER_IN") return "ì¬ì©ìë£";
  if (source === "MEMBER_TRANSFER_IN") return "ìì";
  if (source === "MEMBER_TRANSFER_OUT") return "ìë";
  if (Number(log.amount) > 0) return "ì§ê¸";
  if (source === "SHOP_USE" || source === "VOUCHER_SHOP_TRANSFER_OUT") return "ì¬ì©";
  return "ì°¨ê°";
}
function getVoucherStatusLabel(log) {
  const source = String(log.source || "").toUpperCase();
  if (source === "VOUCHER_SHOP_TRANSFER_IN") return "ì¬ì©ìë£";
  if (source === "SHOP_USE" || source === "VOUCHER_SHOP_TRANSFER_OUT") return "ì¬ì©ìë£";
  if (source === "MEMBER_TRANSFER_OUT") return "ìëìë£";
  if (source === "MEMBER_TRANSFER_IN") return "ì¬ì©ê°ë¥";
  if (Number(log.amount) > 0) return "ì¬ì©ê°ë¥";
  return "íìë¨";
}
function getVoucherStatusStyle(statusLabel) {
  if (statusLabel === "ì¬ì©ê°ë¥") {
    return {
      color: "#b9ff66",
      background: "rgba(132, 204, 22, 0.16)",
      borderColor: "rgba(163, 230, 53, 0.42)"
    };
  }
  if (statusLabel === "ì¬ì©ìë£") {
    return {
      color: "#fca5a5",
      background: "rgba(239, 68, 68, 0.14)",
      borderColor: "rgba(248, 113, 113, 0.28)"
    };
  }
  return {
    color: "#d1d5db",
    background: "rgba(148, 163, 184, 0.12)",
    borderColor: "rgba(148, 163, 184, 0.24)"
  };
}
function normalizeVoucherLog(log) {
  const parsed = parseVoucherDescription(log.description);
  const resolvedShopName = parsed.shopName || String(log.shopName || "").trim();
  const resolvedFromMemberName = parsed.fromMemberName || "";
  return {
    ...log,
    serial: normalizeVoucherSerial(log.referenceId, log.createdAt, log.id),
    reason: parsed.reason,
    issueRegion: parsed.issueRegion,
    fromMemberId: parsed.fromMemberId,
    fromMemberName: resolvedFromMemberName,
    toMemberId: parsed.toMemberId,
    toMemberName: parsed.toMemberName,
    descShopId: parsed.shopId,
    descShopName: resolvedShopName,
    direction: getVoucherDirection(log),
    statusLabel: getVoucherStatusLabel(log),
    amountAbs: Math.abs(Number(log.amount) || 0)
  };
}
function VipAdminVouchersPage() {
  _s1();
  const navigate = useNavigate();
  const ledgerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [members, setMembers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [balanceRows, setBalanceRows] = useState([]);
  const [toast, setToast] = useState("");
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [issueMode, setIssueMode] = useState("ì§ê¸");
  const [issueForm, setIssueForm] = useState({
    memberId: "",
    memberName: "",
    amount: "",
    issueRegion: "",
    description: ""
  });
  const [memberSearch, setMemberSearch] = useState("");
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    member: "",
    direction: "",
    status: ""
  });
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    if (!toast) return void 0;
    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (!isAdminAuthenticatedLocal()) {
      navigate("/admin/login", { replace: true });
      return;
    }
    let mounted = true;
    const apiJson2 = async (path, options = {}) => {
      const token = localStorage.getItem("adminToken") || "";
      const response = await fetch(`${VIP_API_BASE}${path}`, {
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
          ...options.headers || {}
        },
        ...options
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || response.statusText || "ìì²­ ì¤í¨");
      return data;
    };
    const load = async () => {
      try {
        setLoading(true);
        const [memberData, logData, balanceData] = await Promise.all(
          [
            apiJson2("/api/members"),
            apiJson2("/api/admin/vouchers/logs?page=1&pageSize=500&sortField=created_at&sortDir=desc"),
            apiJson2("/api/admin/vouchers/balances?targetType=member&page=1&pageSize=300&excludeZero=0")
          ]
        );
        if (!mounted) return;
        setMembers(memberData?.members || []);
        setLogs((logData?.logs || []).map(normalizeVoucherLog));
        setBalanceRows(balanceData?.rows || []);
      } catch (error) {
        if (mounted) setToast(`ìíê¶ ë°ì´í°ë¥¼ ë¶ë¬ì¤ì§ ëª»íìµëë¤: ${error.message}`);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [navigate]);
  const apiJson = async (path, options = {}) => {
    const token = localStorage.getItem("adminToken") || "";
    const response = await fetch(`${VIP_API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": token,
        ...options.headers || {}
      },
      ...options
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error || response.statusText || "ìì²­ ì¤í¨");
    return data;
  };
  const reloadVoucherData = async () => {
    const [logData, balanceData] = await Promise.all(
      [
        apiJson("/api/admin/vouchers/logs?page=1&pageSize=500&sortField=created_at&sortDir=desc"),
        apiJson("/api/admin/vouchers/balances?targetType=member&page=1&pageSize=300&excludeZero=0")
      ]
    );
    setLogs((logData?.logs || []).map(normalizeVoucherLog));
    setBalanceRows(balanceData?.rows || []);
  };
  const sanitizeAmount = (value) => String(value || "").replace(/[^\d]/g, "").slice(0, 9);
  const amountValue = Number(issueForm.amount || 0);
  const selectedMember = members.find((member) => String(member.memberId || member.id) === String(issueForm.memberId || ""));
  const selectedMemberBalance = balanceRows.find((row) => String(row.id) === String(issueForm.memberId || ""));
  const filteredMembers = memberSearch.trim() ? members.filter((member) => {
    const query = memberSearch.trim().toLowerCase();
    const phone = String(member.phone || member.phoneNumber || "").replace(/-/g, "");
    return String(member.name || "").toLowerCase().includes(query) || phone.includes(query.replace(/-/g, ""));
  }).slice(0, 10) : [];
  const normalizedLogs = [...logs].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
  const summary = normalizedLogs.reduce((acc, log) => {
    if (log.amount > 0) {
      acc.totalIssued += log.amount;
      acc.totalIssuedCount += 1;
    } else {
      acc.totalDeducted += Math.abs(log.amount);
    }
    return acc;
  }, { totalIssued: 0, totalDeducted: 0, totalIssuedCount: 0 });
  const currentBalance = balanceRows.reduce((sum, row) => sum + (Number(row.total) || 0), 0);
  const memberIssueCounts = normalizedLogs.reduce((acc, log) => {
    if (log.amount > 0) acc[log.memberId] = (acc[log.memberId] || 0) + 1;
    return acc;
  }, {});
  const memberRecentChange = normalizedLogs.reduce((acc, log) => {
    if (!acc[log.memberId]) acc[log.memberId] = log.createdAt;
    return acc;
  }, {});
  const summaryCards = [
    { label: "ì´ ë°í ê¸ì¡", value: formatVoucherAmount(summary.totalIssued) },
    { label: "ì´ ì°¨ê° ê¸ì¡", value: formatVoucherAmount(summary.totalDeducted) },
    { label: "íì¬ ìì¡", value: formatVoucherAmount(currentBalance) },
    { label: "ì´ ë°í ì¥ì", value: `${summary.totalIssuedCount.toLocaleString("ko-KR")}ì¥` }
  ];
  const visibleBalanceRows = balanceRows.map((row) => ({
    ...row,
    issuedCount: memberIssueCounts[row.id] || 0,
    lastChangedAt: memberRecentChange[row.id] || null
  })).filter((row) => {
    if (!filters.member.trim()) return true;
    const query = filters.member.trim().toLowerCase();
    return String(row.name || "").toLowerCase().includes(query) || String(row.id || "").toLowerCase().includes(query);
  }).sort((left, right) => (Number(right.total) || 0) - (Number(left.total) || 0));
  const filteredLogs = normalizedLogs.filter((log) => {
    const createdAt = log.createdAt ? new Date(log.createdAt) : null;
    if (filters.from && createdAt && createdAt < /* @__PURE__ */ new Date(`${filters.from}T00:00:00`)) return false;
    if (filters.to && createdAt && createdAt > /* @__PURE__ */ new Date(`${filters.to}T23:59:59`)) return false;
    if (filters.member.trim()) {
      const query = filters.member.trim().toLowerCase();
      const targetText = `${log.memberName || ""} ${log.memberId || ""}`.toLowerCase();
      if (!targetText.includes(query)) return false;
    }
    if (filters.direction && log.direction !== filters.direction) return false;
    if (filters.status && log.statusLabel !== filters.status) return false;
    return true;
  });
  const ISSUED_SOURCES = /* @__PURE__ */ new Set(["ADMIN", "ADMIN_ISSUE", "ISSUE", "GRANT", "ADMIN_GRANT"]);
  const serialNetMap = {};
  normalizedLogs.forEach((log) => {
    const key = log.serial;
    serialNetMap[key] = (serialNetMap[key] || 0) + (Number(log.amount) || 0);
  });
  const recentVoucherCards = normalizedLogs.filter((log) => log.amount > 0 && ISSUED_SOURCES.has(String(log.source || "").toUpperCase())).slice(0, 6).map((log) => ({
    ...log,
    statusLabel: (serialNetMap[log.serial] || 0) <= 0 ? "ì¬ì©ìë£" : "ì¬ì©ê°ë¥"
  }));
  const previewSerial = buildVoucherPreviewSerial();
  const panelStyle = {
    background: "linear-gradient(180deg, rgba(17,24,39,0.94), rgba(10,15,27,0.98))",
    border: "1px solid rgba(245, 200, 87, 0.14)",
    borderRadius: 22,
    padding: isMobile ? "16px 14px" : "22px",
    boxShadow: "0 22px 60px rgba(0,0,0,0.26)",
    marginBottom: 18
  };
  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    fontSize: 14,
    outline: "none"
  };
  const labelStyle = { fontSize: 12, color: "rgba(255,255,255,0.64)", marginBottom: 6, display: "block" };
  const buttonStyle = (background, color = "#fff") => ({
    border: "none",
    borderRadius: 12,
    padding: "12px 16px",
    background,
    color,
    fontWeight: 800,
    cursor: "pointer"
  });
  const voucherCardStyle = {
    position: "relative",
    overflow: "hidden",
    borderRadius: 24,
    padding: isMobile ? "18px 16px" : "22px 20px",
    background: "linear-gradient(135deg, rgba(19,24,36,0.98) 0%, rgba(33,22,5,0.92) 50%, rgba(19,24,36,0.98) 100%)",
    border: "1px solid rgba(245, 200, 87, 0.32)",
    boxShadow: "0 18px 44px rgba(0,0,0,0.32)"
  };
  const handleIssue = async () => {
    if (!issueForm.memberId) {
      setToast("ì§ê¸í  íìì ì ííì¸ì.");
      return;
    }
    if (!amountValue || amountValue <= 0) {
      setToast("ê¸ì¡ì ìë ¥íì¸ì.");
      return;
    }
    if (amountValue > 1e8) {
      setToast("ê¸ì¡ì´ ëë¬´ í½ëë¤.");
      return;
    }
    const serial = generateVoucherSerial();
    try {
      setSubmitting(true);
      await apiJson("/api/vouchers/issue", {
        method: "POST",
        body: JSON.stringify({
          memberId: issueForm.memberId,
          typeCode: VIP_VOUCHER_TYPE,
          amount: issueMode === "ì°¨ê°" ? -Math.abs(amountValue) : Math.abs(amountValue),
          source: issueMode === "ì°¨ê°" ? "ADMIN_DEDUCT" : "ADMIN",
          referenceId: serial,
          description: buildVoucherDescription(issueForm.description, issueForm.issueRegion),
          targetType: "member"
        })
      });
      await reloadVoucherData();
      setToast(issueMode === "ì°¨ê°" ? "VIP ìíê¶ ì°¨ê° ìë£" : "VIP ìíê¶ ì§ê¸ ìë£");
      setIssueForm({ memberId: "", memberName: "", amount: "", issueRegion: "", description: "" });
      setMemberSearch("");
    } catch (error) {
      setToast(error.message || "ìíê¶ ì²ë¦¬ì ì¤í¨íìµëë¤.");
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxDEV("div", { style: { maxWidth: 1200, margin: "0 auto", padding: isMobile ? "12px 10px 88px" : "18px 18px 96px", color: "#fff" }, children: [
    toast ? /* @__PURE__ */ jsxDEV("div", { style: { position: "fixed", top: 20, right: 20, zIndex: 1e3, padding: "12px 16px", borderRadius: 12, background: "rgba(15,23,42,0.95)", border: "1px solid rgba(245,200,87,0.28)", boxShadow: "0 16px 40px rgba(0,0,0,0.25)" }, children: toast }, void 0, false, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 4862,
      columnNumber: 7
    }, this) : null,
    /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxDEV("button", { onClick: () => navigate("/admin"), style: buttonStyle("rgba(255,255,255,0.08)"), children: "â ëìê°ê¸°" }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 4868,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("h1", { style: { margin: 0, fontSize: isMobile ? 24 : 30, fontWeight: 900 }, children: "ðï¸ VIP ìíê¶ ê´ë¦¬" }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 4869,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 4867,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { style: { ...panelStyle, padding: isMobile ? "16px 14px" : "18px" }, children: /* @__PURE__ */ jsxDEV("div", { style: { display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, minmax(0, 1fr))", gap: 12 }, children: summaryCards.map(
      (card) => /* @__PURE__ */ jsxDEV("div", { style: { borderRadius: 18, padding: "16px 16px", background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))", border: "1px solid rgba(255,255,255,0.08)" }, children: [
        /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 12, color: "rgba(255,255,255,0.64)", marginBottom: 10 }, children: card.label }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 4876,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("div", { style: { fontSize: isMobile ? 18 : 22, fontWeight: 900, color: "#f8d978" }, children: card.value }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 4877,
          columnNumber: 15
        }, this)
      ] }, card.label, true, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 4875,
        columnNumber: 11
      }, this)
    ) }, void 0, false, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 4873,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 4872,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { style: { ...panelStyle, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1.05fr) minmax(320px, 0.95fr)", gap: 18 }, children: [
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }, children: [
          /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 17, fontWeight: 800 }, children: "ìíê¶ ì§ê¸ / ì°¨ê°" }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 4886,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { style: { display: "inline-flex", borderRadius: 999, padding: 4, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }, children: [
            /* @__PURE__ */ jsxDEV("button", { type: "button", onClick: () => setIssueMode("ì§ê¸"), style: { ...buttonStyle(issueMode === "ì§ê¸" ? "linear-gradient(90deg,#f0b90b,#f8d978)" : "transparent", issueMode === "ì§ê¸" ? "#111827" : "rgba(255,255,255,0.7)"), padding: "8px 14px", borderRadius: 999 }, children: "ì§ê¸" }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 4888,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("button", { type: "button", onClick: () => setIssueMode("ì°¨ê°"), style: { ...buttonStyle(issueMode === "ì°¨ê°" ? "rgba(239,68,68,0.92)" : "transparent", "#fff"), padding: "8px 14px", borderRadius: 999 }, children: "ì°¨ê°" }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 4889,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 4887,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 4885,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { style: { display: "grid", gridTemplateColumns: "1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxDEV("div", { style: { position: "relative" }, children: [
            /* @__PURE__ */ jsxDEV("label", { style: labelStyle, children: "íì ê²ì" }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 4895,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV(
              "input",
              {
                style: inputStyle,
                value: memberSearch,
                placeholder: "ì´ë¦ ëë ì íë²í¸ ê²ì",
                onChange: (event) => {
                  setMemberSearch(event.target.value);
                  setShowMemberDropdown(true);
                  if (!event.target.value.trim()) {
                    setIssueForm((prev) => ({ ...prev, memberId: "", memberName: "" }));
                  }
                },
                onFocus: () => setShowMemberDropdown(true),
                onBlur: () => window.setTimeout(() => setShowMemberDropdown(false), 150)
              },
              void 0,
              false,
              {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 4896,
                columnNumber: 15
              },
              this
            ),
            showMemberDropdown && filteredMembers.length > 0 ? /* @__PURE__ */ jsxDEV("div", { style: { position: "absolute", zIndex: 20, top: "100%", left: 0, right: 0, marginTop: 6, borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", background: "#111827", boxShadow: "0 18px 40px rgba(0,0,0,0.35)" }, children: filteredMembers.map((member) => {
              const memberId = String(member.memberId || member.id);
              return /* @__PURE__ */ jsxDEV(
                "button",
                {
                  type: "button",
                  onMouseDown: () => {
                    setIssueForm((prev) => ({ ...prev, memberId, memberName: member.name || memberId }));
                    setMemberSearch(member.name ? `${member.name}${member.phone || member.phoneNumber ? ` (${member.phone || member.phoneNumber})` : ""}` : memberId);
                    setShowMemberDropdown(false);
                  },
                  style: { width: "100%", textAlign: "left", padding: "12px 14px", border: "none", background: "transparent", color: "#fff", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.06)" },
                  children: [
                    /* @__PURE__ */ jsxDEV("div", { style: { fontWeight: 700 }, children: member.name || memberId }, void 0, false, {
                      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                      lineNumber: 4925,
                      columnNumber: 25
                    }, this),
                    /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 12, color: "rgba(255,255,255,0.55)" }, children: member.phone || member.phoneNumber || memberId }, void 0, false, {
                      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                      lineNumber: 4926,
                      columnNumber: 25
                    }, this)
                  ]
                },
                memberId,
                true,
                {
                  fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                  lineNumber: 4915,
                  columnNumber: 21
                },
                this
              );
            }) }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 4911,
              columnNumber: 15
            }, this) : null
          ] }, void 0, true, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 4894,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV("label", { style: labelStyle, children: "ê¸ì¡" }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 4935,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV(
              "input",
              {
                style: inputStyle,
                inputMode: "numeric",
                placeholder: "10000",
                value: issueForm.amount ? Number(issueForm.amount).toLocaleString("ko-KR") : "",
                onChange: (event) => setIssueForm((prev) => ({ ...prev, amount: sanitizeAmount(event.target.value) }))
              },
              void 0,
              false,
              {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 4936,
                columnNumber: 15
              },
              this
            ),
            /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }, children: [1e4, 3e4, 5e4, 1e5].map(
              (value) => /* @__PURE__ */ jsxDEV("button", { type: "button", onClick: () => setIssueForm((prev) => ({ ...prev, amount: String(value) })), style: { ...buttonStyle("rgba(255,255,255,0.08)"), padding: "8px 12px", fontSize: 13 }, children: value === 1e4 ? "1ë§ì" : value === 3e4 ? "3ë§ì" : value === 5e4 ? "5ë§ì" : "10ë§ì" }, value, false, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 4945,
                columnNumber: 17
              }, this)
            ) }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 4943,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 4934,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV("label", { style: labelStyle, children: "ë°íì§ì­ (ì í)" }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 4953,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV(
              "input",
              {
                style: inputStyle,
                placeholder: "ì) ì¸ì° / ë¶ì° / ìì¸ ê°ë¨ / ì ì£¼",
                value: issueForm.issueRegion,
                onChange: (event) => setIssueForm((prev) => ({ ...prev, issueRegion: event.target.value }))
              },
              void 0,
              false,
              {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 4954,
                columnNumber: 15
              },
              this
            )
          ] }, void 0, true, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 4952,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV("label", { style: labelStyle, children: "ì¬ì " }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 4963,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV(
              "input",
              {
                style: inputStyle,
                placeholder: issueMode === "ì°¨ê°" ? "ì°¨ê° ì¬ì " : "ì§ê¸ ì¬ì ",
                value: issueForm.description,
                onChange: (event) => setIssueForm((prev) => ({ ...prev, description: event.target.value }))
              },
              void 0,
              false,
              {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 4964,
                columnNumber: 15
              },
              this
            )
          ] }, void 0, true, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 4962,
            columnNumber: 13
          }, this),
          selectedMemberBalance ? /* @__PURE__ */ jsxDEV("div", { style: { borderRadius: 14, padding: "12px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", fontSize: 13, color: "rgba(255,255,255,0.8)" }, children: [
            "íì¬ ë³´ì  ê¸ì¡ ",
            formatVoucherAmount(selectedMemberBalance.total),
            " Â· ë°í ì¥ì ",
            memberIssueCounts[selectedMemberBalance.id] || 0,
            "ì¥"
          ] }, void 0, true, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 4973,
            columnNumber: 13
          }, this) : null,
          /* @__PURE__ */ jsxDEV("button", { type: "button", disabled: submitting, onClick: handleIssue, style: { ...buttonStyle(issueMode === "ì°¨ê°" ? "rgba(239,68,68,0.92)" : "linear-gradient(90deg,#f0b90b,#f8d978)", issueMode === "ì°¨ê°" ? "#fff" : "#111827"), opacity: submitting ? 0.55 : 1 }, children: submitting ? "ì²ë¦¬ ì¤..." : issueMode === "ì°¨ê°" ? "VIP ìíê¶ ì°¨ê°íê¸°" : "VIP ìíê¶ ì§ê¸íê¸°" }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 4978,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 4893,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 4884,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 17, fontWeight: 800, marginBottom: 14 }, children: "ìíê¶ ë¯¸ë¦¬ë³´ê¸°" }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 4985,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { style: voucherCardStyle, children: [
          /* @__PURE__ */ jsxDEV("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.12), transparent 42%)", pointerEvents: "none" } }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 4987,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 18 }, children: [
            /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 14, color: "#f8d978", fontWeight: 800 }, children: "ðï¸ VIP ìíê¶" }, void 0, false, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 4990,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 6, fontSize: 13, color: "rgba(255,255,255,0.72)" }, children: "ì§ì­ê³µì ë°ì íë«í¼" }, void 0, false, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 4991,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 4989,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("div", { style: { borderRadius: 999, padding: "6px 10px", background: issueMode === "ì°¨ê°" ? "rgba(239,68,68,0.18)" : "rgba(16,185,129,0.18)", border: `1px solid ${issueMode === "ì°¨ê°" ? "rgba(239,68,68,0.35)" : "rgba(16,185,129,0.35)"}`, color: issueMode === "ì°¨ê°" ? "#fca5a5" : "#86efac", fontSize: 12, fontWeight: 800 }, children: issueMode === "ì°¨ê°" ? "íì ìì " : "ì¬ì©ê°ë¥" }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 4993,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 4988,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { style: { fontSize: isMobile ? 28 : 34, fontWeight: 900, color: "#fff4c2", letterSpacing: "-0.03em", marginBottom: 18 }, children: amountValue > 0 ? formatVoucherAmount(amountValue) : "ê¸ì¡ ìë ¥" }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 4998,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { style: { display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, fontSize: 13, color: "rgba(255,255,255,0.74)" }, children: [
            /* @__PURE__ */ jsxDEV("div", { children: [
              "ëì: ",
              selectedMember?.name || issueForm.memberName || "íì ì í"
            ] }, void 0, true, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 5003,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("div", { children: [
              "ë°íì¼: ",
              formatVoucherDate(/* @__PURE__ */ new Date())
            ] }, void 0, true, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 5004,
              columnNumber: 15
            }, this),
            issueForm.issueRegion.trim() ? /* @__PURE__ */ jsxDEV("div", { children: [
              "ë°íì§ì­: ",
              issueForm.issueRegion.trim()
            ] }, void 0, true, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 5005,
              columnNumber: 47
            }, this) : null,
            /* @__PURE__ */ jsxDEV("div", { style: { fontFamily: "Consolas, Monaco, monospace", letterSpacing: "0.05em" }, children: [
              "SERIAL: ",
              previewSerial
            ] }, void 0, true, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 5006,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 5002,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 4986,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 4984,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 4883,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { style: panelStyle, children: [
      /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 17, fontWeight: 800 }, children: "ë³´ì  íí©" }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5014,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("input", { style: { ...inputStyle, width: isMobile ? "100%" : 240 }, placeholder: "íì ê²ì", value: filters.member, onChange: (event) => setFilters((prev) => ({ ...prev, member: event.target.value })) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5015,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5013,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { style: { overflowX: "auto" }, children: /* @__PURE__ */ jsxDEV("table", { style: { width: "100%", borderCollapse: "collapse", minWidth: 720 }, children: [
        /* @__PURE__ */ jsxDEV("thead", { children: /* @__PURE__ */ jsxDEV("tr", { style: { borderBottom: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.68)", fontSize: 12 }, children: [
          /* @__PURE__ */ jsxDEV("th", { style: { textAlign: "left", padding: "12px 10px" }, children: "ì´ë¦" }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 5022,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("th", { style: { textAlign: "right", padding: "12px 10px" }, children: "ë³´ì  ê¸ì¡" }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 5023,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("th", { style: { textAlign: "right", padding: "12px 10px" }, children: "ë³´ì  ì¥ì" }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 5024,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("th", { style: { textAlign: "left", padding: "12px 10px" }, children: "ìµê·¼ ë³ëì¼" }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 5025,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("th", { style: { textAlign: "center", padding: "12px 10px" }, children: "ì´ë ¥" }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 5026,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5021,
          columnNumber: 15
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5020,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("tbody", { children: loading ? /* @__PURE__ */ jsxDEV("tr", { children: /* @__PURE__ */ jsxDEV("td", { colSpan: 5, style: { padding: 28, textAlign: "center", color: "rgba(255,255,255,0.45)" }, children: "ë¶ë¬ì¤ë ì¤..." }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5031,
          columnNumber: 19
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5031,
          columnNumber: 15
        }, this) : visibleBalanceRows.length === 0 ? /* @__PURE__ */ jsxDEV("tr", { children: /* @__PURE__ */ jsxDEV("td", { colSpan: 5, style: { padding: 28, textAlign: "center", color: "rgba(255,255,255,0.45)" }, children: "ë³´ì  íí©ì´ ììµëë¤." }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5033,
          columnNumber: 19
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5033,
          columnNumber: 15
        }, this) : visibleBalanceRows.map(
          (row) => /* @__PURE__ */ jsxDEV("tr", { style: { borderBottom: "1px solid rgba(255,255,255,0.06)" }, children: [
            /* @__PURE__ */ jsxDEV("td", { style: { padding: "14px 10px" }, children: [
              /* @__PURE__ */ jsxDEV("div", { style: { fontWeight: 700 }, children: row.name }, void 0, false, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 5037,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 12, color: "rgba(255,255,255,0.4)" }, children: row.id }, void 0, false, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 5038,
                columnNumber: 21
              }, this)
            ] }, void 0, true, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 5036,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("td", { style: { padding: "14px 10px", textAlign: "right", fontWeight: 800, color: "#f8d978" }, children: formatVoucherAmount(row.total) }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 5040,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("td", { style: { padding: "14px 10px", textAlign: "right" }, children: [
              (row.issuedCount || 0).toLocaleString("ko-KR"),
              "ì¥"
            ] }, void 0, true, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 5041,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("td", { style: { padding: "14px 10px" }, children: formatVoucherDate(row.lastChangedAt) }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 5042,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("td", { style: { padding: "14px 10px", textAlign: "center" }, children: /* @__PURE__ */ jsxDEV(
              "button",
              {
                type: "button",
                onClick: () => {
                  setFilters((prev) => ({ ...prev, member: row.name || row.id }));
                  ledgerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                },
                style: { ...buttonStyle("rgba(255,255,255,0.08)"), padding: "8px 12px", fontSize: 12 },
                children: "ì´ë ¥"
              },
              void 0,
              false,
              {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 5044,
                columnNumber: 21
              },
              this
            ) }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 5043,
              columnNumber: 19
            }, this)
          ] }, row.id, true, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 5035,
            columnNumber: 15
          }, this)
        ) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5029,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5019,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5018,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 5012,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { style: panelStyle, children: [
      /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 17, fontWeight: 800 }, children: "ìµê·¼ ë°í ìíê¶" }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5064,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 12, color: "rgba(255,255,255,0.58)" }, children: "ìµê·¼ ì§ê¸ ë´ì­ ê¸°ì¤" }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5065,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5063,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { style: { display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: 14 }, children: recentVoucherCards.length === 0 ? /* @__PURE__ */ jsxDEV("div", { style: { color: "rgba(255,255,255,0.45)", padding: "12px 2px" }, children: "ë°íë VIP ìíê¶ì´ ììµëë¤." }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5069,
        columnNumber: 11
      }, this) : recentVoucherCards.map(
        (log) => /* @__PURE__ */ jsxDEV("div", { style: voucherCardStyle, children: [
          /* @__PURE__ */ jsxDEV("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.12), transparent 42%)", pointerEvents: "none" } }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 5072,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 14 }, children: [
            /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 14, color: "#f8d978", fontWeight: 800 }, children: "ðï¸ VIP ìíê¶" }, void 0, false, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 5075,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 4, fontSize: 13, color: "rgba(255,255,255,0.72)" }, children: "ì§ì­ê³µì ë°ì íë«í¼" }, void 0, false, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 5076,
                columnNumber: 19
              }, this)
            ] }, void 0, true, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 5074,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("div", { style: { borderRadius: 999, padding: "6px 10px", background: getVoucherStatusStyle(log.statusLabel).background, border: `1px solid ${getVoucherStatusStyle(log.statusLabel).borderColor}`, color: getVoucherStatusStyle(log.statusLabel).color, fontSize: 12, fontWeight: 800 }, children: log.statusLabel }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 5078,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 5073,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { style: { fontSize: isMobile ? 24 : 30, fontWeight: 900, color: "#fff4c2", marginBottom: 16 }, children: formatVoucherAmount(log.amountAbs) }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 5080,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { style: { display: "grid", gap: 6, fontSize: 13, color: "rgba(255,255,255,0.74)" }, children: [
            /* @__PURE__ */ jsxDEV("div", { style: { fontFamily: "Consolas, Monaco, monospace", letterSpacing: "0.05em" }, children: [
              "SERIAL: ",
              log.serial
            ] }, void 0, true, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 5082,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("div", { children: [
              "ë°íì¼: ",
              formatVoucherDate(log.createdAt)
            ] }, void 0, true, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 5083,
              columnNumber: 17
            }, this),
            log.issueRegion ? /* @__PURE__ */ jsxDEV("div", { children: [
              "ë°íì§ì­: ",
              log.issueRegion
            ] }, void 0, true, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 5084,
              columnNumber: 36
            }, this) : null,
            /* @__PURE__ */ jsxDEV("div", { children: [
              "ì§ê¸ ëì: ",
              log.memberName || log.memberId || "-"
            ] }, void 0, true, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 5085,
              columnNumber: 17
            }, this),
            log.statusLabel === "ì¬ì©ìë£" && (log.descShopName || log.shopName) ? /* @__PURE__ */ jsxDEV("div", { style: { color: "#fca5a5" }, children: [
              "ì¬ì©ì²: ",
              log.descShopName || log.shopName
            ] }, void 0, true, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 5087,
              columnNumber: 15
            }, this) : null
          ] }, void 0, true, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 5081,
            columnNumber: 15
          }, this)
        ] }, log.id, true, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5071,
          columnNumber: 11
        }, this)
      ) }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5067,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 5062,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { ref: ledgerRef, style: panelStyle, children: [
      /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 17, fontWeight: 800, marginBottom: 14 }, children: "ìíê¶ ìì¥" }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5096,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { style: { display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, minmax(0, 1fr))", gap: 10, marginBottom: 14 }, children: [
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("label", { style: labelStyle, children: "ììì¼" }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 5099,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("input", { type: "date", style: inputStyle, value: filters.from, onChange: (event) => setFilters((prev) => ({ ...prev, from: event.target.value })) }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 5100,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5098,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("label", { style: labelStyle, children: "ì¢ë£ì¼" }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 5103,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("input", { type: "date", style: inputStyle, value: filters.to, onChange: (event) => setFilters((prev) => ({ ...prev, to: event.target.value })) }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 5104,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5102,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("label", { style: labelStyle, children: "ë°©í¥" }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 5107,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("select", { style: inputStyle, value: filters.direction, onChange: (event) => setFilters((prev) => ({ ...prev, direction: event.target.value })), children: [
            /* @__PURE__ */ jsxDEV("option", { value: "", children: "ì ì²´" }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 5109,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("option", { value: "ì§ê¸", children: "ì§ê¸" }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 5110,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("option", { value: "ì°¨ê°", children: "ì°¨ê°" }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 5111,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("option", { value: "ì¬ì©", children: "ì¬ì©" }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 5112,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 5108,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5106,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("label", { style: labelStyle, children: "ìí" }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 5116,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("select", { style: inputStyle, value: filters.status, onChange: (event) => setFilters((prev) => ({ ...prev, status: event.target.value })), children: [
            /* @__PURE__ */ jsxDEV("option", { value: "", children: "ì ì²´" }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 5118,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("option", { value: "ì¬ì©ê°ë¥", children: "ì¬ì©ê°ë¥" }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 5119,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("option", { value: "íìë¨", children: "íìë¨" }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 5120,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("option", { value: "ì¬ì©ë¨", children: "ì¬ì©ë¨" }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 5121,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 5117,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5115,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5097,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { style: { overflowX: "auto" }, children: /* @__PURE__ */ jsxDEV("table", { style: { width: "100%", borderCollapse: "collapse", minWidth: 980 }, children: [
        /* @__PURE__ */ jsxDEV("thead", { children: /* @__PURE__ */ jsxDEV("tr", { style: { borderBottom: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.68)", fontSize: 12 }, children: [
          /* @__PURE__ */ jsxDEV("th", { style: { textAlign: "left", padding: "12px 10px" }, children: "ì¼ì" }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 5130,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("th", { style: { textAlign: "left", padding: "12px 10px" }, children: "ì¼ë ¨ë²í¸" }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 5131,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("th", { style: { textAlign: "left", padding: "12px 10px" }, children: "ëì" }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 5132,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("th", { style: { textAlign: "left", padding: "12px 10px" }, children: "ë°©í¥" }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 5133,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("th", { style: { textAlign: "right", padding: "12px 10px" }, children: "ê¸ì¡" }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 5134,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("th", { style: { textAlign: "left", padding: "12px 10px" }, children: "ìí" }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 5135,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("th", { style: { textAlign: "left", padding: "12px 10px" }, children: "ë°íì§ì­" }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 5136,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("th", { style: { textAlign: "left", padding: "12px 10px" }, children: "ì¬ì " }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 5137,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5129,
          columnNumber: 15
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5128,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("tbody", { children: filteredLogs.length === 0 ? /* @__PURE__ */ jsxDEV("tr", { children: /* @__PURE__ */ jsxDEV("td", { colSpan: 8, style: { padding: 28, textAlign: "center", color: "rgba(255,255,255,0.45)" }, children: "íìí  ìíê¶ ìì¥ì´ ììµëë¤." }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5142,
          columnNumber: 19
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5142,
          columnNumber: 15
        }, this) : filteredLogs.map(
          (log) => /* @__PURE__ */ jsxDEV("tr", { style: { borderBottom: "1px solid rgba(255,255,255,0.06)" }, children: [
            /* @__PURE__ */ jsxDEV("td", { style: { padding: "14px 10px" }, children: formatVoucherDateTime(log.createdAt) }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 5145,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("td", { style: { padding: "14px 10px", fontFamily: "Consolas, Monaco, monospace", color: "#f8d978" }, children: log.serial }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 5146,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("td", { style: { padding: "14px 10px" }, children: String(log.targetType || "") === "shop" ? log.shopName || log.descShopName || log.shopId || log.memberId || "-" : log.memberName || log.memberId || "-" }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 5147,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("td", { style: { padding: "14px 10px" }, children: log.direction }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 5152,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("td", { style: { padding: "14px 10px", textAlign: "right", fontWeight: 800, color: log.direction === "ì§ê¸" ? "#86efac" : log.direction === "ì¬ì©" ? "#fca5a5" : "#fda4af" }, children: formatVoucherAmount(log.amountAbs) }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 5153,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("td", { style: { padding: "14px 10px", color: getVoucherStatusStyle(log.statusLabel).color, fontWeight: 800 }, children: log.statusLabel }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 5154,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("td", { style: { padding: "14px 10px" }, children: log.issueRegion || "-" }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 5155,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("td", { style: { padding: "14px 10px", color: "rgba(255,255,255,0.78)" }, children: log.reason || (String(log.source || "").toUpperCase() === "VOUCHER_SHOP_TRANSFER_IN" && log.fromMemberName ? `${log.fromMemberName} ê²°ì  ìíê¶` : "-") }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 5156,
              columnNumber: 19
            }, this)
          ] }, log.id, true, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 5144,
            columnNumber: 15
          }, this)
        ) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5140,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5127,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5126,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 5095,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
    lineNumber: 4860,
    columnNumber: 5
  }, this);
}
_s1(VipAdminVouchersPage, "zcpgs5rAq6Oxpkz9PJcYHYFCZjk=", false, function() {
  return [useNavigate];
});
_c45 = VipAdminVouchersPage;
function MemberVipVoucherPanel({ walletView }) {
  _s10();
  const [mountNode, setMountNode] = useState(null);
  const [tabHost, setTabHost] = useState(null);
  const [voucherBalance, setVoucherBalance] = useState(null);
  const [voucherHistory, setVoucherHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const isVoucher = walletView === "voucher";
  const hiddenPanelRef = useRef(null);
  const pointPanelsRef = useRef([]);
  useEffect(() => {
    const ensureMountNode = () => {
      const pointPanel = document.querySelector('section.su-panel[data-point-wallet-anchor="true"]') || Array.from(document.querySelectorAll("section.su-panel")).find((panel) => String(panel.textContent || "").includes("ð° í¬ì¸í¸ ê´ë¦¬"));
      const shopPanel = document.querySelector('section.su-panel[data-shop-wallet-anchor="true"]') || Array.from(document.querySelectorAll("section.su-panel")).find((panel) => String(panel.textContent || "").includes("ðª ìì  í¬ì¸í¸"));
      const vipPanel = document.querySelector('section.su-panel[data-vip-wallet-anchor="true"]') || Array.from(document.querySelectorAll("section.su-panel")).find((panel) => String(panel.textContent || "").includes("ðï¸ VIP ìíê¶"));
      pointPanelsRef.current = pointPanel ? [pointPanel] : [];
      if (pointPanel) pointPanel.setAttribute("data-wallet-point-panel", "true");
      const firstWalletPanel = pointPanel || null;
      if (firstWalletPanel?.parentElement) {
        let nextTabHost = firstWalletPanel.parentElement.querySelector('[data-wallet-tab-host="true"]');
        if (!nextTabHost) {
          nextTabHost = document.createElement("div");
          nextTabHost.setAttribute("data-wallet-tab-host", "true");
          firstWalletPanel.insertAdjacentElement("beforebegin", nextTabHost);
        }
        setTabHost(nextTabHost);
      } else {
        setTabHost(null);
      }
      if (!vipPanel) {
        setMountNode(null);
        return;
      }
      if (hiddenPanelRef.current && hiddenPanelRef.current !== vipPanel) {
        hiddenPanelRef.current.style.display = "";
      }
      hiddenPanelRef.current = vipPanel;
      vipPanel.style.display = "none";
      vipPanel.setAttribute("data-wallet-original-voucher-panel", "true");
      let host = vipPanel.parentElement?.querySelector('[data-vip-member-voucher-root="true"]');
      if (!host) {
        host = document.createElement("div");
        host.setAttribute("data-vip-member-voucher-root", "true");
        vipPanel.insertAdjacentElement("afterend", host);
      }
      setMountNode(host);
    };
    ensureMountNode();
    const observer = new MutationObserver(() => ensureMountNode());
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      if (hiddenPanelRef.current) hiddenPanelRef.current.style.display = "";
      pointPanelsRef.current.forEach((panel) => {
        panel.style.display = "";
      });
    };
  }, []);
  useEffect(() => {
    pointPanelsRef.current.forEach((panel) => {
      panel.style.display = isVoucher ? "none" : "";
    });
    if (mountNode) {
      mountNode.style.display = isVoucher ? "" : "none";
    }
    if (tabHost) {
      tabHost.style.display = pointPanelsRef.current.length > 0 || mountNode ? "" : "none";
    }
  }, [walletView, isVoucher, mountNode, tabHost]);
  useEffect(() => {
    const session = getSession();
    const currentUser = getCurrentUser();
    const memberId = String(session?.memberId || currentUser?.memberId || currentUser?.id || "").trim();
    if (!memberId) {
      setVoucherBalance(null);
      setVoucherHistory([]);
      return;
    }
    let mounted = true;
    const loadVoucherData = async () => {
      try {
        setLoading(true);
        const [balanceRes, historyRes] = await Promise.all(
          [
            fetch(`${VIP_API_BASE}/api/vouchers/${encodeURIComponent(memberId)}/balance`).then((response) => response.json()),
            fetch(`${VIP_API_BASE}/api/vouchers/${encodeURIComponent(memberId)}/history?limit=30`).then((response) => response.json())
          ]
        );
        if (!mounted) return;
        setVoucherBalance(balanceRes?.ok ? balanceRes : null);
        setVoucherHistory((historyRes?.ok ? historyRes.history || [] : []).map(normalizeVoucherLog));
      } catch (error) {
        if (!mounted) return;
        setVoucherBalance(null);
        setVoucherHistory([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadVoucherData();
    const reload = () => loadVoucherData();
    window.addEventListener("su:ssot:changed", reload);
    window.addEventListener("storage", reload);
    return () => {
      mounted = false;
      window.removeEventListener("su:ssot:changed", reload);
      window.removeEventListener("storage", reload);
    };
  }, []);
  if (!mountNode || !isVoucher) return null;
  const activeVoucherCards = voucherHistory.filter((item) => item.amount > 0).slice(0, 6);
  const visibleHistory = voucherHistory.slice(0, 10);
  const totalAmount = Number(voucherBalance?.total || 0);
  const panelStyle = {
    background: "linear-gradient(180deg, rgba(12,18,32,0.98), rgba(14,30,42,0.98))",
    border: "1px solid rgba(117, 184, 193, 0.18)",
    borderRadius: 20,
    padding: "14px 12px",
    boxShadow: "0 22px 60px rgba(0,0,0,0.26)",
    marginBottom: 14
  };
  const voucherCardStyle = {
    position: "relative",
    overflow: "hidden",
    borderRadius: 20,
    padding: "16px 14px",
    background: "linear-gradient(135deg, rgba(15,29,45,0.98) 0%, rgba(19,44,53,0.96) 54%, rgba(16,27,42,0.98) 100%)",
    border: "1px solid rgba(245, 208, 102, 0.34)",
    boxShadow: "0 18px 44px rgba(0,0,0,0.32)"
  };
  return /* @__PURE__ */ jsxDEV(Fragment, { children: [
    /* @__PURE__ */ jsxDEV("style", { children: `
        @media (max-width: 768px) {
          [data-wallet-tab-host="true"] {
            margin: 0 0 12px;
          }
          [data-wallet-point-panel="true"] {
            background: linear-gradient(180deg, rgba(11,18,32,0.98), rgba(15,26,44,0.98)) !important;
            border: 1px solid rgba(71, 126, 148, 0.18) !important;
            box-shadow: 0 18px 38px rgba(0,0,0,0.24) !important;
            border-radius: 20px !important;
            padding: 14px 12px !important;
            color: #e2e8f0 !important;
          }
          [data-wallet-point-panel="true"] .su-sectionTitle,
          [data-wallet-point-panel="true"] div,
          [data-wallet-point-panel="true"] span,
          [data-wallet-point-panel="true"] strong,
          [data-wallet-point-panel="true"] label {
            color: inherit;
          }
          [data-wallet-point-panel="true"] .su-sectionTitle {
            color: #f8fafc !important;
            font-size: 15px !important;
          }
          [data-wallet-point-panel="true"] .su-card {
            background: rgba(255,255,255,0.045) !important;
            border: 1px solid rgba(148,163,184,0.14) !important;
            border-radius: 16px !important;
            padding: 10px 12px !important;
          }
          [data-wallet-point-panel="true"] input,
          [data-wallet-point-panel="true"] select {
            background: #162437 !important;
            color: #f8fafc !important;
            border: 1px solid rgba(125, 161, 193, 0.28) !important;
            border-radius: 10px !important;
            min-height: 38px !important;
            padding: 8px 10px !important;
          }
          [data-wallet-point-panel="true"] button {
            min-height: 34px;
          }
          [data-wallet-point-panel="true"] .su-chip {
            min-height: 34px !important;
            padding: 6px 11px !important;
            border-radius: 999px !important;
            font-size: 12px !important;
            background: rgba(255,255,255,0.07) !important;
            color: #dbe4ee !important;
            border-color: rgba(148,163,184,0.18) !important;
          }
          [data-wallet-point-panel="true"] .su-chip.is-active {
            background: linear-gradient(90deg, #0f766e, #14b8a6) !important;
            color: #effffb !important;
            border-color: rgba(45,212,191,0.35) !important;
          }
        }
      ` }, void 0, false, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 5326,
      columnNumber: 7
    }, this),
    tabHost ? createPortal(
      /* @__PURE__ */ jsxDEV("div", { style: { display: "inline-flex", width: "100%", padding: 4, borderRadius: 16, background: "linear-gradient(180deg, rgba(12,18,32,0.96), rgba(15,26,44,0.96))", border: "1px solid rgba(110,142,170,0.18)", boxShadow: "0 16px 34px rgba(0,0,0,0.22)", gap: 4, boxSizing: "border-box" }, children: [
        /* @__PURE__ */ jsxDEV("button", { type: "button", onClick: () => window.dispatchEvent(new CustomEvent("su:my:walletView", { detail: "point" })), style: { flex: 1, border: "none", borderRadius: 12, padding: "10px 12px", background: !isVoucher ? "linear-gradient(90deg,#0f766e,#14b8a6)" : "transparent", color: !isVoucher ? "#effffb" : "#cbd5e1", fontWeight: 800, fontSize: 13, cursor: "pointer" }, children: "í¬ì¸í¸" }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5386,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("button", { type: "button", onClick: () => window.dispatchEvent(new CustomEvent("su:my:walletView", { detail: "voucher" })), style: { flex: 1, border: "none", borderRadius: 12, padding: "10px 12px", background: isVoucher ? "linear-gradient(90deg,#d4a72c,#f4d77a)" : "transparent", color: isVoucher ? "#111827" : "#cbd5e1", fontWeight: 800, fontSize: 13, cursor: "pointer" }, children: "VIP ìíê¶" }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5387,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5385,
        columnNumber: 9
      }, this),
      tabHost
    ) : null,
    mountNode ? createPortal(
      /* @__PURE__ */ jsxDEV("section", { className: "su-panel", style: panelStyle, children: [
        /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 14 }, children: [
          /* @__PURE__ */ jsxDEV("div", { className: "su-sectionTitle", children: "ðï¸ VIP ìíê¶" }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 5394,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ jsxDEV("span", { style: { fontSize: 15, fontWeight: 800, color: "#f8d978" }, children: [
            "ì´ ",
            formatVoucherAmount(totalAmount)
          ] }, void 0, true, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 5395,
            columnNumber: 9
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5393,
          columnNumber: 7
        }, this),
        loading ? /* @__PURE__ */ jsxDEV("div", { style: { textAlign: "center", opacity: 0.55, padding: 16 }, children: "â³ ë¡ë© ì¤..." }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5399,
          columnNumber: 11
        }, this) : !voucherBalance || totalAmount <= 0 ? /* @__PURE__ */ jsxDEV("div", { style: { textAlign: "center", opacity: 0.65, padding: 18, fontSize: 14 }, children: "ë³´ì  ìíê¶ì´ ììµëë¤." }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5401,
          columnNumber: 11
        }, this) : /* @__PURE__ */ jsxDEV(Fragment, { children: [
          /* @__PURE__ */ jsxDEV("div", { style: { display: "grid", gap: 14, gridTemplateColumns: "1fr", marginBottom: 14 }, children: activeVoucherCards.map(
            (log) => /* @__PURE__ */ jsxDEV("div", { style: voucherCardStyle, children: [
              /* @__PURE__ */ jsxDEV("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.12), transparent 42%)", pointerEvents: "none" } }, void 0, false, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 5407,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 14 }, children: [
                /* @__PURE__ */ jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 13, color: "#f6d67a", fontWeight: 800 }, children: "ðï¸ VIP ìíê¶" }, void 0, false, {
                    fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                    lineNumber: 5410,
                    columnNumber: 21
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { style: { marginTop: 4, fontSize: 12, color: "#d8e4ef" }, children: "ì§ì­ê³µì ë°ì íë«í¼" }, void 0, false, {
                    fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                    lineNumber: 5411,
                    columnNumber: 21
                  }, this)
                ] }, void 0, true, {
                  fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                  lineNumber: 5409,
                  columnNumber: 19
                }, this),
                /* @__PURE__ */ jsxDEV("div", { style: { borderRadius: 999, padding: "5px 9px", background: getVoucherStatusStyle(log.statusLabel).background, border: `1px solid ${getVoucherStatusStyle(log.statusLabel).borderColor}`, color: getVoucherStatusStyle(log.statusLabel).color, fontSize: 11, fontWeight: 800 }, children: log.statusLabel }, void 0, false, {
                  fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                  lineNumber: 5413,
                  columnNumber: 19
                }, this)
              ] }, void 0, true, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 5408,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 28, fontWeight: 900, color: "#fff2bf", marginBottom: 14, letterSpacing: "-0.02em" }, children: formatVoucherAmount(log.amountAbs) }, void 0, false, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 5415,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("div", { style: { display: "grid", gap: 5, fontSize: 12, color: "#dbe4ee" }, children: [
                /* @__PURE__ */ jsxDEV("div", { children: [
                  "ë°íì¼: ",
                  formatVoucherDate(log.createdAt)
                ] }, void 0, true, {
                  fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                  lineNumber: 5417,
                  columnNumber: 19
                }, this),
                log.issueRegion ? /* @__PURE__ */ jsxDEV("div", { children: [
                  "ë°íì§ì­: ",
                  log.issueRegion
                ] }, void 0, true, {
                  fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                  lineNumber: 5418,
                  columnNumber: 38
                }, this) : null,
                /* @__PURE__ */ jsxDEV("div", { style: { fontFamily: "Consolas, Monaco, monospace", letterSpacing: "0.05em", color: "#b9cadb" }, children: [
                  "SERIAL: ",
                  log.serial
                ] }, void 0, true, {
                  fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                  lineNumber: 5419,
                  columnNumber: 19
                }, this)
              ] }, void 0, true, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 5416,
                columnNumber: 17
              }, this)
            ] }, log.id, true, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 5406,
              columnNumber: 15
            }, this)
          ) }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 5404,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ jsxDEV("div", { style: { fontWeight: 700, fontSize: 12, marginBottom: 8, color: "#c8d5e3" }, children: "ìµê·¼ ë´ì­" }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 5425,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ jsxDEV("div", { style: { display: "grid", gap: 8 }, children: [
            visibleHistory.map(
              (history) => /* @__PURE__ */ jsxDEV("div", { className: "su-card", style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, borderRadius: 16, background: "rgba(255,255,255,0.055)", border: "1px solid rgba(203,213,225,0.1)", padding: "10px 12px" }, children: [
                /* @__PURE__ */ jsxDEV("div", { style: { flex: 1, minWidth: 0 }, children: [
                  /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", gap: 6, alignItems: "center", marginBottom: 3 }, children: /* @__PURE__ */ jsxDEV("span", { style: { fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 999, background: "rgba(245,200,87,0.14)", color: "#f6d67a" }, children: "VIP ìíê¶" }, void 0, false, {
                    fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                    lineNumber: 5431,
                    columnNumber: 21
                  }, this) }, void 0, false, {
                    fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                    lineNumber: 5430,
                    columnNumber: 19
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 12, fontWeight: 700, color: "#f8fafc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: history.reason || (history.direction === "ì§ê¸" ? "ê´ë¦¬ì ì§ê¸" : history.direction === "ì¬ì©" ? "ìíê¶ ì¬ì©" : "ìíê¶ ì°¨ê°") }, void 0, false, {
                    fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                    lineNumber: 5433,
                    columnNumber: 19
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 10, color: "#8fa2b8", marginTop: 2 }, children: formatVoucherDate(history.createdAt) }, void 0, false, {
                    fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                    lineNumber: 5434,
                    columnNumber: 19
                  }, this)
                ] }, void 0, true, {
                  fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                  lineNumber: 5429,
                  columnNumber: 17
                }, this),
                /* @__PURE__ */ jsxDEV("div", { style: { fontWeight: 800, fontSize: 13, color: history.amount > 0 ? "#99f6e4" : "#fda4af", marginLeft: 12, whiteSpace: "nowrap" }, children: [
                  history.amount > 0 ? "+" : "-",
                  formatVoucherAmount(history.amountAbs)
                ] }, void 0, true, {
                  fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                  lineNumber: 5436,
                  columnNumber: 17
                }, this)
              ] }, history.id, true, {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 5428,
                columnNumber: 15
              }, this)
            ),
            visibleHistory.length === 0 ? /* @__PURE__ */ jsxDEV("div", { style: { textAlign: "center", opacity: 0.6, fontSize: 13 }, children: "ë´ì­ì´ ììµëë¤." }, void 0, false, {
              fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
              lineNumber: 5439,
              columnNumber: 44
            }, this) : null
          ] }, void 0, true, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 5426,
            columnNumber: 11
          }, this)
        ] }, void 0, true, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5403,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5392,
        columnNumber: 9
      }, this),
      mountNode
    ) : null
  ] }, void 0, true, {
    fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
    lineNumber: 5325,
    columnNumber: 5
  }, this);
}
_s10(MemberVipVoucherPanel, "Y19+dFUZ0oX2Ocr1z6PLyOC6dhA=");
_c46 = MemberVipVoucherPanel;
function MyPageWithVipVoucherBridge() {
  _s11();
  const [walletView, setWalletView] = useState(() => {
    try {
      const saved = window.localStorage.getItem("walletView");
      if (saved === "point" || saved === "shop" || saved === "voucher") return saved;
    } catch (error) {
    }
    return "point";
  });
  useEffect(() => {
    const handler = (e) => {
      if (e && e.detail && typeof e.detail.walletView === "string") {
        setWalletView(e.detail.walletView);
      }
    };
    const storageHandler = () => {
      try {
        const saved = window.localStorage.getItem("walletView");
        if (saved === "point" || saved === "shop" || saved === "voucher") {
          setWalletView(saved);
        }
      } catch (error) {
      }
    };
    window.addEventListener("su:walletView:changed", handler);
    window.addEventListener("storage", storageHandler);
    return () => {
      window.removeEventListener("su:walletView:changed", handler);
      window.removeEventListener("storage", storageHandler);
    };
  }, []);
  return /* @__PURE__ */ jsxDEV(Fragment, { children: [
    /* @__PURE__ */ jsxDEV(My, {}, void 0, false, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 5489,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(ShopVoucherPaymentBridge, {}, void 0, false, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 5491,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(MemberVipVoucherPanel, { walletView }, void 0, false, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 5492,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
    lineNumber: 5488,
    columnNumber: 5
  }, this);
}
_s11(MyPageWithVipVoucherBridge, "/Nz9KnNhd9wGwGQ5w0zTSKcOXAg=");
_c47 = MyPageWithVipVoucherBridge;
function GlobalChatFloatingBadge({ isLoggedIn }) {
  _s12();
  const location = useLocation();
  const navigate = useNavigate();
  const session = getSession();
  const myMemberId = String(session?.memberId || "").trim();
  const voiceEnabledRef = useRef(false);
  const [badgePos, setBadgePos] = useState(() => {
    try {
      const raw = window.localStorage.getItem("su:chat:floating:pos");
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && Number.isFinite(parsed.x) && Number.isFinite(parsed.y)) {
        return parsed;
      }
    } catch (e) {
    }
    return { x: Math.max(window.innerWidth - 82, 12), y: Math.max(window.innerHeight - 198, 90) };
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState("");
  const dragStateRef = useRef(null);
  const firstPollRef = useRef(true);
  const roomLastSeenRef = useRef({});
  const toastTimerRef = useRef(null);
  const pollTimerRef = useRef(null);
  const regionId = getCurrentRegionId();
  const onRegionChatPage = /^\/r\/[^/]+\/chat(?:\/|$)/.test(location.pathname);
  useEffect(() => {
    try {
      window.localStorage.setItem("su:chat:floating:pos", JSON.stringify(badgePos));
    } catch (e) {
    }
  }, [badgePos]);
  useEffect(() => {
    if (!toast) return void 0;
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast("");
      toastTimerRef.current = null;
    }, 2400);
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    };
  }, [toast]);
  useEffect(() => {
    if (onRegionChatPage) {
      setUnreadCount(0);
    }
  }, [onRegionChatPage]);
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => {
      });
    }
  }, []);
  useEffect(() => {
    const syncVoicePref = () => {
      try {
        voiceEnabledRef.current = window.localStorage.getItem("su:chat:notify:voice") === "1";
      } catch (e) {
        voiceEnabledRef.current = false;
      }
    };
    syncVoicePref();
    window.addEventListener("storage", syncVoicePref);
    window.addEventListener("su:chat:voice-pref:changed", syncVoicePref);
    return () => {
      window.removeEventListener("storage", syncVoicePref);
      window.removeEventListener("su:chat:voice-pref:changed", syncVoicePref);
    };
  }, []);
  useEffect(() => {
    if (!isLoggedIn || !myMemberId || !regionId) {
      if (pollTimerRef.current) {
        window.clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      return void 0;
    }
    const headers = {
      "Content-Type": "application/json",
      ...session?.token ? { Authorization: `Bearer ${session.token}` } : {}
    };
    const fetchJson = async (path) => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE || ""}${path}`, {
        credentials: "include",
        headers
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || `ìì²­ ì¤í¨ (${response.status})`);
      return data;
    };
    const playNoticeTone = () => {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "triangle";
        o.frequency.setValueAtTime(720, now);
        g.gain.setValueAtTime(1e-4, now);
        g.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
        g.gain.exponentialRampToValueAtTime(1e-4, now + 0.24);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(now);
        o.stop(now + 0.25);
        o.onended = () => {
          try {
            ctx.close();
          } catch (e) {
          }
        };
      } catch (e) {
      }
    };
    const speakGlobalNotice = () => {
      try {
        if (!voiceEnabledRef.current) return;
        if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
        const synth = window.speechSynthesis;
        if (!synth) return;
        if (synth.speaking) synth.cancel();
        const utterance = new SpeechSynthesisUtterance("ê³µì ");
        utterance.lang = "ko-KR";
        utterance.rate = 1;
        utterance.pitch = 1;
        synth.speak(utterance);
      } catch (e) {
      }
    };
    const poll = async () => {
      try {
        const list = await fetchJson(`/api/chat-rooms?regionId=${encodeURIComponent(regionId)}`);
        const rooms = Array.isArray(list?.rooms) ? list.rooms : [];
        let hasNew = false;
        let latestSender = "íì";
        let latestText = "ì ì±íì´ ëì°©íìµëë¤.";
        for (const room of rooms) {
          const roomId = String(room?.roomId || "").trim();
          if (!roomId) continue;
          const latestAt = String(room?.lastMessageAt || "").trim();
          const prevAt = String(roomLastSeenRef.current[roomId] || "").trim();
          if (firstPollRef.current) {
            roomLastSeenRef.current[roomId] = latestAt;
            continue;
          }
          if (!latestAt) continue;
          const changed = !prevAt || latestAt !== prevAt;
          roomLastSeenRef.current[roomId] = latestAt;
          if (!changed) continue;
          const messagesData = await fetchJson(`/api/chat-rooms/${encodeURIComponent(roomId)}/messages?limit=1`);
          const messages = Array.isArray(messagesData?.messages) ? messagesData.messages : [];
          const latest = messages[messages.length - 1];
          if (!latest) continue;
          if (String(latest.memberId || "") === myMemberId) continue;
          hasNew = true;
          latestSender = latest.memberName || "íì";
          latestText = String(latest.messageType || "text") === "image" ? "ì´ë¯¸ì§ë¥¼ ë³´ëìµëë¤." : String(latest.text || "ì ì±í").slice(0, 36);
        }
        firstPollRef.current = false;
        if (hasNew && !onRegionChatPage) {
          setUnreadCount((prev) => Math.min(prev + 1, 99));
          setToast(`${latestSender}: ${latestText}`);
          playNoticeTone();
          speakGlobalNotice();
          try {
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("ê³µì  ì±í ìë¦¼", { body: `${latestSender}: ${latestText}` });
            }
          } catch (e) {
          }
        }
      } catch (e) {
        firstPollRef.current = false;
      }
    };
    poll();
    pollTimerRef.current = window.setInterval(poll, 5e3);
    return () => {
      if (pollTimerRef.current) {
        window.clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [isLoggedIn, myMemberId, onRegionChatPage, regionId, session?.token]);
  if (!isLoggedIn || !myMemberId || !regionId) return null;
  const onPointerDown = (event) => {
    const startX = event.clientX;
    const startY = event.clientY;
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX,
      startY,
      originX: badgePos.x,
      originY: badgePos.y,
      moved: false
    };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch (e) {
    }
  };
  const onPointerMove = (event) => {
    const d = dragStateRef.current;
    if (!d || d.pointerId !== event.pointerId) return;
    const dx = event.clientX - d.startX;
    const dy = event.clientY - d.startY;
    const moved = Math.abs(dx) > 4 || Math.abs(dy) > 4;
    if (!moved && !d.moved) return;
    d.moved = true;
    const maxX = Math.max(window.innerWidth - 64, 10);
    const maxY = Math.max(window.innerHeight - 64, 10);
    const nextX = Math.min(Math.max(10, d.originX + dx), maxX);
    const nextY = Math.min(Math.max(80, d.originY + dy), maxY);
    setBadgePos({ x: nextX, y: nextY });
  };
  const onPointerUp = (event) => {
    const d = dragStateRef.current;
    if (!d || d.pointerId !== event.pointerId) return;
    const moved = d.moved;
    dragStateRef.current = null;
    if (!moved) {
      setUnreadCount(0);
      navigate(`/r/${encodeURIComponent(regionId)}/chat`);
    }
  };
  return createPortal(
    /* @__PURE__ */ jsxDEV(Fragment, { children: [
      /* @__PURE__ */ jsxDEV(
        "div",
        {
          role: "button",
          "aria-label": "ê³µì  ì±í ë°ë¡ê°ê¸°",
          onPointerDown,
          onPointerMove,
          onPointerUp,
          style: {
            position: "fixed",
            left: badgePos.x,
            top: badgePos.y,
            zIndex: 2200,
            minWidth: 54,
            height: 32,
            padding: "0 10px",
            borderRadius: 999,
            background: "linear-gradient(135deg,#fee500,#facc15)",
            border: "2px solid rgba(255,255,255,0.98)",
            boxShadow: "0 8px 22px rgba(161,98,7,0.24)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#3f2a06",
            fontSize: 10,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            fontWeight: 900,
            userSelect: "none",
            touchAction: "none",
            cursor: "grab"
          },
          children: [
            "ê³µì ",
            unreadCount > 0 ? /* @__PURE__ */ jsxDEV(
              "span",
              {
                style: {
                  position: "absolute",
                  right: -5,
                  top: -5,
                  minWidth: 18,
                  height: 18,
                  borderRadius: 999,
                  background: "#ef4444",
                  color: "#fff",
                  border: "2px solid #fff",
                  fontSize: 9,
                  fontWeight: 900,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 4px"
                },
                children: unreadCount > 99 ? "99+" : unreadCount
              },
              void 0,
              false,
              {
                fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
                lineNumber: 5786,
                columnNumber: 9
              },
              this
            ) : null
          ]
        },
        void 0,
        true,
        {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5753,
          columnNumber: 7
        },
        this
      ),
      toast ? /* @__PURE__ */ jsxDEV(
        "div",
        {
          style: {
            position: "fixed",
            left: badgePos.x - 8,
            top: badgePos.y - 44,
            zIndex: 2201,
            background: "rgba(15,23,42,0.94)",
            color: "#f8fafc",
            border: "1px solid rgba(56,189,248,0.35)",
            borderRadius: 10,
            padding: "7px 10px",
            fontSize: 11,
            fontWeight: 700,
            whiteSpace: "nowrap",
            boxShadow: "0 10px 24px rgba(2,6,23,0.35)",
            maxWidth: 220,
            overflow: "hidden",
            textOverflow: "ellipsis"
          },
          children: toast
        },
        void 0,
        false,
        {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5810,
          columnNumber: 7
        },
        this
      ) : null
    ] }, void 0, true, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 5752,
      columnNumber: 5
    }, this),
    document.body
  );
}
_s12(GlobalChatFloatingBadge, "VaZeQPzIsMYDuywbkXqPqIWHdc0=", false, function() {
  return [useLocation, useNavigate];
});
_c48 = GlobalChatFloatingBadge;
export default function App() {
  _s13();
  useEffect(() => {
    try {
      ensureMemberProfile();
    } catch (e) {
    }
  }, []);
  const getInitialAuthState = () => {
    const currentUser = getCurrentUser();
    const session = getSession();
    const loggedIn = isLoggedInMemory() || !!session?.memberId || !!currentUser?.memberId;
    return {
      isLoggedIn: loggedIn,
      authReady: isAuthReady() || loggedIn
    };
  };
  const [authState, setAuthState] = useState(getInitialAuthState);
  const appBodyRef = useRef(null);
  useEffect(() => {
    (async () => {
      try {
        const bres = await boot();
        if (import.meta.env.DEV) {
          console.log("[App] auth boot result:", bres);
        }
        syncOnAppStart().then((result) => {
          if (import.meta.env.DEV && result.success) {
            console.log("[App] ë°ì´í° ëê¸°í ìë£:", result);
          }
        }).catch((err) => {
          if (import.meta.env.DEV) {
            console.error("[App] ëê¸°í ì¤ ì¤ë¥:", err);
          }
        });
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error("[App] auth boot failed:", err);
        }
      }
    })();
  }, []);
  useEffect(() => {
    let mounted = true;
    (async () => {
      await hydrateAuthFromServer();
      if (mounted) {
        setAuthState({
          isLoggedIn: isLoggedInMemory(),
          authReady: true
        });
      }
    })();
    const onAuthChanged = () => {
      if (!mounted) return;
      setAuthState({
        isLoggedIn: isLoggedInMemory(),
        authReady: true
      });
    };
    window.addEventListener("su:auth:changed", onAuthChanged);
    return () => {
      mounted = false;
      window.removeEventListener("su:auth:changed", onAuthChanged);
    };
  }, []);
  return /* @__PURE__ */ jsxDEV("div", { className: "su-appShell su-app", children: [
    /* @__PURE__ */ jsxDEV(VoucherFetchRecorder, {}, void 0, false, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 5914,
      columnNumber: 3
    }, this),
    /* @__PURE__ */ jsxDEV(VipAmountDisplayBridge, {}, void 0, false, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 5915,
      columnNumber: 3
    }, this),
    /* @__PURE__ */ jsxDEV(VipMemberSummaryBridge, {}, void 0, false, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 5916,
      columnNumber: 3
    }, this),
    /* @__PURE__ */ jsxDEV(MyOfficeHeroCleanupBridge, {}, void 0, false, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 5917,
      columnNumber: 3
    }, this),
    /* @__PURE__ */ jsxDEV(CardCreateExperienceBridge, {}, void 0, false, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 5918,
      columnNumber: 3
    }, this),
    /* @__PURE__ */ jsxDEV(PointWalletBridge, {}, void 0, false, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 5919,
      columnNumber: 3
    }, this),
    /* @__PURE__ */ jsxDEV("style", { children: appNeonHomeStyles }, void 0, false, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 5920,
      columnNumber: 3
    }, this),
    /* @__PURE__ */ jsxDEV("div", { ref: appBodyRef, className: "su-appBody", style: { paddingBottom: 72 }, children: /* @__PURE__ */ jsxDEV(Suspense, { fallback: /* @__PURE__ */ jsxDEV("div", { style: { padding: 24, textAlign: "center" }, children: "ë¡ë© ì¤..." }, void 0, false, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 5923,
      columnNumber: 29
    }, this), children: /* @__PURE__ */ jsxDEV(Routes, { children: [
      /* @__PURE__ */ jsxDEV(Route, { path: "/", element: /* @__PURE__ */ jsxDEV(Navigate, { to: "/home", replace: true }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5926,
        columnNumber: 36
      }, this) }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5926,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Route, { path: "/home", element: /* @__PURE__ */ jsxDEV(Home, {}, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5928,
        columnNumber: 40
      }, this) }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5928,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Route, { path: "/search", element: /* @__PURE__ */ jsxDEV(Search, {}, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5929,
        columnNumber: 42
      }, this) }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5929,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Route, { path: "/community", element: /* @__PURE__ */ jsxDEV(Community, {}, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5930,
        columnNumber: 45
      }, this) }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5930,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Route, { path: "/chat", element: /* @__PURE__ */ jsxDEV(Chat, {}, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5931,
        columnNumber: 40
      }, this) }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5931,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Route, { path: "/shops/events", element: /* @__PURE__ */ jsxDEV(ShopEvents, {}, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5932,
        columnNumber: 48
      }, this) }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5932,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Route, { path: "/shops", element: /* @__PURE__ */ jsxDEV(Shops, {}, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5933,
        columnNumber: 41
      }, this) }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5933,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Route, { path: "/shops/:id", element: /* @__PURE__ */ jsxDEV(ShopDetail, {}, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5934,
        columnNumber: 45
      }, this) }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5934,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Route, { path: "/my", element: /* @__PURE__ */ jsxDEV(MyPageWithVipVoucherBridge, {}, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5935,
        columnNumber: 38
      }, this) }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5935,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Route, { path: "/my/card", element: /* @__PURE__ */ jsxDEV(Navigate, { to: "/my", replace: true }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5937,
        columnNumber: 43
      }, this) }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5937,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Route, { path: "/card/:slug", element: /* @__PURE__ */ jsxDEV(SimpleSavedCardPage, {}, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5938,
        columnNumber: 46
      }, this) }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5938,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Route, { path: "/cards/:cardId", element: /* @__PURE__ */ jsxDEV(Navigate, { to: "/my", replace: true }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5940,
        columnNumber: 49
      }, this) }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5940,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Route, { path: "/auth", element: /* @__PURE__ */ jsxDEV(Auth, {}, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5941,
        columnNumber: 40
      }, this) }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5941,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Route, { path: "/broadcast", element: /* @__PURE__ */ jsxDEV(Broadcast, {}, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5942,
        columnNumber: 45
      }, this) }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5942,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Route, { path: "/broadcast/:id", element: /* @__PURE__ */ jsxDEV(BroadcastDetail, {}, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5943,
        columnNumber: 49
      }, this) }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5943,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Route, { path: "/audition", element: /* @__PURE__ */ jsxDEV(Audition, {}, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5944,
        columnNumber: 44
      }, this) }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5944,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Route, { path: "/audition/:id", element: /* @__PURE__ */ jsxDEV(AuditionDetail, {}, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5945,
        columnNumber: 48
      }, this) }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5945,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Route, { path: "/audition/:id/apply", element: /* @__PURE__ */ jsxDEV(AuditionApply, {}, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5946,
        columnNumber: 54
      }, this) }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5946,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Route, { path: "/region", element: /* @__PURE__ */ jsxDEV(RegionSelectPage, {}, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5947,
        columnNumber: 42
      }, this) }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5947,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Route, { path: "/portal/region/:id", element: /* @__PURE__ */ jsxDEV(Region, {}, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5948,
        columnNumber: 53
      }, this) }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5948,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Route, { path: "/portal/region/:regionId/notices", element: /* @__PURE__ */ jsxDEV(RegionNotices, {}, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5949,
        columnNumber: 67
      }, this) }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5949,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Route, { path: "/regions/:regionCode/posts", element: /* @__PURE__ */ jsxDEV(RegionPosts, {}, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5950,
        columnNumber: 61
      }, this) }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5950,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Route, { path: "/r/:regionId", element: /* @__PURE__ */ jsxDEV(RegionLayout, {}, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5952,
        columnNumber: 47
      }, this), children: [
        /* @__PURE__ */ jsxDEV(Route, { index: true, element: /* @__PURE__ */ jsxDEV(RegionHub, {}, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5953,
          columnNumber: 35
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5953,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Route, { path: "board", element: /* @__PURE__ */ jsxDEV(RegionBoard, {}, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5954,
          columnNumber: 42
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5954,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Route, { path: "board/write", element: /* @__PURE__ */ jsxDEV(RegionBoardWrite, {}, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5955,
          columnNumber: 48
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5955,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Route, { path: "board/:postId", element: /* @__PURE__ */ jsxDEV(RegionBoardPost, {}, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5956,
          columnNumber: 50
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5956,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Route, { path: "notices", element: /* @__PURE__ */ jsxDEV(RegionNotices, {}, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5957,
          columnNumber: 44
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5957,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Route, { path: "missions", element: /* @__PURE__ */ jsxDEV(Missions, {}, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5958,
          columnNumber: 45
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5958,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Route, { path: "shops", element: /* @__PURE__ */ jsxDEV(RegionShops, {}, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5959,
          columnNumber: 42
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5959,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Route, { path: "broadcasts", element: /* @__PURE__ */ jsxDEV(RegionBroadcasts, {}, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5960,
          columnNumber: 47
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5960,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Route, { path: "auditions", element: /* @__PURE__ */ jsxDEV(RegionAuditions, {}, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5961,
          columnNumber: 46
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5961,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Route, { path: "apt", element: /* @__PURE__ */ jsxDEV(RegionApartments, {}, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5962,
          columnNumber: 40
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5962,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Route, { path: "apt/:aptId", element: /* @__PURE__ */ jsxDEV(ApartmentBoard, {}, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5963,
          columnNumber: 47
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5963,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Route, { path: "news", element: /* @__PURE__ */ jsxDEV(RegionNews, {}, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5964,
          columnNumber: 41
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5964,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Route, { path: "chat", element: /* @__PURE__ */ jsxDEV(RegionChatRooms, {}, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5965,
          columnNumber: 41
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5965,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Route, { path: "intro", element: /* @__PURE__ */ jsxDEV(RegionIntro, {}, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5966,
          columnNumber: 42
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5966,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Route, { path: "events", element: /* @__PURE__ */ jsxDEV(RegionEvents, {}, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5967,
          columnNumber: 43
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5967,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Route, { path: "flyers", element: /* @__PURE__ */ jsxDEV(RegionFlyers, {}, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5968,
          columnNumber: 43
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5968,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Route, { path: "festivals", element: /* @__PURE__ */ jsxDEV(RegionFestivals, {}, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5969,
          columnNumber: 46
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5969,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5952,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Route, { path: "/posts/:id", element: /* @__PURE__ */ jsxDEV(PostDetail, {}, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5971,
        columnNumber: 45
      }, this) }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5971,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Route, { path: "/notices", element: /* @__PURE__ */ jsxDEV(Notices, {}, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5972,
        columnNumber: 43
      }, this) }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5972,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Route, { path: "/notices/:id", element: /* @__PURE__ */ jsxDEV(NoticeDetail, {}, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5973,
        columnNumber: 47
      }, this) }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5973,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Route, { path: "/missions", element: /* @__PURE__ */ jsxDEV(Missions, {}, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5974,
        columnNumber: 44
      }, this) }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5974,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Route, { path: "/support", element: /* @__PURE__ */ jsxDEV(Support, {}, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5975,
        columnNumber: 43
      }, this) }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5975,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Route, { path: "/card", element: /* @__PURE__ */ jsxDEV(Card, {}, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5976,
        columnNumber: 40
      }, this) }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5976,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Route, { path: "/regional-admin", element: /* @__PURE__ */ jsxDEV(RegionalAdminConsole, {}, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5978,
        columnNumber: 50
      }, this) }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5978,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Route, { path: "/admin/login", element: /* @__PURE__ */ jsxDEV(AdminLogin, {}, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5981,
        columnNumber: 47
      }, this) }, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5981,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Route, { path: "/admin", element: /* @__PURE__ */ jsxDEV(AdminLayout, {}, void 0, false, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5982,
        columnNumber: 41
      }, this), children: [
        /* @__PURE__ */ jsxDEV(Route, { index: true, element: /* @__PURE__ */ jsxDEV(AdminDashboard, {}, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5983,
          columnNumber: 35
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5983,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Route, { path: "regions", element: /* @__PURE__ */ jsxDEV(AdminRegions, {}, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5984,
          columnNumber: 44
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5984,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Route, { path: "regions/:regionId/apartments", element: /* @__PURE__ */ jsxDEV(AdminApartments, {}, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5985,
          columnNumber: 65
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5985,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Route, { path: "stores", element: /* @__PURE__ */ jsxDEV(AdminStores, {}, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5986,
          columnNumber: 43
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5986,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Route, { path: "missions", element: /* @__PURE__ */ jsxDEV(AdminMissions, {}, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5987,
          columnNumber: 45
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5987,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Route, { path: "vouchers", element: /* @__PURE__ */ jsxDEV(VipAdminVouchersPage, {}, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5988,
          columnNumber: 45
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5988,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Route, { path: "auditions", element: /* @__PURE__ */ jsxDEV(AdminAuditions, {}, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5989,
          columnNumber: 46
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5989,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Route, { path: "contents", element: /* @__PURE__ */ jsxDEV(AdminContents, {}, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5990,
          columnNumber: 45
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5990,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Route, { path: "members", element: /* @__PURE__ */ jsxDEV(AdminMembers, {}, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5991,
          columnNumber: 44
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5991,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Route, { path: "points", element: /* @__PURE__ */ jsxDEV(AdminPoints, {}, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5992,
          columnNumber: 43
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5992,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Route, { path: "live-broadcast", element: /* @__PURE__ */ jsxDEV(AdminLiveBroadcast, {}, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5993,
          columnNumber: 51
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5993,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Route, { path: "supplies", element: /* @__PURE__ */ jsxDEV(AdminSupplies, {}, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5994,
          columnNumber: 45
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5994,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Route, { path: "supply-managers", element: /* @__PURE__ */ jsxDEV(AdminSupplyManagers, {}, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5995,
          columnNumber: 52
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5995,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Route, { path: "supply-tools", element: /* @__PURE__ */ jsxDEV(AdminSupplyTools, {}, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5996,
          columnNumber: 49
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5996,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Route, { path: "backup-tools", element: /* @__PURE__ */ jsxDEV(AdminBackupTools, {}, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5997,
          columnNumber: 49
        }, this) }, void 0, false, {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 5997,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 5982,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(
        Route,
        {
          path: "*",
          element: /* @__PURE__ */ jsxDEV("div", { style: { padding: 24 }, children: "íì´ì§ë¥¼ ì°¾ì ì ììµëë¤ (404)" }, void 0, false, {
            fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
            lineNumber: 6003,
            columnNumber: 24
          }, this)
        },
        void 0,
        false,
        {
          fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
          lineNumber: 6001,
          columnNumber: 11
        },
        this
      )
    ] }, void 0, true, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 5924,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 5923,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 5922,
      columnNumber: 3
    }, this),
    /* @__PURE__ */ jsxDEV(ScrollToTop, { appBodyRef }, void 0, false, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 6009,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(
      AppBottomNav,
      {
        isLoggedIn: authState.isLoggedIn,
        authReady: authState.authReady,
        onLogout: () => setAuthState({ isLoggedIn: false, authReady: true })
      },
      void 0,
      false,
      {
        fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
        lineNumber: 6011,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ jsxDEV(GlobalChatFloatingBadge, { isLoggedIn: authState.isLoggedIn }, void 0, false, {
      fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
      lineNumber: 6016,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "C:/Users/kmh/Desktop/smi-project/src/App.jsx",
    lineNumber: 5913,
    columnNumber: 5
  }, this);
}
_s13(App, "ScCrN/iPQSsEbdVNkNf4WdRz1hQ=");
_c49 = App;
var _c, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9, _c0, _c1, _c10, _c11, _c12, _c13, _c14, _c15, _c16, _c17, _c18, _c19, _c20, _c21, _c22, _c23, _c24, _c25, _c26, _c27, _c28, _c29, _c30, _c31, _c32, _c33, _c34, _c35, _c36, _c37, _c38, _c39, _c40, _c41, _c42, _c43, _c44, _c45, _c46, _c47, _c48, _c49;
$RefreshReg$(_c, "AdminLogin$lazy");
$RefreshReg$(_c2, "AdminLogin");
$RefreshReg$(_c3, "AdminLayout$lazy");
$RefreshReg$(_c4, "AdminLayout");
$RefreshReg$(_c5, "AdminDashboard$lazy");
$RefreshReg$(_c6, "AdminDashboard");
$RefreshReg$(_c7, "AdminRegions$lazy");
$RefreshReg$(_c8, "AdminRegions");
$RefreshReg$(_c9, "AdminApartments$lazy");
$RefreshReg$(_c0, "AdminApartments");
$RefreshReg$(_c1, "AdminStores$lazy");
$RefreshReg$(_c10, "AdminStores");
$RefreshReg$(_c11, "AdminMissions$lazy");
$RefreshReg$(_c12, "AdminMissions");
$RefreshReg$(_c13, "AdminContents$lazy");
$RefreshReg$(_c14, "AdminContents");
$RefreshReg$(_c15, "AdminMembers$lazy");
$RefreshReg$(_c16, "AdminMembers");
$RefreshReg$(_c17, "AdminAuditions$lazy");
$RefreshReg$(_c18, "AdminAuditions");
$RefreshReg$(_c19, "AdminPoints$lazy");
$RefreshReg$(_c20, "AdminPoints");
$RefreshReg$(_c21, "AdminLiveBroadcast$lazy");
$RefreshReg$(_c22, "AdminLiveBroadcast");
$RefreshReg$(_c23, "AdminSupplies$lazy");
$RefreshReg$(_c24, "AdminSupplies");
$RefreshReg$(_c25, "AdminSupplyManagers$lazy");
$RefreshReg$(_c26, "AdminSupplyManagers");
$RefreshReg$(_c27, "AdminSupplyTools$lazy");
$RefreshReg$(_c28, "AdminSupplyTools");
$RefreshReg$(_c29, "AdminBackupTools$lazy");
$RefreshReg$(_c30, "AdminBackupTools");
$RefreshReg$(_c31, "RegionalAdminConsole$lazy");
$RefreshReg$(_c32, "RegionalAdminConsole");
$RefreshReg$(_c33, "AppBottomNav");
$RefreshReg$(_c34, "ScrollToTop");
$RefreshReg$(_c35, "VoucherFetchRecorder");
$RefreshReg$(_c36, "ShopVoucherPaymentBridge");
$RefreshReg$(_c37, "VipAmountDisplayBridge");
$RefreshReg$(_c38, "VipMemberSummaryBridge");
$RefreshReg$(_c39, "MyOfficeHeroCleanupBridge");
$RefreshReg$(_c40, "BusinessCardSurface");
$RefreshReg$(_c41, "BusinessCardThemeThumbnail");
$RefreshReg$(_c42, "CardCreateExperienceBridge");
$RefreshReg$(_c43, "SimpleSavedCardPage");
$RefreshReg$(_c44, "PointWalletBridge");
$RefreshReg$(_c45, "VipAdminVouchersPage");
$RefreshReg$(_c46, "MemberVipVoucherPanel");
$RefreshReg$(_c47, "MyPageWithVipVoucherBridge");
$RefreshReg$(_c48, "GlobalChatFloatingBadge");
$RefreshReg$(_c49, "App");
if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}
if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("C:/Users/kmh/Desktop/smi-project/src/App.jsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("C:/Users/kmh/Desktop/smi-project/src/App.jsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,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QUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FB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QUFBQXcrQixhQUFBdCtCLE1BQUE7QUFBQXMrQixhQUFBcitCLE1BQUE7QUFBQXErQixhQUFBbitCLE1BQUE7QUFBQW0rQixhQUFBbCtCLE1BQUE7QUFBQWsrQixhQUFBaCtCLE1BQUE7QUFBQWcrQixhQUFBLzlCLE1BQUE7QUFBQSs5QixhQUFBNzlCLE1BQUE7QUFBQTY5QixhQUFBNTlCLE1BQUE7QUFBQTQ5QixhQUFBMTlCLE1BQUE7QUFBQTA5QixhQUFBejlCLE1BQUE7QUFBQXk5QixhQUFBejJCLE1BQUE7QUFBQXkyQixhQUFBbjJCLE1BQUE7QUFBQW0yQixhQUFBMXNCLE1BQUE7QUFBQTBzQixhQUFBNWpCLE1BQUE7QUFBQTRqQixhQUFBdmpCLE1BQUE7QUFBQXVqQixhQUFBNWlCLE1BQUE7QUFBQTRpQixhQUFBcGlCLE1BQUE7QUFBQW9pQixhQUFBM1ksTUFBQTtBQUFBMlksYUFBQXhZLE1BQUE7QUFBQXdZLGFBQUFuVSxNQUFBO0FBQUFtVSxhQUFBOVMsTUFBQTtBQUFBOFMsYUFBQS9NLE1BQUE7QUFBQStNLGFBQUFqSSxNQUFBO0FBQUFpSSxhQUFBN0csTUFBQTtBQUFBNkcsYUFBQXRHLE1BQUE7QUFBQXNHLGFBQUFiLE1BQUE7QUFBQWEsYUFBQUQsTUFBQSIsIm5hbWVzIjpbIlJvdXRlcyIsIlJvdXRlIiwiTmF2aWdhdGUiLCJ1c2VMb2NhdGlvbiIsInVzZU5hdmlnYXRlIiwidXNlUGFyYW1zIiwidXNlRWZmZWN0IiwidXNlTGF5b3V0RWZmZWN0IiwidXNlU3RhdGUiLCJ1c2VSZWYiLCJsYXp5IiwiU3VzcGVuc2UiLCJjcmVhdGVQb3J0YWwiLCJpc0FkbWluQXV0aGVudGljYXRlZExvY2FsIiwiZW5zdXJlTWVtYmVyUHJvZmlsZSIsInN0b3JhZ2VBZGFwdGVyIiwic2hvcFN0b3JlIiwiaHlkcmF0ZUF1dGhGcm9tU2VydmVyIiwiaXNMb2dnZWRJbiIsImlzTG9nZ2VkSW5NZW1vcnkiLCJnZXRDdXJyZW50UmVnaW9uSWQiLCJnZXRTZXNzaW9uIiwiZ2V0Q3VycmVudFVzZXIiLCJpc0F1dGhSZWFkeSIsInNpZ25PdXQiLCJib290Iiwic3luY09uQXBwU3RhcnQiLCJIb21lIiwiU2VhcmNoIiwiQ29tbXVuaXR5IiwiQ29taW5nU29vbiIsIkNoYXQiLCJTaG9wcyIsIlNob3BFdmVudHMiLCJTaG9wRGV0YWlsIiwiTXkiLCJBdXRoIiwiQnJvYWRjYXN0IiwiQnJvYWRjYXN0VmlldyIsIkJyb2FkY2FzdERldGFpbCIsIkF1ZGl0aW9uIiwiQXVkaXRpb25WaWV3IiwiQXVkaXRpb25EZXRhaWwiLCJBdWRpdGlvbkFwcGx5IiwiUmVnaW9uIiwiUmVnaW9uU2VsZWN0UGFnZSIsIlJlZ2lvblBvc3RzIiwiUmVnaW9uTm90aWNlcyIsIlJlZ2lvbkxheW91dCIsIlJlZ2lvbkh1YiIsIlJlZ2lvbkJvYXJkIiwiUmVnaW9uQm9hcmRXcml0ZSIsIlJlZ2lvbkJvYXJkUG9zdCIsIlJlZ2lvblNob3BzIiwiUmVnaW9uQXBhcnRtZW50cyIsIkFwYXJ0bWVudEJvYXJkIiwiUmVnaW9uTmV3cyIsIlJlZ2lvbkJyb2FkY2FzdHMiLCJSZWdpb25BdWRpdGlvbnMiLCJSZWdpb25JbnRybyIsIlJlZ2lvbkV2ZW50cyIsIlJlZ2lvbkZseWVycyIsIlJlZ2lvbkZlc3RpdmFscyIsIlJlZ2lvbkNoYXRSb29tcyIsIlBvc3REZXRhaWwiLCJOb3RpY2VzIiwiTm90aWNlRGV0YWlsIiwiTWlzc2lvbnMiLCJTdXBwb3J0IiwiQ2FyZCIsIkFkbWluTG9naW4iLCJfYyIsIl9jMiIsIkFkbWluTGF5b3V0IiwiX2MzIiwiX2M0IiwiQWRtaW5EYXNoYm9hcmQiLCJfYzUiLCJfYzYiLCJBZG1pblJlZ2lvbnMiLCJfYzciLCJfYzgiLCJBZG1pbkFwYXJ0bWVudHMiLCJfYzkiLCJfYzAiLCJBZG1pblN0b3JlcyIsIl9jMSIsIl9jMTAiLCJBZG1pbk1pc3Npb25zIiwiX2MxMSIsIl9jMTIiLCJBZG1pbkNvbnRlbnRzIiwiX2MxMyIsIl9jMTQiLCJBZG1pbk1lbWJlcnMiLCJfYzE1IiwiX2MxNiIsIkFkbWluQXVkaXRpb25zIiwiX2MxNyIsIl9jMTgiLCJBZG1pblBvaW50cyIsIl9jMTkiLCJfYzIwIiwiQWRtaW5MaXZlQnJvYWRjYXN0IiwiX2MyMSIsIl9jMjIiLCJBZG1pblN1cHBsaWVzIiwiX2MyMyIsIl9jMjQiLCJBZG1pblN1cHBseU1hbmFnZXJzIiwiX2MyNSIsIl9jMjYiLCJBZG1pblN1cHBseVRvb2xzIiwiX2MyNyIsIl9jMjgiLCJBZG1pbkJhY2t1cFRvb2xzIiwiX2MyOSIsIl9jMzAiLCJSZWdpb25hbEFkbWluQ29uc29sZSIsIl9jMzEiLCJfYzMyIiwiYXBwTmVvbkhvbWVTdHlsZXMiLCJBcHBCb3R0b21OYXYiLCJhdXRoUmVhZHkiLCJvbkxvZ291dCIsIl9zIiwibmF2aWdhdGUiLCJsb2NhdGlvbiIsImJvdHRvbUJhbm5lciIsInNldEJvdHRvbUJhbm5lciIsImJhbm5lckNsb3NlZCIsInNldEJhbm5lckNsb3NlZCIsInNlc3Npb25TdG9yYWdlIiwiZ2V0SXRlbSIsImUiLCJtb3VudGVkIiwiZmV0Y2giLCJ0aGVuIiwicmVzcG9uc2UiLCJvayIsImpzb24iLCJkYXRhIiwibGlzdCIsImJhbm5lcnMiLCJBcnJheSIsImlzQXJyYXkiLCJsZW5ndGgiLCJjYXRjaCIsImN1cnJlbnRQYXRoIiwicGF0aG5hbWUiLCJzZXNzaW9uIiwic3RvcmVkUmVnaW9uSWQiLCJyYXciLCJsb2NhbFN0b3JhZ2UiLCJTdHJpbmciLCJ0cmltIiwibWVtYmVyUmVnaW9uSWQiLCJyZWdpb25JZCIsIm5vcm1hbGl6ZWQiLCJpc1BvcnRhbEFjdGl2ZSIsInN0YXJ0c1dpdGgiLCJ0ZXN0IiwidGFicyIsImtleSIsImxhYmVsIiwiYWN0aXZlIiwib25DbGljayIsInRvbmUiLCJ1bmRlZmluZWQiLCJjb25maXJtZWQiLCJ3aW5kb3ciLCJjb25maXJtIiwiY29uc29sZSIsImVycm9yIiwic2V0SXRlbSIsInN0YXRlIiwicmV0dXJuVG8iLCJuYXZTaGVsbFN0eWxlIiwicG9zaXRpb24iLCJsZWZ0IiwicmlnaHQiLCJib3R0b20iLCJ6SW5kZXgiLCJkaXNwbGF5IiwianVzdGlmeUNvbnRlbnQiLCJwYWRkaW5nIiwicG9pbnRlckV2ZW50cyIsIm5hdlN0eWxlIiwid2lkdGgiLCJncmlkVGVtcGxhdGVDb2x1bW5zIiwiZ2FwIiwiYm9yZGVyUmFkaXVzIiwiYmFja2dyb3VuZCIsImJvcmRlciIsImJveFNoYWRvdyIsImJhY2tkcm9wRmlsdGVyIiwiV2Via2l0QmFja2Ryb3BGaWx0ZXIiLCJiYW5uZXJTdHlsZSIsInRyYW5zZm9ybSIsImFsaWduSXRlbXMiLCJsaW5rX3VybCIsImZsZXgiLCJ0ZXh0RGVjb3JhdGlvbiIsIm1pbldpZHRoIiwiaW1hZ2VfdXJsIiwiYWx0IiwiaGVpZ2h0IiwibWF4V2lkdGgiLCJvYmplY3RGaXQiLCJmb250U2l6ZSIsImNvbG9yIiwibGluZUhlaWdodCIsImN1cnNvciIsIm1hcCIsInRhYiIsImlzQWN0aXZlIiwiaXNEYW5nZXIiLCJhcHBlYXJhbmNlIiwiV2Via2l0QXBwZWFyYW5jZSIsImZvbnRXZWlnaHQiLCJsZXR0ZXJTcGFjaW5nIiwidGV4dFNoYWRvdyIsIndoaXRlU3BhY2UiLCJvdmVyZmxvdyIsInRleHRPdmVyZmxvdyIsImZsZXhEaXJlY3Rpb24iLCJXZWJraXRUYXBIaWdobGlnaHRDb2xvciIsIm91dGxpbmUiLCJ1c2VyU2VsZWN0IiwidG91Y2hBY3Rpb24iLCJ0cmFuc2l0aW9uIiwib3BhY2l0eSIsIl9jMzMiLCJTY3JvbGxUb1RvcCIsImFwcEJvZHlSZWYiLCJfczIiLCJjdXJyZW50Iiwic2Nyb2xsVG9wIiwiX2MzNCIsIlZJUF9WT1VDSEVSX1RJVExFIiwiVklQX1ZPVUNIRVJfVFlQRSIsIlZJUF9NRVRBX01BUktFUiIsIlZJUF9BUElfQkFTRSIsImltcG9ydCIsImVudiIsIlZJVEVfQVBJX1VSTCIsIlNIT1BfVk9VQ0hFUl9QQVlNRU5UX0NBQ0hFX0tFWSIsImZvcm1hdFZvdWNoZXJBbW91bnQiLCJ2YWx1ZSIsImFtb3VudCIsIk51bWJlciIsInRvTG9jYWxlU3RyaW5nIiwiS1NUX0xPQ0FMRSIsIktTVF9USU1FX1pPTkUiLCJwYXJzZUtTVERhdGVWYWx1ZSIsIkRhdGUiLCJpc05hTiIsImdldFRpbWUiLCJkYXRlIiwidHJpbW1lZCIsImRhdGVPbmx5TWF0Y2giLCJtYXRjaCIsInllYXIiLCJtb250aCIsImRheSIsIlVUQyIsIm5haXZlRGF0ZVRpbWVNYXRjaCIsImhvdXIiLCJtaW51dGUiLCJzZWNvbmQiLCJtaWxsaXNlY29uZCIsInBhZEVuZCIsImZvcm1hdEtTVERhdGUiLCJJbnRsIiwiRGF0ZVRpbWVGb3JtYXQiLCJ0aW1lWm9uZSIsImZvcm1hdCIsImZvcm1hdEtTVFRpbWUiLCJob3VyMTIiLCJmb3JtYXRLU1REYXRlVGltZSIsImZvcm1hdFZvdWNoZXJEYXRlIiwiZm9ybWF0Vm91Y2hlckRhdGVUaW1lIiwiYnVpbGRWb3VjaGVyRGF0ZUtleSIsImdldEZ1bGxZZWFyIiwiZ2V0TW9udGgiLCJwYWRTdGFydCIsImdldERhdGUiLCJnZW5lcmF0ZVZvdWNoZXJTZXJpYWwiLCJub3ciLCJkYXlLZXkiLCJzdG9yYWdlS2V5IiwibmV4dCIsInRpbWVUYWlsIiwic2xpY2UiLCJidWlsZFZvdWNoZXJQcmV2aWV3U2VyaWFsIiwiYnVpbGRWb3VjaGVyRGVzY3JpcHRpb24iLCJyZWFzb24iLCJpc3N1ZVJlZ2lvbiIsImNsZWFuUmVhc29uIiwiY2xlYW5SZWdpb24iLCJtZXRhIiwiSlNPTiIsInN0cmluZ2lmeSIsInBhcnNlVm91Y2hlckRlc2NyaXB0aW9uIiwiZGVzY3JpcHRpb24iLCJtYXJrZXJJbmRleCIsImluZGV4T2YiLCJmcm9tTWVtYmVySWQiLCJmcm9tTWVtYmVyTmFtZSIsInRvTWVtYmVySWQiLCJ0b01lbWJlck5hbWUiLCJzaG9wSWQiLCJzaG9wTmFtZSIsIm1ldGFSYXciLCJwYXJzZSIsInJlYWRTaG9wVm91Y2hlclBheW1lbnRDYWNoZSIsInBhcnNlZCIsIndyaXRlU2hvcFZvdWNoZXJQYXltZW50Q2FjaGUiLCJyZWNvcmRzIiwicmVtZW1iZXJTaG9wVm91Y2hlclBheW1lbnQiLCJyZWNvcmQiLCJzZXJpYWwiLCJraW5kIiwidm91Y2hlclR5cGUiLCJ1c2VySWQiLCJ1c2VyTmFtZSIsInVzZWRBdCIsInRvSVNPU3RyaW5nIiwic3RhdHVzIiwiY2FjaGUiLCJkZWR1cGVLZXkiLCJmaWx0ZXIiLCJlbnRyeSIsImRpc3BhdGNoRXZlbnQiLCJDdXN0b21FdmVudCIsImRldGFpbCIsIm5vcm1hbGl6ZVNob3BWb3VjaGVyUGF5bWVudFJlY29yZCIsIm1lcmdlU2hvcFZvdWNoZXJQYXltZW50UmVjb3JkcyIsImdyb3VwcyIsIm1lcmdlZCIsInNlZW4iLCJTZXQiLCJmbGF0IiwiZm9yRWFjaCIsImhhcyIsImFkZCIsInB1c2giLCJzb3J0IiwiY29udmVydFNob3BWb3VjaGVySGlzdG9yeVRvUmVjb3JkcyIsInNob3AiLCJoaXN0b3J5IiwiaWQiLCJuYW1lIiwic291cmNlIiwidG9VcHBlckNhc2UiLCJyZWZlcmVuY2VJZCIsIm5vcm1hbGl6ZVZvdWNoZXJTZXJpYWwiLCJjcmVhdGVkQXQiLCJCb29sZWFuIiwiZXh0cmFjdFNob3BWb3VjaGVyUGF5bWVudFJlY29yZCIsInBheWxvYWQiLCJyZWNlaXZlckRlc2NyaXB0aW9uIiwic2VuZGVyRGVzY3JpcHRpb24iLCJtZW1iZXJJZCIsInNhbml0aXplVmlwQW1vdW50TGFiZWxzIiwicm9vdCIsImRvY3VtZW50IiwiYm9keSIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJlbGVtZW50cyIsImVsZW1lbnQiLCJjaGlsZEVsZW1lbnRDb3VudCIsInRleHQiLCJ0ZXh0Q29udGVudCIsInJlcGxhY2UiLCJfIiwiVm91Y2hlckZldGNoUmVjb3JkZXIiLCJfczMiLCJfX3N1VmlwVm91Y2hlckZldGNoUmVjb3JkZXJJbnN0YWxsZWQiLCJvcmlnaW5hbEZldGNoIiwiYmluZCIsImlucHV0IiwiaW5pdCIsInVybFZhbHVlIiwidXJsIiwiVVJMIiwib3JpZ2luIiwibWV0aG9kIiwiYm9keVRleHQiLCJ0YXJnZXRUeXBlIiwidG9Mb3dlckNhc2UiLCJfYzM1IiwiU2hvcFZvdWNoZXJQYXltZW50QnJpZGdlIiwiX3M0IiwiaGVhZGVyTm9kZSIsInNldEhlYWRlck5vZGUiLCJtb3VudE5vZGUiLCJzZXRNb3VudE5vZGUiLCJzaG9wUGFuZWxOb2RlIiwic2V0U2hvcFBhbmVsTm9kZSIsIm93bmVkU2hvcHMiLCJzZXRPd25lZFNob3BzIiwic2V0UmVjb3JkcyIsImFjdGl2ZVNob3BJZCIsInNldEFjdGl2ZVNob3BJZCIsImF1dGhSZWxvYWRUaWNrIiwic2V0QXV0aFJlbG9hZFRpY2siLCJpc0V4cGFuZGVkIiwic2V0SXNFeHBhbmRlZCIsInNob3BFYXJuZWQiLCJzZXRTaG9wRWFybmVkIiwic2hvcEF2YWlsYWJsZSIsInNldFNob3BBdmFpbGFibGUiLCJzaG9wTGVkZ2VyIiwic2V0U2hvcExlZGdlciIsInNob3BMZWRnZXJFeHBhbmRlZCIsInNldFNob3BMZWRnZXJFeHBhbmRlZCIsInNob3BMZWRnZXJMb2FkaW5nIiwic2V0U2hvcExlZGdlckxvYWRpbmciLCJwYXlvdXRSZXF1ZXN0cyIsInNldFBheW91dFJlcXVlc3RzIiwicGF5b3V0TG9hZGluZyIsInNldFBheW91dExvYWRpbmciLCJmb3JtYXRQb2ludEFtb3VudCIsImZvcm1hdENvbXBhY3RQb2ludEFtb3VudCIsImZvcm1hdFBheW91dERhdGUiLCJmb3JtYXR0ZWQiLCJub3JtYWxpemVQYXlvdXRSZXF1ZXN0IiwiaW5kZXgiLCJyZXF1ZXN0SWQiLCJyZXF1ZXN0X2lkIiwicmVxdWVzdGVkQXQiLCJyZXF1ZXN0ZWRfYXQiLCJjcmVhdGVkX2F0IiwiZ2V0UGF5b3V0U3RhdHVzVWkiLCJpY29uIiwiYm9yZGVyQ29sb3IiLCJmZXRjaEJyaWRnZUpzb24iLCJwYXRoIiwiY3JlZGVudGlhbHMiLCJFcnJvciIsIm1lc3NhZ2UiLCJzdGF0dXNUZXh0IiwiZW5zdXJlTW91bnROb2RlIiwicGFuZWxzIiwiZnJvbSIsInNob3BQYW5lbCIsImZpbmQiLCJwYW5lbCIsImluY2x1ZGVzIiwic3VtbWFyeUhvc3QiLCJxdWVyeVNlbGVjdG9yIiwiY3JlYXRlRWxlbWVudCIsInNldEF0dHJpYnV0ZSIsImluc2VydEFkamFjZW50RWxlbWVudCIsImhvc3QiLCJzdHlsZSIsIm1hcmdpblRvcCIsImFwcGVuZENoaWxkIiwic2VsZWN0b3IiLCJkYXRhc2V0IiwidmlwQm91bmQiLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJ0YXJnZXQiLCJvYnNlcnZlciIsIk11dGF0aW9uT2JzZXJ2ZXIiLCJvYnNlcnZlIiwiY2hpbGRMaXN0Iiwic3VidHJlZSIsImRpc2Nvbm5lY3QiLCJwYXJlbnRFbGVtZW50IiwicmVtb3ZlQXR0cmlidXRlIiwidHJpZ2dlclJlbG9hZCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJjdXJyZW50VXNlciIsImxvYWRPd25lZFNob3BzIiwiaGVhZGVycyIsInNob3BzIiwidGV4dE5vZGVzIiwibm9kZSIsIm1hdGNoZWRTaG9wIiwiZmlyc3RTaG9wSWQiLCJzZWxlY3RlZFNob3BJZCIsImxvYWRTaG9wUG9pbnRTdW1tYXJ5IiwiZWFybmVkUmVzIiwiYXZhaWxhYmxlUmVzIiwibGVkZ2VyUmVzIiwicGF5b3V0UmVzIiwiUHJvbWlzZSIsImFsbFNldHRsZWQiLCJlbmNvZGVVUklDb21wb25lbnQiLCJsb2FkVW5pZmllZFNob3BQYXlvdXRSZXF1ZXN0cyIsInRvdGFsRWFybmVkIiwidG90YWwiLCJhdmFpbGFibGUiLCJsZWRnZXIiLCJyZXF1ZXN0cyIsInJlZnJlc2giLCJvd25lZExpc3QiLCJvd25lZFNob3BJZHMiLCJjYWNoZVJlY29yZHMiLCJoaXN0b3J5R3JvdXBzIiwiYWxsIiwiZmFsbGJhY2siLCJzZWxlY3RlZFNob3AiLCJzZWxlY3RlZFNob3BSZWNvcmRzIiwiZWFybmVkVGV4dCIsImF2YWlsYWJsZVRleHQiLCJzb3J0ZWRQYXlvdXRSZXF1ZXN0cyIsImxlZnRQZW5kaW5nIiwicmlnaHRQZW5kaW5nIiwidmlzaWJsZVNob3BMZWRnZXIiLCJoYXNNb3JlU2hvcExlZGdlciIsImhlYWRlclBvcnRhbCIsIm1hcmdpbkJvdHRvbSIsInRleHRBbGlnbiIsInRleHRUcmFuc2Zvcm0iLCJmbGV4V3JhcCIsIm1hcmdpbkxlZnQiLCJmbGV4U2hyaW5rIiwicGFkZGluZ1RvcCIsImJvcmRlclRvcCIsImJ1eWVyTmFtZSIsImJ1eWVyTWVtYmVySWQiLCJlYXJuaW5nSWQiLCJzb3VyY2VUeElkIiwibWluSGVpZ2h0IiwicGF5b3V0UG9ydGFsIiwid29yZEJyZWFrIiwib3ZlcmZsb3dXcmFwIiwicmVxdWVzdCIsInN0YXR1c1VpIiwiX2MzNiIsIlZpcEFtb3VudERpc3BsYXlCcmlkZ2UiLCJfczUiLCJhcHBseSIsImNoYXJhY3RlckRhdGEiLCJfYzM3IiwiVmlwTWVtYmVyU3VtbWFyeUJyaWRnZSIsIl9zNiIsInRhcmdldFBhbmVsIiwicmVjZW50SXNzdWVkTGFiZWwiLCJpbmZvR3JpZCIsInN1bW1hcnlDYXJkIiwic3VtbWFyeVdyYXAiLCJhbW91bnROb2RlIiwicHJldmlvdXNFbGVtZW50U2libGluZyIsImhlYWRlclJvdyIsIl9jMzgiLCJNeU9mZmljZUhlcm9DbGVhbnVwQnJpZGdlIiwiX3M3IiwiYWxsTm9kZXMiLCJidXR0b24iLCJjbG9zZXN0IiwiSFRNTEVsZW1lbnQiLCJjb21wYWN0VGV4dCIsIl9jMzkiLCJDQVJEX1RIRU1FX1BSRVNFVFMiLCJ0ZWFsIiwib3JpZW50YXRpb24iLCJzdXJmYWNlIiwicHJldmlld0JhY2tncm91bmQiLCJhY2NlbnQiLCJnbG93IiwicGFuZWxCYWNrZ3JvdW5kIiwidGl0bGUiLCJmb2lsIiwiZGFyayIsImxheW91dCIsImJsdWUiLCJuYXZ5IiwicHVycGxlIiwicGluayIsInJlZCIsIm9yYW5nZSIsImdyZWVuIiwiZ29sZCIsIkNBUkRfTUVUQV9QUkVGSVgiLCJub3JtYWxpemVDYXJkU2x1Z0lucHV0IiwiYnVpbGREZWZhdWx0Q2FyZFNsdWciLCJ0b1N0cmluZyIsInJvdW5kUmVjdFBhdGgiLCJjdHgiLCJ4IiwieSIsInJhZGl1cyIsInNhZmVSYWRpdXMiLCJNYXRoIiwibWF4IiwibWluIiwiYmVnaW5QYXRoIiwibW92ZVRvIiwiYXJjVG8iLCJjbG9zZVBhdGgiLCJ3cmFwQ2FudmFzVGV4dCIsIndvcmRzIiwic3BsaXQiLCJsaW5lcyIsIndvcmQiLCJtZWFzdXJlVGV4dCIsImV4dHJhY3RDYXJkTWV0YSIsImxpbmtzIiwicHJlc2VydmVkTGlua3MiLCJpdGVtIiwiY2F0ZWdvcnkiLCJ0eXBlIiwiYnVpbGRDYXJkTWV0YUxpbmtzIiwiZmllbGRzIiwibWV0YUxpbmtzIiwiT2JqZWN0IiwiZW50cmllcyIsInNpbXBsaWZ5V2Vic2l0ZUxhYmVsIiwiYnVpbGRDYXJkRm9ybSIsImRlZmF1bHROYW1lIiwiZGVmYXVsdFBob25lIiwiY29tcGFueU5hbWUiLCJqb2JUaXRsZSIsInBob25lIiwibW9iaWxlIiwiYWRkcmVzcyIsIndlYnNpdGUiLCJpbnRybyIsImNhcmRQdWJsaWMiLCJyZXNvbHZlQ2FyZFRoZW1lS2V5IiwicmVzb2x2ZUNhcmRPcmllbnRhdGlvbiIsInJlYWRDYXJkRmllbGRzRnJvbVJlY29yZCIsImRlZmF1bHRzIiwiZmFsbGJhY2tGb3JtIiwicmVzb2x2ZWRUaGVtZUtleSIsInRlbXBsYXRlIiwidGhlbWVDb2xvciIsImZvcm0iLCJiaW8iLCJ0aGVtZUtleSIsInNsdWciLCJjYXJkU2x1ZyIsImNyZWF0ZUNhcmRQYXlsb2FkIiwiZ2V0Q2FyZERpc3BsYXlXZWJzaXRlIiwiZ2V0Q2FyZEluZm9MaW5lcyIsImFycmF5IiwiZmluZEluZGV4Iiwic2hvdWxkU2hvd0NhcmRTaWRlUGFuZWwiLCJlbnN1cmVDYXJkU2x1ZyIsInByZWZlcnJlZFNvdXJjZSIsImN1cnJlbnRTbHVnIiwicHJlc2VydmVkIiwiYmFzZSIsImNhbmRpZGF0ZXMiLCJjYW5kaWRhdGUiLCJyZXN1bHQiLCJjaGVja0NhcmRTbHVnIiwic3VmZml4IiwiZ2V0Q2FyZEZpbGVTdGVtIiwiZmFsbGJhY2tTbHVnIiwiYnVpbGRCdXNpbmVzc0NhcmRJbWFnZURhdGFVcmwiLCJ0aGVtZSIsImNhcmRPcmllbnRhdGlvbiIsImRpc3BsYXlXZWJzaXRlIiwic2hvd1NpZGVQYW5lbCIsImNhbnZhcyIsImdldENvbnRleHQiLCJjcmVhdGVMaW5lYXJHcmFkaWVudCIsImdyYWRpZW50UGFydHMiLCJhZGRDb2xvclN0b3AiLCJmaWxsU3R5bGUiLCJmaWxsIiwic2F2ZSIsImdsb2JhbEFscGhhIiwiYXJjIiwiUEkiLCJyZXN0b3JlIiwic3Ryb2tlU3R5bGUiLCJsaW5lV2lkdGgiLCJzdHJva2UiLCJpbmZvTGluZXMiLCJjb250ZW50WCIsImN1cnNvclkiLCJmb250IiwiZmlsbFRleHQiLCJjaGFyIiwicmlnaHRDb2x1bW5ZIiwicmlnaHRDb2x1bW5YIiwibGluZSIsImpvaW4iLCJwYW5lbFkiLCJ0b0RhdGFVUkwiLCJkb3dubG9hZEJ1c2luZXNzQ2FyZEltYWdlIiwiZGF0YVVybCIsImFuY2hvciIsImhyZWYiLCJkb3dubG9hZCIsImNsaWNrIiwicmVtb3ZlIiwic2hhcmVCdXNpbmVzc0NhcmRJbWFnZSIsImJsb2IiLCJmaWxlIiwiRmlsZSIsInNoYXJlVGV4dCIsIm5hdmlnYXRvciIsInNoYXJlIiwiY2FuU2hhcmVGaWxlIiwiY2FuU2hhcmUiLCJmaWxlcyIsImNsaXBib2FyZCIsIndyaXRlVGV4dCIsIkJ1c2luZXNzQ2FyZFN1cmZhY2UiLCJpbnNldCIsInRvcCIsImFsaWduU2VsZiIsIl9jNDAiLCJCdXNpbmVzc0NhcmRUaGVtZVRodW1ibmFpbCIsImlzVmVydGljYWwiLCJfYzQxIiwiQ2FyZENyZWF0ZUV4cGVyaWVuY2VCcmlkZ2UiLCJfczgiLCJvYnNlcnZlclJlZiIsImhpZGRlbk1vZGFsUmVmIiwib3ZlcmxheVJlZiIsImhvc3RSZWYiLCJob3N0Tm9kZSIsInNldEhvc3ROb2RlIiwibG9hZGluZyIsInNldExvYWRpbmciLCJzYXZpbmciLCJzZXRTYXZpbmciLCJzaGFyZUxvYWRpbmciLCJzZXRTaGFyZUxvYWRpbmciLCJzZWxlY3RlZENhcmRUaGVtZSIsInNldFNlbGVjdGVkQ2FyZFRoZW1lIiwic2VsZWN0ZWRDYXJkT3JpZW50YXRpb24iLCJzZXRTZWxlY3RlZENhcmRPcmllbnRhdGlvbiIsInRvYXN0Iiwic2V0VG9hc3QiLCJzYXZlZFNsdWciLCJzZXRTYXZlZFNsdWciLCJpbml0aWFsU2x1ZyIsInNldEluaXRpYWxTbHVnIiwic2V0UHJlc2VydmVkTGlua3MiLCJzZXRGb3JtIiwicGhvbmVOdW1iZXIiLCJwcmV2aWV3VGhlbWUiLCJ2aXNpYmxlVGhlbWVzIiwidmFsdWVzIiwiY2xvc2VCcmlkZ2VNb2RhbCIsIm92ZXJsYXkiLCJNb3VzZUV2ZW50IiwiYnViYmxlcyIsImh5ZHJhdGVGcm9tU2VydmVyIiwiZXhpc3RpbmciLCJmZXRjaFVzZXJDYXJkIiwicmVzb2x2ZWQiLCJuZXh0U2x1ZyIsInRpbWVyIiwic2V0VGltZW91dCIsImNsZWFyVGltZW91dCIsInJlbW92ZUNoaWxkIiwiZmluZEZpeGVkQW5jZXN0b3IiLCJnZXRDb21wdXRlZFN0eWxlIiwiZW5zdXJlTW9kYWxCcmlkZ2UiLCJidXR0b25zIiwiY3JlYXRlQnV0dG9uIiwicmVtb3ZlSXRlbSIsIm15Q2FyZEJ1dHRvbiIsInNsdWdJbnB1dCIsIm9yaWdpbmFsTW9kYWwiLCJjaGlsZHJlbiIsImNoaWxkIiwicHJldiIsImFjdGl2ZVRoZW1lIiwiZmFsbGJhY2tUaGVtZSIsInNldEZpZWxkVmFsdWUiLCJzYXZlUHJldmlld0ltYWdlIiwic2hhcmVQcmV2aWV3Q2FyZCIsInNhdmVDYXJkUmVjb3JkIiwic2F2ZUNhcmQiLCJvcGVyYXRpb24iLCJzdG9wUHJvcGFnYXRpb24iLCJtYXhIZWlnaHQiLCJvdmVyZmxvd1kiLCJib3hTaXppbmciLCJyZXNpemUiLCJfYzQyIiwiU2ltcGxlU2F2ZWRDYXJkUGFnZSIsIl9zOSIsImRlbGV0aW5nIiwic2V0RGVsZXRpbmciLCJzaGFyaW5nIiwic2V0U2hhcmluZyIsImNhcmRTdGF0ZSIsInNldENhcmRTdGF0ZSIsImV4aXN0cyIsInZpZXdlck1lbWJlcklkIiwiaXNPd25lciIsImNhbmNlbGxlZCIsImxvYWRDYXJkIiwiY2FyZCIsImZldGNoQ2FyZEJ5U2x1ZyIsImhhbmRsZURvd25sb2FkIiwiaGFuZGxlU2hhcmUiLCJoYW5kbGVEZWxldGUiLCJkZWxldGVDYXJkIiwibWFyZ2luIiwiX2M0MyIsIlBvaW50V2FsbGV0QnJpZGdlIiwiX3MwIiwiaGlkZGVuUGFuZWxSZWYiLCJoaWRkZW5GcmllbmRQYW5lbFJlZiIsIm1vdW50T2JzZXJ2ZXJSZWYiLCJtb3VudEZyYW1lUmVmIiwibW91bnRSZXRyeVRpbWVyUmVmIiwicG9pbnRCYWxhbmNlIiwic2V0UG9pbnRCYWxhbmNlIiwicG9pbnRIaXN0b3J5Iiwic2V0UG9pbnRIaXN0b3J5IiwibWVtYmVycyIsInNldE1lbWJlcnMiLCJzZXRTaG9wcyIsImFjdGlvbk1vZGUiLCJzZXRBY3Rpb25Nb2RlIiwiYWN0aW9uU3RlcCIsInNldEFjdGlvblN0ZXAiLCJ0YXJnZXRRdWVyeSIsInNldFRhcmdldFF1ZXJ5Iiwic2VsZWN0ZWRNZW1iZXIiLCJzZXRTZWxlY3RlZE1lbWJlciIsInNldFNlbGVjdGVkU2hvcCIsImFtb3VudElucHV0Iiwic2V0QW1vdW50SW5wdXQiLCJhY3Rpb25Mb2FkaW5nIiwic2V0QWN0aW9uTG9hZGluZyIsImFjdGlvblN1Ym1pdHRpbmciLCJzZXRBY3Rpb25TdWJtaXR0aW5nIiwicG9pbnRIaXN0b3J5RXhwYW5kZWQiLCJzZXRQb2ludEhpc3RvcnlFeHBhbmRlZCIsInJlbG9hZFRpY2siLCJzZXRSZWxvYWRUaWNrIiwiZmV0Y2hKc29uIiwib3B0aW9ucyIsImdldEN1cnJlbnRNZW1iZXJJbmZvIiwibWVtYmVyTmFtZSIsIm5vcm1hbGl6ZVBvaW50SGlzdG9yeUVudHJ5IiwibGVkZ2VyX2lkIiwibGVkZ2VySWQiLCJhbW91bnRBYnMiLCJhYnMiLCJjbG9zZUFjdGlvbiIsInNlbGVjdGVkVGFyZ2V0Iiwic2VsZWN0ZWRUYXJnZXROYW1lIiwiYW1vdW50VmFsdWUiLCJsb2FkUG9pbnREYXRhIiwiYmFsYW5jZVJlcyIsImhpc3RvcnlSZXMiLCJoaXN0b3J5Um93cyIsInRyYW5zYWN0aW9ucyIsImJhbGFuY2UiLCJyaWdodFRpbWUiLCJsZWZ0VGltZSIsImNhbmNlbEFuaW1hdGlvbkZyYW1lIiwicmV0cnlDb3VudCIsImZyaWVuZFBhbmVsIiwib2JzZXJ2ZXJSb290IiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwicmVsb2FkIiwiZWFybmVkVG90YWwiLCJyZWR1Y2UiLCJzdW0iLCJzcGVudFRvdGFsIiwicmVjZW50SGlzdG9yeSIsInZpc2libGVQb2ludEhpc3RvcnkiLCJmaWx0ZXJlZE1lbWJlcnMiLCJtZW1iZXIiLCJjYW5kaWRhdGVJZCIsInF1ZXJ5IiwiZmlsdGVyZWRTaG9wcyIsIm9wZW5BY3Rpb24iLCJtb2RlIiwic3VibWl0U2hvcFBheW1lbnQiLCJjb25maXJtVGV4dCIsInFyRGF0YSIsImlzc3VlU2hvcFFyUGF5bG9hZCIsInFyUGF5bG9hZCIsInBheW1lbnRSZXN1bHQiLCJwYXlXaXRoUXJQYXlsb2FkIiwidHJ1bmMiLCJzdWNjZXNzIiwic3VibWl0UG9pbnRUcmFuc2ZlckZhbGxiYWNrIiwic2Vzc2lvblRva2VuIiwiX19TVV9TRVNTSU9OX18iLCJ0b2tlbiIsIkF1dGhvcml6YXRpb24iLCJyZWZlcmVuY2VUeXBlIiwic3VibWl0UG9pbnRUcmFuc2ZlciIsInJlY2VpdmVySWQiLCJpc01pc3NpbmdUcmFuc2ZlclJvdXRlIiwiaW5uZXJXaWR0aCIsInN0ZXBObyIsInNlbGVjdGVkIiwiX2M0NCIsImdldFZvdWNoZXJEaXJlY3Rpb24iLCJsb2ciLCJnZXRWb3VjaGVyU3RhdHVzTGFiZWwiLCJnZXRWb3VjaGVyU3RhdHVzU3R5bGUiLCJzdGF0dXNMYWJlbCIsIm5vcm1hbGl6ZVZvdWNoZXJMb2ciLCJyZXNvbHZlZFNob3BOYW1lIiwicmVzb2x2ZWRGcm9tTWVtYmVyTmFtZSIsImRlc2NTaG9wSWQiLCJkZXNjU2hvcE5hbWUiLCJkaXJlY3Rpb24iLCJWaXBBZG1pblZvdWNoZXJzUGFnZSIsIl9zMSIsImxlZGdlclJlZiIsInN1Ym1pdHRpbmciLCJzZXRTdWJtaXR0aW5nIiwibG9ncyIsInNldExvZ3MiLCJiYWxhbmNlUm93cyIsInNldEJhbGFuY2VSb3dzIiwiaXNNb2JpbGUiLCJzZXRJc01vYmlsZSIsInNob3dNZW1iZXJEcm9wZG93biIsInNldFNob3dNZW1iZXJEcm9wZG93biIsImlzc3VlTW9kZSIsInNldElzc3VlTW9kZSIsImlzc3VlRm9ybSIsInNldElzc3VlRm9ybSIsIm1lbWJlclNlYXJjaCIsInNldE1lbWJlclNlYXJjaCIsImZpbHRlcnMiLCJzZXRGaWx0ZXJzIiwidG8iLCJoYW5kbGVSZXNpemUiLCJhcGlKc29uIiwibG9hZCIsIm1lbWJlckRhdGEiLCJsb2dEYXRhIiwiYmFsYW5jZURhdGEiLCJyb3dzIiwicmVsb2FkVm91Y2hlckRhdGEiLCJzYW5pdGl6ZUFtb3VudCIsInNlbGVjdGVkTWVtYmVyQmFsYW5jZSIsInJvdyIsIm5vcm1hbGl6ZWRMb2dzIiwic3VtbWFyeSIsImFjYyIsInRvdGFsSXNzdWVkIiwidG90YWxJc3N1ZWRDb3VudCIsInRvdGFsRGVkdWN0ZWQiLCJjdXJyZW50QmFsYW5jZSIsIm1lbWJlcklzc3VlQ291bnRzIiwibWVtYmVyUmVjZW50Q2hhbmdlIiwic3VtbWFyeUNhcmRzIiwidmlzaWJsZUJhbGFuY2VSb3dzIiwiaXNzdWVkQ291bnQiLCJsYXN0Q2hhbmdlZEF0IiwiZmlsdGVyZWRMb2dzIiwidGFyZ2V0VGV4dCIsIklTU1VFRF9TT1VSQ0VTIiwic2VyaWFsTmV0TWFwIiwicmVjZW50Vm91Y2hlckNhcmRzIiwicHJldmlld1NlcmlhbCIsInBhbmVsU3R5bGUiLCJpbnB1dFN0eWxlIiwibGFiZWxTdHlsZSIsImJ1dHRvblN0eWxlIiwidm91Y2hlckNhcmRTdHlsZSIsImhhbmRsZUlzc3VlIiwidHlwZUNvZGUiLCJib3JkZXJCb3R0b20iLCJmb250RmFtaWx5Iiwib3ZlcmZsb3dYIiwiYm9yZGVyQ29sbGFwc2UiLCJzY3JvbGxJbnRvVmlldyIsImJlaGF2aW9yIiwiYmxvY2siLCJfYzQ1IiwiTWVtYmVyVmlwVm91Y2hlclBhbmVsIiwid2FsbGV0VmlldyIsIl9zMTAiLCJ0YWJIb3N0Iiwic2V0VGFiSG9zdCIsInZvdWNoZXJCYWxhbmNlIiwic2V0Vm91Y2hlckJhbGFuY2UiLCJ2b3VjaGVySGlzdG9yeSIsInNldFZvdWNoZXJIaXN0b3J5IiwiaXNWb3VjaGVyIiwicG9pbnRQYW5lbHNSZWYiLCJwb2ludFBhbmVsIiwidmlwUGFuZWwiLCJmaXJzdFdhbGxldFBhbmVsIiwibmV4dFRhYkhvc3QiLCJsb2FkVm91Y2hlckRhdGEiLCJhY3RpdmVWb3VjaGVyQ2FyZHMiLCJ2aXNpYmxlSGlzdG9yeSIsInRvdGFsQW1vdW50IiwiX2M0NiIsIk15UGFnZVdpdGhWaXBWb3VjaGVyQnJpZGdlIiwiX3MxMSIsInNldFdhbGxldFZpZXciLCJzYXZlZCIsImhhbmRsZXIiLCJzdG9yYWdlSGFuZGxlciIsIl9jNDciLCJHbG9iYWxDaGF0RmxvYXRpbmdCYWRnZSIsIl9zMTIiLCJteU1lbWJlcklkIiwidm9pY2VFbmFibGVkUmVmIiwiYmFkZ2VQb3MiLCJzZXRCYWRnZVBvcyIsImlzRmluaXRlIiwiaW5uZXJIZWlnaHQiLCJ1bnJlYWRDb3VudCIsInNldFVucmVhZENvdW50IiwiZHJhZ1N0YXRlUmVmIiwiZmlyc3RQb2xsUmVmIiwicm9vbUxhc3RTZWVuUmVmIiwidG9hc3RUaW1lclJlZiIsInBvbGxUaW1lclJlZiIsIm9uUmVnaW9uQ2hhdFBhZ2UiLCJOb3RpZmljYXRpb24iLCJwZXJtaXNzaW9uIiwicmVxdWVzdFBlcm1pc3Npb24iLCJzeW5jVm9pY2VQcmVmIiwiY2xlYXJJbnRlcnZhbCIsIlZJVEVfQVBJX0JBU0UiLCJwbGF5Tm90aWNlVG9uZSIsIkF1ZGlvQ3R4IiwiQXVkaW9Db250ZXh0Iiwid2Via2l0QXVkaW9Db250ZXh0IiwiY3VycmVudFRpbWUiLCJvIiwiY3JlYXRlT3NjaWxsYXRvciIsImciLCJjcmVhdGVHYWluIiwiZnJlcXVlbmN5Iiwic2V0VmFsdWVBdFRpbWUiLCJnYWluIiwiZXhwb25lbnRpYWxSYW1wVG9WYWx1ZUF0VGltZSIsImNvbm5lY3QiLCJkZXN0aW5hdGlvbiIsInN0YXJ0Iiwic3RvcCIsIm9uZW5kZWQiLCJjbG9zZSIsInNwZWFrR2xvYmFsTm90aWNlIiwic3ludGgiLCJzcGVlY2hTeW50aGVzaXMiLCJzcGVha2luZyIsImNhbmNlbCIsInV0dGVyYW5jZSIsIlNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZSIsImxhbmciLCJyYXRlIiwicGl0Y2giLCJzcGVhayIsInBvbGwiLCJyb29tcyIsImhhc05ldyIsImxhdGVzdFNlbmRlciIsImxhdGVzdFRleHQiLCJyb29tIiwicm9vbUlkIiwibGF0ZXN0QXQiLCJsYXN0TWVzc2FnZUF0IiwicHJldkF0IiwiY2hhbmdlZCIsIm1lc3NhZ2VzRGF0YSIsIm1lc3NhZ2VzIiwibGF0ZXN0IiwibWVzc2FnZVR5cGUiLCJzZXRJbnRlcnZhbCIsIm9uUG9pbnRlckRvd24iLCJzdGFydFgiLCJjbGllbnRYIiwic3RhcnRZIiwiY2xpZW50WSIsInBvaW50ZXJJZCIsIm9yaWdpblgiLCJvcmlnaW5ZIiwibW92ZWQiLCJjdXJyZW50VGFyZ2V0Iiwic2V0UG9pbnRlckNhcHR1cmUiLCJvblBvaW50ZXJNb3ZlIiwiZCIsImR4IiwiZHkiLCJtYXhYIiwibWF4WSIsIm5leHRYIiwibmV4dFkiLCJvblBvaW50ZXJVcCIsIl9jNDgiLCJBcHAiLCJfczEzIiwiZ2V0SW5pdGlhbEF1dGhTdGF0ZSIsImxvZ2dlZEluIiwiYXV0aFN0YXRlIiwic2V0QXV0aFN0YXRlIiwiYnJlcyIsIkRFViIsImVyciIsIm9uQXV0aENoYW5nZWQiLCJwYWRkaW5nQm90dG9tIiwiX2M0OSIsIiRSZWZyZXNoUmVnJCJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlcyI6WyJBcHAuanN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFJvdXRlcywgUm91dGUsIE5hdmlnYXRlLCB1c2VMb2NhdGlvbiwgdXNlTmF2aWdhdGUsIHVzZVBhcmFtcyB9IGZyb20gXCJyZWFjdC1yb3V0ZXItZG9tXCI7XHJcbmltcG9ydCB7IHVzZUVmZmVjdCwgdXNlTGF5b3V0RWZmZWN0LCB1c2VTdGF0ZSwgdXNlUmVmLCBsYXp5LCBTdXNwZW5zZSB9IGZyb20gXCJyZWFjdFwiO1xyXG5pbXBvcnQgeyBjcmVhdGVQb3J0YWwgfSBmcm9tIFwicmVhY3QtZG9tXCI7XHJcbmltcG9ydCB7IGlzQWRtaW5BdXRoZW50aWNhdGVkTG9jYWwgfSBmcm9tIFwiLi9saWIvYWRtaW5BdXRoXCI7XHJcbmltcG9ydCB7IGVuc3VyZU1lbWJlclByb2ZpbGUgfSBmcm9tIFwiLi9saWIvbWVtYmVyU3RvcmVcIjtcclxuaW1wb3J0ICogYXMgc3RvcmFnZUFkYXB0ZXIgZnJvbSBcIi4vbGliL3N0b3JhZ2VBZGFwdGVyXCI7XHJcbmltcG9ydCAqIGFzIHNob3BTdG9yZSBmcm9tIFwiLi9saWIvc2hvcFN0b3JlXCI7XHJcbmltcG9ydCB7XHJcbiAgaHlkcmF0ZUF1dGhGcm9tU2VydmVyLFxyXG4gIGlzTG9nZ2VkSW4gYXMgaXNMb2dnZWRJbk1lbW9yeSxcclxuICBnZXRDdXJyZW50UmVnaW9uSWQsXHJcbiAgZ2V0U2Vzc2lvbixcclxuICBnZXRDdXJyZW50VXNlcixcclxuICBpc0F1dGhSZWFkeSxcclxuICBzaWduT3V0LFxyXG59IGZyb20gXCIuL2xpYi9hdXRoU3RvcmVcIjtcclxuaW1wb3J0IHsgYm9vdCB9IGZyb20gXCIuL2xpYi9hdXRoU3RvcmVcIjtcclxuaW1wb3J0IHsgc3luY09uQXBwU3RhcnQgfSBmcm9tIFwiLi9saWIvc3luY01hbmFnZXJcIjtcclxuaW1wb3J0IEhvbWUgZnJvbSBcIi4vcGFnZXMvSG9tZVwiO1xyXG5pbXBvcnQgU2VhcmNoIGZyb20gXCIuL3BhZ2VzL1NlYXJjaFwiO1xyXG5pbXBvcnQgQ29tbXVuaXR5IGZyb20gXCIuL3BhZ2VzL0NvbW11bml0eVwiO1xyXG5pbXBvcnQgQ29taW5nU29vbiBmcm9tIFwiLi9wYWdlcy9Db21pbmdTb29uXCI7XHJcbmltcG9ydCBDaGF0IGZyb20gXCIuL3BhZ2VzL0NoYXRcIjtcclxuaW1wb3J0IFNob3BzIGZyb20gXCIuL3BhZ2VzL1Nob3BzXCI7XHJcbmltcG9ydCBTaG9wRXZlbnRzIGZyb20gXCIuL3BhZ2VzL1Nob3BFdmVudHNcIjtcclxuaW1wb3J0IFNob3BEZXRhaWwgZnJvbSBcIi4vcGFnZXMvU2hvcERldGFpbFwiO1xyXG5pbXBvcnQgTXkgZnJvbSBcIi4vcGFnZXMvTXlcIjtcclxuaW1wb3J0IEF1dGggZnJvbSBcIi4vcGFnZXMvQXV0aFwiO1xyXG5pbXBvcnQgQnJvYWRjYXN0IGZyb20gXCIuL3BhZ2VzL2Jyb2FkY2FzdC9Ccm9hZGNhc3RcIjtcclxuaW1wb3J0IEJyb2FkY2FzdFZpZXcgZnJvbSBcIi4vcGFnZXMvYnJvYWRjYXN0L0Jyb2FkY2FzdFZpZXdcIjtcclxuaW1wb3J0IEJyb2FkY2FzdERldGFpbCBmcm9tIFwiLi9wYWdlcy9Ccm9hZGNhc3REZXRhaWxcIjtcclxuaW1wb3J0IEF1ZGl0aW9uIGZyb20gXCIuL3BhZ2VzL2F1ZGl0aW9uL0F1ZGl0aW9uXCI7XHJcbmltcG9ydCBBdWRpdGlvblZpZXcgZnJvbSBcIi4vcGFnZXMvYXVkaXRpb24vQXVkaXRpb25WaWV3XCI7XHJcbmltcG9ydCBBdWRpdGlvbkRldGFpbCBmcm9tIFwiLi9wYWdlcy9BdWRpdGlvbkRldGFpbFwiO1xyXG5pbXBvcnQgQXVkaXRpb25BcHBseSBmcm9tIFwiLi9wYWdlcy9hdWRpdGlvbi9BdWRpdGlvbkFwcGx5XCI7XHJcbmltcG9ydCBSZWdpb24gZnJvbSBcIi4vcGFnZXMvUmVnaW9uXCI7XHJcbmltcG9ydCBSZWdpb25TZWxlY3RQYWdlIGZyb20gXCIuL3BhZ2VzL1JlZ2lvblNlbGVjdFBhZ2VcIjtcclxuaW1wb3J0IFJlZ2lvblBvc3RzIGZyb20gXCIuL3BhZ2VzL1JlZ2lvblBvc3RzXCI7XHJcbmltcG9ydCBSZWdpb25Ob3RpY2VzIGZyb20gXCIuL3BhZ2VzL1JlZ2lvbk5vdGljZXNcIjtcclxuaW1wb3J0IFJlZ2lvbkxheW91dCBmcm9tIFwiLi9wYWdlcy9SZWdpb25MYXlvdXRcIjtcclxuaW1wb3J0IFJlZ2lvbkh1YiBmcm9tIFwiLi9wYWdlcy9SZWdpb25IdWJcIjtcclxuaW1wb3J0IFJlZ2lvbkJvYXJkIGZyb20gXCIuL3BhZ2VzL1JlZ2lvbkJvYXJkXCI7XHJcbmltcG9ydCBSZWdpb25Cb2FyZFdyaXRlIGZyb20gXCIuL3BhZ2VzL1JlZ2lvbkJvYXJkV3JpdGVcIjtcclxuaW1wb3J0IFJlZ2lvbkJvYXJkUG9zdCBmcm9tIFwiLi9wYWdlcy9SZWdpb25Cb2FyZFBvc3RcIjtcclxuLy8gaW1wb3J0IFJlZ2lvbk1pc3Npb25zIGZyb20gXCIuL3BhZ2VzL1JlZ2lvbk1pc3Npb25zXCI7XHJcbmltcG9ydCBSZWdpb25TaG9wcyBmcm9tIFwiLi9wYWdlcy9SZWdpb25TaG9wc1wiO1xyXG5pbXBvcnQgUmVnaW9uQXBhcnRtZW50cyBmcm9tIFwiLi9wYWdlcy9SZWdpb25BcGFydG1lbnRzXCI7XHJcbmltcG9ydCBBcGFydG1lbnRCb2FyZCBmcm9tIFwiLi9wYWdlcy9BcGFydG1lbnRCb2FyZFwiO1xyXG5pbXBvcnQgUmVnaW9uTmV3cyBmcm9tIFwiLi9wYWdlcy9SZWdpb25OZXdzXCI7XHJcbmltcG9ydCBSZWdpb25Ccm9hZGNhc3RzIGZyb20gXCIuL3BhZ2VzL1JlZ2lvbkJyb2FkY2FzdHNcIjtcclxuaW1wb3J0IFJlZ2lvbkF1ZGl0aW9ucyBmcm9tIFwiLi9wYWdlcy9SZWdpb25BdWRpdGlvbnNcIjtcclxuaW1wb3J0IFJlZ2lvbkludHJvIGZyb20gXCIuL3BhZ2VzL1JlZ2lvbkludHJvXCI7XHJcbmltcG9ydCBSZWdpb25FdmVudHMgZnJvbSBcIi4vcGFnZXMvUmVnaW9uRXZlbnRzXCI7XHJcbmltcG9ydCBSZWdpb25GbHllcnMgZnJvbSBcIi4vcGFnZXMvUmVnaW9uRmx5ZXJzXCI7XHJcbmltcG9ydCBSZWdpb25GZXN0aXZhbHMgZnJvbSBcIi4vcGFnZXMvUmVnaW9uRmVzdGl2YWxzXCI7XHJcbmltcG9ydCBSZWdpb25DaGF0Um9vbXMgZnJvbSBcIi4vcGFnZXMvUmVnaW9uQ2hhdFJvb21zXCI7XHJcbmltcG9ydCBQb3N0RGV0YWlsIGZyb20gXCIuL3BhZ2VzL1Bvc3REZXRhaWxcIjtcclxuaW1wb3J0IE5vdGljZXMgZnJvbSBcIi4vcGFnZXMvTm90aWNlc1wiO1xyXG5pbXBvcnQgTm90aWNlRGV0YWlsIGZyb20gXCIuL3BhZ2VzL05vdGljZURldGFpbFwiO1xyXG5pbXBvcnQgTWlzc2lvbnMgZnJvbSBcIi4vcGFnZXMvTWlzc2lvbnNcIjtcclxuaW1wb3J0IFN1cHBvcnQgZnJvbSBcIi4vcGFnZXMvU3VwcG9ydFwiO1xyXG5pbXBvcnQgQ2FyZCBmcm9tIFwiLi9wYWdlcy9DYXJkXCI7XHJcblxyXG4vLyDimqEg7L2U65OcIOyKpO2UjOumrO2MhTog6rSA66as7J6QIO2OmOydtOyngOuKlCBsYXp5IGxvYWRpbmdcclxuY29uc3QgQWRtaW5Mb2dpbiA9IGxhenkoKCkgPT4gaW1wb3J0KFwiLi9wYWdlcy9hZG1pbi9BZG1pbkxvZ2luXCIpKTtcclxuY29uc3QgQWRtaW5MYXlvdXQgPSBsYXp5KCgpID0+IGltcG9ydChcIi4vcGFnZXMvYWRtaW4vQWRtaW5MYXlvdXRcIikpO1xyXG5jb25zdCBBZG1pbkRhc2hib2FyZCA9IGxhenkoKCkgPT4gaW1wb3J0KFwiLi9wYWdlcy9hZG1pbi9BZG1pbkRhc2hib2FyZFwiKSk7XHJcbmNvbnN0IEFkbWluUmVnaW9ucyA9IGxhenkoKCkgPT4gaW1wb3J0KFwiLi9wYWdlcy9hZG1pbi9BZG1pblJlZ2lvbnNcIikpO1xyXG5jb25zdCBBZG1pbkFwYXJ0bWVudHMgPSBsYXp5KCgpID0+IGltcG9ydChcIi4vcGFnZXMvYWRtaW4vQWRtaW5BcGFydG1lbnRzXCIpKTtcclxuY29uc3QgQWRtaW5TdG9yZXMgPSBsYXp5KCgpID0+IGltcG9ydChcIi4vcGFnZXMvYWRtaW4vQWRtaW5TdG9yZXNcIikpO1xyXG5jb25zdCBBZG1pbk1pc3Npb25zID0gbGF6eSgoKSA9PiBpbXBvcnQoXCIuL3BhZ2VzL2FkbWluL0FkbWluTWlzc2lvbnNcIikpO1xyXG5jb25zdCBBZG1pbkNvbnRlbnRzID0gbGF6eSgoKSA9PiBpbXBvcnQoXCIuL3BhZ2VzL2FkbWluL0FkbWluQ29udGVudHNcIikpO1xyXG5jb25zdCBBZG1pbk1lbWJlcnMgPSBsYXp5KCgpID0+IGltcG9ydChcIi4vcGFnZXMvYWRtaW4vQWRtaW5NZW1iZXJzXCIpKTtcclxuY29uc3QgQWRtaW5BdWRpdGlvbnMgPSBsYXp5KCgpID0+IGltcG9ydChcIi4vcGFnZXMvYWRtaW4vQWRtaW5BdWRpdGlvbnNcIikpO1xyXG5jb25zdCBBZG1pblBvaW50cyA9IGxhenkoKCkgPT4gaW1wb3J0KFwiLi9wYWdlcy9hZG1pbi9BZG1pblBvaW50c1wiKSk7XHJcbmNvbnN0IEFkbWluTGl2ZUJyb2FkY2FzdCA9IGxhenkoKCkgPT4gaW1wb3J0KFwiLi9wYWdlcy9hZG1pbi9BZG1pbkxpdmVCcm9hZGNhc3RcIikpO1xyXG5jb25zdCBBZG1pblN1cHBsaWVzID0gbGF6eSgoKSA9PiBpbXBvcnQoXCIuL3BhZ2VzL2FkbWluL0FkbWluU3VwcGxpZXNcIikpO1xyXG5jb25zdCBBZG1pblN1cHBseU1hbmFnZXJzID0gbGF6eSgoKSA9PiBpbXBvcnQoXCIuL3BhZ2VzL2FkbWluL0FkbWluU3VwcGx5TWFuYWdlcnNcIikpO1xyXG5jb25zdCBBZG1pblN1cHBseVRvb2xzID0gbGF6eSgoKSA9PiBpbXBvcnQoXCIuL3BhZ2VzL2FkbWluL0FkbWluU3VwcGx5VG9vbHNcIikpO1xyXG5jb25zdCBBZG1pbkJhY2t1cFRvb2xzID0gbGF6eSgoKSA9PiBpbXBvcnQoXCIuL3BhZ2VzL2FkbWluL0FkbWluQmFja3VwVG9vbHNcIikpO1xyXG5jb25zdCBSZWdpb25hbEFkbWluQ29uc29sZSA9IGxhenkoKCkgPT4gaW1wb3J0KFwiLi9wYWdlcy9hZG1pbi9SZWdpb25hbEFkbWluQ29uc29sZVwiKSk7XHJcbmltcG9ydCBcIi4vc3R5bGVzL0FwcC5jc3NcIjtcclxuXHJcbmNvbnN0IGFwcE5lb25Ib21lU3R5bGVzID0gYFxyXG4gIC5zdS1hcHBTaGVsbC5zdS1hcHAge1xyXG4gICAgYmFja2dyb3VuZDpcclxuICAgICAgcmFkaWFsLWdyYWRpZW50KGNpcmNsZSBhdCB0b3AsIHJnYmEoMzQsIDIxMSwgMjM4LCAwLjE0KSwgdHJhbnNwYXJlbnQgMjglKSxcclxuICAgICAgcmFkaWFsLWdyYWRpZW50KGNpcmNsZSBhdCA4NSUgMTIlLCByZ2JhKDU5LCAxMzAsIDI0NiwgMC4xNiksIHRyYW5zcGFyZW50IDI0JSksXHJcbiAgICAgIGxpbmVhci1ncmFkaWVudCgxODBkZWcsICMwYjEyMjAgMCUsICMwZjE3MmEgMTAwJSk7XHJcbiAgfVxyXG5cclxuICAuc3UtYXBwU2hlbGwuc3UtYXBwIC5zdS1hcHBCb2R5IHtcclxuICAgIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xyXG4gICAgbWluLWhlaWdodDogYXV0byAhaW1wb3J0YW50O1xyXG4gICAgcGFkZGluZy1ib3R0b206IDcwcHggIWltcG9ydGFudDtcclxuICB9XHJcblxyXG4gIC5zdS1ob21lIGZvb3RlciB7XHJcbiAgICBtYXJnaW4tYm90dG9tOiAwICFpbXBvcnRhbnQ7XHJcbiAgICBwYWRkaW5nLWJvdHRvbTogMTJweCAhaW1wb3J0YW50O1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLmJvdHRvbU5hdlNwYWNlciB7XHJcbiAgICBoZWlnaHQ6IDAgIWltcG9ydGFudDtcclxuICB9XHJcblxyXG4gIC5zdS1ob21lIHtcclxuICAgIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xyXG4gICAgY29sb3I6ICNmZmZmZmY7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtdGlsZXMge1xyXG4gICAgZ2FwOiAxNXB4O1xyXG4gICAgcGFkZGluZzogNnB4IDE2cHggMjJweDtcclxuICB9XHJcblxyXG4gIC5zdS1ob21lIC5zdS10aWxlIHtcclxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcclxuICAgIG92ZXJmbG93OiBoaWRkZW47XHJcbiAgICBkaXNwbGF5OiBmbGV4O1xyXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcclxuICAgIGdhcDogMTJweDtcclxuICAgIHBhZGRpbmc6IDE2cHggMTRweDtcclxuICAgIGJhY2tncm91bmQ6ICNmZmZmZmY7XHJcbiAgICBib3JkZXItcmFkaXVzOiAxOHB4O1xyXG4gICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgxNSwyMyw0MiwwLjA2KTtcclxuICAgIGJveC1zaGFkb3c6IDAgNnB4IDE4cHggcmdiYSgxNSwgMjMsIDQyLCAwLjA2KTtcclxuICAgIHRyYW5zaXRpb246IGFsbCAwLjJzIGVhc2U7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtdGlsZTo6YmVmb3JlIHtcclxuICAgIGNvbnRlbnQ6IFwiXCI7XHJcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgICBpbnNldDogMDtcclxuICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxODBkZWcsIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC41NSksIHJnYmEoMjU1LCAyNTUsIDI1NSwgMCkpO1xyXG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtdGlsZTpob3ZlcixcclxuICAuc3UtaG9tZSAuc3UtdGlsZTphY3RpdmUge1xyXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0ycHgpO1xyXG4gICAgYm94LXNoYWRvdzogMCAxMnB4IDI0cHggcmdiYSgyMCwxODQsMTY2LDAuMTIpO1xyXG4gICAgYm9yZGVyLWNvbG9yOiByZ2JhKDIwLDE4NCwxNjYsMC40KTtcclxuICB9XHJcblxyXG4gIC5zdS1ob21lIC5zdS10aWxlX190aXRsZSB7XHJcbiAgICBjb2xvcjogIzBmMTcyYTtcclxuICAgIGZvbnQtc2l6ZTogMTVweDtcclxuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XHJcbiAgICBsaW5lLWhlaWdodDogMS4zO1xyXG4gICAgbGV0dGVyLXNwYWNpbmc6IC0wLjAyZW07XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtdGlsZV9fc3ViIHtcclxuICAgIGNvbG9yOiAjNjQ3NDhiO1xyXG4gICAgZm9udC1zaXplOiAxMnB4O1xyXG4gICAgZm9udC13ZWlnaHQ6IDUwMDtcclxuICAgIGxpbmUtaGVpZ2h0OiAxLjQ1O1xyXG4gICAgb3BhY2l0eTogMTtcclxuICAgIGZpbHRlcjogbm9uZTtcclxuICB9XHJcblxyXG4gIC5zdS1ob21lIC5zdS10aWxlX19pY29uIHtcclxuICAgIHdpZHRoOiA0MnB4O1xyXG4gICAgbWluLXdpZHRoOiA0MnB4O1xyXG4gICAgaGVpZ2h0OiA0MnB4O1xyXG4gICAgYm9yZGVyLXJhZGl1czogMTJweDtcclxuICAgIGRpc3BsYXk6IGZsZXg7XHJcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xyXG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XHJcbiAgICBmb250LXNpemU6IDIwcHg7XHJcbiAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCNlMGYyZmUsI2VjZmVmZik7XHJcbiAgICBib3gtc2hhZG93OiAwIDRweCAxMHB4IHJnYmEoMjAsMTg0LDE2NiwwLjE1KTtcclxuICAgIGJvcmRlci1sZWZ0OiAzcHggc29saWQgIzE0YjhhNjtcclxuICB9XHJcblxyXG4gIC5zdS1ob21lIC5zdS10aWxlX190ZXh0IHtcclxuICAgIGRpc3BsYXk6IGZsZXg7XHJcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xyXG4gICAgZ2FwOiA0cHg7XHJcbiAgICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcclxuICAgIHRleHQtYWxpZ246IGxlZnQ7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtdGlsZS0tY3lhbiB7XHJcbiAgICBib3JkZXItY29sb3I6IHJnYmEoNTksIDEzMCwgMjQ2LCAwLjE0KTtcclxuICB9XHJcblxyXG4gIC5zdS1ob21lIC5zdS10aWxlLS1jeWFuIC5zdS10aWxlX19pY29uIHtcclxuICAgIGNvbG9yOiAjM2I4MmY2O1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LXRpbGUtLXRlYWwge1xyXG4gICAgYm9yZGVyLWNvbG9yOiByZ2JhKDIwLCAxODQsIDE2NiwgMC4xNCk7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtdGlsZS0tdGVhbCAuc3UtdGlsZV9faWNvbiB7XHJcbiAgICBjb2xvcjogIzE0YjhhNjtcclxuICB9XHJcblxyXG4gIC5zdS1ob21lIC5zdS10aWxlLS1wdXJwbGUge1xyXG4gICAgYm9yZGVyLWNvbG9yOiByZ2JhKDIzNiwgNzIsIDE1MywgMC4xNCk7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtdGlsZS0tcHVycGxlIC5zdS10aWxlX19pY29uIHtcclxuICAgIGNvbG9yOiAjYmUxODVkO1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LXRpbGUtLWJsdWUge1xyXG4gICAgYm9yZGVyLWNvbG9yOiByZ2JhKDE2OCwgODUsIDI0NywgMC4xNCk7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtdGlsZS0tYmx1ZSAuc3UtdGlsZV9faWNvbiB7XHJcbiAgICBjb2xvcjogIzdjM2FlZDtcclxuICB9XHJcblxyXG4gIC5zdS1ob21lIC5zdS10aWxlLS1vcmFuZ2Uge1xyXG4gICAgYm9yZGVyLWNvbG9yOiByZ2JhKDI0OSwgMTE1LCAyMiwgMC4xNCk7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtdGlsZS0tb3JhbmdlIC5zdS10aWxlX19pY29uIHtcclxuICAgIGNvbG9yOiAjZjk3MzE2O1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LXRpbGUtLXBpbmsge1xyXG4gICAgYm9yZGVyLWNvbG9yOiByZ2JhKDIzNiwgNzIsIDE1MywgMC4xNik7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtdGlsZS0tcGluayAuc3UtdGlsZV9faWNvbiB7XHJcbiAgICBjb2xvcjogI2VjNDg5OTtcclxuICB9XHJcblxyXG4gIC5zdS1ob21lIC5zdS10aWxlLS12aW9sZXQge1xyXG4gICAgYm9yZGVyLWNvbG9yOiByZ2JhKDEzOSwgOTIsIDI0NiwgMC4xNCk7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtdGlsZS0tdmlvbGV0IC5zdS10aWxlX19pY29uIHtcclxuICAgIGNvbG9yOiAjOGI1Y2Y2O1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LXRpbGUtLWluZGlnbyB7XHJcbiAgICBib3JkZXItY29sb3I6IHJnYmEoOTksIDEwMiwgMjQxLCAwLjE0KTtcclxuICB9XHJcblxyXG4gIC5zdS1ob21lIC5zdS10aWxlLS1pbmRpZ28gLnN1LXRpbGVfX2ljb24ge1xyXG4gICAgY29sb3I6ICM2MzY2ZjE7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtdGlsZS0tcmVkIHtcclxuICAgIGJvcmRlci1jb2xvcjogcmdiYSgyMzksIDY4LCA2OCwgMC4xNCk7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtdGlsZS0tcmVkIC5zdS10aWxlX19pY29uIHtcclxuICAgIGNvbG9yOiAjZWY0NDQ0O1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LXRpbGUtLW5hdnkge1xyXG4gICAgYm9yZGVyLWNvbG9yOiByZ2JhKDMwLCA1OCwgMTM4LCAwLjE0KTtcclxuICB9XHJcblxyXG4gIC5zdS1ob21lIC5zdS10aWxlLS1uYXZ5IC5zdS10aWxlX19pY29uIHtcclxuICAgIGNvbG9yOiAjMWUzYThhO1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LWZlYXR1cmVkQ2FyZCxcclxuICAuc3UtaG9tZSAuc3UtZmVhdHVyZWRDYXJkLnN1LWZlYXR1cmVkQ2FyZC0tY29tcGFjdCB7XHJcbiAgICBmbGV4OiAxIDEgMDtcclxuICAgIG1pbi13aWR0aDogMDtcclxuICB9XHJcblxyXG4gIC5zdS1ob21lIC5zdS1mZWF0dXJlZENhcmQtLWhhbGYgeyBwYWRkaW5nOiAxNnB4IDE0cHg7IG1pbi1oZWlnaHQ6IDE2MHB4OyB9XHJcbiAgLnN1LWhvbWUgLnN1LWZlYXR1cmVkQ2FyZC0taGFsZiAuc3UtZmVhdHVyZWRUaXRsZSB7IGZvbnQtc2l6ZTogMjBweDsgfVxyXG4gIC5zdS1ob21lIC5zdS1mZWF0dXJlZENhcmQtLWV2ZW50IHtcclxuICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxMzVkZWcsIzdmMWQxZCAwJSwjOWEzNDEyIDEwMCUpICFpbXBvcnRhbnQ7XHJcbiAgICBib3JkZXItY29sb3I6IHJnYmEoMjM5LDY4LDY4LDAuNCkgIWltcG9ydGFudDtcclxuICB9XHJcbiAgLnN1LWhvbWUgLnN1LWZlYXR1cmVkQmFkZ2UtLWV2ZW50IHsgYmFja2dyb3VuZDogcmdiYSgyMzksNjgsNjgsMC4xNSk7IGNvbG9yOiAjZmNhNWE1OyBib3JkZXItY29sb3I6IHJnYmEoMjM5LDY4LDY4LDAuMyk7IH1cclxuICAuc3UtaG9tZSAuc3UtZmVhdHVyZWRDdGEtLWV2ZW50IHsgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDkwZGVnLCNlZjQ0NDQsI2Y5NzMxNik7IGNvbG9yOiNmZmY7IH1cclxuXHJcbiAgLnNob3AtZXZlbnQtYmFkZ2Uge1xyXG4gICAgZGlzcGxheTogaW5saW5lLWZsZXg7XHJcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xyXG4gICAgcGFkZGluZzogM3B4IDEwcHg7XHJcbiAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoOTBkZWcsI2VmNDQ0NCwjZjk3MzE2KTtcclxuICAgIGNvbG9yOiAjZmZmO1xyXG4gICAgZm9udC1zaXplOiAxMXB4O1xyXG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcclxuICAgIGJvcmRlci1yYWRpdXM6IDk5OXB4O1xyXG4gICAgYm94LXNoYWRvdzogMCAycHggOHB4IHJnYmEoMjM5LDY4LDY4LC4zNSk7XHJcbiAgICB3aGl0ZS1zcGFjZTogbm93cmFwO1xyXG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XHJcbiAgfVxyXG4gIEBrZXlmcmFtZXMgc2hvcEV2ZW50UHVsc2Uge1xyXG4gICAgMCUsMTAwJSB7IG9wYWNpdHk6MTsgdHJhbnNmb3JtOnNjYWxlKDEpOyB9XHJcbiAgICA1MCUgeyBvcGFjaXR5Oi43NTsgdHJhbnNmb3JtOnNjYWxlKC45NSk7IH1cclxuICB9XHJcbiAgLnNob3AtZXZlbnQtYmFkZ2UtLXB1bHNlIHsgYW5pbWF0aW9uOiBzaG9wRXZlbnRQdWxzZSAxLjZzIGVhc2UtaW4tb3V0IGluZmluaXRlOyB9XHJcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XHJcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xyXG4gICAgYm9yZGVyLXJhZGl1czogMjJweDtcclxuICAgIHBhZGRpbmc6IDI0cHggMjJweDtcclxuICAgIGRpc3BsYXk6IGZsZXg7XHJcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xyXG4gICAgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7XHJcbiAgICBnYXA6IDEycHg7XHJcbiAgICBib3gtc2hhZG93OlxyXG4gICAgICAwIDE0cHggMzJweCByZ2JhKDgsIDQ3LCA3MywgMC4yNCksXHJcbiAgICAgIDAgMCAxOHB4IHJnYmEoMzQsIDIxMSwgMjM4LCAwLjE0KTtcclxuICB9XHJcblxyXG4gICAgY29udGVudDogXCJcIjtcclxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICAgIGluc2V0OiAwO1xyXG4gICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEwKSwgdHJhbnNwYXJlbnQgNDIlKTtcclxuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LWZlYXR1cmVkQ2FyZDpob3ZlcixcclxuICAuc3UtaG9tZSAuc3UtZmVhdHVyZWRDYXJkOmFjdGl2ZSB7XHJcbiAgICBmaWx0ZXI6IGJyaWdodG5lc3MoMS4wNCkgIWltcG9ydGFudDtcclxuICAgIHRyYW5zZm9ybTogbm9uZSAhaW1wb3J0YW50O1xyXG4gICAgYm94LXNoYWRvdzogMCAxMnB4IDI0cHggcmdiYSgzNCwgMjExLCAyMzgsIDAuMjgpLCAwIDRweCAxMnB4IHJnYmEoMTUsIDIzLCA0MiwgMC4xKSAhaW1wb3J0YW50O1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LWZlYXR1cmVkQmFkZ2Uge1xyXG4gICAgZGlzcGxheTogaW5saW5lLWZsZXg7XHJcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xyXG4gICAgdHJhbnNmb3JtOiBub25lICFpbXBvcnRhbnQ7XHJcbiAgICBwYWRkaW5nOiA2cHggMTBweDtcclxuICAgIGJvcmRlci1yYWRpdXM6IDk5OXB4O1xyXG4gICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDIxNSwgMCwgMC4xMik7XHJcbiAgICBjb2xvcjogI2ZhY2MxNTtcclxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjUwLCAyMDQsIDIxLCAwLjM1KTtcclxuICAgIGZvbnQtc2l6ZTogMTJweDtcclxuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XHJcbiAgICBsaW5lLWhlaWdodDogMTtcclxuICB9XHJcblxyXG4gIC5zdS1ob21lIC5zdS1mZWF0dXJlZFRpdGxlIHtcclxuICAgIGNvbG9yOiAjZmZmZmZmO1xyXG4gICAgZm9udC1zaXplOiAyOHB4O1xyXG4gICAgZm9udC13ZWlnaHQ6IDgwMDtcclxuICAgIGxpbmUtaGVpZ2h0OiAxLjE1O1xyXG4gICAgbGV0dGVyLXNwYWNpbmc6IC0wLjAyZW07XHJcbiAgICBtYXJnaW46IDA7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtZmVhdHVyZWRTdWIge1xyXG4gICAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC44Mik7XHJcbiAgICBmb250LXNpemU6IDE1cHg7XHJcbiAgICBsaW5lLWhlaWdodDogMS41NTtcclxuICAgIG1hcmdpbjogMDtcclxuICB9XHJcblxyXG4gIC5zdS1ob21lIC5zdS1mZWF0dXJlZEN0YSB7XHJcbiAgICBtYXJnaW4tdG9wOiAycHg7XHJcbiAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoOTBkZWcsICMyMmQzZWUsICMwNmI2ZDQpO1xyXG4gICAgY29sb3I6ICNmZmZmZmY7XHJcbiAgICBib3JkZXItcmFkaXVzOiA5OTlweDtcclxuICAgIHBhZGRpbmc6IDEycHggMThweDtcclxuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XHJcbiAgICBib3gtc2hhZG93OiAwIDhweCAyMHB4IHJnYmEoNiwgMTgyLCAyMTIsIDAuMjgpO1xyXG4gICAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDAuMnMgZWFzZSwgZmlsdGVyIDAuMnMgZWFzZSwgYm94LXNoYWRvdyAwLjJzIGVhc2U7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtZmVhdHVyZWRDdGE6aG92ZXIsXHJcbiAgLnN1LWhvbWUgLnN1LWZlYXR1cmVkQ3RhOmFjdGl2ZSB7XHJcbiAgICBmaWx0ZXI6IGJyaWdodG5lc3MoMS4wNSk7XHJcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTJweCk7XHJcbiAgICBib3gtc2hhZG93OiAwIDEwcHggMjRweCByZ2JhKDE1LCAyMywgNDIsIDAuMTApLCAwIDEwcHggMjRweCByZ2JhKDYsIDE4MiwgMjEyLCAwLjIyKTtcclxuICB9XHJcblxyXG4gIC5zdS1ob21lIC5zdS1wYW5lbCxcclxuICAuc3UtaG9tZSAuc3Utbm90aWNlQm9keSxcclxuICAuc3UtaG9tZSAuc3UtbWlzc2lvbkV2ZW50Q2FyZCB7XHJcbiAgICBiYWNrZ3JvdW5kOiByZ2JhKDE3LCAyNCwgMzksIDAuODgpO1xyXG4gICAgYm9yZGVyLWNvbG9yOiByZ2JhKDAsIDI1NSwgMjAwLCAwLjEyKTtcclxuICAgIGJveC1zaGFkb3c6IDAgMCAxMHB4IHJnYmEoMCwgMjU1LCAyMDAsIDAuMDgpO1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LXBhbmVsVGl0bGUsXHJcbiAgLnN1LWhvbWUgLnN1LWNhcmRUaXRsZSxcclxuICAuc3UtaG9tZSAuc3Utbm90aWNlVGl0bGUge1xyXG4gICAgY29sb3I6ICNmZmZmZmY7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtY2FyZFN1YixcclxuICAuc3UtaG9tZSAuc3Utbm90aWNlVGV4dCxcclxuICAuc3UtaG9tZSAuc3Utbm90aWNlTWV0YSxcclxuICAuc3UtaG9tZSAuc3UtY2FyZE1ldGEsXHJcbiAgLnN1LWhvbWUgLnN1LXBhbmVsTW9yZSB7XHJcbiAgICBjb2xvcjogIzljYTNhZjtcclxuICB9XHJcblxyXG4gIC5zdS1ob21lIC5zdS1tb2RhbC1jb250ZW50LFxyXG4gIC5zdS1ob21lIC5zdS1tb2RhbC1jb250ZW50LS1taXNzaW9uIHtcclxuICAgIGJhY2tncm91bmQ6ICNmZmZmZmY7XHJcbiAgICBjb2xvcjogIzExMTgyNztcclxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMTUsIDIzLCA0MiwgMC4xKTtcclxuICAgIGJveC1zaGFkb3c6IDAgMTZweCA0MHB4IHJnYmEoMTUsIDIzLCA0MiwgMC4xOCk7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtbW9kYWwtY29udGVudCAqLFxyXG4gIC5zdS1ob21lIC5zdS1tb2RhbC1jb250ZW50LS1taXNzaW9uICoge1xyXG4gICAgY29sb3I6ICMxMTE4Mjc7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtbW9kYWwtYm9keSB7XHJcbiAgICBjb2xvcjogIzM3NDE1MTtcclxuICAgIGZvbnQtc2l6ZTogMTVweDtcclxuICAgIGxpbmUtaGVpZ2h0OiAxLjY7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtbW9kYWwtdGl0bGUge1xyXG4gICAgZm9udC1zaXplOiAyMHB4O1xyXG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcclxuICAgIGNvbG9yOiAjMTExODI3O1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LW1vZGFsLWJvZHkgPiBkaXY6bnRoLWNoaWxkKDIpIHtcclxuICAgIGNvbG9yOiAjNmI3MjgwO1xyXG4gICAgZm9udC1zaXplOiAxM3B4O1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LW1vZGFsLWNvbmZpcm1CdG4ge1xyXG4gICAgYmFja2dyb3VuZDogIzE0YjhhNjtcclxuICAgIGNvbG9yOiAjZmZmZmZmICFpbXBvcnRhbnQ7XHJcbiAgICBib3JkZXItcmFkaXVzOiAxMnB4O1xyXG4gICAgZm9udC13ZWlnaHQ6IDYwMDtcclxuICB9XHJcblxyXG4gIC5zdS1ob21lIC5zdS1tb2RhbC1jbG9zZSB7XHJcbiAgICBiYWNrZ3JvdW5kOiAjZjFmNWY5O1xyXG4gICAgY29sb3I6ICMxMTE4MjcgIWltcG9ydGFudDtcclxuICAgIGJvcmRlci1yYWRpdXM6IDEwcHg7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtbW9kYWwtb3ZlcmxheSAuc3UtbW9kYWwtY29udGVudCB7XHJcbiAgICBiYWNrZ3JvdW5kOiAjZmZmZmZmICFpbXBvcnRhbnQ7XHJcbiAgICBjb2xvcjogIzExMTgyNyAhaW1wb3J0YW50O1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LW1vZGFsLW92ZXJsYXkgLnN1LW1vZGFsLWNvbnRlbnQgKiB7XHJcbiAgICBjb2xvcjogIzExMTgyNyAhaW1wb3J0YW50O1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LW1vZGFsLW92ZXJsYXkgLnN1LW1vZGFsLWNvbnRlbnQgLnN1LW1vZGFsLXRpdGxlLFxyXG4gIC5zdS1ob21lIC5zdS1tb2RhbC1vdmVybGF5IC5zdS1tb2RhbC1jb250ZW50IGgxLFxyXG4gIC5zdS1ob21lIC5zdS1tb2RhbC1vdmVybGF5IC5zdS1tb2RhbC1jb250ZW50IGgyLFxyXG4gIC5zdS1ob21lIC5zdS1tb2RhbC1vdmVybGF5IC5zdS1tb2RhbC1jb250ZW50IGgzIHtcclxuICAgIGNvbG9yOiAjMTExODI3ICFpbXBvcnRhbnQ7XHJcbiAgICBmb250LXdlaWdodDogNzAwO1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LW1vZGFsLW92ZXJsYXkgLnN1LW1vZGFsLWNvbnRlbnQgcCxcclxuICAuc3UtaG9tZSAuc3UtbW9kYWwtb3ZlcmxheSAuc3UtbW9kYWwtY29udGVudCBzcGFuLFxyXG4gIC5zdS1ob21lIC5zdS1tb2RhbC1vdmVybGF5IC5zdS1tb2RhbC1jb250ZW50IGRpdiB7XHJcbiAgICBjb2xvcjogIzM3NDE1MSAhaW1wb3J0YW50O1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LW1vZGFsLW92ZXJsYXkgLnN1LW1vZGFsLWNvbnRlbnQgLnN1LW1vZGFsLWJvZHkgPiBkaXY6bnRoLWNoaWxkKDIpIHtcclxuICAgIGNvbG9yOiAjNmI3MjgwICFpbXBvcnRhbnQ7XHJcbiAgICBmb250LXNpemU6IDEzcHg7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtbW9kYWwtb3ZlcmxheSAuc3UtbW9kYWwtY29udGVudCAuc3UtbW9kYWwtY29uZmlybUJ0bixcclxuICAuc3UtaG9tZSAuc3UtbW9kYWwtb3ZlcmxheSAuc3UtbW9kYWwtY29udGVudCBidXR0b24uc3UtbW9kYWwtY29uZmlybUJ0biB7XHJcbiAgICBiYWNrZ3JvdW5kOiAjMTRiOGE2ICFpbXBvcnRhbnQ7XHJcbiAgICBjb2xvcjogI2ZmZmZmZiAhaW1wb3J0YW50O1xyXG4gICAgYm9yZGVyLXJhZGl1czogMTJweDtcclxuICAgIGZvbnQtd2VpZ2h0OiA2MDA7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtbW9kYWwtb3ZlcmxheSAuc3UtbW9kYWwtY29udGVudCAuc3UtbW9kYWwtY2FuY2VsQnRuIHtcclxuICAgIGNvbG9yOiAjMTExODI3ICFpbXBvcnRhbnQ7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtbW9kYWwtb3ZlcmxheSAuc3UtbW9kYWwtY29udGVudCAuc3UtbW9kYWwtY2xvc2Uge1xyXG4gICAgYmFja2dyb3VuZDogI2YxZjVmOSAhaW1wb3J0YW50O1xyXG4gICAgY29sb3I6ICMxMTE4MjcgIWltcG9ydGFudDtcclxuICB9XHJcblxyXG4gIC5zdS1ob21lIC5zdS1ub3RpY2VCb2R5IHtcclxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcclxuICAgIGN1cnNvcjogcG9pbnRlcjtcclxuICB9XHJcblxyXG4gIC5zdS1ob21lIC5zdS1ub3RpY2VCb2R5ID4gLnN1LW5vdGljZVRpdGxlLFxyXG4gIC5zdS1ob21lIC5zdS1ub3RpY2VCb2R5ID4gLnN1LW5vdGljZU1ldGEge1xyXG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3Utbm90aWNlQm9keSA+IC5zdS1ub3RpY2VUZXh0IHtcclxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICAgIGluc2V0OiAwO1xyXG4gICAgbWFyZ2luLXRvcDogMCAhaW1wb3J0YW50O1xyXG4gICAgcGFkZGluZzogMTBweCA4cHggOHB4O1xyXG4gICAgZGlzcGxheTogYmxvY2s7XHJcbiAgICAtd2Via2l0LWxpbmUtY2xhbXA6IHVuc2V0O1xyXG4gICAgbGluZS1oZWlnaHQ6IDEuNjtcclxuICAgIGN1cnNvcjogcG9pbnRlcjtcclxuICAgIGNvbG9yOiB0cmFuc3BhcmVudDtcclxuICAgIHotaW5kZXg6IDU7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3Utbm90aWNlQm9keSA+IC5zdS1ub3RpY2VUZXh0OjpiZWZvcmUge1xyXG4gICAgY29udGVudDogXCJcIjtcclxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICAgIGluc2V0OiAwO1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LXBhbmVsIC5zdS1jYXJvdXNlbCB7XHJcbiAgICBtYXJnaW4tdG9wOiAwO1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LXBhbmVsLS1saXZlIC5zdS1saXZlUmFpbCxcclxuICAuc3UtaG9tZSAuc3UtcGFuZWwgLnN1LWZlZWRHcmlkIHtcclxuICAgIGRpc3BsYXk6IGdyaWQ7XHJcbiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgyLCBtaW5tYXgoMCwgMWZyKSk7XHJcbiAgICBnYXA6IDhweDtcclxuICB9XHJcblxyXG4gIC5zdS1ob21lIC5zdS1wYW5lbC0tbGl2ZSAuc3UtbGl2ZUNhcmQsXHJcbiAgLnN1LWhvbWUgLnN1LXBhbmVsIC5zdS1mZWVkQ2FyZCB7XHJcbiAgICBtaW4td2lkdGg6IDA7XHJcbiAgICB3aWR0aDogMTAwJTtcclxuICAgIGhlaWdodDogMTE4cHg7XHJcbiAgICBib3JkZXItcmFkaXVzOiAxNHB4O1xyXG4gICAgcGFkZGluZzogMTJweDtcclxuICAgIGRpc3BsYXk6IGZsZXg7XHJcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xyXG4gICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xyXG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcclxuICB9XHJcblxyXG4gIC5zdS1ob21lIC5zdS1wYW5lbC0tbGl2ZSAuc3UtbGl2ZUJhZGdlLFxyXG4gIC5zdS1ob21lIC5zdS1wYW5lbCAuc3UtZmVlZEJhZGdlIHtcclxuICAgIGZvbnQtc2l6ZTogMTBweDtcclxuICAgIHBhZGRpbmc6IDNweCA2cHg7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtcGFuZWwtLWxpdmUgLnN1LWxpdmVUaXRsZSxcclxuICAuc3UtaG9tZSAuc3UtcGFuZWwgLnN1LWZlZWRUaXRsZSB7XHJcbiAgICBmb250LXNpemU6IDE0cHg7XHJcbiAgICBsaW5lLWhlaWdodDogMS4zO1xyXG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcclxuICAgIG1hcmdpbi10b3A6IDZweDtcclxuICAgIGNvbG9yOiAjMTExODI3O1xyXG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcclxuICAgIGRpc3BsYXk6IC13ZWJraXQtYm94O1xyXG4gICAgLXdlYmtpdC1saW5lLWNsYW1wOiAxO1xyXG4gICAgLXdlYmtpdC1ib3gtb3JpZW50OiB2ZXJ0aWNhbDtcclxuICB9XHJcblxyXG4gIC5zdS1ob21lIC5zdS1wYW5lbC0tbGl2ZSAuc3UtbGl2ZVN1YixcclxuICAuc3UtaG9tZSAuc3UtcGFuZWwgLnN1LWZlZWRTdWIge1xyXG4gICAgZm9udC1zaXplOiAxMnB4O1xyXG4gICAgbGluZS1oZWlnaHQ6IDEuMzU7XHJcbiAgICBjb2xvcjogIzZiNzI4MDtcclxuICAgIG1hcmdpbi10b3A6IDRweDtcclxuICAgIG92ZXJmbG93OiBoaWRkZW47XHJcbiAgICBkaXNwbGF5OiAtd2Via2l0LWJveDtcclxuICAgIC13ZWJraXQtbGluZS1jbGFtcDogMTtcclxuICAgIC13ZWJraXQtYm94LW9yaWVudDogdmVydGljYWw7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtcGFuZWwgLnN1LWNhcm91c2VsX192aWV3cG9ydCB7XHJcbiAgICBvdmVyZmxvdy14OiBhdXRvO1xyXG4gICAgcGFkZGluZzogMnB4IDAgMnB4O1xyXG4gICAgc2Nyb2xsYmFyLXdpZHRoOiB0aGluO1xyXG4gICAgc2Nyb2xsLXNuYXAtdHlwZTogeCBwcm94aW1pdHk7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtcGFuZWwgLnN1LWNhcm91c2VsX190cmFjayB7XHJcbiAgICBkaXNwbGF5OiBmbGV4O1xyXG4gICAgZ2FwOiAxMHB4O1xyXG4gICAgYWxpZ24taXRlbXM6IHN0cmV0Y2g7XHJcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtc3RhcnQ7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtcGFuZWwgLnN1LWNhcm91c2VsX190cmFjayA+IC5zdS1jYXJvdXNlbENhcmQ6b25seS1jaGlsZCxcclxuICAuc3UtaG9tZSAuc3UtcGFuZWwgLnN1LWNhcm91c2VsX190cmFjayA+IC5zdS1saXZlQ2FyZDpvbmx5LWNoaWxkIHtcclxuICAgIG1hcmdpbi1sZWZ0OiBhdXRvO1xyXG4gICAgbWFyZ2luLXJpZ2h0OiBhdXRvO1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LXBhbmVsIC5zdS1jYXJvdXNlbF9fdHJhY2s6ZW1wdHkge1xyXG4gICAgZGlzcGxheTogYmxvY2s7XHJcbiAgICBtaW4taGVpZ2h0OiAxOThweDtcclxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcclxuICB9XHJcblxyXG4gIC5zdS1ob21lIC5zdS1wYW5lbCAuc3UtY2Fyb3VzZWxfX3RyYWNrOmVtcHR5OjpiZWZvcmUge1xyXG4gICAgY29udGVudDogXCJcIjtcclxuICAgIGRpc3BsYXk6IGJsb2NrO1xyXG4gICAgbWFyZ2luOiAwIGF1dG87XHJcbiAgICB3aWR0aDogbWluKDI4MHB4LCBjYWxjKDEwMHZ3IC0gNzJweCkpO1xyXG4gICAgbWF4LXdpZHRoOiAzMDBweDtcclxuICAgIGhlaWdodDogMTg4cHg7XHJcbiAgICBiYWNrZ3JvdW5kOiAjZmZmZmZmO1xyXG4gICAgYm9yZGVyLXJhZGl1czogMThweDtcclxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMTUsIDIzLCA0MiwgMC4wNik7XHJcbiAgICBib3gtc2hhZG93OiAwIDhweCAyMHB4IHJnYmEoMTUsIDIzLCA0MiwgMC4wNik7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtcGFuZWwgLnN1LWNhcm91c2VsX190cmFjazplbXB0eTo6YWZ0ZXIge1xyXG4gICAgY29udGVudDogXCLspIDruYQg7KSR7J24IOuwqeyGoVxcQeqzpyDsg4gg7L2Y7YWQ7Lig6rCAIOqzteqwnOuQqeuLiOuLpFxcQVxcQeqzteycoCDrsKnshqFcXEHtg63tlZjrqbQg7Yyd7JeF7Jy866GcIOyerOyDneuQqeuLiOuLpFwiO1xyXG4gICAgd2hpdGUtc3BhY2U6IHByZS1saW5lO1xyXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xyXG4gICAgbGVmdDogNTAlO1xyXG4gICAgdG9wOiAxMHB4O1xyXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC01MCUpO1xyXG4gICAgd2lkdGg6IG1pbigyNDhweCwgY2FsYygxMDB2dyAtIDEwNHB4KSk7XHJcbiAgICBtYXgtd2lkdGg6IDI2OHB4O1xyXG4gICAgbWluLWhlaWdodDogMTY4cHg7XHJcbiAgICBib3JkZXItcmFkaXVzOiAxNHB4O1xyXG4gICAgcGFkZGluZzogMTJweDtcclxuICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxMzVkZWcsICMwZjE3MmEsICMxZTNhOGEpO1xyXG4gICAgY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC45KTtcclxuICAgIGZvbnQtc2l6ZTogMTJweDtcclxuICAgIGZvbnQtd2VpZ2h0OiA1MDA7XHJcbiAgICBsaW5lLWhlaWdodDogMS4zNTtcclxuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtcGFuZWwgLnN1LWNhcm91c2VsQ2FyZCB7XHJcbiAgICBtaW4td2lkdGg6IG1pbigyODBweCwgY2FsYygxMDB2dyAtIDcycHgpKTtcclxuICAgIG1heC13aWR0aDogMzAwcHg7XHJcbiAgICBiYWNrZ3JvdW5kOiAjZmZmZmZmO1xyXG4gICAgYm9yZGVyLXJhZGl1czogMThweDtcclxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMTUsIDIzLCA0MiwgMC4wNik7XHJcbiAgICBib3gtc2hhZG93OiAwIDhweCAyMHB4IHJnYmEoMTUsIDIzLCA0MiwgMC4wNik7XHJcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xyXG4gICAgcGFkZGluZzogOHB4O1xyXG4gICAgc2Nyb2xsLXNuYXAtYWxpZ246IHN0YXJ0O1xyXG4gICAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDAuMnMgZWFzZSwgYm94LXNoYWRvdyAwLjJzIGVhc2U7XHJcbiAgICBjdXJzb3I6IHBvaW50ZXI7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtcGFuZWwgLnN1LWNhcm91c2VsQ2FyZC5zdS1saXZlQ2FyZCB7XHJcbiAgICBib3JkZXItcmFkaXVzOiAxOHB4O1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LXBhbmVsIC5zdS1jYXJvdXNlbENhcmQ6aG92ZXIsXHJcbiAgLnN1LWhvbWUgLnN1LXBhbmVsIC5zdS1jYXJvdXNlbENhcmQ6YWN0aXZlIHtcclxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMnB4KTtcclxuICAgIGJveC1zaGFkb3c6IDAgMTJweCAyNHB4IHJnYmEoMTUsIDIzLCA0MiwgMC4xMCk7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtcGFuZWwgLnN1LWNhcm91c2VsQ2FyZCAuc3UtbGl2ZVRodW1iIHtcclxuICAgIHdpZHRoOiAxMDAlO1xyXG4gICAgYXNwZWN0LXJhdGlvOiAxNiAvIDk7XHJcbiAgICBib3JkZXItcmFkaXVzOiAxNHB4O1xyXG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcclxuICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxMzVkZWcsICMwZjE3MmEsICMxZTNhOGEpO1xyXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LXBhbmVsIC5zdS1jYXJvdXNlbENhcmQgLnN1LWxpdmVUaHVtYjo6YWZ0ZXIge1xyXG4gICAgY29udGVudDogXCJcIjtcclxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICAgIGxlZnQ6IDUwJTtcclxuICAgIHRvcDogNTAlO1xyXG4gICAgd2lkdGg6IDUycHg7XHJcbiAgICBoZWlnaHQ6IDUycHg7XHJcbiAgICBib3JkZXItcmFkaXVzOiA5OTlweDtcclxuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC01MCUpO1xyXG4gICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjE4KTtcclxuICAgIGJhY2tkcm9wLWZpbHRlcjogYmx1cig2cHgpO1xyXG4gICAgLXdlYmtpdC1iYWNrZHJvcC1maWx0ZXI6IGJsdXIoNnB4KTtcclxuICAgIGJveC1zaGFkb3c6IDAgOHB4IDE4cHggcmdiYSgxNSwgMjMsIDQyLCAwLjI0KTtcclxuICAgIHotaW5kZXg6IDI7XHJcbiAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcclxuICB9XHJcblxyXG4gIC5zdS1ob21lIC5zdS1wYW5lbCAuc3UtY2Fyb3VzZWxDYXJkIC5zdS1saXZlVGh1bWI6OmJlZm9yZSB7XHJcbiAgICBjb250ZW50OiBcIlwiO1xyXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xyXG4gICAgbGVmdDogNTAlO1xyXG4gICAgdG9wOiA1MCU7XHJcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNDAlLCAtNTAlKTtcclxuICAgIGJvcmRlci10b3A6IDlweCBzb2xpZCB0cmFuc3BhcmVudDtcclxuICAgIGJvcmRlci1ib3R0b206IDlweCBzb2xpZCB0cmFuc3BhcmVudDtcclxuICAgIGJvcmRlci1sZWZ0OiAxNHB4IHNvbGlkICNmZmZmZmY7XHJcbiAgICB6LWluZGV4OiAzO1xyXG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtcGFuZWwgLnN1LWNhcm91c2VsQ2FyZCAuc3UtbGl2ZVRodW1iID4gc3BhbiB7XHJcbiAgICBvcGFjaXR5OiAwO1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LXBhbmVsIC5zdS1jYXJvdXNlbENhcmQgLnN1LWxpdmVUaHVtYiBpbWcsXHJcbiAgLnN1LWhvbWUgLnN1LXBhbmVsIC5zdS1jYXJvdXNlbENhcmQgLnN1LWxpdmVUaHVtYiB2aWRlbyxcclxuICAuc3UtaG9tZSAuc3UtcGFuZWwgLnN1LWNhcm91c2VsQ2FyZCAuc3UtbGl2ZVRodW1iIGlmcmFtZSB7XHJcbiAgICB3aWR0aDogMTAwJTtcclxuICAgIGhlaWdodDogMTAwJTtcclxuICAgIG9iamVjdC1maXQ6IGNvdmVyO1xyXG4gICAgZGlzcGxheTogYmxvY2s7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtcGFuZWwgLnN1LWNhcm91c2VsQ2FyZCAuc3UtbGl2ZVRpdGxlIHtcclxuICAgIG1hcmdpbi10b3A6IDhweDtcclxuICAgIGNvbG9yOiAjMTExODI3O1xyXG4gICAgZm9udC1zaXplOiAxNXB4O1xyXG4gICAgbGluZS1oZWlnaHQ6IDEuMztcclxuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XHJcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xyXG4gICAgZGlzcGxheTogLXdlYmtpdC1ib3g7XHJcbiAgICAtd2Via2l0LWxpbmUtY2xhbXA6IDE7XHJcbiAgICAtd2Via2l0LWJveC1vcmllbnQ6IHZlcnRpY2FsO1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LXBhbmVsIC5zdS1jYXJvdXNlbENhcmQgLnN1LWxpdmVUaXRsZSArIC5zdS1saXZlU3ViLFxyXG4gIC5zdS1ob21lIC5zdS1wYW5lbCAuc3UtY2Fyb3VzZWxDYXJkIC5zdS1saXZlU3ViIHtcclxuICAgIGNvbG9yOiAjNmI3MjgwO1xyXG4gICAgZm9udC1zaXplOiAxMnB4O1xyXG4gICAgZm9udC13ZWlnaHQ6IDUwMDtcclxuICAgIG1hcmdpbi10b3A6IDJweDtcclxuICAgIG92ZXJmbG93OiBoaWRkZW47XHJcbiAgICBkaXNwbGF5OiAtd2Via2l0LWJveDtcclxuICAgIC13ZWJraXQtbGluZS1jbGFtcDogMTtcclxuICAgIC13ZWJraXQtYm94LW9yaWVudDogdmVydGljYWw7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtcGFuZWwgLnN1LWNhcm91c2VsQ2FyZCAuc3UtbGl2ZVRpdGxlOjphZnRlciB7XHJcbiAgICBjb250ZW50OiBcIu2Dre2VmOuptCDsnqzsg53rkKnri4jri6RcIjtcclxuICAgIGRpc3BsYXk6IGJsb2NrO1xyXG4gICAgbWFyZ2luLXRvcDogMnB4O1xyXG4gICAgZm9udC1zaXplOiAxMXB4O1xyXG4gICAgZm9udC13ZWlnaHQ6IDUwMDtcclxuICAgIGNvbG9yOiAjNmI3MjgwO1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LXBhbmVsOm50aC1vZi10eXBlKDYpIC5zdS1jYXJvdXNlbF9fdHJhY2s6ZW1wdHk6OmFmdGVyIHtcclxuICAgIGNvbnRlbnQ6IFwi7KSA67mEIOykkeyduCDsmKTrlJTshZhcXEHqs6cg7IOIIOyYgeyDgeydtCDqs7XqsJzrkKnri4jri6RcXEFcXEHsmKTrlJTshZhcXEHsnZHrqqggwrcgVE9QMyDtiKztkZxcIjtcclxuICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxMzVkZWcsICMxZjExNDcsICM1YjIxYjYpO1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LXBhbmVsIC5zdS1jYXJvdXNlbENhcmQgLnN1LWVtcHR5U3RhdGUge1xyXG4gICAgd2lkdGg6IDEwMCU7XHJcbiAgICBtaW4taGVpZ2h0OiAxNDhweDtcclxuICAgIGJvcmRlci1yYWRpdXM6IDE0cHg7XHJcbiAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjMGYxNzJhLCAjMWUzYThhKTtcclxuICAgIGRpc3BsYXk6IGZsZXg7XHJcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xyXG4gICAgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7XHJcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtZW5kO1xyXG4gICAgZ2FwOiA2cHg7XHJcbiAgICBwYWRkaW5nOiAxNnB4O1xyXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xyXG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcclxuICB9XHJcblxyXG4gIC5zdS1ob21lIC5zdS1wYW5lbCAuc3UtY2Fyb3VzZWxDYXJkIC5zdS1lbXB0eVN0YXRlOjphZnRlciB7XHJcbiAgICBjb250ZW50OiBcIlwiO1xyXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xyXG4gICAgbGVmdDogNTAlO1xyXG4gICAgdG9wOiA0MiU7XHJcbiAgICB3aWR0aDogNDBweDtcclxuICAgIGhlaWdodDogNDBweDtcclxuICAgIGJvcmRlci1yYWRpdXM6IDk5OXB4O1xyXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSk7XHJcbiAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMTgpO1xyXG4gICAgYmFja2Ryb3AtZmlsdGVyOiBibHVyKDZweCk7XHJcbiAgICAtd2Via2l0LWJhY2tkcm9wLWZpbHRlcjogYmx1cig2cHgpO1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LXBhbmVsIC5zdS1jYXJvdXNlbENhcmQgLnN1LWVtcHR5U3RhdGVfX3RpdGxlIHtcclxuICAgIGNvbG9yOiAjZmZmZmZmO1xyXG4gICAgZm9udC1zaXplOiAxNHB4O1xyXG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcclxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcclxuICAgIHotaW5kZXg6IDE7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtcGFuZWwgLnN1LWNhcm91c2VsQ2FyZCAuc3UtZW1wdHlTdGF0ZV9fc3ViIHtcclxuICAgIGNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuODQpO1xyXG4gICAgZm9udC1zaXplOiAxMnB4O1xyXG4gICAgZm9udC13ZWlnaHQ6IDUwMDtcclxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcclxuICAgIHotaW5kZXg6IDE7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtcGFuZWwgLnN1LWNhcm91c2VsQ2FyZDpudGgtY2hpbGQoMm4pIC5zdS1saXZlVGh1bWIge1xyXG4gICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgIzFmMTE0NywgIzViMjFiNik7XHJcbiAgfVxyXG5cclxuICAvKiBIb21lIHNlcnZpY2UtYXBwIG92ZXJyaWRlcyAqL1xyXG4gIC5zdS1hcHBTaGVsbC5zdS1hcHAge1xyXG4gICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDE4MGRlZywgI2Y1ZjdmYiAwJSwgI2Y4ZmFmYyAxMDAlKSAhaW1wb3J0YW50O1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUge1xyXG4gICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQgIWltcG9ydGFudDtcclxuICAgIGNvbG9yOiAjMGYxNzJhICFpbXBvcnRhbnQ7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtdGlsZXMge1xyXG4gICAgZ2FwOiAxMnB4ICFpbXBvcnRhbnQ7XHJcbiAgICBwYWRkaW5nOiA4cHggMTZweCAyNHB4ICFpbXBvcnRhbnQ7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtdGlsZSxcclxuICAuc3UtaG9tZSAuc3UtdGlsZS0tY3lhbixcclxuICAuc3UtaG9tZSAuc3UtdGlsZS0tdGVhbCxcclxuICAuc3UtaG9tZSAuc3UtdGlsZS0tcGluayxcclxuICAuc3UtaG9tZSAuc3UtdGlsZS0tdmlvbGV0LFxyXG4gIC5zdS1ob21lIC5zdS10aWxlLS1vcmFuZ2UsXHJcbiAgLnN1LWhvbWUgLnN1LXRpbGUtLWluZGlnbyxcclxuICAuc3UtaG9tZSAuc3UtdGlsZS0tcmVkLFxyXG4gIC5zdS1ob21lIC5zdS10aWxlLS1uYXZ5IHtcclxuICAgIGJhY2tncm91bmQ6ICNmZmZmZmYgIWltcG9ydGFudDtcclxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMTUsIDIzLCA0MiwgMC4wNikgIWltcG9ydGFudDtcclxuICAgIGJvcmRlci1yYWRpdXM6IDIwcHggIWltcG9ydGFudDtcclxuICAgIGJveC1zaGFkb3c6IDAgOHB4IDE4cHggcmdiYSgxNSwgMjMsIDQyLCAwLjA1KSAhaW1wb3J0YW50O1xyXG4gICAgdHJhbnNmb3JtOiBub25lICFpbXBvcnRhbnQ7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtdGlsZTo6YmVmb3JlIHtcclxuICAgIGRpc3BsYXk6IG5vbmUgIWltcG9ydGFudDtcclxuICB9XHJcblxyXG4gIC5zdS1ob21lIC5zdS10aWxlOmhvdmVyLFxyXG4gIC5zdS1ob21lIC5zdS10aWxlOmFjdGl2ZSB7XHJcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTFweCkgIWltcG9ydGFudDtcclxuICAgIGJveC1zaGFkb3c6IDAgMTBweCAyMnB4IHJnYmEoMTUsIDIzLCA0MiwgMC4wOCkgIWltcG9ydGFudDtcclxuICAgIGJvcmRlci1jb2xvcjogcmdiYSgxNSwgMjMsIDQyLCAwLjA2KSAhaW1wb3J0YW50O1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LXRpbGVfX2ljb24ge1xyXG4gICAgd2lkdGg6IDQ2cHggIWltcG9ydGFudDtcclxuICAgIG1pbi13aWR0aDogNDZweCAhaW1wb3J0YW50O1xyXG4gICAgaGVpZ2h0OiA0NnB4ICFpbXBvcnRhbnQ7XHJcbiAgICBib3JkZXItcmFkaXVzOiAxNHB4ICFpbXBvcnRhbnQ7XHJcbiAgICBkaXNwbGF5OiBmbGV4ICFpbXBvcnRhbnQ7XHJcbiAgICBhbGlnbi1pdGVtczogY2VudGVyICFpbXBvcnRhbnQ7XHJcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlciAhaW1wb3J0YW50O1xyXG4gICAgYmFja2dyb3VuZDogI2Y4ZmFmYyAhaW1wb3J0YW50O1xyXG4gICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgxNSwgMjMsIDQyLCAwLjA1KSAhaW1wb3J0YW50O1xyXG4gICAgYm94LXNoYWRvdzogaW5zZXQgMCAxcHggMCByZ2JhKDI1NSwyNTUsMjU1LDAuOCkgIWltcG9ydGFudDtcclxuICAgIGZvbnQtc2l6ZTogMjBweCAhaW1wb3J0YW50O1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LXRpbGVfX3RleHQge1xyXG4gICAgZ2FwOiAycHggIWltcG9ydGFudDtcclxuICAgIG1pbi13aWR0aDogMCAhaW1wb3J0YW50O1xyXG4gICAgZmxleDogMSAxIGF1dG8gIWltcG9ydGFudDtcclxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyICFpbXBvcnRhbnQ7XHJcbiAgICBhbGlnbi1pdGVtczogY2VudGVyICFpbXBvcnRhbnQ7XHJcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXIgIWltcG9ydGFudDtcclxuICAgIHBhZGRpbmctcmlnaHQ6IDRweCAhaW1wb3J0YW50O1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LXRpbGVfX3RpdGxlIHtcclxuICAgIGZvbnQtc2l6ZTogMTZweCAhaW1wb3J0YW50O1xyXG4gICAgZm9udC13ZWlnaHQ6IDcwMCAhaW1wb3J0YW50O1xyXG4gICAgY29sb3I6ICMxZTI5M2IgIWltcG9ydGFudDtcclxuICAgIGxldHRlci1zcGFjaW5nOiAtMC4wMmVtICFpbXBvcnRhbnQ7XHJcbiAgICBsaW5lLWhlaWdodDogMS4yMiAhaW1wb3J0YW50O1xyXG4gICAgbWluLWhlaWdodDogY2FsYygxLjIyZW0gKiAyKSAhaW1wb3J0YW50O1xyXG4gICAgZGlzcGxheTogLXdlYmtpdC1ib3ggIWltcG9ydGFudDtcclxuICAgIC13ZWJraXQtbGluZS1jbGFtcDogMiAhaW1wb3J0YW50O1xyXG4gICAgLXdlYmtpdC1ib3gtb3JpZW50OiB2ZXJ0aWNhbCAhaW1wb3J0YW50O1xyXG4gICAgb3ZlcmZsb3c6IGhpZGRlbiAhaW1wb3J0YW50O1xyXG4gICAgd29yZC1icmVhazoga2VlcC1hbGwgIWltcG9ydGFudDtcclxuICAgIG92ZXJmbG93LXdyYXA6IG5vcm1hbCAhaW1wb3J0YW50O1xyXG4gICAgdGV4dC1hbGlnbjogY2VudGVyICFpbXBvcnRhbnQ7XHJcbiAgICB3aWR0aDogMTAwJSAhaW1wb3J0YW50O1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LXRpbGVfX3N1YiB7XHJcbiAgICBmb250LXNpemU6IDEycHggIWltcG9ydGFudDtcclxuICAgIGZvbnQtd2VpZ2h0OiA1MDAgIWltcG9ydGFudDtcclxuICAgIGNvbG9yOiAjNjQ3NDhiICFpbXBvcnRhbnQ7XHJcbiAgICBsaW5lLWhlaWdodDogMS4zICFpbXBvcnRhbnQ7XHJcbiAgICBkaXNwbGF5OiAtd2Via2l0LWJveCAhaW1wb3J0YW50O1xyXG4gICAgLXdlYmtpdC1saW5lLWNsYW1wOiAxICFpbXBvcnRhbnQ7XHJcbiAgICAtd2Via2l0LWJveC1vcmllbnQ6IHZlcnRpY2FsICFpbXBvcnRhbnQ7XHJcbiAgICBvdmVyZmxvdzogaGlkZGVuICFpbXBvcnRhbnQ7XHJcbiAgICB3b3JkLWJyZWFrOiBrZWVwLWFsbCAhaW1wb3J0YW50O1xyXG4gICAgdGV4dC1hbGlnbjogY2VudGVyICFpbXBvcnRhbnQ7XHJcbiAgICB3aWR0aDogMTAwJSAhaW1wb3J0YW50O1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LXRpbGUtLWN5YW4gLnN1LXRpbGVfX2ljb24geyBjb2xvcjogIzNiODJmNiAhaW1wb3J0YW50OyB9XHJcbiAgLnN1LWhvbWUgLnN1LXRpbGUtLXRlYWwgLnN1LXRpbGVfX2ljb24geyBjb2xvcjogIzE0YjhhNiAhaW1wb3J0YW50OyB9XHJcbiAgLnN1LWhvbWUgLnN1LXRpbGUtLXBpbmsgLnN1LXRpbGVfX2ljb24geyBjb2xvcjogI2VjNDg5OSAhaW1wb3J0YW50OyB9XHJcbiAgLnN1LWhvbWUgLnN1LXRpbGUtLXZpb2xldCAuc3UtdGlsZV9faWNvbiB7IGNvbG9yOiAjOGI1Y2Y2ICFpbXBvcnRhbnQ7IH1cclxuICAuc3UtaG9tZSAuc3UtdGlsZS0tb3JhbmdlIC5zdS10aWxlX19pY29uIHsgY29sb3I6ICNmNTllMGIgIWltcG9ydGFudDsgfVxyXG4gIC5zdS1ob21lIC5zdS10aWxlLS1pbmRpZ28gLnN1LXRpbGVfX2ljb24geyBjb2xvcjogIzYzNjZmMSAhaW1wb3J0YW50OyB9XHJcbiAgLnN1LWhvbWUgLnN1LXRpbGUtLXJlZCAuc3UtdGlsZV9faWNvbiB7IGNvbG9yOiAjZWY0NDQ0ICFpbXBvcnRhbnQ7IH1cclxuICAuc3UtaG9tZSAuc3UtdGlsZS0tbmF2eSAuc3UtdGlsZV9faWNvbiB7IGNvbG9yOiAjMzM0MTU1ICFpbXBvcnRhbnQ7IH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LWZlYXR1cmVkQ2FyZCxcclxuICAuc3UtaG9tZSAuc3UtZmVhdHVyZWRDYXJkLnN1LWZlYXR1cmVkQ2FyZC0tY29tcGFjdCxcclxuICAuc3UtaG9tZSAuc3UtZmVhdHVyZWRDYXJkLnN1LWZlYXR1cmVkQ2FyZC0tZXZlbnQge1xyXG4gICAgYmFja2dyb3VuZDogI2ZmZmZmZiAhaW1wb3J0YW50O1xyXG4gICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgxNSwgMjMsIDQyLCAwLjA2KSAhaW1wb3J0YW50O1xyXG4gICAgYm9yZGVyLXJhZGl1czogMjBweCAhaW1wb3J0YW50O1xyXG4gICAgcGFkZGluZzogMTZweCAhaW1wb3J0YW50O1xyXG4gICAgYm94LXNoYWRvdzogMCA4cHggMThweCByZ2JhKDE1LCAyMywgNDIsIDAuMDUpICFpbXBvcnRhbnQ7XHJcbiAgICBkaXNwbGF5OiBmbGV4ICFpbXBvcnRhbnQ7XHJcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uICFpbXBvcnRhbnQ7XHJcbiAgICBhbGlnbi1pdGVtczogY2VudGVyICFpbXBvcnRhbnQ7XHJcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXIgIWltcG9ydGFudDtcclxuICAgIGdhcDogNnB4ICFpbXBvcnRhbnQ7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtZmVhdHVyZWRDYXJkLS1oYWxmIHtcclxuICAgIG1pbi1oZWlnaHQ6IDE1NnB4ICFpbXBvcnRhbnQ7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtZmVhdHVyZWRDYXJkOjpiZWZvcmUsXHJcbiAgLnN1LWhvbWUgLnN1LWZlYXR1cmVkQ2FyZDo6YWZ0ZXIge1xyXG4gICAgZGlzcGxheTogbm9uZSAhaW1wb3J0YW50O1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LWZlYXR1cmVkQ2FyZDpob3ZlcixcclxuICAuc3UtaG9tZSAuc3UtZmVhdHVyZWRDYXJkOmFjdGl2ZSB7XHJcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTFweCkgIWltcG9ydGFudDtcclxuICAgIGJveC1zaGFkb3c6IDAgMTBweCAyMnB4IHJnYmEoMTUsIDIzLCA0MiwgMC4wOCkgIWltcG9ydGFudDtcclxuICB9XHJcblxyXG4gIC5zdS1ob21lIC5zdS1mZWF0dXJlZEJhZGdlIHtcclxuICAgIGFsaWduLXNlbGY6IGNlbnRlciAhaW1wb3J0YW50O1xyXG4gICAgbWFyZ2luLWJvdHRvbTogOHB4ICFpbXBvcnRhbnQ7XHJcbiAgICBwYWRkaW5nOiA1cHggMTBweCAhaW1wb3J0YW50O1xyXG4gICAgYm9yZGVyLXJhZGl1czogOTk5cHggIWltcG9ydGFudDtcclxuICAgIGJhY2tncm91bmQ6IHJnYmEoMjAsIDE4NCwgMTY2LCAwLjEwKSAhaW1wb3J0YW50O1xyXG4gICAgY29sb3I6ICMwZjc2NmUgIWltcG9ydGFudDtcclxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjAsIDE4NCwgMTY2LCAwLjIyKSAhaW1wb3J0YW50O1xyXG4gICAgZm9udC1zaXplOiAxMXB4ICFpbXBvcnRhbnQ7XHJcbiAgICBmb250LXdlaWdodDogNzAwICFpbXBvcnRhbnQ7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtZmVhdHVyZWRCYWRnZS0tZXZlbnQge1xyXG4gICAgYmFja2dyb3VuZDogcmdiYSgyNDksIDExNSwgMjIsIDAuMTApICFpbXBvcnRhbnQ7XHJcbiAgICBjb2xvcjogI2Y5NzMxNiAhaW1wb3J0YW50O1xyXG4gICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgyNDksIDExNSwgMjIsIDAuMjIpICFpbXBvcnRhbnQ7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtZmVhdHVyZWRUaXRsZSxcclxuICAuc3UtaG9tZSAuc3UtZmVhdHVyZWRDYXJkLS1oYWxmIC5zdS1mZWF0dXJlZFRpdGxlIHtcclxuICAgIGNvbG9yOiAjMGYxNzJhICFpbXBvcnRhbnQ7XHJcbiAgICBmb250LXNpemU6IDE5cHggIWltcG9ydGFudDtcclxuICAgIGZvbnQtd2VpZ2h0OiA4MDAgIWltcG9ydGFudDtcclxuICAgIGxpbmUtaGVpZ2h0OiAxLjIyICFpbXBvcnRhbnQ7XHJcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXIgIWltcG9ydGFudDtcclxuICAgIHRleHQtc2hhZG93OiBub25lICFpbXBvcnRhbnQ7XHJcbiAgICBtYXJnaW46IDAgIWltcG9ydGFudDtcclxuICAgIG1heC13aWR0aDogbm9uZSAhaW1wb3J0YW50O1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LWZlYXR1cmVkU3ViLFxyXG4gIC5zdS1ob21lIC5zdS1mZWF0dXJlZENhcmQtLWNvbXBhY3QgLnN1LWZlYXR1cmVkU3ViIHtcclxuICAgIGRpc3BsYXk6IGJsb2NrICFpbXBvcnRhbnQ7XHJcbiAgICBtYXJnaW46IDJweCAwIDhweCAwICFpbXBvcnRhbnQ7XHJcbiAgICBjb2xvcjogIzY0NzQ4YiAhaW1wb3J0YW50O1xyXG4gICAgZm9udC1zaXplOiAxM3B4ICFpbXBvcnRhbnQ7XHJcbiAgICBmb250LXdlaWdodDogNTAwICFpbXBvcnRhbnQ7XHJcbiAgICBsaW5lLWhlaWdodDogMS40NSAhaW1wb3J0YW50O1xyXG4gICAgdGV4dC1hbGlnbjogY2VudGVyICFpbXBvcnRhbnQ7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtZmVhdHVyZWRDdGEsXHJcbiAgLnN1LWhvbWUgLnN1LWZlYXR1cmVkQ3RhLS1ldmVudCB7XHJcbiAgICBtYXJnaW4tdG9wOiAxMHB4ICFpbXBvcnRhbnQ7XHJcbiAgICBhbGlnbi1zZWxmOiBjZW50ZXIgIWltcG9ydGFudDtcclxuICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxMzVkZWcsICMxOWM3YjIgMCUsICMyMmQzZWUgNTUlLCAjNDRlN2YyIDEwMCUpICFpbXBvcnRhbnQ7XHJcbiAgICBjb2xvcjogI2ZmZmZmZiAhaW1wb3J0YW50O1xyXG4gICAgYm9yZGVyLXJhZGl1czogOTk5cHggIWltcG9ydGFudDtcclxuICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMjU1LDI1NSwyNTUsMC4xNikgIWltcG9ydGFudDtcclxuICAgIGZvbnQtd2VpZ2h0OiA3MDAgIWltcG9ydGFudDtcclxuICAgIHBhZGRpbmc6IDEwcHggMTZweCAhaW1wb3J0YW50O1xyXG4gICAgYm94LXNoYWRvdzogMCAxMHB4IDIwcHggcmdiYSgzNCwgMjExLCAyMzgsIDAuMjQpLCAwIDNweCAxMHB4IHJnYmEoMTMsIDE0OCwgMTM2LCAwLjE4KSAhaW1wb3J0YW50O1xyXG4gICAgZm9udC1zaXplOiAxNHB4ICFpbXBvcnRhbnQ7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtZmVhdHVyZWRDdGEtLWV2ZW50IHtcclxuICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxMzVkZWcsICNmZjhhNGMgMCUsICNmYjcxODUgNTIlLCAjZjk3MzE2IDEwMCUpICFpbXBvcnRhbnQ7XHJcbiAgICBib3JkZXItY29sb3I6IHJnYmEoMjU1LDI1NSwyNTUsMC4xNCkgIWltcG9ydGFudDtcclxuICAgIGJveC1zaGFkb3c6IDAgMTBweCAyMHB4IHJnYmEoMjQ5LCAxMTUsIDIyLCAwLjI0KSwgMCAzcHggMTBweCByZ2JhKDI0NCwgMTE0LCAxODIsIDAuMTQpICFpbXBvcnRhbnQ7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtZmVhdHVyZWRDdGE6aG92ZXIsXHJcbiAgLnN1LWhvbWUgLnN1LWZlYXR1cmVkQ3RhOmFjdGl2ZSB7XHJcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTFweCkgIWltcG9ydGFudDtcclxuICAgIGZpbHRlcjogYnJpZ2h0bmVzcygxLjA0KSAhaW1wb3J0YW50O1xyXG4gICAgYm94LXNoYWRvdzogMCAxMnB4IDI0cHggcmdiYSgzNCwgMjExLCAyMzgsIDAuMjgpLCAwIDRweCAxMnB4IHJnYmEoMTUsIDIzLCA0MiwgMC4xKSAhaW1wb3J0YW50O1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LWZlYXR1cmVkQ3RhLS1ldmVudDpob3ZlcixcclxuICAuc3UtaG9tZSAuc3UtZmVhdHVyZWRDdGEtLWV2ZW50OmFjdGl2ZSB7XHJcbiAgICBmaWx0ZXI6IGJyaWdodG5lc3MoMS4wNSkgIWltcG9ydGFudDtcclxuICAgIGJveC1zaGFkb3c6IDAgMTJweCAyNHB4IHJnYmEoMjQ5LCAxMTUsIDIyLCAwLjI4KSwgMCA0cHggMTJweCByZ2JhKDE1LCAyMywgNDIsIDAuMSkgIWltcG9ydGFudDtcclxuICB9XHJcblxyXG4gIC5zdS1ob21lIC5zdS1oZXJvMiB7XHJcbiAgICB3aWR0aDogY2FsYygxMDAlIC0gMTZweCkgIWltcG9ydGFudDtcclxuICAgIG1heC13aWR0aDogY2FsYygxMDAlIC0gMTZweCkgIWltcG9ydGFudDtcclxuICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3ggIWltcG9ydGFudDtcclxuICAgIG1hcmdpbjogMCBhdXRvIDE2cHggIWltcG9ydGFudDtcclxuICAgIHBhZGRpbmc6IDE2cHggMThweCAhaW1wb3J0YW50O1xyXG4gICAgYm9yZGVyLXJhZGl1czogMThweCAhaW1wb3J0YW50O1xyXG4gICAgbWluLWhlaWdodDogMCAhaW1wb3J0YW50O1xyXG4gICAgYm94LXNoYWRvdzogMCA2cHggMThweCByZ2JhKDE1LCAyMywgNDIsIDAuMDYpICFpbXBvcnRhbnQ7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtaGVybzIgPiBkaXY6bnRoLW9mLXR5cGUoMykge1xyXG4gICAgd2lkdGg6IDEwMCUgIWltcG9ydGFudDtcclxuICAgIG1heC13aWR0aDogMTAwJSAhaW1wb3J0YW50O1xyXG4gICAgaGVpZ2h0OiBhdXRvICFpbXBvcnRhbnQ7XHJcbiAgICBtaW4taGVpZ2h0OiAwICFpbXBvcnRhbnQ7XHJcbiAgICBhc3BlY3QtcmF0aW86IDQgLyAxICFpbXBvcnRhbnQ7XHJcbiAgICBwb3NpdGlvbjogcmVsYXRpdmUgIWltcG9ydGFudDtcclxuICAgIG92ZXJmbG93OiBoaWRkZW4gIWltcG9ydGFudDtcclxuICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLXItc2VjdGlvbikgIWltcG9ydGFudDtcclxuICAgIGJhY2tncm91bmQ6ICNmM2Y0ZjYgIWltcG9ydGFudDtcclxuICB9XHJcblxyXG4gIC5zdS1ob21lIC5zdS1oZXJvMiA+IGRpdjpudGgtb2YtdHlwZSgzKSA+IGRpdjpmaXJzdC1jaGlsZCB7XHJcbiAgICBwb3NpdGlvbjogYWJzb2x1dGUgIWltcG9ydGFudDtcclxuICAgIGluc2V0OiAwICFpbXBvcnRhbnQ7XHJcbiAgICB3aWR0aDogMTAwJSAhaW1wb3J0YW50O1xyXG4gICAgaGVpZ2h0OiAxMDAlICFpbXBvcnRhbnQ7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtaGVybzIgPiBkaXY6bnRoLW9mLXR5cGUoMykgPiBkaXY6Zmlyc3QtY2hpbGQgPiBkaXYge1xyXG4gICAgcG9zaXRpb246IHJlbGF0aXZlICFpbXBvcnRhbnQ7XHJcbiAgICBtaW4td2lkdGg6IDEwMCUgIWltcG9ydGFudDtcclxuICAgIGhlaWdodDogMTAwJSAhaW1wb3J0YW50O1xyXG4gICAgb3ZlcmZsb3c6IGhpZGRlbiAhaW1wb3J0YW50O1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LWhlcm8yID4gZGl2Om50aC1vZi10eXBlKDMpIGltZyB7XHJcbiAgICBwb3NpdGlvbjogYWJzb2x1dGUgIWltcG9ydGFudDtcclxuICAgIGluc2V0OiAwICFpbXBvcnRhbnQ7XHJcbiAgICB3aWR0aDogMTAwJSAhaW1wb3J0YW50O1xyXG4gICAgaGVpZ2h0OiAxMDAlICFpbXBvcnRhbnQ7XHJcbiAgICBvYmplY3QtZml0OiBjb3ZlciAhaW1wb3J0YW50O1xyXG4gICAgZGlzcGxheTogYmxvY2sgIWltcG9ydGFudDtcclxuICAgIG1heC13aWR0aDogbm9uZSAhaW1wb3J0YW50O1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LXRvcC0taG9tZSB7XHJcbiAgICBwYWRkaW5nOiAycHggMTRweCAhaW1wb3J0YW50O1xyXG4gICAgYm9yZGVyLXJhZGl1czogMThweCAhaW1wb3J0YW50O1xyXG4gICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgIzBmNzY2ZSwgIzE1NWU3NSkgIWltcG9ydGFudDtcclxuICAgIGJveC1zaGFkb3c6IDAgNnB4IDE4cHggcmdiYSgxNSwgMTE4LCAxMTAsIDAuMjIpICFpbXBvcnRhbnQ7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtYnJhbmRSb3cge1xyXG4gICAgZGlzcGxheTogZmxleCAhaW1wb3J0YW50O1xyXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlciAhaW1wb3J0YW50O1xyXG4gICAganVzdGlmeS1jb250ZW50OiBmbGV4LXN0YXJ0ICFpbXBvcnRhbnQ7XHJcbiAgICBnYXA6IDAgIWltcG9ydGFudDtcclxuICAgIGhlaWdodDogNTBweCAhaW1wb3J0YW50O1xyXG4gICAgbWluLWhlaWdodDogNTBweCAhaW1wb3J0YW50O1xyXG4gICAgcGFkZGluZzogMCA2cHggMCAwICFpbXBvcnRhbnQ7XHJcbiAgICBib3JkZXItcmFkaXVzOiAxMnB4ICFpbXBvcnRhbnQ7XHJcbiAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpICFpbXBvcnRhbnQ7XHJcbiAgICBib3gtc2hhZG93OiBpbnNldCAwIDFweCAwIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSkgIWltcG9ydGFudDtcclxuICAgIG92ZXJmbG93OiB2aXNpYmxlICFpbXBvcnRhbnQ7XHJcbiAgICBmbGV4LXdyYXA6IG5vd3JhcCAhaW1wb3J0YW50O1xyXG4gICAgbWFyZ2luLWxlZnQ6IDAgIWltcG9ydGFudDtcclxuICAgIHRleHQtYWxpZ246IGxlZnQgIWltcG9ydGFudDtcclxuICB9XHJcblxyXG4gIC5zdS1ob21lIC5zdS1icmFuZFJvdyA+ICoge1xyXG4gICAgbWFyZ2luOiAwICFpbXBvcnRhbnQ7XHJcbiAgICBwYWRkaW5nOiAwICFpbXBvcnRhbnQ7XHJcbiAgICB0ZXh0LWFsaWduOiBsZWZ0ICFpbXBvcnRhbnQ7XHJcbiAgfVxyXG5cclxuICAuc3UtaG9tZSAuc3UtYnJhbmRSb3cgaW1nLFxyXG4gIC5zdS1ob21lIC5zdS1sb2dvTWFyayxcclxuICAuc3UtaG9tZSAuc3UtbG9nb01hcmsgaW1nIHtcclxuICAgIG1hcmdpbi1sZWZ0OiAwICFpbXBvcnRhbnQ7XHJcbiAgICBwYWRkaW5nLWxlZnQ6IDAgIWltcG9ydGFudDtcclxuICB9XHJcblxyXG4gIC5zdS1ob21lIC5zdS1icmFuZCB7XHJcbiAgICBtYXJnaW4tbGVmdDogLTJweCAhaW1wb3J0YW50O1xyXG4gICAgcGFkZGluZy1sZWZ0OiAwICFpbXBvcnRhbnQ7XHJcbiAgICBtaW4td2lkdGg6IDAgIWltcG9ydGFudDtcclxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXIgIWltcG9ydGFudDtcclxuICAgIGxpbmUtaGVpZ2h0OiAxLjA1ICFpbXBvcnRhbnQ7XHJcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMXB4KSAhaW1wb3J0YW50O1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LWxvZ29NYXJrIHtcclxuICAgIGRpc3BsYXk6IGZsZXggIWltcG9ydGFudDtcclxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXIgIWltcG9ydGFudDtcclxuICAgIGp1c3RpZnktY29udGVudDogZmxleC1zdGFydCAhaW1wb3J0YW50O1xyXG4gICAgb3ZlcmZsb3c6IHZpc2libGUgIWltcG9ydGFudDtcclxuICAgIHdpZHRoOiBhdXRvICFpbXBvcnRhbnQ7XHJcbiAgICBoZWlnaHQ6IDExMnB4ICFpbXBvcnRhbnQ7XHJcbiAgICBmbGV4OiAwIDAgYXV0byAhaW1wb3J0YW50O1xyXG4gICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQgIWltcG9ydGFudDtcclxuICAgIGJvcmRlcjogbm9uZSAhaW1wb3J0YW50O1xyXG4gICAgYm94LXNoYWRvdzogbm9uZSAhaW1wb3J0YW50O1xyXG4gIH1cclxuXHJcbiAgLnN1LWhvbWUgLnN1LWxvZ29NYXJrIGltZyB7XHJcbiAgICBoZWlnaHQ6IDExMnB4ICFpbXBvcnRhbnQ7XHJcbiAgICB3aWR0aDogYXV0byAhaW1wb3J0YW50O1xyXG4gICAgbWF4LWhlaWdodDogMTEycHggIWltcG9ydGFudDtcclxuICAgIG1heC13aWR0aDogbm9uZSAhaW1wb3J0YW50O1xyXG4gICAgb2JqZWN0LWZpdDogY29udGFpbiAhaW1wb3J0YW50O1xyXG4gICAgZGlzcGxheTogYmxvY2sgIWltcG9ydGFudDtcclxuICAgIGZpbHRlcjogZHJvcC1zaGFkb3coMCAycHggNnB4IHJnYmEoMCwgMCwgMCwgMC4zKSkgIWltcG9ydGFudDtcclxuICAgIG1peC1ibGVuZC1tb2RlOiBub3JtYWwgIWltcG9ydGFudDtcclxuICB9XHJcblxyXG4gIC5zdS1ob21lIC5zdS1icmFuZCB7XHJcbiAgICBmb250LXNpemU6IDE4cHggIWltcG9ydGFudDtcclxuICAgIGZvbnQtd2VpZ2h0OiA2MDAgIWltcG9ydGFudDtcclxuICAgIGNvbG9yOiAjZmZmZmZmICFpbXBvcnRhbnQ7XHJcbiAgICBsZXR0ZXItc3BhY2luZzogMC41cHggIWltcG9ydGFudDtcclxuICAgIG9wYWNpdHk6IDAuOSAhaW1wb3J0YW50O1xyXG4gICAgZGlzcGxheTogZmxleCAhaW1wb3J0YW50O1xyXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlciAhaW1wb3J0YW50O1xyXG4gICAgbGluZS1oZWlnaHQ6IDEuMDUgIWltcG9ydGFudDtcclxuICAgIHdoaXRlLXNwYWNlOiBub3dyYXAgIWltcG9ydGFudDtcclxuICB9XHJcblxyXG4gIC5zdS1ob21lIC5zdS1zZWFyY2hUcmlnZ2VyIHtcclxuICAgIHdpZHRoOiAzOHB4ICFpbXBvcnRhbnQ7XHJcbiAgICBoZWlnaHQ6IDM4cHggIWltcG9ydGFudDtcclxuICAgIGJvcmRlci1yYWRpdXM6IDUwJSAhaW1wb3J0YW50O1xyXG4gICAgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEyKSAhaW1wb3J0YW50O1xyXG4gICAgYmFja2Ryb3AtZmlsdGVyOiBibHVyKDhweCkgIWltcG9ydGFudDtcclxuICAgIC13ZWJraXQtYmFja2Ryb3AtZmlsdGVyOiBibHVyKDhweCkgIWltcG9ydGFudDtcclxuICAgIGRpc3BsYXk6IGZsZXggIWltcG9ydGFudDtcclxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXIgIWltcG9ydGFudDtcclxuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyICFpbXBvcnRhbnQ7XHJcbiAgICBib3gtc2hhZG93OiAwIDNweCAxMHB4IHJnYmEoMCwgMCwgMCwgMC4xOCkgIWltcG9ydGFudDtcclxuICB9XHJcblxyXG4gIEBtZWRpYSAobWF4LXdpZHRoOiA1NDBweCkge1xyXG4gICAgLnN1LWFwcFNoZWxsLnN1LWFwcCAuc3UtYXBwQm9keSB7XHJcbiAgICAgIHBhZGRpbmctYm90dG9tOiA2MnB4ICFpbXBvcnRhbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgLnN1LWhvbWUgLnN1LXRvcC0taG9tZSB7XHJcbiAgICAgIG1hcmdpbjogOHB4IDAgMTBweCAhaW1wb3J0YW50O1xyXG4gICAgICBtaW4taGVpZ2h0OiA1OHB4ICFpbXBvcnRhbnQ7XHJcbiAgICAgIHBhZGRpbmc6IDAgMTJweCAhaW1wb3J0YW50O1xyXG4gICAgICBib3JkZXItcmFkaXVzOiAxOHB4ICFpbXBvcnRhbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgLnN1LWhvbWUgLnN1LWJyYW5kUm93IHtcclxuICAgICAgZ2FwOiAycHggIWltcG9ydGFudDtcclxuICAgICAgaGVpZ2h0OiA0MnB4ICFpbXBvcnRhbnQ7XHJcbiAgICAgIG1pbi1oZWlnaHQ6IDQycHggIWltcG9ydGFudDtcclxuICAgICAgcGFkZGluZzogMCA0cHggMCAwICFpbXBvcnRhbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgLnN1LWhvbWUgLnN1LWxvZ29NYXJrIHtcclxuICAgICAgaGVpZ2h0OiA4NHB4ICFpbXBvcnRhbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgLnN1LWhvbWUgLnN1LWxvZ29NYXJrIGltZyB7XHJcbiAgICAgIGhlaWdodDogODRweCAhaW1wb3J0YW50O1xyXG4gICAgICBtYXgtaGVpZ2h0OiA4NHB4ICFpbXBvcnRhbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgLnN1LWhvbWUgLnN1LWJyYW5kIHtcclxuICAgICAgZm9udC1zaXplOiAxNnB4ICFpbXBvcnRhbnQ7XHJcbiAgICAgIGxldHRlci1zcGFjaW5nOiAwLjJweCAhaW1wb3J0YW50O1xyXG4gICAgfVxyXG5cclxuICAgIC5zdS1ob21lIC5zdS1zZWFyY2hUcmlnZ2VyIHtcclxuICAgICAgd2lkdGg6IDM0cHggIWltcG9ydGFudDtcclxuICAgICAgbWluLXdpZHRoOiAzNHB4ICFpbXBvcnRhbnQ7XHJcbiAgICAgIGhlaWdodDogMzRweCAhaW1wb3J0YW50O1xyXG4gICAgfVxyXG5cclxuICAgIC5zdS1ob21lIC5zdS1zZWFyY2hUcmlnZ2VyIHN2ZyB7XHJcbiAgICAgIHdpZHRoOiAxNnB4ICFpbXBvcnRhbnQ7XHJcbiAgICAgIGhlaWdodDogMTZweCAhaW1wb3J0YW50O1xyXG4gICAgfVxyXG5cclxuICAgIC5zdS1ob21lIC5zdS1oZXJvMiB7XHJcbiAgICAgIHdpZHRoOiAxMDAlICFpbXBvcnRhbnQ7XHJcbiAgICAgIG1heC13aWR0aDogMTAwJSAhaW1wb3J0YW50O1xyXG4gICAgICBtYXJnaW46IDAgMCAxMnB4ICFpbXBvcnRhbnQ7XHJcbiAgICAgIHBhZGRpbmc6IDEycHggMTRweCAhaW1wb3J0YW50O1xyXG4gICAgICBib3JkZXItcmFkaXVzOiAxNnB4ICFpbXBvcnRhbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgLnN1LWhvbWUgLnN1LWhlcm8yID4gZGl2OmZpcnN0LWNoaWxkIHtcclxuICAgICAgbWFyZ2luLWJvdHRvbTogMTJweCAhaW1wb3J0YW50O1xyXG4gICAgfVxyXG5cclxuICAgIC5zdS1ob21lIC5zdS1oZXJvUGlsbCB7XHJcbiAgICAgIGZvbnQtc2l6ZTogMTJweCAhaW1wb3J0YW50O1xyXG4gICAgICBwYWRkaW5nOiA4cHggMTRweCAhaW1wb3J0YW50O1xyXG4gICAgfVxyXG5cclxuICAgIC5zdS1ob21lIC5zdS1oZXJvMiArIHNlY3Rpb24ge1xyXG4gICAgICBwYWRkaW5nOiAwIDJweCAhaW1wb3J0YW50O1xyXG4gICAgICBtYXJnaW4tYm90dG9tOiA2cHggIWltcG9ydGFudDtcclxuICAgIH1cclxuXHJcbiAgICAuc3UtaG9tZSAuc3UtaGVybzIgKyBzZWN0aW9uID4gZGl2IHtcclxuICAgICAgZ2FwOiAxMHB4ICFpbXBvcnRhbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgLnN1LWhvbWUgLnN1LWZlYXR1cmVkQ2FyZCxcclxuICAgIC5zdS1ob21lIC5zdS1mZWF0dXJlZENhcmQuc3UtZmVhdHVyZWRDYXJkLS1jb21wYWN0LFxyXG4gICAgLnN1LWhvbWUgLnN1LWZlYXR1cmVkQ2FyZC5zdS1mZWF0dXJlZENhcmQtLWV2ZW50IHtcclxuICAgICAgcGFkZGluZzogMTRweCAxMnB4ICFpbXBvcnRhbnQ7XHJcbiAgICAgIGJvcmRlci1yYWRpdXM6IDE4cHggIWltcG9ydGFudDtcclxuICAgICAgZ2FwOiA0cHggIWltcG9ydGFudDtcclxuICAgIH1cclxuXHJcbiAgICAuc3UtaG9tZSAuc3UtZmVhdHVyZWRDYXJkLS1oYWxmIHtcclxuICAgICAgbWluLWhlaWdodDogMTM4cHggIWltcG9ydGFudDtcclxuICAgIH1cclxuXHJcbiAgICAuc3UtaG9tZSAuc3UtZmVhdHVyZWRCYWRnZSxcclxuICAgIC5zdS1ob21lIC5zdS1mZWF0dXJlZEJhZGdlLS1ldmVudCB7XHJcbiAgICAgIG1hcmdpbi1ib3R0b206IDZweCAhaW1wb3J0YW50O1xyXG4gICAgICBwYWRkaW5nOiA0cHggOXB4ICFpbXBvcnRhbnQ7XHJcbiAgICAgIGZvbnQtc2l6ZTogMTBweCAhaW1wb3J0YW50O1xyXG4gICAgfVxyXG5cclxuICAgIC5zdS1ob21lIC5zdS1mZWF0dXJlZFRpdGxlLFxyXG4gICAgLnN1LWhvbWUgLnN1LWZlYXR1cmVkQ2FyZC0taGFsZiAuc3UtZmVhdHVyZWRUaXRsZSB7XHJcbiAgICAgIGZvbnQtc2l6ZTogMTdweCAhaW1wb3J0YW50O1xyXG4gICAgICBsaW5lLWhlaWdodDogMS4xOCAhaW1wb3J0YW50O1xyXG4gICAgfVxyXG5cclxuICAgIC5zdS1ob21lIC5zdS1mZWF0dXJlZFN1YixcclxuICAgIC5zdS1ob21lIC5zdS1mZWF0dXJlZENhcmQtLWNvbXBhY3QgLnN1LWZlYXR1cmVkU3ViIHtcclxuICAgICAgbWFyZ2luOiAxcHggMCA2cHggMCAhaW1wb3J0YW50O1xyXG4gICAgICBmb250LXNpemU6IDEycHggIWltcG9ydGFudDtcclxuICAgICAgbGluZS1oZWlnaHQ6IDEuMzUgIWltcG9ydGFudDtcclxuICAgIH1cclxuXHJcbiAgICAuc3UtaG9tZSAuc3UtZmVhdHVyZWRDdGEsXHJcbiAgICAuc3UtaG9tZSAuc3UtZmVhdHVyZWRDdGEtLWV2ZW50IHtcclxuICAgICAgbWFyZ2luLXRvcDogOHB4ICFpbXBvcnRhbnQ7XHJcbiAgICAgIHBhZGRpbmc6IDlweCAxNHB4ICFpbXBvcnRhbnQ7XHJcbiAgICAgIGZvbnQtc2l6ZTogMTNweCAhaW1wb3J0YW50O1xyXG4gICAgICBib3gtc2hhZG93OiAwIDhweCAxNnB4IHJnYmEoMzQsIDIxMSwgMjM4LCAwLjIpLCAwIDJweCA4cHggcmdiYSgxMywgMTQ4LCAxMzYsIDAuMTQpICFpbXBvcnRhbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgLnN1LWhvbWUgLnN1LWZlYXR1cmVkQ3RhLS1ldmVudCB7XHJcbiAgICAgIGJveC1zaGFkb3c6IDAgOHB4IDE2cHggcmdiYSgyNDksIDExNSwgMjIsIDAuMjIpLCAwIDJweCA4cHggcmdiYSgyNDQsIDExNCwgMTgyLCAwLjEyKSAhaW1wb3J0YW50O1xyXG4gICAgfVxyXG5cclxuICAgIC5zdS1ob21lIC5zdS10aWxlcyB7XHJcbiAgICAgIGdhcDogMTBweCAhaW1wb3J0YW50O1xyXG4gICAgICBwYWRkaW5nOiA0cHggMnB4IDE4cHggIWltcG9ydGFudDtcclxuICAgIH1cclxuXHJcbiAgICAuc3UtaG9tZSAuc3UtdGlsZSB7XHJcbiAgICAgIGdhcDogN3B4ICFpbXBvcnRhbnQ7XHJcbiAgICAgIHBhZGRpbmc6IDEycHggIWltcG9ydGFudDtcclxuICAgICAgYm9yZGVyLXJhZGl1czogMTdweCAhaW1wb3J0YW50O1xyXG4gICAgICBhbGlnbi1pdGVtczogZmxleC1zdGFydCAhaW1wb3J0YW50O1xyXG4gICAgfVxyXG5cclxuICAgIC5zdS1ob21lIC5zdS10aWxlX19pY29uIHtcclxuICAgICAgd2lkdGg6IDM0cHggIWltcG9ydGFudDtcclxuICAgICAgbWluLXdpZHRoOiAzNHB4ICFpbXBvcnRhbnQ7XHJcbiAgICAgIGhlaWdodDogMzRweCAhaW1wb3J0YW50O1xyXG4gICAgICBib3JkZXItcmFkaXVzOiAxMHB4ICFpbXBvcnRhbnQ7XHJcbiAgICAgIGZvbnQtc2l6ZTogMTZweCAhaW1wb3J0YW50O1xyXG4gICAgfVxyXG5cclxuICAgIC5zdS1ob21lIC5zdS10aWxlX190aXRsZSB7XHJcbiAgICAgIGZvbnQtc2l6ZTogMTNweCAhaW1wb3J0YW50O1xyXG4gICAgICBsaW5lLWhlaWdodDogMS4yICFpbXBvcnRhbnQ7XHJcbiAgICAgIG1pbi1oZWlnaHQ6IGNhbGMoMS4yZW0gKiAyKSAhaW1wb3J0YW50O1xyXG4gICAgfVxyXG5cclxuICAgIC5zdS1ob21lIC5zdS10aWxlX19zdWIge1xyXG4gICAgICBmb250LXNpemU6IDExcHggIWltcG9ydGFudDtcclxuICAgICAgbGluZS1oZWlnaHQ6IDEuMTggIWltcG9ydGFudDtcclxuICAgICAgbWluLWhlaWdodDogMS4xOGVtICFpbXBvcnRhbnQ7XHJcbiAgICAgIC13ZWJraXQtbGluZS1jbGFtcDogMiAhaW1wb3J0YW50O1xyXG4gICAgfVxyXG5cclxuICAgIC5zdS1ob21lIC5zdS10aWxlX190ZXh0IHtcclxuICAgICAgZ2FwOiAycHggIWltcG9ydGFudDtcclxuICAgICAgYWxpZ24tc2VsZjogc3RyZXRjaCAhaW1wb3J0YW50O1xyXG4gICAgICBhbGlnbi1pdGVtczogY2VudGVyICFpbXBvcnRhbnQ7XHJcbiAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyICFpbXBvcnRhbnQ7XHJcbiAgICAgIHRleHQtYWxpZ246IGNlbnRlciAhaW1wb3J0YW50O1xyXG4gICAgICBwYWRkaW5nLXJpZ2h0OiAzcHggIWltcG9ydGFudDtcclxuICAgIH1cclxuXHJcbiAgICAuc3UtaG9tZSAuc3UtcGFuZWwsXHJcbiAgICAuc3UtaG9tZSAuc3Utbm90aWNlQm9keSxcclxuICAgIC5zdS1ob21lIC5zdS1taXNzaW9uRXZlbnRDYXJkIHtcclxuICAgICAgYm9yZGVyLXJhZGl1czogMThweCAhaW1wb3J0YW50O1xyXG4gICAgICBib3gtc2hhZG93OiAwIDZweCAxNnB4IHJnYmEoMTUsIDIzLCA0MiwgMC4wNSkgIWltcG9ydGFudDtcclxuICAgIH1cclxuXHJcbiAgICAuc3UtaG9tZSAuc3UtcGFuZWwge1xyXG4gICAgICBwYWRkaW5nOiAxNHB4IDE0cHggMTZweCAhaW1wb3J0YW50O1xyXG4gICAgICBtYXJnaW4tYm90dG9tOiAxNnB4ICFpbXBvcnRhbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgLnN1LWhvbWUgc2VjdGlvbi5zdS1wYW5lbCxcclxuICAgIC5zdS1ob21lIHNlY3Rpb24uc3UtcGFuZWwuc3UtcGFuZWwtLW5vdGljZSxcclxuICAgIC5zdS1ob21lIHNlY3Rpb24uc3UtcGFuZWwuc3UtcGFuZWwtLWxpdmUge1xyXG4gICAgICBtYXJnaW4tbGVmdDogMCAhaW1wb3J0YW50O1xyXG4gICAgICBtYXJnaW4tcmlnaHQ6IDAgIWltcG9ydGFudDtcclxuICAgIH1cclxuXHJcbiAgICAuc3UtaG9tZSAuc3UtcGFuZWxIZWFkIHtcclxuICAgICAgcGFkZGluZzogMCAwIDhweCAhaW1wb3J0YW50O1xyXG4gICAgfVxyXG5cclxuICAgIC5zdS1ob21lIC5zdS1wYW5lbFRpdGxlLFxyXG4gICAgLnN1LWhvbWUgLnN1LWNhcmRUaXRsZSxcclxuICAgIC5zdS1ob21lIC5zdS1ub3RpY2VUaXRsZSB7XHJcbiAgICAgIGZvbnQtc2l6ZTogMTRweCAhaW1wb3J0YW50O1xyXG4gICAgICBsaW5lLWhlaWdodDogMS4yNSAhaW1wb3J0YW50O1xyXG4gICAgfVxyXG5cclxuICAgIC5zdS1ob21lIC5zdS1wYW5lbE1vcmUge1xyXG4gICAgICBwYWRkaW5nOiA4cHggMTFweCAhaW1wb3J0YW50O1xyXG4gICAgICBib3JkZXItcmFkaXVzOiAxMnB4ICFpbXBvcnRhbnQ7XHJcbiAgICAgIGZvbnQtc2l6ZTogMTFweCAhaW1wb3J0YW50O1xyXG4gICAgfVxyXG5cclxuICAgIC5zdS1ob21lIC5zdS1ub3RpY2VNaW5pTGlzdCB7XHJcbiAgICAgIGdhcDogOHB4ICFpbXBvcnRhbnQ7XHJcbiAgICAgIG1hcmdpbi10b3A6IDEwcHggIWltcG9ydGFudDtcclxuICAgIH1cclxuXHJcbiAgICAuc3UtaG9tZSAuc3Utbm90aWNlTWluaUNhcmQge1xyXG4gICAgICBwYWRkaW5nOiAxMHB4IDEycHggIWltcG9ydGFudDtcclxuICAgICAgYm9yZGVyLXJhZGl1czogMTJweCAhaW1wb3J0YW50O1xyXG4gICAgICBib3gtc2hhZG93OiAwIDNweCAxMHB4IHJnYmEoMTUsMjMsNDIsMC4wNCkgIWltcG9ydGFudDtcclxuICAgIH1cclxuXHJcbiAgICAuc3UtaG9tZSAuc3Utbm90aWNlTWluaVRpdGxlIHtcclxuICAgICAgZm9udC1zaXplOiAxNHB4ICFpbXBvcnRhbnQ7XHJcbiAgICAgIGxpbmUtaGVpZ2h0OiAxLjMgIWltcG9ydGFudDtcclxuICAgIH1cclxuXHJcbiAgICAuc3UtaG9tZSAuc3Utbm90aWNlTWluaU1ldGEge1xyXG4gICAgICBtYXJnaW4tdG9wOiAzcHggIWltcG9ydGFudDtcclxuICAgICAgZm9udC1zaXplOiAxMXB4ICFpbXBvcnRhbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgLnN1LWhvbWUgLnN1LXBhbmVsLS1saXZlIC5zdS1saXZlUmFpbCxcclxuICAgIC5zdS1ob21lIC5zdS1wYW5lbCAuc3UtZmVlZEdyaWQge1xyXG4gICAgICBnYXA6IDhweCAhaW1wb3J0YW50O1xyXG4gICAgfVxyXG5cclxuICAgIC5zdS1ob21lIC5zdS1wYW5lbC0tbGl2ZSAuc3UtbGl2ZUNhcmQsXHJcbiAgICAuc3UtaG9tZSAuc3UtcGFuZWwgLnN1LWZlZWRDYXJkIHtcclxuICAgICAgaGVpZ2h0OiAxMDJweCAhaW1wb3J0YW50O1xyXG4gICAgICBwYWRkaW5nOiAxMHB4ICFpbXBvcnRhbnQ7XHJcbiAgICAgIGJvcmRlci1yYWRpdXM6IDEycHggIWltcG9ydGFudDtcclxuICAgIH1cclxuXHJcbiAgICAuc3UtaG9tZSAuc3UtcGFuZWwtLWxpdmUgLnN1LWxpdmVCYWRnZSxcclxuICAgIC5zdS1ob21lIC5zdS1wYW5lbCAuc3UtZmVlZEJhZGdlLFxyXG4gICAgLnN1LWhvbWUgLnN1LWxpdmVCYWRnZSB7XHJcbiAgICAgIGZvbnQtc2l6ZTogOXB4ICFpbXBvcnRhbnQ7XHJcbiAgICAgIHBhZGRpbmc6IDNweCA2cHggIWltcG9ydGFudDtcclxuICAgICAgbWFyZ2luLWJvdHRvbTogNnB4ICFpbXBvcnRhbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgLnN1LWhvbWUgLnN1LXBhbmVsLS1saXZlIC5zdS1saXZlVGl0bGUsXHJcbiAgICAuc3UtaG9tZSAuc3UtcGFuZWwgLnN1LWZlZWRUaXRsZSxcclxuICAgIC5zdS1ob21lIC5zdS1saXZlVGl0bGUge1xyXG4gICAgICBmb250LXNpemU6IDEzcHggIWltcG9ydGFudDtcclxuICAgICAgbGluZS1oZWlnaHQ6IDEuMjIgIWltcG9ydGFudDtcclxuICAgICAgbWFyZ2luLXRvcDogNHB4ICFpbXBvcnRhbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgLnN1LWhvbWUgLnN1LXBhbmVsLS1saXZlIC5zdS1saXZlU3ViLFxyXG4gICAgLnN1LWhvbWUgLnN1LXBhbmVsIC5zdS1mZWVkU3ViLFxyXG4gICAgLnN1LWhvbWUgLnN1LWxpdmVTdWIge1xyXG4gICAgICBmb250LXNpemU6IDExcHggIWltcG9ydGFudDtcclxuICAgICAgbGluZS1oZWlnaHQ6IDEuMjggIWltcG9ydGFudDtcclxuICAgICAgbWFyZ2luLXRvcDogM3B4ICFpbXBvcnRhbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgLnN1LWhvbWUgLnN1LXBhbmVsIC5zdS1jYXJvdXNlbF9fdHJhY2sge1xyXG4gICAgICBnYXA6IDhweCAhaW1wb3J0YW50O1xyXG4gICAgfVxyXG5cclxuICAgIC5zdS1ob21lIC5zdS1wYW5lbCAuc3UtY2Fyb3VzZWxDYXJkIHtcclxuICAgICAgbWluLXdpZHRoOiBtaW4oMjQ4cHgsIGNhbGMoMTAwdncgLSA0NHB4KSkgIWltcG9ydGFudDtcclxuICAgICAgbWF4LXdpZHRoOiAyNzJweCAhaW1wb3J0YW50O1xyXG4gICAgICBib3JkZXItcmFkaXVzOiAxNnB4ICFpbXBvcnRhbnQ7XHJcbiAgICAgIHBhZGRpbmc6IDZweCAhaW1wb3J0YW50O1xyXG4gICAgfVxyXG5cclxuICAgIC5zdS1ob21lIC5zdS10aWxlOmhvdmVyLFxyXG4gICAgLnN1LWhvbWUgLnN1LXRpbGU6YWN0aXZlLFxyXG4gICAgLnN1LWhvbWUgLnN1LWZlYXR1cmVkQ2FyZDpob3ZlcixcclxuICAgIC5zdS1ob21lIC5zdS1mZWF0dXJlZENhcmQ6YWN0aXZlLFxyXG4gICAgLnN1LWhvbWUgLnN1LWZlYXR1cmVkQ3RhOmhvdmVyLFxyXG4gICAgLnN1LWhvbWUgLnN1LWZlYXR1cmVkQ3RhOmFjdGl2ZSxcclxuICAgIC5zdS1ob21lIC5zdS1mZWF0dXJlZEN0YS0tZXZlbnQ6aG92ZXIsXHJcbiAgICAuc3UtaG9tZSAuc3UtZmVhdHVyZWRDdGEtLWV2ZW50OmFjdGl2ZSxcclxuICAgIC5zdS1ob21lIC5zdS1wYW5lbCAuc3UtY2Fyb3VzZWxDYXJkOmhvdmVyLFxyXG4gICAgLnN1LWhvbWUgLnN1LXBhbmVsIC5zdS1jYXJvdXNlbENhcmQ6YWN0aXZlLFxyXG4gICAgLnN1LWhvbWUgLnN1LXNlYXJjaFRyaWdnZXI6aG92ZXIsXHJcbiAgICAuc3UtaG9tZSAuc3Utc2VhcmNoVHJpZ2dlcjphY3RpdmUge1xyXG4gICAgICB0cmFuc2Zvcm06IG5vbmUgIWltcG9ydGFudDtcclxuICAgIH1cclxuXHJcbiAgICAuc3UtaG9tZSAuc3UtdGlsZTpob3ZlcixcclxuICAgIC5zdS1ob21lIC5zdS10aWxlOmFjdGl2ZSxcclxuICAgIC5zdS1ob21lIC5zdS1mZWF0dXJlZENhcmQ6aG92ZXIsXHJcbiAgICAuc3UtaG9tZSAuc3UtZmVhdHVyZWRDYXJkOmFjdGl2ZSxcclxuICAgIC5zdS1ob21lIC5zdS1mZWF0dXJlZEN0YTpob3ZlcixcclxuICAgIC5zdS1ob21lIC5zdS1mZWF0dXJlZEN0YTphY3RpdmUsXHJcbiAgICAuc3UtaG9tZSAuc3UtZmVhdHVyZWRDdGEtLWV2ZW50OmhvdmVyLFxyXG4gICAgLnN1LWhvbWUgLnN1LWZlYXR1cmVkQ3RhLS1ldmVudDphY3RpdmUsXHJcbiAgICAuc3UtaG9tZSAuc3UtcGFuZWwgLnN1LWNhcm91c2VsQ2FyZDpob3ZlcixcclxuICAgIC5zdS1ob21lIC5zdS1wYW5lbCAuc3UtY2Fyb3VzZWxDYXJkOmFjdGl2ZSxcclxuICAgIC5zdS1ob21lIC5zdS1zZWFyY2hUcmlnZ2VyOmhvdmVyLFxyXG4gICAgLnN1LWhvbWUgLnN1LXNlYXJjaFRyaWdnZXI6YWN0aXZlIHtcclxuICAgICAgb3BhY2l0eTogMC45OCAhaW1wb3J0YW50O1xyXG4gICAgfVxyXG5cclxuICAgIC5zdS1ob21lIC5zdS1wYW5lbCAuc3UtY2Fyb3VzZWxDYXJkIC5zdS1saXZlVGh1bWIge1xyXG4gICAgICBib3JkZXItcmFkaXVzOiAxMnB4ICFpbXBvcnRhbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgLnN1LWhvbWUgLnN1LXBhbmVsIC5zdS1jYXJvdXNlbENhcmQgLnN1LWxpdmVUaHVtYjo6YWZ0ZXIge1xyXG4gICAgICB3aWR0aDogNDRweCAhaW1wb3J0YW50O1xyXG4gICAgICBoZWlnaHQ6IDQ0cHggIWltcG9ydGFudDtcclxuICAgIH1cclxuXHJcbiAgICAuc3UtaG9tZSAuc3UtcGFuZWwgLnN1LWNhcm91c2VsQ2FyZCAuc3UtbGl2ZVRodW1iOjpiZWZvcmUge1xyXG4gICAgICBib3JkZXItdG9wOiA3cHggc29saWQgdHJhbnNwYXJlbnQgIWltcG9ydGFudDtcclxuICAgICAgYm9yZGVyLWJvdHRvbTogN3B4IHNvbGlkIHRyYW5zcGFyZW50ICFpbXBvcnRhbnQ7XHJcbiAgICAgIGJvcmRlci1sZWZ0OiAxMXB4IHNvbGlkICNmZmZmZmYgIWltcG9ydGFudDtcclxuICAgIH1cclxuXHJcbiAgICAuc3UtaG9tZSAuc3UtcGFuZWwgLnN1LWNhcm91c2VsQ2FyZCAuc3UtbGl2ZVRpdGxlIHtcclxuICAgICAgZm9udC1zaXplOiAxM3B4ICFpbXBvcnRhbnQ7XHJcbiAgICAgIG1hcmdpbi10b3A6IDZweCAhaW1wb3J0YW50O1xyXG4gICAgfVxyXG5cclxuICAgIC5zdS1ob21lIC5zdS1wYW5lbCAuc3UtY2Fyb3VzZWxDYXJkIC5zdS1saXZlVGl0bGU6OmFmdGVyIHtcclxuICAgICAgZm9udC1zaXplOiAxMHB4ICFpbXBvcnRhbnQ7XHJcbiAgICAgIG1hcmdpbi10b3A6IDFweCAhaW1wb3J0YW50O1xyXG4gICAgfVxyXG5cclxuICAgIC5zdS1ob21lIC5zdS1wYW5lbCAuc3UtY2Fyb3VzZWxDYXJkIC5zdS1lbXB0eVN0YXRlIHtcclxuICAgICAgbWluLWhlaWdodDogMTI2cHggIWltcG9ydGFudDtcclxuICAgICAgcGFkZGluZzogMTJweCAhaW1wb3J0YW50O1xyXG4gICAgICBnYXA6IDVweCAhaW1wb3J0YW50O1xyXG4gICAgfVxyXG5cclxuICAgIC5zdS1ob21lIC5zdS1wYW5lbCAuc3UtY2Fyb3VzZWxDYXJkIC5zdS1lbXB0eVN0YXRlX190aXRsZSB7XHJcbiAgICAgIGZvbnQtc2l6ZTogMTNweCAhaW1wb3J0YW50O1xyXG4gICAgfVxyXG5cclxuICAgIC5zdS1ob21lIC5zdS1wYW5lbCAuc3UtY2Fyb3VzZWxDYXJkIC5zdS1lbXB0eVN0YXRlX19zdWIge1xyXG4gICAgICBmb250LXNpemU6IDExcHggIWltcG9ydGFudDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIEBtZWRpYSAobWluLXdpZHRoOiAxMDI0cHgpIHtcclxuICAgIC5zdS1ob21lIC5zdS1wYW5lbC0tbGl2ZSAuc3UtbGl2ZUNhcmQsXHJcbiAgICAuc3UtaG9tZSAuc3UtcGFuZWwgLnN1LWZlZWRDYXJkIHtcclxuICAgICAgaGVpZ2h0OiAxMjZweDtcclxuICAgIH1cclxuXHJcbiAgICAuc3UtaG9tZSAuc3UtcGFuZWwgLnN1LWNhcm91c2VsQ2FyZCB7XHJcbiAgICAgIG1pbi13aWR0aDogMjgwcHg7XHJcbiAgICAgIG1heC13aWR0aDogMzQwcHg7XHJcbiAgICB9XHJcbiAgfVxyXG5gO1xyXG5cclxuZnVuY3Rpb24gQXBwQm90dG9tTmF2KHsgaXNMb2dnZWRJbiwgYXV0aFJlYWR5LCBvbkxvZ291dCB9KSB7XHJcbiAgY29uc3QgbmF2aWdhdGUgPSB1c2VOYXZpZ2F0ZSgpO1xyXG4gIGNvbnN0IGxvY2F0aW9uID0gdXNlTG9jYXRpb24oKTtcclxuICBjb25zdCBbYm90dG9tQmFubmVyLCBzZXRCb3R0b21CYW5uZXJdID0gdXNlU3RhdGUobnVsbCk7XHJcbiAgY29uc3QgW2Jhbm5lckNsb3NlZCwgc2V0QmFubmVyQ2xvc2VkXSA9IHVzZVN0YXRlKCgpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIHJldHVybiBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKFwic3VfYmFubmVyX2Nsb3NlZFwiKSA9PT0gXCIxXCI7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGxldCBtb3VudGVkID0gdHJ1ZTtcclxuICAgIGZldGNoKFwiL2FwaS9iYW5uZXJzP3R5cGU9Ym90dG9tX2Jhbm5lciZpc19hY3RpdmU9dHJ1ZVwiKVxyXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IChyZXNwb25zZS5vayA/IHJlc3BvbnNlLmpzb24oKSA6IG51bGwpKVxyXG4gICAgICAudGhlbigoZGF0YSkgPT4ge1xyXG4gICAgICAgIGlmICghbW91bnRlZCkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IGxpc3QgPSAoZGF0YSAmJiAoZGF0YS5iYW5uZXJzIHx8IGRhdGEuZGF0YSkpIHx8IFtdO1xyXG4gICAgICAgIHNldEJvdHRvbUJhbm5lcihBcnJheS5pc0FycmF5KGxpc3QpICYmIGxpc3QubGVuZ3RoID8gbGlzdFswXSA6IG51bGwpO1xyXG4gICAgICB9KVxyXG4gICAgICAuY2F0Y2goKCkgPT4ge1xyXG4gICAgICAgIGlmIChtb3VudGVkKSBzZXRCb3R0b21CYW5uZXIobnVsbCk7XHJcbiAgICAgIH0pO1xyXG4gICAgcmV0dXJuICgpID0+IHtcclxuICAgICAgbW91bnRlZCA9IGZhbHNlO1xyXG4gICAgfTtcclxuICB9LCBbXSk7XHJcblxyXG4gIGNvbnN0IGN1cnJlbnRQYXRoID0gbG9jYXRpb24ucGF0aG5hbWU7XHJcbiAgaWYgKGN1cnJlbnRQYXRoID09PSBcIi9hdXRoXCIgfHwgY3VycmVudFBhdGggPT09IFwiL2xvZ2luXCIpIHJldHVybiBudWxsO1xyXG5cclxuICBjb25zdCBzZXNzaW9uID0gZ2V0U2Vzc2lvbigpO1xyXG4gIGNvbnN0IHN0b3JlZFJlZ2lvbklkID0gKCgpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJhdyA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwic2VsZWN0ZWRSZWdpb25JZFwiKTtcclxuICAgICAgcmV0dXJuIHJhdyA/IFN0cmluZyhyYXcpLnRyaW0oKSA6IG51bGw7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gIH0pKCk7XHJcbiAgY29uc3QgbWVtYmVyUmVnaW9uSWQgPSAoKCkgPT4ge1xyXG4gICAgY29uc3QgcmF3ID0gZ2V0Q3VycmVudFJlZ2lvbklkKCkgfHwgc2Vzc2lvbj8ucmVnaW9uSWQgfHwgc3RvcmVkUmVnaW9uSWQgfHwgbnVsbDtcclxuICAgIGlmIChyYXcgPT0gbnVsbCkgcmV0dXJuIG51bGw7XHJcbiAgICBjb25zdCBub3JtYWxpemVkID0gU3RyaW5nKHJhdykudHJpbSgpO1xyXG4gICAgcmV0dXJuIG5vcm1hbGl6ZWQgJiYgbm9ybWFsaXplZCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBub3JtYWxpemVkICE9PSBcIm51bGxcIiA/IG5vcm1hbGl6ZWQgOiBudWxsO1xyXG4gIH0pKCk7XHJcblxyXG4gIGNvbnN0IGlzUG9ydGFsQWN0aXZlID1cclxuICAgIGN1cnJlbnRQYXRoID09PSBcIi9yZWdpb25cIiB8fFxyXG4gICAgY3VycmVudFBhdGguc3RhcnRzV2l0aChcIi9wb3J0YWwvcmVnaW9uL1wiKSB8fFxyXG4gICAgL15cXC9yXFwvW14vXSsoPzpcXC8uKik/JC8udGVzdChjdXJyZW50UGF0aCk7XHJcblxyXG4gIGNvbnN0IHRhYnMgPSBbXHJcbiAgICB7XHJcbiAgICAgIGtleTogXCJob21lXCIsXHJcbiAgICAgIGxhYmVsOiBcIu2ZiFwiLFxyXG4gICAgICBhY3RpdmU6IGN1cnJlbnRQYXRoID09PSBcIi9ob21lXCIgfHwgY3VycmVudFBhdGggPT09IFwiL1wiLFxyXG4gICAgICBvbkNsaWNrOiAoKSA9PiBuYXZpZ2F0ZShcIi9ob21lXCIpLFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAga2V5OiBcImF1dGhcIixcclxuICAgICAgbGFiZWw6IGF1dGhSZWFkeSA/IChpc0xvZ2dlZEluID8gXCLroZzqt7jslYTsm4NcIiA6IFwi66Gc6re47J24XCIpIDogXCIgXCIsXHJcbiAgICAgIHRvbmU6IGlzTG9nZ2VkSW4gPyBcImRhbmdlclwiIDogdW5kZWZpbmVkLFxyXG4gICAgICBhY3RpdmU6IGZhbHNlLFxyXG4gICAgICBvbkNsaWNrOiBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgaWYgKCFhdXRoUmVhZHkpIHJldHVybjtcclxuICAgICAgICBpZiAoIWlzTG9nZ2VkSW4pIHtcclxuICAgICAgICAgIG5hdmlnYXRlKFwiL2F1dGhcIik7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGNvbmZpcm1lZCA9IHdpbmRvdy5jb25maXJtKFwi7KCV66eQIOuhnOq3uOyVhOybg+2VmOyLnOqyoOyKteuLiOq5jD9cIik7XHJcbiAgICAgICAgaWYgKCFjb25maXJtZWQpIHJldHVybjtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgYXdhaXQgc2lnbk91dCgpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJbQXBwQm90dG9tTmF2XSBMb2dvdXQgZXJyb3I6XCIsIGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgb25Mb2dvdXQ/LigpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgIC8vIG5vb3BcclxuICAgICAgICB9XHJcbiAgICAgICAgbmF2aWdhdGUoXCIvaG9tZVwiKTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIGtleTogXCJwb3J0YWxcIixcclxuICAgICAgbGFiZWw6IFwi64K07KeA7Jet7Y+s7YS4XCIsXHJcbiAgICAgIGFjdGl2ZTogaXNQb3J0YWxBY3RpdmUsXHJcbiAgICAgIG9uQ2xpY2s6ICgpID0+IHtcclxuICAgICAgICBpZiAobWVtYmVyUmVnaW9uSWQpIHtcclxuICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwic2VsZWN0ZWRSZWdpb25JZFwiLCBtZW1iZXJSZWdpb25JZCk7XHJcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIC8vIG5vb3BcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIG5hdmlnYXRlKGAvci8ke21lbWJlclJlZ2lvbklkfWApO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBuYXZpZ2F0ZShcIi9yZWdpb25cIik7XHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBrZXk6IFwibXlcIixcclxuICAgICAgbGFiZWw6IFwi66eI7J207Jik7ZS87IqkXCIsXHJcbiAgICAgIGFjdGl2ZTogY3VycmVudFBhdGggPT09IFwiL215XCIgfHwgY3VycmVudFBhdGggPT09IFwiL215b2ZmaWNlXCIgfHwgY3VycmVudFBhdGguc3RhcnRzV2l0aChcIi9teS9cIiksXHJcbiAgICAgIG9uQ2xpY2s6ICgpID0+IHtcclxuICAgICAgICBpZiAoIWlzTG9nZ2VkSW4pIHtcclxuICAgICAgICAgIG5hdmlnYXRlKFwiL2F1dGhcIiwgeyBzdGF0ZTogeyByZXR1cm5UbzogXCIvbXlcIiB9IH0pO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBuYXZpZ2F0ZShcIi9teVwiKTtcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgXTtcclxuXHJcbiAgY29uc3QgbmF2U2hlbGxTdHlsZSA9IHtcclxuICAgIHBvc2l0aW9uOiBcImZpeGVkXCIsXHJcbiAgICBsZWZ0OiAwLFxyXG4gICAgcmlnaHQ6IDAsXHJcbiAgICBib3R0b206IDAsXHJcbiAgICB6SW5kZXg6IDk5OTksXHJcbiAgICBkaXNwbGF5OiBcImZsZXhcIixcclxuICAgIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLFxyXG4gICAgcGFkZGluZzogXCIwIDEwcHggY2FsYyhlbnYoc2FmZS1hcmVhLWluc2V0LWJvdHRvbSwgMHB4KSArIDRweClcIixcclxuICAgIHBvaW50ZXJFdmVudHM6IFwibm9uZVwiLFxyXG4gIH07XHJcblxyXG4gIGNvbnN0IG5hdlN0eWxlID0ge1xyXG4gICAgcG9pbnRlckV2ZW50czogXCJhdXRvXCIsXHJcbiAgICB3aWR0aDogXCJtaW4oMTAwJSwgNDM4cHgpXCIsXHJcbiAgICBkaXNwbGF5OiBcImdyaWRcIixcclxuICAgIGdyaWRUZW1wbGF0ZUNvbHVtbnM6IFwicmVwZWF0KDQsIG1pbm1heCgwLCAxZnIpKVwiLFxyXG4gICAgZ2FwOiA0LFxyXG4gICAgcGFkZGluZzogXCIzcHggNHB4IDJweFwiLFxyXG4gICAgYm9yZGVyUmFkaXVzOiAxMixcclxuICAgIGJhY2tncm91bmQ6IFwibGluZWFyLWdyYWRpZW50KDE4MGRlZywgcmdiYSgyNDcsMjUyLDI1NSwwLjk0KSwgcmdiYSgyMzksMjQ2LDI1NSwwLjkyKSlcIixcclxuICAgIGJvcmRlcjogXCIxcHggc29saWQgcmdiYSgxNCwxMTYsMTQ0LDAuMjYpXCIsXHJcbiAgICBib3hTaGFkb3c6IFwiMCAtM3B4IDEwcHggcmdiYSgxNSwyMyw0MiwwLjEwKVwiLFxyXG4gICAgYmFja2Ryb3BGaWx0ZXI6IFwiYmx1cig4cHgpXCIsXHJcbiAgICBXZWJraXRCYWNrZHJvcEZpbHRlcjogXCJibHVyKDhweClcIixcclxuICB9O1xyXG5cclxuICBjb25zdCBiYW5uZXJTdHlsZSA9IHtcclxuICAgIHBvc2l0aW9uOiBcImZpeGVkXCIsXHJcbiAgICBsZWZ0OiBcIjUwJVwiLFxyXG4gICAgdHJhbnNmb3JtOiBcInRyYW5zbGF0ZVgoLTUwJSlcIixcclxuICAgIGJvdHRvbTogXCJjYWxjKGVudihzYWZlLWFyZWEtaW5zZXQtYm90dG9tLCAwcHgpICsgNjZweClcIixcclxuICAgIHdpZHRoOiBcIm1pbihjYWxjKDEwMHZ3IC0gMjBweCksIDQzOHB4KVwiLFxyXG4gICAgekluZGV4OiA5OTk4LFxyXG4gICAgYmFja2dyb3VuZDogXCJyZ2JhKDI1NSwyNTUsMjU1LDAuOTIpXCIsXHJcbiAgICBib3JkZXI6IFwiMXB4IHNvbGlkIHJnYmEoMjI2LDIzMiwyNDAsMC45MilcIixcclxuICAgIGJvcmRlclJhZGl1czogMTYsXHJcbiAgICBkaXNwbGF5OiBcImZsZXhcIixcclxuICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXHJcbiAgICBnYXA6IDgsXHJcbiAgICBwYWRkaW5nOiBcIjZweCAxMHB4XCIsXHJcbiAgICBib3hTaGFkb3c6IFwiMCA4cHggMjRweCByZ2JhKDE1LDIzLDQyLDAuMDgpXCIsXHJcbiAgICBiYWNrZHJvcEZpbHRlcjogXCJibHVyKDEycHgpXCIsXHJcbiAgICBXZWJraXRCYWNrZHJvcEZpbHRlcjogXCJibHVyKDEycHgpXCIsXHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDw+XHJcbiAgICAgIHtib3R0b21CYW5uZXIgJiYgIWJhbm5lckNsb3NlZCA/IChcclxuICAgICAgICA8ZGl2IHN0eWxlPXtiYW5uZXJTdHlsZX0+XHJcbiAgICAgICAgICB7Ym90dG9tQmFubmVyLmxpbmtfdXJsID8gKFxyXG4gICAgICAgICAgICA8YVxyXG4gICAgICAgICAgICAgIGhyZWY9e2JvdHRvbUJhbm5lci5saW5rX3VybH1cclxuICAgICAgICAgICAgICB0YXJnZXQ9XCJfYmxhbmtcIlxyXG4gICAgICAgICAgICAgIHJlbD1cIm5vb3BlbmVyIG5vcmVmZXJyZXJcIlxyXG4gICAgICAgICAgICAgIHN0eWxlPXt7IGZsZXg6IDEsIGRpc3BsYXk6IFwiZmxleFwiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCB0ZXh0RGVjb3JhdGlvbjogXCJub25lXCIsIG1pbldpZHRoOiAwIH19XHJcbiAgICAgICAgICAgID5cclxuICAgICAgICAgICAgICB7Ym90dG9tQmFubmVyLmltYWdlX3VybCA/IChcclxuICAgICAgICAgICAgICAgIDxpbWdcclxuICAgICAgICAgICAgICAgICAgc3JjPXtib3R0b21CYW5uZXIuaW1hZ2VfdXJsfVxyXG4gICAgICAgICAgICAgICAgICBhbHQ9e2JvdHRvbUJhbm5lci5hbHQgfHwgXCLqtJHqs6BcIn1cclxuICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgaGVpZ2h0OiA0MCwgbWF4V2lkdGg6IFwiMTAwJVwiLCBvYmplY3RGaXQ6IFwiY29udGFpblwiLCBkaXNwbGF5OiBcImJsb2NrXCIgfX1cclxuICAgICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgICAgKSA6IChcclxuICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IGZvbnRTaXplOiAxMywgY29sb3I6IFwiIzBmMTcyYVwiIH19Pntib3R0b21CYW5uZXIuYWx0IHx8IFwi6rSR6rOgXCJ9PC9zcGFuPlxyXG4gICAgICAgICAgICAgICl9XHJcbiAgICAgICAgICAgIDwvYT5cclxuICAgICAgICAgICkgOiAoXHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZmxleDogMSwgbWluV2lkdGg6IDAgfX0+XHJcbiAgICAgICAgICAgICAge2JvdHRvbUJhbm5lci5pbWFnZV91cmwgPyAoXHJcbiAgICAgICAgICAgICAgICA8aW1nXHJcbiAgICAgICAgICAgICAgICAgIHNyYz17Ym90dG9tQmFubmVyLmltYWdlX3VybH1cclxuICAgICAgICAgICAgICAgICAgYWx0PXtib3R0b21CYW5uZXIuYWx0IHx8IFwi6rSR6rOgXCJ9XHJcbiAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IGhlaWdodDogNDAsIG1heFdpZHRoOiBcIjEwMCVcIiwgb2JqZWN0Rml0OiBcImNvbnRhaW5cIiwgZGlzcGxheTogXCJibG9ja1wiIH19XHJcbiAgICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgICkgOiAoXHJcbiAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBmb250U2l6ZTogMTMsIGNvbG9yOiBcIiMwZjE3MmFcIiB9fT57Ym90dG9tQmFubmVyLmFsdCB8fCBcIuq0keqzoFwifTwvc3Bhbj5cclxuICAgICAgICAgICAgICApfVxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICl9XHJcbiAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxyXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XHJcbiAgICAgICAgICAgICAgc2V0QmFubmVyQ2xvc2VkKHRydWUpO1xyXG4gICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKFwic3VfYmFubmVyX2Nsb3NlZFwiLCBcIjFcIik7XHJcbiAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gbm9vcFxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgYXJpYS1sYWJlbD1cIuuwsOuEiCDri6vquLBcIlxyXG4gICAgICAgICAgICBzdHlsZT17e1xyXG4gICAgICAgICAgICAgIGJvcmRlcjogMCxcclxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiBcInRyYW5zcGFyZW50XCIsXHJcbiAgICAgICAgICAgICAgY29sb3I6IFwiIzk0YTNiOFwiLFxyXG4gICAgICAgICAgICAgIGZvbnRTaXplOiAxOCxcclxuICAgICAgICAgICAgICBsaW5lSGVpZ2h0OiAxLFxyXG4gICAgICAgICAgICAgIHBhZGRpbmc6IFwiNHB4IDJweCA0cHggNnB4XCIsXHJcbiAgICAgICAgICAgICAgY3Vyc29yOiBcInBvaW50ZXJcIixcclxuICAgICAgICAgICAgfX1cclxuICAgICAgICAgID5cclxuICAgICAgICAgICAgeFxyXG4gICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICkgOiBudWxsfVxyXG5cclxuICAgICAgPGRpdiBzdHlsZT17bmF2U2hlbGxTdHlsZX0+XHJcbiAgICAgICAgPG5hdiBzdHlsZT17bmF2U3R5bGV9IHJvbGU9XCJuYXZpZ2F0aW9uXCIgYXJpYS1sYWJlbD1cIu2VmOuLqCDrhKTruYTqsozsnbTshZhcIj5cclxuICAgICAgICAgIHt0YWJzLm1hcCgodGFiKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlzQWN0aXZlID0gISF0YWIuYWN0aXZlO1xyXG4gICAgICAgICAgICBjb25zdCBpc0RhbmdlciA9IHRhYi50b25lID09PSBcImRhbmdlclwiO1xyXG4gICAgICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgICAgIGtleT17dGFiLmtleX1cclxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxyXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGFiLm9uQ2xpY2t9XHJcbiAgICAgICAgICAgICAgICBhcmlhLWN1cnJlbnQ9e2lzQWN0aXZlID8gXCJwYWdlXCIgOiB1bmRlZmluZWR9XHJcbiAgICAgICAgICAgICAgICBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICBhcHBlYXJhbmNlOiBcIm5vbmVcIixcclxuICAgICAgICAgICAgICAgICAgV2Via2l0QXBwZWFyYW5jZTogXCJub25lXCIsXHJcbiAgICAgICAgICAgICAgICAgIG1pbldpZHRoOiAwLFxyXG4gICAgICAgICAgICAgICAgICBoZWlnaHQ6IDMwLFxyXG4gICAgICAgICAgICAgICAgICBwYWRkaW5nOiBcIjFweCA0cHggMFwiLFxyXG4gICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6IDgsXHJcbiAgICAgICAgICAgICAgICAgIGJvcmRlcjogaXNBY3RpdmUgPyBcIjFweCBzb2xpZCByZ2JhKDEzLDE0OCwxMzYsMC40NilcIiA6IFwiMXB4IHNvbGlkIHJnYmEoMTQ4LDE2MywxODQsMC4xNilcIixcclxuICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogaXNBY3RpdmVcclxuICAgICAgICAgICAgICAgICAgICA/IFwibGluZWFyLWdyYWRpZW50KDE4MGRlZywgcmdiYSg0NSwyMTIsMTkxLDAuMjIpLCByZ2JhKDE1LDExOCwxMTAsMC4xNCkpXCJcclxuICAgICAgICAgICAgICAgICAgICA6IFwibGluZWFyLWdyYWRpZW50KDE4MGRlZywgcmdiYSgyNTUsMjU1LDI1NSwwLjc0KSwgcmdiYSgyNDgsMjUwLDI1MiwwLjYyKSlcIixcclxuICAgICAgICAgICAgICAgICAgY29sb3I6IGlzQWN0aXZlID8gXCIjMGY3NjZlXCIgOiBpc0RhbmdlciA/IFwiI2RjMjYyNlwiIDogXCIjNDc1NTY5XCIsXHJcbiAgICAgICAgICAgICAgICAgIGJveFNoYWRvdzogaXNBY3RpdmUgPyBcIjAgMCA4cHggcmdiYSgyMCwxODQsMTY2LDAuMTgpXCIgOiBcIm5vbmVcIixcclxuICAgICAgICAgICAgICAgICAgZm9udFNpemU6IHRhYi5rZXkgPT09IFwicG9ydGFsXCIgPyAxMC41IDogMTEsXHJcbiAgICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6IGlzQWN0aXZlID8gODAwIDogNzAwLFxyXG4gICAgICAgICAgICAgICAgICBsZXR0ZXJTcGFjaW5nOiBcIi0wLjAyZW1cIixcclxuICAgICAgICAgICAgICAgICAgdGV4dFNoYWRvdzogaXNBY3RpdmVcclxuICAgICAgICAgICAgICAgICAgICA/IFwiMCAwIDRweCByZ2JhKDQ1LDIxMiwxOTEsMC4yNClcIlxyXG4gICAgICAgICAgICAgICAgICAgIDogaXNEYW5nZXJcclxuICAgICAgICAgICAgICAgICAgICAgID8gXCIwIDAgM3B4IHJnYmEoMjQ4LDExMywxMTMsMC4yKVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICA6IFwibm9uZVwiLFxyXG4gICAgICAgICAgICAgICAgICB3aGl0ZVNwYWNlOiBcIm5vd3JhcFwiLFxyXG4gICAgICAgICAgICAgICAgICBvdmVyZmxvdzogXCJoaWRkZW5cIixcclxuICAgICAgICAgICAgICAgICAgdGV4dE92ZXJmbG93OiBcImVsbGlwc2lzXCIsXHJcbiAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IFwiZmxleFwiLFxyXG4gICAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxyXG4gICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLFxyXG4gICAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcclxuICAgICAgICAgICAgICAgICAgZ2FwOiAyLFxyXG4gICAgICAgICAgICAgICAgICBiYWNrZHJvcEZpbHRlcjogXCJub25lXCIsXHJcbiAgICAgICAgICAgICAgICAgIFdlYmtpdEJhY2tkcm9wRmlsdGVyOiBcIm5vbmVcIixcclxuICAgICAgICAgICAgICAgICAgV2Via2l0VGFwSGlnaGxpZ2h0Q29sb3I6IFwidHJhbnNwYXJlbnRcIixcclxuICAgICAgICAgICAgICAgICAgb3V0bGluZTogXCJub25lXCIsXHJcbiAgICAgICAgICAgICAgICAgIHVzZXJTZWxlY3Q6IFwibm9uZVwiLFxyXG4gICAgICAgICAgICAgICAgICB0b3VjaEFjdGlvbjogXCJtYW5pcHVsYXRpb25cIixcclxuICAgICAgICAgICAgICAgICAgY3Vyc29yOiBcInBvaW50ZXJcIixcclxuICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogXCJiYWNrZ3JvdW5kIDAuMThzIGVhc2UsIGNvbG9yIDAuMThzIGVhc2UsIGJveC1zaGFkb3cgMC4xOHMgZWFzZSwgYm9yZGVyLWNvbG9yIDAuMThzIGVhc2VcIixcclxuICAgICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgbGluZUhlaWdodDogMSB9fT57dGFiLmxhYmVsfTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgIDxzcGFuXHJcbiAgICAgICAgICAgICAgICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiXHJcbiAgICAgICAgICAgICAgICAgIHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogXCJibG9ja1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiBpc0FjdGl2ZSA/IFwiNTIlXCIgOiBcIjAlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAxLjUsXHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiA5OTksXHJcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogXCJsaW5lYXItZ3JhZGllbnQoOTBkZWcsIzIyZDNlZSwjMmRkNGJmKVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGJveFNoYWRvdzogaXNBY3RpdmUgPyBcIjAgMCA0cHggcmdiYSg0NSwyMTIsMTkxLDAuMzgpXCIgOiBcIm5vbmVcIixcclxuICAgICAgICAgICAgICAgICAgICBvcGFjaXR5OiBpc0FjdGl2ZSA/IDEgOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb246IFwid2lkdGggMC4ycyBlYXNlLCBvcGFjaXR5IDAuMnMgZWFzZSwgYm94LXNoYWRvdyAwLjJzIGVhc2VcIixcclxuICAgICAgICAgICAgICAgICAgfX1cclxuICAgICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICB9KX1cclxuICAgICAgICA8L25hdj5cclxuICAgICAgPC9kaXY+XHJcbiAgICA8Lz5cclxuICApO1xyXG59XHJcblxyXG5mdW5jdGlvbiBTY3JvbGxUb1RvcCh7IGFwcEJvZHlSZWYgfSkge1xyXG4gIC8vIHVzZUxvY2F0aW9uIHRyaWdnZXJzIHdoZW4gdGhlIHJvdXRlIGNoYW5nZXM7IGVuc3VyZSB0aGUgc2luZ2xlIHZlcnRpY2FsIHNjcm9sbGVyXHJcbiAgLy8gKC5zdS1hcHBCb2R5KSBpcyByZXNldCB0byB0b3AuIERvIE5PVCB1c2Ugd2luZG93LnNjcm9sbFRvIHBlciByZXF1aXJlbWVudC5cclxuICBjb25zdCBsb2NhdGlvbiA9IHVzZUxvY2F0aW9uKCk7XHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGlmIChhcHBCb2R5UmVmICYmIGFwcEJvZHlSZWYuY3VycmVudCkgYXBwQm9keVJlZi5jdXJyZW50LnNjcm9sbFRvcCA9IDA7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIC8vIG5vb3BcclxuICAgIH1cclxuICB9LCBbbG9jYXRpb24sIGFwcEJvZHlSZWZdKTtcclxuICByZXR1cm4gbnVsbDtcclxufVxyXG5cclxuY29uc3QgVklQX1ZPVUNIRVJfVElUTEUgPSBcIuyngOyXreqzteycoOuwnOyghO2UjOueq+2PvCBWSVAg7IOB7ZKI6raMXCI7XHJcbmNvbnN0IFZJUF9WT1VDSEVSX1RZUEUgPSBcIlNIT1BfVVNFXCI7XHJcbmNvbnN0IFZJUF9NRVRBX01BUktFUiA9IFwiX19WSVBNRVRBX19cIjtcclxuY29uc3QgVklQX0FQSV9CQVNFID0gaW1wb3J0Lm1ldGEuZW52LlZJVEVfQVBJX1VSTCB8fCBcIlwiO1xyXG5jb25zdCBTSE9QX1ZPVUNIRVJfUEFZTUVOVF9DQUNIRV9LRVkgPSBcInN1X3Nob3Bfdm91Y2hlcl9wYXltZW50c192MlwiO1xyXG5cclxuZnVuY3Rpb24gZm9ybWF0Vm91Y2hlckFtb3VudCh2YWx1ZSkge1xyXG4gIGNvbnN0IGFtb3VudCA9IE51bWJlcih2YWx1ZSkgfHwgMDtcclxuICByZXR1cm4gYCR7YW1vdW50LnRvTG9jYWxlU3RyaW5nKFwia28tS1JcIil97JuQYDtcclxufVxyXG5cclxuY29uc3QgS1NUX0xPQ0FMRSA9IFwia28tS1JcIjtcclxuY29uc3QgS1NUX1RJTUVfWk9ORSA9IFwiQXNpYS9TZW91bFwiO1xyXG5cclxuZnVuY3Rpb24gcGFyc2VLU1REYXRlVmFsdWUodmFsdWUpIHtcclxuICBpZiAoIXZhbHVlICYmIHZhbHVlICE9PSAwKSByZXR1cm4gbnVsbDtcclxuICBpZiAodmFsdWUgaW5zdGFuY2VvZiBEYXRlKSB7XHJcbiAgICByZXR1cm4gTnVtYmVyLmlzTmFOKHZhbHVlLmdldFRpbWUoKSkgPyBudWxsIDogbmV3IERhdGUodmFsdWUuZ2V0VGltZSgpKTtcclxuICB9XHJcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJudW1iZXJcIikge1xyXG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKHZhbHVlKTtcclxuICAgIHJldHVybiBOdW1iZXIuaXNOYU4oZGF0ZS5nZXRUaW1lKCkpID8gbnVsbCA6IGRhdGU7XHJcbiAgfVxyXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIpIHtcclxuICAgIGNvbnN0IHRyaW1tZWQgPSB2YWx1ZS50cmltKCk7XHJcbiAgICBpZiAoIXRyaW1tZWQpIHJldHVybiBudWxsO1xyXG5cclxuICAgIGlmICgvXlxcZCskLy50ZXN0KHRyaW1tZWQpKSB7XHJcbiAgICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZShOdW1iZXIodHJpbW1lZCkpO1xyXG4gICAgICByZXR1cm4gTnVtYmVyLmlzTmFOKGRhdGUuZ2V0VGltZSgpKSA/IG51bGwgOiBkYXRlO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGRhdGVPbmx5TWF0Y2ggPSB0cmltbWVkLm1hdGNoKC9eKFxcZHs0fSktKFxcZHsyfSktKFxcZHsyfSkkLyk7XHJcbiAgICBpZiAoZGF0ZU9ubHlNYXRjaCkge1xyXG4gICAgICBjb25zdCBbLCB5ZWFyLCBtb250aCwgZGF5XSA9IGRhdGVPbmx5TWF0Y2g7XHJcbiAgICAgIHJldHVybiBuZXcgRGF0ZShEYXRlLlVUQyhOdW1iZXIoeWVhciksIE51bWJlcihtb250aCkgLSAxLCBOdW1iZXIoZGF5KSwgLTksIDAsIDAsIDApKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBuYWl2ZURhdGVUaW1lTWF0Y2ggPSB0cmltbWVkLm1hdGNoKC9eKFxcZHs0fSktKFxcZHsyfSktKFxcZHsyfSlbIFRdKFxcZHsyfSk6KFxcZHsyfSkoPzo6KFxcZHsyfSkpPyg/OlxcLihcXGR7MSwzfSkpPyQvKTtcclxuICAgIGlmIChuYWl2ZURhdGVUaW1lTWF0Y2gpIHtcclxuICAgICAgY29uc3QgWywgeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQgPSBcIjBcIiwgbWlsbGlzZWNvbmQgPSBcIjBcIl0gPSBuYWl2ZURhdGVUaW1lTWF0Y2g7XHJcbiAgICAgIHJldHVybiBuZXcgRGF0ZShEYXRlLlVUQyhcclxuICAgICAgICBOdW1iZXIoeWVhciksXHJcbiAgICAgICAgTnVtYmVyKG1vbnRoKSAtIDEsXHJcbiAgICAgICAgTnVtYmVyKGRheSksXHJcbiAgICAgICAgTnVtYmVyKGhvdXIpIC0gOSxcclxuICAgICAgICBOdW1iZXIobWludXRlKSxcclxuICAgICAgICBOdW1iZXIoc2Vjb25kKSxcclxuICAgICAgICBOdW1iZXIobWlsbGlzZWNvbmQucGFkRW5kKDMsIFwiMFwiKSksXHJcbiAgICAgICkpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSh0cmltbWVkKTtcclxuICAgIHJldHVybiBOdW1iZXIuaXNOYU4oZGF0ZS5nZXRUaW1lKCkpID8gbnVsbCA6IGRhdGU7XHJcbiAgfVxyXG5cclxuICBjb25zdCBkYXRlID0gbmV3IERhdGUodmFsdWUpO1xyXG4gIHJldHVybiBOdW1iZXIuaXNOYU4oZGF0ZS5nZXRUaW1lKCkpID8gbnVsbCA6IGRhdGU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZvcm1hdEtTVERhdGUodmFsdWUpIHtcclxuICBjb25zdCBkYXRlID0gcGFyc2VLU1REYXRlVmFsdWUodmFsdWUpO1xyXG4gIGlmICghZGF0ZSkgcmV0dXJuIFwiLVwiO1xyXG4gIHJldHVybiBuZXcgSW50bC5EYXRlVGltZUZvcm1hdChLU1RfTE9DQUxFLCB7XHJcbiAgICB0aW1lWm9uZTogS1NUX1RJTUVfWk9ORSxcclxuICAgIHllYXI6IFwibnVtZXJpY1wiLFxyXG4gICAgbW9udGg6IFwibnVtZXJpY1wiLFxyXG4gICAgZGF5OiBcIm51bWVyaWNcIixcclxuICB9KS5mb3JtYXQoZGF0ZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZvcm1hdEtTVFRpbWUodmFsdWUpIHtcclxuICBjb25zdCBkYXRlID0gcGFyc2VLU1REYXRlVmFsdWUodmFsdWUpO1xyXG4gIGlmICghZGF0ZSkgcmV0dXJuIFwiLVwiO1xyXG4gIHJldHVybiBuZXcgSW50bC5EYXRlVGltZUZvcm1hdChLU1RfTE9DQUxFLCB7XHJcbiAgICB0aW1lWm9uZTogS1NUX1RJTUVfWk9ORSxcclxuICAgIGhvdXI6IFwibnVtZXJpY1wiLFxyXG4gICAgbWludXRlOiBcIjItZGlnaXRcIixcclxuICAgIHNlY29uZDogXCIyLWRpZ2l0XCIsXHJcbiAgICBob3VyMTI6IHRydWUsXHJcbiAgfSkuZm9ybWF0KGRhdGUpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBmb3JtYXRLU1REYXRlVGltZSh2YWx1ZSkge1xyXG4gIGNvbnN0IGRhdGUgPSBwYXJzZUtTVERhdGVWYWx1ZSh2YWx1ZSk7XHJcbiAgaWYgKCFkYXRlKSByZXR1cm4gXCItXCI7XHJcbiAgcmV0dXJuIG5ldyBJbnRsLkRhdGVUaW1lRm9ybWF0KEtTVF9MT0NBTEUsIHtcclxuICAgIHRpbWVab25lOiBLU1RfVElNRV9aT05FLFxyXG4gICAgeWVhcjogXCJudW1lcmljXCIsXHJcbiAgICBtb250aDogXCJudW1lcmljXCIsXHJcbiAgICBkYXk6IFwibnVtZXJpY1wiLFxyXG4gICAgaG91cjogXCJudW1lcmljXCIsXHJcbiAgICBtaW51dGU6IFwiMi1kaWdpdFwiLFxyXG4gICAgc2Vjb25kOiBcIjItZGlnaXRcIixcclxuICAgIGhvdXIxMjogdHJ1ZSxcclxuICB9KS5mb3JtYXQoZGF0ZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGZvcm1hdFZvdWNoZXJEYXRlKHZhbHVlKSB7XHJcbiAgcmV0dXJuIGZvcm1hdEtTVERhdGUodmFsdWUpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBmb3JtYXRWb3VjaGVyRGF0ZVRpbWUodmFsdWUpIHtcclxuICByZXR1cm4gZm9ybWF0S1NURGF0ZVRpbWUodmFsdWUpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBidWlsZFZvdWNoZXJEYXRlS2V5KHZhbHVlID0gbmV3IERhdGUoKSkge1xyXG4gIGNvbnN0IGRhdGUgPSB2YWx1ZSBpbnN0YW5jZW9mIERhdGUgPyB2YWx1ZSA6IG5ldyBEYXRlKHZhbHVlKTtcclxuICByZXR1cm4gYCR7ZGF0ZS5nZXRGdWxsWWVhcigpfSR7U3RyaW5nKGRhdGUuZ2V0TW9udGgoKSArIDEpLnBhZFN0YXJ0KDIsIFwiMFwiKX0ke1N0cmluZyhkYXRlLmdldERhdGUoKSkucGFkU3RhcnQoMiwgXCIwXCIpfWA7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdlbmVyYXRlVm91Y2hlclNlcmlhbCgpIHtcclxuICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xyXG4gIGNvbnN0IGRheUtleSA9IGJ1aWxkVm91Y2hlckRhdGVLZXkobm93KTtcclxuICBjb25zdCBzdG9yYWdlS2V5ID0gYHN1X3ZpcF92b3VjaGVyX3NlcV8ke2RheUtleX1gO1xyXG4gIGNvbnN0IG5leHQgPSBOdW1iZXIod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKHN0b3JhZ2VLZXkpIHx8IFwiMFwiKSArIDE7XHJcbiAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKHN0b3JhZ2VLZXksIFN0cmluZyhuZXh0KSk7XHJcbiAgY29uc3QgdGltZVRhaWwgPSBTdHJpbmcobm93LmdldFRpbWUoKSkuc2xpY2UoLTQpO1xyXG4gIHJldHVybiBgVklQLSR7ZGF5S2V5fS0ke1N0cmluZyhuZXh0KS5wYWRTdGFydCg2LCBcIjBcIil9JHt0aW1lVGFpbH1gO1xyXG59XHJcblxyXG5mdW5jdGlvbiBidWlsZFZvdWNoZXJQcmV2aWV3U2VyaWFsKCkge1xyXG4gIHJldHVybiBgVklQLSR7YnVpbGRWb3VjaGVyRGF0ZUtleSgpfS0wMDAwMDFgO1xyXG59XHJcblxyXG5mdW5jdGlvbiBidWlsZFZvdWNoZXJEZXNjcmlwdGlvbihyZWFzb24sIGlzc3VlUmVnaW9uKSB7XHJcbiAgY29uc3QgY2xlYW5SZWFzb24gPSBTdHJpbmcocmVhc29uIHx8IFwiXCIpLnRyaW0oKTtcclxuICBjb25zdCBjbGVhblJlZ2lvbiA9IFN0cmluZyhpc3N1ZVJlZ2lvbiB8fCBcIlwiKS50cmltKCk7XHJcbiAgY29uc3QgbWV0YSA9IEpTT04uc3RyaW5naWZ5KHsgaXNzdWVSZWdpb246IGNsZWFuUmVnaW9uIHx8IG51bGwgfSk7XHJcbiAgcmV0dXJuIGAke2NsZWFuUmVhc29ufSR7Y2xlYW5SZWFzb24gPyBcIlxcblwiIDogXCJcIn0ke1ZJUF9NRVRBX01BUktFUn0ke21ldGF9YDtcclxufVxyXG5cclxuZnVuY3Rpb24gcGFyc2VWb3VjaGVyRGVzY3JpcHRpb24oZGVzY3JpcHRpb24pIHtcclxuICBjb25zdCByYXcgPSBTdHJpbmcoZGVzY3JpcHRpb24gfHwgXCJcIik7XHJcbiAgY29uc3QgbWFya2VySW5kZXggPSByYXcuaW5kZXhPZihWSVBfTUVUQV9NQVJLRVIpO1xyXG4gIGlmIChtYXJrZXJJbmRleCA8IDApIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHJlYXNvbjogcmF3LnRyaW0oKSxcclxuICAgICAgaXNzdWVSZWdpb246IFwiXCIsXHJcbiAgICAgIGZyb21NZW1iZXJJZDogXCJcIixcclxuICAgICAgZnJvbU1lbWJlck5hbWU6IFwiXCIsXHJcbiAgICAgIHRvTWVtYmVySWQ6IFwiXCIsXHJcbiAgICAgIHRvTWVtYmVyTmFtZTogXCJcIixcclxuICAgICAgc2hvcElkOiBcIlwiLFxyXG4gICAgICBzaG9wTmFtZTogXCJcIixcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBjb25zdCByZWFzb24gPSByYXcuc2xpY2UoMCwgbWFya2VySW5kZXgpLnRyaW0oKTtcclxuICBjb25zdCBtZXRhUmF3ID0gcmF3LnNsaWNlKG1hcmtlckluZGV4ICsgVklQX01FVEFfTUFSS0VSLmxlbmd0aCkudHJpbSgpO1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBtZXRhID0gSlNPTi5wYXJzZShtZXRhUmF3IHx8IFwie31cIik7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICByZWFzb24sXHJcbiAgICAgIGlzc3VlUmVnaW9uOiBTdHJpbmcobWV0YT8uaXNzdWVSZWdpb24gfHwgXCJcIikudHJpbSgpLFxyXG4gICAgICBmcm9tTWVtYmVySWQ6IFN0cmluZyhtZXRhPy5mcm9tTWVtYmVySWQgfHwgXCJcIikudHJpbSgpLFxyXG4gICAgICBmcm9tTWVtYmVyTmFtZTogU3RyaW5nKG1ldGE/LmZyb21NZW1iZXJOYW1lIHx8IFwiXCIpLnRyaW0oKSxcclxuICAgICAgdG9NZW1iZXJJZDogU3RyaW5nKG1ldGE/LnRvTWVtYmVySWQgfHwgXCJcIikudHJpbSgpLFxyXG4gICAgICB0b01lbWJlck5hbWU6IFN0cmluZyhtZXRhPy50b01lbWJlck5hbWUgfHwgXCJcIikudHJpbSgpLFxyXG4gICAgICBzaG9wSWQ6IFN0cmluZyhtZXRhPy5zaG9wSWQgfHwgXCJcIikudHJpbSgpLFxyXG4gICAgICBzaG9wTmFtZTogU3RyaW5nKG1ldGE/LnNob3BOYW1lIHx8IFwiXCIpLnRyaW0oKSxcclxuICAgIH07XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHJlYXNvbixcclxuICAgICAgaXNzdWVSZWdpb246IFwiXCIsXHJcbiAgICAgIGZyb21NZW1iZXJJZDogXCJcIixcclxuICAgICAgZnJvbU1lbWJlck5hbWU6IFwiXCIsXHJcbiAgICAgIHRvTWVtYmVySWQ6IFwiXCIsXHJcbiAgICAgIHRvTWVtYmVyTmFtZTogXCJcIixcclxuICAgICAgc2hvcElkOiBcIlwiLFxyXG4gICAgICBzaG9wTmFtZTogXCJcIixcclxuICAgIH07XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiByZWFkU2hvcFZvdWNoZXJQYXltZW50Q2FjaGUoKSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJhdyA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShTSE9QX1ZPVUNIRVJfUEFZTUVOVF9DQUNIRV9LRVkpO1xyXG4gICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShyYXcgfHwgXCJbXVwiKTtcclxuICAgIHJldHVybiBBcnJheS5pc0FycmF5KHBhcnNlZCkgPyBwYXJzZWQgOiBbXTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgcmV0dXJuIFtdO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gd3JpdGVTaG9wVm91Y2hlclBheW1lbnRDYWNoZShyZWNvcmRzKSB7XHJcbiAgdHJ5IHtcclxuICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShTSE9QX1ZPVUNIRVJfUEFZTUVOVF9DQUNIRV9LRVksIEpTT04uc3RyaW5naWZ5KHJlY29yZHMpKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgLy8gbm9vcFxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gcmVtZW1iZXJTaG9wVm91Y2hlclBheW1lbnQocmVjb3JkKSB7XHJcbiAgaWYgKCFyZWNvcmQ/LnNob3BJZCB8fCAhcmVjb3JkPy5zZXJpYWwgfHwgIXJlY29yZD8uYW1vdW50KSByZXR1cm47XHJcbiAgY29uc3Qgbm9ybWFsaXplZCA9IHtcclxuICAgIGtpbmQ6IFwidm91Y2hlcl9zaG9wX3BheVwiLFxyXG4gICAgdm91Y2hlclR5cGU6IFwiVklQXCIsXHJcbiAgICBhbW91bnQ6IE51bWJlcihyZWNvcmQuYW1vdW50KSB8fCAwLFxyXG4gICAgc2VyaWFsOiBTdHJpbmcocmVjb3JkLnNlcmlhbCB8fCBcIlwiKS50cmltKCksXHJcbiAgICB1c2VySWQ6IFN0cmluZyhyZWNvcmQudXNlcklkIHx8IFwiXCIpLnRyaW0oKSxcclxuICAgIHVzZXJOYW1lOiBTdHJpbmcocmVjb3JkLnVzZXJOYW1lIHx8IFwiXCIpLnRyaW0oKSxcclxuICAgIHNob3BJZDogU3RyaW5nKHJlY29yZC5zaG9wSWQgfHwgXCJcIikudHJpbSgpLFxyXG4gICAgc2hvcE5hbWU6IFN0cmluZyhyZWNvcmQuc2hvcE5hbWUgfHwgXCJcIikudHJpbSgpLFxyXG4gICAgdXNlZEF0OiBTdHJpbmcocmVjb3JkLnVzZWRBdCB8fCBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkpLnRyaW0oKSxcclxuICAgIGlzc3VlUmVnaW9uOiBTdHJpbmcocmVjb3JkLmlzc3VlUmVnaW9uIHx8IFwiXCIpLnRyaW0oKSxcclxuICAgIHJlYXNvbjogU3RyaW5nKHJlY29yZC5yZWFzb24gfHwgXCLsg4HsoJDqsrDsoJxcIikudHJpbSgpLFxyXG4gICAgc3RhdHVzOiBTdHJpbmcocmVjb3JkLnN0YXR1cyB8fCBcInVzZWRcIikudHJpbSgpLFxyXG4gIH07XHJcbiAgY29uc3QgY2FjaGUgPSByZWFkU2hvcFZvdWNoZXJQYXltZW50Q2FjaGUoKTtcclxuICBjb25zdCBkZWR1cGVLZXkgPSBgJHtub3JtYWxpemVkLnNob3BJZH1fXyR7bm9ybWFsaXplZC5zZXJpYWx9X18ke25vcm1hbGl6ZWQuYW1vdW50fV9fJHtub3JtYWxpemVkLnVzZXJJZH1gO1xyXG4gIGNvbnN0IG5leHQgPSBbbm9ybWFsaXplZCwgLi4uY2FjaGUuZmlsdGVyKChlbnRyeSkgPT4gYCR7ZW50cnkuc2hvcElkfV9fJHtlbnRyeS5zZXJpYWx9X18ke051bWJlcihlbnRyeS5hbW91bnQpIHx8IDB9X18ke2VudHJ5LnVzZXJJZH1gICE9PSBkZWR1cGVLZXkpXS5zbGljZSgwLCAyMDApO1xyXG4gIHdyaXRlU2hvcFZvdWNoZXJQYXltZW50Q2FjaGUobmV4dCk7XHJcbiAgd2luZG93LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KFwic3U6dm91Y2hlcjpzaG9wLXBheW1lbnRzXCIsIHsgZGV0YWlsOiBub3JtYWxpemVkIH0pKTtcclxufVxyXG5cclxuZnVuY3Rpb24gbm9ybWFsaXplU2hvcFZvdWNoZXJQYXltZW50UmVjb3JkKHJlY29yZCkge1xyXG4gIGlmICghcmVjb3JkPy5zaG9wSWQgfHwgIXJlY29yZD8uc2VyaWFsKSByZXR1cm4gbnVsbDtcclxuICByZXR1cm4ge1xyXG4gICAga2luZDogXCJ2b3VjaGVyX3Nob3BfcGF5XCIsXHJcbiAgICB2b3VjaGVyVHlwZTogXCJWSVBcIixcclxuICAgIGFtb3VudDogTnVtYmVyKHJlY29yZC5hbW91bnQpIHx8IDAsXHJcbiAgICBzZXJpYWw6IFN0cmluZyhyZWNvcmQuc2VyaWFsIHx8IFwiXCIpLnRyaW0oKSxcclxuICAgIHVzZXJJZDogU3RyaW5nKHJlY29yZC51c2VySWQgfHwgXCJcIikudHJpbSgpLFxyXG4gICAgdXNlck5hbWU6IFN0cmluZyhyZWNvcmQudXNlck5hbWUgfHwgXCJcIikudHJpbSgpLFxyXG4gICAgc2hvcElkOiBTdHJpbmcocmVjb3JkLnNob3BJZCB8fCBcIlwiKS50cmltKCksXHJcbiAgICBzaG9wTmFtZTogU3RyaW5nKHJlY29yZC5zaG9wTmFtZSB8fCBcIlwiKS50cmltKCksXHJcbiAgICB1c2VkQXQ6IFN0cmluZyhyZWNvcmQudXNlZEF0IHx8IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSkudHJpbSgpLFxyXG4gICAgaXNzdWVSZWdpb246IFN0cmluZyhyZWNvcmQuaXNzdWVSZWdpb24gfHwgXCJcIikudHJpbSgpLFxyXG4gICAgcmVhc29uOiBTdHJpbmcocmVjb3JkLnJlYXNvbiB8fCBcIuyDgeygkOqysOygnFwiKS50cmltKCksXHJcbiAgICBzdGF0dXM6IFwidXNlZFwiLFxyXG4gIH07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG1lcmdlU2hvcFZvdWNoZXJQYXltZW50UmVjb3JkcyguLi5ncm91cHMpIHtcclxuICBjb25zdCBtZXJnZWQgPSBbXTtcclxuICBjb25zdCBzZWVuID0gbmV3IFNldCgpO1xyXG4gIGdyb3Vwcy5mbGF0KCkuZm9yRWFjaCgoZW50cnkpID0+IHtcclxuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBub3JtYWxpemVTaG9wVm91Y2hlclBheW1lbnRSZWNvcmQoZW50cnkpO1xyXG4gICAgaWYgKCFub3JtYWxpemVkKSByZXR1cm47XHJcbiAgICBjb25zdCBkZWR1cGVLZXkgPSBgJHtub3JtYWxpemVkLnNob3BJZH1fXyR7bm9ybWFsaXplZC5zZXJpYWx9X18ke25vcm1hbGl6ZWQuYW1vdW50fV9fJHtub3JtYWxpemVkLnVzZXJJZH1gO1xyXG4gICAgaWYgKHNlZW4uaGFzKGRlZHVwZUtleSkpIHJldHVybjtcclxuICAgIHNlZW4uYWRkKGRlZHVwZUtleSk7XHJcbiAgICBtZXJnZWQucHVzaChub3JtYWxpemVkKTtcclxuICB9KTtcclxuICByZXR1cm4gbWVyZ2VkLnNvcnQoKGxlZnQsIHJpZ2h0KSA9PiBuZXcgRGF0ZShyaWdodC51c2VkQXQpLmdldFRpbWUoKSAtIG5ldyBEYXRlKGxlZnQudXNlZEF0KS5nZXRUaW1lKCkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjb252ZXJ0U2hvcFZvdWNoZXJIaXN0b3J5VG9SZWNvcmRzKHNob3AsIGhpc3RvcnkgPSBbXSkge1xyXG4gIGNvbnN0IHNob3BJZCA9IFN0cmluZyhzaG9wPy5pZCB8fCBzaG9wPy5zaG9wSWQgfHwgXCJcIikudHJpbSgpO1xyXG4gIGNvbnN0IHNob3BOYW1lID0gU3RyaW5nKHNob3A/Lm5hbWUgfHwgXCJcIikudHJpbSgpO1xyXG4gIHJldHVybiAoQXJyYXkuaXNBcnJheShoaXN0b3J5KSA/IGhpc3RvcnkgOiBbXSlcclxuICAgIC5maWx0ZXIoKGVudHJ5KSA9PiB7XHJcbiAgICAgIGNvbnN0IGFtb3VudCA9IE51bWJlcihlbnRyeT8uYW1vdW50KSB8fCAwO1xyXG4gICAgICBjb25zdCBzb3VyY2UgPSBTdHJpbmcoZW50cnk/LnNvdXJjZSB8fCBcIlwiKS50b1VwcGVyQ2FzZSgpO1xyXG4gICAgICBpZiAoYW1vdW50IDw9IDApIHJldHVybiBmYWxzZTtcclxuICAgICAgLy8g7Jq07JiB7JeQ7IScIHNvdXJjZSDtkZzquLDqsIAg64us652864+EIOyDgeygkCDsnKDsnoXshLEgcm9364qUIO2RnOyLnOuQmOuPhOuhnSDtl4jsmqlcclxuICAgICAgcmV0dXJuIHNvdXJjZSA9PT0gXCJWT1VDSEVSX1NIT1BfVFJBTlNGRVJfSU5cIiB8fCBzb3VyY2UgPT09IFwiU0hPUF9UUkFOU0ZFUl9JTlwiIHx8IHNvdXJjZSA9PT0gXCJTSE9QX0lOXCI7XHJcbiAgICB9KVxyXG4gICAgLm1hcCgoZW50cnkpID0+IHtcclxuICAgICAgY29uc3QgcGFyc2VkID0gcGFyc2VWb3VjaGVyRGVzY3JpcHRpb24oZW50cnk/LmRlc2NyaXB0aW9uIHx8IFwiXCIpO1xyXG4gICAgICByZXR1cm4gbm9ybWFsaXplU2hvcFZvdWNoZXJQYXltZW50UmVjb3JkKHtcclxuICAgICAgICBzaG9wSWQsXHJcbiAgICAgICAgc2hvcE5hbWU6IHBhcnNlZC5zaG9wTmFtZSB8fCBzaG9wTmFtZSxcclxuICAgICAgICB1c2VySWQ6IHBhcnNlZC5mcm9tTWVtYmVySWQsXHJcbiAgICAgICAgdXNlck5hbWU6IHBhcnNlZC5mcm9tTWVtYmVyTmFtZSxcclxuICAgICAgICBzZXJpYWw6IGVudHJ5Py5yZWZlcmVuY2VJZCB8fCBub3JtYWxpemVWb3VjaGVyU2VyaWFsKGVudHJ5Py5yZWZlcmVuY2VJZCwgZW50cnk/LmNyZWF0ZWRBdCwgZW50cnk/LmlkKSxcclxuICAgICAgICBhbW91bnQ6IE51bWJlcihlbnRyeT8uYW1vdW50KSB8fCAwLFxyXG4gICAgICAgIHVzZWRBdDogZW50cnk/LmNyZWF0ZWRBdCxcclxuICAgICAgICBpc3N1ZVJlZ2lvbjogcGFyc2VkLmlzc3VlUmVnaW9uLFxyXG4gICAgICAgIHJlYXNvbjogcGFyc2VkLnJlYXNvbiB8fCBcIuyDgeygkOqysOygnFwiLFxyXG4gICAgICAgIHN0YXR1czogXCJ1c2VkXCIsXHJcbiAgICAgIH0pO1xyXG4gICAgfSlcclxuICAgIC5maWx0ZXIoQm9vbGVhbik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGV4dHJhY3RTaG9wVm91Y2hlclBheW1lbnRSZWNvcmQocGF5bG9hZCkge1xyXG4gIGNvbnN0IHBhcnNlZCA9IHBhcnNlVm91Y2hlckRlc2NyaXB0aW9uKHBheWxvYWQ/LnJlY2VpdmVyRGVzY3JpcHRpb24gfHwgcGF5bG9hZD8uZGVzY3JpcHRpb24gfHwgcGF5bG9hZD8uc2VuZGVyRGVzY3JpcHRpb24gfHwgXCJcIik7XHJcbiAgY29uc3QgYW1vdW50ID0gTnVtYmVyKHBheWxvYWQ/LmFtb3VudCkgfHwgMDtcclxuICBjb25zdCBzaG9wSWQgPSBTdHJpbmcocGF5bG9hZD8uc2hvcElkIHx8IHBheWxvYWQ/Lm1lbWJlcklkIHx8IHBhcnNlZC5zaG9wSWQgfHwgXCJcIikudHJpbSgpO1xyXG4gIGNvbnN0IHNob3BOYW1lID0gU3RyaW5nKHBhcnNlZC5zaG9wTmFtZSB8fCBwYXlsb2FkPy5zaG9wTmFtZSB8fCBcIlwiKS50cmltKCk7XHJcbiAgY29uc3QgdXNlcklkID0gU3RyaW5nKHBheWxvYWQ/LmZyb21NZW1iZXJJZCB8fCBwYXJzZWQuZnJvbU1lbWJlcklkIHx8IFwiXCIpLnRyaW0oKTtcclxuICBjb25zdCB1c2VyTmFtZSA9IFN0cmluZyhwYXJzZWQuZnJvbU1lbWJlck5hbWUgfHwgcGF5bG9hZD8udXNlck5hbWUgfHwgXCJcIikudHJpbSgpO1xyXG4gIGNvbnN0IHNlcmlhbCA9IFN0cmluZyhwYXlsb2FkPy5yZWZlcmVuY2VJZCB8fCBwYXlsb2FkPy5zZXJpYWwgfHwgXCJcIikudHJpbSgpO1xyXG4gIGlmICghc2hvcElkIHx8ICFzZXJpYWwgfHwgYW1vdW50IDw9IDApIHJldHVybiBudWxsO1xyXG4gIHJldHVybiB7XHJcbiAgICBraW5kOiBcInZvdWNoZXJfc2hvcF9wYXlcIixcclxuICAgIHZvdWNoZXJUeXBlOiBcIlZJUFwiLFxyXG4gICAgYW1vdW50LFxyXG4gICAgc2VyaWFsLFxyXG4gICAgdXNlcklkLFxyXG4gICAgdXNlck5hbWUsXHJcbiAgICBzaG9wSWQsXHJcbiAgICBzaG9wTmFtZSxcclxuICAgIHVzZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxyXG4gICAgaXNzdWVSZWdpb246IHBhcnNlZC5pc3N1ZVJlZ2lvbixcclxuICAgIHJlYXNvbjogXCLsg4HsoJDqsrDsoJxcIixcclxuICAgIHN0YXR1czogXCJ1c2VkXCIsXHJcbiAgfTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2FuaXRpemVWaXBBbW91bnRMYWJlbHMocm9vdCA9IGRvY3VtZW50LmJvZHkpIHtcclxuICBpZiAoIXJvb3Q/LnF1ZXJ5U2VsZWN0b3JBbGwpIHJldHVybjtcclxuICBjb25zdCBlbGVtZW50cyA9IHJvb3QucXVlcnlTZWxlY3RvckFsbChcIi5zdS12aXAtYmFkZ2UsIGRpdiwgc3BhbiwgcCwgc3Ryb25nXCIpO1xyXG4gIGVsZW1lbnRzLmZvckVhY2goKGVsZW1lbnQpID0+IHtcclxuICAgIGlmICghZWxlbWVudCB8fCBlbGVtZW50LmNoaWxkRWxlbWVudENvdW50ID4gMCkgcmV0dXJuO1xyXG4gICAgY29uc3QgdGV4dCA9IFN0cmluZyhlbGVtZW50LnRleHRDb250ZW50IHx8IFwiXCIpO1xyXG4gICAgaWYgKCF0ZXh0IHx8ICEoL1ZJUC8udGVzdCh0ZXh0KSAmJiAv7J6lLy50ZXN0KHRleHQpKSkgcmV0dXJuO1xyXG4gICAgbGV0IG5leHQgPSB0ZXh0O1xyXG4gICAgbmV4dCA9IG5leHQucmVwbGFjZSgv8J+On++4j1xccypWSVBcXHMqKFswLTldWzAtOSxdKinsnqUvZywgKF8sIHZhbHVlKSA9PiBg8J+On++4jyBWSVAgJHtmb3JtYXRWb3VjaGVyQW1vdW50KE51bWJlcihTdHJpbmcodmFsdWUpLnJlcGxhY2UoLywvZywgXCJcIikpKX1gKTtcclxuICAgIG5leHQgPSBuZXh0LnJlcGxhY2UoL1ZJUCDsg4HtkojqtoxcXHMqKFswLTldWzAtOSxdKinsnqUvZywgKF8sIHZhbHVlKSA9PiBgVklQIOyDge2SiOq2jCAke2Zvcm1hdFZvdWNoZXJBbW91bnQoTnVtYmVyKFN0cmluZyh2YWx1ZSkucmVwbGFjZSgvLC9nLCBcIlwiKSkpfWApO1xyXG4gICAgbmV4dCA9IG5leHQucmVwbGFjZSgvVklQXFxzKihbMC05XVswLTksXSop7J6lL2csIChfLCB2YWx1ZSkgPT4gYFZJUCAke2Zvcm1hdFZvdWNoZXJBbW91bnQoTnVtYmVyKFN0cmluZyh2YWx1ZSkucmVwbGFjZSgvLC9nLCBcIlwiKSkpfWApO1xyXG4gICAgaWYgKG5leHQgIT09IHRleHQpIHtcclxuICAgICAgZWxlbWVudC50ZXh0Q29udGVudCA9IG5leHQ7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFZvdWNoZXJGZXRjaFJlY29yZGVyKCkge1xyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBpZiAod2luZG93Ll9fc3VWaXBWb3VjaGVyRmV0Y2hSZWNvcmRlckluc3RhbGxlZCkgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIGNvbnN0IG9yaWdpbmFsRmV0Y2ggPSB3aW5kb3cuZmV0Y2guYmluZCh3aW5kb3cpO1xyXG4gICAgd2luZG93Ll9fc3VWaXBWb3VjaGVyRmV0Y2hSZWNvcmRlckluc3RhbGxlZCA9IHRydWU7XHJcbiAgICB3aW5kb3cuZmV0Y2ggPSBhc3luYyAoaW5wdXQsIGluaXQgPSB7fSkgPT4ge1xyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IG9yaWdpbmFsRmV0Y2goaW5wdXQsIGluaXQpO1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHVybFZhbHVlID0gdHlwZW9mIGlucHV0ID09PSBcInN0cmluZ1wiID8gaW5wdXQgOiBpbnB1dD8udXJsIHx8IFwiXCI7XHJcbiAgICAgICAgY29uc3QgcGF0aG5hbWUgPSBuZXcgVVJMKHVybFZhbHVlLCB3aW5kb3cubG9jYXRpb24ub3JpZ2luKS5wYXRobmFtZTtcclxuICAgICAgICBjb25zdCBtZXRob2QgPSBTdHJpbmcoaW5pdD8ubWV0aG9kIHx8IGlucHV0Py5tZXRob2QgfHwgXCJHRVRcIikudG9VcHBlckNhc2UoKTtcclxuICAgICAgICBpZiAobWV0aG9kID09PSBcIlBPU1RcIiAmJiByZXNwb25zZS5vayAmJiAocGF0aG5hbWUgPT09IFwiL2FwaS92b3VjaGVycy90cmFuc2ZlclwiIHx8IHBhdGhuYW1lID09PSBcIi9hcGkvdm91Y2hlcnMvaXNzdWVcIikpIHtcclxuICAgICAgICAgIGNvbnN0IGJvZHlUZXh0ID0gdHlwZW9mIGluaXQ/LmJvZHkgPT09IFwic3RyaW5nXCIgPyBpbml0LmJvZHkgOiBcIlwiO1xyXG4gICAgICAgICAgY29uc3QgcGF5bG9hZCA9IGJvZHlUZXh0ID8gSlNPTi5wYXJzZShib2R5VGV4dCkgOiBudWxsO1xyXG4gICAgICAgICAgaWYgKHBheWxvYWQpIHtcclxuICAgICAgICAgICAgaWYgKHBhdGhuYW1lID09PSBcIi9hcGkvdm91Y2hlcnMvdHJhbnNmZXJcIiAmJiBTdHJpbmcocGF5bG9hZD8udGFyZ2V0VHlwZSB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpID09PSBcInNob3BcIikge1xyXG4gICAgICAgICAgICAgIGNvbnN0IHJlY29yZCA9IGV4dHJhY3RTaG9wVm91Y2hlclBheW1lbnRSZWNvcmQocGF5bG9hZCk7XHJcbiAgICAgICAgICAgICAgaWYgKHJlY29yZCkgcmVtZW1iZXJTaG9wVm91Y2hlclBheW1lbnQocmVjb3JkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocGF0aG5hbWUgPT09IFwiL2FwaS92b3VjaGVycy9pc3N1ZVwiICYmIFN0cmluZyhwYXlsb2FkPy50YXJnZXRUeXBlIHx8IFwiXCIpLnRvTG93ZXJDYXNlKCkgPT09IFwic2hvcFwiICYmIFN0cmluZyhwYXlsb2FkPy5zb3VyY2UgfHwgXCJcIikudG9VcHBlckNhc2UoKSA9PT0gXCJWT1VDSEVSX1NIT1BfVFJBTlNGRVJfSU5cIikge1xyXG4gICAgICAgICAgICAgIGNvbnN0IHJlY29yZCA9IGV4dHJhY3RTaG9wVm91Y2hlclBheW1lbnRSZWNvcmQocGF5bG9hZCk7XHJcbiAgICAgICAgICAgICAgaWYgKHJlY29yZCkgcmVtZW1iZXJTaG9wVm91Y2hlclBheW1lbnQocmVjb3JkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAvLyBub29wXHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgfTtcclxuICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgfSwgW10pO1xyXG5cclxuICByZXR1cm4gbnVsbDtcclxufVxyXG5cclxuZnVuY3Rpb24gU2hvcFZvdWNoZXJQYXltZW50QnJpZGdlKCkge1xyXG4gIGNvbnN0IGxvY2F0aW9uID0gdXNlTG9jYXRpb24oKTtcclxuICBjb25zdCBbaGVhZGVyTm9kZSwgc2V0SGVhZGVyTm9kZV0gPSB1c2VTdGF0ZShudWxsKTtcclxuICBjb25zdCBbbW91bnROb2RlLCBzZXRNb3VudE5vZGVdID0gdXNlU3RhdGUobnVsbCk7XHJcbiAgY29uc3QgW3Nob3BQYW5lbE5vZGUsIHNldFNob3BQYW5lbE5vZGVdID0gdXNlU3RhdGUobnVsbCk7XHJcbiAgY29uc3QgW293bmVkU2hvcHMsIHNldE93bmVkU2hvcHNdID0gdXNlU3RhdGUoW10pO1xyXG4gIGNvbnN0IFtyZWNvcmRzLCBzZXRSZWNvcmRzXSA9IHVzZVN0YXRlKFtdKTtcclxuICBjb25zdCBbYWN0aXZlU2hvcElkLCBzZXRBY3RpdmVTaG9wSWRdID0gdXNlU3RhdGUoXCJcIik7XHJcbiAgY29uc3QgW2F1dGhSZWxvYWRUaWNrLCBzZXRBdXRoUmVsb2FkVGlja10gPSB1c2VTdGF0ZSgwKTtcclxuICBjb25zdCBbaXNFeHBhbmRlZCwgc2V0SXNFeHBhbmRlZF0gPSB1c2VTdGF0ZShmYWxzZSk7XHJcbiAgY29uc3QgW3Nob3BFYXJuZWQsIHNldFNob3BFYXJuZWRdID0gdXNlU3RhdGUoMCk7XHJcbiAgY29uc3QgW3Nob3BBdmFpbGFibGUsIHNldFNob3BBdmFpbGFibGVdID0gdXNlU3RhdGUoMCk7XHJcbiAgY29uc3QgW3Nob3BMZWRnZXIsIHNldFNob3BMZWRnZXJdID0gdXNlU3RhdGUoW10pO1xyXG4gIGNvbnN0IFtzaG9wTGVkZ2VyRXhwYW5kZWQsIHNldFNob3BMZWRnZXJFeHBhbmRlZF0gPSB1c2VTdGF0ZShmYWxzZSk7XHJcbiAgY29uc3QgW3Nob3BMZWRnZXJMb2FkaW5nLCBzZXRTaG9wTGVkZ2VyTG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XHJcbiAgY29uc3QgW3BheW91dFJlcXVlc3RzLCBzZXRQYXlvdXRSZXF1ZXN0c10gPSB1c2VTdGF0ZShbXSk7XHJcbiAgY29uc3QgW3BheW91dExvYWRpbmcsIHNldFBheW91dExvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xyXG5cclxuICBjb25zdCBmb3JtYXRQb2ludEFtb3VudCA9ICh2YWx1ZSkgPT4gYCR7KE51bWJlcih2YWx1ZSkgfHwgMCkudG9Mb2NhbGVTdHJpbmcoXCJrby1LUlwiKX0gUGA7XHJcbiAgY29uc3QgZm9ybWF0Q29tcGFjdFBvaW50QW1vdW50ID0gKHZhbHVlKSA9PiBgJHsoTnVtYmVyKHZhbHVlKSB8fCAwKS50b0xvY2FsZVN0cmluZyhcImtvLUtSXCIpfVBgO1xyXG4gIGNvbnN0IGZvcm1hdFBheW91dERhdGUgPSAodmFsdWUpID0+IHtcclxuICAgIGNvbnN0IGZvcm1hdHRlZCA9IGZvcm1hdEtTVERhdGUodmFsdWUpO1xyXG4gICAgcmV0dXJuIGZvcm1hdHRlZCA9PT0gXCItXCIgPyBcIuuCoOynnCDrr7jsg4FcIiA6IGAke2Zvcm1hdHRlZH0uYDtcclxuICB9O1xyXG4gIGNvbnN0IG5vcm1hbGl6ZVBheW91dFJlcXVlc3QgPSAoZW50cnksIGluZGV4KSA9PiAoe1xyXG4gICAgaWQ6IGVudHJ5Py5yZXF1ZXN0SWQgfHwgZW50cnk/LnJlcXVlc3RfaWQgfHwgZW50cnk/LmlkIHx8IGBwYXlvdXQtJHtpbmRleH1gLFxyXG4gICAgYW1vdW50OiBOdW1iZXIoZW50cnk/LmFtb3VudCB8fCAwKSxcclxuICAgIHJlcXVlc3RlZEF0OiBlbnRyeT8ucmVxdWVzdGVkQXQgfHwgZW50cnk/LnJlcXVlc3RlZF9hdCB8fCBlbnRyeT8uY3JlYXRlZEF0IHx8IGVudHJ5Py5jcmVhdGVkX2F0IHx8IFwiXCIsXHJcbiAgICBzdGF0dXM6IFN0cmluZyhlbnRyeT8uc3RhdHVzIHx8IFwiUEVORElOR1wiKS50b1VwcGVyQ2FzZSgpLFxyXG4gIH0pO1xyXG4gIGNvbnN0IGdldFBheW91dFN0YXR1c1VpID0gKHN0YXR1cykgPT4ge1xyXG4gICAgaWYgKHN0YXR1cyA9PT0gXCJQRU5ESU5HXCIpIHtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBpY29uOiBcIvCflZJcIixcclxuICAgICAgICBsYWJlbDogXCLsp4DquInsi6Dssq3spJFcIixcclxuICAgICAgICBjb2xvcjogXCIjZjU5ZTBiXCIsXHJcbiAgICAgICAgYmFja2dyb3VuZDogXCJyZ2JhKDI0NSwgMTU4LCAxMSwgMC4xNilcIixcclxuICAgICAgICBib3JkZXJDb2xvcjogXCJyZ2JhKDI0NSwgMTU4LCAxMSwgMC4zNClcIixcclxuICAgICAgfTtcclxuICAgIH1cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGljb246IFwi4pyFXCIsXHJcbiAgICAgIGxhYmVsOiBcIuyngOq4ieyZhOujjFwiLFxyXG4gICAgICBjb2xvcjogXCIjMjJjNTVlXCIsXHJcbiAgICAgIGJhY2tncm91bmQ6IFwicmdiYSgzNCwgMTk3LCA5NCwgMC4xNilcIixcclxuICAgICAgYm9yZGVyQ29sb3I6IFwicmdiYSgzNCwgMTk3LCA5NCwgMC4zNClcIixcclxuICAgIH07XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgZmV0Y2hCcmlkZ2VKc29uID0gYXN5bmMgKHBhdGgpID0+IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7VklQX0FQSV9CQVNFfSR7cGF0aH1gLCB7IGNyZWRlbnRpYWxzOiBcImluY2x1ZGVcIiB9KTtcclxuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCkuY2F0Y2goKCkgPT4gKHt9KSk7XHJcbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XHJcbiAgICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKGRhdGE/LmVycm9yIHx8IGRhdGE/Lm1lc3NhZ2UgfHwgcmVzcG9uc2Uuc3RhdHVzVGV4dCB8fCBcIuyalOyyrSDsi6TtjKhcIik7XHJcbiAgICAgIGVycm9yLnN0YXR1cyA9IHJlc3BvbnNlLnN0YXR1cztcclxuICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZGF0YTtcclxuICB9O1xyXG5cclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgaWYgKGxvY2F0aW9uLnBhdGhuYW1lICE9PSBcIi9teVwiKSB7XHJcbiAgICAgIHNldE1vdW50Tm9kZShudWxsKTtcclxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBlbnN1cmVNb3VudE5vZGUgPSAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IHBhbmVscyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcInNlY3Rpb24uc3UtcGFuZWxcIikpO1xyXG4gICAgICBjb25zdCBzaG9wUGFuZWwgPSBwYW5lbHMuZmluZCgocGFuZWwpID0+IFN0cmluZyhwYW5lbC50ZXh0Q29udGVudCB8fCBcIlwiKS5pbmNsdWRlcyhcIvCfj6og7IOB7KCQIO2PrOyduO2KuFwiKSk7XHJcbiAgICAgIGlmICghc2hvcFBhbmVsKSB7XHJcbiAgICAgICAgc2V0SGVhZGVyTm9kZShudWxsKTtcclxuICAgICAgICBzZXRNb3VudE5vZGUobnVsbCk7XHJcbiAgICAgICAgc2V0U2hvcFBhbmVsTm9kZShudWxsKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgc2V0U2hvcFBhbmVsTm9kZShzaG9wUGFuZWwpO1xyXG4gICAgICBsZXQgc3VtbWFyeUhvc3QgPSBzaG9wUGFuZWwucXVlcnlTZWxlY3RvcignW2RhdGEtc2hvcC13YWxsZXQtaGVhZGVyLXJvb3Q9XCJ0cnVlXCJdJyk7XHJcbiAgICAgIGlmICghc3VtbWFyeUhvc3QpIHtcclxuICAgICAgICBzdW1tYXJ5SG9zdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgc3VtbWFyeUhvc3Quc2V0QXR0cmlidXRlKFwiZGF0YS1zaG9wLXdhbGxldC1oZWFkZXItcm9vdFwiLCBcInRydWVcIik7XHJcbiAgICAgICAgc2hvcFBhbmVsLmluc2VydEFkamFjZW50RWxlbWVudChcImFmdGVyYmVnaW5cIiwgc3VtbWFyeUhvc3QpO1xyXG4gICAgICB9XHJcbiAgICAgIHNldEhlYWRlck5vZGUoc3VtbWFyeUhvc3QpO1xyXG4gICAgICBsZXQgaG9zdCA9IHNob3BQYW5lbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1zaG9wLXZvdWNoZXItcmVjb3JkLXJvb3Q9XCJ0cnVlXCJdJyk7XHJcbiAgICAgIGlmICghaG9zdCkge1xyXG4gICAgICAgIGhvc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgIGhvc3Quc2V0QXR0cmlidXRlKFwiZGF0YS1zaG9wLXZvdWNoZXItcmVjb3JkLXJvb3RcIiwgXCJ0cnVlXCIpO1xyXG4gICAgICAgIGhvc3Quc3R5bGUubWFyZ2luVG9wID0gXCIxMnB4XCI7XHJcbiAgICAgICAgc2hvcFBhbmVsLmFwcGVuZENoaWxkKGhvc3QpO1xyXG4gICAgICB9XHJcbiAgICAgIHNldE1vdW50Tm9kZShob3N0KTtcclxuXHJcbiAgICAgIGNvbnN0IHNlbGVjdG9yID0gc2hvcFBhbmVsLnF1ZXJ5U2VsZWN0b3IoXCJzZWxlY3RcIik7XHJcbiAgICAgIGlmIChzZWxlY3RvciAmJiBzZWxlY3Rvci52YWx1ZSkge1xyXG4gICAgICAgIHNldEFjdGl2ZVNob3BJZChTdHJpbmcoc2VsZWN0b3IudmFsdWUpKTtcclxuICAgICAgICBpZiAoIXNlbGVjdG9yLmRhdGFzZXQudmlwQm91bmQpIHtcclxuICAgICAgICAgIHNlbGVjdG9yLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHNldEFjdGl2ZVNob3BJZChTdHJpbmcoZXZlbnQ/LnRhcmdldD8udmFsdWUgfHwgXCJcIikpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBzZWxlY3Rvci5kYXRhc2V0LnZpcEJvdW5kID0gXCJ0cnVlXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGVuc3VyZU1vdW50Tm9kZSgpO1xyXG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiBlbnN1cmVNb3VudE5vZGUoKSk7XHJcbiAgICBvYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHsgY2hpbGRMaXN0OiB0cnVlLCBzdWJ0cmVlOiB0cnVlIH0pO1xyXG4gICAgcmV0dXJuICgpID0+IG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcclxuICB9LCBbbG9jYXRpb24ucGF0aG5hbWVdKTtcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGlmICghc2hvcFBhbmVsTm9kZSkgcmV0dXJuO1xyXG4gICAgc2hvcFBhbmVsTm9kZS5zZXRBdHRyaWJ1dGUoXCJkYXRhLXNob3Atd2FsbGV0LWJyaWRnZS1hY3RpdmVcIiwgXCJ0cnVlXCIpO1xyXG4gICAgaWYgKG1vdW50Tm9kZSAmJiBtb3VudE5vZGUucGFyZW50RWxlbWVudCAhPT0gc2hvcFBhbmVsTm9kZSkge1xyXG4gICAgICBzaG9wUGFuZWxOb2RlLmFwcGVuZENoaWxkKG1vdW50Tm9kZSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICBzaG9wUGFuZWxOb2RlLnJlbW92ZUF0dHJpYnV0ZShcImRhdGEtc2hvcC13YWxsZXQtYnJpZGdlLWFjdGl2ZVwiKTtcclxuICAgIH07XHJcbiAgfSwgW3Nob3BQYW5lbE5vZGUsIG1vdW50Tm9kZV0pO1xyXG5cclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgaWYgKGxvY2F0aW9uLnBhdGhuYW1lICE9PSBcIi9teVwiKSByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgY29uc3QgdHJpZ2dlclJlbG9hZCA9ICgpID0+IHNldEF1dGhSZWxvYWRUaWNrKCh2YWx1ZSkgPT4gdmFsdWUgKyAxKTtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwic3U6YXV0aDpjaGFuZ2VkXCIsIHRyaWdnZXJSZWxvYWQpO1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJzdTpzc290OmNoYW5nZWRcIiwgdHJpZ2dlclJlbG9hZCk7XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInN0b3JhZ2VcIiwgdHJpZ2dlclJlbG9hZCk7XHJcbiAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInN1OmF1dGg6Y2hhbmdlZFwiLCB0cmlnZ2VyUmVsb2FkKTtcclxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJzdTpzc290OmNoYW5nZWRcIiwgdHJpZ2dlclJlbG9hZCk7XHJcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwic3RvcmFnZVwiLCB0cmlnZ2VyUmVsb2FkKTtcclxuICAgIH07XHJcbiAgfSwgW2xvY2F0aW9uLnBhdGhuYW1lXSk7XHJcblxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBpZiAobG9jYXRpb24ucGF0aG5hbWUgIT09IFwiL215XCIpIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICBjb25zdCBzZXNzaW9uID0gZ2V0U2Vzc2lvbigpO1xyXG4gICAgY29uc3QgY3VycmVudFVzZXIgPSBnZXRDdXJyZW50VXNlcigpO1xyXG4gICAgY29uc3QgbWVtYmVySWQgPSBTdHJpbmcoc2Vzc2lvbj8ubWVtYmVySWQgfHwgY3VycmVudFVzZXI/Lm1lbWJlcklkIHx8IGN1cnJlbnRVc2VyPy5pZCB8fCBcIlwiKS50cmltKCk7XHJcbiAgICBpZiAoIW1lbWJlcklkKSB7XHJcbiAgICAgIHNldE93bmVkU2hvcHMoW10pO1xyXG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBtb3VudGVkID0gdHJ1ZTtcclxuICAgIGNvbnN0IGxvYWRPd25lZFNob3BzID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7VklQX0FQSV9CQVNFfS9hcGkvc2hvcHMvbXlgLCB7IGhlYWRlcnM6IHsgXCJ4LW1lbWJlci1pZFwiOiBtZW1iZXJJZCB9IH0pO1xyXG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCkuY2F0Y2goKCkgPT4gKHt9KSk7XHJcbiAgICAgICAgaWYgKCFtb3VudGVkKSByZXR1cm47XHJcbiAgICAgICAgc2V0T3duZWRTaG9wcyhBcnJheS5pc0FycmF5KGRhdGE/LnNob3BzKSA/IGRhdGEuc2hvcHMgOiBbXSk7XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgaWYgKG1vdW50ZWQpIHNldE93bmVkU2hvcHMoW10pO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGxvYWRPd25lZFNob3BzKCk7XHJcbiAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICBtb3VudGVkID0gZmFsc2U7XHJcbiAgICB9O1xyXG4gIH0sIFtsb2NhdGlvbi5wYXRobmFtZSwgYXV0aFJlbG9hZFRpY2tdKTtcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGlmICghc2hvcFBhbmVsTm9kZSB8fCBvd25lZFNob3BzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xyXG5cclxuICAgIGNvbnN0IHNlbGVjdG9yID0gc2hvcFBhbmVsTm9kZS5xdWVyeVNlbGVjdG9yKFwic2VsZWN0XCIpO1xyXG4gICAgaWYgKHNlbGVjdG9yPy52YWx1ZSkge1xyXG4gICAgICBzZXRBY3RpdmVTaG9wSWQoU3RyaW5nKHNlbGVjdG9yLnZhbHVlKSk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0ZXh0Tm9kZXMgPSBBcnJheS5mcm9tKHNob3BQYW5lbE5vZGUucXVlcnlTZWxlY3RvckFsbChcImRpdiwgc3Bhbiwgc3Ryb25nXCIpKVxyXG4gICAgICAubWFwKChub2RlKSA9PiBTdHJpbmcobm9kZS50ZXh0Q29udGVudCB8fCBcIlwiKS50cmltKCkpXHJcbiAgICAgIC5maWx0ZXIoQm9vbGVhbik7XHJcbiAgICBjb25zdCBtYXRjaGVkU2hvcCA9IG93bmVkU2hvcHMuZmluZCgoc2hvcCkgPT4ge1xyXG4gICAgICBjb25zdCBzaG9wTmFtZSA9IFN0cmluZyhzaG9wPy5uYW1lIHx8IFwiXCIpLnRyaW0oKTtcclxuICAgICAgcmV0dXJuIHNob3BOYW1lICYmIHRleHROb2Rlcy5pbmNsdWRlcyhzaG9wTmFtZSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAobWF0Y2hlZFNob3ApIHtcclxuICAgICAgc2V0QWN0aXZlU2hvcElkKFN0cmluZyhtYXRjaGVkU2hvcC5pZCB8fCBtYXRjaGVkU2hvcC5zaG9wSWQgfHwgXCJcIikpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFhY3RpdmVTaG9wSWQpIHtcclxuICAgICAgY29uc3QgZmlyc3RTaG9wSWQgPSBTdHJpbmcob3duZWRTaG9wc1swXT8uaWQgfHwgb3duZWRTaG9wc1swXT8uc2hvcElkIHx8IFwiXCIpLnRyaW0oKTtcclxuICAgICAgaWYgKGZpcnN0U2hvcElkKSBzZXRBY3RpdmVTaG9wSWQoZmlyc3RTaG9wSWQpO1xyXG4gICAgfVxyXG4gIH0sIFtzaG9wUGFuZWxOb2RlLCBvd25lZFNob3BzLCBhY3RpdmVTaG9wSWRdKTtcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGlmICghYWN0aXZlU2hvcElkICYmIG93bmVkU2hvcHMubGVuZ3RoID4gMCkge1xyXG4gICAgICBjb25zdCBmaXJzdFNob3BJZCA9IFN0cmluZyhvd25lZFNob3BzWzBdPy5pZCB8fCBvd25lZFNob3BzWzBdPy5zaG9wSWQgfHwgXCJcIikudHJpbSgpO1xyXG4gICAgICBpZiAoZmlyc3RTaG9wSWQpIHNldEFjdGl2ZVNob3BJZChmaXJzdFNob3BJZCk7XHJcbiAgICB9XHJcbiAgfSwgW293bmVkU2hvcHMsIGFjdGl2ZVNob3BJZF0pO1xyXG5cclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgaWYgKGxvY2F0aW9uLnBhdGhuYW1lICE9PSBcIi9teVwiKSByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgY29uc3Qgc2VsZWN0ZWRTaG9wSWQgPSBTdHJpbmcoYWN0aXZlU2hvcElkIHx8IFwiXCIpLnRyaW0oKTtcclxuICAgIGlmICghc2VsZWN0ZWRTaG9wSWQpIHtcclxuICAgICAgc2V0U2hvcEVhcm5lZCgwKTtcclxuICAgICAgc2V0U2hvcEF2YWlsYWJsZSgwKTtcclxuICAgICAgc2V0U2hvcExlZGdlcihbXSk7XHJcbiAgICAgIHNldFNob3BMZWRnZXJFeHBhbmRlZChmYWxzZSk7XHJcbiAgICAgIHNldFBheW91dFJlcXVlc3RzKFtdKTtcclxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgbW91bnRlZCA9IHRydWU7XHJcbiAgICBjb25zdCBsb2FkU2hvcFBvaW50U3VtbWFyeSA9IGFzeW5jICgpID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBzZXRTaG9wTGVkZ2VyTG9hZGluZyh0cnVlKTtcclxuICAgICAgICBzZXRQYXlvdXRMb2FkaW5nKHRydWUpO1xyXG4gICAgICAgIGNvbnN0IFtlYXJuZWRSZXMsIGF2YWlsYWJsZVJlcywgbGVkZ2VyUmVzLCBwYXlvdXRSZXNdID0gYXdhaXQgUHJvbWlzZS5hbGxTZXR0bGVkKFtcclxuICAgICAgICAgIGZldGNoQnJpZGdlSnNvbihgL2FwaS9zaG9wcy8ke2VuY29kZVVSSUNvbXBvbmVudChzZWxlY3RlZFNob3BJZCl9L3BvaW50cy9lYXJuZWRgKSxcclxuICAgICAgICAgIGZldGNoQnJpZGdlSnNvbihgL2FwaS9zaG9wcy8ke2VuY29kZVVSSUNvbXBvbmVudChzZWxlY3RlZFNob3BJZCl9L3BvaW50cy9hdmFpbGFibGVgKSxcclxuICAgICAgICAgIGZldGNoQnJpZGdlSnNvbihgL2FwaS9zaG9wcy8ke2VuY29kZVVSSUNvbXBvbmVudChzZWxlY3RlZFNob3BJZCl9L3BvaW50cy9sZWRnZXI/bGltaXQ9JHtzaG9wTGVkZ2VyRXhwYW5kZWQgPyA1MCA6IDV9YCksXHJcbiAgICAgICAgICBzaG9wU3RvcmUubG9hZFVuaWZpZWRTaG9wUGF5b3V0UmVxdWVzdHMoc2VsZWN0ZWRTaG9wSWQpLFxyXG4gICAgICAgIF0pO1xyXG4gICAgICAgIGlmICghbW91bnRlZCkgcmV0dXJuO1xyXG4gICAgICAgIHNldFNob3BFYXJuZWQoZWFybmVkUmVzLnN0YXR1cyA9PT0gXCJmdWxmaWxsZWRcIiA/IE51bWJlcihlYXJuZWRSZXMudmFsdWU/LnRvdGFsRWFybmVkIHx8IGVhcm5lZFJlcy52YWx1ZT8udG90YWwgfHwgMCkgOiAwKTtcclxuICAgICAgICBzZXRTaG9wQXZhaWxhYmxlKGF2YWlsYWJsZVJlcy5zdGF0dXMgPT09IFwiZnVsZmlsbGVkXCIgPyBOdW1iZXIoYXZhaWxhYmxlUmVzLnZhbHVlPy5hdmFpbGFibGUgfHwgMCkgOiAwKTtcclxuICAgICAgICBzZXRTaG9wTGVkZ2VyKGxlZGdlclJlcy5zdGF0dXMgPT09IFwiZnVsZmlsbGVkXCIgJiYgQXJyYXkuaXNBcnJheShsZWRnZXJSZXMudmFsdWU/LmxlZGdlcikgPyBsZWRnZXJSZXMudmFsdWUubGVkZ2VyIDogW10pO1xyXG4gICAgICAgIHNldFBheW91dFJlcXVlc3RzKFxyXG4gICAgICAgICAgcGF5b3V0UmVzLnN0YXR1cyA9PT0gXCJmdWxmaWxsZWRcIiAmJiBBcnJheS5pc0FycmF5KHBheW91dFJlcy52YWx1ZT8ucmVxdWVzdHMpXHJcbiAgICAgICAgICAgID8gcGF5b3V0UmVzLnZhbHVlLnJlcXVlc3RzLm1hcChub3JtYWxpemVQYXlvdXRSZXF1ZXN0KVxyXG4gICAgICAgICAgICA6IFtdXHJcbiAgICAgICAgKTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBpZiAoIW1vdW50ZWQpIHJldHVybjtcclxuICAgICAgICBzZXRTaG9wRWFybmVkKDApO1xyXG4gICAgICAgIHNldFNob3BBdmFpbGFibGUoMCk7XHJcbiAgICAgICAgc2V0U2hvcExlZGdlcihbXSk7XHJcbiAgICAgICAgc2V0UGF5b3V0UmVxdWVzdHMoW10pO1xyXG4gICAgICB9IGZpbmFsbHkge1xyXG4gICAgICAgIGlmIChtb3VudGVkKSB7XHJcbiAgICAgICAgICBzZXRTaG9wTGVkZ2VyTG9hZGluZyhmYWxzZSk7XHJcbiAgICAgICAgICBzZXRQYXlvdXRMb2FkaW5nKGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgbG9hZFNob3BQb2ludFN1bW1hcnkoKTtcclxuICAgIHJldHVybiAoKSA9PiB7XHJcbiAgICAgIG1vdW50ZWQgPSBmYWxzZTtcclxuICAgIH07XHJcbiAgfSwgW2xvY2F0aW9uLnBhdGhuYW1lLCBhY3RpdmVTaG9wSWQsIGF1dGhSZWxvYWRUaWNrLCBzaG9wTGVkZ2VyRXhwYW5kZWRdKTtcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIHNldFNob3BMZWRnZXJFeHBhbmRlZChmYWxzZSk7XHJcbiAgfSwgW2FjdGl2ZVNob3BJZF0pO1xyXG5cclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgbGV0IG1vdW50ZWQgPSB0cnVlO1xyXG5cclxuICAgIGNvbnN0IHJlZnJlc2ggPSBhc3luYyAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IG93bmVkTGlzdCA9IEFycmF5LmlzQXJyYXkob3duZWRTaG9wcykgPyBvd25lZFNob3BzIDogW107XHJcbiAgICAgIGNvbnN0IG93bmVkU2hvcElkcyA9IG5ldyBTZXQob3duZWRMaXN0Lm1hcCgoc2hvcCkgPT4gU3RyaW5nKHNob3A/LmlkIHx8IHNob3A/LnNob3BJZCB8fCBcIlwiKS50cmltKCkpLmZpbHRlcihCb29sZWFuKSk7XHJcbiAgICAgIGNvbnN0IGNhY2hlUmVjb3JkcyA9IHJlYWRTaG9wVm91Y2hlclBheW1lbnRDYWNoZSgpLmZpbHRlcigoZW50cnkpID0+IG93bmVkU2hvcElkcy5oYXMoU3RyaW5nKGVudHJ5Py5zaG9wSWQgfHwgXCJcIikudHJpbSgpKSk7XHJcblxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGhpc3RvcnlHcm91cHMgPSBhd2FpdCBQcm9taXNlLmFsbChcclxuICAgICAgICAgIG93bmVkTGlzdC5tYXAoYXN5bmMgKHNob3ApID0+IHtcclxuICAgICAgICAgICAgY29uc3Qgc2hvcElkID0gU3RyaW5nKHNob3A/LmlkIHx8IHNob3A/LnNob3BJZCB8fCBcIlwiKS50cmltKCk7XHJcbiAgICAgICAgICAgIGlmICghc2hvcElkKSByZXR1cm4gW107XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7VklQX0FQSV9CQVNFfS9hcGkvdm91Y2hlcnMvJHtlbmNvZGVVUklDb21wb25lbnQoc2hvcElkKX0vaGlzdG9yeT9saW1pdD01MGApO1xyXG4gICAgICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpLmNhdGNoKCgpID0+ICh7fSkpO1xyXG4gICAgICAgICAgICByZXR1cm4gY29udmVydFNob3BWb3VjaGVySGlzdG9yeVRvUmVjb3JkcyhzaG9wLCBkYXRhPy5vayA/IGRhdGEuaGlzdG9yeSB8fCBbXSA6IFtdKTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgKTtcclxuICAgICAgICBjb25zdCBtZXJnZWQgPSBtZXJnZVNob3BWb3VjaGVyUGF5bWVudFJlY29yZHMoY2FjaGVSZWNvcmRzLCBoaXN0b3J5R3JvdXBzLmZsYXQoKSkuc2xpY2UoMCwgMTAwKTtcclxuICAgICAgICB3cml0ZVNob3BWb3VjaGVyUGF5bWVudENhY2hlKG1lcmdlZCk7XHJcbiAgICAgICAgaWYgKG1vdW50ZWQpIHNldFJlY29yZHMobWVyZ2VkKTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zdCBmYWxsYmFjayA9IG1lcmdlU2hvcFZvdWNoZXJQYXltZW50UmVjb3JkcyhjYWNoZVJlY29yZHMpLnNsaWNlKDAsIDEwMCk7XHJcbiAgICAgICAgaWYgKG1vdW50ZWQpIHNldFJlY29yZHMoZmFsbGJhY2spO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHJlZnJlc2goKTtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwic3RvcmFnZVwiLCByZWZyZXNoKTtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwic3U6dm91Y2hlcjpzaG9wLXBheW1lbnRzXCIsIHJlZnJlc2gpO1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJzdTpzc290OmNoYW5nZWRcIiwgcmVmcmVzaCk7XHJcbiAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICBtb3VudGVkID0gZmFsc2U7XHJcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwic3RvcmFnZVwiLCByZWZyZXNoKTtcclxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJzdTp2b3VjaGVyOnNob3AtcGF5bWVudHNcIiwgcmVmcmVzaCk7XHJcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwic3U6c3NvdDpjaGFuZ2VkXCIsIHJlZnJlc2gpO1xyXG4gICAgfTtcclxuICB9LCBbb3duZWRTaG9wc10pO1xyXG5cclxuICBpZiAobG9jYXRpb24ucGF0aG5hbWUgIT09IFwiL215XCIgfHwgIWhlYWRlck5vZGUpIHJldHVybiBudWxsO1xyXG5cclxuICBjb25zdCBzZWxlY3RlZFNob3BJZCA9IFN0cmluZyhhY3RpdmVTaG9wSWQgfHwgXCJcIikudHJpbSgpO1xyXG4gIGNvbnN0IHNlbGVjdGVkU2hvcCA9IG93bmVkU2hvcHMuZmluZCgoc2hvcCkgPT4gU3RyaW5nKHNob3A/LmlkIHx8IHNob3A/LnNob3BJZCB8fCBcIlwiKS50cmltKCkgPT09IHNlbGVjdGVkU2hvcElkKSB8fCBvd25lZFNob3BzWzBdIHx8IG51bGw7XHJcbiAgY29uc3Qgc2VsZWN0ZWRTaG9wUmVjb3JkcyA9IHJlY29yZHNcclxuICAgIC5maWx0ZXIoKGVudHJ5KSA9PiBTdHJpbmcoZW50cnk/LnNob3BJZCB8fCBcIlwiKS50cmltKCkgPT09IHNlbGVjdGVkU2hvcElkKVxyXG4gICAgLnNsaWNlKDAsIDYpO1xyXG4gIGNvbnN0IGVhcm5lZFRleHQgPSBmb3JtYXRQb2ludEFtb3VudChzaG9wRWFybmVkKTtcclxuICBjb25zdCBhdmFpbGFibGVUZXh0ID0gZm9ybWF0UG9pbnRBbW91bnQoc2hvcEF2YWlsYWJsZSk7XHJcbiAgY29uc3Qgc29ydGVkUGF5b3V0UmVxdWVzdHMgPSBbLi4ucGF5b3V0UmVxdWVzdHNdLnNvcnQoKGxlZnQsIHJpZ2h0KSA9PiB7XHJcbiAgICBjb25zdCBsZWZ0UGVuZGluZyA9IGxlZnQuc3RhdHVzID09PSBcIlBFTkRJTkdcIiA/IDAgOiAxO1xyXG4gICAgY29uc3QgcmlnaHRQZW5kaW5nID0gcmlnaHQuc3RhdHVzID09PSBcIlBFTkRJTkdcIiA/IDAgOiAxO1xyXG4gICAgaWYgKGxlZnRQZW5kaW5nICE9PSByaWdodFBlbmRpbmcpIHJldHVybiBsZWZ0UGVuZGluZyAtIHJpZ2h0UGVuZGluZztcclxuICAgIHJldHVybiBuZXcgRGF0ZShyaWdodC5yZXF1ZXN0ZWRBdCB8fCAwKSAtIG5ldyBEYXRlKGxlZnQucmVxdWVzdGVkQXQgfHwgMCk7XHJcbiAgfSkuc2xpY2UoMCwgNCk7XHJcbiAgY29uc3QgdmlzaWJsZVNob3BMZWRnZXIgPSBzaG9wTGVkZ2VyRXhwYW5kZWQgPyBzaG9wTGVkZ2VyIDogc2hvcExlZGdlci5zbGljZSgwLCA0KTtcclxuICBjb25zdCBoYXNNb3JlU2hvcExlZGdlciA9IHNob3BMZWRnZXIubGVuZ3RoID4gNDtcclxuXHJcbiAgY29uc3QgaGVhZGVyUG9ydGFsID0gaGVhZGVyTm9kZSA/IGNyZWF0ZVBvcnRhbChcclxuICAgIDxkaXYgc3R5bGU9e3sgYm9yZGVyUmFkaXVzOiAxOCwgcGFkZGluZzogXCIxNHB4IDE0cHhcIiwgYmFja2dyb3VuZDogXCJsaW5lYXItZ3JhZGllbnQoMTgwZGVnLCAjZmZmZmZmLCAjZjhmYWZjKVwiLCBib3JkZXI6IFwiMXB4IHNvbGlkICNjYmQ1ZTFcIiwgbWFyZ2luQm90dG9tOiBpc0V4cGFuZGVkID8gMTYgOiAxMCwgYm94U2hhZG93OiBcIjAgOHB4IDIwcHggcmdiYSgxNSwyMyw0MiwwLjA4KVwiIH19PlxyXG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRJc0V4cGFuZGVkKCh2YWx1ZSkgPT4gIXZhbHVlKX0gc3R5bGU9e3sgd2lkdGg6IFwiMTAwJVwiLCBkaXNwbGF5OiBcImdyaWRcIiwgZ3JpZFRlbXBsYXRlQ29sdW1uczogXCJtaW5tYXgoMCwxZnIpIGF1dG9cIiwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiwgZ2FwOiAxMiwgYmFja2dyb3VuZDogXCJ0cmFuc3BhcmVudFwiLCBib3JkZXI6IFwibm9uZVwiLCBjb2xvcjogXCIjMGYxNzJhXCIsIHBhZGRpbmc6IDAsIGN1cnNvcjogXCJwb2ludGVyXCIsIG91dGxpbmU6IFwibm9uZVwiLCBib3hTaGFkb3c6IFwibm9uZVwiLCBXZWJraXRUYXBIaWdobGlnaHRDb2xvcjogXCJ0cmFuc3BhcmVudFwiLCBXZWJraXRBcHBlYXJhbmNlOiBcIm5vbmVcIiwgYXBwZWFyYW5jZTogXCJub25lXCIgfX0+XHJcbiAgICAgICAgPGRpdiBzdHlsZT17eyB0ZXh0QWxpZ246IFwibGVmdFwiLCBtaW5XaWR0aDogMCwgZGlzcGxheTogXCJncmlkXCIsIGdhcDogOCB9fT5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFdlaWdodDogOTAwLCBmb250U2l6ZTogMTQsIGNvbG9yOiBcIiMwZjE3MmFcIiwgbGV0dGVyU3BhY2luZzogXCIwLjJweFwiLCB0ZXh0VHJhbnNmb3JtOiBcInVwcGVyY2FzZVwiIH19PvCfj6og7IOB7KCQIOyngOqwkTwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Ub3A6IDYsIGZvbnRTaXplOiAxMywgY29sb3I6IFwiIzMzNDE1NVwiLCBmb250V2VpZ2h0OiA3MDAgfX0+e3NlbGVjdGVkU2hvcD8ubmFtZSB8fCBzZWxlY3RlZFNob3A/LnNob3BJZCB8fCBcIuyDgeygkCDshKDtg50g64yA6riwXCJ9PC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6IFwiZmxleFwiLCBhbGlnbkl0ZW1zOiBcImZsZXgtZW5kXCIsIGdhcDogMzQsIGZsZXhXcmFwOiBcIndyYXBcIiB9fT5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyB0ZXh0QWxpZ246IFwibGVmdFwiIH19PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6IDExLCBjb2xvcjogXCIjNjQ3NDhiXCIsIGZvbnRXZWlnaHQ6IDcwMCB9fT7stJ0g7KCB66a9PC9kaXY+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Ub3A6IDIsIGZvbnRTaXplOiBcImNsYW1wKDE1cHgsNC41dncsMThweClcIiwgZm9udFdlaWdodDogODAwLCBjb2xvcjogXCIjMWUyOTNiXCIsIHdoaXRlU3BhY2U6IFwibm93cmFwXCIgfX0+e2Vhcm5lZFRleHR9PC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHRleHRBbGlnbjogXCJsZWZ0XCIsIG1hcmdpbkxlZnQ6IDggfX0+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogMTEsIGNvbG9yOiBcIiMwZjc2NmVcIiwgZm9udFdlaWdodDogODAwIH19PuqwgOyaqSDsnpTslaE8L2Rpdj5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpblRvcDogMiwgZm9udFNpemU6IFwiY2xhbXAoMTdweCw1dncsMjFweClcIiwgZm9udFdlaWdodDogOTAwLCBjb2xvcjogXCIjMGY3NjZlXCIsIHRleHRTaGFkb3c6IFwibm9uZVwiLCB3aGl0ZVNwYWNlOiBcIm5vd3JhcFwiIH19PnthdmFpbGFibGVUZXh0fTwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgZmxleFNocmluazogMCwgd2lkdGg6IDMyLCBoZWlnaHQ6IDMyLCBib3JkZXJSYWRpdXM6IDk5OSwgZGlzcGxheTogXCJpbmxpbmUtZmxleFwiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIiwgYmFja2dyb3VuZDogXCIjZTJlOGYwXCIsIGNvbG9yOiBcIiMwZjE3MmFcIiwgZm9udFNpemU6IDE2LCBmb250V2VpZ2h0OiA5MDAgfX0+XHJcbiAgICAgICAgICB7aXNFeHBhbmRlZCA/IFwi4oiSXCIgOiBcIitcIn1cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9idXR0b24+XHJcbiAgICAgIHtpc0V4cGFuZGVkID8gKFxyXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luVG9wOiAxMiwgcGFkZGluZ1RvcDogMTIsIGJvcmRlclRvcDogXCIxcHggc29saWQgI2UyZThmMFwiIH19PlxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogMTIsIGZvbnRXZWlnaHQ6IDkwMCwgY29sb3I6IFwiIzBmMTcyYVwiLCBtYXJnaW5Cb3R0b206IDggfX0+7LWc6re8IOyggeumvSDsm5DsnqU8L2Rpdj5cclxuICAgICAgICAgIHtzaG9wTGVkZ2VyTG9hZGluZyA/IDxkaXYgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBjb2xvcjogXCIjNjQ3NDhiXCIsIHBhZGRpbmc6IFwiNnB4IDBcIiB9fT7sm5DsnqXsnYQg67aI65+s7Jik64qUIOykkeyeheuLiOuLpC4uLjwvZGl2PiA6IG51bGx9XHJcbiAgICAgICAgICB7IXNob3BMZWRnZXJMb2FkaW5nICYmIHNob3BMZWRnZXIubGVuZ3RoID09PSAwID8gPGRpdiBzdHlsZT17eyBmb250U2l6ZTogMTIsIGNvbG9yOiBcIiM2NDc0OGJcIiwgcGFkZGluZzogXCI2cHggMFwiIH19Puy1nOq3vCDsoIHrpr0g64K07Jet7J20IOyXhuyKteuLiOuLpC48L2Rpdj4gOiBudWxsfVxyXG4gICAgICAgICAgeyFzaG9wTGVkZ2VyTG9hZGluZyAmJiBzaG9wTGVkZ2VyLmxlbmd0aCA+IDAgPyAoXHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogXCJncmlkXCIsIGdhcDogNiB9fT5cclxuICAgICAgICAgICAgICB7dmlzaWJsZVNob3BMZWRnZXIubWFwKChlbnRyeSwgaW5kZXgpID0+IChcclxuICAgICAgICAgICAgICAgIDxkaXYga2V5PXtgJHtlbnRyeS5lYXJuaW5nSWQgfHwgZW50cnkuc291cmNlVHhJZCB8fCBcImxlZGdlclwifS0ke2luZGV4fWB9IHN0eWxlPXt7IGRpc3BsYXk6IFwiZmxleFwiLCBqdXN0aWZ5Q29udGVudDogXCJzcGFjZS1iZXR3ZWVuXCIsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsIGdhcDogOCwgcGFkZGluZzogXCI4cHggMTBweFwiLCBib3JkZXJSYWRpdXM6IDEwLCBiYWNrZ3JvdW5kOiBcIiNmOGZhZmNcIiwgYm9yZGVyOiBcIjFweCBzb2xpZCAjZTJlOGYwXCIgfX0+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWluV2lkdGg6IDAsIGZsZXg6IDEgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogMTIsIGZvbnRXZWlnaHQ6IDgwMCwgY29sb3I6IFwiIzBmMTcyYVwiLCB3aGl0ZVNwYWNlOiBcIm5vd3JhcFwiLCBvdmVyZmxvdzogXCJoaWRkZW5cIiwgdGV4dE92ZXJmbG93OiBcImVsbGlwc2lzXCIgfX0+e2VudHJ5LmJ1eWVyTmFtZSB8fCBlbnRyeS5idXllck1lbWJlcklkIHx8IFwi7ZqM7JuQXCJ9IOqysOygnDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luVG9wOiAzLCBmb250U2l6ZTogMTEsIGNvbG9yOiBcIiM2NDc0OGJcIiB9fT57Zm9ybWF0Vm91Y2hlckRhdGVUaW1lKGVudHJ5LmNyZWF0ZWRBdCl9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZsZXhTaHJpbms6IDAsIGZvbnRTaXplOiAxMywgZm9udFdlaWdodDogOTAwLCBjb2xvcjogXCIjMGY3NjZlXCIgfX0+K3tmb3JtYXRQb2ludEFtb3VudChlbnRyeS5hbW91bnQpfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgKSl9XHJcbiAgICAgICAgICAgICAge2hhc01vcmVTaG9wTGVkZ2VyICYmICFzaG9wTGVkZ2VyRXhwYW5kZWQgPyAoXHJcbiAgICAgICAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxyXG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRTaG9wTGVkZ2VyRXhwYW5kZWQodHJ1ZSl9XHJcbiAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IG1pbkhlaWdodDogMzgsIGJvcmRlclJhZGl1czogMTAsIGJvcmRlcjogXCIxcHggc29saWQgIzk5ZjZlNFwiLCBiYWNrZ3JvdW5kOiBcIiNlY2ZlZmZcIiwgY29sb3I6IFwiIzBmNzY2ZVwiLCBmb250U2l6ZTogMTIsIGZvbnRXZWlnaHQ6IDgwMCwgY3Vyc29yOiBcInBvaW50ZXJcIiB9fVxyXG4gICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICDrjZTrs7TquLBcclxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICkgOiBudWxsfVxyXG4gICAgICAgICAgICAgIHtzaG9wTGVkZ2VyRXhwYW5kZWQgJiYgc2hvcExlZGdlci5sZW5ndGggPiA0ID8gKFxyXG4gICAgICAgICAgICAgICAgPGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcclxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0U2hvcExlZGdlckV4cGFuZGVkKGZhbHNlKX1cclxuICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgbWluSGVpZ2h0OiAzOCwgYm9yZGVyUmFkaXVzOiAxMCwgYm9yZGVyOiBcIjFweCBzb2xpZCAjY2JkNWUxXCIsIGJhY2tncm91bmQ6IFwiI2Y4ZmFmY1wiLCBjb2xvcjogXCIjNDc1NTY5XCIsIGZvbnRTaXplOiAxMiwgZm9udFdlaWdodDogODAwLCBjdXJzb3I6IFwicG9pbnRlclwiIH19XHJcbiAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgIOygkeq4sFxyXG4gICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgKSA6IG51bGx9XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgKSA6IG51bGx9XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICkgOiBudWxsfVxyXG4gICAgPC9kaXY+LFxyXG4gICAgaGVhZGVyTm9kZVxyXG4gICkgOiBudWxsO1xyXG5cclxuICBjb25zdCBwYXlvdXRQb3J0YWwgPSBtb3VudE5vZGUgPyBjcmVhdGVQb3J0YWwoXHJcbiAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6IFwiZ3JpZFwiLCBnYXA6IDgsIG1hcmdpblRvcDogOCB9fT5cclxuICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogMTMsIGZvbnRXZWlnaHQ6IDkwMCwgY29sb3I6IFwiIzBmMTcyYVwiLCBtYXJnaW5Cb3R0b206IDIgfX0+VklQIOyDge2SiOq2jCDrsJvsnYAg7J2066ClPC9kaXY+XHJcbiAgICAgIHtzZWxlY3RlZFNob3BSZWNvcmRzLmxlbmd0aCA9PT0gMCA/IDxkaXYgc3R5bGU9e3sgZm9udFNpemU6IDEzLCBjb2xvcjogXCIjNjQ3NDhiXCIsIHBhZGRpbmc6IFwiNHB4IDBcIiB9fT7rsJvsnYAg7IOB7ZKI6raMIOydtOugpeydtCDsl4bsirXri4jri6QuPC9kaXY+IDogbnVsbH1cclxuICAgICAge3NlbGVjdGVkU2hvcFJlY29yZHMubWFwKChyZWNvcmQsIGluZGV4KSA9PiAoXHJcbiAgICAgICAgPGRpdiBrZXk9e2Ake3JlY29yZC5zZXJpYWx9LSR7cmVjb3JkLnVzZXJJZCB8fCBcInVzZXJcIn0tJHtpbmRleH1gfSBzdHlsZT17eyBkaXNwbGF5OiBcImZsZXhcIiwganVzdGlmeUNvbnRlbnQ6IFwic3BhY2UtYmV0d2VlblwiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBnYXA6IDEwLCBwYWRkaW5nOiBcIjEwcHggMTJweFwiLCBib3JkZXJSYWRpdXM6IDEwLCBiYWNrZ3JvdW5kOiBcIiNmOGZhZmNcIiwgYm9yZGVyOiBcIjFweCBzb2xpZCAjZTJlOGYwXCIgfX0+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1pbldpZHRoOiAwLCBmbGV4OiAxIH19PlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAxMywgZm9udFdlaWdodDogODAwLCBjb2xvcjogXCIjMGYxNzJhXCIsIHdoaXRlU3BhY2U6IFwibm93cmFwXCIsIG92ZXJmbG93OiBcImhpZGRlblwiLCB0ZXh0T3ZlcmZsb3c6IFwiZWxsaXBzaXNcIiB9fT57cmVjb3JkLnVzZXJOYW1lIHx8IHJlY29yZC51c2VySWQgfHwgXCLtmozsm5BcIn0g6rKw7KCcIOyImOyLoDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpblRvcDogMiwgZm9udFNpemU6IDEyLCBjb2xvcjogXCIjNjQ3NDhiXCIsIHdoaXRlU3BhY2U6IFwibm93cmFwXCIsIG92ZXJmbG93OiBcImhpZGRlblwiLCB0ZXh0T3ZlcmZsb3c6IFwiZWxsaXBzaXNcIiB9fT57Zm9ybWF0Vm91Y2hlckRhdGVUaW1lKHJlY29yZC51c2VkQXQpfTwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpblRvcDogMiwgZm9udFNpemU6IDEyLCBjb2xvcjogXCIjNjQ3NDhiXCIsIHdvcmRCcmVhazogXCJicmVhay1hbGxcIiwgb3ZlcmZsb3dXcmFwOiBcImFueXdoZXJlXCIgfX0+e3JlY29yZC5zZXJpYWx9PC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZmxleFNocmluazogMCwgZm9udFNpemU6IDEzLCBmb250V2VpZ2h0OiA5MDAsIGNvbG9yOiBcIiMwZjc2NmVcIiB9fT4re2Zvcm1hdENvbXBhY3RQb2ludEFtb3VudChyZWNvcmQuYW1vdW50KX08L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgKSl9XHJcblxyXG4gICAgICA8YnV0dG9uXHJcbiAgICAgICAgdHlwZT1cImJ1dHRvblwiXHJcbiAgICAgICAgb25DbGljaz17KCkgPT4ge1xyXG4gICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KFwic3U6c2hvcDpwYXlvdXQ6b3BlblwiLCB7IGRldGFpbDogeyBzaG9wSWQ6IHNlbGVjdGVkU2hvcElkIH0gfSkpO1xyXG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHt9XHJcbiAgICAgICAgfX1cclxuICAgICAgICBkaXNhYmxlZD17IXNlbGVjdGVkU2hvcElkfVxyXG4gICAgICAgIHN0eWxlPXt7IG1pbkhlaWdodDogNDQsIGJvcmRlclJhZGl1czogMTIsIGJvcmRlcjogXCJub25lXCIsIGJhY2tncm91bmQ6IFwibGluZWFyLWdyYWRpZW50KDkwZGVnLCMwZjc2NmUsIzBlYTVhMylcIiwgY29sb3I6IFwiI2VmZmZmYlwiLCBmb250U2l6ZTogMTQsIGZvbnRXZWlnaHQ6IDkwMCwgY3Vyc29yOiBzZWxlY3RlZFNob3BJZCA/IFwicG9pbnRlclwiIDogXCJkZWZhdWx0XCIsIG9wYWNpdHk6IHNlbGVjdGVkU2hvcElkID8gMSA6IDAuNSB9fVxyXG4gICAgICA+XHJcbiAgICAgICAg7KeA6riJ7JqU7LKtXHJcbiAgICAgIDwvYnV0dG9uPlxyXG5cclxuICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogMTMsIGZvbnRXZWlnaHQ6IDkwMCwgY29sb3I6IFwiIzBmMTcyYVwiLCBtYXJnaW5Ub3A6IDQgfX0+7LWc6re8IOyngOq4ieyalOyyrTwvZGl2PlxyXG4gICAgICB7cGF5b3V0TG9hZGluZyA/IDxkaXYgc3R5bGU9e3sgZm9udFNpemU6IDEzLCBjb2xvcjogXCIjNjQ3NDhiXCIsIHBhZGRpbmc6IFwiNHB4IDBcIiB9fT7sp4DquInsmpTssq3snYQg67aI65+s7Jik64qUIOykkeyeheuLiOuLpC4uLjwvZGl2PiA6IG51bGx9XHJcbiAgICAgIHshcGF5b3V0TG9hZGluZyAmJiBzb3J0ZWRQYXlvdXRSZXF1ZXN0cy5sZW5ndGggPT09IDAgPyA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAxMywgY29sb3I6IFwiIzY0NzQ4YlwiLCBwYWRkaW5nOiBcIjRweCAwXCIgfX0+7LWc6re8IOyalOyyreydtCDsl4bsirXri4jri6QuPC9kaXY+IDogbnVsbH1cclxuICAgICAgeyFwYXlvdXRMb2FkaW5nICYmIHNvcnRlZFBheW91dFJlcXVlc3RzLm1hcCgocmVxdWVzdCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHN0YXR1c1VpID0gZ2V0UGF5b3V0U3RhdHVzVWkocmVxdWVzdC5zdGF0dXMpO1xyXG4gICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICA8ZGl2IGtleT17cmVxdWVzdC5pZH0gc3R5bGU9e3sgZGlzcGxheTogXCJmbGV4XCIsIGp1c3RpZnlDb250ZW50OiBcInNwYWNlLWJldHdlZW5cIiwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiwgZ2FwOiAxMCwgcGFkZGluZzogXCIxMHB4IDEycHhcIiwgYm9yZGVyUmFkaXVzOiAxMCwgYmFja2dyb3VuZDogXCIjZjhmYWZjXCIsIGJvcmRlcjogXCIxcHggc29saWQgI2UyZThmMFwiIH19PlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1pbldpZHRoOiAwLCBmbGV4OiAxLCBmb250U2l6ZTogMTQsIGZvbnRXZWlnaHQ6IDcwMCwgY29sb3I6IFwiIzMzNDE1NVwiLCB3aGl0ZVNwYWNlOiBcIm5vd3JhcFwiLCBvdmVyZmxvdzogXCJoaWRkZW5cIiwgdGV4dE92ZXJmbG93OiBcImVsbGlwc2lzXCIgfX0+XHJcbiAgICAgICAgICAgICAge2Zvcm1hdFBheW91dERhdGUocmVxdWVzdC5yZXF1ZXN0ZWRBdCl9IMK3IHtmb3JtYXRDb21wYWN0UG9pbnRBbW91bnQocmVxdWVzdC5hbW91bnQpfVxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmbGV4U2hyaW5rOiAwLCBkaXNwbGF5OiBcImlubGluZS1mbGV4XCIsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsIGdhcDogNSwgbWluSGVpZ2h0OiAzMCwgcGFkZGluZzogXCI0cHggMTBweFwiLCBib3JkZXJSYWRpdXM6IDk5OSwgZm9udFNpemU6IDEyLCBmb250V2VpZ2h0OiA3MDAsIGNvbG9yOiBzdGF0dXNVaS5jb2xvciwgYmFja2dyb3VuZDogc3RhdHVzVWkuYmFja2dyb3VuZCwgYm9yZGVyOiBgMXB4IHNvbGlkICR7c3RhdHVzVWkuYm9yZGVyQ29sb3J9YCB9fT5cclxuICAgICAgICAgICAgICA8c3Bhbj57c3RhdHVzVWkuaWNvbn08L3NwYW4+XHJcbiAgICAgICAgICAgICAgPHNwYW4+e3N0YXR1c1VpLmxhYmVsfTwvc3Bhbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICApO1xyXG4gICAgICB9KX1cclxuICAgIDwvZGl2PixcclxuICAgIG1vdW50Tm9kZVxyXG4gICkgOiBudWxsO1xyXG5cclxuICByZXR1cm4gKFxyXG4gICAgPD5cclxuICAgICAgPHN0eWxlPntgXHJcbiAgICAgICAgc2VjdGlvbi5zdS1wYW5lbFtkYXRhLXNob3Atd2FsbGV0LWJyaWRnZS1hY3RpdmU9XCJ0cnVlXCJdID4gOm5vdChbZGF0YS1zaG9wLXdhbGxldC1oZWFkZXItcm9vdD1cInRydWVcIl0pOm5vdChbZGF0YS1zaG9wLXZvdWNoZXItcmVjb3JkLXJvb3Q9XCJ0cnVlXCJdKSB7XHJcbiAgICAgICAgICBkaXNwbGF5OiBub25lICFpbXBvcnRhbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNlY3Rpb24uc3UtcGFuZWxbZGF0YS1zaG9wLXdhbGxldC1icmlkZ2UtYWN0aXZlPVwidHJ1ZVwiXSA+IFtkYXRhLXNob3Atd2FsbGV0LWhlYWRlci1yb290PVwidHJ1ZVwiXSxcclxuICAgICAgICBzZWN0aW9uLnN1LXBhbmVsW2RhdGEtc2hvcC13YWxsZXQtYnJpZGdlLWFjdGl2ZT1cInRydWVcIl0gPiBbZGF0YS1zaG9wLXZvdWNoZXItcmVjb3JkLXJvb3Q9XCJ0cnVlXCJdIHtcclxuICAgICAgICAgIGRpc3BsYXk6IGJsb2NrICFpbXBvcnRhbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICBgfTwvc3R5bGU+XHJcbiAgICAgIHtoZWFkZXJQb3J0YWx9XHJcbiAgICAgIHtwYXlvdXRQb3J0YWx9XHJcbiAgICA8Lz5cclxuICApO1xyXG59XHJcblxyXG5mdW5jdGlvbiBWaXBBbW91bnREaXNwbGF5QnJpZGdlKCkge1xyXG4gIGNvbnN0IGxvY2F0aW9uID0gdXNlTG9jYXRpb24oKTtcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGNvbnN0IGFwcGx5ID0gKCkgPT4gc2FuaXRpemVWaXBBbW91bnRMYWJlbHMoZG9jdW1lbnQuYm9keSk7XHJcbiAgICBhcHBseSgpO1xyXG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiBhcHBseSgpKTtcclxuICAgIG9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuYm9keSwgeyBjaGlsZExpc3Q6IHRydWUsIHN1YnRyZWU6IHRydWUsIGNoYXJhY3RlckRhdGE6IHRydWUgfSk7XHJcbiAgICByZXR1cm4gKCkgPT4gb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xyXG4gIH0sIFtsb2NhdGlvbi5wYXRobmFtZV0pO1xyXG5cclxuICByZXR1cm4gKFxyXG4gICAgPHN0eWxlPntgXHJcbiAgICAgIC5zdS1zaG9wLWNhcmQtLXZpcCAuc3UtdmlwLWJhZGdlLFxyXG4gICAgICAuc3Utc2hvcC1jYXJkLS1yZWd1bGFyIC5zdS12aXAtYmFkZ2UsXHJcbiAgICAgIC5zdS1zaG9wLWNhcmQgLnN1LXZpcC1iYWRnZSB7XHJcbiAgICAgICAgZGlzcGxheTogbm9uZSAhaW1wb3J0YW50O1xyXG4gICAgICB9XHJcbiAgICBgfTwvc3R5bGU+XHJcbiAgKTtcclxufVxyXG5cclxuZnVuY3Rpb24gVmlwTWVtYmVyU3VtbWFyeUJyaWRnZSgpIHtcclxuICBjb25zdCBsb2NhdGlvbiA9IHVzZUxvY2F0aW9uKCk7XHJcblxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBpZiAobG9jYXRpb24ucGF0aG5hbWUgIT09IFwiL215XCIpIHJldHVybiB1bmRlZmluZWQ7XHJcblxyXG4gICAgY29uc3QgYXBwbHkgPSAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IHBhbmVscyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcInNlY3Rpb24uc3UtcGFuZWxcIikpO1xyXG4gICAgICBjb25zdCB0YXJnZXRQYW5lbCA9IHBhbmVscy5maW5kKChwYW5lbCkgPT4gU3RyaW5nKHBhbmVsLnRleHRDb250ZW50IHx8IFwiXCIpLmluY2x1ZGVzKFwi8J+On++4jyBWSVAg7IOB7ZKI6raMXCIpKTtcclxuICAgICAgaWYgKCF0YXJnZXRQYW5lbCkgcmV0dXJuO1xyXG5cclxuICAgICAgY29uc3QgcmVjZW50SXNzdWVkTGFiZWwgPSBBcnJheS5mcm9tKHRhcmdldFBhbmVsLnF1ZXJ5U2VsZWN0b3JBbGwoXCJkaXYsIHNwYW5cIikpXHJcbiAgICAgICAgLmZpbmQoKG5vZGUpID0+IFN0cmluZyhub2RlLnRleHRDb250ZW50IHx8IFwiXCIpLnRyaW0oKS5zdGFydHNXaXRoKFwi7LWc6re8IOuwnO2WieydvDpcIikpO1xyXG4gICAgICBpZiAoIXJlY2VudElzc3VlZExhYmVsKSByZXR1cm47XHJcblxyXG4gICAgICBjb25zdCBpbmZvR3JpZCA9IHJlY2VudElzc3VlZExhYmVsLnBhcmVudEVsZW1lbnQ7XHJcbiAgICAgIGNvbnN0IHN1bW1hcnlDYXJkID0gaW5mb0dyaWQ/LnBhcmVudEVsZW1lbnQ7XHJcbiAgICAgIGNvbnN0IHN1bW1hcnlXcmFwID0gc3VtbWFyeUNhcmQ/LnBhcmVudEVsZW1lbnQ7XHJcbiAgICAgIGlmICghaW5mb0dyaWQgfHwgIXN1bW1hcnlDYXJkKSByZXR1cm47XHJcblxyXG4gICAgICBpbmZvR3JpZC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgIHN1bW1hcnlDYXJkLnN0eWxlLnBhZGRpbmcgPSBcIjE0cHggMTRweFwiO1xyXG4gICAgICBzdW1tYXJ5Q2FyZC5zdHlsZS5ib3JkZXJSYWRpdXMgPSBcIjE4cHhcIjtcclxuICAgICAgc3VtbWFyeUNhcmQuc3R5bGUuYm94U2hhZG93ID0gXCIwIDEycHggMjhweCByZ2JhKDAsMCwwLDAuMTYpXCI7XHJcbiAgICAgIGlmIChzdW1tYXJ5V3JhcCkge1xyXG4gICAgICAgIHN1bW1hcnlXcmFwLnN0eWxlLm1hcmdpbkJvdHRvbSA9IFwiMTBweFwiO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBhbW91bnROb2RlID0gaW5mb0dyaWQucHJldmlvdXNFbGVtZW50U2libGluZztcclxuICAgICAgaWYgKGFtb3VudE5vZGUpIHtcclxuICAgICAgICBhbW91bnROb2RlLnN0eWxlLmZvbnRTaXplID0gXCIyNHB4XCI7XHJcbiAgICAgICAgYW1vdW50Tm9kZS5zdHlsZS5tYXJnaW5Cb3R0b20gPSBcIjZweFwiO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBoZWFkZXJSb3cgPSBhbW91bnROb2RlPy5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xyXG4gICAgICBpZiAoaGVhZGVyUm93KSB7XHJcbiAgICAgICAgaGVhZGVyUm93LnN0eWxlLm1hcmdpbkJvdHRvbSA9IFwiOHB4XCI7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgYXBwbHkoKTtcclxuICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4gYXBwbHkoKSk7XHJcbiAgICBvYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHsgY2hpbGRMaXN0OiB0cnVlLCBzdWJ0cmVlOiB0cnVlLCBjaGFyYWN0ZXJEYXRhOiB0cnVlIH0pO1xyXG4gICAgcmV0dXJuICgpID0+IG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcclxuICB9LCBbbG9jYXRpb24ucGF0aG5hbWVdKTtcclxuXHJcbiAgcmV0dXJuIG51bGw7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIE15T2ZmaWNlSGVyb0NsZWFudXBCcmlkZ2UoKSB7XHJcbiAgY29uc3QgbG9jYXRpb24gPSB1c2VMb2NhdGlvbigpO1xyXG5cclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgaWYgKGxvY2F0aW9uLnBhdGhuYW1lICE9PSBcIi9teVwiKSByZXR1cm4gdW5kZWZpbmVkO1xyXG5cclxuICAgIGNvbnN0IGFwcGx5ID0gKCkgPT4ge1xyXG4gICAgICBjb25zdCBhbGxOb2RlcyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcImRpdiwgc3BhbiwgYnV0dG9uXCIpKTtcclxuXHJcbiAgICAgIGFsbE5vZGVzLmZvckVhY2goKG5vZGUpID0+IHtcclxuICAgICAgICBjb25zdCB0ZXh0ID0gU3RyaW5nKG5vZGUudGV4dENvbnRlbnQgfHwgXCJcIikudHJpbSgpO1xyXG5cclxuICAgICAgICBpZiAodGV4dCA9PT0gXCLsg4HsoJAgUVIg67O06riwXCIgfHwgdGV4dCA9PT0gXCJQTkcg7KCA7J6lXCIpIHtcclxuICAgICAgICAgIGNvbnN0IGJ1dHRvbiA9IG5vZGUuY2xvc2VzdChcImJ1dHRvblwiKSB8fCBub2RlO1xyXG4gICAgICAgICAgaWYgKGJ1dHRvbiBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGJ1dHRvbi5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBjb21wYWN0VGV4dCA9IHRleHQucmVwbGFjZSgvXFxzKy9nLCBcIiBcIik7XHJcbiAgICAgICAgaWYgKC9e7LSdIOyggeumvVxccypbK1xcLV0/WzAtOSxdK1xccypQXFxzKlvCt3xdXFxzKuyCrOyaqVxccypbK1xcLV0/WzAtOSxdK1xccypQJC9pLnRlc3QoY29tcGFjdFRleHQpKSB7XHJcbiAgICAgICAgICBpZiAobm9kZSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgICAgIG5vZGUuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIGFwcGx5KCk7XHJcbiAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKCgpID0+IGFwcGx5KCkpO1xyXG4gICAgb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7IGNoaWxkTGlzdDogdHJ1ZSwgc3VidHJlZTogdHJ1ZSwgY2hhcmFjdGVyRGF0YTogdHJ1ZSB9KTtcclxuICAgIHJldHVybiAoKSA9PiBvYnNlcnZlci5kaXNjb25uZWN0KCk7XHJcbiAgfSwgW2xvY2F0aW9uLnBhdGhuYW1lXSk7XHJcblxyXG4gIHJldHVybiBudWxsO1xyXG59XHJcblxyXG5jb25zdCBDQVJEX1RIRU1FX1BSRVNFVFMgPSB7XHJcbiAgdGVhbDoge1xyXG4gICAga2V5OiBcInRlYWxcIixcclxuICAgIGxhYmVsOiBcIlBlYXJsIFRlYWxcIixcclxuICAgIG9yaWVudGF0aW9uOiBcImhvcml6b250YWxcIixcclxuICAgIHN1cmZhY2U6IFwibGluZWFyLWdyYWRpZW50KDEzNWRlZywgI2ViZmJmYiAwJSwgI2U0ZjdmNyA1MCUsICNmOGZmZmYgMTAwJSlcIixcclxuICAgIHByZXZpZXdCYWNrZ3JvdW5kOiBcImxpbmVhci1ncmFkaWVudCgxMzVkZWcsICNmYWZlZmYgMCUsICNlN2Y3ZjYgMTAwJSlcIixcclxuICAgIGFjY2VudDogXCIjMGU3NDkwXCIsXHJcbiAgICBib3JkZXI6IFwicmdiYSgxNCwgMTE2LCAxNDQsIDAuMjQpXCIsXHJcbiAgICBnbG93OiBcInJnYmEoMTQsIDExNiwgMTQ0LCAwLjE0KVwiLFxyXG4gICAgcGFuZWxCYWNrZ3JvdW5kOiBcInJnYmEoMTQsMTE2LDE0NCwwLjA2KVwiLFxyXG4gICAgdGl0bGU6IFwiIzBmMTcyYVwiLFxyXG4gICAgYm9keTogXCIjNTI2MjczXCIsXHJcbiAgICBmb2lsOiBcIiM3ZGQzYzdcIixcclxuICAgIGRhcms6IGZhbHNlLFxyXG4gICAgbGF5b3V0OiBcInNvZnRcIixcclxuICB9LFxyXG4gIGJsdWU6IHtcclxuICAgIGtleTogXCJibHVlXCIsXHJcbiAgICBsYWJlbDogXCJSb3lhbCBCbHVlXCIsXHJcbiAgICBvcmllbnRhdGlvbjogXCJob3Jpem9udGFsXCIsXHJcbiAgICBzdXJmYWNlOiBcImxpbmVhci1ncmFkaWVudCgxMzVkZWcsICNlZWY2ZmYgMCUsICNlNGVmZmYgNDglLCAjZjdmYmZmIDEwMCUpXCIsXHJcbiAgICBwcmV2aWV3QmFja2dyb3VuZDogXCJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjMTYzYjdhIDAlLCAjMGYyODU3IDEwMCUpXCIsXHJcbiAgICBhY2NlbnQ6IFwiIzhmZDNmZlwiLFxyXG4gICAgYm9yZGVyOiBcInJnYmEoMTQzLCAyMTEsIDI1NSwgMC4yNClcIixcclxuICAgIGdsb3c6IFwicmdiYSgxNSwgNDAsIDg3LCAwLjIyKVwiLFxyXG4gICAgcGFuZWxCYWNrZ3JvdW5kOiBcInJnYmEoMjU1LDI1NSwyNTUsMC4xKVwiLFxyXG4gICAgdGl0bGU6IFwiI2VmZjZmZlwiLFxyXG4gICAgYm9keTogXCJyZ2JhKDIxOSwgMjM0LCAyNTQsIDAuODQpXCIsXHJcbiAgICBmb2lsOiBcIiNkYmVhZmVcIixcclxuICAgIGRhcms6IHRydWUsXHJcbiAgICBsYXlvdXQ6IFwicmlnaHRwYW5lbFwiLFxyXG4gIH0sXHJcbiAgbmF2eToge1xyXG4gICAga2V5OiBcIm5hdnlcIixcclxuICAgIGxhYmVsOiBcIk5hdnkgR29sZGxpbmVcIixcclxuICAgIG9yaWVudGF0aW9uOiBcImhvcml6b250YWxcIixcclxuICAgIHN1cmZhY2U6IFwibGluZWFyLWdyYWRpZW50KDEzNWRlZywgI2VmZjNmYiAwJSwgI2U1ZWJmNyA1MiUsICNmOWZiZmYgMTAwJSlcIixcclxuICAgIHByZXZpZXdCYWNrZ3JvdW5kOiBcImxpbmVhci1ncmFkaWVudCgxMzVkZWcsICMwZjFjMzUgMCUsICMxODJiNGQgMTAwJSlcIixcclxuICAgIGFjY2VudDogXCIjZDZhODQ3XCIsXHJcbiAgICBib3JkZXI6IFwicmdiYSgyMTQsIDE2OCwgNzEsIDAuMjQpXCIsXHJcbiAgICBnbG93OiBcInJnYmEoMTUsIDI4LCA1MywgMC4yNilcIixcclxuICAgIHBhbmVsQmFja2dyb3VuZDogXCJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpXCIsXHJcbiAgICB0aXRsZTogXCIjZjhmYWZjXCIsXHJcbiAgICBib2R5OiBcInJnYmEoMjI2LCAyMzIsIDI0MCwgMC43OClcIixcclxuICAgIGZvaWw6IFwiI2YzZDU4ZFwiLFxyXG4gICAgZGFyazogdHJ1ZSxcclxuICAgIGxheW91dDogXCJiYW5kXCIsXHJcbiAgfSxcclxuICBwdXJwbGU6IHtcclxuICAgIGtleTogXCJwdXJwbGVcIixcclxuICAgIGxhYmVsOiBcIlBsdW0gU2lnbmF0dXJlXCIsXHJcbiAgICBvcmllbnRhdGlvbjogXCJ2ZXJ0aWNhbFwiLFxyXG4gICAgc3VyZmFjZTogXCJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjZjdmMWZmIDAlLCAjZWZlOGZiIDUyJSwgI2ZjZjlmZiAxMDAlKVwiLFxyXG4gICAgcHJldmlld0JhY2tncm91bmQ6IFwibGluZWFyLWdyYWRpZW50KDEzNWRlZywgIzNmMmE1NiAwJSwgIzViM2I3OCAxMDAlKVwiLFxyXG4gICAgYWNjZW50OiBcIiNlOWQ1ZmZcIixcclxuICAgIGJvcmRlcjogXCJyZ2JhKDIxNiwgMTgwLCAyNTQsIDAuMjIpXCIsXHJcbiAgICBnbG93OiBcInJnYmEoOTEsIDU5LCAxMjAsIDAuMilcIixcclxuICAgIHBhbmVsQmFja2dyb3VuZDogXCJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpXCIsXHJcbiAgICB0aXRsZTogXCIjZmFmNWZmXCIsXHJcbiAgICBib2R5OiBcInJnYmEoMjQzLCAyMzIsIDI1NSwgMC44MilcIixcclxuICAgIGZvaWw6IFwiI2YxZTRmZlwiLFxyXG4gICAgZGFyazogdHJ1ZSxcclxuICAgIGxheW91dDogXCJ0b3BiYXJcIixcclxuICB9LFxyXG4gIHBpbms6IHtcclxuICAgIGtleTogXCJwaW5rXCIsXHJcbiAgICBsYWJlbDogXCJSb3NlIFNpbGtcIixcclxuICAgIG9yaWVudGF0aW9uOiBcInZlcnRpY2FsXCIsXHJcbiAgICBzdXJmYWNlOiBcImxpbmVhci1ncmFkaWVudCgxMzVkZWcsICNmZmYyZjcgMCUsICNmZmVhZjIgNTAlLCAjZmZmOWZiIDEwMCUpXCIsXHJcbiAgICBwcmV2aWV3QmFja2dyb3VuZDogXCJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjZmZmZGZkIDAlLCAjZmNlZWYzIDEwMCUpXCIsXHJcbiAgICBhY2NlbnQ6IFwiI2JlMTg1ZFwiLFxyXG4gICAgYm9yZGVyOiBcInJnYmEoMTkwLCAyNCwgOTMsIDAuMTgpXCIsXHJcbiAgICBnbG93OiBcInJnYmEoMjM2LCA3MiwgMTUzLCAwLjEyKVwiLFxyXG4gICAgcGFuZWxCYWNrZ3JvdW5kOiBcInJnYmEoMTkwLDI0LDkzLDAuMDUpXCIsXHJcbiAgICB0aXRsZTogXCIjM2YxZDJlXCIsXHJcbiAgICBib2R5OiBcIiM2YjRjNWRcIixcclxuICAgIGZvaWw6IFwiI2Y4YjRkOVwiLFxyXG4gICAgZGFyazogZmFsc2UsXHJcbiAgICBsYXlvdXQ6IFwiY29ybmVyXCIsXHJcbiAgfSxcclxuICByZWQ6IHtcclxuICAgIGtleTogXCJyZWRcIixcclxuICAgIGxhYmVsOiBcIkJ1cmd1bmR5IENyZXN0XCIsXHJcbiAgICBvcmllbnRhdGlvbjogXCJob3Jpem9udGFsXCIsXHJcbiAgICBzdXJmYWNlOiBcImxpbmVhci1ncmFkaWVudCgxMzVkZWcsICNmZmY0ZjQgMCUsICNmZWViZWIgNTAlLCAjZmZmOWY5IDEwMCUpXCIsXHJcbiAgICBwcmV2aWV3QmFja2dyb3VuZDogXCJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjNWExMzI2IDAlLCAjN2YxZDFkIDEwMCUpXCIsXHJcbiAgICBhY2NlbnQ6IFwiI2YwYjNiNlwiLFxyXG4gICAgYm9yZGVyOiBcInJnYmEoMjQwLCAxNzksIDE4MiwgMC4yMilcIixcclxuICAgIGdsb3c6IFwicmdiYSgxMjcsIDI5LCAyOSwgMC4yKVwiLFxyXG4gICAgcGFuZWxCYWNrZ3JvdW5kOiBcInJnYmEoMjU1LDI1NSwyNTUsMC4wOClcIixcclxuICAgIHRpdGxlOiBcIiNmZmY3ZjdcIixcclxuICAgIGJvZHk6IFwicmdiYSgyNTQsIDIyNiwgMjI2LCAwLjgyKVwiLFxyXG4gICAgZm9pbDogXCIjZjZkNWQ4XCIsXHJcbiAgICBkYXJrOiB0cnVlLFxyXG4gICAgbGF5b3V0OiBcInNwbGl0XCIsXHJcbiAgfSxcclxuICBvcmFuZ2U6IHtcclxuICAgIGtleTogXCJvcmFuZ2VcIixcclxuICAgIGxhYmVsOiBcIkNvcHBlciBMaW5lXCIsXHJcbiAgICBvcmllbnRhdGlvbjogXCJ2ZXJ0aWNhbFwiLFxyXG4gICAgc3VyZmFjZTogXCJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjZmZmOGYxIDAlLCAjZmZmMGUzIDUyJSwgI2ZmZmFmNiAxMDAlKVwiLFxyXG4gICAgcHJldmlld0JhY2tncm91bmQ6IFwibGluZWFyLWdyYWRpZW50KDEzNWRlZywgI2ZmZmRmYiAwJSwgI2Y4ZWZlNyAxMDAlKVwiLFxyXG4gICAgYWNjZW50OiBcIiNiNDUzMDlcIixcclxuICAgIGJvcmRlcjogXCJyZ2JhKDE4MCwgODMsIDksIDAuMTgpXCIsXHJcbiAgICBnbG93OiBcInJnYmEoMTgwLCA4MywgOSwgMC4xMilcIixcclxuICAgIHBhbmVsQmFja2dyb3VuZDogXCJyZ2JhKDE4MCw4Myw5LDAuMDUpXCIsXHJcbiAgICB0aXRsZTogXCIjM2IyNDE1XCIsXHJcbiAgICBib2R5OiBcIiM2YjU4NGNcIixcclxuICAgIGZvaWw6IFwiI2UwYTk2ZFwiLFxyXG4gICAgZGFyazogZmFsc2UsXHJcbiAgICBsYXlvdXQ6IFwiYm90dG9tbGluZVwiLFxyXG4gIH0sXHJcbiAgZ3JlZW46IHtcclxuICAgIGtleTogXCJncmVlblwiLFxyXG4gICAgbGFiZWw6IFwiRW1lcmFsZCBMZWRnZXJcIixcclxuICAgIG9yaWVudGF0aW9uOiBcInZlcnRpY2FsXCIsXHJcbiAgICBzdXJmYWNlOiBcImxpbmVhci1ncmFkaWVudCgxMzVkZWcsICNlZWZjZjIgMCUsICNlNWY2ZWEgNTAlLCAjZjhmZmY5IDEwMCUpXCIsXHJcbiAgICBwcmV2aWV3QmFja2dyb3VuZDogXCJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjMTAzYjI4IDAlLCAjMTg1MjM3IDEwMCUpXCIsXHJcbiAgICBhY2NlbnQ6IFwiIzlmZTZiYVwiLFxyXG4gICAgYm9yZGVyOiBcInJnYmEoMTU5LCAyMzAsIDE4NiwgMC4yKVwiLFxyXG4gICAgZ2xvdzogXCJyZ2JhKDE2LCA1OSwgNDAsIDAuMilcIixcclxuICAgIHBhbmVsQmFja2dyb3VuZDogXCJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpXCIsXHJcbiAgICB0aXRsZTogXCIjZjBmZGY0XCIsXHJcbiAgICBib2R5OiBcInJnYmEoMjIwLCAyNTIsIDIzMSwgMC44MilcIixcclxuICAgIGZvaWw6IFwiI2QzZjBkYlwiLFxyXG4gICAgZGFyazogdHJ1ZSxcclxuICAgIGxheW91dDogXCJzdHJpcGVcIixcclxuICB9LFxyXG4gIGdvbGQ6IHtcclxuICAgIGtleTogXCJnb2xkXCIsXHJcbiAgICBsYWJlbDogXCJFeGVjdXRpdmUgR29sZFwiLFxyXG4gICAgb3JpZW50YXRpb246IFwiaG9yaXpvbnRhbFwiLFxyXG4gICAgc3VyZmFjZTogXCJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjZmZmOWVjIDAlLCAjZmRmMmQ3IDUwJSwgI2ZmZmRmNyAxMDAlKVwiLFxyXG4gICAgcHJldmlld0JhY2tncm91bmQ6IFwibGluZWFyLWdyYWRpZW50KDEzNWRlZywgI2ZmZmRmYSAwJSwgI2Y3ZjFlNSAxMDAlKVwiLFxyXG4gICAgYWNjZW50OiBcIiNiNjhhMmZcIixcclxuICAgIGJvcmRlcjogXCJyZ2JhKDE4MiwgMTM4LCA0NywgMC4yNClcIixcclxuICAgIGdsb3c6IFwicmdiYSgxODIsIDEzOCwgNDcsIDAuMTQpXCIsXHJcbiAgICBwYW5lbEJhY2tncm91bmQ6IFwicmdiYSgxODIsMTM4LDQ3LDAuMDYpXCIsXHJcbiAgICB0aXRsZTogXCIjMWYyOTM3XCIsXHJcbiAgICBib2R5OiBcIiM2YjcyODBcIixcclxuICAgIGZvaWw6IFwiI2Q2YjE1YlwiLFxyXG4gICAgZGFyazogZmFsc2UsXHJcbiAgICBsYXlvdXQ6IFwidG9wYmFyXCIsXHJcbiAgfSxcclxuICBkYXJrOiB7XHJcbiAgICBrZXk6IFwiZGFya1wiLFxyXG4gICAgbGFiZWw6IFwiQmxhY2sgTWV0YWxcIixcclxuICAgIG9yaWVudGF0aW9uOiBcInZlcnRpY2FsXCIsXHJcbiAgICBzdXJmYWNlOiBcImxpbmVhci1ncmFkaWVudCgxMzVkZWcsICNmNGY1ZjcgMCUsICNlYWVkZjEgNTAlLCAjZmFmYmZjIDEwMCUpXCIsXHJcbiAgICBwcmV2aWV3QmFja2dyb3VuZDogXCJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjMTExMTExIDAlLCAjMjQyNDI0IDEwMCUpXCIsXHJcbiAgICBhY2NlbnQ6IFwiI2Q0ZDRkOFwiLFxyXG4gICAgYm9yZGVyOiBcInJnYmEoMjEyLCAyMTIsIDIxNiwgMC4yKVwiLFxyXG4gICAgZ2xvdzogXCJyZ2JhKDAsIDAsIDAsIDAuMjYpXCIsXHJcbiAgICBwYW5lbEJhY2tncm91bmQ6IFwicmdiYSgyNTUsMjU1LDI1NSwwLjA3KVwiLFxyXG4gICAgdGl0bGU6IFwiI2ZhZmFmYVwiLFxyXG4gICAgYm9keTogXCJyZ2JhKDIyOCwgMjI4LCAyMzEsIDAuNzgpXCIsXHJcbiAgICBmb2lsOiBcIiNmM2Y0ZjZcIixcclxuICAgIGRhcms6IHRydWUsXHJcbiAgICBsYXlvdXQ6IFwibWluaW1hbC1kYXJrXCIsXHJcbiAgfSxcclxufTtcclxuXHJcbmNvbnN0IENBUkRfTUVUQV9QUkVGSVggPSBcIl9fY2FyZF9tZXRhX19cIjtcclxuXHJcbmZ1bmN0aW9uIG5vcm1hbGl6ZUNhcmRTbHVnSW5wdXQodmFsdWUpIHtcclxuICByZXR1cm4gU3RyaW5nKHZhbHVlIHx8IFwiXCIpXHJcbiAgICAudG9Mb3dlckNhc2UoKVxyXG4gICAgLnJlcGxhY2UoL1teYS16MC05LV9dL2csIFwiXCIpXHJcbiAgICAuc2xpY2UoMCwgNDgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBidWlsZERlZmF1bHRDYXJkU2x1Zyhzb3VyY2UpIHtcclxuICBjb25zdCBub3JtYWxpemVkID0gbm9ybWFsaXplQ2FyZFNsdWdJbnB1dChTdHJpbmcoc291cmNlIHx8IFwiXCIpLnJlcGxhY2UoL1xccysvZywgXCItXCIpKTtcclxuICBpZiAobm9ybWFsaXplZC5sZW5ndGggPj0gMikgcmV0dXJuIG5vcm1hbGl6ZWQ7XHJcbiAgcmV0dXJuIGBjYXJkLSR7RGF0ZS5ub3coKS50b1N0cmluZygpLnNsaWNlKC02KX1gO1xyXG59XHJcblxyXG5mdW5jdGlvbiByb3VuZFJlY3RQYXRoKGN0eCwgeCwgeSwgd2lkdGgsIGhlaWdodCwgcmFkaXVzKSB7XHJcbiAgY29uc3Qgc2FmZVJhZGl1cyA9IE1hdGgubWF4KDAsIE1hdGgubWluKHJhZGl1cywgTWF0aC5taW4od2lkdGgsIGhlaWdodCkgLyAyKSk7XHJcbiAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gIGN0eC5tb3ZlVG8oeCArIHNhZmVSYWRpdXMsIHkpO1xyXG4gIGN0eC5hcmNUbyh4ICsgd2lkdGgsIHksIHggKyB3aWR0aCwgeSArIGhlaWdodCwgc2FmZVJhZGl1cyk7XHJcbiAgY3R4LmFyY1RvKHggKyB3aWR0aCwgeSArIGhlaWdodCwgeCwgeSArIGhlaWdodCwgc2FmZVJhZGl1cyk7XHJcbiAgY3R4LmFyY1RvKHgsIHkgKyBoZWlnaHQsIHgsIHksIHNhZmVSYWRpdXMpO1xyXG4gIGN0eC5hcmNUbyh4LCB5LCB4ICsgd2lkdGgsIHksIHNhZmVSYWRpdXMpO1xyXG4gIGN0eC5jbG9zZVBhdGgoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gd3JhcENhbnZhc1RleHQoY3R4LCB0ZXh0LCBtYXhXaWR0aCkge1xyXG4gIGNvbnN0IHJhdyA9IFN0cmluZyh0ZXh0IHx8IFwiXCIpLnRyaW0oKTtcclxuICBpZiAoIXJhdykgcmV0dXJuIFtdO1xyXG4gIGNvbnN0IHdvcmRzID0gcmF3LnNwbGl0KC9cXHMrLyk7XHJcbiAgY29uc3QgbGluZXMgPSBbXTtcclxuICBsZXQgY3VycmVudCA9IFwiXCI7XHJcbiAgd29yZHMuZm9yRWFjaCgod29yZCkgPT4ge1xyXG4gICAgY29uc3QgbmV4dCA9IGN1cnJlbnQgPyBgJHtjdXJyZW50fSAke3dvcmR9YCA6IHdvcmQ7XHJcbiAgICBpZiAoY3R4Lm1lYXN1cmVUZXh0KG5leHQpLndpZHRoIDw9IG1heFdpZHRoIHx8ICFjdXJyZW50KSB7XHJcbiAgICAgIGN1cnJlbnQgPSBuZXh0O1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBsaW5lcy5wdXNoKGN1cnJlbnQpO1xyXG4gICAgY3VycmVudCA9IHdvcmQ7XHJcbiAgfSk7XHJcbiAgaWYgKGN1cnJlbnQpIGxpbmVzLnB1c2goY3VycmVudCk7XHJcbiAgcmV0dXJuIGxpbmVzO1xyXG59XHJcblxyXG5mdW5jdGlvbiBleHRyYWN0Q2FyZE1ldGEobGlua3MpIHtcclxuICBjb25zdCBtZXRhID0ge307XHJcbiAgY29uc3QgcHJlc2VydmVkTGlua3MgPSBbXTtcclxuICAoQXJyYXkuaXNBcnJheShsaW5rcykgPyBsaW5rcyA6IFtdKS5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICBjb25zdCBjYXRlZ29yeSA9IFN0cmluZyhpdGVtPy5jYXRlZ29yeSB8fCBcIlwiKS50cmltKCk7XHJcbiAgICBpZiAoaXRlbT8udHlwZSA9PT0gXCJjdXN0b21cIiAmJiBjYXRlZ29yeS5zdGFydHNXaXRoKGAke0NBUkRfTUVUQV9QUkVGSVh9OmApKSB7XHJcbiAgICAgIGNvbnN0IGtleSA9IGNhdGVnb3J5LnNsaWNlKENBUkRfTUVUQV9QUkVGSVgubGVuZ3RoICsgMSk7XHJcbiAgICAgIGlmIChrZXkpIG1ldGFba2V5XSA9IFN0cmluZyhpdGVtPy52YWx1ZSB8fCBcIlwiKS50cmltKCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHByZXNlcnZlZExpbmtzLnB1c2goaXRlbSk7XHJcbiAgfSk7XHJcbiAgcmV0dXJuIHsgbWV0YSwgcHJlc2VydmVkTGlua3MgfTtcclxufVxyXG5cclxuZnVuY3Rpb24gYnVpbGRDYXJkTWV0YUxpbmtzKGZpZWxkcywgcHJlc2VydmVkTGlua3MpIHtcclxuICBjb25zdCBtZXRhTGlua3MgPSBPYmplY3QuZW50cmllcyhmaWVsZHMpLm1hcCgoW2tleSwgdmFsdWVdLCBpbmRleCkgPT4gKHtcclxuICAgIGlkOiBgY2FyZC1tZXRhLSR7a2V5fS0ke2luZGV4fWAsXHJcbiAgICB0eXBlOiBcImN1c3RvbVwiLFxyXG4gICAgY2F0ZWdvcnk6IGAke0NBUkRfTUVUQV9QUkVGSVh9OiR7a2V5fWAsXHJcbiAgICB2YWx1ZTogU3RyaW5nKHZhbHVlIHx8IFwiXCIpLnRyaW0oKSxcclxuICB9KSk7XHJcbiAgcmV0dXJuIFsuLi4oQXJyYXkuaXNBcnJheShwcmVzZXJ2ZWRMaW5rcykgPyBwcmVzZXJ2ZWRMaW5rcyA6IFtdKSwgLi4ubWV0YUxpbmtzXTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2ltcGxpZnlXZWJzaXRlTGFiZWwodmFsdWUpIHtcclxuICByZXR1cm4gU3RyaW5nKHZhbHVlIHx8IFwiXCIpXHJcbiAgICAudHJpbSgpXHJcbiAgICAucmVwbGFjZSgvXmh0dHBzPzpcXC9cXC8vaSwgXCJcIilcclxuICAgIC5yZXBsYWNlKC9ed3d3XFwuL2ksIFwiXCIpXHJcbiAgICAucmVwbGFjZSgvXFwvJC8sIFwiXCIpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBidWlsZENhcmRGb3JtKGRlZmF1bHROYW1lID0gXCJcIiwgZGVmYXVsdFBob25lID0gXCJcIikge1xyXG4gIHJldHVybiB7XHJcbiAgICBjb21wYW55TmFtZTogXCJcIixcclxuICAgIGpvYlRpdGxlOiBcIlwiLFxyXG4gICAgbmFtZTogU3RyaW5nKGRlZmF1bHROYW1lIHx8IFwiXCIpLnRyaW0oKSxcclxuICAgIHBob25lOiBTdHJpbmcoZGVmYXVsdFBob25lIHx8IFwiXCIpLnRyaW0oKSxcclxuICAgIG1vYmlsZTogU3RyaW5nKGRlZmF1bHRQaG9uZSB8fCBcIlwiKS50cmltKCksXHJcbiAgICBhZGRyZXNzOiBcIlwiLFxyXG4gICAgd2Vic2l0ZTogXCJcIixcclxuICAgIGludHJvOiBcIlwiLFxyXG4gICAgY2FyZFB1YmxpYzogdHJ1ZSxcclxuICB9O1xyXG59XHJcblxyXG5mdW5jdGlvbiByZXNvbHZlQ2FyZFRoZW1lS2V5KHZhbHVlKSB7XHJcbiAgY29uc3Qga2V5ID0gU3RyaW5nKHZhbHVlIHx8IFwidGVhbFwiKS50cmltKCkudG9Mb3dlckNhc2UoKTtcclxuICByZXR1cm4gQ0FSRF9USEVNRV9QUkVTRVRTW2tleV0gPyBrZXkgOiBcInRlYWxcIjtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVzb2x2ZUNhcmRPcmllbnRhdGlvbih2YWx1ZSkge1xyXG4gIHJldHVybiBTdHJpbmcodmFsdWUgfHwgXCJob3Jpem9udGFsXCIpLnRyaW0oKS50b0xvd2VyQ2FzZSgpID09PSBcInZlcnRpY2FsXCIgPyBcInZlcnRpY2FsXCIgOiBcImhvcml6b250YWxcIjtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVhZENhcmRGaWVsZHNGcm9tUmVjb3JkKHJlY29yZCwgZGVmYXVsdHMgPSB7fSkge1xyXG4gIGNvbnN0IHsgbWV0YSwgcHJlc2VydmVkTGlua3MgfSA9IGV4dHJhY3RDYXJkTWV0YShyZWNvcmQ/LmxpbmtzIHx8IFtdKTtcclxuICBjb25zdCBkZWZhdWx0TmFtZSA9IFN0cmluZyhkZWZhdWx0cy5kZWZhdWx0TmFtZSB8fCBcIlwiKS50cmltKCk7XHJcbiAgY29uc3QgZGVmYXVsdFBob25lID0gU3RyaW5nKGRlZmF1bHRzLmRlZmF1bHRQaG9uZSB8fCBcIlwiKS50cmltKCk7XHJcbiAgY29uc3QgZmFsbGJhY2tGb3JtID0gYnVpbGRDYXJkRm9ybShkZWZhdWx0TmFtZSwgZGVmYXVsdFBob25lKTtcclxuICBjb25zdCByZXNvbHZlZFRoZW1lS2V5ID0gcmVzb2x2ZUNhcmRUaGVtZUtleShyZWNvcmQ/LnRlbXBsYXRlIHx8IG1ldGEudGhlbWVDb2xvciB8fCBcInRlYWxcIik7XHJcbiAgcmV0dXJuIHtcclxuICAgIGZvcm06IHtcclxuICAgICAgLi4uZmFsbGJhY2tGb3JtLFxyXG4gICAgICBjb21wYW55TmFtZTogU3RyaW5nKG1ldGEuY29tcGFueU5hbWUgfHwgXCJcIikudHJpbSgpLFxyXG4gICAgICBqb2JUaXRsZTogU3RyaW5nKG1ldGEuam9iVGl0bGUgfHwgXCJcIikudHJpbSgpLFxyXG4gICAgICBuYW1lOiBTdHJpbmcobWV0YS5uYW1lIHx8IHJlY29yZD8ubmFtZSB8fCBkZWZhdWx0TmFtZSB8fCBcIlwiKS50cmltKCksXHJcbiAgICAgIHBob25lOiBTdHJpbmcobWV0YS5waG9uZSB8fCByZWNvcmQ/LnBob25lIHx8IGRlZmF1bHRQaG9uZSB8fCBcIlwiKS50cmltKCksXHJcbiAgICAgIG1vYmlsZTogU3RyaW5nKG1ldGEubW9iaWxlIHx8IGRlZmF1bHRQaG9uZSB8fCBcIlwiKS50cmltKCksXHJcbiAgICAgIGFkZHJlc3M6IFN0cmluZyhtZXRhLmFkZHJlc3MgfHwgXCJcIikudHJpbSgpLFxyXG4gICAgICB3ZWJzaXRlOiBTdHJpbmcobWV0YS53ZWJzaXRlIHx8IFwiXCIpLnRyaW0oKSxcclxuICAgICAgaW50cm86IFN0cmluZyhyZWNvcmQ/LmJpbyB8fCBtZXRhLmludHJvIHx8IFwiXCIpLnRyaW0oKSxcclxuICAgICAgY2FyZFB1YmxpYzogcmVjb3JkPy5jYXJkUHVibGljICE9PSBmYWxzZSxcclxuICAgIH0sXHJcbiAgICBwcmVzZXJ2ZWRMaW5rcyxcclxuICAgIHRoZW1lS2V5OiByZXNvbHZlZFRoZW1lS2V5LFxyXG4gICAgb3JpZW50YXRpb246IHJlc29sdmVDYXJkT3JpZW50YXRpb24obWV0YS5vcmllbnRhdGlvbiB8fCBDQVJEX1RIRU1FX1BSRVNFVFNbcmVzb2x2ZWRUaGVtZUtleV0/Lm9yaWVudGF0aW9uIHx8IFwiaG9yaXpvbnRhbFwiKSxcclxuICAgIHNsdWc6IG5vcm1hbGl6ZUNhcmRTbHVnSW5wdXQocmVjb3JkPy5jYXJkU2x1ZyB8fCBcIlwiKSxcclxuICB9O1xyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVDYXJkUGF5bG9hZChmb3JtLCB0aGVtZUtleSwgb3JpZW50YXRpb24sIHByZXNlcnZlZExpbmtzLCBjYXJkU2x1Zykge1xyXG4gIHJldHVybiB7XHJcbiAgICBjYXJkU2x1ZyxcclxuICAgIGJpbzogU3RyaW5nKGZvcm0uaW50cm8gfHwgXCJcIikudHJpbSgpLFxyXG4gICAgY2FyZFB1YmxpYzogdHJ1ZSxcclxuICAgIGxpbmtzOiBidWlsZENhcmRNZXRhTGlua3MoXHJcbiAgICAgIHtcclxuICAgICAgICBjb21wYW55TmFtZTogZm9ybS5jb21wYW55TmFtZSxcclxuICAgICAgICBqb2JUaXRsZTogZm9ybS5qb2JUaXRsZSxcclxuICAgICAgICBuYW1lOiBmb3JtLm5hbWUsXHJcbiAgICAgICAgcGhvbmU6IGZvcm0ucGhvbmUsXHJcbiAgICAgICAgbW9iaWxlOiBmb3JtLm1vYmlsZSxcclxuICAgICAgICBhZGRyZXNzOiBmb3JtLmFkZHJlc3MsXHJcbiAgICAgICAgd2Vic2l0ZTogZm9ybS53ZWJzaXRlLFxyXG4gICAgICAgIHRoZW1lQ29sb3I6IHRoZW1lS2V5LFxyXG4gICAgICAgIG9yaWVudGF0aW9uLFxyXG4gICAgICB9LFxyXG4gICAgICBwcmVzZXJ2ZWRMaW5rc1xyXG4gICAgKSxcclxuICAgIHRlbXBsYXRlOiB0aGVtZUtleSxcclxuICB9O1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDYXJkRGlzcGxheVdlYnNpdGUodmFsdWUpIHtcclxuICByZXR1cm4gc2ltcGxpZnlXZWJzaXRlTGFiZWwodmFsdWUpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRDYXJkSW5mb0xpbmVzKGZvcm0pIHtcclxuICByZXR1cm4gW2Zvcm0ucGhvbmUsIGZvcm0ubW9iaWxlXS5maWx0ZXIoKHZhbHVlLCBpbmRleCwgYXJyYXkpID0+IHtcclxuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBTdHJpbmcodmFsdWUgfHwgXCJcIikudHJpbSgpO1xyXG4gICAgcmV0dXJuIG5vcm1hbGl6ZWQgJiYgYXJyYXkuZmluZEluZGV4KChpdGVtKSA9PiBTdHJpbmcoaXRlbSB8fCBcIlwiKS50cmltKCkgPT09IG5vcm1hbGl6ZWQpID09PSBpbmRleDtcclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2hvdWxkU2hvd0NhcmRTaWRlUGFuZWwoZm9ybSkge1xyXG4gIHJldHVybiAhIShTdHJpbmcoZm9ybS5jb21wYW55TmFtZSB8fCBcIlwiKS50cmltKCkgfHwgU3RyaW5nKGZvcm0uam9iVGl0bGUgfHwgXCJcIikudHJpbSgpIHx8IGdldENhcmREaXNwbGF5V2Vic2l0ZShmb3JtLndlYnNpdGUpKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gZW5zdXJlQ2FyZFNsdWcobWVtYmVySWQsIHByZWZlcnJlZFNvdXJjZSwgY3VycmVudFNsdWcgPSBcIlwiKSB7XHJcbiAgY29uc3QgcHJlc2VydmVkID0gbm9ybWFsaXplQ2FyZFNsdWdJbnB1dChjdXJyZW50U2x1Zyk7XHJcbiAgaWYgKHByZXNlcnZlZC5sZW5ndGggPj0gMikgcmV0dXJuIHByZXNlcnZlZDtcclxuICBjb25zdCBiYXNlID0gYnVpbGREZWZhdWx0Q2FyZFNsdWcocHJlZmVycmVkU291cmNlIHx8IG1lbWJlcklkIHx8IFwiY2FyZFwiKTtcclxuICBjb25zdCBjYW5kaWRhdGVzID0gW2Jhc2UsIGAke2Jhc2V9LSR7U3RyaW5nKG1lbWJlcklkIHx8IFwibWVtYmVyXCIpLnNsaWNlKC00KX1gXTtcclxuICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgY2FuZGlkYXRlcy5sZW5ndGg7IGluZGV4ICs9IDEpIHtcclxuICAgIGNvbnN0IGNhbmRpZGF0ZSA9IG5vcm1hbGl6ZUNhcmRTbHVnSW5wdXQoY2FuZGlkYXRlc1tpbmRleF0pO1xyXG4gICAgaWYgKGNhbmRpZGF0ZS5sZW5ndGggPCAyKSBjb250aW51ZTtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHN0b3JhZ2VBZGFwdGVyLmNoZWNrQ2FyZFNsdWcoY2FuZGlkYXRlKTtcclxuICAgICAgaWYgKHJlc3VsdD8uYXZhaWxhYmxlKSByZXR1cm4gY2FuZGlkYXRlO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHt9XHJcbiAgfVxyXG4gIGxldCBzdWZmaXggPSAxO1xyXG4gIHdoaWxlIChzdWZmaXggPCAyMCkge1xyXG4gICAgY29uc3QgY2FuZGlkYXRlID0gbm9ybWFsaXplQ2FyZFNsdWdJbnB1dChgJHtiYXNlfS0ke3N1ZmZpeH1gKTtcclxuICAgIGlmIChjYW5kaWRhdGUubGVuZ3RoIDwgMikge1xyXG4gICAgICBzdWZmaXggKz0gMTtcclxuICAgICAgY29udGludWU7XHJcbiAgICB9XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBzdG9yYWdlQWRhcHRlci5jaGVja0NhcmRTbHVnKGNhbmRpZGF0ZSk7XHJcbiAgICAgIGlmIChyZXN1bHQ/LmF2YWlsYWJsZSkgcmV0dXJuIGNhbmRpZGF0ZTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxyXG4gICAgc3VmZml4ICs9IDE7XHJcbiAgfVxyXG4gIHJldHVybiBub3JtYWxpemVDYXJkU2x1Z0lucHV0KGAke2Jhc2V9LSR7RGF0ZS5ub3coKS50b1N0cmluZygpLnNsaWNlKC00KX1gKTtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Q2FyZEZpbGVTdGVtKGZvcm0sIGZhbGxiYWNrU2x1ZyA9IFwiXCIpIHtcclxuICBjb25zdCByYXcgPSBTdHJpbmcoZm9ybS5uYW1lIHx8IGZvcm0uY29tcGFueU5hbWUgfHwgZmFsbGJhY2tTbHVnIHx8IFwiYnVzaW5lc3MtY2FyZFwiKS50cmltKCk7XHJcbiAgcmV0dXJuIHJhdy5yZXBsYWNlKC9bXFxcXC86Kj9cIjw+fF0vZywgXCJcIikucmVwbGFjZSgvXFxzKy9nLCBcIl9cIikgfHwgXCJidXNpbmVzcy1jYXJkXCI7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGJ1aWxkQnVzaW5lc3NDYXJkSW1hZ2VEYXRhVXJsKGZvcm0sIHRoZW1lS2V5LCBvcmllbnRhdGlvbiA9IFwiaG9yaXpvbnRhbFwiKSB7XHJcbiAgY29uc3QgdGhlbWUgPSBDQVJEX1RIRU1FX1BSRVNFVFNbcmVzb2x2ZUNhcmRUaGVtZUtleSh0aGVtZUtleSldIHx8IENBUkRfVEhFTUVfUFJFU0VUUy50ZWFsO1xyXG4gIGNvbnN0IGNhcmRPcmllbnRhdGlvbiA9IHJlc29sdmVDYXJkT3JpZW50YXRpb24ob3JpZW50YXRpb24gfHwgdGhlbWUub3JpZW50YXRpb24pO1xyXG4gIGNvbnN0IGRpc3BsYXlXZWJzaXRlID0gZ2V0Q2FyZERpc3BsYXlXZWJzaXRlKGZvcm0ud2Vic2l0ZSk7XHJcbiAgY29uc3Qgc2hvd1NpZGVQYW5lbCA9IHNob3VsZFNob3dDYXJkU2lkZVBhbmVsKGZvcm0pICYmIGNhcmRPcmllbnRhdGlvbiA9PT0gXCJob3Jpem9udGFsXCI7XHJcbiAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcclxuICBjYW52YXMud2lkdGggPSBjYXJkT3JpZW50YXRpb24gPT09IFwidmVydGljYWxcIiA/IDg2MCA6IDEyMDA7XHJcbiAgY2FudmFzLmhlaWdodCA9IGNhcmRPcmllbnRhdGlvbiA9PT0gXCJ2ZXJ0aWNhbFwiID8gMTIwMCA6IDcyMDtcclxuICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG4gIGlmICghY3R4KSB0aHJvdyBuZXcgRXJyb3IoXCLsnbTrr7jsp4Ag7IOd7ISxIOy7qO2FjeyKpO2KuOulvCDrp4zrk6Qg7IiYIOyXhuyKteuLiOuLpC5cIik7XHJcblxyXG4gIGNvbnN0IGJhY2tncm91bmQgPSBjdHguY3JlYXRlTGluZWFyR3JhZGllbnQoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcclxuICBjb25zdCBncmFkaWVudFBhcnRzID0gdGhlbWUucHJldmlld0JhY2tncm91bmQubWF0Y2goLyMoPzpbMC05YS1mQS1GXXszfSl7MSwyfS9nKSB8fCBbXCIjZmZmZmZmXCIsIFwiI2Y1ZjVmNVwiLCBcIiNlZWVlZWVcIl07XHJcbiAgYmFja2dyb3VuZC5hZGRDb2xvclN0b3AoMCwgZ3JhZGllbnRQYXJ0c1swXSk7XHJcbiAgYmFja2dyb3VuZC5hZGRDb2xvclN0b3AoMC41MiwgZ3JhZGllbnRQYXJ0c1tNYXRoLm1pbigxLCBncmFkaWVudFBhcnRzLmxlbmd0aCAtIDEpXSk7XHJcbiAgYmFja2dyb3VuZC5hZGRDb2xvclN0b3AoMSwgZ3JhZGllbnRQYXJ0c1tNYXRoLm1pbigyLCBncmFkaWVudFBhcnRzLmxlbmd0aCAtIDEpXSB8fCBncmFkaWVudFBhcnRzW2dyYWRpZW50UGFydHMubGVuZ3RoIC0gMV0pO1xyXG4gIGN0eC5maWxsU3R5bGUgPSBiYWNrZ3JvdW5kO1xyXG4gIHJvdW5kUmVjdFBhdGgoY3R4LCAyNCwgMjQsIGNhbnZhcy53aWR0aCAtIDQ4LCBjYW52YXMuaGVpZ2h0IC0gNDgsIDM2KTtcclxuICBjdHguZmlsbCgpO1xyXG5cclxuICBjdHguc2F2ZSgpO1xyXG4gIGN0eC5nbG9iYWxBbHBoYSA9IHRoZW1lLmRhcmsgPyAwLjA4IDogMC4xODtcclxuICBjdHguZmlsbFN0eWxlID0gdGhlbWUuZGFyayA/IFwiI2ZmZmZmZlwiIDogdGhlbWUuZm9pbDtcclxuICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgY3R4LmFyYyhjYW52YXMud2lkdGggLSAxOTAsIDEyMCwgY2FyZE9yaWVudGF0aW9uID09PSBcInZlcnRpY2FsXCIgPyAxODAgOiAyNDAsIDAsIE1hdGguUEkgKiAyKTtcclxuICBjdHguZmlsbCgpO1xyXG4gIGN0eC5yZXN0b3JlKCk7XHJcblxyXG4gIGN0eC5zYXZlKCk7XHJcbiAgY3R4Lmdsb2JhbEFscGhhID0gdGhlbWUuZGFyayA/IDAuMDYgOiAwLjE7XHJcbiAgY3R4LmZpbGxTdHlsZSA9IHRoZW1lLmRhcmsgPyBcIiNmZmZmZmZcIiA6IHRoZW1lLmFjY2VudDtcclxuICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgY3R4LmFyYyhjYXJkT3JpZW50YXRpb24gPT09IFwidmVydGljYWxcIiA/IDEyMCA6IDE2MCwgY2FudmFzLmhlaWdodCAtIDEyMCwgY2FyZE9yaWVudGF0aW9uID09PSBcInZlcnRpY2FsXCIgPyAxNTAgOiAxODAsIDAsIE1hdGguUEkgKiAyKTtcclxuICBjdHguZmlsbCgpO1xyXG4gIGN0eC5yZXN0b3JlKCk7XHJcblxyXG4gIGN0eC5zdHJva2VTdHlsZSA9IHRoZW1lLmJvcmRlcjtcclxuICBjdHgubGluZVdpZHRoID0gMjtcclxuICByb3VuZFJlY3RQYXRoKGN0eCwgMjQsIDI0LCBjYW52YXMud2lkdGggLSA0OCwgY2FudmFzLmhlaWdodCAtIDQ4LCAzNik7XHJcbiAgY3R4LnN0cm9rZSgpO1xyXG5cclxuICBpZiAodGhlbWUubGF5b3V0ID09PSBcInN0cmlwZVwiICYmIGNhcmRPcmllbnRhdGlvbiA9PT0gXCJob3Jpem9udGFsXCIpIHtcclxuICAgIGN0eC5maWxsU3R5bGUgPSB0aGVtZS5mb2lsO1xyXG4gICAgcm91bmRSZWN0UGF0aChjdHgsIDI0LCAyNCwgMTgsIGNhbnZhcy5oZWlnaHQgLSA0OCwgMTApO1xyXG4gICAgY3R4LmZpbGwoKTtcclxuICB9XHJcbiAgaWYgKHRoZW1lLmxheW91dCA9PT0gXCJ0b3BiYXJcIikge1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IHRoZW1lLmZvaWw7XHJcbiAgICByb3VuZFJlY3RQYXRoKGN0eCwgMjQsIDI0LCBjYW52YXMud2lkdGggLSA0OCwgMTQsIDEwKTtcclxuICAgIGN0eC5maWxsKCk7XHJcbiAgfVxyXG4gIGlmICh0aGVtZS5sYXlvdXQgPT09IFwiYm90dG9tbGluZVwiKSB7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gdGhlbWUuZm9pbDtcclxuICAgIHJvdW5kUmVjdFBhdGgoY3R4LCA3MiwgY2FudmFzLmhlaWdodCAtIDU2LCBjYW52YXMud2lkdGggLSAxNDQsIDYsIDQpO1xyXG4gICAgY3R4LmZpbGwoKTtcclxuICB9XHJcbiAgaWYgKHRoZW1lLmxheW91dCA9PT0gXCJiYW5kXCIgJiYgY2FyZE9yaWVudGF0aW9uID09PSBcImhvcml6b250YWxcIikge1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IHRoZW1lLnBhbmVsQmFja2dyb3VuZDtcclxuICAgIHJvdW5kUmVjdFBhdGgoY3R4LCA2NCwgMTM2LCBjYW52YXMud2lkdGggLSAxMjgsIDExMiwgMjQpO1xyXG4gICAgY3R4LmZpbGwoKTtcclxuICB9XHJcbiAgaWYgKHRoZW1lLmxheW91dCA9PT0gXCJyaWdodHBhbmVsXCIgJiYgY2FyZE9yaWVudGF0aW9uID09PSBcImhvcml6b250YWxcIikge1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9IHRoZW1lLnBhbmVsQmFja2dyb3VuZDtcclxuICAgIHJvdW5kUmVjdFBhdGgoY3R4LCA4NjAsIDQ4LCAyNjgsIGNhbnZhcy5oZWlnaHQgLSA5NiwgMjgpO1xyXG4gICAgY3R4LmZpbGwoKTtcclxuICB9XHJcbiAgaWYgKHRoZW1lLmxheW91dCA9PT0gXCJjb3JuZXJcIikge1xyXG4gICAgY3R4LnNhdmUoKTtcclxuICAgIGN0eC5nbG9iYWxBbHBoYSA9IDAuMTg7XHJcbiAgICBjdHguZmlsbFN0eWxlID0gdGhlbWUuZm9pbDtcclxuICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgIGN0eC5hcmMoY2FudmFzLndpZHRoIC0gMzAsIDIwLCAxMjAsIDAsIE1hdGguUEkgKiAyKTtcclxuICAgIGN0eC5maWxsKCk7XHJcbiAgICBjdHgucmVzdG9yZSgpO1xyXG4gIH1cclxuICBpZiAodGhlbWUubGF5b3V0ID09PSBcIm1pbmltYWwtZGFya1wiKSB7XHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBcInJnYmEoMjU1LDI1NSwyNTUsMC4xMilcIjtcclxuICAgIGN0eC5saW5lV2lkdGggPSAxO1xyXG4gICAgcm91bmRSZWN0UGF0aChjdHgsIDQ4LCA0OCwgY2FudmFzLndpZHRoIC0gOTYsIGNhbnZhcy5oZWlnaHQgLSA5NiwgMjgpO1xyXG4gICAgY3R4LnN0cm9rZSgpO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgaW5mb0xpbmVzID0gZ2V0Q2FyZEluZm9MaW5lcyhmb3JtKTtcclxuXHJcbiAgaWYgKGNhcmRPcmllbnRhdGlvbiA9PT0gXCJ2ZXJ0aWNhbFwiKSB7XHJcbiAgICBjb25zdCBjb250ZW50WCA9IDg0O1xyXG4gICAgbGV0IGN1cnNvclkgPSAxMTY7XHJcbiAgICBpZiAoU3RyaW5nKGZvcm0uY29tcGFueU5hbWUgfHwgXCJcIikudHJpbSgpKSB7XHJcbiAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGVtZS5hY2NlbnQ7XHJcbiAgICAgIGN0eC5mb250ID0gXCI4MDAgMjZweCBTZWdvZSBVSVwiO1xyXG4gICAgICBjdHguZmlsbFRleHQoU3RyaW5nKGZvcm0uY29tcGFueU5hbWUpLnRyaW0oKSwgY29udGVudFgsIGN1cnNvclkpO1xyXG4gICAgICBjdXJzb3JZICs9IDQ0O1xyXG4gICAgfVxyXG5cclxuICAgIGN0eC5maWxsU3R5bGUgPSB0aGVtZS50aXRsZTtcclxuICAgIGN0eC5mb250ID0gXCI5MDAgNzBweCBTZWdvZSBVSVwiO1xyXG4gICAgQXJyYXkuZnJvbShTdHJpbmcoZm9ybS5uYW1lIHx8IFwiXCIpLnRyaW0oKSB8fCBcIuydtOumhFwiKS5zbGljZSgwLCA0KS5mb3JFYWNoKChjaGFyLCBpbmRleCkgPT4ge1xyXG4gICAgICBjdHguZmlsbFRleHQoY2hhciwgY29udGVudFgsIGN1cnNvclkgKyBpbmRleCAqIDg0KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGxldCByaWdodENvbHVtblkgPSBjdXJzb3JZICsgMTAwO1xyXG4gICAgY29uc3QgcmlnaHRDb2x1bW5YID0gMjE0O1xyXG4gICAgaWYgKFN0cmluZyhmb3JtLmpvYlRpdGxlIHx8IFwiXCIpLnRyaW0oKSkge1xyXG4gICAgICBjdHguZmlsbFN0eWxlID0gdGhlbWUuYm9keTtcclxuICAgICAgY3R4LmZvbnQgPSBcIjcwMCAyOHB4IFNlZ29lIFVJXCI7XHJcbiAgICAgIHdyYXBDYW52YXNUZXh0KGN0eCwgU3RyaW5nKGZvcm0uam9iVGl0bGUpLnRyaW0oKSwgNDcwKS5zbGljZSgwLCAyKS5mb3JFYWNoKChsaW5lLCBpbmRleCkgPT4ge1xyXG4gICAgICAgIGN0eC5maWxsVGV4dChsaW5lLCByaWdodENvbHVtblgsIHJpZ2h0Q29sdW1uWSArIGluZGV4ICogMzgpO1xyXG4gICAgICB9KTtcclxuICAgICAgcmlnaHRDb2x1bW5ZICs9IDg4O1xyXG4gICAgfVxyXG4gICAgY3R4LmZvbnQgPSBcIjYwMCAyNHB4IFNlZ29lIFVJXCI7XHJcbiAgICBpbmZvTGluZXMuZm9yRWFjaCgobGluZSwgaW5kZXgpID0+IHtcclxuICAgICAgY3R4LmZpbGxUZXh0KGluZGV4ID09PSAwID8gYFQuICR7bGluZX1gIDogYE0uICR7bGluZX1gLCByaWdodENvbHVtblgsIHJpZ2h0Q29sdW1uWSArIGluZGV4ICogMzYpO1xyXG4gICAgfSk7XHJcbiAgICByaWdodENvbHVtblkgKz0gaW5mb0xpbmVzLmxlbmd0aCAqIDM2ICsgMjQ7XHJcbiAgICBpZiAoU3RyaW5nKGZvcm0uYWRkcmVzcyB8fCBcIlwiKS50cmltKCkpIHtcclxuICAgICAgY3R4LmZvbnQgPSBcIjUwMCAyMnB4IFNlZ29lIFVJXCI7XHJcbiAgICAgIHdyYXBDYW52YXNUZXh0KGN0eCwgU3RyaW5nKGZvcm0uYWRkcmVzcykudHJpbSgpLCA0NzApLnNsaWNlKDAsIDMpLmZvckVhY2goKGxpbmUsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgY3R4LmZpbGxUZXh0KGxpbmUsIHJpZ2h0Q29sdW1uWCwgcmlnaHRDb2x1bW5ZICsgaW5kZXggKiAzMik7XHJcbiAgICAgIH0pO1xyXG4gICAgICByaWdodENvbHVtblkgKz0gMTA0O1xyXG4gICAgfVxyXG4gICAgaWYgKGRpc3BsYXlXZWJzaXRlKSB7XHJcbiAgICAgIGN0eC5mb250ID0gXCI3MDAgMjRweCBTZWdvZSBVSVwiO1xyXG4gICAgICBjdHguZmlsbFRleHQoZGlzcGxheVdlYnNpdGUsIHJpZ2h0Q29sdW1uWCwgcmlnaHRDb2x1bW5ZKTtcclxuICAgICAgcmlnaHRDb2x1bW5ZICs9IDQyO1xyXG4gICAgfVxyXG4gICAgaWYgKFN0cmluZyhmb3JtLmludHJvIHx8IFwiXCIpLnRyaW0oKSkge1xyXG4gICAgICBjdHguZm9udCA9IFwiNTAwIDIycHggU2Vnb2UgVUlcIjtcclxuICAgICAgd3JhcENhbnZhc1RleHQoY3R4LCBTdHJpbmcoZm9ybS5pbnRybykudHJpbSgpLCA0NzApLnNsaWNlKDAsIDQpLmZvckVhY2goKGxpbmUsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgY3R4LmZpbGxUZXh0KGxpbmUsIHJpZ2h0Q29sdW1uWCwgcmlnaHRDb2x1bW5ZICsgaW5kZXggKiAzMCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICBsZXQgY3Vyc29yWSA9IDExMjtcclxuICAgIGlmIChTdHJpbmcoZm9ybS5jb21wYW55TmFtZSB8fCBcIlwiKS50cmltKCkpIHtcclxuICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoZW1lLmFjY2VudDtcclxuICAgICAgY3R4LmZvbnQgPSBcIjcwMCAyOHB4IFNlZ29lIFVJXCI7XHJcbiAgICAgIGN0eC5maWxsVGV4dChTdHJpbmcoZm9ybS5jb21wYW55TmFtZSkudHJpbSgpLCA3MiwgY3Vyc29yWSk7XHJcbiAgICAgIGN1cnNvclkgKz0gNDQ7XHJcbiAgICB9XHJcbiAgICBpZiAoU3RyaW5nKGZvcm0uam9iVGl0bGUgfHwgXCJcIikudHJpbSgpKSB7XHJcbiAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGVtZS5ib2R5O1xyXG4gICAgICBjdHguZm9udCA9IFwiNjAwIDIycHggU2Vnb2UgVUlcIjtcclxuICAgICAgY3R4LmZpbGxUZXh0KFN0cmluZyhmb3JtLmpvYlRpdGxlKS50cmltKCksIDcyLCBjdXJzb3JZKTtcclxuICAgICAgY3Vyc29yWSArPSA0ODtcclxuICAgIH1cclxuXHJcbiAgICBjdHguZmlsbFN0eWxlID0gdGhlbWUudGl0bGU7XHJcbiAgICBjdHguZm9udCA9IFwiOTAwIDgycHggU2Vnb2UgVUlcIjtcclxuICAgIGN0eC5maWxsVGV4dChTdHJpbmcoZm9ybS5uYW1lIHx8IFwiXCIpLnRyaW0oKSB8fCBcIuydtOumhFwiLCA3MiwgY3Vyc29yWSArIDE2KTtcclxuICAgIGN1cnNvclkgKz0gOTQ7XHJcblxyXG4gICAgaWYgKGluZm9MaW5lcy5sZW5ndGgpIHtcclxuICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoZW1lLmJvZHk7XHJcbiAgICAgIGN0eC5mb250ID0gXCI2MDAgMjhweCBTZWdvZSBVSVwiO1xyXG4gICAgICBjdHguZmlsbFRleHQoaW5mb0xpbmVzLmpvaW4oXCIgIMK3ICBcIiksIDcyLCBjdXJzb3JZKTtcclxuICAgICAgY3Vyc29yWSArPSA1NDtcclxuICAgIH1cclxuICAgIGlmIChTdHJpbmcoZm9ybS5hZGRyZXNzIHx8IFwiXCIpLnRyaW0oKSkge1xyXG4gICAgICBjdHguZmlsbFN0eWxlID0gdGhlbWUuYm9keTtcclxuICAgICAgY3R4LmZvbnQgPSBcIjUwMCAyNHB4IFNlZ29lIFVJXCI7XHJcbiAgICAgIHdyYXBDYW52YXNUZXh0KGN0eCwgU3RyaW5nKGZvcm0uYWRkcmVzcykudHJpbSgpLCA2NjApLnNsaWNlKDAsIDIpLmZvckVhY2goKGxpbmUsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgY3R4LmZpbGxUZXh0KGxpbmUsIDcyLCBjdXJzb3JZICsgaW5kZXggKiAzNCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBjdXJzb3JZICs9IDcyO1xyXG4gICAgfVxyXG4gICAgaWYgKGRpc3BsYXlXZWJzaXRlKSB7XHJcbiAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGVtZS5ib2R5O1xyXG4gICAgICBjdHguZm9udCA9IFwiNzAwIDI0cHggU2Vnb2UgVUlcIjtcclxuICAgICAgY3R4LmZpbGxUZXh0KGRpc3BsYXlXZWJzaXRlLCA3MiwgY3Vyc29yWSk7XHJcbiAgICAgIGN1cnNvclkgKz0gNDg7XHJcbiAgICB9XHJcbiAgICBpZiAoU3RyaW5nKGZvcm0uaW50cm8gfHwgXCJcIikudHJpbSgpKSB7XHJcbiAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGVtZS5ib2R5O1xyXG4gICAgICBjdHguZm9udCA9IFwiNTAwIDI2cHggU2Vnb2UgVUlcIjtcclxuICAgICAgd3JhcENhbnZhc1RleHQoY3R4LCBTdHJpbmcoZm9ybS5pbnRybykudHJpbSgpLCA2NjApLnNsaWNlKDAsIDQpLmZvckVhY2goKGxpbmUsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgY3R4LmZpbGxUZXh0KGxpbmUsIDcyLCBjdXJzb3JZICsgaW5kZXggKiAzOCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChzaG93U2lkZVBhbmVsKSB7XHJcbiAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGVtZS5wYW5lbEJhY2tncm91bmQ7XHJcbiAgICAgIHJvdW5kUmVjdFBhdGgoY3R4LCA4MzAsIDExNiwgMzAwLCA0ODgsIDMwKTtcclxuICAgICAgY3R4LmZpbGwoKTtcclxuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gdGhlbWUuYm9yZGVyO1xyXG4gICAgICBjdHgubGluZVdpZHRoID0gMTtcclxuICAgICAgcm91bmRSZWN0UGF0aChjdHgsIDgzMCwgMTE2LCAzMDAsIDQ4OCwgMzApO1xyXG4gICAgICBjdHguc3Ryb2tlKCk7XHJcblxyXG4gICAgICBsZXQgcGFuZWxZID0gMTkyO1xyXG4gICAgICBpZiAoU3RyaW5nKGZvcm0uY29tcGFueU5hbWUgfHwgXCJcIikudHJpbSgpKSB7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoZW1lLnRpdGxlO1xyXG4gICAgICAgIGN0eC5mb250ID0gXCI4MDAgMzRweCBTZWdvZSBVSVwiO1xyXG4gICAgICAgIHdyYXBDYW52YXNUZXh0KGN0eCwgU3RyaW5nKGZvcm0uY29tcGFueU5hbWUpLnRyaW0oKSwgMjMwKS5zbGljZSgwLCAzKS5mb3JFYWNoKChsaW5lLCBpbmRleCkgPT4ge1xyXG4gICAgICAgICAgY3R4LmZpbGxUZXh0KGxpbmUsIDg2NiwgcGFuZWxZICsgaW5kZXggKiAzOCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcGFuZWxZICs9IDEzNDtcclxuICAgICAgfVxyXG4gICAgICBpZiAoU3RyaW5nKGZvcm0uam9iVGl0bGUgfHwgXCJcIikudHJpbSgpKSB7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoZW1lLmJvZHk7XHJcbiAgICAgICAgY3R4LmZvbnQgPSBcIjcwMCAyNHB4IFNlZ29lIFVJXCI7XHJcbiAgICAgICAgd3JhcENhbnZhc1RleHQoY3R4LCBTdHJpbmcoZm9ybS5qb2JUaXRsZSkudHJpbSgpLCAyMzApLnNsaWNlKDAsIDIpLmZvckVhY2goKGxpbmUsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICBjdHguZmlsbFRleHQobGluZSwgODY2LCBwYW5lbFkgKyBpbmRleCAqIDMyKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBwYW5lbFkgKz0gOTI7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGRpc3BsYXlXZWJzaXRlKSB7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoZW1lLmJvZHk7XHJcbiAgICAgICAgY3R4LmZvbnQgPSBcIjcwMCAyMnB4IFNlZ29lIFVJXCI7XHJcbiAgICAgICAgd3JhcENhbnZhc1RleHQoY3R4LCBkaXNwbGF5V2Vic2l0ZSwgMjMwKS5zbGljZSgwLCAyKS5mb3JFYWNoKChsaW5lLCBpbmRleCkgPT4ge1xyXG4gICAgICAgICAgY3R4LmZpbGxUZXh0KGxpbmUsIDg2NiwgcGFuZWxZICsgaW5kZXggKiAyOCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBjYW52YXMudG9EYXRhVVJMKFwiaW1hZ2UvcG5nXCIpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBkb3dubG9hZEJ1c2luZXNzQ2FyZEltYWdlKGZvcm0sIHRoZW1lS2V5LCBvcmllbnRhdGlvbiA9IFwiaG9yaXpvbnRhbFwiLCBmYWxsYmFja1NsdWcgPSBcIlwiKSB7XHJcbiAgY29uc3QgZGF0YVVybCA9IGJ1aWxkQnVzaW5lc3NDYXJkSW1hZ2VEYXRhVXJsKGZvcm0sIHRoZW1lS2V5LCBvcmllbnRhdGlvbik7XHJcbiAgY29uc3QgYW5jaG9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XHJcbiAgYW5jaG9yLmhyZWYgPSBkYXRhVXJsO1xyXG4gIGFuY2hvci5kb3dubG9hZCA9IGAke2dldENhcmRGaWxlU3RlbShmb3JtLCBmYWxsYmFja1NsdWcpfS5wbmdgO1xyXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYW5jaG9yKTtcclxuICBhbmNob3IuY2xpY2soKTtcclxuICBhbmNob3IucmVtb3ZlKCk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHNoYXJlQnVzaW5lc3NDYXJkSW1hZ2UoZm9ybSwgdGhlbWVLZXksIG9yaWVudGF0aW9uID0gXCJob3Jpem9udGFsXCIsIGZhbGxiYWNrU2x1ZyA9IFwiXCIpIHtcclxuICBjb25zdCBkYXRhVXJsID0gYnVpbGRCdXNpbmVzc0NhcmRJbWFnZURhdGFVcmwoZm9ybSwgdGhlbWVLZXksIG9yaWVudGF0aW9uKTtcclxuICBjb25zdCBibG9iID0gYXdhaXQgKGF3YWl0IGZldGNoKGRhdGFVcmwpKS5ibG9iKCk7XHJcbiAgY29uc3QgZmlsZSA9IG5ldyBGaWxlKFtibG9iXSwgYCR7Z2V0Q2FyZEZpbGVTdGVtKGZvcm0sIGZhbGxiYWNrU2x1Zyl9LnBuZ2AsIHsgdHlwZTogXCJpbWFnZS9wbmdcIiB9KTtcclxuICBjb25zdCBzaGFyZVRleHQgPSBbZm9ybS5uYW1lLCBmb3JtLmNvbXBhbnlOYW1lLCBmb3JtLmpvYlRpdGxlXS5maWx0ZXIoKHZhbHVlKSA9PiBTdHJpbmcodmFsdWUgfHwgXCJcIikudHJpbSgpKS5qb2luKFwiXFxuXCIpO1xyXG4gIGlmIChuYXZpZ2F0b3Iuc2hhcmUpIHtcclxuICAgIGNvbnN0IGNhblNoYXJlRmlsZSA9IHR5cGVvZiBuYXZpZ2F0b3IuY2FuU2hhcmUgPT09IFwiZnVuY3Rpb25cIiA/IG5hdmlnYXRvci5jYW5TaGFyZSh7IGZpbGVzOiBbZmlsZV0gfSkgOiB0cnVlO1xyXG4gICAgaWYgKGNhblNoYXJlRmlsZSkge1xyXG4gICAgICBhd2FpdCBuYXZpZ2F0b3Iuc2hhcmUoeyB0aXRsZTogZm9ybS5uYW1lIHx8IFwi66qF7ZWoXCIsIHRleHQ6IHNoYXJlVGV4dCwgZmlsZXM6IFtmaWxlXSB9KTtcclxuICAgICAgcmV0dXJuIFwic2hhcmVkXCI7XHJcbiAgICB9XHJcbiAgICBhd2FpdCBuYXZpZ2F0b3Iuc2hhcmUoeyB0aXRsZTogZm9ybS5uYW1lIHx8IFwi66qF7ZWoXCIsIHRleHQ6IHNoYXJlVGV4dCB9KTtcclxuICAgIHJldHVybiBcInNoYXJlZFwiO1xyXG4gIH1cclxuICBpZiAobmF2aWdhdG9yLmNsaXBib2FyZD8ud3JpdGVUZXh0KSB7XHJcbiAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChzaGFyZVRleHQgfHwgZm9ybS5uYW1lIHx8IFwi66qF7ZWoXCIpO1xyXG4gICAgcmV0dXJuIFwiY29waWVkXCI7XHJcbiAgfVxyXG4gIHJldHVybiBcInVuc3VwcG9ydGVkXCI7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIEJ1c2luZXNzQ2FyZFN1cmZhY2UoeyBmb3JtLCB0aGVtZUtleSwgb3JpZW50YXRpb24gPSBcImhvcml6b250YWxcIiB9KSB7XHJcbiAgY29uc3QgdGhlbWUgPSBDQVJEX1RIRU1FX1BSRVNFVFNbcmVzb2x2ZUNhcmRUaGVtZUtleSh0aGVtZUtleSldIHx8IENBUkRfVEhFTUVfUFJFU0VUUy50ZWFsO1xyXG4gIGNvbnN0IGNhcmRPcmllbnRhdGlvbiA9IHJlc29sdmVDYXJkT3JpZW50YXRpb24ob3JpZW50YXRpb24gfHwgdGhlbWUub3JpZW50YXRpb24pO1xyXG4gIGNvbnN0IGRpc3BsYXlXZWJzaXRlID0gZ2V0Q2FyZERpc3BsYXlXZWJzaXRlKGZvcm0ud2Vic2l0ZSk7XHJcbiAgY29uc3QgaW5mb0xpbmVzID0gZ2V0Q2FyZEluZm9MaW5lcyhmb3JtKTtcclxuICBjb25zdCBzaG93U2lkZVBhbmVsID0gc2hvdWxkU2hvd0NhcmRTaWRlUGFuZWwoZm9ybSkgJiYgY2FyZE9yaWVudGF0aW9uID09PSBcImhvcml6b250YWxcIjtcclxuICBjb25zdCBsYXlvdXQgPSB0aGVtZS5sYXlvdXQgfHwgXCJzb2Z0XCI7XHJcblxyXG4gIHJldHVybiAoXHJcbiAgICA8ZGl2IHN0eWxlPXt7IGJvcmRlclJhZGl1czogMjgsIHBhZGRpbmc6IDIyLCBiYWNrZ3JvdW5kOiB0aGVtZS5wcmV2aWV3QmFja2dyb3VuZCwgY29sb3I6IHRoZW1lLnRpdGxlLCBib3JkZXI6IGAxcHggc29saWQgJHt0aGVtZS5ib3JkZXJ9YCwgYm94U2hhZG93OiBgMCAyMnB4IDQycHggJHt0aGVtZS5nbG93fWAsIHBvc2l0aW9uOiBcInJlbGF0aXZlXCIsIG92ZXJmbG93OiBcImhpZGRlblwiLCBtaW5IZWlnaHQ6IGNhcmRPcmllbnRhdGlvbiA9PT0gXCJ2ZXJ0aWNhbFwiID8gNDIwIDogMjgwIH19PlxyXG4gICAgICA8ZGl2IHN0eWxlPXt7IHBvc2l0aW9uOiBcImFic29sdXRlXCIsIGluc2V0OiAwLCBiYWNrZ3JvdW5kOiB0aGVtZS5kYXJrID8gXCJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCByZ2JhKDI1NSwyNTUsMjU1LDAuMDUpLCByZ2JhKDI1NSwyNTUsMjU1LDApIDQ4JSlcIiA6IFwibGluZWFyLWdyYWRpZW50KDEzNWRlZywgcmdiYSgyNTUsMjU1LDI1NSwwLjUyKSwgcmdiYSgyNTUsMjU1LDI1NSwwKSA0NCUpXCIsIHBvaW50ZXJFdmVudHM6IFwibm9uZVwiIH19IC8+XHJcbiAgICAgIDxkaXYgc3R5bGU9e3sgcG9zaXRpb246IFwiYWJzb2x1dGVcIiwgcmlnaHQ6IC04MCwgdG9wOiAtMTEwLCB3aWR0aDogMjYwLCBoZWlnaHQ6IDI2MCwgYm9yZGVyUmFkaXVzOiBcIjUwJVwiLCBiYWNrZ3JvdW5kOiBgcmFkaWFsLWdyYWRpZW50KGNpcmNsZSwgJHt0aGVtZS5mb2lsfTMzIDAlLCByZ2JhKDI1NSwyNTUsMjU1LDApIDcyJSlgLCBwb2ludGVyRXZlbnRzOiBcIm5vbmVcIiB9fSAvPlxyXG4gICAgICA8ZGl2IHN0eWxlPXt7IHBvc2l0aW9uOiBcImFic29sdXRlXCIsIGxlZnQ6IC00MCwgYm90dG9tOiAtOTAsIHdpZHRoOiAyMjAsIGhlaWdodDogMjIwLCBib3JkZXJSYWRpdXM6IFwiNTAlXCIsIGJhY2tncm91bmQ6IHRoZW1lLmRhcmsgPyBcInJhZGlhbC1ncmFkaWVudChjaXJjbGUsIHJnYmEoMjU1LDI1NSwyNTUsMC4wOCkgMCUsIHJnYmEoMjU1LDI1NSwyNTUsMCkgNzIlKVwiIDogXCJyYWRpYWwtZ3JhZGllbnQoY2lyY2xlLCByZ2JhKDI1NSwyNTUsMjU1LDAuMjYpIDAlLCByZ2JhKDI1NSwyNTUsMjU1LDApIDcyJSlcIiwgcG9pbnRlckV2ZW50czogXCJub25lXCIgfX0gLz5cclxuICAgICAge2xheW91dCA9PT0gXCJzdHJpcGVcIiAmJiBjYXJkT3JpZW50YXRpb24gPT09IFwiaG9yaXpvbnRhbFwiID8gPGRpdiBzdHlsZT17eyBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLCBsZWZ0OiAwLCB0b3A6IDAsIGJvdHRvbTogMCwgd2lkdGg6IDEwLCBiYWNrZ3JvdW5kOiB0aGVtZS5mb2lsIH19IC8+IDogbnVsbH1cclxuICAgICAge2xheW91dCA9PT0gXCJ0b3BiYXJcIiA/IDxkaXYgc3R5bGU9e3sgcG9zaXRpb246IFwiYWJzb2x1dGVcIiwgbGVmdDogMCwgdG9wOiAwLCByaWdodDogMCwgaGVpZ2h0OiAxMiwgYmFja2dyb3VuZDogdGhlbWUuZm9pbCB9fSAvPiA6IG51bGx9XHJcbiAgICAgIHtsYXlvdXQgPT09IFwiYm90dG9tbGluZVwiID8gPGRpdiBzdHlsZT17eyBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLCBsZWZ0OiAyNiwgcmlnaHQ6IDI2LCBib3R0b206IDE2LCBoZWlnaHQ6IDQsIGJvcmRlclJhZGl1czogOTk5LCBiYWNrZ3JvdW5kOiB0aGVtZS5mb2lsIH19IC8+IDogbnVsbH1cclxuICAgICAge2xheW91dCA9PT0gXCJiYW5kXCIgJiYgY2FyZE9yaWVudGF0aW9uID09PSBcImhvcml6b250YWxcIiA/IDxkaXYgc3R5bGU9e3sgcG9zaXRpb246IFwiYWJzb2x1dGVcIiwgbGVmdDogMTgsIHJpZ2h0OiAxOCwgdG9wOiA4NCwgaGVpZ2h0OiA1NiwgYm9yZGVyUmFkaXVzOiAxOCwgYmFja2dyb3VuZDogdGhlbWUucGFuZWxCYWNrZ3JvdW5kIH19IC8+IDogbnVsbH1cclxuICAgICAge2xheW91dCA9PT0gXCJjb3JuZXJcIiA/IDxkaXYgc3R5bGU9e3sgcG9zaXRpb246IFwiYWJzb2x1dGVcIiwgdG9wOiAtMjYsIHJpZ2h0OiAtMjQsIHdpZHRoOiAxMjAsIGhlaWdodDogMTIwLCBib3JkZXJSYWRpdXM6IFwiNTAlXCIsIGJhY2tncm91bmQ6IGAke3RoZW1lLmZvaWx9MzNgIH19IC8+IDogbnVsbH1cclxuICAgICAge2xheW91dCA9PT0gXCJtaW5pbWFsLWRhcmtcIiA/IDxkaXYgc3R5bGU9e3sgcG9zaXRpb246IFwiYWJzb2x1dGVcIiwgaW5zZXQ6IDE0LCBib3JkZXJSYWRpdXM6IDIwLCBib3JkZXI6IFwiMXB4IHNvbGlkIHJnYmEoMjU1LDI1NSwyNTUsMC4xKVwiIH19IC8+IDogbnVsbH1cclxuICAgICAge2NhcmRPcmllbnRhdGlvbiA9PT0gXCJ2ZXJ0aWNhbFwiID8gKFxyXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgcG9zaXRpb246IFwicmVsYXRpdmVcIiwgZGlzcGxheTogXCJncmlkXCIsIGdyaWRUZW1wbGF0ZUNvbHVtbnM6IFwiOTJweCBtaW5tYXgoMCwgMWZyKVwiLCBnYXA6IDE4LCBhbGlnbkl0ZW1zOiBcInN0YXJ0XCIsIG1pbkhlaWdodDogMzYwIH19PlxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBtaW5XaWR0aDogMCwgZGlzcGxheTogXCJncmlkXCIsIGdhcDogMTAgfX0+XHJcbiAgICAgICAgICAgIHtTdHJpbmcoZm9ybS5jb21wYW55TmFtZSB8fCBcIlwiKS50cmltKCkgPyA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAxMywgZm9udFdlaWdodDogOTAwLCBsZXR0ZXJTcGFjaW5nOiBcIjAuMDhlbVwiLCBjb2xvcjogdGhlbWUuYWNjZW50LCB3b3JkQnJlYWs6IFwiYnJlYWstd29yZFwiIH19PntTdHJpbmcoZm9ybS5jb21wYW55TmFtZSkudHJpbSgpfTwvZGl2PiA6IG51bGx9XHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogXCJncmlkXCIsIGdhcDogMiB9fT5cclxuICAgICAgICAgICAgICB7QXJyYXkuZnJvbShTdHJpbmcoZm9ybS5uYW1lIHx8IFwiXCIpLnRyaW0oKSB8fCBcIuydtOumhFwiKS5zbGljZSgwLCA0KS5tYXAoKGNoYXIsIGluZGV4KSA9PiAoXHJcbiAgICAgICAgICAgICAgICA8ZGl2IGtleT17YCR7Y2hhcn0tJHtpbmRleH1gfSBzdHlsZT17eyBmb250U2l6ZTogNDIsIGZvbnRXZWlnaHQ6IDkwMCwgbGluZUhlaWdodDogMSwgbGV0dGVyU3BhY2luZzogXCItMC4wNGVtXCIsIGNvbG9yOiB0aGVtZS50aXRsZSB9fT57Y2hhcn08L2Rpdj5cclxuICAgICAgICAgICAgICApKX1cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWluV2lkdGg6IDAsIHBhZGRpbmdUb3A6IDg2IH19PlxyXG4gICAgICAgICAgICB7U3RyaW5nKGZvcm0uam9iVGl0bGUgfHwgXCJcIikudHJpbSgpID8gPGRpdiBzdHlsZT17eyBmb250U2l6ZTogMTYsIGZvbnRXZWlnaHQ6IDgwMCwgY29sb3I6IHRoZW1lLmJvZHksIG1hcmdpbkJvdHRvbTogMTgsIHdvcmRCcmVhazogXCJicmVhay13b3JkXCIgfX0+e1N0cmluZyhmb3JtLmpvYlRpdGxlKS50cmltKCl9PC9kaXY+IDogbnVsbH1cclxuICAgICAgICAgICAge2luZm9MaW5lcy5tYXAoKHZhbHVlLCBpbmRleCkgPT4gKFxyXG4gICAgICAgICAgICAgIDxkaXYga2V5PXtgJHt2YWx1ZX0tJHtpbmRleH1gfSBzdHlsZT17eyBtYXJnaW5Ub3A6IGluZGV4ID09PSAwID8gMCA6IDgsIGZvbnRTaXplOiAxNCwgZm9udFdlaWdodDogNzAwLCBjb2xvcjogdGhlbWUuYm9keSwgd29yZEJyZWFrOiBcImJyZWFrLXdvcmRcIiB9fT57aW5kZXggPT09IDAgPyBgVC4gJHt2YWx1ZX1gIDogYE0uICR7dmFsdWV9YH08L2Rpdj5cclxuICAgICAgICAgICAgKSl9XHJcbiAgICAgICAgICAgIHtTdHJpbmcoZm9ybS5hZGRyZXNzIHx8IFwiXCIpLnRyaW0oKSA/IDxkaXYgc3R5bGU9e3sgbWFyZ2luVG9wOiAxNiwgZm9udFNpemU6IDEzLCBsaW5lSGVpZ2h0OiAxLjYyLCBjb2xvcjogdGhlbWUuYm9keSwgd29yZEJyZWFrOiBcImJyZWFrLXdvcmRcIiB9fT57U3RyaW5nKGZvcm0uYWRkcmVzcykudHJpbSgpfTwvZGl2PiA6IG51bGx9XHJcbiAgICAgICAgICAgIHtkaXNwbGF5V2Vic2l0ZSA/IDxkaXYgc3R5bGU9e3sgbWFyZ2luVG9wOiAxNiwgZm9udFNpemU6IDE0LCBmb250V2VpZ2h0OiA5MDAsIGNvbG9yOiB0aGVtZS5ib2R5LCB3b3JkQnJlYWs6IFwiYnJlYWstd29yZFwiIH19PntkaXNwbGF5V2Vic2l0ZX08L2Rpdj4gOiBudWxsfVxyXG4gICAgICAgICAgICB7U3RyaW5nKGZvcm0uaW50cm8gfHwgXCJcIikudHJpbSgpID8gPGRpdiBzdHlsZT17eyBtYXJnaW5Ub3A6IDE2LCBmb250U2l6ZTogMTMsIGxpbmVIZWlnaHQ6IDEuNjIsIGNvbG9yOiB0aGVtZS5ib2R5LCB3b3JkQnJlYWs6IFwiYnJlYWstd29yZFwiIH19PntTdHJpbmcoZm9ybS5pbnRybykudHJpbSgpfTwvZGl2PiA6IG51bGx9XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgKSA6IChcclxuICAgICAgICA8ZGl2IHN0eWxlPXt7IHBvc2l0aW9uOiBcInJlbGF0aXZlXCIsIGRpc3BsYXk6IFwiZ3JpZFwiLCBncmlkVGVtcGxhdGVDb2x1bW5zOiBzaG93U2lkZVBhbmVsID8gXCJtaW5tYXgoMCwgMWZyKSAxOTBweFwiIDogXCIxZnJcIiwgZ2FwOiAxNiwgYWxpZ25JdGVtczogXCJzdHJldGNoXCIgfX0+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1pbldpZHRoOiAwIH19PlxyXG4gICAgICAgICAgICB7U3RyaW5nKGZvcm0uY29tcGFueU5hbWUgfHwgXCJcIikudHJpbSgpID8gPGRpdiBzdHlsZT17eyBmb250U2l6ZTogMTQsIGZvbnRXZWlnaHQ6IDkwMCwgbGV0dGVyU3BhY2luZzogXCIwLjEyZW1cIiwgY29sb3I6IHRoZW1lLmFjY2VudCwgbWFyZ2luQm90dG9tOiA4LCB3b3JkQnJlYWs6IFwiYnJlYWstd29yZFwiIH19PntTdHJpbmcoZm9ybS5jb21wYW55TmFtZSkudHJpbSgpfTwvZGl2PiA6IG51bGx9XHJcbiAgICAgICAgICAgIHtTdHJpbmcoZm9ybS5qb2JUaXRsZSB8fCBcIlwiKS50cmltKCkgPyA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAxMywgZm9udFdlaWdodDogNzAwLCBjb2xvcjogdGhlbWUuYm9keSwgbWFyZ2luQm90dG9tOiAxMCwgd29yZEJyZWFrOiBcImJyZWFrLXdvcmRcIiB9fT57U3RyaW5nKGZvcm0uam9iVGl0bGUpLnRyaW0oKX08L2Rpdj4gOiBudWxsfVxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAzNCwgZm9udFdlaWdodDogOTAwLCBsaW5lSGVpZ2h0OiAxLjA0LCBsZXR0ZXJTcGFjaW5nOiBcIi0wLjA1ZW1cIiwgY29sb3I6IHRoZW1lLnRpdGxlLCB3b3JkQnJlYWs6IFwiYnJlYWstd29yZFwiIH19PntTdHJpbmcoZm9ybS5uYW1lIHx8IFwiXCIpLnRyaW0oKSB8fCBcIuydtOumhFwifTwvZGl2PlxyXG4gICAgICAgICAgICB7aW5mb0xpbmVzLm1hcCgodmFsdWUsIGluZGV4KSA9PiAoXHJcbiAgICAgICAgICAgICAgPGRpdiBrZXk9e2Ake3ZhbHVlfS0ke2luZGV4fWB9IHN0eWxlPXt7IG1hcmdpblRvcDogaW5kZXggPT09IDAgPyAxMiA6IDYsIGZvbnRTaXplOiAxNCwgZm9udFdlaWdodDogNzAwLCBjb2xvcjogdGhlbWUuYm9keSwgd29yZEJyZWFrOiBcImJyZWFrLXdvcmRcIiB9fT57dmFsdWV9PC9kaXY+XHJcbiAgICAgICAgICAgICkpfVxyXG4gICAgICAgICAgICB7U3RyaW5nKGZvcm0uYWRkcmVzcyB8fCBcIlwiKS50cmltKCkgPyA8ZGl2IHN0eWxlPXt7IG1hcmdpblRvcDogMTQsIGZvbnRTaXplOiAxMywgbGluZUhlaWdodDogMS41OCwgY29sb3I6IHRoZW1lLmJvZHksIHdvcmRCcmVhazogXCJicmVhay13b3JkXCIgfX0+e1N0cmluZyhmb3JtLmFkZHJlc3MpLnRyaW0oKX08L2Rpdj4gOiBudWxsfVxyXG4gICAgICAgICAgICB7ZGlzcGxheVdlYnNpdGUgPyA8ZGl2IHN0eWxlPXt7IG1hcmdpblRvcDogMTIsIGZvbnRTaXplOiAxMywgZm9udFdlaWdodDogODAwLCBjb2xvcjogdGhlbWUuYm9keSwgd29yZEJyZWFrOiBcImJyZWFrLXdvcmRcIiB9fT57ZGlzcGxheVdlYnNpdGV9PC9kaXY+IDogbnVsbH1cclxuICAgICAgICAgICAge1N0cmluZyhmb3JtLmludHJvIHx8IFwiXCIpLnRyaW0oKSA/IDxkaXYgc3R5bGU9e3sgbWFyZ2luVG9wOiAxNiwgZm9udFNpemU6IDE0LCBsaW5lSGVpZ2h0OiAxLjY0LCBjb2xvcjogdGhlbWUuYm9keSwgd29yZEJyZWFrOiBcImJyZWFrLXdvcmRcIiB9fT57U3RyaW5nKGZvcm0uaW50cm8pLnRyaW0oKX08L2Rpdj4gOiBudWxsfVxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICB7c2hvd1NpZGVQYW5lbCA/IChcclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBhbGlnblNlbGY6IFwic3RyZXRjaFwiLCBib3JkZXJSYWRpdXM6IDI0LCBwYWRkaW5nOiAxNiwgYmFja2dyb3VuZDogdGhlbWUucGFuZWxCYWNrZ3JvdW5kLCBib3JkZXI6IGAxcHggc29saWQgJHt0aGVtZS5ib3JkZXJ9YCwgZGlzcGxheTogXCJmbGV4XCIsIGZsZXhEaXJlY3Rpb246IFwiY29sdW1uXCIsIGp1c3RpZnlDb250ZW50OiBcImNlbnRlclwiLCBnYXA6IDEwLCBtaW5XaWR0aDogMCB9fT5cclxuICAgICAgICAgICAgICB7U3RyaW5nKGZvcm0uY29tcGFueU5hbWUgfHwgXCJcIikudHJpbSgpID8gPGRpdiBzdHlsZT17eyBmb250U2l6ZTogMTgsIGZvbnRXZWlnaHQ6IDkwMCwgbGluZUhlaWdodDogMS4yNSwgY29sb3I6IHRoZW1lLnRpdGxlLCB3b3JkQnJlYWs6IFwiYnJlYWstd29yZFwiIH19PntTdHJpbmcoZm9ybS5jb21wYW55TmFtZSkudHJpbSgpfTwvZGl2PiA6IG51bGx9XHJcbiAgICAgICAgICAgICAge1N0cmluZyhmb3JtLmpvYlRpdGxlIHx8IFwiXCIpLnRyaW0oKSA/IDxkaXYgc3R5bGU9e3sgZm9udFNpemU6IDEzLCBmb250V2VpZ2h0OiA3MDAsIGxpbmVIZWlnaHQ6IDEuNSwgY29sb3I6IHRoZW1lLmJvZHksIHdvcmRCcmVhazogXCJicmVhay13b3JkXCIgfX0+e1N0cmluZyhmb3JtLmpvYlRpdGxlKS50cmltKCl9PC9kaXY+IDogbnVsbH1cclxuICAgICAgICAgICAgICB7ZGlzcGxheVdlYnNpdGUgPyA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAxMiwgZm9udFdlaWdodDogODAwLCBsaW5lSGVpZ2h0OiAxLjUsIGNvbG9yOiB0aGVtZS5ib2R5LCB3b3JkQnJlYWs6IFwiYnJlYWstd29yZFwiIH19PntkaXNwbGF5V2Vic2l0ZX08L2Rpdj4gOiBudWxsfVxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICkgOiBudWxsfVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICApfVxyXG4gICAgPC9kaXY+XHJcbiAgKTtcclxufVxyXG5cclxuZnVuY3Rpb24gQnVzaW5lc3NDYXJkVGhlbWVUaHVtYm5haWwoeyB0aGVtZSwgYWN0aXZlIH0pIHtcclxuICBjb25zdCBpc1ZlcnRpY2FsID0gcmVzb2x2ZUNhcmRPcmllbnRhdGlvbih0aGVtZS5vcmllbnRhdGlvbikgPT09IFwidmVydGljYWxcIjtcclxuICByZXR1cm4gKFxyXG4gICAgPGRpdiBzdHlsZT17eyBib3JkZXI6IGFjdGl2ZSA/IGAycHggc29saWQgJHt0aGVtZS5hY2NlbnR9YCA6IFwiMXB4IHNvbGlkIHJnYmEoMTQ4LDE2MywxODQsMC4xOClcIiwgYmFja2dyb3VuZDogXCJyZ2JhKDI1NSwyNTUsMjU1LDAuNzgpXCIsIGJvcmRlclJhZGl1czogMTgsIHBhZGRpbmc6IDgsIGJveFNoYWRvdzogYWN0aXZlID8gYDAgMTBweCAyMHB4ICR7dGhlbWUuZ2xvd31gIDogXCJub25lXCIgfX0+XHJcbiAgICAgIDxkaXYgc3R5bGU9e3sgcG9zaXRpb246IFwicmVsYXRpdmVcIiwgaGVpZ2h0OiBpc1ZlcnRpY2FsID8gMTIwIDogNzIsIGJvcmRlclJhZGl1czogMTQsIG92ZXJmbG93OiBcImhpZGRlblwiLCBiYWNrZ3JvdW5kOiB0aGVtZS5wcmV2aWV3QmFja2dyb3VuZCwgYm9yZGVyOiBgMXB4IHNvbGlkICR7dGhlbWUuYm9yZGVyfWAgfX0+XHJcbiAgICAgICAge3RoZW1lLmxheW91dCA9PT0gXCJzdHJpcGVcIiAmJiAhaXNWZXJ0aWNhbCA/IDxkaXYgc3R5bGU9e3sgcG9zaXRpb246IFwiYWJzb2x1dGVcIiwgbGVmdDogMCwgdG9wOiAwLCBib3R0b206IDAsIHdpZHRoOiA2LCBiYWNrZ3JvdW5kOiB0aGVtZS5mb2lsIH19IC8+IDogbnVsbH1cclxuICAgICAgICB7dGhlbWUubGF5b3V0ID09PSBcInRvcGJhclwiID8gPGRpdiBzdHlsZT17eyBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLCBsZWZ0OiAwLCByaWdodDogMCwgdG9wOiAwLCBoZWlnaHQ6IDgsIGJhY2tncm91bmQ6IHRoZW1lLmZvaWwgfX0gLz4gOiBudWxsfVxyXG4gICAgICAgIHt0aGVtZS5sYXlvdXQgPT09IFwiYm90dG9tbGluZVwiID8gPGRpdiBzdHlsZT17eyBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLCBsZWZ0OiA4LCByaWdodDogOCwgYm90dG9tOiA4LCBoZWlnaHQ6IDMsIGJvcmRlclJhZGl1czogOTk5LCBiYWNrZ3JvdW5kOiB0aGVtZS5mb2lsIH19IC8+IDogbnVsbH1cclxuICAgICAgICB7dGhlbWUubGF5b3V0ID09PSBcInJpZ2h0cGFuZWxcIiAmJiAhaXNWZXJ0aWNhbCA/IDxkaXYgc3R5bGU9e3sgcG9zaXRpb246IFwiYWJzb2x1dGVcIiwgdG9wOiAwLCByaWdodDogMCwgYm90dG9tOiAwLCB3aWR0aDogMjYsIGJhY2tncm91bmQ6IHRoZW1lLnBhbmVsQmFja2dyb3VuZCB9fSAvPiA6IG51bGx9XHJcbiAgICAgICAgPGRpdiBzdHlsZT17eyBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLCBpbnNldDogMCwgcGFkZGluZzogaXNWZXJ0aWNhbCA/IDggOiAxMCwgZGlzcGxheTogXCJmbGV4XCIsIGZsZXhEaXJlY3Rpb246IGlzVmVydGljYWwgPyBcInJvd1wiIDogXCJjb2x1bW5cIiwganVzdGlmeUNvbnRlbnQ6IGlzVmVydGljYWwgPyBcInNwYWNlLWJldHdlZW5cIiA6IFwic3BhY2UtYmV0d2VlblwiIH19PlxyXG4gICAgICAgICAge2lzVmVydGljYWwgPyAoXHJcbiAgICAgICAgICAgIDw+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiBcImdyaWRcIiwgZ2FwOiAyIH19PlxyXG4gICAgICAgICAgICAgICAge0FycmF5LmZyb20oXCLtmY3quLjrj5lcIikuc2xpY2UoMCwgMykubWFwKChjaGFyLCBpbmRleCkgPT4gKFxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGtleT17YCR7Y2hhcn0tJHtpbmRleH1gfSBzdHlsZT17eyBmb250U2l6ZTogMTYsIGZvbnRXZWlnaHQ6IDkwMCwgbGluZUhlaWdodDogMSwgY29sb3I6IHRoZW1lLnRpdGxlIH19PntjaGFyfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgKSl9XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiBcImZsZXhcIiwgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIiwganVzdGlmeUNvbnRlbnQ6IFwic3BhY2UtYmV0d2VlblwiLCBwYWRkaW5nVG9wOiA4IH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogOCwgZm9udFdlaWdodDogOTAwLCBsZXR0ZXJTcGFjaW5nOiBcIjAuMDhlbVwiLCBjb2xvcjogdGhlbWUuYWNjZW50IH19PlNNSTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogOCwgZm9udFdlaWdodDogNzAwLCBjb2xvcjogdGhlbWUuYm9keSB9fT7rjIDtkZzsnbTsgqw8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Ub3A6IDYsIGZvbnRTaXplOiA4LCBmb250V2VpZ2h0OiA3MDAsIGNvbG9yOiB0aGVtZS5ib2R5IH19PnNtaS5jZW88L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8Lz5cclxuICAgICAgICAgICkgOiAoXHJcbiAgICAgICAgICAgIDw+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogOCwgZm9udFdlaWdodDogOTAwLCBsZXR0ZXJTcGFjaW5nOiBcIjAuMDhlbVwiLCBjb2xvcjogdGhlbWUuYWNjZW50IH19PlNNSSBTSEFSRSBVTklUWTwvZGl2PlxyXG4gICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAxNiwgZm9udFdlaWdodDogOTAwLCBsaW5lSGVpZ2h0OiAxLCBjb2xvcjogdGhlbWUudGl0bGUgfX0+7ZmN6ri464+ZPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpblRvcDogNCwgZm9udFNpemU6IDgsIGZvbnRXZWlnaHQ6IDcwMCwgY29sb3I6IHRoZW1lLmJvZHkgfX0+64yA7ZGc7J207IKsPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvPlxyXG4gICAgICAgICAgKX1cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcbiAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luVG9wOiA2LCBkaXNwbGF5OiBcImZsZXhcIiwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiwganVzdGlmeUNvbnRlbnQ6IFwic3BhY2UtYmV0d2VlblwiLCBnYXA6IDYgfX0+XHJcbiAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogMTEsIGZvbnRXZWlnaHQ6IDgwMCwgY29sb3I6IFwiIzQ3NTU2OVwiIH19Pnt0aGVtZS5sYWJlbH08L2Rpdj5cclxuICAgICAgICB7YWN0aXZlID8gPGRpdiBzdHlsZT17eyBmb250U2l6ZTogMTEsIGZvbnRXZWlnaHQ6IDkwMCwgY29sb3I6IHRoZW1lLmFjY2VudCB9fT7shKDtg53rkKg8L2Rpdj4gOiBudWxsfVxyXG4gICAgICA8L2Rpdj5cclxuICAgIDwvZGl2PlxyXG4gICk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIENhcmRDcmVhdGVFeHBlcmllbmNlQnJpZGdlKCkge1xyXG4gIGNvbnN0IGxvY2F0aW9uID0gdXNlTG9jYXRpb24oKTtcclxuICBjb25zdCBvYnNlcnZlclJlZiA9IHVzZVJlZihudWxsKTtcclxuICBjb25zdCBoaWRkZW5Nb2RhbFJlZiA9IHVzZVJlZihudWxsKTtcclxuICBjb25zdCBvdmVybGF5UmVmID0gdXNlUmVmKG51bGwpO1xyXG4gIGNvbnN0IGhvc3RSZWYgPSB1c2VSZWYobnVsbCk7XHJcbiAgY29uc3QgW2hvc3ROb2RlLCBzZXRIb3N0Tm9kZV0gPSB1c2VTdGF0ZShudWxsKTtcclxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XHJcbiAgY29uc3QgW3NhdmluZywgc2V0U2F2aW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcclxuICBjb25zdCBbc2hhcmVMb2FkaW5nLCBzZXRTaGFyZUxvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xyXG4gIGNvbnN0IFtzZWxlY3RlZENhcmRUaGVtZSwgc2V0U2VsZWN0ZWRDYXJkVGhlbWVdID0gdXNlU3RhdGUoXCJ0ZWFsXCIpO1xyXG4gIGNvbnN0IFtzZWxlY3RlZENhcmRPcmllbnRhdGlvbiwgc2V0U2VsZWN0ZWRDYXJkT3JpZW50YXRpb25dID0gdXNlU3RhdGUoXCJob3Jpem9udGFsXCIpO1xyXG4gIGNvbnN0IFt0b2FzdCwgc2V0VG9hc3RdID0gdXNlU3RhdGUoXCJcIik7XHJcbiAgY29uc3QgW3NhdmVkU2x1Zywgc2V0U2F2ZWRTbHVnXSA9IHVzZVN0YXRlKFwiXCIpO1xyXG4gIGNvbnN0IFtpbml0aWFsU2x1Zywgc2V0SW5pdGlhbFNsdWddID0gdXNlU3RhdGUoXCJcIik7XHJcbiAgY29uc3QgW3ByZXNlcnZlZExpbmtzLCBzZXRQcmVzZXJ2ZWRMaW5rc10gPSB1c2VTdGF0ZShbXSk7XHJcbiAgY29uc3QgW2Zvcm0sIHNldEZvcm1dID0gdXNlU3RhdGUoYnVpbGRDYXJkRm9ybSgpKTtcclxuXHJcbiAgY29uc3QgY3VycmVudFVzZXIgPSBnZXRDdXJyZW50VXNlcigpO1xyXG4gIGNvbnN0IHNlc3Npb24gPSBnZXRTZXNzaW9uKCk7XHJcbiAgY29uc3QgbWVtYmVySWQgPSBTdHJpbmcoc2Vzc2lvbj8ubWVtYmVySWQgfHwgY3VycmVudFVzZXI/Lm1lbWJlcklkIHx8IGN1cnJlbnRVc2VyPy5pZCB8fCBcIlwiKS50cmltKCk7XHJcbiAgY29uc3QgZGVmYXVsdE5hbWUgPSBTdHJpbmcoY3VycmVudFVzZXI/Lm5hbWUgfHwgc2Vzc2lvbj8ubmFtZSB8fCBcIlwiKS50cmltKCk7XHJcbiAgY29uc3QgZGVmYXVsdFBob25lID0gU3RyaW5nKGN1cnJlbnRVc2VyPy5waG9uZSB8fCBzZXNzaW9uPy5waG9uZSB8fCBjdXJyZW50VXNlcj8ucGhvbmVOdW1iZXIgfHwgXCJcIikudHJpbSgpO1xyXG4gIGNvbnN0IHByZXZpZXdUaGVtZSA9IENBUkRfVEhFTUVfUFJFU0VUU1tzZWxlY3RlZENhcmRUaGVtZV0gfHwgQ0FSRF9USEVNRV9QUkVTRVRTLnRlYWw7XHJcbiAgY29uc3QgZGlzcGxheVdlYnNpdGUgPSBnZXRDYXJkRGlzcGxheVdlYnNpdGUoZm9ybS53ZWJzaXRlKTtcclxuICBjb25zdCB2aXNpYmxlVGhlbWVzID0gT2JqZWN0LnZhbHVlcyhDQVJEX1RIRU1FX1BSRVNFVFMpLmZpbHRlcigodGhlbWUpID0+IHJlc29sdmVDYXJkT3JpZW50YXRpb24odGhlbWUub3JpZW50YXRpb24pID09PSBzZWxlY3RlZENhcmRPcmllbnRhdGlvbik7XHJcblxyXG4gIGNvbnN0IGNsb3NlQnJpZGdlTW9kYWwgPSAoKSA9PiB7XHJcbiAgICBjb25zdCBvdmVybGF5ID0gb3ZlcmxheVJlZi5jdXJyZW50O1xyXG4gICAgaWYgKG92ZXJsYXkpIHtcclxuICAgICAgb3ZlcmxheS5kaXNwYXRjaEV2ZW50KG5ldyBNb3VzZUV2ZW50KFwiY2xpY2tcIiwgeyBidWJibGVzOiB0cnVlIH0pKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBjb25zdCBoeWRyYXRlRnJvbVNlcnZlciA9IGFzeW5jICgpID0+IHtcclxuICAgIGlmICghbWVtYmVySWQpIHJldHVybjtcclxuICAgIHNldExvYWRpbmcodHJ1ZSk7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBleGlzdGluZyA9IGF3YWl0IHN0b3JhZ2VBZGFwdGVyLmZldGNoVXNlckNhcmQobWVtYmVySWQpLmNhdGNoKCgpID0+IG51bGwpO1xyXG4gICAgICBjb25zdCByZXNvbHZlZCA9IHJlYWRDYXJkRmllbGRzRnJvbVJlY29yZChleGlzdGluZywgeyBkZWZhdWx0TmFtZSwgZGVmYXVsdFBob25lIH0pO1xyXG4gICAgICBjb25zdCBuZXh0U2x1ZyA9IHJlc29sdmVkLnNsdWcgfHwgKGF3YWl0IGVuc3VyZUNhcmRTbHVnKG1lbWJlcklkLCBleGlzdGluZz8uY2FyZFNsdWcgfHwgcmVzb2x2ZWQuZm9ybS5uYW1lIHx8IGRlZmF1bHROYW1lIHx8IG1lbWJlcklkKSk7XHJcbiAgICAgIHNldFByZXNlcnZlZExpbmtzKHJlc29sdmVkLnByZXNlcnZlZExpbmtzKTtcclxuICAgICAgc2V0Rm9ybShyZXNvbHZlZC5mb3JtKTtcclxuICAgICAgc2V0SW5pdGlhbFNsdWcobmV4dFNsdWcpO1xyXG4gICAgICBzZXRTYXZlZFNsdWcocmVzb2x2ZWQuc2x1ZyB8fCBcIlwiKTtcclxuICAgICAgc2V0U2VsZWN0ZWRDYXJkVGhlbWUocmVzb2x2ZWQudGhlbWVLZXkpO1xyXG4gICAgICBzZXRTZWxlY3RlZENhcmRPcmllbnRhdGlvbihyZXNvbHZlZC5vcmllbnRhdGlvbik7XHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgaWYgKCF0b2FzdCkgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIGNvbnN0IHRpbWVyID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4gc2V0VG9hc3QoXCJcIiksIDIyMDApO1xyXG4gICAgcmV0dXJuICgpID0+IHdpbmRvdy5jbGVhclRpbWVvdXQodGltZXIpO1xyXG4gIH0sIFt0b2FzdF0pO1xyXG5cclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgaWYgKGxvY2F0aW9uLnBhdGhuYW1lICE9PSBcIi9teVwiKSB7XHJcbiAgICAgIGlmIChvYnNlcnZlclJlZi5jdXJyZW50KSB7XHJcbiAgICAgICAgb2JzZXJ2ZXJSZWYuY3VycmVudC5kaXNjb25uZWN0KCk7XHJcbiAgICAgICAgb2JzZXJ2ZXJSZWYuY3VycmVudCA9IG51bGw7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGhpZGRlbk1vZGFsUmVmLmN1cnJlbnQpIHtcclxuICAgICAgICBoaWRkZW5Nb2RhbFJlZi5jdXJyZW50LnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xyXG4gICAgICAgIGhpZGRlbk1vZGFsUmVmLmN1cnJlbnQgPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChob3N0UmVmLmN1cnJlbnQ/LnBhcmVudEVsZW1lbnQpIHtcclxuICAgICAgICBob3N0UmVmLmN1cnJlbnQucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChob3N0UmVmLmN1cnJlbnQpO1xyXG4gICAgICB9XHJcbiAgICAgIGhvc3RSZWYuY3VycmVudCA9IG51bGw7XHJcbiAgICAgIG92ZXJsYXlSZWYuY3VycmVudCA9IG51bGw7XHJcbiAgICAgIHNldEhvc3ROb2RlKG51bGwpO1xyXG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGZpbmRGaXhlZEFuY2VzdG9yID0gKG5vZGUpID0+IHtcclxuICAgICAgbGV0IGN1cnJlbnQgPSBub2RlO1xyXG4gICAgICB3aGlsZSAoY3VycmVudCAmJiBjdXJyZW50ICE9PSBkb2N1bWVudC5ib2R5KSB7XHJcbiAgICAgICAgaWYgKGN1cnJlbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xyXG4gICAgICAgICAgY29uc3Qgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShjdXJyZW50KTtcclxuICAgICAgICAgIGlmIChzdHlsZS5wb3NpdGlvbiA9PT0gXCJmaXhlZFwiKSByZXR1cm4gY3VycmVudDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY3VycmVudCA9IGN1cnJlbnQucGFyZW50RWxlbWVudDtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgZW5zdXJlTW9kYWxCcmlkZ2UgPSAoKSA9PiB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgaWYgKHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oXCJzdTpvcGVuLWNhcmQtZWRpdG9yXCIpID09PSBcIjFcIikge1xyXG4gICAgICAgICAgY29uc3QgYnV0dG9ucyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcImJ1dHRvblwiKSk7XHJcbiAgICAgICAgICBjb25zdCBjcmVhdGVCdXR0b24gPSBidXR0b25zLmZpbmQoKGJ1dHRvbikgPT4gU3RyaW5nKGJ1dHRvbi50ZXh0Q29udGVudCB8fCBcIlwiKS50cmltKCkgPT09IFwi66qF7ZWoIOunjOuTpOq4sFwiKTtcclxuICAgICAgICAgIGlmIChjcmVhdGVCdXR0b24pIHtcclxuICAgICAgICAgICAgc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbShcInN1Om9wZW4tY2FyZC1lZGl0b3JcIik7XHJcbiAgICAgICAgICAgIGNyZWF0ZUJ1dHRvbi5jbGljaygpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgbXlDYXJkQnV0dG9uID0gYnV0dG9ucy5maW5kKChidXR0b24pID0+IFN0cmluZyhidXR0b24udGV4dENvbnRlbnQgfHwgXCJcIikuaW5jbHVkZXMoXCLrgrQg66qF7ZWoXCIpKTtcclxuICAgICAgICAgICAgaWYgKG15Q2FyZEJ1dHRvbikgbXlDYXJkQnV0dG9uLmNsaWNrKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIChlcnJvcikge31cclxuXHJcbiAgICAgIGNvbnN0IHNsdWdJbnB1dCA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbcGxhY2Vob2xkZXI9XCJteS1uYW1lXCJdJykpWzBdO1xyXG4gICAgICBpZiAoIXNsdWdJbnB1dCkge1xyXG4gICAgICAgIGlmIChoaWRkZW5Nb2RhbFJlZi5jdXJyZW50KSB7XHJcbiAgICAgICAgICBoaWRkZW5Nb2RhbFJlZi5jdXJyZW50LnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xyXG4gICAgICAgICAgaGlkZGVuTW9kYWxSZWYuY3VycmVudCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChob3N0UmVmLmN1cnJlbnQ/LnBhcmVudEVsZW1lbnQpIHtcclxuICAgICAgICAgIGhvc3RSZWYuY3VycmVudC5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKGhvc3RSZWYuY3VycmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGhvc3RSZWYuY3VycmVudCA9IG51bGw7XHJcbiAgICAgICAgb3ZlcmxheVJlZi5jdXJyZW50ID0gbnVsbDtcclxuICAgICAgICBzZXRIb3N0Tm9kZShudWxsKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IG92ZXJsYXkgPSBmaW5kRml4ZWRBbmNlc3RvcihzbHVnSW5wdXQpO1xyXG4gICAgICBpZiAoIW92ZXJsYXkpIHJldHVybjtcclxuICAgICAgY29uc3Qgb3JpZ2luYWxNb2RhbCA9IEFycmF5LmZyb20ob3ZlcmxheS5jaGlsZHJlbikuZmluZCgoY2hpbGQpID0+IGNoaWxkIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgJiYgY2hpbGQucXVlcnlTZWxlY3Rvcj8uKCdpbnB1dFtwbGFjZWhvbGRlcj1cIm15LW5hbWVcIl0nKSk7XHJcbiAgICAgIGlmICghb3JpZ2luYWxNb2RhbCkgcmV0dXJuO1xyXG5cclxuICAgICAgb3ZlcmxheVJlZi5jdXJyZW50ID0gb3ZlcmxheTtcclxuICAgICAgaWYgKGhpZGRlbk1vZGFsUmVmLmN1cnJlbnQgJiYgaGlkZGVuTW9kYWxSZWYuY3VycmVudCAhPT0gb3JpZ2luYWxNb2RhbCkge1xyXG4gICAgICAgIGhpZGRlbk1vZGFsUmVmLmN1cnJlbnQuc3R5bGUuZGlzcGxheSA9IFwiXCI7XHJcbiAgICAgIH1cclxuICAgICAgaGlkZGVuTW9kYWxSZWYuY3VycmVudCA9IG9yaWdpbmFsTW9kYWw7XHJcbiAgICAgIG9yaWdpbmFsTW9kYWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG5cclxuICAgICAgbGV0IGhvc3QgPSBvdmVybGF5LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWNhcmQtY3JlYXRlLWJyaWRnZS1yb290PVwidHJ1ZVwiXScpO1xyXG4gICAgICBpZiAoIWhvc3QpIHtcclxuICAgICAgICBob3N0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICBob3N0LnNldEF0dHJpYnV0ZShcImRhdGEtY2FyZC1jcmVhdGUtYnJpZGdlLXJvb3RcIiwgXCJ0cnVlXCIpO1xyXG4gICAgICAgIG92ZXJsYXkuYXBwZW5kQ2hpbGQoaG9zdCk7XHJcbiAgICAgIH1cclxuICAgICAgaG9zdFJlZi5jdXJyZW50ID0gaG9zdDtcclxuICAgICAgc2V0SG9zdE5vZGUoKHByZXYpID0+IChwcmV2ID09PSBob3N0ID8gcHJldiA6IGhvc3QpKTtcclxuICAgIH07XHJcblxyXG4gICAgZW5zdXJlTW9kYWxCcmlkZ2UoKTtcclxuICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4gZW5zdXJlTW9kYWxCcmlkZ2UoKSk7XHJcbiAgICBvYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHsgY2hpbGRMaXN0OiB0cnVlLCBzdWJ0cmVlOiB0cnVlIH0pO1xyXG4gICAgb2JzZXJ2ZXJSZWYuY3VycmVudCA9IG9ic2VydmVyO1xyXG4gICAgcmV0dXJuICgpID0+IHtcclxuICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xyXG4gICAgICBvYnNlcnZlclJlZi5jdXJyZW50ID0gbnVsbDtcclxuICAgICAgaWYgKGhpZGRlbk1vZGFsUmVmLmN1cnJlbnQpIHtcclxuICAgICAgICBoaWRkZW5Nb2RhbFJlZi5jdXJyZW50LnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xyXG4gICAgICAgIGhpZGRlbk1vZGFsUmVmLmN1cnJlbnQgPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChob3N0UmVmLmN1cnJlbnQ/LnBhcmVudEVsZW1lbnQpIHtcclxuICAgICAgICBob3N0UmVmLmN1cnJlbnQucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChob3N0UmVmLmN1cnJlbnQpO1xyXG4gICAgICB9XHJcbiAgICAgIGhvc3RSZWYuY3VycmVudCA9IG51bGw7XHJcbiAgICAgIG92ZXJsYXlSZWYuY3VycmVudCA9IG51bGw7XHJcbiAgICB9O1xyXG4gIH0sIFtsb2NhdGlvbi5wYXRobmFtZV0pO1xyXG5cclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgaWYgKCFob3N0Tm9kZSB8fCBsb2NhdGlvbi5wYXRobmFtZSAhPT0gXCIvbXlcIikgcmV0dXJuO1xyXG4gICAgaHlkcmF0ZUZyb21TZXJ2ZXIoKTtcclxuICB9LCBbaG9zdE5vZGUsIGxvY2F0aW9uLnBhdGhuYW1lXSk7XHJcblxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBjb25zdCBhY3RpdmVUaGVtZSA9IENBUkRfVEhFTUVfUFJFU0VUU1tzZWxlY3RlZENhcmRUaGVtZV07XHJcbiAgICBpZiAoYWN0aXZlVGhlbWUgJiYgcmVzb2x2ZUNhcmRPcmllbnRhdGlvbihhY3RpdmVUaGVtZS5vcmllbnRhdGlvbikgPT09IHNlbGVjdGVkQ2FyZE9yaWVudGF0aW9uKSByZXR1cm47XHJcbiAgICBjb25zdCBmYWxsYmFja1RoZW1lID0gT2JqZWN0LnZhbHVlcyhDQVJEX1RIRU1FX1BSRVNFVFMpLmZpbmQoKHRoZW1lKSA9PiByZXNvbHZlQ2FyZE9yaWVudGF0aW9uKHRoZW1lLm9yaWVudGF0aW9uKSA9PT0gc2VsZWN0ZWRDYXJkT3JpZW50YXRpb24pO1xyXG4gICAgaWYgKGZhbGxiYWNrVGhlbWUpIHNldFNlbGVjdGVkQ2FyZFRoZW1lKGZhbGxiYWNrVGhlbWUua2V5KTtcclxuICB9LCBbc2VsZWN0ZWRDYXJkT3JpZW50YXRpb24sIHNlbGVjdGVkQ2FyZFRoZW1lXSk7XHJcblxyXG4gIGNvbnN0IHNldEZpZWxkVmFsdWUgPSAoa2V5LCB2YWx1ZSkgPT4ge1xyXG4gICAgc2V0Rm9ybSgocHJldikgPT4gKHsgLi4ucHJldiwgW2tleV06IHZhbHVlIH0pKTtcclxuICB9O1xyXG5cclxuICBjb25zdCBzYXZlUHJldmlld0ltYWdlID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgYXdhaXQgZG93bmxvYWRCdXNpbmVzc0NhcmRJbWFnZShmb3JtLCBzZWxlY3RlZENhcmRUaGVtZSwgc2VsZWN0ZWRDYXJkT3JpZW50YXRpb24sIHNhdmVkU2x1ZyB8fCBpbml0aWFsU2x1Zyk7XHJcbiAgICAgIHNldFRvYXN0KFwi7J2066+47KeA66W8IOyggOyepe2WiOyKteuLiOuLpC5cIik7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBzZXRUb2FzdChcIuydtOuvuOyngCDsoIDsnqXsl5Ag7Iuk7Yyo7ZaI7Iq164uI64ukLlwiKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBjb25zdCBzaGFyZVByZXZpZXdDYXJkID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgc2V0U2hhcmVMb2FkaW5nKHRydWUpO1xyXG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBzaGFyZUJ1c2luZXNzQ2FyZEltYWdlKGZvcm0sIHNlbGVjdGVkQ2FyZFRoZW1lLCBzZWxlY3RlZENhcmRPcmllbnRhdGlvbiwgc2F2ZWRTbHVnIHx8IGluaXRpYWxTbHVnKTtcclxuICAgICAgaWYgKHJlc3VsdCA9PT0gXCJzaGFyZWRcIikgc2V0VG9hc3QoXCLsubTthqEg7KCE7IahIOywveydhCDsl7Tsl4jsirXri4jri6QuXCIpO1xyXG4gICAgICBlbHNlIGlmIChyZXN1bHQgPT09IFwiY29waWVkXCIpIHNldFRvYXN0KFwi66qF7ZWoIOygleuztOulvCDrs7XsgqztlojsirXri4jri6QuXCIpO1xyXG4gICAgICBlbHNlIHNldFRvYXN0KFwi7J20IOq4sOq4sOyXkOyEnOuKlCDqs7XsnKDrpbwg7KeA7JuQ7ZWY7KeAIOyViuyKteuLiOuLpC5cIik7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBzZXRUb2FzdChcIuy5tO2GoSDsoITshqHsl5Ag7Iuk7Yyo7ZaI7Iq164uI64ukLlwiKTtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIHNldFNoYXJlTG9hZGluZyhmYWxzZSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgY29uc3Qgc2F2ZUNhcmRSZWNvcmQgPSBhc3luYyAoKSA9PiB7XHJcbiAgICBpZiAoIW1lbWJlcklkKSB7XHJcbiAgICAgIHNldFRvYXN0KFwi66Gc6re47J247J20IO2VhOyalO2VqeuLiOuLpC5cIik7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHRyeSB7XHJcbiAgICAgIHNldFNhdmluZyh0cnVlKTtcclxuICAgICAgY29uc3Qgc2x1ZyA9IGF3YWl0IGVuc3VyZUNhcmRTbHVnKG1lbWJlcklkLCBmb3JtLm5hbWUgfHwgZGVmYXVsdE5hbWUgfHwgbWVtYmVySWQsIGluaXRpYWxTbHVnIHx8IHNhdmVkU2x1Zyk7XHJcbiAgICAgIGF3YWl0IHN0b3JhZ2VBZGFwdGVyLnNhdmVDYXJkKG1lbWJlcklkLCBjcmVhdGVDYXJkUGF5bG9hZChmb3JtLCBzZWxlY3RlZENhcmRUaGVtZSwgc2VsZWN0ZWRDYXJkT3JpZW50YXRpb24sIHByZXNlcnZlZExpbmtzLCBzbHVnKSk7XHJcbiAgICAgIHNldFNhdmVkU2x1ZyhzbHVnKTtcclxuICAgICAgc2V0SW5pdGlhbFNsdWcoc2x1Zyk7XHJcbiAgICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudChcInN1OnNzb3Q6Y2hhbmdlZFwiLCB7IGRldGFpbDogeyB0eXBlOiBcImNhcmRcIiwgb3BlcmF0aW9uOiBcInNhdmVcIiwgZGF0YTogeyBjYXJkU2x1Zzogc2x1ZywgdGVtcGxhdGU6IHNlbGVjdGVkQ2FyZFRoZW1lLCBvcmllbnRhdGlvbjogc2VsZWN0ZWRDYXJkT3JpZW50YXRpb24gfSB9IH0pKTtcclxuICAgICAgc2V0VG9hc3QoXCLrqoXtlajsnYQg7KCA7J6l7ZaI7Iq164uI64ukLlwiKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHNldFRvYXN0KGVycm9yPy5tZXNzYWdlIHx8IFwi66qF7ZWoIOyggOyepeyXkCDsi6TtjKjtlojsirXri4jri6QuXCIpO1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgc2V0U2F2aW5nKGZhbHNlKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBpZiAobG9jYXRpb24ucGF0aG5hbWUgIT09IFwiL215XCIgfHwgIWhvc3ROb2RlKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgcmV0dXJuIGNyZWF0ZVBvcnRhbChcclxuICAgIDw+XHJcbiAgICAgIHt0b2FzdCA/IChcclxuICAgICAgICA8ZGl2IHN0eWxlPXt7IHBvc2l0aW9uOiBcImZpeGVkXCIsIHRvcDogMTgsIGxlZnQ6IFwiNTAlXCIsIHRyYW5zZm9ybTogXCJ0cmFuc2xhdGVYKC01MCUpXCIsIHpJbmRleDogMjAwMiwgbWluV2lkdGg6IDE4MCwgbWF4V2lkdGg6IFwiY2FsYygxMDB2dyAtIDM2cHgpXCIsIHBhZGRpbmc6IFwiMTJweCAxNnB4XCIsIGJvcmRlclJhZGl1czogMTQsIGJhY2tncm91bmQ6IFwicmdiYSg4LDE1LDI4LDAuOTYpXCIsIGNvbG9yOiBcIiNmOGZhZmNcIiwgYm94U2hhZG93OiBcIjAgMjBweCA0MHB4IHJnYmEoMCwwLDAsMC4yMilcIiwgYm9yZGVyOiBcIjFweCBzb2xpZCByZ2JhKDQ1LDIxMiwxOTEsMC4xOClcIiwgZm9udFNpemU6IDEzLCBmb250V2VpZ2h0OiA4MDAsIHRleHRBbGlnbjogXCJjZW50ZXJcIiB9fT57dG9hc3R9PC9kaXY+XHJcbiAgICAgICkgOiBudWxsfVxyXG4gICAgICA8ZGl2IG9uQ2xpY2s9eyhldmVudCkgPT4gZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCl9IHN0eWxlPXt7IHdpZHRoOiBcIm1pbig3NjBweCwgMTAwJSlcIiwgbWF4SGVpZ2h0OiBcIm1pbig5MnZoLCA4NjBweClcIiwgb3ZlcmZsb3dZOiBcImF1dG9cIiwgYm9yZGVyUmFkaXVzOiAyOCwgYmFja2dyb3VuZDogcHJldmlld1RoZW1lLnN1cmZhY2UsIGJveFNoYWRvdzogYDAgMzRweCA5MHB4IHJnYmEoMTUsMjMsNDIsMC4yOCksIDAgMTJweCAzMHB4ICR7cHJldmlld1RoZW1lLmdsb3d9YCwgYm9yZGVyOiBgMXB4IHNvbGlkICR7cHJldmlld1RoZW1lLmJvcmRlcn1gLCBwYWRkaW5nOiAxOCwgY29sb3I6IFwiIzBmMTcyYVwiIH19PlxyXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogXCJmbGV4XCIsIGp1c3RpZnlDb250ZW50OiBcInNwYWNlLWJldHdlZW5cIiwgYWxpZ25JdGVtczogXCJmbGV4LXN0YXJ0XCIsIGdhcDogMTIsIG1hcmdpbkJvdHRvbTogMTYgfX0+XHJcbiAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAyMywgZm9udFdlaWdodDogOTAwLCBsZXR0ZXJTcGFjaW5nOiBcIi0wLjAzZW1cIiwgY29sb3I6IFwiIzBmMTcyYVwiIH19Puuqhe2VqCDrp4zrk6TquLA8L2Rpdj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17Y2xvc2VCcmlkZ2VNb2RhbH0gc3R5bGU9e3sgd2lkdGg6IDQyLCBoZWlnaHQ6IDQyLCBib3JkZXJSYWRpdXM6IDk5OSwgYm9yZGVyOiBcIjFweCBzb2xpZCByZ2JhKDE1LDIzLDQyLDAuMDgpXCIsIGJhY2tncm91bmQ6IFwicmdiYSgyNTUsMjU1LDI1NSwwLjcyKVwiLCBjb2xvcjogXCIjNDc1NTY5XCIsIGZvbnRTaXplOiAyMiwgY3Vyc29yOiBcInBvaW50ZXJcIiwgbGluZUhlaWdodDogMSB9fT7DlzwvYnV0dG9uPlxyXG4gICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICB7bG9hZGluZyA/IChcclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogXCI0OHB4IDEycHhcIiwgdGV4dEFsaWduOiBcImNlbnRlclwiLCBjb2xvcjogXCIjNTI2MTZiXCIsIGZvbnRTaXplOiAxNCwgZm9udFdlaWdodDogNzAwIH19Puuqhe2VqCDsoJXrs7Trpbwg67aI65+s7Jik64qUIOykkeyeheuLiOuLpC4uLjwvZGl2PlxyXG4gICAgICAgICkgOiAoXHJcbiAgICAgICAgICA8PlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGJvcmRlclJhZGl1czogMjIsIGJhY2tncm91bmQ6IFwicmdiYSgyNTUsMjU1LDI1NSwwLjU2KVwiLCBib3JkZXI6IFwiMXB4IHNvbGlkIHJnYmEoMjU1LDI1NSwyNTUsMC44KVwiLCBwYWRkaW5nOiAxNCwgbWFyZ2luQm90dG9tOiAxNCwgYm94U2hhZG93OiBcImluc2V0IDAgMXB4IDAgcmdiYSgyNTUsMjU1LDI1NSwwLjY0KVwiIH19PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6IDE0LCBmb250V2VpZ2h0OiA5MDAsIGNvbG9yOiBcIiMwZjE3MmFcIiwgbWFyZ2luQm90dG9tOiA2IH19PuuUlOyekOyduCDshKDtg508L2Rpdj5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAxMiwgY29sb3I6IFwiIzY0NzQ4YlwiLCBsaW5lSGVpZ2h0OiAxLjU1LCBtYXJnaW5Cb3R0b206IDEwIH19PuuMgOq4sOyXhe2YlSDsooXsnbQg66qF7ZWoIOustOuTnOydmCAxMOyihSDthZztlIzrpr/snoXri4jri6QuIOq4iOyepSwg7J2A7IOJLCDtmZTsnbTtirgsIOudvOydtO2KuCDqt7jroIjsnbQg7KSR7Ius7Jy866GcIOq1rOyEse2WiOyKteuLiOuLpC48L2Rpdj5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6IFwiaW5saW5lLWZsZXhcIiwgZ2FwOiA4LCBwYWRkaW5nOiA2LCBib3JkZXJSYWRpdXM6IDk5OSwgYmFja2dyb3VuZDogXCJyZ2JhKDI0MSwyNDUsMjQ5LDAuOSlcIiwgYm9yZGVyOiBcIjFweCBzb2xpZCByZ2JhKDIwMywyMTMsMjI1LDAuOSlcIiwgbWFyZ2luQm90dG9tOiAxMiB9fT5cclxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHNldFNlbGVjdGVkQ2FyZE9yaWVudGF0aW9uKFwiaG9yaXpvbnRhbFwiKX0gc3R5bGU9e3sgbWluSGVpZ2h0OiAzNCwgcGFkZGluZzogXCIwIDE0cHhcIiwgYm9yZGVyUmFkaXVzOiA5OTksIGJvcmRlcjogXCJub25lXCIsIGJhY2tncm91bmQ6IHNlbGVjdGVkQ2FyZE9yaWVudGF0aW9uID09PSBcImhvcml6b250YWxcIiA/IFwibGluZWFyLWdyYWRpZW50KDkwZGVnLCMwZjc2NmUsIzE0YjhhNilcIiA6IFwidHJhbnNwYXJlbnRcIiwgY29sb3I6IHNlbGVjdGVkQ2FyZE9yaWVudGF0aW9uID09PSBcImhvcml6b250YWxcIiA/IFwiI2ZmZmZmZlwiIDogXCIjNDc1NTY5XCIsIGZvbnRTaXplOiAxMiwgZm9udFdlaWdodDogOTAwLCBjdXJzb3I6IFwicG9pbnRlclwiIH19PuqwgOuhnO2YlTwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0U2VsZWN0ZWRDYXJkT3JpZW50YXRpb24oXCJ2ZXJ0aWNhbFwiKX0gc3R5bGU9e3sgbWluSGVpZ2h0OiAzNCwgcGFkZGluZzogXCIwIDE0cHhcIiwgYm9yZGVyUmFkaXVzOiA5OTksIGJvcmRlcjogXCJub25lXCIsIGJhY2tncm91bmQ6IHNlbGVjdGVkQ2FyZE9yaWVudGF0aW9uID09PSBcInZlcnRpY2FsXCIgPyBcImxpbmVhci1ncmFkaWVudCg5MGRlZywjMGY3NjZlLCMxNGI4YTYpXCIgOiBcInRyYW5zcGFyZW50XCIsIGNvbG9yOiBzZWxlY3RlZENhcmRPcmllbnRhdGlvbiA9PT0gXCJ2ZXJ0aWNhbFwiID8gXCIjZmZmZmZmXCIgOiBcIiM0NzU1NjlcIiwgZm9udFNpemU6IDEyLCBmb250V2VpZ2h0OiA5MDAsIGN1cnNvcjogXCJwb2ludGVyXCIgfX0+7IS466Gc7ZiVPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiBcImdyaWRcIiwgZ3JpZFRlbXBsYXRlQ29sdW1uczogXCJyZXBlYXQoYXV0by1maXQsIG1pbm1heCgxMDhweCwgMWZyKSlcIiwgZ2FwOiAxMCB9fT5cclxuICAgICAgICAgICAgICAgIHt2aXNpYmxlVGhlbWVzLm1hcCgodGhlbWUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgY29uc3QgYWN0aXZlID0gdGhlbWUua2V5ID09PSBzZWxlY3RlZENhcmRUaGVtZTtcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGtleT17dGhlbWUua2V5fSB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0U2VsZWN0ZWRDYXJkVGhlbWUodGhlbWUua2V5KX0gc3R5bGU9e3sgYm9yZGVyOiBcIm5vbmVcIiwgYmFja2dyb3VuZDogXCJ0cmFuc3BhcmVudFwiLCBwYWRkaW5nOiAwLCBjdXJzb3I6IFwicG9pbnRlclwiLCB0ZXh0QWxpZ246IFwibGVmdFwiIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgPEJ1c2luZXNzQ2FyZFRoZW1lVGh1bWJuYWlsIHRoZW1lPXt0aGVtZX0gYWN0aXZlPXthY3RpdmV9IC8+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB9KX1cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGJvcmRlclJhZGl1czogMjQsIGJhY2tncm91bmQ6IFwicmdiYSgyNTUsMjU1LDI1NSwwLjUyKVwiLCBib3JkZXI6IFwiMXB4IHNvbGlkIHJnYmEoMjU1LDI1NSwyNTUsMC43OClcIiwgcGFkZGluZzogMTQsIG1hcmdpbkJvdHRvbTogMTQgfX0+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogMTQsIGZvbnRXZWlnaHQ6IDkwMCwgY29sb3I6IFwiIzBmMTcyYVwiLCBtYXJnaW5Cb3R0b206IDEwIH19PuuvuOumrOuztOq4sDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxCdXNpbmVzc0NhcmRTdXJmYWNlIGZvcm09e2Zvcm19IHRoZW1lS2V5PXtzZWxlY3RlZENhcmRUaGVtZX0gb3JpZW50YXRpb249e3NlbGVjdGVkQ2FyZE9yaWVudGF0aW9ufSAvPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgYm9yZGVyUmFkaXVzOiAyMiwgYmFja2dyb3VuZDogXCJyZ2JhKDI1NSwyNTUsMjU1LDAuNTYpXCIsIGJvcmRlcjogXCIxcHggc29saWQgcmdiYSgyNTUsMjU1LDI1NSwwLjgpXCIsIHBhZGRpbmc6IDE0LCBtYXJnaW5Cb3R0b206IDE0IH19PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6IDE0LCBmb250V2VpZ2h0OiA5MDAsIGNvbG9yOiBcIiMwZjE3MmFcIiwgbWFyZ2luQm90dG9tOiAxMiB9fT7soJXrs7Qg7J6F66ClPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiBcImdyaWRcIiwgZ3JpZFRlbXBsYXRlQ29sdW1uczogXCJyZXBlYXQoYXV0by1maXQsIG1pbm1heCgyMjBweCwgMWZyKSlcIiwgZ2FwOiAxMiB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxsYWJlbCBzdHlsZT17eyBkaXNwbGF5OiBcImJsb2NrXCIsIGZvbnRTaXplOiAxMiwgZm9udFdlaWdodDogODAwLCBjb2xvcjogXCIjNTI2MTZiXCIsIG1hcmdpbkJvdHRvbTogNiB9fT7tmozsgqzrqoU8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgICA8aW5wdXQgdmFsdWU9e2Zvcm0uY29tcGFueU5hbWV9IG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkVmFsdWUoXCJjb21wYW55TmFtZVwiLCBldmVudC50YXJnZXQudmFsdWUpfSBzdHlsZT17eyB3aWR0aDogXCIxMDAlXCIsIGJveFNpemluZzogXCJib3JkZXItYm94XCIsIG1pbkhlaWdodDogNDYsIGJvcmRlclJhZGl1czogMTQsIGJvcmRlcjogXCIxcHggc29saWQgcmdiYSgyMDMsMjEzLDIyNSwwLjk1KVwiLCBiYWNrZ3JvdW5kOiBcInJnYmEoMjU1LDI1NSwyNTUsMC44OClcIiwgY29sb3I6IFwiIzBmMTcyYVwiLCBwYWRkaW5nOiBcIjAgMTJweFwiLCBmb250U2l6ZTogMTQsIG91dGxpbmU6IFwibm9uZVwiIH19IC8+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxsYWJlbCBzdHlsZT17eyBkaXNwbGF5OiBcImJsb2NrXCIsIGZvbnRTaXplOiAxMiwgZm9udFdlaWdodDogODAwLCBjb2xvcjogXCIjNTI2MTZiXCIsIG1hcmdpbkJvdHRvbTogNiB9fT7sp4HssYU8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgICA8aW5wdXQgdmFsdWU9e2Zvcm0uam9iVGl0bGV9IG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkVmFsdWUoXCJqb2JUaXRsZVwiLCBldmVudC50YXJnZXQudmFsdWUpfSBzdHlsZT17eyB3aWR0aDogXCIxMDAlXCIsIGJveFNpemluZzogXCJib3JkZXItYm94XCIsIG1pbkhlaWdodDogNDYsIGJvcmRlclJhZGl1czogMTQsIGJvcmRlcjogXCIxcHggc29saWQgcmdiYSgyMDMsMjEzLDIyNSwwLjk1KVwiLCBiYWNrZ3JvdW5kOiBcInJnYmEoMjU1LDI1NSwyNTUsMC44OClcIiwgY29sb3I6IFwiIzBmMTcyYVwiLCBwYWRkaW5nOiBcIjAgMTJweFwiLCBmb250U2l6ZTogMTQsIG91dGxpbmU6IFwibm9uZVwiIH19IC8+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxsYWJlbCBzdHlsZT17eyBkaXNwbGF5OiBcImJsb2NrXCIsIGZvbnRTaXplOiAxMiwgZm9udFdlaWdodDogODAwLCBjb2xvcjogXCIjNTI2MTZiXCIsIG1hcmdpbkJvdHRvbTogNiB9fT7snbTrpoQ8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgICA8aW5wdXQgdmFsdWU9e2Zvcm0ubmFtZX0gb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGRWYWx1ZShcIm5hbWVcIiwgZXZlbnQudGFyZ2V0LnZhbHVlKX0gc3R5bGU9e3sgd2lkdGg6IFwiMTAwJVwiLCBib3hTaXppbmc6IFwiYm9yZGVyLWJveFwiLCBtaW5IZWlnaHQ6IDQ2LCBib3JkZXJSYWRpdXM6IDE0LCBib3JkZXI6IFwiMXB4IHNvbGlkIHJnYmEoMjAzLDIxMywyMjUsMC45NSlcIiwgYmFja2dyb3VuZDogXCJyZ2JhKDI1NSwyNTUsMjU1LDAuODgpXCIsIGNvbG9yOiBcIiMwZjE3MmFcIiwgcGFkZGluZzogXCIwIDEycHhcIiwgZm9udFNpemU6IDE0LCBvdXRsaW5lOiBcIm5vbmVcIiB9fSAvPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8bGFiZWwgc3R5bGU9e3sgZGlzcGxheTogXCJibG9ja1wiLCBmb250U2l6ZTogMTIsIGZvbnRXZWlnaHQ6IDgwMCwgY29sb3I6IFwiIzUyNjE2YlwiLCBtYXJnaW5Cb3R0b206IDYgfX0+7KCE7ZmU67KI7Zi4PC9sYWJlbD5cclxuICAgICAgICAgICAgICAgICAgPGlucHV0IHZhbHVlPXtmb3JtLnBob25lfSBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWVsZFZhbHVlKFwicGhvbmVcIiwgZXZlbnQudGFyZ2V0LnZhbHVlKX0gc3R5bGU9e3sgd2lkdGg6IFwiMTAwJVwiLCBib3hTaXppbmc6IFwiYm9yZGVyLWJveFwiLCBtaW5IZWlnaHQ6IDQ2LCBib3JkZXJSYWRpdXM6IDE0LCBib3JkZXI6IFwiMXB4IHNvbGlkIHJnYmEoMjAzLDIxMywyMjUsMC45NSlcIiwgYmFja2dyb3VuZDogXCJyZ2JhKDI1NSwyNTUsMjU1LDAuODgpXCIsIGNvbG9yOiBcIiMwZjE3MmFcIiwgcGFkZGluZzogXCIwIDEycHhcIiwgZm9udFNpemU6IDE0LCBvdXRsaW5lOiBcIm5vbmVcIiB9fSAvPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8bGFiZWwgc3R5bGU9e3sgZGlzcGxheTogXCJibG9ja1wiLCBmb250U2l6ZTogMTIsIGZvbnRXZWlnaHQ6IDgwMCwgY29sb3I6IFwiIzUyNjE2YlwiLCBtYXJnaW5Cb3R0b206IDYgfX0+7ZW465Oc7Y+wPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgICAgPGlucHV0IHZhbHVlPXtmb3JtLm1vYmlsZX0gb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGRWYWx1ZShcIm1vYmlsZVwiLCBldmVudC50YXJnZXQudmFsdWUpfSBzdHlsZT17eyB3aWR0aDogXCIxMDAlXCIsIGJveFNpemluZzogXCJib3JkZXItYm94XCIsIG1pbkhlaWdodDogNDYsIGJvcmRlclJhZGl1czogMTQsIGJvcmRlcjogXCIxcHggc29saWQgcmdiYSgyMDMsMjEzLDIyNSwwLjk1KVwiLCBiYWNrZ3JvdW5kOiBcInJnYmEoMjU1LDI1NSwyNTUsMC44OClcIiwgY29sb3I6IFwiIzBmMTcyYVwiLCBwYWRkaW5nOiBcIjAgMTJweFwiLCBmb250U2l6ZTogMTQsIG91dGxpbmU6IFwibm9uZVwiIH19IC8+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxsYWJlbCBzdHlsZT17eyBkaXNwbGF5OiBcImJsb2NrXCIsIGZvbnRTaXplOiAxMiwgZm9udFdlaWdodDogODAwLCBjb2xvcjogXCIjNTI2MTZiXCIsIG1hcmdpbkJvdHRvbTogNiB9fT7sgqzsnbTtirgg7KO87IaMPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgICAgPGlucHV0IHZhbHVlPXtmb3JtLndlYnNpdGV9IG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkVmFsdWUoXCJ3ZWJzaXRlXCIsIGV2ZW50LnRhcmdldC52YWx1ZSl9IHN0eWxlPXt7IHdpZHRoOiBcIjEwMCVcIiwgYm94U2l6aW5nOiBcImJvcmRlci1ib3hcIiwgbWluSGVpZ2h0OiA0NiwgYm9yZGVyUmFkaXVzOiAxNCwgYm9yZGVyOiBcIjFweCBzb2xpZCByZ2JhKDIwMywyMTMsMjI1LDAuOTUpXCIsIGJhY2tncm91bmQ6IFwicmdiYSgyNTUsMjU1LDI1NSwwLjg4KVwiLCBjb2xvcjogXCIjMGYxNzJhXCIsIHBhZGRpbmc6IFwiMCAxMnB4XCIsIGZvbnRTaXplOiAxNCwgb3V0bGluZTogXCJub25lXCIgfX0gLz5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luVG9wOiAxMiB9fT5cclxuICAgICAgICAgICAgICAgIDxsYWJlbCBzdHlsZT17eyBkaXNwbGF5OiBcImJsb2NrXCIsIGZvbnRTaXplOiAxMiwgZm9udFdlaWdodDogODAwLCBjb2xvcjogXCIjNTI2MTZiXCIsIG1hcmdpbkJvdHRvbTogNiB9fT7so7zshow8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgPGlucHV0IHZhbHVlPXtmb3JtLmFkZHJlc3N9IG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpZWxkVmFsdWUoXCJhZGRyZXNzXCIsIGV2ZW50LnRhcmdldC52YWx1ZSl9IHN0eWxlPXt7IHdpZHRoOiBcIjEwMCVcIiwgYm94U2l6aW5nOiBcImJvcmRlci1ib3hcIiwgbWluSGVpZ2h0OiA0NiwgYm9yZGVyUmFkaXVzOiAxNCwgYm9yZGVyOiBcIjFweCBzb2xpZCByZ2JhKDIwMywyMTMsMjI1LDAuOTUpXCIsIGJhY2tncm91bmQ6IFwicmdiYSgyNTUsMjU1LDI1NSwwLjg4KVwiLCBjb2xvcjogXCIjMGYxNzJhXCIsIHBhZGRpbmc6IFwiMCAxMnB4XCIsIGZvbnRTaXplOiAxNCwgb3V0bGluZTogXCJub25lXCIgfX0gLz5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpblRvcDogMTIgfX0+XHJcbiAgICAgICAgICAgICAgICA8bGFiZWwgc3R5bGU9e3sgZGlzcGxheTogXCJibG9ja1wiLCBmb250U2l6ZTogMTIsIGZvbnRXZWlnaHQ6IDgwMCwgY29sb3I6IFwiIzUyNjE2YlwiLCBtYXJnaW5Cb3R0b206IDYgfX0+7IaM6rCc6riAPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDx0ZXh0YXJlYSB2YWx1ZT17Zm9ybS5pbnRyb30gb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmllbGRWYWx1ZShcImludHJvXCIsIGV2ZW50LnRhcmdldC52YWx1ZSl9IHN0eWxlPXt7IHdpZHRoOiBcIjEwMCVcIiwgYm94U2l6aW5nOiBcImJvcmRlci1ib3hcIiwgbWluSGVpZ2h0OiA5MCwgcmVzaXplOiBcInZlcnRpY2FsXCIsIGJvcmRlclJhZGl1czogMTQsIGJvcmRlcjogXCIxcHggc29saWQgcmdiYSgyMDMsMjEzLDIyNSwwLjk1KVwiLCBiYWNrZ3JvdW5kOiBcInJnYmEoMjU1LDI1NSwyNTUsMC44OClcIiwgY29sb3I6IFwiIzBmMTcyYVwiLCBwYWRkaW5nOiBcIjEycHggMTRweFwiLCBmb250U2l6ZTogMTQsIG91dGxpbmU6IFwibm9uZVwiIH19IC8+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiBcImdyaWRcIiwgZ3JpZFRlbXBsYXRlQ29sdW1uczogXCJyZXBlYXQoMywgbWlubWF4KDAsIDFmcikpXCIsIGdhcDogMTAgfX0+XHJcbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17c2F2ZUNhcmRSZWNvcmR9IGRpc2FibGVkPXtzYXZpbmd9IHN0eWxlPXt7IG1pbkhlaWdodDogNTAsIGJvcmRlclJhZGl1czogMTYsIGJvcmRlcjogXCJub25lXCIsIGJhY2tncm91bmQ6IFwibGluZWFyLWdyYWRpZW50KDkwZGVnLCMwZjc2NmUsIzE0YjhhNilcIiwgY29sb3I6IFwiI2VmZmZmYlwiLCBmb250U2l6ZTogMTUsIGZvbnRXZWlnaHQ6IDkwMCwgY3Vyc29yOiBzYXZpbmcgPyBcImRlZmF1bHRcIiA6IFwicG9pbnRlclwiLCBvcGFjaXR5OiBzYXZpbmcgPyAwLjU1IDogMSB9fT7soIDsnqU8L2J1dHRvbj5cclxuICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXtzYXZlUHJldmlld0ltYWdlfSBzdHlsZT17eyBtaW5IZWlnaHQ6IDUwLCBib3JkZXJSYWRpdXM6IDE2LCBib3JkZXI6IFwiMXB4IHNvbGlkIHJnYmEoMTUsMTE4LDExMCwwLjE4KVwiLCBiYWNrZ3JvdW5kOiBcInJnYmEoMjU1LDI1NSwyNTUsMC44NilcIiwgY29sb3I6IFwiIzBmNzY2ZVwiLCBmb250U2l6ZTogMTUsIGZvbnRXZWlnaHQ6IDkwMCwgY3Vyc29yOiBcInBvaW50ZXJcIiB9fT7snbTrr7jsp4Ag7KCA7J6lPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17c2hhcmVQcmV2aWV3Q2FyZH0gZGlzYWJsZWQ9e3NoYXJlTG9hZGluZ30gc3R5bGU9e3sgbWluSGVpZ2h0OiA1MCwgYm9yZGVyUmFkaXVzOiAxNiwgYm9yZGVyOiBcIjFweCBzb2xpZCByZ2JhKDE1LDIzLDQyLDAuMDgpXCIsIGJhY2tncm91bmQ6IFwicmdiYSgyNTUsMjU1LDI1NSwwLjg2KVwiLCBjb2xvcjogXCIjMGYxNzJhXCIsIGZvbnRTaXplOiAxNSwgZm9udFdlaWdodDogOTAwLCBjdXJzb3I6IHNoYXJlTG9hZGluZyA/IFwiZGVmYXVsdFwiIDogXCJwb2ludGVyXCIsIG9wYWNpdHk6IHNoYXJlTG9hZGluZyA/IDAuNTUgOiAxIH19Puy5tO2GoSDsoITshqE8L2J1dHRvbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8Lz5cclxuICAgICAgICApfVxyXG4gICAgICA8L2Rpdj5cclxuICAgIDwvPixcclxuICAgIGhvc3ROb2RlXHJcbiAgKTtcclxufVxyXG5cclxuZnVuY3Rpb24gU2ltcGxlU2F2ZWRDYXJkUGFnZSgpIHtcclxuICBjb25zdCB7IHNsdWcgPSBcIlwiIH0gPSB1c2VQYXJhbXMoKTtcclxuICBjb25zdCBuYXZpZ2F0ZSA9IHVzZU5hdmlnYXRlKCk7XHJcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUodHJ1ZSk7XHJcbiAgY29uc3QgW2RlbGV0aW5nLCBzZXREZWxldGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XHJcbiAgY29uc3QgW3NoYXJpbmcsIHNldFNoYXJpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xyXG4gIGNvbnN0IFt0b2FzdCwgc2V0VG9hc3RdID0gdXNlU3RhdGUoXCJcIik7XHJcbiAgY29uc3QgW2NhcmRTdGF0ZSwgc2V0Q2FyZFN0YXRlXSA9IHVzZVN0YXRlKCgpID0+ICh7XHJcbiAgICBmb3JtOiBidWlsZENhcmRGb3JtKCksXHJcbiAgICB0aGVtZUtleTogXCJ0ZWFsXCIsXHJcbiAgICBvcmllbnRhdGlvbjogXCJob3Jpem9udGFsXCIsXHJcbiAgICBtZW1iZXJJZDogXCJcIixcclxuICAgIGNhcmRTbHVnOiBcIlwiLFxyXG4gICAgZXhpc3RzOiBmYWxzZSxcclxuICB9KSk7XHJcblxyXG4gIGNvbnN0IGN1cnJlbnRVc2VyID0gZ2V0Q3VycmVudFVzZXIoKTtcclxuICBjb25zdCBzZXNzaW9uID0gZ2V0U2Vzc2lvbigpO1xyXG4gIGNvbnN0IHZpZXdlck1lbWJlcklkID0gU3RyaW5nKHNlc3Npb24/Lm1lbWJlcklkIHx8IGN1cnJlbnRVc2VyPy5tZW1iZXJJZCB8fCBjdXJyZW50VXNlcj8uaWQgfHwgXCJcIikudHJpbSgpO1xyXG4gIGNvbnN0IGlzT3duZXIgPSAhIXZpZXdlck1lbWJlcklkICYmIFN0cmluZyhjYXJkU3RhdGUubWVtYmVySWQgfHwgXCJcIikgPT09IHZpZXdlck1lbWJlcklkO1xyXG5cclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgaWYgKCF0b2FzdCkgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIGNvbnN0IHRpbWVyID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4gc2V0VG9hc3QoXCJcIiksIDIyMDApO1xyXG4gICAgcmV0dXJuICgpID0+IHdpbmRvdy5jbGVhclRpbWVvdXQodGltZXIpO1xyXG4gIH0sIFt0b2FzdF0pO1xyXG5cclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgbGV0IGNhbmNlbGxlZCA9IGZhbHNlO1xyXG4gICAgY29uc3QgbG9hZENhcmQgPSBhc3luYyAoKSA9PiB7XHJcbiAgICAgIHNldExvYWRpbmcodHJ1ZSk7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgY2FyZCA9IGF3YWl0IHN0b3JhZ2VBZGFwdGVyLmZldGNoQ2FyZEJ5U2x1ZyhzbHVnKTtcclxuICAgICAgICBpZiAoY2FuY2VsbGVkKSByZXR1cm47XHJcbiAgICAgICAgY29uc3QgcmVzb2x2ZWQgPSByZWFkQ2FyZEZpZWxkc0Zyb21SZWNvcmQoY2FyZCwge30pO1xyXG4gICAgICAgIHNldENhcmRTdGF0ZSh7XHJcbiAgICAgICAgICBmb3JtOiByZXNvbHZlZC5mb3JtLFxyXG4gICAgICAgICAgdGhlbWVLZXk6IHJlc29sdmVkLnRoZW1lS2V5LFxyXG4gICAgICAgICAgb3JpZW50YXRpb246IHJlc29sdmVkLm9yaWVudGF0aW9uLFxyXG4gICAgICAgICAgbWVtYmVySWQ6IFN0cmluZyhjYXJkPy5tZW1iZXJJZCB8fCBcIlwiKS50cmltKCksXHJcbiAgICAgICAgICBjYXJkU2x1ZzogcmVzb2x2ZWQuc2x1ZyB8fCBub3JtYWxpemVDYXJkU2x1Z0lucHV0KHNsdWcpLFxyXG4gICAgICAgICAgZXhpc3RzOiB0cnVlLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGlmIChjYW5jZWxsZWQpIHJldHVybjtcclxuICAgICAgICBzZXRDYXJkU3RhdGUoKHByZXYpID0+ICh7IC4uLnByZXYsIGV4aXN0czogZmFsc2UgfSkpO1xyXG4gICAgICB9IGZpbmFsbHkge1xyXG4gICAgICAgIGlmICghY2FuY2VsbGVkKSBzZXRMb2FkaW5nKGZhbHNlKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIGxvYWRDYXJkKCk7XHJcbiAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICBjYW5jZWxsZWQgPSB0cnVlO1xyXG4gICAgfTtcclxuICB9LCBbc2x1Z10pO1xyXG5cclxuICBjb25zdCBoYW5kbGVEb3dubG9hZCA9IGFzeW5jICgpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGF3YWl0IGRvd25sb2FkQnVzaW5lc3NDYXJkSW1hZ2UoY2FyZFN0YXRlLmZvcm0sIGNhcmRTdGF0ZS50aGVtZUtleSwgY2FyZFN0YXRlLm9yaWVudGF0aW9uLCBjYXJkU3RhdGUuY2FyZFNsdWcpO1xyXG4gICAgICBzZXRUb2FzdChcIuydtOuvuOyngOulvCDsoIDsnqXtlojsirXri4jri6QuXCIpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgc2V0VG9hc3QoXCLsnbTrr7jsp4Ag7KCA7J6l7JeQIOyLpO2MqO2WiOyKteuLiOuLpC5cIik7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgY29uc3QgaGFuZGxlU2hhcmUgPSBhc3luYyAoKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBzZXRTaGFyaW5nKHRydWUpO1xyXG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBzaGFyZUJ1c2luZXNzQ2FyZEltYWdlKGNhcmRTdGF0ZS5mb3JtLCBjYXJkU3RhdGUudGhlbWVLZXksIGNhcmRTdGF0ZS5vcmllbnRhdGlvbiwgY2FyZFN0YXRlLmNhcmRTbHVnKTtcclxuICAgICAgaWYgKHJlc3VsdCA9PT0gXCJzaGFyZWRcIikgc2V0VG9hc3QoXCLsubTthqEg7KCE7IahIOywveydhCDsl7Tsl4jsirXri4jri6QuXCIpO1xyXG4gICAgICBlbHNlIGlmIChyZXN1bHQgPT09IFwiY29waWVkXCIpIHNldFRvYXN0KFwi66qF7ZWoIOygleuztOulvCDrs7XsgqztlojsirXri4jri6QuXCIpO1xyXG4gICAgICBlbHNlIHNldFRvYXN0KFwi7J20IOq4sOq4sOyXkOyEnOuKlCDqs7XsnKDrpbwg7KeA7JuQ7ZWY7KeAIOyViuyKteuLiOuLpC5cIik7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBzZXRUb2FzdChcIuy5tO2GoSDsoITshqHsl5Ag7Iuk7Yyo7ZaI7Iq164uI64ukLlwiKTtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIHNldFNoYXJpbmcoZmFsc2UpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGNvbnN0IGhhbmRsZURlbGV0ZSA9IGFzeW5jICgpID0+IHtcclxuICAgIGlmICghaXNPd25lcikgcmV0dXJuO1xyXG4gICAgY29uc3QgY29uZmlybWVkID0gd2luZG93LmNvbmZpcm0oXCLsoIDsnqXrkJwg66qF7ZWo7J2EIOyCreygnO2VmOyLnOqyoOyKteuLiOq5jD9cIik7XHJcbiAgICBpZiAoIWNvbmZpcm1lZCkgcmV0dXJuO1xyXG4gICAgdHJ5IHtcclxuICAgICAgc2V0RGVsZXRpbmcodHJ1ZSk7XHJcbiAgICAgIGF3YWl0IHN0b3JhZ2VBZGFwdGVyLmRlbGV0ZUNhcmQodmlld2VyTWVtYmVySWQpO1xyXG4gICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoXCJzdTpzc290OmNoYW5nZWRcIiwgeyBkZXRhaWw6IHsgdHlwZTogXCJjYXJkXCIsIG9wZXJhdGlvbjogXCJkZWxldGVcIiwgZGF0YTogeyBjYXJkU2x1ZzogY2FyZFN0YXRlLmNhcmRTbHVnIH0gfSB9KSk7XHJcbiAgICAgIG5hdmlnYXRlKFwiL215XCIsIHsgcmVwbGFjZTogdHJ1ZSB9KTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHNldFRvYXN0KGVycm9yPy5tZXNzYWdlIHx8IFwi66qF7ZWoIOyCreygnOyXkCDsi6TtjKjtlojsirXri4jri6QuXCIpO1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgc2V0RGVsZXRpbmcoZmFsc2UpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGlmIChsb2FkaW5nKSB7XHJcbiAgICByZXR1cm4gPGRpdiBzdHlsZT17eyBwYWRkaW5nOiBcIjQ4cHggMThweFwiLCB0ZXh0QWxpZ246IFwiY2VudGVyXCIsIGNvbG9yOiBcIiM2NDc0OGJcIiwgZm9udFNpemU6IDE0LCBmb250V2VpZ2h0OiA3MDAgfX0+66qF7ZWo7J2EIOu2iOufrOyYpOuKlCDspJHsnoXri4jri6QuLi48L2Rpdj47XHJcbiAgfVxyXG5cclxuICBpZiAoIWNhcmRTdGF0ZS5leGlzdHMpIHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogXCI0OHB4IDE4cHhcIiwgbWF4V2lkdGg6IDcyMCwgbWFyZ2luOiBcIjAgYXV0b1wiLCB0ZXh0QWxpZ246IFwiY2VudGVyXCIgfX0+XHJcbiAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogMjAsIGZvbnRXZWlnaHQ6IDkwMCwgY29sb3I6IFwiIzBmMTcyYVwiIH19Puuqhe2VqOydhCDssL7snYQg7IiYIOyXhuyKteuLiOuLpC48L2Rpdj5cclxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBuYXZpZ2F0ZShcIi9teVwiKX0gc3R5bGU9e3sgbWFyZ2luVG9wOiAxOCwgbWluSGVpZ2h0OiA0OCwgcGFkZGluZzogXCIwIDIwcHhcIiwgYm9yZGVyUmFkaXVzOiAxNiwgYm9yZGVyOiBcIjFweCBzb2xpZCByZ2JhKDE0OCwxNjMsMTg0LDAuMjgpXCIsIGJhY2tncm91bmQ6IFwiI2ZmZmZmZlwiLCBjb2xvcjogXCIjMGYxNzJhXCIsIGZvbnRTaXplOiAxNSwgZm9udFdlaWdodDogODAwLCBjdXJzb3I6IFwicG9pbnRlclwiIH19PuuCtCDsoJXrs7TroZwg7J2064+ZPC9idXR0b24+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIHJldHVybiAoXHJcbiAgICA8ZGl2IHN0eWxlPXt7IHBhZGRpbmc6IFwiMjBweCAxNnB4IDM2cHhcIiwgbWF4V2lkdGg6IDkyMCwgbWFyZ2luOiBcIjAgYXV0b1wiIH19PlxyXG4gICAgICB7dG9hc3QgPyAoXHJcbiAgICAgICAgPGRpdiBzdHlsZT17eyBwb3NpdGlvbjogXCJmaXhlZFwiLCB0b3A6IDE4LCBsZWZ0OiBcIjUwJVwiLCB0cmFuc2Zvcm06IFwidHJhbnNsYXRlWCgtNTAlKVwiLCB6SW5kZXg6IDIwMDIsIG1pbldpZHRoOiAxODAsIG1heFdpZHRoOiBcImNhbGMoMTAwdncgLSAzNnB4KVwiLCBwYWRkaW5nOiBcIjEycHggMTZweFwiLCBib3JkZXJSYWRpdXM6IDE0LCBiYWNrZ3JvdW5kOiBcInJnYmEoOCwxNSwyOCwwLjk2KVwiLCBjb2xvcjogXCIjZjhmYWZjXCIsIGJveFNoYWRvdzogXCIwIDIwcHggNDBweCByZ2JhKDAsMCwwLDAuMjIpXCIsIGJvcmRlcjogXCIxcHggc29saWQgcmdiYSg0NSwyMTIsMTkxLDAuMTgpXCIsIGZvbnRTaXplOiAxMywgZm9udFdlaWdodDogODAwLCB0ZXh0QWxpZ246IFwiY2VudGVyXCIgfX0+e3RvYXN0fTwvZGl2PlxyXG4gICAgICApIDogbnVsbH1cclxuICAgICAgPGRpdiBzdHlsZT17eyBiYWNrZ3JvdW5kOiBcImxpbmVhci1ncmFkaWVudCgxODBkZWcsICNmOGZiZmYgMCUsICNlZWY0ZmEgMTAwJSlcIiwgYm9yZGVyOiBcIjFweCBzb2xpZCByZ2JhKDIwMywyMTMsMjI1LDAuNylcIiwgYm9yZGVyUmFkaXVzOiAyOCwgcGFkZGluZzogMTgsIGJveFNoYWRvdzogXCIwIDIycHggNjBweCByZ2JhKDE1LDIzLDQyLDAuMDgpXCIgfX0+XHJcbiAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiBcImZsZXhcIiwganVzdGlmeUNvbnRlbnQ6IFwic3BhY2UtYmV0d2VlblwiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBnYXA6IDEyLCBtYXJnaW5Cb3R0b206IDE2LCBmbGV4V3JhcDogXCJ3cmFwXCIgfX0+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAyNCwgZm9udFdlaWdodDogOTAwLCBjb2xvcjogXCIjMGYxNzJhXCIsIGxldHRlclNwYWNpbmc6IFwiLTAuMDNlbVwiIH19PuyggOyepeuQnCDrqoXtlag8L2Rpdj5cclxuICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IG5hdmlnYXRlKFwiL215XCIpfSBzdHlsZT17eyBtaW5IZWlnaHQ6IDQyLCBwYWRkaW5nOiBcIjAgMTZweFwiLCBib3JkZXJSYWRpdXM6IDE0LCBib3JkZXI6IFwiMXB4IHNvbGlkIHJnYmEoMTQ4LDE2MywxODQsMC4yOClcIiwgYmFja2dyb3VuZDogXCJyZ2JhKDI1NSwyNTUsMjU1LDAuOSlcIiwgY29sb3I6IFwiIzMzNDE1NVwiLCBmb250U2l6ZTogMTQsIGZvbnRXZWlnaHQ6IDgwMCwgY3Vyc29yOiBcInBvaW50ZXJcIiB9fT7rgrQg7KCV67O066GcIOydtOuPmTwvYnV0dG9uPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxCdXNpbmVzc0NhcmRTdXJmYWNlIGZvcm09e2NhcmRTdGF0ZS5mb3JtfSB0aGVtZUtleT17Y2FyZFN0YXRlLnRoZW1lS2V5fSBvcmllbnRhdGlvbj17Y2FyZFN0YXRlLm9yaWVudGF0aW9ufSAvPlxyXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogXCJncmlkXCIsIGdyaWRUZW1wbGF0ZUNvbHVtbnM6IGlzT3duZXIgPyBcInJlcGVhdCg0LCBtaW5tYXgoMCwgMWZyKSlcIiA6IFwicmVwZWF0KDIsIG1pbm1heCgwLCAxZnIpKVwiLCBnYXA6IDEwLCBtYXJnaW5Ub3A6IDE2IH19PlxyXG4gICAgICAgICAge2lzT3duZXIgPyA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShcInN1Om9wZW4tY2FyZC1lZGl0b3JcIiwgXCIxXCIpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge31cclxuICAgICAgICAgICAgbmF2aWdhdGUoXCIvbXlcIik7XHJcbiAgICAgICAgICB9fSBzdHlsZT17eyBtaW5IZWlnaHQ6IDUwLCBib3JkZXJSYWRpdXM6IDE2LCBib3JkZXI6IFwibm9uZVwiLCBiYWNrZ3JvdW5kOiBcImxpbmVhci1ncmFkaWVudCg5MGRlZywjMGY3NjZlLCMxNGI4YTYpXCIsIGNvbG9yOiBcIiNlZmZmZmJcIiwgZm9udFNpemU6IDE1LCBmb250V2VpZ2h0OiA5MDAsIGN1cnNvcjogXCJwb2ludGVyXCIgfX0+7IiY7KCVPC9idXR0b24+IDogbnVsbH1cclxuICAgICAgICAgIHtpc093bmVyID8gPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17aGFuZGxlRGVsZXRlfSBkaXNhYmxlZD17ZGVsZXRpbmd9IHN0eWxlPXt7IG1pbkhlaWdodDogNTAsIGJvcmRlclJhZGl1czogMTYsIGJvcmRlcjogXCIxcHggc29saWQgcmdiYSgyMzksNjgsNjgsMC4xOClcIiwgYmFja2dyb3VuZDogXCJyZ2JhKDI1NSwyNTUsMjU1LDAuOTIpXCIsIGNvbG9yOiBcIiNkYzI2MjZcIiwgZm9udFNpemU6IDE1LCBmb250V2VpZ2h0OiA5MDAsIGN1cnNvcjogZGVsZXRpbmcgPyBcImRlZmF1bHRcIiA6IFwicG9pbnRlclwiLCBvcGFjaXR5OiBkZWxldGluZyA/IDAuNTUgOiAxIH19PuyCreygnDwvYnV0dG9uPiA6IG51bGx9XHJcbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXtoYW5kbGVEb3dubG9hZH0gc3R5bGU9e3sgbWluSGVpZ2h0OiA1MCwgYm9yZGVyUmFkaXVzOiAxNiwgYm9yZGVyOiBcIjFweCBzb2xpZCByZ2JhKDE1LDExOCwxMTAsMC4xOClcIiwgYmFja2dyb3VuZDogXCJyZ2JhKDI1NSwyNTUsMjU1LDAuOTIpXCIsIGNvbG9yOiBcIiMwZjc2NmVcIiwgZm9udFNpemU6IDE1LCBmb250V2VpZ2h0OiA5MDAsIGN1cnNvcjogXCJwb2ludGVyXCIgfX0+7J2066+47KeAIOyggOyepTwvYnV0dG9uPlxyXG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17aGFuZGxlU2hhcmV9IGRpc2FibGVkPXtzaGFyaW5nfSBzdHlsZT17eyBtaW5IZWlnaHQ6IDUwLCBib3JkZXJSYWRpdXM6IDE2LCBib3JkZXI6IFwiMXB4IHNvbGlkIHJnYmEoMTUsMjMsNDIsMC4wOClcIiwgYmFja2dyb3VuZDogXCJyZ2JhKDI1NSwyNTUsMjU1LDAuOTIpXCIsIGNvbG9yOiBcIiMwZjE3MmFcIiwgZm9udFNpemU6IDE1LCBmb250V2VpZ2h0OiA5MDAsIGN1cnNvcjogc2hhcmluZyA/IFwiZGVmYXVsdFwiIDogXCJwb2ludGVyXCIsIG9wYWNpdHk6IHNoYXJpbmcgPyAwLjU1IDogMSB9fT7subTthqEg7KCE7IahPC9idXR0b24+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9kaXY+XHJcbiAgKTtcclxufVxyXG5cclxuZnVuY3Rpb24gUG9pbnRXYWxsZXRCcmlkZ2UoKSB7XHJcbiAgY29uc3QgbG9jYXRpb24gPSB1c2VMb2NhdGlvbigpO1xyXG4gIGNvbnN0IGhpZGRlblBhbmVsUmVmID0gdXNlUmVmKG51bGwpO1xyXG4gIGNvbnN0IGhpZGRlbkZyaWVuZFBhbmVsUmVmID0gdXNlUmVmKG51bGwpO1xyXG4gIGNvbnN0IG1vdW50T2JzZXJ2ZXJSZWYgPSB1c2VSZWYobnVsbCk7XHJcbiAgY29uc3QgbW91bnRGcmFtZVJlZiA9IHVzZVJlZigwKTtcclxuICBjb25zdCBtb3VudFJldHJ5VGltZXJSZWYgPSB1c2VSZWYoMCk7XHJcbiAgY29uc3QgW21vdW50Tm9kZSwgc2V0TW91bnROb2RlXSA9IHVzZVN0YXRlKG51bGwpO1xyXG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcclxuICBjb25zdCBbdG9hc3QsIHNldFRvYXN0XSA9IHVzZVN0YXRlKFwiXCIpO1xyXG4gIGNvbnN0IFtwb2ludEJhbGFuY2UsIHNldFBvaW50QmFsYW5jZV0gPSB1c2VTdGF0ZSgwKTtcclxuICBjb25zdCBbcG9pbnRIaXN0b3J5LCBzZXRQb2ludEhpc3RvcnldID0gdXNlU3RhdGUoW10pO1xyXG4gIGNvbnN0IFttZW1iZXJzLCBzZXRNZW1iZXJzXSA9IHVzZVN0YXRlKFtdKTtcclxuICBjb25zdCBbc2hvcHMsIHNldFNob3BzXSA9IHVzZVN0YXRlKFtdKTtcclxuICBjb25zdCBbYWN0aW9uTW9kZSwgc2V0QWN0aW9uTW9kZV0gPSB1c2VTdGF0ZShcIlwiKTtcclxuICBjb25zdCBbYWN0aW9uU3RlcCwgc2V0QWN0aW9uU3RlcF0gPSB1c2VTdGF0ZShcInRhcmdldFwiKTtcclxuICBjb25zdCBbdGFyZ2V0UXVlcnksIHNldFRhcmdldFF1ZXJ5XSA9IHVzZVN0YXRlKFwiXCIpO1xyXG4gIGNvbnN0IFtzZWxlY3RlZE1lbWJlciwgc2V0U2VsZWN0ZWRNZW1iZXJdID0gdXNlU3RhdGUobnVsbCk7XHJcbiAgY29uc3QgW3NlbGVjdGVkU2hvcCwgc2V0U2VsZWN0ZWRTaG9wXSA9IHVzZVN0YXRlKG51bGwpO1xyXG4gIGNvbnN0IFthbW91bnRJbnB1dCwgc2V0QW1vdW50SW5wdXRdID0gdXNlU3RhdGUoXCJcIik7XHJcbiAgY29uc3QgW2FjdGlvbkxvYWRpbmcsIHNldEFjdGlvbkxvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xyXG4gIGNvbnN0IFthY3Rpb25TdWJtaXR0aW5nLCBzZXRBY3Rpb25TdWJtaXR0aW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcclxuICBjb25zdCBbcG9pbnRIaXN0b3J5RXhwYW5kZWQsIHNldFBvaW50SGlzdG9yeUV4cGFuZGVkXSA9IHVzZVN0YXRlKGZhbHNlKTtcclxuICBjb25zdCBbcmVsb2FkVGljaywgc2V0UmVsb2FkVGlja10gPSB1c2VTdGF0ZSgwKTtcclxuXHJcbiAgY29uc3QgZm9ybWF0UG9pbnRBbW91bnQgPSAodmFsdWUpID0+IGAkeyhOdW1iZXIodmFsdWUpIHx8IDApLnRvTG9jYWxlU3RyaW5nKFwia28tS1JcIil9IFBgO1xyXG5cclxuICBjb25zdCBmZXRjaEpzb24gPSBhc3luYyAocGF0aCwgb3B0aW9ucyA9IHt9KSA9PiB7XHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke1ZJUF9BUElfQkFTRX0ke3BhdGh9YCwge1xyXG4gICAgICBjcmVkZW50aWFsczogXCJpbmNsdWRlXCIsXHJcbiAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuICAgICAgICAuLi4ob3B0aW9ucy5oZWFkZXJzIHx8IHt9KSxcclxuICAgICAgfSxcclxuICAgICAgLi4ub3B0aW9ucyxcclxuICAgIH0pO1xyXG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKS5jYXRjaCgoKSA9PiAoe30pKTtcclxuICAgIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoZGF0YT8uZXJyb3IgfHwgZGF0YT8ubWVzc2FnZSB8fCByZXNwb25zZS5zdGF0dXNUZXh0IHx8IFwi7JqU7LKtIOyLpO2MqFwiKTtcclxuICAgICAgZXJyb3Iuc3RhdHVzID0gcmVzcG9uc2Uuc3RhdHVzO1xyXG4gICAgICB0aHJvdyBlcnJvcjtcclxuICAgIH1cclxuICAgIHJldHVybiBkYXRhO1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGdldEN1cnJlbnRNZW1iZXJJbmZvID0gKCkgPT4ge1xyXG4gICAgY29uc3Qgc2Vzc2lvbiA9IGdldFNlc3Npb24oKTtcclxuICAgIGNvbnN0IGN1cnJlbnRVc2VyID0gZ2V0Q3VycmVudFVzZXIoKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIG1lbWJlcklkOiBTdHJpbmcoc2Vzc2lvbj8ubWVtYmVySWQgfHwgY3VycmVudFVzZXI/Lm1lbWJlcklkIHx8IGN1cnJlbnRVc2VyPy5pZCB8fCBcIlwiKS50cmltKCksXHJcbiAgICAgIG1lbWJlck5hbWU6IFN0cmluZyhjdXJyZW50VXNlcj8ubmFtZSB8fCBzZXNzaW9uPy5uYW1lIHx8IFwiXCIpLnRyaW0oKSxcclxuICAgIH07XHJcbiAgfTtcclxuXHJcbiAgY29uc3Qgbm9ybWFsaXplUG9pbnRIaXN0b3J5RW50cnkgPSAoZW50cnksIGluZGV4KSA9PiB7XHJcbiAgICBjb25zdCBhbW91bnQgPSBOdW1iZXIoZW50cnk/LmFtb3VudCB8fCAwKTtcclxuICAgIGNvbnN0IHR5cGUgPSBTdHJpbmcoZW50cnk/LnR5cGUgfHwgXCJcIikudG9VcHBlckNhc2UoKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGlkOiBlbnRyeT8uaWQgfHwgZW50cnk/LmxlZGdlcl9pZCB8fCBlbnRyeT8ubGVkZ2VySWQgfHwgYHBvaW50LSR7aW5kZXh9YCxcclxuICAgICAgYW1vdW50LFxyXG4gICAgICBhbW91bnRBYnM6IE1hdGguYWJzKGFtb3VudCksXHJcbiAgICAgIGNyZWF0ZWRBdDogZW50cnk/LmNyZWF0ZWRBdCB8fCBlbnRyeT8uY3JlYXRlZF9hdCB8fCBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXHJcbiAgICAgIHR5cGUsXHJcbiAgICAgIHN0YXR1czogU3RyaW5nKGVudHJ5Py5zdGF0dXMgfHwgXCJhY3RpdmVcIiksXHJcbiAgICAgIGRlc2NyaXB0aW9uOiBTdHJpbmcoZW50cnk/LmRlc2NyaXB0aW9uIHx8IFwiXCIpLnRyaW0oKSxcclxuICAgICAgbGFiZWw6IHR5cGUgPT09IFwiUEFZTUVOVFwiXHJcbiAgICAgICAgPyBcIuyDgeygkCDqsrDsoJxcIlxyXG4gICAgICAgIDogdHlwZSA9PT0gXCJUUkFOU0ZFUl9PVVRcIlxyXG4gICAgICAgICAgPyBcIu2PrOyduO2KuCDsoITshqFcIlxyXG4gICAgICAgICAgOiB0eXBlID09PSBcIlRSQU5TRkVSX0lOXCJcclxuICAgICAgICAgICAgPyBcIu2PrOyduO2KuCDsiJjsi6BcIlxyXG4gICAgICAgICAgICA6IHR5cGUgPT09IFwiQURNSU5cIlxyXG4gICAgICAgICAgICAgID8gXCLqtIDrpqzsnpAg7KeA6riJXCJcclxuICAgICAgICAgICAgICA6IHR5cGUgPT09IFwiQURNSU5fREVEVUNUXCJcclxuICAgICAgICAgICAgICAgID8gXCLqtIDrpqzsnpAg7LCo6rCQXCJcclxuICAgICAgICAgICAgICAgIDogdHlwZSA9PT0gXCJQQVJUSUNJUEFUSU9OXCJcclxuICAgICAgICAgICAgICAgICAgPyBcIu2PrOyduO2KuCDsoIHrpr1cIlxyXG4gICAgICAgICAgICAgICAgICA6IGFtb3VudCA+PSAwXHJcbiAgICAgICAgICAgICAgICAgICAgPyBcIu2PrOyduO2KuCDsoIHrpr1cIlxyXG4gICAgICAgICAgICAgICAgICAgIDogXCLtj6zsnbjtirgg7IKs7JqpXCIsXHJcbiAgICB9O1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGNsb3NlQWN0aW9uID0gKCkgPT4ge1xyXG4gICAgc2V0QWN0aW9uTW9kZShcIlwiKTtcclxuICAgIHNldEFjdGlvblN0ZXAoXCJ0YXJnZXRcIik7XHJcbiAgICBzZXRUYXJnZXRRdWVyeShcIlwiKTtcclxuICAgIHNldFNlbGVjdGVkTWVtYmVyKG51bGwpO1xyXG4gICAgc2V0U2VsZWN0ZWRTaG9wKG51bGwpO1xyXG4gICAgc2V0QW1vdW50SW5wdXQoXCJcIik7XHJcbiAgfTtcclxuXHJcbiAgY29uc3Qgc2VsZWN0ZWRUYXJnZXQgPSBhY3Rpb25Nb2RlID09PSBcInRyYW5zZmVyXCIgPyBzZWxlY3RlZE1lbWJlciA6IHNlbGVjdGVkU2hvcDtcclxuICBjb25zdCBzZWxlY3RlZFRhcmdldE5hbWUgPSBhY3Rpb25Nb2RlID09PSBcInRyYW5zZmVyXCJcclxuICAgID8gU3RyaW5nKHNlbGVjdGVkTWVtYmVyPy5uYW1lIHx8IHNlbGVjdGVkTWVtYmVyPy5tZW1iZXJJZCB8fCBzZWxlY3RlZE1lbWJlcj8uaWQgfHwgXCJcIikudHJpbSgpXHJcbiAgICA6IFN0cmluZyhzZWxlY3RlZFNob3A/Lm5hbWUgfHwgc2VsZWN0ZWRTaG9wPy5pZCB8fCBzZWxlY3RlZFNob3A/LnNob3BJZCB8fCBcIlwiKS50cmltKCk7XHJcbiAgY29uc3QgYW1vdW50VmFsdWUgPSBOdW1iZXIoU3RyaW5nKGFtb3VudElucHV0IHx8IFwiXCIpLnJlcGxhY2UoL1teXFxkXS9nLCBcIlwiKSkgfHwgMDtcclxuXHJcbiAgY29uc3QgbG9hZFBvaW50RGF0YSA9IGFzeW5jICgpID0+IHtcclxuICAgIGNvbnN0IHsgbWVtYmVySWQgfSA9IGdldEN1cnJlbnRNZW1iZXJJbmZvKCk7XHJcbiAgICBpZiAoIW1lbWJlcklkKSB7XHJcbiAgICAgIHNldFBvaW50QmFsYW5jZSgwKTtcclxuICAgICAgc2V0UG9pbnRIaXN0b3J5KFtdKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIHNldExvYWRpbmcodHJ1ZSk7XHJcbiAgICAgIGNvbnN0IFtiYWxhbmNlUmVzLCBoaXN0b3J5UmVzXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcclxuICAgICAgICBmZXRjaEpzb24oYC9hcGkvcG9pbnRzLyR7ZW5jb2RlVVJJQ29tcG9uZW50KG1lbWJlcklkKX0vYmFsYW5jZWApLFxyXG4gICAgICAgIGZldGNoSnNvbihgL2FwaS9wb2ludHMvJHtlbmNvZGVVUklDb21wb25lbnQobWVtYmVySWQpfS9oaXN0b3J5P2xpbWl0PTI0YCksXHJcbiAgICAgIF0pO1xyXG4gICAgICBjb25zdCBoaXN0b3J5Um93cyA9IEFycmF5LmlzQXJyYXkoaGlzdG9yeVJlcz8udHJhbnNhY3Rpb25zKSA/IGhpc3RvcnlSZXMudHJhbnNhY3Rpb25zIDogQXJyYXkuaXNBcnJheShoaXN0b3J5UmVzKSA/IGhpc3RvcnlSZXMgOiBbXTtcclxuICAgICAgc2V0UG9pbnRCYWxhbmNlKE51bWJlcihiYWxhbmNlUmVzPy5iYWxhbmNlIHx8IDApKTtcclxuICAgICAgc2V0UG9pbnRIaXN0b3J5KGhpc3RvcnlSb3dzLm1hcChub3JtYWxpemVQb2ludEhpc3RvcnlFbnRyeSkuc29ydCgobGVmdCwgcmlnaHQpID0+IHtcclxuICAgICAgICBjb25zdCByaWdodFRpbWUgPSBwYXJzZUtTVERhdGVWYWx1ZShyaWdodC5jcmVhdGVkQXQpPy5nZXRUaW1lKCkgfHwgMDtcclxuICAgICAgICBjb25zdCBsZWZ0VGltZSA9IHBhcnNlS1NURGF0ZVZhbHVlKGxlZnQuY3JlYXRlZEF0KT8uZ2V0VGltZSgpIHx8IDA7XHJcbiAgICAgICAgcmV0dXJuIHJpZ2h0VGltZSAtIGxlZnRUaW1lO1xyXG4gICAgICB9KSk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBzZXRQb2ludEJhbGFuY2UoMCk7XHJcbiAgICAgIHNldFBvaW50SGlzdG9yeShbXSk7XHJcbiAgICAgIHNldFRvYXN0KGVycm9yPy5tZXNzYWdlIHx8IFwi7Y+s7J247Yq4IOygleuztOulvCDrtojrn6zsmKTsp4Ag66q77ZaI7Iq164uI64ukLlwiKTtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHVzZUxheW91dEVmZmVjdCgoKSA9PiB7XHJcbiAgICBpZiAobG9jYXRpb24ucGF0aG5hbWUgIT09IFwiL215XCIpIHtcclxuICAgICAgaWYgKGhpZGRlblBhbmVsUmVmLmN1cnJlbnQpIGhpZGRlblBhbmVsUmVmLmN1cnJlbnQuc3R5bGUuZGlzcGxheSA9IFwiXCI7XHJcbiAgICAgIGlmIChoaWRkZW5GcmllbmRQYW5lbFJlZi5jdXJyZW50KSBoaWRkZW5GcmllbmRQYW5lbFJlZi5jdXJyZW50LnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xyXG4gICAgICBpZiAobW91bnRPYnNlcnZlclJlZi5jdXJyZW50KSB7XHJcbiAgICAgICAgbW91bnRPYnNlcnZlclJlZi5jdXJyZW50LmRpc2Nvbm5lY3QoKTtcclxuICAgICAgICBtb3VudE9ic2VydmVyUmVmLmN1cnJlbnQgPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChtb3VudEZyYW1lUmVmLmN1cnJlbnQpIHtcclxuICAgICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUobW91bnRGcmFtZVJlZi5jdXJyZW50KTtcclxuICAgICAgICBtb3VudEZyYW1lUmVmLmN1cnJlbnQgPSAwO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChtb3VudFJldHJ5VGltZXJSZWYuY3VycmVudCkge1xyXG4gICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQobW91bnRSZXRyeVRpbWVyUmVmLmN1cnJlbnQpO1xyXG4gICAgICAgIG1vdW50UmV0cnlUaW1lclJlZi5jdXJyZW50ID0gMDtcclxuICAgICAgfVxyXG4gICAgICBzZXRNb3VudE5vZGUobnVsbCk7XHJcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHJldHJ5Q291bnQgPSAwO1xyXG4gICAgY29uc3QgZW5zdXJlTW91bnROb2RlID0gKCkgPT4ge1xyXG4gICAgICBjb25zdCBwYW5lbHMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJzZWN0aW9uLnN1LXBhbmVsXCIpKTtcclxuICAgICAgY29uc3QgdGFyZ2V0UGFuZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzZWN0aW9uLnN1LXBhbmVsW2RhdGEtcG9pbnQtd2FsbGV0LWFuY2hvcj1cInRydWVcIl0nKSB8fCBwYW5lbHMuZmluZCgocGFuZWwpID0+IFN0cmluZyhwYW5lbC50ZXh0Q29udGVudCB8fCBcIlwiKS5pbmNsdWRlcyhcIvCfkrAg7Y+s7J247Yq4IOq0gOumrFwiKSk7XHJcbiAgICAgIGNvbnN0IGZyaWVuZFBhbmVsID0gcGFuZWxzLmZpbmQoKHBhbmVsKSA9PiB7XHJcbiAgICAgICAgY29uc3QgdGV4dCA9IFN0cmluZyhwYW5lbC50ZXh0Q29udGVudCB8fCBcIlwiKTtcclxuICAgICAgICByZXR1cm4gdGV4dC5pbmNsdWRlcyhcIvCfkaUg7Lmc6rWsXCIpIHx8IHRleHQuaW5jbHVkZXMoXCLtmozsm5Ag7Lmc6rWsIOy2lOqwgFwiKSB8fCB0ZXh0LmluY2x1ZGVzKFwi7Lmc6rWsIOuqqeuhnVwiKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZiAoaGlkZGVuRnJpZW5kUGFuZWxSZWYuY3VycmVudCAmJiBoaWRkZW5GcmllbmRQYW5lbFJlZi5jdXJyZW50ICE9PSBmcmllbmRQYW5lbCkge1xyXG4gICAgICAgIGhpZGRlbkZyaWVuZFBhbmVsUmVmLmN1cnJlbnQuc3R5bGUuZGlzcGxheSA9IFwiXCI7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGZyaWVuZFBhbmVsKSB7XHJcbiAgICAgICAgaGlkZGVuRnJpZW5kUGFuZWxSZWYuY3VycmVudCA9IGZyaWVuZFBhbmVsO1xyXG4gICAgICAgIGZyaWVuZFBhbmVsLnNldEF0dHJpYnV0ZShcImRhdGEtbXktZnJpZW5kLXBhbmVsLWhpZGRlblwiLCBcInRydWVcIik7XHJcbiAgICAgICAgZnJpZW5kUGFuZWwuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIXRhcmdldFBhbmVsKSB7XHJcbiAgICAgICAgc2V0TW91bnROb2RlKChwcmV2KSA9PiAocHJldiA/IG51bGwgOiBwcmV2KSk7XHJcbiAgICAgICAgaWYgKHJldHJ5Q291bnQgPCAxMikge1xyXG4gICAgICAgICAgcmV0cnlDb3VudCArPSAxO1xyXG4gICAgICAgICAgbW91bnRSZXRyeVRpbWVyUmVmLmN1cnJlbnQgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgIG1vdW50UmV0cnlUaW1lclJlZi5jdXJyZW50ID0gMDtcclxuICAgICAgICAgICAgZW5zdXJlTW91bnROb2RlKCk7XHJcbiAgICAgICAgICB9LCA4MCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0cnlDb3VudCA9IDA7XHJcblxyXG4gICAgICBpZiAoaGlkZGVuUGFuZWxSZWYuY3VycmVudCAmJiBoaWRkZW5QYW5lbFJlZi5jdXJyZW50ICE9PSB0YXJnZXRQYW5lbCkge1xyXG4gICAgICAgIGhpZGRlblBhbmVsUmVmLmN1cnJlbnQuc3R5bGUuZGlzcGxheSA9IFwiXCI7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGhpZGRlblBhbmVsUmVmLmN1cnJlbnQgPSB0YXJnZXRQYW5lbDtcclxuICAgICAgdGFyZ2V0UGFuZWwuc2V0QXR0cmlidXRlKFwiZGF0YS1wb2ludC13YWxsZXQtb3JpZ2luYWxcIiwgXCJ0cnVlXCIpO1xyXG4gICAgICB0YXJnZXRQYW5lbC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgIGxldCBob3N0ID0gdGFyZ2V0UGFuZWwucGFyZW50RWxlbWVudD8ucXVlcnlTZWxlY3RvcignW2RhdGEtcG9pbnQtd2FsbGV0LWJyaWRnZS1yb290PVwidHJ1ZVwiXScpO1xyXG4gICAgICBpZiAoIWhvc3QpIHtcclxuICAgICAgICBob3N0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICBob3N0LnNldEF0dHJpYnV0ZShcImRhdGEtcG9pbnQtd2FsbGV0LWJyaWRnZS1yb290XCIsIFwidHJ1ZVwiKTtcclxuICAgICAgICB0YXJnZXRQYW5lbC5pbnNlcnRBZGphY2VudEVsZW1lbnQoXCJhZnRlcmVuZFwiLCBob3N0KTtcclxuICAgICAgfVxyXG4gICAgICBzZXRNb3VudE5vZGUoKHByZXYpID0+IChwcmV2ID09PSBob3N0ID8gcHJldiA6IGhvc3QpKTtcclxuICAgIH07XHJcblxyXG4gICAgZW5zdXJlTW91bnROb2RlKCk7XHJcbiAgICBjb25zdCBvYnNlcnZlclJvb3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnN1LWFwcEJvZHlcIikgfHwgZG9jdW1lbnQuYm9keTtcclxuICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKCkgPT4ge1xyXG4gICAgICBpZiAobW91bnRGcmFtZVJlZi5jdXJyZW50KSByZXR1cm47XHJcbiAgICAgIG1vdW50RnJhbWVSZWYuY3VycmVudCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xyXG4gICAgICAgIG1vdW50RnJhbWVSZWYuY3VycmVudCA9IDA7XHJcbiAgICAgICAgZW5zdXJlTW91bnROb2RlKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgICBvYnNlcnZlci5vYnNlcnZlKG9ic2VydmVyUm9vdCwgeyBjaGlsZExpc3Q6IHRydWUsIHN1YnRyZWU6IHRydWUsIGNoYXJhY3RlckRhdGE6IHRydWUgfSk7XHJcbiAgICBtb3VudE9ic2VydmVyUmVmLmN1cnJlbnQgPSBvYnNlcnZlcjtcclxuICAgIHJldHVybiAoKSA9PiB7XHJcbiAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcclxuICAgICAgbW91bnRPYnNlcnZlclJlZi5jdXJyZW50ID0gbnVsbDtcclxuICAgICAgaWYgKG1vdW50RnJhbWVSZWYuY3VycmVudCkge1xyXG4gICAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShtb3VudEZyYW1lUmVmLmN1cnJlbnQpO1xyXG4gICAgICAgIG1vdW50RnJhbWVSZWYuY3VycmVudCA9IDA7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKG1vdW50UmV0cnlUaW1lclJlZi5jdXJyZW50KSB7XHJcbiAgICAgICAgd2luZG93LmNsZWFyVGltZW91dChtb3VudFJldHJ5VGltZXJSZWYuY3VycmVudCk7XHJcbiAgICAgICAgbW91bnRSZXRyeVRpbWVyUmVmLmN1cnJlbnQgPSAwO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChoaWRkZW5QYW5lbFJlZi5jdXJyZW50KSBoaWRkZW5QYW5lbFJlZi5jdXJyZW50LnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xyXG4gICAgICBpZiAoaGlkZGVuRnJpZW5kUGFuZWxSZWYuY3VycmVudCkgaGlkZGVuRnJpZW5kUGFuZWxSZWYuY3VycmVudC5zdHlsZS5kaXNwbGF5ID0gXCJcIjtcclxuICAgIH07XHJcbiAgfSwgW2xvY2F0aW9uLnBhdGhuYW1lXSk7XHJcblxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBpZiAoIXRvYXN0KSByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgY29uc3QgdGltZXIgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiBzZXRUb2FzdChcIlwiKSwgMjYwMCk7XHJcbiAgICByZXR1cm4gKCkgPT4gd2luZG93LmNsZWFyVGltZW91dCh0aW1lcik7XHJcbiAgfSwgW3RvYXN0XSk7XHJcblxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBpZiAobG9jYXRpb24ucGF0aG5hbWUgIT09IFwiL215XCIpIHJldHVybjtcclxuICAgIGxvYWRQb2ludERhdGEoKTtcclxuICB9LCBbbG9jYXRpb24ucGF0aG5hbWUsIHJlbG9hZFRpY2tdKTtcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGNvbnN0IHJlbG9hZCA9ICgpID0+IHNldFJlbG9hZFRpY2soKHByZXYpID0+IHByZXYgKyAxKTtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiUE9JTlRTX1VQREFURURcIiwgcmVsb2FkKTtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwic3U6c3NvdDpjaGFuZ2VkXCIsIHJlbG9hZCk7XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInN0b3JhZ2VcIiwgcmVsb2FkKTtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwic3U6YXV0aDpjaGFuZ2VkXCIsIHJlbG9hZCk7XHJcbiAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIlBPSU5UU19VUERBVEVEXCIsIHJlbG9hZCk7XHJcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwic3U6c3NvdDpjaGFuZ2VkXCIsIHJlbG9hZCk7XHJcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwic3RvcmFnZVwiLCByZWxvYWQpO1xyXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInN1OmF1dGg6Y2hhbmdlZFwiLCByZWxvYWQpO1xyXG4gICAgfTtcclxuICB9LCBbXSk7XHJcblxyXG4gIGNvbnN0IGVhcm5lZFRvdGFsID0gcG9pbnRIaXN0b3J5LmZpbHRlcigoZW50cnkpID0+IGVudHJ5LmFtb3VudCA+IDApLnJlZHVjZSgoc3VtLCBlbnRyeSkgPT4gc3VtICsgZW50cnkuYW1vdW50LCAwKTtcclxuICBjb25zdCBzcGVudFRvdGFsID0gTWF0aC5hYnMocG9pbnRIaXN0b3J5LmZpbHRlcigoZW50cnkpID0+IGVudHJ5LmFtb3VudCA8IDApLnJlZHVjZSgoc3VtLCBlbnRyeSkgPT4gc3VtICsgZW50cnkuYW1vdW50LCAwKSk7XHJcbiAgY29uc3QgcmVjZW50SGlzdG9yeSA9IHBvaW50SGlzdG9yeS5zbGljZSgwLCA2KTtcclxuICBjb25zdCB2aXNpYmxlUG9pbnRIaXN0b3J5ID0gcG9pbnRIaXN0b3J5RXhwYW5kZWQgPyBwb2ludEhpc3RvcnkgOiByZWNlbnRIaXN0b3J5O1xyXG5cclxuICBjb25zdCBmaWx0ZXJlZE1lbWJlcnMgPSB0YXJnZXRRdWVyeS50cmltKClcclxuICAgID8gbWVtYmVycy5maWx0ZXIoKG1lbWJlcikgPT4ge1xyXG4gICAgICAgIGNvbnN0IHsgbWVtYmVySWQgfSA9IGdldEN1cnJlbnRNZW1iZXJJbmZvKCk7XHJcbiAgICAgICAgY29uc3QgY2FuZGlkYXRlSWQgPSBTdHJpbmcobWVtYmVyPy5tZW1iZXJJZCB8fCBtZW1iZXI/LmlkIHx8IFwiXCIpLnRyaW0oKTtcclxuICAgICAgICBpZiAoIWNhbmRpZGF0ZUlkIHx8IGNhbmRpZGF0ZUlkID09PSBtZW1iZXJJZCkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0gdGFyZ2V0UXVlcnkudHJpbSgpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgcmV0dXJuIGNhbmRpZGF0ZUlkLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMocXVlcnkpIHx8IFN0cmluZyhtZW1iZXI/Lm5hbWUgfHwgXCJcIikudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhxdWVyeSkgfHwgU3RyaW5nKG1lbWJlcj8ucGhvbmUgfHwgbWVtYmVyPy5waG9uZU51bWJlciB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHF1ZXJ5KTtcclxuICAgICAgfSkuc2xpY2UoMCwgOClcclxuICAgIDogW107XHJcbiAgY29uc3QgZmlsdGVyZWRTaG9wcyA9IHRhcmdldFF1ZXJ5LnRyaW0oKVxyXG4gICAgPyBzaG9wcy5maWx0ZXIoKHNob3ApID0+IHtcclxuICAgICAgICBjb25zdCBzdGF0dXMgPSBTdHJpbmcoc2hvcD8uc3RhdHVzIHx8IFwiXCIpLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIGlmIChzdGF0dXMgPT09IFwicGVuZGluZ1wiIHx8IHN0YXR1cyA9PT0gXCJyZWplY3RlZFwiKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgY29uc3QgcXVlcnkgPSB0YXJnZXRRdWVyeS50cmltKCkudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICByZXR1cm4gU3RyaW5nKHNob3A/LmlkIHx8IHNob3A/LnNob3BJZCB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHF1ZXJ5KSB8fCBTdHJpbmcoc2hvcD8ubmFtZSB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHF1ZXJ5KSB8fCBTdHJpbmcoc2hvcD8uYWRkcmVzcyB8fCBzaG9wPy5kZXNjcmlwdGlvbiB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHF1ZXJ5KTtcclxuICAgICAgfSkuc2xpY2UoMCwgOClcclxuICAgIDogW107XHJcblxyXG4gIGNvbnN0IG9wZW5BY3Rpb24gPSBhc3luYyAobW9kZSkgPT4ge1xyXG4gICAgc2V0QWN0aW9uTW9kZShtb2RlKTtcclxuICAgIHNldEFjdGlvblN0ZXAoXCJ0YXJnZXRcIik7XHJcbiAgICBzZXRUYXJnZXRRdWVyeShcIlwiKTtcclxuICAgIHNldFNlbGVjdGVkTWVtYmVyKG51bGwpO1xyXG4gICAgc2V0U2VsZWN0ZWRTaG9wKG51bGwpO1xyXG4gICAgc2V0QW1vdW50SW5wdXQoXCJcIik7XHJcbiAgICB0cnkge1xyXG4gICAgICBzZXRBY3Rpb25Mb2FkaW5nKHRydWUpO1xyXG4gICAgICBpZiAobW9kZSA9PT0gXCJ0cmFuc2ZlclwiICYmIG1lbWJlcnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IGZldGNoSnNvbihcIi9hcGkvbWVtYmVyc1wiKTtcclxuICAgICAgICBzZXRNZW1iZXJzKEFycmF5LmlzQXJyYXkoZGF0YSkgPyBkYXRhIDogQXJyYXkuaXNBcnJheShkYXRhPy5tZW1iZXJzKSA/IGRhdGEubWVtYmVycyA6IFtdKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAobW9kZSA9PT0gXCJzaG9wXCIgJiYgc2hvcHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IGZldGNoSnNvbihcIi9hcGkvc2hvcHNcIik7XHJcbiAgICAgICAgc2V0U2hvcHMoQXJyYXkuaXNBcnJheShkYXRhKSA/IGRhdGEgOiBBcnJheS5pc0FycmF5KGRhdGE/LnNob3BzKSA/IGRhdGEuc2hvcHMgOiBbXSk7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHNldFRvYXN0KG1vZGUgPT09IFwidHJhbnNmZXJcIiA/IFwi7ZqM7JuQIOuqqeuhneydhCDrtojrn6zsmKTsp4Ag66q77ZaI7Iq164uI64ukLlwiIDogXCLsg4HsoJAg66qp66Gd7J2EIOu2iOufrOyYpOyngCDrqrvtlojsirXri4jri6QuXCIpO1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgc2V0QWN0aW9uTG9hZGluZyhmYWxzZSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgY29uc3Qgc3VibWl0U2hvcFBheW1lbnQgPSBhc3luYyAoKSA9PiB7XHJcbiAgICBjb25zdCB7IG1lbWJlcklkIH0gPSBnZXRDdXJyZW50TWVtYmVySW5mbygpO1xyXG4gICAgY29uc3Qgc2VsZWN0ZWRTaG9wSWQgPSBTdHJpbmcoc2VsZWN0ZWRTaG9wPy5pZCB8fCBzZWxlY3RlZFNob3A/LnNob3BJZCB8fCBcIlwiKS50cmltKCk7XHJcbiAgICBpZiAoIW1lbWJlcklkIHx8ICFzZWxlY3RlZFNob3BJZCB8fCBhbW91bnRWYWx1ZSA8PSAwKSByZXR1cm47XHJcbiAgICBpZiAoYW1vdW50VmFsdWUgPiBwb2ludEJhbGFuY2UpIHtcclxuICAgICAgc2V0VG9hc3QoXCLrs7TsnKAg7Y+s7J247Yq466W8IOy0iOqzvO2WiOyKteuLiOuLpC5cIik7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjb25maXJtVGV4dCA9IGAke3NlbGVjdGVkVGFyZ2V0TmFtZSB8fCBcIuyEoO2Dne2VnCDsg4HsoJBcIn3sl5AgJHtmb3JtYXRQb2ludEFtb3VudChhbW91bnRWYWx1ZSl9IOqysOygnO2VmOyLnOqyoOyKteuLiOq5jD9gO1xyXG4gICAgaWYgKCF3aW5kb3cuY29uZmlybShjb25maXJtVGV4dCkpIHJldHVybjtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBzZXRBY3Rpb25TdWJtaXR0aW5nKHRydWUpO1xyXG4gICAgICBjb25zdCBxckRhdGEgPSBhd2FpdCBzdG9yYWdlQWRhcHRlci5pc3N1ZVNob3BRclBheWxvYWQoc2VsZWN0ZWRTaG9wSWQpO1xyXG4gICAgICBjb25zdCBxclBheWxvYWQgPSBTdHJpbmcocXJEYXRhPy5xclBheWxvYWQgfHwgXCJcIikudHJpbSgpO1xyXG4gICAgICBpZiAoIXFyUGF5bG9hZCkgdGhyb3cgbmV3IEVycm9yKFwiUVIg7KCV67O06rCAIOyXhuyKteuLiOuLpC5cIik7XHJcbiAgICAgIGNvbnN0IHBheW1lbnRSZXN1bHQgPSBhd2FpdCBzdG9yYWdlQWRhcHRlci5wYXlXaXRoUXJQYXlsb2FkKHFyUGF5bG9hZCwgTWF0aC50cnVuYyhhbW91bnRWYWx1ZSksIFN0cmluZyhtZW1iZXJJZCkpO1xyXG4gICAgICBpZiAoIShwYXltZW50UmVzdWx0Py5vayA9PT0gdHJ1ZSB8fCBwYXltZW50UmVzdWx0Py5zdWNjZXNzID09PSB0cnVlKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihwYXltZW50UmVzdWx0Py5lcnJvciB8fCBwYXltZW50UmVzdWx0Py5tZXNzYWdlIHx8IFwi7IOB7KCQIOqysOygnOyXkCDsi6TtjKjtlojsirXri4jri6QuXCIpO1xyXG4gICAgICB9XHJcbiAgICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudChcIlBPSU5UU19VUERBVEVEXCIsIHsgZGV0YWlsOiB7IG1lbWJlcklkIH0gfSkpO1xyXG4gICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoXCJzdTpzc290OmNoYW5nZWRcIiwgeyBkZXRhaWw6IHsgdHlwZTogXCJwb2ludHNcIiwgb3BlcmF0aW9uOiBcInNob3AtcGF5bWVudFwiIH0gfSkpO1xyXG4gICAgICBhd2FpdCBsb2FkUG9pbnREYXRhKCk7XHJcbiAgICAgIHNldFRvYXN0KFwi7IOB7KCQIOqysOygnOqwgCDsmYTro4zrkJjsl4jsirXri4jri6QuXCIpO1xyXG4gICAgICBjbG9zZUFjdGlvbigpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgc2V0VG9hc3QoZXJyb3I/Lm1lc3NhZ2UgfHwgXCLsg4HsoJAg6rKw7KCcIOykkSDsmKTrpZjqsIAg67Cc7IOd7ZaI7Iq164uI64ukLlwiKTtcclxuICAgICAgY2xvc2VBY3Rpb24oKTtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIHNldEFjdGlvblN1Ym1pdHRpbmcoZmFsc2UpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIGNvbnN0IHN1Ym1pdFBvaW50VHJhbnNmZXJGYWxsYmFjayA9IGFzeW5jICh7IGZyb21NZW1iZXJJZCwgdG9NZW1iZXJJZCwgdG9NZW1iZXJOYW1lLCBhbW91bnQgfSkgPT4ge1xyXG4gICAgY29uc3Qgc2Vzc2lvblRva2VuID0gU3RyaW5nKHdpbmRvdy5fX1NVX1NFU1NJT05fXz8udG9rZW4gfHwgXCJcIikudHJpbSgpO1xyXG4gICAgaWYgKCFzZXNzaW9uVG9rZW4pIHtcclxuICAgICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoXCLtj6zsnbjtirgg7KCE7IahIEFQSeqwgCDsl7DqsrDrkJjsp4Ag7JWK7JWY7Iq164uI64ukLlwiKTtcclxuICAgICAgZXJyb3Iuc3RhdHVzID0gNDA0O1xyXG4gICAgICB0aHJvdyBlcnJvcjtcclxuICAgIH1cclxuXHJcbiAgICBhd2FpdCBmZXRjaEpzb24oXCIvYXBpL3BvaW50cy9hZG1pbi9ncmFudFwiLCB7XHJcbiAgICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7c2Vzc2lvblRva2VufWAsXHJcbiAgICAgIH0sXHJcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICBtZW1iZXJJZDogZnJvbU1lbWJlcklkLFxyXG4gICAgICAgIGFtb3VudDogLU1hdGgudHJ1bmMoYW1vdW50KSxcclxuICAgICAgICB0eXBlOiBcIlRSQU5TRkVSX09VVFwiLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiBg7Y+s7J247Yq4IOyghOyGoSAo4oaSICR7dG9NZW1iZXJOYW1lfSlgLFxyXG4gICAgICAgIHJlZmVyZW5jZVR5cGU6IFwiUE9JTlRfVFJBTlNGRVJcIixcclxuICAgICAgICByZWZlcmVuY2VJZDogYFBUWC0ke0RhdGUubm93KCl9YCxcclxuICAgICAgfSksXHJcbiAgICB9KTtcclxuXHJcbiAgICBhd2FpdCBmZXRjaEpzb24oXCIvYXBpL3BvaW50cy9hZG1pbi9ncmFudFwiLCB7XHJcbiAgICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7c2Vzc2lvblRva2VufWAsXHJcbiAgICAgIH0sXHJcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICBtZW1iZXJJZDogdG9NZW1iZXJJZCxcclxuICAgICAgICBhbW91bnQ6IE1hdGgudHJ1bmMoYW1vdW50KSxcclxuICAgICAgICB0eXBlOiBcIlRSQU5TRkVSX0lOXCIsXHJcbiAgICAgICAgZGVzY3JpcHRpb246IGDtj6zsnbjtirgg7IiY7IugICjihpAgJHtnZXRDdXJyZW50TWVtYmVySW5mbygpLm1lbWJlck5hbWUgfHwgZnJvbU1lbWJlcklkfSlgLFxyXG4gICAgICAgIHJlZmVyZW5jZVR5cGU6IFwiUE9JTlRfVFJBTlNGRVJcIixcclxuICAgICAgICByZWZlcmVuY2VJZDogYFBUWC0ke0RhdGUubm93KCl9LUlOYCxcclxuICAgICAgfSksXHJcbiAgICB9KTtcclxuICB9O1xyXG5cclxuICBjb25zdCBzdWJtaXRQb2ludFRyYW5zZmVyID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgY29uc3QgeyBtZW1iZXJJZCwgbWVtYmVyTmFtZSB9ID0gZ2V0Q3VycmVudE1lbWJlckluZm8oKTtcclxuICAgIGNvbnN0IHJlY2VpdmVySWQgPSBTdHJpbmcoc2VsZWN0ZWRNZW1iZXI/Lm1lbWJlcklkIHx8IHNlbGVjdGVkTWVtYmVyPy5pZCB8fCBcIlwiKS50cmltKCk7XHJcbiAgICBpZiAoIW1lbWJlcklkIHx8ICFyZWNlaXZlcklkIHx8IGFtb3VudFZhbHVlIDw9IDApIHJldHVybjtcclxuICAgIGlmIChhbW91bnRWYWx1ZSA+IHBvaW50QmFsYW5jZSkge1xyXG4gICAgICBzZXRUb2FzdChcIuuztOycoCDtj6zsnbjtirjrpbwg7LSI6rO87ZaI7Iq164uI64ukLlwiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNvbmZpcm1UZXh0ID0gYCR7c2VsZWN0ZWRUYXJnZXROYW1lIHx8IFwi7ISg7YOd7ZWcIO2ajOybkFwifeyXkOqyjCAke2Zvcm1hdFBvaW50QW1vdW50KGFtb3VudFZhbHVlKX0g67O064K07Iuc6rKg7Iq164uI6rmMP2A7XHJcbiAgICBpZiAoIXdpbmRvdy5jb25maXJtKGNvbmZpcm1UZXh0KSkgcmV0dXJuO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIHNldEFjdGlvblN1Ym1pdHRpbmcodHJ1ZSk7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgYXdhaXQgZmV0Y2hKc29uKFwiL2FwaS9wb2ludHMvdHJhbnNmZXJcIiwge1xyXG4gICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICAgICAgZnJvbU1lbWJlcklkOiBtZW1iZXJJZCxcclxuICAgICAgICAgICAgZnJvbU1lbWJlck5hbWU6IG1lbWJlck5hbWUsXHJcbiAgICAgICAgICAgIHRvTWVtYmVySWQ6IHJlY2VpdmVySWQsXHJcbiAgICAgICAgICAgIHRvTWVtYmVyTmFtZTogc2VsZWN0ZWRUYXJnZXROYW1lLFxyXG4gICAgICAgICAgICBhbW91bnQ6IE1hdGgudHJ1bmMoYW1vdW50VmFsdWUpLFxyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogYO2PrOyduO2KuCDsoITshqEgKOKGkiAke3NlbGVjdGVkVGFyZ2V0TmFtZX0pYCxcclxuICAgICAgICAgIH0pLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNvbnN0IGlzTWlzc2luZ1RyYW5zZmVyUm91dGUgPSBlcnJvcj8uc3RhdHVzID09PSA0MDQgfHwgL0Nhbm5vdCBQT1NUXFxzK1xcL2FwaVxcL3BvaW50c1xcL3RyYW5zZmVyL2kudGVzdChTdHJpbmcoZXJyb3I/Lm1lc3NhZ2UgfHwgXCJcIikpO1xyXG4gICAgICAgIGlmICghaXNNaXNzaW5nVHJhbnNmZXJSb3V0ZSkgdGhyb3cgZXJyb3I7XHJcbiAgICAgICAgYXdhaXQgc3VibWl0UG9pbnRUcmFuc2ZlckZhbGxiYWNrKHtcclxuICAgICAgICAgIGZyb21NZW1iZXJJZDogbWVtYmVySWQsXHJcbiAgICAgICAgICB0b01lbWJlcklkOiByZWNlaXZlcklkLFxyXG4gICAgICAgICAgdG9NZW1iZXJOYW1lOiBzZWxlY3RlZFRhcmdldE5hbWUsXHJcbiAgICAgICAgICBhbW91bnQ6IGFtb3VudFZhbHVlLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudChcIlBPSU5UU19VUERBVEVEXCIsIHsgZGV0YWlsOiB7IG1lbWJlcklkIH0gfSkpO1xyXG4gICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoXCJzdTpzc290OmNoYW5nZWRcIiwgeyBkZXRhaWw6IHsgdHlwZTogXCJwb2ludHNcIiwgb3BlcmF0aW9uOiBcIm1lbWJlci10cmFuc2ZlclwiIH0gfSkpO1xyXG4gICAgICBhd2FpdCBsb2FkUG9pbnREYXRhKCk7XHJcbiAgICAgIHNldFRvYXN0KFwi7Y+s7J247Yq4IOyghOyGoeydtCDsmYTro4zrkJjsl4jsirXri4jri6QuXCIpO1xyXG4gICAgICBjbG9zZUFjdGlvbigpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgaWYgKGVycm9yPy5zdGF0dXMgPT09IDQwMykge1xyXG4gICAgICAgIHNldFRvYXN0KFwi7Y+s7J247Yq4IOyghOyGoSDqtoztlZzsnbQg7JeG7Ja0IOyLpO2WieuQmOyngCDslYrslZjsirXri4jri6QuXCIpO1xyXG4gICAgICB9IGVsc2UgaWYgKGVycm9yPy5zdGF0dXMgPT09IDQwNCB8fCAvQ2Fubm90IFBPU1RcXHMrXFwvYXBpXFwvcG9pbnRzXFwvdHJhbnNmZXIvaS50ZXN0KFN0cmluZyhlcnJvcj8ubWVzc2FnZSB8fCBcIlwiKSkpIHtcclxuICAgICAgICBzZXRUb2FzdChcIu2PrOyduO2KuCDsoITshqEgQVBJ6rCAIOyVhOyngSDsl7DqsrDrkJjsp4Ag7JWK7JWY7Iq164uI64ukLlwiKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzZXRUb2FzdChlcnJvcj8ubWVzc2FnZSB8fCBcIu2PrOyduO2KuCDsoITshqEg7KSRIOyYpOulmOqwgCDrsJzsg53tlojsirXri4jri6QuXCIpO1xyXG4gICAgICB9XHJcbiAgICAgIGNsb3NlQWN0aW9uKCk7XHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBzZXRBY3Rpb25TdWJtaXR0aW5nKGZhbHNlKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBpZiAobG9jYXRpb24ucGF0aG5hbWUgIT09IFwiL215XCIgfHwgIW1vdW50Tm9kZSkgcmV0dXJuIG51bGw7XHJcblxyXG4gIHJldHVybiBjcmVhdGVQb3J0YWwoXHJcbiAgICA8PlxyXG4gICAgICA8c3R5bGU+e2BcclxuICAgICAgICBzZWN0aW9uLnN1LXBhbmVsW2RhdGEtcG9pbnQtd2FsbGV0LW9yaWdpbmFsPVwidHJ1ZVwiXSB7XHJcbiAgICAgICAgICBkaXNwbGF5OiBub25lICFpbXBvcnRhbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICBgfTwvc3R5bGU+XHJcbiAgICAgIHt0b2FzdCA/IChcclxuICAgICAgICA8ZGl2IHN0eWxlPXt7IHBvc2l0aW9uOiBcImZpeGVkXCIsIGJvdHRvbTogODgsIGxlZnQ6IFwiNTAlXCIsIHRyYW5zZm9ybTogXCJ0cmFuc2xhdGVYKC01MCUpXCIsIHpJbmRleDogMTIwMCwgcGFkZGluZzogXCIxMnB4IDE2cHhcIiwgYm9yZGVyUmFkaXVzOiAxNCwgYmFja2dyb3VuZDogXCJyZ2JhKDgsMTUsMjgsMC45NilcIiwgYm9yZGVyOiBcIjFweCBzb2xpZCByZ2JhKDE1LDExOCwxMTAsMC4yNClcIiwgY29sb3I6IFwiI2Y4ZmFmY1wiLCBib3hTaGFkb3c6IFwiMCAxOHB4IDQwcHggcmdiYSgwLDAsMCwwLjI4KVwiLCBmb250U2l6ZTogMTMsIGZvbnRXZWlnaHQ6IDcwMCB9fT57dG9hc3R9PC9kaXY+XHJcbiAgICAgICkgOiBudWxsfVxyXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJzdS1wYW5lbFwiIHN0eWxlPXt7IHBvc2l0aW9uOiBcInJlbGF0aXZlXCIsIG92ZXJmbG93OiBcImhpZGRlblwiLCBiYWNrZ3JvdW5kOiBcImxpbmVhci1ncmFkaWVudCgxODBkZWcsIHJnYmEoMjU1LDI1NSwyNTUsMC45NiksIHJnYmEoMjQ3LDI1MCwyNTIsMC45OCkpXCIsIGJvcmRlcjogXCIxcHggc29saWQgcmdiYSgyMjYsMjMyLDI0MCwwLjk1KVwiLCBib3JkZXJSYWRpdXM6IDIyLCBib3hTaGFkb3c6IFwiMCAxNnB4IDQwcHggcmdiYSgxNSwyMyw0MiwwLjA4KVwiLCBjb2xvcjogXCIjMGYxNzJhXCIgfX0+XHJcbiAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiBcImZsZXhcIiwganVzdGlmeUNvbnRlbnQ6IFwic3BhY2UtYmV0d2VlblwiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBnYXA6IDEyLCBtYXJnaW5Cb3R0b206IDEyIH19PlxyXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzdS1zZWN0aW9uVGl0bGVcIiBzdHlsZT17eyBjb2xvcjogXCIjMGYxNzJhXCIgfX0+8J+SsCDtj6zsnbjtirgg6rSA66asPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAxMiwgZm9udFdlaWdodDogODAwLCBjb2xvcjogXCIjMGY3NjZlXCIsIGxldHRlclNwYWNpbmc6IFwiMC4wNGVtXCIgfX0+UE9JTlQgV0FMTEVUPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgIHtsb2FkaW5nID8gKFxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyB0ZXh0QWxpZ246IFwiY2VudGVyXCIsIHBhZGRpbmc6IFwiMjhweCAwXCIsIGNvbG9yOiBcIiM2NDc0OGJcIiB9fT7tj6zsnbjtirjrpbwg67aI65+s7Jik64qUIOykkeyeheuLiOuLpC4uLjwvZGl2PlxyXG4gICAgICAgICkgOiAoXHJcbiAgICAgICAgICA8PlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGJvcmRlclJhZGl1czogMjAsIHBhZGRpbmc6IFwiMThweCAxNnB4XCIsIGJhY2tncm91bmQ6IFwibGluZWFyLWdyYWRpZW50KDEzNWRlZywgcmdiYSgyNDAsMjUzLDI1MCwxKSwgcmdiYSgyMzYsMjUzLDI0NSwxKSlcIiwgYm9yZGVyOiBcIjFweCBzb2xpZCByZ2JhKDE2NywyNDMsMjA4LDAuOSlcIiwgYm94U2hhZG93OiBcImluc2V0IDAgMXB4IDAgcmdiYSgyNTUsMjU1LDI1NSwwLjkpXCIsIG1hcmdpbkJvdHRvbTogMTQgfX0+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogMTMsIGZvbnRXZWlnaHQ6IDcwMCwgY29sb3I6IFwiIzQ3NTU2OVwiLCBtYXJnaW5Cb3R0b206IDggfX0+7IKs7Jqp6rCA64qlIO2PrOyduO2KuDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6IDMyLCBmb250V2VpZ2h0OiA5MDAsIGxldHRlclNwYWNpbmc6IFwiLTAuMDRlbVwiLCBjb2xvcjogXCIjMGY3NjZlXCIgfX0+e2Zvcm1hdFBvaW50QW1vdW50KHBvaW50QmFsYW5jZSl9PC9kaXY+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiBcImdyaWRcIiwgZ3JpZFRlbXBsYXRlQ29sdW1uczogXCIxZnIgMWZyXCIsIGdhcDogMTAsIG1hcmdpblRvcDogMTQgfX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGJvcmRlclJhZGl1czogMTQsIHBhZGRpbmc6IFwiMTBweCAxMnB4XCIsIGJhY2tncm91bmQ6IFwicmdiYSgyNTUsMjU1LDI1NSwwLjcyKVwiLCBib3JkZXI6IFwiMXB4IHNvbGlkIHJnYmEoMjAzLDIxMywyMjUsMC44KVwiIH19PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAxMSwgY29sb3I6IFwiIzY0NzQ4YlwiLCBmb250V2VpZ2h0OiA3MDAgfX0+7KCB66a9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luVG9wOiA0LCBjb2xvcjogXCIjMTBiOTgxXCIsIGZvbnRXZWlnaHQ6IDkwMCB9fT57Zm9ybWF0UG9pbnRBbW91bnQoZWFybmVkVG90YWwpfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGJvcmRlclJhZGl1czogMTQsIHBhZGRpbmc6IFwiMTBweCAxMnB4XCIsIGJhY2tncm91bmQ6IFwicmdiYSgyNTUsMjU1LDI1NSwwLjcyKVwiLCBib3JkZXI6IFwiMXB4IHNvbGlkIHJnYmEoMjAzLDIxMywyMjUsMC44KVwiIH19PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAxMSwgY29sb3I6IFwiIzY0NzQ4YlwiLCBmb250V2VpZ2h0OiA3MDAgfX0+7IKs7JqpPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luVG9wOiA0LCBjb2xvcjogXCIjZWY0NDQ0XCIsIGZvbnRXZWlnaHQ6IDkwMCB9fT57Zm9ybWF0UG9pbnRBbW91bnQoc3BlbnRUb3RhbCl9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6IFwiZ3JpZFwiLCBncmlkVGVtcGxhdGVDb2x1bW5zOiB3aW5kb3cuaW5uZXJXaWR0aCA8IDc2OCA/IFwiMWZyXCIgOiBcIjFmciAxZnJcIiwgZ2FwOiAxMCwgbWFyZ2luQm90dG9tOiAxMCB9fT5cclxuICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBvcGVuQWN0aW9uKFwidHJhbnNmZXJcIil9IHN0eWxlPXt7IG1pbkhlaWdodDogNTQsIGJvcmRlcjogXCIxcHggc29saWQgcmdiYSg0NSwyMTIsMTkxLDAuMjgpXCIsIGJvcmRlclJhZGl1czogMTYsIGJhY2tncm91bmQ6IFwibGluZWFyLWdyYWRpZW50KDkwZGVnLCMwZjc2NmUsIzE0YjhhNilcIiwgY29sb3I6IFwiI2VmZmZmYlwiLCBmb250V2VpZ2h0OiA5MDAsIGZvbnRTaXplOiAxNiwgbGV0dGVyU3BhY2luZzogXCItMC4wMmVtXCIsIGN1cnNvcjogXCJwb2ludGVyXCIsIGJveFNoYWRvdzogXCIwIDE0cHggMjhweCByZ2JhKDIwLDE4NCwxNjYsMC4xNilcIiB9fT7tj6zsnbjtirgg67O064K06riwPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gb3BlbkFjdGlvbihcInNob3BcIil9IHN0eWxlPXt7IG1pbkhlaWdodDogNTQsIGJvcmRlcjogXCIxcHggc29saWQgcmdiYSgxNCwxMTYsMTQ0LDAuMjIpXCIsIGJvcmRlclJhZGl1czogMTYsIGJhY2tncm91bmQ6IFwibGluZWFyLWdyYWRpZW50KDkwZGVnLCMwZjc2NmUsIzExNWU1OSlcIiwgY29sb3I6IFwiI2VmZmZmYlwiLCBmb250V2VpZ2h0OiA5MDAsIGZvbnRTaXplOiAxNiwgbGV0dGVyU3BhY2luZzogXCItMC4wMmVtXCIsIGN1cnNvcjogXCJwb2ludGVyXCIsIGJveFNoYWRvdzogXCIwIDE0cHggMjhweCByZ2JhKDE1LDExOCwxMTAsMC4xNClcIiB9fT7sg4HsoJAg6rKw7KCcPC9idXR0b24+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBkaXNhYmxlZCBzdHlsZT17eyB3aWR0aDogXCIxMDAlXCIsIG1pbkhlaWdodDogNDIsIGJvcmRlclJhZGl1czogMTQsIGJvcmRlcjogXCIxcHggc29saWQgcmdiYSgyMDMsMjEzLDIyNSwwLjkpXCIsIGJhY2tncm91bmQ6IFwicmdiYSgyNDEsMjQ1LDI0OSwwLjkpXCIsIGNvbG9yOiBcIiM5NGEzYjhcIiwgZm9udFdlaWdodDogODAwLCBmb250U2l6ZTogMTMsIGN1cnNvcjogXCJub3QtYWxsb3dlZFwiLCBvcGFjaXR5OiAwLjksIG1hcmdpbkJvdHRvbTogMTYgfX0+UVIg6rKw7KCcICjspIDruYTspJEpPC9idXR0b24+XHJcblxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAxMywgZm9udFdlaWdodDogODAwLCBjb2xvcjogXCIjMzM0MTU1XCIsIG1hcmdpbkJvdHRvbTogOCB9fT7stZzqt7wg64K07JetPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogXCJncmlkXCIsIGdhcDogOCB9fT5cclxuICAgICAgICAgICAgICB7cmVjZW50SGlzdG9yeS5sZW5ndGggPT09IDAgPyA8ZGl2IHN0eWxlPXt7IGJvcmRlclJhZGl1czogMTYsIGJvcmRlcjogXCIxcHggc29saWQgcmdiYSgyMjYsMjMyLDI0MCwwLjk1KVwiLCBiYWNrZ3JvdW5kOiBcInJnYmEoMjQ4LDI1MCwyNTIsMC45MilcIiwgcGFkZGluZzogXCIxNnB4IDE0cHhcIiwgdGV4dEFsaWduOiBcImNlbnRlclwiLCBjb2xvcjogXCIjNjQ3NDhiXCIgfX0+7Y+s7J247Yq4IOuCtOyXreydtCDsl4bsirXri4jri6QuPC9kaXY+IDogbnVsbH1cclxuICAgICAgICAgICAgICB7dmlzaWJsZVBvaW50SGlzdG9yeS5tYXAoKGVudHJ5KSA9PiAoXHJcbiAgICAgICAgICAgICAgICA8ZGl2IGtleT17ZW50cnkuaWR9IHN0eWxlPXt7IGRpc3BsYXk6IFwiZmxleFwiLCBqdXN0aWZ5Q29udGVudDogXCJzcGFjZS1iZXR3ZWVuXCIsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsIGdhcDogMTIsIGJvcmRlclJhZGl1czogMTYsIGJvcmRlcjogXCIxcHggc29saWQgcmdiYSgyMjYsMjMyLDI0MCwwLjk1KVwiLCBiYWNrZ3JvdW5kOiBcInJnYmEoMjU1LDI1NSwyNTUsMC45MilcIiwgcGFkZGluZzogXCIxMnB4IDE0cHhcIiB9fT5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtaW5XaWR0aDogMCwgZmxleDogMSB9fT5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6IFwiaW5saW5lLWZsZXhcIiwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiwgYm9yZGVyUmFkaXVzOiA5OTksIHBhZGRpbmc6IFwiM3B4IDhweFwiLCBiYWNrZ3JvdW5kOiBlbnRyeS5hbW91bnQgPj0gMCA/IFwicmdiYSgxNiwxODUsMTI5LDAuMTIpXCIgOiBcInJnYmEoMjM5LDY4LDY4LDAuMTApXCIsIGNvbG9yOiBlbnRyeS5hbW91bnQgPj0gMCA/IFwiIzA1OTY2OVwiIDogXCIjZGMyNjI2XCIsIGZvbnRTaXplOiAxMSwgZm9udFdlaWdodDogODAwIH19PntlbnRyeS5sYWJlbH08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpblRvcDogNiwgZm9udFNpemU6IDE0LCBmb250V2VpZ2h0OiA4MDAsIGNvbG9yOiBcIiMwZjE3MmFcIiwgb3ZlcmZsb3c6IFwiaGlkZGVuXCIsIHRleHRPdmVyZmxvdzogXCJlbGxpcHNpc1wiLCB3aGl0ZVNwYWNlOiBcIm5vd3JhcFwiIH19PntlbnRyeS5kZXNjcmlwdGlvbiB8fCBlbnRyeS5sYWJlbH08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpblRvcDogMywgZm9udFNpemU6IDExLCBjb2xvcjogXCIjOTRhM2I4XCIgfX0+e2Zvcm1hdEtTVERhdGVUaW1lKGVudHJ5LmNyZWF0ZWRBdCl9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHRleHRBbGlnbjogXCJyaWdodFwiLCBmbGV4U2hyaW5rOiAwIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6IDE4LCBmb250V2VpZ2h0OiA5MDAsIGNvbG9yOiBlbnRyeS5hbW91bnQgPj0gMCA/IFwiIzEwYjk4MVwiIDogXCIjZWY0NDQ0XCIgfX0+e2VudHJ5LmFtb3VudCA+PSAwID8gXCIrXCIgOiBcIi1cIn17Zm9ybWF0UG9pbnRBbW91bnQoZW50cnkuYW1vdW50QWJzKX08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICApKX1cclxuICAgICAgICAgICAgICB7cG9pbnRIaXN0b3J5Lmxlbmd0aCA+IDYgPyAoXHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6IFwiZmxleFwiLCBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIiwgbWFyZ2luVG9wOiAxMCB9fT5cclxuICAgICAgICAgICAgICAgICAgPGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInN1LWNoaXBcIlxyXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFBvaW50SGlzdG9yeUV4cGFuZGVkKChwcmV2KSA9PiAhcHJldil9XHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgbWluV2lkdGg6IDEwNCB9fVxyXG4gICAgICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICAgICAge3BvaW50SGlzdG9yeUV4cGFuZGVkID8gXCLsoJHquLBcIiA6IFwi642U67O06riwXCJ9XHJcbiAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgKSA6IG51bGx9XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC8+XHJcbiAgICAgICAgKX1cclxuICAgICAgPC9zZWN0aW9uPlxyXG5cclxuICAgICAge2FjdGlvbk1vZGUgPyBjcmVhdGVQb3J0YWwoXHJcbiAgICAgICAgPGRpdiBzdHlsZT17eyBwb3NpdGlvbjogXCJmaXhlZFwiLCBpbnNldDogMCwgekluZGV4OiAxMzAwLCBiYWNrZ3JvdW5kOiBcInJnYmEoMTUsMjMsNDIsMC42MilcIiwgYmFja2Ryb3BGaWx0ZXI6IFwiYmx1cig4cHgpXCIsIGRpc3BsYXk6IFwiZmxleFwiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIiwgcGFkZGluZzogMTYgfX0+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHdpZHRoOiBcIm1pbig1NjBweCwgMTAwJSlcIiwgbWF4SGVpZ2h0OiBcIm1pbig4OHZoLCA3NjBweClcIiwgb3ZlcmZsb3dZOiBcImF1dG9cIiwgYm9yZGVyUmFkaXVzOiAyNCwgYmFja2dyb3VuZDogXCJsaW5lYXItZ3JhZGllbnQoMTgwZGVnLCByZ2JhKDI1NSwyNTUsMjU1LDAuOTkpLCByZ2JhKDI0OCwyNTAsMjUyLDAuOTkpKVwiLCBib3JkZXI6IFwiMXB4IHNvbGlkIHJnYmEoMjI2LDIzMiwyNDAsMC45NSlcIiwgYm94U2hhZG93OiBcIjAgMzBweCA4MHB4IHJnYmEoMTUsMjMsNDIsMC4yMilcIiwgcGFkZGluZzogMjAsIGNvbG9yOiBcIiMwZjE3MmFcIiB9fT5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiBcImZsZXhcIiwganVzdGlmeUNvbnRlbnQ6IFwic3BhY2UtYmV0d2VlblwiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBnYXA6IDEyLCBtYXJnaW5Cb3R0b206IDE2IH19PlxyXG4gICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAyMSwgZm9udFdlaWdodDogOTAwIH19PnthY3Rpb25Nb2RlID09PSBcInRyYW5zZmVyXCIgPyBcIu2PrOyduO2KuCDrs7TrgrTquLBcIiA6IFwi7IOB7KCQIOqysOygnFwifTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Ub3A6IDQsIGZvbnRTaXplOiAxMiwgY29sb3I6IFwiIzY0NzQ4YlwiIH19PnthY3Rpb25TdGVwID09PSBcInRhcmdldFwiID8gXCLrjIDsg4HsnYQg7ISg7YOd7ZWY7IS47JqULlwiIDogYWN0aW9uU3RlcCA9PT0gXCJhbW91bnRcIiA/IFwi6riI7JWh7J2EIOyeheugpe2VmOyEuOyalC5cIiA6IFwi7LWc7KKFIOuCtOyaqeydhCDtmZXsnbjtlZjshLjsmpQuXCJ9PC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17Y2xvc2VBY3Rpb259IHN0eWxlPXt7IGJvcmRlcjogXCJub25lXCIsIGJhY2tncm91bmQ6IFwidHJhbnNwYXJlbnRcIiwgY29sb3I6IFwiIzY0NzQ4YlwiLCBmb250U2l6ZTogMjQsIGxpbmVIZWlnaHQ6IDEsIGN1cnNvcjogXCJwb2ludGVyXCIgfX0+w5c8L2J1dHRvbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6IFwiZ3JpZFwiLCBncmlkVGVtcGxhdGVDb2x1bW5zOiBcInJlcGVhdCgzLCAxZnIpXCIsIGdhcDogOCwgbWFyZ2luQm90dG9tOiAxNiB9fT5cclxuICAgICAgICAgICAgICB7W1tcInRhcmdldFwiLCBcIjFcIiwgXCLrjIDsg4Eg7ISg7YOdXCJdLCBbXCJhbW91bnRcIiwgXCIyXCIsIFwi6riI7JWhIOyeheugpVwiXSwgW1wiY29uZmlybVwiLCBcIjNcIiwgXCLstZzsooUg7ZmV7J24XCJdXS5tYXAoKFtrZXksIHN0ZXBObywgbGFiZWxdKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBhY3RpdmUgPSBhY3Rpb25TdGVwID09PSBrZXk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGtleT17a2V5fSBzdHlsZT17eyBib3JkZXJSYWRpdXM6IDE0LCBwYWRkaW5nOiBcIjEwcHggMTJweFwiLCBiYWNrZ3JvdW5kOiBhY3RpdmUgPyBcInJnYmEoMTUsMTE4LDExMCwwLjEyKVwiIDogXCJyZ2JhKDI1NSwyNTUsMjU1LDAuNzIpXCIsIGJvcmRlcjogYDFweCBzb2xpZCAke2FjdGl2ZSA/IFwicmdiYSgyMCwxODQsMTY2LDAuMjgpXCIgOiBcInJnYmEoMjI2LDIzMiwyNDAsMC45NSlcIn1gIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6IDExLCBjb2xvcjogYWN0aXZlID8gXCIjMGY3NjZlXCIgOiBcIiM5NGEzYjhcIiwgZm9udFdlaWdodDogODAwIH19PlNURVAge3N0ZXBOb308L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpblRvcDogMywgZm9udFNpemU6IDEzLCBmb250V2VpZ2h0OiA4MDAgfX0+e2xhYmVsfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgfSl9XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBib3JkZXJSYWRpdXM6IDE4LCBwYWRkaW5nOiBcIjE0cHggMTZweFwiLCBiYWNrZ3JvdW5kOiBcInJnYmEoMjQwLDI1MywyNTAsMC45KVwiLCBib3JkZXI6IFwiMXB4IHNvbGlkIHJnYmEoMTY3LDI0MywyMDgsMC45KVwiLCBtYXJnaW5Cb3R0b206IDE2IH19PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBjb2xvcjogXCIjNjQ3NDhiXCIsIGZvbnRXZWlnaHQ6IDcwMCB9fT7tmITsnqwg7J6U7JWhPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Ub3A6IDQsIGZvbnRTaXplOiAyNCwgZm9udFdlaWdodDogOTAwLCBjb2xvcjogXCIjMGY3NjZlXCIgfX0+e2Zvcm1hdFBvaW50QW1vdW50KHBvaW50QmFsYW5jZSl9PC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAge2FjdGlvblN0ZXAgPT09IFwidGFyZ2V0XCIgPyAoXHJcbiAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgIDxpbnB1dFxyXG4gICAgICAgICAgICAgICAgICB2YWx1ZT17dGFyZ2V0UXVlcnl9XHJcbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldFRhcmdldFF1ZXJ5KGV2ZW50LnRhcmdldC52YWx1ZSl9XHJcbiAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXthY3Rpb25Nb2RlID09PSBcInRyYW5zZmVyXCIgPyBcIu2ajOybkOuqhSDrmJDripQgSUQg6rKA7IOJXCIgOiBcIuyDgeygkOuqhSDrmJDripQg7KO87IaMIOqygOyDiVwifVxyXG4gICAgICAgICAgICAgICAgICBzdHlsZT17eyB3aWR0aDogXCIxMDAlXCIsIGJveFNpemluZzogXCJib3JkZXItYm94XCIsIG1pbkhlaWdodDogNDgsIGJvcmRlclJhZGl1czogMTQsIGJvcmRlcjogXCIxcHggc29saWQgcmdiYSgyMDMsMjEzLDIyNSwwLjk1KVwiLCBiYWNrZ3JvdW5kOiBcIiNmZmZmZmZcIiwgY29sb3I6IFwiIzBmMTcyYVwiLCBwYWRkaW5nOiBcIjEycHggMTRweFwiLCBmb250U2l6ZTogMTQsIG91dGxpbmU6IFwibm9uZVwiLCBtYXJnaW5Cb3R0b206IDEyIH19XHJcbiAgICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiBcImdyaWRcIiwgZ2FwOiA4LCBtYXhIZWlnaHQ6IDMyMCwgb3ZlcmZsb3dZOiBcImF1dG9cIiB9fT5cclxuICAgICAgICAgICAgICAgICAge2FjdGlvbkxvYWRpbmcgPyA8ZGl2IHN0eWxlPXt7IHRleHRBbGlnbjogXCJjZW50ZXJcIiwgY29sb3I6IFwiIzY0NzQ4YlwiLCBwYWRkaW5nOiBcIjI0cHggMFwiIH19PuuqqeuhneydhCDrtojrn6zsmKTripQg7KSR7J6F64uI64ukLi4uPC9kaXY+IDogbnVsbH1cclxuICAgICAgICAgICAgICAgICAgeyFhY3Rpb25Mb2FkaW5nICYmIGFjdGlvbk1vZGUgPT09IFwidHJhbnNmZXJcIiA/IGZpbHRlcmVkTWVtYmVycy5tYXAoKG1lbWJlcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhbmRpZGF0ZUlkID0gU3RyaW5nKG1lbWJlcj8ubWVtYmVySWQgfHwgbWVtYmVyPy5pZCB8fCBcIlwiKS50cmltKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWQgPSBTdHJpbmcoc2VsZWN0ZWRNZW1iZXI/Lm1lbWJlcklkIHx8IHNlbGVjdGVkTWVtYmVyPy5pZCB8fCBcIlwiKS50cmltKCkgPT09IGNhbmRpZGF0ZUlkO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGtleT17Y2FuZGlkYXRlSWR9IHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRTZWxlY3RlZE1lbWJlcihtZW1iZXIpfSBzdHlsZT17eyB0ZXh0QWxpZ246IFwibGVmdFwiLCBwYWRkaW5nOiBcIjEycHggMTRweFwiLCBib3JkZXJSYWRpdXM6IDE0LCBib3JkZXI6IHNlbGVjdGVkID8gXCIxcHggc29saWQgcmdiYSgyMCwxODQsMTY2LDAuMzQpXCIgOiBcIjFweCBzb2xpZCByZ2JhKDIyNiwyMzIsMjQwLDAuOTUpXCIsIGJhY2tncm91bmQ6IHNlbGVjdGVkID8gXCJyZ2JhKDIwLDE4NCwxNjYsMC4xMClcIiA6IFwicmdiYSgyNTUsMjU1LDI1NSwwLjkyKVwiLCBjb2xvcjogXCIjMGYxNzJhXCIsIGN1cnNvcjogXCJwb2ludGVyXCIgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFdlaWdodDogODAwIH19PnttZW1iZXI/Lm5hbWUgfHwgY2FuZGlkYXRlSWR9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luVG9wOiA0LCBmb250U2l6ZTogMTIsIGNvbG9yOiBcIiM2NDc0OGJcIiB9fT57Y2FuZGlkYXRlSWR9e21lbWJlcj8ucGhvbmUgfHwgbWVtYmVyPy5waG9uZU51bWJlciA/IGAgwrcgJHttZW1iZXIucGhvbmUgfHwgbWVtYmVyLnBob25lTnVtYmVyfWAgOiBcIlwifTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgfSkgOiBudWxsfVxyXG4gICAgICAgICAgICAgICAgICB7IWFjdGlvbkxvYWRpbmcgJiYgYWN0aW9uTW9kZSA9PT0gXCJzaG9wXCIgPyBmaWx0ZXJlZFNob3BzLm1hcCgoc2hvcCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNob3BJZCA9IFN0cmluZyhzaG9wPy5pZCB8fCBzaG9wPy5zaG9wSWQgfHwgXCJcIikudHJpbSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkID0gU3RyaW5nKHNlbGVjdGVkU2hvcD8uaWQgfHwgc2VsZWN0ZWRTaG9wPy5zaG9wSWQgfHwgXCJcIikudHJpbSgpID09PSBzaG9wSWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24ga2V5PXtzaG9wSWR9IHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRTZWxlY3RlZFNob3Aoc2hvcCl9IHN0eWxlPXt7IHRleHRBbGlnbjogXCJsZWZ0XCIsIHBhZGRpbmc6IFwiMTJweCAxNHB4XCIsIGJvcmRlclJhZGl1czogMTQsIGJvcmRlcjogc2VsZWN0ZWQgPyBcIjFweCBzb2xpZCByZ2JhKDE1LDExOCwxMTAsMC4zNClcIiA6IFwiMXB4IHNvbGlkIHJnYmEoMjI2LDIzMiwyNDAsMC45NSlcIiwgYmFja2dyb3VuZDogc2VsZWN0ZWQgPyBcInJnYmEoMTUsMTE4LDExMCwwLjEwKVwiIDogXCJyZ2JhKDI1NSwyNTUsMjU1LDAuOTIpXCIsIGNvbG9yOiBcIiMwZjE3MmFcIiwgY3Vyc29yOiBcInBvaW50ZXJcIiB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250V2VpZ2h0OiA4MDAgfX0+e3Nob3A/Lm5hbWUgfHwgc2hvcElkfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpblRvcDogNCwgZm9udFNpemU6IDEyLCBjb2xvcjogXCIjNjQ3NDhiXCIgfX0+e3Nob3A/LmFkZHJlc3MgfHwgc2hvcD8uZGVzY3JpcHRpb24gfHwgc2hvcElkfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgfSkgOiBudWxsfVxyXG4gICAgICAgICAgICAgICAgICB7IWFjdGlvbkxvYWRpbmcgJiYgIXNlbGVjdGVkVGFyZ2V0ICYmICgoYWN0aW9uTW9kZSA9PT0gXCJ0cmFuc2ZlclwiICYmIGZpbHRlcmVkTWVtYmVycy5sZW5ndGggPT09IDApIHx8IChhY3Rpb25Nb2RlID09PSBcInNob3BcIiAmJiBmaWx0ZXJlZFNob3BzLmxlbmd0aCA9PT0gMCkpID8gPGRpdiBzdHlsZT17eyB0ZXh0QWxpZ246IFwiY2VudGVyXCIsIHBhZGRpbmc6IFwiMjRweCAwXCIsIGNvbG9yOiBcIiM5NGEzYjhcIiwgZm9udFNpemU6IDEzIH19Pnt0YXJnZXRRdWVyeS50cmltKCkgPyBcIuqygOyDiSDqsrDqs7zqsIAg7JeG7Iq164uI64ukLlwiIDogXCLqsoDsg4nslrTrpbwg7J6F66Cl7ZW0IOuMgOyDgeydhCDssL7snLzshLjsmpQuXCJ9PC9kaXY+IDogbnVsbH1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICApIDogbnVsbH1cclxuXHJcbiAgICAgICAgICAgIHthY3Rpb25TdGVwID09PSBcImFtb3VudFwiID8gKFxyXG4gICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGJvcmRlclJhZGl1czogMTgsIHBhZGRpbmc6IFwiMTZweFwiLCBiYWNrZ3JvdW5kOiBcInJnYmEoMjU1LDI1NSwyNTUsMC45MilcIiwgYm9yZGVyOiBcIjFweCBzb2xpZCByZ2JhKDIyNiwyMzIsMjQwLDAuOTUpXCIsIG1hcmdpbkJvdHRvbTogMTIgfX0+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBjb2xvcjogXCIjNjQ3NDhiXCIsIGZvbnRXZWlnaHQ6IDcwMCB9fT57YWN0aW9uTW9kZSA9PT0gXCJ0cmFuc2ZlclwiID8gXCLrsJvripQg7ZqM7JuQXCIgOiBcIuqysOygnCDsg4HsoJBcIn08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Ub3A6IDQsIGZvbnRTaXplOiAxOCwgZm9udFdlaWdodDogOTAwIH19PntzZWxlY3RlZFRhcmdldE5hbWUgfHwgXCItXCJ9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxpbnB1dFxyXG4gICAgICAgICAgICAgICAgICB2YWx1ZT17YW1vdW50SW5wdXQgPyBTdHJpbmcoYW1vdW50SW5wdXQpLnJlcGxhY2UoL1xcQig/PShcXGR7M30pKyg/IVxcZCkpL2csIFwiLFwiKSA6IFwiXCJ9XHJcbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEFtb3VudElucHV0KFN0cmluZyhldmVudC50YXJnZXQudmFsdWUgfHwgXCJcIikucmVwbGFjZSgvW15cXGRdL2csIFwiXCIpKX1cclxuICAgICAgICAgICAgICAgICAgaW5wdXRNb2RlPVwibnVtZXJpY1wiXHJcbiAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwi67O064K8IO2PrOyduO2KuCDrmJDripQg6rKw7KCcIO2PrOyduO2KuCDsnoXroKVcIlxyXG4gICAgICAgICAgICAgICAgICBzdHlsZT17eyB3aWR0aDogXCIxMDAlXCIsIGJveFNpemluZzogXCJib3JkZXItYm94XCIsIG1pbkhlaWdodDogNTIsIGJvcmRlclJhZGl1czogMTQsIGJvcmRlcjogXCIxcHggc29saWQgcmdiYSgyMDMsMjEzLDIyNSwwLjk1KVwiLCBiYWNrZ3JvdW5kOiBcIiNmZmZmZmZcIiwgY29sb3I6IFwiIzBmMTcyYVwiLCBwYWRkaW5nOiBcIjEycHggMTRweFwiLCBmb250U2l6ZTogMTgsIGZvbnRXZWlnaHQ6IDgwMCwgb3V0bGluZTogXCJub25lXCIgfX1cclxuICAgICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpblRvcDogMTAsIGZvbnRTaXplOiAxMiwgY29sb3I6IGFtb3VudFZhbHVlID4gcG9pbnRCYWxhbmNlID8gXCIjZGMyNjI2XCIgOiBcIiM2NDc0OGJcIiB9fT57YW1vdW50VmFsdWUgPiBwb2ludEJhbGFuY2UgPyBcIuuztOycoCDtj6zsnbjtirjrpbwg7LSI6rO87ZaI7Iq164uI64ukLlwiIDogYO2YhOyerCDsnpTslaEgJHtmb3JtYXRQb2ludEFtb3VudChwb2ludEJhbGFuY2UpfeyXkOyEnCDssKjqsJDrkKnri4jri6QuYH08L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgKSA6IG51bGx9XHJcblxyXG4gICAgICAgICAgICB7YWN0aW9uU3RlcCA9PT0gXCJjb25maXJtXCIgPyAoXHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiBcImdyaWRcIiwgZ2FwOiAxMiB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgYm9yZGVyUmFkaXVzOiAxOCwgcGFkZGluZzogXCIxNnB4XCIsIGJhY2tncm91bmQ6IFwicmdiYSgyNTUsMjU1LDI1NSwwLjkyKVwiLCBib3JkZXI6IFwiMXB4IHNvbGlkIHJnYmEoMjI2LDIzMiwyNDAsMC45NSlcIiB9fT5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogMTIsIGNvbG9yOiBcIiM2NDc0OGJcIiwgZm9udFdlaWdodDogNzAwIH19PuyymOumrCDrsKnsi508L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Ub3A6IDQsIGZvbnRTaXplOiAxOCwgZm9udFdlaWdodDogOTAwIH19PnthY3Rpb25Nb2RlID09PSBcInRyYW5zZmVyXCIgPyBcIu2PrOyduO2KuCDrs7TrgrTquLBcIiA6IFwi7IOB7KCQIOqysOygnFwifTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGJvcmRlclJhZGl1czogMTgsIHBhZGRpbmc6IFwiMTZweFwiLCBiYWNrZ3JvdW5kOiBcInJnYmEoMjU1LDI1NSwyNTUsMC45MilcIiwgYm9yZGVyOiBcIjFweCBzb2xpZCByZ2JhKDIyNiwyMzIsMjQwLDAuOTUpXCIgfX0+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBjb2xvcjogXCIjNjQ3NDhiXCIsIGZvbnRXZWlnaHQ6IDcwMCB9fT57YWN0aW9uTW9kZSA9PT0gXCJ0cmFuc2ZlclwiID8gXCLrsJvripQg7ZqM7JuQXCIgOiBcIuqysOygnCDsg4HsoJBcIn08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Ub3A6IDQsIGZvbnRTaXplOiAxOCwgZm9udFdlaWdodDogOTAwIH19PntzZWxlY3RlZFRhcmdldE5hbWUgfHwgXCItXCJ9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgYm9yZGVyUmFkaXVzOiAxOCwgcGFkZGluZzogXCIxNnB4XCIsIGJhY2tncm91bmQ6IFwicmdiYSgyNDAsMjUzLDI1MCwwLjkpXCIsIGJvcmRlcjogXCIxcHggc29saWQgcmdiYSgxNjcsMjQzLDIwOCwwLjkpXCIgfX0+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBjb2xvcjogXCIjNjQ3NDhiXCIsIGZvbnRXZWlnaHQ6IDcwMCB9fT7rs7TrgrTripQg6riI7JWhPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luVG9wOiA0LCBmb250U2l6ZTogMjYsIGZvbnRXZWlnaHQ6IDkwMCwgY29sb3I6IFwiIzBmNzY2ZVwiIH19Pntmb3JtYXRQb2ludEFtb3VudChhbW91bnRWYWx1ZSl9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luVG9wOiA4LCBmb250U2l6ZTogMTIsIGNvbG9yOiBcIiM2NDc0OGJcIiB9fT7si6Ttlokg7ZuEIOyYiOyDgSDsnpTslaEge2Zvcm1hdFBvaW50QW1vdW50KHBvaW50QmFsYW5jZSAtIGFtb3VudFZhbHVlKX08L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICApIDogbnVsbH1cclxuXHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogXCJncmlkXCIsIGdyaWRUZW1wbGF0ZUNvbHVtbnM6IFwiMWZyIDFmclwiLCBnYXA6IDEwLCBtYXJnaW5Ub3A6IDE4IH19PlxyXG4gICAgICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxyXG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICBpZiAoYWN0aW9uU3RlcCA9PT0gXCJjb25maXJtXCIpIHNldEFjdGlvblN0ZXAoXCJhbW91bnRcIik7XHJcbiAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGFjdGlvblN0ZXAgPT09IFwiYW1vdW50XCIpIHNldEFjdGlvblN0ZXAoXCJ0YXJnZXRcIik7XHJcbiAgICAgICAgICAgICAgICAgIGVsc2UgY2xvc2VBY3Rpb24oKTtcclxuICAgICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgICAgICBzdHlsZT17eyBtaW5IZWlnaHQ6IDQ4LCBib3JkZXJSYWRpdXM6IDE0LCBib3JkZXI6IFwiMXB4IHNvbGlkIHJnYmEoMjAzLDIxMywyMjUsMC45NSlcIiwgYmFja2dyb3VuZDogXCJyZ2JhKDI1NSwyNTUsMjU1LDAuOSlcIiwgY29sb3I6IFwiIzMzNDE1NVwiLCBmb250V2VpZ2h0OiA4MDAsIGN1cnNvcjogXCJwb2ludGVyXCIgfX1cclxuICAgICAgICAgICAgICA+XHJcbiAgICAgICAgICAgICAgICB7YWN0aW9uU3RlcCA9PT0gXCJ0YXJnZXRcIiA/IFwi64ur6riwXCIgOiBcIuydtOyghFwifVxyXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgIHthY3Rpb25TdGVwID09PSBcInRhcmdldFwiID8gKFxyXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgZGlzYWJsZWQ9eyFzZWxlY3RlZFRhcmdldCB8fCBhY3Rpb25Mb2FkaW5nfSBvbkNsaWNrPXsoKSA9PiBzZXRBY3Rpb25TdGVwKFwiYW1vdW50XCIpfSBzdHlsZT17eyBtaW5IZWlnaHQ6IDQ4LCBib3JkZXJSYWRpdXM6IDE0LCBib3JkZXI6IFwibm9uZVwiLCBiYWNrZ3JvdW5kOiBcImxpbmVhci1ncmFkaWVudCg5MGRlZywjMGY3NjZlLCMxNGI4YTYpXCIsIGNvbG9yOiBcIiNlZmZmZmJcIiwgZm9udFdlaWdodDogOTAwLCBjdXJzb3I6ICFzZWxlY3RlZFRhcmdldCB8fCBhY3Rpb25Mb2FkaW5nID8gXCJkZWZhdWx0XCIgOiBcInBvaW50ZXJcIiwgb3BhY2l0eTogIXNlbGVjdGVkVGFyZ2V0IHx8IGFjdGlvbkxvYWRpbmcgPyAwLjQ1IDogMSB9fT7ri6TsnYw8L2J1dHRvbj5cclxuICAgICAgICAgICAgICApIDogbnVsbH1cclxuICAgICAgICAgICAgICB7YWN0aW9uU3RlcCA9PT0gXCJhbW91bnRcIiA/IChcclxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGRpc2FibGVkPXshYW1vdW50VmFsdWUgfHwgYW1vdW50VmFsdWUgPiBwb2ludEJhbGFuY2V9IG9uQ2xpY2s9eygpID0+IHNldEFjdGlvblN0ZXAoXCJjb25maXJtXCIpfSBzdHlsZT17eyBtaW5IZWlnaHQ6IDQ4LCBib3JkZXJSYWRpdXM6IDE0LCBib3JkZXI6IFwibm9uZVwiLCBiYWNrZ3JvdW5kOiBcImxpbmVhci1ncmFkaWVudCg5MGRlZywjMGY3NjZlLCMxNGI4YTYpXCIsIGNvbG9yOiBcIiNlZmZmZmJcIiwgZm9udFdlaWdodDogOTAwLCBjdXJzb3I6ICFhbW91bnRWYWx1ZSB8fCBhbW91bnRWYWx1ZSA+IHBvaW50QmFsYW5jZSA/IFwiZGVmYXVsdFwiIDogXCJwb2ludGVyXCIsIG9wYWNpdHk6ICFhbW91bnRWYWx1ZSB8fCBhbW91bnRWYWx1ZSA+IHBvaW50QmFsYW5jZSA/IDAuNDUgOiAxIH19PuuLpOydjDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICkgOiBudWxsfVxyXG4gICAgICAgICAgICAgIHthY3Rpb25TdGVwID09PSBcImNvbmZpcm1cIiA/IChcclxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGRpc2FibGVkPXthY3Rpb25TdWJtaXR0aW5nfSBvbkNsaWNrPXthY3Rpb25Nb2RlID09PSBcInRyYW5zZmVyXCIgPyBzdWJtaXRQb2ludFRyYW5zZmVyIDogc3VibWl0U2hvcFBheW1lbnR9IHN0eWxlPXt7IG1pbkhlaWdodDogNDgsIGJvcmRlclJhZGl1czogMTQsIGJvcmRlcjogXCJub25lXCIsIGJhY2tncm91bmQ6IGFjdGlvbk1vZGUgPT09IFwidHJhbnNmZXJcIiA/IFwibGluZWFyLWdyYWRpZW50KDkwZGVnLCMwZjc2NmUsIzE0YjhhNilcIiA6IFwibGluZWFyLWdyYWRpZW50KDkwZGVnLCMwZjc2NmUsIzExNWU1OSlcIiwgY29sb3I6IFwiI2VmZmZmYlwiLCBmb250V2VpZ2h0OiA5MDAsIGN1cnNvcjogYWN0aW9uU3VibWl0dGluZyA/IFwiZGVmYXVsdFwiIDogXCJwb2ludGVyXCIsIG9wYWNpdHk6IGFjdGlvblN1Ym1pdHRpbmcgPyAwLjU1IDogMSB9fT57YWN0aW9uU3VibWl0dGluZyA/IFwi7LKY66asIOykkS4uLlwiIDogYWN0aW9uTW9kZSA9PT0gXCJ0cmFuc2ZlclwiID8gXCLsoITshqEg7Iuk7ZaJXCIgOiBcIuqysOygnCDsi6TtlolcIn08L2J1dHRvbj5cclxuICAgICAgICAgICAgICApIDogbnVsbH1cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj4sXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keVxyXG4gICAgICApIDogbnVsbH1cclxuICAgIDwvPixcclxuICAgIG1vdW50Tm9kZVxyXG4gICk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG5vcm1hbGl6ZVZvdWNoZXJTZXJpYWwocmVmZXJlbmNlSWQsIGNyZWF0ZWRBdCwgbGVkZ2VySWQpIHtcclxuICBjb25zdCByYXcgPSBTdHJpbmcocmVmZXJlbmNlSWQgfHwgXCJcIikudHJpbSgpO1xyXG4gIGlmIChyYXcpIHJldHVybiByYXc7XHJcbiAgcmV0dXJuIGBWSVAtJHtidWlsZFZvdWNoZXJEYXRlS2V5KGNyZWF0ZWRBdCB8fCBuZXcgRGF0ZSgpKX0tJHtTdHJpbmcobGVkZ2VySWQgfHwgMCkucGFkU3RhcnQoNiwgXCIwXCIpfWA7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFZvdWNoZXJEaXJlY3Rpb24obG9nKSB7XHJcbiAgY29uc3Qgc291cmNlID0gU3RyaW5nKGxvZy5zb3VyY2UgfHwgXCJcIikudG9VcHBlckNhc2UoKTtcclxuICBpZiAoc291cmNlID09PSBcIlZPVUNIRVJfU0hPUF9UUkFOU0ZFUl9JTlwiKSByZXR1cm4gXCLsgqzsmqnsmYTro4xcIjtcclxuICBpZiAoc291cmNlID09PSBcIk1FTUJFUl9UUkFOU0ZFUl9JTlwiKSByZXR1cm4gXCLslpHsiJhcIjtcclxuICBpZiAoc291cmNlID09PSBcIk1FTUJFUl9UUkFOU0ZFUl9PVVRcIikgcmV0dXJuIFwi7JaR64+EXCI7XHJcbiAgaWYgKE51bWJlcihsb2cuYW1vdW50KSA+IDApIHJldHVybiBcIuyngOq4iVwiO1xyXG4gIGlmIChzb3VyY2UgPT09IFwiU0hPUF9VU0VcIiB8fCBzb3VyY2UgPT09IFwiVk9VQ0hFUl9TSE9QX1RSQU5TRkVSX09VVFwiKSByZXR1cm4gXCLsgqzsmqlcIjtcclxuICByZXR1cm4gXCLssKjqsJBcIjtcclxufVxyXG5cclxuZnVuY3Rpb24gZ2V0Vm91Y2hlclN0YXR1c0xhYmVsKGxvZykge1xyXG4gIGNvbnN0IHNvdXJjZSA9IFN0cmluZyhsb2cuc291cmNlIHx8IFwiXCIpLnRvVXBwZXJDYXNlKCk7XHJcbiAgaWYgKHNvdXJjZSA9PT0gXCJWT1VDSEVSX1NIT1BfVFJBTlNGRVJfSU5cIikgcmV0dXJuIFwi7IKs7Jqp7JmE66OMXCI7XHJcbiAgaWYgKHNvdXJjZSA9PT0gXCJTSE9QX1VTRVwiIHx8IHNvdXJjZSA9PT0gXCJWT1VDSEVSX1NIT1BfVFJBTlNGRVJfT1VUXCIpIHJldHVybiBcIuyCrOyaqeyZhOujjFwiO1xyXG4gIGlmIChzb3VyY2UgPT09IFwiTUVNQkVSX1RSQU5TRkVSX09VVFwiKSByZXR1cm4gXCLslpHrj4TsmYTro4xcIjtcclxuICBpZiAoc291cmNlID09PSBcIk1FTUJFUl9UUkFOU0ZFUl9JTlwiKSByZXR1cm4gXCLsgqzsmqnqsIDriqVcIjtcclxuICBpZiAoTnVtYmVyKGxvZy5hbW91bnQpID4gMCkgcmV0dXJuIFwi7IKs7Jqp6rCA64qlXCI7XHJcbiAgcmV0dXJuIFwi7ZqM7IiY65CoXCI7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFZvdWNoZXJTdGF0dXNTdHlsZShzdGF0dXNMYWJlbCkge1xyXG4gIGlmIChzdGF0dXNMYWJlbCA9PT0gXCLsgqzsmqnqsIDriqVcIikge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29sb3I6IFwiI2I5ZmY2NlwiLFxyXG4gICAgICBiYWNrZ3JvdW5kOiBcInJnYmEoMTMyLCAyMDQsIDIyLCAwLjE2KVwiLFxyXG4gICAgICBib3JkZXJDb2xvcjogXCJyZ2JhKDE2MywgMjMwLCA1MywgMC40MilcIixcclxuICAgIH07XHJcbiAgfVxyXG4gIGlmIChzdGF0dXNMYWJlbCA9PT0gXCLsgqzsmqnsmYTro4xcIikge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29sb3I6IFwiI2ZjYTVhNVwiLFxyXG4gICAgICBiYWNrZ3JvdW5kOiBcInJnYmEoMjM5LCA2OCwgNjgsIDAuMTQpXCIsXHJcbiAgICAgIGJvcmRlckNvbG9yOiBcInJnYmEoMjQ4LCAxMTMsIDExMywgMC4yOClcIixcclxuICAgIH07XHJcbiAgfVxyXG4gIHJldHVybiB7XHJcbiAgICBjb2xvcjogXCIjZDFkNWRiXCIsXHJcbiAgICBiYWNrZ3JvdW5kOiBcInJnYmEoMTQ4LCAxNjMsIDE4NCwgMC4xMilcIixcclxuICAgIGJvcmRlckNvbG9yOiBcInJnYmEoMTQ4LCAxNjMsIDE4NCwgMC4yNClcIixcclxuICB9O1xyXG59XHJcblxyXG5mdW5jdGlvbiBub3JtYWxpemVWb3VjaGVyTG9nKGxvZykge1xyXG4gIGNvbnN0IHBhcnNlZCA9IHBhcnNlVm91Y2hlckRlc2NyaXB0aW9uKGxvZy5kZXNjcmlwdGlvbik7XHJcbiAgLy8gZGVzY3JpcHRpb24gbWV0YeydmCBzaG9wTmFtZeydtCDsl4bsnLzrqbQgQVBJIEpPSU4g6rKw6rO87J2YIGxvZy5zaG9wTmFtZSDsmrDshKAg7IKs7JqpXHJcbiAgY29uc3QgcmVzb2x2ZWRTaG9wTmFtZSA9IHBhcnNlZC5zaG9wTmFtZSB8fCBTdHJpbmcobG9nLnNob3BOYW1lIHx8IFwiXCIpLnRyaW0oKTtcclxuICBjb25zdCByZXNvbHZlZEZyb21NZW1iZXJOYW1lID0gcGFyc2VkLmZyb21NZW1iZXJOYW1lIHx8IFwiXCI7XHJcbiAgcmV0dXJuIHtcclxuICAgIC4uLmxvZyxcclxuICAgIHNlcmlhbDogbm9ybWFsaXplVm91Y2hlclNlcmlhbChsb2cucmVmZXJlbmNlSWQsIGxvZy5jcmVhdGVkQXQsIGxvZy5pZCksXHJcbiAgICByZWFzb246IHBhcnNlZC5yZWFzb24sXHJcbiAgICBpc3N1ZVJlZ2lvbjogcGFyc2VkLmlzc3VlUmVnaW9uLFxyXG4gICAgZnJvbU1lbWJlcklkOiBwYXJzZWQuZnJvbU1lbWJlcklkLFxyXG4gICAgZnJvbU1lbWJlck5hbWU6IHJlc29sdmVkRnJvbU1lbWJlck5hbWUsXHJcbiAgICB0b01lbWJlcklkOiBwYXJzZWQudG9NZW1iZXJJZCxcclxuICAgIHRvTWVtYmVyTmFtZTogcGFyc2VkLnRvTWVtYmVyTmFtZSxcclxuICAgIGRlc2NTaG9wSWQ6IHBhcnNlZC5zaG9wSWQsXHJcbiAgICBkZXNjU2hvcE5hbWU6IHJlc29sdmVkU2hvcE5hbWUsXHJcbiAgICBkaXJlY3Rpb246IGdldFZvdWNoZXJEaXJlY3Rpb24obG9nKSxcclxuICAgIHN0YXR1c0xhYmVsOiBnZXRWb3VjaGVyU3RhdHVzTGFiZWwobG9nKSxcclxuICAgIGFtb3VudEFiczogTWF0aC5hYnMoTnVtYmVyKGxvZy5hbW91bnQpIHx8IDApLFxyXG4gIH07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIFZpcEFkbWluVm91Y2hlcnNQYWdlKCkge1xyXG4gIGNvbnN0IG5hdmlnYXRlID0gdXNlTmF2aWdhdGUoKTtcclxuICBjb25zdCBsZWRnZXJSZWYgPSB1c2VSZWYobnVsbCk7XHJcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUodHJ1ZSk7XHJcbiAgY29uc3QgW3N1Ym1pdHRpbmcsIHNldFN1Ym1pdHRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xyXG4gIGNvbnN0IFttZW1iZXJzLCBzZXRNZW1iZXJzXSA9IHVzZVN0YXRlKFtdKTtcclxuICBjb25zdCBbbG9ncywgc2V0TG9nc10gPSB1c2VTdGF0ZShbXSk7XHJcbiAgY29uc3QgW2JhbGFuY2VSb3dzLCBzZXRCYWxhbmNlUm93c10gPSB1c2VTdGF0ZShbXSk7XHJcbiAgY29uc3QgW3RvYXN0LCBzZXRUb2FzdF0gPSB1c2VTdGF0ZShcIlwiKTtcclxuICBjb25zdCBbaXNNb2JpbGUsIHNldElzTW9iaWxlXSA9IHVzZVN0YXRlKCgpID0+IHdpbmRvdy5pbm5lcldpZHRoIDwgNzY4KTtcclxuICBjb25zdCBbc2hvd01lbWJlckRyb3Bkb3duLCBzZXRTaG93TWVtYmVyRHJvcGRvd25dID0gdXNlU3RhdGUoZmFsc2UpO1xyXG4gIGNvbnN0IFtpc3N1ZU1vZGUsIHNldElzc3VlTW9kZV0gPSB1c2VTdGF0ZShcIuyngOq4iVwiKTtcclxuICBjb25zdCBbaXNzdWVGb3JtLCBzZXRJc3N1ZUZvcm1dID0gdXNlU3RhdGUoe1xyXG4gICAgbWVtYmVySWQ6IFwiXCIsXHJcbiAgICBtZW1iZXJOYW1lOiBcIlwiLFxyXG4gICAgYW1vdW50OiBcIlwiLFxyXG4gICAgaXNzdWVSZWdpb246IFwiXCIsXHJcbiAgICBkZXNjcmlwdGlvbjogXCJcIixcclxuICB9KTtcclxuICBjb25zdCBbbWVtYmVyU2VhcmNoLCBzZXRNZW1iZXJTZWFyY2hdID0gdXNlU3RhdGUoXCJcIik7XHJcbiAgY29uc3QgW2ZpbHRlcnMsIHNldEZpbHRlcnNdID0gdXNlU3RhdGUoe1xyXG4gICAgZnJvbTogXCJcIixcclxuICAgIHRvOiBcIlwiLFxyXG4gICAgbWVtYmVyOiBcIlwiLFxyXG4gICAgZGlyZWN0aW9uOiBcIlwiLFxyXG4gICAgc3RhdHVzOiBcIlwiLFxyXG4gIH0pO1xyXG5cclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgY29uc3QgaGFuZGxlUmVzaXplID0gKCkgPT4gc2V0SXNNb2JpbGUod2luZG93LmlubmVyV2lkdGggPCA3NjgpO1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgaGFuZGxlUmVzaXplKTtcclxuICAgIHJldHVybiAoKSA9PiB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBoYW5kbGVSZXNpemUpO1xyXG4gIH0sIFtdKTtcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGlmICghdG9hc3QpIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICBjb25zdCB0aW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHNldFRvYXN0KFwiXCIpLCAyNDAwKTtcclxuICAgIHJldHVybiAoKSA9PiB3aW5kb3cuY2xlYXJUaW1lb3V0KHRpbWVyKTtcclxuICB9LCBbdG9hc3RdKTtcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGlmICghaXNBZG1pbkF1dGhlbnRpY2F0ZWRMb2NhbCgpKSB7XHJcbiAgICAgIG5hdmlnYXRlKFwiL2FkbWluL2xvZ2luXCIsIHsgcmVwbGFjZTogdHJ1ZSB9KTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBtb3VudGVkID0gdHJ1ZTtcclxuXHJcbiAgICBjb25zdCBhcGlKc29uID0gYXN5bmMgKHBhdGgsIG9wdGlvbnMgPSB7fSkgPT4ge1xyXG4gICAgICBjb25zdCB0b2tlbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiYWRtaW5Ub2tlblwiKSB8fCBcIlwiO1xyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke1ZJUF9BUElfQkFTRX0ke3BhdGh9YCwge1xyXG4gICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgICAgXCJ4LWFkbWluLXRva2VuXCI6IHRva2VuLFxyXG4gICAgICAgICAgLi4uKG9wdGlvbnMuaGVhZGVycyB8fCB7fSksXHJcbiAgICAgICAgfSxcclxuICAgICAgICAuLi5vcHRpb25zLFxyXG4gICAgICB9KTtcclxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKS5jYXRjaCgoKSA9PiAoe30pKTtcclxuICAgICAgaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgbmV3IEVycm9yKGRhdGE/LmVycm9yIHx8IHJlc3BvbnNlLnN0YXR1c1RleHQgfHwgXCLsmpTssq0g7Iuk7YyoXCIpO1xyXG4gICAgICByZXR1cm4gZGF0YTtcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgbG9hZCA9IGFzeW5jICgpID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBzZXRMb2FkaW5nKHRydWUpO1xyXG4gICAgICAgIGNvbnN0IFttZW1iZXJEYXRhLCBsb2dEYXRhLCBiYWxhbmNlRGF0YV0gPSBhd2FpdCBQcm9taXNlLmFsbChbXHJcbiAgICAgICAgICBhcGlKc29uKFwiL2FwaS9tZW1iZXJzXCIpLFxyXG4gICAgICAgICAgYXBpSnNvbihcIi9hcGkvYWRtaW4vdm91Y2hlcnMvbG9ncz9wYWdlPTEmcGFnZVNpemU9NTAwJnNvcnRGaWVsZD1jcmVhdGVkX2F0JnNvcnREaXI9ZGVzY1wiKSxcclxuICAgICAgICAgIGFwaUpzb24oXCIvYXBpL2FkbWluL3ZvdWNoZXJzL2JhbGFuY2VzP3RhcmdldFR5cGU9bWVtYmVyJnBhZ2U9MSZwYWdlU2l6ZT0zMDAmZXhjbHVkZVplcm89MFwiKSxcclxuICAgICAgICBdKTtcclxuICAgICAgICBpZiAoIW1vdW50ZWQpIHJldHVybjtcclxuICAgICAgICBzZXRNZW1iZXJzKG1lbWJlckRhdGE/Lm1lbWJlcnMgfHwgW10pO1xyXG4gICAgICAgIHNldExvZ3MoKGxvZ0RhdGE/LmxvZ3MgfHwgW10pLm1hcChub3JtYWxpemVWb3VjaGVyTG9nKSk7XHJcbiAgICAgICAgc2V0QmFsYW5jZVJvd3MoYmFsYW5jZURhdGE/LnJvd3MgfHwgW10pO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGlmIChtb3VudGVkKSBzZXRUb2FzdChg7IOB7ZKI6raMIOuNsOydtO2EsOulvCDrtojrn6zsmKTsp4Ag66q77ZaI7Iq164uI64ukOiAke2Vycm9yLm1lc3NhZ2V9YCk7XHJcbiAgICAgIH0gZmluYWxseSB7XHJcbiAgICAgICAgaWYgKG1vdW50ZWQpIHNldExvYWRpbmcoZmFsc2UpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGxvYWQoKTtcclxuICAgIHJldHVybiAoKSA9PiB7XHJcbiAgICAgIG1vdW50ZWQgPSBmYWxzZTtcclxuICAgIH07XHJcbiAgfSwgW25hdmlnYXRlXSk7XHJcblxyXG4gIGNvbnN0IGFwaUpzb24gPSBhc3luYyAocGF0aCwgb3B0aW9ucyA9IHt9KSA9PiB7XHJcbiAgICBjb25zdCB0b2tlbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiYWRtaW5Ub2tlblwiKSB8fCBcIlwiO1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHtWSVBfQVBJX0JBU0V9JHtwYXRofWAsIHtcclxuICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgIFwieC1hZG1pbi10b2tlblwiOiB0b2tlbixcclxuICAgICAgICAuLi4ob3B0aW9ucy5oZWFkZXJzIHx8IHt9KSxcclxuICAgICAgfSxcclxuICAgICAgLi4ub3B0aW9ucyxcclxuICAgIH0pO1xyXG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKS5jYXRjaCgoKSA9PiAoe30pKTtcclxuICAgIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihkYXRhPy5lcnJvciB8fCByZXNwb25zZS5zdGF0dXNUZXh0IHx8IFwi7JqU7LKtIOyLpO2MqFwiKTtcclxuICAgIHJldHVybiBkYXRhO1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IHJlbG9hZFZvdWNoZXJEYXRhID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgY29uc3QgW2xvZ0RhdGEsIGJhbGFuY2VEYXRhXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcclxuICAgICAgYXBpSnNvbihcIi9hcGkvYWRtaW4vdm91Y2hlcnMvbG9ncz9wYWdlPTEmcGFnZVNpemU9NTAwJnNvcnRGaWVsZD1jcmVhdGVkX2F0JnNvcnREaXI9ZGVzY1wiKSxcclxuICAgICAgYXBpSnNvbihcIi9hcGkvYWRtaW4vdm91Y2hlcnMvYmFsYW5jZXM/dGFyZ2V0VHlwZT1tZW1iZXImcGFnZT0xJnBhZ2VTaXplPTMwMCZleGNsdWRlWmVybz0wXCIpLFxyXG4gICAgXSk7XHJcbiAgICBzZXRMb2dzKChsb2dEYXRhPy5sb2dzIHx8IFtdKS5tYXAobm9ybWFsaXplVm91Y2hlckxvZykpO1xyXG4gICAgc2V0QmFsYW5jZVJvd3MoYmFsYW5jZURhdGE/LnJvd3MgfHwgW10pO1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IHNhbml0aXplQW1vdW50ID0gKHZhbHVlKSA9PiBTdHJpbmcodmFsdWUgfHwgXCJcIikucmVwbGFjZSgvW15cXGRdL2csIFwiXCIpLnNsaWNlKDAsIDkpO1xyXG4gIGNvbnN0IGFtb3VudFZhbHVlID0gTnVtYmVyKGlzc3VlRm9ybS5hbW91bnQgfHwgMCk7XHJcbiAgY29uc3Qgc2VsZWN0ZWRNZW1iZXIgPSBtZW1iZXJzLmZpbmQoKG1lbWJlcikgPT4gU3RyaW5nKG1lbWJlci5tZW1iZXJJZCB8fCBtZW1iZXIuaWQpID09PSBTdHJpbmcoaXNzdWVGb3JtLm1lbWJlcklkIHx8IFwiXCIpKTtcclxuICBjb25zdCBzZWxlY3RlZE1lbWJlckJhbGFuY2UgPSBiYWxhbmNlUm93cy5maW5kKChyb3cpID0+IFN0cmluZyhyb3cuaWQpID09PSBTdHJpbmcoaXNzdWVGb3JtLm1lbWJlcklkIHx8IFwiXCIpKTtcclxuICBjb25zdCBmaWx0ZXJlZE1lbWJlcnMgPSBtZW1iZXJTZWFyY2gudHJpbSgpXHJcbiAgICA/IG1lbWJlcnMuZmlsdGVyKChtZW1iZXIpID0+IHtcclxuICAgICAgICBjb25zdCBxdWVyeSA9IG1lbWJlclNlYXJjaC50cmltKCkudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICBjb25zdCBwaG9uZSA9IFN0cmluZyhtZW1iZXIucGhvbmUgfHwgbWVtYmVyLnBob25lTnVtYmVyIHx8IFwiXCIpLnJlcGxhY2UoLy0vZywgXCJcIik7XHJcbiAgICAgICAgcmV0dXJuIFN0cmluZyhtZW1iZXIubmFtZSB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHF1ZXJ5KSB8fCBwaG9uZS5pbmNsdWRlcyhxdWVyeS5yZXBsYWNlKC8tL2csIFwiXCIpKTtcclxuICAgICAgfSkuc2xpY2UoMCwgMTApXHJcbiAgICA6IFtdO1xyXG5cclxuICBjb25zdCBub3JtYWxpemVkTG9ncyA9IFsuLi5sb2dzXS5zb3J0KChsZWZ0LCByaWdodCkgPT4gbmV3IERhdGUocmlnaHQuY3JlYXRlZEF0KSAtIG5ldyBEYXRlKGxlZnQuY3JlYXRlZEF0KSk7XHJcbiAgY29uc3Qgc3VtbWFyeSA9IG5vcm1hbGl6ZWRMb2dzLnJlZHVjZSgoYWNjLCBsb2cpID0+IHtcclxuICAgIGlmIChsb2cuYW1vdW50ID4gMCkge1xyXG4gICAgICBhY2MudG90YWxJc3N1ZWQgKz0gbG9nLmFtb3VudDtcclxuICAgICAgYWNjLnRvdGFsSXNzdWVkQ291bnQgKz0gMTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGFjYy50b3RhbERlZHVjdGVkICs9IE1hdGguYWJzKGxvZy5hbW91bnQpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFjYztcclxuICB9LCB7IHRvdGFsSXNzdWVkOiAwLCB0b3RhbERlZHVjdGVkOiAwLCB0b3RhbElzc3VlZENvdW50OiAwIH0pO1xyXG4gIGNvbnN0IGN1cnJlbnRCYWxhbmNlID0gYmFsYW5jZVJvd3MucmVkdWNlKChzdW0sIHJvdykgPT4gc3VtICsgKE51bWJlcihyb3cudG90YWwpIHx8IDApLCAwKTtcclxuXHJcbiAgY29uc3QgbWVtYmVySXNzdWVDb3VudHMgPSBub3JtYWxpemVkTG9ncy5yZWR1Y2UoKGFjYywgbG9nKSA9PiB7XHJcbiAgICBpZiAobG9nLmFtb3VudCA+IDApIGFjY1tsb2cubWVtYmVySWRdID0gKGFjY1tsb2cubWVtYmVySWRdIHx8IDApICsgMTtcclxuICAgIHJldHVybiBhY2M7XHJcbiAgfSwge30pO1xyXG4gIGNvbnN0IG1lbWJlclJlY2VudENoYW5nZSA9IG5vcm1hbGl6ZWRMb2dzLnJlZHVjZSgoYWNjLCBsb2cpID0+IHtcclxuICAgIGlmICghYWNjW2xvZy5tZW1iZXJJZF0pIGFjY1tsb2cubWVtYmVySWRdID0gbG9nLmNyZWF0ZWRBdDtcclxuICAgIHJldHVybiBhY2M7XHJcbiAgfSwge30pO1xyXG5cclxuICBjb25zdCBzdW1tYXJ5Q2FyZHMgPSBbXHJcbiAgICB7IGxhYmVsOiBcIuy0nSDrsJztlokg6riI7JWhXCIsIHZhbHVlOiBmb3JtYXRWb3VjaGVyQW1vdW50KHN1bW1hcnkudG90YWxJc3N1ZWQpIH0sXHJcbiAgICB7IGxhYmVsOiBcIuy0nSDssKjqsJAg6riI7JWhXCIsIHZhbHVlOiBmb3JtYXRWb3VjaGVyQW1vdW50KHN1bW1hcnkudG90YWxEZWR1Y3RlZCkgfSxcclxuICAgIHsgbGFiZWw6IFwi7ZiE7J6sIOyelOyVoVwiLCB2YWx1ZTogZm9ybWF0Vm91Y2hlckFtb3VudChjdXJyZW50QmFsYW5jZSkgfSxcclxuICAgIHsgbGFiZWw6IFwi7LSdIOuwnO2WiSDsnqXsiJhcIiwgdmFsdWU6IGAke3N1bW1hcnkudG90YWxJc3N1ZWRDb3VudC50b0xvY2FsZVN0cmluZyhcImtvLUtSXCIpfeyepWAgfSxcclxuICBdO1xyXG5cclxuICBjb25zdCB2aXNpYmxlQmFsYW5jZVJvd3MgPSBiYWxhbmNlUm93c1xyXG4gICAgLm1hcCgocm93KSA9PiAoe1xyXG4gICAgICAuLi5yb3csXHJcbiAgICAgIGlzc3VlZENvdW50OiBtZW1iZXJJc3N1ZUNvdW50c1tyb3cuaWRdIHx8IDAsXHJcbiAgICAgIGxhc3RDaGFuZ2VkQXQ6IG1lbWJlclJlY2VudENoYW5nZVtyb3cuaWRdIHx8IG51bGwsXHJcbiAgICB9KSlcclxuICAgIC5maWx0ZXIoKHJvdykgPT4ge1xyXG4gICAgICBpZiAoIWZpbHRlcnMubWVtYmVyLnRyaW0oKSkgcmV0dXJuIHRydWU7XHJcbiAgICAgIGNvbnN0IHF1ZXJ5ID0gZmlsdGVycy5tZW1iZXIudHJpbSgpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgIHJldHVybiBTdHJpbmcocm93Lm5hbWUgfHwgXCJcIikudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhxdWVyeSkgfHwgU3RyaW5nKHJvdy5pZCB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHF1ZXJ5KTtcclxuICAgIH0pXHJcbiAgICAuc29ydCgobGVmdCwgcmlnaHQpID0+IChOdW1iZXIocmlnaHQudG90YWwpIHx8IDApIC0gKE51bWJlcihsZWZ0LnRvdGFsKSB8fCAwKSk7XHJcblxyXG4gIGNvbnN0IGZpbHRlcmVkTG9ncyA9IG5vcm1hbGl6ZWRMb2dzLmZpbHRlcigobG9nKSA9PiB7XHJcbiAgICBjb25zdCBjcmVhdGVkQXQgPSBsb2cuY3JlYXRlZEF0ID8gbmV3IERhdGUobG9nLmNyZWF0ZWRBdCkgOiBudWxsO1xyXG4gICAgaWYgKGZpbHRlcnMuZnJvbSAmJiBjcmVhdGVkQXQgJiYgY3JlYXRlZEF0IDwgbmV3IERhdGUoYCR7ZmlsdGVycy5mcm9tfVQwMDowMDowMGApKSByZXR1cm4gZmFsc2U7XHJcbiAgICBpZiAoZmlsdGVycy50byAmJiBjcmVhdGVkQXQgJiYgY3JlYXRlZEF0ID4gbmV3IERhdGUoYCR7ZmlsdGVycy50b31UMjM6NTk6NTlgKSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgaWYgKGZpbHRlcnMubWVtYmVyLnRyaW0oKSkge1xyXG4gICAgICBjb25zdCBxdWVyeSA9IGZpbHRlcnMubWVtYmVyLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICBjb25zdCB0YXJnZXRUZXh0ID0gYCR7bG9nLm1lbWJlck5hbWUgfHwgXCJcIn0gJHtsb2cubWVtYmVySWQgfHwgXCJcIn1gLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgIGlmICghdGFyZ2V0VGV4dC5pbmNsdWRlcyhxdWVyeSkpIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGlmIChmaWx0ZXJzLmRpcmVjdGlvbiAmJiBsb2cuZGlyZWN0aW9uICE9PSBmaWx0ZXJzLmRpcmVjdGlvbikgcmV0dXJuIGZhbHNlO1xyXG4gICAgaWYgKGZpbHRlcnMuc3RhdHVzICYmIGxvZy5zdGF0dXNMYWJlbCAhPT0gZmlsdGVycy5zdGF0dXMpIHJldHVybiBmYWxzZTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH0pO1xyXG5cclxuICAvLyDqtIDrpqzsnpAg67Cc6riJIOybkOuzuCDsubTrk5zrp4wg7ZGc7IucICjsg4HsoJAg7IiY7IugL+yghOyGoSByb3cg7KCc7Jm4KVxyXG4gIGNvbnN0IElTU1VFRF9TT1VSQ0VTID0gbmV3IFNldChbXCJBRE1JTlwiLCBcIkFETUlOX0lTU1VFXCIsIFwiSVNTVUVcIiwgXCJHUkFOVFwiLCBcIkFETUlOX0dSQU5UXCJdKTtcclxuICAvLyBzZXJpYWzrs4Qg7Iic7J6U7JWhICg9IOybkOuzuCvssKjqsJAg7ZWp7IKwKSDqs4TsgrAg4oaSIDAg7J207ZWYID0g7IKs7Jqp7JmE66OMXHJcbiAgY29uc3Qgc2VyaWFsTmV0TWFwID0ge307XHJcbiAgbm9ybWFsaXplZExvZ3MuZm9yRWFjaCgobG9nKSA9PiB7XHJcbiAgICBjb25zdCBrZXkgPSBsb2cuc2VyaWFsO1xyXG4gICAgc2VyaWFsTmV0TWFwW2tleV0gPSAoc2VyaWFsTmV0TWFwW2tleV0gfHwgMCkgKyAoTnVtYmVyKGxvZy5hbW91bnQpIHx8IDApO1xyXG4gIH0pO1xyXG4gIGNvbnN0IHJlY2VudFZvdWNoZXJDYXJkcyA9IG5vcm1hbGl6ZWRMb2dzXHJcbiAgICAuZmlsdGVyKChsb2cpID0+IGxvZy5hbW91bnQgPiAwICYmIElTU1VFRF9TT1VSQ0VTLmhhcyhTdHJpbmcobG9nLnNvdXJjZSB8fCBcIlwiKS50b1VwcGVyQ2FzZSgpKSlcclxuICAgIC5zbGljZSgwLCA2KVxyXG4gICAgLm1hcCgobG9nKSA9PiAoe1xyXG4gICAgICAuLi5sb2csXHJcbiAgICAgIHN0YXR1c0xhYmVsOiAoc2VyaWFsTmV0TWFwW2xvZy5zZXJpYWxdIHx8IDApIDw9IDAgPyBcIuyCrOyaqeyZhOujjFwiIDogXCLsgqzsmqnqsIDriqVcIixcclxuICAgIH0pKTtcclxuICBjb25zdCBwcmV2aWV3U2VyaWFsID0gYnVpbGRWb3VjaGVyUHJldmlld1NlcmlhbCgpO1xyXG5cclxuICBjb25zdCBwYW5lbFN0eWxlID0ge1xyXG4gICAgYmFja2dyb3VuZDogXCJsaW5lYXItZ3JhZGllbnQoMTgwZGVnLCByZ2JhKDE3LDI0LDM5LDAuOTQpLCByZ2JhKDEwLDE1LDI3LDAuOTgpKVwiLFxyXG4gICAgYm9yZGVyOiBcIjFweCBzb2xpZCByZ2JhKDI0NSwgMjAwLCA4NywgMC4xNClcIixcclxuICAgIGJvcmRlclJhZGl1czogMjIsXHJcbiAgICBwYWRkaW5nOiBpc01vYmlsZSA/IFwiMTZweCAxNHB4XCIgOiBcIjIycHhcIixcclxuICAgIGJveFNoYWRvdzogXCIwIDIycHggNjBweCByZ2JhKDAsMCwwLDAuMjYpXCIsXHJcbiAgICBtYXJnaW5Cb3R0b206IDE4LFxyXG4gIH07XHJcbiAgY29uc3QgaW5wdXRTdHlsZSA9IHtcclxuICAgIHdpZHRoOiBcIjEwMCVcIixcclxuICAgIGJveFNpemluZzogXCJib3JkZXItYm94XCIsXHJcbiAgICBwYWRkaW5nOiBcIjEycHggMTRweFwiLFxyXG4gICAgYm9yZGVyUmFkaXVzOiAxMixcclxuICAgIGJvcmRlcjogXCIxcHggc29saWQgcmdiYSgyNTUsMjU1LDI1NSwwLjEyKVwiLFxyXG4gICAgYmFja2dyb3VuZDogXCJyZ2JhKDI1NSwyNTUsMjU1LDAuMDYpXCIsXHJcbiAgICBjb2xvcjogXCIjZmZmXCIsXHJcbiAgICBmb250U2l6ZTogMTQsXHJcbiAgICBvdXRsaW5lOiBcIm5vbmVcIixcclxuICB9O1xyXG4gIGNvbnN0IGxhYmVsU3R5bGUgPSB7IGZvbnRTaXplOiAxMiwgY29sb3I6IFwicmdiYSgyNTUsMjU1LDI1NSwwLjY0KVwiLCBtYXJnaW5Cb3R0b206IDYsIGRpc3BsYXk6IFwiYmxvY2tcIiB9O1xyXG4gIGNvbnN0IGJ1dHRvblN0eWxlID0gKGJhY2tncm91bmQsIGNvbG9yID0gXCIjZmZmXCIpID0+ICh7XHJcbiAgICBib3JkZXI6IFwibm9uZVwiLFxyXG4gICAgYm9yZGVyUmFkaXVzOiAxMixcclxuICAgIHBhZGRpbmc6IFwiMTJweCAxNnB4XCIsXHJcbiAgICBiYWNrZ3JvdW5kLFxyXG4gICAgY29sb3IsXHJcbiAgICBmb250V2VpZ2h0OiA4MDAsXHJcbiAgICBjdXJzb3I6IFwicG9pbnRlclwiLFxyXG4gIH0pO1xyXG4gIGNvbnN0IHZvdWNoZXJDYXJkU3R5bGUgPSB7XHJcbiAgICBwb3NpdGlvbjogXCJyZWxhdGl2ZVwiLFxyXG4gICAgb3ZlcmZsb3c6IFwiaGlkZGVuXCIsXHJcbiAgICBib3JkZXJSYWRpdXM6IDI0LFxyXG4gICAgcGFkZGluZzogaXNNb2JpbGUgPyBcIjE4cHggMTZweFwiIDogXCIyMnB4IDIwcHhcIixcclxuICAgIGJhY2tncm91bmQ6IFwibGluZWFyLWdyYWRpZW50KDEzNWRlZywgcmdiYSgxOSwyNCwzNiwwLjk4KSAwJSwgcmdiYSgzMywyMiw1LDAuOTIpIDUwJSwgcmdiYSgxOSwyNCwzNiwwLjk4KSAxMDAlKVwiLFxyXG4gICAgYm9yZGVyOiBcIjFweCBzb2xpZCByZ2JhKDI0NSwgMjAwLCA4NywgMC4zMilcIixcclxuICAgIGJveFNoYWRvdzogXCIwIDE4cHggNDRweCByZ2JhKDAsMCwwLDAuMzIpXCIsXHJcbiAgfTtcclxuXHJcbiAgY29uc3QgaGFuZGxlSXNzdWUgPSBhc3luYyAoKSA9PiB7XHJcbiAgICBpZiAoIWlzc3VlRm9ybS5tZW1iZXJJZCkge1xyXG4gICAgICBzZXRUb2FzdChcIuyngOq4ie2VoCDtmozsm5DsnYQg7ISg7YOd7ZWY7IS47JqULlwiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYgKCFhbW91bnRWYWx1ZSB8fCBhbW91bnRWYWx1ZSA8PSAwKSB7XHJcbiAgICAgIHNldFRvYXN0KFwi6riI7JWh7J2EIOyeheugpe2VmOyEuOyalC5cIik7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmIChhbW91bnRWYWx1ZSA+IDEwMDAwMDAwMCkge1xyXG4gICAgICBzZXRUb2FzdChcIuq4iOyVoeydtCDrhIjrrLQg7YG964uI64ukLlwiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHNlcmlhbCA9IGdlbmVyYXRlVm91Y2hlclNlcmlhbCgpO1xyXG4gICAgdHJ5IHtcclxuICAgICAgc2V0U3VibWl0dGluZyh0cnVlKTtcclxuICAgICAgYXdhaXQgYXBpSnNvbihcIi9hcGkvdm91Y2hlcnMvaXNzdWVcIiwge1xyXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgICAgbWVtYmVySWQ6IGlzc3VlRm9ybS5tZW1iZXJJZCxcclxuICAgICAgICAgIHR5cGVDb2RlOiBWSVBfVk9VQ0hFUl9UWVBFLFxyXG4gICAgICAgICAgYW1vdW50OiBpc3N1ZU1vZGUgPT09IFwi7LCo6rCQXCIgPyAtTWF0aC5hYnMoYW1vdW50VmFsdWUpIDogTWF0aC5hYnMoYW1vdW50VmFsdWUpLFxyXG4gICAgICAgICAgc291cmNlOiBpc3N1ZU1vZGUgPT09IFwi7LCo6rCQXCIgPyBcIkFETUlOX0RFRFVDVFwiIDogXCJBRE1JTlwiLFxyXG4gICAgICAgICAgcmVmZXJlbmNlSWQ6IHNlcmlhbCxcclxuICAgICAgICAgIGRlc2NyaXB0aW9uOiBidWlsZFZvdWNoZXJEZXNjcmlwdGlvbihpc3N1ZUZvcm0uZGVzY3JpcHRpb24sIGlzc3VlRm9ybS5pc3N1ZVJlZ2lvbiksXHJcbiAgICAgICAgICB0YXJnZXRUeXBlOiBcIm1lbWJlclwiLFxyXG4gICAgICAgIH0pLFxyXG4gICAgICB9KTtcclxuICAgICAgYXdhaXQgcmVsb2FkVm91Y2hlckRhdGEoKTtcclxuICAgICAgc2V0VG9hc3QoaXNzdWVNb2RlID09PSBcIuywqOqwkFwiID8gXCJWSVAg7IOB7ZKI6raMIOywqOqwkCDsmYTro4xcIiA6IFwiVklQIOyDge2SiOq2jCDsp4DquIkg7JmE66OMXCIpO1xyXG4gICAgICBzZXRJc3N1ZUZvcm0oeyBtZW1iZXJJZDogXCJcIiwgbWVtYmVyTmFtZTogXCJcIiwgYW1vdW50OiBcIlwiLCBpc3N1ZVJlZ2lvbjogXCJcIiwgZGVzY3JpcHRpb246IFwiXCIgfSk7XHJcbiAgICAgIHNldE1lbWJlclNlYXJjaChcIlwiKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIHNldFRvYXN0KGVycm9yLm1lc3NhZ2UgfHwgXCLsg4Htkojqtowg7LKY66as7JeQIOyLpO2MqO2WiOyKteuLiOuLpC5cIik7XHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBzZXRTdWJtaXR0aW5nKGZhbHNlKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICByZXR1cm4gKFxyXG4gICAgPGRpdiBzdHlsZT17eyBtYXhXaWR0aDogMTIwMCwgbWFyZ2luOiBcIjAgYXV0b1wiLCBwYWRkaW5nOiBpc01vYmlsZSA/IFwiMTJweCAxMHB4IDg4cHhcIiA6IFwiMThweCAxOHB4IDk2cHhcIiwgY29sb3I6IFwiI2ZmZlwiIH19PlxyXG4gICAgICB7dG9hc3QgPyAoXHJcbiAgICAgICAgPGRpdiBzdHlsZT17eyBwb3NpdGlvbjogXCJmaXhlZFwiLCB0b3A6IDIwLCByaWdodDogMjAsIHpJbmRleDogMTAwMCwgcGFkZGluZzogXCIxMnB4IDE2cHhcIiwgYm9yZGVyUmFkaXVzOiAxMiwgYmFja2dyb3VuZDogXCJyZ2JhKDE1LDIzLDQyLDAuOTUpXCIsIGJvcmRlcjogXCIxcHggc29saWQgcmdiYSgyNDUsMjAwLDg3LDAuMjgpXCIsIGJveFNoYWRvdzogXCIwIDE2cHggNDBweCByZ2JhKDAsMCwwLDAuMjUpXCIgfX0+XHJcbiAgICAgICAgICB7dG9hc3R9XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICkgOiBudWxsfVxyXG5cclxuICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiBcImZsZXhcIiwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiwgZ2FwOiAxMiwgbWFyZ2luQm90dG9tOiAxOCwgZmxleFdyYXA6IFwid3JhcFwiIH19PlxyXG4gICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gbmF2aWdhdGUoXCIvYWRtaW5cIil9IHN0eWxlPXtidXR0b25TdHlsZShcInJnYmEoMjU1LDI1NSwyNTUsMC4wOClcIil9PuKGkCDrj4zslYTqsIDquLA8L2J1dHRvbj5cclxuICAgICAgICA8aDEgc3R5bGU9e3sgbWFyZ2luOiAwLCBmb250U2l6ZTogaXNNb2JpbGUgPyAyNCA6IDMwLCBmb250V2VpZ2h0OiA5MDAgfX0+8J+On++4jyBWSVAg7IOB7ZKI6raMIOq0gOumrDwvaDE+XHJcbiAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgPGRpdiBzdHlsZT17eyAuLi5wYW5lbFN0eWxlLCBwYWRkaW5nOiBpc01vYmlsZSA/IFwiMTZweCAxNHB4XCIgOiBcIjE4cHhcIiB9fT5cclxuICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6IFwiZ3JpZFwiLCBncmlkVGVtcGxhdGVDb2x1bW5zOiBpc01vYmlsZSA/IFwiMWZyIDFmclwiIDogXCJyZXBlYXQoNCwgbWlubWF4KDAsIDFmcikpXCIsIGdhcDogMTIgfX0+XHJcbiAgICAgICAgICB7c3VtbWFyeUNhcmRzLm1hcCgoY2FyZCkgPT4gKFxyXG4gICAgICAgICAgICA8ZGl2IGtleT17Y2FyZC5sYWJlbH0gc3R5bGU9e3sgYm9yZGVyUmFkaXVzOiAxOCwgcGFkZGluZzogXCIxNnB4IDE2cHhcIiwgYmFja2dyb3VuZDogXCJsaW5lYXItZ3JhZGllbnQoMTgwZGVnLCByZ2JhKDI1NSwyNTUsMjU1LDAuMDYpLCByZ2JhKDI1NSwyNTUsMjU1LDAuMDMpKVwiLCBib3JkZXI6IFwiMXB4IHNvbGlkIHJnYmEoMjU1LDI1NSwyNTUsMC4wOClcIiB9fT5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAxMiwgY29sb3I6IFwicmdiYSgyNTUsMjU1LDI1NSwwLjY0KVwiLCBtYXJnaW5Cb3R0b206IDEwIH19PntjYXJkLmxhYmVsfTwvZGl2PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6IGlzTW9iaWxlID8gMTggOiAyMiwgZm9udFdlaWdodDogOTAwLCBjb2xvcjogXCIjZjhkOTc4XCIgfX0+e2NhcmQudmFsdWV9PC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgKSl9XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgPGRpdiBzdHlsZT17eyAuLi5wYW5lbFN0eWxlLCBkaXNwbGF5OiBcImdyaWRcIiwgZ3JpZFRlbXBsYXRlQ29sdW1uczogaXNNb2JpbGUgPyBcIjFmclwiIDogXCJtaW5tYXgoMCwgMS4wNWZyKSBtaW5tYXgoMzIwcHgsIDAuOTVmcilcIiwgZ2FwOiAxOCB9fT5cclxuICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiBcImZsZXhcIiwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiwgZ2FwOiA4LCBtYXJnaW5Cb3R0b206IDE0IH19PlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAxNywgZm9udFdlaWdodDogODAwIH19PuyDge2SiOq2jCDsp4DquIkgLyDssKjqsJA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiBcImlubGluZS1mbGV4XCIsIGJvcmRlclJhZGl1czogOTk5LCBwYWRkaW5nOiA0LCBiYWNrZ3JvdW5kOiBcInJnYmEoMjU1LDI1NSwyNTUsMC4wNilcIiwgYm9yZGVyOiBcIjFweCBzb2xpZCByZ2JhKDI1NSwyNTUsMjU1LDAuMDgpXCIgfX0+XHJcbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0SXNzdWVNb2RlKFwi7KeA6riJXCIpfSBzdHlsZT17eyAuLi5idXR0b25TdHlsZShpc3N1ZU1vZGUgPT09IFwi7KeA6riJXCIgPyBcImxpbmVhci1ncmFkaWVudCg5MGRlZywjZjBiOTBiLCNmOGQ5NzgpXCIgOiBcInRyYW5zcGFyZW50XCIsIGlzc3VlTW9kZSA9PT0gXCLsp4DquIlcIiA/IFwiIzExMTgyN1wiIDogXCJyZ2JhKDI1NSwyNTUsMjU1LDAuNylcIiksIHBhZGRpbmc6IFwiOHB4IDE0cHhcIiwgYm9yZGVyUmFkaXVzOiA5OTkgfX0+7KeA6riJPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0SXNzdWVNb2RlKFwi7LCo6rCQXCIpfSBzdHlsZT17eyAuLi5idXR0b25TdHlsZShpc3N1ZU1vZGUgPT09IFwi7LCo6rCQXCIgPyBcInJnYmEoMjM5LDY4LDY4LDAuOTIpXCIgOiBcInRyYW5zcGFyZW50XCIsIFwiI2ZmZlwiKSwgcGFkZGluZzogXCI4cHggMTRweFwiLCBib3JkZXJSYWRpdXM6IDk5OSB9fT7ssKjqsJA8L2J1dHRvbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6IFwiZ3JpZFwiLCBncmlkVGVtcGxhdGVDb2x1bW5zOiBcIjFmclwiLCBnYXA6IDEyIH19PlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHBvc2l0aW9uOiBcInJlbGF0aXZlXCIgfX0+XHJcbiAgICAgICAgICAgICAgPGxhYmVsIHN0eWxlPXtsYWJlbFN0eWxlfT7tmozsm5Ag6rKA7IOJPC9sYWJlbD5cclxuICAgICAgICAgICAgICA8aW5wdXRcclxuICAgICAgICAgICAgICAgIHN0eWxlPXtpbnB1dFN0eWxlfVxyXG4gICAgICAgICAgICAgICAgdmFsdWU9e21lbWJlclNlYXJjaH1cclxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwi7J2066aEIOuYkOuKlCDsoITtmZTrsojtmLgg6rKA7IOJXCJcclxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgc2V0TWVtYmVyU2VhcmNoKGV2ZW50LnRhcmdldC52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgIHNldFNob3dNZW1iZXJEcm9wZG93bih0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgaWYgKCFldmVudC50YXJnZXQudmFsdWUudHJpbSgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0SXNzdWVGb3JtKChwcmV2KSA9PiAoeyAuLi5wcmV2LCBtZW1iZXJJZDogXCJcIiwgbWVtYmVyTmFtZTogXCJcIiB9KSk7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgICAgICBvbkZvY3VzPXsoKSA9PiBzZXRTaG93TWVtYmVyRHJvcGRvd24odHJ1ZSl9XHJcbiAgICAgICAgICAgICAgICBvbkJsdXI9eygpID0+IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHNldFNob3dNZW1iZXJEcm9wZG93bihmYWxzZSksIDE1MCl9XHJcbiAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICB7c2hvd01lbWJlckRyb3Bkb3duICYmIGZpbHRlcmVkTWVtYmVycy5sZW5ndGggPiAwID8gKFxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLCB6SW5kZXg6IDIwLCB0b3A6IFwiMTAwJVwiLCBsZWZ0OiAwLCByaWdodDogMCwgbWFyZ2luVG9wOiA2LCBib3JkZXJSYWRpdXM6IDE0LCBvdmVyZmxvdzogXCJoaWRkZW5cIiwgYm9yZGVyOiBcIjFweCBzb2xpZCByZ2JhKDI1NSwyNTUsMjU1LDAuMDgpXCIsIGJhY2tncm91bmQ6IFwiIzExMTgyN1wiLCBib3hTaGFkb3c6IFwiMCAxOHB4IDQwcHggcmdiYSgwLDAsMCwwLjM1KVwiIH19PlxyXG4gICAgICAgICAgICAgICAgICB7ZmlsdGVyZWRNZW1iZXJzLm1hcCgobWVtYmVyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWVtYmVySWQgPSBTdHJpbmcobWVtYmVyLm1lbWJlcklkIHx8IG1lbWJlci5pZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleT17bWVtYmVySWR9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uTW91c2VEb3duPXsoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0SXNzdWVGb3JtKChwcmV2KSA9PiAoeyAuLi5wcmV2LCBtZW1iZXJJZCwgbWVtYmVyTmFtZTogbWVtYmVyLm5hbWUgfHwgbWVtYmVySWQgfSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHNldE1lbWJlclNlYXJjaChtZW1iZXIubmFtZSA/IGAke21lbWJlci5uYW1lfSR7bWVtYmVyLnBob25lIHx8IG1lbWJlci5waG9uZU51bWJlciA/IGAgKCR7bWVtYmVyLnBob25lIHx8IG1lbWJlci5waG9uZU51bWJlcn0pYCA6IFwiXCJ9YCA6IG1lbWJlcklkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRTaG93TWVtYmVyRHJvcGRvd24oZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17eyB3aWR0aDogXCIxMDAlXCIsIHRleHRBbGlnbjogXCJsZWZ0XCIsIHBhZGRpbmc6IFwiMTJweCAxNHB4XCIsIGJvcmRlcjogXCJub25lXCIsIGJhY2tncm91bmQ6IFwidHJhbnNwYXJlbnRcIiwgY29sb3I6IFwiI2ZmZlwiLCBjdXJzb3I6IFwicG9pbnRlclwiLCBib3JkZXJCb3R0b206IFwiMXB4IHNvbGlkIHJnYmEoMjU1LDI1NSwyNTUsMC4wNilcIiB9fVxyXG4gICAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRXZWlnaHQ6IDcwMCB9fT57bWVtYmVyLm5hbWUgfHwgbWVtYmVySWR9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBjb2xvcjogXCJyZ2JhKDI1NSwyNTUsMjU1LDAuNTUpXCIgfX0+e21lbWJlci5waG9uZSB8fCBtZW1iZXIucGhvbmVOdW1iZXIgfHwgbWVtYmVySWR9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICB9KX1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICkgOiBudWxsfVxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgPGxhYmVsIHN0eWxlPXtsYWJlbFN0eWxlfT7quIjslaE8L2xhYmVsPlxyXG4gICAgICAgICAgICAgIDxpbnB1dFxyXG4gICAgICAgICAgICAgICAgc3R5bGU9e2lucHV0U3R5bGV9XHJcbiAgICAgICAgICAgICAgICBpbnB1dE1vZGU9XCJudW1lcmljXCJcclxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiMTAwMDBcIlxyXG4gICAgICAgICAgICAgICAgdmFsdWU9e2lzc3VlRm9ybS5hbW91bnQgPyBOdW1iZXIoaXNzdWVGb3JtLmFtb3VudCkudG9Mb2NhbGVTdHJpbmcoXCJrby1LUlwiKSA6IFwiXCJ9XHJcbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRJc3N1ZUZvcm0oKHByZXYpID0+ICh7IC4uLnByZXYsIGFtb3VudDogc2FuaXRpemVBbW91bnQoZXZlbnQudGFyZ2V0LnZhbHVlKSB9KSl9XHJcbiAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6IFwiZmxleFwiLCBnYXA6IDgsIGZsZXhXcmFwOiBcIndyYXBcIiwgbWFyZ2luVG9wOiAxMCB9fT5cclxuICAgICAgICAgICAgICAgIHtbMTAwMDAsIDMwMDAwLCA1MDAwMCwgMTAwMDAwXS5tYXAoKHZhbHVlKSA9PiAoXHJcbiAgICAgICAgICAgICAgICAgIDxidXR0b24ga2V5PXt2YWx1ZX0gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHNldElzc3VlRm9ybSgocHJldikgPT4gKHsgLi4ucHJldiwgYW1vdW50OiBTdHJpbmcodmFsdWUpIH0pKX0gc3R5bGU9e3sgLi4uYnV0dG9uU3R5bGUoXCJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpXCIpLCBwYWRkaW5nOiBcIjhweCAxMnB4XCIsIGZvbnRTaXplOiAxMyB9fT5cclxuICAgICAgICAgICAgICAgICAgICB7dmFsdWUgPT09IDEwMDAwID8gXCIx66eM7JuQXCIgOiB2YWx1ZSA9PT0gMzAwMDAgPyBcIjPrp4zsm5BcIiA6IHZhbHVlID09PSA1MDAwMCA/IFwiNeunjOybkFwiIDogXCIxMOunjOybkFwifVxyXG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICkpfVxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgPGxhYmVsIHN0eWxlPXtsYWJlbFN0eWxlfT7rsJztlonsp4Dsl60gKOyEoO2DnSk8L2xhYmVsPlxyXG4gICAgICAgICAgICAgIDxpbnB1dFxyXG4gICAgICAgICAgICAgICAgc3R5bGU9e2lucHV0U3R5bGV9XHJcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIuyYiCkg7Jq47IKwIC8g67aA7IKwIC8g7ISc7Jq4IOqwleuCqCAvIOygnOyjvFwiXHJcbiAgICAgICAgICAgICAgICB2YWx1ZT17aXNzdWVGb3JtLmlzc3VlUmVnaW9ufVxyXG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0SXNzdWVGb3JtKChwcmV2KSA9PiAoeyAuLi5wcmV2LCBpc3N1ZVJlZ2lvbjogZXZlbnQudGFyZ2V0LnZhbHVlIH0pKX1cclxuICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgPGxhYmVsIHN0eWxlPXtsYWJlbFN0eWxlfT7sgqzsnKA8L2xhYmVsPlxyXG4gICAgICAgICAgICAgIDxpbnB1dFxyXG4gICAgICAgICAgICAgICAgc3R5bGU9e2lucHV0U3R5bGV9XHJcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17aXNzdWVNb2RlID09PSBcIuywqOqwkFwiID8gXCLssKjqsJAg7IKs7JygXCIgOiBcIuyngOq4iSDsgqzsnKBcIn1cclxuICAgICAgICAgICAgICAgIHZhbHVlPXtpc3N1ZUZvcm0uZGVzY3JpcHRpb259XHJcbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRJc3N1ZUZvcm0oKHByZXYpID0+ICh7IC4uLnByZXYsIGRlc2NyaXB0aW9uOiBldmVudC50YXJnZXQudmFsdWUgfSkpfVxyXG4gICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAge3NlbGVjdGVkTWVtYmVyQmFsYW5jZSA/IChcclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGJvcmRlclJhZGl1czogMTQsIHBhZGRpbmc6IFwiMTJweCAxNHB4XCIsIGJhY2tncm91bmQ6IFwicmdiYSgyNTUsMjU1LDI1NSwwLjA1KVwiLCBib3JkZXI6IFwiMXB4IHNvbGlkIHJnYmEoMjU1LDI1NSwyNTUsMC4wOClcIiwgZm9udFNpemU6IDEzLCBjb2xvcjogXCJyZ2JhKDI1NSwyNTUsMjU1LDAuOClcIiB9fT5cclxuICAgICAgICAgICAgICAgIO2YhOyerCDrs7TsnKAg6riI7JWhIHtmb3JtYXRWb3VjaGVyQW1vdW50KHNlbGVjdGVkTWVtYmVyQmFsYW5jZS50b3RhbCl9IMK3IOuwnO2WiSDsnqXsiJgge21lbWJlcklzc3VlQ291bnRzW3NlbGVjdGVkTWVtYmVyQmFsYW5jZS5pZF0gfHwgMH3snqVcclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgKSA6IG51bGx9XHJcblxyXG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBkaXNhYmxlZD17c3VibWl0dGluZ30gb25DbGljaz17aGFuZGxlSXNzdWV9IHN0eWxlPXt7IC4uLmJ1dHRvblN0eWxlKGlzc3VlTW9kZSA9PT0gXCLssKjqsJBcIiA/IFwicmdiYSgyMzksNjgsNjgsMC45MilcIiA6IFwibGluZWFyLWdyYWRpZW50KDkwZGVnLCNmMGI5MGIsI2Y4ZDk3OClcIiwgaXNzdWVNb2RlID09PSBcIuywqOqwkFwiID8gXCIjZmZmXCIgOiBcIiMxMTE4MjdcIiksIG9wYWNpdHk6IHN1Ym1pdHRpbmcgPyAwLjU1IDogMSB9fT5cclxuICAgICAgICAgICAgICB7c3VibWl0dGluZyA/IFwi7LKY66asIOykkS4uLlwiIDogaXNzdWVNb2RlID09PSBcIuywqOqwkFwiID8gXCJWSVAg7IOB7ZKI6raMIOywqOqwkO2VmOq4sFwiIDogXCJWSVAg7IOB7ZKI6raMIOyngOq4ie2VmOq4sFwifVxyXG4gICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogMTcsIGZvbnRXZWlnaHQ6IDgwMCwgbWFyZ2luQm90dG9tOiAxNCB9fT7sg4Htkojqtowg66+466as67O06riwPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt2b3VjaGVyQ2FyZFN0eWxlfT5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLCBpbnNldDogMCwgYmFja2dyb3VuZDogXCJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCByZ2JhKDI1NSwyNTUsMjU1LDAuMTIpLCB0cmFuc3BhcmVudCA0MiUpXCIsIHBvaW50ZXJFdmVudHM6IFwibm9uZVwiIH19IC8+XHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogXCJmbGV4XCIsIGp1c3RpZnlDb250ZW50OiBcInNwYWNlLWJldHdlZW5cIiwgYWxpZ25JdGVtczogXCJmbGV4LXN0YXJ0XCIsIGdhcDogMTIsIG1hcmdpbkJvdHRvbTogMTggfX0+XHJcbiAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6IDE0LCBjb2xvcjogXCIjZjhkOTc4XCIsIGZvbnRXZWlnaHQ6IDgwMCB9fT7wn46f77iPIFZJUCDsg4Htkojqtow8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luVG9wOiA2LCBmb250U2l6ZTogMTMsIGNvbG9yOiBcInJnYmEoMjU1LDI1NSwyNTUsMC43MilcIiB9fT7sp4Dsl63qs7XsnKDrsJzsoITtlIzrnqvtj7w8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGJvcmRlclJhZGl1czogOTk5LCBwYWRkaW5nOiBcIjZweCAxMHB4XCIsIGJhY2tncm91bmQ6IGlzc3VlTW9kZSA9PT0gXCLssKjqsJBcIiA/IFwicmdiYSgyMzksNjgsNjgsMC4xOClcIiA6IFwicmdiYSgxNiwxODUsMTI5LDAuMTgpXCIsIGJvcmRlcjogYDFweCBzb2xpZCAke2lzc3VlTW9kZSA9PT0gXCLssKjqsJBcIiA/IFwicmdiYSgyMzksNjgsNjgsMC4zNSlcIiA6IFwicmdiYSgxNiwxODUsMTI5LDAuMzUpXCJ9YCwgY29sb3I6IGlzc3VlTW9kZSA9PT0gXCLssKjqsJBcIiA/IFwiI2ZjYTVhNVwiIDogXCIjODZlZmFjXCIsIGZvbnRTaXplOiAxMiwgZm9udFdlaWdodDogODAwIH19PlxyXG4gICAgICAgICAgICAgICAge2lzc3VlTW9kZSA9PT0gXCLssKjqsJBcIiA/IFwi7ZqM7IiYIOyYiOyglVwiIDogXCLsgqzsmqnqsIDriqVcIn1cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiBpc01vYmlsZSA/IDI4IDogMzQsIGZvbnRXZWlnaHQ6IDkwMCwgY29sb3I6IFwiI2ZmZjRjMlwiLCBsZXR0ZXJTcGFjaW5nOiBcIi0wLjAzZW1cIiwgbWFyZ2luQm90dG9tOiAxOCB9fT5cclxuICAgICAgICAgICAgICB7YW1vdW50VmFsdWUgPiAwID8gZm9ybWF0Vm91Y2hlckFtb3VudChhbW91bnRWYWx1ZSkgOiBcIuq4iOyVoSDsnoXroKVcIn1cclxuICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6IFwiZ3JpZFwiLCBncmlkVGVtcGxhdGVDb2x1bW5zOiBpc01vYmlsZSA/IFwiMWZyXCIgOiBcIjFmciAxZnJcIiwgZ2FwOiAxMCwgZm9udFNpemU6IDEzLCBjb2xvcjogXCJyZ2JhKDI1NSwyNTUsMjU1LDAuNzQpXCIgfX0+XHJcbiAgICAgICAgICAgICAgPGRpdj7rjIDsg4E6IHtzZWxlY3RlZE1lbWJlcj8ubmFtZSB8fCBpc3N1ZUZvcm0ubWVtYmVyTmFtZSB8fCBcIu2ajOybkCDshKDtg51cIn08L2Rpdj5cclxuICAgICAgICAgICAgICA8ZGl2PuuwnO2WieydvDoge2Zvcm1hdFZvdWNoZXJEYXRlKG5ldyBEYXRlKCkpfTwvZGl2PlxyXG4gICAgICAgICAgICAgIHtpc3N1ZUZvcm0uaXNzdWVSZWdpb24udHJpbSgpID8gPGRpdj7rsJztlonsp4Dsl606IHtpc3N1ZUZvcm0uaXNzdWVSZWdpb24udHJpbSgpfTwvZGl2PiA6IG51bGx9XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250RmFtaWx5OiBcIkNvbnNvbGFzLCBNb25hY28sIG1vbm9zcGFjZVwiLCBsZXR0ZXJTcGFjaW5nOiBcIjAuMDVlbVwiIH19PlNFUklBTDoge3ByZXZpZXdTZXJpYWx9PC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgPGRpdiBzdHlsZT17cGFuZWxTdHlsZX0+XHJcbiAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiBcImZsZXhcIiwganVzdGlmeUNvbnRlbnQ6IFwic3BhY2UtYmV0d2VlblwiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBnYXA6IDEyLCBtYXJnaW5Cb3R0b206IDE0LCBmbGV4V3JhcDogXCJ3cmFwXCIgfX0+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAxNywgZm9udFdlaWdodDogODAwIH19PuuztOycoCDtmITtmak8L2Rpdj5cclxuICAgICAgICAgIDxpbnB1dCBzdHlsZT17eyAuLi5pbnB1dFN0eWxlLCB3aWR0aDogaXNNb2JpbGUgPyBcIjEwMCVcIiA6IDI0MCB9fSBwbGFjZWhvbGRlcj1cIu2ajOybkCDqsoDsg4lcIiB2YWx1ZT17ZmlsdGVycy5tZW1iZXJ9IG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEZpbHRlcnMoKHByZXYpID0+ICh7IC4uLnByZXYsIG1lbWJlcjogZXZlbnQudGFyZ2V0LnZhbHVlIH0pKX0gLz5cclxuICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgPGRpdiBzdHlsZT17eyBvdmVyZmxvd1g6IFwiYXV0b1wiIH19PlxyXG4gICAgICAgICAgPHRhYmxlIHN0eWxlPXt7IHdpZHRoOiBcIjEwMCVcIiwgYm9yZGVyQ29sbGFwc2U6IFwiY29sbGFwc2VcIiwgbWluV2lkdGg6IDcyMCB9fT5cclxuICAgICAgICAgICAgPHRoZWFkPlxyXG4gICAgICAgICAgICAgIDx0ciBzdHlsZT17eyBib3JkZXJCb3R0b206IFwiMXB4IHNvbGlkIHJnYmEoMjU1LDI1NSwyNTUsMC4xKVwiLCBjb2xvcjogXCJyZ2JhKDI1NSwyNTUsMjU1LDAuNjgpXCIsIGZvbnRTaXplOiAxMiB9fT5cclxuICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyB0ZXh0QWxpZ246IFwibGVmdFwiLCBwYWRkaW5nOiBcIjEycHggMTBweFwiIH19PuydtOumhDwvdGg+XHJcbiAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgdGV4dEFsaWduOiBcInJpZ2h0XCIsIHBhZGRpbmc6IFwiMTJweCAxMHB4XCIgfX0+67O07JygIOq4iOyVoTwvdGg+XHJcbiAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgdGV4dEFsaWduOiBcInJpZ2h0XCIsIHBhZGRpbmc6IFwiMTJweCAxMHB4XCIgfX0+67O07JygIOyepeyImDwvdGg+XHJcbiAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgdGV4dEFsaWduOiBcImxlZnRcIiwgcGFkZGluZzogXCIxMnB4IDEwcHhcIiB9fT7stZzqt7wg67OA64+Z7J28PC90aD5cclxuICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyB0ZXh0QWxpZ246IFwiY2VudGVyXCIsIHBhZGRpbmc6IFwiMTJweCAxMHB4XCIgfX0+7J2066ClPC90aD5cclxuICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICA8L3RoZWFkPlxyXG4gICAgICAgICAgICA8dGJvZHk+XHJcbiAgICAgICAgICAgICAge2xvYWRpbmcgPyAoXHJcbiAgICAgICAgICAgICAgICA8dHI+PHRkIGNvbFNwYW49ezV9IHN0eWxlPXt7IHBhZGRpbmc6IDI4LCB0ZXh0QWxpZ246IFwiY2VudGVyXCIsIGNvbG9yOiBcInJnYmEoMjU1LDI1NSwyNTUsMC40NSlcIiB9fT7rtojrn6zsmKTripQg7KSRLi4uPC90ZD48L3RyPlxyXG4gICAgICAgICAgICAgICkgOiB2aXNpYmxlQmFsYW5jZVJvd3MubGVuZ3RoID09PSAwID8gKFxyXG4gICAgICAgICAgICAgICAgPHRyPjx0ZCBjb2xTcGFuPXs1fSBzdHlsZT17eyBwYWRkaW5nOiAyOCwgdGV4dEFsaWduOiBcImNlbnRlclwiLCBjb2xvcjogXCJyZ2JhKDI1NSwyNTUsMjU1LDAuNDUpXCIgfX0+67O07JygIO2YhO2ZqeydtCDsl4bsirXri4jri6QuPC90ZD48L3RyPlxyXG4gICAgICAgICAgICAgICkgOiB2aXNpYmxlQmFsYW5jZVJvd3MubWFwKChyb3cpID0+IChcclxuICAgICAgICAgICAgICAgIDx0ciBrZXk9e3Jvdy5pZH0gc3R5bGU9e3sgYm9yZGVyQm90dG9tOiBcIjFweCBzb2xpZCByZ2JhKDI1NSwyNTUsMjU1LDAuMDYpXCIgfX0+XHJcbiAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiBcIjE0cHggMTBweFwiIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFdlaWdodDogNzAwIH19Pntyb3cubmFtZX08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAxMiwgY29sb3I6IFwicmdiYSgyNTUsMjU1LDI1NSwwLjQpXCIgfX0+e3Jvdy5pZH08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHBhZGRpbmc6IFwiMTRweCAxMHB4XCIsIHRleHRBbGlnbjogXCJyaWdodFwiLCBmb250V2VpZ2h0OiA4MDAsIGNvbG9yOiBcIiNmOGQ5NzhcIiB9fT57Zm9ybWF0Vm91Y2hlckFtb3VudChyb3cudG90YWwpfTwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiBcIjE0cHggMTBweFwiLCB0ZXh0QWxpZ246IFwicmlnaHRcIiB9fT57KHJvdy5pc3N1ZWRDb3VudCB8fCAwKS50b0xvY2FsZVN0cmluZyhcImtvLUtSXCIpfeyepTwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiBcIjE0cHggMTBweFwiIH19Pntmb3JtYXRWb3VjaGVyRGF0ZShyb3cubGFzdENoYW5nZWRBdCl9PC90ZD5cclxuICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHBhZGRpbmc6IFwiMTRweCAxMHB4XCIsIHRleHRBbGlnbjogXCJjZW50ZXJcIiB9fT5cclxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXHJcbiAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcclxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0RmlsdGVycygocHJldikgPT4gKHsgLi4ucHJldiwgbWVtYmVyOiByb3cubmFtZSB8fCByb3cuaWQgfSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZWRnZXJSZWYuY3VycmVudD8uc2Nyb2xsSW50b1ZpZXcoeyBiZWhhdmlvcjogXCJzbW9vdGhcIiwgYmxvY2s6IFwic3RhcnRcIiB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgIH19XHJcbiAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17eyAuLi5idXR0b25TdHlsZShcInJnYmEoMjU1LDI1NSwyNTUsMC4wOClcIiksIHBhZGRpbmc6IFwiOHB4IDEycHhcIiwgZm9udFNpemU6IDEyIH19XHJcbiAgICAgICAgICAgICAgICAgICAgPlxyXG4gICAgICAgICAgICAgICAgICAgICAg7J2066ClXHJcbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICkpfVxyXG4gICAgICAgICAgICA8L3Rib2R5PlxyXG4gICAgICAgICAgPC90YWJsZT5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgPC9kaXY+XHJcblxyXG4gICAgICA8ZGl2IHN0eWxlPXtwYW5lbFN0eWxlfT5cclxuICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6IFwiZmxleFwiLCBqdXN0aWZ5Q29udGVudDogXCJzcGFjZS1iZXR3ZWVuXCIsIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsIGdhcDogMTIsIG1hcmdpbkJvdHRvbTogMTQsIGZsZXhXcmFwOiBcIndyYXBcIiB9fT5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6IDE3LCBmb250V2VpZ2h0OiA4MDAgfX0+7LWc6re8IOuwnO2WiSDsg4Htkojqtow8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBjb2xvcjogXCJyZ2JhKDI1NSwyNTUsMjU1LDAuNTgpXCIgfX0+7LWc6re8IOyngOq4iSDrgrTsl60g6riw7KSAPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiBcImdyaWRcIiwgZ3JpZFRlbXBsYXRlQ29sdW1uczogaXNNb2JpbGUgPyBcIjFmclwiIDogXCJyZXBlYXQoMiwgbWlubWF4KDAsIDFmcikpXCIsIGdhcDogMTQgfX0+XHJcbiAgICAgICAgICB7cmVjZW50Vm91Y2hlckNhcmRzLmxlbmd0aCA9PT0gMCA/IChcclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBjb2xvcjogXCJyZ2JhKDI1NSwyNTUsMjU1LDAuNDUpXCIsIHBhZGRpbmc6IFwiMTJweCAycHhcIiB9fT7rsJztlonrkJwgVklQIOyDge2SiOq2jOydtCDsl4bsirXri4jri6QuPC9kaXY+XHJcbiAgICAgICAgICApIDogcmVjZW50Vm91Y2hlckNhcmRzLm1hcCgobG9nKSA9PiAoXHJcbiAgICAgICAgICAgIDxkaXYga2V5PXtsb2cuaWR9IHN0eWxlPXt2b3VjaGVyQ2FyZFN0eWxlfT5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHBvc2l0aW9uOiBcImFic29sdXRlXCIsIGluc2V0OiAwLCBiYWNrZ3JvdW5kOiBcImxpbmVhci1ncmFkaWVudCgxMzVkZWcsIHJnYmEoMjU1LDI1NSwyNTUsMC4xMiksIHRyYW5zcGFyZW50IDQyJSlcIiwgcG9pbnRlckV2ZW50czogXCJub25lXCIgfX0gLz5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6IFwiZmxleFwiLCBqdXN0aWZ5Q29udGVudDogXCJzcGFjZS1iZXR3ZWVuXCIsIGFsaWduSXRlbXM6IFwiZmxleC1zdGFydFwiLCBnYXA6IDEwLCBtYXJnaW5Cb3R0b206IDE0IH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogMTQsIGNvbG9yOiBcIiNmOGQ5NzhcIiwgZm9udFdlaWdodDogODAwIH19PvCfjp/vuI8gVklQIOyDge2SiOq2jDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpblRvcDogNCwgZm9udFNpemU6IDEzLCBjb2xvcjogXCJyZ2JhKDI1NSwyNTUsMjU1LDAuNzIpXCIgfX0+7KeA7Jet6rO17Jyg67Cc7KCE7ZSM656r7Y+8PC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgYm9yZGVyUmFkaXVzOiA5OTksIHBhZGRpbmc6IFwiNnB4IDEwcHhcIiwgYmFja2dyb3VuZDogZ2V0Vm91Y2hlclN0YXR1c1N0eWxlKGxvZy5zdGF0dXNMYWJlbCkuYmFja2dyb3VuZCwgYm9yZGVyOiBgMXB4IHNvbGlkICR7Z2V0Vm91Y2hlclN0YXR1c1N0eWxlKGxvZy5zdGF0dXNMYWJlbCkuYm9yZGVyQ29sb3J9YCwgY29sb3I6IGdldFZvdWNoZXJTdGF0dXNTdHlsZShsb2cuc3RhdHVzTGFiZWwpLmNvbG9yLCBmb250U2l6ZTogMTIsIGZvbnRXZWlnaHQ6IDgwMCB9fT57bG9nLnN0YXR1c0xhYmVsfTwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6IGlzTW9iaWxlID8gMjQgOiAzMCwgZm9udFdlaWdodDogOTAwLCBjb2xvcjogXCIjZmZmNGMyXCIsIG1hcmdpbkJvdHRvbTogMTYgfX0+e2Zvcm1hdFZvdWNoZXJBbW91bnQobG9nLmFtb3VudEFicyl9PC9kaXY+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiBcImdyaWRcIiwgZ2FwOiA2LCBmb250U2l6ZTogMTMsIGNvbG9yOiBcInJnYmEoMjU1LDI1NSwyNTUsMC43NClcIiB9fT5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udEZhbWlseTogXCJDb25zb2xhcywgTW9uYWNvLCBtb25vc3BhY2VcIiwgbGV0dGVyU3BhY2luZzogXCIwLjA1ZW1cIiB9fT5TRVJJQUw6IHtsb2cuc2VyaWFsfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdj7rsJztlonsnbw6IHtmb3JtYXRWb3VjaGVyRGF0ZShsb2cuY3JlYXRlZEF0KX08L2Rpdj5cclxuICAgICAgICAgICAgICAgIHtsb2cuaXNzdWVSZWdpb24gPyA8ZGl2PuuwnO2WieyngOyXrToge2xvZy5pc3N1ZVJlZ2lvbn08L2Rpdj4gOiBudWxsfVxyXG4gICAgICAgICAgICAgICAgPGRpdj7sp4DquIkg64yA7IOBOiB7bG9nLm1lbWJlck5hbWUgfHwgbG9nLm1lbWJlcklkIHx8IFwiLVwifTwvZGl2PlxyXG4gICAgICAgICAgICAgICAge2xvZy5zdGF0dXNMYWJlbCA9PT0gXCLsgqzsmqnsmYTro4xcIiAmJiAobG9nLmRlc2NTaG9wTmFtZSB8fCBsb2cuc2hvcE5hbWUpID8gKFxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGNvbG9yOiBcIiNmY2E1YTVcIiB9fT7sgqzsmqnsspg6IHtsb2cuZGVzY1Nob3BOYW1lIHx8IGxvZy5zaG9wTmFtZX08L2Rpdj5cclxuICAgICAgICAgICAgICAgICkgOiBudWxsfVxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICkpfVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuXHJcbiAgICAgIDxkaXYgcmVmPXtsZWRnZXJSZWZ9IHN0eWxlPXtwYW5lbFN0eWxlfT5cclxuICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAxNywgZm9udFdlaWdodDogODAwLCBtYXJnaW5Cb3R0b206IDE0IH19PuyDge2SiOq2jCDsm5DsnqU8L2Rpdj5cclxuICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6IFwiZ3JpZFwiLCBncmlkVGVtcGxhdGVDb2x1bW5zOiBpc01vYmlsZSA/IFwiMWZyIDFmclwiIDogXCJyZXBlYXQoNCwgbWlubWF4KDAsIDFmcikpXCIsIGdhcDogMTAsIG1hcmdpbkJvdHRvbTogMTQgfX0+XHJcbiAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICA8bGFiZWwgc3R5bGU9e2xhYmVsU3R5bGV9PuyLnOyekeydvDwvbGFiZWw+XHJcbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiZGF0ZVwiIHN0eWxlPXtpbnB1dFN0eWxlfSB2YWx1ZT17ZmlsdGVycy5mcm9tfSBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWx0ZXJzKChwcmV2KSA9PiAoeyAuLi5wcmV2LCBmcm9tOiBldmVudC50YXJnZXQudmFsdWUgfSkpfSAvPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICA8bGFiZWwgc3R5bGU9e2xhYmVsU3R5bGV9PuyiheujjOydvDwvbGFiZWw+XHJcbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiZGF0ZVwiIHN0eWxlPXtpbnB1dFN0eWxlfSB2YWx1ZT17ZmlsdGVycy50b30gb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0RmlsdGVycygocHJldikgPT4gKHsgLi4ucHJldiwgdG86IGV2ZW50LnRhcmdldC52YWx1ZSB9KSl9IC8+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgIDxsYWJlbCBzdHlsZT17bGFiZWxTdHlsZX0+67Cp7ZalPC9sYWJlbD5cclxuICAgICAgICAgICAgPHNlbGVjdCBzdHlsZT17aW5wdXRTdHlsZX0gdmFsdWU9e2ZpbHRlcnMuZGlyZWN0aW9ufSBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWx0ZXJzKChwcmV2KSA9PiAoeyAuLi5wcmV2LCBkaXJlY3Rpb246IGV2ZW50LnRhcmdldC52YWx1ZSB9KSl9PlxyXG4gICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJcIj7soITssrQ8L29wdGlvbj5cclxuICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwi7KeA6riJXCI+7KeA6riJPC9vcHRpb24+XHJcbiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIuywqOqwkFwiPuywqOqwkDwvb3B0aW9uPlxyXG4gICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCLsgqzsmqlcIj7sgqzsmqk8L29wdGlvbj5cclxuICAgICAgICAgICAgPC9zZWxlY3Q+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgIDxsYWJlbCBzdHlsZT17bGFiZWxTdHlsZX0+7IOB7YOcPC9sYWJlbD5cclxuICAgICAgICAgICAgPHNlbGVjdCBzdHlsZT17aW5wdXRTdHlsZX0gdmFsdWU9e2ZpbHRlcnMuc3RhdHVzfSBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRGaWx0ZXJzKChwcmV2KSA9PiAoeyAuLi5wcmV2LCBzdGF0dXM6IGV2ZW50LnRhcmdldC52YWx1ZSB9KSl9PlxyXG4gICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJcIj7soITssrQ8L29wdGlvbj5cclxuICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwi7IKs7Jqp6rCA64qlXCI+7IKs7Jqp6rCA64qlPC9vcHRpb24+XHJcbiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIu2ajOyImOuQqFwiPu2ajOyImOuQqDwvb3B0aW9uPlxyXG4gICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCLsgqzsmqnrkKhcIj7sgqzsmqnrkKg8L29wdGlvbj5cclxuICAgICAgICAgICAgPC9zZWxlY3Q+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgPGRpdiBzdHlsZT17eyBvdmVyZmxvd1g6IFwiYXV0b1wiIH19PlxyXG4gICAgICAgICAgPHRhYmxlIHN0eWxlPXt7IHdpZHRoOiBcIjEwMCVcIiwgYm9yZGVyQ29sbGFwc2U6IFwiY29sbGFwc2VcIiwgbWluV2lkdGg6IDk4MCB9fT5cclxuICAgICAgICAgICAgPHRoZWFkPlxyXG4gICAgICAgICAgICAgIDx0ciBzdHlsZT17eyBib3JkZXJCb3R0b206IFwiMXB4IHNvbGlkIHJnYmEoMjU1LDI1NSwyNTUsMC4xKVwiLCBjb2xvcjogXCJyZ2JhKDI1NSwyNTUsMjU1LDAuNjgpXCIsIGZvbnRTaXplOiAxMiB9fT5cclxuICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyB0ZXh0QWxpZ246IFwibGVmdFwiLCBwYWRkaW5nOiBcIjEycHggMTBweFwiIH19PuydvOyLnDwvdGg+XHJcbiAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgdGV4dEFsaWduOiBcImxlZnRcIiwgcGFkZGluZzogXCIxMnB4IDEwcHhcIiB9fT7snbzroKjrsojtmLg8L3RoPlxyXG4gICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHRleHRBbGlnbjogXCJsZWZ0XCIsIHBhZGRpbmc6IFwiMTJweCAxMHB4XCIgfX0+64yA7IOBPC90aD5cclxuICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyB0ZXh0QWxpZ246IFwibGVmdFwiLCBwYWRkaW5nOiBcIjEycHggMTBweFwiIH19Puuwqe2WpTwvdGg+XHJcbiAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgdGV4dEFsaWduOiBcInJpZ2h0XCIsIHBhZGRpbmc6IFwiMTJweCAxMHB4XCIgfX0+6riI7JWhPC90aD5cclxuICAgICAgICAgICAgICAgIDx0aCBzdHlsZT17eyB0ZXh0QWxpZ246IFwibGVmdFwiLCBwYWRkaW5nOiBcIjEycHggMTBweFwiIH19PuyDge2DnDwvdGg+XHJcbiAgICAgICAgICAgICAgICA8dGggc3R5bGU9e3sgdGV4dEFsaWduOiBcImxlZnRcIiwgcGFkZGluZzogXCIxMnB4IDEwcHhcIiB9fT7rsJztlonsp4Dsl608L3RoPlxyXG4gICAgICAgICAgICAgICAgPHRoIHN0eWxlPXt7IHRleHRBbGlnbjogXCJsZWZ0XCIsIHBhZGRpbmc6IFwiMTJweCAxMHB4XCIgfX0+7IKs7JygPC90aD5cclxuICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICA8L3RoZWFkPlxyXG4gICAgICAgICAgICA8dGJvZHk+XHJcbiAgICAgICAgICAgICAge2ZpbHRlcmVkTG9ncy5sZW5ndGggPT09IDAgPyAoXHJcbiAgICAgICAgICAgICAgICA8dHI+PHRkIGNvbFNwYW49ezh9IHN0eWxlPXt7IHBhZGRpbmc6IDI4LCB0ZXh0QWxpZ246IFwiY2VudGVyXCIsIGNvbG9yOiBcInJnYmEoMjU1LDI1NSwyNTUsMC40NSlcIiB9fT7tkZzsi5ztlaAg7IOB7ZKI6raMIOybkOyepeydtCDsl4bsirXri4jri6QuPC90ZD48L3RyPlxyXG4gICAgICAgICAgICAgICkgOiBmaWx0ZXJlZExvZ3MubWFwKChsb2cpID0+IChcclxuICAgICAgICAgICAgICAgIDx0ciBrZXk9e2xvZy5pZH0gc3R5bGU9e3sgYm9yZGVyQm90dG9tOiBcIjFweCBzb2xpZCByZ2JhKDI1NSwyNTUsMjU1LDAuMDYpXCIgfX0+XHJcbiAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiBcIjE0cHggMTBweFwiIH19Pntmb3JtYXRWb3VjaGVyRGF0ZVRpbWUobG9nLmNyZWF0ZWRBdCl9PC90ZD5cclxuICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHBhZGRpbmc6IFwiMTRweCAxMHB4XCIsIGZvbnRGYW1pbHk6IFwiQ29uc29sYXMsIE1vbmFjbywgbW9ub3NwYWNlXCIsIGNvbG9yOiBcIiNmOGQ5NzhcIiB9fT57bG9nLnNlcmlhbH08L3RkPlxyXG4gICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogXCIxNHB4IDEwcHhcIiB9fT5cclxuICAgICAgICAgICAgICAgICAgICB7U3RyaW5nKGxvZy50YXJnZXRUeXBlIHx8IFwiXCIpID09PSBcInNob3BcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgPyAobG9nLnNob3BOYW1lIHx8IGxvZy5kZXNjU2hvcE5hbWUgfHwgbG9nLnNob3BJZCB8fCBsb2cubWVtYmVySWQgfHwgXCItXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICA6IChsb2cubWVtYmVyTmFtZSB8fCBsb2cubWVtYmVySWQgfHwgXCItXCIpfVxyXG4gICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogXCIxNHB4IDEwcHhcIiB9fT57bG9nLmRpcmVjdGlvbn08L3RkPlxyXG4gICAgICAgICAgICAgICAgICA8dGQgc3R5bGU9e3sgcGFkZGluZzogXCIxNHB4IDEwcHhcIiwgdGV4dEFsaWduOiBcInJpZ2h0XCIsIGZvbnRXZWlnaHQ6IDgwMCwgY29sb3I6IGxvZy5kaXJlY3Rpb24gPT09IFwi7KeA6riJXCIgPyBcIiM4NmVmYWNcIiA6IGxvZy5kaXJlY3Rpb24gPT09IFwi7IKs7JqpXCIgPyBcIiNmY2E1YTVcIiA6IFwiI2ZkYTRhZlwiIH19Pntmb3JtYXRWb3VjaGVyQW1vdW50KGxvZy5hbW91bnRBYnMpfTwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiBcIjE0cHggMTBweFwiLCBjb2xvcjogZ2V0Vm91Y2hlclN0YXR1c1N0eWxlKGxvZy5zdGF0dXNMYWJlbCkuY29sb3IsIGZvbnRXZWlnaHQ6IDgwMCB9fT57bG9nLnN0YXR1c0xhYmVsfTwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgIDx0ZCBzdHlsZT17eyBwYWRkaW5nOiBcIjE0cHggMTBweFwiIH19Pntsb2cuaXNzdWVSZWdpb24gfHwgXCItXCJ9PC90ZD5cclxuICAgICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHBhZGRpbmc6IFwiMTRweCAxMHB4XCIsIGNvbG9yOiBcInJnYmEoMjU1LDI1NSwyNTUsMC43OClcIiB9fT5cclxuICAgICAgICAgICAgICAgICAgICB7bG9nLnJlYXNvbiB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgKFN0cmluZyhsb2cuc291cmNlIHx8IFwiXCIpLnRvVXBwZXJDYXNlKCkgPT09IFwiVk9VQ0hFUl9TSE9QX1RSQU5TRkVSX0lOXCIgJiYgbG9nLmZyb21NZW1iZXJOYW1lXHJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gYCR7bG9nLmZyb21NZW1iZXJOYW1lfSDqsrDsoJwg7IOB7ZKI6raMYFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA6IFwiLVwiKX1cclxuICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgICAgICAgKSl9XHJcbiAgICAgICAgICAgIDwvdGJvZHk+XHJcbiAgICAgICAgICA8L3RhYmxlPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgIDwvZGl2PlxyXG4gICk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIE1lbWJlclZpcFZvdWNoZXJQYW5lbCh7IHdhbGxldFZpZXcgfSkge1xyXG4gIGNvbnN0IFttb3VudE5vZGUsIHNldE1vdW50Tm9kZV0gPSB1c2VTdGF0ZShudWxsKTtcclxuICBjb25zdCBbdGFiSG9zdCwgc2V0VGFiSG9zdF0gPSB1c2VTdGF0ZShudWxsKTtcclxuICBjb25zdCBbdm91Y2hlckJhbGFuY2UsIHNldFZvdWNoZXJCYWxhbmNlXSA9IHVzZVN0YXRlKG51bGwpO1xyXG4gIGNvbnN0IFt2b3VjaGVySGlzdG9yeSwgc2V0Vm91Y2hlckhpc3RvcnldID0gdXNlU3RhdGUoW10pO1xyXG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcclxuICAvLyB3YWxsZXRUYWIg7JmE7KCEIOygnOqxsCwgd2FsbGV0Vmlld+unjCDri6jsnbwg7IOB7YOcXHJcbiAgY29uc3QgaXNWb3VjaGVyID0gd2FsbGV0VmlldyA9PT0gXCJ2b3VjaGVyXCI7XHJcbiAgY29uc3QgaGlkZGVuUGFuZWxSZWYgPSB1c2VSZWYobnVsbCk7XHJcbiAgY29uc3QgcG9pbnRQYW5lbHNSZWYgPSB1c2VSZWYoW10pO1xyXG5cclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgY29uc3QgZW5zdXJlTW91bnROb2RlID0gKCkgPT4ge1xyXG4gICAgICAvLyAxLiDtjKjrhJAg67aE66asOiDqsIHqsIEgc2VsZWN0b3Ig7Jqw7ISg7Iic7JyE66GcIGFuY2hvciDtg5Dsg4lcclxuICAgICAgY29uc3QgcG9pbnRQYW5lbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3NlY3Rpb24uc3UtcGFuZWxbZGF0YS1wb2ludC13YWxsZXQtYW5jaG9yPVwidHJ1ZVwiXScpXHJcbiAgICAgICAgfHwgQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwic2VjdGlvbi5zdS1wYW5lbFwiKSkuZmluZChwYW5lbCA9PiBTdHJpbmcocGFuZWwudGV4dENvbnRlbnQgfHwgXCJcIikuaW5jbHVkZXMoXCLwn5KwIO2PrOyduO2KuCDqtIDrpqxcIikpO1xyXG4gICAgICBjb25zdCBzaG9wUGFuZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzZWN0aW9uLnN1LXBhbmVsW2RhdGEtc2hvcC13YWxsZXQtYW5jaG9yPVwidHJ1ZVwiXScpXHJcbiAgICAgICAgfHwgQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwic2VjdGlvbi5zdS1wYW5lbFwiKSkuZmluZChwYW5lbCA9PiBTdHJpbmcocGFuZWwudGV4dENvbnRlbnQgfHwgXCJcIikuaW5jbHVkZXMoXCLwn4+qIOyDgeygkCDtj6zsnbjtirhcIikpO1xyXG4gICAgICBjb25zdCB2aXBQYW5lbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3NlY3Rpb24uc3UtcGFuZWxbZGF0YS12aXAtd2FsbGV0LWFuY2hvcj1cInRydWVcIl0nKVxyXG4gICAgICAgIHx8IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcInNlY3Rpb24uc3UtcGFuZWxcIikpLmZpbmQocGFuZWwgPT4gU3RyaW5nKHBhbmVsLnRleHRDb250ZW50IHx8IFwiXCIpLmluY2x1ZGVzKFwi8J+On++4jyBWSVAg7IOB7ZKI6raMXCIpKTtcclxuXHJcbiAgICAgIC8vIDIuIO2PrOyduO2KuCDqtIDrpqwg7Yyo64SQ66eMIHBvaW50UGFuZWxzUmVm7JeQIOyggOyepVxyXG4gICAgICBwb2ludFBhbmVsc1JlZi5jdXJyZW50ID0gcG9pbnRQYW5lbCA/IFtwb2ludFBhbmVsXSA6IFtdO1xyXG4gICAgICBpZiAocG9pbnRQYW5lbCkgcG9pbnRQYW5lbC5zZXRBdHRyaWJ1dGUoXCJkYXRhLXdhbGxldC1wb2ludC1wYW5lbFwiLCBcInRydWVcIik7XHJcblxyXG4gICAgICAvLyAzLiDtg60g7Zi47Iqk7Yq464qUIO2PrOyduO2KuCDqtIDrpqwgYW5jaG9yIOq4sOykgFxyXG4gICAgICBjb25zdCBmaXJzdFdhbGxldFBhbmVsID0gcG9pbnRQYW5lbCB8fCBudWxsO1xyXG4gICAgICBpZiAoZmlyc3RXYWxsZXRQYW5lbD8ucGFyZW50RWxlbWVudCkge1xyXG4gICAgICAgIGxldCBuZXh0VGFiSG9zdCA9IGZpcnN0V2FsbGV0UGFuZWwucGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS13YWxsZXQtdGFiLWhvc3Q9XCJ0cnVlXCJdJyk7XHJcbiAgICAgICAgaWYgKCFuZXh0VGFiSG9zdCkge1xyXG4gICAgICAgICAgbmV4dFRhYkhvc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgICAgbmV4dFRhYkhvc3Quc2V0QXR0cmlidXRlKFwiZGF0YS13YWxsZXQtdGFiLWhvc3RcIiwgXCJ0cnVlXCIpO1xyXG4gICAgICAgICAgZmlyc3RXYWxsZXRQYW5lbC5pbnNlcnRBZGphY2VudEVsZW1lbnQoXCJiZWZvcmViZWdpblwiLCBuZXh0VGFiSG9zdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNldFRhYkhvc3QobmV4dFRhYkhvc3QpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNldFRhYkhvc3QobnVsbCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIDQuIFZJUCDsg4Htkojqtowg7Yyo64SQIG1vdW50IG5vZGVcclxuICAgICAgaWYgKCF2aXBQYW5lbCkge1xyXG4gICAgICAgIHNldE1vdW50Tm9kZShudWxsKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChoaWRkZW5QYW5lbFJlZi5jdXJyZW50ICYmIGhpZGRlblBhbmVsUmVmLmN1cnJlbnQgIT09IHZpcFBhbmVsKSB7XHJcbiAgICAgICAgaGlkZGVuUGFuZWxSZWYuY3VycmVudC5zdHlsZS5kaXNwbGF5ID0gXCJcIjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaGlkZGVuUGFuZWxSZWYuY3VycmVudCA9IHZpcFBhbmVsO1xyXG4gICAgICB2aXBQYW5lbC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgIHZpcFBhbmVsLnNldEF0dHJpYnV0ZShcImRhdGEtd2FsbGV0LW9yaWdpbmFsLXZvdWNoZXItcGFuZWxcIiwgXCJ0cnVlXCIpO1xyXG5cclxuICAgICAgbGV0IGhvc3QgPSB2aXBQYW5lbC5wYXJlbnRFbGVtZW50Py5xdWVyeVNlbGVjdG9yKCdbZGF0YS12aXAtbWVtYmVyLXZvdWNoZXItcm9vdD1cInRydWVcIl0nKTtcclxuICAgICAgaWYgKCFob3N0KSB7XHJcbiAgICAgICAgaG9zdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICAgICAgaG9zdC5zZXRBdHRyaWJ1dGUoXCJkYXRhLXZpcC1tZW1iZXItdm91Y2hlci1yb290XCIsIFwidHJ1ZVwiKTtcclxuICAgICAgICB2aXBQYW5lbC5pbnNlcnRBZGphY2VudEVsZW1lbnQoXCJhZnRlcmVuZFwiLCBob3N0KTtcclxuICAgICAgfVxyXG4gICAgICBzZXRNb3VudE5vZGUoaG9zdCk7XHJcbiAgICB9O1xyXG5cclxuICAgIGVuc3VyZU1vdW50Tm9kZSgpO1xyXG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiBlbnN1cmVNb3VudE5vZGUoKSk7XHJcbiAgICBvYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHsgY2hpbGRMaXN0OiB0cnVlLCBzdWJ0cmVlOiB0cnVlIH0pO1xyXG4gICAgcmV0dXJuICgpID0+IHtcclxuICAgICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xyXG4gICAgICBpZiAoaGlkZGVuUGFuZWxSZWYuY3VycmVudCkgaGlkZGVuUGFuZWxSZWYuY3VycmVudC5zdHlsZS5kaXNwbGF5ID0gXCJcIjtcclxuICAgICAgcG9pbnRQYW5lbHNSZWYuY3VycmVudC5mb3JFYWNoKChwYW5lbCkgPT4ge1xyXG4gICAgICAgIHBhbmVsLnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xyXG4gICAgICB9KTtcclxuICAgIH07XHJcbiAgfSwgW10pO1xyXG5cclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgLy8gW1ZJUC1GSVhdW1NUQVRFXSDsg4Htg5wg64uo7J287ZmUXHJcbiAgICBwb2ludFBhbmVsc1JlZi5jdXJyZW50LmZvckVhY2goKHBhbmVsKSA9PiB7XHJcbiAgICAgIHBhbmVsLnN0eWxlLmRpc3BsYXkgPSBpc1ZvdWNoZXIgPyBcIm5vbmVcIiA6IFwiXCI7XHJcbiAgICB9KTtcclxuICAgIGlmIChtb3VudE5vZGUpIHtcclxuICAgICAgbW91bnROb2RlLnN0eWxlLmRpc3BsYXkgPSBpc1ZvdWNoZXIgPyBcIlwiIDogXCJub25lXCI7XHJcbiAgICB9XHJcbiAgICBpZiAodGFiSG9zdCkge1xyXG4gICAgICB0YWJIb3N0LnN0eWxlLmRpc3BsYXkgPSBwb2ludFBhbmVsc1JlZi5jdXJyZW50Lmxlbmd0aCA+IDAgfHwgbW91bnROb2RlID8gXCJcIiA6IFwibm9uZVwiO1xyXG4gICAgfVxyXG4gIH0sIFt3YWxsZXRWaWV3LCBpc1ZvdWNoZXIsIG1vdW50Tm9kZSwgdGFiSG9zdF0pO1xyXG5cclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgY29uc3Qgc2Vzc2lvbiA9IGdldFNlc3Npb24oKTtcclxuICAgIGNvbnN0IGN1cnJlbnRVc2VyID0gZ2V0Q3VycmVudFVzZXIoKTtcclxuICAgIGNvbnN0IG1lbWJlcklkID0gU3RyaW5nKHNlc3Npb24/Lm1lbWJlcklkIHx8IGN1cnJlbnRVc2VyPy5tZW1iZXJJZCB8fCBjdXJyZW50VXNlcj8uaWQgfHwgXCJcIikudHJpbSgpO1xyXG4gICAgaWYgKCFtZW1iZXJJZCkge1xyXG4gICAgICBzZXRWb3VjaGVyQmFsYW5jZShudWxsKTtcclxuICAgICAgc2V0Vm91Y2hlckhpc3RvcnkoW10pO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IG1vdW50ZWQgPSB0cnVlO1xyXG4gICAgY29uc3QgbG9hZFZvdWNoZXJEYXRhID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHNldExvYWRpbmcodHJ1ZSk7XHJcbiAgICAgICAgY29uc3QgW2JhbGFuY2VSZXMsIGhpc3RvcnlSZXNdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xyXG4gICAgICAgICAgZmV0Y2goYCR7VklQX0FQSV9CQVNFfS9hcGkvdm91Y2hlcnMvJHtlbmNvZGVVUklDb21wb25lbnQobWVtYmVySWQpfS9iYWxhbmNlYCkudGhlbigocmVzcG9uc2UpID0+IHJlc3BvbnNlLmpzb24oKSksXHJcbiAgICAgICAgICBmZXRjaChgJHtWSVBfQVBJX0JBU0V9L2FwaS92b3VjaGVycy8ke2VuY29kZVVSSUNvbXBvbmVudChtZW1iZXJJZCl9L2hpc3Rvcnk/bGltaXQ9MzBgKS50aGVuKChyZXNwb25zZSkgPT4gcmVzcG9uc2UuanNvbigpKSxcclxuICAgICAgICBdKTtcclxuICAgICAgICBpZiAoIW1vdW50ZWQpIHJldHVybjtcclxuICAgICAgICBzZXRWb3VjaGVyQmFsYW5jZShiYWxhbmNlUmVzPy5vayA/IGJhbGFuY2VSZXMgOiBudWxsKTtcclxuICAgICAgICBzZXRWb3VjaGVySGlzdG9yeSgoaGlzdG9yeVJlcz8ub2sgPyBoaXN0b3J5UmVzLmhpc3RvcnkgfHwgW10gOiBbXSkubWFwKG5vcm1hbGl6ZVZvdWNoZXJMb2cpKTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBpZiAoIW1vdW50ZWQpIHJldHVybjtcclxuICAgICAgICBzZXRWb3VjaGVyQmFsYW5jZShudWxsKTtcclxuICAgICAgICBzZXRWb3VjaGVySGlzdG9yeShbXSk7XHJcbiAgICAgIH0gZmluYWxseSB7XHJcbiAgICAgICAgaWYgKG1vdW50ZWQpIHNldExvYWRpbmcoZmFsc2UpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGxvYWRWb3VjaGVyRGF0YSgpO1xyXG4gICAgY29uc3QgcmVsb2FkID0gKCkgPT4gbG9hZFZvdWNoZXJEYXRhKCk7XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInN1OnNzb3Q6Y2hhbmdlZFwiLCByZWxvYWQpO1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJzdG9yYWdlXCIsIHJlbG9hZCk7XHJcbiAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICBtb3VudGVkID0gZmFsc2U7XHJcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwic3U6c3NvdDpjaGFuZ2VkXCIsIHJlbG9hZCk7XHJcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwic3RvcmFnZVwiLCByZWxvYWQpO1xyXG4gICAgfTtcclxuICB9LCBbXSk7XHJcblxyXG4gIC8vIFtWSVAtRklYXVtSRU5ERVJdIOuzuOusuCDroIzrjZQg7KGw6rG0IOuLqOydvO2ZlFxyXG4gIGlmICghbW91bnROb2RlIHx8ICFpc1ZvdWNoZXIpIHJldHVybiBudWxsO1xyXG5cclxuICBjb25zdCBhY3RpdmVWb3VjaGVyQ2FyZHMgPSB2b3VjaGVySGlzdG9yeS5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uYW1vdW50ID4gMCkuc2xpY2UoMCwgNik7XHJcbiAgY29uc3QgdmlzaWJsZUhpc3RvcnkgPSB2b3VjaGVySGlzdG9yeS5zbGljZSgwLCAxMCk7XHJcbiAgY29uc3QgdG90YWxBbW91bnQgPSBOdW1iZXIodm91Y2hlckJhbGFuY2U/LnRvdGFsIHx8IDApO1xyXG4gIGNvbnN0IHBhbmVsU3R5bGUgPSB7XHJcbiAgICBiYWNrZ3JvdW5kOiBcImxpbmVhci1ncmFkaWVudCgxODBkZWcsIHJnYmEoMTIsMTgsMzIsMC45OCksIHJnYmEoMTQsMzAsNDIsMC45OCkpXCIsXHJcbiAgICBib3JkZXI6IFwiMXB4IHNvbGlkIHJnYmEoMTE3LCAxODQsIDE5MywgMC4xOClcIixcclxuICAgIGJvcmRlclJhZGl1czogMjAsXHJcbiAgICBwYWRkaW5nOiBcIjE0cHggMTJweFwiLFxyXG4gICAgYm94U2hhZG93OiBcIjAgMjJweCA2MHB4IHJnYmEoMCwwLDAsMC4yNilcIixcclxuICAgIG1hcmdpbkJvdHRvbTogMTQsXHJcbiAgfTtcclxuICBjb25zdCB2b3VjaGVyQ2FyZFN0eWxlID0ge1xyXG4gICAgcG9zaXRpb246IFwicmVsYXRpdmVcIixcclxuICAgIG92ZXJmbG93OiBcImhpZGRlblwiLFxyXG4gICAgYm9yZGVyUmFkaXVzOiAyMCxcclxuICAgIHBhZGRpbmc6IFwiMTZweCAxNHB4XCIsXHJcbiAgICBiYWNrZ3JvdW5kOiBcImxpbmVhci1ncmFkaWVudCgxMzVkZWcsIHJnYmEoMTUsMjksNDUsMC45OCkgMCUsIHJnYmEoMTksNDQsNTMsMC45NikgNTQlLCByZ2JhKDE2LDI3LDQyLDAuOTgpIDEwMCUpXCIsXHJcbiAgICBib3JkZXI6IFwiMXB4IHNvbGlkIHJnYmEoMjQ1LCAyMDgsIDEwMiwgMC4zNClcIixcclxuICAgIGJveFNoYWRvdzogXCIwIDE4cHggNDRweCByZ2JhKDAsMCwwLDAuMzIpXCIsXHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDw+XHJcbiAgICAgIDxzdHlsZT57YFxyXG4gICAgICAgIEBtZWRpYSAobWF4LXdpZHRoOiA3NjhweCkge1xyXG4gICAgICAgICAgW2RhdGEtd2FsbGV0LXRhYi1ob3N0PVwidHJ1ZVwiXSB7XHJcbiAgICAgICAgICAgIG1hcmdpbjogMCAwIDEycHg7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBbZGF0YS13YWxsZXQtcG9pbnQtcGFuZWw9XCJ0cnVlXCJdIHtcclxuICAgICAgICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDE4MGRlZywgcmdiYSgxMSwxOCwzMiwwLjk4KSwgcmdiYSgxNSwyNiw0NCwwLjk4KSkgIWltcG9ydGFudDtcclxuICAgICAgICAgICAgYm9yZGVyOiAxcHggc29saWQgcmdiYSg3MSwgMTI2LCAxNDgsIDAuMTgpICFpbXBvcnRhbnQ7XHJcbiAgICAgICAgICAgIGJveC1zaGFkb3c6IDAgMThweCAzOHB4IHJnYmEoMCwwLDAsMC4yNCkgIWltcG9ydGFudDtcclxuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogMjBweCAhaW1wb3J0YW50O1xyXG4gICAgICAgICAgICBwYWRkaW5nOiAxNHB4IDEycHggIWltcG9ydGFudDtcclxuICAgICAgICAgICAgY29sb3I6ICNlMmU4ZjAgIWltcG9ydGFudDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIFtkYXRhLXdhbGxldC1wb2ludC1wYW5lbD1cInRydWVcIl0gLnN1LXNlY3Rpb25UaXRsZSxcclxuICAgICAgICAgIFtkYXRhLXdhbGxldC1wb2ludC1wYW5lbD1cInRydWVcIl0gZGl2LFxyXG4gICAgICAgICAgW2RhdGEtd2FsbGV0LXBvaW50LXBhbmVsPVwidHJ1ZVwiXSBzcGFuLFxyXG4gICAgICAgICAgW2RhdGEtd2FsbGV0LXBvaW50LXBhbmVsPVwidHJ1ZVwiXSBzdHJvbmcsXHJcbiAgICAgICAgICBbZGF0YS13YWxsZXQtcG9pbnQtcGFuZWw9XCJ0cnVlXCJdIGxhYmVsIHtcclxuICAgICAgICAgICAgY29sb3I6IGluaGVyaXQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBbZGF0YS13YWxsZXQtcG9pbnQtcGFuZWw9XCJ0cnVlXCJdIC5zdS1zZWN0aW9uVGl0bGUge1xyXG4gICAgICAgICAgICBjb2xvcjogI2Y4ZmFmYyAhaW1wb3J0YW50O1xyXG4gICAgICAgICAgICBmb250LXNpemU6IDE1cHggIWltcG9ydGFudDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIFtkYXRhLXdhbGxldC1wb2ludC1wYW5lbD1cInRydWVcIl0gLnN1LWNhcmQge1xyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwyNTUsMjU1LDAuMDQ1KSAhaW1wb3J0YW50O1xyXG4gICAgICAgICAgICBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDE0OCwxNjMsMTg0LDAuMTQpICFpbXBvcnRhbnQ7XHJcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDE2cHggIWltcG9ydGFudDtcclxuICAgICAgICAgICAgcGFkZGluZzogMTBweCAxMnB4ICFpbXBvcnRhbnQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBbZGF0YS13YWxsZXQtcG9pbnQtcGFuZWw9XCJ0cnVlXCJdIGlucHV0LFxyXG4gICAgICAgICAgW2RhdGEtd2FsbGV0LXBvaW50LXBhbmVsPVwidHJ1ZVwiXSBzZWxlY3Qge1xyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiAjMTYyNDM3ICFpbXBvcnRhbnQ7XHJcbiAgICAgICAgICAgIGNvbG9yOiAjZjhmYWZjICFpbXBvcnRhbnQ7XHJcbiAgICAgICAgICAgIGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoMTI1LCAxNjEsIDE5MywgMC4yOCkgIWltcG9ydGFudDtcclxuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogMTBweCAhaW1wb3J0YW50O1xyXG4gICAgICAgICAgICBtaW4taGVpZ2h0OiAzOHB4ICFpbXBvcnRhbnQ7XHJcbiAgICAgICAgICAgIHBhZGRpbmc6IDhweCAxMHB4ICFpbXBvcnRhbnQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBbZGF0YS13YWxsZXQtcG9pbnQtcGFuZWw9XCJ0cnVlXCJdIGJ1dHRvbiB7XHJcbiAgICAgICAgICAgIG1pbi1oZWlnaHQ6IDM0cHg7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBbZGF0YS13YWxsZXQtcG9pbnQtcGFuZWw9XCJ0cnVlXCJdIC5zdS1jaGlwIHtcclxuICAgICAgICAgICAgbWluLWhlaWdodDogMzRweCAhaW1wb3J0YW50O1xyXG4gICAgICAgICAgICBwYWRkaW5nOiA2cHggMTFweCAhaW1wb3J0YW50O1xyXG4gICAgICAgICAgICBib3JkZXItcmFkaXVzOiA5OTlweCAhaW1wb3J0YW50O1xyXG4gICAgICAgICAgICBmb250LXNpemU6IDEycHggIWltcG9ydGFudDtcclxuICAgICAgICAgICAgYmFja2dyb3VuZDogcmdiYSgyNTUsMjU1LDI1NSwwLjA3KSAhaW1wb3J0YW50O1xyXG4gICAgICAgICAgICBjb2xvcjogI2RiZTRlZSAhaW1wb3J0YW50O1xyXG4gICAgICAgICAgICBib3JkZXItY29sb3I6IHJnYmEoMTQ4LDE2MywxODQsMC4xOCkgIWltcG9ydGFudDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIFtkYXRhLXdhbGxldC1wb2ludC1wYW5lbD1cInRydWVcIl0gLnN1LWNoaXAuaXMtYWN0aXZlIHtcclxuICAgICAgICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDkwZGVnLCAjMGY3NjZlLCAjMTRiOGE2KSAhaW1wb3J0YW50O1xyXG4gICAgICAgICAgICBjb2xvcjogI2VmZmZmYiAhaW1wb3J0YW50O1xyXG4gICAgICAgICAgICBib3JkZXItY29sb3I6IHJnYmEoNDUsMjEyLDE5MSwwLjM1KSAhaW1wb3J0YW50O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgYH08L3N0eWxlPlxyXG4gICAgICB7dGFiSG9zdCA/IGNyZWF0ZVBvcnRhbChcclxuICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6IFwiaW5saW5lLWZsZXhcIiwgd2lkdGg6IFwiMTAwJVwiLCBwYWRkaW5nOiA0LCBib3JkZXJSYWRpdXM6IDE2LCBiYWNrZ3JvdW5kOiBcImxpbmVhci1ncmFkaWVudCgxODBkZWcsIHJnYmEoMTIsMTgsMzIsMC45NiksIHJnYmEoMTUsMjYsNDQsMC45NikpXCIsIGJvcmRlcjogXCIxcHggc29saWQgcmdiYSgxMTAsMTQyLDE3MCwwLjE4KVwiLCBib3hTaGFkb3c6IFwiMCAxNnB4IDM0cHggcmdiYSgwLDAsMCwwLjIyKVwiLCBnYXA6IDQsIGJveFNpemluZzogXCJib3JkZXItYm94XCIgfX0+XHJcbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiB3aW5kb3cuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoXCJzdTpteTp3YWxsZXRWaWV3XCIsIHsgZGV0YWlsOiBcInBvaW50XCIgfSkpfSBzdHlsZT17eyBmbGV4OiAxLCBib3JkZXI6IFwibm9uZVwiLCBib3JkZXJSYWRpdXM6IDEyLCBwYWRkaW5nOiBcIjEwcHggMTJweFwiLCBiYWNrZ3JvdW5kOiAhaXNWb3VjaGVyID8gXCJsaW5lYXItZ3JhZGllbnQoOTBkZWcsIzBmNzY2ZSwjMTRiOGE2KVwiIDogXCJ0cmFuc3BhcmVudFwiLCBjb2xvcjogIWlzVm91Y2hlciA/IFwiI2VmZmZmYlwiIDogXCIjY2JkNWUxXCIsIGZvbnRXZWlnaHQ6IDgwMCwgZm9udFNpemU6IDEzLCBjdXJzb3I6IFwicG9pbnRlclwiIH19Pu2PrOyduO2KuDwvYnV0dG9uPlxyXG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gd2luZG93LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KFwic3U6bXk6d2FsbGV0Vmlld1wiLCB7IGRldGFpbDogXCJ2b3VjaGVyXCIgfSkpfSBzdHlsZT17eyBmbGV4OiAxLCBib3JkZXI6IFwibm9uZVwiLCBib3JkZXJSYWRpdXM6IDEyLCBwYWRkaW5nOiBcIjEwcHggMTJweFwiLCBiYWNrZ3JvdW5kOiBpc1ZvdWNoZXIgPyBcImxpbmVhci1ncmFkaWVudCg5MGRlZywjZDRhNzJjLCNmNGQ3N2EpXCIgOiBcInRyYW5zcGFyZW50XCIsIGNvbG9yOiBpc1ZvdWNoZXIgPyBcIiMxMTE4MjdcIiA6IFwiI2NiZDVlMVwiLCBmb250V2VpZ2h0OiA4MDAsIGZvbnRTaXplOiAxMywgY3Vyc29yOiBcInBvaW50ZXJcIiB9fT5WSVAg7IOB7ZKI6raMPC9idXR0b24+XHJcbiAgICAgICAgPC9kaXY+LFxyXG4gICAgICAgIHRhYkhvc3RcclxuICAgICAgKSA6IG51bGx9XHJcbiAgICAgIHttb3VudE5vZGUgPyBjcmVhdGVQb3J0YWwoXHJcbiAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJzdS1wYW5lbFwiIHN0eWxlPXtwYW5lbFN0eWxlfT5cclxuICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiBcImZsZXhcIiwganVzdGlmeUNvbnRlbnQ6IFwic3BhY2UtYmV0d2VlblwiLCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBnYXA6IDgsIG1hcmdpbkJvdHRvbTogMTQgfX0+XHJcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzdS1zZWN0aW9uVGl0bGVcIj7wn46f77iPIFZJUCDsg4Htkojqtow8L2Rpdj5cclxuICAgICAgICA8c3BhbiBzdHlsZT17eyBmb250U2l6ZTogMTUsIGZvbnRXZWlnaHQ6IDgwMCwgY29sb3I6IFwiI2Y4ZDk3OFwiIH19Puy0nSB7Zm9ybWF0Vm91Y2hlckFtb3VudCh0b3RhbEFtb3VudCl9PC9zcGFuPlxyXG4gICAgICA8L2Rpdj5cclxuXHJcbiAgICAgIHtsb2FkaW5nID8gKFxyXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgdGV4dEFsaWduOiBcImNlbnRlclwiLCBvcGFjaXR5OiAwLjU1LCBwYWRkaW5nOiAxNiB9fT7ij7Mg66Gc65SpIOykkS4uLjwvZGl2PlxyXG4gICAgICApIDogIXZvdWNoZXJCYWxhbmNlIHx8IHRvdGFsQW1vdW50IDw9IDAgPyAoXHJcbiAgICAgICAgPGRpdiBzdHlsZT17eyB0ZXh0QWxpZ246IFwiY2VudGVyXCIsIG9wYWNpdHk6IDAuNjUsIHBhZGRpbmc6IDE4LCBmb250U2l6ZTogMTQgfX0+67O07JygIOyDge2SiOq2jOydtCDsl4bsirXri4jri6QuPC9kaXY+XHJcbiAgICAgICkgOiAoXHJcbiAgICAgICAgPD5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogXCJncmlkXCIsIGdhcDogMTQsIGdyaWRUZW1wbGF0ZUNvbHVtbnM6IFwiMWZyXCIsIG1hcmdpbkJvdHRvbTogMTQgfX0+XHJcbiAgICAgICAgICAgIHthY3RpdmVWb3VjaGVyQ2FyZHMubWFwKChsb2cpID0+IChcclxuICAgICAgICAgICAgICA8ZGl2IGtleT17bG9nLmlkfSBzdHlsZT17dm91Y2hlckNhcmRTdHlsZX0+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHBvc2l0aW9uOiBcImFic29sdXRlXCIsIGluc2V0OiAwLCBiYWNrZ3JvdW5kOiBcImxpbmVhci1ncmFkaWVudCgxMzVkZWcsIHJnYmEoMjU1LDI1NSwyNTUsMC4xMiksIHRyYW5zcGFyZW50IDQyJSlcIiwgcG9pbnRlckV2ZW50czogXCJub25lXCIgfX0gLz5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogXCJmbGV4XCIsIGp1c3RpZnlDb250ZW50OiBcInNwYWNlLWJldHdlZW5cIiwgYWxpZ25JdGVtczogXCJmbGV4LXN0YXJ0XCIsIGdhcDogMTAsIG1hcmdpbkJvdHRvbTogMTQgfX0+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogMTMsIGNvbG9yOiBcIiNmNmQ2N2FcIiwgZm9udFdlaWdodDogODAwIH19PvCfjp/vuI8gVklQIOyDge2SiOq2jDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luVG9wOiA0LCBmb250U2l6ZTogMTIsIGNvbG9yOiBcIiNkOGU0ZWZcIiB9fT7sp4Dsl63qs7XsnKDrsJzsoITtlIzrnqvtj7w8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgYm9yZGVyUmFkaXVzOiA5OTksIHBhZGRpbmc6IFwiNXB4IDlweFwiLCBiYWNrZ3JvdW5kOiBnZXRWb3VjaGVyU3RhdHVzU3R5bGUobG9nLnN0YXR1c0xhYmVsKS5iYWNrZ3JvdW5kLCBib3JkZXI6IGAxcHggc29saWQgJHtnZXRWb3VjaGVyU3RhdHVzU3R5bGUobG9nLnN0YXR1c0xhYmVsKS5ib3JkZXJDb2xvcn1gLCBjb2xvcjogZ2V0Vm91Y2hlclN0YXR1c1N0eWxlKGxvZy5zdGF0dXNMYWJlbCkuY29sb3IsIGZvbnRTaXplOiAxMSwgZm9udFdlaWdodDogODAwIH19Pntsb2cuc3RhdHVzTGFiZWx9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6IDI4LCBmb250V2VpZ2h0OiA5MDAsIGNvbG9yOiBcIiNmZmYyYmZcIiwgbWFyZ2luQm90dG9tOiAxNCwgbGV0dGVyU3BhY2luZzogXCItMC4wMmVtXCIgfX0+e2Zvcm1hdFZvdWNoZXJBbW91bnQobG9nLmFtb3VudEFicyl9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6IFwiZ3JpZFwiLCBnYXA6IDUsIGZvbnRTaXplOiAxMiwgY29sb3I6IFwiI2RiZTRlZVwiIH19PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2PuuwnO2WieydvDoge2Zvcm1hdFZvdWNoZXJEYXRlKGxvZy5jcmVhdGVkQXQpfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICB7bG9nLmlzc3VlUmVnaW9uID8gPGRpdj7rsJztlonsp4Dsl606IHtsb2cuaXNzdWVSZWdpb259PC9kaXY+IDogbnVsbH1cclxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250RmFtaWx5OiBcIkNvbnNvbGFzLCBNb25hY28sIG1vbm9zcGFjZVwiLCBsZXR0ZXJTcGFjaW5nOiBcIjAuMDVlbVwiLCBjb2xvcjogXCIjYjljYWRiXCIgfX0+U0VSSUFMOiB7bG9nLnNlcmlhbH08L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICApKX1cclxuICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFdlaWdodDogNzAwLCBmb250U2l6ZTogMTIsIG1hcmdpbkJvdHRvbTogOCwgY29sb3I6IFwiI2M4ZDVlM1wiIH19Puy1nOq3vCDrgrTsl608L2Rpdj5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogXCJncmlkXCIsIGdhcDogOCB9fT5cclxuICAgICAgICAgICAge3Zpc2libGVIaXN0b3J5Lm1hcCgoaGlzdG9yeSkgPT4gKFxyXG4gICAgICAgICAgICAgIDxkaXYga2V5PXtoaXN0b3J5LmlkfSBjbGFzc05hbWU9XCJzdS1jYXJkXCIgc3R5bGU9e3sgZGlzcGxheTogXCJmbGV4XCIsIGp1c3RpZnlDb250ZW50OiBcInNwYWNlLWJldHdlZW5cIiwgYWxpZ25JdGVtczogXCJjZW50ZXJcIiwgZ2FwOiAxMiwgYm9yZGVyUmFkaXVzOiAxNiwgYmFja2dyb3VuZDogXCJyZ2JhKDI1NSwyNTUsMjU1LDAuMDU1KVwiLCBib3JkZXI6IFwiMXB4IHNvbGlkIHJnYmEoMjAzLDIxMywyMjUsMC4xKVwiLCBwYWRkaW5nOiBcIjEwcHggMTJweFwiIH19PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmbGV4OiAxLCBtaW5XaWR0aDogMCB9fT5cclxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiBcImZsZXhcIiwgZ2FwOiA2LCBhbGlnbkl0ZW1zOiBcImNlbnRlclwiLCBtYXJnaW5Cb3R0b206IDMgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgZm9udFNpemU6IDEwLCBmb250V2VpZ2h0OiA4MDAsIHBhZGRpbmc6IFwiM3B4IDhweFwiLCBib3JkZXJSYWRpdXM6IDk5OSwgYmFja2dyb3VuZDogXCJyZ2JhKDI0NSwyMDAsODcsMC4xNClcIiwgY29sb3I6IFwiI2Y2ZDY3YVwiIH19PlZJUCDsg4Htkojqtow8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAxMiwgZm9udFdlaWdodDogNzAwLCBjb2xvcjogXCIjZjhmYWZjXCIsIG92ZXJmbG93OiBcImhpZGRlblwiLCB0ZXh0T3ZlcmZsb3c6IFwiZWxsaXBzaXNcIiwgd2hpdGVTcGFjZTogXCJub3dyYXBcIiB9fT57aGlzdG9yeS5yZWFzb24gfHwgKGhpc3RvcnkuZGlyZWN0aW9uID09PSBcIuyngOq4iVwiID8gXCLqtIDrpqzsnpAg7KeA6riJXCIgOiBoaXN0b3J5LmRpcmVjdGlvbiA9PT0gXCLsgqzsmqlcIiA/IFwi7IOB7ZKI6raMIOyCrOyaqVwiIDogXCLsg4Htkojqtowg7LCo6rCQXCIpfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAxMCwgY29sb3I6IFwiIzhmYTJiOFwiLCBtYXJnaW5Ub3A6IDIgfX0+e2Zvcm1hdFZvdWNoZXJEYXRlKGhpc3RvcnkuY3JlYXRlZEF0KX08L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250V2VpZ2h0OiA4MDAsIGZvbnRTaXplOiAxMywgY29sb3I6IGhpc3RvcnkuYW1vdW50ID4gMCA/IFwiIzk5ZjZlNFwiIDogXCIjZmRhNGFmXCIsIG1hcmdpbkxlZnQ6IDEyLCB3aGl0ZVNwYWNlOiBcIm5vd3JhcFwiIH19PntoaXN0b3J5LmFtb3VudCA+IDAgPyBcIitcIiA6IFwiLVwifXtmb3JtYXRWb3VjaGVyQW1vdW50KGhpc3RvcnkuYW1vdW50QWJzKX08L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgKSl9XHJcbiAgICAgICAgICAgIHt2aXNpYmxlSGlzdG9yeS5sZW5ndGggPT09IDAgPyA8ZGl2IHN0eWxlPXt7IHRleHRBbGlnbjogXCJjZW50ZXJcIiwgb3BhY2l0eTogMC42LCBmb250U2l6ZTogMTMgfX0+64K07Jet7J20IOyXhuyKteuLiOuLpC48L2Rpdj4gOiBudWxsfVxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC8+XHJcbiAgICAgICl9XHJcbiAgICA8L3NlY3Rpb24+LFxyXG4gICAgbW91bnROb2RlXHJcbiAgICAgICkgOiBudWxsfVxyXG4gICAgPC8+XHJcbiAgKTtcclxufVxyXG5cclxuXHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIE15UGFnZVdpdGhWaXBWb3VjaGVyQnJpZGdlKCkge1xyXG4gIGNvbnN0IFt3YWxsZXRWaWV3LCBzZXRXYWxsZXRWaWV3XSA9IHVzZVN0YXRlKCgpID0+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHNhdmVkID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKFwid2FsbGV0Vmlld1wiKTtcclxuICAgICAgaWYgKHNhdmVkID09PSBcInBvaW50XCIgfHwgc2F2ZWQgPT09IFwic2hvcFwiIHx8IHNhdmVkID09PSBcInZvdWNoZXJcIikgcmV0dXJuIHNhdmVkO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHt9XHJcbiAgICByZXR1cm4gXCJwb2ludFwiO1xyXG4gIH0pO1xyXG5cclxuICAvLyBNeS5qc3jsnZggd2FsbGV0VmlldyDsg4Htg5zrpbwg7LaU7KCBXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIC8vIOyDge2DnCDstpTsoIE6IE15LmpzeOydmCBzZXRXYWxsZXRWaWV366W8IOqwgOuhnOyxhOq4sCDsnITtlbQg7J2067Kk7Yq4IOumrOyKpOuEiCDsgqzsmqlcclxuICAgIGNvbnN0IGhhbmRsZXIgPSAoZSkgPT4ge1xyXG4gICAgICBpZiAoZSAmJiBlLmRldGFpbCAmJiB0eXBlb2YgZS5kZXRhaWwud2FsbGV0VmlldyA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgIHNldFdhbGxldFZpZXcoZS5kZXRhaWwud2FsbGV0Vmlldyk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICBjb25zdCBzdG9yYWdlSGFuZGxlciA9ICgpID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBzYXZlZCA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIndhbGxldFZpZXdcIik7XHJcbiAgICAgICAgaWYgKHNhdmVkID09PSBcInBvaW50XCIgfHwgc2F2ZWQgPT09IFwic2hvcFwiIHx8IHNhdmVkID09PSBcInZvdWNoZXJcIikge1xyXG4gICAgICAgICAgc2V0V2FsbGV0VmlldyhzYXZlZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIChlcnJvcikge31cclxuICAgIH07XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInN1OndhbGxldFZpZXc6Y2hhbmdlZFwiLCBoYW5kbGVyKTtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwic3RvcmFnZVwiLCBzdG9yYWdlSGFuZGxlcik7XHJcbiAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInN1OndhbGxldFZpZXc6Y2hhbmdlZFwiLCBoYW5kbGVyKTtcclxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJzdG9yYWdlXCIsIHN0b3JhZ2VIYW5kbGVyKTtcclxuICAgIH07XHJcbiAgfSwgW10pO1xyXG5cclxuICByZXR1cm4gKFxyXG4gICAgPD5cclxuICAgICAgPE15IC8+XHJcbiAgICAgIHsvKiDruIzrpqzsp4DripQg7J6Q7LK07KCB7Jy866GcIOyVtey7pOulvCDtg5Dsg4kv7Jew6rKw7ZWc64ukLiAqL31cclxuICAgICAgPFNob3BWb3VjaGVyUGF5bWVudEJyaWRnZSAvPlxyXG4gICAgICA8TWVtYmVyVmlwVm91Y2hlclBhbmVsIHdhbGxldFZpZXc9e3dhbGxldFZpZXd9IC8+XHJcbiAgICA8Lz5cclxuICApO1xyXG59XHJcblxyXG5mdW5jdGlvbiBHbG9iYWxDaGF0RmxvYXRpbmdCYWRnZSh7IGlzTG9nZ2VkSW4gfSkge1xyXG4gIGNvbnN0IGxvY2F0aW9uID0gdXNlTG9jYXRpb24oKTtcclxuICBjb25zdCBuYXZpZ2F0ZSA9IHVzZU5hdmlnYXRlKCk7XHJcbiAgY29uc3Qgc2Vzc2lvbiA9IGdldFNlc3Npb24oKTtcclxuICBjb25zdCBteU1lbWJlcklkID0gU3RyaW5nKHNlc3Npb24/Lm1lbWJlcklkIHx8ICcnKS50cmltKCk7XHJcbiAgY29uc3Qgdm9pY2VFbmFibGVkUmVmID0gdXNlUmVmKGZhbHNlKTtcclxuXHJcbiAgY29uc3QgW2JhZGdlUG9zLCBzZXRCYWRnZVBvc10gPSB1c2VTdGF0ZSgoKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCByYXcgPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3N1OmNoYXQ6ZmxvYXRpbmc6cG9zJyk7XHJcbiAgICAgIGNvbnN0IHBhcnNlZCA9IHJhdyA/IEpTT04ucGFyc2UocmF3KSA6IG51bGw7XHJcbiAgICAgIGlmIChwYXJzZWQgJiYgTnVtYmVyLmlzRmluaXRlKHBhcnNlZC54KSAmJiBOdW1iZXIuaXNGaW5pdGUocGFyc2VkLnkpKSB7XHJcbiAgICAgICAgcmV0dXJuIHBhcnNlZDtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZSkge31cclxuICAgIHJldHVybiB7IHg6IE1hdGgubWF4KHdpbmRvdy5pbm5lcldpZHRoIC0gODIsIDEyKSwgeTogTWF0aC5tYXgod2luZG93LmlubmVySGVpZ2h0IC0gMTk4LCA5MCkgfTtcclxuICB9KTtcclxuICBjb25zdCBbdW5yZWFkQ291bnQsIHNldFVucmVhZENvdW50XSA9IHVzZVN0YXRlKDApO1xyXG4gIGNvbnN0IFt0b2FzdCwgc2V0VG9hc3RdID0gdXNlU3RhdGUoJycpO1xyXG5cclxuICBjb25zdCBkcmFnU3RhdGVSZWYgPSB1c2VSZWYobnVsbCk7XHJcbiAgY29uc3QgZmlyc3RQb2xsUmVmID0gdXNlUmVmKHRydWUpO1xyXG4gIGNvbnN0IHJvb21MYXN0U2VlblJlZiA9IHVzZVJlZih7fSk7XHJcbiAgY29uc3QgdG9hc3RUaW1lclJlZiA9IHVzZVJlZihudWxsKTtcclxuICBjb25zdCBwb2xsVGltZXJSZWYgPSB1c2VSZWYobnVsbCk7XHJcblxyXG4gIGNvbnN0IHJlZ2lvbklkID0gZ2V0Q3VycmVudFJlZ2lvbklkKCk7XHJcbiAgY29uc3Qgb25SZWdpb25DaGF0UGFnZSA9IC9eXFwvclxcL1teL10rXFwvY2hhdCg/OlxcL3wkKS8udGVzdChsb2NhdGlvbi5wYXRobmFtZSk7XHJcblxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3N1OmNoYXQ6ZmxvYXRpbmc6cG9zJywgSlNPTi5zdHJpbmdpZnkoYmFkZ2VQb3MpKTtcclxuICAgIH0gY2F0Y2ggKGUpIHt9XHJcbiAgfSwgW2JhZGdlUG9zXSk7XHJcblxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBpZiAoIXRvYXN0KSByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgaWYgKHRvYXN0VGltZXJSZWYuY3VycmVudCkge1xyXG4gICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRvYXN0VGltZXJSZWYuY3VycmVudCk7XHJcbiAgICB9XHJcbiAgICB0b2FzdFRpbWVyUmVmLmN1cnJlbnQgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIHNldFRvYXN0KCcnKTtcclxuICAgICAgdG9hc3RUaW1lclJlZi5jdXJyZW50ID0gbnVsbDtcclxuICAgIH0sIDI0MDApO1xyXG4gICAgcmV0dXJuICgpID0+IHtcclxuICAgICAgaWYgKHRvYXN0VGltZXJSZWYuY3VycmVudCkge1xyXG4gICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodG9hc3RUaW1lclJlZi5jdXJyZW50KTtcclxuICAgICAgICB0b2FzdFRpbWVyUmVmLmN1cnJlbnQgPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH0sIFt0b2FzdF0pO1xyXG5cclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgaWYgKG9uUmVnaW9uQ2hhdFBhZ2UpIHtcclxuICAgICAgc2V0VW5yZWFkQ291bnQoMCk7XHJcbiAgICB9XHJcbiAgfSwgW29uUmVnaW9uQ2hhdFBhZ2VdKTtcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyB8fCAhKCdOb3RpZmljYXRpb24nIGluIHdpbmRvdykpIHJldHVybjtcclxuICAgIGlmIChOb3RpZmljYXRpb24ucGVybWlzc2lvbiA9PT0gJ2RlZmF1bHQnKSB7XHJcbiAgICAgIE5vdGlmaWNhdGlvbi5yZXF1ZXN0UGVybWlzc2lvbigpLmNhdGNoKCgpID0+IHt9KTtcclxuICAgIH1cclxuICB9LCBbXSk7XHJcblxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBjb25zdCBzeW5jVm9pY2VQcmVmID0gKCkgPT4ge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHZvaWNlRW5hYmxlZFJlZi5jdXJyZW50ID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdzdTpjaGF0Om5vdGlmeTp2b2ljZScpID09PSAnMSc7XHJcbiAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICB2b2ljZUVuYWJsZWRSZWYuY3VycmVudCA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHN5bmNWb2ljZVByZWYoKTtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzdG9yYWdlJywgc3luY1ZvaWNlUHJlZik7XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc3U6Y2hhdDp2b2ljZS1wcmVmOmNoYW5nZWQnLCBzeW5jVm9pY2VQcmVmKTtcclxuICAgIHJldHVybiAoKSA9PiB7XHJcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdzdG9yYWdlJywgc3luY1ZvaWNlUHJlZik7XHJcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdzdTpjaGF0OnZvaWNlLXByZWY6Y2hhbmdlZCcsIHN5bmNWb2ljZVByZWYpO1xyXG4gICAgfTtcclxuICB9LCBbXSk7XHJcblxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBpZiAoIWlzTG9nZ2VkSW4gfHwgIW15TWVtYmVySWQgfHwgIXJlZ2lvbklkKSB7XHJcbiAgICAgIGlmIChwb2xsVGltZXJSZWYuY3VycmVudCkge1xyXG4gICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKHBvbGxUaW1lclJlZi5jdXJyZW50KTtcclxuICAgICAgICBwb2xsVGltZXJSZWYuY3VycmVudCA9IG51bGw7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBoZWFkZXJzID0ge1xyXG4gICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxyXG4gICAgICAuLi4oc2Vzc2lvbj8udG9rZW4gPyB7IEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHtzZXNzaW9uLnRva2VufWAgfSA6IHt9KSxcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgZmV0Y2hKc29uID0gYXN5bmMgKHBhdGgpID0+IHtcclxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHtpbXBvcnQubWV0YS5lbnYuVklURV9BUElfQkFTRSB8fCAnJ30ke3BhdGh9YCwge1xyXG4gICAgICAgIGNyZWRlbnRpYWxzOiAnaW5jbHVkZScsXHJcbiAgICAgICAgaGVhZGVycyxcclxuICAgICAgfSk7XHJcbiAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCkuY2F0Y2goKCkgPT4gKHt9KSk7XHJcbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihkYXRhPy5lcnJvciB8fCBg7JqU7LKtIOyLpO2MqCAoJHtyZXNwb25zZS5zdGF0dXN9KWApO1xyXG4gICAgICByZXR1cm4gZGF0YTtcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgcGxheU5vdGljZVRvbmUgPSAoKSA9PiB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgQXVkaW9DdHggPSB3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQ7XHJcbiAgICAgICAgaWYgKCFBdWRpb0N0eCkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IGN0eCA9IG5ldyBBdWRpb0N0eCgpO1xyXG4gICAgICAgIGNvbnN0IG5vdyA9IGN0eC5jdXJyZW50VGltZTtcclxuICAgICAgICBjb25zdCBvID0gY3R4LmNyZWF0ZU9zY2lsbGF0b3IoKTtcclxuICAgICAgICBjb25zdCBnID0gY3R4LmNyZWF0ZUdhaW4oKTtcclxuICAgICAgICBvLnR5cGUgPSAndHJpYW5nbGUnO1xyXG4gICAgICAgIG8uZnJlcXVlbmN5LnNldFZhbHVlQXRUaW1lKDcyMCwgbm93KTtcclxuICAgICAgICBnLmdhaW4uc2V0VmFsdWVBdFRpbWUoMC4wMDAxLCBub3cpO1xyXG4gICAgICAgIGcuZ2Fpbi5leHBvbmVudGlhbFJhbXBUb1ZhbHVlQXRUaW1lKDAuMDgsIG5vdyArIDAuMDIpO1xyXG4gICAgICAgIGcuZ2Fpbi5leHBvbmVudGlhbFJhbXBUb1ZhbHVlQXRUaW1lKDAuMDAwMSwgbm93ICsgMC4yNCk7XHJcbiAgICAgICAgby5jb25uZWN0KGcpO1xyXG4gICAgICAgIGcuY29ubmVjdChjdHguZGVzdGluYXRpb24pO1xyXG4gICAgICAgIG8uc3RhcnQobm93KTtcclxuICAgICAgICBvLnN0b3Aobm93ICsgMC4yNSk7XHJcbiAgICAgICAgby5vbmVuZGVkID0gKCkgPT4geyB0cnkgeyBjdHguY2xvc2UoKTsgfSBjYXRjaCAoZSkge30gfTtcclxuICAgICAgfSBjYXRjaCAoZSkge31cclxuICAgIH07XHJcblxyXG4gICAgY29uc3Qgc3BlYWtHbG9iYWxOb3RpY2UgPSAoKSA9PiB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgaWYgKCF2b2ljZUVuYWJsZWRSZWYuY3VycmVudCkgcmV0dXJuO1xyXG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyB8fCAhKCdzcGVlY2hTeW50aGVzaXMnIGluIHdpbmRvdykpIHJldHVybjtcclxuICAgICAgICBjb25zdCBzeW50aCA9IHdpbmRvdy5zcGVlY2hTeW50aGVzaXM7XHJcbiAgICAgICAgaWYgKCFzeW50aCkgcmV0dXJuO1xyXG4gICAgICAgIGlmIChzeW50aC5zcGVha2luZykgc3ludGguY2FuY2VsKCk7XHJcbiAgICAgICAgY29uc3QgdXR0ZXJhbmNlID0gbmV3IFNwZWVjaFN5bnRoZXNpc1V0dGVyYW5jZSgn6rO17JygJyk7XHJcbiAgICAgICAgdXR0ZXJhbmNlLmxhbmcgPSAna28tS1InO1xyXG4gICAgICAgIHV0dGVyYW5jZS5yYXRlID0gMTtcclxuICAgICAgICB1dHRlcmFuY2UucGl0Y2ggPSAxO1xyXG4gICAgICAgIHN5bnRoLnNwZWFrKHV0dGVyYW5jZSk7XHJcbiAgICAgIH0gY2F0Y2ggKGUpIHt9XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IHBvbGwgPSBhc3luYyAoKSA9PiB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgbGlzdCA9IGF3YWl0IGZldGNoSnNvbihgL2FwaS9jaGF0LXJvb21zP3JlZ2lvbklkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHJlZ2lvbklkKX1gKTtcclxuICAgICAgICBjb25zdCByb29tcyA9IEFycmF5LmlzQXJyYXkobGlzdD8ucm9vbXMpID8gbGlzdC5yb29tcyA6IFtdO1xyXG4gICAgICAgIGxldCBoYXNOZXcgPSBmYWxzZTtcclxuICAgICAgICBsZXQgbGF0ZXN0U2VuZGVyID0gJ+2ajOybkCc7XHJcbiAgICAgICAgbGV0IGxhdGVzdFRleHQgPSAn7IOIIOyxhO2MheydtCDrj4TssKntlojsirXri4jri6QuJztcclxuXHJcbiAgICAgICAgZm9yIChjb25zdCByb29tIG9mIHJvb21zKSB7XHJcbiAgICAgICAgICBjb25zdCByb29tSWQgPSBTdHJpbmcocm9vbT8ucm9vbUlkIHx8ICcnKS50cmltKCk7XHJcbiAgICAgICAgICBpZiAoIXJvb21JZCkgY29udGludWU7XHJcblxyXG4gICAgICAgICAgY29uc3QgbGF0ZXN0QXQgPSBTdHJpbmcocm9vbT8ubGFzdE1lc3NhZ2VBdCB8fCAnJykudHJpbSgpO1xyXG4gICAgICAgICAgY29uc3QgcHJldkF0ID0gU3RyaW5nKHJvb21MYXN0U2VlblJlZi5jdXJyZW50W3Jvb21JZF0gfHwgJycpLnRyaW0oKTtcclxuXHJcbiAgICAgICAgICBpZiAoZmlyc3RQb2xsUmVmLmN1cnJlbnQpIHtcclxuICAgICAgICAgICAgcm9vbUxhc3RTZWVuUmVmLmN1cnJlbnRbcm9vbUlkXSA9IGxhdGVzdEF0O1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAoIWxhdGVzdEF0KSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICBjb25zdCBjaGFuZ2VkID0gIXByZXZBdCB8fCBsYXRlc3RBdCAhPT0gcHJldkF0O1xyXG4gICAgICAgICAgcm9vbUxhc3RTZWVuUmVmLmN1cnJlbnRbcm9vbUlkXSA9IGxhdGVzdEF0O1xyXG4gICAgICAgICAgaWYgKCFjaGFuZ2VkKSBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICBjb25zdCBtZXNzYWdlc0RhdGEgPSBhd2FpdCBmZXRjaEpzb24oYC9hcGkvY2hhdC1yb29tcy8ke2VuY29kZVVSSUNvbXBvbmVudChyb29tSWQpfS9tZXNzYWdlcz9saW1pdD0xYCk7XHJcbiAgICAgICAgICBjb25zdCBtZXNzYWdlcyA9IEFycmF5LmlzQXJyYXkobWVzc2FnZXNEYXRhPy5tZXNzYWdlcykgPyBtZXNzYWdlc0RhdGEubWVzc2FnZXMgOiBbXTtcclxuICAgICAgICAgIGNvbnN0IGxhdGVzdCA9IG1lc3NhZ2VzW21lc3NhZ2VzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgaWYgKCFsYXRlc3QpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgIGlmIChTdHJpbmcobGF0ZXN0Lm1lbWJlcklkIHx8ICcnKSA9PT0gbXlNZW1iZXJJZCkgY29udGludWU7XHJcblxyXG4gICAgICAgICAgaGFzTmV3ID0gdHJ1ZTtcclxuICAgICAgICAgIGxhdGVzdFNlbmRlciA9IGxhdGVzdC5tZW1iZXJOYW1lIHx8ICftmozsm5AnO1xyXG4gICAgICAgICAgbGF0ZXN0VGV4dCA9IFN0cmluZyhsYXRlc3QubWVzc2FnZVR5cGUgfHwgJ3RleHQnKSA9PT0gJ2ltYWdlJ1xyXG4gICAgICAgICAgICA/ICfsnbTrr7jsp4Drpbwg67O064OI7Iq164uI64ukLidcclxuICAgICAgICAgICAgOiBTdHJpbmcobGF0ZXN0LnRleHQgfHwgJ+yDiCDssYTtjIUnKS5zbGljZSgwLCAzNik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmaXJzdFBvbGxSZWYuY3VycmVudCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiAoaGFzTmV3ICYmICFvblJlZ2lvbkNoYXRQYWdlKSB7XHJcbiAgICAgICAgICBzZXRVbnJlYWRDb3VudCgocHJldikgPT4gTWF0aC5taW4ocHJldiArIDEsIDk5KSk7XHJcbiAgICAgICAgICBzZXRUb2FzdChgJHtsYXRlc3RTZW5kZXJ9OiAke2xhdGVzdFRleHR9YCk7XHJcbiAgICAgICAgICBwbGF5Tm90aWNlVG9uZSgpO1xyXG4gICAgICAgICAgc3BlYWtHbG9iYWxOb3RpY2UoKTtcclxuICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmICgnTm90aWZpY2F0aW9uJyBpbiB3aW5kb3cgJiYgTm90aWZpY2F0aW9uLnBlcm1pc3Npb24gPT09ICdncmFudGVkJykge1xyXG4gICAgICAgICAgICAgIG5ldyBOb3RpZmljYXRpb24oJ+qzteycoCDssYTtjIUg7JWM66a8JywgeyBib2R5OiBgJHtsYXRlc3RTZW5kZXJ9OiAke2xhdGVzdFRleHR9YCB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBjYXRjaCAoZSkge31cclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICBmaXJzdFBvbGxSZWYuY3VycmVudCA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHBvbGwoKTtcclxuICAgIHBvbGxUaW1lclJlZi5jdXJyZW50ID0gd2luZG93LnNldEludGVydmFsKHBvbGwsIDUwMDApO1xyXG4gICAgcmV0dXJuICgpID0+IHtcclxuICAgICAgaWYgKHBvbGxUaW1lclJlZi5jdXJyZW50KSB7XHJcbiAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwocG9sbFRpbWVyUmVmLmN1cnJlbnQpO1xyXG4gICAgICAgIHBvbGxUaW1lclJlZi5jdXJyZW50ID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9LCBbaXNMb2dnZWRJbiwgbXlNZW1iZXJJZCwgb25SZWdpb25DaGF0UGFnZSwgcmVnaW9uSWQsIHNlc3Npb24/LnRva2VuXSk7XHJcblxyXG4gIGlmICghaXNMb2dnZWRJbiB8fCAhbXlNZW1iZXJJZCB8fCAhcmVnaW9uSWQpIHJldHVybiBudWxsO1xyXG5cclxuICBjb25zdCBvblBvaW50ZXJEb3duID0gKGV2ZW50KSA9PiB7XHJcbiAgICBjb25zdCBzdGFydFggPSBldmVudC5jbGllbnRYO1xyXG4gICAgY29uc3Qgc3RhcnRZID0gZXZlbnQuY2xpZW50WTtcclxuICAgIGRyYWdTdGF0ZVJlZi5jdXJyZW50ID0ge1xyXG4gICAgICBwb2ludGVySWQ6IGV2ZW50LnBvaW50ZXJJZCxcclxuICAgICAgc3RhcnRYLFxyXG4gICAgICBzdGFydFksXHJcbiAgICAgIG9yaWdpblg6IGJhZGdlUG9zLngsXHJcbiAgICAgIG9yaWdpblk6IGJhZGdlUG9zLnksXHJcbiAgICAgIG1vdmVkOiBmYWxzZSxcclxuICAgIH07XHJcbiAgICB0cnkgeyBldmVudC5jdXJyZW50VGFyZ2V0LnNldFBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZCk7IH0gY2F0Y2ggKGUpIHt9XHJcbiAgfTtcclxuXHJcbiAgY29uc3Qgb25Qb2ludGVyTW92ZSA9IChldmVudCkgPT4ge1xyXG4gICAgY29uc3QgZCA9IGRyYWdTdGF0ZVJlZi5jdXJyZW50O1xyXG4gICAgaWYgKCFkIHx8IGQucG9pbnRlcklkICE9PSBldmVudC5wb2ludGVySWQpIHJldHVybjtcclxuICAgIGNvbnN0IGR4ID0gZXZlbnQuY2xpZW50WCAtIGQuc3RhcnRYO1xyXG4gICAgY29uc3QgZHkgPSBldmVudC5jbGllbnRZIC0gZC5zdGFydFk7XHJcbiAgICBjb25zdCBtb3ZlZCA9IE1hdGguYWJzKGR4KSA+IDQgfHwgTWF0aC5hYnMoZHkpID4gNDtcclxuICAgIGlmICghbW92ZWQgJiYgIWQubW92ZWQpIHJldHVybjtcclxuICAgIGQubW92ZWQgPSB0cnVlO1xyXG5cclxuICAgIGNvbnN0IG1heFggPSBNYXRoLm1heCh3aW5kb3cuaW5uZXJXaWR0aCAtIDY0LCAxMCk7XHJcbiAgICBjb25zdCBtYXhZID0gTWF0aC5tYXgod2luZG93LmlubmVySGVpZ2h0IC0gNjQsIDEwKTtcclxuICAgIGNvbnN0IG5leHRYID0gTWF0aC5taW4oTWF0aC5tYXgoMTAsIGQub3JpZ2luWCArIGR4KSwgbWF4WCk7XHJcbiAgICBjb25zdCBuZXh0WSA9IE1hdGgubWluKE1hdGgubWF4KDgwLCBkLm9yaWdpblkgKyBkeSksIG1heFkpO1xyXG4gICAgc2V0QmFkZ2VQb3MoeyB4OiBuZXh0WCwgeTogbmV4dFkgfSk7XHJcbiAgfTtcclxuXHJcbiAgY29uc3Qgb25Qb2ludGVyVXAgPSAoZXZlbnQpID0+IHtcclxuICAgIGNvbnN0IGQgPSBkcmFnU3RhdGVSZWYuY3VycmVudDtcclxuICAgIGlmICghZCB8fCBkLnBvaW50ZXJJZCAhPT0gZXZlbnQucG9pbnRlcklkKSByZXR1cm47XHJcbiAgICBjb25zdCBtb3ZlZCA9IGQubW92ZWQ7XHJcbiAgICBkcmFnU3RhdGVSZWYuY3VycmVudCA9IG51bGw7XHJcbiAgICBpZiAoIW1vdmVkKSB7XHJcbiAgICAgIHNldFVucmVhZENvdW50KDApO1xyXG4gICAgICBuYXZpZ2F0ZShgL3IvJHtlbmNvZGVVUklDb21wb25lbnQocmVnaW9uSWQpfS9jaGF0YCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIGNyZWF0ZVBvcnRhbChcclxuICAgIDw+XHJcbiAgICAgIDxkaXZcclxuICAgICAgICByb2xlPVwiYnV0dG9uXCJcclxuICAgICAgICBhcmlhLWxhYmVsPVwi6rO17JygIOyxhO2MhSDrsJTroZzqsIDquLBcIlxyXG4gICAgICAgIG9uUG9pbnRlckRvd249e29uUG9pbnRlckRvd259XHJcbiAgICAgICAgb25Qb2ludGVyTW92ZT17b25Qb2ludGVyTW92ZX1cclxuICAgICAgICBvblBvaW50ZXJVcD17b25Qb2ludGVyVXB9XHJcbiAgICAgICAgc3R5bGU9e3tcclxuICAgICAgICAgIHBvc2l0aW9uOiAnZml4ZWQnLFxyXG4gICAgICAgICAgbGVmdDogYmFkZ2VQb3MueCxcclxuICAgICAgICAgIHRvcDogYmFkZ2VQb3MueSxcclxuICAgICAgICAgIHpJbmRleDogMjIwMCxcclxuICAgICAgICAgIG1pbldpZHRoOiA1NCxcclxuICAgICAgICAgIGhlaWdodDogMzIsXHJcbiAgICAgICAgICBwYWRkaW5nOiAnMCAxMHB4JyxcclxuICAgICAgICAgIGJvcmRlclJhZGl1czogOTk5LFxyXG4gICAgICAgICAgYmFja2dyb3VuZDogJ2xpbmVhci1ncmFkaWVudCgxMzVkZWcsI2ZlZTUwMCwjZmFjYzE1KScsXHJcbiAgICAgICAgICBib3JkZXI6ICcycHggc29saWQgcmdiYSgyNTUsMjU1LDI1NSwwLjk4KScsXHJcbiAgICAgICAgICBib3hTaGFkb3c6ICcwIDhweCAyMnB4IHJnYmEoMTYxLDk4LDcsMC4yNCknLFxyXG4gICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXHJcbiAgICAgICAgICBjb2xvcjogJyMzZjJhMDYnLFxyXG4gICAgICAgICAgZm9udFNpemU6IDEwLFxyXG4gICAgICAgICAgbGluZUhlaWdodDogMSxcclxuICAgICAgICAgIGxldHRlclNwYWNpbmc6ICctMC4wMmVtJyxcclxuICAgICAgICAgIGZvbnRXZWlnaHQ6IDkwMCxcclxuICAgICAgICAgIHVzZXJTZWxlY3Q6ICdub25lJyxcclxuICAgICAgICAgIHRvdWNoQWN0aW9uOiAnbm9uZScsXHJcbiAgICAgICAgICBjdXJzb3I6ICdncmFiJyxcclxuICAgICAgICB9fVxyXG4gICAgICA+XHJcbiAgICAgICAg6rO17JygXHJcbiAgICAgICAge3VucmVhZENvdW50ID4gMCA/IChcclxuICAgICAgICAgIDxzcGFuXHJcbiAgICAgICAgICAgIHN0eWxlPXt7XHJcbiAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgcmlnaHQ6IC01LFxyXG4gICAgICAgICAgICAgIHRvcDogLTUsXHJcbiAgICAgICAgICAgICAgbWluV2lkdGg6IDE4LFxyXG4gICAgICAgICAgICAgIGhlaWdodDogMTgsXHJcbiAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiA5OTksXHJcbiAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyNlZjQ0NDQnLFxyXG4gICAgICAgICAgICAgIGNvbG9yOiAnI2ZmZicsXHJcbiAgICAgICAgICAgICAgYm9yZGVyOiAnMnB4IHNvbGlkICNmZmYnLFxyXG4gICAgICAgICAgICAgIGZvbnRTaXplOiA5LFxyXG4gICAgICAgICAgICAgIGZvbnRXZWlnaHQ6IDkwMCxcclxuICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWZsZXgnLFxyXG4gICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICBwYWRkaW5nOiAnMCA0cHgnLFxyXG4gICAgICAgICAgICB9fVxyXG4gICAgICAgICAgPlxyXG4gICAgICAgICAgICB7dW5yZWFkQ291bnQgPiA5OSA/ICc5OSsnIDogdW5yZWFkQ291bnR9XHJcbiAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgKSA6IG51bGx9XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgICB7dG9hc3QgPyAoXHJcbiAgICAgICAgPGRpdlxyXG4gICAgICAgICAgc3R5bGU9e3tcclxuICAgICAgICAgICAgcG9zaXRpb246ICdmaXhlZCcsXHJcbiAgICAgICAgICAgIGxlZnQ6IGJhZGdlUG9zLnggLSA4LFxyXG4gICAgICAgICAgICB0b3A6IGJhZGdlUG9zLnkgLSA0NCxcclxuICAgICAgICAgICAgekluZGV4OiAyMjAxLFxyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiAncmdiYSgxNSwyMyw0MiwwLjk0KScsXHJcbiAgICAgICAgICAgIGNvbG9yOiAnI2Y4ZmFmYycsXHJcbiAgICAgICAgICAgIGJvcmRlcjogJzFweCBzb2xpZCByZ2JhKDU2LDE4OSwyNDgsMC4zNSknLFxyXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6IDEwLFxyXG4gICAgICAgICAgICBwYWRkaW5nOiAnN3B4IDEwcHgnLFxyXG4gICAgICAgICAgICBmb250U2l6ZTogMTEsXHJcbiAgICAgICAgICAgIGZvbnRXZWlnaHQ6IDcwMCxcclxuICAgICAgICAgICAgd2hpdGVTcGFjZTogJ25vd3JhcCcsXHJcbiAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMTBweCAyNHB4IHJnYmEoMiw2LDIzLDAuMzUpJyxcclxuICAgICAgICAgICAgbWF4V2lkdGg6IDIyMCxcclxuICAgICAgICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxyXG4gICAgICAgICAgICB0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcycsXHJcbiAgICAgICAgICB9fVxyXG4gICAgICAgID5cclxuICAgICAgICAgIHt0b2FzdH1cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgKSA6IG51bGx9XHJcbiAgICA8Lz4sXHJcbiAgICBkb2N1bWVudC5ib2R5XHJcbiAgKTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQXBwKCkge1xyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICAvLyBlbnN1cmUgbWVtYmVyIHByb2ZpbGUgZXhpc3RzIG9uIGZpcnN0IGFwcCBsb2FkIChmYWxsYmFjayB3aGVuIG5vIHNpZ251cCBwYWdlIGV4aXN0cylcclxuICAgIHRyeSB7XHJcbiAgICAgIGVuc3VyZU1lbWJlclByb2ZpbGUoKTtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgLy8gbm9vcFxyXG4gICAgfVxyXG4gIH0sIFtdKTtcclxuICBjb25zdCBnZXRJbml0aWFsQXV0aFN0YXRlID0gKCkgPT4ge1xyXG4gICAgY29uc3QgY3VycmVudFVzZXIgPSBnZXRDdXJyZW50VXNlcigpO1xyXG4gICAgY29uc3Qgc2Vzc2lvbiA9IGdldFNlc3Npb24oKTtcclxuICAgIGNvbnN0IGxvZ2dlZEluID0gaXNMb2dnZWRJbk1lbW9yeSgpIHx8ICEhc2Vzc2lvbj8ubWVtYmVySWQgfHwgISFjdXJyZW50VXNlcj8ubWVtYmVySWQ7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBpc0xvZ2dlZEluOiBsb2dnZWRJbixcclxuICAgICAgYXV0aFJlYWR5OiBpc0F1dGhSZWFkeSgpIHx8IGxvZ2dlZEluLFxyXG4gICAgfTtcclxuICB9O1xyXG4gIGNvbnN0IFthdXRoU3RhdGUsIHNldEF1dGhTdGF0ZV0gPSB1c2VTdGF0ZShnZXRJbml0aWFsQXV0aFN0YXRlKTtcclxuICBjb25zdCBhcHBCb2R5UmVmID0gdXNlUmVmKG51bGwpO1xyXG5cclxuICAvLyDimqEg7ISx64qlIOqwnOyEoDogYm9vdOyZgCBzeW5j66W8IOuwseq3uOudvOyatOuTnOyXkOyEnCDsi6TtlolcclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgKGFzeW5jICgpID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBicmVzID0gYXdhaXQgYm9vdCgpO1xyXG4gICAgICAgIGlmIChpbXBvcnQubWV0YS5lbnYuREVWKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnW0FwcF0gYXV0aCBib290IHJlc3VsdDonLCBicmVzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gYm9vdCDtm4Qg64+Z6riw7ZmUIOyLpO2WiSAo67Cx6re465287Jq065OcKVxyXG4gICAgICAgIHN5bmNPbkFwcFN0YXJ0KCkudGhlbihyZXN1bHQgPT4ge1xyXG4gICAgICAgICAgaWYgKGltcG9ydC5tZXRhLmVudi5ERVYgJiYgcmVzdWx0LnN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tBcHBdIOuNsOydtO2EsCDrj5nquLDtmZQg7JmE66OMOicsIHJlc3VsdCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgIGlmIChpbXBvcnQubWV0YS5lbnYuREVWKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tBcHBdIOuPmeq4sO2ZlCDspJEg7Jik66WYOicsIGVycik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgIGlmIChpbXBvcnQubWV0YS5lbnYuREVWKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdbQXBwXSBhdXRoIGJvb3QgZmFpbGVkOicsIGVycik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KSgpO1xyXG4gIH0sIFtdKTtcclxuXHJcbiAgLy8gU1NPVCBhdXRoIGJvb3RzdHJhcCAoY29va2llIHNlc3Npb24g4oaSIG1lbW9yeSlcclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgbGV0IG1vdW50ZWQgPSB0cnVlO1xyXG4gICAgKGFzeW5jICgpID0+IHtcclxuICAgICAgYXdhaXQgaHlkcmF0ZUF1dGhGcm9tU2VydmVyKCk7XHJcbiAgICAgIGlmIChtb3VudGVkKSB7XHJcbiAgICAgICAgc2V0QXV0aFN0YXRlKHtcclxuICAgICAgICAgIGlzTG9nZ2VkSW46IGlzTG9nZ2VkSW5NZW1vcnkoKSxcclxuICAgICAgICAgIGF1dGhSZWFkeTogdHJ1ZSxcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSkoKTtcclxuICAgIGNvbnN0IG9uQXV0aENoYW5nZWQgPSAoKSA9PiB7XHJcbiAgICAgIGlmICghbW91bnRlZCkgcmV0dXJuO1xyXG4gICAgICBzZXRBdXRoU3RhdGUoe1xyXG4gICAgICAgIGlzTG9nZ2VkSW46IGlzTG9nZ2VkSW5NZW1vcnkoKSxcclxuICAgICAgICBhdXRoUmVhZHk6IHRydWUsXHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzdTphdXRoOmNoYW5nZWQnLCBvbkF1dGhDaGFuZ2VkKTtcclxuICAgIHJldHVybiAoKSA9PiB7XHJcbiAgICAgIG1vdW50ZWQgPSBmYWxzZTtcclxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3N1OmF1dGg6Y2hhbmdlZCcsIG9uQXV0aENoYW5nZWQpO1xyXG4gICAgfTtcclxuICB9LCBbXSk7XHJcblxyXG4gIHJldHVybiAoXHJcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInN1LWFwcFNoZWxsIHN1LWFwcFwiPlxyXG4gIDxWb3VjaGVyRmV0Y2hSZWNvcmRlciAvPlxyXG4gIDxWaXBBbW91bnREaXNwbGF5QnJpZGdlIC8+XHJcbiAgPFZpcE1lbWJlclN1bW1hcnlCcmlkZ2UgLz5cclxuICA8TXlPZmZpY2VIZXJvQ2xlYW51cEJyaWRnZSAvPlxyXG4gIDxDYXJkQ3JlYXRlRXhwZXJpZW5jZUJyaWRnZSAvPlxyXG4gIDxQb2ludFdhbGxldEJyaWRnZSAvPlxyXG4gIDxzdHlsZT57YXBwTmVvbkhvbWVTdHlsZXN9PC9zdHlsZT5cclxuICB7LyogUGFkZGluZy1ib3R0b20gZW5zdXJlcyBwYWdlIGNvbnRlbnQgaXNuJ3QgaGlkZGVuIGJlaGluZCB0aGUgZml4ZWQgQm90dG9tTmF2ICovfVxyXG4gIDxkaXYgcmVmPXthcHBCb2R5UmVmfSBjbGFzc05hbWU9XCJzdS1hcHBCb2R5XCIgc3R5bGU9e3sgcGFkZGluZ0JvdHRvbTogNzIgfX0+XHJcbiAgICAgICAgPFN1c3BlbnNlIGZhbGxiYWNrPXs8ZGl2IHN0eWxlPXt7IHBhZGRpbmc6IDI0LCB0ZXh0QWxpZ246ICdjZW50ZXInIH19PuuhnOuUqSDspJEuLi48L2Rpdj59PlxyXG4gICAgICAgICAgPFJvdXRlcz5cclxuICAgICAgICAgIHsvKiBSZWRpcmVjdCByb290IHRvIC9ob21lICovfVxyXG4gICAgICAgICAgPFJvdXRlIHBhdGg9XCIvXCIgZWxlbWVudD17PE5hdmlnYXRlIHRvPVwiL2hvbWVcIiByZXBsYWNlIC8+fSAvPlxyXG5cclxuICAgICAgICAgIDxSb3V0ZSBwYXRoPVwiL2hvbWVcIiBlbGVtZW50PXs8SG9tZSAvPn0gLz5cclxuICAgICAgICAgIDxSb3V0ZSBwYXRoPVwiL3NlYXJjaFwiIGVsZW1lbnQ9ezxTZWFyY2ggLz59IC8+XHJcbiAgICAgICAgICA8Um91dGUgcGF0aD1cIi9jb21tdW5pdHlcIiBlbGVtZW50PXs8Q29tbXVuaXR5IC8+fSAvPlxyXG4gICAgICAgICAgPFJvdXRlIHBhdGg9XCIvY2hhdFwiIGVsZW1lbnQ9ezxDaGF0IC8+fSAvPlxyXG4gICAgICAgICAgPFJvdXRlIHBhdGg9XCIvc2hvcHMvZXZlbnRzXCIgZWxlbWVudD17PFNob3BFdmVudHMgLz59IC8+XHJcbiAgICAgICAgICA8Um91dGUgcGF0aD1cIi9zaG9wc1wiIGVsZW1lbnQ9ezxTaG9wcyAvPn0gLz5cclxuICAgICAgICAgIDxSb3V0ZSBwYXRoPVwiL3Nob3BzLzppZFwiIGVsZW1lbnQ9ezxTaG9wRGV0YWlsIC8+fSAvPlxyXG4gICAgICAgICAgPFJvdXRlIHBhdGg9XCIvbXlcIiBlbGVtZW50PXs8TXlQYWdlV2l0aFZpcFZvdWNoZXJCcmlkZ2UgLz59IC8+XHJcbiAgICAgICAgICB7LyogL215L2NhcmQg64qUIOuCtCDrqoXtlagg67mE7Zmc7ISx7ZmUIOKAlCBNeSDtjpjsnbTsp4DsnZgg66qF7ZWoIOuyhO2KvOycvOuhnCDthrXsnbwgKi99XHJcbiAgICAgICAgICA8Um91dGUgcGF0aD1cIi9teS9jYXJkXCIgZWxlbWVudD17PE5hdmlnYXRlIHRvPVwiL215XCIgcmVwbGFjZSAvPn0gLz5cclxuICAgICAgICAgIDxSb3V0ZSBwYXRoPVwiL2NhcmQvOnNsdWdcIiBlbGVtZW50PXs8U2ltcGxlU2F2ZWRDYXJkUGFnZSAvPn0gLz5cclxuICAgICAgICAgIHsvKiDtlZjsnIQg7Zi47ZmYOiDqtawg7KO87IaMIC9jYXJkcy86Y2FyZElkICovfVxyXG4gICAgICAgICAgPFJvdXRlIHBhdGg9XCIvY2FyZHMvOmNhcmRJZFwiIGVsZW1lbnQ9ezxOYXZpZ2F0ZSB0bz1cIi9teVwiIHJlcGxhY2UgLz59IC8+XHJcbiAgICAgICAgICA8Um91dGUgcGF0aD1cIi9hdXRoXCIgZWxlbWVudD17PEF1dGggLz59IC8+XHJcbiAgICAgICAgICA8Um91dGUgcGF0aD1cIi9icm9hZGNhc3RcIiBlbGVtZW50PXs8QnJvYWRjYXN0IC8+fSAvPlxyXG4gICAgICAgICAgPFJvdXRlIHBhdGg9XCIvYnJvYWRjYXN0LzppZFwiIGVsZW1lbnQ9ezxCcm9hZGNhc3REZXRhaWwgLz59IC8+XHJcbiAgICAgICAgICA8Um91dGUgcGF0aD1cIi9hdWRpdGlvblwiIGVsZW1lbnQ9ezxBdWRpdGlvbiAvPn0gLz5cclxuICAgICAgICAgIDxSb3V0ZSBwYXRoPVwiL2F1ZGl0aW9uLzppZFwiIGVsZW1lbnQ9ezxBdWRpdGlvbkRldGFpbCAvPn0gLz5cclxuICAgICAgICAgIDxSb3V0ZSBwYXRoPVwiL2F1ZGl0aW9uLzppZC9hcHBseVwiIGVsZW1lbnQ9ezxBdWRpdGlvbkFwcGx5IC8+fSAvPlxyXG4gICAgICAgICAgPFJvdXRlIHBhdGg9XCIvcmVnaW9uXCIgZWxlbWVudD17PFJlZ2lvblNlbGVjdFBhZ2UgLz59IC8+XHJcbiAgICAgICAgICA8Um91dGUgcGF0aD1cIi9wb3J0YWwvcmVnaW9uLzppZFwiIGVsZW1lbnQ9ezxSZWdpb24gLz59IC8+XHJcbiAgICAgICAgICA8Um91dGUgcGF0aD1cIi9wb3J0YWwvcmVnaW9uLzpyZWdpb25JZC9ub3RpY2VzXCIgZWxlbWVudD17PFJlZ2lvbk5vdGljZXMgLz59IC8+XHJcbiAgICAgICAgICA8Um91dGUgcGF0aD1cIi9yZWdpb25zLzpyZWdpb25Db2RlL3Bvc3RzXCIgZWxlbWVudD17PFJlZ2lvblBvc3RzIC8+fSAvPlxyXG4gICAgICAgICAgey8qIOKYhSDsp4Dsl60g7ZeI67iMICjsi6Dqt5wpICovfVxyXG4gICAgICAgICAgPFJvdXRlIHBhdGg9XCIvci86cmVnaW9uSWRcIiBlbGVtZW50PXs8UmVnaW9uTGF5b3V0IC8+fT5cclxuICAgICAgICAgICAgPFJvdXRlIGluZGV4IGVsZW1lbnQ9ezxSZWdpb25IdWIgLz59IC8+XHJcbiAgICAgICAgICAgIDxSb3V0ZSBwYXRoPVwiYm9hcmRcIiBlbGVtZW50PXs8UmVnaW9uQm9hcmQgLz59IC8+XHJcbiAgICAgICAgICAgIDxSb3V0ZSBwYXRoPVwiYm9hcmQvd3JpdGVcIiBlbGVtZW50PXs8UmVnaW9uQm9hcmRXcml0ZSAvPn0gLz5cclxuICAgICAgICAgICAgPFJvdXRlIHBhdGg9XCJib2FyZC86cG9zdElkXCIgZWxlbWVudD17PFJlZ2lvbkJvYXJkUG9zdCAvPn0gLz5cclxuICAgICAgICAgICAgPFJvdXRlIHBhdGg9XCJub3RpY2VzXCIgZWxlbWVudD17PFJlZ2lvbk5vdGljZXMgLz59IC8+XHJcbiAgICAgICAgICAgIDxSb3V0ZSBwYXRoPVwibWlzc2lvbnNcIiBlbGVtZW50PXs8TWlzc2lvbnMgLz59IC8+XHJcbiAgICAgICAgICAgIDxSb3V0ZSBwYXRoPVwic2hvcHNcIiBlbGVtZW50PXs8UmVnaW9uU2hvcHMgLz59IC8+XHJcbiAgICAgICAgICAgIDxSb3V0ZSBwYXRoPVwiYnJvYWRjYXN0c1wiIGVsZW1lbnQ9ezxSZWdpb25Ccm9hZGNhc3RzIC8+fSAvPlxyXG4gICAgICAgICAgICA8Um91dGUgcGF0aD1cImF1ZGl0aW9uc1wiIGVsZW1lbnQ9ezxSZWdpb25BdWRpdGlvbnMgLz59IC8+XHJcbiAgICAgICAgICAgIDxSb3V0ZSBwYXRoPVwiYXB0XCIgZWxlbWVudD17PFJlZ2lvbkFwYXJ0bWVudHMgLz59IC8+XHJcbiAgICAgICAgICAgIDxSb3V0ZSBwYXRoPVwiYXB0LzphcHRJZFwiIGVsZW1lbnQ9ezxBcGFydG1lbnRCb2FyZCAvPn0gLz5cclxuICAgICAgICAgICAgPFJvdXRlIHBhdGg9XCJuZXdzXCIgZWxlbWVudD17PFJlZ2lvbk5ld3MgLz59IC8+XHJcbiAgICAgICAgICAgIDxSb3V0ZSBwYXRoPVwiY2hhdFwiIGVsZW1lbnQ9ezxSZWdpb25DaGF0Um9vbXMgLz59IC8+XHJcbiAgICAgICAgICAgIDxSb3V0ZSBwYXRoPVwiaW50cm9cIiBlbGVtZW50PXs8UmVnaW9uSW50cm8gLz59IC8+XHJcbiAgICAgICAgICAgIDxSb3V0ZSBwYXRoPVwiZXZlbnRzXCIgZWxlbWVudD17PFJlZ2lvbkV2ZW50cyAvPn0gLz5cclxuICAgICAgICAgICAgPFJvdXRlIHBhdGg9XCJmbHllcnNcIiBlbGVtZW50PXs8UmVnaW9uRmx5ZXJzIC8+fSAvPlxyXG4gICAgICAgICAgICA8Um91dGUgcGF0aD1cImZlc3RpdmFsc1wiIGVsZW1lbnQ9ezxSZWdpb25GZXN0aXZhbHMgLz59IC8+XHJcbiAgICAgICAgICA8L1JvdXRlPlxyXG4gICAgICAgICAgPFJvdXRlIHBhdGg9XCIvcG9zdHMvOmlkXCIgZWxlbWVudD17PFBvc3REZXRhaWwgLz59IC8+XHJcbiAgICAgICAgICA8Um91dGUgcGF0aD1cIi9ub3RpY2VzXCIgZWxlbWVudD17PE5vdGljZXMgLz59IC8+XHJcbiAgICAgICAgICA8Um91dGUgcGF0aD1cIi9ub3RpY2VzLzppZFwiIGVsZW1lbnQ9ezxOb3RpY2VEZXRhaWwgLz59IC8+XHJcbiAgICAgICAgICA8Um91dGUgcGF0aD1cIi9taXNzaW9uc1wiIGVsZW1lbnQ9ezxNaXNzaW9ucyAvPn0gLz5cclxuICAgICAgICAgIDxSb3V0ZSBwYXRoPVwiL3N1cHBvcnRcIiBlbGVtZW50PXs8U3VwcG9ydCAvPn0gLz5cclxuICAgICAgICAgIDxSb3V0ZSBwYXRoPVwiL2NhcmRcIiBlbGVtZW50PXs8Q2FyZCAvPn0gLz5cclxuXHJcbiAgICAgICAgICA8Um91dGUgcGF0aD1cIi9yZWdpb25hbC1hZG1pblwiIGVsZW1lbnQ9ezxSZWdpb25hbEFkbWluQ29uc29sZSAvPn0gLz5cclxuXHJcbiAgICAgICAgICB7Lyog4piFIOq0gOumrOyekCDsvZjshpQg65287Jqw7Yq4ICjspJHssqkg65287Jqw7YyFICsgQWRtaW5MYXlvdXQg6rCA65OcKSAqL31cclxuICAgICAgICAgIDxSb3V0ZSBwYXRoPVwiL2FkbWluL2xvZ2luXCIgZWxlbWVudD17PEFkbWluTG9naW4gLz59IC8+XHJcbiAgICAgICAgICA8Um91dGUgcGF0aD1cIi9hZG1pblwiIGVsZW1lbnQ9ezxBZG1pbkxheW91dCAvPn0+XHJcbiAgICAgICAgICAgIDxSb3V0ZSBpbmRleCBlbGVtZW50PXs8QWRtaW5EYXNoYm9hcmQgLz59IC8+XHJcbiAgICAgICAgICAgIDxSb3V0ZSBwYXRoPVwicmVnaW9uc1wiIGVsZW1lbnQ9ezxBZG1pblJlZ2lvbnMgLz59IC8+XHJcbiAgICAgICAgICAgIDxSb3V0ZSBwYXRoPVwicmVnaW9ucy86cmVnaW9uSWQvYXBhcnRtZW50c1wiIGVsZW1lbnQ9ezxBZG1pbkFwYXJ0bWVudHMgLz59IC8+XHJcbiAgICAgICAgICAgIDxSb3V0ZSBwYXRoPVwic3RvcmVzXCIgZWxlbWVudD17PEFkbWluU3RvcmVzIC8+fSAvPlxyXG4gICAgICAgICAgICA8Um91dGUgcGF0aD1cIm1pc3Npb25zXCIgZWxlbWVudD17PEFkbWluTWlzc2lvbnMgLz59IC8+XHJcbiAgICAgICAgICAgIDxSb3V0ZSBwYXRoPVwidm91Y2hlcnNcIiBlbGVtZW50PXs8VmlwQWRtaW5Wb3VjaGVyc1BhZ2UgLz59IC8+XHJcbiAgICAgICAgICAgIDxSb3V0ZSBwYXRoPVwiYXVkaXRpb25zXCIgZWxlbWVudD17PEFkbWluQXVkaXRpb25zIC8+fSAvPlxyXG4gICAgICAgICAgICA8Um91dGUgcGF0aD1cImNvbnRlbnRzXCIgZWxlbWVudD17PEFkbWluQ29udGVudHMgLz59IC8+XHJcbiAgICAgICAgICAgIDxSb3V0ZSBwYXRoPVwibWVtYmVyc1wiIGVsZW1lbnQ9ezxBZG1pbk1lbWJlcnMgLz59IC8+XHJcbiAgICAgICAgICAgIDxSb3V0ZSBwYXRoPVwicG9pbnRzXCIgZWxlbWVudD17PEFkbWluUG9pbnRzIC8+fSAvPlxyXG4gICAgICAgICAgICA8Um91dGUgcGF0aD1cImxpdmUtYnJvYWRjYXN0XCIgZWxlbWVudD17PEFkbWluTGl2ZUJyb2FkY2FzdCAvPn0gLz5cclxuICAgICAgICAgICAgPFJvdXRlIHBhdGg9XCJzdXBwbGllc1wiIGVsZW1lbnQ9ezxBZG1pblN1cHBsaWVzIC8+fSAvPlxyXG4gICAgICAgICAgICA8Um91dGUgcGF0aD1cInN1cHBseS1tYW5hZ2Vyc1wiIGVsZW1lbnQ9ezxBZG1pblN1cHBseU1hbmFnZXJzIC8+fSAvPlxyXG4gICAgICAgICAgICA8Um91dGUgcGF0aD1cInN1cHBseS10b29sc1wiIGVsZW1lbnQ9ezxBZG1pblN1cHBseVRvb2xzIC8+fSAvPlxyXG4gICAgICAgICAgICA8Um91dGUgcGF0aD1cImJhY2t1cC10b29sc1wiIGVsZW1lbnQ9ezxBZG1pbkJhY2t1cFRvb2xzIC8+fSAvPlxyXG4gICAgICAgICAgPC9Sb3V0ZT5cclxuXHJcbiAgICAgICAgICB7LyogNDA0IGZhbGxiYWNrICovfVxyXG4gICAgICAgICAgPFJvdXRlXHJcbiAgICAgICAgICAgIHBhdGg9XCIqXCJcclxuICAgICAgICAgICAgZWxlbWVudD17PGRpdiBzdHlsZT17eyBwYWRkaW5nOiAyNCB9fT7tjpjsnbTsp4Drpbwg7LC+7J2EIOyImCDsl4bsirXri4jri6QgKDQwNCk8L2Rpdj59XHJcbiAgICAgICAgICAvPlxyXG4gICAgICAgIDwvUm91dGVzPlxyXG4gICAgICAgIDwvU3VzcGVuc2U+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgICB7LyogZW5zdXJlIGFwcC1ib2R5IHNjcm9sbCByZXNldHMgb24gcm91dGUgY2hhbmdlICovfVxyXG4gICAgICA8U2Nyb2xsVG9Ub3AgYXBwQm9keVJlZj17YXBwQm9keVJlZn0gLz5cclxuICAgICAgey8qIEdsb2JhbCBib3R0b20gbmF2aWdhdGlvbiDigJQgcmVuZGVyZWQgb25jZSBmb3IgYWxsIHJvdXRlcyAqL31cclxuICAgICAgPEFwcEJvdHRvbU5hdlxyXG4gICAgICAgIGlzTG9nZ2VkSW49e2F1dGhTdGF0ZS5pc0xvZ2dlZElufVxyXG4gICAgICAgIGF1dGhSZWFkeT17YXV0aFN0YXRlLmF1dGhSZWFkeX1cclxuICAgICAgICBvbkxvZ291dD17KCkgPT4gc2V0QXV0aFN0YXRlKHsgaXNMb2dnZWRJbjogZmFsc2UsIGF1dGhSZWFkeTogdHJ1ZSB9KX1cclxuICAgICAgLz5cclxuICAgICAgPEdsb2JhbENoYXRGbG9hdGluZ0JhZGdlIGlzTG9nZ2VkSW49e2F1dGhTdGF0ZS5pc0xvZ2dlZElufSAvPlxyXG4gICAgPC9kaXY+XHJcbiAgKTtcclxufVxyXG4iXSwiZmlsZSI6IkM6L1VzZXJzL2ttaC9EZXNrdG9wL3NtaS1wcm9qZWN0L3NyYy9BcHAuanN4In0=
