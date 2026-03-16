"use client";

import { useState, useEffect } from "react";

const quotes = [
  "Synergy is not a strategy. It is a word executives use when they haven't thought of anything else.",
  "The meeting could have been an email. But then we wouldn't have felt important.",
  "Circle back. Never return.",
  "Your feedback is valuable and will be ignored.",
];

export default function CorporateWisdom() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % quotes.length), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="surface-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2 h-2 rounded-full bg-linkedin-blue animate-pulse" />
        <span className="text-xs uppercase tracking-wide text-text-secondary">Office Wisdom</span>
      </div>
      <p className="text-sm font-medium text-text-primary">“{quotes[idx]}”</p>
    </div>
  );
}
