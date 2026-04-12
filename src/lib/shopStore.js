/**
 * 상점 전용 포인트 원장 및 정산 요청 스토어 (서버 API 기반)
 * !! 중요: PV3 UX 호환성을 위해 PV3와 동일한 인터페이스 유지하되,
 *    내부적으로는 storageAdapter를 통해 서버 API를 호출합니다.
 * 
 * PV3 localStorage → 현재 프로젝트 서버 DB 변환 레이어
 */

import * as storageAdapter from './storageAdapter';

const generateId = () => `sple_${Date.now()}_${Math.random().toString(36).substr(2,9)}`;
const PAYOUT_MIGRATION_PREFIX = 'su:payout:migration';
const LEGACY_PAYOUT_KEY_HINT = /(payout|정산|withdraw|request|요청)/i;
const LEGACY_PAYOUT_KEYS = [
  'shopPayoutRequests',
  'shop_payout_requests',
  'payoutRequests',
  'shopAllRequests',
  'shopRequestHistory',
  'shopStorePayoutRequests',
];

const safeJsonParse = (value, fallback = null) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
};

const toIso = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString();
};

const normalizePayoutRequestKey = ({ shopId, amount, requestedAt, requesterId }) => {
  return [
    String(shopId || '').trim(),
    String(Number(amount) || 0),
    toIso(requestedAt),
    String(requesterId || '').trim(),
  ].join('::');
};

const getMigrationCompleteKey = (shopId) => `${PAYOUT_MIGRATION_PREFIX}:complete:${String(shopId || '').trim()}`;
const getMigrationLockKey = (shopId) => `${PAYOUT_MIGRATION_PREFIX}:lock:${String(shopId || '').trim()}`;
const getMigrationTombstoneKey = (shopId) => `${PAYOUT_MIGRATION_PREFIX}:tombstone:${String(shopId || '').trim()}`;
const getMigrationAuditKey = (shopId) => `${PAYOUT_MIGRATION_PREFIX}:audit:${String(shopId || '').trim()}`;

const readTombstones = (shopId) => {
  if (typeof window === 'undefined') return new Set();
  const parsed = safeJsonParse(window.localStorage.getItem(getMigrationTombstoneKey(shopId)) || '[]', []);
  return new Set(Array.isArray(parsed) ? parsed.map((v) => String(v)) : []);
};

const writeTombstones = (shopId, tombstones) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(getMigrationTombstoneKey(shopId), JSON.stringify(Array.from(tombstones)));
};

const extractArrayPayload = (parsed) => {
  if (Array.isArray(parsed)) return { list: parsed, containerType: 'array', containerKey: null };
  if (!parsed || typeof parsed !== 'object') return { list: [], containerType: null, containerKey: null };
  const candidates = ['requests', 'payoutRequests', 'items', 'rows', 'list', 'data'];
  for (const key of candidates) {
    if (Array.isArray(parsed[key])) {
      return { list: parsed[key], containerType: 'object-array', containerKey: key };
    }
  }
  return { list: [], containerType: null, containerKey: null };
};

const normalizeLegacyPayout = (entry, context = {}) => {
  const shopId = String(entry?.shopId || entry?.storeId || entry?.shop_id || entry?.store_id || context.shopId || '').trim();
  const amount = Number(entry?.amount || 0);
  if (!shopId || !Number.isFinite(amount) || amount <= 0) return null;
  const requestedAt =
    entry?.requestedAt ||
    entry?.requested_at ||
    entry?.createdAt ||
    entry?.created_at ||
    entry?.requestTime ||
    entry?.timestamp ||
    new Date().toISOString();
  const requesterId = String(
    entry?.requesterId ||
      entry?.ownerMemberId ||
      entry?.memberId ||
      entry?.owner_id ||
      context.requesterId ||
      ''
  ).trim();

  return {
    ...entry,
    shopId,
    amount,
    requestedAt,
    requesterId,
    bankName: String(entry?.bankName || entry?.bank_name || '').trim(),
    accountNumber: String(entry?.accountNumber || entry?.account_number || '').trim(),
    depositorName: String(entry?.depositorName || entry?.depositor_name || '').trim(),
    memo: String(entry?.memo || '').trim(),
    ownerName: String(entry?.ownerName || entry?.owner_name || '').trim(),
    storeName: String(entry?.storeName || entry?.store_name || '').trim(),
    status: String(entry?.status || 'PENDING').toUpperCase(),
  };
};

