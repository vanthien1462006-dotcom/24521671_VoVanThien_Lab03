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

## Part 4. Exercise 3: KRAFTON PUBG VN Live Match Telemetry

### 4.1 Overview
`PubgMatchTelemetry` (src/components/PubgMatchTelemetry.jsx) shows live PVS telemetry for three Vietnamese squads (CES, TE, GE). A selector inside the component switches squads. A four-state machine (IDLE, LOADING, SUCCESS, ERROR) drives the view. Each squad switch or retry starts a real fetch of a local JSON file with an AbortController; the previous request is aborted in the effect cleanup. 35% simulated packet loss leads to an accessible error alert with a Reconnect Satellite button. Source: slides 20 to 23.

### 4.2 Contract
```js
/**
 * @typedef {Object} PubgSquad
 * @property {string} id        Stable id: 'ces', 'te' or 'ge'. React key and payload file name.
 * @property {string} name
 * @property {string} map
 * @property {string} phase
 * @property {number} alive
 * @property {number} kills
 * @property {string} wwcdProb  Display string from the slide, for example '68%'.
 * @property {string} status
 */

/**
 * @typedef {'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'} TelemetryStatus
 */

/**
 * @typedef {Object} TelemetryView
 * @property {TelemetryStatus} status
 * @property {PubgSquad | null} data  Not null only when status is 'SUCCESS'.
 * @property {string | null} error    Not null only when status is 'ERROR'.
 */

/**
 * @typedef {Object} FetchTelemetryOptions
 * @property {AbortSignal} [signal]
 * @property {typeof fetch} [fetchImpl]  Defaults to the global fetch. Injected in tests.
 * @property {() => number} [random]     Defaults to Math.random. Injected in tests.
 */

/**
 * @typedef {Object} PubgMatchTelemetryProps
 * @property {string} [initialSquadId]  Defaults to 'te'. An unknown id falls back to 'te'.
 */

export {};
```

### 4.3 Invariants
1. The component is one `<section aria-labelledby>` with `<h2>KRAFTON PUBG VN Live Telemetry</h2>`. The squad name is an `<h3>` inside the success `<article>`.
2. The view is always one of four shapes: `IDLE {data: null, error: null}`, `LOADING {null, null}`, `SUCCESS {data, null}`, `ERROR {null, message}`. Built only through `src/utils/telemetryView.js`. No `isLoading` / `isError` booleans.
3. State: `squadId`, `view` and (from E3-T12) `retryTick`. Nothing derived is stored.
4. Exactly one `useEffect`. It creates a new `AbortController`, sets `LOADING`, calls `fetchKraftonPubgTelemetry(squadId, { signal })` and returns `() => controller.abort()`. Dependencies are exactly `[squadId]` in E3-T09 and `[squadId, retryTick]` from E3-T12.
5. A rejection whose `name` is `'AbortError'` never changes the view.
6. The payload URL is built only from a whitelisted id: `/telemetry/${id}.json`. An unknown id rejects before any request.
7. Packet loss: after a successful HTTP response, `random() < 0.35` rejects with an `Error`. Exactly `0.35` passes. A non-OK HTTP status rejects. The payload must match the requested id.
8. IDLE, LOADING, SUCCESS and ERROR are drawn in a panel with the same minimum block size, `--telemetry-panel-min-height: 220px`, so switching states shifts nothing (CLS 0.00).
9. Error UI: `<section role="alert">` with "Blue-Zone Link Lost: {message}" and a `<button type="button">Reconnect Satellite</button>` that runs `setRetryTick((t) => t + 1)`, then moves focus to the selected squad button.
10. Squad buttons: `<button type="button" aria-pressed>`, keys are squad ids, label shows the full name. Clicking the selected squad starts nothing new.
11. The skeleton pulse stops under `prefers-reduced-motion: reduce`.
12. No `window.alert`, no `setInterval`, `fetch(` only in the fetch helper.

