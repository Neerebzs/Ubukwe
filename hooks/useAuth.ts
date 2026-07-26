'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, tokenManager, userManager, googleSignupPending } from '../lib/auth';
import { LoginRequest, RegisterRequest, User } from '../lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { initiateGoogleLogin } from '@/lib/googleOAuth';
import { trackEvent, AnalyticsEvent } from '@/lib/analytics';

// ═══════════════════════════════════════════════════════════════════════════
// ROLE VALIDATION CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════
// Only these 3 roles can access dashboards:
const VALID_ROLES = {
  ADMIN: 'admin',
  SERVICE_PROVIDER: 'service_provider',
  EVENT_OWNER: 'event_owner',
} as const;

// Type for valid roles
type ValidRole = typeof VALID_ROLES[keyof typeof VALID_ROLES];

/**
 * Checks if a role is valid for dashboard access.
 * 
 * Valid roles:
 * - 'admin' → Admin dashboard
 * - 'service_provider' → Provider dashboard
 * - 'event_owner' → Customer dashboard
 * 
 * Any other role is INVALID. Public signup only allows event_owner or service_provider.
 */
function isValidRole(role: string | undefined | null): role is ValidRole {
  if (!role) return false;
  return (
    role === VALID_ROLES.ADMIN ||
    role === VALID_ROLES.SERVICE_PROVIDER ||
    role === VALID_ROLES.EVENT_OWNER
  );
}

/**
 * Gets the correct dashboard path for a valid role.
 * Returns null if role is invalid.
 */
function getDashboardPath(user: User | null | undefined): string | null {
  if (!user || !isValidRole(user.role)) {
    return null;
  }

  switch (user.role) {
    case VALID_ROLES.ADMIN:
      return '/admin/dashboard';
    case VALID_ROLES.SERVICE_PROVIDER:
      return user.is_verified ? '/provider/dashboard' : '/provider/dashboard?tab=onboarding';
    case VALID_ROLES.EVENT_OWNER:
      return '/customer/dashboard';
    default:
      return null;
  }
}
// ═══════════════════════════════════════════════════════════════════════════

// Query keys — backward-compatible shim.
// Components that imported `authKeys.user()` continue to work unchanged.
import { queryKeys, profileQueryOptions } from '@/lib/cache';

export const authKeys = {
  all: queryKeys.auth,
  user: () => queryKeys.auth.user(),
  profile: () => queryKeys.auth.profile(),
  twoFAStatus: () => queryKeys.auth.twoFAStatus(),
};

// Convenience shorthand for auth keys used throughout this file
const authQueryKeys = queryKeys.auth;

