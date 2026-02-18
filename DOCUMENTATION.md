# 🎮 AI BATTLE ARENA - Complete Documentation

**Version:** 2.0.0  
**Last Updated:** 2026-02-18  
**Author:** BananaBot Studios

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Installation](#installation)
4. [Quick Start](#quick-start)
5. [Game Modes](#game-modes)
6. [API Reference](#api-reference)
7. [God AI Integration](#god-ai-integration)
8. [Custom Fighters](#custom-fighters)
9. [Achievements System](#achievements-system)
10. [Troubleshooting](#troubleshooting)

---

## Overview

AI Battle Arena is an epic RPG-style battle simulator where AI agents with unique personalities fight in turn-based combat, narrated dramatically by a "God AI" powered by the Chutes API.

### Key Technologies
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js, Express
- **AI:** Chutes API (Kimi K2.5 TEE model)
- **Storage:** JSON files

---

## Features

### Core Features
- ✅ **God AI Narrator** - Dramatic narration of every action
- ✅ **8+ Unique Agents** - Each with distinct personalities and abilities
- ✅ **Turn-Based Combat** - Strategic RPG-style battles
- ✅ **Custom Fighter Creator** - Build your own agents
- ✅ **Status Effects** - Burn, Freeze, Poison, Stun, Confusion, Bleed
- ✅ **Critical Hits** - Dramatic 2x damage strikes
- ✅ **Special Abilities** - Ultimate moves with cooldowns

### Game Modes
- **Standard Battle** - Classic 1v1 combat
- **Tournament Mode** - 8-fighter elimination bracket
- **AI vs AI** - Autonomous endless battles
- **Survival Mode** - Fight waves of enemies
- **Replay System** - Record and share battles

### Progression Systems
- **Leaderboard** - ELO-based rankings
- **Achievements** - 15 unlockable milestones
- **Statistics** - Track wins, damage, streaks

---

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenClaw Gateway (for God AI)

### Steps

1. **Clone/Extract Project**
   ```bash
   cd /path/to/ai-battle-arena
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your OpenClaw gateway token
   ```

4. **Start Server**
   ```bash
   npm start
   # Or: PORT=3001 node server/server.js
   ```

5. **Access**
   ```
   http://localhost:3001
   ```

---

## Quick Start

### Starting Your First Battle

1. Open `http://localhost:3001`
2. Click on two agents to select them
3. Click "START BATTLE"
4. Watch God AI narrate the epic opening
5. Choose actions: Attack, Defend, Special, or Auto
6. Battle until victory!

### Creating a Custom Fighter

1. Navigate to "Custom Fighter" page
2. Name your fighter
3. Choose personality archetype
4. Allocate 100 stat points
5. Select 4 abilities (must include 1 Special)
6. Click "Create Fighter"
7. Use in battles immediately

---

## Game Modes

### 1. Standard Battle (`index.html`)
Classic 1v1 combat with God AI narration.

**Features:**
- Agent selection
- Turn-based combat
- Live HP bars
- Battle log
- God AI commentary

### 2. Tournament Mode (`tournament.html`)
8-fighter single-elimination bracket.

**Structure:**
- Quarterfinals (4 matches)
- Semifinals (2 matches)
- Finals (1 match)
- Champion crowned

**Features:**
- Visual bracket tree
- In-page battle viewer
- State persistence
- Trophy animation

### 3. AI vs AI (`ai-vs-ai.html`)
Autonomous endless battles.

**Features:**
- Continuous battle queue
- Speed control (1x-10x)
- Live statistics
- Battle history
- Pause/Resume

**Controls:**
- ▶ Start - Begin autonomous battles
- ⏸ Pause - Pause between battles
- ⏹ Stop - End session
- Speed slider - Adjust battle pace

### 4. Survival Mode (`survival.html`)
Fight waves of increasingly difficult enemies.

### 5. Replay System
Record, playback, and share battles.

**Features:**
- Automatic recording
- Playback controls (play/pause/speed)
- URL sharing
- Frame-by-frame viewing

---

## API Reference

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### Agents

**GET /api/agents**
List all available agents.

```bash
curl http://localhost:3001/api/agents
```

Response:
```json
{
  "agents": [
    {
      "id": "bash-quickfingers",
      "name": "Bash Quickfingers",
      "personality": "Lightning-fast backend warrior",
      "maxHp": 120,
      "attack": 85,
      "defense": 60,
      "abilities": ["Rapid Deploy", "API Strike", "Database Slam"]
    }
  ]
}
```

#### Battle

**POST /api/battle/start**
Start a new battle.

Request:
```json
{
  "agent1Id": "bash-quickfingers",
  "agent2Id": "ceo"
}
```

Response:
```json
{
  "battleId": "battle-1234567890-abc123",
  "battle": {
    "agent1": { "hp": 120, "maxHp": 120 },
    "agent2": { "hp": 150, "maxHp": 150 },
    "turn": 1,
    "status": "active"
  },
  "narration": "The arena erupts as Bash faces CEO..."
}
```

**POST /api/battle/action**
Execute a battle turn.

Request:
```json
{
  "battleId": "battle-1234567890-abc123",
  "abilityIndex": 0
}
```

Response:
```json
{
  "battle": {
    "agent1": { "hp": 120 },
    "agent2": { "hp": 85 },
    "turn": 2,
    "status": "active"
  },
  "action": {
    "attacker": "Bash Quickfingers",
    "defender": "CEO",
    "ability": "Rapid Deploy",
    "damage": 65
  },
  "narration": "Bash strikes with devastating force..."
}
```

#### Leaderboard

**GET /api/leaderboard**
Get rankings.

Query params:
- `sortBy` - rating|winRate|wins|battles (default: rating)
- `limit` - number (default: 10)

```bash
curl http://localhost:3001/api/leaderboard?sortBy=rating&limit=20
```

**GET /api/leaderboard/:agentId**
Get specific agent stats.

**POST /api/leaderboard/record**
Record battle result.

Request:
```json
{
  "agent1": { "id": "bash", "name": "Bash" },
  "agent2": { "id": "ceo", "name": "CEO" },
  "winnerId": "bash",
  "stats": {
    "damageDealt": { "bash": 250, "ceo": 180 },
    "criticalHits": { "bash": 3, "ceo": 1 }
  }
}
```

#### Custom Agents

**POST /api/custom-agent**
Create custom fighter.

**GET /api/custom-agents**
List custom fighters.

---

## God AI Integration

### Overview
The God AI uses the Chutes Kimi K2.5 TEE model via OpenClaw's `sessions_spawn` API to generate dramatic battle narration.

### Configuration

**Environment Variables:**
```env
OPENCLAW_GATEWAY_URL=http://localhost:18789
OPENCLAW_GATEWAY_TOKEN=your_token_here
```

### How It Works

1. Battle action occurs
2. System builds dramatic prompt
3. Calls `sessions_spawn` with model `chutes/kimi-k2.5-tee`
4. God AI generates 1-3 sentence narration
5. Narration displayed in battle log

### Prompt Structure
```
You are the GOD AI, omniscient battle narrator.

Agent 1: [name] ([personality])
  HP: [current]/[max]
  Mood: [mood]

Agent 2: [name] ([personality])
  HP: [current]/[max]
  Mood: [mood]

Action: [attacker] used [ability] on [defender]!
Result: [damage] damage dealt!

Narrate dramatically in 1-3 sentences. Epic RPG style!
```

### Fallback System
If God AI fails (timeout, error):
- Automatic fallback narration
- Battle continues normally
- No disruption to gameplay

---

## Custom Fighters

### Creation Process

1. **Name** - Give your fighter a legendary name
2. **Personality** - Choose from 7 archetypes:
   - Berserker - High damage, low defense
   - Tank - High HP and defense
   - Trickster - Unpredictable abilities
   - Strategist - Balanced, tactical
   - Glass Cannon - Max damage, minimum HP
   - Speedster - Fast attacks
   - Balanced - Well-rounded

3. **Stats** - Allocate 100 points across:
   - HP - Health points
   - ATK - Attack power
   - DEF - Defense
   - SPEED - Turn speed
   - LUCK - Critical hit chance
   - SPECIAL - Ultimate ability power

4. **Abilities** - Select 4 abilities:
   - Must include 1 Special ability
   - Mix of attack, defense, utility

### Saving & Loading
- Fighters saved to `data/custom-agents.json`
- Persistent across sessions
- Available in all game modes

---

## Achievements System

### Categories

**Milestone Achievements:**
- First Blood - Win your first battle
- Warrior - Win 10 battles
- Champion - Win 50 battles
- Legend - Win 100 battles

**Skill Achievements:**
- Perfectionist - Flawless victory
- Glass Cannon - 200+ damage in battle
- Survivor - Win with <10 HP
- Critical Master - 20 critical hits

**Special Achievements:**
- Tournament Victor - Win tournament
- Custom Creator - Create custom fighter
- Speedster - Win in <5 rounds
- Endurance - Survive 20+ rounds

### Progress Tracking
Achievements tracked in localStorage:
- Stats updated after each battle
- Instant unlock notifications
- Progress persists across sessions

---

## Troubleshooting

### Server Won't Start

**Problem:** `EADDRINUSE` error

**Solution:**
```bash
# Kill existing server
pkill -f "node.*server.js"

# Start with different port
PORT=3002 node server/server.js
```

### God AI Not Working

**Problem:** Fallback narration always used

**Solutions:**
1. Check OpenClaw Gateway is running
2. Verify `OPENCLAW_GATEWAY_TOKEN` in `.env`
3. Test Chutes API:
   ```bash
   curl http://localhost:18789/api/sessions/spawn \\
     -H "Authorization: Bearer $TOKEN"
   ```

### Custom Agents Not Saving

**Problem:** Created fighters disappear

**Solution:**
```bash
# Ensure data directory exists
mkdir -p data

# Check permissions
chmod 755 data
```

### Performance Issues

**Problem:** Battles lag or freeze

**Solutions:**
- Close other tabs/applications
- Reduce AI vs AI battle speed
- Clear browser cache
- Use Chrome/Firefox (best performance)

---

## Development

### Project Structure
```
ai-battle-arena/
├── public/
│   ├── index.html          # Main battle page
│   ├── tournament.html     # Tournament mode
│   ├── ai-vs-ai.html       # Autonomous battles
│   ├── leaderboard.html    # Rankings
│   ├── achievements.html   # Progress tracking
│   ├── styles.css          # Global styles
│   ├── arena.js            # Battle controller
│   ├── agents.js           # Agent management
│   ├── creator.js          # Custom fighter builder
│   ├── replay.js           # Replay system
│   ├── tournament.js       # Tournament logic
│   ├── ai-vs-ai.js         # Autonomous battles
│   ├── achievements.js     # Achievement tracking
│   └── navigation.js       # Global nav menu
├── server/
│   ├── server.js           # Express server
│   ├── battle-engine.js    # Combat mechanics
│   ├── god-narrator.js     # AI narration
│   └── leaderboard.js      # Rankings system
├── data/
│   ├── default-agents.json # Built-in fighters
│   ├── custom-agents.json  # User-created fighters
│   └── leaderboard.json    # Persistent rankings
└── docs/
    └── DOCUMENTATION.md    # This file
```

### Adding New Agents

Edit `server/server.js`:
```javascript
const defaultAgents = [
  {
    id: 'new-agent',
    name: 'New Agent',
    personality: 'Unique trait',
    maxHp: 100,
    attack: 75,
    defense: 65,
    abilities: ['Ability 1', 'Ability 2', 'Ability 3']
  }
];
```

### Adding Achievements

Edit `public/achievements.js`:
```javascript
{
  id: 'new_achievement',
  name: 'Achievement Name',
  description: 'How to unlock',
  icon: '🏆',
  condition: stats => stats.someValue >= 100
}
```

---

## Support

**Issues:** Report bugs via GitHub Issues  
**Documentation:** See `/docs` folder  
**Community:** Discord server (link in README)

---

**Built with ❤️ by BananaBot Studios**  
**Powered by OpenClaw & Chutes API**
