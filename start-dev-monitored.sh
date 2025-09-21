#!/bin/bash

# TCC Development Server Startup Script with Health Monitoring
# Standardized ports: Frontend=3000, Backend=5001
# Enhanced with process conflict prevention and automatic restart

echo "🚀 Starting TCC Development Environment with Health Monitoring..."
echo "📋 Standardized Ports:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5001"
echo ""

# Global variables for process management
BACKEND_PID=""
FRONTEND_PID=""
MONITORING_PID=""
RESTART_COUNT=0
MAX_RESTARTS=5
HEALTH_CHECK_INTERVAL=60  # Check every 60 seconds

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all servers and monitoring..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    kill $MONITORING_PID 2>/dev/null || true
    echo "✅ All processes stopped"
    exit 0
}

# Function to check backend health
check_backend_health() {
    if curl -s http://localhost:5001/health > /dev/null 2>&1; then
        return 0  # Healthy
    else
        return 1  # Unhealthy
    fi
}

# Function to check frontend health
check_frontend_health() {
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        return 0  # Healthy
    else
        return 1  # Unhealthy
    fi
}

# Function to start backend
start_backend() {
    echo "🔧 Starting Backend Server (Port 5001)..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to start
    echo "⏳ Waiting for backend to start..."
    sleep 5
    
    # Verify backend health
    if check_backend_health; then
        echo "✅ Backend server is healthy"
        return 0
    else
        echo "❌ Backend server failed to start properly"
        kill $BACKEND_PID 2>/dev/null || true
        return 1
    fi
}

# Function to start frontend
start_frontend() {
    echo "🎨 Starting Frontend Server (Port 3000)..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    # Wait for frontend to start
    sleep 3
    
    # Verify frontend health
    if check_frontend_health; then
        echo "✅ Frontend server is healthy"
        return 0
    else
        echo "❌ Frontend server failed to start properly"
        kill $FRONTEND_PID 2>/dev/null || true
        return 1
    fi
}

# Function to restart servers
restart_servers() {
    if [ $RESTART_COUNT -ge $MAX_RESTARTS ]; then
        echo "❌ Maximum restart attempts ($MAX_RESTARTS) reached. Stopping monitoring."
        cleanup
        exit 1
    fi
    
    RESTART_COUNT=$((RESTART_COUNT + 1))
    echo ""
    echo "🔄 Restarting servers (Attempt $RESTART_COUNT/$MAX_RESTARTS)..."
    
    # Kill existing processes
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    
    # Wait for processes to die
    sleep 3
    
    # Clean up ports
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    lsof -ti:5001 | xargs kill -9 2>/dev/null || true
    sleep 2
    
    # Restart servers
    if start_backend && start_frontend; then
        echo "✅ Servers restarted successfully"
        RESTART_COUNT=0  # Reset counter on successful restart
    else
        echo "❌ Failed to restart servers"
        sleep 10  # Wait before next attempt
    fi
}

# Function to monitor server health
monitor_health() {
    echo "🔍 Starting health monitoring (checking every ${HEALTH_CHECK_INTERVAL}s)..."
    
    while true; do
        sleep $HEALTH_CHECK_INTERVAL
        
        BACKEND_HEALTHY=true
        FRONTEND_HEALTHY=true
        
        # Check backend health
        if ! check_backend_health; then
            echo "⚠️  Backend health check failed at $(date)"
            BACKEND_HEALTHY=false
        fi
        
        # Check frontend health
        if ! check_frontend_health; then
            echo "⚠️  Frontend health check failed at $(date)"
            FRONTEND_HEALTHY=false
        fi
        
        # Restart if any service is unhealthy
        if [ "$BACKEND_HEALTHY" = false ] || [ "$FRONTEND_HEALTHY" = false ]; then
            echo "🔄 Unhealthy service detected, restarting..."
            restart_servers
        else
            echo "✅ Health check passed at $(date)"
        fi
    done
}

# Enhanced process cleanup
echo "🧹 Cleaning up existing processes..."
echo "  - Killing nodemon processes..."
pkill -f nodemon 2>/dev/null || true
echo "  - Killing ts-node processes..."
pkill -f "ts-node src/index.ts" 2>/dev/null || true
echo "  - Killing processes on ports 3000 and 5001..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5001 | xargs kill -9 2>/dev/null || true

# Wait for ports to be released
echo "⏳ Waiting for ports to be released..."
sleep 3

# Verify ports are free
if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "❌ Port 5001 is still in use. Please check for remaining processes."
    echo "   Run: lsof -i :5001"
    exit 1
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "❌ Port 3000 is still in use. Please check for remaining processes."
    echo "   Run: lsof -i :3000"
    exit 1
fi

# Start servers
if start_backend && start_frontend; then
    echo ""
    echo "✅ Development servers started successfully!"
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔧 Backend:  http://localhost:5001"
    echo "📊 Health Check: http://localhost:5001/health"
    echo ""
    echo "💡 Monitoring Features:"
    echo "   - Health checks every ${HEALTH_CHECK_INTERVAL} seconds"
    echo "   - Automatic restart on failure (max $MAX_RESTARTS attempts)"
    echo "   - Process monitoring and cleanup"
    echo ""
    echo "Press Ctrl+C to stop all servers and monitoring"
    
    # Start health monitoring in background
    monitor_health &
    MONITORING_PID=$!
    
    # Set trap for cleanup
    trap cleanup SIGINT SIGTERM
    
    # Wait for user interrupt
    wait
else
    echo "❌ Failed to start development servers"
    exit 1
fi
