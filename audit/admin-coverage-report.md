# Admin Coverage Audit — La Norma Ristorante

**Branch:** `audit/admin-coverage`
**Data report:** 2026-05-09
**Stato:** FASE A — Report read-only. Nessuna modifica al codice. Attendere approvazione prima di FASE B.

> Obiettivo: verificare che tutti i contenuti del sito pubblico siano gestibili dal pannello `/admin` senza dover toccare il codice.

---

## Sommario esecutivo

Il sito ha un **pannello admin completo** ma con **coverage parziale dei contenuti**. Schema CMS chiave-valore (`site_content`) + tabelle dedicate (homepage_*, catering_*, blog_posts, experience_events, bookings, ecc.) coprono **HomePage e CateringPage in modo solido**, ma le pagine "esperienze lean" (Cooking Classes, Wine Tastings, Live Music), Navbar, Footer, About, FAQ, Contact, Privacy hanno **larga porzione di contenuto hardcoded** non gestibile da admin.

**Verdetto:** il cliente NON può oggi:
- Modificare voci della Navbar (NAV_LINKS, dropdown Experiences)
- Modificare colonne del Footer (About, Experiences, copyright)
- Modificare hero/FAQ/testimonials/includes delle pagine Cooking/Wine/Music
- Modificare valori ABOUT_VALUES, GENERAL_FAQS
- Modificare contenuto Privacy Policy
- Modificare lo schema.org Restaurant (cuisine, opening hours)
- Modificare i fallback HOURS_ROWS (settimana di orari mostrata sulla home/visit)

**Raccomandazione:** lo split in **3 PR sequenziali** è consigliato. Vedi sezione 8.

---

## 1. Inventario pagine pubbliche

| Path | File | Stato content | Note |
|---|---|---|---|
| `/` | `src/pages/HomePage.jsx` | MIXED | CMS via `useSection` + 5 collection homepage; molti fallback hardcoded |
| `/menu` | `src/pages/MenuPage.jsx` | MIXED | Hero quasi tutto hardcoded; Specialties via CMS |
| `/about` | `src/pages/AboutPage.jsx` | MIXED | Story body via CMS; ABOUT_VALUES hardcoded |
| `/contact` | `src/pages/ContactPage.jsx` | MIXED | Contact info via CMS; copy hardcoded |
| `/faq` | `src/pages/FAQPage.jsx` | HARDCODED | GENERAL_FAQS in `src/data/sitePages.js` |
| `/journal` | `src/pages/BlogPage.jsx` | MIXED | Posts da DB; copy hero hardcoded |
| `/journal/:slug` | `src/pages/BlogArticlePage.jsx` | MIXED | Post da DB; sidebar hardcoded |
| `/cooking-classes` | `src/pages/CookingClassesPage.jsx` | HARDCODED | Hero, INCLUDES, FAQ, TESTIMONIALS tutto in costanti file |
| `/wine-tastings` | `src/pages/WineTastingsPage.jsx` | HARDCODED | Hero, EXPECT_ITEMS, SUITED_FOR, FAQ, TESTIMONIALS hardcoded |
| `/live-music` | `src/pages/LiveMusicPage.jsx` | HARDCODED | Hero, FAQ, CTA hardcoded |
| `/private-events` | `src/pages/PrivateEventsPage.jsx` | HARDCODED | Config in `src/data/experiencePages.js` (~668 righe) |
| `/catering` | `src/pages/CateringPage.jsx` | MIXED | CMS solido (catering section + 7 collection); fallback hardcoded |
| `/privacy-policy` | `src/pages/PrivacyPolicy.jsx` | HARDCODED | 100% hardcoded incluso indirizzo, email, telefono duplicati |
| `/booking/success` | `src/pages/BookingSuccessPage.jsx` | HARDCODED | Copy inline |
| `/booking/cancelled` | `src/pages/BookingCancelledPage.jsx` | HARDCODED | Copy inline |
| `/booking/:token` | `src/pages/BookingDetailPage.jsx` | MIXED | Booking da DB; labels hardcoded |
| `*` (404) | `src/pages/NotFound.jsx` | HARDCODED | Copy inline |

---

## 2. Mappa sezioni per pagina

### HomePage `/`

