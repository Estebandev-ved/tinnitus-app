# Tareas – security-agent

## Pendientes
- [ ] SEC-16 · P1 · Los `@SpringBootTest` existentes usan la Postgres local (`application.properties` datasource) en vez de H2: aislar con `src/test/resources` o perfil `test`. Limpiar filas de prueba que dejo `FirebaseLoginSecurityTest` en `tinnitusdb` (usuarios `fb_uid-admin-1`, `fb_uid-user-1/2/3`, `fb_uid-unver-1`) antes de aislar los tests.
- [ ] SEC-05 · P1 · Revisar `backend/.../SecurityConfig`, JWT (TTL 15 min/7 días), CORS sin `*`, y que ningún endpoint de salud omita validación de propiedad.
- [ ] SEC-06 · P1 · Auditar `localStorage`: 16 usos relacionados con token/key/azure. Nada sensible ni de salud (ver security.md §3).
- [ ] SEC-07 · P1 · Logs: confirmar que no se registran datos de salud, tokens ni PII (frontend `console.*` y backend `logger`).
- [ ] SEC-08 · P2 · `npm audit` y revisión de dependencias Maven; proponer actualizaciones.
- [ ] SEC-09 · P2 · Comprobar que `uploads/`, `.env*`, claves de Firebase Admin y `*.jks` no estén versionados.
- [ ] SEC-10 · P0 🧑 · Desplegar reglas corregidas (`firebase deploy --only firestore:rules`) — requiere confirmación del usuario.
- [ ] SEC-12 · P1 · Handoff — `web/` (`FirestoreService.generateCaregiverCode`) escribe `caregiver_codes/{code}` y `users/{uid}/meta/caregiver`: `caregiver_codes` esta bloqueada por la regla final (falla hoy y tras el deploy igual). Decidir coleccion/reglas antes de habilitar el modo cuidador web.
- [ ] SEC-13 · P2 · `OnboardingWizard.jsx` llama `saveUserMetadata({onboardingCompleted,...})` que solo persiste email/displayName/photoURL (y sobrescribe con null). Bug funcional menor (frontend-qa).
- [ ] SEC-14 · P2 · Clave API de Firebase incrustada en `public/download.html` (publica por diseno; restringirla por dominio/API en Google Cloud) y moderacion de posts por admin (delete) en reglas si compliance lo pide.

## Hechas
- [x] SEC-17 (handoff AI-05) · P1 · Historial de `POST /api/v1/ai/chat`: nuevo `AiConversationSanitizer`; solo roles user/assistant (cliente envia `user`/`bot`), otro emisor -> 400 INVALID_HISTORY antes de consumir cuota; max 20 mensajes, 2000 chars; se quitan caracteres de control; el rol system lo fija solo el servidor. 6 tests unitarios puros. (hecho 2026-10-12)
- [x] SEC-15 (= AI-10) · P0 · `/auth/firebase-login` verifica el ID token de Firebase (Authorization: Bearer, Firebase Admin via `FirebaseTokenVerifier.verifyClaims`); uid/email SOLO del token, body ignorado; 401 si falta/invalido; admin solo si `email_verified` y email == `app.admin.email`; enlace por email solo para la cuenta admin sembrada; cuentas `fb_*` con password aleatoria (antes = uid, publico) y bloqueadas en `/auth/login`. Cliente `web/` (authService + 2 contextos) envia `getIdToken()`. Tests: `FirebaseLoginSecurityTest` (7). NOTA: ultima ejecucion de tests con BD H2 aislada NO completada (bloqueada por el permiso del entorno). Pendiente: desplegar backend (usuario). (hecho 2026-09-29)
- [x] SEC-01 · P0 · Escalada a admin — reglas `users/{userId}` separadas en read/create/update/delete; dueño no puede fijar ni cambiar `role` (create: ausente o 'user'; update: igual al almacenado); admins existentes conservan acceso total. Subcolección cambiada a `/users/{userId}/{sub}/{document=**}` para que no cubra el doc raíz (bypass por OR). Sintaxis validada cargando las reglas en el emulador de Firestore. Pendiente de despliegue: SEC-10. (hecho 2026-09-28)
- [x] SEC-11 · Cliente ya no envia `role` (App.jsx x2, FirestoreService.saveUserMetadata); nada mas escribe `role` en users/{uid}. (hecho 2026-09-29)
- [x] SEC-02 · download_logs/analytics/events: create-only con campos/tipos/tamanos que envia el cliente (analytics: increment +1); sin update/delete publicos. (hecho 2026-09-29)
- [x] SEC-03 · caregiverLinks: create exige patientId o caregiverId == uid; update no cambia la pareja (ningun cliente escribe aqui hoy). (hecho 2026-09-29)
- [x] SEC-04 · tests con emulador en tests/firestore-rules/firestore-rules.emulator.js, `npm run test:rules` (28/28). (hecho 2026-09-29)
