const canvas = document.getElementById('starfield-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let stars = [];
  let raf = null;
  let isMoving = false;
  let isTabActive = !document.hidden;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    generateStars();
  }

  function generateStars() {
    const count = Math.floor((canvas.width * canvas.height) / 6000);
    stars = Array.from({ length: count }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      r:     0.2 + Math.random() * 1.2,
      alpha: 0.1 + Math.random() * 0.7,
      speed: 0.0004 + Math.random() * 0.0008,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  function draw(ts) {
    if (!isTabActive || !isMoving) {
      raf = null;
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const s of stars) {
      const a = s.alpha * (0.4 + 0.6 * Math.abs(Math.sin(ts * s.speed + s.phase)));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(248,245,238,${a.toFixed(3)})`;
      ctx.fill();
    }

    raf = requestAnimationFrame(draw);
  }

  function startAnimation() {
    if (!raf && isTabActive && isMoving) {
      raf = requestAnimationFrame(draw);
    }
  }

  function stopAnimation() {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  }

  document.addEventListener('visibilitychange', () => {
    isTabActive = !document.hidden;
    if (isTabActive) {
      startAnimation();
    } else {
      stopAnimation();
    }
  });

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      isMoving = entry.isIntersecting;
      if (isMoving) {
        startAnimation();
      } else {
        stopAnimation();
      }
    }
  }, { threshold: 0 });

  observer.observe(canvas);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  resize();
}
