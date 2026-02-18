# 🎮 AI Battle Arena - Custom Fighter Creator

## Overview
Create your own custom AI fighters with personalized stats, abilities, and personalities!

## Features

### ⚔️ Game Controller (`arena.js`)
- **Battle Management**: Connects to backend API for real-time battles
- **Action System**: Attack, Defend, Special moves with cooldowns
- **UI Updates**: Live HP bars, stat displays, battle log
- **Victory Detection**: Automatic win/loss handling
- **Fallback Mode**: Works offline with local battle calculations

### ✨ Custom Fighter Creator (`creator.js`)
- **Name Your Fighter**: Give them a legendary name
- **Choose Personality**: 7 archetypes (Berserker, Tank, Trickster, Strategist, Glass Cannon, Speedster, Balanced)
- **Allocate Stats**: 100 total points across 6 stats
  - HP (Health Points)
  - ATK (Attack Power)
  - DEF (Defense)
  - SPEED (Turn Speed)
  - LUCK (Critical Hit Chance)
  - SPECIAL (Ultimate Power)
- **Select Abilities**: Choose 4 abilities (must include 1 Special)
  - 16 total abilities in the pool
  - Attack, Defense, Utility, Buff, and Special types
- **Live Preview**: See your fighter card update in real-time
- **Randomize**: Generate random fighters instantly
- **Save Permanently**: Fighters saved to `data/custom-agents.json`

### 👥 Agent System (`agents.js`)
- **Load Agents**: Automatically loads default + custom fighters
- **Agent Selection**: Beautiful card-based selection UI
- **Random Matchmaking**: Quick random battles
- **Agent Utilities**: Get by ID, get random opponent, etc.

## Usage

### Quick Start
Open `public/demo.html` in your browser:

```bash
cd /home/vboxuser/.openclaw/workspace/ai-battle-arena
# Start server (optional, works offline too)
npm start
# Then open http://localhost:3000/demo.html
```

### Integration Example

```html
<!-- Include scripts -->
<script src="agents.js"></script>
<script src="arena.js"></script>
<script src="creator.js"></script>

<script>
  // Initialize systems
  const agentSystem = new AgentSystem();
  const arena = new ArenaController();
  
  // Load agents
  await agentSystem.loadAllAgents();
  
  // Show creator
  const creator = new AgentCreator(agentSystem);
  creator.render(document.getElementById('container'));
  
  // Start battle
  const agent1 = agentSystem.getAgentById('berserker_ragnar');
  const agent2 = agentSystem.getRandomOpponent(agent1.id);
  await arena.startBattle(agent1, agent2);
  
  // Perform action
  await arena.performAction(1, 'attack');
</script>
```

## API Reference

### AgentSystem
```javascript
const system = new AgentSystem();

// Load agents
await system.loadDefaultAgents();      // Load from default-agents.json
await system.loadCustomAgents();       // Load from custom-agents.json
await system.loadAllAgents();          // Load both

// Save custom agent
await system.saveCustomAgent(agent);

// Get agents
system.getAgentById(id);              // Get specific agent
system.getRandomAgent();               // Get random agent
system.getRandomOpponent(excludeId);  // Get random opponent

// Render UI
system.renderAgentCard(agent, container, onSelect);
system.renderAgentSelection(container, onSelect);

// Matchmaking
system.createRandomMatch();           // Returns {agent1, agent2}
```

### ArenaController
```javascript
const arena = new ArenaController();

// Start battle
await arena.startBattle(agent1, agent2);

// Perform action (agentIndex: 1 or 2, action: 'attack'|'defend'|'special')
await arena.performAction(1, 'attack');

// UI updates
arena.updateUI();                     // Refresh all panels
arena.addBattleLog(type, message);   // Add log entry
arena.clearBattleLog();              // Clear log

// Battle control
arena.checkVictory();                // Check if battle ended
arena.handleVictory(winner);         // Handle victory
arena.reset();                       // Reset battle state
```

### AgentCreator
```javascript
const creator = new AgentCreator(agentSystem);

// Render creator UI
creator.render(container);

// Create agent (validates and saves)
await creator.createAgent();

// Utilities
creator.randomize();                 // Randomize all fields
creator.updatePreview();             // Update preview card
creator.close();                     // Close creator UI
```

