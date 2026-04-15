# Properties-Boxed Session — Parked Notes

> **Date:** 2026-04-14
> **Branch:** `main`
> **Pending commit:** `styles.css` (+197 / -16 lines)
> **Toggle:** Settings → Editing → Properties → **Boxed Properties panel**
> **Body class:** `tc-fm-boxed`
> **Setting key:** `propertiesBoxed: boolean` (default `false`)

---

## What this session shipped

End-to-end wiring for a **Boxed Properties panel** treatment that wraps Obsidian's `.metadata-container` (the YAML/Properties block at the top of every note) in an accent-tinted card. Plugin owns the rendering — users no longer need the legacy `frontmatter-beauty.css` or `its-frontmatter.css` snippets enabled to get this look.

The toggle was already scaffolded in commit `0cdb566` (settings interface, default value, body-class flip in `applier.ts`, accordion section in `src/tabs/editing.ts`). This session built out the **CSS** that the body class drives.

### Files touched this session

| File | Status | Notes |
|---|---|---|
| `styles.css` | **dirty** | All 197 new lines under section comment `/* ============== Boxed Properties — owned by the plugin ============== */` (lines ~1410–1620) |
| `src/settings.ts` | committed in `0cdb566` | `propertiesBoxed: boolean` field |
| `src/applier.ts` | committed in `0cdb566` | `cls('tc-fm-boxed', s.propertiesBoxed)` + cleanup on unload |
| `src/tabs/editing.ts` | committed in `0cdb566` | Toggle in Properties accordion |
| `src/preview-sample.ts` | committed in `0cdb566` | Mini-Obsidian preview with real Lucide icons |

---

## CSS architecture (the part to remember)

The boxed treatment is divided into six numbered sections. All rules are gated by `body.tc-fm-boxed` so the toggle is purely opt-in.

### 1. Container box (lines ~1458–1486)
**Scope (final, after tightening):**
```css
body.tc-fm-boxed .tc-mini-obsidian .mini-fm,
body.tc-fm-boxed .markdown-source-view.is-live-preview .metadata-container,
body.tc-fm-boxed .markdown-reading-view .metadata-container { ... }
```
Three targets only:
- The in-settings mini-Obsidian preview (`.mini-fm`)
- **Live Preview** source view (the `.is-live-preview` modifier matters — raw Source mode should NOT get the box)
- Reading view

Banner-aware override bumps `margin-top` to 20px when `.view-content.has-banner` is an ancestor.

**Visual recipe:**
- 8% → 3% accent gradient, 135deg
- 1px solid border @ 22% accent
- 10px border-radius
- Subtle 0 1px 4px / 8% black shadow
- 6px top / 18px bottom margin (20px top under banners)

### 2. Property rows (lines ~1479–1496)
`.metadata-property` gets 2px vertical margin + 4px horizontal padding + 4px border-radius. Hover paints a 7% accent tint.

### 3. Pill chips (lines ~1502–1519)
`.multi-select-pill` reskinned to `accent 14% / secondary` background with 28% accent border, 100px radius (full pill). Hover bumps to 22% / 40%.

### 4. Date/Number values (lines ~1516–1521)
`[data-property-type="date" | "datetime" | "number"]` get monospace font + accent color + tabular-nums.

### 5. Empty value placeholder (lines ~1525–1529)
`:empty::after { content: "—" }` — em-dash in faint italic.

### 6. Properties heading + chevron (lines ~1539–1620) — **the saga**

This was the painful one. See "The chevron debugging odyssey" below.

**Final approach:** Pseudo-element strategy.
- Hide every possible existing chevron representation (direct svg, wrapped svg, `.collapse-indicator`, `.collapse-icon`, `.right-triangle`, `::before` pseudos)
- Stamp our own chevron via `::after` on `.metadata-properties-heading`
- Inline-SVG data URI, masked with `var(--color-accent)` so it inherits theme accent
- `position: absolute; right: 10px; top: 50%; transform: translateY(-50%) rotate(0deg)` — completely outside the flex flow
- Rotate `-90deg` when `.is-collapsed` (preserves translateY)
- Force `opacity: 1; visibility: visible` even for `:not(:hover)` to defeat hover-fade rules

---

## The chevron debugging odyssey

For posterity — the chevron took **five attempts** before it landed. Documenting why each failed so we don't repeat it.

| Attempt | Approach | Why it failed |
|---|---|---|
| 1 | `margin-left: auto` on `.collapse-indicator` | Heading wasn't `display: flex` in some Obsidian builds; auto margin had nothing to push against |
| 2 | Force heading to `display: flex` + `order: 99` on chevron | Title element soaked all the slack — chevron stayed glued to title even with order |
| 3 | Add `flex: 1` to `.metadata-properties-title` | Selector didn't exist as named on the user's Obsidian build |
| 4 | Cast wider net — `> div:has(> svg)`, `> svg`, etc. | Either the chevron was a snippet `::before` pseudo, OR my selectors didn't match Obsidian's actual class. Element selectors fundamentally couldn't reach it. |
| 5 | **Pseudo-element + absolute positioning** — hide everything, stamp `::after` | ✅ Works because it depends on **zero DOM details** — only on `.metadata-properties-heading` existing as a named element |

