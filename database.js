const fs = require('fs-extra');
const path = require('path');

// In a real implementation, you'd use a proper database
// This is a simple file-based implementation for demonstration
const DB_DIR = path.join(__dirname, 'db');
const RESULTS_FILE = path.join(DB_DIR, 'results.json');
const LEADERBOARD_FILE = path.join(DB_DIR, 'leaderboard.json');

// Initialize database
async function initDB() {
    await fs.ensureDir(DB_DIR);
    
    if (!await fs.pathExists(RESULTS_FILE)) {
        await fs.writeJson(RESULTS_FILE, {});
    }
    
    if (!await fs.pathExists(LEADERBOARD_FILE)) {
        await fs.writeJson(LEADERBOARD_FILE, []);
    }
}

// Save result
async function saveResult(team, problem, result) {
    const results = await fs.readJson(RESULTS_FILE);
    
    if (!results[team]) {
        results[team] = {};
    }
    
    results[team][problem] = {
        ...result,
        timestamp: Date.now()
    };
    
    await fs.writeJson(RESULTS_FILE, results, { spaces: 2 });
}

// Update leaderboard
async function updateLeaderboard(team, score) {
    let leaderboard = await fs.readJson(LEADERBOARD_FILE);
    
    // Skip updating if score is undefined or null
    if (score === undefined || score === null) {
        console.log(`Skipping leaderboard update for team ${team} due to invalid score`);
        return;
    }
    
    // Find team in leaderboard
    const teamIndex = leaderboard.findIndex(entry => entry.team === team);
    
    if (teamIndex >= 0) {
        // Update existing team - ensure we have a valid score to add to
        leaderboard[teamIndex].score = (leaderboard[teamIndex].score || 0) + score;
        leaderboard[teamIndex].lastUpdated = Date.now();
    } else {
        // Add new team
        leaderboard.push({
            team,
            score,
            lastUpdated: Date.now()
        });
    }
    
    // Sort by score (descending) - handle null scores
    leaderboard.sort((a, b) => (b.score || 0) - (a.score || 0));
    
    await fs.writeJson(LEADERBOARD_FILE, leaderboard, { spaces: 2 });
}

// Get leaderboard
async function getLeaderboard() {
    return await fs.readJson(LEADERBOARD_FILE);
}

// Initialize on module load
initDB().catch(console.error);

module.exports = {
    saveResult,
    updateLeaderboard,
    getLeaderboard
}; 