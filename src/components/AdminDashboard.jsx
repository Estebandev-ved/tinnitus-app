import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, limit, doc, setDoc } from 'firebase/firestore';
import { 
  Users, Smartphone, Download, RefreshCw, ChevronLeft, Shield, BarChart3, 
  Activity, Calendar, Tag, Trash2, Cpu, HardDrive, CheckCircle, AlertTriangle 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';
import './AdminDashboard.css';

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
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'downloads' | 'config'

  // Update configuration state
  const [appConfig, setAppConfig] = useState({
    latest_version: '1.0.0',
    download_url: '',
    force_update: false
  });
  const [savingConfig, setSavingConfig] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Users & Telemetry
      const usersSnap = await getDocs(collection(db, 'users'));
      const fetchedUsers = [];
      let totalDevices = 0;
      let androidCount = 0;
      let webCount = 0;

      for (const userDoc of usersSnap.docs) {
        const userData = userDoc.data();
        // Fetch devices subcollection for each user
        const devicesSnap = await getDocs(collection(db, 'users', userDoc.id, 'devices'));
        const devices = [];
        devicesSnap.forEach(d => {
          const dData = d.data();
          devices.push({ id: d.id, ...dData });
          totalDevices++;
          if (dData.platform === 'android') androidCount++;
          else webCount++;
        });

        fetchedUsers.push({
          id: userDoc.id,
          ...userData,
          devices
        });
      }
      setUsers(fetchedUsers);

      // 2. Fetch Downloads Analytics (Clicks per referral code)
      const refSnap = await getDocs(collection(db, 'download_analytics'));
      const fetchedRefs = refSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setReferrals(fetchedRefs);

      // 3. Fetch Downloads detailed logs
      const logsSnap = await getDocs(query(collection(db, 'download_logs'), orderBy('timestamp', 'desc'), limit(50)));
      const fetchedLogs = logsSnap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        timestamp: d.data().timestamp?.toDate() || new Date()
      }));
      setDownloadLogs(fetchedLogs);

      // 4. Fetch App Configuration (Update Control)
      const configSnap = await getDocs(collection(db, 'app_config'));
      let configData = { latest_version: '1.0.0', download_url: '', force_update: false };
      configSnap.forEach(docSnap => {
        if (docSnap.id === 'metadata') {
          configData = docSnap.data();
        }
      });
      setAppConfig(configData);

      // Calculate aggregated stats
      const totalClicks = fetchedRefs.reduce((acc, curr) => acc + (curr.clicksCount || 0), 0);

      setStats({
        totalUsers: fetchedUsers.length,
        totalDownloads: totalClicks,
        androidUsers: androidCount,
        webUsers: webCount,
        activeDevices: totalDevices
      });

    } catch (error) {
      console.error("Error fetching admin dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

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
          <button className="refresh-btn" onClick={fetchAdminData} aria-label="Refresh data">
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
              </div>
            </div>
          )}

          {/* Tab 2: Users List & Devices Telemetry */}
          {activeTab === 'users' && (
            <div className="users-tab-content animate-slide-up">
              <div className="users-list-header">
                <h3>Lista de Usuarios y Dispositivos</h3>
                <p>Revisa qué hardware usan los usuarios finales para afinar los audios y resolver bugs.</p>
              </div>

              <div className="users-list-wrapper">
                {users.length > 0 ? (
                  users.map((u) => (
                    <div key={u.id} className="user-admin-card glass animate-fade">
                      <div className="user-card-header">
                        <div className="user-card-profile">
                          <div className="avatar-small">
                            {u.photoURL ? (
                              <img src={u.photoURL} alt={u.displayName || 'User'} />
                            ) : (
                              (u.displayName || 'U').charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="user-card-credentials">
                            <h4>{u.displayName || 'Usuario de TinnitOff'}</h4>
                            <span className="user-card-email">{u.email || 'Sin correo electrónico'}</span>
                          </div>
                        </div>
                        
                        <span className={`badge ${u.role === 'admin' ? 'admin' : 'user'}`}>
                          {u.role === 'admin' ? 'Administrador' : 'Usuario'}
                        </span>
                      </div>

                      <div className="user-card-body">
                        <div className="user-body-item">
                          <span className="item-label">ID de Usuario:</span>
                          <span className="mono-text user-id-badge">{u.id}</span>
                        </div>

                        <div className="user-body-telemetry">
                          <h5>Dispositivos Registrados (Telemetría)</h5>
                          {u.devices && u.devices.length > 0 ? (
                            <div className="user-devices-list">
                              {u.devices.map(dev => (
                                <div key={dev.id} className="user-device-item">
                                  <Smartphone size={14} className="device-icon-blue" />
                                  <div className="device-details-text">
                                    <strong>{dev.manufacturer} {dev.model}</strong>
                                    <span>{dev.operatingSystem} {dev.osVersion} {dev.isVirtual ? ' (Emulador)' : ''}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="no-devices">Sin telemetría de dispositivo registrada todavía</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-users-box">No hay usuarios registrados.</div>
                )}
              </div>
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

        </div>
      </main>
    </div>
  );
}
