# Booking System Audit — La Norma Ristorante

**Branch:** `main` (audit content), prossimi PR su `audit/booking-system` se approvato
**Data report:** 2026-05-09
**Stato:** FASE A — Report read-only. Nessuna modifica al codice. Attendere approvazione + risposte alle decisioni di business prima di FASE B (Milestone 1).

> Obiettivo: verificare che il sistema esperienze (Cooking / Wine / Live Music) sia solido, completo, e pronto per integrare Stripe + pannello utente.

---

## Sommario esecutivo

Il booking system **funziona end-to-end in modalità "request-only"**: 3 esperienze pubbliche, schema unificato `experience_events` + `bookings`, admin tab CRUD su entrambi, CSV export. **Non è invece pronto per Stripe né per pannello utente** — mancano email, audit log, idempotency, race-condition handling, sistema auth utenti, magic link, refund policy.

**Verdetto sintetico:**

| Area | Stato |
|---|---|
| Frontend booking flow (state machine, validazioni, persistenza session) | ✅ MATURO |
| Backend bookings + experience_events (CRUD, capacity) | ⚠️ FUNZIONANTE con race conditions |
| Admin booking management (events tab + bookings tab + CSV export) | ✅ MATURO |
| Email transazionali | ❌ ASSENTE COMPLETAMENTE |
| Stripe integration | ❌ SOLO SCAFFOLD NON FUNZIONANTE |
| User account / pannello utente | ❌ ASSENTE COMPLETAMENTE |
| Refund policy | ❌ ASSENTE NEL CODICE |
| Confirmation token UX | ⚠️ GENERATO MA NON RECAPITATO |

**5 BLOCKER per Stripe:** mailer non installato, `bookings` non ha colonne Stripe, no webhook, no idempotency, no audit log.

**6 BLOCKER per pannello utente:** tabella users assente, no auth utente, no magic link, no /account, no /my-bookings, mailer non installato.

---

## 1. Booking system attuale — inventario

### 1.1 Esperienze gestite (3)

| Tipo | Pagina pubblica | Booking widget | Schema record |
|---|---|---|---|
| `cooking_class` | `/cooking-classes` | `<ExperienceBooking experienceType="cooking_class" paymentMode="request" minGuests={1} maxGuests={8}>` | `experience_events.type = 'cooking_class'` |
| `wine_tasting` | `/wine-tastings` | `<ExperienceBooking experienceType="wine_tasting" paymentMode="request" minGuests={1} maxGuests={8}>` | `experience_events.type = 'wine_tasting'` |
| `live_music` | `/live-music` | `<ExperienceBooking experienceType="live_music" paymentMode="request" minGuests={1} maxGuests={8}>` | `experience_events.type = 'live_music'` |

**Booking widget unificato**: `src/components/ExperienceBooking/ExperienceBooking.jsx` (562 righe). **Una sola implementazione condivisa** — non duplicato. ✅

### 1.2 State machine flusso pubblico

```
SELECT_DATE → SELECT_GUESTS → CONTACT_DETAILS → [PAYMENT] → CONFIRMATION
                                                  ↑
                                                  skipped if paymentMode === 'request'
```

- Persistenza in `sessionStorage` con prefisso `ln_booking_${experienceType}` (date, guests, contact, specialRequests, stepIndex). Pulita post-submit.
- Sticky bar mobile + bottom sheet riepilogativo via `IntersectionObserver`.
- Validazioni client: required name, email regex, range guests, evento non sold-out.

### 1.3 Schema DB

**IMPORTANTE:** lo schema `bookings` ed `experience_events` **non è versionato** nel repo. `init.js` solo SEED-a record se le tabelle sono vuote. Le tabelle devono esistere già su Supabase (probabilmente create via dashboard manualmente). Nessuna folder `migrations/` né file `.sql`.

