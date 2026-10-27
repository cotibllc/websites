(function () {
  var b = document.querySelector('.menu-btn'), n = document.getElementById('site-nav');
  if (!b || !n) return;
  b.addEventListener('click', function () {
    var open = n.classList.toggle('open');
    b.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
})();
