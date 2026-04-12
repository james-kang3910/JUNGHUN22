import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  getRegions,
  getPublicRegions,
  getMissions,
  getEvents,
  getShops,
  getAuditions,
  getNotices,
  getBroadcasts,
  getMembers,
  calculateStatus
} from "../../lib/adminStore";
import { isAdminAuthenticatedLocal, adminLogout } from "../../lib/adminAuth";
import * as storageAdapter from "../../lib/storageAdapter";

function buildDashboardStatsSnapshot({ regions = [], publicRegions = [], missions = [], events = [], shops = [], auditions = [], notices = [], broadcasts = [], members = [], pointLedger = [], voucherLogs = [] } = {}) {
  return {
    regions: {
      total: regions.length,
      public: publicRegions.length,
    },
    missions: {
      total: missions.length,
      active: missions.filter((item) => item.isActive && calculateStatus(item.startDate, item.endDate) === "ongoing").length,
    },
    events: {
      total: events.length,
      active: events.filter((item) => item.isActive && calculateStatus(item.startDate, item.endDate) === "ongoing").length,
    },
    shops: {
      total: shops.length,
      approved: shops.filter((item) => item.status === "approved").length,
      pending: shops.filter((item) => item.status === "pending").length,
    },
    auditions: {
      total: auditions.length,
      active: auditions.filter((item) => item.isActive && calculateStatus(item.startDate, item.endDate) === "ongoing").length,
    },
    notices: {
      total: notices.length,
      public: notices.filter((item) => item.isPublic).length,
    },
    broadcasts: {
      total: broadcasts.length,
      public: broadcasts.filter((item) => item.isPublic).length,
    },
    users: {
      total: members.length,
      active: members.filter((item) => item.status === "ACTIVE").length,
    },
    points: {
      ledgerCount: pointLedger.length,
    },
    vouchers: {
      total: voucherLogs.length,
      issued: voucherLogs.filter((item) => item.amount > 0).length,
    },
  };
}

function getCachedDashboardStats() {
  return buildDashboardStatsSnapshot({
    regions: getRegions?.() || [],
    publicRegions: getPublicRegions?.() || [],
    missions: getMissions?.() || [],
    events: getEvents?.() || [],
    shops: getShops?.() || [],
    auditions: getAuditions?.() || [],
    notices: getNotices?.() || [],
    broadcasts: getBroadcasts?.() || [],
    members: getMembers?.() || [],
  });
}

