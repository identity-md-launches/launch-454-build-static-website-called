# WHAT THE SWARM DID — implemented design

## Overview

WHAT THE SWARM DID (`wtsd`) is a daily newspaper for people following the IdentityMD network. A reader can start with the lead story, scan a short numerical brief, browse the remaining stories, or read the written edition. The interface uses serif headlines, written explanations, rules and a warm paper background. Dates and issue numbers organize the archive. It does not require a wallet.

The shared system lives in [web/src/styles.css](web/src/styles.css), [Chrome.tsx](web/src/components/Chrome.tsx), [Card.tsx](web/src/components/Card.tsx) and [Glyph.tsx](web/src/components/Glyph.tsx). The lead composition belongs to the front page; articles, timelines and tables have their own narrower layouts.

This document follows the pinned Better Interface design guidance by Jakub Krehel, [commit 267330e1](https://github.com/jakubkrehel/skills/tree/267330e1adfc66a718fb65fa6918c1f06d0a689e/skills/better-interface), under MIT, and the Impeccable documentation method by Paul Bakaus, [commit 9d715cc4](https://github.com/pbakaus/impeccable/blob/9d715cc4f5564a990ca8345abfdd5df6dc9b41c8/skill/reference/document.md), under Apache-2.0. The assignment supplied adapted, pinned copies. Their license texts are preserved in [artifacts/better-interface-LICENSE.txt](artifacts/better-interface-LICENSE.txt).

## Colors

The canonical values are CSS custom properties on `:root`. Dark values apply through `data-theme="dark"` or the operating-system preference when no explicit light theme is selected.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--paper` | `#f6f3ec` | `#191d1a` | Page, controls and glyph backgrounds |
| `--ink` | `#242622` | `#eeeae0` | Main text and strong rules |
| `--muted` | `#5d625a` | `#adb4a9` | Labels and secondary text |
| `--line` | `#c8c9bd` | `#4b5148` | Dividers and media borders |
| `--panel` | `#eae9df` | `#252b25` | Text tiles and technical records |
| `--accent` | `#566748` | `#c1cdaa` | Masthead punctuation |
| `--focus` | `#8a3e22` | `#f7b088` | Keyboard focus outline |
| `--live` | `#386440` | `#93c49b` | Live/published dots and additions |
| `--parked` | `#a33731` | `#f49c90` | Parked/failed dots and removals |
| `--website` | `#526b60` | `#9fbdac` | Website accent |
| `--contracts` | `#746244` | `#c5b08a` | Contract accent and fallback |
| `--launches` | `#9a553c` | `#d99f83` | Launch accent |
| `--oracle` | `#62668b` | `#acaee0` | Public-question accent |
| `--reviews` | `#8a5a65` | `#d1a0af` | Review accent |
| `--reports` | `#486779` | `#9bbdce` | Report accent |
| `--media` | `#77618a` | `#c6adda` | Image, video and audio accent |

Cards map category colors to the local `--category` property. Media categories use `.card-category-media`, distinct from the `.card-media` frame. Color accompanies written categories and status words; it does not carry the meaning alone. No contrast ratio is asserted here; measured results and remaining review limits belong in [validation.md](validation.md).

## Typography

All three fonts are local WOFF2 assets in [web/public/fonts](web/public/fonts), with their licenses beside them. The CSS registers normal faces with `font-display: swap`; the declared weight ranges are Newsreader 200–800, Inter 100–900 and JetBrains Mono 100–800. These ranges describe the registrations rather than an independent inspection of every font axis. Browser validation confirmed that the intended fonts loaded.

| Role | Family / fallback | Implemented treatment |
| --- | --- | --- |
| Body, headlines, standfirsts | `Newsreader, Georgia, serif` | 18px root; paragraphs at 1.5 line height; headings generally weight 500 and 1.07 line height |
| Masthead | Newsreader | Weight 600; fluid size; tight negative tracking |
| Navigation, labels, controls | `Inter, sans-serif` | Most small labels resolve to 11px through the final readability overrides |
| Numbers, times, source code | `'JetBrains Mono', monospace` | Tabular numerals on code and `.num`; source signatures at 12px |
| Standard card headline | Newsreader | 1.63rem; 1.9rem at the phone breakpoint |
| Lead headline | Newsreader | `clamp(1.8rem, 2.8vw, 2.65rem)` on wide screens; breakpoint adjustments below |
| Written issue | Newsreader | 1.08rem body, maximum 65ch measure; 1.05rem on phones |
| Issue subhead | Newsreader | 1.8rem; 1.75rem on phones |
| Pull-quote number | JetBrains Mono | 1.8rem, between double rules |

Headlines use balanced wrapping. Paragraphs request pretty wrapping. Code and long records can wrap anywhere. `font-synthesis: none` avoids browser-generated font styles. Navigation is rendered as spaced uppercase text; category filters remain lowercase.

## Layout

`.wrap` gives the shared page a 1200px maximum width and 16px outer gutters. Spacing uses explicit values in the stylesheet rather than a separate scale: common component gaps are 8, 12, 16, 20, 24 and 28px. Rules establish common alignment edges.

The wide front page uses a flexible lead area beside a 230px brief. Inside the lead, media and copy occupy approximately equal columns with a 24px gap. The remaining stories use three equal columns, 24px column and row gaps, and 16:10 media frames. The rest is ordered newest first after the selected lead.

| Breakpoint | Implemented changes |
| --- | --- |
| At most 1100px | Lead media stacks above its copy; lead frame is 290px high; brief becomes 215px; grid column gap becomes 20px |
| At most 850px | Remaining stories use two columns; brief becomes 210px; the navigation byline is hidden |
| At most 600px | Masthead stacks; issue controls spread across a row; brief follows the lead; story grid becomes one column; lead media is 245px high; filters wrap; timeline dates move above their events |

At the phone breakpoint the brief arranges four metrics in two columns, with its last metric spanning the full width. The masthead brand uses `clamp(2.1rem, 10vw, 2.5rem)` from the final override. Small labels remain 11px except the 10px page kicker. The article selector increases to 16px. Section captions and footer content wrap.

Project pages have a 960px maximum width. Their large media frame is 16:8, changing to 16:10 on phones. The timeline uses a 150px date column and a flexible text column before stacking. Changelog content is capped at 850px. Numeric tables keep their own `.table-wrap` overflow container; long raw records wrap within their available width.

Submission browser checks covered 1440, 768, 390 and 320px widths in both themes: 64 combinations across both front pages, both written issues, Docket, Heirloom, numbers and changelog. No page-level horizontal overflow was observed in those combinations. Further interaction evidence is recorded separately in `validation.md`.

## Elevation & Depth

The surface system is flat. There are no shadows or gradients. Background tones, 1px borders and horizontal rules separate content. The masthead and footer use 5px double rules; section headings use stronger rules than ordinary card separators.

The card title’s stretched link sits at stacking level 1. Named project links and the links row remain above it at level 2, video controls at level 3, and category glyphs at level 4. The focused skip link sits above the page at level 100. Tooltip text uses ink and paper colors in reverse.

## Shapes

Panels, media frames, buttons, tables and footnotes have square corners. Status dots are 6px circles. Small SVG pictograms use round strokes and joins, and some icon paths contain rounded rectangles; those details do not introduce rounded panels. A text-only tile has a 4px accent border at its left edge and a large project name toward the bottom.

## Components

- **Header and footer — `Chrome.tsx`.** `Header` receives the current route, issues and selected issue. Previous/next arrows become disabled buttons at the archive ends. Main navigation marks the current page with `aria-current`. The theme button has a dynamic accessible name and pressed state. `Footer` retains the public-data and community-site explanation.
- **Theme preference — `lib/theme.ts`.** `useTheme` follows the system preference until the user selects a theme. It saves that choice in local storage when available. Theme changes suppress transitions during the swap.
- **Front page — `pages/Built.tsx`.** Category links and glyph buttons filter the issue. A text status announces the item count. The first available screenshot, image or video becomes the lead; otherwise the first matching item leads. Empty categories explain that no matching work appears and link back to all stories.
- **Story card — `Card.tsx`.** `Card` accepts `item`, `base`, `date`, optional `lead`, and `onSelectKind`. The headline opens the project history, and the stretched link covers the card’s background. Separate open/details links remain usable. The lead adds a two-sentence standfirst. Written idea, today and status lines carry the story; oracle cards omit the today line.
- **Media and fallback tiles — `MediaBlock` in `Card.tsx`.** Real screenshots and images use descriptive alternate text. Videos and audio use native controls and no automatic playback. Video loading waits for interaction. Missing media becomes a data-filled text tile: question and answer, source functions, supply/pair/cap, review counts, cadence, or an explicit unavailable value.
- **Status — `Status` in `Card.tsx`.** A dot accompanies the state word. Reasons appear for states other than live or published. Accepted and in-review dots use the muted color.
- **Category glyph — `Glyph.tsx`.** Inline 24-unit SVG icons inherit category color. The glyph button filters by category and exposes its name to assistive technology. A visible tooltip appears on hover and keyboard focus. Glyph buttons are 34px square, increasing to 40px on phones.
- **Written issue — `pages/Issue.tsx`.** A labelled select switches editions. `.prose` presents the article, real media and numerical pull quote. Native `details` blocks hold policy text, source reads and links to original issue files. Missing editions produce a recovery link.
- **Project file — `pages/Project.tsx`.** The page groups matching projects across issues, sorts events oldest first, and removes identical events. Each event presents date, summary, status, source links and a collapsed raw record. Large media precedes the idea. A missing project gives a return link.
- **Numbers and changelog — `pages/Numbers.tsx`, `pages/Changelog.tsx`.** Tables compare the editions with text labels and aligned numbers. Changes use written descriptions plus technical details. Charts wait until at least three issues are available.
- **Shared interaction states — `styles.css`.** Links, buttons, selects and summaries receive a 3px focus outline with 4px offset. Hover effects are gated by hover-capable devices. The skip link becomes visible on focus. Forced-colors styles preserve focus and borders. Loading and discovery failures use readable status text; bundled issues remain readable if live discovery fails.

## Do’s and Don’ts

- Start a new page within the shared `.wrap` and retain `Header` and `Footer`. Use `.prose` for a written article, the timeline pattern for dated events, and table patterns for comparable numbers.
- Reuse the named color tokens and existing `Card`, `MediaBlock`, `Status` and `Glyph` components. Keep category accents restrained and always pair status color with words.
- Keep public explanations short and put raw fields inside `details`. Give every displayed number a meaning and use “not exposed” when the source does not supply a value.
- Add real supplied media or a factual text tile. Preserve native media controls, alternative text, focus outlines and usable named links.
- Extend the hash routes in `lib/router.ts` for another page, connect it through the existing navigation, and check the new state at the documented breakpoints in both themes.
- Keep assets local and build links relative for static hosting. Do not introduce external font hosts, a second visual token system, shadows, gradients or rounded content panels into this newspaper layout.
