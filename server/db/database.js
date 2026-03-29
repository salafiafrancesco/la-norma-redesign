/**
 * database.js — zero-dependency JSON file store
 * All data lives in server/data/db.json (human-readable, auto-created)
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR  = join(__dirname, '..', 'data');
const DB_PATH   = join(DATA_DIR, 'db.json');

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

const DEFAULTS = {
  admin_users:     [],
  site_content:    {},   // { section: { key: { value, type } } }
  cooking_classes: [],
  rsvp:            [],
  events:          [],
  inquiries:       [],
};

// Load existing db or initialise from defaults
const db = {
  data: existsSync(DB_PATH)
    ? JSON.parse(readFileSync(DB_PATH, 'utf-8'))
    : { ...DEFAULTS },
};

export function save() {
  writeFileSync(DB_PATH, JSON.stringify(db.data, null, 2));
}

export function getNextId(collection) {
  const items = db.data[collection];
  if (!Array.isArray(items) || items.length === 0) return 1;
  return Math.max(...items.map(i => i.id || 0)) + 1;
}

export default db;
