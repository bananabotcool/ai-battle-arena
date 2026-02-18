#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# AI BATTLE ARENA - Performance Optimization Script
# ═══════════════════════════════════════════════════════════════════

echo "🚀 AI Battle Arena - Performance Optimization"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Check file sizes
echo "📊 Checking file sizes..."
echo ""
find public -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" \) -exec du -h {} \; | sort -hr | head -10
echo ""

# 2. Check for optimization opportunities
echo "🔍 Checking for optimization opportunities..."
echo ""

# Check for console.log statements
CONSOLE_COUNT=$(grep -r "console.log" public server --include="*.js" 2>/dev/null | wc -l)
if [ $CONSOLE_COUNT -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Found $CONSOLE_COUNT console.log statements (consider removing for production)${NC}"
else
  echo -e "${GREEN}✅ No console.log statements found${NC}"
fi

# Check for TODO comments
TODO_COUNT=$(grep -r "TODO\|FIXME\|XXX" public server --include="*.js" 2>/dev/null | wc -l)
if [ $TODO_COUNT -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Found $TODO_COUNT TODO/FIXME comments${NC}"
else
  echo -e "${GREEN}✅ No TODO comments found${NC}"
fi

# Check for large files
echo ""
echo "📦 Files larger than 50KB:"
find public -type f -size +50k -exec ls -lh {} \; | awk '{print $5 " " $9}'

# 3. Minification suggestions
echo ""
echo "💡 Optimization Suggestions:"
echo ""

# Check if uglify-js is installed
if ! command -v uglifyjs &> /dev/null; then
  echo "📦 Install uglify-js for minification:"
  echo "   npm install -g uglify-js"
else
  echo -e "${GREEN}✅ uglify-js available${NC}"
fi

# Check if cssnano is installed  
if ! command -v cssnano &> /dev/null; then
  echo "📦 Install cssnano for CSS minification:"
  echo "   npm install -g cssnano-cli"
else
  echo -e "${GREEN}✅ cssnano available${NC}"
fi

# 4. Gzip compression test
echo ""
echo "📦 Compression analysis:"
echo ""

for file in public/*.js public/*.css; do
  if [ -f "$file" ]; then
    ORIGINAL=$(wc -c < "$file")
    COMPRESSED=$(gzip -c "$file" | wc -c)
    RATIO=$(echo "scale=1; (1 - $COMPRESSED/$ORIGINAL) * 100" | bc)
    echo "$(basename $file): ${ORIGINAL} bytes → ${COMPRESSED} bytes (${RATIO}% reduction)"
  fi
done

# 5. Image optimization
echo ""
echo "🖼️  Image optimization:"
if command -v optipng &> /dev/null; then
  echo -e "${GREEN}✅ optipng available${NC}"
else
  echo "📦 Install optipng: sudo apt install optipng"
fi

# 6. Bundle size report
echo ""
echo "📊 Bundle sizes:"
echo ""
du -sh public/ data/ server/
echo ""

# 7. Memory usage check
echo "💾 Estimated memory usage:"
ps aux | grep "node server.js" | grep -v grep | awk '{print "  Server: "$6/1024" MB"}'

# 8. Network performance
echo ""
echo "🌐 Network performance test:"
echo "  API health check..."
time curl -s http://localhost:3001/api/agents > /dev/null 2>&1 && echo -e "${GREEN}  ✅ API responsive${NC}" || echo -e "${YELLOW}  ⚠️  API not responding${NC}"

echo ""
echo "✅ Optimization scan complete!"
echo ""
echo "Next steps:"
echo "  1. Remove console.log statements for production"
echo "  2. Minify JS/CSS files"
echo "  3. Enable gzip compression on server"
echo "  4. Add cache headers for static assets"
echo "  5. Consider CDN for public assets"
