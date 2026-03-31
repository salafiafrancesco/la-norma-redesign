import { siteDefaults } from '../../shared/siteDefaults.js';

function createEntry(value, type = typeof value === 'object' && value !== null ? 'json' : 'text') {
  return {
    value: type === 'json' ? JSON.stringify(value) : String(value ?? ''),
    type,
  };
}

export function createDefaultSiteContent() {
  return {
    restaurant: {
      name: createEntry(siteDefaults.restaurant.name),
      tagline: createEntry(siteDefaults.restaurant.tagline),
      description: createEntry(siteDefaults.restaurant.description),
      address: createEntry(siteDefaults.restaurant.address),
      city: createEntry(siteDefaults.restaurant.city),
      state: createEntry(siteDefaults.restaurant.state),
      zip: createEntry(siteDefaults.restaurant.zip),
      phone: createEntry(siteDefaults.restaurant.phone),
      email: createEntry(siteDefaults.restaurant.email),
      hours: createEntry(siteDefaults.restaurant.hours),
      hours_note: createEntry(siteDefaults.restaurant.hoursNote),
      map_embed_url: createEntry(siteDefaults.restaurant.mapEmbedUrl),
      social_instagram: createEntry(siteDefaults.restaurant.social.instagram),
      social_facebook: createEntry(siteDefaults.restaurant.social.facebook),
      social_tripadvisor: createEntry(siteDefaults.restaurant.social.tripadvisor),
      social_yelp: createEntry(siteDefaults.restaurant.social.yelp),
    },
    links: {
      reserve: createEntry(siteDefaults.links.reserve),
      menu_pdf: createEntry(siteDefaults.links.menuPdf),
      order_delivery: createEntry(siteDefaults.links.orderDelivery),
      order_pickup: createEntry(siteDefaults.links.orderPickup),
      gift_cards: createEntry(siteDefaults.links.giftCards),
    },
    hero: {
      eyebrow: createEntry(siteDefaults.hero.eyebrow),
      headline1: createEntry(siteDefaults.hero.headline[0]),
      headline2: createEntry(siteDefaults.hero.headline[1]),
      subheadline: createEntry(siteDefaults.hero.subheadline),
      image_url: createEntry(siteDefaults.hero.imageUrl),
      image_alt: createEntry(siteDefaults.hero.imageAlt),
    },
    story: {
      label: createEntry(siteDefaults.story.label),
      quote: createEntry(siteDefaults.story.quote),
      body1: createEntry(siteDefaults.story.body[0]),
      body2: createEntry(siteDefaults.story.body[1]),
      stat1_value: createEntry(siteDefaults.story.stat1.value),
      stat1_label: createEntry(siteDefaults.story.stat1.label),
      stat2_value: createEntry(siteDefaults.story.stat2.value),
      stat2_label: createEntry(siteDefaults.story.stat2.label),
      stat3_value: createEntry(siteDefaults.story.stat3.value),
      stat3_label: createEntry(siteDefaults.story.stat3.label),
      image_url: createEntry(siteDefaults.story.imageUrl),
      image_alt: createEntry(siteDefaults.story.imageAlt),
    },
    specialties: {
      items: createEntry(siteDefaults.specialties, 'json'),
    },
    experiences: {
      items: createEntry(siteDefaults.experiences, 'json'),
    },
    menu: {
      label: createEntry(siteDefaults.menuHighlights.label),
      headline: createEntry(siteDefaults.menuHighlights.headline),
      note: createEntry(siteDefaults.menuHighlights.note),
      categories: createEntry(siteDefaults.menuHighlights.categories, 'json'),
    },
    testimonials: {
      label: createEntry(siteDefaults.testimonialSection.label),
      headline: createEntry(siteDefaults.testimonialSection.headline),
      items: createEntry(siteDefaults.testimonialSection.items, 'json'),
    },
    reservation_banner: {
      headline: createEntry(siteDefaults.reservationBanner.headline),
      sub: createEntry(siteDefaults.reservationBanner.sub),
      cta_text: createEntry(siteDefaults.reservationBanner.ctaText),
      note: createEntry(siteDefaults.reservationBanner.note),
    },
    order_online: {
      eyebrow: createEntry(siteDefaults.orderOnline.eyebrow),
      headline: createEntry(siteDefaults.orderOnline.headline),
      sub: createEntry(siteDefaults.orderOnline.sub),
    },
    footer: {
      tagline: createEntry(siteDefaults.footer.tagline),
      nav_items: createEntry(siteDefaults.footer.navItems, 'json'),
    },
  };
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

export function buildSection(rawSection = {}) {
  return Object.fromEntries(
    Object.entries(rawSection).map(([key, value]) => [key, parseStoredValue(value)]),
  );
}

export function buildAllSections(siteContent = {}) {
  return Object.fromEntries(
    Object.entries(siteContent).map(([sectionKey, sectionValue]) => [
      sectionKey,
      buildSection(sectionValue),
    ]),
  );
}

export function mergeSiteContentDefaults(currentContent = {}) {
  const defaults = createDefaultSiteContent();

  for (const [sectionKey, sectionDefaults] of Object.entries(defaults)) {
    if (!currentContent[sectionKey] || typeof currentContent[sectionKey] !== 'object') {
      currentContent[sectionKey] = {};
    }

    for (const [fieldKey, fieldValue] of Object.entries(sectionDefaults)) {
      if (!currentContent[sectionKey][fieldKey]) {
        currentContent[sectionKey][fieldKey] = fieldValue;
      }
    }
  }

  return currentContent;
}

export function createStoredSection(sectionData = {}) {
  return Object.fromEntries(
    Object.entries(sectionData).map(([key, value]) => [
      key,
      createEntry(value),
    ]),
  );
}
