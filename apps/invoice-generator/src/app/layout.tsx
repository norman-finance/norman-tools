import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Free E-Invoice Generator | German ZUGFeRD Invoices',
    template: '%s | Norman Tools'
  },
  description: 'Generate professional German e-invoices with ZUGFeRD compliance. Free invoice generator for freelancers and businesses. No registration required. | Erstellen Sie professionelle deutsche E-Rechnungen mit ZUGFeRD-Konformität. Kostenloser Rechnungsgenerator für Freelancer.',
  keywords: 'e-invoice generator, ZUGFeRD, German invoices, free invoice, PDF invoice, professional invoices, freelance invoices, E-Rechnung Generator, ZUGFeRD Rechnungen, deutsche Rechnungen, kostenlose Rechnung, PDF Rechnung, professionelle Rechnungen, Freelancer Rechnungen, Rechnung erstellen',
  authors: [{ name: 'Norman' }],
  creator: 'Norman',
  publisher: 'Norman',
  robots: 'index, follow',
  openGraph: {
    title: 'Free E-Invoice Generator | German ZUGFeRD Invoices - Norman Tools',
    description: 'Generate professional German e-invoices with ZUGFeRD compliance. Free invoice generator for freelancers and businesses. | Erstellen Sie professionelle deutsche E-Rechnungen.',
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['de_DE'],
    siteName: 'Norman Tools',
  },
  twitter: {
    card: 'summary',
    title: 'Free E-Invoice Generator | German ZUGFeRD Invoices',
    description: 'Generate professional German e-invoices with ZUGFeRD compliance. Free, no registration required.',
    creator: '@norman_finance',
  },
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
