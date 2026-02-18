#!/usr/bin/env node
/**
 * Test BUG #1 Fix - Custom Agent API Format Compatibility
 */

const axios = require('axios');

const SERVER_URL = 'http://localhost:3000';

async function testCustomAgentFormats() {
  console.log('🧪 Testing Custom Agent API Format Compatibility...\n');
  
  // Test Format 1: Frontend format (maxHp, attack, defense)
  const format1 = {
    name: 'Test Agent 1',
    personality: 'Frontend Format Test',
    maxHp: 120,
    attack: 80,
    defense: 60,
    speed: 25,
    luck: 15,
    abilities: ['Attack 1', 'Attack 2', 'Attack 3', 'Special Move']
  };
  
  // Test Format 2: Stats object format
  const format2 = {
    name: 'Test Agent 2',
    personality: 'Stats Format Test',
    stats: {
      hp: 130,
      maxHp: 130,
      atk: 85,
      def: 65,
      speed: 30,
      luck: 20,
      special: 0
    },
    abilities: ['Attack 1', 'Attack 2', 'Attack 3', 'Special Move']
  };
  
  try {
    console.log('1️⃣  Testing Format 1 (Frontend: maxHp, attack, defense)...');
    const res1 = await axios.post(`${SERVER_URL}/api/custom-agents`, format1);
    console.log(`✅ Format 1 accepted! ID: ${res1.data.id}`);
    console.log(`   Stats normalized:`, JSON.stringify(res1.data.stats, null, 2));
    
    console.log('\n2️⃣  Testing Format 2 (Backend: stats object)...');
    const res2 = await axios.post(`${SERVER_URL}/api/custom-agents`, format2);
    console.log(`✅ Format 2 accepted! ID: ${res2.data.id}`);
    console.log(`   Stats preserved:`, JSON.stringify(res2.data.stats, null, 2));
    
    console.log('\n🎉 BUG #1 FIX VERIFIED: Both formats work!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Check if server is running
axios.get(`${SERVER_URL}/api/agents`)
  .then(() => {
    testCustomAgentFormats();
  })
  .catch(() => {
    console.error('❌ Server not running at', SERVER_URL);
    console.error('   Start with: node server/server.js');
    process.exit(1);
  });
