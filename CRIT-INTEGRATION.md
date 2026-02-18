# Critical Hits & Special Cooldowns - Integration Guide

## ✅ COMPLETED FEATURES

### 1. **Critical Hit System** (Backend)
- ✅ Crit chance formula: `5% + (LUCK / 10)`
  - Example: LUCK 20 = 5% + 2% = 7% crit chance
- ✅ Crit damage: **2x multiplier**
- ✅ God AI special narration for crits
- ✅ Excitement tracking system for dynamic narration

### 2. **Special Cooldown System** (Backend)
- ✅ 3-turn cooldown for special abilities
- ✅ Automatic cooldown decrement each turn
- ✅ API error when attempting to use special on cooldown
- ✅ Cooldown state included in battle response

### 3. **Visual Effects** (Frontend Ready)
- ✅ `showCriticalHit()` function in `animator.js`
- ✅ Screen shake animation
- ✅ "CRITICAL!" text overlay
- ✅ Particle burst (✨ sparkles)
- ✅ Slow-mo effect (500ms)
- ✅ All CSS animations defined in `styles.css`

### 4. **Cooldown UI** (Frontend Ready)
- ✅ `updateSpecialCooldown()` function in `animator.js`
- ✅ Cooldown number overlay on button
- ✅ Pulsing effect when ready
- ✅ Grayscale/disabled state during cooldown
- ✅ All CSS styles defined in `styles.css`

---

## 🔌 INTEGRATION NEEDED

The backend returns `isCrit: true/false` in the action response. The frontend needs to call `showCriticalHit()` when this flag is true.

### API Response Format

```javascript
{
  battle: {
    agent1: { ..., specialCooldown: 2 },
    agent2: { ..., specialCooldown: 0 }
  },
  action: {
    attacker: "Ruby Loopster",
    defender: "Bash Quickfingers",
    ability: "API Strike",
    damage: 45,
    actionType: "crit",        // "attack", "crit", "miss", "defeat"
    isCrit: true,              // ⚡ NEW FLAG for visual effects
    statusMessages: [...]
  },
  narration: "..."
}
```

### Where to Hook Visual Effects

#### Example Integration (Your Battle Handler):

```javascript
async function executeBattleAction(battleId, abilityIndex) {
  const response = await fetch('/api/battle/action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ battleId, abilityIndex })
  });
  
  const data = await response.json();
  
  // ═══════════════════════════════════════════════════════════════
  // CRITICAL HIT VISUAL EFFECTS
  // ═══════════════════════════════════════════════════════════════
  
  if (data.action.isCrit) {
    // Determine which fighter got hit
    const defenderFighterId = data.action.defender === data.battle.agent1.name 
      ? 'agent1' 
      : 'agent2';
    
    // Trigger all crit effects at once
    showCriticalHit(defenderFighterId);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // COOLDOWN UI UPDATE
  // ═══════════════════════════════════════════════════════════════
  
  // Update agent 1 special button
  const agent1SpecialBtn = document.querySelector('.action-btn.special-btn[data-agent="1"]');
  updateSpecialCooldown(agent1SpecialBtn, data.battle.agent1.specialCooldown);
  
  // Update agent 2 special button
  const agent2SpecialBtn = document.querySelector('.action-btn.special-btn[data-agent="2"]');
  updateSpecialCooldown(agent2SpecialBtn, data.battle.agent2.specialCooldown);
  
  // ═══════════════════════════════════════════════════════════════
  // DAMAGE NUMBER (already exists, enhance for crits)
  // ═══════════════════════════════════════════════════════════════
  
  if (data.action.damage > 0) {
    const damageType = data.action.isCrit ? 'crit' : 'normal';
    showDamageNumber(defenderFighterId, data.action.damage, damageType);
  }
  
  // ... rest of your battle logic (HP updates, logs, etc.)
}
```

---

## 🧪 TESTING

Run the test suite to verify everything works:

```bash
cd /home/vboxuser/.openclaw/workspace/ai-battle-arena
node test-crit-cooldown.js
```

### Expected Results:
- ✅ Crit rate ~7% for LUCK 20 agents
- ✅ Crit damage is 2x normal damage
- ✅ Special cooldown blocks usage for 3 turns
- ✅ `isCrit` flag present in all responses

---

## 📋 CHECKLIST

### Backend (Complete ✅)
- [x] Crit formula: 5% + (LUCK / 10)
- [x] 2x damage multiplier on crit
- [x] Special cooldown (3 turns)
- [x] BattleId passed to god-narrator for excitement tracking
- [x] `isCrit` flag in API response

### Frontend (Needs Integration)
- [ ] Call `showCriticalHit(fighterId)` when `action.isCrit === true`
- [ ] Call `updateSpecialCooldown(button, cooldown)` after each action
- [ ] Display cooldown number on special ability buttons
- [ ] Show pulsing effect when special is ready

### Visual Effects (Ready to Use)
- [x] Screen shake animation
- [x] "CRITICAL!" text overlay
- [x] Particle burst (20 sparkles)
- [x] 500ms slow-mo effect
- [x] Cooldown number overlay
- [x] Pulsing ready state

---

## 🎨 CSS Classes Reference

### Crit Effects
- `.screen-shake` - Shake animation on arena container
- `.critical-text` - "CRITICAL!" overlay text
- `.crit-particle` - Individual sparkle particles

### Cooldown UI
- `.special-button.on-cooldown` - Grayscale disabled state
- `.special-button.ready` - Pulsing green glow
- `.cooldown-number` - Large red number overlay

---

## 🔥 What Happens on a Crit

1. **Backend calculates**: `if (rand < 0.05 + (attacker.luck / 1000))`
2. **Backend applies**: `damage = baseDamage * 2.0`
3. **Backend sets**: `actionType: "crit"`, `isCrit: true`
4. **God AI narrates**: Uses special crit prompts with HYPED mood
5. **Frontend receives**: `isCrit: true` in response
6. **Frontend triggers** (YOU NEED TO ADD THIS):
   - `showCriticalHit('agent1' or 'agent2')`
   - Screen shakes for 300ms
   - "CRITICAL!" text appears for 1s
   - 20 sparkles burst outward
   - Slow-mo effect for 500ms

---

## 📝 Notes

- **God AI excitement tracking**: Now works! BattleId is passed to all `getNarration()` calls
- **Special cooldown**: Automatically decrements for BOTH fighters at end of each turn
- **Crit formula fix**: Changed from `luck/100` to `luck/1000` to match the 5% + (LUCK/10) spec
- **Visual functions**: All ready in `animator.js` - just need to be called!

---

## 🚀 Quick Start Integration

If you're updating an existing battle handler, just add these 3 lines after receiving the API response:

```javascript
// 1. Trigger crit effects
if (data.action.isCrit) {
  showCriticalHit(data.action.defender === data.battle.agent1.name ? 'agent1' : 'agent2');
}

// 2. Update cooldown UI
updateSpecialCooldown(agent1SpecialButton, data.battle.agent1.specialCooldown);
updateSpecialCooldown(agent2SpecialButton, data.battle.agent2.specialCooldown);
```

That's it! The rest is already implemented. 🎉
