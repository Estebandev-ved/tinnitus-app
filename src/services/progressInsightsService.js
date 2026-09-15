/**
 * Progress Insights Service
 * Motor de análisis que detecta patrones, genera resúmenes y sugiere metas
 * basándose en datos reales del tracker, notas, diario de voz y THI.
 */

/**
 * Calcula el Health Score general (0-100) basado en todas las fuentes de datos.
 */
export const calculateHealthScore = (weeklyLogs = [], notes = []) => {
  if (!weeklyLogs.length && !notes.length) return null;

  let score = 50;

  if (weeklyLogs.length > 0) {
    const avgTinnitus = weeklyLogs.reduce((s, l) => s + (l.tinnitusLevel || 50), 0) / weeklyLogs.length;
    const avgSleep = weeklyLogs.reduce((s, l) => s + (l.sleepHours || 7), 0) / weeklyLogs.length;
    const avgStress = weeklyLogs.reduce((s, l) => s + (l.stressLevel || 50), 0) / weeklyLogs.length;

    const tinnitusScore = Math.max(0, 100 - avgTinnitus);
    const sleepScore = Math.min(100, (avgSleep / 9) * 100);
    const stressScore = Math.max(0, 100 - avgStress);

    score = Math.round(tinnitusScore * 0.4 + sleepScore * 0.25 + stressScore * 0.2 + 50 * 0.15);
  }

  const daysWithNotes = new Set(notes.map(n => {
    const d = new Date(n.timestamp || n.createdAt);
    return d.toISOString().split('T')[0];
  })).size;
  const streakBonus = Math.min(15, daysWithNotes * 3);
  score = Math.min(100, score + streakBonus);

  return Math.max(0, Math.round(score));
};

/**
 * Genera métricas comparativas: esta semana vs la anterior.
 */
export const getWeeklyComparison = (weeklyLogs = []) => {
  if (weeklyLogs.length < 2) return null;

  const sorted = [...weeklyLogs].sort((a, b) => new Date(a.date) - new Date(b.date));
  const mid = Math.floor(sorted.length / 2);
  const prevWeek = sorted.slice(0, mid);
  const currWeek = sorted.slice(mid);

  const avg = (arr, key) => arr.length ? arr.reduce((s, l) => s + (l[key] || 0), 0) / arr.length : 0;

  const prev = {
    tinnitus: Math.round(avg(prevWeek, 'tinnitusLevel')),
    sleep: Math.round(avg(prevWeek, 'sleepHours') * 10) / 10,
    stress: Math.round(avg(prevWeek, 'stressLevel')),
  };
  const curr = {
    tinnitus: Math.round(avg(currWeek, 'tinnitusLevel')),
    sleep: Math.round(avg(currWeek, 'sleepHours') * 10) / 10,
    stress: Math.round(avg(currWeek, 'stressLevel')),
  };

  const diff = (a, b) => {
    if (a === 0) return 0;
    return Math.round(((b - a) / a) * 100);
  };

  return {
    tinnitus: { prev: prev.tinnitus, curr: curr.tinnitus, diff: diff(prev.tinnitus, curr.tinnitus) },
    sleep: { prev: prev.sleep, curr: curr.sleep, diff: diff(prev.sleep, curr.sleep) },
    stress: { prev: prev.stress, curr: curr.stress, diff: diff(prev.stress, curr.stress) },
  };
};

/**
 * Detecta correlaciones entre variables del tracker.
 */
