export interface CommitForJudging {
  sha: string
  repo: string
  message: string
  date: string
  files: string[]
  patch: string
}

// Pass 1: which commits are real work worth a resume line, and which are noise.
// This is the heart of the product. Tune the wording here.
export function pass1Prompt(commits: CommitForJudging[]): string {
  const listing = commits
    .map(
      (c, i) =>
        `[${i + 1}] repo: ${c.repo}\nmessage: ${c.message}\nfiles: ${c.files.slice(0, 12).join(', ') || '(none listed)'}\nchange:\n${c.patch || '(no code change shown)'}`,
    )
    .join('\n\n---\n\n')

  return `You are screening a software developer's commits to decide which ones belong on their resume.

A commit is SIGNIFICANT if it ships real work: a new feature or capability, a meaningful bug fix, a performance or reliability improvement, an integration, a migration, a design or architecture change, or a substantial test or tooling investment.

A commit is TRIVIAL if it is noise: typo or wording fixes, formatting or whitespace, lint fixes, comment-only changes, version or dependency bumps, merge commits, reverts of nothing notable, renames, or "wip" and "update" style commits with no real change.

When the message is vague, judge by the code change shown. Be strict: a resume lists accomplishments, not activity.

For each commit give its number as "id", "significant" true or false, and "oneLine": one short sentence, in plain words, saying what the commit did and why you judged it that way.

Commits:

${listing}`
}

export const pass1Schema = {
  type: 'object',
  properties: {
    verdicts: {
      type: 'array',
      items: {
        type: 'object',
        properties: { id: { type: 'integer' }, significant: { type: 'boolean' }, oneLine: { type: 'string' } },
        required: ['id', 'significant', 'oneLine'],
      },
    },
  },
  required: ['verdicts'],
}

export interface SignificantCommit {
  sha: string
  repo: string
  message: string
  oneLine: string
  date: string
}

// Pass 2: turn one owner's significant commits into resume bullets.
// Tune the voice here: this is where the resume starts to sound like you.
export function pass2Prompt(ownerLabel: string, commits: SignificantCommit[]): string {
  const listing = commits.map((c, i) => `[${i + 1}] ${c.repo} (${c.date.slice(0, 10)}): ${c.message}\n    note: ${c.oneLine}`).join('\n')
  return `You are writing the experience section of a software developer's resume, for their work at "${ownerLabel}".

Below are their significant commits. Write resume bullets from them.

Rules:
- Group related commits into one bullet. Aim for 2 to 6 bullets in total; fewer if there is little here.
- Start each bullet with a strong past-tense verb (Built, Shipped, Designed, Reduced, Migrated...).
- State what was achieved and, when the commits show it, why it mattered. Do not invent numbers, tools or outcomes that the commits don't support.
- One sentence per bullet, plain and specific, no buzzwords.
- For each bullet list the numbers of the commits it covers as "commitIds".

Commits:
${listing}`
}

export const pass2Schema = {
  type: 'object',
  properties: {
    bullets: {
      type: 'array',
      items: {
        type: 'object',
        properties: { text: { type: 'string' }, commitIds: { type: 'array', items: { type: 'integer' } } },
        required: ['text', 'commitIds'],
      },
    },
  },
  required: ['bullets'],
}

// Summary and skills, written from the finished bullets so they can't claim anything the bullets don't.
export function summaryPrompt(name: string, groups: { ownerLabel: string; bullets: string[] }[]): string {
  const listing = groups.map((g) => `${g.ownerLabel}:\n${g.bullets.map((b) => `- ${b}`).join('\n')}`).join('\n\n')
  return `Below are the experience bullets from ${name}'s resume.

Write:
1. "summary": a professional summary of 2 to 3 sentences, written without "I", that captures what this developer does and is good at. Use only what the bullets support.
2. "skills": 6 to 12 concrete technical skills (languages, frameworks, tools, practices) evident in the bullets. Only include skills the bullets clearly show.

${listing}`
}

export const summarySchema = {
  type: 'object',
  properties: { summary: { type: 'string' }, skills: { type: 'array', items: { type: 'string' } } },
  required: ['summary', 'skills'],
}
