export interface TegenlichtSettings {
  // UI chrome
  tabBarStyle: string;   // 'pill' | 'underline' | 'segment'
  tabBarSpacing: number; // px gap between tab buttons
  // Active-tab indicator paint. Drives body class
  // tc-tabs-active-{glow|glow-b|pill}.
  //   'glow'   — radial accent gradient, no tab borders.
  //   'glow-b' — same radial glow PLUS a persistent currentColor
  //              border ring on every tab; active tab swaps to an
  //              accent-coloured ring. Current default.
  //   'pill'   — solid 16% accent fill + 40% accent ring, fully
  //              rounded. Inactive tabs get the currentColor ring
  //              too (Pill B promoted).
  tabActiveStyle: string; // 'glow' | 'glow-b' | 'pill'
  // Accordion paint variant applied to every foldable accordion
  // rendered through `buildPrettyAccordion` (Typography panes,
  // Appearance clusters, etc.). One of the eight Lab-selected picks:
  //   Pretty · Gutter · Ghost · Two-tone · Halo · Folio · Bloc · Dashed
  accordionStyle: string; // 'pretty' | 'gutter' | 'ghost' | 'twotone' | 'halo' | 'filed' | 'bloc' | 'subdued'
  // One-shot migration flag. When false on load, and tabActiveStyle
  // is the prior default ('glow'), loadSettings promotes it to
  // 'glow-b' and flips this to true. After that the user's explicit
  // pick is respected (so they can flip back to 'glow' if they want).
  tabActiveStyleMigratedV1: boolean;



  // Appearance — Colour scheme
  darkFlavour: string;
  lightFlavour: string;
  accentColour: string;
  showExtendedDark: boolean;
  showExtendedLight: boolean;
  borderIntensity: string; // 'none' | 'whisper' | 'subtle' | 'ligne-claire'
  // Border tint. Same three-state semantic as iconColour:
  // '' = auto (theme default mono), 'accent' = track --color-accent,
  // '#rrggbb' = custom. Resets to '' on flavour switch.
  borderColour: string;

  // Appearance — Interface
  uiDensity: string;     // 'compact' | 'comfortable' | 'spacious'
  // Legacy single-choice interface font (pre-pairing). Kept as a fallback:
  // the applier reads it ONLY when fontPairing yields no usable stack.
  // No UI exposes it directly anymore; lives here for back-compat saves.
  interfaceFont: string; // 'system' | 'inter' | 'ia-duo'
  iconStroke: string;    // 'thin' | 'regular' | 'bold' — aka "Icon intensity"
  // Icon tint. Three states: '' = auto (theme default), 'accent' = track
  // the accent colour, any '#rrggbb' = custom. Resets to '' on flavour
  // switch — pick-a-theme, get-its-default.
  iconColour: string;
  cornerRadius: string;  // 'sharp' | 'subtle' | 'rounded'
  editorMood: string;    // experimental: 'minimal' | 'warm' | 'cool'

  // Appearance — Graph section
  // Visual tweaks that extend Obsidian's native graph view without
  // duplicating its native controls. Colour mode drives body classes
  // the theme reads; scale/thickness are plugin-owned CSS vars applied
  // via pseudo-selectors on the graph canvas container.
  graphColourMode: string;     // 'mono' | 'accent' | 'folders'
  graphHalo: boolean;          // subtle accent glow under hovered node
  graphNodeScale: number;      // 0.5–2.0, multiplier on Obsidian's native size
  graphLinkThickness: number;  // 0.5–3.0, multiplier on link stroke weight

  // Typography — Google Fonts
  fontPairing: string;       // one of the PAIRINGS keys, or 'custom'
  fontCustomInterface: string; // Google font name, used when pairing === 'custom'
  fontCustomHeading: string;
  fontCustomMono: string;

  // Typography — individual role overrides (take precedence over fontPairing)
  fontInterface: string;     // '' = system, or any Google Font family name
  fontEditor: string;        // '' = system, or any Google Font family name
  fontSource: string;        // '' = system, or any Google Font family name (mono)
  googleFontsEnabled: boolean; // whether to load fonts from fonts.google.com

