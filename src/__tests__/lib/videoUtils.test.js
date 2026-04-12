import { describe, it, expect } from 'vitest';
import { isYouTubeUrl, parseYouTubeId } from '../../lib/videoUtils';

describe('videoUtils', () => {
  describe('isYouTubeUrl', () => {
    it('표준 유튜브 URL 감지', () => {
      expect(isYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
      expect(isYouTubeUrl('https://youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
    });

    it('유튜브 단축 URL 감지', () => {
      expect(isYouTubeUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true);
    });

    it('유튜브 embed URL 감지', () => {
      expect(isYouTubeUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe(true);
    });

    it('유튜브 shorts URL 감지', () => {
      expect(isYouTubeUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe(true);
    });

    it('유튜브가 아닌 URL은 false', () => {
      expect(isYouTubeUrl('https://vimeo.com/123456')).toBe(false);
      expect(isYouTubeUrl('https://example.com')).toBe(false);
    });

    it('빈 문자열 또는 null은 false', () => {
      expect(isYouTubeUrl('')).toBe(false);
      expect(isYouTubeUrl(null)).toBe(false);
      expect(isYouTubeUrl(undefined)).toBe(false);
    });
  });

  describe('parseYouTubeId', () => {
    it('표준 watch URL에서 ID 추출', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      expect(parseYouTubeId(url)).toBe('dQw4w9WgXcQ');
    });

    it('단축 URL에서 ID 추출', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ';
      expect(parseYouTubeId(url)).toBe('dQw4w9WgXcQ');
    });

    it('embed URL에서 ID 추출', () => {
      const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
      expect(parseYouTubeId(url)).toBe('dQw4w9WgXcQ');
    });

    it('shorts URL에서 ID 추출', () => {
      const url = 'https://www.youtube.com/shorts/dQw4w9WgXcQ';
      expect(parseYouTubeId(url)).toBe('dQw4w9WgXcQ');
    });

    it('쿼리 파라미터가 있어도 ID 추출', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s';
      expect(parseYouTubeId(url)).toBe('dQw4w9WgXcQ');
    });

    it('ID만 입력 시 URL 파싱 후 매칭 실패로 null 반환', () => {
      // 실제 동작: 'dQw4w9WgXcQ'는 URL로 파싱됨 (http://localhost/dQw4w9WgXcQ)
      // 하지만 youtube.com이나 youtu.be 호스트가 아니므로 id를 추출하지 못함
      // 따라서 null 반환 (catch 블록에 도달하지 않음)
      expect(parseYouTubeId('dQw4w9WgXcQ')).toBeNull();
      expect(parseYouTubeId('abcdef123456')).toBeNull();
    });

    it('특수문자 포함 시 URL 파싱 실패로 regex 체크', () => {
      // URL 파싱이 실패하면 catch 블록에서 정규식으로 체크
      // 하지만 일반 ID는 URL로 파싱 성공하므로 catch에 도달 못함
      expect(parseYouTubeId('invalid@id')).toBeNull();
    });

    it('잘못된 URL은 null 반환', () => {
      expect(parseYouTubeId('https://example.com')).toBeNull();
      expect(parseYouTubeId('')).toBeNull();
      expect(parseYouTubeId(null)).toBeNull();
    });
  });
});
