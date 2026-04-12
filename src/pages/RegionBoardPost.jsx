/**
 * RegionBoardPost — 지역 게시판 상세 페이지
 *
 * /r/:regionId/board/:postId
 * 게시글 상세 조회 + 수정/삭제 (본인 또는 관리자)
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRegion } from '../context/RegionContext';
import { getBoardPost, deleteBoardPost, getBoardComments, addBoardComment, deleteBoardComment } from '../lib/storageAdapter';
import { getCurrentUser } from '../lib/authStore';

const CATEGORY_LABEL = {
  general:      '🗣️ 자유',
  info:         '📢 정보',
  question:     '❓ 질문',
  announcement: '📌 공지',
};

export default function RegionBoardPost() {
  const { regionId } = useRegion();
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [comments, setComments]       = useState([]);
  const [commentText, setCommentText] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  const me = getCurrentUser();
  const memberId = String(me?.memberId || window.__SU_SESSION__?.memberId || '').trim() || null;
  const sessionMemberId = String(window.__SU_SESSION__?.memberId || '').trim() || null;
  const candidateMemberIds = new Set([
    String(me?.memberId || '').trim(),
    String(me?.id || '').trim(),
    String(sessionMemberId || '').trim(),
    String(window.__SU_SESSION__?.id || '').trim(),
  ].filter(Boolean));
  const isAdmin  = !!window.__SU_ADMIN_SESSION__;

  useEffect(() => {
    if (!postId) return;
    loadPost();
  }, [postId]);

  useEffect(() => {
    if (postId) loadComments();
  }, [postId]);

  async function loadComments() {
    try {
      const data = await getBoardComments(postId);
      setComments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('[RegionBoardPost] loadComments error:', e);
    }
  }

  async function handleAddComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    const me = getCurrentUser();
    const currentMemberId = String(me?.memberId || window.__SU_SESSION__?.memberId || '').trim();
    if (!currentMemberId) {
      navigate('/auth', { state: { returnTo: `/r/${regionId}/board/${postId}` } });
      return;
    }
    setAddingComment(true);
    try {
      await addBoardComment(postId, {
        authorId: currentMemberId,
        authorName: me?.name || me?.email || window.__SU_SESSION__?.name || '익명',
        content: commentText.trim(),
      });
      setCommentText('');
      await loadComments();
    } catch (err) {
      alert(err.message || '댓글 등록에 실패했습니다.');
    } finally {
      setAddingComment(false);
    }
  }

  async function handleDeleteComment(commentId) {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      await deleteBoardComment(postId, commentId);
      await loadComments();
    } catch (err) {
      alert(err.message || '댓글 삭제에 실패했습니다.');
    }
  }

  async function loadPost() {
    setLoading(true);
    setError(null);
    try {
      const p = await getBoardPost(postId);
      if (!p) { setError('게시글을 찾을 수 없습니다.'); return; }
      setPost(p);
    } catch (e) {
      console.error('[RegionBoardPost] load error:', e);
      setError('게시글을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('이 게시글을 삭제하시겠습니까?')) return;
    setDeleting(true);
    try {
      await deleteBoardPost(postId);
      navigate(`/r/${regionId}/board`, { replace: true });
    } catch (e) {
      console.error('[RegionBoardPost] delete error:', e);
      alert('삭제에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setDeleting(false);
    }
  }

  function handleEdit() {
    navigate(`/r/${regionId}/board/write`, { state: { post } });
  }

  // ── 공통 레이아웃 wrapper ─────────────────────────────
  const pageStyle = {
    background: '#E8EDF2',
    minHeight: 'calc(100vh - 110px)',
    paddingBottom: 80,
  };
  const innerStyle = { maxWidth: 640, margin: '0 auto', padding: '0 16px' };

  // ── 뒤로가기 헤더 ─────────────────────────────────────
  function BackBar() {
    return (
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 0 10px', gap: 6 }}>
        <button
          type="button"
          onClick={() => navigate(`/r/${regionId}/board`)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px',
            fontSize: 15, color: 'var(--c-primary, #0E7490)', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          ← 목록
        </button>
      </div>
    );
  }

  // ── 로딩 ─────────────────────────────────────────────
  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={innerStyle}>
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--c-tx-d)', fontSize: 14 }}>
            로딩 중...
          </div>
        </div>
      </div>
    );
  }

  // ── 에러 / 404 ────────────────────────────────────────
  if (error || !post) {
    return (
      <div style={pageStyle}>
        <div style={innerStyle}>
          <div style={{ padding: '52px 24px', textAlign: 'center', borderRadius: 'var(--r-section, 20px)', background: '#F4F6F9' }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>😕</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-tx-h)', marginBottom: 8 }}>
              {error || '게시글을 찾을 수 없습니다.'}
            </div>
            <button
              type="button"
              onClick={() => navigate(`/r/${regionId}/board`)}
              style={{ marginTop: 12, padding: '10px 28px', borderRadius: 999, background: 'var(--c-primary)', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer' }}
            >
              목록으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  const postAuthorId = String(post.authorId || post.author_id || '').trim();
  const isAuthor = !!memberId && postAuthorId === memberId;
  const canEdit  = isAuthor || isAdmin;
  const canDeletePost = isAuthor;

  // ── 날짜 포맷 ─────────────────────────────────────────
  const createdDate = post.createdAt || post.created_at
    ? new Date(post.createdAt || post.created_at).toLocaleString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
      })
    : '';
  const updatedDate = (post.updatedAt || post.updated_at)
    && (post.updatedAt || post.updated_at) !== (post.createdAt || post.created_at)
    ? new Date(post.updatedAt || post.updated_at).toLocaleString('ko-KR', {
        month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
      })
    : null;

  return (
    <div style={pageStyle}>
      <div style={innerStyle}>
        <BackBar />

        {/* ── 게시글 본문 카드 ──────────────────────────── */}
        <article style={{
          background: 'var(--c-surface, #FFFFFF)',
          borderRadius: 'var(--r-section, 20px)',
          border: '1px solid var(--c-border, #E2E8F0)',
          boxShadow: 'var(--sh-xs), inset 0 1px 0 rgba(255,255,255,0.8)',
          padding: '20px 20px 18px',
          marginBottom: 12,
        }}>
          {/* 카테고리 뱃지 */}
          {post.category && (
            <div style={{
              display: 'inline-block',
              fontSize: 11, fontWeight: 700,
              padding: '3px 10px', borderRadius: 999, marginBottom: 12,
              background: 'var(--c-primary-t, #ECFEFF)', color: 'var(--c-primary, #0E7490)',
              border: '1px solid rgba(14,116,144,0.20)',
            }}>
              {CATEGORY_LABEL[post.category] || post.category}
            </div>
          )}

          {/* 제목 */}
          <h1 style={{ fontSize: 19, fontWeight: 800, color: 'var(--c-tx-h, #0F172A)', lineHeight: 1.4, margin: '0 0 12px' }}>
            {post.title}
          </h1>

          {/* 메타 정보 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--c-tx-d, #94A3B8)', marginBottom: 18, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, color: 'var(--c-tx-s, #475569)' }}>
              {post.authorName || post.author_name || post.author || '익명'}
            </span>
            <span>·</span>
            <span>{createdDate}</span>
            {updatedDate && (
              <>
                <span>·</span>
                <span style={{ color: 'var(--c-tx-d)', fontStyle: 'italic' }}>수정됨 {updatedDate}</span>
              </>
            )}
          </div>

          {/* 구분선 */}
          <div style={{ height: 1, background: 'var(--c-border, #E2E8F0)', marginBottom: 18 }} />

          {/* 본문 — 줄바꿈 보존 */}
          <div style={{ fontSize: 15, color: 'var(--c-tx-b, #1E293B)', lineHeight: 1.75, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {post.content}
          </div>
        </article>

        {/* ── 수정 / 삭제 버튼 (본인 or 관리자) ────────── */}
        {(canEdit || canDeletePost) && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 16 }}>
            {canEdit && (
              <button
                type="button"
                onClick={handleEdit}
                style={{
                  padding: '9px 22px', borderRadius: 999, background: 'var(--c-surface)', color: 'var(--c-primary)',
                  fontWeight: 700, fontSize: 13, border: '1.5px solid rgba(14,116,144,0.40)',
                  cursor: 'pointer', transition: 'box-shadow 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--sh-xs)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
              >
                수정
              </button>
            )}
            {canDeletePost && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  padding: '9px 22px', borderRadius: 999,
                  background: deleting ? '#F0F0F0' : 'rgba(239,68,68,0.08)',
                  color: 'var(--c-danger, #EF4444)',
                  fontWeight: 700, fontSize: 13, border: '1.5px solid rgba(239,68,68,0.30)',
                  cursor: deleting ? 'not-allowed' : 'pointer', transition: 'box-shadow 0.15s',
                }}
                onMouseEnter={e => { if (!deleting) e.currentTarget.style.boxShadow = '0 1px 6px rgba(239,68,68,0.20)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
              >
                {deleting ? '삭제 중...' : '삭제'}
              </button>
            )}
          </div>
        )}

        {/* ── 댓글 섹션 ──────────────────────────────── */}
        <section style={{
          background: 'var(--c-surface, #FFFFFF)',
          borderRadius: 'var(--r-section, 20px)',
          border: '1px solid var(--c-border, #E2E8F0)',
          padding: '18px 20px',
          marginBottom: 24,
        }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--c-tx-h)', marginBottom: 14 }}>
            댓글 {comments.length > 0 ? `(${comments.length})` : ''}
          </div>

          {/* 댓글 목록 */}
          {comments.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--c-tx-d)', padding: '12px 0', marginBottom: 14 }}>
              첫 댓글을 남겨보세요.
            </div>
          ) : (
            <div style={{ marginBottom: 14 }}>
              {comments.map(c => {
                const commentAuthorId = String(c.authorId || c.author_id || '').trim();
                const isCommentAuthor = !!commentAuthorId && candidateMemberIds.has(commentAuthorId);
                const canDelComment   = isCommentAuthor;
                return (
                  <div key={c.id} style={{
                    borderBottom: '1px solid var(--c-border, #E2E8F0)',
                    padding: '10px 0',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8,
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--c-tx-b)' }}>{c.authorName || '익명'}</span>
                        <span style={{ fontSize: 11, color: 'var(--c-tx-d)' }}>
                          {c.createdAt ? new Date(c.createdAt).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <div style={{ fontSize: 14, color: 'var(--c-tx-b)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {c.content}
                      </div>
                    </div>
                    {canDelComment && (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(c.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--c-tx-d)', padding: '2px 6px', borderRadius: 4, flexShrink: 0 }}
                      >
                        삭제
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 댓글 입력 */}
          {memberId ? (
            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="댓글을 입력하세요..."
                rows={2}
                disabled={addingComment}
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: 10,
                  border: '1px solid var(--c-border, #E2E8F0)',
                  background: 'var(--c-bg, #F8FAFC)',
                  fontSize: 13, color: 'var(--c-tx-b)', resize: 'none', outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={addingComment || !commentText.trim()}
                style={{
                  padding: '10px 18px', borderRadius: 10, border: 'none',
                  background: 'var(--c-primary, #0E7490)', color: '#fff',
                  fontWeight: 700, fontSize: 13, cursor: addingComment ? 'not-allowed' : 'pointer',
                  opacity: addingComment || !commentText.trim() ? 0.6 : 1, flexShrink: 0,
                }}
              >
                {addingComment ? '등록 중...' : '등록'}
              </button>
            </form>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--c-tx-d)', padding: '10px 0' }}>
              댓글을 작성하려면{' '}
              <button
                type="button"
                onClick={() => navigate('/auth', { state: { returnTo: `/r/${regionId}/board/${postId}` } })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-primary)', fontWeight: 700, fontSize: 13, padding: 0 }}
              >
                로그인
              </button>
              이 필요합니다.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
