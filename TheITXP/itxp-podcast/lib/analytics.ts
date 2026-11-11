// The browser side of consent-gated Google Analytics for theitxp.com.
// Same behavior as corphardcore.com's AnalyticsConsent.tsx, moved out of the
// component and written against a small environment interface, so node:test
// can run it with a fake page and prove nothing is requested from Google
// before the visitor allows it.
import {
  CONSENT_STORAGE_KEY,
  GA_MEASUREMENT_ID,
  analyticsDecision,
  parseChoice,
  parseRegion,
  type ConsentChoice,
  type ConsentRegion,
} from "./consent";

type Gtag = (...args: unknown[]) => void;

/** The parts of a script element this module sets. */
export interface ScriptLike {
  id: string;
  async: boolean;
  src: string;
}

/** The parts of the page this module touches. The browser passes window and document. */
export interface AnalyticsEnv {
  win: { dataLayer?: unknown[]; gtag?: Gtag; location: { hostname: string } } & Record<string, unknown>;
  doc: { createElement(tag: "script"): ScriptLike; head: { appendChild(node: ScriptLike): unknown }; cookie: string };
  fetch: (url: string, init?: RequestInit) => Promise<{ ok: boolean; json(): Promise<unknown> }>;
  storage: { getItem(key: string): string | null; setItem(key: string, value: string): void } | null;
}

const GA_DISABLE_KEY = `ga-disable-${GA_MEASUREMENT_ID}`;
const GA_COOKIES = ["_ga", `_ga_${GA_MEASUREMENT_ID.replace(/^G-/, "")}`];
export const GA_SCRIPT_SRC = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;

export interface Analytics {
  /** First page view: load GA, or call ask() to show the banner. */
  start(ask: () => void): Promise<void>;
  /** The visitor chose in the banner. */
  choose(choice: ConsentChoice): void;
}

export function createAnalytics(env: AnalyticsEnv): Analytics {
  let gaLoaded = false;

  // GA's documented per-property kill switch: window["ga-disable-<ID>"] = true.
  const setGaDisabled = (disabled: boolean) => {
    env.win[GA_DISABLE_KEY] = disabled;
  };

  // Adds gtag.js to the page. This is the only place anything from Google is requested.
  const loadGa = () => {
    setGaDisabled(false);
    if (gaLoaded) {
      env.win.gtag?.("consent", "update", { analytics_storage: "granted" });
      return;
    }
    gaLoaded = true;
    const dataLayer = (env.win.dataLayer = env.win.dataLayer ?? []);
    // gtag.js reads Arguments objects from the dataLayer, as in Google's snippet.
    const gtag: Gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      dataLayer.push(arguments);
    };
    env.win.gtag = gtag;
    // No advertising use, wherever the visitor is.
    gtag("consent", "default", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "granted" });
    gtag("js", new Date());
    gtag("config", GA_MEASUREMENT_ID);
    const src = env.doc.createElement("script");
    src.id = "google-analytics";
    src.async = true;
    src.src = GA_SCRIPT_SRC;
    env.doc.head.appendChild(src);
  };

  // Stops GA on this page and removes its cookies after a Reject.
  const stopGa = () => {
    setGaDisabled(true);
    env.win.gtag?.("consent", "update", { analytics_storage: "denied" });
    const host = env.win.location.hostname;
    const parts = host.split(".");
    const domains = ["", host, `.${host}`, parts.length > 1 ? `.${parts.slice(-2).join(".")}` : ""];
    for (const name of GA_COOKIES) {
      for (const d of new Set(domains)) {
        env.doc.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ""}`;
      }
    }
  };

  const readChoice = (): ConsentChoice | null => {
    try {
      return parseChoice(env.storage?.getItem(CONSENT_STORAGE_KEY));
    } catch {
      return null;
    }
  };

  const storeChoice = (choice: ConsentChoice) => {
    try {
      env.storage?.setItem(CONSENT_STORAGE_KEY, choice);
    } catch {
      // Storage blocked: the choice still applies to this page view.
    }
  };

  const fetchRegion = async (): Promise<ConsentRegion> => {
    try {
      const res = await env.fetch("/api/consent-region", { cache: "no-store" });
      if (!res.ok) return "required";
      const body: unknown = await res.json();
      return parseRegion((body as { region?: unknown } | null)?.region);
    } catch {
      return "required";
    }
  };

  return {
    async start(ask) {
      const stored = readChoice();
      // A stored choice wins everywhere; only first visits need the region.
      const region = stored ? "required" : await fetchRegion();
      const decision = analyticsDecision(region, stored);
      if (decision === "ask") ask();
      else if (decision === "load-default" || decision === "load-consented") loadGa();
    },
    choose(choice) {
      storeChoice(choice);
      if (choice === "granted") loadGa();
      else stopGa();
    },
  };
}

/** The real page. Called only in the browser. */
export function browserEnv(): AnalyticsEnv {
  let storage: AnalyticsEnv["storage"] = null;
  try {
    storage = window.localStorage;
  } catch {
    storage = null;
  }
  return {
    win: window as unknown as AnalyticsEnv["win"],
    doc: document as unknown as AnalyticsEnv["doc"],
    fetch: (url, init) => window.fetch(url, init),
    storage,
  };
}
