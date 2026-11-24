// Shared accessible form validation + Contact form behaviour.
import { clinic } from '../data/clinic-config.js';

/** India-friendly phone check that still accepts international +CC numbers. */
export function isValidPhone(value) {
  const v = value.replace(/[\s\-().]/g, '');
  return /^(\+91|91|0)?[6-9]\d{9}$/.test(v) || /^\+[1-9]\d{7,14}$/.test(v);
}
export const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

/** Returns an error message for a field or '' if valid. */
export function fieldError(el) {
  const v = (el.value || '').trim();
  const label = el.dataset.label || 'This field';
  if (el.type === 'checkbox') return el.required && !el.checked ? el.dataset.msg || 'Please tick this box to continue.' : '';
  if (el.required && !v) return el.tagName === 'SELECT' ? `Please choose a ${label.toLowerCase()}.` : `Please enter your ${label.toLowerCase()}.`;
  if (!v) return '';
  if (el.dataset.validate === 'name' && (v.length < 2 || v.length > 60 || !/^[\p{L} .'-]+$/u.test(v)))
    return 'Please enter a valid name (2–60 letters).';
  if (el.dataset.validate === 'phone' && !isValidPhone(v)) return 'Please enter a valid phone number, e.g. 98300 12345 or +91 98300 12345.';
  if (el.type === 'email' && !isValidEmail(v)) return 'Please enter a valid email address, e.g. name@example.com.';
  if (el.maxLength > 0 && v.length > el.maxLength) return `Please keep this under ${el.maxLength} characters.`;
  return '';
}

export function showError(el, msg) {
  const errEl = document.getElementById(`${el.id}-error`);
  el.setAttribute('aria-invalid', msg ? 'true' : 'false');
  if (errEl) errEl.textContent = msg;
}

/** Validate every [data-validate-field] in a form; focuses the first invalid one. */
export function validateForm(form) {
  let first = null;
  form.querySelectorAll('[data-field]').forEach((el) => {
    const msg = fieldError(el);
    showError(el, msg);
    if (msg && !first) first = el;
  });
  if (first) first.focus();
  return !first;
}

/** Live re-validation once a field has been touched. */
export function wireLiveValidation(form) {
  form.querySelectorAll('[data-field]').forEach((el) => {
    const run = () => showError(el, fieldError(el));
    el.addEventListener('blur', () => el.value && run());
    el.addEventListener('input', () => el.getAttribute('aria-invalid') === 'true' && run());
    el.addEventListener('change', () => el.getAttribute('aria-invalid') === 'true' && run());
  });
  // Character counters
  form.querySelectorAll('[data-counter-for]').forEach((c) => {
    const ta = document.getElementById(c.dataset.counterFor);
    const update = () => (c.textContent = `${ta.value.length}/${ta.maxLength}`);
    ta.addEventListener('input', update);
    update();
  });
}

export function setStatus(el, type, html) {
  const styles = {
    success: 'border-emerald-600/30 bg-emerald-50 text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-100',
    error: 'border-red-600/30 bg-red-50 text-red-900 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-100',
    info: 'border-brand-600/30 bg-brand-50 text-brand-900 dark:border-brand-300/30 dark:bg-brand-300/10 dark:text-brand-100',
  };
  el.className = `rounded-xl border p-4 text-sm leading-relaxed ${styles[type]}`;
  el.innerHTML = html;
  el.hidden = false;
}

export const spinner =
  '<svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" class="opacity-25"/><path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';

/* ---------------- Contact page ---------------- */
export function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const status = document.getElementById('contact-status');
  const btn = form.querySelector('button[type="submit"]');
  const btnHTML = btn.innerHTML;
  wireLiveValidation(form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.hidden = true;
    if (!validateForm(form)) {
      setStatus(status, 'error', 'Please fix the highlighted fields and try again.');
      return;
    }
    btn.disabled = true;
    btn.innerHTML = `${spinner} Sending…`;
    try {
      if (clinic.contactFormEndpoint) {
        const res = await fetch(clinic.contactFormEndpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) });
        if (!res.ok) throw new Error('Request failed');
        setStatus(status, 'success', '<strong>Thank you!</strong> Your message has been sent. Our team will call you back within one working day.');
      } else {
        await new Promise((r) => setTimeout(r, 700));
        setStatus(
          status,
          'success',
          `<strong>Thank you — message received (demo mode).</strong> This demo site does not send messages yet. For a quick reply, call <a class="font-semibold underline" href="tel:${clinic.phoneHref}">${clinic.phone}</a>.`
        );
      }
      form.reset();
      form.querySelectorAll('[data-counter-for]').forEach((c) => document.getElementById(c.dataset.counterFor).dispatchEvent(new Event('input')));
    } catch (err) {
      setStatus(status, 'error', `Sorry, we couldn't send your message. Please try again or call <a class="font-semibold underline" href="tel:${clinic.phoneHref}">${clinic.phone}</a>.`);
    } finally {
      btn.disabled = false;
      btn.innerHTML = btnHTML;
      status.focus();
    }
  });
}
