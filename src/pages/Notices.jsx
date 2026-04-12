import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as storageAdapter from '../lib/storageAdapter';
import PageHeader from '../components/PageHeader';

console.log('[PAGE]', 'Notices.jsx (active)');

// ────────── 스타일 상수 (제거됨 → CSS 클래스 .su-panel/.su-card/.su-chip 사용) ──────────

export default function Notices() {
  const navigate = useNavigate();

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
    // 지역 필터: 빈 문자열이면 전체공지(scope='ALL'), 지역 ID가 있으면 해당 지역공지
    if (selectedRegion === '') {
      // 전체공지만 표시
      if (notice.scope !== 'ALL') return false;
    } else {
      // 선택된 지역의 공지만 표시
      if (notice.scope !== 'REGION') return false;
      if (notice.regionId !== selectedRegion && !notice.regionIds?.includes(selectedRegion)) return false;
    }

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

  const handleNoticeClick = (notice) => {
    navigate(`/notices/${notice.id}`, { state: { notice } });
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
              {notices.filter(n => selectedRegion === '' ? n.scope === 'ALL' : (n.scope === 'REGION' && (n.regionId === selectedRegion || n.regionIds?.includes(selectedRegion)))).length}
            </span>
          </button>
          <button onClick={() => setFilter('important')} className={`su-chip${filter === 'important' ? ' is-active' : ''}`}>
            ⭐ 중요
            <span style={{ marginLeft: 6, padding: '2px 6px', borderRadius: 999, background: 'var(--c-border)', fontSize: 11 }}>
              {notices.filter(n => {
                const regionMatch = selectedRegion === '' ? n.scope === 'ALL' : (n.scope === 'REGION' && (n.regionId === selectedRegion || n.regionIds?.includes(selectedRegion)));
                return regionMatch && (n.isPinned || n.important);
              }).length}
            </span>
          </button>
          <button onClick={() => setFilter('normal')} className={`su-chip${filter === 'normal' ? ' is-active' : ''}`}>
            일반
            <span style={{ marginLeft: 6, padding: '2px 6px', borderRadius: 999, background: 'var(--c-border)', fontSize: 11 }}>
              {notices.filter(n => {
                const regionMatch = selectedRegion === '' ? n.scope === 'ALL' : (n.scope === 'REGION' && (n.regionId === selectedRegion || n.regionIds?.includes(selectedRegion)));
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
        {loading ? (
          <div className="su-empty">로딩 중...</div>
        ) : sortedNotices.length === 0 ? (
          <div className="su-empty">
            {searchQuery ? '검색 결과가 없습니다' : '공지사항이 없습니다'}
          </div>
        ) : (
          <section className="su-panel">
            <div style={{ display: 'grid', gap: 10 }}>
              {sortedNotices.map((notice) => (
                <div
                  key={notice.id}
                  onClick={() => handleNoticeClick(notice)}
                  className="su-card"
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

                  {notice.content && notice.content.trim() && (
                    <div style={{
                      fontSize: 13,
                      color: 'var(--c-tx-s)',
                      lineHeight: 1.5,
                      marginBottom: 8,
                      wordBreak: 'break-all',
                      whiteSpace: 'pre-line',
                      width: '100%',
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#0E7490', marginRight: 6 }}>공지내용</span>
                      {notice.content.length > 120 ? notice.content.slice(0, 120) + '...' : notice.content}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--c-tx-d)' }}>
                    <div>{notice.author || '관리자'}</div>
                    <div>
                      {new Date(notice.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
