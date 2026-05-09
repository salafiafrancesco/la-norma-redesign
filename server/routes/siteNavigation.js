import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import supabase from '../db/supabase.js';

const router = Router();

// ---------------------------------------------------------------------------
// Public — get full navigation (header + footer) in one call
// ---------------------------------------------------------------------------
router.get('/', async (_req, res) => {
  try {
    const [navResult, colResult, linkResult] = await Promise.all([
      supabase.from('nav_links').select('*').order('sort_order', { ascending: true }),
      supabase.from('footer_columns').select('*').order('sort_order', { ascending: true }),
      supabase.from('footer_column_links').select('*').order('sort_order', { ascending: true }),
    ]);

    if (navResult.error) throw navResult.error;
    if (colResult.error) throw colResult.error;
    if (linkResult.error) throw linkResult.error;

    res.json({
      navLinks: navResult.data || [],
      footerColumns: colResult.data || [],
      footerColumnLinks: linkResult.data || [],
    });
  } catch (error) {
    console.error('[site-navigation/all]', error);
    res.status(500).json({ error: 'Unable to load navigation.' });
  }
});

// ---------------------------------------------------------------------------
// Admin — nav_links CRUD
// ---------------------------------------------------------------------------
router.post('/nav-links', requireAuth, async (req, res) => {
  try {
    const { id: _id, ...row } = req.body;
    const { data, error } = await supabase.from('nav_links').insert(row).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('[site-navigation/nav-links/create]', error);
    res.status(500).json({ error: 'Unable to create nav link.' });
  }
});

router.put('/nav-links/:id', requireAuth, async (req, res) => {
  try {
    const { id: _id, ...row } = req.body;
    const { data, error } = await supabase
      .from('nav_links')
      .update(row)
      .eq('id', Number(req.params.id))
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('[site-navigation/nav-links/update]', error);
    res.status(500).json({ error: 'Unable to update nav link.' });
  }
});

router.delete('/nav-links/:id', requireAuth, async (req, res) => {
  try {
    const { error } = await supabase.from('nav_links').delete().eq('id', Number(req.params.id));
    if (error) throw error;
    res.json({ ok: true });
  } catch (error) {
    console.error('[site-navigation/nav-links/delete]', error);
    res.status(500).json({ error: 'Unable to delete nav link.' });
  }
});

// ---------------------------------------------------------------------------
// Admin — footer_columns CRUD
// ---------------------------------------------------------------------------
router.post('/footer-columns', requireAuth, async (req, res) => {
  try {
    const { id: _id, ...row } = req.body;
    const { data, error } = await supabase.from('footer_columns').insert(row).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('[site-navigation/footer-columns/create]', error);
    res.status(500).json({ error: 'Unable to create footer column.' });
  }
});

router.put('/footer-columns/:id', requireAuth, async (req, res) => {
  try {
    const { id: _id, ...row } = req.body;
    const { data, error } = await supabase
      .from('footer_columns')
      .update(row)
      .eq('id', Number(req.params.id))
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('[site-navigation/footer-columns/update]', error);
    res.status(500).json({ error: 'Unable to update footer column.' });
  }
});

router.delete('/footer-columns/:id', requireAuth, async (req, res) => {
  try {
    const { error } = await supabase.from('footer_columns').delete().eq('id', Number(req.params.id));
    if (error) throw error;
    res.json({ ok: true });
  } catch (error) {
    console.error('[site-navigation/footer-columns/delete]', error);
    res.status(500).json({ error: 'Unable to delete footer column.' });
  }
});

// ---------------------------------------------------------------------------
// Admin — footer_column_links CRUD
// ---------------------------------------------------------------------------
router.post('/footer-column-links', requireAuth, async (req, res) => {
  try {
    const { id: _id, ...row } = req.body;
    const { data, error } = await supabase.from('footer_column_links').insert(row).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('[site-navigation/footer-column-links/create]', error);
    res.status(500).json({ error: 'Unable to create footer link.' });
  }
});

router.put('/footer-column-links/:id', requireAuth, async (req, res) => {
  try {
    const { id: _id, ...row } = req.body;
    const { data, error } = await supabase
      .from('footer_column_links')
      .update(row)
      .eq('id', Number(req.params.id))
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('[site-navigation/footer-column-links/update]', error);
    res.status(500).json({ error: 'Unable to update footer link.' });
  }
});

router.delete('/footer-column-links/:id', requireAuth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('footer_column_links')
      .delete()
      .eq('id', Number(req.params.id));
    if (error) throw error;
    res.json({ ok: true });
  } catch (error) {
    console.error('[site-navigation/footer-column-links/delete]', error);
    res.status(500).json({ error: 'Unable to delete footer link.' });
  }
});

export default router;
