import './starfield.js';
import './nav.js';
import './destinations.js';

/* Scroll reveal — inlined so main.js?v= cache bust applies (imported modules are not versioned) */
const AUTO_REVEAL_SELECTORS = [
  '.about-stat-card',
  '.why-card',
  '.guide-card',
  '.dest-card',
  '.section-eyebrow',
  '.about__headline',
  '.destinations__headline',
  '.guides__headline',
  '.why__headline',
  '.contact__headline',
].join(', ');

function initScrollReveal() {
  const revealAll = () => {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));
  };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealAll();
    return;
  }

  document.querySelectorAll(AUTO_REVEAL_SELECTORS).forEach(el => {
    el.classList.add('reveal');
  });

  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  if (typeof IntersectionObserver === 'undefined') {
    revealAll();
    return;
  }

  const autoTargets = new Set(document.querySelectorAll(AUTO_REVEAL_SELECTORS));
  const groups = new Map();

  targets.forEach(el => {
    if (!autoTargets.has(el)) return;
    const parent = el.parentElement;
    if (!groups.has(parent)) groups.set(parent, []);
    groups.get(parent).push(el);
  });

  groups.forEach(children => {
    children.forEach((el, i) => {
      el.style.transitionDelay = `${i * 80}ms`;
    });
  });

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -2% 0px' }
  );

  targets.forEach(el => observer.observe(el));

  /* Fallback: if nothing revealed after load, show all (broken observer / cached JS) */
  window.setTimeout(() => {
    document.querySelectorAll('.reveal:not(.revealed)').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add('revealed');
      }
    });
  }, 800);
}

initScrollReveal();

/* ===========================
   Plan / Consultation Form Handler
   Matches the pattern from cotib.com (Turnstile + JSON POST)
   =========================== */
const planForm = document.getElementById('plan-form');
if (planForm) {
  planForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const btn = document.getElementById('submit-btn');
    const successEl = document.getElementById('form-success');
    const errorEl = document.getElementById('form-error');

    // Get the Turnstile response token (cf-turnstile-response is injected by the widget)
    const turnstileToken = document.querySelector('[name="cf-turnstile-response"]')?.value;

    if (successEl) successEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';

    // Only require Turnstile token if the widget is actually present (i.e. site key configured)
    const hasTurnstileWidget = !!document.querySelector('.cf-turnstile');
    if (hasTurnstileWidget && !turnstileToken) {
      if (errorEl) {
        errorEl.textContent = 'Please complete the security check before submitting.';
        errorEl.style.display = 'block';
      }
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Sending...';
    }

    try {
      const payload = {
        name: document.getElementById('f-name')?.value.trim(),
        email: document.getElementById('f-email')?.value.trim(),
        phone: document.getElementById('f-phone')?.value.trim(),
        dates: document.getElementById('f-dates')?.value.trim(),
        tripType: document.getElementById('f-trip-type')?.value,
        travelers: document.getElementById('f-travelers')?.value.trim(),
        message: document.getElementById('f-message')?.value.trim(),
        supportTier: (document.querySelector('input[name="supportTier"]:checked') || {}).value,
        turnstileToken,
      };

      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (successEl) {
          successEl.style.display = 'block';
          successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        planForm.reset();
        // Reset the checked radio to the default "Not sure yet"
        const defaultRadio = document.getElementById('tier-unsure');
        if (defaultRadio) defaultRadio.checked = true;

        if (window.turnstile) {
          window.turnstile.reset();
        }
      } else {
        if (errorEl) {
          errorEl.textContent = data.error || 'Something went wrong. Please try again.';
          errorEl.style.display = 'block';
          errorEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        if (window.turnstile) {
          window.turnstile.reset();
        }
      }
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = 'Network error. Please check your connection and try again.';
        errorEl.style.display = 'block';
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Reserve My Planning Call';
      }
    }
  });
}