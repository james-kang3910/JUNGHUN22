/**
 * syncManager.js - 서버 ↔ 로컬Storage 양방향 동기화
 * 
 * 역할:
 * 1. 앱 시작 시 서버 데이터를 로컬로 가져와 병합 (서버 우선)
 * 2. 로컬에만 있는 데이터를 서버로 업로드
 * 3. 중복 제거 및 데이터 정규화
 */

import * as storageAdapter from './storageAdapter';

const MEMBERS_KEY = 'su_members_v1';

/**
 * 로컬Storage에서 멤버 목록 읽기
 */
function getLocalMembers() {
  try {
    const raw = localStorage.getItem(MEMBERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('[syncManager] getLocalMembers error:', e);
    return [];
  }
}

/**
 * 로컬Storage에 멤버 목록 쓰기
 */
function setLocalMembers(members) {
  try {
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(members || []));
    // 하위 호환용 su_users도 업데이트
    localStorage.setItem('su_users', JSON.stringify(members || []));
    return true;
  } catch (e) {
    console.error('[syncManager] setLocalMembers error:', e);
    return false;
  }
}

/**
 * 멤버 고유 키 생성 (중복 판별용)
 */
function getMemberKey(member) {
  // 우선순위: email > phone > memberId > id
  return (
    member.email?.toLowerCase().trim() ||
    member.phone?.replace(/[^0-9]/g, '') ||
    member.memberId ||
    member.member_id ||
    member.id
  );
}

/**
 * 서버 멤버 데이터 → 로컬 형식으로 정규화
 */
function normalizeServerMember(serverMember) {
  return {
    id: serverMember.memberId || serverMember.member_id || serverMember.id || serverMember.email,
    memberId: serverMember.memberId || serverMember.member_id || serverMember.id,
    name: serverMember.name || '',
    nickname: serverMember.nickname || '',
    email: serverMember.email || '',
    phone: serverMember.phone || '',
    password: serverMember.password || '', // 서버에서 비밀번호는 반환하지 않을 수 있음
    region: serverMember.region || '',
    regionId: serverMember.regionId || serverMember.region_id || null,
    status: (serverMember.status || 'ACTIVE').toUpperCase(),
    role: serverMember.role || 'USER',
    points: serverMember.points || 0,
    memo: serverMember.memo || '',
    createdAt: serverMember.createdAt || serverMember.created_at || new Date().toISOString(),
    updatedAt: serverMember.updatedAt || serverMember.updated_at || new Date().toISOString(),
  };
}

/**
 * 로컬 멤버 데이터 → 서버 API 형식으로 변환
 */
function toServerFormat(localMember) {
  return {
    memberId: localMember.memberId || localMember.id,
    name: localMember.name,
    email: localMember.email,
    phone: localMember.phone,
    status: localMember.status,
    role: localMember.role,
    // password는 보안상 서버로 보내지 않음 (이미 서버에 있다고 가정)
  };
}

/**
 * 지역(Regions) 동기화 함수
 */
const REGIONS_KEY = 'su_regions';
const SHOPS_KEY = 'su_shops';
const MISSIONS_KEY = 'su_missions';
const EVENTS_KEY = 'su_events';

