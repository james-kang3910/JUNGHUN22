import { useState, useRef } from "react";
import { checkCardSlug, saveCard } from "../lib/storageAdapter";
import { getSession } from "../lib/authStore";
import { useNavigate } from "react-router-dom";

/**
 * 명함 생성/수정 모달
 * props:
 *   initialData — 기존 명함 데이터 (수정 모드)
 *   onClose     — 모달 닫기 콜백
 *   onSaved     — 저장 완료 후 콜백 (cardSlug 전달)
 */
export default function CardCreateModal({ initialData, onClose, onSaved }) {
  const navigate = useNavigate();
  const session = getSession();
  const memberId = session?.memberId;

  const isEdit = !!initialData?.cardSlug;

  // initialData.links에서 type:'custom' 필드 분리
  const initAllLinks = initialData?.links || [];
  const initLinks = initAllLinks.filter((l) => l.type !== "custom");
  const initCustomFields = initAllLinks
    .filter((l) => l.type === "custom")
    .map((l) => ({ id: l.id || Date.now() + Math.random(), category: l.category || "", value: l.value || "" }));

  const [form, setForm] = useState({
    cardSlug: initialData?.cardSlug || "",
    bio: initialData?.bio || "",
    cardPublic: initialData?.cardPublic !== false,
    links: initLinks,
  });

  const [slugStatus, setSlugStatus] = useState(
    isEdit ? { ok: true, msg: "현재 주소입니다." } : null
  );
  const [slugChecking, setSlugChecking] = useState(false);

  // 링크 상태
  const [newLink, setNewLink] = useState({ label: "", value: "" });
  const [showAddLink, setShowAddLink] = useState(false);

  // 커스텀 텍스트 박스 (카테고리명 : 값)
  const [customFields, setCustomFields] = useState(initCustomFields);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const debounceRef = useRef(null);

  // ── 슬러그 자동 포맷 (입력 중 실시간 포맷만, 중복체크는 버튼으로) ──
  const handleSlugChange = (val) => {
    const slug = val.toLowerCase().replace(/[^a-z0-9-_]/g, "");
    setForm((f) => ({ ...f, cardSlug: slug }));
    setSlugStatus(null);
    clearTimeout(debounceRef.current);
    // 수정 모드에서 원래 값으로 돌아오면 바로 ok 표시
    if (isEdit && slug === initialData.cardSlug) {
      setSlugStatus({ ok: true, msg: "현재 주소입니다." });
    }
  };

  // ── 슬러그 수동 중복 확인 버튼 ──
  const handleSlugCheck = async () => {
    const slug = form.cardSlug;
    if (!slug || slug.length < 2) {
      setSlugStatus({ ok: false, msg: "2자 이상 입력하세요." });
      return;
    }
    if (isEdit && slug === initialData.cardSlug) {
      setSlugStatus({ ok: true, msg: "현재 주소입니다." });
      return;
    }
    try {
      setSlugChecking(true);
      const result = await checkCardSlug(slug);
      setSlugStatus(result.available
        ? { ok: true, msg: "사용 가능한 주소입니다. ✓" }
        : { ok: false, msg: result.reason || "이미 사용 중인 주소입니다." }
      );
    } catch {
      setSlugStatus({ ok: false, msg: "확인 중 오류가 발생했습니다." });
    } finally {
      setSlugChecking(false);
    }
  };

  // ── 링크 ──
  const addLink = () => {
    if (!newLink.label.trim() || !newLink.value.trim()) return;
    setForm((f) => ({
      ...f,
      links: [...f.links, { id: Date.now(), label: newLink.label.trim(), value: newLink.value.trim() }],
    }));
    setNewLink({ label: "", value: "" });
    setShowAddLink(false);
  };
  const removeLink = (id) => setForm((f) => ({ ...f, links: f.links.filter((l) => l.id !== id) }));

  // ── 커스텀 텍스트 박스 ──
  const addCustomField = () =>
    setCustomFields((prev) => [...prev, { id: Date.now(), category: "", value: "" }]);
  const updateCustomField = (id, key, val) =>
    setCustomFields((prev) => prev.map((f) => (f.id === id ? { ...f, [key]: val } : f)));
  const removeCustomField = (id) =>
    setCustomFields((prev) => prev.filter((f) => f.id !== id));

  // ── 저장 ──
  const handleSubmit = async () => {
    setError("");
    if (!form.cardSlug || form.cardSlug.length < 2) {
      setError("명함 주소를 입력하세요.");
      return;
    }
    if (!slugStatus) {
      setError("명함 주소 중복 확인을 해주세요.");
      return;
    }
    if (!slugStatus.ok) {
      setError(slugStatus.msg || "주소를 다시 확인해주세요.");
      return;
    }
    if (!memberId) {
      setError("로그인이 필요합니다.");
      return;
    }

    // 링크 + 커스텀 필드 합치기
    const mergedLinks = [
      ...form.links,
      ...customFields
        .filter((f) => f.category.trim() || f.value.trim())
        .map((f) => ({ id: f.id, type: "custom", category: f.category.trim(), value: f.value.trim() })),
    ];

    try {
      setSaving(true);
      await saveCard(memberId, {
        cardSlug: form.cardSlug,
        bio: form.bio,
        cardPublic: form.cardPublic,
        links: mergedLinks,
      });
      if (onSaved) onSaved(form.cardSlug);
      else navigate(`/card/${form.cardSlug}`);
    } catch (err) {
      setError(err.message || "저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const inp = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 8,
    border: "1px solid var(--c-border, #DDE3EA)",
    background: "#fff",
    fontSize: 13,
    color: "var(--c-tx-h, #0D1B21)",
    outline: "none",
    boxSizing: "border-box",
  };

  const sectionLabel = {
    fontSize: 12,
    fontWeight: 700,
    opacity: 0.65,
    marginBottom: 8,
    display: "block",
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1300,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--c-surface, #fff)",
          borderRadius: 20,
          padding: "24px 20px",
          width: "100%",
          maxWidth: 460,
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        {/* 타이틀 */}
        <div style={{ fontSize: 17, fontWeight: 900, color: "var(--c-tx-h)", marginBottom: 20 }}>
          {isEdit ? "✏️ 명함 수정" : "💳 명함 만들기"}
        </div>

        {/* ─── 명함 주소 ─── */}
        <div style={{ marginBottom: 18 }}>
          <label style={sectionLabel}>
            명함 주소 <span style={{ fontWeight: 400, opacity: 0.7 }}>(영문 소문자·숫자·하이픈)</span>
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{
              flex: 1, display: "flex", alignItems: "center", gap: 6,
              background: "var(--c-subtle, #F5F7FA)", borderRadius: 8,
              padding: "8px 12px", border: "1px solid var(--c-border, #DDE3EA)", minWidth: 0,
            }}>
              <span style={{ fontSize: 11, opacity: 0.5, whiteSpace: "nowrap", flexShrink: 0 }}>/card/</span>
              <input
                placeholder="my-name"
                value={form.cardSlug}
                onChange={(e) => handleSlugChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSlugCheck()}
                style={{ ...inp, border: "none", background: "transparent", padding: 0, flex: 1, width: 0 }}
              />
            </div>
            <button
              type="button"
              onClick={handleSlugCheck}
              disabled={slugChecking || form.cardSlug.length < 2}
              style={{
                flexShrink: 0, padding: "0 14px", borderRadius: 8,
                border: "1.5px solid var(--c-primary, #0C5460)",
                background: "transparent", color: "var(--c-primary, #0C5460)",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                opacity: (slugChecking || form.cardSlug.length < 2) ? 0.5 : 1,
                whiteSpace: "nowrap",
              }}
            >
              {slugChecking ? "확인 중..." : "중복 확인"}
            </button>
          </div>
          {slugStatus && (
            <div style={{ marginTop: 5, fontSize: 12, fontWeight: 600, color: slugStatus.ok ? "#16a34a" : "#ef4444" }}>
              {slugStatus.ok ? "✓ " : "✗ "}{slugStatus.msg}
            </div>
          )}
        </div>

        {/* ─── 자기소개 ─── */}
        <div style={{ marginBottom: 18 }}>
          <label style={sectionLabel}>자기소개</label>
          <textarea
            placeholder="한 줄 소개를 입력하세요"
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            style={{ ...inp, minHeight: 70, resize: "vertical" }}
          />
        </div>

        {/* ─── 커스텀 텍스트 박스 ─── */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <label style={{ ...sectionLabel, marginBottom: 0 }}>
              텍스트 항목
              <span style={{ fontWeight: 400, opacity: 0.6, marginLeft: 4 }}>(카테고리명 : 값)</span>
            </label>
            <button
              type="button"
              onClick={addCustomField}
              style={{
                padding: "4px 12px", borderRadius: 6,
                border: "1.5px solid var(--c-primary, #0C5460)",
                background: "transparent", color: "var(--c-primary, #0C5460)",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}
            >
              + 텍스트 추가
            </button>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {customFields.length === 0 && (
              <div style={{
                padding: "12px 14px", borderRadius: 8,
                border: "1px dashed var(--c-border, #DDE3EA)",
                fontSize: 13, opacity: 0.5, textAlign: "center",
              }}>
                "+ 텍스트 추가"를 눌러 원하는 항목을 추가하세요
              </div>
            )}
            {customFields.map((field) => (
              <div
                key={field.id}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "var(--c-subtle, #F5F7FA)", borderRadius: 10,
                  padding: "10px 12px", border: "1px solid var(--c-border, #DDE3EA)",
                }}
              >
                <input
                  placeholder="카테고리명"
                  value={field.category}
                  onChange={(e) => updateCustomField(field.id, "category", e.target.value)}
                  style={{ ...inp, width: 0, flex: "0 0 38%", textAlign: "center", fontWeight: 600 }}
                />
                <span style={{ fontSize: 14, opacity: 0.45, flexShrink: 0, fontWeight: 700 }}>:</span>
                <input
                  placeholder="값"
                  value={field.value}
                  onChange={(e) => updateCustomField(field.id, "value", e.target.value)}
                  style={{ ...inp, flex: 1, width: 0 }}
                />
                <button
                  type="button"
                  onClick={() => removeCustomField(field.id)}
                  style={{
                    flexShrink: 0, width: 28, height: 28, borderRadius: 6,
                    border: "none", background: "rgba(239,68,68,0.12)",
                    color: "#ef4444", fontSize: 15, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ─── 링크 ─── */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <label style={{ ...sectionLabel, marginBottom: 0 }}>링크</label>
            <button
              type="button"
              onClick={() => setShowAddLink((v) => !v)}
              style={{
                padding: "4px 12px", borderRadius: 6,
                border: "1.5px solid var(--c-primary, #0C5460)",
                background: "transparent", color: "var(--c-primary, #0C5460)",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}
            >
              {showAddLink ? "취소" : "+ 추가"}
            </button>
          </div>

          {showAddLink && (
            <div style={{
              background: "var(--c-subtle, #F5F7FA)", borderRadius: 10,
              padding: 12, marginBottom: 10, border: "1px solid var(--c-border, #DDE3EA)",
            }}>
              <input
                placeholder="레이블 (예: 인스타그램)"
                value={newLink.label}
                onChange={(e) => setNewLink((l) => ({ ...l, label: e.target.value }))}
                style={{ ...inp, marginBottom: 8 }}
              />
              <input
                placeholder="URL 또는 아이디"
                value={newLink.value}
                onChange={(e) => setNewLink((l) => ({ ...l, value: e.target.value }))}
                style={{ ...inp, marginBottom: 8 }}
              />
              <button
                type="button"
                onClick={addLink}
                style={{
                  width: "100%", padding: "10px 0", borderRadius: 8,
                  border: "none", background: "var(--c-primary, #0C5460)",
                  color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}
              >
                추가
              </button>
            </div>
          )}

          <div style={{ display: "grid", gap: 8 }}>
            {form.links.map((l) => (
              <div
                key={l.id}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: "var(--c-subtle, #F5F7FA)", borderRadius: 8,
                  padding: "8px 12px", border: "1px solid var(--c-border, #DDE3EA)",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>🔗 {l.label}</div>
                  <div style={{ fontSize: 11, opacity: 0.65, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.value}</div>
                </div>
                <button
                  type="button"
                  onClick={() => removeLink(l.id)}
                  style={{
                    flexShrink: 0, width: 28, height: 28, borderRadius: 6,
                    border: "none", background: "rgba(239,68,68,0.12)",
                    color: "#ef4444", fontSize: 15, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
            {form.links.length === 0 && !showAddLink && (
              <div style={{ fontSize: 13, opacity: 0.5 }}>링크를 추가해보세요.</div>
            )}
          </div>
        </div>

        {/* ─── 공개 여부 ─── */}
        <div style={{ marginBottom: 20 }}>
          <label style={{
            display: "flex", alignItems: "center", gap: 10,
            fontSize: 13, cursor: "pointer",
            padding: "10px 12px",
            background: "var(--c-subtle, #F5F7FA)", borderRadius: 8,
            border: "1px solid var(--c-border, #DDE3EA)",
          }}>
            <input
              type="checkbox"
              checked={form.cardPublic}
              onChange={(e) => setForm((f) => ({ ...f, cardPublic: e.target.checked }))}
              style={{ width: 16, height: 16, cursor: "pointer" }}
            />
            <span>
              명함 공개 <span style={{ opacity: 0.6, fontSize: 12 }}>(링크를 아는 누구나 볼 수 있음)</span>
            </span>
          </label>
        </div>

        {error && (
          <div style={{
            marginBottom: 12, padding: "10px 14px",
            background: "#fef2f2", borderRadius: 8,
            fontSize: 13, color: "#ef4444", fontWeight: 600,
          }}>
            ⚠ {error}
          </div>
        )}

        {/* ─── 버튼 ─── */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            style={{
              flex: 1, padding: "13px 0", borderRadius: 12,
              border: "none", background: "var(--c-primary, #0C5460)",
              color: "#fff", fontSize: 15, fontWeight: 700,
              cursor: "pointer", opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "저장 중..." : isEdit ? "수정 완료" : "명함 생성"}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "13px 20px", borderRadius: 12,
              border: "1.5px solid var(--c-border, #DDE3EA)",
              background: "transparent", color: "var(--c-tx-s, #6b7280)",
              fontSize: 15, fontWeight: 700, cursor: "pointer",
            }}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

