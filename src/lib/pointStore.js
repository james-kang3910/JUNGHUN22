/**
 * 포인트 관리 스토어
 * 
 * [DATA_POLICY 준수]
 * - 서버 DB: Single Source of Truth for 포인트 원장 (point_ledger 테이블)
 * - localStorage: 금지 (SSOT)
 * - 쓰기: storageAdapter.* → 서버(=SQLite) 반영
 * - 읽기: storageAdapter.* → 서버 반영값만 사용 (폴백/묵살 금지)
 * 
 * 사용처:
 * - AdminPoints.jsx: 관리자 포인트 지급/취소
 * - My.jsx: 사용자 포인트 조회/사용
 */

import * as storageAdapter from './storageAdapter';

// ★ 회원 목록 가져오기 (서버 우선 + 로컬 폴백)
export const getMembers = async () => {
  const serverMembers = await storageAdapter.getMembers();
  return (serverMembers || []).map(m => ({
    id: m.id || m.memberId,
    memberId: m.memberId || m.id,
    name: m.name || m.nickname || "이름없음",
    nickname: m.nickname || "",
    email: m.email || "",
    phone: m.phone || "",
    region: m.region || "",
  }));
};

// ★ 현재 로그인 사용자 ID 가져오기
export const getCurrentUserId = () => {
  try {
    const s = (typeof window !== 'undefined') ? window.__SU_SESSION__ : null;
    if (s && s.memberId) return s.memberId;
  } catch (e) {}
  return null;
};

// ★ 포인트 원장 조회 (서버 우선 + 로컬 폴백)
export const getPointLedger = async (userId = null) => {
  const target = userId ? userId : 'all';
  const serverHistory = await storageAdapter.getPointHistory(target, { limit: 1000 });
  const rows = serverHistory?.transactions || serverHistory || [];

  if (!Array.isArray(rows)) {
    throw new Error('getPointLedger: server returned non-array transactions');
  }

  return rows.map(h => ({
    id: h.id,
    userId: h.memberId || h.member_id || h.userId,
    userName: h.userName || h.user_name || h.member_name || "",
    type: h.type || "ADMIN",
    amount: Number(h.amount || 0),
    reason: h.reason || h.description || "",
    createdAt: h.createdAt || h.created_at,
    status: h.status || 'active',
  }));
};

