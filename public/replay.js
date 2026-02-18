// ═════════════════════════════════════════════════════════════════════
// REPLAY.JS - Battle Replay System (Recording, Playback, Sharing)
// ═════════════════════════════════════════════════════════════════════

class ReplaySystem {
  constructor(arena) {
    this.arena = arena; // Reference to ArenaController instance
    this.isRecording = false;
    this.isPlaying = false;
    this.replayData = [];
    this.currentFrame = 0;
    this.playbackSpeed = 2; // 2x speed
    this.playbackInterval = null;
    this.isPaused = false;
    
    this.initializeUI();
    this.checkForAutoPlay();
  }

  // ─────────────────────────────────────────────────────────────────
  // RECORDING ENGINE
  // ─────────────────────────────────────────────────────────────────

  startRecording() {
    this.isRecording = true;
    this.replayData = [];
    console.log('📹 Recording started');
  }

  stopRecording() {
    this.isRecording = false;
    this.saveToLocalStorage();
    console.log(`📹 Recording stopped. ${this.replayData.length} actions recorded`);
  }

  recordAction(actionObj) {
    if (!this.isRecording) return;
    
    const frame = {
      round: this.arena.currentRound,
      timestamp: Date.now(),
      ...actionObj
    };
    
    this.replayData.push(frame);
    console.log('📹 Recorded:', frame);
  }

  recordInitialState(agent1, agent2) {
    if (!this.isRecording) return;
    
    const frame = {
      type: 'init',
      round: 0,
      timestamp: Date.now(),
      agent1: JSON.parse(JSON.stringify(agent1)),
      agent2: JSON.parse(JSON.stringify(agent2))
    };
    
    this.replayData.push(frame);
  }

  recordBattleEnd(winner, loser) {
    if (!this.isRecording) return;
    
    const frame = {
      type: 'end',
      round: this.arena.currentRound,
      timestamp: Date.now(),
      winner: winner,
      loser: loser
    };
    
    this.replayData.push(frame);
    this.stopRecording();
  }

  // ─────────────────────────────────────────────────────────────────
  // STORAGE
  // ─────────────────────────────────────────────────────────────────

  saveToLocalStorage() {
    try {
      localStorage.setItem('lastReplay', JSON.stringify(this.replayData));
      console.log('💾 Replay saved to localStorage');
    } catch (e) {
      console.error('Failed to save replay:', e);
    }
  }

  loadFromLocalStorage() {
    try {
      const data = localStorage.getItem('lastReplay');
      if (data) {
        this.replayData = JSON.parse(data);
        console.log(`💾 Loaded replay with ${this.replayData.length} frames`);
        return true;
      }
    } catch (e) {
      console.error('Failed to load replay:', e);
    }
    return false;
  }

  // ─────────────────────────────────────────────────────────────────
  // PLAYBACK ENGINE
  // ─────────────────────────────────────────────────────────────────

  async playReplay(replayDataOverride = null) {
    if (this.isPlaying) return;
    
    const data = replayDataOverride || this.replayData;
    if (!data || data.length === 0) {
      console.error('No replay data to play');
      return;
    }

    this.isPlaying = true;
    this.currentFrame = 0;
    this.isPaused = false;
    this.showReplayUI();

    // Initialize battle state from first frame
    const initFrame = data.find(f => f.type === 'init');
    if (initFrame) {
      await this.arena.startBattle(initFrame.agent1, initFrame.agent2);
      this.currentFrame = 1; // Skip init frame
    }

    // Start playback loop
    this.startPlaybackLoop(data);
  }

  startPlaybackLoop(data) {
    const interval = 1000 / this.playbackSpeed; // ms per action
    
    this.playbackInterval = setInterval(() => {
      if (this.isPaused) return;
      
      if (this.currentFrame >= data.length) {
        this.stopPlayback();
        return;
      }

      const frame = data[this.currentFrame];
      this.playFrame(frame);
      this.updateReplayProgress();
      this.currentFrame++;
    }, interval);
  }

  async playFrame(frame) {
    console.log('▶️ Playing frame:', frame);

    switch (frame.type) {
      case 'init':
        // Already handled in playReplay
        break;

      case 'action':
        // Execute action on arena
        await this.arena.processLocalAction(frame.agentIndex, frame.action);
        
        // Update log
        this.arena.addBattleLog(frame.action, frame.logText || `Action: ${frame.action}`);
        break;

      case 'damage':
        // Show damage animation
        if (this.arena.animator) {
          this.arena.animator.showDamageNumber(
            frame.targetIndex === 1 ? 'agent1' : 'agent2',
            frame.damage,
            frame.isCrit ? 'crit' : 'normal'
          );
        }
        break;

      case 'status':
        // Apply status effect
        if (this.arena.animator) {
          this.arena.animator.showStatusIcon(
            frame.agentIndex === 1 ? 'agent1' : 'agent2',
            frame.statusType,
            frame.icon,
            frame.stacks
          );
        }
        break;

      case 'end':
        this.stopPlayback();
        this.showVictoryModal(frame.winner, frame.loser);
        break;
    }
  }

