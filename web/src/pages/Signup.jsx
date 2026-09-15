import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, AlertCircle, Loader2 } from 'lucide-react';
import { useUserAuth } from '../context/UserAuthContext';
import GoogleIcon from '../components/GoogleIcon';

export default function Signup() {
    const { signup, signInWithGoogle } = useUserAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        if (password.length < 6) {
            setError('Usa al menos 6 caracteres en la contraseña.');
            return;
        }
        setLoading(true);
        try {
            await signup(email.trim(), password, name.trim());
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
                    <span className="brand-mark"><UserIcon size={20} /></span>
                    <h1>Crea tu cuenta</h1>
                    <p className="section-lead">Tu cuenta funciona en la app móvil y en la web.</p>
                </div>

                {error && (
                    <div className="auth-error"><AlertCircle size={18} /><span>{error}</span></div>
                )}

                <button type="button" className="btn-google" onClick={handleGoogle} disabled={loading}>
                    <GoogleIcon size={18} />
                    <span>Continuar con Google</span>
                </button>

                <div className="auth-divider"><span>o regístrate con tu correo</span></div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <label className="field">
                        <span className="field-label"><UserIcon size={15} /> Nombre</span>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" autoComplete="name" />
                    </label>
                    <label className="field">
                        <span className="field-label"><Mail size={15} /> Correo electrónico</span>
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" autoComplete="email" />
                    </label>
                    <label className="field">
                        <span className="field-label"><Lock size={15} /> Contraseña</span>
                        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" autoComplete="new-password" />
                    </label>
                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? <><Loader2 size={18} className="spin" /> Creando…</> : 'Crear cuenta'}
                    </button>
                </form>

                <p className="auth-switch">¿Ya tienes cuenta? <Link to="/ingresar">Inicia sesión</Link></p>
            </div>
        </section>
    );
}

function traducirError(err) {
    const code = err?.code || '';
    if (code.includes('email-already-in-use')) return 'Este correo ya está registrado. Inicia sesión.';
    if (code.includes('weak-password')) return 'La contraseña es muy débil (mínimo 6 caracteres).';
    if (code.includes('invalid-email')) return 'El correo no tiene un formato válido.';
    if (code.includes('network')) return 'Sin conexión con el servidor. Revisa tu internet.';
    return err?.message || 'No pudimos crear la cuenta.';
}
