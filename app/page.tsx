import Link from "next/link";
import Image from "next/image";
import { BrandHeader } from "@/components/BrandHeader";
import { BrandFooter } from "@/components/BrandFooter";

export default function HomePage() {
  return (
    <main className="theme-ethiopian font-display-botanical font-body-quiet min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">

        <BrandHeader />

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
              A Lenormand reading for the path ahead.
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

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="ritual-panel-soft p-5">
            <p className="text-base font-semibold text-[color:var(--brand-text)]">36 cards</p>
            <p className="mt-2 text-sm text-[color:var(--brand-muted)]">
              Each card has a fixed meaning. The Rider brings news. The Coffin ends things. The Sun brings clarity. No reversals, no ambiguity.
            </p>
          </div>
          <div className="ritual-panel-soft p-5">
            <p className="text-base font-semibold text-[color:var(--brand-text)]">Combinations</p>
            <p className="mt-2 text-sm text-[color:var(--brand-muted)]">
              Cards read in pairs and clusters. The Fox beside the Bear suggests deception in positions of power. The Ship next to the Anchor suggests a journey toward something stable. Context shapes everything.
            </p>
          </div>
          <div className="ritual-panel-soft p-5">
            <p className="text-base font-semibold text-[color:var(--brand-text)]">Grand Tableau</p>
            <p className="mt-2 text-sm text-[color:var(--brand-muted)]">
              All 36 cards laid in a grid. A whole-life reading — past, present, future, and the forces around each area of life.
            </p>
          </div>
        </div>

        <BrandFooter />
      </div>
    </main>
  );
}
