import API_BASE from '../../config/api';
import { fallbackBlogPosts, normalizeBlogPost } from '../../data/blog';

const BASE = `${API_BASE}/api`;
const ADMIN_CACHE_PREFIX = 'ln_admin_cache:';
const ADMIN_CACHE_TTL = 2 * 60 * 1000;

function getToken() {
  return localStorage.getItem('ln_admin_token');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(method, path, body) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE}${path}`, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || `Request failed (${response.status})`);
    error.status = response.status;
    error.data = data;
    error.path = path;
    throw error;
  }

  return data;
}

function getCacheStore() {
  if (typeof window === 'undefined') return null;

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function readCachedValue(key, maxAge = ADMIN_CACHE_TTL) {
  const store = getCacheStore();
  if (!store) return null;

  try {
    const raw = store.getItem(`${ADMIN_CACHE_PREFIX}${key}`);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.timestamp || !('data' in parsed)) return null;
    if (Date.now() - parsed.timestamp > maxAge) return null;

    return parsed.data;
  } catch {
    return null;
  }
}

function writeCachedValue(key, data) {
  const store = getCacheStore();
  if (!store) return;

  try {
    store.setItem(
      `${ADMIN_CACHE_PREFIX}${key}`,
      JSON.stringify({
        timestamp: Date.now(),
        data,
      }),
    );
  } catch {
    // Ignore storage quota / privacy mode failures.
  }
}

async function requestCachedList(path, params = {}, options = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== ''),
    ),
  ).toString();

  const fullPath = `${path}${qs ? `?${qs}` : ''}`;
  const maxAge = options.maxAge ?? ADMIN_CACHE_TTL;

  try {
    const data = await request('GET', fullPath);
    if (Array.isArray(data)) {
      writeCachedValue(fullPath, data);
    }
    return data;
  } catch (error) {
    if (error?.status === 429) {
      const cached = readCachedValue(fullPath, maxAge);
      if (cached) {
        return cached;
      }
    }

    throw error;
  }
}

function isMissingEndpointError(error) {
  return (
    error?.status === 404 ||
    /endpoint not found/i.test(error?.message || '') ||
    /request failed \(404\)/i.test(error?.message || '')
  );
}

function filterBlogPosts(posts, params = {}) {
  const status = String(params.status ?? '').trim().toLowerCase();
  const search = String(params.search ?? '').trim().toLowerCase();
  const category = String(params.category ?? '').trim();
  const tag = String(params.tag ?? '').trim().toLowerCase();

  return posts.filter((post) => {
    if (status && post.status !== status) return false;
    if (category && post.category !== category) return false;
    if (tag && !post.tags.some((entry) => entry.toLowerCase() === tag)) return false;

    if (search) {
      const haystack = [
        post.title,
        post.slug,
        post.excerpt,
        post.category,
        ...post.tags,
      ]
        .join(' ')
        .toLowerCase();

      if (!haystack.includes(search)) return false;
    }

    return true;
  });
}

function toAdminBlogShape(post) {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    body: post.body ?? '',
    category: post.category,
    tags: Array.isArray(post.tags) ? post.tags : [],
    author_name: post.author_name ?? post.authorName ?? 'La Norma Editorial Team',
    cover_image: post.cover_image ?? post.coverImage ?? '',
    cover_image_alt: post.cover_image_alt ?? post.coverImageAlt ?? '',
    seo_title: post.seo_title ?? post.seoTitle ?? post.title,
    seo_description: post.seo_description ?? post.seoDescription ?? post.excerpt,
    featured: Boolean(post.featured),
    status: post.status ?? 'published',
    published_at: post.published_at ?? post.publishedAt ?? '',
    created_at: post.created_at ?? post.createdAt ?? post.publishedAt ?? '',
    updated_at: post.updated_at ?? post.updatedAt ?? post.publishedAt ?? '',
    read_time: post.read_time ?? post.readTime ?? 4,
  };
}

async function fetchPublicBlogPosts(params = {}) {
  const publicParams = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([key]) => key !== 'status' && params[key] !== undefined && params[key] !== ''),
    ),
  ).toString();

  const response = await fetch(`${BASE}/blog${publicParams ? `?${publicParams}` : ''}`);
  if (!response.ok) {
    throw new Error(`Public blog request failed (${response.status})`);
  }

  const data = await response.json().catch(() => []);
  return Array.isArray(data) ? data.map((post) => normalizeBlogPost(post)) : [];
}

async function listBlogPostsWithMeta(params = {}) {
  const qs = new URLSearchParams(params).toString();

  try {
    const items = await request('GET', `/blog/all${qs ? `?${qs}` : ''}`);
    return { items, source: 'admin' };
  } catch (error) {
    if (!isMissingEndpointError(error)) {
      throw error;
    }

    try {
      const publicItems = await fetchPublicBlogPosts(params);
      return {
        items: filterBlogPosts(publicItems, params).map(toAdminBlogShape),
        source: 'public-fallback',
      };
    } catch {
      return {
        items: filterBlogPosts(fallbackBlogPosts, params).map(toAdminBlogShape),
        source: 'seed-fallback',
      };
    }
  }
}

async function fetchPublicCollection(path, params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== ''),
    ),
  ).toString();

  const response = await fetch(`${BASE}${path}${qs ? `?${qs}` : ''}`);
  if (!response.ok) {
    throw new Error(`Public collection request failed (${response.status})`);
  }

  const data = await response.json().catch(() => []);
  return Array.isArray(data) ? data : [];
}

async function listCollectionWithMeta({ adminPath, publicPath, params = {} }) {
  const qs = new URLSearchParams(params).toString();

  try {
    const items = await request('GET', `${adminPath}${qs ? `?${qs}` : ''}`);
    return { items, source: 'admin' };
  } catch (error) {
    if (!isMissingEndpointError(error)) {
      throw error;
    }

    const publicItems = await fetchPublicCollection(publicPath, params);
    return { items: publicItems, source: 'public-fallback' };
  }
}

export const auth = {
  login: (username, password) => request('POST', '/auth/login', { username, password }),
  me: () => request('GET', '/auth/me'),
  changePassword: (currentPassword, newPassword) =>
    request('POST', '/auth/change-password', { currentPassword, newPassword }),
  logout: () => localStorage.removeItem('ln_admin_token'),
  saveToken: (token) => localStorage.setItem('ln_admin_token', token),
  getToken,
};

export const content = {
  getAll: () => request('GET', '/content'),
  getSection: (section) => request('GET', `/content/${section}`),
  updateSection: (section, data) => request('PUT', `/content/${section}`, data),
};

export const blog = {
  list: async (params = {}) => (await listBlogPostsWithMeta(params)).items,
  listWithMeta: listBlogPostsWithMeta,
  get: (slug) => request('GET', `/blog/${slug}`),
  create: (data) => request('POST', '/blog', data),
  update: (id, data) => request('PUT', `/blog/${id}`, data),
  delete: (id) => request('DELETE', `/blog/${id}`),
};

export const classes = {
  list: async () => (await listCollectionWithMeta({ adminPath: '/classes/all', publicPath: '/classes' })).items,
  listWithMeta: () => listCollectionWithMeta({ adminPath: '/classes/all', publicPath: '/classes' }),
  get: (id) => request('GET', `/classes/${id}`),
  create: (data) => request('POST', '/classes', data),
  update: (id, data) => request('PUT', `/classes/${id}`, data),
  delete: (id) => request('DELETE', `/classes/${id}`),
};

export const rsvp = {
  list: (params = {}) => {
    return requestCachedList('/rsvp', params);
  },
  updateStatus: (id, status) => request('PUT', `/rsvp/${id}`, { status }),
  delete: (id) => request('DELETE', `/rsvp/${id}`),
};

export const events = {
  list: async (params = {}) => (
    await listCollectionWithMeta({ adminPath: '/events/all', publicPath: '/events', params })
  ).items,
  listWithMeta: (params = {}) => listCollectionWithMeta({ adminPath: '/events/all', publicPath: '/events', params }),
  get: (id) => request('GET', `/events/${id}`),
  create: (data) => request('POST', '/events', data),
  update: (id, data) => request('PUT', `/events/${id}`, data),
  delete: (id) => request('DELETE', `/events/${id}`),
};

export const cateringRequests = {
  list: (params = {}) => requestCachedList('/catering/requests', params),
  update: (id, data) => request('PUT', `/catering/requests/${id}`, data),
  delete: (id) => request('DELETE', `/catering/requests/${id}`),
};

export const inquiries = {
  list: (params = {}) => {
    return requestCachedList('/inquiries', params);
  },
  update: (id, data) => request('PUT', `/inquiries/${id}`, data),
  delete: (id) => request('DELETE', `/inquiries/${id}`),
};

export const uploads = {
  list: () => request('GET', '/upload'),
  upload: async (file) => {
    const form = new FormData();
    form.append('image', file);

    const response = await fetch(`${BASE}/upload`, {
      method: 'POST',
      headers: authHeaders(),
      body: form,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    return data;
  },
  delete: (filename) => request('DELETE', `/upload/${filename}`),
};
