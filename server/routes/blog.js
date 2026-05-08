import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import supabase from '../db/supabase.js';
import { normalizeBlogPayload, normalizeBlogPost } from '../lib/blog.js';
import { normalizeBoolean, normalizeInteger, normalizeText } from '../lib/validation.js';

const router = Router();

function serializePostSummary(post) {
  const { body: _BODY, ...summary } = post;
  return summary;
}

router.get('/', async (req, res) => {
  try {
    let query = supabase.from('blog_posts').select('*').eq('status', 'published');

    if (req.query.featured !== undefined) {
      query = query.eq('featured', normalizeBoolean(req.query.featured, false));
    }

    const category = normalizeText(req.query.category);
    if (category) query = query.eq('category', category);

    const tag = normalizeText(req.query.tag, { lowercase: true });
    const search = normalizeText(req.query.search, { lowercase: true });

    query = query.order('published_at', { ascending: false, nullsFirst: false });

    const { data: posts, error } = await query;
    if (error) throw error;

    let filtered = posts || [];

    if (tag) {
      filtered = filtered.filter((p) => p.tags?.some((t) => t.toLowerCase() === tag));
    }
    if (search) {
      filtered = filtered.filter((p) =>
        [p.title, p.excerpt, p.body, p.category, ...(p.tags || [])].join(' ').toLowerCase().includes(search),
      );
    }

    const limit = req.query.limit !== undefined
      ? normalizeInteger(req.query.limit, { min: 1, max: 50, fallback: filtered.length || 50 })
      : filtered.length;

    res.json(filtered.slice(0, limit).map(serializePostSummary));
  } catch (error) {
    console.error('[blog/list]', error);
    res.status(500).json({ error: 'Unable to load blog posts.' });
  }
});

router.get('/all', requireAuth, async (req, res) => {
  try {
    let query = supabase.from('blog_posts').select('*');

    const status = normalizeText(req.query.status, { lowercase: true });
    if (status) query = query.eq('status', status);

    query = query.order('updated_at', { ascending: false, nullsFirst: false });

    const { data: posts, error } = await query;
    if (error) throw error;

    const search = normalizeText(req.query.search, { lowercase: true });
    let filtered = posts || [];
    if (search) {
      filtered = filtered.filter((p) =>
        [p.title, p.excerpt, p.body, p.category, ...(p.tags || [])].join(' ').toLowerCase().includes(search),
      );
    }

    res.json(filtered);
  } catch (error) {
    console.error('[blog/listAll]', error);
    res.status(500).json({ error: 'Unable to load blog posts.' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const slug = normalizeText(req.params.slug);
    const { data: post } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (!post) {
      return res.status(404).json({ error: 'Blog post not found.' });
    }
    return res.json(post);
  } catch (error) {
    console.error('[blog/get]', error);
    return res.status(500).json({ error: 'Unable to load blog post.' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    // Load existing posts for slug validation
    const { data: existing } = await supabase.from('blog_posts').select('slug, id');
    const parsed = normalizeBlogPayload(req.body, existing || []);
    if (parsed.error) {
      return res.status(400).json({ error: parsed.error });
    }

    const now = new Date().toISOString();
    const entry = normalizeBlogPost({
      ...parsed.value,
      published_at: parsed.value.status === 'published' ? (parsed.value.published_at || now) : parsed.value.published_at,
      created_at: now,
      updated_at: now,
    });

    // Remove id so Supabase auto-generates
    const { id: _id, ...insertData } = entry;

    if (insertData.featured) {
      await supabase.from('blog_posts').update({ featured: false }).eq('featured', true);
    }

    const { data: created, error } = await supabase
      .from('blog_posts')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json(created);
  } catch (error) {
    console.error('[blog/create]', error);
    return res.status(500).json({ error: 'Unable to create the blog post.' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const { data: current } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (!current) {
      return res.status(404).json({ error: 'Blog post not found.' });
    }

    const { data: existing } = await supabase.from('blog_posts').select('slug, id');
    const parsed = normalizeBlogPayload(req.body, existing || [], { partial: true, currentId: postId });
    if (parsed.error) {
      return res.status(400).json({ error: parsed.error });
    }

    const nextStatus = parsed.value.status ?? current.status;
    const nextPublishedAt = nextStatus === 'published'
      ? (parsed.value.published_at || current.published_at || new Date().toISOString())
      : (parsed.value.published_at ?? current.published_at);

    const entry = normalizeBlogPost({
      ...current,
      ...parsed.value,
      id: current.id,
      created_at: current.created_at,
      published_at: nextPublishedAt,
      updated_at: new Date().toISOString(),
    });

    if (entry.featured) {
      await supabase.from('blog_posts').update({ featured: false }).eq('featured', true).neq('id', postId);
    }

    const { data: updated, error } = await supabase
      .from('blog_posts')
      .update(entry)
      .eq('id', postId)
      .select()
      .single();

    if (error) throw error;
    return res.json(updated);
  } catch (error) {
    console.error('[blog/update]', error);
    return res.status(500).json({ error: 'Unable to update the blog post.' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const { error, count } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;
    if (count === 0) return res.status(404).json({ error: 'Blog post not found.' });
    return res.json({ message: 'Blog post deleted.' });
  } catch (error) {
    console.error('[blog/delete]', error);
    return res.status(500).json({ error: 'Unable to delete the blog post.' });
  }
});

export default router;
