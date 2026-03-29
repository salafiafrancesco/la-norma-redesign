/**
 * seed.js — Populates db.json with initial content from content.js
 * Run once: node db/seed.js
 */
import { createRequire } from 'module';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import bcrypt from 'bcryptjs';
import db, { save, getNextId } from './database.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env') });

// ── Helpers ───────────────────────────────────────────────────
function setContent(section, key, value, type = 'text') {
  if (!db.data.site_content[section]) db.data.site_content[section] = {};
  db.data.site_content[section][key] = { value, type };
}

function addClass(cls) {
  const exists = db.data.cooking_classes.find(c => c.date === cls.date);
  if (!exists) {
    db.data.cooking_classes.push({ id: getNextId('cooking_classes'), ...cls, created_at: new Date().toISOString() });
  }
}

function addEvent(ev) {
  if (!db.data.events) db.data.events = [];
  if (!db.data.inquiries) db.data.inquiries = [];
  const exists = db.data.events.find(e => e.date === ev.date && e.category === ev.category);
  if (!exists) {
    db.data.events.push({ id: getNextId('events'), ...ev, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  }
}

// ── Admin user ────────────────────────────────────────────────
const username = process.env.ADMIN_USERNAME || 'admin';
const password = process.env.ADMIN_PASSWORD || 'lanorma2025';
const existing = db.data.admin_users.find(u => u.username === username);

if (!existing) {
  db.data.admin_users.push({
    id:            1,
    username,
    password_hash: bcrypt.hashSync(password, 10),
  });
  console.log(`✓ Admin user "${username}" created`);
} else {
  existing.password_hash = bcrypt.hashSync(password, 10);
  console.log(`✓ Admin user "${username}" updated`);
}

// ── Restaurant info ───────────────────────────────────────────
setContent('restaurant', 'name',              'La Norma');
setContent('restaurant', 'tagline',           'Ristorante & Pizzeria');
setContent('restaurant', 'address',           '5370 Gulf of Mexico Drive');
setContent('restaurant', 'city',              'Longboat Key');
setContent('restaurant', 'state',             'FL');
setContent('restaurant', 'zip',               '34228');
setContent('restaurant', 'phone',             '+1 (941) 555-0192');
setContent('restaurant', 'email',             'info@lanormarestaurant.com');
setContent('restaurant', 'hours',             'Daily 5:00 PM \u2013 9:00 PM');
setContent('restaurant', 'hours_note',        'Bar from 4:30 PM \u00b7 Kitchen closes at 9:00 PM sharp');
setContent('restaurant', 'social_instagram',  'https://instagram.com/');
setContent('restaurant', 'social_facebook',   'https://facebook.com/');
setContent('restaurant', 'social_tripadvisor','https://tripadvisor.com/');
setContent('restaurant', 'social_yelp',       'https://yelp.com/');
console.log('✓ Restaurant info seeded');

// ── Links ─────────────────────────────────────────────────────
setContent('links', 'reserve',       '#reserve');
setContent('links', 'menu_pdf',      '#menu');
setContent('links', 'order_delivery','#order-delivery');
setContent('links', 'order_pickup',  '#order-pickup');
setContent('links', 'gift_cards',    '#gift-cards');
console.log('✓ Links seeded');

// ── Hero ──────────────────────────────────────────────────────
setContent('hero', 'eyebrow',      'Longboat Key, Florida');
setContent('hero', 'headline1',    'Taste Sicily.');
setContent('hero', 'headline2',    'Live the Moment.');
setContent('hero', 'subheadline',  'Handmade pasta, slow-risen pizza, and sun-drenched Sicilian flavors \u2014 served with the warmth of a family table, steps from the Gulf.');
setContent('hero', 'image_url',    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&q=80', 'image');
setContent('hero', 'image_alt',    'Candlelit restaurant interior with warm Italian atmosphere');
console.log('✓ Hero seeded');

// ── Story ─────────────────────────────────────────────────────
setContent('story', 'label',        'Our Story');
setContent('story', 'quote',        'Every dish carries the memory of a kitchen in Palermo.');
setContent('story', 'body1',        'La Norma was born from a single conviction: that Sicilian food, made with patience and love, can stop time. Chef Marco Vitale brought his grandmother\u2019s recipes across the Atlantic and grounded them in the beauty of Longboat Key.');
setContent('story', 'body2',        'Every plate that leaves our kitchen tells a story \u2014 of sun-dried tomatoes, hand-rolled pasta, and life\u2019s most meaningful moments shared over a great meal.');
setContent('story', 'stat1_value',  '15+');
setContent('story', 'stat1_label',  'Years of Sicilian Craft');
setContent('story', 'stat2_value',  '100%');
setContent('story', 'stat2_label',  'Fresh, House-Made Pasta');
setContent('story', 'stat3_value',  '70+');
setContent('story', 'stat3_label',  'Curated Italian Wines');
setContent('story', 'image_url',    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80', 'image');
setContent('story', 'image_alt',    'Chef at work in an authentic Italian kitchen');
console.log('✓ Story seeded');

// ── Specialties ───────────────────────────────────────────────
setContent('specialties', 'items', [
  { id: 1, tag: 'Pasta', badge: 'House Signature', name: 'Pasta alla Norma', description: 'Rigatoni, roasted eggplant, San Marzano tomato, salted ricotta, fresh basil.', price: '$26', imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=900&q=80', imageAlt: 'Pasta alla Norma', featured: true },
  { id: 2, tag: 'Pizza', name: 'Margherita di Bufala', description: '72-hour slow-risen dough, buffalo mozzarella DOP, San Marzano, fresh basil, extra-virgin olive oil.', price: '$22', imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=900&q=80', imageAlt: 'Margherita di Bufala pizza', featured: false },
  { id: 3, tag: 'Pesce', name: 'Branzino al Forno', description: 'Whole roasted sea bass with capers, Castelvetrano olives, citrus, white wine.', price: '$38', imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=900&q=80', imageAlt: 'Branzino al Forno', featured: false },
  { id: 4, tag: 'Dolce', name: 'Cannolo Siciliano', description: 'Crispy fried shells, sheep\u2019s ricotta, candied orange, dark chocolate, crushed pistachios.', price: '$12', imageUrl: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=900&q=80', imageAlt: 'Cannolo Siciliano', featured: false },
], 'json');
console.log('✓ Specialties seeded');

// ── Experiences ───────────────────────────────────────────────
setContent('experiences', 'items', [
  { id: 1, icon: '🍷', label: 'Every Friday', title: 'Wine Tastings', description: 'Our sommelier guides you through a curated flight of Sicilian and southern Italian wines, paired with artisan antipasti.', cta: 'Reserve Your Seat', ctaHref: '#reserve' },
  { id: 2, icon: '👨\u200d🍳', label: 'Saturday Mornings', title: 'Cooking Classes', description: 'Learn to make fresh pasta, pizza dough, and Sicilian classics with Chef Marco in an intimate group of max 8 guests.', cta: 'Book a Class', ctaHref: '#cooking-classes' },
  { id: 3, icon: '🎵', label: 'Wed & Sat Evenings', title: 'Live Music', description: 'Enjoy live jazz and acoustic Italian music as the backdrop to your evening \u2014 intimate, unhurried, unforgettable.', cta: 'See Schedule', ctaHref: '#schedule' },
  { id: 4, icon: '🥂', label: 'By Arrangement', title: 'Private Events', description: 'Host your celebration, business dinner, or milestone event in our private dining room for up to 30 guests.', cta: 'Inquire Now', ctaHref: '#contact' },
], 'json');
console.log('✓ Experiences seeded');

// ── Menu highlights ───────────────────────────────────────────
setContent('menu', 'label',     'The Menu');
setContent('menu', 'headline',  'A Journey Through Sicily');
setContent('menu', 'note',      'Full menu available in-house and as PDF. Seasonal items change monthly.');
setContent('menu', 'categories', [
  { name: 'Antipasti', items: [
    { name: 'Bruschetta al Pomodoro', desc: 'Grilled sourdough, heritage tomatoes, garlic, basil, cold-pressed olive oil', price: '$11' },
    { name: 'Arancini di Riso', desc: 'Crispy saffron rice balls, Rag\u00f9 filling, pea, Caciocavallo, tomato dip', price: '$14' },
    { name: 'Carpaccio di Manzo', desc: 'Thinly sliced beef tenderloin, rocket, Parmigiano, truffle oil, capers', price: '$19' },
    { name: 'Burrata Pugliese', desc: 'Creamy burrata, roasted cherry tomatoes, \u2019nduja oil, toasted focaccia', price: '$17' },
  ]},
  { name: 'Primi & Pizze', items: [
    { name: 'Pasta alla Norma', desc: 'Rigatoni, roasted eggplant, San Marzano, salted ricotta, basil', price: '$26' },
    { name: 'Tagliolini al Granchio', desc: 'Fresh egg tagliolini, blue crab, cherry tomatoes, chili, white wine', price: '$32' },
    { name: 'Pizza Diavola', desc: '72-hour dough, \u2019nduja, fior di latte, Calabrian chili, honey drizzle', price: '$24' },
    { name: 'Quattro Formaggi', desc: 'Gorgonzola, Taleggio, Pecorino, Parmigiano, fresh walnuts, truffle honey', price: '$23' },
  ]},
  { name: 'Secondi & Dolci', items: [
    { name: 'Branzino al Forno', desc: 'Whole roasted sea bass, capers, Castelvetrano olives, citrus, white wine', price: '$38' },
    { name: 'Costata di Manzo', desc: '14oz dry-aged ribeye, roasted garlic, rosemary, broccolini, salsa verde', price: '$52' },
    { name: 'Cannolo Siciliano', desc: 'Crispy shells, sheep\u2019s ricotta, candied orange, dark chocolate, pistachios', price: '$12' },
    { name: 'Tiramis\u00f9 della Casa', desc: 'Classic house recipe, espresso-soaked savoiardi, mascarpone, cocoa', price: '$11' },
  ]},
], 'json');
console.log('✓ Menu seeded');

// ── Reservation banner ────────────────────────────────────────
setContent('reservation_banner', 'headline', 'A Table Awaits');
setContent('reservation_banner', 'sub',      'Reserve your evening at La Norma and let the flavors of Sicily transport you.');
setContent('reservation_banner', 'cta_text', 'Reserve a Table');
setContent('reservation_banner', 'note',     'Walk-ins welcome based on availability \u00b7 Reservations recommended for weekends');
console.log('✓ Reservation banner seeded');

// ── Order online ──────────────────────────────────────────────
setContent('order_online', 'eyebrow',  "Can\u2019t Make It Tonight?");
setContent('order_online', 'headline', 'Bring La Norma Home');
setContent('order_online', 'sub',      'Our most-loved dishes, packed with care and delivered to your door or ready for pickup.');
console.log('✓ Order online seeded');

// ── Testimonials ──────────────────────────────────────────────
setContent('testimonials', 'label',    'Guest Voices');
setContent('testimonials', 'headline', 'Moments Worth Remembering');
setContent('testimonials', 'items', [
  { id: 1, text: 'The Pasta alla Norma was the best I\u2019ve ever tasted outside of Sicily. Perfectly balanced, beautifully presented. We\u2019ve already booked our next table.', author: 'Margaret S.', location: 'Sarasota, FL', source: 'Google Reviews', rating: 5 },
  { id: 2, text: 'We celebrated our anniversary at La Norma and it was flawless. The staff remembered our preferences, the wine pairing was inspired, and the cannoli \u2014 perfection.', author: 'James & Patricia K.', location: 'Longboat Key, FL', source: 'TripAdvisor', rating: 5 },
  { id: 3, text: 'I\u2019ve traveled to Italy a dozen times and La Norma captures the soul of Sicilian hospitality better than most restaurants on the island itself. Remarkable.', author: 'Thomas R.', location: 'Chicago, IL', source: 'Yelp', rating: 5 },
], 'json');
console.log('✓ Testimonials seeded');

// ── Footer ────────────────────────────────────────────────────
setContent('footer', 'tagline', 'Sicilian soul on the Gulf of Mexico.');
setContent('footer', 'nav_items', [
  { label: 'Menu',             href: '#menu' },
  { label: 'Reserve',          href: '#reserve' },
  { label: 'Order Delivery',   href: '#order-delivery' },
  { label: 'Order Pickup',     href: '#order-pickup' },
  { label: 'Wine & Experiences', href: '#experiences' },
  { label: 'Private Events',   href: '#contact' },
  { label: 'Gift Cards',       href: '#gift-cards' },
  { label: 'Contact',          href: '#visit' },
], 'json');
console.log('✓ Footer seeded');

// ── Cooking classes ───────────────────────────────────────────
const themes = [
  { theme: 'Fresh Pasta & Slow Ragù',         short_theme: 'Fresh Pasta', description: 'Master the art of hand-rolled pasta and a rich slow-cooked ragù from scratch.',          difficulty: 'Beginner friendly' },
  { theme: 'Sicilian Street Food',             short_theme: 'Street Food', description: 'Arancini, panelle, and sfincione — the beloved street foods of Palermo.',                   difficulty: 'Beginner friendly' },
  { theme: 'Pizza & Focaccia from Scratch',    short_theme: 'Pizza',       description: '72-hour fermented dough, hand-stretching technique, and wood-fire style baking.',         difficulty: 'All levels' },
  { theme: 'Seafood alla Siciliana',           short_theme: 'Seafood',     description: 'Prepare whole fish, sarde a beccafico, and classic Sicilian seafood pasta.',               difficulty: 'Intermediate' },
  { theme: 'Risotto & Arancini Masterclass',   short_theme: 'Risotto',     description: 'The secrets to a perfect risotto and crispy golden arancini.',                             difficulty: 'All levels' },
  { theme: 'Dolci Siciliani',                  short_theme: 'Pastry',      description: 'Cannoli, cassata, and pasticiotti — the iconic sweets of Sicilian tradition.',             difficulty: 'All levels' },
];
const spotsPattern = [3, 6, 5, 2, 7, 1, 4, 6];

function nextSaturday(from) {
  const d = new Date(from);
  const day = d.getDay();
  const diff = day === 6 ? 7 : 6 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

let cur = nextSaturday(new Date());
for (let i = 0; i < 8; i++) {
  const t = themes[i % themes.length];
  addClass({
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
    updated_at:  new Date().toISOString(),
  });
  cur.setDate(cur.getDate() + 7);
}
console.log('✓ Cooking classes seeded');

// ── Events: Wine Tastings (every Friday) ─────────────────────
function nextWeekday(from, targetDay) { // 0=Sun,5=Fri,6=Sat
  const d = new Date(from);
  const diff = (targetDay - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d;
}

const wineTastingThemes = [
  { title: 'Sicilian Wine Journey',        description: 'A guided flight through the noble grapes of Sicily — Nero d\'Avola, Nerello Mascalese, and Grillo — paired with artisan antipasti crafted by our kitchen.',  price: 65, max_spots: 14 },
  { title: 'Southern Italy & the Islands', description: 'Explore the bold reds of Campania, the volcanic whites of Etna, and the sun-soaked wines of Sardinia paired with cured meats and cheeses.',               price: 65, max_spots: 14 },
  { title: 'Organic & Biodynamic Italy',   description: 'A tasting dedicated to natural winemakers pushing boundaries in Italian viticulture, paired with seasonal small plates.',                                   price: 70, max_spots: 12 },
  { title: 'Amarone & Barolo Evening',     description: 'Our sommelier leads a deep dive into Italy\'s most celebrated reds — Amarone della Valpolicella and Barolo — with aged cheeses and charcuterie.',          price: 85, max_spots: 10 },
  { title: 'Prosecco & Aperitivo Hour',    description: 'Light, festive, and delicious — discover premium Prosecco and Franciacorta with classic Venetian cicchetti and La Norma\'s signature nibbles.',            price: 55, max_spots: 16 },
  { title: 'White Wines of the Coast',     description: 'Celebrate the crisp, mineral-driven whites of coastal Italy — Vermentino, Falanghina, and Greco di Tufo — paired with fresh seafood antipasti.',           price: 65, max_spots: 14 },
];

const spotsLeftWine = [10, 8, 7, 4, 12, 6, 9, 5];
let wineDate = nextWeekday(new Date(), 5); // next Friday
for (let i = 0; i < 8; i++) {
  const t = wineTastingThemes[i % wineTastingThemes.length];
  addEvent({
    category:    'wine_tasting',
    title:       t.title,
    description: t.description,
    date:        wineDate.toISOString().split('T')[0],
    time:        '6:00 PM \u2013 8:00 PM',
    price:       t.price,
    max_spots:   t.max_spots,
    spots_left:  spotsLeftWine[i],
    active:      true,
    image_url:   null,
  });
  wineDate.setDate(wineDate.getDate() + 7);
}
console.log('✓ Wine tasting events seeded');

// ── Events: Live Music (Wed & Sat evenings) ───────────────────
const liveMusicActs = [
  { title: 'Jazz Duo: Martini & Rossi',    description: 'Smooth jazz standards and Italian classics performed by this beloved local piano-and-bass duo. Perfect for a mid-week indulgence.',           time: '7:00 PM \u2013 9:30 PM' },
  { title: 'Acoustic Italian Songbook',    description: 'An intimate solo guitar performance of Italian pop classics and original compositions by guitarist Lorenzo Bianchi.',                         time: '7:30 PM \u2013 9:30 PM' },
  { title: 'The Sicilian Strings Quartet', description: 'A rare live performance of classical Sicilian folk music reimagined for a modern audience — captivating and moving.',                        time: '7:00 PM \u2013 9:00 PM' },
  { title: 'Flamenco Night with A. Cruz',  description: 'Mediterranean warmth meets Spanish passion — guitarist Ana Cruz brings an electrifying flamenco set to La Norma\'s dining room.',          time: '7:30 PM \u2013 9:30 PM' },
  { title: 'Jazz & Bossa: Duo Calypso',    description: 'A breezy evening of jazz and bossa nova celebrating the shared spirit of Mediterranean and Brazilian music. Ideal for a romantic Saturday.', time: '7:00 PM \u2013 9:30 PM' },
];

const spotsLeftMusic = []; // no spots — live music is open to all diners

let musicIdx = 0;
let wedDate = nextWeekday(new Date(), 3); // next Wednesday
let satDate = nextWeekday(new Date(), 6); // next Saturday

for (let i = 0; i < 5; i++) {
  const act = liveMusicActs[musicIdx % liveMusicActs.length];
  const useWed = (i % 2 === 0);
  const eventDate = useWed ? new Date(wedDate) : new Date(satDate);
  addEvent({
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
  });
  if (useWed) wedDate.setDate(wedDate.getDate() + 7);
  else satDate.setDate(satDate.getDate() + 7);
  musicIdx++;
}
console.log('✓ Live music events seeded');

save();
console.log('\n🎉 Seed complete. DB written to server/data/db.json');
