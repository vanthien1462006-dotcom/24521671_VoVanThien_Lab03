# TASK_DECOMPOSITION.md: Lab 3

Work breakdown of the whole lab, one Part per assignment. Every commit in git log maps to exactly one row of a WBS table below, and each row is committed before the commit it describes. Read `Agent.md` and `project-rules.md` before any task.

## Part 1. Exercise 1: Semantic Engineer & Pro-Gamer Profile Card

### 1. Overview

- **Deliverable:** two React components, `DeveloperCard` and `SkillBadge`, rendered inside one `<main>` landmark.
- **Stack:** React 19 + Vite. JavaScript with JSX. Contracts are written as JSDoc typedefs. No TypeScript.
- **Styling:** CSS Modules for components (`Name.module.css`). Global files only for tokens, reset and layout, in `src/styles/`.
- **Goals:**
  - Zero `div` in the two component files. The only `div` in the project is `<div id="root">` in `index.html`.
  - HTTPS only. No `http://` anywhere in `src/`.
  - No horizontal scroll at 375px (and at 320px).
  - Lighthouse Accessibility score of 100, measured by the author in the browser.

### 2. Contract

This block is copied into `src/contracts/developer-card.contract.js` in E1-T05. The contract is committed before any component code.

```js
/**
 * @typedef {'Core' | 'Awareness' | 'Later'} SkillTier
 */

/**
 * @typedef {Object} Skill
 * @property {string} id      Stable unique id. Used as the React key.
 * @property {string} name
 * @property {SkillTier} tier
 */

/**
 * @typedef {Object} DeveloperCardProps
 * @property {string} [fullName]
 * @property {string} [role]
 * @property {string} [avatarUrl]  HTTPS only.
 * @property {Record<string, string | number>} [metrics]  Rendered as dt/dd pairs.
 * @property {Skill[]} [skills]
 */

/**
 * @typedef {Object} SkillBadgeProps
 * @property {string} name
 * @property {SkillTier} [tier]
 */

export {};
```

### 3. Invariants

1. `DeveloperCard` and `SkillBadge` are pure function components. Defaults are ES6 parameter defaults. No `defaultProps`.
2. `DeveloperCard.jsx` and `SkillBadge.jsx` contain none of these strings, not even in a comment: `<div`, `http://`, `style=`, `key={index}`.
3. The card root is `<article aria-labelledby={headingId}>`, with `headingId` from `useId()`. The card title is an `h2`.
4. The only state is `failedUrl` (the avatar URL that failed to load). Whether the initials show is a derived value: `failedUrl === avatarUrl`. No `useEffect`.
5. The avatar `<img>` has explicit `width="64"` and `height="64"`.

### 4. Default data

| Field | Value |
| --- | --- |
| `fullName` | `Võ Văn Thiện` |
| `role` | `Student at the University of Information Technology – VNU-HCM` |
| `avatarUrl` | `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240` |
| `metrics` | `{ commits: 0, vdomNodes: 0, a11yScore: 0 }`. Placeholders, replaced by measured values in E1-T19. |
| `skills` | `sk-1` "React 19 createRoot + StrictMode" (Core); `sk-2` "Hooks: useState, useEffect, useId" (Core); `sk-3` "Semantic JSX" (Core); `sk-4` "React.memo" (Awareness) |

### 5. Work breakdown structure

One row is one task, one prompt and (except E1-T17 and E1-T20) one atomic commit. Commit messages are exact.

