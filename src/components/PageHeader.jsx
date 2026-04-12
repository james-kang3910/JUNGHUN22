import React from "react";
import BackButton from "./BackButton";

/**
 * PageHeader — 공통 상단 헤더 컴포넌트
 *
 * Props:
 *   title      {string}          중앙 제목 텍스트
 *   onBack     {function}        뒤로가기 핸들러 (없으면 버튼 미표시)
 *   action     {object|ReactNode} 우측 영역:
 *                                  - { label, onClick } → su-pill 버튼으로 렌더
 *                                  - React element → 그대로 렌더
 *                                  - null/undefined → 빈 공간
 *   className  {string}          추가 클래스명
 *   style      {object}          추가 인라인 스타일
 *
 * CSS: .su-app .su-top 에서 teal gradient + 흰 텍스트로 스타일링됨
 */
export default function PageHeader({ title, onBack, action, className = "", style = {} }) {
  /* action이 일반 객체 { label, onClick } 인지, React element인지 구분 */
  const renderRight = () => {
    if (!action) return <div style={{ width: 40, flexShrink: 0 }} aria-hidden="true" />;
    if (typeof action === "object" && action !== null && "label" in action) {
      return (
        <button className="su-pill" type="button" onClick={action.onClick}>
          {action.label}
        </button>
      );
    }
    /* React element (혹은 기타 렌더러블) */
    return action;
  };

  return (
    <header className={`su-top${className ? ` ${className}` : ""}`} style={style}>
      {onBack ? (
        <BackButton tone="light" onClick={onBack} />
      ) : (
        /* 뒤로가기 없을 때 좌측 공간 확보 */
        <div style={{ width: 40, flexShrink: 0 }} aria-hidden="true" />
      )}

      <div className="su-topTitle">{title}</div>

      {renderRight()}
    </header>
  );
}
