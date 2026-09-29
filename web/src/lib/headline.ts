import { metricValue, type IssueRecord } from '../types';
export interface Headline { key: string; label: string; value: number | null; note?: string }
export function headlines(r: IssueRecord): Headline[] {
 const d = r.data;
 return [
  {key:'machines',label:'machines were online',value:metricValue(d.network?.connectedDaemons)},
  {key:'jobs',label:'jobs were opened in this issue’s window',value:metricValue(d.jobs?.last24hTotal)},
  {key:'launches',label:'launches were opened in this issue’s window',value:d.launches?.last24h?.length ?? null},
  {key:'answers',label:'questions received answers in this issue’s window',value:metricValue(d.oracle?.attestedLast24h)},
  {key:'schedules',label:'recurring jobs were active',value:metricValue(d.schedules?.active)},
 ];
}
export const fmt = (v: number | null | undefined) => v === null || v === undefined ? 'not exposed' : v.toLocaleString('en-US',{maximumFractionDigits:2});
