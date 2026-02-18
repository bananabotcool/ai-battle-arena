// Quick test of God AI narration in battle
const axios = require('axios');

async function testBattle() {
  console.log('🎮 Testing AI Battle with God AI Narration...\n');
  
  try {
    // Start battle
    console.log('1. Starting battle: Bash vs CEO');
    const start = await axios.post('http://localhost:3001/api/battle/start', {
      agent1Id: 'bash-quickfingers',
      agent2Id: 'ceo'
    });
    
    console.log('✅ Battle started!');
    console.log(`   Battle ID: ${start.data.battleId}`);
    console.log(`   God AI Opening: "${start.data.narration}"\n`);
    
    // Execute turn
    console.log('2. Executing turn...');
    const turn = await axios.post('http://localhost:3001/api/battle/action', {
      battleId: start.data.battleId,
      abilityIndex: 0
    });
    
    console.log('✅ Turn complete!');
    console.log(`   Action: ${turn.data.action.attacker} used ${turn.data.action.ability}`);
    console.log(`   Damage: ${turn.data.action.damage}`);
    console.log(`   God AI: "${turn.data.narration}"\n`);
    
    console.log('🎉 GOD AI NARRATION WORKING!\n');
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    return false;
  }
}

testBattle().then(success => process.exit(success ? 0 : 1));
