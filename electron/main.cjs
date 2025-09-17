const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const { promisify } = require('util');
const execAsync = promisify(exec);

let mainWindow;
let devServerProcess;
let currentPort = process.env.VITE_PORT || 5173;

async function getGitBranches() {
    try {
        const { stdout } = await execAsync('git branch -a');
        const branches = stdout
            .split('\n')
            .map(branch => branch.trim())
            .filter(branch => branch && !branch.includes('->'))
            .map(branch => {
                if (branch.startsWith('* ')) {
                    return { name: branch.substring(2), current: true };
                }
                return { name: branch.replace('remotes/origin/', ''), current: false };
            });
        
        const uniqueBranches = {};
        branches.forEach(branch => {
            const cleanName = branch.name.replace('remotes/origin/', '');
            if (!uniqueBranches[cleanName] || branch.current) {
                uniqueBranches[cleanName] = branch;
            }
        });
        
        return Object.values(uniqueBranches);
    } catch (error) {
        console.error('Error getting branches:', error);
        return [];
    }
}

async function getCurrentBranch() {
    try {
        const { stdout } = await execAsync('git branch --show-current');
        return stdout.trim();
    } catch (error) {
        console.error('Error getting current branch:', error);
        return 'unknown';
    }
}

async function checkoutBranch(branchName) {
    try {
        // Stash any changes before switching
        await execAsync('git stash push -m "temp stash for branch switch"').catch(() => {});
        await execAsync(`git checkout ${branchName}`);
        // Try to pop the stash back
        await execAsync('git stash pop').catch(() => {});
        return { success: true };
    } catch (error) {
        console.error('Error checking out branch:', error);
        // Try to restore stash if checkout failed
        await execAsync('git stash pop').catch(() => {});
        return { success: false, error: error.message };
    }
}

async function getCommits(limit = 50) {
    try {
        const { stdout } = await execAsync(`git log --oneline -n ${limit} --pretty=format:"%H|%h|%s|%an|%ar"`);
        const commits = stdout.split('\n').filter(line => line).map(line => {
            const [hash, shortHash, message, author, date] = line.split('|');
            return { hash, shortHash, message, author, date };
        });
        return commits;
    } catch (error) {
        console.error('Error getting commits:', error);
        return [];
    }
}

async function getCurrentCommit() {
    try {
        const { stdout } = await execAsync('git rev-parse HEAD');
        return stdout.trim();
    } catch (error) {
        console.error('Error getting current commit:', error);
        return null;
    }
}

async function getCommitDetails(hash) {
    try {
        const { stdout } = await execAsync(`git show --format="%H|%h|%s|%an|%ae|%ar|%ai|%b" --no-patch ${hash}`);
        const [fullHash, shortHash, subject, authorName, authorEmail, relativeDate, date, ...bodyParts] = stdout.split('|');
        const body = bodyParts.join('|').trim();
        
        // Get changed files
        const { stdout: filesOutput } = await execAsync(`git show --name-status --format="" ${hash}`);
        const files = filesOutput.split('\n').filter(line => line).map(line => {
            const [status, ...pathParts] = line.split('\t');
            return { status, path: pathParts.join('\t') };
        });
        
        return {
            hash: fullHash,
            shortHash,
            subject,
            author: { name: authorName, email: authorEmail },
            date,
            relativeDate,
            body,
            files
        };
    } catch (error) {
        console.error('Error getting commit details:', error);
        return null;
    }
}

async function checkoutCommit(hash) {
    try {
        // Stash any changes before switching
        await execAsync('git stash push -m "temp stash for commit switch"').catch(() => {});
        await execAsync(`git checkout ${hash}`);
        // Try to pop the stash back
        await execAsync('git stash pop').catch(() => {});
        return { success: true };
    } catch (error) {
        console.error('Error checking out commit:', error);
        // Try to restore stash if checkout failed
        await execAsync('git stash pop').catch(() => {});
        return { success: false, error: error.message };
    }
}

async function startDevServer() {
    // For now, assume dev server is already running
    // This simplifies the setup and avoids conflicts
    console.log(`Note: Please ensure dev server is running on port ${currentPort} (pnpm run dev)`);
    return Promise.resolve();
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
            webviewTag: true
        },
        titleBarStyle: 'hiddenInset'
    });
    
    Menu.setApplicationMenu(null);
    
    mainWindow.loadFile(path.join(__dirname, 'toolbar.html'));
    
    // Pass the port to the renderer process
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('set-dev-port', currentPort);
    });
    
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(async () => {
    await startDevServer();
    createWindow();
});

app.on('window-all-closed', () => {
    if (devServerProcess) {
        devServerProcess.kill();
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.handle('get-dev-port', () => {
    return currentPort;
});

ipcMain.handle('get-branches', async () => {
    return await getGitBranches();
});

ipcMain.handle('get-current-branch', async () => {
    return await getCurrentBranch();
});

ipcMain.handle('checkout-branch', async (event, branchName) => {
    const result = await checkoutBranch(branchName);
    if (result.success) {
        console.log('Branch changed. Please restart dev server if needed.');
    }
    return result;
});

ipcMain.handle('navigate-to', (event, url) => {
    const webview = mainWindow.webContents;
    webview.send('navigate-webview', url);
    return { success: true };
});

ipcMain.handle('refresh-page', () => {
    mainWindow.webContents.send('refresh-webview');
    return { success: true };
});

ipcMain.handle('get-commits', async (event, limit) => {
    return await getCommits(limit);
});

ipcMain.handle('get-current-commit', async () => {
    return await getCurrentCommit();
});

ipcMain.handle('get-commit-details', async (event, hash) => {
    return await getCommitDetails(hash);
});

ipcMain.handle('checkout-commit', async (event, hash) => {
    const result = await checkoutCommit(hash);
    if (result.success) {
        console.log('Commit changed. Please restart dev server if needed.');
    }
    return result;
});

process.on('SIGINT', () => {
    if (devServerProcess) {
        devServerProcess.kill();
    }
    app.quit();
});