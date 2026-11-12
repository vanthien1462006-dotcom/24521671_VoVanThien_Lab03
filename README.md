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
docs/evidence/     screenshots, one folder per assignment (EX1_DeveloperCard/ ... BONUS_Situationship/)
docs/prompt_logs/  AI prompt log, one file per assignment (EX1_DeveloperCard.txt ...)
src/components/    in-class exercises: DeveloperCard (EX1), ScientistDirectory (EX2), PubgMatchTelemetry (EX3)
src/homeworks/     DrumMachine (HW1), GrandPiano88 (HW2), KraftonPubgVnArena (HW3), BonusSituationship (Bonus Exercise)
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
- `#hw2` shows the Homework 2 piano (`GrandPiano88`).
- The view is read with `useSyncExternalStore`, subscribed to the `hashchange` event. There is no router package.
- The page `<h1>` now lives in a `<header>` together with `<nav aria-label="Lab sections">`. The link of the current view has `aria-current="page"`.

### Open a view

- `npm run dev`, then open `http://localhost:5173/#exercises` or `http://localhost:5173/#hw1`.
- For Homework 2, open `http://localhost:5173/#hw2` (or `http://localhost:4173/#hw2` on the preview build).
- For Homework 3, open `http://localhost:5173/#hw3` (or `http://localhost:4173/#hw3` on the preview build).
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

## Homework 2: Polyphonic 88-Key Piano

`GrandPiano88` is an 88-key piano (A0 to C8, midi 21 to 108) that plays several notes at once: up to 8 voices, and the oldest voice is stolen when a 9th note arrives. You can record a take, replay it at 0.5x, 1x or 2x, and stop it with Stop Sequence. The sounds are synthesized with the Web Audio API. It renders only in the `#hw2` view.

### Source layout

```
src/
  shell/resolveView.js             VIEWS gains { id: 'hw2', label: 'HW2 Piano 88' } (and resolveView.test.js)
  App.jsx                          renders GrandPiano88 for the hw2 view
  homeworks/
    GrandPiano88/
      grand-piano.contract.js      JSDoc typedefs only
      pianoKeys.js / .test.js      FIRST_MIDI, LAST_MIDI, midiToFrequency, midiToNoteName, buildPianoKeys, frozen PIANO_KEYS, groupIntoSlots, frozen KEY_SLOTS (52 white-key slots), with tests
      PolyphonicSynth.js / .test.js   voice pool in a Map, FIFO voice stealing, noteOn, noteOff, stopAll, close, activeCount, injectable context factory, with tests
      computerKeyMap.js / .test.js    SEMITONE_BY_CODE, OCTAVES, DEFAULT_OCTAVE, computerKeyToMidi(code, octave), with tests
      recorder.js / .test.js          createTakeRecorder(now) with an injected clock, with tests
      replay.js / .test.js            REPLAY_SPEEDS, pure buildReplaySchedule, abortable delay, playSequence, with tests
      PianoKey.jsx                    memoized key button with pointer and Enter/Space handlers
      GrandPiano88.jsx                the piano: synth, pressed keys, recorder, replay, status, computer keyboard
      GrandPiano88.module.css         layout, key colors and the inner scroll of the keyboard
```

The view id `#hw2` lives in `src/shell/resolveView.js`. The piano design tokens are in `src/styles/tokens.css`, in the "Piano (Homework 2)" group. `shouldHandleKey` is imported from `src/homeworks/DrumMachine/shouldHandleKey.js`.

### Constraints