  stopPlayback() {
    this.isPlaying = false;
    this.isPaused = false;
    
    if (this.playbackInterval) {
      clearInterval(this.playbackInterval);
      this.playbackInterval = null;
    }
    
    console.log('⏹️ Playback stopped');
  }

  pausePlayback() {
    this.isPaused = !this.isPaused;
    this.updatePlayPauseButton();
    console.log(this.isPaused ? '⏸️ Paused' : '▶️ Resumed');
  }

  skipToEnd() {
    if (!this.isPlaying || !this.replayData) return;
    
    this.stopPlayback();
    
    // Jump to final frame
    const endFrame = this.replayData.find(f => f.type === 'end');
    if (endFrame) {
      this.showVictoryModal(endFrame.winner, endFrame.loser);
    }
    
    console.log('⏭️ Skipped to end');
  }

  previousFrame() {
    if (this.currentFrame > 0) {
      this.currentFrame--;
      const frame = this.replayData[this.currentFrame];
      this.playFrame(frame);
      this.updateReplayProgress();
    }
  }

  nextFrame() {
    if (this.currentFrame < this.replayData.length - 1) {
      this.currentFrame++;
      const frame = this.replayData[this.currentFrame];
      this.playFrame(frame);
      this.updateReplayProgress();
    }
  }

  setSpeed(speed) {
    this.playbackSpeed = speed;
    
    // Restart interval with new speed
    if (this.isPlaying && !this.isPaused) {
      clearInterval(this.playbackInterval);
      this.startPlaybackLoop(this.replayData);
    }
    
    this.updateSpeedButtons();
    console.log(`⚡ Speed set to ${speed}x`);
  }

  // ─────────────────────────────────────────────────────────────────
  // URL SHARING (BONUS)
  // ─────────────────────────────────────────────────────────────────

  encodeReplayURL() {
    try {
      const encoded = btoa(JSON.stringify(this.replayData));
      const shareUrl = `${window.location.origin}${window.location.pathname}?replay=${encoded}`;
      return shareUrl;
    } catch (e) {
      console.error('Failed to encode replay:', e);
      return null;
    }
  }

  async copyShareURL() {
    const url = this.encodeReplayURL();
    if (!url) {
      this.showToast('Failed to generate share URL', 'error');
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      this.showToast('Share URL copied to clipboard! 🎬', 'success');
      console.log('📋 Share URL copied:', url);
    } catch (e) {
      console.error('Failed to copy URL:', e);
      this.showToast('Failed to copy URL', 'error');
    }
  }

