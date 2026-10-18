# TinnitOff - Production Deployment Guide

## Prerequisites

- Docker + Docker Compose v2+
- Domain with DNS configured (A record → server IP)
- SSL certificates (or use Certbot for auto-renewal)
- Minimum: 2 vCPU, 4GB RAM, 40GB SSD

## Quick Start

```bash
# 1. Clone and configure
git clone <repo-url> && cd tinnitus-app
cp .env.example .env
# Edit .env with real passwords/secrets

# 2. Build backend
cd backend && mvn clean package -DskipTests && cd ..

# 3. Start everything
docker-compose up -d

# 4. Check status
docker-compose ps
docker-compose logs backend --tail=20
```

## Architecture

```
Internet → Nginx (443) → Backend (8080) → PostgreSQL (5432)
                     ↘ React SPA (/)

Monitoring: Prometheus (9090) + Grafana (3000)
```

## Services

| Service    | Port | Description                        |
|------------|------|------------------------------------|
| nginx      | 80/443 | Reverse proxy, SSL, rate limiting |
| backend    | 8080 | Spring Boot API (internal)         |
| postgres   | 5432 | PostgreSQL 16 (internal)           |
| prometheus | 9090 | Metrics collection                 |
| grafana    | 3000 | Dashboards + alerting              |

## Environment Variables

| Variable              | Required | Description                      |
|-----------------------|----------|----------------------------------|
| `DB_USERNAME`         | Yes      | PostgreSQL username              |
| `DB_PASSWORD`         | Yes      | PostgreSQL password              |
| `JWT_SECRET`          | Yes      | JWT signing key (32+ chars)      |
| `CLINICAL_SYNC_TOKEN` | Yes      | Mobile app sync token            |
| `GRAFANA_PASSWORD`    | Yes      | Grafana admin password           |

## SSL Setup

### Option A: Existing certificates
```bash
# Copy to nginx/ssl/
cp /path/to/fullchain.pem nginx/ssl/
cp /path/to/privkey.pem nginx/ssl/
```

### Option B: Certbot (Let's Encrypt)
```bash
# Run certbot container
docker-compose run --rm certbot certonly --webroot \
  -w /var/www/certbot \
  -d tinnitoff.com -d www.tinnitoff.com

# Uncomment certbot service in docker-compose.yml
```

## Database

### Backup
```bash
# Manual backup
docker-compose exec postgres pg_dump -U tinnitoff tinnitusdb > backup_$(date +%Y%m%d).sql

# Automated (daily at 2am)
crontab -e
0 2 * * * /path/to/scripts/backup-postgres.sh s3://your-bucket/backups
```

### Restore
```bash
cat backup.sql | docker-compose exec -T postgres psql -U tinnitoff -d tinnitusdb
```

### Migrations
Flyway runs automatically on startup (`V1__init.sql`).

## Monitoring

### Grafana
- URL: `https://tinnitoff.com:3000` (restrict to VPN in nginx)
- Login: `admin` / `$GRAFANA_PASSWORD`
- Pre-configured with Spring Boot dashboard

### Prometheus
- Scrapes backend metrics at `/actuator/prometheus`
- Targets: Spring Boot JVM, HTTP requests, HikariCP

### Actuator Endpoints
- Health: `GET /actuator/health`
- Metrics: `GET /actuator/metrics`
- Prometheus: `GET /actuator/prometheus`

## Load Testing

```bash
# Install k6: https://k6.io/docs/getting-started/installation/
k6 run scripts/load-test.js --env BASE_URL=https://tinnitoff.com
```

## Troubleshooting

### Backend won't start
```bash
docker-compose logs backend | tail -50
# Common: DB connection refused → check postgres is healthy
# Common: JWT_SECRET too short → use 32+ random chars
```

### 502 Bad Gateway
```bash
docker-compose ps
# Check backend container is running
docker-compose logs nginx | tail -20
# Check upstream connection
```

### Database connection pool exhausted
```bash
curl -s http://localhost:8080/actuator/metrics/hikaricp.connections.active
# Increase pool size in application-prod.properties if needed
```

## Scaling

### Horizontal (multiple backends)
```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      replicas: 3
```
Requires sticky sessions or stateless JWT (already implemented).

### Vertical
Edit `JAVA_OPTS` in `docker-compose.yml`:
```yaml
environment:
  JAVA_OPTS: "-Xms1g -Xmx3g"
```

## Security Checklist

- [ ] `.env` file not committed to git
- [ ] JWT_SECRET is random and 32+ chars
- [ ] DB_PASSWORD is strong
- [ ] HTTPS enabled with valid cert
- [ ] Actuator restricted to internal network
- [ ] Rate limiting active (nginx + backend)
- [ ] CORS restricted to production domain
- [ ] Firebase service account not in git

## Asistente de IA (proxy: Anthropic por defecto, Azure OpenAI como alternativa)

El chat de IA pasa por el backend (`POST /api/v1/ai/chat`). Las claves viven solo en el servidor.

