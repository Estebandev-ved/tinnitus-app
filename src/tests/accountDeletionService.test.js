import { describe, it, expect, vi } from 'vitest';

vi.mock('../firebase', () => ({ auth: {}, db: {}, storage: {} }));
vi.mock('firebase/firestore', () => ({}));
vi.mock('firebase/storage', () => ({}));
vi.mock('firebase/auth', () => ({}));

import { clearLocalUserData, getPrimaryProvider } from '../services/accountDeletionService';

const fakeStore = (init) => {
  const data = { ...init };
  return new Proxy(data, {
    get: (t, k) => (k === 'removeItem' ? (key) => { delete t[key]; } : t[k]),
    ownKeys: (t) => Reflect.ownKeys(t),
    getOwnPropertyDescriptor: (t, k) => Reflect.getOwnPropertyDescriptor(t, k),
  });
};

describe('accountDeletionService', () => {
  it('clears local data but keeps language preference', () => {
    const store = fakeStore({ tinnitoff_lang: 'en', tinnitoff_streak: '3', backend_jwt: 'x', savedMixes: '[]' });
    clearLocalUserData([store]);
    expect(Object.keys(store)).toEqual(['tinnitoff_lang']);
  });

  it('detects provider', () => {
    expect(getPrimaryProvider({ providerData: [{ providerId: 'password' }] })).toBe('password');
    expect(getPrimaryProvider({ providerData: [{ providerId: 'google.com' }] })).toBe('google');
    expect(getPrimaryProvider(null)).toBe('other');
  });
});
