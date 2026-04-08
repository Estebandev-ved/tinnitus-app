import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../services/firestoreService';
import { Lock, Mail, ArrowRight, AlertTriangle, User, Phone, Calendar, Chrome } from 'lucide-react';
import loginIllustration from '../assets/illustrations/corte.png';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // New Registration Fields
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [dob, setDob] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, signup, signInWithGoogle } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isLogin && password !== confirmPassword) {
            return setError('Las contraseñas no coinciden.');
        }

        if (!isLogin && password.length < 6) {
            return setError('La contraseña debe tener al menos 6 caracteres.');
        }

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

            // If registration, save extra profile data
            if (isNewUser) {
                await FirestoreService.saveUserProfile(user.uid, {
                    fullName,
                    phone,
                    dob,
                    email: user.email,
                    photoURL: user.photoURL || null
                });
            }

            const userData = {
                uid: user.uid,
                email: user.email,
                role: email === 'admin@tinnitoff.com' ? 'admin' : 'user',
                displayName: fullName || user.displayName
            };

            // Notify parent to proceed
            onLoginSuccess(userData);

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
            const user = result.user;

            // Check if profile exists, if not create basic one
            const existingProfile = await FirestoreService.getUserProfile(user.uid);
            if (!existingProfile) {
                await FirestoreService.saveUserProfile(user.uid, {
                    fullName: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    phone: user.phoneNumber
                });
            }

            const userData = {
                uid: user.uid,
                email: user.email,
                role: user.email === 'admin@tinnitoff.com' ? 'admin' : 'user',
                displayName: user.displayName,
                photoURL: user.photoURL
            };

            onLoginSuccess(userData);
        } catch (err) {
            console.error(err);
            setError('Error con Google: ' + err.message);
        }
        setLoading(false);
    };

    return (
        <div className="login-container animate-fade">
            <div className={`login-card ${!isLogin ? 'expanded' : ''}`}>
                <header className="login-header">
                    <img src={loginIllustration} alt="" className="login-illustration" />
                    <h2>{isLogin ? 'Bienvenido' : 'Crear Cuenta'}</h2>
                    <p>
                        {isLogin
                            ? 'Accede a tu historial y configuración.'
                            : 'Únete para guardar tu progreso.'}
                    </p>
                </header>

                {error && <div className="error-alert"><AlertTriangle size={16} /> {error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLogin && (
                        <>
                            <div className="input-group">
                                <User size={20} className="input-icon" />
                                <input
                                    type="text"
                                    placeholder="Nombre Completo"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <Phone size={20} className="input-icon" />
                                <input
                                    type="tel"
                                    placeholder="Teléfono"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <Calendar size={20} className="input-icon" />
                                <input
                                    type="date"
                                    placeholder="Fecha de Nacimiento"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    )}

                    <div className="input-group">
                        <Mail size={20} className="input-icon" />
                        <input
                            type="email"
                            placeholder="Correo Electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <Lock size={20} className="input-icon" />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div className="input-group">
                            <Lock size={20} className="input-icon" />
                            <input
                                type="password"
                                placeholder="Confirmar Contraseña"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary full-width" disabled={loading}>
                        {loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
                        <ArrowRight size={20} />
                    </button>

                    <div className="divider">
                        <span>O continúa con</span>
                    </div>

                    <button type="button" className="btn google-btn" onClick={handleGoogleLogin} disabled={loading}>
                        <Chrome size={20} /> Google
                    </button>
                </form>

                <div className="auth-switch">
                    <p>
                        {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                        <button className="link-btn" onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}>
                            {isLogin ? 'Regístrate' : 'Inicia Sesión'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
