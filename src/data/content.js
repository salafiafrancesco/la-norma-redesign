/* ============================================================
   La Norma — Centralized Content & Mock Data
   Edit this file to update all text, links, images, and prices.
   ============================================================ */

/* ---- RESTAURANT INFO ---- */
export const restaurant = {
  name: 'La Norma',
  tagline: 'Ristorante & Pizzeria',
  description:
    'Authentic Sicilian cuisine, slow-risen pizza, and warm Italian hospitality at the edge of the Gulf of Mexico.',
  address: '5370 Gulf of Mexico Drive',
  city: 'Longboat Key',
  state: 'FL',
  zip: '34228',
  phone: '+1 (941) 555-0192',
  email: 'info@lanormarestaurant.com',
  hours: 'Daily 5:00 PM – 9:00 PM',
  hoursNote: 'Bar opens at 4:30 PM · Kitchen closes at 9:00 PM sharp',
  mapEmbedUrl: 'https://maps.google.com/?q=5370+Gulf+of+Mexico+Drive+Longboat+Key+FL',
  social: {
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
    tripadvisor: 'https://tripadvisor.com',
    yelp: 'https://yelp.com',
  },
};

/* ---- EXTERNAL LINKS — replace with real URLs ---- */
export const links = {
  reserve: '#reserve',             // → OpenTable or Resy widget URL
  menuPdf: '#menu',                // → PDF or dedicated menu page
  orderDelivery: '#order-delivery',// → DoorDash / Uber Eats
  orderPickup: '#order-pickup',    // → direct ordering system
  giftCards: '#gift-cards',
};

/* ---- HERO ---- */
export const hero = {
  eyebrow: 'Longboat Key, Florida',
  headline: ['Taste Sicily.', 'Live the Moment.'],
  subheadline:
    'Handmade pasta, slow-risen pizza, and sun-drenched Sicilian flavors — served with the warmth of a family table, steps from the Gulf.',
  imageUrl:
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1800&q=85',
  imageAlt: 'Elegant Italian restaurant dining room with warm candlelight',
};

/* ---- STORY ---- */
export const story = {
  label: 'Our Story',
  quote: 'Every dish carries the memory of a kitchen in Palermo.',
  body: [
    'La Norma was born from a simple obsession: bringing the soul of Sicilian cooking to the Gulf Coast without compromise. We cure our own meats, roll our pasta by hand each morning, and let our doughs rise slowly — because great food cannot be rushed.',
    'Named after the beloved pasta dish that has graced Sicilian tables for centuries, La Norma is a love letter to the flavors, textures, and rhythms of Southern Italy. Come as a guest. Leave as family.',
  ],
  stat1: { value: '15+', label: 'Years of Sicilian Craft' },
  stat2: { value: '100%', label: 'Fresh, House-Made Pasta' },
  stat3: { value: '70+', label: 'Curated Italian Wines' },
  imageUrl:
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
  imageAlt: 'Overhead shot of beautiful Italian food spread',
};

/* ---- SPECIALTIES ---- */
export const specialties = [
  {
    id: 1,
    tag: 'Signature',
    name: 'Pasta alla Norma',
    description:
      'Our namesake dish. Rigatoni tossed with slow-roasted eggplant, San Marzano tomato, fresh basil, and salted ricotta from our local dairy partner.',
    price: '$26',
    imageUrl:
      'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Pasta alla Norma dish',
    featured: true,
  },
  {
    id: 2,
    tag: 'Wood-Fired',
    name: 'Margherita di Bufala',
    description:
      'Slow-risen 72-hour dough, hand-crushed tomato, imported buffalo mozzarella, extra-virgin olive oil, and torn basil.',
    price: '$22',
    imageUrl:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Wood-fired Margherita pizza',
    featured: false,
  },
  {
    id: 3,
    tag: 'From the Sea',
    name: 'Branzino al Forno',
    description:
      'Whole roasted Mediterranean sea bass with capers, Cerignola olives, cherry tomatoes, white wine, and a drizzle of Sicilian lemon oil.',
    price: '$38',
    imageUrl:
      'https://images.unsplash.com/photo-1519984388953-d2406bc725e1?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Roasted whole branzino fish',
    featured: false,
  },
  {
    id: 4,
    tag: 'Dolce',
    name: 'Cannolo Siciliano',
    description:
      "Crispy fried shells filled to order with sweet sheep\u2019s ricotta, candied orange peel, dark chocolate chips, and crushed pistachios.",
    price: '$12',
    imageUrl:
      'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Classic Sicilian cannoli dessert',
    featured: false,
  },
];

