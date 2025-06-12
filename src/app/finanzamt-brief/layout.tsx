import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Free Finanzamt Letters Reader | Norman Tools',
    template: '%s | Norman Tools'
  },
  description: 'Analyze German tax office (Finanzamt) letters with AI. Get clear translations, summaries, and understand what actions you need to take. Free, no sign-up required. | Analysieren Sie deutsche Finanzamtsbriefe mit KI. Kostenlos, keine Anmeldung erforderlich.',
  keywords: [
    'Finanzamt letter analyzer',
    'Finanzamt letters reader',
    'tax office letter translator',
    'German tax documents',
    'Steuerbescheid analyzer',
    'tax assessment analyzer',
    'German tax office translation',
    'Finanzamt brief verstehen',
    'tax document explanation',
    'free tax letter analysis',
    'AI tax document analyzer',
    'Finanzamt Brief Leser',
    'Finanzamt Briefe analysieren',
    'Steuerbescheid verstehen',
    'Finanzamt Schreiben übersetzen',
    'deutsche Steuerdokumente',
    'Finanzamt Brief Analyse',
    'KI Steuerdokument Analyzer',
    'kostenlose Finanzamt Hilfe',
    'Steuerbescheid erklären',
    'Finanzamt Brief Hilfe'
  ],
  authors: [{ name: 'Norman Finance' }],
  creator: 'Norman Finance',
  publisher: 'Norman Finance',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://tools.norman.finance'),
  alternates: {
    canonical: '/finanzamt-brief',
    languages: {
      'en': '/finanzamt-brief',
      'de': '/finanzamt-brief?ui_lang=de',
      'x-default': '/finanzamt-brief',
    },
  },
  openGraph: {
    title: 'Free Finanzamt Letters Reader - Understand German Tax Documents | Norman Tools',
    description: 'Upload any letter from the German tax office and get an AI-powered analysis in plain English. Understand what your Finanzamt letter means. | Laden Sie Finanzamtsbriefe hoch und erhalten Sie eine KI-Analyse.',
    url: '/finanzamt-brief',
    siteName: 'Norman Tools',
    locale: 'en_US',
    alternateLocale: ['de_DE'],
    type: 'website',
    images: [
      {
        url: '/images/finanzamt-analyzer-og.png',
        width: 1200,
        height: 630,
        alt: 'Norman Finanzamt Letters Reader - Free German Tax Document Analysis | Kostenlose Finanzamt Brief Analyse',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Finanzamt Letters Reader | Norman Tools',
    description: 'Analyze German tax office letters with AI. Get clear explanations of your Finanzamt documents. | Finanzamtsbriefe mit KI analysieren.',
    images: ['/images/finanzamt-analyzer-twitter.png'],
    creator: '@norman_finance',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification-code',
  },
  category: 'Finance Tools',
};

export default function FinanzamtBriefLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Hreflang tags for language alternates */}
      <link rel="alternate" hrefLang="en" href="https://tools.norman.finance/finanzamt-brief" />
      <link rel="alternate" hrefLang="de" href="https://tools.norman.finance/finanzamt-brief?ui_lang=de" />
      <link rel="alternate" hrefLang="x-default" href="https://tools.norman.finance/finanzamt-brief" />
      {children}
    </>
  );
} 