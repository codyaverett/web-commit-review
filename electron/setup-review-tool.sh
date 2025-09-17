#!/bin/bash

echo "Setting up Electron Review Tool..."

# Apply skip-worktree to prevent conflicts during commit traversal
git update-index --skip-worktree electron/toolbar.html 2>/dev/null || true
git update-index --skip-worktree electron/main.cjs 2>/dev/null || true

echo "✓ Git skip-worktree settings applied"
echo "✓ Review tool is ready to use"
echo ""
echo "To run the review tool:"
echo "  1. Start the dev server: pnpm run dev"
echo "  2. Run the electron app: pnpm run electron"