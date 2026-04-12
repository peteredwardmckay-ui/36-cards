import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1
        className="mb-4 text-6xl font-bold"
        style={{ fontFamily: "var(--font-display)" }}
      >
        404
      </h1>
      <p
        className="mb-8 text-lg opacity-70"
        style={{ fontFamily: "var(--font-body)" }}
      >
        This card wasn&apos;t in the deck.
      </p>
      <Link
        href="/"
        className="inline-block rounded-lg px-6 py-3 text-sm font-medium underline underline-offset-4 hover:opacity-80"
      >
        Return to the table
      </Link>
    </div>
  );
}
