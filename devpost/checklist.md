---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. You can open TIYUHM and look up a GitHub profile**
  Becomes usable: A running Nuxt app with the resume-sheet look. Welcome page → Get started → type a GitHub username → loading → your name and profile details appear (or the profile-not-found message).
  Why now: Proves the whole path end to end (browser → server route → GitHub → screen) and settles the look, fonts and palette that every later screen inherits. Bootstrapping lives here.
  PRD ref: `prd.md > The Core Journey` (steps 1-3), `prd.md > Look and Feel`, `prd.md > States and Boundaries` (profile not found)
  Spec ref: `spec.md > Stack`, `spec.md > Look and Feel`, `spec.md > File Structure`, `spec.md > Components` (Welcome page, Setup flow, GitHub profile route, GitHub client)
  Build: Scaffold Nuxt per the spec; add Fontsource fonts, `theme.css`, `ResumeSheet`, `StatusMessage`; build `pages/index.vue` and the profile step of `pages/start.vue`; add `server/utils/github.ts` and `server/api/github/profile.post.ts` (profile lookup only); extend `.gitignore` for `data/` and `owners.config.json`; add `.env.example` and a short README.
  Verify (mechanical): `npm run dev` starts with no errors; `POST /api/github/profile` returns the profile for a real username and a 404-style error for a made-up one; page renders in the dev server.
  Learner check: Open http://localhost:3000, click Get started, enter your GitHub username, and say whether the page feels like the typewriter-magazine look you pictured. Try a nonsense username too.
  Commit: `Scaffold Nuxt app with welcome page and GitHub profile lookup`

- [ ] **2. You can pick owners and a time period, and Generate unlocks**
  Becomes usable: After the profile loads, you see your configured owners (organizations plus "Personal projects"), tick some, set start and end dates, and Generate unlocks only when valid. The no-accessible-owners message works.
  Why now: Finds out early whether each owner's read-only token actually works (and whether organizations approve them), which the whole kernel depends on.
  PRD ref: `prd.md > Choosing organizations and time period`, `prd.md > States and Boundaries` (no organizations)
  Spec ref: `spec.md > Components` (Setup flow, GitHub profile route), `spec.md > External Services and Dependencies` (GitHub), `spec.md > Important Failure Modes`
  Build: Add `owners.config.example.json`; extend the profile route to read `owners.config.json`, verify each token, and return owners with available/unavailable reasons; add the owner picker, date inputs and gated Generate button to `start.vue`.
  Verify (mechanical): With a real `owners.config.json`, the route returns each owner with its status; an owner with a bad token shows as unavailable with a reason; with an empty config the no-owners error appears.
  Learner check: Create your read-only tokens, fill in `owners.config.json`, then walk the form: pick owners, set dates, and confirm Generate only unlocks once both are done.
  Commit: `Add owner picker, time period and gated Generate`

- [ ] **3. The AI judges your commits: meaningful or noise**
  Becomes usable: For a chosen owner and date range, the app fetches your authored commits, asks the local model which are significant, and stores each verdict. You can see the verdicts (significant vs trivial, with a one-line reason) in a simple dev view.
  Why now: This is the unique kernel and the biggest risk (local model quality and speed, Ollama structured output). Finding out now tells us whether we need the hosted fallback before anything is built on top.
  PRD ref: `prd.md > The generated resume` (significance filtering), `prd.md > Automatic updates`
  Spec ref: `spec.md > Components` (GitHub client, Prompts, AI adapter, Storage helper), `spec.md > Data Model` (`verdicts.json`), `spec.md > Important Failure Modes` (Ollama, malformed JSON)
  Build: Add `server/utils/ai/` (`askJson`, `ollama.ts`, `hosted.ts` stub), `prompts.ts` Pass 1 (you tune it), commit fetching and diff truncation in `github.ts`, `store.ts`, and a Pass 1 triage function in `pipeline.ts`; add a temporary dev route/view that lists verdicts.
  Verify (mechanical): Ollama model answers a schema-constrained request; run triage on a real range and confirm typo-style commits are `trivial` and a real feature is `significant`; malformed or unreachable Ollama produces the clear message and no verdicts are written for a failed batch.
  Learner check: Run the triage on a range you know well and tell me whether the verdicts match your own judgment; point out any it got wrong so we can tune the prompt.
  Commit: `Add AI commit triage with Ollama adapter`

