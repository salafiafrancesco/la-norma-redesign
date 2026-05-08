import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import db, { getNextId, save } from '../db/database.js';
import { normalizeBlogPayload, normalizeBlogPost } from '../lib/blog.js';
import { normalizeBoolean, normalizeInteger, normalizeText } from '../lib/validation.js';

const router = Router();

function sortPosts(posts = []) {
  return [...posts].sort((left, right) => {
    const leftDate = left.published_at || left.updated_at || left.created_at;
    const rightDate = right.published_at || right.updated_at || right.created_at;
    return new Date(rightDate) - new Date(leftDate);
  });
}

function matchesFilters(post, query = {}) {
  const category = normalizeText(query.category);
  const tag = normalizeText(query.tag, { lowercase: true });
  const search = normalizeText(query.search, { lowercase: true });

  if (category && normalizeText(post.category) !== category) return false;
  if (tag && !post.tags.some((entry) => normalizeText(entry, { lowercase: true }) === tag)) return false;

  if (search) {
    const haystack = [
      post.title,
      post.excerpt,
      post.body,
      post.category,
      ...post.tags,
    ]
      .join(' ')
      .toLowerCase();

    if (!haystack.includes(search)) return false;
  }

  return true;
}

function serializePublicPost(post) {
  return {
    ...post,
    body: post.body,
  };
}

function serializePostSummary(post) {
  const { body: _BODY, ...summary } = post;
  return summary;
}

function clearFeaturedFlag(exceptId) {
  db.data.blog_posts = db.data.blog_posts.map((entry) => (
    Number(entry.id) === Number(exceptId)
      ? entry
      : { ...entry, featured: false }
  ));
}

router.get('/', (req, res) => {
  let posts = db.data.blog_posts.filter((entry) => entry.status === 'published');

  if (req.query.featured !== undefined) {
    const featured = normalizeBoolean(req.query.featured, false);
    posts = posts.filter((entry) => Boolean(entry.featured) === featured);
  }

  posts = sortPosts(posts.filter((entry) => matchesFilters(entry, req.query)));

  const limit = req.query.limit !== undefined
    ? normalizeInteger(req.query.limit, { min: 1, max: 50, fallback: posts.length || 50 })
    : posts.length;

  res.json(posts.slice(0, limit).map(serializePostSummary));
});

router.get('/all', requireAuth, (req, res) => {
  const status = normalizeText(req.query.status, { lowercase: true });
  let posts = [...db.data.blog_posts];

  if (status) {
    posts = posts.filter((entry) => entry.status === status);
  }

  posts = sortPosts(posts.filter((entry) => matchesFilters(entry, req.query)));
  res.json(posts);
});

router.get('/:slug', (req, res) => {
  const slug = normalizeText(req.params.slug);
  const post = db.data.blog_posts.find((entry) => entry.slug === slug);

  if (!post || post.status !== 'published') {
    return res.status(404).json({ error: 'Blog post not found.' });
  }

  return res.json(serializePublicPost(post));
});

router.post('/', requireAuth, (req, res) => {
  const parsed = normalizeBlogPayload(req.body, db.data.blog_posts);
  if (parsed.error) {
    return res.status(400).json({ error: parsed.error });
  }

  const now = new Date().toISOString();
  const nextEntry = normalizeBlogPost({
    id: getNextId('blog_posts'),
    ...parsed.value,
    published_at:
      parsed.value.status === 'published'
        ? (parsed.value.published_at || now)
        : parsed.value.published_at,
    created_at: now,
    updated_at: now,
  });

  try {
    if (nextEntry.featured) {
      clearFeaturedFlag(nextEntry.id);
    }

    db.data.blog_posts.push(nextEntry);
    save();
    return res.status(201).json(nextEntry);
  } catch (error) {
    console.error('[blog/create]', error.message);
    return res.status(500).json({ error: 'Unable to create the blog post.' });
  }
});

router.put('/:id', requireAuth, (req, res) => {
  const postId = Number(req.params.id);
  const index = db.data.blog_posts.findIndex((entry) => entry.id === postId);

  if (index === -1) {
    return res.status(404).json({ error: 'Blog post not found.' });
  }

  const current = db.data.blog_posts[index];
  const parsed = normalizeBlogPayload(req.body, db.data.blog_posts, { partial: true, currentId: postId });
  if (parsed.error) {
    return res.status(400).json({ error: parsed.error });
  }

  const nextStatus = parsed.value.status ?? current.status;
  const nextPublishedAt =
    nextStatus === 'published'
      ? (parsed.value.published_at || current.published_at || new Date().toISOString())
      : (parsed.value.published_at ?? current.published_at);

  const nextEntry = normalizeBlogPost({
    ...current,
    ...parsed.value,
    id: current.id,
    created_at: current.created_at,
    published_at: nextPublishedAt,
    updated_at: new Date().toISOString(),
  });

  try {
    if (nextEntry.featured) {
      clearFeaturedFlag(nextEntry.id);
    }

    db.data.blog_posts[index] = nextEntry;
    save();
    return res.json(nextEntry);
  } catch (error) {
    console.error('[blog/update]', error.message);
    return res.status(500).json({ error: 'Unable to update the blog post.' });
  }
});

router.delete('/:id', requireAuth, (req, res) => {
  const postId = Number(req.params.id);
  const index = db.data.blog_posts.findIndex((entry) => entry.id === postId);

  if (index === -1) {
    return res.status(404).json({ error: 'Blog post not found.' });
  }

  try {
    db.data.blog_posts.splice(index, 1);
    save();
    return res.json({ message: 'Blog post deleted.' });
  } catch (error) {
    console.error('[blog/delete]', error.message);
    return res.status(500).json({ error: 'Unable to delete the blog post.' });
  }
});

export default router;
