# Changelog

All notable changes to this project are documented in this file.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.9.0] — 2026-04-19 — codename "Reorg"

Tab bar rewritten around semantic ownership. Every control now lives in exactly one obvious place; applier and setting keys untouched.

### Tab structure

Old (10 tabs): Appearance · Typography · Editing · Layout · Features · Legacy · Lab
New (7 tabs): **Appearance · Reading · Editor · Workspace · Elements · Legacy · Lab**

Retired: Typography (absorbed into Legacy as Reading-semantic staging), Editing, Layout, Features, Appearance 2.

### Destination map

- **A Appearance** — chrome-only. Theme · Canvas & Frame · Interface. Canvas & Frame absorbs `colorfulFrameInvertLight/Dark` (from Features), `lightAccentColour` + `colorfulFrameColour` (from Legacy → Frame & accents).
- **B Reading** — how a note looks while being read. Typography pointer · Callouts (from Legacy) · Tables (from Legacy + `tableWidthPct` from Layout) · Codeblocks (from Legacy + `codeblockLineNumbers` from Editing + `latexColour`) · Embeds & PDF (`embedMaxHeight` from Layout, `printStyling`/`pdfBlend*` from Features).
- **C Editor** — input-side surfaces. Accents (`activeLine`, `selectionTint`, `caret` moved out of Appearance) · Titles · Properties (incl. `metadataButton`, `metadataMods`) · Lists · Tabs (pane) (tabStyle + 9 Legacy → Tabs-deep tuning controls).
- **D Workspace** — navigation & layout. File tree · Rainbow folders (full Advanced disclosure preserved) · Graph · Pane layout (every former Layout-tab slider).
- **E Elements** — named features. Cards · Tags · Misc · Backdrop fixes · Show / Hide (merged with Legacy Show/Hide — `hideTitlebarAuto`, `uiPointerCursor`, `hideMetadata`, `hideTooltips`) · Plugin support.
- **F Legacy** — pure Typography staging (Fonts · Rhythm · Headings · Weight & leading · Decoration) pending graduation into Reading.
- **L Lab** — unchanged.

### Polish

- `saveSettings()` applies CSS vars **before** awaiting disk write — live accent / flavour / slider feedback no longer stalled by iCloud's slow `saveData`.
- Accordion style live-swaps via `swapAccordionVariant()` — no redisplay needed; every `.tc-mock-acc` reacts to the class flip.
- `markReloadRequired(setting)` + `.tc-reload-pip` helper for the rare settings that genuinely need a plugin reload.
- Left-rail shell renders **all** panes up-front (inactive panes off-screen) so the per-tab CSS counter flows continuously across sub-tabs: A-1 → A-N across Theme + Canvas + Interface rather than restarting per section.
- Per-tab counter prefixes: A Appearance, B Reading, C Editor, D Workspace, E Elements, F Legacy, L Lab.
- Accordion vertical margin 32 → 20px throughout.

### Implementation

- 12-step atomic migration on branch `feature/settings-reorg`. Every commit left the UI functional. Plan lives at `docs/settings-reorg-plan.md`.

## [0.8.0] — 2026-04-17 — codename "Inventory"

Major port round based on the AnuPpuccin inventory (`docs/anuppuccin-inventory.md`). Six waves, ~70 new settings ported into natural homes across the existing tab structure.

### Added — Typography

- **Headings section** (Wave 3): per-H colour dropdown (14 Catppuccin colours) + per-H divider toggle (H1–H6). Master toggles gate whether picks paint. New **heading margin** slider via master toggle. Exposes 17 AnuPpuccin settings.
- **Accents section** (Wave 3 + 6): bold / italic / highlight colour dropdowns, gated by a new **Enable decoration colours** master. 3 dropdowns + 1 master.
- **Weight & leading section** (Wave 4): 4 sub-accordions — Global weights (bold + live-preview + reading + source), Per-H weight (H1–H6), Per-H line-height (H1–H6), Per-H font family (H1–H6 text inputs). 22 new settings.

### Added — Appearance

- **Light mode accent** (Wave 5) — dropdown beside the main accent row. `auto` follows the main pick; presets override only in light mode. Enables independent light / dark palettes.

### Added — Features

- **Speech bubbles** + **Print styling** (Wave 2) — class-toggles.
- **PDF blend (light)** + **PDF blend (dark)** (Wave 5) — PDF viewer bg blending per theme mode.
- **Darker canvas backdrop**, **Workspace bg fix**, **Hide pane borders**, **Card shadows** (Wave 6).

### Added — Editing

- **List styling** toggle (Wave 2) — AnuPpuccin's nested-bullet glyph cascade.
- **Tag border width** + **Tag radius** sliders (Wave 2).
- **Custom preview margins** toggle (Wave 6).
- **List bullet colour** Pickr (Wave 6) — `--list-marker-color`.

### Added — Layout

- **Embed max height** slider (Wave 2) — `--embed-max-height`.
- **Colorful frame opacity** slider (Wave 6) — pairs with the existing `colorfulFrame` toggle.

### Added — Legacy → Codeblocks

- **LaTeX colour** Pickr (Wave 5) — `--anp-latex-color`.

### Changed

- **Appearance tab never rebuilds its pane** on setting change. Accent dots, extended swatch wraps, and CSS-var / body-class settings all update imperatively — the preview (and scroll / focus / open accordions) stays put across every flip. `refresh()` → `onChange()` for 10+ callsites.
- **Rail left edge flush** with the settings container's leftmost edge. Rail padding-left dropped to 0; rail items visually align with the leftmost top-level tab.
- **Accent divider thickness** bumped 1px → 2px; equal 14px padding above and below.
- **buildColourVarRow** extracted from `legacy.ts` to `_shared.ts` — shared between Legacy, Editing, and future surfaces.
- **CATPPUCCIN_COLOURS** constant exported from `applier.ts` — canonical 14-name list used by Typography UI + applier.

### Infrastructure

- **applyColourClassSelect** helper in applier — handles the "one of N body classes from a shared prefix" pattern used by all 9 colour-class-selects (H1–H6 + bold / italic / highlight).
- `remove()` nukes all 126 possible colour classes (14 × 9 prefixes) + 14 new Wave 2 / 5 / 6 body classes on plugin unload.
- Port plan document at `docs/anuppuccin-port-plan.md`. Inventory document at `docs/anuppuccin-inventory.md`.

### Ported from AnuPpuccin inventory (~70 settings)

Counts per wave: W2 (6) + W3 (17) + W4 (22) + W5 (4) + W6 (8) = 57 UI surfaces for ~70 underlying AnuPpuccin settings (some waves surface multiple classes through one control).

### Intentionally skipped

25 Catppuccin palette colour pickers (plugin's swatch-injection approach is the right answer per inventory analysis), 17 Kanban integration settings, 6 Minimal Cards snippet settings, MAKE.md integrations except Inline Title.

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
