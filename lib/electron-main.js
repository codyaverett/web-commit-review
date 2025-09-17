import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { startServer } from './server.js';
import { loadConfig } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let serverInstance;
let startupProcess;

// Get command line arguments
const args = process.argv.slice(2);
const options = {
  port: 3000,
  targetDir: process.cwd(),
  initialUrl: null,
  startup: null,
  verbose: false
};

// Parse command line arguments
for (let i = 0; i < args.length; i++) {
  switch(args[i]) {
    case '-p':
    case '--port':
      options.port = parseInt(args[++i]);
      break;
    case '-d':
    case '--dir':
      // Resolve relative paths from the current working directory
      const dirPath = args[++i];
      options.targetDir = path.isAbsolute(dirPath) ? dirPath : path.resolve(process.cwd(), dirPath);
      break;
    case '-u':
    case '--url':
      options.initialUrl = args[++i];
      break;
    case '-s':
    case '--startup':
      options.startup = args[++i];
      break;
    case '--verbose':
      options.verbose = true;
      break;
  }
}

// Set default initialUrl with the port if not provided
if (!options.initialUrl) {
  options.initialUrl = `http://localhost:${options.port}`;
}

async function createWindow() {
  // Display configuration
  console.log('\n=== Configuration Settings ===');
  console.log(`Port:            ${options.port}`);
  console.log(`Target Dir:      ${options.targetDir}`);
  console.log(`Demo URL:        ${options.initialUrl}`);
  console.log(`Startup Cmd:     ${options.startup || 'none'}`);
  console.log(`Verbose Mode:    ${options.verbose}`);
  console.log(`Process CWD:     ${process.cwd()}`);
  console.log(`Electron Ver:    ${process.versions.electron}`);
  console.log(`Node Ver:        ${process.versions.node}`);
  console.log('==============================\n');

  // Start the startup command if provided
  if (options.startup) {
    console.log(`Starting: ${options.startup} in ${options.targetDir}`);
    
    // Parse the command and arguments
    const [command, ...commandArgs] = options.startup.split(' ');
    
    startupProcess = spawn(command, commandArgs, {
      cwd: options.targetDir,
      shell: true,
      stdio: options.verbose ? 'inherit' : 'ignore',
      env: { ...process.env }
    });

    startupProcess.on('error', (error) => {
      console.error(`Failed to start command: ${error.message}`);
    });

    if (options.verbose) {
      startupProcess.on('exit', (code) => {
        console.log(`Startup command exited with code ${code}`);
      });
    }

    console.log(`Started: ${options.startup}`);
    
    // Wait a bit for the dev server to start
    console.log('Waiting for dev server to initialize...');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  // Start the server first
  try {
    await loadConfig(options);
    serverInstance = await startServer(options);
    console.log(`Server running at: http://localhost:${options.port}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    app.quit();
    return;
  }

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    },
    title: 'Web Commit Review Tool',
    icon: path.join(__dirname, '..', 'public', 'favicon.ico') // Optional: add an icon if you have one
  });

  // Load the review tool
  mainWindow.loadURL(`http://localhost:${options.port}`);

  // Open DevTools in development
  if (options.verbose) {
    mainWindow.webContents.openDevTools();
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed
app.on('window-all-closed', async () => {
  if (startupProcess && !startupProcess.killed) {
    console.log('Stopping startup process...');
    startupProcess.kill();
  }
  if (serverInstance) {
    await serverInstance.close();
  }
  app.quit();
});

// On macOS, re-create window when dock icon is clicked
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Handle app termination
app.on('before-quit', async (event) => {
  if (startupProcess || serverInstance) {
    event.preventDefault();
    try {
      if (startupProcess && !startupProcess.killed) {
        console.log('Stopping startup process...');
        startupProcess.kill();
        startupProcess = null;
      }
      if (serverInstance) {
        await serverInstance.close();
        serverInstance = null;
      }
      app.quit();
    } catch (error) {
      console.error('Error during cleanup:', error);
      app.quit();
    }
  }
});