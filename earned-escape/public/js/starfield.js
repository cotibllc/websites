const canvas = document.getElementById('starfield-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let stars = [];
  let raf;

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
    if (document.hidden) {
      raf = requestAnimationFrame(draw);
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

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  resize();
  raf = requestAnimationFrame(draw);
}
