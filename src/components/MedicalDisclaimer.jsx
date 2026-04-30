import React from 'react';
import { ChevronLeft, AlertTriangle } from 'lucide-react';

const MedicalDisclaimer = ({ onClose, onAccept }) => (
  <div className="modal-overlay" style={{ zIndex: 9999 }}>
    <div className="modal card" style={{ maxHeight: '90vh', overflowY: 'auto', maxWidth: 560, margin: '0 auto' }}>
      <div className="modal-header" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button className="btn btn-ghost" onClick={onClose} style={{ padding: 6 }}>
          <ChevronLeft size={22} />
        </button>
        <AlertTriangle size={20} color="#FF9500" />
        <h2 style={{ margin: 0, fontSize: 18 }}>Aviso Médico Importante</h2>
      </div>

      <div style={{
        background: 'rgba(255, 149, 0, 0.1)',
        border: '1px solid rgba(255, 149, 0, 0.3)',
        borderRadius: 10,
        padding: '14px 16px',
        marginBottom: 20,
      }}>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--text-primary)', fontWeight: 500 }}>
          TinnitOff <strong>no es un dispositivo médico</strong> y no reemplaza la consulta con un profesional de la salud.
        </p>
      </div>

      <Section>
        Esta aplicación está diseñada como <strong>herramienta de apoyo complementario</strong> para personas con
        tinnitus (acúfenos). Los ejercicios de sonido, respiración y relajación que ofrece son de carácter
        educativo y de bienestar general.
      </Section>

      <Section>
        <strong>No uses esta app para:</strong>
        <ul style={{ paddingLeft: 18, lineHeight: 1.8, marginTop: 6 }}>
          <li>Diagnosticar o tratar condiciones médicas</li>
          <li>Reemplazar tratamientos prescritos por tu médico</li>
          <li>Tomar decisiones clínicas sin supervisión profesional</li>
        </ul>
      </Section>

      <Section>
        Si experimentas <strong>cambios súbitos en el tinnitus, pérdida de audición, vértigo severo o
        síntomas nuevos</strong>, consulta a un otorrinolaringólogo o audiólogo de inmediato.
      </Section>

      <Section>
        El uso del <strong>Asistente IA</strong> dentro de la app es informativo. Las respuestas no constituyen
        consejo médico y pueden contener errores. Siempre verifica la información con tu médico.
      </Section>

      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 16, lineHeight: 1.5 }}>
        Al continuar, confirmas que has leído y comprendido este aviso. Para preguntas médicas, contacta
        a un profesional de salud certificado.
      </p>

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        {onClose && (
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
            Cancelar
          </button>
        )}
        <button className="btn btn-primary" style={{ flex: 2 }} onClick={onAccept || onClose}>
          Entendido, continuar
        </button>
      </div>
    </div>
  </div>
);

const Section = ({ children }) => (
  <div style={{ marginBottom: 14, fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
    {children}
  </div>
);

export default MedicalDisclaimer;
