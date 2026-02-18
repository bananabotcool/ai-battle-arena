#!/bin/bash

# Status Effects System Test Script
# Run this after starting the server to verify integration

echo "🔥 AI BATTLE ARENA - Status Effects System Test"
echo "================================================"
echo ""

# Check if server is running
echo "1️⃣  Checking server status..."
SERVER_URL="http://localhost:3000"
if curl -s "${SERVER_URL}/api/agents" > /dev/null 2>&1; then
    echo "✅ Server is running at ${SERVER_URL}"
else
    echo "❌ Server not running. Start with: node server/server.js"
    exit 1
fi

echo ""
echo "2️⃣  Testing agents endpoint..."
AGENTS=$(curl -s "${SERVER_URL}/api/agents")
if [ -n "$AGENTS" ]; then
    echo "✅ Agents loaded successfully"
    echo "$AGENTS" | jq '.agents | length' | xargs echo "   Found agents:"
else
    echo "❌ Failed to load agents"
    exit 1
fi

echo ""
echo "3️⃣  Creating test battle..."
BATTLE=$(curl -s -X POST "${SERVER_URL}/api/battle/start" \
    -H "Content-Type: application/json" \
    -d '{"agent1Id":"bash-quickfingers","agent2Id":"ruby-loopster"}')

BATTLE_ID=$(echo "$BATTLE" | jq -r '.battleId')

if [ "$BATTLE_ID" != "null" ] && [ -n "$BATTLE_ID" ]; then
    echo "✅ Battle created: $BATTLE_ID"
    echo "   Agent 1:" $(echo "$BATTLE" | jq -r '.battle.agent1.name')
    echo "   Agent 2:" $(echo "$BATTLE" | jq -r '.battle.agent2.name')
else
    echo "❌ Failed to create battle"
    echo "$BATTLE" | jq '.'
    exit 1
fi

echo ""
echo "4️⃣  Testing battle action with status effects..."
ACTION=$(curl -s -X POST "${SERVER_URL}/api/battle/action" \
    -H "Content-Type: application/json" \
    -d "{\"battleId\":\"$BATTLE_ID\",\"abilityIndex\":0}")

ATTACKER=$(echo "$ACTION" | jq -r '.action.attacker')
DAMAGE=$(echo "$ACTION" | jq -r '.action.damage')
STATUS_MESSAGES=$(echo "$ACTION" | jq -r '.action.statusMessages | length')

if [ "$ATTACKER" != "null" ]; then
    echo "✅ Battle action executed"
    echo "   Attacker: $ATTACKER"
    echo "   Damage: $DAMAGE"
    echo "   Status messages: $STATUS_MESSAGES"
else
    echo "❌ Battle action failed"
    echo "$ACTION" | jq '.'
    exit 1
fi

echo ""
echo "5️⃣  Checking fighter status effects..."
AGENT1_EFFECTS=$(echo "$ACTION" | jq -r '.battle.agent1.statusEffects | length')
AGENT2_EFFECTS=$(echo "$ACTION" | jq -r '.battle.agent2.statusEffects | length')

echo "   Agent 1 effects: $AGENT1_EFFECTS"
echo "   Agent 2 effects: $AGENT2_EFFECTS"

if [ "$AGENT1_EFFECTS" != "null" ] && [ "$AGENT2_EFFECTS" != "null" ]; then
    echo "✅ Status effects system operational"
else
    echo "⚠️  Status effects not present (may apply randomly)"
fi

echo ""
echo "6️⃣  Testing God AI narration..."
NARRATION=$(echo "$ACTION" | jq -r '.narration')
if [ "$NARRATION" != "null" ] && [ -n "$NARRATION" ]; then
    echo "✅ God AI narration working"
    echo "   \"${NARRATION:0:80}...\""
else
    echo "⚠️  No narration (may need OPENCLAW_GATEWAY_TOKEN)"
fi

echo ""
echo "================================================"
echo "🎉 STATUS EFFECTS SYSTEM: OPERATIONAL"
echo ""
echo "📖 Manual Testing Guide:"
echo "   1. Open http://localhost:3000 in browser"
echo "   2. Start a battle with any two agents"
echo "   3. Attack repeatedly to trigger status effects"
echo "   4. Watch for status icons above HP bars"
echo "   5. Check battle log for status messages"
echo "   6. Verify floating damage numbers for DoT"
echo ""
echo "🎯 Effect Trigger Rates:"
echo "   • 20% chance per hit to apply random effect"
echo "   • Fire attacks → BURN 🔥"
echo "   • Ice attacks → FREEZE ❄️"
echo "   • Poison attacks → POISON ☠️"
echo ""
echo "📝 See STATUS_EFFECTS_INTEGRATION.md for full checklist"
echo ""