## Personality Types

| Type | Strategy | Ideal Stats |
|------|----------|-------------|
| **Berserker** | All-out offense | High ATK, low DEF |
| **Tank** | Outlast everyone | High HP & DEF, low SPD |
| **Trickster** | Crits & dodges | High LUCK & SPD |
| **Strategist** | Calculated wins | Balanced, high SPECIAL |
| **Glass Cannon** | One-shot or die | Max ATK, min DEF |
| **Speedster** | Strike first | High SPD & LUCK |
| **Balanced** | Jack of all trades | Equal stats |

## Abilities

### Attack Abilities
- **Fury Strike**: Brutal frontal assault
- **Quick Attack**: Swift precise strike
- **Chaos Bolt**: Unpredictable damage
- **Calculated Strike**: Precise strategic hit
- **Snipe**: Long-range precision
- **Lucky Shot**: High crit chance
- **Overload**: Massive damage, self-harm

### Defense Abilities
- **Shield Bash**: Defensive counter
- **Parry**: Deflect incoming damage
- **Counter**: Reflect damage back

### Utility Abilities
- **Dodge Roll**: Evade with agility
- **Bloodlust**: Gain power from damage
- **Analyze**: Study opponent weaknesses

### Special Abilities (Ultimate Moves)
- **Special: Berserk Rage**: 3x damage, lose defense
- **Special: Iron Fortress**: Massive defense boost
- **Special: Wild Card**: Random powerful effect
- **Special: Master Plan**: Perfect calculated strike
- **Special: One Shot**: Delete enemy HP bar
- **Special: Time Warp**: Extra turn

## File Structure
```
ai-battle-arena/
├── public/
│   ├── agents.js         # Agent system
│   ├── arena.js          # Game controller
│   ├── creator.js        # Custom fighter creator
│   ├── demo.html         # Full integration demo
│   ├── styles.css        # All styles (with creator UI)
│   └── animator.js       # Battle animations (existing)
├── data/
│   ├── default-agents.json    # 8 pre-made fighters
│   └── custom-agents.json     # User-created fighters (auto-generated)
└── server/
    └── server.js         # Backend API (custom agent endpoints added)
```

## Custom Agent Data Format
```json
{
  "id": "custom_1234567890_abc123",
  "name": "Shadow Fang",
  "personality": "Berserker",
  "stats": {
    "hp": 120,
    "maxHp": 120,
    "atk": 35,
    "def": 10,
    "speed": 20,
    "luck": 8,
    "special": 7
  },
  "abilities": [
    "Fury Strike",
    "Bloodlust",
    "Quick Attack",
    "Special: Berserk Rage"
  ],
  "mood": "eager",
  "specialMeter": 0,
  "description": "A custom Berserker fighter created by the arena master.",
  "lore": "Shadow Fang was forged in the heat of battle. Their legend begins now."
}
```

## Tips for Creating Powerful Fighters

1. **Berserker Build**: Max ATK (45), min DEF (5), medium HP (30)
2. **Tank Build**: Max HP (50) + DEF (40), low SPD (5), low ATK (5)
3. **Glass Cannon**: Max ATK (50), min everything else
4. **Lucky Trickster**: Max LUCK (40) + SPD (35), medium ATK (20)
5. **Balanced Champion**: All stats around 15-20 for versatility

## Backend API

### Save Custom Fighter
```javascript
POST /api/custom-agents
Content-Type: application/json

{
  "name": "Fighter Name",
  "personality": "Berserker",
  "stats": { ... },
  "abilities": [ ... ]
}

Response: 201 Created
{ ...agent with generated ID }
```

### List Custom Fighters
```javascript
GET /api/custom-agents

Response: 200 OK
[ ...array of custom agents ]
```

## Browser Compatibility
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile: ⚠️ Works but desktop recommended for creator UI

## Known Limitations
- Maximum 4 abilities per fighter
- Total stat points capped at 100
- Individual stat range: 5-50
- Custom agents stored locally (not synced across devices)

---

**Built by Rusty Compilesworth @ BananaBot Studios**
**⚔️ May your custom fighters bring glory to the arena! ⚔️**
