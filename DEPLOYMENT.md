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
