import { useMemo } from 'react';
import type { IssuesState } from '../data/useIssues';
import { renderMarkdown, wordCount } from '../lib/markdown';
import { href } from '../lib/router';
export function Issue({ state, date }: { state: IssuesState; date: string | null }) {
 const selected = state.issues.find(i=>i.date===date) ?? state.issues[0];
 const text = selected?.article ?? selected?.markdown;
 const title = text?.match(/^# .+$/m)?.[0] ?? '# The daily issue';
 const articleBody = text?.replace(/^# .+\n+/, '').replace(/^\d{1,2} [A-Za-z]+ \d{4} · issue[^\n]+\n+/, '');
 const body = useMemo(()=>articleBody && selected ? renderMarkdown(articleBody,selected.base) : null,[articleBody,selected]);
 if(!selected)return <p role="status">{state.bundledReady ? 'No issue is available.' : 'Opening the issue…'}</p>;
 if(date && selected.date!==date)return <section className="empty"><h1>Issue not found</h1><a href={href.issue(selected.date)}>read the newest issue →</a></section>;
 return <><div className="issue-toolbar"><label className="field"><span>choose an issue</span><select value={selected.date} onChange={e=>{window.location.hash=href.issue(e.target.value);}}>{state.issues.map(i=><option key={i.date} value={i.date}>{i.date} · issue {i.number}</option>)}</select></label><span>{text ? `${Math.ceil(wordCount(text.replace(/<details>[\s\S]*?<\/details>/g,''))/220)} minute read` : ''}</span></div>
 <article className="prose" aria-label={`Issue ${selected.number} for ${selected.date}`}>{renderMarkdown(title,selected.base)}<p className="issue-dateline">ISSUE {selected.number} · {selected.date} · {selected.number === 1 ? 'THE FULL UTC DAY' : `AS OF ${selected.data.issue?.windowEnd?.slice(11,16)} UTC`}</p>{body ?? <p>The issue text is not available.</p>}
 <details className="original"><summary>issue files</summary><p><a href={selected.base+'issue.md'}>original written issue</a> · <a href={selected.base+'data.json'}>data and source records</a> · <a href={selected.base+'projects.json'}>project histories</a></p>{selected.number===1 && <p>This edition covers September 28. Its original files retain the date written by the first job.</p>}</details></article></>;
}
