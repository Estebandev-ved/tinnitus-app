import React from 'react';
// Usa html2canvas / dom-to-image
export const ChartExporter = ({ chartRef }) => (
  <button onClick={() => alert('Exporting to PNG...')} className="btn btn-ghost" aria-label="Exportar gráfico">
    ⬇️ Descargar PNG
  </button>
);
