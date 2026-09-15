const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

function traverse(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            traverse(fullPath);
        } else if (file.endsWith('.css')) {
            processCssFile(fullPath);
        }
    }
}

function processCssFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Reemplazar fondos oscuros hardcodeados por variables de arcilla/superficies terapéuticas
    content = content.replace(/rgba\(17,\s*29,\s*50,\s*[\d\.]+\)/g, 'var(--clay-bg-dark)');
    content = content.replace(/rgba\(17,\s*29,\s*50\)/g, 'var(--clay-bg-dark)');
    content = content.replace(/rgba\(11,\s*20,\s*38,\s*[\d\.]+\)/g, 'var(--surface-raised)');
    content = content.replace(/rgba\(11,\s*20,\s*38\)/g, 'var(--surface-raised)');
    
    content = content.replace(/rgba\(10,\s*16,\s*32,\s*[\d\.]+\)/g, 'var(--clay-bg-dark)');
    content = content.replace(/rgba\(10,\s*16,\s*32\)/g, 'var(--clay-bg-dark)');
    content = content.replace(/rgba\(5,\s*10,\s*18,\s*[\d\.]+\)/g, 'var(--surface-raised)');
    content = content.replace(/rgba\(5,\s*10,\s*18\)/g, 'var(--surface-raised)');

    // 2. Reemplazar colores de texto hardcodeados de tema oscuro por variables (para asegurar contraste en tema claro)
    content = content.replace(/color:\s*#E8EDF4/gi, 'color: var(--text-main)');
    content = content.replace(/color:\s*#E6EDF3/gi, 'color: var(--text-main)');
    content = content.replace(/color:\s*#8899B0/gi, 'color: var(--text-secondary)');
    content = content.replace(/color:\s*#5A6D85/gi, 'color: var(--text-muted)');
    
    // 3. Modificar bordes y luces de acento azules legados para adaptarse al nuevo tema
    content = content.replace(/rgba\(10,\s*132,\s*255,\s*0\.15\)/g, 'rgba(44, 62, 68, 0.12)');
    content = content.replace(/rgba\(10,\s*132,\s*255,\s*0\.1\)/g, 'rgba(44, 62, 68, 0.08)');
    content = content.replace(/rgba\(10,\s*132,\s*255,\s*0\.2\)/g, 'rgba(223, 213, 230, 0.45)');
    content = content.replace(/#0A84FF/gi, 'var(--primary-dark)');
    content = content.replace(/#007AFF/gi, '#8C789B'); // Cambiar azul legado a lavanda profundo
    content = content.replace(/#00E5FF/gi, '#DFD5E6'); // Cambiar cyan legado a lavanda
    
    // 4. Corregir burbujas de chat específicas para legibilidad
    if (filePath.endsWith('AIChat.css')) {
        // En AIChat.css, forzar que la burbuja del bot sea legible
        content = content.replace(
            /\.message-bubble\.bot\s+\.bubble-content\s*\{([^}]+)\}/g,
            `.message-bubble.bot .bubble-content {
    background: var(--clay-bg-surface);
    color: var(--text-main);
    border-bottom-left-radius: 4px;
    border: 1px solid rgba(44, 62, 68, 0.08);
}`
        );
        content = content.replace(
            /\.message-bubble\.user\s+\.bubble-content\s*\{([^}]+)\}/g,
            `.message-bubble.user .bubble-content {
    background: var(--primary);
    color: var(--text-main);
    font-weight: 600;
    border-bottom-right-radius: 4px;
}`
        );
        content = content.replace(
            /background:\s*rgba\(255,\s*255,\s*255,\s*0\.03\);/gi,
            'background: var(--surface);'
        );
        content = content.replace(
            /border:\s*1px\s*solid\s*rgba\(255,\s*255,\s*255,\s*0\.08\);/gi,
            'border: 1px solid rgba(44, 62, 68, 0.1);'
        );
        content = content.replace(
            /color:\s*#FFF;/gi,
            'color: var(--text-main);'
        );
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[UPDATED] ${path.relative(srcDir, filePath)}`);
    }
}

console.log('Iniciando limpieza y normalización de CSS terapéutico...');
traverse(srcDir);
console.log('¡Limpieza CSS completada con éxito!');
