import { useEffect } from 'react';

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      element.setAttribute(key, value);
    }
  });
}

function upsertCanonical(href) {
  let canonical = document.head.querySelector('link[rel="canonical"]');

  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }

  canonical.setAttribute('href', href);
}

function clearStructuredData() {
  document.head
    .querySelectorAll('script[data-page-structured-data="true"]')
    .forEach((node) => node.remove());
}

function setStructuredData(items = []) {
  clearStructuredData();

  items.forEach((item) => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.pageStructuredData = 'true';
    script.textContent = JSON.stringify(item);
    document.head.appendChild(script);
  });
}

export function usePageMetadata({
  title,
  description,
  image,
  imageAlt = 'La Norma hospitality experience',
  robots = 'index,follow',
  type = 'website',
  canonicalUrl,
  structuredData = [],
}) {
  useEffect(() => {
    const pageTitle = title ? `${title} | La Norma` : 'La Norma | Sicilian dining on Longboat Key';
    const currentUrl = canonicalUrl || `${window.location.origin}${window.location.pathname}`;
    const imageUrl = image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80';

    document.title = pageTitle;

    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertMeta('meta[name="robots"]', { name: 'robots', content: robots });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: pageTitle });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: currentUrl });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: imageUrl });
    upsertMeta('meta[property="og:image:alt"]', {
      property: 'og:image:alt',
      content: imageAlt,
    });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: pageTitle });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: imageUrl });
    upsertMeta('meta[name="twitter:image:alt"]', { name: 'twitter:image:alt', content: imageAlt });
    upsertCanonical(currentUrl);
    setStructuredData(structuredData);

    return () => {
      clearStructuredData();
    };
  }, [title, description, image, imageAlt, robots, type, canonicalUrl, structuredData]);
}
