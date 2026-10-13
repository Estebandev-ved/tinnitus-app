import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
    es: {
        // Splash
        welcome_title: "TinnitOff",
        welcome_tagline: "Silenciando el ruido, sanando tu vida.",
        start_btn: "Empezar",

        // Auth
        login_title: "Bienvenido",
        signup_title: "Crear Cuenta",
        login_desc: "Accede a tu historial y configuración.",
        signup_desc: "Únete para guardar tu progreso.",
        email_placeholder: "Correo Electrónico",
        password_placeholder: "Contraseña",
        confirm_password: "Confirmar Contraseña",
        name_placeholder: "Nombre Completo",
        phone_placeholder: "Teléfono",
        dob_placeholder: "Fecha de Nacimiento",
        login_btn: "Iniciar Sesión",
        signup_btn: "Registrarse",
        google_btn: "Google",
        switch_login: "¿Ya tienes cuenta?",
        switch_signup: "¿No tienes cuenta?",
        link_login: "Inicia Sesión",
        link_signup: "Regístrate",

        // Home
        greeting: "¡Hola, {name}!",
        greeting_admin: "Panel de Control Activo",
        greeting_user: "¿Cómo está tu zumbido hoy?",
        streak_label: "Días seguidos",
        streak_recover: "¿Perdiste tu racha? Recupérala aquí.",
        daily_tip_title: "Consejo del Día",

        // Frequency Matcher
        matcher_title: "Mide tu Tinnitus",
        matcher_desc: "Encuentra tu tono",
        matcher_modal_title: "Mide tu Tinnitus",
        matcher_instruction: "Usa el deslizador para igualar el tono de tu tinnitus.",
        save_match_btn: "Guardar Frecuencia",

        // Actions Grid
        action_matcher: "Mide tu Tinnitus",
        action_tracker: "Seguimiento",
        action_chat: "AI Chat",
        action_library: "Biblioteca",
        action_education: "Aprenda",
        action_breathing: "Respirar",
        action_noise: "Ruido",
        action_notes: "Notas",

        // Tracker
        tracker_title: "Registro Diario",
        tracker_stress: "Nivel de Estrés",
        tracker_tinnitus: "Nivel de Tinnitus",
        tracker_sleep: "Horas de Sueño",
        tracker_notes: "Notas del día (opcional)",
        tracker_save: "Guardar Registro",

        // Breathing
        breath_title: "Respiración Guiada",
        breath_inhale: "Inhala",
        breath_hold: "Sostén",
        breath_exhale: "Exhala",
        breath_start: "Iniciar Sesión",
        breath_stop: "Detener",

        // Common
        close: "Cerrar",
        save: "Guardar",
        cancel: "Cancelar",
        loading: "Cargando...",
        error: "Error",
        success: "Éxito",
        // Account deletion (CMP-01)
        delete_account_row: "Eliminar mi cuenta",
        delete_account_title: "Eliminar cuenta y datos",
        delete_account_warning: "Se eliminarán de forma permanente tu cuenta, tu historial, tu perfil médico, notas, audiometrías y publicaciones de comunidad. Esta acción no se puede deshacer.",
        delete_account_type_prompt: "Escribe {word} para confirmar",
        delete_account_word: "ELIMINAR",
        delete_account_password: "Tu contraseña actual",
        delete_account_confirm_btn: "Eliminar definitivamente",
        delete_account_cancel_btn: "Cancelar",
        delete_account_progress: "Eliminando...",
        delete_account_error: "No se pudo eliminar la cuenta. Revisa tu contraseña o vuelve a iniciar sesión e inténtalo de nuevo.",
        delete_account_google_note: "Se te pedirá confirmar con tu cuenta de Google.",

        // Companion (Lumi)
        companion_calm: "Lumi, tu compañera, está en calma y te acompaña",
        companion_listening: "Lumi, tu compañera, está escuchando",
        companion_breathing: "Lumi, tu compañera, respira contigo",
        companion_celebrating: "Lumi, tu compañera, celebra contigo",
        companion_resting: "Lumi, tu compañera, descansa",
        home_lumi_day: "Estoy aquí contigo. Vamos al ritmo que tú quieras.",
        home_lumi_night: "Descansa, yo cuido la luz.",
        home_daily_tip: "Consejo diario",
        home_greeting_morning: "Buenos días",
        home_greeting_afternoon: "Buenas tardes",
        home_greeting_evening: "Buenas noches",
        home_default_user: "Usuario",
        home_open_profile: "Abrir perfil",
        home_open_streak: "Racha de {n} días. Ver logros",
        home_toggle_theme: "Cambiar tema",
        home_your_day: "Tu día",
        home_streak_label: "Constancia",
        home_streak_value: "{n} días",
        home_streak_hint: "Pequeños pasos diarios",
        home_freq_label: "Tu frecuencia",
        home_freq_none: "Aún sin medir",
        home_freq_hint: "Calibra para afinar la terapia",
        home_start_sound: "Empezar sesión de sonido",
        home_breathe_2min: "Respirar 2 minutos",
        home_content_loading: "Cargando consejos",
        rescue_lumi_done: "Lo hiciste con calma. Estoy contigo cuando lo necesites.",
        crisis_help_button: "¿Necesitas hablar con alguien?",
        crisis_title: "Apoyo y líneas de ayuda",
        crisis_intro: "El tinnitus puede ser agotador y no tienes que pasarlo solo/a. Si te sientes desbordado/a o piensas en hacerte daño, hay personas que pueden escucharte ahora.",
        crisis_country: "País",
        crisis_call: "Llamar al {number}",
        crisis_close: "Cerrar",
        crisis_emergency_note: "Si estás en peligro inmediato.",
        crisis_disclaimer: "TinnitOff ayuda a manejar el tinnitus, pero no sustituye el consejo médico ni la atención en crisis. Verifica siempre los números con tu servicio de salud local.",
        crisis_chat_reply: "Siento que estés pasando por algo tan difícil. Lo que sientes importa y no tienes que afrontarlo solo/a. Hay personas preparadas para escucharte ahora mismo; aquí tienes líneas de ayuda de tu país. Si estás en peligro inmediato, llama a emergencias.",
        mod_report_title: "Reportar publicación",
        mod_block_title: "Bloquear a esta persona",
        mod_report_intro: "Gracias por cuidar de la comunidad. Cuéntanos qué ocurre; lo revisaremos con calma. Ocultaremos este contenido para ti.",
        mod_block_intro: "Dejarás de ver sus publicaciones y comentarios. Puedes desbloquearla cuando quieras desde Comunidad.",
        mod_reason_label: "Motivo",
        mod_reason_spam: "Spam o publicidad",
        mod_reason_harassment: "Acoso o trato irrespetuoso",
        mod_reason_harmful: "Contenido que me preocupa (autolesión, peligro)",
        mod_reason_misinformation: "Información médica engañosa",
        mod_reason_other: "Otro motivo",
        mod_support_note: "Si tú o alguien necesita apoyo ahora mismo, no estás solo/a:",
        mod_report_confirm: "Enviar reporte",
        mod_block_confirm: "Bloquear",
        mod_cancel: "Cancelar",
        mod_error: "No se pudo completar. Inténtalo de nuevo en unos instantes.",
        mod_disclaimer: "La comunidad no sustituye el consejo médico.",
        mod_report_action: "Reportar",
        mod_block_action: "Bloquear",
        mod_report_aria: "Reportar esta publicación",
        mod_reply_report_aria: "Reportar este comentario",
        mod_block_aria: "Bloquear a este autor",
        mod_reported_toast: "Gracias. Hemos ocultado este contenido para ti.",
        mod_blocked_toast: "Listo. Ya no verás su contenido.",
        mod_blocked_manage: "Personas bloqueadas ({count})",
        mod_unblock: "Desbloquear",
        mod_blocked_none: "No has bloqueado a nadie.",
        mod_blocked_person: "Persona bloqueada",
    },
    en: {
        // Splash
        welcome_title: "TinnitOff",
        welcome_tagline: "Silencing the noise, healing your life.",
        start_btn: "Get Started",

        // Auth
        login_title: "Welcome Back",
        signup_title: "Create Account",
        login_desc: "Access your history and settings.",
        signup_desc: "Join to save your progress.",
        email_placeholder: "Email Address",
        password_placeholder: "Password",
        confirm_password: "Confirm Password",
        name_placeholder: "Full Name",
        phone_placeholder: "Phone Number",
        dob_placeholder: "Date of Birth",
        login_btn: "Login",
        signup_btn: "Sign Up",
        google_btn: "Google",
        switch_login: "Already have an account?",
        switch_signup: "Don't have an account?",
        link_login: "Login",
        link_signup: "Sign Up",

        // Home
        greeting: "Hello, {name}!",
        greeting_admin: "Admin Panel Active",
        greeting_user: "How is your tinnitus today?",
        streak_label: "Day Streak",
        streak_recover: "Lost your streak? Recover it here.",
        daily_tip_title: "Tip of the Day",

        // Frequency Matcher
        matcher_title: "Frequency Matcher",
        matcher_desc: "Find your tone",
        matcher_modal_title: "Find Your Frequency",
        matcher_instruction: "Use the slider to match your tinnitus tone.",
        save_match_btn: "Save Frequency",

        // Actions Grid
        action_matcher: "Frequency",
        action_tracker: "Tracker",
        action_chat: "AI Chat",
        action_library: "Library",
        action_education: "Learn",
        action_breathing: "Breathe",
        action_noise: "Noise",
        action_notes: "Notes",

        // Tracker
        tracker_title: "Daily Tracker",
        tracker_stress: "Stress Level",
        tracker_tinnitus: "Tinnitus Level",
        tracker_sleep: "Sleep Hours",
        tracker_notes: "Daily notes (optional)",
        tracker_save: "Save Log",

        // Breathing
        breath_title: "Guided Breathing",
        breath_inhale: "Inhale",
        breath_hold: "Hold",
        breath_exhale: "Exhale",
        breath_start: "Start Session",
        breath_stop: "Stop",

        // Common
        close: "Close",
        save: "Save",
        cancel: "Cancel",
        loading: "Loading...",
        error: "Error",
        success: "Success",
        // Account deletion (CMP-01)
        delete_account_row: "Delete my account",
        delete_account_title: "Delete account and data",
        delete_account_warning: "Your account, history, medical profile, notes, audiometry results and community posts will be permanently deleted. This cannot be undone.",
        delete_account_type_prompt: "Type {word} to confirm",
        delete_account_word: "DELETE",
        delete_account_password: "Your current password",
        delete_account_confirm_btn: "Delete permanently",
        delete_account_cancel_btn: "Cancel",
        delete_account_progress: "Deleting...",
        delete_account_error: "The account could not be deleted. Check your password or sign in again and retry.",
        delete_account_google_note: "You will be asked to confirm with your Google account.",

        // Companion (Lumi)
        companion_calm: "Lumi, your companion, is calm and keeping you company",
        companion_listening: "Lumi, your companion, is listening",
        companion_breathing: "Lumi, your companion, is breathing with you",
        companion_celebrating: "Lumi, your companion, is celebrating with you",
        companion_resting: "Lumi, your companion, is resting",
        home_lumi_day: "I'm here with you. We'll go at your pace.",
        home_lumi_night: "Rest now, I'll watch the glow.",
        home_daily_tip: "Daily tip",
        home_greeting_morning: "Good morning",
        home_greeting_afternoon: "Good afternoon",
        home_greeting_evening: "Good evening",
        home_default_user: "User",
        home_open_profile: "Open profile",
        home_open_streak: "{n}-day streak. View achievements",
        home_toggle_theme: "Toggle theme",
        home_your_day: "Your day",
        home_streak_label: "Consistency",
        home_streak_value: "{n} days",
        home_streak_hint: "Small daily steps",
        home_freq_label: "Your frequency",
        home_freq_none: "Not measured yet",
        home_freq_hint: "Calibrate to tune your therapy",
        home_start_sound: "Start a sound session",
        home_breathe_2min: "Breathe for 2 minutes",
        home_content_loading: "Loading tips",
        rescue_lumi_done: "You did it calmly. I'm here whenever you need me.",
        crisis_help_button: "Need to talk to someone?",
        crisis_title: "Support and helplines",
        crisis_intro: "Tinnitus can be exhausting and you don't have to go through it alone. If you feel overwhelmed or are thinking about hurting yourself, there are people who can listen right now.",
        crisis_country: "Country",
        crisis_call: "Call {number}",
        crisis_close: "Close",
        crisis_emergency_note: "If you are in immediate danger.",
        crisis_disclaimer: "TinnitOff helps you manage tinnitus, but it does not replace medical advice or crisis care. Always verify numbers with your local health service.",
        crisis_chat_reply: "I'm sorry you're going through something so hard. What you feel matters and you don't have to face it alone. There are people ready to listen right now; here are helplines for your country. If you are in immediate danger, call emergency services.",
        mod_report_title: "Report post",
        mod_block_title: "Block this person",
        mod_report_intro: "Thank you for looking after the community. Tell us what is happening and we will review it calmly. We will hide this content for you.",
        mod_block_intro: "You will stop seeing their posts and comments. You can unblock them any time from Community.",
        mod_reason_label: "Reason",
        mod_reason_spam: "Spam or advertising",
        mod_reason_harassment: "Harassment or disrespect",
        mod_reason_harmful: "Content that worries me (self-harm, danger)",
        mod_reason_misinformation: "Misleading medical information",
        mod_reason_other: "Other reason",
        mod_support_note: "If you or someone else needs support right now, you are not alone:",
        mod_report_confirm: "Send report",
        mod_block_confirm: "Block",
        mod_cancel: "Cancel",
        mod_error: "Could not complete this. Please try again in a moment.",
        mod_disclaimer: "The community does not replace medical advice.",
        mod_report_action: "Report",
        mod_block_action: "Block",
        mod_report_aria: "Report this post",
        mod_reply_report_aria: "Report this comment",
        mod_block_aria: "Block this author",
        mod_reported_toast: "Thank you. We have hidden this content for you.",
        mod_blocked_toast: "Done. You will no longer see their content.",
        mod_blocked_manage: "Blocked people ({count})",
        mod_unblock: "Unblock",
        mod_blocked_none: "You have not blocked anyone.",
        mod_blocked_person: "Blocked person",
    }
};

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('tinnitoff_lang') || 'es';
    });

    useEffect(() => {
        localStorage.setItem('tinnitoff_lang', language);
    }, [language]);

    const t = (key, params = {}) => {
        let text = translations[language][key] || key;

        // Replace params key -> value
        Object.keys(params).forEach(param => {
            text = text.replace(`{${param}}`, params[param]);
        });

        return text;
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'es' ? 'en' : 'es');
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
