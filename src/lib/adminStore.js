/**
 * 관리자 콘솔 상태 관리 (localStorage 기반)
 * - 관리자 인증
 * - 지역/상점/미션/이벤트/오디션/공지/방송/회원 CRUD
 */

// ============ Import ============
import { getMembers as authGetMembers, upsertMember } from "./authStore";

// ============ 스토리지 키 상수 ============
const KEYS = {
  ADMIN_AUTH: "su_admin_isAdmin",
  REGIONS: "su_regions",
  SHOPS: "su_shops",
  MISSIONS: "su_missions",
  EVENTS: "su_events",
  AUDITIONS: "su_auditions",
  NOTICES: "su_notices",
  BROADCASTS: "su_broadcasts",
  BANNERS: "su_banners",
  USERS: "su_users",
};

// ============ 유틸리티 함수 ============
const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const getFromStorage = (key, defaultValue = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    // ★ SSOT 이벤트 디스패치: AdminDashboard 등에서 자동 새로고침
    try {
      window.dispatchEvent(new CustomEvent('su:ssot:changed', {
        detail: { key, action: 'update', timestamp: Date.now() }
      }));
    } catch (e) {
      console.warn('[adminStore] Failed to dispatch SSOT event:', e);
    }
    return true;
  } catch {
    return false;
  }
};

const normalizeNoticeRegionIds = (notice) => {
  if (Array.isArray(notice?.regionIds)) return notice.regionIds;
  if (Array.isArray(notice?.regions)) return notice.regions;
  if (notice?.regionId) return [String(notice.regionId).trim()].filter(Boolean);
  return [];
};

const normalizeNoticeRecord = (notice) => {
  if (!notice || typeof notice !== 'object') return null;
  const regionIds = normalizeNoticeRegionIds(notice);
  return {
    ...notice,
    id: notice.id ?? notice.noticeId ?? notice.notice_id ?? null,
    scope: notice.scope || notice.regionScope || 'ALL',
    regionId: notice.regionId ?? notice.region_id ?? regionIds[0] ?? null,
    regionIds,
    regions: regionIds,
    isPinned: !!notice.isPinned,
    isPublic: notice.isPublic !== false,
    status: notice.status || 'ACTIVE',
    createdAt: notice.createdAt || notice.created_at || new Date().toISOString(),
    updatedAt: notice.updatedAt || notice.updated_at || notice.createdAt || notice.created_at || new Date().toISOString(),
  };
};

const normalizeMissionRecord = (mission) => {
  if (!mission || typeof mission !== 'object') return null;
  const regionIds = Array.isArray(mission.regionIds)
    ? mission.regionIds.map((value) => String(value || '').trim()).filter(Boolean)
    : (mission.regionId ? [String(mission.regionId).trim()].filter(Boolean) : []);
  const regionScope = String(mission.regionScope || (regionIds.length > 0 ? 'REGION' : 'ALL')).trim().toUpperCase();
  return {
    ...mission,
    id: mission.id ?? mission.missionId ?? mission.mission_id ?? null,
    regionScope,
    regionIds,
    regionId: mission.regionId ?? mission.region_id ?? regionIds[0] ?? null,
    regionName: mission.regionName ?? mission.region_name ?? (regionScope === 'ALL' ? '전체 지역' : null),
    createdAt: mission.createdAt || mission.created_at || new Date().toISOString(),
    updatedAt: mission.updatedAt || mission.updated_at || mission.createdAt || mission.created_at || new Date().toISOString(),
  };
};

const normalizeEventRecord = (event) => {
  if (!event || typeof event !== 'object') return null;
  const regionIds = Array.isArray(event.regionIds)
    ? event.regionIds.map((value) => String(value || '').trim()).filter(Boolean)
    : (Array.isArray(event.region_ids)
      ? event.region_ids.map((value) => String(value || '').trim()).filter(Boolean)
      : ((event.regionId ?? event.region_id) ? [String(event.regionId ?? event.region_id).trim()].filter(Boolean) : []));
  const regionScope = String(event.regionScope || event.region_scope || (regionIds.length > 0 ? 'REGION' : 'ALL')).trim().toUpperCase();
  return {
    ...event,
    id: event.id ?? event.eventId ?? event.event_id ?? null,
    regionScope,
    regionIds,
    regionId: event.regionId ?? event.region_id ?? regionIds[0] ?? null,
    regionName: event.regionName ?? event.region_name ?? (regionScope === 'ALL' ? '전체 지역' : null),
    createdAt: event.createdAt || event.created_at || new Date().toISOString(),
    updatedAt: event.updatedAt || event.updated_at || event.createdAt || event.created_at || new Date().toISOString(),
  };
};

export const readNoticeCache = () => {
  const raw = getFromStorage(KEYS.NOTICES, []);
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeNoticeRecord).filter(Boolean);
};

export const writeNoticeCache = (notices) => {
  const normalized = Array.isArray(notices)
    ? notices.map(normalizeNoticeRecord).filter((item) => item?.id)
    : [];
  saveToStorage(KEYS.NOTICES, normalized);
  return normalized;
};

export const mergeNoticeCache = (notice) => {
  const normalized = normalizeNoticeRecord(notice);
  if (!normalized?.id) return readNoticeCache();
  const next = readNoticeCache();
  const index = next.findIndex((item) => item.id === normalized.id);
  if (index >= 0) next[index] = { ...next[index], ...normalized };
  else next.unshift(normalized);
  return writeNoticeCache(next);
};

export const removeNoticeFromCache = (noticeId) => {
  const next = readNoticeCache().filter((item) => item.id !== noticeId);
  return writeNoticeCache(next);
};

