import React from "react";

/**
 * BackIcon — 순수 SVG chevron-left 아이콘
 *
 * Props:
 *   size   {number}  px 단위 크기 (default 20)
 *   color  {string}  CSS color (default "currentColor")
 */
export default function BackIcon({ size = 20, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
