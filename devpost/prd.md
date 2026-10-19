---
doc: prd
status: approved
---

# TIYUHM (This Is Why You Hire Me) — Product Requirements

A web app that reads a developer's GitHub history, generates a resume from it, and keeps that resume current as they ship meaningful work. Built first for the learner, a working software developer.
Source: `scope.md > The Unique Kernel`, `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`.

## The Core Journey
1. Someone opens TIYUHM and sees a resume-style welcome page with the name TIYUHM and a **Get started** button.
2. They click **Get started**; a form appears asking for a GitHub profile.
3. They enter the profile. A loading screen appears while the app accesses the GitHub profile.
4. The app shows the organizations linked to that account. They choose which to include on the resume.
5. They select a time period.
6. They click **Generate**. A loading state appears while the resume is built.
7. The resume page appears: contact information, professional summary, experience, education, skills.
8. They can download it as a PDF that matches the on-screen resume, at any point.
9. Later, they make a meaningful new commit. When they come back or refresh the page, the resume has updated itself. A trivial commit (such as a typo fix) changes nothing.

Success: the resume looks right on first generation, the PDF downloads, and the resume changes by itself after a meaningful commit (`scope.md > What "Working" Looks Like`).

## Screens and Layout
Every screen shares a resume-like page layout so the whole app has one consistent theme.
- **Welcome page** — resume-style page with the TIYUHM name and a **Get started** button.
- **GitHub profile form** — appears after Get started; one input for the GitHub profile.
- **Loading screen (profile)** — shown while the app accesses the GitHub profile.
- **Organization picker** — lists the organizations linked to the account; the user selects which to include.
- **Time period step** — the user selects the time period.
- **Generate and loading state** — a Generate button, then a loading state while the resume is built.
- **Resume page** — the generated resume with two download buttons.

Order of steps: profile, then organizations, then time period, then generate. (This moves the time period after organizations, a change from `scope.md > The Core Loop`.)

## Look and Feel
Direction from the learner:
- **Mood:** welcoming yet professional; chic, modern, techie. Engaging enough that a reader wants to read it.
- **Concept:** a fashion magazine for tech, "showcasing my masterpieces."
- **Typography:** a typewriter font is the learner's pick.
- **Overall:** a resume-shaped page throughout, with a magazine feel and a tech twist.
- **Constraint (revised at build):** the PDF is the on-screen resume as is. The separate plain "traditional" PDF was cut.
- **Goal:** it should carry a recognizable personal style, not generic AI-app styling (`learner-profile.md > Desired Learning Outcome`).

