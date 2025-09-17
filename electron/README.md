# UI Review Tool

An Electron-based review tool for testing your Vue application across different Git branches.

## Features

- **Branch Switcher**: Easily switch between Git branches with a dropdown menu
- **URL Navigation**: Navigate to different routes with a browser-like URL bar
- **Navigation Controls**: Back/forward buttons for browsing history
- **Refresh Button**: Reload the current page with visual feedback
- **Live Development**: Works with your local development server

## Usage

### Quick Start

```bash
# Start the review tool (requires dev server to be running separately)
make review
# or
pnpm run review
```

### With Dev Server

```bash
# Start both dev server and review tool
make review-dev
# or
pnpm run review:dev
```

## How It Works

1. The tool displays your Vue application in a webview
2. A toolbar at the top shows:
   - Current Git branch with dropdown to switch branches
   - Back/forward navigation buttons
   - URL bar for navigating to different routes
   - Refresh button
3. When switching branches, the tool automatically:
   - Checks out the selected branch
   - Refreshes the application

## Requirements

- Node.js v20.19+ or v22.12+
- pnpm package manager
- Git repository with multiple branches

## File Structure

```
electron/
├── main.cjs        # Main Electron process
├── preload.cjs     # Preload script for secure IPC
├── toolbar.html    # Toolbar UI
├── toolbar.cjs     # Toolbar functionality
└── README.md       # This file
```

## Notes

- The dev server runs on port 5175 by default
- Branch switching requires a clean working directory
- The tool uses CommonJS (.cjs) files due to the project's ES module configuration