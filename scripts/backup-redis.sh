#!/bin/bash
set -e

# ==========================================
# REDIS BACKUP SCRIPT
# ==========================================

CONTAINER_NAME="stock-redis"
REDIS_PASS="${REDIS_PASSWORD:-SuperSecureRedisPassword2026!}"
BACKUP_DIR="${BACKUP_DIR:-./backups/redis}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

mkdir -p "${BACKUP_DIR}"

echo "Triggering Redis BGSAVE snapshot..."
docker exec -t "${CONTAINER_NAME}" redis-cli -a "${REDIS_PASS}" BGSAVE

sleep 2

echo "Copying dump.rdb from Redis container..."
docker cp "${CONTAINER_NAME}:/data/dump.rdb" "${BACKUP_DIR}/dump_${TIMESTAMP}.rdb"

echo "Redis backup snapshot completed: ${BACKUP_DIR}/dump_${TIMESTAMP}.rdb"
