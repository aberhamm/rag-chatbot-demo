#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const path = require('path');

const CONTAINER_NAME = 'rag-chatbot-demo';
const COMPOSE_FILE = 'docker-compose.yml';
const MAX_WAIT_TIME = 30000; // 30 seconds
const CHECK_INTERVAL = 1000; // 1 second

function log(message) {
  console.log(`🐳 [Docker Setup] ${message}`);
}

function isDockerInstalled() {
  try {
    execSync('docker --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

function isContainerRunning() {
  try {
    const result = execSync(`docker ps --filter "name=${CONTAINER_NAME}" --format "{{.Names}}"`, { encoding: 'utf8' });
    return result.trim() === CONTAINER_NAME;
  } catch (error) {
    return false;
  }
}

function isPortInUse(port) {
  try {
    // Check if port is in use by any LISTENING process
    const result = execSync(`lsof -ti:${port} -sTCP:LISTEN`, { encoding: 'utf8', stdio: 'pipe' });
    return result.trim().length > 0;
  } catch (error) {
    // lsof returns non-zero exit code if port is not in use
    return false;
  }
}

function getPortConflictInfo(port) {
  try {
    const result = execSync(`lsof -i:${port}`, { encoding: 'utf8' });
    return result;
  } catch (error) {
    return 'Unable to determine what is using the port';
  }
}

function isDockerComposeAvailable() {
  try {
    execSync('docker compose version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    try {
      execSync('docker-compose --version', { stdio: 'ignore' });
      return true;
    } catch (error) {
      return false;
    }
  }
}

function getDockerComposeCommand() {
  try {
    execSync('docker compose version', { stdio: 'ignore' });
    return 'docker compose';
  } catch (error) {
    return 'docker-compose';
  }
}

function startDockerServices() {
  return new Promise((resolve, reject) => {
    const composeCmd = getDockerComposeCommand();
    log(`Starting Docker services with: ${composeCmd} up -d`);

    const child = spawn(composeCmd.split(' ')[0], [...composeCmd.split(' ').slice(1), 'up', '-d'], {
      stdio: 'pipe',
      cwd: process.cwd()
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
      process.stdout.write(data);
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
      process.stderr.write(data);
    });

    child.on('close', (code) => {
      if (code === 0) {
        log('Docker services started successfully');
        resolve();
      } else {
        reject(new Error(`Docker compose failed with code ${code}:\n${errorOutput}`));
      }
    });

    child.on('error', (error) => {
      reject(new Error(`Failed to start Docker compose: ${error.message}`));
    });
  });
}

async function waitForDatabase() {
  log('Waiting for database to be ready...');
  const startTime = Date.now();

  while (Date.now() - startTime < MAX_WAIT_TIME) {
    try {
      // Try to connect to the database
      execSync('docker exec rag-chatbot-demo pg_isready -U postgres', { stdio: 'ignore' });
      log('Database is ready!');
      return;
    } catch (error) {
      // Database not ready yet, wait a bit
      await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
    }
  }

  throw new Error('Database failed to become ready within timeout period');
}

async function ensureDockerServices() {
  try {
    // Check if Docker is installed
    if (!isDockerInstalled()) {
      throw new Error('Docker is not installed. Please install Docker Desktop and try again.');
    }

    // Check if Docker Compose is available
    if (!isDockerComposeAvailable()) {
      throw new Error('Docker Compose is not available. Please ensure Docker Desktop is properly installed.');
    }

    // Check if container is already running
    if (isContainerRunning()) {
      log(`Container '${CONTAINER_NAME}' is already running`);
      return;
    }

    // Check for port conflicts before starting
    if (isPortInUse(5432)) {
      const portInfo = getPortConflictInfo(5432);
      log('⚠️  Port 5432 is already in use');
      console.log('\nPort usage details:');
      console.log(portInfo);
      console.log('\nOptions to resolve:');
      console.log('1. Stop the existing PostgreSQL service:');
      console.log('   brew services stop postgresql  # if using Homebrew');
      console.log('   sudo systemctl stop postgresql  # if using systemd');
      console.log('2. Or change the port in docker-compose.yml');
      console.log('3. Or stop any existing Docker containers using this port');
      throw new Error('Port 5432 is already in use. Please resolve the conflict before continuing.');
    }

    // Check if docker-compose.yml exists
    const fs = require('fs');
    if (!fs.existsSync(COMPOSE_FILE)) {
      throw new Error(`${COMPOSE_FILE} not found in current directory`);
    }

    // Start Docker services
    log(`Container '${CONTAINER_NAME}' is not running. Starting Docker services...`);
    await startDockerServices();

    // Wait for database to be ready
    await waitForDatabase();

    log('Docker services are ready! 🚀');

  } catch (error) {
    console.error(`❌ [Docker Setup] Error: ${error.message}`);
    console.error('\nTo start Docker services manually, run:');
    console.error('  docker-compose up -d');
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  ensureDockerServices();
}

module.exports = { ensureDockerServices };
