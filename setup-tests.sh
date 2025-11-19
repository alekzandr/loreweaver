#!/bin/bash

# LoreWeaver Testing Setup Script
# This script sets up the testing environment

echo "🔧 Setting up LoreWeaver testing environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "📦 Node.js not found. Installing Node.js..."
    
    # Install Node.js 18.x (LTS)
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    echo "✅ Node.js installed: $(node --version)"
    echo "✅ npm installed: $(npm --version)"
else
    echo "✅ Node.js already installed: $(node --version)"
    echo "✅ npm already installed: $(npm --version)"
fi

# Install dependencies
echo ""
echo "📦 Installing npm dependencies..."
npm install

# Run tests
echo ""
echo "🧪 Running tests..."
npm test

echo ""
echo "✅ Setup complete!"
echo ""
echo "Available commands:"
echo "  npm test          - Run all tests"
echo "  npm run lint      - Lint JavaScript files"
echo "  npm run test:json - Validate JSON files"
echo "  npm run test:html - Validate HTML structure"
echo "  npm start         - Start local server on port 8000"
