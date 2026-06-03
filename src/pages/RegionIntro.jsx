/**
 * RegionIntro — 지역소개 + 여행지 게시판
 * /r/:regionId/intro
 */
import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useRegion } from '../context/RegionContext';
import { getCurrentUser } from '../lib/authStore';
import {
  getRegionIntro,
  getRegionTravelPosts,
  getRegionTravelComments,
  createRegionTravelPost,
  createRegionTravelComment,
} from '../lib/storageAdapter';

function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  return `${dt.getFullYear()}.${String(dt.getMonth()+1).padStart(2,'0')}.${String(dt.getDate()).padStart(2,'0')}`;
}

function parseImageList(images) {
  if (Array.isArray(images)) return images;
  if (!images) return [];
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function unwrapIntroPayload(result) {
  if (!result || typeof result !== 'object') return null;
  const source = result.intro || result.data?.intro || result;
  if (!source || typeof source !== 'object') return null;
  const rawSections = source.sections;
  return {
    ...source,
    images: parseImageList(source.images),
    sections: Array.isArray(rawSections)
      ? rawSections
      : (() => { try { const p = JSON.parse(rawSections); return Array.isArray(p) ? p : []; } catch { return []; } })(),
  };
}

function resolveImageUrl(image) {
  if (!image) return '';
  if (typeof image === 'string') return image;
  return image.url || image.imageUrl || image.src || '';
}

function resolveImageLabel(image, index) {
  const explicit = (typeof image === 'object' && image)
    ? (image.name || image.title || image.caption)
    : '';
  if (explicit) return String(explicit);
  return '';
}

export default function RegionIntro() {
  const { regionId } = useRegion();
  useOutletContext() || {};
  const me = getCurrentUser();

  const [intro,   setIntro]   = useState(null);
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail,  setDetail]  = useState(null);
  const [comments,     setComments]     = useState([]);
  const [commentText,  setCommentText]  = useState('');
  const [showWrite,    setShowWrite]    = useState(false);
  const [form,         setForm]         = useState({ title: '', content: '' });
  const [submitting,   setSubmitting]   = useState(false);

  const load = useCallback(async () => {
    if (!regionId) return;
    setLoading(true);
    try {
      const [introData, postsData] = await Promise.all([
        getRegionIntro(regionId).catch(() => null),
        getRegionTravelPosts(regionId).catch(() => []),
      ]);
      setIntro(unwrapIntroPayload(introData));
      setPosts(postsData?.posts || postsData || []);
    } finally { setLoading(false); }
  }, [regionId]);

  useEffect(() => { load(); }, [load]);

  const openDetail = async (post) => {
    setDetail(post);
    setComments([]);
    setCommentText('');
    try {
      const res = await getRegionTravelComments(regionId, post.post_id || post.id);
      setComments(res?.comments || res || []);
    } catch {}
  };

  const submitComment = async () => {
    if (!commentText.trim() || !me) return;
    setSubmitting(true);
    try {
      await createRegionTravelComment(regionId, detail.post_id || detail.id, { content: commentText.trim() });
      setCommentText('');
      const res = await getRegionTravelComments(regionId, detail.post_id || detail.id);
      setComments(res?.comments || res || []);
    } catch {} finally { setSubmitting(false); }
  };

  const submitPost = async () => {
    if (!form.title.trim() || !me) return;
    setSubmitting(true);
    try {
      await createRegionTravelPost(regionId, { title: form.title, content: form.content });
      setShowWrite(false);
      setForm({ title: '', content: '' });
      load();
    } catch {} finally { setSubmitting(false); }
  };

  if (loading) return <div style={{ padding: 32, textAlign: 'center', color: '#64748B' }}>불러오는 중...</div>;

  // ── 여행지 상세 뷰 ──
  // 여행지 게시글/댓글 기능 완전 비활성화 (상세 진입 불가)
  if (false && detail) {
    // ...기존 상세/댓글 렌더링 코드 (비활성화)
  }

  // ── 목록 뷰 ──
  const introImages  = intro?.images  || [];
  const introContent = intro?.content || '';
  const introSections = (() => {
    const s = intro?.sections;
    const parsed = Array.isArray(s)
      ? s
      : (typeof s === 'string' ? (() => { try { const p = JSON.parse(s); return Array.isArray(p) ? p : []; } catch { return []; } })() : []);

    return parsed.map((sec) => ({
      ...sec,
      images: parseImageList(sec?.images),
    }));
  })();

  // 과거 전역 images 모델 호환: 섹션 이미지가 없으면 마지막 섹션으로 이관 표시
  const hasSectionImages = introSections.some((sec) => Array.isArray(sec?.images) && sec.images.length > 0);
  const displaySections = hasSectionImages || introImages.length === 0
    ? introSections
    : [...introSections, { title: '', content: '', images: introImages, createdAt: Date.now() }];

  return (
    <div style={{ minHeight: '100vh', background: '#F5F8FA', paddingBottom: 80, position: 'relative' }}>
      {/* 인사말 */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(14,116,144,0.08) 0%, rgba(14,116,144,0.03) 100%)', borderRadius: 16, padding: '16px 18px', border: '1px solid rgba(14,116,144,0.15)' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0E7490', marginBottom: 8 }}>🌏 지역공유발전 플랫폼에 오신 것을 환영합니다.</div>
          <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.8 }}>
            이곳은 지역 주민과 상점, 다양한 정보가 함께 연결되는 공간입니다.<br />
            지역 소식, 생활 정보, 혜택을 확인하고 함께 성장하는 지역 커뮤니티를 경험해보세요.
          </div>
        </div>
      </div>
      {/* 지역 소개 섹션 */}
      {(introContent || introImages.length > 0 || displaySections.length > 0) && (
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{ borderLeft: '3px solid #0E7490', paddingLeft: 10, fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>
            📝 지역 소개
          </div>
          <div style={{ background: '#fff', borderRadius: 16, padding: 16, border: '1px solid rgba(14,116,144,0.12)', boxShadow: '0 4px 20px rgba(14,116,144,0.08)' }}>
            {introContent ? (
              <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{introContent}</p>
            ) : (
              <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>등록된 소개 문구가 없습니다.</p>
            )}

            {introImages.length > 0 && hasSectionImages && (
              <div style={{ marginTop: introContent ? 12 : 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {introImages.map((img, imgIdx) => {
                  const src = resolveImageUrl(img);
                  if (!src) return null;
                  const label = resolveImageLabel(img, imgIdx);
                  return (
                    <article key={`intro-top-img-${imgIdx}`} style={{ borderRadius: 12, border: '1px solid rgba(14,116,144,0.14)', background: 'linear-gradient(180deg, #f8fdff 0%, #f3f8fb 100%)', overflow: 'hidden' }}>
                      {label ? (
                        <div style={{ padding: '10px 12px', fontSize: 13, fontWeight: 700, color: '#0E7490', borderBottom: '1px solid rgba(14,116,144,0.10)' }}>{label}</div>
                      ) : null}
                      <img src={src} alt={label || `지역 소개 이미지 ${imgIdx + 1}`} style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {displaySections.length > 0 && (
            <div style={{ marginTop: 10, background: '#fff', borderRadius: 16, padding: 12, border: '1px solid rgba(14,116,144,0.12)', boxShadow: '0 4px 20px rgba(14,116,144,0.08)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {displaySections.map((sec, i) => {
                  const sectionImages = Array.isArray(sec?.images) ? sec.images : [];
                  return (
                    <div key={`intro-section-${i}`} style={{ background: '#fff', borderRadius: 16, padding: 16, border: '1px solid rgba(14,116,144,0.12)', boxShadow: '0 4px 20px rgba(14,116,144,0.08)' }}>
                      {sec.title ? (
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>{sec.title}</div>
                      ) : null}
                      {sec.content ? (
                        <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>{sec.content}</p>
                      ) : null}

                      {sectionImages.length > 0 && (
                        <div style={{ marginTop: (sec.title || sec.content) ? 10 : 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {sectionImages.map((img, imgIdx) => {
                            const src = resolveImageUrl(img);
                            if (!src) return null;
                            const label = resolveImageLabel(img, imgIdx);
                            return (
                              <article key={`intro-section-${i}-img-${imgIdx}`} style={{ borderRadius: 12, border: '1px solid rgba(14,116,144,0.14)', background: 'linear-gradient(180deg, #f8fdff 0%, #f3f8fb 100%)', overflow: 'hidden' }}>
                                {label ? (
                                  <div style={{ padding: '10px 12px', fontSize: 13, fontWeight: 700, color: '#0E7490', borderBottom: '1px solid rgba(14,116,144,0.10)' }}>{label}</div>
                                ) : null}
                                <img src={src} alt={label || `섹션 이미지 ${imgIdx + 1}`} style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
                              </article>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 여행지 게시글 섹션 (제목 제거, 리스트만) */}
      {/* 여행지 게시글 리스트 완전 비활성화 */}
      {false && posts.length > 0 && (
        <div />
      )}


    </div>
  );
}
