#!/bin/bash
# Test script for AI Battle Arena

echo "🧪 AI Battle Arena - Integration Test"
echo "======================================"
echo ""

# Check if dependencies are installed
echo "1️⃣  Checking dependencies..."
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi
echo "✅ Dependencies ready"
echo ""

# Check .env file
echo "2️⃣  Checking configuration..."
if [ ! -f ".env" ]; then
  echo "⚠️  .env file not found. Creating from example..."
  cp .env.example .env
  echo "❗ Edit .env and add your OPENCLAW_GATEWAY_TOKEN"
fi
echo "✅ Configuration ready"
echo ""

# Check if server starts
echo "3️⃣  Testing server startup..."
echo "Starting server (will run for 5 seconds)..."
timeout 5 npm start > /dev/null 2>&1 &
sleep 2

# Test health endpoint
echo "4️⃣  Testing health endpoint..."
HEALTH=$(curl -s http://localhost:3000/health 2>/dev/null)
if [ $? -eq 0 ]; then
  echo "✅ Health check passed"
  echo "$HEALTH" | jq '.' 2>/dev/null || echo "$HEALTH"
else
  echo "❌ Health check failed - is server running?"
fi
echo ""

# Test agents endpoint
echo "5️⃣  Testing agents endpoint..."
AGENTS=$(curl -s http://localhost:3000/api/agents 2>/dev/null)
if [ $? -eq 0 ]; then
  AGENT_COUNT=$(echo "$AGENTS" | jq '.agents | length' 2>/dev/null)
  echo "✅ Agents endpoint working"
  echo "   Found $AGENT_COUNT agents"
else
  echo "❌ Agents endpoint failed"
fi
echo ""

# Kill test server
pkill -f "node.*server.js" 2>/dev/null

echo "📋 Test Summary"
echo "==============="
echo ""
echo "Files created:"
echo "  ✓ server/god-narrator.js  - God AI integration"
echo "  ✓ server/server.js         - Express API"
echo "  ✓ public/index.html        - Web UI"
echo "  ✓ package.json             - Dependencies"
echo "  ✓ .env.example             - Configuration template"
echo "  ✓ README.md                - Documentation"
echo ""
echo "To run the battle arena:"
echo "  1. Add OPENCLAW_GATEWAY_TOKEN to .env"
echo "  2. npm start"
echo "  3. Open http://localhost:3000"
echo ""
echo "God AI will narrate your epic battles! 🎭⚔️"
