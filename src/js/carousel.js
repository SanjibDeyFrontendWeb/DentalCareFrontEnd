// Lightweight review carousel (no library).
// Layout and swiping come from CSS scroll-snap; this file adds the buttons,
// dots, keyboard arrows and an autoplay that pauses on hover/focus and stops
// once the visitor takes control.
// Markup hooks: [data-carousel] > [data-carousel-track] > [data-carousel-slide],
// plus [data-carousel-dots], [data-carousel-prev|next].

const AUTOPLAY_MS = 6000;

function setupCarousel(root) {
  const track = root.querySelector('[data-carousel-track]');
  const slides = [...root.querySelectorAll('[data-carousel-slide]')];
  const dotsWrap = root.querySelector('[data-carousel-dots]');
  const prevBtn = root.querySelector('[data-carousel-prev]');
  const nextBtn = root.querySelector('[data-carousel-next]');
  if (!track || slides.length === 0) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const behavior = reduceMotion ? 'auto' : 'smooth';

  const slideWidth = () => slides[0].getBoundingClientRect().width;
  const perView = () => Math.max(1, Math.round(track.clientWidth / slideWidth()));
  const pageCount = () => slides.length - perView() + 1; // last page shows the final slides

  // The position we are heading to. Kept as state (not read from scrollLeft)
  // so quick clicks during a smooth scroll still move one step at a time.
  let index = 0;
  const current = () => index;

  const goTo = (i) => {
    const pages = pageCount();
    index = ((i % pages) + pages) % pages; // wrap around both ends
    track.scrollTo({ left: index * slideWidth(), behavior });
    update();
  };

  /* ---------- dots ---------- */
  let dots = [];
  const buildDots = () => {
    if (!dotsWrap) return;
    const pages = pageCount();
    dotsWrap.replaceChildren();
    dots = Array.from({ length: pages }, (_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'h-2.5 rounded-full transition-all duration-500 ease-smooth';
      b.setAttribute('aria-label', `Show review ${i + 1}`);
      b.addEventListener('click', () => {
        stop();
        goTo(i);
      });
      dotsWrap.append(b);
      return b;
    });
    update();
  };

  const ACTIVE = ['w-8', 'bg-brand-600', 'dark:bg-brand-400'];
  const IDLE = ['w-2.5', 'bg-ink/15', 'hover:bg-brand-400', 'dark:bg-white/20'];

  const update = () => {
    const i = Math.min(index, pageCount() - 1);
    dots.forEach((d, n) => {
      const on = n === i;
      d.setAttribute('aria-current', String(on));
      d.classList.remove(...(on ? IDLE : ACTIVE));
      d.classList.add(...(on ? ACTIVE : IDLE));
    });
    // hide off-screen slides from screen readers' "next item" so focus order matches what is visible
    const pv = perView();
    slides.forEach((s, n) => s.toggleAttribute('inert', n < i || n >= i + pv));
  };

  // When the visitor swipes or scrolls the track themselves, sync the index once it settles.
  let settle = null;
  track.addEventListener(
    'scroll',
    () => {
      clearTimeout(settle);
      settle = setTimeout(() => {
        const settled = Math.min(Math.round(track.scrollLeft / slideWidth()), pageCount() - 1);
        if (settled !== index) {
          index = settled;
          update();
        }
      }, 150);
    },
    { passive: true }
  );

  /* ---------- buttons + keyboard ---------- */
  prevBtn?.addEventListener('click', () => {
    stop();
    goTo(current() - 1);
  });
  nextBtn?.addEventListener('click', () => {
    stop();
    goTo(current() + 1);
  });
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      stop();
      goTo(current() + (e.key === 'ArrowRight' ? 1 : -1));
    }
  });

  /* ---------- autoplay (off for reduced motion) ---------- */
  let timer = null;
  let userPaused = reduceMotion;
  let hovering = false;

  const start = () => {
    if (userPaused || hovering || document.hidden || timer) return;
    timer = setInterval(() => goTo(current() + 1), AUTOPLAY_MS);
  };
  const halt = () => {
    clearInterval(timer);
    timer = null;
  };
  // A deliberate interaction (button, dot, arrow key, swipe) turns autoplay off for good.
  const stop = () => {
    userPaused = true;
    halt();
  };

  root.addEventListener('pointerenter', () => {
    hovering = true;
    halt();
  });
  root.addEventListener('pointerleave', () => {
    hovering = false;
    start();
  });
  root.addEventListener('focusin', () => {
    hovering = true;
    halt();
  });
  root.addEventListener('focusout', (e) => {
    if (!root.contains(e.relatedTarget)) {
      hovering = false;
      start();
    }
  });
  // touch swipe counts as taking control
  track.addEventListener('touchstart', stop, { passive: true });
  document.addEventListener('visibilitychange', () => (document.hidden ? halt() : start()));

  // rebuild dots when the number of visible slides changes (1 / 2 / 3 per view)
  let lastPerView = perView();
  window.addEventListener('resize', () => {
    const pv = perView();
    if (pv !== lastPerView) {
      lastPerView = pv;
      buildDots();
    } else update();
  });

  buildDots();
  start();
}

export function initCarousels() {
  document.querySelectorAll('[data-carousel]').forEach(setupCarousel);
}
