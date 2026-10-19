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