| ID | Task | File | Acceptance criteria | Commit message |
| --- | --- | --- | --- | --- |
| E1-T01 | Verify the Vite scaffold and make the first commit | Vite scaffold, `Agent.md`, `project-rules.md` | `npm run build` and `npm run lint` pass. `npm ls --depth=0` lists only the template packages. Files staged by explicit path. | `chore: init react19 vite & rules` |
| E1-T02 | Write this WBS, contract and invariants | `TASK_DECOMPOSITION.md` | 20 WBS rows. Commit messages match the git log one to one. Commit lists exactly one file. | `docs(spec): add ex1 task decomposition and contract` |
| E1-T03 | Remove the Vite demo | `git rm` of `src/App.css`, `src/index.css`, `public/icons.svg`, `src/assets/*`; rewrite `src/main.jsx`, `src/App.jsx` | Build and lint pass. `main.jsx` uses `createRoot` inside `StrictMode`. `App` is a named export that returns `<main />`. No import points at a deleted file. | `chore(scaffold): remove Vite demo files` |
| E1-T04 | Set page title and description | `index.html` | Title is "Developer Profile Card". Meta description added. `<div id="root">`, favicon, charset, viewport and `lang="en"` kept. Build passes. | `chore(html): set page title and description` |
| E1-T05 | Commit the JSDoc contract | `src/contracts/developer-card.contract.js` | Exactly the four typedefs from section 2, then `export {};`. No functions, logic or imports. No `<div` or `http://` in comments. | `docs(ex1): add DeveloperCard JSDoc contract` |
| E1-T06 | Add the test script | `package.json` | `"test": "node --test \"src/**/*.test.js\""` added. Other scripts unchanged. No new dependency. Build passes. | `chore(test): add node test script` |
| E1-T07 | Add the `getInitials` helper, test first | `src/utils/getInitials.js`, `src/utils/getInitials.test.js` | First test run fails because the function is missing. Then all cases pass: `Võ Văn Thiện` gives `VT`, extra spaces are trimmed, one word gives one letter, `đặng văn lâm` gives `ĐL`, empty or non-string input gives `?`. Pure named export. Uses `Array.from`. | `feat(ex1): add getInitials helper with unit tests` |
| E1-T08 | Add the `SkillBadge` component | `src/components/SkillBadge.jsx`, `src/components/SkillBadge.module.css` | Named export. ES6 default `tier = 'Core'`. Returns `<li>` with name and tier as plain text. No `key` on the `<li>`. JSDoc points at `SkillBadgeProps`. CSS Module is minimal: one real declaration per class. Checks C1 to C4 print nothing. | `feat(ex1): add SkillBadge component` |
| E1-T09 | Add the semantic `DeveloperCard` structure | `src/components/DeveloperCard.jsx`, `src/components/DeveloperCard.module.css` | `article` with `aria-labelledby` from `useId()`, `header`, `hgroup` with `h2` and `p`, `img` with `width="64"` and `height="64"`, `dl` built with `Object.entries` and `<Fragment key={k}>`, `ul` of `SkillBadge` keyed by `skill.id`. Defaults match section 4. JSDoc points at `DeveloperCardProps`. No initials logic yet. CSS Module is minimal. C1 to C4 print nothing. | `feat(ex1): implement semantic DeveloperCard and SkillBadge` |
| E1-T10 | Render the card inside `<main>` | `src/App.jsx` | `App` returns `<main>` with exactly one `<h1>` and `<DeveloperCard />` with default props. Named export kept. Build and lint pass. C1 to C3 print nothing. | `feat(ex1): render DeveloperCard inside main landmark` |
| E1-T11 | Show initials when the avatar fails to load | `src/components/DeveloperCard.jsx` (and `.initials` in `DeveloperCard.module.css` if needed) | One `useState`: `failedUrl`. `showInitials` is `failedUrl === avatarUrl`. No `useEffect`, no second state. On `onError` the `img` is replaced by `<span role="img" aria-label={fullName}>` with `getInitials(fullName)`. `width` and `height` kept. Build, lint, test pass. C1 to C4 print nothing. | `feat(ex1): show initials when avatar fails to load` |
| E1-T12 | Add design tokens | `src/styles/tokens.css`, `src/main.jsx` | Colors, spacing, radii, font sizes, system font stack and card max width declared in `:root`. `main.jsx` gains one import line. Text contrast at least 4.5:1 and UI contrast at least 3:1, computed in the session. No CDN or web font. Build and lint pass. | `style(ex1): add design tokens` |
| E1-T13 | Add the box-sizing reset | `src/styles/reset.css`, `src/main.jsx` | `border-box` on all elements. Margins and list styles reset. `img` is `display: block` with `max-width: 100%`. Body uses tokens only. `main.jsx` gains one import line. C4 prints nothing. | `style(ex1): add box-sizing reset` |
| E1-T14 | Add the main landmark layout | `src/styles/layout.css`, `src/main.jsx` | Mobile-first styles for `main` and `h1` using tokens only. No component class selectors. `main.jsx` gains one import line. C4 prints nothing. | `style(ex1): add main landmark layout` |
| E1-T15 | Style the SkillBadge pills | `src/components/SkillBadge.module.css` | Pill style with tokens only. Long names wrap (`overflow-wrap`). `SkillBadge.jsx` untouched. C4 prints nothing. | `style(ex1): style SkillBadge tier badges` |
| E1-T16 | Add the responsive 375px CSS module | `src/components/DeveloperCard.module.css` | Mobile-first. Avatar and initials are `4rem` square. `overflow-wrap` on long text, no `white-space: nowrap`. Metrics in a grid, skills in a wrapping flex row. Tokens only. No `.jsx` change. Build, lint, test pass. C1 to C4 print nothing. User confirms no horizontal scroll at 375px and 320px. | `style(ex1): add responsive 375px CSS module` |
| E1-T17 | Run Lighthouse and fix findings (conditional) | Files named by the finding | The author runs Lighthouse on `npm run preview` (port 4173) and pastes the finding text. One fix per finding, no extra refactor. Build, lint, test and C1 to C4 pass. No commit if there is no finding. | `fix(a11y): <finding>` |
| E1-T18 | Document usage and checks | `README.md` | English README: commands and ports, `src` layout, constraints, the four text checks (PowerShell and Git Bash), known limits. No score or number that was not produced in the session. Build passes. | `docs(readme): document ex1 usage and checks` |
| E1-T19 | Replace placeholder metrics with measured values | `src/components/DeveloperCard.jsx` | Only the default `metrics` value changes. `commits` is `git rev-list --count HEAD` plus 1, and `a11yScore` is the Lighthouse score, both supplied by the author. `vdomNodes` stays `0`. Build, lint, test pass. C1 to C4 print nothing. | `feat(ex1): replace placeholder metrics with measured values` |
| E1-T20 | Final audit | No file changes | `npm run build`, `npm run lint`, `npm test` pass. `git status` is clean. `git log --oneline` matches this table one to one. C1 to C4 print nothing. | No commit |

