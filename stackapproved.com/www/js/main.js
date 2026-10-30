// Portfolio: click-to-play YouTube facade. The page ships a thumbnail <button
// data-video-id>; on click we swap in the youtube-nocookie iframe so YouTube
// loads (and overlays its controls) only when someone asks to watch.
// Exported under CommonJS for test/portfolio.test.js; DOM wiring runs only in a browser.
(function () {
    const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
    const ALLOW = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';

    function buildVideoIframe(doc, videoId) {
        if (typeof videoId !== 'string' || !VIDEO_ID.test(videoId)) {
            throw new Error('Not a YouTube video id: ' + String(videoId));
        }
        const iframe = doc.createElement('iframe');
        iframe.setAttribute('src', 'https://www.youtube-nocookie.com/embed/' + videoId + '?autoplay=1&playsinline=1&rel=0');
        iframe.setAttribute('title', 'StackApproved spec ad for Claude Code');
        iframe.setAttribute('allow', ALLOW);
        iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        iframe.setAttribute('allowfullscreen', '');
        return iframe;
    }

    function activateVideoFacade(button) {
        const iframe = buildVideoIframe(button.ownerDocument, button.dataset.videoId);
        button.replaceWith(iframe);
        iframe.focus();
        return iframe;
    }

    function useFallbackThumb(img) {
        const fallback = img.getAttribute('data-fallback-src');
        if (fallback && img.getAttribute('src') !== fallback) img.setAttribute('src', fallback);
    }

    function initVideoFacades(root) {
        root.querySelectorAll('button[data-video-id]').forEach(function (button) {
            button.addEventListener('click', function () { activateVideoFacade(button); }, { once: true });
            // oardefault (vertical) is not guaranteed for every Short; fall back to hqdefault.
            const img = button.querySelector('img[data-fallback-src]');
            if (!img) return;
            img.addEventListener('error', function () { useFallbackThumb(img); }, { once: true });
            if (img.complete && img.naturalWidth === 0) useFallbackThumb(img);
        });
    }

    if (typeof module === 'object' && module.exports) {
        module.exports = { buildVideoIframe, activateVideoFacade, initVideoFacades };
    }
    if (typeof document !== 'undefined') initVideoFacades(document);
})();

(function () {
    if (typeof document === 'undefined') return;
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
            submitBtn.textContent = 'Get 3 hook ideas';
        }
    });
})();
