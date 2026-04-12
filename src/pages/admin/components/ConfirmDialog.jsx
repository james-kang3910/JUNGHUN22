import { useEffect } from "react";

/**
 * 중앙 정렬 확인 팝업
 */
export default function ConfirmDialog({
  open,
  title = "확인",
  message,
  confirmText = "확인",
  cancelText = "취소",
  confirmColor = "#a855f7",
  onConfirm,
  onCancel,
  children, // 추가 옵션 UI
}) {
  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && open) onCancel?.();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onCancel]);

  if (!open) return null;

  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: 16,
  };

  const dialogStyle = {
    background: "#1e1e28",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.1)",
    padding: 24,
    maxWidth: 400,
    width: "100%",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
  };

  const titleStyle = {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 12,
  };

  const messageStyle = {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 1.6,
    marginBottom: 20,
  };

  const btnContainerStyle = {
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
  };

  const btnBase = {
    padding: "10px 20px",
    borderRadius: 8,
    border: "none",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  };

  return (
    <div style={overlayStyle} onClick={onCancel}>
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()}>
        <div style={titleStyle}>{title}</div>
        <div style={messageStyle}>{message}</div>
        {children && <div style={{ marginBottom: 20 }}>{children}</div>}
        <div style={btnContainerStyle}>
          <button
            style={{ ...btnBase, background: "rgba(255,255,255,0.1)", color: "#fff" }}
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            style={{ ...btnBase, background: confirmColor, color: "#fff" }}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
