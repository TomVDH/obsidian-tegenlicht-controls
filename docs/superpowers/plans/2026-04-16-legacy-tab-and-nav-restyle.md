# Appearance completion + tab-nav restyle + Legacy tab — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land Appearance-tab completion, a switch-style tab-nav restyle, and a net-new Legacy tab (left-rail, Ship-push 1 content) on a rollback-safe feature branch.

**Architecture:** Nine atomic commits on `feature/legacy-and-nav` off `main`. Each commit is independently revertable — no commit depends on a later commit's presence. Verification is manual smoke-test inside the Onnozelaer vault after every commit; no automated test framework is in play. A pre-flight git tag (`v0.7.6-pre-legacy`) provides a single-command restore point.

**Tech Stack:** TypeScript + esbuild. Plain DOM manipulation via Obsidian's `Setting` component class and `createDiv`/`createEl`/`addClass`. Shared helpers in `src/tabs/_shared.ts`. Body-class writes centralised in `src/applier.ts`. Settings shape in `src/settings.ts`. Plugin CSS is a single 3800-line `styles.css` (no restructure).

**Crew ownership** (for routing during execution):
- **Thieuke** — Appearance tab changes (Tasks 1, 3, 4), tab-nav restyle (Task 5)
- **Henske** — Switch-knob CSS + grain texture SVG/CSS (parts of Tasks 2, 5)
- **Bostrol** — Legacy tab scaffolding (Task 6), CHANGELOG (Task 9)
- **Jonasty** — AnuPpuccin YAML verification gates (Tasks 7, 8), smoke-test gate on every commit
- **Pitr** — razor-check on any scope creep
- **Kevijntje** — bosun, commit discipline, scope alarm

**Spec reference:** `docs/superpowers/specs/2026-04-16-legacy-tab-and-nav-restyle-design.md`

---

## Phase 0 — Pre-flight safety

### Task 0: Create rollback tag and feature branch

**Files:** None — git operations only

**Owner:** Kevijntje (bosun owns branch strategy)

- [ ] **Step 1: Verify working tree is clean**

```bash
cd "/Users/tomlinson/Library/Mobile Documents/com~apple~CloudDocs/Projects/VIBE CODING/obsidian-tegenlicht-controls"
git status
```

Expected output: `nothing to commit, working tree clean` on branch `main`.

If dirty, stash or commit first. Do not proceed with a dirty tree.

- [ ] **Step 2: Tag the current commit as the rollback point**

```bash
git tag v0.7.6-pre-legacy
git tag --list | grep pre-legacy
```

Expected: `v0.7.6-pre-legacy` appears in the list.

- [ ] **Step 3: Create and switch to the feature branch**

```bash
git checkout -b feature/legacy-and-nav
git branch --show-current
```

Expected: `feature/legacy-and-nav`.

- [ ] **Step 4: Verify rollback paths work before we need them**

```bash
# Dry-run check — don't actually reset, just confirm the tag is reachable
git log v0.7.6-pre-legacy --oneline -1
git log main --oneline -1
```

Expected: both commands print commit `8155a1e chore: bump to v0.7.6`.

No commit required — this is pre-flight only.

---

## Phase 1 — Appearance tab completion

### Task 1: Graph section — net-new content in Appearance tab

**Files:**
- Modify: `src/settings.ts` (add 4 fields to `TegenlichtSettings` + `DEFAULT_SETTINGS`)
- Modify: `src/applier.ts` (body classes + CSS vars)
- Modify: `src/tabs/appearance.ts` (replace Graph placeholder with 4 controls)
- Modify: `styles.css` (add `.tc-graph-halo` rule — plugin-owned halo overlay)

**Owner:** Thieuke

- [ ] **Step 1: Add Graph settings to the interface**

In `src/settings.ts`, inside the `TegenlichtSettings` interface, add (suggested placement: after the `editorMood` line, inside the `// Appearance — Interface` group):

```typescript
  // Appearance — Graph section
  // Visual tweaks that extend Obsidian's native graph view without
  // duplicating its native controls. Colour mode drives body classes
  // the theme reads; scale/thickness are plugin-owned CSS vars applied
  // via pseudo-selectors on the graph canvas container.
  graphColourMode: string;     // 'mono' | 'accent' | 'folders'
  graphHalo: boolean;          // subtle accent glow under hovered node
  graphNodeScale: number;      // 0.5–2.0, multiplier on Obsidian's native size
  graphLinkThickness: number;  // 0.5–3.0, multiplier on link stroke weight
```

- [ ] **Step 2: Add Graph defaults**

In the same file, inside `DEFAULT_SETTINGS`, add (match placement to interface):

```typescript
  graphColourMode: 'accent',
  graphHalo: true,
  graphNodeScale: 1.0,
  graphLinkThickness: 1.0,
```

- [ ] **Step 3: Wire Graph body classes in the applier**

In `src/applier.ts`, near the existing density/sidebar/bg-class blocks (~line 354), add:

```typescript
  // Graph — colour mode is mutually exclusive, halo is an orthogonal overlay.
  // Scale + thickness are applied as CSS vars that the graph-view container
  // reads to multiply Obsidian's native node/link sizing. No theme paint.
  const ALL_GRAPH_MODE_CLASSES = [
    'tc-graph-colour-mode-mono',
    'tc-graph-colour-mode-accent',
    'tc-graph-colour-mode-folders',
  ];
  ALL_GRAPH_MODE_CLASSES.forEach(c => document.body.classList.remove(c));
  document.body.classList.add(`tc-graph-colour-mode-${s.graphColourMode || 'accent'}`);
  cls('tc-graph-halo', !!s.graphHalo);
```

Then in the `el.textContent = ...` block (~line 197), add the two CSS vars inside the `:root, body {` rule:

```typescript
  --tc-graph-node-scale: ${s.graphNodeScale ?? 1.0};
  --tc-graph-link-thickness: ${s.graphLinkThickness ?? 1.0};
```

- [ ] **Step 4: Add Graph class cleanup to remove()**

In the same file, inside `remove()` (~line 433), add:

```typescript
  ALL_GRAPH_MODE_CLASSES.forEach(c => document.body.classList.remove(c));
  document.body.classList.remove('tc-graph-halo');
```

(Move `ALL_GRAPH_MODE_CLASSES` to module scope so both `apply()` and `remove()` can reference it — declare it alongside the other `ALL_*_CLASSES` constants at the top of the file.)

- [ ] **Step 5: Replace Graph section placeholder in appearance.ts**

In `src/tabs/appearance.ts`, find the block (line 654-658):

```typescript
  containerEl.createEl("div", { cls: "tc-section-header", text: "Graph" });
  const graphBody = containerEl.createDiv("tc-section-body tc-feat-body tc-setting-card");
  graphBody.createEl("p", { cls: "tc-empty-hint",
    text: "Graph-view controls arrive here — node size, link thickness, hover halo, cluster tinting." });
```

Replace with:

```typescript
  // ── Graph section ─────────────────────────────────────
  containerEl.createEl("div", { cls: "tc-section-header", text: "Graph" });
  const graphBody = containerEl.createDiv("tc-section-body tc-feat-body tc-setting-card");

  // ── Colour cluster ────────────────────────────────────
  const graphColourCluster = buildCluster(graphBody, "Colour");
  buildSegmentSetting(graphColourCluster,
    "Colour mode",
    "How nodes and links take their hue",
    [
      { label: "Mono",    value: "mono"    },
      { label: "Accent",  value: "accent"  },
      { label: "Folders", value: "folders" },
    ],
    s.graphColourMode,
    async v => { s.graphColourMode = v; await refresh(); },
  );

  // ── Style cluster ─────────────────────────────────────
  const graphStyleCluster = buildCluster(graphBody, "Style");

  new Setting(graphStyleCluster)
    .setName("Hover halo")
    .setDesc("Soft accent glow under the node you're hovering")
    .addToggle(t => t
      .setValue(s.graphHalo)
      .onChange(async v => { s.graphHalo = v; await onChange(); })
    );

  new Setting(graphStyleCluster)
    .setName("Node scale")
    .setDesc("Multiplies Obsidian's native node size (0.5× – 2×)")
    .addSlider(sl => sl
      .setLimits(0.5, 2.0, 0.1)
      .setValue(s.graphNodeScale ?? 1.0)
      .setDynamicTooltip()
      .onChange(async v => { s.graphNodeScale = v; await onChange(); })
    );

  new Setting(graphStyleCluster)
    .setName("Link thickness")
    .setDesc("Stroke weight of connection lines (0.5× – 3×)")
    .addSlider(sl => sl
      .setLimits(0.5, 3.0, 0.1)
      .setValue(s.graphLinkThickness ?? 1.0)
      .setDynamicTooltip()
      .onChange(async v => { s.graphLinkThickness = v; await onChange(); })
    );
```

- [ ] **Step 6: Add plugin-owned Graph CSS**

Append to `styles.css` (at the end of the file, under a new comment block):

```css
/* ═══════════════════════════════════════════════════════════
   Graph view — plugin-owned overlays
   ═══════════════════════════════════════════════════════════ */

/* Node and link scale via CSS vars — applied only inside the graph
   view container so we don't affect any other circle/line elements. */
body .workspace-leaf-content[data-type="graph"] .graph-view.color-circle {
  transform: scale(var(--tc-graph-node-scale, 1));
}
body .workspace-leaf-content[data-type="graph"] .graph-view.color-line {
  stroke-width: calc(1px * var(--tc-graph-link-thickness, 1));
}

/* Hover halo — plugin-owned SVG filter / box-shadow overlay.
   Only active when body has tc-graph-halo. */
body.tc-graph-halo .workspace-leaf-content[data-type="graph"] .graph-view.color-circle:hover {
  filter: drop-shadow(0 0 6px var(--color-accent));
}
```

- [ ] **Step 7: Build and smoke-test**

