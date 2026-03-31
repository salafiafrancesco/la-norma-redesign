import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { DB_PATH } from '../config.js';
import { isPlainObject } from '../lib/validation.js';

export const DEFAULT_DB = {
  admin_users: [],
  site_content: {},
  cooking_classes: [],
  rsvp: [],
  events: [],
  inquiries: [],
  blog_posts: [],
};

export function cloneDefaultDb() {
  return JSON.parse(JSON.stringify(DEFAULT_DB));
}

function repairStringEncoding(value) {
  if (typeof value !== 'string' || !/[ÂÃâð]/.test(value)) return value;

  try {
    const repaired = Buffer.from(value, 'latin1').toString('utf8');
    if (repaired && repaired !== value && !repaired.includes('\uFFFD')) {
      return repaired;
    }
  } catch {
    return value;
  }

  return value;
}

function normalizePersistedValue(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => normalizePersistedValue(entry));
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, normalizePersistedValue(entry)]),
    );
  }

  return repairStringEncoding(value);
}

function ensureDbShape(rawData) {
  return {
    ...cloneDefaultDb(),
    ...normalizePersistedValue(rawData),
    admin_users: Array.isArray(rawData?.admin_users) ? normalizePersistedValue(rawData.admin_users) : [],
    site_content: isPlainObject(rawData?.site_content) ? normalizePersistedValue(rawData.site_content) : {},
    cooking_classes: Array.isArray(rawData?.cooking_classes) ? normalizePersistedValue(rawData.cooking_classes) : [],
    rsvp: Array.isArray(rawData?.rsvp) ? normalizePersistedValue(rawData.rsvp) : [],
    events: Array.isArray(rawData?.events) ? normalizePersistedValue(rawData.events) : [],
    inquiries: Array.isArray(rawData?.inquiries) ? normalizePersistedValue(rawData.inquiries) : [],
    blog_posts: Array.isArray(rawData?.blog_posts) ? normalizePersistedValue(rawData.blog_posts) : [],
  };
}

function loadDb() {
  if (!existsSync(DB_PATH)) return cloneDefaultDb();

  try {
    const parsed = JSON.parse(readFileSync(DB_PATH, 'utf8'));
    return ensureDbShape(parsed);
  } catch (error) {
    console.error('[db] Failed to parse database file, starting with defaults:', error.message);
    return cloneDefaultDb();
  }
}

mkdirSync(dirname(DB_PATH), { recursive: true });

const db = { data: loadDb() };

export function save() {
  const payload = JSON.stringify(db.data, null, 2);
  writeFileSync(DB_PATH, payload, 'utf8');
}

export function getNextId(collectionName) {
  const items = db.data[collectionName];
  if (!Array.isArray(items) || items.length === 0) return 1;
  return Math.max(...items.map((item) => Number(item.id) || 0)) + 1;
}

export function replaceDatabase(nextData) {
  db.data = ensureDbShape(nextData);
  return db.data;
}

export default db;
