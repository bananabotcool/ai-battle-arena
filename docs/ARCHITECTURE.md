# 🏗️ AI Battle Arena - Architecture

System design, data flow, and technical decisions.

---

## 📐 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  index.html │  │tournament.html│  │    demo.html     │  │
│  │  (Arena)    │  │  (Bracket)    │  │ (Full Features)  │  │
│  └──────┬──────┘  └───────┬──────┘  └────────┬─────────┘  │
│         │                  │                   │             │
│  ┌──────▼──────────────────▼───────────────────▼─────────┐ │
│  │         JavaScript Modules (Vanilla)                   │ │
│  │  agents.js │ arena.js │ tournament.js │ creator.js    │ │
│  │  animator.js (visual effects engine)                   │ │
│  └─────────────────────────┬──────────────────────────────┘ │
└────────────────────────────┼───────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   HTTP/WebSocket │
                    └────────┬─────────┘
┌────────────────────────────▼───────────────────────────────┐
│                         Backend                             │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │  server.js   │  │battle-engine │  │  god-narrator   │ │
│  │  (Express)   │  │              │  │  (OpenClaw)     │ │
│  └──────┬───────┘  └──────┬───────┘  └────────┬────────┘ │
│         │                   │                   │          │
│  ┌──────▼───────────────────▼───────────────────▼────────┐│
│  │              better-sqlite3 (data)                     ││
│  │  default-agents.json │ custom-agents.json             ││
│  └────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 Module Breakdown

### Frontend Modules

#### `agents.js` - Agent System
**Responsibilities:**
- Load default agents from JSON
- Load custom agents from localStorage/API
- Agent selection UI rendering
- Random matchmaking
- Utility functions (emoji mapping, stat colors)

**Key Classes:**
- `AgentSystem`

**Dependencies:**
- None (standalone)

---

#### `arena.js` - Battle Controller
**Responsibilities:**
- Battle state management
- API communication (start battle, perform action)
- UI updates (HP bars, stats, round counter)
- Battle log management
- Victory detection & handling
- Local fallback mode (offline battles)

**Key Classes:**
- `ArenaController`

**Dependencies:**
- Expects `animator.js` for visual effects (optional)

---

#### `animator.js` - Visual Effects Engine
**Responsibilities:**
- Floating damage numbers
- Screen shake effects
- HP bar animations
- Hit flash effects
- Victory modal animations

**Key Functions:**
- `showDamage(agentIndex, amount, isCritical)`
- `screenShake(intensity)`
- `hitFlash(element)`
- `showVictoryModal(winnerName)`

**Dependencies:**
- None (pure DOM manipulation)

---

#### `creator.js` - Custom Fighter Creator
**Responsibilities:**
- Fighter creation UI
- Stat allocation system (100 points total)
- Ability selection (16-ability pool, pick 4)
- Live preview updates
- Validation (stat limits, ability requirements)
- Save to backend/localStorage

**Key Classes:**
- `AgentCreator`

**Dependencies:**
- `AgentSystem` (for saving)

---

#### `tournament.js` - Tournament System
**Responsibilities:**
- 8-fighter bracket generation
- Match progression logic
- Winner advancement
- Round announcements
- Victory screen
- State persistence (localStorage)

**Key Classes:**
- `TournamentSystem`

**Dependencies:**
- `AgentSystem` (for fighter loading)
- `ArenaController` (for battles)

---

### Backend Modules

#### `server.js` - Express Server
**Responsibilities:**
- HTTP server setup
- API route handling
- Static file serving
- CORS configuration
- Custom agent storage (JSON file I/O)

**Key Routes:**
- `/api/agents` - List all agents
- `/api/custom-agents` - CRUD for custom agents
- `/api/battle/start` - Initialize battles
- `/api/battle/action` - Perform actions

---

#### `battle-engine.js` - Combat Logic
**Responsibilities:**
- Damage calculation
- Defense mechanics
- Critical hit system
- Special move cooldowns
- Status effects (burn, freeze, poison, etc.)
- Victory detection

**Key Functions:**
- `calculateDamage(attacker, defender, isSpecial)`
- `applyStatusEffect(agent, effect)`
- `processTurn(action, attacker, defender)`

---

