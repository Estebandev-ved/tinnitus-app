const BASE_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080').replace(/\/$/, '');
const TOKEN_KEY = 'web_admin_jwt';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}
export function isAuthenticated() {
  return Boolean(getToken());
}
export function getBaseUrl() {
  return BASE_URL;
}

async function request(path, { method = 'GET', auth = false, params, body } = {}) {
  let url = `${BASE_URL}${path}`;
  if (params) {
    const search = new URLSearchParams(params).toString();
    if (search) url += (url.includes('?') ? '&' : '?') + search;
  }

  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }
  if (!response.ok) {
    if ((response.status === 401 || response.status === 403) && auth) {
      setToken(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/admin';
      }
    }
    const message = (data && (data.message || data.error)) || `Error ${response.status}`;
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }
  return data;
}

export const apiClient = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  del: (path, options) => request(path, { ...options, method: 'DELETE' }),
};
