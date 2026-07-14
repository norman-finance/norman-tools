"use client";

import { useEffect, useState } from "react";
import { EInvoiceGenerator } from "@/components/e-invoice-generator";
import { Hero } from "@/components/shell/hero";
import { SiteFooter } from "@/components/shell/site-footer";
import { SiteHeader } from "@/components/shell/site-header";
import { persistLocale, resolveInitialLocale, type Locale } from "@/lib/locale";

const APP_SLUG = "e-invoice-generator";
const REPO_URL = "https://github.com/norman-finance/norman-tools";

const HERO_COPY: Record<Locale, { title: string; subtitle: string; cta: string }> = {
  de: {
    title: "Kostenlose E-Rechnung erstellen",
    subtitle:
      "Kostenlose Software zum Erstellen konformer E-Rechnungen. ZUGFeRD-PDF generieren und herunterladen. Keine Anmeldung. Keine Wasserzeichen. 100% kostenlos.",
    cta: "Rechnung erstellen",
  },
  en: {
    title: "Create e-invoices for free",
    subtitle:
      "Free software to create compliant e-invoices. Generate and download ZUGFeRD PDF e-invoices. No sign-up. No watermarks. 100% free.",
    cta: "Create invoice",
  },
  ru: {
    title: "Создайте e-invoice бесплатно",
    subtitle:
      "Бесплатный инструмент для создания соответствующих e-invoice. Генерируйте и скачивайте ZUGFeRD PDF. Без регистрации. Без водяных знаков. 100% бесплатно.",
    cta: "Создать счёт",
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
          cta={{ label: hero.cta, href: "#generator" }}
        />
        <EInvoiceGenerator locale={locale} />
      </main>
      <SiteFooter appSlug={APP_SLUG} repoUrl={REPO_URL} />
    </>
  );
}