### 4.4 Data
| id | name | map | phase | alive | kills | wwcdProb | status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ces` | Cerberus Esports | Erangel | Phase 6 | 4 | 14 | `'68%'` | In Safe Zone |
| `te` | The Expendables | Miramar | Phase 7 | 4 | 18 | `'82%'` | Holding High Ground |
| `ge` | Genius Esports | Taego | Phase 5 | 3 | 9 | `'41%'` | Rotating Blue Zone |

`src/data/pubgVnSquads.js` exports them frozen as `PUBG_VN_SQUADS` (selector order). Each `public/telemetry/<id>.json` holds exactly the matching object. A test proves the two never drift.

### 4.5 Expected results of fetchKraftonPubgTelemetry
| Input | Expected |
| --- | --- |
| `'te'`, `random = () => 0.9`, fake fetch returns the `te` payload | Resolves to the `te` object; fake fetch was called once with `/telemetry/te.json` and the same `signal` |
| `'ces'`, `random = () => 0.1` | Rejects with an `Error` whose message mentions packet loss; `name` is not `'AbortError'` |
| `random = () => 0.35` | Resolves (boundary passes) |
| `'xyz'` | Rejects; fake fetch was **not** called |
| fake fetch returns status 503 | Rejects with an `Error` mentioning 503 |
| payload id differs from the requested id | Rejects |
| signal already aborted (fake fetch honours the signal) | Rejects with `name === 'AbortError'` |

### 4.6 Work breakdown structure
| ID | Task | File | Acceptance criteria | Commit message |
| --- | --- | --- | --- | --- |
| E3-T01 | Write this WBS for Exercise 3 | `TASK_DECOMPOSITION.md` | Part 4 appended. Parts 1 to 3 unchanged. 22 rows. Commit lists one file. | `docs(spec): add ex3 task decomposition` |
| E3-T02 | Enable the exhaustive-deps lint rule | `.oxlintrc.json` | `"react/exhaustive-deps": "error"` added to `rules`. Nothing else changes. `npm run lint` passes on the current code. | `chore(lint): enable exhaustive-deps rule` |
| E3-T03 | Add the Exercise 3 rules | `project-rules.md` | New section 16 appended. Sections 1 to 15 unchanged. | `docs(rules): add ex3 async, abort and retry rules` |
| E3-T04 | Add the JSDoc contract | `src/contracts/pubg-match-telemetry.contract.js` | Exactly the five typedefs of section 4.2 and `export {};`. No function, no logic. Build and lint pass. | `docs(ex3): add PubgMatchTelemetry JSDoc contract` |
| E3-T05 | Add the squad data, test first | `src/data/pubgVnSquads.js`, `src/data/pubgVnSquads.test.js` | First test run fails because the module is missing. Named export `PUBG_VN_SQUADS` with the three rows of section 4.4, in that order, values unchanged. Array and entries frozen. Tests check count, unique ids, field types and frozen state. Build, lint and test pass. | `feat(ex3): add PUBG VN squad data with stable IDs` |
| E3-T06 | Add the static payloads, test first | `public/telemetry/ces.json`, `public/telemetry/te.json`, `public/telemetry/ge.json`, `src/data/telemetryPayloads.test.js` | First test run fails because the files are missing. Each JSON file holds exactly the matching `PUBG_VN_SQUADS` entry. The test reads the three files with `node:fs` and deep-equals them to the data. Build, lint and test pass. | `feat(ex3): add static squad telemetry payloads` |
| E3-T07 | Add the view state helpers, test first | `src/utils/telemetryView.js`, `src/utils/telemetryView.test.js` | First test run fails because the module is missing. Named exports `IDLE_VIEW`, `loadingView()`, `successView(data)`, `errorView(message)`. Every result is frozen and has exactly `status`, `data`, `error` with the shapes of invariant 2. Tests cover all four. Build, lint and test pass. | `feat(ex3): add telemetry view state helpers with unit tests` |
| E3-T08 | Add the abortable fetch helper, test first | `src/utils/fetchKraftonPubgTelemetry.js`, `src/utils/fetchKraftonPubgTelemetry.test.js` | First test run fails because the module is missing. Named exports `PACKET_LOSS_RATE` (0.35), `isKnownSquadId(id)` and `fetchKraftonPubgTelemetry(squadId, options)`. Every row of section 4.5 passes, using an injected fake fetch and random. No real network in tests. Build, lint and test pass. | `feat(ex3): add abortable telemetry fetch with packet loss` |
| E3-T09 | Implement the 4-state telemetry with AbortController | `src/components/PubgMatchTelemetry.jsx`, `src/components/PubgMatchTelemetry.module.css` | Named export, `initialSquadId = 'te'` with fallback. Section with h2, squad buttons (type button, aria-pressed, key id), state `squadId` and `view`. One `useEffect` with deps `[squadId]`: new AbortController, `loadingView()`, fetch with signal, `successView` or `errorView`, AbortError guard, cleanup abort. SUCCESS renders `<article aria-live="polite">` with h3 and a `dl` from `Object.entries` with Fragment keys. ERROR renders a paragraph with the message. CSS Module minimal. Build, lint, test pass. C1 to C7 as expected. | `feat(ex3): implement PUBG VN 4-state telemetry & AbortController` |
| E3-T10 | Render the telemetry inside `<main>` | `src/App.jsx` | `<PubgMatchTelemetry />` added after `<ScientistDirectory />` with default props. Nothing else changes. Build and lint pass. | `feat(ex3): render PubgMatchTelemetry inside main landmark` |
| E3-T11 | Describe Exercise 3 in the page metadata | `index.html` | Only the meta description changes and now names all three exercises. Title unchanged. Build passes. | `chore(page): describe exercise 3 in page metadata` |
| E3-T12 | Add the skeleton UI and the retry alert | `src/components/PubgMatchTelemetry.jsx`, `src/components/PubgMatchTelemetry.module.css` | IDLE renders the panel with "Radar idle.". LOADING renders `<section aria-busy="true">` "Syncing KRAFTON Radar...". ERROR renders `<section role="alert">` with "Blue-Zone Link Lost: {message}" and a `<button type="button">Reconnect Satellite</button>` that runs `setRetryTick((t) => t + 1)`. State `retryTick` added; deps exactly `[squadId, retryTick]`. Minimal CSS only. Build, lint, test pass. C1 to C7 as expected. | `feat(ex3): add skeleton UI & retry alert` |
| E3-T13 | Return focus after retry | `src/components/PubgMatchTelemetry.jsx` | The Reconnect handler increments `retryTick` and moves focus to the selected squad button through a ref. No `useEffect` added. Exactly one `useEffect` remains. Build, lint, test pass. | `feat(a11y): return focus to selected squad after retry` |
| E3-T14 | Add the telemetry panel tokens | `src/styles/tokens.css` | Only additions in `:root`: `--telemetry-panel-min-height: 220px`, skeleton colors that reuse existing color tokens, pulse duration. Existing tokens unchanged. Build passes. C4 prints nothing. | `style(ex3): add telemetry panel tokens` |
| E3-T15 | Add the blue-zone skeleton pulse | `src/components/PubgMatchTelemetry.module.css` | Skeleton uses the tokens, has the panel min height and a pulse animation that is disabled under `prefers-reduced-motion: reduce`. JSX untouched. C4 prints nothing. | `style(ex3): add blue-zone skeleton pulse` |
| E3-T16 | Add the responsive 375px layout | `src/components/PubgMatchTelemetry.module.css` | Mobile first. Section styled like the other cards. All four state panels share the min height. Squad buttons wrap, targets at least 24px (44px used). Tokens only, no nowrap. JSX untouched. User confirms no horizontal scroll at 375px and 320px. | `style(ex3): add responsive 375px telemetry layout` |
| E3-T17 | Fix Lighthouse findings (conditional) | Files named by the finding | Only if Lighthouse reports an Accessibility finding. One fix, no refactor. No commit if there is no finding. | `fix(a11y): <finding>` |
| E3-T18 | Document Exercise 3 in the README | `README.md` | New "Exercise 3" section after Exercise 2: features, source layout, constraints, C6/C7 commands, Known limits (D7 prop name, StrictMode cancel on load, aria-live note, randomness). Earlier sections unchanged. No scores or measured numbers. | `docs(readme): document ex3 usage and checks` |
| E3-T19 | Record AI failures (conditional) | `AI_FAILURE_AUDIT.md` | Only real Exercise 3 defects pasted by the user are appended after the existing entry, numbered from #02. Each has Prompt, AI Code, Bug, DevTools Proof, Engineering Fix with commit hash. No commit if none was logged. | `docs(audit): record ex3 ai failures` |
| E3-T20 | Sync the commits metric again | `src/components/DeveloperCard.jsx` | Only `metrics.commits` changes, to `git rev-list --count HEAD` plus 2 (this commit and the E3-T22 evidence commit), supplied by the author. Build, lint, test pass. | `fix(ex1): sync commits metric after ex3` |
| E3-T21 | Final audit | No file changes | build, lint, test, C1 to C7 pass; `git log` matches Parts 1 to 4 row by row. No commit. | (no commit) |
| E3-T22 | Archive Exercise 3 evidence | `docs/evidence/EX3_PubgMatchTelemetry/*.png`, `docs/prompt_logs/EX3_PubgMatchTelemetry.txt` | Screenshots and the prompt log copied from the author's folders, names unchanged. After the commit `git rev-list --count HEAD` equals the card value. | `docs(evidence): archive ex3 screenshots and prompt log` |

### 4.7 Verification gate
Before every commit: npm run build, npm run lint, npm test (when tests exist), C1 to C6 print nothing, C7 prints its three lines from E3-T09 on. Browser checks are done by the user with Network throttling Slow 3G.

## Part 5. Homework 1: Production Studio Drum Kit (+ app shell)

### 5.1 Overview
`DrumMachine` (src/homeworks/DrumMachine/) is a seven-pad drum kit played with the physical keys W, A, S, D, J, K, L (read through `e.code`, safe with the Vietnamese UniKey IME) or with the pointer. Sounds are synthesized with the Web Audio API. A hit log in an `aria-live` output and a visual decibel meter serve deaf and hard-of-hearing users. The task also adds an app shell: a hash-driven nav that shows either the exercises or one homework. Source: slide 26.

### 5.2 Contract
```js
/**
 * @typedef {'kick' | 'snare' | 'hihat-closed' | 'hihat-open' | 'clap' | 'tom-high' | 'tom-low'} DrumPadId
 */

