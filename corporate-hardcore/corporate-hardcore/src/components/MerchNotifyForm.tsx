"use client";

import { useState, FormEvent } from "react";

type Status = "idle" | "submitting" | "success" | "error";

const defaultErrorMessage = "Request could not be filed. Try again later.";

export default function MerchNotifyForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState(defaultErrorMessage);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setErrorMessage(defaultErrorMessage);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "merch" }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setErrorMessage(data.error ?? defaultErrorMessage);
        setStatus("error");
      }
    } catch {
      setStatus("error");
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
          className="btn-intranet flex-shrink-0"
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? "Filing Request..." : "Submit Request"}
        </button>
      </form>
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