function getLocalRegions() {
  try {
    const raw = localStorage.getItem(REGIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('[syncManager] getLocalRegions error:', e);
    return [];
  }
}

function setLocalRegions(regions) {
  try {
    localStorage.setItem(REGIONS_KEY, JSON.stringify(regions || []));
    return true;
  } catch (e) {
    console.error('[syncManager] setLocalRegions error:', e);
    return false;
  }
}

function normalizeServerRegion(serverRegion) {
  return {
    id: serverRegion.regionId || serverRegion.region_id || serverRegion.id,
    name: serverRegion.name || '',
    province: serverRegion.province || '',
    intro: serverRegion.intro || '',
    aptHouseholds: serverRegion.aptHouseholds || serverRegion.apt_households || 0,
    avgSalePrice: serverRegion.avgSalePrice || serverRegion.avg_sale_price || '',
    trafficInfo: serverRegion.trafficInfo || serverRegion.traffic_info || '',
    tourSpots: typeof serverRegion.tourSpots === 'string' ? JSON.parse(serverRegion.tourSpots || '[]') : (serverRegion.tourSpots || serverRegion.tour_spots || []),
    festivals: typeof serverRegion.festivals === 'string' ? JSON.parse(serverRegion.festivals || '[]') : (serverRegion.festivals || []),
    isPublic: serverRegion.isPublic ?? serverRegion.is_public ?? false,
    createdAt: serverRegion.createdAt || serverRegion.created_at || new Date().toISOString(),
    updatedAt: serverRegion.updatedAt || serverRegion.updated_at || new Date().toISOString(),
  };
}

async function syncRegions() {
  // ❌ DEPRECATED: Server DB is SSOT, no localStorage → server sync allowed
  console.log('[syncManager] syncRegions disabled - server is single source of truth');
  return;
}

/**
 * Shops 동기화 함수
 */
function getLocalShops() {
  try {
    const raw = localStorage.getItem(SHOPS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('[syncManager] getLocalShops error:', e);
    return [];
  }
}

function setLocalShops(shops) {
  try {
    localStorage.setItem(SHOPS_KEY, JSON.stringify(shops || []));
    return true;
  } catch (e) {
    console.error('[syncManager] setLocalShops error:', e);
    return false;
  }
}

/**
 * 중복 업로드 방지: 로컬 전용 항목에 syncing 플래그 설정
 */
function markLocalItemAsSyncing(storageKey, itemId) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    const items = JSON.parse(raw);
    const item = items.find(i => i.id === itemId);
    if (item) {
      item._syncing = true;
      item._syncAttemptedAt = new Date().toISOString();
      localStorage.setItem(storageKey, JSON.stringify(items));
    }
  } catch (e) {
    console.error('[syncManager] markLocalItemAsSyncing error:', e);
  }
}

/**
 * 중복 업로드 방지: syncing 플래그 제거
 */
function clearSyncingFlag(storageKey, itemId) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    const items = JSON.parse(raw);
    const item = items.find(i => i.id === itemId);
    if (item) {
      delete item._syncing;
      delete item._syncAttemptedAt;
      localStorage.setItem(storageKey, JSON.stringify(items));
    }
  } catch (e) {
    console.error('[syncManager] clearSyncingFlag error:', e);
  }
}

function normalizeServerShop(serverShop) {
  return {
    id: serverShop.shopId || serverShop.shop_id || serverShop.id,
    name: serverShop.name || '',
    category: serverShop.category || '',
    location: serverShop.location || '',
    contact: serverShop.contact || '',
    description: serverShop.description || '',
    openHours: serverShop.openHours || serverShop.open_hours || '',
    images: typeof serverShop.images === 'string' ? JSON.parse(serverShop.images || '[]') : (serverShop.images || []),
    regionId: serverShop.regionId || serverShop.region_id || null,
    isPublic: serverShop.isPublic ?? serverShop.is_public ?? false,
    createdAt: serverShop.createdAt || serverShop.created_at || new Date().toISOString(),
    updatedAt: serverShop.updatedAt || serverShop.updated_at || new Date().toISOString(),
  };
}

async function syncShops() {
  // ❌ DEPRECATED: Server DB is SSOT, no localStorage → server sync allowed
  console.log('[syncManager] syncShops disabled - server is single source of truth');
  return;
}

/**
 * Missions 동기화 함수
 */
function getLocalMissions() {
  try {
    const raw = localStorage.getItem(MISSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('[syncManager] getLocalMissions error:', e);
    return [];
  }
}

function setLocalMissions(missions) {
  try {
    localStorage.setItem(MISSIONS_KEY, JSON.stringify(missions || []));
    return true;
  } catch (e) {
    console.error('[syncManager] setLocalMissions error:', e);
    return false;
  }
}

function normalizeServerMission(serverMission) {
  return {
    id: serverMission.missionId || serverMission.mission_id || serverMission.id,
    title: serverMission.title || '',
    type: serverMission.type || '',
    description: serverMission.description || '',
    points: serverMission.points || 0,
    dueDate: serverMission.dueDate || serverMission.due_date || '',
    region: serverMission.region || '',
    regionId: serverMission.regionId || serverMission.region_id || null,
    isActive: serverMission.isActive ?? serverMission.is_active ?? true,
    createdAt: serverMission.createdAt || serverMission.created_at || new Date().toISOString(),
    updatedAt: serverMission.updatedAt || serverMission.updated_at || new Date().toISOString(),
  };
}

async function syncMissions() {
  // ❌ DEPRECATED: Server DB is SSOT, no localStorage → server sync allowed
  console.log('[syncManager] syncMissions disabled - server is single source of truth');
  return;
}

/**
 * Events 동기화 함수
 */
function getLocalEvents() {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('[syncManager] getLocalEvents error:', e);
    return [];
  }
}

