import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Free E-Invoice Generator | German ZUGFeRD Invoices',
    template: '%s | Norman Tools'
  },
  description: 'Generate professional German e-invoices with ZUGFeRD compliance. Free invoice generator for freelancers and businesses. No registration required. | Erstellen Sie professionelle deutsche E-Rechnungen mit ZUGFeRD-Konformität. Kostenloser Rechnungsgenerator für Freelancer.',
  keywords: 'e-invoice generator, ZUGFeRD, German invoices, free invoice, PDF invoice, professional invoices, freelance invoices, E-Rechnung Generator, ZUGFeRD Rechnungen, deutsche Rechnungen, kostenlose Rechnung, PDF Rechnung, professionelle Rechnungen, Freelancer Rechnungen, Rechnung erstellen, Invoice erstellen',
  authors: [{ name: 'Norman Finance' }],
  creator: 'Norman Finance',
  publisher: 'Norman Finance',
  robots: 'index, follow',
  metadataBase: new URL('https://tools.norman.finance'),
  alternates: {
    canonical: '/erechnung',
    languages: {
      'en': '/erechnung',
      'de': '/erechnung?ui_lang=de',
      'x-default': '/erechnung',
    },
  },
  openGraph: {
    title: 'Free E-Invoice Generator | German ZUGFeRD Invoices - Norman Tools',
    description: 'Generate professional German e-invoices with ZUGFeRD compliance. Free invoice generator for freelancers and businesses. | Erstellen Sie professionelle deutsche E-Rechnungen.',
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['de_DE'],
    url: '/erechnung',
    siteName: 'Norman Tools',
    images: [
      {
        url: '/images/erechnung-og.png',
        width: 1200,
        height: 630,
        alt: 'Norman E-Invoice Generator - ZUGFeRD Compliant | Norman E-Rechnung Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free E-Invoice Generator | German ZUGFeRD Invoices',
    description: 'Generate professional German e-invoices with ZUGFeRD compliance. Free invoice generator. | Kostenloser E-Rechnung Generator.',
    creator: '@norman_finance',
  },
};

export default function ERechnungLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Hreflang tags for language alternates */}
      <link rel="alternate" hrefLang="en" href="https://tools.norman.finance/erechnung" />
      <link rel="alternate" hrefLang="de" href="https://tools.norman.finance/erechnung?ui_lang=de" />
      <link rel="alternate" hrefLang="x-default" href="https://tools.norman.finance/erechnung" />
      {children}
    </>
  );
} 