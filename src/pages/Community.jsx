import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSession, getAuthInfo, isLoggedIn } from "../lib/authStore";
import { buildRegionPath } from "../lib/regionRoutes";

export default function Community() {
  const navigate = useNavigate();

  useEffect(() => {
    const go = async () => {
      // 1. 로그인 시 → 본인 지역 (AUTH_STATE 우선, SESSION_STATE 보조)
      if (isLoggedIn()) {
        const auth = getAuthInfo?.();
        const session = getSession?.();
        const regionId =
          auth?.regionId || auth?.region_id ||
          session?.regionId || session?.region_id;

        if (regionId) {
          navigate(buildRegionPath(regionId, '/board'));
          return;
        }

        // regionId가 없으면 서버에서 회원 정보 재조회
        const memberId = auth?.memberId || auth?.member_id || session?.memberId;
        if (memberId) {
          try {
            const r = await fetch(`/api/members/${encodeURIComponent(memberId)}`);
            if (r.ok) {
              const j = await r.json();
              const m = j.member || j;
              const rid = m?.regionId || m?.region_id;
              if (rid) {
                navigate(buildRegionPath(rid, '/board'));
                return;
              }
            }
          } catch (_) {}
        }
      }

      // 2. 비로그인 or 지역 미지정 → 첫 번째 공개 지역
      try {
        const res = await fetch("/api/regions");
        if (res.ok) {
          const json = await res.json();
          const regions = json.data || json.regions || json || [];
          const first = Array.isArray(regions)
            ? regions.find((r) => r.isPublic || r.is_public) || regions[0]
            : null;
          if (first) {
            const rid = first.regionId || first.region_id;
            if (rid) {
              navigate(buildRegionPath(rid, '/board'), { replace: true });
              return;
            }
          }
        }
      } catch (_) {}

      // 3. 지역 없으면 지역 선택 페이지
      navigate("/region");
    };
    go();
  }, [navigate]);

  return (
    <div className="su-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ textAlign: "center", color: "var(--c-tx-s)", fontSize: 14 }}>
        <div style={{ fontSize: 28, marginBottom: 10 }}>💬</div>
        <div>커뮤니티로 이동 중...</div>
      </div>
    </div>
  );
}

