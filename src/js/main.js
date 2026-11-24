// Entry point loaded on every page (type="module").
// The HTML already contains readable fallback content; this script
// re-renders it from the central data files so one edit updates every page.
import { clinic } from '../data/clinic-config.js';
import { activeServices } from '../data/services.js';
import { serviceCard, pricingRows, hoursItems, esc } from './render.js';
import { initTheme } from './theme.js';
import { initNavigation } from './navigation.js';
import { openStatus, nextAvailable, fmt12, clinicNow, weekday } from './schedule.js';
import { initContactForm } from './forms.js';
import { initGallery } from './gallery.js';
import { initBooking } from './booking.js';
import { initEffects } from './effects.js';
import { initCarousels } from './carousel.js';

/* ---------- 1. Clinic details from the central config ---------- */
function bindClinic() {
  const text = {
    name: clinic.name,
    tagline: clinic.tagline,
    phone: clinic.phone,
    email: clinic.email,
    address1: clinic.address.line1,
    address2: clinic.address.line2,
    hoursNote: clinic.hoursNote,
  };
  document.querySelectorAll('[data-clinic]').forEach((el) => {
    const v = text[el.dataset.clinic];
    if (v) el.textContent = v;
  });
  document.querySelectorAll('[data-clinic-tel]').forEach((a) => (a.href = `tel:${clinic.phoneHref}`));
  document.querySelectorAll('[data-clinic-mail]').forEach((a) => (a.href = `mailto:${clinic.email}`));
  document.querySelectorAll('[data-clinic-wa]').forEach((a) => (a.href = `https://wa.me/${clinic.whatsapp}`));
  document.querySelectorAll('[data-clinic-directions]').forEach((a) => (a.href = clinic.directionsUrl));
  document.querySelectorAll('[data-clinic-map]').forEach((f) => f.getAttribute('src') !== clinic.mapEmbedUrl && (f.src = clinic.mapEmbedUrl));
  document.querySelectorAll('[data-social]').forEach((a) => clinic.social[a.dataset.social] && (a.href = clinic.social[a.dataset.social]));
  document.querySelectorAll('[data-img]').forEach((img) => {
    const src = clinic.images[img.dataset.img];
    if (src && img.getAttribute('src') !== src) img.src = src;
  });
  document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
}

/* ---------- 2. Business hours + live open status ---------- */
function renderHours() {
  const todayIdx = weekday(clinicNow().dateKey);
  document.querySelectorAll('[data-hours-list]').forEach((list) => {
    list.innerHTML = hoursItems(clinic.hours, { compact: list.dataset.hoursList === 'compact', todayIdx });
  });
  const status = openStatus();
  document.querySelectorAll('[data-open-status]').forEach((el) => {
    el.innerHTML = `<span class="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">${
      status.open ? '<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"></span>' : ''
    }<span class="relative inline-flex h-2.5 w-2.5 rounded-full ${status.open ? 'bg-emerald-500' : 'bg-amber-500'}"></span></span><span>${esc(status.text)}</span>`;
  });
}

/* ---------- 3. Services (single data source) ---------- */
function renderServices() {
  const all = activeServices();
  document.querySelectorAll('[data-services-grid]').forEach((grid) => {
    const mode = grid.dataset.servicesGrid;
    const list = mode === 'featured' ? all.filter((s) => s.featured).slice(0, 6) : all;
    grid.innerHTML = list.map((s) => serviceCard(s, { full: mode === 'full' })).join('');
  });
  document.querySelectorAll('[data-pricing-rows]').forEach((tbody) => (tbody.innerHTML = pricingRows(all)));
  document.querySelectorAll('select[data-service-select]').forEach((sel) => {
    const placeholder = sel.querySelector('option[value=""]');
    sel.replaceChildren(...(placeholder ? [placeholder] : []));
    all.forEach((s) => sel.append(new Option(s.name, s.id)));
    if (sel.dataset.serviceSelect === 'with-other') sel.append(new Option('Other / not sure yet', 'other'));
  });
}

/* ---------- 4. Home hero "next available" (demo) ---------- */
function renderNextSlot() {
  const el = document.querySelector('[data-next-slot]');
  if (!el) return;
  const next = nextAvailable();
  el.textContent = next ? `${next.label}, ${fmt12(next.time)}` : 'Call us to book';
}

/* ---------- Boot ---------- */
initTheme();
initNavigation();
bindClinic();
renderHours();
renderServices();
renderNextSlot();
initContactForm();
initGallery();
initBooking();
initCarousels();
initEffects(); // last, so re-rendered sections are observed