const readLegacyPayoutRecords = (shopId, requesterId = '') => {
  if (typeof window === 'undefined') return [];
  const targetShopId = String(shopId || '').trim();
  const keys = new Set(LEGACY_PAYOUT_KEYS);
  try {
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (!key) continue;
      if (LEGACY_PAYOUT_KEY_HINT.test(key)) keys.add(key);
    }
  } catch (error) {}

  const normalized = [];
  keys.forEach((storageKey) => {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;
    const parsed = safeJsonParse(raw, null);
    const extracted = extractArrayPayload(parsed);
    if (!Array.isArray(extracted.list) || extracted.list.length === 0) return;
    extracted.list.forEach((item, index) => {
      const row = normalizeLegacyPayout(item, { shopId: targetShopId, requesterId });
      if (!row) return;
      if (String(row.shopId || '').trim() !== targetShopId) return;
      const recordKey = normalizePayoutRequestKey(row);
      normalized.push({
        ...row,
        _recordKey: recordKey,
        _storageKey: storageKey,
        _index: index,
        _containerType: extracted.containerType,
        _containerKey: extracted.containerKey,
      });
    });
  });

  return normalized;
};

const removeMigratedLegacyEntries = (shopId, migratedEntries = []) => {
  if (typeof window === 'undefined' || !Array.isArray(migratedEntries) || migratedEntries.length === 0) return;
  const grouped = new Map();
  migratedEntries.forEach((entry) => {
    const key = String(entry?._storageKey || '').trim();
    if (!key) return;
    const indices = grouped.get(key) || new Set();
    indices.add(Number(entry?._index));
    grouped.set(key, indices);
  });

  grouped.forEach((indexSet, storageKey) => {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;
    const parsed = safeJsonParse(raw, null);
    const extracted = extractArrayPayload(parsed);
    if (!Array.isArray(extracted.list) || extracted.list.length === 0) return;

    const nextList = extracted.list.filter((_, idx) => !indexSet.has(idx));
    if (extracted.containerType === 'array') {
      window.localStorage.setItem(storageKey, JSON.stringify(nextList));
      return;
    }
    if (extracted.containerType === 'object-array' && parsed && typeof parsed === 'object' && extracted.containerKey) {
      const nextParsed = { ...parsed, [extracted.containerKey]: nextList };
      window.localStorage.setItem(storageKey, JSON.stringify(nextParsed));
    }
  });
};

const mapLegacyToDisplayRequest = (entry) => ({
  requestId: `LEGACY_${entry._recordKey}`,
  request_id: `LEGACY_${entry._recordKey}`,
  shopId: entry.shopId,
  shop_id: entry.shopId,
  amount: entry.amount,
  bankName: entry.bankName,
  bank_name: entry.bankName,
  accountNumber: entry.accountNumber,
  account_number: entry.accountNumber,
  depositorName: entry.depositorName,
  depositor_name: entry.depositorName,
  memo: entry.memo,
  status: entry.status || 'PENDING',
  requestedAt: entry.requestedAt,
  requested_at: entry.requestedAt,
  requesterId: entry.requesterId,
  ownerMemberId: entry.requesterId,
  _legacy: true,
  _recordKey: entry._recordKey,
});

