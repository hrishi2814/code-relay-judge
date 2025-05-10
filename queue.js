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
      
      // Calculate partial score
      if (result.passedTests > 0) {
        // Each test case is worth 20 points
        const partialScore = Math.min(100, result.passedTests * 20);
        
        // Update leaderboard with partial score
        await this.updateLeaderboard(job.team, job.problem, partialScore);
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
      teamEntry = { team, score: 0, problemScores: {} };
      leaderboard.push(teamEntry);
    }

    // Get the current best score for this problem
    const currentBestScore = teamEntry.problemScores?.[problem] || 0;
    
    // Only update if new score is higher
    if (score > currentBestScore) {
      // Update the score for this specific problem
      teamEntry.problemScores[problem] = score;
      
      // Recalculate total score as sum of best problem scores
      teamEntry.score = Object.values(teamEntry.problemScores).reduce((a, b) => a + b, 0);
      teamEntry.lastUpdated = Date.now();
    }
    
    // Sort by total score
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