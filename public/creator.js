// ═════════════════════════════════════════════════════════════════════
// CREATOR.JS - Custom AI Fighter Creator
// ═════════════════════════════════════════════════════════════════════

class AgentCreator {
  constructor(agentSystem) {
    this.agentSystem = agentSystem;
    this.totalPoints = 100;
    this.stats = {
      hp: 20,
      atk: 20,
      def: 20,
      speed: 20,
      luck: 10,
      special: 10
    };
    this.selectedAbilities = [];
    this.maxAbilities = 4; // 3 regular + 1 special
    
    this.personalities = [
      'Berserker', 'Tank', 'Trickster', 'Strategist', 
      'Glass Cannon', 'Speedster', 'Balanced'
    ];
    
    this.abilityPool = [
      // Attack abilities
      { name: 'Fury Strike', type: 'attack', description: 'Brutal frontal assault' },
      { name: 'Quick Attack', type: 'attack', description: 'Swift precise strike' },
      { name: 'Chaos Bolt', type: 'attack', description: 'Unpredictable damage' },
      { name: 'Calculated Strike', type: 'attack', description: 'Precise strategic hit' },
      { name: 'Snipe', type: 'attack', description: 'Long-range precision' },
      
      // Defense abilities
      { name: 'Shield Bash', type: 'defense', description: 'Defensive counter' },
      { name: 'Parry', type: 'defense', description: 'Deflect incoming damage' },
      { name: 'Counter', type: 'defense', description: 'Reflect damage back' },
      { name: 'Dodge Roll', type: 'utility', description: 'Evade with agility' },
      
      // Utility abilities
      { name: 'Bloodlust', type: 'buff', description: 'Gain power from damage' },
      { name: 'Analyze', type: 'utility', description: 'Study opponent weaknesses' },
      { name: 'Lucky Shot', type: 'attack', description: 'High crit chance' },
      { name: 'Overload', type: 'attack', description: 'Massive damage, self-harm' },
      
      // Special abilities (one required)
      { name: 'Special: Berserk Rage', type: 'special', description: '3x damage, lose defense' },
      { name: 'Special: Iron Fortress', type: 'special', description: 'Massive defense boost' },
      { name: 'Special: Wild Card', type: 'special', description: 'Random powerful effect' },
      { name: 'Special: Master Plan', type: 'special', description: 'Perfect calculated strike' },
      { name: 'Special: One Shot', type: 'special', description: 'Delete enemy HP bar' },
      { name: 'Special: Time Warp', type: 'special', description: 'Extra turn' }
    ];
  }

  // ─────────────────────────────────────────────────────────────────
  // RENDER CREATOR UI
  // ─────────────────────────────────────────────────────────────────

