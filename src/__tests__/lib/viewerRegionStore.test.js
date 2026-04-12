import { describe, it, expect, beforeEach } from 'vitest';
import {
  canParticipate,
  checkIsAdmin,
  getParticipationBlockedReason,
  normalizeRegionId,
  normalizeRegionIds
} from '../../lib/viewerRegionStore';

describe('viewerRegionStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('checkIsAdmin', () => {
    it('관리자 로그인 시 true 반환', () => {
      localStorage.setItem('isAdmin', 'true');
      expect(checkIsAdmin()).toBe(true);
    });

    it('일반 사용자는 false 반환', () => {
      expect(checkIsAdmin()).toBe(false);
    });
  });

  describe('canParticipate', () => {
    it('관리자는 항상 참여 가능', () => {
      const event = { regionScope: 'REGION', regionIds: ['seoul'] };
      const memberRegionId = 'busan'; // 다른 지역
      
      const result = canParticipate(event, memberRegionId, true);
      expect(result).toBe(true);
    });

    it('전체 공개(ALL) 이벤트는 누구나 참여 가능', () => {
      const event = { regionScope: 'ALL', regionIds: [] };
      const memberRegionId = 'seoul';
      
      const result = canParticipate(event, memberRegionId, false);
      expect(result).toBe(true);
    });

    it('특정 지역(REGION) 이벤트는 해당 지역 회원만 참여', () => {
      const event = { regionScope: 'REGION', regionIds: ['seoul', 'busan'] };
      const memberRegionId = 'seoul';
      
      const result = canParticipate(event, memberRegionId, false);
      expect(result).toBe(true);
    });

    it('특정 지역 이벤트에 다른 지역 회원은 참여 불가', () => {
      const event = { regionScope: 'REGION', regionIds: ['seoul'] };
      const memberRegionId = 'busan';
      
      const result = canParticipate(event, memberRegionId, false);
      expect(result).toBe(false);
    });

    it('지역 미등록 회원은 특정 지역 이벤트 참여 불가', () => {
      const event = { regionScope: 'REGION', regionIds: ['seoul'] };
      const memberRegionId = null;
      
      const result = canParticipate(event, memberRegionId, false);
      expect(result).toBe(false);
    });

    it('공백과 대소문자가 달라도 같은 지역이면 참여 가능', () => {
      const event = { regionScope: 'REGION', regionIds: [' Seoul ', 'BUSAN'] };
      const memberRegionId = 'seoul';

      const result = canParticipate(event, memberRegionId, false);
      expect(result).toBe(true);
    });
  });

  describe('getParticipationBlockedReason', () => {
    it('지역 미등록 시 안내 메시지 반환', () => {
      const event = { regionScope: 'REGION', regionIds: ['seoul'] };
      const memberRegionId = null;
      
      const reason = getParticipationBlockedReason(event, memberRegionId);
      expect(reason).toContain('회원가입');
    });

    it('다른 지역 회원에게 제한 메시지 반환', () => {
      const event = { regionScope: 'REGION', regionIds: ['seoul'] };
      const memberRegionId = 'busan';
      
      const reason = getParticipationBlockedReason(event, memberRegionId);
      expect(reason).toBeTruthy();
      expect(reason).toContain('이 지역');
    });
  });

  describe('region normalization', () => {
    it('regionId를 trim + lower-case로 정규화', () => {
      expect(normalizeRegionId(' Seoul ')).toBe('seoul');
    });

    it('regionIds 문자열도 배열처럼 정규화', () => {
      expect(normalizeRegionIds(' Seoul, BUSAN , , ')).toEqual(['seoul', 'busan']);
    });
  });
});
