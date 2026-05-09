import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import supabase from '../db/supabase.js';
import { isValidEmail, normalizeText } from '../lib/validation.js';

const router = Router();

const TABLES = {
  stats: 'homepage_signature_stats',
  beyond: 'homepage_beyond_cards',
  aggregators: 'homepage_voices_aggregators',
  quotes: 'homepage_voices_quotes',
  visitNotes: 'homepage_visit_notes',
};

// ---------------------------------------------------------------------------
// Public — get all homepage dynamic collections
// ---------------------------------------------------------------------------
router.get('/all', async (_req, res) => {
  try {
    const results = {};
    for (const [key, table] of Object.entries(TABLES)) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      results[key] = data || [];
    }
    res.json(results);
  } catch (error) {
    console.error('[homepage-content/all]', error);
    res.status(500).json({ error: 'Unable to load homepage content.' });
  }
});

// ---------------------------------------------------------------------------
// Public — get single collection
// ---------------------------------------------------------------------------
router.get('/:collection', async (req, res) => {
  const table = TABLES[req.params.collection];
  if (!table) return res.status(404).json({ error: 'Collection not found.' });

  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error(`[homepage-content/${req.params.collection}]`, error);
    res.status(500).json({ error: 'Unable to load content.' });
  }
});

// ---------------------------------------------------------------------------
// Admin — CRUD for any collection
// ---------------------------------------------------------------------------
router.post('/:collection', requireAuth, async (req, res) => {
  const table = TABLES[req.params.collection];
  if (!table) return res.status(404).json({ error: 'Collection not found.' });

  try {
    const { id: _id, ...row } = req.body;
    const { data, error } = await supabase.from(table).insert(row).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error(`[homepage-content/${req.params.collection}/create]`, error);
    res.status(500).json({ error: 'Unable to create item.' });
  }
});

router.put('/:collection/:id', requireAuth, async (req, res) => {
  const table = TABLES[req.params.collection];
  if (!table) return res.status(404).json({ error: 'Collection not found.' });

  try {
    const { id: _id, ...row } = req.body;
    const { data, error } = await supabase
      .from(table)
      .update(row)
      .eq('id', Number(req.params.id))
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(`[homepage-content/${req.params.collection}/update]`, error);
    res.status(500).json({ error: 'Unable to update item.' });
  }
});

router.delete('/:collection/:id', requireAuth, async (req, res) => {
  const table = TABLES[req.params.collection];
  if (!table) return res.status(404).json({ error: 'Collection not found.' });

  try {
    const { error } = await supabase.from(table).delete().eq('id', Number(req.params.id));
    if (error) throw error;
    res.json({ ok: true });
  } catch (error) {
    console.error(`[homepage-content/${req.params.collection}/delete]`, error);
    res.status(500).json({ error: 'Unable to delete item.' });
  }
});

// ---------------------------------------------------------------------------
// Public — newsletter subscribe
// ---------------------------------------------------------------------------
router.post('/newsletter/subscribe', async (req, res) => {
  const email = normalizeText(req.body.email, { lowercase: true });
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }

  try {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert({ email, source: 'footer', subscribed_at: new Date().toISOString(), unsubscribed_at: null }, { onConflict: 'email' });

    if (error) throw error;
    res.status(201).json({ ok: true });
  } catch (error) {
    console.error('[newsletter/subscribe]', error);
    res.status(500).json({ error: 'Unable to subscribe.' });
  }
});

// ---------------------------------------------------------------------------
// Admin — list newsletter subscribers
// ---------------------------------------------------------------------------
router.get('/newsletter/subscribers', requireAuth, async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .is('unsubscribed_at', null)
      .order('subscribed_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('[newsletter/list]', error);
    res.status(500).json({ error: 'Unable to load subscribers.' });
  }
});

export default router;
