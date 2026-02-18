/**
 * Battle Engine - Status Effects System
 * Handles damage over time, debuffs, and combat mechanics
 */

// ────────────────────────────────────────────────────────────────────
// STATUS EFFECT DEFINITIONS
// ────────────────────────────────────────────────────────────────────

const STATUS_EFFECTS = {
  BURN: {
    type: 'burn',
    icon: '🔥',
    name: 'Burn',
    damagePercent: 0.10,  // 10% max HP per turn
    duration: 3,
    stackable: false,
    description: 'Deals 10% max HP damage per turn for 3 turns'
  },
  
  FREEZE: {
    type: 'freeze',
    icon: '❄️',
    name: 'Freeze',
    duration: 1,
    defReduction: 0.5,  // 50% DEF reduction
    skipTurn: true,
    stackable: false,
    description: 'Skip next turn, 50% DEF reduction'
  },
  
  POISON: {
    type: 'poison',
    icon: '☠️',
    name: 'Poison',
    damagePercent: 0.05,  // 5% HP per turn per stack
    duration: 3,
    maxStacks: 3,
    stackable: true,
    description: 'Deals 5% HP per turn, stacks up to 3x'
  },
  
  STUN: {
    type: 'stun',
    icon: '⚡',
    name: 'Stun',
    duration: 1,
    skipTurn: true,
    stackable: false,
    description: 'Miss next turn'
  },
  
  CONFUSION: {
    type: 'confusion',
    icon: '😵',
    name: 'Confusion',
    duration: 2,
    selfHitChance: 0.5,  // 50% chance to hit self
    stackable: false,
    description: '50% chance to hit self for 2 turns'
  },
  
  BLEED: {
    type: 'bleed',
    icon: '🩸',
    name: 'Bleed',
    duration: 3,
    progressive: true,  // Damage increases each turn
    damageProgression: [0.05, 0.10, 0.15],  // 5%, 10%, 15%
    stackable: false,
    description: 'Progressive damage: 5%, 10%, 15% over 3 turns'
  }
};

// ────────────────────────────────────────────────────────────────────
// FIGHTER STATE MANAGEMENT
// ────────────────────────────────────────────────────────────────────

/**
 * Initialize fighter with status effects array
 */
function initializeFighter(agent) {
  return {
    ...agent,
    hp: agent.maxHp,
    statusEffects: [],
    mood: 'Ready for battle',
    specialCooldown: 0  // Cooldown for special abilities
  };
}

/**
 * Apply status effect to fighter
 */
function applyStatusEffect(fighter, effectType, applier = null) {
  const effectDef = STATUS_EFFECTS[effectType.toUpperCase()];
  
  if (!effectDef) {
    console.error(`Unknown status effect: ${effectType}`);
    return { applied: false, message: 'Unknown effect' };
  }
  
  // Check if effect already exists
  const existingEffect = fighter.statusEffects.find(e => e.type === effectDef.type);
  
  // Handle non-stackable effects
  if (existingEffect && !effectDef.stackable) {
    return { 
      applied: false, 
      message: `${fighter.name} is already ${effectDef.name}ed!`,
      resisted: true
    };
  }
  
  // Handle stackable effects (Poison)
  if (existingEffect && effectDef.stackable) {
    if (existingEffect.stacks < effectDef.maxStacks) {
      existingEffect.stacks++;
      existingEffect.turnsRemaining = effectDef.duration; // Refresh duration
      return {
        applied: true,
        stacked: true,
        stacks: existingEffect.stacks,
        message: `${fighter.name}'s ${effectDef.name} intensifies! (Stack ${existingEffect.stacks})`
      };
    } else {
      return {
        applied: false,
        message: `${fighter.name}'s ${effectDef.name} is at maximum stacks`,
        maxStacks: true
      };
    }
  }
  
  // Apply new effect
  const newEffect = {
    type: effectDef.type,
    icon: effectDef.icon,
    name: effectDef.name,
    turnsRemaining: effectDef.duration,
    stacks: effectDef.stackable ? 1 : 0,
    appliedBy: applier,
    turnApplied: 0
  };
  
  fighter.statusEffects.push(newEffect);
  
  return {
    applied: true,
    message: `${fighter.name} is ${effectDef.name}ed!`,
    effect: newEffect
  };
}

/**
 * Process all status effects at the start of turn
 * Returns damage dealt and any special conditions
 */
