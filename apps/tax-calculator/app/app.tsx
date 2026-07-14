"use client";

import { useEffect, useState } from "react";
import { TaxCalculatorSection } from "@/components/tax-calculator";
import { Hero } from "@/components/shell/hero";
import { SiteFooter } from "@/components/shell/site-footer";
import { SiteHeader } from "@/components/shell/site-header";
import { CONTENT } from "@/lib/content";
import { persistLocale, resolveInitialLocale, type Locale } from "@/lib/locale";

const APP_SLUG = "tax-calculator";
const REPO_URL = "https://github.com/norman-finance/norman-tools";

export function App() {
  const [locale, setLocale] = useState<Locale>("de");

  useEffect(() => {
    setLocale(resolveInitialLocale("de"));
  }, []);

  const handleLocaleChange = (next: Locale) => {
    setLocale(next);
    persistLocale(next);
  };

  const content = CONTENT[locale];

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
          title={content.hero.title}
          subtitle={content.hero.subtitle}
          cta={{ label: content.hero.ctaLabel, href: content.hero.ctaHref }}
        />
        <TaxCalculatorSection {...content.calculator} />
      </main>
      <SiteFooter appSlug={APP_SLUG} repoUrl={REPO_URL} />
    </>
  );
}
