import { useMemo } from 'react';
import { LiveNote } from '../components/Chrome';
import type { IssuesState } from '../data/useIssues';
import { fmt, headlines } from '../lib/headline';
import { href } from '../lib/router';
import { metricValue, type IssueRecord } from '../types';

interface Row { key: string; label: string; get: (r: IssueRecord) => number | null }

const ROWS: Row[] = [
  ...headlines({ date: '', number: null, origin: 'bundled', base: '', data: {}, markdown: null }).map((h) => ({ key: h.key, label: h.label, get: (r: IssueRecord) => headlines(r).find((x) => x.key === h.key)?.value ?? null })),
  { key: 'jobs24', label: 'jobs opened in the issue’s window', get: (r) => metricValue(r.data.jobs?.last24hTotal) },
  { key: 'acceptedLastDay', label: 'work accepted in the last 24 hours', get: (r) => metricValue(r.data.network?.acceptedLastDay) },
  { key: 'working', label: 'machines working at read time', get: (r) => metricValue(r.data.network?.workingNow) },
  { key: 'pendingFeedback', label: 'work awaiting feedback', get: (r) => metricValue(r.data.network?.pendingFeedback) },
  { key: 'paid', label: 'paid orders since records began', get: (r) => metricValue(r.data.network?.payments?.paid) },
  { key: 'highest', label: 'highest launch number', get: (r) => metricValue(r.data.launches?.highestNumber) },
  { key: 'everWorked', label: 'contributors who have worked', get: (r) => metricValue(r.data.seats?.everWorked) },
  { key: 'top20', label: 'work share of the 20 busiest contributors (%)', get: (r) => metricValue(r.data.seats?.top20Share) },
];

function LineChart({ label, points }: { label: string; points: { date: string; value: number | null }[] }) {
  const w = 320;
  const h = 96;
  const pad = 8;
  const vals = points.map((p) => p.value).filter((v): v is number => v !== null);
  if (vals.length < 3) return null;
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  const x = (i: number) => pad + (i * (w - 2 * pad)) / Math.max(points.length - 1, 1);
  const y = (v: number) => h - pad - ((v - min) * (h - 2 * pad)) / span;
  const d = points.map((p, i) => (p.value === null ? null : `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`)).filter(Boolean).join(' ');
  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} role="img" aria-label={`${label}: ${points.map((p) => `${p.date} ${p.value ?? 'n/a'}`).join(', ')}`}>
        <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (p.value === null ? null : <circle key={p.date} cx={x(i)} cy={y(p.value)} r="2.5" fill="currentColor" />))}
      </svg>
      <figcaption>{label} · {fmt(min)} to {fmt(max)}</figcaption>
    </figure>
  );
}

export function Numbers({ state }: { state: IssuesState }) {
  const asc = useMemo(() => [...state.issues].sort((a, b) => (a.date < b.date ? -1 : 1)), [state.issues]);
  if (!state.bundledReady) return <p className="live-note" role="status">loading the bundled issue…</p>;
  if (!asc.length) return <section className="empty"><h1 className="page-title">numbers</h1><p>no issue data available.</p></section>;
  return (
    <>
      <h1 className="page-title">numbers</h1>
      <p className="muted">Two days in the life of the network. September 28 covers a full day; September 29 covers the day so far. Counts for those windows are not equal-length comparisons.</p>
      <LiveNote live={state.live} detail={state.liveDetail} />
      <div className="table-wrap">
        <table className="numbers">
          <thead>
            <tr>
              <th scope="col">metric</th>
              {asc.map((r) => <th key={r.date} scope="col"><a href={href.issue(r.date)}>{r.date}</a></th>)}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.key}>
                <th scope="row">{row.label}</th>
                {asc.map((r) => <td key={r.date} className="num">{fmt(row.get(r))}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {asc.length >= 3 ? (
        <section aria-labelledby="charts-title" className="charts">
          <h2 id="charts-title">trends</h2>
          {ROWS.slice(0, 5).map((row) => <LineChart key={row.key} label={row.label} points={asc.map((r) => ({ date: r.date, value: row.get(r) }))} />)}
        </section>
      ) : (
        <p className="muted">line charts appear once three or more issues exist ({asc.length} so far).</p>
      )}
    </>
  );
}