function processStatusEffects(fighter) {
  const results = {
    totalDamage: 0,
    skipTurn: false,
    confusionActive: false,
    defModifier: 1.0,
    messages: [],
    expiredEffects: []
  };
  
  if (!fighter.statusEffects || fighter.statusEffects.length === 0) {
    return results;
  }
  
  fighter.statusEffects.forEach(effect => {
    const effectDef = STATUS_EFFECTS[effect.type.toUpperCase()];
    if (!effectDef) return;
    
    switch (effect.type) {
      case 'burn':
        const burnDamage = Math.floor(fighter.maxHp * effectDef.damagePercent);
        fighter.hp = Math.max(0, fighter.hp - burnDamage);
        results.totalDamage += burnDamage;
        results.messages.push(`${effect.icon} Burn: ${burnDamage} damage`);
        break;
        
      case 'freeze':
        results.skipTurn = true;
        results.defModifier *= (1 - effectDef.defReduction);
        results.messages.push(`${effect.icon} Frozen: Turn skipped, DEF reduced`);
        break;
        
      case 'poison':
        const poisonDamage = Math.floor(fighter.hp * effectDef.damagePercent * effect.stacks);
        fighter.hp = Math.max(0, fighter.hp - poisonDamage);
        results.totalDamage += poisonDamage;
        results.messages.push(`${effect.icon} Poison x${effect.stacks}: ${poisonDamage} damage`);
        break;
        
      case 'stun':
        results.skipTurn = true;
        results.messages.push(`${effect.icon} Stunned: Turn skipped`);
        break;
        
      case 'confusion':
        results.confusionActive = true;
        results.messages.push(`${effect.icon} Confused: May hit self!`);
        break;
        
      case 'bleed':
        const turnIndex = effectDef.duration - effect.turnsRemaining;
        const bleedPercent = effectDef.damageProgression[turnIndex] || 0.05;
        const bleedDamage = Math.floor(fighter.maxHp * bleedPercent);
        fighter.hp = Math.max(0, fighter.hp - bleedDamage);
        results.totalDamage += bleedDamage;
        results.messages.push(`${effect.icon} Bleeding: ${bleedDamage} damage (${Math.floor(bleedPercent * 100)}%)`);
        break;
    }
    
    // Decrement duration
    effect.turnsRemaining--;
    
    // Mark expired effects
    if (effect.turnsRemaining <= 0) {
      results.expiredEffects.push(effect);
    }
  });
  
  // Remove expired effects
  fighter.statusEffects = fighter.statusEffects.filter(e => e.turnsRemaining > 0);
  
  return results;
}

/**
 * Check if confusion causes self-hit
 */
function checkConfusion(fighter) {
  const confusionEffect = fighter.statusEffects.find(e => e.type === 'confusion');
  if (!confusionEffect) return false;
  
  const effectDef = STATUS_EFFECTS.CONFUSION;
  return Math.random() < effectDef.selfHitChance;
}

/**
 * Calculate self-damage from confusion
 */
function calculateSelfDamage(fighter) {
  // Use full attack vs own defense
  const baseDamage = fighter.attack - (fighter.defense * 0.3);
  const variance = Math.random() * 0.3 + 0.85; // 85-115%
  return Math.floor(baseDamage * variance);
}

/**
 * Get defense modifier from active status effects
 */
function getDefenseModifier(fighter) {
  let modifier = 1.0;
  
  fighter.statusEffects.forEach(effect => {
    if (effect.type === 'freeze') {
      const effectDef = STATUS_EFFECTS.FREEZE;
      modifier *= (1 - effectDef.defReduction);
    }
  });
  
  return modifier;
}

/**
 * Get all active status icons for display
 */
function getActiveStatusIcons(fighter) {
  return fighter.statusEffects.map(effect => ({
    type: effect.type,
    icon: effect.icon,
    name: effect.name,
    turnsRemaining: effect.turnsRemaining,
    stacks: effect.stacks || 0
  }));
}

/**
 * Clear all status effects (for testing or special abilities)
 */
function clearStatusEffects(fighter) {
  const clearedCount = fighter.statusEffects.length;
  fighter.statusEffects = [];
  return clearedCount;
}

/**
 * Get random status effect for abilities
 */
function getRandomStatusEffect() {
  const effects = Object.keys(STATUS_EFFECTS);
  const randomIndex = Math.floor(Math.random() * effects.length);
  return effects[randomIndex];
}

// ────────────────────────────────────────────────────────────────────
// EXPORTS
// ────────────────────────────────────────────────────────────────────

module.exports = {
  STATUS_EFFECTS,
  initializeFighter,
  applyStatusEffect,
  processStatusEffects,
  checkConfusion,
  calculateSelfDamage,
  getDefenseModifier,
  getActiveStatusIcons,
  clearStatusEffects,
  getRandomStatusEffect
};