- The 88 keys are generated from midi numbers with f = 440 × 2^((midi − 69) / 12). Note names and frequencies are never typed by hand outside tests.
- `voices` is a `Map` in insertion order, and `voices.keys().next().value` is the note that gets stolen (FIFO).
- Every voice ramps its gain to 0.0001 with `exponentialRampToValueAtTime` before `osc.stop`, so there is no click.
- `PianoKey` is `React.memo`. `onNoteOn` and `onNoteOff` are stable through `useCallback` and `isPressed` is a boolean, so one press renders one key. Check it with the React DevTools Profiler.
- `mode` is one state value: `'idle'`, `'recording'` or `'playing'`.
- The replay schedule is computed by the pure function `buildReplaySchedule`, and the replay waits with a delay that can be aborted.
- Stop Sequence and unmount abort the same `AbortController`, stop every voice and release every pressed key. `AbortError` is a normal outcome.
- The `AudioContext` is created lazily in `PolyphonicSynth` and closed when `GrandPiano88` unmounts.
- Computer-keyboard notes are read from `e.code`. Letters are never read from `e.key`.

### Controls

| Control | What it does |
| --- | --- |
| Pointer (press and hold a key) | Plays the note while held; release, leave or cancel stops it |
| Enter or Space on a focused key | Plays the note while held |
| Computer keys A W S E D F T G Y H U J K | C, C#, D, D#, E, F, F#, G, G#, A, A#, B and the C of the next octave, in the selected octave |
| Keyboard octave select | Octave 1 to 7 for the computer keys, 4 by default |
| Keyboard shortcuts checkbox | Turns the computer keys on or off |
| Record / Stop recording | Starts a take, or ends it |
| Play take | Replays the last take at the selected speed |
| Stop Sequence | Aborts the replay in progress |
| Replay speed (0.5x, 1x, 2x) | Speed of the next replay |

### Text checks

C8b', C9a, C9b, C9c are new for this homework. C5 is the existing check for `.sort(`. Run them from the repository root.

| Check | Looks for | Expected |
| --- | --- | --- |
| C8b' | `new AudioContext` in non-test files under `src/` | prints exactly 2 lines (`drumSynth.js` and `PolyphonicSynth.js`) |
| C9a | a hard-coded note name such as `A0` or `C#4` in `src/homeworks/GrandPiano88/`, except `*.test.js` and `*.contract.js` | prints nothing |
| C9b | `memo(function PianoKey` in `PianoKey.jsx` | prints 1 line |
| C9c | `new AbortController()` and `.abort()` in `GrandPiano88.jsx` | prints at least 2 lines |
| C5 | `.sort(` anywhere in `src/` | prints nothing |

PowerShell:

```powershell
# C8b'
Get-ChildItem src -Recurse -Include *.jsx,*.js | Where-Object Name -notlike '*.test.js' | Select-String -Pattern 'new (window\.)?AudioContext'
# C9a
Get-ChildItem src\homeworks\GrandPiano88 -Recurse -Include *.jsx,*.js | Where-Object { $_.Name -notlike '*.test.js' -and $_.Name -notlike '*.contract.js' } | Select-String -CaseSensitive -Pattern '\b[A-G]#?[0-8]\b'
# C9b
Select-String -Path src\homeworks\GrandPiano88\PianoKey.jsx -Pattern 'memo\(function PianoKey'
# C9c
Select-String -Path src\homeworks\GrandPiano88\GrandPiano88.jsx -Pattern 'new AbortController\(\)|\.abort\(\)'
# C5
Get-ChildItem src -Recurse -Include *.jsx,*.js | Select-String -Pattern '\.sort\('
```

Git Bash:

```sh
# C8b'
grep -rnE 'new (window\.)?AudioContext' src --include='*.jsx' --include='*.js' --exclude='*.test.js'
# C9a
grep -rnE '\b[A-G]#?[0-8]\b' src/homeworks/GrandPiano88 --include='*.jsx' --include='*.js' --exclude='*.test.js' --exclude='*.contract.js'
# C9b
grep -n 'memo(function PianoKey' src/homeworks/GrandPiano88/PianoKey.jsx
# C9c
grep -nE 'new AbortController\(\)|\.abort\(\)' src/homeworks/GrandPiano88/GrandPiano88.jsx
# C5
grep -rn '\.sort(' src --include='*.jsx' --include='*.js'
```

### How to test

These steps are done by hand in the browser at `http://localhost:5173/#hw2`.

