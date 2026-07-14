"use client";

import { useEffect, useState } from "react";
import { FinanzamtLetterAnalyzer } from "@/components/finanzamt-letter-analyzer";
import { Hero } from "@/components/shell/hero";
import { SiteFooter } from "@/components/shell/site-footer";
import { SiteHeader } from "@/components/shell/site-header";
import { persistLocale, resolveInitialLocale, type Locale } from "@/lib/locale";

const APP_SLUG = "tax-letter-assistant";
const REPO_URL = "https://github.com/norman-finance/norman-tools";

const HERO_COPY: Record<Locale, { title: string; subtitle: string; cta: string }> = {
  de: {
    title: "Kostenloser Finanzamt-Brief Assistent",
    subtitle:
      "Lade einen Brief vom Finanzamt hoch und erhalte sofort eine verständliche Zusammenfassung und Handlungsempfehlung. Kostenlos und ohne Anmeldung.",
    cta: "Brief analysieren",
  },
  en: {
    title: "Free Tax Letter Assistant",
    subtitle:
      "Upload a letter from the German tax office and get an instant plain-language summary with recommended actions. Free and no sign-up required.",
    cta: "Analyze letter",
  },
  ru: {
    title: "Бесплатный помощник по письмам из Finanzamt",
    subtitle:
      "Загрузите письмо из немецкого налогового управления и мгновенно получите понятное резюме с рекомендуемыми действиями. Бесплатно и без регистрации.",
    cta: "Проанализировать письмо",
  },
};

export function App() {
  const [locale, setLocale] = useState<Locale>("de");

  useEffect(() => {
    setLocale(resolveInitialLocale("de"));
  }, []);

  const handleLocaleChange = (next: Locale) => {
    setLocale(next);
    persistLocale(next);
  };

  const hero = HERO_COPY[locale];

  return (
    <>
      <SiteHeader
        locale={locale}
        onLocaleChange={handleLocaleChange}
        appSlug={APP_SLUG}
        repoUrl={REPO_URL}
      />
      <main>
        <Hero
          title={hero.title}
          subtitle={hero.subtitle}
          cta={{ label: hero.cta, href: "#analyzer" }}
        />
        <FinanzamtLetterAnalyzer locale={locale} />
      </main>
      <SiteFooter appSlug={APP_SLUG} repoUrl={REPO_URL} />
    </>
  );
}
