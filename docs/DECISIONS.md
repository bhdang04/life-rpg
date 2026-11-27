# Decisions

One line per decision, and why.

- Mission data lives in `src/config/missions.ts`: adding or tuning a mission means editing data, not code.
- Timed missions: tap the tracker until it hits the target before the countdown ends, or you get 0 XP. This is the "timer expiring unfinished" rule.
- Broken mission (leaving the app): -5 XP from that mission's stat, never below 0; it can be retried the same day.
- Sleep: 7-9h gives the full 30 XP, under 7h scales linearly, over 9h still gives 30. Oversleeping isn't penalised.
- Money: spending at or under the budget gives 20 XP, over the budget gives 0. Mood + Energy: 10 XP for logging. Each check-in once per day.
- Stat level is 100 XP per level, linear. It's simple and easy to tune later.
- Overall rank uses total XP: E 0, D 1k, C 3k, B 7k, A 15k, S 30k.
- Streak bonus: +10% per streak day, capped at +50%. It applies only to XP earned, never to penalties.
- Streak is checked at the rollover to the next local day. Every skipped day breaks it, even if the last day was complete.
- Gold: 1 per 10 XP earned, remainder carried over. Penalties never remove gold, so gold only goes up until the V3 shop.
- Each mission can be completed once per day. Only one timed mission can be active at a time.
- Core functions are pure (state in, state out) so they can be tested without a DOM.
- No router: the screen changes with a `useState` tab, so there's one less dependency.
- Rank-up is a full-screen card (like level-up), not a toast; it queues after level-ups and before Day complete.
- New best (PR): top weight beats every earlier session, or same weight with more reps. A first-ever exercise is not a PR. A card shows after Gym finish.
- Deploy the app to a private host only: the workout seed in the bundle is real training history.
