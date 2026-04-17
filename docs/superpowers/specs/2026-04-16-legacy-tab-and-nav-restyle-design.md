---
title: Appearance completion + tab-nav restyle + Legacy tab
status: approved-for-planning
session: 2026-04-16
approved_by: tom
version_at_start: 0.7.6 (commit 8155a1e)
workstreams: [appearance-finish, tab-nav-restyle, legacy-tab]
crew_lead: kevijntje
specialist_contributions: [thieuke, henske, jonasty, pitr, bostrol, poekie]
---

# Appearance completion + tab-nav restyle + Legacy tab

## Problem statement

Three surfaces in `obsidian-tegenlicht-controls` v0.7.6 need work:

1. **Appearance tab** has unfinished business: a placeholder Graph section, an inert TRIAL grain-style dropdown, settings fields with no UI surface, and cluster-layout edges from recent reorgs.
2. **Tab navigation** has fourteen dormant style variants defined in `src/settings-tab.ts:20-37` but no user-facing picker anywhere in the plugin — the worst of both worlds. Tom wants the nav restyled to match the plugin's own switch/toggle visual language.
3. **135 AnuPpuccin theme controls** exposed via Style Settings are not available through the plugin. Tom wants them surfaced under a new "Legacy" tab using a per-segment, focused approach.

A fourth workstream (flavour text area rework) was explored and dropped — the minimal-direction variants felt too similar to each other, and the original header holds up. Deferred indefinitely.

## Load-bearing constraints

- **Plugin/theme boundary** (hard rule): the plugin toggles body classes and writes CSS vars. It does NOT ship paint rules for visuals the theme already owns. Plugin CSS is only for plugin-owned UI (settings panel, QuickPanel, swatches, accordions). If a theme-side gap is discovered, the fix belongs in the companion `obsidian-tegenlicht-theme` repo, not here.
- **Read the `@settings` YAML** in AnuPpuccin's `theme.css` before using any AnuPpuccin class name. Two prior rounds invented class names that didn't exist — do not repeat.
- **Narrow selectors over broad ones** when a plugin-side rule is genuinely needed.
- **Motion restraint**: this is a settings panel, not a showcase dashboard. Subtle transitions only (transform/opacity, 180ms, `cubic-bezier(0.32, 0.72, 0, 1)`). No perpetual animations, no "live" breathing status, no neon glows.
- **Single accent, desaturated**: `#e5b32a` amber is canonical. Monochrome (`mono-rgb` scale) is the default for chrome elements, accent is opt-in. This matches the existing Icon / Border intensity "auto → mono" pattern.
- **Version parity**: stays at 0.7.6 across the entire branch. Bump + CHANGELOG entry happens once at merge-to-main, not mid-branch.

## Workstream 1 — Appearance tab completion

### 1.1 Graph section (net-new content)

The section currently renders an empty hint. Replace with four controls in two clusters.

**Cluster: Colour**

| Control | Type | Values / Range | Applier effect |
|---------|------|----------------|----------------|
| `Colour mode` | segment | `mono` / `accent` / `folders` | Body class `tc-graph-colour-mode-{value}` — theme CSS reads these for graph node fill |

**Cluster: Style**

| Control | Type | Values / Range | Applier effect |
|---------|------|----------------|----------------|
| `Hover halo` | toggle | boolean | Body class `tc-graph-halo` — plugin owns the halo CSS (plugin-owned UI overlay, not theme content) |
| `Node scale` | slider | 0.5×–2.0×, step 0.1, default 1.0 | CSS var `--tc-graph-node-scale`, multiplied against Obsidian's native node size |
| `Link thickness` | slider | 0.5×–3.0×, step 0.1, default 1.0 | CSS var `--tc-graph-link-thickness` |

**New settings fields** (in `TegenlichtSettings`):

```typescript
graphColourMode: string;   // 'mono' | 'accent' | 'folders'
graphHalo: boolean;
graphNodeScale: number;    // 0.5–2.0
graphLinkThickness: number; // 0.5–3.0
```

**Defaults**: `graphColourMode = 'accent'`, `graphHalo = true`, `graphNodeScale = 1.0`, `graphLinkThickness = 1.0`.

### 1.2 Grain texture variants

Wire the TRIAL dropdown fully. Four variants, same intensity slider.

**New setting**:

```typescript
grainStyle: string;  // 'film' | 'paper' | 'halftone' | 'static'
```

**Default**: `'film'` (backward-compatible with existing v0.7.6 behaviour).

**Applier effect**: exclusive body class `tc-grain-{style}` set when `noiseAmount > 0`. Each class owns its own `background-image` (SVG turbulence for film/paper/static, radial-gradient tile for halftone) on the workspace pseudo-element. `--tc-noise-opacity` continues to drive intensity for all four.

**Migration**: absent `grainStyle` field → default to `'film'`. No destructive rewrite of saved values.

### 1.3 Un-surfaced settings resolution

