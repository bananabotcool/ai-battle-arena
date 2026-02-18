#!/usr/bin/env node
/**
 * Status Effects System Test Suite
 * Tests all status effects logic without requiring server
 */

const {
  STATUS_EFFECTS,
  initializeFighter,
  applyStatusEffect,
  processStatusEffects,
  checkConfusion,
  calculateSelfDamage,
  getDefenseModifier,
  getActiveStatusIcons,
  clearStatusEffects
} = require('./server/battle-engine');

console.log('🧪 Status Effects System - Test Suite\n');
console.log('═'.repeat(50));

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.error(`   Error: ${error.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// ────────────────────────────────────────────────────────────────────
// TEST SUITE
// ────────────────────────────────────────────────────────────────────

// Test 1: Fighter Initialization
test('Fighter initialization', () => {
  const agent = { id: 'test', name: 'Test', maxHp: 100, attack: 50, defense: 30 };
  const fighter = initializeFighter(agent);
  assert(fighter.hp === 100, 'HP should equal maxHp');
  assert(Array.isArray(fighter.statusEffects), 'Should have statusEffects array');
  assert(fighter.statusEffects.length === 0, 'Should start with no effects');
});

// Test 2: Apply Burn
test('Apply Burn effect', () => {
  const fighter = initializeFighter({ maxHp: 100, attack: 50, defense: 30, name: 'Test' });
  const result = applyStatusEffect(fighter, 'burn');
  assert(result.applied, 'Burn should be applied');
  assert(fighter.statusEffects.length === 1, 'Should have 1 effect');
  assert(fighter.statusEffects[0].type === 'burn', 'Effect should be burn');
});

// Test 3: Burn Damage
test('Burn damage calculation', () => {
  const fighter = initializeFighter({ maxHp: 120, attack: 50, defense: 30, name: 'Test' });
  applyStatusEffect(fighter, 'burn');
  const effects = processStatusEffects(fighter);
  const expectedDamage = Math.floor(120 * 0.10); // 12 damage
  assert(effects.totalDamage === expectedDamage, `Burn should deal ${expectedDamage} damage`);
});

// Test 4: Non-Stackable Effects
test('Non-stackable effects (Burn)', () => {
  const fighter = initializeFighter({ maxHp: 100, attack: 50, defense: 30, name: 'Test' });
  applyStatusEffect(fighter, 'burn');
  const result2 = applyStatusEffect(fighter, 'burn');
  assert(!result2.applied, 'Second burn should not apply');
  assert(result2.resisted, 'Should show as resisted');
  assert(fighter.statusEffects.length === 1, 'Should still have only 1 effect');
});

// Test 5: Poison Stacking
test('Poison stacking (up to 3x)', () => {
  const fighter = initializeFighter({ maxHp: 100, attack: 50, defense: 30, name: 'Test' });
  
  const r1 = applyStatusEffect(fighter, 'poison');
  assert(r1.applied && !r1.stacked, 'First poison should apply');
  
  const r2 = applyStatusEffect(fighter, 'poison');
  assert(r2.applied && r2.stacked, 'Second poison should stack');
  assert(r2.stacks === 2, 'Should have 2 stacks');
  
  const r3 = applyStatusEffect(fighter, 'poison');
  assert(r3.stacks === 3, 'Should have 3 stacks');
  
  const r4 = applyStatusEffect(fighter, 'poison');
  assert(!r4.applied && r4.maxStacks, 'Fourth poison should be rejected (max stacks)');
});

// Test 6: Freeze Turn Skip
test('Freeze causes turn skip', () => {
  const fighter = initializeFighter({ maxHp: 100, attack: 50, defense: 30, name: 'Test' });
  applyStatusEffect(fighter, 'freeze');
  const effects = processStatusEffects(fighter);
  assert(effects.skipTurn === true, 'Freeze should skip turn');
  assert(effects.defModifier === 0.5, 'Freeze should reduce DEF by 50%');
});

// Test 7: Stun Turn Skip
test('Stun causes turn skip', () => {
  const fighter = initializeFighter({ maxHp: 100, attack: 50, defense: 30, name: 'Test' });
  applyStatusEffect(fighter, 'stun');
  const effects = processStatusEffects(fighter);
  assert(effects.skipTurn === true, 'Stun should skip turn');
});

// Test 8: Confusion Check
test('Confusion check', () => {
  const fighter = initializeFighter({ maxHp: 100, attack: 50, defense: 30, name: 'Test' });
  applyStatusEffect(fighter, 'confusion');
  
  // Run multiple times since it's 50% chance
  let hitSelf = false;
  let hitEnemy = false;
  for (let i = 0; i < 20; i++) {
    if (checkConfusion(fighter)) hitSelf = true;
    else hitEnemy = true;
  }
  
  assert(hitSelf, 'Confusion should sometimes cause self-hit');
  assert(hitEnemy, 'Confusion should sometimes allow normal attack');
});

// Test 9: Bleed Progressive Damage
test('Bleed progressive damage', () => {
  const fighter = initializeFighter({ maxHp: 100, attack: 50, defense: 30, name: 'Test' });
  applyStatusEffect(fighter, 'bleed');
  
  // Turn 1: 5% damage
  const e1 = processStatusEffects(fighter);
  assert(e1.totalDamage === 5, 'Turn 1: 5% damage');
  
  // Turn 2: 10% damage
  const e2 = processStatusEffects(fighter);
  assert(e2.totalDamage === 10, 'Turn 2: 10% damage');
  
  // Turn 3: 15% damage
  const e3 = processStatusEffects(fighter);
  assert(e3.totalDamage === 15, 'Turn 3: 15% damage');
  
  // Turn 4: Effect should expire
  assert(fighter.statusEffects.length === 0, 'Bleed should expire after 3 turns');
});

// Test 10: Effect Expiration
test('Effect expiration', () => {
  const fighter = initializeFighter({ maxHp: 100, attack: 50, defense: 30, name: 'Test' });
  applyStatusEffect(fighter, 'burn'); // 3 turn duration
  
  processStatusEffects(fighter); // Turn 1
  assert(fighter.statusEffects.length === 1, 'Effect active after turn 1');
  
  processStatusEffects(fighter); // Turn 2
  assert(fighter.statusEffects.length === 1, 'Effect active after turn 2');
  
  processStatusEffects(fighter); // Turn 3
  assert(fighter.statusEffects.length === 0, 'Effect expired after turn 3');
});

// Test 11: Multiple Effects
test('Multiple effects simultaneously', () => {
  const fighter = initializeFighter({ maxHp: 100, attack: 50, defense: 30, name: 'Test' });
  
  applyStatusEffect(fighter, 'burn');
  applyStatusEffect(fighter, 'poison');
  applyStatusEffect(fighter, 'bleed');
  
  assert(fighter.statusEffects.length === 3, 'Should have 3 active effects');
  
  const effects = processStatusEffects(fighter);
  assert(effects.messages.length === 3, 'Should process all 3 effects');
  assert(effects.totalDamage > 0, 'Should deal combined damage');
});

// Test 12: Get Active Status Icons
test('Get active status icons', () => {
  const fighter = initializeFighter({ maxHp: 100, attack: 50, defense: 30, name: 'Test' });
  applyStatusEffect(fighter, 'burn');
  applyStatusEffect(fighter, 'poison');
  
  const icons = getActiveStatusIcons(fighter);
  assert(icons.length === 2, 'Should return 2 icons');
  assert(icons[0].icon === '🔥', 'First icon should be burn');
  assert(icons[1].icon === '☠️', 'Second icon should be poison');
});

// Test 13: Clear Status Effects
test('Clear all status effects', () => {
  const fighter = initializeFighter({ maxHp: 100, attack: 50, defense: 30, name: 'Test' });
  applyStatusEffect(fighter, 'burn');
  applyStatusEffect(fighter, 'poison');
  applyStatusEffect(fighter, 'freeze');
  
  const clearedCount = clearStatusEffects(fighter);
  assert(clearedCount === 3, 'Should clear 3 effects');
  assert(fighter.statusEffects.length === 0, 'Should have no effects after clear');
});

// Test 14: Defense Modifier
test('Defense modifier from Freeze', () => {
  const fighter = initializeFighter({ maxHp: 100, attack: 50, defense: 100, name: 'Test' });
  applyStatusEffect(fighter, 'freeze');
  
  const modifier = getDefenseModifier(fighter);
  assert(modifier === 0.5, 'Freeze should give 0.5x defense modifier');
});

// Test 15: Self Damage Calculation
test('Self damage from confusion', () => {
  const fighter = initializeFighter({ maxHp: 100, attack: 80, defense: 40, name: 'Test' });
  const selfDamage = calculateSelfDamage(fighter);
  
  assert(selfDamage > 0, 'Self damage should be > 0');
  assert(selfDamage < fighter.attack, 'Self damage should be < full attack');
});

// ────────────────────────────────────────────────────────────────────
// TEST SUMMARY
// ────────────────────────────────────────────────────────────────────

console.log('\n' + '═'.repeat(50));
console.log('\n📊 Test Summary');
console.log(`   Passed: ${passed}`);
console.log(`   Failed: ${failed}`);
console.log(`   Total:  ${passed + failed}`);

if (failed === 0) {
  console.log('\n✅ All tests passed! Status effects system is operational.\n');
  process.exit(0);
} else {
  console.log(`\n❌ ${failed} test(s) failed. Review errors above.\n`);
  process.exit(1);
}
