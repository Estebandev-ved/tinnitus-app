import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';
import { Lock, Mail, AlertTriangle, User, Phone, Calendar, Eye, EyeOff } from 'lucide-react';
import './Login.css';

/* ──────────────────────────────────────────────
   SVG inline de ondas de sonar (sin imagen extra)
   Representa el tinnitus como señal acústica
────────────────────────────────────────────── */
const SonarWaves = () => (
    <svg
        className="sonar-svg"
        viewBox="0 0 360 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        <defs>
            <radialGradient id="sonarGlow" cx="50%" cy="60%" r="50%">
                <stop offset="0%" stopColor="#00B4D8" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#0096C7" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="dotGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#48CAE4" stopOpacity="1" />
                <stop offset="100%" stopColor="#00B4D8" stopOpacity="0.4" />
            </radialGradient>
        </defs>

        {/* Fondo de glow radial */}
        <ellipse cx="180" cy="168" rx="160" ry="110" fill="url(#sonarGlow)" />

        {/* Anillos concéntricos del sonar — más lejanos */}
        <circle cx="180" cy="168" r="120" stroke="#00B4D8" strokeWidth="0.6" strokeOpacity="0.15" className="sonar-ring sonar-ring-5" />
        <circle cx="180" cy="168" r="97"  stroke="#00B4D8" strokeWidth="0.8" strokeOpacity="0.22" className="sonar-ring sonar-ring-4" />
        <circle cx="180" cy="168" r="74"  stroke="#48CAE4" strokeWidth="1"   strokeOpacity="0.30" className="sonar-ring sonar-ring-3" />
        <circle cx="180" cy="168" r="52"  stroke="#48CAE4" strokeWidth="1.2" strokeOpacity="0.40" className="sonar-ring sonar-ring-2" />
        <circle cx="180" cy="168" r="32"  stroke="#90E0EF" strokeWidth="1.5" strokeOpacity="0.55" className="sonar-ring sonar-ring-1" />

        {/* Línea de barrido del sonar */}
        <line
            x1="180" y1="168"
            x2="180" y2="50"
            stroke="url(#dotGlow)"
            strokeWidth="1"
            strokeOpacity="0.6"
            className="sonar-sweep"
            strokeLinecap="round"
        />

        {/* Punto central — origen del sonido */}
        <circle cx="180" cy="168" r="5" fill="url(#dotGlow)" className="sonar-core" />
        <circle cx="180" cy="168" r="10" fill="#00B4D8" fillOpacity="0.12" className="sonar-core-ring" />

        {/* Partículas / destellos ambientales */}
        <circle cx="100" cy="95"  r="1.5" fill="#48CAE4" fillOpacity="0.6" className="sonar-particle p1" />
        <circle cx="258" cy="110" r="1"   fill="#90E0EF" fillOpacity="0.5" className="sonar-particle p2" />
        <circle cx="78"  cy="185" r="1"   fill="#48CAE4" fillOpacity="0.4" className="sonar-particle p3" />
        <circle cx="285" cy="200" r="1.5" fill="#00B4D8" fillOpacity="0.5" className="sonar-particle p4" />
        <circle cx="140" cy="60"  r="1"   fill="#90E0EF" fillOpacity="0.45" className="sonar-particle p5" />
        <circle cx="220" cy="72"  r="1.2" fill="#48CAE4" fillOpacity="0.5" className="sonar-particle p6" />

        {/* Líneas de onda horizontal (EEG-style) */}
        <path
            d="M 30 240 Q 60 235 80 240 Q 100 245 120 232 Q 145 218 160 240 Q 175 255 180 240 Q 185 225 200 240 Q 215 252 240 235 Q 265 220 280 240 Q 300 252 330 240"
            stroke="#00B4D8"
            strokeWidth="1"
            strokeOpacity="0.25"
            fill="none"
            className="sonar-wave-line"
        />
        <path
            d="M 20 258 Q 55 253 75 258 Q 95 264 110 252 Q 135 238 155 258 Q 168 272 180 258 Q 192 244 210 258 Q 228 270 252 255 Q 275 240 300 258 Q 318 270 340 258"
            stroke="#48CAE4"
            strokeWidth="0.8"
            strokeOpacity="0.18"
            fill="none"
            className="sonar-wave-line"
        />
    </svg>
);

/* ──────────────────────────────────────────────
   Ícono de Google SVG oficial (minimalista)
────────────────────────────────────────────── */
const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
);

