/**
 * ============================================================
 *  SERVICES — single source of truth
 * ============================================================
 * Used by: Services page cards, Home "featured" cards, home pricing
 * table, Contact form dropdown and the Booking service picker.
 *
 * Prices are INDICATIVE SAMPLE VALUES (INR). The clinic must approve
 * every price before launch. Set `price` to null to show
 * "Consultation required" instead.
 */
import { unsplash as u } from './clinic-config.js';

export const services = [
  {
    id: 'consultation',
    name: 'Consultation & Check-up',
    category: 'General Dentistry',
    summary: 'Full oral examination, digital X-ray review and a clear, written treatment plan.',
    includes: ['Oral & gum examination', 'Digital X-ray (if needed)', 'Personalised plan'],
    price: 500,
    priceNote: 'from',
    durationMinutes: 30,
    image: u('1606811841689-23dfddce3e95', 800),
    imageAlt: 'Dentist explaining a dental scan to a patient',
    featured: true,
    active: true,
  },
  {
    id: 'cleaning',
    name: 'Scaling & Polishing',
    category: 'Dental Cleaning',
    summary: 'Gentle ultrasonic cleaning to remove plaque and stains for fresher, healthier gums.',
    includes: ['Ultrasonic scaling', 'Stain polishing', 'Home-care guidance'],
    price: 1200,
    priceNote: 'from',
    durationMinutes: 45,
    image: u('1606811856475-5e6fcdc6e509', 800),
    imageAlt: 'Dental mirror and explorer instrument on a white surface',
    featured: true,
    active: true,
  },
  {
    id: 'whitening',
    name: 'Teeth Whitening',
    category: 'Cosmetic',
    summary: 'In-clinic professional whitening for a noticeably brighter smile in a single visit.',
    includes: ['Shade assessment', 'Gum protection', 'In-chair whitening session'],
    price: 6500,
    priceNote: 'from',
    durationMinutes: 60,
    image: u('1677026010083-78ec7f1b84ed', 800),
    imageAlt: 'Close-up of a bright, white smile',
    featured: true,
    active: true,
  },
  {
    id: 'root-canal',
    name: 'Root Canal Treatment',
    category: 'Endodontics',
    summary: 'Rotary, single-sitting RCT (where suitable) to save a painful or infected tooth.',
    includes: ['Digital X-ray', 'Rotary instrumentation', 'Temporary filling'],
    price: 4500,
    priceNote: 'from',
    durationMinutes: 60,
    image: u('1600170311833-c2cf5280ce49', 800),
    imageAlt: 'Dentist pointing at a dental scan on a tablet',
    featured: true,
    active: true,
  },
  {
    id: 'implants',
    name: 'Dental Implants',
    category: 'Restorative',
    summary: 'Permanent, natural-looking replacement for missing teeth, planned with 3D imaging.',
    includes: ['Implant consultation', 'Treatment planning', 'Crown options explained'],
    price: 25000,
    priceNote: 'from',
    durationMinutes: 60,
    image: u('1593022356769-11f762e25ed9', 800),
    imageAlt: 'Dental implant model showing implant post and teeth',
    featured: true,
    active: true,
  },
  {
    id: 'aligners',
    name: 'Braces & Clear Aligners',
    category: 'Orthodontics',
    summary: 'Straighten teeth discreetly with metal, ceramic braces or near-invisible aligners.',
    includes: ['Bite analysis', 'Digital smile preview', 'Flexible payment plans'],
    price: null, // shows "Consultation required"
    priceNote: '',
    durationMinutes: 45,
    image: u('1564420228450-d9a5bc8d6565', 800),
    imageAlt: 'Clear dental aligners with a white storage case',
    featured: true,
    active: true,
  },
  {
    id: 'crowns',
    name: 'Crowns & Bridges',
    category: 'Restorative',
    summary: 'Durable ceramic and zirconia crowns that restore strength, shape and colour.',
    includes: ['Tooth preparation', 'Digital impression', 'Shade matching'],
    price: 5500,
    priceNote: 'from',
    durationMinutes: 60,
    image: u('1771442873035-474765b40ac6', 800),
    imageAlt: 'Gloved hand holding a dental implant and ceramic crown',
    featured: false,
    active: true,
  },
  {
    id: 'kids',
    name: 'Pediatric Dentistry',
    category: 'Kids',
    summary: 'Friendly, patient care for children — check-ups, sealants, fluoride and fillings.',
    includes: ['Child-friendly check-up', 'Fluoride application', 'Parent guidance'],
    price: 600,
    priceNote: 'from',
    durationMinutes: 30,
    image: u('1657470179447-0f5aa16daa91', 800),
    imageAlt: 'Dentist gently treating a patient in the chair',
    featured: false,
    active: true,
  },
];

export const activeServices = () => services.filter((s) => s.active);

export const formatPrice = (s) =>
  s.price == null
    ? 'Consultation required'
    : `${s.priceNote ? s.priceNote.charAt(0).toUpperCase() + s.priceNote.slice(1) + ' ' : ''}₹${s.price.toLocaleString('en-IN')}`;
