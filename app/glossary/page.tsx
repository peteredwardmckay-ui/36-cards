import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BrandHeader } from "@/components/BrandHeader";
import { BrandFooter } from "@/components/BrandFooter";
import { CARD_MEANINGS } from "@/lib/content/cards";
import { HOUSE_MEANINGS } from "@/lib/content/houses";
import { TECHNIQUES } from "@/lib/content/techniques";

export const metadata: Metadata = {
  metadataBase: new URL("https://36cards.com"),
  title: "Lenormand Glossary",
  description: "Browse 36 Cards glossary pages for Lenormand cards, houses, and reading techniques.",
  alternates: {
    canonical: "/glossary",
  },
  openGraph: {
    title: "Lenormand Glossary - 36 Cards",
    description: "Browse Lenormand cards, houses, and reading techniques in the 36 Cards glossary.",
    url: "https://36cards.com/glossary",
    siteName: "36 Cards",
    type: "website",
    images: [
      {
        url: "https://36cards.com/brand/og-image-1200x630.png",
        width: 1200,
        height: 630,
        alt: "36 Cards glossary preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lenormand Glossary - 36 Cards",
    description: "Browse Lenormand cards, houses, and reading techniques in the 36 Cards glossary.",
    images: ["https://36cards.com/brand/og-image-1200x630.png"],
  },
};

function getCardImagePath(cardId: number, cardSlug: string): string {
  return `/cards/traditional/${String(cardId).padStart(2, "0")}-${cardSlug}.webp`;
}

export default function GlossaryPage() {
  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <BrandHeader compact />

        <section className="rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-panel)] p-5 shadow-ritual">
          <h1 className="text-3xl font-semibold">Glossary</h1>
          <p className="mt-2 text-sm text-[color:var(--brand-muted)]">
            A reference library for cards, houses, and interpretation techniques.
          </p>
          <p className="mt-3 max-w-3xl text-sm text-[color:var(--brand-text)]">
            Use this section when you want the underlying vocabulary of the system, not just a generated reading. The card pages
            explain the symbolic building blocks, the house pages explain how positions shift meaning in the Grand Tableau, and the
            technique pages explain how the reading engine layers proximity, diagonals, knighting, and significators into the final interpretation.
          </p>
        </section>

        <section className="rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-panel)] p-5 shadow-ritual">
          <h2 className="text-xl font-semibold">Cards</h2>
          <p className="mt-1 text-sm text-[color:var(--brand-muted)]">
            {CARD_MEANINGS.length} cards — tap any card to read its full meaning.
          </p>
          <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-9">
            {CARD_MEANINGS.map((card) => (
              <Link
                key={card.id}
                href={`/glossary/cards/${card.slug}`}
                className="group flex flex-col items-center gap-1.5"
              >
                <div className="overflow-hidden rounded-lg border border-[color:var(--brand-border)] shadow-sm transition group-hover:shadow-md group-hover:border-[color:var(--brand-accent)]">
                  <Image
                    src={getCardImagePath(card.id, card.slug)}
                    alt={card.name}
                    width={120}
                    height={180}
                    className="h-auto w-full transition group-hover:scale-105"
                  />
                </div>
                <span className="text-center text-[10px] leading-tight text-[color:var(--brand-muted)] group-hover:text-[color:var(--brand-text)]">
                  {card.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-panel)] p-5">
            <h2 className="text-xl font-semibold">Houses</h2>
            <p className="mt-1 text-sm text-[color:var(--brand-muted)]">
              {HOUSE_MEANINGS.length} positions in the Grand Tableau casting board.
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-[color:var(--brand-muted)]">
              {HOUSE_MEANINGS.map((house) => (
                <li key={house.id}>
                  <Link href={`/glossary/houses/${house.id}`} className="hover:text-[color:var(--brand-text)] hover:underline">
                    {house.id}. {house.name}
                  </Link>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-panel)] p-5">
            <h2 className="text-xl font-semibold">Techniques</h2>
            <p className="mt-1 text-sm text-[color:var(--brand-muted)]">
              {TECHNIQUES.length} interpretation methods used by the reading engine.
            </p>
            <ul className="mt-3 grid gap-2 text-sm">
              {TECHNIQUES.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/glossary/techniques/${item.slug}`}
                    className="block rounded-xl border border-[color:var(--brand-border)] bg-white/35 p-3 transition hover:bg-white/55"
                  >
                    <span className="font-medium text-[color:var(--brand-text)]">{item.title}</span>
                    <span className="mt-0.5 block text-xs text-[color:var(--brand-muted)]">{item.summary}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/setup"
              className="mt-4 inline-flex rounded-full border border-[color:var(--brand-border)] px-3 py-1.5 text-sm font-medium text-[color:var(--brand-text)] transition hover:bg-white/50"
            >
              Start A Reading
            </Link>
          </article>
        </section>

        <BrandFooter />
      </div>
    </main>
  );
}
