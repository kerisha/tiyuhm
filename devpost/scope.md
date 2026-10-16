---
doc: scope
status: approved
---

# Self-Writing Resume

A web app that reads your GitHub history, generates a real resume from it, then keeps that resume up to date automatically as you ship meaningful work.

## The Unique Kernel
The resume maintains itself. After one initial "generate," future commits and pull requests update it with no logging and no copy-pasting. Commits are only raw material: the app picks out the key points (features, core work, big refactors) and ignores noise like spelling fixes, so the resume stays succinct and competitive.

## Who It's For
The learner, a working software developer, who forgets what they accomplished and then scrambles when a recruiter asks for a resume. Today they would dig through history by hand or paste commits into a chatbot. (Later: any developer.)

## The Core Loop
1. Open the app, see a welcome screen, enter a GitHub profile and a time period.
2. The app fetches the organizations linked to the account; the user picks which to include.
3. Click generate: a full resume is built from commit/PR history, with experience grouped by organization and time period.
4. From then on, new significant commits update the existing resume (a web page) on their own.

They come back because the resume is already current when a recruiter asks.

## Inspiration & Identity
No look-and-feel direction yet. The learner wants what they build to carry a recognizable personal style (see profile), so visual identity is a `3-prd` conversation. The one hard constraint volunteered: it must follow real resume conventions so it reads well to recruiters, HR, and automated applicant-tracking filters.

## Why This Matters to the Learner
"It's easy for humans to forget what we worked on and the important landmarks in our journey if it's not properly documented." Mostly for their own use.

## What "Working" Looks Like
Demo: enter a GitHub account, pick organizations, click generate, and a proper resume page appears (summary/objective plus experience by organization and dates, all drawn from commits). Download the resume as a PDF. Then a new meaningful commit is made and the resume updates by itself. The "oh, that's cool" beat is the resume changing without anyone touching it. A trivial commit (typo fix) does not change it.

## The POC Boundary
- Welcome screen, GitHub profile + time period input, organization listing and selection, generate.
- Resume built solely from GitHub commits/PRs: summary, experience grouped by organization and period, succinct bullets.
- Filtering for significance: skip meaningless commits; where a message is vague, summarize from the code change.
- Resume shown as a web page, downloadable as a PDF at any point.
- Automatic updates from future significant commits after the first generation.

## Later
- Tailoring the resume to a pasted job description.
- Manual daily/weekly/monthly logging.
- Open to any user, with AI varying the look so no two resumes look the same.
- Download formats beyond PDF (e.g., Word).

## Explicitly Cut
- Listing every commit on the resume: a resume must be succinct, so commits are signals, not content.
- Updating on every commit: it would clutter the resume with trivia.
- Non-GitHub sources: GitHub is the example source for this proof of concept.
