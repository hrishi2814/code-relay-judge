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
    
    console.log('Competition data has been reset successfully!');
  } catch (error) {
    console.error('Error resetting competition data:', error);
  }
}

// Run the reset function
resetCompetition();
