/**
 * ENHANCED GOD AI NARRATOR - Context-Aware Fallback System
 * 
 * This module provides highly intelligent fallback narration that's
 * so good, users won't know it's not "real" AI. Uses battle context,
 * agent personalities, and action types to generate dynamic narration.
 */

/**
 * Generate context-aware dramatic narration
 */
function generateNarration(attacker, defender, ability, damage, result, actionType, context = {}) {
  const {
    attackerHp,
    defenderHp,
    attackerMaxHp,
    defenderMaxHp,
    isCrit = false,
    statusEffect = null,
    turn = 1,
    excitement = 5
  } = context;

  // Calculate HP percentages
  const attackerHpPercent = attackerHp / attackerMaxHp;
  const defenderHpPercent = defenderHp / defenderMaxHp;

  // Determine battle phase
  let phase = 'opening';
  if (turn > 10) phase = 'endgame';
  else if (turn > 5) phase = 'midgame';
  else if (defenderHpPercent < 0.2 || attackerHpPercent < 0.2) phase = 'critical';

  // Build narration based on context
  let narration = '';

  switch (actionType) {
    case 'opening':
      narration = generateOpening(attacker, defender, excitement);
      break;
    
    case 'attack':
      narration = generateAttackNarration(
        attacker, defender, ability, damage, isCrit,
        defenderHpPercent, phase, excitement
      );
      break;
    
    case 'crit':
      narration = generateCritNarration(
        attacker, defender, ability, damage,
        defenderHpPercent, excitement
      );
      break;
    
    case 'special':
      narration = generateSpecialNarration(
        attacker, defender, ability, damage,
        defenderHpPercent, excitement
      );
      break;
    
    case 'defend':
      narration = generateDefendNarration(
        attacker, defender, phase, excitement
      );
      break;
    
    case 'status':
      narration = generateStatusNarration(
        attacker, defender, statusEffect, excitement
      );
      break;
    
    case 'victory':
      narration = generateVictoryNarration(
        attacker, defender, attackerHpPercent, excitement
      );
      break;
    
    default:
      narration = `${attacker.name} faces ${defender.name} in the arena!`;
  }

  return narration;
}

// ────────────────────────────────────────────────────────────────────
// OPENING NARRATION
// ────────────────────────────────────────────────────────────────────

