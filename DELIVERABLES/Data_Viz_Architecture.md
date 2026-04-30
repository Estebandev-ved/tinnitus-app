# Data Visualization Architecture
- Recharts (2D): Usado para Heatmap y RadarChart por velocidad 2D y accesibilidad SVG nativa.
- Three.js/React Three Fiber (3D): Usado para Scatter3D (Sueño vs Estrés vs Tinnitus).
- Cliente-side Export: html2canvas o saveSvgAsPng para descargas PNG/PDF sin servidor.
- Responsive: Wrappers ResponsiveContainer en Recharts para escalar auto a móviles.
- Performance: Memoization de data y downsampling de arrays grandes para 60fps constantes.