**`experience_events`** (inferito):
```
id BIGSERIAL PK
type TEXT             -- enum cooking_class|wine_tasting|live_music
title TEXT NOT NULL
description TEXT
date DATE
start_time TEXT
end_time TEXT
price_cents INT
currency TEXT DEFAULT 'USD'
capacity INT          -- 0 = unlimited
seats_booked INT DEFAULT 0
difficulty TEXT
image_url TEXT
status TEXT           -- enum draft|published|cancelled|sold_out
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

**`bookings`** (inferito):
```
id BIGSERIAL PK
event_id BIGINT FK -> experience_events.id (nullable)
customer_name TEXT
customer_email TEXT
customer_phone TEXT
guests INT
total_cents INT
currency TEXT
status TEXT           -- enum pending|paid|confirmed|cancelled|refunded
payment_mode TEXT     -- enum stripe|request
special_requests TEXT
confirmation_token TEXT (unique implicit)
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

**Mancanti per Stripe**: `stripe_session_id`, `stripe_payment_intent_id`, `paid_at`, `refunded_at`, `cancellation_reason`, `user_id`, `expires_at` (per pending hold).
**Mancanti per audit**: tabella `booking_events_log`.
**Mancanti per user account**: tabella `users`.

### 1.4 Submit flow attuale

`POST /api/bookings`:
1. Valida nome, email regex, guests 1–50.
2. Se `event_id`: load event, **rifiuta se status !== 'published'**, controlla `seats_booked + guests <= capacity` (capacity 0 = unlimited).
3. Genera `confirmation_token` (24 byte base64url ≈ 192 bit entropy).
4. Inserisce `bookings` con `status = paymentMode === 'stripe' ? 'pending' : 'confirmed'`.
5. Aggiorna `seats_booked += guests` (NON ATOMICO — race condition).
6. Risponde `{ ok, id, confirmation_token, status, total_cents, currency }`.

**Issue:** confirmation_token ritornato in JSON ma **NON mostrato all'utente** né inviato per email. Token orfano — l'utente non può riaccedere alla pagina `/booking/:token`.

---

## 2. Admin coverage booking — verifica esplicita

| Capability | Stato | File |
|---|---|---|
| Creare evento | ✅ | `ExperiencesManager.jsx` EventModal |
| Modificare evento | ✅ | come sopra |
| Eliminare evento | ✅ (window.confirm) | come sopra. **NO cascade gestito** — bookings con FK orfano |
| Definire prezzo (price_cents, currency) | ✅ | EventModal |
| Definire capacità (capacity, 0=unlimited) | ✅ | EventModal |
| Vedere seats prenotati real-time | ✅ | tabella mostra `seats_booked / capacity` |
| Marcare evento SOLD_OUT manualmente | ✅ | status select nel modal |
| Cancellare evento + refund placeholder | ⚠️ | status `cancelled` esistente ma nessuna chiamata Stripe / nessuna re-emissione automatica |
| Duplicare evento (per ricorrenze) | ❌ | NON IMPLEMENTATO — utile per Wed/Sat ricorrenti |
| Bulk publish/unpublish | ❌ | NO bulk actions |
| Vista calendario | ❌ | solo tabella lineare |
| Filtri (tipo, stato, data) | ⚠️ | filtro `type` presente, niente per status/data |
| Sort | ❌ | ordine `date desc` hardcoded |

| Bookings management | Stato | Note |
|---|---|---|
| Lista bookings | ✅ | tabella in `BookingsTab` |
| Filtro per evento | ✅ | `?event_id=` server-side, dropdown UI |
| Filtro per status | ✅ | dropdown |
| Search per email/nome | ✅ | server-side `ilike` (⚠️ minor SQL inject su `%`/`,` da sanitizzare) |
| Cambio status manuale | ✅ | inline select (release/re-reserve seats automatico) |
| Vista dettaglio | ✅ | modal con email reply mailto: |
| **Export CSV** | ✅ | `exportBookingsCsv` line 32, file `bookings-YYYY-MM-DD.csv` |
| Bulk actions (delete/confirm/cancel multiplo) | ❌ | NON IMPLEMENTATO |
| Pagination | ❌ | tutti i record in una pagina |

---

## 3. Email transazionali — STATO ZERO

**Nessun provider installato.** Verificato:
- Deps `server/package.json`: solo bcryptjs/cors/dotenv/express/express-rate-limit/helmet/jsonwebtoken/multer.
- Root `package.json`: idem zero email packages.
- Grep `nodemailer|resend|sendgrid|postmark|mailgun|brevo|sendMail|sendEmail` in `server/`: 0 match.
- Nessun file `lib/email.js`, `lib/mailer.js`, `lib/notifications.js`.

