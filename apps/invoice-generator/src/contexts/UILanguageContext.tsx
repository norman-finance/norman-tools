'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUrlParam, updateUrlParam } from '@/utils/urlParams';

interface UILanguageContextType {
  uiLanguage: 'en' | 'de';
  setUILanguage: (language: 'en' | 'de') => void;
  t: (key: string) => string;
}

const UILanguageContext = createContext<UILanguageContextType | undefined>(undefined);

// Translation cache to avoid repeated imports
const translationCache: { [key: string]: any } = {};

// Helper function to load translations
const loadTranslations = async (language: string) => {
  if (translationCache[language]) {
    return translationCache[language];
  }

  try {
    const translations = await import(`../locales/ui/${language}.json`);
    translationCache[language] = translations.default;
    return translations.default;
  } catch (error) {
    console.error(`Failed to load UI translations for language: ${language}`, error);
    // Fallback to English
    if (language !== 'en') {
      return loadTranslations('en');
    }
    return {};
  }
};



export const UILanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [uiLanguage, setUILanguageState] = useState<'en' | 'de'>('en');
  const [translations, setTranslations] = useState<any>({});

  // Load translations when language changes
  useEffect(() => {
    const loadLanguageTranslations = async () => {
      const newTranslations = await loadTranslations(uiLanguage);
      setTranslations(newTranslations);
    };

    loadLanguageTranslations();
  }, [uiLanguage]);

  // Initialize language from URL params or localStorage on mount
  useEffect(() => {
    // Check URL parameter first (priority: URL > localStorage > default)
    const urlLang = getUrlParam('ui_lang') || getUrlParam('uiLang');
    if (urlLang === 'en' || urlLang === 'de') {
      setUILanguageState(urlLang);
      // Also save to localStorage for future visits
      localStorage.setItem('uiLanguage', urlLang);
      return;
    }

    // Fallback to localStorage
    const savedLanguage = localStorage.getItem('uiLanguage');
    if (savedLanguage === 'en' || savedLanguage === 'de') {
      setUILanguageState(savedLanguage);
      // Update URL to reflect current language
      updateUrlParam('ui_lang', savedLanguage);
    } else {
      // Default to English and update URL
      updateUrlParam('ui_lang', 'en');
    }
  }, []);

  const setUILanguage = (language: 'en' | 'de') => {
    setUILanguageState(language);
    localStorage.setItem('uiLanguage', language);
    // Update URL parameter
    updateUrlParam('ui_lang', language);
  };

  // Translation function with nested key support
  const t = (key: string): string => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return the key if translation is missing
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <UILanguageContext.Provider value={{ uiLanguage, setUILanguage, t }}>
      {children}
    </UILanguageContext.Provider>
  );
};

export const useUILanguage = () => {
  const context = useContext(UILanguageContext);
  if (context === undefined) {
    throw new Error('useUILanguage must be used within a UILanguageProvider');
  }
  return context;
}; 