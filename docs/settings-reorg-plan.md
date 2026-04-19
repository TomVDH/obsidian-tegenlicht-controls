# Settings reorganisation — implementation plan

**Branch:** `feature/settings-reorg`
**Base:** `main` @ `b0aeebe` (v0.8.0 + live accent + interface rail + continuous counters)
**Goal:** Move every setting to a single, semantically obvious home. Retire grab-bag tabs (Features, Layout, Editing-as-catch-all). Introduce Reading + Editor + Workspace-reshaped + Elements. Version bump to 0.9.0 at merge.

## Principles

- **Semantic belonging beats UX familiarity** — settings move regardless of where a user last saw them. Counter prefixes change; that's acceptable.
- **Settings keys do not change** — only UI arrangement. No data migration needed.
- **Applier untouched** — plugin/theme boundary stays exactly where it is. Only tab builders are reshuffled.
- **Atomic commits** — one step per commit, all revertible, no squash mid-branch.
- **Counter prefixes update** as tabs are added/removed. `src/tabs/` builders move; settings-tab.ts switch statement follows. CSS per-tab rules in `styles.css` update to match.

## Target tab layout (after merge)

| Letter | Tab | Sub-sections (rail or accordions) |
|---|---|---|
| A | **Appearance** | Theme · Outliner-styled (files) · Graph · Canvas/Frame · Interface (chrome) |
| B | **Reading** | Typography · Callouts · Tables · Codeblocks · Embeds & PDF |
| C | **Editor** | Accents · Titles · Properties · Lists |
| D | **Workspace** | File tree · Rainbow folders · Pane layout · Stacked tabs |
| E | **Elements** | Cards · Tags · Backdrop fixes · Show/Hide · Plugin support |
| F | **Legacy** | Unplaced AnuPpuccin ports (shrinks over time) |
| L | **Lab** | (unchanged) |

Note: Graph currently lives in Appearance; in target it stays there. Rainbow + File tree currently live under Appearance → Outliner; in target they move to Workspace. See step 4.

## Steps

### Step 0 — Plan document (this file) ✅
Establishes the canonical reference. Merge-free.

### Step 1 — Scaffold new tabs (empty)
**Files:** create `src/tabs/reading.ts`, `editor.ts`, `workspace.ts`, `elements.ts` each with a `build()` stub that renders "Coming soon" + a rail shell (if applicable).
**Settings-tab.ts:** register the four new tabs. Tab order: `appearance | reading | editor | workspace | elements | typography | editing | layout | features | legacy | lab` — old tabs coexist with new ones during the migration so each step's commit leaves the UI functional.
**CSS:** add `.tc-content-reading`, `.tc-content-editor`, `.tc-content-workspace`, `.tc-content-elements` counter-prefix rules (B/C/D/E). Re-letter old tabs to avoid prefix collisions — tracked in this plan.
**Verify:** build, open plugin, every tab clicks; new tabs render "Coming soon".

### Step 2 — Retire Features tab
Every Features section maps to a semantic home:
- **Workspace group** (fileIcons, collapseFolderIcons, colorfulFrame, customVaultTitle, fileLabelAlign) → all already exist in Appearance. Delete duplicates.
- **Elements group** (cardsMinimal, cardShadows, cardLayoutActions, cardLayoutFilebrowser, rainbowTags, metadataButton, metadataMods, speechBubbles, printStyling, pdfBlendLight/Dark, canvasDarkBg, bgFix, hideBorders, colorfulFrameInvertLight/Dark) → new Elements tab.
- **Editor group** (inlineTitle, activeLineHighlight, codeblockLineNumbers, floatingTitle, tabStyle) → all duplicates of Appearance/Editing. Delete.
- **Show/Hide group** (showRibbon, showScrollbars, showStatusBar, showVaultName, statusBarStyle) → new Elements tab.
- **Plugin support** (itsCallouts, Kanban, Calendar) → Elements tab (Plugin support section).

Delete `src/tabs/features.ts`. Remove registration from settings-tab.ts + quick-panel.ts. Recount letter prefixes.
**Verify:** Features tab gone; every control that was unique to Features now appears under Elements; duplicates are single-origin.

