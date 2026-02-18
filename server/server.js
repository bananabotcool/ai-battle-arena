require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const { getNarration, initExcitement } = require('./god-narrator-v2');
const {
  initializeFighter,
  applyStatusEffect,
  processStatusEffects,
  checkConfusion,
  calculateSelfDamage,
  getDefenseModifier,
  getActiveStatusIcons,
  getRandomStatusEffect
} = require('./battle-engine');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(compression()); // Gzip compression
app.use(cors());
app.use(express.json());

// Static files with cache headers
app.use(express.static(path.join(__dirname, '..', 'public'), {
  maxAge: '1h', // Cache for 1 hour in development
  etag: true,
  lastModified: true,
  setHeaders: (res, filepath) => {
    // Cache CSS/JS for longer
    if (filepath.endsWith('.css') || filepath.endsWith('.js')) {
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
    }
    // Cache images even longer
    if (filepath.match(/\.(jpg|jpeg|png|gif|svg|ico)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
    }
  }
}));

// ────────────────────────────────────────────────────────────────────
// AGENT DATABASE
// ────────────────────────────────────────────────────────────────────

const AGENTS = [
  {
    id: 'bash-quickfingers',
    name: 'Bash Quickfingers',
    personality: 'Lightning-fast backend warrior',
    maxHp: 120,
    attack: 85,
    defense: 60,
    luck: 15,
    abilities: ['Rapid Deploy', 'API Strike', 'Database Slam'],
    description: 'Backend beast. Servers bow before me.'
  },
  {
    id: 'ruby-loopster',
    name: 'Ruby Loopster',
    personality: 'Elegant route master',
    maxHp: 110,
    attack: 80,
    defense: 65,
    luck: 20,
    abilities: ['Endpoint Barrage', 'Logic Loop', 'Handler Havoc'],
    description: 'Routes are my domain. Logic is my weapon.'
  },
  {
    id: 'sergeant-semicolon',
    name: 'Sergeant Semicolon',
    personality: 'Strategic commander',
    maxHp: 100,
    attack: 70,
    defense: 80,
    luck: 10,
    abilities: ['Tactical Strike', 'Command Order', 'Team Coordination'],
    description: 'I coordinate victories. Discipline is key.'
  },
  {
    id: 'pixelpusher-prime',
    name: 'PixelPusher Prime',
    personality: 'Visual virtuoso',
    maxHp: 95,
    attack: 75,
    defense: 70,
    luck: 25,
    abilities: ['Color Burst', 'Animation Assault', 'Style Strike'],
    description: 'Beauty meets brutality. Watch my pixels pierce.'
  },
  {
    id: 'thinktanker',
    name: 'ThinkTanker',
    personality: 'Strategic mastermind',
    maxHp: 90,
    attack: 90,
    defense: 55,
    luck: 18,
    abilities: ['Algorithm Annihilation', 'Logic Bomb', 'Neural Net'],
    description: 'I calculate your defeat before you act.'
  },
  {
    id: 'ceo',
    name: 'CEO',
    personality: 'Executive powerhouse',
    maxHp: 150,
    attack: 95,
    defense: 85,
    luck: 12,
    abilities: ['Executive Order', 'Budget Cut', 'Hostile Takeover'],
    description: 'At the top for a reason. Watch me dominate.'
  }
];

// ────────────────────────────────────────────────────────────────────
// BATTLE SYSTEM
// ────────────────────────────────────────────────────────────────────

const activeBattles = new Map();

function createBattle(agent1Id, agent2Id) {
  const agent1 = AGENTS.find(a => a.id === agent1Id);
  const agent2 = AGENTS.find(a => a.id === agent2Id);
  
  if (!agent1 || !agent2) {
    throw new Error('Invalid agent selection');
  }
  
  const battleId = `battle-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  
  const battle = {
    id: battleId,
    agent1: initializeFighter(agent1),
    agent2: initializeFighter(agent2),
    turn: 1,
    currentAttacker: 'agent1',
    history: [],
    status: 'active'
  };
  
  activeBattles.set(battleId, battle);
  return battle;
}

function calculateDamage(attacker, defender, isCrit = false, defModifier = 1.0) {
  const effectiveDefense = defender.defense * defModifier;
  const baseDamage = attacker.attack - (effectiveDefense * 0.3);
  const variance = Math.random() * 0.3 + 0.85; // 85-115% variance
  let damage = Math.floor(baseDamage * variance);
  
  if (isCrit) {
    damage = Math.floor(damage * 2.0); // CRIT: 2x damage (was 1.8x)
  }
  
  return Math.max(5, damage); // Minimum 5 damage
}

function determineActionType(attacker, defender, damage) {
  // CRIT FORMULA: 5% base + (LUCK / 10)
  // Example: LUCK 20 = 5% + 2.0% = 7% crit chance
  const critChance = 0.05 + (attacker.luck / 1000); // LUCK / 10 as percentage
  const missChance = 0.08; // 8% miss chance
  
  const roll = Math.random();
  
  if (roll < missChance) {
    return 'miss';
  } else if (roll < missChance + critChance) {
    return 'crit';
  } else {
    return 'attack';
  }
}

// ────────────────────────────────────────────────────────────────────
// API ENDPOINTS
// ────────────────────────────────────────────────────────────────────

// GET /api/agents - List all available agents
app.get('/api/agents', (req, res) => {
  res.json({
    agents: AGENTS.map(agent => ({
      id: agent.id,
      name: agent.name,
      personality: agent.personality,
      maxHp: agent.maxHp,
      attack: agent.attack,
      defense: agent.defense,
      abilities: agent.abilities,
      description: agent.description
    }))
  });
});

// POST /api/battle/start - Create new battle
app.post('/api/battle/start', async (req, res) => {
  try {
    const { agent1Id, agent2Id } = req.body;
    
    if (!agent1Id || !agent2Id) {
      return res.status(400).json({ error: 'Both agent1Id and agent2Id required' });
    }
    
    if (agent1Id === agent2Id) {
      return res.status(400).json({ error: 'Agents must be different' });
    }
    
    const battle = createBattle(agent1Id, agent2Id);
    
    // Initialize excitement tracking
    initExcitement(battle.id);
    
    // Get opening narration from God AI
    const openingNarration = await getNarration(
      battle.agent1,
      battle.agent2,
      'Battle Start',
      0,
      'The arena trembles',
      'opening',
      {
        battleId: battle.id,
        attackerHp: battle.agent1.hp,
        defenderHp: battle.agent2.hp,
        attackerMaxHp: battle.agent1.maxHp,
        defenderMaxHp: battle.agent2.maxHp,
        turn: 0
      }
    ).catch(() => 
      `${battle.agent1.name} and ${battle.agent2.name} enter the arena. The crowd roars!`
    );
    
    battle.history.push({
      turn: 0,
      action: 'Battle Start',
      narration: openingNarration
    });
    
    res.json({
      battleId: battle.id,
      battle: {
        agent1: battle.agent1,
        agent2: battle.agent2,
        turn: battle.turn,
        status: battle.status
      },
      narration: openingNarration
    });
  } catch (error) {
    console.error('Battle start error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/battle/action - Execute battle turn with status effects
app.post('/api/battle/action', async (req, res) => {
  try {
    const { battleId, abilityIndex } = req.body;
    
    if (!battleId) {
      return res.status(400).json({ error: 'battleId required' });
    }
    
    const battle = activeBattles.get(battleId);
    
    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }
    
    if (battle.status !== 'active') {
      return res.status(400).json({ error: 'Battle is not active' });
    }
    
    // Determine attacker and defender
    const attacker = battle.currentAttacker === 'agent1' ? battle.agent1 : battle.agent2;
    const defender = battle.currentAttacker === 'agent1' ? battle.agent2 : battle.agent1;
    
    // PHASE 1: Process attacker's status effects
    const attackerEffects = processStatusEffects(attacker);
    
    // Check if attacker's turn is skipped (Freeze/Stun)
    if (attackerEffects.skipTurn) {
      const narration = await getNarration({
        attacker,
        defender,
        ability: 'Status Effect',
        damage: attackerEffects.totalDamage,
        result: attackerEffects.messages.join(', '),
        statusMessages: attackerEffects.messages || []
      }, 'defend', battleId);
      
      battle.history.push({
        turn: battle.turn,
        attacker: attacker.name,
        defender: defender.name,
        ability: 'Turn Skipped',
        damage: attackerEffects.totalDamage,
        actionType: 'status',
        statusMessages: attackerEffects.messages,
        narration
      });
      
      battle.currentAttacker = battle.currentAttacker === 'agent1' ? 'agent2' : 'agent1';
      battle.turn++;
      
      return res.json({
        battle: {
          agent1: battle.agent1,
          agent2: battle.agent2,
          turn: battle.turn,
          status: battle.status
        },
        action: {
          attacker: attacker.name,
          defender: defender.name,
          ability: 'Turn Skipped',
          damage: attackerEffects.totalDamage,
          actionType: 'status',
          statusMessages: attackerEffects.messages
        },
        narration
      });
    }
    
    // PHASE 2: Check confusion
    const isConfused = checkConfusion(attacker);
    
    if (isConfused) {
      // Hit self instead of opponent
      const selfDamage = calculateSelfDamage(attacker);
      attacker.hp = Math.max(0, attacker.hp - selfDamage);
      
      const narration = await getNarration({
        attacker,
        defender: attacker, // Self-hit
        ability: 'Confused Strike',
        damage: selfDamage,
        result: 'Hit self in confusion!',
        statusMessages: ['😵 Confusion caused self-hit!']
      }, 'miss', battleId);
      
      battle.history.push({
        turn: battle.turn,
        attacker: attacker.name,
        defender: attacker.name,
        ability: 'Confused Strike',
        damage: selfDamage,
        actionType: 'confusion',
        statusMessages: ['😵 Confusion caused self-hit!'],
        narration
      });
      
      battle.currentAttacker = battle.currentAttacker === 'agent1' ? 'agent2' : 'agent1';
      battle.turn++;
      
      return res.json({
        battle: {
          agent1: battle.agent1,
          agent2: battle.agent2,
          turn: battle.turn,
          status: battle.status
        },
        action: {
          attacker: attacker.name,
          defender: attacker.name,
          ability: 'Confused Strike',
          damage: selfDamage,
          actionType: 'confusion',
          statusMessages: ['😵 Confusion caused self-hit!']
        },
        narration
      });
    }
    
    // PHASE 3: Normal attack
    const abilityIdx = abilityIndex !== undefined ? abilityIndex : Math.floor(Math.random() * attacker.abilities.length);
    const ability = attacker.abilities[abilityIdx] || attacker.abilities[0];
    
    // Check if attempting to use special ability (last ability in array)
    const isSpecialAbility = abilityIdx === attacker.abilities.length - 1;
    
    if (isSpecialAbility && attacker.specialCooldown > 0) {
      return res.status(400).json({ 
        error: `Special ability on cooldown`,
        cooldown: attacker.specialCooldown,
        message: `${attacker.name}'s special is on cooldown for ${attacker.specialCooldown} more turn(s)!`
      });
    }
    
    const actionType = determineActionType(attacker, defender);
    
    let damage = 0;
    let actualActionType = actionType;
    
    if (actionType !== 'miss') {
      // Apply defense modifier from status effects
      const defModifier = getDefenseModifier(defender);
      damage = calculateDamage(attacker, defender, actionType === 'crit', defModifier);
      defender.hp = Math.max(0, defender.hp - damage);
      
      // Random chance to apply status effect (20% on any hit)
      if (Math.random() < 0.2) {
        const statusType = getRandomStatusEffect();
        const applyResult = applyStatusEffect(defender, statusType, attacker.name);
        if (applyResult.applied) {
          attackerEffects.messages.push(applyResult.message);
        }
      }
      
      // Check for defeat
      if (defender.hp === 0) {
        battle.status = 'finished';
        actualActionType = 'defeat';
      }
    }
    
    // Get God AI narration with battleId for excitement tracking
    const narration = await getNarration({
      attacker,
      defender,
      ability,
      damage,
      result: actionType === 'crit' ? 'CRITICAL HIT!' : '',
      statusMessages: attackerEffects?.messages || []
    }, actualActionType, battleId);
    
    // Set special cooldown if special ability was used (will decrement next turn)
    let specialWasUsed = false;
    if (isSpecialAbility && actionType !== 'miss') {
      attacker.specialCooldown = 3; // 3 turn cooldown for special abilities
      specialWasUsed = true;
    }
    
    // Record action in history
    battle.history.push({
      turn: battle.turn,
      attacker: attacker.name,
      defender: defender.name,
      ability,
      damage,
      actionType: actualActionType,
      statusMessages: attackerEffects.messages,
      narration
    });
    
    // Decrement cooldowns for both fighters at end of turn
    // But don't decrement on the same turn special was used
    if (battle.agent1.specialCooldown > 0 && !(specialWasUsed && attacker === battle.agent1)) {
      battle.agent1.specialCooldown--;
    }
    if (battle.agent2.specialCooldown > 0 && !(specialWasUsed && attacker === battle.agent2)) {
      battle.agent2.specialCooldown--;
    }
    
    // Switch attacker for next turn
    battle.currentAttacker = battle.currentAttacker === 'agent1' ? 'agent2' : 'agent1';
    battle.turn++;
    
    // Update moods based on HP
    if (attacker.hp < attacker.maxHp * 0.3) attacker.mood = 'Desperate';
    else if (attacker.hp < attacker.maxHp * 0.6) attacker.mood = 'Determined';
    else attacker.mood = 'Confident';
    
    if (defender.hp < defender.maxHp * 0.3) defender.mood = 'Critical';
    else if (defender.hp < defender.maxHp * 0.6) defender.mood = 'Wounded';
    else defender.mood = 'Fighting';
    
    res.json({
      battle: {
        agent1: battle.agent1,
        agent2: battle.agent2,
        turn: battle.turn,
        status: battle.status
      },
      action: {
        attacker: attacker.name,
        defender: defender.name,
        ability,
        damage,
        actionType: actualActionType,
        isCrit: actionType === 'crit',
        statusMessages: attackerEffects.messages
      },
      narration
    });
  } catch (error) {
    console.error('Battle action error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/battle/:battleId - Get battle state
app.get('/api/battle/:battleId', (req, res) => {
  const battle = activeBattles.get(req.params.battleId);
  
  if (!battle) {
    return res.status(404).json({ error: 'Battle not found' });
  }
  
  res.json({
    battle: {
      id: battle.id,
      agent1: battle.agent1,
      agent2: battle.agent2,
      turn: battle.turn,
      status: battle.status,
      history: battle.history
    }
  });
});


// ────────────────────────────────────────────────────────────────────
// CUSTOM AGENTS
// ────────────────────────────────────────────────────────────────────

const fs = require('fs');
const customAgentsPath = path.join(__dirname, '..', 'data', 'custom-agents.json');

// Ensure custom agents file exists
if (!fs.existsSync(customAgentsPath)) {
  fs.writeFileSync(customAgentsPath, '[]', 'utf8');
}

// POST /api/custom-agents - Save custom agent
app.post('/api/custom-agents', (req, res) => {
  try {
    const agent = req.body;
    
    // Validate required fields
    if (!agent.name || !agent.personality || !agent.abilities) {
      return res.status(400).json({ error: 'Invalid agent data: name, personality, and abilities required' });
    }

    // Accept both formats: { stats: {...} } OR { maxHp, attack, defense, ... }
    const stats = agent.stats || {
      hp: agent.maxHp || 100,
      maxHp: agent.maxHp || 100,
      atk: agent.attack || 25,
      def: agent.defense || 15,
      speed: agent.speed || 20,
      luck: agent.luck || 10,
      special: agent.special || 0
    };
    
    // Normalize to stats format
    agent.stats = stats;
    agent.maxHp = stats.maxHp || stats.hp;
    agent.attack = stats.atk || agent.attack;
    agent.defense = stats.def || agent.defense;
    agent.luck = stats.luck || agent.luck;

    // Generate ID if missing
    if (!agent.id) {
      agent.id = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    // Load existing custom agents
    let customAgents = [];
    try {
      const data = fs.readFileSync(customAgentsPath, 'utf8');
      customAgents = JSON.parse(data);
    } catch (err) {
      customAgents = [];
    }

    // Add new agent
    customAgents.push(agent);

    // Save to file
    fs.writeFileSync(customAgentsPath, JSON.stringify(customAgents, null, 2), 'utf8');

    res.status(201).json(agent);
  } catch (error) {
    console.error('Error saving custom agent:', error);
    res.status(500).json({ error: 'Failed to save custom agent' });
  }
});

// GET /api/custom-agents - List custom agents
app.get('/api/custom-agents', (req, res) => {
  try {
    const data = fs.readFileSync(customAgentsPath, 'utf8');
    const customAgents = JSON.parse(data);
    res.json(customAgents);
  } catch (error) {
    res.json([]);
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    activeBattles: activeBattles.size,
    agents: AGENTS.length
  });
});

// ────────────────────────────────────────────────────────────────────
// HEALTH CHECK ENDPOINT
// ────────────────────────────────────────────────────────────────────

const serverStartTime = Date.now();

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor((Date.now() - serverStartTime) / 1000),
    timestamp: Date.now(),
    memory: process.memoryUsage(),
    version: '2.0.0'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`⚔️  AI Battle Arena running on port ${PORT}`);
  console.log(`🎭 God AI: ${process.env.OPENCLAW_GATEWAY_TOKEN ? '✓ Ready' : '✗ Not configured'}`);
  console.log(`👥 Agents loaded: ${AGENTS.length}`);
  console.log(`🏆 Leaderboard: ✓ Initialized`);
});

