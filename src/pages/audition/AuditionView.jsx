// 오디션 상세 페이지 - 서버 DB(SSOT) 기반, 참가작 업로드 + 목록
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  getAuditionById, 
  getAuditionSubmissions, 
  createAuditionSubmission,
  deleteAuditionSubmission 
} from "../../lib/storageAdapter";
import { register, unregister } from "../../lib/ssotRegistry";

// ✅ UPDATE: 유튜브 URL 정규화 - shorts, youtu.be, watch?v= 모두 지원
function normalizeYoutubeUrl(url) {
  if (!url) return null;
  
  const trimmed = url.trim();
  
  // 이미 embed 형식이면 그대로 반환
  if (trimmed.includes('youtube.com/embed/')) return trimmed;
  
  // youtu.be 형식
  const youtuBeMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (youtuBeMatch) return `https://www.youtube.com/embed/${youtuBeMatch[1]}`;
  
  // youtube.com/watch?v= 형식
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  
  // ✨ ADD: youtube.com/shorts 형식
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  
  return null;
}

function getMemberInfo() {
  try {
    const authStr = localStorage.getItem("su_auth_v2");
    if (authStr) {
      const auth = JSON.parse(authStr);
      return { isLoggedIn: true, memberId: auth.memberId, name: auth.name };
    }
  } catch (e) {}
  return { isLoggedIn: false, memberId: null, name: null };
}

