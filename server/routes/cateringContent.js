import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import supabase from '../db/supabase.js';

const router = Router();

// Table configs for generic CRUD
const TABLES = {
  tiers: 'catering_service_tiers',
  signatures: 'catering_signature_items',
  gallery: 'catering_menu_gallery',
  process: 'catering_process_steps',
  portfolio: 'catering_portfolio_events',
  testimonials: 'catering_testimonials',
  faqs: 'catering_faqs',
};

const ORDER_COLUMN = {
  tiers: 'sort_order',
  signatures: 'sort_order',
  gallery: 'sort_order',
  process: 'step_number',
  portfolio: 'sort_order',
  testimonials: 'sort_order',
  faqs: 'sort_order',
};

// ---------------------------------------------------------------------------
// Public — get all catering page content in one call
// ---------------------------------------------------------------------------
router.get('/all', async (_req, res) => {
  try {
    const results = {};
    for (const [key, table] of Object.entries(TABLES)) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order(ORDER_COLUMN[key], { ascending: true });
      if (error) throw error;
      results[key] = data || [];
    }
    res.json(results);
  } catch (error) {
    console.error('[catering-content/all]', error);
    res.status(500).json({ error: 'Unable to load catering content.' });
  }
});

// ---------------------------------------------------------------------------
// Public — get a single collection
// ---------------------------------------------------------------------------
router.get('/:collection', async (req, res) => {
  const table = TABLES[req.params.collection];
  if (!table) return res.status(404).json({ error: 'Collection not found.' });

  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order(ORDER_COLUMN[req.params.collection], { ascending: true });
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error(`[catering-content/${req.params.collection}]`, error);
    res.status(500).json({ error: 'Unable to load content.' });
  }
});

// ---------------------------------------------------------------------------
// Admin — create item in a collection
// ---------------------------------------------------------------------------
router.post('/:collection', requireAuth, async (req, res) => {
  const table = TABLES[req.params.collection];
  if (!table) return res.status(404).json({ error: 'Collection not found.' });

  try {
    const { id: _id, created_at: _ca, ...row } = req.body;
    const { data, error } = await supabase.from(table).insert(row).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error(`[catering-content/${req.params.collection}/create]`, error);
    res.status(500).json({ error: 'Unable to create item.' });
  }
});

// ---------------------------------------------------------------------------
// Admin — update item
// ---------------------------------------------------------------------------
router.put('/:collection/:id', requireAuth, async (req, res) => {
  const table = TABLES[req.params.collection];
  if (!table) return res.status(404).json({ error: 'Collection not found.' });

  try {
    const { id: _id, created_at: _ca, ...row } = req.body;
    const { data, error } = await supabase
      .from(table)
      .update(row)
      .eq('id', Number(req.params.id))
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(`[catering-content/${req.params.collection}/update]`, error);
    res.status(500).json({ error: 'Unable to update item.' });
  }
});

// ---------------------------------------------------------------------------
// Admin — delete item
// ---------------------------------------------------------------------------
router.delete('/:collection/:id', requireAuth, async (req, res) => {
  const table = TABLES[req.params.collection];
  if (!table) return res.status(404).json({ error: 'Collection not found.' });

  try {
    const { error } = await supabase.from(table).delete().eq('id', Number(req.params.id));
    if (error) throw error;
    res.json({ ok: true });
  } catch (error) {
    console.error(`[catering-content/${req.params.collection}/delete]`, error);
    res.status(500).json({ error: 'Unable to delete item.' });
  }
});

// ---------------------------------------------------------------------------
// Admin — bulk reorder
// ---------------------------------------------------------------------------
router.put('/:collection/reorder', requireAuth, async (req, res) => {
  const table = TABLES[req.params.collection];
  if (!table) return res.status(404).json({ error: 'Collection not found.' });

  const orderCol = ORDER_COLUMN[req.params.collection];
  const items = req.body.items; // [{id, order}]
  if (!Array.isArray(items)) return res.status(400).json({ error: 'Items array required.' });

  try {
    for (const item of items) {
      await supabase.from(table).update({ [orderCol]: item.order }).eq('id', item.id);
    }
    res.json({ ok: true });
  } catch (error) {
    console.error(`[catering-content/${req.params.collection}/reorder]`, error);
    res.status(500).json({ error: 'Unable to reorder items.' });
  }
});

export default router;
