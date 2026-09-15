import { apiClient, getBaseUrl } from './apiClient';

export const releaseService = {
  async getLatest(version) {
    const path = version ? `/api/v1/app/releases/latest/${encodeURIComponent(version)}` : '/api/v1/app/releases/latest';
    return apiClient.get(path, { auth: false });
  },

  async getByVersion(version) {
    return apiClient.get(`/api/v1/app/releases/by-version/${encodeURIComponent(version)}`, { auth: false });
  },

  getDownloadUrl(version) {
    return `${getBaseUrl()}/api/v1/app/releases/download/${encodeURIComponent(version)}.apk`;
  },
};
