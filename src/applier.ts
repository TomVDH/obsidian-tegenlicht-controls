import { TegenlichtSettings } from "./settings";
import { ALL_FLAVOURS, LEGACY_FLAVOUR_CLASSES } from "./flavours";
import { applyFonts, removeFonts } from "./fonts";

const STYLE_ID = "tegenlicht-controls-styles";

/**
 * Flip Obsidian's native "Translucent window" setting to the desired state.
 *
 * The background-effect pill (Solid/Frosted/Glass) calls this so users
 * don't have to walk into Appearance → Advanced → Translucent window
 * themselves: picking Frosted or Glass auto-enables it, picking Solid
 * turns it back off.
 *
 * We read the current state via `app.vault.getConfig('translucency')`
 * and only fire the toggle command when the states disagree — otherwise
 * every `apply()` call would flip the setting.
 *
 * All access to Obsidian internals is defensive: if `app.commands`,
 * `app.vault.getConfig`, or the command itself are missing (API change,
 * different Obsidian version), we log and move on without throwing.
 */
function setNativeTranslucency(desired: boolean): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const app = (window as any).app;
    if (!app?.vault?.getConfig) return;
    const current = !!app.vault.getConfig('translucency');
    if (current === desired) return;

    // Two-pronged: the command toggles AND updates Electron's window
    // vibrancy state; setConfig persists the flag to disk so the next
    // launch remembers. Running both guards against either path being
    // missing or out-of-sync across Obsidian versions. If neither works
    // we log — graceful degradation, no throw.
    let handled = false;
    if (app.commands?.executeCommandById) {
      try {
        handled = !!app.commands.executeCommandById('app:toggle-translucent-window');
      } catch {/* fall through to setConfig */}
    }
    if (!handled && app.vault.setConfig) {
      app.vault.setConfig('translucency', desired);
    }
  } catch (err) {
    console.warn('[tegenlicht-controls] could not toggle translucent window', err);
  }
}

const ALL_FLAVOUR_CLASSES = [
  ...ALL_FLAVOURS.map(f => f.cls),
  ...LEGACY_FLAVOUR_CLASSES,
];

const EXT_DARK  = 'anp-theme-ext-dark';
const EXT_LIGHT = 'anp-theme-ext-light';

const ALL_TAB_CLASSES = [
  'anp-default-tab', 'anp-depth-tab-toggle', 'anp-mini-tab-toggle',
  'anp-alternate-tab-toggle', 'anp-safari-tab-toggle',
];

// Plugin settings-tab active-indicator variants. Mutually exclusive
// — the picker in Appearance → Workspace → Interface chooses one.
const ALL_TAB_ACTIVE_CLASSES = [
  'tc-tabs-active-glow', 'tc-tabs-active-glow-b', 'tc-tabs-active-pill',
];

const ALL_BG_EFFECT_CLASSES   = [
  'tc-bg-effect-solid', 'tc-bg-effect-frosted', 'tc-bg-effect-glass',
  // Legacy classes from pre-0.6 naming — cleaned up at apply() so old
  // saved settings don't leave stale classes on body.
  'tc-bg-effect-opaque', 'tc-bg-effect-transparent',
];
const ALL_DENSITY_CLASSES     = ['tc-density-compact', 'tc-density-comfortable', 'tc-density-spacious'];
const ALL_SIDEBAR_CLASSES  = ['tc-sidebar-flat', 'tc-sidebar-bordered', 'tc-sidebar-cards'];
const ALL_BG_CLASSES       = ['tc-bg-solid', 'tc-bg-frosted', 'tc-bg-gradient'];
const ALL_ICON_STROKE_CLASSES = ['tc-icon-stroke-thin', 'tc-icon-stroke-regular', 'tc-icon-stroke-bold'];
const ALL_RADIUS_CLASSES      = ['tc-radius-sharp', 'tc-radius-subtle', 'tc-radius-rounded', 'tc-radius-pill'];
const ALL_BORDER_CLASSES      = ['tc-borders-none', 'tc-borders-whisper', 'tc-borders-subtle', 'tc-borders-ligne-claire'];
const ALL_MOOD_CLASSES        = ['tc-mood-minimal', 'tc-mood-warm', 'tc-mood-cool'];
const ALL_GRAPH_MODE_CLASSES  = [
  'tc-graph-colour-mode-mono',
  'tc-graph-colour-mode-accent',
  'tc-graph-colour-mode-folders',
];
const ALL_GRAIN_CLASSES = [
  'tc-grain-film', 'tc-grain-paper', 'tc-grain-halftone', 'tc-grain-static',
];

// Legacy — Callouts: the AnuPpuccin "Callouts" @settings dropdown picks ONE
// shape class on body (sleek / block / vanilla / vanilla-plus) with "default"
// meaning no class. Mutually exclusive, so we clear all before adding.
const ALL_CALLOUT_STYLE_CLASSES = [
  'anp-callout-sleek', 'anp-callout-block',
  'anp-callout-vanilla-normal', 'anp-callout-vanilla-plus',
];
// Legacy — Tables: the "Row/column highlight" dropdown is mutually exclusive.
// Theme gates each paint on a combined `.anp-table-toggle.anp-table-<mode>`
// selector, so these classes only take effect when the master table-styling
// toggle is also active — but we always clear them on mode switch.
const ALL_TABLE_HIGHLIGHT_CLASSES = [
  'anp-table-row-alt', 'anp-table-col-alt', 'anp-table-checkered', 'anp-table-full',
];

