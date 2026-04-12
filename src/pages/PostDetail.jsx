import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import * as storageAdapter from "../lib/storageAdapter";
import ContextHeader from "../components/ContextHeader";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const returnTo = location.state?.returnTo || "/home";
  const boardType = location.state?.boardType || "news";

  useEffect(() => {
    loadPost();
  }, [id]);

  async function loadPost() {
    try {
      setLoading(true);
      setError(null);
      // API 호출: GET /api/posts/:id 또는 적절한 엔드포인트
      const data = await storageAdapter.getPostById(id);
      setPost(data);
    } catch (err) {
      console.error("[PostDetail] Failed to load post:", err);
      setError(err.message || "게시물을 불러올 수 없습니다.");
      setPost(null);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(timestamp) {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <div className="su-page" style={{ paddingBottom: 60 }}>
      <ContextHeader
        title={boardType === "notice" ? "공지사항" : "지역 소식"}
        onBack={() => navigate(returnTo)}
      />

      {/* 로딩 상태 */}
      {loading && (
        <div style={{ padding: 40, textAlign: "center", opacity: 0.7 }}>
          게시물을 불러오는 중...
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <div style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 18, marginBottom: 12 }}>⚠️</div>
          <div style={{ opacity: 0.8 }}>{error}</div>
          <button
            className="su-pill"
            style={{ marginTop: 20 }}
            onClick={() => navigate(returnTo)}
          >
            목록으로
          </button>
        </div>
      )}

      {/* 게시물 내용 */}
      {!loading && !error && post && (
        <div style={{ padding: "16px 12px" }}>
          {/* 제목 */}
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
            {post.title}
          </h1>

          {/* 메타 정보 */}
          <div
            style={{
              display: "flex",
              gap: 12,
              fontSize: 13,
              opacity: 0.7,
              marginBottom: 24,
              paddingBottom: 12,
              borderBottom: "1px solid #DDE3EA",
            }}
          >
            <span>작성일: {formatDate(post.createdAt)}</span>
            {post.author && <span>작성자: {post.author}</span>}
            {post.views !== undefined && <span>조회수: {post.views}</span>}
          </div>

          {/* 태그 */}
          {post.tags && (
            <div style={{ marginBottom: 16, display: "flex", gap: 6, flexWrap: "wrap" }}>
              {post.tags.split(",").map((tag, i) => {
                const t = tag.trim();
                if (!t) return null;
                return (
                  <span
                    key={i}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: "rgba(12,84,96,0.10)",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#0C5460",
                    }}
                  >
                    #{t}
                  </span>
                );
              })}
            </div>
          )}

          {/* 본문 */}
          <div
            style={{
              fontSize: 15,
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {post.content || post.body || "내용이 없습니다."}
          </div>

          {/* 이미지 */}
          {post.imageUrl && (
            <div style={{ marginTop: 20 }}>
              <img
                src={post.imageUrl}
                alt="게시물 이미지"
                style={{
                  width: "100%",
                  borderRadius: 12,
                  objectFit: "cover",
                }}
              />
            </div>
          )}

          {/* 하단 버튼 */}
          <div style={{ marginTop: 40, display: "flex", gap: 12 }}>
            <button
              className="su-pill"
              style={{ flex: 1, padding: "12px 0", fontSize: 15 }}
              onClick={() => navigate(returnTo)}
            >
              목록으로
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
