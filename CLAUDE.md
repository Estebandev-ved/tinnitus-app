# TinnitOff – Directivas Generales del Proyecto

## Descripción del Proyecto

**TinnitOff** es una aplicación integral de gestión del tinnitus (zumbido de oídos) que ayuda a los usuarios a habituarse y manejar sus síntomas mediante terapia de sonido, seguimiento diario, orientación con IA y apoyo comunitario.

> ⚠️ **IMPORTANTE**: Esta app maneja **datos de salud sensibles**. Toda funcionalidad debe diseñarse con privacidad, seguridad y cumplimiento normativo (HIPAA-awareness) como prioridad absoluta.

---

## Arquitectura del Proyecto

```
tinnitus-app/
├── backend/          # API REST – Spring Boot 3.2 + Java 21
│   └── src/main/java/com/tinnitus/backend/
│       ├── config/       # Configuración de seguridad, CORS, Firebase
│       ├── controller/   # Endpoints REST
│       ├── dto/          # Data Transfer Objects
│       ├── filter/       # Filtros JWT
│       ├── model/        # Entidades JPA
│       ├── repository/   # Repositorios Spring Data
│       └── service/      # Lógica de negocio
└── src/              # Frontend – React 19 + Vite 7
    ├── components/   # Componentes reutilizables
    ├── contexts/     # Context API (auth, theme, lang)
    ├── features/     # Módulos de funcionalidad principal
    ├── services/     # Servicios de API y Firebase
    └── utils/        # Utilidades compartidas
```

---

## Stack Tecnológico

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| React | 19.x | Framework UI principal |
| Vite | 7.x | Build tool y dev server |
| Capacitor | 8.x | App móvil (Android/iOS) |
| React Three Fiber | 9.x | Audio espacial 3D |
| Framer Motion | 12.x | Animaciones |
| Recharts | 3.x | Gráficas de progreso |
| Firebase | 12.x | Auth + Firestore |
| face-api.js | 1.x | Detección de tensión facial |

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| Spring Boot | 3.2.2 | Framework principal |
| Java | 21 | Lenguaje |
| Spring Security | 6.x | Autenticación y autorización |
| Spring Data JPA | 3.x | Persistencia de datos |
| MySQL / PostgreSQL | - | Base de datos de producción |
| H2 | - | Base de datos de desarrollo/test |
| Flyway | - | Migraciones de BD |
| JJWT | 0.11.5 | Tokens JWT |
| Firebase Admin | 9.2.0 | Push notifications (FCM) |
| SpringDoc OpenAPI | 2.3.0 | Documentación Swagger UI |
| Lombok | - | Reducción de boilerplate |

---

## Convenciones Globales

### Idioma del Código
- **Código**: Inglés (variables, funciones, clases, comentarios técnicos)
- **UI/UX**: Español e Inglés (soporte multilenguaje implementado)
- **Commits**: Inglés, formato Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`

### Formato de Código
- **Indentación**: 2 espacios en JS/JSX, 4 espacios (tabs) en Java
- **Punto y coma**: Obligatorio en Java; en JS seguir config ESLint existente
- **Longitud de línea**: Máximo 120 caracteres

### Nomenclatura
- **Java**: camelCase para métodos/variables, PascalCase para clases, UPPER_SNAKE_CASE para constantes
- **JS/React**: camelCase para variables/funciones, PascalCase para componentes React
- **Archivos Java**: `NombreClase.java` (PascalCase)
- **Archivos React**: `NombreComponente.jsx` (PascalCase), `nombre-servicio.js` (kebab-case para servicios)

---

## Módulos Funcionales Principales

1. **FrequencyMatching** – Audiometría para identificar frecuencia del tinnitus
2. **DailyTracking** – Registro diario de niveles, triggers y estado de ánimo
3. **SoundTherapy** – Biblioteca de sonidos terapéuticos
4. **SpatialAudio** – Audio 3D inmersivo con Web Audio API + Three.js
5. **AIChat** – Asistente conversacional (Azure AI)
6. **FacialTension** – Detección de estrés con face-api.js
7. **DigitalTwin** – Avatar IA con recomendaciones personalizadas
8. **BreathingGuide** – Ejercicios de respiración guiados
9. **MedicalProfile** – Perfil médico y generación de reportes PDF
10. **Community** – Conexión entre usuarios con tinnitus

---

## Comandos de Desarrollo

### Frontend
```bash
npm run dev           # Servidor de desarrollo (http://localhost:5173)
npm run build         # Build de producción
npm run test          # Ejecutar tests con Vitest
npm run lint          # Linting con ESLint
npm run cap:android   # Build y abrir en Android Studio
```

### Backend
```bash
cd backend
./mvnw spring-boot:run          # Iniciar servidor (http://localhost:8080)
./mvnw test                     # Ejecutar tests
./mvnw clean package            # Build del JAR
```

### Docker
```bash
docker-compose up -d            # Levantar todos los servicios
docker-compose down             # Detener servicios
```

---

## Variables de Entorno

Ver `.env.example` para la lista completa. Las variables críticas incluyen:
- `VITE_FIREBASE_*` – Configuración de Firebase
- `VITE_API_BASE_URL` – URL del backend
- `VITE_AZURE_*` – Claves de Azure AI
- `JWT_SECRET` – Secret para tokens JWT (solo backend)
- `DB_*` – Credenciales de base de datos (solo backend)

> **NUNCA** comitear archivos `.env` con valores reales. Siempre usar `.env.example`.

---

## Guías de Contribución

1. Siempre crear una rama feature: `git checkout -b feat/nombre-feature`
2. Verificar que los tests pasen antes de hacer PR
3. El backend debe tener endpoints documentados en Swagger (`/swagger-ui/index.html`)
4. Los componentes React nuevos deben tener PropTypes definidos
5. Ver `.claude/rules/` para reglas específicas por área
