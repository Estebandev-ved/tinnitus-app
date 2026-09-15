import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../api/adminService';

const PAGE_SIZE = 10;

function fmtDate(v) {
  if (!v) return '—';
  const d = new Date(v);
  return isNaN(d) ? '—' : d.toLocaleDateString();
}

export default function UsuariosPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    adminService.getUsers()
      .then((res) => {
        const list = Array.isArray(res) ? res : (res.content || []);
        setUsers(list);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const roles = useMemo(
    () => ['', ...Array.from(new Set(users.map((u) => u.role).filter(Boolean)))],
    [users]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (role && u.role !== role) return false;
      if (!q) return true;
      return (
        (u.username || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
      );
    });
  }, [users, query, role]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageItems = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const handlePromote = async (userId, username) => {
    if (!window.confirm(`¿Ascender a "${username}" a administrador?`)) return;
    setActionLoading(userId);
    try {
      await adminService.promoteUser(userId);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: 'ROLE_ADMIN' } : u));
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDemote = async (userId, username) => {
    if (!window.confirm(`¿Degradar a "${username}" a usuario normal?`)) return;
    setActionLoading(userId);
    try {
      await adminService.demoteUser(userId);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: 'ROLE_USER' } : u));
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggle = async (userId, username, currentEnabled) => {
    const action = currentEnabled ? 'deshabilitar' : 'habilitar';
    if (!window.confirm(`¿${action.charAt(0).toUpperCase() + action.slice(1)} a "${username}"?`)) return;
    setActionLoading(userId);
    try {
      await adminService.toggleUserEnabled(userId);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, enabled: !currentEnabled } : u));
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId, username) => {
    if (!window.confirm(`¿Eliminar permanentemente a "${username}"? Esta acción no se puede deshacer.`)) return;
    setActionLoading(userId);
    try {
      await adminService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="container narrow"><p>Cargando usuarios…</p></div>;
  if (error) return <div className="container narrow"><div className="alert-error">{error}</div></div>;

  return (
    <div className="dashboard">
      <header className="dash-head">
        <div>
          <h1>Usuarios</h1>
          <p className="muted">{users.length} usuario(s) en total.</p>
        </div>
      </header>

      <div className="filters">
        <input
          className="input"
          placeholder="Buscar por usuario o email…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
        />
        <select className="input" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
          {roles.map((r) => (
            <option key={r} value={r}>{r || 'Todos los roles'}</option>
          ))}
        </select>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Usuario</th><th>Email</th><th>Rol</th><th>Alta</th>
              <th>Disp.</th><th>Telm.</th><th>THI</th><th>Aud.</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((u) => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td>{u.email || '—'}</td>
                <td><span className="role-pill">{u.role || '—'}</span></td>
                <td>{fmtDate(u.createdAt)}</td>
                <td>{u.deviceCount}</td>
                <td>{u.telemetryCount}</td>
                <td>{u.thiCount}</td>
                <td>{u.audiometryCount}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <Link className="btn btn-small" to={`/admin/usuarios/${u.id}`}>Ver</Link>
                    {u.role !== 'ROLE_ADMIN' ? (
                      <button
                        className="btn btn-small btn-primary"
                        disabled={actionLoading === u.id}
                        onClick={() => handlePromote(u.id, u.username)}
                      >
                        {actionLoading === u.id ? '…' : 'Ascender'}
                      </button>
                    ) : (
                      <button
                        className="btn btn-small btn-danger"
                        disabled={actionLoading === u.id}
                        onClick={() => handleDemote(u.id, u.username)}
                      >
                        {actionLoading === u.id ? '…' : 'Degradar'}
                      </button>
                    )}
                    <button
                      className="btn btn-small"
                      disabled={actionLoading === u.id}
                      onClick={() => handleToggle(u.id, u.username, u.enabled)}
                    >
                      {actionLoading === u.id ? '…' : (u.enabled ? 'Deshabilitar' : 'Habilitar')}
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      disabled={actionLoading === u.id}
                      onClick={() => handleDelete(u.id, u.username)}
                    >
                      {actionLoading === u.id ? '…' : 'Eliminar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {pageItems.length === 0 && (
              <tr><td colSpan="9" className="muted center">Sin resultados.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pager">
        <button className="btn btn-small" disabled={current <= 1} onClick={() => setPage(current - 1)}>Anterior</button>
        <span className="muted">Página {current} de {totalPages}</span>
        <button className="btn btn-small" disabled={current >= totalPages} onClick={() => setPage(current + 1)}>Siguiente</button>
      </div>
    </div>
  );
}
