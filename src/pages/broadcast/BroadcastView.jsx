import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import VideoEmbed from "../../components/VideoEmbed";
import * as storageAdapter from "../../lib/storageAdapter";
import { register, unregister } from "../../lib/ssotRegistry";
import { getCurrentUser } from "../../lib/authStore";

function parseYoutubeEmbed(urlOrId) {
  if (!urlOrId) return null;
  // if looks like just an id (no slash or ?), return as embed id
  try {
    // common formats:
    // https://www.youtube.com/watch?v=VIDEO
    // https://youtu.be/VIDEO
    // https://www.youtube.com/embed/VIDEO
    const u = new URL(urlOrId);
    const host = u.hostname.replace("www.", "");
    if (host.includes("youtube.com")) {
      if (u.pathname.startsWith("/watch")) {
        return u.searchParams.get("v");
      }
      if (u.pathname.startsWith("/embed/")) {
        return u.pathname.split("/embed/")[1];
      }
    }
    if (host.includes("youtu.be")) {
      return u.pathname.replace("/", "");
    }
  } catch (e) {
    // not a full URL, maybe it's an id already
    const maybeId = String(urlOrId).trim();
    if (/^[a-zA-Z0-9_-]{6,}$/.test(maybeId)) return maybeId;
    return null;
  }
  return null;
}

