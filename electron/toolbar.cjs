let currentBranch = '';
let branches = [];
let commits = [];
let currentCommitIndex = 0;
let currentCommitHash = '';
let webview;
let navigationHistory = [];
let currentHistoryIndex = -1;
let devServerPort = 5173;

document.addEventListener('DOMContentLoaded', async () => {
    webview = document.getElementById('webview');
    const branchDisplay = document.getElementById('branchDisplay');
    const branchDropdown = document.getElementById('branchDropdown');
    const currentBranchSpan = document.getElementById('currentBranch');
    const commitDisplay = document.getElementById('commitDisplay');
    const commitDropdown = document.getElementById('commitDropdown');
    const currentCommitHashSpan = document.getElementById('currentCommitHash');
    const currentCommitMessageSpan = document.getElementById('currentCommitMessage');
    const prevCommitBtn = document.getElementById('prevCommitBtn');
    const nextCommitBtn = document.getElementById('nextCommitBtn');
    const urlInput = document.getElementById('urlInput');
    const refreshBtn = document.getElementById('refreshBtn');
    const backBtn = document.getElementById('backBtn');
    const forwardBtn = document.getElementById('forwardBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const statusMessage = document.getElementById('statusMessage');
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const toggleSidebarFloat = document.getElementById('toggleSidebarFloat');
    const commitInfo = document.getElementById('commitInfo');
    
    async function loadBranches() {
        try {
            branches = await window.electronAPI.getBranches();
            currentBranch = await window.electronAPI.getCurrentBranch();
            currentBranchSpan.textContent = currentBranch;
            
            renderBranchDropdown();
        } catch (error) {
            console.error('Error loading branches:', error);
            showStatus('Failed to load branches', 3000);
        }
    }
    
    async function loadCommits() {
        try {
            commits = await window.electronAPI.getCommits(100);
            currentCommitHash = await window.electronAPI.getCurrentCommit();
            
            currentCommitIndex = commits.findIndex(c => c.hash === currentCommitHash);
            if (currentCommitIndex === -1) currentCommitIndex = 0;
            
            updateCommitDisplay();
            renderCommitDropdown();
            updateCommitNavButtons();
            
            if (commits[currentCommitIndex]) {
                await loadCommitDetails(commits[currentCommitIndex].hash);
            }
        } catch (error) {
            console.error('Error loading commits:', error);
            showStatus('Failed to load commits', 3000);
        }
    }
    
    function updateCommitDisplay() {
        if (commits[currentCommitIndex]) {
            currentCommitHashSpan.textContent = commits[currentCommitIndex].shortHash;
            currentCommitMessageSpan.textContent = commits[currentCommitIndex].message;
        }
    }
    
    function updateCommitNavButtons() {
        prevCommitBtn.disabled = currentCommitIndex >= commits.length - 1;
        nextCommitBtn.disabled = currentCommitIndex <= 0;
    }
    
    async function loadCommitDetails(hash) {
        try {
            const details = await window.electronAPI.getCommitDetails(hash);
            if (details) {
                renderCommitDetails(details);
            }
        } catch (error) {
            console.error('Error loading commit details:', error);
        }
    }
    
    function renderCommitDetails(details) {
        let html = `
            <div class="commit-info-section">
                <div class="commit-info-label">Commit Hash</div>
                <div class="commit-hash-full">${details.hash}</div>
            </div>
            
            <div class="commit-info-section">
                <div class="commit-info-label">Subject</div>
                <div class="commit-info-value">${details.subject}</div>
            </div>
            
            ${details.body ? `
            <div class="commit-info-section">
                <div class="commit-info-label">Description</div>
                <div class="commit-info-value">${details.body.replace(/\n/g, '<br>')}</div>
            </div>
            ` : ''}
            
            <div class="commit-info-section">
                <div class="commit-info-label">Author</div>
                <div class="commit-info-value">${details.author.name} &lt;${details.author.email}&gt;</div>
            </div>
            
            <div class="commit-info-section">
                <div class="commit-info-label">Date</div>
                <div class="commit-info-value">${details.date}<br><small>${details.relativeDate}</small></div>
            </div>
            
            ${details.files && details.files.length > 0 ? `
            <div class="commit-info-section">
                <div class="commit-info-label">Changed Files (${details.files.length})</div>
                <div class="commit-files">
                    ${details.files.map(file => `
                        <div class="file-item">
                            <div class="file-status ${getFileStatusClass(file.status)}">
                                ${getFileStatusLetter(file.status)}
                            </div>
                            <div class="file-path">${file.path}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        `;
        
        commitInfo.innerHTML = html;
    }
    
    function getFileStatusClass(status) {
        switch(status.charAt(0)) {
            case 'A': return 'added';
            case 'M': return 'modified';
            case 'D': return 'deleted';
            default: return 'modified';
        }
    }
    
    function getFileStatusLetter(status) {
        return status.charAt(0);
    }
    
    function renderBranchDropdown() {
        branchDropdown.innerHTML = '';
        
        const sortedBranches = branches.sort((a, b) => {
            if (a.current) return -1;
            if (b.current) return 1;
            return a.name.localeCompare(b.name);
        });
        
        sortedBranches.forEach(branch => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            if (branch.current) {
                item.classList.add('current');
            }
            
            const icon = document.createElement('span');
            icon.innerHTML = branch.current ? '✓' : '';
            icon.style.width = '16px';
            icon.style.display = 'inline-block';
            
            const name = document.createElement('span');
            name.textContent = branch.name;
            
            item.appendChild(icon);
            item.appendChild(name);
            
            item.addEventListener('click', async () => {
                if (!branch.current) {
                    await switchBranch(branch.name);
                }
                branchDropdown.classList.remove('show');
            });
            
            branchDropdown.appendChild(item);
        });
    }
    
    function renderCommitDropdown() {
        commitDropdown.innerHTML = '';
        
        commits.forEach((commit, index) => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            if (index === currentCommitIndex) {
                item.classList.add('current');
            }
            
            const hashEl = document.createElement('span');
            hashEl.className = 'commit-hash';
            hashEl.textContent = commit.shortHash;
            
            const messageEl = document.createElement('span');
            messageEl.style.flex = '1';
            messageEl.style.overflow = 'hidden';
            messageEl.style.textOverflow = 'ellipsis';
            messageEl.textContent = commit.message;
            
            item.appendChild(hashEl);
            item.appendChild(messageEl);
            
            item.addEventListener('click', async () => {
                await switchCommit(index);
                commitDropdown.classList.remove('show');
            });
            
            commitDropdown.appendChild(item);
        });
    }
    
    async function switchBranch(branchName) {
        loadingOverlay.classList.add('show');
        showStatus(`Switching to branch: ${branchName}`, 0);
        
        try {
            const result = await window.electronAPI.checkoutBranch(branchName);
            
            if (result.success) {
                currentBranch = branchName;
                currentBranchSpan.textContent = branchName;
                
                await loadBranches();
                await loadCommits();
                
                setTimeout(() => {
                    webview.reload();
                }, 2000);
                
                showStatus(`Switched to branch: ${branchName}`, 3000);
            } else {
                showStatus(`Failed to switch branch: ${result.error}`, 5000);
            }
        } catch (error) {
            console.error('Error switching branch:', error);
            showStatus('Branch switch failed', 3000);
        } finally {
            setTimeout(() => {
                loadingOverlay.classList.remove('show');
            }, 2000);
        }
    }
    
    async function switchCommit(index) {
        if (index < 0 || index >= commits.length) return;
        
        loadingOverlay.classList.add('show');
        const commit = commits[index];
        showStatus(`Switching to commit: ${commit.shortHash}`, 0);
        
        try {
            const result = await window.electronAPI.checkoutCommit(commit.hash);
            
            if (result.success) {
                currentCommitIndex = index;
                currentCommitHash = commit.hash;
                updateCommitDisplay();
                updateCommitNavButtons();
                await loadCommitDetails(commit.hash);
                
                setTimeout(() => {
                    webview.reload();
                }, 2000);
                
                showStatus(`Switched to commit: ${commit.shortHash}`, 3000);
            } else {
                showStatus(`Failed to switch commit: ${result.error}`, 5000);
            }
        } catch (error) {
            console.error('Error switching commit:', error);
            showStatus('Commit switch failed', 3000);
        } finally {
            setTimeout(() => {
                loadingOverlay.classList.remove('show');
            }, 2000);
        }
    }
    
    function showStatus(message, duration) {
        const statusEl = document.getElementById('statusMessage');
        statusEl.textContent = message;
        statusEl.classList.add('show');
        
        if (duration > 0) {
            setTimeout(() => {
                statusEl.classList.remove('show');
            }, duration);
        }
    }
    
    // Event listeners
    branchDisplay.addEventListener('click', (e) => {
        e.stopPropagation();
        branchDropdown.classList.toggle('show');
        commitDropdown.classList.remove('show');
    });
    
    commitDisplay.addEventListener('click', (e) => {
        e.stopPropagation();
        commitDropdown.classList.toggle('show');
        branchDropdown.classList.remove('show');
    });
    
    document.addEventListener('click', () => {
        branchDropdown.classList.remove('show');
        commitDropdown.classList.remove('show');
    });
    
    prevCommitBtn.addEventListener('click', async () => {
        if (currentCommitIndex < commits.length - 1) {
            await switchCommit(currentCommitIndex + 1);
        }
    });
    
    nextCommitBtn.addEventListener('click', async () => {
        if (currentCommitIndex > 0) {
            await switchCommit(currentCommitIndex - 1);
        }
    });
    
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('hidden');
        // Update the icon based on sidebar state
        const svg = sidebarToggle.querySelector('svg path');
        if (sidebar.classList.contains('hidden')) {
            // Sidebar is hidden, show right arrow
            svg.setAttribute('d', 'M3 14l10-7L3 0z');
        } else {
            // Sidebar is visible, show left arrow
            svg.setAttribute('d', 'M13 14L3 7l10-7z');
        }
    });
    
    toggleSidebarFloat.addEventListener('click', () => {
        sidebar.classList.remove('hidden');
        // Update the sidebar toggle icon to show left arrow (panel is open)
        const svg = sidebarToggle.querySelector('svg path');
        svg.setAttribute('d', 'M13 14L3 7l10-7z');
    });
    
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            let url = urlInput.value;
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'http://' + url;
            }
            webview.src = url;
            addToHistory(url);
        }
    });
    
    refreshBtn.addEventListener('click', () => {
        refreshBtn.classList.add('spinning');
        webview.reload();
        setTimeout(() => {
            refreshBtn.classList.remove('spinning');
        }, 1000);
    });
    
    backBtn.addEventListener('click', () => {
        if (currentHistoryIndex > 0) {
            currentHistoryIndex--;
            const url = navigationHistory[currentHistoryIndex];
            webview.src = url;
            urlInput.value = url;
            updateNavigationButtons();
        }
    });
    
    forwardBtn.addEventListener('click', () => {
        if (currentHistoryIndex < navigationHistory.length - 1) {
            currentHistoryIndex++;
            const url = navigationHistory[currentHistoryIndex];
            webview.src = url;
            urlInput.value = url;
            updateNavigationButtons();
        }
    });
    
    function addToHistory(url) {
        if (currentHistoryIndex < navigationHistory.length - 1) {
            navigationHistory = navigationHistory.slice(0, currentHistoryIndex + 1);
        }
        navigationHistory.push(url);
        currentHistoryIndex = navigationHistory.length - 1;
        updateNavigationButtons();
    }
    
    function updateNavigationButtons() {
        backBtn.disabled = currentHistoryIndex <= 0;
        forwardBtn.disabled = currentHistoryIndex >= navigationHistory.length - 1;
    }
    
    webview.addEventListener('did-navigate', (e) => {
        const url = e.url || webview.src;
        urlInput.value = url;
        if (navigationHistory[currentHistoryIndex] !== url) {
            addToHistory(url);
        }
    });
    
    webview.addEventListener('did-navigate-in-page', (e) => {
        const url = e.url || webview.src;
        urlInput.value = url;
        if (navigationHistory[currentHistoryIndex] !== url) {
            addToHistory(url);
        }
    });
    
    webview.addEventListener('did-start-loading', () => {
        refreshBtn.classList.add('spinning');
    });
    
    webview.addEventListener('did-stop-loading', () => {
        refreshBtn.classList.remove('spinning');
    });
    
    webview.addEventListener('did-fail-load', (e) => {
        if (e.errorCode !== -3) {
            showStatus(`Failed to load page: ${e.errorDescription}`, 5000);
        }
    });
    
    window.electronAPI.onNavigateWebview((url) => {
        webview.src = url;
        urlInput.value = url;
        addToHistory(url);
    });
    
    window.electronAPI.onRefreshWebview(() => {
        webview.reload();
    });
    
    // Initialize
    // Get the dev server port from main process
    try {
        devServerPort = await window.electronAPI.getDevPort();
    } catch (error) {
        console.log('Using default port 5173');
    }
    
    await loadBranches();
    await loadCommits();
    
    // Set initial URL with correct port
    const initialUrl = `http://localhost:${devServerPort}`;
    urlInput.value = initialUrl;
    webview.src = initialUrl;
    addToHistory(initialUrl);
    updateNavigationButtons();
});