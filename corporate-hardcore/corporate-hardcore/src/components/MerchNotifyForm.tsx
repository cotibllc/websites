"use client";

import { useState, useRef, FormEvent } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import type { TurnstileInstance } from "@marsidev/react-turnstile";

type Status = "idle" | "submitting" | "success" | "error";

const defaultErrorMessage = "Request could not be filed. Try again later.";

export default function MerchNotifyForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState(defaultErrorMessage);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  // A Turnstile token is single use: drop it after every attempt so the button
  // waits for the next Success.
  const discardToken = () => {
    setTurnstileToken(null);
    turnstileRef.current?.reset();
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setErrorMessage(defaultErrorMessage);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "merch", honeypot, turnstileToken }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.ok) {
        setStatus("success");
        setEmail("");
        discardToken();
      } else {
        setErrorMessage(data.error ?? defaultErrorMessage);
        setStatus("error");
        discardToken();
      }
    } catch {
      setStatus("error");
      discardToken();
    }
  }

  if (status === "success") {
    return (
      <p
        className="font-mono text-[11px] text-synergy-dark tracking-wide max-w-sm"
        role="status"
        aria-live="polite"
      >
        Request received. You will be notified when the store opens. Notification is pending review.
      </p>
    );
  }

  const submitting = status === "submitting";

  return (
    <>
      <form onSubmit={onSubmit} className="flex gap-2 max-w-sm">
      {/* Honeypot */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="merch-notify-website">Website</label>
        <input id="merch-notify-website" name="website" type="text" tabIndex={-1} autoComplete="off"
          value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>
        <label htmlFor="merch-notify-email" className="sr-only">
          Email address
        </label>
        <input
          id="merch-notify-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="your@email.com"
          className="intranet-input flex-1"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
          aria-invalid={status === "error" ? true : undefined}
          aria-describedby={status === "error" ? "merch-notify-error" : undefined}
        />
        <button
          type="submit"
          className="btn-intranet flex-shrink-0 disabled:opacity-60"
          disabled={submitting || !turnstileSiteKey || !turnstileToken}
          aria-busy={submitting}
        >
          {submitting ? "Filing Request..." : "Submit Request"}
        </button>
      </form>
      {turnstileSiteKey ? (
        <div className="mt-3">
          <Turnstile
            ref={turnstileRef}
            siteKey={turnstileSiteKey}
            onSuccess={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken(null)}
            onError={() => setTurnstileToken(null)}
          />
        </div>
      ) : (
        <p className="font-mono text-[11px] text-synergy-amber mt-2 tracking-wide" role="alert">
          Merch notify signup is temporarily unavailable.
        </p>
      )}
      <div aria-live="assertive">
        {status === "error" && (
          <p id="merch-notify-error" role="alert" className="font-mono text-[11px] text-synergy-amber mt-2 tracking-wide">
            {errorMessage}
          </p>
        )}
      </div>
    </>
  );
}
