import React from 'react';
import { Brain, Sparkles, CheckCircle2, Headphones, ArrowRight, ShieldCheck } from 'lucide-react';
import { getTHIGrade } from './THIQuestionnaire';
import { generateAIRecommendation } from '../services/aiRecommendationService';
import { useWeeklyPlan } from '../contexts/WeeklyPlanContext';
import './THIResultSummary.css';

const THIResultSummary = ({ thiResult, matchedFrequency, onProceedToPlan }) => {
  const { startNewPlan } = useWeeklyPlan();
  const gradeInfo = getTHIGrade(thiResult?.total || 0);
  const recommendation = generateAIRecommendation(thiResult, matchedFrequency);

  const handleCreatePlan = () => {
    startNewPlan(thiResult, matchedFrequency);
    if (onProceedToPlan) {
      onProceedToPlan();
    }
  };

  return (
    <div className="thi-summary-wrapper">
      <div className="thi-summary-header">
        <div className="thi-badge-pill" style={{ backgroundColor: `${gradeInfo.color}25`, color: gradeInfo.color, border: `1px solid ${gradeInfo.color}50` }}>
          <ShieldCheck size={18} />
          <span>Grado {gradeInfo.level}: {gradeInfo.grade}</span>
        </div>

        <div className="thi-score-hero">{thiResult?.total || 0} / 100</div>
        <p className="thi-score-subtext">Puntaje de Handicap Auditivo THI</p>
      </div>

      {/* Subescalas */}
      <div className="subscales-grid">
        <div className="subscale-card">
          <div className="subscale-label">Subescala Funcional</div>
          <div className="subscale-val" style={{ color: '#38bdf8' }}>{thiResult?.functional || 0} pts</div>
        </div>
        <div className="subscale-card">
          <div className="subscale-label">Subescala Emocional</div>
          <div className="subscale-val" style={{ color: '#a855f7' }}>{thiResult?.emotional || 0} pts</div>
        </div>
        <div className="subscale-card">
          <div className="subscale-label">Subescala Catastrófica</div>
          <div className="subscale-val" style={{ color: '#f43f5e' }}>{thiResult?.catastrophic || 0} pts</div>
        </div>
      </div>

      {/* Caja de Recomendación IA */}
      <div className="ai-recommendation-box">
        <div className="ai-box-title">
          <Sparkles size={22} style={{ color: '#a855f7' }} />
          <span>{recommendation.summaryTitle}</span>
        </div>
        
        <p className="ai-box-desc">{recommendation.summaryDescription}</p>

        <ul className="pillars-list">
          {recommendation.keyPillars.map((pillar, idx) => (
            <li key={idx} className="pillar-item">
              <CheckCircle2 size={16} className="pillar-icon" />
              <span>{pillar}</span>
            </li>
          ))}
        </ul>

        <div className="sound-therapy-highlight">
          <Headphones size={20} />
          <div>
            <strong>Terapia Sonora Prescrita:</strong> {recommendation.primarySoundTherapy}
          </div>
        </div>
      </div>

      <button className="start-plan-btn" onClick={handleCreatePlan}>
        <span>Generar e Iniciar Mi Plan Semanal</span>
        <ArrowRight size={20} />
      </button>
    </div>
  );
};

export default THIResultSummary;
