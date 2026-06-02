import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

/**
 * LiveBroadcastPlayer - WebRTC 수신 컴포넌트
 * Socket.io 시그널링 → RTCPeerConnection → 실시간 영상 재생
 */

const ICE_SERVERS = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

export default function LiveBroadcastPlayer() {
  const [isLive, setIsLive] = useState(false);
  const [connected, setConnected] = useState(false);
  const videoRef = useRef(null);
  const socketRef = useRef(null);
  const pcRef = useRef(null);

  const socketUrl = import.meta.env.DEV ? 'http://localhost:8787' : window.location.origin;

  useEffect(() => {
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    // 방송자가 준비됐을 때 → watcher 등록
    socket.on('broadcaster-ready', () => {
      setIsLive(true);
      socket.emit('watcher');
    });

    // broadcaster가 offer 보내옴
    socket.on('offer', async (broadcasterId, description) => {
      setIsLive(true);
      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;

      pc.ontrack = ({ streams }) => {
        if (videoRef.current && streams[0]) {
          videoRef.current.srcObject = streams[0];
          videoRef.current.play().catch(() => {});
          setConnected(true);
        }
      };

      pc.onicecandidate = ({ candidate }) => {
        if (candidate) socket.emit('candidate', broadcasterId, candidate);
      };

      await pc.setRemoteDescription(description);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answer', broadcasterId, pc.localDescription);
    });

    // ICE candidate 수신
    socket.on('candidate', (_senderId, candidate) => {
      pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
    });

    // 방송 종료
    socket.on('broadcast-ended', () => {
      pcRef.current?.close();
      pcRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      setIsLive(false);
      setConnected(false);
    });

    // 연결 후 이미 방송 중인지 확인을 위해 watcher 등록 시도
    socket.on('connect', () => {
      socket.emit('watcher');
    });

    return () => {
      pcRef.current?.close();
      socket.disconnect();
    };
  }, []); // eslint-disable-line

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
        {!connected && <span style={{ fontSize: 11, color: '#fbbf24', marginLeft: 4 }}>연결 중...</span>}
      </div>
      <video
        ref={videoRef}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        autoPlay
        playsInline
        controls
      />
    </div>
  );
}
