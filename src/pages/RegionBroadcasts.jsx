/**
 * RegionBroadcasts — 지역 방송 목록
 * /r/:regionId/broadcasts
 * 해당 지역 방송만 표시 (내지역/전체 탭 없음).
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useRegion } from '../context/RegionContext';
import VideoEmbed from '../components/VideoEmbed';
import { getRelativeTime } from '../lib/dateUtils';
import useAutoRefresh from '../hooks/useAutoRefresh';

function getBroadcastThumbnail(item) {
  if (item.thumbnailUrl) return item.thumbnailUrl;
  const url = item.videoUrl || item.mediaUrl || '';
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
  return null;
}

export default function RegionBroadcasts() {
  const { regionId } = useRegion();
  const navigate = useNavigate();
  const outletCtx = useOutletContext() || {};
  const selectedDistrictId = outletCtx.selectedDistrictId || '';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveItem, setLiveItem] = useState(null);

  useEffect(() => {
    if (!regionId) return;
    load();
  }, [regionId, selectedDistrictId]);

  async function load(background = false) {
    if (!background) { setLoading(true); setError(null); }
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || '';
      const dParam = selectedDistrictId ? `&districtId=${selectedDistrictId}` : '';
      const res = await fetch(
        `${API_BASE}/api/broadcasts?region=${regionId}${dParam}`,
        { credentials: 'include' }
      );
      const data = res.ok ? await res.json() : [];
      const list = Array.isArray(data) ? data : (data.broadcasts || []);
      setItems(list);
      // 라이브 방송 분리
      const live = list.find(b => b.isLive || b.is_live);
      setLiveItem(live || null);
    } catch (e) {
      console.error('[RegionBroadcasts] load error:', e);
      if (!background) setError('방송 목록을 불러오지 못했습니다.');
    } finally {
      if (!background) setLoading(false);
    }
  }

  // SSOT 이벤트 수신
  useAutoRefresh(() => load(true), { enabled: !!regionId, intervalMs: 15000 });

  const vodItems = items.filter(b => !(b.isLive || b.is_live));

  if (loading) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--c-tx-s)' }}>
        불러오는 중...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: '#ef4444' }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '16px 16px 32px' }}>
      {/* 라이브 방송 */}
      {liveItem && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{
              background: '#ef4444',
              color: '#fff',
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 999,
              letterSpacing: 1,
            }}>● LIVE</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-tx-h)' }}>
              {liveItem.title}
            </span>
          </div>
          <div style={{ borderRadius: 16, overflow: 'hidden' }}>
            <VideoEmbed
              url={liveItem.videoUrl || liveItem.mediaUrl || ''}
              title={liveItem.title}
              autoplay
            />
          </div>
        </div>
      )}

      {/* VOD 목록 */}
      {vodItems.length === 0 && !liveItem ? (
        <div style={{
          padding: '48px 20px',
          textAlign: 'center',
          color: 'var(--c-tx-s)',
          fontSize: 14,
        }}>
          등록된 방송이 없습니다.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {vodItems.map(item => {
            const thumb = getBroadcastThumbnail(item);
            const videoUrl = item.videoUrl || item.mediaUrl || '';
            return (
              <div
                key={item.id || item.broadcastId || item.broadcast_id}
                className="su-card"
                style={{ cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start' }}
                onClick={() => navigate(`/broadcast/${item.id || item.broadcastId || item.broadcast_id}`,
                  { state: { videoUrl, title: item.title } })}
              >
                {/* 썸네일 */}
                <div style={{
                  width: 96,
                  height: 64,
                  borderRadius: 10,
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: 'var(--c-subtle, #F0F9FF)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {thumb
                    ? <img src={thumb} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 24 }}>📺</span>
                  }
                </div>
                {/* 정보 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'var(--c-tx-h)',
                    marginBottom: 4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {item.title || '방송'}
                  </div>
                  {item.description && (
                    <div style={{
                      fontSize: 12,
                      color: 'var(--c-tx-s)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: 4,
                    }}>
                      {item.description}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--c-tx-s)' }}>
                    {item.createdAt ? getRelativeTime(item.createdAt) : ''}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
