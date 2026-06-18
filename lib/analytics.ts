/**
 * Analytics utility — Google Tag Manager + GA4 event tracking.
 *
 * All events include:
 *   - userId, userRole, page, timestamp, browser, device, country (when available)
 *
 * Usage:
 *   import { trackEvent, AnalyticsEvent } from '@/lib/analytics';
 *   trackEvent(AnalyticsEvent.LOGIN, { userId: 'abc', userRole: 'event_owner' });
 */

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    gtag: (...args: unknown[]) => void;
  }
}

// ── Event name enum ───────────────────────────────────────────────────────────

export enum AnalyticsEvent {
  // Auth
  LOGIN = 'login',
  SIGNUP = 'signup',
  GOOGLE_LOGIN = 'google_login',
  LOGOUT = 'logout',
  ENABLE_2FA = 'enable_2fa',
  DISABLE_2FA = 'disable_2fa',

  // Wedding / Events
  CREATE_CARGO = 'create_cargo',
  CREATE_AUCTION = 'create_auction',
  BID_SUBMITTED = 'bid_submitted',
  AUCTION_WON = 'auction_won',
  PAYMENT_COMPLETED = 'payment_completed',
  CARGO_DELIVERED = 'cargo_delivered',

  // Profile / Preferences
  PROFILE_UPDATED = 'profile_updated',
  NOTIFICATION_READ = 'notification_read',

  // Search & Browse
  SEARCH_CARGO = 'search_cargo',
  SEARCH_TRUCK = 'search_truck',
  VIEW_CARGO = 'view_cargo',
  VIEW_AUCTION = 'view_auction',
  VIEW_BID = 'view_bid',

  // Navigation
  DASHBOARD_VIEWED = 'dashboard_viewed',
  PAGE_VIEW = 'page_view',

  // Errors
  ERROR_404 = 'error_404',
  AUTH_ERROR = 'auth_error',
}

// ── Context helpers ───────────────────────────────────────────────────────────

function getBrowserInfo(): string {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('OPR') || ua.includes('Opera')) return 'Opera';
  return 'Unknown';
}

function getDeviceType(): string {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
  return 'desktop';
}

function getPage(): string {
  if (typeof window === 'undefined') return '';
  return window.location.pathname;
}

// ── Core tracking function ────────────────────────────────────────────────────

interface EventProperties {
  userId?: string;
  userRole?: string;
  country?: string;
  [key: string]: unknown;
}

/**
 * Push a custom event to the GTM dataLayer.
 * Works whether GTM or GA4 is configured.
 */
export function trackEvent(
  eventName: AnalyticsEvent | string,
  properties: EventProperties = {}
): void {
  if (typeof window === 'undefined') return;

  const enrichedProperties = {
    event: eventName,
    page: properties.page ?? getPage(),
    timestamp: new Date().toISOString(),
    browser: getBrowserInfo(),
    device: getDeviceType(),
    userId: properties.userId ?? null,
    userRole: properties.userRole ?? null,
    country: properties.country ?? null,
    ...properties,
  };

  // Push to GTM dataLayer
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(enrichedProperties);

  // Also send to GA4 directly if gtag is available (GA4 without GTM)
  if (typeof window.gtag === 'function') {
    const { event: _e, ...params } = enrichedProperties;
    window.gtag('event', eventName, params);
  }
}

/**
 * Track a page view explicitly.
 * Call this in Next.js route change listeners or layout components.
 */
export function trackPageView(
  url: string,
  properties: EventProperties = {}
): void {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'page_view',
    page_path: url,
    page_title: typeof document !== 'undefined' ? document.title : '',
    page: url,
    timestamp: new Date().toISOString(),
    browser: getBrowserInfo(),
    device: getDeviceType(),
    ...properties,
  });

  if (typeof window.gtag === 'function') {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? '', {
      page_path: url,
    });
  }
}