| Setting | Decision |
|---------|----------|
| `editorMood` (`minimal` / `warm` / `cool`) | Stays hidden. Experimental, low-traffic. Keep the applier class writes for anyone who hand-edits `data.json`. |
| `tabBarStyle` | Surfaced in the new Appearance → Interface cluster (workstream 3). |
| `tabBarSpacing` | Same — surfaced in Interface cluster. |
| `metadataMods`, `cardsMinimal`, `kanban`, `calendar`, `itsCallouts` | No-ops today, no class effect in applier. Stay hidden this session. These fall under Legacy's "Integrations" bucket which is explicitly skipped this branch (see 4.2 Skipped list). Re-evaluate in a later session if user demand surfaces. |
| `backgroundEffect`, `interfaceFont` | Deliberately retired earlier. Stay hidden. Kept for migration only. |

### 1.4 Section-structure polish

Merge **Highlights & Tints** into **Workspace → Canvas** as an "Editor accents" cluster (Active line + Selection tint + Caret colour). Reduces the Appearance tab from 5 top sections to 4. Rationale: all three controls are editor-surface accents; they belong with Canvas and Surface. Subject to visual confirmation at spec review.

Final Appearance section order (post-merge):

1. Theme & Colour (Palette / Shape / Weight clusters)
2. Outliner (File tree / Rainbow folders clusters)
3. Graph (Colour / Style clusters) — net-new
4. Workspace (Sidebar / Canvas / Editor accents / Surface / Accent application / Interface clusters) — Interface cluster net-new

## Workstream 3 — Tab navigation restyle

### 3.1 New default: `tc-tabs-switch`

The plugin's own `.tc-toggle` pattern, scaled from 2 positions to N.

- **Track**: inner padding 3px, background `rgba(255,255,255,0.04)`, border `--background-modifier-border` at stronger alpha. Border-radius 100px.
- **Knob**: absolutely positioned, `top: 3px; bottom: 3px`, width `calc(100% / N * 0.94)`, border-radius 100px, background `rgba(var(--mono-rgb-100), 0.08)` with a 1px `--background-modifier-border` hairline. This is the monochrome default.
- **Transition**: `transform 180ms cubic-bezier(0.32, 0.72, 0, 1)` on the knob. `color 180ms` on the tab label (inactive `--text-muted`, active `--text-normal` with `font-weight: 600`). No `width` animation, no scale, no shadow.
- **Active tab label**: colour shifts to `--text-normal`, weight bumps to 600. No underline, no background fill on the text itself — the knob handles that layer.

### 3.2 Alternates retained (3)

| Alternate | `tabBarStyle` value | Difference from default |
|-----------|--------------------|-------------------------|
| Amber switch | `switch-amber` | Same geometry as default, knob painted `--interactive-accent` at 14% opacity with a 42%-opacity accent hairline. For users who prefer accent chrome. |
| Underline | `underline` | No pill track, no knob. 2px accent line at the bottom of the bar, slides via `translateX` between tab widths. Zero vertical chrome. |
| Ghost | `ghost` | No shared track. Each tab is its own pill; active tab gets a 1px accent outline. No background fill. |

### 3.3 Retirements

Remove from `TAB_STYLES` and their CSS: `pill`, `pill-soft`, `pill-tint`, `pill-frost`, `pill-frosttint`, `pill-mono`, `seg`, `seg-soft`, `seg-ghost`, `seg-frost`, `seg-tint`, `seg-frosttint`, `seg-mono`. Delete their CSS blocks in `styles.css`. Migration: any saved `tabBarStyle` value not in the new set `{switch, switch-amber, underline, ghost}` → `switch`.

### 3.4 Picker surface

New cluster on the Appearance tab, inside the Workspace section:

**Cluster: Interface**

| Control | Type | Values / Range |
|---------|------|----------------|
| `Tab style` | segment | Switch / Amber / Underline / Ghost |
| `Tab spacing` | slider | 0–16px, step 1, default 6 |

These map to the existing `tabBarStyle` and `tabBarSpacing` settings — no new fields.

## Workstream 4 — Legacy tab

### 4.1 Architecture: left-rail