  // Appearance — Workspace
  sidebarStyle: string;    // 'flat' | 'bordered' | 'cards'
  backgroundStyle: string; // 'solid' | 'frosted' | 'gradient'
  frostDepth: number;      // 0–100

  // Appearance — Background effects
  backgroundEffect: string; // 'solid' | 'frosted' | 'glass'
  noiseAmount: number;      // 0–100 (film-grain intensity)
  grainStyle: string;       // 'film' | 'paper' | 'halftone' | 'static'

  // Appearance — Highlights & Tints
  activeLineColour: string;
  selectionTint: boolean;
  selectionTintColour: string;
  caretColourEnabled: boolean;
  caretColour: string;

  // Typography
  h1Size: number;
  h2Size: number;
  h3Size: number;
  h4Size: number;
  h5Size: number;
  h6Size: number;
  listIndent: number;
  listSpacing: number;

  // Layout
  fileLineWidth: number;
  fileMargins: number;
  previewWidthPct: number;
  cardRadius: number;
  borderRadius: number;
  borderPadding: number;
  tableWidthPct: number;

  // Features
  // LEGACY — pre-0.7 boolean for rainbow folders. Replaced by `rainbowStyle`
  // (off / simple / full). Migration in applier.ts promotes a true here to
  // 'full' if rainbowStyle is 'off'. No UI exposes this anymore.
  rainbowFileBrowser: boolean;
  // Outliner — AnuPuccin-style coloured folders, mirrors the four modes
  // the theme exposes via Style Settings (off / full bg / pip / icon),
  // plus the orthogonal "inherit" modifier. Visual rendering lives in
  // the theme; this plugin only toggles the body classes that drive it.
  rainbowStyle: string;          // 'off' | 'full' | 'simple' (legacy 'dot'/'icon' migrate to 'simple')
  rainbowInherit: boolean;
  // Full-mode sub-toggles (mirror AnuPuccin Style Settings's `Full Folder
  // Settings` panel — only effective when rainbowStyle === 'full').
  rainbowFullFileRecolor: boolean;  // recolor files to match folders
  rainbowFullInvertLight: boolean;  // invert title text colour in light mode
  rainbowFullInvertDark: boolean;   // invert title text colour in dark mode
  rainbowFullBgOpacity: number;     // 0–100, written as 0–1 to CSS var
  // Simple-mode sub-toggles (mirror `Simple Folder Settings` — only
  // effective when rainbowStyle === 'simple'). Theme CSS uses compound
  // selectors, so flipping these on individually controls what paints.
  rainbowSimpleTitle: boolean;        // title text recolor
  rainbowSimpleCollapseIcon: boolean; // chevron / collapse arrow recolor
  rainbowSimpleIndent: boolean;       // tree indent guides recolor
  rainbowSimpleFileIcon: boolean;     // circular file dot icon
  fileIcons: boolean;
  collapseFolderIcons: boolean;
  colorfulFrame: boolean;
  customVaultTitle: boolean;
  customCheckboxes: boolean;
  cardsMinimal: boolean;
  rainbowTags: boolean;
  metadataButton: boolean;
  metadataMods: boolean;
  inlineTitle: boolean;
  activeLineHighlight: boolean;
  codeblockLineNumbers: boolean;
  floatingTitle: boolean;
  tabStyle: string;
  showRibbon: boolean;
  showScrollbars: boolean;
  showStatusBar: boolean;
  showVaultName: boolean;
  itsCallouts: boolean;
  kanban: boolean;
  calendar: boolean;

  // AnuPpuccin port Wave 2 — single-class toggles + scalar vars.
  // speechBubbles: task-list items become speech-bubble-styled blocks
  //   (anp-speech-bubble body class).
  // listToggle: anp-list-toggle body class; gates nested-bullet styling.
  // tagBorderWidth: --tag-border-width px (0–4).
  // tagRadius: --tag-radius em (0–2, step 0.1).
  // embedMaxHeight: --embed-max-height px (120–1200).
  // printStyling: anp-print body class; scopes print-only rendering.
  speechBubbles: boolean;
  listToggle: boolean;
  tagBorderWidth: number;
  tagRadius: number;
  embedMaxHeight: number;
  printStyling: boolean;

