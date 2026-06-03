/** 가로형 명함 — 10종 템플릿 + Canvas 렌더링 */

export const CARD_WIDTH = 1050;
export const CARD_HEIGHT = 600;
export const CARD_ASPECT = CARD_WIDTH / CARD_HEIGHT;
export const CARD_FONT = '"Apple SD Gothic Neo", "Malgun Gothic", "Segoe UI", sans-serif';

/** 화면 표시용 실물 명함 크기 (ISO 90×50mm) */
export const CARD_DISPLAY_MM = { width: 90, height: 50 };

export const CARD_THEME_PRESETS = {
  teal: {
    key: "teal",
    label: "Pearl Teal",
    orientation: "horizontal",
    previewBackground: "linear-gradient(135deg, #fafeff 0%, #e7f7f6 55%, #ffffff 100%)",
    accent: "#0e7490",
    border: "rgba(14, 116, 144, 0.22)",
    glow: "rgba(14, 116, 144, 0.14)",
    panelBackground: "rgba(14,116,144,0.07)",
    title: "#0f172a",
    body: "#526273",
    foil: "#7dd3c7",
    dark: false,
    layout: "classic",
  },
  blue: {
    key: "blue",
    label: "Royal Navy",
    orientation: "horizontal",
    previewBackground: "linear-gradient(135deg, #0f2857 0%, #163b7a 100%)",
    accent: "#93c5fd",
    border: "rgba(147, 197, 253, 0.22)",
    glow: "rgba(15, 40, 87, 0.28)",
    panelBackground: "rgba(255,255,255,0.1)",
    title: "#eff6ff",
    body: "rgba(219, 234, 254, 0.86)",
    foil: "#60a5fa",
    dark: true,
    layout: "rightpanel",
  },
  navy: {
    key: "navy",
    label: "Navy Gold",
    orientation: "horizontal",
    previewBackground: "linear-gradient(135deg, #0f1c35 0%, #1a3158 100%)",
    accent: "#d6a847",
    border: "rgba(214, 168, 71, 0.24)",
    glow: "rgba(15, 28, 53, 0.26)",
    panelBackground: "rgba(255,255,255,0.08)",
    title: "#f8fafc",
    body: "rgba(226, 232, 240, 0.82)",
    foil: "#f3d58d",
    dark: true,
    layout: "topbar",
  },
  gold: {
    key: "gold",
    label: "Executive Gold",
    orientation: "horizontal",
    previewBackground: "linear-gradient(135deg, #fffdfa 0%, #f7f1e5 100%)",
    accent: "#b68a2f",
    border: "rgba(182, 138, 47, 0.22)",
    glow: "rgba(182, 138, 47, 0.14)",
    panelBackground: "rgba(182,138,47,0.07)",
    title: "#1f2937",
    body: "#6b7280",
    foil: "#d6b15b",
    dark: false,
    layout: "elegant",
  },
  silver: {
    key: "silver",
    label: "Platinum Silver",
    orientation: "horizontal",
    previewBackground: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    accent: "#475569",
    border: "rgba(71, 85, 105, 0.2)",
    glow: "rgba(71, 85, 105, 0.12)",
    panelBackground: "rgba(148,163,184,0.12)",
    title: "#0f172a",
    body: "#64748b",
    foil: "#cbd5e1",
    dark: false,
    layout: "minimal",
  },
  red: {
    key: "red",
    label: "Burgundy Crest",
    orientation: "horizontal",
    previewBackground: "linear-gradient(135deg, #5a1326 0%, #7f1d1d 100%)",
    accent: "#fecaca",
    border: "rgba(254, 202, 202, 0.2)",
    glow: "rgba(127, 29, 29, 0.22)",
    panelBackground: "rgba(255,255,255,0.08)",
    title: "#fff7f7",
    body: "rgba(254, 226, 226, 0.84)",
    foil: "#fca5a5",
    dark: true,
    layout: "stripe",
  },
  green: {
    key: "green",
    label: "Emerald Corp",
    orientation: "horizontal",
    previewBackground: "linear-gradient(135deg, #103b28 0%, #185237 100%)",
    accent: "#86efac",
    border: "rgba(134, 239, 172, 0.2)",
    glow: "rgba(16, 59, 40, 0.22)",
    panelBackground: "rgba(255,255,255,0.08)",
    title: "#f0fdf4",
    body: "rgba(220, 252, 231, 0.84)",
    foil: "#4ade80",
    dark: true,
    layout: "band",
  },
  charcoal: {
    key: "charcoal",
    label: "Charcoal Metal",
    orientation: "horizontal",
    previewBackground: "linear-gradient(135deg, #111111 0%, #2a2a2a 100%)",
    accent: "#e4e4e7",
    border: "rgba(228, 228, 231, 0.18)",
    glow: "rgba(0, 0, 0, 0.28)",
    panelBackground: "rgba(255,255,255,0.06)",
    title: "#fafafa",
    body: "rgba(228, 228, 231, 0.78)",
    foil: "#a1a1aa",
    dark: true,
    layout: "minimal-dark",
  },
  rose: {
    key: "rose",
    label: "Rose Silk",
    orientation: "horizontal",
    previewBackground: "linear-gradient(135deg, #fffdfd 0%, #fceef3 100%)",
    accent: "#be185d",
    border: "rgba(190, 24, 93, 0.18)",
    glow: "rgba(236, 72, 153, 0.12)",
    panelBackground: "rgba(190,24,93,0.05)",
    title: "#3f1d2e",
    body: "#6b4c5d",
    foil: "#f8b4d9",
    dark: false,
    layout: "corner",
  },
  copper: {
    key: "copper",
    label: "Copper Line",
    orientation: "horizontal",
    previewBackground: "linear-gradient(135deg, #fffdfb 0%, #f8efe7 100%)",
    accent: "#b45309",
    border: "rgba(180, 83, 9, 0.18)",
    glow: "rgba(180, 83, 9, 0.12)",
    panelBackground: "rgba(180,83,9,0.06)",
    title: "#3b2415",
    body: "#6b584c",
    foil: "#e0a96d",
    dark: false,
    layout: "bottomline",
  },
};

