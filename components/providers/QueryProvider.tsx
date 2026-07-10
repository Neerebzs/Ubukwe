'use client';

/**
 * TanStack Query (React Query) Provider.
 *
 * DEFAULT OPTIONS:
 * ─ staleTime: 0
 *   Most data in this app is user-specific or transactional, so the safest
 *   default is "always stale" — each query hook applies its own staleTime.
 *   Static hooks (categories, popular services) use staticQueryOptions /
 *   slowQueryOptions from lib/cache/query-config.ts.
 *
 * ─ gcTime: 5 min
 *   Unused query results are kept in memory for 5 minutes so fast navigation
 *   between pages still feels instant.
 *
 * ─ retry: 1
 *   One automatic retry on network errors. Auth failures (401) are NOT
 *   retried — the axios interceptor handles those with a redirect.
 *
 * ─ refetchOnWindowFocus: true
 *   When a user switches tabs and returns, transactional data (bookings,
 *   notifications) will silently refresh in the background.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

const FIVE_MINUTES = 5 * 60 * 1000;

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Default: treat all data as immediately stale so hooks that
            // haven't opted into a staleTime always hit the network.
            staleTime: 0,
            // Keep unused cache entries alive for 5 minutes.
            gcTime: FIVE_MINUTES,
            // One automatic retry for transient network errors.
            retry: 1,
            // Refetch when the user returns to the tab — important for
            // bookings, notifications, and any real-time business data.
            refetchOnWindowFocus: true,
          },
          mutations: {
            // Mutations do not retry by default — duplicate state changes
            // (e.g., double-confirming a booking) are worse than failing.
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
