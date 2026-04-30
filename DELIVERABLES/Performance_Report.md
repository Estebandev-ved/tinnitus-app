# Performance Report (60fps Data Viz)
- Downsampling: Limitar a 100 puntos en móviles, 300 en desktop.
- SVG Nodes: Max 500 DOM nodes simultáneos.
- Three.js: Usar InstancedMesh para Scatter3D si hay > 1000 data points.
- Off-thread: Usar WebWorkers para `correlationAnalyzer.js` si data > 1MB.
