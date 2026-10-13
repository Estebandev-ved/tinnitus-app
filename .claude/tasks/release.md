# Tareas – release-agent

## Pendientes
- [ ] REL-01 · P0 🧑 · Confirmar versión oficial (`versionCode`/`versionName`; hoy 1 / "1.0") frente al flujo de actualización de APKs antiguos (v1.1.0 en `app_config`).
- [ ] REL-02 · P0 (PARCIAL 2026-09-28: build web OK, cap sync OK; assembleDebug bloqueado: no hay Android SDK en esta máquina, instalar Android Studio/SDK -> 🧑) · Verificar que `npm run build` + `npx cap sync android` + `gradlew assembleDebug` compilan limpio; reportar errores.
- [ ] REL-03 · P0 · Generar `.aab` de release firmado (`android:release`) y validar que el keystore se lee sin exponer secretos.
- [ ] REL-04 · P1 🧑 · Pruebas en dispositivo real y emulador (arranque, audio con Web Audio, notificaciones, sin conexión). Preparar checklist de pruebas manuales.
- [ ] REL-05 · P1 · Ficha de Play Store: título, descripción corta/larga ES/EN, revisadas contra claims médicos (coordinar con `compliance-agent`).
- [ ] REL-06 · P1 🧑 · Capturas (8 pantallas) y feature graphic 1024×500. Preparar guion de capturas; el usuario o el `design-agent` (tras rediseño) las producen.
- [ ] REL-07 · P1 🧑 · Cuenta de desarrollador de Google Play (USD 25) y plan de prueba cerrada. Verificar en la documentación oficial vigente los requisitos de testers/duración para cuentas nuevas.
- [ ] REL-08 · P1 · Plan de beta cerrada con pacientes reales: formulario de feedback, THI antes/después (4 semanas), métricas a seguir.
- [ ] REL-09 · P2 · Monitoreo en producción: revisar `monitoring/` y Crashlytics/analytics sin datos de salud.
- [ ] REL-10 · P2 🧑 · iOS: `npx cap add ios` requiere Mac con Xcode; dejar guía paso a paso.

- [ ] REL-11 · P0 🧑 · Instalar Android SDK (Android Studio) y definir `sdk.dir` en `android/local.properties` (ignorado por git) o ANDROID_HOME; luego repetir `gradlew assembleDebug` (cierra REL-02 y desbloquea REL-03).
- [ ] REL-12 · P2 · Vite: warning de chunk circular `charts -> three -> charts` y chunk vacío `react-vendor` en manualChunks; chunks >1 MB (index, three, face-api). Handoff a frontend-qa.
- [ ] REL-13 · P0 🧑 (PREPARADO 2026-10-12; falta que el usuario ejecute los pasos en Railway) · Desplegar el backend Spring Boot en Railway: Dockerfile prod multi-stage no root + `PORT`, perfil `prod` (DATABASE_URL/PG* -> JDBC, Flyway + validate, V1 Postgres regenerada), `FIREBASE_SA_JSON`, validación de variables críticas, `railway.json` (healthcheck `/actuator/health`), mvnw reparado, sección 'Railway' en DEPLOYMENT.md. Pendiente: probar la imagen con Docker (no hay Docker aquí) y el arranque contra Postgres real.

- [x] REL-14 · P1 · Volume de Railway en `/app/uploads` sin correr como root: `backend/docker-entrypoint.sh` (root solo para mkdir+chown, luego `setpriv` a uid 10001 con exec), sin `USER` en el Dockerfile, `.gitattributes` (`*.sh eol=lf`), DEPLOYMENT.md (hecho 2026-10-13). Pendiente 🧑: probar la imagen con Docker/Railway.

## Hechas
_(vacío)_
