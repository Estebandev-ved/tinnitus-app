/**
 * Servicio de Notificaciones Multi-Agente (Caregiver Mode)
 * Lógica Event-Driven de Triggers y Payloads Push
 */

// Mock de DB o API Client (Firebase / REST)
const sendPushNotification = async (targetId, message, payload = {}) => {
  console.log(`[PUSH -> ${targetId}]`, message, payload);
  // fetch('https://api.onesignal.com/v1/notifications', { ... })
  return true;
};

export const CaregiverService = {
  // Trigger 1: Paciente logra racha 7 días
  onStreakUpdate: async (patientId, caregiverId, streakDays) => {
    if (streakDays > 0 && streakDays % 7 === 0) {
      return await sendPushNotification(
        caregiverId,
        "Tu paciente logró 7 días seguidos. ¡Felicítalo!",
        { type: 'STREAK_MILESTONE', value: streakDays }
      );
    }
    return false;
  },

  // Trigger 2: Cuidador envía reacción
  onCaregiverReaction: async (caregiverId, patientId, reactionType, emoji) => {
    return await sendPushNotification(
      patientId,
      `Te enviaron ${reactionType} ${emoji}`,
      { type: 'CAREGIVER_REACTION', reaction: reactionType }
    );
  },

  // Trigger 3: Paciente presiona SOS
  onPatientSOSTap: async (patientId, caregiverId) => {
    return await sendPushNotification(
      caregiverId,
      "🚨 Necesito apoyo ahora",
      { type: 'EMERGENCY_SOS', priority: 'HIGH' }
    );
  },

  // Trigger 4: Registro de malestar alto (Spike)
  onDailyLogSpike: async (patientId, caregiverId, tinnitusLevel) => {
    if (tinnitusLevel >= 8) {
      return await sendPushNotification(
        caregiverId,
        "Registro de malestar alto hoy. Requiere atención.",
        { type: 'SPIKE_ALERT', level: tinnitusLevel }
      );
    }
    return false;
  }
};
