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
  if (signals.includes('catering')) return PAGE_KEYS.catering;

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
  { label: 'Catering', href: buildPageHref(PAGE_KEYS.catering) },
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
  const cateringData = api.catering || {};
  const footerData = api.footer || {};
  const generalData = api.general || {};
  const cookingClassesPageData = api.cookingClassesPage || {};
  const wineTastingsPageData = api.wineTastingsPage || {};
  const liveMusicPageData = api.liveMusicPage || {};
  const aboutPageData = api.aboutPage || {};
  const faqPageData = api.faqPage || {};
  const menuPageData = api.menuPage || {};
  const contactPageData = api.contactPage || {};
  const privateEventsPageData = api.privateEventsPage || {};

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
    videoUrl: heroData.video_url ? resolveUrl(heroData.video_url) : '',
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

  const d = defaults.catering;
  const cateringContent = {
    // Hero
    heroEyebrow: cateringData.hero_eyebrow ?? d.hero_eyebrow,
    heroTitle: cateringData.hero_title ?? d.hero_title,
    heroSubtitle: cateringData.hero_subtitle ?? d.hero_subtitle,
    heroSub: cateringData.hero_sub ?? d.hero_sub,
    heroImageUrl: resolveUrl(cateringData.hero_image_url ?? d.hero_image_url),
    heroStats: cateringData.hero_stats ?? d.hero_stats,
    // Statement
    statementEyebrow: cateringData.statement_eyebrow ?? d.statement_eyebrow,
    statementHeading: cateringData.statement_heading ?? d.statement_heading,
    statementBody: cateringData.statement_body ?? d.statement_body,
    statementImageUrl: resolveUrl(cateringData.statement_image_url ?? d.statement_image_url),
    statementHighlights: cateringData.statement_highlights ?? d.statement_highlights,
    // Yacht
    yachtEyebrow: cateringData.yacht_eyebrow ?? d.yacht_eyebrow,
    yachtHeading: cateringData.yacht_heading ?? d.yacht_heading,
    yachtBody: cateringData.yacht_body ?? d.yacht_body,
    yachtImageUrl: resolveUrl(cateringData.yacht_image_url ?? d.yacht_image_url),
    yachtSidePanel: cateringData.yacht_side_panel ?? d.yacht_side_panel,
    yachtCtaLabel: cateringData.yacht_cta_label ?? d.yacht_cta_label,
    // Menu gallery
    menuGalleryHeading: cateringData.menu_gallery_heading ?? d.menu_gallery_heading,
    menuGallerySubheading: cateringData.menu_gallery_subheading ?? d.menu_gallery_subheading,
    // Process
    processHeading: cateringData.process_heading ?? d.process_heading,
    // Portfolio
    portfolioHeading: cateringData.portfolio_heading ?? d.portfolio_heading,
    portfolioSubheading: cateringData.portfolio_subheading ?? d.portfolio_subheading,
    // Testimonials
    testimonialsHeading: cateringData.testimonials_heading ?? d.testimonials_heading,
    // FAQ
    faqHeading: cateringData.faq_heading ?? d.faq_heading,
    // CTA
    ctaEyebrow: cateringData.cta_eyebrow ?? d.cta_eyebrow,
    ctaHeading: cateringData.cta_heading ?? d.cta_heading,
    ctaSub: cateringData.cta_sub ?? d.cta_sub,
    // Contact
    contactPhone: cateringData.contact_phone ?? d.contact_phone,
    contactEmail: cateringData.contact_email ?? d.contact_email,
    contactWebsite: cateringData.contact_website ?? d.contact_website,
    // SEO
    seoTitle: cateringData.seo_title ?? d.seo_title,
    seoDescription: cateringData.seo_description ?? d.seo_description,
    seoOgImageUrl: resolveUrl(cateringData.seo_og_image_url ?? d.seo_og_image_url),
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

  const general = {
    hoursWeekly: Array.isArray(generalData.hoursWeekly) && generalData.hoursWeekly.length
      ? generalData.hoursWeekly
      : defaults.general.hoursWeekly,
    schemaOrg: { ...defaults.general.schemaOrg, ...(generalData.schemaOrg || {}) },
  };

  // Page-level CMS sections — merge API data over hardcoded defaults.
  // For nested objects we shallow-merge; for arrays we replace iff the API
  // version is non-empty, otherwise we keep the default array.
  const mergeArrayOrDefault = (apiValue, fallback) =>
    Array.isArray(apiValue) && apiValue.length > 0 ? apiValue : fallback;

  const buildExperiencePage = (apiData, fallback) => ({
    description: apiData.description || fallback.description,
    hero: { ...fallback.hero, ...(apiData.hero || {}), stats: mergeArrayOrDefault(apiData.hero?.stats, fallback.hero.stats) },
    booking_copy: { ...fallback.booking_copy, ...(apiData.booking_copy || {}) },
    includes_section: fallback.includes_section
      ? { ...fallback.includes_section, ...(apiData.includes_section || {}), items: mergeArrayOrDefault(apiData.includes_section?.items, fallback.includes_section.items) }
      : undefined,
    expect_section: fallback.expect_section
      ? {
          ...fallback.expect_section,
          ...(apiData.expect_section || {}),
          items: mergeArrayOrDefault(apiData.expect_section?.items, fallback.expect_section.items),
          suited_for: mergeArrayOrDefault(apiData.expect_section?.suited_for, fallback.expect_section.suited_for),
        }
      : undefined,
    testimonials: fallback.testimonials ? mergeArrayOrDefault(apiData.testimonials, fallback.testimonials) : undefined,
    faq_section: { ...fallback.faq_section, ...(apiData.faq_section || {}), items: mergeArrayOrDefault(apiData.faq_section?.items, fallback.faq_section.items) },
    cta: { ...fallback.cta, ...(apiData.cta || {}) },
  });

  const cookingClassesPage = buildExperiencePage(cookingClassesPageData, defaults.cookingClassesPage);
  const wineTastingsPage = buildExperiencePage(wineTastingsPageData, defaults.wineTastingsPage);
  const liveMusicPage = buildExperiencePage(liveMusicPageData, defaults.liveMusicPage);

  const aboutPage = {
    hero: { ...defaults.aboutPage.hero, ...(aboutPageData.hero || {}) },
    values: mergeArrayOrDefault(aboutPageData.values, defaults.aboutPage.values),
    next_steps: { ...defaults.aboutPage.next_steps, ...(aboutPageData.next_steps || {}) },
  };

  const faqPage = {
    hero: { ...defaults.faqPage.hero, ...(faqPageData.hero || {}) },
    items: mergeArrayOrDefault(faqPageData.items, defaults.faqPage.items),
    editorial: { ...defaults.faqPage.editorial, ...(faqPageData.editorial || {}) },
  };

  const menuPage = {
    description: menuPageData.description || defaults.menuPage.description,
    hero: {
      ...defaults.menuPage.hero,
      ...(menuPageData.hero || {}),
      stats: mergeArrayOrDefault(menuPageData.hero?.stats, defaults.menuPage.hero.stats),
    },
    support: { ...defaults.menuPage.support, ...(menuPageData.support || {}) },
  };

  const contactPage = {
    hero: { ...defaults.contactPage.hero, ...(contactPageData.hero || {}) },
    details_title: contactPageData.details_title || defaults.contactPage.details_title,
    info_cards: {
      ...defaults.contactPage.info_cards,
      ...(contactPageData.info_cards || {}),
      intent_lines: mergeArrayOrDefault(contactPageData.info_cards?.intent_lines, defaults.contactPage.info_cards.intent_lines),
    },
    form: { ...defaults.contactPage.form, ...(contactPageData.form || {}) },
    support: {
      ...defaults.contactPage.support,
      ...(contactPageData.support || {}),
      items: mergeArrayOrDefault(contactPageData.support?.items, defaults.contactPage.support.items),
    },
  };

  const privateEventsPage = {
    meta: { ...defaults.privateEventsPage.meta, ...(privateEventsPageData.meta || {}) },
    hero: { ...defaults.privateEventsPage.hero, ...(privateEventsPageData.hero || {}) },
    manifesto: { ...defaults.privateEventsPage.manifesto, ...(privateEventsPageData.manifesto || {}) },
    formats: {
      ...defaults.privateEventsPage.formats,
      ...(privateEventsPageData.formats || {}),
      items: mergeArrayOrDefault(privateEventsPageData.formats?.items, defaults.privateEventsPage.formats.items),
    },
    curate: {
      ...defaults.privateEventsPage.curate,
      ...(privateEventsPageData.curate || {}),
      items: mergeArrayOrDefault(privateEventsPageData.curate?.items, defaults.privateEventsPage.curate.items),
    },
    form: {
      ...defaults.privateEventsPage.form,
      ...(privateEventsPageData.form || {}),
      progress_labels: mergeArrayOrDefault(privateEventsPageData.form?.progress_labels, defaults.privateEventsPage.form.progress_labels),
      guest_options: mergeArrayOrDefault(privateEventsPageData.form?.guest_options, defaults.privateEventsPage.form.guest_options),
      occasion_options: mergeArrayOrDefault(privateEventsPageData.form?.occasion_options, defaults.privateEventsPage.form.occasion_options),
    },
    testimonials: {
      ...defaults.privateEventsPage.testimonials,
      ...(privateEventsPageData.testimonials || {}),
      items: mergeArrayOrDefault(privateEventsPageData.testimonials?.items, defaults.privateEventsPage.testimonials.items),
    },
    faq: {
      ...defaults.privateEventsPage.faq,
      ...(privateEventsPageData.faq || {}),
      items: mergeArrayOrDefault(privateEventsPageData.faq?.items, defaults.privateEventsPage.faq.items),
    },
    invitation: { ...defaults.privateEventsPage.invitation, ...(privateEventsPageData.invitation || {}) },
  };

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
    catering: cateringContent,
    footer,
    footerNav,
    general,
    cookingClassesPage,
    wineTastingsPage,
    liveMusicPage,
    aboutPage,
    faqPage,
    menuPage,
    contactPage,
    privateEventsPage,
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
