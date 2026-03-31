export const OPENTABLE_RESERVATION_URL =
  'https://www.opentable.com/r/la-norma-ristorante-and-pizzeria-reservations-longboat-key?lang=en-US&ot_source=Restaurant+website&restref=1037014';

const HOME_EXPERIENCE_IMAGES = {
  wine: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1400&q=85',
  cooking: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1400&q=85',
  music: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?auto=format&fit=crop&w=1400&q=85',
  events: 'https://images.unsplash.com/photo-1470042660615-51b9c62e8d28?auto=format&fit=crop&w=1400&q=85',
};

const COOKING_CLASS_IMAGES = [
  {
    keywords: ['pasta', 'ragu', 'tagliatelle'],
    image:
      'https://images.unsplash.com/photo-1516100882582-96c3a05fe590?auto=format&fit=crop&w=1400&q=85',
  },
  {
    keywords: ['street', 'arancini', 'panelle', 'sfincione'],
    image:
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1400&q=85',
  },
  {
    keywords: ['pizza', 'focaccia', 'dough'],
    image:
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1400&q=85',
  },
  {
    keywords: ['seafood', 'fish', 'coastal'],
    image:
      'https://images.unsplash.com/photo-1559847844-d721426d6edc?auto=format&fit=crop&w=1400&q=85',
  },
  {
    keywords: ['risotto'],
    image:
      'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1400&q=85',
  },
  {
    keywords: ['dessert', 'dolci', 'cannoli', 'pastry'],
    image:
      'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1400&q=85',
  },
];

const WINE_EVENT_IMAGES = [
  'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=85',
];

const LIVE_EVENT_IMAGES = [
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1400&q=85',
];

const PRIVATE_PACKAGE_IMAGES = {
  intimate: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1400&q=85',
  celebration: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1400&q=85',
  buyout: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1400&q=85',
};

function normalize(value = '') {
  return String(value ?? '').trim().toLowerCase();
}

function pickDeterministic(list, seed = '') {
  if (!list?.length) return '';

  const index = [...String(seed)]
    .reduce((total, character) => total + character.charCodeAt(0), 0) % list.length;

  return list[index];
}

export function getExperienceImage(title = '', index = 0) {
  const normalized = normalize(title);

  if (normalized.includes('wine')) return HOME_EXPERIENCE_IMAGES.wine;
  if (normalized.includes('cook') || normalized.includes('class')) return HOME_EXPERIENCE_IMAGES.cooking;
  if (normalized.includes('music')) return HOME_EXPERIENCE_IMAGES.music;
  if (normalized.includes('private') || normalized.includes('event')) return HOME_EXPERIENCE_IMAGES.events;

  return pickDeterministic(Object.values(HOME_EXPERIENCE_IMAGES), `${title}-${index}`);
}

export function getCookingClassImage(theme = '', index = 0) {
  const normalized = normalize(theme);
  const matched = COOKING_CLASS_IMAGES.find(({ keywords }) =>
    keywords.some((keyword) => normalized.includes(keyword)),
  );

  if (matched) return matched.image;

  return pickDeterministic(
    COOKING_CLASS_IMAGES.map(({ image }) => image),
    `${theme}-${index}`,
  );
}

export function getEventImage(category = '', title = '', index = 0) {
  const normalizedCategory = normalize(category);

  if (normalizedCategory.includes('wine')) {
    return pickDeterministic(WINE_EVENT_IMAGES, `${title}-${index}`);
  }

  if (normalizedCategory.includes('music')) {
    return pickDeterministic(LIVE_EVENT_IMAGES, `${title}-${index}`);
  }

  return getExperienceImage(title, index);
}

export function getPackageImage(name = '', index = 0) {
  const normalized = normalize(name);

  if (normalized.includes('intimate')) return PRIVATE_PACKAGE_IMAGES.intimate;
  if (normalized.includes('celebration')) return PRIVATE_PACKAGE_IMAGES.celebration;
  if (normalized.includes('buyout')) return PRIVATE_PACKAGE_IMAGES.buyout;

  return pickDeterministic(Object.values(PRIVATE_PACKAGE_IMAGES), `${name}-${index}`);
}