export default function AuditionView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const memberInfo = getMemberInfo();

  const [audition, setAudition] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 업로드 폼 상태
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [mediaType, setMediaType] = useState('youtube');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadData();
    const id = register(['auditions','submissions'], () => {
      try { loadData(); } catch (e) { console.error('[AuditionView] ssot reload failed', e); }
    });
    return () => unregister(id);
  }, [id]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [auditionData, submissionsData] = await Promise.all([
        getAuditionById(id),
        getAuditionSubmissions(id)
      ]);
      setAudition(auditionData);
      setSubmissions(submissionsData);
    } catch (err) {
      console.error('Failed to load audition:', err);
      setError('오디션을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!memberInfo.isLoggedIn) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if (!formTitle.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (mediaType === 'youtube' && !youtubeUrl.trim()) {
      alert('유튜브 URL을 입력해주세요.');
      return;
    }

    try {
      setUploading(true);
      
      let mediaUrl = '';
      let thumbnailUrl = '';
      
      if (mediaType === 'youtube') {
        const embedUrl = normalizeYoutubeUrl(youtubeUrl);
        if (!embedUrl) {
          alert('올바른 유튜브 URL이 아닙니다.');
          return;
        }
        mediaUrl = embedUrl;
        // 유튜브 썸네일 추출
        const videoId = embedUrl.split('/').pop().split('?')[0];
        thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      } else {
        alert('파일 업로드는 준비 중입니다.');
        return;
      }

      await createAuditionSubmission(id, {
        title: formTitle,
        mediaType,
        mediaUrl,
        thumbnailUrl
      });

      alert('참가작이 등록되었습니다!');
      setFormTitle('');
      setYoutubeUrl('');
      setShowForm(false);
      await loadData();
    } catch (err) {
      console.error('Failed to submit:', err);
      alert(err.message || '참가작 등록에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(submissionId) {
    if (!confirm('이 참가작을 삭제하시겠습니까?')) return;

    try {
      await deleteAuditionSubmission(id, submissionId);
      alert('삭제되었습니다.');
      await loadData();
    } catch (err) {
      console.error('Failed to delete:', err);
      alert(err.message || '삭제에 실패했습니다.');
    }
  }

  return (
    <div className="su-page su-audition-view">
      <header className="su-panelHead">
        <h2 className="su-panelTitle">오디션 상세</h2>
        <div>
          <button className="su-pill" type="button" onClick={() => navigate('/audition')}>
            ← 뒤로
          </button>
        </div>
      </header>

      {loading && (
        <section className="su-panel">
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
            로딩 중...
          </div>
        </section>
      )}

      {error && (
        <section className="su-panel">
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#e74c3c' }}>
            {error}
          </div>
        </section>
      )}

      {!loading && !error && audition && (
        <>
          {/* ✅ UPDATE: 오디션 정보 - type, published 표시 추가 */}
          <section className="su-panel">
            <div style={{ padding: 16 }}>
              {audition.posterUrl && (
                <img 
                  src={audition.posterUrl} 
                  alt={audition.title}
                  style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 8, marginBottom: 16 }}
                />
              )}
              
              {/* ✨ ADD: 제목 + 타입 배지 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 12 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{audition.title}</h3>
                {audition.type === 'NOTICE' && (
                  <span style={{
                    fontSize: 12,
                    padding: '4px 8px',
                    borderRadius: 4,
                    background: 'rgba(12,84,96,0.12)',
                    color: '#0C5460',
                    fontWeight: 600
                  }}>
                    공지형
                  </span>
                )}
                {audition.type === 'FREE' && (
                  <span style={{
                    fontSize: 12,
                    padding: '4px 8px',
                    borderRadius: 4,
                    background: 'rgba(12,84,96,0.12)',
                    color: '#0C5460',
                    fontWeight: 600
                  }}>
                    자유응모
                  </span>
                )}
              </div>
              
              <div style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>
                상태: {audition.status === 'OPEN' ? '모집중' : '마감'}
              </div>
              {audition.description && (
                <div style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 16, whiteSpace: 'pre-wrap' }}>
                  {audition.description}
                </div>
              )}
              {audition.startAt && (
                <div style={{ fontSize: 13, color: '#888' }}>
                  시작일: {new Date(audition.startAt).toLocaleDateString('ko-KR')}
                </div>
              )}
              {audition.endAt && (
                <div style={{ fontSize: 13, color: '#888' }}>
                  종료일: {new Date(audition.endAt).toLocaleDateString('ko-KR')}
                </div>
              )}
            </div>
          </section>

          {/* ✨ ADD: 타입별 지원 진입점 제어 */}
          {(() => {
            const type = audition.type || 'FREE';
            const status = audition.status || 'OPEN';
            const published = audition.published !== undefined ? audition.published : true;
            
            // ✨ ADD: NOTICE 타입 - published && OPEN일 때만 지원 가능
            if (type === 'NOTICE') {
              if (!published) {
                return (
                  <section className="su-panel">
                    <div style={{ padding: 16, textAlign: 'center' }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>⏳</div>
                      <div style={{ fontSize: 16, color: '#6b7280', fontWeight: 600 }}>
                        이 오디션은 준비 중입니다.
                      </div>
                      <div style={{ fontSize: 14, color: '#9ca3af', marginTop: 8 }}>
                        관리자가 공지를 게시하면 지원이 가능합니다.
                      </div>
                    </div>
                  </section>
                );
              }
              if (status === 'CLOSED') {
                return (
                  <section className="su-panel">
                    <div style={{ padding: 16, textAlign: 'center' }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
                      <div style={{ fontSize: 16, color: '#ef4444', fontWeight: 600 }}>
                        이 오디션은 마감되었습니다.
                      </div>
                    </div>
                  </section>
                );
              }
            }
            
            // ✨ ADD: FREE 타입 - OPEN일 때만 업로드 활성
            if (type === 'FREE' && status === 'CLOSED') {
              return (
                <section className="su-panel">
                  <div style={{ padding: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
                    <div style={{ fontSize: 16, color: '#ef4444', fontWeight: 600 }}>
                      이 오디션은 마감되었습니다.
                    </div>
                  </div>
                </section>
              );
            }
            
            // ✨ ADD: 지원 가능한 경우 버튼 표시
            return (
              <section className="su-panel">
                <div style={{ padding: 16 }}>
                  {memberInfo.isLoggedIn ? (
                    <button 
                      className="su-pill" 
                      type="button" 
                      onClick={() => setShowForm(!showForm)}
                      style={{ width: '100%', background: '#0C5460', color: '#fff' }}
                    >
                      {showForm ? '취소' : '참가하기 🎬'}
                    </button>
                  ) : (
                    <button 
                      className="su-pill" 
                      type="button" 
                      onClick={() => navigate('/login')}
                      style={{ width: '100%' }}
                    >
                      로그인 후 참가하기
                    </button>
                  )}
                </div>
              </section>
            );
          })()}

          {/* 업로드 폼 */}
          {showForm && (
            <section className="su-panel">
              <form onSubmit={handleSubmit} style={{ padding: 16 }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>참가작 업로드</h4>
                
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                    제목
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="참가작 제목을 입력하세요"
                    style={{ width: '100%', padding: 8, fontSize: 14, border: '1px solid #ddd', borderRadius: 4 }}
                  />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                    업로드 방식
                  </label>
                  <select
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value)}
                    style={{ width: '100%', padding: 8, fontSize: 14, border: '1px solid #ddd', borderRadius: 4 }}
                  >
                    <option value="youtube">유튜브 URL</option>
                    <option value="file" disabled>파일 업로드 (준비중)</option>
                  </select>
                </div>

                {mediaType === 'youtube' && (
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                      유튜브 URL
                    </label>
                    <input
                      type="text"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      style={{ width: '100%', padding: 8, fontSize: 14, border: '1px solid #ddd', borderRadius: 4 }}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploading}
                  className="su-pill"
                  style={{ width: '100%', background: '#0C5460', color: '#fff' }}
                >
                  {uploading ? '업로드 중...' : '제출하기'}
                </button>
              </form>
            </section>
          )}

          {/* 참가작 목록 */}
          <section className="su-panel">
            <div style={{ padding: 16 }}>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
                참가작 목록 ({submissions.length})
              </h4>
              
              {submissions.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>
                  아직 참가작이 없습니다.
                </div>
              )}

              {submissions.map((sub) => (
                <div key={sub.submissionId} style={{ 
                  marginBottom: 16, 
                  padding: 12, 
                  border: '1px solid #eee', 
                  borderRadius: 8 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{sub.title}</div>
                      <div style={{ fontSize: 13, color: '#888' }}>
                        참가자: {sub.memberName || '알 수 없음'} | {new Date(sub.createdAt).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                    {memberInfo.memberId === sub.memberId && (
                      <button
                        onClick={() => handleDelete(sub.submissionId)}
                        style={{ 
                          padding: '4px 8px', 
                          fontSize: 12, 
                          border: '1px solid #e74c3c', 
                          borderRadius: 4, 
                          background: '#fff', 
                          color: '#e74c3c',
                          cursor: 'pointer'
                        }}
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  
                  {sub.mediaType === 'youtube' && sub.mediaUrl && (
                    <div style={{ marginTop: 8 }}>
                      <iframe
                        width="100%"
                        height="200"
                        src={sub.mediaUrl}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ borderRadius: 4 }}
                      />
                    </div>
                  )}
                  
                  {sub.thumbnailUrl && sub.mediaType !== 'youtube' && (
                    <img 
                      src={sub.thumbnailUrl} 
                      alt={sub.title}
                      style={{ width: '100%', maxHeight: 150, objectFit: 'cover', borderRadius: 4, marginTop: 8 }}
                    />
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
