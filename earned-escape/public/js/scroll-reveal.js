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
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));
    return;
  }

  document.querySelectorAll(AUTO_REVEAL_SELECTORS).forEach(el => {
    el.classList.add('reveal');
  });

  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

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
    { threshold: 0.12, rootMargin: '0px 0px -5% 0px' }
  );

  targets.forEach(el => observer.observe(el));
}

initScrollReveal();