1. Count the keys. Paste this in the DevTools Console. Expected: `[88, 36]` (88 keys, 36 of them black).

   ```js
   const keys = [...document.querySelectorAll('[aria-label="Piano keyboard"] button')];
   [keys.length, keys.filter((k) => k.textContent.includes('#')).length];
   ```

2. Profiler. In React DevTools, open Profiler settings and turn on "Record why each component rendered". Start recording, press one key, stop recording. In the Ranked view only `GrandPiano88` and one `PianoKey` rendered, and the reason for that `PianoKey` is a changed prop (`isPressed`).
3. Voice stealing. Paste this in the Console. The status line reads "Voices: 8 of 8". Then release the keys with the second snippet. Synthetic events are not user gestures, so the browser may keep the audio silent; the status line still counts voices.

   ```js
   const piano = [...document.querySelectorAll('[aria-label="Piano keyboard"] button')].slice(30, 39);
   piano.forEach((k) => k.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })));
   ```

   ```js
   piano.forEach((k) => k.dispatchEvent(new PointerEvent('pointerup', { bubbles: true })));
   ```

4. Record and replay. Press Record, play a few notes, press Stop recording, choose 2x, press Play take, then press Stop Sequence in the middle. Then run this in the Console. Expected: `0`.

   ```js
   document.querySelectorAll('[aria-label="Piano keyboard"] [aria-pressed="true"]').length;
   ```

5. Computer keyboard. Hold A, D and G for a chord. Clear the Keyboard shortcuts checkbox: the keys no longer play.
6. UniKey in Telex mode: see Known limits.

### Known limits

- The synth file lives in src/homeworks/GrandPiano88/ instead of the slide's src/audio/ (repository rule 14).
- The keyboard scrolls horizontally inside its own container at 375px; the page itself does not.
- Pressed keys can exceed 8 while only 8 voices sound (the oldest voice is stolen).
- The Lab 2 code was not reused; this homework was written from scratch.
- With UniKey in Telex mode, the W key and the tone key S can reach the page as keydown events with an empty `code` (UniKey rewrites the typed letter), so those notes may not play, for example A then S loses the D. Switch UniKey to English mode, or use the pointer or Enter and Space on a focused key.
- Computer-keyboard notes do not play while focus is on the octave select, the Keyboard shortcuts checkbox or a Replay speed radio; click an empty area of the page first.
- Starting or stopping a recording releases every held note, because the keyboard effect depends on mode.
- The status text says "Take ready: 1 notes" for a single note.
- Browsers throttle timers in background tabs, so replay timing can drift when the tab is not visible.

## Homework 3: KRAFTON x PUBG Vietnam Airdrop Arena

`KraftonPubgVnArena` shows PVS Finals ticket and G-Coin crate airdrops with an anti-drift countdown (`usePubgAirdropTimer`, resynced on `visibilitychange`), optimistic claims with an in-flight lock and rollback on 409 Looted Out against an in-memory mock server, a leaderboard of the squads te, ces, ge and agg sorted by WWCD, placement points, kill points or total, and a kill feed filtered by squad. It renders only in the `#hw3` view.

**Sample data, not official PVS results or prices.**

All numbers, prices and stock in this homework are sample data written for the exercise.

### Source layout

