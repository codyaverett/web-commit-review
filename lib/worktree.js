// Git worktree management module

import simpleGit from 'simple-git';
import path from 'path';
import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import crypto from 'crypto';

const execAsync = promisify(exec);

// Store active worktrees for cleanup
const activeWorktrees = new Set();

/**
 * Install dependencies if package.json exists
 * @param {string} worktreePath - Path to the worktree
 */
async function installDependenciesIfNeeded(worktreePath) {
  try {
    // Check for package.json
    const packageJsonPath = path.join(worktreePath, 'package.json');
    await fs.access(packageJsonPath);
    
    console.log('Installing dependencies in worktree...');
    
    // Detect package manager
    let installCmd;
    
    // Check for lock files to determine package manager
    try {
      await fs.access(path.join(worktreePath, 'pnpm-lock.yaml'));
      installCmd = 'pnpm install';
    } catch {
      try {
        await fs.access(path.join(worktreePath, 'yarn.lock'));
        installCmd = 'yarn install';
      } catch {
        try {
          await fs.access(path.join(worktreePath, 'package-lock.json'));
          installCmd = 'npm ci';
        } catch {
          // Default to npm install if no lock file found
          installCmd = 'npm install';
        }
      }
    }
    
    console.log(`Running: ${installCmd}`);
    const { stdout, stderr } = await execAsync(installCmd, { 
      cwd: worktreePath,
      maxBuffer: 10 * 1024 * 1024 // Increase buffer size for large installs
    });
    
    if (stderr && !stderr.includes('WARN')) {
      console.warn('Install warnings:', stderr);
    }
    
    console.log('Dependencies installed successfully');
  } catch (error) {
    if (error.code === 'ENOENT') {
      // No package.json, that's fine
      return;
    }
    console.warn('Could not install dependencies:', error.message);
    console.log('You may need to install dependencies manually');
  }
}

/**
 * Create a temporary git worktree from the current repository state
 * @param {string} repoPath - Path to the git repository
 * @returns {string} Path to the created worktree
 */
export async function createWorktree(repoPath) {
  const git = simpleGit(repoPath);
  
  // Check if it's a git repository
  const isRepo = await git.checkIsRepo();
  if (!isRepo) {
    throw new Error(`${repoPath} is not a git repository`);
  }
  
  // Generate unique worktree name
  const timestamp = Date.now();
  const hash = crypto.randomBytes(4).toString('hex');
  const worktreeName = `review-tool-${timestamp}-${hash}`;
  
  // Create temporary directory for worktree
  const tmpDir = process.platform === 'win32' 
    ? path.join(process.env.TEMP || '', 'web-commit-review')
    : path.join('/tmp', 'web-commit-review');
  
  await fs.mkdir(tmpDir, { recursive: true });
  
  const worktreePath = path.join(tmpDir, worktreeName);
  
  try {
    // Get current branch/commit
    const status = await git.status();
    const currentBranch = status.current;
    
    // Create worktree from current HEAD
    await git.raw(['worktree', 'add', worktreePath, 'HEAD']);
    
    // Store for cleanup
    activeWorktrees.add(worktreePath);
    
    // If there are uncommitted changes, apply them to the worktree
    if (!status.isClean()) {
      console.log('Applying uncommitted changes to worktree...');
      
      // Create a temporary stash
      const stashResult = await git.stash(['push', '-m', 'web-commit-review-temp']);
      const hasStash = stashResult && !stashResult.includes('No local changes');
      
      if (hasStash) {
        // Apply stash to worktree
        const worktreeGit = simpleGit(worktreePath);
        try {
          await worktreeGit.stash(['apply']);
        } catch (error) {
          console.warn('Could not apply uncommitted changes to worktree:', error.message);
        }
        
        // Pop the stash from original repo
        await git.stash(['pop']);
      }
    }
    
    // Check if dependencies need to be installed
    await installDependenciesIfNeeded(worktreePath);
    
    return worktreePath;
    
  } catch (error) {
    // Cleanup on error
    try {
      await cleanupWorktree(worktreePath);
    } catch (cleanupError) {
      console.error('Failed to cleanup worktree:', cleanupError);
    }
    throw new Error(`Failed to create worktree: ${error.message}`);
  }
}

