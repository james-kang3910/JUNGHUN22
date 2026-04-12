import { useMemo, useState } from "react";
import { normalizeImageList } from "./MultiImageUploader";
import { normalizeRegionId, normalizeRegionIds } from "../lib/viewerRegionStore";

const RAW_API_BASE = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || "";
const API_BASE = String(RAW_API_BASE || "").replace(/\/+$/, "").replace(/\/api$/, "");

const STATUS_META = {
  submitted: { label: "접수 완료", background: "rgba(59,130,246,0.14)", color: "#2563eb", border: "rgba(59,130,246,0.24)" },
  reviewing: { label: "검토중", background: "rgba(251,191,36,0.16)", color: "#b45309", border: "rgba(245,158,11,0.28)" },
  selected: { label: "선정", background: "rgba(16,185,129,0.14)", color: "#059669", border: "rgba(16,185,129,0.24)" },
  rejected: { label: "미선정", background: "rgba(239,68,68,0.14)", color: "#dc2626", border: "rgba(239,68,68,0.24)" },
  rewarded: { label: "보상 지급 완료", background: "rgba(139,92,246,0.14)", color: "#7c3aed", border: "rgba(139,92,246,0.24)" },
};

function getStatusMeta(status) {
  return STATUS_META[String(status || "submitted").trim().toLowerCase()] || STATUS_META.submitted;
}

function toPreviewUrl(url) {
  if (!url) return "";
  if (/^(https?:)?\/\//i.test(url) || url.startsWith("data:")) return url;
  return `${API_BASE}${url}`;
}

function formatDateTime(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("ko-KR");
  } catch (error) {
    return String(value);
  }
}

function getRewardSummary(participant) {
  if (!participant) return "";
  const rewardType = String(participant.rewardType || "").trim().toLowerCase();
  const rewardAmount = Number(participant.rewardAmount || 0);
  const rewardDescription = String(participant.rewardDescription || "").trim();
  if (rewardDescription) return rewardDescription;
  if (rewardType === "points" && rewardAmount > 0) return `${rewardAmount.toLocaleString("ko-KR")}P 지급`;
  if (rewardType === "vip") return `VIP 상품권 ${Math.max(rewardAmount, 1)}장`;
  if (rewardType === "voucher") return `보상 상품권 ${Math.max(rewardAmount, 1)}장`;
  if (rewardType === "other") return "기타 보상 지급";
  return "";
}

function getParticipantValue(participant, ...keys) {
  for (const key of keys) {
    if (participant?.[key] !== undefined && participant?.[key] !== null) {
      return participant[key];
    }
  }
  return null;
}

function getSubmissionText(participant) {
  return String(getParticipantValue(participant, "submissionText", "submission_text", "content", "description") || "").trim();
}

function getSubmissionLink(participant) {
  return String(getParticipantValue(participant, "submissionLink", "submission_link", "link", "url") || "").trim();
}

function getSubmissionImages(participant) {
  return normalizeImageList(getParticipantValue(participant, "submissionImages", "submission_images", "images") || []);
}

function getPreviewText(text, limit = 140) {
  const safeText = String(text || "").trim();
  if (safeText.length <= limit) return safeText;
  return `${safeText.slice(0, limit).trim()}...`;
}

function getShortLink(value, limit = 56) {
  const safeValue = String(value || "").trim();
  if (safeValue.length <= limit) return safeValue;
  return `${safeValue.slice(0, limit).trim()}...`;
}

function isCrossRegionParticipant(participant) {
  const value = participant?.crossRegion;
  return value === true || value === 1 || value === '1' || value === 'true';
}

