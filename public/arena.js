// ═════════════════════════════════════════════════════════════════════
// ARENA.JS - Game Controller (Battle State, API, UI Updates)
// ═════════════════════════════════════════════════════════════════════

class ArenaController {
  constructor() {
    this.battleId = null;
    this.battleState = null;
    this.currentRound = 1;
    this.agent1 = null;
    this.agent2 = null;
    this.animator = null; // Will be set externally if animator.js is loaded
  }

  // ─────────────────────────────────────────────────────────────────
  // BATTLE INITIALIZATION
  // ─────────────────────────────────────────────────────────────────

  async startBattle(agent1, agent2) {
    this.agent1 = JSON.parse(JSON.stringify(agent1)); // Deep copy
    this.agent2 = JSON.parse(JSON.stringify(agent2));
    this.currentRound = 1;

    try {
      const response = await fetch('/api/battle/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent1: this.agent1,
          agent2: this.agent2
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.battleId = data.battleId;
        this.battleState = data.state;
        this.updateUI();
        this.addBattleLog('system', `⚔️ Battle started! Round ${this.currentRound}`);
        return true;
      } else {
        throw new Error('Failed to start battle');
      }
    } catch (error) {
      console.error('Battle start error:', error);
      // Fallback to local battle if server fails
      this.initializeLocalBattle();
      return true;
    }
  }

  initializeLocalBattle() {
    this.battleId = `local_${Date.now()}`;
    this.battleState = {
      agent1: { ...this.agent1, hp: this.agent1.stats.hp, specialCooldown: 0 },
      agent2: { ...this.agent2, hp: this.agent2.stats.hp, specialCooldown: 0 },
      round: 1,
      log: []
    };
    this.updateUI();
    this.addBattleLog('system', `⚔️ Battle started! Round ${this.currentRound}`);
  }

  // ─────────────────────────────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────────────────────────────

  async performAction(agentIndex, action) {
    if (!this.battleState) return;

    try {
      const response = await fetch('/api/battle/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          battleId: this.battleId,
          agentIndex,
          action
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.processActionResult(data);
        return data;
      } else {
        throw new Error('Action failed');
      }
    } catch (error) {
      console.error('Action error:', error);
      // Fallback to local processing
      this.processLocalAction(agentIndex, action);
    }
  }

  processLocalAction(agentIndex, action) {
    const attacker = agentIndex === 1 ? this.battleState.agent1 : this.battleState.agent2;
    const defender = agentIndex === 1 ? this.battleState.agent2 : this.battleState.agent1;

    let damage = 0;
    let actionText = '';

    switch (action) {
      case 'attack':
        damage = this.calculateDamage(attacker, defender, false);
        defender.hp = Math.max(0, defender.hp - damage);
        actionText = `${attacker.name} attacks for ${damage} damage!`;
        this.addBattleLog('attack', actionText);
        if (this.animator) this.animator.showDamage(agentIndex === 1 ? 2 : 1, damage, false);
        break;

      case 'defend':
        attacker.defending = true;
        actionText = `${attacker.name} takes a defensive stance! 🛡️`;
        this.addBattleLog('defend', actionText);
        break;

      case 'special':
        if (attacker.specialCooldown === 0) {
          damage = this.calculateDamage(attacker, defender, true);
          defender.hp = Math.max(0, defender.hp - damage);
          attacker.specialCooldown = 3;
          actionText = `${attacker.name} unleashes ${attacker.abilities[3]}! ${damage} damage! 💥`;
          this.addBattleLog('special', actionText);
          if (this.animator) this.animator.showDamage(agentIndex === 1 ? 2 : 1, damage, true);
        } else {
          actionText = `${attacker.name}'s special is on cooldown (${attacker.specialCooldown} rounds left)`;
          this.addBattleLog('system', actionText);
        }
        break;
    }

    // Cooldown tick
    if (attacker.specialCooldown > 0) attacker.specialCooldown--;
    if (defender.specialCooldown > 0) defender.specialCooldown--;

    this.updateUI();
    this.checkVictory();
  }

  calculateDamage(attacker, defender, isSpecial) {
    const baseAtk = attacker.stats?.atk || attacker.attack || 25;
    const baseDef = defender.stats?.def || defender.defense || 15;
    
    let multiplier = isSpecial ? 2.0 : (Math.random() * 0.4 + 0.8); // 0.8-1.2 or 2.0
    if (!isSpecial && Math.random() < 0.2) multiplier = 2.0; // 20% crit chance
    
    const defReduction = defender.defending ? baseDef * 0.5 : baseDef * 0.2;
    const finalDamage = Math.max(5, Math.floor(baseAtk * multiplier - defReduction));
    
    defender.defending = false;
    return finalDamage;
  }

