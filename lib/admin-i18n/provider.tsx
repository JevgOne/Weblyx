'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminTranslations, AdminLocale, AdminTranslations } from './translations';

const STORAGE_KEY = 'admin-language';
const DEFAULT_LOCALE: AdminLocale = 'cs';

interface AdminLanguageContextType {
  locale: AdminLocale;
  setLocale: (locale: AdminLocale) => void;
  t: AdminTranslations;
}

const AdminLanguageContext = createContext<AdminLanguageContextType | undefined>(undefined);

export function AdminLanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AdminLocale>(DEFAULT_LOCALE);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load saved language from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as AdminLocale | null;
    if (saved && ['cs', 'en', 'ru'].includes(saved)) {
      setLocaleState(saved);
    }
    setIsHydrated(true);
  }, []);

  // Save language to localStorage when changed
  const setLocale = useCallback((newLocale: AdminLocale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
  }, []);

  const t = adminTranslations[locale] as AdminTranslations;

  // Prevent hydration mismatch by showing nothing until hydrated
  if (!isHydrated) {
    return null;
  }

  return (
    <AdminLanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </AdminLanguageContext.Provider>
  );
}

export function useAdminLanguage() {
  const context = useContext(AdminLanguageContext);
  if (context === undefined) {
    throw new Error('useAdminLanguage must be used within an AdminLanguageProvider');
  }
  return context;
}

// Shorthand hook for translations only
export function useAdminTranslation() {
  const { t, locale } = useAdminLanguage();
  return { t, locale };
}
