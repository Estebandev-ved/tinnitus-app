import React, { useEffect, useMemo, useState } from 'react';
import { HelpCircle, Lightbulb, FileText, MessageSquare, PersonStanding } from 'lucide-react';
import { contentService, CONTENT_TYPES, CONTENT_STATUSES, CONTENT_TYPE_META } from '../../api/contentService';

const EMPTY = {
  type: 'FAQ',
  title: '',
  summary: '',
  body: '',
  status: 'DRAFT',
  language: 'es',
  tags: '',
  imageUrl: '',
  actionUrl: '',
  sortOrder: 0,
};

function fmtDate(v) {
  if (!v) return '—';
  const d = new Date(v);
  return isNaN(d) ? '—' : d.toLocaleString();
}

function PhonePreview({ item }) {
  const meta = CONTENT_TYPE_META[item.type] || { label: item.type };
  const isPublished = item.status === 'PUBLISHED';
  return (
    <div className="phone-mock">
      <div className="phone-notch" />
      <div className="phone-screen">
        <div className="phone-statusbar">
          <span className={`pill ${isPublished ? 'pill-on' : 'pill-off'}`}>
            {isPublished ? 'Publicado' : 'Borrador'}
          </span>
          <span className="phone-lang">{item.language ? item.language.toUpperCase() : 'ES'}</span>
        </div>
        <p className="phone-app-name">Tinnitoff · Contenido</p>

        {item.type === 'FAQ' && (
          <div className="app-card app-faq">
            <div className="app-faq-q"><span className="app-ico"><HelpCircle size={16} /></span> {item.title || 'Pregunta…'}</div>
            <p className="app-faq-a">{item.body || 'La respuesta aparecerá aquí.'}</p>
          </div>
        )}

        {item.type === 'TIP' && (
          <div className="app-card app-tip">
            <div className="app-tip-head"><span className="app-ico"><Lightbulb size={16} /></span> {item.title || 'Consejo…'}</div>
            <p>{item.body || item.summary || 'Texto del consejo.'}</p>
          </div>
        )}

        {item.type === 'ARTICLE' && (
          <div className="app-card app-article">
            {item.imageUrl ? (
              <div className="app-article-img" style={{ backgroundImage: `url(${item.imageUrl})` }} />
            ) : (
              <div className="app-article-img app-article-img--empty"><FileText size={32} /></div>
            )}
            <h4>{item.title || 'Título del artículo'}</h4>
            <p className="muted">{item.summary || 'Resumen del artículo…'}</p>
            {item.actionUrl && <span className="app-link">Leer más →</span>}
          </div>
        )}

        {item.type === 'MESSAGE' && (
          <div className="app-msg">
            <div className="app-msg-bubble">
              <strong>{item.title || 'Mensaje'}</strong>
              <p>{item.body || item.summary || 'Contenido del mensaje…'}</p>
            </div>
          </div>
        )}

        {item.type === 'EXERCISE' && (
          <div className="app-card app-exercise">
            <div className="app-ex-head"><span className="app-ico"><PersonStanding size={16} /></span> {item.title || 'Ejercicio'}</div>
            <p>{item.body || 'Instrucciones del ejercicio…'}</p>
            {item.actionUrl && <button className="app-btn" type="button">Iniciar ejercicio</button>}
          </div>
        )}

        {item.tags && (
          <div className="phone-tags">
            {item.tags.split(',').map((t) => t.trim()).filter(Boolean).map((t, i) => (
              <span key={i} className="phone-tag">#{t}</span>
            ))}
          </div>
        )}
        <p className="phone-foot muted">Vista previa en vivo · tipo {meta.label}</p>
      </div>
    </div>
  );
}

