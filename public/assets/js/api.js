// ============================================================
// API CLIENT — Cloudflare Workers (D1 + R2)
// ============================================================

const PRODUCTION_API = 'https://myporto-api.lawlieth404.workers.dev';
const runtimeApi =
  typeof window !== 'undefined' && window.__PORTO_API_URL__
    ? window.__PORTO_API_URL__
    : '';
const API_URL = (runtimeApi || import.meta.env.VITE_API_URL || PRODUCTION_API).replace(/\/$/, '');
const TOKEN_KEY = 'auth_token';

export class AuthError extends Error {
  constructor(message, status = 401) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

/** Resolve media URL — relative paths need API base when frontend is on GitHub Pages */
export function resolveMediaUrl(url) {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

function isValidJwt(token) {
  return typeof token === 'string' && token.split('.').length === 3;
}

export function getToken() {
  let token = localStorage.getItem(TOKEN_KEY)?.trim();
  if (!token) {
    token = sessionStorage.getItem(TOKEN_KEY)?.trim();
    if (isValidJwt(token)) {
      localStorage.setItem(TOKEN_KEY, token);
      sessionStorage.removeItem(TOKEN_KEY);
    }
  }
  return isValidJwt(token) ? token : null;
}

export function setToken(token) {
  const t = token?.trim();
  if (!isValidJwt(t)) return;
  localStorage.setItem(TOKEN_KEY, t);
  sessionStorage.removeItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new CustomEvent('auth:logout'));
}

export function isApiConfigured() {
  return !!API_URL;
}

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();

  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  let res;
  try {
    res = await fetch(`${API_URL}/api${path}`, { ...options, headers });
  } catch {
    throw new Error('Koneksi API gagal. Periksa jaringan Anda.');
  }

  const text = await res.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!res.ok) {
    const msg = data?.error || `Request failed (${res.status})`;
    if (res.status === 401) {
      const keepToken =
        path === '/auth/login' ||
        path === '/auth/setup' ||
        path === '/auth/change-password';
      if (token && !keepToken) {
        clearToken();
        throw new AuthError(msg, 401);
      }
      throw new Error(msg);
    }
    throw new Error(msg);
  }

  return data;
}

// ── AUTH ──
export async function getSession() {
  if (!getToken()) return null;
  try {
    const data = await request('/auth/session');
    return { user: { id: data.user.id, email: data.user.email, role: data.user.role } };
  } catch (err) {
    if (err instanceof AuthError) return null;
    throw err;
  }
}

export async function login(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data;
}

export async function setupAdmin(email, password) {
  const data = await request('/auth/setup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data;
}

export function logout() {
  clearToken();
}

// ── POSTS ──
export async function fetchPublishedPosts() {
  return request('/posts?published=true');
}

export async function fetchPostBySlug(slug) {
  return request(`/posts/slug/${encodeURIComponent(slug)}`);
}

export async function loadAllPosts() {
  return request('/posts');
}

export async function getPostById(id) {
  return request(`/posts/${id}`);
}

export async function savePost(postData) {
  if (postData.id) {
    return request(`/posts/${postData.id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  }
  return request('/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  });
}

export async function deletePost(id) {
  return request(`/posts/${id}`, { method: 'DELETE' });
}

export async function togglePublish(id) {
  return request(`/posts/${id}/publish`, { method: 'PATCH' });
}

// ── TRACKING ──
export async function trackPageView(payload) {
  return request('/track', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ── STATS ──
export async function fetchStats() {
  return request('/stats');
}

// ── USERS ──
export async function fetchAllUsers() {
  return request('/users');
}

export async function updateUserRole(id, role) {
  return request(`/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

export async function createUser(email, password, role = 'editor') {
  return request('/users', {
    method: 'POST',
    body: JSON.stringify({ email, password, role }),
  });
}

export async function deleteUser(id) {
  return request(`/users/${id}`, { method: 'DELETE' });
}

export async function changePassword(currentPassword, newPassword) {
  return request('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });
}

// ── UPLOAD (R2) ──
export async function uploadMedia(file, folder = 'covers') {
  const form = new FormData();
  form.append('file', file);
  form.append('folder', folder);
  return request('/upload', { method: 'POST', body: form });
}

export async function uploadCover(file) {
  return uploadMedia(file, 'covers');
}

// ── PORTFOLIO CMS ──
export async function fetchPortfolio() {
  return request('/portfolio');
}

export async function savePortfolio(data) {
  return request('/portfolio', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export { API_URL };