function makeEmbedUrl(id) {
  if (!id) return null;
  const params = new URLSearchParams({ rel: "0", modestbranding: "1", controls: "1" });
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "방금";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export default function BroadcastView() {
  const { id: rawId } = useParams();
  const id = rawId || "latest";
  const navigate = useNavigate();
  const location = useLocation();

  // state로 전달받은 direct video URL (Home에서 클릭 시)
  const stateVideoUrl = location.state?.videoUrl || null;
  const stateTitle = location.state?.title || null;

  // direct video 여부 판별
  const isDirectVideo = (url) => /\.(mp4|webm|ogg)(?:\?|$)/i.test(url || "");

  const [broadcast, setBroadcast] = useState(null);
  const [resolvedBroadcastId, setResolvedBroadcastId] = useState(null);
  const [loading, setLoading] = useState(false);

  const embedUrl = useMemo(() => {
    const url = broadcast?.videoUrl || broadcast?.mediaUrl || null;
    const videoId = parseYoutubeEmbed(url);
    return videoId ? makeEmbedUrl(videoId) : null;
  }, [broadcast]);

  // comments state
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const doLoad = async () => {
      setLoading(true);
      try {
        if (id === "latest") {
          const list = await storageAdapter.getAllBroadcasts({ publicOnly: true });
          const first = Array.isArray(list) ? list[0] : null;
          if (!cancelled) {
            setBroadcast(first || null);
            setResolvedBroadcastId(first?.id || null);
          }
        } else {
          const b = await storageAdapter.getBroadcastById(id);
          if (!cancelled) {
            setBroadcast(b || null);
            setResolvedBroadcastId(id);
          }
        }
      } catch (e) {
        console.error("[BroadcastView] Failed to load broadcast", e);
        if (!cancelled) {
          setBroadcast(null);
          setResolvedBroadcastId(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    doLoad();
    const listenerId = register(['broadcasts','su_broadcasts'], () => {
      try { doLoad(); } catch (e) { console.error('[BroadcastView] ssot reload failed', e); }
    });
    return () => { cancelled = true; unregister(listenerId); };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!resolvedBroadcastId) {
        setComments([]);
        return;
      }
      try {
        const list = await storageAdapter.getBroadcastComments(resolvedBroadcastId);
        if (!cancelled) setComments(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error("[BroadcastView] Failed to load comments", e);
        if (!cancelled) setComments([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resolvedBroadcastId]);

  const handleAdd = async (e) => {
    e && e.preventDefault();
    const t = String(text || "").trim();
    if (!t) return;
    if (!resolvedBroadcastId) return;
    const me = getCurrentUser();
    if (!me?.memberId) {
      navigate('/auth');
      return;
    }
    try {
      await storageAdapter.addBroadcastComment({
        broadcastId: resolvedBroadcastId,
        userId: String(me.memberId),
        userName: me.name || me.email || '익명',
        comment: t,
      });
      const list = await storageAdapter.getBroadcastComments(resolvedBroadcastId);
      setComments(Array.isArray(list) ? list : []);
      setText("");
      if (inputRef.current) inputRef.current.focus();
    } catch (e2) {
      console.error("[BroadcastView] Failed to add comment", e2);
      window.alert("댓글 저장에 실패했습니다.");
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleAdd();
    }
  };

  return (
    <div className="su-page su-broadcast-view">
      <div
        style={{
          position: "fixed",
          top: 6,
          right: 10,
          zIndex: 99999,
          fontSize: 12,
          fontWeight: 700,
          padding: "4px 8px",
          borderRadius: 6,
          background: "rgba(12,84,96,0.85)",
          color: "#FFFFFF"
        }}
      >
        ✅ BroadcastView NEW
      </div>
      <header className="su-panelHead">
        <h2 className="su-panelTitle">공유방송 상세</h2>
        <div>
          <button className="su-pill" type="button" onClick={() => navigate('/broadcast')}>
            ← 뒤로
          </button>
        </div>
      </header>

      <section className="su-panel" style={{ padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>{stateTitle || broadcast?.title || (loading ? "불러오는 중..." : `방송 #${id}`)}</h3>

        {/* Video area */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid #DDE3EA",
            boxShadow: "0 6px 18px rgba(12,84,96,0.13)",
            marginBottom: 12,
          }}
        >
          {/* ★ state로 전달받은 direct video 우선 처리 (fullscreen 지원) */}
          {stateVideoUrl && isDirectVideo(stateVideoUrl) ? (
            <div className="su-cardThumb">
              <VideoEmbed url={stateVideoUrl} mode="full" />
            </div>
          ) : embedUrl ? (
            <div style={{ position: "relative", paddingTop: "56.25%" }}>
              <iframe
                title={`broadcast-${id}`}
                src={embedUrl}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div style={{ padding: 24, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 180 }}>
              <div style={{ textAlign: "center", color: "#637074" }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>📺</div>
                <div style={{ fontSize: 16 }}>이 방송에는 재생 가능한 영상이 없습니다.</div>
                <div style={{ fontSize: 13, opacity: 0.8, marginTop: 6 }}>대체 이미지 또는 설명을 표시합니다.</div>
              </div>
            </div>
          )}
        </div>

        {/* Comments */}
        <div style={{ marginTop: 8 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              ref={inputRef}
              placeholder="댓글을 입력하세요... (Enter: 등록)"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKey}
              style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "1px solid #DDE3EA", background: "#F5F7FA", color: "#0D1B21" }}
            />
            <button className="su-pill" type="button" onClick={handleAdd} style={{ whiteSpace: "nowrap" }}>
              등록
            </button>
          </div>

          <div style={{ maxHeight: 320, overflowY: "auto", padding: 6, borderRadius: 8 }}>
            {comments.length === 0 ? (
              <div style={{ color: "#9BA8AE", padding: 12 }}>첫 댓글을 남겨보세요.</div>
            ) : (
              comments.map((c) => (
                <div key={c.id} style={{ padding: 10, marginBottom: 8, borderRadius: 8, background: "#F5F7FA", border: "1px solid #EEF1F5" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ fontSize: 13, color: "#0D1B21", fontWeight: 600 }}>{c.authorName || "익명"}</div>
                    <div style={{ fontSize: 12, color: "#9BA8AE" }}>{timeAgo(new Date(c.createdAt).getTime())}</div>
                  </div>
                  <div style={{ color: "#2C3E45", whiteSpace: "pre-wrap" }}>{c.text}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* spacer so bottom nav doesn't cover content */}
        <div style={{ height: 96 }} />
      </section>
    </div>
  );
}
