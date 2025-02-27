const express = require('express');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const submissionQueue = require('./queue');
const teamConfig = require('./team_config');

const app = express();
app.use(express.json());
const upload = multer({dest: "submissions/"});

// Serve static files for the frontend
app.use(express.static('public'));

let defaultTeam = null;
try {
  const teamConfig = require('./team_config');
  defaultTeam = teamConfig.teamName;
  console.log(`Configured for team: ${defaultTeam}`);
} catch (error) {
  console.log('No team configuration found, using default form');
}

// Initialize team config on server start
teamConfig.initializeTeamConfig().catch(console.error);

// Add a Map to track submissions in progress
const activeSubmissions = new Map();

app.post("/submit/text", async(req, res) => {
    const {team, problem, language, code} = req.body;
    
    if(!team){
        return res.status(400).json({error : "No team param"});
    }

    if (activeSubmissions.has(team)) {
        return res.status(400).json({
            status: "error",
            error: "Team already has a submission in progress"
        });
    }

    try {
        activeSubmissions.set(team, true);
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

    } catch (error) {
        console.error('Submission error:', error);
        res.status(500).json({
            status: "error",
            error: error.message || "Internal server error"
        });
    } finally {
        activeSubmissions.delete(team);
    }
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

// Add a test endpoint that doesn't affect the leaderboard
app.post("/test", upload.single('code'), async(req, res) => {
    const {team, problem, language, code} = req.body;
    
    // Save code to a temporary file
    const tempDir = path.join(__dirname, 'temp');
    await fs.ensureDir(tempDir);
    
    const timestamp = Date.now();
    const filename = `test_${timestamp}.${getFileExtension(language)}`;
    const filePath = path.join(tempDir, filename);
    
    await fs.writeFile(filePath, code);
    
    try {
        // Run the code directly without affecting the queue or leaderboard
        const result = await runCodeInDocker(
            'test_user', 
            problem, 
            language, 
            filePath
        );
        
        // Clean up temp file
        await fs.remove(filePath);
        
        res.json({
            status: "completed",
            result
        });
    } catch (error) {
        console.error(`Error testing code: ${error.message}`);
        res.status(500).json({
            status: "error",
            error: error.message
        });
    }
});

// Add a new endpoint to get code templates
app.get('/template/:language/:problem', (req, res) => {
  const { language, problem } = req.params;
  
  // Basic templates with input handling for each language
  const templates = {
    py: {
      problem1: `# Problem 1: Hello Name
# Read a name and print "Hello, [name]!"

# Read input
name = input().strip()

# Print output
print(f"Hello, {name}!")
`,
      problem2: `# Problem 2: Sum of Numbers
# Read integers line by line and print their sum

# Read input
total = 0
while True:
    try:
        num = int(input().strip())
        total += num
    except EOFError:
        break
    except:
        pass

# Print output
print(total)
`,
      problem3: `# Problem 3: Palindrome Check
# Check if a string is a palindrome

# Read input
text = input().strip()

# Check if palindrome
if text == text[::-1]:
    print("Yes")
else:
    print("No")
`
    },
    java: {
      problem1: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        // Read input
        String name = sc.nextLine();
        
        // Print output
        System.out.println("Hello, " + name + "!");
        
        sc.close();
    }
}
`,
      problem2: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        // Read input and calculate sum
        int sum = 0;
        while (sc.hasNextInt()) {
            sum += sc.nextInt();
        }
        
        // Print output
        System.out.println(sum);
        
        sc.close();
    }
}
`,
      problem3: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        // Read input
        String text = sc.nextLine();
        
        // Check if palindrome
        boolean isPalindrome = true;
        for (int i = 0; i < text.length() / 2; i++) {
            if (text.charAt(i) != text.charAt(text.length() - 1 - i)) {
                isPalindrome = false;
                break;
            }
        }
        
        // Print output
        System.out.println(isPalindrome ? "Yes" : "No");
        
        sc.close();
    }
}
`
    },
    // Add templates for other languages...
  };
  
  if (templates[language] && templates[language][problem]) {
    res.send(templates[language][problem]);
  } else {
    res.status(404).send('Template not found');
  }
});

// Add a new endpoint to get the default team
app.get('/default-team', async (req, res) => {
  try {
    const activeTeam = await teamConfig.getActiveTeam();
    res.json({ team: activeTeam });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/admin-status', async (req, res) => {
  try {
    const leaderboard = await submissionQueue.getLeaderboard();
    const results = await fs.readJson(path.join(__dirname, 'db', 'results.json'));
    
    const teams = leaderboard.map(entry => {
      const teamResults = results[entry.team] || {};
      
      return {
        name: entry.team,
        score: entry.score || 0,
        problems: {
          problem1: teamResults.problem1 ? `${teamResults.problem1.score}%` : null,
          problem2: teamResults.problem2 ? `${teamResults.problem2.score}%` : null,
          problem3: teamResults.problem3 ? `${teamResults.problem3.score}%` : null
        }
      };
    });
    
    res.json({ teams });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add team endpoint
app.post('/team/add', async (req, res) => {
  try {
    const { teamName, members } = req.body;
    const team = await teamConfig.addTeam(teamName, members);
    res.json(team);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update timer endpoint
app.post('/team/timer', async (req, res) => {
  try {
    const { teamName, phase } = req.body;
    const team = await teamConfig.updateTeamTimer(teamName, phase);
    res.json(team);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get team status endpoint
app.get('/team/:teamName', async (req, res) => {
  try {
    const team = await teamConfig.getTeamStatus(req.params.teamName);
    if (!team) {
      res.status(404).json({ error: 'Team not found' });
    } else {
      res.json(team);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Set active team
app.post('/team/activate', express.json(), async (req, res) => {
  try {
    const { teamName } = req.body;
    await teamConfig.setActiveTeam(teamName);
    res.json({ message: 'Active team set successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(6969,'0.0.0.0', () => console.log("Server running on 6969"));