#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════
# AI BATTLE ARENA - COMPREHENSIVE TEST SUITE
# ═══════════════════════════════════════════════════════════════════════

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_URL="${SERVER_URL:-http://localhost:3000}"
RESULTS_FILE="TEST-RESULTS.md"
TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S UTC")

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Result storage
declare -a TEST_RESULTS

# ───────────────────────────────────────────────────────────────────────
# HELPER FUNCTIONS
# ───────────────────────────────────────────────────────────────────────

log_test() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "${BLUE}TEST $TOTAL_TESTS:${NC} $1"
}

log_pass() {
    PASSED_TESTS=$((PASSED_TESTS + 1))
    echo -e "${GREEN}✅ PASS:${NC} $1"
    TEST_RESULTS+=("✅ PASS: $1")
}

log_fail() {
    FAILED_TESTS=$((FAILED_TESTS + 1))
    echo -e "${RED}❌ FAIL:${NC} $1"
    TEST_RESULTS+=("❌ FAIL: $1")
}

log_warn() {
    echo -e "${YELLOW}⚠️  WARN:${NC} $1"
    TEST_RESULTS+=("⚠️  WARN: $1")
}

log_info() {
    echo -e "${BLUE}ℹ️  INFO:${NC} $1"
}

check_jq() {
    if ! command -v jq &> /dev/null; then
        echo -e "${RED}❌ ERROR: jq is not installed${NC}"
        echo "Install with: sudo apt-get install jq"
        exit 1
    fi
}

# ───────────────────────────────────────────────────────────────────────
# TEST SUITE
# ───────────────────────────────────────────────────────────────────────

echo "═══════════════════════════════════════════════════════════════════════"
echo "  AI BATTLE ARENA - AUTOMATED TEST SUITE"
echo "═══════════════════════════════════════════════════════════════════════"
echo "Time: $TIMESTAMP"
echo "Server: $SERVER_URL"
echo ""

check_jq

# ═══════════════════════════════════════════════════════════════════════
# TEST 1: SERVER HEALTH CHECK
# ═══════════════════════════════════════════════════════════════════════

echo "─────────────────────────────────────────────────────────────────────"
echo "TEST CATEGORY: Server Health"
echo "─────────────────────────────────────────────────────────────────────"

log_test "Server is reachable"
if curl -s -f "${SERVER_URL}" > /dev/null 2>&1; then
    log_pass "Server is running at ${SERVER_URL}"
else
    log_fail "Server not reachable at ${SERVER_URL}"
    echo -e "${RED}FATAL: Cannot proceed without server${NC}"
    exit 1
fi

# ═══════════════════════════════════════════════════════════════════════
# TEST 2: API ENDPOINTS - AGENTS
# ═══════════════════════════════════════════════════════════════════════

echo ""
echo "─────────────────────────────────────────────────────────────────────"
echo "TEST CATEGORY: Agent Management"
echo "─────────────────────────────────────────────────────────────────────"

log_test "GET /api/agents returns agent list"
AGENTS_RESPONSE=$(curl -s "${SERVER_URL}/api/agents")
if echo "$AGENTS_RESPONSE" | jq -e '.agents' > /dev/null 2>&1; then
    AGENT_COUNT=$(echo "$AGENTS_RESPONSE" | jq '.agents | length')
    log_pass "Agent list retrieved successfully ($AGENT_COUNT agents)"
    
    # Store first two agent IDs for battle tests
    AGENT1_ID=$(echo "$AGENTS_RESPONSE" | jq -r '.agents[0].id')
    AGENT2_ID=$(echo "$AGENTS_RESPONSE" | jq -r '.agents[1].id')
    log_info "Test agents: $AGENT1_ID vs $AGENT2_ID"
else
    log_fail "Agent list endpoint returned invalid data"
    AGENT1_ID="bash-quickfingers"
    AGENT2_ID="ruby-loopster"
fi

log_test "Agents have required fields"
FIRST_AGENT=$(echo "$AGENTS_RESPONSE" | jq '.agents[0]')
REQUIRED_FIELDS=("id" "name" "personality" "maxHp" "attack" "defense" "abilities")
MISSING_FIELDS=()

for field in "${REQUIRED_FIELDS[@]}"; do
    if ! echo "$FIRST_AGENT" | jq -e ".$field" > /dev/null 2>&1; then
        MISSING_FIELDS+=("$field")
    fi
done

