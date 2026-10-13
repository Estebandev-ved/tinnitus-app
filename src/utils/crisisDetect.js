// Detects messages that may express suicidal thoughts or self-harm (ES/EN).
// Conservative heuristics: a match only shows support resources, it never blocks the user.
const PATTERNS = [
  /\bsuicid/i,
  /quitarme la vida/i,
  /acabar con (mi vida|todo)/i,
  /no quiero (seguir )?vivir/i,
  /ya no quiero vivir/i,
  /quiero morir/i,
  /prefiero estar muert[oa]/i,
  /hacerme da[ñn]o/i,
  /autolesi/i,
  /kill myself/i,
  /end (my life|it all)/i,
  /want to die/i,
  /don'?t want to (live|be alive)/i,
  /hurt myself/i,
  /self[- ]?harm/i,
  /better off without me/i,
];

export const detectSelfHarm = (text) => {
  if (!text || typeof text !== 'string') return false;
  return PATTERNS.some((re) => re.test(text));
};
