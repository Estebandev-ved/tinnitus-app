# syntax=docker/dockerfile:1
# TinnitOff backend - imagen de produccion (Railway / docker-compose). Contexto de build: esta carpeta (backend/).

# ---------- Stage 1: build ----------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B \
    && cp target/backend-*.jar /app/app.jar

# ---------- Stage 2: runtime ----------
FROM eclipse-temurin:21-jre
WORKDIR /app

# curl solo para el HEALTHCHECK de Docker/compose (Railway usa el healthcheck de railway.json)
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system --gid 10001 app \
    && useradd --system --uid 10001 --gid app --home-dir /app --shell /usr/sbin/nologin app \
    && mkdir -p /app/uploads \
    && chown -R app:app /app

COPY --from=build --chown=app:app /app/app.jar /app/app.jar
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod 0755 /usr/local/bin/docker-entrypoint.sh

# prod por defecto: evita arrancar por accidente el perfil base (ddl-auto=update) contra la BD de produccion
ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:InitialRAMPercentage=50.0 -XX:+ExitOnOutOfMemoryError"

# Sin USER: el entrypoint arranca como root solo para preparar el Volume /app/uploads y luego
# suelta privilegios (setpriv, util-linux) y ejecuta la JVM como app (uid 10001).
# Railway inyecta PORT; application.properties usa server.port=${PORT:8080}
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD curl -fs http://localhost:${PORT:-8080}/actuator/health || exit 1

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
