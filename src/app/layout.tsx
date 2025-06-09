import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Free Business Tools | Norman Finance',
  description: 'Professional business tools to streamline your operations. Free invoice generator, and more tools for freelancers and businesses. No registration required.',
  keywords: 'business tools, invoice generator, free invoice, PDF invoice, e-invoice, professional invoices, invoice maker, freelance tools',
  authors: [{ name: 'Norman Finance' }],
  creator: 'Norman Finance',
  publisher: 'Norman Finance',
  robots: 'index, follow',
  openGraph: {
    title: 'Free Business Tools | Norman Finance',
    description: 'Professional business tools to streamline your operations. Free invoice generator and more tools for freelancers and businesses.',
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'de_DE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Business Tools | Norman Finance',
    description: 'Professional business tools to streamline your operations. Free invoice generator and more.',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
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
        
        {/* Analytics - Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_title: document.title,
                    page_location: window.location.href,
                  });
                `,
              }}
            />
          </>
        )}
        
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