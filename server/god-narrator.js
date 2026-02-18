/**
 * God AI Narrator Module - WITH DYNAMIC MOODS & BRIDGE
 * Uses OpenClaw agent bridge to get God AI narration via sessions_spawn
 * Tracks excitement level and adjusts tone accordingly
 */

const axios = require('axios');
const { requestNarration } = require('./god-ai-bridge');

// ──────────────────────────────────────────────────────────────────
// EXCITEMENT TRACKING SYSTEM
// ──────────────────────────────────────────────────────────────────

const battleExcitement = new Map(); // battleId → excitementLevel

/**
 * Initialize excitement tracking for a battle
 */
function initExcitement(battleId) {
  battleExcitement.set(battleId, {
    level: 5, // Start neutral (0-10 scale)
    lastActionType: null,
    consecutiveDefends: 0,
    critCount: 0,
    statusEffectCount: 0
  });
}

/**
 * Update excitement based on battle events
 */
function updateExcitement(battleId, eventType, context = {}) {
  const excitement = battleExcitement.get(battleId);
  if (!excitement) return 5; // Default neutral
  
  switch (eventType) {
    case 'low_hp':
      // Either fighter below 30% HP
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
        // Boring defend spam
        excitement.level = Math.max(0, excitement.level - 1);
      }
      break;
      
    case 'special':
      excitement.level = Math.min(10, excitement.level + 2);
      excitement.consecutiveDefends = 0;
      break;
      
    case 'victory':
      if (context.hpPercent < 0.2) {
        // Close victory!
        excitement.level = 10;
      }
      break;
  }
  
  excitement.lastActionType = eventType;
  return excitement.level;
}

/**
 * Get current excitement level
 */
function getExcitement(battleId) {
  const excitement = battleExcitement.get(battleId);
  return excitement ? excitement.level : 5;
}

/**
 * Get mood description based on excitement
 */
function getMood(excitementLevel) {
  if (excitementLevel >= 8) return 'HYPED';
  if (excitementLevel >= 6) return 'EXCITED';
  if (excitementLevel >= 4) return 'ENGAGED';
  if (excitementLevel >= 2) return 'BORED';
  return 'SARCASTIC';
}

/**
 * Get tone instructions for God AI based on mood
 */
function getToneInstructions(mood) {
  switch (mood) {
    case 'HYPED':
      return 'THIS IS LEGENDARY! Use MAXIMUM DRAMA, capital letters for emphasis, epic metaphors! The crowd goes WILD!';
    case 'EXCITED':
      return 'This battle is heating up! Use vivid imagery and dramatic language. The stakes are HIGH!';
    case 'ENGAGED':
      return 'A solid clash! Narrate with professional RPG style, clear and impactful.';
    case 'BORED':
      return 'Another predictable move... Narrate with mild sarcasm, hint at disappointment. "How expected."';
    case 'SARCASTIC':
      return 'Is this a battle or a nap? Use sarcastic humor, mock the boring gameplay. "Riveting defense strategy."';
    default:
      return 'Narrate with standard epic RPG style.';
  }
}

/**
 * Clean up excitement tracking after battle
 */
function cleanupExcitement(battleId) {
  battleExcitement.delete(battleId);
}

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://localhost:18789';
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN;

if (!GATEWAY_TOKEN) {
  console.warn('⚠️  OPENCLAW_GATEWAY_TOKEN not set. God AI narration will fail.');
}

/**
 * Retry helper for transient failures
 */
