const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getDevPort: () => ipcRenderer.invoke('get-dev-port'),
    getBranches: () => ipcRenderer.invoke('get-branches'),
    getCurrentBranch: () => ipcRenderer.invoke('get-current-branch'),
    checkoutBranch: (branchName) => ipcRenderer.invoke('checkout-branch', branchName),
    navigateTo: (url) => ipcRenderer.invoke('navigate-to', url),
    refreshPage: () => ipcRenderer.invoke('refresh-page'),
    getCommits: (limit) => ipcRenderer.invoke('get-commits', limit),
    getCurrentCommit: () => ipcRenderer.invoke('get-current-commit'),
    getCommitDetails: (hash) => ipcRenderer.invoke('get-commit-details', hash),
    checkoutCommit: (hash) => ipcRenderer.invoke('checkout-commit', hash),
    onNavigateWebview: (callback) => {
        ipcRenderer.on('navigate-webview', (event, url) => callback(url));
    },
    onRefreshWebview: (callback) => {
        ipcRenderer.on('refresh-webview', () => callback());
    },
    onSetDevPort: (callback) => {
        ipcRenderer.on('set-dev-port', (event, port) => callback(port));
    }
});