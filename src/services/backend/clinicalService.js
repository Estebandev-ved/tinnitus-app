import {
  isBackendConfigured,
  getBaseUrl,
} from './apiClient';

const SYNC_TOKEN = import.meta.env.VITE_CLINICAL_SYNC_TOKEN;

function postForm(path, params) {
  const url = `${getBaseUrl()}${path}`;
  const body = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      body.append(key, String(value));
    }
  });
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
  if (SYNC_TOKEN) headers['X-Clinical-Token'] = SYNC_TOKEN;
  return fetch(url, { method: 'POST', headers, body }).then(async (res) => {
    const text = await res.text();
    let data = null;
    if (text) { try { data = JSON.parse(text); } catch { data = text; } }
    if (!res.ok) throw new Error(data?.message || `Error ${res.status}`);
    return data;
  });
}

/**
 * Sincroniza los datos clínicos del paciente con el backend para que el
 * panel web pueda mostrarlos. Es best-effort: no debe interrumpir el flujo
 * de la app móvil si el backend no está disponible.
 */
export const ClinicalService = {
  async syncPatient(patientId, meta = {}) {
    if (!isBackendConfigured()) return null;
    try {
      const data = await postForm('/api/v1/clinical/patient', {
        patientId,
        email: meta.email,
        username: meta.username,
      });
      return data;
    } catch (e) {
      console.warn('Clinical sync (patient) falló:', e);
      return null;
    }
  },

  async syncThi(patientId, result, meta = {}) {
    if (!isBackendConfigured()) return;
    try {
      await postForm('/api/v1/clinical/thi', {
        patientId,
        email: meta.email,
        username: meta.username,
        total: result.total,
        grade: result.grade,
        functional: result.functional,
        emotional: result.emotional,
        catastrophic: result.catastrophic,
        answers: typeof result.answers === 'string'
          ? result.answers
          : JSON.stringify(result.answers || {}),
      });
    } catch (e) {
      console.warn('Clinical sync (THI) falló:', e);
    }
  },

  async syncAudiometry(patientId, data, meta = {}) {
    if (!isBackendConfigured()) return;
    try {
      await postForm('/api/v1/clinical/audiometry', {
        patientId,
        email: meta.email,
        username: meta.username,
        type: data.type,
        frequency: data.frequency,
        volume: data.volume,
        ear: data.ear,
      });
    } catch (e) {
      console.warn('Clinical sync (audiometry) falló:', e);
    }
  },

  async syncDevice(patientId, data, meta = {}) {
    if (!isBackendConfigured()) return;
    try {
      await postForm('/api/v1/clinical/device', {
        patientId,
        email: meta.email,
        username: meta.username,
        platform: data.platform,
        deviceId: data.deviceId,
        appVersion: data.appVersion,
      });
    } catch (e) {
      console.warn('Clinical sync (device) falló:', e);
    }
  },

  async syncTelemetry(patientId, data, meta = {}) {
    if (!isBackendConfigured()) return;
    try {
      await postForm('/api/v1/clinical/telemetry', {
        patientId,
        email: meta.email,
        username: meta.username,
        eventType: data.eventType,
        platform: data.platform,
        appVersion: data.appVersion,
        deviceInfo: data.deviceInfo,
        sessionId: data.sessionId,
      });
    } catch (e) {
      console.warn('Clinical sync (telemetry) falló:', e);
    }
  },
};
