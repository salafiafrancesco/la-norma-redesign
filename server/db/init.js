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

async function ensureHomepageCollections() {
  const { count } = await supabase
    .from('homepage_signature_stats')
    .select('*', { count: 'exact', head: true });

  if (count > 0) return;

  await supabase.from('homepage_signature_stats').insert([
    { sort_order: 1, value: '18 years', label: 'Family-run since 2008' },
    { sort_order: 2, value: '70+ wines', label: 'Italian wine list' },
    { sort_order: 3, value: '250+ seats', label: 'Served weekly' },
  ]);

  await supabase.from('homepage_beyond_cards').insert([
    { sort_order: 1, title: 'Wine Tastings', body: 'A guided Friday flight through Italy with composed pairings.', link: '/wine-tastings', cta_label: 'Discover', image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80' },
    { sort_order: 2, title: 'Cooking Classes', body: 'Saturday mornings with Chef Marco — small group, hands-on.', link: '/cooking-classes', cta_label: 'Discover', image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80' },
    { sort_order: 3, title: 'Live Music', body: 'Wednesday and Saturday evenings, woven into dinner not on top of it.', link: '/live-music', cta_label: 'Discover', image_url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=800&q=80' },
    { sort_order: 4, title: 'Catering', body: 'Off-premise events, private gatherings, and yacht parties.', link: '/catering', cta_label: 'Discover', image_url: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80' },
  ]);

  await supabase.from('homepage_voices_aggregators').insert([
    { sort_order: 1, source: 'Google', rating: 4.8, review_count: 520, link: 'https://g.page/lanormarestaurant/review' },
    { sort_order: 2, source: 'TripAdvisor', rating: 4.7, review_count: 340, link: 'https://tripadvisor.com/' },
    { sort_order: 3, source: 'Yelp', rating: 4.9, review_count: 180, link: 'https://yelp.com/' },
  ]);

  await supabase.from('homepage_voices_quotes').insert([
    { sort_order: 1, text: 'The room feels refined without ever becoming stiff. Excellent wine guidance, beautiful pacing, and a Pasta alla Norma I am still thinking about.', author_name: 'Margaret S.', author_role: 'Sarasota, FL' },
    { sort_order: 2, text: 'Pacing was perfect. We hosted an anniversary dinner and every detail felt considered. Service was polished, warm, and genuinely memorable.', author_name: 'James & Patricia K.', author_role: 'Longboat Key, FL' },
    { sort_order: 3, text: 'One of the most memorable evenings we\'ve booked on Longboat Key. The Friday wine tasting was intimate, unhurried, and clearly curated by people who care.', author_name: 'Thomas R.', author_role: 'Chicago, IL' },
  ]);

  await supabase.from('homepage_visit_notes').insert([
    { sort_order: 1, day_label: 'Friday', note: 'Live wine tasting' },
    { sort_order: 2, day_label: 'Saturday', note: 'Cooking class (mornings)' },
    { sort_order: 3, day_label: 'Wed & Sat', note: 'Live music' },
  ]);

  console.log('[init] Homepage collections seeded.');
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

async function ensureNavLinks() {
  const { count, error: countError } = await supabase
    .from('nav_links')
    .select('*', { count: 'exact', head: true });

  if (countError && /relation.*does not exist|undefined|Could not find the table|schema cache/i.test(countError.message)) {
    console.warn('[init] nav_links table missing — create it via Supabase dashboard with columns: id BIGSERIAL PK, sort_order INT DEFAULT 0, label TEXT NOT NULL, page_key TEXT, href TEXT, parent_id BIGINT REFERENCES nav_links(id) ON DELETE CASCADE, scope TEXT DEFAULT \'both\', target TEXT, is_dropdown_parent BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now().');
    return;
  }

  if (count > 0) return;

  // Top-level desktop+mobile primary
  const top = [
    { sort_order: 1, label: 'Home', page_key: 'home', scope: 'both' },
    { sort_order: 2, label: 'Menu', page_key: 'menu', scope: 'both' },
    { sort_order: 3, label: 'Experiences', page_key: null, scope: 'desktop', is_dropdown_parent: true },
    { sort_order: 4, label: 'Catering', page_key: 'catering', scope: 'both' },
  ];

  const { data: topRows, error: topError } = await supabase
    .from('nav_links')
    .insert(top)
    .select();
  if (topError) {
    if (/Could not find the table|schema cache|relation.*does not exist/i.test(topError.message)) {
      console.warn('[init] nav_links table missing — skipping seed. Create the table in Supabase to enable Navigation admin.');
      return;
    }
    throw new Error(`[init] nav_links top: ${topError.message}`);
  }

  const expParent = topRows.find((r) => r.is_dropdown_parent);
  const dropdownChildren = expParent
    ? [
        { sort_order: 1, label: 'Cooking Classes', page_key: 'cooking-classes', parent_id: expParent.id, scope: 'desktop' },
        { sort_order: 2, label: 'Wine Tastings', page_key: 'wine-tastings', parent_id: expParent.id, scope: 'desktop' },
        { sort_order: 3, label: 'Live Music', page_key: 'live-music', parent_id: expParent.id, scope: 'desktop' },
      ]
    : [];

  // Mobile-only: experiences flat list (no dropdown on mobile)
  const mobileExtras = [
    { sort_order: 10, label: 'Cooking Classes', page_key: 'cooking-classes', scope: 'mobile' },
    { sort_order: 11, label: 'Wine Tastings', page_key: 'wine-tastings', scope: 'mobile' },
    { sort_order: 12, label: 'Live Music', page_key: 'live-music', scope: 'mobile' },
    { sort_order: 20, label: 'About', page_key: 'about', scope: 'both' },
    { sort_order: 21, label: 'Journal', page_key: 'blog', scope: 'mobile' },
    { sort_order: 22, label: 'FAQ', page_key: 'faq', scope: 'mobile' },
    { sort_order: 23, label: 'Contact', page_key: 'contact', scope: 'both' },
    { sort_order: 24, label: 'Privacy Policy', page_key: 'privacy-policy', scope: 'mobile' },
  ];

  const allChildren = [...dropdownChildren, ...mobileExtras];
  if (allChildren.length > 0) {
    const { error } = await supabase.from('nav_links').insert(allChildren);
    if (error) throw new Error(`[init] nav_links children: ${error.message}`);
  }

  console.log(`[init] nav_links seeded (${top.length + allChildren.length} records).`);
}

async function ensureFooterColumns() {
  const { count, error: countError } = await supabase
    .from('footer_columns')
    .select('*', { count: 'exact', head: true });

  if (countError && /relation.*does not exist|undefined|Could not find the table|schema cache/i.test(countError.message)) {
    console.warn('[init] footer_columns / footer_column_links tables missing — create via Supabase dashboard. footer_columns: id BIGSERIAL PK, sort_order INT, label TEXT NOT NULL. footer_column_links: id BIGSERIAL PK, column_id BIGINT REFERENCES footer_columns(id) ON DELETE CASCADE, sort_order INT, label TEXT, page_key TEXT, href TEXT, target TEXT.');
    return;
  }

  if (count > 0) return;

  const { data: cols, error: colsError } = await supabase
    .from('footer_columns')
    .insert([
      { sort_order: 1, label: 'About' },
      { sort_order: 2, label: 'Experiences' },
    ])
    .select();
  if (colsError) {
    if (/Could not find the table|schema cache|relation.*does not exist/i.test(colsError.message)) {
      console.warn('[init] footer_columns table missing — skipping seed. Create the table in Supabase to enable Footer admin.');
      return;
    }
    throw new Error(`[init] footer_columns: ${colsError.message}`);
  }

  const aboutCol = cols.find((c) => c.label === 'About');
  const expCol = cols.find((c) => c.label === 'Experiences');

  const links = [];
  if (aboutCol) {
    links.push(
      { column_id: aboutCol.id, sort_order: 1, label: 'Our story', page_key: 'about' },
      { column_id: aboutCol.id, sort_order: 2, label: 'Journal', page_key: 'blog' },
      { column_id: aboutCol.id, sort_order: 3, label: 'Private events', page_key: 'private-events' },
      { column_id: aboutCol.id, sort_order: 4, label: 'Contact', page_key: 'contact' },
    );
  }
  if (expCol) {
    links.push(
      { column_id: expCol.id, sort_order: 1, label: 'Wine tastings', page_key: 'wine-tastings' },
      { column_id: expCol.id, sort_order: 2, label: 'Cooking classes', page_key: 'cooking-classes' },
      { column_id: expCol.id, sort_order: 3, label: 'Live music', page_key: 'live-music' },
      { column_id: expCol.id, sort_order: 4, label: 'Catering', page_key: 'catering' },
    );
  }

  if (links.length > 0) {
    const { error } = await supabase.from('footer_column_links').insert(links);
    if (error) throw new Error(`[init] footer_column_links: ${error.message}`);
  }

  console.log(`[init] footer_columns seeded (${cols.length} cols, ${links.length} links).`);
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

async function ensureInquiriesContactType() {
  // The original CHECK constraint allows only ('wine_tasting', 'live_music', 'private_event').
  // We need to extend it to also accept 'contact'. Idempotent — safe to run on every boot.
  const { error: sqlError } = await supabase.rpc('exec_sql', {
    query: `
      ALTER TABLE inquiries DROP CONSTRAINT IF EXISTS inquiries_type_check;
      ALTER TABLE inquiries ADD CONSTRAINT inquiries_type_check
        CHECK (type IN ('wine_tasting', 'live_music', 'private_event', 'contact'));
    `,
  });

  if (sqlError) {
    console.warn(
      '[init] Could not auto-update inquiries_type_check constraint:',
      sqlError.message,
      '\nApply this SQL via Supabase dashboard once:\n' +
      "  ALTER TABLE inquiries DROP CONSTRAINT IF EXISTS inquiries_type_check;\n" +
      "  ALTER TABLE inquiries ADD CONSTRAINT inquiries_type_check CHECK (type IN ('wine_tasting','live_music','private_event','contact'));"
    );
  }
}

async function ensureBookingsExtendedSchema() {
  // Adds Stripe-ready columns to bookings + creates users + booking_events_log
  // tables. ALTER/CREATE statements use IF NOT EXISTS so this runs safely on
  // every boot. Requires the Supabase RPC "exec_sql" function. If unavailable,
  // logs the SQL the operator should run manually via Supabase dashboard.
  const ddl = `
    ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
      ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
      ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
      ADD COLUMN IF NOT EXISTS user_id BIGINT,
      ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      phone TEXT,
      dietary_preferences TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS booking_events_log (
      id BIGSERIAL PRIMARY KEY,
      booking_id BIGINT REFERENCES bookings(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      payload JSONB,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_booking_events_log_booking_id
      ON booking_events_log(booking_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_stripe_session_id
      ON bookings(stripe_session_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_user_id
      ON bookings(user_id);

    -- Atomic seat reservation. Returns the updated row, or no rows if the
    -- event is not bookable (not published, not enough capacity).
    -- Solves the race condition between concurrent POST /api/bookings calls.
    CREATE OR REPLACE FUNCTION book_seats(p_event_id BIGINT, p_guests INT)
    RETURNS SETOF experience_events AS $$
    BEGIN
      RETURN QUERY
        UPDATE experience_events
        SET seats_booked = seats_booked + p_guests,
            updated_at = now()
        WHERE id = p_event_id
          AND status = 'published'
          AND (capacity = 0 OR seats_booked + p_guests <= capacity)
        RETURNING *;
    END;
    $$ LANGUAGE plpgsql;

    -- Atomic seat release. Clamps at 0 to avoid negative counts.
    CREATE OR REPLACE FUNCTION release_seats(p_event_id BIGINT, p_guests INT)
    RETURNS SETOF experience_events AS $$
    BEGIN
      RETURN QUERY
        UPDATE experience_events
        SET seats_booked = GREATEST(0, seats_booked - p_guests),
            updated_at = now()
        WHERE id = p_event_id
        RETURNING *;
    END;
    $$ LANGUAGE plpgsql;
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { query: ddl });
    if (error) {
      if (/exec_sql.*does not exist|function.*not found|Could not find the function/i.test(error.message)) {
        console.warn('[init] exec_sql RPC missing — please run this SQL on Supabase to enable Stripe + user account schema:\n' + ddl);
        return;
      }
      console.warn('[init] bookings extended schema:', error.message);
      return;
    }
    console.log('[init] bookings extended schema ensured (Stripe columns + users + booking_events_log).');
  } catch (err) {
    console.warn('[init] bookings extended schema skipped:', err.message);
  }
}

export async function ensureInitialized() {
  await ensureAdminUser();
  await ensureSiteContent();
  await ensureCookingClasses();
  await ensureBlogPosts();
  await ensureExperienceEvents();
  await ensureHomepageCollections();
  await ensureCateringPageContent();
  await ensureCateringRequestsTable();
  await ensureNavLinks();
  await ensureFooterColumns();
  await ensureInquiriesContactType();
  await ensureBookingsExtendedSchema();
}
