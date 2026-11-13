# TASK_DECOMPOSITION.md: Lab 4

Work breakdown of Lab 4 (Multi-Route SPA, Context Form Engine & Full-Stack React 19), one Part per exercise, in slide order. Lab 4 is built on the Lab 3 code base, on the `lab4` branch. Lab 3 is frozen at the tag `lab3-final` and its documents live in `docs/lab3/`.

Every commit maps to exactly one row. Rows are committed before the commit they describe, with one exception: S-T01 (moving the Lab 3 documents) had to happen first, because this file reuses the Lab 3 file name.

Read `Agent.md` and `project-rules.md` before any task.

## Part 0. Decisions

| ID | Question | Decision |
| --- | --- | --- |
| D1 | Branch and Lab 3 | Branch `lab4` from tag `lab3-final` (`c9a26b7`). `main` is not touched. The Lab 3 `DeveloperCard` keeps `commits: 144`, the value of `lab3-final`. |
| D2 | Exercise numbers | Slide titles, in slide order: 1.1 (slide 9), 1.2 and 1.2.1 (slide 10), 1.2.2 (slide 11, its tag says "1.3.2"), 1.3 (slides 13 and 14, its trace says "Ex1.6"), 1.7.1 (slide 16). Change them here if the teacher gives other numbers. |
| D3 | Router | `react-router` 7.x (the slides import from `'react-router'`). Declarative mode: `<BrowserRouter>`, `<Routes>`, `<Route element>`, `<NavLink>`, `<Outlet>`. |
| D4 | Lab 3 views | The hash shell (`useHashView`, `resolveView`) is replaced by routes. Old ids become paths: `exercises` -> `/`, `hw1` -> `/hw1`, `hw2` -> `/hw2`, `hw3` -> `/hw3`, `bonus` -> `/bonus`. |
| D5 | People data | Exercise 1.2.2 uses the Lab 3 `SMART_PEOPLE` (`id`, `name`, `age`, `iq`). The slide shows `role`, which this data does not have: the detail shows Name, Age and IQ instead. No field is invented. |
| D6 | Form fields | Proposal (approve or change): `name` (required, 2 to 60 characters after trim), `email` (required, `local@domain.tld`), `age` (required, whole number from 16 to 120, read with `valueAsNumber`). |
| D7 | API path | The slides use three different paths (`/api/channels/:id/messages` on slide 16, `/api/forums/:id/messages` on slide 26, `/api/messages/:forum` on slide 27). Lab 4 uses the slide 16 path on both client and server: `GET` and `POST /api/channels/:channelId/messages`. |
| D8 | Server | `server/` is its own npm package (`express`, `cors`). Messages are kept in memory, seeded per channel. No MongoDB in the exercises. Config comes from `process.env` through `node --env-file-if-exists=.env`, so no `dotenv` package. |
| D9 | Slide code with `div` | The slide snippets use `<div>` wrappers. Lab 4 keeps the Lab 3 rule (no `div` in `src/`): `section`, `p`, `Fragment` replace them. |
| D10 | Fail-test commits | The slide 8 loop (contract, fail test, implement, refactor) is shown in git: for pure logic, a `test(...)` commit adds the failing test (expected red, only for its own module; build and lint stay green), then a `feat(...)` commit makes it green. |
| D11 | Homework | Homework (slides 19 to 21, 29 to 32) is out of this plan. It gets its own Parts later. |

## Part 1. Setup

| ID | Task | Files | Done when | Commit |
| --- | --- | --- | --- | --- |
| S-T01 | Archive the Lab 3 documents | `docs/lab3/*.md` (moved with `git mv`) | Root no longer has the Lab 3 `README.md`, `project-rules.md`, `TASK_DECOMPOSITION.md`, `AI_FAILURE_AUDIT.md`. | `chore(repo): archive lab 3 documents under docs/lab3` |
| S-T02 | Add this WBS | `TASK_DECOMPOSITION.md` | File present. | `docs(spec): add lab 4 task decomposition` |
| S-T03 | Add the Lab 4 rules | `project-rules.md` | File present. | `docs(rules): add lab 4 project rules` |
| S-T04 | Ignore env files, add the template | `.gitignore`, `.env.example` | `git check-ignore .env` prints `.env`. `.env.example` has no secret. | `chore(repo): ignore env files and add env template` |

## Part 2. Exercise 1.1: Code-splitting with React.lazy and Suspense (slide 9)

Goal: route-level chunks via `React.lazy`, one `<Suspense>` boundary, a dimension-matched skeleton with `aria-busy="true"` and `aria-live="polite"`, CLS 0. Done first on the Lab 3 hash shell (slide order), kept by Exercise 1.2.