| Sezione | Componente | Fonte | Editabile da admin? |
|---|---|---|---|
| Hero | inline JSX | `useSection('hero')` (eyebrow, headline, sub, image) | **SI** via Site Content |
| Hero — `· Since 2008`, CTA labels | inline | HARDCODED | **NO** |
| Tonight Widget | inline | `TONIGHT_SLOTS` (6 slot orari hardcoded), labels hardcoded | **NO** |
| Signature Strip | inline | `useSection` + fetch `/api/homepage-content/all` (`stats`) + `STATS_FALLBACK` | **PARZIALE** — stats sì da admin Homepage, copy eyebrow/body NO |
| Menu Preview | inline | `useSection('menuHighlights')` + image Unsplash hardcoded + caption hardcoded ("Pasta alla Norma", ingredienti) | **PARZIALE** — categories sì da Site Content, ma image+caption NO |
| Atmosphere | inline | `useSection('story')` + H2 hardcoded ("Sicilian cooking…") | **PARZIALE** — body sì, headline NO |
| Beyond Dinner | inline | fetch `homepage_beyond_cards` + `BEYOND_FALLBACK` (4 card hardcoded con immagine Unsplash) | **PARZIALE** — card sì, eyebrow/headline/sub NO |
| Voices — ratings | inline | fetch `homepage_voices_aggregators` + `VOICES_FALLBACK_RATINGS` (Google/Trip/Yelp) | **SI** |
| Voices — quotes | inline | fetch `homepage_voices_quotes` + `VOICES_FALLBACK_QUOTES` (3) | **SI** |
| Voices — eyebrow/headline | inline | HARDCODED | **NO** |
| Visit — heading/eyebrow | inline | HARDCODED | **NO** |
| Visit — info | inline | `useSection('restaurant')` + `HOURS_ROWS` (settimana hardcoded) | **PARZIALE** — phone/address/email da Site Content, ma orari giornalieri della tabella sono hardcoded |
| Visit — booking copy | inline | HARDCODED | **NO** |
| Visit — Google Maps URL | inline | hardcoded `5370+Gulf+of+Mexico+Drive…` (duplicato vs `restaurant.mapEmbedUrl`) | **NO** |
| Sticky Mobile Bar | inline | labels HARDCODED (`Call`, `Directions`, `Reserve`) | **NO** |
| Schema.org Restaurant | inline | HARDCODED (cuisine, priceRange, opening hours `17:00-21:00`) | **NO** |

### MenuPage `/menu`

| Sezione | Fonte | Editabile da admin? |
|---|---|---|
| Hero (image, eyebrow, H1, H2, sub, stats trio) | HARDCODED | **NO** |
| Specialties | `useSection('specialties')` | **SI** via Site Content |
| Specialties header copy | HARDCODED | **NO** |
| MenuHighlights | `useSection('menuHighlights')` | **SI** |
| Editorial Support / CTA | HARDCODED | **NO** |
| Schema.org `hasMenuSection` array | HARDCODED | **NO** |

### AboutPage `/about`

| Sezione | Fonte | Editabile da admin? |
|---|---|---|
| Hero — quote | `useSection('story').quote` | **SI** |
| Hero — H1, eyebrow | HARDCODED | **NO** |
| Story body | `useSection('story').body[0/1]` | **SI** |
| Values grid | `ABOUT_VALUES` in `src/data/sitePages.js` (3 voci) | **NO** |
| Visit cards | `useSection('restaurant')` | **SI** |
| Best next steps panel | HARDCODED | **NO** |

### ContactPage `/contact`

| Sezione | Fonte | Editabile da admin? |
|---|---|---|
| Hero, Best path, Editorial support | HARDCODED titoli/copy | **NO** |
| Contact details (address, phone, email, hours, map) | `useSection('restaurant')` | **SI** |

### FAQPage `/faq`

| Sezione | Fonte | Editabile da admin? |
|---|---|---|
| Hero, Editorial support | HARDCODED | **NO** |
| FAQ list | `GENERAL_FAQS` (5 Q&A) in `src/data/sitePages.js` | **NO** |
| Schema.org FAQPage | derivato da `GENERAL_FAQS` | **NO** |

### Cooking Classes `/cooking-classes`