  // AnuPpuccin port Wave 3 — heading colours, dividers, decoration.
  // Master toggles gate everything below; without these on, the theme
  // paints headings in its default colour. When a master toggle is on,
  // the per-H colour / divider settings take effect.
  //   headingColorsEnabled → anp-header-color-toggle
  //   headingMarginsEnabled → anp-header-margin-toggle
  //   headingDividerInherit → anp-header-divider-color-toggle
  //   headingMargin → --anp-header-margin-value (0–30 px, step 2)
  // Per-H colour values are one of the 14 Catppuccin colour names
  // ('' = theme default), written to body as `anp-h{N}-{name}`.
  // h{N}Divider → anp-h{N}-divider body class.
  // Decoration settings mirror the heading colour pattern for bold,
  // italic, and highlighted runs.
  headingColorsEnabled: boolean;
  headingMarginsEnabled: boolean;
  headingDividerInherit: boolean;
  headingMargin: number;
  h1Color: string; h2Color: string; h3Color: string;
  h4Color: string; h5Color: string; h6Color: string;
  h1Divider: boolean; h2Divider: boolean; h3Divider: boolean;
  h4Divider: boolean; h5Divider: boolean; h6Divider: boolean;
  boldColor: string;
  italicColor: string;
  highlightColor: string;

  // AnuPpuccin port Wave 4 — micro-typography.
  // Per-heading font family / weight / line-height (6 × 3 = 18 vars).
  // Font string '' means inherit from the theme / editor font picker;
  // any other string is written to --h{N}-font verbatim.
  // Weight 100–900 (step 100) → --h{N}-weight.
  // Line-height 0.8–2.5 (step 0.05) → --h{N}-line-height.
  // Plus 4 global weight scalars:
  //   boldWeight → --bold-weight
  //   livePreviewWeight → --anp-font-live-preview-wt
  //   readingWeight → --anp-font-preview-wt
  //   sourceWeight → --anp-font-editor-wt
  h1Font: string; h2Font: string; h3Font: string;
  h4Font: string; h5Font: string; h6Font: string;
  h1Weight: number; h2Weight: number; h3Weight: number;
  h4Weight: number; h5Weight: number; h6Weight: number;
  h1LineHeight: number; h2LineHeight: number; h3LineHeight: number;
  h4LineHeight: number; h5LineHeight: number; h6LineHeight: number;
  boldWeight: number;
  livePreviewWeight: number;
  readingWeight: number;
  sourceWeight: number;

  // AnuPpuccin port Wave 5 — specialised single-setting ports.
  //   lightAccentColour: 'auto' (use accentColour in both modes) OR a
  //     hex string that overrides the accent when body is .theme-light.
  //     Mirrors the darkFlavour/lightFlavour pattern for palette pick.
  //   latexColour: '' (theme default) OR hex — written to --anp-latex-color
  //     when non-empty. Covers LaTeX block text colour.
  //   pdfBlendLight / pdfBlendDark: class-toggles that blend the PDF
  //     viewer background with the editor background per theme mode.
  lightAccentColour: string;
  latexColour: string;
  pdfBlendLight: boolean;
  pdfBlendDark: boolean;

  // Editing — Properties panel styling
  // Toggles an accent-gradient card wrapper around Obsidian's Properties
  // panel (.metadata-container). Same visual as the frontmatter-beauty.css
  // snippet in the vault: rounded corners, soft accent tint, subtle shadow.
  // Off by default so native Obsidian's flat rendering is preserved until
  // the user opts in.
  propertiesBoxed: boolean;

  // Editing — Tag pill style (applies globally to every .multi-select-pill
  // Obsidian renders: Properties, tag autocomplete, search chips, inline
  // body tags). Decoupled from propertiesBoxed so Tom can keep the box
  // treatment off while still restyling tags, or vice versa.
  tagStyle: string; // 'classic' | 'ghost' | 'solid'

  // Legacy — Callouts (AnuPpuccin @settings section: Callouts)
  calloutStyle: string;              // 'default' | 'sleek' | 'block' | 'vanilla-normal' | 'vanilla-plus'
  calloutCustomColors: boolean;
  calloutRadius: number;             // 0–24 px
  calloutTitlePaddingX: number;      // 0–32 px
  calloutTitleOpacity: number;       // 0–100 (written as 0–1 to CSS var)
  calloutContentPadding: number;     // 0–40 px
  calloutFoldPosition: string;       // 'left' | 'right'

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

