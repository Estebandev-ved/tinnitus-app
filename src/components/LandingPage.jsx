import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { FirestoreService } from '../services/firestoreService';
import { Shield, Download, Cpu, Headphones, Play, Sparkles, HelpCircle, Smartphone, CheckCircle, ArrowRight } from 'lucide-react';
import './LandingPage.css';

export default function LandingPage({ onGoToApp }) {
  const [referrer, setReferrer] = useState('direct');
  const [apkUrl, setApkUrl] = useState('');
  const [appVersion, setAppVersion] = useState('1.0.0');
  const [downloading, setDownloading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // 1. Read ref from query parameters
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref');
    if (refParam) {
      setReferrer(refParam);
    }

    // 2. Fetch the latest APK download URL and version from Firestore
    const fetchMetadata = async () => {
      try {
        const configRef = doc(db, 'app_config', 'metadata');
        const docSnap = await getDoc(configRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setApkUrl(data.download_url || '');
          setAppVersion(data.latest_version || '1.0.0');
        }
      } catch (err) {
        console.error("Error reading app config metadata:", err);
      }
    };

    fetchMetadata();
  }, []);

  const handleDownloadClick = async () => {
    setDownloading(true);
    
    // Log the download click and update attribution in Firestore
    try {
      const userAgent = navigator.userAgent;
      const platform = navigator.platform || 'unknown';
      await FirestoreService.logDownloadAttribution(referrer, userAgent, platform);
    } catch (err) {
      console.error("Error recording download click:", err);
    }

    // Trigger APK download
    if (apkUrl) {
      setTimeout(() => {
        window.location.href = apkUrl;
        setDownloading(false);
        setShowInstructions(true);
      }, 1000);
    } else {
      alert("La URL de descarga no está disponible en este momento.");
      setDownloading(false);
    }
  };

  return (
    <div className="landing-page-container">
      {/* Background elements */}
      <div className="landing-glow-1"></div>
      <div className="landing-glow-2"></div>
      
      <header className="landing-header glass">
        <div className="landing-logo">
          <Headphones size={28} className="logo-icon animate-pulse" />
          <span className="logo-text">Tinnit<span>Off</span></span>
        </div>
        <button className="btn-app-access glass" onClick={onGoToApp}>
          Acceder a la Web App <ArrowRight size={16} />
        </button>
      </header>

      <main className="landing-main">
        <section className="hero-section">
          <div className="badge-promo glass animate-fade">
            <Sparkles size={14} className="sparkle-icon" />
            <span>Terapia digital avanzada para el oído</span>
          </div>
          
          <h1 className="hero-title animate-slide-up">
            Libera tu mente del <span className="highlight-text">Tinnitus</span> hoy mismo
          </h1>
          
          <p className="hero-subtitle animate-slide-up">
            Descarga TinnitOff y experimenta terapias acústicas tridimensionales personalizadas, enmascaramiento clínico avanzado y monitoreo de estrés en tiempo real.
          </p>

          <div className="download-cta-box glass animate-slide-up">
            <div className="cta-header">
              <Smartphone size={24} className="cta-icon" />
              <div>
                <h3>Instalador Oficial TinnitOff Android</h3>
                <p>Versión actual: v{appVersion} • Archivo APK Seguro</p>
              </div>
            </div>

            {referrer !== 'direct' && (
              <div className="referrer-badge-glow">
                Invitado especial por: <span className="ref-name">{referrer}</span>
              </div>
            )}

            <button 
              className={`btn-main-download ${downloading ? 'loading' : ''}`}
              onClick={handleDownloadClick}
              disabled={downloading}
            >
              {downloading ? (
                <>Generando enlace seguro...</>
              ) : (
                <>
                  <Download size={20} /> Descargar TinnitOff APK
                </>
              )}
            </button>
            <p className="download-notice">Descarga libre de anuncios y virus. Certificado HTTPS.</p>
          </div>

          <div className="quick-stats animate-fade">
            <div className="q-stat">
              <strong>94%</strong>
              <span>Habituación rápida</span>
            </div>
            <div className="q-divider"></div>
            <div className="q-stat">
              <strong>3D</strong>
              <span>Sonido binaural</span>
            </div>
            <div className="q-divider"></div>
            <div className="q-stat">
              <strong>IA</strong>
              <span>Filtro adaptativo</span>
            </div>
          </div>
        </section>

        {showInstructions && (
          <section className="instructions-section glass animate-slide-up">
            <h3><CheckCircle size={22} color="#34c759" /> ¡Tu descarga ha comenzado!</h3>
            <p>Sigue estos sencillos pasos para instalar TinnitOff en tu celular:</p>
            
            <div className="steps-grid">
              <div className="step-card">
                <span className="step-num">1</span>
                <h4>Abre el archivo</h4>
                <p>Busca el archivo <code>tinnitoff.apk</code> descargado en tus notificaciones o gestor de descargas.</p>
              </div>
              <div className="step-card">
                <span className="step-num">2</span>
                <h4>Permite orígenes</h4>
                <p>Si tu sistema lo solicita, activa "Permitir desde esta fuente" para autorizar la instalación manual.</p>
              </div>
              <div className="step-card">
                <span className="step-num">3</span>
                <h4>Disfruta la app</h4>
                <p>Inicia la aplicación, crea tu cuenta o inicia sesión y comienza tu viaje hacia el alivio.</p>
              </div>
            </div>
          </section>
        )}

        <section className="features-grid">
          <div className="feature-card glass">
            <div className="f-icon-box cyan">
              <Cpu size={24} />
            </div>
            <h3>Filtro de Frecuencia Inteligente</h3>
            <p>Identifica y replica con precisión la frecuencia de tu tinnitus para programar terapias de reentrenamiento auditivo neuronal altamente eficaces.</p>
          </div>

          <div className="feature-card glass">
            <div className="f-icon-box purple">
              <Headphones size={24} />
            </div>
            <h3>Paisajes Sonoros 3D</h3>
            <p>Sumérgete en sonidos binaurales tridimensionales modelados clínicamente para relajar la corteza auditiva hiperactiva de tu cerebro.</p>
          </div>

          <div className="feature-card glass">
            <div className="f-icon-box orange">
              <Play size={24} />
            </div>
            <h3>Mascarador SOS</h3>
            <p>Activación rápida de terapias de alivio acústico instantáneo para modular picos elevados de tinnitus y reducir el estrés auditivo crítico.</p>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>© 2026 TinnitOff. Todos los derechos reservados. Diseñado para el alivio permanente.</p>
        <div className="footer-links">
          <a href="#disclaimer" onClick={(e) => { e.preventDefault(); alert("TinnitOff es una herramienta de apoyo acústico y no sustituye el diagnóstico médico profesional."); }}>Cláusula Médica</a>
          <span>•</span>
          <a href="#app" onClick={(e) => { e.preventDefault(); onGoToApp(); }}>Acceso Directo</a>
        </div>
      </footer>
    </div>
  );
}
