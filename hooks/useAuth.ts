'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, tokenManager, userManager } from '../lib/auth';
import { LoginRequest, RegisterRequest, User } from '../lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
};

// Custom hook for authentication state
export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Get current user
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      if (!tokenManager.isAuthenticated()) {
        return null;
      }

      const response = await authApi.getMe();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
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
      const { user, accessToken, refreshToken } = data.data;

      // Store tokens
      tokenManager.setTokens(accessToken, refreshToken);

      let finalUser = user;

      // If user data is missing from login response (common with some backends), fetch it
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
        // Update query cache
        queryClient.setQueryData(authKeys.user(), finalUser);
      }

      toast.success('Login successful!');

      // Redirect to appropriate dashboard based on user role
      if (finalUser?.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (finalUser?.role === 'service_provider') {
        // Redirect unverified providers to onboarding
        if (!finalUser?.is_verified) {
          router.push('/provider/dashboard?tab=onboarding');
        } else {
          router.push('/provider/dashboard');
        }
      } else {
        router.push('/customer/dashboard');
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
        queryClient.setQueryData(authKeys.user(), updatedUser);
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

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response = await authApi.getMe();
      const updatedUser = response.data;
      if (updatedUser) {
        userManager.setUser(updatedUser);
        queryClient.setQueryData(authKeys.user(), updatedUser);
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

    // Mutation states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    isSendingResetEmail: forgotPasswordMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,

    // Utility functions
    refreshUser,
  };
};

// Hook for user profile
export const useUserProfile = () => {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: authApi.getProfile,
    enabled: tokenManager.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