// 모바일 클라이언트 보호: 로컬에 남아있는 오래된 adminStore 데이터를 모바일에서 우선적으로 서버 SSOT로 갱신합니다.
// - 최소한의 변경으로 모바일이 로컬 데이터를 바로 보여주는 문제를 완화합니다.
// - 브라우저 환경이고 모바일 User-Agent로 판단될 때만 동작합니다.
try {
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
    const ua = navigator.userAgent || '';
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua);
    if (isMobileUA) {
      (async () => {
        try {
          const adapter = await import('./storageAdapter');
          // 서버에서 미션/이벤트를 우선 가져와 로컬을 갱신 (비동기, 실패해도 무시)
          const [missions, events] = await Promise.allSettled([
            adapter.getMissions(),
            adapter.getEvents()
          ]);
          if (missions.status === 'fulfilled' && Array.isArray(missions.value)) {
            saveToStorage(KEYS.MISSIONS, missions.value);
          }
          if (events.status === 'fulfilled' && Array.isArray(events.value)) {
            let mergedEvents = events.value;
            try {
              const regions = await adapter.getRegions().catch(() => []);
              const regionEventGroups = await Promise.all(
                (Array.isArray(regions) ? regions : []).map(async (region) => {
                  const regionId = String(region?.id || region?.regionId || region?.region_id || '').trim();
                  if (!regionId) return [];
                  const result = await adapter.getRegionEvents(regionId).catch(() => []);
                  const list = Array.isArray(result?.events) ? result.events : (Array.isArray(result) ? result : []);
                  return list.map((item) => ({
                    ...item,
                    regionScope: 'REGION',
                    regionId: item?.regionId || item?.region_id || regionId,
                    regionIds: [String(item?.regionId || item?.region_id || regionId)].filter(Boolean),
                    regionName: item?.regionName || item?.region_name || region?.name || '',
                  }));
                })
              );
              const seen = new Set((Array.isArray(mergedEvents) ? mergedEvents : []).map((item) => String(item?.id ?? item?.eventId ?? item?.event_id ?? '')).filter(Boolean));
              for (const item of regionEventGroups.flat()) {
                const nextId = String(item?.id ?? item?.eventId ?? item?.event_id ?? '');
                if (!nextId || seen.has(nextId)) continue;
                seen.add(nextId);
                mergedEvents.push(item);
              }
            } catch (error) {
              console.warn('[adminStore] mobile region events merge failed:', error);
            }
            saveToStorage(KEYS.EVENTS, mergedEvents.map(normalizeEventRecord).filter(Boolean));
          }
          try { window.dispatchEvent(new CustomEvent('su:ssot:changed', { detail: { key: 'mobile:initial-sync', timestamp: Date.now() } })); } catch (e) {}
        } catch (e) {
          console.warn('[adminStore] mobile SSOT sync failed:', e);
        }
      })();
    }
  }
} catch (e) {}

// 날짜 기반 상태 자동 계산
export const calculateStatus = (startDate, endDate) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  if (start && now < start) return "scheduled"; // 예정
  if (end && now > end) return "ended"; // 종료
  return "ongoing"; // 진행중
};

export const getStatusLabel = (status) => {
  const labels = {
    scheduled: "예정",
    ongoing: "진행중",
    ended: "종료",
  };
  return labels[status] || status;
};

export const getStatusColor = (status) => {
  const colors = {
    scheduled: "#3b82f6",
    ongoing: "#22c55e",
    ended: "#6b7280",
  };
  return colors[status] || "#6b7280";
};

// ============ 관리자 인증 ============
export const isAdminAuthenticated = () => {
  try {
    return localStorage.getItem(KEYS.ADMIN_AUTH) === "true";
  } catch {
    return false;
  }
};

