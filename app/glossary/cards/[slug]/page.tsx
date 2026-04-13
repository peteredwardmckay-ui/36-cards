import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandHeader } from "@/components/BrandHeader";
import { BrandFooter } from "@/components/BrandFooter";
import { CARD_BY_SLUG, CARD_MEANINGS } from "@/lib/content/cards";

export function generateStaticParams() {
  return CARD_MEANINGS.map((card) => ({ slug: card.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const card = CARD_BY_SLUG.get(slug);

  if (!card) {
    return {
      metadataBase: new URL("https://36cards.com"),
      title: "Card Glossary",
      description: "Lenormand card meanings and interpretations.",
      alternates: {
        canonical: "/glossary/cards",
      },
    };
  }

  return {
    metadataBase: new URL("https://36cards.com"),
    title: `${card.id}. ${card.name}`,
    description: `${card.name} Lenormand meanings, core variants, and domain-specific interpretations in the 36 Cards glossary.`,
    alternates: {
      canonical: `/glossary/cards/${card.slug}`,
    },
    openGraph: {
      title: `${card.id}. ${card.name} - 36 Cards Glossary`,
      description: `${card.name} Lenormand meanings, core variants, and domain-specific interpretations in the 36 Cards glossary.`,
      url: `https://36cards.com/glossary/cards/${card.slug}`,
      siteName: "36 Cards",
      type: "article",
      images: [
        {
          url: "https://36cards.com/brand/og-image-1200x630.png",
          width: 1200,
          height: 630,
          alt: `${card.name} glossary page`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${card.id}. ${card.name} - 36 Cards Glossary`,
      description: `${card.name} Lenormand meanings, core variants, and domain-specific interpretations in the 36 Cards glossary.`,
      images: ["https://36cards.com/brand/og-image-1200x630.png"],
    },
  };
}

function getCardImagePath(cardId: number, cardSlug: string): string {
  return `/cards/traditional/${String(cardId).padStart(2, "0")}-${cardSlug}.webp`;
}

export default async function CardGlossaryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = CARD_BY_SLUG.get(slug);
  if (!card) return notFound();

  const cardIndex = CARD_MEANINGS.findIndex((c) => c.slug === slug);
  const prevCard = cardIndex > 0 ? CARD_MEANINGS[cardIndex - 1] : null;
  const nextCard = cardIndex < CARD_MEANINGS.length - 1 ? CARD_MEANINGS[cardIndex + 1] : null;

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <BrandHeader compact />
        <article className="rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-panel)] p-5 shadow-ritual">
          <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--brand-muted)]">
            <Link href="/glossary" className="hover:underline">Glossary</Link> / Cards
          </p>

          <div className="mt-4 flex flex-col items-start gap-6 sm:flex-row">
            <div className="relative w-36 shrink-0 overflow-hidden rounded-xl border border-[color:var(--brand-border)] shadow-md sm:w-44">
              <Image
                src={getCardImagePath(card.id, card.slug)}
                alt={`${card.name} — Lenormand card illustration`}
                width={400}
                height={600}
                className="h-auto w-full"
              />
            </div>
            <div>
              <h1 className="text-3xl font-semibold">{card.id}. {card.name}</h1>
              <p className="mt-2 text-sm text-[color:var(--brand-muted)]">{card.keywords.join(" - ")}</p>
              <p className="mt-3 text-sm text-[color:var(--brand-text)]">{card.coreMeaning}</p>
              <p className="mt-3 text-sm text-[color:var(--brand-muted)]">
                In practice, {card.name} becomes most useful when you read it as a pressure, opportunity, or behavioral cue rather than
                a fixed prediction. The sections below show how its tone shifts between general, relationship, and work contexts.
              </p>
            </div>
          </div>

          <section className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-[color:var(--brand-border)] bg-white/35 p-4">
              <h2 className="text-lg font-semibold">Caution</h2>
              <p className="mt-2 text-sm text-[color:var(--brand-muted)]">{card.caution}</p>
            </div>
            <div className="rounded-xl border border-[color:var(--brand-border)] bg-white/35 p-4">
              <h2 className="text-lg font-semibold">Useful Action</h2>
              <p className="mt-2 text-sm text-[color:var(--brand-muted)]">{card.action}</p>
            </div>
          </section>

          <section className="mt-5">
            <h2 className="text-xl font-semibold">Core Variants</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[color:var(--brand-muted)]">
              {card.coreVariants.map((variant) => (
                <li key={variant}>{variant}</li>
              ))}
            </ul>
          </section>

          <section className="mt-5">
            <h2 className="text-xl font-semibold">Domain Variants</h2>
            <ul className="mt-2 space-y-1 text-sm text-[color:var(--brand-muted)]">
              <li><strong>General:</strong> {card.domainVariants.general}</li>
              <li><strong>Love:</strong> {card.domainVariants.love}</li>
              <li><strong>Work:</strong> {card.domainVariants.work}</li>
            </ul>
          </section>

          <section className="mt-5">
            <h2 className="text-xl font-semibold">Technique Notes</h2>
            <div className="mt-2 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-[color:var(--brand-border)] bg-white/35 p-4">
                <h3 className="text-base font-semibold">Knighting</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[color:var(--brand-muted)]">
                  {card.techniqueSnippets.knighting.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-[color:var(--brand-border)] bg-white/35 p-4">
                <h3 className="text-base font-semibold">Diagonals</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[color:var(--brand-muted)]">
                  {card.techniqueSnippets.diagonal.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <nav className="mt-6 flex items-center justify-between border-t border-[color:var(--brand-border)] pt-4">
            {prevCard ? (
              <Link
                href={`/glossary/cards/${prevCard.slug}`}
                className="text-sm text-[color:var(--brand-muted)] hover:text-[color:var(--brand-text)] hover:underline"
              >
                &larr; {prevCard.id}. {prevCard.name}
              </Link>
            ) : (
              <span />
            )}
            {nextCard ? (
              <Link
                href={`/glossary/cards/${nextCard.slug}`}
                className="text-sm text-[color:var(--brand-muted)] hover:text-[color:var(--brand-text)] hover:underline"
              >
                {nextCard.id}. {nextCard.name} &rarr;
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </article>
        <BrandFooter />
      </div>
    </main>
  );
}
