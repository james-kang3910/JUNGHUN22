import React, { useMemo, useEffect, useCallback, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import VideoEmbed from "../../components/VideoEmbed";
import { isDirectVideoUrl as isDirectVideoUrlUtil, parseYouTubeId } from "../../lib/videoUtils";
import { getAllShareBroadcasts } from "../../lib/shareBroadcastStore";
import { getRelativeTime, formatFullDateTime } from "../../lib/dateUtils";
import { getViewerRegionId } from "../../lib/viewerRegionStore";
import "../../styles/broadcast-list.css";
import LiveBroadcastPlayer from "../../components/LiveBroadcastPlayer";
import PageHeader from "../../components/PageHeader";
import { resolvePublicAuthorName } from "../../lib/noticeUtils";

export default function Broadcast() {
  const navigate = useNavigate();
  const location = useLocation();
  const viewerRegionId = getViewerRegionId();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortBy, setSortBy] = useState('latest'); // latest, popular, name
  const [currentPage, setCurrentPage] = useState(1);
  const [regionFilter, setRegionFilter] = useState('all'); // 'all' | 'mine'

  // mount log
  useEffect(() => {
    console.log('[BROADCAST MOUNT] Broadcast.jsx mounted', { pathname: location?.pathname, timestamp: new Date().toISOString() });
  }, [location]);

  // ★ 서버 데이터 로드 (비동기)
  useEffect(() => {
    const reload = async () => {
      try {
        setLoading(true);
        setError(null);
        const opts = {};
        if (regionFilter === 'mine' && viewerRegionId) opts.regionId = viewerRegionId;
        const result = await getAllShareBroadcasts(opts);
        console.log('[Broadcast.jsx] reloading broadcasts', { len: result?.length, regionFilter });
        setItems(result || []);
      } catch (err) {
        console.error('[Broadcast.jsx] reload error:', err);
        setError(err.message);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    
    // initial
    reload();
    
    const onSsotChanged = (ev) => {
      try {
        const key = ev?.detail?.key || ev?.key || null;
        if (!key || key === 'su_broadcast_v1' || key === 'su_broadcasts') {
          reload();
        }
      } catch (e) {}
    };

    const onStorage = (ev) => {
      try {
        const key = String(ev?.key || '');
        if (!key) return;
        if (key === 'su_broadcast_v1' || key === 'su_broadcasts') {
          reload();
        }
      } catch (e) {}
    };
    
    window.addEventListener('storage', onStorage);
    window.addEventListener('su:ssot:changed', onSsotChanged);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('su:ssot:changed', onSsotChanged);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionFilter, viewerRegionId]);

  // route/log
  useEffect(() => {
    console.log('[Broadcast.jsx] ROUTE/ITEMS', { pathname: location?.pathname, state: location?.state, itemsLen: items.length });
  }, [location, items]);

  // state로 전달받은 videoUrl/title (Home에서 클릭 시)
  const stateVideoUrl = location.state?.videoUrl || null;
  const stateTitle = location.state?.title || null;

  // ★ 대표 영상: state 우선, 없으면 items[0].mediaUrl fallback
  const getPreferredUrl = (it) => (it?.videoUrl || it?.url || it?.mediaUrl || it?.heroVideoUrl || null);
  const heroVideoUrl = stateVideoUrl || getPreferredUrl(items[0]) || null;
  const heroTitle = stateTitle || items[0]?.title || "공유방송";

  // direct video 여부 판별 — data:video/... (base64) 도 허용하도록 videoUtils의 판별기를 사용
  const isDirectVideo = (item) => item?.type === "direct" || isDirectVideoUrlUtil(getPreferredUrl(item));
  const isHeroDirectVideo = isDirectVideoUrlUtil(heroVideoUrl);

  // ★ 검색 + 정렬 + 페이지네이션
  const itemsPerPage = 12;
  
  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];
    
    // 검색 필터
    if (searchKeyword) {
      result = result.filter(item => 
        item.title?.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }
    
    // 정렬
    result.sort((a, b) => {
      // 고정 항목 우선
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      if (sortBy === 'latest') {
        return new Date(b.createdAt || b.time || 0) - new Date(a.createdAt || a.time || 0);
      } else if (sortBy === 'popular') {
        return (b.viewCount || 0) - (a.viewCount || 0);
      } else if (sortBy === 'name') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });
    
    return result;
  }, [items, searchKeyword, sortBy]);
  
  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage);
  const currentPageItems = filteredAndSortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // 검색어/정렬 변경 시 1페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, sortBy]);

  // 대표 영상 로그
  useEffect(() => {
    console.log("[Broadcast.jsx] heroVideo", { heroVideoUrl, heroTitle, isHeroDirectVideo });
  }, [heroVideoUrl, heroTitle, isHeroDirectVideo]);

  // ★ Live detection: listen to storage for admin live flag
  const [isLiveOn, setIsLiveOn] = useState(() => {
    try { return localStorage.getItem('su_live_broadcast_on') === '1'; } catch (e) { return false; }
  });

  useEffect(() => {
    const check = () => {
      try { setIsLiveOn(localStorage.getItem('su_live_broadcast_on') === '1'); } catch (e) { setIsLiveOn(false); }
    };
    check();
    window.addEventListener('storage', check);
    try { window.addEventListener('su:ssot:changed', check); } catch (e) {}
    return () => {
      window.removeEventListener('storage', check);
      try { window.removeEventListener('su:ssot:changed', check); } catch (e) {}
    };
  }, []);

  // Modal state for watch button
  const [showLiveModal, setShowLiveModal] = useState(false);

  return (
    <div className="su-page su-page--broadcast" style={{ overflow: "visible" }}>
      <PageHeader title="공유방송" onBack={() => navigate('/home')} />

      {/* 지역 필터 */}
      {viewerRegionId && (
        <div className="su-tabRow" style={{ padding: '0 16px 4px' }}>
          <button
            type="button"
            className={`su-chip${regionFilter === 'all' ? ' is-active' : ''}`}
            onClick={() => setRegionFilter('all')}
          >
            전체
          </button>
          <button
            type="button"
            className={`su-chip${regionFilter === 'mine' ? ' is-active' : ''}`}
            onClick={() => setRegionFilter('mine')}
          >
            내 지역
          </button>
        </div>
      )}

      {/* ★ 라이브 방송 섹션 - 실무용 개선 */}
      <section className="su-panel" style={{ marginBottom: 16 }}>
        {isLiveOn ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#ff4444', fontSize: 20 }}>🔴</span>
                실시간 방송 중
              </h3>
              <span style={{
                background: 'rgba(255,68,68,0.2)',
                color: '#ff4444',
                padding: '4px 10px',
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 700,
                animation: 'pulse 2s infinite'
              }}>
                LIVE
              </span>
            </div>
            <div style={{ marginTop: 12 }}>
              <LiveBroadcastPlayer />
            </div>
          </>
        ) : (
          <div style={{
            background: 'rgba(12,84,96,0.04)',
            borderRadius: 12,
            padding: '32px 16px',
            textAlign: 'center',
            minHeight: 120,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📺</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#2C3E45' }}>
              현재 방송 준비 중입니다
            </div>
            <div style={{ fontSize: 13, color: '#637074' }}>
              방송 시작 시 알림을 드립니다. 잠시만 기다려주세요!
            </div>
          </div>
        )}
      </section>

      {/* ★ 검색 + 정렬 바 */}
      <div className="su-panel" style={{ marginBottom: 12 }}>
        <input 
          type="search"
          placeholder="🔍 방송 제목 검색..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #DDE3EA',
            background: '#EEF1F5',
            color: '#0D1B21',
            fontSize: 14,
            marginBottom: 12,
            outline: 'none'
          }}
        />
        
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            className="su-pill"
            onClick={() => setSortBy('latest')}
            style={{
              background: sortBy === 'latest' ? 'rgba(12,84,96,0.12)' : undefined,
              border: sortBy === 'latest' ? '1px solid rgba(12,84,96,0.35)' : undefined
            }}
          >
            최신순
          </button>
          <button 
            className="su-pill"
            onClick={() => setSortBy('popular')}
            style={{
              background: sortBy === 'popular' ? 'rgba(12,84,96,0.12)' : undefined,
              border: sortBy === 'popular' ? '1px solid rgba(12,84,96,0.35)' : undefined
            }}
          >
            인기순
          </button>
          <button 
            className="su-pill"
            onClick={() => setSortBy('name')}
            style={{
              background: sortBy === 'name' ? 'rgba(12,84,96,0.12)' : undefined,
              border: sortBy === 'name' ? '1px solid rgba(12,84,96,0.35)' : undefined
            }}
          >
            이름순
          </button>
        </div>
      </div>

      <section className="su-panel">
        <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>
          전체 목록 ({filteredAndSortedItems.length})
        </h3>
        
        {/* ★ 로딩 상태 */}
        {loading ? (
          <div style={{ padding: 24, textAlign: "center", color: "#637074" }}>
            불러오는 중...
          </div>
        ) : error ? (
          /* ★ 에러 상태 */
          <div style={{ padding: 24, textAlign: "center" }}>
            <div style={{ color: "#DC2626", marginBottom: 12 }}>
              불러오지 못했습니다: {error}
            </div>
            <button 
              className="su-pill" 
              onClick={() => window.location.reload()}
            >
              새로고침
            </button>
          </div>
        ) : filteredAndSortedItems.length === 0 ? (
          /* ★ 검색 결과 없음 또는 데이터 없음 */
          <div style={{ padding: 48, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 16, color: "#2C3E45" }}>
              {searchKeyword 
                ? `"${searchKeyword}" 검색 결과가 없습니다` 
                : '등록된 방송이 없습니다'}
            </div>
          </div>
        ) : (
          /* ★ 2열 그리드 렌더링 */
          <>
            <div className="broadcast-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 12
            }}>
              {currentPageItems.map((it) => (
                <div
                  key={it.id}
                  className="broadcast-card"
                  onClick={() => navigate(`/broadcast/${it.id}`, { state: { videoUrl: it.mediaUrl, title: it.title } })}
                  style={{
                    borderRadius: 12,
                    overflow: 'hidden',
                    background: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: '0 2px 10px rgba(12,84,96,0.07)',
                    border: '1px solid #DDE3EA'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F0F4F8';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(12,84,96,0.13)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FFFFFF';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(12,84,96,0.07)';
                  }}
                >
                  {/* 썸네일 영역 - 배경 블러 방식 */}
                  <div className="broadcast-thumbnail-wrapper" style={{ 
                    position: 'relative', 
                    height: 160, 
                    background: '#EEF1F5',
                    borderRadius: '8px 8px 0 0',
                    overflow: 'hidden'
                  }}>
                    {/* 1. 배경 블러 레이어 - YouTube 썸네일 사용 */}
                    {(() => {
                      const ytId = parseYouTubeId(it.mediaUrl || it.videoUrl);
                      const thumbnailUrl = ytId 
                        ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
                        : (it.thumbnailUrl || it.mediaUrl || it.videoUrl);
                      
                      return thumbnailUrl ? (
                        <div 
                          className="thumbnail-bg-blur"
                          style={{
                            position: 'absolute',
                            inset: '-10px',
                            backgroundImage: `url(${thumbnailUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'blur(20px) brightness(0.6)',
                            transform: 'scale(1.1)',
                            zIndex: 1
                          }}
                        />
                      ) : null;
                    })()}
                    
                    {/* 2. 어두운 그라데이션 오버레이 */}
                    <div 
                      className="thumbnail-overlay"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.4) 100%)',
                        zIndex: 2
                      }}
                    />
                    
                    {/* 3. 메인 썸네일 - VideoEmbed 사용 */}
                    {isDirectVideo(it) && (it.mediaUrl || it.videoUrl) ? (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 3
                      }}>
                        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                          <VideoEmbed 
                            url={it.mediaUrl || it.videoUrl} 
                            mode="thumbnail"
                            thumbnail={it.thumbnailUrl}
                          />
                        </div>
                      </div>
                    ) : null}
                    
                    {/* 4. 고정 뱃지 */}
                    {it.isPinned && (
                      <span style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        background: 'rgba(255,200,0,0.95)',
                        color: '#000',
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        zIndex: 4,
                        backdropFilter: 'blur(10px)'
                      }}>
                        📌 고정
                      </span>
                    )}
                    
                    {/* 5. 재생시간 */}
                    {it.duration && (
                      <span style={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        background: 'rgba(0,0,0,0.8)',
                        color: '#fff',
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        zIndex: 4,
                        backdropFilter: 'blur(10px)'
                      }}>
                        {it.duration}
                      </span>
                    )}
                  </div>
                  
                  {/* 정보 영역 */}
                  <div style={{ padding: 12 }}>
                    <div style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#0D1B21',
                      marginBottom: 8,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {it.title}
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: '#637074',
                      display: 'flex',
                      gap: 12,
                      marginTop: 4,
                      flexWrap: 'wrap',
                    }}>
                      {(() => {
                        const publicUploader = resolvePublicAuthorName(
                          it.uploaderName,
                          it.uploader,
                          it.authorName,
                          it.author_name,
                        );
                        return publicUploader ? <span>👤 {publicUploader}</span> : null;
                      })()}
                      <span 
                        title={formatFullDateTime(it.createdAt || it.time)}
                        style={{ cursor: 'help' }}
                      >
                        📅 {getRelativeTime(it.createdAt || it.time)}
                      </span>
                    </div>
                    {(it.viewCount !== undefined || it.likeCount !== undefined) && (
                      <div style={{
                        fontSize: 12,
                        color: '#637074',
                        display: 'flex',
                        gap: 12,
                        marginTop: 4
                      }}>
                        {it.viewCount !== undefined && <span>👁️ {it.viewCount}</span>}
                        {it.likeCount !== undefined && <span>❤️ {it.likeCount}</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* ★ 페이지네이션 */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 16,
                marginTop: 24,
                padding: 16
              }}>
                <button 
                  className="su-pill"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    opacity: currentPage === 1 ? 0.5 : 1,
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  ◀ 이전
                </button>
                
                <span style={{ fontSize: 14, color: '#637074' }}>
                  {currentPage} / {totalPages}
                </span>
                
                <button 
                  className="su-pill"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    opacity: currentPage === totalPages ? 0.5 : 1,
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  다음 ▶
                </button>
              </div>
            )}
          </>
        )}
      </section>
      
      {/* CSS for mobile responsive + thumbnail styling */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        
        /* 브로드캐스트 썸네일 전용 스타일 */
        .broadcast-thumbnail-wrapper .su-mediaWrap {
          position: relative !important;
          width: 100% !important;
          height: 100% !important;
          aspect-ratio: auto !important;
        }
        
        .broadcast-thumbnail-wrapper .su-mediaEl {
          position: relative !important;
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
        }
        
        @media (max-width: 420px) {
          .broadcast-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
