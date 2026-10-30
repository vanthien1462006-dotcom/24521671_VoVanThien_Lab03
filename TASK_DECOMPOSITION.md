# TASK_DECOMPOSITION.md: Lab 3, Exercise 1

Semantic Engineer & Pro-Gamer Profile Card. Read `Agent.md` and `project-rules.md` before any task.

## 1. Overview

- **Deliverable:** two React components, `DeveloperCard` and `SkillBadge`, rendered inside one `<main>` landmark.
- **Stack:** React 19 + Vite. JavaScript with JSX. Contracts are written as JSDoc typedefs. No TypeScript.
- **Styling:** CSS Modules for components (`Name.module.css`). Global files only for tokens, reset and layout, in `src/styles/`.
- **Goals:**
  - Zero `div` in the two component files. The only `div` in the project is `<div id="root">` in `index.html`.
  - HTTPS only. No `http://` anywhere in `src/`.
  - No horizontal scroll at 375px (and at 320px).
  - Lighthouse Accessibility score of 100, measured by the author in the browser.

## 2. Contract

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

## 3. Invariants

1. `DeveloperCard` and `SkillBadge` are pure function components. Defaults are ES6 parameter defaults. No `defaultProps`.
2. `DeveloperCard.jsx` and `SkillBadge.jsx` contain none of these strings, not even in a comment: `<div`, `http://`, `style=`, `key={index}`.
3. The card root is `<article aria-labelledby={headingId}>`, with `headingId` from `useId()`. The card title is an `h2`.
4. The only state is `failedUrl` (the avatar URL that failed to load). Whether the initials show is a derived value: `failedUrl === avatarUrl`. No `useEffect`.
5. The avatar `<img>` has explicit `width="64"` and `height="64"`.

## 4. Default data

| Field | Value |
| --- | --- |
| `fullName` | `Võ Văn Thiện` |
| `role` | `Student at the University of Information Technology – VNU-HCM` |
| `avatarUrl` | `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240` |
| `metrics` | `{ commits: 0, vdomNodes: 0, a11yScore: 0 }`. Placeholders, replaced by measured values in E1-T19. |
| `skills` | `sk-1` "React 19 createRoot + StrictMode" (Core); `sk-2` "Hooks: useState, useEffect, useId" (Core); `sk-3` "Semantic JSX" (Core); `sk-4` "React.memo" (Awareness) |

## 5. Work breakdown structure

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

## 6. Verification gate

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

## 7. Working rules

1. One sub-task per prompt. Do not start the next task.
2. Contract before code. This file (E1-T02) and the JSDoc contract (E1-T05) are committed before any component.
3. Do not commit if a check fails. Report the failure instead.
4. Stage files by explicit path. Never `git add .`, `git add -A` or `git commit -a`. Never push.
5. Never write a score, contrast ratio, render count or test result that was not produced in the same session. Mark it "not verified".