```bash
npm run build
```

Expected: build succeeds, `main.js` + `manifest.json` + `styles.css` auto-deployed to `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Onnozelaer/.obsidian/plugins/tegenlicht-controls/`.

Smoke-test in Obsidian (Onnozelaer vault):
1. Settings → Tegenlicht → Appearance → scroll to Graph section — four controls render
2. Open the graph view (pane)
3. Toggle each control, verify:
   - Colour mode: cycling between Mono / Accent / Folders visibly changes graph node tint (or at least swaps body classes visible via DevTools → Elements)
   - Hover halo: hover over a node; glow appears with halo on, no glow with halo off
   - Node scale: sliding affects node visual size
   - Link thickness: sliding affects link stroke weight

- [ ] **Step 8: Commit**

```bash
git add src/settings.ts src/applier.ts src/tabs/appearance.ts styles.css
git commit -m "$(cat <<'EOF'
feat(appearance): Graph section controls + applier wiring

Adds graphColourMode / graphHalo / graphNodeScale / graphLinkThickness
settings, wires body classes (tc-graph-colour-mode-*, tc-graph-halo) and
CSS vars (--tc-graph-node-scale, --tc-graph-link-thickness) in the applier,
and replaces the Appearance tab's placeholder Graph section with four
controls across Colour + Style clusters.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Grain textures — wire the TRIAL dropdown fully

**Files:**
- Modify: `src/settings.ts` (add `grainStyle` field + default)
- Modify: `src/applier.ts` (body-class exclusivity for tc-grain-{film,paper,halftone,static})
- Modify: `src/tabs/appearance.ts` (convert inert TRIAL dropdown into a real persistent picker)
- Modify: `styles.css` (four grain texture `background-image` rules + cleanup of existing noise overlay)

**Owner:** Henske (SVG/CSS) + Thieuke (settings + UI)

- [ ] **Step 1: Add grainStyle to settings**

In `src/settings.ts`, in the Appearance block next to `noiseAmount`:

```typescript
  // Appearance — Background effects
  backgroundEffect: string;
  noiseAmount: number;
  grainStyle: string;        // 'film' | 'paper' | 'halftone' | 'static'
```

Default (in `DEFAULT_SETTINGS`):

```typescript
  grainStyle: 'film',
```

- [ ] **Step 2: Wire exclusive body classes in applier**

In `src/applier.ts`, at module scope (with the other `ALL_*_CLASSES`):

```typescript
const ALL_GRAIN_CLASSES = [
  'tc-grain-film', 'tc-grain-paper', 'tc-grain-halftone', 'tc-grain-static',
];
```

In `apply()`, replace the existing block (~line 423-424):

```typescript
  // Film-grain noise — toggle a single body class. The grain itself is a
  // CSS pseudo-element on .workspace so it never bleeds into modals, the
  // settings dialog, or any floating overlay. Opacity is driven by the
  // --tc-noise-opacity custom prop written in the main CSS block above.
  document.body.classList.toggle('tc-has-noise', (s.noiseAmount ?? 0) > 0);
  // Clean up any stray overlay from earlier builds that appended to body
  document.getElementById('tc-noise-overlay')?.remove();
```

with:

```typescript
  // Film-grain noise — tc-has-noise gates the overlay presence; tc-grain-{style}
  // picks which texture pattern renders. The --tc-noise-opacity var still
  // drives intensity for all four variants.
  document.body.classList.toggle('tc-has-noise', (s.noiseAmount ?? 0) > 0);
  ALL_GRAIN_CLASSES.forEach(c => document.body.classList.remove(c));
  document.body.classList.add(`tc-grain-${s.grainStyle || 'film'}`);
  document.getElementById('tc-noise-overlay')?.remove();
```

In `remove()`, add:

```typescript
  ALL_GRAIN_CLASSES.forEach(c => document.body.classList.remove(c));
```

- [ ] **Step 3: Replace the TRIAL dropdown with a real persistent picker**

In `src/tabs/appearance.ts`, find the block at lines 723-737 (the `grainStyleSetting` declaration with the "TRIAL — mock" comment). Replace the entire block with:

```typescript
  // Grain style sub-dropdown — visible only when noiseAmount > 0.
  grainStyleSetting = new Setting(surfaceCluster)
    .setName("Grain style")
    .setDesc("Texture of the film-grain overlay");
  grainStyleSetting.settingEl.style.display = (s.noiseAmount ?? 0) > 0 ? "" : "none";
  grainStyleSetting.addDropdown(dd => {
    dd.addOption("film",     "Film — fine gaussian");
    dd.addOption("paper",    "Paper — coarse, warm");
    dd.addOption("halftone", "Halftone — dot matrix");
    dd.addOption("static",   "Static — high-contrast");
    dd.setValue(s.grainStyle ?? 'film');
    dd.onChange(async v => { s.grainStyle = v; await onChange(); });
  });
```

- [ ] **Step 4: Add the four grain texture CSS blocks**

In `styles.css`, find the existing `body.tc-has-noise .workspace` rule (grep for `tc-has-noise` to locate; likely around line 2600-2700). Replace that rule's `background-image` with per-variant rules:

```css
/* ═══════════════════════════════════════════════════════════
   Grain textures — four variants, same --tc-noise-opacity drives alpha
   ═══════════════════════════════════════════════════════════ */

body.tc-has-noise .workspace::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: var(--tc-noise-opacity, 0);
  z-index: 1;
  mix-blend-mode: overlay;
}

/* Film — fine monochrome gaussian, mid-frequency */
body.tc-has-noise.tc-grain-film .workspace::after {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  background-size: 200px 200px;
}

/* Paper — coarser grain, warm bias, soft-light blend for cream feel */
body.tc-has-noise.tc-grain-paper .workspace::after {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.55' numOctaves='2' stitchTiles='stitch' seed='9'/><feColorMatrix values='0 0 0 0 0.92  0 0 0 0 0.82  0 0 0 0 0.68  0 0 0 0.48 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  background-size: 220px 220px;
  mix-blend-mode: soft-light;
}

/* Halftone — regular dot tile, 6px period */
body.tc-has-noise.tc-grain-halftone .workspace::after {
  background-image:
    radial-gradient(circle at 25% 25%, rgba(255,255,255,0.8) 0.9px, transparent 1.2px),
    radial-gradient(circle at 75% 75%, rgba(255,255,255,0.8) 0.9px, transparent 1.2px);
  background-size: 6px 6px, 6px 6px;
  background-position: 0 0, 3px 3px;
}

/* Static — high-contrast turbulence, hard-light blend for CRT feel */
body.tc-has-noise.tc-grain-static .workspace::after {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='turbulence' baseFrequency='2.8' numOctaves='2' stitchTiles='stitch' seed='3'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.6 -0.4'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  background-size: 160px 160px;
  mix-blend-mode: hard-light;
}
```

Remove any prior `body.tc-has-noise .workspace::after { background-image: ... }` rule that already exists to avoid double-application.

- [ ] **Step 5: Build and smoke-test**

```bash
npm run build
```

Smoke-test:
1. Settings → Appearance → Workspace → Surface → Background Grain slider → set to 40
2. Verify "Grain style" dropdown becomes visible below
3. Cycle through Film / Paper / Halftone / Static — each should show a visually distinct texture
4. Set Background Grain back to 0 — Grain style dropdown hides
5. DevTools → Elements → body should show `tc-has-noise` and exactly one `tc-grain-{style}` class when enabled; none when disabled

- [ ] **Step 6: Commit**

```bash
git add src/settings.ts src/applier.ts src/tabs/appearance.ts styles.css
git commit -m "$(cat <<'EOF'
feat(appearance): wire grain texture variants (film/paper/halftone/static)

Replaces the TRIAL grain-style dropdown with a real persistent picker
backed by a new grainStyle setting. Four variants wired via exclusive
tc-grain-{style} body classes; each owns its own background-image on
the .workspace::after pseudo-element. --tc-noise-opacity still drives
intensity for all four.

Default 'film' preserves v0.7.6 behaviour. Migration: absent grainStyle
→ 'film'.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Merge Highlights & Tints → Workspace → Editor accents cluster

**Files:**
- Modify: `src/tabs/appearance.ts` (delete Highlights & Tints section; add Editor accents cluster inside Workspace)

**Owner:** Thieuke

- [ ] **Step 1: Cut the Highlights & Tints section block**

In `src/tabs/appearance.ts`, find and delete lines 750-780 (the entire `// ── Highlights & Tints section ──` block through the three `buildColorToggleRow` calls for Active line / Selection tint / Caret colour).

- [ ] **Step 2: Add Editor accents cluster inside Workspace section**

In the same file, inside the Workspace section body (after the `accentAppCluster` block at line 741-748), add:

```typescript
  // ── Editor accents cluster — consolidates the old Highlights & Tints
  //    section (Active line / Selection tint / Caret colour) into the
  //    Workspace section. Same three colour-picker-plus-toggle rows, new
  //    home. Pickr instances still registered for cleanup via `pickrs`.
  const editorAccentsCluster = buildCluster(workspaceCard, "Editor accents");

  pickrs.push(buildColorToggleRow(editorAccentsCluster,
    "Active line", "Highlight the current cursor line in the editor",
    () => s.activeLineColour,
    v => { s.activeLineColour = v; },
    () => s.activeLineHighlight,
    v => { s.activeLineHighlight = v; },
    refresh,
  ));

  pickrs.push(buildColorToggleRow(editorAccentsCluster,
    "Selection tint", "Colour overlay applied to selected text",
    () => s.selectionTintColour,
    v => { s.selectionTintColour = v; },
    () => s.selectionTint,
    v => { s.selectionTint = v; },
    refresh,
  ));

  pickrs.push(buildColorToggleRow(editorAccentsCluster,
    "Caret colour", "Colour of the text insertion cursor",
    () => s.caretColour,
    v => { s.caretColour = v; },
    () => s.caretColourEnabled,
    v => { s.caretColourEnabled = v; },
    refresh,
  ));
```

