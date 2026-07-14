// Invoice content translations (independent from UI translations)

// Translation cache to avoid repeated imports
const translationCache: { [key: string]: any } = {};

// Helper function to load invoice translations
const loadInvoiceTranslations = async (language: string) => {
  if (translationCache[language]) {
    return translationCache[language];
  }

  try {
    const translations = await import(`../locales/invoice/${language}.json`);
    translationCache[language] = translations.default;
    return translations.default;
  } catch (error) {
    console.error(`Failed to load invoice translations for language: ${language}`, error);
    // Fallback to English
    if (language !== 'en') {
      return loadInvoiceTranslations('en');
    }
    return {};
  }
};

// Function to get translation function for invoice content
export const getInvoiceTranslationFunction = async (language: 'en' | 'de') => {
  const translations = await loadInvoiceTranslations(language);
  
  // Return translation function
  const it = (key: string): string => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.log(`Invoice translation missing for key: ${key}`);
        return key; // Return the key if translation is missing
      }
    }
    
    return typeof value === 'string' ? value : key;
  };
  
  return it;
};

// Helper function to get a specific invoice translation
export const getInvoiceTranslation = async (key: string, language: 'en' | 'de'): Promise<string> => {
  const it = await getInvoiceTranslationFunction(language);
  return it(key);
}; 