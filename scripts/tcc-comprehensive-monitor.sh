#!/bin/bash

# TCC Comprehensive Monitor Script
# Monitors: Backend health, Frontend health, Environment files, Database connections
# Runs every 30 seconds with hash-based environment file change detection

# Configuration
MONITOR_INTERVAL=30
LOG_FILE="tcc-monitor.log"
HASH_FILE=".env-hashes.txt"
PROJECT_ROOT="/Users/scooper/Code/tcc-new-project"

# Color codes for console output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Environment files to monitor (with priority levels)
# Using arrays instead of associative arrays for compatibility
ENV_FILES=(
    "backend/.env:CRITICAL"
    "frontend/.env.production:WARNING"
    "frontend/.env.local:INFO"
    "frontend/.env.production.local:WARNING"
    ".vercel/.env.preview.local:INFO"
)

# Initialize hash file if it doesn't exist
init_hash_file() {
    if [ ! -f "$HASH_FILE" ]; then
        echo "# TCC Environment File Hashes" > "$HASH_FILE"
        echo "# Format: file_path|hash|timestamp" >> "$HASH_FILE"
        echo "Initialized hash file: $HASH_FILE"
    fi
}

# Calculate hash for a file
calculate_hash() {
    local file_path="$1"
    if [ -f "$file_path" ]; then
        md5sum "$file_path" | cut -d' ' -f1
    else
        echo "FILE_NOT_FOUND"
    fi
}

# Check environment file changes
check_env_changes() {
    local changes_detected=false
    local current_time=$(date '+%Y-%m-%d %H:%M:%S')
    
    echo -e "${BLUE}🔍 Checking environment files...${NC}"
    
    for file_entry in "${ENV_FILES[@]}"; do
        local file_path=$(echo "$file_entry" | cut -d':' -f1)
        local priority=$(echo "$file_entry" | cut -d':' -f2)
        local full_path="$PROJECT_ROOT/$file_path"
        local current_hash=$(calculate_hash "$full_path")
        local stored_hash=$(grep "^$file_path|" "$HASH_FILE" | cut -d'|' -f2)
        
        if [ "$current_hash" != "$stored_hash" ]; then
            changes_detected=true
            
            # Update hash file
            if [ "$current_hash" != "FILE_NOT_FOUND" ]; then
                # Remove old entry and add new one
                grep -v "^$file_path|" "$HASH_FILE" > "$HASH_FILE.tmp" 2>/dev/null && mv "$HASH_FILE.tmp" "$HASH_FILE" 2>/dev/null || true
                echo "$file_path|$current_hash|$current_time" >> "$HASH_FILE"
            fi
            
            # Display warning based on priority
            case $priority in
                "CRITICAL")
                    echo -e "${RED}🚨 CRITICAL: Environment file changed: $file_path${NC}"
                    echo -e "${RED}   This could affect production deployment!${NC}"
                    ;;
                "WARNING")
                    echo -e "${YELLOW}⚠️  WARNING: Environment file changed: $file_path${NC}"
                    echo -e "${YELLOW}   This could affect deployment configuration${NC}"
                    ;;
                "INFO")
                    echo -e "${CYAN}ℹ️  INFO: Environment file changed: $file_path${NC}"
                    ;;
            esac
            
            # Log the change
            echo "[$current_time] $priority: $file_path changed (hash: $current_hash)" >> "$LOG_FILE"
        fi
    done
    
    if [ "$changes_detected" = false ]; then
        echo -e "${GREEN}✅ All environment files unchanged${NC}"
    fi
}

# Check backend health
check_backend_health() {
    echo -e "${BLUE}🔍 Checking backend health...${NC}"
    
    if curl -s http://localhost:5001/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is healthy (port 5001)${NC}"
        return 0
    else
        echo -e "${RED}❌ Backend is unhealthy (port 5001)${NC}"
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Backend health check failed" >> "$LOG_FILE"
        return 1
    fi
}

# Check frontend health
check_frontend_health() {
    echo -e "${BLUE}🔍 Checking frontend health...${NC}"
    
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is healthy (port 3000)${NC}"
        return 0
    else
        echo -e "${RED}❌ Frontend is unhealthy (port 3000)${NC}"
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Frontend health check failed" >> "$LOG_FILE"
        return 1
    fi
}

