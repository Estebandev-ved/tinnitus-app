import React, { useState } from 'react';
import { getToken, getBaseUrl } from '../../api/apiClient';

const DATASETS = [
  {
    key: 'thi',
    title: 'Evaluaciones THI',
    description: 'Resultados de Tinnitus Handicap Inventory (total, grado, subescalas).',
    path: '/api/v1/admin/export/research/thi',
    filename: 'thi_research',
  },
  {
    key: 'audiometry',
    title: 'Audiometrías',
    description: 'Mediciones de audición (frecuencia, volumen, oído).',
    path: '/api/v1/admin/export/research/audiometry',
    filename: 'audiometry_research',
  },
];

export default function ExportPage() {
  const [busy, setBusy] = useState(null);
  const [msg, setMsg] = useState('');

  const download = async (ds, format) => {
    setBusy(`${ds.key}-${format}`);
    setMsg('');
    try {
      const token = getToken();
      const res = await fetch(`${getBaseUrl()}${ds.path}?format=${format}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Error ' + res.status);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${ds.filename}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMsg(`Descarga de ${ds.title} (${format.toUpperCase()}) lista.`);
    } catch (e) {
      setMsg('No se pudo descargar: ' + e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="dashboard">
      <header className="dash-head">
        <div>
          <h1>Exportación para investigación</h1>
          <p className="muted">Datos clínicos anonimizados (seudónimo P00001). Sin nombre ni email.</p>
        </div>
      </header>

      {msg && <div className="alert-info">{msg}</div>}

      <div className="export-grid">
        {DATASETS.map((ds) => (
          <div className="export-card" key={ds.key}>
            <h2>{ds.title}</h2>
            <p className="muted">{ds.description}</p>
            <div className="export-actions">
              <button
                className="btn btn-primary"
                disabled={busy !== null}
                onClick={() => download(ds, 'csv')}
              >
                {busy === `${ds.key}-csv` ? 'Generando…' : 'Descargar CSV'}
              </button>
              <button
                className="btn"
                disabled={busy !== null}
                onClick={() => download(ds, 'json')}
              >
                {busy === `${ds.key}-json` ? 'Generando…' : 'Descargar JSON'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-section">
        <h2>Notas de privacidad</h2>
        <p className="muted">
          Los registros se exportan bajo un identificador de investigación pseudonimizado
          (P + ID de usuario con padding). No se incluyen nombre, correo ni identificadores de
          dispositivo. Cumple el principio de minimización de datos para uso en estudios clínicos.
        </p>
      </div>
    </div>
  );
}
