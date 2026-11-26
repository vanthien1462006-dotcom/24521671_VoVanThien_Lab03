# AI_FAILURE_AUDIT.md

Lab 4 audit. Entries are real defects found in this repository. Only defects that reached a commit are listed. Homework 1 and Homework 3 have entries. Homework 2 has none: no real defect was found in it.

## Failure #01: L4H1-T16 the SPA fallback serves `index.html` for `/robots.txt`, so Lighthouse SEO stops at 92

Logged 2026-11-26, task L4H1-T16 (WBS row L4H1-T16).

**Prompt:** The Homework 1 request: "bạn hãy dựa vào các pj rule của các lab trước đó kèm với các yêu cầu trong lab này và áp dụng cho chính xác và lên kế hoạch và làm chính xác HW1" (in English: use the project rules of the earlier labs and this lab's requirements, plan and do Homework 1 exactly). The lab requirement behind it is slide 19: "Full WCAG 2.2 AA accessibility compliance and 100/100 Lighthouse performance score".

**AI Code:** The page head in `index.html` (a `meta description`, a `title`, `lang="en"`) and a `public/` folder without a `robots.txt`. The HW1 plan (`TASK_DECOMPOSITION.md`, Part 8, decision H1-D8) left Lighthouse to the author, and the AI treated SEO as done after checking only that `index.html` has a description and a title. This state is in every HW1 commit from `bcf0923` to `04072be`.

**Bug:** The preview server (and any single-page-app host) answers an unknown path with `index.html`. A request for `/robots.txt` returned `200` with `Content-Type: text/html` and the 630-byte app shell instead of a robots file. Lighthouse scored SEO 92 in both the Desktop and the Mobile run, while Performance, Accessibility and Best Practices were 100 or 99. The exact name of the failed audit was not read from the Lighthouse report; the cause was found by requesting `/robots.txt` and was confirmed by the fix below, since SEO went to 100 with nothing else changed.

**DevTools Proof:** Not kept. The author saw SEO 92 in two Lighthouse runs (4:29 PM Desktop and 4:32 PM Mobile, incognito, no throttling). Those two screenshots were overwritten by the later runs with the same file names, so the repository has no "before" image. What the repository has is the "after": `docs/evidence/L4_HW1_Gallery/hw1-07-lighthouse-desktop.png` (100, 100, 100, 100) and `hw1-07-lighthouse-mobile.png` (99, 100, 100, 100). The `/robots.txt` response was checked with `curl` against `vite preview` in the AI session, before and after the fix. Detected by the author's Lighthouse run, not by the AI.

**Engineering Fix (Commit 982106c):** Added `public/robots.txt` with `User-agent: *` and `Allow: /`. After `npm run build`, `/robots.txt` returns that text. The WBS row was added first in commit `435e433`. The lesson for the next homework: when a page is a single-page app, also request the static paths a crawler asks for (`/robots.txt`, `/favicon.svg`) and check that they do not return the app shell.

## Failure #02: L4H3-T21 the tribunal page overflows the viewport at 320px (37px of horizontal scroll)

Logged 2026-11-26, task L4H3-T21 (WBS rows L4H3-T21 and L4H3-T25).

**Prompt:** The Homework 3 request: "oke tiếp tục research và làm chính xác HW3 nhé, dựa trên code cũ của các lab trước nếu có" (in English: continue, research and do HW3 exactly, reusing the code of the earlier labs where possible). The project rule behind it (Lab 3 and Lab 4 plans): no horizontal page scroll at 375px and 320px.

**AI Code:** The tribunal styles written in L4H3-T18 to T20 (commits `17fcb5b`, `5455bad`, `c5b32f0`): `display: grid` containers with the default automatic column (`.view`, `.form`, `.fields`, `.field`, `.countdown`, `.matrix`), form controls without `width: 100%` or `min-width: 0`, and a seven column `<table>` with `width: 100%` and no scroll container. The AI only ran the 375px and 320px check after all the screens existed, as planned, and had not looked at the layout at 320px before that.

**Bug:** In a headless Chrome run at a 320px viewport, `document.documentElement.scrollWidth` was 357 and `window.innerWidth` was 320. The check printed `FAIL S11 320px: no horizontal page scroll [overflow 37px]`. A probe listed the elements whose right edge was beyond 320px: the case heading, the summary and the countdown section all spanned 33px to 357px, so the whole content column was 324px wide, wider than the space it had. At 375px there was no overflow, so the 375px run alone would have passed.

**DevTools Proof:** Terminal output of the throw-away Chrome DevTools Protocol run, not a screenshot. The failing state was not captured as an image. The after state is the 320px screenshot of the same page, which the author can copy to `docs/evidence/`.

**Engineering Fix (Commit 622d3f5):** Every grid container got `grid-template-columns: minmax(0, 1fr)`, the controls got `width: 100%` and `min-width: 0`, and the table was wrapped in a keyboard focusable region with `overflow-x: auto` and a minimum width token (`--appeal-table-min-width`). After the fix the same run reported no overflow at 320px and 375px. The AI did not test the three changes one by one, so it cannot say which of them alone was enough; its guess was that the widest unshrinkable child (the `<select>` with the long option text, or the table) forced the column width. The lesson: when a page is written with grid, look at 320px as soon as the first screen exists.

## Failure #03: L4H3-T16 the Himass sample summary says the opposite of its numbers

Logged 2026-11-26, task L4H3-T16 (WBS rows L4H3-T16 and L4H3-T25).

**Prompt:** The Homework 3 request: "oke tiếp tục research và làm chính xác HW3 nhé, dựa trên code cũ của các lab trước nếu có" (in English: continue, research and do HW3 exactly, reusing the code of the earlier labs where possible). The plan (`TASK_DECOMPOSITION.md`, Part 10, decision H3-D3) asks for invented sample dossiers with a one line summary each.

**AI Code:** `server/src/appeal/dossierData.js` in commit `34c43ec`. The Himass dossier had `summary: 'Sample case: flags concentrated in squad matches during a review period.'` next to the numbers solo 30 matches and 3 flags, duo 30 and 3, squad 40 and 6. The AI wrote the sentence before the matrix existed in the page and never computed the verdicts for its own numbers.

**Bug:** With the plan's formula the squad index is (6 x 100) / (40 x 12) = 1.25, exactly on the threshold, and the verdict is "Proportional" (the rule is "over" only above 1.25). All three Himass modes are "Proportional", so the page showed the sentence "flags concentrated in squad matches" above a table that says no mode is over-flagged.

**DevTools Proof:** The matrix rows read from the page in the headless Chrome run: `["Squad","40","6","40.0%","50.0%","1.25","Proportional"]`, with the other two Himass rows at index 0.83, also "Proportional".

**Engineering Fix (Commit 7042cda):** The Himass summary now says the flags follow the matches played and that the squad index sits exactly on the 1.25 limit; the TanVuu summary was reworded to match its numbers (over in duo, under in solo). The numbers stayed as the plan records them. The WBS row for this fix (L4H3-T25) was added afterwards, in commit `1fbd56b`, which breaks the rule that the row comes first. The lesson: write descriptive text for generated data after computing what the code says about it.

## Failure #04: L4H3-T22 a check command in the README contains a backspace character

Logged 2026-11-26, task L4H3-T22 (WBS rows L4H3-T22 and L4H3-T25).

**Prompt:** The Homework 3 request: "oke tiếp tục research và làm chính xác HW3 nhé, dựa trên code cũ của các lab trước nếu có" (in English: continue, research and do HW3 exactly, reusing the code of the earlier labs where possible). The Homework 3 plan lists the check commands C1 to C7, and the README is meant to let the author run them.

**AI Code:** `README.md` in commit `1ddfad7`. The AI wrote the README section from a Python script with a normal (not raw) string, so the regular expression word boundary `` in the C6 command (`grep -rnE '\.sort\(|e\.key|keyCode' src/lab4/appeal`) became the control character 0x08 (backspace).

**Bug:** The command shown in the README was `e\.key<backspace>|keyCode`. Copied into a shell it does not mean "word boundary", so the check does not do what the README says. It was found because `file README.md` reported "with overstriking", not by running the command. A first attempt to remove the character did nothing (the replacement script searched for the wrong text and the tree stayed clean); the second attempt used `chr(8)` and found and replaced exactly one character.

**DevTools Proof:** Not a browser defect. The evidence is the byte count: a Python script counted one 0x08 in `README.md` before the fix and zero after, and the C6 command copied from the README runs and prints nothing.

**Engineering Fix (Commit 7810602):** The control character was replaced by a backslash and a `b`. The lesson: after generating a document that contains commands, run the text as it appears in the file, and check it for control characters.
