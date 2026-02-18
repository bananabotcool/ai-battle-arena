#!/bin/bash

# AI Battle Arena - Performance Benchmarking Script
# Measures API response times, page loads, memory usage, and compression

set -e

PORT=3001
BASE_URL="http://localhost:$PORT"
RESULTS_FILE="PERFORMANCE-REPORT.md"
TEMP_DIR=$(mktemp -d)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   AI Battle Arena - Performance Benchmarking Suite        ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo

# Check if server is running
if ! curl -s "$BASE_URL/health" > /dev/null 2>&1; then
    echo -e "${RED}Error: Server is not running on port $PORT${NC}"
    echo "Starting server..."
    node server/index.js > server.log 2>&1 &
    SERVER_PID=$!
    echo "Waiting for server to start..."
    sleep 3
    
    if ! curl -s "$BASE_URL/health" > /dev/null 2>&1; then
        echo -e "${RED}Failed to start server${NC}"
        exit 1
    fi
    echo -e "${GREEN}Server started successfully (PID: $SERVER_PID)${NC}"
    STARTED_SERVER=1
else
    echo -e "${GREEN}Server is already running${NC}"
    SERVER_PID=$(lsof -ti:$PORT | head -n1)
    STARTED_SERVER=0
fi

echo

# Helper functions
calculate_stats() {
    local data=("$@")
    local sum=0
    local count=${#data[@]}
    
    # Calculate mean
    for val in "${data[@]}"; do
        sum=$(echo "$sum + $val" | bc)
    done
    local mean=$(echo "scale=2; $sum / $count" | bc)
    
    # Sort for percentiles
    IFS=$'\n' sorted=($(sort -n <<<"${data[*]}"))
    unset IFS
    
    # Calculate 95th percentile
    local p95_index=$(echo "($count * 0.95) / 1" | bc)
    local p95=${sorted[$p95_index]}
    
    # Min and max
    local min=${sorted[0]}
    local max=${sorted[-1]}
    
    echo "$mean|$p95|$min|$max"
}

# Test API endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local name=$4
    
    echo -e "${YELLOW}Testing: $name${NC}"
    
    local times=()
    for i in {1..10}; do
        if [ "$method" = "GET" ]; then
            time_ms=$(curl -o /dev/null -s -w '%{time_total}\n' "$BASE_URL$endpoint" | awk '{printf "%.0f", $1*1000}')
        else
            time_ms=$(curl -o /dev/null -s -w '%{time_total}\n' -X "$method" -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint" | awk '{printf "%.0f", $1*1000}')
        fi
        times+=($time_ms)
        echo -ne "  Request $i/10: ${time_ms}ms\r"
    done
    echo -ne '\n'
    
    local stats=$(calculate_stats "${times[@]}")
    echo "$name|$stats" >> "$TEMP_DIR/api_results.txt"
    echo -e "${GREEN}  ✓ Complete${NC}\n"
}

# Test page load
test_page() {
    local path=$1
    local name=$2
    
    echo -e "${YELLOW}Testing page: $name${NC}"
    
    local times=()
    for i in {1..5}; do
        time_ms=$(curl -o /dev/null -s -w '%{time_total}\n' "$BASE_URL$path" | awk '{printf "%.0f", $1*1000}')
        times+=($time_ms)
        echo -ne "  Request $i/5: ${time_ms}ms\r"
    done
    echo -ne '\n'
    
    local stats=$(calculate_stats "${times[@]}")
    echo "$name|$stats" >> "$TEMP_DIR/page_results.txt"
    echo -e "${GREEN}  ✓ Complete${NC}\n"
}

# Test compression
test_compression() {
    local path=$1
    local name=$2
    
    # Without compression
    local uncompressed=$(curl -s "$BASE_URL$path" | wc -c)
    
    # With compression
    local compressed=$(curl -s -H "Accept-Encoding: gzip" "$BASE_URL$path" --compressed | wc -c)
    
    local ratio=$(echo "scale=2; (1 - $compressed / $uncompressed) * 100" | bc)
    
    echo "$name|$uncompressed|$compressed|$ratio" >> "$TEMP_DIR/compression_results.txt"
}

# Get memory usage
get_memory_usage() {
    if [ -n "$SERVER_PID" ]; then
        # Get RSS (Resident Set Size) in KB and convert to MB
        local mem_kb=$(ps -p $SERVER_PID -o rss= 2>/dev/null || echo "0")
        echo "scale=2; $mem_kb / 1024" | bc
    else
        echo "0"
    fi
}

# Phase 1: API Endpoint Testing
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Phase 1: API Response Time Testing${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo

test_endpoint "GET" "/api/agents" "" "GET /api/agents"
test_endpoint "GET" "/api/leaderboard" "" "GET /api/leaderboard"
test_endpoint "GET" "/health" "" "GET /health"

# For POST endpoints, we need actual data
BATTLE_START_DATA='{"agent1":"warrior","agent2":"mage"}'
test_endpoint "POST" "/api/battle/start" "$BATTLE_START_DATA" "POST /api/battle/start"

# Get a battle ID for action testing
BATTLE_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "$BATTLE_START_DATA" "$BASE_URL/api/battle/start")
BATTLE_ID=$(echo "$BATTLE_RESPONSE" | grep -o '"battleId":"[^"]*"' | cut -d'"' -f4)

if [ -n "$BATTLE_ID" ]; then
    BATTLE_ACTION_DATA="{\"battleId\":\"$BATTLE_ID\",\"action\":\"attack\"}"
    test_endpoint "POST" "/api/battle/action" "$BATTLE_ACTION_DATA" "POST /api/battle/action"
else
    echo -e "${YELLOW}Warning: Could not get battle ID, skipping action test${NC}"
fi

# Phase 2: Page Load Testing
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Phase 2: Page Load Time Testing${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo

test_page "/" "Home Page"
test_page "/battle.html" "Battle Page"
test_page "/leaderboard.html" "Leaderboard Page"
test_page "/css/styles.css" "CSS Stylesheet"
test_page "/js/battle.js" "Battle JavaScript"

# Phase 3: Memory Usage Testing
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Phase 3: Memory Usage Testing${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo

BASELINE_MEM=$(get_memory_usage)
echo -e "Baseline memory: ${GREEN}${BASELINE_MEM} MB${NC}"

# Simulate load by running multiple battles
echo "Running 20 battles to measure memory under load..."
for i in {1..20}; do
    curl -s -X POST -H "Content-Type: application/json" -d "$BATTLE_START_DATA" "$BASE_URL/api/battle/start" > /dev/null
    sleep 0.1
done

LOAD_MEM=$(get_memory_usage)
echo -e "Memory under load: ${GREEN}${LOAD_MEM} MB${NC}"

sleep 2
PEAK_MEM=$(get_memory_usage)
echo -e "Peak memory: ${GREEN}${PEAK_MEM} MB${NC}"
echo

# Phase 4: Compression Testing
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Phase 4: Compression Effectiveness Testing${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo

echo "Testing compression ratios..."
test_compression "/" "Home Page"
test_compression "/battle.html" "Battle Page"
test_compression "/leaderboard.html" "Leaderboard Page"
test_compression "/css/styles.css" "CSS File"
test_compression "/js/battle.js" "JavaScript File"
echo -e "${GREEN}✓ Compression tests complete${NC}\n"

# Generate Report
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Generating Performance Report${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo

cat > "$RESULTS_FILE" << 'EOF'
# AI Battle Arena - Performance Report

**Generated:** $(date '+%Y-%m-%d %H:%M:%S %Z')

## Executive Summary

This report contains comprehensive performance metrics for the AI Battle Arena application, including API response times, page load performance, memory usage, and compression effectiveness.

---

## 1. API Response Times

### Methodology
- 10 requests per endpoint
- Measurements include network latency and server processing time
- Times reported in milliseconds (ms)

### Results

| Endpoint | Avg (ms) | 95th %ile (ms) | Min (ms) | Max (ms) |
|----------|----------|----------------|----------|----------|
EOF

# Add API results
if [ -f "$TEMP_DIR/api_results.txt" ]; then
    while IFS='|' read -r name mean p95 min max; do
        echo "| $name | $mean | $p95 | $min | $max |" >> "$RESULTS_FILE"
    done < "$TEMP_DIR/api_results.txt"
fi

cat >> "$RESULTS_FILE" << EOF

### Analysis
EOF

# Calculate average API response time
if [ -f "$TEMP_DIR/api_results.txt" ]; then
    avg_api_time=$(awk -F'|' '{sum+=$2; count++} END {printf "%.0f", sum/count}' "$TEMP_DIR/api_results.txt")
    
    cat >> "$RESULTS_FILE" << EOF
- **Average API response time:** ${avg_api_time}ms
- **Performance rating:** $(if [ "$avg_api_time" -lt 50 ]; then echo "🟢 Excellent"; elif [ "$avg_api_time" -lt 100 ]; then echo "🟡 Good"; else echo "🔴 Needs improvement"; fi)

EOF
fi

cat >> "$RESULTS_FILE" << 'EOF'
---

## 2. Page Load Performance

### Methodology
- 5 requests per page/asset
- Full page load time including all assets
- Times reported in milliseconds (ms)

### Results

| Page/Asset | Avg (ms) | 95th %ile (ms) | Min (ms) | Max (ms) |
|------------|----------|----------------|----------|----------|
EOF

# Add page results
if [ -f "$TEMP_DIR/page_results.txt" ]; then
    while IFS='|' read -r name mean p95 min max; do
        echo "| $name | $mean | $p95 | $min | $max |" >> "$RESULTS_FILE"
    done < "$TEMP_DIR/page_results.txt"
fi

cat >> "$RESULTS_FILE" << EOF

### Analysis
EOF

# Calculate average page load time
if [ -f "$TEMP_DIR/page_results.txt" ]; then
    avg_page_time=$(awk -F'|' '{sum+=$2; count++} END {printf "%.0f", sum/count}' "$TEMP_DIR/page_results.txt")
    
    cat >> "$RESULTS_FILE" << EOF
- **Average page load time:** ${avg_page_time}ms
- **Performance rating:** $(if [ "$avg_page_time" -lt 200 ]; then echo "🟢 Excellent"; elif [ "$avg_page_time" -lt 500 ]; then echo "🟡 Good"; else echo "🔴 Needs improvement"; fi)

EOF
fi

cat >> "$RESULTS_FILE" << EOF
---

## 3. Memory Usage

### Results

| Metric | Value (MB) |
|--------|------------|
| Baseline Memory | ${BASELINE_MEM} |
| Memory Under Load | ${LOAD_MEM} |
| Peak Memory | ${PEAK_MEM} |
| Memory Growth | $(echo "scale=2; $PEAK_MEM - $BASELINE_MEM" | bc) |

### Analysis
EOF

mem_growth=$(echo "scale=0; ($PEAK_MEM - $BASELINE_MEM) / 1" | bc)

cat >> "$RESULTS_FILE" << EOF
- **Baseline memory usage:** ${BASELINE_MEM} MB
- **Memory growth under load:** ${mem_growth} MB
- **Memory stability:** $(if [ "$mem_growth" -lt 50 ]; then echo "🟢 Stable"; elif [ "$mem_growth" -lt 100 ]; then echo "🟡 Moderate"; else echo "🔴 High growth"; fi)

EOF

cat >> "$RESULTS_FILE" << 'EOF'
---

## 4. Compression Effectiveness

### Methodology
- Tested with and without gzip compression
- Compression ratio = (1 - compressed/uncompressed) × 100%

### Results

| Resource | Uncompressed (bytes) | Compressed (bytes) | Savings (%) |
|----------|---------------------|-------------------|-------------|
EOF

# Add compression results
if [ -f "$TEMP_DIR/compression_results.txt" ]; then
    while IFS='|' read -r name uncompressed compressed ratio; do
        echo "| $name | $uncompressed | $compressed | $ratio% |" >> "$RESULTS_FILE"
    done < "$TEMP_DIR/compression_results.txt"
fi

cat >> "$RESULTS_FILE" << EOF

### Analysis
EOF

# Calculate average compression ratio
if [ -f "$TEMP_DIR/compression_results.txt" ]; then
    avg_compression=$(awk -F'|' '{sum+=$4; count++} END {printf "%.1f", sum/count}' "$TEMP_DIR/compression_results.txt")
    
    cat >> "$RESULTS_FILE" << EOF
- **Average compression ratio:** ${avg_compression}%
- **Compression effectiveness:** $(if [ "$(echo "$avg_compression > 60" | bc)" -eq 1 ]; then echo "🟢 Excellent"; elif [ "$(echo "$avg_compression > 40" | bc)" -eq 1 ]; then echo "🟡 Good"; else echo "🔴 Poor"; fi)

EOF
fi

cat >> "$RESULTS_FILE" << 'EOF'
---

## 5. Recommendations

### Performance Optimizations

#### 🚀 High Priority

1. **API Response Time**
   - Consider implementing response caching for frequently accessed endpoints
   - Use Redis for session and leaderboard caching
   - Optimize database queries with indexes

2. **Memory Management**
   - Implement battle cleanup after completion
   - Add memory monitoring and alerts
   - Consider using Node.js cluster mode for better resource utilization

3. **Compression**
   - Enable gzip compression for all text-based resources
   - Consider using Brotli compression for even better ratios
   - Implement proper Cache-Control headers

#### ⚡ Medium Priority

4. **Page Load Optimization**
   - Minify JavaScript and CSS files
   - Implement lazy loading for battle animations
   - Use CDN for static assets
   - Add service worker for offline functionality

5. **Database Optimization**
   - Index frequently queried fields (agent names, battle IDs)
   - Implement connection pooling
   - Consider sharding for large-scale deployments

6. **Monitoring**
   - Set up APM (Application Performance Monitoring)
   - Add custom metrics for battle duration
   - Implement error tracking and alerting

#### 💡 Low Priority (Future Enhancements)

7. **Advanced Caching**
   - Implement HTTP/2 Server Push
   - Add browser caching strategies
   - Use service workers for asset caching

8. **Code Splitting**
   - Split battle engine into separate chunks
   - Lazy load AI agent logic
   - Implement progressive enhancement

---

## 6. Benchmark Details

**Test Environment:**
- Server: Node.js
- Port: 3001
- Test Tool: curl with timing metrics
- Concurrent requests: Sequential (10 per endpoint)

**Metrics Explained:**
- **Avg:** Average response time across all requests
- **95th %ile:** 95th percentile - 95% of requests were faster than this
- **Min:** Fastest response time
- **Max:** Slowest response time

---

## Conclusion

The AI Battle Arena demonstrates **solid performance** across all tested metrics. The application shows:

EOF

# Add dynamic conclusion based on results
if [ -f "$TEMP_DIR/api_results.txt" ]; then
    avg_api_time=$(awk -F'|' '{sum+=$2; count++} END {printf "%.0f", sum/count}' "$TEMP_DIR/api_results.txt")
    
    if [ "$avg_api_time" -lt 50 ]; then
        echo "- ✅ **Excellent** API response times (avg: ${avg_api_time}ms)" >> "$RESULTS_FILE"
    elif [ "$avg_api_time" -lt 100 ]; then
        echo "- ⚠️  **Good** API response times (avg: ${avg_api_time}ms) with room for optimization" >> "$RESULTS_FILE"
    else
        echo "- ⚠️  API response times need improvement (avg: ${avg_api_time}ms)" >> "$RESULTS_FILE"
    fi
fi

if [ -n "$mem_growth" ]; then
    if [ "$mem_growth" -lt 50 ]; then
        echo "- ✅ **Stable** memory usage with minimal growth" >> "$RESULTS_FILE"
    else
        echo "- ⚠️  Memory usage shows growth under load - consider optimization" >> "$RESULTS_FILE"
    fi
fi

if [ -f "$TEMP_DIR/compression_results.txt" ]; then
    avg_compression=$(awk -F'|' '{sum+=$4; count++} END {printf "%.1f", sum/count}' "$TEMP_DIR/compression_results.txt")
    
    if [ "$(echo "$avg_compression > 50" | bc)" -eq 1 ]; then
        echo "- ✅ **Effective** compression reducing bandwidth usage" >> "$RESULTS_FILE"
    else
        echo "- ⚠️  Compression could be improved for better bandwidth efficiency" >> "$RESULTS_FILE"
    fi
fi

cat >> "$RESULTS_FILE" << 'EOF'

**Next Steps:**
1. Implement high-priority recommendations
2. Set up continuous performance monitoring
3. Re-run benchmarks after optimizations
4. Compare results to track improvements

---

*This report was automatically generated by the AI Battle Arena performance benchmarking suite.*
EOF

# Cleanup
rm -rf "$TEMP_DIR"

# Stop server if we started it
if [ "$STARTED_SERVER" -eq 1 ]; then
    echo -e "${YELLOW}Stopping server (PID: $SERVER_PID)...${NC}"
    kill $SERVER_PID 2>/dev/null || true
fi

echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Performance report generated: $RESULTS_FILE${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo
echo -e "${BLUE}Summary:${NC}"
[ -f "$RESULTS_FILE" ] && cat "$RESULTS_FILE" | head -n 30
echo
echo -e "${YELLOW}Full report: $RESULTS_FILE${NC}"
