#!/bin/bash
# LoreWeaver - Start Script (Linux/WSL)
# Launches a local web server and opens the app in your browser

PORT=8000
URL="http://localhost:$PORT/index.html"

echo "🎲 Starting LoreWeaver D&D Encounter Generator..."
echo ""

# Check if port is already in use
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port $PORT is already in use."
    echo "Opening browser anyway..."
    
    # Try to open browser (works in WSL)
    if command -v explorer.exe &> /dev/null; then
        explorer.exe "$URL" 2>/dev/null
    elif command -v xdg-open &> /dev/null; then
        xdg-open "$URL" 2>/dev/null
    else
        echo "Please open your browser and navigate to: $URL"
    fi
    exit 1
fi

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "🌐 Starting web server on port $PORT..."

# Start Python HTTP server in background
python3 -m http.server $PORT > /dev/null 2>&1 &
SERVER_PID=$!

# Wait a moment for server to start
sleep 1

# Open browser
echo "🌍 Opening browser at $URL"

# Try different methods to open browser (WSL-friendly)
if command -v explorer.exe &> /dev/null; then
    # WSL - use Windows explorer
    explorer.exe "$URL" 2>/dev/null
elif command -v xdg-open &> /dev/null; then
    # Linux with xdg-open
    xdg-open "$URL" 2>/dev/null
else
    echo "Could not auto-open browser. Please navigate to: $URL"
fi

echo ""
echo "✅ LoreWeaver is running!"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Trap Ctrl+C to cleanly shut down
trap "echo ''; echo '🛑 Stopping server...'; kill $SERVER_PID 2>/dev/null; echo '✅ Server stopped.'; exit 0" INT TERM

# Wait for the server process
wait $SERVER_PID
