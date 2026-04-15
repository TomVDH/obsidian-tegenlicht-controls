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

export function apply(s: TegenlichtSettings): void {
  const el = getOrCreateStyleEl();

  // Resolve 'auto' accent from the currently active flavour's entry
  const isDarkMode = document.body.classList.contains('theme-dark');
  const activeFlavourCls = isDarkMode ? s.darkFlavour : s.lightFlavour;
  const activeFlavour = ALL_FLAVOURS.find(f => f.cls === activeFlavourCls);
  const resolvedAccent = s.accentColour === 'auto'
    ? (activeFlavour?.accent ?? '#e5b32a')
    : s.accentColour;
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

  // Icon stroke weight
  ALL_ICON_STROKE_CLASSES.forEach(c => document.body.classList.remove(c));
  document.body.classList.add(`tc-icon-stroke-${s.iconStroke || 'regular'}`);

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

  // Background effect + native translucency toggle were DISABLED —
  // neither approach produced reliable results (see appearance.ts
  // removal note). We still clear any stale bg-effect class that might
  // be on body from an earlier plugin version, so the workspace ends
  // up in the clean default state regardless of stored settings.
  ALL_BG_EFFECT_CLASSES.forEach(c => document.body.classList.remove(c));

  // Film-grain noise — toggle a single body class. The grain itself is a
  // CSS pseudo-element on .workspace so it never bleeds into modals, the
  // settings dialog, or any floating overlay. Opacity is driven by the
  // --tc-noise-opacity custom prop written in the main CSS block above.
  document.body.classList.toggle('tc-has-noise', (s.noiseAmount ?? 0) > 0);
  // Clean up any stray overlay from earlier builds that appended to body
  document.getElementById('tc-noise-overlay')?.remove();

  // No-ops: metadataMods, itsCallouts, kanban, calendar, cardsMinimal
  // These settings have no body class equivalent in the theme.
  // They're stored in settings for UI completeness / future expansion.
}

export function remove(): void {
  removeFonts();
  document.getElementById(STYLE_ID)?.remove();
  document.documentElement.style.removeProperty('--color-accent');
  document.documentElement.style.removeProperty('--color-accent-hsl');
  document.documentElement.style.removeProperty('--ctp-accent');
  document.documentElement.style.removeProperty('--interactive-accent');
  document.body.classList.remove('tegenlicht-accent-toggle');
  ['base','mantle','crust','surface0','surface1','surface2',
   'overlay0','overlay1','overlay2','text','subtext0','subtext1']
    .forEach(k => document.documentElement.style.removeProperty(`--ctp-custom-${k}`));
  ALL_FLAVOUR_CLASSES.forEach(c => document.body.classList.remove(c));
  document.body.classList.remove(EXT_DARK, EXT_LIGHT);
  ALL_TAB_CLASSES.forEach(c => document.body.classList.remove(c));
  ALL_DENSITY_CLASSES.forEach(c => document.body.classList.remove(c));
  ALL_SIDEBAR_CLASSES.forEach(c => document.body.classList.remove(c));
  ALL_BG_CLASSES.forEach(c => document.body.classList.remove(c));
  ALL_BG_EFFECT_CLASSES.forEach(c => document.body.classList.remove(c));
  ALL_ICON_STROKE_CLASSES.forEach(c => document.body.classList.remove(c));
  ALL_RADIUS_CLASSES.forEach(c => document.body.classList.remove(c));
  ALL_BORDER_CLASSES.forEach(c => document.body.classList.remove(c));
  ALL_MOOD_CLASSES.forEach(c => document.body.classList.remove(c));
  document.body.classList.remove('tc-has-noise');
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
  ].forEach(c => document.body.classList.remove(c));
}
