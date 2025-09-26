#!/bin/bash

# Quick start script for TCC Comprehensive Monitor
# This script starts the monitor in the background and provides easy control

MONITOR_SCRIPT="scripts/tcc-comprehensive-monitor.sh"
PID_FILE="tcc-monitor.pid"
LOG_FILE="tcc-monitor.log"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to start monitor
start_monitor() {
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Monitor is already running (PID: $(cat $PID_FILE))${NC}"
        return 1
    fi
    
    echo -e "${GREEN}🚀 Starting TCC Comprehensive Monitor...${NC}"
    nohup "$MONITOR_SCRIPT" > "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    echo -e "${GREEN}✅ Monitor started (PID: $!)${NC}"
    echo -e "${GREEN}📝 Logs: $LOG_FILE${NC}"
    echo -e "${GREEN}🔍 To view logs: tail -f $LOG_FILE${NC}"
}

# Function to stop monitor
stop_monitor() {
    if [ ! -f "$PID_FILE" ]; then
        echo -e "${YELLOW}⚠️  No monitor process found${NC}"
        return 1
    fi
    
    local pid=$(cat "$PID_FILE")
    if kill -0 "$pid" 2>/dev/null; then
        echo -e "${YELLOW}🛑 Stopping monitor (PID: $pid)...${NC}"
        kill "$pid"
        rm -f "$PID_FILE"
        echo -e "${GREEN}✅ Monitor stopped${NC}"
    else
        echo -e "${YELLOW}⚠️  Monitor process not found, cleaning up PID file${NC}"
        rm -f "$PID_FILE"
    fi
}

# Function to show status
show_status() {
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        echo -e "${GREEN}✅ Monitor is running (PID: $(cat $PID_FILE))${NC}"
        echo -e "${GREEN}📝 Logs: $LOG_FILE${NC}"
        echo -e "${GREEN}🔍 To view logs: tail -f $LOG_FILE${NC}"
    else
        echo -e "${RED}❌ Monitor is not running${NC}"
    fi
}

# Function to show logs
show_logs() {
    if [ -f "$LOG_FILE" ]; then
        echo -e "${GREEN}📝 Showing last 50 lines of monitor logs:${NC}"
        echo "----------------------------------------"
        tail -50 "$LOG_FILE"
        echo "----------------------------------------"
        echo -e "${GREEN}🔍 To follow logs: tail -f $LOG_FILE${NC}"
    else
        echo -e "${YELLOW}⚠️  No log file found${NC}"
    fi
}

# Main script logic
case "$1" in
    start)
        start_monitor
        ;;
    stop)
        stop_monitor
        ;;
    restart)
        stop_monitor
        sleep 2
        start_monitor
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the comprehensive monitor"
        echo "  stop    - Stop the comprehensive monitor"
        echo "  restart - Restart the comprehensive monitor"
        echo "  status  - Show monitor status"
        echo "  logs    - Show recent monitor logs"
        echo ""
        echo "Examples:"
        echo "  $0 start    # Start monitoring"
        echo "  $0 status   # Check if running"
        echo "  $0 logs     # View recent logs"
        echo "  $0 stop     # Stop monitoring"
        exit 1
        ;;
esac
