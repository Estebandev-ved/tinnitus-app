import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Download, Smartphone, Store, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { releaseService } from '../api/releaseService';

function AppleBadge() {
  return (
    <span className="store-badge" aria-label="Próximamente en App Store">
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path fill="currentColor" d="M16.4 12.7c0-2 1.6-3 1.7-3.1-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7-1.3 0-2.6.8-3.2 2-1.4 2.4-.4 6 1 8 .6 1 1.4 2.1 2.4 2 1-.1 1.3-.6 2.5-.6s1.5.6 2.5.6 1.7-1 2.3-2c.7-1.1 1-2.2 1-2.2s-1.7-.7-1.7-2.9zM14.3 6.3c.5-.7.9-1.6.8-2.5-.8 0-1.7.5-2.3 1.2-.5.6-.9 1.5-.8 2.4.9.1 1.8-.4 2.3-1.1z" />
      </svg>
      <span className="store-badge-text">
        <small>Descárgala en</small>
        <strong>App Store</strong>
      </span>
    </span>
  );
}

function PlayBadge() {
  return (
    <span className="store-badge" aria-label="Próximamente en Google Play">
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path fill="currentColor" d="M3.6 2.3c-.3.3-.5.8-.5 1.4v16.6c0 .6.2 1.1.5 1.4l9-9.3-9-9.5zm13.5 6.1L5.7 3.4l9 9.3 2.6-2.3-1.8-1.6zm0 9.2-2.6-2.3 1.8-1.6 2.6 2.3-2.8 1.2zm2.3-8.5-2.8-2.5L20.4 12l-1 3.6 1.5-1.3c.5-.5.5-1.4 0-1.9l-1.1-1zM5.7 20.6l9-9.3 2.8 2.5-9.1 6.8c-.6.4-1.1.4-1.5.0z" />
      </svg>
      <span className="store-badge-text">
        <small>Disponible en</small>
        <strong>Google Play</strong>
      </span>
    </span>
  );
}

export default function Descargas() {
  const [release, setRelease] = useState(null);
  const [loading, setLoading] = useState(true);
  const reduce = useReducedMotion();

  useEffect(() => {
    releaseService.getLatest()
      .then(setRelease)
      .catch(() => setRelease(null))
      .finally(() => setLoading(false));
  }, []);

  const apkUrl = release
    ? `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'}/api/v1/app/releases/download/${release.version}.apk`
    : null;

  const qrValue = apkUrl || (typeof window !== 'undefined' ? window.location.origin + '/descargas' : 'https://tinnitoff.com');

  return (
    <section className="section">
      <div className="container narrow">
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1>Descargas</h1>
          <p className="section-lead">
            Obtén Tinnitoff para tu dispositivo. Los datos de versión se cargan desde
            nuestro backend para garantizar que siempre descargues la versión oficial.
          </p>
        </motion.div>

        {loading && <p>Cargando última versión…</p>}

        {!loading && release && (
          <motion.div
            className="download-card"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="download-meta">
              <span className="badge">v{release.version}</span>
              {release.releaseNotes && <p>{release.releaseNotes}</p>}
              {release.createdAt && (
                <small>Publicado: {new Date(release.createdAt).toLocaleDateString()}</small>
              )}
            </div>
            <a href={apkUrl} className="btn btn-primary" download>
              <Download size={18} style={{ marginRight: 6 }} /> Descargar APK
            </a>
          </motion.div>
        )}

        {!loading && !release && (
          <motion.div
            className="download-card"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p>No se pudo obtener la versión desde el servidor. Asegúrate de que el backend esté corriendo.</p>
            <a href="/api/v1/app/releases/download/1.0.0.apk" className="btn btn-primary" download>
              <Download size={18} style={{ marginRight: 6 }} /> Descargar APK (estable)
            </a>
          </motion.div>
        )}

        <div className="store-badges">
          <AppleBadge />
          <PlayBadge />
        </div>

        <div className="store-note">
          <h3><Store size={18} style={{ verticalAlign: '-3px', marginRight: 8 }} />Próximamente en tiendas</h3>
          <p><Smartphone size={16} style={{ verticalAlign: '-2px', marginRight: 6, color: 'var(--primary-dark)' }} />Google Play y App Store llegarán en versiones futuras. Mientras tanto, instala el APK habilitando "orígenes desconocidos".</p>
        </div>

        <div className="qr-card">
          <div className="qr-box">
            <QRCodeSVG value={qrValue} size={132} level="M" />
          </div>
          <div className="qr-info">
            <h4><QrCode size={18} style={{ verticalAlign: '-3px', marginRight: 6 }} />Escanea para instalar</h4>
            <p>Desde tu celular, escanea este código para abrir la página de descarga y obtener el APK.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
