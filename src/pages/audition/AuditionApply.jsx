import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ContextHeader from "../../components/ContextHeader";
import { getCurrentUser } from "../../lib/authStore";

export default function AuditionApply() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 비로그인 차단
  useEffect(() => {
    const me = getCurrentUser();
    if (!me?.memberId) {
      navigate('/auth', { replace: true, state: { returnTo: `/audition/${id}` } });
    }
  }, [navigate, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const me = getCurrentUser();
    if (!me?.memberId) {
      navigate('/auth', { state: { returnTo: `/audition/${id}` } });
      return;
    }

    if (!name.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }

    const authorId = me.memberId;
    const API_BASE = import.meta.env.VITE_API_BASE || "";

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/auditions/${id}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          authorId,
          authorName: name.trim(),
          note: note.trim(),
          mediaType: "none",
          mediaUrl: "",
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `서버 오류 (${res.status})`);
      }

      navigate(`/audition/${id}`, { replace: true, state: { applied: true } });
    } catch (err) {
      console.error("[AuditionApply] submit error:", err);
      setError(err.message || "지원에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="su-page su-audition-apply">
      <ContextHeader title="오디션 지원" onBack={() => navigate(`/audition/${id}`)} />

      <section className="su-panel">
        <form onSubmit={handleSubmit} style={{ padding: 12 }}>
          {error && (
            <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <label>
              이름 <span style={{ color: "#ef4444" }}>*</span><br />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                disabled={submitting}
                style={{ marginTop: 4, width: "100%" }}
              />
            </label>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label>
              한마디<br />
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="자기소개나 어필 포인트를 입력하세요"
                rows={4}
                disabled={submitting}
                style={{ marginTop: 4, width: "100%", resize: "vertical" }}
              />
            </label>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button className="su-pill" type="submit" disabled={submitting}>
              {submitting ? "지원 중..." : "지원하기"}
            </button>
            <button
              className="su-pill"
              type="button"
              onClick={() => navigate(`/audition/${id}`)}
              disabled={submitting}
            >
              취소
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