### 6. Verification gate

Run before every commit, from the repo root. If any item fails, do not commit; report the failure.

1. `npm run build`
2. `npm run lint`
3. `npm test` (from E1-T06, once test files exist)
4. Four text checks. Each must print nothing.
   - **C1, no div in the components:** `<div` in `src/components/DeveloperCard.jsx` and `src/components/SkillBadge.jsx`.
   - **C2, no insecure URL:** `http://` in `src/**/*.{jsx,js,css}`.
   - **C3, no legacy API:** `React.Component`, `ReactDOM.render`, `defaultProps`, `import * as React`, `keyCode`, `alert(`, `dangerouslySetInnerHTML`, `innerHTML`, `style={{`, `key={i}`, `key={idx}`, `key={index}` in `src/**/*.{jsx,js}`.
   - **C4, no hard-coded color outside `tokens.css`:** hex colors, `rgb(`, `rgba(`, `hsl(`, `hsla(` in `src/**/*.css` except `tokens.css`.
5. `git show --stat HEAD` after the commit. It must list only the files named in the task.

PowerShell versions, run from `lab3-react19\`:

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

Git Bash equivalent of C1 and C2 (the literal slide 13 check):

```sh
grep -n '<div' src/components/DeveloperCard.jsx
grep -n 'http://' src/components/DeveloperCard.jsx
```

**Author's browser checks.** These are done by the author, not by the AI. The AI never reports a result for them.

- Serve the app through Vite (`npm run dev` on 5173, `npm run preview` on 4173). Never open it through `file://`.
- Elements panel: the Accessibility tree shows `article` (named by the heading), `h2`, a description list and a list named "Engineered Skills" with four items. The only `div` in the DOM is `#root`.
- Device toolbar at 375px and 320px: `document.documentElement.scrollWidth <= document.documentElement.clientWidth` prints `true`.
- Network panel: block the avatar request and reload. The initials `VT` appear and the layout does not jump.
- React DevTools Profiler: with the avatar blocked, `DeveloperCard` commits twice (mount and one update after `onError`). With the avatar allowed, it commits once.
- Console: no warning or error.
- Lighthouse on the preview build (Accessibility, Best Practices, Performance, including Cumulative Layout Shift), mobile and desktop.

