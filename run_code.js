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
            
            try {
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
            } catch (error) {
                // Handle test case execution error
                results.push({
                    testName,
                    passed: false,
                    input: await fs.readFile(inputPath, 'utf-8'),
                    expectedOutput,
                    actualOutput: "",
                    error: error.message,
                    friendlyError: parseErrorMessage(error.message, language),
                });
            }
        }
        
        // Calculate score (e.g., percentage of tests passed)
        const score = Math.round((passedTests / totalTests) * 100);
        
        return {
            status: "completed",
            score,
            passedTests,
            totalTests,
            results,
            compilationError: false
        };
    } catch (error) {
        console.error(`Error running code: ${error.message}`);
        
        // Check if this is likely a compilation error
        const isCompilationError = error.message.includes('exited with code') || 
                                  error.message.includes('syntax error') ||
                                  error.message.includes('cannot find symbol');
        
        return {
            status: "error",
            error: error.message,
            friendlyError: parseErrorMessage(error.message, language),
            score: 0,
            passedTests: 0,
            totalTests: 0,
            results: [],
            compilationError: isCompilationError
        };
    }
};

function getDockerCommand(language, filePath, inputPath, containerName) {
    // Get clean filenames without escaping
    const fileName = path.basename(filePath);
    
    // Use proper Docker volume mounting (no need to escape spaces in quotes)
    const baseCommand = `docker run --name ${containerName} --rm`;
    const volumes = `-v "${filePath}:/code/${fileName}" -v "${inputPath}:/code/input.txt"`;
    
    switch(language.toLowerCase()) {
        case 'python':
        case 'py':
            // Use cat to pipe the input instead of shell redirection
            return `${baseCommand} ${volumes} python:3.9-slim sh -c "cat /code/input.txt | python /code/${fileName}"`;
        case 'java':
            return `${baseCommand} ${volumes} openjdk:11 sh -c "cat /code/input.txt | (cp /code/${fileName} /code/Main.java && javac /code/Main.java && java -cp /code Main)"`;
        case 'cpp':
        case 'c++':
            return `${baseCommand} ${volumes} gcc:latest sh -c "cat /code/input.txt | (g++ /code/${fileName} -o /code/a.out && /code/a.out)"`;
        case 'c':
            return `${baseCommand} ${volumes} gcc:latest sh -c "cat /code/input.txt | (gcc /code/${fileName} -o /code/a.out && /code/a.out)"`;
        case 'javascript':
        case 'js':
            return `${baseCommand} ${volumes} node:14-alpine sh -c "cat /code/input.txt | node /code/${fileName}"`;
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
            } else if (stderr.includes('expected')) {
                return 'Compiler Error: Missing semicolon or syntax issue. Check your code.';
            } else if (stderr.includes(';')) {
                return 'Missing semicolon. Check your code.';
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
            } else if (stderr.includes('IndentationError')) {
                return 'Incorrect indentation. Check your code spacing.';
            }
            break;
            
        case 'cpp':
        case 'c++':
        case 'c':
            if (stderr.includes('undefined reference')) {
                return 'You\'re using a function that hasn\'t been defined.';
            } else if (stderr.includes('expected')) {
                return 'Syntax error. You might be missing a semicolon, bracket, or have incorrect syntax.';
            }
            break;
            
        case 'javascript':
        case 'js':
            if (stderr.includes('ReferenceError')) {
                return 'You\'re using a variable that hasn\'t been defined.';
            } else if (stderr.includes('SyntaxError')) {
                return 'JavaScript syntax error. Check for missing brackets, semicolons, or other syntax issues.';
            }
            break;
    }
    
    // Generic error messages
    if (stderr.includes('exited with code')) {
        return 'Your code failed to compile. Check for syntax errors.';
    }
    
    return stderr; // Return original error if no specific message
}
