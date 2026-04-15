import { Routes, Route, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useLayoutEffect, useState, useRef, useMemo, lazy, Suspense } from "react";
import { createPortal } from "react-dom";
import { isAdminAuthenticatedLocal } from "./lib/adminAuth";
import { ensureMemberProfile } from "./lib/memberStore";
import * as storageAdapter from "./lib/storageAdapter";
import * as shopStore from "./lib/shopStore";
import {
  hydrateAuthFromServer,
  isLoggedIn as isLoggedInMemory,
  getCurrentRegionId,
  getSession,
  getCurrentUser,
  isAuthReady,
  signOut,
} from "./lib/authStore";
import { boot } from "./lib/authStore";
import { syncOnAppStart } from "./lib/syncManager";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Community from "./pages/Community";
import ComingSoon from "./pages/ComingSoon";
import Chat from "./pages/Chat";
import Shops from "./pages/Shops";
import ShopEvents from "./pages/ShopEvents";
import ShopDetail from "./pages/ShopDetail";
import My from "./pages/My";
import Auth from "./pages/Auth";
import Broadcast from "./pages/broadcast/Broadcast";
import BroadcastView from "./pages/broadcast/BroadcastView";
import BroadcastDetail from "./pages/BroadcastDetail";
import Audition from "./pages/audition/Audition";
import AuditionView from "./pages/audition/AuditionView";
import AuditionDetail from "./pages/AuditionDetail";
import AuditionApply from "./pages/audition/AuditionApply";
import Region from "./pages/Region";
import RegionSelectPage from "./pages/RegionSelectPage";
import RegionPosts from "./pages/RegionPosts";
import RegionNotices from "./pages/RegionNotices";
import RegionLayout from "./pages/RegionLayout";
import RegionHub from "./pages/RegionHub";
import RegionBoard from "./pages/RegionBoard";
import RegionBoardWrite from "./pages/RegionBoardWrite";
import RegionBoardPost from "./pages/RegionBoardPost";
// import RegionMissions from "./pages/RegionMissions";
import RegionShops from "./pages/RegionShops";
import RegionApartments from "./pages/RegionApartments";
import ApartmentBoard from "./pages/ApartmentBoard";
import RegionNews from "./pages/RegionNews";
import RegionBroadcasts from "./pages/RegionBroadcasts";
import RegionAuditions from "./pages/RegionAuditions";
import RegionIntro from "./pages/RegionIntro";
import RegionEvents from "./pages/RegionEvents";
import RegionFlyers from "./pages/RegionFlyers";
import RegionFestivals from "./pages/RegionFestivals";
import RegionChatRooms from "./pages/RegionChatRooms";
import PostDetail from "./pages/PostDetail";
import Notices from "./pages/Notices";
import Missions from "./pages/Missions";
import Support from "./pages/Support";
import Card from "./pages/Card";

// ⚡ 코드 스플리팅: 관리자 페이지는 lazy loading
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminRegions = lazy(() => import("./pages/admin/AdminRegions"));
const AdminApartments = lazy(() => import("./pages/admin/AdminApartments"));
const AdminStores = lazy(() => import("./pages/admin/AdminStores"));
const AdminMissions = lazy(() => import("./pages/admin/AdminMissions"));
const AdminContents = lazy(() => import("./pages/admin/AdminContents"));
const AdminMembers = lazy(() => import("./pages/admin/AdminMembers"));
const AdminAuditions = lazy(() => import("./pages/admin/AdminAuditions"));
const AdminPoints = lazy(() => import("./pages/admin/AdminPoints"));
const AdminLiveBroadcast = lazy(() => import("./pages/admin/AdminLiveBroadcast"));
const AdminSupplies = lazy(() => import("./pages/admin/AdminSupplies"));
const AdminSupplyManagers = lazy(() => import("./pages/admin/AdminSupplyManagers"));
const AdminSupplyTools = lazy(() => import("./pages/admin/AdminSupplyTools"));
const AdminBackupTools = lazy(() => import("./pages/admin/AdminBackupTools"));
const RegionalAdminConsole = lazy(() => import("./pages/admin/RegionalAdminConsole"));
import "./styles/App.css";

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
    content: "준비 중인 방송\A곧 새 콘텐츠가 공개됩니다\A\A공유 방송\A탭하면 팝업으로 재생됩니다";
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
    content: "탭하면 재생됩니다";
    display: block;
    margin-top: 2px;
    font-size: 11px;
    font-weight: 500;
    color: #6b7280;
  }

  .su-home .su-panel:nth-of-type(6) .su-carousel__track:empty::after {
    content: "준비 중인 오디션\A곧 새 영상이 공개됩니다\A\A오디션\A응모 · TOP3 투표";
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
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
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
    fetch("/api/banners?type=bottom_banner&is_active=true")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!mounted) return;
        const list = (data && (data.banners || data.data)) || [];
        setBottomBanner(Array.isArray(list) && list.length ? list[0] : null);
      })
      .catch(() => {
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

  const isPortalActive =
    currentPath === "/region" ||
    currentPath.startsWith("/portal/region/") ||
    /^\/r\/[^/]+(?:\/.*)?$/.test(currentPath);

  const tabs = [
    {
      key: "home",
      label: "홈",
      active: currentPath === "/home" || currentPath === "/",
      onClick: () => navigate("/home"),
    },
    {
      key: "auth",
      label: authReady ? (isLoggedIn ? "로그아웃" : "로그인") : " ",
      tone: isLoggedIn ? "danger" : undefined,
      active: false,
      onClick: async () => {
        if (!authReady) return;
        if (!isLoggedIn) {
          navigate("/auth");
          return;
        }
        setShowLogoutConfirm(true);
      },
    },
    {
      key: "portal",
      label: "내지역포털",
      active: isPortalActive,
      onClick: () => {
        if (memberRegionId) {
          try {
            localStorage.setItem("selectedRegionId", memberRegionId);
          } catch (e) {
            // noop
          }
          navigate(`/r/${memberRegionId}`);
          return;
        }
        navigate("/region");
      },
    },
    {
      key: "my",
      label: "마이오피스",
      active: currentPath === "/my" || currentPath === "/myoffice" || currentPath.startsWith("/my/"),
      onClick: () => {
        if (!isLoggedIn) {
          navigate("/auth", { state: { returnTo: "/my" } });
          return;
        }
        navigate("/my");
      },
    },
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
    pointerEvents: "none",
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
    WebkitBackdropFilter: "blur(8px)",
  };

  const bannerStyle = {
    position: "fixed",
    left: "50%",
    transform: "translateX(-50%)",
    bottom: "calc(env(safe-area-inset-bottom, 0px) + 66px)",
    width: "min(calc(100vw - 20px), 438px)",
    zIndex: 9998,
    background: "transparent",
    border: "none",
    borderRadius: 0,
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: 0,
    boxShadow: "none",
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutConfirm(false);
    try {
      await signOut();
    } catch (e) {
      console.error("[AppBottomNav] Logout error:", e);
    }
    try {
      onLogout?.();
    } catch (e) {
      // noop
    }
    navigate("/home");
  };

  const logoutOverlayStyle = {
    position: "fixed",
    inset: 0,
    zIndex: 10000,
    background: "rgba(7, 15, 23, 0.48)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
  };

  const logoutModalStyle = {
    position: "fixed",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: "min(calc(100vw - 28px), 380px)",
    zIndex: 10001,
    borderRadius: 24,
    padding: "22px 20px 18px",
    background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(240,249,255,0.97) 100%)",
    border: "1px solid rgba(14,116,144,0.16)",
    boxShadow: "0 20px 50px rgba(15,23,42,0.18)",
    boxSizing: "border-box",
  };

  const logoutBadgeStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44,
    height: 44,
    borderRadius: 14,
    background: "linear-gradient(135deg, rgba(14,116,144,0.14), rgba(34,211,238,0.22))",
    color: "#0e7490",
    fontSize: 20,
    marginBottom: 12,
  };

  const logoutTitleStyle = {
    fontSize: 20,
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.03em",
    marginBottom: 8,
  };

  const logoutTextStyle = {
    fontSize: 14,
    lineHeight: 1.6,
    color: "#475569",
    marginBottom: 18,
  };

  const logoutButtonRowStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  };

  const logoutCancelButtonStyle = {
    height: 46,
    borderRadius: 14,
    border: "1px solid rgba(148,163,184,0.28)",
    background: "rgba(255,255,255,0.92)",
    color: "#475569",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  };

  const logoutConfirmButtonStyle = {
    height: 46,
    borderRadius: 14,
    border: "1px solid rgba(14,116,144,0.18)",
    background: "linear-gradient(135deg, #0e7490 0%, #155e75 100%)",
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 800,
    boxShadow: "0 8px 18px rgba(14,116,144,0.24)",
    cursor: "pointer",
  };

  return (
    <>
      {bottomBanner && !bannerClosed ? (
        <div style={bannerStyle}>
          {bottomBanner.link_url ? (
            <a
              href={bottomBanner.link_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ flex: 1, display: "flex", alignItems: "center", textDecoration: "none", minWidth: 0 }}
            >
              {bottomBanner.image_url ? (
                <img
                  src={bottomBanner.image_url}
                  alt={bottomBanner.alt || "광고"}
                  style={{ height: 40, maxWidth: "100%", objectFit: "contain", display: "block" }}
                />
              ) : (
                <span style={{ fontSize: 13, color: "#0f172a" }}>{bottomBanner.alt || "광고"}</span>
              )}
            </a>
          ) : (
            <div style={{ flex: 1, minWidth: 0 }}>
              {bottomBanner.image_url ? (
                <img
                  src={bottomBanner.image_url}
                  alt={bottomBanner.alt || "광고"}
                  style={{ height: 40, maxWidth: "100%", objectFit: "contain", display: "block" }}
                />
              ) : (
                <span style={{ fontSize: 13, color: "#0f172a" }}>{bottomBanner.alt || "광고"}</span>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              setBannerClosed(true);
              try {
                sessionStorage.setItem("su_banner_closed", "1");
              } catch (e) {
                // noop
              }
            }}
            aria-label="배너 닫기"
            style={{
              border: 0,
              background: "transparent",
              color: "#94a3b8",
              fontSize: 18,
              lineHeight: 1,
              padding: "4px 2px 4px 6px",
              cursor: "pointer",
            }}
          >
            x
          </button>
        </div>
      ) : null}

      <div style={navShellStyle}>
        <nav style={navStyle} role="navigation" aria-label="하단 네비게이션">
          {tabs.map((tab) => {
            const isActive = !!tab.active;
            const isDanger = tab.tone === "danger";
            return (
              <button
                key={tab.key}
                type="button"
                onClick={tab.onClick}
                aria-current={isActive ? "page" : undefined}
                style={{
                  appearance: "none",
                  WebkitAppearance: "none",
                  minWidth: 0,
                  height: 30,
                  padding: "1px 4px 0",
                  borderRadius: 8,
                  border: isActive ? "1px solid rgba(13,148,136,0.46)" : "1px solid rgba(148,163,184,0.16)",
                  background: isActive
                    ? "linear-gradient(180deg, rgba(45,212,191,0.22), rgba(15,118,110,0.14))"
                    : "linear-gradient(180deg, rgba(255,255,255,0.74), rgba(248,250,252,0.62))",
                  color: isActive ? "#0f766e" : isDanger ? "#dc2626" : "#475569",
                  boxShadow: isActive ? "0 0 8px rgba(20,184,166,0.18)" : "none",
                  fontSize: tab.key === "portal" ? 10.5 : 11,
                  fontWeight: isActive ? 800 : 700,
                  letterSpacing: "-0.02em",
                  textShadow: isActive
                    ? "0 0 4px rgba(45,212,191,0.24)"
                    : isDanger
                      ? "0 0 3px rgba(248,113,113,0.2)"
                      : "none",
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
                  transition: "background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
                }}
              >
                <span style={{ lineHeight: 1 }}>{tab.label}</span>
                <span
                  aria-hidden="true"
                  style={{
                    display: "block",
                    width: isActive ? "52%" : "0%",
                    height: 1.5,
                    borderRadius: 999,
                    background: "linear-gradient(90deg,#22d3ee,#2dd4bf)",
                    boxShadow: isActive ? "0 0 4px rgba(45,212,191,0.38)" : "none",
                    opacity: isActive ? 1 : 0,
                    transition: "width 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease",
                  }}
                />
              </button>
            );
          })}
        </nav>
      </div>
      {showLogoutConfirm ? createPortal(
        <>
          <div style={logoutOverlayStyle} onClick={() => setShowLogoutConfirm(false)} aria-hidden="true" />
          <div role="dialog" aria-modal="true" aria-labelledby="logout-modal-title" style={logoutModalStyle}>
            <div style={{ textAlign: "center" }}>
              <div style={logoutBadgeStyle}>↗</div>
              <div id="logout-modal-title" style={logoutTitleStyle}>로그아웃</div>
              <div style={logoutTextStyle}>현재 계정에서 로그아웃하시겠습니까?<br />언제든 다시 로그인할 수 있습니다.</div>
            </div>
            <div style={logoutButtonRowStyle}>
              <button type="button" onClick={() => setShowLogoutConfirm(false)} style={logoutCancelButtonStyle}>취소</button>
              <button type="button" onClick={handleLogoutConfirm} style={logoutConfirmButtonStyle}>로그아웃</button>
            </div>
          </div>
        </>,
        document.body
      ) : null}
    </>
  );
}

function ScrollToTop({ appBodyRef }) {
  // useLocation triggers when the route changes; ensure the single vertical scroller
  // (.su-appBody) is reset to top. Do NOT use window.scrollTo per requirement.
  const location = useLocation();
  useEffect(() => {
    try {
      if (appBodyRef && appBodyRef.current) appBodyRef.current.scrollTop = 0;
    } catch (e) {
      // noop
    }
  }, [location, appBodyRef]);
  return null;
}

const VIP_VOUCHER_TITLE = "지역공유발전플랫폼 VIP 상품권";
const VIP_VOUCHER_TYPE = "SHOP_USE";
const VIP_META_MARKER = "__VIPMETA__";
const VIP_API_BASE = import.meta.env.VITE_API_URL || "";
const SHOP_VOUCHER_PAYMENT_CACHE_KEY = "su_shop_voucher_payments_v2";

function formatVoucherAmount(value) {
  const amount = Number(value) || 0;
  return `${amount.toLocaleString("ko-KR")}원`;
}

const KST_LOCALE = "ko-KR";
const KST_TIME_ZONE = "Asia/Seoul";

function parseKSTDateValue(value) {
  if (!value && value !== 0) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
  }
  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    if (/^\d+$/.test(trimmed)) {
      const date = new Date(Number(trimmed));
      return Number.isNaN(date.getTime()) ? null : date;
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
        Number(millisecond.padEnd(3, "0")),
      ));
    }

    const date = new Date(trimmed);
    return Number.isNaN(date.getTime()) ? null : date;
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
    day: "numeric",
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
    hour12: true,
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
    hour12: true,
  }).format(date);
}

function formatVoucherDate(value) {
  return formatKSTDate(value);
}

function formatVoucherDateTime(value) {
  return formatKSTDateTime(value);
}

function buildVoucherDateKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
}

function generateVoucherSerial() {
  const now = new Date();
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
      shopName: "",
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
      shopName: String(meta?.shopName || "").trim(),
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
      shopName: "",
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
    // noop
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
    usedAt: String(record.usedAt || new Date().toISOString()).trim(),
    issueRegion: String(record.issueRegion || "").trim(),
    reason: String(record.reason || "상점결제").trim(),
    status: String(record.status || "used").trim(),
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
    usedAt: String(record.usedAt || new Date().toISOString()).trim(),
    issueRegion: String(record.issueRegion || "").trim(),
    reason: String(record.reason || "상점결제").trim(),
    status: "used",
  };
}

function mergeShopVoucherPaymentRecords(...groups) {
  const merged = [];
  const seen = new Set();
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
  return (Array.isArray(history) ? history : [])
    .filter((entry) => {
      const amount = Number(entry?.amount) || 0;
      const source = String(entry?.source || "").toUpperCase();
      if (amount <= 0) return false;
      // 운영에서 source 표기가 달라도 상점 유입성 row는 표시되도록 허용
      return source === "VOUCHER_SHOP_TRANSFER_IN" || source === "SHOP_TRANSFER_IN" || source === "SHOP_IN";
    })
    .map((entry) => {
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
        reason: parsed.reason || "상점결제",
        status: "used",
      });
    })
    .filter(Boolean);
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
    usedAt: new Date().toISOString(),
    issueRegion: parsed.issueRegion,
    reason: "상점결제",
    status: "used",
  };
}

