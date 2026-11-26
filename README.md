# Lab 4: Multi-Route SPA, Context Form Engine & Full-Stack React 19

Lab 4 is built on the Lab 3 code base, on the `lab4` branch. Lab 3 is frozen at the tag `lab3-final`; its README, rules, WBS and AI audit are in `docs/lab3/`.

Project rules are in `Agent.md` and `project-rules.md`. `TASK_DECOMPOSITION.md` is the work breakdown, one Part per exercise, in slide order.

## Setup

```sh
npm install                  # client
npm install --prefix server  # API server
cp .env.example .env         # PowerShell: Copy-Item .env.example .env
```

`.env` is git-ignored. It holds `PORT` (API port, 3001), `CLIENT_ORIGIN` (the origin CORS allows, http://localhost:5173) and `MONGODB_URI` (the swipe deck database, see Homework 2). `npm run server` stops with a clear error when any of the three is missing.

## Commands

| Command | What it does | URL |
| --- | --- | --- |
| `npm run dev` | Vite dev server; `/api` is proxied to the API | http://localhost:5173/ |
| `npm run server` | Express API (needs `.env` and a reachable MongoDB), run in a second terminal | http://localhost:3001/api/channels/nasa/messages |
| `npm --prefix server run seed` | Upserts the 8 sample swipe profiles (safe to run twice) | n/a |
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
| `/gallery` | `PhotoGalleryLayout` (lazy): `?category=` filter and `?photoId=` lightbox | HW1 |
| `/swipe` | `SwipeDeck` (lazy): card deck with keys, drag, buttons, undo and a saved history | HW2 |
| `/dossier` | `DossierLayout`: the case list from the API + `<Outlet />` | HW3 |
| `/dossier/:playerID` | `DossierView` (lazy): SLA countdown, disproportionality matrix, appeal form | HW3 |
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

## Homework 1: Photo & Evidence Gallery (slides 19 and 29)

Plan and decisions: `TASK_DECOMPOSITION.md`, Part 8. The slides number the three homeworks inconsistently; here HW1 is the gallery, HW2 the swipe deck and HW3 the appeal tribunal (HW1 and HW2 are done).

- URL is the state. `/gallery?category=replays&photoId=ph-5` shows the Replays filter with the lightbox open on `ph-5`. Both parameters are untrusted: an unknown `category` falls back to `all`; an unknown `photoId` keeps the dialog closed and renders `role="alert"` "404: Photo Not Found" with a link back.
- Lightbox: native `<dialog>` opened with `showModal()` (focus trap, inert page, Escape, backdrop). One effect keeps the dialog in step with the URL and nothing else; focus returns to the opening link from the dialog's `close` handler.
- Closing removes only `photoId`, so the category survives. Slide 29 uses `setSearchParams({})`, which would also drop the filter. Opening pushes a history entry (Back closes the lightbox); closing replaces it.
- Thumbnails are links (the visible title is their name, `alt=""`); the lightbox image carries the full `alt`. The filter is a `fieldset` of labelled radios; the result count is an `<output role="status">`.
- Data and images are sample data written for the exercise (`src/lab4/gallery/photos.js`, `public/gallery/*.svg`), not real evidence.
- Pure modules with tests: `photos.js`, `galleryParams.js` (`parseGalleryParams`, `updateGalleryParams`, `toSearchString`), `selectPhotos.js`.

## Homework 2: Card-Swipe Deck (slides 20, 30 and 31)

Plan and decisions: `TASK_DECOMPOSITION.md`, Part 9 (it also lists where the slide snippets were not followed and why).

Run it (the forum and the deck now both need MongoDB):

```sh
docker run -d --name lab4-mongo -p 127.0.0.1:27017:27017 mongo:8   # or use a MongoDB Atlas URI in .env
npm --prefix server run seed                                      # 8 invented profiles, safe to repeat
npm run server                                                    # terminal 1
npm run dev                                                       # terminal 2, open /swipe
```

- Keys (read with `e.code`, a held key is ignored): Right arrow likes (+10), Left arrow passes (-5), Up arrow super likes (+25), Backspace undoes the newest swipe. Drag right, left or up by more than 50 px does the same; a short, diagonal or downward drag does nothing. Every action also has a button, so dragging is never the only way (WCAG 2.5.7). The result of each action is announced in one `<output role="status">`.
- The score is derived from the history with an explicit table (`SCORE_BY_ACTION`); an unknown action throws. The slide's `else -5` would score a super like as a pass.
- Undo is a LIFO stack on both sides: `popSwipe` on the client, `DELETE /api/swipe/last` on the server, which removes only the newest swipe of that player.
- Persistence is pessimistic: an action sets `busy`, waits for the server and then updates the list from the returned record. Reloading restores the deck, the score and the current card.
- The player is an anonymous UUID kept in `localStorage` (`lab4.swipe.playerId`). There is no login: anyone who knows an id can read or clear that player's swipes.
- Client and server share one validation rule set; a parity test feeds the same cases to both. The server copies only `playerId`, `profileId` and `action` out of the body (the slide's `Swipe.create(req.body)` would store forged fields) and answers errors with fixed messages.
- Routes talk to a repository: an in-memory one (API tests) and a Mongoose 8 one. `createApp` mounts the swipe routes only when it is given a repository.

Differences from the plan, found while building it:

- The current card is the first profile the player has not swiped (not `profiles[history.length]`), so a history written out of order by a direct API call cannot show a card that was already swiped.
- Unavailable buttons use `aria-disabled` instead of `disabled`, so a button that has focus keeps it after the last card or the last undo. This replaces the plan's "move focus to the deck at the end".

| Method and path | Success | Errors |
| --- | --- | --- |
| `GET /api/profiles` | `200` the deck in order, `[{ id, name, age, bio }]` | `500` |
| `GET /api/swipe?playerId=` | `200` that player's swipes, oldest first | `400` bad `playerId` |
| `POST /api/swipe` `{ playerId, profileId, action }` | `201` the saved record | `400` invalid body, `404` unknown profile, `409` already swiped |
| `DELETE /api/swipe/last?playerId=` | `200` the removed record | `400`, `404` nothing to undo |
| `DELETE /api/swipe?playerId=` | `204` | `400` |

Tests: `npm test` covers the pure modules (`swipeRules`, `swipeHistory`, `swipeInput`, `validateSwipe`, `playerId`, `swipeApi`). `npm run test:server` covers the validator parity, the in-memory repository, every route and the Mongoose schemas (validated offline). `server/src/swipe/mongoSwipeRepository.integration.test.js` talks to a real MongoDB and is skipped unless `MONGODB_URI_TEST` is set; the database name must end with `-test` because the test empties its collections.

## Homework 3: Fair-Play Appeal Tribunal (slides 21 and 32)

Plan and decisions: `TASK_DECOMPOSITION.md`, Part 10. It lists the assumptions (A1 to A4) and where the slide snippets were not followed and why.

Run it (the API still starts only with a reachable MongoDB, because of Homework 2; the appeal store itself is in memory):

```sh
npm run server   # terminal 1
npm run dev      # terminal 2, open /dossier
```

All players, cases, match counts and flag counts are **invented sample data** (`server/src/appeal/dossierData.js`). The handles Himass and TanVuu come from the slides only as names; nothing describes a real person or a real incident, and the page says so.

- Countdown: the server decides the deadline and the time. The window of each case (72 h Himass, 48 h TanVuu) is counted from the moment the API starts. The client estimates `offset = serverNow - (sentAt + receivedAt) / 2` and shows `deadline - (Date.now() + offset)`, so a wrong clock on the device does not change the countdown. The value is recomputed from the clock on every tick and never decremented; one self-correcting `setTimeout` is aimed at the moment the displayed second changes (no `setInterval`). A hidden page schedules nothing; when it is visible again (`visibilitychange`, or `pageshow` from the back-forward cache) the value is recomputed and the offset is re-synced with `GET /api/time`. A failed re-sync keeps the old offset and says so; a stale answer is ignored. At zero the clock stops and the form is replaced by a closed message. The server enforces the window too (`409`).
- The clock is an external store (`createSlaClock`, injectable clock, timers and visibility target) read with `useSyncExternalStore`. It attaches and removes its own listeners when React subscribes and unsubscribes, so StrictMode is safe. The timer element is not a live region (a screen reader would announce every second); only "closed" and "could not re-sync" are announced.
- Matrix: per play mode, `index = (flags * totalMatches) / (matches * totalFlags)`, computed from integers. Over-flagged above 1.25, under-flagged below 0.8, otherwise proportional; "not enough data" when a mode has no matches or there are fewer than 5 flags in total. The verdict is text, never colour alone. This definition is the author's reading of the slide, not a standard (A2).
- Form (the Lab 4 context pattern): email, a reason (`select`), a statement of 50 to 1000 characters after trimming with a live counter, and a confirmation checkbox. Errors are derived during render and shown after a field is left or a submit is tried; a failed submit moves focus to the first invalid field. Client and server share one rule set and a parity test feeds both the same 39 cases. The server copies only the four known fields, drops the statement and the email after validation, and never sends either back.
- Case routes are one dynamic route. The `:playerID` parameter is untrusted: a value that is not a lower-case slug shows "Case not found" without any request, and the server answers a malformed id like an unknown one.

| Method and path | Success | Errors |
| --- | --- | --- |
| `GET /api/time` | `200` `{ now }`, never cached | none |
| `GET /api/dossiers` | `200` `[{ playerId, handle, caseId }]` | `500` |
| `GET /api/dossiers/:playerId` | `200` the case with `deadlineAt`, `serverNow` and `appeal` (`null` or the receipt) | `404` unknown or malformed id |
| `POST /api/dossiers/:playerId/appeal` `{ contactEmail, category, statement, confirmed }` | `201` `{ id, playerId, caseId, submittedAt }` | `400` invalid body, `404` unknown case, `409` already appealed or window closed |

Tests: `npm test` covers the matrix, the clock maths, the clock store (fake timers: ticks on the boundary, a five minute freeze, a client clock one hour off, re-sync, stale answers, stopping at zero, listener clean-up), validation and the API client. `npm run test:server` covers the validator parity, the store with an injected clock (the window closes exactly at the deadline) and every route.

## Checks

Run from the repository root in Git Bash. K1 to K5 and G3 must print nothing; G1 prints one line and G2 two lines, all in `src/lab4/gallery/`:

```sh
grep -rn '<div' src --include='*.jsx'                                                         # K1
grep -rnE '<Switch|<Redirect|activeClassName|component=\{|<Route[^>]*\bexact\b|withRouter|useHistory' src  # K2
grep -rn 'useEffect' src/lab4/form                                                             # K3
grep -rnE 'mongodb(\+srv)?://' src server/src                                                  # K4
grep -rn 'http://' src --include='*.js' --include='*.jsx' --include='*.css'                    # K5
grep -rn 'showModal' src --include='*.jsx'                                                     # G1: one line
grep -rn 'useSearchParams' src --include='*.jsx' --include='*.js'                              # G2: import + call, gallery only
grep -rn 'setSearchParams({})' src                                                             # G3: nothing
```

Homework 2 checks, same shell. S1, S2, S3 and S6 must print nothing. S4 prints the `server.js` guard and connect lines, the same two lines in `seed.js` (the seed script has its own guard) and the integration test's `MONGODB_URI_TEST`. S5 prints the import and the one `useEffect` of the deck hook:

```sh
grep -rnE 'useNewUrlParser|useUnifiedTopology' server/src      # S1
grep -rnE '\.exec\(\s*(\(|function)' server/src                # S2
grep -rnE 'create\(\s*req\.body|\.\.\.req\.body' server/src   # S3
grep -rn 'process.env.MONGODB_URI' server/src                   # S4
grep -rn 'useEffect' src/lab4/swipe                             # S5
grep -rnE '\.sort\(|e\.key\b|keyCode|\.which' src/lab4/swipe   # S6
```

K4 stays empty: no connection string is written in `src` or `server/src` (the example one lives in `.env.example`).

Homework 3 checks, same shell. C1, C5, C6 and C7 must print nothing. C2 prints the one tick read in `createSlaClock.js`, the round-trip read in `dossierApi.js` and the tests. C3 prints the import and the two effects of `useDossier.js` (the dossier and the case list). C4 prints the add and the remove in `createSlaClock.js` plus two comment lines that name the event:

```sh
grep -rn 'setInterval' src/lab4/appeal                                         # C1
grep -rn 'Date\.now' src/lab4/appeal                                           # C2
grep -rn 'useEffect' src/lab4/appeal                                           # C3
grep -rn 'visibilitychange' src/lab4/appeal --include='*.js' --exclude='*.test.js'   # C4
grep -rnE 'useMemo|setTimeout' src/lab4/appeal --include='*.jsx'               # C5
grep -rnE '\.sort\(|e\.key|keyCode' src/lab4/appeal                           # C6
grep -rnE 'console\.|statement' server/src/appeal --include='*.js' --exclude='*.test.js' --exclude='validateAppeal.js' --exclude='appeal.contract.js'   # C7
```

## Known limits

- Forum messages are kept in memory: restarting the API resets them to the sample data. Only the swipe deck uses MongoDB, and because `server.js` now requires `MONGODB_URI`, the forum also needs the API to start with a reachable MongoDB.
- `oxlint` reports one warning in the Lab 3 `PubgMatchTelemetry.jsx` (`set-state-in-effect`). It pre-dates Lab 4 and is left unchanged.
- The Lab 3 `DeveloperCard` still shows `commits: 144`, the value of `lab3-final`.
- Not verified by the AI: Lighthouse scores, CLS, render counts, the Slow 3G abort behaviour and 375px layout. They are checked by the author in the browser.
- Homework 3 was run in headless Chrome against the production build and the real API: the routes and the 404 page, the matrix, validation and focus, a successful appeal and a reload, a duplicate (`409`), a window that really expires (`409` for a late appeal), a client clock set one hour ahead, one hour behind and three days ahead (the countdown still followed the server), a hidden and visible page, a page frozen and resumed through the DevTools lifecycle command, and no horizontal scroll at 375px and 320px. Not verified by the AI: a real browser tab throttled in the background for minutes (headless Chrome is not throttled the same way), Lighthouse, a real phone, a screen reader.
- Homework 3 state is in memory: restarting the API restarts every appeal window and forgets the appeals. All cases and numbers are invented.
- Lighthouse (HW1 asks for 100/100), screen-reader behaviour and real-device layout of `/gallery` are not verified by the AI. A headless Chrome run covered the URL behaviour, focus return, Back/Forward, Escape, backdrop click and no horizontal scroll at 375px and 320px.
- Homework 2 was run in headless Chrome against the real API and a `mongo:8` container (Mongoose 8.24): keys, repeat and modifier keys, a double keydown, buttons, drag thresholds, reload restore, Start over, an offline error, and no horizontal scroll at 375px and 320px. Not verified by the AI: MongoDB Atlas, Lighthouse, real touch on a phone, a screen reader, and Backspace with a Vietnamese IME such as UniKey (an IME can consume the key before the page sees it; the Undo button is the fallback).
- Anyone who knows a `playerId` can read or clear that player's swipes (no login by design). `sanitizeFilter` and the UUID check keep query operators out, which was tested with `?playerId[$ne]=x` and a JSON object body.