#### `god-narrator.js` - AI Narrator
**Responsibilities:**
- OpenClaw API integration
- Contextual narration generation
- Event-based commentary
- Fallback messages (if API unavailable)

**Key Functions:**
- `getNarration(event, context)`

**Dependencies:**
- OpenClaw Gateway Token (env var)

---

## 🔄 Data Flow

### Battle Flow

```
User clicks "Attack"
    ↓
ArenaController.performAction(1, 'attack')
    ↓
POST /api/battle/action
    ↓
battle-engine.js calculates damage
    ↓
god-narrator.js generates narration
    ↓
Response with events + new state
    ↓
ArenaController.processActionResult()
    ↓
animator.js shows damage number
    ↓
ArenaController.updateUI() updates HP bars
    ↓
Battle log updated
    ↓
Check for victory
```

### Tournament Flow

```
TournamentSystem.initTournament()
    ↓
Select 8 random fighters
    ↓
Generate bracket (7 matches)
    ↓
Render bracket UI
    ↓
User clicks "Start Match"
    ↓
TournamentSystem.startMatch(matchId)
    ↓
Show round announcement
    ↓
Open battle modal
    ↓
ArenaController.startBattle(fighter1, fighter2)
    ↓
Battle proceeds...
    ↓
On victory: TournamentSystem.processMatchResult()
    ↓
Advance winner to next bracket slot
    ↓
Update bracket UI
    ↓
If finals complete: show championship screen
```

### Custom Creator Flow

```
User opens creator
    ↓
AgentCreator.render(container)
    ↓
User adjusts stats/abilities
    ↓
Live preview updates on every change
    ↓
User clicks "Create Fighter"
    ↓
AgentCreator.createAgent()
    ↓
Validate (100 points, 4 abilities, 1 Special)
    ↓
POST /api/custom-agents
    ↓
Server saves to custom-agents.json
    ↓
AgentSystem.saveCustomAgent() (localStorage fallback)
    ↓
Alert user + close creator
    ↓
Refresh agent list
```

---

## 💾 Data Storage

### Client-Side (localStorage)
```javascript
// Custom agents (fallback)
localStorage.setItem('customAgents', JSON.stringify(agents));

// Tournament state (resume on reload)
localStorage.setItem('tournamentState', JSON.stringify(state));
```

### Server-Side (JSON Files)
```
data/
  ├── default-agents.json   (8 pre-made fighters, read-only)
  └── custom-agents.json    (user-created fighters, writable)
```

### Future: Database Migration
When scaling beyond MVP:
- **SQLite** for battle history, leaderboards
- **PostgreSQL** for multi-user deployments
- **Redis** for session state & caching

---

## 🎨 Styling Architecture

### CSS Variables (Design Tokens)
```css
:root {
  --bg-dark: #0a0514;
  --neon-cyan: #00f0ff;
  --neon-pink: #ff006e;
  --neon-purple: #9d00ff;
  --neon-yellow: #ffea00;
  --hp-green: #00ff88;
  --hp-yellow: #ffdd00;
  --hp-orange: #ff8800;
  --hp-red: #ff0044;
}
```

### Modular CSS Structure
```
styles.css (main arena + shared)
tournament.css (tournament-specific)
creator.css (appended to styles.css)
```

### Animation System
- **CSS Transitions:** HP bars, buttons, hovers (300ms ease)
- **CSS Keyframes:** Damage float, screen shake, glow effects
- **IntersectionObserver:** Scroll-reveal animations
- **RequestAnimationFrame:** Smooth 60fps battle animations

---

## ⚡ Performance Optimizations

### Frontend
1. **No Framework Overhead** - Pure vanilla JS (~0KB framework tax)
2. **Lazy Module Loading** - Only load what's needed per page
3. **CSS Containment** - `contain: layout style` on cards
4. **IntersectionObserver** - Lazy animate elements on scroll
5. **Debounced Events** - Stat sliders update on input end

### Backend
1. **In-Memory Battle State** - No DB writes during battles
2. **JSON File Caching** - Agents loaded once on server start
3. **Async/Await** - Non-blocking I/O for API calls
4. **Connection Pooling** - (Future: DB connection reuse)

### Rendering
- **Virtual Scrolling** - (Future: For 100+ agent lists)
- **DOM Reuse** - Update innerHTML instead of recreating
- **CSS Hardware Acceleration** - `will-change` on animated elements

