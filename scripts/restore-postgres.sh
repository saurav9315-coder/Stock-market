#!/bin/bash
set -e

# ==========================================
# POSTGRESQL RESTORE SCRIPT
# ==========================================

BACKUP_FILE="$1"
CONTAINER_NAME="stock-postgres"
DB_NAME="${POSTGRES_DB:-stock_db}"
DB_USER="${POSTGRES_USER:-stock_user}"

if [ -z "${BACKUP_FILE}" ]; then
  echo "Error: Please specify the path to the backup .sql.gz file."
  echo "Usage: ./restore-postgres.sh ./backups/postgres/postgres_stock_db_20260725_120000.sql.gz"
  exit 1
fi

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "Error: Backup file '${BACKUP_FILE}' does not exist."
  exit 1
fi

echo "Restoring PostgreSQL database '${DB_NAME}' from '${BACKUP_FILE}'..."

gunzip -c "${BACKUP_FILE}" | docker exec -i "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}"

echo "PostgreSQL restoration completed successfully."