function sanitizeVipAmountLabels(root = document.body) {
  if (!root?.querySelectorAll) return;
  const elements = root.querySelectorAll(".su-vip-badge, div, span, p, strong");
  elements.forEach((element) => {
    if (!element || element.childElementCount > 0) return;
    const text = String(element.textContent || "");
    if (!text || !(/VIP/.test(text) && /장/.test(text))) return;
    let next = text;
    next = next.replace(/🎟️\s*VIP\s*([0-9][0-9,]*)장/g, (_, value) => `🎟️ VIP ${formatVoucherAmount(Number(String(value).replace(/,/g, "")))}`);
    next = next.replace(/VIP 상품권\s*([0-9][0-9,]*)장/g, (_, value) => `VIP 상품권 ${formatVoucherAmount(Number(String(value).replace(/,/g, "")))}`);
    next = next.replace(/VIP\s*([0-9][0-9,]*)장/g, (_, value) => `VIP ${formatVoucherAmount(Number(String(value).replace(/,/g, "")))}`);
    if (next !== text) {
      element.textContent = next;
    }
  });
}

function VoucherFetchRecorder() {
  useEffect(() => {
    if (window.__suVipVoucherFetchRecorderInstalled) return undefined;
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
        // noop
      }
      return response;
    };
    return undefined;
  }, []);

  return null;
}

