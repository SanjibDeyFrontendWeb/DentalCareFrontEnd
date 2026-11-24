// Mobile side-drawer: overlay, Escape to close, focus trap, focus restore, body scroll lock.
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

export function initNavigation() {
  const drawer = document.getElementById('mobile-drawer');
  const openBtn = document.querySelector('[data-drawer-open]');
  if (!drawer || !openBtn) return;

  const panel = drawer.querySelector('[data-drawer-panel]');
  const overlay = drawer.querySelector('[data-drawer-overlay]');
  let lastFocused = null;

  const isOpen = () => !drawer.classList.contains('invisible');

  function open() {
    lastFocused = document.activeElement;
    drawer.classList.remove('invisible');
    drawer.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
      overlay.classList.remove('opacity-0');
      panel.classList.remove('translate-x-[110%]');
    });
    openBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('overflow-hidden');
    panel.querySelector(FOCUSABLE)?.focus();
  }

  function close() {
    if (!isOpen()) return;
    overlay.classList.add('opacity-0');
    panel.classList.add('translate-x-[110%]');
    openBtn.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('overflow-hidden');
    setTimeout(() => drawer.classList.add('invisible'), 250);
    (lastFocused || openBtn).focus();
  }

  openBtn.addEventListener('click', open);
  drawer.querySelectorAll('[data-drawer-close]').forEach((el) => el.addEventListener('click', close));
  overlay.addEventListener('click', close);
  // Links close the drawer after selection
  panel.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));

  document.addEventListener('keydown', (e) => {
    if (!isOpen()) return;
    if (e.key === 'Escape') return close();
    if (e.key === 'Tab') {
      const items = [...panel.querySelectorAll(FOCUSABLE)];
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Close if the viewport grows to desktop while open
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => e.matches && close());
  // Header scrolled state, progress bar and back-to-top live in effects.js
}
