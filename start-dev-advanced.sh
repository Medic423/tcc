#!/bin/bash

# TCC Development Server Startup Script with Advanced Health Monitoring
# Standardized ports: Frontend=3000, Backend=5001
# Enhanced with process conflict prevention, automatic restart, and configuration

# Load configuration if it exists
CONFIG_FILE="dev-monitor.config"
if [ -f "$CONFIG_FILE" ]; then
    echo "📋 Loading configuration from $CONFIG_FILE..."
    source "$CONFIG_FILE"
fi

# Set defaults if not configured
HEALTH_CHECK_INTERVAL=${HEALTH_CHECK_INTERVAL:-60}
MAX_RESTARTS=${MAX_RESTARTS:-5}
BACKEND_HEALTH_URL=${BACKEND_HEALTH_URL:-"http://localhost:5001/health"}
FRONTEND_HEALTH_URL=${FRONTEND_HEALTH_URL:-"http://localhost:3000"}
RESTART_DELAY=${RESTART_DELAY:-10}
VERBOSE_LOGGING=${VERBOSE_LOGGING:-false}
ENABLE_EMAIL_NOTIFICATIONS=${ENABLE_EMAIL_NOTIFICATIONS:-false}
NOTIFICATION_EMAIL=${NOTIFICATION_EMAIL:-""}

echo "🚀 Starting TCC Development Environment with Advanced Health Monitoring..."
echo "📋 Standardized Ports:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5001"
echo "📊 Configuration:"
echo "   Health Check Interval: ${HEALTH_CHECK_INTERVAL}s"
echo "   Max Restarts: $MAX_RESTARTS"
echo "   Verbose Logging: $VERBOSE_LOGGING"
echo ""

# Global variables for process management
BACKEND_PID=""
FRONTEND_PID=""
MONITORING_PID=""
RESTART_COUNT=0
LOG_FILE="dev-server.log"

# Function to log messages
log_message() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] $message" | tee -a "$LOG_FILE"
    
    if [ "$VERBOSE_LOGGING" = "true" ]; then
        echo "$message"
    fi
}

# Function to send notification
send_notification() {
    local message="$1"
    if [ "$ENABLE_EMAIL_NOTIFICATIONS" = "true" ] && [ -n "$NOTIFICATION_EMAIL" ]; then
        echo "$message" | mail -s "TCC Dev Server Alert" "$NOTIFICATION_EMAIL" 2>/dev/null || true
    fi
}

# Function to cleanup on exit
cleanup() {
    log_message "🛑 Stopping all servers and monitoring..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    kill $MONITORING_PID 2>/dev/null || true
    log_message "✅ All processes stopped"
    exit 0
}

# Function to check backend health
check_backend_health() {
    if curl -s "$BACKEND_HEALTH_URL" > /dev/null 2>&1; then
        return 0  # Healthy
    else
        return 1  # Unhealthy
    fi
}

# Function to check frontend health
check_frontend_health() {
    if curl -s "$FRONTEND_HEALTH_URL" > /dev/null 2>&1; then
        return 0  # Healthy
    else
        return 1  # Unhealthy
    fi
}

# Function to start backend
start_backend() {
    log_message "🔧 Starting Backend Server (Port 5001)..."
    cd backend
    npm run dev > "../backend.log" 2>&1 &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to start
    log_message "⏳ Waiting for backend to start..."
    sleep 5
    
    # Verify backend health
    if check_backend_health; then
        log_message "✅ Backend server is healthy"
        return 0
    else
        log_message "❌ Backend server failed to start properly"
        log_message "   Check backend.log for errors"
        kill $BACKEND_PID 2>/dev/null || true
        return 1
    fi
}

# Function to start frontend
start_frontend() {
    log_message "🎨 Starting Frontend Server (Port 3000)..."
    cd frontend
    npm run dev > "../frontend.log" 2>&1 &
    FRONTEND_PID=$!
    cd ..
    
    # Wait for frontend to start
    sleep 3
    
    # Verify frontend health
    if check_frontend_health; then
        log_message "✅ Frontend server is healthy"
        return 0
    else
        log_message "❌ Frontend server failed to start properly"
        log_message "   Check frontend.log for errors"
        kill $FRONTEND_PID 2>/dev/null || true
        return 1
    fi
}

