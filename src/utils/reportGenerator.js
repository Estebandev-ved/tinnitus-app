
export const generateDoctorReport = (user, medicalProfile, weeklyLogs, progressNotes, matchedFrequency) => {
    const date = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

    // Calculate Averages
    const avgTinnitus = weeklyLogs.length > 0
        ? (weeklyLogs.reduce((acc, curr) => acc + curr.tinnitusLevel, 0) / weeklyLogs.length).toFixed(1)
        : 0;
    const avgStress = weeklyLogs.length > 0
        ? (weeklyLogs.reduce((acc, curr) => acc + curr.stressLevel, 0) / weeklyLogs.length).toFixed(1)
        : 0;
    const avgSleep = weeklyLogs.length > 0
        ? (weeklyLogs.reduce((acc, curr) => acc + curr.sleepHours, 0) / weeklyLogs.length).toFixed(1)
        : 0;

    // Generate SVG Charts (Simple Line Charts)
    const generateChart = (data, key, color, maxVal) => {
        if (!data || data.length === 0) return '<p>No hay datos suficientes para generar la gráfica.</p>';

        const width = 600;
        const height = 150;
        const padding = 20;
        const usefulWidth = width - padding * 2;
        const usefulHeight = height - padding * 2;

        // Sort by date ascending
        const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

        const points = sortedData.map((d, i) => {
            const x = padding + (i / (sortedData.length - 1 || 1)) * usefulWidth;
            const val = d[key] || 0;
            const y = height - padding - (val / maxVal) * usefulHeight;
            return `${x},${y}`;
        }).join(' ');

        return `
            <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" style="background: #f9f9f9; border-radius: 8px;">
                <!-- Grid Lines -->
                <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" stroke="#eee" stroke-width="1" />
                <line x1="${padding}" y1="${height / 2}" x2="${width - padding}" y2="${height / 2}" stroke="#eee" stroke-width="1" />
                <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#eee" stroke-width="1" />
                
                <!-- Line -->
                <polyline points="${points}" fill="none" stroke="${color}" stroke-width="3" />
                
                <!-- Dots & Labels -->
                ${sortedData.map((d, i) => {
            const x = padding + (i / (sortedData.length - 1 || 1)) * usefulWidth;
            const val = d[key] || 0;
            const y = height - padding - (val / maxVal) * usefulHeight;
            return `
                        <circle cx="${x}" cy="${y}" r="4" fill="${color}" />
                        <text x="${x}" y="${height - 5}" font-size="10" text-anchor="middle" fill="#666">
                            ${new Date(d.date).getDate()}/${new Date(d.date).getMonth() + 1}
                        </text>
                        <text x="${x}" y="${y - 10}" font-size="10" text-anchor="middle" fill="#333" font-weight="bold">${val}</text>
                    `;
        }).join('')}
            </svg>
        `;
    };

    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>Reporte Clínico Tinnitus - ${user.displayName}</title>
        <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px; }
            header { border-bottom: 2px solid #007AFF; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .brand { color: #007AFF; font-size: 24px; font-weight: bold; }
            .report-date { color: #666; font-size: 14px; }
            h1 { font-size: 28px; margin-bottom: 10px; color: #1C1C1E; }
            h2 { font-size: 18px; color: #007AFF; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
            .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
            .stat-card { background: #F2F2F7; padding: 15px; border-radius: 12px; text-align: center; }
            .stat-val { font-size: 24px; font-weight: bold; color: #1C1C1E; display: block; }
            .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; }
            th, td { text-align: left; padding: 12px; border-bottom: 1px solid #eee; }
            th { color: #666; font-weight: 600; background: #f9f9f9; }
            .medical-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 14px; background: #fff; border: 1px solid #eee; padding: 20px; border-radius: 12px; }
            .info-item strong { display: block; color: #666; font-size: 12px; margin-bottom: 4px; }
            .footer { margin-top: 50px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
            .note-item { background: #fff; border: 1px solid #eee; padding: 10px; border-radius: 8px; margin-bottom: 10px; }
            .note-date { font-size: 11px; color: #999; display: block; margin-bottom: 4px; }
            
            @media print {
                body { padding: 0; }
                .no-print { display: none; }
                .stat-card { border: 1px solid #ddd; }
            }
        </style>
    </head>
    <body>
        <header>
            <div class="brand">TinnitOff</div>
            <div class="report-date">Generado: ${date}</div>
        </header>

        <h1>Reporte de Progreso del Paciente</h1>
        <p><strong>Paciente:</strong> ${user.displayName || 'No registrado'}</p>
        <p><strong>ID:</strong> ${user.uid}</p>

        <h2>Perfil Médico</h2>
        <div class="medical-info">
            <div class="info-item"><strong>Años con Tinnitus:</strong> ${medicalProfile?.years || 'No especificado'}</div>
            <div class="info-item"><strong>Oído Afectado:</strong> ${medicalProfile?.ear || 'No especificado'}</div>
            <div class="info-item"><strong>Doctor Tratante:</strong> ${medicalProfile?.doctor || 'No registrado'}</div>
            <div class="info-item"><strong>Frecuencia Igualada:</strong> ${matchedFrequency ? matchedFrequency + ' Hz' : 'No realizada'}</div>
            <div class="info-item" style="grid-column: span 2;"><strong>Medicamentos:</strong> ${medicalProfile?.medications || 'Ninguno'}</div>
        </div>

        <h2>Resumen Semanal (Últimos 7 días)</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <span class="stat-val">${avgTinnitus}/100</span>
                <span class="stat-label">Nivel Promedio Tinnitus</span>
            </div>
            <div class="stat-card">
                <span class="stat-val">${avgStress}/100</span>
                <span class="stat-label">Nivel Promedio Estrés</span>
            </div>
            <div class="stat-card">
                <span class="stat-val">${avgSleep}h</span>
                <span class="stat-label">Promedio de Sueño</span>
            </div>
        </div>

        <h2>Evolución del Tinnitus</h2>
        ${generateChart(weeklyLogs, 'tinnitusLevel', '#FF3B30', 100)}

        <h2>Evolución del Estrés</h2>
        ${generateChart(weeklyLogs, 'stressLevel', '#FF9500', 100)}

        <h2>Registros Detallados</h2>
        <table>
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Nivel Tinnitus</th>
                    <th>Nivel Estrés</th>
                    <th>Sueño</th>
                    <th>Notas</th>
                </tr>
            </thead>
            <tbody>
                ${weeklyLogs.length > 0 ? weeklyLogs.map(log => `
                    <tr>
                        <td>${new Date(log.date).toLocaleDateString('es-ES')}</td>
                        <td>${log.tinnitusLevel}/100</td>
                        <td>${log.stressLevel}/100</td>
                        <td>${log.sleepHours}h</td>
                        <td>${log.notes || '-'}</td>
                    </tr>
                `).join('') : '<tr><td colspan="5">No hay registros esta semana.</td></tr>'}
            </tbody>
        </table>

        <h2>Notas de Progreso Recientes</h2>
        ${progressNotes && progressNotes.length > 0 ? progressNotes.slice(0, 5).map(note => `
            <div class="note-item">
                <span class="note-date">${new Date(note.timestamp || note.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} - Estado: ${note.mood || 'N/A'}</span>
                <p style="margin: 0;">${note.text}</p>
            </div>
        `).join('') : '<p>No hay notas de progreso registradas.</p>'}

        <div class="footer">
            <p>Este reporte fue generado automáticamente por la aplicación TinnitOff.</p>
            <p>La información aquí presentada está basada en el auto-reporte del paciente y no constituye un diagnóstico médico.</p>
        </div>

        <script>
            window.onload = function() {
                setTimeout(function() {
                    window.print();
                }, 500);
            }
        </script>
    </body>
    </html>
    `;

    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
};
