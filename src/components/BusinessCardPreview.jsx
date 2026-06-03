import {
  CARD_ASPECT,
  CARD_DISPLAY_MM,
  CARD_THEME_PRESETS,
  getCardDisplayWebsite,
  getCardInfoLines,
  resolveCardThemeKey,
  resolveSidePanelImageSrc,
  shouldShowSidePanel,
} from "../lib/businessCardCore";

function BusinessCardThemeThumbnail({ theme, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        border: active ? `2px solid ${theme.accent}` : "1px solid rgba(148,163,184,0.18)",
        background: "rgba(255,255,255,0.78)",
        borderRadius: 16,
        padding: 8,
        boxShadow: active ? `0 10px 20px ${theme.glow}` : "none",
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
      }}
    >
      <div
        style={{
          position: "relative",
          height: 68,
          borderRadius: 12,
          overflow: "hidden",
          background: theme.previewBackground,
          border: `1px solid ${theme.border}`,
        }}
      >
        {theme.layout === "stripe" ? <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, background: theme.foil }} /> : null}
        {theme.layout === "topbar" ? <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 7, background: theme.foil }} /> : null}
        {theme.layout === "rightpanel" ? <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 24, background: theme.panelBackground }} /> : null}
        <div style={{ position: "absolute", inset: 0, padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.08em", color: theme.accent }}>SMI CORP</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, lineHeight: 1, color: theme.title }}>홍길동</div>
            <div style={{ marginTop: 3, fontSize: 7, fontWeight: 700, color: theme.body }}>대표이사</div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 6, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#475569" }}>{theme.label}</div>
        {active ? <div style={{ fontSize: 10, fontWeight: 900, color: theme.accent }}>선택</div> : null}
      </div>
    </button>
  );
}

export function BusinessCardThemePicker({ selectedThemeKey, onSelect }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(108px, 1fr))", gap: 10 }}>
      {Object.values(CARD_THEME_PRESETS).map((theme) => (
        <BusinessCardThemeThumbnail
          key={theme.key}
          theme={theme}
          active={theme.key === selectedThemeKey}
          onSelect={() => onSelect(theme.key)}
        />
      ))}
    </div>
  );
}

