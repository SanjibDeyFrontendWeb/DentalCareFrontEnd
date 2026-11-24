// Clinic time helpers + DEMO availability engine.
// Everything is calculated in the clinic's timezone (config.timezone, default Asia/Kolkata).
import { clinic } from '../data/clinic-config.js';

export const toMin = (hm) => {
  const [h, m] = hm.split(':').map(Number);
  return h * 60 + m;
};
export const toHM = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
export const fmt12 = (hm) => {
  const [h, m] = hm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${suffix}`;
};

/** Current date/time in the clinic timezone. */
export function clinicNow() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: clinic.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
    .formatToParts(new Date())
    .reduce((acc, p) => ((acc[p.type] = p.value), acc), {});
  const dateKey = `${parts.year}-${parts.month}-${parts.day}`;
  return { dateKey, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

/** Date helpers that work purely on YYYY-MM-DD keys (timezone-safe). */
export const keyToDate = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};
export const addDays = (key, n) => {
  const d = keyToDate(key);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
export const weekday = (key) => keyToDate(key).getUTCDay();
export const formatDate = (key, opts = { weekday: 'short', day: 'numeric', month: 'short' }) =>
  new Intl.DateTimeFormat('en-IN', { ...opts, timeZone: 'UTC' }).format(keyToDate(key));

/** Opening schedule for a date, including closed days and holidays. */
export function daySchedule(key) {
  const rule = clinic.hours.find((h) => h.day === weekday(key));
  if (clinic.holidays.includes(key)) return { closed: true, reason: 'Holiday' };
  if (!rule || !rule.open) return { closed: true, reason: 'Closed' };
  return { closed: false, open: toMin(rule.open), close: toMin(rule.close), breaks: rule.breaks.map(([a, b]) => [toMin(a), toMin(b)]) };
}

/** Live "open now" status for the header/hours widgets. */
export function openStatus() {
  const { dateKey, minutes } = clinicNow();
  const s = daySchedule(dateKey);
  if (!s.closed && minutes >= s.open && minutes < s.close) {
    const onBreak = s.breaks.find(([a, b]) => minutes >= a && minutes < b);
    if (onBreak) return { open: false, text: `On lunch break · back at ${fmt12(toHM(onBreak[1]))}` };
    return { open: true, text: `Open now · closes ${fmt12(toHM(s.close))}` };
  }
  // find next opening
  for (let i = 0; i < 8; i++) {
    const k = addDays(dateKey, i);
    const d = daySchedule(k);
    if (d.closed) continue;
    if (i === 0 && minutes >= d.open) continue;
    const when = i === 0 ? 'today' : i === 1 ? 'tomorrow' : formatDate(k, { weekday: 'long' });
    return { open: false, text: `Closed · opens ${when} ${fmt12(toHM(d.open))}` };
  }
  return { open: false, text: 'Closed' };
}

/* ---------------- DEMO availability ---------------- */
const BOOKED_KEY = 'dc-demo-booked';

/** Deterministic pseudo-random so the same day always shows the same "taken" slots. */
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

export function demoBookedSlots() {
  try {
    return JSON.parse(localStorage.getItem(BOOKED_KEY) || '[]');
  } catch (e) {
    return [];
  }
}
export function rememberDemoSlot(slotKey) {
  try {
    const list = demoBookedSlots();
    list.push(slotKey);
    localStorage.setItem(BOOKED_KEY, JSON.stringify(list.slice(-50)));
  } catch (e) {}
}

/**
 * Returns all slots for a date with { time, available }.
 * Respects opening hours, breaks, service duration and lead time.
 */
export function demoSlots(dateKey, durationMinutes = 30) {
  const s = daySchedule(dateKey);
  if (s.closed) return { closed: true, reason: s.reason, slots: [] };
  const { dateKey: today, minutes: nowMin } = clinicNow();
  const step = clinic.booking.slotIntervalMinutes;
  const lead = clinic.booking.leadTimeMinutes;
  const taken = new Set(demoBookedSlots());
  const slots = [];
  for (let t = s.open; t + durationMinutes <= s.close; t += step) {
    const end = t + durationMinutes;
    if (s.breaks.some(([a, b]) => t < b && end > a)) continue; // overlaps a break
    const time = toHM(t);
    let available = true;
    if (dateKey === today && t < nowMin + lead) available = false; // past / too soon
    if (hash(`${dateKey}T${time}`) < 0.3) available = false; // simulated existing bookings
    if (taken.has(`${dateKey}T${time}`)) available = false; // booked in this browser (demo)
    slots.push({ time, available });
  }
  return { closed: false, slots };
}

/** First available slot from today onwards (used on the home hero card). */
export function nextAvailable(durationMinutes = 30) {
  const { dateKey } = clinicNow();
  for (let i = 0; i < clinic.booking.daysAhead; i++) {
    const k = addDays(dateKey, i);
    const slot = demoSlots(k, durationMinutes).slots.find((x) => x.available);
    if (slot) return { dateKey: k, time: slot.time, label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : formatDate(k) };
  }
  return null;
}