function setLocalEvents(events) {
  try {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events || []));
    return true;
  } catch (e) {
    console.error('[syncManager] setLocalEvents error:', e);
    return false;
  }
}

function normalizeServerEvent(serverEvent) {
  return {
    id: serverEvent.eventId || serverEvent.event_id || serverEvent.id,
    title: serverEvent.title || '',
    date: serverEvent.date || '',
    location: serverEvent.location || '',
    category: serverEvent.category || '',
    description: serverEvent.description || '',
    thumbnail: serverEvent.thumbnail || '',
    isActive: serverEvent.isActive ?? serverEvent.is_active ?? true,
    createdAt: serverEvent.createdAt || serverEvent.created_at || new Date().toISOString(),
    updatedAt: serverEvent.updatedAt || serverEvent.updated_at || new Date().toISOString(),
  };
}

async function syncEvents() {
  // ❌ DEPRECATED: Server DB is SSOT, no localStorage → server sync allowed
  console.log('[syncManager] syncEvents disabled - server is single source of truth');
  return;
}

/**
 * 앱 시작 시 서버 → 로컬 동기화 (서버 우선, 로컬 추가분은 서버로 업로드)
 */
export async function syncOnAppStart() {
  const startTime = Date.now();
  console.log('[syncManager] 동기화 시작...');

  try {
    // 1. 서버에서 멤버 목록 가져오기
    let serverMembers = [];
    try {
      serverMembers = await storageAdapter.getMembers();
      console.log('[syncManager] 서버에서 가져온 멤버:', serverMembers.length, '명');
    } catch (apiError) {
      console.warn('[syncManager] 서버 조회 실패 (로컬만 사용):', apiError.message);
      // 서버 연결 실패 시 로컬 데이터만 사용
      return { success: false, source: 'local-only', error: apiError.message };
    }

    // 2. 로컬 멤버 가져오기
    const localMembers = getLocalMembers();
    console.log('[syncManager] 로컬 멤버:', localMembers.length, '명');

    // 3. ❌ DEPRECATED: No localStorage → server upload allowed
    // Server DB is SSOT - only read from server, never push from localStorage
    const memberMap = new Map();

    // 서버 데이터만 사용 (정규화)
    serverMembers.forEach(sm => {
      const normalized = normalizeServerMember(sm);
      const key = getMemberKey(normalized);
      if (key) {
        memberMap.set(key, normalized);
      }
    });

    // 병합된 데이터를 로컬에 저장 (서버 데이터만)
    const mergedMembers = Array.from(memberMap.values());
    setLocalMembers(mergedMembers);

    const elapsed = Date.now() - startTime;
    console.log(`[syncManager] 동기화 완료 (${elapsed}ms) - 서버 멤버: ${mergedMembers.length}명`);

    // ❌ All entity syncs disabled - server is SSOT
    // syncRegions(), syncShops(), syncMissions(), syncEvents() are deprecated

    return {
      success: true,
      source: 'server-only',
      server: serverMembers.length,
      local: 0, // No local-only data used
      merged: mergedMembers.length,
      uploaded: 0, // No uploads from localStorage
    };
  } catch (error) {
    console.error('[syncManager] 동기화 오류:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 서버 우선 정책: 서버에 먼저 저장하고 성공 시 로컬 업데이트
 */
export async function upsertMemberServerFirst(memberData) {
  try {
    // 1. 서버에만 저장 (Server DB is SSOT)
    const result = await storageAdapter.upsertMember(toServerFormat(memberData));
    
    // 2. ❌ No localStorage update - server is single source of truth
    // Apps should re-fetch from server after mutations

    return { success: true, member: result };
  } catch (error) {
    console.error('[syncManager] upsertMemberServerFirst 실패:', error);
    return { success: false, error: error.message };
  }
}
