"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  COOKIE_CHOICES_EVENT,
  CONSENT_STORAGE_KEY,
  GA_MEASUREMENT_ID,
  analyticsDecision,
  parseChoice,
  parseRegion,
  type ConsentChoice,
  type ConsentRegion,
} from "@/lib/consent";

type GaWindow = Window & { gtag?: (...args: unknown[]) => void };

const GA_DISABLE_KEY = `ga-disable-${GA_MEASUREMENT_ID}`;
const GA_COOKIES = ["_ga", `_ga_${GA_MEASUREMENT_ID.replace(/^G-/, "")}`];

let gaLoaded = false;

/** GA's documented per-property kill switch: window["ga-disable-<ID>"] = true. */
function setGaDisabled(disabled: boolean) {
  Reflect.set(window, GA_DISABLE_KEY, disabled);
}

/** Adds gtag.js to the page. Nothing from Google loads before this runs. */
function loadGa(mode: "load-default" | "load-consented") {
  const w = window as GaWindow;
  setGaDisabled(false);
  if (gaLoaded) {
    w.gtag?.("consent", "update", { analytics_storage: "granted" });
    return;
  }
  gaLoaded = true;
  const consentDefault =
    mode === "load-consented"
      ? "gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'granted'});"
      : "";
  const init = document.createElement("script");
  init.id = "google-analytics";
  init.text =
    "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;" +
    consentDefault +
    `gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');`;
  document.head.appendChild(init);
  const src = document.createElement("script");
  src.async = true;
  src.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(src);
}

/** Stops GA on this page and removes its cookies after a Reject. */
function stopGa() {
  const w = window as GaWindow;
  setGaDisabled(true);
  w.gtag?.("consent", "update", { analytics_storage: "denied" });
  const host = window.location.hostname;
  const parts = host.split(".");
  const domains = ["", host, `.${host}`, parts.length > 1 ? `.${parts.slice(-2).join(".")}` : ""];
  for (const name of GA_COOKIES) {
    for (const d of new Set(domains)) {
      document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ""}`;
    }
  }
}

function readChoice(): ConsentChoice | null {
  try {
    return parseChoice(window.localStorage.getItem(CONSENT_STORAGE_KEY));
  } catch {
    return null;
  }
}

function storeChoice(choice: ConsentChoice) {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // Storage blocked: the choice still applies to this page view.
  }
}

async function fetchRegion(): Promise<ConsentRegion> {
  try {
    const res = await fetch("/api/consent-region", { cache: "no-store" });
    if (!res.ok) return "required";
    const body: unknown = await res.json();
    return parseRegion((body as { region?: unknown } | null)?.region);
  } catch {
    return "required";
  }
}

const choiceButton =
  "min-h-11 flex-1 md:flex-none md:min-w-[11rem] px-4 py-2.5 border border-white bg-transparent text-white " +
  "font-mono text-[11px] tracking-widest uppercase transition-colors " +
  "hover:bg-white hover:text-synergy-navy active:bg-synergy-amber-light active:text-synergy-navy " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-synergy-amber";

export default function AnalyticsConsent() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const focusOnOpenRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const stored = readChoice();
    const start = async () => {
      // A stored choice wins everywhere; only first visits need the region.
      const region = stored ? "required" : await fetchRegion();
      if (cancelled) return;
      const decision = analyticsDecision(region, stored);
      if (decision === "ask") setOpen(true);
      else if (decision === "load-default" || decision === "load-consented") loadGa(decision);
    };
    void start();

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
    storeChoice(choice);
    if (choice === "granted") loadGa("load-consented");
    else stopGa();
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
      className="sticky bottom-0 z-40 bg-synergy-navy text-white border-t-4 border-synergy-amber focus:outline-none"
    >
      <div className="mx-auto content-max px-4 py-3 flex flex-col md:flex-row md:items-center gap-3 md:gap-8">
        <div className="flex-1 min-w-0">
          <h2 id="cookie-consent-title" className="font-mono text-[10px] tracking-[0.18em] uppercase text-synergy-amber-light">
            Notice · Analytics cookies
          </h2>
          <p className="text-sm leading-snug mt-1 text-white">
            We&apos;d like to use Google Analytics cookies to count visits and see which pages people read.
            Nothing loads until you choose. Change it later under Cookie choices in the footer.{" "}
            <Link
              href="/privacy"
              className="whitespace-nowrap underline underline-offset-2 text-synergy-amber-light hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-synergy-amber"
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
