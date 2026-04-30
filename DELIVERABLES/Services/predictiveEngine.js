export const getPrediction = (logs) => {
  // Mock logic: si hay 3 logs altos de tinnitus...
  const highLogs = logs.filter(l => l.level >= 8).length;
  if (highLogs >= 3) {
    return "Patrón detectado: Tinnitus elevado persistente. Sugerimos agendar cita médica si continúan los síntomas, y probar Terapia 3D en la app.";
  }
  return "Tus niveles se mantienen estables.";
};