export const detectCorrelations = (weeklyLogs = []) => {
  if (weeklyLogs.length < 3) return [];

  const insights = [];
  const sorted = [...weeklyLogs].sort((a, b) => new Date(a.date) - new Date(b.date));

  const goodSleep = sorted.filter(l => l.sleepHours >= 7);
  const badSleep = sorted.filter(l => l.sleepHours < 7);
  if (goodSleep.length > 0 && badSleep.length > 0) {
    const avgGood = goodSleep.reduce((s, l) => s + l.tinnitusLevel, 0) / goodSleep.length;
    const avgBad = badSleep.reduce((s, l) => s + l.tinnitusLevel, 0) / badSleep.length;
    const diff = Math.round(((avgBad - avgGood) / avgGood) * 100);

    if (Math.abs(diff) > 5) {
      insights.push({
        id: 'sleep_tinnitus',
        type: diff > 0 ? 'warning' : 'positive',
        icon: '😴',
        title: 'Sueño y Tinnitus',
        text: diff > 0
          ? `Los días que duermes menos de 7h, tu tinnitus sube ${diff}%. Tu sueño importa.`
          : `Buenas noticias: dormir bien reduce tu tinnitus ${Math.abs(diff)}%. Mantén tu horario.`,
        strength: Math.min(100, Math.abs(diff) * 2),
      });
    }
  }

  const highStress = sorted.filter(l => l.stressLevel >= 66);
  const lowStress = sorted.filter(l => l.stressLevel < 33);
  if (highStress.length > 0 && lowStress.length > 0) {
    const avgHigh = highStress.reduce((s, l) => s + l.tinnitusLevel, 0) / highStress.length;
    const avgLow = lowStress.reduce((s, l) => s + l.tinnitusLevel, 0) / lowStress.length;
    const diff = Math.round(((avgHigh - avgLow) / avgLow) * 100);

    if (Math.abs(diff) > 5) {
      insights.push({
        id: 'stress_tinnitus',
        type: diff > 0 ? 'warning' : 'positive',
        icon: '🧠',
        title: 'Estrés y Tinnitus',
        text: diff > 0
          ? `El estrés alto increase tu tinnitus ${diff}%. La respiración ayuda a bajarlo.`
          : `Controlar el estrés reduce tu tinnitus ${Math.abs(diff)}%. Sigue con las técnicas de respiración.`,
        strength: Math.min(100, Math.abs(diff) * 2),
      });
    }
  }

  const dayOfWeek = {};
  sorted.forEach(l => {
    const day = new Date(l.date).getDay();
    if (!dayOfWeek[day]) dayOfWeek[day] = [];
    dayOfWeek[day].push(l.tinnitusLevel);
  });

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  let worstDay = null;
  let worstAvg = 0;
  let bestDay = null;
  let bestAvg = 100;

  Object.entries(dayOfWeek).forEach(([day, levels]) => {
    if (levels.length < 2) return;
    const avg = levels.reduce((s, v) => s + v, 0) / levels.length;
    if (avg > worstAvg) { worstAvg = avg; worstDay = dayNames[day]; }
    if (avg < bestAvg) { bestAvg = avg; bestDay = dayNames[day]; }
  });

  if (worstDay && bestDay && worstDay !== bestDay) {
    insights.push({
      id: 'day_pattern',
      type: 'info',
      icon: '📅',
      title: 'Patrón por Día',
      text: `Los ${worstDay}s tienden a ser tu peor día (tinnitus ${Math.round(worstAvg)}). Los ${bestDay}s son los mejores (${Math.round(bestAvg)}).`,
      strength: 60,
    });
  }

  if (sorted.length >= 4) {
    const half = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, half);
    const secondHalf = sorted.slice(half);
    const avgFirst = firstHalf.reduce((s, l) => s + l.tinnitusLevel, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((s, l) => s + l.tinnitusLevel, 0) / secondHalf.length;
    const trendDiff = avgSecond - avgFirst;

    if (Math.abs(trendDiff) > 3) {
      insights.push({
        id: 'trend',
        type: trendDiff < 0 ? 'positive' : 'warning',
        icon: trendDiff < 0 ? '📈' : '📉',
        title: 'Tendencia General',
        text: trendDiff < 0
          ? `Tu tinnitus ha bajado ${Math.abs(Math.round(trendDiff))} puntos en las últimas registros. ¡Vas bien!`
          : `Tu tinnitus ha subido ${Math.round(trendDiff)} puntos últimamente. Considera una sesión de respiración.`,
        strength: Math.min(100, Math.abs(trendDiff) * 3),
      });
    }
  }

  return insights.sort((a, b) => b.strength - a.strength);
};