function withTimeout(promise, timeoutMs, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timeout`)), timeoutMs);
    }),
  ]);
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState(() => getCachedDashboardStats());
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const initializedRef = useRef(false);
  const reloadTimerRef = useRef(null);
  const loadInFlightRef = useRef(false);
  const mountedRef = useRef(false);

  console.log('[ADMIN-HOME-RENDER]', 'AdminDashboard', { pathname: location.pathname, loading, refreshing, hasStats: !!stats });
  console.log('[ADMIN-PAGE-STATE]', { pathname: location.pathname, loading, refreshing, hasStats: !!stats, error: !!error });

  const loadStats = useCallback(async ({ initial = false, reason = 'manual' } = {}) => {
    console.log('[ADMIN-REFRESH-TRIGGER]', { reason, pathname: location.pathname, initial, inFlight: loadInFlightRef.current });
    if (loadInFlightRef.current) return;
    loadInFlightRef.current = true;
    const cachedStats = getCachedDashboardStats();
    if (initial) {
      setStats(cachedStats);
      setLoading(false);
    } else {
      setRefreshing(true);
    }
    setError(null);
    try {
      if (typeof storageAdapter.getRegions !== "function" || typeof storageAdapter.getMembers !== "function") {
        console.error("storageAdapter missing functions:", Object.keys(storageAdapter || {}));
        throw new Error("storageAdapter.getRegions or storageAdapter.getMembers is not a function");
      }

      const [serverRegions, serverMembers, serverMissions, serverEvents, serverShops, serverAuditions, serverNotices, serverBroadcasts] = await Promise.all([
        withTimeout(storageAdapter.getRegions(), 5000, 'admin-regions'),
        withTimeout(storageAdapter.getMembers(), 5000, 'admin-members'),
        withTimeout(storageAdapter.getMissions(), 5000, 'admin-missions'),
        withTimeout(storageAdapter.getEvents(), 5000, 'admin-events'),
        withTimeout(storageAdapter.getShops(), 5000, 'admin-shops'),
        withTimeout(storageAdapter.getAuditions(), 5000, 'admin-auditions'),
        withTimeout(storageAdapter.getNotices(), 5000, 'admin-notices'),
        withTimeout(storageAdapter.getBroadcasts(), 5000, 'admin-broadcasts'),
      ]);

      localStorage.setItem("su_regions", JSON.stringify(serverRegions));
      localStorage.setItem("su_members_v1", JSON.stringify(serverMembers));
      localStorage.setItem("su_missions", JSON.stringify(serverMissions || []));
      localStorage.setItem("su_events", JSON.stringify(serverEvents || []));
      localStorage.setItem("su_shops", JSON.stringify(serverShops || []));
      localStorage.setItem("su_auditions", JSON.stringify(serverAuditions || []));
      localStorage.setItem("su_notices", JSON.stringify(serverNotices || []));
      localStorage.setItem("su_broadcasts", JSON.stringify(serverBroadcasts || []));

      const regions = serverRegions || [];
      const publicRegions = getPublicRegions?.() || [];
      const missions = serverMissions || [];
      const events = serverEvents || [];
      const shops = serverShops || [];
      const auditions = serverAuditions || [];
      const notices = serverNotices || [];
      const broadcasts = serverBroadcasts || [];
      const members = serverMembers || [];

      let pointLedger = [];
      try {
        const ledgerData = await storageAdapter.getPointHistory('all', { limit: 100 });
        pointLedger = ledgerData?.transactions || ledgerData || [];
      } catch (e) {
        console.warn('[AdminDashboard] Failed to load point ledger (sample) from server:', e);
      }

      let voucherLogs = [];
      try {
        const token = localStorage.getItem('adminToken') || '';
        const vRes = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/vouchers/logs?limit=200`, {
          headers: { 'x-admin-token': token }
        });
        if (vRes.ok) {
          const vData = await vRes.json();
          voucherLogs = vData.logs || [];
        }
      } catch (e) {
        console.warn('[AdminDashboard] Failed to load voucher logs:', e);
      }

      if (!mountedRef.current) return;
      setStats(buildDashboardStatsSnapshot({ regions, publicRegions, missions, events, shops, auditions, notices, broadcasts, members, pointLedger, voucherLogs }));
    } catch (err) {
      console.error("Failed to load stats:", err);
      if (mountedRef.current) {
        setError(err.message || "데이터 로딩 실패");
        setStats(cachedStats);
      }
      try {
        const regions = getRegions?.() || [];
        const members = getMembers?.() || [];
        const publicRegions = getPublicRegions?.() || [];
        const missions = getMissions?.() || [];
        const events = getEvents?.() || [];
        const shops = getShops?.() || [];
        const auditions = getAuditions?.() || [];
        const notices = getNotices?.() || [];
        const broadcasts = getBroadcasts?.() || [];

        let pointLedger = [];
        try {
          const ledgerData = await storageAdapter.getPointHistory('all', { limit: 100 });
          pointLedger = ledgerData?.transactions || ledgerData || [];
        } catch (e) {
          console.warn('[AdminDashboard] Fallback point ledger failed (sample):', e);
        }

        if (!mountedRef.current) return;
        setStats(buildDashboardStatsSnapshot({ regions, publicRegions, missions, events, shops, auditions, notices, broadcasts, members, pointLedger, voucherLogs: [] }));
      } catch (fallbackErr) {
        console.error("Fallback failed:", fallbackErr);
      }
    } finally {
      loadInFlightRef.current = false;
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [location.pathname, stats]);

  useEffect(() => {
    console.log('[ADMIN-HOME-EFFECT]', 'AdminDashboard:init', { pathname: location.pathname });
    if (initializedRef.current) return;
    initializedRef.current = true;
    mountedRef.current = true;
    loadStats({ initial: true, reason: 'mount' });

    const scheduleReload = (reason = 'ssot') => {
      console.log('[ADMIN-REFRESH-TRIGGER]', { reason, pathname: location.pathname });
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
      reloadTimerRef.current = setTimeout(() => {
        reloadTimerRef.current = null;
        loadStats({ initial: false, reason });
      }, 500);
    };

    const handleSSOT = () => scheduleReload('ssot');
    const handleStorage = (e) => {
      try {
        if (!e || e.key === null) {
          scheduleReload('storage-empty-key');
          return;
        }
        // su_ prefix 키만 처리
        if (e.key && e.key.startsWith('su_')) scheduleReload(`storage:${e.key}`);
      } catch (err) {
        console.error('[AdminDashboard] Storage event error:', err);
      }
    };

    window.addEventListener("su:ssot:changed", handleSSOT);
    window.addEventListener("storage", handleStorage);

    return () => {
      mountedRef.current = false;
      if (reloadTimerRef.current) {
        clearTimeout(reloadTimerRef.current);
        reloadTimerRef.current = null;
      }
      window.removeEventListener("su:ssot:changed", handleSSOT);
      window.removeEventListener("storage", handleStorage);
    };
  }, [loadStats, location.pathname]);

  const handleLogout = async () => {
    await adminLogout();
    navigate("/admin/login", { replace: true });
  };

  const pageStyle = {
    minHeight: "100%",
    background: "#0f0f14",
    padding: "20px 0 32px",
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    flexWrap: "wrap",
    gap: 12,
  };

  const titleStyle = {
    fontSize: 22,
    fontWeight: 800,
    color: "#ffffff",
  };

  const logoutBtnStyle = {
    padding: "8px 16px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "transparent",
    color: "#fff",
    fontSize: 13,
    cursor: "pointer",
  };

  const statsGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 12,
    marginBottom: 24,
  };

  const statCardStyle = (color) => ({
    background: "#18181b",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.08)",
    padding: 16,
    textAlign: "center",
    borderLeft: `4px solid ${color}`,
  });

  const statNumberStyle = {
    fontSize: 28,
    fontWeight: 800,
    marginBottom: 4,
  };

  const statLabelStyle = {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  };

  const menuGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 12,
  };

  const menuCardStyle = {
    position: "relative",
    background: "#18181b",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.08)",
    padding: 20,
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.2s",
  };

  const menuIconStyle = {
    fontSize: 32,
    marginBottom: 8,
  };

  const menuTitleStyle = {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 4,
  };

  const menuDescStyle = {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
  };

  const menus = [
    { icon: "📍", title: "지역 관리", desc: "공개 지역/지역 범위 설정", path: "/admin/regions", color: "#a855f7", statKey: "regions", statLabel: "공개" },
    { icon: "🎯", title: "미션/이벤트", desc: "미션·이벤트 등록/관리", path: "/admin/missions", color: "#3b82f6", statKey: "missions", statLabel: "활성" },
    { icon: "🛒", title: "상점 관리", desc: "상점 승인/관리", path: "/admin/stores", color: "#22c55e", statKey: "shops", statLabel: "승인" },
    { icon: "📰", title: "콘텐츠", desc: "공지사항·공유방송", path: "/admin/contents", color: "#ec4899", statKey: "notices", statLabel: "공개" },
    { icon: "🎤", title: "오디션", desc: "오디션 등록/관리", path: "/admin/auditions", color: "#f59e0b", statKey: "auditions", statLabel: "진행" },
    { icon: "👥", title: "회원 관리", desc: "회원 상태/권한 관리", path: "/admin/members", color: "#06b6d4", statKey: "users", statLabel: "활성" },
    { icon: "💎", title: "포인트 관리", desc: "포인트 지급/차감/원장", path: "/admin/points", color: "#eab308", statKey: "points", statLabel: "원장" },    { icon: "🎫", title: "상품권 관리", desc: "VIP 상품권 지급/기록", path: "/admin/vouchers", color: "#f472b6", statKey: "vouchers", statLabel: "지급" },    { icon: "📦", title: "보급지원담당자", desc: "보급지원 담당자 관리/바로가기", path: "/admin/supply-managers", color: "#ef4444", statKey: "supplyManagers", statLabel: "담당자" },
    { icon: "🎁", title: "보급지원 목록", desc: "요청/제안 관리", path: "/admin/supplies", color: "#f97316", statKey: "supplies", statLabel: "등록" },
    { icon: "🔧", title: "보급지원 도구", desc: "백업/복원/정리", path: "/admin/supply-tools", color: "#84cc16", statKey: null, statLabel: null },
  ];

  // ★ supply manager count for quick stat box (서버 기반)
  const [supplyManagerCount, setSupplyManagerCount] = useState(0);
  useEffect(() => {
    async function loadSupplyManagerCount() {
      try {
        const members = await storageAdapter.getMembers();
        setSupplyManagerCount((members || []).filter((u) => !!u.supplyManager).length);
      } catch (e) {
        console.warn('[AdminDashboard] Failed to load supply manager count:', e);
        setSupplyManagerCount(0);
      }
    }
    loadSupplyManagerCount();
  }, []);

  // ★ supply count for quick stat box (서버 기반)
  const [supplyCount, setSupplyCount] = useState(0);
  useEffect(() => {
    async function loadSupplyCount() {
      try {
        const supplies = await storageAdapter.getAllSupplies();
        setSupplyCount((supplies || []).length);
      } catch (e) {
        console.warn('[AdminDashboard] Failed to load supply count:', e);
        setSupplyCount(0);
      }
    }
    loadSupplyCount();
  }, []);

  // 통계값 가져오기 헬퍼
  const getStatValue = (menu) => {
    if (!menu.statKey) return null;
    if (!stats && menu.statKey !== "supplyManagers" && menu.statKey !== "supplies") return null;
    const stat = stats?.[menu.statKey];
    
    if (menu.statKey === "regions") return stat?.public || 0;
    if (menu.statKey === "missions") return stat?.active || 0;
    if (menu.statKey === "shops") return stat?.approved || 0;
    if (menu.statKey === "notices") return stat?.public || 0;
    if (menu.statKey === "auditions") return stat?.active || 0;
    if (menu.statKey === "users") return stat?.active || 0;
    if (menu.statKey === "points") return stat?.ledgerCount || 0;
    if (menu.statKey === "vouchers") return stat?.issued || 0;
    if (menu.statKey === "supplyManagers") return supplyManagerCount;
    if (menu.statKey === "supplies") return supplyCount;
    return null;
  };

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={titleStyle}>🏠 관리자 홈</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {refreshing ? <span style={{ fontSize: 12, opacity: 0.65 }}>업데이트 중...</span> : null}
          <button style={logoutBtnStyle} onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </div>

      {/* ★ 라이브 방송 버튼 (pv2 패턴) */}
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <button
          style={{
            padding: "12px 24px",
            borderRadius: 8,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 16,
            border: "none",
            cursor: "pointer",
          }}
          onClick={() => navigate("/admin/live-broadcast")}
        >
          📡 라이브 방송 시작
        </button>
      </div>

      {/* ★ 로딩 중 */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px 20px", fontSize: 14, opacity: 0.7 }}>
          ⏳ 통계 로딩 중...
        </div>
      )}

      {/* ★ 오류 발생 */}
      {error && !loading && (
        <div style={{ padding: "16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          ⚠️ 서버 오류: {error} (로컬 데이터 사용 중)
        </div>
      )}

      {/* Stats Overview - 7개 */}
      {!loading && stats && (
        <div style={statsGridStyle}>
          <div style={statCardStyle("#a855f7")}>
            <div style={statNumberStyle}>{stats.regions?.public || 0}</div>
            <div style={statLabelStyle}>공개 지역</div>
          </div>
          <div style={statCardStyle("#3b82f6")}>
            <div style={statNumberStyle}>{(stats.missions?.active || 0) + (stats.events?.active || 0)}</div>
            <div style={statLabelStyle}>미션/이벤트</div>
          </div>
          <div style={statCardStyle("#22c55e")}>
            <div style={statNumberStyle}>{stats.shops?.approved || 0}</div>
            <div style={statLabelStyle}>승인 상점</div>
          </div>
          <div style={statCardStyle("#ec4899")}>
            <div style={statNumberStyle}>{(stats.notices?.public || 0) + (stats.broadcasts?.public || 0)}</div>
            <div style={statLabelStyle}>콘텐츠</div>
          </div>
          <div style={statCardStyle("#f59e0b")}>
            <div style={statNumberStyle}>{stats.auditions?.active || 0}</div>
            <div style={statLabelStyle}>진행 오디션</div>
          </div>
          <div style={statCardStyle("#06b6d4")}>
            <div style={statNumberStyle}>{stats.users?.active || 0}</div>
            <div style={statLabelStyle}>활성 회원</div>
          </div>
          <div style={statCardStyle("#eab308")}>
            <div style={statNumberStyle}>{stats.points?.ledgerCount || 0}</div>
            <div style={statLabelStyle}>포인트 원장</div>
          </div>
          <div style={statCardStyle("#f472b6")}>
            <div style={statNumberStyle}>{stats.vouchers?.issued || 0}</div>
            <div style={statLabelStyle}>상품권 지급</div>
          </div>
          <div style={statCardStyle("#ef4444")}>
            <div style={statNumberStyle}>{supplyManagerCount}</div>
            <div style={statLabelStyle}>보급지원담당자</div>
          </div>
        </div>
      )}

      {/* Menu Grid - 7개 카드 */}
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>관리 메뉴</h3>
      <div style={menuGridStyle}>
        {menus.map((menu) => {
          const statValue = getStatValue(menu);
          return (
            <div
              key={menu.path}
              style={menuCardStyle}
              onClick={() => navigate(menu.path)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = menu.color;
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* 요약 뱃지 (우측 상단) */}
              {statValue !== null && (
                <div style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  background: menu.color,
                  color: "#fff",
                  padding: "2px 8px",
                  borderRadius: 10,
                  fontSize: 11,
                  fontWeight: 700,
                }}>
                  {statValue}
                </div>
              )}
              <div style={menuIconStyle}>{menu.icon}</div>
              <div style={menuTitleStyle}>{menu.title}</div>
              <div style={menuDescStyle}>{menu.desc}</div>
              <button
                style={{
                  marginTop: 12,
                  padding: "6px 14px",
                  borderRadius: 6,
                  border: "none",
                  background: `${menu.color}30`,
                  color: menu.color,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(menu.path);
                }}
              >
                바로가기 →
              </button>
            </div>
          );
        })}
      </div>

      {/* Quick Stats Detail */}
      {stats && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>상세 현황</h3>
          <div style={{ background: "#18181b", borderRadius: 12, padding: 16, fontSize: 13 }}>
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ opacity: 0.6 }}>🗺️ 전체 지역 / 공개</span>
                <span>{stats.regions?.total || 0} / {stats.regions?.public || 0}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ opacity: 0.6 }}>🎯 미션 (전체/활성)</span>
                <span>{stats.missions?.total || 0} / {stats.missions?.active || 0}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ opacity: 0.6 }}>🎉 이벤트 (전체/활성)</span>
                <span>{stats.events?.total || 0} / {stats.events?.active || 0}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ opacity: 0.6 }}>🏪 상점 (승인/대기)</span>
                <span>{stats.shops?.approved || 0} / {stats.shops?.pending || 0}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ opacity: 0.6 }}>📰 공지사항 (전체/공개)</span>
                <span>{stats.notices?.total || 0} / {stats.notices?.public || 0}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ opacity: 0.6 }}>📺 공유방송 (전체/공개)</span>
                <span>{stats.broadcasts?.total || 0} / {stats.broadcasts?.public || 0}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ opacity: 0.6 }}>🎤 오디션 (전체/진행)</span>
                <span>{stats.auditions?.total || 0} / {stats.auditions?.active || 0}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ opacity: 0.6 }}>👥 회원 (전체/활성)</span>
                <span>{stats.users?.total || 0} / {stats.users?.active || 0}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ opacity: 0.6 }}>💎 포인트 원장</span>
                <span>{stats.points?.ledgerCount || 0}건</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
