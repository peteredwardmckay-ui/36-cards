import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, JetBrains_Mono, Newsreader } from "next/font/google";
import { Suspense } from "react";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import "./globals.css";

const GOOGLE_SITE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION ?? "";

const serifDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-serif-display",
});

const serifBody = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-serif-body",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-mono",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://36cards.com"),
  title: {
    default: "36 Cards",
    template: "%s - 36 Cards",
  },
  description:
    "36 Cards (36cards.com) is a premium Lenormand ritual app with 3-card and Grand Tableau readings, deep layered techniques, and rich narrative interpretation.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/brand/favicon.png", type: "image/png" },
    ],
  },
  openGraph: {
    title: "36 Cards",
    description: "Ritual-style Lenormand readings with houses, diagonals, knighting, and rich narrative interpretation.",
    siteName: "36 Cards",
    type: "website",
    url: "https://36cards.com",
    images: [
      {
        url: "https://36cards.com/brand/og-image-1200x630.png",
        width: 1200,
        height: 630,
        alt: "36 Cards — Lenormand cards laid on a table",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "36 Cards",
    description: "Ritual-style Lenormand readings with houses, diagonals, knighting, and rich narrative interpretation.",
    images: ["https://36cards.com/brand/og-image-1200x630.png"],
  },
  verification: GOOGLE_SITE_VERIFICATION
    ? {
        google: GOOGLE_SITE_VERIFICATION,
      }
    : undefined,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serifDisplay.variable} ${serifBody.variable} ${mono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "36 Cards",
              url: "https://36cards.com",
              description:
                "Premium Lenormand ritual app with 3-card and Grand Tableau readings, deep layered techniques, and rich narrative interpretation.",
              applicationCategory: "LifestyleApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </head>
      <body>
        {children}
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
      </body>
    </html>
  );
}
