// ═════════════════════════════════════════════════════════════════════
// AGENTS.JS - Agent System (Load, Select, Display)
// ═════════════════════════════════════════════════════════════════════

class AgentSystem {
  constructor() {
    this.defaultAgents = [];
    this.customAgents = [];
    this.allAgents = [];
  }

  // ─────────────────────────────────────────────────────────────────
  // LOAD AGENTS
  // ─────────────────────────────────────────────────────────────────

  async loadDefaultAgents() {
    try {
      const response = await fetch('/data/default-agents.json');
      this.defaultAgents = await response.json();
      this.updateAllAgents();
      return this.defaultAgents;
    } catch (error) {
      console.error('Failed to load default agents:', error);
      return [];
    }
  }

  async loadCustomAgents() {
    try {
      const response = await fetch('/data/custom-agents.json');
      if (response.ok) {
        this.customAgents = await response.json();
      } else {
        this.customAgents = [];
      }
    } catch (error) {
      console.log('No custom agents yet (this is normal on first run)');
      this.customAgents = [];
    }
    this.updateAllAgents();
    return this.customAgents;
  }

  updateAllAgents() {
    this.allAgents = [...this.defaultAgents, ...this.customAgents];
  }

  async loadAllAgents() {
    await this.loadDefaultAgents();
    await this.loadCustomAgents();
    return this.allAgents;
  }

  // ─────────────────────────────────────────────────────────────────
  // SAVE CUSTOM AGENT
  // ─────────────────────────────────────────────────────────────────

  async saveCustomAgent(agent) {
    try {
      const response = await fetch('/api/custom-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agent)
      });

      if (response.ok) {
        const savedAgent = await response.json();
        this.customAgents.push(savedAgent);
        this.updateAllAgents();
        return savedAgent;
      } else {
        throw new Error('Failed to save custom agent');
      }
    } catch (error) {
      console.error('Error saving custom agent:', error);
      // Fallback: save to localStorage
      agent.id = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      this.customAgents.push(agent);
      this.updateAllAgents();
      localStorage.setItem('customAgents', JSON.stringify(this.customAgents));
      return agent;
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // AGENT UTILITIES
  // ─────────────────────────────────────────────────────────────────

  getAgentById(id) {
    return this.allAgents.find(a => a.id === id);
  }

  getRandomAgent() {
    return this.allAgents[Math.floor(Math.random() * this.allAgents.length)];
  }

  getRandomOpponent(excludeId) {
    const available = this.allAgents.filter(a => a.id !== excludeId);
    return available[Math.floor(Math.random() * available.length)];
  }

  // ─────────────────────────────────────────────────────────────────
  // UI RENDERING
  // ─────────────────────────────────────────────────────────────────

  renderAgentCard(agent, container, onSelect) {
    const card = document.createElement('div');
    card.className = 'agent-selector-card';
    card.dataset.agentId = agent.id;
    
    const totalStats = Object.values(agent.stats).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0) - agent.stats.hp - agent.stats.maxHp;
    
    card.innerHTML = `
      <div class="agent-card-header">
        <div class="agent-card-avatar">${this.getPersonalityEmoji(agent.personality)}</div>
        <div class="agent-card-name">${agent.name}</div>
        <div class="agent-card-type">${agent.personality}</div>
      </div>
      <div class="agent-card-stats">
        <div class="stat-mini"><span>HP</span><span>${agent.stats.maxHp}</span></div>
        <div class="stat-mini"><span>ATK</span><span>${agent.stats.atk}</span></div>
        <div class="stat-mini"><span>DEF</span><span>${agent.stats.def}</span></div>
        <div class="stat-mini"><span>SPD</span><span>${agent.stats.speed}</span></div>
      </div>
      <div class="agent-card-desc">${agent.description || 'A mysterious fighter.'}</div>
      <div class="agent-card-total">Total Power: ${totalStats}</div>
    `;
    
    card.addEventListener('click', () => onSelect(agent));
    container.appendChild(card);
    return card;
  }

  renderAgentSelection(container, onSelect) {
    container.innerHTML = '<h2>Select Your Fighter</h2>';
    
    const grid = document.createElement('div');
    grid.className = 'agent-selection-grid';
    
    this.allAgents.forEach(agent => {
      this.renderAgentCard(agent, grid, onSelect);
    });
    
    container.appendChild(grid);
  }

  // ─────────────────────────────────────────────────────────────────
  // MATCHMAKING
  // ─────────────────────────────────────────────────────────────────

  createRandomMatch() {
    const agent1 = this.getRandomAgent();
    const agent2 = this.getRandomOpponent(agent1.id);
    return { agent1, agent2 };
  }

  // ─────────────────────────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────────────────────────

  getPersonalityEmoji(personality) {
    const emojis = {
      'Berserker': '⚔️',
      'Tank': '🛡️',
      'Trickster': '🎭',
      'Strategist': '🧠',
      'Glass Cannon': '💥',
      'Speedster': '⚡',
      'Balanced': '⚖️'
    };
    return emojis[personality] || '🤖';
  }

  getStatColor(stat) {
    if (stat >= 30) return '#00ffaa';  // Cyan - high
    if (stat >= 20) return '#ffdd00';  // Yellow - medium
    if (stat >= 10) return '#ff8800';  // Orange - low
    return '#ff4466';  // Red - very low
  }
}

// Export for use in other modules
window.AgentSystem = AgentSystem;
