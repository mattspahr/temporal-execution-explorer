# Temporal Execution Explorer

An interactive visualization that demonstrates how Temporal handles worker crashes and recovers using deterministic replay. Built for presentations, demos, and educational content about Temporal's execution model.

https://github.com/user-attachments/assets/8087112a-d50b-4c36-b6a2-3436e468cc3e

## What it shows

The app walks through a checkout workflow (charge card, reserve inventory, ship order) and visualizes two sides of Temporal's architecture:

- **Left panel (Your Infrastructure)** -- The workflow code running on a worker, shown in TypeScript, Go, Python, or Java via SDK tabs
- **Right panel (Temporal Cloud)** -- The append-only Event History that Temporal persists

During the demo, the worker (application compute) crashes mid-execution after the first activity completes. A new worker picks up by replaying the Event History -- past activity results are loaded from history rather than re-executed, and only new work generates new events. The visualization highlights which code line is active and annotates replayed results.

All data is static. There is no backend, no Temporal cluster, and no real workflow execution -- it's purely a UI for explaining the concepts.

## Getting started

Prerequisites: Node.js 18+

```sh
npm install
npm run dev
```

This starts a local Vite dev server with hot module reloading (defaults to `http://localhost:5173`).

## Building for production

```sh
npm run build
npm run preview
```

`npm run build` runs the TypeScript compiler followed by a Vite production build. Output goes to `dist/`. `npm run preview` serves the built output locally.

## Project structure

The entire application lives in a single component:

```
src/
  main.tsx              -- React entry point
  App.tsx               -- Root wrapper
  EventHistory.tsx      -- All state, data, and rendering
  index.css             -- Tailwind directives and custom theme
  lib/utils.ts          -- cn() class merge utility
```

`EventHistory.tsx` contains the SDK code definitions for all four languages, the 23-event history dataset, the playback/crash/replay state machine, and the syntax highlighting logic.
