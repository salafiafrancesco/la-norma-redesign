import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import supabase from '../db/supabase.js';
import {
  CONTENT_SECTION_MAP,
  CONTENT_SECTION_KEYS,
} from '../../shared/contentSchema.js';
import {
  buildAllSectionsFromRows,
  buildSectionFromRows,
} from '../lib/siteContent.js';
import { isPlainObject } from '../lib/validation.js';

const router = Router();

function getSectionConfig(sectionKey) {
  return CONTENT_SECTION_MAP[sectionKey] ?? null;
}

function storeValue(value) {
  const isJson = typeof value === 'object' && value !== null;
  return {
    value: isJson ? JSON.stringify(value) : String(value ?? ''),
    type: isJson ? 'json' : 'text',
  };
}

const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

function validatePayload(sectionConfig, payload) {
  if (!isPlainObject(payload)) return 'Body must be a plain object.';

  if (sectionConfig.editor === 'fields') {
    const allowedKeys = new Set(sectionConfig.fields.map((field) => field.key));
    const invalidKey = Object.keys(payload).find((key) => !allowedKeys.has(key));
    if (invalidKey) return `Field "${invalidKey}" is not valid for the ${sectionConfig.label} section.`;
  }

  // Theme section: enforce 3/6/8-digit hex color tokens server-side. The
  // client-side editor already validates, but trusting the client alone is
  // not enough since the values are injected as CSS custom properties.
  if (sectionConfig.key === 'theme') {
    for (const [key, value] of Object.entries(payload)) {
      if (typeof value !== 'string' || !HEX_COLOR.test(value)) {
        return `Theme color "${key}" must be a hex value like #RRGGBB.`;
      }
    }
  }

  return '';
}

router.get('/', async (_req, res) => {
  try {
    const { data: rows, error } = await supabase
      .from('site_content')
      .select('*');

    if (error) throw error;

    const allSections = buildAllSectionsFromRows(rows || []);
    const ordered = Object.fromEntries(
      CONTENT_SECTION_KEYS.map((key) => [key, allSections[key] ?? {}]),
    );

    res.json(ordered);
  } catch (error) {
    console.error('[content/getAll]', error);
    res.status(500).json({ error: 'Unable to load content.' });
  }
});

router.get('/:section', async (req, res) => {
  const sectionConfig = getSectionConfig(req.params.section);
  if (!sectionConfig) {
    return res.status(404).json({ error: 'Content section not found.' });
  }

  try {
    const { data: rows, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('section', req.params.section);

    if (error) throw error;
    res.json(buildSectionFromRows(req.params.section, rows || []));
  } catch (error) {
    console.error('[content/getSection]', error);
    res.status(500).json({ error: 'Unable to load content section.' });
  }
});

router.put('/:section', requireAuth, async (req, res) => {
  const sectionKey = req.params.section;
  const sectionConfig = getSectionConfig(sectionKey);
  if (!sectionConfig) {
    return res.status(404).json({ error: 'Content section not found.' });
  }

  const validationError = validatePayload(sectionConfig, req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    // Upsert each key-value pair
    const rows = Object.entries(req.body).map(([key, value]) => ({
      section: sectionKey,
      key,
      ...storeValue(value),
    }));

    const { error: upsertError } = await supabase
      .from('site_content')
      .upsert(rows, { onConflict: 'section,key' });

    if (upsertError) throw upsertError;

    // Return updated section
    const { data: updatedRows } = await supabase
      .from('site_content')
      .select('*')
      .eq('section', sectionKey);

    res.json(buildSectionFromRows(sectionKey, updatedRows || []));
  } catch (error) {
    console.error('[content/update]', error);
    res.status(500).json({ error: 'Unable to save content changes.' });
  }
});

export default router;