- [ ] **Step 3: Build and smoke-test**

```bash
npm run build
```

Smoke-test:
1. Settings → Appearance — confirm Highlights & Tints section is GONE
2. Scroll to Workspace → verify "Editor accents" cluster appears with Active line / Selection tint / Caret colour rows
3. Open each Pickr, change a colour, verify it applies
4. Toggle each row's toggle, verify the effect engages/disengages
5. Close settings and reopen — state persists correctly

- [ ] **Step 4: Commit**

```bash
git add src/tabs/appearance.ts
git commit -m "$(cat <<'EOF'
refactor(appearance): merge Highlights & Tints into Workspace → Editor accents

Collapses the Appearance tab from 5 top sections to 4. The three
editor-surface colour pickers (Active line / Selection tint / Caret)
live inside the Workspace section as an "Editor accents" cluster —
same visual rhythm as Canvas / Surface / Accent application.

No settings changes, no applier changes; pure UI reorg.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Interface cluster — surface tabBarStyle + tabBarSpacing

**Files:**
- Modify: `src/tabs/appearance.ts` (new Interface cluster under Workspace section)

**Owner:** Thieuke

> **Note:** This cluster renders a picker for `tabBarStyle`, but the values we're offering here are the NEW set (`switch`, `switch-amber`, `underline`, `ghost`). Task 5 retires the old values and adds the CSS for the new ones. This task ships the UI; Task 5 ships the CSS + migration. Order matters: Task 4 → Task 5. Until Task 5 lands, the picker will render but not produce a visual change.

- [ ] **Step 1: Add the Interface cluster**

In `src/tabs/appearance.ts`, inside the Workspace section body, after the `editorAccentsCluster` block from Task 3, add:

```typescript
  // ── Interface cluster — surface tab nav style + spacing controls.
  //    tabBarStyle accepts: 'switch' (default, monochrome knob),
  //    'switch-amber' (accent knob), 'underline' (no track), 'ghost' (1px outline).
  //    Retired values migrate to 'switch' in loadSettings.
  const interfaceCluster = buildCluster(workspaceCard, "Interface");

  buildSegmentSetting(interfaceCluster,
    "Tab style",
    "How the settings tab navigation renders",
    [
      { label: "Switch",    value: "switch"       },
      { label: "Amber",     value: "switch-amber" },
      { label: "Underline", value: "underline"    },
      { label: "Ghost",     value: "ghost"        },
    ],
    s.tabBarStyle,
    async v => { s.tabBarStyle = v; await refresh(); },
  );

  new Setting(interfaceCluster)
    .setName("Tab spacing")
    .setDesc("Gap between tab buttons (0–16px)")
    .addSlider(sl => sl
      .setLimits(0, 16, 1)
      .setValue(s.tabBarSpacing ?? 6)
      .setDynamicTooltip()
      .onChange(async v => { s.tabBarSpacing = v; await refresh(); })
    );
```

- [ ] **Step 2: Build**

```bash
npm run build
```

No smoke-test yet — the picker's values won't do anything visible until Task 5 ships the new CSS and retires the old values. Build-only verification here.

- [ ] **Step 3: Commit**

```bash
git add src/tabs/appearance.ts
git commit -m "$(cat <<'EOF'
feat(appearance): Interface cluster — Tab style + Tab spacing picker

Surfaces the existing tabBarStyle and tabBarSpacing settings via a new
Interface cluster inside the Workspace section. The four values exposed
(switch / switch-amber / underline / ghost) are the new tab-nav set
defined in Task 5 — this commit ships the UI only; the CSS and legacy
value migration land in the next commit.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase 2 — Tab-nav restyle

### Task 5: Switch-first tab nav, retire 10 dormant variants, migrate saved values

**Files:**
- Modify: `src/settings-tab.ts` (reduce TAB_STYLES, update default, update applyTabStyle removeClass list)
- Modify: `src/main.ts` (add tabBarStyle migration in loadSettings)
- Modify: `styles.css` (remove ~10 retired variant blocks; add 4 new variant blocks)

**Owner:** Thieuke (structure) + Henske (switch knob CSS)

- [ ] **Step 1: Collapse TAB_STYLES to the new 4**

In `src/settings-tab.ts`, replace the TAB_STYLES array (lines 20-37) with:

```typescript
const TAB_STYLES: { id: string; label: string }[] = [
  { id: "switch",        label: "Switch"    },
  { id: "switch-amber",  label: "Amber"     },
  { id: "underline",     label: "Underline" },
  { id: "ghost",         label: "Ghost"     },
];
```

- [ ] **Step 2: Update the default fallback**

In the same file, inside `applyTabStyle` (line 292-293), change the fallback from `'pill-frost'` to `'switch'`:

```typescript
    if (!active.includes(this.plugin.settings.tabBarStyle ?? '')) {
      this.plugin.settings.tabBarStyle = 'switch';
      this.plugin.saveSettings();
    }
```

And line 326:

```typescript
    el.addClass(`tc-tabs-${this.plugin.settings.tabBarStyle ?? 'switch'}`);
```

- [ ] **Step 3: Update the removeClass cleanup list**

