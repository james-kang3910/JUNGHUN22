/**
 * RegionBoard — 지역 게시판
 * 
 * /r/:regionId/board
 * 지역별 자유 게시판입니다.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegion } from '../context/RegionContext';
import { useBuildRegionPath } from '../hooks/useBuildRegionPath';
import { getBoards } from '../lib/storageAdapter';

export default function RegionBoard() {
  const { regionId } = useRegion();
  const toRegion = useBuildRegionPath();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!regionId) return;
    loadPosts();
  }, [regionId]);

  async function loadPosts() {
    setLoading(true);
    setError(null);
    try {
      const list = await getBoards({ regionId });
      setPosts(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('[RegionBoard] load error:', e);
      setError('게시글을 불러올 수 없습니다.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  // ── 카드: Elevated (클릭 목적 카드) ────────────────────
  const cardStyle = {
    padding: '14px 16px',
    borderRadius: 'var(--r-card, 16px)',
    border: '1px solid var(--c-border, #E2E8F0)',
    background: 'var(--c-surface, #FFFFFF)',
    boxShadow: 'var(--sh-xs), inset 0 1px 0 rgba(255,255,255,0.8)',
    cursor: 'pointer',
    transition: 'box-shadow 0.18s, transform 0.15s',
  };

  return (
    <div style={{ background: '#E8EDF2', minHeight: 'calc(100vh - 110px)', paddingBottom: 80 }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px' }}>

        {/* 인콘텐츠 타이틀 행 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0 14px' }}>
          <h1 style={{ fontSize: 17, fontWeight: 700, color: 'var(--c-tx-h, #0F172A)', paddingLeft: 11, borderLeft: '3px solid var(--c-primary, #0E7490)', margin: 0 }}>
            게시판
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!loading && (
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-tx-d)', background: 'var(--c-subtle)', borderRadius: 999, padding: '3px 10px' }}>
                {posts.length}개의 이야기
              </span>
            )}
            <button
              type="button"
              style={{ padding: '7px 16px', borderRadius: 'var(--r-badge, 999px)', background: 'var(--c-primary)', color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer', boxShadow: 'var(--sh-xs)', transition: 'box-shadow 0.18s, transform 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--sh-hover)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--sh-xs)'; e.currentTarget.style.transform = 'none'; }}
              onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; e.currentTarget.style.boxShadow = 'none'; }}
              onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onClick={() => navigate(toRegion('/board/write'))}
            >
              + 글쓰기
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--c-tx-d)', fontSize: 14 }}>로딩 중...</div>
        ) : error ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', borderRadius: 'var(--r-section, 20px)', background: '#F4F6F9', color: 'var(--c-tx-d)', fontSize: 14 }}>{error}</div>
        ) : posts.length === 0 ? (
          <div style={{ padding: '52px 24px', textAlign: 'center', borderRadius: 'var(--r-section, 20px)', background: '#F4F6F9' }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>💬</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-tx-h)', marginBottom: 8 }}>아직 이야기가 없어요</div>
            <div style={{ fontSize: 13, color: 'var(--c-tx-s)', lineHeight: 1.6, marginBottom: 24 }}>이 지역의 첫 번째 글을 남겨보세요</div>
            <button
              type="button"
              style={{ padding: '11px 28px', borderRadius: 'var(--r-badge, 999px)', background: 'var(--c-primary)', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: 'var(--sh-sm)', transition: 'box-shadow 0.18s, transform 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--sh-hover)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--sh-sm)'; e.currentTarget.style.transform = 'none'; }}
              onClick={() => navigate(toRegion('/board/write'))}
            >
              지금 글쓰기
            </button>
          </div>
        ) : (
          <div style={{ background: '#F4F6F9', borderRadius: 'var(--r-section, 20px)', padding: '8px 12px 12px', display: 'grid', gap: 8 }}>
            {posts.map(post => (
              <div
                key={post.id || post.boardId}
                style={cardStyle}
                onClick={() => navigate(toRegion(`/board/${post.id || post.boardId}`))}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--sh-hover)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--sh-xs), inset 0 1px 0 rgba(255,255,255,0.8)'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 5 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--c-tx-h, #0F172A)', lineHeight: 1.4, flex: 1 }}>
                    {post.title}
                    {(post.commentsCount || post.commentCount || 0) >= 5 && (
                      <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 800, background: 'var(--c-gold-t)', color: 'var(--c-gold)', borderRadius: 999, padding: '1px 7px', verticalAlign: 'middle' }}>🔥 HOT</span>
                    )}
                  </div>
                  {(post.commentsCount || post.commentCount || 0) > 0 && (
                    <span style={{ fontSize: 11, color: 'var(--c-primary)', fontWeight: 700, background: 'var(--c-primary-t)', borderRadius: 999, padding: '2px 8px', flexShrink: 0 }}>
                      💬 {post.commentsCount || post.commentCount || 0}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--c-tx-d, #94A3B8)', display: 'flex', gap: 8 }}>
                  <span>{post.author || '익명'}</span>
                  <span>·</span>
                  <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString('ko-KR') : ''}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
