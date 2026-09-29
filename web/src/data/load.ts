// Bundled reporting is available before any public discovery request completes.
import type { IssueData, IssueRecord, Project, SiteConfig } from '../types';

export type LiveStatus = 'idle' | 'loading' | 'ok' | 'unavailable';
export interface LiveResult { status: LiveStatus; issues: IssueRecord[]; detail: string }
interface Index { issues?: { date?: string }[] }
interface Repository { full_name?: string; created_at?: string }

const DEFAULT_CONFIG: SiteConfig = {
  issueRepos: [
    'identity-md-launches/launch-441-build-built-swarm-static',
    'identity-md-launches/launch-454-build-static-website-called',
  ],
  issueSearch: { org: 'identity-md-launches', query: 'swarm' },
  sourceRepo: 'identity-md-launches/launch-454-build-static-website-called',
  sourceRepoCreatedAt: '2026-09-29T14:19:49Z',
  communityLinks: [],
};
const cache: { config?: SiteConfig; bundled?: IssueRecord[]; live?: LiveResult; liveKey?: string } = {};
const isDate = (s: unknown): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
const isRepo = (s: unknown): s is string => typeof s === 'string' && /^[\w.-]+\/[\w.-]+$/.test(s);
const timestamp = (s?: string): number => s && Number.isFinite(Date.parse(s)) ? Date.parse(s) : 0;

async function request(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { cache: 'no-store', signal: controller.signal });
    if (!res.ok) throw new Error(`Public source returned ${res.status}`);
    return res;
  } finally {
    clearTimeout(timer);
  }
}
async function getJson<T>(url: string): Promise<T> { return (await request(url)).json() as Promise<T>; }
async function getText(url: string): Promise<string | null> {
  try { return await (await request(url)).text(); } catch { return null; }
}

export async function loadConfig(): Promise<SiteConfig> {
  if (cache.config) return cache.config;
  try {
    const c = await getJson<Partial<SiteConfig>>('./config.json');
    cache.config = {
      issueRepos: Array.isArray(c.issueRepos) ? [...new Set(c.issueRepos.filter(isRepo))] : DEFAULT_CONFIG.issueRepos,
      issueSearch: {
        org: typeof c.issueSearch?.org === 'string' && /^[\w.-]+$/.test(c.issueSearch.org) ? c.issueSearch.org : DEFAULT_CONFIG.issueSearch.org,
        query: typeof c.issueSearch?.query === 'string' && /^[\w.-]+$/.test(c.issueSearch.query) ? c.issueSearch.query : 'swarm',
      },
      sourceRepo: isRepo(c.sourceRepo) ? c.sourceRepo : DEFAULT_CONFIG.sourceRepo,
      sourceRepoCreatedAt: timestamp(c.sourceRepoCreatedAt) ? c.sourceRepoCreatedAt : DEFAULT_CONFIG.sourceRepoCreatedAt,
      communityLinks: Array.isArray(c.communityLinks) ? c.communityLinks : [],
    };
  } catch { cache.config = DEFAULT_CONFIG; }
  return cache.config;
}

// The old repository labels issue 1 with its closing date. Its window is authoritative.
export function coveredDate(data: IssueData, folderDate: string): string {
  const start = data.issue?.windowStart?.slice(0, 10);
  return isDate(start) ? start : folderDate;
}

async function loadIssueAt(
  base: string, folderDate: string, origin: IssueRecord['origin'], repo?: string,
  repoCreatedAt?: string, hasProjects = true, hasArticle = true,
): Promise<IssueRecord | null> {
  try {
    const data = await getJson<IssueData>(`${base}data.json`);
    if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
    const [markdown, projectText, article] = await Promise.all([
      getText(`${base}issue.md`), hasProjects ? getText(`${base}projects.json`) : Promise.resolve(null),
      data.issue?.number === 1 && hasArticle ? getText(`${base}article.md`) : Promise.resolve(null),
    ]);
    let projects: Project[] = [];
    try {
      const parsed: unknown = projectText ? JSON.parse(projectText) : [];
      if (Array.isArray(parsed)) projects = parsed.filter((p): p is Project => !!p && typeof p.slug === 'string' && Array.isArray(p.events));
    } catch { /* Older issues remain usable without a project file. */ }
    return {
      date: coveredDate(data, folderDate), number: typeof data.issue?.number === 'number' ? data.issue.number : null,
      origin, base, repo, repoCreatedAt, data, markdown, projects, article,
    };
  } catch { return null; }
}

export async function loadBundled(): Promise<IssueRecord[]> {
  if (cache.bundled) return cache.bundled;
  try {
    const [idx, config] = await Promise.all([getJson<Index>('./data/index.json'), loadConfig()]);
    const dates = [...new Set((idx.issues ?? []).map((i) => i.date).filter(isDate))];
    const records = await Promise.all(dates.map((d) => loadIssueAt(`./data/${d}/`, d, 'bundled', config.sourceRepo, config.sourceRepoCreatedAt)));
    cache.bundled = records.filter((r): r is IssueRecord => r !== null);
  } catch { cache.bundled = []; }
  return cache.bundled;
}

