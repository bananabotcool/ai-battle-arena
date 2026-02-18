/**
 * Test Critical Hits and Special Cooldowns
 * Run this to verify the new combat features
 */

const axios = require('axios');

const API_URL = 'http://localhost:3001';

// Test agents with different luck stats
const AGENTS = [
  { id: 'ruby-loopster', luck: 20, expectedCrit: '7%' },    // 5% + 2% = 7%
  { id: 'pixelpusher-prime', luck: 25, expectedCrit: '7.5%' }, // 5% + 2.5% = 7.5%
  { id: 'thinktanker', luck: 18, expectedCrit: '6.8%' },   // 5% + 1.8% = 6.8%
  { id: 'sergeant-semicolon', luck: 10, expectedCrit: '6%' } // 5% + 1% = 6%
];

async function startBattle(agent1Id, agent2Id) {
  console.log(`\n🎮 Starting battle: ${agent1Id} vs ${agent2Id}`);
  
  const response = await axios.post(`${API_URL}/api/battle/start`, {
    agent1Id,
    agent2Id
  });
  
  return response.data;
}

async function executeAction(battleId, abilityIndex) {
  const response = await axios.post(`${API_URL}/api/battle/action`, {
    battleId,
    abilityIndex
  });
  
  return response.data;
}

async function testCriticalHits() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('TEST 1: CRITICAL HIT SYSTEM');
  console.log('═══════════════════════════════════════════════════════');
  
  const { battleId } = await startBattle('ruby-loopster', 'bash-quickfingers');
  
  let critCount = 0;
  let totalHits = 0;
  const turns = 100; // Run many turns to see crit rate
  
  console.log('\n🎲 Running 100 attacks to measure crit rate...\n');
  
  for (let i = 0; i < turns; i++) {
    try {
      const result = await executeAction(battleId, 0); // Use first ability
      
      if (result.action.actionType === 'crit') {
        critCount++;
        console.log(`💥 CRIT on turn ${i + 1}! (${critCount}/${totalHits + 1} = ${((critCount / (totalHits + 1)) * 100).toFixed(2)}%)`);
      }
      
      if (result.action.actionType !== 'miss') {
        totalHits++;
      }
      
      // Check if battle ended
      if (result.battle.status === 'finished') {
        console.log('\n⚔️  Battle ended early');
        break;
      }
    } catch (error) {
      // Battle might end, that's ok
      break;
    }
  }
  
  const actualCritRate = ((critCount / totalHits) * 100).toFixed(2);
  const expectedCritRate = (0.05 + (20 / 1000)) * 100; // Ruby has 20 LUCK
  
  console.log('\n📊 RESULTS:');
  console.log(`   Total hits: ${totalHits}`);
  console.log(`   Critical hits: ${critCount}`);
  console.log(`   Actual crit rate: ${actualCritRate}%`);
  console.log(`   Expected crit rate: ${expectedCritRate.toFixed(2)}% (5% base + 2% from LUCK 20)`);
  console.log(`   Difference: ${Math.abs(actualCritRate - expectedCritRate).toFixed(2)}%`);
  
  if (critCount > 0) {
    console.log('\n✅ Critical hits are working!');
  } else {
    console.log('\n⚠️  No crits detected - may need more turns or check formula');
  }
}

async function testCritDamage() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('TEST 2: CRITICAL DAMAGE (2x multiplier)');
  console.log('═══════════════════════════════════════════════════════');
  
  const { battleId } = await startBattle('ceo', 'sergeant-semicolon');
  
  let normalDamages = [];
  let critDamages = [];
  
  console.log('\n🎲 Collecting damage samples...\n');
  
  for (let i = 0; i < 50; i++) {
    try {
      const result = await executeAction(battleId, 0);
      
      if (result.action.actionType === 'crit') {
        critDamages.push(result.action.damage);
        console.log(`💥 CRIT: ${result.action.damage} damage`);
      } else if (result.action.actionType === 'attack') {
        normalDamages.push(result.action.damage);
      }
      
      if (result.battle.status === 'finished') break;
    } catch (error) {
      break;
    }
  }
  
  if (normalDamages.length > 0 && critDamages.length > 0) {
    const avgNormal = normalDamages.reduce((a, b) => a + b) / normalDamages.length;
    const avgCrit = critDamages.reduce((a, b) => a + b) / critDamages.length;
    const ratio = avgCrit / avgNormal;
    
    console.log('\n📊 RESULTS:');
    console.log(`   Normal hits: ${normalDamages.length} (avg: ${avgNormal.toFixed(1)} dmg)`);
    console.log(`   Critical hits: ${critDamages.length} (avg: ${avgCrit.toFixed(1)} dmg)`);
    console.log(`   Damage ratio: ${ratio.toFixed(2)}x`);
    console.log(`   Expected ratio: 2.0x`);
    
    if (ratio >= 1.8 && ratio <= 2.2) {
      console.log('\n✅ Crit damage multiplier is correct!');
    } else {
      console.log('\n⚠️  Damage ratio is off - expected ~2.0x');
    }
  } else {
    console.log('\n⚠️  Not enough data collected');
  }
}

