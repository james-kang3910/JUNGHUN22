// ✨ ADD: 오디션 비디오 모달 (클릭하면 재생)
import React, { useEffect, useState } from "react";
import { parseYouTubeId } from "../lib/videoUtils";
import VideoEmbed from "./VideoEmbed";
import { getCurrentUser, getSession, isLoggedIn as isAuthLoggedIn } from "../lib/authStore";
import { canAccessRegionalConsole } from "../lib/permissions";
import * as storageAdapter from "../lib/storageAdapter";

export default function AuditionVideoModal({ video, onClose, onVote, previewMode = false }) {
  const [voting, setVoting] = useState(false);
  const [voted, setVoted] = useState(false);
  const [toast, setToast] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [expandedComments, setExpandedComments] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingDraft, setEditingDraft] = useState("");
  const [commentError, setCommentError] = useState("");

  const session = getSession();
  const currentUser = getCurrentUser();
  const currentMemberId = String(session?.memberId || currentUser?.memberId || currentUser?.id || "");
  const currentRole = String(currentUser?.role || session?.role || 'USER').toUpperCase();
  const canModerateComments = canAccessRegionalConsole(currentRole);
  const isLoggedIn = isAuthLoggedIn() || !!currentMemberId || !!currentUser;
  const isClosedAudition = !!video?.auditionClosed;

  const formatCommentDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const loadComments = async () => {
    if (!video?.auditionId || !video?.id) return;
    setCommentsLoading(true);
    setCommentError('');
    try {
      const list = await storageAdapter.getAuditionSubmissionComments(video.auditionId, video.id);
      setComments(Array.isArray(list) ? list : []);
    } catch (err) {
      setCommentError(err.message || '댓글을 불러오지 못했습니다.');
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    setCommentDraft('');
    setEditingCommentId(null);
    setEditingDraft('');
    setExpandedComments(false);
    if (!previewMode) loadComments();
  }, [video?.auditionId, video?.id, previewMode]);

  const handleCommentSubmit = async () => {
    const content = String(commentDraft || '').trim();
    if (!content || !video?.auditionId || !video?.id || commentSubmitting || isClosedAudition) return;
    setCommentSubmitting(true);
    setCommentError('');
    try {
      const created = await storageAdapter.createAuditionSubmissionComment(video.auditionId, video.id, content);
      setComments((prev) => [created, ...prev]);
      setCommentDraft('');
      setToast({ type: 'success', message: '댓글이 등록되었습니다.' });
    } catch (err) {
      setCommentError(err.message || '댓글 등록에 실패했습니다.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleCommentDelete = async (comment) => {
    if (!video?.auditionId || !video?.id || !comment?.id) return;
    try {
      await storageAdapter.deleteAuditionSubmissionComment(video.auditionId, video.id, comment.id);
      setComments((prev) => prev.filter((item) => String(item.id) !== String(comment.id)));
      setToast({ type: 'success', message: '댓글이 삭제되었습니다.' });
    } catch (err) {
      setCommentError(err.message || '댓글 삭제에 실패했습니다.');
    }
  };

  const handleCommentUpdate = async (comment) => {
    const content = String(editingDraft || '').trim();
    if (!content || !video?.auditionId || !video?.id || !comment?.id) return;
    try {
      const updated = await storageAdapter.updateAuditionSubmissionComment(video.auditionId, video.id, comment.id, content);
      setComments((prev) => prev.map((item) => String(item.id) === String(comment.id) ? updated : item));
      setEditingCommentId(null);
      setEditingDraft('');
      setToast({ type: 'success', message: '댓글이 수정되었습니다.' });
    } catch (err) {
      setCommentError(err.message || '댓글 수정에 실패했습니다.');
    }
  };
  
  // ✨ ADD: ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleVote = async () => {
    if (!video?.id || voting || voted || isClosedAudition) return;
    setVoting(true);
    try {
      const session = getSession();
      const token = session?.token;
      const res = await fetch(`/api/auditions/${video.auditionId}/submissions/${video.id}/vote`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include', // ✅ 서버 DB 세션(su_token 쿠키) 자동 전달
      });
      if (!res.ok) {
        const data = await res.json();
        if (data.error === 'Already voted') {
          setToast({ type: 'info', message: '이미 투표하셨습니다' });
          setVoted(true);
        } else {
          throw new Error(data.error || 'Vote failed');
        }
      } else {
        setToast({ type: 'success', message: '투표 완료! ❤️' });
        setVoted(true);
        if (onVote) onVote(video.id);
      }
    } catch (err) {
      console.error('[Vote] Error:', err);
      setToast({ type: 'error', message: '투표 실패: ' + (err.message || '') });
    } finally {
      setVoting(false);
    }
  };


  if (!video) return null;

  const youtubeId = parseYouTubeId(video.mediaUrl);
  const isYoutube = !!youtubeId;
  
  useEffect(() => {
    setVoted(!!video?.voted);
  }, [video?.voted, video?.id]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);
  
  // ✅ 유효하지 않은 URL 체크: http(s)://, /uploads/ 시작하는 상대경로, data: 모두 허용
  if (!video.mediaUrl || (!isYoutube && !video.mediaUrl.startsWith('http') && !video.mediaUrl.startsWith('/') && !video.mediaUrl.startsWith('data:'))) {
    return (
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.92)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}
      >
        <div style={{ textAlign: "center", color: "#fff", padding: "20px" }}>
          <p style={{ fontSize: "18px", marginBottom: "10px" }}>⚠️ 영상 URL이 올바르지 않습니다</p>
          <p style={{ fontSize: "14px", color: "#999", marginBottom: "20px" }}>
            URL: {video.mediaUrl || '(없음)'}
          </p>
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              background: "#ef4444",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            닫기
          </button>
        </div>
      </div>
    );
  }

  const visibleComments = expandedComments ? comments : comments.slice(0, 5);
  const approvalLabel = (() => {
    const status = String(video?.approvalStatus || '').toLowerCase();
    if (status === 'approved') return { text: '공개', color: '#22c55e' };
    if (status === 'rejected') return { text: '거절', color: '#ef4444' };
    if (status === 'pending') return { text: '승인대기', color: '#f59e0b' };
    return null;
  })();

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.92)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "900px",
          background: "#1a1a1a",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* ✨ ADD: 헤더 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#fff", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {video.name || "참가자"}
            </h3>
            {previewMode && approvalLabel ? (
              <span style={{ flexShrink: 0, padding: '3px 8px', borderRadius: 999, background: `${approvalLabel.color}22`, color: approvalLabel.color, fontSize: 11, fontWeight: 800 }}>
                {approvalLabel.text}
              </span>
            ) : null}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              color: "#999",
              cursor: "pointer",
              padding: "0 8px",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#999")}
          >
            ✕
          </button>
        </div>

        {/* ✨ ADD: 비디오 영역 (autoplay) - use VideoEmbed for consistent handling */}
        <div style={{ position: "relative", paddingTop: "56.25%", background: "#000" }}>
            <div style={{ position: "absolute", inset: 0 }}>
            <VideoEmbed url={video.mediaUrl} mode="full" autoplay={true} thumbnail={video.thumbnail} />
          </div>
        </div>

        {/* Toast (non-blocking) */}
        {toast && (
          <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10000 }}>
            <div style={{ background: toast.type === 'error' ? '#b91c1c' : toast.type === 'success' ? '#059669' : '#374151', color: '#fff', padding: '8px 12px', borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.4)' }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{toast.message}</div>
            </div>
          </div>
        )}

        {/* ✨ ADD: 푸터 (투표 버튼 추가) */}
        {!previewMode && (
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "13px", color: "#999" }}>
            {video.type && `타입: ${video.type}`}
          </div>
          <button
            onClick={handleVote}
            disabled={voting || voted || isClosedAudition}
            style={{
              padding: "8px 16px",
              background: voted || isClosedAudition ? "rgba(100,100,100,0.3)" : "rgba(255,20,147,0.2)",
              border: voted || isClosedAudition ? "1px solid rgba(100,100,100,0.5)" : "1px solid rgba(255,20,147,0.5)",
              borderRadius: "8px",
              color: voted || isClosedAudition ? "#999" : "#ff1493",
              fontSize: "14px",
              fontWeight: "700",
              cursor: voting || voted || isClosedAudition ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!voted && !voting && !isClosedAudition) {
                e.currentTarget.style.background = "rgba(255,20,147,0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (!voted && !voting && !isClosedAudition) {
                e.currentTarget.style.background = "rgba(255,20,147,0.2)";
              }
            }}
          >
            {isClosedAudition ? "종료된 오디션" : voting ? "투표중..." : voted ? "✓ 투표완료" : "❤️ 투표하기"}
          </button>
        </div>
        )}

        {previewMode && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', background: '#141414', fontSize: 12, color: '#9ca3af' }}>
            관리자 미리보기 · 승인 전 영상은 일반 사용자에게 비공개됩니다.
          </div>
        )}

        {!previewMode && (
        <div
          style={{
            padding: "18px 20px 20px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            background: "#141414",
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>댓글</div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>{comments.length}개</div>
          </div>

          {isClosedAudition ? (
            <div style={{ marginBottom: 16, borderRadius: 10, border: '1px solid rgba(148,163,184,0.18)', background: 'rgba(148,163,184,0.08)', color: '#9ca3af', padding: '12px 14px', fontSize: 13, fontWeight: 700 }}>
              종료된 오디션은 댓글 작성이 제한됩니다.
            </div>
          ) : isLoggedIn ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              <textarea
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                placeholder="응원이나 의견을 남겨보세요"
                maxLength={500}
                rows={3}
                style={{ width: '100%', resize: 'none', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: '#0f0f0f', color: '#fff', padding: '12px 14px', fontSize: 14, lineHeight: 1.5, boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{commentDraft.trim().length}/500</div>
                <button
                  type="button"
                  onClick={handleCommentSubmit}
                  disabled={commentSubmitting || !commentDraft.trim() || isClosedAudition}
                  style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(34,197,94,0.35)', background: commentSubmitting || !commentDraft.trim() || isClosedAudition ? 'rgba(75,85,99,0.25)' : 'rgba(34,197,94,0.18)', color: commentSubmitting || !commentDraft.trim() || isClosedAudition ? '#6b7280' : '#86efac', fontWeight: 800, cursor: commentSubmitting || !commentDraft.trim() || isClosedAudition ? 'default' : 'pointer' }}
                >
                  {commentSubmitting ? '등록중...' : '댓글 작성'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 16, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: '#101010', padding: '12px 14px', color: '#9ca3af', fontSize: 13 }}>
              회원만 댓글 작성 가능
            </div>
          )}

          {commentError ? (
            <div style={{ marginBottom: 12, borderRadius: 10, background: 'rgba(185,28,28,0.15)', border: '1px solid rgba(248,113,113,0.25)', color: '#fca5a5', padding: '10px 12px', fontSize: 13 }}>
              {commentError}
            </div>
          ) : null}

          {commentsLoading ? (
            <div style={{ padding: '16px 0', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>댓글 불러오는 중...</div>
          ) : visibleComments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {visibleComments.map((comment) => {
                const isOwn = String(comment.authorId || '') === currentMemberId;
                const showDelete = isOwn || canModerateComments;
                return (
                  <div key={comment.id} style={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', background: '#101010', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{comment.authorName || '회원'}</div>
                        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{formatCommentDate(comment.updatedAt || comment.createdAt)}</div>
                      </div>
                      {(isOwn || showDelete) ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          {isOwn ? (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCommentId(comment.id);
                                setEditingDraft(comment.content || '');
                              }}
                              style={{ border: 'none', background: 'transparent', color: '#93c5fd', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0 }}
                            >
                              수정
                            </button>
                          ) : null}
                          {showDelete ? (
                            <button
                              type="button"
                              onClick={() => handleCommentDelete(comment)}
                              style={{ border: 'none', background: 'transparent', color: '#fca5a5', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0 }}
                            >
                              {isOwn ? '삭제' : '관리 삭제'}
                            </button>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    {String(editingCommentId) === String(comment.id) ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <textarea
                          value={editingDraft}
                          onChange={(e) => setEditingDraft(e.target.value)}
                          maxLength={500}
                          rows={3}
                          style={{ width: '100%', resize: 'none', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: '#161616', color: '#fff', padding: '10px 12px', fontSize: 13, lineHeight: 1.5, boxSizing: 'border-box' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCommentId(null);
                              setEditingDraft('');
                            }}
                            style={{ padding: '8px 12px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#9ca3af', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                          >
                            취소
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCommentUpdate(comment)}
                            disabled={!editingDraft.trim()}
                            style={{ padding: '8px 12px', borderRadius: 9, border: '1px solid rgba(96,165,250,0.32)', background: !editingDraft.trim() ? 'rgba(75,85,99,0.25)' : 'rgba(59,130,246,0.18)', color: !editingDraft.trim() ? '#6b7280' : '#bfdbfe', fontSize: 12, fontWeight: 700, cursor: !editingDraft.trim() ? 'default' : 'pointer' }}
                          >
                            저장
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ whiteSpace: 'pre-wrap', color: '#e5e7eb', fontSize: 13, lineHeight: 1.6 }}>{comment.content}</div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '18px 0', textAlign: 'center', color: '#6b7280', fontSize: 13 }}>첫 댓글을 남겨보세요.</div>
          )}

          {comments.length > 5 ? (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
              <button
                type="button"
                onClick={() => setExpandedComments((prev) => !prev)}
                style={{ border: 'none', background: 'transparent', color: '#93c5fd', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
              >
                {expandedComments ? '접기' : '더보기'}
              </button>
            </div>
          ) : null}
        </div>
        )}
      </div>
    </div>
  );
}
