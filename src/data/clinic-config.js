/**
 * ============================================================
 *  CLINIC CONFIGURATION — edit this file for each new client
 * ============================================================
 * Every page reads business details, hours, map and image paths
 * from here (elements marked with data-clinic / data-img attributes).
 * The HTML also contains the same values as a no-JavaScript fallback,
 * so after changing details here, search the .html files for the old
 * value if you also want the fallback text updated.
 *
 * ALL CONTENT BELOW IS DEMO / PLACEHOLDER DATA. Replace with details
 * approved by the clinic before going live.
 */

/** Build an Unsplash URL at a given width (free-licence demo photos). */
const u = (id, w = 1200) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`;

export const clinic = {
  name: 'DentalCare',
  tagline: 'Family & Cosmetic Dental Studio',
  phone: '+91 98300 12345', // shown to visitors
  phoneHref: '+919830012345', // used in tel: links
  whatsapp: '919830012345', // used in wa.me links (no +)
  email: 'hello@dentalcare.in',
  address: {
    line1: '9, Gopinath Marg, New Colony,',
    line2: 'Near Panch Batti, Jaipur – 302 001',
    city: 'Jaipur',
  },
  // Google Maps → Share → Embed a map → copy the src="" value
  mapEmbedUrl:
    'https://www.google.com/maps?q=9,+Gopinath+Marg,+New+Colony,+Panch+Batti,+Jaipur,+Rajasthan+302001,+India&output=embed',
  directionsUrl: 'https://www.google.com/maps?q=9,+Gopinath+Marg,+New+Colony,+Panch+Batti,+Jaipur,+Rajasthan+302001,+India&output=embed',
  timezone: 'Asia/Kolkata',

  /**
   * Opening hours. Day index: 0 = Sunday … 6 = Saturday.
   * `breaks` are excluded from bookable slots (e.g. lunch).
   * Set `open: null` for a closed day.
   */
  hours: [
    { day: 0, label: 'Sunday', open: '10:00', close: '14:00', breaks: [] },
    { day: 1, label: 'Monday', open: '10:00', close: '20:00', breaks: [['14:00', '15:00']] },
    { day: 2, label: 'Tuesday', open: '10:00', close: '20:00', breaks: [['14:00', '15:00']] },
    { day: 3, label: 'Wednesday', open: '10:00', close: '20:00', breaks: [['14:00', '15:00']] },
    { day: 4, label: 'Thursday', open: null, close: null, breaks: [] }, // weekly closed day (demo)
    { day: 5, label: 'Friday', open: '10:00', close: '20:00', breaks: [['14:00', '15:00']] },
    { day: 6, label: 'Saturday', open: '10:00', close: '18:00', breaks: [['14:00', '15:00']] },
  ],
  hoursNote: 'Closed on national holidays. Emergency? Call us — we will guide you.',
  holidays: ['2026-12-25', '2027-01-01', '2027-01-26'], // YYYY-MM-DD

  social: {
    facebook: 'https://facebook.com/',
    instagram: 'https://instagram.com/',
    youtube: 'https://youtube.com/',
  },

  /** Booking settings */
  booking: {
    // Leave empty to run the clearly-labelled DEMO mode (no real reservation).
    // Set to your backend, e.g. 'https://api.yourclinic.in' — see README "Booking API".
    apiBaseUrl: '',
    slotIntervalMinutes: 30,
    leadTimeMinutes: 120, // earliest bookable slot is 2h from now
    daysAhead: 21, // how many days visitors can pick from
    requireEmail: false,
    maxMessageLength: 300,
  },

  /** Contact form endpoint (e.g. Formspree). Empty = demo mode. */
  contactFormEndpoint: '',

  /**
   * IMAGE MAP — swap any URL for a local file, e.g. 'assets/images/hero-clinic.webp'.
   * Pages use <img data-img="key">, so changing it here updates every page.
   */
  images: {
    hero: u('1777331903190-341a3dd0441b', 1400),
    technology: u('1588776814546-1ffcf47267a5', 1000),
    whyUs: u('1588776814546-daab30f310ce', 1000),
    cta: u('1629909613654-28e377c37b09', 1600),
    pageHeader: u('1629909613654-28e377c37b09', 1600),

    // gallery
    reception: u('1762625570087-6d98fca29531', 900),
    treatmentRoom: u('1629909613654-28e377c37b09', 900),
    operatory: u('1598256989800-fe5f95da9787', 900),
    consultRoom: u('1643660526741-094639fbe53a', 900),
    brightRoom: u('1728342057953-94bfad8f0e7e', 900),
    instruments: u('1771442873038-dda05b6ca447', 900),
    xray: u('1588776814546-1ffcf47267a5', 900),
    scanner: u('1600170311833-c2cf5280ce49', 900),
    team1: u('1612349317150-e413f6a5b16d', 900),
    team2: u('1594824476967-48c8b964273f', 900),
    team3: u('1622253692010-333f2da6031d', 900),
    teamAtWork: u('1662837625421-5fd8ed6131a0', 900),
  },
};

export { u as unsplash };
