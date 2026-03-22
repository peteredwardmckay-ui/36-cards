import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ritual Preparation - 36 Cards",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function RitualLayout({ children }: { children: React.ReactNode }) {
  return children;
}
