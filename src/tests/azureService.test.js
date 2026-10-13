import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

async function loadService(backendUrl) {
  vi.resetModules();
  import.meta.env.VITE_BACKEND_URL = backendUrl;
  return import('../services/azureService');
}

const okJson = (status, body) => ({ ok: status < 400, status, json: async () => body });

describe('AzureService (proxy client)', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });
  afterEach(() => {
    delete import.meta.env.VITE_BACKEND_URL;
  });

  it('throws not_configured without backend URL', async () => {
    const { AzureService } = await loadService('');
    await expect(AzureService.sendMessage('hola', {}, [], 'tok')).rejects.toMatchObject({ kind: 'not_configured' });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('sends Firebase token and only minimal context; never Azure credentials', async () => {
    const { AzureService } = await loadService('https://api.example.com/');
    globalThis.fetch.mockResolvedValue(okJson(200, { reply: 'hola!' }));
    const reply = await AzureService.sendMessage(
      'hola',
      { avgStress: 40, medicalProfile: { years: '2', ear: 'left', doctor: 'Dr X', medications: 'foo', notes: 'secret' }, recentNotes: [{ text: 'x' }] },
      [{ sender: 'user', text: 'a' }, { sender: 'bot', text: 'b' }],
      'firebase-token'
    );
    expect(reply).toBe('hola!');
    const [url, init] = globalThis.fetch.mock.calls[0];
    expect(url).toBe('https://api.example.com/api/v1/ai/chat');
    expect(init.headers.Authorization).toBe('Bearer firebase-token');
    expect(init.headers['api-key']).toBeUndefined();
    const body = JSON.parse(init.body);
    expect(body.context).toEqual({ avgStress: 40, years: '2', ear: 'left' });
    expect(init.body).not.toMatch(/Dr X|foo|secret/);
  });

  it('maps 429 to limit, 401 to unauthenticated, 5xx to unavailable, fetch failure to network', async () => {
    const { AzureService } = await loadService('https://api.example.com');
    globalThis.fetch.mockResolvedValueOnce(okJson(429, { message: 'limite', retryAfterSeconds: 30 }));
    await expect(AzureService.sendMessage('h', {}, [], 't')).rejects.toMatchObject({ kind: 'limit', retryAfterSeconds: 30 });
    globalThis.fetch.mockResolvedValueOnce(okJson(401, {}));
    await expect(AzureService.sendMessage('h', {}, [], 't')).rejects.toMatchObject({ kind: 'unauthenticated' });
    globalThis.fetch.mockResolvedValueOnce(okJson(502, {}));
    await expect(AzureService.sendMessage('h', {}, [], 't')).rejects.toMatchObject({ kind: 'unavailable' });
    globalThis.fetch.mockRejectedValueOnce(new TypeError('fail'));
    await expect(AzureService.sendMessage('h', {}, [], 't')).rejects.toMatchObject({ kind: 'network' });
  });
});
