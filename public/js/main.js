// Main JavaScript for Git Commit Review Tool

class GitReviewTool {
  constructor() {
    this.currentBranch = '';
    this.currentCommit = '';
    this.commits = [];
    this.branches = [];
    this.sidebarVisible = false;
    this.ws = null;
    this.baseUrl = window.location.origin;
    this.config = null;
    
    this.init();
  }
  
  async init() {
    await this.loadConfiguration();
    this.setupEventListeners();
    this.initWebSocket();
    await this.checkRepository();
    await this.loadBranches();
    this.updateStatus('Ready');
  }
  
  async loadConfiguration() {
    try {
      const response = await fetch('/api/config');
      this.config = await response.json();
      
      // Set initial URL if provided
      if (this.config.initialUrl) {
        document.getElementById('url-input').value = this.config.initialUrl;
        // Load the initial URL in the iframe
        document.getElementById('preview-frame').src = this.config.initialUrl;
      }
      
      // Update UI with target directory info
      if (this.config.targetDir) {
        this.updateRepoInfo(`Dir: ${this.config.targetDir.split('/').pop()}`);
      }
      
      // Show if running in worktree mode
      if (this.config.isWorktree) {
        this.updateStatus('Running in temporary worktree');
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
    }
  }
  
  setupEventListeners() {
    // Branch selector
    document.getElementById('branch-selector').addEventListener('change', (e) => {
      this.checkoutBranch(e.target.value);
    });
    
    // Commit selector
    document.getElementById('commit-selector').addEventListener('change', (e) => {
      this.checkoutCommit(e.target.value);
    });
    
    // Navigation buttons
    document.getElementById('prev-commit').addEventListener('click', () => {
      this.navigateCommit('prev');
    });
    
    document.getElementById('next-commit').addEventListener('click', () => {
      this.navigateCommit('next');
    });
    
    // URL navigation
    document.getElementById('refresh-btn').addEventListener('click', () => {
      this.refreshPreview();
    });
    
    document.getElementById('navigate-btn').addEventListener('click', () => {
      this.navigateToUrl();
    });
    
    document.getElementById('url-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.navigateToUrl();
      }
    });
    
    // Sidebar toggle
    document.getElementById('toggle-sidebar').addEventListener('click', () => {
      this.toggleSidebar();
    });
    
    document.getElementById('close-sidebar').addEventListener('click', () => {
      this.closeSidebar();
    });
    
    // Repository settings
    document.getElementById('repo-settings').addEventListener('click', () => {
      this.openRepoModal();
    });
    
    document.getElementById('set-repo-btn').addEventListener('click', () => {
      this.setRepository();
    });
    
