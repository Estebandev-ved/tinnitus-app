#!/bin/sh
# TinnitOff backend entrypoint.
# Arranca como root SOLO para preparar /app/uploads (los Volumes de Railway se montan con dueno root),
# y despues ejecuta la JVM como el usuario no root "app" (uid/gid 10001).
set -e

APP_UID=10001
APP_GID=10001
UPLOADS_DIR=/app/uploads

if [ "$(id -u)" = "0" ]; then
    mkdir -p "$UPLOADS_DIR/apks"
    chown -R "$APP_UID:$APP_GID" "$UPLOADS_DIR"
    # exec: la JVM reemplaza al script (recibe SIGTERM directamente)
    # shellcheck disable=SC2086
    exec setpriv --reuid="$APP_UID" --regid="$APP_GID" --init-groups \
        java $JAVA_OPTS -jar /app/app.jar "$@"
fi

# Ya no somos root (p. ej. docker-compose con "user:"): no hay nada que preparar ni privilegios que soltar.
# shellcheck disable=SC2086
exec java $JAVA_OPTS -jar /app/app.jar "$@"
