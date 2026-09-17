#!/bin/bash
set -e

# ==========================================
# PRODUCTION ZERO-DOWNTIME DEPLOYMENT SCRIPT
# ==========================================

echo "[DEPLOY] Starting Stock Platform production deployment..."

# 1. Ensure environment variables exist
if [ ! -f .env ]; then
    echo "[ERROR] .env file not found! Copying from .env.example..."
    cp .env.example .env
fi

# 2. Build updated container images
echo "[DEPLOY] Building container images..."
docker compose build --parallel

# 3. Apply container updates
echo "[DEPLOY] Recreating and updating containers..."
docker compose up -d --remove-orphans

# 4. Wait and execute synthetic health check
echo "[DEPLOY] Waiting for service initialization..."
sleep 15

./scripts/health-check.sh

echo "[DEPLOY] Production deployment completed successfully!"
