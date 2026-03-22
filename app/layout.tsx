import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import "./globals.css";

const GOOGLE_SITE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION ?? "";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://36cards.com"),
  title: {
    default: "36 Cards - Lenormand Atlas",
    template: "%s - 36 Cards",
  },
  description:
    "36 Cards (36cards.com) is a premium Lenormand ritual app with 3-card and Grand Tableau readings, deep layered techniques, and branded PDF exports.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/brand/favicon.png", type: "image/png" },
    ],
  },
  openGraph: {
    title: "36 Cards - Lenormand Atlas",
    description: "Ritual-style Lenormand readings with houses, diagonals, knighting, and rich narrative interpretation.",
    siteName: "36 Cards",
    type: "website",
    url: "https://36cards.com",
    images: [
      {
        url: "https://36cards.com/brand/opengraph-share.png",
        width: 1200,
        height: 630,
        alt: "36 Cards reading preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "36 Cards - Lenormand Atlas",
    description: "Ritual-style Lenormand readings with rich GT techniques.",
    images: ["https://36cards.com/brand/opengraph-share.png"],
  },
  verification: GOOGLE_SITE_VERIFICATION
    ? {
        google: GOOGLE_SITE_VERIFICATION,
      }
    : undefined,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
      </body>
    </html>
  );
}
