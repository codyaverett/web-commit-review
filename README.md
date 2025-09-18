# Web Commit Review Tool

[![npm version](https://badge.fury.io/js/%40starpower%2Fweb-commit-review.svg)](https://badge.fury.io/js/%40starpower%2Fweb-commit-review)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/@starpower/web-commit-review.svg)](https://nodejs.org)

A powerful web-based Git commit review tool that provides an intuitive interface for browsing branches, reviewing commits, and managing Git worktrees. Available as both a standalone web application and an Electron desktop app.

## Features

- **Branch Management**: Browse and switch between Git branches with ease
- **Commit History**: View detailed commit history with diffs and file changes
- **Worktree Support**: Create and manage Git worktrees for parallel development
- **Real-time Updates**: WebSocket-based real-time synchronization of Git state
- **Cross-platform**: Works on Windows, macOS, and Linux
- **Multiple Modes**: Run as a web server or standalone Electron application
- **Developer-friendly**: Built with modern web technologies (Vue.js, Express, WebSockets)

## Installation

### Global Installation (Recommended)

```bash
npm install -g @starpower/web-commit-review
```

### Local Installation

```bash
npm install @starpower/web-commit-review
```

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/web-commit-review.git
cd web-commit-review

# Install dependencies
pnpm install

# Start development server
make dev
```

## Usage

### Command Line Interface

#### Electron Mode (Default)

Launch the tool as a desktop application:

```bash
web-commit-review [options]
```

#### Browser Mode

Launch as a web server and open in your default browser:

```bash
web-commit-review --browser [options]
```

### CLI Options

```
Options:
  -p, --port <port>       Port to run the server on (default: 3000)
  -d, --dir <directory>   Git repository directory (default: current directory)
  -b, --browser           Launch in browser mode instead of Electron
  --no-open               Don't automatically open the browser (browser mode only)
  -h, --help              Display help information
  -v, --version           Display version number
```

### Examples

```bash
# Open current repository in Electron app
web-commit-review

# Open specific repository
web-commit-review -d /path/to/repo

# Launch in browser on custom port
web-commit-review --browser -p 8080

# Start server without opening browser
web-commit-review --browser --no-open
```

## API Endpoints

The tool exposes a RESTful API for Git operations:

### Branches
- `GET /api/branches` - List all branches
- `POST /api/checkout` - Checkout a branch
- `POST /api/branches` - Create a new branch
- `DELETE /api/branches/:name` - Delete a branch

### Commits
- `GET /api/commits/:branch` - Get commits for a branch
- `GET /api/commit/:hash` - Get detailed commit information
- `GET /api/diff/:hash` - Get commit diff

### Worktrees
- `GET /api/worktrees` - List all worktrees
- `POST /api/worktrees` - Create a new worktree
- `DELETE /api/worktrees/:path` - Remove a worktree

### Repository
- `GET /api/status` - Get repository status
- `GET /api/remotes` - List remotes
- `POST /api/fetch` - Fetch from remote
- `POST /api/pull` - Pull changes
- `POST /api/push` - Push changes

## Development

### Project Structure

```
web-commit-review/
├── bin/                    # CLI entry points
│   ├── web-commit-review.js
│   └── web-commit-review-electron.js
├── lib/                    # Core application logic
│   ├── server.js          # Express server
│   ├── electron-main.js   # Electron main process
│   └── git-operations.js  # Git command wrapper
├── public/                 # Frontend assets
│   ├── index.html
│   ├── css/
│   └── js/
├── src/                    # Frontend source (if using build tools)
├── package.json
├── Makefile               # Project management commands
└── README.md
```

### Available Make Commands

```bash
# Development
make help          # Show all available commands
make install       # Install dependencies
make dev           # Start development server
make build         # Build for production

# Testing & Quality
make lint          # Run code linting
make format        # Format code
make test          # Run tests
make check         # Run all checks

# Version Management
make version       # Display current version
make bump-patch    # Bump patch version (1.0.X)
make bump-minor    # Bump minor version (1.X.0)
make bump-major    # Bump major version (X.0.0)

# Git Operations
make tag           # Create git tag for current version
make push-tag      # Push tag to remote
make changelog     # Generate changelog from commits

# Publishing
make publish       # Publish to npm
make publish-dry   # Dry run of npm publish

# Release Workflows
make release-patch # Complete patch release (bump + tag + publish)
make release-minor # Complete minor release
make release-major # Complete major release

# Cleanup
make clean         # Clean build artifacts
make clean-all     # Deep clean including node_modules
```

### Building from Source

```bash
# Install dependencies
make install

# Run development server
make dev

# Build for production
make build

# Run tests and linting
make check
```

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

#### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Test additions or modifications
- `chore:` Maintenance tasks
- `perf:` Performance improvements

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
HOST=localhost
GIT_DIR=/path/to/default/repo
ELECTRON_DISABLE_SECURITY_WARNINGS=true
```

### Git Configuration

The tool respects your global Git configuration. Ensure you have Git properly configured:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
web-commit-review -p 3001
```

#### Permission Denied
```bash
# Fix permissions
chmod +x bin/web-commit-review.js
chmod +x bin/web-commit-review-electron.js
```

#### Git Repository Not Found
Ensure you're running the command from within a Git repository or specify the path:
```bash
web-commit-review -d /path/to/git/repo
```

### Debug Mode

Enable debug logging:
```bash
DEBUG=* web-commit-review
```

## Requirements

- Node.js >= 16.0.0
- Git >= 2.0.0
- npm or pnpm

## Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Security

This tool runs a local web server that executes Git commands. It's designed for local development use only. Do not expose the server to public networks.

### Security Features
- CORS protection enabled
- Input sanitization for Git commands
- No authentication (localhost only)
- Read-only mode option available

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Vue.js](https://vuejs.org/) for the frontend
- [Express.js](https://expressjs.com/) for the backend server
- [Simple Git](https://github.com/steveukx/git-js) for Git operations
- [Electron](https://www.electronjs.org/) for desktop app packaging
- [Commander.js](https://github.com/tj/commander.js/) for CLI interface

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/web-commit-review/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/web-commit-review/discussions)
- **Email**: support@example.com

## Roadmap

- [ ] Dark mode support
- [ ] Multi-repository management
- [ ] Git LFS support
- [ ] Commit message templates
- [ ] Integration with CI/CD pipelines
- [ ] Plugin system for extensions
- [ ] Mobile responsive design
- [ ] Offline mode with caching
- [ ] Advanced diff visualization
- [ ] Code review annotations

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes.

## Authors

- Your Name - Initial work

## Contributors

Thanks to all contributors who have helped improve this project!

---

**Happy Reviewing!** 🚀