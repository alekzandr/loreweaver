#!/usr/bin/env pwsh
# LoreWeaver - Start Script
# Launches a local web server and opens the app in your browser

$port = 8000
$url = "http://localhost:$port/index.html"

Write-Host "🎲 Starting LoreWeaver D&D Encounter Generator..." -ForegroundColor Cyan
Write-Host ""

# Check if port is already in use
$portInUse = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "⚠️  Port $port is already in use. Opening browser..." -ForegroundColor Yellow
    Start-Process $url
    Write-Host ""
    Write-Host "If the app doesn't load, stop the existing server and run this script again." -ForegroundColor Yellow
    exit
}

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start Python HTTP server in background
Write-Host "🌐 Starting web server on port $port..." -ForegroundColor Green
$serverProcess = Start-Process -FilePath "python3" -ArgumentList "-m", "http.server", "$port" -WorkingDirectory $scriptDir -PassThru -WindowStyle Hidden

# Wait a moment for server to start
Start-Sleep -Seconds 1

# Open browser
Write-Host "🌍 Opening browser at $url" -ForegroundColor Green
Start-Process $url

Write-Host ""
Write-Host "✅ LoreWeaver is running!" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server, or close this window." -ForegroundColor Yellow
Write-Host ""

# Keep the script running and wait for user to press Ctrl+C
try {
    Wait-Process -Id $serverProcess.Id
} catch {
    Write-Host ""
    Write-Host "🛑 Stopping server..." -ForegroundColor Yellow
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Server stopped." -ForegroundColor Green
}
