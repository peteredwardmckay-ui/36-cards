import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reading Setup - 36 Cards",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