/**
 * Clean up a git worktree
 * @param {string} worktreePath - Path to the worktree
 */
export async function cleanupWorktree(worktreePath) {
  if (!worktreePath) return;
  
  try {
    // Find the main repository path
    const git = simpleGit(worktreePath);
    let mainRepoPath;
    
    try {
      // Get the path to the main repository
      const result = await git.raw(['rev-parse', '--git-common-dir']);
      mainRepoPath = path.dirname(result.trim());
      
      // If it's a relative path, resolve it
      if (!path.isAbsolute(mainRepoPath)) {
        mainRepoPath = path.resolve(worktreePath, mainRepoPath);
      }
      
      // Clean up .git reference if it exists
      if (mainRepoPath.endsWith('/.git')) {
        mainRepoPath = path.dirname(mainRepoPath);
      }
    } catch (error) {
      console.warn('Could not determine main repo path:', error.message);
    }
    
    // Remove worktree from git
    if (mainRepoPath) {
      const mainGit = simpleGit(mainRepoPath);
      try {
        await mainGit.raw(['worktree', 'remove', worktreePath, '--force']);
      } catch (error) {
        // Try alternative cleanup method
        console.warn('Standard worktree removal failed, trying alternative method');
        await execAsync(`git worktree remove "${worktreePath}" --force`, { cwd: mainRepoPath });
      }
    }
    
    // Remove directory if it still exists
    try {
      await fs.rm(worktreePath, { recursive: true, force: true });
    } catch (error) {
      console.warn('Could not remove worktree directory:', error.message);
    }
    
    // Remove from active set
    activeWorktrees.delete(worktreePath);
    
  } catch (error) {
    console.error('Worktree cleanup error:', error);
    // Try to force remove the directory anyway
    try {
      await fs.rm(worktreePath, { recursive: true, force: true });
    } catch (rmError) {
      // Ignore if already removed
    }
  }
}

/**
 * Clean up all active worktrees
 */
export async function cleanupAllWorktrees() {
  const promises = Array.from(activeWorktrees).map(worktreePath => 
    cleanupWorktree(worktreePath).catch(error => 
      console.error(`Failed to cleanup worktree ${worktreePath}:`, error)
    )
  );
  
  await Promise.all(promises);
  activeWorktrees.clear();
}

/**
 * List all worktrees for a repository
 * @param {string} repoPath - Path to the git repository
 */
export async function listWorktrees(repoPath) {
  const git = simpleGit(repoPath);
  
  try {
    const result = await git.raw(['worktree', 'list', '--porcelain']);
    const worktrees = [];
    let current = {};
    
    result.split('\n').forEach(line => {
      if (line.startsWith('worktree ')) {
        if (current.path) {
          worktrees.push(current);
        }
        current = { path: line.substring(9) };
      } else if (line.startsWith('HEAD ')) {
        current.head = line.substring(5);
      } else if (line.startsWith('branch ')) {
        current.branch = line.substring(7);
      }
    });
    
    if (current.path) {
      worktrees.push(current);
    }
    
    return worktrees;
  } catch (error) {
    console.error('Failed to list worktrees:', error);
    return [];
  }
}

// Cleanup on process exit
process.on('exit', () => {
  if (activeWorktrees.size > 0) {
    console.log('Cleaning up worktrees...');
    // Synchronous cleanup attempt
    activeWorktrees.forEach(worktreePath => {
      try {
        require('child_process').execSync(`git worktree remove "${worktreePath}" --force 2>/dev/null`);
      } catch {
        // Ignore errors
      }
    });
  }
});