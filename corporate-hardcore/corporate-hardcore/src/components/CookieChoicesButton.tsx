"use client";

import { COOKIE_CHOICES_EVENT } from "@/lib/consent";

/** Footer control that reopens the analytics cookie banner. */
export default function CookieChoicesButton() {
  return (
    <button
      type="button"
      aria-controls="cookie-consent"
      onClick={() => window.dispatchEvent(new Event(COOKIE_CHOICES_EVENT))}
      className="font-mono text-[9px] tracking-[0.1em] uppercase text-white/60 hover:text-white transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      Cookie choices
    </button>
  );
}
