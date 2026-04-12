import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import VideoEmbed from "../components/VideoEmbed";
import * as storageAdapter from "../lib/storageAdapter";
import { getMe } from "../lib/authStore";
import ContextHeader from "../components/ContextHeader";

function timeAgo(ts) {
  const ms = typeof ts === 'number' ? ts : new Date(ts).getTime();
  if (!Number.isFinite(ms)) return '';
  const diff = Math.floor((Date.now() - ms) / 1000);
  if (diff < 60) return '방금';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export default function BroadcastDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [broadcast, setBroadcast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [me, setMe] = useState(() => getMe());
  const inputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const b = await storageAdapter.getBroadcastById(id);
        if (!cancelled) setBroadcast(b || null);
      } catch (e) {
        console.error('[BroadcastDetail] Failed to load broadcast:', e);
        if (!cancelled) setBroadcast(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // state로 전달받은 videoUrl/title (Home에서 클릭 시)
  const stateVideoUrl = location.state?.videoUrl || null;
  const stateTitle = location.state?.title || null;

  const heroVideoUrl = stateVideoUrl || broadcast?.videoUrl || broadcast?.mediaUrl || null;
  const heroTitle = stateTitle || broadcast?.title || (loading ? '불러오는 중...' : `공유방송 #${id}`);

  // comments
  const [comments, setComments] = useState([]);

  const [text, setText] = useState("");

  useEffect(() => {
    // ★ 서버 DB에서 댓글 로드 (SSOT)
    async function loadComments() {
      try {
        const serverComments = await storageAdapter.getBroadcastComments(id);
        setComments(Array.isArray(serverComments) ? serverComments : []);
      } catch (e) {
        console.error('[BroadcastDetail] Failed to load comments:', e);
        setComments([]);
      }
    }
    loadComments();

    // ★ BROADCAST_UPDATED 이벤트 리스닝 (다중 탭 실시간 동기화)
    const handleBroadcastUpdate = (e) => {
      if (e.detail?.broadcastId === id) {
        console.log('[BroadcastDetail] BROADCAST_UPDATED event received, reloading comments...');
        loadComments();
      }
    };
    window.addEventListener('BROADCAST_UPDATED', handleBroadcastUpdate);
    
    return () => {
      window.removeEventListener('BROADCAST_UPDATED', handleBroadcastUpdate);
    };
  }, [id]);

  // SSOT proxy: listen centrally and re-dispatch storage event for local handlers
  React.useEffect(() => {
    let listenerId = null;
    try {
      const { register, unregister } = require('../lib/ssotRegistry');
      listenerId = register(['*'], () => {
        try { window.dispatchEvent(new StorageEvent('storage', { key: 'su_ssot_reload', newValue: Date.now().toString() })); } catch (e) { window.dispatchEvent(new Event('su:ssot_proxy')); }
      });
    } catch (e) {}
    return () => { try { if (listenerId) { const { unregister } = require('../lib/ssotRegistry'); unregister(listenerId); } } catch (e) {} };
  }, []);

  const handleAddComment = async () => {
    const t = String(text || "").trim();
    if (!t) return;
    
    // ★ 서버 DB에 댓글 저장 (SSOT)
    try {
      // authStore에서 실제 사용자 정보 가져오기
      const me = getMe();
      if (!me) {
        window.alert("로그인이 필요합니다.");
        return;
      }
      
      const userId = String(me.id || me.memberId);
      const userName = me.name || "익명";
      
      await storageAdapter.addBroadcastComment({
        broadcastId: id,
        userId,
        userName,
        comment: t,
      });
      
      // 서버에서 최신 댓글 목록 다시 로드
      const updated = await storageAdapter.getBroadcastComments(id);
      setComments(Array.isArray(updated) ? updated : []);
      setText("");
      
      // ★ BROADCAST_UPDATED 이벤트 발생 (다중 탭 실시간 동기화)
      window.dispatchEvent(new CustomEvent('BROADCAST_UPDATED', {
        detail: { broadcastId: id, type: 'comment' },
      }));
    } catch (e) {
      console.error('[BroadcastDetail] Failed to add comment:', e);
      window.alert("댓글 저장에 실패했습니다.");
    }
  };

  const handleCommentKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  // 지역명 표시
  const regionName = broadcast?.regionName || broadcast?.region || null;
  // 등록일
  const publishedDate = broadcast?.publishedAt || broadcast?.createdAt
    ? new Date(broadcast?.publishedAt || broadcast?.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  // 아바타 이니셜 (이름 첫글자)
  const getInitial = (name) => (name || '?')[0].toUpperCase();
  const avatarColors = ['#0C5460','#065F46','#1E40AF','#7C3AED','#B45309','#9D174D'];
  const getAvatarColor = (name) => avatarColors[(name || '').charCodeAt(0) % avatarColors.length];

  return (
    <div className="su-page su-broadcast-detail" style={{ paddingBottom: 80 }}>
      <ContextHeader title={heroTitle} onBack={() => navigate(-1)} />

      {/* ── 영상 플레이어 ── */}
      <section className="su-panel" style={{ padding: 0, overflow: 'hidden', marginBottom: 10 }}>
        <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%' }}>
          {heroVideoUrl ? (
            <div style={{ position: 'absolute', inset: 0 }}>
              <VideoEmbed url={heroVideoUrl} mode="full" />
            </div>
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(12,84,96,0.08)' }}>
              <div style={{ fontSize: 36 }}>📭</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-tx-s)' }}>등록된 영상이 없습니다</div>
            </div>
          )}
        </div>
      </section>

      {/* ── 방송 정보 ── */}
      <section className="su-panel" style={{ marginBottom: 10 }}>
        {loading ? (
          <div style={{ opacity: 0.5, fontSize: 14 }}>불러오는 중...</div>
        ) : (
          <>
            <h1 style={{ fontSize: 17, fontWeight: 800, color: 'var(--c-tx-h)', margin: '0 0 10px', lineHeight: 1.4 }}>
              {heroTitle}
            </h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: 'rgba(12,84,96,0.12)', color: '#0C5460' }}>
                📺 공유방송
              </span>
              {regionName && (
                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999, background: 'rgba(12,84,96,0.08)', color: 'var(--c-tx-s)' }}>
                  📍 {regionName}
                </span>
              )}
              {publishedDate && (
                <span style={{ fontSize: 12, color: 'var(--c-tx-s)', opacity: 0.7 }}>{publishedDate}</span>
              )}
            </div>
            {broadcast?.description && (
              <p style={{ marginTop: 10, fontSize: 14, color: 'var(--c-tx-s)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {broadcast.description}
              </p>
            )}
          </>
        )}
      </section>

      {/* ── 댓글 섹션 ── */}
      <section className="su-panel">
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--c-border)' }}>
          <span style={{ fontSize: 16 }}>💬</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--c-tx-h)' }}>댓글</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-primary)', background: 'rgba(12,84,96,0.1)', borderRadius: 999, padding: '1px 8px' }}>
            {comments.length}
          </span>
        </div>

        {/* 입력 영역 */}
        {me ? (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 20 }}>
            {/* 아바타 */}
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${getAvatarColor(me.name)}, ${getAvatarColor(me.name)}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0, boxShadow: '0 2px 8px rgba(12,84,96,0.25)' }}>
              {getInitial(me.name)}
            </div>
            <div style={{ flex: 1 }}>
              <textarea
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleCommentKey}
                placeholder="댓글을 입력하세요 (Shift+Enter 줄바꿈)"
                rows={2}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--c-border)', background: 'var(--c-subtle, rgba(12,84,96,0.04))', color: 'var(--c-tx-h)', fontSize: 14, resize: 'none', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                onFocus={(e) => { e.target.style.borderColor = '#0C5460'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--c-border)'; }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                <button
                  type="button"
                  onClick={handleAddComment}
                  disabled={!text.trim()}
                  style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: text.trim() ? 'linear-gradient(135deg, #0C5460, #0a7a8a)' : 'rgba(12,84,96,0.2)', color: text.trim() ? '#fff' : 'var(--c-tx-s)', fontSize: 13, fontWeight: 700, cursor: text.trim() ? 'pointer' : 'default', transition: 'all 0.15s', boxShadow: text.trim() ? '0 2px 8px rgba(12,84,96,0.3)' : 'none' }}
                >
                  등록
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 10, background: 'rgba(12,84,96,0.05)', border: '1px solid var(--c-border)', marginBottom: 20 }}>
            <span style={{ fontSize: 14, color: 'var(--c-tx-s)' }}>로그인 후 댓글을 작성할 수 있습니다.</span>
            <button
              type="button"
              onClick={() => navigate('/auth')}
              style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: '#0C5460', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              로그인
            </button>
          </div>
        )}

        {/* 댓글 목록 */}
        {comments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--c-tx-s)', fontSize: 14, opacity: 0.7 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🗨️</div>
            첫 번째 댓글을 남겨보세요.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {comments.map((c, i) => (
              <div key={c.id || i} style={{ display: 'flex', gap: 10, padding: '14px 0', borderBottom: i < comments.length - 1 ? '1px solid var(--c-border)' : 'none' }}>
                {/* 아바타 */}
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg, ${getAvatarColor(c.authorName)}, ${getAvatarColor(c.authorName)}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                  {getInitial(c.authorName)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-tx-h)' }}>{c.authorName || '익명'}</span>
                    <span style={{ fontSize: 11, color: 'var(--c-tx-s)', opacity: 0.6 }}>{timeAgo(c.createdAt)}</span>
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--c-tx-h)', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{c.text}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
