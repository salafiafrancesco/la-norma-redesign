# Deploy Guide — La Norma Ristorante

## Architettura

```
GitHub Repo
├── src/          → Frontend React (deploy su Vercel o Netlify)
├── server/       → Backend Express (deploy su Render o Railway)
└── dist/         → Build output (generato da npm run build, NON committare)
```

---

## 1. Backend — Render

### Configurazione servizio

| Campo           | Valore                        |
|-----------------|-------------------------------|
| **Repository**  | il tuo repo GitHub            |
| **Root Dir**    | `server`                      |
| **Runtime**     | Node                          |
| **Build Cmd**   | `npm install`                 |
| **Start Cmd**   | `node index.js`               |

### Environment Variables (da impostare nel dashboard Render)

| Variabile         | Valore                                              |
|-------------------|-----------------------------------------------------|
| `NODE_ENV`        | `production`                                        |
| `PORT`            | `10000`                                             |
| `JWT_SECRET`      | stringa random lunga (min 32 char) — genera con: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `ADMIN_USERNAME`  | `admin` (o nome a scelta)                           |
| `ADMIN_PASSWORD`  | password sicura a scelta                            |
| `ALLOWED_ORIGINS` | URL del tuo frontend, es. `https://lanorma.vercel.app` |

### Prima deploy — popolare il database

Dopo il primo deploy, apri la **Render Shell** del servizio e lancia:

```bash
node db/seed.js
```

Questo popola tutto il contenuto del sito, le cooking classes e gli eventi.
Il server crea automaticamente l'admin user al primo avvio anche senza seed.

> ⚠️ **Nota importante**: Render free tier ha filesystem effimero.
> I dati scritti a runtime (RSVP, immagini caricate, contenuto editato dall'admin)
> vengono persi ad ogni nuovo deploy. Per dati persistenti, usa Render paid tier
> con un Persistent Disk collegato a `/opt/render/project/src/data`.

---

## 2. Frontend — Vercel

### Configurazione progetto

| Campo            | Valore              |
|------------------|---------------------|
| **Framework**    | Vite                |
| **Root Dir**     | `/` (repo root)     |
| **Build Cmd**    | `npm run build`     |
| **Output Dir**   | `dist`              |
| **Install Cmd**  | `npm install`       |

### Environment Variables (da impostare nel dashboard Vercel)

| Variabile       | Valore                                              |
|-----------------|-----------------------------------------------------|
| `VITE_API_URL`  | URL del backend Render, es. `https://la-norma-api.onrender.com` |

> Il `vercel.json` nella root gestisce già il routing SPA e la rotta `/admin`.

---

## 2b. Frontend — Netlify (alternativa a Vercel)

| Campo            | Valore              |
|------------------|---------------------|
| **Build Cmd**    | `npm run build`     |
| **Publish Dir**  | `dist`              |

Environment variable: `VITE_API_URL` → URL del backend Render.

Il file `public/_redirects` gestisce già il routing SPA.

---

## 3. Sviluppo locale

```bash
# Installa dipendenze frontend
npm install

# Installa dipendenze backend
cd server && npm install && cd ..

# Popola il database (una volta sola)
cd server && node db/seed.js && cd ..

# Avvia tutto (frontend + backend in parallelo)
npm run dev
```

Frontend: http://localhost:5173
Backend:  http://localhost:3001
Admin:    http://localhost:5173/admin

---

## 4. Comandi utili

```bash
# Build produzione frontend
npm run build

# Avvia solo il backend
npm run server

# Reset completo del database (cancella tutto e ri-popola)
cd server
rm data/db.json
node db/seed.js

# Verifica che il backend sia up
curl https://la-norma-api.onrender.com/api/health
```

---

## 5. File da NON committare

Già esclusi dal `.gitignore`:

- `server/.env` — credenziali backend
- `server/data/` — database JSON
- `server/uploads/` — immagini caricate
- `.env` / `.env.local` — variabili frontend
- `dist/` — build output
- `node_modules/`
