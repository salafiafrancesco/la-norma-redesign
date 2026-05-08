import { cateringDefaults } from '../../shared/cateringDefaults.js';
import { siteDefaults } from '../../shared/siteDefaults.js';

function createEntry(value) {
  const isJson = typeof value === 'object' && value !== null;
  return {
    value: isJson ? JSON.stringify(value) : String(value ?? ''),
    type: isJson ? 'json' : 'text',
  };
}

const DEFAULT_CONTENT = {
  restaurant: {
    name: siteDefaults.restaurant.name,
    tagline: siteDefaults.restaurant.tagline,
    description: siteDefaults.restaurant.description,
    address: siteDefaults.restaurant.address,
    city: siteDefaults.restaurant.city,
    state: siteDefaults.restaurant.state,
    zip: siteDefaults.restaurant.zip,
    phone: siteDefaults.restaurant.phone,
    email: siteDefaults.restaurant.email,
    hours: siteDefaults.restaurant.hours,
    hours_note: siteDefaults.restaurant.hoursNote,
    map_embed_url: siteDefaults.restaurant.mapEmbedUrl,
    social_instagram: siteDefaults.restaurant.social.instagram,
    social_facebook: siteDefaults.restaurant.social.facebook,
    social_tripadvisor: siteDefaults.restaurant.social.tripadvisor,
    social_yelp: siteDefaults.restaurant.social.yelp,
  },
  links: {
    reserve: siteDefaults.links.reserve,
    menu_pdf: siteDefaults.links.menuPdf,
    order_delivery: siteDefaults.links.orderDelivery,
    order_pickup: siteDefaults.links.orderPickup,
    gift_cards: siteDefaults.links.giftCards,
  },
  hero: {
    eyebrow: siteDefaults.hero.eyebrow,
    headline1: siteDefaults.hero.headline[0],
    headline2: siteDefaults.hero.headline[1],
    subheadline: siteDefaults.hero.subheadline,
    image_url: siteDefaults.hero.imageUrl,
    image_alt: siteDefaults.hero.imageAlt,
  },
  story: {
    label: siteDefaults.story.label,
    quote: siteDefaults.story.quote,
    body1: siteDefaults.story.body[0],
    body2: siteDefaults.story.body[1],
    stat1_value: siteDefaults.story.stat1.value,
    stat1_label: siteDefaults.story.stat1.label,
    stat2_value: siteDefaults.story.stat2.value,
    stat2_label: siteDefaults.story.stat2.label,
    stat3_value: siteDefaults.story.stat3.value,
    stat3_label: siteDefaults.story.stat3.label,
    image_url: siteDefaults.story.imageUrl,
    image_alt: siteDefaults.story.imageAlt,
  },
  specialties: {
    items: siteDefaults.specialties,
  },
  experiences: {
    items: siteDefaults.experiences,
  },
  menu: {
    label: siteDefaults.menuHighlights.label,
    headline: siteDefaults.menuHighlights.headline,
    note: siteDefaults.menuHighlights.note,
    categories: siteDefaults.menuHighlights.categories,
  },
  testimonials: {
    label: siteDefaults.testimonialSection.label,
    headline: siteDefaults.testimonialSection.headline,
    items: siteDefaults.testimonialSection.items,
  },
  reservation_banner: {
    headline: siteDefaults.reservationBanner.headline,
    sub: siteDefaults.reservationBanner.sub,
    cta_text: siteDefaults.reservationBanner.ctaText,
    note: siteDefaults.reservationBanner.note,
  },
  order_online: {
    eyebrow: siteDefaults.orderOnline.eyebrow,
    headline: siteDefaults.orderOnline.headline,
    sub: siteDefaults.orderOnline.sub,
  },
  catering: {
    hero_title: cateringDefaults.hero_title,
    hero_subtitle: cateringDefaults.hero_subtitle,
    hero_image_url: cateringDefaults.hero_image_url,
    intro_p1: cateringDefaults.intro_p1,
    intro_p2: cateringDefaults.intro_p2,
    perfect_for: cateringDefaults.perfect_for,
    style_includes: cateringDefaults.style_includes,
    gallery: cateringDefaults.gallery,
    cta_heading: cateringDefaults.cta_heading,
    cta_text: cateringDefaults.cta_text,
    cta_button_label: cateringDefaults.cta_button_label,
    contact_phone: cateringDefaults.contact_phone,
    contact_email: cateringDefaults.contact_email,
    contact_website: cateringDefaults.contact_website,
    seo_title: cateringDefaults.seo_title,
    seo_description: cateringDefaults.seo_description,
    seo_og_image_url: cateringDefaults.seo_og_image_url,
  },
  footer: {
    tagline: siteDefaults.footer.tagline,
    nav_items: siteDefaults.footer.navItems,
  },
};

/**
 * Returns raw default values for a section (plain JS values, not stored format).
 */
export function getDefaultContentForSection(sectionKey) {
  return DEFAULT_CONTENT[sectionKey] ?? null;
}

/**
 * Returns the full default content map with createEntry wrappers.
 */
export function createDefaultSiteContent() {
  const result = {};
  for (const [sectionKey, sectionData] of Object.entries(DEFAULT_CONTENT)) {
    result[sectionKey] = {};
    for (const [key, value] of Object.entries(sectionData)) {
      result[sectionKey][key] = createEntry(value);
    }
  }
  return result;
}

function parseStoredValue(raw) {
  if (!raw) return '';
  if (raw.type === 'json') {
    try {
      return typeof raw.value === 'string' ? JSON.parse(raw.value) : raw.value;
    } catch {
      return raw.value ?? null;
    }
  }
  return raw.value ?? '';
}

/**
 * Convert a flat object { key: { value, type } } to parsed values.
 */
export function buildSection(rawSection = {}) {
  return Object.fromEntries(
    Object.entries(rawSection).map(([key, value]) => [key, parseStoredValue(value)]),
  );
}

/**
 * Convert Supabase rows [{section, key, value, type}] into nested { section: { key: parsed } }.
 */
export function buildAllSectionsFromRows(rows = []) {
  const grouped = {};
  for (const row of rows) {
    if (!grouped[row.section]) grouped[row.section] = {};
    grouped[row.section][row.key] = { value: row.value, type: row.type };
  }

  // Merge with defaults for any missing sections/keys
  const defaults = createDefaultSiteContent();
  for (const [sectionKey, sectionDefaults] of Object.entries(defaults)) {
    if (!grouped[sectionKey]) grouped[sectionKey] = {};
    for (const [fieldKey, fieldValue] of Object.entries(sectionDefaults)) {
      if (!grouped[sectionKey][fieldKey]) {
        grouped[sectionKey][fieldKey] = fieldValue;
      }
    }
  }

  const result = {};
  for (const [sectionKey, sectionData] of Object.entries(grouped)) {
    result[sectionKey] = buildSection(sectionData);
  }
  return result;
}

/**
 * Convert Supabase rows for a single section into parsed values, merged with defaults.
 */
export function buildSectionFromRows(sectionKey, rows = []) {
  const rawSection = {};
  for (const row of rows) {
    rawSection[row.key] = { value: row.value, type: row.type };
  }

  // Merge defaults
  const defaults = createDefaultSiteContent();
  const sectionDefaults = defaults[sectionKey] || {};
  for (const [fieldKey, fieldValue] of Object.entries(sectionDefaults)) {
    if (!rawSection[fieldKey]) {
      rawSection[fieldKey] = fieldValue;
    }
  }

  return buildSection(rawSection);
}
