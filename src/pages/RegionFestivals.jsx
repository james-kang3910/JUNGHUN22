/**
 * RegionFestivals — 지역행사 목록 + 상세 + 댓글
 * /r/:regionId/festivals
 */
import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useRegion } from '../context/RegionContext';
import {
  getRegionFestivals,
  createRegionFestival,
  getRegionFestivalComments,
  createRegionFestivalComment,
  deleteRegionFestivalComment,
} from '../lib/storageAdapter';
import { getCurrentUser } from '../lib/authStore';

function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  return `${dt.getFullYear()}.${String(dt.getMonth()+1).padStart(2,'0')}.${String(dt.getDate()).padStart(2,'0')}`;
}

export default function RegionFestivals() {
  const { regionId } = useRegion();
  useOutletContext() || {};
  const me = getCurrentUser();

  const [festivals,   setFestivals]   = useState([]);
  const [detail,      setDetail]      = useState(null);
  const [comments,    setComments]    = useState([]);
  const [commentText, setCommentText] = useState('');
  const [showWrite,   setShowWrite]   = useState(false);
  const [form,        setForm]        = useState({ title: '', content: '', location: '' });
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);

  const load = useCallback(async () => {
    if (!regionId) return;
    setLoading(true);
    try {
      const data = await getRegionFestivals(regionId);
      setFestivals(data?.festivals || data || []);
    } catch { setFestivals([]); } finally { setLoading(false); }
  }, [regionId]);

  useEffect(() => { load(); }, [load]);

  const openDetail = async (f) => {
    setDetail(f);
    setComments([]);
    setCommentText('');
    try {
      const res = await getRegionFestivalComments(regionId, f.festival_id || f.id);
      setComments(res?.comments || res || []);
    } catch {}
  };

  const submitComment = async () => {
    if (!commentText.trim() || !me) return;
    const fid = detail.festival_id || detail.id;
    setSubmitting(true);
    try {
      console.log('Creating comment:', { regionId, fid, content: commentText.trim() });
      await createRegionFestivalComment(regionId, fid, { content: commentText.trim() });
      console.log('Comment created successfully');
      setCommentText('');
      const res = await getRegionFestivalComments(regionId, fid);
      const comments = res?.comments || res || [];
      console.log('Fetched comments:', comments);
      setComments(comments);
    } catch (err) {
      console.error('Error creating comment:', err);
      alert('댓글 등록 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCmt = async (commentId) => {
    const fid = detail.festival_id || detail.id;
    try {
      console.log('Deleting comment:', { regionId, fid, commentId });
      await deleteRegionFestivalComment(regionId, fid, commentId);
      console.log('Comment deleted successfully');
      setComments(prev => prev.filter(c => {
        const cid = c.comment_id || c.commentId || c.id;
        return cid !== commentId;
      }));
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('댓글 삭제 중 오류가 발생했습니다.');
    }
  };

  const submitFestival = async () => {
    if (!form.title.trim() || !me) return;
    setSubmitting(true);
    try {
      await createRegionFestival(regionId, { title: form.title, content: form.content, location: form.location });
      setShowWrite(false);
      setForm({ title: '', content: '', location: '' });
      load();
    } catch {} finally { setSubmitting(false); }
  };

  // ── 상세 뷰 ──
  if (detail) {
    const images = detail.images || [];
    return (
      <div style={{ minHeight: '100vh', background: '#F5F8FA', paddingBottom: 80 }}>
        <div style={{ padding: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>{detail.title}</h2>
          <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>
            {detail.location && `📍 ${detail.location}`}
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8 }}>
            {(detail.start_at || detail.end_at) && `${fmtDate(detail.start_at)}${detail.end_at ? ` ~ ${fmtDate(detail.end_at)}` : ''} · `}
            {fmtDate(detail.created_at)}
          </div>
          <div style={{ borderBottom: '1px solid #E2E8F0', marginBottom: 16 }} />
          <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>{detail.content}</p>
          
          {/* 이미지들 */}
          {images.map((img, i) => (
            <img key={i} src={img.url || img} alt="" style={{ width: '100%', borderRadius: 12, marginTop: 12, display: 'block' }} />
          ))}

          {/* 댓글 섹션 */}
          <div style={{ borderTop: '1px solid #E2E8F0', marginTop: 24, paddingTop: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>💬 댓글 {comments.length}개</div>
            {comments.map(c => {
              const cid    = c.comment_id || c.commentId || c.id;
              const authorId = c.author_id || c.authorId;
              const isMine = me && String(me.memberId) === String(authorId);
              return (
                <div key={cid} style={{ background: '#fff', borderRadius: 12, padding: '10px 14px', marginBottom: 8, border: '1px solid rgba(14,116,144,0.10)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: '#94A3B8' }}>{c.author_name || c.authorName || authorId} · {fmtDate(c.created_at || c.createdAt)}</span>
                    {isMine && (
                      <button onClick={() => deleteCmt(cid)}
                        style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: 11, cursor: 'pointer', padding: '2px 4px' }}>삭제</button>
                    )}
                  </div>
                  <div style={{ fontSize: 14, color: '#334155' }}>{c.content}</div>
                </div>
              );
            })}
            {me ? (
              <div style={{ display: 'flex', gap: 8, marginTop: 8, position: 'sticky', bottom: 72, background: '#F5F8FA', padding: '8px 0' }}>
                <input value={commentText} onChange={e => setCommentText(e.target.value)}
                  placeholder="댓글을 입력하세요"
                  style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid #DDE3EA', fontSize: 14, outline: 'none', backgroundColor: '#fff', color: '#0F172A' }}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(); } }}
                />
                <button onClick={submitComment} disabled={submitting || !commentText.trim()}
                  style={{ background: '#0E7490', color: '#fff', border: 'none', borderRadius: 10, padding: '0 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: (!commentText.trim() || submitting) ? 0.5 : 1 }}>
                  등록
                </button>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 8 }}>댓글을 쓰려면 로그인하세요.</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── 목록 뷰 ──
  return (
    <div style={{ minHeight: '100vh', background: '#F5F8FA', paddingBottom: 80, position: 'relative' }}>
      <div style={{ padding: '12px 16px 0' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#94A3B8', padding: '32px 0' }}>불러오는 중...</div>
        ) : festivals.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94A3B8', padding: '32px 0' }}>등록된 지역행사가 없습니다.</div>
        ) : (
          festivals.map(f => {
            const thumb    = f.images?.[0];
            const thumbUrl = thumb?.url || thumb || null;
            return (
              <button key={f.festival_id || f.id} onClick={() => openDetail(f)}
                style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: '#fff', borderRadius: 16, padding: '12px 14px', marginBottom: 8, border: '1px solid rgba(14,116,144,0.10)', boxShadow: '0 2px 8px rgba(14,116,144,0.06)', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
                {thumbUrl
                  ? <img src={thumbUrl} alt={f.title} style={{ width: 80, height: 80, borderRadius: 16, objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: 80, height: 80, borderRadius: 16, background: '#F1F5F9', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🎉</div>}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.title}</div>
                  {f.location && (
                    <div style={{ fontSize: 12, color: '#64748B', marginBottom: 2 }}>📍 {f.location}</div>
                  )}
                  {(f.start_at || f.end_at) && (
                    <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>
                      {fmtDate(f.start_at)}{f.end_at ? ` ~ ${fmtDate(f.end_at)}` : ''}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>
                    {fmtDate(f.created_at)} · 💬 {f.comment_count ?? 0}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>


    </div>
  );
}
