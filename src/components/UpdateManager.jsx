import React, { useEffect, useState } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Download, AlertTriangle, Cpu } from 'lucide-react';
import './UpdateManager.css';

export default function UpdateManager({ children }) {
  const [updateRequired, setUpdateRequired] = useState(false);
  const [apkUrl, setApkUrl] = useState('');
  const [latestVersion, setLatestVersion] = useState('');
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
          setCurrentVersion('1.0.0');
        }

        // 2. Listen to real-time configuration changes from Firestore
        const configRef = doc(db, 'app_config', 'metadata');
        unsubscribe = onSnapshot(configRef, (docSnap) => {
          if (docSnap.exists()) {
            const { latest_version, download_url, force_update } = docSnap.data();
            setLatestVersion(latest_version);
            setApkUrl(download_url);

            // ONLY block if running inside the native APK, force_update is active, and is outdated
            if (isNative && force_update && isOutdated(version, latest_version)) {
              setUpdateRequired(true);
            } else {
              setUpdateRequired(false);
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

  if (updateRequired) {
    return (
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
              <span>Instalación segura HTTPS desde el repositorio oficial.</span>
            </div>

            <p className="description">
              Para garantizar el correcto funcionamiento de las terapias acústicas, corregir anomalías y mejorar los filtros de estimulación 3D, es necesario instalar esta actualización ahora.
            </p>
          </div>

          <div className="update-footer">
            <a 
              href={apkUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="update-download-btn"
            >
              <Download size={18} /> Descargar e Instalar APK
            </a>
            <small className="notice">Se descargará el archivo .apk. Ábrelo en tu gestor de archivos para instalarlo.</small>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
