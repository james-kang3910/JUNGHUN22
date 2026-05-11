import { useEffect } from "react";
import { createPortal } from "react-dom";

const TONES = {
  teal: {
    chipBg: "rgba(20, 184, 166, 0.12)",
    chipColor: "#0f766e",
    chipBorder: "rgba(20, 184, 166, 0.28)",
    buttonBg: "linear-gradient(135deg, #0f766e, #14b8a6)",
    glow: "rgba(20, 184, 166, 0.22)",
  },
  emerald: {
    chipBg: "rgba(16, 185, 129, 0.12)",
    chipColor: "#047857",
    chipBorder: "rgba(16, 185, 129, 0.24)",
    buttonBg: "linear-gradient(135deg, #047857, #10b981)",
    glow: "rgba(16, 185, 129, 0.2)",
  },
};

function normalizeLines(message, details) {
  const messageLines = Array.isArray(message)
    ? message.filter(Boolean)
    : String(message || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
  const detailLines = Array.isArray(details) ? details.filter(Boolean) : [];
  return { messageLines, detailLines };
}

export default function SiteConfirmModal({
  open,
  title = "확인",
  message = "진행하시겠습니까?",
  details = [],
  confirmText = "확인",
  cancelText = "취소",
  tone = "teal",
  onConfirm,
  onCancel,
}) {
  const palette = TONES[tone] || TONES.teal;
  const { messageLines, detailLines } = normalizeLines(message, details);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleEscape = (event) => {
      if (event.key === "Escape") onCancel?.();
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 20000,
        background: "rgba(15, 23, 42, 0.36)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="site-confirm-title"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "min(92vw, 420px)",
          borderRadius: 24,
          overflow: "hidden",
          background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(247,252,255,0.96))",
          border: "1px solid rgba(148, 163, 184, 0.18)",
          boxShadow: `0 30px 70px ${palette.glow}, 0 18px 40px rgba(15, 23, 42, 0.18)`,
        }}
      >
        <div
          style={{
            padding: "18px 20px 14px",
            background: "linear-gradient(135deg, rgba(240,253,250,0.95), rgba(236,253,245,0.92))",
            borderBottom: "1px solid rgba(148, 163, 184, 0.14)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              minHeight: 28,
              padding: "0 10px",
              borderRadius: 999,
              background: palette.chipBg,
              color: palette.chipColor,
              border: `1px solid ${palette.chipBorder}`,
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.02em",
            }}
          >
            확인 안내
          </div>
          <div id="site-confirm-title" style={{ marginTop: 10, fontSize: 22, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>
            {title}
          </div>
        </div>

        <div style={{ padding: 20 }}>
          <div
            style={{
              padding: "16px 16px 14px",
              borderRadius: 18,
              background: "linear-gradient(180deg, rgba(248,250,252,0.96), rgba(241,245,249,0.94))",
              border: "1px solid rgba(203, 213, 225, 0.8)",
            }}
          >
            {messageLines.map((line, index) => (
              <div key={`${line}-${index}`} style={{ fontSize: index === 0 ? 17 : 14, fontWeight: index === 0 ? 900 : 600, color: index === 0 ? "#0f172a" : "#475569", lineHeight: 1.6 }}>
                {line}
              </div>
            ))}
            {detailLines.length ? (
              <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                {detailLines.map((line, index) => (
                  <div
                    key={`${line}-${index}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 13,
                      color: "#64748b",
                      lineHeight: 1.5,
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: palette.chipColor, flexShrink: 0 }} />
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, marginTop: 18 }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                minHeight: 48,
                borderRadius: 16,
                border: "1px solid rgba(203, 213, 225, 0.9)",
                background: "rgba(255,255,255,0.94)",
                color: "#475569",
                fontWeight: 800,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              style={{
                minHeight: 48,
                borderRadius: 16,
                border: "1px solid rgba(13, 148, 136, 0.28)",
                background: palette.buttonBg,
                color: "#f8fffd",
                fontWeight: 900,
                fontSize: 15,
                cursor: "pointer",
                boxShadow: `0 12px 24px ${palette.glow}`,
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
