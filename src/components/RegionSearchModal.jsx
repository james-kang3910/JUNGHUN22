import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchRegionContent } from '../lib/storageAdapter';

const TYPE_LABELS = {
  shop: { icon: '🏪', label: '상점' },
  mission: { icon: '🎯', label: '미션' },
  board: { icon: '💬', label: '커뮤니티' },
  notice: { icon: '📢', label: '공지' },
  event: { icon: '🎉', label: '이벤트' },
  festival: { icon: '🎪', label: '지역행사' },
  flyer: { icon: '📄', label: '전단' },
  news: { icon: '📰', label: '뉴스' },
  audition: { icon: '🎬', label: '오디션' },
  broadcast: { icon: '📺', label: '방송' },
  intro: { icon: '📝', label: '지역소개' },
  apartment: { icon: '🏢', label: '아파트' },
};

export default function RegionSearchModal({ regionId, regionName, open, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const timer = setTimeout(() => inputRef.current?.focus(), 80);
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setSearched(false);
      setLoading(false);
    }
  }, [open]);

  const doSearch = useCallback(async (value) => {
    const q = String(value || '').trim();
    if (!regionId || !q) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchRegionContent(regionId, q);
      setResults(Array.isArray(data?.results) ? data.results : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [regionId]);

  const handleChange = (event) => {
    const value = event.target.value;
    setQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 350);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    clearTimeout(debounceRef.current);
    doSearch(query);
  };

  const handleSelect = (item) => {
    if (!item?.url) return;
    onClose?.();
    navigate(item.url);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="지역 검색"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1600,
        background: 'rgba(15, 23, 42, 0.48)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '12px 12px 24px',
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: 'min(100%, 640px)',
          marginTop: 8,
          background: '#fff',
          borderRadius: 18,
          boxShadow: '0 24px 60px rgba(15,23,42,0.22)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 24px)',
        }}
      >
        <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#0f172a' }}>
              🔍 {regionName || '지역'} 검색
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              style={{
                width: 34,
                height: 34,
                borderRadius: 999,
                border: '1px solid #E2E8F0',
                background: '#fff',
                color: '#64748b',
                fontSize: 18,
                cursor: 'pointer',
              }}
            >
              ×
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 15 }}>🔍</span>
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={handleChange}
                placeholder="상점, 공지, 방송, 행사, 게시글 등 검색"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px 40px 12px 38px',
                  borderRadius: 12,
                  border: '1.5px solid #CBD5E1',
                  background: '#F8FAFC',
                  fontSize: 15,
                  outline: 'none',
                }}
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setResults([]);
                    setSearched(false);
                    inputRef.current?.focus();
                  }}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'transparent',
                    color: '#94a3b8',
                    fontSize: 16,
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              ) : null}
            </div>
          </form>
          <div style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>
            현재 지역의 공지, 방송, 상점, 미션, 행사, 커뮤니티 등을 검색합니다.
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px 16px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 36, color: '#64748b', fontSize: 14 }}>검색 중...</div>
          ) : null}

          {!loading && searched && results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
              <div style={{ fontSize: 34, marginBottom: 10 }}>🔎</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#334155' }}>검색 결과가 없습니다</div>
            </div>
          ) : null}

          {!loading && !searched ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 14 }}>
              검색어를 입력하세요
            </div>
          ) : null}

          {!loading && results.map((item) => {
            const meta = TYPE_LABELS[item.type] || { icon: '📄', label: item.subtitle || '정보' };
            return (
              <button
                key={`${item.type}-${item.id}`}
                type="button"
                onClick={() => handleSelect(item)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: '#fff',
                  border: '1px solid #E2E8F0',
                  marginBottom: 8,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ fontSize: 20, lineHeight: 1 }}>{meta.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#0E7490', marginBottom: 4 }}>{meta.label}</div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </div>
                    {item.detail ? (
                      <div style={{ marginTop: 3, fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.detail}
                      </div>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
