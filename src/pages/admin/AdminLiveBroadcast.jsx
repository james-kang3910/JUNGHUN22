import React, { useState, useRef, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import * as storageAdapter from "../../lib/storageAdapter";

const ICE_SERVERS = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

export default function AdminLiveBroadcast() {
  console.log('[FORENSIC] 🔍 THIS FILE IS USED: src/pages/admin/AdminLiveBroadcast.jsx');
  const [isLive, setIsLive] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [watcherCount, setWatcherCount] = useState(0);
  const [error, setError] = useState("");
  const videoRef = useRef(null);
  const socketRef = useRef(null);
  const streamRef = useRef(null);
  const peersRef = useRef({}); // { watcherId: RTCPeerConnection }

  const socketUrl = import.meta.env.DEV ? 'http://localhost:8787' : window.location.origin;

  const createPeerForWatcher = useCallback((watcherId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peersRef.current[watcherId] = pc;

    // 내 스트림 트랙을 상대방에게 추가
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => pc.addTrack(track, streamRef.current));
    }

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) socketRef.current?.emit('candidate', watcherId, candidate);
    };

    pc.createOffer()
      .then(offer => pc.setLocalDescription(offer))
      .then(() => socketRef.current?.emit('offer', watcherId, pc.localDescription));

    setWatcherCount(c => c + 1);
    return pc;
  }, []);

  // 방송 시작
  const startLive = async () => {
    setError("");
    setIsStarting(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("이 브라우저는 카메라를 지원하지 않습니다.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      // Socket.io 연결 및 시그널링
      const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('broadcaster');
      });

      socket.on('watcher', (watcherId) => {
        createPeerForWatcher(watcherId);
      });

      socket.on('answer', (watcherId, description) => {
        peersRef.current[watcherId]?.setRemoteDescription(description);
      });

      socket.on('candidate', (watcherId, candidate) => {
        peersRef.current[watcherId]?.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
      });

      socket.on('disconnectPeer', (watcherId) => {
        peersRef.current[watcherId]?.close();
        delete peersRef.current[watcherId];
        setWatcherCount(c => Math.max(0, c - 1));
      });

      // DB에 방송 시작 기록
      try {
        await storageAdapter.startLiveBroadcast(`live_${Date.now()}`, '관리자 라이브 방송', 'admin');
      } catch (e) { /* DB 오류는 방송을 막지 않음 */ }

      localStorage.setItem('su_live_broadcast_on', '1');
      window.dispatchEvent(new StorageEvent('storage', { key: 'su_live_broadcast_on', newValue: '1' }));
      setIsLive(true);
    } catch (err) {
      let msg = "방송 시작 실패: ";
      if (err.name === 'NotAllowedError') msg += "카메라/마이크 권한을 허용해주세요.";
      else if (err.name === 'NotFoundError') msg += "카메라/마이크를 찾을 수 없습니다.";
      else msg += err.message;
      setError(msg);
    } finally {
      setIsStarting(false);
    }
  };

  // 방송 종료
  const stopLive = async () => {
    // 모든 피어 종료
    Object.values(peersRef.current).forEach(pc => pc.close());
    peersRef.current = {};

    // 스트림 종료
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;

    socketRef.current?.emit('stop-broadcast');
    socketRef.current?.disconnect();
    socketRef.current = null;

    localStorage.setItem('su_live_broadcast_on', '0');
    window.dispatchEvent(new StorageEvent('storage', { key: 'su_live_broadcast_on', newValue: '0' }));
    setIsLive(false);
    setWatcherCount(0);
  };

  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (isLive) stopLive();
    };
  }, []); // eslint-disable-line

  return (
    <div style={{ maxWidth: 440, margin: "40px auto", padding: 24, background: "#18181b", borderRadius: 16, color: "#fff" }}>
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>📡 관리자 라이브 방송</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {!isLive ? (
          <button
            onClick={startLive}
            disabled={isStarting}
            style={{ padding: 14, borderRadius: 10, background: isStarting ? "#6b7280" : "#22c55e", color: "#fff", fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer" }}
          >
            {isStarting ? "시작 중..." : "🔴 라이브 방송 시작"}
          </button>
        ) : (
          <button
            onClick={stopLive}
            style={{ padding: 14, borderRadius: 10, background: "#ef4444", color: "#fff", fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer" }}
          >
            ⏹ 방송 종료
          </button>
        )}

        {isLive && (
          <div style={{ padding: 10, background: "rgba(239,68,68,0.15)", borderRadius: 8, textAlign: "center", fontSize: 14 }}>
            🔴 <b>라이브 중</b> — 시청자 {watcherCount}명
          </div>
        )}

        <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: 12, overflow: "hidden", background: "#000" }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>

        {error && <div style={{ color: "#ef4444", fontSize: 13, padding: 10, background: "rgba(239,68,68,0.1)", borderRadius: 8 }}>{error}</div>}

        <div style={{ fontSize: 12, color: "#6b7280", textAlign: "center" }}>
          WebRTC로 실시간 전송 · 시청자는 홈화면에서 확인
        </div>
      </div>
    </div>
  );
}
