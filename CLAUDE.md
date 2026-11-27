# Life RPG: notes for Claude

Vite + React + TypeScript PWA. V1 only (local data, no server).

## Commands
- `npm test` runs Vitest. `npm run build` type-checks and builds. Run both before reporting a step done.
- `npm run icons` regenerates `public/*.png`.

## Rules
- Read `docs/DECISIONS.md` before changing game rules. Add a one-line decision there when a rule changes.
- Mission data lives in `src/config/missions.ts`. Tuning or adding a mission is a data edit, not a code edit.
- `src/core/` is pure (state in, state out) and tested. Keep React and `localStorage` out of it.
- Saved data is `{version:1,...GameState}` under `"life-rpg:v1"`. Ask before changing the schema.
- Every known limit gets a comment: `shortcut: <the limit>, <when to upgrade>`.
- Ask before adding a dependency or deleting files. Never push.
- Commit one file per commit, format `feat: ...`, `fix: ...`, `docs: ...`, `test: ...`.
- Before each build step, give a one-line size check and wait for "go".

## Real phone
Tested on an iPhone: Wake Lock, the visibilitychange break, Copy JSON, PWA install, and the level-up, rank-up and new-best cards.
Not tested: haptics (Android only, iOS Safari has no vibrate). Guided Access is not needed.
