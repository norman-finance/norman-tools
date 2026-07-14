import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Free Tax Deduction Finder for German Freelancers | Norman Tools',
    template: '%s | Norman Tools'
  },
  description: 'Find hidden tax deductions in your bank statements. AI-powered tax optimization for German freelancers, Kleinunternehmer, and small businesses. Upload your Kontoauszug and save money. | Finde versteckte Steuerabzüge in deinen Kontoauszügen. KI-gestützte Steueroptimierung für Freelancer und Kleinunternehmer.',
  keywords: [
    'tax deduction finder',
    'Steuerabzüge finden',
    'Betriebsausgaben',
    'tax optimization Germany',
    'Steueroptimierung',
    'freelancer tax deductions',
    'Freelancer Steuern sparen',
    'Kleinunternehmer Steuertipps',
    'German tax savings',
    'Steuern sparen Selbstständige',
    'bank statement tax analysis',
    'Kontoauszug Analyse',
    'missed tax deductions',
    'Steuerabzüge verpasst',
    'home office deduction Germany',
    'Arbeitszimmer absetzen',
    'Verpflegungspauschale',
    'GWG Sofortabschreibung'
  ],
  authors: [{ name: 'Norman' }],
  creator: 'Norman',
  publisher: 'Norman',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Free Tax Deduction Finder for German Freelancers | Norman Tools',
    description: 'Upload your bank statement and discover missed tax deductions. AI-powered optimization for German freelancers and small businesses. | Lade deinen Kontoauszug hoch und finde verpasste Steuerabzüge.',
    siteName: 'Norman Tools',
    locale: 'de_DE',
    alternateLocale: ['en_US'],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Free Tax Deduction Finder | Norman Tools',
    description: 'Find hidden tax deductions in your bank statements. Free AI-powered tool for German freelancers. | Finde versteckte Steuerabzüge in deinen Kontoauszügen.',
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
  category: 'Finance Tools',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
