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
          url: "https://36cards.com/brand/opengraph-share.png",
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
      images: ["https://36cards.com/brand/opengraph-share.png"],
    },
  };
}

export default async function TechniquePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const technique = TECHNIQUES_BY_SLUG.get(slug);
  if (!technique) return notFound();

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <BrandHeader compact />
        <article className="rounded-2xl border border-[color:var(--brand-border)] bg-[color:var(--brand-panel)] p-5 shadow-ritual">
          <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--brand-muted)]">
            <Link href="/glossary" className="hover:underline">Glossary</Link> / Techniques
          </p>
          <h1 className="text-3xl font-semibold">{technique.title}</h1>
          <p className="mt-2 text-sm text-[color:var(--brand-muted)]">{technique.summary}</p>
          <p className="mt-3 text-sm text-[color:var(--brand-text)]">
            This technique matters because the reading engine is not just summarizing nearby cards. It uses structural relationships on
            the board to decide which pressures are immediate, which themes are developing, and which patterns belong to the wider story.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[color:var(--brand-muted)]">
            {technique.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>

          <section className="mt-5 rounded-xl border border-[color:var(--brand-border)] bg-white/35 p-4">
            <h2 className="text-lg font-semibold">Why It Matters In Practice</h2>
            <p className="mt-2 text-sm text-[color:var(--brand-muted)]">
              If you see this technique mentioned in a reading, it usually means the interpretation is leaning on board structure rather
              than just symbolic keywords. That is often where the reading becomes more precise, because it explains not only what a card
              means, but how it is acting in relation to the rest of the spread.
            </p>
          </section>
        </article>
        <BrandFooter />
      </div>
    </main>
  );
}
