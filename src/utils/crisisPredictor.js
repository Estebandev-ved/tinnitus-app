export const predictCrisis = async (weatherData, userLogs) => {
  let score = 0;
  const factors = [];
  const preventionActions = [];

  // Analizar Historial de Usuario (Últimos 3 días)
  if (userLogs && userLogs.length > 0) {
    const recentLogs = userLogs.slice(0, 3);
    
    // Factor: Estrés
    const avgStress = recentLogs.reduce((acc, log) => acc + (log.stressLevel || 0), 0) / recentLogs.length;
    if (avgStress > 66) {
      score += 30;
      factors.push({ factor: 'Estrés Alto', contribution: 30 });
      preventionActions.push({ action: 'Guía de Respiración (Control de Estrés)', type: 'breathing', priority: 1 });
    }

    // Factor: Falta de sueño
    const avgSleep = recentLogs.reduce((acc, log) => acc + (log.sleepHours || 7), 0) / recentLogs.length;
    if (avgSleep < 6) {
      score += 25;
      factors.push({ factor: 'Falta de Sueño', contribution: 25 });
      preventionActions.push({ action: 'Terapia Acústica (Ruido Rosa)', type: 'sound', priority: 2 });
    }

    // Factor: Tendencia de Tinnitus
    if (recentLogs.length > 1 && (recentLogs[0].tinnitusLevel || 0) > (recentLogs[1].tinnitusLevel || 0)) {
      score += 20;
      factors.push({ factor: 'Aumento Reciente de Tinnitus', contribution: 20 });
    }
  }

  // Factor: Presión Atmosférica (Clima)
  if (weatherData && weatherData.hourly && weatherData.hourly.surface_pressure) {
    const pressures = weatherData.hourly.surface_pressure.slice(0, 24); // Próximas 24 horas
    const currentPressure = pressures[0];
    const minPressure = Math.min(...pressures);
    
    // Gran caída de presión en corto tiempo
    if (currentPressure - minPressure > 5) {
      score += 15;
      factors.push({ factor: 'Caída de Presión Barométrica', contribution: 15 });
    }
  }

  // Si no hay datos, generar score base
  if (factors.length === 0) {
    score = 15;
    factors.push({ factor: 'Condiciones Generales', contribution: 15 });
  }

  // Cap the score
  score = Math.min(Math.max(score, 0), 100);
  const isHighRisk = score > 65;
  const isModRisk = score > 35 && score <= 65;

  return {
    riskScore: Math.floor(score),
    riskLevel: isHighRisk ? 'high' : (isModRisk ? 'moderate' : 'low'),
    predictedWindow: isHighRisk ? '24h' : null,
    topFactors: factors,
    preventionActions: preventionActions.length > 0 ? preventionActions : [
      { action: 'Monitorización regular', type: 'tracker', priority: 1 }
    ]
  };
};

export const fetchWeatherAndPredict = async (userLogs = []) => {
  try {
    const lat = 6.2442; const lon = -75.5812; // Coordenadas del usuario (fallback)
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=surface_pressure&forecast_days=2`);
    let weatherData = null;
    if (res.ok) {
      weatherData = await res.json();
    }
    
    const prediction = await predictCrisis(weatherData, userLogs);
    return prediction;
  } catch (e) {
    console.error("Crisis Prediction Failed", e);
    // Fallback gracefully instead of failing entirely
    return await predictCrisis(null, userLogs);
  }
};