In the same file, inside `applyTabStyle` (line 296-325), replace the huge `el.removeClass(...)` argument list with a concise one (the retired names PLUS the new names, so toggling between styles doesn't leave stale classes):

```typescript
    el.removeClass(
      // New set
      "tc-tabs-switch", "tc-tabs-switch-amber",
      "tc-tabs-underline", "tc-tabs-ghost",
      // Retired pill variants
      "tc-tabs-pill", "tc-tabs-pill-soft", "tc-tabs-pill-ghost",
      "tc-tabs-pill-frost", "tc-tabs-pill-tint", "tc-tabs-pill-frosttint",
      "tc-tabs-pill-mono",
      "tc-tabs-pill-glow", "tc-tabs-pill-sweep", "tc-tabs-pill-gradient",
      "tc-tabs-pill-lifted", "tc-tabs-pill-dot", "tc-tabs-pill-inset",
      "tc-tabs-pill-neon", "tc-tabs-pill-duo", "tc-tabs-pill-flat",
      "tc-tabs-pill-pop", "tc-tabs-pill-shimmer", "tc-tabs-pill-badge",
      "tc-tabs-pill-dark", "tc-tabs-pill-pulse", "tc-tabs-pill-lineunder",
      // Retired line variants
      "tc-tabs-line", "tc-tabs-line-thick", "tc-tabs-line-fat",
      "tc-tabs-line-glow", "tc-tabs-line-grad", "tc-tabs-line-top",
      "tc-tabs-line-fill", "tc-tabs-line-cap", "tc-tabs-line-grow",
      "tc-tabs-line-dots", "tc-tabs-line-sweep", "tc-tabs-line-highlight",
      "tc-tabs-line-side", "tc-tabs-line-over", "tc-tabs-line-pill",
      "tc-tabs-line-neon", "tc-tabs-line-double", "tc-tabs-line-bracket",
      "tc-tabs-line-bold", "tc-tabs-line-float", "tc-tabs-line-frosttint",
      "tc-tabs-underline-thick",
      // Retired segment variants
      "tc-tabs-seg", "tc-tabs-seg-soft", "tc-tabs-seg-ghost",
      "tc-tabs-seg-frost", "tc-tabs-seg-tint", "tc-tabs-seg-frosttint",
      "tc-tabs-seg-mono",
      "tc-tabs-seg-accent", "tc-tabs-seg-border", "tc-tabs-seg-sweep",
      "tc-tabs-seg-pill", "tc-tabs-seg-glow", "tc-tabs-seg-grad",
      "tc-tabs-seg-inset", "tc-tabs-seg-flat", "tc-tabs-seg-dot",
      "tc-tabs-seg-neon", "tc-tabs-seg-minimal", "tc-tabs-seg-sharp",
      "tc-tabs-seg-outline", "tc-tabs-seg-gradwrap", "tc-tabs-seg-split",
      "tc-tabs-seg-thick", "tc-tabs-seg-badge",
    );
```

This keeps the cleanup robust even if a user rolls forward/backward with saved values.

- [ ] **Step 4: Migrate saved values in loadSettings**

In `src/main.ts`, inside `loadSettings()` (after the flavour migration at line 65-66), add:

```typescript
    // tabBarStyle migration — any value outside the new 4-style set
    // (switch / switch-amber / underline / ghost) collapses to 'switch'.
    const VALID_TAB_STYLES = new Set(['switch', 'switch-amber', 'underline', 'ghost']);
    if (!VALID_TAB_STYLES.has(this.settings.tabBarStyle)) {
      this.settings.tabBarStyle = 'switch';
    }
```

- [ ] **Step 5: Update DEFAULT_SETTINGS**

In `src/settings.ts`, change:

```typescript
  tabBarStyle: 'pill-frost',
```

to:

```typescript
  tabBarStyle: 'switch',
```

- [ ] **Step 6: Rip out retired tab-style CSS**

In `styles.css`, find every rule matching `.tc-tabs-pill*`, `.tc-tabs-line*`, `.tc-tabs-seg*`, `.tc-tabs-underline*` and delete them. Grep locations:

```bash
grep -n "tc-tabs-pill\|tc-tabs-line\|tc-tabs-seg\|tc-tabs-underline" styles.css
```

Expected: dozens of matches in the 250–700 line range. Delete every rule (full CSS block) for a retired variant.

**Keep** (do not delete):
- `.tc-settings .tc-tab-bar { ... }` (the base tab-bar rule)
- `.tc-settings .tc-tab { ... }` (the base tab button rule)
- `.tc-settings .tc-tab:hover { ... }`
- `.tc-settings .tc-tab:last-child { ... }`
- `[class*="tc-tabs-line"] .tc-tab-bar { ... }` — delete this too, it was for retired styles

**Delete** (the variant-specific active-state rules): everything matching the grep above except the four base rules listed as "keep".

- [ ] **Step 7: Add the four new tab-style CSS blocks**

In `styles.css`, near the top of the (now much shorter) tab-style section, add:

```css
/* ═══════════════════════════════════════════════════════════
   Tab nav — switch-first (v0.7.7)
   Four variants: switch (default, mono), switch-amber, underline, ghost.
   ═══════════════════════════════════════════════════════════ */

/* Shared: tab bar as a pill track (switch + switch-amber) */
.tc-settings.tc-tabs-switch .tc-tab-bar,
.tc-settings.tc-tabs-switch-amber .tc-tab-bar {
  display: inline-flex;
  padding: 3px;
  background: rgba(var(--mono-rgb-100, 200, 200, 200), 0.04);
  border: 1px solid var(--background-modifier-border);
  border-radius: 100px;
  position: relative;
}

.tc-settings.tc-tabs-switch .tc-tab,
.tc-settings.tc-tabs-switch-amber .tc-tab {
  padding: 7px 14px;
  border-radius: 100px;
  margin-right: var(--tc-tab-gap, 2px) !important;
  transition: color 180ms cubic-bezier(0.32, 0.72, 0, 1);
  position: relative;
  z-index: 2;
}

/* Switch — monochrome default */
.tc-settings.tc-tabs-switch .tc-tab--active {
  color: var(--text-normal);
  font-weight: 600;
  background: rgba(var(--mono-rgb-100, 200, 200, 200), 0.08);
  box-shadow: inset 0 0 0 1px var(--background-modifier-border);
}

/* Switch-amber — accent knob */
.tc-settings.tc-tabs-switch-amber .tc-tab--active {
  color: var(--color-accent, #e5b32a);
  font-weight: 600;
  background: rgba(var(--color-accent-rgb, 229, 179, 42), 0.14);
  box-shadow: inset 0 0 0 1px rgba(var(--color-accent-rgb, 229, 179, 42), 0.42);
}

/* Underline — zero-chrome */
.tc-settings.tc-tabs-underline .tc-tab-bar {
  border-bottom: 1px solid var(--background-modifier-border);
  border-radius: 0;
  padding: 0 0 2px;
}
.tc-settings.tc-tabs-underline .tc-tab {
  padding: 8px 14px 9px;
  border-radius: 0;
  margin-right: var(--tc-tab-gap, 4px) !important;
}
.tc-settings.tc-tabs-underline .tc-tab--active {
  color: var(--color-accent, #e5b32a);
  font-weight: 600;
  box-shadow: inset 0 -2px 0 var(--color-accent, #e5b32a);
}

/* Ghost — outlined pill, no fill */
.tc-settings.tc-tabs-ghost .tc-tab {
  padding: 6px 13px;
  border-radius: 100px;
  margin-right: var(--tc-tab-gap, 4px) !important;
}
.tc-settings.tc-tabs-ghost .tc-tab--active {
  color: var(--color-accent, #e5b32a);
  font-weight: 600;
  box-shadow: inset 0 0 0 1px var(--color-accent, #e5b32a);
}
```

**Note:** this implementation uses per-tab background fill instead of a true sliding knob. The reason: the tab bar's children are plain `<button>` elements with dynamic widths (from label text), so a single-knob `translateX` animation requires width measurement on every tab-change. Per-tab background avoids that complexity while preserving the switch-like visual language. Pitr-razor-approved simplification. If a future session wants the true sliding knob, it's a localized refactor on these rules alone.

- [ ] **Step 8: Build and smoke-test**

```bash
npm run build
```

Smoke-test:
1. Settings → Appearance → Workspace → Interface → "Tab style" picker — cycle through Switch / Amber / Underline / Ghost
2. Each style should render visibly distinct on the tab bar at the top of the settings panel
3. Tab spacing slider — verify gaps between tab buttons change live
4. DevTools → Elements → `.tc-settings` root should have exactly one `tc-tabs-{value}` class; cycling through values swaps it
5. Reload Obsidian — saved tabBarStyle persists
6. Simulate legacy migration: manually edit `data.json` in the test vault plugin folder, set `"tabBarStyle": "pill-frost"`, relaunch Obsidian → verify it migrates to `"switch"` on load (check DevTools body class; also the saved data.json should update on next settings change)

- [ ] **Step 9: Commit**

```bash
git add src/settings-tab.ts src/main.ts src/settings.ts styles.css
git commit -m "$(cat <<'EOF'
refactor(tabs): switch-first nav, retire 10 dormant variants

Collapses the 14-variant tab-style catalogue to 4: switch (default,
monochrome), switch-amber, underline, ghost. All retired variants'
CSS blocks removed from styles.css. Migration in loadSettings() maps
any saved legacy value to 'switch'.

The new default 'switch' uses a monochrome per-tab background fill
with subtle border — chosen over a true sliding knob because tab
button widths are label-dependent and a single-knob translateX would
need runtime measurement. Per-tab fill preserves the switch-like
visual language at far lower complexity.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase 3 — Legacy tab

### Task 6: Left-rail scaffolding — new Legacy tab shell

**Files:**
- Create: `src/tabs/legacy.ts`
- Modify: `src/tabs/_shared.ts` (add `buildLeftRailShell` helper)
- Modify: `src/settings-tab.ts` (add "Legacy" to TABS, route in renderContent, update Tab type)
- Modify: `styles.css` (left-rail CSS — container, rail items, content pane, row dividers)

**Owner:** Bostrol (scaffolding) + Thieuke (routing) + Henske (CSS)

- [ ] **Step 1: Add `buildLeftRailShell` helper**

In `src/tabs/_shared.ts`, append:

```typescript
export interface LeftRailSection {
  id: string;
  label: string;
  count: number;
  render: (contentPane: HTMLElement) => void;
}

/**
 * Left-rail navigation shell for dense-content tabs (used by Legacy).
 *
 * Renders a 180px vertical rail of section labels + count badges on the
 * left, and a single content pane on the right. Clicking a rail item
 * swaps the content pane by calling that section's render() callback.
 * Only one section is visible at a time — no inner scrolling between
 * sections.
 *
 * Active section state is transient (lives in closure, not saved to
 * settings). The tab always opens on the first section for a clean start.
 *
 * Returns a cleanup function for any disposers registered by the content
 * pane (e.g. Pickr instances). The caller is responsible for invoking it
 * on tab teardown.
 */
export function buildLeftRailShell(
  container: HTMLElement,
  sections: LeftRailSection[],
): () => void {
  const shell = container.createDiv("tc-leftrail-shell");
  const rail = shell.createDiv("tc-leftrail-rail");
  const pane = shell.createDiv("tc-leftrail-pane");

  const disposers: (() => void)[] = [];
  const railItems = new Map<string, HTMLElement>();

  let activeId = sections[0]?.id ?? "";

  const renderActive = () => {
    pane.empty();
    const active = sections.find(s => s.id === activeId);
    if (!active) return;
    active.render(pane);
  };

  sections.forEach(section => {
    const item = rail.createDiv("tc-leftrail-item");
    if (section.id === activeId) item.addClass("tc-leftrail-item--active");
    item.createSpan({ text: section.label, cls: "tc-leftrail-label" });
    item.createSpan({ text: String(section.count), cls: "tc-leftrail-count" });
    item.addEventListener("click", () => {
      if (section.id === activeId) return;
      railItems.forEach(el => el.removeClass("tc-leftrail-item--active"));
      item.addClass("tc-leftrail-item--active");
      activeId = section.id;
      renderActive();
    });
    railItems.set(section.id, item);
  });

  renderActive();

  return () => disposers.forEach(fn => { try { fn(); } catch { /* no-op */ } });
}
```

- [ ] **Step 2: Create the Legacy tab file**

Create `src/tabs/legacy.ts`:

```typescript
import TegenlichtControlsPlugin from "../main";
import { buildLeftRailShell, LeftRailSection } from "./_shared";

/**
 * Legacy tab — surfaces AnuPpuccin theme controls that don't have a
 * natural home elsewhere in the plugin. Uses a left-rail navigation
 * shell so the 40+ controls don't overwhelm a single scroll.
 *
 * Ship-push 1: Callouts (7) + Tables (10) + Codeblocks (5) + Show/Hide (6) + Tabs-deep (10)
 * Ship-push 2 (future): Headings + Lists & Tags + Workspace details
 * Skipped: Palette overrides, Integrations (Kanban / MAKE.md / Minimal Cards)
 */
export function build(
  containerEl: HTMLElement,
  plugin: TegenlichtControlsPlugin,
  onChange: () => Promise<void>,
  redisplay?: () => void,
): () => void {
  const s = plugin.settings;
  const refresh = async () => {
    await onChange();
    redisplay?.();
  };

  const sections: LeftRailSection[] = [
    {
      id: "callouts",
      label: "Callouts",
      count: 7,
      render: (pane) => renderCallouts(pane, s, onChange, refresh),
    },
    {
      id: "tables",
      label: "Tables",
      count: 10,
      render: (pane) => renderTables(pane, s, onChange, refresh),
    },
    {
      id: "codeblocks",
      label: "Codeblocks",
      count: 5,
      render: (pane) => renderCodeblocks(pane, s, onChange, refresh),
    },
    {
      id: "show-hide",
      label: "Show / Hide",
      count: 4,  // 4 new, 2 already in Features (scrollbars, status bar) — not duplicated
      render: (pane) => renderShowHide(pane, s, onChange, refresh),
    },
    {
      id: "tabs-deep",
      label: "Tabs (deep)",
      count: 10,
      render: (pane) => renderTabsDeep(pane, s, onChange, refresh),
    },
  ];

  return buildLeftRailShell(containerEl, sections);
}

// Section renderers — each is called when its rail item becomes active.
// Implementations land in Tasks 7 (Callouts + Tables) and 8 (Codeblocks + Show/Hide + Tabs-deep).

function renderCallouts(
  pane: HTMLElement,
  s: import("../settings").TegenlichtSettings,
  onChange: () => Promise<void>,
  refresh: () => Promise<void>,
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Callouts" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Callout box styling — shape, colour, radius, fold position. Plugin toggles body classes and writes CSS vars; the theme paints." });
  // Controls wired in Task 7.
  pane.createEl("p", { cls: "tc-empty-hint", text: "Controls incoming — Task 7." });
}