**Color palette** (the learner's choice, an earthy, warm set):
- Light Bronze `#CB997E` — elegant golden-brown, warmth
- Desert Sand `#DDBEA9` — soft sandy beige
- Almond Cream `#FFE8D6` — soft, velvety warm light tone
- Ash Grey `#B7B7A4` — muted green-grey
- Dry Sage `#A5A58D` — gentle yellow-green
- Dusty Olive `#6B705C` — subdued olive, the darkest of the six

Which color plays which role (page background, text, accents) is left to `4-spec` and the build to propose. Dusty Olive is the only dark color, so it is the natural candidate for text, and readability should be checked on screen. The PDF uses the same palette as the screen. No references beyond the palette and the magazine concept were given.

## Features and Behavior

### Getting started and connecting GitHub
- As the developer, I want to enter my GitHub profile so the app can read my work.
  - [ ] The welcome page shows TIYUHM and a Get started button.
  - [ ] Clicking Get started reveals the GitHub profile form.
  - [ ] Submitting a valid profile shows a loading screen, then the organization list.

### Choosing organizations and time period
- As the developer, I want to choose which organizations appear and over what period so the resume covers the right work.
  - [ ] Organizations linked to the account are listed and can be selected.
  - [ ] After selecting organizations, the user can select a time period.
  - [ ] Generate is available only once organizations and a time period are chosen.

### The generated resume
- Built solely from GitHub commits and pull requests, with experience grouped by organization and time period (`scope.md > The POC Boundary`).
- Sections: contact information, professional summary, experience, education, skills.
- **Contact information** comes straight from the GitHub profile.
- **Professional summary** is written from the experience.
- **Experience** has succinct bullets per organization and period. Commits are signals, not content; trivial commits are skipped, and vague commit messages are summarized from the code change.
- **Education** is placeholder demo data, not from GitHub: a BSc in Electrical and Computer Engineering, plus 1–3 professional certifications. It is not labeled as demo on screen (learner's call at final review).
- **Skills** are inferred from the languages and projects in the commit history (assumption, see Open Questions).
  - [ ] All five sections appear on the generated resume.
  - [ ] Experience is grouped by organization and time period.
  - [ ] Typo-level commits do not appear as bullets.

### Downloads
One PDF download ("Download resume"), available at any point after generation. It is the resume as it looks on screen, with the full magazine look and feel.
  - [ ] The button produces a PDF file.
  - [ ] The PDF visibly matches the on-screen style, and its text can be selected and copied.

### Automatic updates
- As the developer, I want my resume to update itself so it is already current when a recruiter asks.
  - [ ] After a new meaningful commit, refreshing or returning to the page shows an updated resume.
  - [ ] After a trivial commit (such as a typo fix), the resume does not change.
  - [ ] Updates add to the existing resume, not start a new one from scratch.

## States and Boundaries
- **First use** — welcome page with Get started.
- **Returning use** — the saved resume is shown, not the welcome page, and is brought up to date with new significant commits (`scope.md > The Core Loop`, step 4). The learner didn't explicitly confirm this return experience (see Open Questions).
- **Loading** — shown while accessing the GitHub profile and while generating.
- **Error: profile not found** — if the GitHub profile doesn't exist, the user sees a message giving the reason and stating that without it we cannot move forward.
- **Error: no organizations** — if the account has no organizations to choose from, the same kind of message: reason, and that we cannot move forward.
- **Error: no meaningful commits** — if the chosen time period has no meaningful commits, the same kind of message: reason, and that we cannot move forward.
- **Persistence** — the generated resume is kept between visits.

## Product Decisions
- Name is TIYUHM (This Is Why You Hire Me) — the learner's own.
- Form that looks like a resume, so there is one consistent theme — the learner's idea.
- Step order is profile, organizations, time period, generate — the learner's sequence.
- Typewriter font and a tech-fashion-magazine mood — the learner's direction.
- Earthy six-color palette (bronze, sand, cream, greys, sage, olive) — the learner supplied it.
- One PDF download matching the on-screen resume. (Originally two, magazine and traditional; the learner cut the traditional one at build review.)
- Contact info comes from the GitHub profile; education is demo placeholder data — the learner's choice for the sake of the demo.
- Updates are seen on return or refresh, not live — the learner's choice for the demo.
- All three first-run problems show an error that states the reason and that we cannot move forward — the learner's choice, same handling for each.

## What We're Building
- Welcome page, GitHub profile form, loading screens, organization picker, time period step, Generate.
- Resume built from commits and pull requests, with significance filtering.
- Five-section resume page with a magazine look.
- One PDF download: the resume as on screen.
- Automatic updates from future significant commits, seen on return or refresh.
- Error messages for the three first-run problems.

## Deferred From the POC
- Tailoring to a pasted job description — separate feature (`scope.md > Later`).
- Manual daily/weekly/monthly logging — separate input method.
- Open to any user, with AI varying the look — needs accounts and more design work.
- Word or other download formats — PDF covers the demo.
- Real education and certification entry — a later input that GitHub can't supply.

## Possible Later Enhancements
- Live updating while the page is open.
- Letting the user edit or reorder the bullets.
- Other sources besides GitHub.

## Non-Goals
- Listing every commit on the resume — it must stay succinct.
- Updating on every commit — it would clutter the resume with trivia.
- Non-GitHub sources — GitHub is the example source for this proof of concept.
- Recovering from the three first-run errors — the app stops with a message.

## Open Questions
- **Palette in the PDF.** Resolved at build: the PDF uses the same palette as the screen; the plain traditional PDF was cut.
- **How is the time period chosen?** Assumption: a start and end date. Can be settled in `4-spec`.
- **Skills source.** Assumption: inferred from languages and projects in the commits. Can be settled in `4-spec`.
- **Returning-user screen.** Assumption: reopening shows the saved resume. Should be confirmed at review.
- **Private repositories and organizations.** Settled in `4-spec`: the app reads what each owner's read-only token covers. "Organizations linked to the account" now means owners the learner has configured, including a "Personal projects" owner for repos outside any organization; the no-organizations error reads "no accessible owners." Only commits authored by the entered username count.