### 7. Working rules

1. One sub-task per prompt. Do not start the next task.
2. Contract before code. This file (E1-T02) and the JSDoc contract (E1-T05) are committed before any component.
3. Do not commit if a check fails. Report the failure instead.
4. Stage files by explicit path. Never `git add .`, `git add -A` or `git commit -a`. Never push.
5. Never write a score, contrast ratio, render count or test result that was not produced in the same session. Mark it "not verified".

## Part 2. Repository layout

Document-only tasks that organise the repository for the whole lab: evidence and prompt logs per assignment in docs/, layout rules, README. No source file changes. The three slide 34 files stay at the root.

### Work breakdown structure

| ID | Task | File | Acceptance criteria | Commit message |
| --- | --- | --- | --- | --- |
| L-T01 | Write this WBS for the layout and Exercise 2 | `TASK_DECOMPOSITION.md` | Part 1 text unchanged except the title, intro and heading levels. Part 2 has 4 rows, Part 3 has 21 rows. Commit lists one file. | `docs(spec): add layout and ex2 task decomposition` |
| L-T02 | Archive Exercise 1 evidence and prompt log | `docs/evidence/EX1_DeveloperCard/*.png`, `docs/prompt_logs/EX1_DeveloperCard.txt` | 9 PNG files copied with their names, 1 log. Originals outside the repo untouched. | `docs(evidence): archive ex1 screenshots and prompt log` |
| L-T03 | Add repository layout rules | `project-rules.md` | New section 14 appended. Sections 1 to 13 unchanged. | `docs(rules): add repository layout rules` |
| L-T04 | Document the layout in the README | `README.md` | Lab-wide title, Repository layout section, Exercise 1 text unchanged except heading levels. | `docs(readme): document lab 3 repository layout` |

## Part 3. Exercise 2: Interactive Scientist & Pioneer Directory

### 3.1 Overview

- **Deliverable:** one React component, `ScientistDirectory` (`src/components/ScientistDirectory.jsx`), rendered as a `<section>` with the heading `<h2>Pioneer Directory</h2>`. Source: slides 18 and 19.
- **Features:**
  - Search by name, case-insensitive.
  - Minimum IQ filter, read with `valueAsNumber`.
  - Sort by `iq-desc` or `age-asc`, with `.toSorted()`.
  - A Delete button on every row, and a Reset button that restores the full list.
  - The result count is shown in `<output role="status" aria-live="polite">`.
- **Goals:**
  - No `useEffect`. Filtered and sorted rows are computed during render.
  - 100% of `input` and `select` elements have a `<label>`, with ids from `useId()`.
  - No horizontal scroll at 375px (and at 320px).

### 3.2 Contract

This block is copied into `src/contracts/scientist-directory.contract.js` in E2-T02. The contract is committed before any component code.

```js
/**
 * @typedef {Object} Pioneer
 * @property {string} id    Stable unique id. Used as the React key.
 * @property {string} name
 * @property {number} age
 * @property {number} iq
 */

/**
 * @typedef {'iq-desc' | 'age-asc'} PioneerSortKey
 */

/**
 * @typedef {Object} PioneerFilter
 * @property {string} query  Matched case-insensitively, after trimming.
 * @property {number} minIq
 * @property {PioneerSortKey} sortBy
 */

/**
 * @typedef {Object} ScientistDirectoryProps
 * @property {readonly Pioneer[]} [initialData]  Defaults to SMART_PEOPLE.
 */

export {};
```

### 3.3 Invariants

