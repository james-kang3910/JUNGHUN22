import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as chatService from '../../lib/chatService';

// Mock authStore
vi.mock('../../lib/authStore', () => ({
  getAuthInfo: vi.fn(() => ({ id: 1, memberId: 1 }))
}));

describe('chatService', () => {
  const originalFetch = global.fetch;
  
  beforeEach(() => {
    global.fetch = vi.fn();
    localStorage.clear();
  });
  
  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('getConversation', () => {
    it('두 사용자 간 대화를 가져온다', async () => {
      const mockMessages = [
        { id: 1, from: 1, to: 2, text: '안녕하세요', timestamp: '2024-01-15T10:00:00Z' },
        { id: 2, from: 2, to: 1, text: '네 안녕하세요', timestamp: '2024-01-15T10:01:00Z' }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, success: true, messages: mockMessages })
      });

      const result = await chatService.getConversation(1, 2);
      
      expect(result).toEqual(mockMessages);
    });

    it('실패 시 에러를 throw', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(chatService.getConversation(1, 2)).rejects.toThrow('Network error');
    });
  });

  describe('sendMessage', () => {
    it('메시지를 전송한다', async () => {
      const mockMessage = {
        id: 3,
        from: 1,
        to: 2,
        text: '오늘 연습 몇 시예요?',
        timestamp: '2024-01-15T10:02:00Z'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, success: true, messageId: mockMessage.id })
      });
      
      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

      const result = await chatService.sendMessage(1, 2, '오늘 연습 몇 시예요?');
      
      expect(result).toMatchObject({
        id: mockMessage.id,
        from: mockMessage.from,
        to: mockMessage.to,
        text: mockMessage.text,
      });
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'su:ssot:changed' })
      );
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'su_messages:updated' })
      );
    });
    
    it('실패 시 에러를 throw', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Send failed'));

      await expect(chatService.sendMessage(1, 2, 'test')).rejects.toThrow('Send failed');
    });
  });
});
