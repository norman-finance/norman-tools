import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Free E-Invoice Generator: ZUGFeRD Compliant | Norman",
  description:
    "Free software to create compliant e-invoices. Generate and download ZUGFeRD PDF e-invoices. No sign-up required. | Kostenlose Software zum Erstellen konformer E-Rechnungen (ZUGFeRD).",
  keywords: [
    "e-invoice generator",
    "ZUGFeRD",
    "XRechnung",
    "E-Rechnung erstellen",
    "German e-invoice",
    "free invoice generator",
    "kostenlose E-Rechnung",
  ],
  authors: [{ name: "Norman" }],
  creator: "Norman",
  publisher: "Norman",
  robots: "index, follow",
  metadataBase: new URL("https://norman.finance"),
  alternates: {
    canonical: "/de/tools/erechnung",
    languages: {
      de: "/de/tools/erechnung",
      en: "/de/en/tools/e-invoice",
      ru: "/de/ru/tools/e-invoice",
    },
  },
  openGraph: {
    title: "Free E-Invoice Generator: ZUGFeRD Compliant | Norman",
    description:
      "Create compliant German e-invoices for free. Generate and download ZUGFeRD PDFs — no sign-up, no watermarks.",
    type: "website",
    siteName: "Norman Free Tools",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
