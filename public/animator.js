/**
 * Battle Animator - Status Effect Visual System
 * Handles animated status icons above HP bars
 */

// ────────────────────────────────────────────────────────────────────
// STATUS ICON MANAGEMENT
// ────────────────────────────────────────────────────────────────────

/**
 * Show status effect icon above fighter
 * @param {string} fighterId - 'agent1' or 'agent2'
 * @param {string} effectType - 'burn', 'freeze', 'poison', etc.
 * @param {string} icon - Emoji icon
 * @param {number} stacks - Stack count for stackable effects
 */
function showStatusIcon(fighterId, effectType, icon, stacks = 0) {
  const combatant = document.querySelector(`#${fighterId}Name`).closest('.combatant');
  if (!combatant) return;
  
  // Check if status container exists, create if not
  let statusContainer = combatant.querySelector('.status-icons-container');
  if (!statusContainer) {
    statusContainer = document.createElement('div');
    statusContainer.className = 'status-icons-container';
    combatant.insertBefore(statusContainer, combatant.firstChild);
  }
  
  // Check if effect already has an icon
  let existingIcon = statusContainer.querySelector(`[data-effect="${effectType}"]`);
  
  if (existingIcon) {
    // Update stack count if stackable
    if (stacks > 0) {
      const stackBadge = existingIcon.querySelector('.stack-badge');
      if (stackBadge) {
        stackBadge.textContent = `x${stacks}`;
        stackBadge.classList.add('pulse-once');
        setTimeout(() => stackBadge.classList.remove('pulse-once'), 500);
      }
    }
    return;
  }
  
  // Create new icon
  const statusIcon = document.createElement('div');
  statusIcon.className = `status-icon status-${effectType}`;
  statusIcon.setAttribute('data-effect', effectType);
  statusIcon.innerHTML = icon;
  
  // Add stack badge for stackable effects
  if (stacks > 0) {
    const stackBadge = document.createElement('span');
    stackBadge.className = 'stack-badge';
    stackBadge.textContent = `x${stacks}`;
    statusIcon.appendChild(stackBadge);
  }
  
  statusContainer.appendChild(statusIcon);
  
  // Animate in
  setTimeout(() => statusIcon.classList.add('active'), 10);
}

/**
 * Remove status effect icon
 * @param {string} fighterId - 'agent1' or 'agent2'
 * @param {string} effectType - Effect type to remove
 */
function removeStatusIcon(fighterId, effectType) {
  const combatant = document.querySelector(`#${fighterId}Name`).closest('.combatant');
  if (!combatant) return;
  
  const statusContainer = combatant.querySelector('.status-icons-container');
  if (!statusContainer) return;
  
  const icon = statusContainer.querySelector(`[data-effect="${effectType}"]`);
  if (!icon) return;
  
  // Animate out
  icon.classList.remove('active');
  icon.classList.add('fade-out');
  
  setTimeout(() => {
    icon.remove();
    
    // Remove container if empty
    if (statusContainer.children.length === 0) {
      statusContainer.remove();
    }
  }, 300);
}

/**
 * Update all status icons for a fighter
 * @param {string} fighterId - 'agent1' or 'agent2'
 * @param {Array} statusEffects - Array of effect objects
 */
function updateStatusIcons(fighterId, statusEffects) {
  const combatant = document.querySelector(`#${fighterId}Name`).closest('.combatant');
  if (!combatant) return;
  
  // Get current icons
  const statusContainer = combatant.querySelector('.status-icons-container');
  const currentEffects = new Set();
  
  if (statusContainer) {
    statusContainer.querySelectorAll('.status-icon').forEach(icon => {
      currentEffects.add(icon.getAttribute('data-effect'));
    });
  }
  
  // Add new effects
  statusEffects.forEach(effect => {
    if (!currentEffects.has(effect.type)) {
      showStatusIcon(fighterId, effect.type, effect.icon, effect.stacks);
    } else {
      // Update stacks if changed
      const icon = statusContainer.querySelector(`[data-effect="${effect.type}"]`);
      if (icon && effect.stacks > 0) {
        const stackBadge = icon.querySelector('.stack-badge');
        if (stackBadge && stackBadge.textContent !== `x${effect.stacks}`) {
          stackBadge.textContent = `x${effect.stacks}`;
          stackBadge.classList.add('pulse-once');
          setTimeout(() => stackBadge.classList.remove('pulse-once'), 500);
        }
      }
    }
  });
  
  // Remove expired effects
  const activeEffectTypes = new Set(statusEffects.map(e => e.type));
  currentEffects.forEach(effectType => {
    if (!activeEffectTypes.has(effectType)) {
      removeStatusIcon(fighterId, effectType);
    }
  });
}

/**
 * Clear all status icons for a fighter
 * @param {string} fighterId - 'agent1' or 'agent2'
 */
function clearStatusIcons(fighterId) {
  const combatant = document.querySelector(`#${fighterId}Name`).closest('.combatant');
  if (!combatant) return;
  
  const statusContainer = combatant.querySelector('.status-icons-container');
  if (!statusContainer) return;
  
  statusContainer.querySelectorAll('.status-icon').forEach(icon => {
    icon.classList.remove('active');
    icon.classList.add('fade-out');
  });
  
  setTimeout(() => {
    if (statusContainer.parentNode) {
      statusContainer.remove();
    }
  }, 300);
}

// ────────────────────────────────────────────────────────────────────
// DAMAGE ANIMATIONS
// ────────────────────────────────────────────────────────────────────

