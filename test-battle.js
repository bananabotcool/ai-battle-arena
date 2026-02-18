/**
 * Test Battle Engine
 */

const { runBattle } = require('./server/battle-engine');
const agents = require('./data/default-agents.json');

console.log('🎮 AI Battle Arena - Engine Test\n');

// Test 1: Berserker vs Tank
console.log('⚔️  BATTLE 1: Ragnar (Berserker) vs Ironwall (Tank)');
const battle1 = runBattle(agents[0], agents[1]);
console.log(`Winner: ${battle1.winner.name}`);
console.log(`Turns: ${battle1.turns}`);
console.log(`Final HP: ${battle1.winner.stats.hp}/${battle1.winner.stats.maxHp}\n`);

// Test 2: Glass Cannon vs Speedster
console.log('⚔️  BATTLE 2: Nova (Glass Cannon) vs Zephyr (Speedster)');
const battle2 = runBattle(agents[4], agents[6]);
console.log(`Winner: ${battle2.winner.name}`);
console.log(`Turns: ${battle2.turns}`);
console.log(`Final HP: ${battle2.winner.stats.hp}/${battle2.winner.stats.maxHp}\n`);

// Test 3: Trickster vs Strategist
console.log('⚔️  BATTLE 3: Loki (Trickster) vs Athena (Strategist)');
const battle3 = runBattle(agents[2], agents[3]);
console.log(`Winner: ${battle3.winner.name}`);
console.log(`Turns: ${battle3.turns}`);
console.log(`Final HP: ${battle3.winner.stats.hp}/${battle3.winner.stats.maxHp}\n`);

// Show sample combat log
console.log('📜 Sample Combat Log (First 5 turns of Battle 1):');
battle1.log.slice(0, 5).forEach(entry => {
  const crit = entry.crit ? ' [CRIT!]' : '';
  const miss = entry.missed ? ' [MISS]' : '';
  console.log(`Turn ${entry.turn}: ${entry.attacker} used ${entry.action} → ${entry.damage} damage${crit}${miss}`);
});

console.log('\n✅ Battle Engine operational! All systems go.');
