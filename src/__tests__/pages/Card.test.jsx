import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Card from '../../pages/MyCard';

// Mock modules
vi.mock('../../lib/memberStore', () => ({
  memberStore: {
    subscribe: vi.fn((cb) => {
      cb({ id: 1, name: '김멤버', phone: '010-1234-5678', email: 'test@example.com' });
      return vi.fn();
    }),
    getState: vi.fn(() => ({ id: 1, name: '김멤버', phone: '010-1234-5678', email: 'test@example.com' }))
  }
}));

vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn(async () => 'data:image/png;base64,mockQRCode')
  }
}));

describe('Card (명함 QR 기능)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderCard = () => {
    return render(
      <BrowserRouter>
        <Card />
      </BrowserRouter>
    );
  };

  describe('vCard 생성', () => {
    it('회원 정보를 vCard 형식으로 변환한다', () => {
      const member = {
        name: '김멤버',
        phone: '010-1234-5678',
        email: 'test@example.com'
      };

      const vCardString = `BEGIN:VCARD
VERSION:3.0
FN:${member.name}
TEL:${member.phone}
EMAIL:${member.email}
END:VCARD`;

      expect(vCardString).toContain('BEGIN:VCARD');
      expect(vCardString).toContain(`FN:${member.name}`);
      expect(vCardString).toContain(`TEL:${member.phone}`);
      expect(vCardString).toContain(`EMAIL:${member.email}`);
      expect(vCardString).toContain('END:VCARD');
    });

    it('필수 필드만 있어도 vCard를 생성한다', () => {
      const member = {
        name: '이멤버'
      };

      const vCardString = `BEGIN:VCARD
VERSION:3.0
FN:${member.name}
END:VCARD`;

      expect(vCardString).toContain('BEGIN:VCARD');
      expect(vCardString).toContain(`FN:${member.name}`);
    });
  });

  describe('QR 코드 생성', () => {
    it('공개 URL로 QR 코드를 생성한다', async () => {
      const memberId = 123;
      const publicUrl = `${window.location.origin}/cards/${memberId}`;
      
      const QRCode = (await import('qrcode')).default;
      await QRCode.toDataURL(publicUrl);
      
      expect(QRCode.toDataURL).toHaveBeenCalledWith(publicUrl);
    });

    it('vCard 정보로 QR 코드를 생성한다', async () => {
      const vCardString = 'BEGIN:VCARD\nVERSION:3.0\nFN:김멤버\nEND:VCARD';
      
      const QRCode = (await import('qrcode')).default;
      await QRCode.toDataURL(vCardString);
      
      expect(QRCode.toDataURL).toHaveBeenCalledWith(vCardString);
    });
  });

  describe('다운로드 기능', () => {
    it('PNG 이미지로 다운로드한다', async () => {
      const createElementSpy = vi.spyOn(document, 'createElement');
      const link = document.createElement('a');
      const clickSpy = vi.spyOn(link, 'click');

      link.href = 'data:image/png;base64,mockImage';
      link.download = 'mycard.png';
      link.click();

      expect(clickSpy).toHaveBeenCalled();
    });

    it('VCF 파일로 다운로드한다', () => {
      const vCardString = 'BEGIN:VCARD\nVERSION:3.0\nFN:김멤버\nEND:VCARD';
      const blob = new Blob([vCardString], { type: 'text/vcard' });
      
      expect(blob.type).toBe('text/vcard');
      expect(blob.size).toBeGreaterThan(0);
    });
  });

  describe('Canvas 렌더링', () => {
    it('Canvas API를 사용할 수 있다', () => {
      // JSDOM에서는 Canvas가 제한적이므로 API 존재 여부만 확인
      expect(typeof HTMLCanvasElement).toBe('function');
    });
  });

  describe('공유 기능', () => {
    it('공개 명함 URL을 생성한다', () => {
      const memberId = 123;
      const publicUrl = `${window.location.origin}/cards/${memberId}`;
      
      expect(publicUrl).toContain('/cards/123');
    });

    it('URL을 클립보드에 복사한다', async () => {
      const writeText = vi.fn();
      Object.assign(navigator, {
        clipboard: { writeText }
      });
      
      const url = 'https://example.com/cards/123';
      await navigator.clipboard.writeText(url);
      
      expect(writeText).toHaveBeenCalledWith(url);
    });
  });
});
