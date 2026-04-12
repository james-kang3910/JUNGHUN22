/**
 * RegionBoardWrite — 지역 게시판 글쓰기 / 수정
 *
 * 라우트:
 *   /r/:regionId/board/write              → 신규 작성
 *   /r/:regionId/board/write (state.post) → 기존 글 수정 (location.state.post로 기존 데이터 수신)
 *
 * RegionLayout Outlet으로 렌더링됩니다.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { useRegion } from '../context/RegionContext';
import { createBoardPost, updateBoardPost } from '../lib/storageAdapter';
import { getCurrentUser } from '../lib/authStore';

const CATEGORIES = [
  { value: 'general',      label: '🗣️ 자유' },
  { value: 'info',         label: '📢 정보' },
  { value: 'question',     label: '❓ 질문' },
  { value: 'announcement', label: '📌 공지' },
];

// ── 스타일 상수 ────────────────────────────────────────────
const fieldGroupStyle = { marginBottom: 16 };

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--c-tx-h, #0F172A)',
  marginBottom: 6,
};

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 'var(--r-input, 10px)',
  border: '1.5px solid var(--c-border, #E2E8F0)',
  background: 'var(--c-surface, #FFFFFF)',
  color: 'var(--c-tx-h, #0F172A)',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

const charCountStyle = {
  display: 'block',
  textAlign: 'right',
  fontSize: 11,
  color: 'var(--c-tx-d, #94A3B8)',
  marginTop: 4,
};

const submitBtnStyle = {
  width: '100%',
  padding: '14px',
  borderRadius: 'var(--r-badge, 999px)',
  border: 'none',
  background: 'var(--c-primary, #0E7490)',
  color: '#fff',
  fontSize: 15,
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: 'var(--sh-sm)',
  transition: 'opacity 0.15s, transform 0.15s',
};

export default function RegionBoardWrite() {
  const { regionId } = useRegion();
  const navigate = useNavigate();
  const location = useLocation();
  const editPost = location.state?.post || null; // 수정 모드 시 기존 데이터

  const [title, setTitle]       = useState(editPost?.title || '');
  const [content, setContent]   = useState(editPost?.content || '');
  const [category, setCategory] = useState(editPost?.category || 'general');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');

  // 로그인 가드
  useEffect(() => {
    const session = typeof window !== 'undefined' ? window.__SU_SESSION__ : null;
    if (!session?.memberId) {
      navigate('/auth', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) { setError('제목을 입력하세요.'); return; }
    if (!trimmedContent) { setError('내용을 입력하세요.'); return; }

    setSubmitting(true);
    setError('');

    const me = getCurrentUser();
    const memberId = me?.memberId || window.__SU_SESSION__?.memberId;
    const authorName = me?.name || me?.email || '익명';

    try {
      if (editPost) {
        await updateBoardPost(
          editPost.id,
          { title: trimmedTitle, content: trimmedContent, category }
        );
      } else {
        await createBoardPost({
          regionId,
          title: trimmedTitle,
          content: trimmedContent,
          category,
          authorId: memberId,
          authorName,
        });
      }
      navigate(`/r/${regionId}/board`, { replace: true });
    } catch (e) {
      console.error('[RegionBoardWrite] submit error:', e);
      setError(e.message || '저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: '#E8EDF2', minHeight: 'calc(100vh - 110px)', paddingBottom: 80 }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px' }}>

        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 0 20px' }}>
          <BackButton tone="neutral" onClick={() => navigate(`/r/${regionId}/board`)} />
          <h1 style={{ fontSize: 17, fontWeight: 800, color: 'var(--c-tx-h, #0F172A)', margin: 0 }}>
            {editPost ? '게시글 수정' : '글쓰기'}
          </h1>
        </div>

        {/* 폼 배경 카드 */}
        <div style={{
          background: 'var(--c-surface, #FFFFFF)',
          borderRadius: 'var(--r-section, 20px)',
          border: '1px solid var(--c-border, #E2E8F0)',
          boxShadow: 'var(--sh-xs)',
          padding: '20px 16px 24px',
        }}>
          <form onSubmit={handleSubmit}>

            {/* 카테고리 */}
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>카테고리</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {CATEGORIES.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCategory(c.value)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 999,
                      border: '1.5px solid',
                      borderColor: category === c.value ? 'var(--c-primary, #0E7490)' : 'var(--c-border, #E2E8F0)',
                      background: category === c.value ? 'var(--c-primary-t, #ECFEFF)' : 'transparent',
                      color: category === c.value ? 'var(--c-primary, #0E7490)' : 'var(--c-tx-s, #64748B)',
                      fontSize: 13,
                      fontWeight: category === c.value ? 700 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 제목 */}
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                제목 <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value.slice(0, 80))}
                placeholder="제목을 입력하세요"
                maxLength={80}
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'var(--c-primary, #0E7490)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--c-border, #E2E8F0)'; }}
              />
              <span style={charCountStyle}>{title.length}/80</span>
            </div>

            {/* 내용 */}
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                내용 <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value.slice(0, 2000))}
                placeholder="내용을 입력하세요"
                rows={10}
                style={{ ...inputStyle, resize: 'vertical', minHeight: 160 }}
                onFocus={e => { e.target.style.borderColor = 'var(--c-primary, #0E7490)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--c-border, #E2E8F0)'; }}
              />
              <span style={charCountStyle}>{content.length}/2000</span>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 10,
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#EF4444',
                fontSize: 13,
                marginBottom: 16,
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                ...submitBtnStyle,
                opacity: submitting ? 0.6 : 1,
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? '처리 중...' : (editPost ? '수정 완료' : '게시하기')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
