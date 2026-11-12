# Lab 3: React 19 Exercises

Project rules are in `Agent.md` and `project-rules.md`. `TASK_DECOMPOSITION.md` is the work breakdown of the whole lab, one Part per assignment.

## Commands

Run them from the repository root.

| Command | What it does | URL |
| --- | --- | --- |
| `npm install` | Install dependencies | n/a |
| `npm run dev` | Vite dev server with hot reload | http://localhost:5173/ |
| `npm run build` | Production bundle into `dist/` | n/a |
| `npm run preview` | Serve the production bundle (use it for Lighthouse) | http://localhost:4173/ |
| `npm run lint` | Run `oxlint` | n/a |
| `npm test` | Unit tests with `node --test "src/**/*.test.js"` | n/a |

Always open the pages through Vite. Never open `index.html` through `file://`.

## Repository layout

```
project-rules.md, TASK_DECOMPOSITION.md, AI_FAILURE_AUDIT.md (added once a real AI defect exists)
docs/evidence/     screenshots, one folder per assignment (EX1_DeveloperCard/ ... HW4_BonusSituationship/)
docs/prompt_logs/  AI prompt log, one file per assignment (EX1_DeveloperCard.txt ...)
src/components/    in-class exercises: DeveloperCard (EX1), ScientistDirectory (EX2), PubgMatchTelemetry (EX3)
src/homeworks/     DrumMachine (HW1), GrandPiano88 (HW2), KraftonPubgVnArena (HW3), BonusSituationship (HW4, bonus)
src/contracts/ src/utils/ src/styles/
```

Only folders that exist today are filled; the others are created when their assignment starts.

## Exercise 1: Semantic Engineer & Pro-Gamer Profile Card

A developer profile card built with React 19 and Vite (JavaScript + JSX, JSDoc contracts, CSS Modules). The page has one `<main>` landmark that holds the `DeveloperCard` component. `DeveloperCard` renders a `SkillBadge` for each skill and shows the author's initials when the avatar image cannot be loaded.

### Source layout

```
src/
  main.jsx                 createRoot inside StrictMode, imports the global styles
  App.jsx                  <main> with the page <h1> and <DeveloperCard />
  contracts/
    developer-card.contract.js   JSDoc typedefs only (SkillTier, Skill, DeveloperCardProps, SkillBadgeProps)
  components/
    DeveloperCard.jsx / .module.css
    SkillBadge.jsx / .module.css
  utils/
    getInitials.js / .test.js    pure helper and its unit tests
  styles/
    tokens.css             design tokens (all colors live here)
    reset.css              box-sizing and element reset
    layout.css             main landmark layout
```

### Constraints

- No `div` in `DeveloperCard.jsx` and `SkillBadge.jsx`. The only `div` in the project is `<div id="root">` in `index.html`.
- HTTPS only. No `http://` in `src/`.
- Component styles use CSS Modules. Colors, spacing, radii and font sizes are CSS custom properties declared in `src/styles/tokens.css`. No hard-coded colors anywhere else.
- No legacy patterns: no `ReactDOM.render`, class components, `defaultProps`, `import * as React`, index keys, inline `style`, or `dangerouslySetInnerHTML`.
- Components are pure functions. Defaults are ES6 parameter defaults. The only state is `failedUrl`, and the initials are derived from it during render.

### Text checks

Each command must print nothing. Run them from the repository root.

| Check | Looks for |
| --- | --- |
| C1 | `<div` in the two component files |
| C2 | `http://` in `src/` |
| C3 | Legacy APIs, index keys, inline styles, unsafe HTML |
| C4 | Hard-coded colors outside `tokens.css` |

PowerShell:

```powershell
# C1
Select-String -Path src\components\DeveloperCard.jsx, src\components\SkillBadge.jsx -Pattern '<div'
# C2
Get-ChildItem src -Recurse -Include *.jsx,*.js,*.css | Select-String -Pattern 'http://'
# C3
Get-ChildItem src -Recurse -Include *.jsx,*.js | Select-String -Pattern 'React\.Component|ReactDOM\.render|defaultProps|import \* as React|keyCode|alert\(|dangerouslySetInnerHTML|innerHTML|style=\{\{|key=\{(i|idx|index)\}'
# C4
Get-ChildItem src -Recurse -Include *.css | Where-Object Name -ne 'tokens.css' | Select-String -Pattern '#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\('
```

