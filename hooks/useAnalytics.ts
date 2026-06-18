/**
 * useAnalytics — React hook for tracking analytics events with user context.
 *
 * Automatically includes userId, userRole, and page from the current auth state.
 *
 * Usage:
 *   const { track, trackLogin, trackGoogleLogin, track2FAEnabled } = useAnalytics();
 *   track(AnalyticsEvent.VIEW_CARGO, { cargoId: '123' });
 */
'use client';

import { useCallback } from 'react';
import { trackEvent, trackPageView, AnalyticsEvent } from '@/lib/analytics';
import { tokenManager, userManager } from '@/lib/auth';

interface TrackOptions {
  [key: string]: unknown;
}

export function useAnalytics() {
  const getBaseProperties = useCallback(() => {
    const user = userManager.getUser();
    return {
      userId: user?.id ?? null,
      userRole: user?.role ?? null,
    };
  }, []);

  const track = useCallback(
    (event: AnalyticsEvent | string, options: TrackOptions = {}) => {
      trackEvent(event, { ...getBaseProperties(), ...options });
    },
    [getBaseProperties]
  );

  const page = useCallback(
    (url: string, options: TrackOptions = {}) => {
      trackPageView(url, { ...getBaseProperties(), ...options });
    },
    [getBaseProperties]
  );

  // ── Convenience auth event trackers ─────────────────────────────────────────

  const trackLogin = useCallback(
    (options: TrackOptions = {}) => track(AnalyticsEvent.LOGIN, options),
    [track]
  );

  const trackSignup = useCallback(
    (options: TrackOptions = {}) => track(AnalyticsEvent.SIGNUP, options),
    [track]
  );

  const trackGoogleLogin = useCallback(
    (options: TrackOptions = {}) => track(AnalyticsEvent.GOOGLE_LOGIN, options),
    [track]
  );

  const trackLogout = useCallback(
    (options: TrackOptions = {}) => track(AnalyticsEvent.LOGOUT, options),
    [track]
  );

  const track2FAEnabled = useCallback(
    (options: TrackOptions = {}) => track(AnalyticsEvent.ENABLE_2FA, options),
    [track]
  );

  const track2FADisabled = useCallback(
    (options: TrackOptions = {}) => track(AnalyticsEvent.DISABLE_2FA, options),
    [track]
  );

  return {
    track,
    page,
    trackLogin,
    trackSignup,
    trackGoogleLogin,
    trackLogout,
    track2FAEnabled,
    track2FADisabled,
  };
}
