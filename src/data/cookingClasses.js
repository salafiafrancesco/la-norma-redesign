/* ============================================================
   Cooking Classes — Data & Configuration
   ============================================================
   CUSTOMIZATION:
   - Edit `classThemes` to change class topics / descriptions
   - Edit `generateUpcomingClasses()` to adjust pricing, spots, times
   - Set `spotsLeft: 0` on any entry to mark it as "Fully Booked"
   - Change `PRICE_PER_PERSON` for uniform pricing
   - Change `CLASS_TIME` for the default session time
   ============================================================ */

const PRICE_PER_PERSON = 95;
const CLASS_TIME = '10:00 AM – 1:30 PM';
const TOTAL_SPOTS = 8;

const classThemes = [
  {
    theme: 'Fresh Pasta & Slow Ragù',
    shortTheme: 'Pasta & Ragù',
    description:
      'Roll your own tagliatelle, pappardelle, and rigatoni from scratch. Build a three-hour slow-simmered Bolognese and plate like a Milanese chef.',
    difficulty: 'Beginner friendly',
  },
  {
    theme: 'Sicilian Street Food',
    shortTheme: 'Sicilian Street Food',
    description:
      'Arancini, panelle, and sfincione — the soulful street snacks of Palermo\'s legendary Ballarò market. Hands-on from dough to golden fry.',
    difficulty: 'Beginner friendly',
  },
  {
    theme: 'Pizza & Focaccia from Scratch',
    shortTheme: 'Pizza & Focaccia',
    description:
      'Learn our 72-hour slow-rise method, stretch dough by hand, and fire your own Neapolitan pizza and Ligurian focaccia al formaggio.',
    difficulty: 'All levels',
  },
  {
    theme: 'Seafood alla Siciliana',
    shortTheme: 'Sicilian Seafood',
    description:
      'Fresh Gulf catch, Sicilian capers, Taggiasca olives, and bright citrus. The elemental, sun-drenched approach to Italian coastal cooking.',
    difficulty: 'Intermediate',
  },
  {
    theme: 'Risotto & Arancini Masterclass',
    shortTheme: 'Risotto & Arancini',
    description:
      'Saffron risotto Milanese, the art of the perfect arancino, and Sicilian rice culture — from the fields of Enna to your plate.',
    difficulty: 'All levels',
  },
  {
    theme: 'Dolci Siciliani',
    shortTheme: 'Sicilian Desserts',
    description:
      'Cannoli shells fried to order, cassata decorated by hand, and ricotta-filled pasticiotti. Sicily\'s sweetest traditions in your hands.',
    difficulty: 'All levels',
  },
];

/* Spots left per session — set to 0 to mark as Fully Booked */
const spotsPattern = [3, 6, 5, 2, 7, 1, 4, 6];

/**
 * Generates the next `count` Saturday classes from today.
 * Call this at component render time for always-current dates.
 */
export function generateUpcomingClasses(count = 8) {
  const classes = [];
  const today = new Date();
  const d = new Date(today);

  // Advance to the next Saturday
  const dayOfWeek = d.getDay(); // 0=Sun … 6=Sat
  const daysToSat = dayOfWeek === 6 ? 7 : (6 - dayOfWeek);
  d.setDate(d.getDate() + daysToSat);

  for (let i = 0; i < count; i++) {
    const dateObj = new Date(d);
    const themeData = classThemes[i % classThemes.length];
    const spotsLeft = spotsPattern[i % spotsPattern.length];

    classes.push({
      id: i + 1,
      dateISO: dateObj.toISOString().split('T')[0],
      displayDate: dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      shortDate: dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      dayName: dateObj.toLocaleDateString('en-US', { weekday: 'long' }),
      time: CLASS_TIME,
      price: PRICE_PER_PERSON,
      totalSpots: TOTAL_SPOTS,
      spotsLeft,
      isAvailable: spotsLeft > 0,
      ...themeData,
    });

    d.setDate(d.getDate() + 7);
  }

  return classes;
}

