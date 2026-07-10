"use client";

/**
 * System Settings Context
 *
 * CACHING STRATEGY:
 * System settings (logo, hero image, contact info) are quasi-static data.
 * They change only when an admin explicitly updates them, so we can safely
 * use a long staleTime (1 hour) to avoid redundant API calls on every page
 * visit. After an admin update, `invalidateSystemSettings()` busts the cache
 * and every consumer re-fetches automatically — no manual refresh required.
 */

import React, { createContext, useContext } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { queryKeys, staticQueryOptions, invalidateSystemSettings } from '@/lib/cache';

export interface SystemSettings {
  logoUrl: string;
  homeHeroImageUrl: string;
  authBackgroundImageUrl: string;
  contactEmail: string;
  contactPhone: string;
  contactLocationLine1: string;
  contactLocationLine2: string;
}

const defaultSettings: SystemSettings = {
  logoUrl: "",
  homeHeroImageUrl: "",
  authBackgroundImageUrl: "",
  contactEmail: "",
  contactPhone: "",
  contactLocationLine1: "",
  contactLocationLine2: "",
};

interface SystemSettingsContextType {
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  isLoading: boolean;
}

const SystemSettingsContext = createContext<SystemSettingsContextType | undefined>(undefined);

export function SystemSettingsProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  // Fetch system settings — static cache, 1-hour staleTime
  const { data: settings = defaultSettings, isLoading } = useQuery<SystemSettings>({
    queryKey: queryKeys.public.systemSettings(),
    queryFn: async () => {
      const response = await apiClient.admin.systemSettings.get();
      // Backend wraps response as { success: true, data: { logoUrl, ... } }
      const payload = (response.data as any)?.data ?? response.data;
      return payload ? { ...defaultSettings, ...payload } : defaultSettings;
    },
    // System settings rarely change — serve from cache for 1 hour
    ...staticQueryOptions,
  });

  /**
   * Persist updated settings and immediately bust the local cache so all
   * consumers re-render with the new values — no reload needed.
   */
  const updateSettings = async (newSettings: Partial<SystemSettings>) => {
    const updated = { ...settings, ...newSettings };

    // Optimistic update — paint the new values immediately
    queryClient.setQueryData<SystemSettings>(
      queryKeys.public.systemSettings(),
      updated,
    );

    try {
      const response = await apiClient.admin.systemSettings.update(updated);
      const saved = (response.data as any)?.data ?? null;

      if (saved) {
        // Sync with the value the server actually persisted
        queryClient.setQueryData<SystemSettings>(
          queryKeys.public.systemSettings(),
          { ...defaultSettings, ...saved },
        );
      }

      // Bust both admin and public caches so all pages reflect the change
      invalidateSystemSettings(queryClient);
    } catch (e) {
      // Rollback on failure
      queryClient.setQueryData(queryKeys.public.systemSettings(), settings);
      console.error("Failed to persist system settings to backend", e);
      throw e;
    }
  };

  /**
   * Reset all settings to defaults and persist to the backend.
   */
  const resetSettings = async () => {
    // Optimistic update
    queryClient.setQueryData(queryKeys.public.systemSettings(), defaultSettings);

    try {
      await apiClient.admin.systemSettings.update(defaultSettings);
      invalidateSystemSettings(queryClient);
    } catch (e) {
      // Rollback on failure
      queryClient.setQueryData(queryKeys.public.systemSettings(), settings);
      console.error("Failed to reset system settings on backend", e);
      throw e;
    }
  };

  return (
    <SystemSettingsContext.Provider value={{ settings, updateSettings, resetSettings, isLoading }}>
      {children}
    </SystemSettingsContext.Provider>
  );
}

export function useSystemSettings() {
  const context = useContext(SystemSettingsContext);
  if (context === undefined) {
    throw new Error('useSystemSettings must be used within a SystemSettingsProvider');
  }
  return context;
}
