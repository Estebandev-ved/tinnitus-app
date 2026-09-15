import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Moon, Sun, Waves, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useUserAuth } from '../context/UserAuthContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { currentUser, isAdmin } = useUserAuth();
  const location = useLocation();

  useEffect(() => { setOpen(false); }, [location]);

  const linkClass = ({ isActive }) => (isActive ? 'active' : '');
  const initial = (currentUser?.displayName || currentUser?.email || '?').charAt(0).toUpperCase();

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true"><Waves size={18} /></span>
          <span className="brand-name">Tinnitoff</span>
        </Link>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <NavLink to="/" end className={linkClass}>Inicio</NavLink>
          <NavLink to="/planes" className={linkClass}>Planes</NavLink>
          <NavLink to="/descargas" className={linkClass}>Descargas</NavLink>
          <NavLink to="/faq" className={linkClass}>FAQ</NavLink>
          <NavLink to="/contacto" className={linkClass}>Contacto</NavLink>
          <NavLink to="/asistente" className={linkClass}>Asistente</NavLink>
          {currentUser
            ? <NavLink to="/perfil" className={linkClass}>Mi perfil</NavLink>
            : <NavLink to="/ingresar" className={linkClass}>Ingresar</NavLink>}
          {isAdmin && <Link to="/admin" className="btn btn-ghost nav-admin">Panel admin</Link>}
        </nav>

        <div className="nav-actions">
          {currentUser ? (
            <Link to="/perfil" className="nav-account" aria-label="Mi perfil">
              <span className="nav-avatar">{initial}</span>
            </Link>
          ) : (
            <Link to="/ingresar" className="btn btn-primary nav-login">Ingresar</Link>
          )}
          <button className="theme-toggle" onClick={toggle} aria-label="Cambiar tema claro/oscuro">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className="nav-burger"
            onClick={() => setOpen((o) => !o)}
            aria-label="Abrir menú"
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
