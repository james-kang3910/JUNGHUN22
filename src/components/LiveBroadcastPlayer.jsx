import { useState, useEffect, useRef } from 'react';

/**
 * LiveBroadcastPlayer - pv2 component
 * localStorage 플래그 'su_live_broadcast_on'으로 실시간 방송 상태 제어
 */
export default function LiveBroadcastPlayer() {
  const [isLive, setIsLive] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const checkLiveStatus = () => {
      try {
        const flag = localStorage.getItem('su_live_broadcast_on');
        setIsLive(flag === '1');
      } catch (e) {
        setIsLive(false);
      }
    };

    checkLiveStatus();

    // Listen to storage events for live status changes
    const handleStorage = () => {
      checkLiveStatus();
    };
    
    window.addEventListener('storage', handleStorage);
    window.addEventListener('su:ssot:changed', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('su:ssot:changed', handleStorage);
    };
  }, []);

  useEffect(() => {
    if (isLive && videoRef.current) {
      // Demo: use window.liveStream if available
      if (window.liveStream) {
        videoRef.current.srcObject = window.liveStream;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isLive]);

  if (!isLive) {
    return (
      <div style={{
        padding: '5px 12px',
        borderRadius: 8,
        background: 'rgba(30,41,59,0.05)',
        border: '1px solid rgba(30,41,59,0.10)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 11,
        color: '#94A3B8',
      }}>
        <span style={{ fontSize: 8 }}>⚫</span>
        방송 없음
      </div>
    );
  }

  return (
    <div style={{
      borderRadius: 12,
      overflow: 'hidden',
      background: '#000',
      border: '1px solid rgba(255,59,48,0.4)'
    }}>
      <div style={{
        padding: 8,
        background: 'rgba(255,59,48,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontWeight: 700,
        fontSize: 14
      }}>
        <span style={{ color: '#ff3b30' }}>🔴</span>
        실시간 라이브 방송 중
      </div>
      <video
        ref={videoRef}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block'
        }}
        autoPlay
        playsInline
        muted
      />
    </div>
  );
}