  // Legacy — Codeblocks
  codeblockWrapEdit: string;       // 'wrap' | 'nowrap'
  codeblockWrapPreview: string;    // 'wrap' | 'nowrap'
  codeblockWrapHlPreview: string;  // 'wrap' | 'nowrap'
  codeblockBgColor: string;        // '' = reset, '#rrggbb' = override
  codeblockTextColor: string;

  // Legacy — Show / Hide (4 new; scrollbars + status bar already in Features)
  hideTitlebarAuto: boolean;
  uiPointerCursor: string;         // 'initial' | 'pointer'
  hideMetadata: boolean;
  hideTooltips: boolean;

  // Legacy — Tabs (deep) — per-style tuning for Depth + Safari variants
  tabCustomHeight: number;         // 20–48 px
  tabDisableNewTabAlign: boolean;
  tabDepthTextInvert: boolean;
  tabDepthOpacity: number;         // 0–100 → 0–1
  tabDepthGap: number;             // 0–16 px
  tabSafariRadius: number;         // 0–16 px
  tabSafariGap: number;            // 0–16 px
  tabSafariBorderWidth: number;    // 0–4 px
  tabSafariAnimated: boolean;
}

export const DEFAULT_SETTINGS: TegenlichtSettings = {
  tabBarStyle: 'text',
  tabBarSpacing: 6,
  tabActiveStyle: 'glow-b',
  tabActiveStyleMigratedV1: false,
  accordionStyle: 'pretty',

  darkFlavour: 'tc-maneblusser',
  lightFlavour: 'tc-mechelen',
  accentColour: 'auto',
  showExtendedDark: false,
  showExtendedLight: false,
  borderIntensity: 'subtle',
  borderColour: '',

  uiDensity: 'comfortable',
  interfaceFont: 'system',
  iconStroke: 'regular',
  iconColour: '',
  cornerRadius: 'subtle',
  editorMood: 'minimal',

  graphColourMode: 'accent',
  graphHalo: true,
  graphNodeScale: 1.0,
  graphLinkThickness: 1.0,

  fontPairing: 'system',
  fontCustomInterface: '',
  fontCustomHeading: '',
  fontCustomMono: '',

  // Defaults pick universally-installed OS fonts — Arial + Courier New
  // are on macOS, Windows and most Linux installs, so the plugin renders
  // the same fallback regardless of network / Google Fonts CDN reach.
  // Users can swap to Inter / JetBrains Mono via the combobox; those
  // load on demand from Google Fonts (if enabled).
  fontInterface: 'Arial',
  fontEditor: 'Arial',
  fontSource: 'Courier New',
  googleFontsEnabled: true,

  sidebarStyle: 'flat',
  backgroundStyle: 'solid',
  frostDepth: 0,

  backgroundEffect: 'solid',
  noiseAmount: 0,
  grainStyle: 'film',

  activeLineColour: '#e5b32a',
  selectionTint: false,
  selectionTintColour: '#89b4fa',
  caretColourEnabled: false,
  caretColour: '#cba6f7',

  h1Size: 2.0,
  h2Size: 1.6,
  h3Size: 1.3,
  h4Size: 1.1,
  h5Size: 1.0,
  h6Size: 0.9,
  listIndent: 2.0,
  listSpacing: 0.075,

  fileLineWidth: 700,
  fileMargins: 40,
  previewWidthPct: 88,
  cardRadius: 8,
  borderRadius: 6,
  borderPadding: 4,
  tableWidthPct: 100,

  rainbowFileBrowser: false,
  rainbowStyle: 'off',
  rainbowInherit: false,
  // Full mode defaults — match AnuPuccin's Style Settings defaults
  // (none of the optional toggles on; opacity 0.7 = 70).
  rainbowFullFileRecolor: false,
  rainbowFullInvertLight: false,
  rainbowFullInvertDark: false,
  rainbowFullBgOpacity: 70,
  // Simple mode defaults — mirror the typical Style Settings preset
  // (title + indent + circular file ON, collapse icon OFF). Picking
  // Simple in the dropdown immediately renders something visible.
  rainbowSimpleTitle: true,
  rainbowSimpleCollapseIcon: false,
  rainbowSimpleIndent: true,
  rainbowSimpleFileIcon: true,
  fileIcons: false,
  collapseFolderIcons: false,
  colorfulFrame: false,
  customVaultTitle: true,
  customCheckboxes: true,
  cardsMinimal: false,
  rainbowTags: true,
  metadataButton: false,
  metadataMods: true,
  inlineTitle: true,
  activeLineHighlight: false,
  codeblockLineNumbers: true,
  floatingTitle: false,
  tabStyle: '',
  showRibbon: true,
  showScrollbars: false,
  showStatusBar: true,
  showVaultName: true,
  itsCallouts: true,
  kanban: false,
  calendar: false,

  // Wave 2 defaults — match AnuPpuccin's own defaults so first-load
  // behaviour is identical to the theme's defaults.
  speechBubbles: false,
  listToggle: false,
  tagBorderWidth: 0,
  tagRadius: 2,
  embedMaxHeight: 200,
  printStyling: false,

  // Wave 3 defaults — all master toggles off = theme's own defaults
  // remain in force until user opts in. Per-H / decoration colours
  // default to '' (auto / theme default).
  headingColorsEnabled: false,
  headingMarginsEnabled: false,
  headingDividerInherit: false,
  headingMargin: 15,
  h1Color: '', h2Color: '', h3Color: '',
  h4Color: '', h5Color: '', h6Color: '',
  h1Divider: false, h2Divider: false, h3Divider: false,
  h4Divider: false, h5Divider: false, h6Divider: false,
  boldColor: '',
  italicColor: '',
  highlightColor: '',

  // Wave 4 defaults — font strings empty (theme / plugin font pick
  // still drives), weight/line-height match AnuPpuccin's own YAML
  // defaults so first load inherits the theme's baseline.
  h1Font: '', h2Font: '', h3Font: '',
  h4Font: '', h5Font: '', h6Font: '',
  h1Weight: 700, h2Weight: 600, h3Weight: 600,
  h4Weight: 600, h5Weight: 600, h6Weight: 600,
  h1LineHeight: 1.2, h2LineHeight: 1.2, h3LineHeight: 1.3,
  h4LineHeight: 1.3, h5LineHeight: 1.4, h6LineHeight: 1.5,
  boldWeight: 600,
  livePreviewWeight: 400,
  readingWeight: 400,
  sourceWeight: 400,

  // Wave 5 defaults — auto = mirror darkAccent in light mode too
  // (current behaviour); empty LaTeX colour = theme default paints;
  // PDF blends off.
  lightAccentColour: 'auto',
  latexColour: '',
  pdfBlendLight: false,
  pdfBlendDark: false,

  propertiesBoxed: false,

  tagStyle: 'classic',

  calloutStyle: 'default',
  calloutCustomColors: false,
  calloutRadius: 8,
  calloutTitlePaddingX: 12,
  calloutTitleOpacity: 60,
  calloutContentPadding: 16,
  calloutFoldPosition: 'left',

  tableStyling: false,
  tableCustomWidth: false,
  tableCentered: false,
  tableThHighlight: false,
  tableRowHighlight: 'none',
  tableHighlightOpacity: 10,
  tableAlignTh: 'left',
  tableAlignTd: 'left',
  tableBorderWidth: 1,

  codeblockWrapEdit: 'wrap',
  codeblockWrapPreview: 'wrap',
  codeblockWrapHlPreview: 'wrap',
  codeblockBgColor: '',
  codeblockTextColor: '',

  hideTitlebarAuto: false,
  uiPointerCursor: 'initial',
  hideMetadata: false,
  hideTooltips: false,

  tabCustomHeight: 32,
  tabDisableNewTabAlign: false,
  tabDepthTextInvert: false,
  tabDepthOpacity: 100,
  tabDepthGap: 4,
  tabSafariRadius: 8,
  tabSafariGap: 4,
  tabSafariBorderWidth: 1,
  tabSafariAnimated: false,
};
