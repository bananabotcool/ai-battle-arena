// ═══════════════════════════════════════════════════════════════════
// ACHIEVEMENT SYSTEM - Track and display player milestones
// ═══════════════════════════════════════════════════════════════════

class AchievementSystem {
  constructor() {
    this.achievements = this.defineAchievements();
    this.progress = this.loadProgress();
    this.initUI();
  }

  defineAchievements() {
    return [
      {
        id: 'first_blood',
        name: 'First Blood',
        description: 'Win your first battle',
        icon: '⚔️',
        condition: stats => stats.wins >= 1
      },
      {
        id: 'warrior',
        name: 'Warrior',
        description: 'Win 10 battles',
        icon: '🗡️',
        condition: stats => stats.wins >= 10
      },
      {
        id: 'champion',
        name: 'Champion',
        description: 'Win 50 battles',
        icon: '🏆',
        condition: stats => stats.wins >= 50
      },
      {
        id: 'legend',
        name: 'Legend',
        description: 'Win 100 battles',
        icon: '👑',
        condition: stats => stats.wins >= 100
      },
      {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Win a battle without taking damage',
        icon: '💎',
        condition: stats => stats.flawlessVictories >= 1
      },
      {
        id: 'glass_cannon',
        name: 'Glass Cannon',
        description: 'Deal 200+ damage in one battle',
        icon: '💥',
        condition: stats => stats.maxDamageInBattle >= 200
      },
      {
        id: 'survivor',
        name: 'Survivor',
        description: 'Win with less than 10 HP remaining',
        icon: '🩹',
        condition: stats => stats.closeCalls >= 1
      },
      {
        id: 'streak_master',
        name: 'Streak Master',
        description: 'Win 5 battles in a row',
        icon: '🔥',
        condition: stats => stats.longestStreak >= 5
      },
      {
        id: 'tournament_winner',
        name: 'Tournament Victor',
        description: 'Win a tournament',
        icon: '🥇',
        condition: stats => stats.tournamentsWon >= 1
      },
      {
        id: 'critical_master',
        name: 'Critical Master',
        description: 'Land 20 critical hits',
        icon: '⚡',
        condition: stats => stats.criticalHits >= 20
      },
      {
        id: 'status_master',
        name: 'Status Master',
        description: 'Apply 50 status effects',
        icon: '🧪',
        condition: stats => stats.statusEffectsApplied >= 50
      },
      {
        id: 'battle_veteran',
        name: 'Battle Veteran',
        description: 'Complete 100 battles',
        icon: '🎖️',
        condition: stats => stats.battlesPlayed >= 100
      },
      {
        id: 'custom_creator',
        name: 'Custom Creator',
        description: 'Create a custom fighter',
        icon: '🎨',
        condition: stats => stats.customFightersCreated >= 1
      },
      {
        id: 'speedster',
        name: 'Speedster',
        description: 'Win a battle in under 5 rounds',
        icon: '💨',
        condition: stats => stats.quickestVictory <= 5
      },
      {
        id: 'endurance',
        name: 'Endurance',
        description: 'Survive a 20+ round battle',
        icon: '🛡️',
        condition: stats => stats.longestBattle >= 20
      }
    ];
  }

  loadProgress() {
    const saved = localStorage.getItem('achievements_progress');
    if (saved) {
      return JSON.parse(saved);
    }
    
    return {
      stats: {
        wins: 0,
        losses: 0,
        battlesPlayed: 0,
        flawlessVictories: 0,
        maxDamageInBattle: 0,
        closeCalls: 0,
        longestStreak: 0,
        currentStreak: 0,
        tournamentsWon: 0,
        criticalHits: 0,
        statusEffectsApplied: 0,
        customFightersCreated: 0,
        quickestVictory: 999,
        longestBattle: 0
      },
      unlocked: [],
      notifiedAchievements: []
    };
  }

  saveProgress() {
    localStorage.setItem('achievements_progress', JSON.stringify(this.progress));
  }

