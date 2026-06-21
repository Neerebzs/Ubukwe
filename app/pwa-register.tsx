'use client';

import { useEffect } from 'react';

/**
 * PWARegister
 *
 * Registers the service worker and listens for the RELOAD_PAGE message
 * that the new SW broadcasts after activation.  This ensures every open
 * tab automatically reloads to the latest version after a deploy —
 * without the user having to manually clear their cache.
 */
export function PWARegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'RELOAD_PAGE') {
        // Only reload if the page is not currently being interacted with
        // (avoids disrupting a user in the middle of filling a form)
        if (!document.hidden) {
          console.log('[SW] New version available — reloading...');
          window.location.reload();
        }
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('[SW] Registered, scope:', registration.scope);

        // If a new SW is waiting (installed but not yet active), activate it
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        // Watch for future updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New SW is ready — tell it to activate now
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });
      })
      .catch((err) => {
        console.warn('[SW] Registration failed:', err);
      });

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  return null;
}
