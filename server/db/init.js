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

async function ensureExperienceEvents() {
  const { count } = await supabase
    .from('experience_events')
    .select('*', { count: 'exact', head: true });

  if (count > 0) return;

  // Seed from existing generators — convert to new schema
  const classRecords = generateUpcomingClassRecords(8).map((r) => ({
    type: 'cooking_class',
    title: r.theme,
    description: r.description || '',
    date: r.date,
    start_time: '10:00 AM',
    end_time: '1:30 PM',
    price_cents: (r.price || 95) * 100,
    currency: 'USD',
    capacity: r.max_spots || 8,
    seats_booked: (r.max_spots || 8) - (r.spots_left ?? r.max_spots ?? 8),
    difficulty: r.difficulty || 'All levels',
    image_url: r.image_url || '',
    status: 'published',
  }));

  const wineRecords = generateUpcomingWineTastingRecords(8).map((r) => ({
    type: 'wine_tasting',
    title: r.title,
    description: r.description || '',
    date: r.date,
    start_time: '6:00 PM',
    end_time: '8:00 PM',
    price_cents: (r.price || 65) * 100,
    currency: 'USD',
    capacity: r.max_spots || 14,
    seats_booked: (r.max_spots || 14) - (r.spots_left ?? r.max_spots ?? 14),
    difficulty: '',
    image_url: r.image_url || '',
    status: 'published',
  }));

  const musicRecords = generateUpcomingLiveMusicRecords(6).map((r) => ({
    type: 'live_music',
    title: r.title,
    description: r.description || '',
    date: r.date,
    start_time: r.time.split(' - ')[0] || '7:00 PM',
    end_time: r.time.split(' - ')[1] || '9:30 PM',
    price_cents: 0,
    currency: 'USD',
    capacity: 0,
    seats_booked: 0,
    difficulty: '',
    image_url: r.image_url || '',
    status: 'published',
  }));

  const all = [...classRecords, ...wineRecords, ...musicRecords];
  const { error } = await supabase.from('experience_events').insert(all);
  if (error) throw new Error(`[init] Experience events: ${error.message}`);
  console.log(`[init] Experience events seeded (${all.length} records).`);
}