// Legacy — Codeblocks wrap: each mode (edit / preview / highlighted-preview)
// has its own mutually-exclusive no-wrap class. "wrap" is the default (no
// body class), "nowrap" adds the corresponding class. Tracked as arrays so
// the cleanup list stays consistent with the other ALL_*_CLASSES groups.
const ALL_CB_WRAP_EDIT_CLASSES     = ['anp-codeblock-edit-nowrap'];
const ALL_CB_WRAP_PREVIEW_CLASSES  = ['anp-codeblock-preview-nowrap'];
const ALL_CB_WRAP_HL_CLASSES       = ['anp-codeblock-preview-hl-nowrap'];

// AnuPuccin rainbow folders — three mutually-exclusive style classes
// (None / Full / Simple) plus an orthogonal "subfolder inherit" modifier.
// Names match AnuPuccin's Style Settings YAML at theme.css line 2122 so
// the theme's existing CSS picks them up cleanly; this plugin only
// toggles classes, never paints.
const RAINBOW_OFF     = 'anp-default-rainbow';
const RAINBOW_FULL    = 'anp-full-rainbow-color-toggle';
const RAINBOW_SIMPLE  = 'anp-simple-rainbow-color-toggle';
const RAINBOW_INHERIT = 'anp-rainbow-subfolder-color-toggle';
// Per-mode sub-toggle classes — driven by individual settings in the
// Outliner > Coloured folders UI. Theme CSS gates Simple's visuals
// behind compound selectors (e.g. `.anp-simple-rainbow-color-toggle.
// anp-simple-rainbow-title-toggle`), so the parent alone paints nothing
// — these sub-toggles are what actually switch features on.
const FULL_FILE_RECOLOR  = 'anp-rainbow-file-toggle';
const FULL_INVERT_LIGHT  = 'anp-full-rainbow-text-color-toggle-light';
const FULL_INVERT_DARK   = 'anp-full-rainbow-text-color-toggle-dark';
const SIMPLE_TITLE       = 'anp-simple-rainbow-title-toggle';
const SIMPLE_COLLAPSE    = 'anp-simple-rainbow-collapse-icon-toggle';
const SIMPLE_INDENT      = 'anp-simple-rainbow-indentation-toggle';
const SIMPLE_FILE_ICON   = 'anp-simple-rainbow-icon-toggle';
// Includes legacy class names (the four-mode era's invented `dot`/`icon`
// classes that never existed in the theme, plus the wrong inherit name)
// so users upgrading from 0.7.4 don't end up with stale dead classes
// stuck on body.
const ALL_RAINBOW_CLASSES = [
  RAINBOW_OFF, RAINBOW_FULL, RAINBOW_SIMPLE, RAINBOW_INHERIT,
  FULL_FILE_RECOLOR, FULL_INVERT_LIGHT, FULL_INVERT_DARK,
  SIMPLE_TITLE, SIMPLE_COLLAPSE, SIMPLE_INDENT, SIMPLE_FILE_ICON,
  'anp-dot-rainbow-color-toggle',
  'anp-icon-rainbow-color-toggle',
  'anp-inherit-rainbow-color-toggle',
];

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
}

function sanitizeHex(hex: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : '#e5b32a';
}

/** "#e5b32a" → [229, 179, 42] */
function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

/** Stringify RGB triplet as `"R, G, B"` — the theme consumes these via rgb()/rgba() */
function rgbToString(rgb: [number, number, number]): string {
  return `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`;
}

function hexToRgbTriplet(hex: string): string {
  return rgbToString(hexToRgb(hex));
}

/** Shift an RGB triplet by `delta` on each channel (clamped to [0, 255]) */
function shade(rgb: [number, number, number], delta: number): [number, number, number] {
  return rgb.map(v => Math.max(0, Math.min(255, v + delta))) as [number, number, number];
}

function getOrCreateStyleEl(): HTMLStyleElement {
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  return el;
}

function cls(c: string, active: boolean): void {
  document.body.classList.toggle(c, active);
}

/** The 14 Catppuccin colour names AnuPpuccin exposes for H1–H6 + bold
 *  + italic + highlight class-selects. Shared so the applier + the UI
 *  (Wave 3) pull from one list. Order matches the YAML. */
export const CATPPUCCIN_COLOURS = [
  "rosewater", "flamingo", "pink", "mauve", "red", "maroon", "peach",
  "yellow", "green", "teal", "sky", "sapphire", "blue", "lavender",
] as const;

/** For one of the class-select settings whose classes all share a prefix
 *  (e.g. `anp-h1-`, `anp-bold-`): clear every possible colour class,
 *  then add the single chosen one if non-empty. */
function applyColourClassSelect(prefix: string, chosen: string): void {
  CATPPUCCIN_COLOURS.forEach(name => {
    document.body.classList.remove(`${prefix}${name}`);
  });
  if (chosen) document.body.classList.add(`${prefix}${chosen}`);
}

