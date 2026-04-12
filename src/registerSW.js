// registerSW.js - register service worker in production only
// Logs about updatefound/installed are emitted once (guarded by window.__sw_log_done)

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  // Only run if build is production — main.jsx will import this file conditionally.
  try {
    if (window.__sw_register_started) {
      // already attempted
    } else {
      window.__sw_register_started = true;
    }

    const doRegister = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (refreshing) return;
          refreshing = true;
          window.location.reload();
        });
        if (reg && reg.scope) {
          if (!window.__sw_log_done) {
            console.log('[SW] Registered at scope:', reg.scope);
            window.__sw_log_done = true;
          }
        }

        // listen for updates once
        if (reg) {
          reg.addEventListener('updatefound', () => {
            const installing = reg.installing;
            if (!installing) return;
            const onStateChange = () => {
              if (installing.state === 'installed') {
                if (!window.__sw_update_logged) {
                  if (navigator.serviceWorker.controller) {
                    console.log('[SW] New content available; please refresh.');
                  } else {
                    console.log('[SW] Content cached for offline use.');
                  }
                  window.__sw_update_logged = true;
                }
                // Activate new SW immediately so users do not stay on stale bundles.
                if (reg.waiting) {
                  reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                }
              }
            };
            installing.addEventListener('statechange', onStateChange);
          });

          // If an updated SW is already waiting, activate it now.
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        }
      } catch (err) {
        console.error('[SW] registration failed:', err);
      }
    };

    // call registration (main.jsx will only import this in production)
    doRegister();
  } catch (e) {
    console.error('[SW] register failed (outer):', e);
  }
}
