import express from 'express';
import cors from 'cors';
import simpleGit from 'simple-git';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Export the server startup function
export async function startServer(config) {
  const app = express();
  const git = simpleGit(config.targetDir);
  
  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'public')));
  
  // Serve the main HTML file
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  });
  
  // API endpoint to get initial configuration
  app.get('/api/config', (req, res) => {
    res.json({
      initialUrl: config.initialUrl,
      targetDir: config.targetDir,
      isWorktree: config.isWorktree
    });
  });

  // API Endpoints

  // Get all branches
  app.get('/api/branches', async (req, res) => {
    try {
      const branches = await git.branch();
      res.json({
        current: branches.current,
        all: branches.all,
        branches: branches.branches
      });
    } catch (error) {
      console.error('Error getting branches:', error);
      res.status(500).json({ error: 'Failed to get branches' });
    }
  });

  // Checkout a branch
  app.post('/api/checkout-branch', async (req, res) => {
    const { branch } = req.body;
    try {
      await git.checkout(branch);
      const currentBranch = await git.branch();
      res.json({ 
        success: true, 
        currentBranch: currentBranch.current,
        message: `Switched to branch ${branch}` 
      });
    } catch (error) {
      console.error('Error checking out branch:', error);
      res.status(500).json({ error: `Failed to checkout branch: ${error.message}` });
    }
  });

  // Get commits for current branch
  app.get('/api/commits', async (req, res) => {
    const { limit = 100, branch } = req.query;
    try {
      const logOptions = {
        maxCount: parseInt(limit),
        format: {
          hash: '%H',
          abbrevHash: '%h',
          author: '%an',
          email: '%ae',
          date: '%ai',
          message: '%s',
          body: '%b'
        }
      };
      
      if (branch) {
        logOptions.from = branch;
      }
      
      const log = await git.log(logOptions);
      res.json(log);
    } catch (error) {
      console.error('Error getting commits:', error);
      res.status(500).json({ error: 'Failed to get commits' });
    }
  });

  // Get commit details
  app.get('/api/commit/:hash', async (req, res) => {
    const { hash } = req.params;
    try {
      // Get commit details
      const commit = await git.show([
        '--format=%H%n%h%n%an%n%ae%n%ai%n%s%n%b',
        '--no-patch',
        hash
      ]);
      
      const lines = commit.split('\n');
      const commitData = {
        hash: lines[0],
        abbrevHash: lines[1],
        author: lines[2],
        email: lines[3],
        date: lines[4],
        message: lines[5],
        body: lines.slice(6).join('\n')
      };
      
      // Get changed files
      const diff = await git.diff(['--name-status', `${hash}^`, hash]);
      const files = diff.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [status, ...pathParts] = line.split('\t');
          return {
            status: status,
            file: pathParts.join('\t')
          };
        });
      
      commitData.files = files;
      res.json(commitData);
    } catch (error) {
      console.error('Error getting commit details:', error);
      res.status(500).json({ error: 'Failed to get commit details' });
    }
  });

  // Checkout a specific commit
  app.post('/api/checkout-commit', async (req, res) => {
    const { hash } = req.body;
    try {
      await git.checkout(hash);
      res.json({ 
        success: true, 
        message: `Checked out commit ${hash}` 
      });
    } catch (error) {
      console.error('Error checking out commit:', error);
      res.status(500).json({ error: `Failed to checkout commit: ${error.message}` });
    }
  });

  // Get repository status
  app.get('/api/status', async (req, res) => {
    try {
      const status = await git.status();
      const branch = await git.branch();
      res.json({
        current: branch.current,
        tracking: status.tracking,
        ahead: status.ahead,
        behind: status.behind,
        files: status.files,
        modified: status.modified.length,
        isClean: status.isClean()
      });
    } catch (error) {
      console.error('Error getting status:', error);
      res.status(500).json({ error: 'Failed to get repository status' });
    }
  });

  // Navigate to previous commit
  app.post('/api/navigate-commit', async (req, res) => {
    const { direction } = req.body;
    try {
      let targetCommit;
      if (direction === 'next') {
        // Get the next commit (child)
        const { stdout } = await execAsync('git rev-list --children --all | grep "$(git rev-parse HEAD)" | cut -d" " -f2', { cwd: config.targetDir });
        targetCommit = stdout.trim().split(' ')[0];
      } else {
        // Get the previous commit (parent)
        targetCommit = 'HEAD^';
      }
      
      if (targetCommit) {
        await git.checkout(targetCommit);
        const log = await git.log({ maxCount: 1 });
        res.json({
          success: true,
          commit: log.latest
        });
      } else {
        res.json({
          success: false,
          message: 'No next commit available'
        });
      }
    } catch (error) {
      console.error('Error navigating commits:', error);
      res.status(500).json({ error: 'Failed to navigate commits' });
    }
  });

  // Get repository info
  app.get('/api/repo-info', async (req, res) => {
    try {
      const remotes = await git.getRemotes(true);
      const tags = await git.tags();
      const branch = await git.branch();
      
      res.json({
        remotes: remotes,
        tags: tags.all,
        currentBranch: branch.current,
        branches: branch.all
      });
    } catch (error) {
      console.error('Error getting repo info:', error);
      res.status(500).json({ error: 'Failed to get repository info' });
    }
  });

  // Initialize repository check
  app.get('/api/check-repo', async (req, res) => {
    try {
      const isRepo = await git.checkIsRepo();
      if (isRepo) {
        const branch = await git.branch();
        res.json({
          isRepo: true,
          currentBranch: branch.current
        });
      } else {
        res.json({
          isRepo: false,
          message: 'Not a git repository'
        });
      }
    } catch (error) {
      console.error('Error checking repository:', error);
      res.status(500).json({ error: 'Failed to check repository' });
    }
  });

  // Set target repository path
  app.post('/api/set-repo', async (req, res) => {
    const { path: repoPath } = req.body;
    try {
      git.cwd(repoPath);
      const isRepo = await git.checkIsRepo();
      if (isRepo) {
        const branch = await git.branch();
        res.json({
          success: true,
          currentBranch: branch.current,
          path: repoPath
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'The specified path is not a git repository'
        });
      }
    } catch (error) {
      console.error('Error setting repository:', error);
      res.status(500).json({ error: 'Failed to set repository path' });
    }
  });

  // Start server and return the server instance
  return new Promise((resolve, reject) => {
    const server = app.listen(config.port, () => {
      if (config.verbose) {
        console.log(`Git Review Tool Server running on http://localhost:${config.port}`);
      }
      
      // Setup WebSocket for real-time updates
      const wss = new WebSocketServer({ server });
      
      wss.on('connection', (ws) => {
        if (config.verbose) {
          console.log('WebSocket client connected');
        }
        
        ws.on('message', async (message) => {
          try {
            const data = JSON.parse(message);
            
            switch (data.type) {
              case 'watch':
                // Send repository status updates
                const status = await git.status();
                const branch = await git.branch();
                ws.send(JSON.stringify({
                  type: 'status',
                  data: {
                    branch: branch.current,
                    isClean: status.isClean(),
                    modified: status.modified
                  }
                }));
                break;
                
              default:
                ws.send(JSON.stringify({ error: 'Unknown message type' }));
            }
          } catch (error) {
            ws.send(JSON.stringify({ error: error.message }));
          }
        });
        
        ws.on('close', () => {
          if (config.verbose) {
            console.log('WebSocket client disconnected');
          }
        });
      });
      
      resolve(server);
    });
    
    server.on('error', (error) => {
      reject(error);
    });
  });
}

export default { startServer };