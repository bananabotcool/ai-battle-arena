// ═══════════════════════════════════════════════════════════════════
// AI VS AI - Autonomous Battle System
// ═══════════════════════════════════════════════════════════════════

class AIvsAIController {
  constructor() {
    this.isRunning = false;
    this.isPaused = false;
    this.currentBattle = null;
    this.stats = {
      totalBattles: 0,
      battleDurations: [],
      longestStreak: { agent: null, wins: 0 },
      mostDamageDealt: 0,
      winRecords: {}
    };
    this.battleQueue = [];
    this.battleSpeed = 3; // 3x speed
    this.agents = [];
    
    this.init();
  }

  async init() {
    await this.loadAgents();
    this.setupEventListeners();
    this.generateQueue(10); // Generate 10 battles ahead
  }

  async loadAgents() {
    try {
      const response = await fetch('/api/agents');
      const data = await response.json();
      this.agents = data.agents;
      console.log(`✅ Loaded ${this.agents.length} agents`);
    } catch (error) {
      console.error('❌ Failed to load agents:', error);
    }
  }

  setupEventListeners() {
    document.getElementById('startAI').addEventListener('click', () => this.start());
    document.getElementById('pauseAI').addEventListener('click', () => this.togglePause());
    document.getElementById('stopAI').addEventListener('click', () => this.stop());
    
    const speedSlider = document.getElementById('speedSlider');
    speedSlider.addEventListener('input', (e) => {
      this.battleSpeed = parseInt(e.target.value);
      document.getElementById('speedDisplay').textContent = `${this.battleSpeed}x`;
    });
  }

  generateQueue(count) {
    for (let i = 0; i < count; i++) {
      const agent1 = this.agents[Math.floor(Math.random() * this.agents.length)];
      const agent2 = this.agents[Math.floor(Math.random() * this.agents.length)];
      
      if (agent1.id !== agent2.id) {
        this.battleQueue.push({
          id: `battle-${Date.now()}-${i}`,
          agent1: agent1,
          agent2: agent2,
          status: 'pending'
        });
      }
    }
    
    this.renderQueue();
  }

  renderQueue() {
    const queueList = document.getElementById('queueList');
    queueList.innerHTML = this.battleQueue.map((battle, idx) => `
      <div class="queue-item ${battle.status}">
        <strong>#${idx + 1}:</strong> ${battle.agent1.name} vs ${battle.agent2.name}
        <span style="float: right; color: #888;">${battle.status}</span>
      </div>
    `).join('');
  }

  async start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    document.getElementById('startAI').disabled = true;
    document.getElementById('pauseAI').disabled = false;
    document.getElementById('stopAI').disabled = false;
    
