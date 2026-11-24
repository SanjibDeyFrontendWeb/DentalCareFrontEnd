// Pure HTML-string renderers shared by the pages (no DOM access here).
import { formatPrice } from '../data/services.js';

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const fmt12 = (hm) => {
  const [h, m] = hm.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

export const icon = {
  check:
    '<svg aria-hidden="true" class="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z" clip-rule="evenodd"/></svg>',
  arrow:
    '<svg aria-hidden="true" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 10a1 1 0 0 1 1-1h9.6l-3.3-3.3a1 1 0 1 1 1.4-1.4l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4-1.4l3.3-3.3H4a1 1 0 0 1-1-1Z" clip-rule="evenodd"/></svg>',
  clock:
    '<svg aria-hidden="true" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
};

/** Service card used on Home (featured) and Services (full) pages. */
export function serviceCard(s, { full = false } = {}) {
  const includes = full
    ? `<ul class="mt-5 space-y-2 text-sm" aria-label="What is included">${s.includes
        .map((i) => `<li class="flex items-center gap-2.5"><span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-400/10 dark:text-brand-300">${icon.check}</span>${esc(i)}</li>`)
        .join('')}</ul>`
    : '';
  const duration =
    full && s.durationMinutes
      ? `<span class="flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-ink-900 shadow-sm backdrop-blur dark:bg-night-900/90 dark:text-white">${icon.clock}${s.durationMinutes} min</span>`
      : '';
  return `<article class="card card-hover spotlight group flex flex-col overflow-hidden" id="${s.id}">
  <div class="relative m-2 aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-sand-100 dark:bg-night-700">
    <img src="${s.image}" alt="${esc(s.imageAlt)}" width="800" height="600" loading="lazy" decoding="async" class="h-full w-full object-cover transition duration-700 ease-smooth group-hover:scale-110">
    <div class="absolute inset-0 bg-gradient-to-t from-night-950/50 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" aria-hidden="true"></div>
    <div class="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
      <span class="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm backdrop-blur dark:bg-night-900/90 dark:text-brand-200">${esc(s.category)}</span>
      ${duration}
    </div>
  </div>
  <div class="flex flex-1 flex-col px-6 pb-6 pt-4">
    <h3 class="text-xl font-semibold">${esc(s.name)}</h3>
    <p class="mt-2 text-[0.9375rem] leading-relaxed text-ink-500 dark:text-night-300">${esc(s.summary)}</p>
    ${includes}
    <div class="min-h-[1.5rem] flex-1" aria-hidden="true"></div>
    <div class="flex items-end justify-between gap-4 border-t border-ink/[0.07] pt-5 dark:border-white/10">
      <div class="min-w-0">
        <p class="text-xs font-medium uppercase tracking-wider text-ink-500 dark:text-night-300">Starting at</p>
        <p class="mt-0.5 font-display text-xl font-semibold text-ink-900 dark:text-white">${formatPrice(s)}</p>
      </div>
      <a href="book-appointment.html?service=${s.id}" class="btn-primary group/btn min-h-[2.75rem] shrink-0 px-5 text-sm">Book<span class="sr-only"> ${esc(s.name)}</span><span class="transition-transform duration-300 group-hover/btn:translate-x-1">${icon.arrow}</span></a>
    </div>
  </div>
</article>`;
}

export const pricingRows = (list) =>
  list
    .map(
      (s) => `<tr class="border-t border-ink/10 dark:border-white/10">
  <th scope="row" class="py-3.5 pr-4 text-left font-semibold text-ink-900 dark:text-white">${esc(s.name)}</th>
  <td class="hidden py-3.5 pr-4 text-ink-500 dark:text-night-300 sm:table-cell">${esc(s.category)}</td>
  <td class="whitespace-nowrap py-3.5 text-right font-semibold text-brand-700 dark:text-brand-300">${formatPrice(s)}</td>
</tr>`
    )
    .join('');

/** Monday-first opening-hours list items. */
export function hoursItems(hours, { compact = false, todayIdx = -1 } = {}) {
  const ordered = [...hours.slice(1), hours[0]];
  return ordered
    .map((h) => {
      const isToday = h.day === todayIdx;
      const time = h.open ? `${fmt12(h.open)} – ${fmt12(h.close)}` : 'Closed';
      const base = compact ? 'py-1.5' : 'rounded-lg px-3 py-2.5';
      const today = isToday ? (compact ? 'font-semibold' : 'bg-brand-50 font-semibold text-brand-800 dark:bg-white/10 dark:text-white') : '';
      const closed = h.open ? '' : compact ? 'font-semibold text-amber-200' : 'font-semibold text-red-700 dark:text-red-300';
      const badge = compact
        ? '<span class="sr-only"> (today)</span>'
        : ' <span class="ml-1 whitespace-nowrap rounded-full bg-brand-600 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-white dark:bg-brand-500">Today</span>';
      return `<li class="flex items-center justify-between gap-4 ${base} ${today}"><span class="flex items-center gap-2">${
        isToday && compact ? '<span class="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden="true"></span>' : ''
      }${h.label}${isToday ? badge : ''}</span><span class="${compact ? 'whitespace-nowrap' : 'text-right'} ${closed}">${time}</span></li>`;
    })
    .join('');
}
