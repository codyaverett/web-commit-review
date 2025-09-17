#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';
import open from 'open';
import { startServer } from '../lib/server.js';
import { createWorktree, cleanupWorktree } from '../lib/worktree.js';
import { ProcessManager } from '../lib/process-manager.js';
import { loadConfig } from '../lib/config.js';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Version from package.json
const packageJson = JSON.parse(await fs.readFile(path.join(__dirname, '..', 'package.json'), 'utf8'));

program
  .name('web-commit-review')
  .description('Web-based git commit review tool for browsing branches and commits')
  .version(packageJson.version)
  .option('-d, --dir <path>', 'Target project directory', process.cwd())
  .option('-u, --url <url>', 'Initial demo URL to load in preview')
  .option('-p, --port <port>', 'Port for the review tool server', '3000')
  .option('-s, --startup <command>', 'NPM script or command to run on startup (e.g., "npm run dev")')
  .option('-w, --worktree', 'Create a temporary git worktree', false)
  .option('--no-open', 'Do not automatically open browser')
  .option('--verbose', 'Enable verbose logging', false)
  .parse();

const options = program.opts();

// Resolve the directory path (handles both relative and absolute paths)
options.dir = path.resolve(options.dir);

// Set default URL with port if not provided
if (!options.url) {
  options.url = `http://localhost:${options.port}`;
}

// Setup console logging
const log = {
  info: (msg) => console.log(chalk.cyan('ℹ'), msg),
  success: (msg) => console.log(chalk.green('✓'), msg),
  error: (msg) => console.error(chalk.red('✗'), msg),
  warn: (msg) => console.warn(chalk.yellow('⚠'), msg),
  debug: (msg) => options.verbose && console.log(chalk.gray('⬢'), msg)
};

// Main execution
async function main() {
  let workingDir = path.resolve(options.dir);
  let worktreePath = null;
  let processManager = null;
  let serverInstance = null;

  // Banner
  console.log(chalk.bold.cyan(`
╔════════════════════════════════════╗
║  Web Commit Review Tool v${packageJson.version}     ║
╚════════════════════════════════════╝
  `));

  // Display configuration
  console.log(chalk.gray('\n── Configuration ──────────────'));
  console.log(chalk.gray('Port:       '), chalk.white(options.port));
  console.log(chalk.gray('Directory:  '), chalk.white(options.dir));
  console.log(chalk.gray('Demo URL:   '), chalk.white(options.url));
  console.log(chalk.gray('Startup:    '), chalk.white(options.startup || 'none'));
  console.log(chalk.gray('Worktree:   '), chalk.white(options.worktree));
  console.log(chalk.gray('Auto-open:  '), chalk.white(options.open));
  console.log(chalk.gray('Verbose:    '), chalk.white(options.verbose));
  console.log(chalk.gray('───────────────────────────────\n'));

  try {
    // Validate directory
    try {
      const stats = await fs.stat(workingDir);
      if (!stats.isDirectory()) {
        throw new Error(`Not a directory: ${workingDir}`);
      }
    } catch (error) {
      log.error(`Invalid directory: ${workingDir}`);
      process.exit(1);
    }

    log.info(`Target directory: ${chalk.bold(workingDir)}`);

    // Check if it's a git repository
    const gitDir = path.join(workingDir, '.git');
    try {
      await fs.access(gitDir);
      log.success('Git repository detected');
    } catch {
      log.warn('Not a git repository. Some features may be limited.');
    }

    // Create temporary worktree if requested
    if (options.worktree) {
      log.info('Creating temporary git worktree...');
      try {
        worktreePath = await createWorktree(workingDir);
        workingDir = worktreePath;
        log.success(`Worktree created at: ${worktreePath}`);
      } catch (error) {
        log.error(`Failed to create worktree: ${error.message}`);
        if (!options.verbose) {
          log.info('Run with --verbose for more details');
        }
        process.exit(1);
      }
    }

    // Start the startup command if provided
    if (options.startup) {
      log.info(`Starting: ${chalk.bold(options.startup)}`);
      processManager = new ProcessManager();
      
      try {
        await processManager.startProcess(options.startup, workingDir);
        log.success(`Started: ${options.startup}`);
        
        // Wait a bit for the dev server to start
        log.info('Waiting for dev server to initialize...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        log.error(`Failed to start command: ${error.message}`);
        await cleanup();
        process.exit(1);
      }
    }

    // Prepare server configuration
    const config = {
      port: parseInt(options.port),
      targetDir: workingDir,
      initialUrl: options.url,
      isWorktree: !!options.worktree,
      verbose: options.verbose
    };

    // Save configuration for the server to use
    await loadConfig(config);

    // Start the review tool server
    log.info(`Starting review tool server on port ${config.port}...`);
    
    try {
      serverInstance = await startServer(config);
      log.success(`Server running at: ${chalk.bold(`http://localhost:${config.port}`)}`);
      
      // Open browser if requested
      if (options.open) {
        log.info('Opening browser...');
        await open(`http://localhost:${config.port}`);
      }
      
      log.info('Press Ctrl+C to stop the server');
      
      // Display helpful information
      console.log(chalk.gray('\n' + '─'.repeat(40)));
      console.log(chalk.bold('Quick Tips:'));
      console.log('  • Use the branch selector to switch branches');
      console.log('  • Navigate commits with Previous/Next buttons');
      console.log('  • Click ☰ to toggle the commit details sidebar');
      console.log('  • Set your dev server URL in the toolbar');
      console.log(chalk.gray('─'.repeat(40) + '\n'));
      
    } catch (error) {
      log.error(`Failed to start server: ${error.message}`);
      await cleanup();
      process.exit(1);
    }

  } catch (error) {
    log.error(`Unexpected error: ${error.message}`);
    if (options.verbose) {
      console.error(error);
    }
    await cleanup();
    process.exit(1);
  }

  // Cleanup function
  async function cleanup() {
    log.info('Shutting down...');
    
    if (processManager) {
      log.info('Stopping startup process...');
      await processManager.stopAll();
    }
    
    if (serverInstance) {
      log.info('Stopping server...');
      await serverInstance.close();
    }
    
    if (worktreePath) {
      log.info('Cleaning up worktree...');
      try {
        await cleanupWorktree(worktreePath);
        log.success('Worktree cleaned up');
      } catch (error) {
        log.warn(`Failed to cleanup worktree: ${error.message}`);
      }
    }
  }

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n');
    await cleanup();
    log.success('Goodbye!');
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await cleanup();
    process.exit(0);
  });

  process.on('uncaughtException', async (error) => {
    log.error(`Uncaught exception: ${error.message}`);
    if (options.verbose) {
      console.error(error);
    }
    await cleanup();
    process.exit(1);
  });

  process.on('unhandledRejection', async (reason) => {
    log.error(`Unhandled rejection: ${reason}`);
    if (options.verbose) {
      console.error(reason);
    }
    await cleanup();
    process.exit(1);
  });
}

// Run the CLI
main().catch((error) => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});