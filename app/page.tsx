import Link from "next/link";
import Image from "next/image";
import { TopNav } from "@/components/TopNav";
import { SiteFooter } from "@/components/SiteFooter";

/* =========================================================
   Card data
   ========================================================= */

const CARDS = [
  { id: 1,  slug: "rider",       name: "Rider" },
  { id: 2,  slug: "clover",      name: "Clover" },
  { id: 3,  slug: "ship",        name: "Ship" },
  { id: 4,  slug: "house",       name: "House" },
  { id: 5,  slug: "tree",        name: "Tree" },
  { id: 6,  slug: "clouds",      name: "Clouds" },
  { id: 7,  slug: "snake",       name: "Snake" },
  { id: 8,  slug: "coffin",      name: "Coffin" },
  { id: 9,  slug: "bouquet",     name: "Bouquet" },
  { id: 10, slug: "scythe",      name: "Scythe" },
  { id: 11, slug: "whip",        name: "Whip" },
  { id: 12, slug: "birds",       name: "Birds" },
  { id: 13, slug: "child",       name: "Child" },
  { id: 14, slug: "fox",         name: "Fox" },
  { id: 15, slug: "bear",        name: "Bear" },
  { id: 16, slug: "stars",       name: "Stars" },
  { id: 17, slug: "stork",       name: "Stork" },
  { id: 18, slug: "dog",         name: "Dog" },
  { id: 19, slug: "tower",       name: "Tower" },
  { id: 20, slug: "garden",      name: "Garden" },
  { id: 21, slug: "mountain",    name: "Mountain" },
  { id: 22, slug: "crossroads",  name: "Crossroads" },
  { id: 23, slug: "mice",        name: "Mice" },
  { id: 24, slug: "heart",       name: "Heart" },
  { id: 25, slug: "ring",        name: "Ring" },
  { id: 26, slug: "book",        name: "Book" },
  { id: 27, slug: "letter",      name: "Letter" },
  { id: 28, slug: "man",         name: "Man" },
  { id: 29, slug: "woman",       name: "Woman" },
  { id: 30, slug: "lily",        name: "Lily" },
  { id: 31, slug: "sun",         name: "Sun" },
  { id: 32, slug: "moon",        name: "Moon" },
  { id: 33, slug: "key",         name: "Key" },
  { id: 34, slug: "fish",        name: "Fish" },
  { id: 35, slug: "anchor",      name: "Anchor" },
  { id: 36, slug: "cross",       name: "Cross" },
];

function cardImg(id: number, slug: string) {
  return `/cards/traditional/${String(id).padStart(2, "0")}-${slug}.webp`;
}

function getCardOfTheDay() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return CARDS[dayOfYear % 36];
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/* =========================================================
   Hero triptych cards
   ========================================================= */

const TRIPTYCH = [
  CARDS[15], // Stars  (index 15 = id 16)
  CARDS[32], // Key    (index 32 = id 33)
  CARDS[0],  // Rider  (index 0  = id 1)
];

/* =========================================================
   Glossary teaser cards (10)
   ========================================================= */

const GLOSSARY_CARDS = [
  CARDS[0],  // Rider
  CARDS[7],  // Coffin
  CARDS[13], // Fox
  CARDS[14], // Bear
  CARDS[15], // Stars
  CARDS[21], // Crossroads
  CARDS[24], // Ring
  CARDS[30], // Sun
  CARDS[32], // Key
  CARDS[35], // Cross
];

/* =========================================================
   Page
   ========================================================= */

