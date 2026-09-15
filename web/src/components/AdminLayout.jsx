import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Waves, LayoutDashboard, Users, FileText, BarChart3, Bell, FileDown, Megaphone, Download, ExternalLink } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminLayout() {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/admin');
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="brand-mark" aria-hidden="true"><Waves size={18} /></span>
          <span>Tinnitoff <small>Admin</small></span>
        </div>
        <nav className="admin-nav">
          <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
            <LayoutDashboard size={18} className="ico" /> Dashboard
          </NavLink>
          <NavLink to="/admin/usuarios" className={({ isActive }) => isActive ? 'active' : ''}>
            <Users size={18} className="ico" /> Usuarios
          </NavLink>
          <NavLink to="/admin/contenido" className={({ isActive }) => isActive ? 'active' : ''}>
            <FileText size={18} className="ico" /> Contenido
          </NavLink>
          <NavLink to="/admin/analitica" className={({ isActive }) => isActive ? 'active' : ''}>
            <BarChart3 size={18} className="ico" /> Analítica
          </NavLink>
          <NavLink to="/admin/alertas" className={({ isActive }) => isActive ? 'active' : ''}>
            <Bell size={18} className="ico" /> Alertas
          </NavLink>
          <NavLink to="/admin/exportar" className={({ isActive }) => isActive ? 'active' : ''}>
            <FileDown size={18} className="ico" /> Exportar
          </NavLink>
          <NavLink to="/admin/push" className={({ isActive }) => isActive ? 'active' : ''}>
            <Megaphone size={18} className="ico" /> Push
          </NavLink>
          <NavLink to="/admin/descargas" className={({ isActive }) => isActive ? 'active' : ''}>
            <Download size={18} className="ico" /> Descargas
          </NavLink>
          <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
            <ExternalLink size={18} className="ico" /> Ver sitio
          </NavLink>
        </nav>
        <button className="btn btn-ghost logout-btn" onClick={onLogout}>Cerrar sesión</button>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
