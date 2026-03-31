import {
  isPlainObject,
  normalizeBoolean,
  normalizeOptionalText,
  normalizeText,
} from './validation.js';

export const BLOG_STATUSES = new Set(['draft', 'published']);

function collapseWhitespace(value = '') {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function normalizeDateTime(value) {
  const rawValue = normalizeText(value);
  if (!rawValue) return '';

  const parsed = new Date(rawValue);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString();
}

export function slugifyBlogText(value) {
  const normalized = normalizeText(value, { lowercase: true })
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || 'untitled-post';
}

export function normalizeStringList(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.map((entry) => collapseWhitespace(entry)).filter(Boolean))];
  }

  if (typeof value === 'string') {
    return [...new Set(value.split(',').map((entry) => collapseWhitespace(entry)).filter(Boolean))];
  }

  return [];
}

export function bodyToPlainText(body = '') {
  return collapseWhitespace(
    String(body ?? '')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/^-+\s+/gm, '')
      .replace(/^>\s+/gm, '')
      .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
      .replace(/[*_`~]/g, ' '),
  );
}

export function buildExcerpt(body = '', fallback = '', maxLength = 170) {
  const source = collapseWhitespace(fallback) || bodyToPlainText(body);
  if (source.length <= maxLength) return source;
  return `${source.slice(0, maxLength).replace(/\s+\S*$/, '')}...`;
}

export function estimateReadingTime(body = '') {
  const wordCount = bodyToPlainText(body).split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.ceil(wordCount / 220));
}

export function normalizeBlogPost(entry = {}) {
  const status = BLOG_STATUSES.has(entry.status) ? entry.status : 'draft';
  const publishedAt = normalizeDateTime(entry.published_at);
  const body = normalizeOptionalText(entry.body);

  return {
    id: Number(entry.id) || 0,
    title: normalizeText(entry.title),
    slug: slugifyBlogText(entry.slug || entry.title),
    excerpt: buildExcerpt(body, entry.excerpt),
    body,
    category: normalizeText(entry.category, { fallback: 'Journal' }),
    tags: normalizeStringList(entry.tags),
    author_name: normalizeText(entry.author_name, { fallback: 'La Norma Editorial Team' }),
    cover_image: normalizeOptionalText(entry.cover_image),
    cover_image_alt: normalizeOptionalText(entry.cover_image_alt),
    seo_title: normalizeOptionalText(entry.seo_title) || normalizeText(entry.title),
    seo_description: buildExcerpt(body, entry.seo_description, 160),
    featured: normalizeBoolean(entry.featured, false),
    status,
    published_at: status === 'published' ? (publishedAt || new Date().toISOString()) : publishedAt,
    created_at: normalizeDateTime(entry.created_at) || new Date().toISOString(),
    updated_at: normalizeDateTime(entry.updated_at) || new Date().toISOString(),
    read_time: Number(entry.read_time) || estimateReadingTime(body),
  };
}

export function normalizeBlogPayload(payload, posts = [], { partial = false, currentId = null } = {}) {
  if (!isPlainObject(payload)) {
    return { error: 'Body must be a plain object.' };
  }

  const title = payload.title !== undefined ? normalizeText(payload.title) : '';
  const body = payload.body !== undefined ? normalizeOptionalText(payload.body) : '';
  const status =
    payload.status !== undefined ? normalizeText(payload.status, { lowercase: true }) : '';

  if (!partial && !title) return { error: 'Title is required.' };
  if (!partial && !body) return { error: 'Body is required.' };
  if (payload.title !== undefined && !title) return { error: 'Title is required.' };
  if (payload.body !== undefined && !body) return { error: 'Body is required.' };
  if (status && !BLOG_STATUSES.has(status)) return { error: 'Status must be draft or published.' };

  const nextSlug = slugifyBlogText(payload.slug || title || 'untitled-post');
  const duplicate = posts.find((entry) =>
    entry.slug === nextSlug && Number(entry.id) !== Number(currentId),
  );

  if (duplicate) {
    return { error: 'Another post already uses this slug.' };
  }

  const normalizedBody = payload.body !== undefined ? body : undefined;

  return {
    value: {
      ...(payload.title !== undefined || !partial ? { title } : {}),
      ...(payload.slug !== undefined || payload.title !== undefined || !partial ? { slug: nextSlug } : {}),
      ...(payload.excerpt !== undefined || !partial
        ? { excerpt: buildExcerpt(normalizedBody ?? '', payload.excerpt) }
        : {}),
      ...(payload.body !== undefined || !partial ? { body: normalizedBody ?? body } : {}),
      ...(payload.category !== undefined || !partial
        ? { category: normalizeText(payload.category, { fallback: 'Journal' }) }
        : {}),
      ...(payload.tags !== undefined || !partial ? { tags: normalizeStringList(payload.tags) } : {}),
      ...(payload.author_name !== undefined || !partial
        ? { author_name: normalizeText(payload.author_name, { fallback: 'La Norma Editorial Team' }) }
        : {}),
      ...(payload.cover_image !== undefined || !partial
        ? { cover_image: normalizeOptionalText(payload.cover_image) }
        : {}),
      ...(payload.cover_image_alt !== undefined || !partial
        ? { cover_image_alt: normalizeOptionalText(payload.cover_image_alt) }
        : {}),
      ...(payload.seo_title !== undefined || !partial
        ? { seo_title: normalizeOptionalText(payload.seo_title) || title }
        : {}),
      ...(payload.seo_description !== undefined || !partial
        ? { seo_description: buildExcerpt(normalizedBody ?? '', payload.seo_description, 160) }
        : {}),
      ...(payload.featured !== undefined || !partial
        ? { featured: normalizeBoolean(payload.featured, false) }
        : {}),
      ...(payload.status !== undefined || !partial
        ? { status: BLOG_STATUSES.has(status) ? status : 'draft' }
        : {}),
      ...(payload.published_at !== undefined || !partial
        ? { published_at: normalizeDateTime(payload.published_at) }
        : {}),
    },
  };
}
