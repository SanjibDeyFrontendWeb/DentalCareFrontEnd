// Motion & polish: scroll reveal, header state, scroll progress, back-to-top,
// count-up stats and the cursor spotlight on cards. Everything degrades
// gracefully: without JS or with reduced motion the content is simply static.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initReveal() {
  window.__dcEffects = true;
  const els = document.querySelectorAll('[data-reveal]');
  if (!document.documentElement.classList.contains('reveal-ready')) return;
  els.forEach((el) => el.dataset.revealDelay && el.style.setProperty('--reveal-delay', `${el.dataset.revealDelay}ms`));
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );
  els.forEach((el) => io.observe(el));
}

function initScrollUi() {
  const header = document.querySelector('[data-site-header]');
  const bar = document.querySelector('[data-scroll-progress]');
  const toTop = document.querySelector('[data-to-top]');
  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header?.toggleAttribute('data-scrolled', y > 24);
    if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
    if (toTop) {
      const show = y > window.innerHeight * 0.8;
      toTop.classList.toggle('opacity-0', !show);
      toTop.classList.toggle('pointer-events-none', !show);
      toTop.classList.toggle('translate-y-4', !show);
      toTop.tabIndex = show ? 0 : -1;
    }
    ticking = false;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) requestAnimationFrame(update);
      ticking = true;
    },
    { passive: true }
  );
  update();

  toTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    document.getElementById('main')?.focus({ preventScroll: true });
  });
}

/** Animated numbers: <span data-count="12" data-suffix="+">12+</span> */
function initCountUp() {
  const els = document.querySelectorAll('[data-count]');
  if (reduceMotion || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) =>
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const el = e.target;
      const end = Number(el.dataset.count);
      const pre = el.dataset.prefix || '';
      const suf = el.dataset.suffix || '';
      const t0 = performance.now();
      const dur = 1400;
      const step = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = `${pre}${Math.round(end * eased).toLocaleString('en-IN')}${suf}`;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    })
  );
  els.forEach((el) => io.observe(el));
}

/** Soft radial highlight that follows the cursor on .spotlight cards. */
function initSpotlight() {
  if (reduceMotion || !window.matchMedia('(hover: hover)').matches) return;
  document.addEventListener(
    'pointermove',
    (e) => {
      const card = e.target.closest?.('.spotlight');
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    },
    { passive: true }
  );
}

export function initEffects() {
  initReveal();
  initScrollUi();
  initCountUp();
  initSpotlight();
}
