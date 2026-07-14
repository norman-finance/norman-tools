import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Free Tax Letter Assistant: Understand Finanzamt Letters | Norman",
  description:
    "Upload a letter from the German tax office and get an instant plain-language summary with recommended actions. AI-powered, free, no sign-up. | Finanzamt-Briefe verstehen mit KI.",
  keywords: [
    "Finanzamt letter",
    "Finanzamt Brief verstehen",
    "German tax office letter",
    "tax letter explained",
    "Steuerbescheid verstehen",
    "AI tax assistant",
  ],
  authors: [{ name: "Norman" }],
  creator: "Norman",
  publisher: "Norman",
  robots: "index, follow",
  metadataBase: new URL("https://norman.finance"),
  alternates: {
    canonical: "/de/tools/finanzamt-brief",
    languages: {
      de: "/de/tools/finanzamt-brief",
      en: "/de/en/tools/tax-letter",
      ru: "/de/ru/tools/tax-letter",
    },
  },
  openGraph: {
    title: "Free Tax Letter Assistant: Understand Finanzamt Letters | Norman",
    description:
      "Upload a Finanzamt letter and get an instant plain-language summary with recommended actions. Free and AI-powered.",
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
