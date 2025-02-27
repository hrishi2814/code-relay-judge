const fs = require('fs-extra');
const path = require('path');
const runCodeInDocker = require('./run_code');

// Simple in-memory queue
class SubmissionQueue {
  constructor() {
    this.SUBMISSION_TIMEOUT = 30000; // 30 seconds
    this.queue = [];
    this.results = {};
    this.processing = false;
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
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Submission timeout')), this.SUBMISSION_TIMEOUT);
      });

      // Race between code execution and timeout
      const result = await Promise.race([
        runCodeInDocker(job.team, job.problem, job.language, job.filePath),
        timeoutPromise
      ]);
      
      job.status = 'completed';
      job.result = result;
      this.results[job.id] = job;
      
      if (result.score === 100) {
        // Only update leaderboard for 100% solutions
        await this.updateLeaderboard(job.team, job.problem, result.score);
      }
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      this.results[job.id] = job;
    }
    
    setImmediate(() => this.processQueue());
  }

  getJob(jobId) {
    return this.results[jobId] || null;
  }

  async updateLeaderboard(team, problem, score) {
    const leaderboardPath = path.join(__dirname, 'db', 'leaderboard.json');
    await fs.ensureFile(leaderboardPath);
    
    let leaderboard = await fs.readJson(leaderboardPath, { throws: false }) || [];
    let teamEntry = leaderboard.find(entry => entry.team === team);
    
    if (!teamEntry) {
      teamEntry = { team, score: 0, solvedProblems: {} };
      leaderboard.push(teamEntry);
    }

    // Check if this problem was already solved with 100% score
    if (!teamEntry.solvedProblems[problem] || teamEntry.solvedProblems[problem] < 100) {
      // If new score is better, update it
      if (!teamEntry.solvedProblems[problem] || score > teamEntry.solvedProblems[problem]) {
        // If there was a previous score, subtract it before adding new score
        if (teamEntry.solvedProblems[problem]) {
          teamEntry.score -= teamEntry.solvedProblems[problem];
        }
        teamEntry.score += score;
        teamEntry.solvedProblems[problem] = score;
      }
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