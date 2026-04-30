import React, { useState } from 'react';
import { Share2, QrCode, CheckCircle, ShieldAlert } from 'lucide-react';

export function LinkFlow() {
  const [step, setStep] = useState(1);
  const [token] = useState(crypto.randomUUID ? crypto.randomUUID() : 'temp-uuid');

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Hola, soy tu paciente. Vincula mi progreso aquí: app://link?token=${token}`);
    window.open(`whatsapp://send?text=${text}`, '_blank');
    setStep(3);
  };

  return (
    <div className="glass-card" style={{ maxWidth: '450px', margin: '0 auto' }}>
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-blue-400" />
        Conexión Fácil
      </h2>
      
      {/* Paso 1 */}
      {step === 1 && (
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold">1. No sufras solo</p>
          <p className="text-sm text-gray-400">Vincula a tu copiloto para compartir tu progreso.</p>
          <button 
            onClick={() => setStep(2)}
            className="premium-btn w-full"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Paso 2 */}
      {step === 2 && (
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold">2. Envía link o escanea QR</p>
          <div className="flex gap-2 justify-center">
            <button 
              onClick={handleWhatsApp}
              className="premium-btn flex-1"
              style={{ background: 'linear-gradient(135deg, #28CD41 0%, #34C759 100%)' }}
            >
              <Share2 className="w-4 h-4" /> WhatsApp
            </button>
            <button 
              className="premium-btn flex-1 btn-ghost"
            >
              <QrCode className="w-4 h-4" /> Código QR
            </button>
          </div>
        </div>
      )}

      {/* Paso 3 */}
      {step === 3 && (
        <div className="text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <p className="text-lg font-semibold">3. Tu copiloto conectado</p>
          <p className="text-sm text-gray-400">Esperando confirmación del cuidador...</p>
        </div>
      )}
    </div>
  );
}
