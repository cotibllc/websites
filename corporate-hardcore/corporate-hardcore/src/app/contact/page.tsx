'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Check, Send } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

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
        body: JSON.stringify({ ...form, honeypot }),
      });

      if (response.ok) {
        setStatus('success');
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <main className="min-h-screen bg-bg-main">
      <Navigation />

      <div className="mx-auto content-max px-4 py-10 max-w-2xl">
        <div className="surface-card p-8">
          <h1 className="text-2xl font-bold mb-1">Contact</h1>
          <p className="text-sm text-text-secondary mb-8">
            This form goes directly to Chuck. Response time varies. He&apos;s in a lot of meetings.
          </p>

          {status === 'success' ? (
            <div className="flex items-start gap-3 text-green-600">
              <Check size={20} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Message received.</p>
                <p className="text-sm text-text-secondary mt-1">
                  It&apos;s been logged, triaged, and added to the backlog. Someone will circle back.
                </p>
              </div>
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
                  <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1">
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
                    className="w-full px-4 py-2 bg-bg-main border border-border-medium rounded text-sm focus:outline-none focus:ring-2 focus:ring-linkedin-blue"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
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
                    className="w-full px-4 py-2 bg-bg-main border border-border-medium rounded text-sm focus:outline-none focus:ring-2 focus:ring-linkedin-blue"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-text-primary mb-1">
                  Subject
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="What's this about?"
                  className="w-full px-4 py-2 bg-bg-main border border-border-medium rounded text-sm focus:outline-none focus:ring-2 focus:ring-linkedin-blue"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Say what you need to say. No bullet points required."
                  className="w-full px-4 py-2 bg-bg-main border border-border-medium rounded text-sm focus:outline-none focus:ring-2 focus:ring-linkedin-blue resize-none"
                />
              </div>

              {status === 'error' && (
                <p className="text-sm text-red-500">
                  Something went wrong. Try again or email{' '}
                  <a href="mailto:hello@corphardcore.com" className="underline">
                    hello@corphardcore.com
                  </a>{' '}
                  directly.
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="flex items-center gap-2 px-6 py-2 bg-linkedin-blue text-white text-sm font-medium rounded hover:bg-linkedin-blue-hover transition-colors disabled:opacity-50"
              >
                <Send size={14} />
                {status === 'submitting' ? 'Sending...' : 'Send message'}
              </button>

            </form>
          )}
        </div>
      </div>
    </main>
  );
}
