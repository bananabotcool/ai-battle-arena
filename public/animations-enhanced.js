/**
 * ═══════════════════════════════════════════════════════════════════
 * ANIMATION ENHANCEMENTS - Professional Visual Effects
 * ═══════════════════════════════════════════════════════════════════
 * Enhanced animation triggers and timing for polished feel
 */

// ═════════════════════════════════════════════════════════════════
// 1. HP BAR ANIMATION CONTROLLER
// ═════════════════════════════════════════════════════════════════

class HPBarAnimator {
  static updateHP(agentId, currentHP, maxHP, isDamage = false, isHeal = false) {
    const hpBar = document.getElementById(`agent${agentId}HPBar`);
    const hpValue = document.getElementById(`agent${agentId}HP`);
    const container = hpBar?.closest('.hp-bar-container');
    
    if (!hpBar || !hpValue) return;
    
    const percentage = (currentHP / maxHP) * 100;
    
    // Update HP value with smooth transition
    hpValue.textContent = `${currentHP} / ${maxHP}`;
    
    // Remove existing classes
    hpBar.classList.remove('critical', 'warning', 'caution', 'healthy', 'hit', 'healing');
    container?.classList.remove('damaged');
    
    // Apply color class based on percentage
    if (percentage <= 25) {
      hpBar.classList.add('critical');
    } else if (percentage <= 50) {
      hpBar.classList.add('warning');
    } else if (percentage <= 75) {
      hpBar.classList.add('caution');
    } else {
      hpBar.classList.add('healthy');
    }
    
    // Trigger damage or heal animation
    if (isDamage) {
      hpBar.classList.add('hit');
      container?.classList.add('damaged');
      setTimeout(() => {
        hpBar.classList.remove('hit');
        container?.classList.remove('damaged');
      }, 300);
    }
    
    if (isHeal) {
      hpBar.classList.add('healing');
      setTimeout(() => hpBar.classList.remove('healing'), 800);
    }
    
    // Smooth width transition
    requestAnimationFrame(() => {
      hpBar.style.width = `${Math.max(0, percentage)}%`;
    });
    
    // Update HP value color
    hpValue.style.color = this.getHPColor(percentage);
  }
  
  static getHPColor(percentage) {
    if (percentage <= 25) return '#ff0044';
    if (percentage <= 50) return '#ff8800';
    if (percentage <= 75) return '#ffdd00';
    return '#00ff88';
  }
}

// ═════════════════════════════════════════════════════════════════
// 2. STATUS EFFECT ANIMATOR
// ═════════════════════════════════════════════════════════════════

class StatusEffectAnimator {
  static addStatusIcon(agentId, effectType, icon, stacks = 0) {
    const card = document.getElementById(`agent${agentId}Card`);
    if (!card) return;
    
    let container = card.querySelector('.status-icons-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'status-icons-container';
      card.querySelector('.hp-section')?.insertAdjacentElement('afterend', container);
    }
    
    // Check if already exists
    let existingIcon = container.querySelector(`[data-effect="${effectType}"]`);
    if (existingIcon) {
      this.updateStackCount(existingIcon, stacks);
      return;
    }
    
    // Create new status icon
    const statusIcon = document.createElement('div');
    statusIcon.className = `status-icon status-${effectType}`;
    statusIcon.setAttribute('data-effect', effectType);
    statusIcon.innerHTML = icon;
    
    if (stacks > 0) {
      const badge = document.createElement('span');
      badge.className = 'stack-badge';
      badge.textContent = `x${stacks}`;
      statusIcon.appendChild(badge);
    }
    
    container.appendChild(statusIcon);
    
    // Trigger entrance animation
    requestAnimationFrame(() => {
      statusIcon.classList.add('active');
    });
  }
  
  static removeStatusIcon(agentId, effectType) {
    const card = document.getElementById(`agent${agentId}Card`);
    const container = card?.querySelector('.status-icons-container');
    const icon = container?.querySelector(`[data-effect="${effectType}"]`);
    
    if (!icon) return;
    
    icon.classList.remove('active');
    icon.classList.add('fade-out');
    
    setTimeout(() => {
      icon.remove();
      if (container && container.children.length === 0) {
        container.remove();
      }
    }, 400);
  }
  
  static updateStackCount(icon, stacks) {
    const badge = icon.querySelector('.stack-badge');
    if (badge && stacks > 0) {
      badge.textContent = `x${stacks}`;
      badge.classList.add('pulse-once');
      setTimeout(() => badge.classList.remove('pulse-once'), 400);
    }
  }
}

// ═════════════════════════════════════════════════════════════════
// 3. CRITICAL HIT ANIMATOR
// ═════════════════════════════════════════════════════════════════

