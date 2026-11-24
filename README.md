# DentalCare — Dental Clinic Website & Appointment Booking

A responsive, accessible, dark-mode-ready website for a local dental clinic, built with **HTML5, Tailwind CSS and vanilla JavaScript** (ES modules, no framework). Includes an end-to-end appointment booking flow (demo mode until a backend is connected).

> **Live demo:** (https://dentalcarefrontend.netlify.app/) · **GitHub:** (https://github.com/SanjibDeyFrontendWeb/DentalCareFrontEnd.git)

## Pages

| Route | Purpose |
|---|---|
| `index.html` | Hero, trust highlights, **Advanced & Affordable Dental Treatments** with pricing table, featured services (CSS Grid), **Why choose us** (Flexbox), booking steps, testimonials carousel, hours + CTA |
| `services.html` | Service card grid (1 / 2 / 3 columns), inclusions, indicative prices, durations, pricing note, FAQ |
| `gallery.html` | Responsive image grid, keyboard-accessible category filters, lightbox (Esc, ← →, focus trap) |
| `contact.html` | Accessible form (name, phone, service dropdown, message), tel/mailto/WhatsApp links, hours, emergency note, Google Map + directions fallback |
| `book-appointment.html` | Service → date → time slot → details → consent → request, with loading / unavailable / no-slot / error / success states |
| `privacy.html`, `404.html` | Privacy notice template and not-found page |

## Features

- **Tailwind CSS** build (no CDN). Brand palette taken from the logo: royal blue `#0d5bc9` (primary), amber → orange `#fdab12 → #e46b00` (accent), cool light surfaces and deep-navy dark mode
- **Full-screen layout**: 100svh split hero, edge-to-edge sections, full-bleed photo page headers, full-width map and CTA, fluid container up to 1440px
- **Motion & polish** (`src/js/effects.js`): scroll-reveal, count-up stats, cursor spotlight on cards, services marquee, reading-progress bar, floating glass header, back-to-top, button shine and arrow-nudge hovers, smooth anchor scrolling. All of it switches off under `prefers-reduced-motion`
- **Reviews carousel** (`src/js/carousel.js`): dependency-free, built on CSS scroll-snap: swipe, arrow buttons, dots, keyboard arrows and a pausable autoplay (off under `prefers-reduced-motion`)
- **Dark mode**: manual toggle, saved to `localStorage`, follows the OS setting until the visitor chooses
- **Mobile-first**: tested at 320, 375, 768, 1024 and 1280 px with no horizontal scroll; side-drawer menu with overlay, Escape, focus trap and scroll lock; sticky mobile Call/Book bar
- **Accessibility**: one H1 per page, landmarks, skip link, labelled inputs, inline errors with `aria-invalid`, live regions, visible focus rings in both themes, `prefers-reduced-motion` support
- **Single data source**: services, prices, hours, contact details and image paths all come from `src/data/`
- **Live "Open now" status** and opening hours calculated in the clinic timezone (Asia/Kolkata)
- **Booking engine**: blocks past dates, weekly closed days, holidays, lunch breaks, lead time and service duration; disables repeat submission; idempotency key; handles "slot just taken"; never claims "confirmed" in demo mode

## Tech stack

HTML5 · Tailwind CSS 3.4 · Vanilla JavaScript (ES modules) · Google Fonts (Outfit + Inter) · Unsplash demo photos

## Setup

```bash
npm install        # installs the Tailwind CLI
npm run dev        # watch mode: rebuilds dist/output.css as you edit
npm run build      # minified production CSS
npm run serve      # local server on http://localhost:5500
```

ES modules need a web server; opening the HTML file directly with `file://` will not run the scripts. Use `npm run serve` or VS Code Live Server.

## Folder structure

```
├── index.html, services.html, gallery.html, contact.html, book-appointment.html, privacy.html, 404.html
├── assets/
│   ├── icons/logo-mark.svg, favicon.svg   ← replace with the clinic's own logo
│   └── images/               ← put the clinic's own photos here
├── src/
│   ├── data/
│   │   ├── clinic-config.js  ← name, phone, address, hours, holidays, map, images, booking rules
│   │   └── services.js       ← services, prices, durations, images
│   ├── js/
│   │   ├── main.js           ← entry: binds config to the page, renders services & hours
│   │   ├── theme-init.js     ← sets theme before first paint (no flash)
│   │   ├── theme.js, navigation.js, forms.js, gallery.js, booking.js
│   │   ├── carousel.js       ← reviews carousel (scroll-snap + buttons, dots, autoplay)
│   │   ├── effects.js        ← scroll reveal, header state, progress bar, count-up, spotlight
│   │   ├── schedule.js       ← timezone helpers + demo availability
│   │   └── render.js         ← shared HTML renderers (service card, pricing rows, hours)
│   └── styles/input.css      ← Tailwind entry (+ documented @apply components)
├── dist/output.css           ← built CSS (committed so the site works without a build step)
└── tailwind.config.cjs
```

## Customising for a client

1. **Business details**: edit `src/data/clinic-config.js` (name, phone, WhatsApp, email, address, map embed URL, directions link, hours, holidays, social links). The pages pick these up automatically.
2. **Services & prices**: edit `src/data/services.js`. The Services page, home cards, pricing table, contact dropdown and booking picker all use it. Set `price: null` to show "Consultation required".
3. **Images**: replace URLs in `clinic.images` and each service's `image` with local files, e.g. `'assets/images/hero-clinic.webp'`.
4. **Fallback text**: the HTML also contains the demo values so the page reads well without JavaScript. If you change the clinic name or phone, find-and-replace the old value across the `.html` files too.

### Placeholders the clinic owner must replace before launch

- [ ] Clinic name, logo (`assets/icons/logo-mark.svg` + favicon), phone, WhatsApp, email, address, map location
- [ ] Opening hours, weekly closed day (demo: Thursday) and holiday list
- [ ] All prices (sample INR values) and treatment durations
- [ ] All photos (Unsplash demo images) with licensed clinic photography
- [ ] Testimonials and reviewer photos are demo content (stock photos from Unsplash); replace with genuine reviews and photos shared with the patients' permission
- [ ] Claims in highlights and "Why choose us" (equipment, sterilisation, EMI)
- [ ] Privacy notice text (template)
- [ ] Social media links

## Booking API (production)

Booking runs in **demo mode** while `clinic.booking.apiBaseUrl` is empty: availability is simulated and nothing is sent. To go live, set the URL and implement:

| Method | Endpoint | Behaviour |
|---|---|---|
| `GET` | `/api/availability?date=YYYY-MM-DD&serviceId=…` | `{ closed, reason?, slots: [{ time: "10:30", available: true }] }` |
| `POST` | `/api/appointments` (header `Idempotency-Key`) | Re-check the slot on the server, prevent double booking, save it, and return `{ status: "pending" \| "confirmed", reference }`. Return **409** if the slot was taken |

The contact form posts to `clinic.contactFormEndpoint` (e.g. Formspree) when set; otherwise it shows a demo message.

## Deployment

**Netlify:** drag-and-drop the folder, or connect the repo with build command `npm run build` and publish directory `.`
**Vercel:** import the repo, framework "Other", build command `npm run build`, output directory `.`

After deploying, check that every page loads by direct URL, that images and fonts load, and that the map embed works on mobile data.

## Screenshots

_Add desktop and mobile screenshots here (light and dark)._

## Credits

Demo photography from [Unsplash](https://unsplash.com) (free licence). Replace before commercial use.
