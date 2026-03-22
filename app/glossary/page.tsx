import type { Metadata } from "next";
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
        url: "https://36cards.com/brand/opengraph-share.png",
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
    images: ["https://36cards.com/brand/opengraph-share.png"],
  },
};

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

        <section className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-panel)] p-4">
            <h2 className="text-lg font-semibold">How To Use It</h2>
            <p className="mt-2 text-sm text-[color:var(--brand-muted)]">
              Start with a card if a single symbol keeps showing up in your readings. Use the house pages if the overlay itself is
              doing a lot of interpretive work. Use the technique pages if you want to understand why the reading keeps talking about
              diagonals, proximity, or knighting.
            </p>
          </article>

          <article className="rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-panel)] p-4">
            <h2 className="text-lg font-semibold">What You&apos;ll Find</h2>
            <ul className="mt-2 space-y-1 text-sm text-[color:var(--brand-muted)]">
              <li>{CARD_MEANINGS.length} card reference pages</li>
              <li>{HOUSE_MEANINGS.length} house reference pages</li>
              <li>{TECHNIQUES.length} technique explainers</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-panel)] p-4">
            <h2 className="text-lg font-semibold">Next Step</h2>
            <p className="mt-2 text-sm text-[color:var(--brand-muted)]">
              If you want to move from reference into practice, return to setup and run a reading once you&apos;ve checked the symbols or
              techniques that matter most to your question.
            </p>
            <Link
              href="/setup"
              className="mt-3 inline-flex rounded-full border border-[color:var(--brand-border)] px-3 py-1.5 text-sm font-medium text-[color:var(--brand-text)] transition hover:bg-white/50"
            >
              Start A Reading
            </Link>
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-panel)] p-4">
            <h2 className="text-xl font-semibold">Cards</h2>
            <ul className="mt-3 grid gap-2 text-sm text-[color:var(--brand-muted)]">
              {CARD_MEANINGS.map((card) => (
                <li key={card.id}>
                  <Link href={`/glossary/cards/${card.slug}`} className="hover:underline">
                    {card.id}. {card.name}
                  </Link>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-panel)] p-4">
            <h2 className="text-xl font-semibold">Houses</h2>
            <ul className="mt-3 grid gap-2 text-sm text-[color:var(--brand-muted)]">
              {HOUSE_MEANINGS.map((house) => (
                <li key={house.id}>
                  <Link href={`/glossary/houses/${house.id}`} className="hover:underline">
                    {house.id}. {house.name}
                  </Link>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-panel)] p-4">
            <h2 className="text-xl font-semibold">Techniques</h2>
            <ul className="mt-3 grid gap-2 text-sm text-[color:var(--brand-muted)]">
              {TECHNIQUES.map((item) => (
                <li key={item.slug}>
                  <Link href={`/glossary/techniques/${item.slug}`} className="hover:underline">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <BrandFooter />
      </div>
    </main>
  );
}
