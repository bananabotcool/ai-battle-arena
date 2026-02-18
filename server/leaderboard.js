/**
 * LEADERBOARD SYSTEM - Persistent agent rankings and statistics
 */

const fs = require('fs');
const path = require('path');

const LEADERBOARD_FILE = path.join(__dirname, '../data/leaderboard.json');

class LeaderboardManager {
  constructor() {
    this.leaderboard = this.load();
  }

  load() {
    try {
      if (fs.existsSync(LEADERBOARD_FILE)) {
        return JSON.parse(fs.readFileSync(LEADERBOARD_FILE, 'utf8'));
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
    
    return {
      agents: {},
      lastUpdated: null
    };
  }

  save() {
    try {
      const dir = path.dirname(LEADERBOARD_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      this.leaderboard.lastUpdated = new Date().toISOString();
      fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(this.leaderboard, null, 2));
    } catch (error) {
      console.error('Error saving leaderboard:', error);
    }
  }

  recordBattle(agent1, agent2, winnerId, stats = {}) {
    // Initialize agents if not exists
    if (!this.leaderboard.agents[agent1.id]) {
      this.leaderboard.agents[agent1.id] = this.createAgentRecord(agent1);
    }
    if (!this.leaderboard.agents[agent2.id]) {
      this.leaderboard.agents[agent2.id] = this.createAgentRecord(agent2);
    }

    const agent1Record = this.leaderboard.agents[agent1.id];
    const agent2Record = this.leaderboard.agents[agent2.id];

    // Update battles played
    agent1Record.battlesPlayed++;
    agent2Record.battlesPlayed++;

    // Update wins/losses
    if (winnerId === agent1.id) {
      agent1Record.wins++;
      agent2Record.losses++;
      agent1Record.currentStreak++;
      agent2Record.currentStreak = 0;
    } else {
      agent2Record.wins++;
      agent1Record.losses++;
      agent2Record.currentStreak++;
      agent1Record.currentStreak = 0;
    }

    // Update longest streak
    if (agent1Record.currentStreak > agent1Record.longestWinStreak) {
      agent1Record.longestWinStreak = agent1Record.currentStreak;
    }
    if (agent2Record.currentStreak > agent2Record.longestWinStreak) {
      agent2Record.longestWinStreak = agent2Record.currentStreak;
    }

    // Update stats
    if (stats.damageDealt) {
      agent1Record.totalDamageDealt += stats.damageDealt[agent1.id] || 0;
      agent2Record.totalDamageDealt += stats.damageDealt[agent2.id] || 0;
    }

    if (stats.damageTaken) {
      agent1Record.totalDamageTaken += stats.damageTaken[agent1.id] || 0;
      agent2Record.totalDamageTaken += stats.damageTaken[agent2.id] || 0;
    }

    if (stats.criticalHits) {
      agent1Record.criticalHits += stats.criticalHits[agent1.id] || 0;
      agent2Record.criticalHits += stats.criticalHits[agent2.id] || 0;
    }

    // Calculate win rate
    agent1Record.winRate = (agent1Record.wins / agent1Record.battlesPlayed * 100).toFixed(1);
    agent2Record.winRate = (agent2Record.wins / agent2Record.battlesPlayed * 100).toFixed(1);

    // Update ELO-style rating
    this.updateRatings(agent1Record, agent2Record, winnerId === agent1.id);

    this.save();
  }

  createAgentRecord(agent) {
    return {
      id: agent.id,
      name: agent.name,
      personality: agent.personality || 'Unknown',
      battlesPlayed: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      currentStreak: 0,
      longestWinStreak: 0,
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      criticalHits: 0,
      rating: 1000,
      rank: 0
    };
  }

  updateRatings(agent1, agent2, agent1Won) {
    const K = 32; // K-factor for ELO
    const expectedAgent1 = 1 / (1 + Math.pow(10, (agent2.rating - agent1.rating) / 400));
    const expectedAgent2 = 1 - expectedAgent1;

    const actualAgent1 = agent1Won ? 1 : 0;
    const actualAgent2 = agent1Won ? 0 : 1;

    agent1.rating = Math.round(agent1.rating + K * (actualAgent1 - expectedAgent1));
    agent2.rating = Math.round(agent2.rating + K * (actualAgent2 - expectedAgent2));
  }

  getLeaderboard(sortBy = 'rating', limit = 10) {
    const agents = Object.values(this.leaderboard.agents);
    
    // Sort
    agents.sort((a, b) => {
      if (sortBy === 'winRate') {
        return parseFloat(b.winRate) - parseFloat(a.winRate);
      } else if (sortBy === 'wins') {
        return b.wins - a.wins;
      } else if (sortBy === 'battles') {
        return b.battlesPlayed - a.battlesPlayed;
      } else {
        return b.rating - a.rating;
      }
    });

    // Assign ranks
    agents.forEach((agent, index) => {
      agent.rank = index + 1;
    });

    return agents.slice(0, limit);
  }

  getAgentStats(agentId) {
    return this.leaderboard.agents[agentId] || null;
  }

  reset() {
    this.leaderboard = {
      agents: {},
      lastUpdated: null
    };
    this.save();
  }
}

module.exports = LeaderboardManager;
