export const restaurant = {
  name: 'La Norma',
  tagline: 'Ristorante & Pizzeria',
  description:
    'Authentic Sicilian cooking, polished service, and an intimate Gulf Coast setting for long lunches, celebratory dinners, and memorable evenings.',
  address: '5370 Gulf of Mexico Drive',
  city: 'Longboat Key',
  state: 'FL',
  zip: '34228',
  phone: '+1 (941) 555-0192',
  email: 'info@lanormarestaurant.com',
  hours: 'Daily 5:00 PM - 9:00 PM',
  hoursNote: 'Bar opens at 4:30 PM | Kitchen closes promptly at 9:00 PM',
  mapEmbedUrl: 'https://maps.google.com/?q=5370+Gulf+of+Mexico+Drive+Longboat+Key+FL',
  social: {
    instagram: 'https://instagram.com/lanormarestaurant',
    facebook: 'https://facebook.com/lanormarestaurant',
    tripadvisor: 'https://tripadvisor.com/',
    yelp: 'https://yelp.com/',
  },
};

export const links = {
  reserve: '#reserve',
  menuPdf: '#menu',
  orderDelivery: '#order-delivery',
  orderPickup: '#order-pickup',
  giftCards: '#gift-cards',
};

export const hero = {
  eyebrow: 'Longboat Key, Florida',
  headline: ['Taste Sicily.', 'Linger Longer.'],
  subheadline:
    'A refined Sicilian dining room for house-made pasta, slow-risen pizza, thoughtful wine, and evenings that feel worth lingering over.',
  imageUrl:
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1800&q=85',
  imageAlt: 'Warmly lit Italian dining room with white tablecloths and candlelight',
  gallery: [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1800&q=85',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1800&q=85',
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1800&q=85',
    'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=1800&q=85',
  ],
};

export const story = {
  label: 'Our Story',
  quote: 'Every dish carries the memory of a kitchen in Sicily.',
  body: [
    'La Norma was built around a simple promise: if we serve Italian food, it must feel personal, generous, and deeply rooted in place. Doughs are given time, sauces are layered with patience, and the dining room is run with the same care as the kitchen.',
    'Named after the beloved Sicilian pasta, the restaurant is our way of sharing a slower, more convivial style of hospitality - one where a reservation feels like an invitation and every course arrives with a sense of occasion.',
  ],
  stat1: { value: '15+', label: 'Years of Sicilian craft' },
  stat2: { value: '70+', label: 'Italian wines on the list' },
  stat3: { value: '8', label: 'Guests per cooking class' },
  imageUrl:
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80',
  imageAlt: 'Chef finishing an elegant Italian dish in a professional kitchen',
};

export const specialties = [
  {
    id: 1,
    tag: 'Signature',
    badge: 'House favorite',
    name: 'Pasta alla Norma',
    description:
      'Rigatoni, roasted eggplant, basil, San Marzano tomato, and salted ricotta - the dish that gave us our name.',
    price: '$26',
    imageUrl:
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'A plated serving of Pasta alla Norma',
    featured: true,
  },
  {
    id: 2,
    tag: 'Wood-fired',
    name: 'Margherita di Bufala',
    description:
      '72-hour dough with San Marzano tomato, buffalo mozzarella, basil, and olive oil from first to last bite.',
    price: '$22',
    imageUrl:
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Wood-fired Margherita pizza with buffalo mozzarella',
    featured: false,
  },
  {
    id: 3,
    tag: 'From the coast',
    name: 'Branzino al Forno',
    description:
      'Whole roasted sea bass with citrus, capers, olives, and white wine - bright, elegant, and unmistakably Mediterranean.',
    price: '$38',
    imageUrl:
      'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Whole roasted branzino with herbs and citrus',
    featured: false,
  },
  {
    id: 4,
    tag: 'Dolce',
    name: 'Cannolo Siciliano',
    description:
      'Crisp shells filled to order with sweet ricotta, candied orange, dark chocolate, and pistachio.',
    price: '$12',
    imageUrl:
      'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=900&q=80',
    imageAlt: 'Classic Sicilian cannoli on a ceramic plate',
    featured: false,
  },
];

