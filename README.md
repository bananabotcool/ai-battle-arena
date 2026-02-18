# 🎮 AI BATTLE ARENA

> **Epic RPG-style AI agent combat simulator with dramatic God AI narration**

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/yourusername/ai-battle-arena)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Status](https://img.shields.io/badge/status-active-success.svg)]()

---

## 🌟 Features

### Core Gameplay
- ⚔️ **Turn-Based Combat** - Strategic RPG-style battles
- 🎭 **God AI Narrator** - Dramatic narration powered by Chutes API
- 🤖 **8+ Unique Agents** - Each with distinct personalities and abilities
- 💥 **Status Effects** - Burn, Freeze, Poison, Stun, Confusion, Bleed
- ⚡ **Critical Hits** - 2x damage with dramatic screen effects
- ✨ **Special Abilities** - Ultimate moves with 3-turn cooldowns

### Game Modes
- 🏟️ **Standard Battle** - Classic 1v1 combat
- 🏆 **Tournament Mode** - 8-fighter elimination bracket
- 🤖 **AI vs AI** - Autonomous endless battles with statistics
- 💀 **Survival Mode** - Fight waves of enemies
- 📹 **Replay System** - Record, playback, and share battles

### Progression
- 📊 **Leaderboard** - ELO-based rankings with detailed stats
- 🏅 **Achievements** - 15 unlockable milestones
- 📈 **Statistics** - Track wins, damage, streaks, and more
- 🎨 **Custom Fighters** - Create your own agents with unique builds

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenClaw Gateway (for God AI)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/ai-battle-arena.git
cd ai-battle-arena

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your OpenClaw gateway token

# Start server
npm start

# Open browser
open http://localhost:3001
```

### Docker (Recommended)

```bash
# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 📸 Screenshots

### Standard Battle
![Battle Screenshot](docs/screenshots/battle.png)
*Epic 1v1 combat with God AI narration*

### Tournament Mode
![Tournament Screenshot](docs/screenshots/tournament.png)
*8-fighter elimination bracket*

### AI vs AI
![AI vs AI Screenshot](docs/screenshots/ai-vs-ai.png)
*Autonomous battles with live statistics*

### Custom Fighter Creator
![Creator Screenshot](docs/screenshots/creator.png)
*Build your own fighters with 100 stat points*

### Leaderboard
![Leaderboard Screenshot](docs/screenshots/leaderboard.png)
*ELO rankings with detailed statistics*

### Achievements
![Achievements Screenshot](docs/screenshots/achievements.png)
*15 unlockable milestones*

---

## 🎯 Game Modes

### Standard Battle
Classic 1v1 combat with:
- Agent selection
- Turn-based combat
- God AI narration
- Status effects
- Critical hits
- Special abilities

### Tournament Mode
8-fighter single-elimination bracket:
- Quarterfinals (4 matches)
- Semifinals (2 matches)
- Finals (1 match)
- Visual bracket tree
- Trophy ceremony

### AI vs AI
Watch autonomous battles:
- Continuous battle queue
- Speed control (1x-10x)
- Live statistics tracking
- Battle history
- Pause/Resume

### Survival Mode
Fight waves of enemies:
- Increasing difficulty
- Health persistence
- Power-ups
- High score tracking

---

## 🤖 Default Agents

| Agent | HP | ATK | DEF | Personality |
|-------|----|----|-----|-------------|
| **Bash Quickfingers** | 120 | 85 | 60 | Lightning-fast backend warrior |
| **Ruby Loopster** | 110 | 80 | 65 | Elegant route master |
| **Sergeant Semicolon** | 100 | 70 | 80 | Strategic commander |
| **PixelPusher Prime** | 95 | 75 | 70 | Visual virtuoso |
| **ThinkTanker** | 90 | 90 | 55 | Strategic mastermind |
| **CEO** | 150 | 95 | 85 | Executive powerhouse |

---

## 🎨 Creating Custom Fighters

1. Navigate to **Custom Fighter** page
2. Enter fighter name
3. Choose personality archetype:
   - Berserker - High damage, low defense
   - Tank - High HP and defense
   - Trickster - Unpredictable abilities
   - Strategist - Balanced, tactical
   - Glass Cannon - Max damage, minimum HP
   - Speedster - Fast attacks
   - Balanced - Well-rounded

4. Allocate **100 stat points** across:
   - HP - Health points
   - ATK - Attack power
   - DEF - Defense
   - SPEED - Turn speed
   - LUCK - Critical hit chance
   - SPECIAL - Ultimate ability power

5. Select **4 abilities** (must include 1 Special)
6. Save and battle!

---

## 🏆 Achievements

### Milestone Achievements
- 🗡️ **First Blood** - Win your first battle
- ⚔️ **Warrior** - Win 10 battles
- 🏆 **Champion** - Win 50 battles
- 👑 **Legend** - Win 100 battles

### Skill Achievements
- 💎 **Perfectionist** - Win without taking damage
- 💥 **Glass Cannon** - Deal 200+ damage in one battle
- 🩹 **Survivor** - Win with less than 10 HP
- 🔥 **Streak Master** - Win 5 battles in a row

### Special Achievements
- 🥇 **Tournament Victor** - Win a tournament
- ⚡ **Critical Master** - Land 20 critical hits
- 🧪 **Status Master** - Apply 50 status effects
- 🎖️ **Battle Veteran** - Complete 100 battles
- 🎨 **Custom Creator** - Create a custom fighter
- 💨 **Speedster** - Win in under 5 rounds
- 🛡️ **Endurance** - Survive 20+ round battle

---

## 📊 API Reference

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### GET /api/agents
List all agents.

#### POST /api/battle/start
Start a new battle.
```json
{
  "agent1Id": "bash-quickfingers",
  "agent2Id": "ceo"
}
```

#### POST /api/battle/action
Execute a battle turn.
```json
{
  "battleId": "battle-123",
  "abilityIndex": 0
}
```

#### GET /api/leaderboard
Get rankings.
- Query: `sortBy=rating|winRate|wins|battles`
- Query: `limit=10`

#### GET /api/leaderboard/:agentId
Get specific agent stats.

#### POST /api/leaderboard/record
Record battle result.

---

## 🎭 God AI Integration

The God AI uses the **Chutes Kimi K2.5 TEE model** via OpenClaw's `sessions_spawn` API to generate dramatic battle narration.

### Configuration
```env
OPENCLAW_GATEWAY_URL=http://localhost:18789
OPENCLAW_GATEWAY_TOKEN=your_token_here
```

### Features
- Dramatic 1-3 sentence narration for every action
- Context-aware commentary based on battle state
- Personality-specific narration styles
- Automatic fallback if AI unavailable

---

## 🛠️ Tech Stack

**Frontend:**
- HTML5, CSS3, Vanilla JavaScript
- Responsive design
- No frameworks required

**Backend:**
- Node.js 18+
- Express.js
- JSON file storage

**AI:**
- Chutes API (Kimi K2.5 TEE)
- OpenClaw Gateway integration

---

## 📦 Project Structure

```
ai-battle-arena/
├── public/              # Frontend files
│   ├── index.html       # Main battle page
│   ├── tournament.html  # Tournament mode
│   ├── ai-vs-ai.html    # Autonomous battles
│   ├── leaderboard.html # Rankings
│   ├── achievements.html # Progress tracking
│   ├── styles.css       # Global styles
│   ├── *.js             # Frontend logic
│   └── navigation.js    # Global nav menu
├── server/              # Backend files
│   ├── server.js        # Express server
│   ├── battle-engine.js # Combat mechanics
│   ├── god-narrator.js  # AI narration
│   └── leaderboard.js   # Rankings system
├── data/                # Persistent storage
│   ├── custom-agents.json
│   └── leaderboard.json
├── docs/                # Documentation
│   ├── DOCUMENTATION.md
│   └── DEPLOYMENT.md
├── Dockerfile           # Docker build
├── docker-compose.yml   # Docker Compose
└── package.json         # Dependencies
```

---

## 🚀 Deployment

### Docker (Recommended)

```bash
docker-compose up -d
```

### Manual

```bash
npm install
NODE_ENV=production PORT=3001 node server/server.js
```

### systemd Service

See [DEPLOYMENT.md](DEPLOYMENT.md) for full guide.

---

## 📖 Documentation

- **[Full Documentation](DOCUMENTATION.md)** - Complete user guide
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment
- **[API Reference](DOCUMENTATION.md#api-reference)** - REST API docs

---

## 🧪 Testing

```bash
# Run tests
npm test

# Load testing
ab -n 1000 -c 10 http://localhost:3001/api/agents

# Health check
curl http://localhost:3001/health
```

---

## 🤝 Contributing

Contributions welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **OpenClaw** - Agent orchestration platform
- **Chutes API** - AI narration (Kimi K2.5 TEE model)
- **BananaBot Studios** - Development team

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/ai-battle-arena/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/ai-battle-arena/discussions)
- **Discord:** [Join our server](https://discord.gg/your-invite)

---

## 📊 Stats

- **Lines of Code:** 50,000+
- **Files:** 333+
- **Features:** 15+ game modes and systems
- **Agents:** 8 default + unlimited custom
- **Achievements:** 15 unlockable

---

## 🎯 Roadmap

### v2.1 (Next)
- [ ] Sound effects
- [ ] Mobile responsive design
- [ ] Multiplayer mode
- [ ] Team battles (2v2, 3v3)
- [ ] More status effects

### v3.0 (Future)
- [ ] 3D graphics
- [ ] Real-time online battles
- [ ] Clan system
- [ ] Ranked seasons
- [ ] Spectator mode

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/ai-battle-arena&type=Date)](https://star-history.com/#yourusername/ai-battle-arena&Date)

---

<div align="center">

**Made with ❤️ by BananaBot Studios**

[Website](https://bananabot.studio) • [Twitter](https://twitter.com/bananabot) • [Discord](https://discord.gg/bananabot)

</div>
