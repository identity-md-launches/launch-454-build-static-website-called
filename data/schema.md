# WHAT THE SWARM DID data schema

Each issue is filed under the UTC day it covers: `data/<YYYY-MM-DD>/` contains `data.json`,
`issue.md`, `projects.json` and any real media in `media/`. `data/index.json` lists
`{"issues":[{"date":"2026-09-28","number":1},{"date":"2026-09-29","number":2,"generatedAt":"…"}]}`.

The first issue was moved from `2026-09-29` to `2026-09-28` without changing its original files.
Its embedded date and original article retain the old label. The index and folder are authoritative.
`article.md`, when present, is the readable display edition; the original `issue.md` remains the archive.

## Conventions

- **Metric**: `{value, source, readAt, note?}`. `source` is a public URL and `readAt` is the actual UTC
  read time. Unavailable values are `null`, displayed as “not exposed”. Numeric members of array
  records carry the array record's `source` and `readAt`.
- **Window**: `issue.windowStart` is midnight UTC on the covered day. `issue.windowEnd` is the cutoff.
  Issue 1 covers the complete 28 September UTC day; issue 2 covers 29 September to **14:21 UTC**.
  Legacy `last24h` keys now mean that issue's stated window, including partial days. Counts of
  jobs/questions use creation time; published answers use publication time; sites use naming time.
- Network values are snapshots at read time. Seat activity uses trailing 24-hour/7-day windows.
  `acceptedLastDay` is the public service's trailing count of accepted work steps, not finished jobs.
- A read may follow the cutoff while retrieving details of an earlier event. Every read keeps its
  own timestamp. Events after the cutoff are excluded from the current issue's gallery.
- Media paths are relative to the issue folder. `mediaIssue` on projects identifies the media's issue.
  Full-duration compact video copies retain links and hashes for the delivered originals.
- No private endpoints, authentication, wallet connection or inferred outcomes are used. Public
  acceptance is reported as acceptance; it does not imply independent testing or factual accuracy.

## data.json

Version 1 keys remain available:

| Key | Shape and meaning |
| --- | --- |
| `issue` | `{date, number, title, windowStart, windowEnd, generatedAt, previousIssue, deltas, schema, asOf?}`. `asOf` is the human-readable UTC cutoff; deltas compare the two snapshots. |
| `network` | `{connectedDaemons, activeEnrollments, workingNow, acceptedLastDay, pendingFeedback, deployBreaker, payments:{quoted,paid,expired,failed}, explorerActivity:{working,jobs,oracle,at}}`; numeric members are Metrics. A null breaker means the source reports no active stop. |
| `launches` | `{highestNumber, byStatus, last24h, parkedReasons}`. Each launch is `{id,number,name,kind,status,policyVersion,repo,pair,chainId,createdAt,parkedReason,artifacts,source,readAt}`; optional `supply` and `openingCap` carry exposed launch values. Status counts cover all returned launches. |
| `policies` | `[{version,kind,note,createdAt,chainId,source,readAt}]`. All public policies are retained; the article includes policies created in the rolling seven days before cutoff. `note` preserves exact published text. |
| `jobs` | `{last24hTotal,last24hByKind,createdBySchedule}`. `createdBySchedule` is all-time purchased runs consumed (`runsBought-runsRemaining`), not an issue-window count. |
| `oracle` | `{last24hTotal,last24hByStatus,attestedLast24h,galleryShown,galleryRest,exampleQuestions,models,modelsNote,attester}`. Empty models means names were not exposed; never infer providers from wallets. |
| `schedules` | `{active,total,items:[{id,label,action,cadence,status,statusReason,runsRemaining,runsBought,nextRunAt,lastRunAt,createdAt,question,evidence,source,readAt}]}`. Counts are Metrics; cadence retains the public ISO duration/cron format here. |
| `seats` | `{active24h,active7d,everWorked,everAccepted,totalAccepted,top5Share,top20Share,top5}`. Shares are fractions, not percentages. Each top seat is `{tokenId,accepted,source,readAt}`. |
| `changelog` | `{baselineAsOf,baselineNote,docsToc,docsRoutes,paidActions,skills,versionFeatures,versionCommit,services,workerRelease,workerReleasesLast7d,dated,diff?}`. Skills are `{id,version,role,tier}`; services `{kind,version,up}`. `diff` contains only actual `{before,after}` changes against the first issue. |
| `briefs` | `{accepted,parked}`. Accepted records carry job ID, address-redacted objective, skill, attempt, revisions, minutes to acceptance and provenance. |
| `gallery` | Array of card items, newest first. Kept for v1 compatibility; identical to `items` in issue 2. |
| `items` | New card array, same records as `gallery`; shape below. |
| `sources` | `[{url,readAt,status}]`, including unsuccessful reads and retries. |
| `coverage` | Optional `{lists,limits,windowNote}` documenting observable scope and missing source details. |