class CriticalHitAnimator {
  static trigger(agentId) {
    // Screen shake
    document.body.classList.add('critical-shake');
    setTimeout(() => document.body.classList.remove('critical-shake'), 500);
    
    // Critical text overlay
    const critText = document.createElement('div');
    critText.className = 'critical-text';
    critText.textContent = 'CRITICAL!';
    document.body.appendChild(critText);
    
    setTimeout(() => critText.remove(), 1200);
    
    // Slow-mo effect
    document.body.classList.add('slow-mo');
    setTimeout(() => document.body.classList.remove('slow-mo'), 800);
    
    // Particle burst
    this.createParticleBurst(agentId);
  }
  
  static createParticleBurst(agentId) {
    const card = document.getElementById(`agent${agentId}Card`);
    if (!card) return;
    
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 25; i++) {
      const particle = document.createElement('div');
      particle.className = 'crit-particle';
      particle.textContent = ['✨', '💥', '⚡', '🔥'][Math.floor(Math.random() * 4)];
      
      const angle = (Math.PI * 2 * i) / 25;
      const distance = 150 + Math.random() * 100;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      
      particle.style.cssText = `
        position: fixed;
        left: ${centerX}px;
        top: ${centerY}px;
        --tx: ${tx}px;
        --ty: ${ty}px;
        z-index: 9999;
      `;
      
      document.body.appendChild(particle);
      
      setTimeout(() => particle.remove(), 1200);
    }
  }
}

// ═════════════════════════════════════════════════════════════════
// 4. BATTLE LOG ANIMATOR
// ═════════════════════════════════════════════════════════════════

class BattleLogAnimator {
  static addEntry(type, icon, text, isCritical = false, isSpecial = false) {
    const log = document.getElementById('battleLog');
    if (!log) return;
    
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    
    if (isCritical) entry.classList.add('critical');
    if (isSpecial) entry.classList.add('special');
    
    entry.innerHTML = `
      <span class="log-icon">${icon}</span>
      <span class="log-text">${text}</span>
    `;
    
    log.appendChild(entry);
    
    // Auto-scroll to bottom
    requestAnimationFrame(() => {
      log.scrollTop = log.scrollHeight;
    });
  }
  
  static clear() {
    const log = document.getElementById('battleLog');
    if (!log) return;
    
    const entries = log.querySelectorAll('.log-entry');
    entries.forEach((entry, i) => {
      setTimeout(() => {
        entry.style.animation = 'logSlideOut 0.3s ease forwards';
        setTimeout(() => entry.remove(), 300);
      }, i * 50);
    });
  }
}

// ═════════════════════════════════════════════════════════════════
// 5. SPECIAL BUTTON ANIMATOR
// ═════════════════════════════════════════════════════════════════

class SpecialButtonAnimator {
  static updateCooldown(agentId, cooldown) {
    const buttons = document.querySelectorAll(`[data-agent="${agentId}"][data-action="special"]`);
    
    buttons.forEach(button => {
      const existingNumber = button.querySelector('.cooldown-number');
      if (existingNumber) existingNumber.remove();
      
      button.classList.remove('on-cooldown', 'ready');
      
      if (cooldown > 0) {
        button.classList.add('on-cooldown');
        button.disabled = true;
        
        const cooldownNumber = document.createElement('div');
        cooldownNumber.className = 'cooldown-number';
        cooldownNumber.textContent = cooldown;
        button.appendChild(cooldownNumber);
      } else {
        button.classList.add('ready');
        button.disabled = false;
      }
    });
  }
}

// ═════════════════════════════════════════════════════════════════
// 6. TOURNAMENT BRACKET ANIMATOR
// ═════════════════════════════════════════════════════════════════

