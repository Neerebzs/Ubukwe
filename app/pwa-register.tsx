'use client';

import { useEffect } from 'react';

/**
 * PWARegister
 *
 * Registers the service worker and listens for the RELOAD_PAGE message
 * that the new SW broadcasts after activation.
 *
 * Skipped in development — a stale SW often causes hydration mismatches
 * while iterating on layout/auth pages.
 */
export function PWARegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // Dev: unregister any leftover SW so cached HTML can't fight React hydration
    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => reg.unregister());
      });
      if (typeof caches !== 'undefined') {
        caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
      }
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'RELOAD_PAGE') {
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

        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
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