1. `ScientistDirectory` is a pure function component. The default is the ES6 parameter default `initialData = SMART_PEOPLE`. No `defaultProps`.
2. Exactly four `useState`: `people`, `query`, `minIq` (default `160`) and `sortBy` (default `'iq-desc'`).
3. `visible = selectVisiblePeople(people, { query, minIq, sortBy })` is computed during render. No `useEffect` in the file. No second list in state.
4. `selectVisiblePeople` is pure, never mutates its input, and uses `.filter` and `.toSorted`.
5. Delete is `setPeople(prev => prev.filter(p => p.id !== id))`. Reset is `setPeople(initialData)`. `SMART_PEOPLE` is frozen.
6. Every `input` and `select` has a `<label htmlFor={id}>`, with the id from `useId()`. The number input is read with `valueAsNumber`, and `NaN` becomes `0`.
7. The count is rendered in `<output role="status" aria-live="polite">`.
8. Rows are keyed by `p.id`. Every `button` has `type="button"`.
9. The file contains none of these strings: `<div`, `style=`, `.sort(`.
10. After a delete, focus moves to the Delete button of the next visible row, else of the previous one, else to the Search input. This happens in the click handler with `flushSync` and refs, not in an effect.

### 3.4 Data

`SMART_PEOPLE`, frozen, in this order:

| `id` | `name` | `age` | `iq` |
| --- | --- | --- | --- |
| `sp-1` | Johann Goethe | 82 | 210 |
| `sp-2` | Albert Einstein | 76 | 205 |
| `sp-3` | Leonardo da Vinci | 67 | 180 |
| `sp-4` | Isaac Newton | 84 | 190 |
| `sp-5` | James Maxwell | 48 | 190 |
| `sp-6` | William Sidis | 46 | 200 |

**Expected results** of `selectVisiblePeople(SMART_PEOPLE, filter)`. Fields not listed keep their defaults (`query: ''`, `minIq: 160`, `sortBy: 'iq-desc'`).

| Filter | Visible ids, in order |
| --- | --- |
| `minIq: 160`, `sortBy: 'iq-desc'` | `sp-1`, `sp-2`, `sp-6`, `sp-4`, `sp-5`, `sp-3` |
| `minIq: 160`, `sortBy: 'age-asc'` | `sp-6`, `sp-5`, `sp-3`, `sp-2`, `sp-1`, `sp-4` |
| `query: 'EIN'` | `sp-2` |
| `query: '  newton '` | `sp-4` |
| `minIq: 200` | `sp-1`, `sp-2`, `sp-6` |
| `minIq: 211` | empty |

### 3.5 Work breakdown structure

One row is one task, one prompt and (except E2-T16, E2-T18 and E2-T20) one atomic commit. Commit messages are exact.

