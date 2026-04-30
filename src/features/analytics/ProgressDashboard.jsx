import React, { useEffect, useState } from 'react';
import { HeatmapChart } from './components/HeatmapChart';
import { RadarChart } from './components/RadarChart';
import { Scatter3D } from './components/Scatter3D';
import { FlowDiagram } from './components/FlowDiagram';
import { processDataForHeatmap, processDataForRadar } from './services/dataProcessor';
import { FirestoreService } from '../../services/firestoreService';
import { useAuth } from '../../contexts/AuthContext';

export const ProgressDashboard = () => {
  const { currentUser } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (currentUser) {
        try {
          const recentLogs = await FirestoreService.getWeeklyLogs(currentUser.uid);
          setLogs(recentLogs);
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    };
    loadData();
  }, [currentUser]);

  if (loading) return <div style={{padding: '20px'}}>Cargando gráficas...</div>;

  const heatData = logs.length ? processDataForHeatmap(logs) : [{day: 'L', hour: '12', level: 2}];
  const radarData = logs.length ? processDataForRadar(logs) : [
    { subject: 'Sueño', A: 7 }, { subject: 'Estrés', A: 4 }, { subject: 'Tinnitus', A: 5 }, { subject: 'Hidratación', A: 5 }, { subject: 'Actividad', A: 6 }
  ];

  return (
    <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
      
      <div style={{ background: '#1c1c1e', padding: '15px', borderRadius: '12px' }}>
        <h3 style={{color:'white', marginBottom:'10px'}}>Heatmap: Horarios de Intensidad</h3>
        <HeatmapChart data={heatData} />
      </div>

      <div style={{ background: '#1c1c1e', padding: '15px', borderRadius: '12px' }}>
        <h3 style={{color:'white', marginBottom:'10px'}}>Radar Semanal</h3>
        <RadarChart data={radarData} />
      </div>

      <div style={{ background: '#1c1c1e', padding: '15px', borderRadius: '12px' }}>
        <h3 style={{color:'white', marginBottom:'10px'}}>3D Scatter (Sueño vs Estrés vs Tinnitus)</h3>
        <Scatter3D data={logs} />
      </div>

      <div style={{ background: '#1c1c1e', padding: '15px', borderRadius: '12px' }}>
        <h3 style={{color:'white', marginBottom:'10px'}}>Diagrama de Flujo (Correlaciones)</h3>
        <FlowDiagram data={logs} />
      </div>

    </div>
  );
};
