import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { startServer } from './server.js';
import { loadConfig } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let serverInstance;

// Get command line arguments
const args = process.argv.slice(2);
const options = {
  port: 3000,
  targetDir: process.cwd(),
  initialUrl: 'http://localhost:5173',
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
      options.targetDir = path.resolve(args[++i]);
      break;
    case '-u':
    case '--url':
      options.initialUrl = args[++i];
      break;
    case '--verbose':
      options.verbose = true;
      break;
  }
}

async function createWindow() {
  // Display configuration
  console.log('\n=== Configuration Settings ===');
  console.log(`Port:            ${options.port}`);
  console.log(`Target Dir:      ${options.targetDir}`);
  console.log(`Demo URL:        ${options.initialUrl}`);
  console.log(`Verbose Mode:    ${options.verbose}`);
  console.log(`Process CWD:     ${process.cwd()}`);
  console.log(`Electron Ver:    ${process.versions.electron}`);
  console.log(`Node Ver:        ${process.versions.node}`);
  console.log('==============================\n');

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
  if (serverInstance) {
    event.preventDefault();
    try {
      await serverInstance.close();
      serverInstance = null;
      app.quit();
    } catch (error) {
      console.error('Error closing server:', error);
      app.quit();
    }
  }
});