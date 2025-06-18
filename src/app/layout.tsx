import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Free Business Tools | Norman Finance',
    template: '%s | Norman Tools'
  },
  description: 'Professional business tools to streamline your operations. Free invoice generator, and more tools for freelancers and businesses. No registration required. | Professionelle Geschäftstools zur Optimierung Ihrer Abläufe. Kostenloser Rechnungsgenerator und weitere Tools für Freelancer und Unternehmen.',
  keywords: 'business tools, invoice generator, free invoice, PDF invoice, e-invoice, professional invoices, invoice maker, freelance tools, Geschäftstools, Rechnungsgenerator, kostenlose Rechnung, PDF Rechnung, E-Rechnung, professionelle Rechnungen, Rechnungsersteller, Freelancer Tools, Finanzamt Brief, Steuerdokumente, business software, Unternehmenssoftware',
  authors: [{ name: 'Norman Finance' }],
  creator: 'Norman Finance',
  publisher: 'Norman Finance',
  robots: 'index, follow',
  metadataBase: new URL('https://tools.norman.finance'),
  alternates: {
    canonical: '/',
    languages: {
      'en': '/',
      'de': '/?ui_lang=de',
      'x-default': '/',
    },
  },
  openGraph: {
    title: 'Free Business Tools | Norman Finance - Professional Tools for Your Business',
    description: 'Professional business tools to streamline your operations. Free invoice generator and more tools for freelancers and businesses. | Professionelle Geschäftstools für Ihr Unternehmen. Kostenloser Rechnungsgenerator und weitere Tools.',
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['de_DE'],
    url: '/',
    siteName: 'Norman Tools',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Norman Finance - Free Business Tools | Kostenlose Geschäftstools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Business Tools | Norman Finance',
    description: 'Professional business tools to streamline your operations. Free invoice generator and more. | Professionelle Geschäftstools zur Optimierung Ihrer Abläufe.',
    creator: '@norman_finance',
  },
  manifest: '/manifest.json',
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
      <head>
        {/* Hreflang tags for language alternates */}
        <link rel="alternate" hrefLang="en" href="https://tools.norman.finance/" />
        <link rel="alternate" hrefLang="de" href="https://tools.norman.finance/?ui_lang=de" />
        <link rel="alternate" hrefLang="x-default" href="https://tools.norman.finance/" />
        
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          as="style"
        />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          as="style"
        />
        
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        
        {/* Google Tag Manager */}
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-WJ6T724P');`
          }}
        />
        
        {/* Plausible Analytics */}
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
          />
        )}
        
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WJ6T724P"
            height="0" width="0" style={{display:'none', visibility:'hidden'}}></iframe>
        </noscript>
        
        <div id="root">
          {children}
        </div>
      
        {/* Error boundary placeholder for production */}
        <div id="error-boundary" style={{ display: 'none' }}>
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            margin: '2rem',
          }}>
            <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>
              Something went wrong
            </h2>
            <p style={{ color: '#7f1d1d', marginBottom: '1rem' }}>
              We apologize for the inconvenience. Please refresh the page and try again.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
} 