import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import Companion, { COMPANION_STATES } from '../components/Companion';
import { LanguageProvider } from '../contexts/LanguageContext';

const mockReduced = vi.hoisted(() => ({ value: false }));
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return { ...actual, useReducedMotion: () => mockReduced.value };
});

const html = (ui, lang = 'es') => {
  localStorage.setItem('tinnitoff_lang', lang);
  return renderToStaticMarkup(<LanguageProvider>{ui}</LanguageProvider>);
};

describe('Companion (Lumi)', () => {
  beforeEach(() => {
    mockReduced.value = false;
  });

  it.each(COMPANION_STATES)('renders state %s with role img and aria-label', (state) => {
    const out = html(<Companion state={state} />);
    expect(out).toContain('role="img"');
    expect(out).toContain(`data-state="${state}"`);
    expect(out).toMatch(/aria-label="[^"]*Lumi/);
  });

  it('uses English labels when language is en', () => {
    expect(html(<Companion state="breathing" />, 'en')).toContain('breathing with you');
  });

  it('uses Spanish labels by default', () => {
    expect(html(<Companion state="resting" />)).toContain('descansa');
  });

  it('defaults to calm state', () => {
    expect(html(<Companion />)).toContain('data-state="calm"');
  });

  it('flags reduced motion for a static pose', () => {
    mockReduced.value = true;
    expect(html(<Companion state="calm" />)).toContain('data-reduced-motion="true"');
  });

  it('does not throw without LanguageProvider', () => {
    expect(renderToStaticMarkup(<Companion state="celebrating" />)).toContain('data-state="celebrating"');
  });
});
