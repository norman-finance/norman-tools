import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free E-Invoice Generator | German ZUGFeRD Invoices',
  description: 'Generate professional German e-invoices with ZUGFeRD compliance. Free invoice generator for freelancers and businesses. No registration required.',
  keywords: 'e-invoice generator, ZUGFeRD, German invoices, free invoice, PDF invoice, professional invoices, freelance invoices',
  authors: [{ name: 'Norman Finance' }],
  creator: 'Norman Finance',
  publisher: 'Norman Finance',
  robots: 'index, follow',
  openGraph: {
    title: 'Free E-Invoice Generator | German ZUGFeRD Invoices',
    description: 'Generate professional German e-invoices with ZUGFeRD compliance. Free invoice generator for freelancers and businesses.',
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'de_DE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free E-Invoice Generator | German ZUGFeRD Invoices',
    description: 'Generate professional German e-invoices with ZUGFeRD compliance. Free invoice generator.',
  },
};

export default function ERechnungLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 