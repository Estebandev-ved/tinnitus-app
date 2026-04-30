import React, { useState } from 'react';
import WizardStep from './WizardStep';
import VideoEmbed from './VideoEmbed';
import QuizQuestion from './QuizQuestion';
import ConfettiCelebration from './ConfettiCelebration';

const steps = [
  { id: 'intro', title: 'Bienvenida', content: <p>Hola a la app.</p> },
  { id: 'video', title: 'Video Intro', content: <VideoEmbed src="intro.mp4" /> },
  { id: 'freq', title: 'Frequency Matcher', content: <p>Usa el slider para buscar tu sonido.</p> },
  { id: 'quiz', title: 'Quiz', content: <QuizQuestion question="Qué es tinnitus?" options={["Sonido en oído", "Comida"]} onAnswer={(ans)=>alert(ans)} /> },
  { id: 'audio', title: 'Preferencia de Audio', content: <p>Reproduciendo White Noise...</p> },
  { id: 'ready', title: '¡Listo!', content: <p>Todo configurado.</p> }
];

export default function OnboardingWizard({ onComplete }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else { setDone(true); setTimeout(onComplete, 3000); }
  };

  const skip = () => next();

  if (done) return <ConfettiCelebration />;

  const current = steps[step];
  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="flex gap-2 mb-4">
        {steps.map((s, i) => (
          <div key={s.id} className={`h-2 flex-1 rounded ${i <= step ? 'bg-indigo-600' : 'bg-gray-300'}`} />
        ))}
      </div>
      <WizardStep title={current.title} onNext={next} onSkip={skip}>
        {current.content}
      </WizardStep>
    </div>
  );
}