### Card item

`{id,name,headline,kind,at,idea,today,status,projectSlug,asked,built,media,links,extra,source,readAt}`.

- `headline`: factual, plain text, at most 10 words.
- `idea`: one plain sentence explaining purpose; for an oracle, the question; for a recurring job,
  what runs and how often.
- `today`: one sentence describing the observed action in this issue's window.
- `status`: `{state,reason}`; state is `live|published|accepted|in review|parked|failed`. Reasons for
  other than live/published are plain and at most 20 words.
- `projectSlug`: stable project identity used by `#/project/<slug>`.
- `asked` and `built`: preserved legacy fields. When new fields are missing, use project card
  overrides, then derive concise copy from these fields; default unknown status to accepted.
- `kind`: `token|contracts|hook|report|website|image|audio|video|oracle|heartbeat|community`.
  UI categories are websites, contracts, launches, oracle, reviews, reports and media.
- `media`: `{type,src,poster,...}`. Type is `screenshot|image|video|audio|none`; never invent media.
  Optional `original`, `originalSha256`, `sha256`, `bytes` and `note` document display derivatives.
- `links`: `{site,repo,launch,job,cid,oracle?,schedule?}`; null means unavailable. Visible names link
  to the live site, else explorer launch, else explorer job, else repository. Oracle and recurring
  job names link to their own public records. Technical source links remain in details.
- `extra`: kind-specific facts. Oracle uses `{question,answer,agreed,panel,answerType,rawQuestion}`;
  absent current answers/counts are “not exposed”/null. Contracts use `signatures` copied from
  public source. Recurring jobs use plain `label` and `cadence`. Technical fields stay in details.

### Selection

Every site named in the window; every launch that went live; every accepted image/audio/video/report
job; ten most recent published oracle answers; every active schedule; up to ten other accepted jobs
with a public delivery. An accepted image job with a failed delivery remains visible as failed with
no invented image. Parked launches with accepted public work remain visible with the actual reason.
A single project can have separate launch and website cards, pointing to one combined timeline.

## projects.json

An array:

```json
[{
  "slug": "docket",
  "name": "Docket",
  "kind": "contracts",
  "idea": "A public board lets people post and discuss job ideas.",
  "events": [{
    "date": "2026-09-28T23:41:53.914Z",
    "summary": "The launch stopped because the setup still added an unwanted token.",
    "status": "parked",
    "reason": "the launch setup still added a token",
    "links": {"job": "https://explorer.imd.fun/jobs/f7305439-3c69-4dd5-843e-024bc255a5de"},
    "raw": {}
  }]
}]
```

Events sort oldest first. `raw` holds the original technical facts, read URLs and timestamps,
including verdicts, reviews, chain numbers and repository names. Display raw only in collapsed
“technical details” blocks. The timeline covers dated public events in the records read, not an
unexposed event log. Earlier review revisions without dates remain raw, not invented dated events.

Optional project fields: `media`, `mediaIssue`, `links`, `coverage`, `cards`. `cards` is an array of
`{id,name,headline,idea,today,status,projectSlug,extra}` editorial overrides keyed by original card ID.
This lets issue 1 display plain copy while its original data and article remain byte-for-byte intact.

Group by exact project name, then meaningful repository name stem after `launch-<number>-`.
Docket launches 195/197/439 form `docket`; Heirloom contracts, launch and website form `heirloom`;
Pacts contracts and website form `pacts`. Generic workflow repository names are resolved only by
explicit public workflow objective. Identical recurring oracle questions share one project.
Issue 2 projects retain prior events, including Docket and Heirloom, for direct project reloads.

## Discovery

`config.json` uses `issueRepos` (full repository names) plus `issueSearch:{org,query:"swarm"}`.
Render bundled data first, then read each configured repository's `data/index.json` from public raw
GitHub. Search repositories within the organization whose name contains the query; keep only those
with both `data/index.json` and `data/schema.md`. Merge dates with newer repositories taking priority.
Network failure leaves bundled data readable and shows “live index unavailable”. Future repositories
join by including “swarm” in their name and shipping the same index and per-day files.
