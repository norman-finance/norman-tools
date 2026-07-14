import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Free Tax Calculator for Freelancers in Germany | Norman",
  description:
    "Estimate your German income tax as a freelancer or solo self-employed: income tax, solidarity surcharge, and public health insurance — free, client-side, no sign-up. | Steuerrechner für Selbstständige in Deutschland.",
  keywords: [
    "tax calculator Germany",
    "Steuerrechner Selbstständige",
    "freelancer income tax",
    "Einkommensteuer Rechner",
    "self-employed tax Germany",
    "Krankenversicherung Selbstständige",
    "Solidaritätszuschlag",
  ],
  authors: [{ name: "Norman" }],
  creator: "Norman",
  publisher: "Norman",
  robots: "index, follow",
  metadataBase: new URL("https://norman.finance"),
  alternates: {
    canonical: "/de/steuerrechner",
    languages: {
      de: "/de/steuerrechner",
      en: "/de/en/tax-calculator",
      ru: "/de/ru/nalogovyj-kalkulyator",
    },
  },
  openGraph: {
    title: "Free Tax Calculator for Freelancers in Germany | Norman",
    description:
      "Estimate income tax, solidarity surcharge, and health insurance for self-employed work in Germany. Free and client-side.",
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
