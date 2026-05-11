import React from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { isAdminAuthenticatedLocal, adminLogout, getAdminToken } from "../../lib/adminAuth";

// ★ 스타일
const S = {
  container: {
    minHeight: "100vh",
    background: "#0f0f14",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    background: "#18181b",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    padding: "12px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#fff",
    fontWeight: 700,
    fontSize: 16,
    textDecoration: "none",
  },
  logoIcon: {
    width: 28,
    height: 28,
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
  },
  nav: {
    display: "flex",
    gap: 4,
    overflowX: "auto",
    padding: "12px 16px",
    background: "#18181b",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  navLink: {
    padding: "8px 14px",
    borderRadius: 8,
    color: "rgba(255,255,255,0.6)",
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: "nowrap",
    transition: "all 0.2s",
  },
  navLinkActive: {
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    color: "#fff",
  },
  exitBtn: {
    padding: "8px 14px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "transparent",
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  main: {
    flex: 1,
    padding: "20px 16px 100px",
    overflowY: "auto",
    color: "#ffffff",
  },
  loadingBox: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0f0f14",
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
  },
};

// ★ 메뉴 항목
const MENU_ITEMS = [
  { path: "/admin", label: "대시보드", icon: "📊", end: true },
  { path: "/admin/regions", label: "지역관리", icon: "🗺️" },
  { path: "/admin/missions", label: "미션/이벤트", icon: "🎯" },
  { path: "/admin/vouchers", label: "상품권관리", icon: "🎟️" },
  { path: "/admin/stores", label: "상점관리", icon: "🏪" },
  { path: "/admin/contents", label: "콘텐츠", icon: "📰" },
  { path: "/admin/auditions", label: "오디션", icon: "🎤" },
  { path: "/admin/members", label: "회원관리", icon: "👥" },
  { path: "/admin/live-broadcast", label: "라이브방송", icon: "📡" },
  { path: "/admin/distribution", label: "유통지원", icon: "📦" },
  { path: "/admin/supply-managers", label: "보급담당자", icon: "📋" },
  { path: "/admin/supply-tools", label: "보급도구", icon: "⚙️" },
  { path: "/admin/backup-tools", label: "백업·임포트", icon: "💾" },
  { path: "/admin/points", label: "포인트관리", icon: "💎" },
];

// 역할 표시명 매핑
const ROLE_DISPLAY = {
  WEBSITE_ADMIN: { label: "웹사이트 관리자", icon: "🌐", color: "#ec4899" },
  SUPER_ADMIN:   { label: "총관리자",       icon: "⭐", color: "#f59e0b" },
  ADMIN:         { label: "관리자",         icon: "🛡️", color: "#8b5cf6" },
  REGION_ADMIN:  { label: "지역총관리자",   icon: "🌏", color: "#0ea5a4" },
  REGION_MANAGER:{ label: "지역관리자",     icon: "📍", color: "#2563eb" },
  USER:          { label: "일반회원",       icon: "👤", color: "#6b7280" },
};

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const initializedRef = React.useRef(false);
  const hasRedirectedRef = React.useRef(false);
  const verifyInFlightRef = React.useRef(false);
  const [authState, setAuthState] = React.useState(() => {
    const authenticated = isAdminAuthenticatedLocal();
    return { ready: true, authenticated };
  });

  console.log('[ADMIN-HOME-RENDER]', 'AdminLayout', { pathname: location.pathname, authState });
  console.log('[ADMIN-PAGE-STATE]', { pathname: location.pathname, layout: 'AdminLayout', authReady: authState.ready, authenticated: authState.authenticated });

  const resolveAuthState = React.useCallback((reason = 'unknown') => {
    const token = getAdminToken();
    const authenticated = !!token && isAdminAuthenticatedLocal();
    console.log('[ADMIN-AUTH-ROLE]', { reason, pathname: location.pathname, tokenPresent: !!token, authenticated });
    setAuthState((prev) => {
      if (prev.ready === true && prev.authenticated === authenticated) return prev;
      return { ready: true, authenticated };
    });
    return authenticated;
  }, [location.pathname]);

  React.useEffect(() => {
    console.log('[ADMIN-HOME-EFFECT]', 'AdminLayout:init', { pathname: location.pathname });
    if (initializedRef.current) return;
    initializedRef.current = true;
    resolveAuthState('layout-init');
  }, [location.pathname, resolveAuthState]);

  React.useEffect(() => {
    console.log('[ADMIN-HOME-EFFECT]', 'AdminLayout:redirect-check', { pathname: location.pathname, authState });
    if (!authState.ready || authState.authenticated || hasRedirectedRef.current) return;
    hasRedirectedRef.current = true;
    console.log('[ADMIN-NAVIGATE-CALL]', { from: location.pathname, to: '/admin/login', reason: 'layout-auth-guard' });
    navigate('/admin/login', { replace: true });
  }, [authState, location.pathname, navigate]);

  // ★ 역할 변경/세션 만료 감지: 30초마다 서버 세션 검증
  // → 다른 관리자가 이 계정의 role을 비관리자로 변경하면 즉시 퇴출
  React.useEffect(() => {
    if (!authState.ready || !authState.authenticated) return undefined;
    const checkSession = async () => {
      if (verifyInFlightRef.current) return;
      verifyInFlightRef.current = true;
      const token = getAdminToken();
      if (!token) {
        await adminLogout();
        resolveAuthState('session-missing-token');
        if (!hasRedirectedRef.current) {
          hasRedirectedRef.current = true;
          console.log('[ADMIN-NAVIGATE-CALL]', { from: location.pathname, to: '/admin/login', reason: 'session-missing-token' });
          navigate('/admin/login', { replace: true });
        }
        verifyInFlightRef.current = false;
        return;
      }
      try {
        const API_BASE = import.meta.env.VITE_API_BASE || '';
        const res = await fetch(`${API_BASE}/api/admin/auth/verify`, {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include',
        });
        if (res.status === 401 || res.status === 403) {
          await adminLogout();
          resolveAuthState('session-verify-failed');
          if (!hasRedirectedRef.current) {
            hasRedirectedRef.current = true;
            alert('세션이 만료되었거나 관리자 권한이 변경되었습니다. 다시 로그인하세요.');
            console.log('[ADMIN-NAVIGATE-CALL]', { from: location.pathname, to: '/admin/login', reason: 'session-verify-failed' });
            navigate('/admin/login', { replace: true });
          }
        }
      } catch {
        // 네트워크 오류 시 무시 (오프라인 등)
      } finally {
        verifyInFlightRef.current = false;
      }
    };
    const interval = setInterval(checkSession, 30_000);
    return () => clearInterval(interval);
  }, [authState.authenticated, authState.ready, location.pathname, navigate, resolveAuthState]);

  // ★ 렌더 시점에 즉시 체크 — 미인증이면 바로 로그인 페이지
  if (!authState.ready || !authState.authenticated) {
    return <div style={S.loadingBox}>관리자 권한 확인 중...</div>;
  }

  // ★ 로그인 사용자 정보
  const adminName      = sessionStorage.getItem("su_admin_name") || "관리자";
  const adminRole      = sessionStorage.getItem("su_admin_role") || "ADMIN";
  const isWebsiteAdmin = sessionStorage.getItem("su_admin_is_website_admin") === "true";
  // isWebsiteAdmin 플래그가 true면 역할 표시를 WEBSITE_ADMIN으로 보정
  const effectiveRole  = isWebsiteAdmin ? "WEBSITE_ADMIN" : adminRole;
  const roleInfo       = ROLE_DISPLAY[effectiveRole] || ROLE_DISPLAY.ADMIN;

  // ★ 마이오피스로 돌아가기
  const handleExit = () => {
    navigate("/my");
  };

  return (
    <div style={S.container}>
      {/* 헤더 */}
      <header style={S.header}>
        <NavLink to="/admin" style={S.logo}>
          <span style={S.logoIcon}>⚙️</span>
          <span>관리자 콘솔</span>
        </NavLink>
        {/* 우측: 사용자 정보 + 나가기 */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right", lineHeight: 1.4 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{adminName || "관리자"}</div>
            <div style={{ fontSize: 11, color: roleInfo.color, fontWeight: 600 }}>
              {roleInfo.icon} {roleInfo.label}
            </div>
          </div>
          <button onClick={handleExit} style={S.exitBtn}>
            ← 나가기
          </button>
        </div>
      </header>

      {/* 네비게이션 메뉴 */}
      <nav style={S.nav}>
        {MENU_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            style={({ isActive }) => ({
              ...S.navLink,
              ...(isActive ? S.navLinkActive : {}),
            })}
          >
            {item.icon} {item.label}
          </NavLink>
        ))}
      </nav>

      {/* 메인 콘텐츠 영역 - Outlet */}
      <main style={S.main}>
        <Outlet />
      </main>
    </div>
  );
}