Git Bash:

```sh
# C1
grep -n '<div' src/components/DeveloperCard.jsx src/components/SkillBadge.jsx
# C2
grep -rn 'http://' src --include='*.jsx' --include='*.js' --include='*.css'
# C3
grep -rnE 'React\.Component|ReactDOM\.render|defaultProps|import \* as React|keyCode|alert\(|dangerouslySetInnerHTML|innerHTML|style=\{\{|key=\{(i|idx|index)\}' src --include='*.jsx' --include='*.js'
# C4
grep -rnE '#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(' src --include='*.css' --exclude='tokens.css'
```

These commands only search `src/`, so the `<div` and `http://` text in this README does not affect them.

### Known limits

- The avatar is loaded from `images.unsplash.com`, so it needs a network connection. Without one, the card shows the author's initials instead of the image.
- Lighthouse results and the card metrics are measured by the author in the browser, not written by the AI. For the numbers, see report.

## Exercise 2: Interactive Scientist & Pioneer Directory

`ScientistDirectory` renders a `<section>` titled "Pioneer Directory" below the profile card, inside the same `<main>`. It lists six pioneers and lets the user:

- **Search** by name. The match is case-insensitive and ignores leading and trailing spaces.
- **Filter** by a minimum IQ (default 160).
- **Sort** by IQ, high to low (`iq-desc`), or by age, young to old (`age-asc`).
- **Delete** one row, or **Reset** the list to the original six pioneers.

The number of visible pioneers is announced in an `<output role="status" aria-live="polite">`, so screen readers hear the new count after every change.

### Source layout

New files only. The Exercise 1 files are listed above.

```
src/
  App.jsx                  <main> with the page <h1>, <DeveloperCard /> and <ScientistDirectory />
  contracts/
    scientist-directory.contract.js   JSDoc typedefs only (Pioneer, PioneerSortKey, PioneerFilter, ScientistDirectoryProps)
  data/
    smartPeople.js / .test.js         frozen SMART_PEOPLE sample data and its tests
  components/
    ScientistDirectory.jsx / .module.css
  utils/
    selectVisiblePeople.js / .test.js pure filter and sort helper and its tests
    pickNextFocusId.js / .test.js     pure helper that picks the focus target after a delete
```

### Constraints

- No `useEffect` for derived data. The visible rows are computed during render with `selectVisiblePeople(people, { query, minIq, sortBy })`. The only state is the four raw inputs: `people`, `query`, `minIq` and `sortBy`.
- Sorting uses `.toSorted()` only. Never `.sort()`, which mutates the array in place.
- State updates are immutable: Delete uses `prev.filter((p) => p.id !== id)`, and Reset restores the frozen `initialData`. Rows are keyed by `p.id`.
- Every `input` and `select` has a visible `<label htmlFor={id}>`, with the id from `useId()`. The Min IQ input is read with `valueAsNumber`.
- Focus after delete: focus moves to the Delete button of the next visible row, else the previous one, else the Name input. This happens in the click handler with `flushSync` and refs, not in an effect.
- Every `button` has `type="button"`. No `div` in any component file.

### Text checks

C1 now covers every component file. C5 is new. C2 to C4 are unchanged from Exercise 1. Each command must print nothing.

| Check | Looks for |
| --- | --- |
| C1 | `<div` in every file of `src/components/*.jsx` |
| C5 | `useEffect` in `ScientistDirectory.jsx`, `selectVisiblePeople.js` and `pickNextFocusId.js`; `.sort(` anywhere in `src/` |

PowerShell:

```powershell
# C1
Get-ChildItem src\components -Filter *.jsx | Select-String -Pattern '<div'
# C5
Select-String -Path src\components\ScientistDirectory.jsx, src\utils\selectVisiblePeople.js, src\utils\pickNextFocusId.js -Pattern 'useEffect' -ErrorAction SilentlyContinue
Get-ChildItem src -Recurse -Include *.jsx,*.js | Select-String -Pattern '\.sort\('
```

Git Bash:

