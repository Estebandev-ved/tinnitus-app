import { describe, it, expect } from 'vitest';
import { detectSelfHarm } from '../utils/crisisDetect';
import { CRISIS_COUNTRIES, CRISIS_DIRECTORY, detectCountry } from '../data/crisisResources';

describe('detectSelfHarm', () => {
  it('detects ES and EN expressions', () => {
    expect(detectSelfHarm('a veces pienso en quitarme la vida')).toBe(true);
    expect(detectSelfHarm('Ya no quiero vivir así')).toBe(true);
    expect(detectSelfHarm('I want to die')).toBe(true);
    expect(detectSelfHarm('thinking of self-harm')).toBe(true);
  });
  it('ignores normal tinnitus messages', () => {
    expect(detectSelfHarm('Tengo una crisis de zumbido muy fuerte')).toBe(false);
    expect(detectSelfHarm('quiero vivir más tranquilo con mi tinnitus')).toBe(false);
    expect(detectSelfHarm('')).toBe(false);
    expect(detectSelfHarm(null)).toBe(false);
  });
});

describe('crisis data', () => {
  it('every country has sourced lines and an emergency number', () => {
    Object.values(CRISIS_COUNTRIES).forEach((c) => {
      expect(c.emergency.number).toBeTruthy();
      c.lines.forEach((l) => {
        expect(l.source).toMatch(/^https:\/\//);
        expect(l.label.es && l.label.en && l.note.es && l.note.en).toBeTruthy();
      });
    });
  });
  it('every line has an official https source, a verification date and a status', () => {
    const STATUSES = ['verified', 'partial', 'unconfirmed'];
    const entries = [CRISIS_DIRECTORY];
    Object.values(CRISIS_COUNTRIES).forEach((c) => {
      entries.push(...c.lines);
      entries.push(c.emergency);
    });
    entries.forEach((e) => {
      expect(STATUSES).toContain(e.status);
      expect(e.verifiedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      // Only 'unconfirmed' entries may lack a source (and must say why).
      if (e.status === 'unconfirmed') expect(e.review).toBeTruthy();
      else expect(e.source).toMatch(/^https:\/\//);
    });
  });
  it('crisis lines (not emergency numbers) are never unconfirmed', () => {
    Object.values(CRISIS_COUNTRIES).forEach((c) => {
      c.lines.forEach((l) => {
        expect(l.status).not.toBe('unconfirmed');
        if (l.status === 'partial') expect(l.review).toBeTruthy();
      });
    });
  });
  it('line numbers are unique within a country and new countries are included', () => {
    Object.values(CRISIS_COUNTRIES).forEach((c) => {
      const nums = c.lines.map((l) => l.number);
      expect(new Set(nums).size).toBe(nums.length);
    });
    ['CO', 'PE', 'UY'].forEach((k) => expect(CRISIS_COUNTRIES[k]).toBeTruthy());
    expect(detectCountry('es-CO', 'es')).toBe('CO');
  });
  it('detects country from locale with language fallback', () => {
    expect(detectCountry('es-MX', 'es')).toBe('MX');
    expect(detectCountry('en-GB', 'en')).toBe('GB');
    expect(detectCountry('fr-FR', 'es')).toBe('ES');
    expect(detectCountry('', 'en')).toBe('US');
  });
});
