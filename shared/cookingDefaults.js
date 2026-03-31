const PRICE_PER_PERSON = 95;
const CLASS_TIME = '10:00 AM - 1:30 PM';
const TOTAL_SPOTS = 8;

export const classThemes = [
  {
    theme: 'Fresh Pasta & Slow Ragu',
    shortTheme: 'Fresh Pasta',
    description:
      'Learn to roll, cut, and finish hand-made pasta with a deeply layered tomato and meat ragu.',
    difficulty: 'Beginner friendly',
  },
  {
    theme: 'Sicilian Street Food',
    shortTheme: 'Street Food',
    description:
      'Arancini, panelle, and sfincione inspired by the markets of Palermo.',
    difficulty: 'Beginner friendly',
  },
  {
    theme: 'Pizza & Focaccia from Scratch',
    shortTheme: 'Pizza & Focaccia',
    description:
      'Stretch slow-fermented dough, understand heat and texture, and bake with confidence.',
    difficulty: 'All levels',
  },
  {
    theme: 'Seafood alla Siciliana',
    shortTheme: 'Sicilian Seafood',
    description:
      'A bright coastal menu built around citrus, capers, fresh herbs, and beautifully cooked fish.',
    difficulty: 'Intermediate',
  },
  {
    theme: 'Risotto & Arancini Masterclass',
    shortTheme: 'Risotto & Arancini',
    description:
      'Master saffron risotto, ideal texture, and the crisp finish of a proper arancino.',
    difficulty: 'All levels',
  },
  {
    theme: 'Dolci Siciliani',
    shortTheme: 'Sicilian Desserts',
    description:
      'Cannoli, ricotta creams, and pastry techniques designed for guests with a sweet tooth.',
    difficulty: 'All levels',
  },
];

const classSpotsPattern = [3, 6, 5, 2, 7, 1, 4, 6];

function formatDateLabel(isoDate, options) {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString('en-US', options);
}

function nextWeekday(from, targetDay) {
  const seed = new Date(from);
  const diff = (targetDay - seed.getDay() + 7) % 7 || 7;
  seed.setDate(seed.getDate() + diff);
  return seed;
}

export function generateUpcomingClassRecords(count = 8, from = new Date()) {
  const records = [];
  const current = nextWeekday(from, 6);

  for (let index = 0; index < count; index += 1) {
    const themeData = classThemes[index % classThemes.length];
    const date = current.toISOString().split('T')[0];

    records.push({
      date,
      time: CLASS_TIME,
      theme: themeData.theme,
      short_theme: themeData.shortTheme,
      description: themeData.description,
      difficulty: themeData.difficulty,
      price: PRICE_PER_PERSON,
      max_spots: TOTAL_SPOTS,
      spots_left: classSpotsPattern[index % classSpotsPattern.length],
      active: true,
      image_url: null,
    });

    current.setDate(current.getDate() + 7);
  }

  return records;
}