```sh
# C1
grep -n '<div' src/components/*.jsx
# C5
grep -n 'useEffect' src/components/ScientistDirectory.jsx src/utils/selectVisiblePeople.js src/utils/pickNextFocusId.js
grep -rn '\.sort(' src --include='*.jsx' --include='*.js'
```

### Known limits

- Clearing the Min IQ input sets it to 0, so every pioneer is shown.
- Reset restores the list only, not the filters. The search text, Min IQ and sort order stay as they are.
- Render counts, focus behaviour and Lighthouse results are checked by the author in the browser, not written by the AI. For the numbers, see report.
- WBS deviation: commits ef3dd95 (E2-T08) and a28386e (E2-T09) also add minimal layout rules to ScientistDirectory.module.css (.controls, .status, .reset, .delete) that their WBS rows do not list. The task prompts allowed minimal CSS; the WBS was not edited afterwards (project-rules section 14).

## Exercise 3: KRAFTON PUBG VN Live Match Telemetry

`PubgMatchTelemetry` renders a `<section>` titled "KRAFTON PUBG VN Live Telemetry" below the directory, inside the same `<main>`. It shows live telemetry for three Vietnamese squads (CES, TE, GE) with a squad selector. A four-state machine (`IDLE`, `LOADING`, `SUCCESS`, `ERROR`) drives the view. Every squad switch or retry fetches a local JSON file with an `AbortController` and aborts the previous request. 35% simulated packet loss shows a `role="alert"` panel with a **Reconnect Satellite** button. A 220px Blue-Zone skeleton keeps the layout stable while the data loads.

### Source layout

New files only. The Exercise 1 and 2 files are listed above.

```
public/
  telemetry/
    ces.json, te.json, ge.json        static squad payloads served by Vite
src/
  App.jsx                  <main> with the page <h1>, <DeveloperCard />, <ScientistDirectory /> and <PubgMatchTelemetry />
  contracts/
    pubg-match-telemetry.contract.js  JSDoc typedefs only (PubgSquad, TelemetryStatus, TelemetryView, FetchTelemetryOptions, PubgMatchTelemetryProps)
  data/
    pubgVnSquads.js / .test.js        frozen PUBG_VN_SQUADS data and its tests
    telemetryPayloads.test.js         proves public/telemetry/*.json match PUBG_VN_SQUADS
  components/
    PubgMatchTelemetry.jsx / .module.css
  utils/
    telemetryView.js / .test.js       frozen view state helpers and their tests
    fetchKraftonPubgTelemetry.js / .test.js   abortable fetch with simulated packet loss and its tests
```

The new design tokens are in `src/styles/tokens.css`, in the "Telemetry (Exercise 3)" group.

### Constraints

- The async UI state is one `view` object `{ status, data, error }`, built only by the `telemetryView` helpers. No `isLoading` / `isError` booleans.
- Exactly one `useEffect`, with dependencies `[squadId, retryTick]`.
- Each effect run creates a new `AbortController` and returns the cleanup `() => controller.abort()`.
- A rejection whose name is `AbortError` is ignored: it never changes the view and never shows the error panel.
- `fetch` is called only in `fetchKraftonPubgTelemetry`. Request URLs are built only from whitelisted squad ids.
- `react/exhaustive-deps` is enabled in `.oxlintrc.json`.
- After **Reconnect Satellite**, focus moves to the selected squad button in the click handler, not in an effect.
- The skeleton pulse stops under `prefers-reduced-motion: reduce`.

### Text checks

C6 and C7 are new. C1 to C5 are unchanged from Exercises 1 and 2.

PowerShell:

```powershell
# C6. No boolean soup, no setInterval, fetch( only in the fetch helper (must print nothing)
Get-ChildItem src -Recurse -Include *.jsx,*.js | Select-String -Pattern 'isLoading|isError|setInterval\('
Get-ChildItem src -Recurse -Include *.jsx,*.js | Where-Object Name -notlike 'fetchKraftonPubgTelemetry*' | Select-String -Pattern '\bfetch\('
# C7. Abort contract present (must print 3 lines)
Select-String -Path src\components\PubgMatchTelemetry.jsx -Pattern 'new AbortController\(\)|controller\.abort\(\)|AbortError'
```

Git Bash:

