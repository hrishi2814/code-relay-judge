const fs = require('fs-extra');
const path = require('path');

const TEAM_CONFIG_FILE = path.join(__dirname, 'config', 'teams.json');
const ACTIVE_TEAM_FILE = path.join(__dirname, 'config', 'active_team.json');

// Team configuration structure
const defaultTeamConfig = {
  name: '',
  members: [], // Array of 4 members
  currentMember: 0,
  discussionTimeLeft: 600, // 10 minutes in seconds
  codingTimeLeft: 300, // 5 minutes in seconds
  score: 0,
  submissions: []
};

async function initializeTeamConfig() {
  await fs.ensureDir(path.join(__dirname, 'config'));
  if (!await fs.pathExists(TEAM_CONFIG_FILE)) {
    await fs.writeJson(TEAM_CONFIG_FILE, {}, { spaces: 2 });
  }
  if (!await fs.pathExists(ACTIVE_TEAM_FILE)) {
    await fs.writeJson(ACTIVE_TEAM_FILE, { activeTeam: null }, { spaces: 2 });
  }
}

async function addTeam(teamName, members) {
  if (members.length !== 4) {
    throw new Error('Each team must have exactly 4 members');
  }

  const teams = await fs.readJson(TEAM_CONFIG_FILE);
  
  if (teams[teamName]) {
    throw new Error('Team already exists');
  }

  teams[teamName] = {
    ...defaultTeamConfig,
    name: teamName,
    members: members,
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
    teams[teamName].codingTimeLeft = 300; // Reset to 5 minutes
    teams[teamName].currentMember = (teams[teamName].currentMember + 1) % 4;
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