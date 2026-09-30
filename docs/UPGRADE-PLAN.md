# Upgrade Plan

## Current state

- Before this pass: **1/10** — React Native CLI scaffold with placeholder
  screens and no entry point (`index.js`), `app.json`, Babel/Metro/Jest/ESLint
  config or lockfile; CI masked every failure with `|| true`.
- After this pass: **6/10** — "Ranking Desk": the same transparent,
  rule-based recommender as the web frontend, with explained scores,
  dismiss/restore and an auditable catalog tab; honest CI (lint, typecheck,
  Jest, Metro Android bundle). No native `android/`/`ios/` projects yet.

## Backlog

### P0
- Generate native projects (`npx @react-native-community/cli init` with the
  RN 0.76 template, copy `android/` + `ios/`, app name
  `RecommendationEngineMobile`) and add an Android debug build job to CI.

### P1
- Share one catalog/rank source with the web frontend (published package or
  generated file) instead of the mirrored copy in `src/lib/`.
- "More like this" (re-rank by the tapped project's category + tokens).

### P2
- Upgrade RN 0.76 -> current and ESLint 9 flat config.

## Done in this pass

- `src/lib/rank.ts` + `src/lib/catalog.ts`: port of the frontend's editorial
  ranker and catalog, plus an `exclude` option; `projectHost` no longer relies
  on the `URL` global (partial in React Native). Jest tests for ranking,
  tokenising, catalog integrity and host parsing.
- Ranking tab: intent selector, keyword box, ranked cards with every point
  explained, open in browser, "Not for me" dismiss/restore. Catalog tab lists
  every project with its category weights. Render test for re-rank + dismiss.
- Added `index.js`, `app.json`, Babel/Metro/Jest/ESLint/Prettier config,
  RN 0.76 template dev dependencies and a committed `package-lock.json`.
- CI runs `npm ci`, lint (0 warnings), typecheck, Jest and a Metro Android
  bundle with no failure masking.

## Done in this pass (pass 2)

Score: 6/10 (was 5/10) — dismissals persist; native projects still not generated.

- Dismissed projects persist with `@react-native-async-storage/async-storage` 2.2.0 via `src/usePersistentState.ts` + pure versioned codecs in `src/lib/persist.ts` (a failed read never overwrites stored data). Jest uses the official storage mock (`jest.setup.js`).
- Tests: codec cases and a remount test proving a dismissed project stays hidden (18 jest tests).
- Accessibility: Open / Not-for-me buttons name the project; `Linking.openURL` failures are caught.
- Advisories: no same-major fixes available (image-size via metro etc.); needs the RN upgrade (P2).
- Verified: lint, typecheck, jest, `npm run bundle:android`.
