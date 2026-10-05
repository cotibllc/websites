"use client";

import { useState, FormEvent } from "react";

export default function DistributionList() {
  const [status, setStatus] = useState<"idle" | "ok">("idle");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("ok");
  }

  return (
    <div className="intranet-card p-5">
      <p className="dept-label mb-2">FIELD NOTES — DISTRIBUTION LIST</p>
      <p className="font-sans text-sm text-synergy-muted font-light mb-4 max-w-xl">
        Receive a copy when a Field Note is filed. Notes are filed monthly as part of recurring
        arcs. No weekly promise has been approved.
      </p>
      {status === "ok" ? (
        <p className="font-mono text-[11px] text-synergy-dark tracking-wide">
          Request received. You have been added to distribution. Distribution is not acknowledgment.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md">
          <input
            type="email"
            required
            name="email"
            placeholder="your@email.com"
            aria-label="Email address"
            className="intranet-input flex-1"
          />
          <button type="submit" className="btn-intranet flex-shrink-0">
            ADD ME TO DISTRIBUTION
          </button>
        </form>
      )}
    </div>
  );
}
