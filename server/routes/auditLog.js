/**
 * Read-only admin route for the audit log.
 * GET /api/admin-audit-log -> latest 200 entries by default
 *   ?limit=<n> (max 500) — page size
 *   ?username=<u>         — filter by admin username
 *   ?method=POST|PUT|DELETE — filter by HTTP method
 *   ?path=<substr>        — substring match on path
 */
import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import supabase from '../db/supabase.js';

const router = Router();
const DEFAULT_LIMIT = 200;
const MAX_LIMIT = 500;

router.get('/', requireAuth, async (req, res) => {
  try {
    let limit = Number(req.query.limit) || DEFAULT_LIMIT;
    if (!Number.isFinite(limit) || limit <= 0) limit = DEFAULT_LIMIT;
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;

    let query = supabase
      .from('admin_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (req.query.username) query = query.eq('username', String(req.query.username));
    if (req.query.method) query = query.eq('method', String(req.query.method).toUpperCase());
    if (req.query.path) {
      const safe = String(req.query.path).replace(/[\\%_]/g, (m) => `\\${m}`);
      query = query.ilike('path', `%${safe}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('[audit-log/list]', error);
    res.status(500).json({ error: 'Unable to load audit log.' });
  }
});

export default router;