| ID | Task | Files | Done when | Commit |
| --- | --- | --- | --- | --- |
| E11-T01 | Fail test for `lazyNamed` loader mapping | `src/shell/lazyNamed.test.js` | Test fails because `lazyNamed.js` is missing. | `test(shell): add failing test for named lazy loader` |
| E11-T02 | `pickNamedExport` and `lazyNamed` | `src/shell/lazyNamed.js` | Test green. A missing export rejects with a clear error. | `feat(shell): add named export lazy loader` |
| E11-T03 | `ViewSkeleton` with `view` and `detail` sizes | `src/shell/ViewSkeleton.jsx`, `.module.css`, `src/styles/tokens.css` | `aria-busy="true"`, `aria-live="polite"`, fixed `min-block-size` from tokens, reduced-motion safe. | `feat(shell): add dimension-matched view skeleton` |
| E11-T04 | Lazy-load the four homework views | `src/App.jsx` | Build output has one chunk per homework view. One `<Suspense fallback={<ViewSkeleton />}>`. | `feat(shell): lazy-load homework views behind suspense` |

## Part 3. Exercises 1.2 and 1.2.1: React Router v7 and layout routes (slide 10)

| ID | Task | Files | Done when | Commit |
| --- | --- | --- | --- | --- |
| E12-T01 | Add `react-router` 7 | `package.json`, `package-lock.json` | `react-router` `^7.18.5` in dependencies. | `chore(deps): add react-router v7` |
| E12-T02 | Fail test for the nav model | `src/shell/navItems.test.js` | Test fails because `navItems.js` is missing. | `test(shell): add failing test for route nav items` |
| E12-T03 | `NAV_ITEMS` (paths, labels, `end`) | `src/shell/navItems.js` | Test green. Paths unique, absolute, `/` has `end: true`. | `feat(shell): add route nav items` |
| E12-T04 | Replace hash views with `<Routes>` (1.2) | `src/main.jsx`, `src/App.jsx`, `src/shell/AppLayout.jsx`, `src/shell/SiteHeader.jsx`, `src/shell/SiteHeader.module.css`; delete `src/shell/useHashView.js`, `src/shell/resolveView.js`, `src/shell/resolveView.test.js` | `<BrowserRouter>` in `main.jsx`. `<Route path="/" element={<AppLayout />}>` with child routes. `NavLink className={({ isActive }) => ...}`. `<Outlet />` inside `<Suspense>` (1.2.1). No `Switch`, `component=`, `exact`, `activeClassName`. | `feat(router): replace hash views with react router v7 layout routes` |
| E12-T05 | 404 catch-all route | `src/shell/NotFoundPage.jsx`, `src/App.jsx` | `path="*"` renders a heading, the bad path, and a link home. | `feat(router): add not found route` |

## Part 4. Exercise 1.2.2: Master-detail directory (slides 11, 12, 22). Sprint 1

Sprint 1 asks for 2 atomic commits: `feat: router layout` (E122-T03) and `feat: detail route handling` (E122-T04).

| ID | Task | Files | Done when | Commit |
| --- | --- | --- | --- | --- |
| E122-T01 | Fail test for `findPersonById` | `src/lab4/people/findPersonById.test.js` | Fails: module missing. | `test(people): add failing test for person lookup` |
| E122-T02 | `findPersonById(people, id)` | `src/lab4/people/findPersonById.js` | Green. Returns the person or `null`; non-string id returns `null`. | `feat(people): add person lookup by url id` |
| E122-T03 | `PeopleLayout`: sidebar `NavLink` per person + `<Outlet />` | `src/lab4/people/PeopleLayout.jsx`, `.module.css`, `src/App.jsx`, `src/shell/navItems.js`, `src/shell/navItems.test.js` | `/people` shows the list and an index prompt. Grid `minmax(280px, 1fr) 2fr` from 48rem; one column below. | `feat(people): add router layout for master-detail directory` |
| E122-T04 | `PersonDetail`: `useParams`, lookup, 404, `dl` | `src/lab4/people/PersonDetail.jsx`, `.module.css`, `src/App.jsx` | `/people/sp-2` shows Albert Einstein. `/people/nope` shows `role="alert"` "404: Person Not Found". Loaded with `React.lazy`, inner `<Suspense>` uses the `detail` skeleton. | `feat(people): add detail route handling with 404 boundary` |

## Part 5. Exercise 1.3: Synchronous context form engine (slides 13, 14, 15, 23, 24). Sprint 2

Sprint 2 asks for 3 atomic commits: `feat: form context` (E13-T03), `feat: input field validation` (E13-T04), `feat: inspector output` (E13-T05). Zero `useEffect` in `src/lab4/form/`.

