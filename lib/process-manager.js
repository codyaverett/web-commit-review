// Process manager for handling startup commands

import { spawn } from 'child_process';
import chalk from 'chalk';

export class ProcessManager {
  constructor() {
    this.processes = new Map();
  }

  /**
   * Start a process with the given command
   * @param {string} command - Command to execute
   * @param {string} cwd - Working directory
   * @returns {Promise<number>} Process ID
   */
  async startProcess(command, cwd) {
    return new Promise((resolve, reject) => {
      // Parse command into command and arguments
      const parts = command.split(' ');
      const cmd = parts[0];
      const args = parts.slice(1);
      
      // Spawn the process
      const child = spawn(cmd, args, {
        cwd,
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env }
      });
      
      const processInfo = {
        process: child,
        command,
        cwd,
        startTime: Date.now()
      };
      
      // Store process
      this.processes.set(child.pid, processInfo);
      
      // Handle stdout
      child.stdout.on('data', (data) => {
        const lines = data.toString().split('\n').filter(line => line.trim());
        lines.forEach(line => {
          console.log(chalk.gray(`  [${cmd}]`), line);
        });
      });
      
      // Handle stderr
      child.stderr.on('data', (data) => {
        const lines = data.toString().split('\n').filter(line => line.trim());
        lines.forEach(line => {
          console.error(chalk.yellow(`  [${cmd}]`), line);
        });
      });
      
      // Handle process exit
      child.on('exit', (code, signal) => {
        this.processes.delete(child.pid);
        if (code !== 0 && code !== null) {
          console.log(chalk.red(`Process ${cmd} exited with code ${code}`));
        }
        if (signal) {
          console.log(chalk.yellow(`Process ${cmd} terminated by signal ${signal}`));
        }
      });
      
      // Handle errors
      child.on('error', (error) => {
        this.processes.delete(child.pid);
        reject(new Error(`Failed to start process: ${error.message}`));
      });
      
      // Check if process started successfully
      setTimeout(() => {
        if (child.killed) {
          reject(new Error('Process terminated immediately after starting'));
        } else {
          resolve(child.pid);
        }
      }, 1000);
    });
  }

  /**
   * Stop a specific process
   * @param {number} pid - Process ID
   */
  async stopProcess(pid) {
    const processInfo = this.processes.get(pid);
    if (!processInfo) {
      return;
    }
    
    return new Promise((resolve) => {
      const { process: child, command } = processInfo;
      
      // Set timeout for force kill
      const killTimeout = setTimeout(() => {
        console.log(chalk.yellow(`Force killing process: ${command}`));
        child.kill('SIGKILL');
        this.processes.delete(pid);
        resolve();
      }, 5000);
      
      // Try graceful shutdown first
      child.once('exit', () => {
        clearTimeout(killTimeout);
        this.processes.delete(pid);
        resolve();
      });
      
      // Send SIGTERM for graceful shutdown
      child.kill('SIGTERM');
    });
  }

  /**
   * Stop all managed processes
   */
  async stopAll() {
    const promises = Array.from(this.processes.keys()).map(pid => 
      this.stopProcess(pid)
    );
    
    await Promise.all(promises);
    this.processes.clear();
  }

  /**
   * Get status of all processes
   */
  getStatus() {
    const status = [];
    
    for (const [pid, info] of this.processes) {
      const uptime = Date.now() - info.startTime;
      status.push({
        pid,
        command: info.command,
        cwd: info.cwd,
        uptime: Math.floor(uptime / 1000),
        running: !info.process.killed
      });
    }
    
    return status;
  }

  /**
   * Check if a process is running
   * @param {number} pid - Process ID
   */
  isRunning(pid) {
    const processInfo = this.processes.get(pid);
    return processInfo && !processInfo.process.killed;
  }

  /**
   * Wait for a process to be ready (heuristic based on output)
   * @param {string} command - Command to wait for
   * @param {number} timeout - Timeout in milliseconds
   */
  async waitForReady(command, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkInterval = setInterval(() => {
        // Check if timeout exceeded
        if (Date.now() - startTime > timeout) {
          clearInterval(checkInterval);
          reject(new Error(`Timeout waiting for ${command} to be ready`));
          return;
        }
        
        // Check if any process with this command is running
        for (const [pid, info] of this.processes) {
          if (info.command === command && !info.process.killed) {
            clearInterval(checkInterval);
            resolve(pid);
            return;
          }
        }
      }, 500);
    });
  }
}

// Global process manager instance
let globalProcessManager = null;

export function getGlobalProcessManager() {
  if (!globalProcessManager) {
    globalProcessManager = new ProcessManager();
  }
  return globalProcessManager;
}

// Cleanup on exit
process.on('exit', () => {
  if (globalProcessManager) {
    // Synchronous cleanup
    for (const [pid, info] of globalProcessManager.processes) {
      try {
        process.kill(pid, 'SIGKILL');
      } catch {
        // Ignore errors
      }
    }
  }
});