export function apply(s: TegenlichtSettings): void {
  const el = getOrCreateStyleEl();

  // Resolve accent. Precedence:
  //   1. In light mode, if `lightAccentColour` is a hex (not 'auto'),
  //      use it — lets the user pick independent light / dark accents.
  //   2. Otherwise fall back to `accentColour`. If that's 'auto', use
  //      the active flavour's built-in accent.
  const isDarkMode = document.body.classList.contains('theme-dark');
  const activeFlavourCls = isDarkMode ? s.darkFlavour : s.lightFlavour;
  const activeFlavour = ALL_FLAVOURS.find(f => f.cls === activeFlavourCls);
  const lightOverrideActive = !isDarkMode && s.lightAccentColour && s.lightAccentColour !== 'auto';
  const resolvedAccent = lightOverrideActive
    ? s.lightAccentColour
    : (s.accentColour === 'auto'
        ? (activeFlavour?.accent ?? '#e5b32a')
        : s.accentColour);
  const accent        = sanitizeHex(resolvedAccent);
  const activeLineClr = sanitizeHex(s.activeLineColour ?? '#e5b32a');
  const selClr        = sanitizeHex(s.selectionTintColour ?? '#89b4fa');
  const caretClr      = sanitizeHex(s.caretColour ?? '#cba6f7');
  // Legacy single-choice interface font — kept for back-compat but the
  // pairing system below takes precedence when active.
  const fontVarLegacy = s.interfaceFont === 'inter'   ? '"Inter", sans-serif'
                      : s.interfaceFont === 'ia-duo'  ? '"iA Writer Duospace", monospace'
                      : 'inherit';
  // Google Fonts pairing — loads the <link> on demand, returns CSS stacks.
  const stacks = applyFonts(s);
  const fontVar      = stacks.interfaceStack || fontVarLegacy;
  const headingVar   = stacks.headingStack   || 'inherit';
  const monoVar      = stacks.monoStack      || 'inherit';

  // CSS vars + direct-CSS overrides
  el.textContent = `
/* Sizing + spacing vars — written at BOTH :root and body level because the
   theme (.theme-dark / .theme-light on body) sets its own --hN-size values
   at the body ancestor, which is nearer to elements than :root and would
   win the cascade lookup otherwise. Body-level !important guarantees our
   values reach the markdown renderer. */
:root, body {
  --h1-size: ${s.h1Size}em !important;
  --h2-size: ${s.h2Size}em !important;
  --h3-size: ${s.h3Size}em !important;
  --h4-size: ${s.h4Size}em !important;
  --h5-size: ${s.h5Size}em !important;
  --h6-size: ${s.h6Size}em !important;
  --list-indent: ${s.listIndent}em !important;
  --list-spacing: ${s.listSpacing}em !important;
  --file-line-width: ${s.fileLineWidth}px;
  --file-margins: ${s.fileMargins}px;
  --anp-preview-width-pct: ${s.previewWidthPct}%;
  --anp-card-radius: ${s.cardRadius}px;
  --anp-border-radius: ${s.borderRadius}px;
  --anp-border-padding: ${s.borderPadding}px;
  --anp-table-width-pct: ${s.tableWidthPct}%;
  --anp-rainbow-folder-bg-opacity: ${((s.rainbowFullBgOpacity ?? 70) / 100).toFixed(2)};
  --color-accent: ${accent};
  --color-accent-hsl: ${hexToHsl(accent)};
  --anp-inline-title-vis: ${s.inlineTitle ? 'block' : 'none'};
  --font-interface: ${fontVar};
  --tc-font-heading: ${headingVar};
  --tc-font-editor: ${headingVar !== 'inherit' ? headingVar : fontVar};
  ${monoVar !== 'inherit' ? `--font-monospace: ${monoVar};` : ''}
  ${headingVar !== 'inherit' ? `--font-text: ${headingVar};` : ''}
  --tc-frost-depth: ${s.frostDepth ?? 40}px;
  --tc-noise-opacity: ${((s.noiseAmount ?? 0) * 0.007).toFixed(4)};
  --tc-graph-node-scale: ${s.graphNodeScale ?? 1.0};
  --tc-graph-link-thickness: ${s.graphLinkThickness ?? 1.0};
  /* Wave 2 — tag pill shape + embed ceiling */
  --tag-border-width: ${s.tagBorderWidth ?? 0}px;
  --tag-radius: ${(s.tagRadius ?? 2).toFixed(2)}em;
  --embed-max-height: ${s.embedMaxHeight ?? 200}px;
  /* Wave 3 — heading margin scalar (only effective when the master
     heading-margin toggle is on; value still written so flipping the
     master picks up the chosen value immediately). */
  --anp-header-margin-value: ${s.headingMargin ?? 15}px;
  /* Wave 4 — per-heading weights + line-heights. Fonts handled below
     as conditional writes (only if non-empty). */
  --h1-weight: ${s.h1Weight ?? 700};
  --h2-weight: ${s.h2Weight ?? 600};
  --h3-weight: ${s.h3Weight ?? 600};
  --h4-weight: ${s.h4Weight ?? 600};
  --h5-weight: ${s.h5Weight ?? 600};
  --h6-weight: ${s.h6Weight ?? 600};
  --h1-line-height: ${s.h1LineHeight ?? 1.2};
  --h2-line-height: ${s.h2LineHeight ?? 1.2};
  --h3-line-height: ${s.h3LineHeight ?? 1.3};
  --h4-line-height: ${s.h4LineHeight ?? 1.3};
  --h5-line-height: ${s.h5LineHeight ?? 1.4};
  --h6-line-height: ${s.h6LineHeight ?? 1.5};
  /* Wave 4 — per-H font families (only written if user set one).
     Empty string means inherit from the theme / plugin font picker. */
  ${s.h1Font ? `--h1-font: ${s.h1Font};` : ''}
  ${s.h2Font ? `--h2-font: ${s.h2Font};` : ''}
  ${s.h3Font ? `--h3-font: ${s.h3Font};` : ''}
  ${s.h4Font ? `--h4-font: ${s.h4Font};` : ''}
  ${s.h5Font ? `--h5-font: ${s.h5Font};` : ''}
  ${s.h6Font ? `--h6-font: ${s.h6Font};` : ''}
  /* Wave 4 — global weight scalars (bold + 3 editor modes). */
  --bold-weight: ${s.boldWeight ?? 600};
  --anp-font-live-preview-wt: ${s.livePreviewWeight ?? 400};
  --anp-font-preview-wt: ${s.readingWeight ?? 400};
  --anp-font-editor-wt: ${s.sourceWeight ?? 400};
  /* Wave 5 — LaTeX text colour (empty = theme default). */
  ${s.latexColour ? `--anp-latex-color: ${s.latexColour};` : ''}
  /* Wave 6 — list marker colour (empty = theme default) + colorful
     frame opacity (only effective when colorful-frame toggle is on). */
  ${s.listMarkerColour ? `--list-marker-color: ${s.listMarkerColour};` : ''}
  --anp-colorful-frame-opacity: ${(s.colorfulFrameOpacity ?? 1).toFixed(2)};
  /* Legacy — Callouts */
  --callout-radius: ${s.calloutRadius ?? 8}px;
  --callout-title-padding: ${s.calloutTitlePaddingX ?? 12}px;
  --callout-title-opacity: ${((s.calloutTitleOpacity ?? 60) / 100).toFixed(2)};
  --callout-content-padding: ${s.calloutContentPadding ?? 16}px;
  --callout-fold-position: ${s.calloutFoldPosition === 'right' ? '1' : '0'};
  /* Legacy — Tables */
  --anp-table-highlight-opacity: ${((s.tableHighlightOpacity ?? 10) / 100).toFixed(2)};
  --anp-table-align-th: ${s.tableAlignTh || 'left'};
  --anp-table-align-td: ${s.tableAlignTd || 'left'};
  --anp-table-thickness: ${s.tableBorderWidth ?? 1}px;
  /* Legacy — Codeblock colour overrides (empty = no override so theme wins) */
  ${s.codeblockBgColor   ? `--anp-code-bg-color: ${s.codeblockBgColor};` : ''}
  ${s.codeblockTextColor ? `--anp-code-text-color: ${s.codeblockTextColor};` : ''}
  /* Legacy — Show/Hide */
  --anp-cursor: ${s.uiPointerCursor === 'pointer' ? 'pointer' : 'initial'};
  /* Legacy — Tabs (deep) */
  --anp-alt-tab-custom-height: ${s.tabCustomHeight ?? 32}px;
  --anp-depth-tab-opacity: ${((s.tabDepthOpacity ?? 100) / 100).toFixed(2)};
  --anp-depth-tab-gap: ${s.tabDepthGap ?? 4}px;
  --anp-safari-tab-radius: ${s.tabSafariRadius ?? 8}px;
  --anp-safari-tab-gap: ${s.tabSafariGap ?? 4}px;
  --anp-safari-border-width: ${s.tabSafariBorderWidth ?? 1}px;
}
${headingVar !== 'inherit' ? `
.markdown-rendered h1, .markdown-rendered h2, .markdown-rendered h3,
.markdown-rendered h4, .markdown-rendered h5, .markdown-rendered h6,
.cm-header, .inline-title { font-family: ${headingVar} !important; }
` : ''}
${s.showRibbon ? '' : '.workspace-ribbon { display: none !important; }'}
${s.showVaultName ? '' : '.nav-folder.mod-root > .nav-folder-title .nav-folder-title-content { display: none !important; }'}
${s.activeLineHighlight ? `.cm-active.cm-line { background: ${activeLineClr}18 !important; }` : ''}
${s.selectionTint ? `::selection { background: ${selClr}40; }` : ''}
${s.caretColourEnabled ? `.cm-cursor { border-left-color: ${caretClr} !important; }` : ''}
`;

  // Accent: the theme wires 25+ vars from rgb(var(--ctp-accent)) but ONLY when
  // `tegenlicht-accent-toggle` is on body. Enable it and set --ctp-accent as
  // an RGB triplet so the whole cascade picks up the custom accent.
  document.body.classList.add('tegenlicht-accent-toggle');
  document.documentElement.style.setProperty('--ctp-accent', hexToRgbTriplet(accent));
  document.documentElement.style.setProperty('--color-accent', accent);
  document.documentElement.style.setProperty('--color-accent-hsl', hexToHsl(accent));
  // --color-accent-rgb is the triplet form our own plugin CSS reads via
  // rgba(var(--color-accent-rgb), alpha). Without this write, every
  // rule falling back to the default `229, 179, 42` literal paints
  // amber regardless of the user's chosen accent — which broke the
  // tab pill outline for any non-amber flavour.
  document.documentElement.style.setProperty('--color-accent-rgb', hexToRgbTriplet(accent));
  // Propagate into --interactive-accent too — this is the var Obsidian's
  // native SliderComponent (and native toggles/buttons) reads to colour
  // the knob + fill. Without this, our typography sliders would render
  // with Obsidian's default purple thumb instead of the chosen flavour.
  document.documentElement.style.setProperty('--interactive-accent', accent);

  // Force the SWATCH colours onto the theme — whatever the upstream palette,
  // when you pick the "Generic" swatch you see blue, "Royal Velvet" gives you
  // purple, etc. Theme cascade: `var(--ctp-custom-X, var(--ctp-ext-X, ...))`
  // so these overrides win.
  const ds = document.documentElement.style;
  const CUSTOM_KEYS = [
    'base', 'mantle', 'crust',
    'surface0', 'surface1', 'surface2',
    'overlay0', 'overlay1', 'overlay2',
    'text', 'subtext0', 'subtext1',
  ];
  // Always clear before re-setting so a flavour change doesn't leak vars
  CUSTOM_KEYS.forEach(k => ds.removeProperty(`--ctp-custom-${k}`));

  if (activeFlavour) {
    const baseRgb    = hexToRgb(activeFlavour.base);
    const surfaceRgb = hexToRgb(activeFlavour.surface);
    const isLightBg  = (baseRgb[0] + baseRgb[1] + baseRgb[2]) / 3 >= 160;
    // Surface tints shift away from base toward the middle of the lightness
    // range — up for dark themes, down for light themes
    const shiftDir   = isLightBg ? -1 : +1;

    ds.setProperty('--ctp-custom-base',     rgbToString(baseRgb));
    ds.setProperty('--ctp-custom-mantle',   rgbToString(shade(baseRgb, -8)));
    ds.setProperty('--ctp-custom-crust',    rgbToString(shade(baseRgb, -16)));
    ds.setProperty('--ctp-custom-surface0', rgbToString(surfaceRgb));
    ds.setProperty('--ctp-custom-surface1', rgbToString(shade(surfaceRgb, 12 * shiftDir)));
    ds.setProperty('--ctp-custom-surface2', rgbToString(shade(surfaceRgb, 24 * shiftDir)));
  }

  // Flavour: remove all (including legacy), add current with ext-class if needed
  ALL_FLAVOUR_CLASSES.forEach(c => document.body.classList.remove(c));
  if (activeFlavourCls) document.body.classList.add(activeFlavourCls);

  // Extended flavours need a companion class for the theme's CSS selectors
  document.body.classList.remove(EXT_DARK, EXT_LIGHT);
  if (activeFlavour?.isExtended) {
    document.body.classList.add(isDarkMode ? EXT_DARK : EXT_LIGHT);
  }

  // Tab style: remove all, add current
  ALL_TAB_CLASSES.forEach(c => document.body.classList.remove(c));
  document.body.classList.add((s.tabStyle?.trim() || 'anp-default-tab'));

  // Plugin settings-tab active-indicator variant (glow | pill)
  ALL_TAB_ACTIVE_CLASSES.forEach(c => document.body.classList.remove(c));
  document.body.classList.add(`tc-tabs-active-${s.tabActiveStyle || 'glow-b'}`);

  // Rainbow folders — three modes mirroring AnuPuccin's Style Settings
  // dropdown (None / Full / Simple). Two layers of migration:
  //   1. Pre-0.7 boolean `rainbowFileBrowser` → 'full'.
  //   2. 0.7.4 enum values 'dot' and 'icon' (which never existed as
  //      classes in the theme — wrong assumption from the four-mode
  //      port) collapse to 'simple', the closest real mode.
  // Sub-toggles are applied conditionally per mode: theme CSS uses
  // compound selectors so each individual feature (file recolor, title
  // recolor, etc.) needs its own class on body to render.
  ALL_RAINBOW_CLASSES.forEach(c => document.body.classList.remove(c));
  let rainbowStyle = s.rainbowStyle || 'off';
  if (rainbowStyle === 'off' && s.rainbowFileBrowser) rainbowStyle = 'full';
  if (rainbowStyle === 'dot' || rainbowStyle === 'icon') rainbowStyle = 'simple';
  const rainbowCls = rainbowStyle === 'full'   ? RAINBOW_FULL
                   : rainbowStyle === 'simple' ? RAINBOW_SIMPLE
                   : RAINBOW_OFF;
  document.body.classList.add(rainbowCls);
  if (rainbowStyle === 'full') {
    if (s.rainbowFullFileRecolor) document.body.classList.add(FULL_FILE_RECOLOR);
    if (s.rainbowFullInvertLight) document.body.classList.add(FULL_INVERT_LIGHT);
    if (s.rainbowFullInvertDark)  document.body.classList.add(FULL_INVERT_DARK);
  }
  if (rainbowStyle === 'simple') {
    if (s.rainbowSimpleTitle)        document.body.classList.add(SIMPLE_TITLE);
    if (s.rainbowSimpleCollapseIcon) document.body.classList.add(SIMPLE_COLLAPSE);
    if (s.rainbowSimpleIndent)       document.body.classList.add(SIMPLE_INDENT);
    if (s.rainbowSimpleFileIcon)     document.body.classList.add(SIMPLE_FILE_ICON);
  }
  if (s.rainbowInherit) document.body.classList.add(RAINBOW_INHERIT);

  // Active line: remove all variants, add correct one
  document.body.classList.remove(
    'anp-no-highlight', 'anp-current-line',
    'anp-current-line-border', 'anp-current-line-border-only',
  );
  document.body.classList.add(s.activeLineHighlight ? 'anp-current-line' : 'anp-no-highlight');

  // Verified class-toggles
  cls('anp-file-icons',             s.fileIcons);
  cls('anp-collapse-folders',       s.collapseFolderIcons);
  cls('anp-colorful-frame',         s.colorfulFrame);
  cls('anp-custom-vault-toggle',    s.customVaultTitle);
  cls('anp-custom-checkboxes',      s.customCheckboxes);
  cls('rainbow-tags',               s.rainbowTags);
  cls('anp-button-metadata-toggle', s.metadataButton);
  cls('anp-codeblock-numbers',      s.codeblockLineNumbers);
  cls('anp-floating-header',        s.floatingTitle);
  cls('tc-fm-boxed',                s.propertiesBoxed);
  // Wave 2 — simple class-toggles from AnuPpuccin @settings.
  cls('anp-speech-bubble',          s.speechBubbles);
  cls('anp-list-toggle',            s.listToggle);
  cls('anp-print',                  s.printStyling);
  // Wave 5 — PDF blend toggles (per theme mode).
  cls('anp-pdf-blend-toggle-light', s.pdfBlendLight);
  cls('anp-pdf-blend-toggle-dark',  s.pdfBlendDark);
  // Wave 6 — workspace mop-up class-toggles.
  cls('anp-decoration-toggle',      s.decorationsEnabled);
  cls('anp-toggle-preview',         s.customPreviewMargins);
  cls('anp-canvas-dark-bg',         s.canvasDarkBg);
  cls('anp-bg-fix',                 s.bgFix);
  cls('anp-hide-borders',           s.hideBorders);
  cls('anp-card-shadows',           s.cardShadows);
  // Wave 3 — heading master toggles + per-H divider toggles.
  cls('anp-header-color-toggle',         s.headingColorsEnabled);
  cls('anp-header-margin-toggle',        s.headingMarginsEnabled);
  cls('anp-header-divider-color-toggle', s.headingDividerInherit);
  cls('anp-h1-divider', s.h1Divider);
  cls('anp-h2-divider', s.h2Divider);
  cls('anp-h3-divider', s.h3Divider);
  cls('anp-h4-divider', s.h4Divider);
  cls('anp-h5-divider', s.h5Divider);
  cls('anp-h6-divider', s.h6Divider);
  // Wave 3 — per-H colour class-select. One of 14 Catppuccin colour
  // classes or none (theme default). Clear all first, then add the
  // chosen one if set.
  applyColourClassSelect('anp-h1-', s.h1Color);
  applyColourClassSelect('anp-h2-', s.h2Color);
  applyColourClassSelect('anp-h3-', s.h3Color);
  applyColourClassSelect('anp-h4-', s.h4Color);
  applyColourClassSelect('anp-h5-', s.h5Color);
  applyColourClassSelect('anp-h6-', s.h6Color);
  applyColourClassSelect('anp-bold-',      s.boldColor);
  applyColourClassSelect('anp-italic-',    s.italicColor);
  applyColourClassSelect('anp-highlight-', s.highlightColor);

  // Inverted toggles (class present = hidden)
  cls('anp-toggle-scrollbars', !s.showScrollbars);
  cls('anp-hide-status-bar',   !s.showStatusBar);

  // UI density
  ALL_DENSITY_CLASSES.forEach(c => document.body.classList.remove(c));
  document.body.classList.add(`tc-density-${s.uiDensity || 'comfortable'}`);

  // Tag pill style — mutually exclusive body class (tc-tags-{style}).
  // Paints every .multi-select-pill globally so Properties tags, search
  // chips, and autocomplete pills all render in the same style.
  ['tc-tags-classic', 'tc-tags-ghost', 'tc-tags-solid'].forEach(c =>
    document.body.classList.remove(c),
  );
  document.body.classList.add(`tc-tags-${s.tagStyle || 'classic'}`);

  // Sidebar style
  ALL_SIDEBAR_CLASSES.forEach(c => document.body.classList.remove(c));
  document.body.classList.add(`tc-sidebar-${s.sidebarStyle || 'flat'}`);

  // Background style
  ALL_BG_CLASSES.forEach(c => document.body.classList.remove(c));
  document.body.classList.add(`tc-bg-${s.backgroundStyle || 'solid'}`);

  // Icon stroke weight (exposed as "Icon intensity" in the UI)
  ALL_ICON_STROKE_CLASSES.forEach(c => document.body.classList.remove(c));
  document.body.classList.add(`tc-icon-stroke-${s.iconStroke || 'regular'}`);

  // Icon + Border tint overrides — two primary states (semantics swapped
  // in 2026-04-16 session: auto is now an active subtle override, mono
  // is now "no plugin override, theme paints its native neutral"):
  //   ''       → 40% transparent accent (subtle plugin-owned tint)
  //   'mono'   → remove the CSS var so theme's own neutral paints
  // Back-compat fall-throughs (accepted but no UI exposes them):
  //   'accent' → explicit accent var reference (legacy, pre-swap)
  //   '#rrggbb'→ literal hex (legacy from the Pickr-era custom slot)
  // Any unknown value collapses to '' (= new auto = 40% accent).
  const applyTint = (value: string, cssVar: string) => {
    if (!value) {
      document.body.style.setProperty(cssVar, 'color-mix(in srgb, var(--color-accent) 40%, transparent)');
    } else if (value === 'mono') {
      document.body.style.removeProperty(cssVar);
    } else if (value === 'accent') {
      document.body.style.setProperty(cssVar, 'var(--color-accent)');
    } else if (/^#[0-9a-fA-F]{6}$/.test(value)) {
      document.body.style.setProperty(cssVar, value);
    } else {
      document.body.style.setProperty(cssVar, 'color-mix(in srgb, var(--color-accent) 40%, transparent)');
    }
  };
  applyTint(s.iconColour   || '', '--tc-icon-color');
  applyTint(s.borderColour || '', '--tc-border-color');

  // Corner radius — migrate legacy 'pill' saved value forward to 'rounded'
  ALL_RADIUS_CLASSES.forEach(c => document.body.classList.remove(c));
  const radius = s.cornerRadius === 'pill' ? 'rounded' : (s.cornerRadius || 'subtle');
  document.body.classList.add(`tc-radius-${radius}`);

  // Border intensity (drives --background-modifier-border for Obsidian UI)
  ALL_BORDER_CLASSES.forEach(c => document.body.classList.remove(c));
  document.body.classList.add(`tc-borders-${s.borderIntensity || 'subtle'}`);

  // Editor mood — experimental, class only (CSS intentionally minimal)
  ALL_MOOD_CLASSES.forEach(c => document.body.classList.remove(c));
  document.body.classList.add(`tc-mood-${s.editorMood || 'minimal'}`);

  // Graph — colour mode is mutually exclusive, halo is an orthogonal overlay.
  // Scale + thickness are applied as CSS vars that the graph-view container
  // reads to multiply Obsidian's native node/link sizing. No theme paint.
  ALL_GRAPH_MODE_CLASSES.forEach(c => document.body.classList.remove(c));
  document.body.classList.add(`tc-graph-colour-mode-${s.graphColourMode || 'accent'}`);
  cls('tc-graph-halo', !!s.graphHalo);

  // Background effect + native translucency toggle were DISABLED —
  // neither approach produced reliable results (see appearance.ts
  // removal note). We still clear any stale bg-effect class that might
  // be on body from an earlier plugin version, so the workspace ends
  // up in the clean default state regardless of stored settings.
  ALL_BG_EFFECT_CLASSES.forEach(c => document.body.classList.remove(c));

  // Film-grain noise — tc-has-noise gates the overlay presence; tc-grain-{style}
  // picks which texture pattern renders. Only applied when noise is active,
  // so a disabled grain leaves body with no tc-grain-* class at all.
  // The --tc-noise-opacity var still drives intensity for all four variants.
  const noiseOn = (s.noiseAmount ?? 0) > 0;
  document.body.classList.toggle('tc-has-noise', noiseOn);
  ALL_GRAIN_CLASSES.forEach(c => document.body.classList.remove(c));
  if (noiseOn) document.body.classList.add(`tc-grain-${s.grainStyle || 'film'}`);
  document.getElementById('tc-noise-overlay')?.remove();

  // Legacy — theme-owned controls (Callouts + Tables). Plugin flips body
  // classes and writes CSS vars (the :root, body block above); all paint
  // is done by AnuPpuccin's existing theme.css rules. No plugin CSS.

  // Legacy — Callouts
  ALL_CALLOUT_STYLE_CLASSES.forEach(c => document.body.classList.remove(c));
  if (s.calloutStyle && s.calloutStyle !== 'default') {
    document.body.classList.add(`anp-callout-${s.calloutStyle}`);
  }
  cls('anp-callout-color-toggle', !!s.calloutCustomColors);

  // Legacy — Tables
  cls('anp-table-toggle',        s.tableStyling);
  cls('anp-table-width',         s.tableCustomWidth);
  cls('anp-table-auto',          s.tableCentered);
  cls('anp-table-th-highlight',  s.tableThHighlight);
  ALL_TABLE_HIGHLIGHT_CLASSES.forEach(c => document.body.classList.remove(c));
  if (s.tableRowHighlight && s.tableRowHighlight !== 'none') {
    document.body.classList.add(`anp-table-${s.tableRowHighlight}`);
  }

  // Legacy — Codeblocks / Show-Hide / Tabs-deep

  // Legacy — Codeblocks (wrap modes + colour overrides)
  ALL_CB_WRAP_EDIT_CLASSES.forEach(c => document.body.classList.remove(c));
  if (s.codeblockWrapEdit === 'nowrap') document.body.classList.add('anp-codeblock-edit-nowrap');
  ALL_CB_WRAP_PREVIEW_CLASSES.forEach(c => document.body.classList.remove(c));
  if (s.codeblockWrapPreview === 'nowrap') document.body.classList.add('anp-codeblock-preview-nowrap');
  ALL_CB_WRAP_HL_CLASSES.forEach(c => document.body.classList.remove(c));
  if (s.codeblockWrapHlPreview === 'nowrap') document.body.classList.add('anp-codeblock-preview-hl-nowrap');

  // Legacy — Show / Hide
  cls('anp-autohide-titlebar', !!s.hideTitlebarAuto);
  cls('anp-toggle-metadata',   !!s.hideMetadata);
  cls('anp-tooltip-toggle',    !!s.hideTooltips);

  // Legacy — Tabs (deep)
  cls('anp-disable-newtab-align', !!s.tabDisableNewTabAlign);
  cls('anp-depth-tab-text-invert', !!s.tabDepthTextInvert);
  cls('anp-safari-tab-animated',  !!s.tabSafariAnimated);

  // No-ops: metadataMods, itsCallouts, kanban, calendar, cardsMinimal
  // These settings have no body class equivalent in the theme.
  // They're stored in settings for UI completeness / future expansion.
}