1. En `.env` del servidor: `ANTHROPIC_API_KEY` (opcionales: `ANTHROPIC_MODEL`, por defecto `claude-haiku-4-5`;
   `ANTHROPIC_MAX_TOKENS`, por defecto 500; `AI_PROVIDER` = `anthropic` | `azure`).
   Si `AI_PROVIDER` esta vacio se usa Anthropic cuando hay `ANTHROPIC_API_KEY`, si no Azure cuando estan
   `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT` y `AZURE_OPENAI_DEPLOYMENT` (alternativa). Sin ninguno: 503.
   Limites opcionales: `AI_LIMIT_PER_MINUTE`, `AI_LIMIT_PER_DAY`, `AI_LIMIT_TOKENS_PER_DAY`.
   Si pones `ANTHROPIC_MODEL=claude-sonnet-5-5` el backend desactiva su razonamiento por defecto (`between_tools`);
   con otros modelos que razonan por defecto sube `ANTHROPIC_MAX_TOKENS`, porque el razonamiento consume ese tope.
2. El backend necesita `FIREBASE_SA` (cuenta de servicio, montada como `/app/serviceAccount.json`) para
   verificar los ID tokens de Firebase. Sin ella el endpoint responde 503 y la app cae al modo básico.
3. El backend debe ser accesible por HTTPS público. Al construir el frontend, `VITE_BACKEND_URL=https://api.tu-dominio`
   y `CORS_ORIGINS` debe incluir el origen de la web (y `capacitor://localhost` / `https://localhost` para Android).
4. Rotar la clave de Azure que estuvo guardada en dispositivos/`localStorage` antes de este cambio.
5. Límites en memoria: válidos para una sola instancia del backend.

## Railway (backend Spring Boot)

El backend (`backend/`) se despliega en Railway con su `Dockerfile` y `backend/railway.json`
(builder Dockerfile, healthcheck `/actuator/health`). Nada de esto se ha desplegado todavía: son pasos para ti.
Verifica precios y límites vigentes antes de contratar: <https://railway.com/pricing> y <https://docs.railway.com>.

### 1. Crear el proyecto y la base de datos
1. Entra en railway.com con tu cuenta y crea un proyecto nuevo (**New Project**).
2. **Add** -> **Database** -> **PostgreSQL**. Railway crea el servicio con las variables `DATABASE_URL`, `PGHOST`,
   `PGPORT`, `PGDATABASE`, `PGUSER` y `PGPASSWORD`.

### 2. Conectar el repositorio
1. **Add** -> **GitHub Repo** y elige el repositorio de TinnitOff (autoriza la app de Railway en GitHub si lo pide).
2. En el servicio -> **Settings** -> **Source** -> **Root Directory**: `backend`.
3. Railway detecta `backend/Dockerfile` y `backend/railway.json` (builder Dockerfile + healthcheck). No hace falta Start Command.

### 3. Variables del servicio del backend (pestaña Variables)
Crea estas variables en el servicio del backend (los **valores los pones tú**; nunca los subas a git):

| Variable | Obligatoria | Notas |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | opcional | `prod` (la imagen ya lo trae por defecto) |
| `DATABASE_URL` | sí | Referencia al Postgres: `${{Postgres.DATABASE_URL}}` (ajusta el nombre del servicio si es otro). El backend la convierte a JDBC. Alternativa: `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` |
| `JWT_SECRET` | sí | Mínimo 32 caracteres aleatorios (`openssl rand -base64 64`) |
| `CLINICAL_SYNC_TOKEN` | sí | Mínimo 32 caracteres aleatorios; debe coincidir con el de la app móvil |
| `ADMIN_EMAIL` | sí | Correo del administrador |
| `ADMIN_PASSWORD` | sí | Contraseña fuerte del admin (se usa al crear el usuario la primera vez) |
| `ADMIN_USERNAME` | opcional | Por defecto `admin` |
| `CORS_ORIGINS` | recomendada | Lista separada por comas, sin espacios. Ver sección CORS más abajo |
| `FIREBASE_SA_JSON` | sí para el chat IA y push | Contenido del JSON de la cuenta de servicio de Firebase (pegado tal cual) **o** ese JSON en base64. Sin ella el chat IA responde 503 y la app usa el modo básico |
| `ANTHROPIC_API_KEY` | para el chat IA | Solo en el servidor. Proveedor por defecto |
| `ANTHROPIC_MODEL` | opcional | Por defecto `claude-haiku-4-5` |
| `ANTHROPIC_MAX_TOKENS` | opcional | Por defecto 500 |
| `AI_PROVIDER` | opcional | `anthropic` o `azure`; vacio = automatico |
| `AZURE_OPENAI_API_KEY` | alternativa | Solo si usas Azure en vez de Anthropic |
| `AZURE_OPENAI_ENDPOINT` | alternativa | |
| `AZURE_OPENAI_DEPLOYMENT` | alternativa | |
| `AI_LIMIT_PER_MINUTE` | opcional | Por defecto 6 |
| `AI_LIMIT_PER_DAY` | opcional | Por defecto 40 |
| `AI_LIMIT_TOKENS_PER_DAY` | opcional | Por defecto 60000 |
| `DB_POOL_SIZE` | opcional | Conexiones máximas a Postgres (por defecto 5) |

