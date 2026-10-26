## Inspiration
I never want to be caught without an up-to-date resume. When someone asks for it, I want to hand it over right away. Otherwise I'm scrambling to reconstruct what I've done over a long stretch of time, and some opportunities are time-sensitive. Missing one because I wasn't ready is a bad look. I built TIYUHM so my work is always recorded and current.

## What it does
TIYUHM reads your GitHub repositories and their commits. It uses AI to decide which work is worth putting on a resume, then summarizes it into clear, polished bullets. It also keeps the resume current as you ship new work.

## How we built it
I built it by following the Devpost AI skills workflow. The stack is:
- **Nuxt 4** with **Vue 3** and **TypeScript**
- **GitHub REST API** for commits and pull requests
- **Ollama** running **Gemma 4** locally for the AI passes
- **Puppeteer** for PDF generation

## Challenges we ran into
I wanted the MVP to be perfect, but I had to leave out many features to finish.

## Accomplishments that we're proud of
- Making it to the end
- Using the Devpost AI skills successfully. They surfaced things I hadn't considered, sped up the process and gave me a more complete view of my use case.

## What we learned
- **Make the app reflect you.** With AI's help, I made the app feel personal instead of generic.
- **Define the idea before writing code.** As a developer, it's tempting to start coding right away to see something working. But if you don't have a clear grasp of what you're building, you can't build it well. The Devpost skills walk you through distinct phases, and I'll use this approach going forward. Even with unknowns and unforeseen edge cases, the more I cover upfront, the less I have to change later.

## What's next for TIYUHM - This Is Why You Hire Me
- **Hosting and user management.** I want to host the app so anyone can log in, link their GitHub and generate a resume, with no local setup or downloads. It would support multiple users, each with their own resume.
- **Personalized style.** Each user's resume would reflect their own style and personality, using generative AI.
- **Dual download.** You could download the resume in your personal style or in a traditional format, since some hiring managers prefer the traditional one.