export function remove(): void {
  removeFonts();
  document.getElementById(STYLE_ID)?.remove();
  document.documentElement.style.removeProperty('--color-accent');
  document.documentElement.style.removeProperty('--color-accent-hsl');
  document.documentElement.style.removeProperty('--color-accent-rgb');
  document.documentElement.style.removeProperty('--ctp-accent');
  document.documentElement.style.removeProperty('--interactive-accent');
  document.body.classList.remove('tegenlicht-accent-toggle');
  ['base','mantle','crust','surface0','surface1','surface2',
   'overlay0','overlay1','overlay2','text','subtext0','subtext1']
    .forEach(k => document.documentElement.style.removeProperty(`--ctp-custom-${k}`));
  ALL_FLAVOUR_CLASSES.forEach(c => document.body.classList.remove(c));
  document.body.classList.remove(EXT_DARK, EXT_LIGHT);
  ALL_TAB_CLASSES.forEach(c => document.body.classList.remove(c));
  ALL_TAB_ACTIVE_CLASSES.forEach(c => document.body.classList.remove(c));
  ALL_DENSITY_CLASSES.forEach(c => document.body.classList.remove(c));
  ALL_SIDEBAR_CLASSES.forEach(c => document.body.classList.remove(c));
  ALL_BG_CLASSES.forEach(c => document.body.classList.remove(c));
  ALL_BG_EFFECT_CLASSES.forEach(c => document.body.classList.remove(c));
  ALL_ICON_STROKE_CLASSES.forEach(c => document.body.classList.remove(c));
  ALL_RADIUS_CLASSES.forEach(c => document.body.classList.remove(c));
  ALL_BORDER_CLASSES.forEach(c => document.body.classList.remove(c));
  ALL_MOOD_CLASSES.forEach(c => document.body.classList.remove(c));
  ALL_GRAPH_MODE_CLASSES.forEach(c => document.body.classList.remove(c));
  document.body.classList.remove('tc-graph-halo');
  document.body.classList.remove('tc-has-noise');
  ALL_GRAIN_CLASSES.forEach(c => document.body.classList.remove(c));
  document.getElementById('tc-noise-overlay')?.remove();
  ALL_RAINBOW_CLASSES.forEach(c => document.body.classList.remove(c));
  document.body.classList.remove(
    'anp-no-highlight', 'anp-current-line',
    'anp-current-line-border', 'anp-current-line-border-only',
  );
  ['anp-file-icons', 'anp-collapse-folders', 'anp-colorful-frame',
   'anp-custom-vault-toggle', 'anp-custom-checkboxes', 'rainbow-tags',
   'anp-button-metadata-toggle', 'anp-codeblock-numbers', 'anp-floating-header',
   'anp-toggle-scrollbars', 'anp-hide-status-bar', 'tc-fm-boxed',
   'tc-tags-classic', 'tc-tags-ghost', 'tc-tags-solid',
   // Wave 2 additions
   'anp-speech-bubble', 'anp-list-toggle', 'anp-print',
   // Wave 5 additions — PDF blend toggles
   'anp-pdf-blend-toggle-light', 'anp-pdf-blend-toggle-dark',
   // Wave 6 additions — workspace mop-up
   'anp-decoration-toggle', 'anp-toggle-preview',
   'anp-canvas-dark-bg', 'anp-bg-fix', 'anp-hide-borders',
   'anp-card-shadows',
   // Wave 3 master toggles + per-H divider classes
   'anp-header-color-toggle', 'anp-header-margin-toggle',
   'anp-header-divider-color-toggle',
   'anp-h1-divider', 'anp-h2-divider', 'anp-h3-divider',
   'anp-h4-divider', 'anp-h5-divider', 'anp-h6-divider',
  ].forEach(c => document.body.classList.remove(c));
  // Wave 3 — per-H + decoration colour class-selects (14 colours × 9
  // prefixes = 126 possible classes). Nuke all so nothing leaks.
  ['anp-h1-', 'anp-h2-', 'anp-h3-', 'anp-h4-', 'anp-h5-', 'anp-h6-',
   'anp-bold-', 'anp-italic-', 'anp-highlight-'].forEach(prefix => {
    CATPPUCCIN_COLOURS.forEach(name => {
      document.body.classList.remove(`${prefix}${name}`);
    });
  });
  // Legacy — Callouts + Tables cleanup
  ALL_CALLOUT_STYLE_CLASSES.forEach(c => document.body.classList.remove(c));
  document.body.classList.remove('anp-callout-color-toggle');
  ALL_TABLE_HIGHLIGHT_CLASSES.forEach(c => document.body.classList.remove(c));
  ['anp-table-toggle', 'anp-table-width', 'anp-table-auto', 'anp-table-th-highlight']
    .forEach(c => document.body.classList.remove(c));
  // Legacy — Codeblocks + Show/Hide + Tabs-deep cleanup
  [...ALL_CB_WRAP_EDIT_CLASSES, ...ALL_CB_WRAP_PREVIEW_CLASSES, ...ALL_CB_WRAP_HL_CLASSES,
   'anp-autohide-titlebar', 'anp-toggle-metadata', 'anp-tooltip-toggle',
   'anp-disable-newtab-align', 'anp-depth-tab-text-invert', 'anp-safari-tab-animated']
    .forEach(c => document.body.classList.remove(c));
}
