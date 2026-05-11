import QRCode from 'qrcode';

function normalizeBaseUrl(raw) {
  const text = String(raw || '').trim();
  if (!text) return '';
  return text.endsWith('/') ? text.slice(0, -1) : text;
}

export function buildAbsoluteUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;

  // 배포 시 실제 공개 도메인을 강제하려면 VITE_PUBLIC_SITE_URL 사용
  const envBase = normalizeBaseUrl(import.meta.env.VITE_PUBLIC_SITE_URL || import.meta.env.VITE_WEB_BASE_URL);
  const origin = envBase || (typeof window !== 'undefined' ? window.location.origin : '');
  if (!origin) return path;
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function generateQrDataUrl(targetUrl, size = 320) {
  const text = String(targetUrl || '').trim();
  if (!text) return '';
  return QRCode.toDataURL(text, {
    width: size,
    margin: 1,
    errorCorrectionLevel: 'M',
  });
}

export function downloadDataUrl(dataUrl, filename) {
  const href = String(dataUrl || '').trim();
  if (!href) return;
  const safe = String(filename || 'qr-code.png').trim() || 'qr-code.png';
  const a = document.createElement('a');
  a.href = href;
  a.download = safe;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
