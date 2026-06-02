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