export default function ContentPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [query, setQuery] = useState('');

  const load = () => {
    setLoading(true);
    contentService.listAdmin()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      if (filterType && it.type !== filterType) return false;
      if (filterStatus && it.status !== filterStatus) return false;
      if (!q) return true;
      return (it.title || '').toLowerCase().includes(q) || (it.summary || '').toLowerCase().includes(q);
    });
  }, [items, filterType, filterStatus, query]);

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (success) setSuccess(null);
  };

  const startNew = () => {
    setEditingId(null);
    setForm(EMPTY);
    setError(null);
    setSuccess(null);
  };

  const startEdit = (it) => {
    setEditingId(it.id);
    setForm({
      type: it.type,
      title: it.title || '',
      summary: it.summary || '',
      body: it.body || '',
      status: it.status,
      language: it.language || 'es',
      tags: it.tags || '',
      imageUrl: it.imageUrl || '',
      actionUrl: it.actionUrl || '',
      sortOrder: it.sortOrder || 0,
    });
    setError(null);
    setSuccess(null);
  };

  const save = async () => {
    const e = {};
    if (!form.title.trim()) e.title = 'El título es obligatorio';
    setFormErrors(e);
    if (Object.keys(e).length > 0) return;
    setSaving(true);
    setError(null);
    const payload = { ...form, sortOrder: Number(form.sortOrder) || 0 };
    try {
      if (editingId) {
        await contentService.update(editingId, payload);
        setSuccess('Contenido actualizado.');
      } else {
        await contentService.create(payload);
        setSuccess('Contenido creado.');
      }
      setEditingId(null);
      setForm(EMPTY);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('¿Eliminar este contenido?')) return;
    try {
      await contentService.remove(id);
      if (editingId === id) { setEditingId(null); setForm(EMPTY); }
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="dashboard">
      <header className="dash-head">
        <div>
          <h1>Gestión de contenido</h1>
          <p className="muted">Crea y previsualiza el contenido que verán los usuarios en la app.</p>
        </div>
        <div className="head-actions">
          <button className="btn btn-primary" onClick={startNew}>Nuevo contenido</button>
        </div>
      </header>

      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-ok">{success}</div>}

      <div className="filters">
        <input className="input" placeholder="Buscar por título…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className="input" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">Todos los tipos</option>
          {CONTENT_TYPES.map((t) => <option key={t} value={t}>{CONTENT_TYPE_META[t].label}</option>)}
        </select>
        <select className="input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Todos los estados</option>
          {CONTENT_STATUSES.map((s) => <option key={s} value={s}>{s === 'PUBLISHED' ? 'Publicado' : 'Borrador'}</option>)}
        </select>
      </div>

      <div className="content-layout">
        <section className="panel content-editor">
          <h3>{editingId ? `Editando #${editingId}` : 'Nuevo contenido'}</h3>
          <div className="form-grid">
            <label className="full">
              Tipo
              <select className="input" value={form.type} onChange={(e) => update('type', e.target.value)}>
                {CONTENT_TYPES.map((t) => <option key={t} value={t}>{CONTENT_TYPE_META[t].label}</option>)}
              </select>
            </label>
            <label className="full">
              Título *
              <input className={`input ${formErrors.title ? 'error' : ''}`} value={form.title} onChange={(e) => { update('title', e.target.value); setFormErrors((p) => ({ ...p, title: null })); }} placeholder="Título corto y claro" />
              {formErrors.title && <span className="field-error">{formErrors.title}</span>}
            </label>
            <label className="full">
              Resumen
              <input className="input" value={form.summary} onChange={(e) => update('summary', e.target.value)} placeholder="Resumen (para tarjetas y listados)" />
            </label>
            <label className="full">
              Cuerpo
              <textarea className="input" rows={5} value={form.body} onChange={(e) => update('body', e.target.value)} placeholder="Texto completo del contenido" />
            </label>
            <label>
              Estado
              <select className="input" value={form.status} onChange={(e) => update('status', e.target.value)}>
                <option value="DRAFT">Borrador</option>
                <option value="PUBLISHED">Publicado</option>
              </select>
            </label>
            <label>
              Idioma
              <select className="input" value={form.language} onChange={(e) => update('language', e.target.value)}>
                <option value="es">Español (es)</option>
                <option value="en">Inglés (en)</option>
              </select>
            </label>
            <label>
              Orden
              <input className="input" type="number" value={form.sortOrder} onChange={(e) => update('sortOrder', e.target.value)} />
            </label>
            <label className="full">
              Etiquetas (separadas por coma)
              <input className="input" value={form.tags} onChange={(e) => update('tags', e.target.value)} placeholder="general, habituacion" />
            </label>
            <label className="full">
              URL de imagen (artículos)
              <input className="input" value={form.imageUrl} onChange={(e) => update('imageUrl', e.target.value)} placeholder="https://…" />
            </label>
            <label className="full">
              URL de acción (enlace / ejercicio)
              <input className="input" value={form.actionUrl} onChange={(e) => update('actionUrl', e.target.value)} placeholder="https://… o ruta interna" />
            </label>
          </div>
          <div className="editor-actions">
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Guardando…' : editingId ? 'Actualizar' : 'Crear'}
            </button>
            {editingId && <button className="btn btn-ghost" onClick={startNew}>Cancelar</button>}
          </div>
        </section>

        <section className="content-preview">
          <h3 className="preview-title">Vista previa inteligente</h3>
          <PhonePreview item={form} />
        </section>
      </div>

      <div className="dash-section">
        <h2>{filtered.length} elemento(s)</h2>
        {loading ? (
          <p className="muted">Cargando…</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Tipo</th><th>Título</th><th>Estado</th><th>Idioma</th><th>Orden</th><th>Actualizado</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map((it) => (
                  <tr key={it.id}>
                    <td>{it.id}</td>
                    <td>{CONTENT_TYPE_META[it.type]?.label || it.type}</td>
                    <td>{it.title}</td>
                    <td>{it.status === 'PUBLISHED' ? <span className="badge">Publicado</span> : <span className="pill">Borrador</span>}</td>
                    <td>{it.language}</td>
                    <td>{it.sortOrder}</td>
                    <td>{fmtDate(it.updatedAt)}</td>
                    <td className="row-actions">
                      <button className="btn btn-small" onClick={() => startEdit(it)}>Editar</button>
                      <button className="btn btn-small btn-danger" onClick={() => remove(it.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan="8" className="muted center">Sin contenido todavía.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
