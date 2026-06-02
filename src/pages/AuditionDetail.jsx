// ✅ UPDATE: 폴더 제거, TOP3 추가, 비디오 클릭 가능하도록 수정
import React, { useEffect, useState, useRef, useLayoutEffect, useMemo } from "react";
import VideoEmbed from "./../components/VideoEmbed";
import AuditionVideoModal from "./../components/AuditionVideoModal";
import { useParams, useNavigate } from "react-router-dom";
import { isYouTubeUrl, parseYouTubeId } from "../lib/videoUtils";
import { getAuditions } from "../lib/adminStore";
import { getAuditionDisplayBadge, isAuditionClosed, normalizeAuditionRankLabel, sortAuditionSubmissions } from "../lib/auditionSchedule";
import * as storageAdapter from "../lib/storageAdapter";
import { register, unregister } from "../lib/ssotRegistry";
import { 
  canParticipate, 
  checkIsAdmin,
  getParticipationBlockedReason 
} from "../lib/viewerRegionStore";
import { isLoggedIn, getCurrentUser } from "../lib/authStore";

// ★ 회원 가입 지역 ID 가져오기 (메모리 세션 우선 → localStorage 폴백)
function getMemberRegionId() {
  // 1) authStore 메모리 우선 (SSOT)
  try {
    const user = getCurrentUser();
    if (user?.regionId) return user.regionId;
  } catch (e) {}
  // 2) 레거시 localStorage 폴백
  try {
    const authStr = localStorage.getItem("su_auth_v2");
    if (authStr) {
      const auth = JSON.parse(authStr);
      return auth.regionId || null;
    }
  } catch (e) {}
  return null;
}

// shared util: parse youtube id and detect kind
function parseYoutubeId(urlOrId) {
  if (!urlOrId) return null;
  try {
    const u = new URL(urlOrId);
    const host = u.hostname.replace("www.", "");
    if (host.includes("youtube.com")) {
      if (u.pathname.startsWith("/watch")) return u.searchParams.get("v");
      if (u.pathname.startsWith("/embed/")) return u.pathname.split("/embed/")[1];
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/shorts/")[1];
    }
    if (host.includes("youtu.be")) return u.pathname.replace("/", "");
  } catch (e) {
    const maybe = String(urlOrId).trim();
    if (/^[a-zA-Z0-9_-]{6,}$/.test(maybe)) return maybe;
  }
  return null;
}

function isDirectVideoUrl(u) {
  if (!u) return false;
  return /\.(mp4|webm|ogg)(?:\?|$)/i.test(u);
}

