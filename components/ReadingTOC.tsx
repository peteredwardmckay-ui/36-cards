"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface TOCItem {
  id: string;
  title: string;
}

interface ReadingTOCProps {
  sections: TOCItem[];
}

export function ReadingTOC({ sections }: ReadingTOCProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const tocRef = useRef<HTMLElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);

  // All items: sections + conclusion
  const items: TOCItem[] = [...sections, { id: "closing", title: "Conclusion" }];

  // Track which section is in view
  useEffect(() => {
    const ids = items.map((item) => item.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible section
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0,
      },
    );

    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections.length]);

  // Track sticky state with sentinel element
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Auto-scroll the active button into view within the horizontal scrollable
  useEffect(() => {
    if (activeButtonRef.current && tocRef.current) {
      const container = tocRef.current;
      const button = activeButtonRef.current;
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      if (
        buttonRect.left < containerRect.left ||
        buttonRect.right > containerRect.right
      ) {
        button.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activeId]);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  if (dismissed) return null;

  return (
    <>
      {/* Sentinel: when this scrolls out of view, TOC becomes sticky */}
      <div ref={sentinelRef} className="h-0" aria-hidden="true" />

      <nav
        ref={tocRef}
        aria-label="Reading sections"
        className={`
          z-30 transition-all duration-200
          ${isSticky
            ? "sticky top-0 -mx-5 rounded-none border-b border-[color:var(--theme-border,var(--brand-border))] bg-[color:var(--theme-bg,var(--brand-bg))] px-5 py-2.5 shadow-sm"
            : "ritual-panel-soft mt-4 px-4 py-3"
          }
        `}
      >
        <div className="flex items-center gap-2">
          <p className="shrink-0 text-[10px] font-bold uppercase tracking-[0.12em] text-[color:var(--theme-muted,var(--brand-muted))]">
            Sections
          </p>
          <div className="scrollbar-hide flex flex-1 gap-1.5 overflow-x-auto">
            {items.map((item) => {
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  ref={isActive ? activeButtonRef : undefined}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={`
                    shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition
                    ${isActive
                      ? "bg-[color:var(--theme-accent,var(--brand-accent))] text-white"
                      : "text-[color:var(--theme-muted,var(--brand-muted))] hover:bg-[color:var(--theme-border,var(--brand-border))] hover:text-[color:var(--theme-text,var(--brand-text))]"
                    }
                  `}
                >
                  {item.title}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="shrink-0 rounded-full p-1 text-[color:var(--theme-muted,var(--brand-muted))] transition hover:text-[color:var(--theme-text,var(--brand-text))]"
            aria-label="Dismiss section navigation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>
      </nav>
    </>
  );
}