export const adminLogin = async (password) => {
  try {
    const response = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (data.ok) {
      localStorage.setItem(KEYS.ADMIN_AUTH, "true");
      if (data.token) {
        localStorage.setItem('su_admin_token', data.token);
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error('[adminLogin] Server auth failed:', error);
    return false;
  }
};

export const adminLogout = () => {
  localStorage.removeItem(KEYS.ADMIN_AUTH);
};

// ============ 지역(Region) CRUD ============
// 초기 시드 데이터 (처음 한 번만 생성)
const initRegions = () => {
  const existing = getFromStorage(KEYS.REGIONS, null);
  if (existing === null) {
    // ✅ PRODUCTION: 하드코딩 샘플 제거, 서버 DB가 SSOT
    saveToStorage(KEYS.REGIONS, []);
    return [];
  }
  return existing;
};

export const getRegions = () => {
  initRegions();
  // SSOT: storageAdapter가 서버에서 먼저 로드 후 localStorage 캐싱
  // 레거시 폴백 제거 (서버 우선 정책)
  return getFromStorage(KEYS.REGIONS, []);
};

export const getPublicRegions = () => {
  const regions = getRegions();
  return regions.filter((r) => {
    // isPublic 또는 isRegistered가 true인 경우 공개
    // 둘 다 없으면 기본적으로 공개(true)로 처리
    if (typeof r.isPublic === "boolean") return r.isPublic;
    if (typeof r.isRegistered === "boolean") return r.isRegistered;
    return true; // 기본값: 공개
  });
};

export const getRegionById = (id) => {
  return getRegions().find((r) => r.id === id);
};

export const createRegion = async (data) => {
  const regions = getRegions();
  if (regions.length >= 50) {
    return { success: false, error: "최대 50개 지역까지만 등록 가능합니다." };
  }
  const newRegion = {
    id: generateId(),
    name: data.name || "",
    province: data.province || "",
    intro: data.intro || "",
    aptHouseholds: parseInt(data.aptHouseholds) || 0,
    avgSalePrice: data.avgSalePrice || "",
    trafficInfo: data.trafficInfo || "",
    tourSpots: Array.isArray(data.tourSpots) ? data.tourSpots : [],
    festivals: Array.isArray(data.festivals) ? data.festivals : [],
    isPublic: data.isPublic ?? false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  try {
    const storageAdapter = await import('./storageAdapter');
    await storageAdapter.upsertRegion(newRegion);
  } catch (err) {
    console.error('[createRegion] Server sync failed:', err);
  }
  
  regions.push(newRegion);
  saveToStorage(KEYS.REGIONS, regions);
  return { success: true, data: newRegion };
};

export const updateRegion = async (id, data) => {
  const regions = getRegions();
  const index = regions.findIndex((r) => r.id === id);
  if (index === -1) {
    return { success: false, error: "지역을 찾을 수 없습니다." };
  }
  regions[index] = {
    ...regions[index],
    ...data,
    aptHouseholds: parseInt(data.aptHouseholds) || regions[index].aptHouseholds,
    tourSpots: Array.isArray(data.tourSpots) ? data.tourSpots : regions[index].tourSpots,
    festivals: Array.isArray(data.festivals) ? data.festivals : regions[index].festivals,
    updatedAt: new Date().toISOString(),
  };
  
  try {
    const storageAdapter = await import('./storageAdapter');
    await storageAdapter.upsertRegion(regions[index]);
  } catch (err) {
    console.error('[updateRegion] Server sync failed:', err);
  }
  
  saveToStorage(KEYS.REGIONS, regions);
  return { success: true, data: regions[index] };
};

export const deleteRegion = async (id, option = "unlink") => {
  // option: "delete" = 연결 데이터도 삭제, "unlink" = 연결 해제(regionId를 null로)
  try {
    const storageAdapter = await import('./storageAdapter');
    await storageAdapter.deleteRegion(id);
  } catch (err) {
    console.error('[deleteRegion] Server sync failed:', err);
  }
  
  const regions = getRegions();
  const filtered = regions.filter((r) => r.id !== id);
  saveToStorage(KEYS.REGIONS, filtered);

  if (option === "delete") {
    // 연결된 데이터 삭제
    saveToStorage(KEYS.SHOPS, getShops().filter((s) => s.regionId !== id));
    saveToStorage(KEYS.MISSIONS, getMissions().filter((m) => m.regionId !== id));
    saveToStorage(KEYS.EVENTS, getEvents().filter((e) => e.regionId !== id));
    saveToStorage(KEYS.AUDITIONS, getAuditions().filter((a) => a.regionId !== id));
  } else {
    // 연결 해제 (regionId를 null로)
    saveToStorage(KEYS.SHOPS, getShops().map((s) => s.regionId === id ? { ...s, regionId: null } : s));
    saveToStorage(KEYS.MISSIONS, getMissions().map((m) => m.regionId === id ? { ...m, regionId: null } : m));
    saveToStorage(KEYS.EVENTS, getEvents().map((e) => e.regionId === id ? { ...e, regionId: null } : e));
    saveToStorage(KEYS.AUDITIONS, getAuditions().map((a) => a.regionId === id ? { ...a, regionId: null } : a));
  }

  return { success: true };
};

export const toggleRegionPublic = (id) => {
  const regions = getRegions();
  const region = regions.find((r) => r.id === id);
  if (region) {
    region.isPublic = !region.isPublic;
    region.updatedAt = new Date().toISOString();
    saveToStorage(KEYS.REGIONS, regions);
    return { success: true, isPublic: region.isPublic };
  }
  return { success: false };
};

// ============ 상점(Shop) CRUD ============
const initShops = () => {
  const existing = getFromStorage(KEYS.SHOPS, null);
  if (existing === null) {
    saveToStorage(KEYS.SHOPS, []);
    return [];
  }
  return existing;
};

export const getShops = () => {
  initShops();
  return getFromStorage(KEYS.SHOPS, []);
};

export const getApprovedVisibleShops = (regionId = null) => {
  let shops = getShops().filter((s) => s.status === "approved" && s.isVisible);
  if (regionId) {
    shops = shops.filter((s) => s.regionId === regionId || s.regionId === null);
  }
  return shops;
};

export const getShopById = (id) => {
  return getShops().find((s) => s.id === id);
};

export const createShop = async (data) => {
  const shops = getShops();
  const newShop = {
    id: generateId(),
    name: data.name || "",
    category: data.category || "",
    description: data.description || "",
    owner: data.owner || "",
    phone: data.phone || "",
    address: data.address || "",
    thumbnail: data.thumbnail || "",
    regionId: data.regionId || null,
    status: data.status || "pending",
    isVisible: data.isVisible ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  try {
    const storageAdapter = await import('./storageAdapter');
    await storageAdapter.upsertShop(newShop);
  } catch (err) {
    console.error('[createShop] Server sync failed:', err);
  }
  
  shops.push(newShop);
  saveToStorage(KEYS.SHOPS, shops);
  return { success: true, data: newShop };
};

export const updateShop = async (id, data) => {
  const shops = getShops();
  const index = shops.findIndex((s) => s.id === id);
  if (index === -1) {
    return { success: false, error: "상점을 찾을 수 없습니다." };
  }
  shops[index] = {
    ...shops[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  
  try {
    const storageAdapter = await import('./storageAdapter');
    await storageAdapter.upsertShop(shops[index]);
  } catch (err) {
    console.error('[updateShop] Server sync failed:', err);
  }
  
  saveToStorage(KEYS.SHOPS, shops);
  return { success: true, data: shops[index] };
};

export const deleteShop = async (id) => {
  try {
    const storageAdapter = await import('./storageAdapter');
    await storageAdapter.deleteShop(id);
  } catch (err) {
    console.error('[deleteShop] Server sync failed:', err);
  }
  
  const shops = getShops().filter((s) => s.id !== id);
  saveToStorage(KEYS.SHOPS, shops);
  return { success: true };
};

export const setShopStatus = (id, status) => {
  return updateShop(id, { status });
};

export const toggleShopVisibility = (id) => {
  const shop = getShopById(id);
  if (shop) {
    return updateShop(id, { isVisible: !shop.isVisible });
  }
  return { success: false };
};

// ============ 미션(Mission) CRUD ============
const initMissions = () => {
  const existing = getFromStorage(KEYS.MISSIONS, null);
  if (existing === null) {
    // ✅ PRODUCTION: 하드코딩 샘플 제거, 서버 DB가 SSOT
    saveToStorage(KEYS.MISSIONS, []);
    return [];
  }
  return existing;
};

export const getMissions = () => {
  initMissions();
  const missions = getFromStorage(KEYS.MISSIONS, []);
  if (!Array.isArray(missions)) return [];
  return missions.map(normalizeMissionRecord).filter(Boolean);
};

export const getActiveMissions = (regionId = null) => {
  let missions = getMissions().filter((m) => {
    if (!m.isActive) return false;
    const status = calculateStatus(m.startDate, m.endDate);
    return status === "ongoing";
  });
  if (regionId) {
    missions = missions.filter((m) => {
      const missionRegionIds = Array.isArray(m.regionIds) ? m.regionIds.map(String) : [];
      return String(m.regionId || '') === String(regionId) || missionRegionIds.includes(String(regionId)) || m.regionId === null;
    });
  }
  return missions;
};

export const getMissionById = (id) => {
  return getMissions().find((m) => m.id === id);
};

export const createMission = async (data) => {
  const missions = getMissions();
  const newMission = {
    id: generateId(),
    title: data.title || "",
    description: data.description || "",
    category: data.category || "general",
    points: parseInt(data.points) || 0,
    regionScope: data.regionScope || "ALL",
    regionIds: data.regionIds || [],
    regionId: data.regionId || null,
    startDate: data.startDate || "",
    endDate: data.endDate || "",
    isActive: data.isActive ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  try {
    const storageAdapter = await import('./storageAdapter');
    await storageAdapter.upsertMission(newMission);
  } catch (err) {
    console.error('[createMission] Server sync failed:', err);
  }
  
  missions.push(newMission);
  saveToStorage(KEYS.MISSIONS, missions);
  return { success: true, data: newMission };
};

export const updateMission = async (id, data) => {
  const missions = getMissions();
  const index = missions.findIndex((m) => m.id === id);
  if (index === -1) {
    return { success: false, error: "미션을 찾을 수 없습니다." };
  }
  missions[index] = {
    ...missions[index],
    ...data,
    points: parseInt(data.points) || missions[index].points,
    updatedAt: new Date().toISOString(),
  };
  
  try {
    const storageAdapter = await import('./storageAdapter');
    await storageAdapter.upsertMission(missions[index]);
  } catch (err) {
    console.error('[updateMission] Server sync failed:', err);
  }
  
  saveToStorage(KEYS.MISSIONS, missions);
  return { success: true, data: missions[index] };
};

export const deleteMission = async (id) => {
  try {
    const storageAdapter = await import('./storageAdapter');
    await storageAdapter.deleteMission(id);
  } catch (err) {
    console.error('[deleteMission] Server sync failed:', err);
  }
  
  const missions = getMissions().filter((m) => m.id !== id);
  saveToStorage(KEYS.MISSIONS, missions);
  return { success: true };
};

export const toggleMissionActive = (id) => {
  const mission = getMissionById(id);
  if (mission) {
    return updateMission(id, { isActive: !mission.isActive });
  }
  return { success: false };
};

// ============ 이벤트(Event) CRUD ============
const initEvents = () => {
  const existing = getFromStorage(KEYS.EVENTS, null);
  if (existing === null) {
    // ✅ PRODUCTION: 하드코딩 샘플 제거, 서버 DB가 SSOT
    saveToStorage(KEYS.EVENTS, []);
    return [];
  }
  return existing;
};

export const getEvents = () => {
  initEvents();
  const events = getFromStorage(KEYS.EVENTS, []);
  if (!Array.isArray(events)) return [];
  return events.map(normalizeEventRecord).filter(Boolean);
};

export const getActiveEvents = (regionId = null) => {
  let events = getEvents().filter((e) => {
    if (!e.isActive) return false;
    const status = calculateStatus(e.startDate, e.endDate);
    return status === "ongoing";
  });
  if (regionId) {
    events = events.filter((e) => {
      const eventRegionIds = Array.isArray(e.regionIds) ? e.regionIds.map(String) : [];
      return String(e.regionId || '') === String(regionId) || eventRegionIds.includes(String(regionId)) || e.regionId === null;
    });
  }
  return events;
};

export const getEventById = (id) => {
  return getEvents().find((e) => e.id === id);
};

export const createEvent = async (data) => {
  const events = getEvents();
  const newEvent = {
    id: generateId(),
    title: data.title || "",
    description: data.description || "",
    category: data.category || "general",
    points: parseInt(data.points) || 0,
    regionScope: data.regionScope || "ALL",
    regionIds: data.regionIds || [],
    regionId: data.regionId || null,
    startDate: data.startDate || "",
    endDate: data.endDate || "",
    isActive: data.isActive ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  try {
    const storageAdapter = await import('./storageAdapter');
    await storageAdapter.upsertEvent(newEvent);
  } catch (err) {
    console.error('[createEvent] Server sync failed:', err);
  }
  
  events.push(newEvent);
  saveToStorage(KEYS.EVENTS, events);
  return { success: true, data: newEvent };
};

export const updateEvent = async (id, data) => {
  const events = getEvents();
  const index = events.findIndex((e) => e.id === id);
  if (index === -1) {
    return { success: false, error: "이벤트를 찾을 수 없습니다." };
  }
  events[index] = {
    ...events[index],
    ...data,
    points: parseInt(data.points) || events[index].points,
    updatedAt: new Date().toISOString(),
  };
  
  try {
    const storageAdapter = await import('./storageAdapter');
    await storageAdapter.upsertEvent(events[index]);
  } catch (err) {
    console.error('[updateEvent] Server sync failed:', err);
  }
  
  saveToStorage(KEYS.EVENTS, events);
  return { success: true, data: events[index] };
};

export const deleteEvent = async (id) => {
  try {
    const storageAdapter = await import('./storageAdapter');
    await storageAdapter.deleteEvent(id);
  } catch (err) {
    console.error('[deleteEvent] Server sync failed:', err);
  }
  
  const events = getEvents().filter((e) => e.id !== id);
  saveToStorage(KEYS.EVENTS, events);
  return { success: true };
};

export const toggleEventActive = (id) => {
  const event = getEventById(id);
  if (event) {
    return updateEvent(id, { isActive: !event.isActive });
  }
  return { success: false };
};

// ============ 오디션(Audition) CRUD ============
const initAuditions = () => {
  const existing = getFromStorage(KEYS.AUDITIONS, null);
  if (existing === null) {
    saveToStorage(KEYS.AUDITIONS, []);
    return [];
  }
  return existing;
};

export const getAuditions = () => {
  initAuditions();
  return getFromStorage(KEYS.AUDITIONS, []);
};

export const getActiveAuditions = (regionId = null) => {
  let auditions = getAuditions().filter((a) => {
    const status = calculateStatus(a.startDate, a.endDate);
    return status === "ongoing";
  });
  if (regionId) {
    auditions = auditions.filter((a) => a.regionId === regionId || a.regionId === null);
  }
  return auditions;
};

export const getAuditionById = (id) => {
  return getAuditions().find((a) => a.id === id);
};

export const createAudition = async (data) => {
  const auditions = getAuditions();
  const newAudition = {
    id: generateId(),
    title: data.title || "",
    description: data.description || "",
    regionId: data.regionId || null,
    startDate: data.startDate || "",
    endDate: data.endDate || "",
    eventDate: data.eventDate || "",
    isActive: data.isActive ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  try {
    const storageAdapter = await import('./storageAdapter');
    await storageAdapter.upsertAudition(newAudition);
  } catch (err) {
    console.error('[createAudition] Server sync failed:', err);
  }
  
  auditions.push(newAudition);
  saveToStorage(KEYS.AUDITIONS, auditions);
  return { success: true, data: newAudition };
};

export const updateAudition = async (id, data) => {
  const auditions = getAuditions();
  const index = auditions.findIndex((a) => a.id === id);
  if (index === -1) {
    return { success: false, error: "오디션을 찾을 수 없습니다." };
  }
  auditions[index] = {
    ...auditions[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  
  try {
    const storageAdapter = await import('./storageAdapter');
    await storageAdapter.upsertAudition(auditions[index]);
  } catch (err) {
    console.error('[updateAudition] Server sync failed:', err);
  }
  
  saveToStorage(KEYS.AUDITIONS, auditions);
  return { success: true, data: auditions[index] };
};

export const deleteAudition = async (id) => {
  try {
    const storageAdapter = await import('./storageAdapter');
    await storageAdapter.deleteAudition(id);
  } catch (err) {
    console.error('[deleteAudition] Server sync failed:', err);
  }
  
  const auditions = getAuditions().filter((a) => a.id !== id);
  saveToStorage(KEYS.AUDITIONS, auditions);
  return { success: true };
};

// ============ 공지사항(Notice) CRUD ============
// 초기 시드 데이터 (처음 한 번만 생성)
const initNotices = () => {
  const existing = getFromStorage(KEYS.NOTICES, null);
  if (existing === null) {
    // 서버 DB가 SSOT이며 로컬은 마지막 서버 응답 미러만 유지한다.
    saveToStorage(KEYS.NOTICES, []);
    return [];
  }
  return Array.isArray(existing) ? writeNoticeCache(existing) : [];
};

export const getNotices = () => {
  initNotices();
  return readNoticeCache();
};

export const getPublicNotices = () => {
  return getNotices()
    .filter((n) => n.isPublic)
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
};

export const getNoticeById = (id) => {
  return getNotices().find((n) => n.id === id);
};

export const createNotice = async (data) => {
  const newNotice = {
    title: data.title || "",
    content: data.content || "",
    isPinned: data.isPinned ?? false,
    isPublic: data.isPublic ?? true,
    scope: data.scope || data.regionScope || "ALL",
    regions: (() => {
      if (Array.isArray(data.regions) && data.regions.length) return data.regions;
      if (Array.isArray(data.regionIds) && data.regionIds.length) return data.regionIds;
      if (data.regionId) {
        const cleaned = String(data.regionId).trim();
        if (cleaned && cleaned !== 'undefined' && cleaned !== 'null') {
          return [cleaned];
        }
      }
      return [];
    })(),
    status: data.status || 'ACTIVE',
  };

  const storageAdapter = await import('./storageAdapter');
  const result = await storageAdapter.createNotice(newNotice);
  const createdNotice = mergeNoticeCache({ ...newNotice, id: result?.id || newNotice.id });
  const saved = createdNotice.find((item) => item.id === (result?.id || newNotice.id)) || null;
  return { success: true, data: saved };
};

export const updateNotice = async (id, data) => {
  const updatedData = { ...data };
  if ('regionId' in updatedData || 'regions' in updatedData || 'regionIds' in updatedData) {
    updatedData.regions = (() => {
      if (Array.isArray(updatedData.regions) && updatedData.regions.length) return updatedData.regions;
      if (Array.isArray(updatedData.regionIds) && updatedData.regionIds.length) return updatedData.regionIds;
      if (updatedData.regionId) {
        const cleaned = String(updatedData.regionId).trim();
        if (cleaned && cleaned !== 'undefined' && cleaned !== 'null') {
          return [cleaned];
        }
      }
      return [];
    })();
  }

  const storageAdapter = await import('./storageAdapter');
  const result = await storageAdapter.updateNotice(id, updatedData);
  const merged = mergeNoticeCache({ ...(getNoticeById(id) || { id }), ...updatedData, id, updatedAt: result?.updatedAt || new Date().toISOString() });
  return { success: true, data: merged.find((item) => item.id === id) || null };
};

export const deleteNotice = async (id) => {
  const storageAdapter = await import('./storageAdapter');
  await storageAdapter.deleteNotice(id);
  removeNoticeFromCache(id);
  return { success: true };
};

// ============ 공유방송(Broadcast) CRUD ============
const initBroadcasts = () => {
  const existing = getFromStorage(KEYS.BROADCASTS, null);
  if (existing === null) {
    saveToStorage(KEYS.BROADCASTS, []);
    return [];
  }
  return existing;
};

export const getBroadcasts = () => {
  initBroadcasts();
  return getFromStorage(KEYS.BROADCASTS, []);
};

export const getPublicBroadcasts = (regionId = null) => {
  let broadcasts = getBroadcasts().filter((b) => b.isPublic);
  if (regionId) {
    broadcasts = broadcasts.filter((b) => b.regionId === regionId || b.regionId === null);
  }
  return broadcasts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getBroadcastById = (id) => {
  return getBroadcasts().find((b) => b.id === id);
};

export const createBroadcast = async (data) => {
  const broadcasts = getBroadcasts();
  const newBroadcast = {
    id: generateId(),
    title: data.title || "",
    videoUrl: data.videoUrl || "",
    thumbnail: data.thumbnail || "",
    description: data.description || "",
    regionId: data.regionId || null,
    isPublic: data.isPublic ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  try {
    const storageAdapter = await import('./storageAdapter');
    await storageAdapter.upsertBroadcast(newBroadcast);
  } catch (err) {
    console.error('[createBroadcast] Server sync failed:', err);
  }
  
  broadcasts.push(newBroadcast);
  saveToStorage(KEYS.BROADCASTS, broadcasts);
  return { success: true, data: newBroadcast };
};

export const updateBroadcast = async (id, data) => {
  const broadcasts = getBroadcasts();
  const index = broadcasts.findIndex((b) => b.id === id);
  if (index === -1) {
    return { success: false, error: "방송을 찾을 수 없습니다." };
  }
  broadcasts[index] = {
    ...broadcasts[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  
  try {
    const storageAdapter = await import('./storageAdapter');
    await storageAdapter.upsertBroadcast(broadcasts[index]);
  } catch (err) {
    console.error('[updateBroadcast] Server sync failed:', err);
  }
  
  saveToStorage(KEYS.BROADCASTS, broadcasts);
  return { success: true, data: broadcasts[index] };
};

export const deleteBroadcast = async (id) => {
  try {
    const storageAdapter = await import('./storageAdapter');
    await storageAdapter.deleteBroadcast(id);
  } catch (err) {
    console.error('[deleteBroadcast] Server sync failed:', err);
  }
  
  const broadcasts = getBroadcasts().filter((b) => b.id !== id);
  saveToStorage(KEYS.BROADCASTS, broadcasts);
  return { success: true };
};

// ============ 배너(Banner) CRUD ============
const initBanners = () => {
  const existing = getFromStorage(KEYS.BANNERS, null);
  if (existing === null) {
    saveToStorage(KEYS.BANNERS, []);
    return [];
  }
  return existing;
};

export const getBanners = () => {
  initBanners();
  return getFromStorage(KEYS.BANNERS, []);
};

export const getPublicBanners = (regionId = null) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // 날짜만 비교 (시간 무시)
  
  let banners = getBanners().filter((b) => {
    if (!b.isActive) return false;
    
    // 날짜 필터링
    if (b.startDate) {
      const start = new Date(b.startDate);
      start.setHours(0, 0, 0, 0);
      if (start > now) return false;
    }
    if (b.endDate) {
      const end = new Date(b.endDate);
      end.setHours(23, 59, 59, 999);
      if (end < now) return false;
    }
    
    return true;
  });
  
  // 지역 필터링
  if (regionId) {
    banners = banners.filter((b) => 
      !b.regions || b.regions.length === 0 || b.regions.includes(regionId)
    );
  }
  
  // 정렬: priority 높은 순 → createdAt 최신 순
  banners.sort((a, b) => {
    const priorityA = a.priority || 0;
    const priorityB = b.priority || 0;
    if (priorityA !== priorityB) {
      return priorityB - priorityA;
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  
  return banners;
};

export const getBannerById = (id) => {
  return getBanners().find((b) => b.id === id);
};

export const createBanner = async (data) => {
  const banners = getBanners();
  const newBanner = {
    id: generateId(),
    imageUrl: data.imageUrl || "",
    alt: data.alt || "",
    linkUrl: data.linkUrl || "",
    regions: Array.isArray(data.regions) ? data.regions : [],
    startDate: data.startDate || null,
    endDate: data.endDate || null,
    isActive: data.isActive ?? true,
    priority: parseInt(data.priority) || 0,
    weight: parseInt(data.weight) || 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  try {
    const storageAdapter = await import('./storageAdapter');
    await storageAdapter.createBanner(newBanner);
  } catch (err) {
    console.error('[createBanner] Server sync failed:', err);
  }
  
  banners.push(newBanner);
  saveToStorage(KEYS.BANNERS, banners);
  return { success: true, data: newBanner };
};

export const updateBanner = async (id, data) => {
  const banners = getBanners();
  const index = banners.findIndex((b) => b.id === id);
  if (index === -1) {
    return { success: false, error: "배너를 찾을 수 없습니다." };
  }
  banners[index] = {
    ...banners[index],
    ...data,
    priority: data.priority !== undefined ? parseInt(data.priority) || 0 : banners[index].priority,
    weight: data.weight !== undefined ? parseInt(data.weight) || 100 : banners[index].weight,
    regions: Array.isArray(data.regions) ? data.regions : banners[index].regions,
    updatedAt: new Date().toISOString(),
  };
  
  // Validate that at least one updatable field is present
  if (!data || Object.keys(data).length === 0) {
    console.warn('[updateBanner] no update fields provided for id:', id);
    return { success: false, error: 'no fields to update' };
  }

  // Build explicit update payload with allowed fields only
  const allowed = ['imageUrl','alt','linkUrl','regions','startDate','endDate','isActive','priority','weight'];
  const updates = {};
  for (const k of allowed) {
    if (Object.prototype.hasOwnProperty.call(data, k)) updates[k] = data[k];
  }

  try {
    const storageAdapter = await import('./storageAdapter');
    await storageAdapter.patchBanner(id, updates);
  } catch (err) {
    console.error('[updateBanner] Server sync failed:', err);
  }
  
  saveToStorage(KEYS.BANNERS, banners);
  return { success: true, data: banners[index] };
};

export const deleteBanner = async (id) => {
  try {
    const storageAdapter = await import('./storageAdapter');
    await storageAdapter.deleteBanner(id);
  } catch (err) {
    console.error('[deleteBanner] Server sync failed:', err);
  }
  
  const banners = getBanners().filter((b) => b.id !== id);
  saveToStorage(KEYS.BANNERS, banners);
  return { success: true };
};

// ============ 회원(User) CRUD ============
const initUsers = () => {
  const existing = getFromStorage(KEYS.USERS, null);
  
  // ★ 테스트 유저 없이 빈 배열로 시작 (실제 회원가입만 표시)
  if (existing === null) {
    console.log("[initUsers] Initializing empty users array...");
    saveToStorage(KEYS.USERS, []);
    return [];
  }
  
  console.log("[initUsers] Returning existing users:", existing?.length);
  return existing;
};

export const getUsers = () => {
  // ★ SSOT: authStore.getMembers()가 서버 원천 데이터
  // authStore의 MEMBERS_KEY(su_members_v1)에서 회원 목록을 가져옴 (서버 → 캐시)
  try {
    const membersRaw = localStorage.getItem("su_members_v1");
    if (membersRaw) {
      const members = JSON.parse(membersRaw);
      if (members && members.length > 0) {
        // su_users도 동기화 (하위 호환)
        saveToStorage(KEYS.USERS, members);
        return members;
      }
    }
  } catch (e) {
    console.error("getUsers members sync error:", e);
  }
  
  // fallback: 기존 su_users 데이터 (서버에서 로드 후 캐시된 데이터)
  initUsers();
  return getFromStorage(KEYS.USERS, []);
};

// ============ 회원 데이터 단일 소스(getMembers) ============
export const getMembers = () => {
  // authStore의 getMembers()를 단일 소스로 사용
  return authGetMembers();
};

// ★ 회원 데이터 리셋 (테스트 유저 전체 삭제)
export const resetUsers = () => {
  console.log("[resetUsers] Clearing all users...");
  saveToStorage(KEYS.USERS, []);
  // SSOT: 서버 API 호출로 삭제해야 함 (localStorage 직접 제거 금지)
  return [];
};

// ★ 회원 전체 삭제 (관리자용)
export const clearAllUsers = () => {
  console.log("[clearAllUsers] Removing all users...");
  saveToStorage(KEYS.USERS, []);
  // SSOT: 서버 API 호출로 삭제해야 함 (localStorage 직접 제거 금지)
  return { success: true, message: "모든 회원이 삭제되었습니다." };
};

export const getUserById = (id) => {
  return getUsers().find((u) => u.id === id);
};

export const updateUser = async (id, data) => {
  // Server-first update: only update by id on server, then reflect server response locally
  if (id === undefined || id === null || String(id).trim() === '') {
    console.warn('[updateUser] invalid id:', id);
    return { success: false, error: 'invalid member id' };
  }
  if (!data || Object.keys(data).length === 0) {
    console.warn('[updateUser] no update fields provided for id:', id);
    return { success: false, error: 'no fields to update' };
  }
  try {
    const storageAdapter = await import('./storageAdapter');
    const memberId = id;
    const res = await storageAdapter.updateMemberById(memberId, data);
    // res.member or res.memberId may be returned
    const serverMember = res.member || res;

    const resolvedId = serverMember?.memberId || serverMember?.member_id || serverMember?.id || serverMember?.email;
    if (!resolvedId) {
      console.error('[updateUser] server returned no member record:', res);
      return { success: false, error: 'server returned no member record' };
    }

    // Update local su_members_v1 to match server authoritative state
    // SSOT: 서버 응답을 localStorage에 캐싱 (서버 → 캐시 동기화)
    try {
      const membersRaw = localStorage.getItem('su_members_v1');
      const members = membersRaw ? JSON.parse(membersRaw) : [];
      const idx = members.findIndex(m => (m.memberId === memberId) || (m.id === memberId) || (m.email === memberId));
      const normalized = {
        id: resolvedId,
        memberId: serverMember.memberId || serverMember.member_id || serverMember.id,
        name: serverMember.name || '',
        email: serverMember.email || '',
        phone: serverMember.phone || '',
        status: (serverMember.status || '').toUpperCase(),
        role: serverMember.role || '',
        supplyManager: serverMember.supplyManager !== undefined ? serverMember.supplyManager : (serverMember.supply_manager !== undefined ? !!serverMember.supply_manager : false),
        memo: serverMember.memo || '',
        updatedAt: serverMember.updatedAt || serverMember.updated_at || new Date().toISOString(),
        createdAt: serverMember.createdAt || serverMember.created_at || new Date().toISOString(),
      };
      if (idx >= 0) {
        members[idx] = { ...members[idx], ...normalized };
      } else {
        members.push(normalized);
      }
      localStorage.setItem('su_members_v1', JSON.stringify(members));
      // dispatch SSOT change event so UI reloads from server-cached data
      try { window.dispatchEvent(new CustomEvent('su:ssot:changed')); } catch (e) {}
    } catch (e) {
      console.error('[updateUser] local sync failed:', e);
    }

    // If currently logged-in user, update auth copy
    try {
      const authRaw = localStorage.getItem('su_auth_v2');
      if (authRaw) {
        const auth = JSON.parse(authRaw);
        if (auth.memberId === memberId || auth.id === memberId) {
          const updatedAuth = { 
            ...auth, 
            ...data, 
            role: serverMember.role || auth.role,
            supplyManager: serverMember.supplyManager !== undefined ? serverMember.supplyManager : (serverMember.supply_manager !== undefined ? !!serverMember.supply_manager : auth.supplyManager)
          };
          localStorage.setItem('su_auth_v2', JSON.stringify(updatedAuth));
        }
      }
    } catch (e) {
      console.error('[updateUser] update auth copy failed:', e);
    }

    return { success: true, data: serverMember, serverSynced: true };
  } catch (err) {
    console.error('[updateUser] Server update failed:', err);
    return { success: false, error: err.message || String(err) };
  }
};

export const setUserStatus = (id, status) => {
  console.log("[setUserStatus] Changing status for id:", id, "to:", status);
  return updateUser(id, { status });
};

export const setUserMemo = (id, memo) => {
  return updateUser(id, { memo });
};

// 삭제: 여러 회원을 삭제 (관리자용)
export const deleteUsers = (ids = []) => {
  try {
    const users = getUsers();
    const idSet = new Set(ids.map(String));
    const filtered = users.filter((u) => !idSet.has(String(u.id)) && !idSet.has(String(u.memberId)));
    saveToStorage(KEYS.USERS, filtered);

    // su_members_v1 원천 데이터도 동기화: id 또는 memberId 매칭 항목 제거
    // SSOT: 실제로는 서버 API 호출로 삭제 후 캐시 업데이트해야 함
    try {
      const raw = localStorage.getItem('su_members_v1');
      if (raw) {
        const members = JSON.parse(raw) || [];
        const kept = members.filter((m) => !idSet.has(String(m.id)) && !idSet.has(String(m.memberId)));
        localStorage.setItem('su_members_v1', JSON.stringify(kept));
      }
    } catch (e) {
      // noop
    }

    return { success: true, deleted: users.length - filtered.length };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

// ★ 회원 추가 (회원가입 시 호출)
export const createUser = (userData) => {
  const users = getUsers();
  
  // 중복 체크 (memberId 또는 phone으로)
  const existingByMemberId = users.find(u => u.memberId === userData.memberId);
  const existingByPhone = users.find(u => u.phone === userData.phone);
  
  if (existingByMemberId || existingByPhone) {
    // 이미 존재하면 업데이트
    const existingId = existingByMemberId?.id || existingByPhone?.id;
    return updateUser(existingId, {
      ...userData,
      updatedAt: new Date().toISOString(),
    });
  }
  
  // 새 회원 추가
  const newUser = {
    id: generateId(),
    memberId: userData.memberId,
    name: userData.name || "",
    nickname: userData.nickname || "",
    email: userData.email || "",
    phone: userData.phone || "",
    region: userData.region || "",
    regionId: userData.regionId || null,
    status: userData.status || "pending",
    points: 0,
    memo: "",
    createdAt: userData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  saveToStorage(KEYS.USERS, users);
  return { success: true, data: newUser };
};

// ★ 회원 조회 (memberId로)
export const getUserByMemberId = (memberId) => {
  return getUsers().find((u) => u.memberId === memberId);
};

// ★ 회원 조회 (phone으로)
export const getUserByPhone = (phone) => {
  return getUsers().find((u) => u.phone === phone);
};

// ★ 기존 회원가입 데이터 동기화 (su_auth_v2 → su_users)
export const syncAuthToUsers = () => {
  try {
    // 후보 키 순차 탐색: 기존 su_auth_v2 우선, 이후 호환 후보들
    const candidates = ["su_auth_v2", "su_auth_v1", "su_session_v1", "auth", "session", "currentUser"];
  let authKey = null;
  let authRaw = null;
  let synced = 0;

    // 1) 후보 키 직접 확인
    for (const k of candidates) {
      const v = localStorage.getItem(k);
      if (v) {
        authKey = k;
        authRaw = v;
        break;
      }
    }

    // 2) 못 찾았으면 localStorage의 모든 키 중 'auth' 또는 'session' 포함 키를 찾음
    if (!authRaw) {
      try {
        const keys = Object.keys(localStorage || {});
        const found = keys.find(k => {
          const lk = k.toLowerCase();
          return lk.includes("auth") || lk.includes("session");
        });
        if (found) {
          authKey = found;
          authRaw = localStorage.getItem(found);
        }
      } catch (e) {
        // ignore
      }
    }

    // 진단 로그는 1회만 출력
    if (!window.__syncAuthToUsersDiagDone) {
      console.log("[syncAuthToUsers] authKey:", authKey, "authRaw:", authRaw);
      window.__syncAuthToUsersDiagDone = true;
    }

    if (!authRaw) {
      // 기존 동작과 동일
      console.log("[syncAuthToUsers] No auth data found");
      return { synced: 0 };
    }
    
    let auth = null;
    try { auth = JSON.parse(authRaw); } catch (e) { auth = null; }
    console.log("[syncAuthToUsers] parsed auth:", auth);

    if (!auth || !auth.memberId) {
      console.log("[syncAuthToUsers] Invalid auth data");
      return { synced: 0 };
    }

    // su_members_v1에 최소 멤버 정보 upsert (중복 방지: upsertMember 내부 처리)
    try {
      const status = String(auth.status || auth.status || "ACTIVE").toUpperCase();
      const joinedAt = auth.createdAt || auth.signedAt || new Date().toISOString();
      const memberForUpsert = {
        id: auth.memberId,
        memberId: auth.memberId,
        status,
        name: auth.name || "",
        email: auth.email || auth.userId || "",
        phone: auth.phone || "",
        role: auth.role || "USER",
        createdAt: joinedAt,
        updatedAt: new Date().toISOString(),
      };
  upsertMember(memberForUpsert);
  synced = 1;
      if (!window.__syncAuthToUsersDiagDoneUpsert) {
        console.log("[syncAuthToUsers][UPSERT] upserted member:", memberForUpsert);
        window.__syncAuthToUsersDiagDoneUpsert = true;
      }
    } catch (e) {
      // ignore upsert errors, continue existing flow
      console.error('[syncAuthToUsers][UPSERT] error:', e);
    }
    
    // 이미 존재하는지 확인
    const existing = getUserByMemberId(auth.memberId) || getUserByPhone(auth.phone);
    console.log("[syncAuthToUsers] existing user:", existing);
    
      if (existing) {
      // 이미 있으면 업데이트만
      const result = updateUser(existing.id, {
        name: auth.name || existing.name,
        nickname: auth.nickname || existing.nickname,
        phone: auth.phone || existing.phone,
        region: auth.region || existing.region,
        regionId: auth.regionId || existing.regionId,
      });
      console.log("[syncAuthToUsers] updated existing user:", result);
      return { synced, updated: 1 };
    }
    
    // 새로 추가
    const result = createUser({
      memberId: auth.memberId,
      name: auth.name || "",
      nickname: auth.nickname || "",
      phone: auth.phone || "",
      region: auth.region || "",
      regionId: auth.regionId || null,
      status: auth.status || "pending",
      createdAt: auth.createdAt || new Date().toISOString(),
    });
    console.log("[syncAuthToUsers] created new user:", result);
    
    return { synced, created: result };
  } catch (e) {
    console.error("syncAuthToUsers error:", e);
    return { synced: 0, error: e.message };
  }
};

// ============ 통계 ============
export const getAdminStats = () => {
  return {
    regions: {
      total: getRegions().length,
      public: getPublicRegions().length,
    },
    shops: {
      total: getShops().length,
      approved: getShops().filter((s) => s.status === "approved").length,
      pending: getShops().filter((s) => s.status === "pending").length,
    },
    missions: {
      total: getMissions().length,
      active: getMissions().filter((m) => m.isActive && calculateStatus(m.startDate, m.endDate) === "ongoing").length,
    },
    events: {
      total: getEvents().length,
      active: getEvents().filter((e) => e.isActive && calculateStatus(e.startDate, e.endDate) === "ongoing").length,
    },
    auditions: {
      total: getAuditions().length,
      active: getActiveAuditions().length,
    },
    notices: {
      total: getNotices().length,
      public: getPublicNotices().length,
    },
    broadcasts: {
      total: getBroadcasts().length,
      public: getPublicBroadcasts().length,
    },
    users: {
      total: getUsers().length,
      active: getUsers().filter((u) => u.status === "active").length,
    },
  };
};
