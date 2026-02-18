#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# AI BATTLE ARENA - Quick Deploy Script
# ═══════════════════════════════════════════════════════════════════

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}
╔═══════════════════════════════════════════╗
║   AI BATTLE ARENA - Quick Deploy         ║
║   One-command deployment script           ║
╚═══════════════════════════════════════════╝
${NC}"

# Check if running as root
if [ "$EUID" -eq 0 ]; then
  echo -e "${RED}❌ Don't run as root! Run as normal user.${NC}"
  exit 1
fi

# Detect deployment method
echo -e "${YELLOW}🔍 Detecting deployment method...${NC}\n"

METHOD=""
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
  echo -e "${GREEN}✅ Docker detected${NC}"
  METHOD="docker"
elif command -v pm2 &> /dev/null; then
  echo -e "${GREEN}✅ PM2 detected${NC}"
  METHOD="pm2"
elif command -v node &> /dev/null; then
  echo -e "${GREEN}✅ Node.js detected${NC}"
  METHOD="node"
else
  echo -e "${RED}❌ No compatible runtime found!${NC}"
  echo "Please install: Docker, PM2, or Node.js"
  exit 1
fi

# Check .env file
if [ ! -f .env ]; then
  echo -e "${YELLOW}⚠️  .env file not found. Creating from example...${NC}"
  if [ -f .env.example ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env with your OpenClaw token!${NC}"
    read -p "Press Enter when ready to continue..."
  else
    echo -e "${RED}❌ No .env.example found!${NC}"
    exit 1
  fi
fi

# Install dependencies
echo -e "\n${YELLOW}📦 Installing dependencies...${NC}"
if [ "$METHOD" = "docker" ]; then
  echo "Skipping (Docker will handle it)"
else
  npm install
  echo -e "${GREEN}✅ Dependencies installed${NC}"
fi

# Deploy based on method
echo -e "\n${YELLOW}🚀 Deploying with $METHOD...${NC}\n"

case $METHOD in
  docker)
    echo "Building Docker image..."
    docker-compose build
    
    echo "Starting containers..."
    docker-compose up -d
    
    echo -e "\n${GREEN}✅ Docker deployment complete!${NC}"
    echo ""
    echo "Commands:"
    echo "  docker-compose logs -f        # View logs"
    echo "  docker-compose ps             # Check status"
    echo "  docker-compose stop           # Stop server"
    echo "  docker-compose restart        # Restart server"
    ;;
    
  pm2)
    echo "Stopping old process (if any)..."
    pm2 stop ai-arena 2>/dev/null || true
    pm2 delete ai-arena 2>/dev/null || true
    
    echo "Starting with PM2..."
    pm2 start server/server.js --name ai-arena
    pm2 save
    
    echo -e "\n${GREEN}✅ PM2 deployment complete!${NC}"
    echo ""
    echo "Commands:"
    echo "  pm2 logs ai-arena             # View logs"
    echo "  pm2 status                    # Check status"
    echo "  pm2 restart ai-arena          # Restart server"
    echo "  pm2 stop ai-arena             # Stop server"
    ;;
    
  node)
    echo "Stopping old process (if any)..."
    pkill -f "node.*server.js" || true
    
    echo "Starting server..."
    PORT=3001 NODE_ENV=production node server/server.js > server.log 2>&1 &
    
    echo $! > server.pid
    
    echo -e "\n${GREEN}✅ Node.js deployment complete!${NC}"
    echo ""
    echo "Server PID: $(cat server.pid)"
    echo ""
    echo "Commands:"
    echo "  tail -f server.log            # View logs"
    echo "  kill \$(cat server.pid)          # Stop server"
    ;;
esac

# Wait for server to start
echo -e "\n${YELLOW}⏳ Waiting for server to start...${NC}"
for i in {1..10}; do
  if curl -s http://localhost:3001/api/agents > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server is ready!${NC}"
    break
  fi
  if [ $i -eq 10 ]; then
    echo -e "${RED}❌ Server didn't start in time${NC}"
    exit 1
  fi
  sleep 1
done

# Show status
echo -e "\n${BLUE}╔═══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          DEPLOYMENT SUCCESSFUL            ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}🎮 AI Battle Arena is now running!${NC}"
echo ""
echo -e "Access at: ${GREEN}http://localhost:3001${NC}"
echo -e "Health check: ${GREEN}http://localhost:3001/health${NC}"
echo ""
echo -e "${YELLOW}📖 Documentation:${NC}"
echo "  README.md            # Quick start"
echo "  DOCUMENTATION.md     # Full docs"
echo "  DEPLOYMENT.md        # Advanced deployment"
echo ""
echo -e "${YELLOW}🎯 Game Modes:${NC}"
echo "  /                    # Standard battle"
echo "  /tournament.html     # Tournament mode"
echo "  /ai-vs-ai.html       # AI vs AI battles"
echo "  /leaderboard.html    # Rankings"
echo "  /achievements.html   # Progress"
echo ""
echo -e "${GREEN}Happy battling! ⚔️${NC}"
