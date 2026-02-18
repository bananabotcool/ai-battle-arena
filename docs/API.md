# 📡 AI Battle Arena - API Reference

Complete documentation for all backend endpoints and frontend APIs.

---

## Backend API Endpoints

### Base URL
```
http://localhost:3000/api
```

---

## 🎭 Agents

### GET `/api/agents`
List all available agents (default + custom).

**Response:**
```json
[
  {
    "id": "berserker_ragnar",
    "name": "Ragnar the Unstoppable",
    "personality": "Berserker",
    "stats": {
      "hp": 120,
      "maxHp": 120,
      "atk": 30,
      "def": 10,
      "speed": 15,
      "luck": 8,
      "special": 20
    },
    "abilities": ["Fury Strike", "Bloodlust", "Rampage", "Special: Berserk Rage"],
    "mood": "eager",
    "description": "A fierce warrior...",
    "lore": "Ragnar lost everything..."
  }
]
```

### POST `/api/custom-agents`
Save a custom-created agent.

**Request Body:**
```json
{
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
  "abilities": ["Fury Strike", "Bloodlust", "Quick Attack", "Special: Berserk Rage"],
  "description": "A custom Berserker...",
  "lore": "Shadow Fang was forged..."
}
```

**Response:** `201 Created`
```json
{
  "id": "custom_1234567890_abc123",
  ...
}
```

### GET `/api/custom-agents`
List all custom-created agents.

**Response:**
```json
[
  { "id": "custom_...", ... }
]
```

---

## ⚔️ Battle

### POST `/api/battle/start`
Initialize a new battle between two agents.

**Request Body:**
```json
{
  "agent1": { "id": "berserker_ragnar", ... },
  "agent2": { "id": "tank_ironwall", ... }
}
```

**Response:** `200 OK`
```json
{
  "battleId": "battle_1234567890",
  "state": {
    "agent1": { "hp": 120, "specialCooldown": 0, ... },
    "agent2": { "hp": 150, "specialCooldown": 0, ... },
    "round": 1,
    "log": []
  }
}
```

### POST `/api/battle/action`
Perform an action in an active battle.

**Request Body:**
```json
{
  "battleId": "battle_1234567890",
  "agentIndex": 1,
  "action": "attack"
}
```

**Actions:** `attack`, `defend`, `special`

**Response:** `200 OK`
```json
{
  "events": [
    {
      "type": "attack",
      "message": "Ragnar attacks for 28 damage!",
      "target": "agent2",
      "amount": 28,
      "isCritical": false
    }
  ],
  "state": {
    "agent1": { "hp": 120, ... },
    "agent2": { "hp": 122, ... },
    "round": 2
  },
  "winner": null
}
```

**Victory Response:**
```json
{
  "events": [...],
  "state": {...},
  "winner": {
    "id": "berserker_ragnar",
    "name": "Ragnar the Unstoppable"
  }
}
```

### GET `/api/battle/:battleId`
Get current state of a battle.

**Response:** `200 OK`
```json
{
  "battleId": "battle_1234567890",
  "state": {...},
  "createdAt": "2026-02-18T18:00:00.000Z"
}
```

---

## 🏆 Tournament

### POST `/api/tournament/start`
Initialize an 8-fighter tournament.

**Request Body:**
```json
{
  "fighters": [
    { "id": "berserker_ragnar", ... },
    ...8 agents total
  ]
}
```

**Response:** `201 Created`
```json
{
  "tournamentId": "tournament_1234567890",
  "bracket": {
    "qf": [null, null, null, null],
    "sf": [null, null],
    "champion": null
  },
  "currentMatch": 0
}
```

### POST `/api/tournament/:id/result`
Record match result and advance winner.

**Request Body:**
```json
{
  "matchId": 1,
  "winnerId": "berserker_ragnar"
}
```

**Response:** `200 OK`
```json
{
  "nextMatch": 2,
  "bracketUpdated": true
}
```

---

## 🎤 God AI Narrator

### POST `/api/narrate`
Get dramatic battle narration from God AI.

**Request Body:**
```json
{
  "event": {
    "type": "attack",
    "attacker": "Ragnar the Unstoppable",
    "defender": "Ironwall the Unyielding",
    "damage": 28,
    "critical": false
  }
}
```

**Response:** `200 OK`
```json
{
  "narration": "Ragnar's axe SLAMS into Ironwall's shield! The arena shakes with the impact. (28 damage)"
}
```

**Event Types:** `attack`, `defend`, `special`, `critical`, `victory`, `defeat`

