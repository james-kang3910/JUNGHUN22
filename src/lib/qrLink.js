import QRCode from 'qrcode';
import {
  buildRegionPath,
  getRegionSlugFromHostname,
  isReservedRegionPathSegment,
  parseRegionPathname,
} from './regionRoutes';

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

/** 지역 포털 공개 URL (QR·공유용) */
export function buildRegionPublicUrl(regionId, options = {}) {
  const id = String(regionId || '').trim();
  if (!id) return '';
  return buildAbsoluteUrl(buildRegionPath(id, '', options));
}

/** 상점 상세 공개 URL (QR·공유용) */
export function buildShopPublicUrl(shopId) {
  const id = String(shopId || '').trim();
  if (!id) return '';
  return buildAbsoluteUrl(`/shops/${encodeURIComponent(id)}`);
}

/** 상점 결제 QR — 카메라 스캔 시 상점 페이지로 이동, 앱 스캐너는 qrPayload로 결제 */
export function buildShopPaymentQrUrl(shopId, qrPayload) {
  const base = buildShopPublicUrl(shopId);
  const token = String(qrPayload || '').trim();
  if (!base) return '';
  if (!token) return base;
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}qrPayload=${encodeURIComponent(token)}`;
}

/**
 * QR 스캔 값 해석
 * @returns {{ type: 'region'|'shop'|'shop_payment'|'payment_token'|'external'|'invalid', ... }}
 */
export function parseScannedQrValue(raw) {
  const text = String(raw || '').trim();
  if (!text) return { type: 'invalid' };

  if (text.startsWith('http://') || text.startsWith('https://')) {
    let url;
    try {
      url = new URL(text);
    } catch {
      return { type: 'external', href: text };
    }

    const qrPayload = url.searchParams.get('qrPayload') || url.searchParams.get('qrpayload') || null;
    const shopMatch = url.pathname.match(/^\/shops\/([^/]+)\/?$/i);
    if (shopMatch) {
      const shopId = decodeURIComponent(shopMatch[1]);
      return {
        type: qrPayload ? 'shop_payment' : 'shop',
        shopId,
        qrPayload,
        href: text,
      };
    }

    const hostSlug = getRegionSlugFromHostname(url.hostname);
    if (hostSlug) {
      const suffix = url.pathname && url.pathname !== '/' ? url.pathname : '';
      return { type: 'region', regionKey: hostSlug, suffix, href: text };
    }

    const legacy = url.pathname.match(/^\/r\/([^/]+)(\/.*)?$/i);
    if (legacy) {
      return {
        type: 'region',
        regionKey: decodeURIComponent(legacy[1]),
        suffix: legacy[2] || '',
        href: text,
      };
    }

    const parsed = parseRegionPathname(url.pathname);
    if (parsed?.regionKey) {
      return {
        type: 'region',
        regionKey: parsed.regionKey,
        suffix: parsed.suffix || '',
        href: text,
      };
    }

    const firstSeg = url.pathname.replace(/^\//, '').split('/').filter(Boolean)[0];
    if (firstSeg && !isReservedRegionPathSegment(firstSeg)) {
      const suffix = url.pathname.slice(firstSeg.length + 1) || '';
      return {
        type: 'region',
        regionKey: decodeURIComponent(firstSeg),
        suffix: suffix || '',
        href: text,
      };
    }

    return { type: 'external', href: text };
  }

  const inlinePayload = text.match(/[?&]qrPayload=([^&]+)/i);
  if (inlinePayload) {
    return { type: 'payment_token', qrPayload: decodeURIComponent(inlinePayload[1]) };
  }

  const parts = text.split('.');
  if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
    return { type: 'payment_token', qrPayload: text };
  }

  return { type: 'invalid' };
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