| Sezione | Fonte | Editabile da admin? |
|---|---|---|
| Hero — image, eyebrow, headline, stats trio | HARDCODED | **NO** |
| Booking widget | `<ExperienceBooking>` → `experience_events` filtered by `cooking_class` | **SI** via Experiences admin |
| Includes (4 voci) | HARDCODED `INCLUDES` | **NO** |
| FAQ (6 voci) | HARDCODED | **NO** |
| Testimonials (2) | HARDCODED | **NO** |
| CTA finale | HARDCODED | **NO** |

### Wine Tastings `/wine-tastings`

| Sezione | Fonte | Editabile da admin? |
|---|---|---|
| Hero (image, eyebrow, headline, stats) | HARDCODED | **NO** |
| Booking widget | `<ExperienceBooking>` → `experience_events` filtered by `wine_tasting` | **SI** |
| What to expect (5 + 5 chips) | HARDCODED | **NO** |
| FAQ (4) | HARDCODED | **NO** |
| Testimonials (2) | HARDCODED | **NO** |
| CTA | HARDCODED | **NO** |

### Live Music `/live-music`

| Sezione | Fonte | Editabile da admin? |
|---|---|---|
| Hero (image, stats) | HARDCODED | **NO** |
| Booking widget | `<ExperienceBooking>` → `experience_events` filtered by `live_music` | **SI** |
| FAQ (4) | HARDCODED | **NO** |
| CTA | HARDCODED | **NO** |

### Private Events `/private-events`

Wrapper di `<ExperiencePage>` che legge da `experiencePageConfigs['private-events']` in `src/data/experiencePages.js` (~668 righe). **Tutto HARDCODED**: hero, proofStrip, sections (features/story-grid/checklist/packages/testimonials), faq, cta. Solo gli "events" (se config.events.category settato) si fetchano dal DB.

### CateringPage `/catering`

| Sezione | Fonte | Editabile da admin? |
|---|---|---|
| Hero, Statement, Yacht, MidCTA, CTA | `useSection('catering')` (~30 campi) | **SI** via Site Content |
| Tiers ("How we cater") | fetch `catering_service_tiers` + `TIERS` fallback | **SI** via Catering admin |
| Signatures (6) | fetch `catering_signature_items` + `SIGNATURES` fallback | **SI** |
| Process (4 step) | fetch `catering_process_steps` + `PROCESS` fallback | **SI** |
| Portfolio | fetch `catering_portfolio_events` | **SI** |
| Testimonials | fetch `catering_testimonials` + `TESTIMONIALS` fallback | **SI** |
| FAQ (8) | fetch `catering_faqs` + `FAQS` fallback | **SI** |
| Form options (event types, locations, budgets) | `CATERING_*` in `shared/cateringDefaults.js` | **NO** (cambierebbero raramente) |
| `HERO_SUBTITLE` (string costante) | HARDCODED | **NO** (override del CMS) |

### Privacy Policy `/privacy-policy`

100% HARDCODED. Include valori ridotti (`info@lanormarestaurant.com`, `+19415550192`, indirizzo) **duplicati e divergenti** dai valori in CMS. **NO** editabile.

### NotFound, BookingSuccess, BookingCancelled

100% HARDCODED. **NO** editabile (low priority — raramente cambiano).

### BookingDetailPage `/booking/:token`

Dati booking da `GET /api/bookings/token/:token`. Labels UI HARDCODED. **NO** editabili.

---

## 3. Inventario pannello admin

**Auth:** JWT custom, single admin user (`admin_users`). Login `POST /api/auth/login`. Token in `localStorage`. Rate-limited 10 tentativi/15min.

**Layout:** `src/admin/components/AdminLayout.jsx` — sidebar fissa, **niente router URL** (sezione attiva = `useState`, no bookmark sotto-pagine).

