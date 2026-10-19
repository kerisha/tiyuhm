import { askJson } from './ai'
import {
  pass1Prompt,
  pass1Schema,
  pass2Prompt,
  pass2Schema,
  summaryPrompt,
  summarySchema,
  type CommitForJudging,
  type SignificantCommit,
} from './prompts'
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

function isPass2(v: unknown): v is { bullets: { text: string; commitIds: number[] }[] } {
  const d = v as any
  return (
    !!d &&
    Array.isArray(d.bullets) &&
    d.bullets.every((b: any) => typeof b?.text === 'string' && b.text.trim() && Array.isArray(b.commitIds) && b.commitIds.every(Number.isInteger))
  )
}

function isSummary(v: unknown): v is { summary: string; skills: string[] } {
  const d = v as any
  return !!d && typeof d.summary === 'string' && d.summary.trim() !== '' && Array.isArray(d.skills) && d.skills.every((x: any) => typeof x === 'string')
}

// Pass 2 for one owner: significant commits in, bullets out (each tied to the commits it came from).
export async function writeBullets(ownerLabel: string, commits: SignificantCommit[]): Promise<ResumeBullet[]> {
  if (!commits.length) return []
  const reply = await askJson(pass2Prompt(ownerLabel, commits), pass2Schema, isPass2)
  return reply.bullets
    .map((b) => {
      const used = b.commitIds.map((id) => commits[id - 1]).filter(Boolean)
      const date = used.map((c) => c.date).sort().pop() ?? commits[0].date
      return { text: b.text.trim(), date, shas: used.map((c) => c.sha) }
    })
    .filter((b) => b.shas.length > 0)
}

export async function writeSummary(name: string, experience: ExperienceGroup[]) {
  const groups = experience.map((g) => ({ ownerLabel: g.ownerLabel, bullets: g.bullets.map((b) => b.text) }))
  return await askJson(summaryPrompt(name, groups), summarySchema, isSummary)
}

export interface GenerateInput {
  profile: Resume['profile']
  owners: string[]
  from: string
  to: string
}

// Whole pipeline for Generate. Nothing is saved to resume.json unless every step succeeded.
export async function generateResume(input: GenerateInput): Promise<Resume> {
  const configured = await readOwnersConfig()
  const experience: ExperienceGroup[] = []
  for (const login of input.owners) {
    const owner = configured.find((o) => o.login === login)
    if (!owner) {
      throw createError({ statusCode: 400, statusMessage: `"${login}" isn't in owners.config.json.` })
    }
    const commits = await gatherCommits(owner, input.profile.username, input.from, input.to)
    const verdicts = await triageCommits(commits)
    const significant: SignificantCommit[] = commits
      .filter((c) => verdicts[c.sha]?.significant)
      .map((c) => ({ sha: c.sha, repo: c.repo, message: c.message.split('\n')[0], oneLine: verdicts[c.sha].oneLine, date: c.date }))
    const bullets = await writeBullets(owner.label, significant)
    if (bullets.length) experience.push({ ownerLabel: owner.label, periodFrom: input.from, periodTo: input.to, bullets })
  }
  if (!experience.length) {
    throw createError({
      statusCode: 422,
      statusMessage: 'We found no meaningful commits in that period, so there is nothing to put on a resume. Try a longer period or other owners.',
    })
  }
  const { summary, skills } = await writeSummary(input.profile.name || input.profile.username, experience)
  const resume: Resume = {
    profile: input.profile,
    selection: { owners: input.owners, from: input.from, to: input.to },
    summary: summary.trim(),
    experience,
    skills,
    education: demoEducation,
    lastChecked: new Date().toISOString(),
  }
  await writeJson('resume.json', resume)
  return resume
}
