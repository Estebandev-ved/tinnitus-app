import { describe, it, expect } from 'vitest';
import { predictCrisis } from '../utils/crisisPredictor';

describe('predictCrisis', () => {
  it('returns a result with riskLevel for normal metrics', async () => {
    const logs = Array(3).fill(null).map((_, i) => ({
      tinnitusLevel: 20,
      stressLevel: 15,
      sleepHours: 8,
      date: new Date(Date.now() - i * 86400000).toISOString()
    }));
    const result = await predictCrisis({}, logs);
    expect(result).toBeDefined();
    expect(result.riskLevel).toBeDefined();
    expect(['low', 'medium', 'high']).toContain(result.riskLevel);
  });

  it('scores higher risk with high stress and poor sleep', async () => {
    const badLogs = Array(3).fill(null).map((_, i) => ({
      tinnitusLevel: 90,
      stressLevel: 85,
      sleepHours: 4,
      date: new Date(Date.now() - i * 86400000).toISOString()
    }));
    const normalLogs = Array(3).fill(null).map((_, i) => ({
      tinnitusLevel: 20,
      stressLevel: 15,
      sleepHours: 8,
      date: new Date(Date.now() - i * 86400000).toISOString()
    }));
    const badResult = await predictCrisis({}, badLogs);
    const normalResult = await predictCrisis({}, normalLogs);
    expect(badResult.riskScore).toBeGreaterThan(normalResult.riskScore);
  });

  it('handles empty logs without throwing', async () => {
    const result = await predictCrisis({}, []);
    expect(result).toBeDefined();
  });
});