---

## Frontend JavaScript APIs

## AgentSystem

```javascript
const agentSystem = new AgentSystem();

// Load agents
await agentSystem.loadAllAgents();

// Get agent by ID
const agent = agentSystem.getAgentById('berserker_ragnar');

// Get random agent
const randomAgent = agentSystem.getRandomAgent();

// Get random opponent (exclude specific ID)
const opponent = agentSystem.getRandomOpponent('berserker_ragnar');

// Save custom agent
await agentSystem.saveCustomAgent(agentData);

// Render UI
agentSystem.renderAgentCard(agent, container, onSelectCallback);
agentSystem.renderAgentSelection(container, onSelectCallback);

// Utilities
const emoji = agentSystem.getPersonalityEmoji('Berserker'); // ⚔️
const color = agentSystem.getStatColor(35); // '#00ffaa'
```

---

## ArenaController

```javascript
const arena = new ArenaController();

// Start battle
await arena.startBattle(agent1, agent2);

// Perform action
await arena.performAction(agentIndex, action);
// agentIndex: 1 or 2
// action: 'attack' | 'defend' | 'special'

// Update UI
arena.updateUI();
arena.updateAgentPanel(agentNumber, agentData);

// Battle log
arena.addBattleLog(type, message);
// type: 'attack' | 'defend' | 'special' | 'damage' | 'system'
arena.clearBattleLog();

// Victory
arena.checkVictory();
arena.handleVictory(winner);

// Reset
arena.reset();
```

---

## TournamentSystem

```javascript
const tournament = new TournamentSystem(agentSystem, arena);

// Initialize tournament
tournament.initTournament(fighters?); // fighters optional (8 agents)

// Start match
await tournament.startMatch(matchId);

// Process result
const result = tournament.processMatchResult(matchId, winnerId);
// Returns: { complete: boolean, nextMatch?: Match, champion?: Agent }

// Get current match
const match = tournament.getCurrentMatch();

// Round announcements
const announcement = tournament.getRoundAnnouncement(match);

// Victory stats
const stats = tournament.getVictoryStats();

// Show victory screen
tournament.showVictoryScreen();

// State management
tournament.saveState();
tournament.loadState();
tournament.resetTournament();

// UI
tournament.renderBracket(container);
```

---

## AgentCreator

```javascript
const creator = new AgentCreator(agentSystem);

// Render UI
creator.render(container);

// Create agent (validates & saves)
await creator.createAgent();

// Randomize
creator.randomize();

// Update preview
creator.updatePreview();

// Close
creator.close();
```

---

## Data Structures

### Agent Object
```typescript
interface Agent {
  id: string;
  name: string;
  personality: "Berserker" | "Tank" | "Trickster" | "Strategist" | "Glass Cannon" | "Speedster" | "Balanced";
  stats: {
    hp: number;
    maxHp: number;
    atk: number;
    def: number;
    speed: number;
    luck: number;
    special: number;
  };
  abilities: string[]; // 4 abilities
  mood: string;
  specialMeter: number;
  description: string;
  lore: string;
}
```

### Match Object
```typescript
interface Match {
  id: number; // 1-7
  round: "QF" | "SF" | "F";
  roundName: "Quarterfinals" | "Semifinals" | "Finals";
  fighter1: Agent;
  fighter2: Agent;
  winner: Agent | null;
  status: "ready" | "active" | "complete" | "locked";
}
```

### Battle State
```typescript
interface BattleState {
  agent1: Agent & { hp: number; specialCooldown: number; defending?: boolean };
  agent2: Agent & { hp: number; specialCooldown: number; defending?: boolean };
  round: number;
  log: string[];
}
```

---

## Error Handling

All endpoints return standard HTTP status codes:

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

**Error Response Format:**
```json
{
  "error": "Error message here",
  "details": "Additional context (optional)"
}
```

---

## Rate Limiting

- **Default:** 100 requests per minute per IP
- **Battle endpoints:** 30 requests per minute
- **Custom agents:** 10 creates per minute

---

## WebSocket Events (Future)

Coming soon: Real-time battle updates via WebSocket.

```javascript
const ws = new WebSocket('ws://localhost:3000/ws');

ws.on('battle:update', (data) => {
  // Handle battle state update
});

ws.on('tournament:match', (data) => {
  // Handle tournament match start
});
```

---

## Authentication (Future)

Coming soon: User accounts and battle history.

**Header:**
```
Authorization: Bearer <token>
```

---

For more examples, see the [Integration Tests](../tests/api.test.js).
