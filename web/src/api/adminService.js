import { apiClient, getToken, getBaseUrl } from './apiClient';

export const adminService = {
  getStats() {
    return apiClient.get('/api/v1/admin/stats', { auth: true });
  },
  getUsers() {
    return apiClient.get('/api/v1/admin/users', { auth: true });
  },
  getUser(id) {
    return apiClient.get(`/api/v1/admin/users/${id}`, { auth: true });
  },
  getTelemetryByPlatform() {
    return apiClient.get('/api/v1/admin/telemetry/by-platform', { auth: true });
  },
  getDownloadsByPlatform() {
    return apiClient.get('/api/v1/admin/downloads/by-platform', { auth: true });
  },
  getReleases() {
    return apiClient.get('/api/v1/admin/releases', { auth: true });
  },
  getRecentDownloads(limit = 10) {
    return apiClient.get('/api/v1/admin/downloads/recent', { auth: true, params: { limit } });
  },
  getSignups(days = 30) {
    return apiClient.get('/api/v1/admin/analytics/signups', { auth: true, params: { days } });
  },
  getActivity(days = 30) {
    return apiClient.get('/api/v1/admin/analytics/activity', { auth: true, params: { days } });
  },
  getThi(days = 90) {
    return apiClient.get('/api/v1/admin/analytics/thi', { auth: true, params: { days } });
  },
  getAudiometry() {
    return apiClient.get('/api/v1/admin/analytics/audiometry', { auth: true });
  },
  getAdherence() {
    return apiClient.get('/api/v1/admin/analytics/adherence', { auth: true });
  },
  getEngagement() {
    return apiClient.get('/api/v1/admin/analytics/engagement', { auth: true });
  },
  sendPush(payload) {
    return apiClient.post('/api/v1/admin/push', payload, { auth: true });
  },
  getPushPreview(segment = 'all') {
    return apiClient.get('/api/v1/admin/push/preview', { auth: true, params: { segment } });
  },
  getAlerts() {
    return apiClient.get('/api/v1/admin/alerts', { auth: true });
  },
  async uploadRelease(formData) {
    const token = getToken();
    const res = await fetch(`${getBaseUrl()}/api/v1/releases/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
      throw new Error((data && (data.message || data.error)) || 'Error al subir la versión');
    }
    return data;
  },
  promoteUser(id) {
    return apiClient.post(`/api/v1/admin/users/${id}/promote`, null, { auth: true });
  },
  demoteUser(id) {
    return apiClient.post(`/api/v1/admin/users/${id}/demote`, null, { auth: true });
  },
  toggleUserEnabled(id) {
    return apiClient.post(`/api/v1/admin/users/${id}/toggle-enabled`, null, { auth: true });
  },
  deleteUser(id) {
    return apiClient.del(`/api/v1/admin/users/${id}`, { auth: true });
  },
};
