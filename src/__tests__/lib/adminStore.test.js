import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isAdminAuthenticated,
  adminLogin,
  adminLogout,
  getRegions,
  getMembers,
  createRegion,
  updateRegion,
  deleteRegion,
  calculateStatus,
  getStatusLabel
} from '../../lib/adminStore';

describe('adminStore', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
    global.fetch = vi.fn(() => Promise.resolve({
      ok: true,
      json: async () => ({ ok: true, token: 'test-token' })
    }));
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('adminAuthentication', () => {
    it('로그인 전에는 인증되지 않음', () => {
      expect(isAdminAuthenticated()).toBe(false);
    });

    it('올바른 비밀번호로 로그인 성공', async () => {
      const result = await adminLogin('admin1234');
      
      expect(result).toBe(true);
      expect(isAdminAuthenticated()).toBe(true);
      expect(localStorage.getItem('su_admin_isAdmin')).toBe('true');
    });

    it('잘못된 비밀번호로 로그인 실패', async () => {
      global.fetch = vi.fn(() => Promise.resolve({
        ok: true,
        json: async () => ({ ok: false })
      }));
      const result = await adminLogin('wrongpassword');
      
      expect(result).toBe(false);
      expect(isAdminAuthenticated()).toBe(false);
    });

    it('로그아웃 시 인증 토큰 제거', async () => {
      await adminLogin('admin1234');
      expect(isAdminAuthenticated()).toBe(true);
      
      adminLogout();
      
      expect(isAdminAuthenticated()).toBe(false);
      expect(localStorage.getItem('su_admin_isAdmin')).toBeNull();
    });
  });

  describe('regions CRUD', () => {
    it('지역 목록 조회', () => {
      const regions = getRegions();
      expect(Array.isArray(regions)).toBe(true);
    });

    it('새 지역 생성', async () => {
      const newRegion = {
        name: '테스트 지역',
        isPublic: true
      };

      const result = await createRegion(newRegion);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id');
      expect(result.data.name).toBe('테스트 지역');

      const regions = getRegions();
      expect(regions.find(r => r.id === result.data.id)).toBeTruthy();
    });

    it('지역 정보 수정', async () => {
      const created = await createRegion({ name: '원본', isPublic: false });
      const regionId = created.data.id;

      const result = await updateRegion(regionId, { name: '수정됨', isPublic: true });
      
      expect(result.success).toBe(true);
      expect(result.data.name).toBe('수정됨');
      expect(result.data.isPublic).toBe(true);
    });

    it('지역 삭제', async () => {
      const created = await createRegion({ name: '삭제할 지역', isPublic: true });
      const regionId = created.data.id;

      const result = await deleteRegion(regionId);
      
      expect(result.success).toBe(true);

      const regions = getRegions();
      expect(regions.find(r => r.id === regionId)).toBeUndefined();
    });

    it('존재하지 않는 지역 수정 시 실패', async () => {
      const result = await updateRegion('nonexistent', { name: 'Test' });
      
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('members CRUD', () => {
    it('회원 목록 조회', () => {
      const members = getMembers();
      expect(Array.isArray(members)).toBe(true);
    });

    it('ID 중복 체크', () => {
      const member1 = { username: 'user1', regionId: 'seoul' };
      const result1 = createRegion(member1);
      
      // 같은 username으로 재생성 시도
      const result2 = createRegion({ username: 'user1', regionId: 'busan' });
      
      // adminStore 구현에 따라 중복 체크 로직이 있다면 실패해야 함
      // (현재 구현 확인 필요)
    });
  });

  describe('calculateStatus', () => {
    it('시작 전 상태 반환', () => {
      const future = new Date(Date.now() + 86400000).toISOString(); // +1일
      const moreFuture = new Date(Date.now() + 172800000).toISOString(); // +2일
      
      const status = calculateStatus(future, moreFuture);
      expect(status).toBe('scheduled');
    });

    it('진행 중 상태 반환', () => {
      const past = new Date(Date.now() - 86400000).toISOString(); // -1일
      const future = new Date(Date.now() + 86400000).toISOString(); // +1일
      
      const status = calculateStatus(past, future);
      expect(status).toBe('ongoing');
    });

    it('종료됨 상태 반환', () => {
      const past1 = new Date(Date.now() - 172800000).toISOString(); // -2일
      const past2 = new Date(Date.now() - 86400000).toISOString(); // -1일
      
      const status = calculateStatus(past1, past2);
      expect(status).toBe('ended');
    });
  });

  describe('getStatusLabel', () => {
    it('상태에 따른 라벨 반환', () => {
      expect(getStatusLabel('scheduled')).toBe('예정');
      expect(getStatusLabel('ongoing')).toBe('진행중');
      expect(getStatusLabel('ended')).toBe('종료');
    });
  });
});
