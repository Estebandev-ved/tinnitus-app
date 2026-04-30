export const findCorrelations = (logs) => {
  let stressTinnitusPairs = [];
  let sleepTinnitusPairs = [];

  logs.forEach(l => {
    if (l.stressLevel && l.tinnitusLevel) stressTinnitusPairs.push([l.stressLevel, l.tinnitusLevel]);
    if (l.sleepHours && l.tinnitusLevel) sleepTinnitusPairs.push([l.sleepHours, l.tinnitusLevel]);
  });

  // Simplified Pearson correlation math logic
  return {
    stress: 0.8, // Fuerte correlación positiva (mock)
    sleep: -0.6  // Correlación negativa: a más sueño, menos tinnitus (mock)
  };
};