| Sezione admin | File | Tabelle gestite | Operazioni | Editor UI |
|---|---|---|---|---|
| Dashboard | `Dashboard.jsx` | aggregata | Read-only KPI | cards |
| Homepage | `HomepageManager.jsx` | `site_content` (sezioni JSON) + `homepage_signature_stats`, `homepage_beyond_cards`, `homepage_voices_aggregators`, `homepage_voices_quotes`, `homepage_visit_notes`, `newsletter_subscribers` | C/R/U/D — sort_order numerico (no drag) | Tab + modal table; **textarea JSON** per content, no rich text |
| Site Content | `ContentEditor.jsx` | `site_content` (key/value, schema da `shared/contentSchema.js`) | R/U per sezione | Form auto da schema (editor: 'fields'\|'json'); image picker con upload |
| Journal | `BlogManager.jsx` | `blog_posts` | C/R/U/D + featured toggle (single-featured) | Modal form; body Markdown light in textarea (no rich text) |
| Cooking Classes (legacy) | `ClassesManager.jsx` | `cooking_classes` (legacy) | C/R/U/D + active | Form |
| RSVPs (legacy) | `RSVPList.jsx` | `rsvp` (legacy) | R, U status, D — no bulk | tabella |
| Events (legacy) | `EventsManager.jsx` | `events` (legacy) | C/R/U/D | Form |
| Experiences | `ExperiencesManager.jsx` | `experience_events` (modello unificato cooking/wine/music) | C/R/U/D price_cents/capacity/seats_booked/status | Form |
| Catering | `CateringManager.jsx` | `catering_requests` + 7 catering_* collections | R/U/D requests + C/R/U/D content (reorder bulk endpoint esiste server-side ma non chiaro se UI lo invoca) | Tabbed |
| Inquiries | `InquiriesManager.jsx` | `inquiries` | R, U status, D | tabella |
| Images | `ImagesPage.jsx` | Supabase Storage bucket `uploads` | Upload (multi), List, Delete, Copy URL | grid; no crop/resize |

**Componenti UI riusabili:** **praticamente assenti**. Solo `AdminLayout.jsx`. Ogni page riimplementa modali/tabelle/upload via classi CSS `adm-*`. Lacune UI: nessun `<ImageField>`, nessun rich text editor, nessuna lista sortable drag-drop, nessuna bulk action.

**DB engine:** Supabase Postgres + Storage. JSON-DB (`server/db/database.js`) è legacy/non usato.

---

## 4. Gap analysis — contenuti hardcoded da migrare

### HIGH (blocchi operativi cliente)

| # | Pagina/Sezione | Campi hardcoded | Effort | Note |
|---|---|---|---|---|
| H1 | **Navbar** | `NAV_LINKS`, dropdown Experiences, `MOBILE_PRIMARY/EXPERIENCES/SECONDARY`, label CTA "View Menu" / "Reserve Now" | MEDIUM | Cliente NON può aggiungere/togliere voci nav |
| H2 | **Footer** | `aboutLinks`, `experienceLinks`, copyright year, eyebrow `La Norma Hospitality · Longboat Key`, newsletter copy, bottom legal buttons | MEDIUM | `footerNav` esiste in CMS ma è sovrascritto da `SYSTEM_FOOTER_LINKS` — bug di design |
| H3 | **HomePage — Visit `HOURS_ROWS`** | settimana 7-giorni hardcoded uguali (`5:00 PM – 9:00 PM`) | SMALL | Cliente cambia orari stagionali → modifica codice |
| H4 | **Cooking Classes page** | hero (image, eyebrow, headline, stats), INCLUDES (4), FAQ (6), TESTIMONIALS (2), CTA | LARGE | Pagina marketing chiave; cliente vuole iterare copy/foto |
| H5 | **Wine Tastings page** | hero, EXPECT_ITEMS (5), SUITED_FOR (5 chip), FAQ (4), TESTIMONIALS (2), CTA | LARGE | come sopra |
| H6 | **Live Music page** | hero, FAQ (4), CTA | MEDIUM | come sopra |
| H7 | **Private Events page** | intera config in `src/data/experiencePages.js` (~668 righe) | LARGE | Hero, packages, testimonials, FAQ, CTA |
| H8 | **About page** | hero H1+eyebrow, `ABOUT_VALUES` (3), Best next steps panel | MEDIUM | Cliente vuole iterare valori brand |
| H9 | **FAQ page** | `GENERAL_FAQS` (5) | SMALL | Spostare in DB + admin form |
| H10 | **Schema.org Restaurant** (HomePage) | cuisine, priceRange, opening hours `17:00-21:00` | SMALL | SEO impact: deve riflettere orari reali |
| H11 | **HomePage — Tonight Widget** | `TONIGHT_SLOTS` (6 slot statici) | SMALL | Niente fonte real-time da OpenTable; servono almeno slot config |

### MEDIUM (workaround possibile, ma cliente lo vorrebbe)

