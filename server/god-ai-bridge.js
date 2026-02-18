/**
 * GOD AI BRIDGE - Direct Integration with OpenClaw Agent
 * 
 * This module creates a message-passing bridge where the Express server
 * sends narration requests to the main OpenClaw agent (BananaBot) who
 * then uses sessions_spawn to get God AI narration.
 * 
 * Flow:
 * 1. Server writes request to requests/ directory
 * 2. Main agent picks up request
 * 3. Main agent calls sessions_spawn with Kimi K2.5 TEE
 * 4. Main agent writes response to responses/ directory
 * 5. Server reads response
 */

const fs = require('fs');
const path = require('path');

const REQUESTS_DIR = path.join(__dirname, '..', 'god-ai-requests');
const RESPONSES_DIR = path.join(__dirname, '..', 'god-ai-responses');

// Ensure directories exist
[REQUESTS_DIR, RESPONSES_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Request God AI narration (async with timeout)
 */
async function requestNarration(prompt, timeoutMs = 10000) {
  const requestId = `request_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const requestFile = path.join(REQUESTS_DIR, `${requestId}.json`);
  const responseFile = path.join(RESPONSES_DIR, `${requestId}.json`);

  // Write request
  fs.writeFileSync(requestFile, JSON.stringify({
    id: requestId,
    prompt,
    timestamp: Date.now()
  }, null, 2));

  console.log(`🔗 Bridge: Request sent (${requestId})`);

  // Poll for response
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    if (fs.existsSync(responseFile)) {
      try {
        const response = JSON.parse(fs.readFileSync(responseFile, 'utf8'));
        
        // Cleanup
        fs.unlinkSync(requestFile).catch(() => {});
        fs.unlinkSync(responseFile).catch(() => {});
        
        console.log(`✅ Bridge: Response received (${requestId})`);
        return response.narration;
      } catch (err) {
        console.error('Error reading response:', err);
      }
    }
    
    // Wait 100ms before next check
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Timeout - cleanup and return null
  try {
    fs.unlinkSync(requestFile);
  } catch (err) {}
  
  console.warn(`⏰ Bridge: Timeout waiting for response (${requestId})`);
  return null;
}

/**
 * Check for pending requests (called by main agent)
 */
function getPendingRequests() {
  try {
    const files = fs.readdirSync(REQUESTS_DIR);
    return files
      .filter(f => f.endsWith('.json'))
      .map(f => {
        try {
          const data = fs.readFileSync(path.join(REQUESTS_DIR, f), 'utf8');
          return JSON.parse(data);
        } catch (err) {
          return null;
        }
      })
      .filter(r => r !== null);
  } catch (err) {
    return [];
  }
}

/**
 * Send response (called by main agent after getting God AI narration)
 */
function sendResponse(requestId, narration) {
  const responseFile = path.join(RESPONSES_DIR, `${requestId}.json`);
  fs.writeFileSync(responseFile, JSON.stringify({
    id: requestId,
    narration,
    timestamp: Date.now()
  }, null, 2));
}

module.exports = {
  requestNarration,
  getPendingRequests,
  sendResponse
};