```
src/
  shell/resolveView.js             VIEWS gains { id: 'hw3', label: 'HW3 PUBG VN Arena' } (and resolveView.test.js)
  App.jsx                          renders KraftonPubgVnArena for the hw3 view
  styles/tokens.css                "Arena (Homework 3)" token group
  homeworks/
    KraftonPubgVnArena/
      pubg-vn-arena.contract.js    JSDoc typedefs only
      arenaData.js / .test.js      SAMPLE_DATA_NOTICE, DROP_WINDOW_MS, frozen SQUAD_STANDINGS and CRATE_SEEDS, buildSampleCrates(nowMs), buildServerStock(), with tests
      airdropClock.js / .test.js   computeRemainingMs, formatCountdown, DROP_PHASES, getDropPhase, with tests
      formatVnd.js / .test.js      formatVnd with one module-level Intl.NumberFormat('vi-VN'), with tests
      arenaReducer.js / .test.js   createArenaState and the pure arenaReducer (CLAIM_STARTED, CLAIM_CONFIRMED, CLAIM_REJECTED, CLAIM_ABORTED, DISMISS_ERROR), with tests
      mockArenaServer.js / .test.js   createMockArenaServer: in-memory claimCrate that answers by claimId (idempotent), 200 or 409 Looted Out, abortable, with tests
      standings.js / .test.js      SORT_OPTIONS and selectStandings (filter, derived totalPts, toSorted), with tests
      killFeed.js / .test.js       WEAPONS, seeded generateKillFeed, frozen SAMPLE_KILL_FEED, filterKillFeed, with tests
      usePubgAirdropTimer.js       hook: stores nowMs, 200 ms tick, visibilitychange resync, returns { remainingMs, isLive, nowMs }
      CrateCard.jsx                one crate: price, stock, phase, countdown while warming up, Claim button with aria-disabled
      Leaderboard.jsx              standings table with caption, scope and aria-sort inside a focusable scroll container
      KillFeed.jsx                 filtered kill-feed list with a result count
      KraftonPubgVnArena.jsx       the arena: claim reducer, mock server, in-flight Map, squad and sort filters, error alert
      KraftonPubgVnArena.module.css   layout, crate grid, table, kill-feed rows with content-visibility
```

The view id `#hw3` lives in `src/shell/resolveView.js`. The arena design tokens are in `src/styles/tokens.css`, in the "Arena (Homework 3)" group. The abortable `delay` is imported from `src/homeworks/GrandPiano88/replay.js`.

### Constraints

- Remaining time is derived during render from `computeRemainingMs(targetEpochMs, nowMs, serverOffsetMs)`. The hook only stores `nowMs`.
- The slide's hook was restructured because its effect reads a function that is not in the dependency list (`exhaustive-deps`) and calls `setState` synchronously in the effect body (`set-state-in-effect`).
- The effect ticks every 200 ms and resyncs on `visibilitychange`, and its cleanup clears the timer and removes the listener.
- `setInterval` is allowed only in `usePubgAirdropTimer.js`.
- The claim reducer is pure, with a pending `claimId` lock per crate. `CLAIM_REJECTED` restores the optimistic decrement and then applies the server stock. An in-flight `Map` in the component backs the lock.
- The claim button uses `aria-disabled` plus a handler guard, so it keeps focus.
- Every claim has an `AbortController` and unmount aborts them all. `AbortError` is not shown as an error.
- Prices use one module-level `Intl.NumberFormat('vi-VN')`.
- The kill feed uses CSS `content-visibility: auto` with `contain-intrinsic-size` instead of JavaScript windowing, because windowing needs dynamic inline styles, which project-rules section 7 forbids.
- Leaderboard sorting uses `toSorted`.

### Sample data

Crates (from `arenaData.js`). UI stock is what the page shows at first; server stock is what the mock server holds. The drop offset is added to the time the arena opened.

| id | title | priceVnd | UI stock | server stock | drop offset (ms) |
| --- | --- | --- | --- | --- | --- |
| `vip-pass` | PVS Finals VIP Pass + 5,000 G-Coin | 1990000 | 5 | 5 | +45000 |
| `gcoin-600` | G-Coin Contraband Crate (600 G-Coin) | 149000 | 3 | 3 | -60000 |
| `gcoin-last` | G-Coin Contraband Crate (Last Crate) | 149000 | 1 | 0 | -60000 |
| `early-bird` | PVS Finals Early-Bird Pass | 990000 | 2 | 2 | -1200000 |

Squads (from `arenaData.js`).

| squadId | squadName | wwcdCount | placementPts | killPts |
| --- | --- | --- | --- | --- |
| `te` | The Expendables | 3 | 58 | 47 |
| `ces` | Cerberus Esports | 2 | 61 | 39 |
| `ge` | Genius Esports | 2 | 44 | 52 |
| `agg` | AGG | 1 | 49 | 33 |

