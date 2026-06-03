import React, { useState, useRef, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import * as storageAdapter from "../../lib/storageAdapter";

const ICE_SERVERS = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
const MEDIA_CONSTRAINTS = {
  video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
  audio: true,
};

/** Vite dev/prod 모두 현재 origin + /socket.io 프록시 사용 */
function getSocketUrl() {
  return window.location.origin;
}

export default function AdminLiveBroadcast() {
  const [isLive, setIsLive] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const [watcherCount, setWatcherCount] = useState(0);
  const [error, setError] = useState("");
  const videoRef = useRef(null);
  const socketRef = useRef(null);
  const streamRef = useRef(null);
  const peersRef = useRef({});
  const broadcastIdRef = useRef(null);
  const isLiveRef = useRef(false);

  const attachPreview = useCallback(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!video || !stream) return;
    if (video.srcObject !== stream) {
      video.srcObject = stream;
    }
    video.play().catch(() => {});
  }, []);

  const ensureCamera = useCallback(async () => {
    if (streamRef.current?.active) {
      attachPreview();
      return streamRef.current;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("이 브라우저는 카메라를 지원하지 않습니다.");
    }
    const stream = await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
    streamRef.current = stream;
    attachPreview();
    setPreviewReady(true);
    return stream;
  }, [attachPreview]);

  const createPeerForWatcher = useCallback(async (watcherId) => {
    const stream = streamRef.current;
    if (!stream || peersRef.current[watcherId]) return;

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peersRef.current[watcherId] = pc;

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) socketRef.current?.emit("candidate", watcherId, candidate);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        pc.close();
        delete peersRef.current[watcherId];
        setWatcherCount((c) => Math.max(0, c - 1));
      }
    };

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current?.emit("offer", watcherId, pc.localDescription);
      setWatcherCount((c) => c + 1);
    } catch (err) {
      console.error("[AdminLiveBroadcast] offer failed:", err);
      pc.close();
      delete peersRef.current[watcherId];
    }

    // WebRTC addTrack 후 일부 브라우저에서 로컬 미리보기가 검은 화면이 되는 문제 방지
    attachPreview();
  }, [attachPreview]);

  // 페이지 진입 시 카메라 미리보기
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await ensureCamera();
        if (cancelled) return;
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "카메라 미리보기를 시작할 수 없습니다.");
        }
      }
    })();
    return () => {
      cancelled = true;
      if (!isLiveRef.current) {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [ensureCamera]);

  useEffect(() => {
    isLiveRef.current = isLive;
    attachPreview();
  }, [isLive, attachPreview]);

  const startLive = async () => {
    setError("");
    setIsStarting(true);
    try {
      await ensureCamera();

      const broadcastId = `live_${Date.now()}`;
      broadcastIdRef.current = broadcastId;

      const socket = io(getSocketUrl(), { transports: ["websocket", "polling"] });
      socketRef.current = socket;

      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("시그널링 서버 연결 시간 초과")), 12000);
        socket.once("connect", () => {
          clearTimeout(timer);
          socket.emit("broadcaster");
          resolve();
        });
        socket.once("connect_error", (err) => {
          clearTimeout(timer);
          reject(err);
        });
      });

      socket.on("watcher", (watcherId) => {
        createPeerForWatcher(watcherId);
      });

      socket.on("answer", (watcherId, description) => {
        peersRef.current[watcherId]?.setRemoteDescription(description).then(() => {
          attachPreview();
        }).catch(() => {});
      });

      socket.on("candidate", (watcherId, candidate) => {
        peersRef.current[watcherId]?.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
      });

      socket.on("disconnectPeer", (watcherId) => {
        peersRef.current[watcherId]?.close();
        delete peersRef.current[watcherId];
        setWatcherCount((c) => Math.max(0, c - 1));
      });

      try {
        await storageAdapter.startLiveBroadcast(broadcastId, "관리자 라이브 방송", "admin");
      } catch (e) {
        console.warn("[AdminLiveBroadcast] DB live start skipped:", e);
      }

      localStorage.setItem("su_live_broadcast_on", "1");
      window.dispatchEvent(new StorageEvent("storage", { key: "su_live_broadcast_on", newValue: "1" }));
      setIsLive(true);
      attachPreview();
    } catch (err) {
      let msg = "방송 시작 실패: ";
      if (err.name === "NotAllowedError") msg += "카메라/마이크 권한을 허용해주세요.";
      else if (err.name === "NotFoundError") msg += "카메라/마이크를 찾을 수 없습니다.";
      else msg += err.message || "알 수 없는 오류";
      setError(msg);
      socketRef.current?.disconnect();
      socketRef.current = null;
    } finally {
      setIsStarting(false);
    }
  };

  const stopLive = async () => {
    Object.values(peersRef.current).forEach((pc) => pc.close());
    peersRef.current = {};

    socketRef.current?.emit("stop-broadcast");
    socketRef.current?.disconnect();
    socketRef.current = null;

    if (broadcastIdRef.current) {
      try {
        await storageAdapter.stopLiveBroadcast(broadcastIdRef.current);
      } catch (e) {
        console.warn("[AdminLiveBroadcast] DB live stop skipped:", e);
      }
      broadcastIdRef.current = null;
    }

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;

    localStorage.setItem("su_live_broadcast_on", "0");
    window.dispatchEvent(new StorageEvent("storage", { key: "su_live_broadcast_on", newValue: "0" }));
    setIsLive(false);
    setPreviewReady(false);
    setWatcherCount(0);
  };

  useEffect(() => {
    return () => {
      if (isLiveRef.current) {
        Object.values(peersRef.current).forEach((pc) => pc.close());
        streamRef.current?.getTracks().forEach((t) => t.stop());
        socketRef.current?.disconnect();
        localStorage.setItem("su_live_broadcast_on", "0");
      }
    };
  }, []);

  return (
    <div style={{ maxWidth: 440, margin: "40px auto", padding: 24, background: "#18181b", borderRadius: 16, color: "#fff" }}>
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>📡 관리자 라이브 방송</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: 12, overflow: "hidden", background: "#000", position: "relative" }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          {!previewReady && !isLive ? (
            <div style={{
              position: "absolute", inset: 0, display: "grid", placeItems: "center",
              background: "rgba(0,0,0,0.55)", fontSize: 13, color: "#d1d5db",
            }}>
              카메라 준비 중...
            </div>
          ) : null}
        </div>

        {!isLive ? (
          <button
            type="button"
            onClick={startLive}
            disabled={isStarting}
            style={{ padding: 14, borderRadius: 10, background: isStarting ? "#6b7280" : "#22c55e", color: "#fff", fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer" }}
          >
            {isStarting ? "시작 중..." : "🔴 라이브 방송 시작"}
          </button>
        ) : (
          <button
            type="button"
            onClick={stopLive}
            style={{ padding: 14, borderRadius: 10, background: "#ef4444", color: "#fff", fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer" }}
          >
            ⏹ 방송 종료
          </button>
        )}

        {isLive ? (
          <div style={{ padding: 10, background: "rgba(239,68,68,0.15)", borderRadius: 8, textAlign: "center", fontSize: 14 }}>
            🔴 <b>라이브 중</b> — 시청자 {watcherCount}명
          </div>
        ) : null}

        {error ? (
          <div style={{ color: "#ef4444", fontSize: 13, padding: 10, background: "rgba(239,68,68,0.1)", borderRadius: 8 }}>{error}</div>
        ) : null}

        <div style={{ fontSize: 12, color: "#6b7280", textAlign: "center" }}>
          WebRTC 실시간 전송 · 시청자는 홈/공유방송 화면에서 확인
        </div>
      </div>
    </div>
  );
}
