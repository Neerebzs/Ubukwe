'use client';

/**
 * PageViewTracker — fires a page_view event on every App Router navigation.
 *
 * Self-contained: wraps its own <Suspense> boundary so callers in Server
 * Components don't need to add one. This satisfies Next.js 14's requirement
 * that components calling useSearchParams() be inside <Suspense>.
 *
 * Intentionally has NO imports from lib/auth or lib/api to avoid
 * pulling browser-only modules (axios, localStorage) into the SSR bundle.
 * User context is enriched at the call site via useAnalytics() when needed.
 */

import { Suspense, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

function PageViewTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevUrl = useRef<string>('');

  useEffect(() => {
    const qs = searchParams?.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;

    if (url === prevUrl.current) return;
    prevUrl.current = url;

    // Push directly to GTM dataLayer — no lib/auth dependency
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'page_view',
        page_path: url,
        page_title: document.title,
        timestamp: new Date().toISOString(),
      });
    }
  }, [pathname, searchParams]);

  return null;
}

export function PageViewTracker() {
  return (
    <Suspense fallback={null}>
      <PageViewTrackerInner />
    </Suspense>
  );
}
