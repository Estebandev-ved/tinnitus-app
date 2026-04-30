import React, { useState } from 'react';
import { MetricCard } from './MetricCard';
import { DraggableSection } from './DraggableSection';
import { InsightCard } from './InsightCard';
import { QuickActionFAB } from './QuickActionFAB';
import '../Styles/dashboard.css';
import '../Styles/responsive_breakpoints.css';

export const DashboardLayout = () => {
  const [metrics, setMetrics] = useState([
    { id: 'm1', title: 'Tinnitus Level', value: '4/10', status: 'Improving', colorKey: 'low' },
    { id: 'm2', title: 'Sleep Quality', value: '7h 12m', status: 'Good', colorKey: 'good' },
    { id: 'm3', title: 'Streak', value: '14 Days', status: 'Active', colorKey: 'active' }
  ]);

  return (
    <main className="dashboard-grid" role="main">
      <DraggableSection id="metrics-scroll" title="Key Metrics" isDraggable={true}>
        <div className="scroll-container anim-stagger-1" role="region" aria-label="Metrics Horizontal Scroll">
          {metrics.map((m, index) => (
            <MetricCard 
              key={m.id}
              title={m.title}
              value={m.value}
              status={m.status}
              colorKey={m.colorKey}
              animationDelayClass={`anim-stagger-${index + 1}`}
            />
          ))}
        </div>
      </DraggableSection>
      
      <InsightCard 
        insightText="Consistent sleep patterns are correlating with lower tinnitus levels this week." 
        date={new Date().toLocaleDateString()}
      />
      
      <QuickActionFAB onClick={() => console.log('FAB Clicked')} />
    </main>
  );
};