/* ---- EXPERIENCES ---- */
export const experiences = [
  {
    id: 1,
    icon: '🍷',
    label: 'Every Friday',
    title: 'Wine Tastings',
    description:
      'Join our sommelier for an intimate guided tour through the vineyards of Sicily, Campania, and Tuscany — paired with seasonal antipasti.',
    cta: 'Reserve Your Seat',
    ctaHref: links.reserve,
  },
  {
    id: 2,
    icon: '👨‍🍳',
    label: 'Saturday Mornings',
    title: 'Cooking Classes',
    description:
      'Step into our kitchen and learn the art of fresh pasta, authentic ragu, and the secrets behind our 72-hour pizza dough from Chef Marco.',
    cta: 'Book a Class',
    ctaHref: links.reserve,
  },
  {
    id: 3,
    icon: '🎶',
    label: 'Wed & Sat Evenings',
    title: 'Live Music',
    description:
      'Sip your Primitivo as the notes of an Italian acoustic duo fill the room. The perfect backdrop for a long, unhurried dinner.',
    cta: 'See Schedule',
    ctaHref: '#events',
  },
  {
    id: 4,
    icon: '🥂',
    label: 'By Arrangement',
    title: 'Private Events',
    description:
      "Celebrate life\u2019s most meaningful moments in our intimate private dining room \u2014 tailored menus, curated wine pairings, and full concierge service.",
    cta: 'Inquire Now',
    ctaHref: `mailto:${restaurant.email}`,
  },
];

/* ---- MENU HIGHLIGHTS ---- */
export const menuHighlights = {
  label: 'A Taste of the Menu',
  headline: 'Honest Ingredients.\nUnforgettable Flavors.',
  note: 'Full menu available in-house and online. Menu changes seasonally.',
  categories: [
    {
      name: 'Antipasti',
      items: [
        { name: 'Bruschetta al Pomodoro', desc: 'Grilled sourdough, heirloom tomato, garlic, basil oil', price: '$14' },
        { name: 'Arancini di Riso', desc: 'Crispy saffron risotto balls, ragù, peas, caciocavallo', price: '$16' },
        { name: 'Carpaccio di Manzo', desc: 'Thinly sliced beef, rocket, shaved Grana Padano, truffle oil', price: '$22' },
        { name: 'Burrata della Casa', desc: "Fresh burrata, roasted peppers, \u2019nduja, grilled bread", price: '$19' },
      ],
    },
    {
      name: 'Primi & Pizze',
      items: [
        { name: 'Pasta alla Norma', desc: 'Rigatoni, eggplant, San Marzano tomato, salted ricotta', price: '$26' },
        { name: 'Tagliolini al Granchio', desc: 'House tagliolini, blue crab, bottarga, cherry tomato', price: '$32' },
        { name: 'Diavola', desc: "Spicy Calabrian \u2019nduja, fior di latte, basil, chili honey", price: '$24' },
        { name: 'Quattro Formaggi', desc: 'Fontina, taleggio, gorgonzola, mozzarella, rosemary honey', price: '$23' },
      ],
    },
    {
      name: 'Secondi & Dolci',
      items: [
        { name: 'Branzino al Forno', desc: 'Whole sea bass, olives, capers, white wine, lemon oil', price: '$38' },
        { name: 'Costata di Manzo', desc: '28-day dry-aged ribeye, salsa verde, roasted bone marrow', price: '$52' },
        { name: 'Cannolo Siciliano', desc: "Fried shells, sheep\u2019s ricotta, candied orange, pistachio", price: '$12' },
        { name: 'Tiramisù della Nonna', desc: 'Espresso-soaked ladyfingers, mascarpone cream, cocoa', price: '$11' },
      ],
    },
  ],
};

/* ---- TESTIMONIALS ---- */
export const testimonials = [
  {
    id: 1,
    text: "Hands down the best Italian food I\u2019ve had outside of Italy. The pasta alla Norma was transcendent \u2014 I still think about it weeks later. The wine list is exceptional and the service is warm without being intrusive.",
    author: 'Margaret S.',
    location: 'Sarasota, FL',
    source: 'Google Reviews',
    rating: 5,
  },
  {
    id: 2,
    text: "We celebrated our anniversary here and it was absolutely perfect. The private dining room is gorgeous, the branzino was flawless, and the cannoli were the best we\u2019ve ever had. La Norma is our forever restaurant.",
    author: 'James & Patricia K.',
    location: 'Longboat Key, FL',
    source: 'TripAdvisor',
    rating: 5,
  },
  {
    id: 3,
    text: 'We took the Friday wine tasting and it was one of the highlights of our vacation. The sommelier is incredibly knowledgeable and the food pairings were phenomenal. Already planning to come back.',
    author: 'Thomas R.',
    location: 'Chicago, IL',
    source: 'Yelp',
    rating: 5,
  },
];

/* ---- FOOTER NAV ---- */
export const footerNav = [
  { label: 'Menu', href: links.menuPdf },
  { label: 'Reserve a Table', href: links.reserve },
  { label: 'Order Delivery', href: links.orderDelivery },
  { label: 'Order Pickup', href: links.orderPickup },
  { label: 'Wine & Experiences', href: '#experiences' },
  { label: 'Private Events', href: `mailto:${restaurant.email}` },
  { label: 'Gift Cards', href: links.giftCards },
  { label: 'Contact Us', href: `mailto:${restaurant.email}` },
];
