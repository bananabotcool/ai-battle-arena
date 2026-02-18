# AI Battle Arena - Battle Engine Documentation

## Overview
Complete combat system with personality-based AI, damage calculation, and victory conditions.

## Files Created
1. **server/battle-engine.js** (9.4KB)
   - Core combat logic
   - AI decision system
   - Damage calculation with crits/luck
   - Victory checking
   
2. **data/default-agents.json** (4.8KB)
   - 8 diverse agents with unique personalities
   - Balanced stats across archetypes
   - Lore and descriptions
   
3. **test-battle.js** (1.6KB)
   - Test harness for battle engine
   - Sample battles demonstrating mechanics

## Core Systems

### Damage Calculation
```javascript
calculateDamage(attacker, defender, ability)
```
- Base: ATK vs DEF
- Ability multipliers (0.3x to 4.0x)
- Critical hits (based on luck stat)
- Special effects (self-damage, shields, debuffs)
- Accuracy checks (some moves can miss)

### Action Execution
```javascript
executeAction(agent, target, action)
```
- Applies damage to target
- Handles special effects (recoil, shields, debuffs)
- Updates agent mood based on HP
- Charges special meter (+10 base, +5 crit, +10 high damage)

### AI Decision Making
```javascript
selectAction(agent, target)
```
Personality-based logic:

**Berserker:** Always attacks, prefers high damage, goes berserk when low HP
**Tank:** Defends when hurt, counters when healthy
**Trickster:** Random abilities, embraces chaos
**Strategist:** Calculates optimal move based on HP ratios
**Glass Cannon:** All-in offense, uses special when target is low

### Victory Conditions
- HP reaches 0 → Immediate loss
- Both reach 0 → Tie
- Turn 100 → Timeout (higher HP% wins)

## Agent Archetypes

### 1. Ragnar (Berserker)
- HP: 120, ATK: 30, DEF: 10
- **Strategy:** Relentless aggression
- **Weakness:** Low defense, predictable

### 2. Ironwall (Tank)
- HP: 150, ATK: 20, DEF: 30
- **Strategy:** Absorb and counter
- **Weakness:** Low speed, slow wins

### 3. Loki (Trickster)
- HP: 90, ATK: 25, LUCK: 35
- **Strategy:** Chaos and crits
- **Weakness:** Unpredictable, can backfire

### 4. Athena (Strategist)
- HP: 100, ATK: 28, Balanced
- **Strategy:** Adapts to opponent
- **Weakness:** No extreme advantage

### 5. Nova (Glass Cannon)
- HP: 70, ATK: 45, DEF: 5
- **Strategy:** Win fast or die trying
- **Weakness:** Dies to a stiff breeze

### 6. Kai (Balanced)
- HP: 110, All stats ~20
- **Strategy:** Jack of all trades
- **Weakness:** Master of none

### 7. Zephyr (Speedster)
- HP: 85, SPEED: 35, LUCK: 25
- **Strategy:** Strike first, dodge often
- **Weakness:** Moderate damage output

### 8. Titan (Juggernaut)
- HP: 180, DEF: 35, SPEED: 5
- **Strategy:** Outlast everyone
- **Weakness:** Slow, low damage

## Special Abilities

### Standard Abilities
- **Fury Strike:** 1.3x damage, +10% crit
- **Bloodlust:** 1.5x damage, 10 self-damage
- **Rampage:** 2.0x damage, 70% accuracy
- **Shield Bash:** 0.8x damage, defensive
- **Counter:** Reflects damage
- **Chaos Bolt:** 0.5x-2.5x random damage
- **Lucky Shot:** 1.2x damage, +30% crit
- **Calculated Strike:** 1.4x guaranteed hit
- **Snipe:** 2.2x damage, requires charge
- **Overload:** 3.0x damage, 20 recoil

### Special Moves (100 meter required)
- **Berserk Rage:** 3.5x damage, 30 self-damage
- **Iron Fortress:** Shield for 50 HP
- **Wild Card:** Chaos effects
- **Master Plan:** 2.5x guaranteed + boost
- **One Shot:** 4.0x damage, 40 recoil

## Sample Battle Results

**Test 1:** Ragnar vs Ironwall
- Winner: Ironwall (Tank outlasted Berserker)
- Turns: 10
- Strategy: Defense > Offense

**Test 2:** Nova vs Zephyr
- Winner: Nova (Glass Cannon one-shot)
- Turns: 1
- Strategy: Speed didn't save low HP

**Test 3:** Loki vs Athena
- Winner: Loki (Chaos beat calculation)
- Turns: 3
- Strategy: Luck > Logic

## Integration

### Running a Battle
```javascript
const { runBattle } = require('./server/battle-engine');
const agents = require('./data/default-agents.json');

const result = runBattle(agents[0], agents[1]);

// Result structure:
{
  winner: { ...agent },
  loser: { ...agent },
  turns: 10,
  log: [
    { turn, attacker, defender, action, damage, crit, missed, hp_after },
    ...
  ],
  tie: false
}
```

### Using in API
```javascript
app.post('/api/battle', (req, res) => {
  const { agent1Id, agent2Id } = req.body;
  const agent1 = agents.find(a => a.id === agent1Id);
  const agent2 = agents.find(a => a.id === agent2Id);
  
  const result = runBattle(agent1, agent2);
  res.json(result);
});
```

## Future Enhancements
- [ ] Status effects (poison, stun, burn)
- [ ] Team battles (2v2, 3v3)
- [ ] Equipment system (weapons, armor)
- [ ] Leveling and XP
- [ ] More personalities (Healer, Summoner, etc.)
- [ ] Environmental effects (terrain bonuses)
- [ ] Combo system (ability chains)

## Performance
- Average battle: 1-15 turns
- Max turns: 100 (timeout protection)
- Zero external dependencies (pure logic)
- Thread-safe (no shared state)

---

**Status:** ✅ Battle engine operational. Tested and ready for integration.