Other values: `DROP_WINDOW_MS` is 600000 (10 minutes), the mock server latency is 800 ms, and the kill feed has 120 events generated with seed 2026.

### Text checks

C6', C10, C11 and C12 apply to this homework. Run them from the repository root.

| Check | Looks for | Expected |
| --- | --- | --- |
| C6' | `isLoading` or `isError`; `setInterval(` outside `usePubgAirdropTimer.js`; `fetch(` outside the telemetry fetch helper | prints nothing for all three commands |
| C10 | a countdown done by subtraction (`=> x - 1` or `-= 1000`) in `src/homeworks/KraftonPubgVnArena/` | prints nothing |
| C11 | `setInterval(`, `clearInterval(` and the `visibilitychange` add and remove calls in `usePubgAirdropTimer.js` | prints exactly 4 lines |
| C12 | `not official` in `arenaData.js` and `README.md` | prints at least 2 lines, one from each file |

PowerShell:

```powershell
# C6'
Get-ChildItem src -Recurse -Include *.jsx,*.js | Select-String -Pattern 'isLoading|isError'
Get-ChildItem src -Recurse -Include *.jsx,*.js | Where-Object Name -ne 'usePubgAirdropTimer.js' | Select-String -Pattern 'setInterval\('
Get-ChildItem src -Recurse -Include *.jsx,*.js | Where-Object Name -notlike 'fetchKraftonPubgTelemetry*' | Select-String -Pattern '\bfetch\('
# C10
Get-ChildItem src\homeworks\KraftonPubgVnArena -Recurse -Include *.jsx,*.js | Select-String -Pattern '=>\s*\w+\s*-\s*1\b|-=\s*1000'
# C11
Select-String -Path src\homeworks\KraftonPubgVnArena\usePubgAirdropTimer.js -Pattern 'setInterval\(|clearInterval\(|addEventListener\(.visibilitychange|removeEventListener\(.visibilitychange'
# C12
Select-String -Path src\homeworks\KraftonPubgVnArena\arenaData.js, README.md -Pattern 'not official'
```

Git Bash:

```sh
# C6'
grep -rnE 'isLoading|isError' src --include='*.jsx' --include='*.js'
grep -rnE 'setInterval\(' src --include='*.jsx' --include='*.js' --exclude='usePubgAirdropTimer.js'
grep -rnE '\bfetch\(' src --include='*.jsx' --include='*.js' --exclude='fetchKraftonPubgTelemetry*'
# C10
grep -rnE '=>\s*\w+\s*-\s*1\b|-=\s*1000' src/homeworks/KraftonPubgVnArena --include='*.jsx' --include='*.js'
# C11
grep -nE 'setInterval\(|clearInterval\(|addEventListener\(.visibilitychange|removeEventListener\(.visibilitychange' src/homeworks/KraftonPubgVnArena/usePubgAirdropTimer.js
# C12
grep -n 'not official' src/homeworks/KraftonPubgVnArena/arenaData.js README.md
```

### How to test

These steps are done by hand in the browser at `http://localhost:5173/#hw3`.

1. Four crates are shown: the VIP pass is in Warm-up with a countdown that turns Airdrop live after about 45 seconds without a reload, two G-Coin crates are live, and the Early-Bird pass is Expired.
2. Background tab: reload, switch to another tab for at least 60 seconds, then come back. The countdown is already correct.
3. Optimistic claim: click Claim on the 600 G-Coin crate. The stock drops at once and the button says Claiming…, then "Claimed by you 1" appears.
4. Double-click lock: in the Console run the snippet below. The stock drops by 1 only.

   ```js
   const b = [...document.querySelectorAll('button')].find(x => x.textContent === 'Claim' && x.closest('article').textContent.includes('600 G-Coin')); for (let i = 0; i < 5; i++) b.click()
   ```

