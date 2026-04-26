import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { SiteFooter } from "@/components/SiteFooter";
import { TECHNIQUES, TECHNIQUES_BY_SLUG } from "@/lib/content/techniques";

export function generateStaticParams() {
  return TECHNIQUES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = TECHNIQUES_BY_SLUG.get(slug);
  if (!t) return { title: "Technique Glossary" };
  return {
    metadataBase: new URL("https://36cards.com"),
    title: t.title,
    description: `${t.title}: ${t.summary}`,
    alternates: { canonical: `/glossary/techniques/${t.slug}` },
    openGraph: {
      title: `${t.title} — 36 Cards Glossary`,
      description: t.summary,
      url: `https://36cards.com/glossary/techniques/${t.slug}`,
      siteName: "36 Cards", type: "article",
      images: [{ url: "https://36cards.com/brand/og-image-1200x630.png", width: 1200, height: 630, alt: `${t.title} glossary page` }],
    },
    twitter: { card: "summary_large_image", title: `${t.title} — 36 Cards Glossary`, description: t.summary, images: ["https://36cards.com/brand/og-image-1200x630.png"] },
  };
}

export default async function TechniquePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = TECHNIQUES_BY_SLUG.get(slug);
  if (!t) return notFound();

  const idx      = TECHNIQUES.findIndex((x) => x.slug === slug);
  const prevTech = idx > 0 ? TECHNIQUES[idx - 1] : null;
  const nextTech = idx < TECHNIQUES.length - 1 ? TECHNIQUES[idx + 1] : null;

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
            {" / Techniques / "}
            {t.title}
          </p>

          {/* ── Hero ──────────────────────────────────── */}
          <div style={{
            paddingBottom: 56,
            borderBottom: "var(--rule) solid var(--rule-color-alt)",
            maxWidth: 760,
          }}>
            <p className="smallcaps" style={{ color: "var(--ember)", marginBottom: 20, opacity: 0.8 }}>
              Reading technique
            </p>
            <h1 className="display" style={{ fontSize: "clamp(44px, 6vw, 80px)", lineHeight: 0.95, margin: "0 0 24px" }}>
              <em>{t.title}</em>
            </h1>
            <p style={{ fontSize: "clamp(16px, 1.4vw, 20px)", lineHeight: 1.6, opacity: 0.65 }}>
              {t.summary}
            </p>
          </div>

          {/* ── Description ───────────────────────────── */}
          <div style={{ padding: "40px 0", borderBottom: "var(--rule) solid var(--rule-color-alt)", maxWidth: 720 }}>
            <p style={{ fontSize: 17, lineHeight: 1.75, opacity: 0.7 }}>{t.description}</p>
          </div>

          {/* ── How it works ──────────────────────────── */}
          <div style={{ padding: "40px 0", borderBottom: "var(--rule) solid var(--rule-color-alt)" }}>
            <p className="smallcaps" style={{ opacity: 0.4, marginBottom: 24 }}>How it works</p>
            <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 16, maxWidth: 680 }}>
              {t.howItWorks.map((point, i) => (
                <li key={i} style={{ display: "flex", gap: 20, alignItems: "baseline" }}>
                  <span className="numeral" style={{ color: "var(--ember)", fontSize: 20, flexShrink: 0, opacity: 0.55, minWidth: 28 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: 15, lineHeight: 1.7, opacity: 0.7 }}>{point}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* ── Why it matters + Example ──────────────── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1,
            background: "var(--rule-color-alt)",
            marginBottom: 0,
          }}>
            <div style={{ padding: "40px 0 40px", background: "var(--vellum)" }}>
              <p className="smallcaps" style={{ opacity: 0.4, marginBottom: 16 }}>Why it matters</p>
              <p style={{ fontSize: 15, lineHeight: 1.7, opacity: 0.7, maxWidth: 440 }}>{t.whyItMatters}</p>
            </div>
            <div style={{ padding: "40px 0 40px 40px", background: "var(--vellum)" }}>
              <p className="smallcaps" style={{ opacity: 0.4, marginBottom: 16 }}>Example</p>
              <p style={{ fontSize: 15, lineHeight: 1.7, fontStyle: "italic", opacity: 0.65, maxWidth: 440 }}>{t.example}</p>
            </div>
          </div>
          <hr className="rule" style={{ borderTopColor: "var(--rule-color-alt)" }} />

          {/* ── Other techniques ──────────────────────── */}
          {(prevTech || nextTech) && (
            <div style={{ padding: "40px 0", borderBottom: "var(--rule) solid var(--rule-color-alt)" }}>
              <p className="smallcaps" style={{ opacity: 0.4, marginBottom: 20 }}>Other techniques</p>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {TECHNIQUES.filter((x) => x.slug !== t.slug).map((x) => (
                  <Link
                    key={x.slug}
                    href={`/glossary/techniques/${x.slug}`}
                    className="mono"
                    style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.5, textDecoration: "none", color: "inherit" }}
                  >
                    {x.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── Prev / Next ───────────────────────────── */}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 40 }}>
            {prevTech ? (
              <Link href={`/glossary/techniques/${prevTech.slug}`} className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.5, textDecoration: "none", color: "inherit" }}>
                ← {prevTech.title}
              </Link>
            ) : <span />}
            <Link href="/glossary" className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.4, textDecoration: "none", color: "inherit" }}>
              All techniques
            </Link>
            {nextTech ? (
              <Link href={`/glossary/techniques/${nextTech.slug}`} className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.5, textDecoration: "none", color: "inherit" }}>
                {nextTech.title} →
              </Link>
            ) : <span />}
          </div>

        </div>
      </div>

      <SiteFooter />
    </>
  );
}
