// Common YouTube utilities
// - parseYouTubeId(urlOrId): extracts the video ID from various URL formats or returns null
//   Supports: youtu.be/ID?..., youtube.com/watch?v=ID&..., youtube.com/shorts/ID?..., youtube.com/embed/ID?...
// - isYouTubeUrl(url): true if the input string looks like a YouTube URL or an ID that can be embedded
// - isDirectVideoUrl(url): true for direct media files (mp4/webm/ogg) or data:video

export function parseYouTubeId(urlOrId) {
  if (!urlOrId) return null;
  try {
    const u = new URL(urlOrId, window.location.origin);
    const host = u.hostname.replace(/^www\./, "");
    let id = null;
    if (host.includes("youtube.com")) {
      const p = u.pathname;
      if (p.startsWith("/watch")) id = u.searchParams.get("v");
      else if (p.startsWith("/embed/")) id = p.split("/embed/")[1];
      else if (p.startsWith("/shorts/")) id = p.split("/shorts/")[1];
    } else if (host.includes("youtu.be")) {
      id = u.pathname.replace("/", "");
    }
    if (!id) return null;
    // strip any trailing segments or query remnants just in case
    id = String(id).split(/[?&]/)[0];
    return id || null;
  } catch (e) {
    // If it's not a URL, it might be a bare ID
    const maybe = String(urlOrId).trim();
    if (/^[a-zA-Z0-9_-]{6,}$/.test(maybe)) return maybe;
    return null;
  }
}

export function isYouTubeUrl(url) {
  if (!url) return false;
  try {
    const u = new URL(url, window.location.origin);
    const host = u.hostname.replace(/^www\./, "");
    if (host.includes("youtube.com") || host.includes("youtu.be")) return true;
  } catch (e) {
    // not a URL, but if it's a valid ID we can still embed
    return /^[a-zA-Z0-9_-]{6,}$/.test(String(url).trim());
  }
  return false;
}

export function isDirectVideoUrl(url) {
  if (!url) return false;
  if (/^data:video\//i.test(url)) return true;
  return /\.(mp4|webm|ogg)(?:\?|$)/i.test(url);
}
