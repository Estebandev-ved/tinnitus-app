import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import './StatisticsChart.css';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="tooltip-date">{new Date(label).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}</p>
                {payload.map((entry, index) => (
                    <p key={index} style={{ color: entry.color }}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const StatisticsChart = ({ data }) => {
    // Format data for Recharts if needed, or assume it's passed correctly
    // Expecting data: [{ date: '2023-01-01', tinnitusLevel: 50, stressLevel: 30 }, ...]

    if (!data || data.length === 0) {
        return (
            <div className="empty-chart-state">
                <p>Registra más días para ver tu evolución gráfica.</p>
            </div>
        );
    }

    // Sort data strictly by date
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

    return (
        <div className="chart-container">
            <h4>Tendencias (Últimos 7 días)</h4>
            <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={sortedData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorTinnitus" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#FF3B30" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#FF3B30" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#FF9500" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#FF9500" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(str) => new Date(str).toLocaleDateString('es-ES', { weekday: 'narrow' })}
                            tick={{ fontSize: 12, fill: '#8E8E93' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip content={<CustomTooltip />} />

                        <Area
                            type="monotone"
                            dataKey="tinnitusLevel"
                            name="Zumbido"
                            stroke="#FF3B30"
                            fillOpacity={1}
                            fill="url(#colorTinnitus)"
                            strokeWidth={2}
                        />
                        <Area
                            type="monotone"
                            dataKey="stressLevel"
                            name="Estrés"
                            stroke="#FF9500"
                            fillOpacity={1}
                            fill="url(#colorStress)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <div className="chart-legend">
                <div className="legend-item"><span className="dot tinnitus"></span> Zumbido</div>
                <div className="legend-item"><span className="dot stress"></span> Estrés</div>
            </div>
        </div>
    );
};

export default StatisticsChart;