class TournamentAnimator {
  static highlightWinner(cardElement) {
    if (!cardElement) return;
    
    cardElement.classList.add('winner');
    
    // Flash effect
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        cardElement.style.transform = 'scale(1.1)';
        setTimeout(() => {
          cardElement.style.transform = '';
        }, 150);
      }, i * 300);
    }
  }
  
  static drawBracketLine(svgLine) {
    if (!svgLine) return;
    svgLine.classList.add('bracket-line');
  }
  
  static announceRound(roundNumber) {
    const announcement = document.createElement('div');
    announcement.className = 'round-announcement';
    announcement.innerHTML = `
      <h2 style="font-family: 'Orbitron', sans-serif; font-size: 4rem; color: #ffea00; text-shadow: 0 0 30px #ffea00;">
        ROUND ${roundNumber}
      </h2>
    `;
    announcement.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10000;
      text-align: center;
    `;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      announcement.style.animation = 'roundAnnounce 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) reverse';
      setTimeout(() => announcement.remove(), 1500);
    }, 2000);
  }
}

// ═════════════════════════════════════════════════════════════════
// 7. DAMAGE NUMBER ANIMATOR
// ═════════════════════════════════════════════════════════════════

class DamageNumberAnimator {
  static show(agentId, damage, isCritical = false) {
    const card = document.getElementById(`agent${agentId}Card`);
    if (!card) return;
    
    const rect = card.getBoundingClientRect();
    const x = rect.left + rect.width / 2 + (Math.random() - 0.5) * 60;
    const y = rect.top + rect.height / 2;
    
    const damageEl = document.createElement('div');
    damageEl.className = `damage-number ${isCritical ? 'critical' : ''}`;
    damageEl.textContent = `-${damage}`;
    damageEl.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      font-family: 'Orbitron', sans-serif;
      font-size: ${isCritical ? '3.5rem' : '2.5rem'};
      font-weight: 900;
      color: ${isCritical ? '#ff006e' : '#ff0044'};
      text-shadow: 0 0 10px currentColor, 0 0 20px currentColor;
      pointer-events: none;
      z-index: 9999;
    `;
    
    document.body.appendChild(damageEl);
    
    setTimeout(() => damageEl.remove(), isCritical ? 1800 : 1500);
  }
  
  static showHeal(agentId, amount) {
    const card = document.getElementById(`agent${agentId}Card`);
    if (!card) return;
    
    const rect = card.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    const healEl = document.createElement('div');
    healEl.className = 'damage-number';
    healEl.textContent = `+${amount}`;
    healEl.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      font-family: 'Orbitron', sans-serif;
      font-size: 2.5rem;
      font-weight: 900;
      color: #00ff88;
      text-shadow: 0 0 10px #00ff88, 0 0 20px #00ff88;
      pointer-events: none;
      z-index: 9999;
    `;
    
    document.body.appendChild(healEl);
    
    setTimeout(() => healEl.remove(), 1500);
  }
}

// ═════════════════════════════════════════════════════════════════
// 8. MOOD EMOJI ANIMATOR
// ═════════════════════════════════════════════════════════════════

class MoodAnimator {
  static changeMood(agentId, newMood) {
    const moodEl = document.getElementById(`agent${agentId}Mood`);
    if (!moodEl) return;
    
    moodEl.classList.add('changed');
    moodEl.textContent = newMood;
    
    setTimeout(() => moodEl.classList.remove('changed'), 600);
  }
}

// ═════════════════════════════════════════════════════════════════
// 9. LOADING STATE ANIMATOR
// ═════════════════════════════════════════════════════════════════

class LoadingAnimator {
  static show(element) {
    element?.classList.add('loading');
  }
  
  static hide(element) {
    element?.classList.remove('loading');
  }
}

// ═════════════════════════════════════════════════════════════════
// GLOBAL ANIMATION MANAGER
// ═════════════════════════════════════════════════════════════════

class AnimationManager {
  static init() {
    // Apply smooth transitions to all interactive elements
    this.enhanceButtons();
    this.setupHoverEffects();
    this.enableHardwareAcceleration();
    
    console.log('✨ Animation enhancements loaded');
  }
  
  static enhanceButtons() {
    document.querySelectorAll('button, .btn, .action-btn').forEach(btn => {
      btn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
      });
      
      btn.addEventListener('mouseleave', function() {
        this.style.transform = '';
      });
    });
  }
  
  static setupHoverEffects() {
    document.querySelectorAll('.agent-card, .fighter-card').forEach(card => {
      card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px)';
      });
      
      card.addEventListener('mouseleave', function() {
        this.style.transform = '';
      });
    });
  }
  
  static enableHardwareAcceleration() {
    const elements = [
      '.hp-bar',
      '.status-icon',
      '.damage-number',
      '.crit-particle',
      '.log-entry',
      '.special-btn',
      '.fighter-card'
    ];
    
    elements.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.style.transform = 'translateZ(0)';
      });
    });
  }
}

// ═════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═════════════════════════════════════════════════════════════════

// Helper to trigger animation with callback
function animateWithCallback(element, animationName, duration, callback) {
  if (!element) return;
  
  element.style.animation = `${animationName} ${duration}ms`;
  
  setTimeout(() => {
    element.style.animation = '';
    if (callback) callback();
  }, duration);
}

// Helper to add temporary class
function addTemporaryClass(element, className, duration) {
  if (!element) return;
  
  element.classList.add(className);
  setTimeout(() => element.classList.remove(className), duration);
}

// ═════════════════════════════════════════════════════════════════
// AUTO-INITIALIZATION
// ═════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  AnimationManager.init();
});

// ═════════════════════════════════════════════════════════════════
// EXPORTS
// ═════════════════════════════════════════════════════════════════

if (typeof window !== 'undefined') {
  window.Animators = {
    HPBar: HPBarAnimator,
    StatusEffect: StatusEffectAnimator,
    CriticalHit: CriticalHitAnimator,
    BattleLog: BattleLogAnimator,
    SpecialButton: SpecialButtonAnimator,
    Tournament: TournamentAnimator,
    DamageNumber: DamageNumberAnimator,
    Mood: MoodAnimator,
    Loading: LoadingAnimator
  };
}

console.log('✨ Animation enhancements ready');
