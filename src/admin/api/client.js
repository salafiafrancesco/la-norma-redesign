/**
 * Admin API client
 * All requests go to /api/* (proxied to the Express server by Vite)
 */

const BASE = `${import.meta.env.VITE_API_URL ?? ''}/api`;

function getToken() {
  return localStorage.getItem('ln_admin_token');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(method, path, body) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// ── Auth ─────────────────────────────────────────────────────────
export const auth = {
  login: (username, password) => request('POST', '/auth/login', { username, password }),
  me: () => request('GET', '/auth/me'),
  changePassword: (currentPassword, newPassword) =>
    request('POST', '/auth/change-password', { currentPassword, newPassword }),
  logout: () => localStorage.removeItem('ln_admin_token'),
  saveToken: (token) => localStorage.setItem('ln_admin_token', token),
  getToken,
};

// ── Site content ──────────────────────────────────────────────────
export const content = {
  getAll: () => request('GET', '/content'),
  getSection: (section) => request('GET', `/content/${section}`),
  updateSection: (section, data) => request('PUT', `/content/${section}`, data),
};

// ── Cooking classes ───────────────────────────────────────────────
export const classes = {
  list: () => request('GET', '/classes/all'),
  get: (id) => request('GET', `/classes/${id}`),
  create: (data) => request('POST', '/classes', data),
  update: (id, data) => request('PUT', `/classes/${id}`, data),
  delete: (id) => request('DELETE', `/classes/${id}`),
};

// ── RSVP ─────────────────────────────────────────────────────────
export const rsvp = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `/rsvp${qs ? '?' + qs : ''}`);
  },
  updateStatus: (id, status) => request('PUT', `/rsvp/${id}`, { status }),
  delete: (id) => request('DELETE', `/rsvp/${id}`),
};

// ── Events ────────────────────────────────────────────────────────
export const events = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `/events/all${qs ? '?' + qs : ''}`);
  },
  get: (id) => request('GET', `/events/${id}`),
  create: (data) => request('POST', '/events', data),
  update: (id, data) => request('PUT', `/events/${id}`, data),
  delete: (id) => request('DELETE', `/events/${id}`),
};

// ── Inquiries ─────────────────────────────────────────────────────
export const inquiries = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `/inquiries${qs ? '?' + qs : ''}`);
  },
  update: (id, data) => request('PUT', `/inquiries/${id}`, data),
  delete: (id) => request('DELETE', `/inquiries/${id}`),
};

// ── Uploads ───────────────────────────────────────────────────────
export const uploads = {
  list: () => request('GET', '/upload'),
  upload: async (file) => {
    const form = new FormData();
    form.append('image', file);
    const res = await fetch(`${BASE}/upload`, {
      method: 'POST',
      headers: authHeaders(),
      body: form,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },
  delete: (filename) => request('DELETE', `/upload/${filename}`),
};