function renderTables(
  pane: HTMLElement,
  s: import("../settings").TegenlichtSettings,
  onChange: () => Promise<void>,
  refresh: () => Promise<void>,
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Tables" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Table styling — header highlight, row/column alternation, border weight, alignment." });
  pane.createEl("p", { cls: "tc-empty-hint", text: "Controls incoming — Task 7." });
}

function renderCodeblocks(
  pane: HTMLElement,
  s: import("../settings").TegenlichtSettings,
  onChange: () => Promise<void>,
  refresh: () => Promise<void>,
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Codeblocks" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Line wrap behaviour in Edit and Preview modes, plus background/text colour overrides." });
  pane.createEl("p", { cls: "tc-empty-hint", text: "Controls incoming — Task 8." });
}

function renderShowHide(
  pane: HTMLElement,
  s: import("../settings").TegenlichtSettings,
  onChange: () => Promise<void>,
  refresh: () => Promise<void>,
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Show / Hide" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Autohide titlebar, pointer cursor mode, metadata panel visibility, tooltip suppression. Scrollbars and status bar live in the Features tab." });
  pane.createEl("p", { cls: "tc-empty-hint", text: "Controls incoming — Task 8." });
}

function renderTabsDeep(
  pane: HTMLElement,
  s: import("../settings").TegenlichtSettings,
  onChange: () => Promise<void>,
  refresh: () => Promise<void>,
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Tabs (deep)" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Per-tab-style tuning — depth tab gap/opacity/text invert, safari-style tab height/radius/border." });
  pane.createEl("p", { cls: "tc-empty-hint", text: "Controls incoming — Task 8." });
}
```

- [ ] **Step 3: Register "Legacy" in the TABS array**

In `src/settings-tab.ts`, update the Tab type and TABS array:

```typescript
type Tab = "appearance" | "typography" | "editing" | "layout" | "features" | "legacy";

const TABS: { id: Tab; label: string }[] = [
  { id: "appearance", label: "Appearance" },
  { id: "typography", label: "Typography" },
  { id: "editing",    label: "Editing"    },
  { id: "layout",     label: "Layout"     },
  { id: "features",   label: "Features"   },
  { id: "legacy",     label: "Legacy"     },
];
```

- [ ] **Step 4: Import the new tab and add the switch case**

In `src/settings-tab.ts`, add import near the other tab imports (line 6-8):

```typescript
import { build as buildLegacy }     from "./tabs/legacy";
```

In `renderContent()` (line 184-192), add the new case:

```typescript
      case "legacy":     this.cleanup = buildLegacy(this.contentEl, this.plugin, onChange, redisplay); break;
```

- [ ] **Step 5: Add left-rail CSS**

Append to `styles.css`:

```css
/* ═══════════════════════════════════════════════════════════
   Legacy tab — left-rail navigation shell
   ═══════════════════════════════════════════════════════════ */

.tc-settings .tc-leftrail-shell {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 0;
  background: var(--background-primary);
  border: 1px solid var(--background-modifier-border);
  border-radius: 8px;
  overflow: hidden;
  min-height: 420px;
}

.tc-settings .tc-leftrail-rail {
  background: var(--background-secondary);
  border-right: 1px solid var(--background-modifier-border);
  padding: 8px 0;
}

.tc-settings .tc-leftrail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 16px;
  font-size: 12px;
  color: var(--text-muted);
  cursor: pointer;
  border-left: 2px solid transparent;
  transition: background 120ms ease, color 120ms ease, border-left-color 120ms ease;
}

.tc-settings .tc-leftrail-item:hover {
  background: var(--background-modifier-hover);
  color: var(--text-normal);
}

.tc-settings .tc-leftrail-item--active {
  color: var(--text-normal);
  background: rgba(var(--color-accent-rgb, 229, 179, 42), 0.04);
  border-left-color: var(--color-accent);
  font-weight: 600;
}

.tc-settings .tc-leftrail-count {
  font-size: 10px;
  color: var(--text-faint);
  font-weight: 400;
  font-variant-numeric: tabular-nums;
}

.tc-settings .tc-leftrail-item--active .tc-leftrail-count {
  color: var(--text-muted);
}

.tc-settings .tc-leftrail-pane {
  padding: 18px 20px;
  overflow-y: auto;
}

.tc-settings .tc-leftrail-sechead {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-normal);
  letter-spacing: -0.005em;
}

.tc-settings .tc-leftrail-secdesc {
  margin: 0 0 16px 0;
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.5;
  max-width: 62ch;
}

/* Row dividers inside the content pane — dashboard hardening */
.tc-settings .tc-leftrail-pane .setting-item {
  border-top: 1px solid var(--background-modifier-border-hover);
  padding: 9px 0;
}
.tc-settings .tc-leftrail-pane .setting-item:first-of-type {
  border-top: none;
}
```

- [ ] **Step 6: Build and smoke-test**

```bash
npm run build
```

Smoke-test:
1. Settings → Tegenlicht — the tab bar now shows 6 tabs, "Legacy" at the far right
2. Click Legacy — the left-rail shell renders with 5 rail items: Callouts (7), Tables (10), Codeblocks (5), Show / Hide (4), Tabs (deep) (10)
3. Click each rail item → content pane swaps, heading + description visible, "Controls incoming — Task N" placeholder hint
4. Active rail item has accent-tinted left border
5. Resize settings panel width — rail stays at 180px, content pane flexes
6. Open any other tab then return to Legacy — rail resets to first item (Callouts)

- [ ] **Step 7: Commit**

```bash
git add src/tabs/_shared.ts src/tabs/legacy.ts src/settings-tab.ts styles.css
git commit -m "$(cat <<'EOF'
feat(legacy): left-rail architecture + section scaffolding

New Legacy tab with a 180px left-rail navigation shell. Five section
placeholders wired: Callouts (7), Tables (10), Codeblocks (5),
Show/Hide (4), Tabs deep (10). Controls themselves land in Tasks 7-8.

Adds buildLeftRailShell() to _shared.ts for potential reuse. The
shell's active-section state is transient (lives in closure), so the
tab always opens on the first section for a clean start.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Legacy ports — Callouts + Tables content

**Files:**
- Modify: `src/settings.ts` (17 new settings fields + defaults)
- Modify: `src/applier.ts` (body-class toggles for class-toggle/class-select; CSS var writes for variable-*)
- Modify: `src/tabs/legacy.ts` (flesh out `renderCallouts` and `renderTables`)

**Owner:** Thieuke (UI) + Jonasty (YAML verification + applier)

**YAML verification source:** the table below exactly matches the AnuPpuccin `@settings` YAML at `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Onnozelaer/.obsidian/themes/AnuPpuccin/theme.css`. Before wiring any control, re-verify the class name against the file.

#### Callouts cluster (7 controls)

| AnuPpuccin id | Plugin key | Type | Body class / CSS var |
|---------------|-----------|------|----------------------|
| `anp-callout-select` | `calloutStyle` | class-select | `anp-callout-sleek` / `anp-callout-block` / `anp-callout-vanilla-normal` / `anp-callout-vanilla-plus` (default = none) |
| `anp-callout-color-toggle` | `calloutCustomColors` | class-toggle | `anp-callout-color-toggle` |
| `callout-radius` | `calloutRadius` | variable-number | `--callout-radius` (default 8, range 0–24, unit `px`) |
| `callout-title-padding` | `calloutTitlePaddingX` | variable-number | `--callout-title-padding` (default 12, range 0–32, unit `px`) |
| `callout-title-opacity` | `calloutTitleOpacity` | variable-number-slider | `--callout-title-opacity` (default 60, range 0–100) |
| `callout-content-padding` | `calloutContentPadding` | variable-number | `--callout-content-padding` (default 16, range 0–40, unit `px`) |
| `anp-callout-fold-position` | `calloutFoldPosition` | variable-select | `--callout-fold-position` (0 = left, 1 = right) |

- [ ] **Step 1: Add Callouts settings**

In `src/settings.ts`, inside `TegenlichtSettings`, append a "Legacy — Callouts" block:

```typescript
  // Legacy — Callouts (AnuPpuccin @settings section: Callouts)
  calloutStyle: string;              // 'default' | 'sleek' | 'block' | 'vanilla-normal' | 'vanilla-plus'
  calloutCustomColors: boolean;
  calloutRadius: number;             // 0–24 px
  calloutTitlePaddingX: number;      // 0–32 px
  calloutTitleOpacity: number;       // 0–100 (written as 0–1 to CSS var)
  calloutContentPadding: number;     // 0–40 px
  calloutFoldPosition: string;       // 'left' | 'right'
```

Defaults:

```typescript
  calloutStyle: 'default',
  calloutCustomColors: false,
  calloutRadius: 8,
  calloutTitlePaddingX: 12,
  calloutTitleOpacity: 60,
  calloutContentPadding: 16,
  calloutFoldPosition: 'left',
```

- [ ] **Step 2: Wire Callouts applier**

In `src/applier.ts`:

```typescript
const ALL_CALLOUT_STYLE_CLASSES = [
  'anp-callout-sleek', 'anp-callout-block',
  'anp-callout-vanilla-normal', 'anp-callout-vanilla-plus',
];
```

In `apply()`:

```typescript
  // Legacy — Callouts
  ALL_CALLOUT_STYLE_CLASSES.forEach(c => document.body.classList.remove(c));
  if (s.calloutStyle && s.calloutStyle !== 'default') {
    document.body.classList.add(`anp-callout-${s.calloutStyle}`);
  }
  cls('anp-callout-color-toggle', !!s.calloutCustomColors);
```

In the `el.textContent = ...` block, add to the `:root, body {` rule:

```typescript
  --callout-radius: ${s.calloutRadius ?? 8}px;
  --callout-title-padding: ${s.calloutTitlePaddingX ?? 12}px;
  --callout-title-opacity: ${((s.calloutTitleOpacity ?? 60) / 100).toFixed(2)};
  --callout-content-padding: ${s.calloutContentPadding ?? 16}px;
  --callout-fold-position: ${s.calloutFoldPosition === 'right' ? '1' : '0'};
```

In `remove()`:

```typescript
  ALL_CALLOUT_STYLE_CLASSES.forEach(c => document.body.classList.remove(c));
  document.body.classList.remove('anp-callout-color-toggle');
```

- [ ] **Step 3: Render Callouts UI**

In `src/tabs/legacy.ts`, first update the imports at the top of the file to include `Setting` from obsidian and `buildSegmentSetting` from `./_shared`:

```typescript
import { Setting } from "obsidian";
import { buildLeftRailShell, LeftRailSection, buildSegmentSetting } from "./_shared";
```

Then replace the existing `renderCallouts` function body with:

```typescript
function renderCallouts(
  pane: HTMLElement,
  s: import("../settings").TegenlichtSettings,
  onChange: () => Promise<void>,
  refresh: () => Promise<void>,
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Callouts" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Callout box styling — shape, colour, radius, fold position. Plugin toggles body classes and writes CSS vars; the theme paints." });

  buildSegmentSetting(pane,
    "Callout style",
    "Overall shape and shadow language for every callout",
    [
      { label: "Default",       value: "default"        },
      { label: "Sleek",         value: "sleek"          },
      { label: "Block",         value: "block"          },
      { label: "Vanilla",       value: "vanilla-normal" },
      { label: "Vanilla+",      value: "vanilla-plus"   },
    ],
    s.calloutStyle,
    async v => { s.calloutStyle = v; await refresh(); },
  );

  new Setting(pane)
    .setName("Enable custom callout colours")
    .setDesc("Override the theme's per-type tint with AnuPpuccin's palette")
    .addToggle(t => t
      .setValue(s.calloutCustomColors)
      .onChange(async v => { s.calloutCustomColors = v; await onChange(); })
    );

  new Setting(pane)
    .setName("Callout radius")
    .setDesc("Corner rounding, 0–24px")
    .addSlider(sl => sl
      .setLimits(0, 24, 1)
      .setValue(s.calloutRadius ?? 8)
      .setDynamicTooltip()
      .onChange(async v => { s.calloutRadius = v; await onChange(); })
    );

  new Setting(pane)
    .setName("Title padding")
    .setDesc("Horizontal padding on the callout title strip")
    .addSlider(sl => sl
      .setLimits(0, 32, 1)
      .setValue(s.calloutTitlePaddingX ?? 12)
      .setDynamicTooltip()
      .onChange(async v => { s.calloutTitlePaddingX = v; await onChange(); })
    );

  new Setting(pane)
    .setName("Title background opacity")
    .setDesc("Alpha of the title strip, 0–100")
    .addSlider(sl => sl
      .setLimits(0, 100, 1)
      .setValue(s.calloutTitleOpacity ?? 60)
      .setDynamicTooltip()
      .onChange(async v => { s.calloutTitleOpacity = v; await onChange(); })
    );

  new Setting(pane)
    .setName("Content padding")
    .setDesc("Padding on the body below the title")
    .addSlider(sl => sl
      .setLimits(0, 40, 1)
      .setValue(s.calloutContentPadding ?? 16)
      .setDynamicTooltip()
      .onChange(async v => { s.calloutContentPadding = v; await onChange(); })
    );

  buildSegmentSetting(pane,
    "Fold position",
    "Which side the collapse chevron sits",
    [
      { label: "Left",  value: "left"  },
      { label: "Right", value: "right" },
    ],
    s.calloutFoldPosition,
    async v => { s.calloutFoldPosition = v; await onChange(); },
  );
}
```

#### Tables cluster (10 controls)