export const loadUnifiedShopPayoutRequests = async (shopId, options = {}) => {
  const resolvedShopId = String(shopId || '').trim();
  const requesterId = String(options?.requesterId || '').trim();
  if (!resolvedShopId) {
    return { requests: [], serverRequests: [], pendingLocal: [], migrationComplete: true, migratedCount: 0, failedCount: 0 };
  }

  const serverRes = await storageAdapter.getShopPayoutRequests(resolvedShopId).catch(() => ({ requests: [] }));
  let serverRequests = Array.isArray(serverRes?.requests) ? serverRes.requests : [];
  const serverKeySet = new Set(
    serverRequests.map((entry) =>
      normalizePayoutRequestKey({
        shopId: entry?.shop_id || entry?.shopId || resolvedShopId,
        amount: entry?.amount,
        requestedAt: entry?.requested_at || entry?.requestedAt || entry?.created_at || entry?.createdAt,
        requesterId: entry?.requester_id || entry?.requesterId || entry?.owner_member_id || entry?.ownerMemberId || '',
      })
    )
  );

  if (typeof window === 'undefined') {
    return { requests: serverRequests, serverRequests, pendingLocal: [], migrationComplete: true, migratedCount: 0, failedCount: 0 };
  }

  const completeKey = getMigrationCompleteKey(resolvedShopId);
  const lockKey = getMigrationLockKey(resolvedShopId);
  const auditKey = getMigrationAuditKey(resolvedShopId);
  const migrationComplete = window.localStorage.getItem(completeKey) === '1';
  const tombstones = readTombstones(resolvedShopId);
  const legacyAll = readLegacyPayoutRecords(resolvedShopId, requesterId).filter((entry) => !tombstones.has(entry._recordKey));

  if (migrationComplete) {
    return { requests: serverRequests, serverRequests, pendingLocal: [], migrationComplete: true, migratedCount: 0, failedCount: 0 };
  }

  const migrationInProgress = window.localStorage.getItem(lockKey) === '1';
  const candidates = legacyAll.filter((entry) => !serverKeySet.has(entry._recordKey));
  const migrated = [];
  const failed = [];

  if (!migrationInProgress && candidates.length > 0) {
    window.localStorage.setItem(lockKey, '1');
    try {
      for (const entry of candidates) {
        if (!entry.bankName || !entry.accountNumber || !entry.depositorName) {
          failed.push({ ...entry, _error: 'missing-bank-info' });
          continue;
        }
        try {
          const createRes = await storageAdapter.createShopPayoutRequest(resolvedShopId, {
            amount: entry.amount,
            bankName: entry.bankName,
            accountNumber: entry.accountNumber,
            depositorName: entry.depositorName,
            memo: entry.memo || '',
            storeName: entry.storeName || '',
            ownerName: entry.ownerName || '',
          });
          if (createRes && (createRes.ok === true || createRes.success === true)) {
            migrated.push(entry);
            serverKeySet.add(entry._recordKey);
            tombstones.add(entry._recordKey);
          } else {
            failed.push({ ...entry, _error: createRes?.error || 'upload-failed' });
          }
        } catch (error) {
          failed.push({ ...entry, _error: error?.message || 'upload-error' });
        }
      }
    } finally {
      window.localStorage.removeItem(lockKey);
    }
  }

  if (migrated.length > 0) {
    removeMigratedLegacyEntries(resolvedShopId, migrated);
    writeTombstones(resolvedShopId, tombstones);
    const refreshed = await storageAdapter.getShopPayoutRequests(resolvedShopId).catch(() => ({ requests: [] }));
    serverRequests = Array.isArray(refreshed?.requests) ? refreshed.requests : serverRequests;
  }

  const remainingLegacy = readLegacyPayoutRecords(resolvedShopId, requesterId).filter((entry) => {
    if (tombstones.has(entry._recordKey)) return false;
    if (serverKeySet.has(entry._recordKey)) return false;
    return true;
  });

  const mergedMap = new Map();
  serverRequests.forEach((entry) => {
    const key = normalizePayoutRequestKey({
      shopId: entry?.shop_id || entry?.shopId || resolvedShopId,
      amount: entry?.amount,
      requestedAt: entry?.requested_at || entry?.requestedAt || entry?.created_at || entry?.createdAt,
      requesterId: entry?.requester_id || entry?.requesterId || entry?.owner_member_id || entry?.ownerMemberId || '',
    });
    if (!mergedMap.has(key)) mergedMap.set(key, entry);
  });

  remainingLegacy.forEach((entry) => {
    if (!mergedMap.has(entry._recordKey)) {
      mergedMap.set(entry._recordKey, mapLegacyToDisplayRequest(entry));
    }
  });

  const mergedRequests = Array.from(mergedMap.values()).sort((left, right) => {
    const leftTime = new Date(left?.requested_at || left?.requestedAt || left?.created_at || left?.createdAt || 0).getTime();
    const rightTime = new Date(right?.requested_at || right?.requestedAt || right?.created_at || right?.createdAt || 0).getTime();
    return rightTime - leftTime;
  });

  if (remainingLegacy.length === 0) {
    window.localStorage.setItem(completeKey, '1');
  }

  window.localStorage.setItem(
    auditKey,
    JSON.stringify({
      at: new Date().toISOString(),
      shopId: resolvedShopId,
      migratedCount: migrated.length,
      failedCount: failed.length,
      remainingLocalCount: remainingLegacy.length,
    })
  );

  return {
    requests: mergedRequests,
    serverRequests,
    pendingLocal: remainingLegacy,
    migrationComplete: remainingLegacy.length === 0,
    migratedCount: migrated.length,
    failedCount: failed.length,
  };
};

