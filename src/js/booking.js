// Appointment booking: service → date → time slot → details → request.
// Runs in clearly-labelled DEMO mode unless clinic.booking.apiBaseUrl is set.
import { clinic } from '../data/clinic-config.js';
import { activeServices, formatPrice } from '../data/services.js';
import { clinicNow, addDays, daySchedule, formatDate, demoSlots, rememberDemoSlot, fmt12, toMin } from './schedule.js';
import { validateForm, wireLiveValidation, setStatus, spinner } from './forms.js';

const DEMO = !clinic.booking.apiBaseUrl;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------------- API layer (swap demo for real backend) ---------------- */
const api = {
  /** GET /api/availability?date=YYYY-MM-DD&serviceId=… */
  async availability(date, service) {
    if (!DEMO) {
      const res = await fetch(`${clinic.booking.apiBaseUrl}/api/availability?date=${date}&serviceId=${encodeURIComponent(service.id)}`);
      if (!res.ok) throw new Error('availability');
      return res.json(); // expected: { closed, reason?, slots: [{ time, available }] }
    }
    await wait(450); // simulate network
    return demoSlots(date, service.durationMinutes);
  },

  /** POST /api/appointments — server must re-check the slot and de-duplicate by idempotency key. */
  async create(payload, idempotencyKey) {
    if (!DEMO) {
      const res = await fetch(`${clinic.booking.apiBaseUrl}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
        body: JSON.stringify(payload),
      });
      if (res.status === 409) throw Object.assign(new Error('taken'), { code: 'SLOT_TAKEN' });
      if (!res.ok) throw new Error('server');
      return res.json(); // expected: { status: 'pending' | 'confirmed', reference }
    }
    await wait(900);
    // De-duplicate repeat submissions in demo
    const done = JSON.parse(sessionStorage.getItem('dc-idem') || '{}');
    if (done[idempotencyKey]) return done[idempotencyKey];
    // Re-check the slot right before "saving" (mirrors what the server must do)
    const still = demoSlots(payload.date, payload.durationMinutes).slots.find((s) => s.time === payload.time);
    if (!still || !still.available) throw Object.assign(new Error('taken'), { code: 'SLOT_TAKEN' });
    rememberDemoSlot(`${payload.date}T${payload.time}`);
    const result = { status: 'pending', reference: `DC-${Date.now().toString(36).slice(-5).toUpperCase()}` };
    done[idempotencyKey] = result;
    sessionStorage.setItem('dc-idem', JSON.stringify(done));
    return result; // NOTE: only non-personal data is stored in the browser
  },
};

/* ---------------- UI ---------------- */
export function initBooking() {
  const form = document.getElementById('booking-form');
  if (!form) return;

  const services = activeServices();
  const el = {
    service: form.querySelector('#bk-service'),
    serviceInfo: form.querySelector('[data-service-info]'),
    dates: form.querySelector('[data-dates]'),
    dateErr: form.querySelector('#bk-date-error'),
    slots: form.querySelector('[data-slots]'),
    slotStatus: form.querySelector('#bk-slot-status'),
    timeErr: form.querySelector('#bk-time-error'),
    status: document.getElementById('booking-status'),
    submit: form.querySelector('button[type="submit"]'),
    result: document.getElementById('booking-result'),
    sum: {
      service: document.querySelector('[data-sum="service"]'),
      date: document.querySelector('[data-sum="date"]'),
      time: document.querySelector('[data-sum="time"]'),
      price: document.querySelector('[data-sum="price"]'),
    },
  };
  const state = { service: null, date: null, time: null, idem: crypto.randomUUID ? crypto.randomUUID() : String(Math.random()) };
  const submitHTML = el.submit.innerHTML;
  wireLiveValidation(form);

  document.querySelectorAll('[data-demo-only]').forEach((n) => (n.hidden = !DEMO));
  form.querySelector('#bk-email').required = clinic.booking.requireEmail;
  form.querySelector('#bk-message').maxLength = clinic.booking.maxMessageLength;

  /* --- summary --- */
  function updateSummary() {
    const s = state.service;
    el.sum.service.textContent = s ? s.name : '—';
    el.sum.price.textContent = s ? formatPrice(s) : '—';
    el.sum.date.textContent = state.date ? formatDate(state.date, { weekday: 'long', day: 'numeric', month: 'long' }) : '—';
    el.sum.time.textContent = state.time ? fmt12(state.time) : '—';
    if (s) {
      el.serviceInfo.innerHTML = `<span class="font-semibold text-ink-900 dark:text-white">${formatPrice(s)}</span> · approx. ${s.durationMinutes} min · ${s.summary}`;
      el.serviceInfo.hidden = false;
    } else el.serviceInfo.hidden = true;
  }

  /* --- dates --- */
  function renderDates() {
    const { dateKey: today, minutes } = clinicNow();
    let html = '';
    for (let i = 0; i < clinic.booking.daysAhead; i++) {
      const key = addDays(today, i);
      const sched = daySchedule(key);
      // Today is unbookable if the earliest possible slot is past closing
      const tooLate = i === 0 && !sched.closed && minutes + clinic.booking.leadTimeMinutes >= sched.close;
      const disabled = sched.closed || tooLate;
      const sub = sched.closed ? sched.reason : tooLate ? 'Full' : i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : formatDate(key, { month: 'short' });
      html += `<div class="relative shrink-0 snap-start">
        <input class="chip-input" type="radio" name="date" id="d-${key}" value="${key}" ${disabled ? 'disabled' : ''}
          aria-label="${formatDate(key, { weekday: 'long', day: 'numeric', month: 'long' })}${disabled ? ` — ${sub}` : ''}">
        <label for="d-${key}" class="chip h-[5.25rem] w-[4.5rem]">
          <span class="text-[0.7rem] font-semibold uppercase tracking-wider opacity-80">${formatDate(key, { weekday: 'short' })}</span>
          <span class="font-display text-xl font-bold leading-tight">${formatDate(key, { day: 'numeric' })}</span>
          <span class="text-[0.68rem] font-medium opacity-80">${sub}</span>
        </label></div>`;
    }
    el.dates.innerHTML = html;
  }

  /* --- slots --- */
  let reqId = 0;
  async function loadSlots() {
    const { service, date } = state;
    if (!date) {
      el.slots.innerHTML = `<p class="rounded-xl border border-dashed border-ink/20 p-5 text-center text-sm text-ink-500 dark:border-white/15 dark:text-night-300">Choose a date to see available times.</p>`;
      return;
    }
    if (!service) {
      el.slots.innerHTML = `<p class="rounded-xl border border-dashed border-ink/20 p-5 text-center text-sm text-ink-500 dark:border-white/15 dark:text-night-300">Choose a treatment first — slot length depends on the service.</p>`;
      return;
    }
    const id = ++reqId;
    el.slots.setAttribute('aria-busy', 'true');
    el.slotStatus.textContent = 'Loading available times…';
    el.slots.innerHTML = `<div class="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">${'<div class="h-11 animate-pulse rounded-xl bg-sand-100 dark:bg-night-700"></div>'.repeat(10)}</div>`;
    let data;
    try {
      data = await api.availability(date, service);
    } catch (e) {
      if (id !== reqId) return;
      el.slots.removeAttribute('aria-busy');
      el.slots.innerHTML = `<p class="rounded-xl border border-red-600/30 bg-red-50 p-4 text-sm text-red-900 dark:bg-red-400/10 dark:text-red-100">We couldn't load times. Please try again or call <a class="font-semibold underline" href="tel:${clinic.phoneHref}">${clinic.phone}</a>.</p>`;
      el.slotStatus.textContent = 'Could not load times.';
      return;
    }
    if (id !== reqId) return; // a newer request superseded this one
    el.slots.removeAttribute('aria-busy');

    const free = data.slots.filter((s) => s.available);
    if (data.closed || !free.length) {
      state.time = null;
      updateSummary();
      el.slots.innerHTML = `<div class="rounded-xl border border-dashed border-ink/20 p-6 text-center dark:border-white/15">
        <p class="font-semibold text-ink-900 dark:text-white">${data.closed ? 'The clinic is closed on this day.' : 'No slots left on this day.'}</p>
        <p class="mt-1 text-sm text-ink-500 dark:text-night-300">Please pick another date, or call us and we'll try to fit you in.</p></div>`;
      el.slotStatus.textContent = 'No available times on this date.';
      return;
    }

    const groups = { Morning: [], Afternoon: [], Evening: [] };
    data.slots.forEach((s) => {
      const m = toMin(s.time);
      (m < 720 ? groups.Morning : m < 1020 ? groups.Afternoon : groups.Evening).push(s);
    });
    if (state.time && !free.some((s) => s.time === state.time)) state.time = null; // keep selection only if still free
    el.slots.innerHTML = Object.entries(groups)
      .filter(([, list]) => list.length)
      .map(
        ([name, list]) => `<div class="mb-4 last:mb-0">
          <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-night-300">${name}</p>
          <div class="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">${list
            .map(
              (s) => `<div class="relative"><input class="chip-input" type="radio" name="time" id="t-${s.time}" value="${s.time}" ${s.available ? '' : 'disabled'} ${
                s.time === state.time ? 'checked' : ''
              } aria-label="${fmt12(s.time)}${s.available ? '' : ' — unavailable'}">
              <label for="t-${s.time}" class="chip h-11 w-full whitespace-nowrap px-1 text-[0.8125rem]">${fmt12(s.time)}</label></div>`
            )
            .join('')}</div></div>`
      )
      .join('');
    el.slotStatus.textContent = `${free.length} time${free.length > 1 ? 's' : ''} available on ${formatDate(date, { weekday: 'long', day: 'numeric', month: 'long' })}.`;
    updateSummary();
  }

  /* --- events --- */
  el.service.addEventListener('change', () => {
    state.service = services.find((s) => s.id === el.service.value) || null;
    updateSummary();
    loadSlots();
  });
  el.dates.addEventListener('change', (e) => {
    if (e.target.name !== 'date') return;
    state.date = e.target.value;
    el.dateErr.textContent = '';
    updateSummary();
    loadSlots();
  });
  el.slots.addEventListener('change', (e) => {
    if (e.target.name !== 'time') return;
    state.time = e.target.value;
    el.timeErr.textContent = '';
    updateSummary();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    el.status.hidden = true;
    let ok = validateForm(form);
    if (!state.date) {
      el.dateErr.textContent = 'Please choose a date.';
      if (ok) el.dates.querySelector('input:not(:disabled)')?.focus();
      ok = false;
    }
    if (!state.time) {
      el.timeErr.textContent = state.date ? 'Please choose an available time.' : 'Choose a date first, then pick a time.';
      if (ok) el.slots.querySelector('input:not(:disabled)')?.focus();
      ok = false;
    }
    if (!ok) {
      setStatus(el.status, 'error', 'Some details are missing or need attention. Please check the highlighted fields.');
      // Move focus to the first problem in reading order
      const firstErr = form.querySelector('.field-error:not(:empty)');
      if (firstErr?.id === 'bk-date-error') el.dates.querySelector('input:not(:disabled)')?.focus();
      else if (firstErr?.id === 'bk-time-error') (el.slots.querySelector('input:not(:disabled)') || el.dates.querySelector('input:not(:disabled)'))?.focus();
      else if (firstErr) document.getElementById(firstErr.id.replace(/-error$/, ''))?.focus();
      return;
    }

    el.submit.disabled = true;
    el.submit.innerHTML = `${spinner} Sending request…`;
    const fd = new FormData(form);
    const payload = {
      serviceId: state.service.id,
      durationMinutes: state.service.durationMinutes,
      date: state.date,
      time: state.time,
      timezone: clinic.timezone,
      patientName: fd.get('name').trim(),
      phone: fd.get('phone').trim(),
      email: (fd.get('email') || '').trim(),
      message: (fd.get('message') || '').trim(),
      consent: true,
    };
    try {
      const res = await api.create(payload, state.idem);
      showResult(res, payload);
    } catch (err) {
      if (err.code === 'SLOT_TAKEN') {
        setStatus(el.status, 'error', '<strong>Sorry, that time was just taken.</strong> We have refreshed the available times — please choose another slot.');
        state.time = null;
        await loadSlots();
      } else {
        setStatus(
          el.status,
          'error',
          `<strong>We couldn't send your request.</strong> Please try again, or call <a class="font-semibold underline" href="tel:${clinic.phoneHref}">${clinic.phone}</a> to book by phone.`
        );
      }
      el.status.focus();
    } finally {
      el.submit.disabled = false;
      el.submit.innerHTML = submitHTML;
    }
  });

  function showResult(res, p) {
    const confirmed = res.status === 'confirmed' && !DEMO;
    const first = p.patientName.split(' ')[0];
    el.result.innerHTML = `
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full ${confirmed ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-50 text-brand-700'} dark:bg-white/10 dark:text-brand-200">
        <svg aria-hidden="true" class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 13l4 4L19 7"/></svg>
      </div>
      <h2 class="mt-5 text-center text-2xl font-bold sm:text-3xl" tabindex="-1" data-result-heading>${confirmed ? 'Appointment confirmed' : 'Request received — pending confirmation'}</h2>
      <p class="mx-auto mt-3 max-w-md text-center text-ink-500 dark:text-night-300">Thank you, ${first.replace(/[<>&"]/g, '')}. ${
        confirmed ? 'Your appointment is booked.' : 'Our front desk will call you to confirm the time. Your slot is not reserved until we confirm it.'
      }</p>
      ${
        DEMO
          ? '<p class="mx-auto mt-4 max-w-md rounded-lg bg-amber-50 px-4 py-2 text-center text-sm font-medium text-amber-900 dark:bg-amber-400/10 dark:text-amber-100">Demo mode: this is a portfolio preview. No appointment has been booked and no data was sent.</p>'
          : ''
      }
      <dl class="mx-auto mt-6 grid max-w-md grid-cols-2 gap-x-6 gap-y-3 rounded-2xl bg-sand-50 p-5 text-sm dark:bg-night-900">
        <dt class="text-ink-500 dark:text-night-300">Reference</dt><dd class="text-right font-semibold">${res.reference}</dd>
        <dt class="text-ink-500 dark:text-night-300">Status</dt><dd class="text-right font-semibold">${confirmed ? 'Confirmed' : 'Pending'}</dd>
        <dt class="text-ink-500 dark:text-night-300">Treatment</dt><dd class="text-right font-semibold">${state.service.name}</dd>
        <dt class="text-ink-500 dark:text-night-300">Requested</dt><dd class="text-right font-semibold">${formatDate(p.date)}, ${fmt12(p.time)}</dd>
      </dl>
      <div class="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <a href="tel:${clinic.phoneHref}" class="btn-primary">Call ${clinic.phone}</a>
        <a href="index.html" class="btn-outline">Back to home</a>
      </div>`;
    form.hidden = true;
    document.querySelector('[data-booking-aside]')?.classList.add('hidden', 'lg:block');
    el.result.hidden = false;
    el.result.querySelector('[data-result-heading]').focus();
    window.scrollTo({ top: el.result.getBoundingClientRect().top + window.scrollY - 120 });
  }

  /* --- init --- */
  renderDates();
  const pre = new URLSearchParams(location.search).get('service');
  if (pre && services.some((s) => s.id === pre)) {
    el.service.value = pre;
    state.service = services.find((s) => s.id === pre);
  }
  updateSummary();
  loadSlots();
}
