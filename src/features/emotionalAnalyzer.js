import rules from './Emotional_Detection_Rules.json';

// Minimal NLP para < 3s de response time.
export const analyzeEmotion = (text) => {
  const lower = text.toLowerCase();
  if (rules.keywords.frustration.some(kw => lower.includes(kw))) return 'frustration';
  if (rules.keywords.anxiety.some(kw => lower.includes(kw))) return 'anxiety';
  if (rules.keywords.calm.some(kw => lower.includes(kw))) return 'calm';
  return 'neutral';
};
