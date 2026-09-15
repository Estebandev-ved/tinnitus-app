import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminLogin() {
  const { login, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (isAuthenticated) {
    navigate('/admin/dashboard', { replace: true });
    return null;
  }

  const validate = () => {
    const e = {};
    if (!username.trim()) e.username = 'El usuario es obligatorio';
    if (!password) e.password = 'La contraseña es obligatoria';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError(null);
    try {
      await login(username, password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="container narrow">
        <div className="login-card">
          <h1>Panel administrativo</h1>
          <p className="muted">Inicia sesión en el sitio web primero, luego accede al panel aquí.</p>
          <form onSubmit={onSubmit} noValidate>
            <label>
              Usuario
              <input
                className={`input ${errors.username ? 'error' : ''}`}
                value={username}
                onChange={(e) => { setUsername(e.target.value); setErrors((p) => ({ ...p, username: null })); }}
              />
              {errors.username && <span className="field-error">{errors.username}</span>}
            </label>
            <label>
              Contraseña
              <input
                type="password"
                className={`input ${errors.password ? 'error' : ''}`}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: null })); }}
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </label>
            {error && <div className="alert-error">{error}</div>}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