/* ---- FAQ ---- */
export const cookingClassFaqs = [
  {
    id: 1,
    question: 'Do I need any cooking experience?',
    answer:
      'Not at all. Most of our classes are designed for all skill levels, and Chef Marco is gifted at making every guest feel at ease — whether it\'s your first time in a kitchen or your hundredth.',
  },
  {
    id: 2,
    question: 'How long does each class last?',
    answer:
      'Classes run from 10:00 AM to approximately 1:30 PM — a little over three hours of cooking, learning, and eating together. The last 45 minutes are dedicated to sitting down and enjoying everything you\'ve made.',
  },
  {
    id: 3,
    question: 'What is included in the price?',
    answer:
      'Everything: all ingredients, wine or prosecco pairings, the sit-down meal you cook, printed recipe cards to take home, and the undivided attention of our chef and kitchen team throughout.',
  },
  {
    id: 4,
    question: 'How many guests per class?',
    answer:
      'We intentionally keep classes intimate — a maximum of 8 guests per session. This ensures everyone gets hands-on time and personal guidance from Chef Marco.',
  },
  {
    id: 5,
    question: 'Can I book for a group or private event?',
    answer:
      'Absolutely. We offer private class buyouts for groups of 6–8, ideal for birthdays, anniversaries, corporate team-building, and bachelorette parties. Contact us at info@lanormarestaurant.com for custom arrangements.',
  },
  {
    id: 6,
    question: 'What happens after I submit my RSVP?',
    answer:
      'You\'ll receive a confirmation email within 24 hours with full details, a payment link, and everything you need to know before your class. Your spot is held once payment is received.',
  },
  {
    id: 7,
    question: 'What is your cancellation policy?',
    answer:
      'Full refund for cancellations made 72 hours or more before your class. Within 72 hours, we\'re happy to transfer your booking to a future date, subject to availability.',
  },
  {
    id: 8,
    question: 'Are dietary restrictions accommodated?',
    answer:
      'Yes — please note any dietary requirements in the "Special Requests" field when booking. We\'ll do our best to accommodate vegetarian, gluten-free, and allergy needs with advance notice.',
  },
];

/* ---- Included Items ---- */
export const whatsIncluded = [
  { icon: '🫙', label: 'All Ingredients', detail: 'Fresh, seasonal, and sourced locally' },
  { icon: '🍷', label: 'Wine Pairing', detail: 'Curated glass or prosecco welcome toast' },
  { icon: '🍽️', label: 'Sit-Down Meal', detail: 'Enjoy everything you cooked together' },
  { icon: '📋', label: 'Recipe Cards', detail: 'Take home every recipe, beautifully printed' },
  { icon: '👨‍🍳', label: 'Expert Guidance', detail: 'Chef Marco with you every step of the way' },
  { icon: '🏡', label: 'Intimate Setting', detail: 'Max 8 guests — never a cooking class, always a dinner party' },
];

/* ---- Format / Timeline ---- */
export const classFormat = [
  {
    time: '10:00 AM',
    title: 'Welcome & Toast',
    detail: 'Arrive to a warm kitchen, meet your fellow cooks, and raise a glass of prosecco.',
  },
  {
    time: '10:20 AM',
    title: 'Into the Kitchen',
    detail: 'Aprons on. Chef Marco introduces the session, the ingredients, and the techniques.',
  },
  {
    time: '10:30 AM',
    title: 'Cook Together',
    detail: 'Hands-on cooking in a relaxed, convivial atmosphere. Ask everything. Laugh freely.',
  },
  {
    time: '12:30 PM',
    title: 'Sit & Dine',
    detail: 'Set the table, open the wine, and sit down together to enjoy what you\'ve made.',
  },
  {
    time: '1:30 PM',
    title: 'Take Home',
    detail: 'Leave with recipe cards, leftovers if any, and the confidence to cook it again.',
  },
];
