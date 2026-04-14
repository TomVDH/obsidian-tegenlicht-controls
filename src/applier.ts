import { TegenlichtSettings } from "./settings";

const STYLE_ID = "tegenlicht-controls-styles";

const ALL_FLAVOUR_CLASSES = [
  // Dark base
  'ctp-mocha', 'ctp-mocha-old', 'ctp-macchiato', 'ctp-frappe', 'ctp-rose-pine',
  // Dark extended
  'ctp-amoled', 'ctp-atom', 'ctp-biscuit', 'ctp-coffee', 'ctp-dracula',
  'ctp-everforest', 'ctp-flexoki', 'ctp-generic', 'ctp-gruvbox', 'ctp-kanagawa',
  'ctp-material-mint', 'ctp-nord', 'ctp-nord-darker', 'ctp-notion', 'ctp-rosebox',
  'ctp-royal-velvet', 'ctp-solarized', 'ctp-thorns',
  // Light base
  'ctp-latte', 'ctp-rose-pine-dawn',
  // Light extended
  'ctp-atom-light', 'ctp-everforest-light', 'ctp-gruvbox-light', 'ctp-luminescence',
  'ctp-material-mint-light', 'ctp-nord-light', 'ctp-notion-light',
  'ctp-sandy-beaches', 'ctp-solarized-light',
];

const ALL_TAB_CLASSES = [
  'anp-default-tab', 'anp-depth-tab-toggle', 'anp-mini-tab-toggle',
  'anp-alternate-tab-toggle', 'anp-safari-tab-toggle',
];

const RAINBOW_OFF = 'anp-default-rainbow';
const RAINBOW_ON  = 'anp-full-rainbow-color-toggle';

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

  // CSS vars + direct-CSS overrides for settings with no body class
  el.textContent = `
:root {
  --h1-size: ${s.h1Size}em;
  --h2-size: ${s.h2Size}em;
  --h3-size: ${s.h3Size}em;
  --h4-size: ${s.h4Size}em;
  --h5-size: ${s.h5Size}em;
  --h6-size: ${s.h6Size}em;
  --list-indent: ${s.listIndent}em;
  --list-spacing: ${s.listSpacing}em;
  --file-line-width: ${s.fileLineWidth}px;
  --file-margins: ${s.fileMargins}px;
  --anp-preview-width-pct: ${s.previewWidthPct}%;
  --anp-card-radius: ${s.cardRadius}px;
  --anp-border-radius: ${s.borderRadius}px;
  --anp-border-padding: ${s.borderPadding}px;
  --anp-table-width-pct: ${s.tableWidthPct}%;
  --color-accent: ${s.accentColour};
  --color-accent-hsl: ${hexToHsl(s.accentColour)};
  --anp-inline-title-vis: ${s.inlineTitle ? 'block' : 'none'};
}
${s.showRibbon ? '' : '.workspace-ribbon { display: none !important; }'}
${s.showVaultName ? '' : '.nav-folder.mod-root > .nav-folder-title .nav-folder-title-content { display: none !important; }'}
`;

  // Flavour: remove all, add current (respect Obsidian theme-dark/theme-light)
  ALL_FLAVOUR_CLASSES.forEach(c => document.body.classList.remove(c));
  const flavour = document.body.classList.contains('theme-dark')
    ? s.darkFlavour
    : s.lightFlavour;
  if (flavour) document.body.classList.add(flavour);

  // Tab style: remove all, add current
  ALL_TAB_CLASSES.forEach(c => document.body.classList.remove(c));
  document.body.classList.add(s.tabStyle || 'anp-default-tab');

  // Rainbow folders: exactly one of the two classes active
  document.body.classList.remove(RAINBOW_ON, RAINBOW_OFF);
  document.body.classList.add(s.rainbowFileBrowser ? RAINBOW_ON : RAINBOW_OFF);

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

  // Inverted toggles (class present = hidden)
  cls('anp-toggle-scrollbars', !s.showScrollbars);
  cls('anp-hide-status-bar',   !s.showStatusBar);

  // No-ops: metadataMods, itsCallouts, kanban, calendar, cardsMinimal
  // These settings have no body class equivalent in the theme.
  // They're stored in settings for UI completeness / future expansion.
}

export function remove(): void {
  document.getElementById(STYLE_ID)?.remove();
}