    console.log('🤖 AI vs AI mode started!');
    this.runBattleLoop();
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    const btn = document.getElementById('pauseAI');
    btn.textContent = this.isPaused ? '▶ Resume' : '⏸ Pause';
  }

  stop() {
    this.isRunning = false;
    this.isPaused = false;
    document.getElementById('startAI').disabled = false;
    document.getElementById('pauseAI').disabled = true;
    document.getElementById('stopAI').disabled = true;
    document.getElementById('pauseAI').textContent = '⏸ Pause';
    
    console.log('🛑 AI vs AI mode stopped');
  }

  async runBattleLoop() {
    while (this.isRunning && this.battleQueue.length > 0) {
      if (this.isPaused) {
        await this.sleep(500);
        continue;
      }

      const battle = this.battleQueue.shift();
      battle.status = 'active';
      this.renderQueue();

      await this.executeBattle(battle);

      battle.status = 'complete';
      this.battleQueue.push(battle); // Re-add to end for continuous play
      this.renderQueue();

      // Generate more battles if queue is low
      if (this.battleQueue.filter(b => b.status === 'pending').length < 5) {
        this.generateQueue(5);
      }

      await this.sleep(1000 / this.battleSpeed); // Speed-based delay
    }
  }

  async executeBattle(battle) {
    const startTime = Date.now();
    
    // Display battle start
    this.displayBattle(`
      <h2 style="text-align: center; color: #00ffff;">⚔️ BATTLE START ⚔️</h2>
      <div style="display: flex; justify-content: space-around; margin: 20px 0;">
        <div style="text-align: center;">
          <h3 style="color: #ff00ff;">${battle.agent1.name}</h3>
          <div style="color: #00ff00;">HP: ${battle.agent1.maxHp}</div>
          <div style="color: #ffaa00;">ATK: ${battle.agent1.attack}</div>
        </div>
        <div style="font-size: 48px; align-self: center;">VS</div>
        <div style="text-align: center;">
          <h3 style="color: #ff00ff;">${battle.agent2.name}</h3>
          <div style="color: #00ff00;">HP: ${battle.agent2.maxHp}</div>
          <div style="color: #ffaa00;">ATK: ${battle.agent2.attack}</div>
        </div>
      </div>
    `);

    await this.sleep(1000 / this.battleSpeed);

    try {
      // Start battle via API
      const startResponse = await fetch('/api/battle/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent1Id: battle.agent1.id,
          agent2Id: battle.agent2.id
        })
      });

      const battleData = await startResponse.json();
      const battleId = battleData.battleId;

      let round = 1;
      let winner = null;
      let totalDamage = 0;

      // Battle loop
      while (!winner && round < 50) {
        const turnResponse = await fetch('/api/battle/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ battleId })
        });

        const turnData = await turnResponse.json();
        
        if (turnData.action) {
          totalDamage += turnData.action.damage || 0;
        }

        if (turnData.battle.status === 'victory') {
          const agent1HP = turnData.battle.agent1.hp;
          const agent2HP = turnData.battle.agent2.hp;
          winner = agent1HP > 0 ? battle.agent1 : battle.agent2;
        }

        round++;
        await this.sleep(300 / this.battleSpeed);
      }

      // Record stats
      const duration = Date.now() - startTime;
      this.recordBattleStats(winner, duration, totalDamage);

      // Display winner
      this.displayBattle(`
        <div class="winner-announcement">
          <h2>🏆 VICTORY 🏆</h2>
          <h3 style="color: gold; font-size: 36px;">${winner.name}</h3>
          <p style="color: #fff; margin-top: 20px;">
            Defeated ${winner.id === battle.agent1.id ? battle.agent2.name : battle.agent1.name} 
            in ${round} rounds!
          </p>
          <p style="color: #ffaa00;">
            Total Damage: ${totalDamage} | Duration: ${(duration/1000).toFixed(1)}s
          </p>
        </div>
      `);

      await this.sleep(2000 / this.battleSpeed);

    } catch (error) {
      console.error('❌ Battle error:', error);
    }
  }

  recordBattleStats(winner, duration, totalDamage) {
    this.stats.totalBattles++;
    this.stats.battleDurations.push(duration);
    
    if (totalDamage > this.stats.mostDamageDealt) {
      this.stats.mostDamageDealt = totalDamage;
    }

    // Win records
    if (!this.stats.winRecords[winner.id]) {
      this.stats.winRecords[winner.id] = { name: winner.name, wins: 0 };
    }
    this.stats.winRecords[winner.id].wins++;

    // Check streak
    const wins = this.stats.winRecords[winner.id].wins;
    if (wins > this.stats.longestStreak.wins) {
      this.stats.longestStreak = { agent: winner.name, wins };
    }

    this.updateStatsDisplay();
  }

  updateStatsDisplay() {
    document.getElementById('totalBattles').textContent = this.stats.totalBattles;
    
    const avgDuration = this.stats.battleDurations.reduce((a,b) => a+b, 0) / this.stats.battleDurations.length;
    document.getElementById('avgDuration').textContent = 
      isNaN(avgDuration) ? '--' : `${(avgDuration/1000).toFixed(1)}s`;
    
    document.getElementById('longestStreak').textContent = 
      this.stats.longestStreak.agent 
        ? `${this.stats.longestStreak.agent} (${this.stats.longestStreak.wins})`
        : '--';
    
    document.getElementById('mostDamage').textContent = this.stats.mostDamageDealt;
  }

  displayBattle(html) {
    document.getElementById('battleDisplay').innerHTML = html;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  new AIvsAIController();
});
