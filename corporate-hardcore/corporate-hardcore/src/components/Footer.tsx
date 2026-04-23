import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-synergy-dark text-white/40 border-t border-white/10 mt-auto">
      <div className="mx-auto content-max px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="font-mono text-[10px] tracking-[0.08em] leading-relaxed">
          <p>© SYNERGY CORP. All rights reserved. Synergy not guaranteed.</p>
          <p>This portal is monitored for quality assurance. Last updated: never.</p>
        </div>
        <div className="font-mono text-[10px] tracking-[0.08em] text-right">
          <p className="text-white/30">MORRISON, C.</p>
          <p className="text-white/20">Last login: 18 years ago</p>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="mx-auto content-max px-4 py-2 flex items-center gap-4">
          <Link href="/privacy" className="font-mono text-[9px] tracking-[0.1em] uppercase text-white/25 hover:text-white/50 transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="font-mono text-[9px] tracking-[0.1em] uppercase text-white/25 hover:text-white/50 transition-colors">
            Terms
          </Link>
          <Link href="/contact" className="font-mono text-[9px] tracking-[0.1em] uppercase text-white/25 hover:text-white/50 transition-colors">
            Contact
          </Link>
          <span className="font-mono text-[9px] text-white/20 ml-auto italic">
            Circle Back. Never Return.
          </span>
        </div>
      </div>
    </footer>
  );
}
