export interface GithubProfile {
  username: string
  name: string | null
  email: string | null
  location: string | null
  blog: string | null
  profileUrl: string
}

const API = 'https://api.github.com'

function headers(token?: string) {
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'tiyuhm',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function fetchProfile(username: string, token?: string): Promise<GithubProfile> {
  let res: Response
  try {
    res = await fetch(`${API}/users/${encodeURIComponent(username)}`, { headers: headers(token) })
  } catch {
    throw createError({ statusCode: 502, statusMessage: "Couldn't reach GitHub. Check your connection and try again." })
  }
  if (res.status === 404) {
    throw createError({
      statusCode: 404,
      statusMessage: `We couldn't find a GitHub profile called "${username}". Without a real profile there's nothing to read.`,
    })
  }
  if (res.status === 403 || res.status === 429) {
    throw createError({ statusCode: 429, statusMessage: 'GitHub is rate limiting us. Wait a few minutes and try again.' })
  }
  if (!res.ok) {
    throw createError({ statusCode: 502, statusMessage: `GitHub answered with an unexpected error (${res.status}).` })
  }
  const u = await res.json()
  return {
    username: u.login,
    name: u.name ?? null,
    email: u.email ?? null,
    location: u.location ?? null,
    blog: u.blog || null,
    profileUrl: u.html_url,
  }
}

export interface OwnerConfig {
  label: string
  kind: 'org' | 'user'
  login: string
  token: string
}

export interface OwnerStatus {
  label: string
  kind: 'org' | 'user'
  login: string
  available: boolean
  reason?: string
}

export async function readOwnersConfig(): Promise<OwnerConfig[]> {
  const { readFile } = await import('node:fs/promises')
  let raw: string
  try {
    raw = await readFile('owners.config.json', 'utf8')
  } catch {
    return []
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw createError({ statusCode: 500, statusMessage: 'owners.config.json is not valid JSON. Fix it and try again.' })
  }
  if (!Array.isArray(parsed)) return []
  return parsed.filter(
    (o): o is OwnerConfig =>
      o && typeof o.label === 'string' && typeof o.login === 'string' && typeof o.token === 'string' && (o.kind === 'org' || o.kind === 'user'),
  )
}

// Checks that this owner's read-only token works. Never returns the token.
export async function verifyOwner(owner: OwnerConfig): Promise<OwnerStatus> {
  const base = { label: owner.label, kind: owner.kind, login: owner.login }
  const url = owner.kind === 'org' ? `${API}/orgs/${encodeURIComponent(owner.login)}/repos?per_page=1` : `${API}/user`
  let res: Response
  try {
    res = await fetch(url, { headers: headers(owner.token) })
  } catch {
    return { ...base, available: false, reason: "Couldn't reach GitHub." }
  }
  if (res.status === 401) return { ...base, available: false, reason: 'GitHub rejected this token (expired or wrong).' }
  if (res.status === 403 || res.status === 404) {
    return {
      ...base,
      available: false,
      reason:
        owner.kind === 'org'
          ? 'This token cannot see the organization. It may need an admin to approve it, or its resource owner is wrong.'
          : 'This token is not allowed to read this account.',
    }
  }
  if (!res.ok) return { ...base, available: false, reason: `GitHub answered with an unexpected error (${res.status}).` }
  if (owner.kind === 'user') {
    const me = await res.json()
    if (String(me.login).toLowerCase() !== owner.login.toLowerCase()) {
      return { ...base, available: false, reason: `This token belongs to "${me.login}", not "${owner.login}".` }
    }
  }
  return { ...base, available: true }
}

export interface CommitSummary {
  sha: string
  repo: string // owner/name
  message: string
  date: string
  isMerge: boolean
}

export interface CommitDetail {
  files: string[]
  patch: string
}

async function ghJson(url: string, token?: string): Promise<any> {
  let res: Response
  try {
    res = await fetch(url, { headers: headers(token) })
  } catch {
    throw createError({ statusCode: 502, statusMessage: "Couldn't reach GitHub. Check your connection and try again." })
  }
  if (res.status === 409) return [] // empty repository
  if (res.status === 401) throw createError({ statusCode: 401, statusMessage: 'GitHub rejected a token. Check owners.config.json.' })
  if (res.status === 403 || res.status === 429) {
    throw createError({ statusCode: 429, statusMessage: 'GitHub refused the request (rate limit or missing permission).' })
  }
  if (!res.ok) throw createError({ statusCode: 502, statusMessage: `GitHub answered with an unexpected error (${res.status}).` })
  return res.json()
}

async function ghPaged(url: string, token?: string, maxPages = 10): Promise<any[]> {
  const out: any[] = []
  for (let page = 1; page <= maxPages; page++) {
    const batch = await ghJson(`${url}${url.includes('?') ? '&' : '?'}per_page=100&page=${page}`, token)
    out.push(...batch)
    if (batch.length < 100) break
  }
  return out
}

export async function listRepos(owner: { kind: 'org' | 'user'; login: string; token?: string }): Promise<string[]> {
  const path =
    owner.kind === 'org'
      ? `/orgs/${encodeURIComponent(owner.login)}/repos?type=all`
      : owner.token
        ? '/user/repos?affiliation=owner'
        : `/users/${encodeURIComponent(owner.login)}/repos?type=owner`
  const repos = await ghPaged(`${API}${path}`, owner.token)
  return repos.map((r) => r.full_name as string)
}

export async function listAuthoredCommits(
  repo: string,
  author: string,
  from: string,
  to: string,
  token?: string,
): Promise<CommitSummary[]> {
  const since = new Date(`${from}T00:00:00Z`).toISOString()
  const until = new Date(`${to}T23:59:59Z`).toISOString()
  const url = `${API}/repos/${repo}/commits?author=${encodeURIComponent(author)}&since=${since}&until=${until}`
  const commits = await ghPaged(url, token)
  return commits.map((c) => ({
    sha: c.sha,
    repo,
    message: c.commit.message,
    date: c.commit.author?.date ?? c.commit.committer?.date,
    isMerge: (c.parents?.length ?? 0) > 1,
  }))
}

const PATCH_LIMIT = 2000

// Files changed plus a truncated patch, so one huge diff can't swamp the model's context.
export async function fetchCommitDetail(repo: string, sha: string, token?: string): Promise<CommitDetail> {
  const c = await ghJson(`${API}/repos/${repo}/commits/${sha}`, token)
  const files: any[] = c.files ?? []
  let patch = ''
  for (const f of files) {
    if (patch.length >= PATCH_LIMIT) break
    patch += `--- ${f.filename}\n${f.patch ?? '(binary or too large to show)'}\n`
  }
  return { files: files.map((f) => f.filename as string), patch: patch.slice(0, PATCH_LIMIT) }
}
