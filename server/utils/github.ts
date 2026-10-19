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