  processActionResult(data) {
    if (data.events) {
      data.events.forEach(event => {
        this.addBattleLog(event.type, event.message);
        
        if (event.type === 'damage' && this.animator) {
          this.animator.showDamage(event.target === 'agent1' ? 1 : 2, event.amount, event.isCritical);
        }
      });
    }

    // ✨ Handle status effect messages from server
    if (data.action && data.action.statusMessages && data.action.statusMessages.length > 0) {
      data.action.statusMessages.forEach(msg => {
        this.addBattleLog('status', msg);
      });
      
      // Show DoT damage if present
      if (data.action.actionType === 'status' && data.action.damage > 0) {
        const targetId = data.action.defender === this.battleState?.agent1?.name ? 1 : 2;
        if (typeof showDamageNumber === 'function') {
          showDamageNumber(`agent${targetId}`, data.action.damage, 'status');
        }
      }
    }

    if (data.state) {
      this.battleState = data.state;
      this.updateUI();
    }

    if (data.winner) {
      this.handleVictory(data.winner);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // UI UPDATES
  // ─────────────────────────────────────────────────────────────────

  updateUI() {
    if (!this.battleState) return;

    // Update Agent 1
    this.updateAgentPanel(1, this.battleState.agent1);
    // Update Agent 2
    this.updateAgentPanel(2, this.battleState.agent2);
    // Update round counter
    document.getElementById('roundNumber').textContent = this.battleState.round || this.currentRound;
  }

  updateAgentPanel(agentNumber, agentData) {
    const prefix = `agent${agentNumber}`;
    
    // Name & Title
    const nameEl = document.getElementById(`${prefix}Name`);
    const titleEl = document.getElementById(`${prefix}Title`);
    if (nameEl) nameEl.textContent = agentData.name;
    if (titleEl) titleEl.textContent = agentData.personality || '';

    // HP
    const maxHp = agentData.stats?.maxHp || agentData.maxHp || 100;
    const currentHp = agentData.hp || maxHp;
    const hpPercent = (currentHp / maxHp) * 100;

    const hpValueEl = document.getElementById(`${prefix}HP`);
    const hpBarEl = document.getElementById(`${prefix}HPBar`);
    
    if (hpValueEl) hpValueEl.textContent = `${currentHp} / ${maxHp}`;
    if (hpBarEl) {
      hpBarEl.style.width = `${hpPercent}%`;
      hpBarEl.className = `hp-bar ${this.getHPColorClass(hpPercent)}`;
    }

    // Stats
    const stats = agentData.stats || {};
    ['ATK', 'DEF', 'SPEED', 'LUCK'].forEach(stat => {
      const el = document.getElementById(`${prefix}${stat}`);
      if (el) el.textContent = stats[stat.toLowerCase()] || stats[stat] || 0;
    });

    // Special meter
    const specialEl = document.getElementById(`${prefix}Special`);
    if (specialEl) {
      const cooldown = agentData.specialCooldown || 0;
      specialEl.textContent = cooldown > 0 ? `CD: ${cooldown}` : 'READY';
      specialEl.className = cooldown > 0 ? 'stat-value cooldown' : 'stat-value ready';
    }

    // ✨ STATUS EFFECTS - Update icons from animator.js
    if (typeof updateStatusIcons === 'function' && agentData.statusEffects) {
      const fighterId = `agent${agentNumber}`;
      updateStatusIcons(fighterId, agentData.statusEffects);
    }
  }

  getHPColorClass(percent) {
    if (percent > 70) return 'hp-green';
    if (percent > 40) return 'hp-yellow';
    if (percent > 20) return 'hp-orange';
    return 'hp-red';
  }

  // ─────────────────────────────────────────────────────────────────
  // BATTLE LOG
  // ─────────────────────────────────────────────────────────────────

  addBattleLog(type, message) {
    const logContainer = document.getElementById('battleLog');
    if (!logContainer) return;

    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    entry.textContent = message;
    
    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
  }

  clearBattleLog() {
    const logContainer = document.getElementById('battleLog');
    if (logContainer) logContainer.innerHTML = '';
  }

  // ─────────────────────────────────────────────────────────────────
  // VICTORY HANDLING
  // ─────────────────────────────────────────────────────────────────

  checkVictory() {
    if (!this.battleState) return;

    const agent1Dead = this.battleState.agent1.hp <= 0;
    const agent2Dead = this.battleState.agent2.hp <= 0;

    if (agent1Dead || agent2Dead) {
      const winner = agent1Dead ? this.battleState.agent2 : this.battleState.agent1;
      this.handleVictory(winner);
    }
  }

  handleVictory(winner) {
    this.addBattleLog('system', `🏆 ${winner.name} wins! 🏆`);
    
    if (this.animator && this.animator.showVictoryModal) {
      setTimeout(() => {
        this.animator.showVictoryModal(winner.name);
      }, 1000);
    }

    // Disable action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
      btn.disabled = true;
      btn.style.opacity = '0.5';
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // RESET
  // ─────────────────────────────────────────────────────────────────

  reset() {
    this.battleId = null;
    this.battleState = null;
    this.currentRound = 1;
    this.clearBattleLog();
  }
}

// Export for use in other modules
window.ArenaController = ArenaController;
