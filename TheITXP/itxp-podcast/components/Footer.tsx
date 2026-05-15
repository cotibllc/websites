const SOCIAL_LINKS = [
  { href: "https://www.youtube.com/@theitxp", label: "YouTube" },
  { href: "https://www.tiktok.com/@the.it.xp", label: "TikTok" },
  { href: "https://twitter.com/theitxp", label: "Twitter / X" },
  { href: "https://podcasts.apple.com/us/podcast/the-it-xp/id1330172385", label: "Apple Podcasts" },
  { href: "https://theitxp.libsyn.com/rss", label: "RSS" },
];

export default function Footer() {
  return (
    <footer className="bg-navy border-t border-slate text-steel">
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-sm font-mono">© {new Date().getFullYear()} COTIB LLC · The IT XP</p>
        <ul className="flex flex-wrap gap-5 text-sm">
          {SOCIAL_LINKS.map(({ href, label }) => (
            <li key={href}>
              <a href={href} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors uppercase tracking-widest text-xs">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
