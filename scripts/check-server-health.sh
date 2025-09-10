#!/bin/bash
# Server health check and process management script
# Usage: ./scripts/check-server-health.sh

PORT=5001
HEALTH_URL="http://localhost:$PORT/health"
BACKEND_DIR="/Users/scooper/Code/tcc-new-project/backend"

echo "🔍 Checking TCC Backend server health..."

# Check if port is in use
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✅ Port $PORT is in use"
    
    # Test health endpoint
    if curl -s $HEALTH_URL > /dev/null 2>&1; then
        echo "✅ Server is healthy and responding"
        
        # Test critical APIs
        echo "🧪 Testing critical APIs..."
        
        # Get auth token
        TOKEN=$(curl -s -X POST http://localhost:$PORT/api/auth/login \
            -H "Content-Type: application/json" \
            -d '{"email": "admin@tcc.com", "password": "admin123"}' \
            2>/dev/null | jq -r '.token' 2>/dev/null)
        
        if [ "$TOKEN" != "null" ] && [ "$TOKEN" != "" ]; then
            echo "✅ Authentication working"
            
            # Test units API
            UNITS_RESPONSE=$(curl -s http://localhost:$PORT/api/tcc/units \
                -H "Authorization: Bearer $TOKEN" 2>/dev/null | jq -r '.success' 2>/dev/null)
            
            if [ "$UNITS_RESPONSE" = "true" ]; then
                echo "✅ Units API working"
            else
                echo "❌ Units API failing"
                exit 1
            fi
            
            # Test dropdown options API
            DROPDOWN_RESPONSE=$(curl -s http://localhost:$PORT/api/dropdown-options/insurance \
                -H "Authorization: Bearer $TOKEN" 2>/dev/null | jq -r '.success' 2>/dev/null)
            
            if [ "$DROPDOWN_RESPONSE" = "true" ]; then
                echo "✅ Dropdown Options API working"
            else
                echo "❌ Dropdown Options API failing"
                exit 1
            fi
            
            echo "🎉 All systems operational!"
            exit 0
        else
            echo "❌ Authentication failing"
            exit 1
        fi
    else
        echo "❌ Server is not responding on port $PORT"
        echo "🧹 Server may be in a bad state, cleanup recommended"
        exit 1
    fi
else
    echo "❌ Port $PORT is not in use - server not running"
    exit 1
fi
