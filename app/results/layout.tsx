import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Reading Results - 36 Cards",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
