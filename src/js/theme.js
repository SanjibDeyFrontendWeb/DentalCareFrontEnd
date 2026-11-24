// Light / dark theme toggle with persistence and system-preference support.
const KEY = 'dc-theme';
const root = document.documentElement;
const media = window.matchMedia('(prefers-color-scheme: dark)');

function apply(isDark) {
  root.classList.toggle('dark', isDark);
  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(isDark));
    btn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  });
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', isDark ? '#151b20' : '#156d9f');
}

export function initTheme() {
  apply(root.classList.contains('dark'));

  document.querySelectorAll('[data-theme-toggle]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const next = !root.classList.contains('dark');
      try {
        localStorage.setItem(KEY, next ? 'dark' : 'light');
      } catch (e) {}
      apply(next);
    })
  );

  // Follow OS changes only while the visitor has not made a manual choice.
  media.addEventListener('change', (e) => {
    let saved = null;
    try {
      saved = localStorage.getItem(KEY);
    } catch (err) {}
    if (!saved) apply(e.matches);
  });
}