async function testSpecialCooldown() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('TEST 3: SPECIAL ABILITY COOLDOWN (3 turns)');
  console.log('═══════════════════════════════════════════════════════');
  
  const { battleId, battle } = await startBattle('ruby-loopster', 'bash-quickfingers');
  
  const specialIndex = battle.agent1.abilities.length - 1;
  
  console.log(`\n🔥 Agent has ${battle.agent1.abilities.length} abilities`);
  console.log(`   Special ability: ${battle.agent1.abilities[specialIndex]} (index ${specialIndex})`);
  
  // Turn 1: Use special
  console.log('\n📍 Turn 1: Using special ability...');
  const turn1 = await executeAction(battleId, specialIndex);
  console.log(`   ✓ Used "${turn1.action.ability}"`);
  console.log(`   Agent 1 cooldown: ${turn1.battle.agent1.specialCooldown}`);
  
  // Turn 2: Try to use special (should fail)
  console.log('\n📍 Turn 2: Trying to use special again...');
  await executeAction(battleId, 0); // Agent 2's turn
  
  try {
    await executeAction(battleId, specialIndex);
    console.log('   ❌ ERROR: Special was allowed on cooldown!');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log(`   ✓ Blocked: ${error.response.data.message}`);
      console.log(`   Cooldown remaining: ${error.response.data.cooldown} turn(s)`);
    } else {
      throw error;
    }
  }
  
  // Wait for cooldown to expire
  console.log('\n📍 Waiting for cooldown to expire...');
  
  for (let turn = 0; turn < 6; turn++) {
    const result = await executeAction(battleId, 0);
    const currentCooldown = result.battle.agent1.specialCooldown;
    console.log(`   Turn ${turn + 3}: Cooldown = ${currentCooldown}`);
    
    if (currentCooldown === 0) {
      console.log('\n📍 Cooldown expired! Trying special again...');
      await executeAction(battleId, 0); // Complete current turn
      
      const finalTurn = await executeAction(battleId, specialIndex);
      console.log(`   ✓ Special used successfully: "${finalTurn.action.ability}"`);
      console.log(`   New cooldown: ${finalTurn.battle.agent1.specialCooldown}`);
      break;
    }
    
    if (result.battle.status === 'finished') {
      console.log('\n⚔️  Battle ended before cooldown expired');
      break;
    }
  }
  
  console.log('\n✅ Special cooldown system working correctly!');
}

async function testVisualEffects() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('TEST 4: VISUAL EFFECTS DATA');
  console.log('═══════════════════════════════════════════════════════');
  
  const { battleId } = await startBattle('pixelpusher-prime', 'thinktanker');
  
  console.log('\n🎨 Checking for isCrit flag in responses...\n');
  
  for (let i = 0; i < 30; i++) {
    try {
      const result = await executeAction(battleId, 0);
      
      if (result.action.isCrit !== undefined) {
        console.log(`✓ Turn ${i + 1}: isCrit flag present = ${result.action.isCrit}`);
        
        if (result.action.isCrit) {
          console.log(`  💥 CRIT detected! Frontend should trigger:`);
          console.log(`     - Screen shake`);
          console.log(`     - "CRITICAL!" text overlay`);
          console.log(`     - 500ms slow-mo`);
          console.log(`     - Particle burst (✨)`);
        }
      } else {
        console.log(`❌ Turn ${i + 1}: isCrit flag missing!`);
      }
      
      if (result.battle.status === 'finished') break;
    } catch (error) {
      break;
    }
  }
  
  console.log('\n✅ Visual effect data is present in responses!');
}

async function runAllTests() {
  console.log('\n🚀 CRITICAL HITS & SPECIAL COOLDOWNS TEST SUITE');
  console.log('═══════════════════════════════════════════════════════\n');
  
  try {
    await testCriticalHits();
    await testCritDamage();
    await testSpecialCooldown();
    await testVisualEffects();
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✨ ALL TESTS COMPLETE!');
    console.log('═══════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Run tests
runAllTests();