    // Close modal when clicking outside
    document.getElementById('repo-modal').addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.closeRepoModal();
      }
    });
  }
  
  initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.updateConnectionStatus('Connected', true);
        this.ws.send(JSON.stringify({ type: 'watch' }));
      };
      
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleWebSocketMessage(data);
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.updateConnectionStatus('Error', false);
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.updateConnectionStatus('Disconnected', false);
        // Attempt to reconnect after 3 seconds
        setTimeout(() => this.initWebSocket(), 3000);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      this.updateConnectionStatus('Failed', false);
    }
  }
  
  handleWebSocketMessage(data) {
    switch (data.type) {
      case 'status':
        this.updateRepoStatus(data.data);
        break;
      case 'error':
        this.showError(data.error);
        break;
      default:
        console.log('Unknown message type:', data);
    }
  }
  
  async checkRepository() {
    try {
      const response = await fetch('/api/check-repo');
      const data = await response.json();
      
      if (data.isRepo) {
        this.currentBranch = data.currentBranch;
        this.updateRepoInfo(`Branch: ${data.currentBranch}`);
      } else {
        this.updateStatus('No git repository found in current directory');
        this.openRepoModal();
      }
    } catch (error) {
      console.error('Error checking repository:', error);
      this.updateStatus('Failed to check repository');
    }
  }
  
  async loadBranches() {
    try {
      this.showLoading(true);
      const response = await fetch('/api/branches');
      const data = await response.json();
      
      this.branches = data.all;
      this.currentBranch = data.current;
      
      const selector = document.getElementById('branch-selector');
      selector.innerHTML = '';
      
      data.all.forEach(branch => {
        const option = document.createElement('option');
        option.value = branch;
        option.textContent = branch;
        if (branch === data.current) {
          option.selected = true;
        }
        selector.appendChild(option);
      });
      
      await this.loadCommits();
      this.showLoading(false);
    } catch (error) {
      console.error('Error loading branches:', error);
      this.updateStatus('Failed to load branches');
      this.showLoading(false);
    }
  }
  
  async loadCommits() {
    try {
      const response = await fetch(`/api/commits?limit=100`);
      const data = await response.json();
      
      this.commits = data.all || [];
      
      const selector = document.getElementById('commit-selector');
      selector.innerHTML = '<option value="">Select a commit...</option>';
      
      this.commits.forEach(commit => {
        const option = document.createElement('option');
        option.value = commit.hash;
        const date = new Date(commit.date).toLocaleDateString();
        option.textContent = `${commit.hash.substring(0, 7)} - ${commit.message} (${date})`;
        selector.appendChild(option);
      });
      
      // Select the first commit if available
      if (this.commits.length > 0) {
        this.currentCommit = this.commits[0].hash;
        selector.value = this.currentCommit;
        await this.loadCommitDetails(this.currentCommit);
      }
    } catch (error) {
      console.error('Error loading commits:', error);
      this.updateStatus('Failed to load commits');
    }
  }
  
  async checkoutBranch(branch) {
    if (!branch) return;
    
    try {
      this.showLoading(true);
      this.updateStatus(`Switching to branch ${branch}...`);
      
      const response = await fetch('/api/checkout-branch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branch })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.currentBranch = data.currentBranch;
        this.updateStatus(`Switched to branch ${branch}`);
        this.updateRepoInfo(`Branch: ${branch}`);
        await this.loadCommits();
        this.refreshPreview();
      } else {
        this.showError(data.error || 'Failed to checkout branch');
      }
      
      this.showLoading(false);
    } catch (error) {
      console.error('Error checking out branch:', error);
      this.showError('Failed to checkout branch');
      this.showLoading(false);
    }
  }
  
  async checkoutCommit(hash) {
    if (!hash) return;
    
    try {
      this.showLoading(true);
      this.updateStatus(`Checking out commit ${hash.substring(0, 7)}...`);
      
      const response = await fetch('/api/checkout-commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.currentCommit = hash;
        this.updateStatus(`Checked out commit ${hash.substring(0, 7)}`);
        await this.loadCommitDetails(hash);
        this.refreshPreview();
      } else {
        this.showError(data.error || 'Failed to checkout commit');
      }
      
      this.showLoading(false);
    } catch (error) {
      console.error('Error checking out commit:', error);
      this.showError('Failed to checkout commit');
      this.showLoading(false);
    }
  }
  
  async loadCommitDetails(hash) {
    try {
      const response = await fetch(`/api/commit/${hash}`);
      const data = await response.json();
      
      const detailsContainer = document.getElementById('commit-details');
      
      detailsContainer.innerHTML = `
        <div class="detail-section">
          <h4>Commit</h4>
          <p class="mono">${data.abbrevHash}</p>
        </div>
        
        <div class="detail-section">
          <h4>Author</h4>
          <p>${data.author}</p>
          <p class="email">${data.email}</p>
        </div>
        
        <div class="detail-section">
          <h4>Date</h4>
          <p>${new Date(data.date).toLocaleString()}</p>
        </div>
        
        <div class="detail-section">
          <h4>Message</h4>
          <p class="commit-message">${data.message}</p>
          ${data.body ? `<p class="commit-body">${data.body}</p>` : ''}
        </div>
        
        <div class="detail-section">
          <h4>Files Changed (${data.files ? data.files.length : 0})</h4>
          <ul class="file-list">
            ${data.files ? data.files.map(file => `
              <li class="file-item">
                <span class="file-status status-${file.status.toLowerCase()}">${file.status}</span>
                <span class="file-name">${file.file}</span>
              </li>
            `).join('') : '<li>No files changed</li>'}
          </ul>
        </div>
      `;
      
      if (!this.sidebarVisible) {
        this.openSidebar();
      }
    } catch (error) {
      console.error('Error loading commit details:', error);
      this.showError('Failed to load commit details');
    }
  }
  
  async navigateCommit(direction) {
    try {
      this.showLoading(true);
      this.updateStatus(`Navigating to ${direction} commit...`);
      
      const response = await fetch('/api/navigate-commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction })
      });
      
      const data = await response.json();
      
      if (data.success && data.commit) {
        this.currentCommit = data.commit.hash;
        this.updateStatus(`Navigated to commit ${data.commit.hash.substring(0, 7)}`);
        
        // Update commit selector
        const selector = document.getElementById('commit-selector');
        selector.value = data.commit.hash;
        
        await this.loadCommitDetails(data.commit.hash);
        this.refreshPreview();
      } else {
        this.updateStatus(data.message || `No ${direction} commit available`);
      }
      
      this.showLoading(false);
    } catch (error) {
      console.error('Error navigating commits:', error);
      this.showError('Failed to navigate commits');
      this.showLoading(false);
    }
  }
  
  refreshPreview() {
    const iframe = document.getElementById('preview-frame');
    const url = document.getElementById('url-input').value;
    
    if (url) {
      iframe.src = '';
      setTimeout(() => {
        iframe.src = url;
      }, 100);
    }
  }
  
  navigateToUrl() {
    const url = document.getElementById('url-input').value;
    if (url) {
      const iframe = document.getElementById('preview-frame');
      iframe.src = url;
    }
  }
  
  toggleSidebar() {
    this.sidebarVisible ? this.closeSidebar() : this.openSidebar();
  }
  
  openSidebar() {
    document.getElementById('sidebar').classList.add('visible');
    this.sidebarVisible = true;
  }
  
  closeSidebar() {
    document.getElementById('sidebar').classList.remove('visible');
    this.sidebarVisible = false;
  }
  
  openRepoModal() {
    document.getElementById('repo-modal').classList.remove('hidden');
    this.loadRepoInfo();
  }
  
  closeRepoModal() {
    document.getElementById('repo-modal').classList.add('hidden');
  }
  
  async loadRepoInfo() {
    try {
      const response = await fetch('/api/repo-info');
      const data = await response.json();
      
      const detailsContainer = document.getElementById('repo-details');
      detailsContainer.innerHTML = `
        <div class="info-group">
          <strong>Current Branch:</strong> ${data.currentBranch}
        </div>
        <div class="info-group">
          <strong>Total Branches:</strong> ${data.branches.length}
        </div>
        <div class="info-group">
          <strong>Tags:</strong> ${data.tags.length > 0 ? data.tags.join(', ') : 'None'}
        </div>
        <div class="info-group">
          <strong>Remotes:</strong><br>
          ${data.remotes.map(r => `${r.name}: ${r.refs.fetch || r.refs.push}`).join('<br>')}
        </div>
      `;
      
      document.getElementById('current-repo').textContent = window.location.pathname || 'Current directory';
    } catch (error) {
      console.error('Error loading repo info:', error);
    }
  }
  
  async setRepository() {
    const path = document.getElementById('repo-path').value;
    if (!path) {
      this.showError('Please enter a repository path');
      return;
    }
    
    try {
      this.showLoading(true);
      const response = await fetch('/api/set-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path })
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.currentBranch = data.currentBranch;
        this.updateStatus(`Repository set to ${path}`);
        this.closeRepoModal();
        await this.loadBranches();
      } else {
        this.showError(data.error || 'Failed to set repository');
      }
      
      this.showLoading(false);
    } catch (error) {
      console.error('Error setting repository:', error);
      this.showError('Failed to set repository');
      this.showLoading(false);
    }
  }
  
  updateStatus(message) {
    document.getElementById('status-message').textContent = message;
  }
  
  updateRepoInfo(info) {
    document.getElementById('repo-info').textContent = info;
  }
  
  updateConnectionStatus(status, connected) {
    const indicator = document.querySelector('.status-indicator');
    const text = document.querySelector('.status-text');
    
    text.textContent = status;
    if (connected) {
      indicator.classList.add('connected');
    } else {
      indicator.classList.remove('connected');
    }
  }
  
  updateRepoStatus(status) {
    if (status.branch !== this.currentBranch) {
      this.currentBranch = status.branch;
      this.updateRepoInfo(`Branch: ${status.branch}`);
      document.getElementById('branch-selector').value = status.branch;
    }
    
    if (status.modified && status.modified.length > 0) {
      this.updateStatus(`${status.modified.length} file(s) modified`);
    }
  }
  
  showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (show) {
      overlay.classList.remove('hidden');
    } else {
      overlay.classList.add('hidden');
    }
  }
  
  showError(message) {
    this.updateStatus(`Error: ${message}`);
    console.error(message);
  }
}

// Global function for modal close button
window.closeRepoModal = function() {
  document.getElementById('repo-modal').classList.add('hidden');
};

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new GitReviewTool();
});