```sh
# C6. No boolean soup, no setInterval, fetch( only in the fetch helper (must print nothing)
grep -rnE 'isLoading|isError|setInterval\(' src --include='*.jsx' --include='*.js'
grep -rn '\bfetch(' src --include='*.jsx' --include='*.js' | grep -v 'fetchKraftonPubgTelemetry'
# C7. Abort contract present (must print 3 lines)
grep -nE 'new AbortController\(\)|controller\.abort\(\)|AbortError' src/components/PubgMatchTelemetry.jsx
```

### How to test in the browser

- In DevTools, set Network throttling to Slow 3G (newer Chrome calls it 3G).
- Click CES, TE and GE quickly. The earlier requests are marked (canceled) in the Network tab, and no error banner appears.
- To force the error state, right-click a telemetry request in the Network tab and choose Block request URL. Then unblock it in Network request blocking and press **Reconnect Satellite**.

### Known limits

- The component takes initialSquadId instead of the slide's squadId prop, because the selector lives inside the component (slides 22 and 23 require clicking squads).
- In development, StrictMode runs the effect twice on mount, so one request is cancelled right after page load. This is expected and proves the cleanup works.
- The success article uses aria-live as in slide 23; a live region inserted together with its content may not be announced by every screen reader.
- Packet loss is random (35%), so a page load can end in the error state.
- oxlint reports one warning, react(set-state-in-effect), for setView(loadingView()) inside the effect. The line is kept on purpose: it is the slide 23 reference pattern, and moving LOADING into the event handlers would make the IDLE state unreachable.

## App shell

The page now shows one view at a time. The view comes from the URL hash.

- Hash views: `#exercises` (the default) and `#hw1`. An unknown hash shows the exercises.
- The view is read with `useSyncExternalStore`, subscribed to the `hashchange` event. There is no router package.
- The page `<h1>` now lives in a `<header>` together with `<nav aria-label="Lab sections">`. The link of the current view has `aria-current="page"`.

### Open a view

- `npm run dev`, then open `http://localhost:5173/#exercises` or `http://localhost:5173/#hw1`.
- For Lighthouse, build and serve the production bundle with `npm run build` and `npm run preview`, then run Lighthouse on each view by its URL with the hash, for example `http://localhost:4173/#hw1`. Run it once per view.

## Homework 1: Production Studio Drum Kit

`DrumMachine` is a seven-pad drum kit. It is played with the physical keys W, A, S, D, J, K, L (read through `e.code`) or with the pointer. The sounds are synthesized with the Web Audio API. A hit log in an `aria-live` output and a visual decibel meter serve deaf and hard-of-hearing users. It renders only in the `#hw1` view.

### Source layout

```
src/
  App.jsx                  SiteHeader plus <main>; DrumMachine for #hw1, the three exercises otherwise
  shell/
    resolveView.js / .test.js   frozen VIEWS and resolveView(hash), with tests
    useHashView.js              useSyncExternalStore over hashchange
    SiteHeader.jsx / .module.css   <header> with the h1 and the section nav
  homeworks/
    DrumMachine/
      drum-machine.contract.js  JSDoc typedefs only
      drumPads.js / .test.js    frozen DRUM_PADS and PAD_BY_CODE (Map keyed by e.code), with tests
      shouldHandleKey.js / .test.js   pure shortcut guard, with tests
      levels.js / .test.js      DB_FLOOR and toDecibels(samples), with tests
      drumSynth.js / .test.js   Web Audio synth with an injectable context, with tests
      useDrumKeyboard.js        window keydown, keyup and blur listeners
      DrumMachine.jsx / .module.css   pads, session input, shortcut toggle, hit log
      LevelMeter.jsx            decibel meter with its own requestAnimationFrame loop
```

The drum kit design tokens are in `src/styles/tokens.css`, in the "Drum kit (Homework 1)" group.

### Constraints

