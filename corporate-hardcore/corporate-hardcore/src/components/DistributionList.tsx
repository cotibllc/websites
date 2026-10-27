"use client";

import { useState, FormEvent } from "react";

type Status = "idle" | "submitting" | "ok" | "error";

const defaultErrorMessage = "Request could not be filed. Try again later.";

export default function DistributionList() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState(defaultErrorMessage);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setErrorMessage(defaultErrorMessage);
    try {
      // No source: goes to the Field Notes Kit form (9272877) on /api/subscribe.
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.status === 200) {
        setStatus("ok");
        setEmail("");
      } else {
        setErrorMessage(data.error ?? defaultErrorMessage);
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const submitting = status === "submitting";

  return (
    <div className="intranet-card p-5">
      <p className="dept-label mb-2">FIELD NOTES — DISTRIBUTION LIST</p>
      <p className="font-sans text-sm text-synergy-muted font-light mb-4 max-w-xl">
        Receive a copy when a Field Note is filed. Notes are filed monthly as part of recurring
        arcs. No weekly promise has been approved.
      </p>
      {status === "ok" ? (
        <p className="font-mono text-[11px] text-synergy-dark tracking-wide" role="status" aria-live="polite">
          Request received. You have been added to distribution. Distribution is not acknowledgment.
        </p>
      ) : (
        <>
          <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md">
            <label htmlFor="field-notes-email" className="sr-only">
              Email address
            </label>
            <input
              id="field-notes-email"
              type="email"
              required
              name="email"
              autoComplete="email"
              placeholder="your@email.com"
              className="intranet-input flex-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              aria-invalid={status === "error" ? true : undefined}
              aria-describedby={status === "error" ? "field-notes-error" : undefined}
            />
            <button
              type="submit"
              className="btn-intranet flex-shrink-0 disabled:opacity-60 disabled:cursor-wait"
              disabled={submitting}
              aria-busy={submitting}
            >
              ADD ME TO DISTRIBUTION
            </button>
          </form>
          <div aria-live="assertive">
            {status === "error" && (
              <p id="field-notes-error" role="alert" className="font-mono text-[11px] text-synergy-amber mt-2 tracking-wide">
                {errorMessage}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