# Function to restart servers
restart_servers() {
    if [ $RESTART_COUNT -ge $MAX_RESTARTS ]; then
        log_message "❌ Maximum restart attempts ($MAX_RESTARTS) reached. Stopping monitoring."
        send_notification "TCC Dev Server: Maximum restart attempts reached. Server monitoring stopped."
        cleanup
        exit 1
    fi
    
    RESTART_COUNT=$((RESTART_COUNT + 1))
    log_message "🔄 Restarting servers (Attempt $RESTART_COUNT/$MAX_RESTARTS)..."
    
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
        log_message "✅ Servers restarted successfully"
        RESTART_COUNT=0  # Reset counter on successful restart
        send_notification "TCC Dev Server: Servers restarted successfully after failure."
    else
        log_message "❌ Failed to restart servers"
        send_notification "TCC Dev Server: Failed to restart servers. Attempt $RESTART_COUNT/$MAX_RESTARTS"
        sleep $RESTART_DELAY  # Wait before next attempt
    fi
}

# Function to monitor server health
monitor_health() {
    log_message "🔍 Starting health monitoring (checking every ${HEALTH_CHECK_INTERVAL}s)..."
    
    while true; do
        sleep $HEALTH_CHECK_INTERVAL
        
        BACKEND_HEALTHY=true
        FRONTEND_HEALTHY=true
        
        # Check backend health
        if ! check_backend_health; then
            log_message "⚠️  Backend health check failed at $(date)"
            BACKEND_HEALTHY=false
        fi
        
        # Check frontend health
        if ! check_frontend_health; then
            log_message "⚠️  Frontend health check failed at $(date)"
            FRONTEND_HEALTHY=false
        fi
        
        # Restart if any service is unhealthy
        if [ "$BACKEND_HEALTHY" = false ] || [ "$FRONTEND_HEALTHY" = false ]; then
            log_message "🔄 Unhealthy service detected, restarting..."
            send_notification "TCC Dev Server: Unhealthy service detected. Restarting servers..."
            restart_servers
        else
            log_message "✅ Health check passed at $(date)"
        fi
    done
}

# Enhanced process cleanup
log_message "🧹 Cleaning up existing processes..."
log_message "  - Killing nodemon processes..."
pkill -f nodemon 2>/dev/null || true
log_message "  - Killing ts-node processes..."
pkill -f "ts-node src/index.ts" 2>/dev/null || true
log_message "  - Killing processes on ports 3000 and 5001..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5001 | xargs kill -9 2>/dev/null || true

# Wait for ports to be released
log_message "⏳ Waiting for ports to be released..."
sleep 3

# Verify ports are free
if lsof -Pi :5001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    log_message "❌ Port 5001 is still in use. Please check for remaining processes."
    log_message "   Run: lsof -i :5001"
    exit 1
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    log_message "❌ Port 3000 is still in use. Please check for remaining processes."
    log_message "   Run: lsof -i :3000"
    exit 1
fi

# Start servers
if start_backend && start_frontend; then
    log_message ""
    log_message "✅ Development servers started successfully!"
    log_message "🌐 Frontend: http://localhost:3000"
    log_message "🔧 Backend:  http://localhost:5001"
    log_message "📊 Health Check: http://localhost:5001/health"
    log_message ""
    log_message "💡 Monitoring Features:"
    log_message "   - Health checks every ${HEALTH_CHECK_INTERVAL} seconds"
    log_message "   - Automatic restart on failure (max $MAX_RESTARTS attempts)"
    log_message "   - Process monitoring and cleanup"
    log_message "   - Logging to $LOG_FILE"
    if [ "$ENABLE_EMAIL_NOTIFICATIONS" = "true" ]; then
        log_message "   - Email notifications enabled"
    fi
    log_message ""
    log_message "Press Ctrl+C to stop all servers and monitoring"
    
    # Start health monitoring in background
    monitor_health &
    MONITORING_PID=$!
    
    # Set trap for cleanup
    trap cleanup SIGINT SIGTERM
    
    # Wait for user interrupt
    wait
else
    log_message "❌ Failed to start development servers"
    exit 1
fi