| # | Pagina/Sezione | Campi hardcoded | Effort | Note |
|---|---|---|---|---|
| M1 | HomePage — heading/eyebrow per sezione (Beyond, Voices, Visit, Atmosphere) | testi inline | SMALL | Spostare in `site_content` |
| M2 | HomePage — Menu Preview image+caption (Pasta alla Norma) | image URL Unsplash, caption 3 righe | SMALL | Spostare in `site_content` o `menuHighlights` |
| M3 | MenuPage — hero completo (image, copy, stats trio) | costanti inline | MEDIUM | Aggiungere sezione `menuPage` a Site Content |
| M4 | ContactPage — copy hero/best-path/editorial | costanti inline | MEDIUM | Sezione `contactPage` |
| M5 | FAQ page — hero + editorial copy | costanti inline | SMALL | Sezione `faqPage` |
| M6 | AboutPage — best next steps panel | inline | SMALL | Sezione `aboutPage` |
| M7 | Sticky Mobile Bar — labels (Call, Directions, Reserve) | hardcoded | SMALL | Sezione `mobileBar` o riutilizzare `links` |
| M8 | HomePage — Google Maps URL duplicato | hardcoded indipendente da `restaurant.mapEmbedUrl` | SMALL | Bug: usare il valore CMS già esistente |
| M9 | Catering — `HERO_SUBTITLE` const | sovrascrive il CMS | SMALL | Bug: rimuovere e usare `useSection('catering').heroSubtitle` |
| M10 | Catering — form options (event types, locations, budgets) | hardcoded in `shared/cateringDefaults.js` | MEDIUM | Cambiano raramente, ma utile per evolvere offerta |

### LOW (raramente cambia, OK lasciare hardcoded)

| # | Pagina/Sezione | Campi | Effort | Decisione consigliata |
|---|---|---|---|---|
| L1 | Privacy Policy | full body (10 sezioni) | LARGE | RIMANDARE — testo legale, cambia raramente. Almeno **sostituire i 3 valori contact** (email, phone, address) con riferimento a CMS, niente più duplicazione |
| L2 | NotFound | copy inline | SMALL | OK hardcoded |
| L3 | Booking Success / Cancelled | copy inline | SMALL | OK hardcoded — però considerare email-friendly copy |
| L4 | Booking Detail labels | inline | SMALL | OK hardcoded |
| L5 | BlogPage — sidebar/CTA copy | inline | SMALL | OK |

---

## 5. Elementi globali — verifica esplicita

| Elemento | Stato | Note |
|---|---|---|
| **Header — voci nav** | NO admin | gap H1 |
| **Header — dropdown Experiences** | NO admin | gap H1 |
| **Header — logo** | parzialmente CMS (`restaurant.name`) | image logo non gestita |
| **Header — CTA primario "Reserve Now"** | NO admin (link a `OPENTABLE_RESERVATION_URL`) | gap H1 |
| **Footer — column groups** | NO admin (hardcoded in component, CMS `footerNav` ignorato) | gap H2 |
| **Footer — link** | NO admin | gap H2 |
| **Footer — copyright/legal** | NO admin | gap H2 |
| **Footer — social links** | SI via Site Content `restaurant.social` | OK |
| **Footer — newsletter signup** | partial: form OK, provider email **NON configurato** | submit ok, ma nessuna email/integration |
| **SEO — meta title pattern** | hardcoded in pagine via `usePageMetadata` | gap MEDIUM |
| **SEO — meta description default** | hardcoded per pagina | gap MEDIUM |
| **SEO — OG image default** | non rilevato gestione globale | gap MEDIUM |
| **JSON-LD Restaurant** | hardcoded in HomePage | gap H10 |
| **Hours del ristorante** | DOPPIA fonte: `restaurant.hours` (string singola da CMS) + `HOURS_ROWS` (tabella settimanale hardcoded) | gap H3 (incoerenza) |
| **Indirizzo, telefono, email** | SI via Site Content `restaurant.*` | OK — ma DUPLICATI hardcoded in PrivacyPolicy.jsx e Maps URL HomePage |
| **Newsletter signup** | provider non configurato | nessun delivery email; iscritti solo persistiti in `newsletter_subscribers` |
| **Featured image / OG image per pagina** | non gestito globalmente | gap MEDIUM |
| **Sticky mobile bar config** | hardcoded labels | gap M7 |
| **Drawer mobile config (voci, contact)** | hardcoded `MOBILE_*` | gap H1 |