export default function BusinessCardPreview({ form, themeKey, fixedSize = true }) {
  const theme = CARD_THEME_PRESETS[resolveCardThemeKey(themeKey)] || CARD_THEME_PRESETS.teal;
  const displayWebsite = getCardDisplayWebsite(form?.website);
  const infoLines = getCardInfoLines(form || {});
  const layout = theme.layout || "classic";
  const showSidePanel = shouldShowSidePanel(theme, form);
  const panelText = String(form?.sidePanelText || "").trim();
  const panelImageUrl = String(form?.sidePanelImageUrl || "").trim();
  const panelImageSrc = resolveSidePanelImageSrc(panelImageUrl);

  const cardStyle = fixedSize
    ? {
        width: `min(100%, ${CARD_DISPLAY_MM.width}mm)`,
        aspectRatio: `${CARD_DISPLAY_MM.width} / ${CARD_DISPLAY_MM.height}`,
        flexShrink: 0,
      }
    : {
        width: "100%",
        aspectRatio: String(CARD_ASPECT),
      };

  const card = (
    <div
      style={{
        ...cardStyle,
        borderRadius: 20,
        padding: 16,
        background: theme.previewBackground,
        color: theme.title,
        border: `1px solid ${theme.border}`,
        boxShadow: `0 18px 36px ${theme.glow}`,
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: theme.dark
            ? "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0) 48%)"
            : "linear-gradient(135deg, rgba(255,255,255,0.52), rgba(255,255,255,0) 44%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -60,
          top: -80,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.foil}33 0%, rgba(255,255,255,0) 72%)`,
          pointerEvents: "none",
        }}
      />
      {layout === "stripe" ? <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 8, background: theme.foil }} /> : null}
      {layout === "topbar" ? <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: 10, background: theme.foil }} /> : null}
      {layout === "bottomline" ? <div style={{ position: "absolute", left: 20, right: 20, bottom: 12, height: 3, borderRadius: 999, background: theme.foil }} /> : null}
      {layout === "band" ? <div style={{ position: "absolute", left: 14, right: 14, top: "38%", height: 48, borderRadius: 14, background: theme.panelBackground }} /> : null}
      {layout === "corner" ? <div style={{ position: "absolute", top: -20, right: -18, width: 90, height: 90, borderRadius: "50%", background: `${theme.foil}33` }} /> : null}
      {layout === "minimal-dark" ? <div style={{ position: "absolute", inset: 10, borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)" }} /> : null}
      {layout === "elegant" ? <div style={{ position: "absolute", left: 16, bottom: 28, width: 80, height: 2, background: theme.foil }} /> : null}

      <div
        style={{
          position: "relative",
          height: "100%",
          display: "grid",
          gridTemplateColumns: showSidePanel ? "minmax(0, 1fr) 28%" : "1fr",
          gap: 12,
          paddingLeft: layout === "stripe" ? 10 : 4,
        }}
      >
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 6 }}>
          {String(form?.companyName || "").trim() ? (
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.1em", color: theme.accent, wordBreak: "break-word" }}>
              {String(form.companyName).trim()}
            </div>
          ) : null}
          {String(form?.jobTitle || "").trim() ? (
            <div style={{ fontSize: 11, fontWeight: 700, color: theme.body, wordBreak: "break-word" }}>
              {String(form.jobTitle).trim()}
            </div>
          ) : null}
          <div
            style={{
              fontSize: "clamp(22px, 5.5vw, 32px)",
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              color: theme.title,
              wordBreak: "break-word",
            }}
          >
            {String(form?.name || "").trim() || "이름"}
          </div>
          <div style={{ marginTop: 4, display: "grid", gap: 3 }}>
            {infoLines.map((line) => (
              <div key={`${line.label}-${line.value}`} style={{ fontSize: 11, fontWeight: 700, color: theme.body, wordBreak: "break-word" }}>
                {line.label}. {line.value}
              </div>
            ))}
            {String(form?.email || "").trim() ? (
              <div style={{ fontSize: 11, fontWeight: 700, color: theme.body, wordBreak: "break-all" }}>
                E. {String(form.email).trim()}
              </div>
            ) : null}
            {String(form?.address || "").trim() ? (
              <div style={{ fontSize: 10, lineHeight: 1.5, color: theme.body, wordBreak: "break-word" }}>
                {String(form.address).trim()}
              </div>
            ) : null}
            {displayWebsite ? (
              <div style={{ fontSize: 10, fontWeight: 800, color: theme.body, wordBreak: "break-all" }}>
                {displayWebsite}
              </div>
            ) : null}
            {String(form?.intro || "").trim() ? (
              <div style={{ fontSize: 10, lineHeight: 1.55, color: theme.body, wordBreak: "break-word", marginTop: 2 }}>
                {String(form.intro).trim()}
              </div>
            ) : null}
          </div>
        </div>
        {showSidePanel ? (
          <div
            style={{
              alignSelf: "stretch",
              borderRadius: 14,
              padding: "8px 6px",
              background: theme.panelBackground,
              border: `1px solid ${theme.border}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            {panelImageSrc ? (
              <img
                src={panelImageSrc}
                alt="명함 우측 이미지"
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 8 }}
              />
            ) : panelText ? (
              <div style={{ textAlign: "center", padding: "4px 6px", width: "100%" }}>
                {panelText.split("\n").filter(Boolean).slice(0, 5).map((line, index) => (
                  <div
                    key={`${line}-${index}`}
                    style={{
                      fontSize: index === 0 ? 12 : 10,
                      fontWeight: index === 0 ? 900 : 700,
                      lineHeight: 1.45,
                      color: index === 0 ? theme.title : theme.body,
                      wordBreak: "break-word",
                    }}
                  >
                    {line}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 10, fontWeight: 700, color: theme.body, opacity: 0.45, textAlign: "center", padding: "0 4px" }}>
                로고·QR·문구
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );

  if (!fixedSize) return card;

  return (
    <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
      {card}
    </div>
  );
}
