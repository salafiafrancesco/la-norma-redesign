import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import db, { save } from '../db/database.js';
import {
  CONTENT_SECTION_MAP,
  CONTENT_SECTION_KEYS,
} from '../../shared/contentSchema.js';
import {
  buildAllSections,
  buildSection,
  mergeSiteContentDefaults,
} from '../lib/siteContent.js';
import { isPlainObject } from '../lib/validation.js';

const router = Router();

function getSectionConfig(sectionKey) {
  return CONTENT_SECTION_MAP[sectionKey] ?? null;
}

function storeValue(value) {
  const isJsonValue = typeof value === 'object' && value !== null;
  return {
    value: isJsonValue ? JSON.stringify(value) : String(value ?? ''),
    type: isJsonValue ? 'json' : 'text',
  };
}

function validatePayload(sectionConfig, payload) {
  if (!isPlainObject(payload)) return 'Body must be a plain object.';

  if (sectionConfig.editor === 'fields') {
    const allowedKeys = new Set(sectionConfig.fields.map((field) => field.key));
    const invalidKey = Object.keys(payload).find((key) => !allowedKeys.has(key));
    if (invalidKey) return `Field "${invalidKey}" is not valid for the ${sectionConfig.label} section.`;
  }

  return '';
}

router.get('/', (_req, res) => {
  if (!isPlainObject(db.data.site_content)) db.data.site_content = {};
  mergeSiteContentDefaults(db.data.site_content);

  const allSections = buildAllSections(db.data.site_content);
  const ordered = Object.fromEntries(
    CONTENT_SECTION_KEYS.map((key) => [key, allSections[key] ?? {}]),
  );

  res.json(ordered);
});

router.get('/:section', (req, res) => {
  const sectionConfig = getSectionConfig(req.params.section);
  if (!sectionConfig) {
    return res.status(404).json({ error: 'Content section not found.' });
  }

  if (!isPlainObject(db.data.site_content)) db.data.site_content = {};
  mergeSiteContentDefaults(db.data.site_content);

  res.json(buildSection(db.data.site_content[req.params.section] ?? {}));
});

router.put('/:section', requireAuth, (req, res) => {
  const sectionConfig = getSectionConfig(req.params.section);
  if (!sectionConfig) {
    return res.status(404).json({ error: 'Content section not found.' });
  }

  const validationError = validatePayload(sectionConfig, req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  if (!isPlainObject(db.data.site_content)) db.data.site_content = {};
  if (!isPlainObject(db.data.site_content[req.params.section])) {
    db.data.site_content[req.params.section] = {};
  }

  try {
    Object.entries(req.body).forEach(([key, value]) => {
      db.data.site_content[req.params.section][key] = storeValue(value);
    });

    save();
    res.json(buildSection(db.data.site_content[req.params.section]));
  } catch (error) {
    console.error('[content/update]', error.message);
    res.status(500).json({ error: 'Unable to save content changes.' });
  }
});

export default router;
