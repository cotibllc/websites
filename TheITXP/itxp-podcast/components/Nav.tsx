import Link from "next/link";

const NAV_LINKS = [
  { href: "/episodes", label: "Episodes" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Nav() {
  return (
    <header className="bg-navy text-white border-b border-slate">
      <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-4">
        <Link href="/" className="font-condensed font-bold text-2xl tracking-tight uppercase leading-none hover:opacity-90 transition-opacity">
          THE IT <span className="text-amber">XP</span>
        </Link>
        <ul className="flex flex-wrap gap-6 text-sm font-medium">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className="text-steel hover:text-white transition-colors uppercase tracking-widest text-xs">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
