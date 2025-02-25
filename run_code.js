const { exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

module.exports = async function runCodeInDocker(team, problem, language, filePath) {
    try {
        // Create a unique container name
        const containerName = `judge-${team}-${problem}-${Date.now()}`;
        
        // Get test cases for the problem
        const testCasesDir = path.join(__dirname, 'problems', problem, 'testcases');
        const testCases = await fs.readdir(testCasesDir);
        const inputFiles = testCases.filter(file => file.endsWith('.in'));
        
        let passedTests = 0;
        const totalTests = inputFiles.length;
        const results = [];
        
        // Run each test case
        for (const inputFile of inputFiles) {
            const testName = inputFile.replace('.in', '');
            const outputFile = `${testName}.out`;
            
            const inputPath = path.join(testCasesDir, inputFile);
            const expectedOutputPath = path.join(testCasesDir, outputFile);
            
            // Read expected output
            const expectedOutput = (await fs.readFile(expectedOutputPath, 'utf-8')).trim();
            
            // Run code in Docker with appropriate command based on language
            const dockerCommand = getDockerCommand(language, filePath, inputPath, containerName);
            
            const { stdout, stderr } = await execPromise(dockerCommand, { timeout: 10000 });
            const actualOutput = stdout.trim();
            
            const passed = actualOutput === expectedOutput;
            if (passed) passedTests++;
            
            results.push({
                testName,
                passed,
                input: await fs.readFile(inputPath, 'utf-8'),
                expectedOutput,
                actualOutput,
                error: stderr,
                friendlyError: parseErrorMessage(stderr, language),
                diff: passed ? null : {
                    expected: expectedOutput,
                    actual: actualOutput,
                    mismatch: highlightDifference(expectedOutput, actualOutput)
                }
            });
        }
        
        // Calculate score (e.g., percentage of tests passed)
        const score = Math.round((passedTests / totalTests) * 100);
        
        return {
            status: "completed",
            score,
            passedTests,
            totalTests,
            results
        };
    } catch (error) {
        console.error(`Error running code: ${error.message}`);
        return {
            status: "error",
            error: error.message
        };
    }
};

function getDockerCommand(language, filePath, inputPath, containerName) {
    const fileName = path.basename(filePath);
    const baseCommand = `docker run --name ${containerName} --rm -v "${filePath}:/code/${fileName}" -v "${inputPath}:/code/input.txt"`;
    
    switch(language.toLowerCase()) {
        case 'python':
        case 'py':
            return `${baseCommand} python:3.9-slim python /code/${fileName} < /code/input.txt`;
        case 'java':
            // Create a temporary Main.java file inside the container
            return `${baseCommand} openjdk:11 bash -c "cp /code/${fileName} /code/Main.java && javac /code/Main.java && java -cp /code Main < /code/input.txt"`;
        case 'cpp':
        case 'c++':
            return `${baseCommand} gcc:latest bash -c "g++ /code/${fileName} -o /code/a.out && /code/a.out < /code/input.txt"`;
        case 'c':
            return `${baseCommand} gcc:latest bash -c "gcc /code/${fileName} -o /code/a.out && /code/a.out < /code/input.txt"`;
        case 'javascript':
        case 'js':
            return `${baseCommand} node:14-alpine node /code/${fileName} < /code/input.txt`;
        default:
            throw new Error(`Unsupported language: ${language}`);
    }
}

function highlightDifference(expected, actual) {
    if (expected.length !== actual.length) {
        return `Length mismatch: expected ${expected.length} characters, got ${actual.length}`;
    }
    
    const diffPositions = [];
    for (let i = 0; i < expected.length; i++) {
        if (expected[i] !== actual[i]) {
            diffPositions.push(i);
        }
    }
    
    return `Differences at positions: ${diffPositions.join(', ')}`;
}

function parseErrorMessage(stderr, language) {
    if (!stderr) return null;
    
    // Language-specific error parsing
    switch (language.toLowerCase()) {
        case 'java':
            if (stderr.includes('cannot find symbol')) {
                return 'You might be using a variable that hasn\'t been declared.';
            } else if (stderr.includes('incompatible types')) {
                return 'Type mismatch error. Check your variable types.';
            } else if (stderr.includes('reached end of file while parsing')) {
                return 'Missing closing bracket or semicolon.';
            }
            break;
            
        case 'py':
        case 'python':
            if (stderr.includes('SyntaxError')) {
                return 'Python syntax error. Check for missing colons, indentation, or brackets.';
            } else if (stderr.includes('NameError')) {
                return 'You\'re using a variable that hasn\'t been defined.';
            } else if (stderr.includes('ValueError')) {
                return 'Error in value conversion. Make sure you\'re converting strings to numbers correctly.';
            }
            break;
            
        // Add more languages...
    }
    
    return stderr; // Return original error if no specific message
}
