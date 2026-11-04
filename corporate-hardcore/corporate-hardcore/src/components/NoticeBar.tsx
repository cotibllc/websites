import Link from "next/link";
import { SUBSCRIBE_ASK, SUBSCRIBE_HREF } from "@/lib/subscribe-ask";

/**
 * Slim internal notice strip above the nav on every page. One ask, one link,
 * server rendered with a fixed height so it never shifts the layout.
 */
export default function NoticeBar() {
  return (
    <aside
      aria-label="Notice"
      id="notice-bar"
      className="bg-synergy-amber-light border-b border-synergy-rule text-synergy-dark"
    >
      <div className="mx-auto content-max px-4 h-8 flex items-center gap-3 min-w-0 font-mono text-[11px] tracking-[0.06em]">
        <span className="flex-shrink-0 border border-synergy-amber text-synergy-amber px-1.5 leading-4 text-[10px] tracking-[0.16em]">
          {SUBSCRIBE_ASK.label}
        </span>
        <span className="hidden sm:inline truncate min-w-0 text-synergy-muted">{SUBSCRIBE_ASK.line}</span>
        <Link
          href={SUBSCRIBE_HREF}
          className="flex-shrink-0 ml-auto sm:ml-0 underline underline-offset-2 decoration-synergy-rule text-synergy-navy hover:text-synergy-amber hover:decoration-synergy-amber focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-synergy-navy whitespace-nowrap"
        >
          {SUBSCRIBE_ASK.link} →
        </Link>
      </div>
    </aside>
  );
}
