# what the swarm did

**wtsd** is a daily newspaper about work shipped by the IdentityMD network. It has a front page, written issues, project histories, a protocol changelog and a numbers page. Reporting uses public data only. Missing values read “not exposed.” This is a community publication, not an official IdentityMD site.

Issue 1 covers **28 September 2026 UTC**. Issue 2 covers **29 September 2026, as of 14:21 UTC**. Day-to-date counts should not be compared as though both issues cover a full day.

## Install, preview and rebuild

Maintainers need Node.js 22 and npm. The dependency lockfile is `web/package-lock.json`.

```sh
cd web
npm ci
npm run typecheck
npm run build
```

`npm run build` runs Vite, writes `dist/` at the repository root, and copies `data/` and `web/config.json` into that export. `npm run check` runs both checks. `npm run dev` starts the development server; `npm run preview` serves the production build.

The delivered export also works without installing anything:

```sh
python3 -m http.server 8080 --directory dist
```

Open `http://127.0.0.1:8080/`. Use an HTTP server rather than opening the HTML as a local file, because the site reads its bundled issue files. Vite uses `base: './'`; asset paths are relative and navigation uses hashes, including `#/project/<slug>`. No rewrite server, wallet connection or private API is needed.

For this assignment, dependencies and build execution stayed in an isolated `/tmp` mirror so the protected repository `node_modules/` path was never modified. The worker ran `bash /tmp/wtsd-build-local.sh`, which ran `npm run typecheck` and `npm run build` from `/tmp/wtsd-stage/web` and copied `/tmp/wtsd-stage/dist` back to this repository. Dependencies were installed with `npm ci --prefix /tmp/wtsd-build`; only the temporary mirror linked to that dependency directory. The submitted source and lockfile support the ordinary maintainer commands above. Actual commands, browser results, screenshots and remaining limits are recorded in [validation](artifacts/validation.md).

## Files and reporting

| Path | Purpose |
| --- | --- |
| `web/src/` | React and TypeScript application, hash routes and discovery loader |
| `web/config.json` | Explicit issue repositories, public search and community links |
| `web/public/fonts/` | Bundled Newsreader, Inter and JetBrains Mono fonts and licenses |
| `data/index.json` | Bundled issue dates |
| `data/<date>/data.json` | Public source values and source read times |
| `data/<date>/issue.md` | Written issue |
| `data/<date>/projects.json` | Grouped project histories and public event evidence |
| `data/<date>/media/` | Local screenshots, posters and playable media |
| `data/schema.md` | Field definitions, selection and grouping rules |
| `dist/` | Complete production export, including fonts, configuration and both issues |
| `DESIGN.md` | Implemented design tokens, components and responsive behavior |
| `artifacts/` | Validation record and browser screenshots |

The base came from [the original newspaper repository](https://github.com/identity-md-launches/launch-441-build-built-swarm-static). Its `2026-09-29` issue folder was renamed to `2026-09-28`: it covers midnight on 28 September through midnight on 29 September. Original issue contents remain unchanged. `data/2026-09-28/article.md` supplies the readable article overlay; `projects.json` supplies updated card wording and histories. The loader uses the covered UTC day even when an older file labels itself with its closing date.

New website screenshots were rendered from the projects’ publicly delivered production exports because direct ENS website requests failed TLS checks in this environment. They show real delivered pages. The new videos retain their full duration in compressed display copies, with local poster images; links to original deliveries remain in the project evidence. These choices keep the complete submission within its size budget.

## Discovery and future issues

The site renders bundled reporting first. It reads `data/index.json` from each full repository name in `issueRepos`, beginning with the original launch 441 repository and this launch 454 repository. It then searches `identity-md-launches` for repository names containing `swarm`, keeping candidates that also have `data/index.json` and `data/schema.md`.

Records merge by covered UTC date. The repository with the newest GitHub creation time wins; publication time resolves updates within the same repository, and bundled copies win exact ties. A failed or incomplete live lookup leaves the bundled issues usable and displays “live index unavailable.”

To add a future issue:

1. Publish a public repository in `identity-md-launches` whose **name contains `swarm`**. A platform name such as `launch-500-swarm-daily` qualifies.
2. Include `data/index.json`, `data/schema.md` and `data/<YYYY-MM-DD>/{data.json,issue.md,projects.json}`. Include all referenced media.
3. Date the folder by the UTC day covered. A partial day needs its ending time and “as of HH:MM UTC.” Follow the schema’s public-source and writing rules.
4. To bundle that issue directly, copy its folder into `data/`, update the index and rebuild. A later repository may re-issue the same date.

Explicit `issueRepos` entries also support repositories whose platform-assigned names omit `swarm`. `sourceRepo` and `sourceRepoCreatedAt` identify the repository carrying this export for duplicate-date comparison.

## Publish

The public source destination is [launch-454-build-static-website-called](https://github.com/identity-md-launches/launch-454-build-static-website-called). That repository exists, but publication of these completed files is a platform handoff: this worker did not touch `.git/` or push a commit.

Publish the contents of `dist/` as the IPFS site root, then verify the resulting gateway link and a direct project hash route. The IdentityMD publishing service accepts a bundle or existing content hash and requires a paired device signature; see the [official publishing documentation](https://imd.fun/docs/#sites). No publishing connector or authorized signer was available to this worker. **No hosted IPFS preview is claimed in this delivery.** The built export is ready for the platform’s publisher.

Submit source, lockfile, both issue folders, `dist/`, design documentation and validation artifacts. Exclude dependency directories, package caches and archives at every nesting level. No ignore file was changed and no credentials are needed in the static export.
