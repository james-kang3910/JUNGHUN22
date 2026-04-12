import { useMemo, useState, useEffect, useRef } from "react";
import { getAuthInfo, isLoggedIn, getSession } from "../lib/authStore";
import { updateUserCard, getMemberById } from "../lib/storageAdapter";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import QRCode from "qrcode";

const CARD_DESIGN_PRESETS = [
  {
    id: "executive-gold",
    name: "Executive Gold",
    label: "금장 화이트",
    layout: "split",
    background: "linear-gradient(135deg, #fffdfa 0%, #f6f1e5 100%)",
    accent: "#b68a2f",
    text: "#1f2937",
    muted: "#6b7280",
    border: "1px solid rgba(182,138,47,0.28)",
    shadow: "0 18px 40px rgba(182,138,47,0.16)",
    foil: "linear-gradient(90deg, rgba(240,219,154,0.95) 0%, rgba(177,133,45,0.9) 45%, rgba(255,240,188,0.96) 100%)",
  },
  {
    id: "platinum-silver",
    name: "Platinum Silver",
    label: "은장 플래티넘",
    layout: "topbar",
    background: "linear-gradient(135deg, #ffffff 0%, #edf1f5 100%)",
    accent: "#8b97a6",
    text: "#111827",
    muted: "#64748b",
    border: "1px solid rgba(148,163,184,0.3)",
    shadow: "0 16px 34px rgba(100,116,139,0.14)",
    foil: "linear-gradient(90deg, rgba(248,250,252,0.96) 0%, rgba(168,179,194,0.9) 50%, rgba(255,255,255,0.95) 100%)",
  },
  {
    id: "navy-goldline",
    name: "Navy Goldline",
    label: "네이비 골드",
    layout: "band",
    background: "linear-gradient(135deg, #0f1c35 0%, #182b4d 100%)",
    accent: "#d6a847",
    text: "#f8fafc",
    muted: "rgba(226,232,240,0.74)",
    border: "1px solid rgba(214,168,71,0.28)",
    shadow: "0 22px 46px rgba(15,28,53,0.3)",
    foil: "linear-gradient(90deg, rgba(250,223,147,0.95) 0%, rgba(212,165,61,0.92) 50%, rgba(255,236,179,0.95) 100%)",
  },
  {
    id: "ivory-emboss",
    name: "Ivory Emboss",
    label: "아이보리 엠보스",
    layout: "corner",
    background: "linear-gradient(135deg, #fffefb 0%, #f7f4ed 100%)",
    accent: "#8c6b3f",
    text: "#2b241d",
    muted: "#7c6f63",
    border: "1px solid rgba(140,107,63,0.2)",
    shadow: "0 16px 34px rgba(140,107,63,0.12)",
    foil: "linear-gradient(90deg, rgba(255,245,209,0.96) 0%, rgba(182,146,94,0.9) 50%, rgba(254,241,194,0.96) 100%)",
  },
  {
    id: "graphite-silver",
    name: "Graphite Silver",
    label: "그래파이트 실버",
    layout: "stripe",
    background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
    accent: "#c0c7d1",
    text: "#f9fafb",
    muted: "rgba(226,232,240,0.7)",
    border: "1px solid rgba(192,199,209,0.2)",
    shadow: "0 24px 50px rgba(15,23,42,0.34)",
    foil: "linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(184,192,204,0.88) 55%, rgba(248,250,252,0.92) 100%)",
  },
  {
    id: "pearl-teal",
    name: "Pearl Teal",
    label: "펄 티얼",
    layout: "soft",
    background: "linear-gradient(135deg, #faffff 0%, #e9f8f7 100%)",
    accent: "#0e7490",
    text: "#0f172a",
    muted: "#5f7284",
    border: "1px solid rgba(14,116,144,0.2)",
    shadow: "0 18px 38px rgba(14,116,144,0.14)",
    foil: "linear-gradient(90deg, rgba(193,247,245,0.92) 0%, rgba(14,116,144,0.88) 52%, rgba(217,251,250,0.95) 100%)",
  },
  {
    id: "champagne-line",
    name: "Champagne Line",
    label: "샴페인 라인",
    layout: "bottomline",
    background: "linear-gradient(135deg, #fffef9 0%, #faf4e8 100%)",
    accent: "#c19352",
    text: "#292524",
    muted: "#78716c",
    border: "1px solid rgba(193,147,82,0.22)",
    shadow: "0 18px 36px rgba(193,147,82,0.14)",
    foil: "linear-gradient(90deg, rgba(255,239,199,0.96) 0%, rgba(190,147,78,0.9) 45%, rgba(255,243,209,0.96) 100%)",
  },
  {
    id: "royal-blue",
    name: "Royal Blue",
    label: "로열 블루",
    layout: "rightpanel",
    background: "linear-gradient(135deg, #163b7a 0%, #0f2857 100%)",
    accent: "#8fd3ff",
    text: "#eff6ff",
    muted: "rgba(219,234,254,0.72)",
    border: "1px solid rgba(143,211,255,0.22)",
    shadow: "0 22px 44px rgba(12,34,74,0.3)",
    foil: "linear-gradient(90deg, rgba(205,234,255,0.92) 0%, rgba(114,191,255,0.9) 50%, rgba(227,242,255,0.94) 100%)",
  },
  {
    id: "black-metal",
    name: "Black Metal",
    label: "블랙 메탈",
    layout: "minimal-dark",
    background: "linear-gradient(135deg, #111111 0%, #242424 100%)",
    accent: "#d4d4d8",
    text: "#fafafa",
    muted: "rgba(228,228,231,0.68)",
    border: "1px solid rgba(212,212,216,0.2)",
    shadow: "0 24px 48px rgba(0,0,0,0.34)",
    foil: "linear-gradient(90deg, rgba(252,252,252,0.9) 0%, rgba(184,184,189,0.86) 55%, rgba(255,255,255,0.9) 100%)",
  },
  {
    id: "soft-gray-grid",
    name: "Soft Gray Grid",
    label: "라이트 그레이",
    layout: "grid",
    background: "linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)",
    accent: "#6b7280",
    text: "#111827",
    muted: "#6b7280",
    border: "1px solid rgba(107,114,128,0.2)",
    shadow: "0 16px 34px rgba(107,114,128,0.12)",
    foil: "linear-gradient(90deg, rgba(255,255,255,0.92) 0%, rgba(182,186,193,0.9) 50%, rgba(255,255,255,0.95) 100%)",
  },
];