| AnuPpuccin id | Plugin key | Type | Body class / CSS var |
|---------------|-----------|------|----------------------|
| `anp-table-toggle` | `tableStyling` | class-toggle | `anp-table-toggle` |
| `anp-table-width` | `tableCustomWidth` | class-toggle | `anp-table-width` |
| `anp-table-auto` | `tableCentered` | class-toggle | `anp-table-auto` |
| `anp-table-th-highlight` | `tableThHighlight` | class-toggle | `anp-table-th-highlight` |
| `anp-td-highlight` | `tableRowHighlight` | class-select | `anp-table-row-alt` / `anp-table-col-alt` / `anp-table-checkered` / `anp-table-full` (default = none) |
| `anp-table-highlight-opacity` | `tableHighlightOpacity` | variable-number-slider | `--anp-table-highlight-opacity` (0–100, default 10) |
| `anp-table-align-th` | `tableAlignTh` | variable-select | `--anp-table-align-th` (left/center/right) |
| `anp-table-align-td` | `tableAlignTd` | variable-select | `--anp-table-align-td` (left/center/right) |
| `anp-table-thickness` | `tableBorderWidth` | variable-number | `--anp-table-thickness` (0–4, default 1, unit `px`) |
| `anp-table-width-pct` | `tableLegacyWidthPct` | variable-number | `--anp-table-width-pct` (renamed to avoid collision with existing `tableWidthPct` in Layout tab — keep both; this one is the AnuPpuccin control, Layout's is plugin-owned) |

> **Scope note (Pitr's razor):** `tableWidthPct` already exists in settings from the Layout tab. The AnuPpuccin version uses the same semantics but different class naming. Decision: keep the existing `tableWidthPct` wired to Layout only (it writes `--anp-table-width-pct`), and DO NOT add a duplicate `tableLegacyWidthPct`. The AnuPpuccin width control is already surfaced via Layout. Drop it from Tables; count becomes 9.

**Updated Tables count: 9 controls** (remove `tableLegacyWidthPct`).

- [ ] **Step 4: Add Tables settings**

In `src/settings.ts`:

```typescript
  // Legacy — Tables (AnuPpuccin @settings section: Tables)
  tableStyling: boolean;
  tableCustomWidth: boolean;
  tableCentered: boolean;
  tableThHighlight: boolean;
  tableRowHighlight: string;          // 'none' | 'row-alt' | 'col-alt' | 'checkered' | 'full'
  tableHighlightOpacity: number;      // 0–100 → 0–1 CSS var
  tableAlignTh: string;               // 'left' | 'center' | 'right'
  tableAlignTd: string;               // 'left' | 'center' | 'right'
  tableBorderWidth: number;           // 0–4 px
```

Defaults:

```typescript
  tableStyling: false,
  tableCustomWidth: false,
  tableCentered: false,
  tableThHighlight: false,
  tableRowHighlight: 'none',
  tableHighlightOpacity: 10,
  tableAlignTh: 'left',
  tableAlignTd: 'left',
  tableBorderWidth: 1,
```

- [ ] **Step 5: Wire Tables applier**

In `src/applier.ts`:

```typescript
const ALL_TABLE_HIGHLIGHT_CLASSES = [
  'anp-table-row-alt', 'anp-table-col-alt', 'anp-table-checkered', 'anp-table-full',
];
```

In `apply()`:

```typescript
  // Legacy — Tables
  cls('anp-table-toggle',        s.tableStyling);
  cls('anp-table-width',         s.tableCustomWidth);
  cls('anp-table-auto',          s.tableCentered);
  cls('anp-table-th-highlight',  s.tableThHighlight);
  ALL_TABLE_HIGHLIGHT_CLASSES.forEach(c => document.body.classList.remove(c));
  if (s.tableRowHighlight && s.tableRowHighlight !== 'none') {
    document.body.classList.add(`anp-table-${s.tableRowHighlight}`);
  }
```

In the `el.textContent = ...` block, add:

```typescript
  --anp-table-highlight-opacity: ${((s.tableHighlightOpacity ?? 10) / 100).toFixed(2)};
  --anp-table-align-th: ${s.tableAlignTh || 'left'};
  --anp-table-align-td: ${s.tableAlignTd || 'left'};
  --anp-table-thickness: ${s.tableBorderWidth ?? 1}px;
```

In `remove()`:

```typescript
  ALL_TABLE_HIGHLIGHT_CLASSES.forEach(c => document.body.classList.remove(c));
  ['anp-table-toggle', 'anp-table-width', 'anp-table-auto', 'anp-table-th-highlight']
    .forEach(c => document.body.classList.remove(c));
```

- [ ] **Step 6: Render Tables UI**

In `src/tabs/legacy.ts`, replace `renderTables`:

```typescript
function renderTables(
  pane: HTMLElement,
  s: import("../settings").TegenlichtSettings,
  onChange: () => Promise<void>,
  refresh: () => Promise<void>,
): void {
  pane.createEl("h3", { cls: "tc-leftrail-sechead", text: "Tables" });
  pane.createEl("p", { cls: "tc-leftrail-secdesc",
    text: "Table styling — header highlight, row/column alternation, border weight, alignment. Table width lives in the Layout tab." });

  new Setting(pane).setName("Enable table styling").setDesc("Master toggle for AnuPpuccin's table treatment")
    .addToggle(t => t.setValue(s.tableStyling).onChange(async v => { s.tableStyling = v; await onChange(); }));

  new Setting(pane).setName("Custom table width").setDesc("Enable the custom table-width rule")
    .addToggle(t => t.setValue(s.tableCustomWidth).onChange(async v => { s.tableCustomWidth = v; await onChange(); }));

  new Setting(pane).setName("Center tables").setDesc("Horizontally centre tables in the viewport")
    .addToggle(t => t.setValue(s.tableCentered).onChange(async v => { s.tableCentered = v; await onChange(); }));

  new Setting(pane).setName("Header row highlight").setDesc("Emphasise the <th> row")
    .addToggle(t => t.setValue(s.tableThHighlight).onChange(async v => { s.tableThHighlight = v; await onChange(); }));

  buildSegmentSetting(pane,
    "Row / column highlight",
    "Alternating or checkered fill across rows or columns",
    [
      { label: "None",       value: "none"      },
      { label: "Rows",       value: "row-alt"   },
      { label: "Columns",    value: "col-alt"   },
      { label: "Checkered",  value: "checkered" },
      { label: "Full",       value: "full"      },
    ],
    s.tableRowHighlight,
    async v => { s.tableRowHighlight = v; await refresh(); },
  );

  new Setting(pane).setName("Highlight opacity").setDesc("Alpha of row/column highlight, 0–100")
    .addSlider(sl => sl.setLimits(0, 100, 1).setValue(s.tableHighlightOpacity ?? 10).setDynamicTooltip()
      .onChange(async v => { s.tableHighlightOpacity = v; await onChange(); }));

  buildSegmentSetting(pane,
    "<th> text align",
    "Header cell text alignment",
    [
      { label: "Left",   value: "left"   },
      { label: "Center", value: "center" },
      { label: "Right",  value: "right"  },
    ],
    s.tableAlignTh,
    async v => { s.tableAlignTh = v; await onChange(); },
  );

  buildSegmentSetting(pane,
    "<td> text align",
    "Body cell text alignment",
    [
      { label: "Left",   value: "left"   },
      { label: "Center", value: "center" },
      { label: "Right",  value: "right"  },
    ],
    s.tableAlignTd,
    async v => { s.tableAlignTd = v; await onChange(); },
  );

  new Setting(pane).setName("Border width").setDesc("Table grid line thickness, 0–4px")
    .addSlider(sl => sl.setLimits(0, 4, 1).setValue(s.tableBorderWidth ?? 1).setDynamicTooltip()
      .onChange(async v => { s.tableBorderWidth = v; await onChange(); }));
}
```

Also update the section count in the sections array:

```typescript
    {
      id: "tables",
      label: "Tables",
      count: 9,  // updated from 10 — see Pitr-razor note
      render: ...
    },
```

- [ ] **Step 7: Build and smoke-test**

```bash
npm run build
```

Smoke-test:
1. Legacy → Callouts — all 7 controls render; flip each, verify DevTools body class or CSS var change
2. Create a test note with a `> [!note] Test` callout; verify visual changes as settings change
3. Legacy → Tables — all 9 controls render
4. Create a test note with a markdown table; verify visual changes as settings change
5. Reload Obsidian — all 16 new settings persist

- [ ] **Step 8: Commit**

```bash
git add src/settings.ts src/applier.ts src/tabs/legacy.ts
git commit -m "$(cat <<'EOF'
feat(legacy): port Callouts + Tables controls (ship-push 1 part 1)

16 new controls surfaced in Legacy → Callouts (7) and Legacy → Tables
(9). Each wired to its AnuPpuccin @settings id — class names verified
against theme.css before wiring (per the plugin/theme boundary rule).

Table width is NOT duplicated — it remains in the Layout tab per the
Pitr-razor scope note in the plan. Tables count in Legacy is 9, not
10.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Legacy ports — Codeblocks + Show/Hide + Tabs-deep content

**Files:**
- Modify: `src/settings.ts` (~18 new fields)
- Modify: `src/applier.ts` (class toggles + CSS var writes)
- Modify: `src/tabs/legacy.ts` (flesh out 3 renderers)

**Owner:** Thieuke + Jonasty

This task follows the same pattern as Task 7. Control registries below; implementation mirrors Task 7's structure. Re-verify every class name against AnuPpuccin's theme.css before wiring.

#### Codeblocks cluster (5 controls)

| AnuPpuccin id | Plugin key | Type | Body class / CSS var |
|---------------|-----------|------|----------------------|
| `anp-codeblock-numbers` | already wired (`codeblockLineNumbers` in Editing tab) | — | **DO NOT DUPLICATE** — only the 4 below land in Legacy |
| `anp-codeblock-wrap-edit` | `codeblockWrapEdit` | class-select | `anp-codeblock-edit-nowrap` (default = none) |
| `anp-codeblock-wrap-preview` | `codeblockWrapPreview` | class-select | `anp-codeblock-preview-nowrap` (default = none) |
| `anp-codeblock-wrap-hl-preview` | `codeblockWrapHlPreview` | class-select | `anp-codeblock-preview-hl-nowrap` (default = none) |
| `anp-code-bg-color` | `codeblockBgColor` | variable-themed-color | `--anp-code-bg-color` (hex; default empty → theme wins) |
| `anp-code-text-color` | `codeblockTextColor` | variable-themed-color | `--anp-code-text-color` |

**Adjusted count: 5 controls** (3 wrap selects + 2 colours). Line numbers stays in Editing tab.

Each wrap control: segment "Wrap" / "No wrap". Colour controls: Pickr-backed, same pattern as `buildColorToggleRow` in Appearance (but without the toggle — always-on, empty string means reset to theme default).

#### Show / Hide cluster (4 controls)

| AnuPpuccin id | Plugin key | Type | Body class / CSS var |
|---------------|-----------|------|----------------------|
| `anp-autohide-titlebar` | `hideTitlebarAuto` | class-toggle | `anp-autohide-titlebar` |
| `anp-cursor` | `uiPointerCursor` | variable-select | `--anp-cursor` (`pointer` or `initial`) |
| `anp-toggle-metadata` | `hideMetadata` | class-toggle | `anp-toggle-metadata` |
| `anp-tooltip-toggle` | `hideTooltips` | class-toggle | `anp-tooltip-toggle` |

**Not included** (already in Features tab): `anp-toggle-scrollbars` (mapped to `showScrollbars`), `anp-hide-status-bar` (mapped to `showStatusBar`).

#### Tabs-deep cluster (10 controls)

| AnuPpuccin id | Plugin key | Type | Body class / CSS var |
|---------------|-----------|------|----------------------|
| `anp-alt-tab-style` | already wired (`tabStyle` in Features tab) | — | **DO NOT DUPLICATE** |
| `anp-alt-tab-custom-height` | `tabCustomHeight` | variable-number | `--anp-alt-tab-custom-height` (default 32, range 20–48, unit `px`) |
| `anp-disable-newtab-align` | `tabDisableNewTabAlign` | class-toggle | `anp-disable-newtab-align` |
| `anp-depth-tab-text-invert` | `tabDepthTextInvert` | class-toggle | `anp-depth-tab-text-invert` |
| `anp-depth-tab-opacity` | `tabDepthOpacity` | variable-number-slider | `--anp-depth-tab-opacity` (0–100 → 0–1) |
| `anp-depth-tab-gap` | `tabDepthGap` | variable-number | `--anp-depth-tab-gap` (default 4, range 0–16, unit `px`) |
| `anp-safari-tab-radius` | `tabSafariRadius` | variable-number | `--anp-safari-tab-radius` (default 8, range 0–16, unit `px`) |
| `anp-safari-tab-gap` | `tabSafariGap` | variable-number | `--anp-safari-tab-gap` (default 4, range 0–16, unit `px`) |
| `anp-safari-border-width` | `tabSafariBorderWidth` | variable-number | `--anp-safari-border-width` (default 1, range 0–4, unit `px`) |
| `anp-safari-tab-animated` | `tabSafariAnimated` | class-toggle | `anp-safari-tab-animated` |

**Adjusted count: 9 controls** (top-level tab style stays in Features; 9 deep tuning controls land in Legacy).

Implementation checklist (apply the Task 7 pattern to each control):

- [ ] **Step 1: Add all 17 new settings to `TegenlichtSettings` + `DEFAULT_SETTINGS`**

Use the keys and defaults in the registries above. Group by cluster with comments (`// Legacy — Codeblocks`, etc.).

- [ ] **Step 2: Wire Codeblocks applier**

```typescript
const ALL_CB_WRAP_EDIT_CLASSES = ['anp-codeblock-edit-nowrap'];
const ALL_CB_WRAP_PREVIEW_CLASSES = ['anp-codeblock-preview-nowrap'];
const ALL_CB_WRAP_HL_CLASSES = ['anp-codeblock-preview-hl-nowrap'];
```

In `apply()`, mutually-exclusive toggle per wrap control (`none` = no class, `nowrap` = add the class). CSS vars written for colour overrides, skipped if empty.

- [ ] **Step 3: Wire Show/Hide applier**

Simple class toggles + one CSS var write for `--anp-cursor`.

- [ ] **Step 4: Wire Tabs-deep applier**

Class toggles + CSS var writes. `tabDepthOpacity` converted 0–100 → 0–1 like the existing `rainbowFullBgOpacity`.

- [ ] **Step 5: Render all three section UIs in `src/tabs/legacy.ts`**

Follow the Task 7 pattern. Use `buildSegmentSetting` for all class-selects and variable-selects with 2-4 options. Use native `Setting.addSlider` for ranges. Use native `Setting.addToggle` for booleans. For the two codeblock colour pickers, create a small local `buildColourVarRow` helper (colour picker only, no toggle, empty = revert to theme default) — this doesn't exist in `_shared.ts` yet; inline it in `legacy.ts` or add it to `_shared.ts` if it's clearly reusable.

- [ ] **Step 6: Update Legacy section counts**

In the sections array in `src/tabs/legacy.ts`:

```typescript
    { id: "codeblocks",  label: "Codeblocks",  count: 5,  render: ... },
    { id: "show-hide",   label: "Show / Hide", count: 4,  render: ... },
    { id: "tabs-deep",   label: "Tabs (deep)", count: 9,  render: ... },
```

- [ ] **Step 7: Build and smoke-test**

```bash
npm run build
```

Smoke-test checklist:
- Legacy → Codeblocks: 5 controls render; create a note with a code block, cycle wrap/no-wrap in each mode, verify visual change
- Legacy → Show / Hide: 4 controls render; toggle each, verify expected UI change (titlebar autohide, pointer cursor, metadata hidden, tooltips suppressed)
- Legacy → Tabs (deep): 9 controls render; with Features → Tab style set to "Depth", verify the Depth-specific controls affect tab rendering; same for Safari style
- Reload Obsidian — all 17 new settings persist

- [ ] **Step 8: Commit**

```bash
git add src/settings.ts src/applier.ts src/tabs/legacy.ts
git commit -m "$(cat <<'EOF'
feat(legacy): port Codeblocks + Show/Hide + Tabs-deep (ship-push 1 part 2)

17 new controls complete Ship-push 1 of the Legacy tab port:
- Codeblocks (5): wrap modes for edit / preview / highlighted preview + bg/text colour
- Show / Hide (4): autohide titlebar, pointer cursor, hide metadata, hide tooltips
- Tabs deep (9): per-style tuning for Depth and Safari tab variants

Controls already surfaced elsewhere are not duplicated:
- Codeblock line numbers → stays in Editing tab
- Tab style top-level select → stays in Features tab
- Scrollbars / status bar → stay in Features tab

All AnuPpuccin class names verified against theme.css before wiring.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase 4 — Merge sequence

### Task 9: Version bump, CHANGELOG, merge to main

**Files:**
- Modify: `manifest.json` (version: 0.7.6 → 0.7.7)
- Modify: `package.json` (version: 0.7.6 → 0.7.7)
- Modify: `CHANGELOG.md` (new v0.7.7 entry)
- Create: CHANGELOG.md if it doesn't exist

**Owner:** Bostrol (CHANGELOG) + Jonasty (version parity + smoke test) + Kevijntje (merge discipline)

- [ ] **Step 1: Full-branch smoke test**

Before the version bump, run an end-to-end smoke test covering every commit's feature:

```bash
npm run build
```

Checklist (perform all in the Onnozelaer test vault):
- [ ] Appearance → Graph: 4 controls work
- [ ] Appearance → Workspace → Surface: grain slider + style dropdown (4 textures)
- [ ] Appearance has 4 top sections, not 5 (Highlights & Tints is gone, Editor accents is inside Workspace)
- [ ] Appearance → Workspace → Interface: Tab style + Tab spacing picker
- [ ] Tab bar renders in all 4 new styles (Switch / Amber / Underline / Ghost)
- [ ] Tab bar has 6 tabs — Legacy is the 6th
- [ ] Legacy → rail renders 5 sections with correct counts (7, 9, 5, 4, 9)
- [ ] Every Legacy control toggles correctly and persists across reload
- [ ] No console errors / warnings during normal use
- [ ] Deactivate the plugin — all plugin-owned classes removed from body (verify via DevTools)
- [ ] Reactivate — all saved settings restored

Resolve any failure before proceeding. If any issue cannot be fixed quickly, the fix must land as an additional commit BEFORE the version bump.

- [ ] **Step 2: Bump manifest.json**

```json
{
  "id": "tegenlicht-controls",
  "name": "Tegenlicht Controls",
  "version": "0.7.7",
  ...
}
```

- [ ] **Step 3: Bump package.json**

```json
{
  "name": "obsidian-tegenlicht-controls",
  "version": "0.7.7",
  ...
}
```

- [ ] **Step 4: Check for other version-bearing files**

```bash
grep -rn "0\.7\.6" . --include="*.json" --include="*.md" --include="*.ts" | grep -v "node_modules\|.git\|main.js"
```

Expected: manifest.json and package.json (already bumped). If anything else appears, bump it too.

Also check `src/settings-tab.ts` line 89 — the hardcoded `v0.7.4` in the header badge! Update to read from `this.plugin.manifest.version` dynamically:

```typescript
top.createSpan({ cls: "tc-header-badge", text: `v${this.plugin.manifest.version}` });
```

This is a spec-required fix (all three header-minimal variants called it out).

- [ ] **Step 5: Write CHANGELOG entry**

If `CHANGELOG.md` doesn't exist at the repo root, create it with a Keep-a-Changelog header. Then prepend the new version entry:

```markdown
## [0.7.7] — 2026-04-16 — codename "Tegendraads"

### Added
- Graph section in Appearance tab — Colour mode (Mono / Accent / Folders), Hover halo, Node scale, Link thickness.
- Four grain texture variants in Appearance → Workspace → Surface: Film / Paper / Halftone / Static, all driven by the existing intensity slider.
- Interface cluster in Appearance → Workspace — Tab style and Tab spacing pickers.
- Legacy tab with left-rail navigation for AnuPpuccin controls.
- Legacy → Callouts (7 controls): callout style, custom colours toggle, radius, title padding, title opacity, content padding, fold position.
- Legacy → Tables (9 controls): master toggle, custom width, centering, th-highlight, row/col highlight select, highlight opacity, th/td alignment, border width.
- Legacy → Codeblocks (5 controls): wrap modes for edit / preview / highlighted-preview, bg colour, text colour.
- Legacy → Show / Hide (4 controls): autohide titlebar, pointer cursor, hide metadata, hide tooltips.
- Legacy → Tabs (deep) (9 controls): custom tab height, new-tab-align, depth-tab text invert / opacity / gap, safari-tab radius / gap / border width / animation.

### Changed
- Tab navigation restyled: new 4-variant set (Switch / Amber / Underline / Ghost) with Switch-monochrome as the new default. Previous 14 dormant variants retired.
- Appearance tab consolidated from 5 top sections to 4 — Highlights & Tints merged into Workspace as an "Editor accents" cluster.
- TRIAL grain-style dropdown replaced with a real persistent picker backed by the new `grainStyle` setting.
- Settings header version badge now reads live from manifest (was hardcoded to v0.7.4).

### Removed
- Ten dormant tab-style CSS blocks from styles.css (pill-*, seg-*, line-*, underline-thick variants that had no picker surface).

### Migration notes
- `tabBarStyle` values outside the new set `{switch, switch-amber, underline, ghost}` auto-migrate to `switch` on first load.
- `grainStyle` absent from saved data defaults to `'film'` — the behaviour users had at v0.7.6.
- No destructive migrations. `git tag v0.7.6-pre-legacy` remains as a rollback anchor.
```

- [ ] **Step 6: Final version parity check**

```bash
grep -n "\"version\"" manifest.json package.json
grep -n "^## \[" CHANGELOG.md | head -3
```

Expected: both manifest.json and package.json show `"version": "0.7.7"`; CHANGELOG's top entry reads `## [0.7.7]`. Any drift → fix before committing.

- [ ] **Step 7: Commit the bump**

```bash
git add manifest.json package.json CHANGELOG.md src/settings-tab.ts
git commit -m "$(cat <<'EOF'
chore: bump to v0.7.7 — Appearance finish + tab-nav + Legacy

Atomic version bump across all version-bearing files. CHANGELOG entry
covers every feature landed on feature/legacy-and-nav. Header badge
now reads manifest.version at runtime instead of a hardcoded string.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 8: Merge to main**

```bash
git checkout main
git merge --no-ff feature/legacy-and-nav -m "Merge branch 'feature/legacy-and-nav'

Appearance completion + tab-nav restyle + Legacy tab (ship-push 1)
spec: docs/superpowers/specs/2026-04-16-legacy-tab-and-nav-restyle-design.md
plan: docs/superpowers/plans/2026-04-16-legacy-tab-and-nav-restyle.md
rollback anchor: tag v0.7.6-pre-legacy"
```

`--no-ff` preserves the branch history so individual commits remain visible for `git revert` rollback.

- [ ] **Step 9: Verify merge + final build**

```bash
git log --oneline -12
npm run build
```

Expected: all 9 feature commits visible in log, followed by the merge commit. Build succeeds.

Final smoke-test in Obsidian — confirm the settings header reads `v0.7.7` and everything still works after the main-branch deploy.

- [ ] **Step 10: Tag the release**

```bash
git tag v0.7.7
```

Do NOT push yet — Tom's call on when to push (there's no remote configured per the pre-session memory).

---

## Out of scope (explicit non-goals — do not drift into these)

- **Flavour text area rework** — dropped during brainstorming, original header holds
- **Ship-push 2 Legacy content** (Headings + Lists & Tags + Workspace details, ~50 controls) — separate session/branch
- **Palette overrides** (25 Catppuccin colour swatches) — skipped
- **Integrations** (Kanban + MAKE.md + Minimal Cards, 16 controls) — skipped
- **Theme-side work** for the companion `obsidian-tegenlicht-theme` repo — that repo doesn't exist yet; any AnuPpuccin gap discovered during Legacy ports gets noted but not fixed
- **GitHub remote creation** — user-owned `gh repo create` step, not part of this branch
- **Liquid-glass-js revival** — parked, separate session
- **True sliding-knob animation on the tab bar** — dropped in favour of per-tab background fill (Pitr razor); future localised refactor if demand surfaces

---

## Rollback paths (for reference during execution)

| Scenario | Command |
|----------|---------|
| Bail on everything, return to v0.7.6 | `git reset --hard v0.7.6-pre-legacy` (while on main, after deleting the feature branch with `git branch -D feature/legacy-and-nav`) |
| Undo one workstream after merge | `git revert <commit-hash>` (every commit is atomic) |
| Branch-level abort before merge | `git checkout main && git branch -D feature/legacy-and-nav` |
| Full reset of test vault plugin | Delete `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Onnozelaer/.obsidian/plugins/tegenlicht-controls/data.json`, rebuild |