**The lesson:** When iterating chevron CSS in Obsidian, skip directly to the pseudo-element approach. Element selectors fight against version drift, theme overrides, snippet conflicts, and undocumented internal markup.

---

## The "tidy" pass (3 things, just done)

User's final request before parking: *"1 2 3 please just ensure it is tidy for the love of god"*

1. **Scoped the box selector** down from 6 selectors (which leaked into legacy `.frontmatter-container`, `.cm-editor` embedded code blocks, etc.) to 3 — Live Preview, Reading view, in-settings preview. Dropped `.cm-editor`, `.frontmatter-container`, `.metadata-properties-container`.
2. **Mirrored Reading view** — was relying on the broad `.metadata-container` selector; now explicit `.markdown-reading-view .metadata-container` so the box paints identically in both view modes.
3. **Banner-aware spacing** — when `.view-content.has-banner` is the ancestor, top margin bumps from 6px → 20px so the box clears the banner image cleanly.

Downstream selectors (chevron, rows, pills) intentionally stay only `body.tc-fm-boxed`-scoped because their classes (`.metadata-property`, `.multi-select-pill`, `.metadata-properties-heading`) effectively only exist inside `.metadata-container`. Adding redundant scoping would bloat selectors with no behavior change.

---

## How to verify after a fresh Obsidian load

1. Open Obsidian Settings → Tegenlicht Controls → **Editing** tab
2. Expand the **Properties** accordion
3. Toggle **Boxed Properties panel** ON
4. Open any note that has YAML frontmatter
5. **Check Live Preview:**
   - [ ] Properties block has rounded accent-tinted card
   - [ ] Chevron sits flush right, vertically centered, accent colored
   - [ ] Click chevron → panel collapses, chevron rotates -90°
   - [ ] Tags render as pill chips with accent border
   - [ ] Hover row → subtle accent tint
6. **Switch to Reading view** — same look, no glitches
7. **Open a note with the Banners plugin showing a banner image** — box has extra top breathing room
8. **Toggle off** — page returns to native Obsidian rendering, no orphan styles, no stuck classes

---

## Outstanding / follow-up

### Untracked files in repo (decide before commit)
- `.claude/` — Claude Code session cache; **add to .gitignore**
- `iteration-shelf.json` — iteration-shelf skill manifest; keep or gitignore depending on whether iterations are version-controlled
- `iterations/` — folder of HTML iteration files; same call as above
- `preview.html` — likely a preview generation; check before committing

### Known limitations
- Boxed treatment doesn't gate on Obsidian version — assumes modern (1.4+) Properties API. Older Obsidian using `.frontmatter-container` is no longer covered after the scoping pass. **Trade-off accepted** — the manifest's `minAppVersion: "1.6.0"` justifies this.
- Pretty-properties plugin compatibility (mentioned earlier in project memory) is not yet specifically tested. The boxed treatment may stack with pretty-properties' own styling. Future settings panel work could detect pretty-properties and offer a "delegate to pretty-properties" mode.
- The chevron rotation transition (0.18s) may briefly desync from Obsidian's native panel collapse animation if Obsidian uses a different timing function. Visually fine, but worth noting if anyone goes pixel-hunting.

### Future polish ideas (not in scope)
- Per-property-type icon recoloring (currently keys all use muted text color — could accent the icon)
- Custom property-key labels/aliases via settings (e.g. show "Created" instead of `created`)
- "Compact mode" toggle — single-line property rows instead of two-line
- Animation on toggle ON/OFF (fade in the box treatment instead of snap)

---

## Build commands

```bash
# Dev (watch mode)
cd "/Users/tomlinson/Library/Mobile Documents/com~apple~CloudDocs/Projects/VIBE CODING/obsidian-tegenlicht-controls"
node esbuild.config.mjs

# Production (typecheck + minify + deploy to vault)
node esbuild.config.mjs production
```

Production build auto-deploys to the Onnozelaer vault's plugin folder:
`~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Onnozelaer/.obsidian/plugins/tegenlicht-controls`

Reload Obsidian (Cmd+R) after build to pick up CSS changes — hot reload is unreliable for `styles.css`.

---

## Commit shape (when ready)

Suggested message:

```
feat: own Properties-panel boxing end-to-end (no snippets needed)

Wires the `tc-fm-boxed` body class (toggle: Editing → Properties → Boxed
Properties panel) to a complete CSS treatment that replaces what the
frontmatter-beauty / its-frontmatter snippets used to provide.

Container: accent gradient + 1px hairline border + 10px radius + subtle
shadow. Scoped tightly to Live Preview source view, Reading view, and the
in-settings mini-Obsidian preview — won't leak into embedded code blocks
or legacy frontmatter containers. Top margin auto-bumps under
`.view-content.has-banner` so the box clears banner images.

Property rows: 2px row gap, hover tint, accent monospace for date/number
values, em-dash placeholder for empty values.

Pill chips: full-radius accent-tinted background with hover bump for the
multi-select tag pills.

Heading + chevron: pseudo-element strategy. Hide every possible existing
chevron representation (svg, .collapse-indicator/.collapse-icon, snippet
::before pseudos), stamp our own chevron via ::after with an inline-SVG
data URI masked by var(--color-accent). Pinned absolute right + 50% top +
translateY(-50%) for true vertical centering. Rotates -90deg when
collapsed. Always visible (defeats hover-fade rules).
```