export function generateUpcomingClasses(count = 8, from = new Date()) {
  return generateUpcomingClassRecords(count, from).map((entry, index) => ({
    id: index + 1,
    ...entry,
    dateISO: entry.date,
    displayDate: formatDateLabel(entry.date, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
    shortDate: formatDateLabel(entry.date, {
      month: 'short',
      day: 'numeric',
    }),
    dayName: formatDateLabel(entry.date, { weekday: 'long' }),
    totalSpots: entry.max_spots,
    spotsLeft: entry.spots_left,
    isAvailable: entry.spots_left > 0,
    shortTheme: entry.short_theme,
  }));
}

export const cookingClassFaqs = [
  {
    id: 1,
    question: 'Do I need any cooking experience?',
    answer:
      'No. Classes are designed to feel welcoming, hands-on, and supportive whether you cook every day or almost never.',
  },
  {
    id: 2,
    question: 'How long does each class last?',
    answer:
      'Expect around three and a half hours from welcome aperitivo to the shared meal at the end.',
  },
  {
    id: 3,
    question: 'What is included in the price?',
    answer:
      'Ingredients, wine or prosecco, printed recipes, the sit-down meal, and direct guidance from the kitchen team are all included.',
  },
  {
    id: 4,
    question: 'How many guests attend each class?',
    answer:
      'We intentionally cap each session at eight guests so the experience stays personal and hands-on.',
  },
  {
    id: 5,
    question: 'Can I reserve a private class?',
    answer:
      'Yes. Private buyouts are available for celebratory groups, team gatherings, and special occasions.',
  },
  {
    id: 6,
    question: 'What happens after I submit my RSVP?',
    answer:
      'We confirm availability by email within 24 hours and follow up with next steps, arrival guidance, and payment information.',
  },
  {
    id: 7,
    question: 'What is the cancellation policy?',
    answer:
      'Cancellations made at least 72 hours in advance receive a full refund. Later changes can usually be moved to another date when availability permits.',
  },
  {
    id: 8,
    question: 'Can dietary restrictions be accommodated?',
    answer:
      'Yes. Share restrictions or allergies in the notes field and we will do our best to adjust the menu in advance.',
  },
];

export const whatsIncluded = [
  { icon: 'Ingredients', label: 'All ingredients', detail: 'Seasonal produce, pantry staples, and premium imports are all supplied.' },
  { icon: 'Wine', label: 'Wine pairing', detail: 'A welcome pour and thoughtful pairings during the class meal.' },
  { icon: 'Meal', label: 'Shared meal', detail: 'Sit down together and enjoy everything you prepared.' },
  { icon: 'Recipes', label: 'Recipe cards', detail: 'Take-home instructions so the class can live on in your kitchen.' },
  { icon: 'Chef', label: 'Chef guidance', detail: 'Hands-on instruction from Chef Marco and the La Norma team.' },
  { icon: 'Gathering', label: 'Intimate setting', detail: 'Eight guests max - closer to a dinner party than a demo class.' },
];

export const classFormat = [
  {
    time: '10:00 AM',
    title: 'Welcome aperitivo',
    detail: 'Meet the group, settle in, and toast the morning before aprons go on.',
  },
  {
    time: '10:20 AM',
    title: 'Technique briefing',
    detail: 'Chef Marco introduces the menu, ingredients, and the key techniques for the day.',
  },
  {
    time: '10:30 AM',
    title: 'Hands-on cooking',
    detail: 'Roll, mix, shape, season, and taste your way through each recipe with guidance throughout.',
  },
  {
    time: '12:30 PM',
    title: 'Sit and dine',
    detail: 'The kitchen slows down and the room becomes a shared table for the meal you created.',
  },
  {
    time: '1:30 PM',
    title: 'Take the recipes home',
    detail: 'Leave with recipe cards, practical tips, and the confidence to recreate the dishes later.',
  },
];

const wineEventTemplates = [
  {
    title: 'Sicilian Wine Journey',
    description:
      'A guided flight through Etna whites, Nero dAvola, and volcanic reds with seasonal pairings from the kitchen.',
    price: 65,
    max_spots: 14,
  },
  {
    title: 'Southern Italy & the Islands',
    description:
      'Campania, Sardinia, and Sicily in one evening - rich pours, regional stories, and composed antipasti.',
    price: 68,
    max_spots: 14,
  },
  {
    title: 'Organic & Biodynamic Italy',
    description:
      'A tasting built around low-intervention producers and elegant small plates with a little edge.',
    price: 72,
    max_spots: 12,
  },
  {
    title: 'Barolo, Amarone & Friends',
    description:
      'A deeper, slower tasting for guests who want structure, age-worthiness, and richer pairings.',
    price: 88,
    max_spots: 10,
  },
  {
    title: 'Prosecco & Aperitivo Hour',
    description:
      'A brighter, celebratory format featuring sparkling wines, bites to share, and an easy Friday rhythm.',
    price: 58,
    max_spots: 16,
  },
];

const wineSpotsPattern = [10, 8, 7, 4, 12, 6, 9, 5];

export function generateUpcomingWineTastingRecords(count = 8, from = new Date()) {
  const records = [];
  const current = nextWeekday(from, 5);

  for (let index = 0; index < count; index += 1) {
    const template = wineEventTemplates[index % wineEventTemplates.length];
    records.push({
      category: 'wine_tasting',
      title: template.title,
      description: template.description,
      date: current.toISOString().split('T')[0],
      time: '6:00 PM - 8:00 PM',
      price: template.price,
      max_spots: template.max_spots,
      spots_left: wineSpotsPattern[index % wineSpotsPattern.length],
      active: true,
      image_url: null,
    });

    current.setDate(current.getDate() + 7);
  }

  return records;
}

const liveMusicTemplates = [
  {
    title: 'Jazz Duo: Martini & Rossi',
    description:
      'Piano and bass interpretations of jazz standards and Italian classics with a warm late-evening tone.',
    time: '7:00 PM - 9:30 PM',
  },
  {
    title: 'Acoustic Italian Songbook',
    description:
      'An intimate set of guitar-led Italian favorites suited to dinner conversation and a slower pace.',
    time: '7:30 PM - 9:30 PM',
  },
  {
    title: 'The Sicilian Strings Quartet',
    description:
      'A refined performance drawing on Sicilian folk melodies, chamber textures, and a distinctly Mediterranean mood.',
    time: '7:00 PM - 9:00 PM',
  },
  {
    title: 'Flamenco Night with Ana Cruz',
    description:
      'A livelier set with guitar, rhythm, and Mediterranean fire - ideal for celebratory tables.',
    time: '7:30 PM - 9:30 PM',
  },
  {
    title: 'Jazz & Bossa: Duo Calypso',
    description:
      'A breezy evening mix of jazz and bossa nova that pairs beautifully with cocktails and second bottles.',
    time: '7:00 PM - 9:30 PM',
  },
];

export function generateUpcomingLiveMusicRecords(count = 6, from = new Date()) {
  const records = [];
  const wednesday = nextWeekday(from, 3);
  const saturday = nextWeekday(from, 6);

  for (let index = 0; index < count; index += 1) {
    const template = liveMusicTemplates[index % liveMusicTemplates.length];
    const activeDate = index % 2 === 0 ? wednesday : saturday;

    records.push({
      category: 'live_music',
      title: template.title,
      description: template.description,
      date: activeDate.toISOString().split('T')[0],
      time: template.time,
      price: 0,
      max_spots: 0,
      spots_left: 0,
      active: true,
      image_url: null,
    });

    activeDate.setDate(activeDate.getDate() + 7);
  }

  return records;
}