5. Rollback: click Claim on the Last Crate. The stock goes from 1 to 0, then a red alert "Looted Out: your claim was rolled back." appears and the status is Looted out.
6. Unmount: click Claim and at once click HW1 in the nav. The Console stays clean.
7. Leaderboard and kill feed: set Sort to Kill points to get the order Genius Esports, The Expendables, Cerberus Esports, AGG. Set Squad to AGG to see only AGG events in the kill feed.

### Known limits

- All numbers, prices and stock are sample data, not official PVS results or prices.
- The mock server lives in memory, so reloading the page resets the stock and the claims.
- Background tabs may tick only once a minute; the countdown is corrected when the tab becomes visible again (`visibilitychange`).
- One squad select filters both the leaderboard and the kill feed, so with a squad selected the leaderboard shows a single row.
- Each crate card runs its own 200 ms timer, so four timers run while the arena is open.
- Kill-feed rows rely on `content-visibility`; browsers without it render every row normally.
- The Lab 2 code (anti-drift timer, virtual scroller) was not reused; this homework was written from scratch.
- The mock server is in memory only; there is no real network or server, and claim IDs come from `crypto.randomUUID`, which needs localhost or HTTPS.

## Bonus Exercise: Hẹn Hò Nhưng Không Yêu Situationship FSM

`SituationshipAnalyzer` models a relationship as a finite state machine with four phases (FRIENDS, DATING_NO_LOVE, OFFICIAL_LOVE, GHOSTED_EXIT). The red flag is derived during render from the phase and two effort counters, never stored. A 5 second ghosting timer is an abortable promise, and the effect cleanup aborts it. Every effort signal is appended to an immutable log.

### Source layout

```
src/
  shell/resolveView.js             VIEWS gains { id: 'bonus', label: 'Bonus Exercise' } (and resolveView.test.js)
  App.jsx                          renders SituationshipAnalyzer for the bonus view
  styles/tokens.css                "Situationship (Bonus)" token group
  homeworks/
    BonusSituationship/
      situationship.contract.js    JSDoc typedefs only
      situationshipModel.js / .test.js   PHASES, EFFORT_WEIGHTS, transition, computeImpacts, isRedFlag, createSignal, appendSignal, latestSignals, sanitizeCount, with tests
      SituationshipAnalyzer.jsx    the component: inputs, meter, buttons, ghost timer, signal log
      SituationshipAnalyzer.module.css   mobile-first layout
```

The view id `#bonus` lives in `src/shell/resolveView.js`. The abortable `delay` is imported from `src/homeworks/GrandPiano88/replay.js`.

### Constraints

- The phase is one value changed only by the pure `transition(phase, event)`. An unknown phase and event pair returns the current phase, and an unknown phase throws a TypeError. There are no boolean flags for the relationship (check C13).
- Transitions: FRIENDS + START_DATING gives DATING_NO_LOVE; DATING_NO_LOVE + CONFIRM_LOVE gives OFFICIAL_LOVE; DATING_NO_LOVE + GHOST_TIMEOUT gives GHOSTED_EXIT; FRIENDS, DATING_NO_LOVE and OFFICIAL_LOVE + UNBIND give GHOSTED_EXIT; GHOSTED_EXIT + RESET gives FRIENDS.
- Weights: `myImpact = myTries * 0.1` and `rivalImpact = rivalTries * 50`. The start values 100 and 1 give 10 against 50.
- `isRedFlag(phase, myImpact, rivalImpact)` is true only in DATING_NO_LOVE when `myImpact` is below `rivalImpact`. It is computed during render. "Xác nhận yêu" is offered only when it is not a red flag.
- The meter shows Em's share of the total impact (0 when both are 0).
- One effect with deps `[phase, myTries]` starts the 5 second wait only in DATING_NO_LOVE. It creates an `AbortController`, and the cleanup aborts it, so a new try, a phase change or leaving the page cancels the old timer (check C14).
- The signal log is immutable: each signal is a frozen object with an id from `crypto.randomUUID`, appended as `[...log, signal]`. The list shows the last 10, newest first.
- The Vietnamese UI text is inside an element with `lang="vi"`, English phrases carry `lang="en"`, the result is an `<output role="status" aria-live="polite">`, and the two number inputs have labels linked with `useId`.

