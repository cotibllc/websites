"use client";

import { useState, useRef } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import type { TurnstileInstance } from "@marsidev/react-turnstile";

interface Props {
  subjectOptions: string[];
}

const fallbackEmail = "hello@corphardcore.com";
const defaultErrorMessage = "Transmission failed.";

export default function ContactFormIntranet({ subjectOptions }: Props) {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [form, setForm] = useState({ name: "", email: "", subject: subjectOptions[0] ?? "", message: "" });
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState(defaultErrorMessage);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(defaultErrorMessage);
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, honeypot, turnstileToken }),
      });
      const data = (await res.json()) as { error?: string };
      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", subject: subjectOptions[0] ?? "", message: "" });
        setTurnstileToken(null);
        turnstileRef.current?.reset();
      } else {
        setErrorMessage(data.error ?? defaultErrorMessage);
        setStatus("error");
        turnstileRef.current?.reset();
      }
    } catch {
      setStatus("error");
      turnstileRef.current?.reset();
    }
  };

  if (status === "success") {
    return (
      <div className="border border-synergy-green bg-synergy-green-light p-4" role="status" aria-live="polite">
        <p className="dept-label text-synergy-green mb-1">Ticket Submitted</p>
        <p className="font-sans text-sm text-synergy-dark">
          Your message has been logged and added to the queue. Someone will circle back.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off"
          value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="intranet-label">Name <span className="text-synergy-amber">*</span></label>
          <input id="name" name="name" type="text" required className="intranet-input"
            placeholder="Your name" value={form.name} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="email" className="intranet-label">Email <span className="text-synergy-amber">*</span></label>
          <input id="email" name="email" type="email" required className="intranet-input"
            placeholder="your@email.com" value={form.email} onChange={handleChange} />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="intranet-label">Subject</label>
        <select id="subject" name="subject" className="intranet-input" value={form.subject} onChange={handleChange}>
          {subjectOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="intranet-label">Message <span className="text-synergy-amber">*</span></label>
        <textarea id="message" name="message" required rows={5} className="intranet-input resize-none"
          placeholder="Describe your issue or inquiry." value={form.message} onChange={handleChange} />
      </div>

      {turnstileSiteKey ? (
        <Turnstile
          ref={turnstileRef}
          siteKey={turnstileSiteKey}
          onSuccess={(token) => setTurnstileToken(token)}
          onExpire={() => setTurnstileToken(null)}
          onError={() => setTurnstileToken(null)}
        />
      ) : (
        <p className="font-mono text-[11px] text-synergy-amber" role="alert">
          Contact form is temporarily unavailable. Email{" "}
          <a href={`mailto:${fallbackEmail}`} className="underline">
            {fallbackEmail}
          </a>
          .
        </p>
      )}

      {status === "error" && (
        <p className="font-mono text-[11px] text-red-600" role="alert">
          {errorMessage} Try again or email{" "}
          <a href={`mailto:${fallbackEmail}`} className="underline">{fallbackEmail}</a>.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting" || !turnstileSiteKey || !turnstileToken}
        className="btn-intranet disabled:opacity-50"
      >
        {status === "submitting" ? "Submitting..." : "Submit Request"}
      </button>
    </form>
  );
}