- [ ] **4. Generate builds your resume and shows it**
  Becomes usable: Clicking Generate produces the full resume (contact, summary, experience by owner, demo education, skills), saves it, and shows it on the magazine-style `/resume` page. Opening the app again goes straight to the saved resume. The no-meaningful-commits message works.
  Why now: The first moment the product looks like the product. Real output here is what the early hands-on review judges.
  PRD ref: `prd.md > The Core Journey` (steps 6-7), `prd.md > The generated resume`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Components` (Generate route, Resume pipeline, Prompts, Resume page, ResumeBody), `spec.md > Data Model` (`resume.json`), `spec.md > Look and Feel`
  Build: Add Pass 2 and summary/skills prompts, the full pipeline, `generate.post.ts`, `resume/index.get.ts`, `demoEducation.ts`, `ResumeBody.vue`, `resume.vue`, the returning-user redirect, and the loading state on `start.vue`.
  Verify (mechanical): Generate against a real range writes a valid `data/resume.json` with all five sections and `lastChecked`; a range with no significant commits returns the error and writes nothing; `GET /api/resume` returns the saved resume.
  Learner check: Run the whole journey from the welcome page through Generate, then read your resume. Does it sound like you, is anything wrong or missing, and does it look right?
  Commit: `Generate and display the resume`

- [ ] **5. The resume updates itself after a meaningful commit**
  Becomes usable: Reopening or refreshing `/resume` shows the saved resume instantly, checks for commits since `lastChecked`, and adds bullets for significant ones. A typo commit changes nothing.
  Why now: This is the "oh, that's cool" beat of the whole product, so it comes right after generation and before polish like PDFs.
  PRD ref: `prd.md > Automatic updates`, `prd.md > The Core Journey` (step 9)
  Spec ref: `spec.md > Components` (Refresh route, Resume pipeline), `spec.md > Data Model`, `spec.md > Important Failure Modes`
  Build: Add `refresh.post.ts` reusing the pipeline, merge new bullets into the owner group, update summary/skills, move `lastChecked`, and add the "checking for new work" and failure notes to `resume.vue`.
  Verify (mechanical): Make a meaningful commit and a typo commit in a test repo; refresh adds one bullet for the first and nothing for the second; killing Ollama leaves the saved resume intact with a note.
  Learner check: Make a real meaningful commit and a typo commit, refresh the resume, and confirm only the real one shows up.
  Commit: `Add automatic resume refresh from new commits`

- [ ] **6. You can download the magazine and traditional PDFs**
  Becomes usable: Two buttons on the resume page download a magazine-styled PDF and a plain filter-safe PDF.
  Why now: Puppeteer is new to you; by now there is real resume data to print, and a PDF failure can't block the kernel.
  PRD ref: `prd.md > Downloads`
  Spec ref: `spec.md > Components` (Print pages, PDF route), `spec.md > External Services and Dependencies` (Puppeteer), `spec.md > Look and Feel` (Traditional PDF page), `spec.md > Important Failure Modes`
  Build: Add `print/magazine.vue`, `print/traditional.vue`, `print-traditional.css`, `pdf/[kind].get.ts`, and the two download buttons with an error note.
  Verify (mechanical): Both endpoints return valid PDFs; text extraction of the traditional PDF reads in order (Contact, Summary, Experience, Education, Skills); the magazine PDF renders with the typewriter font offline.
  Learner check: Download both PDFs, open them, select and copy text from the traditional one, and compare the magazine one to the screen.
  Commit: `Add magazine and traditional PDF downloads`

## Hands-on Checkpoints

- [ ] Early usable behavior explored — after slice 4 (first generated resume, before refresh and PDFs)
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: not started
Route and stops: not started
Edit outcome: not started
Reflection: not started
Activity mode: not started

## Revisions

- Model decision (build start): Ollama model is `gemma4:12b` at `http://127.0.0.1:11434` (verified running and pulled). Use `OLLAMA_MODEL=gemma4:12b` and `OLLAMA_URL=http://127.0.0.1:11434` in `.env.example`. Gemma 4 is a thinking-capable model, so slice 3 must verify schema-constrained output still works and watch speed.
