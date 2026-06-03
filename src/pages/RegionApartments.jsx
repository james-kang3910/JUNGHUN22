/**
 * RegionApartments
 * 
 * 사용자용 지역 아파트 목록 페이지
 * 라우트: /r/:regionId/apt
 * RegionLayout의 Outlet으로 렌더링 → selectedDistrictId를 context에서 수신
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { getApartments } from '../lib/storageAdapter';
import { buildRegionPath } from '../lib/regionRoutes';

export default function RegionApartments() {
  const { regionId } = useParams();
  const navigate = useNavigate();
  const { selectedDistrictId } = useOutletContext() || {};

  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!regionId) return;
    setLoading(true);
    setError(null);
    getApartments({ regionId, districtId: selectedDistrictId || undefined })
      .then(list => setApartments(list || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [regionId, selectedDistrictId]);

  // ── 스타일 ──────────────────────────────────────────────
  const pageStyle = {
    padding: '0 0 80px',
    background: '#E8EDF2',
    minHeight: 'calc(100vh - 110px)',
  };
  const cardStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    margin: '0 0 8px',
    padding: '14px 16px',
    borderRadius: 'var(--r-card, 16px)',
    background: 'var(--c-surface, #FFFFFF)',
    boxShadow: 'var(--sh-xs), inset 0 1px 0 rgba(255,255,255,0.8)',
    cursor: 'pointer',
    transition: 'box-shadow 0.18s, transform 0.15s',
    border: '1px solid var(--c-border, #E2E8F0)',
  };
  const thumbStyle = {
    width: 60,
    height: 60,
    borderRadius: 12,
    objectFit: 'cover',
    background: 'var(--c-subtle)',
    flexShrink: 0,
  };
  const thumbPlaceholderStyle = {
    ...thumbStyle,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
    color: 'var(--c-tx-d)',
  };
  const infoStyle = {
    flex: 1,
    overflow: 'hidden',
  };
  const nameStyle = {
    fontSize: 15,
    fontWeight: 700,
    color: 'var(--c-tx-h, #0F172A)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };
  const metaStyle = {
    marginTop: 5,
    fontSize: 12,
    color: 'var(--c-tx-d, #94A3B8)',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '2px 10px',
  };
  const enterBtnStyle = {
    padding: '7px 14px',
    borderRadius: 'var(--r-badge, 999px)',
    border: '1px solid rgba(14,116,144,0.22)',
    background: 'var(--c-primary-t)',
    color: 'var(--c-primary)',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'box-shadow 0.15s, transform 0.15s',
  };

  if (loading) {
    return (
      <div style={{ background: '#E8EDF2', minHeight: 'calc(100vh - 110px)', paddingBottom: 80 }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px' }}>
          <div style={{ padding: '16px 0 14px' }}>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: 'var(--c-tx-h)', paddingLeft: 11, borderLeft: '3px solid var(--c-primary)', margin: 0 }}>아파트</h1>
          </div>
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--c-tx-d)', fontSize: 14 }}>아파트 목록을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: '#E8EDF2', minHeight: 'calc(100vh - 110px)', paddingBottom: 80 }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px' }}>
          <div style={{ padding: '16px 0 14px' }}>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: 'var(--c-tx-h)', paddingLeft: 11, borderLeft: '3px solid var(--c-primary)', margin: 0 }}>아파트</h1>
          </div>
          <div style={{ padding: '40px 24px', textAlign: 'center', borderRadius: 'var(--r-section, 20px)', background: '#F4F6F9', color: '#ef4444', fontSize: 14 }}>오류: {error}</div>
        </div>
      </div>
    );
  }

  if (apartments.length === 0) {
    return (
      <div style={{ background: '#E8EDF2', minHeight: 'calc(100vh - 110px)', paddingBottom: 80 }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0 14px' }}>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: 'var(--c-tx-h)', paddingLeft: 11, borderLeft: '3px solid var(--c-primary)', margin: 0 }}>아파트</h1>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-primary)', background: 'var(--c-primary-t)', border: '1px solid rgba(14,116,144,0.20)', borderRadius: 999, padding: '3px 10px' }}>0개</span>
          </div>
          <div style={{ padding: '52px 24px', textAlign: 'center', borderRadius: 'var(--r-section, 20px)', background: '#F4F6F9' }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>🏢</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-tx-h)', marginBottom: 8 }}>등록된 아파트가 없어요</div>
            <div style={{ fontSize: 13, color: 'var(--c-tx-s)', lineHeight: 1.6 }}>
              {selectedDistrictId ? '다른 구·군을 선택해 보세요.' : '관리자에게 문의하세요.'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px' }}>

        {/* 인콘텐츠 타이틀 행 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0 14px' }}>
          <h1 style={{ fontSize: 17, fontWeight: 700, color: 'var(--c-tx-h, #0F172A)', paddingLeft: 11, borderLeft: '3px solid var(--c-primary, #0E7490)', margin: 0 }}>
            아파트
          </h1>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-primary)', background: 'var(--c-primary-t)', border: '1px solid rgba(14,116,144,0.20)', borderRadius: 999, padding: '3px 10px' }}>
            {apartments.length}개
          </span>
        </div>

        {/* 안내 문구 */}
        <div style={{ marginBottom: 10, padding: '12px 14px', borderRadius: 14, border: '1px solid rgba(14,116,144,0.18)', background: 'rgba(14,116,144,0.06)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-primary, #0E7490)' }}>안내</div>
          <div style={{ marginTop: 4, fontSize: 12, lineHeight: 1.6, color: 'var(--c-tx-s, #64748B)' }}>
            아파트를 선택한 후 입주민 게시판을 이용하실 수 있습니다.
          </div>
        </div>

        {/* 아파트 카드 섹션 */}
        <div style={{ background: '#F4F6F9', borderRadius: 'var(--r-section, 20px)', padding: '8px 12px 12px', display: 'grid', gap: 8 }}>
          {apartments.map(apt => (
            <div
              key={apt.id}
              style={cardStyle}
              onClick={() => navigate(buildRegionPath(regionId, `/apt/${apt.id}`))}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--sh-hover)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--sh-xs), inset 0 1px 0 rgba(255,255,255,0.8)'; e.currentTarget.style.transform = 'none'; }}
            >
              {/* 썸네일 */}
              {apt.thumbnail ? (
                <img
                  src={apt.thumbnail}
                  alt={apt.name}
                  style={thumbStyle}
                  onError={e => {
                    e.target.style.display = 'none';
                    e.target.nextSibling?.style && (e.target.nextSibling.style.display = 'flex');
                  }}
                />
              ) : (
                <div style={thumbPlaceholderStyle}>🏢</div>
              )}
              {apt.thumbnail && (
                <div style={{ ...thumbPlaceholderStyle, display: 'none' }}>🏢</div>
              )}

              {/* 정보 */}
              <div style={infoStyle}>
                <div style={nameStyle}>{apt.name}</div>
                <div style={metaStyle}>
                  {apt.address && <span>🏠 {apt.address}</span>}
                  {apt.households > 0 && <span>👥 {apt.households.toLocaleString()}세대</span>}
                  {apt.floors > 0 && <span>🏗️ {apt.floors}층</span>}
                  {apt.builtYear && <span>📅 {apt.builtYear}년</span>}
                </div>
              </div>

              {/* 진입 버튼 */}
              <button
                style={enterBtnStyle}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--sh-sm)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
                onClick={e => {
                  e.stopPropagation();
                  navigate(buildRegionPath(regionId, `/apt/${apt.id}`));
                }}
              >
                입주민 게시판 →
              </button>
            </div>
          ))}
        </div>


      </div>
    </div>
  );
}
