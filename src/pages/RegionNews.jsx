/**
 * RegionNews — 지역 뉴스 목록/상세 페이지
 * 경로: /r/:regionId/news
 */
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import useAutoRefresh from "../hooks/useAutoRefresh";

const API_BASE = import.meta.env.VITE_API_BASE || "";

function fmtDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function NewsCard({ item, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        gap: 12,
        width: "100%",
        background: "var(--c-surface)",
        border: "1px solid var(--c-border)",
        borderRadius: "var(--r-card)",
        padding: "12px 14px",
        textAlign: "left",
        cursor: "pointer",
        transition: "box-shadow 0.15s",
      }}
    >
      {item.thumbnail && (
        <img
          src={item.thumbnail}
          alt=""
          style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 10, flexShrink: 0 }}
          loading="lazy"
        />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        {item.isPinned && (
          <span
            style={{
              display: "inline-block",
              fontSize: 11,
              fontWeight: 700,
              color: "var(--c-primary)",
              background: "var(--c-primary-soft)",
              borderRadius: 6,
              padding: "1px 6px",
              marginBottom: 4,
            }}
          >
            📌 고정
          </span>
        )}
        <div
          style={{
            fontWeight: 700,
            fontSize: 14,
            color: "var(--c-tx-h)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            marginBottom: 4,
          }}
        >
          {item.title}
        </div>
        <div style={{ fontSize: 12, color: "var(--c-tx-s)" }}>
          {item.authorName} · {fmtDate(item.createdAt)}
          {item.views > 0 && ` · 조회 ${item.views}`}
        </div>
      </div>
    </button>
  );
}

function NewsDetail({ item, onBack }) {
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          padding: "8px 0",
          cursor: "pointer",
          color: "var(--c-tx-s)",
          fontSize: 13,
          marginBottom: 8,
        }}
      >
        ← 목록으로
      </button>
      <div className="su-card">
        {item.thumbnail && (
          <img
            src={item.thumbnail}
            alt=""
            style={{ width: "100%", borderRadius: 10, marginBottom: 12, objectFit: "cover", maxHeight: 220 }}
            loading="lazy"
          />
        )}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
          {item.isPinned && (
            <span
              style={{
                flexShrink: 0,
                fontSize: 11,
                fontWeight: 700,
                color: "var(--c-primary)",
                background: "var(--c-primary-soft)",
                borderRadius: 6,
                padding: "2px 7px",
                marginTop: 2,
              }}
            >
              📌 고정
            </span>
          )}
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: "var(--c-tx-h)", lineHeight: 1.4 }}>
            {item.title}
          </h2>
        </div>
        <div style={{ fontSize: 12, color: "var(--c-tx-s)", marginBottom: 14 }}>
          {item.authorName} · {fmtDate(item.createdAt)} · 조회 {item.views}
        </div>
        <div
          style={{
            whiteSpace: "pre-wrap",
            fontSize: 14,
            lineHeight: 1.75,
            color: "var(--c-tx-h)",
          }}
        >
          {item.content || ""}
        </div>
      </div>
    </div>
  );
}

export default function RegionNews() {
  const { regionId } = useParams();
  const navigate = useNavigate();
  const outletCtx = useOutletContext() || {};
  const districtId = outletCtx.selectedDistrictId || null;

  const [news, setNews] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // 상세 보기 item

  const LIMIT = 20;

  const fetchNews = useCallback(
    async (p = 1, dc = districtId, background = false) => {
      if (!background) setLoading(true);
      try {
        const params = new URLSearchParams({ page: p, limit: LIMIT });
        if (dc) params.set("districtId", dc);
        const res = await fetch(
          `${API_BASE}/api/regions/${encodeURIComponent(regionId)}/news?${params}`
        );
        if (!res.ok) throw new Error(res.status);
        const data = await res.json();
        setNews(p === 1 ? data.news || [] : (prev) => [...prev, ...(data.news || [])]);
        setTotal(data.total || 0);
        setPage(p);
      } catch {
        /* ignore */
      } finally {
        if (!background) setLoading(false);
      }
    },
    [regionId, districtId]
  );

  useEffect(() => {
    setSelected(null);
    fetchNews(1, districtId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionId, districtId]);

  const refreshCurrentView = useCallback(async () => {
    await fetchNews(1, districtId, true);
    if (selected?.newsId) {
      try {
        const res = await fetch(
          `${API_BASE}/api/regions/${encodeURIComponent(regionId)}/news/${encodeURIComponent(selected.newsId)}`
        );
        if (res.ok) {
          const data = await res.json();
          setSelected(data.news || selected);
        }
      } catch (error) {}
    }
  }, [districtId, fetchNews, regionId, selected]);

  useAutoRefresh(refreshCurrentView, { enabled: !!regionId, intervalMs: 20000 });

  const handleSelect = async (item) => {
    // 조회수 증가 반영 포함
    try {
      const res = await fetch(
        `${API_BASE}/api/regions/${encodeURIComponent(regionId)}/news/${encodeURIComponent(item.newsId)}`
      );
      if (res.ok) {
        const d = await res.json();
        setSelected(d.news || item);
        return;
      }
    } catch {
      /* fallback */
    }
    setSelected(item);
  };

  const hasMore = news.length < total;

  // ── 상세 뷰 ──
  if (selected) {
    return (
      <div className="su-app" style={{ padding: "0 16px 80px" }}>
        <NewsDetail item={selected} onBack={() => setSelected(null)} />
      </div>
    );
  }

  // ── 목록 뷰 ──
  return (
    <div className="su-app" style={{ padding: "0 16px 80px" }}>
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "14px 0 4px" }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: "var(--c-tx-h)" }}>
          📰 지역 뉴스
        </h2>
      </div>

      {/* 목록 */}
      {loading && news.length === 0 ? (
        <div className="su-empty" style={{ marginTop: 32 }}>불러오는 중…</div>
      ) : news.length === 0 ? (
        <div className="su-empty" style={{ marginTop: 32 }}>
          이 지역의 뉴스가 없습니다.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
          {news.map((item) => (
            <NewsCard
              key={item.newsId}
              item={item}
              onClick={() => handleSelect(item)}
            />
          ))}
        </div>
      )}

      {/* 더보기 */}
      {hasMore && !loading && (
        <button
          type="button"
          className="su-secondaryBtn"
          style={{ width: "100%", marginTop: 14 }}
          onClick={() => fetchNews(page + 1)}
        >
          더보기 ({news.length}/{total})
        </button>
      )}
      {loading && news.length > 0 && (
        <div className="su-empty" style={{ padding: "16px 0" }}>불러오는 중…</div>
      )}
    </div>
  );
}
