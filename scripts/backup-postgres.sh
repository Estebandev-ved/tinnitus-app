#!/bin/bash
# PostgreSQL Backup Script for TinnitOff
# Run daily via cron: 0 2 * * * /path/to/backup-postgres.sh
#
# Usage:
#   ./backup-postgres.sh                    # backup to local ./backups/
#   ./backup-postgres.sh s3://bucket/path   # backup to S3

set -euo pipefail

# Config
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-tinnitusdb}"
DB_USER="${DB_USER:-tinnitoff}"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=30

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Dump and compress
echo "[$(date)] Starting backup of ${DB_NAME}..."
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --format=custom --compress=9 \
    > "${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.dump"

# Also create SQL backup
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    | gzip > "$BACKUP_FILE"

echo "[$(date)] Backup created: $BACKUP_FILE"

# Upload to S3 if specified
if [ "${1:-}" != "" ]; then
    S3_PATH="$1/${DB_NAME}_${TIMESTAMP}.sql.gz"
    aws s3 cp "$BACKUP_FILE" "$S3_PATH"
    echo "[$(date)] Uploaded to $S3_PATH"
fi

# Clean old backups
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +${RETENTION_DAYS} -delete
find "$BACKUP_DIR" -name "*.dump" -mtime +${RETENTION_DAYS} -delete
echo "[$(date)] Old backups cleaned (>${RETENTION_DAYS} days)"

echo "[$(date)] Backup complete."
