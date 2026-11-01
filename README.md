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
