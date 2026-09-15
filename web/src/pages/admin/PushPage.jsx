import React, { useState, useEffect } from 'react';
import { adminService } from '../../api/adminService';

const SEGMENTS = [
  { value: 'all', label: 'Todos los usuarios', description: 'Envía a todos los dispositivos suscritos.' },
  { value: 'high_risk', label: 'Riesgo alto', description: 'Usuarios con predicción de riesgo "high" en los últimos 30 días.' },
  { value: 'severe_thi', label: 'THI severo', description: 'Usuarios con último THI ≥78 (Severo) en los últimos 90 días.' },
  { value: 'no_activity', label: 'Sin actividad', description: 'Usuarios sin telemetría en 30+ días o registrados hace 14+ días sin uso.' },
];

export default function PushPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [segment, setSegment] = useState('all');
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setPreview(null);
    adminService.getPushPreview(segment)
      .then(setPreview)
      .catch(() => setPreview(null));
  }, [segment]);

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = 'El título es obligatorio';
    if (!body.trim()) e.body = 'El mensaje es obligatorio';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const send = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await adminService.sendPush({ title, body, segment });
      setResult({
        ok: !!res.ok,
        text: res.message || (res.messageId ? `Enviado a topic "${res.segment}" (${res.recipientCount} destinatarios potenciales)` : 'Enviado'),
      });
    } catch (err) {
      setResult({ ok: false, text: 'Error: ' + (err?.message || 'desconocido') });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="dashboard">
      <header className="dash-head">
        <div>
          <h1>Notificaciones push</h1>
          <p className="muted">Envía mensajes FCM segmentados a pacientes de la app móvil.</p>
        </div>
      </header>

      {result && (
        <div className={result.ok ? 'alert-info' : 'alert-error'}>{result.text}</div>
      )}

      <form className="export-card" style={{ maxWidth: 640 }} onSubmit={send}>
        <label className="field">
          <span>Segmento destino</span>
          <select className="input" value={segment} onChange={(e) => setSegment(e.target.value)}>
            {SEGMENTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <small className="muted">{SEGMENTS.find((s) => s.value === segment)?.description}</small>
        </label>

        {preview && (
          <div className="segment-preview">
            <strong>{preview.count}</strong> usuario(s) coinciden
            {preview.userIds.length > 0 && (
              <span className="muted"> · IDs: {preview.userIds.join(', ')}</span>
            )}
          </div>
        )}

        <label className="field">
          <span>Título</span>
          <input className={`input ${errors.title ? 'error' : ''}`} value={title} onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: null })); }} placeholder="Consejo de hoy" />
          {errors.title && <span className="field-error">{errors.title}</span>}
        </label>
        <label className="field">
          <span>Mensaje</span>
          <textarea className={`input ${errors.body ? 'error' : ''}`} rows={4} value={body} onChange={(e) => { setBody(e.target.value); setErrors((p) => ({ ...p, body: null })); }} placeholder="Recuerda completar tu evaluación THI semanal." />
          {errors.body && <span className="field-error">{errors.body}</span>}
        </label>
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? 'Enviando…' : 'Enviar notificación'}
        </button>
      </form>

      <div className="dash-section">
        <h2>Segmentos</h2>
        <p className="muted">
          Cada segmento se envía a un topic de FCM diferente (<code>segment:&lt;nombre&gt;</code>).
          La app móvil debe suscribirse al topic que le corresponda según el perfil del usuario.
          Los destinatarios potenciales se calculan en tiempo real.
        </p>
      </div>
    </div>
  );
}