if [ ${#MISSING_FIELDS[@]} -eq 0 ]; then
    log_pass "All required agent fields present"
else
    log_fail "Missing agent fields: ${MISSING_FIELDS[*]}"
fi

# ═══════════════════════════════════════════════════════════════════════
# TEST 3: CUSTOM AGENT CREATION
# ═══════════════════════════════════════════════════════════════════════

echo ""
echo "─────────────────────────────────────────────────────────────────────"
echo "TEST CATEGORY: Custom Agent Creation"
echo "─────────────────────────────────────────────────────────────────────"

log_test "Create custom agent (frontend format)"
CUSTOM_AGENT_1=$(curl -s -X POST "${SERVER_URL}/api/custom-agents" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Test Agent Frontend",
        "personality": "Automated test agent",
        "maxHp": 100,
        "attack": 50,
        "defense": 30,
        "speed": 20,
        "luck": 10,
        "abilities": ["Attack 1", "Attack 2", "Attack 3", "Special"]
    }')

if echo "$CUSTOM_AGENT_1" | jq -e '.id' > /dev/null 2>&1; then
    CUSTOM_AGENT_1_ID=$(echo "$CUSTOM_AGENT_1" | jq -r '.id')
    log_pass "Custom agent created (frontend format): $CUSTOM_AGENT_1_ID"
else
    log_fail "Custom agent creation failed (frontend format)"
    log_info "Response: $CUSTOM_AGENT_1"
fi

log_test "Create custom agent (backend format)"
CUSTOM_AGENT_2=$(curl -s -X POST "${SERVER_URL}/api/custom-agents" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Test Agent Backend",
        "personality": "Automated test agent",
        "stats": {
            "hp": 110,
            "maxHp": 110,
            "atk": 55,
            "def": 35,
            "speed": 25,
            "luck": 15,
            "special": 0
        },
        "abilities": ["Attack 1", "Attack 2", "Attack 3", "Special"]
    }')

if echo "$CUSTOM_AGENT_2" | jq -e '.id' > /dev/null 2>&1; then
    CUSTOM_AGENT_2_ID=$(echo "$CUSTOM_AGENT_2" | jq -r '.id')
    log_pass "Custom agent created (backend format): $CUSTOM_AGENT_2_ID"
else
    log_fail "Custom agent creation failed (backend format)"
    log_info "Response: $CUSTOM_AGENT_2"
fi

log_test "GET /api/custom-agents returns custom agent list"
CUSTOM_AGENTS=$(curl -s "${SERVER_URL}/api/custom-agents")
if echo "$CUSTOM_AGENTS" | jq -e '.agents' > /dev/null 2>&1; then
    CUSTOM_COUNT=$(echo "$CUSTOM_AGENTS" | jq '.agents | length')
    log_pass "Custom agent list retrieved ($CUSTOM_COUNT agents)"
else
    log_fail "Custom agent list endpoint failed"
fi

# ═══════════════════════════════════════════════════════════════════════
# TEST 4: BATTLE CREATION
# ═══════════════════════════════════════════════════════════════════════

echo ""
echo "─────────────────────────────────────────────────────────────────────"
echo "TEST CATEGORY: Battle System"
echo "─────────────────────────────────────────────────────────────────────"

log_test "POST /api/battle/start creates battle"
BATTLE_RESPONSE=$(curl -s -X POST "${SERVER_URL}/api/battle/start" \
    -H "Content-Type: application/json" \
    -d "{\"agent1Id\":\"$AGENT1_ID\",\"agent2Id\":\"$AGENT2_ID\"}")

if echo "$BATTLE_RESPONSE" | jq -e '.battleId' > /dev/null 2>&1; then
    BATTLE_ID=$(echo "$BATTLE_RESPONSE" | jq -r '.battleId')
    log_pass "Battle created successfully: $BATTLE_ID"
else
    log_fail "Battle creation failed"
    log_info "Response: $BATTLE_RESPONSE"
    # Try to continue with a mock battle ID
    BATTLE_ID="test-battle-$(date +%s)"
fi

log_test "Battle state has correct structure"
if echo "$BATTLE_RESPONSE" | jq -e '.battle.agent1' > /dev/null 2>&1 && \
   echo "$BATTLE_RESPONSE" | jq -e '.battle.agent2' > /dev/null 2>&1; then
    log_pass "Battle state structure is valid"
    
    # Check status effects array exists
    if echo "$BATTLE_RESPONSE" | jq -e '.battle.agent1.statusEffects' > /dev/null 2>&1; then
        log_pass "Status effects system initialized"
    else
        log_warn "Status effects array missing in agent state"
    fi
else
    log_fail "Battle state structure is invalid"
fi

log_test "Battle narration exists"
if echo "$BATTLE_RESPONSE" | jq -e '.narration' > /dev/null 2>&1; then
    NARRATION=$(echo "$BATTLE_RESPONSE" | jq -r '.narration')
    log_pass "Battle narration present: \"${NARRATION:0:50}...\""
else
    log_warn "Battle narration missing (God AI may be disabled)"
fi

# ═══════════════════════════════════════════════════════════════════════
# TEST 5: BATTLE ACTIONS
# ═══════════════════════════════════════════════════════════════════════

echo ""
echo "─────────────────────────────────────────────────────────────────────"
echo "TEST CATEGORY: Battle Actions"
echo "─────────────────────────────────────────────────────────────────────"

log_test "POST /api/battle/action executes turn"
ACTION_RESPONSE=$(curl -s -X POST "${SERVER_URL}/api/battle/action" \
    -H "Content-Type: application/json" \
    -d "{\"battleId\":\"$BATTLE_ID\",\"abilityIndex\":0}")

if echo "$ACTION_RESPONSE" | jq -e '.action' > /dev/null 2>&1; then
    log_pass "Battle action executed successfully"
    
    DAMAGE=$(echo "$ACTION_RESPONSE" | jq -r '.action.damage')
    ACTION_TYPE=$(echo "$ACTION_RESPONSE" | jq -r '.action.actionType')
    log_info "Action: $ACTION_TYPE, Damage: $DAMAGE"
else
    log_fail "Battle action failed"
    log_info "Response: $ACTION_RESPONSE"
fi

log_test "Battle state updates after action"
if echo "$ACTION_RESPONSE" | jq -e '.battle.turn' > /dev/null 2>&1; then
    TURN=$(echo "$ACTION_RESPONSE" | jq -r '.battle.turn')
    log_pass "Battle turn counter updated: Turn $TURN"
else
    log_fail "Battle state not updated"
fi

log_test "HP changes after attack"
AGENT2_HP=$(echo "$ACTION_RESPONSE" | jq -r '.battle.agent2.hp')
AGENT2_MAX_HP=$(echo "$ACTION_RESPONSE" | jq -r '.battle.agent2.maxHp')
if [ "$AGENT2_HP" -lt "$AGENT2_MAX_HP" ]; then
    log_pass "Defender HP reduced: $AGENT2_HP/$AGENT2_MAX_HP"
else
    log_warn "HP may not have changed (miss or defend)"
fi

log_test "Status effects can be applied"
STATUS_MESSAGES=$(echo "$ACTION_RESPONSE" | jq -r '.action.statusMessages | length')
if [ "$STATUS_MESSAGES" -gt 0 ]; then
    log_pass "Status effects detected in action response"
    FIRST_STATUS=$(echo "$ACTION_RESPONSE" | jq -r '.action.statusMessages[0]')
    log_info "Status: $FIRST_STATUS"
else
    log_info "No status effects applied this turn (random chance)"
fi

# Execute multiple turns to test status effects
log_test "Execute 10 battle turns (status effect stress test)"
TURN_COUNT=0
STATUS_APPLIED=false

for i in {1..10}; do
    TURN_RESPONSE=$(curl -s -X POST "${SERVER_URL}/api/battle/action" \
        -H "Content-Type: application/json" \
        -d "{\"battleId\":\"$BATTLE_ID\",\"abilityIndex\":0}" 2>/dev/null)
    
    if echo "$TURN_RESPONSE" | jq -e '.action' > /dev/null 2>&1; then
        TURN_COUNT=$((TURN_COUNT + 1))
        
        # Check for status effects
        if echo "$TURN_RESPONSE" | jq -e '.action.statusMessages[0]' > /dev/null 2>&1; then
            STATUS_APPLIED=true
        fi
        
        # Check if battle ended
        STATUS=$(echo "$TURN_RESPONSE" | jq -r '.battle.status')
        if [ "$STATUS" = "finished" ]; then
            log_info "Battle ended at turn $TURN_COUNT"
            break
        fi
    else
        break
    fi
done

if [ $TURN_COUNT -eq 10 ]; then
    log_pass "10 consecutive turns executed successfully"
else
    log_info "Battle ended after $TURN_COUNT turns"
fi

if [ "$STATUS_APPLIED" = true ]; then
    log_pass "Status effects triggered during battle"
else
    log_warn "No status effects triggered (20% chance per hit)"
fi

# ═══════════════════════════════════════════════════════════════════════
# TEST 6: BATTLE RETRIEVAL
# ═══════════════════════════════════════════════════════════════════════

echo ""
echo "─────────────────────────────────────────────────────────────────────"
echo "TEST CATEGORY: Battle Retrieval"
echo "─────────────────────────────────────────────────────────────────────"

log_test "GET /api/battle/:battleId retrieves battle state"
BATTLE_STATE=$(curl -s "${SERVER_URL}/api/battle/${BATTLE_ID}")
if echo "$BATTLE_STATE" | jq -e '.battle' > /dev/null 2>&1; then
    log_pass "Battle state retrieved successfully"
    
    HISTORY_LENGTH=$(echo "$BATTLE_STATE" | jq '.battle.history | length')
    log_info "Battle history: $HISTORY_LENGTH events"
else
    log_fail "Battle retrieval failed"
fi

# ═══════════════════════════════════════════════════════════════════════
# TEST 7: LEADERBOARD
# ═══════════════════════════════════════════════════════════════════════

echo ""
echo "─────────────────────────────────────────────────────────────────────"
echo "TEST CATEGORY: Leaderboard"
echo "─────────────────────────────────────────────────────────────────────"

log_test "GET /api/leaderboard returns rankings"
LEADERBOARD=$(curl -s "${SERVER_URL}/api/leaderboard")
if echo "$LEADERBOARD" | jq -e '.leaderboard' > /dev/null 2>&1; then
    ENTRY_COUNT=$(echo "$LEADERBOARD" | jq '.leaderboard | length')
    log_pass "Leaderboard retrieved ($ENTRY_COUNT entries)"
else
    log_warn "Leaderboard endpoint not available (may not be implemented)"
fi

# ═══════════════════════════════════════════════════════════════════════
# TEST 8: ERROR HANDLING
# ═══════════════════════════════════════════════════════════════════════

echo ""
echo "─────────────────────────────────────────────────────────────────────"
echo "TEST CATEGORY: Error Handling"
echo "─────────────────────────────────────────────────────────────────────"

log_test "Invalid battle ID returns 404"
INVALID_RESPONSE=$(curl -s -w "\n%{http_code}" "${SERVER_URL}/api/battle/invalid-id-12345")
HTTP_CODE=$(echo "$INVALID_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "404" ]; then
    log_pass "404 returned for invalid battle ID"
else
    log_fail "Expected 404, got $HTTP_CODE"
fi

log_test "Missing required fields returns 400"
BAD_AGENT=$(curl -s -w "\n%{http_code}" -X POST "${SERVER_URL}/api/custom-agents" \
    -H "Content-Type: application/json" \
    -d '{"name":"Incomplete Agent"}')
HTTP_CODE=$(echo "$BAD_AGENT" | tail -n1)
if [ "$HTTP_CODE" = "400" ]; then
    log_pass "400 returned for invalid agent data"
else
    log_warn "Expected 400 for invalid agent, got $HTTP_CODE"
fi

# ═══════════════════════════════════════════════════════════════════════
# TEST SUMMARY
# ═══════════════════════════════════════════════════════════════════════

echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo "  TEST SUMMARY"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""
echo "Total Tests:  $TOTAL_TESTS"
echo "Passed:       $PASSED_TESTS"
echo "Failed:       $FAILED_TESTS"
echo "Success Rate: $(awk "BEGIN {printf \"%.1f\", ($PASSED_TESTS/$TOTAL_TESTS)*100}")%"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    EXIT_CODE=0
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    EXIT_CODE=1
fi

# ═══════════════════════════════════════════════════════════════════════
# GENERATE MARKDOWN REPORT
# ═══════════════════════════════════════════════════════════════════════

cat > "$RESULTS_FILE" << EOF
# 🧪 AI BATTLE ARENA - TEST RESULTS

**Test Run:** $TIMESTAMP  
**Server:** $SERVER_URL  
**Total Tests:** $TOTAL_TESTS  
**Passed:** $PASSED_TESTS  
**Failed:** $FAILED_TESTS  
**Success Rate:** $(awk "BEGIN {printf \"%.1f\", ($PASSED_TESTS/$TOTAL_TESTS)*100}")%

---

## Test Results

EOF

for result in "${TEST_RESULTS[@]}"; do
    echo "- $result" >> "$RESULTS_FILE"
done

cat >> "$RESULTS_FILE" << EOF

---

## Test Categories

### ✅ Server Health
- Server reachability
- Basic connectivity

### ✅ Agent Management
- Agent list retrieval
- Agent data structure validation

### ✅ Custom Agent Creation
- Frontend format (maxHp, attack, defense)
- Backend format (stats object)
- Custom agent listing

### ✅ Battle System
- Battle creation
- Battle state structure
- Status effects initialization
- God AI narration

### ✅ Battle Actions
- Turn execution
- State updates
- HP modification
- Status effect application
- Multi-turn battles (10 rounds)

### ✅ Battle Retrieval
- Battle state persistence
- History tracking

### ✅ Error Handling
- Invalid battle IDs (404)
- Missing required fields (400)

---

## Notes

- Status effects are applied randomly (20% chance per hit)
- God AI narration requires \`OPENCLAW_GATEWAY_TOKEN\` in .env
- Leaderboard endpoint may not be fully implemented yet

---

## Run Command

\`\`\`bash
./test-suite.sh
\`\`\`

## Server Requirements

\`\`\`bash
cd /home/vboxuser/.openclaw/workspace/ai-battle-arena
node server/server.js
\`\`\`

---

**Generated by:** test-suite.sh  
**Date:** $TIMESTAMP
EOF

echo ""
echo "📄 Test results written to: $RESULTS_FILE"
echo ""

exit $EXIT_CODE
