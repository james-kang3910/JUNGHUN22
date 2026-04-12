/**
 * supplyService.js - 보급지원 서비스
 * 
 * [DATA_POLICY 준수]
 * - 서버 DB: Single Source of Truth for 보급지원 데이터 (supplies 테이블)
 * - localStorage: SSOT 모드에서는 사용하지 않음 (fallback 금지)
 * - 쓰기/읽기: storageAdapter.* → 서버 DB 우선
 */

// Lightweight supply support service with server API fallback
import { getMemberById, upsertMember } from './authStore.js';
import * as storageAdapter from './storageAdapter.js';

const IS_TEST = Boolean(import.meta.env && import.meta.env.VITEST);
const STRICT_SSOT = (!IS_TEST && import.meta.env && import.meta.env.DEV)
  ? (localStorage.getItem('su_strict_ssot') !== 'false')
  : false;

function emitSupplyUpdated(detail) {
  try {
    window.dispatchEvent(new CustomEvent('supply:updated', { detail: detail || {} }));
  } catch (e) {}
}

function parseUploadMeta(supply) {
  const raw = supply?.uploadMeta ?? supply?.upload_meta ?? null;
  if (!raw) return {};
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch (e) { return {}; }
  }
  if (typeof raw === 'object') return raw;
  return {};
}

function normalizeSupplyToRecord(s) {
  const meta = parseUploadMeta(s);
  const type = s?.type || meta.type || null;
  const createdAt = s?.createdAt || s?.created_at || null;

  const assignedTo = s?.assignedTo ?? s?.assigned_to ?? null;
  const createdBy = s?.createdBy ?? s?.created_by ?? null;

  const userId = (type === 'purchase')
    ? (assignedTo || meta.purchaserUserId || meta.applicantUserId || createdBy || null)
    : (createdBy || meta.userId || null);

  const applicantUserId = (type === 'request')
    ? (assignedTo || meta.applicantUserId || null)
    : null;

  return {
    id: s?.id,
    type,
    userId,
    item: s?.title ?? meta.item ?? '무명',
    manager: meta.manager || s?.assignedToName || '',
    contact: meta.contact ?? '',
    price: (s?.price !== undefined && s?.price !== null) ? Number(s.price) : Number(meta.price) || 0,
    detail: s?.description ?? meta.detail ?? '',
    image: s?.imageUrl ?? s?.image_url ?? meta.image ?? '',
    status: meta.uiStatus ?? s?.status ?? '등록',
    date: createdAt ? String(createdAt).slice(0, 10) : (new Date()).toISOString().slice(0, 10),
    applicantUserId,
    applicantName: meta.applicantName ?? null,
    applicantContact: meta.applicantContact ?? null,
    managerId: meta.managerId ?? null,
    managerConfirmed: meta.managerConfirmed ?? undefined,
    purchaseAmount: s?.purchaseAmount ?? s?.purchase_amount ?? meta.purchaseAmount ?? undefined,
    completedAt: s?.completedAt ?? s?.completed_at ?? meta.completedAt ?? undefined,
  };
}

function buildSupplyPayloadFromRecord(record) {
  const now = new Date().toISOString();
  const type = record?.type || null;

  const uploadMeta = {
    type,
    item: record?.item,
    manager: record?.manager,
    contact: record?.contact,
    price: (record?.price !== undefined && record?.price !== null) ? Number(record.price) : undefined,
    detail: record?.detail,
    image: record?.image,
    uiStatus: record?.status,
    applicantName: record?.applicantName,
    applicantContact: record?.applicantContact,
    managerId: record?.managerId,
    managerConfirmed: record?.managerConfirmed,
    purchaseAmount: record?.purchaseAmount,
    completedAt: record?.completedAt,
    updatedAtClient: now,
  };

  // Server columns we actively use
  return {
    title: record?.item || '무명',
    description: record?.detail || '',
    type,
    price: (record?.price !== undefined && record?.price !== null) ? Number(record.price) : null,
    imageUrl: record?.image || null,
    status: record?.serverStatus || undefined,
    uploadMeta,
    assignedTo: record?.assignedTo || undefined,
    createdBy: record?.createdBy || undefined,
    purchaseAmount: record?.purchaseAmount !== undefined ? Number(record.purchaseAmount) : undefined,
    completedAt: record?.completedAt || undefined,
  };
}

// ★ 서버 우선 조회 헬퍼 (SSOT)
async function readAllSupplies() {
  const serverData = await storageAdapter.getSupplies();
  const list = Array.isArray(serverData) ? serverData : (Array.isArray(serverData?.supplies) ? serverData.supplies : []);
  return list.map(normalizeSupplyToRecord);
}

