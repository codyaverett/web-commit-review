// Configuration management module

let currentConfig = {
  port: 3000,
  targetDir: process.cwd(),
  initialUrl: 'http://localhost:5173',
  isWorktree: false,
  verbose: false
};

export async function loadConfig(config) {
  currentConfig = { ...currentConfig, ...config };
  return currentConfig;
}

export function getConfig() {
  return currentConfig;
}

export function updateConfig(updates) {
  currentConfig = { ...currentConfig, ...updates };
  return currentConfig;
}

export function getPort() {
  return currentConfig.port;
}

export function getTargetDir() {
  return currentConfig.targetDir;
}

export function getInitialUrl() {
  return currentConfig.initialUrl;
}

export function isWorktree() {
  return currentConfig.isWorktree;
}

export function isVerbose() {
  return currentConfig.verbose;
}