- **Layout**: CSS grid, `grid-template-columns: 180px 1fr`. Rail left, content pane right. Single border between them (`border-right: 1px solid var(--background-modifier-border)` on the rail).
- **Rail items**: 10 sections (see 4.2), each item is a plain row with the section name and a control-count badge on the right. Active item has a 2px accent left-border, amber-tinted 4% background, `font-weight: 600`. Hover: subtle background shift.
- **Content pane**: padded `18px 20px`. Section heading + one-line description at top, then the settings rows separated by `border-t` dividers. No nested cards inside the content pane — taste kit Rule 4, dashboard hardening.
- **Active section persistence**: the current rail selection lives in component state (not saved to settings — the tab always opens on the first section for a clean start).
- **Narrow-width fallback**: below 400px content width (rare inside Obsidian's settings modal but not impossible), rail collapses to icons-only at 48px width with tooltips. Triggered via `container-query` or `matchMedia` check.

### 4.2 Section inventory + port order

**Ship-push 1** — ~40 controls, highest-traffic.

| Rail section | Controls | AnuPpuccin source |
|--------------|----------|-------------------|
| Callouts | 7 | `anp-callout-*` cluster |
| Tables | 10 | `anp-table-*` cluster |
| Codeblocks | 5 | `anp-codeblock-wrap-*` + colour vars |
| Show / Hide | 6 | `anp-autohide-*`, `anp-toggle-*`, `anp-hide-*` |
| Tabs (deep) | 18 | `anp-depth-tab-*`, `anp-alt-tab-*`, stacked tab vars |

**Ship-push 2** — ~50 controls, power users.

| Rail section | Controls |
|--------------|----------|
| Headings | 28 (per-heading font, weight, line-height, colour, divider) |
| Lists & Tags | 6 |
| Workspace details | 12 (file-browser tweaks, colorful-frame extras, card layout, canvas bg, PDF viewer, translucency) |

**Skipped for now** — deferred indefinitely, revisit if user demand surfaces:

- Palette overrides (25 Catppuccin colour swatches) — rarely used, heavy UI weight
- Integrations (Kanban + MAKE.md + Minimal Cards, 16 controls) — plugin-specific, low priority

**Scope of this branch**: Ship-push 1 only (~40 controls). Ship-push 2 and the Skipped list are captured above as forward intent and explicit non-goals — they are not deliverables of this session's feature branch. That keeps the branch tight (~8 commits, reviewable in one sitting) and lets Ship-push 2 land cleanly later against the already-proven left-rail architecture.

Total v1 Legacy coverage (this branch): ~40 of 135 controls (~30%). Total addressable once Ship-push 2 also ships: ~90 of 135 (~67%).

### 4.3 Content pane density rules

Inside the content pane, each control row is:

- **Name** (12px, `--text-normal`) with optional **description** (10px, `--text-muted`) below
- **Control** on the right (toggle / slider / segment / dropdown / numeric field)
- Rows separated by 1px `--background-modifier-border` at 5% alpha
- Padding 9px vertical per row
- No nested clusters — a section is a flat list

This is deliberately denser than the Appearance tab (Appearance uses clustered `tc-setting-card` wrappers). Legacy is a functional surface; the visual weight belongs on the content, not on the containers.

## Cross-cutting: rollback strategy

**Before any code lands**:

```
git tag v0.7.6-pre-legacy
git checkout -b feature/legacy-and-nav
```

**Commit discipline**:

- One atomic commit per workstream sub-deliverable (minimum). Tentative commit list:
  1. `feat(appearance): Graph section controls + applier wiring`
  2. `feat(appearance): wire grain texture variants`
  3. `refactor(appearance): merge Highlights & Tints into Workspace → Editor accents`
  4. `refactor(tabs): switch-first nav, retire 10 dormant variants`
  5. `feat(appearance): Interface cluster — Tab style + Tab spacing picker`
  6. `feat(legacy): left-rail architecture + section scaffolding`
  7. `feat(legacy): port Callouts + Tables controls`
  8. `feat(legacy): port Codeblocks + Show/Hide + Tabs-deep controls`
- No squash-merges to main. No force-pushes to the feature branch.
- Each commit smoke-tested in the Onnozelaer vault before the next lands.

**Exit paths**:

- Full abort: `git checkout main && git branch -D feature/legacy-and-nav`
- Return to known good: `git reset --hard v0.7.6-pre-legacy`
- Roll back one workstream: `git revert <commit-hash>`

**Merge-to-main criteria**: all commits smoke-tested, CHANGELOG entry written for v0.7.7 (or whatever the ship version lands as), manifest + package.json + any embedded version strings updated atomically in a single version-bump commit immediately before merge.

## Resolved questions

1. **Section-polish merge** (1.4) — ✅ Approved. Highlights & Tints merges into Workspace as "Editor accents" cluster. Appearance goes from 5 top sections to 4.
2. **Graph defaults** (1.1) — ✅ `graphColourMode = 'accent'` stays. Rationale: the Graph view is a visualization where colour IS content; accent-first makes the section immediately useful. Consistency with tab-nav switch-mono default is valuable for chrome elements but not where colour carries information.
3. **Legacy narrow-width fallback** (4.1) — ❌ Dropped from this branch. Obsidian's settings modal is typically 700px+ wide, so the 180px rail rarely creates overflow. If it becomes a real issue under daily use, a future branch addresses it with a container-query collapse. Not a blocker for v1.

## Out of scope (confirmed)

- Flavour text area rework (dropped — original header holds)
- Window Frame Style options (still in Obsidian-tegenlicht-theme territory, not plugin)
- GitHub remote creation (user-owned operation, not part of this branch)
- Liquid-glass-js revival (parked, separate session)