`PORT` lo inyecta Railway; no la definas. Si falta una variable crítica, el contenedor **no arranca** y el log de
despliegue lista exactamente cuáles faltan (`Configuracion de produccion incompleta`), sin mostrar valores.

Para pegar `FIREBASE_SA_JSON` en base64 (opcional, evita problemas con saltos de línea):
`base64 -w0 serviceAccount.json` (Linux/Git Bash) y pega el resultado.

### 4. Dominio y prueba
1. Servicio del backend -> **Settings** -> **Networking** -> **Generate Domain** (queda `https://<algo>.up.railway.app`).
2. Espera a que el despliegue pase el healthcheck y prueba: `https://<dominio>/actuator/health` debe responder
   `{"status":"UP"}`. (El backend no expone `/health`; el endpoint es `/actuator/health`.)
3. Flyway crea el esquema la primera vez (migración `V1__init.sql`); Hibernate solo valida (`ddl-auto=validate`).
   Si el log muestra un error de validación de esquema, no lo "arregles" con `update`: crea una nueva migración.

### 5. Apuntar la app al backend
1. En el `.env` con el que construyes el frontend: `VITE_BACKEND_URL=https://<dominio>` (sin `/` final).
2. Reconstruye: `npm run build` y, para Android, `npx cap sync android` y vuelve a generar el `.aab`/`.apk`.
   Las variables `VITE_*` quedan embebidas en el bundle, por eso hay que reconstruir tras cambiarlas.
3. Si despliegas la web en Firebase Hosting, vuelve a desplegarla con el nuevo build.

### CORS (importante para la app móvil)
`CORS_ORIGINS` debe incluir el origen de la web **y los de la app Capacitor**. Con `androidScheme: https`
(ver `capacitor.config.json`) la app Android envía `Origin: https://localhost`; en iOS es `capacitor://localhost`.
Ejemplo: `https://tinnitusoff-e61c4.web.app,https://tinnitusoff.web.app,https://localhost,capacitor://localhost`.
Si la variable no se define, se usa ese mismo valor por defecto.

### Volume para las APK subidas (`/app/uploads`)
1. Servicio del backend -> **Add Volume** (o `Ctrl+K` / `Cmd+K` y busca "volume") -> **Mount path**: `/app/uploads`.
2. Redespliega el servicio. No hay que definir variables nuevas.

**Por qué hay un entrypoint**: el contenedor corre la aplicación como usuario no root (`app`, uid 10001), pero Railway
monta los Volumes con dueño `root`, así que `FileStorageService` (ruta relativa `uploads/apks`, WORKDIR `/app`) no podría
escribir. `backend/docker-entrypoint.sh` arranca como root **solo** para crear `/app/uploads/apks` y hacer `chown` a
10001:10001, y después hace `exec` de la JVM como `app` mediante `setpriv` (util-linux), de modo que la JVM recibe las
señales y nunca corre como root. Si el contenedor se lanza ya como no root (p. ej. `user:` en docker-compose), el script
omite el `chown` y ejecuta la JVM directamente.

**No** hace falta `RAILWAY_RUN_UID=0` (haría correr toda la app como root).

Limitaciones del Volume:
- Solo un servicio/réplica puede montarlo; no escales a varias réplicas con este almacenamiento.
- Cada despliegue implica una parada breve (el Volume se desmonta y se monta en la nueva instancia).
- Las copias de seguridad del Volume dependen del plan de Railway; verifica las opciones vigentes en <https://docs.railway.com>.
- Con `docker-compose` local no se monta ningún volumen para `uploads` (se pierde al recrear el contenedor).

### Limitaciones y costos
- **Una sola instancia**: el limitador del chat de IA (`AI_LIMIT_*`) y el rate limit por IP están **en memoria**.
  Si escalas a varias réplicas, cada una cuenta por separado (el límite efectivo se multiplica) y se reinicia
  con cada despliegue. Para varias instancias habría que moverlos a Redis/BD.
- **Disco efímero**: las APK subidas desde el panel admin se guardan en `uploads/apks` dentro del contenedor y se
  pierden en cada despliegue salvo que montes un Volume de Railway en `/app/uploads` (ver más abajo).  
- **Detrás del proxy de Railway**: `server.forward-headers-strategy=framework` respeta `X-Forwarded-Proto/Host`, y el
  rate limit usa la última IP de `X-Forwarded-For` (`app.trust-forwarded-for=true`, solo en el perfil `prod`).
- **Swagger** está desactivado en `prod`; el healthcheck no muestra detalles.
- **Costos**: Railway cobra por uso de recursos (CPU, memoria, red, almacenamiento) y por plan; no se estiman cifras
  aquí. Consulta <https://railway.com/pricing>. El servicio de Azure OpenAI se factura aparte; `AI_LIMIT_*` acota el gasto por usuario.
- **Backups**: configura copias de la base de datos Postgres según las opciones vigentes del plan que elijas.
