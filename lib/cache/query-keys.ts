/**
 * Centralized TanStack Query key registry.
 *
 * WHY: Having keys scattered across hooks leads to missed invalidations when
 * mutations happen. This single registry is the source of truth so every
 * invalidateQueries() call uses the exact same key shape as the corresponding
 * useQuery() call.
 *
 * USAGE:
 *   import { queryKeys } from '@/lib/cache/query-keys'
 *
 *   // In a query hook:
 *   queryKey: queryKeys.public.categories()
 *
 *   // After a mutation:
 *   queryClient.invalidateQueries({ queryKey: queryKeys.public.categories() })
 */

export const queryKeys = {
  // ── PUBLIC / STATIC data ────────────────────────────────────────────────────
  // These are slow-changing: categories, popular services, public listings.
  // They use longer staleTimes (see query-config.ts).
  public: {
    /** All public categories */
    categories: () => ['public', 'categories'] as const,
    /** All published/public services, optionally filtered by category */
    services: (category?: string) => ['public', 'services', { category }] as const,
    /** Popular services list */
    popularServices: (limit?: number, category?: string) =>
      ['public', 'popular-services', { limit, category }] as const,
    /** Public events list */
    events: (category?: string) => ['public', 'events', { category }] as const,
    /** Single public event */
    event: (eventId: string) => ['public', 'event', eventId] as const,
    /** System settings (logo, hero image, contact info) */
    systemSettings: () => ['public', 'system-settings'] as const,
  },

  // ── AUTHENTICATED USER ──────────────────────────────────────────────────────
  // User identity and profile — 5-minute staleTime is appropriate.
  auth: {
    /** Current logged-in user */
    user: () => ['auth', 'user'] as const,
    /** Full profile */
    profile: () => ['auth', 'profile'] as const,
    /** 2FA status */
    twoFAStatus: () => ['auth', '2fa-status'] as const,
  },

  // ── NOTIFICATIONS ───────────────────────────────────────────────────────────
  // Real-time business data — must always be fresh. Short staleTime + polling.
  notifications: {
    /** Root key — invalidate this to bust all notification queries at once */
    all: () => ['notifications'] as const,
    /** Paginated / filtered notification list */
    list: (unreadOnly?: boolean) => ['notifications', 'list', { unreadOnly }] as const,
    /** Unread badge count */
    unreadCount: () => ['notifications', 'unread-count'] as const,
  },

  // ── BOOKINGS ────────────────────────────────────────────────────────────────
  // Transactional — always fetch fresh (no-store equivalent via staleTime: 0).
  bookings: {
    all: () => ['bookings'] as const,
    list: (params?: { role?: string; status?: string }) =>
      ['bookings', 'list', params] as const,
    detail: (id: string) => ['bookings', 'detail', id] as const,
    providerList: (params?: { status?: string }) =>
      ['bookings', 'provider', params] as const,
    providerStats: () => ['bookings', 'provider-stats'] as const,
  },

  // ── CONTRACTS ───────────────────────────────────────────────────────────────
  contracts: {
    all: () => ['contracts'] as const,
    list: (params?: { status?: string }) => ['contracts', 'list', params] as const,
    detail: (id: string) => ['contracts', 'detail', id] as const,
  },

  // ── QUOTES ──────────────────────────────────────────────────────────────────
  quotes: {
    all: () => ['quotes'] as const,
    list: (params?: { status?: string }) => ['quotes', 'list', params] as const,
    detail: (id: string) => ['quotes', 'detail', id] as const,
  },

  // ── DISPUTES ────────────────────────────────────────────────────────────────
  disputes: {
    all: () => ['disputes'] as const,
    myList: () => ['disputes', 'my'] as const,
    detail: (id: string) => ['disputes', 'detail', id] as const,
    // Admin
    adminList: (params?: { status?: string; priority?: string }) =>
      ['disputes', 'admin', 'list', params] as const,
    adminStats: () => ['disputes', 'admin', 'stats'] as const,
  },

  // ── PAYMENTS ────────────────────────────────────────────────────────────────
  payments: {
    all: () => ['payments'] as const,
    list: () => ['payments', 'list'] as const,
    detail: (id: string) => ['payments', 'detail', id] as const,
  },

  // ── PROVIDER ────────────────────────────────────────────────────────────────
  provider: {
    profile: () => ['provider', 'profile'] as const,
    onboardingStatus: () => ['provider', 'onboarding-status'] as const,
    services: (params?: { status?: string }) =>
      ['provider', 'services', params] as const,
    serviceDetail: (id: string) => ['provider', 'service', id] as const,
    earnings: {
      summary: () => ['provider', 'earnings', 'summary'] as const,
      details: () => ['provider', 'earnings', 'details'] as const,
      payments: () => ['provider', 'earnings', 'payments'] as const,
    },
    availability: () => ['provider', 'availability'] as const,
    inquiries: (params?: { status?: string }) =>
      ['provider', 'inquiries', params] as const,
    assets: () => ['provider', 'assets'] as const,
  },

  // ── WEDDING / PLANNING ──────────────────────────────────────────────────────
  wedding: {
    mine: () => ['wedding', 'me'] as const,
    statistics: (id: string) => ['wedding', 'statistics', id] as const,
    dashboardSummary: (id: string) => ['wedding', 'dashboard-summary', id] as const,
    budgetCategories: (id: string) => ['wedding', 'budget-categories', id] as const,
    budgetStatistics: (id: string) => ['wedding', 'budget-statistics', id] as const,
    categoryInsights: (id: string) => ['wedding', 'category-insights', id] as const,
    tasks: () => ['wedding', 'tasks'] as const,
    taskStats: () => ['wedding', 'task-stats'] as const,
    guests: (id: string) => ['wedding', 'guests', id] as const,
    invitations: (id: string) => ['wedding', 'invitations', id] as const,
    website: (id: string) => ['wedding', 'website', id] as const,
    customDomain: (id: string) => ['wedding', 'custom-domain', id] as const,
    gifts: (id: string) => ['wedding', 'gifts', id] as const,
    giftsSummary: (id: string) => ['wedding', 'gifts-summary', id] as const,
    mcProgram: (id: string) => ['wedding', 'mc-program', id] as const,
    team: (id: string) => ['wedding', 'team', id] as const,
    guestbook: (id: string) => ['wedding', 'guestbook', id] as const,
    analytics: (id: string) => ['wedding', 'analytics', id] as const,
    announcements: (id: string) => ['wedding', 'announcements', id] as const,
    gallery: (id: string) => ['wedding', 'gallery', id] as const,
    events: (id: string) => ['wedding', 'events', id] as const,
    timeline: (id: string) => ['wedding', 'timeline', id] as const,
  },

  publicWebsite: (slug: string, preview?: string) =>
    ['public-website', slug, { preview }] as const,

  // ── EVENTS (provider-owned) ─────────────────────────────────────────────────
  events: {
    all: () => ['events'] as const,
    list: (status?: string) => ['events', 'list', { status }] as const,
    detail: (id: string) => ['events', 'detail', id] as const,
    ticketTypes: (eventId: string) => ['events', 'ticket-types', eventId] as const,
    tickets: (eventId: string) => ['events', 'tickets', eventId] as const,
    analytics: (eventId: string) => ['events', 'analytics', eventId] as const,
    inspectors: (eventId: string) => ['events', 'inspectors', eventId] as const,
  },

  // ── MESSAGES ────────────────────────────────────────────────────────────────
  messages: {
    conversations: () => ['messages', 'conversations'] as const,
    history: (userId: string) => ['messages', 'history', userId] as const,
    unreadCount: () => ['messages', 'unread-count'] as const,
  },

  // ── ADMIN ───────────────────────────────────────────────────────────────────
  admin: {
    stats: () => ['admin', 'stats'] as const,
    recentActivity: () => ['admin', 'recent-activity'] as const,
    revenueAnalytics: (period?: string) =>
      ['admin', 'analytics', 'revenue', { period }] as const,
    userAnalytics: () => ['admin', 'analytics', 'users'] as const,
    users: (params?: object) => ['admin', 'users', params] as const,
    userDetail: (id: string) => ['admin', 'user', id] as const,
    providers: (params?: object) => ['admin', 'providers', params] as const,
    providerDetail: (id: string) => ['admin', 'provider', id] as const,
    onboarding: (params?: object) => ['admin', 'onboarding', params] as const,
    onboardingStats: () => ['admin', 'onboarding', 'stats'] as const,
    systemSettings: () => ['admin', 'system-settings'] as const,
    categories: () => ['admin', 'categories'] as const,
  },

  // ── REVIEWS ─────────────────────────────────────────────────────────────────
  reviews: {
    mine: () => ['reviews', 'my'] as const,
    byService: (serviceId: string) => ['reviews', 'service', serviceId] as const,
    byUser: (userId: string) => ['reviews', 'user', userId] as const,
  },

  // ── CUSTOMER TICKETS ────────────────────────────────────────────────────────
  tickets: {
    mine: () => ['tickets', 'my'] as const,
    detail: (id: string) => ['tickets', 'detail', id] as const,
  },
} as const;
