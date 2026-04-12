import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "../routesMap";
import { isLoggedIn as checkLoggedIn, signOut, getSession } from "../lib/authStore";

// ★ pendingTab 관리 (sessionStorage 기반)
const PENDING_TAB_KEY = "su_pending_tab";
const setPendingTab = (tab) => {
  try { sessionStorage.setItem(PENDING_TAB_KEY, tab); } catch (e) {}
};
const getPendingTab = () => {
  try { return sessionStorage.getItem(PENDING_TAB_KEY); } catch (e) { return null; }
};
export const clearPendingTab = () => {
  try { sessionStorage.removeItem(PENDING_TAB_KEY); } catch (e) {}
};

// ★ 로그인 상태 구독을 위한 커스텀 훅
function useAuthState() {
  const [isAuthed, setIsAuthed] = useState(() => checkLoggedIn());
  const [user, setUser] = useState(() => getSession());

  const checkAuth = useCallback(() => {
    const authed = checkLoggedIn();
    const session = getSession();
    setIsAuthed(authed);
    setUser(session);
  }, []);

  useEffect(() => {
    // 초기 체크
    checkAuth();

    // SSOT: authStore 이벤트 기반 구독
    const handleAuthChanged = () => checkAuth();
    window.addEventListener('su:auth:changed', handleAuthChanged);

    return () => {
      window.removeEventListener('su:auth:changed', handleAuthChanged);
    };
  }, [checkAuth]);

  return { isAuthed, user };
}