---

## 6. Piano di correzione proposto

### PR 1 — Site fundamentals (effort ~2-3 giorni)

**Obiettivo:** elementi globali e gap HIGH a basso effort.

- **DB**: nuove tabelle `nav_links` (label, page_key, parent_id, sort_order, is_dropdown, is_mobile_only), `footer_columns` (label, sort_order), `footer_column_links` (column_id, label, page_key/href, sort_order)
- **DB**: estendere `site_content` con sezione `general_footer` (eyebrow, copyright_pattern, newsletter_copy, legal_buttons[]) e `general_navbar` (cta_primary_label, cta_primary_url, cta_secondary_label)
- **DB**: estendere `site_content.restaurant` con `hours_weekly` (array {day, hours, closed?}) per sostituire `HOURS_ROWS`
- **DB**: estendere `site_content` con `seo` (default_title_pattern, default_description, default_og_image, schema_org_restaurant {cuisine, priceRange, opens, closes, dayOfWeek[]})
- **Admin**: nuova sezione "Navigation" con drag-drop per riordino voci (richiede componente `<SortableList>`)
- **Admin**: nuova sezione "Footer" con drag-drop per colonne e link
- **Admin**: estensione "Site Content" → tab "Hours" per editor settimanale, tab "SEO" per defaults
- **Frontend**: rimuovere `NAV_LINKS`, `MOBILE_*`, `aboutLinks`, `experienceLinks`, `HOURS_ROWS` dal codice; leggere da CMS
- **Frontend**: rimuovere `SYSTEM_FOOTER_LINKS` override in ContentContext
- **Frontend**: rimuovere maps URL hardcoded in HomePage.jsx (usare `restaurant.mapEmbedUrl`)
- **Frontend**: rimuovere indirizzo/phone/email duplicati in PrivacyPolicy.jsx
- **Componenti UI riusabili da creare**: `<SortableList>`, `<ImageField>` (compone input file + preview + upload + URL fallback)

### PR 2 — Homepage refinement + experience-page lean copy (effort ~3-4 giorni)

**Obiettivo:** gap HIGH/MEDIUM su HomePage e pagine esperienza lean.

- **DB**: estendere `site_content` con `home_extras` (heading_beyond, heading_voices, heading_visit, heading_atmosphere, heading_signature, eyebrow_*, hero_since_label, hero_cta_primary_label, hero_cta_secondary_label, sticky_bar_labels{call,directions,reserve}, tonight_slots[])
- **DB**: estendere `menuHighlights` con `feature_image_url`, `feature_caption_label`, `feature_caption_name`, `feature_caption_detail`
- **DB**: nuove sezioni in `site_content`: `cooking_classes_page`, `wine_tastings_page`, `live_music_page` con: hero{image, eyebrow, headline, sub, stats[{value, label}]}, includes/expect_items[], suited_for[], cta{label, link}
- **DB**: nuove tabelle `experience_page_faqs` (page_key, sort_order, question, answer) e `experience_page_testimonials` (page_key, sort_order, quote, author_name, author_role, image_url?)
- **Admin**: estendere "Site Content" con tab dedicate per ogni pagina esperienza
- **Admin**: nuova sezione "Experience Pages FAQ & Testimonials" CRUD per page_key
- **Frontend**: rimuovere costanti `INCLUDES/FAQ/TESTIMONIALS/EXPECT_ITEMS/SUITED_FOR/DESCRIPTION` dalle pagine; leggere da CMS

### PR 3 — Pagine secondarie + SEO + cleanup (effort ~2-3 giorni)

**Obiettivo:** gap MEDIUM rimanenti + cleanup.

- **DB**: nuove sezioni `site_content`: `about_page` (hero_h1, hero_eyebrow, best_next_steps), `contact_page` (hero, best_path, editorial), `faq_page` (hero, editorial), `menu_page` (hero_image, hero_copy, stats_trio[])
- **DB**: nuova tabella `general_faqs` (sort_order, question, answer) per FAQ page
- **DB**: nuova tabella `about_values` (sort_order, title, body, icon?)
- **DB**: nuova tabella `private_events_config` (singleton JSON o normalizzata) per Private Events page
- **Admin**: nuova sezione "Pages" con sub-tabs per About/Contact/FAQ/Menu/Private Events
- **Admin**: nuova sezione "FAQ Center" CRUD
- **Admin**: nuova sezione "About Values" CRUD
- **Frontend**: rimuovere `ABOUT_VALUES`, `GENERAL_FAQS`, costanti pagine secondarie; leggere da CMS
- **Frontend**: rimuovere `HERO_SUBTITLE` const in CateringPage
- **Cleanup**: rimuovere JSON-DB legacy (`server/db/database.js`, `server/data/db.json`) — non più usato dalle route
- **Cleanup**: deprecare admin sections legacy "Cooking Classes (legacy)" / "RSVPs (legacy)" / "Events (legacy)" se completamente migrate a `experience_events`

