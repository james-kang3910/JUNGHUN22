// 채팅 서비스 (서버 API 연동)
// Default backend in this workspace listens on 8787 (server/index.js)
import { getAuthInfo } from './authStore';

const RAW_API = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || '';
const API_BASE = String(RAW_API || '').replace(/\/+$/, '').replace(/\/api$/, '') || (import.meta.env.DEV ? 'http://127.0.0.1:8787' : '');

function sessionHeaders() {
  const token = getAuthInfo()?.token || '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// last played message id to avoid duplicate plays across events
let lastPlayedMessageId = null;

// simple WebAudio fallback beep (short, unobtrusive)
function fallbackBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 880;
    g.gain.value = 0.0025; // comfortable volume
    o.connect(g); g.connect(ctx.destination);
    o.start();
    setTimeout(() => { try { o.stop(); ctx.close(); } catch (e) {} }, 180);
  } catch (e) {}
}

function shouldPlayMessage(msg) {
  try {
    if (!msg || !msg.text) return false;
    // only play for messages that include the marker
    if (!String(msg.text).includes('(공유)')) return false;
    // global toggle (default ON)
    const global = localStorage.getItem('su_chat_sound_enabled');
    if (global === '0') return false;
    // don't play for messages I sent
    const me = getAuthInfo();
    const myId = me ? String(me.id || me.memberId || '') : '';
    if (String(msg.from) === myId) return false;
    // avoid duplicate
    if (msg.id && lastPlayedMessageId === msg.id) return false;
    return true;
  } catch (e) {
    return false;
  }
}

function playSharedSoundForMessage(msg) {
  try {
    const audio = new Audio('/sounds/chat-share.mp3');
    audio.play().catch(() => { fallbackBeep(); });
    const t = setTimeout(() => { try { fallbackBeep(); } catch (e) {} }, 300);
    if (msg && msg.id) lastPlayedMessageId = msg.id;
    audio.addEventListener && audio.addEventListener('playing', () => { clearTimeout(t); });
  } catch (e) {}
}

// Get conversation between two users
export async function getConversation(userId1, userId2) {
  const res = await fetch(`${API_BASE}/api/messages?with=${encodeURIComponent(userId2)}`, {
    credentials: 'include',
    headers: { ...sessionHeaders() },
  });
  const data = await res.json().catch(() => (null));
  if (!res.ok) {
    throw new Error((data && data.error) ? data.error : 'Failed to fetch conversation');
  }
  if (!data || data.ok !== true || data.success !== true) {
    throw new Error('Invalid API contract: /api/messages');
  }
  return Array.isArray(data.messages) ? data.messages : [];
}

// Send a message
export async function sendMessage(from, to, text) {
  const res = await fetch(`${API_BASE}/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...sessionHeaders() },
    credentials: 'include',
    body: JSON.stringify({ fromId: from, toId: to, text })
  });
  const data = await res.json().catch(() => (null));
  if (!res.ok) {
    throw new Error((data && data.error) ? data.error : 'Failed to send message');
  }
  if (!data || data.ok !== true || data.success !== true || !data.messageId) {
    throw new Error('Invalid API contract: /api/messages');
  }

  window.dispatchEvent(new CustomEvent('su:ssot:changed', {
    detail: { type: 'messages', operation: 'create' }
  }));
  window.dispatchEvent(new CustomEvent('su_messages:updated'));

  const msg = { id: data.messageId, from, to, text, createdAt: new Date().toISOString() };
  if (shouldPlayMessage(msg)) {
    playSharedSoundForMessage(msg);
  }
  return msg;
}

// Get recent conversations list
export async function getConversations(userId) {
  const res = await fetch(`${API_BASE}/api/chats/conversations/${encodeURIComponent(userId)}`, {
    credentials: 'include',
    headers: { ...sessionHeaders() },
  });
  const data = await res.json().catch(() => (null));
  if (!res.ok) {
    throw new Error((data && data.error) ? data.error : 'Failed to fetch conversations');
  }
  if (!data || data.ok !== true || data.success !== true) {
    throw new Error('Invalid API contract: /api/chats/conversations');
  }
  return Array.isArray(data.conversations) ? data.conversations : [];
}

export default { getConversation, sendMessage, getConversations };
