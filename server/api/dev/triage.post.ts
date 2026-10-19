// TEMPORARY dev route for slice 3: judge a range and return verdicts. Removed once Generate exists.
export default defineEventHandler(async (event) => {
  const b = await readBody<{ login: string; kind: 'org' | 'user'; username: string; from: string; to: string; synthetic?: boolean }>(event)
  if (b.synthetic) {
    const sample = [
      ['fix typo in README', 'README.md', '-Instal the app\n+Install the app'],
      ['Add retry with exponential backoff to payment webhook handler', 'src/webhooks.ts', '+async function withRetry(fn, tries = 5) {\n+  for (let i = 0; i < tries; i++) {\n+    try { return await fn() } catch (e) { await sleep(2 ** i * 100) }\n+  }\n+}'],
      ['wip', 'src/a.ts', '+\n+'],
      ['Bump lodash from 4.17.20 to 4.17.21', 'package.json', '-"lodash": "4.17.20"\n+"lodash": "4.17.21"'],
      ['Add CSV export for monthly usage reports', 'src/report.ts', '+export function toCsv(rows) { return rows.map(r => r.join(",")).join("\\n") }'],
      ['update', 'src/style.css', '-  margin: 4px;\n+  margin: 6px;'],
    ].map(([message, file, patch], i) => ({ sha: `synthetic${i}`, repo: 'demo/repo', message, date: '2026-01-01', files: [file], patch }))
    return await triageCommits(sample)
  }
  const configured = await readOwnersConfig()
  const token = configured.find((o) => o.login === b.login)?.token
  const commits = await gatherCommits({ kind: b.kind, login: b.login, token }, b.username, b.from, b.to)
  return { fetched: commits.length, verdicts: await triageCommits(commits) }
})
