# AI_FAILURE_AUDIT.md

Lab 3 whole-lab audit. Entries are real defects found in this repository. Minimum required by slide 25: 3.

## Failure #01: E2-T19 commit-count formula ignores the E2-T21 commit

Logged 2026-11-01 21:53, task L-T01 (WBS row E2-T19).

**Prompt:** "E2-T19 'fix(ex1): sync commits metric with git history'" (no formula given).

**AI Code:** "Only `metrics.commits` changes, to `git rev-list --count HEAD` plus 1, supplied by the author." (commit 4f6ab2a, the version before the amend; it is not in the history of `main` but still opens with `git show` on the author's machine.)

**Bug:** E2-T21 adds one more commit after E2-T19, so "plus 1" leaves the card one below `git log`. The metrics must match the real history.

**DevTools Proof:** Not DevTools. Terminal screenshot of `git show 4f6ab2a` vs `git show 33da6fe`: `docs/evidence/EX2_ScientistDirectory/ex2-audit-01.png` (added in E2-T21). Detected by reading the diff of 4f6ab2a during review.

**Engineering Fix (Commit 33da6fe):** Formula changed to "plus 2 (this commit and the E2-T21 evidence commit)". The unpushed commit was amended.
