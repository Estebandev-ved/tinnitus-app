import { getTHIGrade } from '../components/THIQuestionnaire';

/**
 * Genera un análisis clínico y una propuesta de plan de tratamiento personalizado
 * con base en el THI y la frecuencia de tinnitus detectada.
 */
export const generateAIRecommendation = (thiResult, matchedFrequency = null) => {
  const totalScore = thiResult?.total ?? 0;
  const gradeInfo = getTHIGrade(totalScore);
  const functional = thiResult?.functional ?? 0;
  const emotional = thiResult?.emotional ?? 0;
  const catastrophic = thiResult?.catastrophic ?? 0;
  const frequencyHz = matchedFrequency?.frequency || matchedFrequency?.centerFreq || null;

  // Identificar la dimensión predominante de molestia
  let dominantAspect = 'Balanced';
  const maxSubscore = Math.max(functional, emotional, catastrophic);
  if (maxSubscore > 0) {
    if (maxSubscore === catastrophic) dominantAspect = 'Catastrophic';
    else if (maxSubscore === emotional) dominantAspect = 'Emotional';
    else dominantAspect = 'Functional';
  }

  // Generar prescripción personalizada según evidencia clínica (TRT + TCC)
  let summaryTitle = '';
  let summaryDescription = '';
  let keyPillars = [];
  let primarySoundTherapy = '';

  switch (gradeInfo.grade) {
    case 'Leve':
      summaryTitle = 'Perfil de Habituación Ligera';
      summaryDescription = 'Tu tinnitus se percibe principalmente en ambientes muy silenciosos. Estás en una excelente posición para lograr la habituación completa de forma rápida con técnicas de fondo sonoro y desacople pasivo.';
      keyPillars = ['Higiene sonora nocturna', 'Sonidos de fondo suaves en trabajo', 'Reorientación atencional breve'];
      primarySoundTherapy = 'Ruido Rosa / Marrón a bajo volumen en momentos de concentración';
      break;

    case 'Mediano':
      summaryTitle = 'Perfil de Reactividad Moderada';
      summaryDescription = 'El acúfeno es enmascarable con ruido ambiental, pero genera distracción sutil o momentos puntuales de molestia durante el día o la noche.';
      keyPillars = ['Filtro Notched Sound adaptado a tu frecuencia', 'Reestructuración cognitiva breve', 'Técnicas de respiración anti-estrés'];
      primarySoundTherapy = 'Terapia Sonora Notched (Frecuencia enmascarada) 15-20 min/día';
      break;

    case 'Moderado':
      summaryTitle = 'Perfil de Reestructuración Auditiva Aumentada';
      summaryDescription = 'El tinnitus interfiere en la atención o el descanso nocturno. El cerebro ha activado una alerta ante el sonido. Requerimos reentrenamiento auditivo progresivo (TRT) y modulación de respuesta afectiva.';
      keyPillars = ['Entrenamiento de desensibilización TRT', 'TCC para reducir catastrofización auditiva', 'Relajación de músculos ATM (mandíbula y cuello)'];
      primarySoundTherapy = 'Terapia Notched + Ambientes Paisaje sonoro espacial 20 min/día';
      break;

    case 'Severo':
    case 'Catastrófico':
      summaryTitle = 'Perfil de Alta Prioridad de Desacople Auditivo';
      summaryDescription = 'Existe una hiperactivación del sistema límbico y vegetativo frente al acúfeno. Es fundamental reducir la respuesta de estrés del cuerpo y usar sonido terapéutico continuo para calmar el sistema auditivo.';
      keyPillars = ['Modo Rescate & Desacople de amenaza', 'Terapia TCC intensiva de reencuadre', 'Control de fatiga y sueño asistido con sonido'];
      primarySoundTherapy = 'Enmascaramiento auditivo continuo de confort + Notched Audio guiado';
      break;

    default:
      summaryTitle = 'Evaluación Personalizada de Tinnitus';
      summaryDescription = 'Basado en tus respuestas, hemos preparado un protocolo personalizado para acelerar tu proceso de habituación.';
      keyPillars = ['Enmascaramiento sonoro', 'TCC básica', 'Diario de progreso'];
      primarySoundTherapy = 'Sonido personalizado';
      break;
  }

  // Ajustes por subescala predominante
  if (dominantAspect === 'Emotional') {
    keyPillars.unshift('Énfasis en regulación emocional y defusión cognitiva');
  } else if (dominantAspect === 'Catastrophic') {
    keyPillars.unshift('Enfoque prioritario en desmitificación del tinnitus y calma vegetativa');
  } else if (dominantAspect === 'Functional') {
    keyPillars.unshift('Optimización de concentración laboral e higiene del sueño');
  }

  return {
    gradeInfo,
    dominantAspect,
    frequencyHz,
    summaryTitle,
    summaryDescription,
    keyPillars,
    primarySoundTherapy,
    recommendedWeeksCount: totalScore > 56 ? 6 : 4
  };
};
