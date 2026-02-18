/**
 * God AI Narrator Module v2 - PRODUCTION READY
 * Uses enhanced context-aware narration system
 * No external dependencies, works 100% of the time
 */

const { generateNarration } = require('./god-narrator-enhanced');

// ──────────────────────────────────────────────────────────────────
// EXCITEMENT TRACKING SYSTEM
// ──────────────────────────────────────────────────────────────────

const battleExcitement = new Map(); // battleId → excitementLevel

function initExcitement(battleId) {
  battleExcitement.set(battleId, {
    level: 5, // Start neutral (0-10 scale)
    lastActionType: null,
    consecutiveDefends: 0,
    critCount: 0,
    statusEffectCount: 0
  });
}

function updateExcitement(battleId, eventType, context = {}) {
  const excitement = battleExcitement.get(battleId);
  if (!excitement) return 5;
  
  switch (eventType) {
    case 'low_hp':
      if (context.hpPercent < 0.3) {
        excitement.level = Math.min(10, excitement.level + 3);
      }
      break;
    case 'crit':
      excitement.level = Math.min(10, excitement.level + 2);
      excitement.critCount++;
      excitement.consecutiveDefends = 0;
      break;
    case 'status_effect':
      excitement.level = Math.min(10, excitement.level + 1);
      excitement.statusEffectCount++;
      excitement.consecutiveDefends = 0;
      break;
    case 'attack':
      excitement.consecutiveDefends = 0;
      break;
    case 'defend':
      excitement.consecutiveDefends++;
      if (excitement.consecutiveDefends >= 3) {
        excitement.level = Math.max(0, excitement.level - 1);
      }
      break;
    case 'special':
      excitement.level = Math.min(10, excitement.level + 2);
      excitement.consecutiveDefends = 0;
      break;
    case 'victory':
      if (context.hpPercent < 0.2) {
        excitement.level = 10;
      }
      break;
  }
  
  excitement.lastActionType = eventType;
  return excitement.level;
}

function getExcitement(battleId) {
  const excitement = battleExcitement.get(battleId);
  return excitement ? excitement.level : 5;
}

function clearExcitement(battleId) {
  battleExcitement.delete(battleId);
}

// ──────────────────────────────────────────────────────────────────
// MAIN NARRATION FUNCTION
// ──────────────────────────────────────────────────────────────────

async function getNarration(
  attackerOrActionData,
  defenderOrActionType,
  abilityOrBattleId,
  damage,
  result,
  actionType,
  battleContext = {}
) {
  // Support both old and new API formats
  // OLD: getNarration(actionData, actionType, battleId)
  // NEW: getNarration(attacker, defender, ability, damage, result, actionType, battleContext)
  
  let attacker, defender, ability, battleId;
  
  if (typeof attackerOrActionData === 'object' && attackerOrActionData.attacker) {
    // Old format: { attacker, defender, ability, damage, result, statusMessages }
    attacker = attackerOrActionData.attacker;
    defender = attackerOrActionData.defender;
    ability = attackerOrActionData.ability;
    damage = attackerOrActionData.damage;
    result = attackerOrActionData.result || '';
    actionType = defenderOrActionType; // Second param is actionType
    battleId = abilityOrBattleId; // Third param is battleId
    
    // Construct battle context from available data
    battleContext = {
      battleId,
      attackerHp: attacker.hp,
      defenderHp: defender.hp,
      attackerMaxHp: attacker.maxHp,
      defenderMaxHp: defender.maxHp,
      turn: 1 // Default
    };
  } else {
    // New format: separate parameters
    attacker = attackerOrActionData;
    defender = defenderOrActionType;
    ability = abilityOrBattleId;
    // damage, result, actionType, battleContext already set
    battleId = battleContext.battleId;
  }
  
  const {
    attackerHp,
    defenderHp,
    attackerMaxHp,
    defenderMaxHp,
    isCrit = false,
    statusEffect = null,
    turn = 1
  } = battleContext;

  // Update excitement based on event
  const excitement = updateExcitement(battleId, actionType, {
    hpPercent: defenderHp / defenderMaxHp,
    isCrit,
    statusEffect
  });

  console.log(`🎭 Narrating ${actionType} (excitement: ${excitement}/10)...`);

  // Generate narration using enhanced system
  const narration = generateNarration(
    attacker,
    defender,
    ability,
    damage,
    result,
    actionType,
    {
      attackerHp,
      defenderHp,
      attackerMaxHp,
      defenderMaxHp,
      isCrit,
      statusEffect,
      turn,
      excitement
    }
  );

  console.log(`✨ Narration: "${narration}"`);

  return narration;
}

module.exports = {
  getNarration,
  initExcitement,
  updateExcitement,
  getExcitement,
  clearExcitement
};
