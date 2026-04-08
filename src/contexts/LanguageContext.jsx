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
        matcher_title: "Igualador de Frecuencia",
        matcher_desc: "Encuentra tu tono",
        matcher_modal_title: "Encuentra tu Frecuencia",
        matcher_instruction: "Usa el deslizador para igualar el tono de tu tinnitus.",
        save_match_btn: "Guardar Frecuencia",

        // Actions Grid
        action_matcher: "Frecuencia",
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
        success: "Éxito"
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
        success: "Success"
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
