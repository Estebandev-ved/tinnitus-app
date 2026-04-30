import { describe, it, expect, vi } from 'vitest';

vi.mock('../services/firestoreService', () => ({
  FirestoreService: {
    getAchievements: vi.fn().mockResolvedValue([]),
    saveAchievement: vi.fn().mockResolvedValue(true)
  }
}));

vi.mock('../data/achievementsData', () => ({
  achievementsData: [
    { id: 'first_log', title: 'Primer Registro', description: 'Registra tu primer día' }
  ]
}));

import { checkAndUnlockAchievements } from '../utils/achievementChecker';

describe('checkAndUnlockAchievements', () => {
  it('returns null or array for a valid userId', async () => {
    const result = await checkAndUnlockAchievements('test-uid');
    expect(result === null || Array.isArray(result)).toBe(true);
  });

  it('does not throw for undefined userId', async () => {
    await expect(checkAndUnlockAchievements(undefined)).resolves.not.toThrow();
  });
});