function ShopVoucherPaymentBridge() {
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
    return formatted === "-" ? "날짜 미상" : `${formatted}.`;
  };
  const normalizePayoutRequest = (entry, index) => ({
    id: entry?.requestId || entry?.request_id || entry?.id || `payout-${index}`,
    amount: Number(entry?.amount || 0),
    requestedAt: entry?.requestedAt || entry?.requested_at || entry?.createdAt || entry?.created_at || "",
    status: String(entry?.status || "PENDING").toUpperCase(),
  });
  const getPayoutStatusUi = (status) => {
    if (status === "PENDING") {
      return {
        icon: "🕒",
        label: "지급신청중",
        color: "#f59e0b",
        background: "rgba(245, 158, 11, 0.16)",
        borderColor: "rgba(245, 158, 11, 0.34)",
      };
    }
    return {
      icon: "✅",
      label: "지급완료",
      color: "#22c55e",
      background: "rgba(34, 197, 94, 0.16)",
      borderColor: "rgba(34, 197, 94, 0.34)",
    };
  };

  const fetchBridgeJson = async (path) => {
    const response = await fetch(`${VIP_API_BASE}${path}`, { credentials: "include" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data?.error || data?.message || response.statusText || "요청 실패");
      error.status = response.status;
      throw error;
    }
    return data;
  };

  useEffect(() => {
    if (location.pathname !== "/my") {
      setMountNode(null);
      return undefined;
    }

    const ensureMountNode = () => {
      const panels = Array.from(document.querySelectorAll("section.su-panel"));
      const shopPanel = panels.find((panel) => String(panel.textContent || "").includes("🏪 상점 포인트"));
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
    if (location.pathname !== "/my") return undefined;
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
    if (location.pathname !== "/my") return undefined;
    const session = getSession();
    const currentUser = getCurrentUser();
    const memberId = String(session?.memberId || currentUser?.memberId || currentUser?.id || "").trim();
    if (!memberId) {
      setOwnedShops([]);
      return undefined;
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

    const textNodes = Array.from(shopPanelNode.querySelectorAll("div, span, strong"))
      .map((node) => String(node.textContent || "").trim())
      .filter(Boolean);
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
    if (location.pathname !== "/my") return undefined;
    const selectedShopId = String(activeShopId || "").trim();
    if (!selectedShopId) {
      setShopEarned(0);
      setShopAvailable(0);
      setShopLedger([]);
      setShopLedgerExpanded(false);
      setPayoutRequests([]);
      return undefined;
    }

    let mounted = true;
    const loadShopPointSummary = async () => {
      try {
        setShopLedgerLoading(true);
        setPayoutLoading(true);
        const [earnedRes, availableRes, ledgerRes, payoutRes] = await Promise.allSettled([
          fetchBridgeJson(`/api/shops/${encodeURIComponent(selectedShopId)}/points/earned`),
          fetchBridgeJson(`/api/shops/${encodeURIComponent(selectedShopId)}/points/available`),
          fetchBridgeJson(`/api/shops/${encodeURIComponent(selectedShopId)}/points/ledger?limit=${shopLedgerExpanded ? 50 : 5}`),
          shopStore.loadUnifiedShopPayoutRequests(selectedShopId),
        ]);
        if (!mounted) return;
        setShopEarned(earnedRes.status === "fulfilled" ? Number(earnedRes.value?.totalEarned || earnedRes.value?.total || 0) : 0);
        setShopAvailable(availableRes.status === "fulfilled" ? Number(availableRes.value?.available || 0) : 0);
        setShopLedger(ledgerRes.status === "fulfilled" && Array.isArray(ledgerRes.value?.ledger) ? ledgerRes.value.ledger : []);
        setPayoutRequests(
          payoutRes.status === "fulfilled" && Array.isArray(payoutRes.value?.requests)
            ? payoutRes.value.requests.map(normalizePayoutRequest)
            : []
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
  const selectedShopRecords = records
    .filter((entry) => String(entry?.shopId || "").trim() === selectedShopId)
    .slice(0, 6);
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
    <div style={{ borderRadius: 18, padding: "14px 14px", background: "linear-gradient(180deg, #ffffff, #f8fafc)", border: "1px solid #cbd5e1", marginBottom: isExpanded ? 16 : 10, boxShadow: "0 8px 20px rgba(15,23,42,0.08)" }}>
      <button type="button" onClick={() => setIsExpanded((value) => !value)} style={{ width: "100%", display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", alignItems: "center", gap: 12, background: "transparent", border: "none", color: "#0f172a", padding: 0, cursor: "pointer", outline: "none", boxShadow: "none", WebkitTapHighlightColor: "transparent", WebkitAppearance: "none", appearance: "none" }}>
        <div style={{ textAlign: "left", minWidth: 0, display: "grid", gap: 8 }}>
          <div style={{ fontWeight: 900, fontSize: 14, color: "#0f172a", letterSpacing: "0.2px", textTransform: "uppercase" }}>🏪 상점 지갑</div>
          <div style={{ marginTop: 6, fontSize: 13, color: "#334155", fontWeight: 700 }}>{selectedShop?.name || selectedShop?.shopId || "상점 선택 대기"}</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 34, flexWrap: "wrap" }}>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>총 적립</div>
              <div style={{ marginTop: 2, fontSize: "clamp(15px,4.5vw,18px)", fontWeight: 800, color: "#1e293b", whiteSpace: "nowrap" }}>{earnedText}</div>
            </div>
            <div style={{ textAlign: "left", marginLeft: 8 }}>
              <div style={{ fontSize: 11, color: "#0f766e", fontWeight: 800 }}>가용 잔액</div>
              <div style={{ marginTop: 2, fontSize: "clamp(17px,5vw,21px)", fontWeight: 900, color: "#0f766e", textShadow: "none", whiteSpace: "nowrap" }}>{availableText}</div>
            </div>
          </div>
        </div>
        <div style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#e2e8f0", color: "#0f172a", fontSize: 16, fontWeight: 900 }}>
          {isExpanded ? "−" : "+"}
        </div>
      </button>
      {isExpanded ? (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 12, fontWeight: 900, color: "#0f172a", marginBottom: 8 }}>최근 적립 원장</div>
          {shopLedgerLoading ? <div style={{ fontSize: 12, color: "#64748b", padding: "6px 0" }}>원장을 불러오는 중입니다...</div> : null}
          {!shopLedgerLoading && shopLedger.length === 0 ? <div style={{ fontSize: 12, color: "#64748b", padding: "6px 0" }}>최근 적립 내역이 없습니다.</div> : null}
          {!shopLedgerLoading && shopLedger.length > 0 ? (
            <div style={{ display: "grid", gap: 6 }}>
              {visibleShopLedger.map((entry, index) => (
                <div key={`${entry.earningId || entry.sourceTxId || "ledger"}-${index}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{entry.buyerName || entry.buyerMemberId || "회원"} 결제</div>
                    <div style={{ marginTop: 3, fontSize: 11, color: "#64748b" }}>{formatVoucherDateTime(entry.createdAt)}</div>
                  </div>
                  <div style={{ flexShrink: 0, fontSize: 13, fontWeight: 900, color: "#0f766e" }}>+{formatPointAmount(entry.amount)}</div>
                </div>
              ))}
              {hasMoreShopLedger && !shopLedgerExpanded ? (
                <button
                  type="button"
                  onClick={() => setShopLedgerExpanded(true)}
                  style={{ minHeight: 38, borderRadius: 10, border: "1px solid #99f6e4", background: "#ecfeff", color: "#0f766e", fontSize: 12, fontWeight: 800, cursor: "pointer" }}
                >
                  더보기
                </button>
              ) : null}
              {shopLedgerExpanded && shopLedger.length > 4 ? (
                <button
                  type="button"
                  onClick={() => setShopLedgerExpanded(false)}
                  style={{ minHeight: 38, borderRadius: 10, border: "1px solid #cbd5e1", background: "#f8fafc", color: "#475569", fontSize: 12, fontWeight: 800, cursor: "pointer" }}
                >
                  접기
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>,
    headerNode
  ) : null;

  const payoutPortal = mountNode ? createPortal(
    <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
      <div style={{ borderRadius: 12, border: "1px solid rgba(14,116,144,0.2)", background: "rgba(14,116,144,0.06)", padding: "10px 12px", marginBottom: 8 }} data-wallet-guide-version="shop-v3-20260411">
        <div style={{ fontSize: 12, fontWeight: 800, color: "#0f766e", marginBottom: 4 }}>상점 지갑 안내</div>
        <div style={{ fontSize: 12, lineHeight: 1.7, color: "#475569" }}>
          {/* 이전버전 안내문 삭제됨 */}
          VIP 상품권은 상점 적립금이 아닙니다. 아래 받은 이력에서만 확인해 주세요.<br />
          지급요청은 가용 잔액을 확인한 뒤 지급요청 버튼을 눌러 신청해 주세요.
        </div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 900, color: "#0f172a", marginBottom: 2 }}>VIP 상품권 받은 이력</div>
      {selectedShopRecords.length === 0 ? <div style={{ fontSize: 13, color: "#64748b", padding: "4px 0" }}>받은 상품권 이력이 없습니다.</div> : null}
      {selectedShopRecords.map((record, index) => (
        <div key={`${record.serial}-${record.userId || "user"}-${index}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{record.userName || record.userId || "회원"} 결제 수신</div>
            <div style={{ marginTop: 2, fontSize: 12, color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{formatVoucherDateTime(record.usedAt)}</div>
            <div style={{ marginTop: 2, fontSize: 12, color: "#64748b", wordBreak: "break-all", overflowWrap: "anywhere" }}>{record.serial}</div>
          </div>
          <div style={{ flexShrink: 0, fontSize: 13, fontWeight: 900, color: "#0f766e" }}>+{formatCompactPointAmount(record.amount)}</div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => {
          try {
            window.dispatchEvent(new CustomEvent("su:shop:payout:open", { detail: { shopId: selectedShopId } }));
          } catch (error) {}
        }}
        disabled={!selectedShopId}
        style={{ minHeight: 44, borderRadius: 12, border: "none", background: "linear-gradient(90deg,#0f766e,#0ea5a3)", color: "#effffb", fontSize: 14, fontWeight: 900, cursor: selectedShopId ? "pointer" : "default", opacity: selectedShopId ? 1 : 0.5 }}
      >
        지급요청
      </button>

      <div style={{ fontSize: 13, fontWeight: 900, color: "#0f172a", marginTop: 4 }}>최근 지급요청</div>
      {payoutLoading ? <div style={{ fontSize: 13, color: "#64748b", padding: "4px 0" }}>지급요청을 불러오는 중입니다...</div> : null}
      {!payoutLoading && sortedPayoutRequests.length === 0 ? <div style={{ fontSize: 13, color: "#64748b", padding: "4px 0" }}>최근 요청이 없습니다.</div> : null}
      {!payoutLoading && sortedPayoutRequests.map((request) => {
        const statusUi = getPayoutStatusUi(request.status);
        return (
          <div key={request.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <div style={{ minWidth: 0, flex: 1, fontSize: 14, fontWeight: 700, color: "#334155", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {formatPayoutDate(request.requestedAt)} · {formatCompactPointAmount(request.amount)}
            </div>
            <div style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 5, minHeight: 30, padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, color: statusUi.color, background: statusUi.background, border: `1px solid ${statusUi.borderColor}` }}>
              <span>{statusUi.icon}</span>
              <span>{statusUi.label}</span>
            </div>
          </div>
        );
      })}
    </div>,
    mountNode
  ) : null;

  return (
    <>
      <style>{`
        section.su-panel[data-shop-wallet-bridge-active="true"] > :not([data-shop-wallet-header-root="true"]):not([data-shop-voucher-record-root="true"]) {
          display: none !important;
        }
        section.su-panel[data-shop-wallet-bridge-active="true"] > [data-shop-wallet-header-root="true"],
        section.su-panel[data-shop-wallet-bridge-active="true"] > [data-shop-voucher-record-root="true"] {
          display: block !important;
        }
      `}</style>
      {headerPortal}
      {payoutPortal}
    </>
  );
}

function VipAmountDisplayBridge() {
  const location = useLocation();

  useEffect(() => {
    const apply = () => sanitizeVipAmountLabels(document.body);
    apply();
    const observer = new MutationObserver(() => apply());
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [location.pathname]);

  return (
    <style>{`
      .su-shop-card--vip .su-vip-badge,
      .su-shop-card--regular .su-vip-badge,
      .su-shop-card .su-vip-badge {
        display: none !important;
      }
    `}</style>
  );
}

function VipMemberSummaryBridge() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/my") return undefined;

    const apply = () => {
      const panels = Array.from(document.querySelectorAll("section.su-panel"));
      const targetPanel = panels.find((panel) => String(panel.textContent || "").includes("🎟️ VIP 상품권"));
      if (!targetPanel) return;

      const recentIssuedLabel = Array.from(targetPanel.querySelectorAll("div, span"))
        .find((node) => String(node.textContent || "").trim().startsWith("최근 발행일:"));
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

function MyOfficeHeroCleanupBridge() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/my") return undefined;

    const apply = () => {
      const allNodes = Array.from(document.querySelectorAll("div, span, button"));

      allNodes.forEach((node) => {
        const text = String(node.textContent || "").trim();

        if (text === "상점 QR 보기" || text === "PNG 저장") {
          const button = node.closest("button") || node;
          if (button instanceof HTMLElement) {
            button.style.display = "none";
          }
          return;
        }

        const compactText = text.replace(/\s+/g, " ");
        if (/^총 적립\s*[+\-]?[0-9,]+\s*P\s*[·|]\s*사용\s*[+\-]?[0-9,]+\s*P$/i.test(compactText)) {
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
    layout: "soft",
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
    layout: "rightpanel",
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
    layout: "band",
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
    layout: "topbar",
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
    layout: "corner",
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
    layout: "split",
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
    layout: "bottomline",
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
    layout: "stripe",
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
    layout: "topbar",
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
    layout: "minimal-dark",
  },
};

const CARD_META_PREFIX = "__card_meta__";

function normalizeCardSlugInput(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "")
    .slice(0, 48);
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
    value: String(value || "").trim(),
  }));
  return [...(Array.isArray(preservedLinks) ? preservedLinks : []), ...metaLinks];
}

function simplifyWebsiteLabel(value) {
  return String(value || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "");
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
    cardPublic: true,
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
      cardPublic: record?.cardPublic !== false,
    },
    preservedLinks,
    themeKey: resolvedThemeKey,
    orientation: resolveCardOrientation(meta.orientation || CARD_THEME_PRESETS[resolvedThemeKey]?.orientation || "horizontal"),
    slug: normalizeCardSlugInput(record?.cardSlug || ""),
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
        orientation,
      },
      preservedLinks
    ),
    template: themeKey,
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
    } catch (error) {}
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
    } catch (error) {}
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
  if (!ctx) throw new Error("이미지 생성 컨텍스트를 만들 수 없습니다.");

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
    Array.from(String(form.name || "").trim() || "이름").slice(0, 4).forEach((char, index) => {
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
    ctx.fillText(String(form.name || "").trim() || "이름", 72, cursorY + 16);
    cursorY += 94;

    if (infoLines.length) {
      ctx.fillStyle = theme.body;
      ctx.font = "600 28px Segoe UI";
      ctx.fillText(infoLines.join("  ·  "), 72, cursorY);
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
      await navigator.share({ title: form.name || "명함", text: shareText, files: [file] });
      return "shared";
    }
    await navigator.share({ title: form.name || "명함", text: shareText });
    return "shared";
  }
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(shareText || form.name || "명함");
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

  return (
    <div style={{ borderRadius: 28, padding: 22, background: theme.previewBackground, color: theme.title, border: `1px solid ${theme.border}`, boxShadow: `0 22px 42px ${theme.glow}`, position: "relative", overflow: "hidden", minHeight: cardOrientation === "vertical" ? 420 : 280 }}>
      <div style={{ position: "absolute", inset: 0, background: theme.dark ? "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0) 48%)" : "linear-gradient(135deg, rgba(255,255,255,0.52), rgba(255,255,255,0) 44%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: -80, top: -110, width: 260, height: 260, borderRadius: "50%", background: `radial-gradient(circle, ${theme.foil}33 0%, rgba(255,255,255,0) 72%)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", left: -40, bottom: -90, width: 220, height: 220, borderRadius: "50%", background: theme.dark ? "radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 72%)" : "radial-gradient(circle, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0) 72%)", pointerEvents: "none" }} />
      {layout === "stripe" && cardOrientation === "horizontal" ? <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 10, background: theme.foil }} /> : null}
      {layout === "topbar" ? <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: 12, background: theme.foil }} /> : null}
      {layout === "bottomline" ? <div style={{ position: "absolute", left: 26, right: 26, bottom: 16, height: 4, borderRadius: 999, background: theme.foil }} /> : null}
      {layout === "band" && cardOrientation === "horizontal" ? <div style={{ position: "absolute", left: 18, right: 18, top: 84, height: 56, borderRadius: 18, background: theme.panelBackground }} /> : null}
      {layout === "corner" ? <div style={{ position: "absolute", top: -26, right: -24, width: 120, height: 120, borderRadius: "50%", background: `${theme.foil}33` }} /> : null}
      {layout === "minimal-dark" ? <div style={{ position: "absolute", inset: 14, borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)" }} /> : null}
      {cardOrientation === "vertical" ? (
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: "92px minmax(0, 1fr)", gap: 18, alignItems: "start", minHeight: 360 }}>
          <div style={{ minWidth: 0, display: "grid", gap: 10 }}>
            {String(form.companyName || "").trim() ? <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.08em", color: theme.accent, wordBreak: "break-word" }}>{String(form.companyName).trim()}</div> : null}
            <div style={{ display: "grid", gap: 2 }}>
              {Array.from(String(form.name || "").trim() || "이름").slice(0, 4).map((char, index) => (
                <div key={`${char}-${index}`} style={{ fontSize: 42, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.04em", color: theme.title }}>{char}</div>
              ))}
            </div>
          </div>
          <div style={{ minWidth: 0, paddingTop: 86 }}>
            {String(form.jobTitle || "").trim() ? <div style={{ fontSize: 16, fontWeight: 800, color: theme.body, marginBottom: 18, wordBreak: "break-word" }}>{String(form.jobTitle).trim()}</div> : null}
            {infoLines.map((value, index) => (
              <div key={`${value}-${index}`} style={{ marginTop: index === 0 ? 0 : 8, fontSize: 14, fontWeight: 700, color: theme.body, wordBreak: "break-word" }}>{index === 0 ? `T. ${value}` : `M. ${value}`}</div>
            ))}
            {String(form.address || "").trim() ? <div style={{ marginTop: 16, fontSize: 13, lineHeight: 1.62, color: theme.body, wordBreak: "break-word" }}>{String(form.address).trim()}</div> : null}
            {displayWebsite ? <div style={{ marginTop: 16, fontSize: 14, fontWeight: 900, color: theme.body, wordBreak: "break-word" }}>{displayWebsite}</div> : null}
            {String(form.intro || "").trim() ? <div style={{ marginTop: 16, fontSize: 13, lineHeight: 1.62, color: theme.body, wordBreak: "break-word" }}>{String(form.intro).trim()}</div> : null}
          </div>
        </div>
      ) : (
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: showSidePanel ? "minmax(0, 1fr) 190px" : "1fr", gap: 16, alignItems: "stretch" }}>
          <div style={{ minWidth: 0 }}>
            {String(form.companyName || "").trim() ? <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.12em", color: theme.accent, marginBottom: 8, wordBreak: "break-word" }}>{String(form.companyName).trim()}</div> : null}
            {String(form.jobTitle || "").trim() ? <div style={{ fontSize: 13, fontWeight: 700, color: theme.body, marginBottom: 10, wordBreak: "break-word" }}>{String(form.jobTitle).trim()}</div> : null}
            <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.04, letterSpacing: "-0.05em", color: theme.title, wordBreak: "break-word" }}>{String(form.name || "").trim() || "이름"}</div>
            {infoLines.map((value, index) => (
              <div key={`${value}-${index}`} style={{ marginTop: index === 0 ? 12 : 6, fontSize: 14, fontWeight: 700, color: theme.body, wordBreak: "break-word" }}>{value}</div>
            ))}
            {String(form.address || "").trim() ? <div style={{ marginTop: 14, fontSize: 13, lineHeight: 1.58, color: theme.body, wordBreak: "break-word" }}>{String(form.address).trim()}</div> : null}
            {displayWebsite ? <div style={{ marginTop: 12, fontSize: 13, fontWeight: 800, color: theme.body, wordBreak: "break-word" }}>{displayWebsite}</div> : null}
            {String(form.intro || "").trim() ? <div style={{ marginTop: 16, fontSize: 14, lineHeight: 1.64, color: theme.body, wordBreak: "break-word" }}>{String(form.intro).trim()}</div> : null}
          </div>
          {showSidePanel ? (
            <div style={{ alignSelf: "stretch", borderRadius: 24, padding: 16, background: theme.panelBackground, border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", justifyContent: "center", gap: 10, minWidth: 0 }}>
              {String(form.companyName || "").trim() ? <div style={{ fontSize: 18, fontWeight: 900, lineHeight: 1.25, color: theme.title, wordBreak: "break-word" }}>{String(form.companyName).trim()}</div> : null}
              {String(form.jobTitle || "").trim() ? <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.5, color: theme.body, wordBreak: "break-word" }}>{String(form.jobTitle).trim()}</div> : null}
              {displayWebsite ? <div style={{ fontSize: 12, fontWeight: 800, lineHeight: 1.5, color: theme.body, wordBreak: "break-word" }}>{displayWebsite}</div> : null}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function BusinessCardThemeThumbnail({ theme, active }) {
  const isVertical = resolveCardOrientation(theme.orientation) === "vertical";
  return (
    <div style={{ border: active ? `2px solid ${theme.accent}` : "1px solid rgba(148,163,184,0.18)", background: "rgba(255,255,255,0.78)", borderRadius: 18, padding: 8, boxShadow: active ? `0 10px 20px ${theme.glow}` : "none" }}>
      <div style={{ position: "relative", height: isVertical ? 120 : 72, borderRadius: 14, overflow: "hidden", background: theme.previewBackground, border: `1px solid ${theme.border}` }}>
        {theme.layout === "stripe" && !isVertical ? <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 6, background: theme.foil }} /> : null}
        {theme.layout === "topbar" ? <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 8, background: theme.foil }} /> : null}
        {theme.layout === "bottomline" ? <div style={{ position: "absolute", left: 8, right: 8, bottom: 8, height: 3, borderRadius: 999, background: theme.foil }} /> : null}
        {theme.layout === "rightpanel" && !isVertical ? <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 26, background: theme.panelBackground }} /> : null}
        <div style={{ position: "absolute", inset: 0, padding: isVertical ? 8 : 10, display: "flex", flexDirection: isVertical ? "row" : "column", justifyContent: isVertical ? "space-between" : "space-between" }}>
          {isVertical ? (
            <>
              <div style={{ display: "grid", gap: 2 }}>
                {Array.from("홍길동").slice(0, 3).map((char, index) => (
                  <div key={`${char}-${index}`} style={{ fontSize: 16, fontWeight: 900, lineHeight: 1, color: theme.title }}>{char}</div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", paddingTop: 8 }}>
                <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.08em", color: theme.accent }}>SMI</div>
                <div>
                  <div style={{ fontSize: 8, fontWeight: 700, color: theme.body }}>대표이사</div>
                  <div style={{ marginTop: 6, fontSize: 8, fontWeight: 700, color: theme.body }}>smi.ceo</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.08em", color: theme.accent }}>SMI SHARE UNITY</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, lineHeight: 1, color: theme.title }}>홍길동</div>
                <div style={{ marginTop: 4, fontSize: 8, fontWeight: 700, color: theme.body }}>대표이사</div>
              </div>
            </>
          )}
        </div>
      </div>
      <div style={{ marginTop: 6, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#475569" }}>{theme.label}</div>
        {active ? <div style={{ fontSize: 11, fontWeight: 900, color: theme.accent }}>선택됨</div> : null}
      </div>
    </div>
  );
}

function CardCreateExperienceBridge() {
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
      const nextSlug = resolved.slug || (await ensureCardSlug(memberId, existing?.cardSlug || resolved.form.name || defaultName || memberId));
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
    if (!toast) return undefined;
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
      return undefined;
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
          const createButton = buttons.find((button) => String(button.textContent || "").trim() === "명함 만들기");
          if (createButton) {
            sessionStorage.removeItem("su:open-card-editor");
            createButton.click();
          } else {
            const myCardButton = buttons.find((button) => String(button.textContent || "").includes("내 명함"));
            if (myCardButton) myCardButton.click();
          }
        }
      } catch (error) {}

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
      setHostNode((prev) => (prev === host ? prev : host));
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
      setToast("이미지를 저장했습니다.");
    } catch (error) {
      setToast("이미지 저장에 실패했습니다.");
    }
  };

  const sharePreviewCard = async () => {
    try {
      setShareLoading(true);
      const result = await shareBusinessCardImage(form, selectedCardTheme, selectedCardOrientation, savedSlug || initialSlug);
      if (result === "shared") setToast("카톡 전송 창을 열었습니다.");
      else if (result === "copied") setToast("명함 정보를 복사했습니다.");
      else setToast("이 기기에서는 공유를 지원하지 않습니다.");
    } catch (error) {
      setToast("카톡 전송에 실패했습니다.");
    } finally {
      setShareLoading(false);
    }
  };

  const saveCardRecord = async () => {
    if (!memberId) {
      setToast("로그인이 필요합니다.");
      return;
    }
    try {
      setSaving(true);
      const slug = await ensureCardSlug(memberId, form.name || defaultName || memberId, initialSlug || savedSlug);
      await storageAdapter.saveCard(memberId, createCardPayload(form, selectedCardTheme, selectedCardOrientation, preservedLinks, slug));
      setSavedSlug(slug);
      setInitialSlug(slug);
      window.dispatchEvent(new CustomEvent("su:ssot:changed", { detail: { type: "card", operation: "save", data: { cardSlug: slug, template: selectedCardTheme, orientation: selectedCardOrientation } } }));
      setToast("명함을 저장했습니다.");
    } catch (error) {
      setToast(error?.message || "명함 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (location.pathname !== "/my" || !hostNode) return null;

  return createPortal(
    <>
      {toast ? (
        <div style={{ position: "fixed", top: 18, left: "50%", transform: "translateX(-50%)", zIndex: 2002, minWidth: 180, maxWidth: "calc(100vw - 36px)", padding: "12px 16px", borderRadius: 14, background: "rgba(8,15,28,0.96)", color: "#f8fafc", boxShadow: "0 20px 40px rgba(0,0,0,0.22)", border: "1px solid rgba(45,212,191,0.18)", fontSize: 13, fontWeight: 800, textAlign: "center" }}>{toast}</div>
      ) : null}
      <div onClick={(event) => event.stopPropagation()} style={{ width: "min(760px, 100%)", maxHeight: "min(92vh, 860px)", overflowY: "auto", borderRadius: 28, background: previewTheme.surface, boxShadow: `0 34px 90px rgba(15,23,42,0.28), 0 12px 30px ${previewTheme.glow}`, border: `1px solid ${previewTheme.border}`, padding: 18, color: "#0f172a" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 23, fontWeight: 900, letterSpacing: "-0.03em", color: "#0f172a" }}>명함 만들기</div>
          </div>
          <button type="button" onClick={closeBridgeModal} style={{ width: 42, height: 42, borderRadius: 999, border: "1px solid rgba(15,23,42,0.08)", background: "rgba(255,255,255,0.72)", color: "#475569", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>

        {loading ? (
          <div style={{ padding: "48px 12px", textAlign: "center", color: "#52616b", fontSize: 14, fontWeight: 700 }}>명함 정보를 불러오는 중입니다...</div>
        ) : (
          <>
            <div style={{ borderRadius: 22, background: "rgba(255,255,255,0.56)", border: "1px solid rgba(255,255,255,0.8)", padding: 14, marginBottom: 14, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.64)" }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#0f172a", marginBottom: 6 }}>디자인 선택</div>
              <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.55, marginBottom: 10 }}>대기업형 종이 명함 무드의 10종 템플릿입니다. 금장, 은색, 화이트, 라이트 그레이 중심으로 구성했습니다.</div>
              <div style={{ display: "inline-flex", gap: 8, padding: 6, borderRadius: 999, background: "rgba(241,245,249,0.9)", border: "1px solid rgba(203,213,225,0.9)", marginBottom: 12 }}>
                <button type="button" onClick={() => setSelectedCardOrientation("horizontal")} style={{ minHeight: 34, padding: "0 14px", borderRadius: 999, border: "none", background: selectedCardOrientation === "horizontal" ? "linear-gradient(90deg,#0f766e,#14b8a6)" : "transparent", color: selectedCardOrientation === "horizontal" ? "#ffffff" : "#475569", fontSize: 12, fontWeight: 900, cursor: "pointer" }}>가로형</button>
                <button type="button" onClick={() => setSelectedCardOrientation("vertical")} style={{ minHeight: 34, padding: "0 14px", borderRadius: 999, border: "none", background: selectedCardOrientation === "vertical" ? "linear-gradient(90deg,#0f766e,#14b8a6)" : "transparent", color: selectedCardOrientation === "vertical" ? "#ffffff" : "#475569", fontSize: 12, fontWeight: 900, cursor: "pointer" }}>세로형</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(108px, 1fr))", gap: 10 }}>
                {visibleThemes.map((theme) => {
                  const active = theme.key === selectedCardTheme;
                  return (
                    <button key={theme.key} type="button" onClick={() => setSelectedCardTheme(theme.key)} style={{ border: "none", background: "transparent", padding: 0, cursor: "pointer", textAlign: "left" }}>
                      <BusinessCardThemeThumbnail theme={theme} active={active} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ borderRadius: 24, background: "rgba(255,255,255,0.52)", border: "1px solid rgba(255,255,255,0.78)", padding: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#0f172a", marginBottom: 10 }}>미리보기</div>
              <BusinessCardSurface form={form} themeKey={selectedCardTheme} orientation={selectedCardOrientation} />
            </div>

            <div style={{ borderRadius: 22, background: "rgba(255,255,255,0.56)", border: "1px solid rgba(255,255,255,0.8)", padding: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#0f172a", marginBottom: 12 }}>정보 입력</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#52616b", marginBottom: 6 }}>회사명</label>
                  <input value={form.companyName} onChange={(event) => setFieldValue("companyName", event.target.value)} style={{ width: "100%", boxSizing: "border-box", minHeight: 46, borderRadius: 14, border: "1px solid rgba(203,213,225,0.95)", background: "rgba(255,255,255,0.88)", color: "#0f172a", padding: "0 12px", fontSize: 14, outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#52616b", marginBottom: 6 }}>직책</label>
                  <input value={form.jobTitle} onChange={(event) => setFieldValue("jobTitle", event.target.value)} style={{ width: "100%", boxSizing: "border-box", minHeight: 46, borderRadius: 14, border: "1px solid rgba(203,213,225,0.95)", background: "rgba(255,255,255,0.88)", color: "#0f172a", padding: "0 12px", fontSize: 14, outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#52616b", marginBottom: 6 }}>이름</label>
                  <input value={form.name} onChange={(event) => setFieldValue("name", event.target.value)} style={{ width: "100%", boxSizing: "border-box", minHeight: 46, borderRadius: 14, border: "1px solid rgba(203,213,225,0.95)", background: "rgba(255,255,255,0.88)", color: "#0f172a", padding: "0 12px", fontSize: 14, outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#52616b", marginBottom: 6 }}>전화번호</label>
                  <input value={form.phone} onChange={(event) => setFieldValue("phone", event.target.value)} style={{ width: "100%", boxSizing: "border-box", minHeight: 46, borderRadius: 14, border: "1px solid rgba(203,213,225,0.95)", background: "rgba(255,255,255,0.88)", color: "#0f172a", padding: "0 12px", fontSize: 14, outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#52616b", marginBottom: 6 }}>핸드폰</label>
                  <input value={form.mobile} onChange={(event) => setFieldValue("mobile", event.target.value)} style={{ width: "100%", boxSizing: "border-box", minHeight: 46, borderRadius: 14, border: "1px solid rgba(203,213,225,0.95)", background: "rgba(255,255,255,0.88)", color: "#0f172a", padding: "0 12px", fontSize: 14, outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#52616b", marginBottom: 6 }}>사이트 주소</label>
                  <input value={form.website} onChange={(event) => setFieldValue("website", event.target.value)} style={{ width: "100%", boxSizing: "border-box", minHeight: 46, borderRadius: 14, border: "1px solid rgba(203,213,225,0.95)", background: "rgba(255,255,255,0.88)", color: "#0f172a", padding: "0 12px", fontSize: 14, outline: "none" }} />
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#52616b", marginBottom: 6 }}>주소</label>
                <input value={form.address} onChange={(event) => setFieldValue("address", event.target.value)} style={{ width: "100%", boxSizing: "border-box", minHeight: 46, borderRadius: 14, border: "1px solid rgba(203,213,225,0.95)", background: "rgba(255,255,255,0.88)", color: "#0f172a", padding: "0 12px", fontSize: 14, outline: "none" }} />
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#52616b", marginBottom: 6 }}>소개글</label>
                <textarea value={form.intro} onChange={(event) => setFieldValue("intro", event.target.value)} style={{ width: "100%", boxSizing: "border-box", minHeight: 90, resize: "vertical", borderRadius: 14, border: "1px solid rgba(203,213,225,0.95)", background: "rgba(255,255,255,0.88)", color: "#0f172a", padding: "12px 14px", fontSize: 14, outline: "none" }} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
              <button type="button" onClick={saveCardRecord} disabled={saving} style={{ minHeight: 50, borderRadius: 16, border: "none", background: "linear-gradient(90deg,#0f766e,#14b8a6)", color: "#effffb", fontSize: 15, fontWeight: 900, cursor: saving ? "default" : "pointer", opacity: saving ? 0.55 : 1 }}>저장</button>
              <button type="button" onClick={savePreviewImage} style={{ minHeight: 50, borderRadius: 16, border: "1px solid rgba(15,118,110,0.18)", background: "rgba(255,255,255,0.86)", color: "#0f766e", fontSize: 15, fontWeight: 900, cursor: "pointer" }}>이미지 저장</button>
              <button type="button" onClick={sharePreviewCard} disabled={shareLoading} style={{ minHeight: 50, borderRadius: 16, border: "1px solid rgba(15,23,42,0.08)", background: "rgba(255,255,255,0.86)", color: "#0f172a", fontSize: 15, fontWeight: 900, cursor: shareLoading ? "default" : "pointer", opacity: shareLoading ? 0.55 : 1 }}>카톡 전송</button>
            </div>
          </>
        )}
      </div>
    </>,
    hostNode
  );
}

function SimpleSavedCardPage() {
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
    exists: false,
  }));

  const currentUser = getCurrentUser();
  const session = getSession();
  const viewerMemberId = String(session?.memberId || currentUser?.memberId || currentUser?.id || "").trim();
  const isOwner = !!viewerMemberId && String(cardState.memberId || "") === viewerMemberId;

  useEffect(() => {
    if (!toast) return undefined;
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
          exists: true,
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
      setToast("이미지를 저장했습니다.");
    } catch (error) {
      setToast("이미지 저장에 실패했습니다.");
    }
  };

  const handleShare = async () => {
    try {
      setSharing(true);
      const result = await shareBusinessCardImage(cardState.form, cardState.themeKey, cardState.orientation, cardState.cardSlug);
      if (result === "shared") setToast("카톡 전송 창을 열었습니다.");
      else if (result === "copied") setToast("명함 정보를 복사했습니다.");
      else setToast("이 기기에서는 공유를 지원하지 않습니다.");
    } catch (error) {
      setToast("카톡 전송에 실패했습니다.");
    } finally {
      setSharing(false);
    }
  };

  const handleDelete = async () => {
    if (!isOwner) return;
    const confirmed = window.confirm("저장된 명함을 삭제하시겠습니까?");
    if (!confirmed) return;
    try {
      setDeleting(true);
      await storageAdapter.deleteCard(viewerMemberId);
      window.dispatchEvent(new CustomEvent("su:ssot:changed", { detail: { type: "card", operation: "delete", data: { cardSlug: cardState.cardSlug } } }));
      navigate("/my", { replace: true });
    } catch (error) {
      setToast(error?.message || "명함 삭제에 실패했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "48px 18px", textAlign: "center", color: "#64748b", fontSize: 14, fontWeight: 700 }}>명함을 불러오는 중입니다...</div>;
  }

  if (!cardState.exists) {
    return (
      <div style={{ padding: "48px 18px", maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>명함을 찾을 수 없습니다.</div>
        <button type="button" onClick={() => navigate("/my")} style={{ marginTop: 18, minHeight: 48, padding: "0 20px", borderRadius: 16, border: "1px solid rgba(148,163,184,0.28)", background: "#ffffff", color: "#0f172a", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>내 정보로 이동</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 16px 36px", maxWidth: 920, margin: "0 auto" }}>
      {toast ? (
        <div style={{ position: "fixed", top: 18, left: "50%", transform: "translateX(-50%)", zIndex: 2002, minWidth: 180, maxWidth: "calc(100vw - 36px)", padding: "12px 16px", borderRadius: 14, background: "rgba(8,15,28,0.96)", color: "#f8fafc", boxShadow: "0 20px 40px rgba(0,0,0,0.22)", border: "1px solid rgba(45,212,191,0.18)", fontSize: 13, fontWeight: 800, textAlign: "center" }}>{toast}</div>
      ) : null}
      <div style={{ background: "linear-gradient(180deg, #f8fbff 0%, #eef4fa 100%)", border: "1px solid rgba(203,213,225,0.7)", borderRadius: 28, padding: 18, boxShadow: "0 22px 60px rgba(15,23,42,0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>저장된 명함</div>
          <button type="button" onClick={() => navigate("/my")} style={{ minHeight: 42, padding: "0 16px", borderRadius: 14, border: "1px solid rgba(148,163,184,0.28)", background: "rgba(255,255,255,0.9)", color: "#334155", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>내 정보로 이동</button>
        </div>
        <BusinessCardSurface form={cardState.form} themeKey={cardState.themeKey} orientation={cardState.orientation} />
        <div style={{ display: "grid", gridTemplateColumns: isOwner ? "repeat(4, minmax(0, 1fr))" : "repeat(2, minmax(0, 1fr))", gap: 10, marginTop: 16 }}>
          {isOwner ? <button type="button" onClick={() => {
            try {
              sessionStorage.setItem("su:open-card-editor", "1");
            } catch (error) {}
            navigate("/my");
          }} style={{ minHeight: 50, borderRadius: 16, border: "none", background: "linear-gradient(90deg,#0f766e,#14b8a6)", color: "#effffb", fontSize: 15, fontWeight: 900, cursor: "pointer" }}>수정</button> : null}
          {isOwner ? <button type="button" onClick={handleDelete} disabled={deleting} style={{ minHeight: 50, borderRadius: 16, border: "1px solid rgba(239,68,68,0.18)", background: "rgba(255,255,255,0.92)", color: "#dc2626", fontSize: 15, fontWeight: 900, cursor: deleting ? "default" : "pointer", opacity: deleting ? 0.55 : 1 }}>삭제</button> : null}
          <button type="button" onClick={handleDownload} style={{ minHeight: 50, borderRadius: 16, border: "1px solid rgba(15,118,110,0.18)", background: "rgba(255,255,255,0.92)", color: "#0f766e", fontSize: 15, fontWeight: 900, cursor: "pointer" }}>이미지 저장</button>
          <button type="button" onClick={handleShare} disabled={sharing} style={{ minHeight: 50, borderRadius: 16, border: "1px solid rgba(15,23,42,0.08)", background: "rgba(255,255,255,0.92)", color: "#0f172a", fontSize: 15, fontWeight: 900, cursor: sharing ? "default" : "pointer", opacity: sharing ? 0.55 : 1 }}>카톡 전송</button>
        </div>
      </div>
    </div>
  );
}

function PointWalletBridge() {
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
        ...(options.headers || {}),
      },
      ...options,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data?.error || data?.message || response.statusText || "요청 실패");
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
      memberName: String(currentUser?.name || session?.name || "").trim(),
    };
  };

  const normalizePointHistoryEntry = (entry, index) => {
    const amount = Number(entry?.amount || 0);
    const type = String(entry?.type || "").toUpperCase();
    return {
      id: entry?.id || entry?.ledger_id || entry?.ledgerId || `point-${index}`,
      amount,
      amountAbs: Math.abs(amount),
      createdAt: entry?.createdAt || entry?.created_at || new Date().toISOString(),
      type,
      status: String(entry?.status || "active"),
      description: String(entry?.description || "").trim(),
      label: type === "PAYMENT"
        ? "상점 결제"
        : type === "TRANSFER_OUT"
          ? "포인트 전송"
          : type === "TRANSFER_IN"
            ? "포인트 수신"
            : type === "ADMIN"
              ? "관리자 지급"
              : type === "ADMIN_DEDUCT"
                ? "관리자 차감"
                : type === "PARTICIPATION"
                  ? "포인트 적립"
                  : amount >= 0
                    ? "포인트 적립"
                    : "포인트 사용",
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
  const selectedTargetName = actionMode === "transfer"
    ? String(selectedMember?.name || selectedMember?.memberId || selectedMember?.id || "").trim()
    : String(selectedShop?.name || selectedShop?.id || selectedShop?.shopId || "").trim();
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
      const [balanceRes, historyRes] = await Promise.all([
        fetchJson(`/api/points/${encodeURIComponent(memberId)}/balance`),
        fetchJson(`/api/points/${encodeURIComponent(memberId)}/history?limit=24`),
      ]);
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
      setToast(error?.message || "포인트 정보를 불러오지 못했습니다.");
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
      return undefined;
    }

    let retryCount = 0;
    const ensureMountNode = () => {
      const panels = Array.from(document.querySelectorAll("section.su-panel"));
      const targetPanel = document.querySelector('section.su-panel[data-point-wallet-anchor="true"]') || panels.find((panel) => String(panel.textContent || "").includes("💰 포인트 관리"));
      const friendPanel = panels.find((panel) => {
        const text = String(panel.textContent || "");
        return text.includes("👥 친구") || text.includes("회원 친구 추가") || text.includes("친구 목록");
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
        setMountNode((prev) => (prev ? null : prev));
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
      setMountNode((prev) => (prev === host ? prev : host));
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
    if (!toast) return undefined;
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

  const filteredMembers = targetQuery.trim()
    ? members.filter((member) => {
        const { memberId } = getCurrentMemberInfo();
        const candidateId = String(member?.memberId || member?.id || "").trim();
        if (!candidateId || candidateId === memberId) return false;
        const query = targetQuery.trim().toLowerCase();
        return candidateId.toLowerCase().includes(query) || String(member?.name || "").toLowerCase().includes(query) || String(member?.phone || member?.phoneNumber || "").toLowerCase().includes(query);
      }).slice(0, 8)
    : [];
  const filteredShops = targetQuery.trim()
    ? shops.filter((shop) => {
        const status = String(shop?.status || "").trim().toLowerCase();
        if (status === "pending" || status === "rejected") return false;
        const query = targetQuery.trim().toLowerCase();
        return String(shop?.id || shop?.shopId || "").toLowerCase().includes(query) || String(shop?.name || "").toLowerCase().includes(query) || String(shop?.address || shop?.description || "").toLowerCase().includes(query);
      }).slice(0, 8)
    : [];

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
      setToast(mode === "transfer" ? "회원 목록을 불러오지 못했습니다." : "상점 목록을 불러오지 못했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const submitShopPayment = async () => {
    const { memberId } = getCurrentMemberInfo();
    const selectedShopId = String(selectedShop?.id || selectedShop?.shopId || "").trim();
    if (!memberId || !selectedShopId || amountValue <= 0) return;
    if (amountValue > pointBalance) {
      setToast("보유 포인트를 초과했습니다.");
      return;
    }

    const confirmText = `${selectedTargetName || "선택한 상점"}에 ${formatPointAmount(amountValue)} 결제하시겠습니까?`;
    if (!window.confirm(confirmText)) return;

    try {
      setActionSubmitting(true);
      const qrData = await storageAdapter.issueShopQrPayload(selectedShopId);
      const qrPayload = String(qrData?.qrPayload || "").trim();
      if (!qrPayload) throw new Error("QR 정보가 없습니다.");
      const paymentResult = await storageAdapter.payWithQrPayload(qrPayload, Math.trunc(amountValue), String(memberId));
      if (!(paymentResult?.ok === true || paymentResult?.success === true)) {
        throw new Error(paymentResult?.error || paymentResult?.message || "상점 결제에 실패했습니다.");
      }
      window.dispatchEvent(new CustomEvent("POINTS_UPDATED", { detail: { memberId } }));
      window.dispatchEvent(new CustomEvent("su:ssot:changed", { detail: { type: "points", operation: "shop-payment" } }));
      await loadPointData();
      setToast("상점 결제가 완료되었습니다.");
      closeAction();
    } catch (error) {
      setToast(error?.message || "상점 결제 중 오류가 발생했습니다.");
      closeAction();
    } finally {
      setActionSubmitting(false);
    }
  };

  const submitPointTransferFallback = async ({ fromMemberId, toMemberId, toMemberName, amount }) => {
    const sessionToken = String(window.__SU_SESSION__?.token || "").trim();
    if (!sessionToken) {
      const error = new Error("포인트 전송 API가 연결되지 않았습니다.");
      error.status = 404;
      throw error;
    }

    await fetchJson("/api/points/admin/grant", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        memberId: fromMemberId,
        amount: -Math.trunc(amount),
        type: "TRANSFER_OUT",
        description: `포인트 전송 (→ ${toMemberName})`,
        referenceType: "POINT_TRANSFER",
        referenceId: `PTX-${Date.now()}`,
      }),
    });

    await fetchJson("/api/points/admin/grant", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({
        memberId: toMemberId,
        amount: Math.trunc(amount),
        type: "TRANSFER_IN",
        description: `포인트 수신 (← ${getCurrentMemberInfo().memberName || fromMemberId})`,
        referenceType: "POINT_TRANSFER",
        referenceId: `PTX-${Date.now()}-IN`,
      }),
    });
  };

  const submitPointTransfer = async () => {
    const { memberId, memberName } = getCurrentMemberInfo();
    const receiverId = String(selectedMember?.memberId || selectedMember?.id || "").trim();
    if (!memberId || !receiverId || amountValue <= 0) return;
    if (amountValue > pointBalance) {
      setToast("보유 포인트를 초과했습니다.");
      return;
    }

    const confirmText = `${selectedTargetName || "선택한 회원"}에게 ${formatPointAmount(amountValue)} 보내시겠습니까?`;
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
            description: `포인트 전송 (→ ${selectedTargetName})`,
          }),
        });
      } catch (error) {
        const isMissingTransferRoute = error?.status === 404 || /Cannot POST\s+\/api\/points\/transfer/i.test(String(error?.message || ""));
        if (!isMissingTransferRoute) throw error;
        await submitPointTransferFallback({
          fromMemberId: memberId,
          toMemberId: receiverId,
          toMemberName: selectedTargetName,
          amount: amountValue,
        });
      }
      window.dispatchEvent(new CustomEvent("POINTS_UPDATED", { detail: { memberId } }));
      window.dispatchEvent(new CustomEvent("su:ssot:changed", { detail: { type: "points", operation: "member-transfer" } }));
      await loadPointData();
      setToast("포인트 전송이 완료되었습니다.");
      closeAction();
    } catch (error) {
      if (error?.status === 403) {
        setToast("포인트 전송 권한이 없어 실행되지 않았습니다.");
      } else if (error?.status === 404 || /Cannot POST\s+\/api\/points\/transfer/i.test(String(error?.message || ""))) {
        setToast("포인트 전송 API가 아직 연결되지 않았습니다.");
      } else {
        setToast(error?.message || "포인트 전송 중 오류가 발생했습니다.");
      }
      closeAction();
    } finally {
      setActionSubmitting(false);
    }
  };

  if (location.pathname !== "/my" || !mountNode) return null;

  return createPortal(
    <>
      <style>{`
        section.su-panel[data-point-wallet-original="true"] {
          display: none !important;
        }
      `}</style>
      {toast ? (
        <div style={{ position: "fixed", bottom: 88, left: "50%", transform: "translateX(-50%)", zIndex: 1200, padding: "12px 16px", borderRadius: 14, background: "rgba(8,15,28,0.96)", border: "1px solid rgba(15,118,110,0.24)", color: "#f8fafc", boxShadow: "0 18px 40px rgba(0,0,0,0.28)", fontSize: 13, fontWeight: 700 }}>{toast}</div>
      ) : null}
      <section className="su-panel" style={{ position: "relative", overflow: "hidden", background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(247,250,252,0.98))", border: "1px solid rgba(226,232,240,0.95)", borderRadius: 22, boxShadow: "0 16px 40px rgba(15,23,42,0.08)", color: "#0f172a" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div className="su-sectionTitle" style={{ color: "#0f172a" }}>💰 포인트 관리</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#0f766e", letterSpacing: "0.04em" }}>POINT WALLET</div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "28px 0", color: "#64748b" }}>포인트를 불러오는 중입니다...</div>
        ) : (
          <>
            <div style={{ borderRadius: 20, padding: "18px 16px", background: "linear-gradient(135deg, rgba(240,253,250,1), rgba(236,253,245,1))", border: "1px solid rgba(167,243,208,0.9)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)", marginBottom: 14 }}>
              {/* 안내문구 제거 */}
              <div style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 8 }}>사용가능 포인트</div>
              <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.04em", color: "#0f766e" }}>{formatPointAmount(pointBalance)}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
                <div style={{ borderRadius: 14, padding: "10px 12px", background: "rgba(255,255,255,0.72)", border: "1px solid rgba(203,213,225,0.8)" }}>
                  <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>적립</div>
                  <div style={{ marginTop: 4, color: "#10b981", fontWeight: 900 }}>{formatPointAmount(earnedTotal)}</div>
                </div>
                <div style={{ borderRadius: 14, padding: "10px 12px", background: "rgba(255,255,255,0.72)", border: "1px solid rgba(203,213,225,0.8)" }}>
                  <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700 }}>사용</div>
                  <div style={{ marginTop: 4, color: "#ef4444", fontWeight: 900 }}>{formatPointAmount(spentTotal)}</div>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: window.innerWidth < 768 ? "1fr" : "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <button type="button" onClick={() => openAction("transfer")} style={{ minHeight: 54, border: "1px solid rgba(45,212,191,0.28)", borderRadius: 16, background: "linear-gradient(90deg,#0f766e,#14b8a6)", color: "#effffb", fontWeight: 900, fontSize: 16, letterSpacing: "-0.02em", cursor: "pointer", boxShadow: "0 14px 28px rgba(20,184,166,0.16)" }}>포인트 보내기</button>
              <button type="button" onClick={() => openAction("shop")} style={{ minHeight: 54, border: "1px solid rgba(14,116,144,0.22)", borderRadius: 16, background: "linear-gradient(90deg,#0f766e,#115e59)", color: "#effffb", fontWeight: 900, fontSize: 16, letterSpacing: "-0.02em", cursor: "pointer", boxShadow: "0 14px 28px rgba(15,118,110,0.14)" }}>상점 결제</button>
            </div>
            <div style={{ borderRadius: 14, border: "1px solid rgba(148,163,184,0.26)", background: "rgba(248,250,252,0.95)", padding: "11px 12px", marginBottom: 12 }} data-wallet-guide-version="point-v3-20260411">
              <div style={{ fontSize: 12, fontWeight: 800, color: "#0f766e", marginBottom: 5 }}>포인트 안내</div>
              <div style={{ fontSize: 12, lineHeight: 1.7, color: "#475569" }}>
                {/* 이전버전 안내문 삭제됨 */}
                포인트 보내기: 회원을 선택하고 금액을 입력한 뒤 전송을 완료하세요.<br />
                상점 결제: 결제할 상점을 선택하고 금액 확인 후 결제를 진행하세요.
              </div>
            </div>
            <button type="button" disabled style={{ width: "100%", minHeight: 42, borderRadius: 14, border: "1px solid rgba(203,213,225,0.9)", background: "rgba(241,245,249,0.9)", color: "#94a3b8", fontWeight: 800, fontSize: 13, cursor: "not-allowed", opacity: 0.9, marginBottom: 16 }}>QR 결제 (준비중)</button>

            <div style={{ fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 8 }}>최근 내역</div>
            <div style={{ display: "grid", gap: 8 }}>
              {recentHistory.length === 0 ? <div style={{ borderRadius: 16, border: "1px solid rgba(226,232,240,0.95)", background: "rgba(248,250,252,0.92)", padding: "16px 14px", textAlign: "center", color: "#64748b" }}>포인트 내역이 없습니다.</div> : null}
              {visiblePointHistory.map((entry) => (
                <div key={entry.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, borderRadius: 16, border: "1px solid rgba(226,232,240,0.95)", background: "rgba(255,255,255,0.92)", padding: "12px 14px" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", borderRadius: 999, padding: "3px 8px", background: entry.amount >= 0 ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.10)", color: entry.amount >= 0 ? "#059669" : "#dc2626", fontSize: 11, fontWeight: 800 }}>{entry.label}</div>
                    <div style={{ marginTop: 6, fontSize: 14, fontWeight: 800, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.description || entry.label}</div>
                    <div style={{ marginTop: 3, fontSize: 11, color: "#94a3b8" }}>{formatKSTDateTime(entry.createdAt)}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: entry.amount >= 0 ? "#10b981" : "#ef4444" }}>{entry.amount >= 0 ? "+" : "-"}{formatPointAmount(entry.amountAbs)}</div>
                  </div>
                </div>
              ))}
              {pointHistory.length > 6 ? (
                <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
                  <button
                    type="button"
                    className="su-chip"
                    onClick={() => setPointHistoryExpanded((prev) => !prev)}
                    style={{ minWidth: 104 }}
                  >
                    {pointHistoryExpanded ? "접기" : "더보기"}
                  </button>
                </div>
              ) : null}
            </div>
          </>
        )}
      </section>

      {actionMode ? createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 1300, background: "rgba(15,23,42,0.62)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ width: "min(560px, 100%)", maxHeight: "min(88vh, 760px)", overflowY: "auto", borderRadius: 24, background: "linear-gradient(180deg, rgba(255,255,255,0.99), rgba(248,250,252,0.99))", border: "1px solid rgba(226,232,240,0.95)", boxShadow: "0 30px 80px rgba(15,23,42,0.22)", padding: 20, color: "#0f172a" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 21, fontWeight: 900 }}>{actionMode === "transfer" ? "포인트 보내기" : "상점 결제"}</div>
                <div style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>{actionStep === "target" ? "대상을 선택하세요." : actionStep === "amount" ? "금액을 입력하세요." : "최종 내용을 확인하세요."}</div>
              </div>
              <button type="button" onClick={closeAction} style={{ border: "none", background: "transparent", color: "#64748b", fontSize: 24, lineHeight: 1, cursor: "pointer" }}>×</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
              {[["target", "1", "대상 선택"], ["amount", "2", "금액 입력"], ["confirm", "3", "최종 확인"]].map(([key, stepNo, label]) => {
                const active = actionStep === key;
                return (
                  <div key={key} style={{ borderRadius: 14, padding: "10px 12px", background: active ? "rgba(15,118,110,0.12)" : "rgba(255,255,255,0.72)", border: `1px solid ${active ? "rgba(20,184,166,0.28)" : "rgba(226,232,240,0.95)"}` }}>
                    <div style={{ fontSize: 11, color: active ? "#0f766e" : "#94a3b8", fontWeight: 800 }}>STEP {stepNo}</div>
                    <div style={{ marginTop: 3, fontSize: 13, fontWeight: 800 }}>{label}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ borderRadius: 18, padding: "14px 16px", background: "rgba(240,253,250,0.9)", border: "1px solid rgba(167,243,208,0.9)", marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>현재 잔액</div>
              <div style={{ marginTop: 4, fontSize: 24, fontWeight: 900, color: "#0f766e" }}>{formatPointAmount(pointBalance)}</div>
            </div>

            {actionStep === "target" ? (
              <div>
                <input
                  value={targetQuery}
                  onChange={(event) => setTargetQuery(event.target.value)}
                  placeholder={actionMode === "transfer" ? "회원명 또는 ID 검색" : "상점명 또는 주소 검색"}
                  style={{ width: "100%", boxSizing: "border-box", minHeight: 48, borderRadius: 14, border: "1px solid rgba(203,213,225,0.95)", background: "#ffffff", color: "#0f172a", padding: "12px 14px", fontSize: 14, outline: "none", marginBottom: 12 }}
                />
                <div style={{ display: "grid", gap: 8, maxHeight: 320, overflowY: "auto" }}>
                  {actionLoading ? <div style={{ textAlign: "center", color: "#64748b", padding: "24px 0" }}>목록을 불러오는 중입니다...</div> : null}
                  {!actionLoading && actionMode === "transfer" ? filteredMembers.map((member) => {
                    const candidateId = String(member?.memberId || member?.id || "").trim();
                    const selected = String(selectedMember?.memberId || selectedMember?.id || "").trim() === candidateId;
                    return (
                      <button key={candidateId} type="button" onClick={() => setSelectedMember(member)} style={{ textAlign: "left", padding: "12px 14px", borderRadius: 14, border: selected ? "1px solid rgba(20,184,166,0.34)" : "1px solid rgba(226,232,240,0.95)", background: selected ? "rgba(20,184,166,0.10)" : "rgba(255,255,255,0.92)", color: "#0f172a", cursor: "pointer" }}>
                        <div style={{ fontWeight: 800 }}>{member?.name || candidateId}</div>
                        <div style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>{candidateId}{member?.phone || member?.phoneNumber ? ` · ${member.phone || member.phoneNumber}` : ""}</div>
                      </button>
                    );
                  }) : null}
                  {!actionLoading && actionMode === "shop" ? filteredShops.map((shop) => {
                    const shopId = String(shop?.id || shop?.shopId || "").trim();
                    const selected = String(selectedShop?.id || selectedShop?.shopId || "").trim() === shopId;
                    return (
                      <button key={shopId} type="button" onClick={() => setSelectedShop(shop)} style={{ textAlign: "left", padding: "12px 14px", borderRadius: 14, border: selected ? "1px solid rgba(15,118,110,0.34)" : "1px solid rgba(226,232,240,0.95)", background: selected ? "rgba(15,118,110,0.10)" : "rgba(255,255,255,0.92)", color: "#0f172a", cursor: "pointer" }}>
                        <div style={{ fontWeight: 800 }}>{shop?.name || shopId}</div>
                        <div style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>{shop?.address || shop?.description || shopId}</div>
                      </button>
                    );
                  }) : null}
                  {!actionLoading && !selectedTarget && ((actionMode === "transfer" && filteredMembers.length === 0) || (actionMode === "shop" && filteredShops.length === 0)) ? <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", fontSize: 13 }}>{targetQuery.trim() ? "검색 결과가 없습니다." : "검색어를 입력해 대상을 찾으세요."}</div> : null}
                </div>
              </div>
            ) : null}

            {actionStep === "amount" ? (
              <div>
                <div style={{ borderRadius: 18, padding: "16px", background: "rgba(255,255,255,0.92)", border: "1px solid rgba(226,232,240,0.95)", marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>{actionMode === "transfer" ? "받는 회원" : "결제 상점"}</div>
                  <div style={{ marginTop: 4, fontSize: 18, fontWeight: 900 }}>{selectedTargetName || "-"}</div>
                </div>
                <input
                  value={amountInput ? String(amountInput).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}
                  onChange={(event) => setAmountInput(String(event.target.value || "").replace(/[^\d]/g, ""))}
                  inputMode="numeric"
                  placeholder="보낼 포인트 또는 결제 포인트 입력"
                  style={{ width: "100%", boxSizing: "border-box", minHeight: 52, borderRadius: 14, border: "1px solid rgba(203,213,225,0.95)", background: "#ffffff", color: "#0f172a", padding: "12px 14px", fontSize: 18, fontWeight: 800, outline: "none" }}
                />
                <div style={{ marginTop: 10, fontSize: 12, color: amountValue > pointBalance ? "#dc2626" : "#64748b" }}>{amountValue > pointBalance ? "보유 포인트를 초과했습니다." : `현재 잔액 ${formatPointAmount(pointBalance)}에서 차감됩니다.`}</div>
              </div>
            ) : null}

            {actionStep === "confirm" ? (
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ borderRadius: 18, padding: "16px", background: "rgba(255,255,255,0.92)", border: "1px solid rgba(226,232,240,0.95)" }}>
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>처리 방식</div>
                  <div style={{ marginTop: 4, fontSize: 18, fontWeight: 900 }}>{actionMode === "transfer" ? "포인트 보내기" : "상점 결제"}</div>
                </div>
                <div style={{ borderRadius: 18, padding: "16px", background: "rgba(255,255,255,0.92)", border: "1px solid rgba(226,232,240,0.95)" }}>
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>{actionMode === "transfer" ? "받는 회원" : "결제 상점"}</div>
                  <div style={{ marginTop: 4, fontSize: 18, fontWeight: 900 }}>{selectedTargetName || "-"}</div>
                </div>
                <div style={{ borderRadius: 18, padding: "16px", background: "rgba(240,253,250,0.9)", border: "1px solid rgba(167,243,208,0.9)" }}>
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>보내는 금액</div>
                  <div style={{ marginTop: 4, fontSize: 26, fontWeight: 900, color: "#0f766e" }}>{formatPointAmount(amountValue)}</div>
                  <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>실행 후 예상 잔액 {formatPointAmount(pointBalance - amountValue)}</div>
                </div>
              </div>
            ) : null}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 18 }}>
              <button
                type="button"
                onClick={() => {
                  if (actionStep === "confirm") setActionStep("amount");
                  else if (actionStep === "amount") setActionStep("target");
                  else closeAction();
                }}
                style={{ minHeight: 48, borderRadius: 14, border: "1px solid rgba(203,213,225,0.95)", background: "rgba(255,255,255,0.9)", color: "#334155", fontWeight: 800, cursor: "pointer" }}
              >
                {actionStep === "target" ? "닫기" : "이전"}
              </button>
              {actionStep === "target" ? (
                <button type="button" disabled={!selectedTarget || actionLoading} onClick={() => setActionStep("amount")} style={{ minHeight: 48, borderRadius: 14, border: "none", background: "linear-gradient(90deg,#0f766e,#14b8a6)", color: "#effffb", fontWeight: 900, cursor: !selectedTarget || actionLoading ? "default" : "pointer", opacity: !selectedTarget || actionLoading ? 0.45 : 1 }}>다음</button>
              ) : null}
              {actionStep === "amount" ? (
                <button type="button" disabled={!amountValue || amountValue > pointBalance} onClick={() => setActionStep("confirm")} style={{ minHeight: 48, borderRadius: 14, border: "none", background: "linear-gradient(90deg,#0f766e,#14b8a6)", color: "#effffb", fontWeight: 900, cursor: !amountValue || amountValue > pointBalance ? "default" : "pointer", opacity: !amountValue || amountValue > pointBalance ? 0.45 : 1 }}>다음</button>
              ) : null}
              {actionStep === "confirm" ? (
                <button type="button" disabled={actionSubmitting} onClick={actionMode === "transfer" ? submitPointTransfer : submitShopPayment} style={{ minHeight: 48, borderRadius: 14, border: "none", background: actionMode === "transfer" ? "linear-gradient(90deg,#0f766e,#14b8a6)" : "linear-gradient(90deg,#0f766e,#115e59)", color: "#effffb", fontWeight: 900, cursor: actionSubmitting ? "default" : "pointer", opacity: actionSubmitting ? 0.55 : 1 }}>{actionSubmitting ? "처리 중..." : actionMode === "transfer" ? "전송 실행" : "결제 실행"}</button>
              ) : null}
            </div>
          </div>
        </div>,
        document.body
      ) : null}
    </>,
    mountNode
  );
}

function normalizeVoucherSerial(referenceId, createdAt, ledgerId) {
  const raw = String(referenceId || "").trim();
  if (raw) return raw;
  return `VIP-${buildVoucherDateKey(createdAt || new Date())}-${String(ledgerId || 0).padStart(6, "0")}`;
}

function getVoucherDirection(log) {
  const source = String(log.source || "").toUpperCase();
  if (source === "ADMIN_CANCEL") return "발행취소";
  if (source === "VOUCHER_SHOP_TRANSFER_IN") return "사용완료";
  if (source === "MEMBER_TRANSFER_IN") return "양수";
  if (source === "MEMBER_TRANSFER_OUT") return "양도";
  if (Number(log.amount) > 0) return "지급";
  if (source === "SHOP_USE" || source === "VOUCHER_SHOP_TRANSFER_OUT") return "사용";
  return "차감";
}

function getVoucherStatusLabel(log) {
  const source = String(log.source || "").toUpperCase();
  if (source === "ADMIN_CANCEL") return "취소됨";
  if (source === "VOUCHER_SHOP_TRANSFER_IN") return "사용완료";
  if (source === "SHOP_USE" || source === "VOUCHER_SHOP_TRANSFER_OUT") return "사용완료";
  if (source === "MEMBER_TRANSFER_OUT") return "양도완료";
  if (source === "MEMBER_TRANSFER_IN") return "사용가능";
  if (Number(log.amount) > 0) return "사용가능";
  return "회수됨";
}

function getVoucherStatusStyle(statusLabel) {
  if (statusLabel === "사용가능") {
    return {
      color: "#b9ff66",
      background: "rgba(132, 204, 22, 0.16)",
      borderColor: "rgba(163, 230, 53, 0.42)",
    };
  }
  if (statusLabel === "사용완료") {
    return {
      color: "#fca5a5",
      background: "rgba(239, 68, 68, 0.14)",
      borderColor: "rgba(248, 113, 113, 0.28)",
    };
  }
  if (statusLabel === "취소됨") {
    return {
      color: "#fde68a",
      background: "rgba(245, 158, 11, 0.14)",
      borderColor: "rgba(245, 158, 11, 0.3)",
    };
  }
  return {
    color: "#d1d5db",
    background: "rgba(148, 163, 184, 0.12)",
    borderColor: "rgba(148, 163, 184, 0.24)",
  };
}

function normalizeVoucherLog(log) {
  const parsed = parseVoucherDescription(log.description);
  // description meta의 shopName이 없으면 API JOIN 결과의 log.shopName 우선 사용
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
    amountAbs: Math.abs(Number(log.amount) || 0),
  };
}

function VipAdminVouchersPage() {
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
  const [issueMode, setIssueMode] = useState("지급");
  const [issueForm, setIssueForm] = useState({
    memberId: "",
    memberName: "",
    amount: "",
    issueRegion: "",
    description: "",
  });
  const [memberSearch, setMemberSearch] = useState("");
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    member: "",
    direction: "",
    status: "",
  });
  const [ledgerExpandedGroups, setLedgerExpandedGroups] = useState({});
  const [voucherCancellingSerial, setVoucherCancellingSerial] = useState("");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!isAdminAuthenticatedLocal()) {
      navigate("/admin/login", { replace: true });
      return;
    }

    let mounted = true;

    const apiJson = async (path, options = {}) => {
      const token = localStorage.getItem("adminToken") || "";
      const response = await fetch(`${VIP_API_BASE}${path}`, {
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
          ...(options.headers || {}),
        },
        ...options,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || response.statusText || "요청 실패");
      return data;
    };

    const load = async () => {
      try {
        setLoading(true);
        const [memberData, logData, balanceData] = await Promise.all([
          apiJson("/api/members"),
          apiJson("/api/admin/vouchers/logs?page=1&pageSize=500&sortField=created_at&sortDir=desc"),
          apiJson("/api/admin/vouchers/balances?targetType=member&page=1&pageSize=300&excludeZero=0"),
        ]);
        if (!mounted) return;
        setMembers(memberData?.members || []);
        setLogs((logData?.logs || []).map(normalizeVoucherLog));
        setBalanceRows(balanceData?.rows || []);
      } catch (error) {
        if (mounted) setToast(`상품권 데이터를 불러오지 못했습니다: ${error.message}`);
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
        ...(options.headers || {}),
      },
      ...options,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error || response.statusText || "요청 실패");
    return data;
  };

  const reloadVoucherData = async () => {
    const [logData, balanceData] = await Promise.all([
      apiJson("/api/admin/vouchers/logs?page=1&pageSize=500&sortField=created_at&sortDir=desc"),
      apiJson("/api/admin/vouchers/balances?targetType=member&page=1&pageSize=300&excludeZero=0"),
    ]);
    setLogs((logData?.logs || []).map(normalizeVoucherLog));
    setBalanceRows(balanceData?.rows || []);
  };

  const sanitizeAmount = (value) => String(value || "").replace(/[^\d]/g, "").slice(0, 9);
  const amountValue = Number(issueForm.amount || 0);
  const selectedMember = members.find((member) => String(member.memberId || member.id) === String(issueForm.memberId || ""));
  const selectedMemberBalance = balanceRows.find((row) => String(row.id) === String(issueForm.memberId || ""));
  const filteredMembers = memberSearch.trim()
    ? members.filter((member) => {
        const query = memberSearch.trim().toLowerCase();
        const phone = String(member.phone || member.phoneNumber || "").replace(/-/g, "");
        return String(member.name || "").toLowerCase().includes(query) || phone.includes(query.replace(/-/g, ""));
      }).slice(0, 10)
    : [];

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

  const serialBucketMap = normalizedLogs.reduce((acc, log) => {
    const memberId = String(log.memberId || "").trim();
    const serial = String(log.serial || "").trim();
    const targetType = String(log.targetType || "member").toLowerCase();
    if (!memberId || !serial || targetType === "shop") return acc;

    const bucketKey = `${memberId}::${serial}`;
    if (!acc[bucketKey]) {
      acc[bucketKey] = {
        memberId,
        net: 0,
        lastSource: "",
        lastCreatedAt: "",
      };
    }
    acc[bucketKey].net += Number(log.amount || 0);
    const logTime = log.createdAt ? new Date(log.createdAt).getTime() : 0;
    const bucketTime = acc[bucketKey].lastCreatedAt ? new Date(acc[bucketKey].lastCreatedAt).getTime() : 0;
    if (!acc[bucketKey].lastCreatedAt || logTime >= bucketTime) {
      acc[bucketKey].lastCreatedAt = log.createdAt;
      acc[bucketKey].lastSource = String(log.source || "").toUpperCase();
    }
    return acc;
  }, {});

  const memberIssueCounts = {};
  const memberActiveBalances = {};
  Object.values(serialBucketMap).forEach((bucket) => {
    const isActiveCard = Number(bucket.net || 0) > 0 && String(bucket.lastSource || "") !== "ADMIN_CANCEL";
    if (!isActiveCard) return;
    memberIssueCounts[bucket.memberId] = (memberIssueCounts[bucket.memberId] || 0) + 1;
    memberActiveBalances[bucket.memberId] = (memberActiveBalances[bucket.memberId] || 0) + Number(bucket.net || 0);
  });

  const currentBalance = Object.values(memberActiveBalances).reduce((sum, amount) => sum + (Number(amount) || 0), 0);
  const memberRecentChange = normalizedLogs.reduce((acc, log) => {
    if (!acc[log.memberId]) acc[log.memberId] = log.createdAt;
    return acc;
  }, {});

  const summaryCards = [
    { label: "총 발행 금액", value: formatVoucherAmount(summary.totalIssued) },
    { label: "총 차감 금액", value: formatVoucherAmount(summary.totalDeducted) },
    { label: "현재 잔액", value: formatVoucherAmount(currentBalance) },
    { label: "총 지급 건수", value: `${summary.totalIssuedCount.toLocaleString("ko-KR")}건` },
  ];

  const visibleBalanceRows = balanceRows
    .map((row) => ({
      ...row,
      total: memberActiveBalances[String(row.id)] || 0,
      issuedCount: memberIssueCounts[String(row.id)] || 0,
      lastChangedAt: memberRecentChange[row.id] || null,
    }))
    .filter((row) => {
      if (!filters.member.trim()) return true;
      const query = filters.member.trim().toLowerCase();
      return String(row.name || "").toLowerCase().includes(query) || String(row.id || "").toLowerCase().includes(query);
    })
    .sort((left, right) => (Number(right.total) || 0) - (Number(left.total) || 0));

  const filteredLogs = normalizedLogs.filter((log) => {
    const createdAt = log.createdAt ? new Date(log.createdAt) : null;
    if (filters.from && createdAt && createdAt < new Date(`${filters.from}T00:00:00`)) return false;
    if (filters.to && createdAt && createdAt > new Date(`${filters.to}T23:59:59`)) return false;
    if (filters.member.trim()) {
      const query = filters.member.trim().toLowerCase();
      const targetText = `${log.memberName || ""} ${log.memberId || ""} ${log.shopName || ""} ${log.shopId || ""}`.toLowerCase();
      if (!targetText.includes(query)) return false;
    }
    if (filters.direction && log.direction !== filters.direction) return false;
    if (filters.status && log.statusLabel !== filters.status) return false;
    return true;
  });

  const groupedLedgerLogs = useMemo(() => {
    const ordered = [];
    const groupMap = new Map();
    filteredLogs.forEach((log, index) => {
      const targetLabel = String(
        String(log.targetType || "") === "shop"
          ? (log.shopName || log.descShopName || log.shopId || log.memberId || "-")
          : (log.memberName || log.memberId || "-")
      ).trim() || "-";
      const bucket = String(log.targetType || "member").toLowerCase();
      const groupKey = `${bucket}::${targetLabel}`;
      if (!groupMap.has(groupKey)) {
        const group = { key: groupKey, label: targetLabel, targetType: bucket, logs: [], totalAmount: 0, firstIndex: index };
        groupMap.set(groupKey, group);
        ordered.push(group);
      }
      const group = groupMap.get(groupKey);
      group.logs.push(log);
      group.totalAmount += Number(log.amount || 0);
    });
    return ordered;
  }, [filteredLogs]);

  // 관리자 발급 원본 카드만 표시 (상점 수신/전송 row 제외)
  const ISSUED_SOURCES = new Set(["ADMIN", "ADMIN_ISSUE", "ISSUE", "GRANT", "ADMIN_GRANT"]);
  // serial별 순잔액 (= 원본+차감 합산) 계산 → 0 이하 = 사용완료/취소됨
  const serialNetMap = {};
  const serialLastSourceMap = {};
  normalizedLogs.forEach((log) => {
    const key = log.serial;
    serialNetMap[key] = (serialNetMap[key] || 0) + (Number(log.amount) || 0);
    if (!serialLastSourceMap[key]) {
      serialLastSourceMap[key] = String(log.source || "").toUpperCase();
    }
  });
  const selectedMemberId = String(issueForm.memberId || "").trim();
  const recentVoucherCards = normalizedLogs
    .filter((log) => log.amount > 0 && ISSUED_SOURCES.has(String(log.source || "").toUpperCase()))
    .filter((log) => !selectedMemberId || String(log.memberId || "").trim() === selectedMemberId)
    .map((log) => {
      const lastSource = serialLastSourceMap[log.serial] || "";
      const isCancelled = lastSource === "ADMIN_CANCEL";
      const netAmount = serialNetMap[log.serial] || 0;
      return {
        ...log,
        statusLabel: isCancelled ? "취소됨" : netAmount <= 0 ? "사용완료" : "사용가능",
        isActiveCard: !isCancelled && netAmount > 0,
      };
    })
    .filter((log) => log.isActiveCard)
    .slice(0, 6);
  const previewSerial = buildVoucherPreviewSerial();

  const panelStyle = {
    background: "linear-gradient(180deg, rgba(17,24,39,0.94), rgba(10,15,27,0.98))",
    border: "1px solid rgba(245, 200, 87, 0.14)",
    borderRadius: 22,
    padding: isMobile ? "16px 14px" : "22px",
    boxShadow: "0 22px 60px rgba(0,0,0,0.26)",
    marginBottom: 18,
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
    outline: "none",
  };
  const labelStyle = { fontSize: 12, color: "rgba(255,255,255,0.64)", marginBottom: 6, display: "block" };
  const buttonStyle = (background, color = "#fff") => ({
    border: "none",
    borderRadius: 12,
    padding: "12px 16px",
    background,
    color,
    fontWeight: 800,
    cursor: "pointer",
  });
  const voucherCardStyle = {
    position: "relative",
    overflow: "hidden",
    borderRadius: 24,
    padding: isMobile ? "18px 16px" : "22px 20px",
    background: "linear-gradient(135deg, rgba(19,24,36,0.98) 0%, rgba(33,22,5,0.92) 50%, rgba(19,24,36,0.98) 100%)",
    border: "1px solid rgba(245, 200, 87, 0.32)",
    boxShadow: "0 18px 44px rgba(0,0,0,0.32)",
  };

  const handleIssue = async () => {
    if (!issueForm.memberId) {
      setToast("지급할 회원을 선택하세요.");
      return;
    }
    if (issueMode === "발행취소") {
      setToast("아래 카드 목록에서 발행취소를 눌러 주세요.");
      return;
    }
    if (!amountValue || amountValue <= 0) {
      setToast("금액을 입력하세요.");
      return;
    }
    if (amountValue > 100000000) {
      setToast("금액이 너무 큽니다.");
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
          amount: Math.abs(amountValue),
          source: "ADMIN",
          referenceId: serial,
          description: buildVoucherDescription(issueForm.description, issueForm.issueRegion),
          targetType: "member",
        }),
      });
      await reloadVoucherData();
      setToast("VIP 상품권 지급 완료");
      setIssueForm({ memberId: "", memberName: "", amount: "", issueRegion: "", description: "" });
      setMemberSearch("");
    } catch (error) {
      setToast(error.message || "상품권 처리에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelIssuedVoucher = async (log) => {
    if (!log?.serial || !log?.memberId) {
      setToast("취소할 상품권 정보를 찾을 수 없습니다.");
      return;
    }
    const cancelAmount = Math.abs(Number(log.amountAbs || log.amount || 0));
    if (!(cancelAmount > 0)) {
      setToast("취소 금액을 확인할 수 없습니다.");
      return;
    }
    const confirmed = window.confirm(`${formatVoucherAmount(cancelAmount)} 상품권 발행을 취소하시겠습니까?\n취소되면 사용가능 카드에서 바로 사라집니다.`);
    if (!confirmed) return;

    try {
      setVoucherCancellingSerial(log.serial);
      await apiJson("/api/vouchers/issue", {
        method: "POST",
        body: JSON.stringify({
          memberId: String(log.memberId),
          typeCode: String(log.typeCode || VIP_VOUCHER_TYPE),
          amount: -cancelAmount,
          source: "ADMIN_CANCEL",
          referenceId: String(log.serial),
          description: buildVoucherDescription("발행 취소", log.issueRegion),
          targetType: "member",
        }),
      });
      await reloadVoucherData();
      setToast("상품권 발행이 취소되었습니다.");
    } catch (error) {
      setToast(error.message || "발행 취소 중 오류가 발생했습니다.");
    } finally {
      setVoucherCancellingSerial("");
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "12px 10px 88px" : "18px 18px 96px", color: "#fff" }}>
      {toast ? (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 1000, padding: "12px 16px", borderRadius: 12, background: "rgba(15,23,42,0.95)", border: "1px solid rgba(245,200,87,0.28)", boxShadow: "0 16px 40px rgba(0,0,0,0.25)" }}>
          {toast}
        </div>
      ) : null}

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <button onClick={() => navigate("/admin")} style={buttonStyle("rgba(255,255,255,0.08)")}>← 돌아가기</button>
        <h1 style={{ margin: 0, fontSize: isMobile ? 24 : 30, fontWeight: 900 }}>🎟️ VIP 상품권 관리</h1>
      </div>

      <div style={{ ...panelStyle, padding: isMobile ? "16px 14px" : "18px" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, minmax(0, 1fr))", gap: 12 }}>
          {summaryCards.map((card) => (
            <div key={card.label} style={{ borderRadius: 18, padding: "16px 16px", background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.64)", marginBottom: 10 }}>{card.label}</div>
              <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, color: "#f8d978" }}>{card.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...panelStyle, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1.05fr) minmax(320px, 0.95fr)", gap: 18 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ fontSize: 17, fontWeight: 800 }}>상품권 지급 / 발행취소</div>
            <div style={{ display: "inline-flex", borderRadius: 999, padding: 4, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <button type="button" onClick={() => setIssueMode("지급")} style={{ ...buttonStyle(issueMode === "지급" ? "linear-gradient(90deg,#f0b90b,#f8d978)" : "transparent", issueMode === "지급" ? "#111827" : "rgba(255,255,255,0.7)"), padding: "8px 14px", borderRadius: 999 }}>지급</button>
              <button type="button" onClick={() => setIssueMode("발행취소")} style={{ ...buttonStyle(issueMode === "발행취소" ? "rgba(239,68,68,0.92)" : "transparent", "#fff"), padding: "8px 14px", borderRadius: 999 }}>발행취소</button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
            <div style={{ position: "relative" }}>
              <label style={labelStyle}>회원 검색</label>
              <input
                style={inputStyle}
                value={memberSearch}
                placeholder="이름 또는 전화번호 검색"
                onChange={(event) => {
                  setMemberSearch(event.target.value);
                  setShowMemberDropdown(true);
                  if (!event.target.value.trim()) {
                    setIssueForm((prev) => ({ ...prev, memberId: "", memberName: "" }));
                  }
                }}
                onFocus={() => setShowMemberDropdown(true)}
                onBlur={() => window.setTimeout(() => setShowMemberDropdown(false), 150)}
              />
              {showMemberDropdown && filteredMembers.length > 0 ? (
                <div style={{ position: "absolute", zIndex: 20, top: "100%", left: 0, right: 0, marginTop: 6, borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", background: "#111827", boxShadow: "0 18px 40px rgba(0,0,0,0.35)" }}>
                  {filteredMembers.map((member) => {
                    const memberId = String(member.memberId || member.id);
                    return (
                      <button
                        type="button"
                        key={memberId}
                        onMouseDown={() => {
                          setIssueForm((prev) => ({ ...prev, memberId, memberName: member.name || memberId }));
                          setMemberSearch(member.name ? `${member.name}${member.phone || member.phoneNumber ? ` (${member.phone || member.phoneNumber})` : ""}` : memberId);
                          setShowMemberDropdown(false);
                        }}
                        style={{ width: "100%", textAlign: "left", padding: "12px 14px", border: "none", background: "transparent", color: "#fff", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        <div style={{ fontWeight: 700 }}>{member.name || memberId}</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{member.phone || member.phoneNumber || memberId}</div>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <div>
              <label style={labelStyle}>{issueMode === "발행취소" ? "선택 안내" : "금액"}</label>
              <input
                style={{ ...inputStyle, opacity: issueMode === "발행취소" ? 0.65 : 1 }}
                inputMode="numeric"
                placeholder={issueMode === "발행취소" ? "아래 카드에서 발행취소를 누르세요" : "10000"}
                value={issueMode === "발행취소" ? "" : issueForm.amount ? Number(issueForm.amount).toLocaleString("ko-KR") : ""}
                disabled={issueMode === "발행취소"}
                onChange={(event) => setIssueForm((prev) => ({ ...prev, amount: sanitizeAmount(event.target.value) }))}
              />
              {issueMode === "발행취소" ? (
                <div style={{ marginTop: 10, borderRadius: 12, padding: "10px 12px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(248,113,113,0.2)", fontSize: 12, color: "#fecaca" }}>
                  검색한 회원의 사용가능 상품권 카드에서 발행취소를 누르면 즉시 회수되고 카드가 사라집니다.
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                  {[10000, 30000, 50000, 100000].map((value) => (
                    <button key={value} type="button" onClick={() => setIssueForm((prev) => ({ ...prev, amount: String(value) }))} style={{ ...buttonStyle("rgba(255,255,255,0.08)"), padding: "8px 12px", fontSize: 13 }}>
                      {value === 10000 ? "1만원" : value === 30000 ? "3만원" : value === 50000 ? "5만원" : "10만원"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label style={labelStyle}>발행지역 (선택)</label>
              <input
                style={inputStyle}
                placeholder="예) 울산 / 부산 / 서울 강남 / 제주"
                value={issueForm.issueRegion}
                onChange={(event) => setIssueForm((prev) => ({ ...prev, issueRegion: event.target.value }))}
              />
            </div>

            <div>
              <label style={labelStyle}>사유</label>
              <input
                style={inputStyle}
                placeholder={issueMode === "발행취소" ? "발행 취소 사유" : "지급 사유"}
                value={issueForm.description}
                onChange={(event) => setIssueForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </div>

            {selectedMemberBalance ? (
              <div style={{ borderRadius: 14, padding: "12px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
                현재 보유 금액 {formatVoucherAmount(memberActiveBalances[String(selectedMemberBalance.id)] || 0)} · 보유 장수 {memberIssueCounts[String(selectedMemberBalance.id)] || 0}장
              </div>
            ) : null}

            <button type="button" disabled={submitting} onClick={handleIssue} style={{ ...buttonStyle(issueMode === "발행취소" ? "rgba(239,68,68,0.92)" : "linear-gradient(90deg,#f0b90b,#f8d978)", issueMode === "발행취소" ? "#fff" : "#111827"), opacity: submitting ? 0.55 : 1 }}>
              {submitting ? "처리 중..." : issueMode === "발행취소" ? "아래 카드에서 발행취소" : "VIP 상품권 지급하기"}
            </button>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 14 }}>상품권 미리보기</div>
          <div style={voucherCardStyle}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.12), transparent 42%)", pointerEvents: "none" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 14, color: "#f8d978", fontWeight: 800 }}>🎟️ VIP 상품권</div>
                <div style={{ marginTop: 6, fontSize: 13, color: "rgba(255,255,255,0.72)" }}>지역공유발전플랫폼</div>
              </div>
              <div style={{ borderRadius: 999, padding: "6px 10px", background: "rgba(16,185,129,0.18)", border: "1px solid rgba(16,185,129,0.35)", color: "#86efac", fontSize: 12, fontWeight: 800 }}>
                사용가능
              </div>
            </div>

            <div style={{ fontSize: isMobile ? 28 : 34, fontWeight: 900, color: "#fff4c2", letterSpacing: "-0.03em", marginBottom: 18 }}>
              {amountValue > 0 ? formatVoucherAmount(amountValue) : "금액 입력"}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10, fontSize: 13, color: "rgba(255,255,255,0.74)" }}>
              <div>대상: {selectedMember?.name || issueForm.memberName || "회원 선택"}</div>
              <div>발행일: {formatVoucherDate(new Date())}</div>
              {issueForm.issueRegion.trim() ? <div>발행지역: {issueForm.issueRegion.trim()}</div> : null}
              <div style={{ fontFamily: "Consolas, Monaco, monospace", letterSpacing: "0.05em" }}>SERIAL: {previewSerial}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={panelStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
          <div style={{ fontSize: 17, fontWeight: 800 }}>보유 현황</div>
          <input style={{ ...inputStyle, width: isMobile ? "100%" : 240 }} placeholder="회원 검색" value={filters.member} onChange={(event) => setFilters((prev) => ({ ...prev, member: event.target.value }))} />
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.68)", fontSize: 12 }}>
                <th style={{ textAlign: "left", padding: "12px 10px" }}>이름</th>
                <th style={{ textAlign: "right", padding: "12px 10px" }}>보유 금액</th>
                <th style={{ textAlign: "right", padding: "12px 10px" }}>보유 장수</th>
                <th style={{ textAlign: "left", padding: "12px 10px" }}>최근 변동일</th>
                <th style={{ textAlign: "center", padding: "12px 10px" }}>이력</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: 28, textAlign: "center", color: "rgba(255,255,255,0.45)" }}>불러오는 중...</td></tr>
              ) : visibleBalanceRows.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 28, textAlign: "center", color: "rgba(255,255,255,0.45)" }}>보유 현황이 없습니다.</td></tr>
              ) : visibleBalanceRows.map((row) => (
                <tr key={row.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <td style={{ padding: "14px 10px" }}>
                    <div style={{ fontWeight: 700 }}>{row.name}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{row.id}</div>
                  </td>
                  <td style={{ padding: "14px 10px", textAlign: "right", fontWeight: 800, color: "#f8d978" }}>{formatVoucherAmount(row.total)}</td>
                  <td style={{ padding: "14px 10px", textAlign: "right" }}>{(row.issuedCount || 0).toLocaleString("ko-KR")}장</td>
                  <td style={{ padding: "14px 10px" }}>{formatVoucherDate(row.lastChangedAt)}</td>
                  <td style={{ padding: "14px 10px", textAlign: "center" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setFilters((prev) => ({ ...prev, member: row.name || row.id }));
                        ledgerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                      style={{ ...buttonStyle("rgba(255,255,255,0.08)"), padding: "8px 12px", fontSize: 12 }}
                    >
                      이력
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={panelStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
          <div style={{ fontSize: 17, fontWeight: 800 }}>{selectedMember?.name ? `${selectedMember.name}님 사용가능 상품권` : "최근 발행 상품권"}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.58)" }}>{selectedMember?.name ? "검색한 회원 기준" : "최근 지급 내역 기준"}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: 14 }}>
          {recentVoucherCards.length === 0 ? (
            <div style={{ color: "rgba(255,255,255,0.45)", padding: "12px 2px" }}>사용가능한 VIP 상품권이 없습니다.</div>
          ) : recentVoucherCards.map((log) => (
            <div key={log.id} style={voucherCardStyle}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.12), transparent 42%)", pointerEvents: "none" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 14, color: "#f8d978", fontWeight: 800 }}>🎟️ VIP 상품권</div>
                  <div style={{ marginTop: 4, fontSize: 13, color: "rgba(255,255,255,0.72)" }}>지역공유발전플랫폼</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {log.statusLabel === "사용가능" ? (
                    <button
                      type="button"
                      onClick={() => handleCancelIssuedVoucher(log)}
                      disabled={voucherCancellingSerial === log.serial}
                      style={{ ...buttonStyle("rgba(127,29,29,0.35)", "#fecaca"), padding: "6px 10px", fontSize: 11, border: "1px solid rgba(248,113,113,0.7)", opacity: voucherCancellingSerial === log.serial ? 0.6 : 1 }}
                    >
                      {voucherCancellingSerial === log.serial ? "취소중" : "발행취소"}
                    </button>
                  ) : null}
                  <div style={{ borderRadius: 999, padding: "6px 10px", background: getVoucherStatusStyle(log.statusLabel).background, border: `1px solid ${getVoucherStatusStyle(log.statusLabel).borderColor}`, color: getVoucherStatusStyle(log.statusLabel).color, fontSize: 12, fontWeight: 800 }}>{log.statusLabel}</div>
                </div>
              </div>
              <div style={{ fontSize: isMobile ? 24 : 30, fontWeight: 900, color: "#fff4c2", marginBottom: 16 }}>{formatVoucherAmount(log.amountAbs)}</div>
              <div style={{ display: "grid", gap: 6, fontSize: 13, color: "rgba(255,255,255,0.74)" }}>
                <div style={{ fontFamily: "Consolas, Monaco, monospace", letterSpacing: "0.05em" }}>SERIAL: {log.serial}</div>
                <div>발행일: {formatVoucherDate(log.createdAt)}</div>
                {log.issueRegion ? <div>발행지역: {log.issueRegion}</div> : null}
                <div>지급 대상: {log.memberName || log.memberId || "-"}</div>
                {log.statusLabel === "사용완료" && (log.descShopName || log.shopName) ? (
                  <div style={{ color: "#fca5a5" }}>사용처: {log.descShopName || log.shopName}</div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div ref={ledgerRef} style={panelStyle}>
        <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 14 }}>상품권 원장</div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, minmax(0, 1fr))", gap: 10, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>시작일</label>
            <input type="date" style={inputStyle} value={filters.from} onChange={(event) => setFilters((prev) => ({ ...prev, from: event.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>종료일</label>
            <input type="date" style={inputStyle} value={filters.to} onChange={(event) => setFilters((prev) => ({ ...prev, to: event.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>방향</label>
            <select style={inputStyle} value={filters.direction} onChange={(event) => setFilters((prev) => ({ ...prev, direction: event.target.value }))}>
              <option value="">전체</option>
              <option value="지급">지급</option>
              <option value="차감">차감</option>
              <option value="사용">사용</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>상태</label>
            <select style={inputStyle} value={filters.status} onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}>
              <option value="">전체</option>
              <option value="사용가능">사용가능</option>
              <option value="취소됨">취소됨</option>
              <option value="회수됨">회수됨</option>
              <option value="사용완료">사용완료</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.68)", fontSize: 12 }}>
                <th style={{ textAlign: "left", padding: "12px 10px" }}>일시</th>
                <th style={{ textAlign: "left", padding: "12px 10px" }}>일련번호</th>
                <th style={{ textAlign: "left", padding: "12px 10px" }}>대상</th>
                <th style={{ textAlign: "left", padding: "12px 10px" }}>방향</th>
                <th style={{ textAlign: "right", padding: "12px 10px" }}>금액</th>
                <th style={{ textAlign: "left", padding: "12px 10px" }}>상태</th>
                <th style={{ textAlign: "left", padding: "12px 10px" }}>발행지역</th>
                <th style={{ textAlign: "left", padding: "12px 10px" }}>사유</th>
              </tr>
            </thead>
            <tbody>
              {groupedLedgerLogs.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 28, textAlign: "center", color: "rgba(255,255,255,0.45)" }}>표시할 상품권 원장이 없습니다.</td></tr>
              ) : groupedLedgerLogs.map((group) => {
                const isExpanded = group.logs.length === 1 ? true : !!ledgerExpandedGroups[group.key];
                return (
                  <>
                    <tr key={`group-${group.key}`} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
                      <td colSpan={8} style={{ padding: "10px 12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 13, fontWeight: 800 }}>{group.targetType === "shop" ? "📁 상점" : "📁 회원"}</span>
                            <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{group.label}</span>
                            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "rgba(59,130,246,0.16)", color: "#93c5fd", fontWeight: 700 }}>{group.logs.length}건</span>
                            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: group.totalAmount >= 0 ? "rgba(110,231,183,0.15)" : "rgba(248,113,113,0.15)", color: group.totalAmount >= 0 ? "#6ee7b7" : "#f87171", fontWeight: 700 }}>
                              합계 {group.totalAmount > 0 ? "+" : ""}{group.totalAmount.toLocaleString("ko-KR")}원
                            </span>
                          </div>
                          {group.logs.length > 1 ? (
                            <button
                              type="button"
                              onClick={() => setLedgerExpandedGroups((prev) => ({ ...prev, [group.key]: !prev[group.key] }))}
                              style={{ ...buttonStyle("rgba(255,255,255,0.08)"), padding: "8px 12px", fontSize: 12 }}
                            >
                              {isExpanded ? "접기" : "더보기"}
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                    {isExpanded ? group.logs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <td style={{ padding: "14px 10px" }}>{formatVoucherDateTime(log.createdAt)}</td>
                        <td style={{ padding: "14px 10px", fontFamily: "Consolas, Monaco, monospace", color: "#f8d978" }}>{log.serial}</td>
                        <td style={{ padding: "14px 10px" }}>
                          {String(log.targetType || "") === "shop"
                            ? (log.shopName || log.descShopName || log.shopId || log.memberId || "-")
                            : (log.memberName || log.memberId || "-")}
                        </td>
                        <td style={{ padding: "14px 10px" }}>{log.direction}</td>
                        <td style={{ padding: "14px 10px", textAlign: "right", fontWeight: 800, color: log.direction === "지급" ? "#86efac" : log.direction === "사용" ? "#fca5a5" : "#fda4af" }}>{formatVoucherAmount(log.amountAbs)}</td>
                        <td style={{ padding: "14px 10px", color: getVoucherStatusStyle(log.statusLabel).color, fontWeight: 800 }}>{log.statusLabel}</td>
                        <td style={{ padding: "14px 10px" }}>{log.issueRegion || "-"}</td>
                        <td style={{ padding: "14px 10px", color: "rgba(255,255,255,0.78)" }}>
                          {log.reason ||
                            (String(log.source || "").toUpperCase() === "VOUCHER_SHOP_TRANSFER_IN" && log.fromMemberName
                              ? `${log.fromMemberName} 결제 상품권`
                              : "-")}
                        </td>
                      </tr>
                    )) : null}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MemberVipVoucherPanel({ walletView }) {
  const [mountNode, setMountNode] = useState(null);
  const [tabHost, setTabHost] = useState(null);
  const [voucherBalance, setVoucherBalance] = useState(null);
  const [voucherHistory, setVoucherHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  // walletTab 완전 제거, walletView만 단일 상태
  const isVoucher = walletView === "voucher";
  const hiddenPanelRef = useRef(null);
  const pointPanelsRef = useRef([]);

  useEffect(() => {
    const ensureMountNode = () => {
      // 1. 패널 분리: 각각 selector 우선순위로 anchor 탐색
      const pointPanel = document.querySelector('section.su-panel[data-point-wallet-anchor="true"]')
        || Array.from(document.querySelectorAll("section.su-panel")).find(panel => String(panel.textContent || "").includes("💰 포인트 관리"));
      const shopPanel = document.querySelector('section.su-panel[data-shop-wallet-anchor="true"]')
        || Array.from(document.querySelectorAll("section.su-panel")).find(panel => String(panel.textContent || "").includes("🏪 상점 포인트"));
      const vipPanel = document.querySelector('section.su-panel[data-vip-wallet-anchor="true"]')
        || Array.from(document.querySelectorAll("section.su-panel")).find(panel => String(panel.textContent || "").includes("🎟️ VIP 상품권"));

      // 2. 포인트 관리 패널만 pointPanelsRef에 저장
      pointPanelsRef.current = pointPanel ? [pointPanel] : [];
      if (pointPanel) pointPanel.setAttribute("data-wallet-point-panel", "true");

      // 3. 탭 호스트는 포인트 관리 anchor 기준
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

      // 4. VIP 상품권 패널 mount node
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
    // [VIP-FIX][STATE] 상태 단일화
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
        const [balanceRes, historyRes] = await Promise.all([
          fetch(`${VIP_API_BASE}/api/vouchers/${encodeURIComponent(memberId)}/balance`).then((response) => response.json()),
          fetch(`${VIP_API_BASE}/api/vouchers/${encodeURIComponent(memberId)}/history?limit=30`).then((response) => response.json()),
        ]);
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

  // [VIP-FIX][RENDER] 본문 렌더 조건 단일화
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
    marginBottom: 14,
  };
  const voucherCardStyle = {
    position: "relative",
    overflow: "hidden",
    borderRadius: 20,
    padding: "16px 14px",
    background: "linear-gradient(135deg, rgba(15,29,45,0.98) 0%, rgba(19,44,53,0.96) 54%, rgba(16,27,42,0.98) 100%)",
    border: "1px solid rgba(245, 208, 102, 0.34)",
    boxShadow: "0 18px 44px rgba(0,0,0,0.32)",
  };

  return (
    <>
      <style>{`
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
      `}</style>
      {tabHost ? createPortal(
        <div style={{ display: "inline-flex", width: "100%", padding: 4, borderRadius: 16, background: "linear-gradient(180deg, rgba(12,18,32,0.96), rgba(15,26,44,0.96))", border: "1px solid rgba(110,142,170,0.18)", boxShadow: "0 16px 34px rgba(0,0,0,0.22)", gap: 4, boxSizing: "border-box" }}>
          <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("su:my:walletView", { detail: "point" }))} style={{ flex: 1, border: "none", borderRadius: 12, padding: "10px 12px", background: !isVoucher ? "linear-gradient(90deg,#0f766e,#14b8a6)" : "transparent", color: !isVoucher ? "#effffb" : "#cbd5e1", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>포인트</button>
          <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("su:my:walletView", { detail: "voucher" }))} style={{ flex: 1, border: "none", borderRadius: 12, padding: "10px 12px", background: isVoucher ? "linear-gradient(90deg,#d4a72c,#f4d77a)" : "transparent", color: isVoucher ? "#111827" : "#cbd5e1", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>VIP 상품권</button>
        </div>,
        tabHost
      ) : null}
      {mountNode ? createPortal(
    <section className="su-panel" style={panelStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div className="su-sectionTitle">🎟️ VIP 상품권</div>
        <span style={{ fontSize: 15, fontWeight: 800, color: "#f8d978" }}>총 {formatVoucherAmount(totalAmount)}</span>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", opacity: 0.55, padding: 16 }}>⏳ 로딩 중...</div>
      ) : !voucherBalance || totalAmount <= 0 ? (
        <div style={{ textAlign: "center", opacity: 0.65, padding: 18, fontSize: 14 }}>보유 상품권이 없습니다.</div>
      ) : (
        <>
          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr", marginBottom: 14 }}>
            {activeVoucherCards.map((log) => (
              <div key={log.id} style={voucherCardStyle}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.12), transparent 42%)", pointerEvents: "none" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 13, color: "#f6d67a", fontWeight: 800 }}>🎟️ VIP 상품권</div>
                    <div style={{ marginTop: 4, fontSize: 12, color: "#d8e4ef" }}>지역공유발전플랫폼</div>
                  </div>
                  <div style={{ borderRadius: 999, padding: "5px 9px", background: getVoucherStatusStyle(log.statusLabel).background, border: `1px solid ${getVoucherStatusStyle(log.statusLabel).borderColor}`, color: getVoucherStatusStyle(log.statusLabel).color, fontSize: 11, fontWeight: 800 }}>{log.statusLabel}</div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#fff2bf", marginBottom: 14, letterSpacing: "-0.02em" }}>{formatVoucherAmount(log.amountAbs)}</div>
                <div style={{ display: "grid", gap: 5, fontSize: 12, color: "#dbe4ee" }}>
                  <div>발행일: {formatVoucherDate(log.createdAt)}</div>
                  {log.issueRegion ? <div>발행지역: {log.issueRegion}</div> : null}
                  <div style={{ fontFamily: "Consolas, Monaco, monospace", letterSpacing: "0.05em", color: "#b9cadb" }}>SERIAL: {log.serial}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, color: "#c8d5e3" }}>최근 내역</div>
          <div style={{ display: "grid", gap: 8 }}>
            {visibleHistory.map((history) => (
              <div key={history.id} className="su-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, borderRadius: 16, background: "rgba(255,255,255,0.055)", border: "1px solid rgba(203,213,225,0.1)", padding: "10px 12px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 3 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 999, background: "rgba(245,200,87,0.14)", color: "#f6d67a" }}>VIP 상품권</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#f8fafc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{history.reason || (history.direction === "지급" ? "관리자 지급" : history.direction === "사용" ? "상품권 사용" : "상품권 차감")}</div>
                  <div style={{ fontSize: 10, color: "#8fa2b8", marginTop: 2 }}>{formatVoucherDate(history.createdAt)}</div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 13, color: history.amount > 0 ? "#99f6e4" : "#fda4af", marginLeft: 12, whiteSpace: "nowrap" }}>{history.amount > 0 ? "+" : "-"}{formatVoucherAmount(history.amountAbs)}</div>
              </div>
            ))}
            {visibleHistory.length === 0 ? <div style={{ textAlign: "center", opacity: 0.6, fontSize: 13 }}>내역이 없습니다.</div> : null}
          </div>
        </>
      )}
    </section>,
    mountNode
      ) : null}
    </>
  );
}





function MyPageWithVipVoucherBridge() {
  const [walletView, setWalletView] = useState(() => {
    try {
      const saved = window.localStorage.getItem("walletView");
      if (saved === "point" || saved === "shop" || saved === "voucher") return saved;
    } catch (error) {}
    return "point";
  });

  // My.jsx의 walletView 상태를 추적
  useEffect(() => {
    // 상태 추적: My.jsx의 setWalletView를 가로채기 위해 이벤트 리스너 사용
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
      } catch (error) {}
    };
    window.addEventListener("su:walletView:changed", handler);
    window.addEventListener("storage", storageHandler);
    return () => {
      window.removeEventListener("su:walletView:changed", handler);
      window.removeEventListener("storage", storageHandler);
    };
  }, []);

  return (
    <>
      <My />
      {/* 브리지는 자체적으로 앵커를 탐색/연결한다. */}
      <ShopVoucherPaymentBridge />
      <MemberVipVoucherPanel walletView={walletView} />
    </>
  );
}

function GlobalChatFloatingBadge({ isLoggedIn }) {
  const location = useLocation();
  const navigate = useNavigate();
  const session = getSession();
  const myMemberId = String(session?.memberId || '').trim();
  const voiceEnabledRef = useRef(false);

  const [badgePos, setBadgePos] = useState(() => {
    try {
      const raw = window.localStorage.getItem('su:chat:floating:pos');
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && Number.isFinite(parsed.x) && Number.isFinite(parsed.y)) {
        return parsed;
      }
    } catch (e) {}
    return { x: Math.max(window.innerWidth - 82, 12), y: Math.max(window.innerHeight - 198, 90) };
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState('');

  const dragStateRef = useRef(null);
  const firstPollRef = useRef(true);
  const roomLastSeenRef = useRef({});
  const toastTimerRef = useRef(null);
  const pollTimerRef = useRef(null);

  const regionId = getCurrentRegionId();
  const onRegionChatPage = /^\/r\/[^/]+\/chat(?:\/|$)/.test(location.pathname);
  const onMyOfficePage = /^\/my(?:\/|$)|^\/myoffice(?:\/|$)/.test(location.pathname);

  useEffect(() => {
    try {
      window.localStorage.setItem('su:chat:floating:pos', JSON.stringify(badgePos));
    } catch (e) {}
  }, [badgePos]);

  useEffect(() => {
    if (!toast) return undefined;
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast('');
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
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const syncVoicePref = () => {
      try {
        voiceEnabledRef.current = window.localStorage.getItem('su:chat:notify:voice') === '1';
      } catch (e) {
        voiceEnabledRef.current = false;
      }
    };

    syncVoicePref();
    window.addEventListener('storage', syncVoicePref);
    window.addEventListener('su:chat:voice-pref:changed', syncVoicePref);
    return () => {
      window.removeEventListener('storage', syncVoicePref);
      window.removeEventListener('su:chat:voice-pref:changed', syncVoicePref);
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !myMemberId || !regionId || onMyOfficePage) {
      if (pollTimerRef.current) {
        window.clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      return undefined;
    }

    const headers = {
      'Content-Type': 'application/json',
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
    };

    const fetchJson = async (path) => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE || ''}${path}`, {
        credentials: 'include',
        headers,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || `요청 실패 (${response.status})`);
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
        o.type = 'triangle';
        o.frequency.setValueAtTime(720, now);
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(now);
        o.stop(now + 0.25);
        o.onended = () => { try { ctx.close(); } catch (e) {} };
      } catch (e) {}
    };

    const speakGlobalNotice = () => {
      try {
        if (!voiceEnabledRef.current) return;
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        const synth = window.speechSynthesis;
        if (!synth) return;
        if (synth.speaking) synth.cancel();
        const utterance = new SpeechSynthesisUtterance('공유');
        utterance.lang = 'ko-KR';
        utterance.rate = 1;
        utterance.pitch = 1;
        synth.speak(utterance);
      } catch (e) {}
    };

    const poll = async () => {
      try {
        const list = await fetchJson(`/api/chat-rooms?regionId=${encodeURIComponent(regionId)}`);
        const rooms = Array.isArray(list?.rooms) ? list.rooms : [];
        let hasNew = false;
        let latestSender = '회원';
        let latestText = '새 채팅이 도착했습니다.';

        for (const room of rooms) {
          const roomId = String(room?.roomId || '').trim();
          if (!roomId) continue;

          const latestAt = String(room?.lastMessageAt || '').trim();
          const prevAt = String(roomLastSeenRef.current[roomId] || '').trim();

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

          if (String(latest.memberId || '') === myMemberId) continue;

          hasNew = true;
          latestSender = latest.memberName || '회원';
          latestText = String(latest.messageType || 'text') === 'image'
            ? '이미지를 보냈습니다.'
            : String(latest.text || '새 채팅').slice(0, 36);
        }

        firstPollRef.current = false;

        if (hasNew && !onRegionChatPage) {
          setUnreadCount((prev) => Math.min(prev + 1, 99));
          setToast(`${latestSender}: ${latestText}`);
          playNoticeTone();
          speakGlobalNotice();
          try {
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('공유 채팅 알림', { body: `${latestSender}: ${latestText}` });
            }
          } catch (e) {}
        }
      } catch (e) {
        firstPollRef.current = false;
      }
    };

    poll();
    pollTimerRef.current = window.setInterval(poll, 5000);
    return () => {
      if (pollTimerRef.current) {
        window.clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [isLoggedIn, myMemberId, onRegionChatPage, onMyOfficePage, regionId, session?.token]);

  if (!isLoggedIn || !myMemberId || !regionId || onMyOfficePage) return null;

  const onPointerDown = (event) => {
    const startX = event.clientX;
    const startY = event.clientY;
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX,
      startY,
      originX: badgePos.x,
      originY: badgePos.y,
      moved: false,
    };
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch (e) {}
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
    <>
      <div
        role="button"
        aria-label="공유 채팅 바로가기"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          position: 'fixed',
          left: badgePos.x,
          top: badgePos.y,
          zIndex: 2200,
          minWidth: 54,
          height: 32,
          padding: '0 10px',
          borderRadius: 999,
          background: 'linear-gradient(135deg,#fee500,#facc15)',
          border: '2px solid rgba(255,255,255,0.98)',
          boxShadow: '0 8px 22px rgba(161,98,7,0.24)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#3f2a06',
          fontSize: 10,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          fontWeight: 900,
          userSelect: 'none',
          touchAction: 'none',
          cursor: 'grab',
        }}
      >
        공유
        {unreadCount > 0 ? (
          <span
            style={{
              position: 'absolute',
              right: -5,
              top: -5,
              minWidth: 18,
              height: 18,
              borderRadius: 999,
              background: '#ef4444',
              color: '#fff',
              border: '2px solid #fff',
              fontSize: 9,
              fontWeight: 900,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </div>
      {toast ? (
        <div
          style={{
            position: 'fixed',
            left: badgePos.x - 8,
            top: badgePos.y - 44,
            zIndex: 2201,
            background: 'rgba(15,23,42,0.94)',
            color: '#f8fafc',
            border: '1px solid rgba(56,189,248,0.35)',
            borderRadius: 10,
            padding: '7px 10px',
            fontSize: 11,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            boxShadow: '0 10px 24px rgba(2,6,23,0.35)',
            maxWidth: 220,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {toast}
        </div>
      ) : null}
    </>,
    document.body
  );
}

export default function App() {
  useEffect(() => {
    // ensure member profile exists on first app load (fallback when no signup page exists)
    try {
      ensureMemberProfile();
    } catch (e) {
      // noop
    }
  }, []);
  const getInitialAuthState = () => {
    const currentUser = getCurrentUser();
    const session = getSession();
    const loggedIn = isLoggedInMemory() || !!session?.memberId || !!currentUser?.memberId;
    return {
      isLoggedIn: loggedIn,
      authReady: isAuthReady() || loggedIn,
    };
  };
  const [authState, setAuthState] = useState(getInitialAuthState);
  const appBodyRef = useRef(null);

  // ⚡ 성능 개선: boot와 sync를 백그라운드에서 실행
  useEffect(() => {
    (async () => {
      try {
        const bres = await boot();
        if (import.meta.env.DEV) {
          console.log('[App] auth boot result:', bres);
        }
        
        // boot 후 동기화 실행 (백그라운드)
        syncOnAppStart().then(result => {
          if (import.meta.env.DEV && result.success) {
            console.log('[App] 데이터 동기화 완료:', result);
          }
        }).catch(err => {
          if (import.meta.env.DEV) {
            console.error('[App] 동기화 중 오류:', err);
          }
        });
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('[App] auth boot failed:', err);
        }
      }
    })();
  }, []);

  // SSOT auth bootstrap (cookie session → memory)
  useEffect(() => {
    let mounted = true;
    (async () => {
      await hydrateAuthFromServer();
      if (mounted) {
        setAuthState({
          isLoggedIn: isLoggedInMemory(),
          authReady: true,
        });
      }
    })();
    const onAuthChanged = () => {
      if (!mounted) return;
      setAuthState({
        isLoggedIn: isLoggedInMemory(),
        authReady: true,
      });
    };
    window.addEventListener('su:auth:changed', onAuthChanged);
    return () => {
      mounted = false;
      window.removeEventListener('su:auth:changed', onAuthChanged);
    };
  }, []);

  return (
    <div className="su-appShell su-app">
  <VoucherFetchRecorder />
  <VipAmountDisplayBridge />
  <VipMemberSummaryBridge />
  <MyOfficeHeroCleanupBridge />
  <CardCreateExperienceBridge />
  <PointWalletBridge />
  <style>{appNeonHomeStyles}</style>
  {/* Padding-bottom ensures page content isn't hidden behind the fixed BottomNav */}
  <div ref={appBodyRef} className="su-appBody" style={{ paddingBottom: 72 }}>
        <Suspense fallback={<div style={{ padding: 24, textAlign: 'center' }}>로딩 중...</div>}>
          <Routes>
          {/* Redirect root to /home */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          <Route path="/home" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/community" element={<Community />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/shops/events" element={<ShopEvents />} />
          <Route path="/shops" element={<Shops />} />
          <Route path="/shops/:id" element={<ShopDetail />} />
          <Route path="/my" element={<MyPageWithVipVoucherBridge />} />
          {/* /my/card 는 내 명함 비활성화 — My 페이지의 명함 버튼으로 통일 */}
          <Route path="/my/card" element={<Navigate to="/my" replace />} />
          <Route path="/card/:slug" element={<SimpleSavedCardPage />} />
          {/* 하위 호환: 구 주소 /cards/:cardId */}
          <Route path="/cards/:cardId" element={<Navigate to="/my" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/broadcast" element={<Broadcast />} />
          <Route path="/broadcast/:id" element={<BroadcastDetail />} />
          <Route path="/audition" element={<Audition />} />
          <Route path="/audition/:id" element={<AuditionDetail />} />
          <Route path="/audition/:id/apply" element={<AuditionApply />} />
          <Route path="/region" element={<RegionSelectPage />} />
          <Route path="/portal/region/:id" element={<Region />} />
          <Route path="/portal/region/:regionId/notices" element={<RegionNotices />} />
          <Route path="/regions/:regionCode/posts" element={<RegionPosts />} />
          {/* ★ 지역 허브 (신규) */}
          <Route path="/r/:regionId" element={<RegionLayout />}>
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
          </Route>
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/notices" element={<Notices />} />
          <Route path="/notices/:id" element={<Notices />} />
          <Route path="/missions" element={<Missions />} />
          <Route path="/support" element={<Support />} />
          <Route path="/card" element={<Card />} />

          <Route path="/regional-admin" element={<RegionalAdminConsole />} />

          {/* ★ 관리자 콘솔 라우트 (중첩 라우팅 + AdminLayout 가드) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="regions" element={<AdminRegions />} />
            <Route path="regions/:regionId/apartments" element={<AdminApartments />} />
            <Route path="stores" element={<AdminStores />} />
            <Route path="missions" element={<AdminMissions />} />
            <Route path="vouchers" element={<VipAdminVouchersPage />} />
            <Route path="auditions" element={<AdminAuditions />} />
            <Route path="contents" element={<AdminContents />} />
            <Route path="members" element={<AdminMembers />} />
            <Route path="points" element={<AdminPoints />} />
            <Route path="live-broadcast" element={<AdminLiveBroadcast />} />
            <Route path="supplies" element={<AdminSupplies />} />
            <Route path="supply-managers" element={<AdminSupplyManagers />} />
            <Route path="supply-tools" element={<AdminSupplyTools />} />
            <Route path="backup-tools" element={<AdminBackupTools />} />
          </Route>

          {/* 404 fallback */}
          <Route
            path="*"
            element={<div style={{ padding: 24 }}>페이지를 찾을 수 없습니다 (404)</div>}
          />
        </Routes>
        </Suspense>
      </div>
      {/* ensure app-body scroll resets on route change */}
      <ScrollToTop appBodyRef={appBodyRef} />
      {/* Global bottom navigation — rendered once for all routes */}
      <AppBottomNav
        isLoggedIn={authState.isLoggedIn}
        authReady={authState.authReady}
        onLogout={() => setAuthState({ isLoggedIn: false, authReady: true })}
      />
      <GlobalChatFloatingBadge isLoggedIn={authState.isLoggedIn} />
    </div>
  );
}
