import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import * as storageAdapter from "../lib/storageAdapter";
import { getDistricts } from "../lib/storageAdapter";
import { setViewerRegionId } from "../lib/viewerRegionStore";
import useAutoRefresh from "../hooks/useAutoRefresh";
import { buildRegionPath, getRegionSlug, navigateToRegion } from "../lib/regionRoutes";

const getProvinceLabel = (region) => String(region?.sido || region?.province || "").trim();
const getCityLabel = (region) => String(region?.sigungu || region?.city || region?.district || "").trim();

export default function RegionSelectPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleRegions, setVisibleRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvince, setSelectedProvince] = useState(null);

  const loadRegions = async (background = false) => {
    if (!background) setLoading(true);
    try {
      const all = await storageAdapter.getRegions();
      const publics = (all || []).filter((region) => region?.isPublic !== false);
      setVisibleRegions(publics);
    } catch (error) {
      console.error("[RegionSelectPage] 지역 데이터 로드 실패:", error);
      if (!background) setVisibleRegions([]);
    } finally {
      if (!background) setLoading(false);
    }
  };

  useEffect(() => {
    loadRegions();
  }, []);

  useAutoRefresh(() => loadRegions(true), { intervalMs: 120000 });

  useEffect(() => {
    if (visibleRegions.length === 1) {
      const rawId = visibleRegions[0].id;
      const regionId = rawId == null ? null : String(rawId).trim();
      if (!regionId || regionId === "undefined" || regionId === "null") return;
      setViewerRegionId(regionId);
      localStorage.setItem("selectedRegionId", regionId);
      navigateToRegion(navigate, regionId, '', { slug: getRegionSlug(visibleRegions[0]) });
    }
  }, [navigate, visibleRegions]);

  const provinceGroups = useMemo(() => {
    const buckets = new Map();

    visibleRegions.forEach((region) => {
      const province = getProvinceLabel(region);
      if (!province) return;
      if (!buckets.has(province)) buckets.set(province, []);
      buckets.get(province).push(region);
    });

    return Array.from(buckets.entries())
      .map(([province, regions]) => ({
        province,
        regions: [...regions].sort((left, right) => String(left.name || "").localeCompare(String(right.name || ""), "ko")),
      }))
      .sort((left, right) => left.province.localeCompare(right.province, "ko"));
  }, [visibleRegions]);

  const selectedProvinceRegions = useMemo(() => {
    if (!selectedProvince) return [];
    return provinceGroups.find((group) => group.province === selectedProvince)?.regions || [];
  }, [provinceGroups, selectedProvince]);

  const searchedRegions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return visibleRegions.filter((region) => String(region?.name || "").toLowerCase().includes(query));
  }, [searchQuery, visibleRegions]);

  const handleSelectRegion = async (regionId) => {
    const id = regionId == null ? null : String(regionId).trim();
    if (!id || id === "undefined" || id === "null") return;

    setViewerRegionId(id);

    try {
      localStorage.setItem("selectedRegionId", id);
    } catch (error) {
      // noop
    }

    try {
      const distList = await getDistricts(id);
      const active = (distList || []).filter((district) => district.isActive !== false);
      if (active.length > 0) {
        localStorage.setItem("selectedDistrictId", active[0].id);
      } else {
        localStorage.removeItem("selectedDistrictId");
      }
    } catch (error) {
      localStorage.removeItem("selectedDistrictId");
    }

    setSelectedProvince(null);
    const region = visibleRegions.find((r) => String(r.id || r.regionId || r.region_id) === id);
    navigateToRegion(navigate, id, '', { slug: region ? getRegionSlug(region) : id });
  };

  const handleGoogleSearch = () => {
    const query = String(searchQuery || "").trim();
    if (!query) return;
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const pageStyle = {
    padding: "8px 10px 88px",
    background:
      "radial-gradient(120% 60% at 50% -10%, rgba(42,149,165,0.20) 0%, rgba(42,149,165,0.03) 35%, rgba(240,244,248,1) 80%)",
    paddingBottom: 88,
  };

  const searchWrapStyle = {
    marginTop: 14,
    position: "relative",
    borderRadius: 999,
    border: "1px solid #dfe1e5",
    background: "#ffffff",
    boxShadow: "0 1px 6px rgba(32,33,36,0.18)",
    overflow: "hidden",
  };

  const googleSearchBtnStyle = {
    position: "absolute",
    right: 6,
    top: "50%",
    transform: "translateY(-50%)",
    minWidth: 86,
    padding: "0 12px",
    height: 38,
    borderRadius: 999,
    border: "1px solid rgba(15,118,110,0.22)",
    background: "linear-gradient(90deg, rgba(231,245,255,0.96), rgba(223,242,250,0.96))",
    color: "#155e75",
    fontSize: 12,
    fontWeight: 800,
    lineHeight: 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    cursor: "pointer",
  };

  const searchInputStyle = {
    width: "100%",
    padding: "12px 96px 12px 14px",
    borderRadius: 999,
    border: "none",
    background: "transparent",
    boxShadow: "none",
    color: "#202124",
    fontSize: 14,
    fontWeight: 500,
    outline: "none",
  };

  const provinceGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 11,
    marginTop: 14,
  };

  const sectionHeadStyle = {
    marginTop: 14,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  };

  const sectionTitleStyle = {
    fontSize: 13,
    fontWeight: 800,
    color: "#1e6573",
    letterSpacing: "0.02em",
  };

  const sectionMetaBadgeStyle = {
    fontSize: 11,
    fontWeight: 800,
    color: "#166674",
    borderRadius: 999,
    border: "1px solid rgba(35, 138, 156, 0.28)",
    background: "rgba(225, 247, 249, 0.95)",
    padding: "4px 10px",
  };

  const guideCardStyle = {
    marginTop: 16,
    padding: "18px 16px 16px",
    borderRadius: 22,
    border: "1px solid rgba(130, 197, 207, 0.28)",
    background: "linear-gradient(165deg, rgba(252,255,255,0.92), rgba(229,245,247,0.84))",
    boxShadow: "0 16px 34px rgba(33, 95, 110, 0.10), inset 0 1px 0 rgba(255,255,255,0.76)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  };

  const guideItemStyle = {
    display: "flex",
    gap: 8,
    alignItems: "flex-start",
    fontSize: 13,
    lineHeight: 1.55,
    color: "#527680",
  };

  const guideBulletStyle = {
    marginTop: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 800,
    color: "#0f6371",
    border: "1px solid rgba(33, 138, 154, 0.30)",
    background: "rgba(226, 248, 250, 0.96)",
    flexShrink: 0,
  };

  const provinceCardStyle = {
    minHeight: 104,
    padding: "14px 14px 13px",
    borderRadius: 18,
    border: "1px solid rgba(132, 197, 206, 0.28)",
    background: "linear-gradient(160deg, rgba(255,255,255,0.92), rgba(232,247,248,0.78))",
    boxShadow: "0 12px 24px rgba(27, 100, 115, 0.10), inset 0 1px 0 rgba(255,255,255,0.72)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    textAlign: "left",
    cursor: "pointer",
  };

  const searchResultsWrapStyle = {
    marginTop: 18,
    display: "grid",
    gap: 10,
  };

  const resultCardStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 16,
    border: "1px solid rgba(141, 206, 212, 0.24)",
    background: "rgba(255,255,255,0.88)",
    boxShadow: "0 10px 24px rgba(33, 95, 110, 0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    textAlign: "left",
    cursor: "pointer",
  };

  const modalOverlayStyle = {
    position: "fixed",
    inset: 0,
    zIndex: 10020,
    background: "rgba(9, 30, 35, 0.28)",
    padding: 16,
  };

  const modalStyle = {
    position: "fixed",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: "min(calc(100vw - 32px), 520px)",
    maxHeight: "min(70vh, calc(100vh - 180px))",
    overflowY: "auto",
    borderRadius: 24,
    border: "1px solid rgba(157, 217, 220, 0.30)",
    background: "linear-gradient(180deg, rgba(250,254,255,0.96), rgba(233,246,247,0.92))",
    boxShadow: "0 24px 60px rgba(20, 70, 83, 0.18), inset 0 1px 0 rgba(255,255,255,0.72)",
    padding: 18,
  };

  if (loading) {
    return (
      <div className="su-page" style={pageStyle}>
        <PageHeader title="지역 선택" onBack={() => navigate("/home")} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh" }}>
          <div style={{ fontSize: 14, opacity: 0.6 }}>지역 정보 로딩 중...</div>
        </div>
      </div>
    );
  }

  if (visibleRegions.length === 0) {
    return (
      <div className="su-page" style={pageStyle}>
        <PageHeader title="지역 선택" onBack={() => navigate("/home")} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "50vh",
            gap: 14,
            opacity: 0.62,
          }}
        >
          <div style={{ fontSize: 48 }}>📍</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>등록된 지역이 없습니다</div>
        </div>
      </div>
    );
  }

  if (visibleRegions.length === 1) {
    return (
      <div className="su-page" style={pageStyle}>
        <PageHeader title="지역 선택" onBack={() => navigate("/home")} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh" }}>
          <div style={{ fontSize: 14, opacity: 0.6 }}>이동 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="su-page su-page--region-select" style={pageStyle}>
      <PageHeader title="지역 선택" onBack={() => navigate("/home")} />

      <div style={searchWrapStyle}>
        <input
          type="text"
          placeholder="google 검색버튼으로 웹검색 검색바안에 이글자 안내문구로 만들어넣어  바안에 들자치면 없어지는거알지"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleGoogleSearch();
            }
          }}
          style={searchInputStyle}
        />
        <button
          type="button"
          aria-label="구글 검색"
          onClick={handleGoogleSearch}
          style={googleSearchBtnStyle}
        >
          <span aria-hidden="true">🔎</span>
          <span>Google 검색</span>
        </button>
      </div>
      

      <div style={sectionHeadStyle}>
        <div style={sectionTitleStyle}>등록된 광역시/도</div>
        <div style={sectionMetaBadgeStyle}>{provinceGroups.length}개 그룹</div>
      </div>

      <div style={provinceGridStyle}>
        {provinceGroups.map((group) => (
          <button
            key={group.province}
            type="button"
            style={provinceCardStyle}
            onClick={() => setSelectedProvince(group.province)}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#4e7d86", opacity: 0.88, letterSpacing: "0.05em" }}>등록 지역</div>
              <div style={{ fontSize: 13, color: "#3f7b86" }}>→</div>
            </div>
            <div style={{ fontSize: 19, fontWeight: 900, color: "#0e5a68", lineHeight: 1.22, letterSpacing: "-0.02em" }}>{group.province}</div>
            <div style={{ marginTop: 6, display: "inline-flex", alignItems: "center", width: "fit-content", borderRadius: 999, fontSize: 11, color: "#286874", fontWeight: 800, border: "1px solid rgba(48,139,154,0.25)", background: "rgba(235,249,250,0.96)", padding: "4px 10px" }}>
              {group.regions.length}개 지역
            </div>
          </button>
        ))}
      </div>

      <div style={guideCardStyle}>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#0f5f6d" }}>지역 선택 방법</div>
        <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
          <div style={guideItemStyle}><span style={guideBulletStyle}>1</span><span>상단의 등록된 광역시/도를 먼저 선택하세요.</span></div>
          <div style={guideItemStyle}><span style={guideBulletStyle}>2</span><span>선택한 광역시/도 안의 등록 지역이 팝업으로 표시됩니다.</span></div>
          <div style={guideItemStyle}><span style={guideBulletStyle}>3</span><span>원하는 지역을 누르면 해당 지역 포털로 바로 이동합니다.</span></div>
          <div style={guideItemStyle}><span style={guideBulletStyle}>4</span><span>지역이 보이지 않으면 검색창에서 직접 검색할 수 있습니다.</span></div>
        </div>
      </div>

      {searchQuery.trim() ? (
        <div style={searchResultsWrapStyle}>
          {searchedRegions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "28px 0", color: "#6f8790", fontSize: 13 }}>
              검색 결과가 없습니다
            </div>
          ) : (
            searchedRegions.map((region, index) => {
              const regionIdNorm =
                region.id ||
                region.regionId ||
                region.region_id ||
                `${getProvinceLabel(region).toLowerCase().replace(/\s+/g, "-")}-${(getCityLabel(region) || region.name || `region-${index}`).toLowerCase().replace(/\s+/g, "-")}`;

              return (
                <button
                  key={String(regionIdNorm)}
                  type="button"
                  style={resultCardStyle}
                  onClick={() => handleSelectRegion(regionIdNorm)}
                >
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#113741" }}>{region.name}</div>
                    <div style={{ marginTop: 4, fontSize: 12, color: "#6a848b" }}>
                      {[getProvinceLabel(region), getCityLabel(region)].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <div
                    style={{
                      flexShrink: 0,
                      padding: "6px 12px",
                      borderRadius: 999,
                      background: "rgba(21, 118, 135, 0.08)",
                      border: "1px solid rgba(21, 118, 135, 0.20)",
                      color: "#0d6170",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    선택
                  </div>
                </button>
              );
            })
          )}
        </div>
      ) : null}

      {selectedProvince ? (
        <div style={modalOverlayStyle} onClick={() => setSelectedProvince(null)}>
          <div style={modalStyle} onClick={(event) => event.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#6a8790" }}>광역시/도 선택</div>
                <div style={{ marginTop: 4, fontSize: 20, fontWeight: 800, color: "#0d5f6d" }}>{selectedProvince}</div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProvince(null)}
                style={{
                  border: "1px solid rgba(141, 206, 212, 0.30)",
                  background: "rgba(255,255,255,0.72)",
                  color: "#4f7d86",
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  cursor: "pointer",
                  fontSize: 18,
                  lineHeight: 1,
                }}
                aria-label="닫기"
              >
                ×
              </button>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {selectedProvinceRegions.map((region, index) => {
                const regionIdNorm =
                  region.id ||
                  region.regionId ||
                  region.region_id ||
                  `${getProvinceLabel(region).toLowerCase().replace(/\s+/g, "-")}-${(getCityLabel(region) || region.name || `region-${index}`).toLowerCase().replace(/\s+/g, "-")}`;

                return (
                  <button
                    key={String(regionIdNorm)}
                    type="button"
                    onClick={() => handleSelectRegion(regionIdNorm)}
                    style={{
                      ...resultCardStyle,
                      minHeight: 62,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#113741" }}>{region.name}</div>
                      {getCityLabel(region) ? (
                        <div style={{ marginTop: 4, fontSize: 12, color: "#6a848b" }}>{getCityLabel(region)}</div>
                      ) : null}
                    </div>
                    <div style={{ fontSize: 12, color: "#0d6170", fontWeight: 700 }}>이동</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
