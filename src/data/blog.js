import API_BASE from '../config/api';
import { DEFAULT_BLOG_POSTS } from '../../shared/blogDefaults.js';

function toIsoDate(value) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

export function normalizeBlogPost(post = {}) {
  return {
    id: Number(post.id) || 0,
    title: String(post.title ?? '').trim(),
    slug: String(post.slug ?? '').trim(),
    excerpt: String(post.excerpt ?? '').trim(),
    body: String(post.body ?? '').trim(),
    category: String(post.category ?? 'Journal').trim(),
    tags: Array.isArray(post.tags) ? post.tags.filter(Boolean) : [],
    authorName: String(post.author_name ?? post.authorName ?? 'La Norma Editorial Team').trim(),
    coverImage: String(post.cover_image ?? post.coverImage ?? '').trim(),
    coverImageAlt: String(post.cover_image_alt ?? post.coverImageAlt ?? '').trim(),
    seoTitle: String(post.seo_title ?? post.seoTitle ?? post.title ?? '').trim(),
    seoDescription: String(post.seo_description ?? post.seoDescription ?? post.excerpt ?? '').trim(),
    featured: Boolean(post.featured),
    status: String(post.status ?? 'draft').trim().toLowerCase(),
    publishedAt: toIsoDate(post.published_at ?? post.publishedAt ?? new Date().toISOString()),
    createdAt: toIsoDate(post.created_at ?? post.createdAt ?? post.published_at ?? new Date().toISOString()),
    updatedAt: toIsoDate(post.updated_at ?? post.updatedAt ?? post.published_at ?? new Date().toISOString()),
    readTime: Number(post.read_time ?? post.readTime) || 4,
  };
}

export const fallbackBlogPosts = DEFAULT_BLOG_POSTS
  .map((post) => normalizeBlogPost(post))
  .sort((left, right) => new Date(right.publishedAt) - new Date(left.publishedAt));

export async function fetchBlogPosts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE}/api/blog${qs ? `?${qs}` : ''}`);

  if (!response.ok) {
    throw new Error('Unable to load journal posts.');
  }

  const data = await response.json();
  return (Array.isArray(data) ? data : []).map((post) => normalizeBlogPost(post));
}

export async function fetchBlogPost(slug) {
  const response = await fetch(`${API_BASE}/api/blog/${slug}`);

  if (!response.ok) {
    throw new Error('Unable to load this journal entry.');
  }

  const data = await response.json();
  return normalizeBlogPost(data);
}
