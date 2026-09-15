# Reglas de Seguridad y Datos de Salud – TinnitOff

## Contexto

TinnitOff maneja **datos de salud sensibles** (niveles de tinnitus, triggers, estado de ánimo,
perfiles médicos, grabaciones de audio). Estas reglas son **obligatorias** y no negociables.
Su incumplimiento puede comprometer la privacidad de los usuarios y exponer a la aplicación
a responsabilidades legales.

---

## 1. Clasificación de Datos

### Datos de Alta Sensibilidad (Máxima Protección)
- Nivel de tinnitus diario y histórico
- Triggers médicos identificados
- Estado de ánimo y notas personales
- Perfil médico completo (diagnósticos, medicamentos)
- Grabaciones de audio de sesiones terapéuticas
- Resultados de audiometría (frecuencia del tinnitus)
- Datos de tensión facial (face-api.js)

### Datos de Sensibilidad Media
- Preferencias de terapia sonora
- Racha de uso y estadísticas de sesiones
- Configuración de la app

### Datos Públicos / No Sensibles
- Nombre de usuario (solo si el usuario elige compartirlo en comunidad)
- País/región (solo para el mapa global y de forma agregada)

---

## 2. Autenticación y Autorización

### JWT (Backend Spring Boot)
- `accessToken`: TTL máximo de **15 minutos**
- `refreshToken`: TTL máximo de **7 días**, almacenado en cookie `HttpOnly` + `Secure` + `SameSite=Strict`
- **Nunca** almacenar tokens en `localStorage` (vulnerable a XSS)
- El `JwtSecret` debe ser aleatorio, mínimo 256 bits. Generarlo con:
  ```bash
  openssl rand -base64 64
  ```
- Rotar el `JwtSecret` si se sospecha compromiso; esto invalida todos los tokens activos

### Firebase Auth (Frontend)
- Usar solo los métodos oficiales del SDK: `signInWithEmailAndPassword`, `signInWithPopup`, etc.
- **Nunca** manejar contraseñas manualmente en el frontend
- Verificar el token de Firebase en el backend antes de confiar en él
- Configurar reglas de Firestore en `firestore.rules` para denegar acceso no autorizado

### Control de Acceso (Backend)
```java
// Todo endpoint de datos de salud DEBE verificar que el recurso pertenece al usuario autenticado
@GetMapping("/tinnitus-logs/{id}")
public ResponseEntity<?> getLog(@PathVariable Long id, Authentication auth) {
    TinnitusLog log = logService.findById(id);
    if (!log.getUser().getEmail().equals(auth.getName())) {
        throw new AccessDeniedException("Acceso denegado");
    }
    return ResponseEntity.ok(log);
}
```

**Regla de oro**: Un usuario solo puede ver, modificar o eliminar sus propios datos.
Los administradores solo acceden con justificación y registro de auditoría.

---

## 3. Almacenamiento Seguro de Datos

### Base de Datos (Backend)
- Las **contraseñas** siempre con BCrypt (factor de costo ≥ 12):
  ```java
  new BCryptPasswordEncoder(12).encode(rawPassword);
  ```
- Datos de salud: considerar cifrado a nivel de columna para campos críticos si el proveedor de BD no ofrece cifrado en reposo
- Backups cifrados. **Nunca** backups sin cifrar en almacenamiento accesible públicamente
- Usar conexiones SSL/TLS a la base de datos (`requireSSL=true`)

### Firebase Firestore
Las reglas en `firestore.rules` deben seguir el principio de mínimo privilegio:
```javascript
// Ejemplo: usuario solo accede a sus propios datos
match /users/{userId}/tinnitusLogs/{logId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}

// Datos de comunidad: solo lectura si autenticado
match /communityPosts/{postId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && request.auth.uid == resource.data.authorId;
}
```

### Frontend (Almacenamiento Local)
- **Preferir** almacenamiento en el servidor para datos persistentes
- Si se usa `localStorage`, solo para preferencias no sensibles (tema, idioma)
- **Nunca** en `localStorage`: tokens, datos de salud, información médica
- Para Capacitor, usar `@capacitor/preferences` para preferencias simples

---

## 4. Comunicación Segura (Transport Layer)

- **Siempre HTTPS** en producción. El backend debe forzar HTTPS.
- Configurar HSTS: `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- Certificados SSL: usar certificados válidos (Let's Encrypt, no self-signed en prod)
- En el cliente, verificar que la URL base del API (`VITE_API_BASE_URL`) use `https://`

### CORS (Backend)
```yaml
# application.yml - NO usar * en producción
cors:
  allowed-origins:
    - https://tinnitoff.app
    - https://www.tinnitoff.app
  # En desarrollo:
    - http://localhost:5173
  allowed-methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
  allow-credentials: true
```

---

## 5. Prevención de Vulnerabilidades Web

### XSS (Cross-Site Scripting)
- React escapa automáticamente el contenido JSX → no usar `dangerouslySetInnerHTML`
- Si es absolutamente necesario `dangerouslySetInnerHTML`, sanitizar con **DOMPurify** primero
- CSP (Content Security Policy) configurada en el servidor web (Nginx)

### SQL Injection
- **Siempre** usar Spring Data JPA / JPQL parametrizado o `@Query` con parámetros
- **Nunca** concatenar strings para construir queries SQL
```java
// ✅ CORRECTO
@Query("SELECT t FROM TinnitusLog t WHERE t.user.email = :email")
List<TinnitusLog> findByUserEmail(@Param("email") String email);

// ❌ NUNCA
String query = "SELECT * FROM tinnitus_logs WHERE email = '" + email + "'";
```

