import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as storageAdapter from '../lib/storageAdapter';
import { resolvePublicAuthorName } from '../lib/noticeUtils';
import PageHeader from '../components/PageHeader';

console.log('[PAGE]', 'Notices.jsx (active)');

// ────────── 스타일 상수 (제거됨 → CSS 클래스 .su-panel/.su-card/.su-chip 사용) ──────────

function normalizeScope(notice) {
  return String(notice?.scope || notice?.regionScope || 'ALL').trim().toUpperCase();
}

function matchesRegionNotice(notice, selectedRegion) {
  const scope = normalizeScope(notice);
  if (selectedRegion === '') {
    return scope === 'ALL';
  }

  if (scope !== 'REGION') return false;
  const regionId = String(notice?.regionId || notice?.region_id || '').trim();
  const regionIds = Array.isArray(notice?.regionIds)
    ? notice.regionIds.map((v) => String(v || '').trim()).filter(Boolean)
    : [];
  return regionId === selectedRegion || regionIds.includes(selectedRegion);
}

function resolveNoticeImageUrl(imageUrl) {
  const raw = String(imageUrl || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw) || raw.startsWith('data:')) return raw;
  const base = import.meta.env.VITE_API_BASE || '';
  return `${base}${raw}`;
}

export default function Notices() {
  const navigate = useNavigate();
  const isMobileView = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;

  const [notices, setNotices] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'important' | 'normal'
  const [selectedRegion, setSelectedRegion] = useState(''); // '' = 전체공지, regionId = 지역공지
  const [searchQuery, setSearchQuery] = useState('');

  // 공지사항 로드
  useEffect(() => {
    let mounted = true;
    async function loadNotices() {
      try {
        const result = await storageAdapter.getNotices();
        if (mounted) {
          setNotices(Array.isArray(result) ? result : []);
        }
      } catch (e) {
        console.error('[Notices] Failed to load notices:', e);
        if (mounted) setNotices([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadNotices();
    return () => { mounted = false; };
  }, []);

  // 지역 목록 로드
  useEffect(() => {
    let mounted = true;
    async function loadRegions() {
      try {
        const result = await storageAdapter.getRegions();
        if (mounted) {
          setRegions(Array.isArray(result) ? result : []);
        }
      } catch (e) {
        console.error('[Notices] Failed to load regions:', e);
        if (mounted) setRegions([]);
      }
    }
    loadRegions();
    return () => { mounted = false; };
  }, []);

  // 필터링된 공지사항
  const filteredNotices = notices.filter(notice => {
    if (!matchesRegionNotice(notice, selectedRegion)) return false;

    // 검색어 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const titleMatch = notice.title?.toLowerCase().includes(query);
      const contentMatch = notice.content?.toLowerCase().includes(query);
      if (!titleMatch && !contentMatch) return false;
    }

    // 중요도 필터
    if (filter === 'important') {
      return notice.isPinned || notice.important;
    } else if (filter === 'normal') {
      return !notice.isPinned && !notice.important;
    }

    return true;
  });

  // 중요 공지를 상단에, 나머지는 날짜 역순
  const sortedNotices = [...filteredNotices].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  const handleNoticeClick = () => {
    // 상세 공지 화면 단계 제거: 목록 화면에서 바로 확인
  };

  return (
    <div className="su-page su-page--notices">
      <PageHeader
        title="📢 공지사항"
        onBack={() => navigate('/home')}
        action={
          <span className="su-badge su-badge--neutral" style={{ flexShrink: 0 }}>{sortedNotices.length}개</span>
        }
      />

      <div style={{ paddingBottom: 80 }}>
        {/* 검색 */}
        <section className="su-panel" style={{ marginTop: 12 }}>
          <input
            type="text"
            placeholder="🔍 공지사항 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="su-input"
          />
        </section>

        {/* 필터 탭 */}
        <section className="su-panel" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => setFilter('all')} className={`su-chip${filter === 'all' ? ' is-active' : ''}`}>
            전체
            <span style={{ marginLeft: 6, padding: '2px 6px', borderRadius: 999, background: 'var(--c-border)', fontSize: 11 }}>
              {notices.filter(n => matchesRegionNotice(n, selectedRegion)).length}
            </span>
          </button>
          <button onClick={() => setFilter('important')} className={`su-chip${filter === 'important' ? ' is-active' : ''}`}>
            ⭐ 중요
            <span style={{ marginLeft: 6, padding: '2px 6px', borderRadius: 999, background: 'var(--c-border)', fontSize: 11 }}>
              {notices.filter(n => {
                const regionMatch = matchesRegionNotice(n, selectedRegion);
                return regionMatch && (n.isPinned || n.important);
              }).length}
            </span>
          </button>
          <button onClick={() => setFilter('normal')} className={`su-chip${filter === 'normal' ? ' is-active' : ''}`}>
            일반
            <span style={{ marginLeft: 6, padding: '2px 6px', borderRadius: 999, background: 'var(--c-border)', fontSize: 11 }}>
              {notices.filter(n => {
                const regionMatch = matchesRegionNotice(n, selectedRegion);
                return regionMatch && (!n.isPinned && !n.important);
              }).length}
            </span>
          </button>

          {/* 지역 선택 드롭다운 */}
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="su-select"
            style={{ marginLeft: 'auto' }}
          >
            <option value="">📢 전체공지</option>
            {regions.map(region => (
              <option key={region.id} value={region.id}>
                📌 {region.name}
              </option>
            ))}
          </select>
        </section>

        {/* 공지사항 목록 */}
        {isMobileView && !loading && sortedNotices.some((notice) => String(notice.content || '').trim().length > 90) && (
          <section className="su-panel" style={{ padding: '10px 14px', marginBottom: 10, background: 'linear-gradient(180deg, #f0f9ff, #ecfeff)', border: '1px solid rgba(14,116,144,0.16)' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#0e7490', textAlign: 'center', lineHeight: 1.5 }}>
              <div>⬍ 긴 공지는 카드 안에서</div>
              <div>위아래로 스크롤해 전체 내용을 볼 수 있습니다.</div>
            </div>
          </section>
        )}
        {loading ? (
          <div className="su-empty">로딩 중...</div>
        ) : sortedNotices.length === 0 ? (
          <div className="su-empty">
            {searchQuery ? '검색 결과가 없습니다' : '공지사항이 없습니다'}
          </div>
        ) : (
          <section className="su-panel">
            <div style={{ display: 'grid', gap: 10 }}>
              {sortedNotices.map((notice) => {
                const contentText = String(notice.content || '').trim();
                const hasLongContent = contentText.length > 90;
                const noticeImageUrl = resolveNoticeImageUrl(notice.imageUrl || notice.image_url);
                const publicAuthor = resolvePublicAuthorName(notice.author, notice.authorName, notice.author_name);
                return (
                <div
                  key={notice.id}
                  className="su-card"
                  style={{
                    background: '#f8fbff',
                    padding: hasLongContent ? '16px 16px 18px' : undefined,
                    minHeight: hasLongContent ? 168 : undefined,
                    cursor: 'default',
                  }}
                >
                  <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    {notice.isPinned && (
                      <span className="su-badge su-badge--danger">📌 고정</span>
                    )}
                    {notice.important && !notice.isPinned && (
                      <span className="su-badge su-badge--warn">⭐ 중요</span>
                    )}
                    {notice.category && (
                      <span className="su-badge su-badge--primary">{notice.category}</span>
                    )}
                  </div>

                  {noticeImageUrl ? (
                    <div style={{ marginBottom: 10, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(14,116,144,0.14)', background: '#e2e8f0' }}>
                      <img src={noticeImageUrl} alt={notice.title || '공지 이미지'} style={{ display: 'block', width: '100%', maxHeight: isMobileView ? 180 : 240, objectFit: 'cover' }} />
                    </div>
                  ) : null}

                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 15,
                      marginBottom: notice.content ? 2 : 8,
                      lineHeight: 1.4,
                      color: 'var(--c-tx-h)',
                      wordBreak: 'keep-all',
                      overflowWrap: 'break-word',
                      minWidth: 0,
                      whiteSpace: 'normal',
                      WebkitLineClamp: 'unset',
                      display: 'block',
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0ea5e9', marginRight: 6 }}>공지제목</span>
                    {notice.title}
                  </div>

                  {contentText && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: 'relative',
                        marginBottom: 8,
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#0E7490', marginRight: 6, marginBottom: 4 }}>공지내용</div>
                      <div
                        style={{
                          fontSize: 13,
                          color: 'var(--c-tx-s)',
                          lineHeight: 1.6,
                          wordBreak: 'break-all',
                          whiteSpace: 'pre-line',
                          width: '100%',
                          maxHeight: hasLongContent ? (isMobileView ? 170 : 220) : 'none',
                          minHeight: hasLongContent ? (isMobileView ? 118 : 132) : 'auto',
                          overflowY: hasLongContent ? (isMobileView ? 'auto' : 'scroll') : 'visible',
                          padding: hasLongContent ? (isMobileView ? '6px 28px 10px 0' : '8px 12px') : '0',
                          WebkitOverflowScrolling: 'touch',
                          borderRadius: hasLongContent ? 12 : 0,
                          border: hasLongContent ? '1px solid rgba(14,116,144,0.16)' : 'none',
                          background: hasLongContent ? 'rgba(255,255,255,0.68)' : 'transparent',
                          scrollbarWidth: 'thin',
                          scrollbarColor: '#0ea5e9 rgba(14,116,144,0.16)',
                        }}
                      >
                        {contentText}
                      </div>
                      {hasLongContent && isMobileView && (
                        <div
                          aria-hidden="true"
                          style={{
                            pointerEvents: 'none',
                            position: 'absolute',
                            top: 26,
                            right: 4,
                            bottom: 8,
                            width: 18,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span style={{ color: '#0ea5e9', fontSize: 11, fontWeight: 900 }}>▲</span>
                          <span style={{ width: 6, minHeight: 44, borderRadius: 999, background: 'linear-gradient(180deg, rgba(14,165,233,0.28), rgba(14,116,144,0.75), rgba(14,165,233,0.28))' }} />
                          <span style={{ color: '#0ea5e9', fontSize: 11, fontWeight: 900 }}>▼</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--c-tx-d)' }}>
                    {publicAuthor ? <div>{publicAuthor}</div> : <div />}
                    <div>
                      {new Date(notice.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
