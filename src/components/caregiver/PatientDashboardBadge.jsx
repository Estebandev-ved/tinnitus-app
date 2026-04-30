import React, { useState } from 'react';
import { Shield, Bell, Check } from 'lucide-react';

export function PatientDashboardBadge({ caregiverName = "Ana" }) {
  const [shareStreak, setShareStreak] = useState(true);
  const [shareTinnitus, setShareTinnitus] = useState(false);

  const handleSOS = () => {
    // POST /api/v1/sos -> Envia Push inmediato
    alert(`[PUSH ORG] 🚨 Necesito apoyo ahora enviado a ${caregiverName}`);
  };

  return (
    <div className="glass-card" style={{ maxWidth: '450px', margin: '0 auto' }}>
      
      {/* Badge Estado */}
      <div className="flex items-center gap-3 bg-blue-900/30 p-3 rounded-lg border border-blue-800/50">
        <Shield className="text-blue-400 w-6 h-6" />
        <p className="font-semibold text-blue-100">
          Acompañado por {caregiverName}
        </p>
      </div>

      {/* Toggles Privacidad */}
      <div className="space-y-3 bg-gray-800/50 p-4 rounded-xl">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Compartir Racha</span>
          <button 
            onClick={() => setShareStreak(!shareStreak)}
            className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${shareStreak ? 'bg-green-500' : 'bg-gray-600'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${shareStreak ? 'translate-x-6' : ''}`} />
          </button>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Compartir Tinnitus Lvl</span>
          <button 
            onClick={() => setShareTinnitus(!shareTinnitus)}
            className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${shareTinnitus ? 'bg-green-500' : 'bg-gray-600'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${shareTinnitus ? 'translate-x-6' : ''}`} />
          </button>
        </div>
      </div>

      <button 
        onClick={handleSOS}
        className="premium-btn w-full"
        style={{ background: 'linear-gradient(135deg, #FF3B30 0%, #FF2D55 100%)', marginTop: '1.5rem' }}
      >
        <Bell className="w-5 h-5" /> SOS: Solicitar Apoyo
      </button>

    </div>
  );
}
