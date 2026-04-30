export const getWidgetData = () => {
  const todayLevel = localStorage.getItem('tinnitoff_today_level') || '-';
  const streak = localStorage.getItem('tinnitoff_streak') || '0';
  const lastSound = localStorage.getItem('tinnitoff_last_sound') || null;
  return { todayLevel, streak, lastSound };
};

export const updateWidgetData = (data) => {
  if (data.todayLevel) localStorage.setItem('tinnitoff_today_level', data.todayLevel);
  if (data.streak) localStorage.setItem('tinnitoff_streak', data.streak);
  if (data.lastSound) localStorage.setItem('tinnitoff_last_sound', data.lastSound);
};
