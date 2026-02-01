'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translationService } from '@/lib/i18n/translation-service';

interface I18nContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (text: string) => Promise<string>;
  tSync: (text: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children, defaultLanguage = 'en' }: { children: React.ReactNode; defaultLanguage?: string }) {
  const [language, setLanguageState] = useState(defaultLanguage);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Load language from localStorage after hydration
    const savedLanguage = localStorage.getItem('app_language');
    if (savedLanguage && savedLanguage !== language) {
      setLanguageState(savedLanguage);
    }
    translationService.init(language);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      translationService.setLanguage(language);
      if (typeof window !== 'undefined') {
        localStorage.setItem('app_language', language);
      }
    }
  }, [language, isInitialized]);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
  };

  const t = async (text: string) => translationService.translate(text);
  const tSync = (text: string) => translationService.translateSync(text);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, tSync }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
}