---

## 🔐 Security Considerations

### Input Validation
- **Stat Totals:** Client validates 100-point limit, server re-validates
- **Ability Count:** Enforced client + server (must be 4)
- **Special Required:** At least 1 Special ability enforced
- **Sanitization:** HTML escaped in all user inputs

### API Security
- **Rate Limiting:** 100 req/min per IP (production)
- **File Upload Limits:** 5MB max for avatar images
- **Path Traversal Prevention:** Filename sanitization
- **SQL Injection:** N/A (using JSON files for MVP)
- **XSS Prevention:** All user content escaped before DOM insertion

### Future Auth
- JWT tokens for user sessions
- bcrypt password hashing
- HTTPS enforcement
- CSRF token validation

---

## 🧪 Testing Strategy

### Unit Tests
```javascript
// Example: Battle damage calculation
describe('BattleEngine', () => {
  it('calculates damage correctly', () => {
    const attacker = { atk: 30 };
    const defender = { def: 10 };
    const damage = calculateDamage(attacker, defender, false);
    expect(damage).toBeGreaterThanOrEqual(18); // 30 * 0.8 - 10*0.2
    expect(damage).toBeLessThanOrEqual(32);    // 30 * 1.2 - 10*0.2
  });
});
```

### Integration Tests
- Battle start → action → victory flow
- Tournament 8-fighter → champion flow
- Custom agent create → save → load → battle

### Manual QA Checklist
- All buttons clickable
- HP bars animate smoothly
- Damage numbers appear correctly
- Victory screen triggers at 0 HP
- Tournament bracket updates correctly
- Custom fighters persist across reloads

---

## 📊 Scalability Considerations

### Current Limits (MVP)
- **Agents:** ~1000 (JSON file, client-side array)
- **Concurrent Battles:** ~100 (in-memory state)
- **Tournaments:** ~10 active (localStorage limit)

### Scaling Path
1. **Phase 1:** Add PostgreSQL for agents/battles
2. **Phase 2:** Redis for session/tournament state
3. **Phase 3:** WebSocket for real-time battles
4. **Phase 4:** Horizontal scaling with load balancer
5. **Phase 5:** Microservices (battle engine, narrator, storage)

---

## 🔧 Build & Deployment

### Development
```bash
npm start  # Runs server.js on port 3000
```

### Production
```bash
# Option 1: Node server
npm run start:prod

# Option 2: Static hosting (frontend only)
# Deploy public/ folder to Vercel/Netlify/Cloudflare Pages

# Option 3: Docker
docker build -t ai-battle-arena .
docker run -p 3000:3000 ai-battle-arena
```

### Environment Variables
```bash
PORT=3000
OPENCLAW_GATEWAY_TOKEN=<your-token>
OPENCLAW_GATEWAY_URL=http://localhost:8080
NODE_ENV=production
```

---

## 🎯 Design Patterns Used

1. **Module Pattern** - Encapsulated classes (AgentSystem, ArenaController)
2. **Observer Pattern** - Event listeners for UI updates
3. **Strategy Pattern** - Different battle actions (attack, defend, special)
4. **Factory Pattern** - Agent creation from JSON templates
5. **Singleton Pattern** - Single ArenaController per page
6. **State Pattern** - Tournament match states (ready, active, complete, locked)

---

## 🚀 Future Architecture

### Planned Features
1. **WebSocket Battle Sync** - Real-time spectator mode
2. **User Accounts** - Login, battle history, rankings
3. **Leaderboards** - Global/monthly champion boards
4. **Replay System** - Record & playback battles
5. **Team Battles** - 2v2, 3v3 modes
6. **Advanced AI** - Personality-based strategies
7. **Mobile App** - React Native port

### Architecture Evolution
```
Current: Monolith (Express + Vanilla JS)
    ↓
Phase 1: API split (REST + WebSocket)
    ↓
Phase 2: Microservices (battle, storage, narrator)
    ↓
Phase 3: Event-driven (message queue for battles)
    ↓
Phase 4: Serverless (AWS Lambda/Cloudflare Workers)
```

---

For implementation details, see [API.md](API.md) and [CONTRIBUTING.md](CONTRIBUTING.md).