/**
 * Genera un resumen semanal en texto plano.
 */
export const generateWeeklySummary = (weeklyLogs = [], notes = [], thiResult = null) => {
  if (!weeklyLogs.length && !notes.length) return null;

  const avgTinnitus = weeklyLogs.length
    ? Math.round(weeklyLogs.reduce((s, l) => s + (l.tinnitusLevel || 50), 0) / weeklyLogs.length)
    : null;
  const avgSleep = weeklyLogs.length
    ? Math.round(weeklyLogs.reduce((s, l) => s + (l.sleepHours || 7), 0) / weeklyLogs.length * 10) / 10
    : null;
  const avgStress = weeklyLogs.length
    ? Math.round(weeklyLogs.reduce((s, l) => s + (l.stressLevel || 50), 0) / weeklyLogs.length)
    : null;

  const lines = [];
  if (avgTinnitus !== null) {
    if (avgTinnitus < 30) lines.push('Tu tinnitus esta en nivel leve. Excelente progreso.');
    else if (avgTinnitus < 60) lines.push('Tu tinnitus esta en nivel moderado. Continua con la terapia.');
    else lines.push('Tu tinnitus esta en nivel alto. Considera aumentar las sesiones de terapia.');
  }
  if (avgSleep !== null) {
    if (avgSleep >= 7) lines.push(`Duermes un promedio de ${avgSleep}h. Suficiente para la recuperación.`);
    else lines.push(`Duermes ${avgSleep}h en promedio. Intenta llegar a 7h para reducir el tinnitus.`);
  }
  if (avgStress !== null) {
    if (avgStress < 40) lines.push('Tu estrés está bien controlado.');
    else if (avgStress > 66) lines.push('Tu estrés está alto. La respiración diafragmática puede ayudar.');
  }
  if (notes.length > 0) {
    const moods = notes.map(n => n.mood).filter(Boolean);
    const moodCounts = {};
    moods.forEach(m => { moodCounts[m] = (moodCounts[m] || 0) + 1; });
    const dominant = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
    if (dominant) {
      const moodLabels = { good: 'bien', neutral: 'normal', bad: 'mal', anxious: 'ansioso', irritated: 'irritado', tired: 'cansado', focused: 'enfocado', hopeful: 'esperanzado' };
      lines.push(`Tu estado emocional predominante fue: ${moodLabels[dominant[0]] || dominant[0]}.`);
    }
  }
  if (thiResult) {
    lines.push(`Tu THI actual es ${thiResult.total}/100 (${thiResult.grade}).`);
  }

  return lines.length > 0 ? lines.join(' ') : null;
};

/**
 * Genera metas semanales personalizadas basadas en datos.
 */
export const generateWeeklyGoals = (weeklyLogs = [], notes = []) => {
  const goals = [];

  if (weeklyLogs.length > 0) {
    const goodSleepDays = weeklyLogs.filter(l => l.sleepHours >= 7).length;
    goals.push({
      id: 'sleep_goal',
      title: 'Dormir 7+ horas',
      description: `${goodSleepDays} de ${weeklyLogs.length} días con sueño suficiente`,
      target: 5,
      current: goodSleepDays,
      unit: 'días',
      color: '#2DD4BF',
      icon: '😴',
      autoGenerated: true,
    });

    const avgStress = weeklyLogs.reduce((s, l) => s + (l.stressLevel || 50), 0) / weeklyLogs.length;
    goals.push({
      id: 'stress_goal',
      title: 'Mantener estrés bajo',
      description: `Objetivo: estrés promedio < 40 (actual: ${Math.round(avgStress)})`,
      target: 40,
      current: Math.round(avgStress),
      unit: 'puntos',
      color: '#A78BFA',
      icon: '🧠',
      autoGenerated: true,
      invert: true,
    });
  }

  const daysLogged = new Set(weeklyLogs.map(l => l.date)).size;
  goals.push({
    id: 'tracking_goal',
    title: 'Registrar a diario',
    description: `${daysLogged} de 7 días registrados esta semana`,
    target: 7,
    current: daysLogged,
    unit: 'días',
    color: '#FBBF24',
    icon: '📊',
    autoGenerated: true,
  });

  const notesThisWeek = notes.filter(n => {
    const noteDate = new Date(n.timestamp || n.createdAt);
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    return noteDate >= weekAgo;
  }).length;

  goals.push({
    id: 'notes_goal',
    title: 'Escribir notas',
    description: `${notesThisWeek} notas escritas esta semana`,
    target: 3,
    current: notesThisWeek,
    unit: 'notas',
    color: '#F472B6',
    icon: '📝',
    autoGenerated: true,
  });

  return goals;
};

