import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { SiteFooter } from "@/components/SiteFooter";
import { CARD_BY_SLUG, CARD_MEANINGS } from "@/lib/content/cards";
import { HOUSE_MEANINGS } from "@/lib/content/houses";
import { getTopPairsForCard } from "@/lib/content/pairs";

export function generateStaticParams() {
  return CARD_MEANINGS.map((card) => ({ slug: card.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const card = CARD_BY_SLUG.get(slug);
  if (!card) return { title: "Card Glossary" };
  return {
    metadataBase: new URL("https://36cards.com"),
    title: `${card.id}. ${card.name}`,
    description: `${card.name} Lenormand meanings, core variants, and domain-specific interpretations.`,
    alternates: { canonical: `/glossary/cards/${card.slug}` },
    openGraph: {
      title: `${card.id}. ${card.name} — 36 Cards Glossary`,
      description: `${card.name} Lenormand meanings, core variants, and domain-specific interpretations.`,
      url: `https://36cards.com/glossary/cards/${card.slug}`,
      siteName: "36 Cards", type: "article",
      images: [{ url: "https://36cards.com/brand/og-image-1200x630.png", width: 1200, height: 630, alt: `${card.name} glossary page` }],
    },
    twitter: { card: "summary_large_image", title: `${card.id}. ${card.name} — 36 Cards Glossary`, description: `${card.name} Lenormand meanings.`, images: ["https://36cards.com/brand/og-image-1200x630.png"] },
  };
}

function cardImgPath(id: number, slug: string): string {
  const fileSlug = slug === "sun" ? "Sun" : slug === "moon" ? "Moon" : slug;
  return `/cards/traditional/${String(id).padStart(2, "0")}-${fileSlug}.webp`;
}

export default async function CardGlossaryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = CARD_BY_SLUG.get(slug);
  if (!card) return notFound();

  const idx      = CARD_MEANINGS.findIndex((c) => c.slug === slug);
  const prevCard = idx > 0 ? CARD_MEANINGS[idx - 1] : null;
  const nextCard = idx < CARD_MEANINGS.length - 1 ? CARD_MEANINGS[idx + 1] : null;
  const house    = HOUSE_MEANINGS.find((h) => h.id === card.id);
  const topPairs = getTopPairsForCard(card.id, 6);

  return (
    <>
      <div className="surface-ink" style={{ minHeight: "100vh" }}>
        <TopNav activePage="glossary" />
        <div className="container" style={{ paddingTop: 56, paddingBottom: 96 }}>

          {/* Breadcrumb */}
          <p className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.4, marginBottom: 48 }}>
            <Link href="/glossary" style={{ color: "inherit" }}>Glossary</Link>
            {" / Cards / "}
            {card.name}
          </p>

          {/* ── Hero ──────────────────────────────────── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "200px 1fr",
            gap: "clamp(32px, 5vw, 64px)",
            paddingBottom: 56,
            borderBottom: "var(--rule) solid var(--rule-color)",
          }}>
            {/* Card image */}
            <div className="card-frame" style={{ width: 200 }}>
              <Image
                src={cardImgPath(card.id, card.slug)}
                alt={`${card.name} — Lenormand`}
                fill
                style={{ objectFit: "cover" }}
                priority
              />
            </div>

            {/* Text */}
            <div style={{ paddingTop: 8 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 20, marginBottom: 16 }}>
                <span className="numeral" style={{ fontSize: 56, color: "var(--ember)", lineHeight: 1 }}>
                  {String(card.id).padStart(2, "0")}
                </span>
                <h1 className="display" style={{ fontSize: "clamp(40px, 5vw, 72px)", lineHeight: 0.95, margin: 0 }}>
                  <em>{card.name}</em>
                </h1>
              </div>

              <p className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.45, marginBottom: 20 }}>
                {card.keywords.join(" · ")}
              </p>

              <p style={{ fontSize: "clamp(16px, 1.4vw, 20px)", lineHeight: 1.6, opacity: 0.75, maxWidth: 560, marginBottom: 20 }}>
                {card.coreMeaning}
              </p>

              {house && (
                <p className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.45 }}>
                  Native house ·{" "}
                  <Link href={`/glossary/houses/${house.id}`} style={{ color: "var(--ember)", textDecoration: "underline", textUnderlineOffset: 3 }}>
                    House {house.id} — {house.shortFocus}
                  </Link>
                </p>
              )}
            </div>
          </div>

          {/* ── Caution + Action ──────────────────────── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1,
            background: "var(--rule-color)",
            margin: "0",
          }}>
            {[
              { label: "Caution",       body: card.caution, padding: "32px 40px 32px 0" },
              { label: "Useful action", body: card.action,  padding: "32px 0 32px 40px" },
            ].map(({ label, body, padding }) => (
              <div key={label} style={{ padding, background: "var(--vellum)" }}>
                <p className="smallcaps" style={{ opacity: 0.4, marginBottom: 12 }}>{label}</p>
                <p style={{ fontSize: 15, lineHeight: 1.65, opacity: 0.7 }}>{body}</p>
              </div>
            ))}
          </div>
          <hr className="rule" style={{ borderTopColor: "var(--rule-color)" }} />

          {/* ── Core Variants ─────────────────────────── */}
          <div style={{ padding: "40px 0", borderBottom: "var(--rule) solid var(--rule-color)" }}>
            <p className="smallcaps" style={{ opacity: 0.4, marginBottom: 20 }}>Core variants</p>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
              {card.coreVariants.map((v, i) => (
                <li key={i} style={{ display: "flex", gap: 16, alignItems: "baseline" }}>
                  <span className="numeral" style={{ color: "var(--ember)", opacity: 0.5, fontSize: 13, flexShrink: 0 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: 15, lineHeight: 1.65, opacity: 0.7 }}>{v}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Domain variants ───────────────────────── */}
          <div style={{ padding: "40px 0", borderBottom: "var(--rule) solid var(--rule-color)" }}>
            <p className="smallcaps" style={{ opacity: 0.4, marginBottom: 20 }}>By domain</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "clamp(16px, 3vw, 40px)" }}>
              {(["general", "love", "work"] as const).map((domain) => (
                <div key={domain} style={{ borderTop: "var(--rule) solid var(--rule-color)", paddingTop: 16 }}>
                  <p className="smallcaps" style={{ opacity: 0.4, marginBottom: 10 }}>{domain}</p>
                  <p style={{ fontSize: 14, lineHeight: 1.65, opacity: 0.65 }}>
                    {card.domainVariants[domain]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Common pairs ──────────────────────────── */}
          {topPairs.length > 0 && (
            <div style={{ padding: "40px 0", borderBottom: "var(--rule) solid var(--rule-color)" }}>
              <p className="smallcaps" style={{ opacity: 0.4, marginBottom: 8 }}>Common pairs</p>
              <p style={{ fontSize: 14, opacity: 0.5, marginBottom: 24, lineHeight: 1.55 }}>
                When {card.name} appears beside these cards:
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 1, background: "var(--rule-color)" }}>
                {topPairs.map((pair) => {
                  const partnerId = pair.a === card.id ? pair.b : pair.a;
                  const partner   = CARD_MEANINGS.find((c) => c.id === partnerId);
                  if (!partner) return null;
                  return (
                    <div key={pair.key} style={{ padding: "24px", background: "var(--vellum)" }}>
                      <Link
                        href={`/glossary/cards/${partner.slug}`}
                        className="display"
                        style={{ fontSize: 22, fontStyle: "italic", textDecoration: "none", color: "inherit" }}
                      >
                        {partner.id}. {partner.name}
                      </Link>
                      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                        {(["general", "love", "work"] as const).map((d) => (
                          <p key={d} style={{ margin: 0, fontSize: 13, lineHeight: 1.55, opacity: 0.6 }}>
                            <span className="mono" style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.7, marginRight: 6 }}>{d}</span>
                            {pair.meanings[d]}
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Technique notes ───────────────────────── */}
          <div style={{ padding: "40px 0", borderBottom: "var(--rule) solid var(--rule-color)" }}>
            <p className="smallcaps" style={{ opacity: 0.4, marginBottom: 20 }}>Technique notes</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(16px, 4vw, 48px)" }}>
              {[
                { label: "Knighting", items: card.techniqueSnippets.knighting },
                { label: "Diagonals", items: card.techniqueSnippets.diagonal },
              ].map(({ label, items }) => (
                <div key={label}>
                  <p className="smallcaps" style={{ opacity: 0.4, marginBottom: 14 }}>{label}</p>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                    {items.map((item, i) => (
                      <li key={i} style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                        <span style={{ color: "var(--ember)", fontSize: 16, flexShrink: 0, lineHeight: 1 }}>—</span>
                        <span style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.65 }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* ── Prev / Next ───────────────────────────── */}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 40 }}>
            {prevCard ? (
              <Link href={`/glossary/cards/${prevCard.slug}`} className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.5, textDecoration: "none", color: "inherit" }}>
                ← {String(prevCard.id).padStart(2, "0")} {prevCard.name}
              </Link>
            ) : <span />}
            <Link href="/glossary" className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.4, textDecoration: "none", color: "inherit" }}>
              All cards
            </Link>
            {nextCard ? (
              <Link href={`/glossary/cards/${nextCard.slug}`} className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.5, textDecoration: "none", color: "inherit" }}>
                {String(nextCard.id).padStart(2, "0")} {nextCard.name} →
              </Link>
            ) : <span />}
          </div>

        </div>
      </div>

      <SiteFooter />

    </>
  );
}
