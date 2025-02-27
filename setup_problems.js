const fs = require('fs-extra');
const path = require('path');

// Problem types and their point values
const PROBLEM_TYPES = {
  main: 100,
  cookie: 25
};

async function setupProblem(type, number, config) {
  if (!PROBLEM_TYPES[type]) {
    throw new Error(`Invalid problem type: ${type}. Must be one of: ${Object.keys(PROBLEM_TYPES)}`);
  }

  const problemDir = path.join(__dirname, 'problems', `${type}${number}`);
  await fs.ensureDir(problemDir);
  
  // Create description
  const description = `# ${config.title}\n
## Problem Description
${config.description}\n
## Input Format
${config.input}\n
## Output Format
${config.output}\n
## Points: ${PROBLEM_TYPES[type]}\n
## Examples
${config.examples.map(ex => `Input:\n${ex.input}\n\nOutput:\n${ex.output}`).join('\n\n')}`;

  await fs.writeFile(path.join(problemDir, 'description.md'), description);
  
  // Create testcase directory
  const testcaseDir = path.join(problemDir, 'testcases');
  await fs.ensureDir(testcaseDir);
  
  // Create test cases
  for (const [i, test] of config.testCases.entries()) {
    await fs.writeFile(path.join(testcaseDir, `test${i+1}.in`), test.input);
    await fs.writeFile(path.join(testcaseDir, `test${i+1}.out`), test.output);
  }

  // Create solution templates
  const templates = {
    py: config.templates.python || '',
    java: config.templates.java || '',
    cpp: config.templates.cpp || '',
    js: config.templates.javascript || ''
  };

  const templateDir = path.join(problemDir, 'templates');
  await fs.ensureDir(templateDir);
  
  for (const [lang, code] of Object.entries(templates)) {
    await fs.writeFile(path.join(templateDir, `template.${lang}`), code);
  }
}

// Example usage:
async function addNewProblem() {
  const problemConfig = {
    title: "Find the Second Largest",
    description: "Given an array of N integers, find the second largest number. If no second largest exists, return -1.",
    input: "First line contains N (number of integers)\nSecond line contains N space-separated integers",
    output: "A single integer representing the second largest number, or -1 if it doesn't exist",
    examples: [
      {
        input: "6\n10 20 4 45 99 99",
        output: "45"
      }
    ],
    testCases: [
      {
        input: "6\n10 20 4 45 99 99",
        output: "45"
      },
      // Add more test cases
    ],
    templates: {
      python: "# Read N\nn = int(input())\n# Read array\narr = list(map(int, input().split()))",
      java: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        // Your code here\n    }\n}",
      cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    // Your code here\n    return 0;\n}"
    }
  };

  await setupProblem('main', 1, problemConfig);
}

// Run the script
addNewProblem().catch(console.error);