function getBusinessCardFields(profile, links, memberId) {
  const primaryWebsite = Array.isArray(links)
    ? links.find((item) => /^https?:\/\//i.test(String(item?.value || "")))?.value || ""
    : "";
  return {
    company: "SMI SHARE UNITY",
    title: profile?.role || "Regional Platform Lead",
    name: profile?.name || "회원",
    officePhone: profile?.phone || "02-0000-0000",
    mobilePhone: profile?.phone || "010-0000-0000",
    website: primaryWebsite || `${window.location.origin}/cards/${memberId || "sample"}`,
    bio: profile?.bio || "지역을 연결하고, 상권과 커뮤니티의 흐름을 설계합니다.",
  };
}

function BusinessCardPreview({ preset, fields, compact = false }) {
  const isDark = /^linear-gradient\(135deg, #(0|1|2)/.test(preset.background) || preset.id.includes("dark") || preset.id.includes("navy") || preset.id.includes("black") || preset.id.includes("royal");
  const wrapperStyle = {
    position: "relative",
    overflow: "hidden",
    borderRadius: compact ? 22 : 28,
    border: preset.border,
    background: preset.background,
    boxShadow: preset.shadow,
    minHeight: compact ? 190 : 238,
    padding: compact ? "18px 18px 16px" : "24px 24px 22px",
    color: preset.text,
  };

  const accentBarStyle = {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: preset.layout === "stripe" ? 12 : 8,
    background: preset.foil,
    opacity: preset.layout === "stripe" ? 1 : 0.92,
  };

  const topBandStyle = {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    height: 12,
    background: preset.foil,
    opacity: 0.88,
  };

  const bottomLineStyle = {
    position: "absolute",
    left: 22,
    right: 22,
    bottom: 16,
    height: 3,
    borderRadius: 999,
    background: preset.foil,
  };

  const rightPanelStyle = {
    position: "absolute",
    top: 0,
    right: 0,
    width: "34%",
    bottom: 0,
    background: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.56)",
    borderLeft: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.08)"}`,
  };

  const infoLines = [
    `대표 ${fields.officePhone}`,
    `모바일 ${fields.mobilePhone}`,
    fields.website,
  ];

  return (
    <div style={wrapperStyle}>
      {preset.layout === "stripe" ? <div style={accentBarStyle} /> : null}
      {preset.layout === "topbar" ? <div style={topBandStyle} /> : null}
      {preset.layout === "bottomline" ? <div style={bottomLineStyle} /> : null}
      {preset.layout === "rightpanel" ? <div style={rightPanelStyle} /> : null}
      {preset.layout === "corner" ? (
        <div style={{ position: "absolute", right: -30, top: -30, width: 140, height: 140, borderRadius: 999, background: preset.foil, opacity: 0.14 }} />
      ) : null}
      {preset.layout === "grid" ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "linear-gradient(rgba(148,163,184,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.10) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            opacity: 0.5,
          }}
        />
      ) : null}
      {preset.layout === "soft" ? (
        <>
          <div style={{ position: "absolute", top: -20, right: -10, width: 120, height: 120, borderRadius: 999, background: "rgba(14,116,144,0.08)" }} />
          <div style={{ position: "absolute", bottom: -16, left: 80, width: 140, height: 80, borderRadius: 999, background: "rgba(14,116,144,0.06)" }} />
        </>
      ) : null}
      <div style={{ position: "relative", zIndex: 1, display: "grid", gap: compact ? 14 : 18, height: "100%" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
          <div>
            <div style={{ fontSize: compact ? 11 : 12, fontWeight: 800, letterSpacing: "0.18em", color: preset.accent }}>{fields.company}</div>
            <div style={{ marginTop: 7, fontSize: compact ? 14 : 15, fontWeight: 700, color: preset.muted }}>{fields.title}</div>
          </div>
          <div style={{ minWidth: compact ? 52 : 60, textAlign: "right" }}>
            <div style={{ display: "inline-flex", padding: compact ? "5px 8px" : "6px 10px", borderRadius: 999, background: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.64)", border: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "rgba(15,23,42,0.08)"}`, fontSize: compact ? 10 : 11, fontWeight: 800, color: preset.accent }}>
              {preset.label}
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: compact ? 26 : 32, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1 }}>{fields.name}</div>
          <div style={{ marginTop: 8, maxWidth: "76%", fontSize: compact ? 11 : 12, lineHeight: 1.6, color: preset.muted }}>{fields.bio}</div>
        </div>

        <div style={{ marginTop: "auto", display: "grid", gridTemplateColumns: compact ? "1fr" : "1fr 1fr", gap: compact ? 6 : 8 }}>
          {infoLines.map((line) => (
            <div key={line} style={{ fontSize: compact ? 11 : 12, fontWeight: 600, color: isDark ? "rgba(248,250,252,0.88)" : "#334155", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MyCard() {
  const navigate = useNavigate();
  
  // ★ 비로그인 시 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/auth", { replace: true, state: { returnTo: "/my/card" } });
    }
  }, [navigate]);

  // 로그인 체크 중 렌더링 방지
  if (!isLoggedIn()) {
    return null;
  }

  const goHome = () => navigate("/home");
  const goBack = () => {
    try {
      window.history.back();
    } catch {}
  };

  // ★ 실제 회원 정보 가져오기 (authStore + 서버 확장 필드)
  const authInfo = getAuthInfo();
  const session = getSession();
  const memberId = session?.memberId || authInfo?.memberId;
  
  const [profile, setProfile] = useState(() => ({
    name: authInfo?.name || "회원",
    role: authInfo?.role === "admin" ? "관리자" : "지역공유발전플랫폼 회원",
    phone: authInfo?.phone || "010-0000-0000",
    email: authInfo?.email || authInfo?.userId || "sample@shareunity.com",
    region: authInfo?.region || authInfo?.regionName || "우리동네",
    bio: authInfo?.bio || "지역을 연결하고, 상권과 커뮤니티를 활성화합니다.",
    cardPublic: authInfo?.cardPublic !== false,
  }));

  const [links, setLinks] = useState(() => {
    try {
      const linksData = authInfo?.links;
      if (typeof linksData === 'string') {
        return JSON.parse(linksData);
      } else if (Array.isArray(linksData)) {
        return linksData;
      }
    } catch (e) {}
    return [];
  });

  // 서버에서 최신 데이터 로드
  useEffect(() => {
    if (!memberId) return;
    getMemberById(memberId).then((member) => {
      if (!member) return;
      setProfile((prev) => ({
        ...prev,
        name: member.name || prev.name,
        phone: member.phone || prev.phone,
        email: member.email || prev.email,
        region: member.regionName || member.region || prev.region,
        bio: member.bio ?? prev.bio,
        cardPublic: member.cardPublic !== undefined ? !!member.cardPublic : prev.cardPublic,
      }));
      try {
        const ld = member.links;
        if (Array.isArray(ld) && ld.length > 0) setLinks(ld);
        else if (typeof ld === 'string') {
          const parsed = JSON.parse(ld);
          if (Array.isArray(parsed) && parsed.length > 0) setLinks(parsed);
        }
      } catch {}
    }).catch(() => {});
  }, [memberId]);

  // 링크 추가/수정/삭제 상태
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkValue, setNewLinkValue] = useState('');
  const [showAddLink, setShowAddLink] = useState(false);

  const addLink = () => {
    if (!newLinkLabel.trim() || !newLinkValue.trim()) return;
    const newLink = { id: Date.now(), label: newLinkLabel.trim(), value: newLinkValue.trim() };
    setLinks((prev) => [...prev, newLink]);
    setNewLinkLabel('');
    setNewLinkValue('');
    setShowAddLink(false);
  };

  const removeLink = (id) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };
  
  const [saving, setSaving] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const qrCanvasRef = useRef(null);
  const [activeDesignId, setActiveDesignId] = useState(CARD_DESIGN_PRESETS[0].id);

  const cardFields = useMemo(() => getBusinessCardFields(profile, links, memberId), [profile, links, memberId]);
  const activeDesign = useMemo(() => CARD_DESIGN_PRESETS.find((preset) => preset.id === activeDesignId) || CARD_DESIGN_PRESETS[0], [activeDesignId]);

  // Generate QR code on mount
  useEffect(() => {
    const generateQr = async () => {
      try {
        const cardUrl = `${window.location.origin}/cards/${memberId}`;
        const dataUrl = await QRCode.toDataURL(cardUrl, { width: 220, margin: 1 });
        setQrDataUrl(dataUrl);
      } catch (err) {
        console.error('[MyCard] QR generation failed:', err);
      }
    };
    if (memberId) generateQr();
  }, [memberId]);

  const saveCard = async () => {
    if (!memberId) {
      alert('로그인 정보가 없습니다.');
      return;
    }
    try {
      setSaving(true);
      await updateUserCard(memberId, {
        bio: profile.bio,
        links: links,
        cardPublic: profile.cardPublic
      });
      alert('명함이 저장되었습니다!');
    } catch (err) {
      console.error('[MyCard] Save failed:', err);
      alert('저장 실패: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const copyText = async (txt) => {
    const t = String(txt ?? "");
    if (!t) return;
    try {
      await navigator.clipboard.writeText(t);
      window.alert("복사 완료!");
    } catch {
      // 클립보드가 막힌 환경 fallback
      try {
        window.prompt("복사해서 사용해줘:", t);
      } catch {}
    }
  };

  const shareCard = async () => {
    const text = `[내 명함]
이름: ${profile.name}
소속: ${profile.role}
전화: ${profile.phone}
이메일: ${profile.email}
지역: ${profile.region}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "내 명함", text });
      } else {
        await copyText(text);
      }
    } catch {}
  };

  // ---- 인라인 스타일(기본 CSS 없어도 안정) ----
  const panelStyle = {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    border: "1px solid #DDE3EA",
    background: "#FFFFFF",
  };

  const cardStyle = {
    padding: 12,
    borderRadius: 14,
    border: "1px solid #DDE3EA",
    background: "#F5F7FA",
    textAlign: "left",
  };

  const rowStyle = {
    display: "flex",
    gap: 8,
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    fontSize: 13,
    opacity: 0.9,
  };

  const labelStyle = { opacity: 0.75, minWidth: 72 };

  return (
    <div className="su-page">
      <PageHeader title="내 명함" onBack={goBack} action={{ label: '홈', onClick: goHome }} />

      <section style={panelStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 19, fontWeight: 900, color: "#0f172a" }}>기본 디자인 카드 10종</div>
            <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.6, color: "#64748b" }}>
              실제 종이 명함처럼 보이도록 금장, 은색, 화이트, 라이트 그레이 중심의 기업형 시안을 구성했습니다.
            </div>
          </div>
          <div style={{ display: "inline-flex", padding: "8px 12px", borderRadius: 999, background: "linear-gradient(135deg, rgba(14,116,144,0.1), rgba(212,146,42,0.1))", color: "#0e7490", fontSize: 12, fontWeight: 800 }}>
            디자인 전용 프리뷰
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <BusinessCardPreview preset={activeDesign} fields={cardFields} compact={false} />
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
          {CARD_DESIGN_PRESETS.map((preset) => {
            const selected = preset.id === activeDesign.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setActiveDesignId(preset.id)}
                style={{
                  flexShrink: 0,
                  padding: "9px 12px",
                  borderRadius: 999,
                  border: selected ? "1.5px solid #0e7490" : "1px solid #dbe2ea",
                  background: selected ? "rgba(14,116,144,0.08)" : "#ffffff",
                  color: selected ? "#0e7490" : "#475569",
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {preset.name}
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {CARD_DESIGN_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setActiveDesignId(preset.id)}
              style={{
                border: preset.id === activeDesign.id ? "1.5px solid rgba(14,116,144,0.4)" : "1px solid #e2e8f0",
                background: "#ffffff",
                borderRadius: 22,
                padding: 10,
                cursor: "pointer",
                boxShadow: preset.id === activeDesign.id ? "0 10px 24px rgba(14,116,144,0.12)" : "0 8px 18px rgba(15,23,42,0.06)",
                textAlign: "left",
              }}
            >
              <BusinessCardPreview preset={preset} fields={cardFields} compact />
            </button>
          ))}
        </div>
      </section>

      {/* 프로필 카드 */}
      <section style={panelStyle}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div
            aria-hidden="true"
            style={{
              width: 54,
              height: 54,
              borderRadius: 16,
              border: "1px solid #DDE3EA",
              background: "#EEF1F5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
            }}
          >
            🙂
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 900, fontSize: 18 }}>{profile.name}</div>
            <div style={{ marginTop: 2, fontSize: 13, opacity: 0.85 }}>{profile.role}</div>
            <div style={{ marginTop: 2, fontSize: 12, opacity: 0.75 }}>{profile.region}</div>
          </div>

          <button
            type="button"
            className="su-pill"
            onClick={() => navigate('/my')}
          >
            편집
          </button>
        </div>

        <div style={{ ...cardStyle, marginTop: 12 }}>
          <div style={{ fontWeight: 900 }}>연락처</div>

          <div style={rowStyle}>
            <span style={labelStyle}>전화</span>
            <span style={{ flex: 1 }}>{profile.phone}</span>
            <button type="button" className="su-pill" onClick={() => copyText(profile.phone)}>
              복사
            </button>
          </div>

          <div style={rowStyle}>
            <span style={labelStyle}>이메일</span>
            <span style={{ flex: 1 }}>{profile.email}</span>
            <button type="button" className="su-pill" onClick={() => copyText(profile.email)}>
              복사
            </button>
          </div>

          <div style={{ marginTop: 10, fontSize: 13, opacity: 0.85, lineHeight: 1.5 }}>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="자기소개를 입력하세요"
              style={{ 
                width: '100%', 
                minHeight: 60, 
                padding: 8, 
                borderRadius: 8, 
                background: '#F5F7FA', 
                border: '1px solid #DDE3EA',
                color: '#0D1B21',
                fontSize: 13,
                resize: 'vertical'
              }}
            />
          </div>
          
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <input
                type="checkbox"
                checked={profile.cardPublic}
                onChange={(e) => setProfile(prev => ({ ...prev, cardPublic: e.target.checked }))}
              />
              명함 공개 (다른 사람이 볼 수 있음)
            </label>
          </div>
        </div>

        {/* 저장/공유 버튼 */}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button 
            type="button" 
            className="su-primaryBtn" 
            style={{ flex: 1, opacity: saving ? 0.6 : 1 }} 
            onClick={saveCard}
            disabled={saving}
          >
            {saving ? '저장 중...' : '저장하기'}
          </button>
          <button type="button" className="su-primaryBtn" style={{ flex: 1 }} onClick={shareCard}>
            공유하기
          </button>
        </div>
      </section>

      {/* QR 영역 */}
      <section style={panelStyle}>
        <div style={{ fontWeight: 900 }}>내 QR</div>

        <div
          style={{
            marginTop: 10,
            height: 220,
            borderRadius: 16,
            border: "1px dashed rgba(255,255,255,0.20)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.8,
            fontSize: 12,
            background: qrDataUrl ? '#fff' : 'transparent'
          }}
        >
          {qrDataUrl ? (
            <img 
              src={qrDataUrl} 
              alt="QR Code" 
              style={{ width: 220, height: 220, borderRadius: 16 }} 
            />
          ) : (
            <span>QR 코드 생성 중...</span>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button
            type="button"
            className="su-primaryBtn"
            style={{ flex: 1 }}
            onClick={() => {
              if (!qrDataUrl) return;
              const link = document.createElement('a');
              link.href = qrDataUrl;
              link.download = `명함_${profile.name}_QR.png`;
              link.click();
            }}
          >
            저장
          </button>
          <button
            type="button"
            className="su-primaryBtn"
            style={{ flex: 1 }}
            onClick={async () => {
              try {
                const cardUrl = `${window.location.origin}/cards/${memberId}`;
                const dataUrl = await QRCode.toDataURL(cardUrl, { width: 220, margin: 1 });
                setQrDataUrl(dataUrl);
                alert('QR 코드가 재발급되었습니다');
              } catch (err) {
                alert('QR 재발급 실패');
              }
            }}
          >
            재발급
          </button>
        </div>
      </section>

      {/* 링크 */}
      <section style={panelStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontWeight: 900 }}>링크</div>
          <button
            type="button"
            className="su-pill"
            onClick={() => setShowAddLink((v) => !v)}
            style={{ color: 'var(--c-primary)', borderColor: 'var(--c-primary)' }}
          >
            {showAddLink ? '취소' : '+ 추가'}
          </button>
        </div>

        {showAddLink && (
          <div style={{ background: 'var(--c-subtle)', borderRadius: 10, padding: 12, marginBottom: 10 }}>
            <input
              className="su-input"
              placeholder="레이블 (예: 홈페이지)"
              value={newLinkLabel}
              onChange={(e) => setNewLinkLabel(e.target.value)}
              style={{ marginBottom: 8 }}
            />
            <input
              className="su-input"
              placeholder="URL 또는 아이디"
              value={newLinkValue}
              onChange={(e) => setNewLinkValue(e.target.value)}
              style={{ marginBottom: 8 }}
            />
            <button
              type="button"
              className="su-primaryBtn"
              style={{ width: '100%' }}
              onClick={addLink}
            >
              추가
            </button>
          </div>
        )}

        {links.length === 0 && !showAddLink && (
          <div className="su-empty" style={{ padding: '12px 0' }}>링크를 추가해 보세요.</div>
        )}

        <div style={{ display: "grid", gap: 10 }}>
          {links.map((l) => (
            <div key={l.id} style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontWeight: 900, flex: 1 }}>{l.label}</div>
                <button type="button" className="su-pill" onClick={() => copyText(l.value)}>복사</button>
                <button
                  type="button"
                  className="su-pill"
                  onClick={() => removeLink(l.id)}
                  style={{ color: '#ef4444', borderColor: '#ef4444' }}
                >
                  삭제
                </button>
              </div>
              <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85, wordBreak: 'break-all' }}>{l.value}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ height: 90 }} />
    </div>
  );
}
