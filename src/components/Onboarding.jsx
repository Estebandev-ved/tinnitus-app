import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import './Onboarding.css';
import ConfettiCelebration from '../../DELIVERABLES/Components/ConfettiCelebration';
import QuizQuestion from '../../DELIVERABLES/Components/QuizQuestion';
import VideoEmbed from '../../DELIVERABLES/Components/VideoEmbed';
import WizardStep from '../../DELIVERABLES/Components/WizardStep';

const steps = [
  { id: 'intro', title: 'Paso 1: Bienvenida', content: <p>Hola y bienvenido a TinnitOff. Estamos aquí para ayudarte a mejorar.</p> },
  { id: 'video', title: 'Paso 2: Video Introductorio', content: <VideoEmbed src="https://example.com/intro.mp4" /> },
  { id: 'freq', title: 'Paso 3: Frequency Matcher Tutorial', content: <p>Aprende a usar el slider para encontrar la frecuencia exacta de tu zumbido.</p> },
  { id: 'quiz', title: 'Paso 4: Quiz de Conocimiento', content: <QuizQuestion question="¿El tinnitus tiene cura absoluta universal?" options={["Sí", "No", "Depende de la causa"]} onAnswer={(ans)=>console.log('Respuesta:', ans)} /> },
  { id: 'audio', title: 'Paso 5: Selector de Preferencia de Audio', content: <QuizQuestion question="Escucha y elige: ¿Qué sonido te alivia más?" options={["White Noise (Shhh suave)", "Pink Noise (Shhh grave)", "Aún no lo sé"]} onAnswer={(ans)=>console.log('Audio:', ans)} /> },
  { id: 'config', title: 'Paso 6: Configurando tu perfil', content: <p>Aplicando las preferencias guardadas a tu gemelo digital...</p> },
  { id: 'ready', title: 'Paso 7: ¡Todo Listo!', content: <p>Ya puedes empezar a usar la aplicación para tu terapia diaria.</p> }
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