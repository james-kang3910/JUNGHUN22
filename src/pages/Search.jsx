import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";

const TYPE_LABELS = {
  shop: { icon: '🏪', label: '상점' },
  mission: { icon: '🎯', label: '미션' },
  board: { icon: '📝', label: '게시판' },
  notice: { icon: '📢', label: '공지' },
  event: { icon: '🎉', label: '이벤트' },
  audition: { icon: '🎬', label: '오디션' },
  broadcast: { icon: '📺', label: '방송' },
  region: { icon: '🗺️', label: '지역' },
};

const ALL_TYPES = ['shops', 'missions', 'boards', 'notices', 'events', 'auditions', 'broadcasts', 'regions'];

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  const doSearch = useCallback(async (q) => {
    if (!q || q.trim().length < 1) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || '';
      const res = await fetch(
        `${API_BASE}/api/search?q=${encodeURIComponent(q.trim())}&types=${ALL_TYPES.join(',')}`,
        { credentials: 'include' }
      );
      if (!res.ok) throw new Error(`서버 오류 (${res.status})`);
      const data = await res.json();
      setResults(Array.isArray(data.results) ? data.results : []);
    } catch (err) {
      console.error('[Search]', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 400);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    clearTimeout(debounceRef.current);
    doSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
    inputRef.current?.focus();
  };

  const filteredResults = activeFilter === 'all'
    ? results
    : results.filter(r => r.type === activeFilter);

  const filterCounts = {
    all: results.length,
    shop: results.filter(r => r.type === 'shop').length,
    mission: results.filter(r => r.type === 'mission').length,
    board: results.filter(r => r.type === 'board').length,
    notice: results.filter(r => r.type === 'notice').length,
    event: results.filter(r => r.type === 'event').length,
    audition: results.filter(r => r.type === 'audition').length,
    broadcast: results.filter(r => r.type === 'broadcast').length,
    region: results.filter(r => r.type === 'region').length,
  };

  const filterBtnStyle = (key) => ({
    padding: '6px 14px',
    borderRadius: 999,
    border: 'none',
    background: activeFilter === key ? 'var(--c-primary, #0E7490)' : 'var(--c-border, #E2E8F0)',
    color: activeFilter === key ? '#fff' : 'var(--c-tx-b, #334155)',
    fontWeight: 700,
    fontSize: 12,
    cursor: 'pointer',
    transition: 'background 0.15s',
  });

  return (
    <div className="su-page">
      <PageHeader title="검색" onBack={() => navigate('/home')} />

      {/* 검색 입력 */}
      <div style={{ padding: '12px 16px', background: 'var(--c-surface, #fff)', borderBottom: '1px solid var(--c-border, #E2E8F0)' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: 12, fontSize: 16, pointerEvents: 'none' }}>🔍</span>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={handleChange}
              placeholder="상점, 미션, 게시글, 공지, 이벤트, 오디션, 방송, 지역 검색..."
              autoFocus
              style={{
                width: '100%',
                padding: '12px 40px 12px 38px',
                borderRadius: 12,
                border: '1.5px solid var(--c-border, #E2E8F0)',
                background: 'var(--c-bg, #F8FAFC)',
                fontSize: 15,
                color: 'var(--c-tx-b)',
                outline: 'none',
              }}
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                style={{ position: 'absolute', right: 10, background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--c-tx-d)', padding: 4 }}
              >
                ✕
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 필터 탭 */}
      {searched && results.length > 0 && (
        <div style={{ display: 'flex', gap: 6, padding: '10px 16px', overflowX: 'auto', background: 'var(--c-surface)' }}>
          <button style={filterBtnStyle('all')} onClick={() => setActiveFilter('all')}>
            전체 {filterCounts.all}
          </button>
          {filterCounts.shop > 0 && (
            <button style={filterBtnStyle('shop')} onClick={() => setActiveFilter('shop')}>
              🏪 상점 {filterCounts.shop}
            </button>
          )}
          {filterCounts.mission > 0 && (
            <button style={filterBtnStyle('mission')} onClick={() => setActiveFilter('mission')}>
              🎯 미션 {filterCounts.mission}
            </button>
          )}
          {filterCounts.board > 0 && (
            <button style={filterBtnStyle('board')} onClick={() => setActiveFilter('board')}>
              📝 게시판 {filterCounts.board}
            </button>
          )}
          {filterCounts.notice > 0 && (
            <button style={filterBtnStyle('notice')} onClick={() => setActiveFilter('notice')}>
              📢 공지 {filterCounts.notice}
            </button>
          )}
          {filterCounts.event > 0 && (
            <button style={filterBtnStyle('event')} onClick={() => setActiveFilter('event')}>
              🎉 이벤트 {filterCounts.event}
            </button>
          )}
          {filterCounts.audition > 0 && (
            <button style={filterBtnStyle('audition')} onClick={() => setActiveFilter('audition')}>
              🎬 오디션 {filterCounts.audition}
            </button>
          )}
          {filterCounts.broadcast > 0 && (
            <button style={filterBtnStyle('broadcast')} onClick={() => setActiveFilter('broadcast')}>
              📺 방송 {filterCounts.broadcast}
            </button>
          )}
          {filterCounts.region > 0 && (
            <button style={filterBtnStyle('region')} onClick={() => setActiveFilter('region')}>
              🗺️ 지역 {filterCounts.region}
            </button>
          )}
        </div>
      )}

      {/* 결과 영역 */}
      <div style={{ padding: '12px 16px', maxWidth: 640, margin: '0 auto' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--c-tx-d)', fontSize: 14 }}>
            검색 중...
          </div>
        )}

        {!loading && searched && filteredResults.length === 0 && (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔎</div>
            <div style={{ fontSize: 15, color: 'var(--c-tx-h)', fontWeight: 700, marginBottom: 6 }}>
              검색 결과가 없습니다
            </div>
            <div style={{ fontSize: 13, color: 'var(--c-tx-d)' }}>
              다른 검색어로 시도해보세요.
            </div>
          </div>
        )}

        {!loading && !searched && (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 14, color: 'var(--c-tx-d)' }}>
              검색어를 입력하세요
            </div>
          </div>
        )}

        {!loading && filteredResults.length > 0 && filteredResults.map((item) => {
          const meta = TYPE_LABELS[item.type] || { icon: '📄', label: item.type };
          return (
            <div
              key={`${item.type}-${item.id}`}
              onClick={() => item.url && navigate(item.url)}
              style={{
                padding: '14px 16px',
                borderRadius: 12,
                background: 'var(--c-surface, #fff)',
                border: '1px solid var(--c-border, #E2E8F0)',
                marginBottom: 8,
                cursor: 'pointer',
                transition: 'box-shadow 0.15s, transform 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{
                  fontSize: 20, minWidth: 28, height: 28,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--c-bg, #F8FAFC)', borderRadius: 8,
                }}>
                  {meta.icon}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 999,
                      background: 'var(--c-primary-t, #ECFEFF)', color: 'var(--c-primary, #0E7490)',
                    }}>
                      {meta.label}
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--c-tx-h)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </div>
                  {item.detail && (
                    <div style={{ fontSize: 12, color: 'var(--c-tx-d)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.detail}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