function generateOpening(attacker, defender, excitement) {
  const templates = [
    `The arena crackles with energy as ${attacker.name} and ${defender.name} face off! ${getPersonalityQuip(attacker)} vs ${getPersonalityQuip(defender)}!`,
    `${attacker.name} steps into the light, eyes locked on ${defender.name}. The crowd roars! This battle will be legendary!`,
    `Two warriors enter. Only one will stand victorious. ${attacker.name} versus ${defender.name} — let the chaos begin!`,
    `The ground trembles as ${attacker.name} challenges ${defender.name}! ${attacker.personality} meets ${defender.personality}!`,
    `Silence falls. Then—BAM! ${attacker.name} and ${defender.name} clash in an explosion of power!`
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

// ────────────────────────────────────────────────────────────────────
// ATTACK NARRATION
// ────────────────────────────────────────────────────────────────────

function generateAttackNarration(attacker, defender, ability, damage, isCrit, defenderHp, phase, excitement) {
  if (damage === 0) {
    return `${attacker.name}'s ${ability} crashes against ${defender.name}'s defenses—but deals no damage! The ${defender.personality} stands firm!`;
  }

  const intensity = excitement > 7 ? 'intense' : excitement > 4 ? 'fierce' : 'calculated';
  const damageDesc = damage > 50 ? 'devastating' : damage > 30 ? 'powerful' : damage > 15 ? 'solid' : 'glancing';

  if (defenderHp < 0.3) {
    // Low HP dramatic
    return `${attacker.name} strikes with ${ability}—${damageDesc} ${intensity} blow! ${defender.name} staggers, barely clinging to consciousness!`;
  } else if (phase === 'opening') {
    // Opening round
    return `${attacker.name} opens with ${ability}, landing a ${damageDesc} hit for ${damage} damage! ${defender.name} feels the power!`;
  } else {
    // Standard attack
    const verbs = ['unleashes', 'executes', 'delivers', 'hammers with', 'strikes using'];
    const verb = verbs[Math.floor(Math.random() * verbs.length)];
    return `${attacker.name} ${verb} ${ability}! ${damage} ${damageDesc} damage rocks ${defender.name}!`;
  }
}

// ────────────────────────────────────────────────────────────────────
// CRITICAL HIT NARRATION
// ────────────────────────────────────────────────────────────────────

function generateCritNarration(attacker, defender, ability, damage, defenderHp, excitement) {
  const templates = [
    `💥 CRITICAL HIT! ${attacker.name}'s ${ability} finds the PERFECT opening—${damage} DEVASTATING damage obliterates ${defender.name}!`,
    `⚡ The arena EXPLODES! ${attacker.name} lands a CRITICAL ${ability} for ${damage} damage! ${defender.name} reels from the impact!`,
    `🔥 CRITICAL STRIKE! ${attacker.name} channels pure destruction—${ability} hits for ${damage}! The crowd goes WILD!`,
    `💀 SAVAGE CRIT! ${attacker.name}'s ${ability} tears through defenses—${damage} damage! ${defender.name} barely stands!`,
    `✨ PERFECT EXECUTION! ${attacker.name} finds the fatal flaw—${ability} crits for ${damage}! Unstoppable!`
  ];

  let narration = templates[Math.floor(Math.random() * templates.length)];

  if (defenderHp < 0.2) {
    narration += ` ${defender.name} teeters on the edge of defeat!`;
  }

  return narration;
}

// ────────────────────────────────────────────────────────────────────
// SPECIAL ABILITY NARRATION
// ────────────────────────────────────────────────────────────────────

function generateSpecialNarration(attacker, defender, ability, damage, defenderHp, excitement) {
  const templates = [
    `✨ SPECIAL ABILITY! ${attacker.name} unleashes ${ability}—ultimate power incarnate! ${damage} MASSIVE damage!`,
    `🌟 ${attacker.name} channels their signature move: ${ability}! The arena shakes with ${damage} damage!`,
    `⚔️ ULTIMATE TECHNIQUE! ${attacker.name}'s ${ability} erupts in a storm of power—${damage} damage! Incredible!`,
    `🎆 ${ability}—the trump card! ${attacker.name} goes ALL OUT! ${defender.name} takes ${damage} CRUSHING damage!`,
    `💫 The legend awakens! ${attacker.name}'s ${ability} detonates for ${damage} damage! This is what makes them a champion!`
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

// ────────────────────────────────────────────────────────────────────
// DEFEND NARRATION
// ────────────────────────────────────────────────────────────────────

function generateDefendNarration(attacker, defender, phase, excitement) {
  const templates = [
    `${attacker.name} takes a defensive stance, studying ${defender.name}'s movements. Strategy over brute force!`,
    `${attacker.name} fortifies their position, ready to weather the storm. Smart play!`,
    `Defense! ${attacker.name} focuses on protection, reducing incoming damage. Tactical genius!`,
    `${attacker.name} hunkers down, guard raised high. Patience is a warrior's virtue!`
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

// ────────────────────────────────────────────────────────────────────
// STATUS EFFECT NARRATION
// ────────────────────────────────────────────────────────────────────

function generateStatusNarration(attacker, defender, statusEffect, excitement) {
  const statusMap = {
    burn: `🔥 ${defender.name} is BURNING! The flames sear their resolve!`,
    freeze: `❄️ ${defender.name} is FROZEN SOLID! Unable to move, they watch helplessly!`,
    poison: `☠️ ${defender.name} is POISONED! Toxins course through their veins!`,
    stun: `⚡ ${defender.name} is STUNNED! Dazed and confused, they can't act!`,
    confusion: `🌀 ${defender.name} is CONFUSED! Reality warps around them!`,
    bleed: `🩸 ${defender.name} is BLEEDING! Each moment drains their life force!`
  };

  return statusMap[statusEffect] || `${defender.name} suffers from ${statusEffect}!`;
}

// ────────────────────────────────────────────────────────────────────
// VICTORY NARRATION
// ────────────────────────────────────────────────────────────────────

function generateVictoryNarration(winner, loser, winnerHp, excitement) {
  if (winnerHp > 0.8) {
    // Dominant victory
    return `🏆 FLAWLESS VICTORY! ${winner.name} stands unscathed as ${loser.name} falls! Total domination!`;
  } else if (winnerHp < 0.2) {
    // Close victory
    return `⚔️ EPIC COMEBACK! ${winner.name} emerges victorious by the SLIMMEST margin! ${loser.name} fought valiantly but falls just short!`;
  } else {
    // Standard victory
    const templates = [
      `🎆 VICTORY! ${winner.name} claims triumph over ${loser.name}! The arena celebrates their champion!`,
      `👑 ${winner.name} WINS! ${loser.name} fought hard, but ${winner.name}'s power proved unstoppable!`,
      `✨ The battle concludes! ${winner.name} stands victorious as ${loser.name} falls to one knee. Well fought!`,
      `🥇 CHAMPION! ${winner.name} has conquered ${loser.name}! The crowd roars in approval!`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }
}

// ────────────────────────────────────────────────────────────────────
// PERSONALITY HELPERS
// ────────────────────────────────────────────────────────────────────

function getPersonalityQuip(agent) {
  const personalityQuips = {
    'Lightning-fast backend warrior': 'strikes like lightning',
    'Elegant route master': 'moves with precision',
    'Strategic commander': 'calculates every move',
    'Visual virtuoso': 'dazzles with style',
    'Strategic mastermind': 'thinks ten steps ahead',
    'Executive powerhouse': 'dominates with authority'
  };

  return personalityQuips[agent.personality] || 'enters the fray';
}

module.exports = {
  generateNarration,
  generateOpening,
  generateAttackNarration,
  generateCritNarration,
  generateSpecialNarration,
  generateDefendNarration,
  generateStatusNarration,
  generateVictoryNarration
};
