import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import './Onboarding.css';
import ConfettiCelebration from '../../DELIVERABLES/Components/ConfettiCelebration';
import QuizQuestion from '../../DELIVERABLES/Components/QuizQuestion';
import VideoEmbed from '../../DELIVERABLES/Components/VideoEmbed';
import WizardStep from '../../DELIVERABLES/Components/WizardStep';

const steps = [
  { 
    id: 'intro', 
    title: 'Paso 1: ¡Te damos la bienvenida!', 
    content: (
      <div style={{ textAlign: 'center', padding: '10px 0' }}>
        <p style={{ fontSize: 16, lineHeight: 1.6 }}>
          Hola. TinnitOff está diseñado por especialistas para ayudarte a <strong>habituar y reducir</strong> la percepción de tu acúfeno (tinnitus).
        </p>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          A través de este asistente rápido, configuraremos la aplicación para adaptarla exactamente a tus oídos. ¡Solo tomará un minuto!
        </p>
      </div>
    ) 
  },
  { 
    id: 'video', 
    title: 'Paso 2: ¿Cómo funciona la terapia?', 
    content: (
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>
          Mira este video explicativo rápido para entender los principios científicos de la habituación acústica.
        </p>
        <VideoEmbed src="https://example.com/intro.mp4" />
      </div>
    ) 
  },
  { 
    id: 'freq', 
    title: 'Paso 3: Tutorial de Frecuencia', 
    content: (
      <div style={{ textAlign: 'left', lineHeight: 1.5 }}>
        <p style={{ fontSize: 15 }}>
          Para que el tratamiento funcione, necesitamos saber a qué tono suena tu tinnitus.
        </p>
        <ul style={{ paddingLeft: 20, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li>Usarás un selector deslizante (slider) para generar un sonido artificial.</li>
          <li>Ajustarás los Hz (hercios) hasta que el sonido sea <strong>lo más parecido posible</strong> a tu zumbido habitual.</li>
          <li>Una vez guardado, tus terapias de sonido se emitirán en frecuencias protectoras personalizadas.</li>
        </ul>
      </div>
    ) 
  },
  { 
    id: 'quiz', 
    title: 'Paso 4: Un dato muy importante', 
    content: (
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 14, marginBottom: 12, color: 'var(--text-secondary)' }}>
          Aprender sobre tu condición reduce la ansiedad, lo que disminuye la intensidad del acúfeno.
        </p>
        <QuizQuestion 
          question="¿El tinnitus se puede aliviar y habituar?" 
          options={["No, nunca cambia", "Sí, con terapias acústicas y de relajación", "Solo con cirugía"]} 
          onAnswer={(ans)=>console.log('Respuesta:', ans)} 
        />
      </div>
    ) 
  },
  { 
    id: 'audio', 
    title: 'Paso 5: Tu Sonido de Alivio', 
    content: (
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 14, marginBottom: 12, color: 'var(--text-secondary)' }}>
          ¿Qué tipo de fondo te resulta más relajante y enmascara mejor tu acúfeno en este momento?
        </p>
        <QuizQuestion 
          question="Elige tu preferencia de ruido inicial:" 
          options={["Ruido Blanco (shhh suave similar a TV sin señal)", "Ruido Rosa (shhh más profundo similar a la lluvia)", "Aún no lo sé, prefiero explorar luego"]} 
          onAnswer={(ans)=>console.log('Audio:', ans)} 
        />
      </div>
    ) 
  },
  { 
    id: 'config', 
    title: 'Paso 6: Creando tu Gemelo Digital', 
    content: (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--primary)' }}>Procesando preferencias...</p>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Estamos configurando tu <strong>Gemelo Digital de Inteligencia Artificial</strong>. Esta herramienta simulará el estado de tu oído interno para predecir y evitar crisis de estrés auditivo.
        </p>
      </div>
    ) 
  },
  { 
    id: 'ready', 
    title: 'Paso 7: ¡Todo Listo para Empezar!', 
    content: (
      <div style={{ textAlign: 'center', padding: '10px 0' }}>
        <h3 style={{ color: 'var(--success)', marginBottom: 12 }}>🎉 ¡Configuración Exitosa!</h3>
        <p style={{ fontSize: 15, lineHeight: 1.5 }}>
          Tu perfil médico ha sido inicializado con éxito.
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          En la pantalla de inicio verás una <strong>Guía de Inicio Rápido</strong> interactiva por si en algún momento olvidas cuál es el siguiente paso de tu terapia. ¡Tu camino hacia el alivio comienza hoy!
        </p>
      </div>
    ) 
  }
];

const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else {
      setDone(true);
      localStorage.setItem('tinnitoff_onboarded', 'true');
      setTimeout(onComplete, 4000);
    }
  };

  const handleSkip = () => {
      handleNext();
  };

  if (done) return <ConfettiCelebration />;

  const current = steps[step];

  return (
    <div className="wizard-wrapper">
      <div className="wizard-container">
        <div className="wizard-progress">
          {steps.map((s, i) => (
            <div 
              key={s.id} 
              className={`wizard-progress-bar ${i <= step ? 'active' : ''}`} 
            />
          ))}
        </div>
        
        <WizardStep 
          title={current.title} 
          onNext={handleNext} 
          onSkip={step === steps.length - 1 ? null : handleSkip}
        >
          {current.content}
        </WizardStep>
      </div>
    </div>
  );
};

export default Onboarding;