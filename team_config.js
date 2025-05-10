const fs = require('fs-extra');
const path = require('path');

const TEAM_CONFIG_FILE = path.join(__dirname, 'config', 'teams.json');
const ACTIVE_TEAM_FILE = path.join(__dirname, 'config', 'active_team.json');

// Team configuration structure
const defaultTeamConfig = {
  name: '',
  members: [], // Array of 3-4 members
  currentMember: 0,
  discussionTimeLeft: 600, // 10 minutes in seconds
  codingTimeLeft: 400, // Adjusted dynamically based on team size
  score: 0,
  submissions: []
};

const teamConfigs = {
  3: {
    totalTime: 20,
    timePerPlayer: Math.floor(1200/3) // 400 seconds (6.67 minutes) per player
  },
  4: {
    totalTime: 20,
    timePerPlayer: Math.floor(1200/4) // 300 seconds (5 minutes) per player
  }
};

async function initializeTeamConfig() {
  try {
    await fs.ensureDir(path.join(__dirname, 'config'));
    
    // Initialize teams.json if it doesn't exist
    if (!await fs.pathExists(TEAM_CONFIG_FILE)) {
      await fs.writeJson(TEAM_CONFIG_FILE, {}, { spaces: 2 });
    }
    
    // Initialize active_team.json if it doesn't exist
    if (!await fs.pathExists(ACTIVE_TEAM_FILE)) {
      await fs.writeJson(ACTIVE_TEAM_FILE, { activeTeam: null }, { spaces: 2 });
    }
  } catch (error) {
    console.error('Error initializing team config:', error);
    throw error;
  }
}

async function addTeam(teamName, members) {
  // Filter out empty members
  const validMembers = members.filter(member => member && member.trim());
  
  if (validMembers.length < 3 || validMembers.length > 4) {
    throw new Error('Each team must have 3 or 4 members');
  }

  const teams = await fs.readJson(TEAM_CONFIG_FILE);
  
  if (teams[teamName]) {
    throw new Error('Team already exists');
  }

  // Calculate coding time based on team size
  const totalCodingTime = validMembers.length === 3 ? 400 : 300; // ~6.67 min for 3, 5 min for 4

  teams[teamName] = {
    ...defaultTeamConfig,
    name: teamName,
    members: validMembers,
    codingTimeLeft: totalCodingTime,
    createdAt: Date.now()
  };

  await fs.writeJson(TEAM_CONFIG_FILE, teams, { spaces: 2 });
  return teams[teamName];
}

async function setActiveTeam(teamName) {
  const teams = await fs.readJson(TEAM_CONFIG_FILE);
  if (!teams[teamName]) {
    throw new Error('Team does not exist');
  }
  await fs.writeJson(ACTIVE_TEAM_FILE, { activeTeam: teamName }, { spaces: 2 });
}

async function getActiveTeam() {
  try {
    const { activeTeam } = await fs.readJson(ACTIVE_TEAM_FILE);
    return activeTeam;
  } catch (error) {
    return null;
  }
}

async function updateTeamTimer(teamName, phase) {
  const teams = await fs.readJson(TEAM_CONFIG_FILE);
  
  if (!teams[teamName]) {
    throw new Error('Team not found');
  }

  if (phase === 'discussion') {
    teams[teamName].discussionTimeLeft = 600; // Reset to 10 minutes
  } else if (phase === 'coding') {
    // Calculate coding time based on team size - distribute 20 minutes (1200 seconds) equally
    const memberCount = teams[teamName].members.length;
    const codingTime = Math.floor(1200/memberCount); // Equally distribute 20 minutes
    teams[teamName].codingTimeLeft = codingTime;
    teams[teamName].currentMember = (teams[teamName].currentMember + 1) % memberCount;
  }

  await fs.writeJson(TEAM_CONFIG_FILE, teams, { spaces: 2 });
  return teams[teamName];
}

async function getTeamStatus(teamName) {
  const teams = await fs.readJson(TEAM_CONFIG_FILE);
  return teams[teamName] || null;
}

module.exports = {
  initializeTeamConfig,
  addTeam,
  setActiveTeam,
  getActiveTeam,
  updateTeamTimer,
  getTeamStatus
}; 