async function ensureCateringPageContent() {
  // Only seed if tiers table is empty (it's the anchor table)
  const { count } = await supabase
    .from('catering_service_tiers')
    .select('*', { count: 'exact', head: true });

  if (count > 0) return;

  // Service tiers
  await supabase.from('catering_service_tiers').insert([
    { sort_order: 1, title: 'Cocktail Reception', range_label: '15–60 guests · 2–3 hrs', ideal_for: 'Cocktail parties, gallery openings, intimate celebrations', body: 'Passed hors d\'oeuvres, a curated bar of antipasti, and just enough structure to keep the room flowing. Designed for evenings where guests should never wait, never sit down, and never feel rushed.', image_url: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80', badge_label: '', cta_label: 'Inquire about this format' },
    { sort_order: 2, title: 'Grazing Experience', range_label: '30–120 guests · 3–4 hrs', ideal_for: 'Yacht parties, wedding receptions, milestone events', body: 'Our most photographed format. Elevated risers, marble boards, and a centerpiece grazing table dressed with Sicilian charcuterie, artisanal cheeses, fresh figs, and house-baked focaccia. Built to be the visual anchor of the event.', image_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80', badge_label: 'Signature', cta_label: 'Inquire about this format' },
    { sort_order: 3, title: 'Full Event Catering', range_label: '50–250 guests · 4–6 hrs', ideal_for: 'Corporate galas, large private events, multi-course seated dinners', body: 'A complete service — from amuse-bouche through dessert, with kitchen team, servers, and front-of-house coordination. For events where the catering is the evening.', image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80', badge_label: '', cta_label: 'Inquire about this format' },
  ]);

  // Signature items
  await supabase.from('catering_signature_items').insert([
    { sort_order: 1, title: 'Antipasto & charcuterie displays', description: 'Aged Parma, soppressata, Sicilian cheeses, fresh and dried fruit, on marble.', image_url: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?auto=format&fit=crop&w=600&q=80' },
    { sort_order: 2, title: 'Cocktail-style finger foods', description: 'Arancini al ragù, polpette, bruschette, sliders di porchetta — passed warm.', image_url: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?auto=format&fit=crop&w=600&q=80' },
    { sort_order: 3, title: 'Mini Italian classics', description: 'Lasagna in single portions, eggplant parmigiana cups, risotto al limone.', image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=600&q=80' },
    { sort_order: 4, title: 'Individual portions & salad cups', description: 'Caprese skewers, panzanella jars, citrus-fennel salad — engineered for standing receptions.', image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80' },
    { sort_order: 5, title: 'Artisanal cheeses & cured meats', description: 'Pecorino, Caciocavallo, Bresaola, Mortadella — sourced from named producers.', image_url: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=600&q=80' },
    { sort_order: 6, title: 'Refined desserts & pastries', description: 'Cannoli filled à la minute, mini cassata, pistachio panna cotta.', image_url: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=600&q=80' },
  ]);

  // Process steps
  await supabase.from('catering_process_steps').insert([
    { step_number: 1, title: 'Tell us about your event', description: 'Date, headcount, vibe, location. A 2-minute form — or a phone call if easier.' },
    { step_number: 2, title: 'We design your menu', description: 'Within 24–48 hours, our chef sends a custom menu and cost estimate. Revisions welcome.' },
    { step_number: 3, title: 'We confirm one week out', description: 'Final headcount, allergies, timing, dock or address details. Locked in writing.' },
    { step_number: 4, title: 'We host the day with you', description: 'Setup, service, breakdown. You stay with your guests.' },
  ]);

  // Portfolio events (all placeholder)
  await supabase.from('catering_portfolio_events').insert([
    { sort_order: 1, title: 'Sunset reception aboard a 75ft Hatteras', tag: 'Yacht', headcount: '40 guests', image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80', is_placeholder: true },
    { sort_order: 2, title: 'Corporate dinner — Sarasota Yacht Club', tag: 'Corporate', headcount: '80 guests', image_url: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=900&q=80', is_placeholder: true },
    { sort_order: 3, title: '50th birthday celebration — private estate', tag: 'Private', headcount: '65 guests', image_url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=80', is_placeholder: true },
    { sort_order: 4, title: 'Engagement party — waterfront terrace', tag: 'Private', headcount: '35 guests', image_url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=80', is_placeholder: true },
    { sort_order: 5, title: 'Tech company annual retreat', tag: 'Corporate', headcount: '120 guests', image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80', is_placeholder: true },
    { sort_order: 6, title: 'Catamaran sunset cruise — Sarasota Bay', tag: 'Yacht', headcount: '24 guests', image_url: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=900&q=80', is_placeholder: true },
  ]);

  // Testimonials (placeholder)
  await supabase.from('catering_testimonials').insert([
    { sort_order: 1, quote: 'They handled a 60-guest reception on a moving yacht like it was a sit-down dinner at home. Flawless.', author_name: 'Charter Captain', author_role: 'Longboat Key', is_placeholder: true },
    { sort_order: 2, quote: 'The grazing table was the centerpiece of the night. Half my guests asked for the caterer\'s name.', author_name: 'Private Host', author_role: '50th birthday', is_placeholder: true },
    { sort_order: 3, quote: 'Custom menu, dietary restrictions handled silently, on-time to the minute. We\'ve already rebooked.', author_name: 'Corporate Event Lead', author_role: 'Sarasota tech firm', is_placeholder: true },
  ]);

  // FAQs
  await supabase.from('catering_faqs').insert([
    { sort_order: 1, question: 'What\'s the minimum guest count?', answer: '15 guests for off-premise catering. We also handle in-restaurant private events for smaller groups.' },
    { sort_order: 2, question: 'How far in advance should I book?', answer: 'We accept events with 48 hrs notice when possible, but 2–3 weeks ahead gives us full menu flexibility.' },
    { sort_order: 3, question: 'Do you handle service staff?', answer: 'Yes — chefs, servers, and bartenders are included in our Full Event tier and available as add-ons for the others.' },
    { sort_order: 4, question: 'What\'s the service area?', answer: 'Sarasota County and Longboat Key are standard. We travel further on request.' },
    { sort_order: 5, question: 'Can you accommodate dietary restrictions?', answer: 'Always. Gluten-free, vegan, kosher-style, and allergies are part of every menu we design.' },
    { sort_order: 6, question: 'Do you provide rentals (linens, glassware)?', answer: 'We coordinate rentals through trusted local partners — billed transparently in your quote.' },
    { sort_order: 7, question: 'What\'s your cancellation policy?', answer: 'Sent with the menu proposal. Generally: full refund of deposit up to 14 days out.' },
    { sort_order: 8, question: 'Do you offer tastings?', answer: 'Yes, for events of 50+ guests. Tasting fees credited toward the final bill.' },
  ]);

  console.log('[init] Catering page content seeded.');
}

async function ensureCateringRequestsTable() {
  // Check if the table exists by attempting a count query.
  const { error } = await supabase
    .from('catering_requests')
    .select('*', { count: 'exact', head: true });

  // If the table does not exist the query returns a 404-style error.
  // In that case we attempt to create it via raw SQL (requires service role).
  if (error && /relation.*does not exist|undefined/i.test(error.message)) {
    console.log('[init] catering_requests table missing — attempting to create via SQL…');
    const { error: sqlError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS catering_requests (
          id BIGSERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT DEFAULT '',
          event_date DATE,
          event_type TEXT,
          guests INTEGER,
          message TEXT DEFAULT '',
          status TEXT DEFAULT 'new',
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        );

        ALTER TABLE catering_requests ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Service role full access on catering_requests"
          ON catering_requests
          FOR ALL
          USING (true)
          WITH CHECK (true);
      `,
    });

    if (sqlError) {
      // If the RPC doesn't exist, the table must be created via the Supabase dashboard or migration.
      console.warn('[init] Could not auto-create catering_requests table:', sqlError.message);
      console.warn('[init] Please create the table via Supabase dashboard or apply the migration.');
    } else {
      console.log('[init] catering_requests table created.');
    }
  }
}

export async function ensureInitialized() {
  await ensureAdminUser();
  await ensureSiteContent();
  await ensureCookingClasses();
  await ensureEvents();
  await ensureBlogPosts();
  await ensureExperienceEvents();
  await ensureCateringPageContent();
  await ensureCateringRequestsTable();
}
