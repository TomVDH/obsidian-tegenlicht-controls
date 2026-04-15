export interface TegenlichtSettings {
  // UI chrome
  tabBarStyle: string;   // 'pill' | 'underline' | 'segment'
  tabBarSpacing: number; // px gap between tab buttons

  // Appearance — Colour scheme
  darkFlavour: string;
  lightFlavour: string;
  accentColour: string;
  showExtendedDark: boolean;
  showExtendedLight: boolean;
  borderIntensity: string; // 'none' | 'subtle' | 'ligne-claire'

  // Appearance — Interface
  uiDensity: string;     // 'compact' | 'comfortable' | 'spacious'
  interfaceFont: string; // 'system' | 'inter' | 'ia-duo' (legacy; replaced by fontPairing)
  iconStroke: string;    // 'thin' | 'regular' | 'bold'
  cornerRadius: string;  // 'sharp' | 'subtle' | 'rounded'
  editorMood: string;    // experimental: 'minimal' | 'warm' | 'cool'

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
  rainbowFileBrowser: boolean;
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

  // Demo — illustrates how a toggle can swap its own preview image
  demoImageToggle: boolean;
}

export const DEFAULT_SETTINGS: TegenlichtSettings = {
  tabBarStyle: 'pill-frost',
  tabBarSpacing: 6,

  darkFlavour: 'tc-maneblusser',
  lightFlavour: 'tc-mechelen',
  accentColour: 'auto',
  showExtendedDark: false,
  showExtendedLight: false,
  borderIntensity: 'subtle',

  uiDensity: 'comfortable',
  interfaceFont: 'system',
  iconStroke: 'regular',
  cornerRadius: 'subtle',
  editorMood: 'minimal',

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
  frostDepth: 40,

  backgroundEffect: 'solid',
  noiseAmount: 0,

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
  fileIcons: false,
  collapseFolderIcons: true,
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

  demoImageToggle: false,
};
