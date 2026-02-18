// ──────────────────────────────────────────────────────────────────
// Tournament System - 8-Fighter Bracket
// ──────────────────────────────────────────────────────────────────

const API_BASE = '';

let allAgents = [];
let selectedFighters = [];
let tournamentBracket = {
  qf: [null, null, null, null], // Quarterfinal winners
  sf: [null, null], // Semifinal winners
  champion: null
};

// ──────────────────────────────────────────────────────────────────
// INITIALIZATION
// ──────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  await loadAgents();
  renderFighterGrid();
  
  document.getElementById('startTournament').addEventListener('click', startTournament);
  document.getElementById('randomize').addEventListener('click', randomizeSelection);
  document.getElementById('closeBattle').addEventListener('click', closeBattleModal);
  document.getElementById('newTournament').addEventListener('click', resetTournament);
  
  // Fight button listeners
  document.querySelectorAll('.fight-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const matchId = e.target.dataset.fight;
      runMatch(matchId);
    });
  });
});

// ──────────────────────────────────────────────────────────────────
// AGENT LOADING
// ──────────────────────────────────────────────────────────────────

async function loadAgents() {
  try {
    const response = await fetch(`${API_BASE}/api/agents`);
    const data = await response.json();
    allAgents = data.agents;
  } catch (error) {
    console.error('Failed to load agents:', error);
    allAgents = [];
  }
}

function renderFighterGrid() {
  const grid = document.getElementById('fighterGrid');
  grid.innerHTML = '';
  
  allAgents.forEach(agent => {
    const card = document.createElement('div');
    card.className = 'fighter-card';
    card.dataset.agentId = agent.id;
    
    const isSelected = selectedFighters.includes(agent.id);
    if (isSelected) {
      card.classList.add('selected');
    }
    
    card.innerHTML = `
      <div class="fighter-avatar">🤖</div>
      <div class="fighter-name">${agent.name}</div>
      <div class="fighter-stats">
        <span>HP: ${agent.maxHp}</span>
        <span>ATK: ${agent.attack}</span>
        <span>DEF: ${agent.defense}</span>
      </div>
      ${isSelected ? '<div class="selected-badge">✓</div>' : ''}
    `;
    
    card.addEventListener('click', () => toggleFighterSelection(agent.id));
    grid.appendChild(card);
  });
  
  updateSelectionCounter();
}

function toggleFighterSelection(agentId) {
  const index = selectedFighters.indexOf(agentId);
  
  if (index > -1) {
    selectedFighters.splice(index, 1);
  } else {
    if (selectedFighters.length < 8) {
      selectedFighters.push(agentId);
    } else {
      showNotification('Maximum 8 fighters selected!');
      return;
    }
  }
  
  renderFighterGrid();
}

function randomizeSelection() {
  const shuffled = [...allAgents].sort(() => Math.random() - 0.5);
  selectedFighters = shuffled.slice(0, 8).map(a => a.id);
  renderFighterGrid();
}

function updateSelectionCounter() {
  document.getElementById('selectedCount').textContent = selectedFighters.length;
}

// ──────────────────────────────────────────────────────────────────
// TOURNAMENT FLOW
// ──────────────────────────────────────────────────────────────────

function startTournament() {
  if (selectedFighters.length !== 8) {
    showNotification('Please select exactly 8 fighters!');
    return;
  }
  
  // Populate bracket
  populateBracket();
  
  // Hide selection, show bracket
  document.getElementById('selectionPhase').classList.add('hidden');
  document.getElementById('bracketPhase').classList.remove('hidden');
  
  showNotification('Tournament Started! Fight your way to victory!');
}

function populateBracket() {
  selectedFighters.forEach((agentId, index) => {
    const agent = allAgents.find(a => a.id === agentId);
    const slot = document.querySelector(`[data-slot="${index + 1}"]`);
    renderFighterSlot(slot, agent);
  });
  
  // Enable quarterfinal buttons
  document.querySelectorAll('[data-fight^="qf"]').forEach(btn => {
    btn.disabled = false;
  });
}

function renderFighterSlot(slot, agent, isWinner = false) {
  slot.innerHTML = `
    <div class="slot-avatar">🤖</div>
    <div class="slot-name">${agent.name}</div>
    <div class="slot-stats">
      HP:${agent.maxHp} ATK:${agent.attack} DEF:${agent.defense}
    </div>
    ${isWinner ? '<div class="winner-badge">👑</div>' : ''}
  `;
  slot.dataset.agentId = agent.id;
  if (isWinner) {
    slot.classList.add('winner');
  }
}

// ──────────────────────────────────────────────────────────────────
// BATTLE EXECUTION
// ──────────────────────────────────────────────────────────────────