| ID | Task | File | Acceptance criteria | Commit message |
| --- | --- | --- | --- | --- |
| E2-T01 | Add the Exercise 2 rules for forms, lists and focus | `project-rules.md` | New section 15 appended: form labels, list keys and immutable updates, focus after delete. Sections 1 to 14 unchanged. | `docs(rules): add ex2 form, list and focus rules` |
| E2-T02 | Commit the JSDoc contract | `src/contracts/scientist-directory.contract.js` | Exactly the four typedefs from section 3.2, then `export {};`. No functions, logic or imports. No `<div` in comments. | `docs(ex2): add ScientistDirectory JSDoc contract` |
| E2-T03 | Add the sample data with stable ids, test first | `src/data/smartPeople.js`, `src/data/smartPeople.test.js` | First test run fails because the module is missing. Named export `SMART_PEOPLE` with the six rows of section 3.4, in that order. The array and every entry are frozen with `Object.freeze`. Each entry has exactly `id`, `name`, `age`, `iq`. Tests check six entries, unique `sp-N` ids, positive integer `age` and `iq`, and frozen array and entries. Build, lint and test pass. | `feat(ex2): normalize smartPeople schema with stable IDs` |
| E2-T04 | Add the `selectVisiblePeople` helper, test first | `src/utils/selectVisiblePeople.js`, `src/utils/selectVisiblePeople.test.js` | First test run fails because the function is missing. Then every row of the Expected results table passes, and a test proves the frozen input is not mutated. Pure named export. Uses `.filter` and `.toSorted`, no `.sort(`. | `feat(ex2): add selectVisiblePeople helper with unit tests` |
| E2-T05 | Render the directory list | `src/components/ScientistDirectory.jsx`, `src/components/ScientistDirectory.module.css` | Named export. ES6 default `initialData = SMART_PEOPLE`. `<section>` with `<h2>Pioneer Directory</h2>` and a `<ul>` of `<li key={p.id}>` showing name, age and IQ. One `useState`: `people`. JSDoc points at `ScientistDirectoryProps`. CSS Module is minimal. C1 to C5 print nothing. | `feat(ex2): render ScientistDirectory list with stable keys` |
| E2-T06 | Retitle the page for the whole lab | `index.html`, `src/App.jsx` | `<title>` and the only `<h1>` read "Lab 3: React 19 Exercises". In `App.jsx` only the `<h1>` text changes. Meta description covers both exercises. `<div id="root">`, favicon, charset, viewport and `lang="en"` kept. Build passes. | `chore(page): retitle page for lab 3 exercises` |
| E2-T07 | Render the directory inside `<main>` | `src/App.jsx` | `App` returns `<main>` with exactly one `<h1>`, then `<DeveloperCard />` and `<ScientistDirectory />` with default props. Named export kept. Build and lint pass. C1 to C3 print nothing. | `feat(ex2): render ScientistDirectory inside main landmark` |
| E2-T08 | Add search, minimum IQ filter and sort | `src/components/ScientistDirectory.jsx` | `query`, `minIq` (`160`) and `sortBy` (`'iq-desc'`) states added. Search `input`, number `input` and `select` each have a `<label htmlFor>` with an id from `useId()`. Number input uses `valueAsNumber`, `NaN` becomes `0`. Rows come from `selectVisiblePeople` during render. No `useEffect`, no second list in state. Build, lint, test pass. C1 to C5 print nothing. | `feat(ex2): add search, IQ filter & toSorted` |
| E2-T09 | Add Delete, Reset and the live count | `src/components/ScientistDirectory.jsx` | Each row has a Delete `<button type="button">` whose accessible name includes the person's name. Delete uses `prev.filter`. A Reset `<button type="button">` calls `setPeople(initialData)`. The visible count is in `<output role="status" aria-live="polite">`. Exactly four `useState`. Build, lint, test pass. C1 to C5 print nothing. | `feat(ex2): add delete/reset & live status` |
| E2-T10 | Add the `pickNextFocusId` helper, test first | `src/utils/pickNextFocusId.js`, `src/utils/pickNextFocusId.test.js` | First test run fails because the function is missing. Then all cases pass: given the visible ids and the deleted id it returns the next id, else the previous id, else `null`; an unknown id returns `null`. Pure named export. Input not mutated. | `feat(ex2): add pickNextFocusId helper with unit tests` |
| E2-T11 | Move focus after a delete | `src/components/ScientistDirectory.jsx` | In the Delete click handler: compute the target with `pickNextFocusId`, update state inside `flushSync`, then focus the target row's Delete button through a ref map, or the Search input through its ref when the result is `null`. No `useEffect`. Exactly four `useState`. Build, lint, test pass. C1 to C5 print nothing. | `feat(a11y): move focus to next row after delete` |
| E2-T12 | Add form control tokens | `src/styles/tokens.css` | Tokens for control border, background, text and focus ring color, control padding and minimum target size added to `:root`. Existing tokens unchanged. Text contrast at least 4.5:1, borders and focus ring at least 3:1, computed in the session. Build passes. | `style(ex2): add form control tokens` |
| E2-T13 | Add a global focus-visible outline | `src/styles/reset.css` | One `:focus-visible` rule using the focus ring tokens. No component class selectors. C4 prints nothing. | `style(a11y): add global focus-visible outline` |
| E2-T14 | Style the search form controls | `src/components/ScientistDirectory.module.css` | Labels, inputs, select and buttons styled with tokens only. Targets at least 24 by 24 CSS pixels. `ScientistDirectory.jsx` untouched. C4 prints nothing. | `style(ex2): style search form controls` |
| E2-T15 | Add the responsive 375px directory layout | `src/components/ScientistDirectory.module.css` | Mobile-first. Controls stack at 375px, `min-width` media query only if needed. `overflow-wrap` on names, no `white-space: nowrap`. Tokens only. No `.jsx` change. Build, lint, test pass. C1 to C5 print nothing. User confirms no horizontal scroll at 375px and 320px. | `style(ex2): add responsive 375px directory layout` |
| E2-T16 | Run Lighthouse and fix findings (conditional) | Files named by the finding | The author runs Lighthouse on `npm run preview` (port 4173) and pastes the finding text. One fix per finding, no extra refactor. Build, lint, test and C1 to C5 pass. No commit if there is no finding. | `fix(a11y): <finding>` |
| E2-T17 | Document Exercise 2 usage and checks | `README.md` | Exercise 2 section: features, `src` files, constraints, check C5 (PowerShell), known limits. Exercise 1 and layout sections unchanged. No score or number that was not produced in the session. Build passes. | `docs(readme): document ex2 usage and checks` |
| E2-T18 | Record AI failures (conditional) | `AI_FAILURE_AUDIT.md` | Only defects that really happened in this repo, each with Prompt, AI Code, Bug, DevTools Proof, Engineering Fix and commit hash. No commit if no real AI failure was logged. | `docs(audit): record ex2 ai failures` |
| E2-T19 | Sync the commits metric with git history | `src/components/DeveloperCard.jsx` | Only `metrics.commits` changes, to `git rev-list --count HEAD` plus 2 (this commit and the E2-T21 evidence commit that follows), supplied by the author. After E2-T21, `git rev-list --count HEAD` equals the card value. Build, lint, test pass. C1 to C4 print nothing. | `fix(ex1): sync commits metric with git history` |
| E2-T20 | Final audit | No file changes | `npm run build`, `npm run lint`, `npm test` pass. `git status` is clean. `git log --oneline` matches the WBS tables of Parts 1 to 3 one to one. C1 to C5 print nothing. | No commit |
| E2-T21 | Archive Exercise 2 evidence and prompt log | `docs/evidence/EX2_ScientistDirectory/*.png`, `docs/prompt_logs/EX2_ScientistDirectory.txt` | Screenshots copied with their names, 1 log. Originals outside the repo untouched. No source file changes. | `docs(evidence): archive ex2 screenshots and prompt log` |

