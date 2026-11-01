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
