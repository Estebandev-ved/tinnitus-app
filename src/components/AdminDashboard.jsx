import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, limit, doc, setDoc } from 'firebase/firestore';
import { 
  Users, Smartphone, Download, RefreshCw, ChevronLeft, Shield, BarChart3, 
  Activity, Calendar, Tag, Trash2, Cpu, HardDrive, CheckCircle, AlertTriangle, BookOpen 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';
import { APP_INFO } from '../config/appInfo';
import { apiClient, isBackendConfigured, getBaseUrl } from '../services/backend/apiClient';
import { authService } from '../services/backend/authService';
import './AdminDashboard.css';

// Credenciales del administrador para consultar el backend (entorno dev/local).
// En producción DEBE configurarse via variables de entorno.
const ADMIN_USER = import.meta.env.VITE_ADMIN_USER;
const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS;

export default function AdminDashboard({ onClose }) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [downloadLogs, setDownloadLogs] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDownloads: 0,
    androidUsers: 0,
    webUsers: 0,
    activeDevices: 0
  });
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'downloads' | 'config' | 'info' | 'content'

  // Update configuration state
  const [appConfig, setAppConfig] = useState({
    latest_version: '1.0.0',
    download_url: '',
    force_update: false
  });
  const [savingConfig, setSavingConfig] = useState(false);

  // Real mobile app release info from backend
  const [appRelease, setAppRelease] = useState(null);
  const [releaseError, setReleaseError] = useState(null);
  const [backendOnline, setBackendOnline] = useState(null);

  // Real clinical data from backend (usuarios, THI, audiometrías, telemetría)
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [userDetailLoading, setUserDetailLoading] = useState(false);
  const [backendError, setBackendError] = useState(null);

  // Content management (motor de contenido del backend)
  const [contentItems, setContentItems] = useState([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [contentForm, setContentForm] = useState({ type: 'TIP', title: '', summary: '', body: '', language: 'es', status: 'PUBLISHED', tags: '', imageUrl: '', actionUrl: '' });
  const [savingContent, setSavingContent] = useState(false);

  const ensureBackendAuth = async () => {
    if (authService.isAuthenticated()) return;
    if (!isBackendConfigured()) throw new Error('Backend no configurado (VITE_BACKEND_URL).');
    if (!ADMIN_USER || !ADMIN_PASS) throw new Error('Credenciales de admin no configuradas (VITE_ADMIN_USER, VITE_ADMIN_PASS).');
    await authService.login(ADMIN_USER, ADMIN_PASS);
  };

  const fetchAppRelease = async () => {
    if (!isBackendConfigured()) {
      setBackendOnline(false);
      setReleaseError('Backend no configurado (VITE_BACKEND_URL).');
      return;
    }
    try {
      const release = await apiClient.get('/api/v1/app/releases/latest', { auth: false });
      setAppRelease(release);
      setBackendOnline(true);
      setReleaseError(null);
    } catch (err) {
      setAppRelease(null);
      setBackendOnline(false);
      setReleaseError(err.message || 'No se pudo obtener la información del backend.');
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    setBackendError(null);
    try {
      // 1. Datos REALES desde el backend (usuarios, THI, audiometrías, telemetría)
      try {
        await ensureBackendAuth();
        const stats = await apiClient.get('/api/v1/admin/stats');
        setUsers([]); // se llena abajo
        const usersPage = await apiClient.get('/api/v1/admin/users', {
          params: { page: 0, size: 200 }
        });
        const realUsers = usersPage.content || [];
        setUsers(realUsers);

        // Stats del backend (totales reales)
        const totalDevices = stats.totalDevices || 0;
        setStats({
          totalUsers: stats.totalUsers || 0,
          totalDownloads: stats.totalDownloads || 0,
          androidUsers: totalDevices, // app móvil: todos los dispositivos son móviles
          webUsers: 0,
          activeDevices: totalDevices
        });
        setBackendOnline(true);
        setBackendError(null);
      } catch (be) {
        console.error('Error consultando el backend:', be);
        setBackendOnline(false);
        setBackendError(be.message || 'No se pudo conectar al backend.');
      }

      // 2. Descargas / referidos desde Firebase (analytics de referral)
      try {
        const refSnap = await getDocs(collection(db, 'download_analytics'));
        setReferrals(refSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }

      // 3. Logs detallados de descarga (Firebase)
      try {
        const logsSnap = await getDocs(query(collection(db, 'download_logs'), orderBy('timestamp', 'desc'), limit(50)));
        setDownloadLogs(logsSnap.docs.map(d => ({
          id: d.id, ...d.data(), timestamp: d.data().timestamp?.toDate() || new Date()
        })));
      } catch (e) { console.error(e); }

      // 4. Configuración de actualización (Firebase)
      try {
        const configSnap = await getDocs(collection(db, 'app_config'));
        let configData = { latest_version: '1.0.0', download_url: '', force_update: false };
        configSnap.forEach(docSnap => { if (docSnap.id === 'metadata') configData = docSnap.data(); });
        setAppConfig(configData);
      } catch (e) { console.error(e); }

    } catch (error) {
      console.error("Error fetching admin dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetail = async (userId) => {
    setUserDetailLoading(true);
    setSelectedUser(userId);
    setUserDetail(null);
    try {
      await ensureBackendAuth();
      const detail = await apiClient.get(`/api/v1/admin/users/${userId}`);
      setUserDetail(detail);
    } catch (e) {
      console.error('Error cargando detalle de usuario:', e);
      setUserDetail({ error: e.message });
    } finally {
      setUserDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    fetchAppRelease();
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setContentLoading(true);
    try {
      await ensureBackendAuth();
      const items = await apiClient.get('/api/v1/admin/content');
      setContentItems(items || []);
    } catch (e) {
      console.error('Error cargando contenido:', e);
    } finally {
      setContentLoading(false);
    }
  };

  const startEditContent = (item) => {
    if (item) {
      setContentForm({
        type: item.type, title: item.title, summary: item.summary || '',
        body: item.body || '', language: item.language || 'es', status: item.status || 'PUBLISHED',
        tags: item.tags || '', imageUrl: item.imageUrl || '', actionUrl: item.actionUrl || ''
      });
      setEditingContent(item);
    } else {
      setContentForm({ type: 'TIP', title: '', summary: '', body: '', language: 'es', status: 'PUBLISHED', tags: '', imageUrl: '', actionUrl: '' });
      setEditingContent('new');
    }
  };

  const saveContent = async (e) => {
    e.preventDefault();
    setSavingContent(true);
    try {
      await ensureBackendAuth();
      if (editingContent && editingContent !== 'new') {
        await apiClient.put(`/api/v1/admin/content/${editingContent.id}`, contentForm);
      } else {
        await apiClient.post('/api/v1/admin/content', contentForm);
      }
      setEditingContent(null);
      await fetchContent();
      alert('Contenido guardado correctamente.');
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    } finally {
      setSavingContent(false);
    }
  };

  const deleteContent = async (id) => {
    if (!window.confirm('¿Eliminar este contenido?')) return;
    try {
      await ensureBackendAuth();
      await apiClient.del(`/api/v1/admin/content/${id}`);
      await fetchContent();
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const refreshAll = () => {
    fetchAdminData();
    fetchAppRelease();
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const configRef = doc(db, 'app_config', 'metadata');
      await setDoc(configRef, {
        latest_version: appConfig.latest_version,
        download_url: appConfig.download_url,
        force_update: appConfig.force_update
      }, { merge: true });
      alert('¡Configuración de actualización actualizada con éxito!');
    } catch (error) {
      console.error("Error saving App Config:", error);
      alert('Error al guardar la configuración: ' + error.message);
    } finally {
      setSavingConfig(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="spinner"></div>
        <p>Cargando Panel de Control de TinnitOff...</p>
      </div>
    );
  }

  // Prepara datos de gráficos
  const chartData = referrals.map(ref => ({
    name: ref.id === 'directo' ? 'Directo' : ref.id,
    Descargas: ref.clicksCount || 0
  }));

  return (
    <div className="admin-dashboard-container animate-fade">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Shield size={28} className="admin-logo-icon" />
          <div>
            <h2>TinnitOff</h2>
            <span>Panel de Admin</span>
          </div>
        </div>

        <nav className="admin-nav">
          <button 
            className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart3 size={20} />
            <span>Vista General</span>
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={20} />
            <span>Usuarios ({stats.totalUsers})</span>
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'downloads' ? 'active' : ''}`}
            onClick={() => setActiveTab('downloads')}
          >
            <Download size={20} />
            <span>Descargas / Links</span>
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'config' ? 'active' : ''}`}
            onClick={() => setActiveTab('config')}
          >
            <RefreshCw size={20} />
            <span>Control de APK</span>
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            <Smartphone size={20} />
            <span>Info de la App</span>
          </button>
          <button 
            className={`admin-nav-item ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            <BookOpen size={20} />
            <span>Contenido</span>
          </button>
        </nav>

        <button className="admin-back-btn" onClick={onClose}>
          <ChevronLeft size={20} /> Volver a la App
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="admin-content">
        {/* Top Navigation / Stats bar */}
        <header className="admin-header">
          <div>
            <h1 className="text-gradient">Panel de Control General</h1>
            <p className="subtitle">Monitorea la adopción, telemetría y versión de TinnitOff en tiempo real.</p>
          </div>
          <button className="refresh-btn" onClick={refreshAll} aria-label="Refresh data">
            <RefreshCw size={18} />
          </button>
        </header>

        {/* Stats Grid */}
        <section className="stats-grid">
          <div className="admin-stat-card glass">
            <div className="stat-icon-wrapper blue">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.totalUsers}</h3>
              <p>Usuarios Registrados</p>
            </div>
          </div>

          <div className="admin-stat-card glass">
            <div className="stat-icon-wrapper green">
              <Download size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.totalDownloads}</h3>
              <p>Descargas Totales</p>
            </div>
          </div>

          <div className="admin-stat-card glass">
            <div className="stat-icon-wrapper purple">
              <Smartphone size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.androidUsers}</h3>
              <p>Dispositivos Android</p>
            </div>
          </div>

          <div className="admin-stat-card glass">
            <div className="stat-icon-wrapper orange">
              <Activity size={24} />
            </div>
            <div className="stat-info">
              <h3>{stats.activeDevices}</h3>
              <p>Dispositivos Activos</p>
            </div>
          </div>
        </section>

        {/* Tab Content */}
        <div className="tab-viewport">
          
          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="overview-tab-content animate-slide-up">
              <div className="chart-and-recent-grid">
                
                {/* Recharts Bar Chart */}
                <div className="chart-card glass">
                  <h3>Descargas por Enlace de Referidor</h3>
                  <p className="chart-sub">Visualiza de qué campaña o link externo provienen las instalaciones.</p>
                  
                  <div className="chart-container" style={{ width: '100%', height: 300 }}>
                    {chartData.length > 0 ? (
                      <ResponsiveContainer>
                        <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="name" stroke="#a0a0b0" fontSize={11} tickLine={false} />
                          <YAxis stroke="#a0a0b0" fontSize={11} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ background: '#111122', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                          />
                          <Bar dataKey="Descargas" fill="url(#colorBarGrad)" radius={[8, 8, 0, 0]} maxBarSize={50} />
                          <defs>
                            <linearGradient id="colorBarGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#00E5FF" />
                              <stop offset="100%" stopColor="#007AFF" />
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="no-data-placeholder">
                        <AlertTriangle size={24} />
                        <p>No hay datos de descarga todavía.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recientes */}
                <div className="recent-card glass">
                  <h3>Últimas Descargas Registradas</h3>
                  <div className="logs-list-wrapper">
                    {downloadLogs.length > 0 ? (
                      downloadLogs.map((log) => (
                        <div key={log.id} className="log-row">
                          <div className="log-badge">
                            <Download size={14} />
                          </div>
                          <div className="log-details">
                            <div className="log-title">
                              Origen: <span className="ref-highlight">{log.referrer}</span>
                            </div>
                            <div className="log-meta">
                              {log.platform} | {log.timestamp.toLocaleDateString()} {log.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="no-logs">No se han registrado descargas de links todavía.</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Fast action metrics cards */}
              <div className="bottom-dashboard-cards">
                <div className="dashboard-metric-detail glass">
                  <div className="icon-header-box">
                    <Cpu size={20} color="#00E5FF" />
                    <span>Telemetría Destacada</span>
                  </div>
                  <p>Android es la plataforma predominante para <strong>TinnitOff</strong> representando un {stats.totalUsers > 0 ? Math.round((stats.androidUsers / stats.totalUsers) * 100) : 0}% de los inicios de sesión nativos.</p>
                </div>

                <div className="dashboard-metric-detail glass">
                  <div className="icon-header-box">
                    <CheckCircle size={20} color="#34C759" />
                    <span>Control del APK</span>
                  </div>
                  <p>Estado de actualización activa: <strong>v{appConfig.latest_version}</strong>. Estado de bloqueo obligatorio: <span className={appConfig.force_update ? 'text-danger' : 'text-success'}>{appConfig.force_update ? 'ACTIVO (Forzado)' : 'INACTIVO (Opcional)'}</span>.</p>
                </div>

                <div className="dashboard-metric-detail glass">
                  <div className="icon-header-box">
                    <Smartphone size={20} color="#00E5FF" />
                    <span>App Móvil (datos en vivo)</span>
                  </div>
                  {appRelease ? (
                    <p>Versión publicada: <strong>v{appRelease.version}</strong> (build {appRelease.buildCode}). Actualización forzada: <span className={appRelease.forceUpdate ? 'text-danger' : 'text-success'}>{appRelease.forceUpdate ? 'SÍ' : 'NO'}</span>. Backend: <strong>{backendOnline ? 'En línea' : 'Fuera de línea'}</strong>.</p>
                  ) : (
                    <p>App móvil: <strong>{backendOnline ? 'Sin releases' : 'Backend fuera de línea'}</strong> — ver pestaña "Info de la App".</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Users List & Devices Telemetry (DATOS REALES DEL BACKEND) */}
          {activeTab === 'users' && (
            <div className="users-tab-content animate-slide-up">
              <div className="users-list-header">
                <h3>Usuarios Reales (Backend)</h3>
                <p>Datos clínicos reales de TinnitOff almacenados en el backend: THI, audiometrías, telemetría y dispositivos.</p>
              </div>

              {backendError && users.length === 0 ? (
                <div className="no-users-box">No se pudo cargar desde el backend: {backendError}</div>
              ) : null}

              <div className="users-list-wrapper">
                {users.length > 0 ? (
                  users.map((u) => (
                    <div key={u.id} className="user-admin-card glass animate-fade">
                      <div className="user-card-header">
                        <div className="user-card-profile">
                          <div className="avatar-small">
                            {(u.username || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="user-card-credentials">
                            <h4>{u.username || 'Usuario de TinnitOff'}</h4>
                            <span className="user-card-email">{u.email || 'Sin correo electrónico'}</span>
                          </div>
                        </div>

                        <span className={`badge ${u.role === 'ROLE_ADMIN' ? 'admin' : 'user'}`}>
                          {u.role === 'ROLE_ADMIN' ? 'Administrador' : 'Usuario'}
                        </span>
                      </div>

                      <div className="user-card-body">
                        <div className="user-body-item">
                          <span className="item-label">ID:</span>
                          <span className="mono-text user-id-badge">{u.id}</span>
                        </div>

                        <div className="user-stats-row" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '10px 0' }}>
                          <span className="mini-stat">📱 {u.deviceCount || 0} disp.</span>
                          <span className="mini-stat">🧠 {u.thiCount || 0} THI</span>
                          <span className="mini-stat">🔊 {u.audiometryCount || 0} audio</span>
                          <span className="mini-stat">📡 {u.telemetryCount || 0} tel.</span>
                        </div>

                        <button className="btn btn-primary" onClick={() => fetchUserDetail(u.id)}>
                          Ver detalle clínico
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  !loading && <div className="no-users-box">No hay usuarios registrados en el backend.</div>
                )}
              </div>

              {selectedUser && (
                <div className="card glass" style={{ marginTop: 20 }}>
                  <div className="card-header">
                    <Activity size={24} color="#00E5FF" />
                    <div>
                      <h3>Detalle Clínico — Usuario #{selectedUser}</h3>
                      <p>THI, audiometrías, telemetría y más (datos reales del backend).</p>
                    </div>
                  </div>

                  {userDetailLoading ? (
                    <div className="spinner" />
                  ) : userDetail && !userDetail.error ? (
                    <div className="user-detail-content" style={{ marginTop: 10 }}>
                      <h4>Resultados THI</h4>
                      {userDetail.thiResults && userDetail.thiResults.length > 0 ? (
                        userDetail.thiResults.map((t, i) => (
                          <div key={i} className="detail-row" style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <div><strong>Total: {t.total}</strong> ({t.grade})</div>
                            <div style={{ fontSize: 12, opacity: 0.8 }}>Funcional: {t.functional} | Emocional: {t.emotional} | Catastrófico: {t.catastrophic}</div>
                            <div style={{ fontSize: 12, opacity: 0.6 }}>{t.createdAt ? new Date(t.createdAt).toLocaleString() : ''}</div>
                          </div>
                        ))
                      ) : <p className="no-logs">Sin resultados THI.</p>}

                      <h4 style={{ marginTop: 16 }}>Audiometrías</h4>
                      {userDetail.audiometries && userDetail.audiometries.length > 0 ? (
                        userDetail.audiometries.map((a, i) => (
                          <div key={i} className="detail-row" style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <div><strong>{a.type}</strong> | {a.ear}</div>
                            <div style={{ fontSize: 12, opacity: 0.8 }}>Freq: {a.frequency} Hz | Volumen: {a.volume} dB</div>
                            <div style={{ fontSize: 12, opacity: 0.6 }}>{a.measuredAt ? new Date(a.measuredAt).toLocaleString() : ''}</div>
                          </div>
                        ))
                      ) : <p className="no-logs">Sin audiometrías.</p>}

                      <h4 style={{ marginTop: 16 }}>Telemetría</h4>
                      {userDetail.telemetry && userDetail.telemetry.length > 0 ? (
                        userDetail.telemetry.slice(0, 20).map((t, i) => (
                          <div key={i} className="detail-row" style={{ padding: '6px 0', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <span>{t.eventType} ({t.platform})</span>
                            <span style={{ opacity: 0.6 }}>{t.timestamp ? new Date(t.timestamp).toLocaleString() : ''}</span>
                          </div>
                        ))
                      ) : <p className="no-logs">Sin telemetría.</p>}
                    </div>
                  ) : (
                    <p className="no-logs">{userDetail && userDetail.error ? userDetail.error : 'Sin datos.'}</p>
                  )}

                  <div className="form-actions">
                    <button className="btn btn-primary" onClick={() => { setSelectedUser(null); setUserDetail(null); }}>Cerrar detalle</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Download & Referral analytics */}
          {activeTab === 'downloads' && (
            <div className="downloads-tab-content animate-slide-up">
              <div className="downloads-dashboard-row">
                
                {/* Referrers summary cards */}
                <div className="card glass">
                  <h3>Estadísticas por Enlace (Referidos)</h3>
                  <p className="card-sub">Conteo consolidado de descargas provenientes de links compartidos.</p>

                  <div className="referrals-list-wrapper" style={{ marginTop: 15 }}>
                    {referrals.length > 0 ? (
                      referrals.map(ref => (
                        <div key={ref.id} className="referral-summary-item">
                          <div className="referral-item-info">
                            <Tag size={16} className="referral-tag-icon" />
                            <div className="referral-text-details">
                              <strong>{ref.id === 'directo' ? 'Acceso Directo (Landing)' : `Campaña: ${ref.id}`}</strong>
                              <span className="mono-text">?ref={ref.id}</span>
                            </div>
                          </div>
                          <div className="referral-item-count">
                            <span className="downloads-count-text">{ref.clicksCount || 0}</span>
                            <span className="downloads-label">clics</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="no-logs">Aún no se ha trackeado ninguna descarga.</p>
                    )}
                  </div>
                </div>

                {/* detailed logs list */}
                <div className="card glass">
                  <h3>Historial Detallado de Instalaciones</h3>
                  <p className="card-sub">Dirección de User Agents y plataformas del navegador origen.</p>
                  
                  <div className="detailed-logs-list" style={{ marginTop: 15 }}>
                    {downloadLogs.length > 0 ? (
                      downloadLogs.map(log => (
                        <div key={log.id} className="detailed-log-box">
                          <div className="log-header-info">
                            <span className="referrer-tag">?ref={log.referrer}</span>
                            <span className="log-time">
                              {log.timestamp.toLocaleDateString()} {log.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <div className="log-useragent">
                            <Smartphone size={12} style={{ marginRight: 6 }} />
                            <span>{log.userAgent}</span>
                          </div>
                          <div className="log-specs">
                            <span>Plataforma: <strong>{log.platform}</strong></span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="no-logs">Sin logs históricos.</p>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Tab 4: Config - APK Control (Mandatory updates management) */}
          {activeTab === 'config' && (
            <div className="config-tab-content animate-slide-up">
              <div className="card glass max-w-xl">
                <div className="card-header">
                  <RefreshCw size={24} color="#00E5FF" />
                  <div>
                    <h3>Configuración de Actualización Obligatoria (OTA/APK)</h3>
                    <p>Fuerza a los usuarios de APK antiguas a actualizar a la versión más estable.</p>
                  </div>
                </div>

                <form onSubmit={handleSaveConfig} className="admin-config-form">
                  <div className="form-group">
                    <label htmlFor="latest_version">Última Versión Estable del APK:</label>
                    <input 
                      type="text" 
                      id="latest_version"
                      value={appConfig.latest_version || ''} 
                      onChange={(e) => setAppConfig({...appConfig, latest_version: e.target.value})}
                      placeholder="Ej: 1.1.0"
                      required
                    />
                    <small className="help-text">El celular comparará su versión instalada contra este número (Semantic Versioning).</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="download_url">URL de Descarga del APK:</label>
                    <input 
                      type="url" 
                      id="download_url"
                      value={appConfig.download_url || ''} 
                      onChange={(e) => setAppConfig({...appConfig, download_url: e.target.value})}
                      placeholder="https://tinnitusoff.web.app/downloads/tinnitusoff-v1.1.0.apk"
                      required
                    />
                    <small className="help-text">El link seguro (HTTPS) de tu almacenamiento en la nube (CDN) de confianza.</small>
                  </div>

                  <div className="form-group checkbox-group">
                    <input 
                      type="checkbox" 
                      id="force_update"
                      checked={appConfig.force_update || false}
                      onChange={(e) => setAppConfig({...appConfig, force_update: e.target.checked})}
                    />
                    <label htmlFor="force_update"><strong>Forzar Actualización Obligatoria:</strong></label>
                  </div>
                  <p className="checkbox-explanation">
                    Si está activado, la aplicación en el celular bloqueará el acceso al usuario hasta que descargue el nuevo APK. Si está desactivado, el usuario podrá ignorar el aviso.
                  </p>

                  <div className="form-actions">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={savingConfig}
                    >
                      {savingConfig ? 'Guardando...' : 'Aplicar Cambios en la Nube'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Tab 5: Mobile App Info (real data from backend) */}
          {activeTab === 'info' && (
            <div className="info-tab-content animate-slide-up">
              <div className="card glass">
                <div className="card-header">
                  <Smartphone size={24} color="#00E5FF" />
                  <div>
                    <h3>Información de la App Móvil</h3>
                    <p>Datos en vivo desde el backend de TinnitOff ({getBaseUrl() || 'sin backend'}).</p>
                  </div>
                </div>

                {/* Backend status */}
                <div className="backend-status-row">
                  <span className={`status-dot ${backendOnline ? 'online' : 'offline'}`}></span>
                  <span>
                    Backend: <strong>{backendOnline ? 'En línea' : 'Fuera de línea'}</strong>
                    {backendOnline && appRelease ? ' — último release encontrado' : ''}
                    {backendOnline && !appRelease ? ' — sin releases registrados' : ''}
                  </span>
                </div>

                {/* Real release info from backend */}
                {appRelease ? (
                  <div className="app-info-grid" style={{ marginTop: 18 }}>
                    <div className="app-info-item">
                      <span className="item-label">Versión Publicada:</span>
                      <span className="mono-text">{appRelease.version}</span>
                    </div>
                    <div className="app-info-item">
                      <span className="item-label">Build Code:</span>
                      <span className="mono-text">{appRelease.buildCode}</span>
                    </div>
                    <div className="app-info-item">
                      <span className="item-label">Actualización Forzada:</span>
                      <span className={appRelease.forceUpdate ? 'text-danger' : 'text-success'}>
                        <strong>{appRelease.forceUpdate ? 'SÍ (Obligatoria)' : 'NO (Opcional)'}</strong>
                      </span>
                    </div>
                    <div className="app-info-item">
                      <span className="item-label">Archivo APK:</span>
                      <span className="mono-text">{appRelease.apkFilename || 'N/A'}</span>
                    </div>
                    <div className="app-info-item">
                      <span className="item-label">Tamaño:</span>
                      <span className="mono-text">{appRelease.fileSizeMb ? `${appRelease.fileSizeMb} MB` : 'N/A'}</span>
                    </div>
                    <div className="app-info-item">
                      <span className="item-label">Publicado el:</span>
                      <span className="mono-text">
                        {appRelease.createdAt ? new Date(appRelease.createdAt).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <div className="app-info-item" style={{ gridColumn: '1 / -1' }}>
                      <span className="item-label">SHA-256:</span>
                      <span className="mono-text">{appRelease.sha256Hash || 'N/A'}</span>
                    </div>
                    <div className="app-info-item" style={{ gridColumn: '1 / -1' }}>
                      <span className="item-label">Changelog:</span>
                      <span style={{ whiteSpace: 'pre-wrap' }}>{appRelease.changelog || 'Sin notas.'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="no-data-placeholder" style={{ marginTop: 18 }}>
                    <AlertTriangle size={24} />
                    <p>{releaseError || 'No hay releases registrados en el backend.'}</p>
                  </div>
                )}

                {/* Static identity (build-time constants) */}
                <div className="app-permissions-box" style={{ marginTop: 24 }}>
                  <h4>Identidad de la App (build-time)</h4>
                  <div className="app-info-grid">
                    <div className="app-info-item">
                      <span className="item-label">Nombre:</span>
                      <span className="mono-text">{APP_INFO.appName}</span>
                    </div>
                    <div className="app-info-item">
                      <span className="item-label">App ID:</span>
                      <span className="mono-text">{APP_INFO.appId}</span>
                    </div>
                    <div className="app-info-item">
                      <span className="item-label">Plataforma:</span>
                      <span className="mono-text">{APP_INFO.platform}</span>
                    </div>
                    <div className="app-info-item">
                      <span className="item-label">Proyecto Firebase:</span>
                      <span className="mono-text">{APP_INFO.firebaseProject || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="app-permissions-box" style={{ marginTop: 20 }}>
                  <h4>Permisos Solicitados (AndroidManifest.xml)</h4>
                  <div className="permissions-tags">
                    {APP_INFO.permissions.map(perm => (
                      <span key={perm} className="permission-tag">{perm}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: Gestión de Contenido (motor de contenido del backend) */}
          {activeTab === 'content' && (
            <div className="content-tab-content animate-slide-up">
              <div className="card glass">
                <div className="card-header">
                  <BookOpen size={24} color="#00E5FF" />
                  <div>
                    <h3>Gestión de Contenido</h3>
                    <p>Crea consejos, artículos, FAQ o mensajes que se mostrarán en la app (sección "Aprende").</p>
                  </div>
                </div>

                <div className="content-actions">
                  <button className="btn btn-primary" onClick={() => startEditContent(null)}>+ Nuevo contenido</button>
                </div>

                {editingContent && (
                  <form onSubmit={saveContent} className="admin-config-form content-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Tipo</label>
                        <select value={contentForm.type} onChange={(e) => setContentForm({ ...contentForm, type: e.target.value })}>
                          <option value="TIP">Consejo (TIP)</option>
                          <option value="ARTICLE">Artículo</option>
                          <option value="FAQ">Pregunta frecuente</option>
                          <option value="MESSAGE">Mensaje</option>
                          <option value="EXERCISE">Ejercicio</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Idioma</label>
                        <input value={contentForm.language} onChange={(e) => setContentForm({ ...contentForm, language: e.target.value })} placeholder="es" />
                      </div>
                      <div className="form-group">
                        <label>Estado</label>
                        <select value={contentForm.status} onChange={(e) => setContentForm({ ...contentForm, status: e.target.value })}>
                          <option value="PUBLISHED">Publicado</option>
                          <option value="DRAFT">Borrador</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Título</label>
                      <input value={contentForm.title} onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })} required />
                    </div>

                    <div className="form-group">
                      <label>Resumen (opcional)</label>
                      <input value={contentForm.summary} onChange={(e) => setContentForm({ ...contentForm, summary: e.target.value })} />
                    </div>

                    <div className="form-group">
                      <label>Cuerpo (HTML permitido)</label>
                      <textarea rows={6} value={contentForm.body} onChange={(e) => setContentForm({ ...contentForm, body: e.target.value })} required />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Imagen (URL, opcional)</label>
                        <input value={contentForm.imageUrl} onChange={(e) => setContentForm({ ...contentForm, imageUrl: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>URL de acción (opcional)</label>
                        <input value={contentForm.actionUrl} onChange={(e) => setContentForm({ ...contentForm, actionUrl: e.target.value })} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Etiquetas (separadas por coma)</label>
                      <input value={contentForm.tags} onChange={(e) => setContentForm({ ...contentForm, tags: e.target.value })} />
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary" disabled={savingContent}>{savingContent ? 'Guardando...' : 'Guardar'}</button>
                      <button type="button" className="btn" onClick={() => setEditingContent(null)}>Cancelar</button>
                    </div>
                  </form>
                )}

                <div className="content-list" style={{ marginTop: 16 }}>
                  {contentLoading ? (
                    <div className="spinner" />
                  ) : contentItems.length === 0 ? (
                    <p className="no-logs">No hay contenido. Crea el primero con "Nuevo contenido".</p>
                  ) : (
                    contentItems.map((c) => (
                      <div key={c.id} className="content-item-row">
                        <div className="content-item-main">
                          <span className={`content-type-badge type-${c.type}`}>{c.type}</span>
                          <strong>{c.title}</strong>
                          <span className={`content-status ${c.status === 'PUBLISHED' ? 'pub' : 'draft'}`}>{c.status}</span>
                        </div>
                        <div className="content-item-actions">
                          <button className="btn btn-small" onClick={() => startEditContent(c)}>Editar</button>
                          <button className="btn btn-small btn-danger" onClick={() => deleteContent(c.id)}>Eliminar</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
