import type { Metadata } from "next";
import { JournalClient } from "@/components/JournalClient";

export const metadata: Metadata = {
  metadataBase: new URL("https://36cards.com"),
  title: "Reading Journal — 36 Cards",
  description: "Your archive of past Lenormand readings — patterns, recurring questions, and cadence over time.",
  alternates: { canonical: "/journal" },
  robots: { index: false, follow: false },
  openGraph: {
    title: "Reading Journal — 36 Cards",
    description: "Your archive of past Lenormand readings.",
    url: "https://36cards.com/journal",
    siteName: "36 Cards",
    type: "website",
    images: [{ url: "https://36cards.com/brand/og-image-1200x630.png", width: 1200, height: 630, alt: "36 Cards Journal" }],
  },
};

export default function JournalPage() {
  return <JournalClient />;
}
