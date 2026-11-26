# AI_FAILURE_AUDIT.md

Lab 4 audit. Entries are real defects found in this repository. Only defects that reached a commit are listed. This file covers Homework 1 so far; later homeworks add their own entries.

## Failure #01: L4H1-T16 the SPA fallback serves `index.html` for `/robots.txt`, so Lighthouse SEO stops at 92

Logged 2026-11-26, task L4H1-T16 (WBS row L4H1-T16).

**Prompt:** The Homework 1 request: "bạn hãy dựa vào các pj rule của các lab trước đó kèm với các yêu cầu trong lab này và áp dụng cho chính xác và lên kế hoạch và làm chính xác HW1" (in English: use the project rules of the earlier labs and this lab's requirements, plan and do Homework 1 exactly). The lab requirement behind it is slide 19: "Full WCAG 2.2 AA accessibility compliance and 100/100 Lighthouse performance score".

**AI Code:** The page head in `index.html` (a `meta description`, a `title`, `lang="en"`) and a `public/` folder without a `robots.txt`. The HW1 plan (`TASK_DECOMPOSITION.md`, Part 8, decision H1-D8) left Lighthouse to the author, and the AI treated SEO as done after checking only that `index.html` has a description and a title. This state is in every HW1 commit from `bcf0923` to `04072be`.

**Bug:** The preview server (and any single-page-app host) answers an unknown path with `index.html`. A request for `/robots.txt` returned `200` with `Content-Type: text/html` and the 630-byte app shell instead of a robots file. Lighthouse scored SEO 92 in both the Desktop and the Mobile run, while Performance, Accessibility and Best Practices were 100 or 99. The exact name of the failed audit was not read from the Lighthouse report; the cause was found by requesting `/robots.txt` and was confirmed by the fix below, since SEO went to 100 with nothing else changed.

**DevTools Proof:** Not kept. The author saw SEO 92 in two Lighthouse runs (4:29 PM Desktop and 4:32 PM Mobile, incognito, no throttling). Those two screenshots were overwritten by the later runs with the same file names, so the repository has no "before" image. What the repository has is the "after": `docs/evidence/L4_HW1_Gallery/hw1-07-lighthouse-desktop.png` (100, 100, 100, 100) and `hw1-07-lighthouse-mobile.png` (99, 100, 100, 100). The `/robots.txt` response was checked with `curl` against `vite preview` in the AI session, before and after the fix. Detected by the author's Lighthouse run, not by the AI.

**Engineering Fix (Commit 982106c):** Added `public/robots.txt` with `User-agent: *` and `Allow: /`. After `npm run build`, `/robots.txt` returns that text. The WBS row was added first in commit `435e433`. The lesson for the next homework: when a page is a single-page app, also request the static paths a crawler asks for (`/robots.txt`, `/favicon.svg`) and check that they do not return the app shell.
