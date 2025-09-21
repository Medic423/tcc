#!/bin/bash

# Dev Site Safety Monitor
# This script monitors the dev site and alerts if it goes offline

DEV_URL="http://localhost:3000"
LOG_FILE="dev-monitor.log"
ALERT_COUNT=0
MAX_ALERTS=3

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_dev_site() {
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$DEV_URL" 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        # Only log every 10th check to reduce noise
        if [ $((ALERT_COUNT % 10)) -eq 0 ]; then
            log_message "✅ Dev site is healthy"
        fi
        ALERT_COUNT=0
        return 0
    else
        log_message "❌ Dev site is down (HTTP $response)"
        ALERT_COUNT=$((ALERT_COUNT + 1))
        return 1
    fi
}

start_monitoring() {
    log_message "Starting dev site monitoring..."
    
    while true; do
        if check_dev_site; then
            sleep 10
        else
            log_message "ALERT: Dev site is down! Attempt $ALERT_COUNT"
            
            if [ $ALERT_COUNT -ge $MAX_ALERTS ]; then
                log_message "CRITICAL: Dev site has been down for $MAX_ALERTS checks!"
                log_message "Attempting to restart dev site..."
                
                # Kill any existing vite processes
                pkill -f "vite" 2>/dev/null
                sleep 2
                
                # Start dev site
                cd /Users/scooper/Code/tcc-new-project/frontend
                npm run dev > /dev/null 2>&1 &
                
                # Wait and check again
                sleep 5
                if check_dev_site; then
                    log_message "SUCCESS: Dev site restarted successfully"
                    ALERT_COUNT=0
                else
                    log_message "FAILED: Could not restart dev site"
                fi
            fi
            
            sleep 5
        fi
    done
}

# Check if dev site is running
if ! check_dev_site; then
    echo -e "${YELLOW}⚠️  Dev site is not running. Starting it...${NC}"
    cd /Users/scooper/Code/tcc-new-project/frontend
    npm run dev > /dev/null 2>&1 &
    sleep 3
fi

start_monitoring
