import { Card } from '../components/Card';
import { LiveNote } from '../components/Chrome';
import type { IssuesState } from '../data/useIssues';
import { categories, category, issueItems } from '../lib/editorial';
import { fmt, headlines } from '../lib/headline';
import { href } from '../lib/router';
import type { IssueRecord, Kind } from '../types';
export function Built({ state, kind, selected }: { state: IssuesState; kind: string | null; selected?: IssueRecord }) {
  const filter = categories.includes(kind ?? '') ? kind! : 'all';
  const items = selected ? issueItems(selected).sort((a,b)=>(b.at ?? '').localeCompare(a.at ?? '')) : [];
  const visible = filter === 'all' ? items : items.filter(g=>filter === 'launches' ? Boolean(g.links?.launch) || g.kind === 'token' || g.kind === 'launch' : category(g)===filter);
  const lead = visible.find(g=>['screenshot','image','video'].includes(g.media?.type ?? '')) ?? visible[0];
  const rest = visible.filter(g=>g!==lead);
  const setKind = (k: Kind) => { window.location.hash = href.built(category({kind:k}),selected?.date); };
  return <>
    <div className="filters" role="group" aria-label="Filter by category">{categories.map(k=><a key={k} href={href.built(k==='all'?null:k,selected?.date)} aria-current={filter===k ? 'true':undefined}>{k}</a>)}</div>
    {!selected ? <p role="status">{state.bundledReady ? 'No issue is available.' : 'Opening the newspaper…'}</p> : <>
      <div className="page-kicker"><span>{new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(selected.date+'T12:00:00Z')).toUpperCase()}</span><span>{filter === 'all' ? 'A RECORD OF WORK, ONE DAY AT A TIME' : `${filter} in this edition`}</span></div>
      <p className="visually-hidden" role="status">{visible.length} items in {filter}</p>
      {lead ? <div className="front-top"><Card item={lead} base={selected.base} date={selected.date} lead onSelectKind={setKind}/><aside className="minute"><p className="small-label">THE DAILY BRIEF</p><h2>in one minute</h2><ul>{headlines(selected).map(h=><li key={h.key}><strong>{fmt(h.value)}</strong><span>{h.label}</span></li>)}</ul><a href={href.issue(selected.date)}>read the whole issue →</a></aside></div> : <section className="empty"><h1>No {filter} items today</h1><p>No work in this category appears in the public records for this issue.</p><a href={href.built(null,selected.date)}>see all stories →</a></section>}
      {rest.length > 0 && <section className="more-stories" aria-labelledby="more-title"><h2 className="section-rule" id="more-title">also today <span>· {rest.length} more items · newest first</span></h2><div className="grid">{rest.map((g,i)=><Card key={g.id ?? i} item={g} base={selected.base} date={selected.date} onSelectKind={setKind}/>)}</div></section>}
      <LiveNote live={state.live}/>
    </>}
  </>;
}