export default function AuditionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null); // ✨ ADD: 모달용 선택 비디오
  const [posterPreviewOpen, setPosterPreviewOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // ✨ ADD: 투표 후 새로고침용
  const [submissions, setSubmissions] = useState(null); // ✨ ADD: 서버에서 로드한 submissions (null=로딩중)
  const [videoPage, setVideoPage] = useState(0); // 모든 참가영상 페이지 (3개씨)

  // ★ 로그인 상태 — su:auth:changed 이벤트로 반응형으로 추적
  const [loggedIn, setLoggedIn] = useState(() => isLoggedIn());
  useEffect(() => {
    const onAuthChange = () => setLoggedIn(isLoggedIn());
    window.addEventListener('su:auth:changed', onAuthChange);
    // 마운트 직후 최신 상태 반영
    setLoggedIn(isLoggedIn());
    return () => window.removeEventListener('su:auth:changed', onAuthChange);
  }, []);

  // ★ 지역 및 관리자 정보 — su:auth:changed 이벤트로 반응형 추적 (boot() 완료 후 갱신)
  const [memberRegionId, setMemberRegionId] = useState(() => getMemberRegionId());
  useEffect(() => {
    const onAuthChange = () => setMemberRegionId(getMemberRegionId());
    window.addEventListener('su:auth:changed', onAuthChange);
    setMemberRegionId(getMemberRegionId()); // 마운트 직후 최신 상태 반영
    return () => window.removeEventListener('su:auth:changed', onAuthChange);
  }, []);
  const isAdmin = checkIsAdmin();

  // ★ 현재 오디션 정보 가져오기 (서버 DB 포함)
  const [auditionData, setAuditionData] = useState(null);
  
  useEffect(() => {
    let mounted = true;
    const loadAudition = async () => {
      if (!id) return;
      try {
        const data = await storageAdapter.getAuditionById(id);
        if (mounted) setAuditionData(data);
      } catch (err) {
        console.error('[AuditionDetail] Failed to load audition:', err);
      }
    };
    loadAudition();
    return () => { mounted = false; };
  }, [id]);
  
  const currentAudition = useMemo(() => {
    // ★ 서버 API 데이터 우선, 없으면 adminStore 캐시 fallback
    if (auditionData) {
      // regionScope/regionIds 있으면 그대로
      if (auditionData.regionScope || auditionData.regionIds) return auditionData;
      // regionId만 있으면 REGION 스코프로 변환 → 타지역 응모 차단
      if (auditionData.regionId) {
        return { ...auditionData, regionScope: 'REGION', regionIds: [auditionData.regionId] };
      }
      return { ...auditionData, regionScope: 'ALL', regionIds: [] };
    }
    const auditions = getAuditions();
    return auditions.find(a => String(a.id) === String(id)) || { regionScope: 'ALL', regionIds: [] };
  }, [id, auditionData]);

  const auditionPosterUrl = useMemo(() => {
    const imageFromAuditionData =
      auditionData?.posterUrl ||
      auditionData?.poster_url ||
      auditionData?.imageUrl ||
      auditionData?.image_url ||
      (Array.isArray(auditionData?.images) ? auditionData.images[0] : null);

    const imageFromCurrentAudition =
      currentAudition?.posterUrl ||
      currentAudition?.poster_url ||
      currentAudition?.imageUrl ||
      currentAudition?.image_url ||
      (Array.isArray(currentAudition?.images) ? currentAudition.images[0] : null);

    return imageFromAuditionData || imageFromCurrentAudition || '';
  }, [auditionData, currentAudition]);

  // ★ 참여 가능 여부 체크
  const canJoin = canParticipate(currentAudition, memberRegionId, isAdmin);
  const auditionClosed = isAuditionClosed(currentAudition);
  const canApply = canJoin && !auditionClosed;
  const auditionRegionLabel = useMemo(() => {
    return (
      auditionData?.regionName ||
      auditionData?.region_name ||
      currentAudition?.regionName ||
      currentAudition?.region_name ||
      ''
    );
  }, [auditionData, currentAudition]);
  const regionName = currentAudition?.regionName || null;
  const blockedReason = auditionClosed
    ? '종료된 오디션입니다.'
    : !canJoin
      ? getParticipationBlockedReason(currentAudition, memberRegionId, loggedIn, regionName)
      : "";

  useEffect(() => {
    if (auditionClosed) {
      setShowForm(false);
    }
  }, [auditionClosed]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    region: "",
    intro: "",
    link: "",              // 소개 영상 URL (유튜브 등)
    linkKind: null,       // 'youtube' | 'direct'
    portfolio: "",        // 포트폴리오 URL (별도 관리)
    uploadFile: null,
    uploadedVideoUrl: "", // 서버 업로드 완료 원본 URL
    consent: false,
  });

  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);

  const [previewUrl, setPreviewUrl] = useState(null); // object URL or data URL or embed url
  const objectUrlRef = useRef(null);

  useEffect(() => {
    return () => {
      // cleanup object URL
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  const handleChange = (k) => (e) => {
    const value = k === "consent" ? e.target.checked : e.target.value;
    setForm((s) => ({ ...s, [k]: value }));
  };

  const handleFile = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    // 로컈 object URL로 즉시 미리보기
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    objectUrlRef.current = URL.createObjectURL(f);
    setPreviewUrl(objectUrlRef.current);
    setForm((s) => ({ ...s, uploadFile: f, uploadedVideoUrl: "", link: "", linkKind: null }));

    // 서버에 multipart로 업로드 → URL 수령 (base64 JSON 불가 해결)
    setUploadingVideo(true);
    setVideoUploadProgress(0);
    try {
      const res = await storageAdapter.uploadBroadcastVideo(f, (pct) => setVideoUploadProgress(Math.round(pct)));
      if (res && res.videoUrl) {
        setForm((s) => ({ ...s, uploadedVideoUrl: res.videoUrl, linkKind: 'direct' }));
        setPreviewUrl(res.videoUrl);
      }
    } catch (err) {
      console.error('[AuditionDetail] video upload error:', err);
      window.alert('영상 업로드에 실패했습니다: ' + (err.message || ''));
      setForm((s) => ({ ...s, uploadFile: null, uploadedVideoUrl: '' }));
      setPreviewUrl(null);
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleLinkPreview = (val) => {
    setForm((s) => ({ ...s, link: val, uploadFile: null, uploadedVideoUrl: '' }));
    // revoke previous object url
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    const yid = parseYoutubeId(val);
    if (yid) {
      setForm((s) => ({ ...s, linkKind: "youtube" }));
      setPreviewUrl(`https://www.youtube.com/embed/${yid}?rel=0&modestbranding=1&controls=1`);
      return;
    }
    if (isDirectVideoUrl(val)) {
      setForm((s) => ({ ...s, linkKind: "direct" }));
      setPreviewUrl(val);
      return;
    }
    setPreviewUrl(null);
    setForm((s) => ({ ...s, linkKind: null }));
  };

  const validate = () => {
    if (!form.name.trim()) return "이름을 입력하세요.";
    if (!form.phone.trim()) return "연락처를 입력하세요.";
    if (!form.region.trim()) return "활동 지역을 입력하세요.";
    if (!form.intro.trim()) return "자기소개를 입력하세요.";    if (!form.link && !form.uploadedVideoUrl) return "소개 영상 URL 또는 영상 파일을 첨부해주세요.";    if (!form.consent) return "개인정보 제공 동의가 필요합니다.";
    return null;
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    if (auditionClosed) {
      window.alert('종료된 오디션에는 응모할 수 없습니다.');
      return;
    }
    const err = validate();
    if (err) {
      window.alert(err);
      return;
    }
    
    // ✅ UPDATE: 서버 API로 제출
    try {
      // uploadedVideoUrl = 서버 업로드된 URL, link = 유튜브 등 외부 URL
      const mediaUrl = form.link || form.uploadedVideoUrl || '';
      const mediaType = form.linkKind === 'youtube' ? 'youtube' : 'video';
      
      if (!mediaUrl) {
        window.alert('영상 URL을 입력하거나 영상 파일을 쳊부해주세요.');
        return;
      }
      
      const payload = {
        title: `${form.name} - ${form.region}`,
        mediaType,
        mediaUrl,
        thumbnailUrl: null,
      };
      
      const result = await storageAdapter.createAuditionSubmission(id, payload);
      console.log('[AuditionDetail] Submission created:', result);
      
      window.alert("지원이 접수되었습니다. 관리자 승인 후 영상이 공개됩니다.");
      setShowForm(false);
      setForm({ name: "", phone: "", region: "", intro: "", link: "", linkKind: null, portfolio: "", uploadFile: null, uploadedVideoUrl: "", consent: false });
      setPreviewUrl(null);
      setRefreshKey(k => k + 1); // 새로고침하여 참가 영상 목록 업데이트
    } catch (err) {
      console.error('[AuditionDetail] Submission error:', err);
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        window.alert('로그인이 필요합니다. 로그인 후 다시 시도해주세요.');
      } else {
        window.alert("지원 접수에 실패했습니다: " + (err.message || '알 수 없는 오류'));
      }
    }
  };

  function CardMediaBox({ children }) {
    // 바깥 래퍼만 su-cardThumb, 내부 su-mediaWrap은 VideoEmbed가 담당
    return (
      <div className="su-cardThumb">
        {children}
      </div>
    );
  }

  // ✅ UPDATE: 서버 DB에서 submissions 로딩
  useEffect(() => {
    let mounted = true;
    const loadSubmissions = async () => {
      if (!id) return;
      try {
        const data = await storageAdapter.getAuditionSubmissions(id);
        if (!mounted) return;
        // ✅ UPDATE: 안전한 파싱 (data.submissions || data || [])
        const subs = Array.isArray(data?.submissions) ? data.submissions : Array.isArray(data) ? data : [];
        console.log('[AuditionDetail] loaded submissions', subs.map((item) => ({
          id: item?.submissionId || item?.submission_id || item?.id,
          title: item?.title,
          rankLabel: item?.rankLabel || item?.rank_label || '',
        })));
        setSubmissions(subs);
      } catch (err) {
        console.error('[AuditionDetail] Failed to load submissions:', err);
        if (mounted) setSubmissions([]);
      }
    };
    loadSubmissions();
    // register SSOT listener to refresh submissions when relevant
    const listenerId = register(['auditions','submissions','participations'], () => {
      setRefreshKey(k => k + 1);
    });

    return () => { mounted = false; unregister(listenerId); };
  }, [id, refreshKey]); // ✨ ADD: refreshKey 의존성 추가 (투표 후 재로딩)

  useEffect(() => {
    const handleSubmissionUpdate = (event) => {
      const detail = event?.detail || {};
      if (detail.type !== 'submissions' || detail.operation !== 'update') return;
      if (String(detail.auditionId) !== String(id)) return;
      const nextRankLabel = detail?.submission?.rankLabel ?? detail?.payload?.rankLabel;
      if (nextRankLabel === undefined) return;

      console.log('[AuditionDetail] received submission update', detail);
      setSubmissions((prev) => {
        if (!Array.isArray(prev)) return prev;
        return prev.map((item) => {
          const submissionId = item?.submissionId || item?.submission_id || item?.id;
          if (String(submissionId) !== String(detail.submissionId)) return item;
          return {
            ...item,
            rankLabel: nextRankLabel,
            rank_label: nextRankLabel,
          };
        });
      });
    };

    window.addEventListener('su:ssot:changed', handleSubmissionUpdate);
    return () => window.removeEventListener('su:ssot:changed', handleSubmissionUpdate);
  }, [id]);

  // ✅ UPDATE: allVideos는 서버 데이터 기반
  const allVideos = useMemo(() => {
    if (!submissions) return []; // 로딩중이면 빈 배열
    const normalized = submissions.map(s => ({
      id: s.submissionId || s.submission_id || s.id,
      auditionId: s.auditionId || s.audition_id || id,
      name: s.title || '참가자',
      type: s.mediaType || s.media_type || 'youtube',
      mediaUrl: s.mediaUrl || s.media_url || '',
      thumbnail: s.thumbnailUrl || s.thumbnail_url || null,
      rankLabel: s.rankLabel || s.rank_label || s.badgeLabel || s.badge_label || s.resultLabel || s.result_label || '',
      voted: s.voted || s.voted_by_current_user || s.user_voted || false,
      votesCount: s.votesCount || s.votes_count || 0,
      approvalStatus: String(s.approvalStatus || (s.locked ? 'pending' : 'pending')).toLowerCase(),
      locked: !!s.locked,
      createdAt: s.createdAt || s.created_at,
      auditionClosed,
    }));
    const publicVideos = normalized.filter(
      (item) => item.approvalStatus === 'approved' && item.mediaUrl && !item.locked
    );
    console.log('[AuditionDetail] render allVideos', publicVideos.map((item) => ({
      id: item.id,
      name: item.name,
      rankLabel: item.rankLabel,
      approvalStatus: item.approvalStatus,
    })));
    return sortAuditionSubmissions(publicVideos, auditionClosed);
  }, [submissions, id, auditionClosed]);

  const myPendingSubmission = useMemo(() => {
    if (!submissions) return null;
    const me = getCurrentUser();
    if (!me?.memberId) return null;
    return submissions.find((s) =>
      String(s.memberId || s.member_id || '') === String(me.memberId) &&
      String(s.approvalStatus || 'pending').toLowerCase() === 'pending'
    ) || null;
  }, [submissions]);

  const top3Videos = useMemo(() => {
    return allVideos.slice(0, 3);
  }, [allVideos]);

  // 모든 참가 영상 — 최신순 (나중에 등록한 영상이 앞에)
  const allVideosByDate = useMemo(() => {
    return [...allVideos].sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta; // 최신 등록순(내림차순)
    });
  }, [allVideos]);

  const participantNumberMap = useMemo(() => {
    const ascending = [...allVideos].sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return ta - tb;
    });
    return ascending.reduce((acc, item, index) => {
      acc[item.id] = index + 1;
      return acc;
    }, {});
  }, [allVideos]);

  return (
    <div className="su-page su-audition-detail">
      {/* ✅ UPDATE: 비디오 모달 */}
      {selectedVideo && (
        <AuditionVideoModal 
          video={selectedVideo} 
          onClose={() => setSelectedVideo(null)} 
          onVote={(sid) => {
            // mark voted locally so reopening modal shows voted state
            setSubmissions(prev => prev ? prev.map(s => {
              const sidVal = s.submissionId || s.submission_id || s.id;
              if (String(sidVal) === String(sid)) {
                return { ...s, votesCount: (s.votesCount || s.votes_count || 0) + 1, voted: true };
              }
              return s;
            }) : prev);
            setRefreshKey(k => k + 1);
          }}
        />
      )}

      {posterPreviewOpen && auditionPosterUrl && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(2,6,23,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => setPosterPreviewOpen(false)}
        >
          <button
            type="button"
            onClick={() => setPosterPreviewOpen(false)}
            style={{ position: 'absolute', top: 14, right: 14, width: 36, height: 36, borderRadius: 999, border: '1px solid rgba(255,255,255,0.22)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}
          >
            ×
          </button>
          <img
            src={auditionPosterUrl}
            alt={auditionData?.title || '오디션 포스터 원본'}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 10 }}
          />
        </div>
      )}

      {/* ── 오디션 히어로 헤더 ── */}
      {myPendingSubmission && (
        <div style={{
          margin: '10px 10px 0',
          padding: '12px 14px',
          borderRadius: 12,
          background: 'rgba(245,158,11,0.12)',
          border: '1px solid rgba(245,158,11,0.35)',
          color: '#fde68a',
          fontSize: 13,
          fontWeight: 700,
        }}>
          🔒 제출하신 참가 영상은 관리자 승인 대기 중입니다. 승인 후 다른 사용자에게 공개됩니다.
        </div>
      )}
      <div style={{
        background: 'linear-gradient(158deg, #08121c 0%, #0d1e2d 55%, #06101a 100%)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(34,211,238,0.14)',
        borderRadius: 16,
        margin: '10px 10px 0',
      }}>
        {/* 상단 라인 글로우 */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg, transparent, rgba(245,158,11,0.60), transparent)' }} />
        {/* 오렌지 글로우 */}
        <div style={{ position:'absolute', top:-40, right:-20, width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle, rgba(245,158,11,0.14), transparent 70%)', pointerEvents:'none' }} />
        {/* 티얼 글로우 */}
        <div style={{ position:'absolute', bottom:-30, left:10, width:140, height:140, borderRadius:'50%', background:'radial-gradient(circle, rgba(34,211,238,0.11), transparent 70%)', pointerEvents:'none' }} />

        {/* 네비 행 */}
        <div style={{ display:'flex', alignItems:'center', padding:'10px 14px 0', position:'relative', zIndex:1 }}>
          <button
            type="button"
            onClick={() => navigate('/audition')}
            style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', color:'#cbd5e1', fontSize:20, cursor:'pointer', flexShrink:0, lineHeight:1 }}
          >‹</button>
          <span style={{ flex:1, textAlign:'center', fontSize:15, fontWeight:800, color:'#f1f5f9', letterSpacing:'-0.01em' }}>
            {auditionRegionLabel ? `${auditionRegionLabel} 오디션` : '오디션'}
          </span>
          <button
            type="button"
            onClick={() => {
              const url = window.location.href;
              if (navigator.share) {
                navigator.share({ title: auditionData?.title || '오디션', url }).catch(() => {});
              } else {
                navigator.clipboard?.writeText(url)
                  .then(() => window.alert('링크가 복사되었습니다.'))
                  .catch(() => {});
              }
            }}
            style={{
              background:'rgba(255,215,0,0.12)',
              border:'1px solid rgba(255,215,0,0.22)',
              borderRadius:10,
              minWidth:52,
              height:32,
              padding:'0 10px',
              display:'inline-flex',
              alignItems:'center',
              justifyContent:'center',
              color:'#fbbf24',
              fontSize:12,
              fontWeight:800,
              cursor:'pointer',
              flexShrink:0,
              whiteSpace:'nowrap',
              lineHeight:1,
            }}
          >공유</button>
        </div>

        {/* 히어로 콘텐츠 */}
        <div style={{ padding:'12px 20px 20px', textAlign:'center', position:'relative', zIndex:1 }}>
          <div style={{ fontSize:36, lineHeight:1, marginBottom:10 }}>🎤</div>
          <div style={{ display:'flex', justifyContent:'center', gap:7, flexWrap:'wrap' }}>
            <span style={{ background:'linear-gradient(135deg, rgba(245,158,11,0.22), rgba(239,68,68,0.18))', border:'1px solid rgba(245,158,11,0.35)', borderRadius:999, padding:'5px 14px', fontSize:12, fontWeight:700, color:'#fbbf24' }}>🗳️ 투표하기</span>
            <span style={{ background:'rgba(34,211,238,0.10)', border:'1px solid rgba(34,211,238,0.22)', borderRadius:999, padding:'5px 14px', fontSize:12, fontWeight:700, color:'#67e8f9' }}>💬 댓글달기</span>
          </div>
          <div style={{ marginTop:8, fontSize:12, color:'rgba(255,255,255,0.38)', lineHeight:1.5 }}>마음에 드는 영상에 투표하고 응원 댓글을 남겨보세요</div>
        </div>
      </div>

      <section className="su-panel" style={{ padding: '16px 16px 12px', margin: '10px 10px 0', borderRadius: 16 }}>
        {auditionData ? (
          <div>
            <div style={{
              marginTop: 0,
              marginBottom: 8,
              padding: '0 2px',
            }}>
              <div style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#0ea5e9',
                marginBottom: 2,
                letterSpacing: '-0.01em',
              }}>오디션 제목</div>
              <div style={{
                fontSize: 20,
                fontWeight: 900,
                color: '#0f172a',
                lineHeight: 1.35,
                wordBreak: 'break-all',
                whiteSpace: 'pre-line',
                marginBottom: 0,
              }}>
                {auditionData.title || '오디션'}
              </div>
            </div>
            {auditionPosterUrl && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ width: 'calc(100% + 20px)', marginLeft: -10, marginRight: -10, borderRadius: 12, overflow: 'hidden', border: '1px solid #E2E8F0', background: '#0b1220' }}>
                  <img
                    src={auditionPosterUrl}
                    alt={auditionData.title || '오디션 포스터'}
                    style={{ width: '100%', maxHeight: 240, objectFit: 'cover', display: 'block' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                  <button
                    type="button"
                    onClick={() => setPosterPreviewOpen(true)}
                    style={{ fontSize: 12, fontWeight: 700, color: '#0E7490', border: '1px solid rgba(14,116,144,0.30)', background: '#ecfeff', borderRadius: 999, padding: '4px 10px', cursor: 'pointer' }}
                  >
                    원본보기
                  </button>
                </div>
              </div>
            )}
            <div style={{
              margin: '14px 0 0 0',
              padding: '0 2px',
            }}>
              <div style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#0ea5e9',
                marginBottom: 2,
                letterSpacing: '-0.01em',
              }}>오디션 설명</div>
              <div style={{
                fontSize: 15,
                color: '#2C3E45',
                lineHeight: 1.7,
                wordBreak: 'break-all',
                whiteSpace: 'pre-line',
                marginBottom: 0,
              }}>
                {auditionData.description || '오디션 상세 정보가 없습니다.'}
              </div>
            </div>
            {(auditionData.startAt || auditionData.endAt) && (
              <div style={{ marginTop: 12, fontSize: 14, color: '#637074' }}>
                📅 신청 기간: {
                  auditionData.startAt
                    ? new Date(auditionData.startAt).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
                    : '미정'
                } ~ {
                  auditionData.endAt
                    ? new Date(auditionData.endAt).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
                    : '미정'
                }
              </div>
            )}
          </div>
        ) : (
          <p>오디션 정보를 불러오는 중...</p>
        )}

        <div style={{ marginTop: 12 }}>
          {!canApply ? (
            <div>
              <button
                type="button"
                disabled
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 164,
                  minHeight: 52,
                  padding: '0 22px',
                  borderRadius: 18,
                  border: '1px solid rgba(148,163,184,0.35)',
                  background: 'linear-gradient(135deg, rgba(148,163,184,0.88), rgba(100,116,139,0.92))',
                  color: '#f8fafc',
                  fontWeight: 800,
                  fontSize: 15,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                  cursor: 'not-allowed',
                  boxShadow: '0 10px 24px rgba(71,85,105,0.18)',
                  opacity: 0.82,
                }}
              >
                {blockedReason || '이 지역 회원만 참여 가능합니다.'}
              </button>
            </div>
          ) : (
          <button
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              minWidth: 156,
              minHeight: 54,
              padding: '0 24px',
              borderRadius: 18,
              border: showForm ? '1px solid rgba(148,163,184,0.32)' : '1px solid rgba(251,191,36,0.45)',
              background: showForm
                ? 'linear-gradient(135deg, rgba(100,116,139,0.96), rgba(71,85,105,0.98))'
                : 'linear-gradient(135deg, #ff934f 0%, #ff6b4a 45%, #ff4d6d 100%)',
              color: '#fffaf5',
              fontWeight: 900,
              fontSize: 16,
              letterSpacing: '-0.02em',
              lineHeight: 1,
              cursor: 'pointer',
              boxShadow: showForm
                ? '0 10px 22px rgba(71,85,105,0.20)'
                : '0 14px 30px rgba(255,107,74,0.28), inset 0 1px 0 rgba(255,255,255,0.28)',
              transition: 'transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease',
              filter: showForm ? 'none' : 'saturate(1.04)',
            }}
            onClick={() => {
              if (!isLoggedIn()) {
                window.alert('로그인 후 응모할 수 있습니다.');
                return;
              }
              setShowForm((s) => !s);
            }}
          >
            {showForm ? '✕ 응모 취소' : '🎤 응모하기'}
          </button>
          )}
        </div>

        {showForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflowY: 'auto',
          }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: 16,
              padding: '24px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(12,84,96,0.18)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>오디션 지원</h3>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#637074',
                    fontSize: 24,
                    cursor: 'pointer',
                    padding: 0,
                    lineHeight: 1,
                  }}
                >×</button>
              </div>
          <form onSubmit={handleSubmit}>
            {/* 소개 영상 — URL 입력 또는 파일 쳊부 (필수) */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: '#0D1B21' }}>
                소개 영상 <span style={{ color: '#ef4444' }}>*</span>
              </div>
              <div style={{ fontSize: 12, color: '#637074', marginBottom: 8 }}>영상 URL 입력 또는 mp4/webm 파일 첨부</div>

              {/* URL 입력 */}
              <input
                type="url"
                value={form.link}
                onChange={(e) => handleLinkPreview(e.target.value)}
                placeholder="https://youtube.com/shorts/... 또는 https://youtu.be/..."
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  border: '1px solid #DDE3EA', background: '#FFFFFF', color: '#0D1B21',
                  fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 8,
                }}
              />

              {/* 파일 쳊부 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <label
                  htmlFor="audition-video-file"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '8px 14px', borderRadius: 8,
                    border: '1px solid #DDE3EA', background: uploadingVideo ? '#f3f4f6' : '#f8f9fa',
                    color: '#374151', fontSize: 13, fontWeight: 500, cursor: uploadingVideo ? 'wait' : 'pointer',
                  }}
                >
                  📹 {uploadingVideo ? `업로드 중... ${videoUploadProgress}%` : '영상 파일 첨부'}
                </label>
                <input
                  id="audition-video-file"
                  type="file"
                  accept="video/mp4,video/webm,video/ogg"
                  style={{ display: 'none' }}
                  onChange={handleFile}
                  disabled={uploadingVideo}
                />
                {form.uploadedVideoUrl && (
                  <span style={{ fontSize: 12, color: '#16a34a' }}>✅ 업로드 완료</span>
                )}
                {form.link && (
                  <span style={{ fontSize: 12, color: '#2563eb' }}>🔗 URL 입력됨</span>
                )}
              </div>

              {/* 미리보기 */}
              {previewUrl && (
                <div style={{ marginTop: 12, border: '1px solid #DDE3EA', borderRadius: 8, overflow: 'hidden' }}>
                  {form.linkKind === 'youtube' ? (
                    <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                      <iframe
                        title="preview"
                        src={previewUrl}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <video controls src={previewUrl} style={{ width: '100%', maxHeight: 220, display: 'block' }} />
                  )}
                </div>
              )}
            </div>

            {/* Form fields */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, opacity: 0.9 }}>이름 <span style={{ color: '#ef4444' }}>*</span></div>
              <input className="su-input" value={form.name} onChange={handleChange("name")} style={{ width: '100%' }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, opacity: 0.9 }}>연락처 <span style={{ color: '#ef4444' }}>*</span></div>
              <input className="su-input" value={form.phone} onChange={handleChange("phone")} placeholder="예: 010-1234-5678" style={{ width: '100%' }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, opacity: 0.9 }}>활동 지역 <span style={{ color: '#ef4444' }}>*</span></div>
              <input className="su-input" value={form.region} onChange={handleChange("region")} style={{ width: '100%' }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#0D1B21' }}>한마디 <span style={{ color: '#ef4444' }}>*</span></div>
              <textarea
                value={form.intro}
                onChange={handleChange("intro")}
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid #DDE3EA',
                  background: '#FFFFFF',
                  color: '#0D1B21',
                  fontSize: 14,
                  lineHeight: 1.6,
                  resize: 'vertical',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#0D1B21' }}>포트폴리오 <span style={{ fontSize: 12, fontWeight: 400, color: '#637074' }}>(선택)</span></div>
              <input
                type="url"
                value={form.portfolio}
                onChange={handleChange("portfolio")}
                placeholder="https://instagram.com/... 또는 https://youtube.com/..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid #DDE3EA',
                  background: '#FFFFFF',
                  color: '#0D1B21',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {form.portfolio && (
                <button
                  type="button"
                  onClick={() => {
                    let url = form.portfolio.trim();
                    if (url && !/^https?:\/\//i.test(url)) url = 'https://' + url;
                    if (url) window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                  style={{ display: 'inline-block', marginTop: 6, fontSize: 13, color: '#0C5460', textDecoration: 'underline', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                >
                  포트폴리오 링크 열기 ↗
                </button>
              )}
            </div>

            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={form.consent} onChange={handleChange("consent")} id="consent-check" />
              <label htmlFor="consent-check" style={{ fontSize: 14, cursor: 'pointer' }}>
                개인정보 제공에 동의합니다. <span style={{ color: '#ef4444' }}>(필수)</span>
              </label>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button
                type="submit"
                style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#f59e0b,#ef4444)', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
              >지원하기</button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1px solid #DDE3EA', background: '#f8f9fa', color: '#374151', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
              >취소</button>
            </div>
          </form>
            </div>
          </div>
        )}
      </section>

      {/* TOP3 포디엄 섹션 */}
      <section style={{ padding: 16, marginTop: 12, background: 'radial-gradient(circle at top, rgba(34,211,238,0.12), transparent 30%), linear-gradient(160deg,#07141b 0%,#0f2230 58%,#08131d 100%)', borderRadius: 18, margin: '12px 0 0', overflow:'hidden', position:'relative', border: '1px solid rgba(56,189,248,0.16)', boxShadow: '0 22px 48px rgba(3, 10, 20, 0.42), inset 0 1px 0 rgba(255,255,255,0.04)' }}>
        <style>{`
          /* ── @property: conic-gradient 각도 직접 애니메이션 (Chrome/Safari/FF 지원) ── */
          @property --an { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
          @keyframes gsweep { to { --an: 360deg; } }
          .vote-bar-wrap { height:4px; background:rgba(255,255,255,0.1); border-radius:2px; margin-top:5px; overflow:hidden; }
          .vote-bar-fill { height:100%; border-radius:2px; transition:width 0.8s cubic-bezier(.4,0,.2,1); }
          /* 외부 래퍼: overflow:hidden 없음 → 2px padding이 테두리 역할 */
          .t3-outer { position:relative; border-radius:18px; padding:1.5px; cursor:pointer; transition:transform .24s ease, box-shadow .24s ease, filter .24s ease; transform:perspective(1200px) rotateX(0.8deg) rotateY(-1.5deg); }
          .t3-outer::before { content:''; position:absolute; inset:10px 16px auto; height:40px; border-radius:999px; background:radial-gradient(circle, rgba(34,211,238,0.22), transparent 72%); filter:blur(20px); opacity:.75; pointer-events:none; }
          .t3-outer:hover { transform:perspective(1200px) translateY(-4px) rotateX(0deg) rotateY(-0.5deg); filter:saturate(1.08); }
          /* 각 순위별 회전 conic-gradient 테두리 */
          .t3-outer-gold   {
            background: conic-gradient(from var(--an) at 50% 50%,
              transparent 0deg, transparent 200deg,
              rgba(160,80,0,0.35) 210deg, #cc7700 218deg, #ffd700 222deg,
              #fffbe0 225deg, #ffd700 228deg, #cc7700 232deg,
              transparent 242deg, transparent 360deg);
            animation: gsweep 1.8s linear infinite;
            box-shadow: 0 0 0 1px rgba(255,215,0,0.22), 0 0 18px rgba(255,200,0,0.22), 0 18px 34px rgba(0,0,0,0.32);
          }
          .t3-outer-silver {
            background: conic-gradient(from var(--an) at 50% 50%,
              transparent 0deg, transparent 200deg,
              rgba(80,80,80,0.3) 210deg, #aaa 218deg, #ddd 222deg,
              #fff 225deg, #ddd 228deg, #aaa 232deg,
              transparent 242deg, transparent 360deg);
            animation: gsweep 2.2s linear infinite;
            box-shadow: 0 0 0 1px rgba(226,232,240,0.16), 0 0 16px rgba(226,232,240,0.14), 0 18px 32px rgba(0,0,0,0.28);
          }
          .t3-outer-bronze {
            background: conic-gradient(from var(--an) at 50% 50%,
              transparent 0deg, transparent 200deg,
              rgba(90,40,0,0.3) 210deg, #8b4500 218deg, #cd7f32 222deg,
              #f5c070 225deg, #cd7f32 228deg, #8b4500 232deg,
              transparent 242deg, transparent 360deg);
            animation: gsweep 2.6s linear infinite;
            box-shadow: 0 0 0 1px rgba(245,158,11,0.16), 0 0 16px rgba(245,158,11,0.14), 0 18px 32px rgba(0,0,0,0.28);
          }
          /* 내부 컨테이너: overflow:hidden은 여기서만 */
          .t3-inner { position:relative; border-radius:16px; overflow:hidden; background:linear-gradient(180deg, rgba(7,18,27,0.98), rgba(7,14,23,0.98)); }
          .t3-inner::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg, rgba(255,255,255,0.08), transparent 28%, transparent 72%, rgba(34,211,238,0.06)); pointer-events:none; z-index:1; }
        `}</style>

        <div style={{ position:'absolute', inset:'0 auto auto 0', width:'100%', height:1, background:'linear-gradient(90deg, transparent, rgba(103,232,249,0.7), transparent)', opacity:0.7 }} />
        <div style={{ position:'absolute', top:18, right:18, width:120, height:120, borderRadius:'50%', background:'radial-gradient(circle, rgba(34,211,238,0.18), transparent 70%)', filter:'blur(10px)', pointerEvents:'none' }} />

        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, position:'relative', zIndex:1 }}>
          <span style={{ fontSize:20 }}>🏆</span>
          <span style={{ fontSize:18, fontWeight:900, color:'#f8fafc', letterSpacing:0.5, textShadow:'0 0 18px rgba(34,211,238,0.16)' }}>{auditionClosed ? '최종 결과' : 'TOP 3'}</span>
          {allVideos.length > 0 && <span style={{ marginLeft:'auto', fontSize:11, color:'rgba(255,255,255,0.4)', fontWeight:500 }}>{auditionClosed ? '심사 결과 우선' : '투표순'} · {allVideos.length}개 참가작</span>}
        </div>

        {top3Videos.length === 0 ? (
          <div style={{ textAlign:'center', padding:'32px 0', color:'rgba(255,255,255,0.4)', fontSize:14 }}>아직 참가작이 없습니다.</div>
        ) : (() => {
          const maxVotes = Math.max(1, top3Videos[0]?.votesCount || 1);

          // 순위별 배지 스타일 (solid — 모든 브라우저 호환)
          const medalPill = [
            null,
            { bg:'linear-gradient(135deg,#b8860b,#ffd700,#fff5a0)', color:'#3d2000', shadow:'0 2px 8px rgba(255,200,0,0.55)', fs:22 },
            { bg:'linear-gradient(135deg,#555,#b0b0b0,#eee)',         color:'#111',   shadow:'0 2px 6px rgba(180,180,180,0.45)', fs:17 },
            { bg:'linear-gradient(135deg,#6e3a00,#cd7f32,#f0b860)',   color:'#2a1000', shadow:'0 2px 6px rgba(200,120,30,0.45)', fs:17 },
          ];
          const medalBorder = [
            null,
            { ring:'#ffd700', glow:'rgba(255,200,0,0.35)' },
            { ring:'#b0b0b0', glow:'rgba(180,180,180,0.25)' },
            { ring:'#cd7f32', glow:'rgba(200,120,30,0.30)' },
          ];
          const Top3Card = ({ v, rankNum, outerCls, color, barGrad, height=165 }) => {
            const mp = medalPill[rankNum] || medalPill[1];
            const badgeText = getAuditionDisplayBadge(v, rankNum, auditionClosed);
            return (
              <div className={`t3-outer ${outerCls}`} onClick={() => setSelectedVideo(v)}>
                <div className="t3-inner">
                  {/* 영상 영역 */}
                  <div style={{ position:'relative', height, background:'linear-gradient(180deg,#020617,#08111d)', overflow:'hidden' }}>
                    <div style={{ position:'absolute', inset:0 }}>
                      <CardMediaBox><VideoEmbed url={v.mediaUrl} mode="thumbnail" thumbnail={v.thumbnail} /></CardMediaBox>
                    </div>
                    {/* solid gradient pill 배지 */}
                    {badgeText ? (
                      <div style={{ position:'absolute', top:8, left:8, background:mp.bg, borderRadius:999, padding:'5px 12px', boxShadow:mp.shadow, zIndex:3, maxWidth:'calc(100% - 16px)' }}>
                        <span style={{ fontWeight:900, fontSize:auditionClosed ? 13 : mp.fs, color:mp.color, fontFamily:'Arial Black,sans-serif', lineHeight:1, display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{badgeText}</span>
                      </div>
                    ) : null}
                    <div style={{ position:'absolute', inset:'auto 0 0 0', height:'46%', background:'linear-gradient(to top,rgba(2,6,23,0.92), rgba(2,6,23,0.18), transparent)' }} />
                    <div style={{ position:'absolute', inset:'12px 12px auto auto', width:56, height:56, borderRadius:'50%', background:'radial-gradient(circle, rgba(103,232,249,0.16), transparent 72%)', filter:'blur(6px)', pointerEvents:'none' }} />
                  </div>
                  <div style={{ padding:'10px 11px 11px', background:'linear-gradient(180deg, rgba(7,15,25,0.96), rgba(8,18,30,0.98))', position:'relative', zIndex:2 }}>
                    <div style={{ fontSize:13, fontWeight:800, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', letterSpacing:'-0.01em' }}>{v.name}</div>
                    <div style={{ marginTop:5 }}>
                      <span style={{ display:'inline-flex', alignItems:'center', gap:6, minHeight:26, padding:'0 10px', borderRadius:999, fontSize:11, color:'#e0f2fe', fontWeight:800, whiteSpace:'nowrap', background:'linear-gradient(135deg, rgba(8,47,73,0.92), rgba(12,74,110,0.86))', border:'1px solid rgba(103,232,249,0.16)', boxShadow:'inset 0 1px 0 rgba(255,255,255,0.06)' }}>
                        <span aria-hidden="true" style={{ color, textShadow:`0 0 12px ${color}` }}>❤</span>
                        <span>{v.votesCount || 0}표</span>
                      </span>
                    </div>
                    <div className="vote-bar-wrap">
                      <div className="vote-bar-fill" style={{ width:`${Math.round(((v.votesCount||0)/maxVotes)*100)}%`, background:barGrad }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          };

          return (
            <div style={{ display:'flex', flexDirection:'column', gap:10, position:'relative', zIndex:1 }}>
              {/* 1위 — 상단 전체 너비 */}
              {top3Videos[0] && (
                <Top3Card v={top3Videos[0]} rankNum={1}
                  outerCls="t3-outer-gold"
                  color="#ffd700" barGrad="linear-gradient(90deg,#b8860b,#ffd700)"
                  height={165} />
              )}
              {/* 2·3위 — 하단 좌우 나란히 */}
              <div style={{ display:'flex', gap:8 }}>
                {top3Videos[1] ? (
                  <div style={{ flex:1, minWidth:0 }}>
                    <Top3Card v={top3Videos[1]} rankNum={2}
                      outerCls="t3-outer-silver"
                      color="#c0c0c0" barGrad="linear-gradient(90deg,#555,#c0c0c0)"
                      height={110} />
                  </div>
                ) : (
                  <div style={{ flex:1, border:'1px dashed rgba(255,255,255,0.08)', borderRadius:12, minHeight:80, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.2)', fontSize:12 }}>2위</div>
                )}
                {top3Videos[2] ? (
                  <div style={{ flex:1, minWidth:0 }}>
                    <Top3Card v={top3Videos[2]} rankNum={3}
                      outerCls="t3-outer-bronze"
                      color="#cd7f32" barGrad="linear-gradient(90deg,#5a2d00,#cd7f32)"
                      height={110} />
                  </div>
                ) : (
                  <div style={{ flex:1, border:'1px dashed rgba(255,255,255,0.08)', borderRadius:12, minHeight:80, display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.2)', fontSize:12 }}>3위</div>
                )}
              </div>
            </div>
          );
        })()}
      </section>

      {/* 모든 참가 영상 — 3개씩 페이지 + 인디케이터 */}
      <section className="su-panel" style={{ padding: 16, marginTop: 12 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <span style={{ fontSize:15, fontWeight:800, color:'var(--c-tx-h,#0F172A)' }}>모든 참가 영상</span>
          <span style={{ fontSize:11, fontWeight:600, color:'var(--c-primary,#0E7490)', background:'var(--c-primary-t,#ECFEFF)', border:'1px solid rgba(14,116,144,0.18)', borderRadius:999, padding:'3px 10px' }}>총 {allVideosByDate.length}개</span>
        </div>
        {(() => {
          const PAGE_SIZE = 3;
          const totalPages = Math.max(1, Math.ceil(allVideosByDate.length / PAGE_SIZE));
          const safePage = Math.min(videoPage, totalPages - 1);
          const paged = allVideosByDate.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
          return (
            <>
              {submissions === null ? (
                <div style={{ textAlign:'center', padding:'40px 0', opacity:0.5 }}>로딩 중...</div>
              ) : allVideos.length === 0 ? (
                <div style={{ textAlign:'center', padding:'40px 0', opacity:0.7 }}>아직 참가 영상이 없습니다.</div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {paged.map((v) => {
                    const voteRank = allVideos.findIndex(av => av.id === v.id) + 1;
                    const participantNumber = participantNumberMap[v.id] || voteRank;
                    const resultLabel = normalizeAuditionRankLabel(v.rankLabel);
                    let resultBadgeStyle = null;
                    if (resultLabel) {
                      const nl = resultLabel.toLowerCase();
                      if (resultLabel.includes('금상') || nl.includes('gold') || resultLabel.includes('1위')) {
                        resultBadgeStyle = { background:'#fef9c3', color:'#854d0e', border:'1px solid #fde68a' };
                      } else if (resultLabel.includes('은상') || nl.includes('silver') || resultLabel.includes('2위')) {
                        resultBadgeStyle = { background:'#f1f5f9', color:'#475569', border:'1px solid #cbd5e1' };
                      } else if (resultLabel.includes('대상') || resultLabel.includes('최우수') || nl.includes('grand')) {
                        resultBadgeStyle = { background:'#eff6ff', color:'#1d4ed8', border:'1px solid #bfdbfe' };
                      } else {
                        resultBadgeStyle = { background:'#fff7ed', color:'#9a3412', border:'1px solid #fed7aa' };
                      }
                    }
                    return (
                      <div
                        key={v.id}
                        onClick={() => setSelectedVideo(v)}
                        style={{
                          display:'flex', gap:12, alignItems:'center',
                          padding:'10px 12px', borderRadius:14,
                          background:'#fff', border:'1px solid #E8EDF2',
                          cursor:'pointer', transition:'box-shadow 0.18s, transform 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow='0 4px 14px rgba(14,116,144,0.10)'; e.currentTarget.style.transform='translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='none'; }}
                      >
                        <div style={{ width:80, height:56, borderRadius:9, overflow:'hidden', background:'#EEF1F5', flexShrink:0 }}>
                          <CardMediaBox><VideoEmbed url={v.mediaUrl || v.url} mode="thumbnail" thumbnail={v.thumbnail} /></CardMediaBox>
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
                            <span style={{ fontSize:11, fontWeight:800, color:'#92400e', background:'#fef3c7', borderRadius:999, padding:'2px 8px', flexShrink:0 }}>#{participantNumber}</span>
                            <span style={{ fontSize:14, fontWeight:700, color:'#0D1B21', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{v.name}</span>
                            {resultBadgeStyle && <span style={{ fontSize:10, fontWeight:700, borderRadius:999, padding:'2px 7px', flexShrink:0, ...resultBadgeStyle }}>{resultLabel}</span>}
                          </div>
                          <div style={{ fontSize:12, color:'#e04040', fontWeight:700 }}>❤ {v.votesCount || 0}표</div>
                        </div>
                        <span style={{ fontSize:18, color:'#cbd5e1', flexShrink:0 }}>›</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 항상 페이지네이션 표시 (1페이지여도 총 개수 안내) */}
              <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:8, marginTop:16 }}>
                <button onClick={() => setVideoPage(p => Math.max(0, p - 1))} disabled={safePage === 0}
                  style={{ background:'none', border:'1px solid #DDE3EA', borderRadius:6, cursor:safePage===0?'default':'pointer', opacity:safePage===0?0.3:1, fontSize:18, color:'#0C5460', padding:'2px 10px', lineHeight:1 }}>‹</button>
                <span style={{ fontSize:13, color:'#637074', minWidth:80, textAlign:'center' }}>{safePage+1} / {totalPages}</span>
                {totalPages > 1 && Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => setVideoPage(i)}
                    style={{ width:i===safePage?20:8, height:8, borderRadius:4, border:'none', background:i===safePage?'#0C5460':'#DDE3EA', cursor:'pointer', padding:0, transition:'all .2s', flexShrink:0 }} />
                ))}
                <button onClick={() => setVideoPage(p => Math.min(totalPages - 1, p + 1))} disabled={safePage === totalPages - 1}
                  style={{ background:'none', border:'1px solid #DDE3EA', borderRadius:6, cursor:safePage===totalPages-1?'default':'pointer', opacity:safePage===totalPages-1?0.3:1, fontSize:18, color:'#0C5460', padding:'2px 10px', lineHeight:1 }}>›</button>
              </div>
            </>
          );
        })()}
      </section>
    </div>
  );
}
