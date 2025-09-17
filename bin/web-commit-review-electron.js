#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { program } from 'commander';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Version from package.json
const packageJson = JSON.parse(await fs.readFile(path.join(__dirname, '..', 'package.json'), 'utf8'));

program
  .name('web-commit-review')
  .description('Web-based git commit review tool (Electron version)')
  .version(packageJson.version)
  .option('-d, --dir <path>', 'Target project directory', process.cwd())
  .option('-u, --url <url>', 'Initial demo URL to load in preview', 'http://localhost:5173')
  .option('-p, --port <port>', 'Port for the review tool server', '3000')
  .option('-s, --startup <command>', 'NPM script or command to run on startup (e.g., "npm run dev")')
  .option('-w, --worktree', 'Create a temporary git worktree', false)
  .option('--verbose', 'Enable verbose logging', false)
  .option('--browser', 'Use browser instead of Electron window', false)
  .parse();

const options = program.opts();

// If browser flag is set, use the original CLI
if (options.browser) {
  const originalCli = path.join(__dirname, 'web-commit-review.js');
  const child = spawn('node', [originalCli, ...process.argv.slice(2)], {
    stdio: 'inherit',
    shell: true
  });
  
  child.on('exit', (code) => {
    process.exit(code);
  });
} else {
  // Use Electron
  const electronPath = path.join(__dirname, '..', 'node_modules', '.bin', 'electron');
  const mainPath = path.join(__dirname, '..', 'lib', 'electron-main.js');
  
  // Prepare arguments for Electron
  const electronArgs = [mainPath];
  // Always pass the directory - use the resolved directory from options
  electronArgs.push('-d', options.dir);
  if (options.url) electronArgs.push('-u', options.url);
  if (options.port) electronArgs.push('-p', options.port);
  if (options.verbose) electronArgs.push('--verbose');
  
  console.log(chalk.bold.cyan(`
╔════════════════════════════════════╗
║  Web Commit Review Tool v${packageJson.version}     ║
║         (Electron Mode)            ║
╚════════════════════════════════════╝
  `));
  
  // Display parsed configuration
  console.log(chalk.gray('\n── Configuration ──────────────'));
  console.log(chalk.gray('Port:       '), chalk.white(options.port));
  console.log(chalk.gray('Directory:  '), chalk.white(options.dir));
  console.log(chalk.gray('Demo URL:   '), chalk.white(options.url));
  console.log(chalk.gray('Verbose:    '), chalk.white(options.verbose));
  console.log(chalk.gray('───────────────────────────────\n'));
  
  console.log(chalk.cyan('ℹ'), 'Launching Electron window...');
  
  const electron = spawn(electronPath, electronArgs, {
    stdio: 'inherit',
    env: { ...process.env },
    shell: false
  });
  
  electron.on('error', (error) => {
    console.error(chalk.red('✗'), 'Failed to start Electron:', error.message);
    process.exit(1);
  });
  
  electron.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(chalk.red('✗'), `Electron exited with code ${code}`);
    }
    process.exit(code || 0);
  });
}