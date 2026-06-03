/**
 * RegionEvents — 지역 이벤트 목록
 * /r/:regionId/events
 */
import { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useRegion } from '../context/RegionContext';
import { useBuildRegionPath } from '../hooks/useBuildRegionPath';
import { getRegionEvents, getEvents } from '../lib/storageAdapter';

function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  return `${dt.getFullYear()}.${String(dt.getMonth()+1).padStart(2,'0')}.${String(dt.getDate()).padStart(2,'0')}`;
}

export default function RegionEvents() {
  const { regionId } = useRegion();
  const toRegion = useBuildRegionPath();
  useOutletContext() || {};
  const navigate = useNavigate();

  const [events,  setEvents]  = useState([]);
  const [filter,  setFilter]  = useState('all'); // all / active / ended
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!regionId) return;
    setLoading(true);
    try {
      const [regionData, legacyData] = await Promise.all([
        getRegionEvents(regionId).catch(() => []),
        getEvents({ regionId }).catch(() => []),
      ]);

      const regionEvents = Array.isArray(regionData?.events) ? regionData.events : (Array.isArray(regionData) ? regionData : []);
      const legacyEvents = Array.isArray(legacyData?.events) ? legacyData.events : (Array.isArray(legacyData) ? legacyData : []);

      const normalizeEvent = (ev) => ({
        ...ev,
        id: ev?.id || ev?.event_id,
        event_id: ev?.event_id || ev?.id,
        title: ev?.title || '',
        end_at: ev?.end_at || ev?.endDate || ev?.end_date || null,
        start_at: ev?.start_at || ev?.startDate || ev?.start_date || null,
        banner_url: ev?.banner_url || ev?.bannerUrl || null,
      });

      const normalizedRegion = regionEvents.map(normalizeEvent);
      const normalizedLegacy = legacyEvents.map(normalizeEvent);
      const seen = new Set(normalizedRegion.map((ev) => String(ev.event_id || ev.id || '')).filter(Boolean));
      const merged = [
        ...normalizedRegion,
        ...normalizedLegacy.filter((ev) => {
          const key = String(ev.event_id || ev.id || '');
          if (!key) return true;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        }),
      ];

      setEvents(merged);
    } catch { setEvents([]); } finally { setLoading(false); }
  }, [regionId]);

  useEffect(() => { load(); }, [load]);

  const now = new Date();
  const filtered = events.filter(ev => {
    if (filter === 'active') return !ev.end_at || new Date(ev.end_at) >= now;
    if (filter === 'ended')  return  ev.end_at  && new Date(ev.end_at) <  now;
    return true;
  });

  const FILTERS = [
    { key: 'all',    label: '전체'  },
    { key: 'active', label: '진행중' },
    { key: 'ended',  label: '종료'  },
  ];

  const chipStyle = (active) => ({
    padding: '6px 14px',
    borderRadius: 999,
    border:      active ? 'none' : '1px solid #DDE3EA',
    background:  active ? '#0E7490' : '#fff',
    color:       active ? '#fff'    : '#64748B',
    fontSize: 13,
    fontWeight: active ? 700 : 400,
    cursor: 'pointer',
  });

  return (
    <div style={{ minHeight: '100vh', background: '#F5F8FA', paddingBottom: 80 }}>
      {/* 필터 탭 */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px', borderBottom: '1px solid #E2E8F0', background: '#fff' }}>
        {FILTERS.map(f => (
          <button key={f.key} style={chipStyle(filter === f.key)} onClick={() => setFilter(f.key)}>{f.label}</button>
        ))}
      </div>

      <div style={{ padding: '12px 16px 0' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#94A3B8', padding: '32px 0' }}>불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94A3B8', padding: '32px 0' }}>이벤트가 없습니다.</div>
        ) : (
          filtered.map(ev => {
            const isEnded   = ev.end_at && new Date(ev.end_at) < now;
            const bannerImg = ev.banner_url || ev.images?.[0]?.url || ev.images?.[0];
            return (
              <div key={ev.event_id || ev.id}
                style={{ background: '#fff', borderRadius: 16, marginBottom: 12, overflow: 'hidden', border: '1px solid rgba(14,116,144,0.12)', boxShadow: '0 4px 20px rgba(14,116,144,0.08)', opacity: isEnded ? 0.65 : 1 }}>
                {bannerImg && (
                  <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', overflow: 'hidden' }}>
                    <img src={bannerImg} alt={ev.title}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: isEnded ? 'grayscale(80%)' : 'none' }} />
                    <span style={{
                      position: 'absolute', top: 10, left: 10,
                      background: isEnded ? '#94A3B8' : '#10B981',
                      color: '#fff', fontSize: 11, fontWeight: 700,
                      padding: '3px 8px', borderRadius: 999,
                      boxShadow: isEnded ? 'none' : '0 0 8px #10B981',
                    }}>
                      {isEnded ? '종료' : '진행중'}
                    </span>
                  </div>
                )}
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{ev.title}</div>
                  {(ev.start_at || ev.end_at) && (
                    <div style={{ fontSize: 12, color: '#64748B', marginBottom: 8 }}>
                      기간: {fmtDate(ev.start_at)}{ev.end_at ? ` ~ ${fmtDate(ev.end_at)}` : ''}
                    </div>
                  )}
                  {ev.mission_id && !isEnded && (
                    <button
                      onClick={() => navigate(toRegion('/missions'))}
                      style={{ width: '100%', padding: '10px 0', background: 'linear-gradient(135deg, #0E7490, #0B5F73)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                      참여하기 →
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
