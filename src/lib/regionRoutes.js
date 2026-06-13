/**
 * 지역 URL (4번 하이브리드)
 * 1) 짧은 경로: smi.ceo/ulsan
 * 2) 서브도메인: ulsan.smi.ceo (경로는 /, /chat …)
 * 3) 레거시 /r/:id → 짧은 경로로 리다이렉트
 */

const REGION_RESERVED = new Set([
  'home', 'search', 'community', 'chat', 'shops', 'my', 'auth', 'broadcast',
  'audition', 'region', 'regions', 'portal', 'posts', 'notices', 'missions',
  'support', 'distribution', 'card', 'cards', 'regional-admin', 'admin',
  'r', 'api', 'assets', 'static', 'favicon.ico',
]);

const REGION_SUBDOMAIN_BLOCKLIST = new Set(['www', 'api', 'admin', 'app', 'mail', 'smtp']);

function normalizeSubPath(subPath) {
  if (!subPath) return '';
  const raw = String(subPath).trim();
  if (!raw || raw === '/') return '';
  return raw.startsWith('/') ? raw : `/${raw}`;
}

export function getAppRegionBaseHost() {
  const fromEnv = String(import.meta.env.VITE_APP_REGION_HOST || '').trim().toLowerCase();
  if (fromEnv) return fromEnv;
  return 'smi.ceo';
}

/** 2차 도메인 URL 사용 (ulsan.smi.ceo). path=짧은 경로(smi.ceo/ulsan) */
export function isRegionSubdomainUrlMode() {
  const mode = String(import.meta.env.VITE_REGION_URL_MODE || '').trim().toLowerCase();
  if (mode === 'subdomain') return true;
  if (mode === 'path') return false;
  return String(import.meta.env.VITE_USE_REGION_SUBDOMAIN || '').trim().toLowerCase() === 'true';
}

export function buildRegionSubdomainHost(slug) {
  const key = String(slug || '').trim().toLowerCase();
  if (!key || REGION_SUBDOMAIN_BLOCKLIST.has(key)) return '';
  return `${key}.${getAppRegionBaseHost()}`;
}

/** 절대 URL — QR·지역 선택·도메인 전환용 (예: https://ulsan.smi.ceo/chat) */
export function buildRegionSubdomainUrl(regionId, subPath = '', options = {}) {
  const slug = String(options.slug || regionId || '').trim().toLowerCase();
  const host = buildRegionSubdomainHost(slug);
  if (!host) return '';
  const sub = normalizeSubPath(subPath);
  const envBase = String(import.meta.env.VITE_PUBLIC_SITE_URL || '').trim();
  let originPrefix = 'https://';
  if (envBase.startsWith('http://') || envBase.startsWith('https://')) {
    try {
      originPrefix = `${new URL(envBase).protocol}//`;
    } catch {
      originPrefix = 'https://';
    }
  } else if (typeof window !== 'undefined') {
    originPrefix = `${window.location.protocol}//`;
  }
  return `${originPrefix}${host}${sub || '/'}`;
}

/**
 * 지역 이동 대상 — 서브도메인 모드면 전체 URL, 아니면 SPA 경로
 * @returns {{ type: 'external', url: string } | { type: 'internal', path: string }}
 */
export function resolveRegionNavigationTarget(regionId, subPath = '', options = {}) {
  const slug = String(options.slug || regionId || '').trim().toLowerCase();
  if (isRegionSubdomainUrlMode()) {
    const currentSlug = getRegionSlugFromHostname();
    const onMainHost = !currentSlug;
    const switchingRegion = currentSlug && slug && currentSlug !== slug;
    if (onMainHost || switchingRegion) {
      const url = buildRegionSubdomainUrl(regionId, subPath, { ...options, slug });
      if (url) return { type: 'external', url };
    }
  }
  return { type: 'internal', path: buildRegionPath(regionId, subPath, { ...options, slug }) };
}

/** React Router navigate + 서브도메인 전환(window.location) */
export function navigateToRegion(navigate, regionId, subPath = '', options = {}) {
  const { replace = false, ...rest } = options;
  const target = resolveRegionNavigationTarget(regionId, subPath, rest);
  if (target.type === 'external') {
    if (replace) window.location.replace(target.url);
    else window.location.assign(target.url);
    return;
  }
  if (typeof navigate === 'function') {
    navigate(target.path, replace ? { replace: true } : undefined);
  }
}

export function isReservedRegionPathSegment(segment) {
  const key = String(segment || '').trim().toLowerCase();
  if (!key) return true;
  return REGION_RESERVED.has(key);
}

/** DB/API 지역 객체 → URL slug */
export function getRegionSlug(region) {
  if (!region) return '';
  const raw = region.slug
    || region.shortCode
    || region.code
    || region.id
    || region.regionId
    || region.region_id;
  return String(raw || '').trim().toLowerCase();
}