async function loadRepository(full: string, createdAt?: string): Promise<{ records: IssueRecord[]; valid: boolean; incomplete: boolean }> {
  const raw = `https://raw.githubusercontent.com/${full}/HEAD/`;
  try {
    const idx = await getJson<Index>(`${raw}data/index.json`);
    // Both files distinguish an issue repository from unrelated search matches.
    const schema = await getText(`${raw}data/schema.md`);
    if (!schema || !Array.isArray(idx.issues)) return { records: [], valid: false, incomplete: false };
    const dates = [...new Set(idx.issues.map((i) => i.date).filter(isDate))];
    const results = await Promise.all(dates.map((d) => loadIssueAt(`${raw}data/${d}/`, d, 'github', full, createdAt, schema.includes('projects.json'), schema.includes('article.md'))));
    return { records: results.filter((r): r is IssueRecord => r !== null), valid: true, incomplete: results.some((r) => !r || !r.markdown) };
  } catch { return { records: [], valid: false, incomplete: false }; }
}

export async function discoverGitHub(config: SiteConfig, _known?: Set<string>): Promise<LiveResult> {
  const key = JSON.stringify([config.issueRepos, config.issueSearch]);
  if (cache.live && cache.liveKey === key) return cache.live;
  const found: IssueRecord[] = [];
  const checked = new Set<string>();
  let unavailable = false;
  let validCount = 0;
  // Explicit repositories work even when search is unavailable or still indexing a new issue.
  await Promise.all(config.issueRepos.map(async (full) => {
    if (!isRepo(full)) return;
    checked.add(full.toLowerCase());
    const metadata = getJson<Repository>(`https://api.github.com/repos/${full}`).catch(() => null);
    const result = await loadRepository(full);
    const repo = await metadata;
    const createdAt = repo?.created_at ?? (full === config.sourceRepo ? config.sourceRepoCreatedAt : undefined);
    result.records.forEach((record) => { record.repoCreatedAt = createdAt; });
    found.push(...result.records);
    if (result.valid) validCount++;
    if (!result.valid || result.incomplete) unavailable = true;
  }));
  try {
    const q = encodeURIComponent(`${config.issueSearch.query} in:name org:${config.issueSearch.org}`);
    for (let page = 1; page <= 10; page++) {
      const body = await getJson<{ items?: Repository[]; total_count?: number; incomplete_results?: boolean }>(
        `https://api.github.com/search/repositories?q=${q}&per_page=100&sort=created&order=desc&page=${page}`,
      );
      if (!Array.isArray(body.items)) throw new Error('Public search was unavailable');
      if (body.incomplete_results || (body.total_count ?? 0) > 1000) unavailable = true;
      const repos = body.items.filter((repo) => {
        const full = repo.full_name;
        if (!isRepo(full) || checked.has(full.toLowerCase())) return false;
        const [org, name] = full.toLowerCase().split('/');
        return org === config.issueSearch.org.toLowerCase() && !!name?.includes(config.issueSearch.query.toLowerCase());
      });
      // Keep requests bounded when an organization has many unrelated matching names.
      for (let start = 0; start < repos.length; start += 6) {
        const results = await Promise.all(repos.slice(start, start + 6).map(async (repo) => {
          checked.add(repo.full_name!.toLowerCase());
          return loadRepository(repo.full_name!, repo.created_at);
        }));
        for (const result of results) {
          found.push(...result.records);
          if (result.valid) validCount++;
          if (result.incomplete) unavailable = true;
        }
      }
      if (body.items.length < 100 || page * 100 >= (body.total_count ?? Infinity)) break;
    }
  } catch { unavailable = true; }
  cache.liveKey = key;
  cache.live = {
    status: unavailable ? 'unavailable' : 'ok', issues: mergeIssues([], found),
    detail: unavailable ? 'live index unavailable' : `${validCount} ${validCount === 1 ? 'issue repository' : 'issue repositories'} checked`,
  };
  return cache.live;
}

function isNewer(candidate: IssueRecord, current: IssueRecord): boolean {
  const created = timestamp(candidate.repoCreatedAt) - timestamp(current.repoCreatedAt);
  if (created) return created > 0;
  // Publication time resolves same-repository updates; local copies win exact ties.
  const generated = timestamp(candidate.data.issue?.generatedAt) - timestamp(current.data.issue?.generatedAt);
  if (generated) return generated > 0;
  if (candidate.origin !== current.origin) return candidate.origin === 'bundled';
  return (candidate.repo ?? '').localeCompare(current.repo ?? '') > 0;
}

// Dates are covered UTC days. A later repository can replace an already bundled date.
export function mergeIssues(bundled: IssueRecord[], remote: IssueRecord[]): IssueRecord[] {
  const byDate = new Map<string, IssueRecord>();
  for (const record of [...bundled, ...remote]) {
    const date = coveredDate(record.data, record.date);
    const normalized = date === record.date ? record : { ...record, date };
    const current = byDate.get(date);
    if (!current || isNewer(normalized, current)) byDate.set(date, normalized);
  }
  return [...byDate.values()].sort((a, b) => b.date.localeCompare(a.date));
}
