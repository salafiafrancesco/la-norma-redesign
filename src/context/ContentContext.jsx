/**
 * ContentContext — loads all site content from the API.
 * Falls back to the static content.js if the API is unavailable.
 * Transforms flat API keys into the exact shape expected by components.
 */
import { createContext, useContext, useEffect, useState } from 'react';
import * as S from '../data/content'; // static fallback

const ContentContext = createContext(null);

const _API = import.meta.env.VITE_API_URL ?? '';

// Resolve upload-relative URLs to absolute backend URLs in production
function resolveUrl(url) {
  if (url && url.startsWith('/uploads/')) return _API + url;
  return url;
}

// ── Transform raw API response → component-ready shapes ───────────
function transform(api) {
  const r   = api.restaurant || {};
  const lnk = api.links       || {};
  const h   = api.hero        || {};
  const st  = api.story       || {};
  const sp  = api.specialties || {};
  const exp = api.experiences || {};
  const mn  = api.menu        || {};
  const rb  = api.reservation_banner || {};
  const oo  = api.order_online || {};
  const te  = api.testimonials || {};
  const ft  = api.footer       || {};

  // Derived links object (used by multiple sections)
  const links = {
    reserve:       lnk.reserve       ?? S.links.reserve,
    menuPdf:       lnk.menu_pdf      ?? S.links.menuPdf,
    orderDelivery: lnk.order_delivery ?? S.links.orderDelivery,
    orderPickup:   lnk.order_pickup  ?? S.links.orderPickup,
    giftCards:     lnk.gift_cards    ?? S.links.giftCards,
  };

  const restaurant = {
    name:       r.name       ?? S.restaurant.name,
    tagline:    r.tagline    ?? S.restaurant.tagline,
    description:r.description ?? S.restaurant.description,
    address:    r.address    ?? S.restaurant.address,
    city:       r.city       ?? S.restaurant.city,
    state:      r.state      ?? S.restaurant.state,
    zip:        r.zip        ?? S.restaurant.zip,
    phone:      r.phone      ?? S.restaurant.phone,
    email:      r.email      ?? S.restaurant.email,
    hours:      r.hours      ?? S.restaurant.hours,
    hoursNote:  r.hours_note ?? S.restaurant.hoursNote,
    mapEmbedUrl: r.map_embed_url ?? S.restaurant.mapEmbedUrl,
    social: {
      instagram:   r.social_instagram   ?? S.restaurant.social?.instagram,
      facebook:    r.social_facebook    ?? S.restaurant.social?.facebook,
      tripadvisor: r.social_tripadvisor ?? S.restaurant.social?.tripadvisor,
      yelp:        r.social_yelp        ?? S.restaurant.social?.yelp,
    },
  };

  const hero = {
    eyebrow:     h.eyebrow      ?? S.hero.eyebrow,
    headline:    [h.headline1 ?? S.hero.headline?.[0], h.headline2 ?? S.hero.headline?.[1]],
    subheadline: h.subheadline  ?? S.hero.subheadline,
    imageUrl:    resolveUrl(h.image_url    ?? S.hero.imageUrl),
    imageAlt:    h.image_alt    ?? S.hero.imageAlt,
  };

  const story = {
    label:    st.label    ?? S.story.label,
    quote:    st.quote    ?? S.story.quote,
    body:     [st.body1 ?? S.story.body?.[0], st.body2 ?? S.story.body?.[1]],
    stat1:    { value: st.stat1_value ?? S.story.stat1?.value, label: st.stat1_label ?? S.story.stat1?.label },
    stat2:    { value: st.stat2_value ?? S.story.stat2?.value, label: st.stat2_label ?? S.story.stat2?.label },
    stat3:    { value: st.stat3_value ?? S.story.stat3?.value, label: st.stat3_label ?? S.story.stat3?.label },
    imageUrl: resolveUrl(st.image_url ?? S.story.imageUrl),
    imageAlt: st.image_alt ?? S.story.imageAlt,
  };

  // specialties: array matching static shape
  const specialties = (sp.items ?? S.specialties).map(item => ({
    id:          item.id,
    tag:         item.tag,
    name:        item.name,
    description: item.description,
    price:       item.price,
    imageUrl:    resolveUrl(item.imageUrl    || item.image_url),
    imageAlt:    item.imageAlt    || item.image_alt,
    featured:    item.featured    ?? false,
    badge:       item.badge       || null,
  }));

  // experiences: array
  const experiences = (exp.items ?? S.experiences).map(item => ({
    id:          item.id,
    icon:        item.icon,
    label:       item.label,
    title:       item.title,
    description: item.description,
    cta:         item.cta,
    ctaHref:     item.ctaHref || item.cta_href || '#',
  }));

  // menuHighlights: object with {label, headline, note, categories}
  const apiCategories = mn.categories;
  const staticCategories = S.menuHighlights.categories;
  const categories = (apiCategories ?? staticCategories).map(cat => ({
    name:  cat.name  || cat.title,
    items: (cat.items || []).map(item => ({
      name:  item.name,
      desc:  item.desc || item.description, // normalise field name
      price: item.price,
    })),
  }));

  const menuHighlights = {
    label:      mn.label      ?? S.menuHighlights.label,
    headline:   mn.headline   ?? S.menuHighlights.headline,
    note:       mn.note       ?? S.menuHighlights.note,
    categories,
  };

  // testimonials: array matching static shape
  const testimonials = (te.items ?? S.testimonials).map(item => ({
    id:       item.id,
    text:     item.text   || item.quote, // DB uses 'quote', static uses 'text'
    author:   item.author,
    location: item.location,
    source:   item.source || 'Google Reviews',
    rating:   item.rating ?? 5,
  }));

  // footerNav: array
  const footerNav = (ft.nav_items ?? S.footerNav).map(item => ({
    label: item.label,
    href:  item.href,
  }));

  // Reservation banner
  const reservationBanner = {
    headline: rb.headline  ?? 'A Table Awaits',
    sub:      rb.sub       ?? 'Reserve your evening at La Norma.',
    ctaText:  rb.cta_text  ?? 'Reserve a Table',
    note:     rb.note      ?? '',
  };

  // Order online
  const orderOnline = {
    eyebrow:  oo.eyebrow  ?? "Can\u2019t Make It Tonight?",
    headline: oo.headline ?? 'Bring La Norma Home',
    sub:      oo.sub      ?? 'Our most-loved dishes, packed with care.',
  };

  return {
    restaurant,
    links,
    hero,
    story,
    specialties,
    experiences,
    menuHighlights,
    testimonials,
    footerNav,
    reservationBanner,
    orderOnline,
  };
}

// ── Provider ──────────────────────────────────────────────────────
export function ContentProvider({ children }) {
  const [content, setContent] = useState(() => transform({})); // static fallback immediately
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`${_API}/api/content`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => { if (!cancelled) setContent(transform(data)); })
      .catch(() => { /* keep static fallback silently */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <ContentContext.Provider value={{ content, loading }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used inside ContentProvider');
  return ctx;
}

/** Get a single top-level key from content */
export function useSection(key) {
  const { content } = useContent();
  return content[key];
}