export async function getSupplyData(userId) {
  const all = await readAllSupplies();
  // requests: show requests where the manager is userId OR the applicant is userId
  const requests = all.filter(x => x.type === 'request' && (x.userId === userId || x.applicantUserId === userId));
  // purchases: show purchases where the purchaser is userId
  const purchases = all.filter(x => x.type === 'purchase' && x.userId === userId);
  return { requests, purchases };
}

export async function getAll() {
  return readAllSupplies();
}

export async function getAllRequests() {
  const all = await readAllSupplies();
  return all.filter(x => x.type === 'request');
}

export async function getOffers(userId) {
  const all = await readAllSupplies();
  const offers = all.filter(x => x.type === 'offer' && x.userId === userId);
  return offers;
}

export async function deleteOffer(id) {
  try {
    await storageAdapter.deleteSupply(id);
    emitSupplyUpdated({ type: 'offer', operation: 'delete', id });
    return;
  } catch (e) {
    console.error('[supplyService] deleteOffer failed:', e);
    if (STRICT_SSOT) throw e;
    throw e;
  }
}

export async function updateOffer(id, data) {
  try {
    const payload = buildSupplyPayloadFromRecord({
      type: 'offer',
      item: data.item,
      manager: data.manager,
      contact: data.contact,
      price: data.price,
      detail: data.detail,
      image: data.image,
      status: data.status,
    });
    await storageAdapter.updateSupply(id, payload);
    emitSupplyUpdated({ type: 'offer', operation: 'update', id });
    return { id, type: 'offer', ...data };
  } catch (e) {
    console.error('[supplyService] updateOffer failed:', e);
    if (STRICT_SSOT) throw e;
    return null;
  }
}

export async function addOffer(userId, data) {
  try {
    const record = {
      type: 'offer',
      item: data.item || '무명 제품',
      manager: data.manager || '',
      contact: data.contact || '',
      price: Number(data.price) || 0,
      detail: data.detail || '',
      image: data.image || '',
      status: data.status || '등록',
      createdBy: userId || null,
    };
    const payload = buildSupplyPayloadFromRecord(record);
    const result = await storageAdapter.createSupply(payload);
    const supplyId = result?.supplyId || result?.id;
    emitSupplyUpdated({ type: 'offer', operation: 'create', id: supplyId });
    return {
      id: supplyId,
      type: 'offer',
      userId: userId || null,
      item: record.item,
      manager: record.manager,
      contact: record.contact,
      price: record.price,
      detail: record.detail,
      image: record.image,
      status: record.status,
      date: (new Date()).toISOString().slice(0,10),
    };
  } catch (e) {
    console.error('[supplyService] addOffer failed:', e);
    if (STRICT_SSOT) throw e;
    throw e;
  }
}

export async function addRequest(userId, item, applicantUserId = null) {
  const rec = {
    type: 'request',
    userId: userId || null, // manager / offer owner
    item: item || '무명 신청',
    applicantUserId: applicantUserId || null,
    applicantName: null,
    applicantContact: null,
    status: '신청',
    date: (new Date()).toISOString().slice(0,10),
  };

  try {
    const payload = buildSupplyPayloadFromRecord({
      ...rec,
      createdBy: rec.userId,
      assignedTo: rec.applicantUserId,
    });
    const result = await storageAdapter.createSupply(payload);
    const supplyId = result?.supplyId || result?.id;
    const created = { ...rec, id: supplyId };
    emitSupplyUpdated({ type: 'request', operation: 'create', id: supplyId });
    try { console.debug('[supplyService] addRequest server ok', created); } catch (e) {}
  
  // Notify manager (pv2 pattern)
  try {
    const managerId = String(userId || '');
    if (managerId && typeof getMemberById === 'function' && typeof upsertMember === 'function') {
      const member = await getMemberById(managerId);
      if (member) {
        const notif = { 
          id: 'n' + Date.now().toString(36), 
          type: 'supply_request', 
          message: `${rec.applicantName || '회원'}님이 ${rec.item} 보급지원을 신청했습니다.`, 
          createdAt: new Date().toISOString() 
        };
        const nextMember = { ...member };
        nextMember.supplyNotifications = Array.isArray(nextMember.supplyNotifications) ? nextMember.supplyNotifications : [];
        nextMember.supplyNotifications.unshift(notif);
        await upsertMember(nextMember);
      }
    }
  } catch (e) {}

    return created;
  } catch (e) {
    console.error('[supplyService] addRequest failed:', e);
    if (STRICT_SSOT) throw e;
    throw e;
  }
}