/**
 * @typedef {Object} ToneRecipe
 * @property {'tone'} kind
 * @property {OscillatorType} wave
 * @property {number} startHz
 * @property {number} endHz
 * @property {number} durationMs
 * @property {number} gain      Peak gain, 0 to 1.
 */

/**
 * @typedef {Object} NoiseRecipe
 * @property {'noise'} kind
 * @property {BiquadFilterType} filter
 * @property {number} filterHz
 * @property {number} durationMs
 * @property {number} gain      Peak gain, 0 to 1.
 */

/**
 * @typedef {ToneRecipe | NoiseRecipe} DrumRecipe
 */

/**
 * @typedef {Object} DrumPad
 * @property {DrumPadId} id
 * @property {string} label     Visible name, for example 'Kick'.
 * @property {string} code      KeyboardEvent.code, for example 'KeyW'.
 * @property {string} keyLabel  Letter shown on the pad and in aria-keyshortcuts, for example 'W'.
 * @property {DrumRecipe} recipe
 */

/**
 * @typedef {Object} DrumHit
 * @property {string} id        crypto.randomUUID()
 * @property {DrumPadId} padId
 * @property {string} label
 * @property {string} keyLabel
 */

/**
 * @typedef {Object} DrumSynth
 * @property {(recipe: DrumRecipe) => void} play   Creates the AudioContext on first use.
 * @property {() => AnalyserNode | null} getAnalyser
 * @property {() => void} close                     Closes the context; a later play creates a new one.
 */

/**
 * @typedef {Object} KeyGuardEvent
 * @property {string} code
 * @property {boolean} repeat
 * @property {boolean} ctrlKey
 * @property {boolean} altKey
 * @property {boolean} metaKey
 * @property {{ tagName?: string, isContentEditable?: boolean } | null} target
 */