/**
 * Analiza una nota individual y genera insight contextual.
 */
export const analyzeNote = (text, mood, dailyLog = null) => {
  const lower = text.toLowerCase();
  const tags = [];
  let suggestion = '';
  let therapyAction = null;
  let emotion = 'neutral';

  if (lower.includes('dormir') || lower.includes('noche') || lower.includes('insomnio') || lower.includes('sueño')) {
    tags.push('#sueño');
    suggestion = 'El sueño influye directamente en tu tinnitus. Prueba sonido marrón esta noche.';
    therapyAction = 'sound_brown';
  }
  if (lower.includes('estrés') || lower.includes('trabajo') || lower.includes('ansiedad') || lower.includes('preocup')) {
    tags.push('#estrés');
    suggestion = 'El estrés amplifica la percepción del tinnitus. Una sesión de respiración puede ayudar.';
    therapyAction = 'breathing';
  }
  if (lower.includes('médico') || lower.includes('medicamento') || lower.includes('pastilla') || lower.includes('doctor')) {
    tags.push('#medicación');
  }
  if (lower.includes('ejercicio') || lower.includes('caminar') || lower.includes('gym') || lower.includes('deporte')) {
    tags.push('#ejercicio');
    suggestion = 'El ejercicio regular reduce el estrés y puede mejorar tu habituación.';
  }
  if (lower.includes('ruido') || lower.includes('sonido') || lower.includes('terapia')) {
    tags.push('#terapia');
  }
  if (lower.includes('familia') || lower.includes('amigo') || lower.includes('soledad')) {
    tags.push('#social');
  }

  if (mood === 'anxious' || mood === 'irritated') emotion = 'negativo';
  else if (mood === 'good' || mood === 'hopeful' || mood === 'focused') emotion = 'positivo';
  else emotion = 'neutral';

  if (tags.length === 0) tags.push('#general');
  if (!suggestion) suggestion = 'Sigue registrando tus observaciones. Los patrones se hacen más claros con el tiempo.';

  if (dailyLog) {
    if (dailyLog.tinnitusLevel > 60 && mood === 'anxious') {
      suggestion += ' Tu tinnitus está alto y te sientes ansioso. Una sesión de respiración ahora puede bajar ambos.';
      therapyAction = 'breathing';
    }
    if (dailyLog.sleepHours < 6) {
      suggestion += ' Dormiste poco hoy. Prioriza el descanso esta noche.';
    }
  }

  return { tags, suggestion, therapyAction, emotion };
};

/**
 * Obtiene el color y label de un mood.
 */
export const MOOD_CONFIG = {
  good:     { emoji: '😊', label: 'Bien',      color: '#34C759', value: 5 },
  focused:  { emoji: '🎯', label: 'Enfocado',  color: '#00B4D8', value: 4.5 },
  hopeful:  { emoji: '🌱', label: 'Esperanzado', color: '#30D158', value: 4 },
  neutral:  { emoji: '😐', label: 'Normal',    color: '#FF9500', value: 3 },
  tired:    { emoji: '😩', label: 'Cansado',   color: '#FF6B6B', value: 2.5 },
  bad:      { emoji: '😔', label: 'Mal',       color: '#FF3B30', value: 2 },
  anxious:  { emoji: '😰', label: 'Ansioso',   color: '#5856D6', value: 1.5 },
  irritated:{ emoji: '😤', label: 'Irritado',  color: '#FF2D55', value: 1 },
};
