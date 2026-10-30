"use client";

import { useSyncExternalStore } from "react";
import { COOKIE_CHOICES_EVENT } from "@/lib/consent";

const noopSubscribe = () => () => {};

/** Footer control that reopens the analytics cookie banner. Hidden until JavaScript runs, so it is never a dead control. */
export default function CookieChoicesButton() {
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  return (
    <button
      type="button"
      hidden={!hydrated}
      aria-controls="cookie-consent"
      onClick={() => window.dispatchEvent(new Event(COOKIE_CHOICES_EVENT))}
      className="whitespace-nowrap uppercase tracking-widest text-xs hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
    >
      Cookie choices
    </button>
  );
}
