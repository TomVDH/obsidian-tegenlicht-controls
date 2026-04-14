export interface TegenlichtSettings {
  // Appearance
  darkFlavour: string;
  lightFlavour: string;
  accentColour: string;
  showExtendedDark: boolean;
  showExtendedLight: boolean;

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
}

export const DEFAULT_SETTINGS: TegenlichtSettings = {
  darkFlavour: 'ctp-mocha',
  lightFlavour: 'ctp-latte',
  accentColour: '#e5b32a',
  showExtendedDark: false,
  showExtendedLight: false,

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
};