export default function ParticipationReviewModal({
  open,
  item,
  itemType,
  participants,
  onClose,
  onSelectParticipant,
  onChangeStatus,
  onRewardParticipant,
}) {
  const [participantsFilter, setParticipantsFilter] = useState("all");
  const [rewardTarget, setRewardTarget] = useState(null);
  const [rewardForm, setRewardForm] = useState({ rewardType: "points", rewardAmount: 0, rewardDescription: "" });
  const [rewarding, setRewarding] = useState(false);
  const [expandedParticipantKey, setExpandedParticipantKey] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState("");

  const itemRegionIds = useMemo(() => normalizeRegionIds(item?.regionIds || []), [item?.regionIds]);
  const localParticipants = useMemo(() => (Array.isArray(participants) ? participants : []).filter((participant) => {
    if (isCrossRegionParticipant(participant)) return false;
    const memberRegionId = normalizeRegionId(participant?.memberRegionId || participant?.regionId || null);
    return !memberRegionId || itemRegionIds.length === 0 || itemRegionIds.includes(memberRegionId);
  }), [itemRegionIds, participants]);
  const externalParticipants = useMemo(() => (Array.isArray(participants) ? participants : []).filter((participant) => {
    if (isCrossRegionParticipant(participant)) return true;
    const memberRegionId = normalizeRegionId(participant?.memberRegionId || participant?.regionId || null);
    return !!memberRegionId && itemRegionIds.length > 0 && !itemRegionIds.includes(memberRegionId);
  }), [itemRegionIds, participants]);
  const displayParticipants = useMemo(() => {
    if (participantsFilter === "local") return localParticipants;
    if (participantsFilter === "external") return externalParticipants;
    return Array.isArray(participants) ? participants : [];
  }, [externalParticipants, localParticipants, participants, participantsFilter]);

  if (!open || !item) return null;

  const rewardButtonLabel = itemType === "event" ? "이벤트" : "미션";

  const openRewardEditor = (participant) => {
    const storedRewardType = String(item?.rewardType ?? item?.reward_type ?? "points").trim().toLowerCase();
    const storedPoints = Number(item?.points ?? item?.reward_points ?? 0);
    const defaultRewardAmount = storedRewardType === "points"
      ? Math.max(storedPoints, 0)
      : Math.max(storedPoints, 1);
    setRewardTarget(participant);
    setRewardForm({
      rewardType: storedRewardType || "points",
      rewardAmount: defaultRewardAmount,
      rewardDescription: "",
    });
  };

  const submitReward = async () => {
    if (!rewardTarget || rewarding) return;
    setRewarding(true);
    try {
      await onRewardParticipant?.(rewardTarget, rewardForm);
      setRewardTarget(null);
    } finally {
      setRewarding(false);
    }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(event) => event.stopPropagation()}>
        <div style={headerStyle}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{rewardButtonLabel} 참여 검토</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", marginTop: 4 }}>{item.title}</div>
          </div>
          <button type="button" onClick={onClose} style={closeButtonStyle}>×</button>
        </div>

        {externalParticipants.length > 0 ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "0 20px 10px" }}>
            {[["all", `전체 (${participants.length})`], ["local", `지역 회원 (${localParticipants.length})`], ["external", `타지역 (${externalParticipants.length})`]].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setParticipantsFilter(key)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.16)",
                  background: participantsFilter === key ? "rgba(15,118,110,0.34)" : "transparent",
                  color: participantsFilter === key ? "#ffffff" : "rgba(255,255,255,0.78)",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        ) : null}

        <div style={bodyStyle}>
          {displayParticipants.length === 0 ? (
            <div style={{ textAlign: "center", padding: 36, color: "rgba(255,255,255,0.68)" }}>참여자가 없습니다.</div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {displayParticipants.map((participant, index) => {
                const statusMeta = getStatusMeta(participant.status);
                const submissionText = getSubmissionText(participant);
                const submissionLink = getSubmissionLink(participant);
                const images = getSubmissionImages(participant);
                const rewardSummary = getRewardSummary(participant);
                const isRewarded = String(participant.status || "").trim().toLowerCase() === "rewarded";
                const isSelected = !!participant.selected || String(participant.status || "").trim().toLowerCase() === "selected" || isRewarded;
                const memberRegionId = participant.memberRegionId || participant.regionId || null;
                const isExternal = isCrossRegionParticipant(participant) || (normalizeRegionId(memberRegionId) && itemRegionIds.length > 0 && !itemRegionIds.includes(normalizeRegionId(memberRegionId)));
                const participantKey = `${participant.memberId || index}-${participant.itemKey || "participant"}`;
                const canExpand = submissionText.length > 140 || images.length > 0 || !!submissionLink;
                const isExpanded = expandedParticipantKey === participantKey;
                const hasSubmissionData = !!submissionText || !!submissionLink || images.length > 0;

                return (
                  <article key={participantKey} style={cardStyle}>
                    <div style={{ display: "grid", gap: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{participant.name || participant.memberId}</div>
                            {isExternal ? <span style={externalBadgeStyle}>타지역</span> : null}
                            <span style={{ ...statusBadgeStyle, background: statusMeta.background, color: statusMeta.color, borderColor: statusMeta.border }}>{statusMeta.label}</span>
                          </div>
                          <div style={{ display: "grid", gap: 4, marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.76)" }}>
                            <div>지역: {memberRegionId || "-"}</div>
                            <div>접수 시간: {formatDateTime(participant.joinedAt)}</div>
                            {participant.reviewedAt ? <div>검토 시간: {formatDateTime(participant.reviewedAt)}</div> : null}
                            {participant.rewardedAt ? <div>지급 시간: {formatDateTime(participant.rewardedAt)}</div> : null}
                          </div>
                        </div>

                        <div style={{ width: 200, maxWidth: "100%", display: "grid", gap: 8 }}>
                          {!isRewarded ? (
                            <>
                              {!isSelected ? (
                                <button type="button" onClick={() => onSelectParticipant?.(participant)} style={{ ...actionButtonStyle, background: "rgba(16,185,129,0.94)" }}>
                                  선정 처리
                                </button>
                              ) : null}
                              {participant.status !== "reviewing" && !isSelected ? (
                                <button type="button" onClick={() => onChangeStatus?.(participant, "reviewing")} style={{ ...actionButtonStyle, background: "rgba(245,158,11,0.94)" }}>
                                  검토중으로 변경
                                </button>
                              ) : null}
                              {participant.status !== "rejected" && !isSelected ? (
                                <button type="button" onClick={() => onChangeStatus?.(participant, "rejected")} style={{ ...actionButtonStyle, background: "rgba(239,68,68,0.94)" }}>
                                  미선정 처리
                                </button>
                              ) : null}
                              {participant.status !== "submitted" && !isSelected ? (
                                <button type="button" onClick={() => onChangeStatus?.(participant, "submitted")} style={{ ...actionButtonStyle, background: "rgba(71,85,105,0.94)" }}>
                                  접수 상태로 복귀
                                </button>
                              ) : null}
                              {isSelected ? (
                                <button type="button" onClick={() => openRewardEditor(participant)} style={{ ...actionButtonStyle, background: "linear-gradient(135deg,#0f766e,#0891b2)" }}>
                                  보상 지급
                                </button>
                              ) : null}
                            </>
                          ) : null}
                        </div>
                      </div>

                      <div style={submissionPanelStyle}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: "#e2e8f0" }}>제출물 확인</div>
                          {canExpand ? (
                            <button
                              type="button"
                              onClick={() => setExpandedParticipantKey((prev) => (prev === participantKey ? null : participantKey))}
                              style={expandButtonStyle}
                            >
                              {isExpanded ? "접기" : "제출 내용 보기"}
                            </button>
                          ) : null}
                        </div>

                        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
                          <div style={submissionBlockStyle}>
                            <div style={blockLabelStyle}>제출 내용</div>
                            <div style={blockBodyStyle}>
                              {submissionText ? (isExpanded ? submissionText : getPreviewText(submissionText)) : "내용 없음"}
                            </div>
                          </div>

                          <div style={submissionBlockStyle}>
                            <div style={blockLabelStyle}>제출 링크</div>
                            {submissionLink ? (
                              <a
                                href={submissionLink}
                                target="_blank"
                                rel="noreferrer"
                                title={submissionLink}
                                style={{ color: "#67e8f9", wordBreak: "break-all", fontSize: 12, textDecoration: "underline" }}
                              >
                                {isExpanded ? submissionLink : getShortLink(submissionLink)}
                              </a>
                            ) : (
                              <div style={emptyValueStyle}>링크 없음</div>
                            )}
                          </div>

                          <div style={submissionBlockStyle}>
                            <div style={blockLabelStyle}>제출 이미지</div>
                            {images.length > 0 ? (
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(92px, 1fr))", gap: 8 }}>
                                {images.map((imageUrl, imageIndex) => (
                                  <button
                                    key={`${participant.memberId}-${imageIndex}`}
                                    type="button"
                                    onClick={() => setPreviewImageUrl(toPreviewUrl(imageUrl))}
                                    style={thumbnailButtonStyle}
                                    title={`제출 이미지 ${imageIndex + 1}`}
                                  >
                                    <img src={toPreviewUrl(imageUrl)} alt={`제출 이미지 ${imageIndex + 1}`} style={{ width: "100%", height: 84, objectFit: "cover", display: "block" }} />
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div style={emptyValueStyle}>이미지 없음</div>
                            )}
                          </div>

                          {!hasSubmissionData ? (
                            <div style={missingDataNoticeStyle}>제출 데이터가 없습니다. 기존 참여 기록이거나 서버 재시작 전 데이터일 수 있습니다.</div>
                          ) : null}
                        </div>
                      </div>

                      {rewardSummary ? (
                        <div style={blockStyle}>
                          <div style={blockLabelStyle}>지급 보상</div>
                          <div style={blockBodyStyle}>{rewardSummary}</div>
                        </div>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div style={footerStyle}>
          <button type="button" onClick={onClose} style={secondaryButtonStyle}>닫기</button>
        </div>
      </div>

      {rewardTarget ? (
        <div style={overlayStyle} onClick={() => setRewardTarget(null)}>
          <div style={rewardModalStyle} onClick={(event) => event.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>보상 지급</div>
            <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>{rewardTarget.name || rewardTarget.memberId}</div>

            {/* 자동 보상 요약 표시 */}
            <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 12, background: rewardForm.rewardType === "vip" ? "rgba(234,179,8,0.1)" : "rgba(16,185,129,0.1)", border: `1px solid ${rewardForm.rewardType === "vip" ? "rgba(234,179,8,0.3)" : "rgba(16,185,129,0.3)"}` }}>
              <div style={{ fontSize: 13, color: "#475569", marginBottom: 6 }}>지급 보상</div>
              {rewardForm.rewardType === "vip" ? (
                <div style={{ fontSize: 20, fontWeight: 800, color: "#92400e" }}>
                  VIP 상품권 {Number(rewardForm.rewardAmount).toLocaleString("ko-KR")}원
                </div>
              ) : (
                <div style={{ fontSize: 20, fontWeight: 800, color: "#065f46" }}>
                  {Number(rewardForm.rewardAmount).toLocaleString("ko-KR")} 포인트
                </div>
              )}
            </div>

            {/* 메모(선택) */}
            <label style={{ ...fieldStyle, marginTop: 12 }}>
              <span style={{ fontSize: 12, color: "#64748b" }}>메모 (선택)</span>
              <textarea value={rewardForm.rewardDescription} onChange={(event) => setRewardForm((prev) => ({ ...prev, rewardDescription: event.target.value }))} rows={2} style={{ ...inputStyle, resize: "vertical", minHeight: 56 }} placeholder="특이사항 메모 (생략 가능)" />
            </label>

            <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
              <button type="button" onClick={() => setRewardTarget(null)} style={secondaryButtonStyle}>취소</button>
              <button type="button" onClick={submitReward} disabled={rewarding} style={{ ...primaryRewardButtonStyle, opacity: rewarding ? 0.6 : 1 }}>
                {rewarding ? "지급 중..." : "지급하기"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {previewImageUrl ? (
        <div style={overlayStyle} onClick={() => setPreviewImageUrl("")}>
          <div style={imagePreviewModalStyle} onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setPreviewImageUrl("")} style={imagePreviewCloseButtonStyle}>닫기</button>
            <img src={previewImageUrl} alt="제출 이미지 미리보기" style={{ width: "100%", maxHeight: "80vh", objectFit: "contain", display: "block", borderRadius: 16 }} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(2,6,23,0.66)",
  zIndex: 1600,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
};

const contentStyle = {
  width: "min(1080px, 100%)",
  maxHeight: "86vh",
  overflow: "hidden",
  borderRadius: 24,
  background: "linear-gradient(180deg, #0f172a 0%, #162235 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 24px 64px rgba(2,6,23,0.45)",
  display: "grid",
  gridTemplateRows: "auto auto 1fr auto",
};

const headerStyle = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
  padding: "22px 22px 16px",
};

const closeButtonStyle = {
  width: 38,
  height: 38,
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  fontSize: 18,
  cursor: "pointer",
};

const bodyStyle = {
  overflowY: "auto",
  padding: "0 22px 22px",
};

const footerStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 8,
  padding: "14px 22px 20px",
  borderTop: "1px solid rgba(255,255,255,0.08)",
};

const cardStyle = {
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.05)",
  padding: 16,
};

const blockStyle = {
  marginTop: 12,
  display: "grid",
  gap: 6,
};

const submissionPanelStyle = {
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(15,23,42,0.42)",
  padding: 14,
};

const submissionBlockStyle = {
  display: "grid",
  gap: 6,
};

const blockLabelStyle = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.02em",
  color: "rgba(255,255,255,0.52)",
  textTransform: "uppercase",
};

const blockBodyStyle = {
  fontSize: 13,
  lineHeight: 1.65,
  color: "rgba(255,255,255,0.92)",
  whiteSpace: "pre-wrap",
};

const statusBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 9px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 800,
  border: "1px solid transparent",
};

const externalBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "3px 7px",
  borderRadius: 999,
  background: "rgba(251,191,36,0.16)",
  color: "#fbbf24",
  fontSize: 11,
  fontWeight: 800,
};

const actionButtonStyle = {
  width: "100%",
  minHeight: 38,
  borderRadius: 12,
  border: "none",
  color: "#fff",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
  padding: "0 12px",
};

const expandButtonStyle = {
  minHeight: 32,
  borderRadius: 999,
  border: "1px solid rgba(103,232,249,0.22)",
  background: "rgba(8,145,178,0.16)",
  color: "#67e8f9",
  padding: "0 12px",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
};

const thumbnailButtonStyle = {
  display: "block",
  padding: 0,
  borderRadius: 10,
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "transparent",
  cursor: "pointer",
};

const emptyValueStyle = {
  fontSize: 12,
  color: "rgba(255,255,255,0.48)",
};

const missingDataNoticeStyle = {
  padding: "10px 12px",
  borderRadius: 12,
  background: "rgba(245,158,11,0.12)",
  border: "1px solid rgba(245,158,11,0.2)",
  color: "#fbbf24",
  fontSize: 12,
  lineHeight: 1.5,
};

const rewardModalStyle = {
  width: "min(420px, 100%)",
  borderRadius: 20,
  background: "#ffffff",
  padding: 20,
  boxShadow: "0 24px 54px rgba(15,23,42,0.28)",
};

const fieldStyle = {
  display: "grid",
  gap: 6,
  fontSize: 12,
  fontWeight: 700,
  color: "#334155",
};

const inputStyle = {
  width: "100%",
  minHeight: 42,
  borderRadius: 12,
  border: "1px solid #dbe2ea",
  padding: "0 12px",
  fontSize: 14,
  color: "#0f172a",
  background: "#ffffff",
  boxSizing: "border-box",
};

const secondaryButtonStyle = {
  minHeight: 42,
  borderRadius: 12,
  border: "1px solid #d6dde6",
  background: "#f8fafc",
  color: "#334155",
  padding: "0 16px",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
};

const primaryRewardButtonStyle = {
  minHeight: 42,
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg, #0f766e, #0891b2)",
  color: "#ffffff",
  padding: "0 16px",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
};

const imagePreviewModalStyle = {
  width: "min(960px, 100%)",
  maxHeight: "90vh",
  borderRadius: 24,
  background: "#020617",
  padding: 20,
  boxShadow: "0 24px 64px rgba(2,6,23,0.5)",
};

const imagePreviewCloseButtonStyle = {
  minHeight: 38,
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  padding: "0 14px",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
  marginBottom: 12,
};