  recordBattleStats(battleData) {
    const stats = this.progress.stats;
    
    // Update basic stats
    stats.battlesPlayed++;
    
    if (battleData.isVictory) {
      stats.wins++;
      stats.currentStreak++;
      if (stats.currentStreak > stats.longestStreak) {
        stats.longestStreak = stats.currentStreak;
      }
    } else {
      stats.losses++;
      stats.currentStreak = 0;
    }

    // Update special stats
    if (battleData.flawlessVictory) stats.flawlessVictories++;
    if (battleData.damageDealt > stats.maxDamageInBattle) {
      stats.maxDamageInBattle = battleData.damageDealt;
    }
    if (battleData.finalHP < 10 && battleData.isVictory) stats.closeCalls++;
    if (battleData.criticalHits) stats.criticalHits += battleData.criticalHits;
    if (battleData.statusEffects) stats.statusEffectsApplied += battleData.statusEffects;
    if (battleData.rounds < stats.quickestVictory && battleData.isVictory) {
      stats.quickestVictory = battleData.rounds;
    }
    if (battleData.rounds > stats.longestBattle) {
      stats.longestBattle = battleData.rounds;
    }

    this.checkAchievements();
    this.saveProgress();
  }

  checkAchievements() {
    const newlyUnlocked = [];

    this.achievements.forEach(achievement => {
      if (!this.progress.unlocked.includes(achievement.id)) {
        if (achievement.condition(this.progress.stats)) {
          this.progress.unlocked.push(achievement.id);
          
          if (!this.progress.notifiedAchievements.includes(achievement.id)) {
            newlyUnlocked.push(achievement);
            this.progress.notifiedAchievements.push(achievement.id);
          }
        }
      }
    });

    if (newlyUnlocked.length > 0) {
      this.showAchievementNotifications(newlyUnlocked);
    }

    return newlyUnlocked;
  }

  showAchievementNotifications(achievements) {
    achievements.forEach((achievement, index) => {
      setTimeout(() => {
        this.createNotification(achievement);
      }, index * 500);
    });
  }

  createNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
      <div class="achievement-icon">${achievement.icon}</div>
      <div class="achievement-details">
        <div class="achievement-title">Achievement Unlocked!</div>
        <div class="achievement-name">${achievement.name}</div>
        <div class="achievement-desc">${achievement.description}</div>
      </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);

    // Remove after 5 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 500);
    }, 5000);

    // Play sound if available
    this.playAchievementSound();
  }

  playAchievementSound() {
    // Optional: Add sound effect
    try {
      const audio = new Audio('/sounds/achievement.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (e) {}
  }

  getProgress() {
    return {
      stats: this.progress.stats,
      achievements: this.achievements.map(ach => ({
        ...ach,
        unlocked: this.progress.unlocked.includes(ach.id),
        progress: this.getAchievementProgress(ach)
      }))
    };
  }

  getAchievementProgress(achievement) {
    // Calculate progress percentage for achievement
    // This is a simplified version - could be more sophisticated
    return achievement.condition(this.progress.stats) ? 100 : 0;
  }

  initUI() {
    // Inject CSS
    const style = document.createElement('style');
    style.textContent = `
      .achievement-notification {
        position: fixed;
        top: 20px;
        right: -400px;
        width: 350px;
        background: linear-gradient(135deg, rgba(255,215,0,0.95), rgba(255,165,0,0.95));
        border: 3px solid gold;
        border-radius: 10px;
        padding: 20px;
        display: flex;
        gap: 15px;
        align-items: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        transition: right 0.5s ease;
        z-index: 10000;
      }

      .achievement-notification.show {
        right: 20px;
      }

      .achievement-icon {
        font-size: 48px;
        flex-shrink: 0;
      }

      .achievement-details {
        flex: 1;
      }

      .achievement-title {
        color: #000;
        font-weight: bold;
        font-size: 12px;
        text-transform: uppercase;
        margin-bottom: 5px;
      }

      .achievement-name {
        color: #000;
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 5px;
      }

      .achievement-desc {
        color: rgba(0,0,0,0.7);
        font-size: 14px;
      }
    `;
    document.head.appendChild(style);
  }

  // Public API for recording specific events
  recordTournamentWin() {
    this.progress.stats.tournamentsWon++;
    this.checkAchievements();
    this.saveProgress();
  }

  recordCustomFighterCreated() {
    this.progress.stats.customFightersCreated++;
    this.checkAchievements();
    this.saveProgress();
  }

  reset() {
    if (confirm('Reset all achievement progress?')) {
      this.progress = {
        stats: {
          wins: 0,
          losses: 0,
          battlesPlayed: 0,
          flawlessVictories: 0,
          maxDamageInBattle: 0,
          closeCalls: 0,
          longestStreak: 0,
          currentStreak: 0,
          tournamentsWon: 0,
          criticalHits: 0,
          statusEffectsApplied: 0,
          customFightersCreated: 0,
          quickestVictory: 999,
          longestBattle: 0
        },
        unlocked: [],
        notifiedAchievements: []
      };
      this.saveProgress();
    }
  }
}

// Global instance
window.achievementSystem = new AchievementSystem();
