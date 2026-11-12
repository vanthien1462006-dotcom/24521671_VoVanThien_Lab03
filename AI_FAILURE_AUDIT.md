# AI_FAILURE_AUDIT.md

Lab 3 whole-lab audit. Entries are real defects found in this repository. Minimum required by slide 25: 3.

## Failure #01: E2-T19 commit-count formula ignores the E2-T21 commit

Logged 2026-11-01 21:53, task L-T01 (WBS row E2-T19).

**Prompt:** "E2-T19 'fix(ex1): sync commits metric with git history'" (no formula given).

**AI Code:** "Only `metrics.commits` changes, to `git rev-list --count HEAD` plus 1, supplied by the author." (commit 4f6ab2a, the version before the amend; it is not in the history of `main` but still opens with `git show` on the author's machine.)

**Bug:** E2-T21 adds one more commit after E2-T19, so "plus 1" leaves the card one below `git log`. The metrics must match the real history.

**DevTools Proof:** Not DevTools. Terminal screenshot of `git show 4f6ab2a` vs `git show 33da6fe`: `docs/evidence/EX2_ScientistDirectory/ex2-audit-01.png` (added in E2-T21). Detected by reading the diff of 4f6ab2a during review.

**Engineering Fix (Commit 33da6fe):** Formula changed to "plus 2 (this commit and the E2-T21 evidence commit)". The unpushed commit was amended.

## Failure #02: H1-T14 UniKey Telex turns the W key into an event without a code

Logged 2026-11-12 16:36, task H1-T14 (WBS row H1-T14).

**Prompt:** The Homework 1 guide (the step for `hw1-07-unikey-ecode.png`) said: "Turn UniKey on, Telex ... press W, A, D: Kick/Snare/Open Hi-Hat play; Console shows `code: KeyW`, `code: KeyA`, `code: KeyD`". The same assumption sits behind H1-T08: `e.code` is safe with UniKey for every pad key.

**AI Code:** `useDrumKeyboard` looks up `padMap.get(e.code)` (H1-T08, commit a0d8a27). The code follows the task and slide 26. The wrong part is the assumption that `e.code` is always filled.

**Bug:** With UniKey in Vietnamese Telex mode, the W key reaches the page as an event with an empty `code` and `key` "ư". `padMap.get('')` finds nothing, so the Kick pad does not play. A and D arrive as `KeyA` and `KeyD` and play normally (Total hits 2).

**DevTools Proof:** Console screenshot `docs/evidence/HW1_DrumMachine/hw1-07-unikey-ecode.png` (added in H1-T22): `code:  | key: ư`, `code: KeyA | key: a`, `code: KeyD | key: d`. Detected by running a `keydown` listener in the Console with UniKey Telex on and pressing W, A, D.

**Engineering Fix (Commit ea60b22):** `e.code` is kept, because the task requires it and project-rules section 17 forbids reading letters from `e.key`. The limit and the workaround (switch UniKey to English mode, or use the pointer) are documented under Known limits in the README.