export {};
```

### 5.3 Invariants
1. DrumMachine is one `<section aria-labelledby>` with `<h2>HW1 Production Studio Drum Kit</h2>`, rendered only in the `hw1` view.
2. Seven pads come from `DRUM_PADS` only. Each is `<button type="button" aria-pressed aria-keyshortcuts>` showing its label and key letter; the React key is the pad id.
3. Shortcuts read `e.code` through `PAD_BY_CODE`. No `keyCode`, `which` or `charCode`; letters are never read from `e.key`.
4. `shouldHandleKey` rejects repeats, Ctrl/Alt/Meta combinations, targets that are input, textarea, select or contenteditable, and everything when shortcuts are off.
5. `useDrumKeyboard(padMap, onTriggerPad, isEnabled = true, onReleasePad)` adds keydown, keyup and blur listeners on window in one effect and removes all three in its cleanup. When disabled it adds none. `preventDefault` only for mapped keys.
6. The AudioContext is created lazily on the first play, resumed when suspended, closed when DrumMachine unmounts, and created only inside drumSynth.js.
7. Every sound ramps its gain to 0.0001 with `exponentialRampToValueAtTime` before its source stops.
8. Pad active state is a Set of pad ids: added on keydown or pointerdown, removed on keyup, pointerup, pointerleave, pointercancel and window blur.
9. Hit log: one `<output role="status" aria-live="polite">` (rule 4) with the last hit and the total; an `<ol>` with the last 8 hits, newest first, keyed by hit id. Updates are immutable.
10. Level meter: `<meter min="-60" max="0">` with a visible label and a dBFS text value. Its requestAnimationFrame loop lives only in LevelMeter and is cancelled in cleanup.
11. A labelled text input (Session name) and a labelled checkbox (Keyboard shortcuts, on by default). Typing in the input never plays a pad. Shortcuts can be turned off (WCAG 2.2 SC 2.1.4).
12. Shell: the view comes from the URL hash through `useSyncExternalStore`; unknown hashes show the exercises; the current nav link has `aria-current="page"`.

### 5.4 Drum pads
| Order | id | label | code | keyLabel | recipe |
| --- | --- | --- | --- | --- | --- |
| 1 | kick | Kick | KeyW | W | tone, sine, 150 → 45 Hz, 400 ms, gain 0.9 |
| 2 | snare | Snare | KeyA | A | noise, highpass 1500 Hz, 200 ms, gain 0.6 |
| 3 | hihat-closed | Closed Hi-Hat | KeyS | S | noise, highpass 7000 Hz, 60 ms, gain 0.35 |
| 4 | hihat-open | Open Hi-Hat | KeyD | D | noise, highpass 7000 Hz, 350 ms, gain 0.3 |
| 5 | clap | Clap | KeyJ | J | noise, bandpass 1200 Hz, 150 ms, gain 0.6 |
| 6 | tom-high | High Tom | KeyK | K | tone, sine, 220 → 160 Hz, 300 ms, gain 0.7 |
| 7 | tom-low | Low Tom | KeyL | L | tone, sine, 140 → 90 Hz, 350 ms, gain 0.7 |

### 5.5 Expected results of shouldHandleKey(event, isEnabled)
Base event: `{ code: 'KeyW', repeat: false, ctrlKey: false, altKey: false, metaKey: false, target: { tagName: 'BUTTON' } }`.
| Change from base | isEnabled | Expected |
| --- | --- | --- |
| none | true | true |
| none | false | false |
| repeat: true | true | false |
| ctrlKey: true | true | false |
| altKey: true | true | false |
| metaKey: true | true | false |
| target tagName 'INPUT' | true | false |
| target tagName 'TEXTAREA' | true | false |
| target tagName 'SELECT' | true | false |
| target { tagName: 'P', isContentEditable: true } | true | false |
| target null | true | true |

### 5.6 Expected results of toDecibels(samples)
`DB_FLOOR` is -60. RMS of the samples, 20·log10, rounded to an integer, clamped to [-60, 0].
| samples | Expected |
| --- | --- |
| [] | -60 |
| [0, 0, 0] | -60 |
| [1, -1] | 0 |
| [0.5, -0.5] | -6 |
| [0.001, -0.001] | -60 |
| [2, -2] | 0 |

### 5.7 Expected results of createDrumSynth({ createContext, random })
Tests use a fake AudioContext that records every call; `connect` returns its argument.
| Case | Expected |
| --- | --- |
| created, nothing played | createContext not called; getAnalyser() is null |
| play(kick recipe) | one context created; master gain → analyser → destination; one oscillator with type 'sine', frequency set to 150 then ramped to 45; start(t) and stop(t + 0.42) where t = currentTime |
| gain envelope of any play | setValueAtTime(peak, t), then exponentialRampToValueAtTime(0.0001, t + durationMs/1000) recorded before stop |
| play(snare recipe) | a buffer source with a buffer of round(sampleRate × 0.2) samples filled from `random`, a 'highpass' biquad at 1500 Hz, start and stop scheduled |
| second play | the same context is reused |
| context state 'suspended' | resume() is called |
| play({ kind: 'unknown' }) | throws TypeError |
| close() then play | the first context's close() called once; a new context is created |

### 5.8 Expected results of resolveView(hash)
| hash | Expected |
| --- | --- |
| '' | 'exercises' |
| '#' | 'exercises' |
| '#exercises' | 'exercises' |
| '#hw1' | 'hw1' |
| 'hw1' | 'hw1' |
| '#HW1' | 'exercises' |
| '#hw9' | 'exercises' |

### 5.9 Work breakdown structure
| ID | Task | File | Acceptance criteria | Commit message |
| --- | --- | --- | --- | --- |
| H1-T01 | Write this WBS for Homework 1 | `TASK_DECOMPOSITION.md` | Part 5 appended. Parts 1 to 4 unchanged. 22 rows. Commit lists one file. | `docs(spec): add hw1 task decomposition` |
| H1-T02 | Add the Homework 1 and app shell rules | `project-rules.md` | New section 17 appended. Sections 1 to 16 unchanged. | `docs(rules): add hw1 keyboard, audio and shell rules` |
| H1-T03 | Add the JSDoc contract | `src/homeworks/DrumMachine/drum-machine.contract.js` | Exactly the code block of section 5.2. No function, no logic. Build and lint pass. | `docs(hw1): add DrumMachine JSDoc contract` |
| H1-T04 | Add the pad data, test first | `src/homeworks/DrumMachine/drumPads.js`, `src/homeworks/DrumMachine/drumPads.test.js` | First test run fails because the module is missing. Named exports `DRUM_PADS` (the seven pads of section 5.4 in order, array, pads and recipes frozen) and `PAD_BY_CODE` (a Map from code to pad built once at module level). Tests check count, unique ids and codes, the exact codes, recipe fields and frozen state. Build, lint, test pass. | `feat(hw1): add drum pad map keyed by e.code` |
| H1-T05 | Add the shortcut guard, test first | `src/homeworks/DrumMachine/shouldHandleKey.js`, `src/homeworks/DrumMachine/shouldHandleKey.test.js` | First test run fails because the module is missing. Named export `shouldHandleKey(event, isEnabled)`. Every row of section 5.5 passes. Pure, no DOM access. Build, lint, test pass. | `feat(hw1): add repeat, modifier and input guard for shortcuts` |
| H1-T06 | Add the decibel helper, test first | `src/homeworks/DrumMachine/levels.js`, `src/homeworks/DrumMachine/levels.test.js` | First test run fails because the module is missing. Named exports `DB_FLOOR` and `toDecibels(samples)`. Every row of section 5.6 passes. Build, lint, test pass. | `feat(hw1): add rms to decibel helper with unit tests` |
| H1-T07 | Add the drum synth, test first | `src/homeworks/DrumMachine/drumSynth.js`, `src/homeworks/DrumMachine/drumSynth.test.js` | First test run fails because the module is missing. Named export `createDrumSynth({ createContext = () => new AudioContext(), random = Math.random } = {})` returning a DrumSynth. Master gain 0.8 into an analyser into the destination. Every row of section 5.7 passes with a fake context. `new AudioContext` appears only as that default. Build, lint, test pass. | `feat(hw1): add web audio drum synth with click-free envelopes` |
| H1-T08 | Add the keyboard hook | `src/homeworks/DrumMachine/useDrumKeyboard.js` | `useDrumKeyboard(padMap, onTriggerPad, isEnabled = true, onReleasePad)` as invariant 5, using shouldHandleKey and `padMap.get(e.code)`. keyup releases the mapped pad; blur releases every pad in padMap. Deps honest. Build and lint pass (only the known warning). | `feat(hw1): add useDrumKeyboard hook with listener cleanup` |
| H1-T09 | Build the pads | `src/homeworks/DrumMachine/DrumMachine.jsx`, `src/homeworks/DrumMachine/DrumMachine.module.css` | Named export DrumMachine. Invariants 1, 2, 3, 6, 8. Synth from `useState(() => createDrumSynth())`, closed in an effect cleanup. Handlers in useCallback. Pointer: pointerdown plays and presses; pointerup, pointerleave, pointercancel release. onClick plays only when `event.detail === 0`. CSS minimal. Build, lint, test pass. | `feat(hw1): build accessible drum pads with keyboard and pointer input` |
| H1-T10 | Add the view resolver, test first | `src/shell/resolveView.js`, `src/shell/resolveView.test.js` | First test run fails because the module is missing. Named exports `VIEWS` (frozen: `{ id: 'exercises', label: 'Exercises 1–3' }`, `{ id: 'hw1', label: 'HW1 Drum Kit' }`) and `resolveView(hash)`. Every row of section 5.8 passes. Build, lint, test pass. | `feat(shell): add hash view resolver with unit tests` |
| H1-T11 | Add the hash navigation | `src/shell/useHashView.js`, `src/shell/SiteHeader.jsx`, `src/shell/SiteHeader.module.css`, `src/App.jsx` | `useHashView()` uses useSyncExternalStore with a hashchange subscription. SiteHeader renders `<header>` with the existing h1 text and `<nav aria-label="Lab sections">` listing VIEWS as links with aria-current="page" on the current one. App renders SiteHeader and `<main>` with DrumMachine for 'hw1' and the three exercises otherwise. Exercises unchanged. Build, lint, test pass. | `feat(shell): add hash navigation between exercises and homeworks` |
| H1-T12 | Add the hit log | `src/homeworks/DrumMachine/DrumMachine.jsx`, `src/homeworks/DrumMachine/DrumMachine.module.css` | Invariant 9. Build, lint, test pass. | `feat(hw1): add accessible hit log for deaf and hard-of-hearing users` |
| H1-T13 | Add the level meter | `src/homeworks/DrumMachine/LevelMeter.jsx`, `src/homeworks/DrumMachine/DrumMachine.jsx`, `src/homeworks/DrumMachine/DrumMachine.module.css` | Invariant 10, using toDecibels and `synth.getAnalyser()`. State updates only when the rounded value changes. Build, lint, test pass. | `feat(hw1): add visual decibel meter driven by an analyser` |
| H1-T14 | Add the session input and shortcut toggle | `src/homeworks/DrumMachine/DrumMachine.jsx`, `src/homeworks/DrumMachine/DrumMachine.module.css` | Invariant 11, labels through useId, the checkbox drives `isEnabled`. Build, lint, test pass. | `feat(hw1): add session name input and shortcut toggle` |
| H1-T15 | Add the drum kit tokens | `src/styles/tokens.css` | Only additions in `:root`, colors only as var() of existing tokens. Build passes. C4 prints nothing. | `style(hw1): add drum kit tokens` |
| H1-T16 | Add the responsive layout | `src/homeworks/DrumMachine/DrumMachine.module.css`, `src/shell/SiteHeader.module.css` | Mobile first, tokens only, no nowrap. Pads at least 44px. Pressed pads differ by more than color. JSX untouched. User confirms no horizontal scroll at 375px and 320px. | `style(hw1): add responsive 375px drum kit and header layout` |
| H1-T17 | Fix Lighthouse findings (conditional) | Files named by the finding | Only if Lighthouse on `#hw1` reports an Accessibility finding. No commit otherwise. | `fix(a11y): <finding>` |
| H1-T18 | Document the shell and Homework 1 | `README.md` | New sections "App shell" and "Homework 1" after Exercise 3. Earlier sections unchanged. Text checks C1', C8a to C8c. Known limits. No scores. | `docs(readme): document app shell and hw1` |
| H1-T19 | Record AI failures (conditional) | `AI_FAILURE_AUDIT.md` | Only real Homework 1 defects supplied by the author, appended after the last entry. No commit if none. | `docs(audit): record hw1 ai failures` |
| H1-T20 | Sync the commits metric | `src/components/DeveloperCard.jsx` | Only `metrics.commits` changes, to the number supplied by the author. Build, lint, test pass. | `fix(ex1): sync commits metric after hw1` |
| H1-T21 | Final audit | No file changes | Checks pass; git log matches Parts 1 to 5. No commit. | (no commit) |
| H1-T22 | Archive Homework 1 evidence | `docs/evidence/HW1_DrumMachine/*.png`, `docs/prompt_logs/HW1_DrumMachine.txt` | Copied from the author's folders, names unchanged. Commit count equals the card value. | `docs(evidence): archive hw1 screenshots and prompt log` |