### PR 4 (opzionale, low priority)

- Privacy Policy come MDX/rich-text editabile (LOW — RIMANDARE finché non richiesto)
- Booking Success/Cancelled copy editabile (LOW)
- Form options Catering (event types, locations, budgets) editabili (M10 — RIMANDARE)

---

## 7. Raccomandazioni

### Pattern di gestione contenuti

1. **Singleton vs lista**: contenuti uno-per-pagina (hero, copy section) → `site_content` key/value singleton. Liste ordinate (FAQ, testimonials, values) → tabella dedicata con `sort_order`.
2. **Rich text**: `body` blog è plaintext markdown in textarea — accettabile per MVP. Per copy lunghi (Privacy, About body, FAQ answers) considerare un rich text editor minimale (es. **TipTap** headless o **Lexical**) per future PR.
3. **Image management**: il pattern `uploadsApi.upload` è ripetuto inline in 5+ pagine admin. **Creare `<ImageField>` riusabile** (input file + preview + upload + URL manuale fallback). Mancano: crop, ridimensionamento server (sharp), generazione di varianti responsive (srcset).
4. **List ordering**: tutto il riordino è via `sort_order` numerico nelle modali. **Creare `<SortableList>`** drag-drop usando `react-dnd` o `dnd-kit` (preferibile, headless). Esiste già un endpoint `PUT /api/catering-content/:collection/reorder` lato server, riusabile pattern per altre collection.
5. **Bulk actions**: assenti. Considerare select-all + delete/publish/unpublish multipli per liste grandi (blog posts, bookings).
6. **JSON-text mixed editor**: `HomepageManager.jsx` espone una textarea JSON grezza per le sezioni `site_content`. Sostituire con form auto-generato dallo schema `shared/contentSchema.js` (pattern già usato in `ContentEditor.jsx`).

### Componenti admin riusabili da creare

| Componente | Priorità | Note |
|---|---|---|
| `<ImageField>` | ALTA | input file + preview + upload + URL manuale; riusato in 5+ form |
| `<SortableList>` | ALTA | drag-drop con `dnd-kit` per qualsiasi collection con `sort_order` |
| `<DataTable>` | MEDIA | tabella con sort, filter, search, pagination, bulk select |
| `<RichTextField>` | MEDIA | TipTap o Lexical per body lunghi |
| `<FormBuilder>` | BASSA | astrarre la logica auto-form da `ContentEditor` per altre sezioni |
| `<ConfirmDialog>` | BASSA | sostituire `window.confirm` |

### Decisioni di design pending

1. **CMS pattern uniforme**: oggi coesistono `site_content` (key/value JSON) + tabelle dedicate. Stabilire la regola: **tabella dedicata sempre per liste**, `site_content` solo per singleton di pagina/sezione.
2. **`footerNav` e `SYSTEM_FOOTER_LINKS`**: il pattern attuale (CMS letto ma sovrascritto da costante hardcoded) è confuso. Decidere: rimuovere il sovrascritto, oppure unificare con schema `nav_links` proposto.
3. **Newsletter delivery**: oggi le iscrizioni vanno in DB ma nessuna email viene mandata. Decidere provider (Resend / Mailchimp / Brevo) — vedere Task 2 per audit email completo.
4. **Schema.org dinamico**: il blocco JSON-LD HomePage ha valori hardcoded che divergono dai dati reali (es. `acceptsReservations: true` mentre il sito usa OpenTable esterno). Decidere autorità: derivare tutto da `restaurant` CMS.

---

## 8. Suggerimento split PR

Le lacune sono **troppo grandi per un singolo merge**. Suggerisco split in 3 PR sequenziali (vedi sezione 6) per:

