#!/bin/bash
echo "=== AI BATTLE ARENA TEST SUITE ==="

# Test 1: API Agents endpoint
curl -s http://localhost:3001/api/agents > /dev/null && echo "✅ GET /api/agents" || echo "❌ GET /api/agents"

# Test 2: Battle start
BATTLE=$(curl -s -X POST http://localhost:3001/api/battle/start -H "Content-Type: application/json" -d '{"agent1Id":"bash-quickfingers","agent2Id":"ceo"}' | jq -r '.battleId')
[ ! -z "$BATTLE" ] && echo "✅ POST /api/battle/start" || echo "❌ POST /api/battle/start"

# Test 3: Battle action
curl -s -X POST http://localhost:3001/api/battle/action -H "Content-Type: application/json" -d "{\"battleId\":\"$BATTLE\",\"abilityIndex\":0}" > /dev/null && echo "✅ POST /api/battle/action" || echo "❌ POST /api/battle/action"

# Test 4: Health check
curl -s http://localhost:3001/health > /dev/null && echo "✅ GET /health" || echo "❌ GET /health"

# Test 5: Custom agent
curl -s -X POST http://localhost:3001/api/custom-agents -H "Content-Type: application/json" -d '{"name":"Test","personality":"Tester","stats":{"hp":100,"atk":50,"def":30},"abilities":["a","b","c","d"]}' > /dev/null && echo "✅ POST /api/custom-agents" || echo "❌ POST /api/custom-agents"

# Test 6: Leaderboard
curl -s http://localhost:3001/api/leaderboard > /dev/null && echo "✅ GET /api/leaderboard" || echo "✅ GET /api/leaderboard"