export default function HomePage() {
  const cotd = getCardOfTheDay();

  return (
    <>
      <TopNav activePage="home" />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="surface-ink" style={{ position: "relative", overflow: "hidden" }}>
        <div className="starfield" />

        <div className="container" style={{ position: "relative", zIndex: 1, paddingTop: "96px", paddingBottom: "96px" }}>

          {/* Eyebrow */}
          <p className="smallcaps" style={{ opacity: 0.45, marginBottom: "28px", letterSpacing: "0.22em" }}>
            36 Cards · Lenormand Oracle
          </p>

          {/* Headline */}
          <h1 className="display" style={{ fontSize: "clamp(52px, 7vw, 96px)", maxWidth: "760px", marginBottom: "32px" }}>
            Read the cards.<br />
            <em style={{ fontStyle: "italic", fontWeight: 400 }}>Read the moment.</em>
          </h1>

          <p style={{ maxWidth: "520px", opacity: 0.65, lineHeight: 1.65, marginBottom: "48px", fontSize: "17px" }}>
            Lenormand is a 36-card oracle from 19th-century Europe. Cards speak
            to each other across the table — combinations, not single symbols —
            building a layered reading that one card alone cannot carry.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "72px" }}>
            <Link href="/setup" className="btn btn-ember">Begin a Reading</Link>
            <Link href="/glossary" className="btn btn-ghost-light">Learn the Cards</Link>
          </div>

          {/* Triptych */}
          <div style={{ display: "flex", gap: "clamp(12px, 2vw, 28px)", justifyContent: "flex-start" }}>
            {TRIPTYCH.map((card, i) => (
              <div
                key={card.id}
                className="card-frame"
                style={{
                  width: "clamp(88px, 13vw, 168px)",
                  opacity: i === 1 ? 1 : 0.65,
                  transform: i === 0 ? "rotate(-3deg)" : i === 2 ? "rotate(2.5deg)" : "none",
                  transformOrigin: "bottom center",
                }}
              >
                <Image src={cardImg(card.id, card.slug)} alt={card.name} fill style={{ objectFit: "cover" }} />
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              gap: "40px",
              marginTop: "56px",
              flexWrap: "wrap",
              borderTop: "var(--rule) solid var(--rule-color)",
              paddingTop: "32px",
            }}
          >
            {[
              { n: "36", label: "Cards" },
              { n: "II", label: "Spreads" },
              { n: "4×", label: "Analytical Layers" },
              { n: "∞", label: "Questions" },
            ].map(({ n, label }) => (
              <div key={label}>
                <div className="numeral" style={{ fontSize: "28px", lineHeight: 1 }}>{n}</div>
                <div className="smallcaps" style={{ opacity: 0.4, marginTop: "6px" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="rule" />

      {/* ── Card of the Day ──────────────────────────────── */}
      <section className="surface-vellum">
        <div className="container" style={{ paddingTop: "64px", paddingBottom: "64px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "48px", flexWrap: "wrap" }}>

            {/* Card image */}
            <div className="card-frame" style={{ width: "108px", flexShrink: 0 }}>
              <Image src={cardImg(cotd.id, cotd.slug)} alt={cotd.name} fill style={{ objectFit: "cover" }} />
            </div>

            {/* Text */}
            <div>
              <p className="smallcaps" style={{ opacity: 0.45, marginBottom: "12px" }}>
                Card of the Day · {formatDate()}
              </p>
              <h2 className="display" style={{ fontSize: "clamp(32px, 5vw, 52px)", marginBottom: "12px" }}>
                {cotd.id}. {cotd.name}
              </h2>
              <p style={{ opacity: 0.6, maxWidth: "480px", lineHeight: 1.65 }}>
                Each day surfaces a single card from the 36. Let it sit with
                you — as a lens on the day ahead, not a prediction.
              </p>
              <Link
                href={`/glossary/cards/${cotd.slug}`}
                className="smallcaps"
                style={{ display: "inline-block", marginTop: "20px", opacity: 0.55, textDecoration: "underline", textUnderlineOffset: "3px" }}
              >
                Read the full meaning →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <hr className="rule" />

      {/* ── How It Works ─────────────────────────────────── */}
      <section className="surface-ink">
        <div className="container" style={{ paddingTop: "88px", paddingBottom: "88px" }}>

          <p className="smallcaps" style={{ opacity: 0.4, marginBottom: "16px" }}>Method</p>
          <h2 className="display" style={{ fontSize: "clamp(36px, 5vw, 64px)", marginBottom: "64px", maxWidth: "560px" }}>
            How a reading works
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "48px" }}>
            {[
              {
                num: "I",
                title: "Frame the question",
                body: "Lenormand reads what is already in motion — pressures, openings, the shape of things arriving. A clear question gives the cards a surface to land on.",
              },
              {
                num: "II",
                title: "Choose a spread",
                body: "A quick 3-card draw for a focused question, or the full Grand Tableau — all 36 cards across the table for a whole-life reading.",
              },
              {
                num: "III",
                title: "Read the combinations",
                body: "The engine layers proximity, diagonal sight lines, knighting distances, and house positions into a narrative that connects your question to the cards.",
              },
            ].map(({ num, title, body }) => (
              <div key={num}>
                <div
                  className="numeral"
                  style={{ fontSize: "48px", opacity: 0.18, lineHeight: 1, marginBottom: "20px" }}
                >
                  {num}
                </div>
                <h3 style={{ fontFamily: "var(--serif-body)", fontSize: "17px", fontWeight: 500, marginBottom: "10px" }}>
                  {title}
                </h3>
                <p style={{ opacity: 0.55, lineHeight: 1.65, fontSize: "15px" }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="rule" />

      {/* ── The Two Spreads ──────────────────────────────── */}
      <section className="surface-vellum">
        <div className="container" style={{ paddingTop: "88px", paddingBottom: "88px" }}>

          <p className="smallcaps" style={{ opacity: 0.4, marginBottom: "16px" }}>Spreads</p>
          <h2 className="display" style={{ fontSize: "clamp(36px, 5vw, 64px)", marginBottom: "56px" }}>
            Two ways to read
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1px", background: "var(--rule-color-alt)" }}>
            {[
              {
                label: "Triad",
                subtitle: "3-Card Spread",
                body: "Past, present, future — or situation, complication, direction. Three cards in a line build a single clear narrative. The right starting point for a focused question.",
                link: "/setup",
                cta: "Begin a Triad",
              },
              {
                label: "Grand Tableau",
                subtitle: "36-Card Spread",
                body: "Every card laid in a 9×4 grid. Each position is a house; every distance creates meaning. Proximity, diagonals, and knighting combine to produce a whole-life reading.",
                link: "/setup",
                cta: "Begin a Tableau",
              },
            ].map(({ label, subtitle, body, link, cta }) => (
              <div key={label} style={{ padding: "48px 40px", background: "var(--ink-2)" }}>
                <p className="smallcaps" style={{ opacity: 0.4, marginBottom: "12px" }}>{subtitle}</p>
                <h3 className="display" style={{ fontSize: "36px", marginBottom: "16px" }}>{label}</h3>
                <p style={{ opacity: 0.6, lineHeight: 1.65, marginBottom: "32px", fontSize: "15px" }}>{body}</p>
                <Link href={link} className="btn btn-ghost-light" style={{ fontSize: "10px" }}>
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="rule" />

      {/* ── Three Principles ─────────────────────────────── */}
      <section className="surface-ink">
        <div className="container" style={{ paddingTop: "88px", paddingBottom: "88px" }}>

          <p className="smallcaps" style={{ opacity: 0.4, marginBottom: "16px" }}>The System</p>
          <h2 className="display" style={{ fontSize: "clamp(36px, 5vw, 64px)", marginBottom: "64px", maxWidth: "560px" }}>
            What makes Lenormand different
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "40px" }}>
            {[
              {
                title: "Fixed meanings",
                body: "Each card has a fixed meaning. The Rider brings news. The Coffin ends things. The Sun brings clarity. No reversals, no ambiguity — the system is precise by design.",
              },
              {
                title: "Combinations",
                body: "Cards read in pairs and clusters. The Fox beside the Bear suggests deception in positions of power. The Ship next to the Anchor points to a journey that lands somewhere stable.",
              },
              {
                title: "Positional layers",
                body: "In the Grand Tableau, every card sits in a house. The house adds a second layer of meaning — the card's nature filtered through the house's domain.",
              },
            ].map(({ title, body }) => (
              <div key={title} style={{ borderTop: "var(--rule) solid var(--rule-color)", paddingTop: "24px" }}>
                <h3
                  className="italic-display"
                  style={{ fontSize: "22px", marginBottom: "12px" }}
                >
                  {title}
                </h3>
                <p style={{ opacity: 0.55, lineHeight: 1.65, fontSize: "15px" }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="rule" />

      {/* ── Glossary Teaser ──────────────────────────────── */}
      <section className="surface-vellum">
        <div className="container" style={{ paddingTop: "88px", paddingBottom: "88px" }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "24px", marginBottom: "48px" }}>
            <div>
              <p className="smallcaps" style={{ opacity: 0.4, marginBottom: "12px" }}>Reference</p>
              <h2 className="display" style={{ fontSize: "clamp(32px, 5vw, 56px)" }}>
                The 36 cards
              </h2>
            </div>
            <Link href="/glossary" className="btn btn-ghost-dark" style={{ fontSize: "10px" }}>
              Full Glossary
            </Link>
          </div>

          {/* Card grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "clamp(8px, 1.5vw, 16px)",
            }}
          >
            {GLOSSARY_CARDS.map((card) => (
              <Link key={card.id} href={`/glossary/cards/${card.slug}`} style={{ display: "block" }}>
                <div className="card-frame" style={{ width: "100%" }}>
                  <Image src={cardImg(card.id, card.slug)} alt={card.name} fill style={{ objectFit: "cover" }} />
                </div>
                <p
                  className="smallcaps"
                  style={{ textAlign: "center", marginTop: "8px", opacity: 0.5, fontSize: "9px" }}
                >
                  {card.id}. {card.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <hr className="rule" />

      {/* ── Closing CTA ──────────────────────────────────── */}
      <section className="surface-ink" style={{ position: "relative", overflow: "hidden" }}>
        <div className="starfield" />
        <div className="container" style={{ position: "relative", zIndex: 1, paddingTop: "96px", paddingBottom: "96px", textAlign: "center" }}>
          <p className="smallcaps" style={{ opacity: 0.4, marginBottom: "24px" }}>Begin</p>
          <h2 className="display" style={{ fontSize: "clamp(40px, 6vw, 80px)", marginBottom: "32px" }}>
            The cards are ready.
          </h2>
          <p style={{ opacity: 0.55, maxWidth: "440px", margin: "0 auto 48px", lineHeight: 1.65 }}>
            Frame a question. Lay the cards. Let the reading find what you cannot yet see clearly.
          </p>
          <Link href="/setup" className="btn btn-ember" style={{ fontSize: "11px", padding: "16px 32px" }}>
            Begin a Reading
          </Link>
        </div>
      </section>

      <SiteFooter />

      <style>{`
        @media (max-width: 640px) {
          .home-triptych { gap: 10px; }
          .home-triptych .card-frame { width: 72px !important; }
          .home-stats { gap: 24px; }
          .home-glossary-grid {
            grid-template-columns: repeat(5, 1fr) !important;
          }
        }
        @media (max-width: 480px) {
          .home-glossary-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
      `}</style>
    </>
  );
}
