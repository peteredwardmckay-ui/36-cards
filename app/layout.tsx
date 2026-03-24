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
        url: "https://36cards.com/brand/header.png",
        width: 1536,
        height: 1024,
        alt: "36 Cards — Lenormand cards laid on a table",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "36 Cards",
    description: "Ritual-style Lenormand readings with houses, diagonals, knighting, and rich narrative interpretation.",
    images: ["https://36cards.com/brand/header.png"],
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