export async function addRequestWithApplicant(userId, item, applicant, applicantUserId = null) {
  // applicant: { name, contact }
  const rec = await addRequest(userId, item, applicantUserId);
  try {
    const next = {
      applicantName: (applicant && applicant.name) ? applicant.name : null,
      applicantContact: (applicant && applicant.contact) ? applicant.contact : null,
    };
    await updateRequest(rec.id, next);
    const refreshedAll = await readAllSupplies();
    const updated = refreshedAll.find(x => x.type === 'request' && x.id === rec.id);
    return updated || { ...rec, ...next };
  } catch (e) {
    console.error('[supplyService] addRequestWithApplicant failed:', e);
    if (STRICT_SSOT) throw e;
    return rec;
  }
}

export async function confirmRequest(id, managerId) {
  try { console.debug('[supplyService] confirmRequest', id, 'by manager', managerId); } catch (e) {}
  const updated = await updateRequest(id, { status: '담당자 확인완료', managerId: managerId || null, managerConfirmed: true });
  
  // Notify applicant (pv2 pattern)
  try {
    const all = await readAllSupplies();
    const req = all.find(x => x.type === 'request' && x.id === id);
    if (req && req.applicantUserId && typeof getMemberById === 'function' && typeof upsertMember === 'function') {
      const applicant = await getMemberById(String(req.applicantUserId));
      if (applicant) {
        const notif = { 
          id: 'n' + Date.now().toString(36), 
          type: 'supply_confirm', 
          message: `${req.item} 보급지원이 승인되었습니다.`, 
          createdAt: new Date().toISOString() 
        };
        const next = { ...applicant };
        next.supplyNotifications = Array.isArray(next.supplyNotifications) ? next.supplyNotifications : [];
        next.supplyNotifications.unshift(notif);
        await upsertMember(next);
      }
    }
  } catch (e) {}
  
  return updated;
}

export async function updateRequest(id, data) {
  const all = await readAllSupplies();
  const rec = all.find(x => x.type === 'request' && x.id === id);
  if (!rec) return null;

  const next = { ...rec };
  next.status = data.status ?? next.status;
  if (data.applicantName !== undefined) next.applicantName = data.applicantName;
  if (data.applicantContact !== undefined) next.applicantContact = data.applicantContact;
  if (data.managerId !== undefined) next.managerId = data.managerId;
  if (data.managerConfirmed !== undefined) next.managerConfirmed = data.managerConfirmed;

  const payload = buildSupplyPayloadFromRecord({
    ...next,
    createdBy: rec.userId || null,
    assignedTo: rec.applicantUserId || null,
  });
  try {
    await storageAdapter.updateSupply(id, payload);
    emitSupplyUpdated({ type: 'request', operation: 'update', id });
    try { console.debug('[supplyService] updateRequest server ok', id, data); } catch (e) {}
    return next;
  } catch (e) {
    console.error('[supplyService] updateRequest failed:', e);
    if (STRICT_SSOT) throw e;
    return null;
  }
}

export async function deleteRequest(id) {
  try {
    await storageAdapter.deleteSupply(id);
    emitSupplyUpdated({ type: 'request', operation: 'delete', id });
  } catch (e) {
    console.error('[supplyService] deleteRequest failed:', e);
    if (STRICT_SSOT) throw e;
  }
}

export async function completeRequestAsPurchase(id, purchaseData) {
  // Convert request -> purchase on the same supply row
  const all = await readAllSupplies();
  const req = all.find(x => x.type === 'request' && x.id === id);
  if (!req) return null;

  const nowIso = new Date().toISOString();
  const next = {
    ...req,
    type: 'purchase',
    status: '완료',
    purchaseAmount: (purchaseData && purchaseData.amount) ? Number(purchaseData.amount) : 0,
    completedAt: nowIso,
  };

  const payload = buildSupplyPayloadFromRecord({
    ...next,
    createdBy: req.userId || null,
    assignedTo: req.applicantUserId || null,
    purchaseAmount: next.purchaseAmount,
    completedAt: next.completedAt,
  });

  try {
    await storageAdapter.updateSupply(id, { ...payload, type: 'purchase' });
    emitSupplyUpdated({ type: 'purchase', operation: 'create', id });
    return {
      id,
      type: 'purchase',
      userId: req.applicantUserId || req.userId,
      item: req.item,
      amount: next.purchaseAmount,
      status: '완료',
      date: nowIso.slice(0, 10),
    };
  } catch (e) {
    console.error('[supplyService] completeRequestAsPurchase failed:', e);
    if (STRICT_SSOT) throw e;
    return null;
  }
}

export async function adminCompleteRequest(id, purchaseData) {
  // alias
  return completeRequestAsPurchase(id, purchaseData);
}

export default {
  getSupplyData,
  getAll,
  getAllRequests,
  getOffers,
  addOffer,
  updateOffer,
  deleteOffer,
  addRequest,
  addRequestWithApplicant,
  updateRequest,
  confirmRequest,
  deleteRequest,
  completeRequestAsPurchase,
  adminCompleteRequest,
};
