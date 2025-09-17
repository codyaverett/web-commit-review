# UI/UX Front-End Candidate Project (Vue 3 + PrimeVue 3) — Feature Requests / Ideas

Focus on **great UX**, **clean code**, and component composition. No ordering flows.

> Suggested time: ~3–6 hours. You don't need to finish everything—prioritize and explain your choices.

## Goals

- Thoughtful UX for browsing/filtering/prioritizing ideas.
- Composition API + Pinia + PrimeVue 3.
- Realistic empty/loading/error states; accessibility and responsiveness.

## Your Tasks

1. **(REQUIRED) Complex multi‑section form – “Submit Idea”**
    - Build a **single, complex form** at `/submit` with several sections, rich inputs, and validations.
    - Sections (minimum):
        - **Idea Basics**: title, description, category, tags.
        - **Impact & Priority**: personas (multi-select), impact score (slider), expected reach (number), target date (calendar).
        - **Technical**: complexity (dropdown), dependencies (chips), repo URL, privacy (radio buttons).
        - **Contact & Meta**: requester name/email, notifications (switch), terms/consent (checkbox).
    - Requirements: inline + summary validation, clear error text, keyboard navigation, screen-reader labels, helper text, responsive layout, and **Save Draft** to `localStorage`.

2. **Ideas workspace**
    - Enhance the Ideas list (sorting, filtering, pagination, column show/hide).
    - Search across title/description/tags; multi-filter bar (category, status, tags).
    - Create/Edit/Delete ideas (modal or inline).
    - Upvoting UX with immediate feedback, prevent accidental double votes.

3. **Dashboard**
    - KPIs (total, by status, most-voted, new this month) and a small Chart.js graph.

4. **Theme & Style Guide**
    - Light/Dark theme (PrimeVue themes), keyboard + SR support.
    - Style Guide page to illustrate your visual system.

## Nice-to-haves

- Table ↔ Card Grid toggle.
- Bulk actions, export.
- Inline tag editor.

## Getting Started

```bash
pnpm install
pnpm dev
```

## Electron Review Tool

This project includes an Electron-based review tool for traversing git history and reviewing UI changes across commits.

### Running the Review Tool

```bash
# Run with existing dev server
pnpm run review

# Or run with auto-start dev server
pnpm run review:dev
```

### Features

- Browse git branches and commits
- Navigate through commit history with Previous/Next buttons
- Sticky toolbar that stays on top while content scrolls
- Automatic cleanup when switching commits (no conflicts or leftover files)
- Commit details sidebar with file changes

### Setup for New Clones

The review tool automatically configures itself when launched. It uses `git update-index --skip-worktree` to preserve UI modifications (like the sticky toolbar) while allowing smooth navigation through git history.

If you need to manually configure:

```bash
pnpm run electron:setup
```

This ensures the review tool files (`electron/toolbar.html` and `electron/main.cjs`) are ignored during git operations, preventing conflicts when traversing commits.

## Submission

- Working app + commit history.
- NOTES.md outlining decisions and tradeoffs.
