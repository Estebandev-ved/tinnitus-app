import React, { useEffect, useState } from 'react';
import { adminService } from '../../api/adminService';
import { Donut } from '../../components/Charts';

function fmtDate(v) {
  if (!v) return '—';
  const d = new Date(v);
  return isNaN(d) ? '—' : d.toLocaleString();
}

export default function DescargasAdmin() {
  const [releases, setReleases] = useState([]);
  const [byPlatform, setByPlatform] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ version: '', buildCode: '', changelog: '', forceUpdate: 'false' });
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState(null);

  const load = () => {
    Promise.all([adminService.getReleases(), adminService.getDownloadsByPlatform()])
      .then(([r, p]) => { setReleases(r); setByPlatform(p); })
      .catch((e) => setError(e.message));
  };

  useEffect(load, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMsg(null);
    if (!form.version || !form.buildCode || !file) {
      setError('Versión, build y archivo APK son obligatorios.');
      return;
    }
    setBusy(true);
    const fd = new FormData();
    fd.append('version', form.version);
    fd.append('buildCode', String(Number(form.buildCode)));
    fd.append('changelog', form.changelog);
    fd.append('forceUpdate', form.forceUpdate);
    fd.append('apkFile', file);
    fd.append('apkFilename', file.name);
    try {
      await adminService.uploadRelease(fd);
      setMsg('Versión subida correctamente.');
      setForm({ version: '', buildCode: '', changelog: '', forceUpdate: 'false' });
      setFile(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="dashboard">
      <header className="dash-head">
        <div>
          <h1>Descargas</h1>
          <p className="muted">Versiones publicadas y estadísticas de descarga.</p>
        </div>
      </header>

      {error && <div className="alert-error">{error}</div>}
      {msg && <div className="alert-ok">{msg}</div>}

      <div className="charts-row">
        <Donut data={byPlatform} title="Descargas por plataforma" />
      </div>

      <div className="dash-section">
        <h2>Versiones publicadas</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Versión</th><th>Build</th><th>Actualización forzosa</th><th>Notas</th><th>Archivo</th><th>Fecha</th></tr>
            </thead>
            <tbody>
              {releases.map((r) => (
                <tr key={r.id}>
                  <td>{r.version}</td>
                  <td>{r.buildCode}</td>
                  <td>{r.forceUpdate ? 'Sí' : 'No'}</td>
                  <td className="wrap">{r.changelog || '—'}</td>
                  <td>{r.apkFilename || '—'}</td>
                  <td>{fmtDate(r.releaseDate || r.createdAt)}</td>
                </tr>
              ))}
              {releases.length === 0 && (
                <tr><td colSpan="6" className="muted center">Sin versiones.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dash-section">
        <h2>Publicar nueva versión</h2>
        <form className="upload-form" onSubmit={onSubmit}>
          <div className="form-grid">
            <label>Versión *
              <input className="input" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} placeholder="1.2.0" />
            </label>
            <label>Build *
              <input className="input" type="number" value={form.buildCode} onChange={(e) => setForm({ ...form, buildCode: e.target.value })} placeholder="12" />
            </label>
            <label>Actualización forzosa
              <select className="input" value={form.forceUpdate} onChange={(e) => setForm({ ...form, forceUpdate: e.target.value })}>
                <option value="false">No</option>
                <option value="true">Sí</option>
              </select>
            </label>
            <label>Archivo APK *
              <input className="input" type="file" accept=".apk" onChange={(e) => setFile(e.target.files[0])} />
            </label>
          </div>
          <label className="full">Notas de la versión
            <textarea className="input" rows="3" value={form.changelog} onChange={(e) => setForm({ ...form, changelog: e.target.value })} />
          </label>
          <button className="btn" type="submit" disabled={busy}>{busy ? 'Subiendo…' : 'Subir versión'}</button>
        </form>
      </div>
    </div>
  );
}
