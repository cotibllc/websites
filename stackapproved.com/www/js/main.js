(function () {
    const form = document.getElementById('brief-form');
    if (!form) return;

    const submitBtn = document.getElementById('submit-btn');
    const status = document.getElementById('form-status');

    function showStatus(message, isError) {
        status.textContent = message;
        status.classList.remove('hidden', 'text-red-400', 'text-brand');
        status.classList.add(isError ? 'text-red-400' : 'text-brand');
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const turnstileToken = form.querySelector('[name="cf-turnstile-response"]')?.value;
        if (!turnstileToken) {
            showStatus('Please complete the security check before sending.', true);
            return;
        }

        const payload = {
            name: form.name.value,
            email: form.email.value,
            company: form.company.value,
            interest: form.interest.value,
            message: form.message.value,
            website: form.website.value,
            turnstileToken,
        };

        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                form.reset();
                if (window.turnstile) window.turnstile.reset();
                showStatus('Brief received. You\'ll hear back within one business day.', false);
            } else {
                showStatus(data.error || 'Something went wrong. Please try again.', true);
            }
        } catch {
            showStatus('Network error. Please try again.', true);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send the brief';
        }
    });
})();
