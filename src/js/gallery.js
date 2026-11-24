// Gallery: keyboard-accessible category filters + lightbox (Escape, arrows, focus trap & restore).
export function initGallery() {
  const grid = document.querySelector('[data-gallery]');
  if (!grid) return;

  const items = [...grid.querySelectorAll('[data-gallery-item]')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  const live = document.getElementById('gallery-live');

  /* ---- Filters ---- */
  filters.forEach((btn) =>
    btn.addEventListener('click', () => {
      const cat = btn.dataset.filter;
      filters.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      let count = 0;
      items.forEach((it) => {
        const show = cat === 'all' || it.dataset.category === cat;
        it.hidden = !show;
        if (show) count++;
      });
      if (live) live.textContent = `Showing ${count} ${cat === 'all' ? '' : btn.textContent.trim().toLowerCase() + ' '}photos`;
    })
  );

  /* ---- Lightbox ---- */
  const box = document.getElementById('lightbox');
  const img = box.querySelector('[data-lb-img]');
  const cap = box.querySelector('[data-lb-caption]');
  const counter = box.querySelector('[data-lb-count]');
  let index = 0;
  let opener = null;

  const visible = () => items.filter((i) => !i.hidden);

  function show(i) {
    const list = visible();
    index = (i + list.length) % list.length;
    const trigger = list[index].querySelector('img');
    img.src = trigger.currentSrc || trigger.src;
    img.alt = trigger.alt;
    cap.textContent = list[index].querySelector('figcaption span')?.textContent.trim() || trigger.alt;
    counter.textContent = `${index + 1} / ${list.length}`;
  }

  function open(item) {
    opener = document.activeElement;
    show(visible().indexOf(item));
    box.hidden = false;
    document.body.classList.add('overflow-hidden');
    box.querySelector('[data-lb-close]').focus();
  }
  function close() {
    box.hidden = true;
    document.body.classList.remove('overflow-hidden');
    opener?.focus();
  }

  items.forEach((it) => it.querySelector('button').addEventListener('click', () => open(it)));
  box.querySelector('[data-lb-close]').addEventListener('click', close);
  box.querySelector('[data-lb-prev]').addEventListener('click', () => show(index - 1));
  box.querySelector('[data-lb-next]').addEventListener('click', () => show(index + 1));
  box.addEventListener('click', (e) => e.target === box && close());

  document.addEventListener('keydown', (e) => {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') show(index + 1);
    else if (e.key === 'ArrowLeft') show(index - 1);
    else if (e.key === 'Tab') {
      const f = [...box.querySelectorAll('button')];
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}
