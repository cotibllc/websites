import { tickerMessages } from "@/data/content";

export default function Ticker() {
  // Double the messages so the CSS scroll loop is seamless
  const doubled = [...tickerMessages, ...tickerMessages];

  return (
    <div
      className="bg-synergy-navy border-b border-white/10 overflow-hidden h-ticker flex items-center"
      aria-label="System announcements"
      role="marquee"
    >
      <div className="flex animate-ticker whitespace-nowrap will-change-transform">
        {doubled.map((msg, i) => (
          <span key={i} className="inline-flex items-center gap-4 px-8">
            <span className="font-mono text-[11px] text-synergy-amber tracking-[0.08em]">
              {msg.text}
            </span>
            <span className="font-mono text-[10px] text-white/30 tracking-[0.12em] uppercase">
              — {msg.dept}
            </span>
            <span className="text-synergy-amber/30 text-xs select-none">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
