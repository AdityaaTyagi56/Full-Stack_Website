#!/bin/bash

# ============================================
# NSS Website - Quick Start Script
# ============================================
# This script starts the backend server and opens the frontend.
# MongoDB Atlas is cloud-hosted, so no local DB startup needed.
# ============================================

echo "🚀 Starting NSS Website..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Backend directory not found at $BACKEND_DIR"
    exit 1
fi

# Check if server.js exists
if [ ! -f "$BACKEND_DIR/server.js" ]; then
    echo "❌ server.js not found in $BACKEND_DIR"
    exit 1
fi

# Kill any existing process on port 5003
echo -e "${YELLOW}🔄 Checking for existing processes on port 5003...${NC}"
lsof -ti:5003 | xargs kill -9 2>/dev/null
sleep 1

# Start the backend server
echo -e "${GREEN}✅ Starting Backend Server...${NC}"
cd "$BACKEND_DIR"
node server.js &
BACKEND_PID=$!

# Wait for server to start
sleep 3

# Check if server is running
if curl -s http://localhost:5003/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running at http://localhost:5003${NC}"
else
    echo -e "${YELLOW}⚠️  Backend may still be starting...${NC}"
fi

# Open the frontend in the default browser
echo -e "${BLUE}🌐 Opening Frontend in browser...${NC}"
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "$FRONTEND_DIR/index.html"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open "$FRONTEND_DIR/index.html"
fi

echo ""
echo "============================================"
echo -e "${GREEN}🎉 NSS Website is now running!${NC}"
echo "============================================"
echo ""
echo "📡 Backend API:    http://localhost:5003"
echo "🌐 Frontend:       $FRONTEND_DIR/index.html"
echo "👨‍💻 Admin Panel:    $FRONTEND_DIR/admin.html"
echo ""
echo "📝 Admin Password: nssadmin123"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

# Keep the script running and wait for the backend process
wait $BACKEND_PID