async function runMatch(matchId) {
  const matchup = document.querySelector(`[data-match="${matchId}"]`);
  const slots = matchup.querySelectorAll('.fighter-slot');
  
  const agent1Id = slots[0].dataset.agentId;
  const agent2Id = slots[1].dataset.agentId;
  
  if (!agent1Id || !agent2Id) {
    showNotification('Fighters not ready!');
    return;
  }
  
  // Disable button
  const btn = matchup.querySelector('.fight-btn');
  btn.disabled = true;
  btn.textContent = 'Fighting...';
  
  // Show battle modal
  showBattleModal(agent1Id, agent2Id);
  
  try {
    // Start battle
    const startRes = await fetch(`${API_BASE}/api/battle/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent1Id, agent2Id })
    });
    const battleData = await startRes.json();
    const battleId = battleData.battleId;
    
    // Auto-battle until completion
    let winner = await autoBattle(battleId);
    
    // Update bracket with winner
    updateBracket(matchId, winner);
    
    // Close modal after delay
    setTimeout(() => {
      closeBattleModal();
      btn.textContent = 'Complete';
    }, 2000);
    
  } catch (error) {
    console.error('Battle failed:', error);
    showNotification('Battle failed! Try again.');
    btn.disabled = false;
    btn.textContent = 'FIGHT!';
  }
}

async function autoBattle(battleId) {
  const actions = ['attack', 'defend', 'special'];
  
  while (true) {
    const action = actions[Math.floor(Math.random() * actions.length)];
    
    const res = await fetch(`${API_BASE}/api/battle/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ battleId, action })
    });
    
    const data = await res.json();
    
    // Update battle narration
    if (data.narration) {
      appendNarration(data.narration);
    }
    
    // Check for winner
    if (data.status === 'finished') {
      return data.winner; // Returns 'agent1' or 'agent2'
    }
    
    // Small delay for dramatic effect
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

function updateBracket(matchId, winnerId) {
  const agent = allAgents.find(a => a.id === winnerId);
  
  if (matchId.startsWith('qf')) {
    // Quarterfinal winner
    const qfIndex = parseInt(matchId.slice(2)) - 1; // qf1 -> 0, qf2 -> 1, etc.
    tournamentBracket.qf[qfIndex] = agent;
    
    // Check if semifinal should be populated
    if (qfIndex === 0 || qfIndex === 1) {
      // sf1
      if (tournamentBracket.qf[0] && tournamentBracket.qf[1]) {
        const slot1 = document.querySelector('[data-slot="sf1a"]');
        const slot2 = document.querySelector('[data-slot="sf1b"]');
        renderFighterSlot(slot1, tournamentBracket.qf[0]);
        renderFighterSlot(slot2, tournamentBracket.qf[1]);
        document.querySelector('[data-fight="sf1"]').disabled = false;
      }
    } else {
      // sf2
      if (tournamentBracket.qf[2] && tournamentBracket.qf[3]) {
        const slot1 = document.querySelector('[data-slot="sf2a"]');
        const slot2 = document.querySelector('[data-slot="sf2b"]');
        renderFighterSlot(slot1, tournamentBracket.qf[2]);
        renderFighterSlot(slot2, tournamentBracket.qf[3]);
        document.querySelector('[data-fight="sf2"]').disabled = false;
      }
    }
    
  } else if (matchId.startsWith('sf')) {
    // Semifinal winner
    const sfIndex = parseInt(matchId.slice(2)) - 1;
    tournamentBracket.sf[sfIndex] = agent;
    
    // Check if final should be populated
    if (tournamentBracket.sf[0] && tournamentBracket.sf[1]) {
      const slot1 = document.querySelector('[data-slot="finala"]');
      const slot2 = document.querySelector('[data-slot="finalb"]');
      renderFighterSlot(slot1, tournamentBracket.sf[0]);
      renderFighterSlot(slot2, tournamentBracket.sf[1]);
      document.querySelector('[data-fight="final"]').disabled = false;
    }
    
  } else if (matchId === 'final') {
    // CHAMPION!
    tournamentBracket.champion = agent;
    document.getElementById('championDisplay').querySelector('.champion-name').textContent = agent.name;
    showVictoryModal(agent);
  }
}

// ──────────────────────────────────────────────────────────────────
// UI HELPERS
// ──────────────────────────────────────────────────────────────────

function showBattleModal(agent1Id, agent2Id) {
  const agent1 = allAgents.find(a => a.id === agent1Id);
  const agent2 = allAgents.find(a => a.id === agent2Id);
  
  document.getElementById('fighter1Preview').innerHTML = `
    <div class="preview-avatar">🤖</div>
    <div class="preview-name">${agent1.name}</div>
  `;
  
  document.getElementById('fighter2Preview').innerHTML = `
    <div class="preview-avatar">🤖</div>
    <div class="preview-name">${agent2.name}</div>
  `;
  
  document.getElementById('battleNarration').innerHTML = '';
  document.getElementById('battleModal').classList.remove('hidden');
}

function closeBattleModal() {
  document.getElementById('battleModal').classList.add('hidden');
}

function appendNarration(text) {
  const narration = document.getElementById('battleNarration');
  const line = document.createElement('div');
  line.className = 'narration-line';
  line.textContent = text;
  narration.appendChild(line);
  narration.scrollTop = narration.scrollHeight;
}

function showVictoryModal(champion) {
  document.getElementById('championInfo').innerHTML = `
    <div class="champion-portrait">🤖</div>
    <h2>${champion.name}</h2>
    <p>${champion.personality}</p>
  `;
  
  document.getElementById('championStats').innerHTML = `
    <div class="stat">HP: ${champion.maxHp}</div>
    <div class="stat">ATK: ${champion.attack}</div>
    <div class="stat">DEF: ${champion.defense}</div>
  `;
  
  document.getElementById('victoryModal').classList.remove('hidden');
}

function resetTournament() {
  selectedFighters = [];
  tournamentBracket = { qf: [null, null, null, null], sf: [null, null], champion: null };
  
  document.getElementById('victoryModal').classList.add('hidden');
  document.getElementById('bracketPhase').classList.add('hidden');
  document.getElementById('selectionPhase').classList.remove('hidden');
  
  renderFighterGrid();
}

function showNotification(message) {
  // Simple alert for now, can be upgraded to toast
  alert(message);
}