### 5.10 Verification gate
Before every commit: npm run build, npm run lint (exactly the one known warning), npm test, C1' to C7 and C8a to C8c as described in the guide. Browser and audio checks are done by the user.

## Part 6. Homework 2: Polyphonic 88-Key Piano & FIFO Sequencer

### 6.1 Overview
`GrandPiano88` (src/homeworks/GrandPiano88/) generates an 88-key piano (A0, midi 21, to C8, midi 108) from the formula f = 440 × 2^((midi − 69) / 12). A Web Audio synth plays up to 8 voices and steals the oldest voice first (FIFO, ES6 Map). Each key is a `React.memo` component, so pressing one key re-renders only that key. A recorder stores `{ midi, freqHz, durationMs, deltaMs }` events and replays them at 0.5x, 1x or 2x; Stop Sequence and unmount cancel the replay with an AbortController. Source: slides 27 and 28.

### 6.2 Contract
```js
/**
 * @typedef {Object} PianoKeyData
 * @property {number} midi       21 to 108.
 * @property {string} noteName   Sharp names, for example 'A0', 'C#4'.
 * @property {boolean} isBlack
 * @property {number} freqHz     440 × 2^((midi − 69) / 12).
 */

/**
 * @typedef {Object} KeySlot
 * @property {PianoKeyData} white
 * @property {PianoKeyData | null} black   The black key that follows the white key, if any.
 */

/**
 * @typedef {Object} RecordedNote
 * @property {number} midi
 * @property {number} freqHz
 * @property {number} durationMs  Time the note was held.
 * @property {number} deltaMs     Time since the previous note started (0 for the first).
 */

/**
 * @typedef {Object} ScheduledNote
 * @property {number} midi
 * @property {number} freqHz
 * @property {number} startMs     From the start of the replay, already divided by the speed.
 * @property {number} durationMs  Already divided by the speed.
 */

/**
 * @typedef {0.5 | 1 | 2} ReplaySpeed
 */

/**
 * @typedef {'idle' | 'recording' | 'playing'} PianoMode
 */

/**
 * @typedef {Object} PianoKeyProps
 * @property {number} midi
 * @property {string} noteName
 * @property {boolean} isBlack
 * @property {boolean} isPressed
 * @property {(midi: number) => void} onNoteOn
 * @property {(midi: number) => void} onNoteOff
 */

export {};
```