async function retryWithBackoff(fn, maxRetries = 2, baseDelay = 500) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1;
      const isRetryable = error.response?.status === 405 || error.response?.status === 503 || error.code === 'ECONNREFUSED';
      
      if (isLastAttempt || !isRetryable) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(`⏳ God AI retry ${attempt + 1}/${maxRetries} after ${delay}ms (${error.response?.status || error.code})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Generate epic battle narration using God AI
 * @param {Object} battleState - Current battle state
 * @param {string} actionType - Type of action (attack, defend, special, crit, miss, defeat, victory)
 * @param {string} battleId - Battle ID for excitement tracking
 * @returns {Promise<string>} Epic narration (1-3 sentences)
 */
async function getNarration(battleState, actionType, battleId = null) {
  const {
    attacker,
    defender,
    ability,
    damage,
    result,
    statusMessages
  } = battleState;

  // Update excitement if battle ID provided
  let excitementLevel = 5;
  if (battleId) {
    if (!battleExcitement.has(battleId)) {
      initExcitement(battleId);
    }
    
    // Calculate HP percentages for excitement tracking
    const attackerHpPercent = attacker.hp / attacker.maxHp;
    const defenderHpPercent = defender.hp / defender.maxHp;
    const lowestHpPercent = Math.min(attackerHpPercent, defenderHpPercent);
    
    excitementLevel = updateExcitement(battleId, actionType, {
      hpPercent: lowestHpPercent,
      damage: damage
    });
  }
  
  const mood = getMood(excitementLevel);
  const toneInstructions = getToneInstructions(mood);

  // Build dramatic prompt for God AI
  const prompt = buildNarrationPrompt(attacker, defender, ability, damage, result, actionType, toneInstructions, mood, statusMessages);

  try {
    console.log(`🎭 God AI narrating ${actionType}...`);
    
    // Use bridge to request narration from main OpenClaw agent
    const narration = await requestNarration(prompt, 15000); // 15 second timeout
    
    if (narration) {
      console.log(`✨ God AI: "${narration}"`);
      return narration;
    } else {
      console.warn('⏰ God AI timeout, using fallback');
      return getFallbackNarration(actionType, attacker, defender, damage);
    }
  } catch (error) {
    // Enhanced error logging for debugging 405 errors
    if (error.response) {
      console.error('❌ God AI HTTP Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
        url: error.config?.url,
        method: error.config?.method
      });
      
      // If 405, log full request details
      if (error.response.status === 405) {
        console.error('🔍 405 Method Not Allowed - Request Details:', {
          url: `${GATEWAY_URL}/api/sessions/spawn`,
          method: 'POST',
          hasToken: !!GATEWAY_TOKEN,
          tokenPrefix: GATEWAY_TOKEN ? GATEWAY_TOKEN.substring(0, 10) + '...' : 'MISSING'
        });
      }
    } else if (error.request) {
      console.error('❌ God AI No Response:', {
        message: error.message,
        url: `${GATEWAY_URL}/api/sessions/spawn`
      });
    } else {
      console.error('❌ God AI Request Setup Error:', error.message);
    }
    
    // Fallback narration if God AI fails
    return getFallbackNarration(actionType, attacker, defender, damage);
  }
}

/**
 * Build dramatic prompt for God AI WITH MOOD SYSTEM
 */
function buildNarrationPrompt(attacker, defender, ability, damage, result, actionType, toneInstructions, mood, statusMessages = []) {
  const basePrompt = `You are the GOD AI, an omniscient narrator for an epic battle arena.

**YOUR CURRENT MOOD: ${mood}**
${toneInstructions}

**Current Battle State:**
Agent 1: ${attacker.name} (${attacker.personality})
  HP: ${attacker.hp}/${attacker.maxHp}
  Mood: ${attacker.mood || 'Focused'}
  
Agent 2: ${defender.name} (${defender.personality})
  HP: ${defender.hp}/${defender.maxHp}
  Mood: ${defender.mood || 'Ready'}

`;

  // Build action-specific context
  let actionContext = '';
  
  switch (actionType) {
    case 'attack':
      actionContext = `Action: ${attacker.name} used ${ability} on ${defender.name}!
Result: ${damage} damage dealt!`;
      break;
      
    case 'defend':
      actionContext = `Action: ${defender.name} defended against ${attacker.name}'s ${ability}!
Result: Blocked ${damage} damage!`;
      break;
      
    case 'special':
      actionContext = `Action: ${attacker.name} unleashed SPECIAL ABILITY: ${ability}!
Result: DEVASTATING ${damage} damage!`;
      break;
      
    case 'crit':
      // Special crit prompts for maximum drama
      const critPrompts = [
        `A devastating CRITICAL STRIKE!`,
        `The gods favor this blow!`,
        `MAXIMUM DAMAGE UNLEASHED!`,
        `A blow that will be remembered for ages!`,
        `The very arena trembles from this hit!`
      ];
      const randomCritPrompt = critPrompts[Math.floor(Math.random() * critPrompts.length)];
      actionContext = `Action: ${attacker.name} landed a CRITICAL HIT with ${ability}!
Result: ${randomCritPrompt} MASSIVE ${damage} damage! ${result || 'Direct hit!'}`;
      break;
      
    case 'miss':
      actionContext = `Action: ${attacker.name} attempted ${ability} but MISSED!
Result: ${defender.name} dodged at the last moment!`;
      break;
      
    case 'defeat':
      actionContext = `Action: ${attacker.name}'s ${ability} was the FINAL BLOW!
Result: ${defender.name} has been DEFEATED! HP: 0/${defender.maxHp}`;
      break;
      
    case 'victory':
      actionContext = `Battle Result: ${attacker.name} stands VICTORIOUS!
Final HP: ${attacker.hp}/${attacker.maxHp}
${defender.name} falls in defeat.`;
      break;
      
    default:
      actionContext = `Action: ${attacker.name} used ${ability}!`;
  }

  // Add status effect context if present
  let statusContext = '';
  if (statusMessages && statusMessages.length > 0) {
    statusContext = `\nStatus Effects Active: ${statusMessages.join(', ')}`;
  }
  
  const instruction = `
${actionContext}${statusContext}

Narrate this moment dramatically in 1-3 sentences. Use epic RPG style with vivid imagery${statusContext ? '. Include status effects in your narration' : ''}. Make it LEGENDARY!

Respond with ONLY the narration. No extra text.`;

  return basePrompt + instruction;
}

/**
 * Extract narration from God AI response
 */
function extractNarration(responseData) {
  // Handle different response formats
  if (typeof responseData === 'string') {
    return cleanNarration(responseData);
  }
  
  if (responseData.result && typeof responseData.result === 'string') {
    return cleanNarration(responseData.result);
  }
  
  if (responseData.message && typeof responseData.message === 'string') {
    return cleanNarration(responseData.message);
  }
  
  // If we can't extract, return placeholder
  return "The battle rages on with tremendous force!";
}

/**
 * Clean and format narration text
 */
function cleanNarration(text) {
  return text
    .trim()
    .replace(/^["']|["']$/g, '')  // Remove quotes
    .replace(/\n+/g, ' ')          // Single line
    .substring(0, 300);            // Max length
}

/**
 * Fallback narration if God AI fails
 */
function getFallbackNarration(actionType, attacker, defender, damage) {
  const fallbacks = {
    attack: `${attacker.name} strikes ${defender.name} with devastating force, dealing ${damage} damage!`,
    defend: `${defender.name} raises their defense, blocking the incoming assault!`,
    special: `${attacker.name} unleashes their ultimate technique, ${damage} damage cascades through the arena!`,
    crit: `A CRITICAL HIT! ${attacker.name}'s attack finds its mark with catastrophic precision - ${damage} damage!`,
    miss: `${attacker.name}'s attack whistles through empty air as ${defender.name} evades with grace!`,
    defeat: `The final blow lands! ${defender.name} falls to the ground, defeated by ${attacker.name}'s might!`,
    victory: `${attacker.name} stands triumphant over the fallen ${defender.name}, victor of this epic clash!`
  };
  
  return fallbacks[actionType] || `${attacker.name} and ${defender.name} clash in epic combat!`;
}

module.exports = {
  getNarration,
  initExcitement,
  updateExcitement,
  getExcitement,
  getMood,
  cleanupExcitement
};