  checkForAutoPlay() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('replay')) {
      try {
        const encoded = urlParams.get('replay');
        const replayData = JSON.parse(atob(encoded));
        console.log('🎬 Auto-playing shared replay');
        
        // Wait for arena to be ready
        setTimeout(() => {
          this.playReplay(replayData);
        }, 1000);
      } catch (e) {
        console.error('Failed to decode replay URL:', e);
        this.showToast('Invalid replay URL', 'error');
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // UI CONTROLS
  // ─────────────────────────────────────────────────────────────────

  initializeUI() {
    // Add replay controls to DOM
    const controlsHTML = `
      <div id="replayControls" class="replay-controls hidden">
        <div class="replay-mode-indicator">
          <span class="replay-icon">🎬</span>
          <span class="replay-text">REPLAY MODE</span>
        </div>
        
        <div class="replay-progress">
          <span id="replayRound">Round: 1/1</span>
          <div class="progress-bar">
            <div id="replayProgressBar" class="progress-fill"></div>
          </div>
          <span id="replayFrame">Frame: 0/0</span>
        </div>
        
        <div class="replay-controls-grid">
          <button id="replayPrev" class="replay-btn" title="Previous Frame">
            ◀◀
          </button>
          <button id="replayPlayPause" class="replay-btn replay-btn-primary" title="Play/Pause">
            ▶️
          </button>
          <button id="replayNext" class="replay-btn" title="Next Frame">
            ▶▶
          </button>
          <button id="replaySkip" class="replay-btn" title="Skip to End">
            ⏭️
          </button>
        </div>
        
        <div class="replay-speed-controls">
          <span class="speed-label">Speed:</span>
          <button class="speed-btn" data-speed="1">1x</button>
          <button class="speed-btn active" data-speed="2">2x</button>
          <button class="speed-btn" data-speed="4">4x</button>
        </div>
        
        <button id="replayShare" class="replay-btn replay-btn-share" title="Copy Share Link">
          🔗 Share
        </button>
        
        <button id="replayClose" class="replay-btn replay-btn-close" title="Exit Replay">
          ✕
        </button>
      </div>
      
      <button id="watchReplayBtn" class="watch-replay-btn hidden">
        🎬 Watch Last Replay
      </button>
    `;

    document.body.insertAdjacentHTML('beforeend', controlsHTML);
    this.bindUIEvents();
  }

  bindUIEvents() {
    // Replay controls
    document.getElementById('replayPlayPause')?.addEventListener('click', () => this.pausePlayback());
    document.getElementById('replayPrev')?.addEventListener('click', () => this.previousFrame());
    document.getElementById('replayNext')?.addEventListener('click', () => this.nextFrame());
    document.getElementById('replaySkip')?.addEventListener('click', () => this.skipToEnd());
    document.getElementById('replayShare')?.addEventListener('click', () => this.copyShareURL());
    document.getElementById('replayClose')?.addEventListener('click', () => this.hideReplayUI());

    // Speed controls
    document.querySelectorAll('.speed-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const speed = parseFloat(e.target.dataset.speed);
        this.setSpeed(speed);
      });
    });

    // Watch replay button
    document.getElementById('watchReplayBtn')?.addEventListener('click', () => {
      if (this.loadFromLocalStorage()) {
        this.playReplay();
      } else {
        this.showToast('No replay available', 'error');
      }
    });
  }

  showReplayUI() {
    document.getElementById('replayControls')?.classList.remove('hidden');
    
    // Hide action buttons during replay
    document.querySelectorAll('.action-btn').forEach(btn => {
      btn.disabled = true;
      btn.style.opacity = '0.5';
    });
  }

  hideReplayUI() {
    this.stopPlayback();
    document.getElementById('replayControls')?.classList.add('hidden');
    
    // Re-enable action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
      btn.disabled = false;
      btn.style.opacity = '1';
    });
  }

  showWatchReplayButton() {
    document.getElementById('watchReplayBtn')?.classList.remove('hidden');
  }

  hideWatchReplayButton() {
    document.getElementById('watchReplayBtn')?.classList.add('hidden');
  }

  updateReplayProgress() {
    const total = this.replayData.length;
    const current = this.currentFrame;
    const percentage = (current / total) * 100;
    
    document.getElementById('replayProgressBar').style.width = `${percentage}%`;
    document.getElementById('replayFrame').textContent = `Frame: ${current}/${total}`;
    
    const currentRound = this.replayData[current]?.round || 0;
    const maxRound = Math.max(...this.replayData.map(f => f.round || 0));
    document.getElementById('replayRound').textContent = `Round: ${currentRound}/${maxRound}`;
  }

  updatePlayPauseButton() {
    const btn = document.getElementById('replayPlayPause');
    if (btn) {
      btn.textContent = this.isPaused ? '▶️' : '⏸️';
    }
  }

  updateSpeedButtons() {
    document.querySelectorAll('.speed-btn').forEach(btn => {
      const speed = parseFloat(btn.dataset.speed);
      if (speed === this.playbackSpeed) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  showVictoryModal(winner, loser) {
    // Use existing victory modal or create toast
    this.showToast(`${winner} WINS! 🏆`, 'success');
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// ─────────────────────────────────────────────────────────────────
// INTEGRATION WITH ARENA
// ─────────────────────────────────────────────────────────────────

// Extend ArenaController to integrate replay system
if (typeof ArenaController !== 'undefined') {
  const originalStartBattle = ArenaController.prototype.startBattle;
  ArenaController.prototype.startBattle = async function(agent1, agent2) {
    // Start recording
    if (this.replaySystem) {
      this.replaySystem.startRecording();
      this.replaySystem.recordInitialState(agent1, agent2);
      this.replaySystem.hideWatchReplayButton();
    }
    
    return await originalStartBattle.call(this, agent1, agent2);
  };

  const originalPerformAction = ArenaController.prototype.performAction;
  ArenaController.prototype.performAction = async function(agentIndex, action) {
    const result = await originalPerformAction.call(this, agentIndex, action);
    
    // Record action
    if (this.replaySystem && this.replaySystem.isRecording) {
      this.replaySystem.recordAction({
        type: 'action',
        agentIndex,
        action,
        logText: `Agent ${agentIndex} used ${action}`
      });
    }
    
    return result;
  };

  // Hook into battle end
  const originalCheckVictory = ArenaController.prototype.checkVictory;
  ArenaController.prototype.checkVictory = function() {
    const result = originalCheckVictory.call(this);
    
    if (result && this.replaySystem && this.replaySystem.isRecording) {
      const winner = this.battleState.agent1.hp > 0 ? this.battleState.agent1.name : this.battleState.agent2.name;
      const loser = this.battleState.agent1.hp <= 0 ? this.battleState.agent1.name : this.battleState.agent2.name;
      
      this.replaySystem.recordBattleEnd(winner, loser);
      this.replaySystem.showWatchReplayButton();
    }
    
    return result;
  };
}

console.log('🎬 Replay System loaded');