### 6.3 Invariants
1. GrandPiano88 is one `<section aria-labelledby>` with `<h2>HW2 Polyphonic 88-Key Piano</h2>`, rendered only in the `hw2` view.
2. The 88 keys come only from `buildPianoKeys()`; no note name or frequency is typed by hand outside tests.
3. `PianoKey` is `memo(function PianoKey(...))` with exactly the props of PianoKeyProps. The parent passes stable `onNoteOn` / `onNoteOff` (useCallback) and a boolean `isPressed`, so one press re-renders one key.
4. Each key is `<button type="button" aria-pressed>` with its note name. Pointer: pointerdown on, pointerup / pointerleave / pointercancel off. Keyboard: Enter or Space keydown (not repeat) on, keyup off.
5. `PolyphonicSynth` keeps `voices` as a Map from midi to `{ osc, gain }` in insertion order. At `maxVoices` (8) the oldest key `voices.keys().next().value` is released before the new voice starts. A midi that already sounds is ignored.
6. Every voice starts at gain 0.0001, ramps to 0.2 in 10 ms, and on release ramps with `exponentialRampToValueAtTime(0.0001, t + 0.04)` before `osc.stop(t + 0.05)`.
7. The AudioContext is created lazily on the first noteOn, only as the default factory of PolyphonicSynth, and closed when GrandPiano88 unmounts.
8. One `mode` state: 'idle' | 'recording' | 'playing'. While playing, recording and live play from the computer keyboard are disabled.
9. Replay builds a pure schedule, waits with an abortable delay, and is cancelled by Stop Sequence and on unmount through one AbortController; afterwards all voices are stopped and no key stays pressed. AbortError is a normal outcome.
10. Status messages (voices in use, recording, playing, stopped) go in one `<output role="status" aria-live="polite">`.
11. At 375px the page has no horizontal scroll; the keyboard scrolls inside its own focusable, labelled container.

### 6.4 Expected results of buildPianoKeys() and midiToFrequency(midi)
| Check | Expected |
| --- | --- |
| length | 88 |
| white / black | 52 / 36 |
| first | { midi: 21, noteName: 'A0', isBlack: false, freqHz: 27.5 } |
| midi 22 | noteName 'A#0', isBlack true |
| midi 60 | noteName 'C4', freqHz 261.63 (±0.01) |
| midi 69 | noteName 'A4', freqHz 440 |
| last | { midi: 108, noteName: 'C8', isBlack: false }, freqHz 4186.01 (±0.01) |
| order | midi strictly increasing by 1 |
| frozen | array and every key frozen |

