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
  site_content:    {},
  cooking_classes: [],
  rsvp:            [],
  events:          [],
  inquiries:       [],
};

function loadDb() {
  if (!existsSync(DB_PATH)) return JSON.parse(JSON.stringify(DEFAULTS));
  try {
    const parsed = JSON.parse(readFileSync(DB_PATH, 'utf-8'));
    // Merge with DEFAULTS so any missing collection is always an array/object
    return { ...JSON.parse(JSON.stringify(DEFAULTS)), ...parsed };
  } catch (err) {
    console.error('[db] Failed to parse db.json, starting fresh:', err.message);
    return JSON.parse(JSON.stringify(DEFAULTS));
  }
}

const db = { data: loadDb() };

export function save() {
  try {
    writeFileSync(DB_PATH, JSON.stringify(db.data, null, 2));
  } catch (err) {
    console.error('[db] Failed to write db.json:', err.message);
  }
}

export function getNextId(collection) {
  const items = db.data[collection];
  if (!Array.isArray(items) || items.length === 0) return 1;
  return Math.max(...items.map(i => i.id || 0)) + 1;
}

export default db;
