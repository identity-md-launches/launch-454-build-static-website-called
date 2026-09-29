import { MediaBlock, Status } from '../components/Card';
import type { IssuesState } from '../data/useIssues';
import { issueItems, openLink, projectSlug, clean, category } from '../lib/editorial';
import { href } from '../lib/router';
import type { ProjectEvent, Links } from '../types';
export function Project({ state, slug, date }: { state: IssuesState; slug: string; date: string | null }) {
 const records = [...state.issues].sort((a,b)=>b.date.localeCompare(a.date));
 const projects = records.flatMap(r=>(r.projects ?? []).filter(p=>p.slug===slug).map(p=>({p,r})));
 const matches = records.flatMap(r=>issueItems(r).filter(g=>projectSlug(g)===slug).map(g=>({g,r})));
 const project = projects[0]?.p;
 const media = matches.find(m=>m.g.media?.src) ?? matches[0];
 const name = project?.name ?? media?.g.name, idea = project?.idea ?? media?.g.idea;
 const seen = new Set<string>();
 const events: ProjectEvent[] = projects.flatMap(x=>x.p.events).filter(e=>{const k=JSON.stringify([e.date,e.summary,e.links]);if(seen.has(k))return false;seen.add(k);return true;}).sort((a,b)=>a.date.localeCompare(b.date));
 if (!events.length) for (const {g} of matches) events.push({date:g.at ?? '',summary:g.today ?? '',status:g.status?.state ?? 'accepted',reason:g.status?.reason ?? '',links:g.links ?? {},raw:{...g}});
 events.sort((a,b)=>a.date.localeCompare(b.date));
 if (!state.bundledReady) return <p role="status">Opening the project history…</p>;
 if (!name) return <section className="empty"><h1>Project not found</h1><p>This project is not in the available issues.</p><a href={href.built()}>return to the front page →</a></section>;
 const links = Object.assign({},...events.map(e=>e.links)) as Links;
 const open = openLink(links,project?.kind ?? media?.g.kind);
 return <article className="project-page">
  <a className="back-link" href={href.built(null,date)}>← front page</a><p className="small-label">THE PROJECT FILE · {events.length} PUBLIC EVENTS</p>
  <h1>{open ? <a href={open}>{name}</a> : name}</h1>
  {media && <div className={`project-media card-${category(media.g) === 'media' ? 'category-media' : category(media.g)}`}><MediaBlock item={media.g} base={media.r.base} large/></div>}
  <p className="project-idea"><span className="line-label">idea</span>{clean(idea ?? 'The public description is not exposed.')}</p>
  <h2 className="section-rule">the story so far <span>· oldest first</span></h2>
  <ol className="timeline">{events.map((e,i)=><li key={`${e.date}-${i}`}><time dateTime={e.date}>{e.date.slice(0,10)}<span>{e.date.slice(11,16)} UTC</span></time><div className="event-body"><p>{clean(e.summary)}</p><Status state={e.status} reason={e.reason}/><div className="event-links">{Object.entries(e.links ?? {}).filter(([k,v])=>v && ['job','launch','review','site','repo','oracle','schedule'].includes(k)).map(([k,v])=><a key={k} href={v as string}>{k} ↗</a>)}</div><details><summary>technical details</summary><pre>{JSON.stringify(e.raw ?? {},null,2)}</pre></details></div></li>)}</ol>
 </article>;
}