export const HORIZONTAL_CARD_THEMES = Object.values(CARD_THEME_PRESETS);

const CARD_META_PREFIX = "__card_meta__";

export function buildCardForm(defaultName = "", defaultPhone = "", defaultEmail = "") {
  return {
    companyName: "",
    jobTitle: "",
    name: String(defaultName || "").trim(),
    phone: String(defaultPhone || "").trim(),
    mobile: String(defaultPhone || "").trim(),
    email: String(defaultEmail || "").trim(),
    address: "",
    website: "",
    intro: "",
    sidePanelText: "",
    sidePanelImageUrl: "",
    cardPublic: true,
  };
}

export function shouldShowSidePanel(theme, form) {
  const hasCustom = !!(String(form?.sidePanelText || "").trim() || String(form?.sidePanelImageUrl || "").trim());
  if (hasCustom) return true;
  return (theme?.layout || "") === "rightpanel";
}

export function resolveSidePanelImageSrc(imageUrl) {
  const text = String(imageUrl || "").trim();
  if (!text) return "";
  if (/^https?:\/\//i.test(text) || text.startsWith("data:") || text.startsWith("blob:")) return text;
  const base = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || "";
  return `${base}${text.startsWith("/") ? text : `/${text}`}`;
}

export function resolveCardThemeKey(value) {
  const key = String(value || "teal").trim().toLowerCase();
  return CARD_THEME_PRESETS[key] ? key : "teal";
}

export function normalizeCardSlugInput(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "")
    .slice(0, 48);
}

export function buildDefaultCardSlug(source) {
  const normalized = normalizeCardSlugInput(String(source || "").replace(/\s+/g, "-"));
  if (normalized.length >= 2) return normalized;
  return `card-${Date.now().toString().slice(-6)}`;
}

function simplifyWebsiteLabel(value) {
  return String(value || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "");
}

export function getCardDisplayWebsite(value) {
  return simplifyWebsiteLabel(value);
}

export function getCardInfoLines(form) {
  const lines = [];
  const phone = String(form?.phone || "").trim();
  const mobile = String(form?.mobile || "").trim();
  if (phone) lines.push({ label: "T", value: phone });
  if (mobile && mobile !== phone) lines.push({ label: "M", value: mobile });
  return lines;
}

function extractCardMeta(links) {
  const meta = {};
  const preservedLinks = [];
  (Array.isArray(links) ? links : []).forEach((item) => {
    const category = String(item?.category || "").trim();
    if (item?.type === "custom" && category.startsWith(`${CARD_META_PREFIX}:`)) {
      const key = category.slice(CARD_META_PREFIX.length + 1);
      if (key) meta[key] = String(item?.value || "").trim();
      return;
    }
    preservedLinks.push(item);
  });
  return { meta, preservedLinks };
}

