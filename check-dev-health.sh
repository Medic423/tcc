#!/bin/bash

# TCC Development Server Health Check Script
# Quick health check for both frontend and backend services

echo "🔍 TCC Development Server Health Check"
echo "======================================"
echo ""

# Check backend health
echo "🔧 Backend Health Check (Port 5001):"
if curl -s http://localhost:5001/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
    # Get response time
    RESPONSE_TIME=$(curl -s -w "%{time_total}" http://localhost:5001/health -o /dev/null 2>/dev/null)
    echo "   Response time: ${RESPONSE_TIME}s"
else
    echo "❌ Backend is unhealthy or not responding"
fi

echo ""

# Check frontend health
echo "🎨 Frontend Health Check (Port 3000):"
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
    # Get response time
    RESPONSE_TIME=$(curl -s -w "%{time_total}" http://localhost:3000 -o /dev/null 2>/dev/null)
    echo "   Response time: ${RESPONSE_TIME}s"
else
    echo "❌ Frontend is unhealthy or not responding"
fi

echo ""

# Check if processes are running
echo "📊 Process Status:"
BACKEND_PROCESSES=$(ps aux | grep -E "(nodemon|ts-node.*src/index.ts)" | grep -v grep | wc -l)
FRONTEND_PROCESSES=$(ps aux | grep -E "(vite|npm.*dev)" | grep -v grep | wc -l)

echo "   Backend processes: $BACKEND_PROCESSES"
echo "   Frontend processes: $FRONTEND_PROCESSES"

echo ""

# Check port usage
echo "🔌 Port Usage:"
if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "   Port 5001: ✅ In use"
else
    echo "   Port 5001: ❌ Not in use"
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "   Port 3000: ✅ In use"
else
    echo "   Port 3000: ❌ Not in use"
fi

echo ""
echo "💡 To start servers: ./start-dev.sh"
echo "💡 For advanced monitoring: ./start-dev-advanced.sh"
