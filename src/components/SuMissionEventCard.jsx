import React from "react";

/**
 * 미션/이벤트 카드 (참여 뱃지 없음, 첨부 이미지 스타일)
 * props:
 * - type: "mission" | "event"
 * - title: string
 * - date: string (YYYY-MM-DD or formatted)
 * - onDetail: () => void
 * - onParticipate: () => void
 * - disabled: boolean (참여 버튼 비활성화)
 * - highlight: boolean (선택/진행중 등 강조)
 */
export default function SuMissionEventCard({
  item,
  type = "mission",
  title = "",
  date = "",
  onDetail,
  onParticipate,
  disabled = false,
  highlight = false,
  statusLabel,
}) {
  const resolvedType = item?.type || item?.itemType || type;
  const resolvedTitle = item?.title || title;
  const resolvedDate = item?.date || [item?.startDate || item?.start_date, item?.endDate || item?.end_date].filter(Boolean).join(' ~ ') || date;
  const resolvedOnDetail = item?.onDetail || onDetail;
  const resolvedOnParticipate = item?.onParticipate || onParticipate;
  const participated = item ? true : false;
  const resolvedDisabled = item ? true : disabled;
  const resolvedEndDate = item?.endDate || item?.end_date || null;
  const resolvedStartDate = item?.startDate || item?.start_date || null;
  // endDate 기준으로 종료 판단 (endDate가 있을 때만)
  const isEnded = resolvedEndDate ? new Date(resolvedEndDate) < new Date(new Date().toDateString()) : false;
  const resolvedStatusLabel = statusLabel || item?.statusLabel || (isEnded ? '종료' : '진행중');
  // 색상/아이콘/스타일 분기
  const isEvent = resolvedType === "event";
  // 네온 포인트 컬러
  const neonColor = isEvent ? "#38bdf8" : "#facc15";
  const neonGlow = isEvent
    ? "0 0 12px 2px rgba(56,189,248,0.18)"
    : "0 0 12px 2px rgba(250,204,21,0.18)";
  const badgeColor = isEvent ? "#38bdf8" : "#facc15";
  const badgeBg = isEvent ? "#e0f2fe" : "#fef9c3";
  const cardBg = isEvent
    ? "linear-gradient(90deg,#e0f7fa 60%,#f0f9ff 100%)"
    : "linear-gradient(90deg,#fef9c3 60%,#f7fee7 100%)";
  const icon = isEvent ? "🎉 이벤트" : "🌱 미션";
  const statusBadgeBg = isEnded ? "#f1f5f9" : (isEvent ? "#a7f3d0" : "#d9f99d");
  const statusBadgeColor = isEnded ? "#94a3b8" : (isEvent ? "#0891b2" : "#65a30d");
  const detailBtnBorder = isEvent ? "1.5px solid #38bdf8" : "1.5px solid #facc15";
  const detailBtnColor = isEvent ? "#0891b2" : "#b45309";

  return (
    <div
      className="su-mission-card"
      style={{
        background: cardBg,
        borderRadius: 20,
        boxShadow: `0 2px 12px 0 rgba(16,30,54,0.07), ${neonGlow}`,
        padding: 24,
        marginBottom: 18,
        border: "none",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        position: "relative",
      }}
    >
      {/* 네온 포인트 라인 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 7,
          borderRadius: "18px 0 0 18px",
          background: neonColor,
          boxShadow: neonGlow,
          zIndex: 1,
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 10, zIndex: 2 }}>
        <span
          style={{
            fontWeight: 800,
            fontSize: 16,
            color: badgeColor,
            background: badgeBg,
            borderRadius: 8,
            padding: "2px 14px",
            letterSpacing: "-0.01em",
            boxShadow: isEvent
              ? "0 0 0 2px #e0f2fe"
              : "0 0 0 2px #fef9c3",
          }}
        >
          {icon}
        </span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: statusBadgeColor,
            background: statusBadgeBg,
            borderRadius: 8,
            padding: "2px 12px",
            marginLeft: 2,
            boxShadow: "0 1px 4px 0 rgba(0,0,0,0.03)",
          }}
        >
          {resolvedStatusLabel}
        </span>
      </div>
      <div style={{ fontWeight: 900, fontSize: 20, color: "#0f172a", margin: "10px 0 2px 10px", letterSpacing: "-0.5px", zIndex: 2 }}>{resolvedTitle}</div>
      <div style={{ fontSize: 14, color: "#64748b", margin: "0 0 10px 10px", zIndex: 2 }}>{resolvedDate}</div>
      <div style={{ display: "flex", gap: 12, marginLeft: 10, zIndex: 2 }}>
        <button
          type="button"
          onClick={resolvedOnDetail}
          style={{
            border: detailBtnBorder,
            background: "#fff",
            color: detailBtnColor,
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 15,
            padding: "7px 22px",
            cursor: "pointer",
            boxShadow: "0 1px 4px 0 rgba(56,189,248,0.04)",
            transition: "border-color 0.18s, color 0.18s",
          }}
        >
          상세
        </button>
        <button
          type="button"
          onClick={resolvedOnParticipate}
          disabled={resolvedDisabled}
          style={{
            border: "1.5px solid #22c55e",
            background: resolvedDisabled ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)" : "#fff",
            color: resolvedDisabled ? "#ffffff" : "#22c55e",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 15,
            padding: "7px 22px",
            cursor: resolvedDisabled ? "not-allowed" : "pointer",
            boxShadow: resolvedDisabled ? "0 10px 24px rgba(34,197,94,0.28)" : "0 1px 4px 0 rgba(34,197,94,0.04)",
            transition: "border-color 0.18s, color 0.18s",
            opacity: 1,
          }}
        >
          {participated ? '참여완료 · 잠김' : '참여'}
        </button>
      </div>
    </div>
  );
}
