import { apiClient } from './apiClient';

export const CONTENT_TYPES = ['FAQ', 'TIP', 'ARTICLE', 'MESSAGE', 'EXERCISE'];
export const CONTENT_STATUSES = ['DRAFT', 'PUBLISHED'];

export const CONTENT_TYPE_META = {
  FAQ: { label: 'Pregunta frecuente' },
  TIP: { label: 'Consejo' },
  ARTICLE: { label: 'Artículo' },
  MESSAGE: { label: 'Mensaje' },
  EXERCISE: { label: 'Ejercicio' },
};

export const contentService = {
  listAdmin(params) {
    return apiClient.get('/api/v1/admin/content', { auth: true, params });
  },
  getPublic(params) {
    return apiClient.get('/api/v1/content', { params });
  },
  create(payload) {
    return apiClient.post('/api/v1/admin/content', payload, { auth: true });
  },
  update(id, payload) {
    return apiClient.put(`/api/v1/admin/content/${id}`, payload, { auth: true });
  },
  remove(id) {
    return apiClient.del(`/api/v1/admin/content/${id}`, { auth: true });
  },
};
