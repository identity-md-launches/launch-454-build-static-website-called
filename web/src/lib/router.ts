import { useEffect, useState } from 'react';
export type Route = { page: 'built'; kind: string | null; date: string | null } | { page: 'issue'; date: string | null } | { page: 'project'; slug: string; date: string | null } | { page: 'changelog' | 'numbers'; date?: string | null };
export function parseHash(hash: string): Route {
  const [path = '', query = ''] = hash.replace(/^#/, '').split('?');
  const segs = path.split('/').filter(Boolean), params = new URLSearchParams(query);
  switch (segs[0]) {
    case 'issue': return { page: 'issue', date: segs[1] ?? null };
    case 'project': return { page: 'project', slug: decodeURIComponent(segs[1] ?? ''), date: params.get('date') };
    case 'changelog': return { page: 'changelog' };
    case 'numbers': return { page: 'numbers' };
    default: return { page: 'built', kind: params.get('kind'), date: params.get('date') };
  }
}
export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  useEffect(() => { const change = () => setRoute(parseHash(window.location.hash)); window.addEventListener('hashchange', change); return () => window.removeEventListener('hashchange', change); }, []);
  return route;
}
export const href = {
  built: (kind?: string | null, date?: string | null) => { const p = new URLSearchParams(); if (kind) p.set('kind', kind); if (date) p.set('date', date); return '#/' + (p.size ? '?' + p : ''); },
  issue: (date?: string | null) => date ? `#/issue/${date}` : '#/issue',
  project: (slug: string, date?: string | null) => `#/project/${encodeURIComponent(slug)}${date ? '?date=' + date : ''}`,
  changelog: '#/changelog', numbers: '#/numbers',
};
