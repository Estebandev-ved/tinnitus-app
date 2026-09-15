import { apiClient } from './apiClient';

export const releaseService = {
  async getLatest() {
    try {
      return await apiClient.get('/api/v1/app/releases/latest');
    } catch {
      return null;
    }
  },
};
