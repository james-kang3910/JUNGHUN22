import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as scheduleService from '../../lib/scheduleService';

describe('scheduleService', () => {
  const originalFetch = global.fetch;
  
  beforeEach(() => {
    global.fetch = vi.fn();
  });
  
  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('getSchedules', () => {
    it('일정 목록을 가져온다', async () => {
      const mockSchedules = [
        { id: 1, title: '연습', date: '2024-01-15', time: '14:00', location: '연습실' },
        { id: 2, title: '공연', date: '2024-01-20', time: '19:00', location: '메인홀' }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ schedules: mockSchedules })
      });

      const result = await scheduleService.getSchedules(1);
      
      expect(result).toEqual(mockSchedules);
    });

    it('실패 시 빈 배열 반환', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      
      const result = await scheduleService.getSchedules(1);
      
      expect(result).toEqual([]);
    });
  });

  describe('addSchedule', () => {
    it('새 일정을 추가한다', async () => {
      const newSchedule = {
        title: '신규 연습',
        date: '2024-01-25',
        time: '16:00',
        location: '2층 연습실'
      };

      const mockResponse = { id: 3, ...newSchedule };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ schedule: mockResponse })
      });
      
      // Mock CustomEvent dispatch
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

      const result = await scheduleService.addSchedule(1, newSchedule);
      
      expect(result).toEqual(mockResponse);
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'su:ssot:changed'
        })
      );
    });
  });

  describe('updateSchedule', () => {
    it('기존 일정을 수정한다', async () => {
      const updates = {
        title: '수정된 연습',
        location: '3층 연습실'
      };

      const mockResponse = { id: 1, ...updates, date: '2024-01-15', time: '14:00' };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ schedule: mockResponse })
      });

      const result = await scheduleService.updateSchedule(1, updates);
      
      expect(result).toEqual(mockResponse);
    });

    it('실패 시 null 반환', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Update failed'));

      const result = await scheduleService.updateSchedule(1, {});
      
      expect(result).toBeNull();
    });
  });

  describe('deleteSchedule', () => {
    it('일정을 삭제한다', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const result = await scheduleService.deleteSchedule(1);
      
      expect(result).toBe(true);
    });

    it('실패 시 false 반환', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Delete failed'));

      const result = await scheduleService.deleteSchedule(1);
      
      expect(result).toBe(false);
    });
  });
});

