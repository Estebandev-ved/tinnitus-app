// Privacy policy content (ES/EN). Single source of truth for the in-app screen
// (PrivacyPolicy.jsx) and mirrored in public/privacy.html (kept in sync by
// src/tests/privacyPolicy.test.js). Every statement was checked against the code (CMP-08).
//
// DRAFT for human/legal review. Placeholders in [BRACKETS] must be completed by the owner.
// Section shape: { id, title, paragraphs?: string[], items?: [lead, text][], after?: string[] }

export const PRIVACY_PLACEHOLDERS = {
  contactEmail: '[CORREO DE CONTACTO]',
  controller: '[RAZON SOCIAL / TITULAR]',
  jurisdiction: '[JURISDICCION]',
};

const C = PRIVACY_PLACEHOLDERS.contactEmail;
const R = PRIVACY_PLACEHOLDERS.controller;
const J = PRIVACY_PLACEHOLDERS.jurisdiction;

export const PRIVACY_CONTENT = {
  es: {
    title: 'Política de Privacidad',
    updated: 'Última actualización: 12 de octubre de 2026 (borrador pendiente de revisión legal)',
    draftNotice: 'Borrador: los textos entre [CORCHETES] deben ser completados por el titular de la app antes de publicar.',
    close: 'Entendido',
    back: 'Volver',
    sections: [
      {
        id: 'who',
        title: '1. Quiénes somos y qué es esta app',
        paragraphs: [
          `TinnitOff es una aplicación que te ayuda a manejar el tinnitus (acúfenos) y a habituarte a él mediante sonidos, seguimiento diario, ejercicios de respiración y un asistente de IA. Es responsabilidad de: ${R} (${J}). Contacto: ${C}.`,
          'TinnitOff no es un dispositivo médico, no diagnostica ni trata enfermedades y no sustituye el consejo, diagnóstico ni tratamiento de un profesional de la salud. Ante cualquier duda sobre tu salud, consulta a tu médico.',
        ],
      },
      {
        id: 'sensitive',
        title: '2. Tus datos de salud son sensibles',
        paragraphs: [
          'Parte de lo que registras (nivel de tinnitus, estrés, sueño, estado de ánimo, perfil médico, audiometría) son datos de salud. Los tratamos como la información más delicada de la app: solo tú puedes leerlos con tu cuenta, y los usamos únicamente para mostrarte tu progreso y personalizar la app. No los vendemos. Esta app no declara cumplir certificaciones sanitarias específicas (como HIPAA) ni ha sido auditada por terceros a la fecha de este texto.',
        ],
      },
      {
        id: 'collect',
        title: '3. Qué datos recopilamos',
        items: [
          ['Cuenta', 'correo electrónico, nombre y foto (si inicias con Google o los indicas). Al registrarte con correo también puedes indicar teléfono y fecha de nacimiento, que se guardan en tu perfil. La contraseña la gestiona Firebase Authentication; nosotros nunca la vemos.'],
          ['Seguimiento diario', 'registros diarios (niveles de tinnitus, estrés y sueño, desencadenantes y notas), rachas, logros y progreso de programas.'],
          ['Audiometría y cuestionarios', 'resultados de la frecuencia de tu tinnitus y del cuestionario THI.'],
          ['Perfil médico (opcional)', 'años con tinnitus, oído afectado, medicamentos, médico y notas que decidas escribir.'],
          ['Notas y diario de voz', 'notas de progreso y transcripciones del diario de voz con la respuesta de la app. El reconocimiento de voz lo realiza tu navegador o sistema operativo (por ejemplo, el servicio de voz de tu dispositivo); TinnitOff no guarda grabaciones de audio.'],
          ['Sonidos y mezclas', 'mezclas de sonido que guardas y predicciones de crisis calculadas en la app.'],
          ['Chat con el asistente', 'tu conversación con el asistente de IA (hasta los últimos 50 mensajes) se guarda en tu cuenta para que el asistente recuerde el contexto.'],
          ['Comunidad', 'tus publicaciones (con categoría y las respuestas y "me gusta" que reciban), que ven otras personas autenticadas; tus reportes de contenido; y la lista de personas y contenidos que bloqueas u ocultas (solo tú la ves).'],
          ['Dispositivo', 'modelo, fabricante, sistema operativo, versión, plataforma, un identificador del dispositivo y la última actividad, usados para el panel técnico y de estabilidad.'],
          ['En tu dispositivo', 'preferencias (idioma, tema, recordatorios, última sesión de sonido, mezclas guardadas, progreso local). Los recordatorios son notificaciones locales del teléfono.'],
        ],
        after: [
          'No usamos publicidad ni SDK de analítica de terceros dentro de la app. Si abres la página de descargas web, registramos de forma agregada el origen de la visita (referente, plataforma y tipo de navegador).',
        ],
      },
      {
        id: 'ai',
        title: '4. Asistente de IA',
        paragraphs: [
          'Las respuestas del asistente las genera Azure OpenAI (Microsoft), que actúa como proveedor que procesa el texto por encargo nuestro. La app nunca se conecta directamente a Azure: pasa por nuestro servidor, que guarda las claves, verifica tu sesión de Firebase antes de responder y limita el uso por usuario (mensajes por minuto, por día y volumen diario).',
          'Qué se envía en cada consulta:',
        ],
        items: [
          ['Tu mensaje y el historial reciente', '(hasta 20 mensajes) tal como los escribiste. Evita escribir datos que no quieras compartir, como nombres, teléfonos o direcciones.'],
          ['Solo datos agregados de tu seguimiento', 'promedios de tinnitus, estrés y sueño, racha y número de registros, frecuencia medida, años con tinnitus y oído afectado.'],
        ],
        after: [
          'No se envían a la IA tu nombre, correo, médico, medicamentos, notas personales ni notas del diario. Si escribes un mensaje que sugiere autolesión, la app muestra líneas de ayuda y no envía ese texto a la IA.',
          'Los contadores de uso del límite se guardan en la memoria de nuestro servidor, asociados a tu identificador de usuario, se reinician cada día UTC o al reiniciar el servidor y no se escriben en una base de datos. Nuestros registros técnicos no guardan el contenido de tus mensajes. Los plazos de conservación del texto por parte de Azure se rigen por las condiciones de Microsoft; [REVISAR configuración de retención de Azure].',
          'El asistente es una ayuda orientativa, puede equivocarse y no da diagnósticos ni recetas. En una urgencia, llama al número de emergencias de tu país.',
        ],
      },
      {
        id: 'camera',
        title: '5. Cámara, tensión facial y audio',
        paragraphs: [
          'El Monitor de tensión facial usa la cámara solo si tú lo activas. El análisis se hace dentro de tu dispositivo: no se envían ni se guardan imágenes ni vídeo en nuestros servidores. Puedes cerrar la función en cualquier momento.',
          'Los sonidos terapéuticos y las pruebas de frecuencia se generan en tu dispositivo. No enviamos audio tuyo a servidores.',
        ],
      },
      {
        id: 'community',
        title: '6. Comunidad y moderación',
        paragraphs: [
          'Lo que publicas en la Comunidad puede ser visto por otras personas con sesión iniciada; se muestra como "Anónimo", pero no escribas datos que te identifiquen. Puedes reportar publicaciones o comentarios, y bloquear a una persona u ocultar contenido; esas listas son privadas. Los reportes se guardan para revisión de moderación y no son visibles para otros usuarios. La Comunidad no es un servicio de atención de salud ni de emergencias.',
        ],
      },
      {
        id: 'use',
        title: '7. Para qué usamos tus datos',
        items: [
          ['', 'Mostrarte tu historial, gráficas, rachas y logros.'],
          ['', 'Personalizar sonidos, ejercicios y las respuestas del asistente.'],
          ['', 'Generar reportes en PDF para tu médico, solo cuando tú lo pides.'],
          ['', 'Mantener la seguridad, moderar la Comunidad y mejorar la estabilidad de la app.'],
        ],
      },
      {
        id: 'share',
        title: '8. Con quién compartimos tus datos',
        paragraphs: ['No vendemos tus datos. Los procesan, por encargo nuestro, estos proveedores:'],
        items: [
          ['Google Firebase', 'inicio de sesión, base de datos (Firestore) y almacenamiento de la foto de perfil.'],
          ['Microsoft Azure OpenAI', 'generación de las respuestas del asistente (ver sección 4).'],
          ['Nuestro servidor (backend)', 'verifica tu sesión y aplica los límites del asistente.'],
        ],
        after: ['También podríamos divulgar datos si una ley o autoridad competente lo exige.'],
      },
      {
        id: 'retention',
        title: '9. Cuánto tiempo conservamos tus datos',
        paragraphs: [
          'Conservamos tus datos mientras tu cuenta esté activa. Al eliminarla, borramos tu cuenta de acceso, tus datos de salud, perfil, chat, notas, bloqueos, tus publicaciones de Comunidad y tu foto. Limitaciones actuales: las respuestas que dejaste en publicaciones de otras personas y los reportes de moderación que enviaste (que no están ligados a tu perfil visible) pueden permanecer; las copias de seguridad del proveedor pueden tardar en expirar. [DEFINIR plazos de retención de reportes y copias de seguridad].',
        ],
      },
      {
        id: 'rights',
        title: '10. Tus derechos y cómo ejercerlos',
        items: [
          ['Acceso', 'puedes ver tus datos en la app y descargar un reporte PDF.'],
          ['Rectificación', 'puedes corregir tu perfil y tus registros desde la app.'],
          ['Borrado', 'puedes eliminar tu cuenta y tus datos dentro de la app: Perfil > "Eliminar mi cuenta" (pide confirmación). También borra los datos guardados en el dispositivo.'],
          ['Revocar permisos', 'puedes quitar los permisos de cámara y notificaciones en los ajustes de tu dispositivo.'],
        ],
        after: [
          `Si no puedes entrar a la app o prefieres hacerlo por escrito, solicita la eliminación de tu cuenta y datos o cualquier otro derecho escribiendo a ${C} desde el correo con el que te registraste, indicando "Eliminar mi cuenta". Responderemos en un plazo razonable [DEFINIR plazo]. Según tu país, puedes tener derechos adicionales y presentar una queja ante la autoridad de protección de datos.`,
        ],
      },
      {
        id: 'minors',
        title: '11. Menores de edad',
        paragraphs: [
          'TinnitOff está pensada para personas mayores de 18 años. Si eres menor, usa la app solo con el consentimiento y la supervisión de tu madre, padre o tutor. [PENDIENTE: la app aún no verifica la edad ni solicita consentimiento parental (tarea CMP-05); revisar antes de publicar]. Si crees que un menor nos dio datos sin autorización, escríbenos y los eliminaremos.',
        ],
      },
      {
        id: 'security',
        title: '12. Seguridad',
        paragraphs: [
          'La comunicación con Firebase y con nuestro servidor usa conexiones cifradas (HTTPS/TLS). Las reglas de acceso de la base de datos están diseñadas para que cada persona solo pueda leer y modificar sus propios datos. Ningún sistema es infalible; si ocurre una brecha que te afecte, te avisaremos como exija la ley.',
        ],
      },
      {
        id: 'changes',
        title: '13. Cambios y contacto',
        paragraphs: [
          `Si cambiamos esta política de forma importante, te lo avisaremos en la app y actualizaremos la fecha de arriba. Preguntas sobre privacidad: ${C}.`,
        ],
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: October 12, 2026 (draft pending legal review)',
    draftNotice: 'Draft: text in [BRACKETS] must be completed by the app owner before publishing.',
    close: 'Got it',
    back: 'Back',
    sections: [
      {
        id: 'who',
        title: '1. Who we are and what this app is',
        paragraphs: [
          `TinnitOff is an app that helps you manage tinnitus and get used to it through sounds, daily tracking, breathing exercises and an AI assistant. The party responsible is: ${R} (${J}). Contact: ${C}.`,
          'TinnitOff is not a medical device, does not diagnose or treat any condition, and does not replace the advice, diagnosis or treatment of a health professional. If you have any concern about your health, talk to your doctor.',
        ],
      },
      {
        id: 'sensitive',
        title: '2. Your health data is sensitive',
        paragraphs: [
          'Some of what you record (tinnitus level, stress, sleep, mood, medical profile, audiometry) is health data. We treat it as the most sensitive information in the app: only you can read it with your account, and we use it only to show your progress and personalize the app. We do not sell it. This app does not claim compliance with specific health certifications (such as HIPAA) and has not been audited by third parties as of this text.',
        ],
      },
      {
        id: 'collect',
        title: '3. What data we collect',
        items: [
          ['Account', 'email, name and photo (if you sign in with Google or provide them). When you sign up with email you may also enter a phone number and date of birth, which are stored in your profile. Your password is handled by Firebase Authentication; we never see it.'],
          ['Daily tracking', 'daily logs (tinnitus, stress and sleep levels, triggers and notes), streaks, achievements and program progress.'],
          ['Audiometry and questionnaires', 'your tinnitus frequency results and THI questionnaire scores.'],
          ['Medical profile (optional)', 'years with tinnitus, affected ear, medications, doctor and any notes you choose to write.'],
          ['Notes and voice diary', 'progress notes and voice diary transcripts with the app\'s reply. Speech recognition is performed by your browser or operating system (for example, your device\'s speech service); TinnitOff does not store audio recordings.'],
          ['Sounds and mixes', 'sound mixes you save and crisis predictions computed in the app.'],
          ['Assistant chat', 'your conversation with the AI assistant (up to the last 50 messages) is saved in your account so the assistant can remember context.'],
          ['Community', 'your posts (with category and any replies and likes they receive), visible to other signed-in people; your content reports; and the list of people and content you block or hide (only you see it).'],
          ['Device', 'model, manufacturer, operating system, version, platform, a device identifier and last activity, used for the technical and stability dashboard.'],
          ['On your device', 'preferences (language, theme, reminders, last sound session, saved mixes, local progress). Reminders are local phone notifications.'],
        ],
        after: [
          'We do not use advertising or third-party analytics SDKs inside the app. If you open the web download page, we record the visit source in aggregate (referrer, platform and browser type).',
        ],
      },
      {
        id: 'ai',
        title: '4. AI assistant',
        paragraphs: [
          'Assistant replies are generated by Azure OpenAI (Microsoft), which processes the text on our behalf. The app never connects directly to Azure: it goes through our server, which holds the keys, verifies your Firebase session before replying, and limits use per user (messages per minute, per day and daily volume).',
          'What is sent with each request:',
        ],
        items: [
          ['Your message and recent history', '(up to 20 messages) exactly as you wrote them. Avoid typing information you do not want to share, such as names, phone numbers or addresses.'],
          ['Only aggregated tracking data', 'averages of tinnitus, stress and sleep, streak and number of logs, measured frequency, years with tinnitus and affected ear.'],
        ],
        after: [
          'Your name, email, doctor, medications, personal notes and diary notes are not sent to the AI. If you write a message suggesting self-harm, the app shows help lines and does not send that text to the AI.',
          'Usage-limit counters are kept in our server\'s memory, tied to your user identifier, reset every UTC day or when the server restarts, and are not written to a database. Our technical logs do not store the content of your messages. How long Azure keeps text is governed by Microsoft\'s terms; [REVIEW Azure retention settings].',
          'The assistant is general guidance, can make mistakes, and does not give diagnoses or prescriptions. In an emergency, call your country\'s emergency number.',
        ],
      },
      {
        id: 'camera',
        title: '5. Camera, facial tension and audio',
        paragraphs: [
          'The facial tension monitor uses the camera only if you turn it on. Analysis happens inside your device: no images or video are sent to or stored on our servers. You can close the feature at any time.',
          'Therapeutic sounds and frequency tests are generated on your device. We do not send audio of you to servers.',
        ],
      },
      {
        id: 'community',
        title: '6. Community and moderation',
        paragraphs: [
          'What you post in Community can be seen by other signed-in people; it is shown as "Anonymous", but do not write details that identify you. You can report posts or comments, and block a person or hide content; those lists are private. Reports are stored for moderation review and are not visible to other users. Community is not a health care or emergency service.',
        ],
      },
      {
        id: 'use',
        title: '7. What we use your data for',
        items: [
          ['', 'Show your history, charts, streaks and achievements.'],
          ['', 'Personalize sounds, exercises and assistant replies.'],
          ['', 'Generate PDF reports for your doctor, only when you ask.'],
          ['', 'Keep the app secure, moderate Community and improve stability.'],
        ],
      },
      {
        id: 'share',
        title: '8. Who we share your data with',
        paragraphs: ['We do not sell your data. These providers process it on our behalf:'],
        items: [
          ['Google Firebase', 'sign-in, database (Firestore) and profile photo storage.'],
          ['Microsoft Azure OpenAI', 'generating assistant replies (see section 4).'],
          ['Our server (backend)', 'verifies your session and applies assistant limits.'],
        ],
        after: ['We may also disclose data if required by law or a competent authority.'],
      },
      {
        id: 'retention',
        title: '9. How long we keep your data',
        paragraphs: [
          'We keep your data while your account is active. When you delete it, we remove your sign-in account, health data, profile, chat, notes, blocks, your Community posts and your photo. Current limitations: replies you left on other people\'s posts and moderation reports you submitted (which are not linked to your visible profile) may remain; provider backups may take time to expire. [DEFINE retention periods for reports and backups].',
        ],
      },
      {
        id: 'rights',
        title: '10. Your rights and how to use them',
        items: [
          ['Access', 'you can view your data in the app and download a PDF report.'],
          ['Correction', 'you can fix your profile and logs from the app.'],
          ['Deletion', 'you can delete your account and data inside the app: Profile > "Delete my account" (asks for confirmation). It also erases data stored on the device.'],
          ['Withdraw permissions', 'you can remove camera and notification permissions in your device settings.'],
        ],
        after: [
          `If you cannot get into the app or prefer to do it in writing, request deletion of your account and data, or any other right, by emailing ${C} from the address you registered with, stating "Delete my account". We will reply within a reasonable time [DEFINE timeframe]. Depending on your country, you may have additional rights and may complain to your data protection authority.`,
        ],
      },
      {
        id: 'minors',
        title: '11. Minors',
        paragraphs: [
          'TinnitOff is intended for people aged 18 or older. If you are under 18, use the app only with the consent and supervision of a parent or guardian. [PENDING: the app does not yet verify age or request parental consent (task CMP-05); review before publishing]. If you believe a minor gave us data without permission, write to us and we will delete it.',
        ],
      },
      {
        id: 'security',
        title: '12. Security',
        paragraphs: [
          'Communication with Firebase and our server uses encrypted connections (HTTPS/TLS). Database access rules are designed so each person can only read and modify their own data. No system is infallible; if a breach affects you, we will notify you as required by law.',
        ],
      },
      {
        id: 'changes',
        title: '13. Changes and contact',
        paragraphs: [
          `If we make significant changes to this policy, we will tell you in the app and update the date above. Privacy questions: ${C}.`,
        ],
      },
    ],
  },
};

export default PRIVACY_CONTENT;
