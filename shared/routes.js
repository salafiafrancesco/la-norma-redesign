export const PAGE_KEYS = {
  home: 'home',
  menu: 'menu',
  about: 'about',
  faq: 'faq',
  contact: 'contact',
  blog: 'blog',
  blogArticle: 'blog-article',
  cookingClasses: 'cooking-classes',
  wineTastings: 'wine-tastings',
  liveMusic: 'live-music',
  privateEvents: 'private-events',
  catering: 'catering',
  privacyPolicy: 'privacy-policy',
  notFound: 'not-found',
};

export const PAGE_PATHS = {
  [PAGE_KEYS.home]: '/',
  [PAGE_KEYS.menu]: '/menu',
  [PAGE_KEYS.about]: '/about',
  [PAGE_KEYS.faq]: '/faq',
  [PAGE_KEYS.contact]: '/contact',
  [PAGE_KEYS.blog]: '/journal',
  [PAGE_KEYS.cookingClasses]: '/cooking-classes',
  [PAGE_KEYS.wineTastings]: '/wine-tastings',
  [PAGE_KEYS.liveMusic]: '/live-music',
  [PAGE_KEYS.privateEvents]: '/private-events',
  [PAGE_KEYS.catering]: '/catering',
  [PAGE_KEYS.privacyPolicy]: '/privacy-policy',
};

const FALLBACK_ORIGIN = 'https://la-norma.local';

const PAGE_ALIASES = {
  [PAGE_KEYS.home]: ['/home'],
  [PAGE_KEYS.menu]: ['/menus'],
  [PAGE_KEYS.about]: ['/our-story'],
  [PAGE_KEYS.faq]: ['/questions', '/faqs'],
  [PAGE_KEYS.contact]: ['/visit-us', '/get-in-touch'],
  [PAGE_KEYS.blog]: ['/blog', '/journal'],
  [PAGE_KEYS.cookingClasses]: ['/cooking-class', '/classes', '/class', '/classi-di-cucina'],
  [PAGE_KEYS.wineTastings]: ['/wine-tasting', '/wine-testing', '/wine', '/tastings'],
  [PAGE_KEYS.liveMusic]: ['/music', '/live', '/live-music-nights'],
  [PAGE_KEYS.privateEvents]: ['/private-event', '/events', '/eventi-privati'],
  [PAGE_KEYS.catering]: ['/catering-services', '/catering-menu'],
  [PAGE_KEYS.privacyPolicy]: ['/privacy'],
};

const BLOG_PATH_PREFIX = `${PAGE_PATHS[PAGE_KEYS.blog]}/`;

function getBaseOrigin() {
  return typeof window !== 'undefined' ? window.location.origin : FALLBACK_ORIGIN;
}

function parseUrlLike(value = '') {
  const rawValue = String(value ?? '').trim();
  if (!rawValue) return null;

  try {
    return new URL(rawValue, getBaseOrigin());
  } catch {
    return null;
  }
}

function normalizePathname(pathname = '/') {
  const rawValue = String(pathname ?? '').trim();
  if (!rawValue) return '/';

  const parsed = parseUrlLike(rawValue);
  const candidate = parsed
    ? parsed.pathname
    : rawValue.split(/[?#]/, 1)[0];
  const withLeadingSlash = candidate.startsWith('/') ? candidate : `/${candidate}`;
  const trimmed = withLeadingSlash.replace(/\/+$/, '');
  return (trimmed || '/').toLowerCase();
}

function normalizeHash(hash = '') {
  return String(hash ?? '').trim().replace(/^#/, '');
}

export function getPageFromPathname(pathname = '/') {
  const normalized = normalizePathname(pathname);

  if (normalized.startsWith(BLOG_PATH_PREFIX) && normalized.length > BLOG_PATH_PREFIX.length) {
    return PAGE_KEYS.blogArticle;
  }

  const match = Object.entries(PAGE_PATHS).find(([, path]) => path === normalized);
  if (match) return match[0];

  const aliasMatch = Object.entries(PAGE_ALIASES).find(([, aliases]) => aliases.includes(normalized));
  return aliasMatch?.[0] ?? PAGE_KEYS.notFound;
}

export function getPathForPage(page) {
  return PAGE_PATHS[page] ?? PAGE_PATHS[PAGE_KEYS.home];
}

export function getAnchorFromHash(hash = '') {
  return normalizeHash(hash);
}

export function buildPageHref(page, anchor = '') {
  const basePath = getPathForPage(page);
  return anchor ? `${basePath}#${anchor}` : basePath;
}

export function getBlogSlugFromPathname(pathname = '/') {
  const normalized = normalizePathname(pathname);

  if (!normalized.startsWith(BLOG_PATH_PREFIX)) {
    return '';
  }

  return normalized.slice(BLOG_PATH_PREFIX.length).split('/')[0];
}

export function buildBlogArticleHref(slug = '', anchor = '') {
  const safeSlug = String(slug ?? '').trim().replace(/^\/+|\/+$/g, '');
  const path = safeSlug ? `${PAGE_PATHS[PAGE_KEYS.blog]}/${safeSlug}` : PAGE_PATHS[PAGE_KEYS.blog];
  return anchor ? `${path}#${anchor}` : path;
}

export function resolveNavigationTarget(href = '') {
  const rawValue = String(href ?? '').trim();

  if (!rawValue) {
    return { pageKey: PAGE_KEYS.home, anchor: '', href: PAGE_PATHS[PAGE_KEYS.home], isInternal: false };
  }

  if (rawValue.startsWith('#')) {
    const anchor = normalizeHash(rawValue);
    const pageFromHash = getPageFromPathname(`/${anchor}`);

    if (pageFromHash !== PAGE_KEYS.notFound && pageFromHash !== PAGE_KEYS.home) {
      return {
        pageKey: pageFromHash,
        anchor: '',
        href: buildPageHref(pageFromHash),
        isInternal: true,
      };
    }

    return {
      pageKey: PAGE_KEYS.home,
      anchor,
      href: buildPageHref(PAGE_KEYS.home, anchor),
      isInternal: true,
    };
  }

  const parsed = parseUrlLike(rawValue);
  const baseOrigin = getBaseOrigin();
  const pageKey = getPageFromPathname(parsed ? parsed.pathname : rawValue);
  const anchor = normalizeHash(parsed?.hash ?? '');
  const pathname = parsed ? normalizePathname(parsed.pathname) : normalizePathname(rawValue);

  if (parsed && /^[a-z]+:/i.test(rawValue) && parsed.origin !== baseOrigin) {
    return {
      pageKey: PAGE_KEYS.notFound,
      anchor: '',
      href: rawValue,
      isInternal: false,
      pathname,
    };
  }

  if (pageKey !== PAGE_KEYS.notFound) {
    return {
      pageKey,
      anchor,
      href:
        pageKey === PAGE_KEYS.blogArticle
          ? (anchor ? `${pathname}#${anchor}` : pathname)
          : buildPageHref(pageKey, anchor),
      isInternal: true,
      pathname,
    };
  }

  return {
    pageKey,
    anchor,
    href: pageKey === PAGE_KEYS.notFound ? rawValue : buildPageHref(pageKey, anchor),
    isInternal: pageKey !== PAGE_KEYS.notFound,
    pathname,
  };
}