**Email mancanti (ZERO inviate oggi):**

| Email | Trigger | Stato |
|---|---|---|
| Conferma prenotazione cliente | Post `POST /api/bookings` success | ❌ NON INVIATA |
| Notifica nuova prenotazione al ristorante | Post `POST /api/bookings` success | ❌ NON INVIATA |
| Reminder pre-evento (24h) | Cron job | ❌ NON INVIATA (manca anche cron infra) |
| Cancellazione/refund | Status change → cancelled/refunded | ❌ NON INVIATA |
| Modifica orario evento | Event update | ❌ NON INVIATA |
| Newsletter delivery | Subscribe | ❌ subscriber salvato in DB ma niente invio |

**Template:** non esistono. Hardcoded sarebbe inevitabile finché non si introduce un mailer.
**Bounce/error handling:** n/a.

---

## 4. Stripe readiness — checklist puntuale

| Item | Stato | Riferimento |
|---|---|---|
| Env vars `STRIPE_SECRET_KEY/PUBLISHABLE_KEY/WEBHOOK_SECRET/TEST_MODE` | ✅ PRONTO | `.env.example` line 22-26 |
| Pacchetto `stripe` npm installato | ❌ DA FARE | non in `server/package.json` |
| Helper `lib/stripe.js` funzionante | ❌ DA FARE | scaffold con throw "not yet implemented" |
| Route `POST /api/checkout/create-session` | ❌ DA FARE | non esiste |
| Webhook handler `POST /api/webhooks/stripe` | ❌ DA FARE | non esiste |
| Webhook secret + signature verification | ❌ DA FARE | scaffold throw |
| Idempotency keys su create-session | ❌ DA FARE | n/a |
| Schema field `stripe_session_id` | ❌ DA FARE | non in `bookings` |
| Schema field `stripe_payment_intent_id` | ❌ DA FARE | non in `bookings` |
| Schema field `paid_at`, `refunded_at` | ❌ DA FARE | non in `bookings` |
| Schema field `expires_at` (pending hold) | ❌ DA FARE | senza questo i pending bloccano seats indefinitamente |
| Tabella audit log `booking_events_log` | ❌ DA FARE | non esiste |
| Pagina `/booking/success?session_id=...` | ⚠️ PRESENTE statica | `BookingSuccessPage.jsx` non legge query string |
| Pagina `/booking/cancelled` | ✅ PRESENTE statica | `BookingCancelledPage.jsx` |
| Pagina `/booking/:token` recupero | ✅ FUNZIONANTE | `BookingDetailPage.jsx` |
| Refund policy + cutoff | ❌ DA FARE | nessuna |
| Test mode flag | ⚠️ ENV PRONTO ma non cablato | `lib/stripe.js:12` const `IS_TEST_MODE` non usata |
| Frontend redirect a Checkout | ❌ DA FARE | `renderPaymentPlaceholder` chiama `handleSubmit` invece di redirect |

---

## 5. User account readiness — checklist puntuale

| Item | Stato | Note |
|---|---|---|
| Tabella `users` (separata da admin_users) | ❌ DA FARE | non esiste |
| Auth signup (email + password) | ❌ DA FARE | non esiste |
| Login utente | ❌ DA FARE | `auth.js` è solo admin |
| **Magic link / OTP (RACCOMANDATO per ristorante)** | ❌ DA FARE | requires mailer prima |
| Password reset | ❌ DA FARE | n/a |
| Pagina `/account` o `/my-bookings` | ❌ DA FARE | nessuna page key in `shared/routes.js` |
| Lista bookings utente | ❌ DA FARE | n/a |
| Dettaglio booking (autenticato, da account) | ⚠️ token-based esistente | `/booking/:token` accessibile a chiunque ha il link |
| Ricevuta PDF | ❌ DA FARE | nessuna libreria PDF (pdfkit, puppeteer) |
| Cancellazione self-service con regole refund | ❌ DA FARE | endpoint pubblico assente |
| Modifica profilo (email, phone, dietary) | ❌ DA FARE | n/a |
| Storico eventi passati separato | ❌ DA FARE | n/a |
| Email link diretto al booking detail | ⚠️ Token c'è ma non recapitato | manca mailer |

---

