#!/bin/bash
set -e

# ==========================================
# POSTGRESQL BACKUP SCRIPT
# ==========================================

BACKUP_DIR="${BACKUP_DIR:-./backups/postgres}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
CONTAINER_NAME="stock-postgres"
DB_NAME="${POSTGRES_DB:-stock_db}"
DB_USER="${POSTGRES_USER:-stock_user}"
BACKUP_FILE="${BACKUP_DIR}/postgres_${DB_NAME}_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "Starting PostgreSQL backup for database '${DB_NAME}'..."

docker exec -t "${CONTAINER_NAME}" pg_dump -U "${DB_USER}" "${DB_NAME}" | gzip > "${BACKUP_FILE}"

echo "PostgreSQL backup completed successfully: ${BACKUP_FILE}"
