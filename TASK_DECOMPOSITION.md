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

## Part 8. Homework 1: Photo & Evidence Gallery SPA (slides 19 and 29)

Homework 1 here means the first of the three Lab 4 homeworks (slide 19). The slides number the three homeworks inconsistently (slide 19 "HOMEWORK 1", slide 20 "HOMEWORK 1", slide 21 "HOMEWORK 2", slide 29 "Homework 3"); this WBS calls them HW1 (gallery), HW2 (swipe deck) and HW3 (appeal tribunal), by content. Part 8 realises decision D11 for HW1 only.

Goal (slide 19): deep linking with `useSearchParams()` for the category filter and the modal photo view; the native HTML `<dialog>` as the lightbox; WCAG 2.2 AA and a 100/100 Lighthouse score (the score is run by the author). Code contract (slide 29): `PhotoGalleryLayout.jsx` with `useSearchParams`, `photoId` read from the URL, a `<dialog>` ref, `showModal()` and `close()`, and a close handler that syncs back to the URL.

### Decisions

| ID | Question | Decision |
| --- | --- | --- |
| H1-D1 | Where | `src/lab4/gallery/` (rule 9). Route `/gallery`, nav label "L4 HW1 Gallery". `/hw1` is already the Lab 3 drum kit, so it is not reused. |
| H1-D2 | Data | 8 sample photos in 4 categories (`screenshots`, `chat-logs`, `replays`, `reports`), frozen in `src/lab4/gallery/photos.js`. Images are local SVG illustrations in `public/gallery/` (no CDN, no remote URL). The UI and the README say "Sample images, not real evidence." |
| H1-D3 | URL contract | Two query parameters: `category` (`all` or a category id) and `photoId` (slide 29 name). Both are untrusted: an unknown category falls back to `all`; an unknown `photoId` keeps the dialog closed and shows a `role="alert"` message. A photo opens by its id whatever the category filter is, so a shared `?photoId=` link works on its own. |
| H1-D4 | Deviation from slide 29 | Slide 29 closes with `setSearchParams({})`, which also drops the category filter. Here only `photoId` is removed, so deep-linked filters survive closing the lightbox. |
| H1-D5 | History | Opening a photo pushes a history entry (Back closes the lightbox). Closing from the dialog replaces the entry, so Back never reopens it. Category changes push an entry. |
| H1-D6 | The one effect | Opening and closing the native dialog is imperative DOM, so one effect keyed on the selected photo calls `showModal()` or `close()` (slide 29 does the same). It sets no state, starts no timer or listener, and reads the dialog only through a ref. Focus goes back to the link that opened the photo from the dialog's close handler, never from an effect. |
| H1-D7 | Markup | Thumbnails are links (`<Link>`), because opening a photo is a URL change; the whole card is the link and its name is the photo title (thumbnail `alt=""`, the full `alt` is on the lightbox image). The filter is a `fieldset` of labelled radios. No `div`. |
| H1-D8 | Dependencies | None added. `useSearchParams` comes from `react-router` 7. Lighthouse, 375px and screen-reader checks are run by the author. |
| H1-D9 | Git | The worktree link was broken when the Lab 3 and Lab 4 folders moved into `HomeWork_WEBDEV\`; `git worktree repair` fixed it, and the commits below are made in this order on branch `lab4`. One commit per row, in row order (T16 is the author's). |

### Tasks

| ID | Task | Files | Done when | Commit |
| --- | --- | --- | --- | --- |
| L4H1-T01 | Add this Part | `TASK_DECOMPOSITION.md` | Part 8 present. | `docs(spec): add lab 4 homework 1 plan` |
| L4H1-T02 | Sample photo assets | `public/gallery/*.svg` (8 files) | Each file is a valid SVG, 640 by 400, under 2 KB. | `chore(gallery): add sample photo assets` |
| L4H1-T03 | JSDoc contract | `src/lab4/gallery/gallery.contract.js` | Typedefs `Photo`, `PhotoCategory`, `GalleryParams`. | `feat(gallery): add gallery contract` |
| L4H1-T04 | Fail test for the photo data | `src/lab4/gallery/photos.test.js` | Fails: module missing. | `test(gallery): add failing test for photo data` |
| L4H1-T05 | `PHOTOS`, `CATEGORIES`, `ALL_CATEGORY` | `src/lab4/gallery/photos.js` | Green. Frozen, unique ids, every category known, every `src` exists in `public/`. | `feat(gallery): add photo and category data` |
| L4H1-T06 | Fail test for the URL helpers | `src/lab4/gallery/galleryParams.test.js` | Fails: module missing. | `test(gallery): add failing test for url params` |
| L4H1-T07 | `parseGalleryParams`, `updateGalleryParams` | `src/lab4/gallery/galleryParams.js` | Green. Unknown category gives `all`; update keeps other keys and never mutates its input. | `feat(gallery): add url param helpers` |
| L4H1-T08 | Fail test for the selectors | `src/lab4/gallery/selectPhotos.test.js` | Fails: module missing. | `test(gallery): add failing test for photo selectors` |
| L4H1-T09 | `selectPhotosByCategory`, `findPhotoById` | `src/lab4/gallery/selectPhotos.js` | Green. Non-string id gives `null`; input is never mutated. | `feat(gallery): add photo selectors` |
| L4H1-T10 | `PhotoLightbox` (native dialog) | `src/lab4/gallery/PhotoLightbox.jsx`, `.module.css` (minimal) | `showModal()` in the one effect; `aria-labelledby`; Close button; backdrop click and Escape close it. | `feat(gallery): add native dialog lightbox` |
| L4H1-T11 | `CategoryFilter` | `src/lab4/gallery/CategoryFilter.jsx`, `.module.css` (minimal) | Radios with `useId()` labels; value comes from props. | `feat(gallery): add category filter` |
| L4H1-T12 | `PhotoGrid` | `src/lab4/gallery/PhotoGrid.jsx`, `.module.css` (minimal) | One link per photo, keyed by id; `width` and `height` on every image. | `feat(gallery): add photo grid` |
| L4H1-T13 | `PhotoGalleryLayout`, route, nav | `src/lab4/gallery/PhotoGalleryLayout.jsx`, `.module.css` (minimal), `src/App.jsx`, `src/shell/navItems.js`, `src/shell/navItems.test.js` | `/gallery?category=replays&photoId=...` opens the lightbox; closing keeps `category`. | `feat(gallery): add url-driven gallery route` |
| L4H1-T14 | Styles | `src/styles/tokens.css`, the four `.module.css` files | Tokens only (no hard-coded colour outside `tokens.css`); no horizontal scroll at 375px and 320px; focus visible; `prefers-reduced-motion` safe. | `style(gallery): add responsive gallery and lightbox styles` |
| L4H1-T15 | README | `README.md` | Route, URL contract, checks, known limits. | `docs(readme): document homework 1 gallery` |
| L4H1-T16 | Valid `robots.txt` (Lighthouse SEO) | `public/robots.txt` | `/robots.txt` returns plain text, not the SPA `index.html`. Found by the author's Lighthouse run (SEO 92). | `fix(seo): add robots.txt for the lighthouse seo audit` |
| L4H1-T17 | Evidence (author) | `docs/evidence/L4_HW1_Gallery/`, `docs/prompt_logs/L4_HW1_Gallery.txt` | Copied by the author. | `docs(evidence): archive homework 1 screenshots` |
| L4H1-T18 | AI failure audit | `AI_FAILURE_AUDIT.md` | Failure #01 (robots.txt) logged with the fixing commit; only defects that reached a commit. | `docs(audit): add ai failure audit for homework 1` |

### Checks

Run from the repository root. K1 to K5 above still apply.

```sh
# G1. showModal is called in exactly one place (prints 1 line)
grep -rn 'showModal' src --include='*.jsx'
# G2. useSearchParams is used only by the gallery layout (prints 2 lines: import and call)
grep -rn 'useSearchParams' src --include='*.jsx' --include='*.js'
# G3. the slide 29 close handler that drops every parameter is not used (prints nothing)
grep -rn 'setSearchParams({})' src
```

## Part 9. Homework 2: Card-Swipe Deck, "Hẹn Hò Nhưng Không Yêu" edition (slides 20, 30 and 31)

Homework 2 here means the second of the three Lab 4 homeworks by content (slide 20; the slides print "Homework 1/4" on it). It extends the Lab 3 Bonus (same title) from a client-only state machine to a full-stack app.

Goal (slide 20): a dual keyboard and pointer swipe deck, a LIFO undo stack, an asymmetric score computed only as derived state, and a persistence layer on Express and Mongoose 8 with async/await. Code contracts: slide 30 (frontend: key handlers, pointer gestures, history stack, score) and slide 31 (backend: `process.env.MONGODB_URI` guard, `mongoose.connect` without deprecated flags, `GET /api/profiles` with `.lean()`, `POST /api/swipe` with try/catch). General rules from slides 3 and 8 apply: contract first, then a failing test, then the code, then a refactor, and client and server validation must match.

### Needs the author's answer before the marked tasks

| # | Question | Blocks | My proposal |
| --- | --- | --- | --- |
| Q1 | Approve the new package `mongoose@^8.24` in `server/package.json` (rule 1 in `project-rules.md` needs approval for any package beyond `express` and `cors`). No other package is added (no `mongodb-memory-server`, no `supertest`). | L4H2-T02 | Approve. The slide asks for Mongoose 8, and nothing else is needed. |
| Q2 | Where does MongoDB run? This machine has no `mongod`, and Docker Desktop is installed but its engine is not running. | L4H2-T21, T22 and every real-database check | Docker Desktop with `docker run -d -p 27017:27017 mongo:8`, or a free Atlas cluster. The URI goes only in `.env`, never in git. |
| Q3 | The slides define LIKE as +10 and "everything else" as -5, and say nothing about the up key. Proposal: ArrowUp is SUPERLIKE, +25. A "Start over" button clears the player's history so the demo can be repeated. | L4H2-T06, T18 | Accept both. |

### Decisions

| ID | Question | Decision |
| --- | --- | --- |
| H2-D1 | Where | Client `src/lab4/swipe/`, route `/swipe`, nav label "L4 HW2 Swipe Deck". Server code in `server/src/swipe/`, mounted in the existing Express app. |
| H2-D2 | What is reused from earlier labs | The Lab 3 Bonus idea and title (`situationshipModel.js` pure model, `lang="vi"` phrases, append-only logs with `crypto.randomUUID()`). `getInitials` for avatars (no remote images). The `forumApi.js` pattern for the API client (injectable `fetchImpl`, `AbortSignal`, `{ error }` bodies). The `useForumMessages` pattern for loading (one `AbortController` per request, `signal.aborted` checks, loading derived from a request key). The `validateMessage.js` pattern for server validation (copy only allowed fields). The Lab 3 key guard idea of `shouldHandleKey` (ignore `repeat`, modifiers, editable targets). The vite `/api` proxy and the `createApp` factory (tests start it on a random port). |
| H2-D3 | Actions and score | `LIKE` (ArrowRight, drag right) +10. `NOPE` (ArrowLeft, drag left) -5. `SUPERLIKE` (ArrowUp, drag up) +25. `UNDO` (Backspace) is not a swipe: it pops the stack. The score is one `reduce` over an explicit table `SCORE_BY_ACTION`; an unknown action throws. There is no `else` branch that scores "anything else" (see H2-D13). |
| H2-D4 | State shape | The only raw state is `history`, a list of saved swipes `{ id, profileId, action }` in order. Everything else is derived in render: `currentProfile = profiles[history.length]`, `remaining`, `score`, counts per action, `isFinished`. No second `useState` for the score or the index, and no effect that copies one state into another. |
| H2-D5 | LIFO stack | A pure module with `pushSwipe(history, entry)`, `popSwipe(history)` (returns `{ history, removed }`, or `removed: null` when empty) and `peekSwipe(history)`. Lists are frozen and replaced, never mutated. Undo needs the removed entry, which is why the slide's `slice(0, -1)` alone is not enough. |
| H2-D6 | Persistence flow | The server is the source of truth, and the client is pessimistic: a handler sets `busy`, awaits the request, then appends or pops with the record the server returned. Input is ignored while `busy`. Optimistic updates were rejected: a failed POST needs a rollback, and a fast undo can race an unsaved swipe. |
| H2-D7 | Who is the player | An anonymous `playerId` (`crypto.randomUUID()`) kept in `localStorage` under `lab4.swipe.playerId`. The stored value is untrusted: it is accepted only if it matches the UUID pattern. Storage errors (private window) are caught and the id then lives in memory only. There is no login; anyone who knows an id can read that player's swipes. This is a documented limit. |
| H2-D8 | API contract | `GET /api/profiles` returns `200 [{ id, name, age, bio }]` in deck order. `GET /api/swipe?playerId=` returns `200` with that player's swipes, oldest first. `POST /api/swipe` with `{ playerId, profileId, action }` returns `201` with the saved record, `400` for an invalid body, `404` for an unknown profile, `409` if that player already swiped that profile. `DELETE /api/swipe/last?playerId=` removes the player's newest swipe and returns `200` with it, or `404` when there is nothing to undo (the server enforces LIFO, so the client cannot remove a middle entry). `DELETE /api/swipe?playerId=` clears the player's history and returns `204`. Every error body is `{ error }` with a fixed message. The first two paths are the slide's; the last two are additions (Q3). |
| H2-D9 | Validation parity | One rule set on both sides: `action` is one of the three actions; `playerId` is a UUID and `profileId` is a non-empty string of at most 64 characters; extra fields are dropped. The client validator runs before each request; the server validator runs before each write. A parity test feeds the same table of cases to both validators and expects the same verdicts. |
| H2-D10 | Mongoose 8 | `await mongoose.connect(process.env.MONGODB_URI)` with no `useNewUrlParser` or `useUnifiedTopology`; `serverSelectionTimeoutMS` set so a wrong URI fails fast; `.lean()` on reads; `await Model.init()` before listening, so the unique index exists; `SIGINT` and `SIGTERM` call `mongoose.disconnect()`. No callback API. `Swipe` has a `_id` that is a `crypto.randomUUID()` string (rule 6), a unique compound index on `(playerId, profileId)` and `createdAt` only. A stored swipe is built from the validated fields, never from `req.body` (the slide's `Swipe.create(req.body)` is mass assignment). |
| H2-D11 | Errors | A Mongoose `ValidationError` is `400`, a duplicate key (`code 11000`) is `409`, an unknown profile is `404`, anything else is `500 { error: 'Internal server error' }`. The slide returns `err.message` with `400` for every failure, which leaks internals and calls a database outage a client error. Express 5 forwards a rejected async handler to the error handler, so a `try/catch` is used only where an error is mapped. |
| H2-D12 | Repository split | Routes talk to a repository object (`listProfiles`, `hasProfile`, `listSwipes`, `createSwipe`, `deleteLastSwipe`, `deleteAllSwipes`). Two implementations: an in-memory one (tests and the AI's browser check) and a Mongoose one. This lets the API be tested without MongoDB. The Mongoose side is checked offline with `validateSync()`, plus one integration test that is skipped unless `MONGODB_URI_TEST` is set. |
| H2-D13 | Deviations from the slide snippets | See the table below. |
| H2-D14 | Input handling | Key and pointer handlers are props on one focusable `<section tabIndex={0}>`, so no `window` listener and no effect for input. Keys are read with `e.code` (Lab 3 rule), `e.repeat` is ignored so a held key cannot swipe or undo the whole deck, and the handler calls `preventDefault` on the four keys. A pointer gesture starts on `pointerdown` (primary pointer, main button), stores the start point in a `ref`, uses `setPointerCapture`, and is decided on `pointerup` by a pure function: the larger axis wins, the 50 px threshold from the slide applies, and a smaller move is not a swipe. `pointercancel` clears the start. The card has `touch-action: none` so a vertical swipe is not taken by page scroll. |
| H2-D15 | Accessibility (WCAG 2.2 AA) | Dragging has a single-pointer alternative (SC 2.5.7): visible buttons Nope, Like, Super like, Undo and Start over, each at least 24 by 24 px. The keys are listed in visible text. The result of each action is announced in one `<output role="status" aria-live="polite">` ("Liked Mai. Score 10."). Failures use `role="alert"`. When the last card is swiped, focus moves to the deck from the handler (a ref, not an effect). Motion respects `prefers-reduced-motion`. Contrast 4.5:1, no horizontal scroll at 375 px and 320 px. |
| H2-D16 | Data | 8 invented adult profiles (name, age 21 to 35, one-line bio) in `server/src/swipe/seedProfiles.js`, marked as sample data in the UI. An explicit script `npm --prefix server run seed` upserts them by a stable key; the server never seeds at startup. Avatars are initials on a token colour. The Vietnamese title and any short phrase are wrapped in `lang="vi"`; no lyrics. |
| H2-D17 | Configuration | `.env.example` gains `MONGODB_URI` (a local example value, no credentials) and a commented `MONGODB_URI_TEST`. `server.js` stops with a clear error when `MONGODB_URI` is missing (the slide's guard). Consequence: after this homework `npm run server` needs a reachable MongoDB for the forum too. |
| H2-D18 | Git | One commit per task row below, in row order, on branch `lab4`. The `test(...)` rows are expected red for their own module only; build and lint stay green. T28 and T29 follow the author-only rules. |

### Deviations from the slide 30 and 31 snippets (each is covered by a test or a check)

| Slide snippet | Problem | Fix |
| --- | --- | --- |
| `<div onKeyDown={...} tabIndex={0}>` | `div` is banned in `src/`; a focusable region with no label or instructions | `<section aria-label tabIndex={0}>` with visible key instructions |
| `if (e.key === 'ArrowLeft')` | Lab 3 rule: `e.code`; no `repeat` guard, so holding a key swipes every card | `keyToAction(e.code)` and `if (e.repeat) return` |
| `handlePointerUp` reads `startPos.x` | `startPos` is `null` after a release outside the card or a cancel: `TypeError` | Start point in a `ref`, null check, `pointercancel`, pointer capture |
| `useState` for the start point | An extra render on every `pointerdown` | `ref` |
| Pointer handles only left and right | The up swipe exists only on the keyboard | `classifySwipe(dx, dy)` returns left, right or up |
| `if (action.type === 'LIKE') +10 else -5` | A SUPERLIKE (or any typo) silently scores -5 | Explicit `SCORE_BY_ACTION`; unknown action throws |
| `setHistory(prev => prev.slice(0, -1))` | The server is not told which swipe was undone | `popSwipe` returns the removed entry; `DELETE /api/swipe/last` |
| `Swipe.create(req.body)` | Mass assignment | Validate, then create from the picked fields |
| `res.status(400).json({ error: err.message })` for all errors | Leaks internals; a database outage is not a client error | 400, 404, 409 or 500 with fixed messages |
| `throw` at the top of `server.js`, then an unguarded `await mongoose.connect` | An unreadable crash on a wrong URI | One startup function: guard, connect with a timeout, log a clear error, exit non-zero |

### Tasks

| ID | Task | Files | Done when | Commit |
| --- | --- | --- | --- | --- |
| L4H2-T01 | Add this Part | `TASK_DECOMPOSITION.md` | Part 9 present. | `docs(spec): add lab 4 homework 2 plan` |
| L4H2-T02 | Add Mongoose 8 (after Q1) | `server/package.json`, `server/package-lock.json` | `mongoose` `^8.24` is the only new package; `npm --prefix server test` still passes. | `chore(deps): add mongoose 8 to the server package` |
| L4H2-T03 | Env template | `.env.example` | `MONGODB_URI` and `MONGODB_URI_TEST` documented, no secret. | `chore(repo): add mongodb uri to env template` |
| L4H2-T04 | Contracts | `src/lab4/swipe/swipe.contract.js`, `server/src/swipe/swipe.contract.js` | Typedefs `Profile`, `SwipeAction`, `SwipeRecord`, `SwipeInput`, `SwipeRepository`. | `feat(swipe): add swipe contracts` |
| L4H2-T05 | Fail test: score | `src/lab4/swipe/swipeRules.test.js` | Fails: module missing. | `test(swipe): add failing test for asymmetric score` |
| L4H2-T06 | Actions, score table, `scoreOf`, `statsOf` | `src/lab4/swipe/swipeRules.js` | Green. +10, -5, +25; empty history is 0; unknown action throws; input is not mutated. | `feat(swipe): add asymmetric score derived from history` |
| L4H2-T07 | Fail test: LIFO stack | `src/lab4/swipe/swipeHistory.test.js` | Fails: module missing. | `test(swipe): add failing test for lifo undo stack` |
| L4H2-T08 | `pushSwipe`, `popSwipe`, `peekSwipe` | `src/lab4/swipe/swipeHistory.js` | Green. Last in, first out; pop on empty gives `removed: null`; results frozen. | `feat(swipe): add lifo undo stack` |
| L4H2-T09 | Fail test: input mapping | `src/lab4/swipe/swipeInput.test.js` | Fails: module missing. | `test(swipe): add failing test for swipe input mapping` |
| L4H2-T10 | `classifySwipe`, `keyToAction` | `src/lab4/swipe/swipeInput.js` | Green. 50 px is the edge; the larger axis wins; unknown code gives null; `Backspace` gives `UNDO`. | `feat(swipe): add swipe gesture and key mapping` |
| L4H2-T11 | Fail test: validation and player id | `src/lab4/swipe/validateSwipe.test.js`, `src/lab4/swipe/playerId.test.js` | Fail: modules missing. | `test(swipe): add failing test for swipe validation and player id` |
| L4H2-T12 | `validateSwipe`, `readPlayerId`, `ensurePlayerId` | `src/lab4/swipe/validateSwipe.js`, `src/lab4/swipe/playerId.js` | Green. A bad stored id is replaced; a throwing storage still returns an id. | `feat(swipe): add swipe validation and player id` |
| L4H2-T13 | Fail test: API client | `src/lab4/swipe/swipeApi.test.js` | Fails: module missing. | `test(swipe): add failing test for swipe api client` |
| L4H2-T14 | API client | `src/lab4/swipe/swipeApi.js` | Green with a fake `fetchImpl`: URLs, bodies, status mapping, abort not swallowed. | `feat(swipe): add swipe api client` |
| L4H2-T15 | Fail test: server validation and parity | `server/src/swipe/validateSwipe.test.js` | Fails: module missing. | `test(server): add failing test for swipe validation parity` |
| L4H2-T16 | Server validator | `server/src/swipe/validateSwipe.js` | Green; the same case table gives the same verdicts as the client validator. | `feat(server): add swipe validation` |
| L4H2-T17 | Fail tests: memory repository and routes | `server/src/swipe/memorySwipeRepository.test.js`, `server/src/swipe/swipeRoutes.test.js` | Fail: modules missing. Cases: 201, 400 (action, ids, body not an object), 404, 409, order, LIFO delete, empty undo 404, reset 204, forged `_id` and `createdAt` dropped, error bodies never contain a stack. | `test(server): add failing tests for swipe api` |
| L4H2-T18 | Memory repository, routes, mount | `server/src/swipe/memorySwipeRepository.js`, `server/src/swipe/swipeRoutes.js`, `server/src/app.js` | Green. The swipe repository is an optional option of `createApp`, so the 14 existing server tests stay green. | `feat(server): add swipe api routes with memory repository` |
| L4H2-T19 | Fail test: Mongoose models | `server/src/swipe/models.test.js` | Fails: modules missing. Offline `validateSync()` cases: bad action, missing fields, unique index declared, id is a UUID string, no `updatedAt`. | `test(server): add failing test for mongoose models` |
| L4H2-T20 | Models and Mongoose repository | `server/src/swipe/Profile.js`, `server/src/swipe/Swipe.js`, `server/src/swipe/mongoSwipeRepository.js` | Green offline. `.lean()` reads; `11000` maps to a conflict result. | `feat(server): add mongoose models and repository` |
| L4H2-T21 | Startup, seed (after Q2) | `server/src/server.js`, `server/src/swipe/seedProfiles.js`, `server/src/swipe/seed.js`, `server/package.json` | Missing `MONGODB_URI` stops with a clear error; connect has a timeout; indexes ready before listen; seed is idempotent; shutdown disconnects. | `feat(server): connect mongoose 8 and seed profiles` |
| L4H2-T22 | Gated integration test (after Q2) | `server/src/swipe/mongoSwipeRepository.integration.test.js` | Skipped when `MONGODB_URI_TEST` is unset; otherwise runs the repository against a real database and drops its test collection. | `test(server): add gated mongodb integration test` |
| L4H2-T23 | Deck hook | `src/lab4/swipe/useSwipeDeck.js` | One effect loads profiles and history with an `AbortController`; loading derived from a request key; `swipe`, `undo` and `reset` set `busy` and await the API. | `feat(swipe): add swipe deck hook with abort cleanup` |
| L4H2-T24 | Presentational parts | `src/lab4/swipe/ProfileCard.jsx`, `SwipeControls.jsx`, `ScoreBoard.jsx` and their `.module.css` (minimal) | Card shows initials, name, age, bio; buttons have `type="button"` and visible text; the scoreboard is a derived `<output>`. | `feat(swipe): add profile card, controls and scoreboard` |
| L4H2-T25 | Deck view, route, nav | `src/lab4/swipe/SwipeDeck.jsx`, `.module.css` (minimal), `src/App.jsx`, `src/shell/navItems.js`, `src/shell/navItems.test.js` | `/swipe` loads lazily; keys and pointer swipe; Backspace undoes; focus returns to the deck at the end. | `feat(swipe): add swipe deck route with keyboard and pointer input` |
| L4H2-T26 | Styles | `src/styles/tokens.css`, the `.module.css` files | Tokens only; 375 px and 320 px without horizontal scroll; focus visible; reduced motion safe. | `style(swipe): add responsive swipe deck styles` |
| L4H2-T27 | README | `README.md` | Route, API table, how to run MongoDB and the seed, checks, known limits. | `docs(readme): document homework 2 swipe deck` |
| L4H2-T28 | Evidence (author) | `docs/evidence/L4_HW2_SwipeDeck/`, `docs/prompt_logs/L4_HW2_SwipeDeck.txt` | Copied by the author. | `docs(evidence): archive homework 2 screenshots` |
| L4H2-T29 | Audit (only if a real defect reached a commit) | `AI_FAILURE_AUDIT.md` | One entry per real defect, with the fixing commit. | `docs(audit): add ai failure audit for homework 2` |

### Checks

Run from the repository root. K1 to K5 above still apply (K4 must stay empty: no connection string in `src` or `server/src`).

```sh
# S1. no deprecated Mongoose connection flags (prints nothing)
grep -rnE 'useNewUrlParser|useUnifiedTopology' server/src
# S2. no Mongoose callback API (prints nothing)
grep -rnE '\.exec\(\s*(\(|function)' server/src
# S3. no mass assignment from the request body (prints nothing)
grep -rnE 'create\(\s*req\.body|\.\.\.req\.body' server/src
# S4. the env guard lives in server.js; tests may set it (prints server.js lines only)
grep -rn 'process.env.MONGODB_URI' server/src
# S5. client effects: only the deck hook (prints the hook lines)
grep -rn 'useEffect' src/lab4/swipe
# S6. no in-place array sort and no deprecated key reads in the client swipe code (prints nothing)
grep -rnE '\.sort\(|e\.key\b|keyCode|\.which' src/lab4/swipe
```

Also: `npm test`, `npm --prefix server test`, `npm run lint` and `npm run build` pass before every non-test commit.

### What the AI can and cannot verify

- Can: unit tests (client and server), the API through the memory repository, offline Mongoose validation, lint, build, K and S checks, and a headless Chrome run of the full UI (keys, drag, buttons, undo, reload restore, 375 px and 320 px) against the API started on the memory repository from a throw-away script.
- Cannot, unless the author provides a database (Q2): the real MongoDB round trip, indexes and the seed.
- Cannot: Lighthouse, UniKey Telex behaviour of Backspace (Lab 3 audit #03 showed that UniKey sends extra Backspace events; the Undo button is the fallback and the limit goes into the README), touch gestures on a real phone, screen readers.

## Part 10. Homework 3: Full-Stack Esports Fair-Play Appeal Tribunal, Himass & TanVuu case study (slides 21 and 32)

Homework 3 here means the third of the three Lab 4 homeworks by content (slide 21; the slides print "Homework 2" and "Homework 03" on it, and slide 32 prints "Homework 4").

Goal (slide 21): dynamic player case routing at `/dossier/:playerID`, a context-driven appeal form with real-time field validation, a zero-drift SLA countdown hook `useAppealSlaTimer()` synchronised against the system clock delta, and a post-mortem `AI_FAILURE_AUDIT.md`. Code contract (slide 32): a dossier view per player, a "Disproportionality Derived Matrix" computed during render, and a countdown that re-syncs with the server on `visibilitychange`. General rules of slides 3 and 8 apply: contract first, then a failing test, then the code, then a refactor, and client and server validation must match.

### What the slides leave open, and what this Part assumes

| # | Open point | Assumption (the author can overrule it) |
| --- | --- | --- |
| A1 | "Himass" and "TanVuu" look like real handles, and the slides give no case facts. | The handles are used because the slides name them. Every number and sentence in the dossiers is invented for the exercise. The UI and the README say so, and no real incident, allegation or person is described. |
| A2 | "Disproportionality Derived Matrix" is not defined. | The standard disproportionality index: for each play mode, the share of the player's fair-play flags divided by the share of the player's matches. 1.0 is proportional. The matrix is a pure function of the dossier and is computed during render (H3-D4). |
| A3 | "Full-Stack" is in the title but the slide lists no database. | The server keeps the dossiers and the submitted appeals in memory, like the forum store. No MongoDB, no new package. A restart resets them. The repository split of Homework 2 would let a database be added later. |
| A4 | The SLA length is not given. | Himass has a 72 hour window and TanVuu 48 hours, counted from the moment the API starts (so a demo always has time left). |

### Decisions

| ID | Question | Decision |
| --- | --- | --- |
| H3-D1 | Where | Client `src/lab4/appeal/`. Routes `/dossier` (a layout with the list of cases and an `<Outlet />`) and `/dossier/:playerID` (the detail). Nav label "L4 HW3 Appeal Tribunal" pointing at `/dossier`. Server code in `server/src/appeal/`, mounted in the existing `createApp`. |
| H3-D2 | What is reused from earlier labs | Lab 1 `countdown.js`: the `getRemaining` shape (`totalMs`, days, hours, minutes, seconds, never negative), recomputing from the clock on every tick, a self-correcting `setTimeout` that targets the next second boundary, no `setInterval`, `visibilitychange` and `pageshow` re-sync, and an idempotent `stop()`. It is rebuilt as an injectable store so it can be tested with fake timers. Lab 4 context form: `FormContext`, derived `validateForm`, `isErrorVisible`, `flushSync` plus focus on the first invalid field. Lab 4 master-detail: `PeopleLayout` and `PersonDetail` (untrusted `useParams`, 404 with `role="alert"`, `dl`). `useForumMessages` and `forumApi`: one `AbortController` per request, injectable `fetchImpl`, `{ error }` bodies. Homework 2: validator parity test, optional repository in `createApp`, UUID check, fixed error messages. |
| H3-D3 | Data | Two frozen sample dossiers on the server (`server/src/appeal/dossierData.js`): `himass` and `tanvuu` with team, case id, a one-line summary, and per play mode (`solo`, `duo`, `squad`) the number of matches and of fair-play flags. All invented (A1). The client never contains dossier data: it asks the API. |
| H3-D4 | Disproportionality matrix | `computeMatrix(rows)` in `src/lab4/appeal/disproportionality.js`. A row is `{ id, label, exposure, events }` (matches and flags). Per row: `exposureShare`, `eventShare`, `index = (events * totalExposure) / (exposure * totalEvents)` computed from integers (no rounding drift), and a `verdict`: `over` when `index > 1.25`, `under` when `index < 0.8`, `proportional` otherwise, and `insufficient` when the row has no matches, or the total number of flags is below 5. Inputs that are not non-negative integers throw `TypeError`. Display rounding happens only in the component. |
| H3-D5 | Routing | One dynamic route replaces the two hard-coded routes of slide 32. `useParams().playerID` is untrusted: it is checked against `/^[a-z0-9-]{1,32}$/` before it goes into a URL, and an id the server does not know shows `404: Dossier Not Found` with `role="alert"`. The list in `/dossier` comes from `GET /api/dossiers`. |
| H3-D6 | Appeal form | Context-driven like the Lab 4 form, with its own context in this folder. Fields: `contactEmail` (email), `category` (a `select` with stable values `false-positive`, `missing-context`, `procedural-error`), `statement` (a `textarea`, 50 to 1000 characters after trimming, with a live counter) and `confirmed` (a checkbox that must be checked). The player and the case come from the route and never from a field. Errors are derived in render by `validateAppeal(values)`, shown once a field was left or a submit was tried, and update on every keystroke after that (real-time). No effect, no stored errors. |
| H3-D7 | SLA clock | The server is the authority for both the deadline and the time. `GET /api/dossiers/:playerId` returns `deadlineAt` and `serverNow`; `GET /api/time` returns `{ now }`. The client estimates the offset `serverNow - (sentAt + receivedAt) / 2` (the round-trip midpoint) and always shows `deadline - (Date.now() + offset)`, so a wrong local clock changes nothing. A tick never decrements a counter. `createSlaClock` is an external store (`subscribe`, `getSnapshot`, `resync`, with injectable `now`, timers, visibility target and `fetchServerTime`); `useAppealSlaTimer` reads it with `useSyncExternalStore`, which gives cleanup, no `setState` in an effect body, and no tearing. Re-sync happens at start, on `visibilitychange` to visible, and on `pageshow` from the back-forward cache. A failed re-sync keeps the old offset and sets `syncError`; a stale response (the clock was disposed or the page hidden again) is ignored. At zero the store stops scheduling. |
| H3-D8 | API | `GET /api/dossiers` returns `[{ playerId, handle, caseId }]`. `GET /api/dossiers/:playerId` returns the dossier, `deadlineAt`, `serverNow` and `appeal` (`null` or the receipt). `GET /api/time` returns `{ now }`. `POST /api/dossiers/:playerId/appeal` with `{ contactEmail, category, statement, confirmed }` returns `201` with `{ id, playerId, caseId, submittedAt }`, `400` for an invalid body, `404` for an unknown player, `409` when that case already has an appeal, and `409` when the window is closed (checked with the server clock, so the countdown is only information). |
| H3-D9 | Validation and errors | One rule set on both sides with a parity test, as in Homework 2. The server copies only the four fields out of the body, never echoes the statement, and answers with fixed messages: `400`, `404`, `409`, or `500 { error: 'Internal server error' }`. `playerId` is checked against the same slug pattern before a lookup. |
| H3-D10 | Accessibility (WCAG 2.2 AA) | The countdown has `role="timer"` (not live, so a screen reader is not flooded every second) and a `<time datetime>` with the deadline. The expiry, a successful appeal and every failure are announced once in `<output role="status" aria-live="polite">` or `role="alert"`. The matrix is a real `<table>` with a `caption` and `th scope`. Each field has a visible label and `aria-describedby` to its error. After a failed submit focus moves to the first invalid field in the handler. No colour-only meaning: a verdict is also written as text. 375 px and 320 px without horizontal scroll. |
| H3-D11 | Language and sample data | Interface text in English. A visible notice says the dossiers are invented sample data. |
| H3-D12 | Git | One commit per task row below, in row order, on branch `lab4`. The `test(...)` rows are expected red for their own module only; build and lint stay green. T23 follows the author-only rules. |
| H3-D13 | Post-mortem audit | Slide 21 asks for a complete `AI_FAILURE_AUDIT.md`. The file holds only real defects (rule 12 of Lab 3 and the header of the file). Entries are added only when a test, a browser run or the author's own observation shows a real defect that reached a commit. If there are fewer than the slide's expectation, the final report says what testing is missing; no defect is invented. |

### Deviations from the slide 21 and 32 snippets (each is covered by a test or a check)

| Slide snippet | Problem | Fix |
| --- | --- | --- |
| `<Route path="/dossier/himass" ...>` and `<Route path="/dossier/tanvuu" ...>` with `<DossierView user="Himass" />` | Contradicts slide 21 (`/dossier/:playerID`); a third player needs a code change; the user is a prop, not a lookup | One `:playerID` route, an untrusted-parameter check and a server lookup with a 404 state |
| `useMemo(() => computeMatrix(dossierData), [dossierData])` | Memoises a computation over three rows; Lab 3 rule: derived values are computed in render | Plain call during render of a pure function |
| `document.addEventListener('visibilitychange', ...)` in the hook | Never removed (leak on every mount); `resyncTimerWithServer` is not defined; waking the tab alone does not change what a throttled timer already scheduled | The listener is added in `subscribe` and removed in its cleanup; a re-sync recomputes from the clock and re-aims the timer |
| "Recalculates remaining time against absolute system clock timestamps" | A client clock that is wrong makes the countdown wrong for everyone | Server time and an offset (H3-D7) |
| `computeMatrix` and "dossierData" | Not defined anywhere | H3-D4 |
| Countdown as a decrementing number | Drifts, and pauses in a background tab | Recompute from `Date.now() + offset` on every tick (the Lab 1 rule) |

### Tasks

| ID | Task | Files | Done when | Commit |
| --- | --- | --- | --- | --- |
| L4H3-T01 | Add this Part | `TASK_DECOMPOSITION.md` | Part 10 present. | `docs(spec): add lab 4 homework 3 plan` |
| L4H3-T02 | Contracts | `src/lab4/appeal/appeal.contract.js`, `server/src/appeal/appeal.contract.js` | Typedefs `Dossier`, `DossierSummary`, `ModeStat`, `AppealInput`, `AppealReceipt`, `MatrixRow`, `SlaSnapshot`, `AppealStore`. | `feat(appeal): add appeal contracts` |
| L4H3-T03 | Fail test: matrix | `src/lab4/appeal/disproportionality.test.js` | Fails: module missing. | `test(appeal): add failing test for disproportionality matrix` |
| L4H3-T04 | `computeMatrix` | `src/lab4/appeal/disproportionality.js` | Green. Shares, exact index, edges 1.25 and 0.8, `insufficient` cases, bad input throws, input not mutated, result frozen. | `feat(appeal): add disproportionality matrix` |
| L4H3-T05 | Fail test: clock maths | `src/lab4/appeal/slaClock.test.js` | Fails: module missing. | `test(appeal): add failing test for sla clock maths` |
| L4H3-T06 | `clockOffset`, `getSlaRemaining`, `msUntilNextSecond`, `formatRemaining` | `src/lab4/appeal/slaClock.js` | Green. Midpoint offset; never negative; day, hour, minute, second split; next-second delay in 1 to 1000 ms. | `feat(appeal): add sla clock maths` |
| L4H3-T07 | Fail test: clock store | `src/lab4/appeal/createSlaClock.test.js` | Fails: module missing. Uses `node:test` fake timers. Cases: ticks on second boundaries, no drift after a 5 minute freeze, a clock offset of plus and minus 1 hour, re-sync on visible, ignore a stale response, failed re-sync keeps the offset, stops at zero, `dispose` removes every listener and timer, the snapshot is stable between ticks. | `test(appeal): add failing test for sla clock store` |
| L4H3-T08 | `createSlaClock` | `src/lab4/appeal/createSlaClock.js` | Green. | `feat(appeal): add zero-drift sla clock store` |
| L4H3-T09 | Fail test: form validation | `src/lab4/appeal/validateAppeal.test.js` | Fails: module missing. | `test(appeal): add failing test for appeal validation` |
| L4H3-T10 | `validateAppeal`, `isAppealValid`, constants | `src/lab4/appeal/validateAppeal.js` | Green. Email, category whitelist, statement 50 to 1000 after trim, `confirmed` must be `true`, only invalid fields have a key. | `feat(appeal): add appeal validation` |
| L4H3-T11 | Fail test: API client | `src/lab4/appeal/dossierApi.test.js` | Fails: module missing. | `test(appeal): add failing test for dossier api client` |
| L4H3-T12 | API client | `src/lab4/appeal/dossierApi.js` | Green with a fake `fetchImpl`: URLs, id check before any request, body is the four fields, status mapping, timing of the offset, abort not swallowed. | `feat(appeal): add dossier api client` |
| L4H3-T13 | Fail test: server validation and parity | `server/src/appeal/validateAppeal.test.js` | Fails: module missing. | `test(server): add failing test for appeal validation parity` |
| L4H3-T14 | Server validator | `server/src/appeal/validateAppeal.js` | Green; the same case table gives the same verdicts and messages as the client validator. | `feat(server): add appeal validation` |
| L4H3-T15 | Fail tests: store and routes | `server/src/appeal/appealStore.test.js`, `server/src/appeal/appealRoutes.test.js` | Fail: modules missing. Cases: list, detail, 404, unknown and malformed ids, 201, 400, 409 duplicate, 409 closed window (with an injected clock), the statement is never echoed, forged fields dropped, `serverNow` and `deadlineAt` come from the injected clock, 500 leaks nothing, the forum still works. | `test(server): add failing tests for appeal api` |
| L4H3-T16 | Sample data, store, routes, mount | `server/src/appeal/dossierData.js`, `server/src/appeal/appealStore.js`, `server/src/appeal/appealRoutes.js`, `server/src/app.js`, `server/src/server.js` | Green. `appealStore` is an optional option of `createApp`; `server.js` passes it. | `feat(server): add appeal api with in-memory store` |
| L4H3-T17 | Hooks | `src/lab4/appeal/useAppealSlaTimer.js`, `src/lab4/appeal/useDossier.js` | `useAppealSlaTimer` reads the store with `useSyncExternalStore`; `useDossier` loads with an `AbortController` and derives loading from a request key. | `feat(appeal): add sla timer and dossier hooks` |
| L4H3-T18 | Appeal form | `src/lab4/appeal/AppealContext.js`, `AppealField.jsx`, `AppealForm.jsx` and their `.module.css` (minimal) | Labels, errors, counter, focus on the first invalid field, submit blocked after the window closes, receipt shown. | `feat(appeal): add context-driven appeal form` |
| L4H3-T19 | Matrix and countdown views | `src/lab4/appeal/DisproportionalityMatrix.jsx`, `SlaCountdown.jsx` and their `.module.css` (minimal) | A captioned table with `th scope`; a `role="timer"` with `<time>`. | `feat(appeal): add matrix table and sla countdown` |
| L4H3-T20 | Layout, detail, routes, nav | `src/lab4/appeal/DossierLayout.jsx`, `DossierView.jsx`, `.module.css`, `src/App.jsx`, `src/shell/navItems.js`, `src/shell/navItems.test.js` | `/dossier` and `/dossier/:playerID` load lazily; unknown ids give the 404 state. | `feat(appeal): add dossier routes with appeal form and sla timer` |
| L4H3-T21 | Styles | `src/styles/tokens.css`, the `.module.css` files | Tokens only; 375 px and 320 px without horizontal scroll; focus visible; reduced motion safe. | `style(appeal): add responsive appeal tribunal styles` |
| L4H3-T22 | README | `README.md` | Routes, API table, the SLA design, checks, known limits. | `docs(readme): document homework 3 appeal tribunal` |
| L4H3-T23 | Evidence (author) | `docs/evidence/L4_HW3_AppealTribunal/`, `docs/prompt_logs/L4_HW3_AppealTribunal.txt` | Copied by the author. | `docs(evidence): archive homework 3 screenshots` |
| L4H3-T24 | Audit (only if a real defect reached a commit) | `AI_FAILURE_AUDIT.md` | One entry per real defect, with the fixing commit. | `docs(audit): add ai failure audit for homework 3` |

### Checks

Run from the repository root. K1 to K5 above still apply.

```sh
# C1. no setInterval anywhere in the appeal code (prints nothing)
grep -rn 'setInterval' src/lab4/appeal
# C2. the clock is read in one module only (prints lines of createSlaClock.js and the tests)
grep -rn 'Date\.now' src/lab4/appeal
# C3. effects only in useDossier.js (prints the import and the one call there)
grep -rn 'useEffect' src/lab4/appeal
# C4. the visibilitychange listener is added and removed in the same module (prints 2 lines)
grep -rn 'visibilitychange' src/lab4/appeal --include='*.js' --exclude='*.test.js'
# C5. no memo for the matrix and no timer started in a component (prints nothing)
grep -rnE 'useMemo|setTimeout' src/lab4/appeal --include='*.jsx'
# C6. no deprecated key reads or in-place sorts (prints nothing)
grep -rnE '\.sort\(|e\.key\b|keyCode' src/lab4/appeal
# C7. the statement is never logged or echoed by the server (prints nothing)
grep -rnE 'console\.|statement' server/src/appeal --include='*.js' --exclude='*.test.js' --exclude='validateAppeal.js' --exclude='appeal.contract.js'
```

Also: `npm test`, `npm --prefix server test`, `npm run lint` and `npm run build` pass before every non-test commit.

### What the AI can and cannot verify

- Can: unit tests (client and server), the API through the in-memory store with an injected clock, fake-timer tests of the clock store, lint, build, the C and K checks, and a headless Chrome run of the UI: routes and 404, the matrix, form validation, a successful appeal, a duplicate, a window closed with a short injected deadline, a client clock skewed by one hour (the countdown must still follow the server), a frozen and resumed page (CDP lifecycle), and 375 px and 320 px.
- Cannot: a real background tab throttled by a desktop browser for minutes (headless Chrome is not throttled the same way), Lighthouse, a real phone or a screen reader, and anything about real players or real cases (the data is invented).
