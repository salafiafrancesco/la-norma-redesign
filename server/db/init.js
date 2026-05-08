import bcrypt from 'bcryptjs';
import supabase from './supabase.js';
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
import { CONTENT_SECTION_KEYS } from '../../shared/contentSchema.js';
import { getDefaultContentForSection } from '../lib/siteContent.js';

function storeValue(value) {
  const isJson = typeof value === 'object' && value !== null;
  return {
    value: isJson ? JSON.stringify(value) : String(value ?? ''),
    type: isJson ? 'json' : 'text',
  };
}

async function ensureAdminUser() {
  const { count } = await supabase
    .from('admin_users')
    .select('*', { count: 'exact', head: true });

  if (count > 0) return;

  const { error } = await supabase.from('admin_users').insert({
    username: ADMIN_USERNAME,
    password_hash: bcrypt.hashSync(ADMIN_PASSWORD, 10),
  });

  if (error) throw new Error(`[init] Admin user: ${error.message}`);
  console.log(`[init] Admin user "${ADMIN_USERNAME}" created.`);
}

async function ensureSiteContent() {
  const { count } = await supabase
    .from('site_content')
    .select('*', { count: 'exact', head: true });

  if (count > 0) return;

  const rows = [];
  for (const sectionKey of CONTENT_SECTION_KEYS) {
    const defaults = getDefaultContentForSection(sectionKey);
    if (!defaults) continue;
    for (const [key, value] of Object.entries(defaults)) {
      const stored = storeValue(value);
      rows.push({ section: sectionKey, key, ...stored });
    }
  }

  if (rows.length > 0) {
    const { error } = await supabase.from('site_content').insert(rows);
    if (error) throw new Error(`[init] Site content: ${error.message}`);
    console.log('[init] Site content seeded.');
  }
}

async function ensureCookingClasses() {
  const { count } = await supabase
    .from('cooking_classes')
    .select('*', { count: 'exact', head: true });

  if (count > 0) return;

  const records = generateUpcomingClassRecords();
  const { error } = await supabase.from('cooking_classes').insert(records);
  if (error) throw new Error(`[init] Cooking classes: ${error.message}`);
  console.log('[init] Cooking classes seeded.');
}

async function ensureEvents() {
  const { count } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true });

  if (count > 0) return;

  const records = [
    ...generateUpcomingWineTastingRecords(),
    ...generateUpcomingLiveMusicRecords(),
  ];
  const { error } = await supabase.from('events').insert(records);
  if (error) throw new Error(`[init] Events: ${error.message}`);
  console.log('[init] Events seeded.');
}

async function ensureBlogPosts() {
  const { count } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact', head: true });

  if (count > 0) return;

  const now = new Date().toISOString();
  const posts = DEFAULT_BLOG_POSTS.map((entry) => {
    const normalized = normalizeBlogPost({
      ...entry,
      created_at: entry.created_at || now,
      updated_at: entry.updated_at || now,
    });
    // Remove 'id' so Supabase auto-generates it
    const { id: _id, ...rest } = normalized;
    return rest;
  });

  const { error } = await supabase.from('blog_posts').insert(posts);
  if (error) throw new Error(`[init] Blog posts: ${error.message}`);
  console.log('[init] Blog posts seeded.');
}

export async function ensureInitialized() {
  await ensureAdminUser();
  await ensureSiteContent();
  await ensureCookingClasses();
  await ensureEvents();
  await ensureBlogPosts();
}
