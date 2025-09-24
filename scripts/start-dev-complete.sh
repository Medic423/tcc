#!/bin/bash

# Complete Dev Startup Wrapper for TCC
# Use this script for consistent local restarts per project workflow

set -e

ROOT_DIR="/Users/scooper/Code/tcc-new-project"
START_SCRIPT="$ROOT_DIR/start-dev.sh"
HEALTH_URL="http://localhost:5001/health"
API_BASE="http://localhost:5001"

echo "🚀 TCC Complete Dev Startup"
echo "==========================="

# Optional pre-clean: rely on start-dev.sh cleanup logic
if [ ! -x "$START_SCRIPT" ]; then
  echo "❌ start-dev.sh not executable or missing at $START_SCRIPT"
  exit 1
fi

echo "▶️  Launching start-dev.sh..."
"$START_SCRIPT" &
START_PID=$!

echo "⏳ Waiting for backend health..."
attempts=0
max_attempts=30
while [ $attempts -lt $max_attempts ]; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" || echo "000")
  if [ "$code" = "200" ]; then
    echo "✅ Backend healthy at $HEALTH_URL"
    break
  fi
  attempts=$((attempts+1))
  sleep 2
done

if [ "$code" != "200" ]; then
  echo "❌ Backend did not become healthy in time"
  exit 1
fi

echo "🔎 Running feed health checks..."

# Critical feed endpoints (path|auth)
FEEDS=(
  "/health|no"
  "/api/tcc/analytics/overview|yes"
  "/api/tcc/agencies|yes"
  "/api/dropdown-options|yes"
  "/api/tcc/hospitals|yes"
  "/api/ems/analytics/overview|yes"
  "/api/ems/analytics/trips|yes"
  "/api/ems/analytics/units|yes"
  "/api/ems/analytics/performance|yes"
)

TOKEN="${TCC_TOKEN:-}"

failed=0
for entry in "${FEEDS[@]}"; do
  IFS='|' read -r path needs_auth <<< "$entry"
  url="$API_BASE$path"
  if [ "$needs_auth" = "yes" ] && [ -z "$TOKEN" ]; then
    echo "⚠️  $path requires auth (set TCC_TOKEN to validate)"
    continue
  fi
  if [ "$needs_auth" = "yes" ]; then
    status=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$url" || echo "000")
  else
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
  fi
  if [ "$status" = "200" ]; then
    echo "✅ $path -> 200"
  else
    echo "❌ $path -> $status"
    failed=1
  fi
done

if [ $failed -ne 0 ]; then
  echo "⚠️  One or more feeds are unhealthy. See results above."
fi

echo "🌐 Frontend expected at http://localhost:3000"
echo "🔧 Backend at http://localhost:5001"
echo "📊 Health: $HEALTH_URL"
echo "Press Ctrl+C to stop all servers"

trap 'echo; echo "🛑 Stopping dev servers..."; kill $START_PID 2>/dev/null || true; echo "✅ Stopped"; exit 0' SIGINT SIGTERM

wait $START_PID


