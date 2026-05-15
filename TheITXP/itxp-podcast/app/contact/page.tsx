'use client';

import { useState, useRef } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import type { TurnstileInstance } from '@marsidev/react-turnstile';

const REASONS = ['Collab', 'Guest', 'Co-Host', 'Other'] as const;
type Reason = typeof REASONS[number];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', reason: '' as Reason | '', message: '' });
  const [honeypot, setHoneypot] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const turnstileRef = useRef<TurnstileInstance>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, honeypot, turnstileToken }),
      });

      if (response.ok) {
        setStatus('success');
        setForm({ name: '', email: '', reason: '', message: '' });
        setTurnstileToken(null);
        turnstileRef.current?.reset();
      } else {
        setStatus('error');
        turnstileRef.current?.reset();
      }
    } catch {
      setStatus('error');
      turnstileRef.current?.reset();
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Contact</h1>
      <p className="text-sm text-steel mb-8">
        This form goes directly to Chuck. Response time varies.
      </p>

      {status === 'success' ? (
        <div className="bg-slate border border-blue rounded-xl p-6 text-white">
          <p className="font-semibold">Message received.</p>
          <p className="text-sm mt-1 text-steel">
            We&apos;ll get back to you as soon as we can.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Honeypot — hidden from humans, bots fill it in */}
          <div aria-hidden="true" className="hidden">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-steel mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full px-4 py-2 bg-slate border border-slate/50 rounded-lg text-sm text-white placeholder:text-steel/60 focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-steel mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full px-4 py-2 bg-slate border border-slate/50 rounded-lg text-sm text-white placeholder:text-steel/60 focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-steel mb-1">
              Reason <span className="text-red-500">*</span>
            </label>
            <select
              id="reason"
              name="reason"
              required
              value={form.reason}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate border border-slate/50 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue"
            >
              <option value="" disabled>Select a reason...</option>
              {REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-steel mb-1">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={6}
              value={form.message}
              onChange={handleChange}
              placeholder="Tell us what's on your mind."
              className="w-full px-4 py-2 bg-slate border border-slate/50 rounded-lg text-sm text-white placeholder:text-steel/60 focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue resize-none"
            />
          </div>

          <Turnstile
            ref={turnstileRef}
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            onSuccess={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken(null)}
            onError={() => setTurnstileToken(null)}
          />

          {status === 'error' && (
            <p className="text-sm text-red-500">
              Something went wrong. Try again or email{' '}
              <a href="mailto:social-media@theitxp.com" className="underline">
                social-media@theitxp.com
              </a>{' '}
              directly.
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'submitting' || !turnstileToken}
            className="px-6 py-2 bg-amber text-navy text-sm font-semibold rounded hover:opacity-90 transition-opacity disabled:opacity-50 uppercase tracking-wide"
          >
            {status === 'submitting' ? 'Sending...' : 'Send message'}
          </button>

        </form>
      )}
    </div>
  );
}
