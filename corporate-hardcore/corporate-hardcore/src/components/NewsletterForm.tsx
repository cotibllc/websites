'use client';

import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('Something went wrong. Try again.');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('Something went wrong. Try again.');
    setStatus('submitting');
    
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json()) as { error?: string };
      
      if (response.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setErrorMessage(data.error ?? 'Something went wrong. Try again.');
        setStatus('error');
      }
    } catch (error) {
      console.error('Newsletter signup error:', error);
      setStatus('error');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="p-4 rounded border border-border-light">
        <h3 className="text-lg font-semibold mb-2">
          Updates on corporate dysfunction
        </h3>
        <p className="text-sm text-text-secondary mb-4">
          New articles monthly. Unsubscribe anytime.
        </p>

        {status === 'success' ? (
          <div className="flex items-center gap-2 text-green-600" role="status" aria-live="polite">
            <Check size={18} />
            <span className="text-sm">You&apos;re in the system. Check your email to confirm — it&apos;s the one meeting you&apos;ll actually want to attend.</span>
          </div>
        ) : status === 'error' ? (
          <div className="text-sm text-red-500" role="alert">
            {errorMessage}{' '}
            <button className="underline" onClick={() => setStatus('idle')}>Retry</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-4 py-2 bg-bg-main border border-border-medium rounded text-sm focus:outline-none focus:ring-2 focus:ring-linkedin-blue"
            />
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="px-4 py-2 bg-linkedin-blue text-white text-sm rounded hover:bg-linkedin-blue-hover transition-colors disabled:opacity-50"
            >
              {status === 'submitting' ? '...' : <ArrowRight size={16} />}
            </button>
          </form>
        )}
      </div>

      <p className="text-xs text-text-secondary mt-3 text-center">
        No spam. Just thoughtful content about workplace dysfunction.
      </p>
    </div>
  );
}