export const experiences = [
  {
    id: 1,
    icon: 'Wine',
    label: 'Every Friday',
    title: 'Wine Tastings',
    description:
      'Guided Italian wine flights paired with seasonal antipasti and relaxed sommelier storytelling.',
    cta: 'Explore tastings',
    ctaHref: '/wine-tastings',
  },
  {
    id: 2,
    icon: 'Kitchen',
    label: 'Saturday mornings',
    title: 'Cooking Classes',
    description:
      'Hands-on sessions with Chef Marco, capped at eight guests and designed to feel like a private kitchen gathering.',
    cta: 'Reserve a class',
    ctaHref: '/cooking-classes',
  },
  {
    id: 3,
    icon: 'Music',
    label: 'Wednesday & Saturday',
    title: 'Live Music',
    description:
      'Acoustic sets, jazz, and elegant evening performances that elevate the room without overwhelming it.',
    cta: 'See the calendar',
    ctaHref: '/live-music',
  },
  {
    id: 4,
    icon: 'Celebration',
    label: 'By arrangement',
    title: 'Private Events',
    description:
      'Private dining, rehearsal dinners, milestone celebrations, and hospitality tailored around your guest list.',
    cta: 'Plan an event',
    ctaHref: '/private-events',
  },
];

export const menuHighlights = {
  label: 'A Taste of the Menu',
  headline: 'Seasonal ingredients.\nA distinctly Sicilian point of view.',
  note: 'Menus evolve with the season. Signature dishes and favorite classics remain available throughout the year.',
  categories: [
    {
      name: 'Antipasti',
      items: [
        { name: 'Bruschetta al Pomodoro', desc: 'Heirloom tomato, garlic, basil oil, grilled bread', price: '$14' },
        { name: 'Arancini di Riso', desc: 'Saffron rice, slow ragu, peas, caciocavallo', price: '$16' },
        { name: 'Carpaccio di Manzo', desc: 'Beef tenderloin, rocket, Parmigiano, capers', price: '$22' },
        { name: 'Burrata della Casa', desc: 'Roasted peppers, nduja oil, toasted focaccia', price: '$19' },
      ],
    },
    {
      name: 'Primi & Pizze',
      items: [
        { name: 'Pasta alla Norma', desc: 'Rigatoni, eggplant, San Marzano, basil, salted ricotta', price: '$26' },
        { name: 'Tagliolini al Granchio', desc: 'Fresh pasta, blue crab, cherry tomato, white wine', price: '$32' },
        { name: 'Diavola', desc: 'Fior di latte, Calabrian salami, chili honey', price: '$24' },
        { name: 'Quattro Formaggi', desc: 'Fontina, taleggio, gorgonzola, rosemary honey', price: '$23' },
      ],
    },
    {
      name: 'Secondi & Dolci',
      items: [
        { name: 'Branzino al Forno', desc: 'Whole sea bass, olives, capers, citrus, white wine', price: '$38' },
        { name: 'Costata di Manzo', desc: 'Dry-aged ribeye, salsa verde, roasted garlic', price: '$52' },
        { name: 'Cannolo Siciliano', desc: 'Ricotta, candied orange, chocolate, pistachio', price: '$12' },
        { name: 'Tiramisu della Casa', desc: 'Espresso-soaked savoiardi, mascarpone, cocoa', price: '$11' },
      ],
    },
  ],
};

export const testimonialSection = {
  label: 'Guest Perspectives',
  headline: 'The details guests mention after the last course',
  items: [
    {
      id: 1,
      text: 'The room feels refined without ever becoming stiff. Excellent wine guidance, beautiful pacing, and a Pasta alla Norma I am still thinking about.',
      author: 'Margaret S.',
      location: 'Sarasota, FL',
      source: 'Google Reviews',
      rating: 5,
    },
    {
      id: 2,
      text: 'We hosted an anniversary dinner here and every detail felt considered. Service was polished, warm, and genuinely memorable.',
      author: 'James & Patricia K.',
      location: 'Longboat Key, FL',
      source: 'TripAdvisor',
      rating: 5,
    },
    {
      id: 3,
      text: 'The Friday wine tasting was one of the highlights of our trip. Intimate, unhurried, and clearly curated by people who care about hospitality.',
      author: 'Thomas R.',
      location: 'Chicago, IL',
      source: 'Yelp',
      rating: 5,
    },
  ],
};

