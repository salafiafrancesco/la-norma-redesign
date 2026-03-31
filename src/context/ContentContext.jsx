import { createContext, useContext, useEffect, useState } from 'react';
import API_BASE from '../config/api';
import * as defaults from '../data/content';
import { PAGE_KEYS, buildPageHref, resolveNavigationTarget } from '../../shared/routes.js';

const ContentContext = createContext(null);

function normalizeTextValue(value) {
  return String(value ?? '').trim().toLowerCase();
}

function getExperiencePageKey(item = {}) {
  const signals = [
    item.title,
    item.label,
    item.icon,
    item.cta,
  ]
    .map((value) => normalizeTextValue(value))
    .filter(Boolean)
    .join(' ');

  if (signals.includes('wine')) return PAGE_KEYS.wineTastings;
  if (signals.includes('cook') || signals.includes('class')) return PAGE_KEYS.cookingClasses;
  if (signals.includes('music') || signals.includes('jazz') || signals.includes('acoustic')) return PAGE_KEYS.liveMusic;
  if (signals.includes('private') || signals.includes('event')) return PAGE_KEYS.privateEvents;

  return null;
}

function normalizeInternalContentHref(href, fallbackPageKey = null) {
  const rawHref = String(href ?? '').trim();
  const destination = resolveNavigationTarget(rawHref);

  if (destination.isInternal && destination.pageKey !== PAGE_KEYS.home) {
    return destination.href;
  }

  if ((!rawHref || rawHref.startsWith('#')) && fallbackPageKey) {
    return buildPageHref(fallbackPageKey);
  }

  if (destination.isInternal) {
    return destination.href;
  }

  return fallbackPageKey ? buildPageHref(fallbackPageKey) : rawHref;
}

function getFooterPageKey(item = {}) {
  const signals = [item.label, item.href]
    .map((value) => normalizeTextValue(value))
    .filter(Boolean)
    .join(' ');

  if (signals.includes('menu')) return PAGE_KEYS.menu;
  if (signals.includes('about')) return PAGE_KEYS.about;
  if (signals.includes('faq') || signals.includes('questions')) return PAGE_KEYS.faq;
  if (signals.includes('contact')) return PAGE_KEYS.contact;
  if (signals.includes('journal') || signals.includes('blog')) return PAGE_KEYS.blog;
  if (signals.includes('cooking')) return PAGE_KEYS.cookingClasses;
  if (signals.includes('wine tasting') || signals.includes('wine tastings')) return PAGE_KEYS.wineTastings;
  if (signals.includes('live music')) return PAGE_KEYS.liveMusic;
  if (signals.includes('private event') || signals.includes('private events')) return PAGE_KEYS.privateEvents;

  return null;
}

function resolveUrl(url) {
  if (url?.startsWith('/uploads/')) {
    return `${API_BASE}${url}`;
  }

  return url;
}

function uniqueValues(values = []) {
  return [...new Set(values.filter(Boolean))];
}

const SYSTEM_FOOTER_LINKS = [
  { label: 'Menu', href: buildPageHref(PAGE_KEYS.menu) },
  { label: 'About La Norma', href: buildPageHref(PAGE_KEYS.about) },
  { label: 'Cooking Classes', href: buildPageHref(PAGE_KEYS.cookingClasses) },
  { label: 'Wine Tastings', href: buildPageHref(PAGE_KEYS.wineTastings) },
  { label: 'Private Events', href: buildPageHref(PAGE_KEYS.privateEvents) },
  { label: 'Journal', href: buildPageHref(PAGE_KEYS.blog) },
  { label: 'FAQ', href: buildPageHref(PAGE_KEYS.faq) },
  { label: 'Contact', href: buildPageHref(PAGE_KEYS.contact) },
  { label: 'Privacy Policy', href: buildPageHref(PAGE_KEYS.privacyPolicy) },
];

