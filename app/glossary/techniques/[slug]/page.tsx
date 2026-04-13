import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandHeader } from "@/components/BrandHeader";
import { BrandFooter } from "@/components/BrandFooter";
import { TECHNIQUES, TECHNIQUES_BY_SLUG } from "@/lib/content/techniques";

export function generateStaticParams() {
  return TECHNIQUES.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const technique = TECHNIQUES_BY_SLUG.get(slug);

  if (!technique) {
    return {
      metadataBase: new URL("https://36cards.com"),
      title: "Technique Glossary",
      description: "Lenormand reading techniques and reference notes.",
      alternates: {
        canonical: "/glossary/techniques",
      },
    };
  }

  return {
    metadataBase: new URL("https://36cards.com"),
    title: technique.title,
    description: `${technique.title}: ${technique.summary}`,
    alternates: {
      canonical: `/glossary/techniques/${technique.slug}`,
    },
    openGraph: {
      title: `${technique.title} - 36 Cards Glossary`,
      description: `${technique.title}: ${technique.summary}`,
      url: `https://36cards.com/glossary/techniques/${technique.slug}`,
      siteName: "36 Cards",
      type: "article",
      images: [
        {
          url: "https://36cards.com/brand/og-image-1200x630.png",
          width: 1200,
          height: 630,
          alt: `${technique.title} glossary page`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${technique.title} - 36 Cards Glossary`,
      description: `${technique.title}: ${technique.summary}`,
      images: ["https://36cards.com/brand/og-image-1200x630.png"],
    },
  };
}

export default async function TechniquePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const technique = TECHNIQUES_BY_SLUG.get(slug);
  if (!technique) return notFound();

  const techIndex = TECHNIQUES.findIndex((t) => t.slug === slug);
  const prevTech = techIndex > 0 ? TECHNIQUES[techIndex - 1] : null;
  const nextTech = techIndex < TECHNIQUES.length - 1 ? TECHNIQUES[techIndex + 1] : null;

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <BrandHeader compact />
        <article className="rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-panel)] p-5 shadow-ritual">
          <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--brand-muted)]">
            <Link href="/glossary" className="hover:underline">Glossary</Link> / Techniques
          </p>
          <h1 className="mt-2 text-3xl font-semibold">{technique.title}</h1>
          <p className="mt-2 text-sm text-[color:var(--brand-muted)]">{technique.summary}</p>
          <p className="mt-3 text-sm leading-relaxed text-[color:var(--brand-text)]">{technique.description}</p>

          <section className="mt-5">
            <h2 className="text-xl font-semibold">How It Works</h2>
            <ul className="mt-3 space-y-3 text-sm text-[color:var(--brand-muted)]">
              {technique.howItWorks.map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--brand-accent)]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-5 rounded-xl border border-[color:var(--brand-border)] bg-white/35 p-4">
            <h2 className="text-lg font-semibold">Why It Matters</h2>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--brand-muted)]">{technique.whyItMatters}</p>
          </section>

          <section className="mt-5 rounded-xl border border-[color:var(--brand-border)] bg-white/35 p-4">
            <h2 className="text-lg font-semibold">Example</h2>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--brand-muted)] italic">{technique.example}</p>
          </section>

          <nav className="mt-6 flex items-center justify-between border-t border-[color:var(--brand-border)] pt-4">
            {prevTech ? (
              <Link
                href={`/glossary/techniques/${prevTech.slug}`}
                className="text-sm text-[color:var(--brand-muted)] hover:text-[color:var(--brand-text)] hover:underline"
              >
                &larr; {prevTech.title}
              </Link>
            ) : (
              <span />
            )}
            {nextTech ? (
              <Link
                href={`/glossary/techniques/${nextTech.slug}`}
                className="text-sm text-[color:var(--brand-muted)] hover:text-[color:var(--brand-text)] hover:underline"
              >
                {nextTech.title} &rarr;
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