/**
 * 동기 API를 유지하기 위한 캐시 (PV3 호환성)
 * 실제 데이터는 비동기 로드 후 캐시에 저장하여 동기 접근 가능
 */
let shopEarnedCache = {}; // shopId -> {earned, available, requests}
let shopAllRequestsCache = []; // 전체 정산 요청 목록
let shopLedgerCache = {}; // shopId -> ledger[]

/**
 * PV3 호환: 동기 함수들 (캐시에서 읽기)
 * 실제 로드는 My.jsx의 useEffect에서 비동기로 수행
 */
export const getShopPointLedger = () => {
  return shopLedgerCache;
};

export const getPayoutRequests = (filter = {}) => {
  // 캐시에서 읽기 (필터 적용)
  if (!filter || Object.keys(filter).length === 0) return shopAllRequestsCache;
  return shopAllRequestsCache.filter(r => {
    for (const k of Object.keys(filter)) {
      if (r[k] !== filter[k]) return false;
    }
    return true;
  });
};

export const getStoreEarns = (storeId) => {
  // 서버에서는 earnedTotal만 제공하므로 배열 반환 불가능
  // PV3 호환을 위해 빈 배열 반환
  return [];
};

export const getStorePayouts = (storeId) => {
  return [];
};

export const getStoreTotalEarned = (storeId) => {
  const cached = shopEarnedCache[storeId];
  return cached ? (cached.earned || 0) : 0;
};

export const getStoreTotalPayouts = (storeId) => {
  // 서버에서 available = earned - paid - pending으로 계산하므로
  // paid는 earned - available - pending으로 역산 가능
  // 하지만 PV3 호환성을 위해 0 반환 (My.jsx에서 직접 사용하지 않음)
  return 0;
};

export const getStorePendingRequestsTotal = (storeId) => {
  const requests = shopAllRequestsCache.filter(r => r.storeId === storeId && r.status === 'PENDING');
  return requests.reduce((s, r) => s + (r.amount || 0), 0);
};

export const getStoreAvailableForPayout = (storeId) => {
  const cached = shopEarnedCache[storeId];
  return cached ? (cached.available || 0) : 0;
};

/**
 * 서버 API를 통한 데이터 로드 (비동기)
 * My.jsx의 useEffect에서 호출하여 캐시 업데이트
 */
export const loadShopPointsData = async (shopId) => {
  try {
    const [earnedResult, availableResult, ledgerResult, requestsResult] = await Promise.allSettled([
      storageAdapter.getShopEarnedPoints(shopId),
      storageAdapter.getShopAvailablePoints(shopId),
      storageAdapter.getShopPointLedger(shopId, { limit: 20 }),
      loadUnifiedShopPayoutRequests(shopId),
    ]);

    const earnedRes = earnedResult.status === 'fulfilled' ? earnedResult.value : null;
    const availableRes = availableResult.status === 'fulfilled' ? availableResult.value : null;
    const ledgerRes = ledgerResult.status === 'fulfilled' ? ledgerResult.value : null;
    const requestsRes = requestsResult.status === 'fulfilled' ? requestsResult.value : null;
    
    const data = {
      earned: earnedRes?.totalEarned || earnedRes?.total || 0,
      available: availableRes?.available || 0,
      ledger: ledgerRes?.ledger || [],
      requests: requestsRes?.requests || [],
    };
    
    shopEarnedCache[shopId] = data;
    shopLedgerCache[shopId] = data.ledger;
    return data;
  } catch (e) {
    console.error('[shopStore] loadShopPointsData error:', e);
    return { earned: 0, available: 0, ledger: [], requests: [] };
  }
};

