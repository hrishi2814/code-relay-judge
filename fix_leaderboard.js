// fix_leaderboard.js
const fs = require('fs-extra');
const path = require('path');

async function fixLeaderboard() {
  try {
    console.log('Fixing leaderboard data...');
    
    const leaderboardPath = path.join(__dirname, 'db', 'leaderboard.json');
    if (await fs.pathExists(leaderboardPath)) {
      let leaderboard = await fs.readJson(leaderboardPath);
      
      // Fix any null scores
      let fixed = false;
      leaderboard.forEach(entry => {
        if (entry.score === null || entry.score === undefined) {
          entry.score = 0;
          fixed = true;
          console.log(`Fixed null score for team ${entry.team}`);
        }
      });
      
      if (fixed) {
        // Sort by score
        leaderboard.sort((a, b) => (b.score || 0) - (a.score || 0));
        await fs.writeJson(leaderboardPath, leaderboard, { spaces: 2 });
        console.log('Leaderboard has been fixed successfully!');
      } else {
        console.log('No issues found in the leaderboard.');
      }
    } else {
      console.log('Leaderboard file not found.');
    }
  } catch (error) {
    console.error('Error fixing leaderboard:', error);
  }
}

// Run the fix function
fixLeaderboard();