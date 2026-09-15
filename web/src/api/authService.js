import { apiClient, getToken, setToken, getBaseUrl } from './apiClient';

export const authService = {
  async login(username, password) {
    const params = new URLSearchParams({ username, password });
    const res = await fetch(`${getBaseUrl()}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
      throw new Error((data && (data.message || data.error)) || 'Credenciales inválidas');
    }
    if (data && data.token) setToken(data.token);
    return data;
  },
  async firebaseLogin(uid, email, displayName) {
    const res = await fetch(`${getBaseUrl()}/api/v1/auth/firebase-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, email, displayName }),
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
      throw new Error((data && (data.message || data.error)) || 'Error en firebase-login');
    }
    if (data && data.token) setToken(data.token);
    return data;
  },
  logout() {
    setToken(null);
  },
  getToken,
};
