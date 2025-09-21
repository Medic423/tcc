# TCC Development Server Monitoring

This document describes the enhanced development server startup scripts with health monitoring capabilities.

## Available Scripts

### 1. `start-dev.sh` (Enhanced)
The original startup script enhanced with basic health monitoring:
- Health checks every 60 seconds
- Automatic restart on failure (max 5 attempts)
- Process monitoring and cleanup
- Same interface as before

### 2. `start-dev-monitored.sh` (Standalone)
A standalone version with the same monitoring features as the enhanced `start-dev.sh`.

### 3. `start-dev-advanced.sh` (Full Featured)
Advanced monitoring with configuration support:
- Configurable via `dev-monitor.config`
- Detailed logging to `dev-server.log`
- Email notifications (optional)
- Separate log files for backend and frontend
- Customizable health check intervals and restart limits

### 4. `check-dev-health.sh` (Health Checker)
Quick health check script to verify server status:
- Checks both frontend and backend health
- Shows response times
- Displays process and port status
- No server restart capabilities

## Configuration

### Basic Configuration (start-dev.sh)
The basic monitoring uses these defaults:
- Health check interval: 60 seconds
- Max restart attempts: 5
- Backend health URL: `http://localhost:5001/health`
- Frontend health URL: `http://localhost:3000`

### Advanced Configuration (start-dev-advanced.sh)
Create a `dev-monitor.config` file to customize behavior:

```bash
# Health check interval in seconds
HEALTH_CHECK_INTERVAL=60

# Maximum restart attempts
MAX_RESTARTS=5

# Health check URLs
BACKEND_HEALTH_URL=http://localhost:5001/health
FRONTEND_HEALTH_URL=http://localhost:3000

# Wait time between restart attempts
RESTART_DELAY=10

# Enable verbose logging
VERBOSE_LOGGING=false

# Email notifications (requires mail command)
ENABLE_EMAIL_NOTIFICATIONS=false
NOTIFICATION_EMAIL="your-email@example.com"
```

## Usage Examples

### Start with Basic Monitoring
```bash
./start-dev.sh
```

### Start with Advanced Monitoring
```bash
./start-dev-advanced.sh
```

### Quick Health Check
```bash
./check-dev-health.sh
```

### Stop All Servers
Press `Ctrl+C` in the terminal running the monitoring script.

## Features

### Health Monitoring
- **Backend**: Checks `/health` endpoint on port 5001
- **Frontend**: Checks root URL on port 3000
- **Interval**: Configurable (default: 60 seconds)
- **Response**: Automatic restart on failure

### Process Management
- **Cleanup**: Kills existing processes before starting
- **Port Management**: Ensures ports 3000 and 5001 are free
- **PID Tracking**: Monitors process IDs for proper cleanup
- **Graceful Shutdown**: Handles Ctrl+C and SIGTERM signals

### Logging
- **Console Output**: Real-time status messages
- **Log Files**: Detailed logging to `dev-server.log`
- **Separate Logs**: Backend and frontend logs in separate files
- **Timestamps**: All log entries include timestamps

### Error Handling
- **Restart Limits**: Prevents infinite restart loops
- **Port Conflicts**: Detects and reports port conflicts
- **Process Cleanup**: Ensures clean shutdown on errors
- **Notification**: Optional email alerts on failures

## Troubleshooting

### Port Already in Use
```bash
# Check what's using the ports
lsof -i :3000
lsof -i :5001

# Kill processes manually if needed
lsof -ti:3000 | xargs kill -9
lsof -ti:5001 | xargs kill -9
```

### Servers Won't Start
1. Check the log files:
   - `dev-server.log` - Main monitoring log
   - `backend.log` - Backend server log
   - `frontend.log` - Frontend server log

2. Verify dependencies:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. Check health endpoints manually:
   ```bash
   curl http://localhost:5001/health
   curl http://localhost:3000
   ```

### Monitoring Not Working
1. Check if the monitoring process is running:
   ```bash
   ps aux | grep monitor
   ```

2. Verify configuration file syntax:
   ```bash
   source dev-monitor.config
   ```

3. Check log files for error messages

## Integration with Existing Workflow

The enhanced `start-dev.sh` script maintains backward compatibility with your existing workflow. The monitoring features are added transparently, so you can continue using the same commands while benefiting from automatic health monitoring and restart capabilities.

## Performance Impact

The monitoring adds minimal overhead:
- Health checks use lightweight HTTP requests
- Monitoring runs in background processes
- No impact on development server performance
- Configurable check intervals to balance responsiveness and resource usage
