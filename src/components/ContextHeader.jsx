import React from "react";
import BackButton from "./BackButton";

/**
 * ContextHeader — 콘텐츠 중심 헤더 (상세페이지 / 글쓰기 / 채팅 등)
 *
 * 특징:
 *   - 가벼운 존재감: 콘텐츠가 주인공, 헤더는 보조
 *   - tone="neutral" (기본): 흰 배경, 진한 텍스트
 *   - tone="dark": 다크 그라디언트 배경 (채팅 등)
 *
 * Props:
 *   title       {string}           중앙 또는 좌측 타이틀
 *   onBack      {function}         뒤로가기 핸들러
 *   action      {object|ReactNode} 우측 영역 (옵션)
 *                                    { label, onClick } → 텍스트 버튼
 *                                    React element → 그대로 렌더
 *   tone        {"neutral"|"dark"} 배경 테마 (default "neutral")
 *   titleAlign  {"left"|"center"}  타이틀 정렬 (default "center")
 *   className   {string}
 *   style       {object}
 */
export default function ContextHeader({
  title,
  onBack,
  action,
  tone = "neutral",
  titleAlign = "center",
  className = "",
  style = {},
}) {
  const isDark = tone === "dark";

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    padding: "0 4px",
    height: 52,
    position: "sticky",
    top: 0,
    zIndex: 100,
    flexShrink: 0,
    ...(isDark
      ? {
          background: "linear-gradient(135deg, #0C5460 0%, #083D4A 55%, #052830 100%)",
        }
      : {
          background: "#FFFFFF",
          borderBottom: "1px solid var(--c-border, #DDE3EA)",
          boxShadow: "0 1px 0 var(--c-border, #DDE3EA)",
        }),
    ...style,
  };

  const titleStyle = {
    flex: 1,
    fontSize: 15,
    fontWeight: 700,
    color: isDark ? "#FFFFFF" : "var(--c-tx-h, #0F172A)",
    textAlign: titleAlign,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    padding: "0 4px",
  };

  const renderRight = () => {
    if (!action) return <div style={{ width: 44, flexShrink: 0 }} aria-hidden="true" />;
    if (typeof action === "object" && action !== null && "label" in action) {
      return (
        <button
          type="button"
          onClick={action.onClick}
          style={{
            background: "none",
            border: "none",
            fontSize: 13,
            fontWeight: 600,
            color: isDark ? "rgba(255,255,255,0.85)" : "var(--c-primary, #0C5460)",
            cursor: "pointer",
            padding: "8px 12px",
            borderRadius: 8,
            whiteSpace: "nowrap",
            minWidth: 44,
          }}
        >
          {action.label}
        </button>
      );
    }
    return action;
  };

  return (
    <header
      className={`su-contextHeader su-contextHeader--${tone}${className ? ` ${className}` : ""}`}
      style={headerStyle}
    >
      {onBack ? (
        <BackButton tone={isDark ? "dark" : "neutral"} onClick={onBack} />
      ) : (
        <div style={{ width: 44, flexShrink: 0 }} aria-hidden="true" />
      )}

      <div style={titleStyle}>{title}</div>

      {renderRight()}
    </header>
  );
}
