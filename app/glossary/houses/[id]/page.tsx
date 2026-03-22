import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandHeader } from "@/components/BrandHeader";
import { BrandFooter } from "@/components/BrandFooter";
import { HOUSE_BY_ID, HOUSE_MEANINGS } from "@/lib/content/houses";

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
    description: `${house.name} house meanings and interpretive focus in the 36 Cards Lenormand glossary.`,
    alternates: {
      canonical: `/glossary/houses/${house.id}`,
    },
    openGraph: {
      title: `House ${house.id}: ${house.name} - 36 Cards Glossary`,
      description: `${house.name} house meanings and interpretive focus in the 36 Cards Lenormand glossary.`,
      url: `https://36cards.com/glossary/houses/${house.id}`,
      siteName: "36 Cards",
      type: "article",
      images: [
        {
          url: "https://36cards.com/brand/opengraph-share.png",
          width: 1200,
          height: 630,
          alt: `${house.name} glossary page`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `House ${house.id}: ${house.name} - 36 Cards Glossary`,
      description: `${house.name} house meanings and interpretive focus in the 36 Cards Lenormand glossary.`,
      images: ["https://36cards.com/brand/opengraph-share.png"],
    },
  };
}

export default async function HouseGlossaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  const house = HOUSE_BY_ID.get(id);
  if (!house) return notFound();

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <BrandHeader compact />
        <article className="rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-panel)] p-5 shadow-ritual">
          <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--brand-muted)]">
            <Link href="/glossary" className="hover:underline">Glossary</Link> / Houses
          </p>
          <h1 className="text-3xl font-semibold">House {house.id}: {house.name}</h1>
          <p className="mt-2 text-sm text-[color:var(--brand-muted)]">{house.shortFocus}</p>
          <p className="mt-3 text-sm text-[color:var(--brand-text)]">{house.description}</p>

          <section className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-[color:var(--brand-border)] bg-white/35 p-4">
              <h2 className="text-lg font-semibold">What This House Emphasizes</h2>
              <p className="mt-2 text-sm text-[color:var(--brand-muted)]">
                In a Grand Tableau, {house.name} tells you where <span className="font-medium text-[color:var(--brand-text)]">{house.shortFocus}</span> is becoming structurally important. It changes the role a card plays by showing which life area, duty, pressure, or resource the card is being asked to operate through.
              </p>
            </div>
            <div className="rounded-xl border border-[color:var(--brand-border)] bg-white/35 p-4">
              <h2 className="text-lg font-semibold">How To Read The Overlay</h2>
              <p className="mt-2 text-sm text-[color:var(--brand-muted)]">
                A card placed here should be read through the lens of {house.shortFocus}. That does not replace the card&apos;s meaning; it tells you the part of the story where that meaning becomes active, visible, or demanding.
              </p>
            </div>
          </section>
        </article>
        <BrandFooter />
      </div>
    </main>
  );
}
