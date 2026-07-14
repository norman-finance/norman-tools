// Helper functions for URL parameter management

export const getUrlParam = (param: string): string | null => {
  if (typeof window === 'undefined') return null;
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

export const updateUrlParam = (param: string, value: string) => {
  if (typeof window === 'undefined') return;
  
  const url = new URL(window.location.href);
  url.searchParams.set(param, value);
  
  // Update URL without page reload
  window.history.replaceState({}, '', url.toString());
};

export const removeUrlParam = (param: string) => {
  if (typeof window === 'undefined') return;
  
  const url = new URL(window.location.href);
  url.searchParams.delete(param);
  
  // Update URL without page reload
  window.history.replaceState({}, '', url.toString());
};

export const getCurrentUrl = (): string => {
  if (typeof window === 'undefined') return '';
  return window.location.href;
};

export const generateShareableUrl = (uiLang: 'en' | 'de', invoiceLang: 'en' | 'de'): string => {
  if (typeof window === 'undefined') return '';
  
  const url = new URL(window.location.href);
  url.searchParams.set('ui_lang', uiLang);
  url.searchParams.set('invoice_lang', invoiceLang);
  
  return url.toString();
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  }
}; 