/**
 * 전체 정산 요청 로드 (비동기)
 */
export const loadAllPayoutRequests = async (shopId) => {
  try {
    const res = await loadUnifiedShopPayoutRequests(shopId);
    shopAllRequestsCache = res?.requests || [];
    return shopAllRequestsCache;
  } catch (e) {
    console.error('[shopStore] loadAllPayoutRequests error:', e);
    shopAllRequestsCache = [];
    return [];
  }
};

/**
 * 상점 포인트 적립 (현재 프로젝트에서는 결제 시 자동 처리)
 * PV3 호환성을 위해 인터페이스만 유지
 */
export const appendShopEarn = ({ storeId, storeName, amount, sourceTxId, buyerMemberId = null, desc = '' }) => {
  // 서버에서는 결제 시 자동으로 shop_earnings 테이블에 추가됨
  // 클라이언트에서는 호출할 필요 없음
  console.warn('[shopStore] appendShopEarn는 서버에서 자동 처리됩니다.');
  return { success: true, skipped: true };
};

/**
 * 정산 요청 생성 (비동기 → 동기 래퍼)
 * PV3는 동기였으나, 현재는 비동기 필요
 * My.jsx에서 async/await로 호출해야 함
 */
export const createPayoutRequest = async ({ storeId, ownerMemberId, amount, bankName = '', accountNumber = '', depositorName = '', storeName = '', ownerName = '', memo = '' }) => {
  amount = parseInt(amount, 10) || 0;
  if (!storeId || !ownerMemberId || !amount || amount <= 0) {
    return { success: false, error: 'invalid' };
  }

  // 가용 잔액 확인 (캐시)
  const available = getStoreAvailableForPayout(storeId);
  if (amount > available) {
    return { success: false, error: 'insufficient' };
  }

  try {
    const res = await storageAdapter.createShopPayoutRequest(storeId, {
      amount,
      bankName,
      accountNumber,
      depositorName,
      memo,
    });

    if (res && (res.ok === true || res.success === true)) {
      // 캐시 업데이트
      await loadShopPointsData(storeId);
      return { success: true, data: res.request };
    } else {
      return { success: false, error: res.error || 'unknown' };
    }
  } catch (e) {
    console.error('[shopStore] createPayoutRequest error:', e);
    return { success: false, error: 'network' };
  }
};

/**
 * 관리자 전용: 정산 승인/반려
 * (현재 프로젝트에서는 Admin 페이지에서 서버 API 직접 호출)
 * PV3 호환성을 위해 인터페이스만 유지
 */
export const markPayoutPaid = (requestId, adminId = 'admin') => {
  console.warn('[shopStore] markPayoutPaid는 Admin 페이지에서 서버 API로 처리됩니다.');
  return { success: false, error: 'use_admin_page' };
};

export const markPayoutRejected = (requestId, adminId = 'admin', reason = '') => {
  console.warn('[shopStore] markPayoutRejected는 Admin 페이지에서 서버 API로 처리됩니다.');
  return { success: false, error: 'use_admin_page' };
};

export default {
  getShopPointLedger,
  getPayoutRequests,
  appendShopEarn,
  getStoreAvailableForPayout,
  getStoreTotalEarned,
  createPayoutRequest,
  markPayoutPaid,
  markPayoutRejected,
  loadShopPointsData, // 추가: 비동기 로드 함수
  loadAllPayoutRequests, // 추가: 전체 요청 로드
  loadUnifiedShopPayoutRequests,
};

/**
 * 상점 목록 조회 (My.jsx에서 검색에 사용)
 * storageAdapter를 통해 서버 API로 조회
 */
let cachedShops = [];
let shopsCacheTime = 0;
const CACHE_TTL = 60000; // 1분

export const getShops = () => {
  // 캠시 반환 (TTL 내에서만)
  if (cachedShops.length > 0 && Date.now() - shopsCacheTime < CACHE_TTL) {
    return cachedShops;
  }
  return cachedShops;
};

export const loadShops = async () => {
  try {
    const shops = await storageAdapter.getShops();
    cachedShops = shops || [];
    shopsCacheTime = Date.now();
    return cachedShops;
  } catch (e) {
    console.error('[shopStore] loadShops error:', e);
    return [];
  }
};
