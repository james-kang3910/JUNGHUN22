import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { buildRegionPath } from '../lib/regionRoutes';
import ContextHeader from '../components/ContextHeader';
import MultiImageUploader, { normalizeImageList } from '../components/MultiImageUploader';
import {
  getApartments,
  getApartmentPosts,
  createApartmentPost,
  updateApartmentPost,
  deleteApartmentPost,
  getApartmentComments,
  createApartmentComment,
  deleteApartmentComment,
  uploadContentImage,
} from '../lib/storageAdapter';
import { getCurrentUser } from '../lib/authStore';
import { isAdminAuthenticatedLocal } from '../lib/adminAuth';
import { canAccessAdmin, isRegionManagerRole, isRegionSuperManagerRole } from '../lib/permissions';

const SECTIONS = [
  { key: 'notices', label: '📌 공지사항' },
  { key: 'board', label: '💬 게시판' },
];

const BOARD_CATEGORIES = [
  { key: 'all', label: '전체' },
  { key: 'trade', label: '매매·임대' },
  { key: 'general', label: '자유' },
];

function getCategoryLabel(category) {
  return BOARD_CATEGORIES.find((item) => item.key === category)?.label || '자유';
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

export default function ApartmentBoard() {
  const { regionId, aptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const me = getCurrentUser();
  const isAdminSession = isAdminAuthenticatedLocal();
  const canModerate = isAdminSession
    || canAccessAdmin(me?.role)
    || isRegionSuperManagerRole(me?.role)
    || (isRegionManagerRole(me?.role) && String(me?.regionId || '') === String(regionId || ''));

  const [apt, setApt] = useState(null);
  const [section, setSection] = useState('notices');
  const [boardCategory, setBoardCategory] = useState('all');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [writeOpen, setWriteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [writeError, setWriteError] = useState('');
  const [editError, setEditError] = useState('');
  const [writeForm, setWriteForm] = useState({ title: '', content: '', category: 'general', images: [] });
  const [editForm, setEditForm] = useState({ title: '', content: '', category: 'general', images: [] });

  useEffect(() => {
    if (!regionId) return;
    getApartments({ regionId })
      .then((list) => {
        const found = (list || []).find((item) => String(item.id) === String(aptId));
        setApt(found || null);
      })
      .catch(() => setApt(null));
  }, [regionId, aptId]);

  const canWriteCurrentSection = useMemo(() => {
    if (section === 'notices') return canModerate;
    if (!me?.memberId) return false;
    return true;
  }, [canModerate, me?.memberId, section]);

  const availableBoardWriteCategories = useMemo(() => (
    BOARD_CATEGORIES.filter((item) => item.key !== 'all')
  ), []);

  const loadPosts = useCallback(async () => {
    if (!aptId) return;
    setLoading(true);
    try {
      const list = await getApartmentPosts({
        apartmentId: aptId,
        section,
        category: section === 'board' && boardCategory !== 'all' ? boardCategory : undefined,
      });
      setPosts(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('[ApartmentBoard] 게시글 로드 실패:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [aptId, boardCategory, section]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts, location.key]);

  const closeWriteModal = () => {
    setWriteOpen(false);
    setWriteError('');
    setWriteForm({ title: '', content: '', category: boardCategory !== 'all' ? boardCategory : 'general', images: [] });
  };

  const closeDetail = () => {
    setSelectedPost(null);
    setEditOpen(false);
    setEditError('');
    setCommentText('');
    setComments([]);
  };

  const openWriteModal = () => {
    // Notices are managed only in the regional admin console.
    if (section === 'notices') {
      return;
    }
    if (!me?.memberId) {
      navigate('/auth');
      return;
    }
    setWriteError('');
    setWriteForm({
      title: '',
      content: '',
      category: boardCategory !== 'all' ? boardCategory : 'general',
      images: [],
    });
    setWriteOpen(true);
  };

  const openPost = async (post) => {
    setSelectedPost(post);
    setEditOpen(false);
    setEditError('');
    setComments([]);
    setCommentText('');
    if (post.postType !== 'board') return;
    setCommentsLoading(true);
    try {
      const list = await getApartmentComments(post.id);
      setComments(Array.isArray(list) ? list : []);
    } catch (error) {
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!writeForm.title.trim()) {
      setWriteError('제목을 입력해 주세요.');
      return;
    }
    setSubmitting(true);
    setWriteError('');
    try {
      const payload = {
        apartmentId: aptId,
        regionId,
        title: writeForm.title.trim(),
        content: writeForm.content.trim(),
        images: normalizeImageList(writeForm.images),
      };
      if (section === 'notices') {
        payload.postType = 'notice';
        payload.category = 'notice';
      } else {
        payload.postType = 'board';
        payload.category = writeForm.category;
        payload.authorName = me?.name || '익명';
      }
      console.log('[ApartmentBoard] handleSubmit payload:', payload);
      await createApartmentPost(payload);
      if (section === 'board') {
        setBoardCategory(writeForm.category || 'general');
      }
      closeWriteModal();
      loadPosts();
    } catch (error) {
      console.error('[ApartmentBoard] handleSubmit error:', error);
      setWriteError(error?.message || '등록 실패');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (post) => {
    setEditForm({
      title: post.title || '',
      content: post.content || '',
      category: post.category === 'trade' ? 'trade' : 'general',
      images: normalizeImageList(post.images),
    });
    setEditError('');
    setEditOpen(true);
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!selectedPost) return;
    if (!editForm.title.trim()) {
      setEditError('제목을 입력해 주세요.');
      return;
    }
    setSubmitting(true);
    setEditError('');
    try {
      const result = await updateApartmentPost(selectedPost.id, {
        title: editForm.title.trim(),
        content: editForm.content.trim(),
        category: selectedPost.postType === 'board' ? editForm.category : selectedPost.category,
        images: normalizeImageList(editForm.images),
      });
      const updated = result?.post || { ...selectedPost, ...editForm };
      setSelectedPost(updated);
      setPosts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setEditOpen(false);
    } catch (error) {
      setEditError(error?.message || '수정 실패');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!selectedPost) return;
    if (!window.confirm('이 글을 삭제하시겠습니까?')) return;
    try {
      await deleteApartmentPost(selectedPost.id);
      closeDetail();
      loadPosts();
    } catch (error) {
      window.alert(`삭제 실패: ${error?.message || '오류가 발생했습니다.'}`);
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    if (!selectedPost || selectedPost.postType !== 'board' || !commentText.trim()) return;
    setCommentSubmitting(true);
    try {
      const result = await createApartmentComment(selectedPost.id, {
        authorName: me?.name || '익명',
        content: commentText.trim(),
      });
      if (result?.comment) setComments((prev) => [...prev, result.comment]);
      setCommentText('');
    } catch (error) {
      window.alert(`댓글 등록 실패: ${error?.message || '오류가 발생했습니다.'}`);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      await deleteApartmentComment(commentId);
      setComments((prev) => prev.filter((item) => item.id !== commentId));
    } catch (error) {
      window.alert(`댓글 삭제 실패: ${error?.message || '오류가 발생했습니다.'}`);
    }
  };

  const canEditSelectedPost = useMemo(() => {
    if (!selectedPost) return false;
    if (canModerate) return true;
    if (!me?.memberId) return false;
    return String(selectedPost.authorId || '') === String(me.memberId);
  }, [canModerate, me?.memberId, selectedPost]);

  const renderImages = (images, compact = false) => {
    const list = normalizeImageList(images);
    if (list.length === 0) return null;
    return (
      <div style={{ display: 'grid', gridTemplateColumns: compact ? 'repeat(3, minmax(0, 1fr))' : 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginTop: compact ? 10 : 14 }}>
        {list.map((imageUrl, index) => (
          <img
            key={`${imageUrl}-${index}`}
            src={imageUrl}
            alt="첨부 이미지"
            style={{ width: '100%', height: compact ? 86 : 160, objectFit: 'cover', borderRadius: 12, border: '1px solid #E2E8F0', display: 'block' }}
          />
        ))}
      </div>
    );
  };

  const sectionEmptyText = {
    notices: '등록된 공지사항이 없습니다.',
    board: '등록된 게시글이 없습니다.',
  };

  const visiblePosts = useMemo(() => {
    if (section === 'notices') {
      return posts.filter((post) => post.postType === 'notice' && post.category === 'notice');
    }
    return posts.filter((post) => post.postType === 'board' && (post.category === 'trade' || post.category === 'general'));
  }, [posts, section]);

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: 90 }}>
      <ContextHeader title={`🏢 ${apt ? apt.name : '아파트'} 커뮤니티`} onBack={() => navigate(buildRegionPath(regionId, '/apt'))} />

      <div style={{ display: 'flex', gap: 8, padding: '12px 16px 8px', overflowX: 'auto' }}>
        {SECTIONS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setSection(item.key)}
            style={{
              border: 'none',
              borderRadius: 999,
              padding: '10px 16px',
              whiteSpace: 'nowrap',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              background: section === item.key ? '#0E7490' : '#E2E8F0',
              color: section === item.key ? '#FFFFFF' : '#475569',
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {section === 'board' ? (
        <div style={{ display: 'flex', gap: 8, padding: '0 16px 8px', overflowX: 'auto' }}>
          {BOARD_CATEGORIES.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setBoardCategory(item.key)}
              style={{
                border: '1px solid #D7E1EA',
                borderRadius: 999,
                padding: '7px 12px',
                whiteSpace: 'nowrap',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                background: boardCategory === item.key ? 'rgba(14,116,144,0.10)' : '#FFFFFF',
                color: boardCategory === item.key ? '#0E7490' : '#64748B',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      <div style={{ padding: '0 16px' }}>

        {loading ? (
          <div style={{ padding: 36, textAlign: 'center', color: '#94A3B8' }}>불러오는 중...</div>
        ) : visiblePosts.length === 0 ? (
          <div style={{ padding: '48px 18px', textAlign: 'center', color: '#94A3B8', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 20 }}>
            <div style={{ fontSize: 38, marginBottom: 10 }}>{section === 'notices' ? '📌' : '💬'}</div>
            <div>{sectionEmptyText[section]}</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {visiblePosts.map((post) => {
              return (
                <div key={post.id} onClick={() => openPost(post)} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 18, padding: 16, boxShadow: '0 8px 22px rgba(15,23,42,0.05)', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                      {post.postType === 'notice' ? <span style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(14,116,144,0.10)', color: '#0E7490', fontSize: 12, fontWeight: 700 }}>공지사항</span> : null}
                      {post.postType === 'board' ? <span style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(30,64,175,0.10)', color: '#1D4ED8', fontSize: 12, fontWeight: 700 }}>{getCategoryLabel(post.category)}</span> : null}
                      {post.isPinned ? <span style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(245,158,11,0.12)', color: '#B45309', fontSize: 12, fontWeight: 700 }}>상단 고정</span> : null}
                    </div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', lineHeight: 1.45 }}>{post.title}</div>
                  {post.content ? <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, marginTop: 8, whiteSpace: 'pre-wrap' }}>{post.content.length > 120 ? `${post.content.slice(0, 120)}…` : post.content}</div> : null}
                  {renderImages(post.images, true)}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10, fontSize: 12, color: '#94A3B8' }}>
                    <span>👤 {post.authorName || '익명'}</span>
                    <span>📅 {formatDate(post.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {canWriteCurrentSection && section !== 'notices' ? (
        <button
          type="button"
          onClick={openWriteModal}
          style={{ position: 'fixed', right: 20, bottom: 84, width: 56, height: 56, borderRadius: '50%', border: 'none', background: '#0E7490', color: '#FFFFFF', fontSize: 26, boxShadow: '0 18px 34px rgba(14,116,144,0.32)', cursor: 'pointer', zIndex: 50 }}
        >
          ＋
        </button>
      ) : null}

      {writeOpen ? (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px' }} onClick={closeWriteModal}>
          <div style={{ width: 'min(560px, 100%)', maxHeight: 'min(78vh, 760px)', overflowY: 'auto', background: '#FFFFFF', borderRadius: 28, boxShadow: '0 24px 60px rgba(15,23,42,0.24)', border: '1px solid #E2E8F0' }} onClick={(event) => event.stopPropagation()}>
            {section === 'notices' ? (
              <div style={{ padding: '20px 22px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start', marginBottom: 18 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    <span style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(14,116,144,0.10)', color: '#0E7490', fontSize: 12, fontWeight: 700 }}>공지사항 작성</span>
                  </div>
                  <button type="button" onClick={closeWriteModal} style={{ width: 40, height: 40, borderRadius: 999, border: '1px solid #D7E1EA', background: '#FFFFFF', fontSize: 26, color: '#475569', cursor: 'pointer', lineHeight: 1 }}>×</button>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
                  <input value={writeForm.title} onChange={(event) => setWriteForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="제목" maxLength={200} style={{ width: '100%', borderRadius: 12, border: '1px solid #D7E1EA', padding: '12px 14px', fontSize: 14, boxSizing: 'border-box' }} />
                  <textarea value={writeForm.content} onChange={(event) => setWriteForm((prev) => ({ ...prev, content: event.target.value }))} placeholder="내용을 입력하세요." rows={7} style={{ width: '100%', borderRadius: 12, border: '1px solid #D7E1EA', padding: '12px 14px', fontSize: 14, lineHeight: 1.6, resize: 'vertical', boxSizing: 'border-box', minHeight: 140 }} />
                  <MultiImageUploader
                    value={writeForm.images}
                    onChange={(nextImages) => setWriteForm((prev) => ({ ...prev, images: nextImages }))}
                    uploadImage={async (file) => {
                      const result = await uploadContentImage(file, { context: 'apartment-posts' });
                      return result?.imageUrl || result?.url || null;
                    }}
                    maxImages={3}
                    helperText="이미지를 첨부할 수 있습니다."
                  />
                  {writeError ? <div style={{ fontSize: 13, fontWeight: 700, color: '#DC2626' }}>{writeError}</div> : null}
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button type="button" onClick={closeWriteModal} style={{ padding: '11px 16px', borderRadius: 12, border: '1px solid #D7E1EA', background: '#FFFFFF', color: '#475569', fontWeight: 700, cursor: 'pointer' }}>취소</button>
                    <button type="submit" disabled={submitting} style={{ padding: '11px 18px', borderRadius: 12, border: 'none', background: '#0E7490', color: '#FFFFFF', fontWeight: 800, cursor: 'pointer', opacity: submitting ? 0.65 : 1 }}>{submitting ? '저장 중...' : '저장'}</button>
                  </div>
                </form>
              </div>
            ) : (
              <div style={{ padding: '20px 22px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start', marginBottom: 18 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    <span style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(30,64,175,0.10)', color: '#1D4ED8', fontSize: 12, fontWeight: 700 }}>{section === 'help' ? '도움요청 작성' : '게시판 글쓰기'}</span>
                  </div>
                  <button type="button" onClick={closeWriteModal} style={{ width: 40, height: 40, borderRadius: 999, border: '1px solid #D7E1EA', background: '#FFFFFF', fontSize: 26, color: '#475569', cursor: 'pointer', lineHeight: 1 }}>×</button>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
                  <select value={writeForm.category} onChange={(event) => setWriteForm((prev) => ({ ...prev, category: event.target.value }))} style={{ width: '100%', borderRadius: 12, border: '1px solid #D7E1EA', padding: '12px 14px', fontSize: 14 }}>
                    {availableBoardWriteCategories.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
                  </select>
                  <input value={writeForm.title} onChange={(event) => setWriteForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="제목" maxLength={200} style={{ width: '100%', borderRadius: 12, border: '1px solid #D7E1EA', padding: '12px 14px', fontSize: 14, boxSizing: 'border-box' }} />
                  <textarea value={writeForm.content} onChange={(event) => setWriteForm((prev) => ({ ...prev, content: event.target.value }))} placeholder="내용을 입력하세요." rows={7} style={{ width: '100%', borderRadius: 12, border: '1px solid #D7E1EA', padding: '12px 14px', fontSize: 14, lineHeight: 1.6, resize: 'vertical', boxSizing: 'border-box', minHeight: 140 }} />
                  <MultiImageUploader
                    value={writeForm.images}
                    onChange={(nextImages) => setWriteForm((prev) => ({ ...prev, images: nextImages }))}
                    uploadImage={async (file) => {
                      const result = await uploadContentImage(file, { context: 'apartment-posts' });
                      return result?.imageUrl || result?.url || null;
                    }}
                    maxImages={3}
                    helperText="최대 3장까지 업로드할 수 있습니다."
                  />
                  {writeError ? <div style={{ fontSize: 13, fontWeight: 700, color: '#DC2626' }}>{writeError}</div> : null}
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button type="button" onClick={closeWriteModal} style={{ padding: '11px 16px', borderRadius: 12, border: '1px solid #D7E1EA', background: '#FFFFFF', color: '#475569', fontWeight: 700, cursor: 'pointer' }}>취소</button>
                    <button type="submit" disabled={submitting} style={{ padding: '11px 18px', borderRadius: 12, border: 'none', background: '#0E7490', color: '#FFFFFF', fontWeight: 800, cursor: 'pointer', opacity: submitting ? 0.65 : 1 }}>{submitting ? '저장 중...' : '저장'}</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {selectedPost ? (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', zIndex: 1300 }} onClick={closeDetail} />
          {selectedPost.postType === 'notice' ? (
            <div style={{ position: 'fixed', inset: '0', zIndex: 1301, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px' }}>
              <div style={{ width: 'min(560px, 100%)', maxHeight: 'min(78vh, 760px)', overflowY: 'auto', background: '#FFFFFF', borderRadius: 28, boxShadow: '0 24px 60px rgba(15,23,42,0.24)', border: '1px solid #E2E8F0' }} onClick={(event) => event.stopPropagation()}>
                <div style={{ padding: '20px 22px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      <span style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(14,116,144,0.10)', color: '#0E7490', fontSize: 12, fontWeight: 700 }}>공지사항</span>
                      {selectedPost.isPinned ? <span style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(245,158,11,0.12)', color: '#B45309', fontSize: 12, fontWeight: 700 }}>상단 고정</span> : null}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                      {canEditSelectedPost ? (
                        <>
                          <button type="button" onClick={() => openEdit(selectedPost)} style={{ borderRadius: 10, border: '1px solid #D7E1EA', background: '#FFFFFF', color: '#0E7490', padding: '7px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>수정</button>
                          <button type="button" onClick={handleDeletePost} style={{ borderRadius: 10, border: '1px solid rgba(239,68,68,0.24)', background: '#FFFFFF', color: '#DC2626', padding: '7px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>삭제</button>
                        </>
                      ) : null}
                      <button type="button" onClick={closeDetail} style={{ width: 40, height: 40, borderRadius: 999, border: '1px solid #D7E1EA', background: '#FFFFFF', fontSize: 26, color: '#475569', cursor: 'pointer', lineHeight: 1 }}>×</button>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '0 22px 24px' }}>
                  {editOpen ? (
                    <form onSubmit={handleEditSubmit} style={{ display: 'grid', gap: 12 }}>
                      <input value={editForm.title} onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="제목" maxLength={200} style={{ width: '100%', borderRadius: 12, border: '1px solid #D7E1EA', padding: '12px 14px', fontSize: 14, boxSizing: 'border-box' }} />
                      <textarea value={editForm.content} onChange={(event) => setEditForm((prev) => ({ ...prev, content: event.target.value }))} placeholder="내용" rows={7} style={{ width: '100%', borderRadius: 12, border: '1px solid #D7E1EA', padding: '12px 14px', fontSize: 14, lineHeight: 1.6, resize: 'vertical', boxSizing: 'border-box', minHeight: 140 }} />
                      <MultiImageUploader
                        value={editForm.images}
                        onChange={(nextImages) => setEditForm((prev) => ({ ...prev, images: nextImages }))}
                        uploadImage={async (file) => {
                          const result = await uploadContentImage(file, { context: 'apartment-posts' });
                          return result?.imageUrl || result?.url || null;
                        }}
                        maxImages={3}
                        helperText="최대 3장까지 업로드할 수 있습니다."
                      />
                      {editError ? <div style={{ fontSize: 13, fontWeight: 700, color: '#DC2626' }}>{editError}</div> : null}
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button type="button" onClick={() => setEditOpen(false)} style={{ padding: '11px 16px', borderRadius: 12, border: '1px solid #D7E1EA', background: '#FFFFFF', color: '#475569', fontWeight: 700, cursor: 'pointer' }}>취소</button>
                        <button type="submit" disabled={submitting} style={{ padding: '11px 18px', borderRadius: 12, border: 'none', background: '#0E7490', color: '#FFFFFF', fontWeight: 800, cursor: 'pointer', opacity: submitting ? 0.65 : 1 }}>{submitting ? '저장 중...' : '저장'}</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0F172A', lineHeight: 1.35, margin: '10px 0 10px' }}>{selectedPost.title}</h2>
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 13, color: '#94A3B8', marginBottom: 16 }}>
                        <span>👤 {selectedPost.authorName || '익명'}</span>
                        <span>📅 {formatDate(selectedPost.createdAt)}</span>
                      </div>
                      {selectedPost.content ? <div style={{ fontSize: 15, lineHeight: 1.85, color: '#1E293B', whiteSpace: 'pre-wrap' }}>{selectedPost.content}</div> : null}
                      {renderImages(selectedPost.images)}
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ position: 'fixed', inset: '0', zIndex: 1301, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px' }}>
              <div style={{ width: 'min(560px, 100%)', maxHeight: 'min(78vh, 760px)', overflowY: 'auto', background: '#FFFFFF', borderRadius: 28, boxShadow: '0 24px 60px rgba(15,23,42,0.24)', border: '1px solid #E2E8F0' }} onClick={(event) => event.stopPropagation()}>
                <div style={{ padding: '20px 22px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start', marginBottom: 18 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {selectedPost.postType === 'board' ? <span style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(30,64,175,0.10)', color: '#1D4ED8', fontSize: 12, fontWeight: 700 }}>{getCategoryLabel(selectedPost.category)}</span> : null}
                      {selectedPost.isPinned ? <span style={{ padding: '4px 10px', borderRadius: 999, background: 'rgba(245,158,11,0.12)', color: '#B45309', fontSize: 12, fontWeight: 700 }}>상단 고정</span> : null}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                      {canEditSelectedPost ? (
                        <>
                          <button type="button" onClick={() => openEdit(selectedPost)} style={{ borderRadius: 10, border: '1px solid #D7E1EA', background: '#FFFFFF', color: '#0E7490', padding: '7px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>수정</button>
                          <button type="button" onClick={handleDeletePost} style={{ borderRadius: 10, border: '1px solid rgba(239,68,68,0.24)', background: '#FFFFFF', color: '#DC2626', padding: '7px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>삭제</button>
                        </>
                      ) : null}
                      <button type="button" onClick={closeDetail} style={{ width: 40, height: 40, borderRadius: 999, border: '1px solid #D7E1EA', background: '#FFFFFF', fontSize: 26, color: '#475569', cursor: 'pointer', lineHeight: 1 }}>×</button>
                    </div>
                  </div>

                  {editOpen ? (
                    <form onSubmit={handleEditSubmit} style={{ display: 'grid', gap: 12 }}>
                      <select value={editForm.category} onChange={(event) => setEditForm((prev) => ({ ...prev, category: event.target.value }))} style={{ width: '100%', borderRadius: 12, border: '1px solid #D7E1EA', padding: '12px 14px', fontSize: 14 }}>
                        {(canModerate ? BOARD_CATEGORIES.filter((item) => item.key !== 'all') : BOARD_CATEGORIES.filter((item) => item.key === 'trade' || item.key === 'general')).map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
                      </select>
                      <input value={editForm.title} onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="제목" maxLength={200} style={{ width: '100%', borderRadius: 12, border: '1px solid #D7E1EA', padding: '12px 14px', fontSize: 14, boxSizing: 'border-box' }} />
                      <textarea value={editForm.content} onChange={(event) => setEditForm((prev) => ({ ...prev, content: event.target.value }))} placeholder="내용" rows={7} style={{ width: '100%', borderRadius: 12, border: '1px solid #D7E1EA', padding: '12px 14px', fontSize: 14, lineHeight: 1.6, resize: 'vertical', boxSizing: 'border-box', minHeight: 140 }} />
                      <MultiImageUploader
                        value={editForm.images}
                        onChange={(nextImages) => setEditForm((prev) => ({ ...prev, images: nextImages }))}
                        uploadImage={async (file) => {
                          const result = await uploadContentImage(file, { context: 'apartment-posts' });
                          return result?.imageUrl || result?.url || null;
                        }}
                        maxImages={3}
                        helperText="최대 3장까지 업로드할 수 있습니다."
                      />
                      {editError ? <div style={{ fontSize: 13, fontWeight: 700, color: '#DC2626' }}>{editError}</div> : null}
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button type="button" onClick={() => setEditOpen(false)} style={{ padding: '11px 16px', borderRadius: 12, border: '1px solid #D7E1EA', background: '#FFFFFF', color: '#475569', fontWeight: 700, cursor: 'pointer' }}>취소</button>
                        <button type="submit" disabled={submitting} style={{ padding: '11px 18px', borderRadius: 12, border: 'none', background: '#0E7490', color: '#FFFFFF', fontWeight: 800, cursor: 'pointer', opacity: submitting ? 0.65 : 1 }}>{submitting ? '저장 중...' : '저장'}</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0F172A', lineHeight: 1.35, margin: '10px 0 10px' }}>{selectedPost.title}</h2>
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 13, color: '#94A3B8', marginBottom: 16 }}>
                        <span>👤 {selectedPost.authorName || '익명'}</span>
                        <span>📅 {formatDate(selectedPost.createdAt)}</span>
                      </div>
                      {selectedPost.content ? <div style={{ fontSize: 15, lineHeight: 1.85, color: '#1E293B', whiteSpace: 'pre-wrap' }}>{selectedPost.content}</div> : null}
                      {renderImages(selectedPost.images)}

                      <div style={{ paddingTop: 22 }}>
                        <div style={{ fontSize: 15, fontWeight: 900, color: '#0F172A', marginBottom: 12 }}>댓글</div>
                        {commentsLoading ? <div style={{ padding: '16px 0', textAlign: 'center', color: '#94A3B8' }}>불러오는 중...</div> : null}
                        {!commentsLoading && comments.length === 0 ? <div style={{ padding: '16px 0', textAlign: 'center', color: '#94A3B8' }}>등록된 댓글이 없습니다.</div> : null}
                        {!commentsLoading && comments.length > 0 ? (
                          <div style={{ display: 'grid', gap: 10, marginBottom: 14 }}>
                            {comments.map((comment) => (
                              <div key={comment.id} style={{ padding: '12px 14px', borderRadius: 14, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                                  <div>
                                    <div style={{ fontSize: 12, fontWeight: 800, color: '#0E7490' }}>{comment.authorName || '익명'}</div>
                                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{formatDate(comment.createdAt)}</div>
                                  </div>
                                  {canModerate || String(comment.authorId || '') === String(me?.memberId || '') ? (
                                    <button type="button" onClick={() => handleDeleteComment(comment.id)} style={{ border: 'none', background: 'none', color: '#94A3B8', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>×</button>
                                  ) : null}
                                </div>
                                <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, marginTop: 8 }}>{comment.content}</div>
                              </div>
                            ))}
                          </div>
                        ) : null}
                        {me?.memberId ? (
                          <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                            <textarea value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="댓글을 입력하세요." rows={3} style={{ flex: 1, borderRadius: 12, border: '1px solid #D7E1EA', padding: '12px 14px', fontSize: 14, lineHeight: 1.6, resize: 'none', boxSizing: 'border-box' }} />
                            <button type="submit" disabled={!commentText.trim() || commentSubmitting} style={{ padding: '11px 16px', borderRadius: 12, border: 'none', background: commentText.trim() ? '#0E7490' : '#CBD5E1', color: '#FFFFFF', fontWeight: 800, cursor: commentText.trim() ? 'pointer' : 'default' }}>{commentSubmitting ? '등록중' : '등록'}</button>
                          </form>
                        ) : (
                          <div onClick={() => navigate('/auth')} style={{ padding: '12px 16px', borderRadius: 14, background: '#F8FAFC', border: '1px dashed #D7E1EA', color: '#64748B', textAlign: 'center', cursor: 'pointer' }}>로그인 후 댓글을 작성할 수 있습니다.</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}