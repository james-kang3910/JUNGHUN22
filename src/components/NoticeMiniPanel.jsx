import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublicNotices } from '../lib/adminStore';
import { resolvePublicAuthorName } from '../lib/noticeUtils';
import { dismissNoticeForToday, resolveNoticeImageUrl } from '../lib/noticePopupUtils';
import * as storageAdapter from '../lib/storageAdapter';
import useAutoRefresh from '../hooks/useAutoRefresh';

function getViewerRegionId() {
  try {
    const selectedRegionId = localStorage.getItem('selectedRegionId');
    if (selectedRegionId) return String(selectedRegionId).trim();
  } catch (e) {
    // noop
  }
  try {
    return String(window.__SU_SESSION__?.regionId || '').trim();
  } catch (e) {
    // noop
  }
  return '';
}

function formatNoticeDate(dt) {
  if (!dt) return '';
  const d = new Date(dt);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return '오늘';
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return `${diffDays}일 전`;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function inferNoticeRegionName(item, regionNameMap = {}) {
  const explicitName = String(item?.regionName || item?.region_name || '').trim();
  if (explicitName) return explicitName;

  const regionId = String(
    item?.regionId || item?.region_id || (Array.isArray(item?.regionIds) ? item.regionIds[0] : '') || ''
  ).trim();
  if (regionId && regionNameMap[regionId]) return regionNameMap[regionId];

  const text = `${item?.title || ''} ${item?.content || ''} ${item?.body || ''}`.trim();
  const exactAreaMatch = text.match(/([가-힣]+)\s*지역/);
  if (exactAreaMatch?.[1]) return exactAreaMatch[1];

  const presetNames = ['울산', '범서', '해운대'];
  return presetNames.find((name) => text.includes(name)) || '';
}

function normalizeNoticeRegionLabel(rawValue) {
  const raw = String(rawValue || '').trim();
  if (!raw) return '';
  if (/^(R_|REGION_|notice_|\d+$)/i.test(raw)) return '';

  const presetMap = {
    ulsan: '울산',
    beomseo: '범서',
    haeundae: '해운대',
  };

  const mapped = presetMap[raw.toLowerCase()] || raw;
  const cleaned = mapped
    .replace(/특별자치도|특별자치시|특별시|광역시/g, '')
    .replace(/시|군|구/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return '';
  return cleaned.endsWith('지역') ? cleaned : `${cleaned}지역`;
}

function getNoticeAudienceLabel(item, regionNameMap = {}) {
  const scope = String(item?.scope || item?.regionScope || 'ALL').trim().toUpperCase();
  const regionName = inferNoticeRegionName(item, regionNameMap);
  const regionLabel = normalizeNoticeRegionLabel(regionName);
  if (scope === 'REGION') {
    return regionLabel || '지역공지';
  }
  return '전체공지';
}

function selectLatestNotices(all) {
  try {
    if (!Array.isArray(all) || !all.length) return [];
    const viewerRegionId = getViewerRegionId();
    const filtered = all.filter((n) => {
      if (n.isPublic === false) return false;
      const scope = String(n.scope || n.regionScope || 'ALL').toUpperCase();
      if (scope === 'ALL') return true;
      if (scope !== 'REGION') return false;
      if (!viewerRegionId) return false;
      const regionId = String(n.regionId || n.region_id || '').trim();
      const regionIds = Array.isArray(n.regionIds)
        ? n.regionIds.map((v) => String(v || '').trim()).filter(Boolean)
        : (Array.isArray(n.regions) ? n.regions.map((v) => String(v || '').trim()).filter(Boolean) : []);
      return regionId === viewerRegionId || regionIds.includes(viewerRegionId);
    });
    if (!filtered.length) return [];
    return [...filtered]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .map((item) => ({
        ...item,
        body: item.content || item.body || '',
        date: formatNoticeDate(item.createdAt),
        author: item.author || item.writer || '',
      }));
  } catch (e) {
    return [];
  }
}

export default function NoticeMiniPanel({ className = '', style = null }) {
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const [latestNoticeList, setLatestNoticeList] = useState([]);
  const [noticeRegionNameMap, setNoticeRegionNameMap] = useState({});
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);

  const closeNoticePopup = useCallback(() => {
    setNoticeModalOpen(false);
  }, []);

  const hideNoticeForToday = useCallback(() => {
    if (notice) dismissNoticeForToday(notice);
    setNoticeModalOpen(false);
  }, [notice]);

  const loadNotices = useCallback(async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || '';
      const res = await fetch(`${API_BASE}/api/notices?status=ACTIVE`, { credentials: 'include' });
      if (!res.ok) throw new Error('notice fetch failed');
      const all = await res.json();
      const latest = selectLatestNotices(all);
      setLatestNoticeList(latest);
      setNotice((prev) => latest.find((item) => String(item.id) === String(prev?.id)) || latest[0] || null);
    } catch (e) {
      try {
        const fallback = selectLatestNotices(getPublicNotices() || []);
        setLatestNoticeList(fallback);
        setNotice((prev) => fallback.find((item) => String(item.id) === String(prev?.id)) || fallback[0] || null);
      } catch (_) {
        // noop
      }
    }
  }, []);

  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  useAutoRefresh(loadNotices, { intervalMs: 60000 });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const regions = await storageAdapter.getRegions();
        const nextMap = Object.fromEntries(
          (Array.isArray(regions) ? regions : [])
            .map((region) => {
              const id = String(region?.id || region?.regionId || region?.region_id || '').trim();
              const name = String(region?.name || region?.regionName || region?.region_name || '').trim();
              return [id, name];
            })
            .filter(([id, name]) => id && name)
        );
        if (mounted) setNoticeRegionNameMap(nextMap);
      } catch (e) {
        // noop
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const openNotice = (item) => {
    setNotice(item);
    setNoticeModalOpen(true);
  };

  return (
    <section className={`su-panel su-panel--notice ${className}`.trim()} style={style}>
      <div className="su-panelHead">
        <div className="su-panelTitle">📌 공지사항</div>
        <button className="su-panelMore" onClick={() => navigate('/notices')} type="button">
          더보기 →
        </button>
      </div>

      <div
        className="su-noticeMiniList"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          marginTop: 12,
        }}
      >
        {latestNoticeList.length > 0 ? (
          latestNoticeList.slice(0, 3).map((item, idx) => (
            <div
              key={item.id ?? item._id ?? idx}
              className="su-noticeMiniCard"
              onClick={() => openNotice(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openNotice(item);
                }
              }}
              style={{
                background: '#ffffff',
                border: '1px solid rgba(15,23,42,0.08)',
                borderRadius: 14,
                padding: '12px 14px',
                boxShadow: '0 4px 12px rgba(15,23,42,0.05)',
                cursor: 'pointer',
                transition: '0.2s ease',
              }}
            >
              <div
                className="su-noticeMiniTitle"
                style={{
                  color: '#111827',
                  fontSize: 15,
                  fontWeight: 700,
                  lineHeight: 1.35,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {item.title || item.subject || '공지사항'}
              </div>
              <div
                className="su-noticeMiniMeta"
                style={{
                  marginTop: 4,
                  color: '#6b7280',
                  fontSize: 12,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 6,
                  alignItems: 'center',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', minHeight: 22, padding: '0 8px', borderRadius: 999, background: 'rgba(14,116,144,0.10)', color: '#0e7490', fontSize: 11, fontWeight: 800 }}>
                  {getNoticeAudienceLabel(item, noticeRegionNameMap)}
                </span>
                <span>
                  {[
                    resolvePublicAuthorName(item.author, item.writer, item.authorName, item.author_name),
                    item.date || '',
                  ].filter(Boolean).join(' · ')}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div
            className="su-noticeMiniCard is-empty"
            style={{
              background: '#ffffff',
              border: '1px solid rgba(15,23,42,0.08)',
              borderRadius: 14,
              padding: '12px 14px',
              boxShadow: '0 4px 12px rgba(15,23,42,0.05)',
            }}
          >
            <div
              className="su-noticeMiniTitle"
              style={{
                color: '#111827',
                fontSize: 15,
                fontWeight: 700,
                lineHeight: 1.35,
              }}
            >
              등록된 공지사항이 없습니다
            </div>
            <div
              className="su-noticeMiniMeta"
              style={{
                marginTop: 4,
                color: '#6b7280',
                fontSize: 12,
              }}
            >
              새로운 공지가 올라오면 여기에 표시됩니다
            </div>
          </div>
        )}
      </div>

      {noticeModalOpen && (
        <div
          className="su-modal-overlay"
          onClick={() => closeNoticePopup()}
          role="dialog"
          aria-modal="true"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 14px' }}
        >
          <div
            className="su-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 420,
              width: '88%',
              maxHeight: '64vh',
              margin: '0 auto',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              background: 'linear-gradient(180deg, #ffffff, #f8fafc)',
              border: '1px solid rgba(15,23,42,0.08)',
              borderRadius: 20,
              boxShadow: '0 12px 28px rgba(15,23,42,0.12)',
            }}
          >
            <div style={{ padding: '16px 16px 10px', borderBottom: '1px solid rgba(15,23,42,0.08)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999, padding: '4px 10px', background: 'rgba(14,116,144,0.12)', color: '#0e7490', fontSize: 11, fontWeight: 800 }}>
                📌 {getNoticeAudienceLabel(notice, noticeRegionNameMap)}
              </div>
              <div style={{ marginTop: 10, fontWeight: 800, fontSize: 18, color: '#0f172a', lineHeight: 1.4 }}>
                {notice && notice.title ? notice.title : '공지'}
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
                {[
                  resolvePublicAuthorName(
                    notice?.author,
                    notice?.writer,
                    notice?.authorName,
                    notice?.author_name,
                  ),
                  notice?.date || '',
                ].filter(Boolean).join(' · ')}
              </div>
            </div>

            <div style={{ padding: '10px 14px 12px', flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
              {resolveNoticeImageUrl(notice) ? (
                <div style={{ marginBottom: 12, borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(15,23,42,0.08)', background: '#e2e8f0' }}>
                  <img
                    src={resolveNoticeImageUrl(notice)}
                    alt={notice?.title || '공지 이미지'}
                    style={{ display: 'block', width: '100%', maxHeight: 220, objectFit: 'cover' }}
                  />
                </div>
              ) : null}
              <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere', fontSize: 14, lineHeight: 1.8, color: '#334155' }}>
                {notice && (notice.content || notice.body) ? (notice.content || notice.body) : '-'}
              </div>
              <div style={{ marginTop: 14, fontSize: 12, color: '#0e7490', fontWeight: 700 }}>
                내용이 길면 아래로 스크롤해서 계속 볼 수 있습니다.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '8px 14px 10px', borderTop: '1px solid rgba(15,23,42,0.08)', background: 'rgba(248,250,252,0.95)' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  hideNoticeForToday();
                }}
                style={{
                  borderRadius: 12,
                  border: '1px solid rgba(148,163,184,0.40)',
                  background: '#ffffff',
                  color: '#64748b',
                  minHeight: 44,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                오늘 하루 그만보기
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  closeNoticePopup();
                }}
                style={{
                  borderRadius: 12,
                  border: '1px solid rgba(14,116,144,0.35)',
                  background: '#0e7490',
                  color: '#ffffff',
                  minHeight: 44,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
