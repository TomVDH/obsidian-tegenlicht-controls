# Changelog

All notable changes to this project are documented in this file.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.7.7] — 2026-04-16 — codename "Tegendraads"

### Added
- **Graph section** in Appearance tab — Colour mode (Mono / Accent / Folders), Hover halo, Node scale, Link thickness. Net-new content replacing the former placeholder.
- **Four grain texture variants** in Appearance → Workspace → Surface: Film / Paper / Halftone / Static, all driven by the existing intensity slider. Default `'film'` preserves v0.7.6 behaviour.
- **Interface cluster** in Appearance → Workspace — Tab style and Tab spacing pickers, surfacing settings that previously had no UI.
- **Legacy tab** with a 180px left-rail navigation shell for AnuPpuccin controls that don't have a natural home elsewhere.
- **Legacy → Callouts** (7 controls): callout style, custom colours toggle, radius, title padding, title opacity, content padding, fold position.
- **Legacy → Tables** (9 controls): master toggle, custom width, centering, header highlight, row/col highlight select, highlight opacity, th/td alignment, border width.
- **Legacy → Codeblocks** (5 controls): wrap modes for edit / preview / highlighted-preview, bg colour picker, text colour picker.
- **Legacy → Show / Hide** (4 controls): autohide titlebar, pointer cursor, hide metadata, hide tooltips.
- **Legacy → Tabs (deep)** (9 controls): custom tab height, disable new-tab align, depth text-invert / opacity / gap, safari radius / gap / border / animated.
- **Flavour indicator** above the settings wordmark — tiny light + dark swatches with "licht" / "tegenlicht" small-caps labels.
- **Flavour captions** above each flavour setting row in the Palette cluster.
- **Pretty properties inset visual** ported to all cluster insets (`.tc-cluster`) — accent gradient + hairline + soft shadow, tracking `--color-accent` live.
- **Segment picker pills** now use the frosted-glass visual vocabulary (backdrop-filter + inset hairline + soft drop shadow) ported from the tab pill-frost recipe.
- **Corner radius propagation** — `.tc-cluster` + markdown body elements (callouts, pre, blockquote, tables, images, embeds, inline code) now follow the global `cornerRadius` setting.

### Changed
- **Tab navigation restyled**: 14 dormant variants retired, collapsed to 4 (Switch / Amber / Underline / Ghost). Switch is the new default with subtle accent tint. Active tabs use colour + background + inset ring only (no font-weight shift, which previously disrupted the pill shape).
- **Pill track** (switch / amber) lives on a new `.tc-tab-inner-wrap` element, keeping `.tc-tab-bar` full-width so the Reset button sits rightmost via its flex spacer.
- **Appearance tab consolidated** from 5 sections to 4 — Highlights & Tints merged into Workspace as an "Editor accents" cluster.
- **TRIAL grain-style dropdown** replaced with a real persistent picker backed by the new `grainStyle` setting.
- **Settings header**: version badge now reads live from `manifest.version` (was hardcoded to v0.7.4). Diamond glyph enlarged 18 → 26px. Tegenlicht wordmark 20 → 28px. Rainbow colour bar promoted from a per-tab element to the panel header, 55px wide, inline with the GitHub · Licence · Acknowledgements row.
- **Palette cluster** — Light flavour now renders before Dark flavour (order swap).
- **Icon / Border intensity** — semantic swap: Auto = 40% transparent accent (active subtle tint); Mono = theme default (no plugin override).
- **`--color-accent-rgb`** now written at `:root` so plugin CSS rules using `rgba(var(--color-accent-rgb), α)` track the user's active accent instead of falling back to hardcoded amber.

### Removed
- Ten dormant tab-style CSS blocks (~650 lines) from `styles.css` (`pill-*`, `seg-*`, `line-*`, `underline-thick` variants that had no picker surface).
- The per-tab rainbow colour bar on Appearance / Typography / Editing tabs (promoted to the panel header).

### Fixed
- **Halftone grain** — two radial-gradient tiles both used 25%/75% centres with a 3×3 offset, which collapsed both dot layers onto the same absolute positions. Both tiles now use 25% 25% centres; the 3px offset on the second tile places its dots staggered as intended.
- **Grain body class** was added unconditionally in the applier. Now gated on `noiseAmount > 0` so body has no `tc-grain-*` class when grain is off.
- **Tab-nav active text weight** shifting from 500 → 600 caused pill shape disruption. Weight held constant across active states.

### Migration notes
- `tabBarStyle` values outside the new set `{switch, switch-amber, underline, ghost}` auto-migrate to `switch` on first load.
- `grainStyle` absent from saved data defaults to `'film'` — the behaviour users had at v0.7.6.
- No destructive migrations. `git tag v0.7.6-pre-legacy` remains as a rollback anchor on the pre-session commit `8155a1e`.

### Out of scope (deferred)
- Ship-push 2 of the Legacy port (Headings typography, Lists & Tags, Workspace details — ~50 controls).
- Palette colour overrides (25 Catppuccin swatches) and Integrations (Kanban, MAKE.md, Minimal Cards) — intentionally skipped; Pitr's razor.
- Companion `obsidian-tegenlicht-theme` repo creation and GitHub remote setup.

### Spec & plan
- Spec: `docs/superpowers/specs/2026-04-16-legacy-tab-and-nav-restyle-design.md`
- Plan: `docs/superpowers/plans/2026-04-16-legacy-tab-and-nav-restyle.md`
- Rollback anchor: tag `v0.7.6-pre-legacy`
