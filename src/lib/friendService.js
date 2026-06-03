// 친구 관리 서비스 (서버 API 연동)
// Default backend in this workspace listens on 8787 (server/index.js)
const RAW_API = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || '';
const API_BASE = String(RAW_API || '').replace(/\/+$/, '').replace(/\/api$/, '') || (import.meta.env.DEV ? 'http://127.0.0.1:8787' : '');

export async function getFriends(userId) {
  const res = await fetch(`${API_BASE}/api/friends/${encodeURIComponent(userId)}`, {
    credentials: 'include'
  });
  const data = await res.json().catch(() => (null));
  if (!res.ok) throw new Error((data && data.error) ? data.error : 'Failed to fetch friends');
  if (!data || data.ok !== true || data.success !== true) throw new Error('Invalid API contract: /api/friends');
  return Array.isArray(data.friends) ? data.friends : [];
}

export async function addFriend(userId, friendId) {
  const res = await fetch(`${API_BASE}/api/friends`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ userId, friendId })
  });
  const data = await res.json().catch(() => (null));
  if (!res.ok) throw new Error((data && data.error) ? data.error : 'Failed to add friend');
  if (!data || data.ok !== true || data.success !== true) throw new Error('Invalid API contract: /api/friends');

  window.dispatchEvent(new CustomEvent('su:ssot:changed', {
    detail: { type: 'friends', operation: 'create' }
  }));
  window.dispatchEvent(new CustomEvent('su_friends:updated'));

  return Array.isArray(data.friends) ? data.friends : [];
}

export async function removeFriend(userId, friendId) {
  const res = await fetch(`${API_BASE}/api/friends`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ userId, friendId })
  });
  const data = await res.json().catch(() => (null));
  if (!res.ok) throw new Error((data && data.error) ? data.error : 'Failed to remove friend');
  if (!data || data.ok !== true || data.success !== true) throw new Error('Invalid API contract: /api/friends');

  window.dispatchEvent(new CustomEvent('su:ssot:changed', {
    detail: { type: 'friends', operation: 'delete' }
  }));
  window.dispatchEvent(new CustomEvent('su_friends:updated'));

  return Array.isArray(data.friends) ? data.friends : [];
}

export default { getFriends, addFriend, removeFriend };
