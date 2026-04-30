export const processDataForHeatmap = (logs) => {
  return logs.map(l => ({
    day: new Date(l.date).getDay(),
    hour: new Date(l.date).getHours(),
    level: l.tinnitusLevel || 0
  }));
};

export const processDataForRadar = (logs) => {
  // Promediar métricas de la semana
  const avg = (key) => logs.reduce((acc, l) => acc + (l[key] || 0), 0) / logs.length;
  return [
    { subject: 'Sueño', A: avg('sleepHours') },
    { subject: 'Estrés', A: avg('stressLevel') },
    { subject: 'Tinnitus', A: avg('tinnitusLevel') },
    { subject: 'Hidratación', A: 5 }, // mock
    { subject: 'Actividad', A: 7 }    // mock
  ];
};
