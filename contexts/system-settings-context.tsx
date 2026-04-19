"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

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
  logoUrl: "/logo.png",
  homeHeroImageUrl: "/grom.jpg",
  authBackgroundImageUrl: "/grom.jpg",
  contactEmail: "support@vownest.rw",
  contactPhone: "+250 788 000 000",
  contactLocationLine1: "Kigali, Rwanda",
  contactLocationLine2: "KN 2 Rd, Nyarugenge",
};

interface SystemSettingsContextType {
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  resetSettings: () => void;
}

const SystemSettingsContext = createContext<SystemSettingsContextType | undefined>(undefined);

export function SystemSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadSettings() {
      try {
        const response = await apiClient.admin.systemSettings.get();
        if (mounted && response.data) {
          // Merge defaults with backend overrides
          setSettings(prev => ({ ...prev, ...response.data }));
        }
      } catch (e) {
        console.error("Failed to load global system settings from backend", e);
      } finally {
        if (mounted) {
          setMounted(true);
        }
      }
    }

    loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  const updateSettings = async (newSettings: Partial<SystemSettings>) => {
    const updated = { ...settings, ...newSettings };
    // Optimistically update
    setSettings(updated);
    
    // Push silently to the database backend
    try {
      await apiClient.admin.systemSettings.update(updated);
    } catch (e) {
      console.error("Failed to persist system settings to backend", e);
    }
  };

  const resetSettings = async () => {
    setSettings(defaultSettings);
    try {
      await apiClient.admin.systemSettings.update(defaultSettings);
    } catch (e) {
      console.error("Failed to reset system settings on backend", e);
    }
  };

  // Only render children when mounted if relying on local storage to prevent hydration mismatch
  if (!mounted) {
    // Return children with default settings initially to prevent layout flash on SSR
    return (
      <SystemSettingsContext.Provider value={{ settings: defaultSettings, updateSettings, resetSettings }}>
        {children}
      </SystemSettingsContext.Provider>
    );
  }

  return (
    <SystemSettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
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
