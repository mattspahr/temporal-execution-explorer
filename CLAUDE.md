# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

- `npm run dev` — Start Vite dev server with HMR
- `npm run build` — TypeScript check (`tsc -b`) then Vite production build
- `npm run preview` — Preview production build locally
- No test or lint scripts are configured

## What This Is

An interactive single-page visualization demonstrating Temporal workflow crash recovery and deterministic replay. It shows a checkout workflow (chargeCard → reserveInventory → shipOrder) executing step-by-step, simulates a worker crash, then replays from event history on a new worker. The same workflow is shown in TypeScript, Go, Python, and Java via SDK tabs.

All data is static/hardcoded — there is no backend or API.

## Architecture

The entire app lives in one component:

- `src/main.tsx` → `src/App.tsx` → `src/EventHistory.tsx` (`EventHistorySlide`)
- `EventHistory.tsx` contains all state, data, logic, and rendering (~800 lines)
- `src/lib/utils.ts` — `cn()` helper for merging Tailwind classes

React Router is installed but unused. The app is a single view.

## Key Data Structures in EventHistory.tsx

- `sdkDefinitions` — Record keyed by `SdkKey` (`"typescript" | "go" | "python" | "java"`), each with `label`, `filename`, and `codeLines` array. Each code line has a `type` tag and optional `activity` annotation linking it to events.
- `allEvents` — 23 hardcoded `EventItem` entries representing the full Temporal event history for the checkout workflow.
- `displayItems` — Built from `allEvents` by `buildDisplayItems()`, which groups consecutive WorkflowTask events into collapsible rows.
- `CRASH_DISPLAY_INDEX` — Computed index where the crash occurs (after chargeCard completes).

## State Machine Flow

Mount → auto-play (600ms delay) → events appear at 400ms intervals → crash at `CRASH_DISPLAY_INDEX` → 2s pause → deterministic replay scans code lines at 150ms → resumes playback → completion.

The `chargeCardLineIndex` (line where replay stops scanning) is computed dynamically per SDK so replay works correctly regardless of which language tab is active.

## Styling

- Tailwind CSS with `class`-based dark mode (dark mode is always on via `index.css`)
- Custom colors: `temporal-purple`, `temporal-blue`, `temporal-green`, `temporal-orange` defined in `tailwind.config.ts`
- Semantic CSS variables (`--background`, `--primary`, etc.) set in `src/index.css`
- Custom classes in `index.css`: `.slide-content`, `.code-block`, `.gradient-text`
- Framer Motion for all entry/exit animations and the replay pulse effect

## Syntax Highlighting

`highlightCode(line, sdk)` does custom token-based highlighting per SDK. Lookup tables (`sdkKeywords`, `sdkTypes`, `activityNames`, `functionNames`) control coloring. Comments (`//` vs `#`) and decorators (`@`) are detected per language and rendered as full-line styles.

## Path Aliases

`@/*` maps to `./src/*` (configured in both `tsconfig.json` and `vite.config.ts`).