export function buildCardMetaLinks(fields, preservedLinks) {
  const metaLinks = Object.entries(fields).map(([key, value], index) => ({
    id: `card-meta-${key}-${index}`,
    type: "custom",
    category: `${CARD_META_PREFIX}:${key}`,
    value: String(value || "").trim(),
  }));
  return [...(Array.isArray(preservedLinks) ? preservedLinks : []), ...metaLinks];
}

export function readCardFieldsFromRecord(record, defaults = {}) {
  const { meta, preservedLinks } = extractCardMeta(record?.links || []);
  const defaultName = String(defaults.defaultName || "").trim();
  const defaultPhone = String(defaults.defaultPhone || "").trim();
  const defaultEmail = String(defaults.defaultEmail || "").trim();
  const fallbackForm = buildCardForm(defaultName, defaultPhone, defaultEmail);
  const resolvedThemeKey = resolveCardThemeKey(record?.template || meta.themeColor || "teal");
  return {
    form: {
      ...fallbackForm,
      companyName: String(meta.companyName || "").trim(),
      jobTitle: String(meta.jobTitle || "").trim(),
      name: String(meta.name || record?.name || defaultName || "").trim(),
      phone: String(meta.phone || record?.phone || defaultPhone || "").trim(),
      mobile: String(meta.mobile || defaultPhone || "").trim(),
      email: String(meta.email || defaultEmail || "").trim(),
      address: String(meta.address || "").trim(),
      website: String(meta.website || "").trim(),
      intro: String(record?.bio || meta.intro || "").trim(),
      sidePanelText: String(meta.sidePanelText || "").trim(),
      sidePanelImageUrl: String(meta.sidePanelImageUrl || "").trim(),
      cardPublic: record?.cardPublic !== false,
    },
    preservedLinks,
    themeKey: resolvedThemeKey,
    orientation: "horizontal",
    slug: normalizeCardSlugInput(record?.cardSlug || ""),
  };
}

export function createCardPayload(form, themeKey, preservedLinks, cardSlug) {
  return {
    cardSlug,
    bio: String(form.intro || "").trim(),
    cardPublic: form.cardPublic !== false,
    links: buildCardMetaLinks(
      {
        companyName: form.companyName,
        jobTitle: form.jobTitle,
        name: form.name,
        phone: form.phone,
        mobile: form.mobile,
        email: form.email,
        address: form.address,
        website: form.website,
        sidePanelText: form.sidePanelText,
        sidePanelImageUrl: form.sidePanelImageUrl,
        themeColor: themeKey,
        orientation: "horizontal",
      },
      preservedLinks
    ),
    template: themeKey,
  };
}

function roundRectPath(ctx, x, y, width, height, radius) {
  const safeRadius = Math.max(0, Math.min(radius, Math.min(width, height) / 2));
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.arcTo(x + width, y, x + width, y + height, safeRadius);
  ctx.arcTo(x + width, y + height, x, y + height, safeRadius);
  ctx.arcTo(x, y + height, x, y, safeRadius);
  ctx.arcTo(x, y, x + width, y, safeRadius);
  ctx.closePath();
}

function wrapCanvasText(ctx, text, maxWidth) {
  const raw = String(text || "").trim();
  if (!raw) return [];
  const words = raw.split(/\s+/);
  const lines = [];
  let current = "";
  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth || !current) {
      current = next;
      return;
    }
    lines.push(current);
    current = word;
  });
  if (current) lines.push(current);
  return lines;
}

function fitFontSize(ctx, text, maxWidth, maxSize, minSize, weight = 900) {
  let size = maxSize;
  while (size >= minSize) {
    ctx.font = `${weight} ${size}px ${CARD_FONT}`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 2;
  }
  return minSize;
}