## 6. Confirmation token flow — issue UX

- **Generazione:** `crypto.randomBytes(24).toString('base64url')` in `bookings.js:18`. Sempre generato. ✅
- **Salvataggio:** in colonna `confirmation_token`. ✅
- **Consegna all'utente:** ⚠️ ritornato in JSON response ma **NON mostrato in UI** né inviato via email. Token orfano.
- **`BookingDetailPage` `/booking/:token`:** ✅ funzionante, mostra dati booking + event. Pubblico (chi ha link vede tutto). Niente cancel self-service, niente PDF.

**Fix suggerito (basso effort, no business decision):** mostrare token + link `/booking/:token` nella schermata `CONFIRMATION` con copy-to-clipboard. Anche senza email, l'utente potrebbe salvarlo o screenshottarlo. Sarà comunque sostituito da email link quando il mailer sarà implementato.

---

## 7. Race conditions — issue concorrenza

**`POST /api/bookings`:**
```js
// pseudocodice attuale
event = supabase.from('experience_events').select().eq('id', event_id);
if (event.seats_booked + guests > event.capacity) reject;
booking = supabase.from('bookings').insert({...});
supabase.from('experience_events').update({ seats_booked: event.seats_booked + guests }).eq('id', event_id);
```

Tra il read e l'update, due richieste simultanee possono entrambe vedere lo stesso `seats_booked` e bookare oltre capacity. **Soluzioni:**

1. **PostgreSQL atomic update con CTE/RETURNING**:
   ```sql
   UPDATE experience_events
   SET seats_booked = seats_booked + $guests
   WHERE id = $event_id AND (capacity = 0 OR seats_booked + $guests <= capacity)
   RETURNING *;
   ```
   Se `RETURNING` ritorna 0 righe → sold out.
2. **Supabase RPC function** che incapsula l'aggiornamento atomico.
3. **Row-level lock** via `SELECT ... FOR UPDATE` in transazione (richiede Supabase pg client diretto).

**`PUT /:id` admin status change** ha lo stesso problema su release/re-reserve.

---

## 8. Decisioni di business critiche pending

Senza queste risposte non si può iniziare la Fase B della Milestone 1 (in particolare email + Stripe).

### Prima domanda: provider email

| Domanda | Opzioni | Raccomandazione |
|---|---|---|
| Provider transazionale | Resend / Postmark / SES / SendGrid | **Resend** — economico ($0 fino a 3k email/mese, $20 per 50k), API moderna, integrazione Vercel native, deliverability ottima |
| Domain SPF/DKIM/DMARC | Configurato? | Va impostato su `lanormarestaurant.com` (o dominio in uso) prima di mandare email |
| FROM address | `bookings@lanormarestaurant.com` o altro | scegliere e verificare |

### Per Live Music

| Domanda | Risposta richiesta |
|---|---|
| Free reservation / card hold / deposit? | Oggi è "request" senza pagamento. Mantenere così? Card hold per no-show prevention? |

### Per Cooking Class / Wine Tasting

| Domanda | Risposta richiesta |
|---|---|
| Pagamento totale al booking o caparra? | Cooking class $95×8 = $760 totale. Caparra 30% comune nel settore |
| Tax / service fee | Aggiungere `tax_cents` / `service_fee_cents`? |

### Refund policy (logica automatica)

| Domanda | Risposta richiesta |
|---|---|
| Cutoff per cancellazione full refund | 24h / 48h / 72h prima dell'evento? |
| Cancellazione tardiva | No refund / 50% refund? |
| Self-service o solo admin? | Solo admin (più sicuro) o self-service via token link? |
| Trigger per refund automatico | Webhook su cancellation? Manuale via admin? |

### Eventi privati / catering

| Domanda | Risposta richiesta |
|---|---|
| Stesso flusso bookings o sistema separato? | Oggi catering ha proprio `/api/catering/requests` flow. Mantenere separato? |

### Coupon / gift card

| Domanda | Risposta richiesta |
|---|---|
| Implementare promo code? | MVP o future? Impatta schema (sconto applicato a checkout) |
| Gift cards? | Future |

### Multi-currency

| Domanda | Risposta richiesta |
|---|---|
| Solo USD oppure aprire EUR/altri? | USD recommended per MVP |