/**
 * Show floating damage number
 * @param {string} fighterId - 'agent1' or 'agent2'
 * @param {number} damage - Damage amount
 * @param {string} type - 'normal', 'crit', 'status', 'heal'
 */
function showDamageNumber(fighterId, damage, type = 'normal') {
  const combatant = document.querySelector(`#${fighterId}Name`).closest('.combatant');
  if (!combatant) return;
  
  const damageEl = document.createElement('div');
  damageEl.className = `damage-number damage-${type}`;
  damageEl.textContent = `-${damage}`;
  
  // Position randomly around combatant
  const offsetX = Math.random() * 40 - 20;
  damageEl.style.setProperty('--offset-x', `${offsetX}px`);
  
  combatant.style.position = 'relative';
  combatant.appendChild(damageEl);
  
  // Remove after animation
  setTimeout(() => damageEl.remove(), 2000);
}

/**
 * Flash effect on combatant (for taking damage)
 * @param {string} fighterId - 'agent1' or 'agent2'
 * @param {string} color - Flash color
 */
function flashCombatant(fighterId, color = '#ff4444') {
  const combatant = document.querySelector(`#${fighterId}Name`).closest('.combatant');
  if (!combatant) return;
  
  combatant.style.transition = 'none';
  combatant.style.backgroundColor = color + '22';
  
  setTimeout(() => {
    combatant.style.transition = 'background-color 0.5s';
    combatant.style.backgroundColor = '';
  }, 100);
}

// ────────────────────────────────────────────────────────────────────
// CRITICAL HIT EFFECTS
// ────────────────────────────────────────────────────────────────────

/**
 * Show critical hit effects
 * - Screen shake
 * - "CRITICAL!" text overlay
 * - Slow-mo pause
 * - Particle burst
 */
function showCriticalHit(fighterId) {
  const combatant = document.querySelector(`#${fighterId}Name`).closest('.combatant');
  if (!combatant) return;
  
  // 1. Screen shake
  const arena = document.querySelector('.battle-arena') || document.body;
  arena.classList.add('screen-shake');
  setTimeout(() => arena.classList.remove('screen-shake'), 300);
  
  // 2. "CRITICAL!" text overlay
  const critText = document.createElement('div');
  critText.className = 'critical-text';
  critText.textContent = 'CRITICAL!';
  combatant.appendChild(critText);
  
  // Fade out after animation
  setTimeout(() => {
    critText.classList.add('fade-out');
    setTimeout(() => critText.remove(), 500);
  }, 1000);
  
  // 3. Slow-mo pause (freeze for dramatic effect)
  const originalTransition = arena.style.transition;
  arena.style.transition = 'all 2s';
  arena.style.filter = 'contrast(1.3) brightness(1.2)';
  
  setTimeout(() => {
    arena.style.transition = originalTransition;
    arena.style.filter = '';
  }, 500);
  
  // 4. Particle burst (extra sparkles)
  const particleCount = 20;
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'crit-particle';
    particle.textContent = '✨';
    particle.style.left = '50%';
    particle.style.top = '50%';
    particle.style.setProperty('--tx', `${(Math.random() - 0.5) * 300}px`);
    particle.style.setProperty('--ty', `${(Math.random() - 0.5) * 300}px`);
    combatant.appendChild(particle);
    
    setTimeout(() => particle.remove(), 1000);
  }
  
  // 5. Sound effect placeholder (for future implementation)
  // playCritSound(); // TODO: Add audio when sound system is ready
}

// ────────────────────────────────────────────────────────────────────
// SPECIAL COOLDOWN UI
// ────────────────────────────────────────────────────────────────────

/**
 * Update special ability button cooldown display
 * @param {HTMLElement} button - Special ability button element
 * @param {number} cooldown - Remaining cooldown turns (0 = ready)
 */
function updateSpecialCooldown(button, cooldown) {
  if (!button) return;
  
  // Remove existing cooldown number
  const existingNumber = button.querySelector('.cooldown-number');
  if (existingNumber) {
    existingNumber.remove();
  }
  
  if (cooldown > 0) {
    // On cooldown
    button.classList.add('on-cooldown');
    button.classList.remove('ready');
    button.disabled = true;
    button.title = `Cooldown: ${cooldown} turn${cooldown > 1 ? 's' : ''}`;
    
    // Add cooldown number overlay
    const cooldownNumber = document.createElement('div');
    cooldownNumber.className = 'cooldown-number';
    cooldownNumber.textContent = cooldown;
    button.appendChild(cooldownNumber);
  } else {
    // Ready to use
    button.classList.remove('on-cooldown');
    button.classList.add('ready');
    button.disabled = false;
    button.title = 'Ready! Use your special ability!';
  }
}

/**
 * Update all ability buttons for a fighter
 * @param {string} fighterId - 'agent1' or 'agent2'
 * @param {Array<HTMLElement>} abilityButtons - Array of ability button elements
 * @param {number} specialCooldown - Cooldown for special ability
 */
function updateAbilityButtons(fighterId, abilityButtons, specialCooldown) {
  if (!abilityButtons || abilityButtons.length === 0) return;
  
  // Special ability is always the last button
  const specialButton = abilityButtons[abilityButtons.length - 1];
  
  if (specialButton) {
    updateSpecialCooldown(specialButton, specialCooldown);
  }
}

// ────────────────────────────────────────────────────────────────────
// EXPORTS (for use in index.html)
// ────────────────────────────────────────────────────────────────────

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    showStatusIcon,
    removeStatusIcon,
    updateStatusIcons,
    clearStatusIcons,
    showDamageNumber,
    flashCombatant,
    showCriticalHit,
    updateSpecialCooldown,
    updateAbilityButtons
  };
}
