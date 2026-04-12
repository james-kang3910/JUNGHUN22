import { useEffect } from "react";

/**
 * 토스트 알림 컴포넌트
 */
export default function Toast({ open, message, type = "success", onClose, duration = 3000 }) {
  useEffect(() => {
    if (open && duration > 0) {
      const timer = setTimeout(() => onClose?.(), duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  if (!open) return null;

  const bgColors = {
    success: "#22c55e",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
  };

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  const style = {
    position: "fixed",
    top: 20,
    left: "50%",
    transform: "translateX(-50%)",
    background: bgColors[type] || bgColors.info,
    color: "#fff",
    padding: "12px 24px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 10,
    zIndex: 10000,
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    animation: "slideDown 0.3s ease",
  };

  return (
    <>
      <style>
        {`
          @keyframes slideDown {
            from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
          }
        `}
      </style>
      <div style={style} onClick={onClose}>
        <span>{icons[type]}</span>
        <span>{message}</span>
      </div>
    </>
  );
}
