// Generates assets/icon-only.png (1024x1024) and assets/splash.png (2732x2732)
// Design: dark navy bg, white ear/wave icon, teal accent — TinnitOff brand
const sharp = require('../node_modules/sharp');
const path = require('path');

const ICON_SIZE = 1024;
const SPLASH_SIZE = 2732;

// SVG icon: ear silhouette + sound wave rings, teal on transparent
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ICON_SIZE}" height="${ICON_SIZE}" viewBox="0 0 1024 1024">
  <!-- Background circle -->
  <circle cx="512" cy="512" r="512" fill="#0A1628"/>

  <!-- Sound wave arcs (left side) -->
  <path d="M 300 512 Q 300 340 420 240" stroke="#00C2B8" stroke-width="28" fill="none" stroke-linecap="round"/>
  <path d="M 260 512 Q 260 300 400 180" stroke="#00C2B8" stroke-width="20" fill="none" stroke-linecap="round" opacity="0.6"/>
  <path d="M 220 512 Q 220 260 380 120" stroke="#00C2B8" stroke-width="14" fill="none" stroke-linecap="round" opacity="0.35"/>

  <!-- Ear shape (center) -->
  <ellipse cx="530" cy="480" rx="110" ry="150" fill="none" stroke="white" stroke-width="36"/>
  <ellipse cx="530" cy="520" rx="58" ry="78" fill="none" stroke="white" stroke-width="28"/>
  <line x1="530" y1="598" x2="530" y2="660" stroke="white" stroke-width="32" stroke-linecap="round"/>

  <!-- Dot accent -->
  <circle cx="530" cy="530" r="20" fill="#00C2B8"/>
</svg>`;

// SVG splash: centered logo on gradient
const splashSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SPLASH_SIZE}" height="${SPLASH_SIZE}" viewBox="0 0 2732 2732">
  <rect width="2732" height="2732" fill="#0A1628"/>
  <circle cx="1366" cy="1300" r="380" fill="#0E1F3D"/>

  <!-- Sound waves -->
  <path d="M 1050 1300 Q 1050 1050 1220 900" stroke="#00C2B8" stroke-width="40" fill="none" stroke-linecap="round"/>
  <path d="M 990 1300 Q 990 980 1180 800" stroke="#00C2B8" stroke-width="28" fill="none" stroke-linecap="round" opacity="0.6"/>

  <!-- Ear -->
  <ellipse cx="1390" cy="1280" rx="160" ry="210" fill="none" stroke="white" stroke-width="52"/>
  <ellipse cx="1390" cy="1330" rx="84" ry="112" fill="none" stroke="white" stroke-width="40"/>
  <line x1="1390" y1="1442" x2="1390" y2="1524" stroke="white" stroke-width="46" stroke-linecap="round"/>
  <circle cx="1390" cy="1340" r="28" fill="#00C2B8"/>

  <!-- App name -->
  <text x="1366" y="1820" font-family="system-ui, -apple-system, sans-serif" font-size="148" font-weight="700"
    fill="white" text-anchor="middle" letter-spacing="8">TinnitOff</text>
  <text x="1366" y="1930" font-family="system-ui, -apple-system, sans-serif" font-size="68"
    fill="#00C2B8" text-anchor="middle" letter-spacing="4">Terapia para acúfenos</text>
</svg>`;

async function generate() {
  await sharp(Buffer.from(iconSvg))
    .png()
    .toFile(path.join(__dirname, '../assets/icon-only.png'));
  console.log('✓ assets/icon-only.png');

  await sharp(Buffer.from(splashSvg))
    .png()
    .toFile(path.join(__dirname, '../assets/splash.png'));
  console.log('✓ assets/splash.png');
}

generate().catch(console.error);