/* ──────────────────────────────────────────────
   Componente principal Login
────────────────────────────────────────────── */
const Login = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin]               = useState(true);
    const [email, setEmail]                   = useState('');
    const [password, setPassword]             = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName]             = useState('');
    const [phone, setPhone]                   = useState('');
    const [dob, setDob]                       = useState('');
    const [showPass, setShowPass]             = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [error, setError]                   = useState('');
    const [loading, setLoading]               = useState(false);

    const { login, signup, signInWithGoogle } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isLogin && password !== confirmPassword)
            return setError('Las contraseñas no coinciden.');
        if (!isLogin && password.length < 6)
            return setError('La contraseña debe tener al menos 6 caracteres.');

        setLoading(true);
        try {
            let userCredential;
            let isNewUser = false;

            if (isLogin) {
                userCredential = await login(email, password);
            } else {
                userCredential = await signup(email, password);
                isNewUser = true;
            }

            const user = userCredential.user;

            if (isNewUser) {
                await FirestoreService.saveUserProfile(user.uid, {
                    fullName, phone, dob,
                    email: user.email,
                    photoURL: user.photoURL || null
                });
            }

            onLoginSuccess({
                uid: user.uid,
                email: user.email,
                role: 'user',
                displayName: fullName || user.displayName
            });
        } catch (err) {
            console.error(err);
            setError('Error: ' + err.message);
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            const result = await signInWithGoogle();
            const user   = result.user;

            const existingProfile = await FirestoreService.getUserProfile(user.uid);
            if (!existingProfile) {
                await FirestoreService.saveUserProfile(user.uid, {
                    fullName:  user.displayName,
                    email:     user.email,
                    photoURL:  user.photoURL,
                    phone:     user.phoneNumber
                });
            }

            onLoginSuccess({
                uid:         user.uid,
                email:       user.email,
                role:        'user',
                displayName: user.displayName,
                photoURL:    user.photoURL
            });
        } catch (err) {
            console.error(err);
            setError('Error con Google: ' + err.message);
        }
        setLoading(false);
    };

    const switchMode = () => { setIsLogin(!isLogin); setError(''); };

    return (
        <div className="login-screen">

            {/* ── Zona ilustración sonar ── */}
            <div className="login-hero">
                <SonarWaves />
                <div className="login-brand">
                    <div className="login-brand-dot" />
                    <span className="login-brand-name">TinnitOff</span>
                </div>
                <p className="login-tagline">Tu terapia de acúfenos, a tu lado</p>
            </div>

            {/* ── Tarjeta del formulario ── */}
            <div className="login-form-area">
                <div className="login-form-header">
                    <h2>{isLogin ? 'Bienvenido de nuevo' : 'Crear cuenta'}</h2>
                    <p>{isLogin ? 'Accede a tu historial clínico.' : 'Únete y empieza tu terapia.'}</p>
                </div>

                {error && (
                    <div className="login-error" role="alert">
                        <AlertTriangle size={15} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form" noValidate>

                    {/* ── Campos solo en registro ── */}
                    {!isLogin && (
                        <>
                            <div className="lf-input-wrap">
                                <User size={17} className="lf-icon" />
                                <input
                                    type="text"
                                    placeholder="Nombre completo"
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    autoComplete="name"
                                    required
                                />
                            </div>
                            <div className="lf-input-wrap">
                                <Phone size={17} className="lf-icon" />
                                <input
                                    type="tel"
                                    placeholder="Teléfono"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    autoComplete="tel"
                                    required
                                />
                            </div>
                            <div className="lf-input-wrap">
                                <Calendar size={17} className="lf-icon" />
                                <input
                                    type="date"
                                    placeholder="Fecha de nacimiento"
                                    value={dob}
                                    onChange={e => setDob(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    )}

                    {/* ── Email ── */}
                    <div className="lf-input-wrap">
                        <Mail size={17} className="lf-icon" />
                        <input
                            type="email"
                            placeholder="Correo electrónico"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                        />
                    </div>

                    {/* ── Contraseña ── */}
                    <div className="lf-input-wrap">
                        <Lock size={17} className="lf-icon" />
                        <input
                            type={showPass ? 'text' : 'password'}
                            placeholder="Contraseña"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoComplete={isLogin ? 'current-password' : 'new-password'}
                            required
                        />
                        <button
                            type="button"
                            className="lf-eye-btn"
                            onClick={() => setShowPass(!showPass)}
                            tabIndex={-1}
                            aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    {/* ── Confirmar contraseña (solo registro) ── */}
                    {!isLogin && (
                        <div className="lf-input-wrap">
                            <Lock size={17} className="lf-icon" />
                            <input
                                type={showConfirmPass ? 'text' : 'password'}
                                placeholder="Confirmar contraseña"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                autoComplete="new-password"
                                required
                            />
                            <button
                                type="button"
                                className="lf-eye-btn"
                                onClick={() => setShowConfirmPass(!showConfirmPass)}
                                tabIndex={-1}
                                aria-label="Mostrar/ocultar confirmación"
                            >
                                {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    )}

                    {/* ── CTA principal ── */}
                    <button
                        type="submit"
                        className="lf-btn-primary"
                        disabled={loading}
                    >
                        {loading
                            ? <span className="lf-spinner" />
                            : (isLogin ? 'Iniciar sesión' : 'Crear cuenta')}
                    </button>

                    {/* ── Separador ── */}
                    <div className="lf-divider">
                        <span />
                        <p>o continúa con</p>
                        <span />
                    </div>

                    {/* ── Google ── */}
                    <button
                        type="button"
                        className="lf-btn-google"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                    >
                        <GoogleIcon />
                        <span>Google</span>
                    </button>
                </form>

                {/* ── Cambiar modo ── */}
                <p className="lf-switch">
                    {isLogin ? '¿Sin cuenta aún?' : '¿Ya tienes cuenta?'}
                    <button className="lf-switch-btn" onClick={switchMode}>
                        {isLogin ? 'Regístrate' : 'Inicia sesión'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;