### Account utente

| Domanda | Risposta richiesta |
|---|---|
| Account obbligatorio o guest checkout? | **Raccomandato**: guest checkout per MVP, account opzionale in Milestone 3 |
| Magic link vs password | **Raccomandato**: magic link (UX migliore per ristorante) |
| Link expiry | 15 min standard / 24h per booking access? |

---

## 9. Piano di implementazione proposto

### MILESTONE 1 — Solidify booking foundation (no Stripe)

**Effort stimato:** 3-4 giorni (post-decisioni business).

#### 1.1 Schema (idempotent migrations)
- Aggiungere a `bookings`: `stripe_session_id TEXT`, `stripe_payment_intent_id TEXT`, `paid_at TIMESTAMPTZ`, `refunded_at TIMESTAMPTZ`, `cancellation_reason TEXT`, `user_id BIGINT`, `expires_at TIMESTAMPTZ`.
- Nuova tabella `booking_events_log` (id, booking_id FK, event_type, payload JSONB, created_at) — audit per ogni cambio status / Stripe event.
- Nuova tabella `users` placeholder (id, email unique, name, phone, created_at, updated_at) — anche se non ancora autenticato per MVP.
- Migrations file in `server/db/migrations/` (versionato), eseguite via `init.js` ALTER TABLE ADD COLUMN IF NOT EXISTS / CREATE TABLE IF NOT EXISTS.

#### 1.2 Race condition fix
- Sostituire read+update di `seats_booked` con UPDATE atomico via Supabase RPC function `book_seats(event_id, guests)` che ritorna `seats_booked` aggiornato o errore "sold out". Equivalente per release.

#### 1.3 Email transazionali (Resend raccomandato)
- Install `resend` package.
- Env `RESEND_API_KEY`, `BOOKING_FROM_EMAIL`, `RESTAURANT_NOTIFY_EMAIL`.
- Helper `server/lib/mailer.js` con functions: `sendBookingConfirmation(booking, event)`, `sendRestaurantNotification(booking, event)`, `sendCancellation(booking, event, reason)`.
- Template inline JSX→HTML (oppure react-email se vogliamo più ricco).
- **Template editabili da admin** in v1.5: tabella `email_templates` (key, subject_template, html_template, text_template) con var substitution `{{customer_name}}` ecc. Decisione: in scope MVP o rimandato? Raccomando MVP per cliente self-service.
- Send su:
  - `POST /api/bookings` success → conferma cliente + notifica ristorante (parallelizzare con `Promise.all` ma non bloccare la response).
  - `PUT /:id` cambio status → email cancellation/confirmation.
- Bounce/error: log a `booking_events_log` con `event_type = 'email_sent' | 'email_failed'`.

#### 1.4 Confirmation token UX
- `ExperienceBooking.jsx` `renderConfirmation`: mostrare token + link copy-to-clipboard "View your booking: lanorma.com/booking/abc123...".
- Email template include lo stesso link.

