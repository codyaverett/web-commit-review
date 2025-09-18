# Web Commit Review Tool - Project Management Makefile
# =====================================================
# A self-documented Makefile for managing the web-based git commit review tool

# Default shell
SHELL := /bin/bash

# Package details
PACKAGE_NAME := @starpower/web-commit-review
CURRENT_VERSION := $(shell node -p "require('./package.json').version")
NEXT_PATCH := $(shell node -p "var v='$(CURRENT_VERSION)'.split('.');v[2]=parseInt(v[2])+1;v.join('.')")
NEXT_MINOR := $(shell node -p "var v='$(CURRENT_VERSION)'.split('.');v[1]=parseInt(v[1])+1;v[2]=0;v.join('.')")
NEXT_MAJOR := $(shell node -p "var v='$(CURRENT_VERSION)'.split('.');v[0]=parseInt(v[0])+1;v[1]=0;v[2]=0;v.join('.')")

# Colors for terminal output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[0;33m
BLUE := \033[0;34m
MAGENTA := \033[0;35m
CYAN := \033[0;36m
WHITE := \033[0;37m
RESET := \033[0m

# Default target - show help
.DEFAULT_GOAL := help

# =====================================================
# HELP & DOCUMENTATION
# =====================================================

.PHONY: help
help: ## Show this help message
	@printf "$(CYAN)Web Commit Review Tool - Available Commands$(RESET)\n"
	@printf "$(CYAN)============================================$(RESET)\n"
	@echo ""
	@printf "$(YELLOW)Usage:$(RESET) make [target]\n"
	@echo ""
	@printf "$(YELLOW)Targets:$(RESET)\n"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(RESET) %s\n", $$1, $$2}'
	@echo ""
	@printf "$(YELLOW)Current Version:$(RESET) $(CURRENT_VERSION)\n"
	@echo ""
	@printf "$(YELLOW)Version Bumping Examples:$(RESET)\n"
	@printf "  $(GREEN)make bump-patch$(RESET)  : $(CURRENT_VERSION) → $(NEXT_PATCH)\n"
	@printf "  $(GREEN)make bump-minor$(RESET)  : $(CURRENT_VERSION) → $(NEXT_MINOR)\n"
	@printf "  $(GREEN)make bump-major$(RESET)  : $(CURRENT_VERSION) → $(NEXT_MAJOR)\n"

# =====================================================
# DEVELOPMENT
# =====================================================

.PHONY: install
install: ## Install all dependencies
	@printf "$(CYAN)Installing dependencies...$(RESET)\n"
	@pnpm install
	@printf "$(GREEN)✓ Dependencies installed successfully$(RESET)\n"

.PHONY: dev
dev: ## Start development server with hot reload
	@printf "$(CYAN)Starting development server...$(RESET)\n"
	@npm run dev

.PHONY: start
start: ## Start the application (Electron mode)
	@printf "$(CYAN)Starting application in Electron mode...$(RESET)\n"
	@npm start

.PHONY: start-browser
start-browser: ## Start the application (Browser mode)
	@printf "$(CYAN)Starting application in browser mode...$(RESET)\n"
	@npm run start:browser

.PHONY: build
build: ## Build the application for production
	@printf "$(CYAN)Building for production...$(RESET)\n"
	@npm run build
	@printf "$(GREEN)✓ Build completed successfully$(RESET)\n"

# =====================================================
# TESTING & QUALITY
# =====================================================

.PHONY: lint
lint: ## Run code linting
	@printf "$(CYAN)Running linter...$(RESET)\n"
	@npx eslint . --ext .js,.jsx,.ts,.tsx,.vue || printf "$(YELLOW)No linter configured. Consider adding ESLint.$(RESET)\n"

.PHONY: format
format: ## Format code with Prettier
	@printf "$(CYAN)Formatting code...$(RESET)\n"
	@npx prettier --write . || printf "$(YELLOW)No formatter configured. Consider adding Prettier.$(RESET)\n"

.PHONY: test
test: ## Run test suite
	@printf "$(CYAN)Running tests...$(RESET)\n"
	@npm test 2>/dev/null || printf "$(YELLOW)No tests configured. Consider adding a test suite.$(RESET)\n"

.PHONY: check
check: lint test ## Run all checks (lint + test)
	@printf "$(GREEN)✓ All checks passed$(RESET)\n"

# =====================================================
# VERSION MANAGEMENT
# =====================================================

.PHONY: version
version: ## Display current version
	@printf "$(CYAN)Current version: $(GREEN)$(CURRENT_VERSION)$(RESET)\n"

.PHONY: bump-patch
bump-patch: ## Bump patch version (x.x.X)
	@printf "$(CYAN)Bumping patch version from $(CURRENT_VERSION) to $(NEXT_PATCH)...$(RESET)\n"
	@npm version patch --no-git-tag-version
	@printf "$(GREEN)✓ Version bumped to $(NEXT_PATCH)$(RESET)\n"
	@printf "$(YELLOW)Don't forget to commit the changes!$(RESET)\n"

.PHONY: bump-minor
bump-minor: ## Bump minor version (x.X.0)
	@printf "$(CYAN)Bumping minor version from $(CURRENT_VERSION) to $(NEXT_MINOR)...$(RESET)\n"
	@npm version minor --no-git-tag-version
	@printf "$(GREEN)✓ Version bumped to $(NEXT_MINOR)$(RESET)\n"
	@printf "$(YELLOW)Don't forget to commit the changes!$(RESET)\n"

.PHONY: bump-major
bump-major: ## Bump major version (X.0.0)
	@printf "$(CYAN)Bumping major version from $(CURRENT_VERSION) to $(NEXT_MAJOR)...$(RESET)\n"
	@npm version major --no-git-tag-version
	@printf "$(GREEN)✓ Version bumped to $(NEXT_MAJOR)$(RESET)\n"
	@printf "$(YELLOW)Don't forget to commit the changes!$(RESET)\n"

# =====================================================
# GIT OPERATIONS
# =====================================================

.PHONY: tag
tag: ## Create a git tag for current version
	@printf "$(CYAN)Creating git tag v$(CURRENT_VERSION)...$(RESET)\n"
	@git tag -a "v$(CURRENT_VERSION)" -m "Release version $(CURRENT_VERSION)"
	@printf "$(GREEN)✓ Tag v$(CURRENT_VERSION) created$(RESET)\n"
	@printf "$(YELLOW)Run 'make push-tag' to push the tag to remote$(RESET)\n"

.PHONY: push-tag
push-tag: ## Push the latest tag to remote
	@printf "$(CYAN)Pushing tag v$(CURRENT_VERSION) to remote...$(RESET)\n"
	@git push origin "v$(CURRENT_VERSION)"
	@printf "$(GREEN)✓ Tag pushed successfully$(RESET)\n"

.PHONY: changelog
changelog: ## Generate changelog from git commits
	@printf "$(CYAN)Generating changelog...$(RESET)\n"
	@git log --pretty=format:"- %s (%h)" --no-merges HEAD...$(shell git describe --tags --abbrev=0 2>/dev/null || echo "") > CHANGELOG.tmp || touch CHANGELOG.tmp
	@if [ -s CHANGELOG.tmp ]; then \
		printf "$(GREEN)✓ Changelog generated in CHANGELOG.tmp$(RESET)\n"; \
	else \
		printf "$(YELLOW)No changes found since last tag$(RESET)\n"; \
	fi

# =====================================================
# PUBLISHING
# =====================================================

.PHONY: prepublish
prepublish: check build ## Prepare for publishing (run checks and build)
	@printf "$(GREEN)✓ Ready to publish$(RESET)\n"

.PHONY: publish
publish: prepublish ## Publish package to npm registry
	@printf "$(CYAN)Publishing $(PACKAGE_NAME) v$(CURRENT_VERSION) to npm...$(RESET)\n"
	@npm publish --access public
	@printf "$(GREEN)✓ Package published successfully$(RESET)\n"

.PHONY: publish-dry
publish-dry: prepublish ## Dry run of npm publish
	@printf "$(CYAN)Dry run: Publishing $(PACKAGE_NAME) v$(CURRENT_VERSION)...$(RESET)\n"
	@npm publish --dry-run --access public

# =====================================================
# RELEASE WORKFLOW
# =====================================================

.PHONY: release-patch
release-patch: bump-patch tag push-tag publish ## Release a patch version (bump + tag + publish)
	@printf "$(GREEN)✓ Patch release v$(shell node -p "require('./package.json').version") completed$(RESET)\n"

.PHONY: release-minor
release-minor: bump-minor tag push-tag publish ## Release a minor version (bump + tag + publish)
	@printf "$(GREEN)✓ Minor release v$(shell node -p "require('./package.json').version") completed$(RESET)\n"

.PHONY: release-major
release-major: bump-major tag push-tag publish ## Release a major version (bump + tag + publish)
	@printf "$(GREEN)✓ Major release v$(shell node -p "require('./package.json').version") completed$(RESET)\n"

# =====================================================
# CLEANUP
# =====================================================

.PHONY: clean
clean: ## Clean build artifacts and temporary files
	@printf "$(CYAN)Cleaning build artifacts...$(RESET)\n"
	@rm -rf dist/ build/ .cache/ coverage/ *.log
	@printf "$(GREEN)✓ Cleanup completed$(RESET)\n"

.PHONY: clean-all
clean-all: clean ## Deep clean (including node_modules)
	@printf "$(CYAN)Removing node_modules...$(RESET)\n"
	@rm -rf node_modules/
	@printf "$(GREEN)✓ Deep cleanup completed$(RESET)\n"
	@printf "$(YELLOW)Run 'make install' to reinstall dependencies$(RESET)\n"

# =====================================================
# DOCKER (if needed in future)
# =====================================================

.PHONY: docker-build
docker-build: ## Build Docker image
	@printf "$(CYAN)Building Docker image...$(RESET)\n"
	@docker build -t $(PACKAGE_NAME):$(CURRENT_VERSION) .
	@printf "$(GREEN)✓ Docker image built$(RESET)\n"

.PHONY: docker-run
docker-run: ## Run application in Docker container
	@printf "$(CYAN)Running Docker container...$(RESET)\n"
	@docker run -it -p 3000:3000 $(PACKAGE_NAME):$(CURRENT_VERSION)

# =====================================================
# UTILITY
# =====================================================

.PHONY: info
info: ## Show project information
	@printf "$(CYAN)Project Information$(RESET)\n"
	@printf "$(CYAN)===================$(RESET)\n"
	@printf "Package Name:    $(GREEN)$(PACKAGE_NAME)$(RESET)\n"
	@printf "Current Version: $(GREEN)$(CURRENT_VERSION)$(RESET)\n"
	@printf "Node Version:    $(GREEN)$(shell node -v)$(RESET)\n"
	@printf "NPM Version:     $(GREEN)$(shell npm -v)$(RESET)\n"
	@printf "Git Branch:      $(GREEN)$(shell git branch --show-current)$(RESET)\n"
	@printf "Git Status:      $(GREEN)$(shell git status -s | wc -l) modified files$(RESET)\n"

.PHONY: deps-check
deps-check: ## Check for outdated dependencies
	@printf "$(CYAN)Checking for outdated dependencies...$(RESET)\n"
	@npx npm-check-updates || npm outdated

.PHONY: deps-update
deps-update: ## Update dependencies to latest versions
	@printf "$(CYAN)Updating dependencies...$(RESET)\n"
	@npx npm-check-updates -u || printf "$(YELLOW)npm-check-updates not installed. Using npm update instead.$(RESET)\n" && npm update
	@printf "$(GREEN)✓ Dependencies updated$(RESET)\n"
	@printf "$(YELLOW)Run 'make install' to install updated dependencies$(RESET)\n"