# Reglas para la API de Spring Boot – TinnitOff Backend

## Contexto

El backend de TinnitOff es una **API REST** construida con **Spring Boot 3.2.2 y Java 21**.
Expone servicios para autenticación JWT, gestión de perfiles médicos, registro de síntomas,
notificaciones push (Firebase FCM) y almacenamiento de datos de salud.

---

## 1. Estructura de Paquetes

Seguir estrictamente la arquitectura en capas existente:

```
com.tinnitus.backend/
├── config/        # Beans de configuración (@Configuration)
├── controller/    # Controladores REST (@RestController)
├── dto/           # DTOs de entrada/salida (nunca exponer entidades directamente)
├── filter/        # Filtros de seguridad (JWT filter)
├── model/         # Entidades JPA (@Entity)
├── repository/    # Repositorios Spring Data JPA (@Repository)
└── service/       # Lógica de negocio (@Service)
```

**Regla**: La comunicación entre capas siempre fluye hacia abajo:
`Controller → Service → Repository`. Nunca saltar capas.

---

## 2. Convenciones de Código Java

### Clases y Nombres
- Controladores: `NombreController.java` (ej. `UserController.java`)
- Servicios: `NombreService.java` con interfaz `NombreService` + implementación `NombreServiceImpl.java`
- Repositorios: `NombreRepository.java` extendiendo `JpaRepository<Entidad, Long>`
- DTOs: `NombreRequest.java` (entrada) y `NombreResponse.java` (salida)
- Entidades: nombre singular en PascalCase (ej. `User.java`, `TinnitusLog.java`)

### Anotaciones Obligatorias
```java
// Entidades siempre con:
@Entity
@Table(name = "nombre_tabla")
@Data           // Lombok
@NoArgsConstructor
@AllArgsConstructor
@Builder

// Controladores:
@RestController
@RequestMapping("/api/v1/recurso")
@RequiredArgsConstructor  // Lombok para inyección por constructor

// Servicios:
@Service
@RequiredArgsConstructor
@Transactional  // en métodos que modifican datos
```

### Inyección de Dependencias
- **Siempre** usar inyección por constructor (con `@RequiredArgsConstructor` de Lombok)
- **Nunca** usar `@Autowired` en campos

---

## 3. Endpoints REST

### Convenciones de URLs
- Base path: `/api/v1/`
- Recursos en plural y kebab-case: `/api/v1/tinnitus-logs`, `/api/v1/sound-sessions`
- IDs en path: `/api/v1/users/{userId}`
- Acciones no-CRUD como subrecurso: `/api/v1/users/{userId}/reports`

### Códigos HTTP Estándar
| Operación | Código |
|---|---|
| GET exitoso | 200 OK |
| POST exitoso (crear) | 201 Created |
| PUT/PATCH exitoso | 200 OK |
| DELETE exitoso | 204 No Content |
| Error de validación | 400 Bad Request |
| No autenticado | 401 Unauthorized |
| Sin permisos | 403 Forbidden |
| No encontrado | 404 Not Found |
| Error interno | 500 Internal Server Error |

### Formato de Respuesta Estándar
Todas las respuestas deben seguir este envelope:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operación exitosa",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

Para errores:
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "El campo 'email' es requerido",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

## 4. Seguridad con JWT

### Flujo de Autenticación
1. Usuario hace POST `/api/v1/auth/login` con credenciales
2. Backend valida y retorna `accessToken` (15 min) + `refreshToken` (7 días)
3. Cliente incluye: `Authorization: Bearer <accessToken>` en cada request
4. `JwtTokenProvider` valida el token en el `JwtAuthenticationFilter`

### Reglas de Seguridad
- El `JwtSecret` debe tener mínimo 256 bits de entropía
- Siempre validar: firma, expiración y claims del usuario
- **Nunca** almacenar contraseñas en texto plano – usar `BCryptPasswordEncoder`
- Endpoints públicos (whitelist): `/api/v1/auth/**`, `/swagger-ui/**`, `/v3/api-docs/**`
- Todo lo demás requiere autenticación

### Roles
- `ROLE_USER` – Usuario estándar
- `ROLE_ADMIN` – Administrador del sistema
- `ROLE_DOCTOR` – Profesional de salud (acceso a reportes de pacientes con su consentimiento)

---