export const testimonials = testimonialSection.items;

export const reservationBanner = {
  headline: 'Reserve the table before the evening chooses for you',
  sub: 'Weekend evenings book early. Secure your preferred time and let us take care of the rest.',
  ctaText: 'Reserve a Table',
  note: 'Walk-ins are welcome whenever availability allows.',
};

export const orderOnline = {
  eyebrow: 'Prefer to stay in tonight?',
  headline: 'Bring a little of La Norma home',
  sub: 'Our most-loved dishes are available for pickup or delivery with the same attention to detail and restraint as the dining room.',
};

import { cateringDefaults } from './cateringDefaults.js';
export const catering = cateringDefaults;

export const footer = {
  tagline: 'Sicilian soul, Gulf Coast ease, and a dining room built for lingering.',
  navItems: [
    { label: 'Reserve a table', href: '#reserve' },
    { label: 'Menu', href: '/menu' },
    { label: 'About La Norma', href: '/about' },
    { label: 'Cooking classes', href: '/cooking-classes' },
    { label: 'Wine tastings', href: '/wine-tastings' },
    { label: 'Live music', href: '/live-music' },
    { label: 'Private events', href: '/private-events' },
    { label: 'Catering', href: '/catering' },
    { label: 'Journal', href: '/journal' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy policy', href: '/privacy-policy' },
  ],
};

export const footerNav = footer.navItems;

export const cookingClassesPage = {
  description:
    'Reserve an intimate Sicilian cooking class at La Norma with Chef Marco — handmade pasta, wine, and a shared meal on Longboat Key.',
  hero: {
    image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1800&q=80',
    image_alt: 'Chef preparing fresh pasta in La Norma kitchen',
    eyebrow: 'Saturday mornings at La Norma',
    headline: 'Cooking Classes',
    sub: 'Cook like a Sicilian. Three and a half hours of hands-on pasta, wine, and a shared meal you made yourself.',
    primary_cta_label: 'Reserve My Spot',
    secondary_cta_label: "What's included",
    stats: [
      { value: '3.5 hrs', label: 'Duration' },
      { value: '$95', label: 'Per guest' },
      { value: '8 max', label: 'Guests per class' },
    ],
  },
  booking_copy: {
    label: 'Reserve your Saturday',
    heading: 'Book a cooking class',
    confirmation_title: "You're in!",
    confirmation_message: "We'll send a confirmation email within 24 hours with arrival details and what to expect.",
    submit_label: 'Reserve My Spot',
  },
  includes_section: {
    label: "What's included",
    heading: 'Everything you need for the morning',
    items: [
      { title: 'All ingredients', desc: 'Seasonal produce, pantry staples, and premium imports — everything is supplied.' },
      { title: 'Wine pairing', desc: 'A welcome pour and thoughtful pairings throughout the class and meal.' },
      { title: 'Recipe cards', desc: 'Take-home instructions so the class lives on in your kitchen.' },
      { title: 'Chef guidance', desc: 'Hands-on instruction from Chef Marco and the La Norma kitchen team.' },
    ],
  },
  testimonials: [
    { quote: 'The best morning we spent in Florida. Chef Marco made us feel like family, and the pasta was extraordinary.', author: 'Margaret S.', context: 'Sarasota, FL' },
    { quote: 'Worth every penny. We left with real skills and a deep appreciation for Sicilian cooking.', author: 'David & Claire K.', context: 'Chicago, IL' },
  ],
  faq_section: {
    label: 'Questions',
    heading: 'A few details before you reserve',
    items: [
      { q: 'Do I need any cooking experience?', a: 'No. Classes are designed to feel welcoming and hands-on whether you cook every day or almost never.' },
      { q: 'How long does each class last?', a: 'Expect around three and a half hours from welcome aperitivo to the shared meal at the end.' },
      { q: 'What is included in the price?', a: 'Ingredients, wine, printed recipes, the sit-down meal, and direct guidance from the kitchen team are all included.' },
      { q: 'How many guests attend each class?', a: 'We cap each session at eight guests so the experience stays personal and hands-on.' },
      { q: 'Can I reserve a private class?', a: 'Yes. Private buyouts are available for celebrations, team gatherings, and special occasions.' },
      { q: 'What is the cancellation policy?', a: 'Full refund up to 48 hours before. 50% up to 24 hours. No refund after that, but we can often reschedule.' },
    ],
  },
  cta: {
    heading: 'A morning worth clearing the calendar for.',
    body: "Saturdays at La Norma are capped at eight. Reserve the one you want while there's still room.",
    primary_label: 'Reserve My Spot',
    secondary_label: 'Back to La Norma',
  },
};

export const wineTastingsPage = {
  description:
    'Join a sommelier-led Friday wine tasting at La Norma — curated Italian pours, seasonal antipasti, and an intimate Longboat Key evening.',
  hero: {
    image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1800&q=80',
    image_alt: 'Sommelier pouring wine during a tasting at La Norma',
    eyebrow: 'Friday evenings at La Norma',
    headline: 'Wine Tastings',
    sub: 'An intimate tasting that still feels like dinner, not a classroom. Guided pours, warm lighting, and an evening worth planning around.',
    primary_cta_label: 'Book Your Friday',
    secondary_cta_label: 'What to expect',
    stats: [
      { value: '4–6', label: 'Curated pours' },
      { value: '14 max', label: 'Seats per tasting' },
      { value: 'Friday', label: 'Weekly cadence' },
    ],
  },
  booking_copy: {
    label: 'Reserve your Friday',
    heading: 'Book your Friday tasting',
    confirmation_title: 'Request received!',
    confirmation_message: "We'll confirm your tasting reservation within 24 hours with timing and arrival details.",
    submit_label: 'Request Reservation',
  },
  expect_section: {
    label: 'Included in your reservation',
    heading: 'What guests can expect each Friday',
    items: [
      '4–6 curated Italian pours with guided commentary',
      'Seasonal antipasti pairings crafted by the kitchen',
      'Background on regions, producers, and grape stories',
      'A relaxed, unhurried pace designed for conversation',
      'Take-home tasting notes and recommendations',
    ],
    suited_for: ['Date nights', 'Couples', 'Small groups', 'Celebrations', 'Wine curious'],
  },
  testimonials: [
    { quote: "The best Friday evening we've had since moving here. Intimate, personal, and genuinely educational.", author: 'Elena & Marcus', context: 'Longboat Key, FL' },
    { quote: 'Not pretentious at all. Just great wine, great food, and a sommelier who made everyone feel comfortable.', author: 'Tanya R.', context: 'Sarasota, FL' },
  ],
  faq_section: {
    label: 'Questions',
    heading: 'A few details guests often ask',
    items: [
      { q: 'Do I need wine knowledge?', a: 'Not at all. The tasting is conversational and accessible — designed for enjoyment, not expertise.' },
      { q: 'What is included?', a: '4–6 pours, seasonal antipasti pairings, guided commentary, and tasting notes to take home.' },
      { q: 'Can the tasting be booked privately?', a: 'Yes. Private tastings can be arranged for groups of 6 or more — reach out by email.' },
      { q: 'How quickly do requests get confirmed?', a: "Within 24 hours. We'll follow up with timing details and any final notes." },
    ],
  },
  cta: {
    heading: 'An evening built for good company and better pours.',
    body: 'Fridays at La Norma are intentionally limited. Request the evening you want before it fills.',
    primary_label: 'Book Your Friday',
    secondary_label: 'Back to La Norma',
  },
};

export const liveMusicPage = {
  description:
    'Live jazz, acoustic sets, and evening performances woven into dinner at La Norma — no cover, just a better atmosphere on Longboat Key.',
  hero: {
    image_url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1800&q=80',
    image_alt: 'Musician performing live at La Norma',
    eyebrow: 'Wednesday & Saturday evenings',
    headline: 'Live Music',
    sub: 'Music woven into dinner, not layered on top of it. Jazz, acoustic, and elegant performances that elevate the room.',
    primary_cta_label: 'Reserve a Music Night',
    secondary_cta_label: 'View Menu',
    stats: [
      { value: 'Free', label: 'No cover charge' },
      { value: 'Wed + Sat', label: 'Most weeks' },
      { value: '50 seats', label: 'Intimate dining room' },
    ],
  },
  booking_copy: {
    label: 'Reserve your evening',
    heading: 'Reserve a music night',
    confirmation_title: 'Request received!',
    confirmation_message: "We'll confirm your table within 24 hours. Music is complimentary with dinner — no separate charge.",
    submit_label: 'Send Request',
  },
  faq_section: {
    label: 'Questions',
    heading: 'A few things guests ask about',
    items: [
      { q: 'Is there a cover charge?', a: 'No. Music is complimentary with dinner — no tickets or separate charge.' },
      { q: 'Can I request a specific part of the room?', a: "Yes. Mention seating preferences in the notes and we'll do our best to accommodate." },
      { q: 'What kind of music do you host?', a: 'Jazz, acoustic, bossa nova, and Mediterranean-influenced sets — chosen to complement the dining room, not compete with it.' },
      { q: 'Can musicians be booked for private events?', a: 'Yes. Reach out to discuss live music for private dinners, celebrations, or corporate evenings.' },
    ],
  },
  cta: {
    heading: 'Dinner first. Atmosphere always.',
    body: 'Ask about the next performance night and let us shape the evening around your table.',
    primary_label: 'Reserve Your Table',
    secondary_label: 'Back to La Norma',
  },
};

export const aboutPage = {
  hero: {
    eyebrow: 'About La Norma',
    headline: 'A Sicilian dining room on Longboat Key, run with patience and polish.',
  },
  values: [
    { title: 'Sicilian point of view', body: 'The menu holds a clear regional identity, from pasta alla Norma to a wine list that stays close to Italy.' },
    { title: 'Hospitality first', body: 'The room is designed to feel calm, warm, and attentive rather than over-staged or formal for its own sake.' },
    { title: 'Experiences with intent', body: 'Cooking classes, wine tastings, and private events are extensions of the dining room, not side projects.' },
  ],
  next_steps: {
    heading: 'Best next steps',
    body: 'Whether you are planning dinner, a class, or a celebration, the team is happy to help shape the evening with you.',
    primary_label: 'Reserve a table',
    secondary_label: 'Get in touch',
  },
};

export const faqPage = {
  hero: {
    eyebrow: 'Guest questions',
    headline: 'Questions guests often ask before reserving',
    sub: 'Quick answers about reservations, dietary needs, private events, and how the experiences work.',
  },
  items: [
    { question: 'Do I need a reservation for dinner?', answer: 'Walk-ins are welcome whenever availability allows. Reservations are strongly recommended for weekends, music nights, and seasonal peaks.' },
    { question: 'Do you accommodate dietary restrictions?', answer: 'Vegetarian, gluten-aware, and allergy-sensitive requests can usually be accommodated with advance notice.' },
    { question: 'Can I plan a private event or celebratory dinner?', answer: 'Yes. La Norma hosts rehearsal dinners, milestone celebrations, and hosted evenings with tailored menus.' },
    { question: 'How do cooking class and tasting confirmations work?', answer: 'Each request is reviewed directly by the team. We confirm within 24 hours.' },
    { question: 'Is live music ticketed?', answer: 'No. Live music is part of the dinner experience. Reservations are recommended.' },
  ],
  editorial: {
    heading: 'Still need help?',
    body: 'For anything not covered here, reach out directly. The team is happy to walk through options and tailor the evening with you.',
  },
};

export const menuPage = {
  description:
    'Explore the La Norma menu with Sicilian antipasti, house-made pasta, wood-fired pizza, seafood, and desserts on Longboat Key.',
  hero: {
    image_url: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1800&q=85',
    image_alt: 'House-made Sicilian pasta, plated',
    eyebrow: 'La Norma Ristorante · Longboat Key',
    headline: 'The Menu',
    h2: 'House-made pasta, wood-fired pizza, Sicilian classics.',
    sub: 'Built around a warm, polished dinner service — antipasti through dessert, with seasonal Sicilian inflections and an Italian wine list.',
    primary_cta_label: 'Reserve dinner',
    secondary_cta_label: 'Plan a private dinner',
    stats: [
      { value: 'Daily fresh', label: 'Hand-rolled pasta' },
      { value: '550°C', label: 'Wood-fired oven' },
      { value: '70+ wines', label: 'Italian wine list' },
    ],
  },
  support: {
    heading: 'Know the menu, then choose the right next step.',
    body: 'If dinner is the plan, reserve now. If the evening needs more structure, the tastings, classes, and private-event formats give guests a clearer path.',
    primary_label: 'Reserve a table',
    secondary_label: 'Wine tastings',
  },
};

export const contactPage = {
  hero: {
    eyebrow: 'Contact',
    headline: 'Know where to start, and the right next step becomes obvious.',
    sub: 'Reserve dinner instantly on OpenTable, call the team directly, or choose the experience page that best matches what you are planning.',
    primary_cta_label: 'Reserve on OpenTable',
    secondary_cta_label: 'Call the restaurant',
  },
  details_title: 'Contact details',
  info_cards: {
    visit_title: 'Visit',
    reach_title: 'Reach us',
    intent_title: 'Best path by intent',
    intent_lines: [
      'Dinner reservation: OpenTable',
      'Cooking class RSVP: class page',
      'Private events: inquiry page',
    ],
  },
  form: {
    title: 'Send a message',
    lead: "For anything that doesn't fit a reservation, class, or event inquiry. We reply within one business day.",
    success_title: 'Thank you',
    success_message: 'Your message is in. A member of the team will reply by email within one business day.',
    submit_label: 'Send message',
    note: 'For dinner, OpenTable is faster. For events, the inquiry pages capture the right details.',
  },
  support: {
    heading: 'Choose the page that fits what you need.',
    items: [
      { title: 'Dinner reservations', body: 'Fastest for everyday dining and planned evenings.' },
      { title: 'Cooking classes and wine tastings', body: 'Best when you want a premium experience with clearer booking context.' },
      { title: 'Private events', body: 'Use the inquiry flow when guest count, menu, and event format all matter.' },
    ],
    primary_label: 'Cooking classes',
    secondary_label: 'Private events',
  },
};

export const general = {
  hoursWeekly: [
    { day: 'Monday', hours: '5:00 PM – 9:00 PM', closed: false },
    { day: 'Tuesday', hours: '5:00 PM – 9:00 PM', closed: false },
    { day: 'Wednesday', hours: '5:00 PM – 9:00 PM', closed: false },
    { day: 'Thursday', hours: '5:00 PM – 9:00 PM', closed: false },
    { day: 'Friday', hours: '5:00 PM – 9:00 PM', closed: false },
    { day: 'Saturday', hours: '5:00 PM – 9:00 PM', closed: false },
    { day: 'Sunday', hours: '5:00 PM – 9:00 PM', closed: false },
  ],
  schemaOrg: {
    cuisine: ['Italian', 'Sicilian', 'Mediterranean'],
    priceRange: '$$$',
    opens: '17:00',
    closes: '21:00',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    acceptsReservations: true,
  },
};

export const privateEventsPage = {
  meta: {
    title: 'Private Events',
    description:
      'Private dining, rehearsal dinners, and milestone events at La Norma — curated menus, wine guidance, and warm Sicilian hospitality on Longboat Key.',
  },
  hero: {
    eyebrow: 'Private events',
    headline: 'A room shaped for the moments that matter.',
    sub: 'Rehearsal dinners, milestone celebrations, and hosted evenings — tailored from menu to pacing, run with the same warmth as the dining room.',
    image_url: 'https://images.unsplash.com/photo-1470042660615-51b9c62e8d28?auto=format&fit=crop&w=1600&q=80',
    image_alt: 'An elegantly set private dining table with candlelight',
    primary_cta_label: 'Start your inquiry',
    secondary_cta_label: 'View formats',
  },
  manifesto: {
    quote: 'A private dinner should feel personal — not staged, not generic, not just a room with a menu.',
    author: 'The La Norma kitchen',
  },
  formats: {
    eyebrow: 'Three formats',
    heading: 'Choose the scale that fits the occasion.',
    items: [
      {
        id: 'intimate',
        roman: 'I',
        name: 'Intimate Dinner',
        capacity: 'Up to 12 guests',
        body: 'A private dining experience for anniversaries, family milestones, and smaller business dinners.',
        includes: ['Dedicated service team', 'Custom 3-course format', 'Welcome prosecco', 'Flexible table setup'],
        featured: false,
      },
      {
        id: 'celebration',
        roman: 'II',
        name: 'Celebration Room',
        capacity: 'Up to 20 guests',
        body: 'Our most requested format for rehearsal dinners, birthdays, and hosted evenings with wine pairings.',
        includes: ['Exclusive use of the private room', 'Custom 4-course menu', 'Wine pairing options', 'Decor coordination', 'Optional live music'],
        featured: true,
      },
      {
        id: 'buyout',
        roman: 'III',
        name: 'Full Buyout',
        capacity: 'Up to 30 guests',
        body: 'For milestone gatherings that call for the full dining room, dedicated hospitality, and a completely custom flow.',
        includes: ['Full restaurant buyout', 'Tailored menu development', 'Sommelier-led wine service', 'Dedicated planning support'],
        featured: false,
      },
    ],
  },
  curate: {
    eyebrow: 'What we curate',
    heading: 'The details handled before guests arrive.',
    items: [
      { num: '01', title: 'Chef-led menu planning', body: 'Menus are shaped around the guest list, dietary needs, and the tone of the occasion.' },
      { num: '02', title: 'Thoughtful wine guidance', body: 'Pairings, aperitivo selections, and bottle pacing handled with the meal in mind.' },
      { num: '03', title: 'Polished event pacing', body: 'Arrivals, speeches, courses, and transitions mapped so the evening never feels rushed.' },
      { num: '04', title: 'Warm, personal service', body: 'Guests should feel looked after, not processed. That standard shapes every event we host.' },
    ],
  },
  form: {
    eyebrow: 'Start the conversation',
    heading: 'Share the shape of your event.',
    sub: 'Tell us your preferred date, guest range, and the kind of evening you are planning. We will come back within 24 hours.',
    submit_label: 'Send inquiry',
    success_title: 'Your event inquiry has been received.',
    success_body: 'We will be in touch within 24 hours with availability guidance, menu direction, and any follow-up questions.',
    progress_labels: ['Event basics', 'Your details', 'Review and send'],
    guest_options: ['6-10', '11-16', '17-20', '21-30'],
    occasion_options: [
      'Anniversary dinner',
      'Birthday celebration',
      'Rehearsal dinner',
      'Corporate dinner',
      'Family gathering',
      'Other',
    ],
  },
  testimonials: {
    eyebrow: 'Host feedback',
    heading: 'Calm before the event. Looked after through it.',
    items: [
      { quote: 'They made our rehearsal dinner feel beautifully organized without ever making it feel formal or stressful.', author: 'Lindsay M.', role: 'Rehearsal dinner host' },
      { quote: 'From menu planning to wine pacing, every recommendation felt practical and tasteful. We could actually enjoy our own event.', author: 'Daniel K.', role: 'Birthday celebration host' },
      { quote: 'It felt like a boutique hospitality experience rather than a generic private room rental. That difference really showed up on the night.', author: 'Amelia & Jon', role: 'Anniversary dinner hosts' },
    ],
  },
  faq: {
    eyebrow: 'Practical details',
    heading: 'Common questions before the inquiry.',
    items: [
      { q: 'How far ahead should we inquire?', a: 'For smaller groups, three to four weeks is ideal. For full buyouts or peak-season dates, earlier is strongly recommended.' },
      { q: 'Can menus be adjusted for dietary restrictions?', a: 'Yes. Vegetarian, gluten-free, allergy-conscious, and mixed-diet guest lists can all be accommodated with advance planning.' },
      { q: 'Is a deposit required?', a: 'Some event formats require a deposit to secure the date. We explain this clearly once availability and scope are confirmed.' },
      { q: 'Can live music be added?', a: 'Yes. Selected formats can include live music or a musician from our preferred roster, depending on the tone of your event.' },
    ],
  },
  invitation: {
    eyebrow: 'An invitation',
    heading: 'A special occasion deserves more than a room and a menu.',
    body: 'Let us shape a private evening that feels polished, warm, and distinctly La Norma.',
    primary_label: 'Send your inquiry',
    secondary_label: 'Speak with the team',
  },
};

export const siteDefaults = {
  restaurant,
  links,
  hero,
  story,
  specialties,
  experiences,
  menuHighlights,
  testimonialSection,
  testimonials,
  reservationBanner,
  orderOnline,
  catering,
  footer,
  footerNav,
  general,
  cookingClassesPage,
  wineTastingsPage,
  liveMusicPage,
  aboutPage,
  faqPage,
  menuPage,
  contactPage,
  privateEventsPage,
};
