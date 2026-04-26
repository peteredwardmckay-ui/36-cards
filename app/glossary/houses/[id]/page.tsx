import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { SiteFooter } from "@/components/SiteFooter";
import { HOUSE_BY_ID, HOUSE_MEANINGS } from "@/lib/content/houses";
import { CARD_MEANINGS } from "@/lib/content/cards";

export function generateStaticParams() {
  return HOUSE_MEANINGS.map((h) => ({ id: String(h.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id: idParam } = await params;
  const house = HOUSE_BY_ID.get(Number(idParam));
  if (!house) return { title: "House Glossary" };
  return {
    metadataBase: new URL("https://36cards.com"),
    title: `House ${house.id}: ${house.name}`,
    description: `${house.name} meanings and interpretive focus in the 36 Cards Lenormand glossary.`,
    alternates: { canonical: `/glossary/houses/${house.id}` },
    openGraph: {
      title: `House ${house.id}: ${house.name} — 36 Cards Glossary`,
      description: `${house.name} meanings and interpretive focus.`,
      url: `https://36cards.com/glossary/houses/${house.id}`,
      siteName: "36 Cards", type: "article",
      images: [{ url: "https://36cards.com/brand/og-image-1200x630.png", width: 1200, height: 630, alt: `${house.name} glossary page` }],
    },
    twitter: { card: "summary_large_image", title: `House ${house.id}: ${house.name}`, description: house.shortFocus, images: ["https://36cards.com/brand/og-image-1200x630.png"] },
  };
}

function cardImgPath(id: number, slug: string): string {
  const fileSlug = slug === "sun" ? "Sun" : slug === "moon" ? "Moon" : slug;
  return `/cards/traditional/${String(id).padStart(2, "0")}-${fileSlug}.webp`;
}

export default async function HouseGlossaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id    = Number(idParam);
  const house = HOUSE_BY_ID.get(id);
  if (!house) return notFound();

  const idx       = HOUSE_MEANINGS.findIndex((h) => h.id === id);
  const prevHouse = idx > 0 ? HOUSE_MEANINGS[idx - 1] : null;
  const nextHouse = idx < HOUSE_MEANINGS.length - 1 ? HOUSE_MEANINGS[idx + 1] : null;
  const card      = CARD_MEANINGS.find((c) => c.id === id);

  return (
    <>
      <div className="surface-ink">
        <TopNav activePage="glossary" />
      </div>

      <div className="surface-vellum" style={{ minHeight: "100vh" }}>
        <div className="container" style={{ paddingTop: 56, paddingBottom: 96 }}>

          {/* Breadcrumb */}
          <p className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.4, marginBottom: 48 }}>
            <Link href="/glossary" style={{ color: "inherit" }}>Glossary</Link>
            {" / Houses / "}
            House {house.id}
          </p>

          {/* ── Hero ──────────────────────────────────── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: card ? "200px 1fr" : "1fr",
            gap: "clamp(32px, 5vw, 64px)",
            paddingBottom: 56,
            borderBottom: "var(--rule) solid var(--rule-color-alt)",
          }}>
            {card && (
              <div className="card-frame" style={{ width: 200, opacity: 0.75 }}>
                <Image
                  src={cardImgPath(card.id, card.slug)}
                  alt={`${card.name} — native card for House ${house.id}`}
                  fill
                  style={{ objectFit: "cover" }}
                  priority
                />
              </div>
            )}

            <div style={{ paddingTop: 8 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 8 }}>
                <span className="numeral" style={{ fontSize: 56, color: "var(--ember)", lineHeight: 1 }}>
                  {String(house.id).padStart(2, "0")}
                </span>
                <p className="smallcaps" style={{ opacity: 0.4 }}>House</p>
              </div>

              <h1 className="display" style={{ fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 0.95, margin: "0 0 16px" }}>
                <em>{house.name}</em>
              </h1>

              <p className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ember)", opacity: 0.7, marginBottom: 20 }}>
                {house.shortFocus}
              </p>

              <p style={{ fontSize: "clamp(15px, 1.3vw, 18px)", lineHeight: 1.65, opacity: 0.7, maxWidth: 560, marginBottom: 20 }}>
                {house.description}
              </p>

              {card && (
                <p className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.45 }}>
                  Native card ·{" "}
                  <Link href={`/glossary/cards/${card.slug}`} style={{ color: "var(--ember)", textDecoration: "underline", textUnderlineOffset: 3 }}>
                    {card.id}. {card.name}
                  </Link>
                </p>
              )}
            </div>
          </div>

          {/* ── When supportive / when challenged ─────── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1,
            background: "var(--rule-color-alt)",
            margin: "0",
          }}>
            {[
              { label: "When a supportive card lands here", body: house.whenStrong },
              { label: "When a difficult card lands here",  body: house.whenChallenged },
            ].map(({ label, body }) => (
              <div key={label} style={{ padding: "40px 0 40px", background: "var(--vellum)" }}>
                <p className="smallcaps" style={{ opacity: 0.4, marginBottom: 14 }}>{label}</p>
                <p style={{ fontSize: 15, lineHeight: 1.7, opacity: 0.7, maxWidth: 480 }}>{body}</p>
              </div>
            ))}
          </div>
          <hr className="rule" style={{ borderTopColor: "var(--rule-color-alt)" }} />

          {/* ── How to read ───────────────────────────── */}
          <div style={{ padding: "40px 0", borderBottom: "var(--rule) solid var(--rule-color-alt)" }}>
            <p className="smallcaps" style={{ opacity: 0.4, marginBottom: 16 }}>Reading this house</p>
            <p style={{ fontSize: 15, lineHeight: 1.7, opacity: 0.65, maxWidth: 680 }}>
              In the Grand Tableau, every card that lands in position {house.id} is coloured by this
              house&apos;s theme. Read the visiting card first on its own terms, then ask how{" "}
              <em>{house.shortFocus}</em> reshapes its meaning. A supportive card here amplifies the
              house; a difficult card creates friction within it.
            </p>
          </div>

          {/* ── Prev / Next ───────────────────────────── */}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 40 }}>
            {prevHouse ? (
              <Link href={`/glossary/houses/${prevHouse.id}`} className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.5, textDecoration: "none", color: "inherit" }}>
                ← House {prevHouse.id}
              </Link>
            ) : <span />}
            <Link href="/glossary" className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.4, textDecoration: "none", color: "inherit" }}>
              All houses
            </Link>
            {nextHouse ? (
              <Link href={`/glossary/houses/${nextHouse.id}`} className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.5, textDecoration: "none", color: "inherit" }}>
                House {nextHouse.id} →
              </Link>
            ) : <span />}
          </div>

        </div>
      </div>

      <SiteFooter />
    </>
  );
}
