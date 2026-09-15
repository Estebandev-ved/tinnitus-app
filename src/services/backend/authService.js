import { apiClient, setToken, clearToken, getToken } from './apiClient';

export const authService = {
  async login(username, password) {
    const data = await apiClient.post('/api/v1/auth/login', null, {
      auth: false,
      params: { username, password },
    });
    if (data && data.token) setToken(data.token);
    return data;
  },

  async register(username, email, password) {
    const data = await apiClient.post('/api/v1/auth/register', null, {
      auth: false,
      params: { username, email, password },
    });
    return data;
  },

  async me() {
    return apiClient.get('/api/v1/auth/me');
  },

  logout() {
    clearToken();
  },

  isAuthenticated() {
    return Boolean(getToken());
  },
};
