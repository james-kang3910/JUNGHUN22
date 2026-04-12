// 일정 데이터 관리 서비스 (SSOT: server DB)
import * as storageAdapter from './storageAdapter.js';

const IS_TEST = Boolean(import.meta.env && import.meta.env.VITEST);
const STRICT_SSOT = (!IS_TEST && import.meta.env && import.meta.env.DEV)
  ? (localStorage.getItem('su_strict_ssot') !== 'false')
  : false;

export async function getSchedules(userId) {
  try {
    const result = await storageAdapter.fetchSchedules(userId);
    return Array.isArray(result?.schedules) ? result.schedules : [];
  } catch (e) {
    console.error('[scheduleService] getSchedules error:', e);
    if (STRICT_SSOT) throw e;
    return [];
  }
}

export async function addSchedule(userId, schedule) {
  try {
    const data = await storageAdapter.createSchedule({ userId, ...schedule });
    window.dispatchEvent(new CustomEvent('su:ssot:changed', { 
      detail: { type: 'schedules', operation: 'create' } 
    }));
    return data.schedule;
  } catch (e) {
    console.error('[scheduleService] addSchedule error:', e);
    throw e;
  }
}

export async function updateSchedule(id, data) {
  try {
    const result = await storageAdapter.updateSchedule(id, data);
    window.dispatchEvent(new CustomEvent('su:ssot:changed', { 
      detail: { type: 'schedules', operation: 'update', id } 
    }));
    return result.schedule;
  } catch (e) {
    console.error('[scheduleService] updateSchedule error:', e);
    return null;
  }
}

export async function deleteSchedule(id) {
  try {
    await storageAdapter.deleteSchedule(id);
    window.dispatchEvent(new CustomEvent('su:ssot:changed', { 
      detail: { type: 'schedules', operation: 'delete', id } 
    }));
    return true;
  } catch (e) {
    console.error('[scheduleService] deleteSchedule error:', e);
    return false;
  }
}
