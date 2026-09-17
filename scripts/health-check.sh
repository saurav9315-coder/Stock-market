#!/bin/bash

# ==========================================
# SRE SYNTHETIC HEALTH CHECK SCRIPT
# ==========================================

echo "=========================================="
echo "      STOCK PLATFORM HEALTH CHECK         "
echo "=========================================="

FAILED=0

check_endpoint() {
    local name="$1"
    local url="$2"
    local expected_code="$3"

    code=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")

    if [ "$code" -eq "$expected_code" ]; then
        echo "[OK]   $name ($url) -> Status $code"
    else
        echo "[FAIL] $name ($url) -> Status $code (Expected $expected_code)"
        FAILED=$((FAILED + 1))
    fi
}

# 1. Container Status Check
echo "--- Checking Docker Containers ---"
docker compose ps

# 2. HTTP Synthetic Checks
echo "--- Checking Endpoint Availability ---"
check_endpoint "Nginx Proxy Healthz" "http://localhost/healthz" 200
check_endpoint "Next.js Frontend App" "http://localhost:3000/" 200
check_endpoint "Spring Boot Actuator" "http://localhost:8080/actuator/health" 200

if [ $FAILED -eq 0 ]; then
    echo "=========================================="
    echo " RESULT: ALL SYSTEMS OPERATIONAL (GREEN)  "
    echo "=========================================="
    exit 0
else
    echo "=========================================="
    echo " RESULT: $FAILED SERVICE(S) UNHEALTHY (RED) "
    echo "=========================================="
    exit 1
fi
