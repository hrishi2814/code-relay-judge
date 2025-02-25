const express = require('express');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const submissionQueue = require('./queue');

const app = express();
app.use(express.json());
const upload = multer({dest: "submissions/"});

// Serve static files for the frontend
app.use(express.static('public'));

app.post("/submit/text", async(req, res) => {
    const {team, problem, language, code} = req.body;
    if(!team){
        return res.status(400).json({error : "No team param"});
    }

    const codeFilePath = path.join(__dirname, "submissions", `${team}_${problem}.${language}`);
    await fs.ensureDir(path.join(__dirname, "submissions"));
    await fs.writeFile(codeFilePath, code);

    // Add to queue
    const { jobId } = await submissionQueue.add({
        team, 
        problem, 
        language, 
        filePath: codeFilePath
    });
    
    res.json({ 
        status: "submitted", 
        jobId,
        message: "Your code has been submitted and is being processed" 
    });
});

app.post("/submit/file", upload.single('code'), async(req, res) => {
    const {team, problem, language} = req.body;
    if(!team){
        return res.status(400).json({error : "No team param"});
    }
    if(!req.file){
        return res.status(400).json({error : "No file uploaded"});
    }
    
    const filePath = req.file.path;

    // Add to queue
    const { jobId } = await submissionQueue.add({
        team, 
        problem, 
        language, 
        filePath
    });
    
    res.json({ 
        status: "submitted", 
        jobId,
        message: "Your code has been submitted and is being processed" 
    });
});

// Get job status
app.get("/status/:jobId", async(req, res) => {
    const jobId = req.params.jobId;
    const job = submissionQueue.getJob(jobId);
    
    if (!job) {
        return res.status(404).json({ error: "Job not found" });
    }
    
    res.json({
        id: job.id,
        team: job.team,
        problem: job.problem,
        status: job.status,
        result: job.status === 'completed' ? job.result : null,
        error: job.error || null,
        timestamp: job.timestamp
    });
});

// Get leaderboard
app.get("/leaderboard", async(req, res) => {
    const leaderboard = await submissionQueue.getLeaderboard();
    res.json(leaderboard);
});

// Get queue status
app.get("/queue/status", (req, res) => {
    res.json({
        queueLength: submissionQueue.queue.length,
        processing: submissionQueue.processing
    });
});

app.listen(6969, () => console.log("Server running on 6969"));