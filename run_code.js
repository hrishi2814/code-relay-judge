const { exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

module.exports = async function runCodeInDocker(team, problem, language, filePath) {
    try {
        // Create a unique container name (remove spaces and special characters)
        const sanitizedTeam = team.replace(/[^a-zA-Z0-9]/g, '');
        const containerName = `judge-${sanitizedTeam}-${problem}-${Date.now()}`;
        
        // Get test cases for the problem
        const testCasesDir = path.join(__dirname, 'problems', problem, 'testcases');
        const testCases = await fs.readdir(testCasesDir);
        const inputFiles = testCases.filter(file => file.endsWith('.in'));
        
        let passedTests = 0;
        const totalTests = inputFiles.length;
        const results = [];

        // Language-specific Docker image and command
        const dockerConfig = {
            py: {
                image: 'python:3.9-slim',
                cmd: file => `python ${file}`
            },
            java: {
                image: 'openjdk:11-jdk-slim',
                cmd: file => `javac ${file} && java Main`
            },
            cpp: {
                image: 'gcc:latest',
                cmd: file => `g++ -std=c++17 ${file} -o program && ./program`
            },
            js: {
                image: 'node:14-alpine',
                cmd: file => `node ${file}`
            },
            javascript: {
                image: 'node:14-alpine',
                cmd: file => `node ${file}`
            }
        };

        const config = dockerConfig[language];
        if (!config) {
            throw new Error('Unsupported language');
        }

        // Run each test case
        for (const inputFile of inputFiles) {
            const testNumber = inputFile.split('.')[0];
            const outputFile = path.join(testCasesDir, `${testNumber}.out`);
            const expectedOutput = await fs.readFile(outputFile, 'utf8');

            // Construct Docker command
            const dockerCmd = `docker run --name ${containerName} --rm` +
                ` -v "${filePath}:/code/solution${language === 'java' ? '.java' : '.' + language}"` +
                ` -v "${path.join(testCasesDir, inputFile)}:/code/input.txt"` +
                ` ${config.image}` +
                ` sh -c "cd /code && (cat input.txt | tr -d '\\r' > input_unix.txt) && ${config.cmd(`solution${language === 'java' ? '.java' : '.' + language}`)} < input_unix.txt"`;

            try {
                const { stdout } = await execPromise(dockerCmd);
                const actualOutput = stdout.trim();

                const passed = actualOutput === expectedOutput.trim();
                if (passed) passedTests++;

                results.push({
                    test: testNumber,
                    passed,
                    input: await fs.readFile(path.join(testCasesDir, inputFile), 'utf8'),
                    expectedOutput: expectedOutput.trim(),
                    actualOutput
                });

            } catch (error) {
                results.push({
                    test: testNumber,
                    passed: false,
                    input: await fs.readFile(path.join(testCasesDir, inputFile), 'utf8'),
                    expectedOutput: expectedOutput.trim(),
                    actualOutput: error.message,
                    error: error.message
                });
            }
        }

        return {
            passedTests,
            totalTests,
            score: Math.floor((passedTests / totalTests) * 100),
            results
        };

    } catch (error) {
        console.error('Error running code:', error);
        throw error;
    }
}

function getDockerCommand(language, filePath, inputPath, containerName) {
    const fileName = path.basename(filePath);
    const baseCommand = `docker run --name ${containerName} --rm`;
    const volumes = `-v "${filePath}:/code/${fileName}" -v "${inputPath}:/code/input.txt"`;
    
    switch(language.toLowerCase()) {
        case 'python':
        case 'py':
            return `${baseCommand} ${volumes} python:3.9-slim sh -c "cat /code/input.txt | python /code/${fileName}"`;
        case 'java':
            return `${baseCommand} ${volumes} openjdk:11 sh -c "cat /code/input.txt | (cp /code/${fileName} /code/Main.java && javac /code/Main.java && java -cp /code Main)"`;
        case 'cpp':
        case 'c++':
            return `${baseCommand} ${volumes} gcc:latest sh -c "cat /code/input.txt | (g++ /code/${fileName} -o /code/a.out && /code/a.out)"`;
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
