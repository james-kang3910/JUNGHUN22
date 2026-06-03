import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCardBySlug, deleteCard } from "../lib/storageAdapter";
import { getSession } from "../lib/authStore";
import CardCreateModal from "../components/CardCreateModal";
import BusinessCardPreview from "../components/BusinessCardPreview";
import { downloadBusinessCardImage, readCardFieldsFromRecord } from "../lib/businessCardCore";
import QRCode from "qrcode";

export default function CardPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const myMemberId = session?.memberId;

  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");

  // 모달 상태
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = card && myMemberId && String(card.memberId) === String(myMemberId);

  const loadCard = async () => {
    try {
      setLoading(true);
      const data = await fetchCardBySlug(slug);
      if (!data || !data.cardSlug) {
        setNotFound(true);
      } else {
        setCard(data);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) loadCard();
  }, [slug]);

  // QR 생성
  useEffect(() => {
    if (!card) return;
    const url = `${window.location.origin}/card/${card.cardSlug}`;
    QRCode.toDataURL(url, { width: 200, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => {});
  }, [card]);

  const handleDelete = async () => {
    if (!card?.memberId) return;
    try {
      setDeleting(true);
      await deleteCard(card.memberId);
      navigate("/my", { replace: true });
    } catch (err) {
      alert("삭제 실패: " + err.message);
      setDeleting(false);
    }
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("복사되었습니다.");
    } catch {
      window.prompt("복사하세요:", text);
    }
  };

  // ─── 로딩/없음 상태 ───
  if (loading) {
    return (
      <div className="su-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ opacity: 0.5 }}>명함을 불러오는 중...</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="su-page" style={{ textAlign: "center", padding: "60px 24px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🃏</div>
        <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>명함을 찾을 수 없습니다</div>
        <div style={{ fontSize: 14, opacity: 0.6, marginBottom: 24 }}>
          /card/{slug} 주소에 등록된 명함이 없습니다.
        </div>
        <button type="button" className="su-primaryBtn" onClick={() => navigate("/my")}>
          마이페이지로 이동
        </button>
      </div>
    );
  }

  if (!card.cardPublic && !isOwner) {
    return (
      <div className="su-page" style={{ textAlign: "center", padding: "60px 24px" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>비공개 명함입니다</div>
        <div style={{ fontSize: 14, opacity: 0.6, marginBottom: 24 }}>이 명함은 비공개로 설정되어 있습니다.</div>
        <button type="button" className="su-primaryBtn" onClick={() => navigate("/")}>
          홈으로
        </button>
      </div>
    );
  }

  const cardUrl = `${window.location.origin}/card/${card.cardSlug}`;
  const cardVisual = readCardFieldsFromRecord(card, {});

  return (
    <div
      className="su-page"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
        paddingBottom: 100,
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px 0",
          position: "relative",
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            background: "rgba(255,255,255,0.12)",
            border: "none",
            borderRadius: 10,
            width: 38,
            height: 38,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            cursor: "pointer",
            color: "#fff",
          }}
        >
          ←
        </button>
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", fontSize: 15, fontWeight: 800, color: "rgba(255,255,255,0.85)" }}>
          명함
        </div>
        <button
          type="button"
          onClick={() => copyText(cardUrl)}
          style={{
            background: "rgba(255,255,255,0.12)",
            border: "none",
            borderRadius: 10,
            width: 38,
            height: 38,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            cursor: "pointer",
            color: "#fff",
          }}
          title="링크 복사"
        >
          🔗
        </button>
      </div>

      {/* 명함 미리보기 */}
      <div style={{ padding: "24px 20px 0" }}>
        <BusinessCardPreview form={cardVisual.form} themeKey={cardVisual.themeKey} />
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button
            type="button"
            onClick={() => downloadBusinessCardImage(cardVisual.form, cardVisual.themeKey, card.cardSlug)}
            style={{ flex: 1, minHeight: 44, borderRadius: 12, border: "none", background: "rgba(255,255,255,0.92)", color: "#0f766e", fontWeight: 800, fontSize: 13, cursor: "pointer" }}
          >
            PNG 저장
          </button>
          {isOwner ? (
            <button
              type="button"
              onClick={() => setShowEdit(true)}
              style={{ flex: 1, minHeight: 44, borderRadius: 12, border: "none", background: "linear-gradient(90deg,#0f766e,#14b8a6)", color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer" }}
            >
              수정
            </button>
          ) : null}
        </div>
      </div>

      {/* 추가 정보 */}
      <div style={{ padding: "20px 20px 0" }}>
        <div
          style={{
            background: "linear-gradient(145deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.05) 100%)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.20)",
            borderRadius: 24,
            padding: "24px 20px",
            color: "#fff",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>{cardVisual.form.name || card.name}</div>
          {card.bio && (
            <div
              style={{
                background: "rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "12px 14px",
                fontSize: 14,
                lineHeight: 1.6,
                opacity: 0.9,
                marginBottom: 16,
              }}
            >
              {card.bio}
            </div>
          )}

          {/* 연락처 */}
          <div
            style={{
              display: "grid",
              gap: 10,
              marginBottom: card.links?.length ? 16 : 0,
            }}
          >
            {card.phone && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  padding: "10px 14px",
                }}
              >
                <span style={{ fontSize: 14, opacity: 0.75, minWidth: 20 }}>📞</span>
                <span style={{ flex: 1, fontSize: 14 }}>{card.phone}</span>
                <button
                  type="button"
                  onClick={() => copyText(card.phone)}
                  style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#fff", cursor: "pointer" }}
                >
                  복사
                </button>
              </div>
            )}
            {card.email && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  padding: "10px 14px",
                }}
              >
                <span style={{ fontSize: 14, opacity: 0.75, minWidth: 20 }}>✉️</span>
                <span style={{ flex: 1, fontSize: 13, wordBreak: "break-all" }}>{card.email}</span>
                <button
                  type="button"
                  onClick={() => copyText(card.email)}
                  style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#fff", cursor: "pointer", flexShrink: 0 }}
                >
                  복사
                </button>
              </div>
            )}
          </div>

          {/* 커스텀 텍스트 항목 (카테고리명 : 값) */}
          {card.links && card.links.filter((l) => l.type === "custom").length > 0 && (
            <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.55, marginBottom: 2 }}>정보</div>
              {card.links.filter((l) => l.type === "custom").map((l, idx) => (
                <div
                  key={l.id || idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0,
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    padding: "10px 14px",
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, opacity: 0.65, minWidth: 80, flexShrink: 0 }}>
                    {l.category || "항목"}
                  </span>
                  <span style={{ fontSize: 12, opacity: 0.45, marginRight: 8 }}>:</span>
                  <span style={{ fontSize: 13, flex: 1 }}>{l.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* 링크 */}
          {card.links && card.links.filter((l) => l.type !== "custom").length > 0 && (
            <div style={{ display: "grid", gap: 8, marginBottom: 4 }}>
              <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.55, marginBottom: 2 }}>링크</div>
              {card.links.filter((l) => l.type !== "custom").map((l, idx) => (
                <a
                  key={l.id || idx}
                  href={l.value.startsWith("http") ? l.value : `https://${l.value}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    padding: "10px 14px",
                    color: "#fff",
                    textDecoration: "none",
                    transition: "background 0.15s",
                  }}
                >
                  <span style={{ fontSize: 13, opacity: 0.9, flex: 1 }}>🔗 {l.label}</span>
                  <span style={{ fontSize: 11, opacity: 0.6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>
                    {l.value}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* QR 카드 */}
        <div
          style={{
            background: "linear-gradient(145deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.16)",
            borderRadius: 20,
            padding: "20px 24px",
            marginTop: 16,
            color: "#fff",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 800, opacity: 0.65, marginBottom: 14 }}>QR 코드</div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div
              style={{
                width: 120,
                height: 120,
                background: "#fff",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR" style={{ width: 120, height: 120 }} />
              ) : (
                <div style={{ color: "#aaa", fontSize: 11 }}>생성 중...</div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 8, wordBreak: "break-all" }}>
                {cardUrl}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => copyText(cardUrl)}
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "none",
                    borderRadius: 8,
                    padding: "7px 14px",
                    fontSize: 12,
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  링크 복사
                </button>
                {qrDataUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      const a = document.createElement("a");
                      a.href = qrDataUrl;
                      a.download = `명함_QR_${card.name}.png`;
                      a.click();
                    }}
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      border: "none",
                      borderRadius: 8,
                      padding: "7px 14px",
                      fontSize: 12,
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    QR 저장
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 본인만 보이는 수정/삭제 버튼 */}
        {isOwner && (
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button
              type="button"
              onClick={() => setShowEdit(true)}
              style={{
                flex: 1,
                padding: "13px 0",
                borderRadius: 14,
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ✏️ 수정
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                flex: 1,
                padding: "13px 0",
                borderRadius: 14,
                background: "rgba(239,68,68,0.2)",
                border: "1px solid rgba(239,68,68,0.4)",
                color: "#fca5a5",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              🗑 삭제
            </button>
          </div>
        )}
      </div>

      {/* 수정 모달 */}
      {showEdit && (
        <CardCreateModal
          initialData={card}
          onClose={() => setShowEdit(false)}
          onSaved={(newSlug) => {
            setShowEdit(false);
            if (newSlug !== slug) navigate(`/card/${newSlug}`, { replace: true });
            else loadCard();
          }}
        />
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div
          onClick={() => setShowDeleteConfirm(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1400,
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "28px 24px",
              width: "100%",
              maxWidth: 360,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗑</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#0D1B21", marginBottom: 8 }}>
              명함을 삭제하시겠습니까?
            </div>
            <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>
              삭제하면 이 주소로 명함에 접근할 수 없습니다.
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  borderRadius: 12,
                  background: "#f3f4f6",
                  border: "none",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: "12px 0",
                  borderRadius: 12,
                  background: "#ef4444",
                  border: "none",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#fff",
                  cursor: "pointer",
                  opacity: deleting ? 0.6 : 1,
                }}
              >
                {deleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