## 5. Validación de Datos

Usar **Bean Validation** (`@Valid`) en todos los DTOs de entrada:

```java
public class TinnitusLogRequest {
    @NotNull(message = "La fecha es requerida")
    private LocalDate date;

    @Min(value = 0, message = "El nivel debe ser entre 0 y 10")
    @Max(value = 10, message = "El nivel debe ser entre 0 y 10")
    private Integer tinnitusLevel;

    @Size(max = 500, message = "Las notas no pueden superar 500 caracteres")
    private String notes;
}
```

Siempre anotar los parámetros del controlador con `@Valid`:
```java
@PostMapping
public ResponseEntity<?> create(@Valid @RequestBody TinnitusLogRequest request) { ... }
```

---

## 6. Manejo de Errores

Centralizar el manejo de excepciones con `@RestControllerAdvice`:

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    // → 400 con lista de errores de validación

    @ExceptionHandler(ResourceNotFoundException.class)
    // → 404

    @ExceptionHandler(AccessDeniedException.class)
    // → 403
}
```

Crear excepciones personalizadas en `exception/` package cuando sea necesario.

---

## 7. Base de Datos y JPA

### Migraciones con Flyway
- Todos los cambios de esquema deben ir en `src/main/resources/db/migration/`
- Nomenclatura: `V{numero}__{descripcion}.sql` (ej. `V1__create_users_table.sql`)
- **Nunca** usar `spring.jpa.hibernate.ddl-auto=create` o `update` en producción
- En desarrollo: `ddl-auto=validate` (Flyway maneja el esquema)

### Entidades
- Siempre definir `@CreatedDate` y `@LastModifiedDate` con `@EntityListeners(AuditingEntityListener.class)`
- Usar `LocalDateTime` para fechas/horas (no `Date` ni `Calendar`)
- Relaciones: definir `@OneToMany` con `fetch = FetchType.LAZY` por defecto
- Evitar `CascadeType.ALL` sin entender las implicaciones

### Datos de Salud
- Campos sensibles (nivel de tinnitus, triggers, notas médicas) deben estar en tablas separadas
- Considerar cifrado a nivel de aplicación para datos extremadamente sensibles

---

## 8. Documentación con Swagger/OpenAPI

Todos los endpoints deben estar documentados:

```java
@Operation(summary = "Registrar sesión de tinnitus", 
           description = "Crea un nuevo registro diario de síntomas de tinnitus")
@ApiResponse(responseCode = "201", description = "Registro creado exitosamente")
@ApiResponse(responseCode = "400", description = "Datos de entrada inválidos")
@ApiResponse(responseCode = "401", description = "Token JWT inválido o expirado")
```

Acceder a Swagger UI en: `http://localhost:8080/swagger-ui/index.html`

---

## 9. Testing

### Estructura de Tests
```
src/test/java/com/tinnitus/backend/
├── controller/   # Tests de integración con @WebMvcTest
├── service/      # Tests unitarios con Mockito
└── repository/   # Tests con @DataJpaTest (H2)
```

### Reglas de Testing
- Cobertura mínima: 70% en la capa de servicio
- Usar `@MockBean` para dependencias en tests de controlador
- Datos de prueba con H2 en memoria (perfil `test`)
- **Nunca** conectar a base de datos de producción en tests

---

## 10. Perfiles de Spring

| Perfil | DB | Uso |
|---|---|---|
| `default` | H2 | Desarrollo local rápido |
| `dev` | MySQL local | Desarrollo con BD real |
| `prod` | PostgreSQL | Producción (Docker) |

Activar con: `SPRING_PROFILES_ACTIVE=prod`

---

## 11. Firebase Admin SDK

- Inicializar `FirebaseApp` en un `@Bean` de configuración, una sola vez
- Usar `FirebaseMessaging` para enviar notificaciones push (FCM)
- Las credenciales de Firebase Admin van en variable de entorno `FIREBASE_SERVICE_ACCOUNT_PATH`
- **Nunca** hardcodear el JSON de credenciales en el código

---

## 12. CORS

La configuración CORS debe permitir:
- Origins: los definidos en `application.yml` (no usar `*` en producción)
- Methods: `GET, POST, PUT, PATCH, DELETE, OPTIONS`
- Headers: `Authorization, Content-Type`
- Credentials: `true`
