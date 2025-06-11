import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Finanzamt Letter Analyzer | Norman Tools',
  description: 'Analyze German tax office (Finanzamt) letters with AI. Get clear translations, summaries, and understand what actions you need to take. Free, no sign-up required.',
  keywords: [
    'Finanzamt letter analyzer',
    'tax office letter translator',
    'German tax documents',
    'Steuerbescheid analyzer',
    'tax assessment analyzer',
    'German tax office translation',
    'Finanzamt brief verstehen',
    'tax document explanation',
    'free tax letter analysis',
    'AI tax document analyzer'
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
  },
  openGraph: {
    title: 'Free Finanzamt Letter Analyzer - Understand German Tax Documents',
    description: 'Upload any letter from the German tax office and get an AI-powered analysis in plain English. Understand what your Finanzamt letter means and what actions you need to take.',
    url: '/finanzamt-brief',
    siteName: 'Norman Tools',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/finanzamt-analyzer-og.png',
        width: 1200,
        height: 630,
        alt: 'Norman Finanzamt Letter Analyzer - Free German Tax Document Analysis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Finanzamt Letter Analyzer | Norman Tools',
    description: 'Analyze German tax office letters with AI. Get clear explanations of your Finanzamt documents in plain English.',
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
  return children;
} 