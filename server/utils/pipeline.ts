import { askJson } from './ai'
import { pass1Prompt, pass1Schema, type CommitForJudging } from './prompts'
import { readJson, writeJson } from './store'

export interface Verdict {
  significant: boolean
  oneLine: string
  repo: string
  message: string // first line only
  date: string
}
export type Verdicts = Record<string, Verdict>

const BATCH = 6

function isPass1(v: unknown): v is { verdicts: { id: number; significant: boolean; oneLine: string }[] } {
  const d = v as any
  return (
    !!d &&
    Array.isArray(d.verdicts) &&
    d.verdicts.every((x: any) => Number.isInteger(x?.id) && typeof x.significant === 'boolean' && typeof x.oneLine === 'string')
  )
}

// Judges commits that have no verdict yet, six at a time. Each batch is saved only if the whole batch
// came back readable and complete, so a failure never leaves half-judged guesses behind.
export async function triageCommits(commits: CommitForJudging[]): Promise<Verdicts> {
  const verdicts = await readJson<Verdicts>('verdicts.json', {})
  const todo = commits.filter((c) => !verdicts[c.sha])
  for (let i = 0; i < todo.length; i += BATCH) {
    const batch = todo.slice(i, i + BATCH)
    const reply = await askJson(pass1Prompt(batch), pass1Schema, isPass1)
    const byId = new Map(reply.verdicts.map((v) => [v.id, v]))
    if (!batch.every((_, k) => byId.has(k + 1))) {
      throw createError({ statusCode: 502, statusMessage: 'The AI skipped some commits. Nothing from that batch was saved; try again.' })
    }
    batch.forEach((c, k) => {
      const v = byId.get(k + 1)!
      verdicts[c.sha] = {
        significant: v.significant,
        oneLine: v.oneLine,
        repo: c.repo,
        message: c.message.split('\n')[0],
        date: c.date,
      }
    })
    await writeJson('verdicts.json', verdicts)
  }
  return verdicts
}

export async function gatherCommits(
  owner: { kind: 'org' | 'user'; login: string; token?: string },
  author: string,
  from: string,
  to: string,
): Promise<CommitForJudging[]> {
  const repos = await listRepos(owner)
  const out: CommitForJudging[] = []
  for (const repo of repos) {
    const commits = await listAuthoredCommits(repo, author, from, to, owner.token)
    for (const c of commits) {
      if (c.isMerge) continue
      const detail = await fetchCommitDetail(repo, c.sha, owner.token)
      out.push({ sha: c.sha, repo, message: c.message, date: c.date, files: detail.files, patch: detail.patch })
    }
  }
  return out
}
