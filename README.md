# Lab 4: Multi-Route SPA, Context Form Engine & Full-Stack React 19

Lab 4 is built on the Lab 3 code base, on the `lab4` branch. Lab 3 is frozen at the tag `lab3-final`; its README, rules, WBS and AI audit are in `docs/lab3/`.

Project rules are in `Agent.md` and `project-rules.md`. `TASK_DECOMPOSITION.md` is the work breakdown, one Part per exercise, in slide order.

## Setup

```sh
npm install                  # client
npm install --prefix server  # API server
cp .env.example .env         # PowerShell: Copy-Item .env.example .env
```

`.env` is git-ignored. It holds `PORT` (API port, 3001) and `CLIENT_ORIGIN` (the origin CORS allows, http://localhost:5173).

## Commands

| Command | What it does | URL |
| --- | --- | --- |
| `npm run dev` | Vite dev server; `/api` is proxied to the API | http://localhost:5173/ |
| `npm run server` | Express API (needs `.env`), run in a second terminal | http://localhost:3001/api/channels/nasa/messages |
| `npm run build` | Production bundle into `dist/` | n/a |
| `npm run preview` | Serve the bundle (for Lighthouse); `/api` is proxied too | http://localhost:4173/ |
| `npm run lint` | `oxlint` (client and server) | n/a |
| `npm test` | Client unit tests (`node --test "src/**/*.test.js"`) | n/a |
| `npm run test:server` | API tests: validation, status codes, CORS | n/a |

## Routes

| Path | View | Exercise |
| --- | --- | --- |
| `/` | Lab 3 Exercises 1 to 3 (eager) | Lab 3 |
| `/hw1`, `/hw2`, `/hw3`, `/bonus` | Lab 3 homework views (each a lazy chunk) | 1.1, 1.2 |
| `/people` | `PeopleLayout`: pioneer list + `<Outlet />` | 1.2.1, 1.2.2 |
| `/people/:id` | `PersonDetail` (lazy): `useParams`, 404, `dl` | 1.1, 1.2.2 |
| `/form` | `SimpleForm` context form engine + `ShowData` | 1.3 |
| `/forum` | Redirects to `/forum/nasa` | 1.7.1 |
| `/forum/:channelId` | `ForumBoard`: `nasa`, `esports-tribunal`, `notNasa` | 1.7.1 |
| `*` | `NotFoundPage` | 1.2 |

Old Lab 3 hash links (`#hw1`) are not redirected: use `/hw1`.

## Exercises

### 1.1 Code-splitting with React.lazy and Suspense (slide 9)

- `lazyNamed(loader, name)` (`src/shell/lazyNamed.js`) wraps `React.lazy` for named exports. `PersonDetail` uses plain `React.lazy` with a default export, as on the slide.
- One `<Suspense>` boundary around the layout `<Outlet />` and one inside `PeopleLayout` for the detail.
- `ViewSkeleton` has a fixed `min-block-size` from tokens (`view` 32rem, `detail` 14rem), `aria-busy="true"` and `aria-live="polite"`, and no animation under `prefers-reduced-motion`.
- With React Router navigations run in a transition, so a link click keeps the old page until the chunk arrives. The skeleton shows on a direct load or reload of a lazy URL.

### 1.2 and 1.2.1 React Router v7 and layout routes (slide 10)

- `<BrowserRouter>` in `main.jsx`; `<Routes>`, `<Route element>` in `App.jsx`; the hash shell (`useHashView`, `resolveView`) is removed.
- `AppLayout` keeps `SiteHeader` mounted and renders children in `<Outlet />`. `NavLink` uses `className={({ isActive }) => ...}` and sets `aria-current="page"`; the home link has `end`.

### 1.2.2 Master-detail directory, Sprint 1 (slides 11, 12, 22)

- Data: the Lab 3 `SMART_PEOPLE`. The detail shows Name, Age and IQ (the data has no `role`).
- `findPersonById` treats the URL id as untrusted: exact match, non-string ids give `null`, which renders `role="alert"` "404: Person Not Found".
- Grid `minmax(280px, 1fr) 2fr` from 48rem; one column below, so no horizontal scroll at 375px.

### 1.3 Synchronous context form engine, Sprint 2 (slides 13, 14, 15, 23, 24)

- State holds only raw inputs (`values`, `touched`, `submitAttempted`, `submitted`). `validateForm(values)` runs during render: errors and validity are never stored and no effect hook exists in `src/lab4/form/`.
- `FormContext` + `useFormContext()` (throws outside a provider). `InputField` reads its value and error by `name`, binds `<label htmlFor>` with `useId()`, sets `aria-invalid` and `aria-describedby`.
- Errors show after a field is left or after a submit. An invalid submit focuses the first invalid field. A valid submit renders `ShowData` as `dl/dt/dd`.
- Field rules (proposal D6): name 2 to 60 characters, email `local@domain.tld`, age whole number 16 to 120.

### 1.7.1 Data fetching and Express hygiene, Sprint 3 (slides 16, 17, 25, 26)

- API contract (decision D7, slide 16 path): `GET` and `POST /api/channels/:channelId/messages`. Unknown channel 404, bad body 400 (malformed JSON included), created 201 with `crypto.randomUUID()` and a server timestamp. Only `author` and `text` are copied from the body.
- `cors({ origin: CLIENT_ORIGIN })`, `express.json({ limit: '10kb' })`, config only from `process.env`; the server stops with a clear error when `.env` is missing.
- `useForumMessages(channelId)`: one `AbortController` per request, `controller.abort()` in the cleanup, `signal.aborted` checks after `await`, loading derived from the request key, `postMessage` refetches.
- `ForumBoard`: channel `NavLink`s, messages in `<dl>` with `<Fragment key={msg.id}>`, post form with labels. The form is `noValidate` so the server's 400 message can be shown.

## Checks

Each command must print nothing (Git Bash, from the repository root):

```sh
grep -rn '<div' src --include='*.jsx'                                                         # K1
grep -rnE '<Switch|<Redirect|activeClassName|component=\{|<Route[^>]*\bexact\b|withRouter|useHistory' src  # K2
grep -rn 'useEffect' src/lab4/form                                                             # K3
grep -rnE 'mongodb(\+srv)?://' src server/src                                                  # K4
grep -rn 'http://' src --include='*.js' --include='*.jsx' --include='*.css'                    # K5
```

## Known limits

- Messages are kept in memory: restarting the API resets them to the sample data. No MongoDB is used in the exercises.
- `oxlint` reports one warning in the Lab 3 `PubgMatchTelemetry.jsx` (`set-state-in-effect`). It pre-dates Lab 4 and is left unchanged.
- The Lab 3 `DeveloperCard` still shows `commits: 144`, the value of `lab3-final`.
- Not verified by the AI: Lighthouse scores, CLS, render counts, the Slow 3G abort behaviour and 375px layout. They are checked by the author in the browser.
- Homework (slides 19 to 21) is not part of this branch yet.
