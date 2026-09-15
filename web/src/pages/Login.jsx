import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useUserAuth } from '../context/UserAuthContext';
import GoogleIcon from '../components/GoogleIcon';

export default function Login() {
    const { login, signInWithGoogle } = useUserAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email.trim(), password);
            navigate('/perfil');
        } catch (err) {
            setError(traducirError(err));
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogle() {
        setError('');
        setLoading(true);
        try {
            await signInWithGoogle();
            navigate('/perfil');
        } catch (err) {
            setError(traducirError(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="section auth-section">
            <div className="auth-card">
                <div className="auth-head">
                    <span className="brand-mark"><Mail size={20} /></span>
                    <h1>Inicia sesión</h1>
                    <p className="section-lead">Usa la misma cuenta que en la app móvil de Tinnitoff.</p>
                </div>

                {error && (
                    <div className="auth-error"><AlertCircle size={18} /><span>{error}</span></div>
                )}

                <button type="button" className="btn-google" onClick={handleGoogle} disabled={loading}>
                    <GoogleIcon size={18} />
                    <span>Continuar con Google</span>
                </button>

                <div className="auth-divider"><span>o con tu correo</span></div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <label className="field">
                        <span className="field-label"><Mail size={15} /> Correo electrónico</span>
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" autoComplete="email" />
                    </label>
                    <label className="field">
                        <span className="field-label"><Lock size={15} /> Contraseña</span>
                        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
                    </label>
                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? <><Loader2 size={18} className="spin" /> Entrando…</> : 'Iniciar sesión'}
                    </button>
                </form>

                <p className="auth-switch">¿No tienes cuenta? <Link to="/registro">Regístrate</Link></p>
            </div>
        </section>
    );
}

function traducirError(err) {
    const code = err?.code || '';
    if (code.includes('user-not-found') || code.includes('wrong-password') || code.includes('invalid-credential'))
        return 'Correo o contraseña incorrectos.';
    if (code.includes('invalid-email')) return 'El correo no tiene un formato válido.';
    if (code.includes('too-many-requests')) return 'Demasiados intentos. Intenta más tarde.';
    if (code.includes('popup-closed')) return 'Ventana de Google cerrada. Inténtalo de nuevo.';
    if (code.includes('network')) return 'Sin conexión con el servidor. Revisa tu internet.';
    return err?.message || 'No pudimos iniciar sesión.';
}
