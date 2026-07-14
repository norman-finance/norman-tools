export type Locale = "de" | "en" | "ru";

export const LOCALES: Locale[] = ["de", "en", "ru"];

const STORAGE_KEY = "tool_locale";

export function isLocale(value: string | null): value is Locale {
  return value === "de" || value === "en" || value === "ru";
}

/** Resolve the initial locale: URL ?lang= param → localStorage → default. */
export function resolveInitialLocale(defaultLocale: Locale = "de"): Locale {
  if (typeof window === "undefined") return defaultLocale;

  const urlLang = new URLSearchParams(window.location.search).get("lang");
  if (isLocale(urlLang)) return urlLang;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) return stored;
  } catch {
    // localStorage unavailable (e.g. blocked) — fall through
  }

  return defaultLocale;
}

/** Persist the locale to localStorage and reflect it in the URL ?lang= param. */
export function persistLocale(locale: Locale) {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // ignore
  }

  const url = new URL(window.location.href);
  url.searchParams.set("lang", locale);
  window.history.replaceState({}, "", url.toString());
}
