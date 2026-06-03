import { useEffect } from "react";
import { createPortal } from "react-dom";

const TONES = {
  teal: {
    chipBg: "rgba(20, 184, 166, 0.12)",
    chipColor: "#0f766e",
    chipBorder: "rgba(20, 184, 166, 0.28)",
    buttonBg: "linear-gradient(135deg, #0f766e, #14b8a6)",
    glow: "rgba(20, 184, 166, 0.22)",
    chipLabel: "안내",
  },
  emerald: {
    chipBg: "rgba(16, 185, 129, 0.12)",
    chipColor: "#047857",
    chipBorder: "rgba(16, 185, 129, 0.24)",
    buttonBg: "linear-gradient(135deg, #047857, #10b981)",
    glow: "rgba(16, 185, 129, 0.2)",
    chipLabel: "완료",
  },
  rose: {
    chipBg: "rgba(244, 63, 94, 0.12)",
    chipColor: "#be123c",
    chipBorder: "rgba(244, 63, 94, 0.24)",
    buttonBg: "linear-gradient(135deg, #be123c, #f43f5e)",
    glow: "rgba(244, 63, 94, 0.18)",
    chipLabel: "오류",
  },
};

function normalizeLines(message) {
  return Array.isArray(message)
    ? message.filter(Boolean)
    : String(message || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
}

export default function SiteAlertModal({
  open,
  title = "안내",
  message = "",
  confirmText = "확인",
  tone = "teal",
  onClose,
}) {
  const palette = TONES[tone] || TONES.teal;
  const messageLines = normalizeLines(message);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

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
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="site-alert-title"
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
            {palette.chipLabel}
          </div>
          <div id="site-alert-title" style={{ marginTop: 10, fontSize: 22, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>
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
              <div
                key={`${line}-${index}`}
                style={{
                  fontSize: index === 0 ? 17 : 14,
                  fontWeight: index === 0 ? 800 : 600,
                  color: index === 0 ? "#0f172a" : "#475569",
                  lineHeight: 1.6,
                }}
              >
                {line}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: "100%",
              minHeight: 48,
              marginTop: 18,
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
    </div>,
    document.body
  );
}
