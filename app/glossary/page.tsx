import type { Metadata } from "next";
import { CARD_MEANINGS } from "@/lib/content/cards";
import { HOUSE_MEANINGS } from "@/lib/content/houses";
import { TECHNIQUES } from "@/lib/content/techniques";
import { GlossaryIndex } from "@/components/GlossaryIndex";

export const metadata: Metadata = {
  metadataBase: new URL("https://36cards.com"),
  title: "Lenormand Glossary",
  description: "Browse 36 Cards glossary pages for Lenormand cards, houses, and reading techniques.",
  alternates: { canonical: "/glossary" },
  openGraph: {
    title: "Lenormand Glossary - 36 Cards",
    description: "Browse Lenormand cards, houses, and reading techniques in the 36 Cards glossary.",
    url: "https://36cards.com/glossary",
    siteName: "36 Cards",
    type: "website",
    images: [{ url: "https://36cards.com/brand/og-image-1200x630.png", width: 1200, height: 630, alt: "36 Cards glossary preview" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lenormand Glossary - 36 Cards",
    description: "Browse Lenormand cards, houses, and reading techniques in the 36 Cards glossary.",
    images: ["https://36cards.com/brand/og-image-1200x630.png"],
  },
};

export default function GlossaryPage() {
  return (
    <GlossaryIndex
      cards={CARD_MEANINGS}
      houses={HOUSE_MEANINGS}
      techniques={TECHNIQUES}
    />
  );
}
