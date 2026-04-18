# Pretty Properties — interop reference

> Source: https://github.com/anareaty/pretty-properties
> Plugin id: `pretty-properties` · min Obsidian: `1.6.7` · author: Anareaty

Tegenlicht must co-exist with Pretty Properties cleanly, and where useful,
extend it rather than fight it. This file is the contract for how we touch
(or don't touch) the plugin's surface.

## What it does

Decorates the note's Properties block with side covers, banners, icons,
list-property pill colours, date colouring (past/present/future), and
number-based progress bars. Everything is driven from frontmatter keys
and `cssclasses`.

## Namespaces it owns

**CSS classes** — Tegenlicht must never redefine or override these.

- `.pp-*` — all utility and state classes (icons, covers, banners, pills,
  progress, hidden-property states, settings-tab internals)
- `body.pp-*` — root-level feature flags the plugin writes on `<body>`
- Color tokens: `.color-red`, `.color-orange`, `.color-yellow`, `.color-green`,
  `.color-cyan`, `.color-blue`, `.color-purple`, `.color-pink`,
  `.theme-color`, `.custom-color`, `.transparent-color`,
  `.theme-text-color`, `.custom-text-color`, `.none-text-color`

**CSS custom properties** — do not redeclare at `:root` or `body` level.

- `--pp-icon-*` (size, margin, background, color-light, color-dark, popover variants)
- `--pp-banner-icon-gap`, `--pp-banner-icon-gap-popover`
- `--pp-color-rgb`, `--pp-background-hsl`, `--pp-background-hover-hsl`,
  `--pp-text-hsl`, `--pp-text-rgb`, `--pp-text-color`
- `--pp-title-icon-size`

**Data attributes** — read-only for Tegenlicht; the plugin writes these.

- `[data-property-pill-value="<value>"]` — per-pill hook
- `[data-relative-date="past|present|future"]` — date state
- `[data-property-longtext-value]` — long-text marker

**Frontmatter keys** — reserved, do not shadow or rename.

- `cover` · `banner` · `icon` · `cssclasses`

**`cssclasses` shape values recognised** (covers): `vertical`, `horizontal`,
`square`, `circle`. Theme CSS targeting cover shape must go through these
classes, not invent new ones.

## Interop rules

1. **Additive only.** Tegenlicht's Properties styling (boxed pills,
   frontmatter block paint, etc.) must be additive on top of Pretty Properties,
   never a replacement. If the plugin is installed, its rules take priority on
   the metadata block.
2. **Respect the `.pp-*` / `--pp-*` namespace.** Do not restyle `.pp-*`
   classes. Do not redeclare `--pp-*` variables. If we need a similar knob,
   namespace ours as `--tl-*` and consume plugin output where possible.
3. **Assume plugin-absent and plugin-present are both valid.** Every
   Properties-related preview and live style must look correct in both states.
   Lab previews should ideally have a "Pretty Properties simulation" toggle
   that mirrors the plugin's class/attribute surface so we can design for both.
4. **Never own `cover` / `banner` / `icon` frontmatter.** If we want our own
   frontmatter-driven behaviour, pick distinct keys (e.g. `tl-*`).
5. **Extend through shared tokens, not override.** If Tegenlicht palette
   should influence Pretty Properties colouring, do it by setting the
   upstream Obsidian tokens it already reads (`--color-accent-1`,
   `--background-primary`, `--background-secondary`), never by writing into
   `--pp-*`.
6. **Check before shipping Properties work:** does the change still look
   right with Pretty Properties turned on? With it turned off? With a
   `cssclasses: [circle]` note? With `data-relative-date="past"`?

## Extension opportunities (parked)

- Theme-aware pill palette: map Tegenlicht accent tokens → the plugin's
  color keywords (`color-blue`, etc.) via Style Settings so user picks once.
- Shared banner/cover aspect ratios between Tegenlicht page-layout modes
  and Pretty Properties cover shapes.
- Teach Tegenlicht's Lab to render the Properties preview with and without
  the plugin's class surface so we never regress on either.

## Known friction

- Pretty Properties' colored-tags feature conflicts with the Iconic plugin
  (per its README). If Tegenlicht ever paints tags, check both.
- Integrates with TaskNotes for task-count properties — if we ever touch
  those, read Pretty Properties settings first.

## Pattern for future plugin-interop docs

One file per plugin under `docs/plugin-interop/`. Each doc states: what it
owns (classes, variables, frontmatter), what Tegenlicht must not touch,
and what the extension opportunities are. Keep it a contract, not a tutorial.
