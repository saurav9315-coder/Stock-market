#!/bin/bash
set -e

# ==========================================
# EMERGENCY ROLLBACK SCRIPT
# ==========================================

echo "[ROLLBACK] Initiating emergency rollback..."

# 1. Stop current containers
echo "[ROLLBACK] Stopping running containers..."
docker compose down

# 2. Rollback git commit if under version control
if [ -d .git ]; then
    echo "[ROLLBACK] Reverting to previous git commit..."
    git reset --hard HEAD~1
fi

# 3. Rebuild and restart containers
echo "[ROLLBACK] Rebuilding and launching previous release..."
docker compose build
docker compose up -d

# 4. Verify status
echo "[ROLLBACK] Executing health check..."
sleep 15
./scripts/health-check.sh

echo "[ROLLBACK] Rollback procedure finished."
