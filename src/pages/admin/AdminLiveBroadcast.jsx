import React, { useState, useRef, useEffect } from "react";
import * as storageAdapter from "../../lib/storageAdapter";
import { getSession, getCurrentUser } from "../../lib/authStore";

export default function AdminLiveBroadcast() {
  console.log('[FORENSIC] 🔍 THIS FILE IS USED: src/pages/admin/AdminLiveBroadcast.jsx');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLive, setIsLive] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [liveStatus, setLiveStatus] = useState(null);
  const videoRef = useRef(null);

  // 모바일 환경 체크
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // 생방송 상태 로드
  useEffect(() => {
    loadLiveStatus();
  }, []);

  const loadLiveStatus = async () => {
    try {
      const status = await storageAdapter.getLiveBroadcastStatus();
      setLiveStatus(status);
      if (status?.broadcast) {
        setIsLive(true);
      }
    } catch (err) {
      console.error('[AdminLiveBroadcast] Failed to load status:', err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const session = getSession();
      const currentUser = getCurrentUser();
      const memberId = String(
        sessionStorage.getItem('su_admin_member_id')
        || session?.memberId
        || currentUser?.memberId
        || currentUser?.id
        || ''
      ).trim();

      if (!memberId) {
        setError("관리자 회원 정보가 없습니다. 관리자 페이지에 다시 로그인해주세요.");
        return;
      }

      const data = await storageAdapter.adminLogin(password, memberId);
      
      if (data.ok) {
        sessionStorage.setItem('su_admin_member_id', memberId);
        setIsAuthenticated(true);
        setError("");
      } else {
        setError("비밀번호가 올바르지 않습니다.");
      }
    } catch (err) {
      console.error('[AdminLiveBroadcast] Auth failed:', err);
      setError("서버 연결 실패. 다시 시도해주세요.");
    }
  };

  const startLive = async () => {
    console.log('[AdminLiveBroadcast] Start button clicked');
    setError("");
    if (!isMobile) {
      setError("이 기능은 스마트폰에서만 사용 가능합니다.");
      return;
    }
    if (window.location.protocol !== 'https:' && !window.location.hostname.includes('localhost') && window.location.hostname !== '127.0.0.1') {
      const message = '라이브 방송은 HTTPS 환경에서만 가능합니다.';
      console.warn('[AdminLiveBroadcast] HTTPS required');
      setError(message);
      window.alert(message);
      return;
    }
    setIsStarting(true);
    try {
      // ★ HTTPS 체크 (getUserMedia는 HTTPS 또는 localhost에서만 동작)
      const isSecure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
      if (!isSecure) {
        setError('카메라 사용은 HTTPS 환경에서만 가능합니다. 현재 주소: ' + location.origin);
        return;
      }

      // ★ getUserMedia 지원 여부 체크
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("이 브라우저는 카메라/마이크를 지원하지 않습니다. 최신 Chrome/Firefox/Safari를 사용하세요.");
        return;
      }

      // 서버에 생방송 시작 알림
      const broadcastId = `live_${Date.now()}`;
      const title = "관리자 라이브 방송";
      const createdBy = "admin";
      
      await storageAdapter.startLiveBroadcast(broadcastId, title, createdBy);
      
      // 카메라/마이크 시작
      console.log('[AdminLiveBroadcast] Requesting media stream');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true,
      });
      console.log('[AdminLiveBroadcast] Media stream acquired successfully');
      
      // ★ 검증: stream tracks 확인
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();
      console.log('[AdminLiveBroadcast] 🎥 Stream obtained:', {
        videoTracksCount: videoTracks.length,
        audioTracksCount: audioTracks.length,
        videoTrack: videoTracks[0]?.label,
        audioTrack: audioTracks[0]?.label,
      });
      
      if (videoTracks.length === 0) {
        throw new Error('카메라 트랙을 찾을 수 없습니다. 카메라 장치를 확인하세요.');
      }
      
      if (videoRef.current) {
        try {
          videoRef.current.setAttribute('playsinline', '');
          videoRef.current.setAttribute('webkit-playsinline', '');
        } catch (e) {}
        videoRef.current.srcObject = stream;
        
        // ★ 즉시 play() 호출 (onloadedmetadata 대기하지 않음)
        try {
          await videoRef.current.play();
          console.log('[AdminLiveBroadcast] ✅ Video playback started');
        } catch (err) {
          console.error('[AdminLiveBroadcast] ❌ Video playback failed:', err);
        }
        
        try { window.liveStream = stream; } catch (e) {}
        try { localStorage.setItem('su_live_broadcast_on', '1'); } catch (e) {}
        try { window.dispatchEvent(new StorageEvent('storage', { key: 'su_live_broadcast_on', newValue: '1' })); } catch (e) {}
        setIsLive(true);
        loadLiveStatus();
      }
    } catch (err) {
      console.error('[AdminLiveBroadcast] Media/live start failed:', err);
      console.error('[AdminLiveBroadcast] Start failed:', err);
      let errorMsg = "생방송 시작 실패: ";
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg += "카메라/마이크 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.";
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg += "카메라/마이크를 찾을 수 없습니다. 장치가 연결되어 있는지 확인하세요.";
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMsg += "카메라 또는 마이크를 다른 앱이 사용 중입니다. 사용 중인 앱을 종료한 뒤 다시 시도해주세요.";
      } else {
        errorMsg += err.message || '알 수 없는 오류';
      }
      setError(errorMsg);
      window.alert(errorMsg);
    } finally {
      setIsStarting(false);
    }
  };

  const stopLive = async () => {
    try {
      // 서버에 생방송 종료 알림
      if (liveStatus?.broadcast?.broadcastId) {
        await storageAdapter.stopLiveBroadcast(liveStatus.broadcast.broadcastId);
      }
      
      // 카메라/마이크 종료
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
        videoRef.current.srcObject = null;
        try { window.liveStream = null; } catch (e) {}
        try { localStorage.setItem('su_live_broadcast_on', '0'); } catch (e) {}
        try { window.dispatchEvent(new StorageEvent('storage', { key: 'su_live_broadcast_on', newValue: '0' })); } catch (e) {}
        setIsLive(false);
        loadLiveStatus();
      }
    } catch (err) {
      console.error('[AdminLiveBroadcast] Stop failed:', err);
      setError("생방송 종료 실패: " + err.message);
    }
  };

  // cleanup on unmount to avoid leaving flag set
  useEffect(() => {
    return () => {
      try { localStorage.setItem('su_live_broadcast_on', '0'); } catch (e) {}
      try { window.liveStream = null; } catch (e) {}
    };
  }, []);

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 24, background: "#18181b", borderRadius: 16, color: "#fff" }}>
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>관리자 라이브 방송</h2>
      {!isAuthenticated ? (
        <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label>관리자 비밀번호 입력</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #333" }}
            autoFocus
          />
          <button type="submit" style={{ padding: 10, borderRadius: 8, background: "#8b5cf6", color: "#fff", fontWeight: 700 }}>
            인증하기
          </button>
          {error && <div style={{ color: "#ef4444", marginTop: 8 }}>{error}</div>}
        </form>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <button
            onClick={startLive}
            disabled={isStarting}
            style={{ padding: 12, borderRadius: 8, background: (isLive || isStarting) ? "#6b7280" : "#22c55e", color: "#fff", fontWeight: 700 }}
          >
            {isLive ? "라이브 방송 중" : isStarting ? "시작 중..." : "라이브 방송 시작"}
          </button>
          <button
            onClick={stopLive}
            disabled={!isLive}
            style={{ padding: 12, borderRadius: 8, background: !isLive ? "#6b7280" : "#ef4444", color: "#fff", fontWeight: 700 }}
          >
            방송 종료
          </button>
          <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: 12, overflow: "hidden", background: "#000" }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
          {liveStatus?.broadcast && (
            <div style={{ padding: 12, background: "rgba(34, 197, 94, 0.1)", borderRadius: 8, fontSize: 13 }}>
              <div>방송 제목: {liveStatus.broadcast.title}</div>
              <div>시작 시간: {new Date(liveStatus.broadcast.liveStartedAt).toLocaleString()}</div>
            </div>
          )}
          {error && <div style={{ color: "#ef4444", marginTop: 8 }}>{error}</div>}
        </div>
      )}
      <div style={{ marginTop: 24, fontSize: 13, color: "#a3a3a3", textAlign: "center" }}>
        ※ 이 기능은 스마트폰에서만 사용 가능합니다.<br />
        ※ 실시간 송출은 브라우저 내에서만 동작하며, 서버/다른 사용자에게 전달하려면 추가 개발이 필요합니다.
      </div>
    </div>
  );
}
