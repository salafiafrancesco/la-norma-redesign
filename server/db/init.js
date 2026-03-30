/**
 * init.js — Auto-initializes the database on every fresh startup.
 * Called from server/index.js before routes are registered.
 * Safe to call multiple times (idempotent — only seeds if collections are empty).
 */
import bcrypt from 'bcryptjs';
import db, { save, getNextId } from './database.js';

// ── Helpers ───────────────────────────────────────────────────
function setContent(section, key, value, type = 'text') {
  if (!db.data.site_content[section]) db.data.site_content[section] = {};
  db.data.site_content[section][key] = { value, type };
}

function nextSaturday(from) {
  const d = new Date(from);
  const diff = d.getDay() === 6 ? 7 : 6 - d.getDay();
  d.setDate(d.getDate() + diff);
  return d;
}

function nextWeekday(from, targetDay) {
  const d = new Date(from);
  const diff = (targetDay - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d;
}

// ── Admin user ────────────────────────────────────────────────
function ensureAdminUser() {
  if (!Array.isArray(db.data.admin_users)) db.data.admin_users = [];
  if (db.data.admin_users.length > 0) return;

  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'lanorma2025';
  db.data.admin_users.push({
    id:            1,
    username,
    password_hash: bcrypt.hashSync(password, 10),
  });
  console.log(`[init] Admin user "${username}" created.`);
  if (!process.env.ADMIN_PASSWORD) {
    console.warn('[init] ADMIN_PASSWORD not set — using default "lanorma2025". Set it on Render!');
  }
}

// ── Site content ──────────────────────────────────────────────
function ensureSiteContent() {
  if (!db.data.site_content) db.data.site_content = {};
  if (Object.keys(db.data.site_content).length > 0) return;

  // Restaurant
  setContent('restaurant', 'name',               'La Norma');
  setContent('restaurant', 'tagline',            'Ristorante & Pizzeria');
  setContent('restaurant', 'description',        'Authentic Sicilian cuisine, slow-risen pizza, and warm Italian hospitality at the edge of the Gulf of Mexico.');
  setContent('restaurant', 'address',            '5370 Gulf of Mexico Drive');
  setContent('restaurant', 'city',               'Longboat Key');
  setContent('restaurant', 'state',              'FL');
  setContent('restaurant', 'zip',                '34228');
  setContent('restaurant', 'phone',              '+1 (941) 555-0192');
  setContent('restaurant', 'email',              'info@lanormarestaurant.com');
  setContent('restaurant', 'hours',              'Daily 5:00 PM \u2013 9:00 PM');
  setContent('restaurant', 'hours_note',         'Bar opens at 4:30 PM \u00b7 Kitchen closes at 9:00 PM sharp');
  setContent('restaurant', 'map_embed_url',      'https://maps.google.com/?q=5370+Gulf+of+Mexico+Drive+Longboat+Key+FL');
  setContent('restaurant', 'social_instagram',   'https://instagram.com/');
  setContent('restaurant', 'social_facebook',    'https://facebook.com/');
  setContent('restaurant', 'social_tripadvisor', 'https://tripadvisor.com/');
  setContent('restaurant', 'social_yelp',        'https://yelp.com/');

  // Links
  setContent('links', 'reserve',        '#reserve');
  setContent('links', 'menu_pdf',       '#menu');
  setContent('links', 'order_delivery', '#order-delivery');
  setContent('links', 'order_pickup',   '#order-pickup');
  setContent('links', 'gift_cards',     '#gift-cards');

  // Hero
  setContent('hero', 'eyebrow',     'Longboat Key, Florida');
  setContent('hero', 'headline1',   'Taste Sicily.');
  setContent('hero', 'headline2',   'Live the Moment.');
  setContent('hero', 'subheadline', 'Handmade pasta, slow-risen pizza, and sun-drenched Sicilian flavors \u2014 served with the warmth of a family table, steps from the Gulf.');
  setContent('hero', 'image_url',   'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&q=80');
  setContent('hero', 'image_alt',   'Candlelit restaurant interior with warm Italian atmosphere');

  // Story
  setContent('story', 'label',       'Our Story');
  setContent('story', 'quote',       'Every dish carries the memory of a kitchen in Palermo.');
  setContent('story', 'body1',       'La Norma was born from a simple obsession: bringing the soul of Sicilian cooking to the Gulf Coast without compromise. We cure our own meats, roll our pasta by hand each morning, and let our doughs rise slowly \u2014 because great food cannot be rushed.');
  setContent('story', 'body2',       'Named after the beloved pasta dish that has graced Sicilian tables for centuries, La Norma is a love letter to the flavors, textures, and rhythms of Southern Italy. Come as a guest. Leave as family.');
  setContent('story', 'stat1_value', '15+');
  setContent('story', 'stat1_label', 'Years of Sicilian Craft');
  setContent('story', 'stat2_value', '100%');
  setContent('story', 'stat2_label', 'Fresh, House-Made Pasta');
  setContent('story', 'stat3_value', '70+');
  setContent('story', 'stat3_label', 'Curated Italian Wines');
  setContent('story', 'image_url',   'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80');
  setContent('story', 'image_alt',   'Chef at work in an authentic Italian kitchen');

  // Specialties
  setContent('specialties', 'items', [
    { id: 1, tag: 'Pasta', badge: 'House Signature', name: 'Pasta alla Norma', description: 'Rigatoni, roasted eggplant, San Marzano tomato, salted ricotta, fresh basil.', price: '$26', imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=900&q=80', imageAlt: 'Pasta alla Norma', featured: true },
    { id: 2, tag: 'Pizza', name: 'Margherita di Bufala', description: '72-hour slow-risen dough, buffalo mozzarella DOP, San Marzano, fresh basil, extra-virgin olive oil.', price: '$22', imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=900&q=80', imageAlt: 'Margherita di Bufala pizza', featured: false },
    { id: 3, tag: 'Pesce', name: 'Branzino al Forno', description: 'Whole roasted sea bass with capers, Castelvetrano olives, citrus, white wine.', price: '$38', imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=900&q=80', imageAlt: 'Branzino al Forno', featured: false },
    { id: 4, tag: 'Dolce', name: 'Cannolo Siciliano', description: 'Crispy fried shells, sheep\u2019s ricotta, candied orange, dark chocolate, crushed pistachios.', price: '$12', imageUrl: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=900&q=80', imageAlt: 'Cannolo Siciliano', featured: false },
  ], 'json');

  // Experiences
  setContent('experiences', 'items', [
    { id: 1, icon: '\uD83C\uDF77', label: 'Every Friday',        title: 'Wine Tastings',   description: 'Our sommelier guides you through a curated flight of Sicilian and southern Italian wines, paired with artisan antipasti.',              cta: 'Reserve Your Seat', ctaHref: '#reserve' },
    { id: 2, icon: '\uD83D\uDC68\u200D\uD83C\uDF73', label: 'Saturday Mornings', title: 'Cooking Classes', description: 'Learn to make fresh pasta, pizza dough, and Sicilian classics with Chef Marco in an intimate group of max 8 guests.',        cta: 'Book a Class',      ctaHref: '#cooking-classes' },
    { id: 3, icon: '\uD83C\uDFB5', label: 'Wed & Sat Evenings', title: 'Live Music',      description: 'Enjoy live jazz and acoustic Italian music as the backdrop to your evening \u2014 intimate, unhurried, unforgettable.',                   cta: 'See Schedule',      ctaHref: '#schedule' },
    { id: 4, icon: '\uD83E\uDD42', label: 'By Arrangement',     title: 'Private Events',  description: 'Host your celebration, business dinner, or milestone event in our private dining room for up to 30 guests.',                              cta: 'Inquire Now',       ctaHref: '#contact' },
  ], 'json');

  // Menu highlights
  setContent('menu', 'label',    'The Menu');
  setContent('menu', 'headline', 'A Journey Through Sicily');
  setContent('menu', 'note',     'Full menu available in-house and as PDF. Seasonal items change monthly.');
  setContent('menu', 'categories', [
    { name: 'Antipasti', items: [
      { name: 'Bruschetta al Pomodoro', desc: 'Grilled sourdough, heritage tomatoes, garlic, basil, cold-pressed olive oil', price: '$11' },
      { name: 'Arancini di Riso',       desc: 'Crispy saffron rice balls, Rag\u00f9 filling, pea, Caciocavallo, tomato dip',   price: '$14' },
      { name: 'Carpaccio di Manzo',     desc: 'Thinly sliced beef tenderloin, rocket, Parmigiano, truffle oil, capers',         price: '$19' },
      { name: 'Burrata Pugliese',       desc: 'Creamy burrata, roasted cherry tomatoes, \u2019nduja oil, toasted focaccia',     price: '$17' },
    ]},
    { name: 'Primi & Pizze', items: [
      { name: 'Pasta alla Norma',       desc: 'Rigatoni, roasted eggplant, San Marzano, salted ricotta, basil',                 price: '$26' },
      { name: 'Tagliolini al Granchio', desc: 'Fresh egg tagliolini, blue crab, cherry tomatoes, chili, white wine',            price: '$32' },
      { name: 'Pizza Diavola',          desc: '72-hour dough, \u2019nduja, fior di latte, Calabrian chili, honey drizzle',      price: '$24' },
      { name: 'Quattro Formaggi',       desc: 'Gorgonzola, Taleggio, Pecorino, Parmigiano, fresh walnuts, truffle honey',       price: '$23' },
    ]},
    { name: 'Secondi & Dolci', items: [
      { name: 'Branzino al Forno',      desc: 'Whole roasted sea bass, capers, Castelvetrano olives, citrus, white wine',       price: '$38' },
      { name: 'Costata di Manzo',       desc: '14oz dry-aged ribeye, roasted garlic, rosemary, broccolini, salsa verde',        price: '$52' },
      { name: 'Cannolo Siciliano',      desc: 'Crispy shells, sheep\u2019s ricotta, candied orange, dark chocolate, pistachios', price: '$12' },
      { name: 'Tiramisù della Casa',    desc: 'Classic house recipe, espresso-soaked savoiardi, mascarpone, cocoa',             price: '$11' },
    ]},
  ], 'json');

  // Reservation banner
  setContent('reservation_banner', 'headline', 'A Table Awaits');
  setContent('reservation_banner', 'sub',      'Reserve your evening at La Norma and let the flavors of Sicily transport you.');
  setContent('reservation_banner', 'cta_text', 'Reserve a Table');
  setContent('reservation_banner', 'note',     'Walk-ins welcome based on availability \u00b7 Reservations recommended for weekends');

  // Order online
  setContent('order_online', 'eyebrow',  "Can\u2019t Make It Tonight?");
  setContent('order_online', 'headline', 'Bring La Norma Home');
  setContent('order_online', 'sub',      'Our most-loved dishes, packed with care and delivered to your door or ready for pickup.');

  // Testimonials
  setContent('testimonials', 'label',    'Guest Voices');
  setContent('testimonials', 'headline', 'Moments Worth Remembering');
  setContent('testimonials', 'items', [
    { id: 1, quote: "Hands down the best Italian food I\u2019ve had outside of Italy. The pasta alla Norma was transcendent \u2014 I still think about it weeks later.", author: 'Margaret S.',          location: 'Sarasota, FL',       source: 'Google Reviews', rating: 5 },
    { id: 2, quote: "We celebrated our anniversary here and it was absolutely perfect. The private dining room is gorgeous, the branzino was flawless, and the cannoli were the best we\u2019ve ever had.", author: 'James & Patricia K.', location: 'Longboat Key, FL',   source: 'TripAdvisor',    rating: 5 },
    { id: 3, quote: 'We took the Friday wine tasting and it was one of the highlights of our vacation. The sommelier is incredibly knowledgeable and the food pairings were phenomenal.', author: 'Thomas R.',             location: 'Chicago, IL',        source: 'Yelp',           rating: 5 },
  ], 'json');

  // Footer
  setContent('footer', 'tagline',   'Sicilian soul on the Gulf of Mexico.');
  setContent('footer', 'nav_items', [
    { label: 'Menu',               href: '#menu' },
    { label: 'Reserve a Table',    href: '#reserve' },
    { label: 'Order Delivery',     href: '#order-delivery' },
    { label: 'Order Pickup',       href: '#order-pickup' },
    { label: 'Wine & Experiences', href: '#experiences' },
    { label: 'Private Events',     href: '#contact' },
    { label: 'Gift Cards',         href: '#gift-cards' },
    { label: 'Contact Us',         href: '#visit' },
  ], 'json');

  console.log('[init] Site content seeded with defaults.');
}

// ── Cooking classes ───────────────────────────────────────────
function ensureCookingClasses() {
  if (!Array.isArray(db.data.cooking_classes)) db.data.cooking_classes = [];
  if (db.data.cooking_classes.length > 0) return;

  const themes = [
    { theme: 'Fresh Pasta & Slow Ragù',         short_theme: 'Fresh Pasta', description: 'Master the art of hand-rolled pasta and a rich slow-cooked ragù from scratch.',          difficulty: 'Beginner friendly' },
    { theme: 'Sicilian Street Food',             short_theme: 'Street Food', description: 'Arancini, panelle, and sfincione — the beloved street foods of Palermo.',                   difficulty: 'Beginner friendly' },
    { theme: 'Pizza & Focaccia from Scratch',    short_theme: 'Pizza',       description: '72-hour fermented dough, hand-stretching technique, and wood-fire style baking.',         difficulty: 'All levels' },
    { theme: 'Seafood alla Siciliana',           short_theme: 'Seafood',     description: 'Prepare whole fish, sarde a beccafico, and classic Sicilian seafood pasta.',               difficulty: 'Intermediate' },
    { theme: 'Risotto & Arancini Masterclass',   short_theme: 'Risotto',     description: 'The secrets to a perfect risotto and crispy golden arancini.',                             difficulty: 'All levels' },
    { theme: 'Dolci Siciliani',                  short_theme: 'Pastry',      description: 'Cannoli, cassata, and pasticiotti — the iconic sweets of Sicilian tradition.',             difficulty: 'All levels' },
  ];
  const spotsPattern = [3, 6, 5, 2, 7, 1, 4, 6];

  let cur = nextSaturday(new Date());
  for (let i = 0; i < 8; i++) {
    const t = themes[i % themes.length];
    db.data.cooking_classes.push({
      id:          getNextId('cooking_classes'),
      date:        cur.toISOString().split('T')[0],
      time:        '10:00 AM \u2013 1:30 PM',
      theme:       t.theme,
      short_theme: t.short_theme,
      description: t.description,
      difficulty:  t.difficulty,
      price:       95,
      max_spots:   8,
      spots_left:  spotsPattern[i % spotsPattern.length],
      active:      true,
      image_url:   null,
      created_at:  new Date().toISOString(),
      updated_at:  new Date().toISOString(),
    });
    cur.setDate(cur.getDate() + 7);
  }
  console.log('[init] Cooking classes seeded with defaults.');
}

// ── Events ────────────────────────────────────────────────────
function ensureEvents() {
  if (!Array.isArray(db.data.events)) db.data.events = [];
  if (db.data.events.length > 0) return;

  // Wine tastings (every Friday)
  const wineTastings = [
    { title: 'Sicilian Wine Journey',        description: "A guided flight through the noble grapes of Sicily — Nero d'Avola, Nerello Mascalese, and Grillo — paired with artisan antipasti.", price: 65, max_spots: 14 },
    { title: 'Southern Italy & the Islands', description: 'Explore the bold reds of Campania, the volcanic whites of Etna, and the sun-soaked wines of Sardinia paired with cured meats and cheeses.', price: 65, max_spots: 14 },
    { title: 'Organic & Biodynamic Italy',   description: 'A tasting dedicated to natural winemakers pushing boundaries in Italian viticulture, paired with seasonal small plates.',  price: 70, max_spots: 12 },
    { title: 'Amarone & Barolo Evening',     description: "Our sommelier leads a deep dive into Italy's most celebrated reds — Amarone della Valpolicella and Barolo — with aged cheeses and charcuterie.", price: 85, max_spots: 10 },
    { title: 'Prosecco & Aperitivo Hour',    description: "Light, festive, and delicious — discover premium Prosecco and Franciacorta with classic Venetian cicchetti and La Norma's signature nibbles.", price: 55, max_spots: 16 },
    { title: 'White Wines of the Coast',     description: 'Celebrate the crisp, mineral-driven whites of coastal Italy — Vermentino, Falanghina, and Greco di Tufo — paired with fresh seafood antipasti.', price: 65, max_spots: 14 },
  ];
  const wineSpots = [10, 8, 7, 4, 12, 6, 9, 5];
  let wineDate = nextWeekday(new Date(), 5);
  for (let i = 0; i < 8; i++) {
    const t = wineTastings[i % wineTastings.length];
    db.data.events.push({
      id:          getNextId('events'),
      category:    'wine_tasting',
      title:       t.title,
      description: t.description,
      date:        wineDate.toISOString().split('T')[0],
      time:        '6:00 PM \u2013 8:00 PM',
      price:       t.price,
      max_spots:   t.max_spots,
      spots_left:  wineSpots[i],
      active:      true,
      image_url:   null,
      created_at:  new Date().toISOString(),
      updated_at:  new Date().toISOString(),
    });
    wineDate.setDate(wineDate.getDate() + 7);
  }

  // Live music (Wed & Sat)
  const liveMusic = [
    { title: 'Jazz Duo: Martini & Rossi',    description: 'Smooth jazz standards and Italian classics performed by this beloved local piano-and-bass duo.',      time: '7:00 PM \u2013 9:30 PM' },
    { title: 'Acoustic Italian Songbook',    description: 'An intimate solo guitar performance of Italian pop classics and original compositions.',                time: '7:30 PM \u2013 9:30 PM' },
    { title: 'The Sicilian Strings Quartet', description: 'A rare live performance of classical Sicilian folk music reimagined for a modern audience.',             time: '7:00 PM \u2013 9:00 PM' },
    { title: 'Flamenco Night with A. Cruz',  description: "Mediterranean warmth meets Spanish passion — guitarist Ana Cruz brings an electrifying flamenco set.", time: '7:30 PM \u2013 9:30 PM' },
    { title: 'Jazz & Bossa: Duo Calypso',    description: 'A breezy evening of jazz and bossa nova celebrating the shared spirit of Mediterranean and Brazilian music.', time: '7:00 PM \u2013 9:30 PM' },
  ];
  let wedDate = nextWeekday(new Date(), 3);
  let satDate = nextWeekday(new Date(), 6);
  for (let i = 0; i < 5; i++) {
    const act = liveMusic[i % liveMusic.length];
    const useWed = (i % 2 === 0);
    const eventDate = useWed ? new Date(wedDate) : new Date(satDate);
    db.data.events.push({
      id:          getNextId('events'),
      category:    'live_music',
      title:       act.title,
      description: act.description,
      date:        eventDate.toISOString().split('T')[0],
      time:        act.time,
      price:       0,
      max_spots:   0,
      spots_left:  0,
      active:      true,
      image_url:   null,
      created_at:  new Date().toISOString(),
      updated_at:  new Date().toISOString(),
    });
    if (useWed) wedDate.setDate(wedDate.getDate() + 7);
    else        satDate.setDate(satDate.getDate() + 7);
  }
  console.log('[init] Events seeded with defaults.');
}

// ── Main entry point ──────────────────────────────────────────
export function ensureInitialized() {
  ensureAdminUser();
  ensureSiteContent();
  ensureCookingClasses();
  ensureEvents();

  // Ensure remaining collections exist
  if (!Array.isArray(db.data.rsvp))       db.data.rsvp       = [];
  if (!Array.isArray(db.data.inquiries))  db.data.inquiries  = [];

  save();
}
