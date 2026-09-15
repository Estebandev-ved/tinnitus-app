import React, { useState, useMemo } from 'react';
import { ChevronLeft, Check, ClipboardList, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import THIResultSummary from './THIResultSummary';
import './THIQuestionnaire.css';

// Tinnitus Handicap Inventory (THI) — 25 ítems.
// tipo: F = Funcional, E = Emocional, C = Catastrófica.
// Texto según el PDF de referencia (escucharahoraysiempre.com).
const QUESTIONS = [
    { n: 1,  tipo: 'F', text: '¿Le cuesta concentrarse por culpa del ruido o zumbido en el oído?' },
    { n: 2,  tipo: 'F', text: '¿Le cuesta escuchar a los demás debido a que el zumbido es muy fuerte?' },
    { n: 3,  tipo: 'F', text: '¿Lo pone de mal humor el zumbido en el oído?' },
    { n: 4,  tipo: 'F', text: '¿Se siente confundido por culpa del zumbido en el oído?' },
    { n: 5,  tipo: 'C', text: '¿Se desespera con el ruido o zumbido del oído?' },
    { n: 6,  tipo: 'E', text: '¿Se queja mucho por tener el zumbido en el oído?' },
    { n: 7,  tipo: 'F', text: '¿Le cuesta quedarse dormido en la noche por culpa del zumbido del oído?' },
    { n: 8,  tipo: 'C', text: '¿Cree que el problema de su zumbido es algo sin solución?' },
    { n: 9,  tipo: 'F', text: '¿El zumbido de oído le impide disfrutar de la vida como por ejemplo: ir a cine o salir a cenar?' },
    { n: 10, tipo: 'E', text: '¿Se siente desilusionado por culpa del zumbido del oído?' },
    { n: 11, tipo: 'C', text: '¿Cree que tiene una enfermedad incurable?' },
    { n: 12, tipo: 'F', text: '¿El zumbido del oído le impide disfrutar de la vida?' },
    { n: 13, tipo: 'F', text: '¿Interfiere el zumbido del oído en su trabajo o en las labores de la casa?' },
    { n: 14, tipo: 'F', text: '¿Se siente a menudo de mal humor por culpa del zumbido del oído?' },
    { n: 15, tipo: 'F', text: '¿Le cuesta entender lo que lee por culpa del zumbido del oído?' },
    { n: 16, tipo: 'E', text: '¿Se siente alterado por el zumbido del oído?' },
    { n: 17, tipo: 'E', text: '¿Siente que el zumbido de oído le crea tensiones o interfiere en las relaciones con sus familiares y amigos?' },
    { n: 18, tipo: 'F', text: '¿Le cuesta sacarse de la cabeza el zumbido y concentrarse en otra cosa?' },
    { n: 19, tipo: 'C', text: '¿Siente que no puede controlar el zumbido de oído?' },
    { n: 20, tipo: 'F', text: '¿Se siente a menudo cansado por culpa del zumbido de oído?' },
    { n: 21, tipo: 'E', text: '¿Se siente deprimido por causa del zumbido de oído?' },
    { n: 22, tipo: 'E', text: '¿Lo pone nervioso el zumbido de oído?' },
    { n: 23, tipo: 'C', text: '¿Siente que ya no puede hacerle frente al zumbido de oído?' },
    { n: 24, tipo: 'F', text: '¿Empeora el zumbido de oído cuando está estresado?' },
    { n: 25, tipo: 'E', text: '¿Se siente inseguro por culpa del zumbido de oído?' },
];

const OPTIONS = [
    { label: 'Sí', value: 4 },
    { label: 'A veces', value: 2 },
    { label: 'No', value: 0 },
];

// Grados de severidad según el THI (rangos del PDF de referencia)
export const getTHIGrade = (total) => {
    if (total <= 16) return { grade: 'Leve', level: 1, color: '#34C759', desc: 'Solo se percibe en ambiente silencioso; fácilmente enmascarable.' };
    if (total <= 36) return { grade: 'Mediano', level: 2, color: '#30C0D8', desc: 'Enmascarable por el ruido ambiente.' };
    if (total <= 56) return { grade: 'Moderado', level: 3, color: '#FFCC00', desc: 'Se percibe a pesar del ruido ambiente, sin impedir actividades diarias.' };
    if (total <= 76) return { grade: 'Severo', level: 4, color: '#FF9500', desc: 'Siempre presente; interfiere con las actividades diarias y el sueño.' };
    return { grade: 'Catastrófico', level: 5, color: '#FF3B30', desc: 'Impacto máximo; se recomienda valoración profesional.' };
};

const THIQuestionnaire = ({ onClose, onComplete, previousTHI, matchedFrequency }) => {
    const [answers, setAnswers] = useState({}); // { [n]: value }
    const [result, setResult] = useState(null);
    // Freeze the previous score at mount so the delta doesn't reset to 0 after submit
    const [baseline] = useState(previousTHI);

    const answeredCount = Object.keys(answers).length;
    const allAnswered = answeredCount === QUESTIONS.length;

    const selectAnswer = (n, value) => {
        setAnswers(prev => ({ ...prev, [n]: value }));
    };

    const computeResult = () => {
        let total = 0, functional = 0, emotional = 0, catastrophic = 0;
        QUESTIONS.forEach(q => {
            const v = answers[q.n] || 0;
            total += v;
            if (q.tipo === 'F') functional += v;
            else if (q.tipo === 'E') emotional += v;
            else if (q.tipo === 'C') catastrophic += v;
        });
        const { grade } = getTHIGrade(total);
        return { total, grade, functional, emotional, catastrophic, answers };
    };

    const handleSubmit = () => {
        if (!allAnswered) return;
        const res = computeResult();
        setResult(res);
        if (onComplete) onComplete(res);
    };

    const gradeInfo = useMemo(() => result ? getTHIGrade(result.total) : null, [result]);

    // Comparación con test anterior para ver evolución
    const delta = (result && baseline && typeof baseline.total === 'number')
        ? result.total - baseline.total
        : null;

    if (result && gradeInfo) {
        return (
            <div className="thi-container animate-fade">
                <header className="thi-header">
                    <button className="thi-back-btn" onClick={onClose}>
                        <ChevronLeft />
                    </button>
                    <h2>Resultado THI e Informe Clínico</h2>
                </header>

                <THIResultSummary 
                    thiResult={result} 
                    matchedFrequency={matchedFrequency} 
                    onProceedToPlan={() => {
                        if (onComplete) onComplete(result, true);
                        if (onClose) onClose();
                    }}
                />
            </div>
        );
    }

    return (
        <div className="thi-container animate-fade">
            <header className="thi-header">
                <button className="thi-back-btn" onClick={onClose}>
                    <ChevronLeft />
                </button>
                <h2>Test de Impacto (THI)</h2>
            </header>

            <div className="thi-intro">
                <div className="thi-intro-icon"><ClipboardList size={22} /></div>
                <p>Responde las 25 preguntas según cómo te afecta el zumbido. Esto mide el impacto de tu tinnitus para dar seguimiento científico a tu evolución.</p>
            </div>

            <div className="thi-progress">
                <div className="thi-progress-bar">
                    <div className="thi-progress-fill" style={{ width: `${(answeredCount / QUESTIONS.length) * 100}%` }} />
                </div>
                <span className="thi-progress-label">{answeredCount} / {QUESTIONS.length}</span>
            </div>

            <div className="thi-questions">
                {QUESTIONS.map(q => (
                    <div key={q.n} className={`thi-question ${answers[q.n] !== undefined ? 'answered' : ''}`}>
                        <p className="thi-q-text"><span className="thi-q-num">{q.n}.</span> {q.text}</p>
                        <div className="thi-options">
                            {OPTIONS.map(opt => (
                                <button
                                    key={opt.label}
                                    className={`thi-option ${answers[q.n] === opt.value ? 'selected' : ''}`}
                                    onClick={() => selectAnswer(q.n, opt.value)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <footer className="thi-footer">
                <button
                    className="btn btn-primary full-width"
                    onClick={handleSubmit}
                    disabled={!allAnswered}
                >
                    {allAnswered ? <>Ver mi resultado <Check size={20} /></> : `Responde todas (${answeredCount}/${QUESTIONS.length})`}
                </button>
            </footer>
        </div>
    );
};

export default THIQuestionnaire;
