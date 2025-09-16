#!/bin/bash

# Complete Dev Startup Wrapper for TCC
# Use this script for consistent local restarts per project workflow

set -e

ROOT_DIR="/Users/scooper/Code/tcc-new-project"
START_SCRIPT="$ROOT_DIR/start-dev.sh"
HEALTH_URL="http://localhost:5001/health"

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

echo "🌐 Frontend expected at http://localhost:3000"
echo "🔧 Backend at http://localhost:5001"
echo "📊 Health: $HEALTH_URL"
echo "Press Ctrl+C to stop all servers"

trap 'echo; echo "🛑 Stopping dev servers..."; kill $START_PID 2>/dev/null || true; echo "✅ Stopped"; exit 0' SIGINT SIGTERM

wait $START_PID


