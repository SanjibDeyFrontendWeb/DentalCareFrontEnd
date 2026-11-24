// Runs in <head> before paint to avoid a flash of the wrong theme.
// Saved manual choice wins; otherwise follow the operating-system preference.
(function () {
  var root = document.documentElement;
  try {
    var saved = localStorage.getItem('dc-theme');
    var dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', dark);
  } catch (e) {
    /* storage blocked — fall back to light */
  }
  // Scroll-reveal animations: only when motion is allowed and IntersectionObserver exists.
  // Failsafe: if effects.js never starts, show everything after 2.5 s.
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('reveal-ready');
    setTimeout(function () {
      if (!window.__dcEffects) root.classList.remove('reveal-ready');
    }, 2500);
  }
})();
