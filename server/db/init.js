import bcrypt from 'bcryptjs';
import db, { getNextId, save } from './database.js';
import {
  generateUpcomingClassRecords,
  generateUpcomingLiveMusicRecords,
  generateUpcomingWineTastingRecords,
} from '../../shared/cookingDefaults.js';
import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
} from '../config.js';
import { DEFAULT_BLOG_POSTS } from '../../shared/blogDefaults.js';
import { normalizeBlogPost } from '../lib/blog.js';
import { mergeSiteContentDefaults } from '../lib/siteContent.js';
import { isPlainObject } from '../lib/validation.js';

function ensureAdminUser() {
  if (!Array.isArray(db.data.admin_users)) db.data.admin_users = [];
  if (db.data.admin_users.length > 0) return;

  db.data.admin_users.push({
    id: 1,
    username: ADMIN_USERNAME,
    password_hash: bcrypt.hashSync(ADMIN_PASSWORD, 10),
  });

  console.log(`[init] Admin user "${ADMIN_USERNAME}" created.`);
}

function ensureSiteContent() {
  if (!isPlainObject(db.data.site_content)) db.data.site_content = {};
  mergeSiteContentDefaults(db.data.site_content);
}

function ensureCookingClasses() {
  if (!Array.isArray(db.data.cooking_classes)) db.data.cooking_classes = [];
  if (db.data.cooking_classes.length > 0) return;

  const now = new Date().toISOString();

  generateUpcomingClassRecords().forEach((entry) => {
    db.data.cooking_classes.push({
      id: getNextId('cooking_classes'),
      ...entry,
      created_at: now,
      updated_at: now,
    });
  });

  console.log('[init] Cooking classes seeded.');
}

function ensureEvents() {
  if (!Array.isArray(db.data.events)) db.data.events = [];
  if (db.data.events.length > 0) return;

  const now = new Date().toISOString();
  const upcomingEvents = [
    ...generateUpcomingWineTastingRecords(),
    ...generateUpcomingLiveMusicRecords(),
  ];

  upcomingEvents.forEach((entry) => {
    db.data.events.push({
      id: getNextId('events'),
      ...entry,
      created_at: now,
      updated_at: now,
    });
  });

  console.log('[init] Events seeded.');
}

function ensureBlogPosts() {
  if (!Array.isArray(db.data.blog_posts)) db.data.blog_posts = [];
  if (db.data.blog_posts.length > 0) {
    db.data.blog_posts = db.data.blog_posts.map((entry) => normalizeBlogPost(entry));
    return;
  }

  const now = new Date().toISOString();

  DEFAULT_BLOG_POSTS.forEach((entry) => {
    db.data.blog_posts.push(
      normalizeBlogPost({
        ...entry,
        id: getNextId('blog_posts'),
        created_at: entry.created_at || now,
        updated_at: entry.updated_at || now,
      }),
    );
  });

  console.log('[init] Blog posts seeded.');
}

function normalizeRsvpCollection() {
  if (!Array.isArray(db.data.rsvp)) db.data.rsvp = [];

  db.data.rsvp = db.data.rsvp.map((entry) => ({
    ...entry,
    status: entry.status || 'pending',
    guests: Number(entry.guests) || 1,
    inventory_applied:
      typeof entry.inventory_applied === 'boolean'
        ? entry.inventory_applied
        : Boolean(entry.class_id) && entry.status !== 'cancelled',
  }));
}

function normalizeInquiryCollection() {
  if (!Array.isArray(db.data.inquiries)) db.data.inquiries = [];

  db.data.inquiries = db.data.inquiries.map((entry) => {
    const guestCount = Number(entry.guest_count ?? entry.guests);
    const guestLabel = entry.guest_label || (typeof entry.guests === 'string' ? entry.guests : '');

    return {
      ...entry,
      guests: guestLabel || String(Number.isFinite(guestCount) && guestCount > 0 ? guestCount : 1),
      guest_count: Number.isFinite(guestCount) && guestCount > 0 ? guestCount : null,
      guest_label: guestLabel,
      occasion: entry.occasion || '',
      event_id: entry.event_id ? Number(entry.event_id) : null,
      status: entry.status || 'new',
      updated_at: entry.updated_at || entry.created_at || new Date().toISOString(),
    };
  });
}

export function ensureInitialized() {
  ensureAdminUser();
  ensureSiteContent();
  ensureCookingClasses();
  ensureEvents();
  ensureBlogPosts();
  normalizeRsvpCollection();
  normalizeInquiryCollection();
  save();
}
