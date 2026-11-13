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

## Failure #03: H2-T17 UniKey Telex rewrites the W and S keys, so those piano notes have no code

Logged 2026-11-12 20:21, task H2-T17 (WBS row H2-T17).

**Prompt:** The Homework 2 guide, decision D4(b) and H2-T17: "Computer-keyboard piano ... `KeyA` C, `KeyW` C#, `KeyS` D ...". The guide and H2-T08 assume `e.code` reaches the page for all 13 keys, also with UniKey on. This is the same assumption as Failure #02.

**AI Code:** `computerKeyToMidi(e.code, octave)` in `computerKeyMap.js` (H2-T08, commit 216fed7), called from the window `keydown` listener in `GrandPiano88.jsx` (H2-T17, commit 986cb6b). The code follows the task and project-rules section 17. The wrong part is the assumption that `e.code` is always filled.

**Bug:** With UniKey in Vietnamese Telex mode, W and the tone key S reach the page as synthetic events with an empty `code`; UniKey also sends two `Backspace` events and the composed character (ă and a vowel with a tone mark). `computerKeyToMidi('')` returns null, so no note sounds. W alone is silent and plays only after several presses, and a melody C then D (A then S) loses the D. E, D, F, T, G, Y, H, U, J and K arrived as `KeyE`, `KeyD`, and so on, in the same run. It has the same root cause as Failure #02, with a wider effect.

**DevTools Proof:** Console screenshot `docs/evidence/HW2_GrandPiano88/hw2-10b-unikey-ecode.png` (added in H2-T25): rows with an empty `code` for the keys UniKey rewrote and `code: KeyX` for the others. Detected by running a `keydown` listener in the Console with UniKey Telex on, pressing A W S E D F T G Y H U J K in order, then pressing W alone on the piano page and listening.

**Engineering Fix (Commit 810c886):** `e.code` is kept, because the task requires it and project-rules section 17 forbids reading letters from `e.key`. The limit and the workaround (switch UniKey to English mode, or use the pointer or Enter and Space on a focused key) are documented under Known limits in the README (H2-T21). No code change.
