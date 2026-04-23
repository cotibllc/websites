const tabs = document.querySelectorAll('.dest-tab');
const panels = document.querySelectorAll('.dest-panel');

function activateTab(panelId) {
  tabs.forEach(t => {
    const active = t.dataset.panel === panelId;
    t.classList.toggle('dest-tab--active', active);
    t.setAttribute('aria-selected', String(active));
  });

  panels.forEach(p => {
    const active = p.id === `panel-${panelId}`;
    p.classList.toggle('dest-panel--active', active);
    if (active) {
      p.removeAttribute('hidden');
    } else {
      p.setAttribute('hidden', '');
    }
  });
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => activateTab(tab.dataset.panel));
});

// URL-based activation
const params = new URLSearchParams(window.location.search);
const tabParam = params.get('tab');
const hashParam = window.location.hash;

if (tabParam === 'parks' || hashParam === '#destinations-parks') {
  activateTab('parks');
}
