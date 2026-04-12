import React, { useEffect } from "react";

function parseYoutubeId(url) {
  if (!url) return null;
  try {
    const u = url.trim();
    const re = /(?:v=|\/)([0-9A-Za-z_-]{11})(?:[&?]|$)/;
    const m = u.match(re);
    if (m && m[1]) return m[1];
    // youtu.be short
    const r2 = /youtu\.be\/([0-9A-Za-z_-]{11})/;
    const m2 = u.match(r2);
    if (m2 && m2[1]) return m2[1];
  } catch (e) {
    return null;
  }
  return null;
}

export default function VideoLightbox({ open, onClose, video }) {
  useEffect(() => {
    if (open) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = orig || "";
      };
    }
    return undefined;
  }, [open]);

  if (!open || !video) return null;

  const { url, title } = video;
  const yt = parseYoutubeId(url);
  const isDirect = /\.(mp4|webm|ogg)(\?|$)/i.test(url);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200000,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 960,
          maxHeight: "90vh",
          borderRadius: 12,
          overflow: "hidden",
          background: "#000",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: 12, left: 16, color: "#fff", fontWeight: 700 }}>{title}</div>
        <button
          aria-label="닫기"
          onClick={onClose}
          style={{
            position: "absolute",
            right: 8,
            top: 8,
            zIndex: 2,
            background: "rgba(255,255,255,0.06)",
            color: "#fff",
            border: "none",
            padding: "8px 10px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          ✕
        </button>

        <div style={{ position: "relative", paddingTop: "56.25%", height: 0 }}>
          {yt ? (
            <iframe
              title={title || "video"}
              src={`https://www.youtube.com/embed/${yt}?rel=0&modestbranding=1&controls=1&autoplay=1`}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : isDirect ? (
            <video
              controls
              autoPlay
              src={url}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", background: "#000" }}
            />
          ) : (
            // If url is like a full embed url
            <iframe
              title={title || "video"}
              src={url}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      </div>
    </div>
  );
}
