"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { COOKIE_CHOICES_EVENT, type ConsentChoice } from "@/lib/consent";
import { browserEnv, createAnalytics, type Analytics } from "@/lib/analytics";

// One instance per page load, so GA is never added twice.
let analytics: Analytics | null = null;
function getAnalytics(): Analytics {
  analytics ??= createAnalytics(browserEnv());
  return analytics;
}

const choiceButton =
  "min-h-11 flex-1 md:flex-none md:min-w-[11rem] px-4 py-2.5 border border-white bg-transparent text-white " +
  "font-mono text-xs tracking-widest uppercase transition-colors " +
  "hover:bg-white hover:text-navy active:bg-amber active:border-amber active:text-navy " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber";

/** Loads Google Analytics, or asks first in the EU, EEA, UK and Switzerland. Modeled on corphardcore.com. */
export default function AnalyticsConsent() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const focusOnOpenRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    void getAnalytics().start(() => {
      if (!cancelled) setOpen(true);
    });

    const reopen = () => {
      returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      focusOnOpenRef.current = true;
      setOpen(true);
    };
    window.addEventListener(COOKIE_CHOICES_EVENT, reopen);
    return () => {
      cancelled = true;
      window.removeEventListener(COOKIE_CHOICES_EVENT, reopen);
    };
  }, []);

  useEffect(() => {
    if (open && focusOnOpenRef.current) {
      focusOnOpenRef.current = false;
      panelRef.current?.focus();
    }
  }, [open]);

  const choose = useCallback((choice: ConsentChoice) => {
    getAnalytics().choose(choice);
    setOpen(false);
    returnFocusRef.current?.focus();
    returnFocusRef.current = null;
  }, []);

  if (!open) return null;

  return (
    <section
      ref={panelRef}
      tabIndex={-1}
      id="cookie-consent"
      aria-labelledby="cookie-consent-title"
      className="sticky bottom-0 z-40 bg-slate text-white border-t-4 border-amber focus:outline-none"
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center gap-3 md:gap-8">
        <div className="flex-1 min-w-0">
          <h2 id="cookie-consent-title" className="font-mono text-xs tracking-[0.18em] uppercase text-amber">
            Analytics cookies
          </h2>
          <p className="text-sm leading-snug mt-1 text-white">
            We would like to use Google Analytics cookies to count visits and see which pages people read.
            Nothing loads until you choose. You can change this later with Cookie choices at the bottom of the page.{" "}
            <Link
              href="/privacy"
              className="whitespace-nowrap underline underline-offset-2 text-amber hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
            >
              Privacy policy
            </Link>
          </p>
        </div>
        <div role="group" aria-label="Analytics cookie choice" className="flex gap-2 shrink-0">
          <button type="button" className={choiceButton} onClick={() => choose("granted")}>
            Accept analytics
          </button>
          <button type="button" className={choiceButton} onClick={() => choose("denied")}>
            Reject analytics
          </button>
        </div>
      </div>
    </section>
  );
}
