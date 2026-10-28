// Free sampler form: posts JSON to /do-the-next-thing/free and shows the
// server's message. The server always answers the same way for any valid
// address, so this never reveals whether an email is already on the list.
(function () {
  var card = document.getElementById('free-card');
  var form = document.getElementById('free-form');
  if (!card || !form) return;
  var err = document.getElementById('free-error');
  var btn = form.querySelector('button[type="submit"]');
  var MSG = {
    email: "That email address doesn't look right. Check it and try again.",
    consent: 'Check the box so we can email you the sampler.',
    // No token yet: the widget is still checking, or was just reset.
    pending: 'Wait for the human check to say Success, then send.',
    network: "We couldn't send the email just now. Wait a minute and try again."
  };
  function show(msg) { err.textContent = msg; err.classList.add('is-on'); err.focus(); }
  // A Turnstile token is single use. After any refused or failed send, get a
  // fresh one so the next try never reuses the old token.
  function freshToken() {
    var tsInput = form.querySelector('[name="cf-turnstile-response"]');
    if (tsInput) tsInput.value = '';
    if (window.turnstile) { try { window.turnstile.reset(); } catch (x) { /* widget not ready */ } }
  }
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    err.classList.remove('is-on');
    var email = form.email.value.trim();
    if (!email || email.indexOf('@') < 1 || email.length > 254) return show(MSG.email);
    if (!form.consent.checked) return show(MSG.consent);
    var tsInput = form.querySelector('[name="cf-turnstile-response"]');
    var token = tsInput ? tsInput.value : '';
    if (!token) return show(MSG.pending);
    btn.disabled = true;
    try {
      var res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: email, consent: true, turnstileToken: token, website: form.website.value })
      });
      var data = {};
      try { data = await res.json(); } catch (x) { data = {}; }
      if (res.ok && data.ok) {
        card.classList.add('is-done');
        var done = document.getElementById('free-done');
        done.focus();
        return;
      }
      show(data.error || MSG.network);
      freshToken();
    } catch (x) {
      show(MSG.network);
      freshToken();
    } finally {
      btn.disabled = false;
    }
  });
})();
