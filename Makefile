# Makefile for Vue PrimeVue Feedback Project

# Variables
SHELL := /bin/bash
.DEFAULT_GOAL := help

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m # No Color

.PHONY: help
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.PHONY: install
install: ## Install project dependencies
	pnpm install

.PHONY: dev
dev: ## Start development server
	pnpm run dev

.PHONY: build
build: ## Build for production
	pnpm run build

.PHONY: preview
preview: ## Preview production build
	pnpm run preview

.PHONY: lint
lint: ## Run linter
	pnpm run lint

.PHONY: format
format: ## Format code with prettier
	pnpm run format

.PHONY: pr
pr: ## Create a draft PR with commit log as description
	@./scripts/pr create

.PHONY: pr-dry-run
pr-dry-run: ## Preview what PR would be created without actually creating it
	@./scripts/pr create --dry-run

.PHONY: pr-update
pr-update: ## Update existing PR with latest commits
	@./scripts/pr update

.PHONY: pr-update-dry-run
pr-update-dry-run: ## Preview PR update without making changes
	@./scripts/pr update --dry-run

.PHONY: pr-status
pr-status: ## Check PR status for current branch
	@./scripts/pr status

.PHONY: pr-open
pr-open: ## Open current branch PR in browser
	@./scripts/pr open

.PHONY: pr-create
pr-create: ## Alias for 'make pr'
	@$(MAKE) pr

.PHONY: quick-pr
quick-pr: ## Push current branch and create draft PR
	@echo -e "$(GREEN)Checking for uncommitted changes...$(NC)"
	@if ! git diff-index --quiet HEAD --; then \
		echo -e "$(YELLOW)Warning: You have uncommitted changes.$(NC)"; \
		read -p "Do you want to commit them first? (y/n) " -n 1 -r; \
		echo; \
		if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
			read -p "Enter commit message: " MSG; \
			git add -A && git commit -m "$$MSG"; \
		fi; \
	fi
	@echo -e "$(GREEN)Pushing branch to remote...$(NC)"
	@git push -u origin $$(git branch --show-current)
	@echo -e "$(GREEN)Creating draft PR...$(NC)"
	@./scripts/pr create

.PHONY: check-pr
check-pr: ## Alias for pr-status
	@$(MAKE) pr-status

.PHONY: view-pr
view-pr: ## Alias for pr-open
	@$(MAKE) pr-open

.PHONY: clean
clean: ## Clean build artifacts and node_modules
	rm -rf dist node_modules .pnpm-store

.PHONY: reinstall
reinstall: clean install ## Clean and reinstall dependencies

.PHONY: test-pr-script
test-pr-script: ## Test PR creation script (dry run) - alias for pr-dry-run
	@$(MAKE) pr-dry-run

.PHONY: pr-help
pr-help: ## Show PR script help
	@./scripts/pr help

.PHONY: review
review: ## Start UI review tool (Electron app)
	pnpm run review

.PHONY: review-dev
review-dev: ## Start UI review tool with dev server
	pnpm run review:dev
