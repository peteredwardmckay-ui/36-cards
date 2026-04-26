"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const THEME_KEY = "36cards-theme";

export function useTheme() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY);
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    const isLight = stored !== null ? stored === "light" : prefersLight;
    setLight(isLight);
    document.documentElement.setAttribute("data-theme", isLight ? "light" : "dark");
  }, []);

  const toggle = useCallback(() => {
    setLight((current) => {
      const next = !current;
      const value = next ? "light" : "dark";
      localStorage.setItem(THEME_KEY, value);
      document.documentElement.setAttribute("data-theme", value);
      return next;
    });
  }, []);

  return { light, toggle };
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

interface TopNavProps {
  activePage?: "home" | "setup" | "glossary" | "journal";
}

export function TopNav({ activePage }: TopNavProps) {
  const { light, toggle } = useTheme();
  const pathname = usePathname();

  const active = activePage ?? (
    pathname === "/" ? "home" :
    pathname?.startsWith("/setup") ? "setup" :
    pathname?.startsWith("/glossary") ? "glossary" :
    pathname?.startsWith("/journal") ? "journal" :
    undefined
  );

  return (
    <nav className="topnav">
      <Link href="/" className="topnav-wordmark">
        <span className="num">36</span>
        Cards
      </Link>

      <div className="topnav-links">
        <Link href="/" className={active === "home" ? "active" : ""}>
          Home
        </Link>
        <Link href="/setup" className={active === "setup" ? "active" : ""}>
          Begin a Reading
        </Link>
        <Link href="/glossary" className={active === "glossary" ? "active" : ""}>
          Glossary
        </Link>
        <Link href="/journal" className={active === "journal" ? "active" : ""}>
          Journal
        </Link>
        <button
          onClick={toggle}
          className="topnav-toggle"
          aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
        >
          {light ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>
    </nav>
  );
}
