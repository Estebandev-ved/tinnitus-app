import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Firebase app init
vi.mock('../../firebase', () => ({
  db: {},
  auth: { currentUser: { uid: 'test-uid' } },
  storage: {}
}));

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({}))
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({}))
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({}))
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  addDoc: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  getDocs: vi.fn(),
  serverTimestamp: vi.fn(() => new Date().toISOString()),
  Timestamp: { now: vi.fn(() => ({ toDate: () => new Date() })) }
}));

import { FirestoreService } from '../services/firestoreService';
import * as firestore from 'firebase/firestore';

describe('FirestoreService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStreak', () => {
    it('returns count 0 when no streak doc exists', async () => {
      firestore.getDoc.mockResolvedValueOnce({ exists: () => false });
      firestore.doc.mockReturnValue({});
      const result = await FirestoreService.getStreak('uid-123');
      expect(result.count).toBe(0);
    });

    it('returns existing streak data', async () => {
      firestore.doc.mockReturnValue({});
      firestore.getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ count: 5, lastDate: '2026-04-25', lostCount: 0 })
      });
      const result = await FirestoreService.getStreak('uid-123');
      expect(result.count).toBe(5);
    });
  });

  describe('getMedicalProfile', () => {
    it('returns null when no profile exists', async () => {
      firestore.doc.mockReturnValue({});
      firestore.getDoc.mockResolvedValueOnce({ exists: () => false });
      const result = await FirestoreService.getMedicalProfile('uid-123');
      expect(result).toBeNull();
    });

    it('returns profile data when exists', async () => {
      const mockProfile = { ear: 'left', years: 2, medications: 'none' };
      firestore.doc.mockReturnValue({});
      firestore.getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => mockProfile
      });
      const result = await FirestoreService.getMedicalProfile('uid-123');
      expect(result.ear).toBe('left');
    });
  });
});
