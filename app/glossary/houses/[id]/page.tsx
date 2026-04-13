import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandHeader } from "@/components/BrandHeader";
import { BrandFooter } from "@/components/BrandFooter";
import { HOUSE_BY_ID, HOUSE_MEANINGS } from "@/lib/content/houses";
import { CARD_MEANINGS } from "@/lib/content/cards";

export function generateStaticParams() {
  return HOUSE_MEANINGS.map((house) => ({ id: String(house.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id: idParam } = await params;
  const id = Number(idParam);
  const house = HOUSE_BY_ID.get(id);

  if (!house) {
    return {
      metadataBase: new URL("https://36cards.com"),
      title: "House Glossary",
      description: "Lenormand house meanings and interpretations.",
      alternates: {
        canonical: "/glossary/houses",
      },
    };
  }

  return {
    metadataBase: new URL("https://36cards.com"),
    title: `House ${house.id}: ${house.name}`,
    description: `${house.name} meanings and interpretive focus in the 36 Cards Lenormand glossary.`,
    alternates: {
      canonical: `/glossary/houses/${house.id}`,
    },
    openGraph: {
      title: `House ${house.id}: ${house.name} - 36 Cards Glossary`,
      description: `${house.name} meanings and interpretive focus in the 36 Cards Lenormand glossary.`,
      url: `https://36cards.com/glossary/houses/${house.id}`,
      siteName: "36 Cards",
      type: "article",
      images: [
        {
          url: "https://36cards.com/brand/og-image-1200x630.png",
          width: 1200,
          height: 630,
          alt: `${house.name} glossary page`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `House ${house.id}: ${house.name} - 36 Cards Glossary`,
      description: `${house.name} meanings and interpretive focus in the 36 Cards Lenormand glossary.`,
      images: ["https://36cards.com/brand/og-image-1200x630.png"],
    },
  };
}

function getCardImagePath(cardId: number, cardSlug: string): string {
  return `/cards/traditional/${String(cardId).padStart(2, "0")}-${cardSlug}.webp`;
}

export default async function HouseGlossaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  const house = HOUSE_BY_ID.get(id);
  if (!house) return notFound();

  const houseIndex = HOUSE_MEANINGS.findIndex((h) => h.id === id);
  const prevHouse = houseIndex > 0 ? HOUSE_MEANINGS[houseIndex - 1] : null;
  const nextHouse = houseIndex < HOUSE_MEANINGS.length - 1 ? HOUSE_MEANINGS[houseIndex + 1] : null;

  const correspondingCard = CARD_MEANINGS.find((c) => c.id === id);

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <BrandHeader compact />
        <article className="rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-panel)] p-5 shadow-ritual">
          <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--brand-muted)]">
            <Link href="/glossary" className="hover:underline">Glossary</Link> / Houses
          </p>

          <div className="mt-4 flex flex-col items-start gap-6 sm:flex-row">
            {correspondingCard && (
              <div className="relative w-36 shrink-0 overflow-hidden rounded-xl border border-[color:var(--brand-border)] shadow-md sm:w-44">
                <Image
                  src={getCardImagePath(correspondingCard.id, correspondingCard.slug)}
                  alt={`${correspondingCard.name} — the card corresponding to ${house.name}`}
                  width={400}
                  height={600}
                  className="h-auto w-full"
                />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-semibold">House {house.id}: {house.name}</h1>
              <p className="mt-2 text-sm text-[color:var(--brand-muted)]">{house.shortFocus}</p>
              <p className="mt-3 text-sm text-[color:var(--brand-text)]">{house.description}</p>
              {correspondingCard && (
                <p className="mt-3 text-sm text-[color:var(--brand-muted)]">
                  This house corresponds to{" "}
                  <Link
                    href={`/glossary/cards/${correspondingCard.slug}`}
                    className="font-medium text-[color:var(--brand-text)] underline underline-offset-2 hover:opacity-80"
                  >
                    {correspondingCard.id}. {correspondingCard.name}
                  </Link>
                  {" "}in the deck.
                </p>
              )}
            </div>
          </div>

          <section className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-[color:var(--brand-border)] bg-white/35 p-4">
              <h2 className="text-lg font-semibold">When a Supportive Card Lands Here</h2>
              <p className="mt-2 text-sm text-[color:var(--brand-muted)]">{house.whenStrong}</p>
            </div>
            <div className="rounded-xl border border-[color:var(--brand-border)] bg-white/35 p-4">
              <h2 className="text-lg font-semibold">When a Difficult Card Lands Here</h2>
              <p className="mt-2 text-sm text-[color:var(--brand-muted)]">{house.whenChallenged}</p>
            </div>
          </section>

          <nav className="mt-6 flex items-center justify-between border-t border-[color:var(--brand-border)] pt-4">
            {prevHouse ? (
              <Link
                href={`/glossary/houses/${prevHouse.id}`}
                className="text-sm text-[color:var(--brand-muted)] hover:text-[color:var(--brand-text)] hover:underline"
              >
                &larr; House {prevHouse.id}: {prevHouse.name}
              </Link>
            ) : (
              <span />
            )}
            {nextHouse ? (
              <Link
                href={`/glossary/houses/${nextHouse.id}`}
                className="text-sm text-[color:var(--brand-muted)] hover:text-[color:var(--brand-text)] hover:underline"
              >
                House {nextHouse.id}: {nextHouse.name} &rarr;
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