function transform(api = {}) {
  const restaurantData = api.restaurant || {};
  const linksData = api.links || {};
  const heroData = api.hero || {};
  const storyData = api.story || {};
  const specialtiesData = api.specialties || {};
  const experiencesData = api.experiences || {};
  const menuData = api.menu || {};
  const reservationBannerData = api.reservation_banner || {};
  const orderOnlineData = api.order_online || {};
  const testimonialsData = api.testimonials || {};
  const footerData = api.footer || {};

  const links = {
    reserve: linksData.reserve ?? defaults.links.reserve,
    menuPdf: normalizeInternalContentHref(linksData.menu_pdf ?? defaults.links.menuPdf, PAGE_KEYS.menu),
    orderDelivery: linksData.order_delivery ?? defaults.links.orderDelivery,
    orderPickup: linksData.order_pickup ?? defaults.links.orderPickup,
    giftCards: linksData.gift_cards ?? defaults.links.giftCards,
  };

  const restaurant = {
    name: restaurantData.name ?? defaults.restaurant.name,
    tagline: restaurantData.tagline ?? defaults.restaurant.tagline,
    description: restaurantData.description ?? defaults.restaurant.description,
    address: restaurantData.address ?? defaults.restaurant.address,
    city: restaurantData.city ?? defaults.restaurant.city,
    state: restaurantData.state ?? defaults.restaurant.state,
    zip: restaurantData.zip ?? defaults.restaurant.zip,
    phone: restaurantData.phone ?? defaults.restaurant.phone,
    email: restaurantData.email ?? defaults.restaurant.email,
    hours: restaurantData.hours ?? defaults.restaurant.hours,
    hoursNote: restaurantData.hours_note ?? defaults.restaurant.hoursNote,
    mapEmbedUrl: restaurantData.map_embed_url ?? defaults.restaurant.mapEmbedUrl,
    social: {
      instagram: restaurantData.social_instagram ?? defaults.restaurant.social.instagram,
      facebook: restaurantData.social_facebook ?? defaults.restaurant.social.facebook,
      tripadvisor: restaurantData.social_tripadvisor ?? defaults.restaurant.social.tripadvisor,
      yelp: restaurantData.social_yelp ?? defaults.restaurant.social.yelp,
    },
  };

  const hero = {
    eyebrow: heroData.eyebrow ?? defaults.hero.eyebrow,
    headline: [
      heroData.headline1 ?? defaults.hero.headline[0],
      heroData.headline2 ?? defaults.hero.headline[1],
    ],
    subheadline: heroData.subheadline ?? defaults.hero.subheadline,
    imageUrl: resolveUrl(heroData.image_url ?? defaults.hero.imageUrl),
    imageAlt: heroData.image_alt ?? defaults.hero.imageAlt,
    gallery: uniqueValues([
      resolveUrl(heroData.image_url ?? defaults.hero.imageUrl),
      ...((Array.isArray(heroData.gallery) ? heroData.gallery : defaults.hero.gallery) ?? []).map(resolveUrl),
    ]),
  };

  const story = {
    label: storyData.label ?? defaults.story.label,
    quote: storyData.quote ?? defaults.story.quote,
    body: [
      storyData.body1 ?? defaults.story.body[0],
      storyData.body2 ?? defaults.story.body[1],
    ],
    stat1: {
      value: storyData.stat1_value ?? defaults.story.stat1.value,
      label: storyData.stat1_label ?? defaults.story.stat1.label,
    },
    stat2: {
      value: storyData.stat2_value ?? defaults.story.stat2.value,
      label: storyData.stat2_label ?? defaults.story.stat2.label,
    },
    stat3: {
      value: storyData.stat3_value ?? defaults.story.stat3.value,
      label: storyData.stat3_label ?? defaults.story.stat3.label,
    },
    imageUrl: resolveUrl(storyData.image_url ?? defaults.story.imageUrl),
    imageAlt: storyData.image_alt ?? defaults.story.imageAlt,
  };

  const specialties = (specialtiesData.items ?? defaults.specialties).map((item) => ({
    id: item.id,
    tag: item.tag,
    badge: item.badge || null,
    name: item.name,
    description: item.description,
    price: item.price,
    imageUrl: resolveUrl(item.imageUrl || item.image_url),
    imageAlt: item.imageAlt || item.image_alt,
    featured: Boolean(item.featured),
  }));

  const experiences = (experiencesData.items ?? defaults.experiences).map((item) => ({
    id: item.id,
    icon: item.icon,
    label: item.label,
    title: item.title,
    description: item.description,
    cta: item.cta,
    ctaHref: normalizeInternalContentHref(item.ctaHref || item.cta_href || '', getExperiencePageKey(item)),
  }));

  const menuHighlights = {
    label: menuData.label ?? defaults.menuHighlights.label,
    headline: menuData.headline ?? defaults.menuHighlights.headline,
    note: menuData.note ?? defaults.menuHighlights.note,
    categories: (menuData.categories ?? defaults.menuHighlights.categories).map((category) => ({
      name: category.name || category.title,
      items: (category.items || []).map((item) => ({
        name: item.name,
        desc: item.desc || item.description,
        price: item.price,
      })),
    })),
  };

  const testimonialItems = (testimonialsData.items ?? defaults.testimonials).map((item) => ({
    id: item.id,
    text: item.text || item.quote,
    author: item.author,
    location: item.location,
    source: item.source || 'Guest review',
    rating: item.rating ?? 5,
  }));

  const testimonialSection = {
    label: testimonialsData.label ?? defaults.testimonialSection.label,
    headline: testimonialsData.headline ?? defaults.testimonialSection.headline,
    items: testimonialItems,
  };

  const reservationBanner = {
    headline: reservationBannerData.headline ?? defaults.reservationBanner.headline,
    sub: reservationBannerData.sub ?? defaults.reservationBanner.sub,
    ctaText: reservationBannerData.cta_text ?? defaults.reservationBanner.ctaText,
    note: reservationBannerData.note ?? defaults.reservationBanner.note,
  };

  const orderOnline = {
    eyebrow: orderOnlineData.eyebrow ?? defaults.orderOnline.eyebrow,
    headline: orderOnlineData.headline ?? defaults.orderOnline.headline,
    sub: orderOnlineData.sub ?? defaults.orderOnline.sub,
  };

  const footer = {
    tagline: footerData.tagline ?? defaults.footer.tagline,
  };

  const footerNav = (footerData.nav_items ?? defaults.footerNav).map((item) => ({
    label: item.label,
    href: normalizeInternalContentHref(item.href, getFooterPageKey(item)),
  }));

  SYSTEM_FOOTER_LINKS.forEach((item) => {
    const labelKey = normalizeTextValue(item.label);
    const existingIndex = footerNav.findIndex(
      (entry) => normalizeTextValue(entry.label) === labelKey,
    );

    if (existingIndex >= 0) {
      footerNav[existingIndex] = item;
    } else {
      footerNav.push(item);
    }
  });

  return {
    restaurant,
    links,
    hero,
    story,
    specialties,
    experiences,
    menuHighlights,
    testimonialSection,
    testimonials: testimonialItems,
    reservationBanner,
    orderOnline,
    footer,
    footerNav,
  };
}

export function ContentProvider({ children }) {
  const [content, setContent] = useState(() => transform());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_BASE}/api/content`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to load API content.');
        }

        return response.json();
      })
      .then((data) => {
        if (!cancelled) {
          setContent(transform(data));
        }
      })
      .catch(() => {
        // Static defaults stay in place when the API is unavailable.
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ContentContext.Provider value={{ content, loading }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);

  if (!context) {
    throw new Error('useContent must be used inside ContentProvider.');
  }

  return context;
}

export function useSection(key) {
  const { content } = useContent();
  return content[key];
}