/** 서브도메인에서 지역 slug (없으면 null) */
export function getRegionSlugFromHostname(hostname = typeof window !== 'undefined' ? window.location.hostname : '') {
  const host = String(hostname || '').trim().toLowerCase();
  if (!host || host === 'localhost' || host === '127.0.0.1') {
    const devSlug = String(import.meta.env.VITE_DEV_REGION_SUBDOMAIN || '').trim().toLowerCase();
    return devSlug || null;
  }

  if (host.endsWith('.localhost')) {
    const sub = host.split('.')[0];
    if (sub && !REGION_SUBDOMAIN_BLOCKLIST.has(sub)) return sub;
    return null;
  }

  const baseHost = getAppRegionBaseHost();
  if (host === baseHost || host === `www.${baseHost}`) return null;

  if (host.endsWith(`.${baseHost}`)) {
    const sub = host.slice(0, -(baseHost.length + 1)).split('.').pop();
    if (sub && !REGION_SUBDOMAIN_BLOCKLIST.has(sub)) return sub.toLowerCase();
  }

  return null;
}

export function isRegionSubdomainHost() {
  return !!getRegionSlugFromHostname();
}

export function isActiveRegionSubdomainForSlug(slug) {
  const hostSlug = getRegionSlugFromHostname();
  const pathSlug = String(slug || '').trim().toLowerCase();
  return !!hostSlug && hostSlug === pathSlug;
}

/** 지역 내부 링크 prefix: 서브도메인이면 '', 아니면 /ulsan */
export function getRegionPathPrefix(regionId, slug) {
  const pathSlug = String(slug || regionId || '').trim().toLowerCase();
  if (!pathSlug) return '';
  if (isActiveRegionSubdomainForSlug(pathSlug)) return '';
  return `/${encodeURIComponent(pathSlug)}`;
}

/**
 * @param {string} regionId - canonical id
 * @param {string} [subPath] - e.g. '/board' or 'board'
 * @param {{ slug?: string }} [options]
 */
export function buildRegionPath(regionId, subPath = '', options = {}) {
  const sub = normalizeSubPath(subPath);
  const slug = String(options.slug || regionId || '').trim().toLowerCase();
  if (!slug) return '/region';
  const prefix = getRegionPathPrefix(regionId, slug);
  if (!prefix) return sub || '/';
  return `${prefix}${sub}`;
}

export function buildLegacyRegionPath(regionId, subPath = '') {
  const id = encodeURIComponent(String(regionId || '').trim());
  const sub = normalizeSubPath(subPath);
  return `/r/${id}${sub}`;
}

/** slug 또는 id로 지역 매칭 */
export function resolveRegionFromKey(key, regions) {
  const raw = String(key || '').trim();
  if (!raw) return null;
  const lower = decodeURIComponent(raw).toLowerCase();

  for (const region of regions || []) {
    const id = String(region.id || region.regionId || region.region_id || '').trim();
    const slug = getRegionSlug(region);
    if (id === raw || id.toLowerCase() === lower || slug === lower) {
      return {
        region,
        regionId: id,
        slug: slug || id.toLowerCase(),
      };
    }
  }

  return { region: null, regionId: raw, slug: lower };
}

/** pathname에서 지역 세그먼트 이후 suffix */
export function stripRegionPrefixFromPathname(pathname, { regionId, slug } = {}) {
  const path = String(pathname || '');
  const pathSlug = String(slug || regionId || '').trim().toLowerCase();
  const id = String(regionId || '').trim();

  if (isActiveRegionSubdomainForSlug(pathSlug)) {
    return path === '/' ? '' : path;
  }

  const shortPrefix = `/${encodeURIComponent(pathSlug)}`;
  if (path === shortPrefix || path === `${shortPrefix}/`) return '';
  if (path.startsWith(`${shortPrefix}/`)) return path.slice(shortPrefix.length);

  const legacyId = `/r/${encodeURIComponent(id)}`;
  const legacySlug = `/r/${encodeURIComponent(pathSlug)}`;
  for (const prefix of [legacyId, legacySlug, `/r/${id}`, `/r/${pathSlug}`]) {
    if (path === prefix || path === `${prefix}/`) return '';
    if (path.startsWith(`${prefix}/`)) return path.slice(prefix.length);
  }

  return null;
}

export function parseRegionPathname(pathname) {
  const path = String(pathname || '');

  const legacy = path.match(/^\/r\/([^/]+)(\/.*)?$/);
  if (legacy) {
    return {
      mode: 'legacy',
      regionKey: decodeURIComponent(legacy[1]),
      suffix: legacy[2] || '',
    };
  }

  const hostSlug = getRegionSlugFromHostname();
  if (hostSlug) {
    const suffix = path === '/' ? '' : path;
    return { mode: 'subdomain', regionKey: hostSlug, suffix };
  }

  const short = path.match(/^\/([^/]+)(\/.*)?$/);
  if (short && !isReservedRegionPathSegment(short[1])) {
    return {
      mode: 'short',
      regionKey: decodeURIComponent(short[1]),
      suffix: short[2] || '',
    };
  }

  return null;
}