function parseGradientColors(previewBackground) {
  const matches = String(previewBackground || "").match(/#(?:[0-9a-fA-F]{3}){1,2}/g) || [];
  if (matches.length >= 2) return matches;
  return ["#ffffff", "#f5f5f5", "#eeeeee"];
}

function drawLayoutDecor(ctx, theme, w, h, form) {
  const layout = theme.layout || "classic";
  const showSidePanel = shouldShowSidePanel(theme, form);
  if (layout === "stripe") {
    ctx.fillStyle = theme.foil;
    roundRectPath(ctx, 36, 36, 14, h - 72, 8);
    ctx.fill();
  }
  if (layout === "topbar") {
    ctx.fillStyle = theme.foil;
    roundRectPath(ctx, 36, 36, w - 72, 12, 8);
    ctx.fill();
  }
  if (layout === "bottomline") {
    ctx.fillStyle = theme.foil;
    roundRectPath(ctx, 72, h - 58, w - 144, 5, 4);
    ctx.fill();
  }
  if (layout === "band") {
    ctx.fillStyle = theme.panelBackground;
    roundRectPath(ctx, 56, 148, w - 112, 96, 22);
    ctx.fill();
  }
  if (showSidePanel) {
    drawSidePanelBox(ctx, theme, w, h);
  }
  if (layout === "corner") {
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = theme.foil;
    ctx.beginPath();
    ctx.arc(w - 40, 36, 110, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  if (layout === "minimal-dark") {
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1;
    roundRectPath(ctx, 52, 52, w - 104, h - 104, 24);
    ctx.stroke();
  }
  if (layout === "elegant") {
    ctx.strokeStyle = theme.foil;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(56, h - 72);
    ctx.lineTo(220, h - 72);
    ctx.stroke();
  }
}

function drawSidePanelBox(ctx, theme, w, h) {
  ctx.fillStyle = theme.panelBackground;
  roundRectPath(ctx, w - 320, 48, 272, h - 96, 26);
  ctx.fill();
  ctx.strokeStyle = theme.border;
  ctx.lineWidth = 1;
  roundRectPath(ctx, w - 320, 48, 272, h - 96, 26);
  ctx.stroke();
}

function loadCanvasImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("이미지를 불러올 수 없습니다."));
    img.src = src;
  });
}

async function drawSidePanelContent(ctx, form, theme, w, h) {
  const panelX = w - 308;
  const panelY = 72;
  const panelW = 248;
  const panelH = h - 144;
  const panelText = String(form?.sidePanelText || "").trim();
  const panelImageUrl = String(form?.sidePanelImageUrl || "").trim();

  if (panelImageUrl) {
    try {
      const img = await loadCanvasImage(resolveSidePanelImageSrc(panelImageUrl));
      const scale = Math.min(panelW / img.width, panelH / img.height, 1);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const drawX = panelX + (panelW - drawW) / 2;
      const drawY = panelY + (panelH - drawH) / 2;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      return;
    } catch {
      // fall through to text
    }
  }

  if (panelText) {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `600 16px ${CARD_FONT}`;
    const lines = wrapCanvasText(ctx, panelText, panelW - 24);
    const lineHeight = 28;
    const blockHeight = lines.length * lineHeight;
    const textY = panelY + panelH / 2 - blockHeight / 2 + lineHeight / 2;
    lines.slice(0, 5).forEach((line, index) => {
      const size = index === 0 ? 22 : 16;
      ctx.font = `${index === 0 ? 800 : 600} ${size}px ${CARD_FONT}`;
      ctx.fillStyle = index === 0 ? theme.title : theme.body;
      ctx.fillText(line, panelX + panelW / 2, textY + index * lineHeight);
    });
    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";
  }
}

