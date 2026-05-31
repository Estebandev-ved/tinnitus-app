import React, { useEffect, useState } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Download, AlertTriangle, Cpu, X, HelpCircle } from 'lucide-react';
import './UpdateManager.css';

export default function UpdateManager({ children }) {
  const [updateRequired, setUpdateRequired] = useState(false);
  const [showOptionalUpdate, setShowOptionalUpdate] = useState(false);
  const [apkUrl, setApkUrl] = useState('https://tinnitusoff-e61c4.web.app/download.html');
  const [latestVersion, setLatestVersion] = useState('1.1.0');
  const [currentVersion, setCurrentVersion] = useState('1.0.0');

  useEffect(() => {
    let unsubscribe = () => {};

    const setupVersionCheck = async () => {
      try {
        // 1. Get current installed native version using Capacitor App API
        const isNative = Capacitor.isNativePlatform();
        let version = '1.0.0';
        
        if (isNative) {
          try {
            const info = await App.getInfo();
            version = info.version;
            setCurrentVersion(version);
          } catch (e) {
            console.warn("Capacitor App getInfo not available:", e);
          }
        } else {
          // If we are on web, set current version to latest to bypass blocking
          setCurrentVersion('1.1.0');
        }

        // 2. Listen to real-time configuration changes from Firestore
        const configRef = doc(db, 'app_config', 'metadata');
        unsubscribe = onSnapshot(configRef, (docSnap) => {
          if (docSnap.exists()) {
            const { latest_version, download_url, force_update } = docSnap.data();

            /**
             * MEDIDAS DE SEGURIDAD IMPLEMENTADAS (Ciberseguridad OWASP):
             * 1. Validación de Entradas: Saneamos la versión para asegurarnos de que sigue un formato semver válido.
             * 2. Prevención de Redirección Abierta (Open Redirect): Validamos que la URL pertenezca a dominios oficiales autorizados.
             */
            let cleanVersion = '1.1.0';
            if (latest_version && /^\d+\.\d+\.\d+$/.test(latest_version)) {
              cleanVersion = latest_version;
            }
            setLatestVersion(cleanVersion);

            let cleanUrl = 'https://tinnitusoff-e61c4.web.app/download.html';
            try {
              if (download_url) {
                const parsed = new URL(download_url);
                if (parsed.protocol === 'https:' && 
                    (parsed.hostname === 'tinnitusoff-e61c4.web.app' || 
                     parsed.hostname === 'github.com' ||
                     parsed.hostname === 'tinnitusoff.web.app')) {
                  cleanUrl = download_url;
                }
              }
            } catch (e) {
              console.error("URL de descarga no válida en Firestore. Usando URL por defecto segura.");
            }
            setApkUrl(cleanUrl);

            // Comprobar si la versión está desactualizada
            const isOutdatedVersion = isOutdated(version, cleanVersion);

            // SOLO actuar si se está en plataforma nativa y la versión está desactualizada
            if (isNative && isOutdatedVersion) {
              if (force_update) {
                setUpdateRequired(true);
                setShowOptionalUpdate(false);
              } else {
                setUpdateRequired(false);
                // Si es opcional, verificar si ya se descartó en esta sesión
                const dismissed = sessionStorage.getItem('dismissed_update_v' + cleanVersion);
                if (!dismissed) {
                  setShowOptionalUpdate(true);
                }
              }
            } else {
              setUpdateRequired(false);
              setShowOptionalUpdate(false);
            }
          }
        }, (error) => {
          console.error("Error watching app_config in real-time:", error);
        });

      } catch (error) {
        console.error("Error setting up version verification:", error);
      }
    };

    setupVersionCheck();
    return () => unsubscribe();
  }, []);

  // Simple semantic version comparator (e.g. "1.0.0" vs "1.1.0")
  const isOutdated = (current, latest) => {
    if (!current || !latest) return false;
    
    const currParts = current.split('.').map(Number);
    const latParts = latest.split('.').map(Number);
    
    for (let i = 0; i < Math.max(currParts.length, latParts.length); i++) {
      const currVal = currParts[i] || 0;
      const latVal = latParts[i] || 0;
      if (currVal < latVal) return true;
      if (currVal > latVal) return false;
    }
    return false;
  };

  /**
   * Abre de forma segura el portal web de descarga en el navegador del sistema.
   * Evita bloqueos de descarga dentro del WebView nativo de Android.
   * 
   * MEDIDAS DE SEGURIDAD (OWASP):
   * - Validación exhaustiva del protocolo y hostname del enlace de destino.
   * - Uso de '_system' para forzar la delegación al navegador del dispositivo.
   */
  const handleOpenWeb = (e) => {
    if (e) e.preventDefault();
    
    try {
      const parsedUrl = new URL(apkUrl);
      if (parsedUrl.protocol !== 'https:' || 
          !(parsedUrl.hostname === 'tinnitusoff-e61c4.web.app' || 
            parsedUrl.hostname === 'github.com' ||
            parsedUrl.hostname === 'tinnitusoff.web.app')) {
        console.error("Acceso Denegado: Destino no autorizado.");
        alert("Enlace de actualización no seguro. Por favor, descarga desde la web oficial.");
        return;
      }

      if (Capacitor.isNativePlatform()) {
        window.open(apkUrl, '_system');
      } else {
        window.open(apkUrl, '_blank');
      }
    } catch (err) {
      console.error("Error al abrir URL de descarga:", err);
      // Fallback a url oficial segura
      const fallbackUrl = 'https://tinnitusoff-e61c4.web.app/download.html';
      if (Capacitor.isNativePlatform()) {
        window.open(fallbackUrl, '_system');
      } else {
        window.open(fallbackUrl, '_blank');
      }
    }
  };

  const handleDismissOptional = () => {
    sessionStorage.setItem('dismissed_update_v' + latestVersion, 'true');
    setShowOptionalUpdate(false);
  };

  return (
    <>
      {children}

      {/* 1. MODAL OBLIGATORIO (BLOQUEANTE) */}
      {updateRequired && (
        <div className="update-lock-screen">
          <div className="particles-container">
            <div className="particle" />
            <div className="particle" />
            <div className="particle" />
          </div>

          <div className="update-modal glass animate-slide-up">
            <div className="update-header">
              <div className="alert-pulse">
                <AlertTriangle size={32} />
              </div>
              <h2>Actualización Obligatoria</h2>
              <p className="subtitle">Una versión crítica de TinnitOff está lista para tu dispositivo.</p>
            </div>

            <div className="update-body">
              <div className="version-compare-box">
                <div className="version-stat">
                  <span>Versión Actual</span>
                  <strong>v{currentVersion}</strong>
                </div>
                <div className="arrow-flow">→</div>
                <div className="version-stat success">
                  <span>Versión Nueva</span>
                  <strong>v{latestVersion}</strong>
                </div>
              </div>

              <div className="security-notice">
                <Cpu size={16} />
                <span>Instalación segura desde el navegador oficial.</span>
              </div>

              <p className="description">
                Para garantizar el correcto funcionamiento de las terapias acústicas, corregir anomalías y mejorar los filtros de estimulación 3D, es necesario instalar esta actualización ahora.
              </p>
            </div>

            <div className="update-footer">
              <button 
                onClick={handleOpenWeb}
                className="update-download-btn"
              >
                <Download size={18} /> Actualizar desde la Web
              </button>
              <small className="notice">Se abrirá el navegador del celular para descargar el APK de forma segura.</small>
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL OPCIONAL (DESMITIBLE) */}
      {showOptionalUpdate && (
        <div className="update-optional-overlay">
          <div className="update-modal optional glass animate-slide-up">
            <button className="close-btn" onClick={handleDismissOptional} aria-label="Cerrar aviso">
              <X size={18} />
            </button>
            
            <div className="update-header">
              <div className="info-pulse">
                <HelpCircle size={28} />
              </div>
              <h2>Nueva Versión Disponible</h2>
              <p className="subtitle">Descubre las últimas mejoras de TinnitOff v{latestVersion}</p>
            </div>

            <div className="update-body">
              <div className="version-compare-box">
                <div className="version-stat">
                  <span>Tu Versión</span>
                  <strong>v{currentVersion}</strong>
                </div>
                <div className="arrow-flow">→</div>
                <div className="version-stat success">
                  <span>Disponible</span>
                  <strong>v{latestVersion}</strong>
                </div>
              </div>

              <p className="description">
                Hemos optimizado los motores de estimulación acústica y corregido detalles de telemetría. Actualiza ahora para disfrutar la mejor experiencia.
              </p>
            </div>

            <div className="update-footer">
              <button 
                onClick={handleOpenWeb}
                className="update-download-btn optional-btn"
              >
                <Download size={18} /> Actualizar en la Web
              </button>
              <button 
                onClick={handleDismissOptional}
                className="update-later-btn"
              >
                Más tarde
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
