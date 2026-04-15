# Tegenlicht Controls

A polished settings UI for the [Tegenlicht](https://github.com/TomVDH/obsidian-tegenlicht-theme) theme for Obsidian.

The theme owns the rendering. This plugin owns the **settings panel**: tab bar, accordions, swatch pickers, sliders, font pickers (with Google Fonts on demand), live mini-Obsidian typography preview, and a quick panel for one-click flavour switching.

> **Status:** v0.7.x — feature-complete for daily use, still pre-1.0. Settings, defaults, and class names may shift between minor versions; old saves are migrated automatically.

---

## What it gives you

- **Appearance tab** — Catppuccin + Low Countries flavour swatches (light/dark), accent picker (preset palette + custom hex), border intensity, density, icon stroke, corner radius, sidebar/outliner styling, workspace chrome, highlights & tints (active line, selection, caret).
- **Typography tab** — Google Fonts pairings (or system fallback), per-role overrides (interface / editor / source), live heading-size sliders with mini-Obsidian preview.
- **Layout tab** — line width, margins, preview width %, card / border radius, table width.
- **Editing tab** — reading-view affordances, source/coding settings, a **Boxed Properties panel** treatment that wraps Obsidian's frontmatter in an accent-tinted card (no snippet required), highlights.
- **Features tab** — toggles for workspace chrome, elements (custom checkboxes, rainbow tags, etc.), editor (inline title, line numbers, tab styles), show/hide widgets, plugin support (ITS callouts, Kanban, Calendar).
- **Quick panel** — ribbon command surfaces a compact swatch grid for instant flavour switching mid-session.

---

## Install

### Manual

1. Build: `npm install && npm run build`
2. Copy `main.js`, `manifest.json`, `styles.css` into your vault at:
   `<vault>/.obsidian/plugins/tegenlicht-controls/`
3. Reload Obsidian → enable **Tegenlicht Controls** under Community Plugins.

### Via BRAT (recommended for early adopters)

Add this repository in BRAT to auto-update.

---

## Project layout

```
src/
  main.ts            # plugin entry — load/save settings, register tab + quick panel
  settings.ts        # TegenlichtSettings interface + DEFAULT_SETTINGS
  settings-tab.ts    # PluginSettingTab shell — tab bar + tab dispatch
  applier.ts         # writes body classes + CSS vars from settings
  flavours.ts        # flavour catalogue (Catppuccin + Low Countries)
  fonts.ts           # Google Fonts pairings + on-demand <link> loader
  font-combobox.ts   # custom font picker UI
  preview-sample.ts  # mini-Obsidian preview (used by Typography + Editing tabs)
  quick-panel.ts     # ribbon-triggered flavour switcher
  tabs/
    appearance.ts
    typography.ts
    layout.ts
    editing.ts
    features.ts
styles.css           # all UI styles for the settings panel + body-class-driven theme overrides
```

---

## Companion theme

This plugin assumes [Tegenlicht](https://github.com/TomVDH/obsidian-tegenlicht-theme) is installed and active. The plugin flips body classes and writes CSS vars; the theme's CSS responds to them.

Without the theme: Catppuccin flavours, font pickers, and typography sliders still work because they target Obsidian's own variables. Theme-specific features (rainbow folders, callouts, tab styles) need the theme's CSS to render.

---

## Development

```bash
# install once
npm install

# watch mode (rebuilds on save)
npm run dev

# production build (typecheck + minify + auto-deploy to local vault)
npm run build
```

The build script in `esbuild.config.mjs` deploys to a configured local vault path on production builds. Adjust the deploy target in that file for your setup.

For standalone style iteration outside Obsidian, open `preview.html` in a browser — it renders a stub Obsidian-DOM environment for quick CSS hacking.

---

## License

MIT.