### Step 3 — Retire Layout tab
Every slider in Layout moves to Workspace → Pane layout section:
- Reading view (fileLineWidth, fileMargins, previewWidthPct, embedMaxHeight) → Workspace → Pane layout. Exception: `embedMaxHeight` moves to Reading → Embeds & PDF (it's a reader concern).
- Cards & Borders (cardRadius, borderRadius, borderPadding, colorfulFrameOpacity, cardLayoutPadding, cardHeaderLeftPadding, stackedHeaderWidth, tabStackedPaneWidth) → Workspace → Pane layout.
- Tables (tableWidthPct) → Reading → Tables section.

Delete `src/tabs/layout.ts`. Remove registration.
**Verify:** Layout tab gone; all sliders reachable under their new semantic homes.

### Step 4 — Appearance reshape
Currently Appearance rails: Theme / Outliner / Graph / Workspace / Interface. After this step:
- Theme → unchanged
- Outliner → **removed** (File tree + Rainbow folders move to new Workspace tab)
- Graph → **removed** (moves to new Workspace tab → Graph section)
- Workspace rail → renamed **Canvas & Frame**; keeps Canvas, Sidebar, Surface, Accent application. Editor accents (active line/selection/caret) **move out** to new Editor tab.
- Interface → unchanged

**Verify:** Appearance contains only chrome-level surfaces (Theme, Canvas/Frame, Interface). File tree/Graph/Editor accents have moved out.

### Step 5 — Populate Workspace tab
Rail sections:
- File tree (from Appearance → Outliner → File tree)
- Rainbow folders (from Appearance → Outliner → Rainbow folders, including Advanced disclosure)
- Graph (from Appearance → Graph — Colour + Style)
- Pane layout (from retired Layout)
- Stacked tabs (stackedHeaderWidth + tabStackedPaneWidth broken out of Cards & Borders)
**Verify:** Workspace tab mirrors the old content, now in a unified home.

### Step 6 — Populate Editor tab
Rail sections:
- Accents (from Appearance → Workspace → Editor accents: activeLine, selectionTint, caret)
- Titles (inlineTitle, floatingTitle — from Editing)
- Properties (propertiesBoxed, tagStyle, tagBorderWidth, tagRadius, metadataButton, metadataMods, hideMetadata — from Editing + Features + Legacy)
- Lists (listToggle, orderedListStyle, customPreviewMargins, listMarkerColour, customCheckboxes — from Editing + Features)
- Tabs (pane) (tabStyle from Editing + Legacy → Tabs deep set)

Delete `src/tabs/editing.ts`. Remove registration.
**Verify:** Editor tab has all editor-surface and input-chrome controls. Editing tab gone.

### Step 7 — Populate Reading tab
Rail sections:
- Typography (reuse current typography builder as a section — or embed whole typography sub-rails as nested)
- Callouts (from Legacy → Callouts + itsCallouts from Features)
- Tables (from Legacy → Tables + tableWidthPct from Layout)
- Codeblocks (codeblockLineNumbers + Legacy → Codeblocks, latexColour)
- Embeds & PDF (embedMaxHeight + pdfBlendLight/Dark + printStyling)

Typography tab either retired (absorbed into Reading) or kept as its own tab with rails shared. Preference: keep Typography as a deep-linkable standalone because its rail is busy, and add a "Typography settings →" pointer in Reading → Typography that jumps to it. Alternative: absorb fully into Reading. Decide at step-entry.
**Verify:** Reading tab ready; Legacy's Callouts/Tables/Codeblocks now empty-or-stub.

### Step 8 — Populate Elements tab
Rail (or flat — 5 groups is small enough that a flat set of accordions works better here):
- Cards (cardsMinimal, cardShadows, cardLayoutActions, cardLayoutFilebrowser)
- Tags (rainbowTags)
- Backdrop fixes (canvasDarkBg, bgFix, hideBorders)
- Show / Hide (showRibbon, showScrollbars, showStatusBar, showVaultName, statusBarStyle, hideTitlebarAuto, uiPointerCursor, hideTooltips)
- Plugin support (itsCallouts, Kanban, Calendar)

Flat accordion layout keeps dev cost low; rail adds complexity that isn't warranted here.
**Verify:** Elements tab has all listed controls.

### Step 9 — Legacy audit
What remains in Legacy after steps 2, 3, 7 is moved? Expect:
- Accents (lightAccentColour, colorfulFrameColour) → keep in Legacy until Appearance's Palette has room for them
- Speech bubbles (already in Features → Elements)
- Any orphans discovered during the walk

Rename `src/tabs/legacy.ts` rail title if needed. Keep Legacy tab; it's the staging area. Should have < 5 rail sections after the move.
**Verify:** Legacy reads as "things without a home yet", not a port archive.

### Step 10 — Counter letter re-assignment
Final letters (after deletions + additions):
- A Appearance · B Reading · C Editor · D Workspace · E Elements · F Typography · G Legacy · L Lab

Update CSS per-tab selectors. Ensure continuous counter works per tab; verify.

### Step 11 — Version bump + CHANGELOG
- `manifest.json` + `package.json`: 0.8.0 → 0.9.0
- `CHANGELOG.md`: v0.9.0 "Reorganised" entry with the migration summary
- Update README if it references tab names

### Step 12 — Merge to main
Squash-merge or preserve history (ask Tom at step-entry). Tag `v0.9.0`. Push.

## Follow-ups (not in this branch)

- **Lightweight sweep** — separate branch. Audit bundle size (styles.css is 3800+ lines; main.js bundle size), remove dead CSS (retired tab variants, unused rail flourishes), tree-shake imports, memoise heavy renders. Settings data serialised to disk should stay ≤ 16 KB.
- **Typography tab fate** — keep or absorb into Reading. Decide when populating Reading (step 7).
- **AnuPpuccin YAML audit** — for every Legacy control promoted to a semantic home, re-verify class names against `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Onnozelaer/.obsidian/themes/AnuPpuccin/theme.css` @settings block. No applier changes needed unless a class name is wrong.
- **Deep-link support** — once tab structure stabilises, consider `?tab=reading&section=callouts` query-param driven default tab for sharing.

## Verification gate per step

Each step commit must:
1. Build clean (`npm run build` passes with 0 warnings).
2. Every tab opens without console errors.
3. No setting disappears — visually audit the A-1..?-N counter total across all tabs stays stable (or increases only for newly exposed controls).
4. Onnozelaer vault test — open a real note, confirm no visual regression on a live preview.
