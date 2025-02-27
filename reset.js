const fs = require('fs-extra');
const path = require('path');

async function resetCompetition() {
  try {
    console.log('Resetting competition data...');
    
    // 1. Clear submissions directory
    console.log('Clearing submissions directory...');
    await fs.emptyDir(path.join(__dirname, 'submissions'));
    
    // 2. Clear leaderboard data
    console.log('Clearing leaderboard data...');
    const leaderboardPath = path.join(__dirname, 'db', 'leaderboard.json');
    if (await fs.pathExists(leaderboardPath)) {
      await fs.remove(leaderboardPath);
    }
    
    // 3. Create empty leaderboard file
    await fs.ensureDir(path.join(__dirname, 'db'));
    await fs.writeJson(leaderboardPath, [], { spaces: 2 });
    
    // 4. Clear team configurations
    console.log('Clearing team configurations...');
    const configDir = path.join(__dirname, 'config');
    await fs.emptyDir(configDir);
    await fs.writeJson(path.join(configDir, 'teams.json'), {}, { spaces: 2 });
    await fs.writeJson(path.join(configDir, 'active_team.json'), { activeTeam: null }, { spaces: 2 });
    
    console.log('Competition data has been reset successfully!');
  } catch (error) {
    console.error('Error resetting competition data:', error);
  }
}

// Execute if run directly
if (require.main === module) {
  resetCompetition();
}

module.exports = resetCompetition;
