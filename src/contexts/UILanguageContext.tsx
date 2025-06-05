'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

  // Load saved language preference on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('uiLanguage');
    if (savedLanguage === 'en' || savedLanguage === 'de') {
      setUILanguageState(savedLanguage);
    }
  }, []);

  const setUILanguage = (language: 'en' | 'de') => {
    setUILanguageState(language);
    localStorage.setItem('uiLanguage', language);
  };

  // Translation function with nested key support
  const t = (key: string): string => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.log(`Translation missing for key: ${key}`);
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