### Text checks

C13, C14 and C15 apply to this exercise. Run them from the repository root.

| Check | Looks for | Expected |
| --- | --- | --- |
| C13 | `isDating`, `isLoved` or `hasTitle` in `src/homeworks/BonusSituationship/` | prints nothing |
| C14 | `new AbortController()` and `.abort()` in `SituationshipAnalyzer.jsx` | prints 2 lines |
| C15 | the two required commit messages in `git log` | prints 2 lines |

PowerShell:

```powershell
# C13
Get-ChildItem src\homeworks\BonusSituationship -Include *.js,*.jsx -Recurse | Select-String -Pattern 'isDating|isLoved|hasTitle'
# C14
Select-String -Path src\homeworks\BonusSituationship\SituationshipAnalyzer.jsx -Pattern 'new AbortController\(\)|\.abort\(\)'
# C15
git --no-pager log --oneline | Select-String -Pattern 'feat\(fsm\): model HenHoKhongYeu state machine|feat\(ui\): add derived red-flag meter & ghosting cleanup'
```

Git Bash:

```sh
# C13
grep -rnE 'isDating|isLoved|hasTitle' src/homeworks/BonusSituationship --include='*.js' --include='*.jsx'
# C14
grep -nE 'new AbortController\(\)|\.abort\(\)' src/homeworks/BonusSituationship/SituationshipAnalyzer.jsx
# C15
git --no-pager log --oneline | grep -E 'feat\(fsm\): model HenHoKhongYeu state machine|feat\(ui\): add derived red-flag meter & ghosting cleanup'
```

### How to test

These steps are done by hand in the browser at `http://localhost:5173/#bonus`.

1. Open the page. The phase is DATING_NO_LOVE, the red-flag text is shown, the meter is low and the numbers read "Em: 10.0 · Ai đó: 50.0". There is no "Xác nhận yêu" button.
2. Wait 5 seconds without touching anything. The phase becomes GHOSTED_EXIT, the text is "[OK] Stable", and only "Bắt đầu lại" remains next to the signal buttons.
3. Timer reset: reload and click "Gửi tin nhắn" every 3 seconds for about 15 seconds. The phase stays DATING_NO_LOVE and the signal log grows, newest first.
4. Set "Em cố (số lần)" to 500. The text becomes "[OK] Stable", and "Xác nhận yêu" appears. Click it within 5 seconds, before the ghosting timer fires, to reach OFFICIAL_LOVE (no timer runs there).
5. Click "Unbind & Free Memory". The phase becomes GHOSTED_EXIT at once. "Bắt đầu lại" gives FRIENDS, and "Bắt đầu hẹn hò" gives DATING_NO_LOVE, which starts the timer again.
6. Unmount: reload, and within 5 seconds click HW1 in the nav. Wait 6 seconds. The Console stays clean.

### Known limits

- Phase names and weights follow the slide 32 reference code (FRIENDS / DATING_NO_LOVE / OFFICIAL_LOVE / GHOSTED_EXIT, 0.1 against 50), not the alternative names and multipliers in the text of slide 31.
- "Dừng Lại" in slide 32 is implemented as the "Unbind & Free Memory" button.
- Only short phrases from the slides are used; no song lyrics.
- Only `phase` and `myTries` restart the 5 second timer, as in slide 32. "Ai đó một phần" changes the numbers and the log but does not restart it.
- The signal buttons stay enabled in GHOSTED_EXIT, so the log can still grow there until "Bắt đầu lại" is clicked.
- `transition` reads events from a plain object, so an event named like an `Object.prototype` property (`constructor`, `toString`) returns that property instead of the current phase. The page only sends the five known events, so this cannot happen from the UI.
- Reloading the page resets the phase, the counters and the log; nothing is stored.