### CSRF
- Spring Security tiene protección CSRF habilitada por defecto para formularios
- Para APIs REST con JWT stateless, CSRF está deshabilitado pero compensado por:
  - Tokens JWT de corta vida
  - Cookies `SameSite=Strict` para refresh tokens
  - Verificación del header `Authorization`

### Inyección en Logs
- **Nunca** loggear datos de salud del usuario (niveles, notas, triggers)
- Sanitizar cualquier dato externo antes de incluirlo en logs
- En producción, nivel de log mínimo `WARN` o `ERROR`

---

## 6. Protección de Datos Personales (Privacy by Design)

### Principios Obligatorios
1. **Minimización de datos**: Recolectar solo lo estrictamente necesario para la funcionalidad
2. **Propósito limitado**: Los datos recolectados solo se usan para el fin declarado
3. **Transparencia**: Informar al usuario qué datos se recolectan y cómo se usan
4. **Derecho al olvido**: Implementar funcionalidad de eliminación de cuenta y datos

### Consentimiento
- El onboarding debe incluir aceptación explícita de términos y política de privacidad
- Consentimiento granular para funciones opcionales (face detection, comunidad, analytics)
- Almacenar registro de consentimiento con timestamp

### Datos de Menores
- Si un usuario declara ser menor de 18 años, **no** recolectar datos de salud sin consentimiento parental
- Considerar restricción de edad en el registro

---

## 7. Face Detection (face-api.js)

La funcionalidad de detección de tensión facial requiere precauciones especiales:
- **Procesamiento local**: Los modelos de face-api.js corren **en el dispositivo del usuario**
- **Nunca** enviar imágenes de la cámara al servidor
- Los análisis de expresión facial se procesan y descartan en memoria; solo se almacena el resultado agregado (nivel de tensión)
- El usuario debe dar permiso explícito de cámara cada sesión
- Mostrar claramente cuándo la cámara está activa (indicador visual)
- Permitir desactivar esta funcionalidad en cualquier momento

---

## 8. Audio y Privacidad

- Las grabaciones de audio para terapia **no** se envían a servidores
- El audio se genera localmente con Web Audio API
- Si en el futuro se implementa análisis de audio en servidor, requiere consentimiento explícito

---

## 9. Logs y Auditoría

### Qué Loggear (Backend)
```java
// ✅ LOGGEAR
logger.info("Usuario {} inició sesión desde IP {}", userId, anonymizeIP(ip));
logger.warn("Intento de acceso fallido para usuario {}", userId);
logger.error("Error al procesar solicitud {}: {}", requestId, errorMessage);

// ❌ NUNCA LOGGEAR
logger.info("Token JWT: {}", token);           // Nunca tokens
logger.info("Password: {}", password);          // Nunca contraseñas
logger.info("Nivel tinnitus: {}", nivel);       // Nunca datos de salud
logger.info("Email: {}", email);                // Evitar PII innecesaria
```

### Retención de Logs
- Logs de aplicación: máximo 90 días
- Logs de auditoría de acceso a datos de salud: mínimo 1 año
- Logs de seguridad (intentos fallidos, etc.): mínimo 6 meses

---

## 10. Gestión de Secretos

### Variables de Entorno (Backend)
```yaml
# application.yml - NUNCA valores hardcodeados
jwt:
  secret: ${JWT_SECRET}          # Variable de entorno
  expiration: ${JWT_EXPIRATION:900000}

spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
```

### Variables de Entorno (Frontend)
- Prefijo `VITE_` solo para configuración pública (URLs, Firebase config público)
- **Nunca** `VITE_JWT_SECRET`, `VITE_DB_PASSWORD` u otras claves privadas
- El archivo `.env` está en `.gitignore`. Revisar que **nunca** se haga commit

### Rotación de Credenciales
- Rotar las credenciales de base de datos cada 90 días
- Rotar el JWT secret si se sospecha compromiso
- Las API keys de Azure AI y Firebase: rotar anualmente o ante compromiso

---

## 11. Seguridad en Producción (Docker / Nginx)

### Nginx
```nginx
# Headers de seguridad obligatorios
add_header X-Frame-Options "DENY";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()";
add_header Content-Security-Policy "default-src 'self'; ...";
```

### Docker
- Nunca correr contenedores como `root`
- Usar imágenes base oficiales y actualizadas
- Escanear imágenes con herramientas de seguridad (Trivy, Snyk)
- Secrets de Docker para credenciales (no variables de entorno en `docker-compose.yml` directamente)

---

## 12. Respuesta a Incidentes

Si se detecta una brecha de seguridad:
1. **Revocar inmediatamente** todos los tokens JWT (rotar el secret)
2. **Notificar** a los usuarios afectados en máximo 72 horas
3. **Deshabilitar** la funcionalidad comprometida temporalmente
4. **Documentar** el incidente: qué datos expuestos, cuándo, cómo
5. **Parchear** la vulnerabilidad antes de reactivar
6. Considerar obligaciones legales de notificación (GDPR si aplica, leyes locales)

---

## 13. Checklist de Seguridad antes de Cada Deploy

- [ ] No hay secretos hardcodeados en el código
- [ ] El `.env` no se incluye en el commit
- [ ] Los endpoints del backend validan propiedad del recurso
- [ ] Los tokens JWT tienen TTL apropiado
- [ ] Las reglas de Firestore están actualizadas
- [ ] Las dependencias npm y Maven no tienen vulnerabilidades críticas conocidas
- [ ] Los headers de seguridad HTTP están configurados en Nginx
- [ ] Los logs no contienen datos de salud ni PII
- [ ] El backup de BD está cifrado y probado
