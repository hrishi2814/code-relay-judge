const fs = require('fs-extra');
const path = require('path');
const runCodeInDocker = require('./run_code');

// Simple in-memory queue
class SubmissionQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.results = {};
  }

  async add(submission) {
    const jobId = Date.now().toString();
    
    // Add to queue
    this.queue.push({
      id: jobId,
      ...submission,
      status: 'queued',
      timestamp: Date.now()
    });
    
    // Start processing if not already
    if (!this.processing) {
      this.processQueue();
    }
    
    return { jobId };
  }

  async processQueue() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }
    
    this.processing = true;
    const job = this.queue.shift();
    job.status = 'processing';
    
    try {
      // Run the code
      const result = await runCodeInDocker(
        job.team, 
        job.problem, 
        job.language, 
        job.filePath
      );
      
      // Store result
      job.status = 'completed';
      job.result = result;
      this.results[job.id] = job;
      
      // Update leaderboard
      await this.updateLeaderboard(job.team, result.score);
      
      console.log(`Completed job ${job.id} for team ${job.team}`);
    } catch (error) {
      console.error(`Error processing job ${job.id}: ${error.message}`);
      job.status = 'failed';
      job.error = error.message;
      this.results[job.id] = job;
    }
    
    // Process next job
    setImmediate(() => this.processQueue());
  }

  getJob(jobId) {
    return this.results[jobId] || null;
  }

  async updateLeaderboard(team, score) {
    const leaderboardPath = path.join(__dirname, 'db', 'leaderboard.json');
    await fs.ensureDir(path.join(__dirname, 'db'));
    
    let leaderboard = [];
    if (await fs.pathExists(leaderboardPath)) {
      leaderboard = await fs.readJson(leaderboardPath);
    }
    
    const teamEntry = leaderboard.find(entry => entry.team === team);
    if (teamEntry) {
      teamEntry.score += score;
      teamEntry.lastUpdated = Date.now();
    } else {
      leaderboard.push({
        team,
        score,
        lastUpdated: Date.now()
      });
    }
    
    // Sort by score (descending)
    leaderboard.sort((a, b) => b.score - a.score);
    
    await fs.writeJson(leaderboardPath, leaderboard, { spaces: 2 });
    return leaderboard;
  }

  async getLeaderboard() {
    const leaderboardPath = path.join(__dirname, 'db', 'leaderboard.json');
    if (await fs.pathExists(leaderboardPath)) {
      return await fs.readJson(leaderboardPath);
    }
    return [];
  }
}

// Create singleton instance
const submissionQueue = new SubmissionQueue();

module.exports = submissionQueue; 