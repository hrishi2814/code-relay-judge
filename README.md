# Code Relay Judge

A competitive programming judge system for code relay competitions.

## Overview

This system allows teams to submit solutions to coding problems, automatically evaluates them, and displays rankings on a leaderboard.

## Features

- **Multi-language Support**: Run code in Python, Java, C++, C, and JavaScript
- **Secure Execution**: All code runs in isolated Docker containers
- **Real-time Updates**: Track submission status and leaderboard changes
- **Multiple Problems**: Support for various coding challenges
- **Automatic Testing**: Solutions are tested against multiple test cases

## Architecture

### Server (`server.js`)

Express.js server handling HTTP requests for submissions, status checks, and leaderboard data.

### Submission Queue (`queue.js`)

Manages code submissions with:
- In-memory queue for pending submissions
- Sequential processing to prevent resource contention
- Result storage and leaderboard updates

### Code Runner (`run_code.js`)

Executes submitted code by:
- Creating isolated Docker containers
- Mounting code files and test inputs
- Running against test cases
- Comparing outputs with expected results
- Calculating scores based on passed tests

### Database (`database.js`)

Simple file-based storage for:
- Submission results
- Leaderboard data
- Competition state

### Frontend

Web interface for:
- Code submission
- Problem descriptions
- Real-time status updates
- Leaderboard viewing

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Ensure Docker is installed and running

3. Start the server:
   ```
   node server.js
   ```

4. Access the web interface at `http://localhost:6969`

## File Structure

- `/submissions/`: Submitted code files
- `/problems/`: Problem descriptions and test cases
- `/db/`: Leaderboard and results data
- `/public/`: Frontend files

## Reset Competition

To reset the competition state:
```
node reset.js
```

## Requirements

- Node.js
- Docker
- npm packages: express, fs-extra, multer