# Project Architectural Constraints (Lab 4)

This file is the project constitution for Lab 4. Read it fully before proposing or making any change. Lab 4 is built on the Lab 3 code base. The Lab 3 rules are kept in `docs/lab3/project-rules.md`. Sections 2, 3, 5, 6, 7, 8, 9, 11, 12 and 13 of that file still apply unchanged. This file lists what Lab 4 adds or changes, and wins on any conflict.

## 1. Stack
- Client: React 19 + Vite + ES2024. JavaScript with JSX. JSDoc typedefs for contracts. No TypeScript.
- Approved client dependencies: those of Lab 3, plus `react-router` 7.x. Import router APIs from `'react-router'`.
- Server: `server/` is a separate npm package with `express` and `cors` only. Node 22 or later, ES modules.
- Adding any other package or tool requires the user's approval first.
- Commands: `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`, `npm test` (client). `npm run server` (starts the API), `npm --prefix server test` (server tests).

## 2. Banned legacy patterns (in addition to Lab 3 section 2)
- React Router v5 APIs: `<Switch>`, `<Redirect>`, `exact`, `component={...}`, `render={...}`, `activeClassName`, `withRouter`, `useHistory`.
- `react-media`, `typeface-roboto`, `@material-ui/*`, `Component.defaultProps`.
- Form validation in `useEffect`, and any chain of effects that copies state between parent and child.
- Async fetches without an `AbortController` cleanup, and `didCancel` boolean flags.
- Hard-coded connection strings, secrets or ports in source. Read them from `process.env`.
- Mongoose callback APIs (`.exec((err, doc) => ...)`). Use `async`/`await` if Mongoose is added later.

## 3. Routing
- `<BrowserRouter>` wraps the app in `main.jsx`. Routes are declared with `<Routes>` and `<Route element={...}>`.
- Shared layouts render child routes through `<Outlet />`. Navigation uses `<NavLink>` with the `className={({ isActive }) => ...}` callback. `NavLink` sets `aria-current="page"`; do not set it by hand.
- Route parameters are read with `useParams()` and treated as untrusted input: look the entity up, and render an explicit 404 state with `role="alert"` when it does not exist.
- Every unknown path is caught by a `path="*"` route.
- Route-level views are loaded with `React.lazy` behind a `<Suspense>` whose fallback is a dimension-matched `ViewSkeleton` (`aria-busy="true"`, `aria-live="polite"`).

## 4. Forms
- Validation is synchronous and derived during render from the current values (`validateForm(values)` in a pure module). Never store errors or validity in state, and never compute them in an effect.
- Form state lives in the form component and is shared through `FormContext`. Fields read their value and error from `useFormContext()` by `name`.
- Every input has a visible `<label htmlFor={id}>` with the id from `useId()`. An invalid field has `aria-invalid="true"` and `aria-describedby` pointing at its error text.
- Lab 3 section 4 still applies (numbers with `valueAsNumber`, status in `<output>`).

## 5. Data fetching
- Every request started in an effect gets its own `AbortController`. The cleanup calls `controller.abort()`. `AbortError` is a normal outcome, not an error state.
- After an `await`, check `signal.aborted` before setting state.
- Never call `setState` synchronously in an effect body. Derive loading from what has been loaded.
- Network code lives in a pure helper with an injectable `fetchImpl`, tested with `node --test`.

## 6. Server
- `cors({ origin })` with the allowed origin from `process.env.CLIENT_ORIGIN`. `express.json()` with a small body limit.
- Validate every `POST` body before use. Copy only the allowed fields; never spread `req.body` into a stored record.
- New ids come from `crypto.randomUUID()`. Responses use correct status codes: 200, 201, 400, 404.
- `.env` is never committed. `.env.example` lists every variable with a safe example value.

## 7. Semantic HTML
- Lab 3 section 3 applies to all of `src/`: no `div` anywhere in `src/`. Slide snippets that use `div` are rewritten with `section`, `p`, lists, `dl` or `Fragment`.

## 8. Git workflow and commits
- Lab 3 section 10 applies: one task, one atomic commit, Conventional Commits, explicit paths, never `git add .`, never push, amend, rebase or force without the user.
- The slide 8 loop is visible in git. For pure logic, a `test(...)` commit adds the failing test first; only that module's tests may be red, and build and lint must pass. The next `feat(...)` commit makes it green.
- All other commits require `npm run build`, `npm run lint` and `npm test` to pass (and `npm --prefix server test` for server changes). The Lab 3 lint warning in `PubgMatchTelemetry.jsx` is known and pre-dates Lab 4.

## 9. Repository layout
- Root: `project-rules.md`, `TASK_DECOMPOSITION.md`, `AI_FAILURE_AUDIT.md` (only once a real AI defect exists), `.env.example`, `Agent.md`, `README.md` and the Vite config.
- `src/` keeps the Lab 3 folders. Lab 4 code lives in `src/lab4/<feature>/` (`people`, `form`, `forum`). Shell code (layout, navigation, skeleton, 404) lives in `src/shell/`.
- `server/` holds the API package. `docs/lab3/` holds the frozen Lab 3 documents.
- Evidence goes in `docs/evidence/L4_<Folder>/` and prompt logs in `docs/prompt_logs/L4_<Folder>.txt`, added only by the author in `docs(evidence)` commits.
