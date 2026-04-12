import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as friendService from '../../lib/friendService';

describe('friendService', () => {
  const originalFetch = global.fetch;
  
  beforeEach(() => {
    global.fetch = vi.fn();
  });
  
  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('getFriends', () => {
    it('친구 목록을 가져온다', async () => {
      const mockFriends = [
        { id: 1, name: '김멤버', region: 'seoul', phone: '010-1111-2222' },
        { id: 2, name: '이멤버', region: 'busan', phone: '010-3333-4444' }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, success: true, friends: mockFriends })
      });

      const result = await friendService.getFriends(1);
      
      expect(result).toEqual(mockFriends);
    });

    it('실패 시 에러를 throw', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(friendService.getFriends(1)).rejects.toThrow('Network error');
    });
  });

  describe('addFriend', () => {
    it('새 친구를 추가한다', async () => {
      const mockFriends = [
        { id: 1, name: '김멤버' },
        { id: 3, name: '박멤버' }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, success: true, friends: mockFriends })
      });
      
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

      const result = await friendService.addFriend(1, 3);
      
      expect(result).toEqual(mockFriends);
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'su:ssot:changed' })
      );
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'su_friends:updated' })
      );
    });
  });

  describe('removeFriend', () => {
    it('친구를 삭제한다', async () => {
      const mockFriends = [
        { id: 2, name: '이멤버' }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, success: true, friends: mockFriends })
      });

      const result = await friendService.removeFriend(1, 1);
      
      expect(result).toEqual(mockFriends);
    });
  });
});
