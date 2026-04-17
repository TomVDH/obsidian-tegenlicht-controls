# AnuPpuccin Porting Plan

**Source:** [`anuppuccin-inventory.md`](./anuppuccin-inventory.md) — 229 settings inventoried, 95 fully ported, 4 wired-but-UI-less, 107 not yet brought in, 23 intentionally skipped.

**Goal:** methodical port of the 4 + 107 outstanding items into the existing tab structure, in shippable waves. Each wave is independently mergeable, smoke-testable, and reverts cleanly.

**Hard rules** (don't break these):
- Plugin/theme boundary: plugin only writes body classes + CSS vars. Never paint theme-owned visuals.
- Read AnuPpuccin's `@settings` YAML for every class name before wiring (`~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Onnozelaer/.obsidian/themes/AnuPpuccin/theme.css`, line 15+).
- One commit per wave, conventional commits, `Co-Authored-By: Claude Opus 4.7 (1M context)` footer. No squashing across waves; squash within a wave is fine.
- Smoke-test in the Onnozelaer vault after each wave (`npm run build` auto-deploys).
- Version stays at 0.7.7 across waves. Bump + CHANGELOG only at the end.

**Skipped (per inventory — DO NOT port):**
- 25 Catppuccin palette colour pickers — plugin's swatch-injection approach is intentionally smarter
- 17 Kanban integration settings — out of scope
- 6 Minimal Cards snippet settings — out of scope
- MAKE.md integrations except Inline Title (already done)

---

## Tab restructure (proposed — light touch)

The current tab structure mostly works. Two small moves recommended:

1. **Typography → add "Headings" cluster.** Currently Typography has only the Rhythm cluster (sizes). With ~30 heading-related ports incoming (colours, dividers, font families, weights, line heights, decoration colours), they need a dedicated cluster — otherwise the Typography tab becomes one giant unstructured list.

2. **Legacy → Show/Hide gets the wired-but-UI-less `activeLineHighlight` toggle.** Natural fit; Show/Hide already groups visibility-style toggles.

Everything else lands in its current natural home (Features for print/speech-bubbles, Editing for tag vars, Layout for embed-max-height, Appearance for light-theme accent, Legacy for codeblock/LaTeX colour bits).

No tab created or removed. No tab renamed.

---

## Waves

### Wave 1 — Wired-but-UI-less (≤30 min)

Four settings that already work in the applier; just need a UI control. Highest ROI.

| Setting | Current state | Where it lands | Control type |
|---|---|---|---|
| `activeLineHighlight` (boolean) | applier writes `anp-current-line` class | **Legacy → Show/Hide** | Toggle |
| `fontSource` (string) | applier writes `--font-monospace` | **Typography → Fonts** (mono role row) | Combobox |
| `fontEditor` (string) | applier writes `--tc-font-editor` | **Typography → Fonts** (editor role row) | Combobox |
| `calloutTitlePaddingX` (number) | applier writes `--callout-title-padding` (px) | **Legacy → Callouts** | Verify slider already drives the var; no code change if so |

**Files to touch:** `src/tabs/legacy.ts`, `src/tabs/typography.ts`. No `settings.ts` or `applier.ts` changes — fields and writes already exist.

**Verify:** in Onnozelaer, toggle each and confirm the body class / CSS var changes via DevTools.

**Commit:** `feat(ui): surface 4 wired-but-UI-less settings`.

---

### Wave 2 — Small additions (≤45 min)

Five quick toggles + sliders that fill obvious gaps.

| Setting | AnuPpuccin id | Body class / var | Lands in | Control |
|---|---|---|---|---|
| Speech Bubbles | `anp-speech-bubble` | `anp-speech-bubble` (class-toggle) | **Features** | Toggle |
| List Styling Toggle | `anp-list-toggle` | `anp-list-toggle` (class-toggle) | **Editing** (List cluster, new) | Toggle |
| Tag Border Width | `tag-border-width` | `--tag-border-width` (var-number) | **Editing** (Tags cluster, existing) | Slider 0–4 px |
| Tag Radius | `tag-radius` | `--tag-radius` (var-number) | **Editing** (Tags cluster) | Slider 0–24 px |
| Print Styling | `anp-print` | `anp-print` (class-toggle) | **Features** | Toggle |
| Embed Max Height | `embed-max-height` | `--embed-max-height` (var-number) | **Layout** | Slider 200–1200 px |

**Files:** `src/settings.ts` (6 new fields), `src/applier.ts` (6 writes), `src/tabs/features.ts`, `src/tabs/editing.ts`, `src/tabs/layout.ts`. Verify YAML class names before wiring.

**Verify:** every toggle flips the body class on the live workspace; every slider writes the var.

**Commit:** `feat(settings): speech bubbles + list/tag/print/embed toggles & vars`.

---

### Wave 3 — Heading completeness, part 1: colours + dividers (≤2 h)

Single biggest gap in the plugin. Adds a **new Headings cluster** in the Typography tab.

**General toggles** (4):
- `anp-header-color-toggle` → master enable for per-H colour
- `anp-header-margin-toggle` → master enable for custom margins
- `anp-header-divider-color-toggle` → divider inherits H colour
- `--anp-header-margin-value` → margin slider

**Per-heading colour selectors** (6 dropdowns, H1–H6):
- AnuPpuccin classes: `anp-h1-rosewater`, `anp-h1-flamingo`, `anp-h1-pink`, … (14 Catppuccin colours per heading)
- Plugin setting: `headingColors: { h1: 'auto'|'rosewater'|'flamingo'|…, h2: …, … }`
- Each dropdown writes one body class per H level

**Per-heading divider toggles** (6):
- AnuPpuccin classes: `anp-h1-divider`, `anp-h2-divider`, …
- Plugin setting: `headingDividers: { h1: bool, h2: bool, … }`

**Decoration colours** (3 dropdowns):
- Bold colour (`anp-bold-color-*`)
- Italic colour (`anp-italic-color-*`)
- Highlight colour (`anp-highlight-color-*`)

**Files:**
- `src/settings.ts` — 4 toggles + 2 grouped objects + 1 slider value + 3 decoration selects = ~20 fields
- `src/applier.ts` — class-toggle helper for the 6 H colours + 6 dividers + 3 decorations; one var write for margin value
- `src/tabs/typography.ts` — new Headings cluster with: master toggles + 6 colour dropdowns + 6 divider toggles + decoration dropdowns
- New helper in `src/tabs/_shared.ts`: `buildColourClassDropdown(parent, name, desc, options, getter, setter, onChange)` — selects from a fixed list of class suffixes, writes one of N body classes (clearing the others). Reusable for the 6 H + 3 decoration selectors.

**Verify:** toggle a heading colour, inspect H1 in a real note in Onnozelaer — should paint in the chosen Catppuccin colour.

**Commit:** `feat(typography): per-heading colours + dividers + decoration accents`.

---

### Wave 4 — Heading completeness, part 2: micro-typography (≤1.5 h)

Per-heading font / weight / line-height. Same Headings cluster, second pass — likely behind an "Advanced" disclosure to avoid overwhelming the cluster.

| Per-heading var | Type | Default range |
|---|---|---|
| `--h1-font` … `--h6-font` | text (font name) | inherits |
| `--h1-weight` … `--h6-weight` | number (100–900) | per theme |
| `--h1-line-height` … `--h6-line-height` | number | 1.0–2.0 |

Plus four global font weights:
- `--bold-weight` (number)
- `--anp-font-live-preview-wt` (number)
- `--anp-font-preview-wt` (number)
- `--anp-font-editor-wt` (number)

**Files:** `src/settings.ts` (~20 more fields, mostly numbers), `src/applier.ts` (var writes only — no body classes), `src/tabs/typography.ts` (Advanced disclosure inside Headings cluster).

**Verify:** drag a weight slider, font weight on H1 in note shifts.

**Commit:** `feat(typography): per-heading font / weight / line-height + global weights`.

---

### Wave 5 — Specialised single-setting ports (≤1 h)

| Setting | Lands in | Control |
|---|---|---|
| Light Theme Accent (`anp-light-theme-accents`) | **Appearance** | Accent picker, conditional on light flavour active. Requires accent-aware applier logic — pick `lightAccent` vs `accentColour` based on body theme |
| LaTeX Color (`anp-latex-color`) | **Legacy → Codeblocks** (or new "Math" sub-section) | Pickr swatch |
| PDF Blend toggles (2) (`anp-pdf-blend-toggle-light`, `anp-pdf-blend-toggle-dark`) | **Features** (or Layout) | Two toggles |

**Files:** `src/settings.ts`, `src/applier.ts` (light-accent path is the trickiest — needs flavour-mode awareness, similar to existing `darkFlavour` / `lightFlavour` switching), `src/tabs/appearance.ts`, `src/tabs/legacy.ts`, `src/tabs/features.ts`.

**Verify:** flip between light and dark flavours, accent should swap correctly. PDF blend toggles change PDF rendering opacity.

**Commit:** `feat(settings): light theme accent + LaTeX colour + PDF blends`.

---

### Wave 6 — Outliner / Workspace mop-up (audit-driven)

The inventory's Section 8 (Workspace) has unported items we haven't categorised explicitly. Before this wave: re-grep `inventory.md` for any remaining `◯ Not yet` rows in sections we haven't covered, list them, decide per-item whether to port or skip.

Likely candidates:
- Per-folder colour overrides for rainbow folders (if AnuPpuccin exposes more than the plugin already wires)
- Stacked tabs micro-styles
- Status bar tweaks
- Translucency-related (likely SKIP — already deferred per parked decisions)

**Approach:** read inventory → produce a delta list → decide per item → wire whatever's worth it. ≤2 h estimated.

**Commit:** `feat(workspace): port remaining outliner / tabs / status-bar settings`.

---

### Wave 7 — Release prep

- Bump version `0.7.7` → `0.8.0` (significant feature additions warrant minor bump)
- Write `CHANGELOG.md` entry — group by tab + brief summary of waves 1–6
- Update README if any new tabs / capabilities surfaced
- Final smoke-test pass through every newly-ported setting in Onnozelaer
- Tag release: `v0.8.0`
- Push to remote

**Commit:** `chore(release): bump to v0.8.0 + CHANGELOG`.

---

## Per-wave checklist (use for each wave)

- [ ] Verify every AnuPpuccin class name against the @settings YAML before wiring (paste-search the YAML, don't trust the inventory blindly — it's already 1 day old by the time you're reading this)
- [ ] Add `settings.ts` fields with correct defaults (match AnuPpuccin's defaults so first-load behaviour doesn't change)
- [ ] Wire writes in `applier.ts` (body class for class-* settings, CSS var for variable-*)
- [ ] Surface UI in the right tab — match the cluster's existing visual language (segment vs dropdown vs toggle)
- [ ] `npm run build` — esbuild auto-deploys to Onnozelaer
- [ ] Smoke-test in Onnozelaer: open the affected note type, flip the new control, verify body class / CSS var changes via DevTools
- [ ] Commit with conventional-commits message + Claude co-author footer
- [ ] No push between waves — push at end of each working session, batched

---

## State after all waves

| Status | Before | After waves 1-6 |
|---|---|---|
| ✅ Fully ported | 95 | ~165 |
| ◐ Wired-but-UI-less | 4 | 0 |
| ◯ Not yet | 107 | ~37 (mostly intentional sub-skips inside heading micro-options) |
| ⊘ Skipped | 23 | 23 |

Targeted coverage: ~75% of the AnuPpuccin surface area, with the remaining 25% being either intentionally skipped or genuinely niche.

---

## Resume notes

- The inventory document (`anuppuccin-inventory.md`) is the source of truth for "what AnuPpuccin exposes". Refer back per wave.
- Latest commit before this plan was pushed: `ee74283` (active-tab glow without border).
- Start Wave 1 with `feat(ui): surface 4 wired-but-UI-less settings`. The 4 fields already exist — only `legacy.ts` and `typography.ts` need new control rows.
- Check the AnuPpuccin theme.css path is still valid: `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Onnozelaer/.obsidian/themes/AnuPpuccin/theme.css` — if the vault moved, update the smoke-test target.
