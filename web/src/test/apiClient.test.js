import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getToken, setToken, isAuthenticated, getBaseUrl } from '../api/apiClient';

describe('apiClient', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('getBaseUrl returns backend URL', () => {
    const url = getBaseUrl();
    expect(url).toBeTruthy();
    expect(typeof url).toBe('string');
  });

  it('getToken returns null when not logged in', () => {
    expect(getToken()).toBeNull();
  });

  it('getToken returns token when set', () => {
    localStorage.setItem('web_admin_jwt', 'test-token-123');
    expect(getToken()).toBe('test-token-123');
  });

  it('setToken stores and retrieves token', () => {
    setToken('my-token');
    expect(getToken()).toBe('my-token');
    expect(isAuthenticated()).toBe(true);
  });

  it('setToken(null) removes token', () => {
    setToken('my-token');
    setToken(null);
    expect(getToken()).toBeNull();
    expect(isAuthenticated()).toBe(false);
  });

  it('isAuthenticated returns false when no token', () => {
    expect(isAuthenticated()).toBe(false);
  });
});