// Custom hook for authentication state
export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Get current user
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: authQueryKeys.user(),
    queryFn: async () => {
      if (!tokenManager.isAuthenticated()) {
        return null;
      }

      const response = await authApi.getMe();
      return response.data;
    },
    ...profileQueryOptions,
  });

  const isAuthenticated = !!user && tokenManager.isAuthenticated();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    retry: (failureCount, error: any) => {
      // Retry up to 3 times for timeout/network errors only
      if (failureCount < 3) {
        const isRetryableError =
          error.message?.includes('timeout') ||
          error.message?.includes('Network error') ||
          error.code === 'ECONNABORTED' ||
          error.code === 'NETWORK_ERROR';

        if (isRetryableError) {
          console.log(`Retrying login (attempt ${failureCount + 1}/3)...`);
          return true;
        }
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff
    onSuccess: async (data) => {
      // Raw backend response shape: { status, message, data: { two_factor_required?, pre_auth_token?, access_token?, user? } }
      const payload = data?.data ?? data as any;

      // 2FA required — don't issue tokens yet, just return so the caller can show the panel
      if (payload?.two_factor_required) {
        return; // caller (handleEmailSubmit) checks the return value for this
      }

      const accessToken = payload?.accessToken ?? payload?.access_token;
      const refreshToken = payload?.refreshToken ?? payload?.refresh_token ?? accessToken;
      const userFromPayload = payload?.user;

      if (!accessToken) {
        toast.error('Login failed. No token received.');
        return;
      }

      // Store tokens
      tokenManager.setTokens(accessToken, refreshToken);

      let finalUser = userFromPayload;

      // If user data is missing from login response, fetch it
      if (!finalUser) {
        try {
          const response = await authApi.getMe();
          finalUser = response.data;
        } catch (error) {
          console.error('Failed to fetch user after login:', error);
        }
      }

      if (finalUser) {
        userManager.setUser(finalUser);
        queryClient.setQueryData(authQueryKeys.user(), finalUser);
      }

      toast.success('Login successful!');

      // Track analytics
      trackEvent(AnalyticsEvent.LOGIN, {
        userId: finalUser?.id,
        userRole: finalUser?.role,
      });

      // ═══════════════════════════════════════════════════════════════════════
      // STRICT ROLE VALIDATION: Redirect to appropriate dashboard
      // ═══════════════════════════════════════════════════════════════════════
      const dashboardPath = getDashboardPath(finalUser);
      
      if (dashboardPath) {
        router.push(dashboardPath);
      } else {
        // BLOCK: Invalid role - should never happen for email login but handle edge case
        console.error(`Invalid role detected: ${finalUser?.role}. Only 'admin', 'service_provider', or 'event_owner' allowed.`);
        toast.error('Invalid user role. Please contact support.');
        tokenManager.clearTokens();
        userManager.clearUser();
      }
    },
    onError: (error: Error) => {
      console.error('Login error details:', error);

      // Use the error message from the API response
      const errorMessage = error.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success('Registration successful! Please sign in.');

      // Redirect to login page after registration
      router.push('/auth/signin');
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear auth data
      tokenManager.clearTokens();
      userManager.clearUser();

      // Clear query cache
      queryClient.clear();

      toast.success('Logged out successfully');
      router.push('/auth/signin');
    }, 
    onError: (error: Error) => {
      // Even if logout fails on server, clear local data
      tokenManager.clearTokens();
      userManager.clearUser();
      queryClient.clear();

      toast.error(error.message || 'Logout failed');
      router.push('/auth/signin');
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (data) => {
      const updatedUser = data.data;

      // Update user data
      if (updatedUser) {
        userManager.setUser(updatedUser);
        queryClient.setQueryData(authQueryKeys.user(), updatedUser);
      }

      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Profile update failed');
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Password change failed');
    },
  });

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => {
      toast.success('Password reset email sent');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send reset email');
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      toast.success('Password reset successfully');
      router.push('/auth/signin');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Password reset failed');
    },
  });

  // ── Google OAuth Login ─────────────────────────────────────────────────────

  const googleLoginMutation = useMutation({
    mutationFn: async (opts?: {
      _codeOverride?: string;
      role?: 'event_owner' | 'service_provider';
      google_signup_token?: string;
    }): Promise<{
      requiresTwoFactor: boolean;
      needsRoleSelection?: boolean;
      googleSignupToken?: string;
      preAuthToken?: string;
      accountCreated?: boolean;
      user?: any;
    }> => {
      // Complete deferred Google signup after role selection
      if (opts?.google_signup_token) {
        if (!opts.role) {
          throw new Error('Please select whether you are a Customer or an Artisan.');
        }
        const response = await authApi.googleLogin({
          google_signup_token: opts.google_signup_token,
          role: opts.role,
        });
        const data = response.data ?? response;
        const accessToken = data?.access_token ?? data?.accessToken;
        const refreshToken = data?.refresh_token ?? data?.refreshToken ?? accessToken;
        const user = data?.user;
        if (!accessToken) throw new Error('No access token received from Google signup.');
        googleSignupPending.clear();
        tokenManager.setTokens(accessToken, refreshToken);
        if (user) {
          userManager.setUser(user);
          queryClient.setQueryData(authQueryKeys.user(), user);
        }
        return { requiresTwoFactor: false, user, accountCreated: true };
      }

      // Step 1: Get authorization code — override (after full-page return) or redirect to Google
      let code: string;
      if (opts?._codeOverride) {
        code = opts._codeOverride;
      } else {
        // Full-page redirect — this promise does not settle; page unloads.
        await initiateGoogleLogin({ role: opts?.role });
        throw new Error('Redirecting to Google…');
      }

      // Step 2: Exchange code with backend (role optional for existing users; required for new)
      const response = await authApi.googleLogin({
        code,
        role: opts?.role,
      });
      // apiClient wraps as { status, data: backendPayload } — also accept flat backendPayload
      const raw = response?.data ?? response;
      const data = raw?.needs_role_selection || raw?.google_signup_token || raw?.access_token
        ? raw
        : (raw?.data ?? raw);

      const needsRole =
        data?.needs_role_selection === true ||
        data?.needsRoleSelection === true ||
        Boolean(data?.google_signup_token || data?.googleSignupToken);

      // New Google profile with no local account — continue into account creation
      if (needsRole && (data?.google_signup_token || data?.googleSignupToken || data?.needs_role_selection)) {
        const googleSignupToken =
          data.google_signup_token || data.googleSignupToken || '';
        const profile = data.user ?? null;

        if (!googleSignupToken) {
          throw new Error(
            'Google verified your account, but role setup could not start. Please try again.'
          );
        }

        googleSignupPending.save({ googleSignupToken, user: profile });

        return {
          requiresTwoFactor: false,
          needsRoleSelection: true,
          googleSignupToken,
          user: profile,
        };
      }

      // Step 3a: 2FA required → return pre_auth_token for caller to handle
      if (data?.two_factor_required) {
        return {
          requiresTwoFactor: true,
          preAuthToken: data.pre_auth_token,
          user: data.user,
        };
      }

      // Step 3b: No 2FA — process tokens immediately
      const accessToken = data?.access_token ?? data?.accessToken;
      const refreshToken = data?.refresh_token ?? data?.refreshToken ?? accessToken;
      const user = data?.user;

      if (!accessToken) throw new Error('No access token received from Google login.');

      googleSignupPending.clear();
      tokenManager.setTokens(accessToken, refreshToken);

      let finalUser = user;
      if (!finalUser) {
        try {
          const r = await authApi.getMe();
          finalUser = r.data;
        } catch {}
      }

      if (finalUser) {
        userManager.setUser(finalUser);
        queryClient.setQueryData(authQueryKeys.user(), finalUser);
      }

      return { requiresTwoFactor: false, user: finalUser };
    },
    onSuccess: (result) => {
      if (result.requiresTwoFactor) {
        trackEvent(AnalyticsEvent.GOOGLE_LOGIN, {
          userId: result.user?.id,
          twoFactorRequired: true,
        });
        return;
      }

      if (result.needsRoleSelection) {
        trackEvent(AnalyticsEvent.GOOGLE_LOGIN, {
          onboardingRequired: true,
          isNewUser: true,
        });
        // Persist already done in mutationFn; notify sign-in UI to open the role panel
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('google-signup-pending'));
        }
        toast.success("Welcome! Choose your role to create your account.");
        return;
      }

      const finalUser = result.user;

      trackEvent(AnalyticsEvent.GOOGLE_LOGIN, {
        userId: finalUser?.id,
        userRole: finalUser?.role,
        accountCreated: !!result.accountCreated,
      });

      toast.success(
        result.accountCreated
          ? 'Account created successfully!'
          : 'Signed in with Google!'
      );

      const dashboardPath = getDashboardPath(finalUser);
      
      if (dashboardPath) {
        router.push(dashboardPath);
      } else {
        console.error(`Invalid role detected: ${finalUser?.role}. Only 'admin', 'service_provider', or 'event_owner' allowed.`);
        toast.error('Invalid user role. Please complete your profile setup.');
        tokenManager.clearTokens();
        userManager.clearUser();
        return;
      }
    },
    onError: (error: Error) => {
      const msg = error.message || 'Google sign-in failed.';
      if (msg === 'Google sign-in was cancelled.') return; // User closed popup
      toast.error(msg);
    },
  });

  // ── 2FA Login ─────────────────────────────────────────────────────────────

  const twoFALoginMutation = useMutation({
    mutationFn: async ({
      preAuthToken,
      code,
    }: {
      preAuthToken: string;
      code: string;
    }) => {
      const response = await authApi.verify2FALogin(preAuthToken, code);
      const data = response.data ?? response;

      const accessToken = data?.access_token ?? data?.accessToken;
      const refreshToken = data?.refresh_token ?? data?.refreshToken ?? accessToken;
      const user = data?.user;

      if (!accessToken) throw new Error('No token received after 2FA verification.');

      tokenManager.setTokens(accessToken, refreshToken);

      let finalUser = user;
      if (!finalUser) {
        try {
          const r = await authApi.getMe();
          finalUser = r.data;
        } catch {}
      }

      if (finalUser) {
        userManager.setUser(finalUser);
        queryClient.setQueryData(authQueryKeys.user(), finalUser);
      }

      return finalUser;
    },
    onSuccess: (finalUser) => {
      toast.success('Two-factor authentication verified!');
      trackEvent(AnalyticsEvent.LOGIN, {
        userId: finalUser?.id,
        userRole: finalUser?.role,
        method: '2fa',
      });

      // ═══════════════════════════════════════════════════════════════════════
      // STRICT ROLE VALIDATION: Redirect based on role
      // ═══════════════════════════════════════════════════════════════════════
      const dashboardPath = getDashboardPath(finalUser);
      
      if (dashboardPath) {
        router.push(dashboardPath);
      } else {
        // BLOCK: Invalid role
        console.error(`Invalid role detected: ${finalUser?.role}. Only 'admin', 'service_provider', or 'event_owner' allowed.`);
        toast.error('Invalid user role. Please contact support.');
        tokenManager.clearTokens();
        userManager.clearUser();
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Invalid verification code.');
    },
  });

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response = await authApi.getMe();
      const updatedUser = response.data;
      if (updatedUser) {
        userManager.setUser(updatedUser);
        queryClient.setQueryData(authQueryKeys.user(), updatedUser);
      }
      return updatedUser;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  return {
    // State
    user,
    isAuthenticated,
    isLoading: isUserLoading,

    // Mutations
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    changePassword: changePasswordMutation.mutateAsync,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,
    // Google OAuth
    loginWithGoogle: googleLoginMutation.mutateAsync,
    // 2FA
    verifyTwoFactor: twoFALoginMutation.mutateAsync,

    // Mutation states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    isSendingResetEmail: forgotPasswordMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    isGoogleLoggingIn: googleLoginMutation.isPending,
    isVerifyingTwoFactor: twoFALoginMutation.isPending,

    // Utility functions
    refreshUser,
  };
};

// Hook for user profile
export const useUserProfile = () => {
  return useQuery({
    queryKey: authQueryKeys.profile(),
    queryFn: authApi.getProfile,
    enabled: tokenManager.isAuthenticated(),
    ...profileQueryOptions,
  });
};
