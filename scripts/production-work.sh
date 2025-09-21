#!/bin/bash

# Production Work Safety Script
# This script ensures dev site safety during production work

DEV_URL="http://localhost:3000"
BACKUP_DIR="dev-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

check_dev_site() {
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$DEV_URL" 2>/dev/null)
    [ "$response" = "200" ]
}

backup_dev_state() {
    log_message "Creating dev site backup..."
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Backup critical files
    cp -r frontend/src "$BACKUP_DIR/src_backup_$TIMESTAMP"
    cp frontend/package.json "$BACKUP_DIR/package_backup_$TIMESTAMP.json"
    cp frontend/vite.config.ts "$BACKUP_DIR/vite_backup_$TIMESTAMP.ts"
    cp frontend/tailwind.config.js "$BACKUP_DIR/tailwind_backup_$TIMESTAMP.js"
    cp frontend/postcss.config.js "$BACKUP_DIR/postcss_backup_$TIMESTAMP.js"
    
    log_message "✅ Dev site backup created: $BACKUP_DIR/backup_$TIMESTAMP"
}

restore_dev_state() {
    local backup_name=$1
    
    if [ -z "$backup_name" ]; then
        log_message "Available backups:"
        ls -la "$BACKUP_DIR" | grep "backup_"
        echo "Usage: $0 restore <backup_name>"
        return 1
    fi
    
    log_message "Restoring dev site from backup: $backup_name"
    
    # Restore files
    if [ -d "$BACKUP_DIR/src_backup_$backup_name" ]; then
        cp -r "$BACKUP_DIR/src_backup_$backup_name"/* frontend/src/
        log_message "✅ Source files restored"
    fi
    
    if [ -f "$BACKUP_DIR/package_backup_$backup_name.json" ]; then
        cp "$BACKUP_DIR/package_backup_$backup_name.json" frontend/package.json
        log_message "✅ Package.json restored"
    fi
    
    if [ -f "$BACKUP_DIR/vite_backup_$backup_name.ts" ]; then
        cp "$BACKUP_DIR/vite_backup_$backup_name.ts" frontend/vite.config.ts
        log_message "✅ Vite config restored"
    fi
    
    if [ -f "$BACKUP_DIR/tailwind_backup_$backup_name.js" ]; then
        cp "$BACKUP_DIR/tailwind_backup_$backup_name.js" frontend/tailwind.config.js
        log_message "✅ Tailwind config restored"
    fi
    
    if [ -f "$BACKUP_DIR/postcss_backup_$backup_name.js" ]; then
        cp "$BACKUP_DIR/postcss_backup_$backup_name.js" frontend/postcss.config.js
        log_message "✅ PostCSS config restored"
    fi
    
    # Restart dev site
    log_message "Restarting dev site..."
    pkill -f "vite" 2>/dev/null
    sleep 2
    cd frontend && npm run dev > /dev/null 2>&1 &
    
    sleep 3
    if check_dev_site; then
        log_message "✅ Dev site restored and running"
    else
        log_message "❌ Failed to restore dev site"
    fi
}

start_production_work() {
    log_message "🛡️  Starting production work safety mode..."
    
    # Check if dev site is running
    if ! check_dev_site; then
        echo -e "${RED}❌ Dev site is not running! Cannot start production work safely.${NC}"
        echo -e "${YELLOW}Please start the dev site first: cd frontend && npm run dev${NC}"
        exit 1
    fi
    
    # Create backup
    backup_dev_state
    
    # Start monitoring in background
    log_message "Starting dev site monitoring..."
    nohup ./scripts/dev-site-monitor.sh > dev-monitor.log 2>&1 &
    MONITOR_PID=$!
    
    # Save PID for later use
    echo $MONITOR_PID > .dev-monitor.pid
    
    echo -e "${GREEN}✅ Production work safety mode activated${NC}"
    echo -e "${BLUE}Dev site is being monitored. If it goes down, it will be automatically restarted.${NC}"
    echo -e "${YELLOW}Monitor PID: $MONITOR_PID${NC}"
    echo -e "${YELLOW}To stop monitoring: $0 stop${NC}"
    echo -e "${YELLOW}To restore dev site: $0 restore <backup_name>${NC}"
    echo -e "${YELLOW}Monitor logs: tail -f dev-monitor.log${NC}"
}

stop_production_work() {
    log_message "Stopping production work safety mode..."
    
    # Kill monitor using saved PID
    if [ -f ".dev-monitor.pid" ]; then
        MONITOR_PID=$(cat .dev-monitor.pid)
        if kill $MONITOR_PID 2>/dev/null; then
            log_message "✅ Monitor stopped (PID: $MONITOR_PID)"
        else
            log_message "⚠️  Monitor was not running"
        fi
        rm -f .dev-monitor.pid
    else
        # Fallback: kill by process name
        pkill -f "dev-site-monitor.sh" 2>/dev/null
        log_message "✅ Monitor stopped (by process name)"
    fi
    
    # Check dev site status
    if check_dev_site; then
        log_message "✅ Dev site is healthy"
    else
        log_message "⚠️  Dev site may need attention"
    fi
}

case "$1" in
    "start")
        start_production_work
        ;;
    "stop")
        stop_production_work
        ;;
    "restore")
        restore_dev_state "$2"
        ;;
    "status")
        if check_dev_site; then
            echo -e "${GREEN}✅ Dev site is running${NC}"
        else
            echo -e "${RED}❌ Dev site is down${NC}"
        fi
        ;;
    *)
        echo "Usage: $0 {start|stop|restore|status}"
        echo "  start   - Start production work with safety monitoring"
        echo "  stop    - Stop production work safety monitoring"
        echo "  restore - Restore dev site from backup"
        echo "  status  - Check dev site status"
        exit 1
        ;;
esac
