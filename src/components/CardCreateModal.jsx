import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  checkCardSlug,
  fetchUserCard,
  saveCard,
  uploadContentImage,
} from "../lib/storageAdapter";
import { getCurrentUser, getSession } from "../lib/authStore";
import BusinessCardPreview, { BusinessCardThemePicker } from "./BusinessCardPreview";
import {
  buildCardForm,
  buildDefaultCardSlug,
  createCardPayload,
  downloadBusinessCardImage,
  normalizeCardSlugInput,
  readCardFieldsFromRecord,
  resolveSidePanelImageSrc,
  shareBusinessCardImage,
} from "../lib/businessCardCore";

const fieldStyle = {
  width: "100%",
  boxSizing: "border-box",
  minHeight: 44,
  borderRadius: 12,
  border: "1px solid var(--c-border, #DDE3EA)",
  background: "#fff",
  color: "var(--c-tx-h, #0D1B21)",
  padding: "0 12px",
  fontSize: 14,
  outline: "none",
};

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 800,
  color: "#52616b",
  marginBottom: 6,
};

export default function CardCreateModal({ initialData, onClose, onSaved }) {
  const navigate = useNavigate();
  const session = getSession();
  const currentUser = getCurrentUser();
  const memberId = String(session?.memberId || currentUser?.memberId || currentUser?.id || "").trim();
  const defaultName = String(currentUser?.name || "").trim();
  const defaultPhone = String(currentUser?.phone || "").trim();
  const defaultEmail = String(currentUser?.email || "").trim();

  const isEdit = !!initialData?.cardSlug;

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(buildCardForm(defaultName, defaultPhone, defaultEmail));
  const [themeKey, setThemeKey] = useState("teal");
  const [preservedLinks, setPreservedLinks] = useState([]);
  const [cardSlug, setCardSlug] = useState("");
  const [slugStatus, setSlugStatus] = useState(isEdit ? { ok: true, msg: "현재 주소입니다." } : null);
  const [slugChecking, setSlugChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [panelUploading, setPanelUploading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      setLoading(true);
      try {
        const source = initialData || (memberId ? await fetchUserCard(memberId).catch(() => null) : null);
        if (cancelled) return;
        const resolved = readCardFieldsFromRecord(source, { defaultName, defaultPhone, defaultEmail });
        setForm(resolved.form);
        setThemeKey(resolved.themeKey);
        setPreservedLinks(resolved.preservedLinks);
        const nextSlug = resolved.slug || normalizeCardSlugInput(buildDefaultCardSlug(defaultName || memberId));
        setCardSlug(nextSlug);
        if (resolved.slug) {
          setSlugStatus({ ok: true, msg: "현재 주소입니다." });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    hydrate();
    return () => {
      cancelled = true;
    };
  }, [initialData, memberId, defaultName, defaultPhone, defaultEmail]);

  const setFieldValue = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSlugChange = (value) => {
    const slug = normalizeCardSlugInput(value);
    setCardSlug(slug);
    setSlugStatus(null);
    if (isEdit && slug === initialData?.cardSlug) {
      setSlugStatus({ ok: true, msg: "현재 주소입니다." });
    }
  };

  const handleSlugCheck = async () => {
    const slug = normalizeCardSlugInput(cardSlug);
    if (!slug || slug.length < 2) {
      setSlugStatus({ ok: false, msg: "2자 이상 입력하세요." });
      return;
    }
    if (isEdit && slug === initialData?.cardSlug) {
      setSlugStatus({ ok: true, msg: "현재 주소입니다." });
      return;
    }
    try {
      setSlugChecking(true);
      const result = await checkCardSlug(slug);
      setSlugStatus(
        result.available
          ? { ok: true, msg: "사용 가능한 주소입니다." }
          : { ok: false, msg: result.reason || "이미 사용 중인 주소입니다." }
      );
    } catch {
      setSlugStatus({ ok: false, msg: "확인 중 오류가 발생했습니다." });
    } finally {
      setSlugChecking(false);
    }
  };

  const validateBeforeSave = () => {
    if (!String(form.name || "").trim()) {
      setError("이름을 입력해주세요.");
      return false;
    }
    const slug = normalizeCardSlugInput(cardSlug);
    if (!slug || slug.length < 2) {
      setError("명함 주소를 2자 이상 입력하세요.");
      return false;
    }
    if (!slugStatus?.ok) {
      setError("명함 주소 중복 확인을 해주세요.");
      return false;
    }
    if (!memberId) {
      setError("로그인이 필요합니다.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError("");
    if (!validateBeforeSave()) return;
    const slug = normalizeCardSlugInput(cardSlug);
    try {
      setSaving(true);
      await saveCard(memberId, createCardPayload(form, themeKey, preservedLinks, slug));
      window.dispatchEvent(new CustomEvent("su:ssot:changed", {
        detail: { type: "card", operation: "save", data: { cardSlug: slug, template: themeKey } },
      }));
      setToast("명함을 저장했습니다.");
      if (onSaved) onSaved(slug);
      else navigate(`/card/${slug}`);
    } catch (err) {
      setError(err.message || "저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!String(form.name || "").trim()) {
      setError("이름을 입력한 뒤 이미지를 저장할 수 있습니다.");
      return;
    }
    try {
      await downloadBusinessCardImage(form, themeKey, cardSlug);
      setToast("명함 이미지를 저장했습니다.");
    } catch {
      setError("이미지 저장에 실패했습니다.");
    }
  };

  const handleShare = async () => {
    if (!String(form.name || "").trim()) {
      setError("이름을 입력한 뒤 공유할 수 있습니다.");
      return;
    }
    try {
      setShareLoading(true);
      const result = await shareBusinessCardImage(form, themeKey, cardSlug);
      if (result === "shared") setToast("공유 창을 열었습니다.");
      else if (result === "copied") setToast("명함 정보를 복사했습니다.");
      else setToast("이 기기에서는 공유를 지원하지 않습니다.");
    } catch {
      setError("공유에 실패했습니다.");
    } finally {
      setShareLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.45)",
        backdropFilter: "blur(6px)",
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
          background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          borderRadius: 24,
          padding: "20px 18px",
          width: "100%",
          maxWidth: 720,
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 24px 64px rgba(15,23,42,0.22)",
          border: "1px solid rgba(148,163,184,0.18)",
        }}
      >
        {toast ? (
          <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 12, background: "rgba(15,118,110,0.1)", color: "#0f766e", fontSize: 13, fontWeight: 800, textAlign: "center" }}>
            {toast}
          </div>
        ) : null}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>
              {isEdit ? "명함 수정" : "명함 만들기"}
            </div>
            <div style={{ marginTop: 4, fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
              가로형 종이 명함 비율 · 10종 디자인 · 실시간 미리보기
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ width: 40, height: 40, borderRadius: 999, border: "1px solid rgba(15,23,42,0.08)", background: "#fff", color: "#64748b", fontSize: 22, cursor: "pointer", lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "48px 12px", textAlign: "center", color: "#64748b", fontSize: 14, fontWeight: 700 }}>
            명함 정보를 불러오는 중...
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#0f172a", marginBottom: 8 }}>미리보기</div>
              <BusinessCardPreview form={form} themeKey={themeKey} />
            </div>

            <div style={{ marginBottom: 16, padding: 14, borderRadius: 18, background: "#fff", border: "1px solid rgba(203,213,225,0.8)" }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#0f172a", marginBottom: 8 }}>디자인 선택</div>
              <BusinessCardThemePicker selectedThemeKey={themeKey} onSelect={setThemeKey} />
            </div>

            <div style={{ marginBottom: 16, padding: 14, borderRadius: 18, background: "#fff", border: "1px solid rgba(203,213,225,0.8)" }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#0f172a", marginBottom: 12 }}>정보 입력</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                <div>
                  <label style={labelStyle}>회사명</label>
                  <input value={form.companyName} onChange={(e) => setFieldValue("companyName", e.target.value)} style={fieldStyle} placeholder="(주)회사명" />
                </div>
                <div>
                  <label style={labelStyle}>직책</label>
                  <input value={form.jobTitle} onChange={(e) => setFieldValue("jobTitle", e.target.value)} style={fieldStyle} placeholder="대표이사" />
                </div>
                <div>
                  <label style={labelStyle}>이름 *</label>
                  <input value={form.name} onChange={(e) => setFieldValue("name", e.target.value)} style={fieldStyle} placeholder="홍길동" />
                </div>
                <div>
                  <label style={labelStyle}>전화</label>
                  <input value={form.phone} onChange={(e) => setFieldValue("phone", e.target.value)} style={fieldStyle} placeholder="02-0000-0000" />
                </div>
                <div>
                  <label style={labelStyle}>휴대폰</label>
                  <input value={form.mobile} onChange={(e) => setFieldValue("mobile", e.target.value)} style={fieldStyle} placeholder="010-0000-0000" />
                </div>
                <div>
                  <label style={labelStyle}>이메일</label>
                  <input value={form.email} onChange={(e) => setFieldValue("email", e.target.value)} style={fieldStyle} placeholder="name@company.com" />
                </div>
                <div>
                  <label style={labelStyle}>웹사이트</label>
                  <input value={form.website} onChange={(e) => setFieldValue("website", e.target.value)} style={fieldStyle} placeholder="https://example.com" />
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={labelStyle}>주소</label>
                <input value={form.address} onChange={(e) => setFieldValue("address", e.target.value)} style={fieldStyle} placeholder="서울시 강남구..." />
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={labelStyle}>한 줄 소개</label>
                <textarea
                  value={form.intro}
                  onChange={(e) => setFieldValue("intro", e.target.value)}
                  style={{ ...fieldStyle, minHeight: 72, padding: "10px 12px", resize: "vertical" }}
                  placeholder="간단한 소개 문구 (연락처와 중복되지 않게 작성)"
                />
              </div>
            </div>

            <div style={{ marginBottom: 16, padding: 14, borderRadius: 18, background: "#fff", border: "1px solid rgba(203,213,225,0.8)" }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#0f172a", marginBottom: 6 }}>우측 영역 (로고 · QR · 문구)</div>
              <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5, marginBottom: 12 }}>
                Royal Navy 등 우측 박스 디자인에 표시됩니다. 회사 정보와 중복되지 않는 로고·QR·슬로건만 넣어주세요.
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>우측 문구 (줄바꿈 가능)</label>
                <textarea
                  value={form.sidePanelText}
                  onChange={(e) => setFieldValue("sidePanelText", e.target.value)}
                  style={{ ...fieldStyle, minHeight: 72, padding: "10px 12px", resize: "vertical" }}
                  placeholder={"예)\nREAL TRADE\nSince 2020"}
                />
              </div>
              <div>
                <label style={labelStyle}>우측 이미지 (로고·QR)</label>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <label style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 44, padding: "0 14px", borderRadius: 12, border: "1.5px solid #0f766e", background: "#fff", color: "#0f766e", fontSize: 13, fontWeight: 800, cursor: panelUploading ? "wait" : "pointer", opacity: panelUploading ? 0.6 : 1 }}>
                    {panelUploading ? "업로드 중..." : "이미지 선택"}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      disabled={panelUploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (!file) return;
                        try {
                          setPanelUploading(true);
                          const result = await uploadContentImage(file, { context: "business-card-panel" });
                          const url = result.imageUrl || result.url || "";
                          if (url) setFieldValue("sidePanelImageUrl", url);
                        } catch (err) {
                          setError(err.message || "이미지 업로드에 실패했습니다.");
                        } finally {
                          setPanelUploading(false);
                        }
                      }}
                    />
                  </label>
                  {form.sidePanelImageUrl ? (
                    <>
                      <img
                        src={resolveSidePanelImageSrc(form.sidePanelImageUrl)}
                        alt="우측 패널 미리보기"
                        style={{ width: 56, height: 56, objectFit: "contain", borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc" }}
                      />
                      <button
                        type="button"
                        onClick={() => setFieldValue("sidePanelImageUrl", "")}
                        style={{ minHeight: 36, padding: "0 12px", borderRadius: 10, border: "1px solid #fecaca", background: "#fff5f5", color: "#dc2626", fontSize: 12, fontWeight: 800, cursor: "pointer" }}
                      >
                        이미지 제거
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 16, padding: 14, borderRadius: 18, background: "#fff", border: "1px solid rgba(203,213,225,0.8)" }}>
              <label style={labelStyle}>명함 주소 (영문·숫자·하이픈)</label>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, background: "#f8fafc", borderRadius: 12, padding: "0 12px", border: "1px solid #e2e8f0", minWidth: 0 }}>
                  <span style={{ fontSize: 11, opacity: 0.5, whiteSpace: "nowrap" }}>/card/</span>
                  <input
                    value={cardSlug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSlugCheck()}
                    style={{ ...fieldStyle, border: "none", background: "transparent", padding: 0, minHeight: 40, flex: 1, width: 0 }}
                    placeholder="my-name"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSlugCheck}
                  disabled={slugChecking || normalizeCardSlugInput(cardSlug).length < 2}
                  style={{
                    flexShrink: 0,
                    padding: "0 14px",
                    borderRadius: 12,
                    border: "1.5px solid #0f766e",
                    background: "#fff",
                    color: "#0f766e",
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                    opacity: slugChecking || normalizeCardSlugInput(cardSlug).length < 2 ? 0.5 : 1,
                  }}
                >
                  {slugChecking ? "확인 중..." : "중복 확인"}
                </button>
              </div>
              {slugStatus ? (
                <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: slugStatus.ok ? "#16a34a" : "#ef4444" }}>
                  {slugStatus.ok ? "✓ " : "✗ "}{slugStatus.msg}
                </div>
              ) : null}
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, fontSize: 13, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.cardPublic !== false}
                  onChange={(e) => setFieldValue("cardPublic", e.target.checked)}
                />
                명함 공개 (링크를 아는 사람이 볼 수 있음)
              </label>
            </div>

            {error ? (
              <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 12, background: "#fef2f2", color: "#ef4444", fontSize: 13, fontWeight: 700 }}>
                {error}
              </div>
            ) : null}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                style={{ minHeight: 48, borderRadius: 14, border: "none", background: "linear-gradient(90deg,#0f766e,#14b8a6)", color: "#fff", fontSize: 14, fontWeight: 900, cursor: saving ? "wait" : "pointer", opacity: saving ? 0.6 : 1 }}
              >
                {saving ? "저장 중..." : isEdit ? "수정 완료" : "명함 저장"}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                style={{ minHeight: 48, borderRadius: 14, border: "1px solid rgba(15,118,110,0.2)", background: "#fff", color: "#0f766e", fontSize: 14, fontWeight: 900, cursor: "pointer" }}
              >
                PNG 저장
              </button>
              <button
                type="button"
                onClick={handleShare}
                disabled={shareLoading}
                style={{ minHeight: 48, borderRadius: 14, border: "1px solid rgba(15,23,42,0.08)", background: "#fff", color: "#0f172a", fontSize: 14, fontWeight: 900, cursor: shareLoading ? "wait" : "pointer", opacity: shareLoading ? 0.6 : 1 }}
              >
                {shareLoading ? "공유 중..." : "공유"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
