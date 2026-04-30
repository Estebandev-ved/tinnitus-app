import palette from '../Color_Palette.json';

export const getColorForLevel = (level) => {
  if (level <= 3) return palette.semantic.low;
  if (level <= 7) return palette.semantic.medium;
  return palette.semantic.high;
};
