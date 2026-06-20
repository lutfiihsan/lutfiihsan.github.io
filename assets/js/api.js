// ============================================================
// API CLIENT — Cloudflare Workers (D1 + R2)
// ============================================================

const API_URL = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'auth_token';

/** Resolve media URL — relative paths need API base when frontend is on GitHub Pages */
export function resolveMediaUrl(url) {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

export function isApiConfigured() {
  return true;
}

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();

  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  const res = await fetch(`${API_URL}/api${path}`, { ...options, headers });
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
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }

  return data;
}

// ── AUTH ──
export async function getSession() {
  if (!getToken()) return null;
  try {
    const data = await request('/auth/session');
    return { user: data.user };
  } catch {
    clearToken();
    return null;
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
export async function uploadCover(file) {
  const form = new FormData();
  form.append('file', file);
  return request('/upload', { method: 'POST', body: form });
}
