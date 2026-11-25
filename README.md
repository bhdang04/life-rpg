# Life RPG

A phone-first PWA that turns your day into quests. Finish daily missions to earn XP, level five stats, build a streak and rank up from E to S. V1 is local-only: no account, no server, data stays in your browser.

## Run it

```
npm install
npm run dev        # http://localhost:5173 (add -- --host to open it on your phone over Wi-Fi)
npm test           # Vitest, pure game logic
npm run build      # type-check + production build (also generates the service worker)
npm run preview    # serve the built app
npm run icons      # regenerate public/*.png icons
```

## How it plays

- **Daily Quests:** the 4 required missions. Finish all of them to keep your streak.
- **Plan:** bonus missions and daily check-ins (sleep, mood + energy, money).
- **Timed missions:** tap the tracker up to its target before the countdown ends, or you get 0 XP. Leaving the app breaks the mission (-5 XP).
- Rules of play and the reasons behind them: `docs/DECISIONS.md`.
- Backup: Settings → Copy JSON.

## Install on a phone

The service worker and install prompt need `https`. Host the `dist/` folder somewhere with `https`, open it in Safari (iOS) or Chrome (Android), then Add to Home Screen. Not set up yet, so install is untested.

Needs a phone test: Wake Lock (screen stays on during a mission), Guided Access (iOS lock-in), visibilitychange break, Copy JSON, install.

## Layout

```
src/config/missions.ts   all mission, stat and tuning data
src/core/                pure game logic (state in, state out)
src/store/               localStorage load/save (key "life-rpg:v1")
src/screens/             Board, Mission, CheckIn, Stats, Settings
src/theme/tokens.css     dark purple glass theme
tests/                   Vitest tests for core + storage
```
