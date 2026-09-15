const SYNC_TOKEN = import.meta.env.VITE_CLINICAL_SYNC_TOKEN;

function postForm(path, params) {
  const url = `${import.meta.env.VITE_BACKEND_URL || ''}${path}`;
  if (!url) return Promise.reject(new Error('Backend no configurado'));
  const body = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      body.append(key, String(value));
    }
  });
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
  if (SYNC_TOKEN) headers['X-Clinical-Token'] = SYNC_TOKEN;
  return fetch(url, { method: 'POST', headers, body });
}

export const telemetryService = {
  async sendEvent({ userId, eventType, appVersion, sessionId, deviceInfo }) {
    return postForm('/api/v1/telemetry/event', {
      userId, eventType, appVersion, sessionId, deviceInfo,
    });
  },

  async registerDevice({ userId, deviceId, appVersion, deviceInfo }) {
    return postForm('/api/v1/telemetry/device', {
      userId, deviceId, appVersion, deviceInfo,
    });
  },
};
