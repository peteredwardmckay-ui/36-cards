import Link from "next/link";

interface SiteFooterProps {
  spreadLabel?: string;
}

export function SiteFooter({ spreadLabel }: SiteFooterProps) {
  return (
    <footer className="sitefooter">
      <div className="sitefooter-left">
        <span>© 2026 Peter McKay · 36cards.com</span>
        {spreadLabel && <span>{spreadLabel}</span>}
        <span>For reflective purposes only — not advice of any kind.</span>
      </div>
      <div className="sitefooter-right">
        <a
          href="https://ko-fi.com/A0A11UE729"
          target="_blank"
          rel="noopener noreferrer"
        >
          Support on Ko-fi
        </a>
      </div>
    </footer>
  );
}
