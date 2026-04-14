import Link from "next/link";
import Image from "next/image";
import { BrandHeader } from "@/components/BrandHeader";
import { BrandFooter } from "@/components/BrandFooter";
import { RecentReadings } from "@/components/RecentReadings";

const FEATURED_CARDS = [
  { id: 1, slug: "rider", name: "Rider" },
  { id: 3, slug: "ship", name: "Ship" },
  { id: 9, slug: "bouquet", name: "Bouquet" },
  { id: 16, slug: "stars", name: "Stars" },
  { id: 24, slug: "heart", name: "Heart" },
  { id: 25, slug: "ring", name: "Ring" },
  { id: 29, slug: "querent", name: "Querent" },
  { id: 31, slug: "Sun", name: "Sun" },
  { id: 33, slug: "key", name: "Key" },
];

function getCardImagePath(cardId: number, cardSlug: string): string {
  return `/cards/traditional/${String(cardId).padStart(2, "0")}-${cardSlug}.webp`;
}

export default function HomePage() {
  return (
    <main className="theme-ethiopian font-display-botanical font-body-quiet min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">

        <BrandHeader />

        {/* Hero */}
        <div className="ritual-panel page-reveal overflow-hidden">
          <div className="relative h-48 w-full overflow-hidden sm:h-64">
            <Image
              src="/brand/header.png"
              alt="Three Lenormand cards on a dark oak table"
              fill
              className="object-cover object-center"
              priority
            />
          </div>

          <div className="px-6 py-8 sm:px-10 sm:py-12">
            <p className="section-kicker">36 Cards</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
              A Lenormand reader for the path ahead.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[color:var(--brand-muted)]">
              Lenormand is a 36-card oracle from 19th-century Europe. Unlike tarot, it reads in combinations — cards speak to each other across the table, building layers of meaning that a single card alone cannot carry.
            </p>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-[color:var(--brand-muted)]">
              Pick a question. Lay the cards. Read the spread.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/setup"
                className="btn-primary px-6 py-3 text-base font-semibold"
              >
                Begin a Reading
              </Link>
              <Link
                href="/glossary"
                className="btn-ghost px-6 py-3 text-base font-semibold"
              >
                Learn the Cards
              </Link>
            </div>
          </div>
        </div>

        {/* Card strip */}
        <div className="ritual-panel-soft overflow-hidden px-5 py-5">
          <div className="scrollbar-hide flex gap-3 overflow-x-auto sm:justify-center sm:gap-4 sm:overflow-visible">
            {FEATURED_CARDS.map((card) => (
              <Link
                key={card.id}
                href={`/glossary/cards/${card.slug}`}
                className="group w-16 shrink-0 sm:w-auto sm:max-w-[88px]"
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
                <p className="mt-1.5 text-center text-[9px] leading-tight text-[color:var(--brand-muted)] group-hover:text-[color:var(--brand-text)] sm:text-[10px]">
                  {card.name}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent readings (client component — renders only when history exists) */}
        <RecentReadings />

        {/* How it works */}
        <section className="ritual-panel p-6 sm:p-8">
          <p className="section-kicker">How It Works</p>
          <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Three steps to a reading</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            <div className="flex gap-4 sm:flex-col sm:gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[color:var(--brand-accent)] text-sm font-bold text-[color:var(--brand-accent)]">1</span>
              <div>
                <p className="text-base font-semibold text-[color:var(--brand-text)]">Ask your question</p>
                <p className="mt-1 text-sm text-[color:var(--brand-muted)]">
                  Frame what you need clarity on. Lenormand reads what is in motion — pressures, opportunities, and the shape of things to come.
                </p>
              </div>
            </div>
            <div className="flex gap-4 sm:flex-col sm:gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[color:var(--brand-accent)] text-sm font-bold text-[color:var(--brand-accent)]">2</span>
              <div>
                <p className="text-base font-semibold text-[color:var(--brand-text)]">Choose a spread</p>
                <p className="mt-1 text-sm text-[color:var(--brand-muted)]">
                  A quick 3-card draw for focused questions, or the full Grand Tableau — all 36 cards laid across the table for a deep, whole-life reading.
                </p>
              </div>
            </div>
            <div className="flex gap-4 sm:flex-col sm:gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[color:var(--brand-accent)] text-sm font-bold text-[color:var(--brand-accent)]">3</span>
              <div>
                <p className="text-base font-semibold text-[color:var(--brand-text)]">Read the interpretation</p>
                <p className="mt-1 text-sm text-[color:var(--brand-muted)]">
                  The reading engine layers proximity, diagonals, knighting, and house positions into a written narrative that connects your question to the cards on the table.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="ritual-panel-soft p-5">
            <p className="text-base font-semibold text-[color:var(--brand-text)]">Fixed meanings</p>
            <p className="mt-2 text-sm text-[color:var(--brand-muted)]">
              Each card has a fixed meaning. The Rider brings news. The Coffin ends things. The Sun brings clarity. No reversals, no ambiguity — the system is precise by design.
            </p>
          </div>
          <div className="ritual-panel-soft p-5">
            <p className="text-base font-semibold text-[color:var(--brand-text)]">Combinations</p>
            <p className="mt-2 text-sm text-[color:var(--brand-muted)]">
              Cards read in pairs and clusters. The Fox beside the Bear suggests deception in positions of power. The Ship next to the Anchor points toward a journey that leads to something stable.
            </p>
          </div>
          <div className="ritual-panel-soft p-5">
            <p className="text-base font-semibold text-[color:var(--brand-text)]">Grand Tableau</p>
            <p className="mt-2 text-sm text-[color:var(--brand-muted)]">
              All 36 cards laid in a 4-row grid. Houses, diagonals, and knighting distances create layers of connection. A whole-life reading — past, present, future, and everything in between.
            </p>
          </div>
        </div>

        {/* Spread types */}
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="ritual-panel-soft p-5">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--brand-muted)]">3-Card Spread</p>
            <p className="mt-2 text-base font-semibold text-[color:var(--brand-text)]">Quick, focused readings</p>
            <p className="mt-2 text-sm text-[color:var(--brand-muted)]">
              Past / Present / Future, or Situation / Challenge / Advice. Three cards, one clear narrative. A good place to start if you are new to Lenormand.
            </p>
            <Link
              href="/setup"
              className="mt-4 inline-flex rounded-full border border-[color:var(--brand-border)] px-3 py-1.5 text-sm font-medium text-[color:var(--brand-text)] transition hover:bg-white/50"
            >
              Start a 3-card reading
            </Link>
          </div>
          <div className="ritual-panel-soft p-5">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--brand-muted)]">Grand Tableau</p>
            <p className="mt-2 text-base font-semibold text-[color:var(--brand-text)]">Deep, whole-life readings</p>
            <p className="mt-2 text-sm text-[color:var(--brand-muted)]">
              All 36 cards laid in a grid. Every position is a house, every distance matters. The reading engine applies proximity, diagonals, knighting, and significator analysis to build a layered interpretation.
            </p>
            <Link
              href="/setup"
              className="mt-4 inline-flex rounded-full border border-[color:var(--brand-border)] px-3 py-1.5 text-sm font-medium text-[color:var(--brand-text)] transition hover:bg-white/50"
            >
              Start a Grand Tableau
            </Link>
          </div>
        </section>

        {/* Glossary teaser */}
        <section className="ritual-panel p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="section-kicker">Reference</p>
              <h2 className="mt-3 text-2xl font-semibold">Explore the glossary</h2>
              <p className="mt-2 max-w-lg text-sm text-[color:var(--brand-muted)]">
                Card meanings, house positions, and interpretation techniques — the full vocabulary of the Lenormand system, written for practical use.
              </p>
            </div>
            <Link
              href="/glossary"
              className="btn-ghost px-4 py-2 text-sm font-semibold"
            >
              View glossary
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-4 sm:grid-cols-6">
            {[
              { id: 8, slug: "coffin", name: "Coffin" },
              { id: 14, slug: "fox", name: "Fox" },
              { id: 15, slug: "bear", name: "Bear" },
              { id: 22, slug: "crossroads", name: "Crossroads" },
              { id: 34, slug: "fish", name: "Fish" },
              { id: 36, slug: "cross", name: "Cross" },
            ].map((card) => (
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
                  {card.id}. {card.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <BrandFooter />
      </div>
    </main>
  );
}
