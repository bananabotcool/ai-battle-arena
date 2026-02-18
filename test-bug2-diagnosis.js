#!/usr/bin/env node
/**
 * Diagnostic Script for BUG #2 - God AI 405 Errors
 * Tests the sessions/spawn endpoint with same parameters as god-narrator.js
 */

const axios = require('axios');
require('dotenv').config();

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://localhost:18789';
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN;

console.log('🔍 God AI 405 Error Diagnostic\n');
console.log('Configuration:');
console.log('  Gateway URL:', GATEWAY_URL);
console.log('  Token Set:', !!GATEWAY_TOKEN);
console.log('  Token Prefix:', GATEWAY_TOKEN ? GATEWAY_TOKEN.substring(0, 10) + '...' : 'MISSING');
console.log('');

if (!GATEWAY_TOKEN) {
  console.error('❌ OPENCLAW_GATEWAY_TOKEN not set in .env');
  console.error('   This will cause 401/405 errors!');
  console.error('   Add: OPENCLAW_GATEWAY_TOKEN=<your-token>');
  process.exit(1);
}

async function testSessionsSpawn() {
  console.log('Testing sessions/spawn endpoint...\n');
  
  const testPrompt = `You are the GOD AI, an omniscient narrator for an epic battle arena.

**YOUR CURRENT MOOD: EXCITED**
This battle is heating up! Use vivid imagery and dramatic language. The stakes are HIGH!

**Current Battle State:**
Agent 1: Bash Quickfingers (Lightning-fast backend warrior)
  HP: 100/120
  Mood: Confident

Agent 2: Ruby Loopster (Elegant route master)
  HP: 95/110
  Mood: Fighting

Action: Bash Quickfingers used Rapid Deploy on Ruby Loopster!
Result: 45 damage dealt!

Narrate this moment dramatically in 1-3 sentences. Use epic RPG style with vivid imagery. Make it LEGENDARY!

Respond with ONLY the narration. No extra text.`;

  try {
    console.log('1️⃣  Attempting POST /api/sessions/spawn...');
    
    const response = await axios.post(
      `${GATEWAY_URL}/api/sessions/spawn`,
      {
        task: testPrompt,
        model: 'chutes/kimi-k2.5-tee',
        label: `test-god-ai-${Date.now()}`,
        cleanup: 'delete',
        runTimeoutSeconds: 30
      },
      {
        headers: {
          'Authorization': `Bearer ${GATEWAY_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 35000
      }
    );
    
    console.log('✅ Request succeeded!');
    console.log('   Status:', response.status);
    console.log('   Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.result || response.data.message) {
      const narration = response.data.result || response.data.message;
      console.log('\n🎭 God AI Narration:');
      console.log('  ', narration.substring(0, 200));
    }
    
    console.log('\n🎉 Endpoint working correctly!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Request failed!\n');
    
    if (error.response) {
      console.error('HTTP Error Details:');
      console.error('  Status:', error.response.status, error.response.statusText);
      console.error('  URL:', error.config?.url);
      console.error('  Method:', error.config?.method);
      console.error('  Data:', JSON.stringify(error.response.data, null, 2));
      console.error('  Headers:', JSON.stringify(error.response.headers, null, 2));
      
      if (error.response.status === 405) {
        console.error('\n💡 405 Method Not Allowed - Possible causes:');
        console.error('   • Endpoint path is incorrect');
        console.error('   • Gateway not running or not ready');
        console.error('   • POST method not supported on this endpoint');
        console.error('   • CORS or routing issue');
        console.error('\n🔧 Troubleshooting:');
        console.error('   1. Verify gateway is running: curl', GATEWAY_URL);
        console.error('   2. Check endpoint exists: curl', `${GATEWAY_URL}/api/sessions/spawn`);
        console.error('   3. Review gateway logs for routing errors');
      }
      
      if (error.response.status === 401 || error.response.status === 403) {
        console.error('\n💡 Authentication Error - Check token validity:');
        console.error('   • Token may be expired or invalid');
        console.error('   • Gateway may not accept this token format');
      }
      
    } else if (error.request) {
      console.error('No Response Received:');
      console.error('  Message:', error.message);
      console.error('  Code:', error.code);
      console.error('\n💡 Connection failed - Is gateway running?');
      console.error('   Check:', GATEWAY_URL);
      
    } else {
      console.error('Request Setup Error:');
      console.error('  Message:', error.message);
    }
    
    process.exit(1);
  }
}

// Quick health check first
console.log('0️⃣  Gateway health check...');
axios.get(GATEWAY_URL)
  .then(() => {
    console.log('✅ Gateway is reachable\n');
    testSessionsSpawn();
  })
  .catch((error) => {
    console.error('❌ Gateway not reachable!');
    console.error('   URL:', GATEWAY_URL);
    console.error('   Error:', error.message);
    console.error('\n💡 Start OpenClaw Gateway:');
    console.error('   openclaw gateway start');
    process.exit(1);
  });