function drawHorizontalCardContent(ctx, form, theme, w, h) {
  const layout = theme.layout || "classic";
  const showSidePanel = shouldShowSidePanel(theme, form);
  const contentWidth = showSidePanel ? w - 380 : w - 120;
  const startX = layout === "stripe" ? 78 : 56;
  let y = 78;

  const company = String(form.companyName || "").trim();
  const jobTitle = String(form.jobTitle || "").trim();
  const name = String(form.name || "").trim() || "이름";
  const email = String(form.email || "").trim();
  const address = String(form.address || "").trim();
  const website = getCardDisplayWebsite(form.website);
  const intro = String(form.intro || "").trim();
  const infoLines = getCardInfoLines(form);

  if (company) {
    ctx.fillStyle = theme.accent;
    ctx.font = `800 22px ${CARD_FONT}`;
    ctx.fillText(company.length > 28 ? `${company.slice(0, 28)}…` : company, startX, y);
    y += 36;
  }

  if (jobTitle) {
    ctx.fillStyle = theme.body;
    ctx.font = `600 20px ${CARD_FONT}`;
    ctx.fillText(jobTitle.length > 32 ? `${jobTitle.slice(0, 32)}…` : jobTitle, startX, y);
    y += 34;
  }

  const nameSize = fitFontSize(ctx, name, contentWidth - 20, 64, 36, 900);
  ctx.fillStyle = theme.title;
  ctx.font = `900 ${nameSize}px ${CARD_FONT}`;
  ctx.fillText(name, startX, y + nameSize * 0.85);
  y += nameSize + 28;

  ctx.fillStyle = theme.body;
  ctx.font = `600 19px ${CARD_FONT}`;
  infoLines.forEach((line) => {
    ctx.fillText(`${line.label}. ${line.value}`, startX, y);
    y += 30;
  });

  if (email) {
    ctx.fillText(`E. ${email}`, startX, y);
    y += 30;
  }

  if (address) {
    ctx.font = `500 18px ${CARD_FONT}`;
    wrapCanvasText(ctx, address, contentWidth).slice(0, 2).forEach((line) => {
      ctx.fillText(line, startX, y);
      y += 26;
    });
  }

  if (website) {
    ctx.font = `700 18px ${CARD_FONT}`;
    ctx.fillText(website, startX, y);
    y += 28;
  }

  if (intro) {
    ctx.font = `500 17px ${CARD_FONT}`;
    wrapCanvasText(ctx, intro, contentWidth).slice(0, 2).forEach((line) => {
      ctx.fillText(line, startX, y);
      y += 24;
    });
  }
}

export async function buildBusinessCardImageDataUrl(form, themeKey) {
  const theme = CARD_THEME_PRESETS[resolveCardThemeKey(themeKey)] || CARD_THEME_PRESETS.teal;
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("이미지 생성 컨텍스트를 만들 수 없습니다.");

  const gradientParts = parseGradientColors(theme.previewBackground);
  const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bg.addColorStop(0, gradientParts[0]);
  bg.addColorStop(0.55, gradientParts[Math.min(1, gradientParts.length - 1)]);
  bg.addColorStop(1, gradientParts[Math.min(2, gradientParts.length - 1)] || gradientParts[gradientParts.length - 1]);
  ctx.fillStyle = bg;
  roundRectPath(ctx, 24, 24, canvas.width - 48, canvas.height - 48, 28);
  ctx.fill();

  ctx.save();
  ctx.globalAlpha = theme.dark ? 0.07 : 0.14;
  ctx.fillStyle = theme.dark ? "#ffffff" : theme.foil;
  ctx.beginPath();
  ctx.arc(canvas.width - 160, 90, 180, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = theme.border;
  ctx.lineWidth = 2;
  roundRectPath(ctx, 24, 24, canvas.width - 48, canvas.height - 48, 28);
  ctx.stroke();

  drawLayoutDecor(ctx, theme, canvas.width, canvas.height, form);
  drawHorizontalCardContent(ctx, form, theme, canvas.width, canvas.height);
  if (shouldShowSidePanel(theme, form)) {
    await drawSidePanelContent(ctx, form, theme, canvas.width, canvas.height);
  }

  return canvas.toDataURL("image/png");
}

export function getCardFileStem(form, fallbackSlug = "") {
  const raw = String(form.name || form.companyName || fallbackSlug || "business-card").trim();
  return raw.replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, "_") || "business-card";
}

export async function downloadBusinessCardImage(form, themeKey, fallbackSlug = "") {
  const dataUrl = await buildBusinessCardImageDataUrl(form, themeKey);
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = `${getCardFileStem(form, fallbackSlug)}.png`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export async function shareBusinessCardImage(form, themeKey, fallbackSlug = "") {
  const dataUrl = await buildBusinessCardImageDataUrl(form, themeKey);
  const blob = await (await fetch(dataUrl)).blob();
  const file = new File([blob], `${getCardFileStem(form, fallbackSlug)}.png`, { type: "image/png" });
  const shareText = [form.name, form.companyName, form.jobTitle].filter((v) => String(v || "").trim()).join("\n");
  if (navigator.share) {
    const canShareFile = typeof navigator.canShare === "function" ? navigator.canShare({ files: [file] }) : true;
    if (canShareFile) {
      await navigator.share({ title: form.name || "명함", text: shareText, files: [file] });
      return "shared";
    }
    await navigator.share({ title: form.name || "명함", text: shareText });
    return "shared";
  }
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(shareText || form.name || "명함");
    return "copied";
  }
  return "unsupported";
}
