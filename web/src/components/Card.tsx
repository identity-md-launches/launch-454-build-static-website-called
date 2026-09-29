import type { GalleryItem, Kind } from '../types';
import { KINDS } from '../types';
import { resolveUrl } from '../lib/markdown';
import { category, editorial, openLink, projectSlug } from '../lib/editorial';
import { href } from '../lib/router';
import { Glyph } from './Glyph';
export function Status({ state, reason }: { state?: string; reason?: string }) { return <span className={`status status-${state?.replace(' ','-')}`}><i aria-hidden="true"/>{state ?? 'accepted'}{reason && !['live','published'].includes(state ?? '') ? `: ${reason}` : ''}</span>; }
export function MediaBlock({ item, base, large = false }: { item: GalleryItem; base: string; large?: boolean }) {
  const m = item.media ?? {}, src = m.src ? resolveUrl(m.src, base) : null, poster = m.poster ? resolveUrl(m.poster, base) : null, x = item.extra ?? {};
  if ((m.type === 'screenshot' || m.type === 'image') && src) return <img className="media-img" src={src} alt={`${item.name} — ${m.type === 'screenshot' ? 'website preview' : 'delivered image'}`} loading={large ? 'eager' : 'lazy'} decoding="async" width="1280" height="800"/>;
  if (m.type === 'video' && src) return <video className="media-video" controls preload="none" poster={poster ?? undefined} playsInline aria-label={`${item.name} video`}><source src={src}/><a href={src}>watch video</a></video>;
  if (m.type === 'audio' && src) return <div className="tile"><p>{item.name}</p><audio controls preload="none" src={src} aria-label={`${item.name} audio`}/></div>;
  const functions = (Array.isArray(x.functions) ? x.functions : Array.isArray(x.signatures) ? x.signatures : []) as string[];
  return <div className={`tile tile-${item.kind}`}>
    {item.kind === 'oracle' ? <><p className="tile-question">{item.idea}</p><div><span className="tile-label">answer · {x.agreed != null && x.panel != null ? `${String(x.agreed)} of ${String(x.panel)} agreed` : 'agreement not exposed'}</span><strong className="tile-answer">{String(x.answer ?? 'not exposed')}</strong></div></> : item.kind === 'heartbeat' ? <><span className="tile-label">recurring check</span><p className="tile-cadence">{String(x.cadence ?? 'not exposed').replace('every PT1H','every hour').replace('every P1D','every day')}</p><strong className="tile-name">{item.name}</strong></> : category(item) === 'reviews' ? <><span className="tile-label">review findings</span><p className="tile-code">{typeof x.findings === 'object' ? JSON.stringify(x.findings) : String(x.findings ?? 'Finding counts not exposed')}</p><span className="tile-label">{String(x.verdict ?? item.status?.state ?? 'not exposed')}</span><strong className="tile-name">{item.name}</strong></> : item.kind === 'token' || item.kind === 'launch' ? <><dl className="tile-facts"><div><dt>supply</dt><dd>{String(x.supply ?? 'not exposed')}</dd></div><div><dt>pool pair</dt><dd>{String(x.pair ?? 'not exposed')}</dd></div><div><dt>opening cap</dt><dd>{String(x.openingCap ?? 'not exposed')}</dd></div></dl><strong className="tile-name">{item.name}</strong></> : <><span className="tile-label">{category(item) === 'contracts' ? 'from the source' : 'from the public record'}</span><div className="tile-code">{functions.length ? functions.slice(0,3).map(f => <code key={f}>{f}</code>) : <span>{category(item) === 'contracts' ? 'Public functions not exposed' : item.status?.state ?? 'accepted'}</span>}</div><strong className="tile-name">{item.name}</strong></>}
  </div>;
}
export function Card({ item: raw, base, date, lead = false, onSelectKind }: { item: GalleryItem; base: string; date?: string; lead?: boolean; onSelectKind?: (k: Kind) => void }) {
  const item = editorial(raw), kind = KINDS.includes(item.kind as Kind) ? item.kind as Kind : 'contracts';
  const detail = href.project(projectSlug(item),date), open = openLink(item.links,item.kind);
  const title = item.headline ?? item.name;
  return <article className={`card card-${category(item) === 'media' ? 'category-media' : category(item)}${lead ? ' lead-card' : ''}`}>
    <div className="card-media"><MediaBlock item={item} base={base} large={lead}/><Glyph kind={kind} onSelect={onSelectKind}/></div>
    <div className="card-body"><p className="card-meta">{lead ? 'THE LEAD' : category(item)}<span>{item.at?.slice(11,16)} UTC</span></p>
      {lead ? <h1 className="card-title"><a className="story-link" href={detail}>{title}</a></h1> : <h3 className="card-title"><a className="story-link" href={detail}>{title}</a></h3>}
      {lead && <p className="standfirst">{item.idea} {item.today}</p>}
      <div className="labelled"><p><span className="line-label">idea</span><span>{open ? <a className="project-name" href={open}>{item.name}</a> : item.name}. {item.idea}</span></p>{item.kind !== 'oracle' && <p><span className="line-label">today</span><span>{item.today}</span></p>}<p><span className="line-label">status</span><Status state={item.status?.state} reason={item.status?.reason}/></p></div>
      <div className="card-links">{open && <a href={open} aria-label={`Open ${item.name}`}>open ↗</a>}<a href={detail} aria-label={`Details for ${item.name}`}>details →</a></div>
    </div>
  </article>;
}