### 3.6 Verification gate

Run before every commit, from the repo root. If any item fails, do not commit; report the failure.

1. `npm run build`
2. `npm run lint`
3. `npm test`
4. Five text checks. Each must print nothing.
   - **C1, no div in the components:** `<div` in every file of `src/components/*.jsx`.
   - **C2, no insecure URL:** as in Exercise 1.
   - **C3, no legacy API:** as in Exercise 1.
   - **C4, no hard-coded color outside `tokens.css`:** as in Exercise 1.
   - **C5, no effect and no in-place sort:** `useEffect` in `src/components/ScientistDirectory.jsx`, `src/utils/selectVisiblePeople.js` and `src/utils/pickNextFocusId.js`; `.sort(` anywhere in `src/**/*.{jsx,js}`.
5. `git show --stat HEAD` after the commit. It must list only the files named in the task.

PowerShell versions of the new or changed checks, run from `lab3-react19\`. C2 to C4 use the Exercise 1 commands.

```powershell
# C1
Get-ChildItem src\components -Filter *.jsx | Select-String -Pattern '<div'
# C5
Select-String -Path src\components\ScientistDirectory.jsx, src\utils\selectVisiblePeople.js, src\utils\pickNextFocusId.js -Pattern 'useEffect' -ErrorAction SilentlyContinue
Get-ChildItem src -Recurse -Include *.jsx,*.js | Select-String -Pattern '\.sort\('
```

**Author's browser checks.** These are done by the author, not by the AI. The AI never reports a result for them.

- React DevTools Profiler: typing one character in the Search input gives exactly one commit.
- Delete Johann Goethe: only that `<li>` disappears from the Elements panel, and focus moves to the Delete button of the next visible row.
- Accessibility pane: every `input` and `select` has a name that comes from its label.
- Device toolbar at 375px and 320px: no horizontal scroll.
- Console: no warning or error.
- Lighthouse on the preview build (`npm run preview`, port 4173), mobile and desktop.
