// Consent-gated Google Analytics 4 for cotib.com, modeled on corphardcore.com
// (corporate-hardcore/src/components/AnalyticsConsent.tsx).
// Nothing from Google loads until the decision allows it: visitors in the
// EU, EEA, UK and Switzerland (and anyone whose country is unknown) see the
// banner first; Reject keeps GA off and clears its cookies.
// The file name carries a version because vercel.json serves /js/* as
// immutable for a year: ship any change as consent-v2.js.
(function () {
  'use strict';
  var GA_ID = 'G-7C8Q4SNYQQ';
  var STORAGE_KEY = 'cotib-analytics-consent-v1';
  var w = window;
  var d = document;

  // DTNT confirm, download and unsubscribe URLs carry tokens. GA would record
  // them in page_location, so analytics never runs there.
  if (/^\/do-the-next-thing\/free(\/|$)/.test(w.location.pathname)) return;

  var gaLoaded = false;
  var panel = null;
  var returnFocus = null;

  function parseChoice(v) { return v === 'granted' || v === 'denied' ? v : null; }
  function parseRegion(v) { return v === 'not-required' ? 'not-required' : 'required'; }
  function decide(region, choice) {
    if (choice === 'granted') return 'load-consented';
    if (choice === 'denied') return 'off';
    return region === 'required' ? 'ask' : 'load-default';
  }

  function readChoice() {
    try { return parseChoice(w.localStorage.getItem(STORAGE_KEY)); } catch (e) { return null; }
  }
  function storeChoice(choice) {
    try { w.localStorage.setItem(STORAGE_KEY, choice); } catch (e) { /* storage blocked: applies to this page view */ }
  }

  function fetchRegion() {
    if (typeof w.fetch !== 'function') return Promise.resolve('required');
    return w.fetch('/api/consent-region', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (b) { return parseRegion(b && b.region); }, function () { return 'required'; });
  }

  // GA's documented per-property kill switch.
  function setGaDisabled(disabled) { w['ga-disable-' + GA_ID] = disabled; }

  // Adds gtag.js to the page. This is the only place anything from Google is requested.
  function loadGa() {
    setGaDisabled(false);
    if (gaLoaded) {
      w.gtag('consent', 'update', { analytics_storage: 'granted' });
      return;
    }
    gaLoaded = true;
    w.dataLayer = w.dataLayer || [];
    w.gtag = function () { w.dataLayer.push(arguments); };
    // No advertising use, wherever the visitor is.
    w.gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' });
    w.gtag('js', new Date());
    w.gtag('config', GA_ID);
    var s = d.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    d.head.appendChild(s);
  }

  // Stops GA on this page and removes its cookies after a Reject.
  function stopGa() {
    setGaDisabled(true);
    if (typeof w.gtag === 'function') w.gtag('consent', 'update', { analytics_storage: 'denied' });
    var host = w.location.hostname;
    var parts = host.split('.');
    var domains = ['', host, '.' + host];
    if (parts.length > 1) domains.push('.' + parts.slice(-2).join('.'));
    var names = ['_ga', '_ga_' + GA_ID.replace(/^G-/, '')];
    for (var i = 0; i < names.length; i++) {
      for (var j = 0; j < domains.length; j++) {
        d.cookie = names[i] + '=; Max-Age=0; path=/' + (domains[j] ? '; domain=' + domains[j] : '');
      }
    }
  }

  var CSS =
    '#cookie-consent{position:sticky;bottom:0;z-index:60;background:#0f172a;color:#f1f5f9;border-top:4px solid #22d3ee;font-family:Outfit,system-ui,sans-serif}' +
    '#cookie-consent:focus{outline:none}' +
    '#cookie-consent .cc-wrap{max-width:72rem;margin:0 auto;padding:.85rem 1.25rem;display:flex;flex-direction:column;gap:.75rem}' +
    '#cookie-consent h2{margin:0;font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;color:#60a5fa;font-weight:600}' +
    '#cookie-consent p{margin:.25rem 0 0;font-size:.9rem;line-height:1.45;color:#f1f5f9}' +
    '#cookie-consent a{color:#60a5fa;text-decoration:underline;text-underline-offset:2px;white-space:nowrap}' +
    '#cookie-consent a:hover{color:#f1f5f9}' +
    '#cookie-consent .cc-actions{display:flex;gap:.5rem}' +
    '#cookie-consent button{flex:1;min-height:44px;padding:.55rem 1rem;border:1px solid #f1f5f9;border-radius:0;background:transparent;color:#f1f5f9;font:inherit;font-size:.8rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}' +
    '#cookie-consent button:hover{background:#f1f5f9;color:#0f172a}' +
    '#cookie-consent button:active{background:#22d3ee;color:#0f172a;border-color:#22d3ee}' +
    '#cookie-consent button:focus-visible,#cookie-consent a:focus-visible,[data-cookie-choices]:focus-visible{outline:2px solid #22d3ee;outline-offset:2px}' +
    '[data-cookie-choices]{background:none;border:0;padding:0;font:inherit;color:inherit;cursor:pointer}' +
    '@media (min-width:768px){#cookie-consent .cc-wrap{flex-direction:row;align-items:center;gap:2rem}#cookie-consent .cc-text{flex:1}#cookie-consent button{flex:none;min-width:11rem}}';

  function el(tag, attrs, text) {
    var e = d.createElement(tag);
    for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) e.setAttribute(k, attrs[k]);
    if (text) e.textContent = text;
    return e;
  }

  function addStyles() {
    if (d.getElementById('cookie-consent-style')) return;
    var st = el('style', { id: 'cookie-consent-style' });
    st.textContent = CSS;
    d.head.appendChild(st);
  }

  function closeBanner() {
    if (panel && panel.parentNode) panel.parentNode.removeChild(panel);
    panel = null;
    if (returnFocus && typeof returnFocus.focus === 'function') returnFocus.focus();
    returnFocus = null;
  }

  function choose(choice) {
    storeChoice(choice);
    if (choice === 'granted') loadGa(); else stopGa();
    closeBanner();
  }

  function openBanner(focusIt) {
    if (panel) { if (focusIt) panel.focus(); return; }
    panel = el('section', { id: 'cookie-consent', tabindex: '-1', 'aria-labelledby': 'cookie-consent-title' });
    var wrap = el('div', { 'class': 'cc-wrap' });
    var text = el('div', { 'class': 'cc-text' });
    text.appendChild(el('h2', { id: 'cookie-consent-title' }, 'Analytics cookies'));
    var copy = el('p', {}, 'We would like to use Google Analytics cookies to count visits and see which pages people read. Nothing loads until you choose. You can change this later with Cookie choices at the bottom of the page. ');
    copy.appendChild(el('a', { href: '/website-privacy' }, 'Website privacy'));
    text.appendChild(copy);
    var actions = el('div', { 'class': 'cc-actions', role: 'group', 'aria-label': 'Analytics cookie choice' });
    var accept = el('button', { type: 'button' }, 'Accept analytics');
    var reject = el('button', { type: 'button' }, 'Reject analytics');
    accept.addEventListener('click', function () { choose('granted'); });
    reject.addEventListener('click', function () { choose('denied'); });
    actions.appendChild(accept);
    actions.appendChild(reject);
    wrap.appendChild(text);
    wrap.appendChild(actions);
    panel.appendChild(wrap);
    d.body.appendChild(panel);
    if (focusIt) panel.focus();
  }

  addStyles();

  // Footer "Cookie choices" buttons ship hidden, so visitors without
  // JavaScript never see a control that does nothing.
  var buttons = d.querySelectorAll('[data-cookie-choices]');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].removeAttribute('hidden');
    buttons[i].addEventListener('click', function (ev) {
      returnFocus = ev && ev.currentTarget ? ev.currentTarget : null;
      openBanner(true);
    });
  }

  var stored = readChoice();
  // A stored choice wins everywhere; only first visits need the region.
  (stored ? Promise.resolve('required') : fetchRegion()).then(function (region) {
    var decision = decide(region, stored);
    if (decision === 'ask') openBanner(false);
    else if (decision === 'load-default' || decision === 'load-consented') loadGa();
  });
})();
