import React from 'react';
import { ChevronLeft, Shield } from 'lucide-react';

const PrivacyPolicy = ({ onClose }) => (
  <div className="modal-overlay" style={{ zIndex: 9999 }}>
    <div className="modal card" style={{ maxHeight: '90vh', overflowY: 'auto', maxWidth: 600, margin: '0 auto' }}>
      <div className="modal-header" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button className="btn btn-ghost" onClick={onClose} style={{ padding: 6 }}>
          <ChevronLeft size={22} />
        </button>
        <Shield size={20} color="#007AFF" />
        <h2 style={{ margin: 0, fontSize: 18 }}>Política de Privacidad</h2>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
        Última actualización: abril 2026
      </p>

      <Section title="1. Quiénes somos">
        TinnitOff es una aplicación de apoyo terapéutico para personas con tinnitus (acúfenos). No somos un
        proveedor médico. Nuestro servicio no sustituye la atención de un profesional de la salud.
      </Section>

      <Section title="2. Datos que recopilamos">
        <ul style={{ paddingLeft: 18, lineHeight: 1.8 }}>
          <li><strong>Cuenta:</strong> nombre, email (mediante Firebase Auth / Google Sign-In).</li>
          <li><strong>Datos de salud:</strong> niveles de tinnitus, estrés, sueño que introduces manualmente.</li>
          <li><strong>Perfil médico:</strong> información opcional que ingresas (medicamentos, doctor, etc.).</li>
          <li><strong>Grabaciones de voz:</strong> procesadas localmente en tu dispositivo; no se envían a nuestros servidores.</li>
          <li><strong>Cámara:</strong> usada solo para el Monitor Facial; el video no se almacena ni se transmite.</li>
          <li><strong>Diagnóstico de app:</strong> errores técnicos anónimos para mejorar la estabilidad.</li>
        </ul>
      </Section>

      <Section title="3. Cómo usamos tus datos">
        <ul style={{ paddingLeft: 18, lineHeight: 1.8 }}>
          <li>Personalizar tus terapias y recomendaciones de IA.</li>
          <li>Mostrar tu historial de progreso y rachas.</li>
          <li>Generar reportes PDF para tu médico (solo cuando tú lo solicitas).</li>
          <li>Enviarte recordatorios de sesión (solo si los activas).</li>
        </ul>
      </Section>

      <Section title="4. Con quién compartimos tus datos">
        <strong>No vendemos ni compartimos tus datos con terceros.</strong> Solo los usamos con:
        <ul style={{ paddingLeft: 18, lineHeight: 1.8, marginTop: 8 }}>
          <li><strong>Firebase (Google):</strong> almacenamiento seguro en la nube.</li>
          <li><strong>Azure OpenAI (Microsoft):</strong> procesamiento del chat de IA. Solo se envía el texto del chat.</li>
        </ul>
      </Section>

      <Section title="5. Tus derechos (GDPR / LGPD)">
        <ul style={{ paddingLeft: 18, lineHeight: 1.8 }}>
          <li>Acceder, corregir o eliminar tus datos en cualquier momento desde tu perfil.</li>
          <li>Exportar tus datos (botón PDF en la pantalla principal).</li>
          <li>Revocar consentimiento y eliminar tu cuenta contactándonos.</li>
        </ul>
      </Section>

      <Section title="6. Seguridad">
        Tus datos están protegidos con cifrado en tránsito (HTTPS/TLS) y en reposo (Firebase Security Rules).
        Solo tú puedes acceder a tu propia información.
      </Section>

      <Section title="7. Menores">
        Esta app no está dirigida a menores de 13 años. No recopilamos datos de menores conscientemente.
      </Section>

      <Section title="8. Cambios a esta política">
        Te notificaremos dentro de la app si hacemos cambios significativos. La fecha de actualización
        siempre estará visible en la parte superior.
      </Section>

      <Section title="9. Contacto">
        Para cualquier pregunta sobre privacidad escríbenos a: <strong>privacy@tinnitoff.app</strong>
      </Section>

      <button className="btn btn-primary" style={{ width: '100%', marginTop: 24 }} onClick={onClose}>
        Entendido
      </button>
    </div>
  </div>
);

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 20 }}>
    <h3 style={{ fontSize: 15, marginBottom: 8, color: 'var(--text-primary)' }}>{title}</h3>
    <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>{children}</div>
  </div>
);

export default PrivacyPolicy;