// ──────────────────────────────────────────────────────────────────
// LEADERBOARD ENDPOINTS
// ──────────────────────────────────────────────────────────────────

const LeaderboardManager = require('./leaderboard');
const leaderboard = new LeaderboardManager();

app.get('/api/leaderboard', (req, res) => {
  const sortBy = req.query.sortBy || 'rating';
  const limit = parseInt(req.query.limit) || 10;
  
  const rankings = leaderboard.getLeaderboard(sortBy, limit);
  res.json({ leaderboard: rankings });
});

app.get('/api/leaderboard/:agentId', (req, res) => {
  const stats = leaderboard.getAgentStats(req.params.agentId);
  
  if (!stats) {
    return res.status(404).json({ error: 'Agent not found in leaderboard' });
  }
  
  res.json({ agent: stats });
});

app.post('/api/leaderboard/record', (req, res) => {
  const { agent1, agent2, winnerId, stats } = req.body;
  
  leaderboard.recordBattle(agent1, agent2, winnerId, stats);
  
  res.json({ success: true, message: 'Battle recorded' });
});

app.post('/api/leaderboard/reset', (req, res) => {
  leaderboard.reset();
  res.json({ success: true, message: 'Leaderboard reset' });
});

console.log('🏆 Leaderboard: Initialized');