- Shortcuts read `e.code` through `PAD_BY_CODE`. No `keyCode`, `which` or `charCode`, and letters are never read from `e.key`.
- `shouldHandleKey` ignores repeats, Ctrl, Alt and Meta combinations, and events whose target is an input, textarea, select or contenteditable element.
- A checkbox turns the keyboard shortcuts off (WCAG 2.2 SC 2.1.4). While they are off, no listener is added.
- The `AudioContext` is created lazily on the first play, resumed when suspended, closed when `DrumMachine` unmounts, and created only in `drumSynth.js`.
- Every sound ramps its gain to 0.0001 with `exponentialRampToValueAtTime` before its source stops, so there is no click.
- `requestAnimationFrame` appears only in `LevelMeter`, and its loop is cancelled in the effect cleanup.
- The hit log is one `<output role="status" aria-live="polite">` with the last hit and the total, plus an `<ol>` of the last 8 hits, newest first.
- Typing in the Session name input never plays a pad.

### Pads

| id | Label | Key |
| --- | --- | --- |
| kick | Kick | W |
| snare | Snare | A |
| hihat-closed | Closed Hi-Hat | S |
| hihat-open | Open Hi-Hat | D |
| clap | Clap | J |
| tom-high | High Tom | K |
| tom-low | Low Tom | L |

### Text checks

C1' and C8a to C8c are new. C2 to C4 are unchanged from Exercise 1. Run them from the repository root.

| Check | Looks for | Expected |
| --- | --- | --- |
| C1' | `<div` in every `.jsx` file under `src/components`, `src/homeworks` and `src/shell` | prints nothing |
| C8a | `keyCode`, `which` or `charCode` in every `.js` and `.jsx` file under `src/` | prints nothing |
| C8b | `new AudioContext` in non-test files under `src/` | prints exactly 1 line (`drumSynth.js`) |
| C8c | non-test files where the number of `addEventListener` lines differs from the number of `removeEventListener` lines | prints nothing |

PowerShell:

```powershell
# C1'
Get-ChildItem src\components, src\homeworks, src\shell -Recurse -Filter *.jsx | Select-String -Pattern '<div'
# C8a
Get-ChildItem src -Recurse -Include *.jsx,*.js | Select-String -Pattern 'keyCode|\.which\b|charCode'
# C8b
Get-ChildItem src -Recurse -Include *.jsx,*.js | Where-Object Name -notlike '*.test.js' | Select-String -Pattern 'new (window\.)?AudioContext'
# C8c
Get-ChildItem src -Recurse -Include *.jsx,*.js | Where-Object Name -notlike '*.test.js' | ForEach-Object { $a = @(Select-String -Path $_.FullName -Pattern 'addEventListener').Count; $r = @(Select-String -Path $_.FullName -Pattern 'removeEventListener').Count; if ($a -ne $r) { "$($_.Name): add=$a remove=$r" } }
```

Git Bash:

```sh
# C1'
grep -rn '<div' src/components src/homeworks src/shell --include='*.jsx'
# C8a
grep -rnE 'keyCode|\.which\b|charCode' src --include='*.jsx' --include='*.js'
# C8b
grep -rnE 'new (window\.)?AudioContext' src --include='*.jsx' --include='*.js' --exclude='*.test.js'
# C8c
for f in $(find src \( -name '*.jsx' -o -name '*.js' \) ! -name '*.test.js'); do a=$(grep -c addEventListener "$f"); r=$(grep -c removeEventListener "$f"); [ "$a" -ne "$r" ] && echo "$f: add=$a remove=$r"; done
```

### How to test

These steps are done by hand in the browser at `http://localhost:5173/#hw1`.

1. UniKey in Telex mode: turn UniKey on, press A or D, and check that the pad plays. To see the key code, run `addEventListener('keydown', (e) => console.log(e.code))` in the DevTools Console; it prints `KeyA` or `KeyD`.
2. Hold one key for 2 to 3 seconds. Total hits increases by 1 only.
3. Type "wasd" in the Session name input. No pad plays.
4. Clear the Keyboard shortcuts checkbox, then press W, A, S, D, J, K and L. No pad plays.

### Known limits

- The Lab 2 drum kit was not reused; this homework was written from scratch.
- Sounds are synthesized, not recorded samples.
- aria-live announces only the latest hit; earlier hits are summarised by the total.
- Audio starts only after the first click or key press (browser autoplay policy).
- With UniKey in Telex mode, the W key reaches the page as a keydown event with an empty `code` (and `key` "ư"), so the Kick pad does not play. Switch UniKey to English mode or use the pointer. The other six pad keys are not affected.