// ★ 특정 회원의 포인트 이력 조회
export const getUserPointHistory = async (userId) => {
  const ledger = await getPointLedger(userId);
  return ledger.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// ★ 특정 회원의 포인트 잔액 계산
export const getUserBalance = async (userId) => {
  const history = await getUserPointHistory(userId);
  return history.reduce((sum, h) => sum + (h.status === "completed" ? h.amount : 0), 0);
};

// ★ 현재 로그인 사용자의 포인트 데이터 (My.jsx용)
export const getCurrentUserPointData = async () => {
  const userId = getCurrentUserId();
  if (!userId) {
    return { earned: 0, spent: 0, balance: 0, history: [] };
  }
  
  const history = await getUserPointHistory(userId);
  const earned = history.filter(h => h.amount > 0 && h.status === "completed").reduce((sum, h) => sum + h.amount, 0);
  const spent = Math.abs(history.filter(h => h.amount < 0 && h.status === "completed").reduce((sum, h) => sum + h.amount, 0));
  const balance = earned - spent;
  
  // My.jsx 형식으로 변환
  const formattedHistory = history.map(h => ({
    id: h.id,
    type: h.amount >= 0 ? "earn" : "spend",
    desc: h.reason,
    amount: h.amount,
    date: h.createdAt?.split("T")[0] || "",
  }));
  
  return { earned, spent, balance, history: formattedHistory };
};

// ★ 관리자: 포인트 지급
export const givePoints = async (userId, userName, amount, reason, adminId = "admin") => {
  if (!userId || !amount || amount <= 0) {
    return { success: false, error: "유효하지 않은 입력입니다." };
  }
  
  try {
    const result = await storageAdapter.grantPoints(
      userId,
      parseInt(amount),
      'ADMIN',
      reason || "관리자 지급",
      null,
      null
    );

    console.log('[givePoints] Successfully granted points to server:', userId, amount);
    return { success: true, data: result };
  } catch (error) {
    console.error('[givePoints] Failed to grant points:', error);
    return { success: false, error: error.message || "포인트 지급 실패" };
  }
};

// ★ 관리자: 포인트 차감 (취소)
export const deductPoints = async (userId, userName, amount, reason, adminId = "admin") => {
  if (!userId || !amount || amount <= 0) {
    return { success: false, error: "유효하지 않은 입력입니다." };
  }
  
  // 잔액 확인
  const balance = await getUserBalance(userId);
  if (balance < amount) {
    return { success: false, error: `잔액이 부족합니다. (현재: ${balance}P)` };
  }
  
  try {
    await storageAdapter.grantPoints(
      userId,
      -parseInt(amount),
      'ADMIN_DEDUCT',
      reason || "관리자 차감",
      null,
      null
    );

    console.log('[deductPoints] Successfully deducted points from server:', userId, amount);
    return { success: true, data: null };
  } catch (error) {
    console.error('[deductPoints] Failed to deduct points:', error);
    return { success: false, error: error.message || "포인트 차감 실패" };
  }
};

// ★ 관리자: 특정 거래 취소
export const cancelTransaction = async (transactionId, adminId = "admin") => {
  if (!transactionId) return { success: false, error: 'transactionId required' };
  try {
    const res = await storageAdapter.cancelPointTransaction(transactionId);
    return { success: true, data: res };
  } catch (e) {
    return { success: false, error: e.message || '거래 취소 실패' };
  }
};

// ★ 미션/이벤트 완료 시 포인트 적립 (시스템용)
export const earnPointsFromMission = (userId, userName, amount, missionTitle) => {
  // SSOT: client-side synthetic ledger 금지. 서버 트랜잭션을 통해 적립해야 함.
  // (현재 호출처가 있다면 storageAdapter.grantPoints 또는 서버 미션 완료 플로우를 사용하도록 교체 필요)
  return { success: false, error: 'SSOT: client-side earnPointsFromMission is not supported' };
};

// ★ 상점 결제 시 포인트 사용 (시스템용)
export const spendPointsAtShop = async (userId, userName, amount, shopName) => {
  // SSOT: 결제는 서버 /api/points/pay 경유가 원칙.
  // 여기서는 storeId가 없어서 처리 불가.
  return { success: false, error: 'SSOT: spendPointsAtShop requires server payment flow (/api/points/pay)' };
};

// ★ 전체 통계
export const getPointStats = async () => {
  const ledger = await getPointLedger();
  const completedLedger = ledger.filter(l => l.status === "completed");
  
  const totalGiven = completedLedger.filter(l => l.amount > 0).reduce((sum, l) => sum + l.amount, 0);
  const totalDeducted = Math.abs(completedLedger.filter(l => l.amount < 0).reduce((sum, l) => sum + l.amount, 0));
  const netTotal = totalGiven - totalDeducted;
  
  // 회원별 잔액 합계
  const members = await getMembers();
  const memberBalancesPromises = members.map(async m => ({
    ...m,
    balance: await getUserBalance(m.id),
  }));
  const memberBalances = await Promise.all(memberBalancesPromises);
  
  return {
    totalGiven,
    totalDeducted,
    netTotal,
    transactionCount: ledger.length,
    memberBalances,
  };
};

// ★ 타입별 라벨
export const POINT_TYPE_LABELS = {
  admin_give: { label: "관리자 지급", color: "#8b5cf6", bg: "rgba(139,92,246,0.15)" },
  admin_deduct: { label: "관리자 차감", color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
  mission: { label: "미션", color: "#22c55e", bg: "rgba(34,197,94,0.15)" },
  event: { label: "이벤트", color: "#3b82f6", bg: "rgba(59,130,246,0.15)" },
  spend: { label: "사용", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  cancel: { label: "취소", color: "#6b7280", bg: "rgba(107,114,128,0.15)" },
};
