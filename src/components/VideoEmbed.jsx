import React, { useRef, useLayoutEffect } from "react";
import { parseYouTubeId, isDirectVideoUrl as isDirectVideoUrlUtil } from "../lib/videoUtils";

// VideoEmbed: Unified renderer for YouTube or direct video URLs
// - YouTube URLs are embedded via iframe (className="su-mediaEl")
// - Direct video URLs (mp4/webm/ogg or data:video) use <video> (className="su-mediaEl")
// - Wrapper: className="su-mediaWrap" with [MEDIA DOM] logging
// - If url is falsy/invalid, renders placeholder (className="su-mediaPlaceholder")
// - YouTube: placeholder is NEVER rendered
// Notes:
// - Media elements use pointerEvents: 'none' by default so parent onClick works (e.g., opens lightbox)

function parseYoutubeWithStart(urlOrId) {
  if (!urlOrId) return null;
  try {
    const u = new URL(urlOrId, window.location.origin);
    const id = parseYouTubeId(urlOrId);
    if (!id) return null;
    let start = 0;
    const tParam = u.searchParams.get("t");
    const startParam = u.searchParams.get("start");
    const toSeconds = (t) => {
      if (!t) return 0;
      const m = String(t).match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?|(\d+)/i);
      if (!m) return 0;
      if (m[4]) return parseInt(m[4], 10) || 0;
      const h = parseInt(m[1] || 0, 10);
      const mnt = parseInt(m[2] || 0, 10);
      const s = parseInt(m[3] || 0, 10);
      return h * 3600 + mnt * 60 + s;
    };
    if (tParam) start = toSeconds(tParam);
    else if (startParam) start = parseInt(startParam, 10) || 0;
    return { id, start };
  } catch (e) {
    const id = parseYouTubeId(urlOrId);
    return id ? { id, start: 0 } : null;
  }
}

function isDirectVideo(url) {
  return isDirectVideoUrlUtil(url);
}