# Check database connections
check_database_health() {
    echo -e "${BLUE}🔍 Checking database connections...${NC}"
    
    local db_healthy=true
    
    # Check if PostgreSQL is running
    if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
        echo -e "${RED}❌ PostgreSQL is not running${NC}"
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: PostgreSQL connection failed" >> "$LOG_FILE"
        db_healthy=false
    else
        echo -e "${GREEN}✅ PostgreSQL is running${NC}"
    fi
    
    # Check specific databases
    for db in tcc_center tcc_hospital tcc_ems; do
        if psql -h localhost -U scooper -d "$db" -c "SELECT 1;" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Database $db is accessible${NC}"
        else
            echo -e "${RED}❌ Database $db is not accessible${NC}"
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Database $db connection failed" >> "$LOG_FILE"
            db_healthy=false
        fi
    done
    
    return $([ "$db_healthy" = true ] && echo 0 || echo 1)
}

# Check system resources
check_system_resources() {
    echo -e "${BLUE}🔍 Checking system resources...${NC}"
    
    # Check disk space
    local disk_usage=$(df -h "$PROJECT_ROOT" | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 90 ]; then
        echo -e "${RED}⚠️  Disk usage is high: ${disk_usage}%${NC}"
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: Disk usage is ${disk_usage}%" >> "$LOG_FILE"
    else
        echo -e "${GREEN}✅ Disk usage is normal: ${disk_usage}%${NC}"
    fi
    
    # Check memory usage
    local memory_usage=$(ps aux | grep -E "(node|npm)" | grep -v grep | awk '{print $3}' | awk '{sum+=$1} END {print int(sum+0)}')
    if [ "$memory_usage" -gt 80 ]; then
        echo -e "${YELLOW}⚠️  Memory usage is high: ${memory_usage}%${NC}"
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: Memory usage is ${memory_usage}%" >> "$LOG_FILE"
    else
        echo -e "${GREEN}✅ Memory usage is normal: ${memory_usage}%${NC}"
    fi
}

# Main monitoring loop
main_monitor() {
    echo -e "${PURPLE}🚀 Starting TCC Comprehensive Monitor${NC}"
    echo -e "${PURPLE}   Monitoring interval: ${MONITOR_INTERVAL} seconds${NC}"
    echo -e "${PURPLE}   Log file: $LOG_FILE${NC}"
    echo -e "${PURPLE}   Hash file: $HASH_FILE${NC}"
    echo ""
    
    # Initialize hash file
    init_hash_file
    
    # Initial hash calculation
    echo -e "${BLUE}📊 Calculating initial environment file hashes...${NC}"
    for file_entry in "${ENV_FILES[@]}"; do
        local file_path=$(echo "$file_entry" | cut -d':' -f1)
        local full_path="$PROJECT_ROOT/$file_path"
        local hash=$(calculate_hash "$full_path")
        local current_time=$(date '+%Y-%m-%d %H:%M:%S')
        
        if [ "$hash" != "FILE_NOT_FOUND" ]; then
            # Remove old entry and add new one
            grep -v "^$file_path|" "$HASH_FILE" > "$HASH_FILE.tmp" 2>/dev/null && mv "$HASH_FILE.tmp" "$HASH_FILE" 2>/dev/null || true
            echo "$file_path|$hash|$current_time" >> "$HASH_FILE"
            echo -e "${GREEN}✅ $file_path: $hash${NC}"
        else
            echo -e "${YELLOW}⚠️  $file_path: File not found${NC}"
        fi
    done
    echo ""
    
    # Main monitoring loop
    while true; do
        local current_time=$(date '+%Y-%m-%d %H:%M:%S')
        echo -e "${CYAN}🕐 [$current_time] Monitoring cycle started${NC}"
        echo "----------------------------------------"
        
        # Run all health checks
        check_backend_health
        local backend_healthy=$?
        check_frontend_health
        local frontend_healthy=$?
        check_database_health
        local database_healthy=$?
        check_system_resources
        check_env_changes
        
        echo "----------------------------------------"
        
        # Summary
        if [ "$backend_healthy" -eq 0 ] && [ "$frontend_healthy" -eq 0 ] && [ "$database_healthy" -eq 0 ]; then
            echo -e "${GREEN}✅ All systems healthy${NC}"
        else
            echo -e "${RED}❌ Some systems are unhealthy${NC}"
        fi
        
        echo -e "${CYAN}⏰ Next check in ${MONITOR_INTERVAL} seconds...${NC}"
        echo ""
        
        sleep $MONITOR_INTERVAL
    done
}

# Signal handling for graceful shutdown
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down TCC Comprehensive Monitor...${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Monitor stopped by user" >> "$LOG_FILE"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Run the monitor
main_monitor
