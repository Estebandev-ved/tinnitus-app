# Play Store Submission Checklist — TinnitOff

## Estado: En progreso (meta: 1 junio 2026)

---

## 1. Assets Gráficos

| Asset | Tamaño | Estado |
|-------|--------|--------|
| Ícono de la app | 512x512 PNG (Play Store lo escala) | ✅ generado en `assets/icon-only.png` |
| Feature Graphic | 1024x500 PNG/JPG | ⬜ pendiente |
| Screenshots teléfono | Min 2, max 8 · 16:9 o 9:16 · mín 320dp | ⬜ pendiente |
| Screenshots tablet 7" | Opcional pero recomendado | ⬜ pendiente |

### Cómo capturar screenshots
1. `npm run android:debug-apk` — instala en dispositivo/emulador
2. Navega a cada pantalla clave (lista abajo)
3. Usa Android Studio → Device Manager → Screenshot, o `adb shell screencap`
4. Exporta en 1080×1920 px mínimo

### Pantallas a capturar (orden sugerido)
1. **Home / Dashboard** — racha + resumen del día
2. **Sonidos personalizados** — mezclador de ruido
3. **Sesión guiada** — reproductor activo
4. **Progreso** — gráfico de tendencias
5. **Chat IA** — conversación con asistente
6. **Respiración guiada** — animación en curso
7. **Onboarding** — primera pantalla de bienvenida
8. **Perfil / Logros** — badges desbloqueados

### Feature Graphic (1024x500)
Usar Canva o Figma. Elementos sugeridos:
- Fondo degradado #0A1628 → #1a3a6e
- Logo TinnitOff centrado a la izquierda
- Mock de pantalla del app a la derecha (inclinado ~10°)
- Tagline: "Terapia para acúfenos en tu bolsillo"
- Acento teal #00C2B8

---

## 2. Ficha de la tienda (Store Listing)

### Nombre de la app
`TinnitOff - Terapia Acúfenos`  *(máx 30 chars)*

### Descripción corta (80 chars)
`Terapia sonora, IA y seguimiento para vivir mejor con tinnitus.`

### Descripción larga (4000 chars max)
```
TinnitOff es tu compañero diario para el manejo del tinnitus (acúfenos). 
Desarrollada con base en terapia cognitivo-conductual (TCC) y técnicas de 
habituación sonora, te ayuda a reducir el impacto del tinnitus en tu vida.

🎵 SONIDOS TERAPÉUTICOS
Mezcla ruido blanco, lluvia, café y más de 12 ambientes sonoros. 
Ajusta frecuencias para encontrar tu tono de alivio personalizado.

🤖 ASISTENTE IA
Chat con IA especializada en tinnitus: estrategias de manejo, 
psicoeducación y apoyo emocional disponible 24/7.

📊 SEGUIMIENTO INTELIGENTE
Registra intensidad, estrés y sueño diariamente. 
Detecta patrones y predice días difíciles antes de que lleguen.

🧘 SESIONES GUIADAS
Programas de 6 semanas basados en TCC. Ejercicios de respiración, 
mindfulness y relajación muscular progresiva.

🏆 SISTEMA DE LOGROS
Mantén rachas, desbloquea logros y side quests. 
El camino terapéutico se vuelve más llevadero con pequeñas victorias.

👥 COMUNIDAD
Conecta con otros usuarios, comparte experiencias y encuentra apoyo.

⚠️ AVISO: TinnitOff es una herramienta de apoyo complementario. 
No reemplaza la consulta médica profesional.
```

### Categoría
Salud y bienestar

### Clasificación de contenido
PEGI 3 / Everyone

### Palabras clave (para ASO)
tinnitus, acúfenos, ruido blanco, terapia sonora, tinnitus relief, 
white noise, sound therapy, tinnitus management

---

## 3. Información técnica

| Campo | Valor |
|-------|-------|
| Application ID | com.tinnitoff.app |
| Version name | 1.0 |
| Version code | 1 |
| Min SDK | 22 (Android 5.1) |
| Target SDK | 34 (Android 14) |
| Permisos declarados | RECORD_AUDIO, CAMERA, INTERNET, NOTIFICATIONS |

---

## 4. Requisitos legales

- [x] Política de Privacidad — componente `PrivacyPolicy.jsx` + URL pública requerida
- [x] Aviso Médico — componente `MedicalDisclaimer.jsx`
- [ ] URL de política de privacidad en Play Console (necesitas hosting)
  - Opción rápida: publica la política en Firebase Hosting → `firebase deploy --only hosting`
  - URL resultante: `https://[tu-proyecto].web.app/privacy`
- [ ] Safety section en Play Console (declarar uso de cámara/micrófono)
- [ ] Formulario de clasificación de contenido (Play Console → Clasificación)

---

## 5. Proceso de build y subida

```bash
# 1. Generar keystore (solo primera vez)
node scripts/create-keystore.cjs

# 2. Build release
npm run android:release
# Genera: android/app/build/outputs/bundle/release/app-release.aab

# 3. Subir a Play Console
# Play Console → Producción → Crear nueva versión → subir .aab
```

---

## 6. Pendientes antes del launch

- [ ] Crear cuenta Google Play Developer ($25 USD, pago único)
- [ ] Crear app en Play Console con bundle ID `com.tinnitoff.app`
- [ ] Publicar Privacy Policy en URL accesible (Firebase Hosting)
- [ ] Completar formulario de Safety Section
- [ ] Completar clasificación de contenido
- [ ] Subir todos los screenshots
- [ ] Subir Feature Graphic
- [ ] Hacer internal testing con 1-2 dispositivos reales
- [ ] Publish → revisión de Google (típicamente 1-3 días)