// mode: "thumbnail" (메인 카드용, 첫 프레임만 표시) | "full" (상세용, controls + playsInline)
export default function VideoEmbed({ url, mode = "thumbnail", autoplay = false, thumbnail, preferPreviewFrame = false }) {
  const wrapRef = useRef(null);
  const wrapperStyle = { position: 'absolute', inset: 0, width: '100%', height: '100%' };

  // Guard: if the current top-level context is a Chrome error page (chrome-error://...)
  // then avoid rendering cross-origin iframes which trigger the browser security message.
  const isChromeErrorContext = (typeof window !== 'undefined' && typeof window.location === 'object' && String(window.location.protocol).startsWith('chrome-error'));

  // Determine media type
  const yt = parseYoutubeWithStart(url);
  const isYoutube = !!yt;
  const isDirect = !isYoutube && isDirectVideo(url);

  // [MEDIA DOM] logging
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (isChromeErrorContext) return; // skip DOM logging inside chrome-error contexts
    try {
      const iframe = el.querySelector("iframe");
      const video = el.querySelector("video");
      const placeholder = el.querySelector(".su-mediaPlaceholder");
      const wrapperRect = el.getBoundingClientRect();
      const iframeRect = iframe ? iframe.getBoundingClientRect() : null;
      const videoRect = video ? video.getBoundingClientRect() : null;
      console.log("[MEDIA DOM]", {
        wrapperRect: { width: wrapperRect.width, height: wrapperRect.height },
        hasIframe: !!iframe,
        iframeRect: iframeRect ? { width: iframeRect.width, height: iframeRect.height } : null,
        hasVideo: !!video,
        videoRect: videoRect ? { width: videoRect.width, height: videoRect.height } : null,
        hasPlaceholder: !!placeholder,
      });
    } catch (e) { /* ignore */ }
  }, [url, isYoutube, isDirect]);

  // YouTube handling
  if (isYoutube) {
    if (isChromeErrorContext) {
      // Parent context is a browser error page — render placeholder to avoid unsafe iframe loads
      return (
        <div className="su-mediaWrap" ref={wrapRef} style={wrapperStyle}>
          <div className="su-mediaPlaceholder">
            <span>▶</span>
          </div>
        </div>
      );
    }
    // 썸네일 모드에서는 경량 이미지로 렌더 (카드/목록용)
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const qs = new URLSearchParams({
      rel: "0",
      modestbranding: "1",
      playsinline: "1",
      origin: origin,
    });
    if (yt.start && yt.start > 0) qs.set("start", String(yt.start));
    if (autoplay) qs.set('autoplay', '1');
    const src = `https://www.youtube.com/embed/${yt.id}?${qs.toString()}`;

    if (mode === 'thumbnail') {
      if (preferPreviewFrame) {
        return (
          <div className="su-mediaWrap" ref={wrapRef} style={wrapperStyle}>
            <iframe
              title={`yt-preview-${yt.id}`}
              src={src}
              className="su-mediaEl"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0, pointerEvents: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              loading="lazy"
            />
          </div>
        );
      }

      const thumb = thumbnail || `https://img.youtube.com/vi/${yt.id}/hqdefault.jpg`;
      return (
        <div className="su-mediaWrap" ref={wrapRef}>
          <img
            className="su-mediaEl"
            src={thumb}
            alt="YouTube thumbnail"
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              try {
                // prevent infinite loop if fallback also fails
                if (!e.target.dataset.errored) {
                  e.target.dataset.errored = '1';
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180'><rect width='100%' height='100%' fill='%23222'/><text x='50%' y='50%' fill='%23fff' font-size='16' font-family='Arial' dominant-baseline='middle' text-anchor='middle'>No thumbnail</text></svg>";
                }
              } catch (ex) {}
            }}
          />
        </div>
      );
    }

    // full 모드: iframe으로 재생

    // Log context info for debugging iframe load issues
    console.log("[YT IFRAME]", {
      src,
      isSecureContext: typeof window !== "undefined" ? window.isSecureContext : "N/A",
      protocol: typeof window !== "undefined" ? window.location.protocol : "N/A",
      href: typeof window !== "undefined" ? window.location.href : "N/A",
    });

    return (
      <div className="su-mediaWrap" ref={wrapRef} style={wrapperStyle}>
        <iframe
          title={`yt-${yt.id}`}
          src={src}
          className="su-mediaEl"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => console.log("[YT IFRAME onLoad]", { id: yt.id, src })}
          onError={(e) => console.error("[YT IFRAME onError]", { id: yt.id, src, error: e })}
        />
      </div>
    );
  }

  // Direct video → video tag only, NO placeholder
  // mode="thumbnail": muted + playsInline + preload=auto (썸네일 프레임 로드)
  // mode="full": controls + playsInline (상세 페이지용, 확대/전체화면 가능)
    if (isDirect) {
    const isThumbnail = mode === "thumbnail";
    return (
      <div className="su-mediaWrap" ref={wrapRef} style={wrapperStyle}>
        <video
          className="su-mediaEl"
          controls={!isThumbnail}
          playsInline
          muted={isThumbnail}
          autoPlay={autoplay}
          loop={autoplay}
          preload="auto"
          src={url}
          // 썸네일 모드: 포인터 이벤트 없음 (클릭은 부모가 처리)
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', ...(isThumbnail ? { pointerEvents: 'none' } : {}) }}
        />
      </div>
    );
  }

  // Non-YouTube non-direct handling
  if (mode === 'thumbnail') {
    if (thumbnail) {
      return (
        <div className="su-mediaWrap" ref={wrapRef}>
          <img
            className="su-mediaEl"
            src={thumbnail}
            alt="thumbnail"
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              try {
                if (!e.target.dataset.errored) {
                  e.target.dataset.errored = '1';
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180'><rect width='100%' height='100%' fill='%23222'/><text x='50%' y='50%' fill='%23fff' font-size='16' font-family='Arial' dominant-baseline='middle' text-anchor='middle'>No thumbnail</text></svg>";
                }
              } catch (ex) {}
            }}
          />
        </div>
      );
    }
    return (
      <div className="su-mediaWrap" ref={wrapRef} style={wrapperStyle}>
        <div className="su-mediaPlaceholder">
          <span>▶</span>
        </div>
      </div>
    );
  }

  // 지원하지 않는 URL 형식 — 에러 플레이스홀더 (재귀 iframe 방지)
  return (
    <div className="su-mediaWrap" ref={wrapRef} style={{ ...wrapperStyle, background: 'rgba(0,0,0,0.08)', borderRadius: 8 }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--c-tx-s, #6b7280)', userSelect: 'none' }}>
        <div style={{ fontSize: 32 }}>⚠️</div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>재생할 수 없는 영상입니다</div>
        <div style={{ fontSize: 11, opacity: 0.6 }}>지원 형식: YouTube, mp4, webm</div>
      </div>
    </div>
  );
}
