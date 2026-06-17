# ── tajerp_ui — common commands ───────────────────────────────────────────
# Run `make` or `make help` to see this list.

# Use npm by default; override with `make PM=yarn ...` or `make PM=pnpm ...`.
PM ?= npm

.DEFAULT_GOAL := help

.PHONY: help install build dev typecheck lint format clean \
        storybook storybook-build check release link unlink

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	$(PM) install

build: ## Build the library (ESM + type declarations)
	$(PM) run build

dev: ## Rebuild the library on change (watch)
	$(PM) run dev

typecheck: ## Type-check without emitting
	$(PM) run typecheck

lint: ## Lint the source
	$(PM) run lint

format: ## Auto-fix lint issues
	$(PM) run lint -- --fix

clean: ## Remove build artifacts
	$(PM) run clean

storybook: ## Run Storybook dev server (http://localhost:6006)
	$(PM) run storybook

storybook-build: ## Build static Storybook to ./storybook-static
	$(PM) run build-storybook

check: typecheck lint build ## Type-check, lint, and build (CI gate)

release: check ## Run checks then publish to the configured registry
	$(PM) publish --access public

link: build ## Build, then npm-link this package globally for local consumers
	$(PM) link

unlink: ## Remove the global npm link
	$(PM) unlink
