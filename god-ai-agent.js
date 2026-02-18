#!/usr/bin/env node
/**
 * GOD AI AGENT - Background processor for God AI narration requests
 * 
 * This script runs as a background process that:
 * 1. Monitors god-ai-requests/ directory for new requests
 * 2. Uses OpenClaw sessions_spawn to get God AI narration
 * 3. Writes responses to god-ai-responses/ directory
 * 
 * The Express server communicates with this agent via file-based message passing.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const REQUESTS_DIR = path.join(__dirname, 'god-ai-requests');
const RESPONSES_DIR = path.join(__dirname, 'god-ai-responses');

// Ensure directories exist
[REQUESTS_DIR, RESPONSES_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Process a single narration request using sessions_spawn
 */
async function processRequest(request) {
  console.log(`\n🎭 Processing God AI request: ${request.id}`);
  
  try {
    // Call OpenClaw's sessions_spawn via CLI
    // Note: This requires openclaw CLI to be available
    const command = `openclaw agent spawn --task "${escapeShellArg(request.prompt)}" --model "chutes/kimi-k2.5-tee" --cleanup delete --timeout 30`;
    
    console.log(`🚀 Spawning God AI agent...`);
    const { stdout, stderr } = await execPromise(command, {
      timeout: 35000,
      maxBuffer: 1024 * 1024 // 1MB buffer
    });
    
    // Extract narration from output
    const narration = extractNarration(stdout);
    
    if (narration) {
      console.log(`✨ God AI responded: "${narration.substring(0, 80)}..."`);
      
      // Write response
      const responseFile = path.join(RESPONSES_DIR, `${request.id}.json`);
      fs.writeFileSync(responseFile, JSON.stringify({
        id: request.id,
        narration,
        timestamp: Date.now()
      }, null, 2));
      
      // Cleanup request
      const requestFile = path.join(REQUESTS_DIR, `${request.id}.json`);
      fs.unlinkSync(requestFile);
      
      return narration;
    } else {
      throw new Error('No narration extracted from response');
    }
  } catch (error) {
    console.error(`❌ Error processing request ${request.id}:`, error.message);
    
    // Write fallback response
    const fallback = getFallbackNarration();
    const responseFile = path.join(RESPONSES_DIR, `${request.id}.json`);
    fs.writeFileSync(responseFile, JSON.stringify({
      id: request.id,
      narration: fallback,
      timestamp: Date.now(),
      fallback: true
    }, null, 2));
    
    // Cleanup request
    try {
      const requestFile = path.join(REQUESTS_DIR, `${request.id}.json`);
      fs.unlinkSync(requestFile);
    } catch (err) {}
    
    return fallback;
  }
}

/**
 * Extract narration from God AI response
 */
function extractNarration(text) {
  // Look for quoted text or meaningful sentences
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  
  for (const line of lines) {
    // Skip system messages
    if (line.includes('Spawning') || line.includes('session') || line.includes('✅')) {
      continue;
    }
    
    // Return first substantial line
    if (line.length > 20 && line.length < 300) {
      return line.replace(/^["\']|["\']$/g, '').trim();
    }
  }
  
  // Fallback: return longest non-system line
  return lines
    .filter(l => !l.includes('✅') && !l.includes('session'))
    .sort((a, b) => b.length - a.length)[0] || 'An epic moment unfolds!';
}

/**
 * Get fallback narration
 */
function getFallbackNarration() {
  const fallbacks = [
    "The arena trembles with power!",
    "An unstoppable force meets immovable resolve!",
    "The crowd roars as the battle intensifies!",
    "Destiny hangs in the balance!",
    "Warriors clash in an epic display of skill!"
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

/**
 * Escape shell arguments
 */
function escapeShellArg(arg) {
  return arg.replace(/"/g, '\\"').replace(/'/g, "\\'");
}

/**
 * Main monitoring loop
 */
async function monitorRequests() {
  console.log('🎭 God AI Agent Started - Monitoring for requests...\n');
  
  while (true) {
    try {
      // Check for request files
      const files = fs.readdirSync(REQUESTS_DIR);
      const requestFiles = files.filter(f => f.endsWith('.json'));
      
      for (const file of requestFiles) {
        try {
          const data = fs.readFileSync(path.join(REQUESTS_DIR, file), 'utf8');
          const request = JSON.parse(data);
          
          // Process request
          await processRequest(request);
        } catch (err) {
          console.error(`Error processing ${file}:`, err.message);
        }
      }
    } catch (err) {
      console.error('Error in monitor loop:', err.message);
    }
    
    // Wait 200ms before next check
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 God AI Agent shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 God AI Agent terminated...');
  process.exit(0);
});

// Start monitoring
console.log(`
╔═══════════════════════════════════════════════════════╗
║         GOD AI AGENT - Background Processor           ║
║   Monitoring: ${REQUESTS_DIR}                         ║
╚═══════════════════════════════════════════════════════╝
`);

monitorRequests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
