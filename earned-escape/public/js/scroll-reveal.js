const targets = document.querySelectorAll(
  '.about-stat-card, .why-card, .guide-card, .dest-card, .section-eyebrow, .about__headline, .destinations__headline, .guides__headline, .why__headline, .contact__headline'
);

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && targets.length) {
  targets.forEach(el => el.classList.add('reveal'));

  const groups = new Map();
  targets.forEach(el => {
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
    { threshold: 0.12 }
  );

  targets.forEach(el => observer.observe(el));
}
