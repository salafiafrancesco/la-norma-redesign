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

export { cateringDefaults as catering } from './cateringDefaults.js';

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
};
