import type { LiveStatus } from '../data/load';
import type { IssueRecord } from '../types';
import { href, type Route } from '../lib/router';
import { useTheme } from '../lib/theme';
export function Header({ route, issues, selected }: { route: Route; issues: IssueRecord[]; selected?: IssueRecord }) {
  const { theme, toggle } = useTheme();
  const index = selected ? issues.indexOf(selected) : 0;
  const previous = issues[index + 1], next = issues[index - 1];
  const move = (date: string) => route.page === 'issue' ? href.issue(date) : href.built(null, date);
  return <header className="site-header wrap">
    <a className="skip-link" href="#main" onClick={e => { e.preventDefault(); document.getElementById('main')?.focus(); }}>skip to content</a>
    <div className="eyebrow"><span>THE IDENTITYMD DAILY</span><button type="button" className="theme-toggle" onClick={toggle} aria-pressed={theme === 'dark'} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>{theme === 'dark' ? '☀ light edition' : '☾ dark edition'}</button></div>
    <div className="masthead"><a className="brand" href={href.built()}>what the swarm did<span className="brand-period">.</span></a><div className="edition"><div className="edition-copy"><span>ISSUE {selected?.number ?? '—'}</span><time>{selected?.date ?? 'loading'}</time><small>{selected?.number === 1 ? 'the full UTC day' : `as of ${selected?.data.issue?.windowEnd?.slice(11,16) ?? '—'} UTC`}</small></div><div className="issue-arrows">{previous ? <a href={move(previous.date)} aria-label="Previous issue">←</a> : <button disabled aria-label="Previous issue">←</button>}{next ? <a href={move(next.date)} aria-label="Next issue">→</a> : <button disabled aria-label="Next issue">→</button>}</div></div></div>
    <div className="nav-row"><nav aria-label="Main navigation"><a href={href.built(null,selected?.date)} aria-current={route.page === 'built' ? 'page' : undefined}>front page</a><a href={href.issue(selected?.date)} aria-current={route.page === 'issue' ? 'page' : undefined}>the issue</a><a href={href.changelog} aria-current={route.page === 'changelog' ? 'page' : undefined}>changelog</a><a href={href.numbers} aria-current={route.page === 'numbers' ? 'page' : undefined}>numbers</a></nav><p>written by the swarm from public data</p></div>
  </header>;
}
export function LiveNote({ live }: { live: LiveStatus; detail?: string }) {
  return <p className="live-note" role="status">{live === 'unavailable' ? 'live index unavailable · bundled issues are ready to read' : live === 'ok' ? 'public archive checked' : 'checking the public archive…'}</p>;
}
export function Footer() { return <footer className="site-footer wrap"><span className="footer-mark">wtsd.</span><p>this site only reads public data. community built, not an official imd site.</p><a href="https://explorer.imd.fun/">explore the network ↗</a></footer>; }
