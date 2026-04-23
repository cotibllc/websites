'use client';

import { useState, useRef } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import type { TurnstileInstance } from '@marsidev/react-turnstile';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [honeypot, setHoneypot] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const turnstileRef = useRef<TurnstileInstance>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        setForm({ name: '', email: '', message: '' });
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

  if (status === 'success') {
    return (
      <div style={{ padding: '2rem 0' }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem' }}>
          Sent
        </p>
        <p style={{ color: 'var(--ink-muted)', fontSize: '0.9375rem', lineHeight: 1.7, fontWeight: 300 }}>
          Your inquiry has been received. I&apos;ll be in touch.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="newsletter-form">
      {/* Honeypot — hidden from humans, bots fill it in */}
      <div aria-hidden="true" style={{ display: 'none' }}>
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

      <div className="form-field">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Your name"
          value={form.name}
          onChange={handleChange}
        />
      </div>

      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="your@email.com"
          value={form.email}
          onChange={handleChange}
        />
      </div>

      <div className="form-field">
        <label htmlFor="message">How can I help?</label>
        <textarea
          id="message"
          name="message"
          required
          placeholder="Tell me about your organization, team, or event..."
          value={form.message}
          onChange={handleChange}
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
        <p className="form-note" style={{ color: '#c0392b' }}>
          Something went wrong. Try again or email{' '}
          <a href="mailto:charles.betancourt@cotib.com" style={{ color: 'var(--accent)' }}>
            charles.betancourt@cotib.com
          </a>{' '}
          directly.
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={status === 'submitting' || !turnstileToken}
          className="btn-primary"
          style={{ width: '100%', opacity: (status === 'submitting' || !turnstileToken) ? 0.6 : 1 }}
        >
          {status === 'submitting' ? 'Sending...' : 'Send Inquiry'}
        </button>
      </div>

      <p className="form-note">
        Available for keynotes, executive workshops, and AI leadership advisory engagements.
      </p>
    </form>
  );
}