#### 1.5 Admin enhancements
- Cancel event con cascade refund (placeholder per Stripe, manda email cancellation a tutti i bookings di quell'evento).
- Vista calendar (mese/settimana) opzionale — può rimandare a v1.5.
- Duplicate event button (utile per ricorrenze settimanali wine tasting).
- Bulk publish/unpublish.
- Filtri date range su events.

#### 1.6 Rate limiting & security
- Rate limit su `POST /api/bookings` (es. 5/h per IP, già infrastrutturato via `bookingSubmissionLimiter`).
- Sanitize search query in `bookings.js` GET / (escape `%`, `_` per ilike).

#### 1.7 README + .env.example aggiornati
- Sezione "Booking system" che descrive flow, schema, stati.
- Sezione "Email setup" con istruzioni Resend + DNS.
- Variabili Stripe in `.env.example` rimangono commentate (placeholder).

### MILESTONE 2 — Stripe integration (PR separato)

**Effort stimato:** 3-4 giorni.

- Install `stripe` package.
- Implementare `lib/stripe.js`: `createCheckoutSession`, `constructWebhookEvent`.
- Route `POST /api/checkout/create-session` con idempotency.
- Route `POST /api/webhooks/stripe` con signature verification, dedup via `event.id` (in `booking_events_log`).
- Frontend redirect a Stripe Checkout invece di `handleSubmit` direct.
- Pagina `/booking/success?session_id=X` legge query, aggiorna UI con stato pagamento.
- Refund policy logic con cutoff (decisione business).
- Test mode toggle.

### MILESTONE 3 — User account (PR separato)

**Effort stimato:** 4-5 giorni (con magic link).

- Route `/api/users/auth/magic-link` (genera token in `user_magic_links` table, email).
- Route `/api/users/auth/verify` (consume token, set session JWT).
- Pagine `/account` + `/account/bookings` (lista filtrata per `user_id` o email).
- Account merge: al primo magic link, retro-link delle bookings con stesso email.
- Self-service cancel con refund automatico (rispettando cutoff).
- PDF receipt via `pdfkit` o Vercel function.

### MILESTONE 4 — Reminder + automation (PR separato)

**Effort stimato:** 2-3 giorni.

- Cron job (Vercel Cron) `0 9 * * *` — invia reminder 24h prima evento.
- Email post-evento (ringraziamento, link recensioni).
- Calendar `.ics` allegato a confirmation email.
- Webhook bounce handling (Resend `email.bounced` event).

---

## 10. Effort totale

| Milestone | Effort | Note |
|---|---|---|
| Milestone 1 (foundation, request-only) | 3-4 giorni | core di questa Fase B |
| Milestone 2 (Stripe) | 3-4 giorni | task separato |
| Milestone 3 (user account) | 4-5 giorni | task separato |
| Milestone 4 (reminders) | 2-3 giorni | task separato |
| **Totale road-to-Stripe-and-account** | **12-16 giorni** | sequenziali |

---

## 11. Observations — out of scope

1. **SQL injection minore** in `bookings.js` GET / search ilike — non è blocker ma sanitizzare prima di Stripe.
2. **Schema non versionato** (no `migrations/` folder) — cambiare con migrations file ora che si tocca lo schema.
3. **Nessuna logica per evento "passato"** — `experience_events` filtra solo `date >= today`. Per gli storici bookings utili a un account utente serve mantenere accesso.
4. **`BookingSuccessPage.jsx` statica** — non legge `?session_id`, non mostra dati booking. Da rifare in Milestone 2.
5. **Token in URL clear-text** — chiunque con il link vede tutto. Per migliorare in Milestone 3 con account auth.
6. **`payment_mode='stripe'` testato in nessun path** — cambiare hardcoded delle 3 pagine + flusso Stripe in Milestone 2.
7. **JSON-DB legacy** (`server/db/database.js`, `server/data/db.json`) ancora presente, non usato dalle route.
8. **Doppio modello legacy** (`cooking_classes` + `events` + `rsvp` legacy vs `experience_events` + `bookings` nuovo) — admin sidebar mostra entrambi. Da consolidare.

---

## 12. Decisioni richieste prima della Fase B

Lista finale (15 punti). Senza queste risposte, Milestone 1 non può iniziare:

1. **Provider email**: Resend (raccomandato) / Postmark / SES / SendGrid?
2. **Domain email FROM**: `bookings@lanormarestaurant.com` o altro?
3. **Live Music**: free / card hold / deposit?
4. **Cooking Class pagamento**: full / 30% deposit / altro?
5. **Wine Tasting pagamento**: full / 50% deposit / altro?
6. **Tax & service fee**: includere `tax_cents` / `service_fee_cents` ora?
7. **Refund cutoff**: 24h / 48h / 72h prima evento?
8. **Refund self-service**: solo admin (sicuro) o cliente via token?
9. **Refund tardivo**: 0% / 50% / cancellation fee?
10. **Eventi privati**: stesso flusso bookings o separato?
11. **Coupon code / promo**: MVP o future?
12. **Gift cards**: MVP o future?
13. **Multi-currency**: solo USD o EUR/altri?
14. **Account utente in Milestone 3**: guest checkout MVP + account opzionale, oppure account obbligatorio?
15. **Email templates editabili da admin** (Milestone 1 v1.0 vs v1.5): MVP o rimandato?

---

**Fine Fase A.** Attendere approvazione e risposte alle 15 decisioni sopra prima di procedere con la FASE B (Milestone 1). Le Milestone 2-3-4 saranno task separati successivi.
