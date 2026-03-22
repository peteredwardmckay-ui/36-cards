import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reveal the Cards - 36 Cards",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function RevealLayout({ children }: { children: React.ReactNode }) {
  return children;
}
