const BASE_URL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'backend_jwt';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isBackendConfigured() {
  return Boolean(BASE_URL);
}

export function getBaseUrl() {
  return BASE_URL;
}

// Endpoints que nunca deben disparar un reintento con refresh (evita loops).
const NO_RETRY_PATHS = new Set([
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/refresh',
  '/api/v1/auth/firebase-login',
]);

// El refresh token vive en una cookie HttpOnly que pone el backend (login,
// firebase-login y refresh) — el frontend nunca la lee, solo la deja viajar
// (credentials: 'include') y pide un access token nuevo cuando el actual
// (15 min) vence. Una sola llamada de refresh en vuelo a la vez.
let refreshPromise = null;

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('No se pudo renovar la sesión');
        const data = await res.json();
        if (data && data.token) setToken(data.token);
        return data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function request(path, { method = 'GET', body, auth = true, params, _retried = false } = {}) {
  if (!BASE_URL) {
    throw new Error('Backend no configurado (VITE_BACKEND_URL)');
  }

  let url = `${BASE_URL}${path}`;
  if (params) {
    const search = new URLSearchParams(params).toString();
    if (search) url += (url.includes('?') ? '&' : '?') + search;
  }

  const headers = {};
  if (body && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    credentials: 'include', // necesario para que viaje la cookie del refresh token
    body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
  });

  // Access token vencido (15 min): pedimos uno nuevo con el refresh token
  // (cookie) y reintentamos UNA sola vez. Nunca en login/register/refresh.
  if (response.status === 401 && auth && !_retried && !NO_RETRY_PATHS.has(path)) {
    try {
      await refreshAccessToken();
      return request(path, { method, body, auth, params, _retried: true });
    } catch {
      clearToken();
      // sigue abajo con la respuesta 401 original
    }
  }

  if (response.status === 204) return null;

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      (data && (data.message || data.error)) ||
      `Error ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

export const apiClient = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  del: (path, options) => request(path, { ...options, method: 'DELETE' }),
};