- **PR 1** — Site fundamentals: nav, footer, hours, SEO globale
- **PR 2** — Homepage + experience-page lean (cooking, wine, music)
- **PR 3** — Pagine secondarie (about, contact, faq, menu, private events)

PR 4 (Privacy, Booking copy, form options Catering) **rimandata** salvo richiesta esplicita cliente.

**Pre-requisito comune (PR 0 raccomandato):** creare i componenti UI riusabili `<ImageField>` e `<SortableList>` in PR a sé stante. Senza questi, i 3 PR successivi duplicano logica.

---

## 9. Observations — out of scope

Trovati durante l'audit, **non fixare automaticamente**:

1. **Bug**: `ImagesPage.jsx:94` concatena `API_BASE` davanti a URL Supabase **già assolute**. In dev (`VITE_API_URL=http://localhost:3001`) il prefisso è errato. In prod (`API_BASE=''`) funziona per coincidenza.
2. **Bug**: `ContentContext.SYSTEM_FOOTER_LINKS` sovrascrive `footerNav` da CMS, di fatto rendendo il CMS footer inutile.
3. **Code smell**: doppio modello legacy (`cooking_classes`+`events`+`rsvp`) coesiste con `experience_events`+`bookings`. Sidebar admin mostra entrambi. Da consolidare.
4. **Code smell**: JSON-DB residuo (`server/db/database.js`, `server/data/db.json`) non usato dalle route correnti. Da rimuovere.
5. **Code smell**: `src/data/cookingClasses.js` quasi vuoto (1 riga stub).
6. **Sicurezza**: `JWT_SECRET` ha fallback insecure in dev. OK in dev ma documentare.
7. **Sicurezza**: nessun rate limit sul fetch `/api/content` pubblico (potenziale abuso). 100/15m globale è generico.
8. **Performance**: tutti i fetch `homepage-content/all` e `catering-content/all` ritornano TUTTE le collection in un solo round trip — ok ma cache mancante (no `Cache-Control` headers).
9. **A11y**: `usePageMetadata` setta titoli ma non `lang` sui block lingua mista (es. "La specialità · Pasta alla Norma" ha italiano in pagina inglese). Out of scope ma da notare.
10. **i18n**: nessun supporto multi-lingua, però sito ha mix italiano/inglese (es. "La specialità", nomi piatti italiani). Decidere se internazionalizzare in futuro.

---

## 10. Effort totale stimato

| PR | Effort | Note |
|---|---|---|
| PR 0 (componenti riusabili) | 1-2 giorni | `<ImageField>`, `<SortableList>` |
| PR 1 (fundamentals) | 2-3 giorni | nav, footer, hours, SEO |
| PR 2 (homepage + exp lean) | 3-4 giorni | molto contenuto da migrare |
| PR 3 (pagine secondarie) | 2-3 giorni | About, Contact, FAQ, Menu, Private Events |
| **TOTALE** | **8-12 giorni** | senza rischi sconosciuti |

Effort esclude:
- Fix dei "Observations" (~0.5-1 giorno cleanup separato)
- PR 4 opzionale (Privacy/Booking copy — RIMANDATA)
- Task 2 (Booking System audit)

---

## Decisioni richieste prima della FASE B

1. **Approvazione split in 3 PR** (PR 0+1+2+3) o preferenza diversa?
2. **PR 4 opzionale** (Privacy Policy, Booking copy, Catering form options): da fare ora o rimandare?
3. **Componente Rich Text Editor**: TipTap, Lexical, o textarea Markdown light come oggi?
4. **`footerNav` SYSTEM override**: rimuovere o consolidare nello schema nav_links?
5. **Modello legacy** (cooking_classes/events/rsvp): consolidare in `experience_events` ora oppure lasciare e nascondere voci legacy in sidebar admin?
6. **Schema.org Restaurant**: derivare interamente da `restaurant` CMS (richiede campi nuovi: cuisine[], priceRange, opening_hours_spec)? Oppure tenere parte hardcoded?
7. **Newsletter provider**: scegliere per integrare email delivery (Resend raccomandato — economico, dev-friendly)?
8. **Cleanup `Observations`**: bundlare nel PR 1 o tenerli come PR di cleanup separato?

---

**Fine Fase A.** Attendere approvazione e risposte alle 8 decisioni sopra prima di procedere con la FASE B.
