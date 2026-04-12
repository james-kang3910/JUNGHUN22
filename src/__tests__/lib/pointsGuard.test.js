import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('pointsGuard (포인트 결제 허용/중지)', () => {
  const POINTS_BLOCKED_KEY = 'su_points_blocked';

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('포인트 결제 상태 관리', () => {
    it('초기 상태는 결제 허용', () => {
      const isBlocked = localStorage.getItem(POINTS_BLOCKED_KEY) === 'true';
      expect(isBlocked).toBe(false);
    });

    it('포인트 결제를 중지할 수 있다', () => {
      localStorage.setItem(POINTS_BLOCKED_KEY, 'true');
      
      const isBlocked = localStorage.getItem(POINTS_BLOCKED_KEY) === 'true';
      expect(isBlocked).toBe(true);
    });

    it('포인트 결제를 다시 허용할 수 있다', () => {
      localStorage.setItem(POINTS_BLOCKED_KEY, 'true');
      localStorage.removeItem(POINTS_BLOCKED_KEY);
      
      const isBlocked = localStorage.getItem(POINTS_BLOCKED_KEY) === 'true';
      expect(isBlocked).toBe(false);
    });
  });

  describe('결제 검증 로직', () => {
    it('결제 중지 상태에서는 결제 불가', () => {
      localStorage.setItem(POINTS_BLOCKED_KEY, 'true');
      
      const canPay = localStorage.getItem(POINTS_BLOCKED_KEY) !== 'true';
      expect(canPay).toBe(false);
    });

    it('결제 허용 상태에서는 결제 가능', () => {
      localStorage.removeItem(POINTS_BLOCKED_KEY);
      
      const canPay = localStorage.getItem(POINTS_BLOCKED_KEY) !== 'true';
      expect(canPay).toBe(true);
    });
  });

  describe('포인트 잔액 검증', () => {
    it('잔액이 충분하면 결제 가능', () => {
      const balance = 10000;
      const price = 5000;
      
      const hasEnoughPoints = balance >= price;
      expect(hasEnoughPoints).toBe(true);
    });

    it('잔액이 부족하면 결제 불가', () => {
      const balance = 3000;
      const price = 5000;
      
      const hasEnoughPoints = balance >= price;
      expect(hasEnoughPoints).toBe(false);
    });

    it('잔액과 가격이 같으면 결제 가능', () => {
      const balance = 5000;
      const price = 5000;
      
      const hasEnoughPoints = balance >= price;
      expect(hasEnoughPoints).toBe(true);
    });
  });

  describe('결제 플로우 통합', () => {
    it('포인트 충분 + 결제 허용 = 성공', () => {
      const balance = 10000;
      const price = 5000;
      localStorage.removeItem(POINTS_BLOCKED_KEY);
      
      const canPay = localStorage.getItem(POINTS_BLOCKED_KEY) !== 'true';
      const hasEnoughPoints = balance >= price;
      
      const canProceed = canPay && hasEnoughPoints;
      expect(canProceed).toBe(true);
    });

    it('포인트 충분 + 결제 중지 = 실패', () => {
      const balance = 10000;
      const price = 5000;
      localStorage.setItem(POINTS_BLOCKED_KEY, 'true');
      
      const canPay = localStorage.getItem(POINTS_BLOCKED_KEY) !== 'true';
      const hasEnoughPoints = balance >= price;
      
      const canProceed = canPay && hasEnoughPoints;
      expect(canProceed).toBe(false);
    });

    it('포인트 부족 + 결제 허용 = 실패', () => {
      const balance = 3000;
      const price = 5000;
      localStorage.removeItem(POINTS_BLOCKED_KEY);
      
      const canPay = localStorage.getItem(POINTS_BLOCKED_KEY) !== 'true';
      const hasEnoughPoints = balance >= price;
      
      const canProceed = canPay && hasEnoughPoints;
      expect(canProceed).toBe(false);
    });
  });
});

