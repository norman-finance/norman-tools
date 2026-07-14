"use client";

import { LOCALES, type Locale } from "@/lib/locale";

const LOCALE_LABELS: Record<Locale, string> = {
  de: "DE",
  en: "EN",
  ru: "RU",
};

interface SiteHeaderProps {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  appSlug: string;
  repoUrl: string;
}

export function SiteHeader({ locale, onLocaleChange, appSlug, repoUrl }: SiteHeaderProps) {
  return (
    <header className="tool-header">
      <a
        className="tool-header-brand"
        href={`https://norman.finance/?utm_source=github&utm_medium=free_tools&utm_campaign=${appSlug}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Norman"
      >
        <img src="/norman-logo.svg" alt="NORMAN" className="tool-header-logo" />
      </a>
      <div className="tool-header-actions">
        <div className="locale-switch" role="group" aria-label="Language">
          {LOCALES.map((l) => (
            <button
              key={l}
              type="button"
              className="locale-switch-button"
              aria-pressed={l === locale}
              onClick={() => onLocaleChange(l)}
            >
              {LOCALE_LABELS[l]}
            </button>
          ))}
        </div>
        <a className="tool-header-github" href={repoUrl} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
      </div>
    </header>
  );
}