export default function BottomNav(props) {
  // props kept for compatibility but router-mode is primary now
  const { className = "", style = {}, height = 50, onLogout } = props || {};
  const navigate = useNavigate();
  const location = useLocation();

  // ★ 로그인 상태 구독 (자동 리렌더링)
  const { isAuthed, user } = useAuthState();

  // ★ 디버그 로그: 마운트 시 1회만 출력 (useRef로 중복 방지)
  const _didLogRef = useRef(false);
  useEffect(() => {
    if (_didLogRef.current) return;
    _didLogRef.current = true;
    console.log("[BottomNav] authed?", isAuthed, user);
    // 빈 deps로 마운트 시 1회만 실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ★ 현재 경로 기반 activeKey 계산 (pendingTab 우선)
  const currentPath = location.pathname;
  
  // activeKey 매핑: /auth, /login일 때 pendingTab 확인
  const getActiveKey = () => {
    const isAuthPage = currentPath === "/auth" || currentPath === "/login";
    
    // ★ 로그인 페이지에서의 activeKey 계산
    // pendingTab='my' 이고 returnTo가 /my인 경우에만 myoffice active
    // 그 외 모든 경우 → auth active
    if (isAuthPage) {
      const pending = getPendingTab();
      const returnTo = location.state?.returnTo;
      if (pending === "my" && returnTo === "/my") {
        return "my";
      }
      return "auth";
    }
    
    if (currentPath === "/my" || currentPath === "/myoffice") return "my";
    // 커뮤니티: /community, /r/.../board, /r/.../board/... 경로
    if (currentPath === "/community") return "community";
    if (/^\/r\/[^/]+\/board(\/|$)/.test(currentPath)) return "community";
    return currentPath;
  };
  const activeKey = getActiveKey();

  // ★ 미래형 HUD 네비바
  const barStyle = {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    height,
    display: "flex",
    width: "100%",
    padding: "2px 8px",
    paddingBottom: "env(safe-area-inset-bottom, 0px)",
    margin: "0",
    justifyContent: "space-evenly",
    alignItems: "center",
    backgroundColor: "rgba(5, 14, 24, 0.92)",
    backgroundImage: "radial-gradient(circle at 14% 0%, rgba(56,189,248,0.18) 0%, rgba(5,14,24,0) 36%), radial-gradient(circle at 86% 0%, rgba(45,212,191,0.16) 0%, rgba(5,14,24,0) 34%), linear-gradient(180deg, rgba(15,23,42,0.96), rgba(2,6,23,0.96))",
    borderTop: "1px solid rgba(56,189,248,0.42)",
    boxShadow: "0 -10px 24px rgba(2,6,23,0.46), inset 0 1px 0 rgba(125,211,252,0.24)",
    backdropFilter: "blur(10px)",
    zIndex: 9999,
    boxSizing: "border-box",
    ...style,
  };

  // ★ 탭 버튼 균등 분배 CSS
  const itemBase = {
    flex: "1 1 0",
    minWidth: 0,
    width: 0,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    background: "transparent",
    backgroundColor: "transparent",
    border: "0",
    outline: "none",
    boxShadow: "none",
    WebkitTapHighlightColor: "transparent",
    padding: "3px 2px",
    margin: "0",
    fontSize: 11,
    color: "#93a6bc",
    cursor: "pointer",
    textDecoration: "none",
    boxSizing: "border-box",
  };

  const activeStyle = {
    fontWeight: 800,
  };

  // ★ 라벨 프레임
  const labelFrameBaseStyle = {
    width: "94%",
    minHeight: 30,
    borderRadius: 9,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(56,189,248,0.12)",
    background: "linear-gradient(180deg, rgba(15,23,42,0.30), rgba(15,23,42,0.10))",
    boxSizing: "border-box",
  };

  const labelFrameActiveStyle = {
    ...labelFrameBaseStyle,
    border: "1px solid rgba(45,212,191,0.60)",
    background: "linear-gradient(180deg, rgba(13,148,136,0.30), rgba(6,78,59,0.22))",
    boxShadow: "0 0 0 1px rgba(45,212,191,0.18), 0 0 14px rgba(45,212,191,0.22)",
  };

  // ★ span 라벨 스타일: 줄바꿈/넘침 방지
  const spanBaseStyle = {
    color: "#cbd5e1",
    textShadow: "0 0 1px rgba(148,163,184,0.25)",
    fontWeight: 800,
    lineHeight: 1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
    fontSize: 11,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    boxSizing: "border-box",
  };

  const spanActiveStyle = {
    color: "#99f6e4",
    textShadow: "0 0 8px rgba(45,212,191,0.45)",
    fontWeight: 900,
    lineHeight: 1,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
    fontSize: 11,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    boxSizing: "border-box",
  };

  // ★ auth 전용: 두 줄 표시 스타일
  const authSpanStyle = (isActive) => ({
    ...(isActive ? spanActiveStyle : spanBaseStyle),
    whiteSpace: "pre-line",
    lineHeight: 1.2,
    fontSize: 9.5,
    textOverflow: "clip",
  });

  const underlineStyle = {
    height: 2,
    width: 22,
    borderRadius: 999,
    background: "linear-gradient(90deg, #22d3ee, #2dd4bf)",
    boxShadow: "0 0 10px rgba(45,212,191,0.60)",
    marginTop: 3,
  };

  // ★ 마이오피스 클릭 핸들러: pendingTab 저장 후 로그인 페이지로 이동
  const handleMyOfficeClick = (e) => {
    e.preventDefault();
    if (!isAuthed) {
      // pendingTab에 'my' 저장하여 로그인 화면에서도 마이오피스 active 유지
      setPendingTab("my");
      navigate("/auth", { state: { returnTo: "/my" } });
    } else {
      clearPendingTab();
      navigate("/my");
    }
  };

  // ★ 로그아웃 확인 팝업 상태
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // ★ 하단 배너 광고 슬롯
  const [bottomBanner, setBottomBanner] = useState(null);
  const [bannerClosed, setBannerClosed] = useState(() => {
    try { return sessionStorage.getItem('su_banner_closed') === '1'; } catch { return false; }
  });
  useEffect(() => {
    fetch('/api/banners?type=bottom_banner&is_active=true')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const list = (data && (data.banners || data.data)) || [];
        if (list.length > 0) setBottomBanner(list[0]);
      })
      .catch(() => {});
  }, []);
  
  // ★ 모달 ref (디버그용)
  const overlayRef = useRef(null);
  const modalRef = useRef(null);

  // ★ 로그아웃 실행
  const handleLogoutConfirm = async () => {
    setShowLogoutConfirm(false);
    try {
      // ★ async signOut 호출
      await signOut();
      sessionStorage.removeItem(PENDING_TAB_KEY);
    } catch (e) {
      console.error("[Bottomnav] Logout error:", e);
    }
    try {
      onLogout?.();
    } catch (e) {}
    // 홈으로 이동
    navigate("/home");
  };

  // ★ 팝업 열릴 때 body 스크롤 방지 + 디버그 로그
  useEffect(() => {
    if (showLogoutConfirm) {
      document.body.style.overflow = "hidden";
      
      // 디버그: DOM 렌더링 후 스타일 체크
      setTimeout(() => {
        const overlayEl = overlayRef.current;
        const modalEl = modalRef.current;
        
        console.log("[LogoutModal] === DEBUG START ===");
        console.log("[LogoutModal] overlayEl exists:", !!overlayEl);
        console.log("[LogoutModal] modalEl exists:", !!modalEl);
        
        if (overlayEl) {
          const rect = overlayEl.getBoundingClientRect();
          const cs = getComputedStyle(overlayEl);
          console.log("[LogoutModal] overlay rect:", rect);
          console.log("[LogoutModal] overlay computed:", {
            display: cs.display,
            alignItems: cs.alignItems,
            justifyContent: cs.justifyContent,
            position: cs.position,
            top: cs.top,
            bottom: cs.bottom,
          });
        }
        
        if (modalEl) {
          const rect = modalEl.getBoundingClientRect();
          const cs = getComputedStyle(modalEl);
          console.log("[LogoutModal] modal rect:", rect);
          console.log("[LogoutModal] modal computed:", {
            position: cs.position,
            top: cs.top,
            left: cs.left,
            bottom: cs.bottom,
            right: cs.right,
            transform: cs.transform,
          });
        }
        console.log("[LogoutModal] === DEBUG END ===");
      }, 50);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showLogoutConfirm]);

  // ★ 로그아웃 확인 팝업 스타일 (강제 중앙 모달 - 모든 bottom-sheet 스타일 무력화)
  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    // flex 관련 모두 제거/무력화
    display: "block",
    alignItems: "unset",
    justifyContent: "unset",
    flexDirection: "unset",
    // z-index
    zIndex: 10000,
    background: "rgba(0,0,0,0.5)",
    // 기타 초기화
    margin: 0,
    padding: 0,
    border: "none",
    borderRadius: 0,
  };

  const modalBoxStyle = {
    position: "fixed",
    // 중앙 정렬 강제
    top: "50%",
    left: "50%",
    bottom: "auto",  // bottom-sheet 무력화
    right: "auto",
    transform: "translate(-50%, -50%)",
    // 크기
    width: "90%",
    maxWidth: 360,
    // z-index
    zIndex: 10001,
    // 스타일
    background: "#1a1a2e",
    borderRadius: 16,  // 모든 모서리 동일
    padding: 24,
    border: "1px solid rgba(255,255,255,0.1)",
    textAlign: "center",
    boxSizing: "border-box",
    // margin 초기화
    margin: 0,
    // box-shadow
    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
  };

  const modalTitleStyle = {
    fontSize: 18,
    fontWeight: 700,
    color: "#fff",
    marginBottom: 12,
  };

  const modalTextStyle = {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 24,
    lineHeight: 1.5,
  };

  const modalBtnRowStyle = {
    display: "flex",
    gap: 10,
  };

  const modalBtnCancelStyle = {
    flex: 1,
    padding: "12px 16px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "transparent",
    color: "rgba(255,255,255,0.8)",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  };

  const modalBtnLogoutStyle = {
    flex: 1,
    padding: "12px 16px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "#fff",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  };

  // /auth 진입 시 BottomNav 완전 숨김 (브랜드 게이트 몰입 UX)
  if (currentPath === "/auth" || currentPath === "/login") return null;

  return (
    <>
      {/* 하단 배너 광고 슬롯 (네비 상단 고정) */}
      {bottomBanner && !bannerClosed && (
        <div style={{
          position: 'fixed', left: 0, right: 0, bottom: height,
          zIndex: 9998,
          background: '#fff',
          borderTop: '1px solid #DDE3EA',
          display: 'flex', alignItems: 'center',
          padding: '0 12px',
          height: 52,
          boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
        }}>
          {bottomBanner.link_url ? (
            <a
              href={bottomBanner.link_url}
              style={{ flex: 1, display: 'flex', alignItems: 'center', textDecoration: 'none' }}
              target="_blank" rel="noopener noreferrer"
            >
              {bottomBanner.image_url
                ? <img src={bottomBanner.image_url} alt={bottomBanner.alt || '광고'} style={{ height: 40, maxWidth: '100%', objectFit: 'contain' }} />
                : <span style={{ fontSize: 13, color: '#0D1B21' }}>{bottomBanner.alt || '광고'}</span>}
            </a>
          ) : (
            <div style={{ flex: 1 }}>
              {bottomBanner.image_url
                ? <img src={bottomBanner.image_url} alt={bottomBanner.alt || '광고'} style={{ height: 40, maxWidth: '100%', objectFit: 'contain' }} />
                : <span style={{ fontSize: 13, color: '#0D1B21' }}>{bottomBanner.alt || '광고'}</span>}
            </div>
          )}
          <button
            type="button"
            onClick={() => { setBannerClosed(true); try { sessionStorage.setItem('su_banner_closed', '1'); } catch {} }}
            style={{ background: 'none', border: 'none', padding: '4px 0 4px 8px', cursor: 'pointer', color: '#94A3B8', fontSize: 18, lineHeight: 1 }}
            aria-label="배너 닫기"
          >✕</button>
        </div>
      )}
      <nav style={barStyle} className={className} role="navigation" aria-label="하단 네비게이션">
      {NAV_ITEMS.map((item) => {
        // ★ auth 탭 처리: /auth, /login일 때 active
        if (item.key === "auth") {
          const isAuthActive = activeKey === "auth";
          
          if (!isAuthed) {
            // ★ auth 탭 클릭 시 pendingTab 클리어하여 auth가 active되도록
            const handleAuthClick = () => {
              clearPendingTab();
            };
            
            // show login/signup link
            return (
              <NavLink
                key={item.key}
                to={item.path}
                end={false}
                onClick={handleAuthClick}
                style={{ ...itemBase, ...(isAuthActive ? activeStyle : {}) }}
                aria-current={isAuthActive ? "page" : undefined}
              >
                <div aria-hidden="true" style={isAuthActive ? labelFrameActiveStyle : labelFrameBaseStyle}>
                  <span style={authSpanStyle(isAuthActive)}>
                    {"로그인\n회원가입"}
                  </span>
                </div>
                {/* active underline indicator */}
                {isAuthActive ? <div aria-hidden style={underlineStyle} /> : null}
              </NavLink>
            );
          }

          // ★ 로그인 상태 -> 로그아웃 버튼 표시 (빨간 글자)
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              style={{ ...itemBase, border: 0, background: "transparent" }}
            >
              <div aria-hidden="true" style={labelFrameBaseStyle}>
                <span
                  style={{
                    ...spanBaseStyle,
                    color: "#f87171",
                    textShadow: "0 0 6px rgba(248,113,113,0.35)",
                  }}
                >
                  로그아웃
                </span>
              </div>
            </button>
          );
        }

        // ★ 마이오피스 탭: /my일 때만 active
        if (item.key === "my") {
          const isMyActive = activeKey === "my";

          return (
            <button
              key={item.key}
              type="button"
              onClick={handleMyOfficeClick}
              style={{ ...itemBase, ...(isMyActive ? activeStyle : {}), border: 0, background: "transparent" }}
            >
              <div aria-hidden="true" style={isMyActive ? labelFrameActiveStyle : labelFrameBaseStyle}>
                <span style={isMyActive ? spanActiveStyle : spanBaseStyle}>{item.label}</span>
              </div>
              {isMyActive ? <div aria-hidden style={underlineStyle} /> : null}
            </button>
          );
        }

        // default nav item
        const isItemActive = activeKey === item.key || activeKey === item.path;
        return (
          <NavLink
            key={item.key}
            to={item.path}
            end={item.key === "home"}
            style={() => ({ ...itemBase, ...(isItemActive ? activeStyle : {}) })}
            aria-current={isItemActive ? "page" : undefined}
          >
            {() => (
              <>
                <div aria-hidden="true" style={isItemActive ? labelFrameActiveStyle : labelFrameBaseStyle}>
                  <span style={isItemActive ? spanActiveStyle : spanBaseStyle}>{item.label}</span>
                </div>
                {isItemActive ? <div aria-hidden style={underlineStyle} /> : null}
              </>
            )}
          </NavLink>
        );
      })}

      {/* ★ 로그아웃 확인 팝업 (createPortal로 body에 렌더링 - 중앙 모달) */}
      {showLogoutConfirm && createPortal(
        <>
          {/* 배경 오버레이 */}
          <div 
            ref={overlayRef}
            style={modalOverlayStyle} 
            onClick={() => setShowLogoutConfirm(false)}
            aria-hidden="true"
          />
          {/* 모달 박스 (화면 중앙 - fixed + transform) */}
          <div 
            ref={modalRef}
            style={modalBoxStyle} 
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div id="logout-title" style={modalTitleStyle}>로그아웃</div>
            <div style={modalTextStyle}>정말 로그아웃하시겠습니까?</div>
            <div style={modalBtnRowStyle}>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                style={modalBtnCancelStyle}
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleLogoutConfirm}
                style={modalBtnLogoutStyle}
              >
                로그아웃
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </nav>
    </>
  );
}
