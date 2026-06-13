const NOTICE_POPUP_DISMISS_PREFIX = 'su:notice-popup:dismissed';

export function getNoticePopupViewerKey() {
  try {
    const memberId = String(window.__SU_SESSION__?.memberId || '').trim();
    if (memberId) return memberId;
  } catch (e) {
    // noop
  }
  return 'guest';
}

export function getNoticePopupStorageKey() {
  return `${NOTICE_POPUP_DISMISS_PREFIX}:${getNoticePopupViewerKey()}`;
}

export function getNoticePopupToken(item) {
  const noticeId = String(item?.id || item?.noticeId || item?.notice_id || '').trim();
  if (!noticeId) return '';
  const version = String(item?.updatedAt || item?.updated_at || item?.createdAt || item?.created_at || '').trim();
  return version ? `${noticeId}:${version}` : noticeId;
}

/** KST 기준 YYYY-MM-DD (오늘 하루 그만보기 자정 기준) */
export function getKstDateKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function readDismissedNoticesMap() {
  try {
    const raw = localStorage.getItem(getNoticePopupStorageKey());
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (e) {
    return {};
  }
}

export function isNoticeDismissedForToday(item) {
  const token = getNoticePopupToken(item);
  if (!token) return false;
  const map = readDismissedNoticesMap();
  return map[token] === getKstDateKey();
}

export function dismissNoticeForToday(item) {
  const token = getNoticePopupToken(item);
  if (!token) return;
  const today = getKstDateKey();
  const map = readDismissedNoticesMap();
  const nextMap = {};
  Object.entries(map).forEach(([key, dateKey]) => {
    if (dateKey === today) nextMap[key] = dateKey;
  });
  nextMap[token] = today;
  try {
    localStorage.setItem(getNoticePopupStorageKey(), JSON.stringify(nextMap));
  } catch (e) {
    // noop
  }
}

export function isPopupEnabled(item) {
  const camel = item?.isPopup;
  const snake = item?.is_popup;
  const raw = camel !== undefined ? camel : snake;
  if (raw === true || raw === 1) return true;
  const normalized = String(raw || '').trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'y' || normalized === 'yes';
}

export function resolveNoticeImageUrl(item) {
  const raw = String(item?.imageUrl || item?.image_url || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw) || raw.startsWith('data:')) return raw;
  const base = import.meta.env.VITE_API_BASE || '';
  return `${base}${raw}`;
}