  render(container) {
    container.innerHTML = `
      <div class="creator-container">
        <div class="creator-header">
          <h1>⚔️ Create Your Fighter ⚔️</h1>
          <button id="closeCreator" class="close-btn">✕</button>
        </div>

        <div class="creator-content">
          <!-- Left: Form -->
          <div class="creator-form">
            <!-- Name Input -->
            <div class="form-section">
              <label class="form-label">Fighter Name</label>
              <input 
                type="text" 
                id="agentName" 
                class="form-input" 
                placeholder="Enter a legendary name..."
                maxlength="30"
              />
            </div>

            <!-- Personality Dropdown -->
            <div class="form-section">
              <label class="form-label">Personality Type</label>
              <select id="agentPersonality" class="form-select">
                ${this.personalities.map(p => `<option value="${p}">${p}</option>`).join('')}
              </select>
              <div class="personality-hint" id="personalityHint"></div>
            </div>

            <!-- Stat Sliders -->
            <div class="form-section">
              <label class="form-label">Stats Distribution (${this.totalPoints} points total)</label>
              <div class="stat-sliders">
                ${this.renderStatSlider('hp', 'HP', '❤️')}
                ${this.renderStatSlider('atk', 'Attack', '⚔️')}
                ${this.renderStatSlider('def', 'Defense', '🛡️')}
                ${this.renderStatSlider('speed', 'Speed', '⚡')}
                ${this.renderStatSlider('luck', 'Luck', '🍀')}
                ${this.renderStatSlider('special', 'Special', '✨')}
              </div>
              <div class="points-remaining">
                Points Remaining: <span id="pointsRemaining">${this.calculateRemaining()}</span>
              </div>
            </div>

            <!-- Ability Selection -->
            <div class="form-section">
              <label class="form-label">Select Abilities (4 total, 1 must be Special)</label>
              <div class="ability-pool" id="abilityPool"></div>
              <div class="selected-abilities" id="selectedAbilities">
                <div class="selected-abilities-hint">Click abilities below to select</div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="form-actions">
              <button id="randomizeBtn" class="action-btn btn-secondary">🎲 Randomize</button>
              <button id="createBtn" class="action-btn btn-primary">✨ Create Fighter</button>
            </div>
          </div>

          <!-- Right: Preview Card -->
          <div class="creator-preview">
            <h3>Fighter Preview</h3>
            <div id="previewCard" class="preview-card"></div>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
    this.renderAbilityPool();
    this.updatePreview();
    this.updatePersonalityHint();
  }

  renderStatSlider(key, label, emoji) {
    return `
      <div class="stat-slider-row">
        <div class="stat-slider-label">
          <span>${emoji} ${label}</span>
          <span class="stat-value-display" id="${key}Value">${this.stats[key]}</span>
        </div>
        <input 
          type="range" 
          class="stat-slider" 
          id="${key}Slider" 
          min="5" 
          max="50" 
          value="${this.stats[key]}" 
          data-stat="${key}"
        />
      </div>
    `;
  }

  // ─────────────────────────────────────────────────────────────────
  // EVENT LISTENERS
  // ─────────────────────────────────────────────────────────────────

  attachEventListeners() {
    // Stat sliders
    document.querySelectorAll('.stat-slider').forEach(slider => {
      slider.addEventListener('input', (e) => this.handleStatChange(e));
    });

    // Name input
    document.getElementById('agentName')?.addEventListener('input', () => this.updatePreview());
    
    // Personality dropdown
    document.getElementById('agentPersonality')?.addEventListener('change', () => {
      this.updatePersonalityHint();
      this.updatePreview();
    });

    // Create button
    document.getElementById('createBtn')?.addEventListener('click', () => this.createAgent());
    
    // Randomize button
    document.getElementById('randomizeBtn')?.addEventListener('click', () => this.randomize());
    
    // Close button
    document.getElementById('closeCreator')?.addEventListener('click', () => this.close());
  }

  handleStatChange(e) {
    const stat = e.target.dataset.stat;
    const value = parseInt(e.target.value);
    
    // Calculate total excluding this stat
    const otherStats = Object.keys(this.stats)
      .filter(key => key !== stat)
      .reduce((sum, key) => sum + this.stats[key], 0);
    
    const newTotal = otherStats + value;
    
    // Only allow if under point limit
    if (newTotal <= this.totalPoints) {
      this.stats[stat] = value;
      document.getElementById(`${stat}Value`).textContent = value;
      document.getElementById('pointsRemaining').textContent = this.calculateRemaining();
      this.updatePreview();
    } else {
      // Reset slider if over limit
      e.target.value = this.stats[stat];
    }
  }

  calculateRemaining() {
    const total = Object.values(this.stats).reduce((sum, val) => sum + val, 0);
    return this.totalPoints - total;
  }

  // ─────────────────────────────────────────────────────────────────
  // ABILITY SELECTION
  // ─────────────────────────────────────────────────────────────────

  renderAbilityPool() {
    const pool = document.getElementById('abilityPool');
    if (!pool) return;

    pool.innerHTML = this.abilityPool.map(ability => `
      <div class="ability-card ${this.selectedAbilities.includes(ability.name) ? 'selected' : ''}" 
           data-ability="${ability.name}">
        <div class="ability-name">${ability.name}</div>
        <div class="ability-type ${ability.type}">${ability.type}</div>
        <div class="ability-desc">${ability.description}</div>
      </div>
    `).join('');

    // Add click handlers
    pool.querySelectorAll('.ability-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const abilityName = e.currentTarget.dataset.ability;
        this.toggleAbility(abilityName);
      });
    });
  }

  toggleAbility(name) {
    const ability = this.abilityPool.find(a => a.name === name);
    const index = this.selectedAbilities.indexOf(name);

    if (index > -1) {
      // Deselect
      this.selectedAbilities.splice(index, 1);
    } else {
      // Select (if under limit)
      if (this.selectedAbilities.length < this.maxAbilities) {
        this.selectedAbilities.push(name);
      } else {
        alert(`You can only select ${this.maxAbilities} abilities!`);
        return;
      }
    }

    this.renderAbilityPool();
    this.updateSelectedAbilities();
    this.updatePreview();
  }

  updateSelectedAbilities() {
    const container = document.getElementById('selectedAbilities');
    if (!container) return;

    if (this.selectedAbilities.length === 0) {
      container.innerHTML = '<div class="selected-abilities-hint">Click abilities above to select</div>';
      return;
    }

    container.innerHTML = `
      <div class="selected-list">
        ${this.selectedAbilities.map(name => `
          <div class="selected-ability-tag">${name}</div>
        `).join('')}
      </div>
    `;
  }

  // ─────────────────────────────────────────────────────────────────
  // PREVIEW
  // ─────────────────────────────────────────────────────────────────

  updatePreview() {
    const preview = document.getElementById('previewCard');
    if (!preview) return;

    const name = document.getElementById('agentName')?.value || 'Unnamed Fighter';
    const personality = document.getElementById('agentPersonality')?.value || 'Balanced';
    const totalPower = Object.values(this.stats).reduce((sum, val) => sum + val, 0);
    const hasSpecial = this.selectedAbilities.some(a => a.startsWith('Special:'));

    preview.innerHTML = `
      <div class="preview-agent-card">
        <div class="preview-header">
          <div class="preview-avatar">${this.getPersonalityEmoji(personality)}</div>
          <div class="preview-name">${name}</div>
          <div class="preview-personality">${personality}</div>
        </div>
        <div class="preview-stats">
          ${Object.entries(this.stats).map(([key, val]) => `
            <div class="preview-stat">
              <span class="preview-stat-label">${key.toUpperCase()}</span>
              <span class="preview-stat-value">${val}</span>
            </div>
          `).join('')}
        </div>
        <div class="preview-abilities">
          ${this.selectedAbilities.length > 0 
            ? this.selectedAbilities.map(a => `<div class="preview-ability">${a}</div>`).join('')
            : '<div class="preview-no-abilities">No abilities selected</div>'}
        </div>
        <div class="preview-total">Total Power: ${totalPower}</div>
        ${!hasSpecial ? '<div class="preview-warning">⚠️ Must select 1 Special ability</div>' : ''}
      </div>
    `;
  }

  updatePersonalityHint() {
    const hints = {
      'Berserker': '💪 High ATK, low DEF. All-out offense!',
      'Tank': '🛡️ High HP & DEF, low SPD. Outlast everyone.',
      'Trickster': '🎭 High LUCK & SPD. Crits and dodges.',
      'Strategist': '🧠 Balanced with high SPECIAL. Calculated wins.',
      'Glass Cannon': '💥 Max ATK, min DEF. One-shot or be one-shot.',
      'Speedster': '⚡ High SPD & LUCK. Strike first, strike fast.',
      'Balanced': '⚖️ Equal stats. Jack of all trades.'
    };
    
    const personality = document.getElementById('agentPersonality')?.value;
    const hint = document.getElementById('personalityHint');
    if (hint && personality) {
      hint.textContent = hints[personality] || '';
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // CREATE AGENT
  // ─────────────────────────────────────────────────────────────────

  async createAgent() {
    const name = document.getElementById('agentName')?.value.trim();
    const personality = document.getElementById('agentPersonality')?.value;

    // Validation
    if (!name) {
      alert('Please enter a fighter name!');
      return;
    }

    if (this.selectedAbilities.length !== this.maxAbilities) {
      alert(`Please select exactly ${this.maxAbilities} abilities!`);
      return;
    }

    const hasSpecial = this.selectedAbilities.some(a => a.startsWith('Special:'));
    if (!hasSpecial) {
      alert('You must select 1 Special ability!');
      return;
    }

    // Create agent object
    const agent = {
      id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      personality,
      stats: {
        hp: this.stats.hp * 10, // Scale up HP
        maxHp: this.stats.hp * 10,
        atk: this.stats.atk,
        def: this.stats.def,
        speed: this.stats.speed,
        luck: this.stats.luck,
        special: this.stats.special
      },
      abilities: this.selectedAbilities,
      mood: 'eager',
      specialMeter: 0,
      description: `A custom ${personality} fighter created by the arena master.`,
      lore: `${name} was forged in the heat of battle. Their legend begins now.`
    };

    try {
      await this.agentSystem.saveCustomAgent(agent);
      alert(`✨ ${name} has been created! Ready for battle!`);
      this.close();
      
      // Trigger refresh of agent list if available
      if (window.refreshAgentList) {
        window.refreshAgentList();
      }
    } catch (error) {
      alert('Failed to create fighter. Please try again.');
      console.error(error);
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // RANDOMIZE
  // ─────────────────────────────────────────────────────────────────

  randomize() {
    // Random name
    const prefixes = ['Shadow', 'Iron', 'Storm', 'Chaos', 'Mystic', 'Crimson', 'Golden', 'Dark'];
    const suffixes = ['Fang', 'Blade', 'Fist', 'Eye', 'Heart', 'Soul', 'Warrior', 'Knight'];
    const randomName = `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
    document.getElementById('agentName').value = randomName;

    // Random personality
    const randomPersonality = this.personalities[Math.floor(Math.random() * this.personalities.length)];
    document.getElementById('agentPersonality').value = randomPersonality;

    // Random stats (but still total 100)
    let remaining = this.totalPoints;
    const statKeys = Object.keys(this.stats);
    statKeys.forEach((key, i) => {
      if (i === statKeys.length - 1) {
        // Last stat gets remaining points
        this.stats[key] = Math.min(50, Math.max(5, remaining));
      } else {
        const max = Math.min(50, remaining - (statKeys.length - i - 1) * 5);
        this.stats[key] = Math.floor(Math.random() * (max - 5)) + 5;
        remaining -= this.stats[key];
      }
      
      const slider = document.getElementById(`${key}Slider`);
      if (slider) slider.value = this.stats[key];
      document.getElementById(`${key}Value`).textContent = this.stats[key];
    });

    // Random abilities (ensure 1 special)
    this.selectedAbilities = [];
    const specials = this.abilityPool.filter(a => a.type === 'special');
    const nonSpecials = this.abilityPool.filter(a => a.type !== 'special');
    
    // Pick 1 random special
    this.selectedAbilities.push(specials[Math.floor(Math.random() * specials.length)].name);
    
    // Pick 3 random non-specials
    const shuffled = nonSpecials.sort(() => Math.random() - 0.5);
    for (let i = 0; i < 3; i++) {
      this.selectedAbilities.push(shuffled[i].name);
    }

    document.getElementById('pointsRemaining').textContent = this.calculateRemaining();
    this.updatePersonalityHint();
    this.renderAbilityPool();
    this.updateSelectedAbilities();
    this.updatePreview();
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

  close() {
    const container = document.querySelector('.creator-container');
    if (container) container.remove();
  }
}

// Export for use in other modules
window.AgentCreator = AgentCreator;
