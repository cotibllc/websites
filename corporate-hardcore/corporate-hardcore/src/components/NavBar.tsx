import Link from "next/link";
import SystemClock from "./SystemClock";

const navLinks = [
  { label: "EPISODES",    href: "/episodes" },
  { label: "FIELD NOTES", href: "/blog" },
  { label: "GLOSSARY",    href: "/glossary" },
  { label: "CHARACTERS",  href: "/characters" },
  { label: "MERCH",       href: "/merch" },
  { label: "ABOUT",       href: "/about" },
];

export default function NavBar() {
  return (
    <header className="sticky top-0 z-50 bg-synergy-navy text-white border-b border-synergy-navy/80 animate-flicker">
      <div className="mx-auto content-max px-4 h-nav flex items-center justify-between gap-4">

        {/* Left — brand */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          {/* Building icon */}
          <svg
            width="18" height="18" viewBox="0 0 18 18" fill="none"
            xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
          >
            <rect x="1" y="4" width="16" height="13" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            <rect x="4" y="7" width="2" height="2" fill="currentColor"/>
            <rect x="8" y="7" width="2" height="2" fill="currentColor"/>
            <rect x="12" y="7" width="2" height="2" fill="currentColor"/>
            <rect x="4" y="11" width="2" height="2" fill="currentColor"/>
            <rect x="12" y="11" width="2" height="2" fill="currentColor"/>
            <rect x="7" y="11" width="4" height="6" fill="currentColor"/>
            <rect x="5" y="1" width="8" height="3" stroke="currentColor" strokeWidth="1.2" fill="none"/>
          </svg>
          <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-white/90 hidden sm:block">
            Synergy Corp Internal Portal
          </span>
          <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-white/90 sm:hidden">
            SYNERGY CORP
          </span>
        </Link>

        {/* Center — nav links */}
        <nav className="hidden md:flex items-center gap-0" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-mono text-[11px] tracking-[0.12em] uppercase px-3 py-1.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right — clock + user */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <SystemClock />
          <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-white/60 hidden lg:block">
            Morrison, C. — IT Dept
          </span>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="md:hidden border-t border-white/10 flex overflow-x-auto" aria-label="Mobile navigation">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="font-mono text-[10px] tracking-[0.1em] uppercase px-3 py-2 text-white/70 hover:text-white whitespace-nowrap flex-shrink-0"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