`groupIntoSlots(keys)`: 52 slots; 36 have a black key; slot 0 is { white A0, black A#0 }; slot 1 is { white B0, black null }; the last slot is { white C8, black null }.

### 6.5 Expected results of PolyphonicSynth (fake AudioContext)
| Case | Expected |
| --- | --- |
| constructed | no context created; voices.size 0 |
| noteOn(60, f) | one context; osc → gain → destination; frequency set to f; gain 0.0001 then ramp to 0.2 at t + 0.01; voices has 60 |
| noteOn(60, f) again | ignored, voices.size 1, no new oscillator |
| 9 different noteOn | voices.size 8; the first midi was released (its gain ramp to 0.0001 at t + 0.04 recorded before its stop at t + 0.05); the 9th midi is in voices |
| keys order after stealing | Map order = notes 2 to 9 |
| noteOff(unknown) | no throw, nothing changes |
| stopAll() | every voice released, voices.size 0 |
| close() then noteOn | first context closed once; a new context created |
| context 'suspended' on noteOn | resume() called |

### 6.6 Expected results of the recorder (now injected)
`createTakeRecorder(now)`; times in ms.
| Calls (time) | Expected `stop()` result |
| --- | --- |
| start(0) noteOn(60,f60) at 100, noteOff(60) at 400, noteOn(64,f64) at 600, noteOff(64) at 700, stop | [{ midi: 60, freqHz: f60, durationMs: 300, deltaMs: 0 }, { midi: 64, freqHz: f64, durationMs: 100, deltaMs: 500 }] |
| chord: noteOn 60 at 0, noteOn 64 at 0, noteOff 60 at 200, noteOff 64 at 250 | [{60, 200, 0}, {64, 250, 0}] (start order) |
| note still held at stop (noteOn 60 at 0, stop at 900) | [{60, durationMs 900, deltaMs 0}] |
| noteOff without noteOn | ignored |
| events before start or after stop | ignored |
| result | frozen array of frozen events |

### 6.7 Expected results of buildReplaySchedule(events, speed)
Events: [{60, f60, 300, 0}, {64, f64, 100, 500}, {67, f67, 200, 250}].
| speed | Expected (startMs, durationMs) |
| --- | --- |
| 1 | (0, 300), (500, 100), (750, 200) |
| 2 | (0, 150), (250, 50), (375, 100) |
| 0.5 | (0, 600), (1000, 200), (1500, 400) |
| 3 | throws RangeError |
| [] | [] |

`playSequence(schedule, { onNoteOn, onNoteOff, signal, delay })` with a fake delay: calls in time order; if the signal is aborted during a delay it rejects with an error named 'AbortError' and calls no further onNoteOn. `delay(ms, signal)` (real): resolves after ms; rejects AbortError immediately when already aborted or when aborted later, and clears its timer.

### 6.8 Expected results of computerKeyToMidi(code, octave)
| code | octave | Expected |
| --- | --- | --- |
| KeyA | 4 | 60 |
| KeyW | 4 | 61 |
| KeyJ | 4 | 71 |
| KeyK | 4 | 72 |
| KeyA | 0 | null (12 is below 21) |
| KeyH | 0 | 21 |
| KeyK | 7 | 108 |
| KeyW | 7 | 97 |
| KeyK | 8 | null (120 is above 108) |
| KeyQ | 4 | null |

### 6.9 Work breakdown structure
| ID | Task | File | Acceptance criteria | Commit message |
| --- | --- | --- | --- | --- |
| H2-T01 | Write this WBS for Homework 2 | `TASK_DECOMPOSITION.md` | Part 6 appended. Parts 1 to 5 unchanged. 25 rows. | `docs(spec): add hw2 task decomposition` |
| H2-T02 | Add the Homework 2 rules | `project-rules.md` | New section 18 appended. Sections 1 to 17 unchanged. | `docs(rules): add hw2 polyphony, memo and sequencer rules` |
| H2-T03 | Add the JSDoc contract | `src/homeworks/GrandPiano88/grand-piano.contract.js` | Exactly the code block of section 6.2. Build and lint pass. | `docs(hw2): add GrandPiano88 JSDoc contract` |
| H2-T04 | Generate the keys, test first | `src/homeworks/GrandPiano88/pianoKeys.js`, `src/homeworks/GrandPiano88/pianoKeys.test.js` | First run fails. Exports `FIRST_MIDI` 21, `LAST_MIDI` 108, `midiToFrequency`, `midiToNoteName`, `buildPianoKeys` and frozen `PIANO_KEYS`. Section 6.4 rows pass. | `feat(hw2): generate 88 piano keys from midi 21 to 108` |
| H2-T05 | Group keys into slots, test first | `src/homeworks/GrandPiano88/pianoKeys.js`, `src/homeworks/GrandPiano88/pianoKeys.test.js` | Export `groupIntoSlots(keys)` and frozen `KEY_SLOTS`. Slot rows of section 6.4 pass. | `feat(hw2): group piano keys into 52 white-key slots` |
| H2-T06 | Add the synth voice pool, test first | `src/homeworks/GrandPiano88/PolyphonicSynth.js`, `src/homeworks/GrandPiano88/PolyphonicSynth.test.js` | First run fails. Class as slide 28 plus `{ createContext }` option, attack ramp, `noteOff` and stealing. Rows 1 to 6 and 9 of section 6.5 pass. | `feat(hw2): add 8-voice synth with FIFO voice stealing` |
| H2-T07 | Add release and cleanup, test first | `src/homeworks/GrandPiano88/PolyphonicSynth.js`, `src/homeworks/GrandPiano88/PolyphonicSynth.test.js` | `stopAll()`, `close()`, getter `activeCount`. Rows 7 and 8 pass; release order checked. | `feat(hw2): add click-free note-off envelope and stopAll` |
| H2-T08 | Add the computer key map, test first | `src/homeworks/GrandPiano88/computerKeyMap.js`, `src/homeworks/GrandPiano88/computerKeyMap.test.js` | Frozen `SEMITONE_BY_CODE` (13 codes of decision D4) and `computerKeyToMidi(code, octave)`. Section 6.8 rows pass. | `feat(hw2): add computer keyboard to midi map` |
| H2-T09 | Add the recorder, test first | `src/homeworks/GrandPiano88/recorder.js`, `src/homeworks/GrandPiano88/recorder.test.js` | `createTakeRecorder(now = () => performance.now())` with start, noteOn, noteOff, stop, isRecording. Section 6.6 rows pass. | `feat(hw2): add FIFO take recorder with injected clock` |
| H2-T10 | Add the replay, test first | `src/homeworks/GrandPiano88/replay.js`, `src/homeworks/GrandPiano88/replay.test.js` | `REPLAY_SPEEDS` [0.5, 1, 2], `buildReplaySchedule`, `delay`, `playSequence`. Section 6.7 rows pass; delay tested with node:test mock timers. | `feat(hw2): add speed-scaled replay with abortable delay` |
| H2-T11 | Add the PianoKey component | `src/homeworks/GrandPiano88/PianoKey.jsx`, `src/homeworks/GrandPiano88/GrandPiano88.module.css` | Invariants 3 and 4. Slide 27 markup plus pointerleave, pointercancel and Enter/Space handlers. CSS Module created with only `.key`, `.keyWhite`, `.keyBlack`. | `feat(hw2): add memoized PianoKey component` |
| H2-T12 | Render the piano | `src/homeworks/GrandPiano88/GrandPiano88.jsx`, `src/homeworks/GrandPiano88/GrandPiano88.module.css` | Invariants 1, 2, 5, 7. 52 slot `li` from KEY_SLOTS, synth from useState, closed on unmount, `pressedMidis` Set state. Minimal CSS. | `feat(hw2): render 88-key piano with pointer and keyboard input` |
| H2-T13 | Add the hw2 view | `src/shell/resolveView.js`, `src/shell/resolveView.test.js`, `src/App.jsx` | VIEWS gains `{ id: 'hw2', label: 'HW2 Piano 88' }`; test row '#hw2' → 'hw2'; App renders GrandPiano88 for 'hw2'. | `feat(shell): add hw2 view to navigation` |
| H2-T14 | Keep handlers stable | `src/homeworks/GrandPiano88/GrandPiano88.jsx` | `noteOn` / `noteOff` in useCallback with honest deps; no inline arrow passed to PianoKey; author confirms in the Profiler that one press renders one PianoKey. If T12 already satisfies this, the task changes only what the Profiler shows is needed; if nothing is needed it is skipped with no commit. | `perf(hw2): keep note handlers stable so one key re-renders` |
| H2-T15 | Add the sequencer controls | `src/homeworks/GrandPiano88/GrandPiano88.jsx`, `src/homeworks/GrandPiano88/GrandPiano88.module.css` | Invariants 8 and 9. Record / Stop recording, Play take, Stop Sequence buttons, speed radio group in a fieldset with legend. | `feat(hw2): add record, replay speed and stop sequence controls` |
| H2-T16 | Add the status output | `src/homeworks/GrandPiano88/GrandPiano88.jsx` | Invariant 10, text includes "Voices: n of 8". | `feat(hw2): announce voices and sequence status` |
| H2-T17 | Add the computer keyboard | `src/homeworks/GrandPiano88/GrandPiano88.jsx`, `src/homeworks/GrandPiano88/GrandPiano88.module.css` | One effect with keydown, keyup, blur on window, guard `shouldHandleKey` from DrumMachine, octave select (useId label), shortcuts checkbox; cleanup removes all three. | `feat(hw2): add computer keyboard octave select and toggle` |
| H2-T18 | Add the piano tokens | `src/styles/tokens.css` | Only additions, colors as var() of existing tokens. C4 empty. | `style(hw2): add piano tokens` |
| H2-T19 | Add the responsive layout | `src/homeworks/GrandPiano88/GrandPiano88.module.css` | Invariant 11. Black keys absolutely positioned in their slot. Pressed keys differ by more than color. JSX untouched. | `style(hw2): add responsive piano layout with inner scroll` |
| H2-T20 | Fix Lighthouse findings (conditional) | Files named by the finding | Only if Lighthouse on `#hw2` reports an Accessibility finding. | `fix(a11y): <finding>` |
| H2-T21 | Document Homework 2 | `README.md` | New section after Homework 1. No scores. | `docs(readme): document hw2` |
| H2-T22 | Record AI failures (conditional) | `AI_FAILURE_AUDIT.md` | Only real Homework 2 defects from the author. | `docs(audit): record hw2 ai failures` |
| H2-T23 | Sync the commits metric | `src/components/DeveloperCard.jsx` | Only `metrics.commits`, value from the author. | `fix(ex1): sync commits metric after hw2` |
| H2-T24 | Final audit | No file changes | Checks pass; log matches Parts 1 to 6. | (no commit) |
| H2-T25 | Archive Homework 2 evidence | `docs/evidence/HW2_GrandPiano88/*.png`, `docs/prompt_logs/HW2_GrandPiano88.txt` | Copied with names unchanged. | `docs(evidence): archive hw2 screenshots and prompt log` |
