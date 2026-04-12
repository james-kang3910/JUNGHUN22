// Central SSOT registry: components can register callbacks to run when
// `su:ssot:changed` events arrive. This avoids duplicating window listeners
// and provides type-based filtering.
const listeners = new Map();
let nextId = 1;

function handleEvent(ev) {
  try {
    const detailType = ev?.detail?.type || ev?.detail?.key || null;
    for (const [id, entry] of listeners.entries()) {
      try {
        if (!entry.types || entry.types.length === 0) {
          entry.cb(ev);
        } else if (detailType && entry.types.includes(detailType)) {
          entry.cb(ev);
        } else if (!detailType && entry.types.includes('*')) {
          // wildcard listener
          entry.cb(ev);
        }
      } catch (e) {
        console.error('[ssotRegistry] listener error', e);
      }
    }
  } catch (e) {
    console.error('[ssotRegistry] handleEvent error', e);
  }
}

window.addEventListener('su:ssot:changed', handleEvent);

export function register(types, cb) {
  // types: array of strings (e.g. ['auditions']) or null/undefined for all
  const id = String(nextId++);
  const t = Array.isArray(types) ? types : [];
  listeners.set(id, { types: t, cb });
  return id;
}

export function unregister(id) {
  try { listeners.delete(id); } catch (e) { /* ignore */ }
}

export default { register, unregister };
