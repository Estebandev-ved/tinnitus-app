import { getBaseUrl, isBackendConfigured } from './apiClient';

/**
 * Lee el contenido publicado del backend (motor de contenido).
 * El endpoint /api/v1/content es público (no requiere token).
 * Soporta filtrar por tipo (FAQ, TIP, ARTICLE, MESSAGE, EXERCISE) e idioma.
 */
export const contentService = {
  async list({ type, lang } = {}) {
    if (!isBackendConfigured()) {
      throw new Error('Backend no configurado');
    }
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (lang) params.set('lang', lang);
    const qs = params.toString();
    const url = `${getBaseUrl()}/api/v1/content${qs ? `?${qs}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Error ${res.status} al cargar contenido`);
    }
    return await res.json();
  },
};