| ID | Task | Files | Done when | Commit |
| --- | --- | --- | --- | --- |
| E13-T01 | Fail test for `validateForm` | `src/lab4/form/validateForm.test.js` | Fails: module missing. | `test(form): add failing test for synchronous validation` |
| E13-T02 | `validateForm(values)`, `isFormValid(errors)` | `src/lab4/form/validateForm.js` | Green. Rules of D6. Pure, no React. | `feat(form): add synchronous form validation` |
| E13-T03 | `FormContext` + `useFormContext` | `src/lab4/form/FormContext.js` | `useFormContext()` throws outside a provider. | `feat(form): add form context and hook` |
| E13-T04 | `InputField`: `useId`, `label htmlFor`, `aria-invalid`, `aria-describedby` | `src/lab4/form/InputField.jsx`, `.module.css` | Reads value and error from context by `name`. Error shown after blur or submit. | `feat(form): add context input field with accessible errors` |
| E13-T05 | `ShowData` + `SimpleForm` + route `/form` | `src/lab4/form/ShowData.jsx`, `src/lab4/form/SimpleForm.jsx`, `.module.css`, `src/App.jsx`, `src/shell/navItems.js`, `src/shell/navItems.test.js` | Errors derived in render. Valid submit renders `<ShowData>` as `dl` with `Fragment` keys. Invalid submit focuses the first invalid field. | `feat(form): add simple form with live data inspector` |

## Part 6. Exercise 1.7.1: Data fetching and Express hygiene (slides 16, 17, 25, 26). Sprint 3

| ID | Task | Files | Done when | Commit |
| --- | --- | --- | --- | --- |
| E171-T01 | Scaffold the server package | `server/package.json`, `server/package-lock.json` | `express`, `cors` installed. Scripts `start`, `test`. | `chore(server): scaffold express server package` |
| E171-T02 | Fail tests: payload validation and REST API | `server/src/validateMessage.test.js`, `server/src/app.test.js` | Fail: modules missing. | `test(server): add failing tests for message api` |
| E171-T03 | Store, validation, app, entry | `server/src/messageStore.js`, `server/src/validateMessage.js`, `server/src/app.js`, `server/src/server.js` | Green. `cors({ origin })` from env. `GET` 200 list, unknown channel 404. `POST` 400 on bad payload, 201 with `crypto.randomUUID()` id; only `author` and `text` are copied from the body. | `feat(server): add channel message api with cors and payload validation` |
| E171-T04 | Fail test for the client API helper | `src/lab4/forum/forumApi.test.js` | Fails: module missing. | `test(forum): add failing test for channel api client` |
| E171-T05 | `fetchChannelMessages`, `postChannelMessage`, `FORUM_CHANNELS` | `src/lab4/forum/forumApi.js` | Green. Passes `signal` through. Non-2xx throws. | `feat(forum): add channel api client` |
| E171-T06 | `useForumMessages(channelId)` | `src/lab4/forum/useForumMessages.js` | `AbortController` per request, `controller.abort()` cleanup, `signal.aborted` guards, no synchronous `setState` in the effect, `postMessage` refetches. | `feat(forum): add useForumMessages hook with abort cleanup` |
| E171-T07 | `ForumBoard` + routes `/forum/:channelId` + dev proxy | `src/lab4/forum/ForumBoard.jsx`, `.module.css`, `src/App.jsx`, `src/shell/navItems.js`, `src/shell/navItems.test.js`, `vite.config.js`, `package.json` | Channel `NavLink`s, `dl` with `<Fragment key={msg.id}>`, post form with labels. `/api` proxied to the server in dev and preview. | `feat(forum): add channel board with live channel switcher` |

## Part 7. Docs

| ID | Task | Files | Done when | Commit |
| --- | --- | --- | --- | --- |
| L4-T01 | Page title and description | `index.html` | Title "Lab 4: Multi-Route SPA". | `chore(html): update page title for lab 4` |
| L4-T02 | README for Lab 4 | `README.md` | Commands, routes, server, checks, known limits. | `docs(readme): document lab 4 exercises` |
| L4-T04 | Narrow check K2 (unplanned: `\bexact\b` matched "the exact label" in a Lab 3 test) | `TASK_DECOMPOSITION.md`, `README.md` | K2 only matches `exact` on a `<Route>` and prints nothing. | `docs(spec): narrow legacy router check to route props` |
| L4-T03 | Evidence (author) | `docs/evidence/L4_*/`, `docs/prompt_logs/L4_*.txt` | Copied by the author. | `docs(evidence): archive lab 4 exercise screenshots` |

## Checks

Run from the repository root. Each must print nothing.

```sh
# K1. No div in src (index.html keeps the root div)
grep -rn '<div' src --include='*.jsx'
# K2. No legacy router or form patterns
grep -rnE '<Switch|<Redirect|activeClassName|component=\{|<Route[^>]*\bexact\b|withRouter|useHistory' src --include='*.jsx' --include='*.js'
# K3. No useEffect in the form engine
grep -rn 'useEffect' src/lab4/form
# K4. No hard-coded database URI in client or server code
grep -rnE 'mongodb(\+srv)?://' src server/src --include='*.js' --include='*.jsx'
# K5. No http:// in the client (the dev origin lives in .env.example and vite.config.js)
grep -rn 'http://' src --include='*.js' --include='*.jsx' --include='*.css'
```
