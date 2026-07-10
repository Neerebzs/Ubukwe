/**
 * Centralized cache configuration for TanStack Query.
 *
 * STRATEGY:
 * - STATIC data  : long staleTime → Next.js ISR handles server cache;
 *                  TanStack Query caches the client-side result without
 *                  hammering the API on every component mount.
 * - DYNAMIC data : very short staleTime (0–30 s) so users always see current
 *                  bookings, payments, and notifications.
 * - REAL-TIME    : staleTime: 0 + refetchOnMount: 'always' so we always hit
 *                  the network (equivalent to fetch({ cache: 'no-store' })).
 *
 * These are DEFAULT options. Individual hooks can override them when needed.
 */

/** Millisecond helpers for readability */
const SECONDS = 1_000;
const MINUTES = 60 * SECONDS;
const HOURS = 60 * MINUTES;

// ── staleTime presets ────────────────────────────────────────────────────────

/**
 * Data that almost never changes (categories, system settings, country lists).
 * Can safely be served from the TanStack Query cache for up to 1 hour before
 * a background refetch is triggered.
 */
export const STATIC_STALE_TIME = 1 * HOURS;

/**
 * Data that changes infrequently (popular services, public events).
 * Background refresh every 5 minutes keeps the list reasonably up-to-date
 * without hammering the API on every page visit.
 */
export const SLOW_STALE_TIME = 5 * MINUTES;

/**
 * User-specific data that can tolerate a few minutes of latency
 * (auth profile, wedding details, provider profile).
 */
export const MEDIUM_STALE_TIME = 5 * MINUTES;

/**
 * Transactional data where seeing stale state would confuse the user
 * (bookings, payments, contracts, disputes).
 * Set to 0: the cache will still serve the last result instantly while a
 * background refetch completes, but every mount triggers a network call.
 */
export const DYNAMIC_STALE_TIME = 0;

/**
 * Real-time data that must always be fresh (notifications, messages).
 * staleTime: 0 combined with refetchInterval keeps the badge count accurate.
 */
export const REALTIME_STALE_TIME = 0;

// ── gcTime (garbage collection time) ────────────────────────────────────────
// How long unused cache entries survive before being removed from memory.

export const STATIC_GC_TIME = 24 * HOURS;    // Keep rarely-changing data in memory a long time
export const DYNAMIC_GC_TIME = 5 * MINUTES;  // Evict transactional data quickly

// ── Polling intervals ────────────────────────────────────────────────────────

/** How often to poll for new notifications in the background */
export const NOTIFICATION_POLL_INTERVAL = 60 * SECONDS;

/** How often to refresh conversations list */
export const CONVERSATIONS_POLL_INTERVAL = 20 * SECONDS;

// ── Named query option sets ──────────────────────────────────────────────────
// Import these into useQuery() calls for consistency.

/** Static / quasi-static public data */
export const staticQueryOptions = {
  staleTime: STATIC_STALE_TIME,
  gcTime: STATIC_GC_TIME,
  retry: 2,
} as const;

/** Slow-changing public data (events, popular services) */
export const slowQueryOptions = {
  staleTime: SLOW_STALE_TIME,
  gcTime: STATIC_GC_TIME,
  retry: 2,
} as const;

/** User profile and session data */
export const profileQueryOptions = {
  staleTime: MEDIUM_STALE_TIME,
  gcTime: 15 * MINUTES,
  retry: false,
} as const;

/** Transactional data — bookings, payments, contracts, disputes */
export const dynamicQueryOptions = {
  staleTime: DYNAMIC_STALE_TIME,
  gcTime: DYNAMIC_GC_TIME,
  refetchOnMount: true,
  refetchOnWindowFocus: true,
  retry: 1,
} as const;

/** Real-time data — notifications, messages */
export const realtimeQueryOptions = {
  staleTime: REALTIME_STALE_TIME,
  gcTime: DYNAMIC_GC_TIME,
  refetchOnMount: true,
  refetchOnWindowFocus: true,
  refetchInterval: NOTIFICATION_POLL_INTERVAL,
  retry: 1,
} as const;
