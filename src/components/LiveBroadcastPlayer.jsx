import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

/**
 * LiveBroadcastPlayer - WebRTC 수신 컴포넌트
 * Socket.io 시그널링 → RTCPeerConnection → 실시간 영상 재생
 */

const ICE_SERVERS = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

function getSocketUrl() {
  return window.location.origin;
}

export default function LiveBroadcastPlayer() {
  const [isLive, setIsLive] = useState(false);
  const [connected, setConnected] = useState(false);
  const videoRef = useRef(null);
  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const remoteStreamRef = useRef(null);

  const attachRemoteStream = useCallback(() => {
    const video = videoRef.current;
    const stream = remoteStreamRef.current;
    if (!video || !stream) return;
    if (video.srcObject !== stream) {
      video.srcObject = stream;
    }
    video.play().then(() => {
      setConnected(true);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (isLive) {
      attachRemoteStream();
    }
  }, [isLive, attachRemoteStream]);

  useEffect(() => {
    const socket = io(getSocketUrl(), { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    const resetPlayback = () => {
      pcRef.current?.close();
      pcRef.current = null;
      remoteStreamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      setIsLive(false);
      setConnected(false);
    };

    socket.on('broadcaster-ready', () => {
      setIsLive(true);
      socket.emit('watcher');
    });

    socket.on('offer', async (broadcasterId, description) => {
      setIsLive(true);

      pcRef.current?.close();
      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;

      pc.ontrack = (event) => {
        const stream = event.streams?.[0] || (event.track ? new MediaStream([event.track]) : null);
        if (!stream) return;
        remoteStreamRef.current = stream;
        attachRemoteStream();
      };

      pc.onicecandidate = ({ candidate }) => {
        if (candidate) socket.emit('candidate', broadcasterId, candidate);
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          setConnected(false);
        }
        if (pc.connectionState === 'connected') {
          attachRemoteStream();
        }
      };

      try {
        await pc.setRemoteDescription(description);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', broadcasterId, pc.localDescription);
      } catch (err) {
        console.error('[LiveBroadcastPlayer] WebRTC answer failed:', err);
        resetPlayback();
      }
    });

    socket.on('candidate', (_senderId, candidate) => {
      pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
    });

    socket.on('broadcast-ended', resetPlayback);

    socket.on('connect', () => {
      socket.emit('watcher');
    });

    return () => {
      resetPlayback();
      socket.disconnect();
    };
  }, [attachRemoteStream]);

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
        {/* video 엘리먼트를 조기 마운트하지 않음 — isLive 전환 후 useEffect에서 스트림 연결 */}
      </div>
    );
  }

  return (
    <div style={{
      borderRadius: 12,
      overflow: 'hidden',
      background: '#000',
      border: '1px solid rgba(255,59,48,0.4)',
    }}>
      <div style={{
        padding: 8,
        background: 'rgba(255,59,48,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontWeight: 700,
        fontSize: 14,
      }}>
        <span style={{ color: '#ff3b30' }}>🔴</span>
        실시간 라이브 방송 중
        {!connected ? <span style={{ fontSize: 11, color: '#fbbf24', marginLeft: 4 }}>연결 중...</span> : null}
      </div>
      <video
        ref={videoRef}
        style={{ width: '100%', height: 'auto', display: 'block', background: '#000' }}
        autoPlay
        playsInline
        controls
      />
    </div>
  );
}
