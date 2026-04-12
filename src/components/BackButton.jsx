import React from "react";
import BackIcon from "./BackIcon";

/**
 * BackButton — 뒤로가기 인터랙션 컴포넌트
 *
 * Props:
 *   onClick   {function}              클릭 핸들러
 *   tone      {"light" | "dark"}      배경 컨텍스트
 *                                       light → teal 계열 (su-top 위)
 *                                       dark  → 반투명 흰색 (hero 위)
 *   size      {"sm" | "md" | "lg"}    아이콘 크기 토큰
 *   label     {string}                텍스트 라벨 (옵션, 기본 없음)
 *   ariaLabel {string}                접근성 레이블 (default "뒤로")
 *   style     {object}                추가 인라인 스타일
 *   className {string}                추가 클래스명
 */

const ICON_SIZE = { sm: 16, md: 20, lg: 24 };

const BASE = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
  minWidth: 44,
  minHeight: 44,
  padding: "0 8px",
  border: "none",
  borderRadius: 10,
  cursor: "pointer",
  background: "none",
  flexShrink: 0,
  WebkitTapHighlightColor: "transparent",
  transition: "background 0.15s",
};

const TONE_STYLE = {
  light: {
    color: "rgba(255,255,255,0.85)",
  },
  dark: {
    color: "rgba(255,255,255,0.85)",
  },
  neutral: {
    color: "var(--c-tx-h, #0F172A)",
  },
};

export default function BackButton({
  onClick,
  tone = "light",
  size = "md",
  label,
  ariaLabel = "뒤로",
  style = {},
  className = "",
}) {
  const iconSize = ICON_SIZE[size] ?? 20;
  const toneStyle = TONE_STYLE[tone] ?? TONE_STYLE.light;

  return (
    <button
      type="button"
      className={`su-backBtn su-backBtn--${tone}${className ? ` ${className}` : ""}`}
      onClick={onClick}
      aria-label={ariaLabel}
      style={{ ...BASE, ...toneStyle, ...style }}
    >
      <BackIcon size={iconSize} color="currentColor" />
      {label && (
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.01em" }}>
          {label}
        </span>
      )}
    </button>
  );
}
